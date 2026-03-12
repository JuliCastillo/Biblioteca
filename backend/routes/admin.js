const express = require('express');
const pool = require('../config/db');
//const { verifyToken, requireRole } = require('../middleware/auth');
//const { verifyToken, requireRole } = require('../auth');
const router = express.Router();

const { verifyToken, requireRole } = require('../middleware/auth');

// Obtener todos los usuarios (solo administradores)
router.get('/users', verifyToken, requireRole('administrador'), async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id, nombre, apellido_paterno, apellido_materno, edad, direccion, telefono, sexo, email, rol FROM usuarios');
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

module.exports = router;
