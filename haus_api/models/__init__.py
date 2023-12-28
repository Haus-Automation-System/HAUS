from .config import Config
from .base import BaseDocument, ExpirableDocument
from .users import Session, User

DOCUMENT_TYPES = [Session, User]
