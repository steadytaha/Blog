import express from 'express';
import { verifyUser } from '../utils/verifyUser.js';
import { create, getPosts, deletePost, updatePost, getUserPosts } from '../controllers/post.controller.js';


const router = express.Router();

router.post('/create', verifyUser, create);
router.get('/posts', getPosts);
router.get('/posts/:id', getUserPosts);
router.delete('/delete/:postId/:userId', verifyUser, deletePost);
router.put('/update/:postId/:userId', verifyUser, updatePost);

export default router;