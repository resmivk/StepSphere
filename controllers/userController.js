
const User = require("../models/customerModel");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const product = require("../models/productModel")
const Category = require('../models/categoryModel')
const crypto = require("crypto");
const Banner = require('../models/bannerModel')

const user = process.env.MAIL_USER
const pass = process.env.MAIL_PASS


 const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user, pass }
    });

////// Registerload/////////////////
exports.loadRegister = (req, res) => {
  res.render("user/register", { title: 'register', showNavbar: false, footer: false });
};

//////////////////INSERT USER/////////////////////
// exports.insertUser = async (req, res) => {
//   try {
//     const { name, phone, email, password } = req.body;
//     const trimmedName = name?.trim();
//     const trimmedEmail = email?.trim();
//     const trimmedPhone = phone?.trim();

//     if (!trimmedName || trimmedName.length < 5 || trimmedName.length > 20) {
//       return res.render("user/register", {
//         title: "register",
//         showNavbar: false,
//         footer: false,
//         message: "Name must be between 5-20 characters",
//         error: true
//       });
//     }

//     if (!/^\d{10}$/.test(trimmedPhone)) {
//       return res.render("user/register", {
//         title: "register",
//         showNavbar: false,
//         footer: false,
//         message: "Please enter a valid 10-digit phone number",
//         error: true
//       });
//     }

//     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     if (!emailRegex.test(trimmedEmail)) {
//       return res.render("user/register", {
//         title: "register",
//         showNavbar: false,
//         footer: false,
//         message: "Please enter a valid email address",
//         error: true
//       });
//     }

//     if (!password || password.length < 8) {
//       return res.render("user/register", {
//         title: "register",
//         showNavbar: false,
//         footer: false,
//         message: "Password must be at least 8 characters long",
//         error: true
//       });
//     }
     
//      const existingUser = await User.findOne({ email: trimmedEmail });
   


//     if (existingUser && !existingUser.is_Verified) {

//       const emailVerificationToken = crypto.randomBytes(16).toString("hex");

//       existingUser.emailVerificationToken = emailVerificationToken;
//       await existingUser.save();

//       const verificationUrl = `http://localhost:3000/verify?token=${emailVerificationToken}`;

//       const mailOptions = {
//         from: `"Stepsphere" <${process.env.MAIL_USER}>`,
//         to: email,
//         subject: "Email Verification - Stepsphere",
//         html: `
//           <p>Hello ${existingUser.name},</p>
//           <p>Your email is not verified yet. Please verify using the link below:</p>
//           <a href="${verificationUrl}">Verify Email</a>
//         `,
//       };

//       transporter.sendMail(mailOptions, (err) => {
//         if (err) {
//           console.error("Error resending verification email:", err);
//           return res.render("user/register", {
//             title: "register",
//             showNavbar: false,
//             footer: false,
//             message: "Error sending verification email",
//             error: true
//           });
//         }

//         return res.render("user/register",{title:"register",showNavbar:false,footer:false, success:true,

//         message:"Registration successful! Please check your email and verify your account."})

//       return;
//     });
//   }

//     if (existingUser) {
//       return res.send("Email already registered and verified. Please login.");
//     }

//     const emailVerificationToken = crypto.randomBytes(16).toString("hex");
//     const hashedPassword = await bcrypt.hash(password, 10);

//     const newUser = new User({
//       name,
//       phone,
//       email,
//       password: hashedPassword,
//       emailVerificationToken,
//       is_Verified: false,
//     });

//     await newUser.save();

//     const verificationUrl = `http://localhost:3000/verify?token=${emailVerificationToken}`;

//     const mailOptions = {
//       from: `"Stepsphere" <${process.env.MAIL_USER}>`,
//       to: email,
//       subject: "Verify Your Email for Stepsphere",
//       html: `
//         <p>Hello ${name},</p>
//         <p>Please verify your email by clicking the link below:</p>
//         <a href="${verificationUrl}">Verify Email</a>
//       `,
//     };

//     transporter.sendMail(mailOptions, (err) => {
//       if (err) {
//         console.error("Error sending verification email:", err);
//         return res.status(500).send("User registered but email could not be sent.");
//       }

//       return res.send("Registration successful! Verification email sent to your email.");
//     });

