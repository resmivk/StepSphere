
// const Product = require('../models/productModel');
// const multer = require('multer');
// const path = require('path');

// //////////////////////// Multer Setup //////////////////////

// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, 'public/uploads');
//   },
//   filename: function (req, file, cb) {
//     cb(null, Date.now() + path.extname(file.originalname));
//   }
// });

// const upload = multer({ storage });
// exports.upload = upload;

// /////////////////////// Load Add Product Page ///////////////////////
// exports.loadAddProduct = (req, res) => {
//   res.render('admin/addProduct', { admin: true });
// };


// exports.loadProducts = async (req, res) => {
//   try {
//     const products = await Product.find().lean();
//     res.render('admin/products', { products, admin: true });
//   } catch (error) {
//     console.log(error);
//   }
// };

// ////////////////Insert Product ///////////////
// exports.insertProduct = async (req, res) => {
//   try {
//     const imageFile = req.file ? req.file.filename : null;

//     if (!imageFile) {
//       return res.status(400).send("Image is required");
//     }

//     let sizes = req.body.size;
//     if (typeof sizes === "string") {
//       sizes = sizes.split(",").map(s => s.trim());
//     }

//     const product = new Product({
//       name: req.body.name,
//       brand: req.body.brand,
//       price: req.body.price,
//       description: req.body.description,
//       stock: req.body.stock,
//       category: req.body.category,
//       size: sizes,
//       image: imageFile
//     });

//     await product.save();
//     res.redirect('/admin/products');
//   } catch (error) {
//     console.log(error);
//     res.status(500).send("Error while adding product");
//   }
// };

// // ==================== Load Edit Product Page ====================
// exports.loadEditProduct = async (req, res) => {
//   try {
//     const product = await Product.findById(req.params.id).lean();
//     if (!product) {
//       return res.status(404).render('error', { message: 'Product not found' });
//     }
//     res.render('admin/edit-product', { 
//       product, 
//       admin: true 
//     });
//   } catch (error) {
//     console.error('Error loading product:', error);
//     res.status(500).render('error', { message: 'Server error' });
//   }
// };

// exports.updateProduct = async (req, res) => {
//   try {
//     const updateData = {
//       name: req.body.name,
//       brand: req.body.brand,
//       price: parseFloat(req.body.price),
//       description: req.body.description,
//       stock: parseInt(req.body.stock),
//       category: req.body.category,
//       size: req.body.size.split(',').map(s => s.trim()) 
//     };

//     // Handle file upload
//     if (req.file) {
//       updateData.image = req.file.filename;
//     }

//     const updatedProduct = await Product.findByIdAndUpdate(
//       req.params.id, 
//       updateData, 
//       { new: true, runValidators: true }
//     );

//     if (!updatedProduct) {
//       return res.status(404).render('error', { message: 'Product not found' });
//     }

//     res.redirect('/admin/products');
//   } catch (error) {
//     console.error('Error updating product:', error);
//     res.status(500).render('admin/edit-product', { 
//       product: { ...req.body, _id: req.params.id }, 
//       admin: true,
//       error: 'Error updating product' 
//     });
//   }
// };

// //////// Delete Product 
// exports.deleteProduct = async (req, res) => {
//   try {
//     await Product.findByIdAndDelete(req.params.id);
//     res.redirect('/admin/products');
//   } catch (error) {
//     console.log(error);
//   }
// };
const Product = require('../models/productModel');
const Category = require('../models/categoryModel'); 
const multer = require('multer');
const path = require('path');

// //////////////////////// Multer Setup //////////////////////

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
// ======================= Load Add Product Page =======================

exports.loadAddProduct = async (req, res) => {
  try {
    //const categories = await Category.find({ isActive: true }).lean(); 
    const parents = await Category.find({ parent: null, isActive: true }).lean();
    const subCategories = await Category.find({ parent: { $ne: null }, isActive: true }).lean();
    res.render('admin/addProduct', { 
        admin: true, 
        subcategories: subCategories ,
        parents:parents
    });
  } catch (error) {
    console.log(error);
  }
};
// ======================= Load Product List =======================

exports.loadProducts = async (req, res) => {
  try {
    const products = await Product.find().populate('category').lean();
    const productList = products.map(p => ({
    ...p,
    _id: p._id.toString()
}));
res.render('admin/products', { products: productList, admin: true });
  } catch (error) {
    console.log(error);
  }
};

