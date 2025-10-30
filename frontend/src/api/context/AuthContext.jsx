import React, { createContext, useContext, useEffect, useState } from "react";
import { me } from "../api/auth";

const AuthCtx = createContext(null);
export const useAuth = () => useContext(AuthCtx);

export default function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [user, setUser]   = useState(null);
  const [loading, setLoading] = useState(!!token);

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        if (token) {
          const u = await me(token);
          if (active) setUser(u);
        }
      } catch {
        setToken(null);
        localStorage.removeItem("token");
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => { active = false; };
  }, [token]);

  const value = {
    user, token, loading,
    signIn: (tk, u) => {
      setToken(tk); localStorage.setItem("token", tk); setUser(u);
    },
    signOut: () => {
      setUser(null); setToken(null); localStorage.removeItem("token");
    }
  };
  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}
