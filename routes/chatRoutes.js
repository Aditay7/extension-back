const express = require('express');
const router = express.Router();
const Chat = require('../models/Chat');
const { protect } = require('../middleware/authMiddleware');

// Get user's chat history
router.get('/', protect, async (req, res) => {
  try {
    const chats = await Chat.find({ userId: req.user._id })
      .sort({ lastUpdated: -1 })
      .limit(20);
    res.json(chats);
  } catch (error) {
    console.error('Get chats error:', error);
    res.status(500).json({ message: 'Error fetching chat history' });
  }
});

// Save new chat message
router.post('/', protect, async (req, res) => {
  try {
    const { messages, model } = req.body;
    
    const chat = await Chat.create({
      userId: req.user._id,
      messages,
      model,
    });

    res.status(201).json(chat);
  } catch (error) {
    console.error('Save chat error:', error);
    res.status(500).json({ message: 'Error saving chat message' });
  }
});

// Update existing chat
router.put('/:chatId', protect, async (req, res) => {
  try {
    const { messages } = req.body;
    const chat = await Chat.findOne({ 
      _id: req.params.chatId,
      userId: req.user._id 
    });

    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    chat.messages = messages;
    chat.lastUpdated = Date.now();
    await chat.save();

    res.json(chat);
  } catch (error) {
    console.error('Update chat error:', error);
    res.status(500).json({ message: 'Error updating chat' });
  }
});

// Delete chat
router.delete('/:id', protect, async (req, res) => {
    try {
        const chat = await Chat.findOne({ 
            _id: req.params.id,
            userId: req.user._id 
        });
        
        if (!chat) {
            return res.status(404).json({ message: 'Chat not found' });
        }

        await Chat.deleteOne({ _id: req.params.id });
        res.json({ message: 'Chat deleted successfully' });
    } catch (error) {
        console.error('Delete chat error:', error);
        res.status(500).json({ message: 'Error deleting chat' });
    }
});

module.exports = router; 