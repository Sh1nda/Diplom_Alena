from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.db import get_db
from app.core.deps import require_admin
from app.models.lesson import Lesson, Weekday
from app.schemas.lesson import LessonOut, LessonUpdate

router = APIRouter(prefix="/lessons", tags=["lessons"])


@router.put("/{lesson_id}", response_model=LessonOut)
def update_lesson(
    lesson_id: int,
    data: LessonUpdate,
    db: Session = Depends(get_db),
    admin=Depends(require_admin),
):
    lesson = db.query(Lesson).filter(Lesson.id == lesson_id).first()
    if not lesson:
        raise HTTPException(404, "Lesson not found")

    lesson.subject_raw = data.subject_raw
    lesson.teacher_id = data.teacher_id
    lesson.room_id = data.room_id
    lesson.weekday = data.weekday
    lesson.start_time = data.start_time
    lesson.end_time = data.end_time

    db.commit()
    db.refresh(lesson)
    return lesson


@router.delete("/{lesson_id}")
def delete_lesson(
    lesson_id: int,
    db: Session = Depends(get_db),
    admin=Depends(require_admin),
):
    lesson = db.query(Lesson).filter(Lesson.id == lesson_id).first()
    if not lesson:
        raise HTTPException(404, "Lesson not found")

    db.delete(lesson)
    db.commit()
    return {"detail": "Lesson deleted"}
