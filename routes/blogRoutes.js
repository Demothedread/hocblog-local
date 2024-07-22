import express from 'express';
import { createBlogPost } from '../controllers/blogController.js';
import webflowClientMiddleware from '../middleware/webflowClientMiddleware.js';

const router = express.Router();

router.post('/create', webflowClientMiddleware, createBlogPost);

export default router;