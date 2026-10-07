const express = require('express');
const router = express.Router();
const {
  getListings,
  getFeaturedListings,
  getListingById,
  createListing,
  updateListing,
  deleteListing,
  getMyListings,
  getStoreProfile,
  addQuestion,
  answerQuestion,
} = require('../controllers/listingController');
const { protect } = require('../middleware/auth');

// GET /api/listings/featured - ÖNE ÇIKAN ilanlar (spesifik route önce tanımlanmalı)
router.get('/featured', getFeaturedListings);

// GET /api/listings/store/:ownerId - Kullanıcının/Esnafın Mağazası
router.get('/store/:ownerId', getStoreProfile);

// GET /api/listings/my - Kullanıcının kendi ilanları (auth gerekli)
router.get('/my', protect, getMyListings);

// POST /api/listings/:id/questions - Soru sor
router.post('/:id/questions', protect, addQuestion);

// POST /api/listings/:id/questions/:questionId/answer - Soruyu cevapla
router.post('/:id/questions/:questionId/answer', protect, answerQuestion);

// GET /api/listings - Tüm ilanlar (filtreli + sayfalandırmalı)
// POST /api/listings - Yeni ilan oluştur (giriş gerekli)
router.route('/').get(getListings).post(protect, createListing);

// GET /api/listings/:id - Tekil ilan detayı
// PUT /api/listings/:id - İlan güncelle (auth gerekli)
// DELETE /api/listings/:id - İlan sil (auth gerekli)
router.route('/:id').get(getListingById).put(protect, updateListing).delete(protect, deleteListing);

module.exports = router;
