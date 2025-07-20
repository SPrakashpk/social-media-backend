import express from 'express';
import { getCurrentUser, loginUser, registerUser } from '../controllers/auth.controller.js';
import { validate } from '../middlewares/validate.js';
import { registerSchema } from '../validation/user.schema.js';
const router = express.Router();

router.post('/register',validate(registerSchema), registerUser);
router.post('/login', loginUser);
router.get('/me', getCurrentUser); // No auth middleware

export default router;
