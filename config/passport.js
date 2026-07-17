

const passport=require('passport');
const GoogleStrategy=require('passport-google-oauth20')
const User= require('../models/customerModel')


passport.use(new GoogleStrategy({
   clientID: process.env.GOOGLE_CLIENT_ID,
     clientSecret: process.env.GOOGLE_CLIENT_SECRET,
     callbackURL: "/auth/google/callback" 
},
async(accessToken,refeshToken,profile,done)=>{
    try {
      let user = await User.findOne({ googleId: profile.id });
     if (!user) {

        user = await User.findOne({ email: profile.emails[0].value });

       if (user) {
         // link Google to existing account
          user.googleId = profile.id;
          await user.save();
        } else {
          // create new user
          user = await User.create({
            name: profile.displayName,
    email: profile.emails[0].value,
           googleId: profile.id,
            is_Verified: true,
            phone: 0 
           });
         }
       }

       return done(null, user);
    } catch (err) {
      return done(err, null);
    }

}
))
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Get full user from database using ID
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
})
module.exports=passport