from pydantic import BaseModel, EmailStr
from enum import Enum

class UserRole(str, Enum):
    admin = "admin"
    teacher = "teacher"

class UserBase(BaseModel):
    full_name: str
    email: EmailStr
    role: UserRole

class UserCreate(UserBase):
    password: str

class UserOut(UserBase):
    id: int

    model_config = {
        "from_attributes": True
    }
