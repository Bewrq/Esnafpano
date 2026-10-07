const express = require('express');
const router = express.Router();
const {
  sendMessage,
  getConversations,
  getMessagesWithUser,
} = require('../controllers/messageController');
const { protect } = require('../middleware/auth');

// Tüm mesajlaşma rotaları giriş yapmayı zorunlu kılar
router.use(protect);

// POST /api/messages - Mesaj gönder
router.post('/', sendMessage);

// GET /api/messages/conversations - Tüm sohbetler listesi
router.get('/conversations', getConversations);

// GET /api/messages/:otherUserId - Belirli bir kullanıcıyla olan mesajlar
router.get('/:otherUserId', getMessagesWithUser);

module.exports = router;
