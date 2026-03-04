from pydantic import BaseModel
from typing import Optional
from enum import Enum

class UserRole(str, Enum):
    admin = "admin"
    teacher = "teacher"

class UserBase(BaseModel):
    full_name: str
    email: Optional[str] = None   
    role: UserRole

class UserCreate(UserBase):
    password: Optional[str] = None

class UserOut(UserBase):
    id: int

    model_config = {
        "from_attributes": True
    }
