import json
import subprocess
import sys
from traceback import print_exc
from typing import Optional, Union
from models import BaseDocument
from haus_utils import Plugin, Config, PluginConfig, PluginMetadata
import os
from pydantic import BaseModel
import importlib.util
from logging import getLogger
from hashlib import sha256
from asyncio import Lock, Task, create_task


class RedactedMetaPlugin(BaseModel):
    id: str
    active: bool
    status: Optional[str] = None
    metadata: PluginMetadata


class MetaPlugin(BaseDocument):
    active: bool
    status: Optional[str] = None
    manifest: PluginConfig
    settings: dict[str, Union[str, int, float, bool]] = {}
    folder: str
    dependency_check: Union[str, None]

    class Settings:
        name = "plugins"

    @classmethod
    def create(
        self,
        active: bool,
        manifest: PluginConfig,
        folder: str,
        status: Optional[str] = None,
    ) -> "MetaPlugin":
        return MetaPlugin(
            id=manifest.metadata.name,
            active=active,
            status=status,
            manifest=manifest,
            settings={k: v.default for k, v in manifest.settings.items()},
            folder=folder,
            dependency_check=None
        )

    @property
    def redacted(self) -> RedactedMetaPlugin:
        return RedactedMetaPlugin(
            id=self.id,
            active=self.active,
            status=self.status,
            metadata=self.manifest.metadata,
        )


class PluginLoader:
    def __init__(self, config: Config, context) -> None:
        self.config = config
        self.plugins: dict[str, Plugin] = {}
        self.logger = getLogger("uvicorn.error")
        self.locks: dict[str, Lock] = {}
        self.listeners: dict[str, Task] = {}
        self.context = context

    async def lock(self, plugin: str) -> None:
        if not plugin in self.locks.keys():
            self.locks[plugin] = Lock()

        await self.locks[plugin].acquire()

    def unlock(self, plugin: str) -> None:
        if not plugin in self.locks.keys():
            self.locks[plugin] = Lock()

        if self.locks[plugin].locked():
            self.locks[plugin].release()

    async def load_plugin(
        self, conf: PluginConfig, folder: str
    ) -> tuple[MetaPlugin, Union[Plugin, None]]:
        await self.lock(conf.metadata.name)
        meta = await MetaPlugin.get(conf.metadata.name)
        if not meta:
            meta = MetaPlugin.create(True, conf, folder)
        invalid = []

        for k, v in meta.settings.items():
            if meta.manifest.settings[k].required:
                if meta.manifest.settings[k].type == "string" and len(v) == 0:
                    invalid.append(k)
                if meta.manifest.settings[k].type == "number" and (
                    v == "" or v == None
                ):
                    invalid.append(k)

        if len(invalid) > 0:
            meta.active = False
            meta.status = f"Required field(s) are empty: {', '.join(invalid)}"
            await meta.save()
            self.unlock(conf.metadata.name)
            return meta, None

        if meta.dependency_check != sha256(
                conf.run.model_dump_json().encode()).hexdigest():
            try:
                pypi_dep_strings = []

                for dep in conf.run.dependencies.values():
                    if dep.mode == "pypi":
                        pypi_dep_strings.append(
                            f"{dep.name}{('[' + ','.join(dep.extras) + ']') if dep.extras else ''}{
                                ('==' + dep.version if dep.version else '')}"
                        )

                subprocess.call(
                    [sys.executable, "-m", "pip", "install", *pypi_dep_strings],
                    stdout=subprocess.PIPE,
                    stderr=subprocess.PIPE,
                )
                meta.dependency_check = sha256(
                    conf.run.model_dump_json().encode()).hexdigest()
            except:
                self.logger.exception("Dependency error:")
                meta.active = False
                meta.status = "Failed to install plugin dependencies."
                await meta.save()
                self.unlock(conf.metadata.name)
                return meta, None

        else:
            self.logger.info("Skipping dependency install for " +
                             meta.manifest.metadata.name + ", deps are up-to-date.")

        try:
            spec = importlib.util.spec_from_file_location(
                f"{conf.metadata.name}.{conf.run.module}",
                os.path.join(
                    self.config.plugins.folder, folder, conf.run.module, "__init__.py"
                ),
            )
            pluginModule = importlib.util.module_from_spec(spec)
            sys.modules[f"{conf.metadata.name}.{conf.run.module}"] = pluginModule
            spec.loader.exec_module(pluginModule)
            pluginEntrypoint: type[Plugin] = getattr(pluginModule, conf.run.entrypoint)
        except:
            self.logger.exception("Import error:")
            meta.active = False
            meta.status = "Failed to import plugin entrypoint."
            await meta.save()
            self.unlock(conf.metadata.name)
            return meta, None

        try:
            plug = pluginEntrypoint(conf, settings=meta.settings)
            await plug.initialize()
            meta.status = None
            await meta.save()
            self.logger.info(
                f"Initialized plugin {meta.id} ({meta.manifest.metadata.display_name})"
            )
            self.unlock(conf.metadata.name)
            await self.setup_listener(plug)
            return meta, plug
        except:
            self.logger.exception("Initialization error:")
            meta.active = False
            meta.status = "Failed to initialize plugin."
            await meta.save()
            self.unlock(conf.metadata.name)
            return meta, None

    async def load_all(self):
        if not os.path.exists(self.config.plugins.folder):
            self.logger.warning(
                f"Plugins folder {self.config.plugins.folder} does not exist, skipping plugin loading."
            )
            return
        for plug in self.plugins.values():
            await plug.close()
            self.unlock(plug.config.metadata.name)
        self.plugins = {}

        for f in os.listdir(self.config.plugins.folder):
            try:
                if os.path.exists(
                    os.path.join(self.config.plugins.folder, f, "plugin.yaml")
                ):
                    with open(
                        os.path.join(self.config.plugins.folder, f, "plugin.yaml"), "r"
                    ) as plugin_yaml:
                        conf = PluginConfig.from_manifest(plugin_yaml)
                elif os.path.exists(
                    os.path.join(self.config.plugins.folder, f, "plugin.yml")
                ):
                    with open(
                        os.path.join(self.config.plugins.folder, f, "plugin.yml"), "r"
                    ) as plugin_yaml:
                        conf = PluginConfig.from_manifest(plugin_yaml)
                else:
                    self.logger.error(
                        f"Failed to load plugin from folder {f}, plugin manifest is missing."
                    )
                    continue
            except:
                self.logger.error(
                    f"Failed to load plugin from folder {f}, plugin manifest is invalid or malformed YAML."
                )
                continue

            meta, plugin = await self.load_plugin(conf, f)
            if meta.status and not plugin:
                self.logger.error(f"Failed to load plugin {meta.id}: {meta.status}")
                self.plugins[meta.id] = None
            else:
                self.plugins[meta.id] = plugin

    async def setup_listener(self, plugin: Plugin):
        if plugin.config.metadata.name in self.listeners.keys():
            self.listeners[plugin.config.metadata.name].cancel()
            del self.listeners[plugin.config.metadata.name]

        task = create_task(self.listen_to(plugin))
        self.listeners[plugin.config.metadata.name] = task

    async def listen_to(self, plugin: Plugin):
        async for event in plugin.listen_events():
            if event:
                await self.context.post_event("plugin.event", user_ids="*", data=event.model_dump())
