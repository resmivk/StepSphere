exports.loadloging = async(req,res,next)=>{
    try{
        if(req.session.user)
            {
           return  next();

        }else{
            res.redirect("/")
        }

    }

    catch(error){
        console.log(error.message)
    }
}

exports.loadlogout = async (req, res, next) => {
  try {
    if (req.session.userId) {
      return res.redirect("/home");
    }
    return next();
}
    catch(error){
        console.log(error.message)
    }
}


exports.isAuthenticated = (req, res, next) => {
  if (req.session.user) {
    return next();
  }
  return res.redirect('/');
};