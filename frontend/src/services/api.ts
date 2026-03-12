const API_URL = "http://localhost:3001/api";

// Interfaces actualizadas
interface User {
  id: number;
  nombre: string;
  apellido_paterno: string;
  apellido_materno: string;
  email: string;
  rol: "administrador" | "usuario";
  mfa_enabled?: boolean;
}

interface LoginResponse {
  token?: string; // Opcional porque si pide MFA, aún no hay token final
  user?: User;
  mfaRequired?: boolean; // Indica si hay que mostrar la pantalla del código
  tempToken?: string;    // Token temporal para validar el MFA
}

interface RegisterData {
  nombre: string;
  apellido_paterno: string;
  apellido_materno: string;
  edad: number;
  direccion: string;
  telefono: string;
  sexo: string;
  email: string;
  password: string;
}

// 1. LOGIN ACTUALIZADO (Soporta MFA)
export async function loginAPI(email: string, password: string): Promise<LoginResponse> {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Error al iniciar sesión");
  return data;
}

// 2. NUEVA FUNCIÓN: Verificar código MFA

// 3. REGISTRO (Ya lo tenías, se mantiene igual)
export async function registerAPI(data: RegisterData): Promise<{ message: string }> {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || "Error al registrarse");
  }
  return res.json();
}

// --- FUNCIONES DE ADMINISTRADOR ---

// Obtener lista de usuarios
export async function getUsers(token: string) {
  const res = await fetch(`${API_URL}/admin/users`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Error al obtener usuarios");
  return res.json();
}

// NUEVA: Ver Bitácora de Auditoría
export async function getBitacora(token: string) {
  const res = await fetch(`${API_URL}/admin/bitacora`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Error al obtener la bitácora");
  return res.json();
}

// NUEVA: Actualizar rol o estatus (Activo/Inactivo)
export async function updateUserAdmin(token: string, userId: number, updateData: { rol?: string, estatus?: string }) {
  const res = await fetch(`${API_URL}/admin/users/${userId}`, {
    method: "PUT",
    headers: { 
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}` 
    },
    body: JSON.stringify(updateData),
  });
  if (!res.ok) throw new Error("No se pudo actualizar el usuario");
  return res.json();
}

// 2. VERIFICAR MFA DURANTE EL LOGIN
export async function verifyMfaLoginAPI(tempToken: string, code: string): Promise<LoginResponse> {
  const res = await fetch(`${API_URL}/auth/verify-mfa-login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ tempToken, code }), // Enviamos 'code' para que coincida con el backend
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Código MFA inválido");
  return data;
}