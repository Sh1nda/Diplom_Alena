import { BrowserRouter, Routes, Route } from "react-router-dom";

import LoginPage from "./pages/LoginPage";

// Преподаватель
import TeacherSchedulePage from "./pages/TeacherSchedulePage";      // заявки
import TeacherLessonsPage from "./pages/TeacherLessonsPage";        // расписание

// Админ
import AdminBookingsPage from "./pages/AdminBookingsPage";
import AdminRoomsPage from "./pages/AdminRoomsPage";
import AdminAvailabilityPage from "./pages/AdminAvailabilityPage";
import AdminImportPage from "./pages/AdminImportPage";
import AdminSchedulePage from "./pages/AdminSchedulePage";          // расписание

import ProtectedRoute from "./components/ProtectedRoute";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Авторизация */}
        <Route path="/login" element={<LoginPage />} />

        {/* Преподаватель: заявки */}
        <Route
          path="/teacher"
          element={
            <ProtectedRoute>
              <TeacherSchedulePage />
            </ProtectedRoute>
          }
        />

        {/* Преподаватель: расписание */}
        <Route
          path="/teacher/schedule"
          element={
            <ProtectedRoute>
              <TeacherLessonsPage />
            </ProtectedRoute>
          }
        />

        {/* Админ: заявки */}
        <Route
          path="/admin/bookings"
          element={
            <ProtectedRoute>
              <AdminBookingsPage />
            </ProtectedRoute>
          }
        />

        {/* Админ: аудитории */}
        <Route
          path="/admin/rooms"
          element={
            <ProtectedRoute>
              <AdminRoomsPage />
            </ProtectedRoute>
          }
        />

        {/* Админ: свободные аудитории */}
        <Route
          path="/admin/availability"
          element={
            <ProtectedRoute>
              <AdminAvailabilityPage />
            </ProtectedRoute>
          }
        />

        {/* Админ: импорт */}
        <Route
          path="/admin/import"
          element={
            <ProtectedRoute>
              <AdminImportPage />
            </ProtectedRoute>
          }
        />

        {/* Админ: расписание */}
        <Route
          path="/admin/schedule"
          element={
            <ProtectedRoute>
              <AdminSchedulePage />
            </ProtectedRoute>
          }
        />

        {/* Любой путь → логин */}
        <Route path="*" element={<LoginPage />} />

      </Routes>
    </BrowserRouter>
  );
}
