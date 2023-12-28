from typing import Optional
from .base import ExpirableDocument


class Session(ExpirableDocument):
    user_id: Optional[str]

    @classmethod
    def create(cls, expire: float) -> "Session":
        return Session(user_id=None, expire_at=cls.expire_time(expire))

    class Settings:
        name = "sessions"
