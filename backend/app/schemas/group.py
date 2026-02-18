from pydantic import BaseModel

class GroupBase(BaseModel):
    code: str
    name: str | None = None
    course: int | None = None

class GroupCreate(GroupBase):
    pass

class GroupOut(GroupBase):
    id: int

    model_config = {
        "from_attributes": True
    }
