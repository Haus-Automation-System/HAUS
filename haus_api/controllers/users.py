from litestar import Controller, get, post
from litestar.exceptions import *
from pydantic import BaseModel
from models import *
from util import *


class UserLoginModel(BaseModel):
    username: str
    password: str


class UnauthenticatedUsersController(Controller):
    path = "/users/auth"

    @post("/login")
    async def login(self, data: UserLoginModel, session: Session) -> RedactedUser:
        result = await User.find_one(User.username == data.username)
        if not result:
            raise NotFoundException(**build_error("auth.login.not_found"))

        if not result.verify(data.password):
            raise NotFoundException(**build_error("auth.login.not_found"))

        session.user_id = result.id
        await session.save()
        return result.redacted


class UsersController(Controller):
    path = "/users"
