import express from 'express';
import { test, updateUser } from '../controllers/user.controller.js';
import { verifyToken } from '../utils/verifyUser.js';
import { getUserInfo } from '../controllers/dashboard.controller.js';
import { createPasscode, getPasscode, updatePasscode } from '../controllers/passcode.controller.js';
import { getCountry } from '../controllers/countries.controller.js';

const router = express.Router();

router.get('/test', test);
router.get('/dashboard/:userId', getUserInfo)
router.put('/update/:userId', verifyToken, updateUser);

router.post('/create-passcode', createPasscode);
router.get('/get-passcode/:userId', getPasscode);
router.put('/update-passcode/:userId', updatePasscode)

router.get('/countries', getCountry)

export default router;