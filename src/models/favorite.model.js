const mongoose = require('mongoose');
const validator = require('validator');

const favoriteSchema = mongoose.Schema(
    {
        isbn: {
            type: String,
            required: true,
            trim: true,
        },

        favoritedBy: {
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

const favoriteModel = mongoose.model('Favorite', favoriteSchema);  

module.exports = favoriteModel;