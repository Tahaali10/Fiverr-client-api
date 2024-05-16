import mongoose from 'mongoose';

const otpSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: true,
            unique: true,
        },
        otp: { type: String, required: true, },
        expiresAt: Date,
        createdAt: Date,
    },

);

const OTP = mongoose.model('OTP', otpSchema);

export default OTP;