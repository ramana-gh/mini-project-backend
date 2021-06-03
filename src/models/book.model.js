const mongoose = require('mongoose');
const validator = require('validator');

const bookSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },

        authors: {
            type: Array,
            required: true
        },

        edition: {
            type: Number,
            required: true,
            trim: true
        },

        isbn: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },

        totalCopies: {
            type: Number,
            required: true
        },

        copiesAvailable: {
            type: Number,
            required: true
        },

        publisher: {
            type: String,
            required: true,
            trim: true,
        },

        tags: {
            type: Array,
            default: []
        },

        rating: {
            type: {
                value: {
                    type: Number
                },
                sum: {
                    type: Number
                },
                count: {
                    type: Number
                }
            },
            default: {value: 0, sum: 0, count: 0}
        },

        rating: {
            type: Number,
            default: 0
        },

        ratingSum: {
            type: Number,
            default: 0
        },

        ratingCount: {
            type: Number,
            default: 0
        },

        addedBy: {
            type: String,
            required: true,
            trim: true,
        },

        updatedBy: {
            type: String,
            trim: true,
        },
    },
    {
        timestamps: true,
    }
);

const bookModel = mongoose.model('Book', bookSchema);  

module.exports = bookModel;