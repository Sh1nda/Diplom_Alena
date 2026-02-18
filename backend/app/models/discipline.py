from sqlalchemy import Column, Integer, String
from app.core.db import Base


class Discipline(Base):
    __tablename__ = "disciplines"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
