const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    listing: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Listing',
    },
    content: {
      type: String,
      required: [true, 'Mesaj metni boş olamaz'],
      trim: true,
      maxlength: [2000, 'Mesaj çok uzun'],
    },
    read: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

messageSchema.index({ sender: 1, recipient: 1 });
messageSchema.index({ recipient: 1, read: 1 });

module.exports = mongoose.model('Message', messageSchema);
