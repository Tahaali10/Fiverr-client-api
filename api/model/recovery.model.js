import mongoose from "mongoose"

const recoveryPhraseSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    phrase: { type: String, required: true },
});

const Recovery = mongoose.model('Recovery', recoveryPhraseSchema);

export default Recovery;