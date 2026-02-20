from sqlalchemy import Column, Integer, String, Time, Enum, ForeignKey
from sqlalchemy.orm import relationship
from app.core.db import Base
import enum


class Weekday(str, enum.Enum):
    monday = "monday"
    tuesday = "tuesday"
    wednesday = "wednesday"
    thursday = "thursday"
    friday = "friday"
    saturday = "saturday"


class Lesson(Base):
    __tablename__ = "lessons"

    id = Column(Integer, primary_key=True, index=True)
    group_id = Column(Integer, ForeignKey("groups.id"), nullable=False)
    teacher_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    room_id = Column(Integer, ForeignKey("rooms.id"), nullable=False)
    discipline_id = Column(Integer, ForeignKey("disciplines.id"), nullable=True)

    subject_raw = Column(String, nullable=False)

    weekday = Column(Enum(Weekday, name="weekday_enum"), nullable=False)

    start_time = Column(Time, nullable=False)
    end_time = Column(Time, nullable=False)

    group = relationship("Group")
    teacher = relationship("User")
    room = relationship("Room")
    discipline = relationship("Discipline")
