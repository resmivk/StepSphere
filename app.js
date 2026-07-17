const express = require('express');
const path = require('path');
const exphbs = require('express-handlebars');
const hbshelpers = require('handlebars-helpers');
const session = require('express-session');
const multer = require('multer');
const flash = require('connect-flash');

// 1. ADDED MISSING LOGGERS AND SECURITY PACKAGES FROM APP 1
const logger = require('morgan');
const nocache = require('nocache');

require("dotenv").config({ quiet: true });

const app = express();

// 2. ADDED NOCACHE MIDDLEWARE
app.use(nocache());

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  rolling: true,
  cookie: {
    maxAge: 900000, 
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax',
  }
}));

// Passport (Google OAuth) 
const passport = require('./config/passport');
app.use(passport.initialize());
app.use(passport.session());


// Middleware
// 3. ADDED MORGAN REQUEST LOGGER
app.use(logger('dev')); 
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.use(flash());

const db = require("./config/connection");
db.connect((err) => {
  if (err) {
    console.log("Database Connection Failed:", err);
    process.exit(1);
  }
  console.log("Database Successfully Running ");
});

// View engine setup
const hbs = exphbs.create({
  extname: '.hbs',
  defaultLayout: 'main',
  layoutsDir: path.join(__dirname, 'views', 'layouts'),
  partialsDir: path.join(__dirname, 'views', 'partials')
});

const hbsHelpersList = require('./services/hbsHelpers');
for (const helperName in hbsHelpersList) {
  hbs.handlebars.registerHelper(helperName, hbsHelpersList[helperName]);
}

app.engine('hbs', hbs.engine);
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));

// Routes
const userRoute = require('./routes/userRoute');
const adminRoute = require('./routes/adminRoute');

app.use('/', userRoute);
app.use('/admin', adminRoute);

// 4. ADDED THE CATCH-ALL 404 ERROR HANDLER AT THE VERY BOTTOM
const ErrorMessage = require('./utils/ErrorMessage');
app.use('/*splat', ErrorMessage.ErrorContent);

module.exports = app;
