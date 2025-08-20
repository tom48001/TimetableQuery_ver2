import express from 'express';
import session from 'express-session';
import passport from './auth/GoogleAuth.js';
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
app.use(cors({ origin: 'http://localhost:8080', credentials: true }));
// app.use(cors({ origin: 'http://localhost:8386', credentials: true }));
app.use(bodyParser.json());

// Routes
app.use('/api', authRoutes);
app.use('/auth', authRoutes);
app.use('/api/teachers', teacherRoutes);        // 教師帳號管理
app.use('/api/timetable', timetableRoutes);     // 課表查詢
app.use('/api/students', studentRoutes);      // 學生查詢
app.use('/api/classes', classRoutes);         // 班級查詢
app.use('/api/rooms', roomRoutes);        // 教室查詢
app.use('/api/rooms/schedule/:roomId', roomRoutes); 
app.use('/api/observation', observationRoutes); // 課堂觀察
app.use('/api/subjects', subjectRoutes);
app.use('/api/swap', swapRoutes);
app.use('/api/bla', blaRoutes);
app.use('/api/conduct', conductRoutes);

// Server
app.listen(3000, () => console.log('Server running on port 3000'));
