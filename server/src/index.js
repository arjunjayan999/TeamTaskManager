import express, { json } from 'express';
import cors from 'cors';
import dotenv from 'dotenv'
dotenv.config()

import authRoutes from './routes/auth.js';
import projectRoutes from './routes/projects.js';

const app = express();

app.use(cors({ origin: 'https://frontend-production-4876.up.railway.app' }));
app.use(json());

app.get('/health', (req, res) => res.json({ status: 'ok' }));
app.use('/auth', authRoutes);
app.use('/projects', projectRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));