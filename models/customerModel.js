const mongoose = require('mongoose');


const userSchema = new mongoose.Schema({
    
    name:{
        type:String,
        required:true
    },
    phone:{
        type:Number,
        required:true
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    
    password:{
        type:String,
        required:true
    },
    blocked:{
        type:String,
        default:false
    },
    is_Verified: {
    type: Boolean,
    default: false},
     
   emailVerificationToken: { 
    type: String },
   
    token:{
      type:String,
      default:''
    },
     isBlocked: {
    type: Boolean,
    default: false  
  }
  
})
module.exports = mongoose.model('User', userSchema);

