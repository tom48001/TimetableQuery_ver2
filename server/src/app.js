import express from 'express';
import session from 'express-session';
import passport from './auth/auth.js';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';

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

import importRoutes from "./routes/importRoutes.js";

dotenv.config();
const app = express();

// Database connection
app.use(session({
    secret: process.env.SESSION_SECRET || 'secret123',
    resave: false,
    saveUninitialized: false
  }));
  
  // Initialize Passport.js
  app.use(passport.initialize());
  // Initialize Passport.js session
  app.use(passport.session());

// Middleware
app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:8080', credentials: true }));
app.use(bodyParser.json());

//Auth
app.use('/auth', authRoutes);

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
app.use('/api/import', importRoutes);

// Server
app.listen(3000, () => console.log('Server running on port 3000'));
