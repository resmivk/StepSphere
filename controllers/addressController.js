
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
        console.error("Ereor fetching addresses",error)

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
    // console.log("Hi i am addAdress")
    // console.log('userId :',userId , "houseName :",houseName , "streetAddress :", streetAddress , "landmark :", landmark , "city :", city , "state :",state, "zip :", zip, "country :", country, "phone :", phone)
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

// exports.editAddress=async(req,res)=>{
//     try{
//         const addr=await address.findOne({_id:req.params.id,userId:req.session.userId}).lean()
//         if(!addr) return res.status(404).send("Address not found",{address:addr,user:req.session.userId})
//          res.render("user/profile/EditeAddress",{activepage:'address',
//      showNavbar: true,
//      showprofileSidebar:true,
//      showfooter: true,
//      })   

        
//     }
//     catch(error){
//         console.error("Error loding editing address",error)
//     }
// }
 exports.editAddress=async(req,res)=>{
  try{
    
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
    

exports.deleteAddress = async(req,res)=>{
   try{
    await address.findByIdAndDelete({_id:req.params.id,userId:req.session.userId})
    res.redirect("/profile/addressList")
   } 
   catch(error){
     console.log(" Error in deleting address",error)
   }

}