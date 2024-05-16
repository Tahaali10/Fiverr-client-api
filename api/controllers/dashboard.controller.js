import User from "../model/user.model.js";
import mongoose from 'mongoose';
import { errorHandler } from '../utils/error.js';

export const getUserInfo = async (req, res, next) => {
    try {
        const { userId } = req.params;

        if (!mongoose.isValidObjectId(userId)) {
            return next(errorHandler(404, 'User not found'));
        }

        const user = await User.findById(userId);

        if (!user) {
            return next(errorHandler(404, 'User not found'));
        }

        const { fullname, profilePicture, email, phoneNumber } = user;

        return res.status(200).json({
            fullname,
            profilePicture,
            email,
            phoneNumber
        });
    } catch (error) {
        next(error);
    }
};
