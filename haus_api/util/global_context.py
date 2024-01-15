from models import *
from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
from .plugin_loader import PluginLoader, MetaPlugin
from litestar.channels import ChannelsPlugin
from .events import *


class GlobalContext:
    def __init__(self, channels: ChannelsPlugin):
        self.config = Config.from_config("config.yaml")
        self.motor = AsyncIOMotorClient(self.config.server.database.uri)
        self.plugins = PluginLoader(self.config, self)
        self.channels = channels
        self.scopes = APPLICATION_SCOPES.model_copy(deep=True)

    async def initialize(self):
        await init_beanie(
            database=self.motor.get_database(name=self.config.server.database.database),
            document_models=[*DOCUMENT_TYPES, MetaPlugin],
        )

        # Create default user if specified
        conf = self.config.server.security.users.default
        existing_default = await User.find_one(User.username == conf.username)
        if not existing_default and conf.create_if_not_present:
            new_root = User.create(conf.username, conf.password)
            new_root.scopes.append("root")
            await new_root.save()

        # Load & initialize plugins
        await self.plugins.load_all()

    async def post_event(
        self, code: str, user_ids: Union[list[str], Literal["*"]] = "*", data: dict = {}
    ):
        if user_ids == "*":
            sessions = await Session.find(Session.user_id != None).to_list()
        else:
            sessions = await Session.find({"user_id": {"$in": user_ids}}).to_list()

        event = Event(code=code, data=data)
        self.channels.publish(event.model_dump(), [i.id for i in sessions])
