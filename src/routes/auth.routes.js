import express from 'express';
import { getCurrentUser, loginUser, registerUser, resendOTP, verifyOTP } from '../controllers/auth.controller.js';
import { validate } from '../middlewares/validate.js';
import { registerSchema } from '../validation/user.schema.js';
import { checkUsernameAvailability } from '../controllers/auth.controller.js';
const router = express.Router();

router.post('/register',validate(registerSchema), registerUser);
router.post('/verify-otp', verifyOTP);
router.post('/resend-otp', resendOTP);
router.post('/login', loginUser);
router.get('/me', getCurrentUser); // No auth middleware
router.get('/username-available/:username', checkUsernameAvailability);


export default router;
