import React, { useState } from "react";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import Alert from "../../components/Alert";
import { login } from "../../api/auth";
import { useAuth } from "../../context/AuthContext";
import { useLocation, useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

export default function Login() {
  const { search } = useLocation();
  const justRegistered = new URLSearchParams(search).get("registered") === "1";
  const nav = useNavigate();
  const { signIn } = useAuth();
  const [form, setForm] = useState({ email:"", password:"" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      const { token, user } = await login(form.email.trim(), form.password);
      signIn(token, user);
      nav("/");
    } catch (err) {
      setError(err.message || "Credenciales inválidas.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid place-items-center bg-gray-50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white border p-8 shadow-sm">
        <div className="mx-auto mb-6 grid place-items-center">
          <div className="h-10 w-10 rounded-xl bg-blue-600" />
        </div>
        <h1 className="text-2xl font-semibold text-center mb-6">Sistema de Tickets</h1>

        {justRegistered && <div className="mb-4"><Alert type="success">Cuenta creada. Ya puedes iniciar sesión.</Alert></div>}
        {error && <div className="mb-4"><Alert type="error">{error}</Alert></div>}

        <form onSubmit={onSubmit} className="space-y-4">
          <Input label="Nombre de usuario" name="email" type="email" placeholder="usuario@ejemplo.com" value={form.email} onChange={onChange} />
          <Input label="Contraseña" name="password" type="password" placeholder="••••••" value={form.password} onChange={onChange} />
          <Button className="w-full" disabled={loading}>{loading ? "Entrando..." : "Iniciar Sesión"}</Button>
        </form>

        <div className="text-center mt-4">
          <Link className="text-sm text-blue-600 hover:underline" to="#">¿Olvidé mi contraseña?</Link>
        </div>
      </div>
    </div>
  );
}
