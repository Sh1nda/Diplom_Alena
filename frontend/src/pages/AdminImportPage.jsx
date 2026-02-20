import { useState } from "react";
import { importSchedule, importAssignments } from "../api/imports";
import AdminLayout from "../components/AdminLayout";

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
      <h2>Импорт данных</h2>

      <form onSubmit={handleSchedule} style={{ marginBottom: 16 }}>
        <div>Импорт расписания (.xlsx / .xlsm)</div>
        <input
          type="file"
          accept=".xlsx,.xlsm"
          onChange={(e) => setScheduleFile(e.target.files[0] || null)}
        />
        <button type="submit" style={{ marginTop: 8 }}>
          Импортировать расписание
        </button>
      </form>

      <form onSubmit={handleAssignments} style={{ marginBottom: 16 }}>
        <div>Импорт назначений (.docx)</div>
        <input
          type="file"
          accept=".docx"
          onChange={(e) => setAssignFile(e.target.files[0] || null)}
        />
        <button type="submit" style={{ marginTop: 8 }}>
          Импортировать назначения
        </button>
      </form>

      {message && <p>{message}</p>}
    </AdminLayout>
  );
}
