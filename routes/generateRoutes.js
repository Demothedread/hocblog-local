import express from 'express';
import { generateContentHandler } from '../app/controllers/generateController.js';

const router = express.Router();

router.post('/', generateContentHandler);

export default router;
