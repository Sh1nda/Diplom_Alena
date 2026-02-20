import { api } from "./axios";

export async function listRooms() {
  const res = await api.get("/rooms");
  return res.data;
}

export async function createRoom(data) {
  const res = await api.post("/rooms", data);
  return res.data;
}
