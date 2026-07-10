// const passport = require('passport');
// const GoogleStrategy = require('passport-google-oauth20').Strategy;
// const User = require('../models/userModel');

// exports.use(new GoogleStrategy({
//     clientID: process.env.GOOGLE_CLIENT_ID,
//     clientSecret: process.env.GOOGLE_CLIENT_SECRET,
//     callbackURL: "/auth/google/callback"
//   },
//   async (accessToken, refreshToken, profile, done) => {
//     try {
//       let user = await User.findOne({ googleId: profile.id });

//       if (!user) {
//         // check if an account with this email already exists (registered normally)
//         user = await User.findOne({ email: profile.emails[0].value });

//         if (user) {
//           // link Google to existing account
//           user.googleId = profile.id;
//           await user.save();
//         } else {
//           // create new user
//           user = await User.create({
//             name: profile.displayName,
//             email: profile.emails[0].value,
//             googleId: profile.id,
//             is_Verified: true,
//             phone: 0 // placeholder since your schema requires it - see note below
//           });
//         }
//       }

//       return done(null, user);
//     } catch (err) {
//       return done(err, null);
//     }
//   }
// ));

// exports.serializeUser((user, done) => {
//   done(null, user._id);
// });

// exports.deserializeUser(async (id, done) => {
//   try {
//     const user = await User.findById(id);
//     done(null, user);
//   } catch (err) {
//     done(err, null);
//   }
// });

const passoport=require('passport');
const GoogleStrategy=require('passport-google-oauth20')
const User= require('../models/userModel')

