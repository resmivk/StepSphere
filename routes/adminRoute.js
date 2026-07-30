const express = require('express');
const routes = express.Router();

const productController = require('../controllers/productController');
const adminController = require('../controllers/adminController');
const customerController=require('../controllers/customerController')
const categoryController=require('../controllers/categoryController')
const adminOrderController = require('../controllers/adminOrderController');
const { adminAuth } = require('../middleware/adminAuth');
const cuponController = require('../controllers/couponController');
const offerController = require('../controllers/offerController');



//  ADMIN AUTH ROUTES
routes.get('/', adminController.loadLogin);
routes.get('/adminregister', adminController.loadRegister);
routes.post('/adminregister', adminController.insertAdmin);

routes.get('/adminlogin', adminController.loadLogin);
routes.post('/adminlogin', adminController.verifyLogin);
routes.get('/logout', adminController.userLogout);

//  DASHBOARD & USERS
routes.get('/admindashboard', adminAuth, adminController.loadDashboard);
routes.get(['/customers', '/customer'], adminAuth, customerController.customerInfo);
routes.post('/users/block/:id', adminAuth, adminController.blockUser);
routes.post('/users/unblock/:id', adminAuth, adminController.unblockUser);

//// PRODUCT ROUTES 

  routes.get('/add-products',adminAuth, productController.loadAddProduct);
  routes.post('/add-products',adminAuth, productController.upload.array('images',5), productController.insertProduct);
  routes.get('/products',adminAuth, productController.loadProducts);
  routes.get('/edit-product/:id',adminAuth, productController.loadEditProduct);
  routes.post('/edit-product/:id',adminAuth, productController.upload.array('images',5),productController.updateProduct);
  routes.get('/delete-product/:id', adminAuth,productController.deleteProduct);

///// CATEGORY ROUTES  ///////////////////

routes.get('/categories/category',adminAuth,categoryController.loadCategories)
routes.get('/categories/addcategory',adminAuth,categoryController.loadAddCategory)
routes.post('/categories/addcategory', adminAuth,   categoryController.insertCategory);
routes.get('/categories/editCategory/:id',adminAuth, categoryController.editCategories);
routes.post('/categories/editCategory/:id', adminAuth,categoryController.updateCategory);
routes.get('/categories/deleteCategory/:id',adminAuth, categoryController.deleteCategory);
routes.get('/categories/toggle/:id',     adminAuth, categoryController.toggleCategoryStatus);


///////////////////ADMIN ORDERROUTES///////////////////


routes.get('/adminOrders', adminAuth,adminOrderController.adminOrders);
routes.post('/adminOrders/status/:id', adminAuth,adminOrderController.updateOrderStatus);
routes.get('/orders/:id', adminAuth,adminOrderController.orderDetail); 


///////////////////cupon routes////////////////////
routes.get('/coupons', adminAuth, cuponController.getCoupons);
routes.post('/coupons', adminAuth, cuponController.createCoupon);
routes.get('/coupons/toggle/:id', adminAuth, cuponController.toggleCouponStatus);
routes.get('/coupons/delete/:id', adminAuth, cuponController.deleteCoupon);

////////////////////offer routes////////////////////

module.exports = routes;