//   } catch (error) {
//     console.log("Error in insertUser:", error.message);
//     res.status(500).send("Internal Server Error");
//   }
// };
exports.insertUser = async (req, res) => {
  try {
    const { name, phone, email, password } = req.body;
    const trimmedName = name?.trim();
    const trimmedEmail = email?.trim();
    const trimmedPhone = phone?.trim();

    if (!trimmedName || trimmedName.length < 5 || trimmedName.length > 20) {
      return res.render("user/register", {
        title: "register",
        showNavbar: false,
        footer: false,
        message: "Name must be between 5-20 characters",
        error: true
      });
    }

    if (!/^\d{10}$/.test(trimmedPhone)) {
      return res.render("user/register", {
        title: "register",
        showNavbar: false,
        footer: false,
        message: "Please enter a valid 10-digit phone number",
        error: true
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      return res.render("user/register", {
        title: "register",
        showNavbar: false,
        footer: false,
        message: "Please enter a valid email address",
        error: true
      });
    }

    if (!password || password.length < 8) {
      return res.render("user/register", {
        title: "register",
        showNavbar: false,
        footer: false,
        message: "Password must be at least 8 characters long",
        error: true
      });
    }

    const existingUser = await User.findOne({ email: trimmedEmail });

    // Case 1: user exists but is not verified -> resend verification email
    if (existingUser && !existingUser.is_Verified) {
      const emailVerificationToken = crypto.randomBytes(16).toString("hex");
      existingUser.emailVerificationToken = emailVerificationToken;
      await existingUser.save();

      const verificationUrl = `http://localhost:3000/verify?token=${emailVerificationToken}`;

      const mailOptions = {
        from: `"Stepsphere" <${process.env.MAIL_USER}>`,
        to: trimmedEmail,
        subject: "Email Verification - Stepsphere",
        html: `
          <p>Hello ${existingUser.name},</p>
          <p>Your email is not verified yet. Please verify using the link below:</p>
          <a href="${verificationUrl}">Verify Email</a>
        `,
      };

      return transporter.sendMail(mailOptions, (err) => {
        if (err) {
          console.error("Error resending verification email:", err);
          return res.render("user/register", {
            title: "register",
            showNavbar: false,
            footer: false,
            message: "Error sending verification email",
            error: true
          });
        }

        return res.render("user/register", {
          title: "register",
          showNavbar: false,
          footer: false,
          success: true,
          message: "Registration successful! Please check your email and verify your account."
        });
      });
    }

    // Case 2: user exists and is already verified
    if (existingUser) {
      return res.render("user/register", {
        title: "register",
        showNavbar: false,
        footer: false,
        message: "Email already registered and verified. Please login.",
        error: true
      });
    }

    // Case 3: brand new user
    const emailVerificationToken = crypto.randomBytes(16).toString("hex");
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name: trimmedName,
      phone: trimmedPhone,
      email: trimmedEmail,
      password: hashedPassword,
      emailVerificationToken,
      is_Verified: false,
    });

    await newUser.save();

    const verificationUrl = `http://localhost:3000/verify?token=${emailVerificationToken}`;

    const mailOptions = {
      from: `"Stepsphere" <${process.env.MAIL_USER}>`,
      to: trimmedEmail,
      subject: "Verify Your Email for Stepsphere",
      html: `
        <p>Hello ${trimmedName},</p>
        <p>Please verify your email by clicking the link below:</p>
        <a href="${verificationUrl}">Verify Email</a>
      `,
    };

    return transporter.sendMail(mailOptions, (err) => {
      if (err) {
        console.error("Error sending verification email:", err);
        return res.render("user/register", {
          title: "register",
          showNavbar: false,
          footer: false,
          message: "User registered but verification email could not be sent.",
          error: true
        });
      }

      return res.render("user/register", {
        title: "register",
        showNavbar: false,
        footer: false,
        success: true,
        message: "Registration successful! Verification email sent to your email."
      });
    });

  } catch (error) {
    console.log("Error in insertUser:", error.message);
    return res.status(500).send("Internal Server Error");
  }
};

/////////////////Email verification route//////////

exports.verifyEmail = async (req, res) => {
  try {
    const token = req.query.token;
    const user = await User.findOne({ emailVerificationToken: token });

    if (!user) {
      return res.send("Invalid or expired verification link");
    }

    if (user.is_Verified) {
      return res.send("Email already verified");
    }

    user.is_Verified = true;
    user.emailVerificationToken = null;
    await user.save();

    res.render("user/verified");
  } catch (error) {
    console.error("Error in verifyEmail:", error.message);
    res.status(500).send("Error verifying email");
  }
};

////////////   Load Login    //////


exports.loadLogin = async (req, res) => {
  res.render("user/login", {
    title: "Login",
    showNavbar: false,
  });
};

//verify login

