const express = require('express');
const router = express.Router();
const { register, login, getMe, updateProfile } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

// POST /api/auth/register
router.post('/register', register);

// POST /api/auth/login
router.post('/login', login);

// GET /api/auth/me
router.get('/me', protect, getMe);

// PUT /api/auth/profile - Mağaza/Profil bilgilerini güncelle
router.put('/profile', protect, updateProfile);

module.exports = router;
