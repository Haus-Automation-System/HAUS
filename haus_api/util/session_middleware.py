from models import Session
from litestar.middleware import AbstractMiddleware
from litestar.enums import ScopeType
from litestar.datastructures import MutableScopeHeaders
from litestar.enums import ScopeType
from litestar.middleware import AbstractMiddleware
from litestar.types import Message, Receive, Scope, Send
from .cookies import Cookie, Cookies


class SessionMiddleware(AbstractMiddleware):
    scopes = {ScopeType.HTTP, ScopeType.WEBSOCKET}

    async def __call__(
        self,
        scope: Scope,
        receive: Receive,
        send: Send,
    ) -> None:
        headers = MutableScopeHeaders(scope=scope)
        current_cookies = {}
        cookie_header = headers.get("cookie")
        if cookie_header:
            for cookie in cookie_header.split(";"):
                stripped = cookie.strip()
                current_cookies[stripped.split("=")[0]] = stripped.split("=")[1]
        auth_cookie = current_cookies.get("auth-token")
        if not auth_cookie:
            new_session = Session.create(
                scope["app"].state.context.config.server.security.sessions.expiration
            )
            await new_session.save()
            current_cookies["auth-token"] = new_session.id
            headers["cookie"] = "; ".join(
                [f"{k}={v}" for k, v in current_cookies.items()]
            )
            cookie_id = new_session.id
        else:
            active_session = await Session.get(auth_cookie)
            if active_session:
                cookie_id = auth_cookie
                await active_session.renew(
                    scope[
                        "app"
                    ].state.context.config.server.security.sessions.expiration
                )
            else:
                new_session = Session.create(
                    scope[
                        "app"
                    ].state.context.config.server.security.sessions.expiration
                )
                await new_session.save()
                current_cookies["auth-token"] = new_session.id
                headers["cookie"] = "; ".join(
                    [f"{k}={v}" for k, v in current_cookies.items()]
                )
                cookie_id = new_session.id

        def send_wrapper_setup(token: str):
            async def send_wrapper(message: "Message") -> None:
                if message["type"] == "http.response.start":
                    headers = MutableScopeHeaders.from_message(message=message)
                    response_cookies = Cookies()
                    response_cookies.add(Cookie("auth-token", token))
                    headers["set-cookie"] = "; ".join(
                        response_cookies.render_response()
                    )
                await send(message)

            return send_wrapper

        await self.app(scope, receive, send_wrapper_setup(cookie_id))
