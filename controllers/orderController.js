const Order = require('../models/orderModel');
const User = require('../models/customerModel');
const Product = require('../models/productModel');
const Razorpay = require('razorpay');
const crypto = require('crypto');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// Show checkout page
exports.loadCheckout = async (req, res) => {
  try {
    if (!req.session.user) return res.redirect('/login');

    const user = await User.findById(req.session.user._id)
      .populate('cart.productId').lean();

    const validCart = user.cart.filter(item => item.productId !== null);

    if (validCart.length === 0) return res.redirect('/cart');

    const subtotal = validCart.reduce((sum, item) => 
      sum + item.productId.price * item.quantity, 0);
    const platformFee = 20;
    const totalAmount = subtotal + platformFee;

    res.render('user/checkout', {
      cartItems: validCart,
      subtotal,
      platformFee,
      totalAmount,
      razorpayKeyId: process.env.RAZORPAY_KEY_ID,
      userName: user.name,
      userPhone: user.phone || '',
      userAddress: user.address || '' ,
      showNavbar: true,
      showfooter: true,
      user: req.session.user
    });
  } catch (error) {
    res.status(500).send("Error: " + error.message);
  }
};

// Create Razorpay order
exports.createRazorpayOrder = async (req, res) => {
  try {
    const { totalAmount } = req.body;
    const options = {
      amount: totalAmount * 100, // paise
      currency: 'INR',
      receipt: `order_${Date.now()}`
    };
    const razorpayOrder = await razorpay.orders.create(options);
    res.json({ success: true, order: razorpayOrder });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Place order after payment
exports.placeOrder = async (req, res) => {
  try {
    if (!req.session.user) return res.status(401).json({ success: false });

    const { address, paymentMethod, razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

    // Verify Razorpay signature
    if (paymentMethod === 'razorpay') {
      const body = razorpayOrderId + '|' + razorpayPaymentId;
      const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(body)
        .digest('hex');

      if (expectedSignature !== razorpaySignature) {
        return res.status(400).json({ success: false, message: 'Payment verification failed' });
      }
    }

    // Get cart from user
    const user = await User.findById(req.session.user._id)
      .populate('cart.productId');

    const validCart = user.cart.filter(item => item.productId !== null);

    const items = validCart.map(item => ({
      product: item.productId._id,
      name: item.productId.name,
      image: item.productId.images?.[0] || '',
      price: item.productId.price,
      quantity: item.quantity,
      size: item.size || ''
    }));

    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const totalAmount = subtotal + 20; // platform fee

    // Save order
    const order = new Order({
      user: req.session.user._id,
      items,
      address,
      totalAmount,
      paymentMethod,
      paymentStatus: paymentMethod === 'razorpay' ? 'paid' : 'pending',
      razorpayOrderId: razorpayOrderId || '',
      razorpayPaymentId: razorpayPaymentId || ''
    });

    await order.save();

    // Clear user cart
    await User.findByIdAndUpdate(req.session.user._id, {
      $set: { cart: [] }
    });

    res.json({ success: true, orderId: order._id });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Order success page
exports.orderSuccess = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).lean();
    res.render('user/orderSuccess', { 
      order, 
      showNavbar: true, 
      showfooter: true 
    });
  } catch (error) {
    res.status(500).send("Error: " + error.message);
  }
};

// Order history
exports.orderHistory = async (req, res) => {
  try {
    if (!req.session.user) return res.redirect('/login');

    const orders = await Order.find({ user: req.session.user._id })
      .sort({ createdAt: -1 }).lean();

    res.render('user/orderHistory', { 
      orders, 
      showNavbar: true, 
      showfooter: true 
    });
  } catch (error) {
    res.status(500).send("Error: " + error.message);
  }
};

// Cancel order
exports.cancelOrder = async (req, res) => {
  try {
    const { reason } = req.body;
    const order = await Order.findOne({ 
      _id: req.params.id, 
      user: req.session.user._id 
    });

    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    if (['shipped', 'delivered'].includes(order.orderStatus)) {
      return res.status(400).json({ success: false, message: 'Cannot cancel this order' });
    }

    order.orderStatus = 'cancelled';
    order.cancelReason = reason;
    await order.save();

    res.json({ success: true, message: 'Order cancelled successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