exports.verifyLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.render("user/login", {
        message: "Email and Password are required.",
      });
    }
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(email)) {
      return res.render("user/login", {
        message: "Please enter a valid email address.",
      });
    }

    // const strongPassword =/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    // if (!strongPassword.test(password)) {
    //   return res.render("user/login", {
    //     message:
    //       "Password must be at least 8 characters, include uppercase, lowercase, number and special character.",
    //   });
    // }
    if (password.length < 8) {
      return res.render("user/login", {
        message: "Password must be at least 8 characters long.",
      });
    }
    const user = await User.findOne({ email });
    if (!user)
      return res.render("user/login", { message: "User is not found" });

    if (!user.is_Verified)
      return res.render("user/login", {
        message: "Please verify your email first",
      });

    const match = await bcrypt.compare(password, user.password);
    if (!match)
      return res.render("user/login", { message: "Incorrect Password" });

    req.session.userId = user._id;
    req.session.user = {
      _id: user._id,
      name: user.name,
      email: user.email,
    };
    //res.locals.user=req.session.user

    res.redirect("/home");
  } catch (error) {
    console.log(error.message);
  }
};


///////home page  ............
exports.loadHome = async (req, res) => {
  try {

    let user = null;
    if (req.session.userId) {
      user = await User.findById(req.session.userId).lean();
    }

    const bestSellerProducts = await product.find({
      isBestSeller: true,
      stock: { $gt: 0 },
      isActive: { $ne: false }
    })
      .populate('category')
      .limit(8)
      .lean();


    const productsWithImages = bestSellerProducts.map(p => {

      if (!p.category) {
        p.category = { name: 'General' };
      }

      let imagePath = '/images/default-shoe.jpg';
      if (p.images && p.images.length > 0) {
        imagePath = p.images[0].startsWith('http')
          ? p.images[0]
          : `/uploads/${p.images[0]}`;
      }

      return {
        ...p,
        _id: p._id.toString(),
        displayImage: imagePath
      };
    });

    // 4. Fetch Banners (Hero Section)
    const banners = await Banner.find({
      isActive: true,
      status: 'active'
    })
      .sort({ position: 1 })
      .limit(3)
      .lean();

    // Default Banner Values
    let heroImage = '/uploads/hero_banner.jpg'; // Make sure you have a default image here!
    let heroTitle = "Step Into Style";
    let heroSubtitle = "Discover premium footwear for every occasion";

    // If DB has banners, use the first one
    if (banners.length > 0) {
      const heroBanner = banners.find(b => b.position === 1) || banners[0];
      heroImage = heroBanner.imageUrl.startsWith('http')
        ? heroBanner.imageUrl
        : `/uploads/${heroBanner.imageUrl}`;
      heroTitle = heroBanner.title || heroTitle;
      heroSubtitle = heroBanner.subtitle || heroSubtitle;
    }

    // 5. Fetch Main Categories (Parent Categories Only)
    const mainCategories = await Category.find({
      parent: null,
      isActive: true
    })
      .limit(4)
      .lean();

    // 6. Map Categories to Specific Images & Links
    const categoriesProcessed = mainCategories.map(cat => {
      let categoryImage = 'https://images.unsplash.com/photo-1549298916-b41d501d3772?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80';
      let shopLink = `/products?category=${cat._id}`; // Default link

      const catName = cat.name.toLowerCase();

      // Custom Logic for specific categories
      if (catName === 'men') {
        categoryImage = "https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&w=800&q=80",
          shopLink = '/men'; // Route to your special Men page
      } else if (catName === 'women') {
        categoryImage = "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=800&q=80",
          shopLink = '/women'; // Route to your special Women page
      } else if (catName === 'kids') {
        categoryImage = "https://images.unsplash.com/photo-1514590734052-344a18719611?auto=format&fit=crop&w=800&q=80",
          shopLink = '/kids';
      }

      return {
        name: cat.name,
        image: categoryImage,
        shopLink: shopLink,
        _id: cat._id
      };
    });

    // 7. Cookie for Offer Badge
    const showOffer = !req.cookies?.offerClosed || req.cookies.offerClosed === "false";

    // 8. Hardcoded Partners
    const partners = [
      {
        name: "Nike",
        logo: "https://upload.wikimedia.org/wikipedia/commons/a/a6/Logo_NIKE.svg"
      },
      {
        name: "Adidas",
        logo: "https://upload.wikimedia.org/wikipedia/commons/2/20/Adidas_Logo.svg"
      },
      {
        name: "Puma",
        logo: "https://upload.wikimedia.org/wikipedia/en/d/da/Puma_complete_logo.svg"
      },
      {
        name: "Reebok",
        logo: "https://upload.wikimedia.org/wikipedia/commons/5/53/Reebok_2019_logo.svg"
      },

      {
        name: "Converse",
        logo: "https://upload.wikimedia.org/wikipedia/commons/3/30/Converse_logo.svg"
      }
    ];

    // 9. Render the View
    res.render("user/home", {
      title: "StepSphere - Premium Footwear",
      showNavbar: true,
      showfooter: true,
      user,
      products: productsWithImages,
      categories: categoriesProcessed,

      partners,
      showOffer,
      heroImage,
      heroTitle,
      heroSubtitle,
      active: 'home'
    });

  } catch (error) {
    console.log("Error in loadHome:", error.message);
    // Renders the error page instead of crashing
    res.status(500).render("error", { message: "Error loading home page. Please try again later." });
  }
};

