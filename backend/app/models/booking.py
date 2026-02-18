from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Enum, Text
from sqlalchemy.orm import relationship
from app.core.db import Base
import enum


class BookingStatus(str, enum.Enum):
    pending = "pending"
    approved = "approved"
    rejected = "rejected"


class BookingRequest(Base):
    __tablename__ = "booking_requests"

    id = Column(Integer, primary_key=True, index=True)
    teacher_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    room_id = Column(Integer, ForeignKey("rooms.id"), nullable=False)
    group_id = Column(Integer, ForeignKey("groups.id"), nullable=True)
    discipline_id = Column(Integer, ForeignKey("disciplines.id"), nullable=True)

    subject = Column(String, nullable=False)
    start_datetime = Column(DateTime, nullable=False)
    end_datetime = Column(DateTime, nullable=False)
    status = Column(Enum(BookingStatus), default=BookingStatus.pending, nullable=False)
    admin_comment = Column(Text, nullable=True)

    teacher = relationship("User")
    room = relationship("Room")
    group = relationship("Group")
    discipline = relationship("Discipline")
