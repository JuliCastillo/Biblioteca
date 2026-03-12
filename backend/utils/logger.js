//const { query } = require('../db');

// backend/utils/logger.js
const pool = require('../config/db'); // Salir de utils (..) y entrar a config

async function registrarEvento({ usuario_id, accion, detalle, ip }) {
  try {
    await query(
      'INSERT INTO bitacora (usuario_id, accion, detalle, ip) VALUES (?,?,?,?)',
      [usuario_id, accion, detalle, ip]
    );
  } catch (error) {
    console.error("Error registrando evento:", error);
  }
}

module.exports = { registrarEvento };

