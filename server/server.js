const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const mongoose = require('mongoose');

dotenv.config();

const app = express();

// --- 1. DATABASE CONNECTION (Serverless Optimized) ---
const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) return; // Reuse existing connection
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB Connected");
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error);
  }
};

// --- 2. CORS CONFIGURATION ---
const corsOptions = {
  origin: ['https://edu-hack-tech.vercel.app', 'http://localhost:5173'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

// --- 3. MIDDLEWARES ---
app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // Pre-flight
app.use(express.json({ limit: '10mb' }));
app.use(helmet());
app.use(morgan('dev'));

// --- 4. ROUTES ---
// Health Check (Root)
app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'EduHackTech API is running!' });
});

// Important: Add connectDB call to your routes to ensure DB is ready
app.use('/api/courses', async (req, res, next) => {
  await connectDB();
  next();
}, require('./modules/learning/course.routes'));

// ... Add other routes similarly (api/auth, api/events, etc.)

// --- 5. EXPORTS (The Vercel Way) ---
// Vercel handles the "listen" part. Only run app.listen locally.
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`🚀 Local Server on port ${PORT}`));
}

module.exports = app;