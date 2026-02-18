from pydantic import BaseModel

class RoomBase(BaseModel):
    name: str
    capacity: int | None = None
    has_projector: bool = False
    has_computers: bool = False

class RoomCreate(RoomBase):
    pass

class RoomOut(RoomBase):
    id: int

    model_config = {
        "from_attributes": True
    }
