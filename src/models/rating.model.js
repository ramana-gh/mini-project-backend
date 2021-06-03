const mongoose = require('mongoose');
const validator = require('validator');

const ratingSchema = mongoose.Schema(
    {
        isbn: {
            type: String,
            required: true,
            trim: true,
        },

        rating: {
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

const ratingModel = mongoose.model('Rating', ratingSchema);  

module.exports = ratingModel;