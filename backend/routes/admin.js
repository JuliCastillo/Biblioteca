const express = require('express');
const pool = require('../config/db');
const router = express.Router();

// IMPORTANTE: Asegúrate de que esta ruta sea la correcta según tus carpetas
const { verifyToken, requireRole } = require('../middleware/auth');

// 1. Obtener todos los usuarios
router.get('/users', verifyToken, requireRole('administrador'), async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, nombre, apellido_paterno, apellido_materno, email, telefono, rol, estatus, direccion, mfa_enabled FROM usuarios'
    );
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener usuarios' });
  }
});

// 2. Actualizar Rol o Estatus
router.put('/users/:id', verifyToken, requireRole('administrador'), async (req, res) => {
  const { id } = req.params;
  const { rol, estatus } = req.body;
  try {
    await pool.query(
      'UPDATE usuarios SET rol = IFNULL(?, rol), estatus = IFNULL(?, estatus) WHERE id = ?',
      [rol, estatus, id]
    );

    // OPCIONAL: Registrar en bitácora el cambio de estatus
    if (estatus) {
      await pool.query(
        'INSERT INTO bitacora (usuario_id, accion, detalle) VALUES (?, ?, ?)',
        [req.user.id, 'CAMBIO_ESTATUS', `Usuario ID ${id} marcado como ${estatus}`]
      );
    }

    res.json({ message: 'Usuario actualizado' });
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar' });
  }
});

// 3. Obtener Bitácora
router.get('/bitacora', verifyToken, requireRole('administrador'), async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT b.id, b.accion, b.detalle, b.fecha, b.ip, u.email AS usuario_email 
      FROM bitacora b
      LEFT JOIN usuarios u ON b.usuario_id = u.id
      ORDER BY b.fecha DESC 
      LIMIT 100
    `);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener bitácora' });
  }
});

// 4. Activar Seguridad (QR/MFA) para un usuario específico
router.post('/users/:id/activate-mfa', verifyToken, requireRole('administrador'), async (req, res) => {
  const { id } = req.params;
  try {
    // 1. Ponemos mfa_enabled en 1 y asignamos un secreto base
    await pool.query(
      'UPDATE usuarios SET mfa_enabled = 1, mfa_secret = "JBSWY3DPEHPK3PXP" WHERE id = ?',
      [id]
    );

    // 2. Guardamos en la bitácora que el admin activó esta seguridad
    await pool.query(
      'INSERT INTO bitacora (usuario_id, accion, detalle) VALUES (?, ?, ?)',
      [req.user.id, 'SEGURIDAD_QR_ACTIVADA', `Se activó código de seguridad para el usuario ID: ${id}`]
    );

    res.json({ message: 'Seguridad activada correctamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al activar seguridad' });
  }
});

module.exports = router;
