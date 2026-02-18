from datetime import time
from typing import Dict, Tuple

from openpyxl import load_workbook
from sqlalchemy.orm import Session

from app.models.lesson import Lesson, Weekday
from app.models.room import Room
from app.models.group import Group
from app.models.user import User, UserRole


def parse_time_range(label: str) -> Tuple[time, time]:
    # пример: "8.00 9.35" или "13.45 15.20"
    parts = label.replace(" ", "").split()
    if len(parts) == 1:
        parts = label.split()
    start_str, end_str = parts[0], parts[1]
    def to_time(s: str) -> time:
        s = s.replace(".", ":")
        h, m = s.split(":")
        return time(hour=int(h), minute=int(m))
    return to_time(start_str), to_time(end_str)


def detect_weekday(col_idx: int, day_columns: Dict[int, Weekday]) -> Weekday:
    # day_columns: {col_index: Weekday}
    return day_columns.get(col_idx)


def get_or_create_room(db: Session, name: str) -> Room:
    room = db.query(Room).filter(Room.name == name).first()
    if room:
        return room
    room = Room(name=name)
    db.add(room)
    db.commit()
    db.refresh(room)
    return room


def get_or_create_group(db: Session, code: str) -> Group:
    grp = db.query(Group).filter(Group.code == code).first()
    if grp:
        return grp
    grp = Group(code=code)
    db.add(grp)
    db.commit()
    db.refresh(grp)
    return grp


def get_or_create_teacher(db: Session, full_name: str) -> User:
    user = db.query(User).filter(User.full_name == full_name).first()
    if user:
        return user
    # email можно сгенерировать технический
    email = full_name.replace(" ", ".").replace(".", "").lower() + "@example.com"
    user = User(
        full_name=full_name,
        email=email,
        password_hash="",  # потом можно задать вручную
        role=UserRole.teacher,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def import_schedule_from_xlsx(db: Session, content: bytes):
    wb = load_workbook(filename=None, data=content)
    ws = wb.active  # предполагаем, что нужный лист — первый

    # 1) Разбираем шапку: где дни, где интервалы
    # У тебя в примере: сверху идут времена, а дни — по блокам столбцов.
    # Для простоты: считаем, что:
    # - первая строка: заголовок "понедельник", "вторник", ...
    # - вторая строка: интервалы времени.
    day_columns: Dict[int, Weekday] = {}
    time_ranges: Dict[int, Tuple[time, time]] = {}

    for col in range(1, ws.max_column + 1):
        day_cell = ws.cell(row=1, column=col).value
        time_cell = ws.cell(row=2, column=col).value
        if isinstance(day_cell, str):
            day_cell_lower = day_cell.strip().lower()
            if "понедельник" in day_cell_lower:
                day_columns[col] = Weekday.monday
            elif "вторник" in day_cell_lower:
                day_columns[col] = Weekday.tuesday
            elif "среда" in day_cell_lower:
                day_columns[col] = Weekday.wednesday
            elif "четверг" in day_cell_lower:
                day_columns[col] = Weekday.thursday
            elif "пятница" in day_cell_lower:
                day_columns[col] = Weekday.friday
            elif "суббота" in day_cell_lower:
                day_columns[col] = Weekday.saturday

        if isinstance(time_cell, str):
            try:
                start_t, end_t = parse_time_range(time_cell)
                time_ranges[col] = (start_t, end_t)
            except Exception:
                continue

    # 2) По строкам: преподаватель + ячейки с занятиями
    # Предположим, что ФИО преподавателя в первом столбце (col=1), начиная с row=3
    for row in range(3, ws.max_row + 1):
        teacher_name = ws.cell(row=row, column=1).value
        if not teacher_name:
            continue
        teacher_name = str(teacher_name).strip()
        teacher = get_or_create_teacher(db, teacher_name)

        for col in range(2, ws.max_column + 1):
            cell_value = ws.cell(row=row, column=col).value
            if not cell_value:
                continue
            weekday = detect_weekday(col, day_columns)
            if not weekday:
                continue
            if col not in time_ranges:
                continue
            start_t, end_t = time_ranges[col]

            text = str(cell_value).strip()
            # Простейший парсер: ищем группу (шаблон вида 23ВВИ2 — цифры+буквы)
            parts = text.split()
            group_code = None
            room_name = None

            # группа — первый токен, начинающийся с цифр
            for p in parts:
                if any(ch.isdigit() for ch in p):
                    group_code = p
                    break

            # аудитория — токен вида "7а-316"
            for p in parts[::-1]:
                if "-" in p and any(ch.isdigit() for ch in p):
                    room_name = p
                    break

            if not group_code or not room_name:
                continue

            group = get_or_create_group(db, group_code)
            room = get_or_create_room(db, room_name)

            lesson = Lesson(
                group_id=group.id,
                teacher_id=teacher.id,
                room_id=room.id,
                discipline_id=None,
                subject_raw=text,
                weekday=weekday,
                start_time=start_t,
                end_time=end_t,
            )
            db.add(lesson)

    db.commit()
