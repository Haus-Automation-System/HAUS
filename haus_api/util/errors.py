from typing import Optional


def build_error(code: str, description: Optional[str] = None) -> dict:
    return {"extra": {"error_code": f"errors.server.{code}"}, "detail": description}
