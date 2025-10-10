import express from 'express';
import dotenv from 'dotenv';
import dbConnect from './config/dbConnect.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';

dbConnect();

const app = express();

//middleware
app.use(express.json());

//routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);


//start
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
dotenv.config();