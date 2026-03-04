from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from datetime import date, timedelta
import re

from app.core.db import get_db
from app.models.lesson import Lesson, Weekday

router = APIRouter(prefix="/schedule", tags=["schedule"])


WEEKDAY_TO_OFFSET = {
    Weekday.monday: 0,
    Weekday.tuesday: 1,
    Weekday.wednesday: 2,
    Weekday.thursday: 3,
    Weekday.friday: 4,
    Weekday.saturday: 5,
}


# ================================
#  УДАЛЯЕМ ТОЛЬКО ГРУППУ И ПРЕПОДАВАТЕЛЕЙ
# ================================
def clean_subject(subject_raw: str):
    text = subject_raw.strip()

    # 1. Удаляем группу (первое слово вида 23ВВИ1, 23ИС1, 22ПМИ2 и т.п.)
    text = re.sub(r"^[0-9]{2}[А-Яа-яA-Za-z]+[0-9]?\s+", "", text)

    # 2. Удаляем преподавателей "Фамилия И.О." (в конце строки или в середине)
    text = re.sub(r"[А-ЯЁ][а-яё]+(?:\s[А-ЯЁ]\.[А-ЯЁ]\.)", "", text)

    # 3. Удаляем лишние запятые после удаления преподавателей
    text = re.sub(r",\s*,*", "", text)

    # 4. Убираем двойные пробелы
    text = re.sub(r"\s{2,}", " ", text).strip()

    return text


# ================================
#  ОСНОВНОЙ РОУТ
# ================================
@router.get("/week")
def get_week_schedule(
    start: date = Query(...),
    group_id: int | None = Query(None),
    db: Session = Depends(get_db),
):
    query = db.query(Lesson)

    if group_id is not None:
        query = query.filter(Lesson.group_id == group_id)

    lessons = query.all()
    events = []

    for l in lessons:
        offset = WEEKDAY_TO_OFFSET[l.weekday]
        lesson_date = start + timedelta(days=offset)

        cleaned = clean_subject(l.subject_raw)

        events.append(
            {
                "id": l.id,
                "group_id": l.group_id,
                "group_name": l.group.name,

                # предмет — очищенный только от группы и преподавателей
                "title": cleaned,

                # аудитория — как есть
                "room_id": l.room_id,
                "room_name": l.room.name if l.room else None,

                # преподаватель
                "teacher_id": l.teacher_id,
                "teacher_name": l.teacher.full_name if l.teacher else None,

                "discipline_id": l.discipline_id,
                "weekday": l.weekday.value,

                "date": lesson_date.isoformat(),
                "start_time": l.start_time.strftime("%H:%M"),
                "end_time": l.end_time.strftime("%H:%M"),
            }
        )

    return events
