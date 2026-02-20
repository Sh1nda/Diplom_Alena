import { Link, useLocation } from "react-router-dom";

export default function AdminLayout({ children }) {
  const loc = useLocation();

  const linkStyle = (path) => ({
    marginRight: 16,
    textDecoration: loc.pathname.startsWith(path) ? "underline" : "none",
  });

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <nav style={{ width: 220, borderRight: "1px solid #ddd", padding: 16 }}>
        <h3>Админ-панель</h3>

        <div style={{ marginTop: 16 }}>
          <div><Link style={linkStyle("/admin/bookings")} to="/admin/bookings">Заявки</Link></div>
          <div><Link style={linkStyle("/admin/rooms")} to="/admin/rooms">Аудитории</Link></div>
          <div><Link style={linkStyle("/admin/availability")} to="/admin/availability">Свободные аудитории</Link></div>
          <div><Link style={linkStyle("/admin/import")} to="/admin/import">Импорт</Link></div>

          
          <div><Link style={linkStyle("/admin/schedule")} to="/admin/schedule">Расписание</Link></div>
        </div>

        <button
          style={{ marginTop: 24 }}
          onClick={() => {
            localStorage.removeItem("token");
            window.location.href = "/login";
          }}
        >
          Выйти
        </button>
      </nav>

      <main style={{ flex: 1, padding: 24 }}>{children}</main>
    </div>
  );
}
