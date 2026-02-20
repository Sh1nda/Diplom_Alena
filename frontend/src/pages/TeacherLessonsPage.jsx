import { useEffect, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import ruLocale from "@fullcalendar/core/locales/ru";
import { getTeacherSchedule } from "../api/schedule";

export default function TeacherLessonsPage() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    getTeacherSchedule().then((data) => {
      const mapped = data.map((l) => ({
        id: l.id,
        title: l.subject_raw,
        start: `${l.date}T${l.start_time}`,
        end: `${l.date}T${l.end_time}`,
      }));
      setEvents(mapped);
    });
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h2>Моё расписание</h2>
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="timeGridWeek"
        locales={[ruLocale]}
        locale="ru"
        events={events}
      />
    </div>
  );
}
