//import React, { useState } from 'react';
//import { api } from '../services/api'; // Asegúrate de que apunte a tu instancia de axios o fetch
import React, { useState } from 'react';
export const MfaSetup: React.FC = () => {
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [step, setStep] = useState<1 | 2>(1);
  const [code, setCode] = useState('');
  const [message, setMessage] = useState('');

  // Paso 1: Obtener el QR del backend
  const handleStartSetup = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/api/mfa/setup', {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      setQrCode(data.qrCode);
      setStep(2);
    } catch (error) {
      setMessage("Error al conectar con el servidor");
    }
  };

  // Paso 2: Verificar el código ingresado por el usuario
  const handleVerify = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/api/mfa/verify-and-enable', {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ token: code })
      });
      
      const data = await response.json();
      if (data.success) {
        setMessage("¡Seguridad MFA activada con éxito!");
        setQrCode(null);
      } else {
        setMessage(data.message || "Código incorrecto");
      }
    } catch (error) {
      setMessage("Error al verificar código");
    }
  };

  return (
    <div className="p-6 bg-white shadow-md rounded-lg max-w-sm mx-auto mt-10 text-center">
      <h2 className="text-xl font-bold mb-4">Seguridad de la Cuenta</h2>
      
      {step === 1 && (
        <button 
          onClick={handleStartSetup}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Activar Doble Factor (MFA)
        </button>
      )}

      {step === 2 && qrCode && (
        <div>
          <p className="mb-4 text-sm text-gray-600">
            Escanea este código con Google Authenticator:
          </p>
          <img src={qrCode} alt="Código QR MFA" className="mx-auto mb-4 border" />
          <input 
            type="text" 
            placeholder="Introduce los 6 dígitos"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="border p-2 w-full mb-4 text-center tracking-widest"
            maxLength={6}
          />
          <button 
            onClick={handleVerify}
            className="bg-green-600 text-white px-4 py-2 rounded w-full hover:bg-green-700"
          >
            Verificar y Activar
          </button>
        </div>
      )}

      {message && <p className="mt-4 text-sm font-medium text-blue-600">{message}</p>}
    </div>
  );
};