
const  Admin=require('../models/adminModel')
// const  Products=require('../models/productModel')
const User=require('../models/customerModel')
const bcrypt=require('bcrypt');




////// Registerload
exports. loadRegister=(req,res)=>{
    res.render('admin/adminregister')
};


// Insert user and send email verification

exports.insertAdmin = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({ 
        message: "Email already registered",
        type: "error" 
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newAdmin = new Admin({
      name,
      email,
      password: hashedPassword,
    });

    await newAdmin.save();
    
    res.redirect('/admin/adminlogin')
  
  } catch (error) {
    console.log("Error in insertAdmin:", error.message);
    res.status(500).json({ 
      message: "Internal Server Error",
      type: "error" 
    });
  }
};

// Load Login
exports.loadLogin=async(req,res)=>{
  res.render('admin/adminlogin')
}
//verify login
exports.verifyLogin=async(req,res)=>{
  try{
      const {email,password}=req.body;
      const adminData=await Admin.findOne({email});
      if(!adminData)
        { 
          return res.send("admin is not found")
        }
      const match= await bcrypt.compare(password,adminData.password);
      if(!match){
        return res.send("Incorrect Password")
      }
      req.session.admin=adminData._id;
    res.redirect('/admin/adminDashboard')
  }
  catch(error){
    console.log(error.message);
    res.render('admin/adminlogin',{
      error:"An error occured during login"
    })

  }
}




//logout
 exports.userLogout=async(req,res)=>{
  try{
    
    req.session.destroy()
      
      
      res.redirect('/admin/adminlogin'); 
  

  }
  catch(error){
    console.log(error.message)
  }
 }

 ////  dashboard 

exports.loadDashboard = (req, res) => {
    
    res.render('admin/adminDashboard', {
      admin:true,
     title: 'Dashboard',
      activePage: 'dashboard',
     
    
  
  });

};
//// Customer

exports.addCustomers=async (req,res)=>{
  try{
    const users= await User.find().lean()
  res.render('admin/customer',{users})
  }
  catch(error){
    console.log(error.message)
    res.render('admin/customer',{error:"faild to load users"})
  }
}
exports.listUsers=async (req,res)=>{
  try{
    const user=await User.find().lean()
    res.render('admin/customer',{user})

  }
  catch(error){
    console.log(error.message)
  }
}
exports.blockUser= async(req,res)=>{
  try{
     const user= await User.findById(req.params.id)
     if(!user){
      return res.status(404).send('User is not found')
     }
     user.isBlocked=!user.isBlocked
     await user.save();
     res.redirect('/admin/customer')
  }    
   catch(error)
  {
   console.log(error.message)
   res.status(500).send("Error updating user statues")
  }
}


// Unblock user (Admin only)

exports.unblockUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).send('User is not found');
    }
    user.isBlocked = false;
    await user.save();
    res.redirect('/admin/customer');
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Error unblocking user");
  }
};
