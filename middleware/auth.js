exports.loadloging = async(req,res,next)=>{
    try{
        console.log("loadloging middleware called");
        if(req.session.userId || req.session.user)
        {
           return next();
        }else{
            if (req.xhr || req.headers.accept?.includes('json') || req.headers['content-type']?.includes('json')) {
                return res.status(200).json({
                    success: false,
                    requireLogin: true,
                    message: "Please login to add items to cart",
                    redirect: "/login"
                });
            }
            return res.redirect("/login");
        }
    }
    catch(error){
        console.log(error.message);
        next(error);
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
  if (req.session.userId) {
    return next();
  }
  return res.redirect('/login');
};