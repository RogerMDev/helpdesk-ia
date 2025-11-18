// src/api/auth.js
const API_URL = import.meta.env.VITE_API_URL;

export async function registerUser(payload) {
  const res = await fetch(`${API_URL}/api/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    let error;
    try {
      error = await res.json();
    } catch {
      error = { message: 'Error desconocido' };
    }
    throw { status: res.status, ...error };
  }

  return res.json();
}

export async function loginUser(payload) {
  const res = await fetch(`${API_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    let error;
    try {
      error = await res.json();
    } catch {
      error = { message: 'Error desconocido' };
    }
    throw { status: res.status, ...error };
  }

  return res.json();
}
