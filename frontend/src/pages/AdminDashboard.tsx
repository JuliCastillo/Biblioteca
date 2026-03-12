import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getUsers } from "@/services/api";
import { Shield, LogOut, Users, AlertCircle } from "lucide-react";
interface UserRecord {
  id: number;
  nombre: string;
  apellido_paterno: string;
  apellido_materno: string;
  edad: number;
  direccion: string;
  telefono: string;
  sexo: string;
  email: string;
  rol: string;
}
const AdminDashboard = () => {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [error, setError] = useState("");
  useEffect(() => {
    if (token) {
      getUsers(token)
        .then(setUsers)
        .catch(() => setError("Error al cargar usuarios"));
    }
  }, [token]);
  const handleLogout = () => {
    logout();
    navigate("/");
  };
  if (!user) return null;
  return (
    <div className="min-h-screen p-4 md:p-8 relative">
      <div className="absolute inset-0 bg-gradient-to-br from-background via-card/30 to-background" />
      <div className="max-w-5xl mx-auto relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center">
              <Shield className="w-5 h-5 text-accent" />
            </div>
            <div>
              <h1 className="text-lg font-bold font-mono text-gradient">Panel de Administración</h1>
              <p className="text-xs text-muted-foreground">Gestión de usuarios del sistema</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 text-sm bg-destructive/10 text-destructive border border-destructive/20 rounded-md hover:bg-destructive/20 transition-all"
          >
            <LogOut className="w-4 h-4" />
            Cerrar Sesión
          </button>
        </div>
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          <div className="glass-card p-4">
            <p className="text-xs text-muted-foreground">Total Usuarios</p>
            <p className="text-2xl font-bold font-mono text-primary">{users.length}</p>
          </div>
          <div className="glass-card p-4">
            <p className="text-xs text-muted-foreground">Administradores</p>
            <p className="text-2xl font-bold font-mono text-accent">{users.filter((u) => u.rol === "administrador").length}</p>
          </div>
          <div className="glass-card p-4">
            <p className="text-xs text-muted-foreground">Usuarios Regulares</p>
            <p className="text-2xl font-bold font-mono text-foreground">{users.filter((u) => u.rol === "usuario").length}</p>
          </div>
        </div>
        {/* Users Table */}
        <div className="glass-card overflow-hidden">
          <div className="flex items-center gap-2 p-4 border-b border-border">
            <Users className="w-4 h-4 text-primary" />
            <h2 className="font-semibold text-foreground">Usuarios Registrados</h2>
          </div>
          {error && (
            <div className="flex items-center gap-2 p-3 m-4 rounded-md bg-destructive/10 border border-destructive/20 text-destructive text-sm">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left p-3 text-xs text-muted-foreground font-medium">ID</th>
                  <th className="text-left p-3 text-xs text-muted-foreground font-medium">Nombre</th>
                  <th className="text-left p-3 text-xs text-muted-foreground font-medium">Email</th>
                  <th className="text-left p-3 text-xs text-muted-foreground font-medium">Teléfono</th>
                  <th className="text-left p-3 text-xs text-muted-foreground font-medium">Sexo</th>
                  <th className="text-left p-3 text-xs text-muted-foreground font-medium">Rol</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                    <td className="p-3 font-mono text-muted-foreground">#{u.id}</td>
                    <td className="p-3 text-foreground">{u.nombre} {u.apellido_paterno} {u.apellido_materno}</td>
                    <td className="p-3 text-muted-foreground">{u.email}</td>
                    <td className="p-3 text-muted-foreground">{u.telefono}</td>
                    <td className="p-3 text-muted-foreground">{u.sexo}</td>
                    <td className="p-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-mono border ${
                        u.rol === "administrador"
                          ? "bg-accent/10 text-accent border-accent/20"
                          : "bg-primary/10 text-primary border-primary/20"
                      }`}>
                        {u.rol}
                      </span>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && !error && (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-muted-foreground text-sm">
                      No hay usuarios registrados aún
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
export default AdminDashboard;
