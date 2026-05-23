import api from "../api/axios";

export async function follow(handle) {
  const { data } = await api.post(`/users/${handle}/follow`);
  const detail = { handle, data };
  window.dispatchEvent(new CustomEvent("follow:update", { detail }));
  return data;
}

export async function unfollow(handle) {
  const { data } = await api.delete(`/users/${handle}/follow`);
  const detail = { handle, data };
  window.dispatchEvent(new CustomEvent("follow:update", { detail }));
  return data;
}

export function onFollowUpdate(cb) {
  const handler = (e) => cb(e.detail);
  window.addEventListener("follow:update", handler);
  return () => window.removeEventListener("follow:update", handler);
}
