import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import Home from "../pages/Home";
import { useAuth } from "../context/AuthContext";

function Private({ children }) {
  const { token, loading } = useAuth();
  if (loading) return null;
  return token ? children : <Navigate to="/login" replace />;
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<Private><Home /></Private>} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}
