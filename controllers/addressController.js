
const address=require('../models/addressModel')

exports. getaddress= async (req,res)=>{
    try{
        const addresses=await address.find({ userId:req.session.userId}).lean()
        res.render('user/profile/addressList',
            {addresses,user:req.session.userId,activepage:'addresse',
     showNavbar: true,
     showprofileSidebar:true,
     showfooter: true,
     })

    }
    catch(error){
        console.error("Error fetching addresses",error)

    }
}
exports.showAddAddress=(req,res)=>{
res.render("user/profile/addAddress",{user:req.session.userId,activepage:'addresse',
     showNavbar: true,
     showprofileSidebar:true,
     showfooter: true})

}

exports.addAddress = async (req, res) => {
  try {
    const { houseName, streetAddress, landmark,city, state, zip ,country,phone} = req.body;

    
    const newAddress = new address({
      userId: req.session.userId,
      houseName,
      streetAddress,
      landmark,
      city,
      state,
      zip,
      country,
      phone
    })
      
    const save = await newAddress.save()


    if(save){
       console.log("address saved")
      res.redirect('/profile/addressList');
    }else{
      console.log("error saving address")
    }

    
  } catch (error) {
    res.status(500).send('Error adding address');
  }
};

exports.editAddress=async(req,res)=>{
  
  try{
     const addressId=req.params.id;
     const User=req.session.userId
     const addr=await address.findOne({_id:addressId,userId:User}).lean()
     if(!addr)return res.status(404).send("Address not found",)
     res.render("user/profile/EditeAddress",{activepage:'address',
     showNavbar: true,
     showprofileSidebar:true,
      showfooter: true,
      address:addr,
      user:req.session.userId
      })   
     
  }
  catch(error){
    res.status(500).send("Error loading Editing address" ,error)
  }
 }
exports.updateAddress=async(req,res)=>{
    try{
        await address.findOneAndUpdate({_id:req.params.id,userId:req.session.userId},req.body)
        res.redirect("/profile/addressList")
    }
    catch(error){
        console.error("Error updating address",error)
    }
}
    


exports.deleteAddress = async (req, res) => {
  try {
    const addressId = req.params.id;
    const userId = req.session.userId;

    await address.findOneAndDelete({ _id: addressId, userId: userId });
    res.redirect('/profile/addressList'); 
  } catch (error) {
    console.error('Error deleting address:', error);
    res.status(500).send('Error deleting address');
  }
};
