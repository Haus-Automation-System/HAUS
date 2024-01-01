from litestar import Controller, get, post
from litestar.exceptions import *
from litestar.di import Provide
from util import *
from models import *


class PluginsController(Controller):
    path = "/plugins"
    guards = [guard_within_scope("app.plugins")]
    dependencies = {"user": Provide(depends_user)}

    @get("/")
    async def get_plugin_info(
        self, context: GlobalContext, user: User
    ) -> list[RedactedMetaPlugin]:
        return [
            i.redacted
            for i in await MetaPlugin.all().to_list()
            if i.id in context.plugins.plugins.keys()
            and user.has_scope(f"app.plugins.{i.id}")
        ]

    @get("/detailed", guards=[guard_has_scope("plugins.view")])
    async def get_plugin_detailed_info(
        self, context: GlobalContext, user: User
    ) -> list[MetaPlugin]:
        return [
            i
            for i in await MetaPlugin.all().to_list()
            if i.id in context.plugins.plugins.keys()
            and user.has_scope(f"app.plugins.{i.id}")
        ]

    @get("/{name:str}")
    async def get_plugin(self, name: str, user: User) -> RedactedMetaPlugin:
        if not user.has_scope(f"app.plugins.{name}"):
            raise NotFoundException(**build_error("plugin.notFound"))
        result = await MetaPlugin.get(name)
        if not result:
            raise NotFoundException(**build_error("plugin.notFound"))

        return result.redacted

    @get("/{name:str}/detailed", guards=[guard_has_scope("plugins.view")])
    async def get_plugin_detailed(self, name: str, user: User) -> MetaPlugin:
        if not user.has_scope(f"app.plugins.{name}"):
            raise NotFoundException(**build_error("plugin.notFound"))
        result = await MetaPlugin.get(name)
        if not result:
            raise NotFoundException(**build_error("plugin.notFound"))

        return result

    @post("/{name:str}/settings", guards=[guard_has_scope("plugins.manage.settings")])
    async def update_plugin_settings(
        self, name: str, context: GlobalContext, data: dict[str, Any]
    ) -> MetaPlugin:
        plugin = await MetaPlugin.get(name)
        if not plugin:
            raise NotFoundException(**build_error("plugin.notFound"))

        plugin.settings = data
        await plugin.save()
        meta, _ = await context.plugins.load_plugin(plugin.manifest, plugin.folder)
        await context.post_event(
            "plugins", data={"target": meta.id, "method": "settings"}
        )
        return meta

    @post("/{name:str}/active", guards=[guard_has_scope("plugins.manage.active")])
    async def update_plugin_active(
        self, name: str, context: GlobalContext, data: dict[Literal["active"], bool]
    ) -> MetaPlugin:
        plugin = await MetaPlugin.get(name)
        if not plugin:
            raise NotFoundException(**build_error("plugin.notFound"))

        plugin.active = data["active"]
        await plugin.save()
        await context.post_event("plugins", data={"target": name, "method": "active"})
        return plugin
