from models import *
from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
from .plugin_loader import PluginLoader


class GlobalContext:
    def __init__(self):
        self.config = Config.from_config("config.yaml")
        self.motor = AsyncIOMotorClient(self.config.server.database.uri)
        self.plugins = PluginLoader(self.config)

    async def initialize(self):
        await init_beanie(
            database=self.motor.get_database(name=self.config.server.database.database),
            document_models=DOCUMENT_TYPES,
        )

        # Create default user if specified
        conf = self.config.server.security.users.default
        existing_default = await User.find_one(User.username == conf.username)
        if not existing_default and conf.create_if_not_present:
            new_root = User.create(conf.username, conf.password)
            new_root.scopes.append("root")
            await new_root.save()
