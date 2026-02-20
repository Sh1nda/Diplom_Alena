import io
import re
from typing import Optional, List, Dict
from datetime import time

from sqlalchemy.orm import Session
from openpyxl import load_workbook

from app.schemas import Weekday
from app.models.lesson import Lesson
from app.models.group import Group
from app.models.room import Room
from app.models.user import User


# Фиксированные временные слоты (по порядку ячеек внутри дня)
TIME_SLOTS = [
    (time(8, 0), time(9, 35)),
    (time(9, 50), time(11, 25)),
    (time(11, 40), time(13, 15)),
    (time(13, 45), time(15, 20)),
    (time(15, 35), time(17, 10)),
    (time(17, 25), time(19, 0)),
    (time(19, 15), time(20, 50)),
]

# Регулярки
GROUP_PATTERN = re.compile(r'\b\d{2}[А-ЯA-Z]{3,}\d*\b')
TYPE_PATTERN = re.compile(
    r'\b(лб|лаб|лек|пр)\s*[\.\·]?\b',
    re.IGNORECASE
)
ROOM_PATTERN = re.compile(r'[А-Яа-яA-Za-z0-9\-]{2,}$')

# Соответствие русских названий дней Weekday
WEEKDAY_NAME_MAP = {
    "понедельник": Weekday.monday,
    "вторник": Weekday.tuesday,
    "среда": Weekday.wednesday,
    "четверг": Weekday.thursday,
    "пятница": Weekday.friday,
    "суббота": Weekday.saturday,
}


def parse_lesson_line(line: str) -> Optional[dict]:
    """Парсит строку занятия с подробным логом."""
    line = line.strip()
    print("\n[PARSE] LINE:", repr(line))

    if not line:
        print("[PARSE]   -> EMPTY LINE")
        return None

    group_match = GROUP_PATTERN.search(line)
    if not group_match:
        print("[PARSE]   -> NO GROUP MATCH")
        return None
    group_id = group_match.group()
    print("[PARSE]   GROUP:", group_id)

    type_match = TYPE_PATTERN.search(line)
    if not type_match:
        print("[PARSE]   -> NO TYPE MATCH")
        return None
    lesson_type = type_match.group()
    print("[PARSE]   TYPE:", lesson_type)

    type_index = line.find(lesson_type)
    subject = line[group_match.end():type_index].strip()
    print("[PARSE]   SUBJECT:", repr(subject))

    after_type = line[type_index + len(lesson_type):].strip()
    if not after_type:
        print("[PARSE]   -> EMPTY AFTER TYPE")
        return None
    print("[PARSE]   AFTER_TYPE:", repr(after_type))

    room_match = ROOM_PATTERN.search(after_type)
    if not room_match:
        print("[PARSE]   -> NO ROOM MATCH")
        return None
    room_id = room_match.group()
    print("[PARSE]   ROOM:", room_id)

    teachers_part = after_type[:room_match.start()].strip().rstrip(',')
    teachers = [t.strip() for t in teachers_part.split(',') if t.strip()]
    if not teachers:
        print("[PARSE]   -> NO TEACHERS PARSED")
        return None
    print("[PARSE]   TEACHERS:", teachers)

    data = {
        "group_id": group_id,
        "subject": subject,
        "type": lesson_type,
        "teachers": teachers,
        "teacher_name": teachers[0],
        "room_id": room_id,
        "subject_raw": line,
    }
    print("[PARSE]   OK:", data)
    return data


def get_or_create_teacher(db: Session, full_name: str):
    print("[DB] get_or_create_teacher:", full_name)
    teacher = db.query(User).filter(User.full_name == full_name).first()
    if not teacher:
        print("[DB]   -> CREATE TEACHER")
        teacher = User(full_name=full_name, role="teacher")
        db.add(teacher)
        db.commit()
        db.refresh(teacher)
    else:
        print("[DB]   -> FOUND TEACHER id=", teacher.id)
    return teacher


def get_or_create_group(db: Session, group_code: str):
    print("[DB] get_or_create_group:", group_code)
    group = db.query(Group).filter(Group.code == group_code).first()
    if not group:
        print("[DB]   -> CREATE GROUP")
        group = Group(code=group_code)
        db.add(group)
        db.commit()
        db.refresh(group)
    else:
        print("[DB]   -> FOUND GROUP id=", group.id)
    return group


def get_or_create_room(db: Session, room_code: str):
    print("[DB] get_or_create_room:", room_code)
    room = db.query(Room).filter(Room.name == room_code).first()
    if not room:
        print("[DB]   -> CREATE ROOM")
        room = Room(name=room_code)
        db.add(room)
        db.commit()
        db.refresh(room)
    else:
        print("[DB]   -> FOUND ROOM id=", room.id)
    return room


