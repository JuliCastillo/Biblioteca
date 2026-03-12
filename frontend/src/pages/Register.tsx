import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { registerAPI } from "@/services/api";
import { Shield, UserPlus, AlertCircle, CheckCircle } from "lucide-react";
const Register = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    nombre: "",
    apellido_paterno: "",
    apellido_materno: "",
    edad: "",
    direccion: "",
    telefono: "",
    sexo: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      const data = { ...form, edad: parseInt(form.edad) };
      await registerAPI(data);
      setSuccess("¡Registro exitoso! Redirigiendo al login...");
      setTimeout(() => navigate("/"), 2000);
    } catch (err: any) {
      setError(err.message || "Error al registrarse");
    } finally {
      setLoading(false);
    }
  };
  const inputClass =
    "w-full px-3 py-2.5 bg-muted/50 border border-border rounded-md text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all text-sm";
  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-background via-card to-background" />
      <div className="absolute top-1/3 -right-32 w-64 h-64 bg-accent/5 rounded-full blur-3xl animate-pulse-glow" />
      <div className="w-full max-w-lg relative z-10">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-accent/10 border border-accent/20 mb-3 glow-accent">
            <Shield className="w-7 h-7 text-accent" />
          </div>
          <h1 className="text-xl font-bold font-mono text-gradient">Registro de Usuario</h1>
          <p className="text-muted-foreground text-sm mt-1">Crea tu cuenta de forma segura</p>
        </div>
        <div className="glass-card p-6 glow-accent">
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-md bg-destructive/10 border border-destructive/20 text-destructive text-sm mb-4">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}
          {success && (
            <div className="flex items-center gap-2 p-3 rounded-md bg-success/10 border border-success/20 text-success text-sm mb-4">
              <CheckCircle className="w-4 h-4 shrink-0" />
              {success}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Nombre</label>
                <input name="nombre" value={form.nombre} onChange={handleChange} required placeholder="Juan" className={inputClass} />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Apellido Paterno</label>
                <input name="apellido_paterno" value={form.apellido_paterno} onChange={handleChange} required placeholder="Pérez" className={inputClass} />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Apellido Materno</label>
                <input name="apellido_materno" value={form.apellido_materno} onChange={handleChange} required placeholder="López" className={inputClass} />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Edad</label>
                <input name="edad" type="number" min="1" max="120" value={form.edad} onChange={handleChange} required placeholder="25" className={inputClass} />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Sexo</label>
                <select name="sexo" value={form.sexo} onChange={handleChange} required className={inputClass}>
                  <option value="">Seleccionar</option>
                  <option value="Masculino">Masculino</option>
                  <option value="Femenino">Femenino</option>
                  <option value="Otro">Otro</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Teléfono</label>
                <input name="telefono" value={form.telefono} onChange={handleChange} required placeholder="5512345678" className={inputClass} />
              </div>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Dirección</label>
              <input name="direccion" value={form.direccion} onChange={handleChange} required placeholder="Calle 123, Col. Centro" className={inputClass} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Correo Electrónico</label>
              <input name="email" type="email" value={form.email} onChange={handleChange} required placeholder="correo@ejemplo.com" className={inputClass} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Contraseña</label>
              <input name="password" type="password" value={form.password} onChange={handleChange} required placeholder="Mínimo 6 caracteres" minLength={6} className={inputClass} />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-accent text-accent-foreground font-medium rounded-md hover:bg-accent/90 transition-all disabled:opacity-50 text-sm mt-2"
            >
              <UserPlus className="w-4 h-4" />
              {loading ? "Registrando..." : "Crear Cuenta"}
            </button>
          </form>
          <div className="mt-4 pt-3 border-t border-border text-center">
            <p className="text-sm text-muted-foreground">
              ¿Ya tienes cuenta?{" "}
              <Link to="/" className="text-primary hover:text-primary/80 font-medium transition-colors">
                Inicia sesión
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Register;
