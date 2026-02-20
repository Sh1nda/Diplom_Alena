import { useEffect, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import ruLocale from "@fullcalendar/core/locales/ru";
import { getAllSchedule } from "../api/schedule";
import AdminLayout from "../components/AdminLayout";

export default function AdminSchedulePage() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    getAllSchedule().then((data) => {
      const mapped = data.map((l) => ({
        id: l.id,
        title: `${l.subject_raw} (${l.room_name})`,
        start: `${l.date}T${l.start_time}`,
        end: `${l.date}T${l.end_time}`,
      }));
      setEvents(mapped);
    });
  }, []);

  return (
    <AdminLayout>
      <h2>Полное расписание</h2>
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="timeGridWeek"
        locales={[ruLocale]}
        locale="ru"
        events={events}
      />
    </AdminLayout>
  );
}
