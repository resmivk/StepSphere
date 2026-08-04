
const User=require('../models/customerModel')
module.exports=async(req,res,next)=>{
    if(!req.session.user){
        return next()
    }
    const Customer=await User.findById(req.session.user._id)
    if(Customer && Customer.isBlocked){
       return res.redirect('/login?blocked=true') 
      }
next()
        
}