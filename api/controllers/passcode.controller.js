import Passcode from '../model/passcode.model.js';
import { errorHandler } from '../utils/error.js';
import bcryptjs from 'bcryptjs';
import { verifyToken } from '../utils/verifyUser.js';


export const createPasscode = async (req, res, next) => {
    try {
        const { userId, passcode } = req.body;

        const passcodeNumber = parseInt(passcode);
        if (isNaN(passcodeNumber) || passcodeNumber < 1000 || passcodeNumber > 9999) {
            return res.status(400).json({ success: false, message: 'Passcode must be a 4-digit number' });
        }

        const passcodeString = passcodeNumber.toString();

        const existingPasscode = await Passcode.findOne({ userId });

        if (existingPasscode) {
            return res.status(200).json({ success: true, message: 'Passcode already exists for the user' });
        }

        const hashedPasscode = await bcryptjs.hash(passcodeString, 10);

        const newPasscode = new Passcode({ userId, passcode: hashedPasscode });
        await newPasscode.save();

        return res.status(201).json({ success: true, message: 'Passcode created successfully' });
    } catch (error) {
        next(error);
    }
};


export const getPasscode = async (req, res, next) => {
    try {
        const { userId } = req.params;

        const passcodeData = await Passcode.findOne({ userId });
        if (!passcodeData) {
            return next(errorHandler(404, 'Passcode not found for the user'));
        }

        return res.status(200).json({ passcode: passcodeData.passcode });
    } catch (error) {
        next(error);
    }
};


export const updatePasscode = async (req, res, next) => {
    try {
        verifyToken(req, res, () => { });

        if (!req.user || !req.user.id) {
            return next(errorHandler(401, 'Unauthorized'));
        }

        if (req.user.id !== req.params.userId) {
            return next(errorHandler(403, 'You are not allowed to update this passcode'));
        }

        if (!req.body.passcode) {
            return next(errorHandler(400, 'Passcode is required'));
        }

        const passcode = req.body.passcode.toString();
        if (passcode.length !== 4 || isNaN(passcode)) {
            return next(errorHandler(400, 'Passcode must be a 4-digit number'));
        }

        const hashedPasscode = await bcryptjs.hash(passcode, 10);

        const updatedPasscode = await Passcode.findOneAndUpdate(
            { userId: req.params.userId },
            { passcode: hashedPasscode },
            { new: true }
        );

        if (!updatedPasscode) {
            return next(errorHandler(404, 'Passcode not found for the user'));
        }

        return res.status(200).json({ success: true, message: 'Passcode updated successfully' });
    } catch (error) {
        next(error);
    }
};
