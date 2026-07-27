
const Admin = require('../models/adminModel');

exports.adminAuth = async (req, res, next) => {
    try {
        if (!req.session.admin) {
            return res.redirect('/admin');
        }

        const admin = await Admin.findById(req.session.admin).lean();

        if (!admin) {
            delete req.session.admin;
console.log("Admin not found. Redirecting to login.");
            return req.session.save(() => {
                return res.redirect('/admin');
            });
        }


        next();
    } catch (error) {
        console.error("Admin Auth Error:", error);
        res.status(500).send("Internal Server Error");
    }
};
