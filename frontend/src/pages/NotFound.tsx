import { useNavigate } from "react-router-dom";
import { Home, AlertTriangle } from "lucide-react";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background to-card">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-destructive/10 border border-destructive/20 mb-6">
          <AlertTriangle className="w-12 h-12 text-destructive" />
        </div>
        <h1 className="text-4xl font-bold mb-2">404 - No Encontrado</h1>
        <p className="text-muted-foreground mb-6">La página que buscas no existe o ha sido movida.</p>
        <button
          onClick={() => navigate("/")}
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition"
        >
          <Home className="w-4 h-4" />
          Volver al Inicio
        </button>
      </div>
    </div>
  );
}
