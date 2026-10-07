const jwt = require('jsonwebtoken');
const User = require('../models/User');

// JWT token oluşturma yardımcı fonksiyonu
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

// @desc    Yeni kullanıcı kaydı
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
  try {
    const { name, email, password, phone, role } = req.body;

    // E-posta zaten kayıtlı mı?
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Bu e-posta adresi zaten kullanılıyor',
      });
    }

    // Admin rolünü dışarıdan engelle
    const allowedRoles = ['bireysel', 'esnaf'];
    const userRole = allowedRoles.includes(role) ? role : 'bireysel';

    const user = await User.create({ name, email, password, phone, role: userRole });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Kayıt başarılı',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Sunucu hatası',
    });
  }
};

// @desc    Kullanıcı girişi (E-posta veya Telefon ile)
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const identifier = (email || '').trim();

    if (!identifier || !password) {
      return res.status(400).json({
        success: false,
        message: 'E-posta/Telefon ve şifre alanları zorunludur',
      });
    }

    const cleanPhone = identifier.replace(/\D/g, '');
    const searchConditions = [{ email: identifier.toLowerCase() }];
    if (cleanPhone.length >= 7) {
      searchConditions.push({ phone: new RegExp(cleanPhone.slice(-10), 'i') });
    }

    // Kullanıcıyı e-posta veya telefon ile bul
    const user = await User.findOne({ $or: searchConditions }).select('+password');

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({
        success: false,
        message: 'E-posta / Telefon veya şifre hatalı',
      });
    }

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Giriş başarılı',
      token,
      user: {
        id: user._id,
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        avatar: user.avatar || '',
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Sunucu hatası',
    });
  }
};

// @desc    Mevcut kullanıcı bilgisi
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  res.status(200).json({
    success: true,
    user: {
      id: req.user._id,
      _id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      phone: req.user.phone,
      avatar: req.user.avatar || '',
    },
  });
};

// @desc    Kullanıcı / Mağaza Profilini Güncelle
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const { name, phone, avatar } = req.body;
    const updateData = {};
    if (name) updateData.name = name.trim();
    if (phone) updateData.phone = phone.trim();
    if (avatar !== undefined) updateData.avatar = avatar;

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    // Kullanıcının ilanlarındaki telefon numarasını da senkronize et
    if (phone) {
      const Listing = require('../models/Listing');
      await Listing.updateMany(
        { owner: req.user._id },
        { $set: { contactPhone: phone.trim() } }
      );
    }

    res.status(200).json({
      success: true,
      message: 'Mağaza ve profil bilgileriniz güncellendi',
      user: {
        id: updatedUser._id,
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        phone: updatedUser.phone,
        avatar: updatedUser.avatar || '',
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { register, login, getMe, updateProfile };
