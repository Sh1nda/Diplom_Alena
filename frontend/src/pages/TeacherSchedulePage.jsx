import { useEffect, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import dayGridPlugin from "@fullcalendar/daygrid";
import { getMyBookings } from "../api/bookings";

export default function TeacherSchedulePage() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    getMyBookings()
      .then((data) => {
        const mapped = data.map((b) => ({
          id: b.id,
          title: b.subject,
          start: b.start_datetime,
          end: b.end_datetime,
        }));
        setEvents(mapped);
      })
      .catch((e) => console.error(e));
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h2>Моё расписание</h2>
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="timeGridWeek"
        events={events}
      />
    </div>
  );
}
