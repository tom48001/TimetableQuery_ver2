import express from 'express';
import session from 'express-session';
import db from './db.js';
import { MysqlSessionStore, initializeAuthStorage, sessionOptions, csrfProtection } from './auth/sessionSecurity.js';
import passport from './auth/auth.js';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import { initializeImportJobs } from './utils/importJobs.js';
import path from 'path';
import { fileURLToPath } from 'url';

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

const requiredEnv = ['SESSION_SECRET', 'GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET', 'GOOGLE_CALLBACK_URL'];
const missingEnv = requiredEnv.filter((key) => !process.env[key]);
if (missingEnv.length > 0) {
  throw new Error(`Missing required environment variables: ${missingEnv.join(', ')}`);
}

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const clientDistPath = path.resolve(__dirname, '../../client/dist');

// Only trust explicitly configured proxy addresses, never arbitrary X-Forwarded-For.
if (process.env.TRUST_PROXY) app.set('trust proxy', process.env.TRUST_PROXY.split(',').map(value => value.trim()));
await initializeAuthStorage(db);
const sessionStore = new MysqlSessionStore(db);
app.use(session(sessionOptions(sessionStore)));
app.use(passport.initialize());
app.use(passport.session());
const cleanup = setInterval(() => {
  Promise.all([
    db.query('DELETE FROM auth_session WHERE expires <= ?', [Date.now()]),
    db.query('DELETE FROM auth_attempt WHERE expires <= ?', [Date.now()])
  ]).catch(error => console.error('Auth storage cleanup failed:', error.code));
}, 15 * 60 * 1000);
cleanup.unref();

// Middleware
app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:8080', credentials: true }));
app.use(bodyParser.json({ limit: '2mb' }));
app.use(['/api', '/auth'], (req, res, next) => {
  res.set('Cache-Control', 'no-store');
  next();
}, csrfProtection);

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
app.use(express.static(clientDistPath));

app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api/')) {
    return next();
  }

  res.sendFile(path.join(clientDistPath, 'index.html'));
});

app.use((error, req, res, next) => {
  console.error('Request failed:', error.code || error.name);
  if (res.headersSent) return next(error);
  res.status(500).json({ error: 'Server error. Please try again later.' });
});
app.listen(Number(process.env.PORT) || 3000, process.env.HOST || '127.0.0.1', () => console.log('Server started'));
