const user=require("../controllers/customerController")
const User=require("../models/customerModel")


///////////CUSTOMERS /////////////////////////////

exports.customerInfo = async (req, res) => {
    try {
        const { search = "", page = 1, status } = req.query;
        const limit = 10;
        const currentPage = Math.max(1, parseInt(page));

       
        const query = {};
        if (search.trim()) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }
        
       
        if (status === 'active') {
            query.isBlocked = false;
        } else if (status === 'blocked') {
            query.isBlocked = true;
        }

        // Get customers with pagination
        const customers = await User.find().lean()
            .limit(limit)
            .skip((currentPage - 1) * limit)
            .select('-password')
            .sort({ createdAt: -1 });
        const totalCustomers = await User.countDocuments({ role: 'customer' });
        const activeCustomers = await User.countDocuments({ 
            
            isBlocked: false 
        });
        const blockedCustomers = await User.countDocuments({ 
           
            isBlocked: true 
        });
        
        const totalFilteredCustomers = await User.countDocuments(query);
        const totalPages = Math.ceil(totalFilteredCustomers / limit);

        const pagination = {
            currentPage,
            totalPages,
            hasPrev: currentPage > 1,
            hasNext: currentPage < totalPages,
            prevPage: currentPage > 1 ? currentPage - 1 : null,
            nextPage: currentPage < totalPages ? currentPage + 1 : null,
            pages: Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let startPage = Math.max(1, currentPage - 2);
                return startPage + i;
            }).filter(page => page <= totalPages)
        };

        res.render('admin/customers', {
            
            admin: true ,
            title: 'Customer Management',
            users: customers,
            search,
            filter: status,
            totalCustomers,
            activeCustomers,
            blockedCustomers,
            pagination,
            success: req.flash('success'),
            error: req.flash('error')
        });

    } catch (error) {
        console.error("Error in customerInfo:", error);
        req.flash('error', 'Failed to load customers');
        res.redirect('/admin/adminDashboard');
    }
};