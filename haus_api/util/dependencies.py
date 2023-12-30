from models.users import Session, User
from litestar.exceptions import *
from .errors import *


async def depends_user(session: Session) -> User:
    if session.user_id:
        result = await User.get(session.user_id)
        if result:
            return result

    raise NotAuthorizedException(**build_error("access.loginRequired"))
