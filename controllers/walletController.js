const Wallet = require('../models/walletModel');
const User = require('../models/customerModel');

// GET /profile/wallet
exports.getWallet = async (req, res) => {
  try {
    const userId = req.session?.user?._id || req.session?.customer?._id || req.session?.userId;
    if (!userId) {
      return res.redirect('/login');
    }

    let wallet = await Wallet.findOne({ userId }).lean();

    if (!wallet) {
      const newWallet = new Wallet({ userId, balance: 0, transactions: [] });
      await newWallet.save();
      wallet = newWallet.toObject();
    }

    // Sort transactions newest first
    const transactions = (wallet.transactions || []).sort((a, b) => new Date(b.date) - new Date(a.date));

    res.render('user/profile/wallet', {
      wallet,
      transactions,
      user: req.session.user || { _id: userId },
      activePage: 'wallet',
      title: 'My Wallet - StepSphere',
       showNavbar: true,
      showfooter: true,
      showprofileSidebar: true,
    });
  } catch (err) {
    console.error('getWallet error:', err);
    res.status(500).send('Server Error');
  }
};

// POST /wallet/add-funds
exports.addFunds = async (req, res) => {
  try {
    const userId = req.session?.user?._id || req.session?.customer?._id || req.session?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'User not logged in' });
    }

    const { amount } = req.body;
    const numericAmount = parseFloat(amount);

    if (isNaN(numericAmount) || numericAmount <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid amount entered' });
    }

    let wallet = await Wallet.findOne({ userId });
    if (!wallet) {
      wallet = new Wallet({ userId, balance: 0, transactions: [] });
    }

    wallet.balance += numericAmount;
    wallet.transactions.push({
      amount: numericAmount,
      type: 'credit',
      description: 'Added funds to wallet',
      date: new Date()
    });

    await wallet.save();

    res.json({
      success: true,
      message: `Successfully added ₹${numericAmount.toFixed(2)} to your wallet!`,
      newBalance: wallet.balance.toFixed(2)
    });
  } catch (err) {
    console.error('addFunds error:', err);
    res.status(500).json({ success: false, message: 'Failed to add funds. Server error.' });
  }
};

// POST /wallet/pay
exports.payWithWallet = async (req, res) => {
  try {
    const userId = req.session?.user?._id || req.session?.customer?._id || req.session?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'User not logged in' });
    }

    const { amount, description } = req.body;
    const numericAmount = parseFloat(amount);

    if (isNaN(numericAmount) || numericAmount <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid payment amount' });
    }

    const wallet = await Wallet.findOne({ userId });
    if (!wallet || wallet.balance < numericAmount) {
      return res.status(400).json({ success: false, message: 'Insufficient wallet balance' });
    }

    wallet.balance -= numericAmount;
    wallet.transactions.push({
      amount: numericAmount,
      type: 'debit',
      description: description || 'Payment for order',
      date: new Date()
    });

    await wallet.save();

    res.json({
      success: true,
      message: 'Payment completed via wallet!',
      newBalance: wallet.balance.toFixed(2)
    });
  } catch (err) {
    console.error('payWithWallet error:', err);
    res.status(500).json({ success: false, message: 'Wallet payment failed' });
  }
};
