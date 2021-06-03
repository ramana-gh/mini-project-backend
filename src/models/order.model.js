const mongoose = require('mongoose');
const validator = require('validator');

const orderSchema = mongoose.Schema(
    {
        isbn: {
            type: String,
            required: true,
            trim: true,
        },

        days: {
            type: Number,
            required: true
        },

        returnDate: {
            type: Date,
            default: null
        },

        orderedBy: {
            type: String,
            required: true,
            trim: true,
            validate(value) {
                if (!value.match(/^[B]\d{6}$/)) {
                  throw new Error('Invalid ID.');
                }
            },
        },

        acceptedBy: {
            type: String,
            trim: true,
            default: null
        },

        extendReason: {
            type: String,
            trim: true,
            default: null
        },

        extendDays: {
            type: Number,
            default: 0
        },

        extendAccepted: {
            type: Boolean,
            default: false
        },

        returned: {
            type: Boolean,
            trim: true,
            default: false
        },

        canceled: {
            type: Boolean,
            trim: true,
            default: false
        }
    },
    {
        timestamps: true,
    }
);

const orderModel = mongoose.model('Order', orderSchema);  

module.exports = orderModel;