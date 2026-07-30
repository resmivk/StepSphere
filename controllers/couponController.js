const Coupon = require('../models/couponModel');



// GET /admin/coupons - List all coupons
exports.getCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 }).lean();
    res.render('admin/coupons', {
      admin: true,
      title: 'Coupon Management',
      activePage: 'coupons',
      coupons
    });
  } catch (error) {
    console.error('getCoupons error:', error);
    res.status(500).send('Server error');
  }
};

// POST /admin/coupons/add - Create a coupon
exports.createCoupon = async (req, res) => {
  try {
    const { code, discountType, discountValue, minPurchase, maxDiscount, expiryDate, usageLimit } = req.body;

    const existing = await Coupon.findOne({ code: code.toUpperCase().trim() });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Coupon code already exists' });
    }

    const newCoupon = new Coupon({
      code: code.toUpperCase().trim(),
      discountType,
      discountValue: parseFloat(discountValue),
      minPurchase: parseFloat(minPurchase) || 0,
      maxDiscount: maxDiscount ? parseFloat(maxDiscount) : null,
      expiryDate: new Date(expiryDate),
      usageLimit: usageLimit ? parseInt(usageLimit, 10) : 100
    });

    await newCoupon.save();
    res.json({ success: true, message: 'Coupon created successfully!' });
  } catch (error) {
    console.error('createCoupon error:', error);
    res.status(500).json({ success: false, message: 'Failed to create coupon' });
  }
};

// GET /admin/coupons/toggle/:id - Toggle active state
exports.toggleCouponStatus = async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    if (coupon) {
      coupon.isActive = !coupon.isActive;
      await coupon.save();
    }
    res.redirect('/admin/coupons');
  } catch (error) {
    console.error('toggleCouponStatus error:', error);
    res.redirect('/admin/coupons');
  }
};

// GET /admin/coupons/delete/:id - Delete coupon
exports.deleteCoupon = async (req, res) => {
  try {
    await Coupon.findByIdAndDelete(req.params.id);
    res.redirect('/admin/coupons');
  } catch (error) {
    console.error('deleteCoupon error:', error);
    res.redirect('/admin/coupons');
  }
};

// POST /coupon/apply - User checkout coupon verification
exports.applyCoupon = async (req, res) => {
  try {
    const { code, subtotal } = req.body;
    const currentSubtotal = parseFloat(subtotal);

    if (!code || isNaN(currentSubtotal)) {
      return res.status(400).json({ success: false, message: 'Invalid coupon request' });
    }

    const coupon = await Coupon.findOne({ code: code.toUpperCase().trim() });

    if (!coupon) {
      return res.status(404).json({ success: false, message: 'Invalid coupon code' });
    }

    if (!coupon.isActive) {
      return res.status(400).json({ success: false, message: 'This coupon is inactive' });
    }

    if (new Date(coupon.expiryDate) < new Date()) {
      return res.status(400).json({ success: false, message: 'This coupon has expired' });
    }

    if (coupon.usedCount >= coupon.usageLimit) {
      return res.status(400).json({ success: false, message: 'Coupon usage limit reached' });
    }

    if (currentSubtotal < coupon.minPurchase) {
      return res.status(400).json({
        success: false,
        message: `Minimum purchase of ₹${coupon.minPurchase} required for this coupon`
      });
    }

    let discountAmount = 0;
    if (coupon.discountType === 'percentage') {
      discountAmount = (currentSubtotal * coupon.discountValue) / 100;
      if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
        discountAmount = coupon.maxDiscount;
      }
    } else {
      discountAmount = coupon.discountValue;
    }

    discountAmount = Math.min(discountAmount, currentSubtotal);
    const platformFee = 20;
    const finalTotal = Math.max(0, currentSubtotal - discountAmount + platformFee);

    res.json({
      success: true,
      message: `Coupon '${coupon.code}' applied! Saved ₹${discountAmount.toFixed(2)}`,
      discountAmount: discountAmount.toFixed(2),
      finalTotal: finalTotal.toFixed(2),
      code: coupon.code
    });
  } catch (error) {
    console.error('applyCoupon error:', error);
    res.status(500).json({ success: false, message: 'Failed to apply coupon' });
  }
};
