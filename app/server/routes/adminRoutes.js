const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getUsers,
  deleteUser,
  getAdminListings,
  deleteAdminListing,
} = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/auth');

// Tüm Admin rotaları için hem geçerli token hem de admin rolü ZORUNLUDUR!
router.use(protect, adminOnly);

// GET /api/admin/stats - Gösterge paneli ve analitik verileri
router.get('/stats', getDashboardStats);

// GET & DELETE /api/admin/users - Kullanıcı listesi ve silme
router.get('/users', getUsers);
router.delete('/users/:id', deleteUser);

// GET & DELETE /api/admin/listings - İlan listesi ve moderasyon
router.get('/listings', getAdminListings);
router.delete('/listings/:id', deleteAdminListing);

module.exports = router;
