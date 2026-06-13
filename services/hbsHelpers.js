// services/hbsHelpers.js

module.exports = {
  // Logic Helpers
  eq: (a, b) => a?.toString() === b?.toString(),
  ne: (a, b) => a !== b,
  gt: (a, b) => a > b,
  lt: (a, b) => a < b,
  
  ifEquals: function (arg1, arg2, options) {
    return (arg1 == arg2) ? options.fn(this) : options.inverse(this);
  },
  
  isInArray: (arr, val) => Array.isArray(arr) && arr.includes(String(val)),
  
  // Math and Utility Helpers
  addOne: (index) => index + 1,
  range: (start, end) => Array.from({ length: end - start }, (_, i) => start + i),
  mathFloor: (n) => Math.floor(Math.abs(parseFloat(n) || 0)),
  subtract: (a, b) => (parseFloat(a) || 0) - (parseFloat(b) || 0),
  
  // Star Rating and Pricing Helpers
  times: function (n, block) {
    let accum = '';
    n = Math.floor(Math.abs(parseFloat(n) || 0));
    for (let i = 0; i < n; ++i) {
      accum += block.fn(this);
    }
    return accum;
  },
  
  hasHalfStar: (rating) => {
    const remainder = (parseFloat(rating) || 0) % 1;
    return remainder >= 0.25 && remainder <= 0.75;
  },
  
  calculateDiscountedPrice: (price, discount) => {
    const originalPrice = parseFloat(price) || 0;
    const discountPercent = parseFloat(discount) || 0;
    return Math.round(originalPrice * (100 - discountPercent) / 100);
  },
  
  formatDate: (date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
};
