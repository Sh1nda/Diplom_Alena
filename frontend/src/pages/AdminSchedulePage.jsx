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

export default function AdminSchedulePage() {
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState("");
  const [tableData, setTableData] = useState([]);

  useEffect(() => {
    api.get("/groups").then((res) => setGroups(res.data));
  }, []);

  useEffect(() => {
    if (!selectedGroup) {
      setTableData([]);
      return;
    }

    const monday = new Date();
    const day = monday.getDay();
    const diff = (day === 0 ? -6 : 1) - day;
    monday.setDate(monday.getDate() + diff);
    const mondayStr = monday.toISOString().slice(0, 10);

    api
      .get(`/schedule/week?start=${mondayStr}&group_id=${selectedGroup}`)
      .then((res) => {
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

          const teacherLessons = [...byTeacher[teacher]].sort(
            (a, b) => a.id - b.id
          );

          teacherLessons.forEach((l, index) => {
            const dayIndex = index % WEEKDAYS.length;
            const dayName = WEEKDAYS[dayIndex];

            const slotIndex = TIME_SLOTS.findIndex((slot) =>
              slot.startsWith(l.start_time)
            );

            if (slotIndex === -1) return;

            row.days[dayName][slotIndex] = {
              title: l.title,
              room: l.room_name
            };
          });

          return row;
        });

        setTableData(rows);
      });
  }, [selectedGroup]);

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
                  TIME_SLOTS.map((_, slotIndex) => {
                    const cell = row.days[day][slotIndex];
                    return (
                      <td key={day + slotIndex} className="lesson-cell">
                        {cell && (
                          <div className="lesson-block">
                            <div className="lesson-title">{cell.title}</div>
                            <div className="lesson-room">{cell.room}</div>
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
    </AdminLayout>
  );
}
