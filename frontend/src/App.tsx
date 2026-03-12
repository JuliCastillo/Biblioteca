import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Login from "./pages/Login";
import Register from "./pages/Register";
import UserDashboard from "./pages/UserDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import { MfaSetup } from "./components/MfaSetup"; // Importamos el nuevo componente

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Ruta para el Dashboard de Usuario */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute requiredRole="usuario">
                <UserDashboard />
              </ProtectedRoute>
            }
          />

          {/* Nueva Ruta para Configuración de Seguridad (MFA) */}
          <Route
            path="/settings"
            element={
              <ProtectedRoute> 
                {/* Sin requiredRole para que entren ambos roles */}
                <MfaSetup />
              </ProtectedRoute>
            }
          />

          {/* Ruta para el Dashboard de Administrador */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute requiredRole="administrador">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}