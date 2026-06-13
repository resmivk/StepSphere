const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    name: String,
    image: String,
    price: Number,
    quantity: Number,
    size: String
  }],
  address: {
    fullName: String,
    phone: String,
    street: String,
    city: String,
    state: String,
    pincode: String
  },
  totalAmount: Number,
  paymentMethod: { type: String, enum: ['razorpay', 'cod'] },
  paymentStatus: { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending' },
  razorpayOrderId: String,
  razorpayPaymentId: String,
  orderStatus: { 
    type: String, 
    enum: ['placed', 'processing', 'shipped', 'delivered', 'cancelled'], 
    default: 'placed' 
  },
  cancelReason: String
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);