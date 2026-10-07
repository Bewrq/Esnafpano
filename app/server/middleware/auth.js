const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Kimlik doğrulama middleware'i
const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Bu işlem için giriş yapmanız gerekmektedir',
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id);

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Kullanıcı bulunamadı',
      });
    }

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Geçersiz veya süresi dolmuş token',
    });
  }
};

// İsteğe bağlı kimlik doğrulama (token varsa user ekler, yoksa devam eder)
const optionalProtect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id);
    next();
  } catch (error) {
    // Token hatalı olsa bile anonim devam et
    next();
  }
};

// Sadece admin erişimi
const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: 'Bu işlem için admin yetkisi gerekmektedir',
    });
  }
};

// İlan sahibi veya admin kontrolü
const ownerOrAdmin = (model) => async (req, res, next) => {
  try {
    const resource = await model.findById(req.params.id);

    if (!resource) {
      return res.status(404).json({ success: false, message: 'Kaynak bulunamadı' });
    }

    if (resource.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Bu işlem için yetkiniz bulunmamaktadır',
      });
    }

    req.resource = resource;
    next();
  } catch (error) {
    res.status(500).json({ success: false, message: 'Sunucu hatası' });
  }
};

module.exports = { protect, optionalProtect, adminOnly, ownerOrAdmin };
