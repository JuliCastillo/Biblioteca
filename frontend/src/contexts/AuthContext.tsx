import { createContext, useContext, useState, useEffect, ReactNode } from "react";

// Interfaz de Usuario completa para que TS no marque error
interface User {
  id: number;
  nombre: string;
  apellido_paterno: string;
  apellido_materno: string;
  email: string;
  telefono: string;
  rol: "administrador" | "usuario";
  mfa_enabled: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  updateUser: (newData: Partial<User>) => void; // <-- Nueva función
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
  const savedToken = localStorage.getItem("token");
  const savedUser = localStorage.getItem("user");

  if (savedToken && savedUser) {
    try {
      const parsedUser = JSON.parse(savedUser);
      // Solo si el usuario tiene datos válidos, los cargamos
      if (parsedUser.nombre) {
        setToken(savedToken);
        setUser(parsedUser);
      }
    } catch (e) {
      console.error("Error cargando sesión", e);
      localStorage.clear(); // Si hay error, mejor limpiar todo
    }
  }
}, []);

  const login = (newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem("token", newToken);
    localStorage.setItem("user", JSON.stringify(newUser));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  // ESTA FUNCIÓN ES LA QUE EVITA QUE LOS DATOS SE PIERDAN AL EDITAR
  const updateUser = (newData: Partial<User>) => {
    setUser((prevUser) => {
      if (!prevUser) return null;
      const updated = { ...prevUser, ...newData };
      localStorage.setItem("user", JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, updateUser, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}