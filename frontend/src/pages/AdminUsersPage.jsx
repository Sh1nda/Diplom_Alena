import { useEffect, useState } from "react";
import { listUsers, createUser, deleteUser, updateUser } from "../api/users";
import AdminLayout from "../components/AdminLayout";
import "../styles/adminUsers.css";

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("teacher");
  const [password, setPassword] = useState("");

  const [editId, setEditId] = useState(null);
  const [editFullName, setEditFullName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editRole, setEditRole] = useState("teacher");
  const [editPassword, setEditPassword] = useState("");

  async function load() {
    const data = await listUsers();
    setUsers(data);
  }

  useEffect(() => {
    load().catch(console.error);
  }, []);

  async function handleCreate(e) {
    e.preventDefault();

    await createUser({
      full_name: fullName,
      email: email || null,
      role,
      password: password || null,
    });

    setFullName("");
    setEmail("");
    setRole("teacher");
    setPassword("");

    await load();
  }

  function startEdit(u) {
    setEditId(u.id);
    setEditFullName(u.full_name);
    setEditEmail(u.email || "");
    setEditRole(u.role);
    setEditPassword("");
  }

  async function saveEdit(id) {
    await updateUser(id, {
      full_name: editFullName,
      email: editEmail || null,
      role: editRole,
      password: editPassword || null,
    });

    setEditId(null);
    await load();
  }

  async function handleDelete(id) {
    if (!window.confirm("Удалить пользователя?")) return;
    await deleteUser(id);
    await load();
  }

  return (
    <AdminLayout>
      <h2 className="usr-title">Пользователи</h2>

      <form className="usr-form" onSubmit={handleCreate}>
        <input
          className="usr-input"
          placeholder="ФИО"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
        />

        <input
          className="usr-input"
          placeholder="Email (необязательно)"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <select
          className="usr-input"
          value={role}
          onChange={(e) => setRole(e.target.value)}
        >
          <option value="teacher">Преподаватель</option>
          <option value="admin">Администратор</option>
        </select>

        <input
          className="usr-input"
          placeholder="Пароль (только для админов)"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button className="usr-btn" type="submit">
          Создать
        </button>
      </form>

      <div className="usr-table-wrapper">
        <table className="usr-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>ФИО</th>
              <th>Email</th>
              <th>Роль</th>
              <th></th>
            </tr>
          </thead>

          <tbody>
            {users.map((u) =>
              editId === u.id ? (
                <tr key={u.id}>
                  <td>{u.id}</td>
                  <td>
                    <input
                      className="usr-input"
                      value={editFullName}
                      onChange={(e) => setEditFullName(e.target.value)}
                    />
                  </td>
                  <td>
                    <input
                      className="usr-input"
                      value={editEmail}
                      onChange={(e) => setEditEmail(e.target.value)}
                    />
                  </td>
                  <td>
                    <select
                      className="usr-input"
                      value={editRole}
                      onChange={(e) => setEditRole(e.target.value)}
                    >
                      <option value="teacher">Преподаватель</option>
                      <option value="admin">Администратор</option>
                    </select>
                  </td>
                  <td>
                    <input
                      className="usr-input"
                      placeholder="Новый пароль (необязательно)"
                      type="password"
                      value={editPassword}
                      onChange={(e) => setEditPassword(e.target.value)}
                    />
                    <button
                      className="usr-btn"
                      onClick={() => saveEdit(u.id)}
                    >
                      Сохранить
                    </button>
                    <button
                      className="usr-btn usr-delete"
                      onClick={() => setEditId(null)}
                    >
                      Отмена
                    </button>
                  </td>
                </tr>
              ) : (
                <tr key={u.id}>
                  <td>{u.id}</td>
                  <td>{u.full_name}</td>
                  <td>{u.email || "—"}</td>
                  <td>{u.role}</td>
                  <td>
                    <button
                      className="usr-btn"
                      onClick={() => startEdit(u)}
                    >
                      Редактировать
                    </button>
                    <button
                      className="usr-btn usr-delete"
                      onClick={() => handleDelete(u.id)}
                    >
                      Удалить
                    </button>
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}
