import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { loginAPI, verifyMfaLoginAPI } from "@/services/api"; // Asegúrate de tener esta función en api.ts
import { Shield, Mail, Lock, LogIn, AlertCircle, KeyRound } from "lucide-react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mfaCode, setMfaCode] = useState(""); // Nuevo: código de 6 dígitos
  const [showMfa, setShowMfa] = useState(false); // Nuevo: control de vista
  const [tempToken, setTempToken] = useState(""); // Nuevo: token temporal
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  // PASO 1: Login inicial
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const response = await loginAPI(email, password);

      // Si el backend dice que falta MFA
      if (response.mfaRequired) {
        // response.tempToken es opcional según el tipo
        setTempToken(response.tempToken || "");
        setShowMfa(true);
        setLoading(false);
        return; 
      }

      // Si no requiere MFA (Login directo)
      if (!response.token || !response.user) {
        throw new Error("No se recibió token/usuario en la respuesta");
      }
      login(response.token, response.user);
      navigate(response.user.rol === "administrador" ? "/admin" : "/dashboard");
    } catch (err: any) {
      setError(err.message || "Credenciales inválidas");
    } finally {
      setLoading(false);
    }
  };

  // PASO 2: Verificación de código (el 123456)
  const handleMfaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      // Llamamos a la nueva ruta del backend pasándole el tempToken y el código
      const response = await verifyMfaLoginAPI(tempToken, mfaCode);
      if (!response.token || !response.user) {
        throw new Error("No se recibió token/usuario al verificar MFA");
      }
      login(response.token, response.user);
      navigate(response.user.rol === "administrador" ? "/admin" : "/dashboard");
    } catch (err: any) {
      setError(err.message || "Código incorrecto");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-background via-card to-background" />
      
      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 mb-4 glow-primary">
            <Shield className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold font-mono">
            <span className="text-gradient">Biblioteca</span>
          </h1>
          <p className="text-muted-foreground text-sm mt-1">Gestión de Libros</p>
        </div>

        <div className="glass-card p-8 glow-primary">
          <h2 className="text-lg font-semibold mb-6 text-foreground">
            {showMfa ? "Verificación de Seguridad" : "Iniciar Sesión"}
          </h2>

          {error && (
            <div className="flex items-center gap-2 p-3 rounded-md bg-destructive/10 border border-destructive/20 text-destructive text-sm mb-4">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          {!showMfa ? (
            /* FORMULARIO DE LOGIN NORMAL */
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm text-muted-foreground mb-1.5 block">Correo Electrónico</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="correo@ejemplo.com"
                    required
                    className="w-full pl-10 pr-4 py-2.5 bg-muted/50 border border-border rounded-md text-foreground text-sm outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1.5 block">Contraseña</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full pl-10 pr-4 py-2.5 bg-muted/50 border border-border rounded-md text-foreground text-sm outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-primary text-primary-foreground font-medium rounded-md hover:bg-primary/90 transition-all text-sm"
              >
                <LogIn className="w-4 h-4" />
                {loading ? "Ingresando..." : "Acceder"}
              </button>
            </form>
          ) : (
            /* FORMULARIO DE MFA (El que te faltaba) */
            <form onSubmit={handleMfaSubmit} className="space-y-4">
              <p className="text-xs text-muted-foreground text-center mb-4">
                Ingresa el código de 6 dígitos de tu autenticador.
              </p>
              <div>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    value={mfaCode}
                    onChange={(e) => setMfaCode(e.target.value)}
                    placeholder="000000"
                    maxLength={6}
                    required
                    autoFocus
                    className="w-full pl-10 pr-4 py-3 bg-muted/50 border border-border rounded-md text-foreground text-center text-xl tracking-[0.5em] font-bold outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-accent text-accent-foreground font-medium rounded-md hover:bg-accent/90 transition-all text-sm"
              >
                {loading ? "Verificando..." : "Confirmar Código"}
              </button>
              <button
                type="button"
                onClick={() => setShowMfa(false)}
                className="w-full text-xs text-muted-foreground hover:text-foreground underline"
              >
                Volver al login
              </button>
            </form>
          )}

          {!showMfa && (
            <div className="mt-6 pt-4 border-t border-border text-center">
              <p className="text-sm text-muted-foreground">
                ¿No tienes cuenta? <Link to="/register" className="text-primary font-medium">Regístrate</Link>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;