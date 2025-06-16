import express from 'express';
import { signup, signin, google } from '../controllers/auth.controller.js';
import { validateSignup, validateSignin, validateGoogleAuth } from '../utils/validation.js';
import { verifyUser } from '../utils/verifyUser.js';

const router = express.Router();

router.post('/signup', validateSignup, verifyUser, signup);
router.post('/signin', validateSignin, verifyUser, signin);
router.post('/google', validateGoogleAuth, verifyUser, google);

export default router;