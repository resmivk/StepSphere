const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    subtitle: {
        type: String,
        trim: true,
        default: ''
    },
    imageUrl: {
        type: String,
        required: true
    },
    link: {
        type: String,
        default: '/products'
    },
    position: {
        type: Number,
        default: 1
    },
    isActive: {
        type: Boolean,
        default: true
    },
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active'
    }
}, { timestamps: true });

module.exports = mongoose.model('Banner', bannerSchema);