import express from 'express';
import { updateUser, deleteUser, signout, getUsers, getUser, setUserRole, followUser } from '../controllers/user.controller.js';
import { verifyUser } from '../utils/verifyUser.js';

const router = express.Router();

router.put('/update/:userId', verifyUser, updateUser);
router.delete('/delete/:userId', verifyUser, deleteUser);
router.post('/signout', signout);
router.get('/users', verifyUser, getUsers);
router.get('/:userId', getUser);
router.put('/role/:userId', verifyUser, setUserRole);
router.put('/users/:userId/follow', verifyUser, followUser);

export default router;