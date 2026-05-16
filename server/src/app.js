require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const mongoose = require('mongoose');

const authRoutes = require('./routes/auth');
const faceRoutes = require('./routes/face');
const outfitRoutes = require('./routes/outfit');
const wardrobeRoutes = require('./routes/wardrobe');
const subscriptionRoutes = require('./routes/subscription');

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(morgan('dev'));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

const analyzeLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Quá nhiều lần phân tích, vui lòng thử lại sau 1 giờ' },
});
app.use('/api/analyze-face', analyzeLimiter);

app.use('/api/auth', authRoutes);
app.use('/api', faceRoutes);
app.use('/api/outfit', outfitRoutes);
app.use('/api/wardrobe', wardrobeRoutes);
app.use('/api/subscription', subscriptionRoutes);

app.use((err, _req, res, _next) => {
  console.error(err.message);
  res.status(err.status || 500).json({ success: false, error: err.message || 'Internal server error' });
});

const MONGODB_URI = process.env.MONGODB_URI;
if (MONGODB_URI) {
  mongoose
    .connect(MONGODB_URI)
    .then(() => console.log('MongoDB connected'))
    .catch((err) => console.error('MongoDB connection error:', err.message));
} else {
  console.warn('MONGODB_URI not set — running without database connection');
}

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('Routes mounted:');
  console.log('  POST   /api/auth/register');
  console.log('  POST   /api/auth/login');
  console.log('  GET    /api/auth/me');
  console.log('  POST   /api/analyze-face');
  console.log('  GET    /api/result/:userId');
  console.log('  GET    /api/outfit/:season');
  console.log('  GET    /api/wardrobe');
  console.log('  POST   /api/wardrobe');
  console.log('  DELETE /api/wardrobe/:itemId');
  console.log('  GET    /api/subscription');
  console.log('  POST   /api/subscription/upgrade');
  console.log('  GET    /api/subscription/callback');
});
