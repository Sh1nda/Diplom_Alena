import { useEffect, useState } from "react";
import AdminLayout from "../components/AdminLayout";
import { api } from "../api/axios";
import "../styles/scheduleTable.css";

const DAYS = ["Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота", "Воскресенье"];

const TIME_SLOTS = [
  "08:00",
  "09:35",
  "11:10",
  "12:45",
  "14:20",
  "15:55",
  "17:30",
];

function getMonday(d) {
  const date = new Date(d);
  const day = date.getDay();
  const diff = (day === 0 ? -6 : 1) - day;
  date.setDate(date.getDate() + diff);
  return date.toISOString().slice(0, 10);
}

export default function ScheduleTable() {
  const [lessons, setLessons] = useState([]);

  useEffect(() => {
    const monday = getMonday(new Date());

    api.get(`/schedule/week?start=${monday}`).then((res) => {
      setLessons(res.data);
    });
  }, []);

  const getLesson = (dayIndex, time) => {
    return lessons.find((l) => {
      const lessonTime = l.start_time.slice(0, 5);
      const lessonDay = new Date(l.date).getDay();
      const normalizedDay = lessonDay === 0 ? 6 : lessonDay - 1;
      return normalizedDay === dayIndex && lessonTime === time;
    });
  };

  return (
    <AdminLayout>
      <h2>Полное расписание</h2>

      <table className="schedule-table">
        <thead>
          <tr>
            <th>Время</th>
            {DAYS.map((d) => (
              <th key={d}>{d}</th>
            ))}
          </tr>
        </thead>

        <tbody>
          {TIME_SLOTS.map((time) => (
            <tr key={time}>
              <td className="time-cell">{time}</td>

              {DAYS.map((_, dayIndex) => {
                const lesson = getLesson(dayIndex, time);

                return (
                  <td key={dayIndex} className="lesson-cell">
                    {lesson ? (
                      <div className="lesson-block">
                        <div className="lesson-title">{lesson.title}</div>
                        <div className="lesson-room">{lesson.room_name}</div>
                      </div>
                    ) : null}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </AdminLayout>
  );
}
