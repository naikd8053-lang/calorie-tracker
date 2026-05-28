import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import logRoutes from './routes/logs.js';
import userRoutes from './routes/users.js';
import predictRoutes from './routes/predict.js';
import plannerRoutes from './routes/planner.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/logs', logRoutes);
app.use('/api/users', userRoutes);
app.use('/api/predict', predictRoutes);
app.use('/api/planner', plannerRoutes);

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    app.listen(process.env.PORT, () => {
      console.log(`Server running on port ${process.env.PORT}`);
    });
  })
  .catch(err => console.log(err));