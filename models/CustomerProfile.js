const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const customerProfileSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: uuidv4
  },
  userId: {
    type: String,
    ref: 'User',
    required: true,
    unique: true
  },
  addresses: [
    {
      label: String,        // e.g. 'Home', 'Office'
      addressLine: String,
      city: String,
      state: String,
      postalCode: String,
      location: {
        lat: Number,
        lng: Number
      }
    }
  ],
  preferences: {
    language: {
      type: String,
      default: 'en'
    },
    notifications: {
      type: Boolean,
      default: true
    }
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('CustomerProfile', customerProfileSchema);
