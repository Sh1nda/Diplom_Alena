import { useState } from "react";
import { getFreeRooms } from "../api/availability";
import AdminLayout from "../components/AdminLayout";
import "../styles/adminAvailability.css";

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
      <h2 className="av-title">Свободные аудитории</h2>

      <form onSubmit={handleSearch} className="av-form">
        <div className="av-field">
          <label>Начало</label>
          <input
            type="datetime-local"
            value={start}
            onChange={(e) => setStart(e.target.value)}
          />
        </div>

        <div className="av-field">
          <label>Конец</label>
          <input
            type="datetime-local"
            value={end}
            onChange={(e) => setEnd(e.target.value)}
          />
        </div>

        <button type="submit" className="av-btn">Найти</button>
      </form>

      <div className="av-results">
        {rooms.length > 0 ? (
          <ul className="av-list">
            {rooms.map((r) => (
              <li key={r.id} className="av-item">
                <div className="av-room-name">{r.name}</div>
                <div className="av-room-capacity">Вместимость: {r.capacity}</div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="av-empty">Нет данных</div>
        )}
      </div>
    </AdminLayout>
  );
}
