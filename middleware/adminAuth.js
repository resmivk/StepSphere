exports.isAdminLoggedin = (req, res, next) => {
  if (req.session && req.session.admin) {
    return next(); 
  } else {
    return res.redirect('/admin/adminlogin'); 
  }
};
