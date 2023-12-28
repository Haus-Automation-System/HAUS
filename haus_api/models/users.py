from typing import Optional
from .base import BaseDocument, ExpirableDocument
from hashlib import pbkdf2_hmac
from os import urandom


class Session(ExpirableDocument):
    user_id: Optional[str]

    @classmethod
    def create(cls, expire: float) -> "Session":
        return Session(user_id=None, expire_at=cls.expire_time(expire))

    class Settings:
        name = "sessions"


class User(BaseDocument):
    username: str
    display_name: Optional[str] = None
    password_hash: str
    password_salt: str
    user_icon: Optional[str] = None

    class Settings:
        name = "users"

    @classmethod
    def create(cls, username: str, password: str) -> "User":
        salt = urandom(32)
        key = pbkdf2_hmac("sha256", password.encode(), salt, 500000)
        return User(
            username=username, password_hash=key.hex(), password_salt=salt.hex()
        )

    def verify(self, password: str) -> bool:
        salt = bytes.fromhex(self.password_salt)
        key = pbkdf2_hmac("sha256", password.encode(), salt, 500000).hex()
        return key == self.password_hash
