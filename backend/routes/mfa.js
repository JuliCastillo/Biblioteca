const express = require('express');
const router = express.Router();
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
// El ../ significa "salir de la carpeta routes" para buscar auth en la carpeta de arriba (backend)
//const { verifyToken } = require('../auth');
const { verifyToken } = require('../middleware/auth'); // Asegúrate de que la ruta sea correcta
const { registrarEvento } = require('../utils/logger');
const pool = require('../config/db'); // Tu conexión a la base de datos

// PASO 1: Generar el QR para el usuario
router.post('/setup', verifyToken, async (req, res) => {
  try {
    // Generar un secreto único para el usuario
    const secret = speakeasy.generateSecret({ 
      name: `Biblioteca:${req.user.email}` 
    });

    // Guardar el secreto temporalmente en la BD
    await pool.query('UPDATE usuarios SET mfa_secret = ? WHERE id = ?', [secret.base32, req.user.id]);

    // Crear la imagen QR
    const qrUrl = await QRCode.toDataURL(secret.otpauth_url);

    res.json({ 
      qrCode: qrUrl, 
      secret: secret.base32 
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al generar MFA' });
  }
});

// PASO 2: Confirmar que el usuario escaneó bien el código
router.post('/verify-and-enable', verifyToken, async (req, res) => {
  const { token } = req.body;

  try {
    const [rows] = await pool.query('SELECT mfa_secret FROM usuarios WHERE id = ?', [req.user.id]);
    const userSecret = rows[0].mfa_secret;

    // TRAMPA ESCOLAR: Si es 123456, saltamos la verificación real de speakeasy
    const verified = (token === '123456') || speakeasy.totp.verify({
      secret: userSecret,
      encoding: 'base32',
      token: token,
      window: 1
    });

    if (verified) {
      await pool.query('UPDATE usuarios SET mfa_enabled = 1 WHERE id = ?', [req.user.id]);
      
      await registrarEvento(pool, {
        usuario_id: req.user.id,
        accion: 'MFA_ACTIVADO',
        detalle: 'El usuario activó MFA (Código demo 123456 usado)',
        ip: req.ip
      });

      res.json({ success: true, message: "MFA activado correctamente" });
    } else {
      res.status(400).json({ message: "Código inválido. Intenta de nuevo." });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al verificar código" });
  }
});

module.exports = router;