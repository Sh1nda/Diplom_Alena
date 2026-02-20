import io
import re
from typing import Optional
from sqlalchemy.orm import Session
from openpyxl import load_workbook
from datetime import time
from app.models import Lesson, Teacher, Group, Room
from app.schemas import Weekday
from app.models.lesson import Lesson
from app.models.group import Group
from app.models.room import Room
from app.models.user import User


# Фиксированный список временных слотов (начиная с 8:00)
TIME_SLOTS = [
    (time(8, 0), time(9, 35)),
    (time(9, 50), time(11, 25)),
    (time(11, 40), time(13, 15)),
    (time(13, 45), time(15, 20)),
    (time(15, 35), time(17, 10)),
    (time(17, 25), time(19, 0)),
    (time(19, 15), time(20, 50)),
]

# Регулярные выражения для парсинга строки занятия
GROUP_PATTERN = re.compile(r'\b\d{2}[А-ЯA-Z]{3,}\d*\b')
TYPE_PATTERN = re.compile(r'\b(лб\.|лек\.|пр\.)\b', re.IGNORECASE)
ROOM_PATTERN = re.compile(r'\b[А-Яа-яA-Za-z0-9\-]{2,}\b$')

def parse_lesson_line(line: str) -> Optional[dict]:
    """
    Извлекает данные из строки занятия.
    Возвращает словарь с полями или None, если не удалось распарсить.
    """
    group_match = GROUP_PATTERN.search(line)
    if not group_match:
        return None
    group_id = group_match.group()

    type_match = TYPE_PATTERN.search(line)
    if not type_match:
        return None
    lesson_type = type_match.group()

    type_index = line.find(lesson_type)
    subject_part = line[group_match.end():type_index].strip()
    subject = subject_part

    after_type = line[type_index + len(lesson_type):].strip()
    if not after_type:
        return None

    room_match = ROOM_PATTERN.search(after_type)
    if not room_match:
        return None
    room_id = room_match.group()

    teachers_part = after_type[:room_match.start()].strip().rstrip(',')
    teachers = [t.strip().rstrip(',') for t in teachers_part.split(',') if t.strip()]
    if not teachers:
        return None
    teacher_name = teachers[0]

    return {
        'group_id': group_id,
        'subject': subject,
        'type': lesson_type,
        'teachers': teachers,
        'teacher_name': teacher_name,
        'room_id': room_id,
        'subject_raw': line
    }

def get_or_create_teacher(db: Session, full_name: str):
    teacher = db.query(Teacher).filter(Teacher.full_name == full_name).first()
    if not teacher:
        teacher = Teacher(full_name=full_name)
        db.add(teacher)
        db.commit()
        db.refresh(teacher)
    return teacher

def get_or_create_group(db: Session, group_code: str):
    group = db.query(Group).filter(Group.code == group_code).first()
    if not group:
        group = Group(code=group_code)
        db.add(group)
        db.commit()
        db.refresh(group)
    return group

def get_or_create_room(db: Session, room_code: str):
    room = db.query(Room).filter(Room.code == room_code).first()
    if not room:
        room = Room(code=room_code)
        db.add(room)
        db.commit()
        db.refresh(room)
    return room

def import_schedule_from_xlsx(db: Session, content: bytes):
    wb = load_workbook(filename=io.BytesIO(content), data_only=True)
    ws = wb.active

    current_teacher = None
    slot_index = 0

    for row in ws.iter_rows(values_only=True):
        if not row:
            continue
        first_cell = str(row[0]).strip() if row[0] is not None else ''
        if first_cell.isdigit():
            current_teacher = None
            slot_index = 0
            continue
        elif current_teacher is None and first_cell:
            current_teacher = first_cell
            continue
        elif current_teacher and any(cell for cell in row):
            for cell in row:
                if not cell or not isinstance(cell, str):
                    continue
                lesson_data = parse_lesson_line(cell)
                if not lesson_data:
                    continue
                if slot_index >= len(TIME_SLOTS):
                    continue
                group = get_or_create_group(db, lesson_data['group_id'])
                teacher = get_or_create_teacher(db, lesson_data['teacher_name'])
                room = get_or_create_room(db, lesson_data['room_id'])
                start_time, end_time = TIME_SLOTS[slot_index]
                lesson = Lesson(
                    group_id=group.id,
                    teacher_id=teacher.id,
                    room_id=room.id,
                    subject_raw=lesson_data['subject_raw'],
                    weekday=Weekday.monday,
                    start_time=start_time,
                    end_time=end_time
                )
                db.add(lesson)
                slot_index += 1
    db.commit()
