const Message = require('../models/Message');
const User = require('../models/User');
const Listing = require('../models/Listing');

// @desc    Yeni Mesaj Gönder (Site İçi)
// @route   POST /api/messages
// @access  Private
const sendMessage = async (req, res) => {
  try {
    const { recipientId, content, listingId } = req.body;

    if (!recipientId || !content || !content.trim()) {
      return res.status(400).json({ success: false, message: 'Alıcı ve mesaj içeriği zorunludur' });
    }

    if (recipientId.toString() === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'Kendinize mesaj gönderemezsiniz' });
    }

    const message = await Message.create({
      sender: req.user._id,
      recipient: recipientId,
      listing: listingId || null,
      content: content.trim(),
    });

    const populated = await Message.findById(message._id)
      .populate('sender', 'name avatar')
      .populate('recipient', 'name avatar')
      .populate('listing', 'title price images');

    res.status(201).json({
      success: true,
      data: populated,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Kullanıcının Tüm Konuşmalarını / Sohbet Listesini Getir
// @route   GET /api/messages/conversations
// @access  Private
const getConversations = async (req, res) => {
  try {
    const userId = req.user._id;

    // Kullanıcının gönderdiği veya aldığı tüm mesajlar
    const messages = await Message.find({
      $or: [{ sender: userId }, { recipient: userId }],
    })
      .populate('sender', 'name avatar role')
      .populate('recipient', 'name avatar role')
      .populate('listing', 'title price images')
      .sort('-createdAt');

    // Partner bazında grupla (en son mesajı tut)
    const conversationMap = new Map();

    messages.forEach((msg) => {
      const isSender = msg.sender._id.toString() === userId.toString();
      const partner = isSender ? msg.recipient : msg.sender;
      if (!partner) return;

      const partnerId = partner._id.toString();

      if (!conversationMap.has(partnerId)) {
        conversationMap.set(partnerId, {
          partner: {
            id: partner._id,
            _id: partner._id,
            name: partner.name,
            avatar: partner.avatar || '',
            role: partner.role,
          },
          listing: msg.listing || null,
          lastMessage: {
            content: msg.content,
            createdAt: msg.createdAt,
            isSender,
            read: msg.read,
          },
          unreadCount: 0,
        });
      }

      // Okunmamış mesaj sayacı
      if (!isSender && !msg.read) {
        conversationMap.get(partnerId).unreadCount += 1;
      }
    });

    const conversations = Array.from(conversationMap.values());

    res.status(200).json({
      success: true,
      count: conversations.length,
      data: conversations,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Belirli Bir Kullanıcıyla Olan Mesaj Geçmişini Getir
// @route   GET /api/messages/:otherUserId
// @access  Private
const getMessagesWithUser = async (req, res) => {
  try {
    const userId = req.user._id;
    const { otherUserId } = req.params;

    const messages = await Message.find({
      $or: [
        { sender: userId, recipient: otherUserId },
        { sender: otherUserId, recipient: userId },
      ],
    })
      .populate('sender', 'name avatar')
      .populate('recipient', 'name avatar')
      .populate('listing', 'title price images')
      .sort('createdAt');

    // Bize gelen okunmamış mesajları okundu yap
    await Message.updateMany(
      { sender: otherUserId, recipient: userId, read: false },
      { $set: { read: true } }
    );

    res.status(200).json({
      success: true,
      count: messages.length,
      data: messages,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  sendMessage,
  getConversations,
  getMessagesWithUser,
};
