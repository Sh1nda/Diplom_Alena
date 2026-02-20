import { api } from "./axios";

export async function getMyBookings() {
  const res = await api.get("/bookings/my");
  return res.data;
}

export async function getAllBookings(status) {
  const params = {};
  if (status) params.status_filter = status;
  const res = await api.get("/bookings", { params });
  return res.data;
}

export async function approveBooking(id) {
  const res = await api.post(`/bookings/${id}/approve`);
  return res.data;
}

export async function rejectBooking(id) {
  const res = await api.post(`/bookings/${id}/reject`);
  return res.data;
}

export async function createBooking(payload) {
  const res = await api.post("/bookings", payload);
  return res.data;
}
