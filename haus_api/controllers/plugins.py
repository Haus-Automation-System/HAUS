from litestar import Controller, get, post
from litestar.exceptions import *
from litestar.di import Provide
from util import *
from models import *


class PluginsController(Controller):
    path = "/plugins"
    guards = [guard_scope("app")]
    dependencies = {"user": Provide(depends_user)}

    @get("/")
    async def get_plugin_info(self, context: GlobalContext) -> list[SerializedPlugin]:
        return [i.serialized for i in context.plugins.plugins.values()]
