import { api } from "./axios";

export async function getTeacherSchedule() {
  const res = await api.get("/schedule/teacher");
  return res.data;
}

export async function getAllSchedule() {
  const res = await api.get("/schedule/all");
  return res.data;
}

export async function getGroupSchedule(groupId) {
  const res = await api.get(`/schedule/group/${groupId}`);
  return res.data;
}
