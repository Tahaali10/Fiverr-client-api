import express from "express"
import { signup, signin, google, sendOTP, verifyOTP, recoveryPhrase, getRecoveryPhrase } from "../controllers/auth.controller.js";

const router = express.Router()

router.post("/signup", signup)
router.post("/signin", signin)

router.post("/google", google)

router.post("/send-otp", sendOTP)
router.post("/verify-otp", verifyOTP)

router.post("/recovery-phrase", recoveryPhrase)
router.get("/recovery-phrase-confirm/:userId", getRecoveryPhrase);

export default router;