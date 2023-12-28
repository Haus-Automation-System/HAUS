from models import Config
from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie


class GlobalContext:
    def __init__(self):
        self.config = Config.from_config("config.yaml")
        self.motor = AsyncIOMotorClient(self.config.server.database.uri)

    async def initialize(self):
        await init_beanie(
            database=self.motor.get_database(name=self.config.server.database.database),
            document_models=[],
        )
