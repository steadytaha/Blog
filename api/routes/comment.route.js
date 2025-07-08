import express from 'express';
import { verifyUser } from '../utils/verifyUser.js';
import { validateComment } from '../utils/validation.js';
import {
  createComment,
  deleteComment,
  editComment,
  getPostComments,
  getComments,
  likeComment,
} from '../controllers/comment.controller.js';

const router = express.Router();

router.post('/create', verifyUser, validateComment, createComment);
router.get('/getPostComments/:postId', getPostComments);
router.put('/likeComment/:commentId', verifyUser, likeComment);
router.put('/editComment/:commentId', verifyUser, validateComment, editComment);
router.delete('/deleteComment/:commentId', verifyUser, deleteComment);
router.get('/getComments', verifyUser, getComments);

export default router;