from collections.abc import AsyncGenerator
from ctypes import Union
from datetime import datetime
from time import ctime
import traceback
from typing import Any, Literal
from litestar import Litestar, MediaType, Response, get, Request
from litestar.datastructures import State
from litestar.di import Provide
from litestar.exceptions import NotAuthorizedException
from util import *
from models import *


@get("/")
async def root(request: Request, session: Session, access: AccessLevel) -> Any:
    return {
        "time": ctime(),
        "source": normalize_address(request.client.host),
        "session": session.model_dump(),
        "access": access,
    }


async def depends_context(state: State) -> GlobalContext:
    return state.context


async def depends_session(request: Request) -> Session:
    return await Session.get(request.cookies.get("auth-token", "no-token"))


async def depends_network_security(context: GlobalContext, request: Request) -> int:
    access = calculate_access_level(
        request.client.host, context.config.server.security.access_levels
    )

    if access == AccessLevel.FORBIDDEN:
        raise NotAuthorizedException(
            detail="Attempted to access from forbidden source address"
        )

    return access.value


async def startup_tasks(app: Litestar) -> None:
    app.state.context = GlobalContext()
    await app.state.context.initialize()


def internal_server_error_handler(request: Request, exc: Exception) -> Response:
    traceback.print_exc()
    return Response(
        media_type=MediaType.TEXT,
        content=f"server error: {exc}",
        status_code=500,
    )


app = Litestar(
    route_handlers=[root],
    state=State({"context": None}),
    on_startup=[startup_tasks],
    dependencies={
        "context": Provide(depends_context),
        "session": Provide(depends_session),
        "access": Provide(depends_network_security),
    },
    middleware=[SessionMiddleware],
    exception_handlers={500: internal_server_error_handler},
)
