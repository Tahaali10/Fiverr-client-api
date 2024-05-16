import Message from '../model/message.model.js';
import { errorHandler } from '../utils/error.js';
import bcryptjs from 'bcryptjs';
import { Server } from 'socket.io';

// Initialize socket.io server
const io = new Server();

// Function to emit new message to all active sockets
const emitNewMessage = (message) => {
  io.emit('newMessage', message);
};

export const sendMessage = async (req, res, next) => {
  const { senderId, receiverId, content } = req.body;
  try {
    const newMessage = await Message.create({ senderId, receiverId, content });
    // Emit message to all active sockets
    emitNewMessage(newMessage);
    res.status(201).json({ success: true, message: 'Message sent successfully', newMessage });
  } catch (error) {
    next(error);
  }
};

export const getMessage= async (req, res, next) => {
  const userId = req.params.userId;
  try {
    const messages = await Message.find({
      $or: [{ senderId: userId }, { receiverId: userId }]
    }).sort({ timestamp: 'asc' }).select('content timestamp'); 
    res.status(200).json({ success: true, messages });
  } catch (error) {
    next(error);
  }
};

export const getInboxMessages = async (req, res, next) => {
    try {
      const messages = await Message.find().select('senderId receiverId content timestamp'); // Selecting senderId, receiverId, content, and timestamp fields
  
      const categorizedMessages = {};
  
      messages.forEach((message) => {
        const { senderId, receiverId, content, timestamp } = message;
        if (!categorizedMessages[receiverId]) {
          categorizedMessages[receiverId] = [];
        }
        categorizedMessages[receiverId].push({ senderId, content, timestamp });
      });
  
      res.status(200).json({ success: true, categorizedMessages });
    } catch (error) {
      next(error);
    }
  };
  

// Socket.IO Integration
io.on('connection', (socket) => {
  console.log('Socket connected:', socket.id);

  // Handle Sending Message
  socket.on('sendMessage', async ({ senderId, receiverId, content }) => {
    try {
      // Save Message to Database
      const newMessage = await Message.create({ senderId, receiverId, content });
      // Emit Message to All Clients
      emitNewMessage(newMessage);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  });

  // Handle Disconnect
  socket.on('disconnect', () => {
    console.log('Socket disconnected:', socket.id);
  });
});
