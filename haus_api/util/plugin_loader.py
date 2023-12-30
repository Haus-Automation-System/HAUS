import subprocess
import sys
from typing import Optional
from haus_utils import Plugin, Config, PluginConfig
import os
from pydantic import BaseModel
import importlib.util


class WrappedPlugin(BaseModel):
    folder: str
    active: bool
    error: Optional[str] = None
    plugin: Optional[Plugin] = None
    model_config = {"arbitrary_types_allowed": True}


class PluginLoader:
    def __init__(self, config: Config) -> None:
        self.config = config
        self.plugins: dict[str, WrappedPlugin] = {}
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
                    self.plugins[f] = WrappedPlugin(
                        folder=f, active=False, error="plugin.manifest.missing"
                    )
                    continue
            except:
                self.plugins[f] = WrappedPlugin(
                    folder=f, active=False, error="plugin.manifest.invalid"
                )
                continue

            try:
                pypi_dep_strings = []

                for dep in conf.run.dependencies.values():
                    if dep.mode == "pypi":
                        pypi_dep_strings.append(
                            f"{dep.name}{('[' + ','.join(dep.extras) + ']') if dep.extras else ''}{('==' + dep.version if dep.version else '')}"
                        )

                subprocess.call(
                    [sys.executable, "-m", "pip", "install", *pypi_dep_strings],
                    stdout=subprocess.PIPE,
                    stderr=subprocess.PIPE,
                )
            except:
                self.plugins[f] = WrappedPlugin(
                    folder=f, active=False, error="plugin.dependencies"
                )
                continue

            try:
                spec = importlib.util.spec_from_file_location(
                    f"{conf.metadata.name}.{conf.run.module}",
                    os.path.join(
                        self.config.plugins.folder, f, conf.run.module, "__init__.py"
                    ),
                )
                pluginModule = importlib.util.module_from_spec(spec)
                sys.modules[f"{conf.metadata.name}.{conf.run.module}"] = pluginModule
                spec.loader.exec_module(pluginModule)
                pluginEntrypoint = getattr(pluginModule, conf.run.entrypoint)
            except:
                self.plugins[f] = WrappedPlugin(
                    folder=f, active=False, error="plugin.import"
                )
                continue

            try:
                settings = self.config.plugins.plugin_settings.get(conf.metadata.name)
                self.plugins[f] = WrappedPlugin(
                    folder=f,
                    active=True,
                    plugin=pluginEntrypoint(conf, settings=settings),
                )
            except:
                self.plugins[f] = WrappedPlugin(
                    folder=f, active=False, error="plugin.init"
                )
