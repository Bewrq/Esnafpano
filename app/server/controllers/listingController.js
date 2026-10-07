const Listing = require('../models/Listing');

// @desc    Tüm ilanları getir (filtreli + sayfalandırmalı)
// @route   GET /api/listings
// @access  Public
const getListings = async (req, res) => {
  try {
    const {
      city,
      district,
      category,
      status = 'active',
      minPrice,
      maxPrice,
      search,
      page = 1,
      limit = 12,
      sort = '-createdAt',
    } = req.query;

    const filter = {};

    if (status) filter.status = status;
    if (city) filter.city = new RegExp(city, 'i');
    if (district) filter.district = new RegExp(district, 'i');
    if (category) filter.category = category;
    if (req.query.owner) filter.owner = req.query.owner;

    if (minPrice !== undefined || maxPrice !== undefined) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    if (search) {
      filter.$text = { $search: search };
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Listing.countDocuments(filter);

    const listings = await Listing.find(filter)
      .populate('owner', 'name phone')
      .sort(sort)
      .skip(skip)
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      data: listings,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Öne çıkan ilanları getir (kategori destekli)
// @route   GET /api/listings/featured
// @access  Public
const getFeaturedListings = async (req, res) => {
  try {
    const query = { isFeatured: true, status: 'active' };
    if (req.query.category) {
      query.category = req.query.category;
    }

    let listings = await Listing.find(query)
      .populate('owner', 'name phone')
      .sort('-createdAt')
      .limit(8);

    // Eğer o kategoriye ait öne çıkan yoksa en son o kategorideki aktif ilanları getir
    if (listings.length === 0 && req.query.category) {
      listings = await Listing.find({ category: req.query.category, status: 'active' })
        .populate('owner', 'name phone')
        .sort('-createdAt')
        .limit(8);
    }

    res.status(200).json({
      success: true,
      count: listings.length,
      data: listings,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Kullanıcının / Esnafın Mağaza Sayfasını Getir (Dolap / Sahibinden tarzı)
// @route   GET /api/listings/store/:ownerId
// @access  Public
const getStoreProfile = async (req, res) => {
  try {
    const User = require('../models/User');
    const { ownerId } = req.params;

    let owner = null;
    try {
      owner = await User.findById(ownerId).select('name email phone role createdAt avatar');
    } catch {
      owner = null;
    }

    const listings = await Listing.find({ owner: ownerId, status: 'active' })
      .populate('owner', 'name phone avatar')
      .sort('-createdAt');

    // Eğer kullanıcı tablosunda tam bulunamadıysa ilk ilanın sahibinden al
    const storeName = owner?.name || (listings[0]?.owner?.name) || 'Esnaf / Satıcı Mağazası';
    const storePhone = owner?.phone || (listings[0]?.contactPhone) || '';
    const storeCity = listings[0]?.city || 'Türkiye';
    const createdAt = owner?.createdAt || (listings[0]?.createdAt) || new Date();
    const avatar = owner?.avatar || '';

    res.status(200).json({
      success: true,
      store: {
        id: ownerId,
        name: storeName,
        phone: storePhone,
        city: storeCity,
        role: owner?.role || 'esnaf',
        createdAt,
        avatar,
        totalListings: listings.length,
      },
      listings,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Tekil ilan detayı
// @route   GET /api/listings/:id
// @access  Public
const getListingById = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id).populate(
      'owner',
      'name phone email role'
    );

    if (!listing) {
      return res.status(404).json({ success: false, message: 'İlan bulunamadı' });
    }

    // Görüntülenme sayısını artır
    listing.viewCount += 1;
    await listing.save();

    res.status(200).json({ success: true, data: listing });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Yeni ilan oluştur (Kayıtlı veya Misafir Kullanıcı)
// @route   POST /api/listings
// @access  Public (isteğe bağlı auth)
const createListing = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      businessType,
      businessFeatures,
      workingHours,
      websiteOrSocial,
      city,
      district,
      address,
      price,
      priceLabel,
      contactPhone,
      whatsappLink,
      images,
    } = req.body;

    const User = require('../models/User');
    const jwt = require('jsonwebtoken');

    let ownerId;
    let createdToken = null;
    let authenticatedUser = null;

    if (req.user && req.user._id) {
      ownerId = req.user._id;
      authenticatedUser = req.user;
    } else {
      // Misafir kullanıcı için telefon veya e-posta ile otomatik kullanıcı bağla/oluştur
      const cleanPhone = (contactPhone || '').replace(/\D/g, '');
      let existingUser = null;
      if (cleanPhone) {
        existingUser = await User.findOne({ phone: cleanPhone });
      }

      if (!existingUser) {
        const dummyEmail = `esnaf_${Date.now()}_${Math.floor(Math.random() * 1000)}@esnafpano.local`;
        const dummyPassword = `EsnafPano_${Math.random().toString(36).slice(2, 10)}!`;
        existingUser = await User.create({
          name: title ? title.slice(0, 40) : 'İlan Sahibi',
          email: dummyEmail,
          password: dummyPassword,
          phone: cleanPhone || '05000000000',
          role: category === 'İş Arıyorum' ? 'bireysel' : 'esnaf',
        });
      }

      ownerId = existingUser._id;
      authenticatedUser = existingUser;

      // Kullanıcının tarayıcısında oturumu açık tutmak için token oluştur
      createdToken = jwt.sign({ id: existingUser._id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
      });
    }

    const listing = await Listing.create({
      title,
      description,
      category,
      businessType,
      businessFeatures: businessFeatures || [],
      workingHours,
      websiteOrSocial,
      city,
      district,
      address,
      price: price ? Number(price) : undefined,
      priceLabel,
      contactPhone,
      whatsappLink,
      images: images || [],
      owner: ownerId,
      status: 'active',
      isFeatured: false,
    });

    res.status(201).json({
      success: true,
      message: 'İlan başarıyla oluşturuldu ve yayına alındı',
      data: listing,
      token: createdToken,
      user: authenticatedUser ? {
        id: authenticatedUser._id,
        name: authenticatedUser.name,
        email: authenticatedUser.email,
        phone: authenticatedUser.phone,
        role: authenticatedUser.role,
      } : undefined,
    });
  } catch (error) {
    console.error('İlan oluşturma hatası:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    İlan güncelle
// @route   PUT /api/listings/:id
// @access  Private (Sahip veya Admin)
const updateListing = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({ success: false, message: 'İlan bulunamadı' });
    }

    // Yetki kontrolü
    if (listing.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Bu işlem için yetkiniz yok' });
    }

    // Admin dışında isFeatured değiştirilemez
    if (req.body.isFeatured !== undefined && req.user.role !== 'admin') {
      delete req.body.isFeatured;
    }

    const updatedListing = await Listing.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: 'İlan güncellendi',
      data: updatedListing,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    İlan sil
// @route   DELETE /api/listings/:id
// @access  Private (Sahip veya Admin)
const deleteListing = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({ success: false, message: 'İlan bulunamadı' });
    }

    if (listing.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Bu işlem için yetkiniz yok' });
    }

    await listing.deleteOne();

    res.status(200).json({ success: true, message: 'İlan başarıyla silindi' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Kullanıcının kendi ilanlarını getir (Hesap ID veya Telefon Numarası ile)
// @route   GET /api/listings/my
// @access  Private
const getMyListings = async (req, res) => {
  try {
    const cleanPhone = (req.user.phone || '').replace(/\D/g, '');
    const query = {
      $or: [
        { owner: req.user._id },
      ],
    };

    if (cleanPhone && cleanPhone.length >= 7) {
      query.$or.push({ contactPhone: new RegExp(cleanPhone.slice(-10), 'i') });
    }

    const listings = await Listing.find(query).sort('-createdAt');
    res.status(200).json({
      success: true,
      count: listings.length,
      data: listings,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    İlana Soru Sor (Soru-Cevap modülü)
// @route   POST /api/listings/:id/questions
// @access  Private
const addQuestion = async (req, res) => {
  try {
    const { question } = req.body;
    if (!question || !question.trim()) {
      return res.status(400).json({ success: false, message: 'Soru metni boş olamaz' });
    }

    const listing = await Listing.findById(req.params.id);
    if (!listing) {
      return res.status(404).json({ success: false, message: 'İlan bulunamadı' });
    }

    const newQuestion = {
      user: req.user._id,
      userName: req.user.name || 'Kullanıcı',
      question: question.trim(),
      createdAt: new Date(),
    };

    listing.questions.push(newQuestion);
    await listing.save();

    res.status(201).json({
      success: true,
      message: 'Sorunuz satıcıya iletildi',
      questions: listing.questions,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Soruyu Cevapla (Sadece İlan Sahibi)
// @route   POST /api/listings/:id/questions/:questionId/answer
// @access  Private
const answerQuestion = async (req, res) => {
  try {
    const { answer } = req.body;
    if (!answer || !answer.trim()) {
      return res.status(400).json({ success: false, message: 'Cevap metni boş olamaz' });
    }

    const listing = await Listing.findById(req.params.id);
    if (!listing) {
      return res.status(404).json({ success: false, message: 'İlan bulunamadı' });
    }

    // Sadece ilan sahibi veya admin cevap verebilir
    if (listing.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Yalnızca ilan sahibi soruları yanıtlayabilir' });
    }

    const questionItem = listing.questions.id(req.params.questionId);
    if (!questionItem) {
      return res.status(404).json({ success: false, message: 'Soru bulunamadı' });
    }

    questionItem.answer = answer.trim();
    questionItem.answeredAt = new Date();
    await listing.save();

    res.status(200).json({
      success: true,
      message: 'Cevabınız yayınlandı',
      questions: listing.questions,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
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
};
