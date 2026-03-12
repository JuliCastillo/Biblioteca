import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { User, LogOut, Shield, Mail, Lock, ShieldCheck } from "lucide-react"; // Añadí iconos

const UserDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  if (!user) return null;

  return (
    <div className="min-h-screen p-4 md:p-8 relative">
      <div className="absolute inset-0 bg-gradient-to-br from-background via-card/30 to-background" />
      <div className="max-w-2xl mx-auto relative z-10">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
              <User className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-bold font-mono text-gradient">Panel de Usuario</h1>
              <p className="text-xs text-muted-foreground">Bienvenido, {user.nombre}</p>
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

        <div className="space-y-6">
          {/* Profile Card */}
          <div className="glass-card p-6 glow-primary">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="w-4 h-4 text-primary" />
              <h2 className="font-semibold text-foreground">Mi Perfil</h2>
              <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 font-mono">
                {user.rol}
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InfoItem label="Nombre Completo" value={`${user.nombre} ${user.apellido_paterno} ${user.apellido_materno}`} icon={<User className="w-3.5 h-3.5" />} />
              <InfoItem label="Correo Electrónico" value={user.email} icon={<Mail className="w-3.5 h-3.5" />} />
              <InfoItem label="ID de Usuario" value={`#${user.id}`} icon={<Shield className="w-3.5 h-3.5" />} />
            </div>
          </div>

          {/* NUEVA SECCIÓN: Seguridad / MFA */}
          <div className="glass-card p-6 border-accent/20 border hover:shadow-[0_0_15px_rgba(var(--accent),0.1)] transition-all">
            <div className="flex items-center gap-2 mb-4">
              <Lock className="w-4 h-4 text-accent" />
              <h2 className="font-semibold text-foreground">Seguridad de la Cuenta</h2>
            </div>
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm text-foreground font-medium">Autenticación de Dos Factores (MFA)</p>
                <p className="text-xs text-muted-foreground">Añade una capa extra protegiendo tu acceso con un código de tu celular.</p>
              </div>
              <button
                onClick={() => navigate("/settings")}
                className="flex items-center gap-2 px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-all font-medium"
              >
                <ShieldCheck className="w-4 h-4" />
                Configurar
              </button>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground/50 mt-8 font-mono">
          🔒 Sesión protegida con JWT
        </p>
      </div>
    </div>
  );
};

// ... la funcion InfoItem se queda igual ...
function InfoItem({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="p-3 bg-muted/30 rounded-md border border-border/50">
      <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
        {icon}
        <span className="text-xs">{label}</span>
      </div>
      <p className="text-sm font-medium text-foreground">{value}</p>
    </div>
  );
}
export default UserDashboard;
