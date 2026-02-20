import { useEffect, useState } from "react";
import { getAllBookings, approveBooking, rejectBooking } from "../api/bookings";
import AdminLayout from "../components/AdminLayout";

const STATUS_LABELS = {
  pending: "Ожидает",
  approved: "Одобрена",
  rejected: "Отклонена",
};

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [statusFilter, setStatusFilter] = useState("");

  async function load() {
    const data = await getAllBookings(statusFilter || undefined);
    setBookings(data);
  }

  useEffect(() => {
    load().catch(console.error);
  }, [statusFilter]);

  async function handleApprove(id) {
    await approveBooking(id);
    await load();
  }

  async function handleReject(id) {
    await rejectBooking(id);
    await load();
  }

  return (
    <AdminLayout>
      <h2>Заявки на бронирование</h2>

      <div style={{ marginBottom: 12 }}>
        <label>
          Статус:&nbsp;
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">Все</option>
            <option value="pending">Ожидает</option>
            <option value="approved">Одобрена</option>
            <option value="rejected">Отклонена</option>
          </select>
        </label>
      </div>

      <table border="1" cellPadding="4" cellSpacing="0">
        <thead>
          <tr>
            <th>ID</th>
            <th>Преподаватель</th>
            <th>Предмет</th>
            <th>Начало</th>
            <th>Конец</th>
            <th>Статус</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          {bookings.map((b) => (
            <tr key={b.id}>
              <td>{b.id}</td>
              <td>{b.teacher_id}</td>
              <td>{b.subject}</td>
              <td>{b.start_datetime}</td>
              <td>{b.end_datetime}</td>
              <td>{STATUS_LABELS[b.status] || b.status}</td>
              <td>
                {b.status === "pending" && (
                  <>
                    <button onClick={() => handleApprove(b.id)}>Одобрить</button>
                    <button onClick={() => handleReject(b.id)} style={{ marginLeft: 8 }}>
                      Отклонить
                    </button>
                  </>
                )}
              </td>
            </tr>
          ))}
          {bookings.length === 0 && (
            <tr>
              <td colSpan="7">Нет заявок</td>
            </tr>
          )}
        </tbody>
      </table>
    </AdminLayout>
  );
}
