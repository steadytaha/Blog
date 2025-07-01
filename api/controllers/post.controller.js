import Post from "../models/post.model.js";
import User from "../models/user.model.js";
import { errorHandler } from "../utils/error.js";
import { createNotification } from './notification.controller.js';

export const create = async (req, res, next) => {
    if(!req.user.isAdmin && req.user.role !== 'writer'){
        return next(errorHandler(403, 'You are not allowed to create a post'));
    }
    if(!req.body.title || !req.body.content){
        return next(errorHandler(400, 'Title and content are required'));
    }
    const slug = req.body.title.split(' ').join('-').toLowerCase().replace(/[^a-zA-Z0-9-]/g, '-');
    const post = new Post({
        ...req.body,
        slug,
        author: req.user.id
    });
    try {
        const savedPost = await post.save();
        res.status(201).json(savedPost);
    } catch (error) {
        next(error);
    }
}

export const createBulk = async (req, res, next) => {
    if (!req.user.isAdmin && req.user.role !== 'writer') {
        return next(errorHandler(403, 'You are not allowed to create posts'));
    }

    const { posts } = req.body;

    if (!posts || !Array.isArray(posts) || posts.length === 0) {
        return next(errorHandler(400, 'No posts to create'));
    }

    try {
        const createdPosts = await Promise.all(
            posts.map(async (postData) => {
                const { title, content, ...rest } = postData;
                if (!title || !content) {
                    // We can either skip this post or fail the whole batch
                    console.warn('Skipping post with missing title or content:', postData);
                    return null; 
                }
                const slug = title.split(' ').join('-').toLowerCase().replace(/[^a-zA-Z0-9-]/g, '-');
                const newPost = new Post({
                    ...rest,
                    title,
                    content,
                    slug,
                    author: req.user.id,
                });
                return newPost.save();
            })
        );

        // Filter out any nulls from skipped posts
        const successfulPosts = createdPosts.filter(p => p !== null);

        res.status(201).json({
            message: `Successfully created ${successfulPosts.length} posts.`,
            posts: successfulPosts,
        });
    } catch (error) {
        next(error);
    }
};

export const getPosts = async (req, res, next) => {
    try {
        const startIndex = parseInt(req.query.startIndex) || 0;
        const limit = parseInt(req.query.limit) || 9;
        const sortDirection = req.query.sort === 'asc'? 1 : -1;
        const posts = await Post.find({
            ...(req.query.author && { author: req.query.author }),
            ...(req.query.slug && { slug: req.query.slug }),
            ...(req.query.category && { category: req.query.category }),
            ...(req.query.postId && { _id: req.query.postId }),
            ...(req.query.searchTerm && {
                $or: [
                    { title: { $regex: req.query.searchTerm, $options: 'i' } },
                    { content: { $regex: req.query.searchTerm, $options: 'i' } }
                ]
            })
        }).sort({ createdAt: sortDirection }).skip(startIndex).limit(limit);
        const totalPosts = await Post.countDocuments();
        const now = new Date();
        const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
        const lastMonthPosts = await Post.countDocuments({ createdAt: { $gte: oneMonthAgo } });
        res.status(200).json({ posts, totalPosts, lastMonthPosts });
    } catch (error) {
        next(error);
    }
}

export const getUserPosts = async (req, res, next) => {
    try {
        const startIndex = parseInt(req.query.startIndex) || 0;
        const limit = parseInt(req.query.limit) || 9;
        const sortDirection = req.query.order === 'asc'? 1 : -1;
        const posts = await Post.find({ author: req.params.id }).sort({ createdAt: sortDirection }).skip(startIndex).limit(limit);
        res.status(200).json({ posts });
    } catch (error) {
        next(error);
    }
}

export const deletePost = async (req, res, next) => {
    if (!req.user.isAdmin && req.user.id !== req.params.userId) {
      return next(errorHandler(403, 'You are not allowed to delete this post'));
    }
    try {
      await Post.findByIdAndDelete(req.params.postId);
      res.status(200).json('The post has been deleted');
    } catch (error) {
      next(error);
    }
};

export const updatePost = async (req, res, next) => {
    if (!req.user.isAdmin && req.user.id !== req.params.userId) {
      return next(errorHandler(403, 'You are not allowed to update this post'));
    }
    try {
      const updatedPost = await Post.findByIdAndUpdate(req.params.postId, {
        $set: {
            title: req.body.title,
            content: req.body.content,
            category: req.body.category,
            image: req.body.image
        }}, { new: true });
      res.status(200).json(updatedPost);
    } catch (error) {
      next(error);
    }
};

export const likePost = async (req, res, next) => {
    try {
        const post = await Post.findById(req.params.postId);
        if(!post){
            return next(errorHandler(404, 'Post not found'));
        }
        const userIndex = post.likes.indexOf(req.user.id);
        if(userIndex === -1){
            post.numberOfLikes += 1;
            post.likes.push(req.user.id);
            
            // Create notification for post author when someone likes their post
            try {
                await createNotification(
                    post.author,
                    req.user.id,
                    'like_post',
                    post._id
                );
            } catch (notificationError) {
                console.error('Error creating post like notification:', notificationError);
                // Don't fail the like action if notification fails
            }
        } else {
            post.numberOfLikes -= 1;
            post.likes.splice(userIndex, 1);
        }
        await post.save();
        res.status(200).json(post);
    } catch (error) {
        next(error);
    }
}

export const savePost = async (req, res, next) => {
    try {
        const post = await Post.findById(req.params.postId);
        if (!post) {
            return next(errorHandler(404, 'Post not found'));
        }
        const user = await User.findById(req.user.id);
        if (!user) {
            return next(errorHandler(404, 'User not found'));
        }

        const postIndexInUser = user.savedPosts.indexOf(req.params.postId);
        const userIndexInPost = post.saves.indexOf(req.user.id);

        if (userIndexInPost === -1) {
            // Save the post
            post.saves.push(req.user.id);
            if (postIndexInUser === -1) {
                user.savedPosts.push(req.params.postId);
            }
        } else {
            // Unsave the post
            post.saves.splice(userIndexInPost, 1);
            if (postIndexInUser !== -1) {
                user.savedPosts.splice(postIndexInUser, 1);
            }
        }

        await post.save();
        await user.save();

        res.status(200).json({ post, user });
    } catch (error) {
        next(error);
    }
}