def detect_weekday_columns(header_row) -> List[Dict]:
    """
    Находит диапазоны колонок для каждого дня недели по строке заголовка:
    ('№ п/п', 'Ф.И.О.', 'понедельник', ..., 'вторник', ..., 'среда', ...)
    """
    print("\n[DETECT] HEADER ROW:", header_row)
    blocks: List[Dict] = []
    current = None

    for idx, cell in enumerate(header_row):
        name = str(cell).strip().lower() if cell else ""
        if name in WEEKDAY_NAME_MAP:
            print(f"[DETECT]   FOUND WEEKDAY '{name}' AT COL {idx}")
            if current is not None:
                current["end"] = idx - 1
                blocks.append(current)
            current = {
                "weekday": WEEKDAY_NAME_MAP[name],
                "start": idx,
                "end": None,
            }

    if current is not None:
        current["end"] = len(header_row) - 1
        blocks.append(current)

    print("\n[DETECT] WEEKDAY BLOCKS:")
    for b in blocks:
        print(
            f"  {b['weekday'].name}: cols {b['start']}..{b['end']}"
        )

    return blocks


def import_schedule_from_xlsx(db: Session, content: bytes):
    print("\n===== IMPORT SCHEDULE START =====")
    wb = load_workbook(filename=io.BytesIO(content), data_only=True)
    ws = wb.active

    weekday_blocks: List[Dict] = []
    total_lessons = 0

    for row_idx, row in enumerate(ws.iter_rows(values_only=True), start=1):
        print(f"\n[ROW {row_idx}] RAW:", row)

        # строка заголовка с днями недели
        if row_idx == 2:
            weekday_blocks = detect_weekday_columns(row)
            continue

        # строку с временем (3-я) просто логируем и пропускаем
        if row_idx == 3:
            print(f"[ROW {row_idx}] -> TIME ROW, SKIP")
            continue

        # дальше идут строки с преподавателями
        first_cell = row[0]
        first_str = str(first_cell).strip() if first_cell is not None else ""
        print(f"[ROW {row_idx}] first_cell:", repr(first_str))

        # строка преподавателя: в первом столбце номер, во втором — ФИО
        if first_str.isdigit():
            teacher_name = str(row[1]).strip() if row[1] else None
            print(f"[ROW {row_idx}] -> TEACHER ROW, teacher_name={repr(teacher_name)}")

            if not teacher_name:
                print(f"[ROW {row_idx}]   -> NO TEACHER NAME, SKIP ROW")
                continue

            teacher = get_or_create_teacher(db, teacher_name)

            # обходим все блоки дней недели
            for block in weekday_blocks:
                weekday = block["weekday"]
                start_col = block["start"]
                end_col = block["end"]

                print(
                    f"[ROW {row_idx}]   DAY {weekday.name}: cols {start_col}..{end_col}"
                )

                for col_idx in range(start_col, end_col + 1):
                    if col_idx >= len(row):
                        continue

                    cell = row[col_idx]
                    print(
                        f"[ROW {row_idx}]     COL {col_idx} CELL RAW:",
                        repr(cell),
                    )

                    if not cell:
                        print(
                            f"[ROW {row_idx}]     -> EMPTY CELL, SKIP"
                        )
                        continue

                    if isinstance(cell, str):
                        cell_str = cell.replace("\n", " ").strip()
                    else:
                        cell_str = str(cell).strip()

                    print(
                        f"[ROW {row_idx}]     CELL STR:",
                        repr(cell_str),
                    )

                    if not cell_str:
                        print(
                            f"[ROW {row_idx}]     -> EMPTY AFTER STRIP, SKIP"
                        )
                        continue

                    # индекс слота внутри дня
                    slot_index = col_idx - start_col
                    if slot_index < 0 or slot_index >= len(TIME_SLOTS):
                        print(
                            f"[ROW {row_idx}]     -> NO TIME SLOT FOR COL {col_idx} (slot_index={slot_index}), SKIP"
                        )
                        continue

                    lesson_data = parse_lesson_line(cell_str)
                    if not lesson_data:
                        print(
                            f"[ROW {row_idx}]     -> PARSE FAILED, SKIP"
                        )
                        continue

                    group = get_or_create_group(db, lesson_data["group_id"])
                    room = get_or_create_room(db, lesson_data["room_id"])
                    start_time, end_time = TIME_SLOTS[slot_index]

                    lesson = Lesson(
                        group_id=group.id,
                        teacher_id=teacher.id,
                        room_id=room.id,
                        subject_raw=lesson_data["subject_raw"],
                        weekday=weekday,
                        start_time=start_time,
                        end_time=end_time,
                    )
                    db.add(lesson)
                    total_lessons += 1
                    print(
                        f"[ROW {row_idx}]     -> LESSON CREATED (weekday={weekday.name}, slot={slot_index})"
                    )

        else:
            print(f"[ROW {row_idx}] -> NOT A TEACHER ROW, SKIP")

    db.commit()
    print(f"\n===== IMPORT SCHEDULE END, TOTAL_LESSONS_CREATED = {total_lessons} =====\n")
