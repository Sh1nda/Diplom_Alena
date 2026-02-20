import { useState } from "react";
import { login } from "../api/auth";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      const data = await login(email, password);
      localStorage.setItem("token", data.access_token);
      navigate("/admin/bookings");
    } catch (e) {
      console.error(e);
      alert("Ошибка входа");
    }
  }

  return (
    <div style={{ maxWidth: 320, margin: "100px auto" }}>
      <h2>Вход</h2>
      <form onSubmit={handleSubmit}>
        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ width: "100%", marginBottom: 8 }}
        />
        <input
          placeholder="Пароль"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ width: "100%", marginBottom: 8 }}
        />
        <button type="submit" style={{ width: "100%" }}>
          Войти
        </button>
      </form>
    </div>
  );
}
