from sqlalchemy import Column, Integer, ForeignKey, Enum, Time, Boolean
from sqlalchemy.orm import relationship
from app.core.db import Base
import enum


class ConstraintType(str, enum.Enum):
    no_saturday = "no_saturday"
    no_friday = "no_friday"
    no_morning = "no_morning"
    no_after_17_25 = "no_after_17_25"
    only_monday = "only_monday"
    only_afternoon = "only_afternoon"
    fixed_slot = "fixed_slot"
    prefer_saturday = "prefer_saturday"
    prefer_monday = "prefer_monday"


class TeacherConstraint(Base):
    __tablename__ = "teacher_constraints"

    id = Column(Integer, primary_key=True, index=True)
    teacher_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    type = Column(Enum(ConstraintType), nullable=False)
    weekday = Column(Integer, nullable=True)
    time = Column(Time, nullable=True)
    value_bool = Column(Boolean, nullable=True)

    teacher = relationship("User")
