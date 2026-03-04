from pydantic import BaseModel

class TeacherOut(BaseModel):
    id: int
    full_name: str

    class Config:
        orm_mode = True
