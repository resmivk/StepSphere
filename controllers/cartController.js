

const User = require('../models/customerModel');
const Product = require('../models/productModel');
const mongoose = require('mongoose');
 
// ======================= VIEW CART =======================
exports.getCart = async (req, res) => {
    try {
        if (!req.session.user) return res.redirect('/login');
 
        const userId = req.session.user._id;
        const user = await User.findById(userId).populate("cart.productId").lean();
 
        if (!user) return res.redirect('/login');
 
        // Filter out deleted products
        const validCart = user.cart.filter(item => item.productId !== null);
 
        // Calculate subtotal
        let subtotal = 0;
        validCart.forEach(item => {
            if (item.productId) {
                subtotal += item.productId.price * item.quantity;
            }
        });
 
        const platformFee = 20;
        const totalAmount = subtotal + platformFee;
 
        // Convert _id to string for Handlebars
        const cartItems = validCart.map(item => ({
            ...item,
            _id: item._id.toString(),
            productId: item.productId ? {
                ...item.productId,
                _id: item.productId._id.toString()
            } : null
        }));
 
        res.render("user/cart", {
            userCart: cartItems,
            subtotal,
            platformFee,
            totalAmount,
            showNavbar: true,
            showfooter: true,
            user: req.session.user
        });
 
    } catch (error) {
        console.error('getCart error:', error);
        res.status(500).send("Error loading cart");
    }
};
 
// ======================= ADD TO CART =======================
exports.addToCart = async (req, res) => {
    try {
        if (!req.session.user) return res.redirect('/login');
 
        const productId = req.params.id;
        const userId = req.session.user._id;
        const quantity = parseInt(req.body.quantity) || 1;
        const user = await User.findById(userId);
        if (!user) return res.redirect('/login');
        
        const product = await Product.findById(productId);
 
        if (!product) return res.status(404).send("Product not found");
  if (!user.cart) user.cart = [];
        // Check stock
        if (product.stock <= 0) {
            return res.status(400).send("Product is out of stock");
        }
 
        // Check if already in cart
        const existingItem = user.cart.find(item =>
            item.productId.toString() === productId
        );
 
        if (existingItem) {
            // Max quantity check (limit to 5)
            if (existingItem.quantity >= 5) {
                return res.redirect('/cart');
            }
            existingItem.quantity += quantity;
        } else {
            user.cart.push({
                productId: productId,
                quantity: quantity,
                price: product.price
            });
        }
 
        await user.save();
        res.redirect("/cart");
 
    } catch (error) {
        console.error('addToCart error:', error);
        res.status(500).send("Error adding to cart");
    }
};
 
// ======================= UPDATE QUANTITY =======================
exports.updateQuantity = async (req, res) => {
    try {
        if (!req.session.user) return res.redirect('/login');
 
        const { id } = req.params;
        const { action } = req.query;
        const userId = req.session.user._id;
 
        const user = await User.findById(userId);
        const item = user.cart.find(item =>
            item.productId.toString() === id
        );
 
        if (item) {
            if (action === 'inc') {
                // Max quantity limit
                if (item.quantity < 5) item.quantity += 1;
            }
            if (action === 'dec') {
                if (item.quantity > 1) {
                    item.quantity -= 1;
                } else {
                    // Remove item if quantity reaches 0
                    user.cart = user.cart.filter(i =>
                        i.productId.toString() !== id
                    );
                }
            }
            await user.save();
        }
 
        res.redirect("/cart");
 
    } catch (error) {
        console.error('updateQuantity error:', error);
        res.redirect("/cart");
    }
};
 
// ======================= REMOVE ITEM =======================
exports.removeItem = async (req, res) => {
    try {
        if (!req.session.user) return res.redirect('/login');
 
        const productId = req.params.id;
        const userId = req.session.user._id;
 
        await User.findByIdAndUpdate(userId, {
            $pull: {
                cart: {
                    productId: new mongoose.Types.ObjectId(productId)
                }
            }
        });
 
        res.redirect("/cart");
 
    } catch (error) {
        console.error('removeItem error:', error);
        res.status(500).send("Error removing item");
    }
};
 
// ======================= CLEAR CART =======================
exports.clearCart = async (req, res) => {
    try {
        if (!req.session.user) return res.redirect('/login');
 
        const userId = req.session.user._id;
 
        await User.findByIdAndUpdate(userId, {
            $set: { cart: [] }
        });
 
        res.redirect("/cart");
 
    } catch (error) {
        console.error('clearCart error:', error);
        res.status(500).send("Error clearing cart");
    }
};
 
// ======================= GET CART COUNT (API) =======================
exports.getCartCount = async (req, res) => {
    try {
        if (!req.session.user) return res.json({ count: 0 });
 
        const userId = req.session.user._id;
        const user = await User.findById(userId).lean();
 
        const count = user ? user.cart.length : 0;
        res.json({ count });
 
    } catch (error) {
        console.error('getCartCount error:', error);
        res.json({ count: 0 });
    }
};