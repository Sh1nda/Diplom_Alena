from pydantic import BaseModel

class DisciplineBase(BaseModel):
    name: str

class DisciplineCreate(DisciplineBase):
    pass

class DisciplineOut(DisciplineBase):
    id: int

    model_config = {
        "from_attributes": True
    }
