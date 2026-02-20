from sqlalchemy import Column, Integer, String, Enum
from app.core.db import Base
import enum


class UserRole(str, enum.Enum):
    admin = "admin"
    teacher = "teacher"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String, nullable=False)

    # теперь email может быть NULL
    email = Column(String, unique=True, index=True, nullable=True)

    # пароль тоже может быть NULL (преподаватели не логинятся)
    password_hash = Column(String, nullable=True)

    role = Column(Enum(UserRole), nullable=False)
