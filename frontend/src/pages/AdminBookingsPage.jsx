import { useEffect, useState } from "react";
import { getAllBookings, approveBooking, rejectBooking } from "../api/bookings";
import AdminLayout from "../components/AdminLayout";
import "../styles/adminBookings.css";

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
      <h2 className="ab-title">Заявки на бронирование</h2>

      <div className="ab-filter">
        <label>
          Статус:&nbsp;
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="ab-select"
          >
            <option value="">Все</option>
            <option value="pending">Ожидает</option>
            <option value="approved">Одобрена</option>
            <option value="rejected">Отклонена</option>
          </select>
        </label>
      </div>

      <div className="ab-table-wrapper">
        <table className="ab-table">
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

                <td>
                  <span className={`ab-status ab-${b.status}`}>
                    {STATUS_LABELS[b.status] || b.status}
                  </span>
                </td>

                <td>
                  {b.status === "pending" && (
                    <div className="ab-actions">
                      <button
                        className="ab-btn ab-approve"
                        onClick={() => handleApprove(b.id)}
                      >
                        Одобрить
                      </button>

                      <button
                        className="ab-btn ab-reject"
                        onClick={() => handleReject(b.id)}
                      >
                        Отклонить
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}

            {bookings.length === 0 && (
              <tr>
                <td colSpan="7" className="ab-empty">
                  Нет заявок
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}
