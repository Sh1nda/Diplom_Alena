import { useEffect, useState } from "react";
import AdminLayout from "../components/AdminLayout";
import ScheduleTable from "../components/ScheduleTable";
import { api } from "../api/axios";

export default function AdminSchedulePage() {
  const [lessons, setLessons] = useState([]);

  useEffect(() => {
    api.get("/schedule/week").then((res) => {
      const mapped = res.data.map((l) => ({
        title: l.title,
        room: l.room_name,
        day: l.weekday,
        pair_number: l.pair_number,
      }));

      setLessons(mapped);
    });
  }, []);

  return (
    <AdminLayout>
      <h2>Расписание занятий</h2>
      <ScheduleTable lessons={lessons} />
    </AdminLayout>
  );
}