const express = require('express');
const path = require('path');
const exphbs = require('express-handlebars');
const hbshelpers = require('handlebars-helpers');
const session = require('express-session');
const mongoose = require('mongoose');
const multer = require('multer');
const flash = require('connect-flash');


// Load environment variables
require("dotenv").config();

const app = express();

// MongoDB connection
mongoose.connect('mongodb://127.0.0.1:27017/stepsphere', {})
  .then(() => {
    
  })
  .catch((err) => {
    console.log('MongoDB connection error:', err);
  });

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'defaultsecret',
  resave: false,
  saveUninitialized: false,
}));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.use(flash());

// View engine setup with handlebars

app.engine('hbs', exphbs.engine({
  extname: '.hbs',
  defaultLayout: 'main',
  layoutsDir: path.join(__dirname, 'views', 'layouts'),
  partialsDir: path.join(__dirname, 'views', 'partials'),
  helpers: {
    eq: (a, b) => a === b,
    ne: (a, b) => a !== b,
    gt: (a, b) => a > b,
    lt: (a, b) => a < b,
    addOne: (index) => index + 1,
    eq: (a, b) => a?.toString() === b?.toString(),
     eq: (a, b) => a?.toString() === b?.toString(),
    isInArray: (arr, val) => Array.isArray(arr) && arr.includes(String(val)),
    ifEquals: function (arg1, arg2, options) {
      return (arg1 == arg2) ? options.fn(this) : options.inverse(this);
    },
    formatDate: function (date) {
      if (!date) return '';
      return new Date(date).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    }
 
  }
}));

app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));

// Routes
const userRoute = require('./routes/userRoute');
const adminRoute = require('./routes/adminRoute');

app.use('/', userRoute);
 app.use('/admin', adminRoute);

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {});
