const express = require('express');
const cors = require('cors');
require('dotenv').config();
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// 1. IMPORTACIÓN DE RUTAS (Solo una vez cada una)
const authRoutes = require('./routes/auth'); 
const adminRoutes = require('./routes/admin');
const mfaRoutes = require('./routes/mfa');

const app = express();

// 2. CONFIGURACIÓN DE SEGURIDAD
app.use(helmet());
app.use(cors({ origin: '*' }));
app.use(express.json());

// 3. LIMITACIÓN DE PETICIONES
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100 // límite de 100 peticiones por ventana
});
app.use('/api/', limiter);

// 4. USO DE RUTAS (Solo una vez cada una)
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/mfa', mfaRoutes);

// 5. INICIO DEL SERVIDOR
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});