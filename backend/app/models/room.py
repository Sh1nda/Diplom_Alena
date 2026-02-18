from sqlalchemy import Column, Integer, String, Boolean
from app.core.db import Base


class Room(Base):
    __tablename__ = "rooms"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False)
    capacity = Column(Integer, nullable=True)
    has_projector = Column(Boolean, default=False, nullable=False)
    has_computers = Column(Boolean, default=False, nullable=False)
