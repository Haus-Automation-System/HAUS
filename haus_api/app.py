from time import ctime
from typing import Any
from litestar import Litestar, get, Request
from litestar.datastructures import State
from litestar.di import Provide
from util import *


@get("/")
async def root(request: Request) -> Any:
    return {"time": ctime(), "source": request.client.host}


async def depends_context(state: State) -> GlobalContext:
    return state.context


async def startup_tasks(app: Litestar) -> None:
    app.state.context = GlobalContext()
    await app.state.context.initialize()


app = Litestar(
    route_handlers=[root],
    state=State({"context": None}),
    on_startup=[startup_tasks],
    dependencies={"context": Provide(depends_context)},
)
