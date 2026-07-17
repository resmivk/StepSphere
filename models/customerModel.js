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

    is_Verified: {
        type: Boolean,
        default: false
    },
    emailVerificationToken: { 
        type: String 
    },
    token:{
        type:String,
        default:''
    },
    isBlocked: {
        type: Boolean,
        default: false  
    },
    resetToken: {
        type: String
    },
    resetTokenExpiry: {
        type: Date
    },
    googleId: {
  type: String
},
password:{
  type: String,
  required: function() { return !this.googleId; } 
},
    cart: [
        {
            productId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Product',
                required: true
            },
            quantity: {
                type: Number,
                default: 1
            },
            price: {
                type: Number
            }
        }
    ]
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);