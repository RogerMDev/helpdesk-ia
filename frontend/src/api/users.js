import { api } from "./client";

export const createUser = ({ name, email, password, roleId }) =>
  api("/users", { method: "POST", body: { name, email, password, roleId } });

export const getRoles = () => api("/user-roles"); // ajusta a tu endpoint real
