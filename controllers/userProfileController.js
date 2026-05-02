const User = require('../models/customerModel');
const Address = require('../models/addressModel'); // Capitalized to distinguish from variables

// Profile Loader
exports.loadProfile = async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.redirect('/login');
    }

    const user = await User.findById(req.session.userId).lean();
    
    if (!user) {
      return res.status(404).send("User not found");
    }

    res.render("user/profile/profile", {
      activepage: 'profile',
      showNavbar: true,
      showprofileSidebar: true,
      showfooter: true,
      user: user
    });
  } catch (error) {
    console.error(error); // Log the error for debugging
    res.status(500).send("Error loading profile");
  }
};

// Update Profile Info
exports.updateProfile = async (req, res) => {
  try {
    const { name, phone, addressData } = req.body; // Changed variable name to avoid shadowing model

    // Basic validation
    if (!name || !phone) {
      return res.status(400).send("Name and Phone are required");
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.session.userId, 
      { name, phone, address: addressData }, 
      { new: true } 
    );

    res.redirect("/profile");
  } catch (error) {
    res.status(500).send("Error updating profile");
  }
};

// Edit Profile Loader
exports.loadEditeprofile = async (req, res) => {
  try {
    const user = await User.findById(req.session.userId).lean();
    
    if (!user) {
       return res.redirect('/login');
    }

    res.render('user/profile/Editprofile', {
      activepage: 'profile',
      showNavbar: true,
      showprofileSidebar: true,
      showfooter: true,
      user: user
    });
  } catch (error) {
    res.status(500).send("Error for editing");
  }
};