////Logout
exports.userLogout = async (req, res) => {
  try {
    req.session.destroy();

    res.redirect("/home");
  } catch (error) {
    console.log(error.message);
  }
};


/// forgot password
exports.loadForgot = async (req, res) => {
  try {
    res.render("user/forgot-password");
  } catch (error) {
    console.log(error.message);
  }
};

exports.forgotpassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: email });

    if (!user) {
      return res.render("user/forgot-password", { message: "User not found", email });
    }

    if (!user.is_Verified) {
      return res.render("user/forgot-password", {
        message: "Please verify your email first",
        email,
      });
    }

    const token = crypto.randomBytes(32).toString("hex");
    user.resetToken = token;
    user.resetTokenExpiry = Date.now() + 3600000;
    await user.save();

    const resetLink = `http://localhost:3000/reset-password/${token}`;

    const mailOptions = {
      to: user.email,
      subject: "Password Reset",
      html: `<p>Click <a href="${resetLink}">here</a> to reset your password.</p>`,
      from: `"Stepsphere" <${process.env.MAIL_USER}>`
    };

    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        console.error("Email sending failed:", err);
        return res.status(500).json({sucess:false,message:"Failed to sent email.Try again later"});
      }

      console.log("Reset email sent:", info.response);
      return res.json({success:true,message:"Reset link sent to your email."});
    });
  } catch (error) {
    console.log("Error in forgotpassword:", error.message);
    return res.status(500).send("Internal server error");
  }
};

//////////////////////rest password////////////////////


exports.showResetForm = async (req, res) => {
  const { token } = req.params;
  const user = await User.findOne({
    resetToken: token,
    resetTokenExpiry: { $gt: Date.now() },
  });

  if (!user) return res.status(400).send("Invalid or expired token");

  res.render("user/reset-password", { token });
};


exports.resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  const user = await User.findOne({
    resetToken: token,
    resetTokenExpiry: { $gt: Date.now() },
  });

  if (!user) return res.status(400).send("Invalid or expired token");

  user.password = await bcrypt.hash(password, 10);
  user.resetToken = undefined;
  user.resetTokenExpiry = undefined;
  await user.save();

  res.send("Password reset successful!");

};

////////////////products////////////////////

exports.showProducts = async (req, res) => {
  try {
    const products = await product.find().lean();
    const productList = products.map(p => ({
      ...p,
      _id: p._id.toString()
    }));

    res.render('user/products', { products: productList, showNavbar: true, showfooter: true,user:req.session.user });
  } catch (error) {
    console.log("FULL ERROR:", error);
    res.status(500).send("Error: " + error.message);
  }
};

exports.productsDetaling = async (req, res) => {
  try {
    const productId = req.params.id;

    const productData = await product.findById(productId).populate('category').lean();

    if (!productData) {
      return res.status(404).render("error", { message: "Product not found" });
    }


    const relatedProducts = await product.find({
      category: productData.category._id,
      _id: { $ne: productId }
    }).limit(4).lean();
    res.render("user/productDetaling", {
      product: productData,
      relatedProducts: relatedProducts,
      showNavbar: true,
      showfooter: true,
      user: req.session.user
    });

  } catch (error) {
    console.log("Error in productDetail:", error.message);
    res.status(500).render("error", { message: "Internal Server Error" });
  }
};


//////////////////MEN//////////////////////

