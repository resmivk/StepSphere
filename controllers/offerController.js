const Offer = require('../models/offerModel');
const Category = require('../models/categoryModel');
const Product = require('../models/productModel');

// GET /admin/offers - List all offers
exports.getOffers = async (req, res) => {
  try {
    const offers = await Offer.find()
      .populate('targetCategory')
      .populate('targetProduct')
      .sort({ createdAt: -1 })
      .lean();

    const categories = await Category.find().lean();
    const products = await Product.find().lean();

    res.render('admin/offers', {
      admin: true,
      title: 'Offer Management',
      activePage: 'offers',
      offers,
      categories,
      products
    });
  } catch (error) {
    console.error('getOffers error:', error);
    res.status(500).send('Server error');
  }
};

// POST /admin/offers/add - Create an offer
exports.createOffer = async (req, res) => {
  try {
    const { title, discountPercentage, targetType, targetCategory, targetProduct, startDate, endDate } = req.body;

    const newOffer = new Offer({
      title: title.trim(),
      discountPercentage: parseFloat(discountPercentage),
      targetType,
      targetCategory: targetType === 'category' ? targetCategory : null,
      targetProduct: targetType === 'product' ? targetProduct : null,
      startDate: startDate ? new Date(startDate) : new Date(),
      endDate: new Date(endDate)
    });

    await newOffer.save();

    // Optionally apply discount to target product
    if (targetType === 'product' && targetProduct) {
      await Product.findByIdAndUpdate(targetProduct, {
        discount: parseFloat(discountPercentage)
      });
    }

    res.json({ success: true, message: 'Offer created successfully!' });
  } catch (error) {
    console.error('createOffer error:', error);
    res.status(500).json({ success: false, message: 'Failed to create offer' });
  }
};

// GET /admin/offers/toggle/:id - Toggle active status
exports.toggleOfferStatus = async (req, res) => {
  try {
    const offer = await Offer.findById(req.params.id);
    if (offer) {
      offer.isActive = !offer.isActive;
      await offer.save();
    }
    res.redirect('/admin/offers');
  } catch (error) {
    console.error('toggleOfferStatus error:', error);
    res.redirect('/admin/offers');
  }
};

// GET /admin/offers/delete/:id - Delete offer
exports.deleteOffer = async (req, res) => {
  try {
    await Offer.findByIdAndDelete(req.params.id);
    res.redirect('/admin/offers');
  } catch (error) {
    console.error('deleteOffer error:', error);
    res.redirect('/admin/offers');
  }
};
