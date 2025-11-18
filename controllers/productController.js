
const Product = require('../models/productModel');
const multer = require('multer');
const path = require('path');

//////////////////////// Multer Setup //////////////////////

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage });
exports.upload = upload;

/////////////////////// Load Add Product Page ///////////////////////
exports.loadAddProduct = (req, res) => {
  res.render('admin/addProduct', { admin: true });
};


exports.loadProducts = async (req, res) => {
  try {
    const products = await Product.find().lean();
    res.render('admin/products', { products, admin: true });
  } catch (error) {
    console.log(error);
  }
};

////////////////Insert Product ///////////////
exports.insertProduct = async (req, res) => {
  try {
    const imageFile = req.file ? req.file.filename : null;

    if (!imageFile) {
      return res.status(400).send("Image is required");
    }

    let sizes = req.body.size;
    if (typeof sizes === "string") {
      sizes = sizes.split(",").map(s => s.trim());
    }

    const product = new Product({
      name: req.body.name,
      brand: req.body.brand,
      price: req.body.price,
      description: req.body.description,
      stock: req.body.stock,
      category: req.body.category,
      size: sizes,
      image: imageFile
    });

    await product.save();
    res.redirect('/admin/products');
  } catch (error) {
    console.log(error);
    res.status(500).send("Error while adding product");
  }
};

// ==================== Load Edit Product Page ====================
exports.loadEditProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).lean();
    if (!product) {
      return res.status(404).render('error', { message: 'Product not found' });
    }
    res.render('admin/edit-product', { 
      product, 
      admin: true 
    });
  } catch (error) {
    console.error('Error loading product:', error);
    res.status(500).render('error', { message: 'Server error' });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const updateData = {
      name: req.body.name,
      brand: req.body.brand,
      price: parseFloat(req.body.price),
      description: req.body.description,
      stock: parseInt(req.body.stock),
      category: req.body.category,
      size: req.body.size.split(',').map(s => s.trim()) 
    };

    // Handle file upload
    if (req.file) {
      updateData.image = req.file.filename;
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id, 
      updateData, 
      { new: true, runValidators: true }
    );

    if (!updatedProduct) {
      return res.status(404).render('error', { message: 'Product not found' });
    }

    res.redirect('/admin/products');
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).render('admin/edit-product', { 
      product: { ...req.body, _id: req.params.id }, 
      admin: true,
      error: 'Error updating product' 
    });
  }
};

//////// Delete Product 
exports.deleteProduct = async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.redirect('/admin/products');
  } catch (error) {
    console.log(error);
  }
};
