import { useEffect, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import ruLocale from "@fullcalendar/core/locales/ru";
import AdminLayout from "../components/AdminLayout";
import { api } from "../api/axios";
import "../styles/excelCalendar.css";

// Получаем понедельник текущей недели
function getMonday(d) {
  const date = new Date(d);
  const day = date.getDay();
  const diff = (day === 0 ? -6 : 1) - day;
  date.setDate(date.getDate() + diff);
  return date.toISOString().slice(0, 10);
}

// Запрос расписания недели
async function getWeekSchedule(startDate) {
  const res = await api.get(`/schedule/week?start=${startDate}`);
  return res.data;
}

export default function AdminSchedulePage() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const monday = getMonday(new Date());

    getWeekSchedule(monday).then((data) => {
      const mapped = data.map((l) => ({
        id: l.id,
        title: `${l.title}\n${l.room_name}`,
        start: `${l.date}T${l.start_time}`,
        end: `${l.date}T${l.end_time}`,
        backgroundColor: "#cfe2ff",
        borderColor: "#9ec5fe",
        textColor: "#000",
      }));
      setEvents(mapped);
    });
  }, []);

  return (
    <AdminLayout>
      <h2>Полное расписание</h2>

      <FullCalendar
        plugins={[timeGridPlugin, interactionPlugin]}
        initialView="timeGridWeek"
        locales={[ruLocale]}
        locale="ru"

        // Убираем верхнюю панель
        headerToolbar={false}

        // Убираем all-day строку
        allDaySlot={false}

        // Временные границы
        slotMinTime="08:00:00"
        slotMaxTime="20:00:00"

        // Длительность пары
        slotDuration="01:35:00"

        // Запрещаем наложение событий
        eventOverlap={false}
        slotEventOverlap={false}

        // Только дни недели, без дат
        dayHeaderFormat={{ weekday: "long" }}

        // События
        events={events}
        eventDisplay="block"

        height="auto"
      />
    </AdminLayout>
  );
}
