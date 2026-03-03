import { useEffect, useState } from "react";
import { listRooms, createRoom } from "../api/rooms";
import AdminLayout from "../components/AdminLayout";
import "../styles/adminRooms.css";

export default function AdminRoomsPage() {
  const [rooms, setRooms] = useState([]);
  const [name, setName] = useState("");
  const [capacity, setCapacity] = useState("");

  async function load() {
    const data = await listRooms();
    setRooms(data);
  }

  useEffect(() => {
    load().catch(console.error);
  }, []);

  async function handleCreate(e) {
    e.preventDefault();
    await createRoom({
      name,
      capacity: capacity ? Number(capacity) : null,
    });
    setName("");
    setCapacity("");
    await load();
  }

  return (
    <AdminLayout>
      <h2 className="rm-title">Аудитории</h2>

      <form onSubmit={handleCreate} className="rm-form">
        <input
          className="rm-input"
          placeholder="Название"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          className="rm-input"
          placeholder="Вместимость"
          type="number"
          value={capacity}
          onChange={(e) => setCapacity(e.target.value)}
        />

        <button type="submit" className="rm-btn">
          Добавить
        </button>
      </form>

      <div className="rm-table-wrapper">
        <table className="rm-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Название</th>
              <th>Вместимость</th>
            </tr>
          </thead>

          <tbody>
            {rooms.map((r) => (
              <tr key={r.id}>
                <td>{r.id}</td>
                <td>{r.name}</td>
                <td>{r.capacity}</td>
              </tr>
            ))}

            {rooms.length === 0 && (
              <tr>
                <td colSpan="3" className="rm-empty">
                  Нет аудиторий
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}
