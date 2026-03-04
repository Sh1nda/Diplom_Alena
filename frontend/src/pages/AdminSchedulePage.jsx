import { useEffect, useState } from "react";
import AdminLayout from "../components/AdminLayout";
import { api } from "../api/axios";
import "../styles/excelCalendar.css";

const TIME_SLOTS = [
  "08:00-09:35",
  "09:50-11:25",
  "11:40-13:15",
  "13:45-15:20",
  "15:35-17:10",
  "17:25-19:00",
  "19:15-20:50",
];

const WEEKDAYS = [
  "Понедельник",
  "Вторник",
  "Среда",
  "Четверг",
  "Пятница",
  "Суббота"
];

const WEEKDAY_MAP = {
  monday: "Понедельник",
  tuesday: "Вторник",
  wednesday: "Среда",
  thursday: "Четверг",
  friday: "Пятница",
  saturday: "Суббота",
};

const WEEKDAY_REVERSE = Object.fromEntries(
  Object.entries(WEEKDAY_MAP).map(([k, v]) => [v, k])
);

export default function AdminSchedulePage() {
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState("");
  const [tableData, setTableData] = useState([]);

  const [editingLesson, setEditingLesson] = useState(null);
  const [teachers, setTeachers] = useState([]);
  const [rooms, setRooms] = useState([]);

  useEffect(() => {
    api.get("/groups").then((res) => setGroups(res.data));
    api.get("/teachers").then((res) => setTeachers(res.data));
    api.get("/rooms").then((res) => setRooms(res.data));
  }, []);

  async function loadSchedule() {
    if (!selectedGroup) {
      setTableData([]);
      return;
    }

    const monday = new Date();
    const day = monday.getDay();
    const diff = (day === 0 ? -6 : 1) - day;
    monday.setDate(monday.getDate() + diff);
    const mondayStr = monday.toISOString().slice(0, 10);

    const res = await api.get(`/schedule/week?start=${mondayStr}&group_id=${selectedGroup}`);
    const lessons = res.data;

    const byTeacher = {};
    for (const l of lessons) {
      const key = l.teacher_name || "Неизвестный";
      if (!byTeacher[key]) byTeacher[key] = [];
      byTeacher[key].push(l);
    }

    const rows = Object.keys(byTeacher).map((teacher) => {
      const row = { teacher, days: {} };

      WEEKDAYS.forEach((d) => {
        row.days[d] = Array(TIME_SLOTS.length).fill(null);
      });

      const teacherLessons = [...byTeacher[teacher]].sort((a, b) => a.id - b.id);

      teacherLessons.forEach((l) => {
        const dayName = WEEKDAY_MAP[l.weekday];
        const dayIndex = WEEKDAYS.indexOf(dayName);
        if (dayIndex === -1) return;

        const slotIndex = TIME_SLOTS.findIndex((slot) =>
          slot.startsWith(l.start_time)
        );
        if (slotIndex === -1) return;

        row.days[dayName][slotIndex] = {
          id: l.id,
          subject_raw: l.title,
          room_id: l.room_id,
          teacher_id: l.teacher_id,
          weekday: dayName,
          start_time: l.start_time,
          end_time: l.end_time,
          group_id: l.group_id,
        };
      });

      return row;
    });

    setTableData(rows);
  }

  useEffect(() => {
    loadSchedule();
  }, [selectedGroup]);

  async function saveLesson() {
    const payload = {
      subject_raw: editingLesson.subject_raw,
      teacher_id: editingLesson.teacher_id,
      room_id: editingLesson.room_id,
      weekday: WEEKDAY_REVERSE[editingLesson.weekday],
      start_time: editingLesson.start_time,
      end_time: editingLesson.end_time,
      group_id: editingLesson.group_id,
    };

    if (editingLesson.id) {
      await api.put(`/lessons/${editingLesson.id}`, payload);
    } else {
      await api.post(`/lessons`, payload);
    }

    setEditingLesson(null);
    await loadSchedule();
  }

  async function deleteLesson() {
    if (!window.confirm("Удалить пару?")) return;

    await api.delete(`/lessons/${editingLesson.id}`);
    setEditingLesson(null);
    await loadSchedule();
  }

  return (
    <AdminLayout>
      <h2>Расписание по группе</h2>

      <select
        value={selectedGroup}
        onChange={(e) => setSelectedGroup(e.target.value)}
        style={{ padding: 8, marginBottom: 20 }}
      >
        <option value="">Выберите группу</option>
        {groups.map((g) => (
          <option key={g.id} value={g.id}>
            {g.name}
          </option>
        ))}
      </select>

      <div className="schedule-wrapper">
        <table className="schedule-table">
          <thead>
            <tr>
              <th rowSpan="2" className="teacher-col">Преподаватель</th>
              {WEEKDAYS.map((d) => (
                <th key={d} colSpan={TIME_SLOTS.length}>
                  {d}
                </th>
              ))}
            </tr>
            <tr>
              {WEEKDAYS.map((d) =>
                TIME_SLOTS.map((slot) => (
                  <th key={d + slot} className="time-cell">
                    {slot}
                  </th>
                ))
              )}
            </tr>
          </thead>

          <tbody>
            {tableData.map((row) => (
              <tr key={row.teacher}>
                <td className="teacher-col">{row.teacher}</td>

                {WEEKDAYS.map((day) =>
                  TIME_SLOTS.map((slot, slotIndex) => {
                    const cell = row.days[day][slotIndex];

                    return (
                      <td
                        key={day + slotIndex}
                        className="lesson-cell"
                        onClick={() => {
                          if (cell) {
                            setEditingLesson(cell);
                          } else {
                            const [start, end] = TIME_SLOTS[slotIndex].split("-");
                            setEditingLesson({
                              id: null,
                              subject_raw: "",
                              teacher_id: teachers[0]?.id ?? null,
                              room_id: rooms[0]?.id ?? null,
                              weekday: day,
                              start_time: start,
                              end_time: end,
                              group_id: Number(selectedGroup),
                            });
                          }
                        }}
                      >
                        {cell && (
                          <div className="lesson-block">
                            <div className="lesson-title">{cell.subject_raw}</div>
                          </div>
                        )}
                      </td>
                    );
                  })
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editingLesson && (
        <div className="modal">
          <div className="modal-content">
            <h3>{editingLesson.id ? "Редактировать пару" : "Добавить пару"}</h3>

            <label>Предмет</label>
            <input
              value={editingLesson.subject_raw}
              onChange={(e) =>
                setEditingLesson({ ...editingLesson, subject_raw: e.target.value })
              }
            />

            <label>Преподаватель</label>
            <select
              value={editingLesson.teacher_id}
              onChange={(e) =>
                setEditingLesson({ ...editingLesson, teacher_id: Number(e.target.value) })
              }
            >
              {teachers.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.full_name}
                </option>
              ))}
            </select>

            <label>Аудитория</label>
            <select
              value={editingLesson.room_id}
              onChange={(e) =>
                setEditingLesson({ ...editingLesson, room_id: Number(e.target.value) })
              }
            >
              {rooms.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>

            <label>День недели</label>
            <select
              value={editingLesson.weekday}
              onChange={(e) =>
                setEditingLesson({ ...editingLesson, weekday: e.target.value })
              }
            >
              {WEEKDAYS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>

            <label>Начало</label>
            <input
              type="time"
              value={editingLesson.start_time}
              onChange={(e) =>
                setEditingLesson({ ...editingLesson, start_time: e.target.value })
              }
            />

            <label>Конец</label>
            <input
              type="time"
              value={editingLesson.end_time}
              onChange={(e) =>
                setEditingLesson({ ...editingLesson, end_time: e.target.value })
              }
            />

            <div className="modal-buttons">
              <button onClick={saveLesson}>Сохранить</button>

              {editingLesson.id && (
                <button onClick={deleteLesson} className="danger">
                  Удалить
                </button>
              )}

              <button onClick={() => setEditingLesson(null)}>Отмена</button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
