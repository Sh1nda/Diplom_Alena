from sqlalchemy import Column, Integer, String
from app.core.db import Base


class Group(Base):
    __tablename__ = "groups"

    id = Column(Integer, primary_key=True, index=True)
    code = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=True)
    course = Column(Integer, nullable=True)
