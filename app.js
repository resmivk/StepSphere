const express = require('express');
const path = require('path');
const exphbs = require('express-handlebars');
const hbshelpers = require('handlebars-helpers');
const session = require('express-session');
const mongoose = require('mongoose');

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

// View engine setup with handlebars
 app.engine('hbs', exphbs.engine({
  extname: '.hbs',
  defaultLayout: 'main',
     layoutsDir: path.join(__dirname, 'views', 'layouts'),
  partialsDir: path.join(__dirname, 'views', 'partials'),
  helpers: {
   ifEquals: function(arg1, arg2, options) {
      return (arg1 == arg2) ? options.fn(this) : options.inverse(this);
    }
   }
 }));
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));

// Routes
const userRoute = require('./routes/userRoute');
// const adminRoute = require('./routes/adminRoute');

app.use('/', userRoute);
// app.use('/admin', adminRoute);

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {});
