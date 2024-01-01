from typing import Any, Literal, Union
from pydantic import BaseModel, Field
from secrets import token_urlsafe


class Event(BaseModel):
    id: str = Field(default_factory=lambda: token_urlsafe(32))
    code: str
    data: dict[str, Any] = Field(default_factory=dict)
