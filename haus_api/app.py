from time import ctime
from typing import Any
from litestar import Litestar, get


@get("/")
async def root() -> Any:
    return {"time": ctime()}


app = Litestar(route_handlers=[root])
