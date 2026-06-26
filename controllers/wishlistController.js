const Wishlist = require('../models/wishlistModel');
const Product = require('../models/productModel');

// GET /wishlist
const getWishlist = async (req, res) => {
  try {
    const customerId = req.session.customer._id;

    let wishlist = await Wishlist.findOne({ customerId })
      .populate('products.productId')
      .lean();

    const items = wishlist
      ? wishlist.products
          .filter(item => item.productId) // filter out deleted products
          .map(item => ({
            ...item,
            productId: {
              ...item.productId,
              _id: item.productId._id.toString()
            }
          }))
      : [];

    res.render('wishlist', { items, title: 'My Wishlist' });
  } catch (err) {
    console.error('getWishlist error:', err);
    res.status(500).send('Server Error');
  }
};

// POST /wishlist/add/:productId
const addToWishlist = async (req, res) => {
  try {
    const customerId = req.session.customer._id;
    const { productId } = req.params;

    let wishlist = await Wishlist.findOne({ customerId });

    if (!wishlist) {
      wishlist = new Wishlist({ customerId, products: [] });
    }

    const alreadyExists = wishlist.products.some(
      item => item.productId.toString() === productId
    );

    if (!alreadyExists) {
      wishlist.products.push({ productId });
      await wishlist.save();
    }

    res.json({ success: true, message: 'Added to wishlist' });
  } catch (err) {
    console.error('addToWishlist error:', err);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// DELETE /wishlist/remove/:productId
const removeFromWishlist = async (req, res) => {
  try {
    const customerId = req.session.customer._id;
    const { productId } = req.params;

    await Wishlist.findOneAndUpdate(
      { customerId },
      { $pull: { products: { productId } } }
    );

    res.json({ success: true, message: 'Removed from wishlist' });
  } catch (err) {
    console.error('removeFromWishlist error:', err);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// POST /wishlist/move-to-cart/:productId
const moveToCart = async (req, res) => {
  try {
    const customerId = req.session.customer._id;
    const { productId } = req.params;

    // Pull from wishlist
    await Wishlist.findOneAndUpdate(
      { customerId },
      { $pull: { products: { productId } } }
    );

    // Add to cart (using your existing cart structure inside Customer model)
    const Customer = require('../models/customerModel');
    await Customer.findByIdAndUpdate(customerId, {
      $addToSet: { cart: { productId, quantity: 1 } }
    });

    res.json({ success: true, message: 'Moved to cart' });
  } catch (err) {
    console.error('moveToCart error:', err);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

module.exports = { getWishlist, addToWishlist, removeFromWishlist, moveToCart };