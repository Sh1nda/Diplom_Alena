import { api } from "./axios";

export async function login(email, password) {
  const response = await api.post("/auth/login", {
    email: email,
    password: password
  });
  return response.data;
}
