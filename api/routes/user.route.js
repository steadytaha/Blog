import express from 'express';
import { updateUser, deleteUser, signout, getUsers } from '../controllers/user.controller.js';
import { verifyUser } from '../utils/verifyUser.js';

const router = express.Router();

router.post('/signout', signout);
router.put('/update/:userId', verifyUser, updateUser);
router.delete('/delete/:userId', verifyUser, deleteUser);
router.get('/users', verifyUser, getUsers);

export default router;