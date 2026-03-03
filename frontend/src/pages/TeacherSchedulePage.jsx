import { useEffect, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import ruLocale from "@fullcalendar/core/locales/ru";
import { getMyBookings } from "../api/bookings";
import "../styles/excelCalendar.css";

export default function TeacherSchedulePage() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    getMyBookings()
      .then((data) => {
        const mapped = data.map((b) => ({
          id: String(b.id),
          title: b.subject,
          start: new Date(b.start_datetime),
          end: new Date(b.end_datetime),
        }));

        setEvents(mapped);
      })
      .catch(console.error);
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h2>Моё расписание</h2>

      <FullCalendar
        plugins={[timeGridPlugin, interactionPlugin]}
        initialView="timeGridWeek"
        locales={[ruLocale]}
        locale="ru"
        timeZone="local"

        headerToolbar={false}
        allDaySlot={false}

        eventOverlap={true}
        slotEventOverlap={true}
        eventMaxStack={4}

        events={events}
        height="auto"
      />
    </div>
  );
}