from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.db import get_db
from app.models.lesson import Lesson
from app.schemas.lesson import LessonOut
from app.core.deps import require_admin, require_teacher

router = APIRouter(prefix="/schedule", tags=["schedule"])


@router.get("/teacher", response_model=list[LessonOut])
def teacher_schedule(
    db: Session = Depends(get_db),
    teacher=Depends(require_teacher),
):
    return (
        db.query(Lesson)
        .filter(Lesson.teacher_id == teacher.id)
        .order_by(Lesson.weekday, Lesson.start_time)
        .all()
    )


@router.get("/group/{group_id}", response_model=list[LessonOut])
def group_schedule(group_id: int, db: Session = Depends(get_db)):
    return (
        db.query(Lesson)
        .filter(Lesson.group_id == group_id)
        .order_by(Lesson.weekday, Lesson.start_time)
        .all()
    )


@router.get("/all", response_model=list[LessonOut])
def all_schedule(
    db: Session = Depends(get_db),
    admin=Depends(require_admin),
):
    return (
        db.query(Lesson)
        .order_by(Lesson.weekday, Lesson.start_time)
        .all()
    )
