const express = require('express');
const routes = express.Router();

const productController = require('../controllers/productController');
const adminController = require('../controllers/adminController');
const customerController=require('../controllers/customerController')
 const categoryController=require('../controllers/categoryController')
const { isAdminLoggedin } = require('../middleware/adminAuth');





//  ADMIN AUTH ROUTES
routes.get('/', adminController.loadLogin);
routes.get('/adminregister', adminController.loadRegister);
routes.post('/adminregister', adminController.insertAdmin);

routes.get('/adminlogin', adminController.loadLogin);
routes.post('/adminlogin', adminController.verifyLogin);
routes.get('/logout', adminController.userLogout);

//  DASHBOARD & USERS
routes.get('/admindashboard', isAdminLoggedin, adminController.loadDashboard);
routes.get(['/customers', '/customer'], isAdminLoggedin, customerController.customerInfo);
routes.post('/users/block/:id', isAdminLoggedin, adminController.blockUser);
routes.post('/users/unblock/:id', isAdminLoggedin, adminController.unblockUser);

//// PRODUCT ROUTES 

  routes.get('/add-product', productController.loadAddProduct);
  routes.post('/add-product', productController.upload.single('image'), productController.insertProduct);
  routes.get('/products', productController.loadProducts);
  routes.get('/edit-product/:id', productController.loadEditProduct);
  routes.post('/edit-product/:id', productController.upload.single('image'),productController.updateProduct);
  routes.get('/delete-product/:id', productController.deleteProduct);

///// CATEGORY rOUTES

routes.get('/categories/category',categoryController.loadCategories)
routes.get('/categories/addcategory',categoryController.loadAddCategory)
routes.post('/categories/addcategory',    categoryController.insertCategory);
routes.get('/categories/editCategory/:id', categoryController.editCategories);
routes.post('/categories/editCategory/:id', categoryController.updateCategory);
routes.get('/categories/deleteCategory/:id', categoryController.deleteCategory);
routes.get('/categories/toggle/:id',      categoryController.toggleCategoryStatus);

module.exports = routes;
