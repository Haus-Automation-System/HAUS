from litestar import Controller, get, post
from litestar.exceptions import *
from litestar.di import Provide
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
            raise NotFoundException(**build_error("auth.login.notFound"))

        if not result.verify(data.password):
            raise NotFoundException(**build_error("auth.login.notFound"))

        if not result.has_scope("app"):
            raise NotFoundException(**build_error("auth.login.notFound"))

        session.user_id = result.id
        await session.save()
        return result.redacted


class UsersSelfController(Controller):
    path = "/users/self"
    dependencies = {"user": Provide(depends_user)}
    guards = [guard_scope("app")]

    @get("/")
    async def get_self(self, user: User) -> RedactedUser:
        return user.redacted

    @post("/logout")
    async def logout(self, session: Session) -> None:
        session.user_id = None
        await session.save()


class UsersController(Controller):
    path = "/users"
    guards = [guard_scope("app.admin.users")]
