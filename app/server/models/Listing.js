const mongoose = require('mongoose');

const listingSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'İlan başlığı zorunludur'],
      trim: true,
      maxlength: [100, 'Başlık 100 karakterden uzun olamaz'],
    },
    description: {
      type: String,
      required: [true, 'İlan açıklaması zorunludur'],
      maxlength: [2000, 'Açıklama 2000 karakterden uzun olamaz'],
    },
    category: {
      type: String,
      required: [true, 'Kategori alanı zorunludur'],
      set: function (val) {
        if (!val) return val;
        const v = val.toLowerCase();
        if (v.includes('kafe') || v.includes('restoran') || v.includes('lokanta') || v.includes('cafe')) return 'Kafe & Restoran';
        if (v.includes('sanayi') || v.includes('bakim') || v.includes('bakım') || v.includes('oto tamir')) return 'Oto Sanayi & Araç Bakım';
        if (v.includes('tanıtım') || v.includes('tanitim') || v.includes('reklam') || v.includes('isletme') || v.includes('işletme')) return 'Dükkan & İşletme Tanıtımı';
        if (v.includes('eleman')) return 'Eleman Aranıyor';
        if (v.includes('devir') || (v.includes('dukkan') && v.includes('kira')) || (v.includes('dükkan') && v.includes('kira'))) return 'Dükkan Devir/Kiralama';
        if (v.includes('hizmet') || v.includes('usta')) return 'Hizmet/Ustalık';
        if (v.includes('motor') || v.includes('scooter') || v.includes('motosiklet')) return 'Motosiklet';
        if (v.includes('araba') || v.includes('vasita') || v.includes('vasıta') || v.includes('araç') || v.includes('arac') || v.includes('oto')) return 'Vasıta & Araç';
        if (v.includes('is') || v.includes('iş')) return 'İş Arıyorum';
        return val;
      },
      enum: [
        'Dükkan & İşletme Tanıtımı',
        'Kafe & Restoran',
        'Oto Sanayi & Araç Bakım',
        'İş Arıyorum',
        'Eleman Aranıyor',
        'Dükkan Devir/Kiralama',
        'Hizmet/Ustalık',
        'Vasıta & Araç',
        'Motosiklet',
      ],
    },
    // İşletme & Dükkan Reklamı Detayları
    businessType: {
      type: String,
      trim: true,
    },
    businessFeatures: [{
      type: String,
      trim: true,
    }],
    workingHours: {
      type: String,
      trim: true,
    },
    websiteOrSocial: {
      type: String,
      trim: true,
    },
    city: {
      type: String,
      required: [true, 'Şehir (İl) alanı zorunludur'],
      trim: true,
    },
    district: {
      type: String,
      required: [true, 'İlçe alanı zorunludur'],
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
    price: {
      type: Number,
      min: [0, 'Fiyat negatif olamaz'],
    },
    priceLabel: {
      type: String,
      trim: true, // Örn: "5.000 TL/ay", "Pazarlıklı"
    },
    contactPhone: {
      type: String,
      trim: true,
      default: '',
    },
    whatsappLink: {
      type: String,
      trim: true,
      default: '',
    },
    images: {
      type: [String],
      default: [],
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ['active', 'pending', 'sold'],
      default: 'active',
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    viewCount: {
      type: Number,
      default: 0,
    },
    questions: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        userName: { type: String, default: 'Kullanıcı' },
        question: { type: String, required: true },
        answer: { type: String, default: '' },
        answeredAt: { type: Date },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Arama için text index
listingSchema.index({ title: 'text', description: 'text', city: 'text', district: 'text' });
listingSchema.index({ city: 1, district: 1, category: 1 });
listingSchema.index({ isFeatured: 1, status: 1 });

module.exports = mongoose.model('Listing', listingSchema);
