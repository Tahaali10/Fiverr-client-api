import bcryptjs from 'bcryptjs';
import { errorHandler } from '../utils/error.js';
import User from '../model/user.model.js';

export const test = (req, res) => {
  res.json({ message: 'API is working!' });
};

export const updateUser = async (req, res, next) => {
  if (req.user.id !== req.params.userId) {
    return next(errorHandler(403, 'You are not allowed to update this user'));
  }
  if (req.body.password) {
    if (req.body.password.length < 6) {
      return next(errorHandler(400, 'Password must be at least 6 characters'));
    }
    req.body.password = bcryptjs.hashSync(req.body.password, 10);
  }
  if (req.body.phoneNumber) {
    if (req.body.phoneNumber.length < 10 || req.body.phoneNumber.length > 15) {
      return next(
        errorHandler(400, 'Phone Number must be between 10 and 15 characters')
      );
    }
  }
  if (req.body.fullname) {
    if (req.body.fullname.length < 6 || req.body.fullname.length > 30) {
      return next(
        errorHandler(400, 'fullname must be between 6 and 30 characters')
      );
    }
    try {
      const updatedUser = await User.findByIdAndUpdate(
        req.params.userId,
        {
          $set: {
            fullname: req.body.fullname,
            email: req.body.email,
            profilePicture: req.body.profilePicture,
            password: req.body.password,
            phoneNumber:req.body.phoneNumber
          },
        },
        { new: true }
      );
      const { password, ...rest } = updatedUser._doc;
      res.status(200).json(rest);
    } catch (error) {
      next(error);
    }
  }
};
