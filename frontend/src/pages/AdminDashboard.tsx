import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getUsers, updateUserAdmin, getBitacora } from "@/services/api";
import { 
  Shield, 
  LogOut, 
  Users, 
  UserPlus, 
  QrCode, 
  Power, 
  History, 
  ShieldCheck,
  ShieldAlert,
  X,
  Check,
  RefreshCw
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

const AdminDashboard = () => {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [logs, setLogs] = useState([]);
  const [error, setError] = useState("");
  const [loadingLogs, setLoadingLogs] = useState(false);

  const loadData = async () => {
    try {
      const [dataUsers, dataLogs] = await Promise.all([
        getUsers(token || ""),
        getBitacora(token || "")
      ]);
      setUsers(dataUsers);
      setLogs(dataLogs);
    } catch (err) {
      setError("Error al cargar datos de auditoría");
    }
  };

  useEffect(() => {
    if (token) loadData();
  }, [token]);

  const [showQRModal, setShowQRModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);

  const openQRModal = (user: any) => {
    setSelectedUser(user);
    setShowQRModal(true);
  };

  const confirmActivation = async () => {
    if (!selectedUser || !token) return;
    try {
      const response = await fetch(`http://localhost:3001/api/admin/users/${selectedUser.id}/activate-mfa`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (response.ok) {
        setShowQRModal(false);
        setSelectedUser(null);
        loadData();
      } else {
        alert('No se pudo activar la seguridad.');
      }
    } catch (error) {
      alert('Error al activar');
    }
  };

  const loadLogs = async () => {
    setLoadingLogs(true);
    try {
      const data = await getBitacora(token || "");
      setLogs(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingLogs(false);
    }
  };

  const handleAction = async (id: number, update: any) => {
    await updateUserAdmin(token || "", id, update);
    loadData();
  };

  if (!user) return null;

  return (
    // Fondo cambiado a gris muy claro y texto a gris oscuro
    <div className="min-h-screen bg-gray-50 text-gray-800 p-6 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* HEADER: Blanco con sombra suave */}
        <header className="flex justify-between items-center bg-white border border-gray-200 p-5 rounded-2xl shadow-sm">
          <div className="flex items-center gap-4">
            <div className="bg-amber-100 p-3 rounded-lg border border-amber-200">
              <Shield className="text-amber-600 w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tighter text-gray-900">SISTEMA ADMINISTRATIVO</h1>
              <p className="text-[10px] text-amber-600 font-bold font-mono">AUTORIZADO: {user.nombre.toUpperCase()}</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={() => navigate("/register")} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-all shadow-md">
              <UserPlus size={16}/> Crear Usuario
            </button>
            <button onClick={logout} className="p-2 bg-red-50 text-red-600 border border-red-100 rounded-lg hover:bg-red-600 hover:text-white transition-all">
              <LogOut size={20} />
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* GESTIÓN DE USUARIOS */}
          <section className="lg:col-span-3 bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex items-center gap-2">
              <Users size={18} className="text-blue-600"/>
              <h2 className="font-bold text-sm uppercase tracking-wider text-gray-700">Control de Usuarios Existentes</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-gray-500 border-b border-gray-100 bg-gray-50">
                    <th className="p-4 font-semibold text-left">Identidad</th>
                    <th className="p-4 font-semibold text-left">Ubicación / Contacto</th>
                    <th className="p-4 font-semibold text-center">Rol</th>
                    <th className="p-4 font-semibold text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {users.map((u: any) => (
                    <tr key={u.id} className="hover:bg-blue-50/30 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-gray-900">{u.nombre} {u.apellido_paterno}</span>
                          {Number(u.mfa_enabled) === 1 ? (
                            <span className="flex items-center gap-1 text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full border border-green-200">
                              <ShieldCheck size={12} /> PROTEGIDO
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full border border-gray-200">
                              <ShieldAlert size={12} /> SIN QR
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-gray-500">{u.email}</div>
                      </td>
                      <td className="p-4">
                        <div className="text-gray-700">{u.direccion}</div>
                        <div className="text-[10px] text-gray-400">Tel: {u.telefono}</div>
                      </td>
                      <td className="p-4 text-center">
                        <select 
                          className="bg-white border border-gray-200 rounded px-2 py-1 text-[10px] text-blue-700 outline-none focus:ring-2 focus:ring-blue-100"
                          value={u.rol}
                          onChange={(e) => handleAction(u.id, { rol: e.target.value })}
                        >
                          <option value="usuario">USUARIO</option>
                          <option value="administrador">ADMIN</option>
                        </select>
                      </td>
                      <td className="p-4">
                        <div className="flex justify-center gap-3">
                          <button 
                            onClick={() => handleAction(u.id, { estatus: u.estatus === 'activo' ? 'inactivo' : 'activo' })}
                            className={`p-2 rounded-md border transition-all ${u.estatus === 'activo' ? 'border-green-200 text-green-600 bg-green-50 hover:bg-green-600 hover:text-white' : 'border-red-200 text-red-600 bg-red-50 hover:bg-red-600 hover:text-white'}`}
                            title={u.estatus === 'activo' ? 'Suspender Cuenta' : 'Activar Cuenta'}
                          >
                            <Power size={14}/>
                          </button>
                          <div className="text-center">
                            {Number(u.mfa_enabled) !== 1 && (
                              <button 
                                onClick={() => openQRModal(u)}
                                className="p-2 rounded-md border border-amber-200 text-amber-600 bg-amber-50 hover:bg-amber-500 hover:text-white transition-all"
                                title="Generar Seguridad QR"
                              >
                                <QrCode size={16}/>
                              </button>
                            )}
                            {Number(u.mfa_enabled) === 1 && (
                              <div className="text-green-600">
                                <Check size={16} className="mx-auto" />
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* BITÁCORA LATERAL */}
          <aside className="bg-white border border-gray-200 rounded-2xl flex flex-col shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex items-center gap-2">
              <History size={18} className="text-purple-600"/>
              <h2 className="font-bold text-sm uppercase tracking-wider text-gray-700">Eventos</h2>
            </div>
            <div className="p-4 flex-1 overflow-y-auto max-h-[600px] space-y-4">
              {logs.length > 0 ? logs.slice(0, 5).map((log: any) => (
                <div key={log.id} className="relative pl-3 border-l-2 border-purple-200 space-y-1">
                  <div className="flex justify-between items-start">
                    <span className="text-[9px] font-mono text-gray-400">{new Date(log.fecha).toLocaleTimeString()}</span>
                    <span className="text-[8px] bg-purple-50 text-purple-600 px-1 rounded border border-purple-100 font-bold">{log.accion}</span>
                  </div>
                  <p className="text-[10px] text-gray-600 leading-tight italic">"{log.detalle}"</p>
                </div>
              )) : (
                <p className="text-center text-gray-400 text-[10px] mt-10">Sin registros</p>
              )}
            </div>
          </aside>
        </div>

        {/* BITÁCORA DE INTERACCIONES INFERIOR */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm flex flex-col h-[500px] overflow-hidden">
          <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <History size={18} className="text-purple-600" />
              <h2 className="font-bold text-sm uppercase tracking-wider text-gray-800">Bitácora de Interacciones</h2>
            </div>
            <button 
              onClick={loadLogs} 
              disabled={loadingLogs}
              className="p-1.5 hover:bg-gray-200 rounded-md transition-all text-gray-500"
            >
              <RefreshCw size={16} className={loadingLogs ? "animate-spin" : ""} />
            </button>
          </div>

          <div className="p-4 flex-1 overflow-y-auto font-mono text-xs space-y-3 bg-white">
            {logs.length === 0 ? (
              <p className="text-center text-gray-400 mt-10">No hay registros de auditoría aún.</p>
            ) : (
              logs.map((log: any) => (
                <div key={log.id} className="p-3 bg-gray-50 border border-gray-100 border-l-4 border-l-purple-500 rounded-md flex flex-col gap-1">
                  <div className="flex justify-between items-start">
                    <span className="text-purple-700 font-bold">[{log.accion}]</span>
                    <span className="text-gray-400 text-[10px]">
                      {new Date(log.fecha).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-gray-700">{log.detalle}</p>
                  <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                    <span>Usuario: {log.usuario_email || 'Sistema'}</span>
                    <span>IP: {log.ip || '0.0.0.0'}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* MODAL QR: Fondo blanco con overlay oscuro suave */}
        {showQRModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-900/60 backdrop-blur-[2px] p-4">
            <div className="bg-white border border-gray-200 p-8 rounded-2xl max-w-sm w-full text-center space-y-6 shadow-2xl">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-gray-900">Seguridad QR</h3>
                <button onClick={() => setShowQRModal(false)} className="text-gray-400 hover:text-gray-600">
                  <X size={20} />
                </button>
              </div>

              <div className="bg-gray-50 p-6 rounded-xl border border-gray-100 inline-block shadow-inner">
                <QRCodeSVG
                  value={`otpauth://totp/SistemaBiblioteca:${selectedUser?.email}?secret=JBSWY3DPEHPK3PXP&issuer=Sistema`}
                  size={180}
                />
              </div>

              <div className="space-y-2">
                <p className="text-sm text-gray-600">
                  Escanea este código para <span className="text-blue-600 font-bold">{selectedUser?.nombre}</span>
                </p>
                <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Código demo: 123456</p>
              </div>

              <button 
                onClick={confirmActivation}
                className="w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-green-100"
              >
                <Check size={18} /> ACTIVAR PROTECCIÓN
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;