from litestar import Controller, delete, get, post
from litestar.exceptions import *
from litestar.di import Provide
from pydantic import BaseModel
from models import *
from util import *


class UserLoginModel(BaseModel):
    username: str
    password: str


class UserCreationModel(BaseModel):
    username: str
    password: str
    scopes: list[str]


class UnauthenticatedUsersController(Controller):
    path = "/users/auth"

    @post("/login")
    async def login(self, data: UserLoginModel, session: Session) -> RedactedUser:
        result = await User.find_one(User.username == data.username)
        if not result:
            raise NotFoundException(**build_error("auth.login.notFound"))

        if not result.verify(data.password):
            raise NotFoundException(**build_error("auth.login.notFound"))

        if not result.within_scope("app"):
            raise NotFoundException(**build_error("auth.login.notFound"))

        session.user_id = result.id
        await session.save()
        return result.redacted


class UsersSelfController(Controller):
    path = "/users/self"
    dependencies = {"user": Provide(depends_user)}
    guards = [guard_within_scope("app")]

    @get("/")
    async def get_self(self, user: User) -> RedactedUser:
        return user.redacted

    @post("/logout")
    async def logout(self, session: Session) -> None:
        session.user_id = None
        await session.save()


class UsersController(Controller):
    path = "/users"
    guards = [guard_within_scope("users")]
    dependencies = {"user": Provide(depends_user)}

    @get("/")
    async def list_users(self) -> list[RedactedUser]:
        return [i.redacted for i in await User.all().to_list()]

    @post("/create", guards=[guard_has_scope("users.manage.create")])
    async def create_user(
        self, data: UserCreationModel, context: GlobalContext, user: User
    ) -> RedactedUser:
        name_check = await User.find_one(User.username == data.username)
        if name_check:
            raise MethodNotAllowedException(
                **build_error("users.create.usernameExists")
            )

        new_user = User.create(data.username, data.password)
        new_user.scopes = data.scopes[:]
        await new_user.save()
        await context.post_event("users", user_ids=[user.id], data={"method": "add"})
        return new_user.redacted

    @post("/{user_id:str}/scopes", guards=[guard_has_scope("users.manage.edit")])
    async def edit_scopes(
        self, data: list[str], user_id: str, user: User, context: GlobalContext
    ) -> RedactedUser:
        result = await User.get(user_id)
        if not result:
            raise NotFoundException(**build_error("users.notFound"))

        if "root" in result.scopes:
            raise NotAuthorizedException(**build_error("users.immutable"))

        if not all([user.has_scope(i) for i in data]):
            raise NotAuthorizedException(**build_error("users.edit.scope.insufficient"))

        result.scopes = data[:]
        await result.save()
        await context.post_event(
            "users", user_ids=[user.id, result.id], data={"method": "edit"}
        )
        return result.redacted

    @delete("/{user_id:str}", guards=[guard_has_scope("users.manage.delete")])
    async def delete_user(
        self, user_id: str, user: User, context: GlobalContext
    ) -> None:
        result = await User.get(user_id)
        if not result:
            raise NotFoundException(**build_error("users.notFound"))

        if "root" in result.scopes:
            raise NotAuthorizedException(**build_error("users.immutable"))

        await result.delete()
        await context.post_event(
            "users", user_ids=[user.id, result.id], data={"method": "delete"}
        )
        await Session.find(Session.user_id == result.id).delete()
