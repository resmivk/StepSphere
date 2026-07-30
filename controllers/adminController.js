const Admin = require("../models/adminModel");
const Products = require("../models/productModel");
const User = require("../models/customerModel");
const Order = require("../models/orderModel");
const bcrypt = require("bcrypt");

////// Registerload//////////////////
exports.loadRegister = (req, res) => {
  if (req.session.admin) {
    return res.redirect("/admin/admindashboard");
  }
  res.render("admin/adminregister");
};

// Insert user and send email verification

exports.insertAdmin = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!name || name.trim().length < 4) {
      return res.status(400).json({
        message: "Name must be at least 4 characters long",
        type: "error",
      });
    }

    if (!email || !emailRegex.test(email.trim())) {
      return res.status(400).json({
        message: "Please enter a valid email address",
        type: "error",
      });
    }
    if (!password || password.trim().length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters long",
        type: "error",
      });
    }
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({
        message: "Email already registered",
        type: "error",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newAdmin = new Admin({
      name,
      email,
      password: hashedPassword,
    });

    await newAdmin.save();

    return res.status(200).json({
      message: "Registration successful! Please log in.",
      type: "success",
      redirectUrl: "/admin/adminlogin",
    });
  } catch (error) {
    console.log("Error in insertAdmin:", error.message);
    res.status(500).json({
      message: "Internal Server Error",
      type: "error",
    });
  }
};

// Load Login
exports.loadLogin = async (req, res) => {
  if (req.session.admin) {
    return res.redirect("/admin/admindashboard");
  }
  res.render("admin/adminlogin");
};
/////////////////verify login
exports.verifyLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("Received body:", req.body);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email || !emailRegex.test(email.trim())) {
      return res.status(400).json({
        message: "Please enter a valid email address",
        type: "error",
      });
    }

    if (!password || password.trim().length === 0) {
      return res.status(400).json({
        message: "Password is required",
        type: "error",
      });
    }

    const adminData = await Admin.findOne({
      email: email.trim().toLowerCase(),
    });

    if (!adminData) {
      return res.status(400).json({
        message: "Admin not found",
        type: "error",
      });
    }

    const match = await bcrypt.compare(password, adminData.password);

    if (!match) {
      return res.status(400).json({
        message: "Incorrect password",
        type: "error",
      });
    }

    req.session.admin = adminData._id;

    return res.status(200).json({
      message: "Login successful",
      type: "success",
      redirectUrl: "/admin/adminDashboard",
    });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({
      message: "An error occurred during login",
      type: "error",
    });
  }
};

/////////////////logout////////////////////

exports.userLogout = async (req, res) => {
  try {
    req.session.admin = null;

    res.redirect("/admin/adminlogin");
  } catch (error) {
    console.log(error.message);
  }
};

/////////////////////  dashboard /////////////////////

exports.loadDashboard = async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();
    const totalCustomers = await User.countDocuments();
    const totalProducts = await Products.countDocuments();

    const revenueAggregate = await Order.aggregate([
      { $match: { orderStatus: { $ne: 'cancelled' } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    const totalRevenue = revenueAggregate.length > 0 ? revenueAggregate[0].total : 0;

    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('user', 'name email')
      .lean();

    const statusCountsRaw = await Order.aggregate([
      { $group: { _id: '$orderStatus', count: { $sum: 1 } } }
    ]);

    const statusMap = {
      placed: 0,
      processing: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0
    };
    statusCountsRaw.forEach(item => {
      if (item._id && statusMap.hasOwnProperty(item._id)) {
        statusMap[item._id] = item.count;
      }
    });

    const monthlySalesRaw = await Order.aggregate([
      { $match: { orderStatus: { $ne: 'cancelled' } } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          totalSales: { $sum: '$totalAmount' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      { $limit: 6 }
    ]);

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const chartLabels = monthlySalesRaw.map(item => `${monthNames[item._id.month - 1]} ${item._id.year}`);
    const chartRevenueData = monthlySalesRaw.map(item => item.totalSales);

    res.render('admin/adminDashboard', {
      admin: true,
      title: 'Dashboard',
      activePage: 'dashboard',
      totalRevenue: totalRevenue.toLocaleString('en-IN'),
      totalOrders,
      totalCustomers,
      totalProducts,
      recentOrders,
      statusCountsJson: JSON.stringify(Object.values(statusMap)),
      chartLabelsJson: JSON.stringify(chartLabels.length ? chartLabels : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']),
      chartRevenueJson: JSON.stringify(chartRevenueData.length ? chartRevenueData : [0, 0, 0, 0, 0, 0])
    });
  } catch (error) {
    console.error('loadDashboard error:', error);
    res.render('admin/adminDashboard', {
      admin: true,
      title: 'Dashboard',
      activePage: 'dashboard',
      totalRevenue: '0',
      totalOrders: 0,
      totalCustomers: 0,
      totalProducts: 0,
      recentOrders: [],
      statusCountsJson: JSON.stringify([0, 0, 0, 0, 0]),
      chartLabelsJson: JSON.stringify(['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']),
      chartRevenueJson: JSON.stringify([0, 0, 0, 0, 0, 0])
    });
  }
};
//// Customer

exports.addCustomers = async (req, res) => {
  try {
    const users = await User.find().lean();
    res.render("admin/customer", { users });
  } catch (error) {
    console.log(error.message);
    res.render("admin/customer", { error: "faild to load users" });
  }
};
exports.listUsers = async (req, res) => {
  try {
    const user = await User.find().lean();
    res.render("admin/customer", { user });
  } catch (error) {
    console.log(error.message);
  }
};
exports.blockUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).send("User is not found");
    }
    user.isBlocked = !user.isBlocked;
    await user.save();
    res.redirect("/admin/customer");
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Error updating user statues");
  }
};

// Unblock user (Admin only)

exports.unblockUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).send("User is not found");
    }
    user.isBlocked = false;
    await user.save();
    res.redirect("/admin/customer");
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Error unblocking user");
  }
};
