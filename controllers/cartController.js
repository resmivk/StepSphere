const User = require("../models/customerModel");
const Product = require("../models/productModel");
const mongoose = require("mongoose");

// Helper function to extract user ID from session regardless of session structure
const getUserId = (req) => {
  if (req.session?.user?._id) return req.session.user._id;
  if (req.session?.user) return req.session.user;
  if (req.session?.userId) return req.session.userId;
  return null;
};

// ======================= VIEW CART =======================
exports.getCart = async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.redirect("/login");

    const user = await User.findById(userId).populate("cart.productId").lean();

    if (!user) return res.redirect("/login");

    const validCart = user.cart.filter((item) => item.productId !== null);

    let subtotal = 0;
    validCart.forEach((item) => {
      if (item.productId) {
        subtotal += item.productId.price * item.quantity;
      }
    });

    const platformFee = 20;
    const totalAmount = subtotal + platformFee;

   
    const cartItems = validCart.map((item) => {
      const p = item.productId;
      let img = '/images/default-shoe.jpg';
      if (p && p.images && p.images.length > 0 && p.images[0]) {
        img = p.images[0].startsWith('/') || p.images[0].startsWith('http') ? p.images[0] : '/' + p.images[0];
      }
      return {
        ...item,
        _id: item._id.toString(),
        productId: p
          ? {
              ...p,
              _id: p._id.toString(),
              displayImage: img
            }
          : null,
      };
    });

    res.render("user/cart", {
      userCart: cartItems,
      subtotal,
      platformFee,
      totalAmount,
      showNavbar: true,
      showfooter: true,
      user: req.session.user || { _id: userId },
    });
  } catch (error) {
    console.error("getCart error:", error);
    res.status(500).send("Error loading cart");
  }
};

// ======================= ADD TO CART =======================

exports.addToCart = async (req, res) => {
  try {
    
    const sendResponse = (success, message, redirectUrl =null,requireLogin=false,status=200)=> {
     
      if (req.xhr || req.headers.accept?.includes('json') || req.headers['content-type']?.includes('json')) {
        return res.status(status).json({ success, message, redirect: redirectUrl,requireLogin });
      }
      
      if (redirectUrl) {
        return res.redirect(redirectUrl);
      }
      return res.status(status).json({ success, message ,requireLogin});
    };

    // 1. Session Check (Check both req.session.user and req.session.userId)
    const userId = getUserId(req);
    if (!userId) {
      return sendResponse(false, "Please login to add items to cart", "/login", true, 200);
    }

    const productId = req.params.id;
    const size = req.body?.size || "M";
    const requestedQuantity = parseInt(req.body?.quantity, 10) || 1;

    // 2. Validate Size
    if (!size) {
      return sendResponse(false, "Please select a size", null, false,400);
    }

    // 3. Check Product & Stock
    const product = await Product.findById(productId);
    if (!product) {
      return sendResponse(false, "Product not found", "/cart",false, 404);
    }

    if (product.stock <= 0) {
      return sendResponse(false, "Product is out of stock", "/cart",false, 400);
    }

    // 4. Fetch User Cart
    const user = await User.findById(userId);
    if (!user) {
      return sendResponse(false, "User not found", "/login",true, 404);
    }

    if (!user.cart) user.cart = [];

    const existingItem = user.cart.find(
      item => item.productId.toString() === productId && item.size === size
    );

    const currentQtyInCart = existingItem ? existingItem.quantity : 0;
    const totalNewQuantity = currentQtyInCart + requestedQuantity;

    
    if (totalNewQuantity > 5) {
      return sendResponse(false, "Cannot add more than 5 items of this product/size", "/cart", false, 400);
    }

    if (totalNewQuantity > product.stock) {
      return sendResponse(false, `Only ${product.stock} items available in stock`, "/cart", false, 400);
    }

    // 6. Update Cart
    if (existingItem) {
      existingItem.quantity = totalNewQuantity;
    } else {
      user.cart.push({
        productId,
        size,
        quantity: requestedQuantity,
        price: product.price
      });
    }

    // Mark Mongoose array as modified to ensure persistence
    user.markModified('cart');
    await user.save();

    return sendResponse(true, "Item added to cart", "/cart", false, 200);

  } catch (error) {
    console.error("addToCart error:", error);
    if (req.xhr || req.headers.accept?.includes('json')) {
      return res.status(500).json({ success: false, message: "Internal server error" });
    }
    return res.status(500).redirect("/cart");
  }
};
// ======================= UPDATE QUANTITY =======================
exports.updateQuantity = async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.redirect("/login");

    const { id } = req.params;
    const { action } = req.query;

    const user = await User.findById(userId);
    const item = user.cart.find((item) => item.productId.toString() === id);

    if (item) {
      if (action === "inc") {
        if (item.quantity < 5) item.quantity += 1;
      }
      if (action === "dec") {
        if (item.quantity > 1) {
          item.quantity -= 1;
        } else {
          // Remove item if quantity reaches 0
          user.cart = user.cart.filter((i) => i.productId.toString() !== id);
        }
      }
      await user.save();
    }

    res.redirect("/cart");
  } catch (error) {
    console.error("updateQuantity error:", error);
    res.redirect("/cart");
  }
};

// ======================= REMOVE ITEM =======================
exports.removeItem = async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.redirect("/login");

    const productId = req.params.id;

    await User.findByIdAndUpdate(userId, {
      $pull: {
        cart: {
          productId: new mongoose.Types.ObjectId(productId),
        },
      },
    });

    res.redirect("/cart");
  } catch (error) {
    console.error("removeItem error:", error);
    res.status(500).send("Error removing item");
  }
};

// ======================= CLEAR CART =======================
exports.clearCart = async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.redirect("/login");

    await User.findByIdAndUpdate(userId, {
      $set: { cart: [] },
    });

    res.redirect("/cart");
  } catch (error) {
    console.error("clearCart error:", error);
    res.status(500).send("Error clearing cart");
  }
};

// ======================= GET CART COUNT (API) =======================
exports.getCartCount = async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.json({ count: 0 });

    const user = await User.findById(userId).lean();

    const count = user ? user.cart.length : 0;
    res.json({ count });
  } catch (error) {
    console.error("getCartCount error:", error);
    res.json({ count: 0 });
  }
};
