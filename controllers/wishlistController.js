const Wishlist = require('../models/wishlistModel');
const Product = require('../models/productModel');

//////////wishlist///////////////////
exports.getWishlist = async (req, res) => {
  try {
    const customerId = req.session?.customer?._id || req.session?.user?._id || req.session?.userId;

if (!customerId) {
  return res.redirect('/login');
}

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

    res.render('user/wishlist', { items, title: 'My Wishlist',
      user:req.session.user
     });
  } catch (err) {
    console.error('getWishlist error:', err);
    res.status(500).send('Server Error');
  }
};

// POST /wishlist/add/:productId
exports.addToWishlist = async (req, res) => {
  try {
    const customerId = req.session?.customer?._id || req.session?.user?._id || req.session?.userId;

if (!customerId) {
  return res.redirect('/login');
}
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
exports.removeFromWishlist = async (req, res) => {
  try {
    const customerId = req.session?.customer?._id || req.session?.user?._id || req.session?.userId;

if (!customerId) {
  return res.redirect('/login');
}
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


exports.moveToCart = async (req, res) => {
  try {
    const customerId = req.session?.customer?._id || req.session?.user?._id || req.session?.userId;

if (!customerId) {
  return res.redirect('/login');
}
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

