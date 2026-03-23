const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const speakeasy = require('speakeasy'); // Necesario para verificar códigos reales
const pool = require('../config/db');
const { verifyToken } = require('../middleware/auth');
const { registrarEvento } = require('../utils/logger'); // Para la bitácora de auditoría

const router = express.Router();

// --- REGISTRO ---
router.post('/register', async (req, res) => {
  try {
    const { nombre, apellido_paterno, apellido_materno, edad, direccion, telefono, sexo, email, password } = req.body;

    // Verificar si el email ya existe
    const [existing] = await pool.query('SELECT id FROM usuarios WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(400).json({ message: 'El correo ya está registrado' });
    }

    // Hashear contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insertar usuario
    await pool.query(
      'INSERT INTO usuarios (nombre, apellido_paterno, apellido_materno, edad, direccion, telefono, sexo, email, password, rol, estatus) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [nombre, apellido_paterno, apellido_materno, edad, direccion, telefono, sexo, email, hashedPassword, 'usuario', 'activo']
    );

    res.status(201).json({ message: 'Usuario registrado exitosamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

// --- LOGIN (PASO 1) ---
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Buscar usuario
    const [rows] = await pool.query('SELECT * FROM usuarios WHERE email = ?', [email]);
    if (rows.length === 0) {
      return res.status(401).json({ message: 'Credenciales incorrectas' });
    }

    const user = rows[0];

    // 1. PRIMERO REVISAMOS EL ESTATUS (Antes de cualquier otra cosa)
    if (user.estatus === 'inactivo') {
      return res.status(403).json({
        message: 'Esta cuenta ha sido suspendida por el administrador. Contacte a soporte.'
      });
    }

    // Comparar contraseña
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ message: 'Credenciales incorrectas' });
    }

    // REVISAR SI TIENE MFA ACTIVADO
    if (user.mfa_enabled) {
      // Generamos un token temporal (expira en 5 min)
      const tempToken = jwt.sign(
        { id: user.id, mfaPending: true }, 
        process.env.JWT_SECRET, 
        { expiresIn: '5m' }
      );

      // Registramos intento de login en bitácora
      await registrarEvento(pool, {
        usuario_id: user.id,
        accion: 'LOGIN_MFA_PENDIENTE',
        detalle: 'Contraseña correcta, esperando segundo factor',
        ip: req.ip
      });

      return res.json({ 
        mfaRequired: true, 
        tempToken, 
        message: "Se requiere código de seguridad" 
      });
    }

    // LOGIN NORMAL (Si MFA está desactivado)
    const token = jwt.sign(
      { id: user.id, email: user.email, rol: user.rol },
      process.env.JWT_SECRET,
      { expiresIn: '2h' }
    );

    // Auditoría de login exitoso
    await registrarEvento(pool, {
      usuario_id: user.id,
      accion: 'LOGIN_EXITOSO',
      detalle: 'Inicio de sesión estándar',
      ip: req.ip
    });

    res.json({
      token,
      user: {
        id: user.id,
        nombre: user.nombre,
        apellido_paterno: user.apellido_paterno || "No registrado", 
        apellido_materno: user.apellido_materno || "No registrado",
        telefono: user.telefono || "0000000000",
        email: user.email,
        rol: user.rol,
        mfa_enabled: !!user.mfa_enabled
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

// --- VERIFICAR MFA LOGIN (PASO 2) ---
router.post('/verify-mfa-login', async (req, res) => {
  const { tempToken, code } = req.body;

  try {
    // 1. Verificar el token temporal
    const decoded = jwt.verify(tempToken, process.env.JWT_SECRET);
    
    // 2. Buscar al usuario
    const [rows] = await pool.query('SELECT * FROM usuarios WHERE id = ?', [decoded.id]);
    const user = rows[0];

    // 3. VALIDACIÓN (Con truco escolar 123456)
    const verified = (code === '123456') || speakeasy.totp.verify({
      secret: user.mfa_secret,
      encoding: 'base32',
      token: code,
      window: 1
    });

    if (verified) {
      // Si el código es correcto, generamos el JWT final
      const token = jwt.sign(
        { id: user.id, email: user.email, rol: user.rol },
        process.env.JWT_SECRET,
        { expiresIn: '2h' }
      );

      // Bitácora de acceso concedido con MFA
      await registrarEvento(pool, {
        usuario_id: user.id,
        accion: 'LOGIN_MFA_EXITOSO',
        detalle: code === '123456' ? 'Acceso con código demo escolar' : 'Acceso con código TOTP real',
        ip: req.ip
      });

      res.json({
        token,
        user: {
          id: user.id,
          nombre: user.nombre,
          apellido_paterno: user.apellido_paterno || "No registrado", 
          apellido_materno: user.apellido_materno || "No registrado",
          telefono: user.telefono || "0000000000",
          email: user.email,
          rol: user.rol,
          mfa_enabled: !!user.mfa_enabled
        },
      });
    } else {
      res.status(400).json({ message: "Código de seguridad incorrecto" });
    }
  } catch (error) {
    console.error(error);
    res.status(401).json({ message: "Sesión expirada o inválida" });
  }
});

module.exports = router;

// ////////////////////////////////////// --- ACTUALIZAR PERFIL CON VALIDACIÓN MFA ---
// --- ACTUALIZAR PERFIL CON VALIDACIÓN MFA ---
router.post('/update-profile', verifyToken, async (req, res) => {
  const { nombre, apellido_paterno, apellido_materno, telefono, email, password, mfaCode } = req.body;
  const userId = req.user.id;

  try {
    // 1. Obtener datos actuales del usuario
    const [rows] = await pool.query('SELECT * FROM usuarios WHERE id = ?', [userId]);
    const user = rows[0];

    // 2. Si el usuario tiene MFA, DEBE proporcionar un código para cambios sensibles
    if (user.mfa_enabled) {
      if (!mfaCode) {
        return res.status(400).json({ mfaRequired: true, message: "Se requiere código MFA para confirmar cambios" });
      }

      const verified = (mfaCode === '123456') || speakeasy.totp.verify({
        secret: user.mfa_secret,
        encoding: 'base32',
        token: mfaCode,
        window: 1
      });

      if (!verified) {
        return res.status(400).json({ message: "Código MFA incorrecto" });
      }
    }

    // 3. Preparar la actualización
    let updateQuery = 'UPDATE usuarios SET nombre = ?, apellido_paterno = ?, apellido_materno = ?, telefono = ?, email = ?';
    let params = [nombre, apellido_paterno, apellido_materno, telefono, email];

    // 4. Si cambió la contraseña, hashearla
    if (password && password.trim() !== "") {
      const hashedPassword = await bcrypt.hash(password, 10);
      updateQuery += ', password = ?';
      params.push(hashedPassword);
    }

    updateQuery += ' WHERE id = ?';
    params.push(userId);

    await pool.query(updateQuery, params);

    // 5. Auditoría
    await registrarEvento(pool, {
      usuario_id: userId,
      accion: 'PERFIL_ACTUALIZADO',
      detalle: 'El usuario actualizó sus datos personales',
      ip: req.ip
    });

    res.json({ message: "Perfil actualizado exitosamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al actualizar perfil" });
  }
});