exports.loadMen = async (req, res) => {
  try {
    let pageData = {
      categoryName: "men's Collection",
      heroImage: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80",
      showNavbar: true,
      showfooter: true,
      user: req.session ? req.session.user : null
    };


    const menCategory = await Category.findOne({ name: { $regex: new RegExp("^men$", "i") } });

    if (!menCategory) {
      pageData.products = [];
      return res.render("user/men", pageData);
    }

    const subCategories = await Category.find({ parent: menCategory._id });
    const allCategoryIds = subCategories.map(cat => cat._id);
    allCategoryIds.push(menCategory._id);


    const rawProducts = await product.find({
      category: { $in: allCategoryIds },
      isActive: { $ne: false }
    }).lean();

    pageData.products = rawProducts.map(p => {
      let imagePath = '/uploads/default-shoe.jpg';
      if (p.images && p.images.length > 0) {
        imagePath = p.images[0].startsWith('http') ? p.images[0] : `/uploads/${p.images[0]}`;

      }
      return { ...p, mainImage: imagePath, _id: p._id.toString() };
    });

    res.render("user/men", pageData);
  } catch (error) {
    console.error("Error in loadWomen:", error);
    res.status(500).send("Error loading page");
  }
};

exports.loadWomen = async (req, res) => {
  try {
    let pageData = {
      categoryName: "Women's Collection",
      heroImage: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80",
      showNavbar: true,
      showfooter: true,
      user: req.session ? req.session.user : null
    };

    // 1. Find the "Women" Parent Category
    const womenCategory = await Category.findOne({ name: { $regex: new RegExp("^women$", "i") } });

    if (!womenCategory) {
      pageData.products = [];
      return res.render("user/women", pageData);
    }

    // 2. Find all sub-categories (Running, Casual, etc.) linked to Women
    const subCategories = await Category.find({ parent: womenCategory._id });
    const allCategoryIds = subCategories.map(cat => cat._id);
    allCategoryIds.push(womenCategory._id);

    // 3. Get Products
    const rawProducts = await product.find({
      category: { $in: allCategoryIds },
      isActive: { $ne: false } // Only show active products
    }).lean();

    // 4. Process Images (Using displayImage to match your Home logic)
    pageData.products = rawProducts.map(p => {
      let imagePath = '/images/default-shoe.jpg';
      if (p.images && p.images.length > 0) {
        imagePath = p.images[0].startsWith('http') ? p.images[0] : `/uploads/${p.images[0]}`;

      }
      return { ...p, displayImage: imagePath, _id: p._id.toString() };
    });

    res.render("user/women", pageData);
  } catch (error) {
    console.error("Error in loadWomen:", error);
    res.status(500).send("Error loading page");
  }
};
exports.loadkids = async (req, res) => {
  try {
    let pageData = {
      categoryName: "Kids's Collection",
      heroImage: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80",
      showNavbar: true,
      showfooter: true,
      user: req.session ? req.session.user : null
    };

    // 1. Find the "Women" Parent Category
    const womenCategory = await Category.findOne({ name: { $regex: new RegExp("^kids$", "i") } });

    if (!womenCategory) {
      pageData.products = [];
      return res.render("user/kids", pageData);
    }

    // 2. Find all sub-categories (Running, Casual, etc.) linked to Women
    const subCategories = await Category.find({ parent: womenCategory._id });
    const allCategoryIds = subCategories.map(cat => cat._id);
    allCategoryIds.push(womenCategory._id);

    // 3. Get Products
    const rawProducts = await product.find({
      category: { $in: allCategoryIds },
      isActive: { $ne: false } // Only show active products
    }).lean();

    // 4. Process Images (Using displayImage to match your Home logic)
    pageData.products = rawProducts.map(p => {
      let imagePath = '/images/default-shoe.jpg';
      if (p.images && p.images.length > 0) {
        imagePath = p.images[0].startsWith('http') ? p.images[0] : `/uploads/${p.images[0]}`;

      }
      return {
        ...p,
        displayImage: imagePath, _id: p._id.toString()
      };
    });

    res.render("user/kids", pageData);
  } catch (error) {
    console.error("Error in loadkids:", error);
    res.status(500).send("Error loading page");
  }
};

exports.searchProducts = async (req, res) => {
  try {
    const query = req.query.q;


    const matchedCategory = await Category.findOne({
      name: { $regex: new RegExp(`^${query}$`, 'i') }
    });

    let filter = {};

    if (matchedCategory) {

      filter = { category: matchedCategory._id };
    } else {

      filter = {
        $or: [
          { name: { $regex: query, $options: 'i' } },
          { brand: { $regex: query, $options: 'i' } },
          { description: { $regex: query, $options: 'i' } }
        ]
      };
    }

    const products = await product.find(filter).populate('category').lean();


    res.render('user/products', {
      products,
      searchQuery: query,
      showNavbar: true,
      showfooter: true,
      user:req.session.user
    });
  } catch (error) {
    res.status(500).send("Search error: " + error.message);
  }
};



