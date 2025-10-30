import { api } from "./client";

export const login = (email, password) =>
  api("/auth/login", { method: "POST", body: { email, password } });

export const me = (token) => api("/auth/me", { token });
