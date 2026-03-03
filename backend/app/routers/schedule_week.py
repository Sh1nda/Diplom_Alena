from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from datetime import date, timedelta
import re

from app.core.db import get_db
from app.models.lesson import Lesson, Weekday

router = APIRouter(prefix="/schedule", tags=["schedule"])


# соответствие enum → смещение от понедельника
WEEKDAY_TO_OFFSET = {
    Weekday.monday: 0,
    Weekday.tuesday: 1,
    Weekday.wednesday: 2,
    Weekday.thursday: 3,
    Weekday.friday: 4,
    Weekday.saturday: 5,
}


def normalize_subject(subject_raw: str):
    """
    Превращает строку из Excel в:
    - subject_clean: нормальное название дисциплины
    - room: аудитория (если есть)
    """

    # 1. Убираем группу (первые 1–2 слова)
    parts = subject_raw.split(" ", 1)
    if len(parts) == 2:
        subject_raw = parts[1]

    # 2. Убираем тип занятия (лб, лек, пр, сем)
    subject_raw = re.sub(r"\b(лб|лек|пр|сем)\.? ", "", subject_raw)

    # 3. Аудитория — последнее слово вида 7а-317, 406, 9-509
    room_match = re.search(r"(\d+[а-яА-Я\-]*)$", subject_raw)
    room = room_match.group(1) if room_match else ""

    # 4. Убираем преподавателей "Фамилия И.О."
    subject_clean = re.sub(r"[А-ЯЁ][а-яё]+\s[А-ЯЁ]\.[А-ЯЁ]\.", "", subject_raw)
    subject_clean = re.sub(r"\s{2,}", " ", subject_clean).strip()

    # 5. Убираем аудиторию из названия
    if room:
        subject_clean = subject_clean.replace(room, "").strip()

    return subject_clean, room


@router.get("/week")
def get_week_schedule(
    start: date = Query(..., description="Дата понедельника недели"),
    group_id: int | None = Query(None, description="Фильтр по группе"),
    db: Session = Depends(get_db),
):
    """
    Возвращает недельное расписание:
    - start — дата понедельника (YYYY-MM-DD)
    - group_id — если передан, фильтруем только эту группу

    На выходе — список событий с:
    - нормализованным названием предмета
    - аудиторией
    - ФИО преподавателя
    - корректной датой (рассчитанной по weekday)
    """

    query = db.query(Lesson)

    if group_id is not None:
        query = query.filter(Lesson.group_id == group_id)

    lessons = query.all()

    events: list[dict] = []

    for l in lessons:
        # смещение от понедельника по enum Weekday
        offset = WEEKDAY_TO_OFFSET[l.weekday]
        lesson_date = start + timedelta(days=offset)

        subject, room = normalize_subject(l.subject_raw)

        events.append(
            {
                "id": l.id,
                "group_id": l.group_id,
                "group_name": l.group.name,

                # предмет + аудитория
                "title": subject,
                "room_name": room,

                # преподаватель
                "teacher_id": l.teacher_id,
                "teacher_name": l.teacher.full_name if l.teacher else None,

                # дата и время
                "date": lesson_date.isoformat(),
                "start_time": l.start_time.strftime("%H:%M"),
                "end_time": l.end_time.strftime("%H:%M"),
            }
        )

    return events
