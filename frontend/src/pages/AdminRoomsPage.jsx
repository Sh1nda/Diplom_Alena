import { useEffect, useState } from "react";
import {
  listRooms,
  createRoom,
  updateRoom,
  deleteRoom
} from "../api/rooms";
import AdminLayout from "../components/AdminLayout";
import "../styles/adminRooms.css";

export default function AdminRoomsPage() {
  const [rooms, setRooms] = useState([]);

  const [name, setName] = useState("");
  const [capacity, setCapacity] = useState("");

  const [editId, setEditId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editCapacity, setEditCapacity] = useState("");

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

  function startEdit(room) {
    setEditId(room.id);
    setEditName(room.name);
    setEditCapacity(room.capacity ?? "");
  }

  function cancelEdit() {
    setEditId(null);
    setEditName("");
    setEditCapacity("");
  }

  async function saveEdit(id) {
    await updateRoom(id, {
      name: editName,
      capacity: editCapacity ? Number(editCapacity) : null,
    });
    cancelEdit();
    await load();
  }

  async function handleDelete(id) {
    if (!window.confirm("Удалить аудиторию?")) return;
    await deleteRoom(id);
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
              <th>Действия</th>
            </tr>
          </thead>

          <tbody>
            {rooms.map((r) => (
              <tr key={r.id}>
                <td>{r.id}</td>

                <td>
                  {editId === r.id ? (
                    <input
                      className="rm-input"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                    />
                  ) : (
                    r.name
                  )}
                </td>

                <td>
                  {editId === r.id ? (
                    <input
                      className="rm-input"
                      type="number"
                      value={editCapacity}
                      onChange={(e) => setEditCapacity(e.target.value)}
                    />
                  ) : (
                    r.capacity
                  )}
                </td>

                <td>
                  {editId === r.id ? (
                    <>
                      <button
                        className="rm-btn rm-save"
                        onClick={() => saveEdit(r.id)}
                      >
                        Сохранить
                      </button>
                      <button
                        className="rm-btn rm-cancel"
                        onClick={cancelEdit}
                      >
                        Отмена
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        className="rm-btn rm-edit"
                        onClick={() => startEdit(r)}
                      >
                        Редактировать
                      </button>
                      <button
                        className="rm-btn rm-delete"
                        onClick={() => handleDelete(r.id)}
                      >
                        Удалить
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}

            {rooms.length === 0 && (
              <tr>
                <td colSpan="4" className="rm-empty">
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
