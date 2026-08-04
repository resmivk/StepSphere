const Category = require('../models/categoryModel');
const Product = require('../models/productModel');

// ======================= 1. List All Categories =======================
exports.loadCategories = async (req, res) => {
    try {
        const search = req.query.search || '';

        const filter = search
            ? { name: { $regex: search, $options: 'i' } }
            : {};

        const categories = await Category.find(filter)
            .populate('parent')
            .sort({ createdAt: -1 })
            .lean();

        // Attach product count to each category
        const categoriesWithCount = await Promise.all(
            categories.map(async (cat) => {
                const productCount = await Product.countDocuments({ category: cat._id });
                return { ...cat, productCount };
            })
        );

        res.render('admin/categories/category', {
            categories: categoriesWithCount,
            search,
            admin: true,
            activePage: 'categories',
            successMessage: req.query.success || null
        });
    } catch (error) {
        console.error('loadCategories error:', error.message);
        res.status(500).send("Error loading categories");
    }
};

// ======================= 2. Load Add Category Form =======================
exports.loadAddCategory = async (req, res) => {
    try {
        const parents = await Category.find({ parent: null, isActive: true }).lean();
        res.render('admin/categories/addcategory', {
            parents,
            admin: true
        });
    } catch (error) {
        console.error('loadAddCategory error:', error.message);
        res.status(500).send("Server Error");
    }
};

// ======================= 3. Insert New Category =======================
exports.insertCategory = async (req, res) => {
    try {
        const { name, description, parent } = req.body;

        if (!name || name.trim() === '') {
            const parents = await Category.find({ parent: null, isActive: true }).lean();
            return res.render('admin/categories/addcategory', {
                message: 'Category name is required',
                parents,
                admin: true
            });
        }

        const parentId = (parent && parent.trim() !== '') ? parent : null;

        const existingCat = await Category.findOne({
            name: { $regex: new RegExp(`^${name.trim()}$`, 'i') },
            parent: parentId
        });

        if (existingCat) {
            const parents = await Category.find({ parent: null, isActive: true }).lean();
            return res.render('admin/categories/addcategory', {
                message: 'Category already exists under this parent',
                formData: req.body,
                parents,
                admin: true
            });
        }

        if (parentId) {
            const parentExists = await Category.findById(parentId);
            if (!parentExists) {
                const parents = await Category.find({ parent: null, isActive: true }).lean();
                return res.render('admin/categories/addcategory', {
                    message: 'Selected parent category does not exist',
                    parents,
                    admin: true
                });
            }
        }

        const category = new Category({
            name: name.trim(),
            description: description ? description.trim() : '',
            parent: parentId,
            isActive: true
        });

        await category.save();
        res.redirect('/admin/categories/category?success=Category added successfully');

    } catch (error) {
        console.error('insertCategory error:', error.message);
        res.status(500).send("Error adding category");
    }
};

// ======================= 4. Load Edit Category Form =======================
exports.editCategories = async (req, res) => {
    try {
        const id = req.params.id;
        const category = await Category.findById(id).lean();

        if (!category) {
            return res.redirect('/admin/categories/category');
        }

        const parents = await Category.find({
            parent: null,
            _id: { $ne: id }
        }).lean();

        res.render('admin/categories/editCategory', {
            category,
            parents,
            admin: true
        });
    } catch (error) {
        console.error('editCategories error:', error.message);
        res.status(500).send("Server Error");
    }
};

// ======================= 5. Update Category =======================
exports.updateCategory = async (req, res) => {
    try {
        const id = req.params.id;
        const { name, description, parent } = req.body;

        if (!name || name.trim() === '') {
            const category = await Category.findById(id).lean();
            const parents = await Category.find({ parent: null, _id: { $ne: id } }).lean();
            return res.render('admin/categories/editCategory', {
                message: 'Category name is required',
                category, parents, admin: true
            });
        }

        const existingCat = await Category.findOne({
            name: { $regex: new RegExp(`^${name.trim()}$`, 'i') },
            _id: { $ne: id }
        });

        if (existingCat) {
            const category = await Category.findById(id).lean();
            const parents = await Category.find({ parent: null, _id: { $ne: id } }).lean();
            return res.render('admin/categories/editCategory', {
                message: 'Category name already exists',
                category, parents, admin: true
            });
        }

        await Category.findByIdAndUpdate(id, {
            name: name.trim(),
            description: description ? description.trim() : '',
            parent: (parent && parent.trim() !== '') ? parent : null
        }, { new: true });

        res.redirect('/admin/categories/category?success=Category updated successfully');

    } catch (error) {
        console.error('updateCategory error:', error.message);
        res.redirect('/admin/categories/category');
    }
};

// ======================= 6. Toggle Active/Inactive =======================
exports.toggleCategoryStatus = async (req, res) => {
    try {
        const id = req.params.id;
        const category = await Category.findById(id);

        if (!category) return res.redirect('/admin/categories/category');

        if (category.isActive) {
            const productCount = await Product.countDocuments({ category: id, isActive: true });
            if (productCount > 0) {
                return res.send(`<script>
                    alert('This category has ${productCount} active product(s). Deactivate those first.');
                    window.location='/admin/categories/category';
                </script>`);
            }
            await Category.updateMany({ parent: id }, { isActive: false });
        } else {
            await Category.updateMany({ parent: id }, { isActive: true });
        }

        category.isActive = !category.isActive;
        await category.save();

        res.redirect('/admin/categories/category?success=Category status updated');

    } catch (error) {
        console.error('toggleCategoryStatus error:', error.message);
        res.redirect('/admin/categories/category');
    }
};

// ======================= 7. Delete Category =======================
exports.deleteCategory = async (req, res) => {
    try {
        const id = req.params.id;

        const productCount = await Product.countDocuments({ category: id });
        if (productCount > 0) {
            return res.send(`<script>
                alert('Cannot delete! ${productCount} product(s) are linked to this category.');
                window.location='/admin/categories/category';
            </script>`);
        }

        const childCount = await Category.countDocuments({ parent: id });
        if (childCount > 0) {
            return res.send(`<script>
                alert('Cannot delete! This category has ${childCount} subcategory(ies). Delete them first.');
                window.location='/admin/categories/category';
            </script>`);
        }

        await Category.findByIdAndDelete(id);
        res.redirect('/admin/categories/category?success=Category deleted successfully');

    } catch (error) {
        console.error('deleteCategory error:', error.message);
        res.redirect('/admin/categories/category');
    }
};

// ======================= 8. Get Subcategories API =======================
exports.getSubcategories = async (req, res) => {
    try {
        const subs = await Category.find({
            parent: req.params.parentId,
            isActive: true
        }).lean();
        res.json(subs);
    } catch (error) {
        console.error('getSubcategories error:', error.message);
        res.status(500).json([]);
    }
};