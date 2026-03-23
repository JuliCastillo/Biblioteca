import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { User, LogOut, Shield, Mail, Lock, ShieldCheck, Edit2, Save, X, Phone } from "lucide-react";
import { updateProfileAPI } from "@/services/api"; // Debes crear esta función en api.ts

const UserDashboard = () => {
  const { user, logout, token, updateUser } = useAuth();
  const activeToken = token || "";
  const navigate = useNavigate();
  
  // Estados para edición 
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    nombre: user?.nombre || "",
    apellido_paterno: user?.apellido_paterno || "",
    apellido_materno: user?.apellido_materno || "",
    email: user?.email || "",
    telefono: user?.telefono || "",
    password: ""
  });
  const [mfaCode, setMfaCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  // useEffect para sincronizar formData con user
  useEffect(() => {
    if (user) {
      setFormData({
        nombre: user.nombre || "",
        apellido_paterno: user.apellido_paterno || "",
        apellido_materno: user.apellido_materno || "",
        email: user.email || "",
        telefono: user.telefono || "",
        password: ""
      });
    }
  }, [user]);

  if (!user) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      // Llamada a la API (pasa el token para el middleware verifyToken)
      await updateProfileAPI(activeToken, { ...formData, mfaCode });

      // Actualiza el usuario local en el contexto
      updateUser({
        nombre: formData.nombre,
        apellido_paterno: formData.apellido_paterno,
        apellido_materno: formData.apellido_materno,
        email: formData.email,
        telefono: formData.telefono,
      });

      setMessage({ type: "success", text: "Perfil actualizado. Reinicie sesión para ver cambios." });
      setIsEditing(false);
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Error al actualizar" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-8 relative">
      <div className="absolute inset-0 bg-gradient-to-br from-background via-card/30 to-background" />
      <div className="max-w-2xl mx-auto relative z-10">
        
        {/* Header con Logout */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center"><User className="w-5 h-5 text-primary" /></div>
            <div>
              <h1 className="text-lg font-bold font-mono text-gradient">Panel de Usuario</h1>
              <p className="text-xs text-muted-foreground">Sesión de {user.nombre}</p>
            </div>
          </div>
          <button onClick={() => { logout(); navigate("/"); }} className="flex items-center gap-2 px-3 py-1.5 text-xs bg-destructive/10 text-destructive border border-destructive/20 rounded-md hover:bg-destructive/20 transition-all">
            <LogOut className="w-3.5 h-3.5" /> Cerrar Sesión
          </button>
        </div>

        {message.text && (
          <div className={`p-3 rounded-md mb-4 text-sm border ${message.type === 'success' ? 'bg-green-500/10 border-green-500/20 text-green-500' : 'bg-red-500/10 border-red-500/20 text-red-500'}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          <div className="glass-card p-6 glow-primary">
            <div className="flex items-center gap-2 mb-6">
              <Shield className="w-4 h-4 text-primary" />
              <h2 className="font-semibold text-foreground">Información Personal</h2>
              {!isEditing ? (
                <button type="button" onClick={() => setIsEditing(true)} className="ml-auto flex items-center gap-1 text-xs text-primary hover:underline"><Edit2 className="w-3 h-3" /> Editar</button>
              ) : (
                <button type="button" onClick={() => setIsEditing(false)} className="ml-auto flex items-center gap-1 text-xs text-muted-foreground hover:underline"><X className="w-3 h-3" /> Cancelar</button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <EditableItem label="Nombre" name="nombre" value={formData.nombre} isEditing={isEditing} onChange={(val) => setFormData({...formData, nombre: val})} />
              <EditableItem label="A. Paterno" name="apellido_paterno" value={formData.apellido_paterno} isEditing={isEditing} onChange={(val) => setFormData({...formData, apellido_paterno: val})} />
              <EditableItem label="A. Materno" name="apellido_materno" value={formData.apellido_materno} isEditing={isEditing} onChange={(val) => setFormData({...formData, apellido_materno: val})} />
              <EditableItem label="Teléfono" name="telefono" value={formData.telefono} isEditing={isEditing} onChange={(val) => setFormData({...formData, telefono: val})} />
              <EditableItem label="Email" name="email" value={formData.email} isEditing={isEditing} onChange={(val) => setFormData({...formData, email: val})} />
              {isEditing && <EditableItem label="Nueva Contraseña" name="password" value={formData.password} isEditing={true} type="password" onChange={(val) => setFormData({...formData, password: val})} />}
            </div>

            {isEditing && user.mfa_enabled && (
              <div className="mt-6 p-4 bg-accent/5 border border-accent/20 rounded-md">
                <label className="text-xs font-bold text-accent mb-2 block uppercase">Confirmación MFA Requerida</label>
                <input 
                  type="text" 
                  placeholder="Código de 6 dígitos" 
                  className="w-full bg-background border border-accent/30 rounded px-3 py-2 text-center font-mono tracking-widest"
                  value={mfaCode}
                  onChange={(e) => setMfaCode(e.target.value)}
                  maxLength={6}
                  required
                />
              </div>
            )}

            {isEditing && (
              <button disabled={loading} type="submit" className="w-full mt-6 flex items-center justify-center gap-2 py-2.5 bg-primary text-primary-foreground rounded-md font-medium hover:opacity-90">
                <Save className="w-4 h-4" /> {loading ? "Guardando..." : "Guardar Cambios"}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

function EditableItem({ label, value, isEditing, onChange, type = "text", name }: { 
  label: string; 
  value: string; 
  isEditing: boolean; 
  onChange: (val: string) => void; 
  type?: string;
  name?: string; // <--- Añadimos esto para que no marque error
}) {
  return (
    <div className="space-y-1">
      <span className="text-[10px] uppercase font-bold text-muted-foreground/70 ml-1">{label}</span>
      {isEditing ? (
        <input 
          name={name} // Ahora TS ya sabe qué es 'name'
          type={type} 
          className="w-full bg-background/50 border border-border rounded px-3 py-1.5 text-sm outline-none focus:ring-1 focus:ring-primary"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <div className="px-3 py-1.5 bg-muted/20 border border-transparent text-sm text-foreground rounded">
          {value || "---"}
        </div>
      )}
    </div>
  );
}


export default UserDashboard;