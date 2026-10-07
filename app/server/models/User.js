const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Ad alanı zorunludur'],
      trim: true,
      maxlength: [50, 'Ad 50 karakterden uzun olamaz'],
    },
    email: {
      type: String,
      required: [true, 'E-posta alanı zorunludur'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Geçerli bir e-posta adresi giriniz'],
    },
    password: {
      type: String,
      required: [true, 'Şifre alanı zorunludur'],
      minlength: [6, 'Şifre en az 6 karakter olmalıdır'],
      select: false, // Şifreyi sorgularda otomatik getirme
    },
    phone: {
      type: String,
      trim: true,
      match: [/^[0-9\s\+\-\(\)]{10,15}$/, 'Geçerli bir telefon numarası giriniz'],
    },
    role: {
      type: String,
      enum: ['bireysel', 'esnaf', 'admin'],
      default: 'bireysel',
    },
    isApproved: {
      type: Boolean,
      default: true, // Bireysel kullanıcılar otomatik onaylı
    },
    avatar: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Şifreyi kaydetmeden önce hash'le
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Şifre karşılaştırma metodu
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
