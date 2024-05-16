import express from 'express';
import { getInboxMessages, getMessage, sendMessage } from '../controllers/message.controller.js';

const router = express.Router();

router.post('/send-message', sendMessage)
router.get('/get-message/:userId', getMessage)
router.get('/inbox/:userId/messages', getInboxMessages)

export default router;