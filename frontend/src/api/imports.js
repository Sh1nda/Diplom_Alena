import { api } from "./axios";

export async function importSchedule(file) {
  const formData = new FormData();
  formData.append("file", file);
  const res = await api.post("/import/schedule", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}

export async function importAssignments(file) {
  const formData = new FormData();
  formData.append("file", file);
  const res = await api.post("/import/assignments", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}
