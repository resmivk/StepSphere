const User = require("../models/customerModel");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const crypto = require("crypto");

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_SECURE === "true",

  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});
transporter.verify((error, success) => {
  if (error) {
    console.error("Email transporter error:", error);
  } else {
    console.log("Email transporter is working");
  }
});


////// Registerload
exports.loadRegister = (req, res) => {
  res.render("user/register",{titile:'register',showNavbar:false,footer:false});
};



exports.insertUser = async (req, res) => {
  try {
    const { name, phone, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    
    if (existingUser) {
      return res.send("Email already registered");
    }

    const emailVerificationToken = crypto.randomBytes(16).toString("hex");

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);


    const newUser = new User({
      name,
      phone,
      email,
      password: hashedPassword,
      emailVerificationToken,
      is_Verified: false,
    });

    await newUser.save();
    const verificationUrl = `http://localhost:3000/verify?token=${emailVerificationToken}`;

    // Email options
    const mailOptions = {
      from: `"Stepsphere" <${process.env.SMTP_USER}>`,
      to: email,
      subject: "Verify Your Email for Sike Registration",
      text: `Hello ${name},\n\nPlease verify your email by clicking the link: ${verificationUrl}\n\nThank you!`,
      html: `<p>Hello ${name},</p>
             <p>Please verify your email by clicking the link below:</p>
             <a href="${verificationUrl}">Email Verification</a>
             <p>Thank you!</p>`,
    };

    // Send the email
    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        console.error("Error sending verification email:", err);
        return res
          .status(500)
          .send("User registered but email could not be sent. Try again.");
      }

      console.log("Verification email sent: " + info.response);
      return res.send(
        "User registered successfully. Please verify your email."
      );
    });
  } catch (error) {
    console.log("Error in insertUser:", error.message);
    res.status(500).send("Internal Server Error");
  }
};

// Email verification route
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
  res.render("user/login",{
    title: "Login", 
    showNavbar: false ,
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

    // Password length check
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

    res.render("user/home", {
      title: "Home",
      showNavbar: true,
      showfooter: true,
      user
    });
  } catch (error) {
    console.log(error.message);
  }
};



exports.userLogout = async (req, res) => {
  try {
    req.session.destroy();

    res.redirect("/login");
  } catch (error) {
    console.log(error.message);
  }
};
