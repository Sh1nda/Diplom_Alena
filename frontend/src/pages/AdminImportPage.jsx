import { useState } from "react";
import { importSchedule, importAssignments } from "../api/imports";
import AdminLayout from "../components/AdminLayout";
import "../styles/adminImport.css";

export default function AdminImportPage() {
  const [scheduleFile, setScheduleFile] = useState(null);
  const [assignFile, setAssignFile] = useState(null);
  const [message, setMessage] = useState("");

  async function handleSchedule(e) {
    e.preventDefault();
    if (!scheduleFile) return;
    await importSchedule(scheduleFile);
    setMessage("Расписание успешно импортировано");
  }

  async function handleAssignments(e) {
    e.preventDefault();
    if (!assignFile) return;
    await importAssignments(assignFile);
    setMessage("Назначения успешно импортированы");
  }

  return (
    <AdminLayout>
      <h2 className="im-title">Импорт данных</h2>

      <div className="im-block">
        <form onSubmit={handleSchedule} className="im-form">
          <div className="im-label">Импорт расписания (.xlsx / .xlsm)</div>

          <input
            type="file"
            accept=".xlsx,.xlsm"
            onChange={(e) => setScheduleFile(e.target.files[0] || null)}
            className="im-input"
          />

          <button type="submit" className="im-btn">
            Импортировать расписание
          </button>
        </form>
      </div>

      <div className="im-block">
        <form onSubmit={handleAssignments} className="im-form">
          <div className="im-label">Импорт назначений (.docx)</div>

          <input
            type="file"
            accept=".docx"
            onChange={(e) => setAssignFile(e.target.files[0] || null)}
            className="im-input"
          />

          <button type="submit" className="im-btn">
            Импортировать назначения
          </button>
        </form>
      </div>

      {message && <p className="im-message">{message}</p>}
    </AdminLayout>
  );
}
