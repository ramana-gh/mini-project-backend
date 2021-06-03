const mongoose = require('mongoose');
const validator = require('validator');

const historySchema = mongoose.Schema(
    {
        isbn: {
            type: String,
            required: true,
            trim: true,
        },

        count: {
            type: Number,
            required: true,
        },

        addedBy: {
            type: String,
            required: true,
            trim: true,
            validate(value) {
                if (!value.match(/^[B]\d{6}$/)) {
                  throw new Error('Invalid ID.');
                }
            },
        }
    },
    {
        timestamps: true,
    }
);

const historyModel = mongoose.model('History', historySchema);  

module.exports = historyModel;