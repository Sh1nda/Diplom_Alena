import { useState } from "react";
import { getFreeRooms } from "../api/availability";
import AdminLayout from "../components/AdminLayout";

export default function AdminAvailabilityPage() {
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [rooms, setRooms] = useState([]);

  async function handleSearch(e) {
    e.preventDefault();
    if (!start || !end) return;
    const data = await getFreeRooms(start, end);
    setRooms(data);
  }

  return (
    <AdminLayout>
      <h2>Свободные аудитории</h2>

      <form onSubmit={handleSearch} style={{ marginBottom: 16 }}>
        <label>
          Начало:&nbsp;
          <input
            type="datetime-local"
            value={start}
            onChange={(e) => setStart(e.target.value)}
          />
        </label>
        &nbsp;&nbsp;
        <label>
          Конец:&nbsp;
          <input
            type="datetime-local"
            value={end}
            onChange={(e) => setEnd(e.target.value)}
          />
        </label>
        &nbsp;&nbsp;
        <button type="submit">Найти</button>
      </form>

      <ul>
        {rooms.map((r) => (
          <li key={r.id}>
            {r.name} (вместимость: {r.capacity})
          </li>
        ))}
        {rooms.length === 0 && <li>Нет данных</li>}
      </ul>
    </AdminLayout>
  );
}
