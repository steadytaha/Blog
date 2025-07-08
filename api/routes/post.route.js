import express from 'express';
import { verifyUser } from '../utils/verifyUser.js';
import { validatePostCreation } from '../utils/validation.js';
import { create, getPosts, deletePost, updatePost, getUserPosts, createBulk, likePost, savePost } from '../controllers/post.controller.js';


const router = express.Router();

router.post('/create', verifyUser, validatePostCreation, create);
router.post('/create-bulk', verifyUser, validatePostCreation, createBulk);
router.get('/posts', getPosts);
router.get('/posts/:id', getUserPosts);
router.delete('/delete/:postId/:userId', verifyUser, deletePost);
router.put('/update/:postId/:userId', verifyUser, updatePost);
router.put('/:postId/like', verifyUser, likePost);
router.put('/posts/:postId/like', verifyUser, likePost);
router.put('/:postId/save', verifyUser, savePost);
router.put('/posts/:postId/save', verifyUser, savePost);

export default router;