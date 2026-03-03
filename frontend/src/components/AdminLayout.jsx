import { Link, useLocation } from "react-router-dom";
import "../styles/adminLayout.css";

export default function AdminLayout({ children }) {
  const loc = useLocation();

  const isActive = (path) => loc.pathname.startsWith(path);

  return (
    <div className="al-wrapper">
      <nav className="al-sidebar">
        <h3 className="al-title">Админ‑панель</h3>

        <div className="al-menu">
          <Link className={`al-link ${isActive("/admin/bookings") ? "active" : ""}`} to="/admin/bookings">
            Заявки
          </Link>

          <Link className={`al-link ${isActive("/admin/rooms") ? "active" : ""}`} to="/admin/rooms">
            Аудитории
          </Link>

          <Link className={`al-link ${isActive("/admin/availability") ? "active" : ""}`} to="/admin/availability">
            Свободные аудитории
          </Link>

          <Link className={`al-link ${isActive("/admin/import") ? "active" : ""}`} to="/admin/import">
            Импорт
          </Link>

          <Link className={`al-link ${isActive("/admin/schedule") ? "active" : ""}`} to="/admin/schedule">
            Расписание
          </Link>
        </div>

        <button
          className="al-logout"
          onClick={() => {
            localStorage.removeItem("token");
            window.location.href = "/login";
          }}
        >
          Выйти
        </button>
      </nav>

      <main className="al-content">{children}</main>
    </div>
  );
}
