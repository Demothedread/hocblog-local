import express from 'express';
import { generateContent } from '../../controllers/generateController.js';

const router = express.Router();

router.post('/', generateContent);

export default router;