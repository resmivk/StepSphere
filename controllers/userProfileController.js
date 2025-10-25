const User=require('../models/customerModel')
const address=require('../models/addressModel')


///profile
exports.loadProfile = async (req, res) => {
  try {
    const user = await User.findById(req.session.userId).lean();
    // const userAddress=await address.findOne({userId:req.session.userId}).lean()
    res.render("user/profile/profile", {
      
     activepage:'profile',
     showNavbar: true,
     showprofileSidebar:true,
     showfooter: true,
     user:user
     });
  } catch (error) {
    res.status(500).send("Error loading profile");
  }
};

// Update Profile Info
exports.updateProfile = async (req, res) => {
  try {
    const { name, phone, address } = req.body;
    await User.findByIdAndUpdate(req.session.userId, { name, phone, address });
    res.redirect("/profile");
  } catch (error) {
    res.status(500).send("Error updating profile");
  }
};
////Edit the profile
exports.loadEditeprofile=async(req,res)=>{
  try{
    const user= await User.findById(req.session.userId).lean();
    res.render('user/profile/Editprofile',{
      activepage:'profile',
     showNavbar: true,
     showprofileSidebar:true,
     showfooter: true,
     user:user
    })
  }
  catch(error){
    res.status(500).send("Error for editing")
  }
}