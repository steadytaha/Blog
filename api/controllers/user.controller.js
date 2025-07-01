import bcryptjs from 'bcryptjs';
import { errorHandler } from '../utils/error.js';
import User from '../models/user.model.js';

export const updateUser = async (req, res, next) => {
    if(req.user.id !== req.params.userId) {
        return next(errorHandler(403, 'Forbidden'));
    }
    if(req.body.password) {
        if(req.body.password.length < 6) {
            return next(errorHandler(400, 'Password must be at least 6 characters'));
        }
        req.body.password = bcryptjs.hashSync(req.body.password, 10);
    }
    if(req.body.username){
        if(req.body.username.length < 3 || req.body.username.length > 20) {
            return next(errorHandler(400, 'Username must be between 3 and 20 characters'));
        }
        if(req.body.username.includes(' ')) {
            return next(errorHandler(400, 'Username cannot contain spaces'));
        }
        if(req.body.username !== req.body.username.toLowerCase()) {
            return next(errorHandler(400, 'Username mus be lowecase'));
        }
        if(!req.body.username.match(/^[a-zA-Z0-9_]*$/)) {
            return next(errorHandler(400, 'Username can only contain letters, numbers, and underscores'));
        }
    }
    try {
        const updatedUser = await User.findByIdAndUpdate(req.params.userId, 
            {$set: {
                username: req.body.username,
                email: req.body.email,
                password: req.body.password,
                photo: req.body.photo
            }},
            {new: true});
        const { password, ...rest } = updatedUser._doc;
        res.status(200).json(rest);
    } catch (error) {
        next(error);
    }
}

export const deleteUser = async (req, res, next) => {
    if(!req.user.isAdmin && req.user.id !== req.params.userId) {
        return next(errorHandler(403, 'Unauthorized'));
    }
    try {
        await User.findByIdAndDelete(req.params.userId);
        res.status(200).json('User has been deleted');
    } catch (error) {
        next(error);
    }
}

export const signout = async (req, res, next) => {
    try {
        res.clearCookie('token').status(200).json('User has been signed out');
    } catch (error) {
        next(error);
    }
}

export const getUsers = async (req, res, next) => {
    if(!req.user.isAdmin) {
        return next(errorHandler(403, 'You are not allowed to see all the users'));
    }
    try {
        const startIndex = parseInt(req.query.startIndex) || 0;
        const limit = parseInt(req.query.limit) || 9;
        const sortDirection = req.query.sort === 'asc' ? 1 : -1;
        const users = await User.find()
        .select('-password')
        .skip(startIndex)
        .limit(limit)
        .sort({createdAt: sortDirection});
        
        const totalUsers = await User.countDocuments();
        const now = new Date();
        const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
        const lastMonthUsers = await User.countDocuments({ createdAt: { $gte: oneMonthAgo } });
        res.status(200).json({ users: users, totalUsers, lastMonthUsers });
    } catch (error) {
        next(error);
    }
}

export const getUser = async (req, res, next) => {
    try {
      const user = await User.findById(req.params.userId);
      if (!user) {
        return next(errorHandler(404, 'User not found'));
      }
      const { password, ...rest } = user._doc;
      res.status(200).json(rest);
    } catch (error) {
      next(error);
    }
};

export const setUserRole = async (req, res, next) => {
    if (!req.user.isAdmin) {
      return next(errorHandler(403, 'You are not allowed to change user roles'));
    }
  
    const updateData = {};
    if (req.body.role) {
      updateData.role = req.body.role;
    }
    if (req.body.isAdmin !== undefined) {
      updateData.isAdmin = req.body.isAdmin;
    }
  
    try {
      const updatedUser = await User.findByIdAndUpdate(
        req.params.userId,
        { $set: updateData },
        { new: true }
      );
  
      if (!updatedUser) {
        return next(errorHandler(404, 'User not found'));
      }
  
      const { password, ...rest } = updatedUser._doc;
      res.status(200).json(rest);
    } catch (error) {
      next(error);
    }
};

export const followUser = async (req, res, next) => {
    try {
        const currentUser = await User.findById(req.user.id);
        const userToFollow = await User.findById(req.params.userId);

        if (!userToFollow) {
            return next(errorHandler(404, 'User not found'));
        }

        if (req.user.id === req.params.userId) {
            return next(errorHandler(400, 'You cannot follow yourself'));
        }

        const followingIndex = currentUser.following.indexOf(req.params.userId);
        const followerIndex = userToFollow.followers.indexOf(req.user.id);

        if (followingIndex === -1) {
            // Follow user
            currentUser.following.push(req.params.userId);
            if (followerIndex === -1) { // Should be consistent
                userToFollow.followers.push(req.user.id);
            }
        } else {
            // Unfollow user
            currentUser.following.splice(followingIndex, 1);
            if (followerIndex !== -1) { // Should be consistent
                userToFollow.followers.splice(followerIndex, 1);
            }
        }

        await currentUser.save();
        await userToFollow.save();

        const { password, ...rest } = currentUser._doc;
        res.status(200).json(rest);

    } catch (error) {
        next(error);
    }
}