// ======================= Insert Product =======================

exports.insertProduct = async (req, res) => {
  try {
    // 1. Handle Images
    const imageFiles = req.files ? req.files.map(file => file.filename) : [];
    if (imageFiles.length === 0) {
      return res.status(400).send("At least one image is required");
    }

   
    let sizes = req.body.size;
    if (!sizes) {
      sizes = [];
    } else if (typeof sizes === "string") {
      sizes = [sizes]; 
    }
   

 
    const subCategoryId = req.body.subCategory && req.body.subCategory.trim() !== "" 
        ? req.body.subCategory 
        : null;

 
    const isBestSeller = req.body.isBestSeller === 'on';

    const product = new Product({
      name: req.body.name,
      brand: req.body.brand,
      price:parseFloat (req.body.price),
      description: req.body.description,
      stock: parseInt(req.body.stock),
      category: req.body.category, 
      subCategory: subCategoryId,
      size: sizes,
      images: imageFiles,
      isBestSeller: isBestSeller 
    });
if (!req.body.name || !req.body.price || !req.body.category) {
    return res.status(400).send("Name, price and category are required");
}
    await product.save();
    res.redirect('/admin/products');
  } catch (error) {
    console.error("Error adding product:", error);
    res.status(500).send("Error while adding product");
  }
};
  
// ======================= Load Edit Product Page =======================


exports.loadEditProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('category').lean();
    if (!product) return res.status(404).render('error', { message: 'Product not found' });

    const parents = await Category.find({ parent: null, isActive: true }).lean();

    const productData = {
      ...product,
      _id: product._id.toString(),
      category: product.category ? {
        ...product.category,
        _id: product.category._id.toString()
      } : null
    };

    
    let parentId = null;

    if (product.category) {
      if (product.category.parent) {
        // product's category IS a subcategory — its parent is the main category
        parentId = product.category.parent.toString();
      } else {
        // product's category IS a main category
        parentId = product.category._id.toString();
      }
    }

    // Fetch subcategories under that parent
    const subCategories = parentId
      ? await Category.find({ parent: parentId, isActive: true }).lean()
      : [];

    // Convert subcategory _ids to string
    const subCategoriesData = subCategories.map(s => ({
      ...s,
      _id: s._id.toString()
    }));

    // Convert parent _ids to string
    const parentsData = parents.map(p => ({
      ...p,
      _id: p._id.toString()
    }));

    res.render('admin/edit-product', {
      product: productData,
      subcategories: subCategoriesData,
      parents: parentsData,
      selectedParentId: parentId,          
      selectedSubId: product.subCategory   
        ? product.subCategory.toString()
        : null,
      admin: true
    });

  } catch (error) {
    console.error('Error loading product:', error);
    res.status(500).render('error', { message: 'Server error' });
  }
};

// .Update Product....................

exports.updateProduct = async (req, res) => {
    try {
        let sizes = req.body.size;
        if (!sizes) {
            sizes = [];
        } else if (typeof sizes === "string") {
            sizes = [sizes];
        }

        const price = parseFloat(req.body.price);
        const stock = parseInt(req.body.stock);

        // ✅ Validate price and stock
        if (isNaN(price) || price <= 0) {
            return res.status(400).render('admin/edit-product', {
                product: { ...req.body, _id: req.params.id },
                admin: true,
                error: 'Invalid price value'
            });
        }
        if (isNaN(stock) || stock < 0) {
            return res.status(400).render('admin/edit-product', {
                product: { ...req.body, _id: req.params.id },
                admin: true,
                error: 'Invalid stock value'
            });
        }

        const isBestSeller = req.body.isBestSeller === "true";
        const subCategoryId = (req.body.subCategory && req.body.subCategory.trim() !== "")
            ? req.body.subCategory : null;

        const updateData = {
            name: req.body.name,
            brand: req.body.brand,
            price,
            description: req.body.description,
            stock,
            category: req.body.category,
            subCategory: subCategoryId,
            size: sizes,
            isBestSeller
        };

        // ✅ Only update images if new ones uploaded
        if (req.files && req.files.length > 0) {
            updateData.images = req.files.map(file => file.filename);
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
// //////// Delete Product 
exports.deleteProduct = async (req, res) => {
   try {
    await Product.findByIdAndDelete(req.params.id);
    res.redirect('/admin/products');
  } catch (error) {
     console.log(error);
  }
};

