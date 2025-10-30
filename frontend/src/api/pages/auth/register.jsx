import React, { useEffect, useState } from "react";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import Select from "../../components/ui/Select";
import Alert from "../../components/Alert";
import { createUser, getRoles } from "../../api/users";
import { Link, useNavigate } from "react-router-dom";

export default function Register() {
  const nav = useNavigate();
  const [roles, setRoles] = useState([{ value: "", label: "Seleccionar rol" }]);
  const [form, setForm] = useState({ name:"", email:"", password:"", confirm:"", roleId:"" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const data = await getRoles(); // adapta al formato real
        const opts = [{ value: "", label: "Seleccionar rol" }]
          .concat(data.map(r => ({ value: r.user_roles_id_pk ?? r.id, label: r.name })));
        setRoles(opts);
      } catch {
        // Si no hay endpoint de roles, dejamos “USER” como defecto:
        setRoles([{ value: 3, label: "USER" }]); // cambia “3” por el ID real de USER si lo sabes
      }
    })();
  }, []);

  const onChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const validate = () => {
    if (!form.name.trim()) return "El nombre es obligatorio.";
    if (!form.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) return "Email no válido.";
    if (form.password.length < 6) return "La contraseña debe tener al menos 6 caracteres.";
    if (form.password !== form.confirm) return "Las contraseñas no coinciden.";
    if (!form.roleId) return "Selecciona un rol.";
    return "";
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const v = validate();
    if (v) return setError(v);
    setError(""); setLoading(true);
    try {
      await createUser({ name: form.name.trim(), email: form.email.trim(), password: form.password, roleId: Number(form.roleId) });
      nav("/login?registered=1");
    } catch (err) {
      // típico 409 por email duplicado
      setError(err.message || "No se pudo crear la cuenta.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid place-items-center bg-gray-50 p-4">
      <div className="w-full max-w-3xl rounded-2xl bg-white border p-8 shadow-sm">
        <h1 className="text-2xl font-semibold text-center mb-2">Crear Cuenta</h1>
        <p className="text-center text-gray-500 mb-8">Completa los siguientes campos</p>

        {error && <div className="mb-4"><Alert type="error">{error}</Alert></div>}

        <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="Nombre" name="name" placeholder="Nombre" value={form.name} onChange={onChange} />

          {/* UI-only por si quieres mostrar Apellidos (no se envía aún) */}
          <Input label="Apellidos (opcional)" name="lastName" placeholder="Apellidos" onChange={onChange} />

          <div className="md:col-span-2">
            <Input label="Email" name="email" type="email" placeholder="email@ejemplo.com" value={form.email} onChange={onChange} />
          </div>

          {/* UI-only: Teléfono (no se envía) */}
          <Input label="Teléfono (opcional)" name="phone" placeholder="+34 600 000 000" />

          <Input label="Contraseña" name="password" type="password" placeholder="••••••" value={form.password} onChange={onChange} />
          <Input label="Confirmar contraseña" name="confirm" type="password" placeholder="••••••" value={form.confirm} onChange={onChange} />

          {/* roleId requerido por la BBDD */}
          <div className="md:col-span-2">
            <Select label="Rol" value={form.roleId} onChange={onChange} name="roleId" options={roles} />
          </div>

          {/* UI-only: Departamento (no se envía) */}
          <div className="md:col-span-2">
            <Select label="Departamento (opcional)" value="" onChange={()=>{}} options={[
              { value:"", label:"Seleccionar departamento" },
              { value:"it", label:"IT" },
              { value:"hr", label:"RRHH" },
            ]} />
          </div>

          <div className="md:col-span-2 flex gap-3 mt-2">
            <Button variant="ghost" type="button" className="flex-1">Cancelar</Button>
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? "Creando..." : "Registrarse"}
            </Button>
          </div>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          ¿Ya tienes cuenta? <Link className="text-blue-600 hover:underline" to="/login">Inicia sesión</Link>
        </p>
      </div>
    </div>
  );
}
