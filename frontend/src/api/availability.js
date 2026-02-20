import { api } from "./axios";

export async function getFreeRooms(start, end) {
  const res = await api.get("/availability/rooms", {
    params: { start, end },
  });
  return res.data;
}
