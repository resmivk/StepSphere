
const express=require('express')
const user_Routes=express.Router()

const userController=require('../controllers/userController')
const userProfileController=require('../controllers/userProfileController')
const addressController=require('../controllers/addressController')

const auths=require('../middleware/auth')

user_Routes.get('/',auths.loadlogout,userController.loadHome)
user_Routes.get('/register',auths.loadlogout,userController.loadRegister)
user_Routes.post('/register',auths.loadlogout,userController.insertUser)
user_Routes.get('/verify',userController.verifyEmail)
user_Routes.get('/login',auths.loadlogout,userController.loadLogin)
user_Routes.post('/login',userController.verifyLogin)
user_Routes.get('/logout',userController.userLogout)
user_Routes.get('/home',auths.loadloging,userController.loadHome)


//// profile 
user_Routes.get('/profile', auths.loadloging, userProfileController.loadProfile);
user_Routes.post('/profile', auths.loadloging, userProfileController.updateProfile);
user_Routes.get('/profile/EditProfile', auths.loadloging,userProfileController.loadEditeprofile)


//// Address
user_Routes.get('/profile/addressList', auths.loadloging, addressController.getaddress);       
user_Routes.get('/profile/addAddress', auths.loadloging, addressController.showAddAddress);    
user_Routes.post('/profile/addAddress', auths.loadloging,addressController.addAddress);       
user_Routes.get('/profile/EditeAddress/:id/edit', auths.loadloging, addressController.editAddress); 
user_Routes.post('profile/addresses/:id/edit', auths.loadloging, addressController.updateAddress); 
user_Routes.get('profile/address/:id/delete', auths.loadloging, addressController.deleteAddress); 


module.exports = user_Routes