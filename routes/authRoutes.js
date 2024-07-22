import express from 'express';
import { authRedirect, authCallback } from '../app/controllers/authController.js';

const router = express.Router();

router.get('/', authRedirect);
router.get('/callback', authCallback);

export default router;
