import mongoose from 'mongoose';

const passcodeSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    passcode: {
        type: String,
        required: true
    }
}, { timestamps: true });

const Passcode = mongoose.model('Passcode', passcodeSchema);

export default Passcode;