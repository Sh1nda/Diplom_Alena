import { useEffect, useState } from "react";
import { listRooms, createRoom } from "../api/rooms";
import AdminLayout from "../components/AdminLayout";

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
      <h2>Аудитории</h2>

      <form onSubmit={handleCreate} style={{ marginBottom: 16 }}>
        <input
          placeholder="Название"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{ marginRight: 8 }}
        />
        <input
          placeholder="Вместимость"
          type="number"
          value={capacity}
          onChange={(e) => setCapacity(e.target.value)}
          style={{ marginRight: 8 }}
        />
        <button type="submit">Добавить</button>
      </form>

      <table border="1" cellPadding="4" cellSpacing="0">
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
              <td colSpan="3">Нет аудиторий</td>
            </tr>
          )}
        </tbody>
      </table>
    </AdminLayout>
  );
}
