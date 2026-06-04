
const express=require('express')
const user_Routes=express.Router()

const userController=require('../controllers/userController')
const userProfileController=require('../controllers/userProfileController')
const addressController=require('../controllers/addressController')
const CartController=require('../controllers/cartController')

const auths=require('../middleware/auth')

user_Routes.get('/',auths.loadlogout,userController.loadHome)
user_Routes.get('/register',auths.loadlogout,userController.loadRegister)
user_Routes.post('/register',auths.loadlogout,userController.insertUser)
user_Routes.get('/verify',userController.verifyEmail)
user_Routes.get('/login',auths.loadlogout,userController.loadLogin)
user_Routes.post('/login',userController.verifyLogin)
user_Routes.get('/logout',userController.userLogout)

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


/////////////////cartRoutes///////////////
user_Routes.get('/cart',auths.loadloging,CartController.getCart)
user_Routes.post("/cart/add/:id",       auths.loadloging, CartController.addToCart);
user_Routes.get("/cart/add/:id",        auths.loadloging, CartController.addToCart);
user_Routes.get("/cart/update/:id",     auths.loadloging, CartController.updateQuantity);
user_Routes.get("/cart/remove/:id",     auths.loadloging, CartController.removeItem);
user_Routes.get("/cart/clear",          auths.loadloging, CartController.clearCart);


module.exports = user_Routes