const Order = require('../models/orderModel');

// ======================= ALL ORDERS =======================
exports.adminOrders = async (req, res) => {
  try {
    const orders = await Order.find({})
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .lean();

    // Format date for display
    const formattedOrders = orders.map(order => ({
      ...order,
      _id: order._id.toString(),
      createdAt: new Date(order.createdAt).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      })
    }));

    res.render('admin/orders', {
      orders: formattedOrders,
      placedCount:     orders.filter(o => o.orderStatus === 'placed').length,
      processingCount: orders.filter(o => o.orderStatus === 'processing').length,
      shippedCount:    orders.filter(o => o.orderStatus === 'shipped').length,
      deliveredCount:  orders.filter(o => o.orderStatus === 'delivered').length,
      cancelledCount:  orders.filter(o => o.orderStatus === 'cancelled').length
    });

  } catch (error) {
    console.error('adminOrders error:', error);
    res.status(500).send('Error loading orders');
  }
};

// ======================= UPDATE ORDER STATUS =======================
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['placed', 'processing', 'shipped', 'delivered', 'cancelled'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    await Order.findByIdAndUpdate(req.params.id, { orderStatus: status });

    res.json({ success: true, message: 'Order status updated' });

  } catch (error) {
    console.error('updateOrderStatus error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ======================= SINGLE ORDER DETAIL =======================
exports.orderDetail = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email phone')
      .lean();

    if (!order) return res.status(404).send('Order not found');

    order._id = order._id.toString();
    order.createdAt = new Date(order.createdAt).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });

    res.render('admin/orderDetail', { order });

  } catch (error) {
    console.error('orderDetail error:', error);
    res.status(500).send('Error loading order detail');
  }
};