const Wishlist = require('../models/wishlistModel');
const Product = require('../models/productModel');
const User = require('../models/customerModel');

const getUserId = (req) => {
  if (req.session?.user?._id) return req.session.user._id;
  if (req.session?.user) return req.session.user;
  if (req.session?.userId) return req.session.userId;
  if (req.session?.customer?._id) return req.session.customer._id;
  return null;
};

////////// GET WISHLIST ///////////////////
exports.getWishlist = async (req, res) => {
  try {
    const customerId = getUserId(req);

    if (!customerId) {
      return res.redirect('/login');
    }

    let wishlist = await Wishlist.findOne({ customerId })
      .populate('products.productId')
      .lean();

    const items = wishlist
      ? wishlist.products
          .filter(item => item.productId) // filter out deleted products
          .map(item => {
            const p = item.productId;
             console.log('DEBUG product images:', p.name, p.images)
            let img = '/uploads/default-shoe.jpg';
            if (p.images && p.images.length > 0 && p.images[0]) {
              img = p.images[0];
              if (!img.startsWith('/') && !img.startsWith('http')) {
                img = '/uploads/' + img;
              }
            } else if (p.image) {
              img = p.image.startsWith('/') || p.image.startsWith('http') ? p.image : '/uploads/' + p.image;
            }
            return {
              ...item,
              productId: {
                ...p,
                _id: p._id.toString(),
                displayImage: img
              }
            };
          })
      : [];

    res.render('user/wishlist', {
      items,
      title: 'My Wishlist',
      user: req.session.user,
      showprofileSidebar: true,
      showNavbar: true,
      showfooter: true
    });
  } catch (err) {
    console.error('getWishlist error:', err);
    res.status(500).send('Server Error');
  }
};

// POST /wishlist/add/:productId
exports.addToWishlist = async (req, res) => {
  try {
    const customerId = getUserId(req);

    if (!customerId) {
      return res.json({ success: false, requireLogin: true, message: 'Please login to add items to wishlist', redirect: '/login' });
    }

    const { productId } = req.params;

    let wishlist = await Wishlist.findOne({ customerId });

    if (!wishlist) {
      wishlist = new Wishlist({ customerId, products: [] });
    }

    const alreadyExists = wishlist.products.some(
      item => item.productId && item.productId.toString() === productId
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
    const customerId = getUserId(req);

    if (!customerId) {
      return res.json({ success: false, requireLogin: true, message: 'Please login first', redirect: '/login' });
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

// POST /wishlist/move-to-cart/:productId
exports.moveToCart = async (req, res) => {
  try {
    const customerId = getUserId(req);

    if (!customerId) {
      return res.json({ success: false, requireLogin: true, message: 'Please login first', redirect: '/login' });
    }

    const { productId } = req.params;

    // Fetch product details for price
    const product = await Product.findById(productId);
    if (!product) {
      return res.json({ success: false, message: 'Product not found' });
    }

    // Pull from wishlist
    await Wishlist.findOneAndUpdate(
      { customerId },
      { $pull: { products: { productId } } }
    );

    // Update user cart
    const user = await User.findById(customerId);
    if (user) {
      if (!user.cart) user.cart = [];
      const existing = user.cart.find(item => item.productId.toString() === productId);
      if (existing) {
        existing.quantity += 1;
      } else {
        user.cart.push({ productId, quantity: 1, price: product.price, size: 'M' });
      }
      user.markModified('cart');
      await user.save();
    }

    res.json({ success: true, message: 'Moved to cart successfully!' });
  } catch (err) {
    console.error('moveToCart error:', err);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

