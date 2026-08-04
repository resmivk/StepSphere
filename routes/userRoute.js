
const express=require('express')
const user_Routes=express.Router()

const userController=require('../controllers/userController')
const userProfileController=require('../controllers/userProfileController')
const addressController=require('../controllers/addressController')
const CartController=require('../controllers/cartController')
const orderController=require("../controllers/orderController")
const wishlistController=require('../controllers/wishlistController')
const walletController=require('../controllers/walletController')
const passport=require('passport')

const auths=require('../middleware/auth')
const blockedCustomers=require('../middleware/checkedBlock')

user_Routes.get('/',auths.loadlogout,userController.loadHome)
user_Routes.get('/register',auths.loadlogout,userController.loadRegister)
user_Routes.post('/register',auths.loadlogout,userController.insertUser)
user_Routes.get('/verify',userController.verifyEmail)
user_Routes.get('/login',auths.loadlogout,userController.loadLogin)
user_Routes.post('/login',userController.verifyLogin)
user_Routes.get('/logout',userController.userLogout)

//// Google OAuth
user_Routes.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

user_Routes.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/register' }),
  (req, res) => {
    req.session.userId = req.user._id.toString();
    res.redirect('/home');
  }
);

user_Routes.get('/products',userController.showProducts);
user_Routes.get('/products/:id', userController.productsDetaling)

user_Routes.get('/men',userController.loadMen)
user_Routes.get('/women',userController.loadWomen)
user_Routes.get('/kids',userController.loadkids)
user_Routes.get('/home',auths.loadloging,userController.loadHome)

user_Routes.get('/search', userController.searchProducts);


//// password
user_Routes.get('/forgot-password',userController.loadForgot)
user_Routes.post("/forgot-password", userController.forgotpassword);
user_Routes.get("/reset-password/:token", userController.showResetForm);
user_Routes.post("/reset-password/:token", userController.resetPassword);



//// profile 
user_Routes.get('/profile', auths.loadloging, userProfileController.loadProfile);
user_Routes.post('/profile', auths.loadloging, userProfileController.updateProfile);
user_Routes.get('/profile/Editprofile', auths.loadloging,userProfileController.loadEditeprofile)
user_Routes.post('/profile/EditProfile',userProfileController.updateProfile)

//// Address
user_Routes.get('/profile/addressList', auths.loadloging, addressController.getaddress);       
user_Routes.get('/profile/addAddress', auths.loadloging, addressController.showAddAddress);    
user_Routes.post('/profile/addAddress', auths.loadloging,addressController.addAddress);       
user_Routes.get('/profile/EditeAddress/:id/edit', auths.loadloging, addressController.editAddress); 
user_Routes.post('/profile/EditeAddress/:id/edit', auths.loadloging, addressController.updateAddress); 
user_Routes.get('/profile/:id/delete', auths.loadloging, addressController.deleteAddress); 

//// Wallet Routes
user_Routes.get('/profile/wallet', auths.loadloging, walletController.getWallet);
user_Routes.post('/wallet/add-funds', auths.loadloging, walletController.addFunds);
user_Routes.post('/wallet/pay', auths.loadloging, walletController.payWithWallet); 


/////////////////cartRoutes///////////////
user_Routes.get('/cart',auths.loadloging,CartController.getCart)
user_Routes.post("/cart/add/:id",       auths.loadloging, CartController.addToCart);
user_Routes.get("/cart/add/:id",        auths.loadloging, CartController.addToCart);
user_Routes.get("/cart/update/:id",     auths.loadloging, CartController.updateQuantity);
user_Routes.get("/cart/remove/:id",     auths.loadloging, CartController.removeItem);
user_Routes.get("/cart/clear",          auths.loadloging, CartController.clearCart);

///////////////////WhistListController Routes/////////////////////
user_Routes.get('/wishlist', auths.loadloging, wishlistController.getWishlist);
user_Routes.post('/wishlist/add/:productId', auths.loadloging, wishlistController.addToWishlist);
user_Routes.delete('/wishlist/remove/:productId', auths.loadloging, wishlistController.removeFromWishlist);
user_Routes.post('/wishlist/move-to-cart/:productId', auths.loadloging, wishlistController.moveToCart);

////////////OrderController Routes/////////////////

user_Routes.get('/checkout', auths.loadloging, blockedCustomers, orderController.loadCheckout);
user_Routes.post('/order/razorpay', auths.loadloging, blockedCustomers, orderController.createRazorpayOrder);
user_Routes.post('/order/place', auths.loadloging, blockedCustomers, orderController.placeOrder); 
user_Routes.get('/order/success/:id', auths.loadloging, blockedCustomers, orderController.orderSuccess);
user_Routes.get('/orders', auths.loadloging, blockedCustomers, orderController.orderHistory);
user_Routes.post('/order/cancel/:id', auths.loadloging, blockedCustomers, orderController.cancelOrder);


/////////////

module.exports = user_Routes