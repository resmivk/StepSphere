
const express=require('express')
 const user_Routes=express.Router()

const userController=require('../controllers/userController')


user_Routes.get('/',userController.loadHome)
user_Routes.get('/register',userController.loadRegister)
user_Routes.post('/register',userController.insertUser)
 
 user_Routes.get('/verify',userController.verifyEmail)
 
 user_Routes.get('/login',userController.loadLogin)
 user_Routes.post('/login',userController.verifyLogin)
 user_Routes.get('/logout',userController.userLogout)
 user_Routes.get('/home',userController.loadHome)


module.exports = user_Routes