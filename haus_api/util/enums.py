from enum import Enum


class AccessLevel(Enum):
    INTERNAL = 0
    PRIVILEGED = 1
    EXTERNAL = 2
    FORBIDDEN = 3
