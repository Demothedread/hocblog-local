import express from 'express';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import path from 'path';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import blogRoutes from './routes/blogRoutes.js';
import generateRoutes from './routes/generateRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet());
app.use(express.json());
app.use(cookieParser());

const __dirname = path.resolve();

app.use(express.static(path.join(__dirname, 'public')));

app.use('/auth', authRoutes);
app.use('/blog', blogRoutes);
app.use('/generate', generateRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
                                                                                                                                                                                                                                                                                                                                                                                                                           