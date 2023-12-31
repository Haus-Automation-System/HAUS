from typing import Union
from litestar.connection import ASGIConnection
from litestar.handlers.base import BaseRouteHandler
from litestar.exceptions import *
from models import Session, User
from .errors import build_error


def guard_has_scope(scope: Union[str, list[str]], all_required: bool = False):
    async def guard_scope_inner(
        connection: ASGIConnection, _: BaseRouteHandler
    ) -> None:
        session = await Session.get(connection.cookies.get("auth-token", "no-token"))
        if not session:
            raise NotAuthorizedException(**build_error("access.sessionRequired"))

        if not session.user_id:
            raise NotAuthorizedException(**build_error("access.loginRequired"))

        user = await User.get(session.user_id)
        if not user:
            raise NotAuthorizedException(**build_error("access.loginRequired"))

        if "root" in user.scopes:
            return

        if type(scope) == str:
            scopes = [scope]
        else:
            scopes = scope[:]

        if all_required:
            valid = all([user.has_scope(s) for s in scopes])
        else:
            valid = any([user.has_scope(s) for s in scopes])

        if not valid:
            raise NotAuthorizedException(**build_error("access.insufficientScope"))

    return guard_scope_inner


def guard_within_scope(scope: Union[str, list[str]], all_required: bool = False):
    async def guard_scope_inner(
        connection: ASGIConnection, _: BaseRouteHandler
    ) -> None:
        session = await Session.get(connection.cookies.get("auth-token", "no-token"))
        if not session:
            raise NotAuthorizedException(**build_error("access.sessionRequired"))

        if not session.user_id:
            raise NotAuthorizedException(**build_error("access.loginRequired"))

        user = await User.get(session.user_id)
        if not user:
            raise NotAuthorizedException(**build_error("access.loginRequired"))

        if "root" in user.scopes:
            return

        if type(scope) == str:
            scopes = [scope]
        else:
            scopes = scope[:]

        if all_required:
            valid = all([user.within_scope(s) for s in scopes])
        else:
            valid = any([user.within_scope(s) for s in scopes])

        if not valid:
            raise NotAuthorizedException(**build_error("access.insufficientScope"))

    return guard_scope_inner
