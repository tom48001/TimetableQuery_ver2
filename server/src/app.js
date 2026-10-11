import express from 'express';
import session from 'express-session';
import passport from './auth/auth.js';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
<<<<<<< HEAD
import { initializeImportJobs } from './utils/importJobs.js';
=======
import path from 'path';
import { fileURLToPath } from 'url';
>>>>>>> d6a1450c48436382ae2a528ceb66d21ef8679bfa

import authRoutes from './routes/authRoutes.js';
import teacherRoutes from './routes/teacherRoutes.js';
import timetableRoutes from './routes/timetableRoutes.js';
import studentRoutes from './routes/studentRoutes.js';
import classRoutes from './routes/classRoutes.js';
import roomRoutes from './routes/roomRoutes.js';
import observationRoutes from './routes/observationRoutes.js';
import subjectRoutes from './routes/subjectRoutes.js';
import swapRoutes from './routes/swapRoutes.js';
import blaRoutes from './routes/blaRoutes.js';
import conductRoutes from './routes/conductRoutes.js';
import prefectRoutes from './routes/prefectRoutes.js';
import learningGoalRoutes from './routes/learningGoalRoutes.js';
import lessonGroupRoutes from './routes/lessonGroupRoutes.js';
import nominationAdminRoutes from './routes/nominationAdminRoutes.js';
import systemSettingsRoutes from './routes/systemSettingsRoutes.js';

import importRoutes from "./routes/importRoutes.js";

dotenv.config();

const requiredEnv = ['JWT_SECRET', 'SESSION_SECRET', 'GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET', 'GOOGLE_CALLBACK_URL'];
const missingEnv = requiredEnv.filter((key) => !process.env[key]);
if (missingEnv.length > 0) {
  throw new Error(`Missing required environment variables: ${missingEnv.join(', ')}`);
}

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const clientDistPath = path.resolve(__dirname, '../../client/dist');

// Database connection
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
  }));
  
  // Initialize Passport.js
  app.use(passport.initialize());
  // Initialize Passport.js session
  app.use(passport.session());

// Middleware
app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:8080', credentials: true }));
app.use(bodyParser.json({ limit: '2mb' }));

// Lightweight container/orchestrator health check. It intentionally does not
// expose application data or require authentication.
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// Auth. Keep /auth for existing local callbacks; use /api/auth for deployment through Apache reverse proxy.
app.use('/auth', authRoutes);
app.use('/api/auth', authRoutes);

// Routes
app.use('/api/teachers', teacherRoutes);
app.use('/api/timetable', timetableRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/classes', classRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/observation', observationRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/swap', swapRoutes);
app.use('/api/bla', blaRoutes);
app.use('/api/conduct', conductRoutes);
app.use('/api/prefect', prefectRoutes);
app.use('/api/learning-goals', learningGoalRoutes);
app.use('/api/lesson-groups', lessonGroupRoutes);
app.use('/api/nominations', nominationAdminRoutes);
app.use('/api/system-settings', systemSettingsRoutes);
app.use('/api/import', importRoutes);

// Server
<<<<<<< HEAD
const port = process.env.PORT || 3000;
const host = process.env.HOST || '127.0.0.1';

await initializeImportJobs();
app.listen(port, host, () => {
  console.log(`Server running on http://${host}:${port}`);
});
=======
app.use(express.static(clientDistPath));

app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api/')) {
    return next();
  }

  res.sendFile(path.join(clientDistPath, 'index.html'));
});

app.listen(3000, () => console.log('Server running on port 3000'));
>>>>>>> d6a1450c48436382ae2a528ceb66d21ef8679bfa
