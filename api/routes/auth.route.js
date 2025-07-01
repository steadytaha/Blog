import express from 'express';
import { signup, signin, google } from '../controllers/auth.controller.js';
import { validateSignup, validateSignin } from '../utils/validation.js';

const router = express.Router();

router.post('/signup', validateSignup, signup);
router.post('/signin', validateSignin, signin);
router.post('/google', google);

export default router;