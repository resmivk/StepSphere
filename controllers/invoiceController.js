// controllers/invoiceController.js

const PDFDocument = require('pdfkit');
const Order = require('../models/orderModel');

/**
 * Reusable Helper: Generates and streams the PDF invoice to the response
 * @param {Object} order - The populated/lean order document
 * @param {Object} res   - Express response object
 */
function generateInvoicePDF(order, res) {
  // 1. Set download headers
  const fileName = `StepSphere-Invoice-${order._id.toString().slice(-6)}.pdf`;
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);

  // 2. Initialize PDFKit Document (A4 size with 40px margins)
  const doc = new PDFDocument({ margin: 40, size: 'A4' });

  // Stream data directly to the client browser
  doc.pipe(res);

  // ================= 1. HEADER & BRANDING =================
  doc.fillColor('#00b4d8')
     .fontSize(24)
     .font('Helvetica-Bold')
     .text('StepSphere', 40, 45);

  doc.fillColor('#666666')
     .fontSize(9)
     .font('Helvetica')
     .text('Your Premium Footwear Store', 40, 72)
     .text('support@stepsphere.com | www.stepsphere.com', 40, 85);

  // Tax Invoice Details (Top-Right)
  doc.fillColor('#111111')
     .fontSize(16)
     .font('Helvetica-Bold')
     .text('TAX INVOICE', 350, 45, { align: 'right' });

  const invoiceDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  doc.fontSize(9)
     .font('Helvetica')
     .fillColor('#444444')
     .text(`Invoice No: INV-${order._id.toString().slice(-8).toUpperCase()}`, 350, 68, { align: 'right' })
     .text(`Order Date: ${invoiceDate}`, 350, 82, { align: 'right' })
     .text(`Payment: ${(order.paymentMethod || 'COD').toUpperCase()} (${(order.paymentStatus || 'PENDING').toUpperCase()})`, 350, 96, { align: 'right' })
     .text(`Status: ${(order.orderStatus || 'PLACED').toUpperCase()}`, 350, 110, { align: 'right' });

  // Divider Line
  doc.strokeColor('#e2e8f0').lineWidth(1).moveTo(40, 128).lineTo(555, 128).stroke();

  // ================= 2. BILLING & SHIPPING ADDRESS =================
  doc.fillColor('#0f172a')
     .fontSize(10)
     .font('Helvetica-Bold')
     .text('SHIPPED TO:', 40, 140);

  doc.fillColor('#475569')
     .font('Helvetica')
     .fontSize(9)
     .text(order.address?.fullName || 'Customer', 40, 155)
     .text(order.address?.street || '', 40, 168)
     .text(`${order.address?.city || ''}, ${order.address?.state || ''} - ${order.address?.pincode || ''}`, 40, 181)
     .text(`Phone: ${order.address?.phone || 'N/A'}`, 40, 194);

  // ================= 3. ITEMS TABLE =================
  const tableTop = 225;

  // Header Background Bar
  doc.rect(40, tableTop, 515, 22).fill('#f8fafc');

  // Header Titles
  doc.fillColor('#1e293b')
     .font('Helvetica-Bold')
     .fontSize(9);

  doc.text('#', 50, tableTop + 6);
  doc.text('Item Description', 75, tableTop + 6);
  doc.text('Size', 290, tableTop + 6);
  doc.text('Qty', 350, tableTop + 6);
  doc.text('Price', 410, tableTop + 6);
  doc.text('Total', 485, tableTop + 6, { align: 'right', width: 60 });

  let y = tableTop + 28;
  let subtotal = 0;

  // Table Rows
  doc.font('Helvetica').fontSize(9).fillColor('#334155');

  order.items.forEach((item, index) => {
    const itemTotal = item.price * item.quantity;
    subtotal += itemTotal;

    doc.text((index + 1).toString(), 50, y);
    doc.text(item.name || 'Footwear Product', 75, y, { width: 205 });
    doc.text(item.size || 'Standard', 290, y);
    doc.text(item.quantity.toString(), 350, y);
    doc.text(`₹${Number(item.price).toFixed(2)}`, 410, y);
    doc.text(`₹${Number(itemTotal).toFixed(2)}`, 485, y, { align: 'right', width: 60 });

    y += 22;
    // Row separator line
    doc.strokeColor('#f1f5f9').lineWidth(0.5).moveTo(40, y - 5).lineTo(555, y - 5).stroke();
  });

  // ================= 4. SUMMARY & TOTALS =================
  y += 10;
  const platformFee = 20;

  doc.fontSize(9).font('Helvetica').fillColor('#64748b');
  doc.text('Subtotal:', 350, y);
  doc.text(`₹${subtotal.toFixed(2)}`, 485, y, { align: 'right', width: 60 });

  y += 18;
  doc.text('Platform / Shipping Fee:', 350, y);
  doc.text(`₹${platformFee.toFixed(2)}`, 485, y, { align: 'right', width: 60 });

  y += 18;
  // Total Divider Line
  doc.strokeColor('#00b4d8').lineWidth(1.5).moveTo(350, y).lineTo(555, y).stroke();

  y += 8;
  doc.fontSize(11).font('Helvetica-Bold').fillColor('#0f172a');
  doc.text('Grand Total:', 350, y);
  doc.text(`₹${Number(order.totalAmount).toFixed(2)}`, 485, y, { align: 'right', width: 60 });

  // ================= 5. FOOTER =================
  doc.fontSize(8)
     .font('Helvetica')
     .fillColor('#94a3b8')
     .text('Thank you for shopping with StepSphere!', 40, 720, { align: 'center', width: 515 })
     .text('This is a computer-generated invoice and requires no physical signature.', 40, 735, { align: 'center', width: 515 });

  // End and flush stream
  doc.end();
}

// ================= EXPORTED CONTROLLER METHODS =================

// 1. User Download (Ensures the user owns the order)
exports.downloadUserInvoice = async (req, res) => {
  try {
    const userId = req.session.user?._id || req.session.userId;
    if (!userId) {
      return res.redirect('/login');
    }

    const { id } = req.params;

    // Security check: order must belong to logged-in user
    const order = await Order.findOne({ _id: id, user: userId });
    if (!order) {
      return res.status(404).send('Order not found or access denied');
    }

    generateInvoicePDF(order, res);

  } catch (error) {
    console.error('downloadUserInvoice error:', error);
    res.status(500).send('Error generating invoice');
  }
};

// 2. Admin Download (Admin can download any order invoice)
exports.downloadAdminInvoice = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).send('Order not found');
    }

    generateInvoicePDF(order, res);

  } catch (error) {
    console.error('downloadAdminInvoice error:', error);
    res.status(500).send('Error generating admin invoice');
  }
};
module.exports = {
  downloadUserInvoice: exports.downloadUserInvoice,
  downloadAdminInvoice: exports.downloadAdminInvoice
};