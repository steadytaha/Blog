import bcryptjs from 'bcryptjs';
import { errorHandler } from '../utils/error.js';
import User from '../models/user.model.js';


export const test = (req, res) => {
    res.json({ message: 'User route is working!!' });
}

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
