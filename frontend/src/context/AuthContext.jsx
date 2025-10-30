import React, { createContext, useContext, useState } from "react";

const AuthCtx = createContext(null);
export const useAuth = () => useContext(AuthCtx);
export default function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const value = { user, token, loading: false,
    signIn: (tk, u) => { setToken(tk); setUser(u); },
    signOut: () => { setToken(null); setUser(null); }
  };
  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}
