const mongoose = require('mongoose');
const validator = require('validator');

const filterSchema = mongoose.Schema(
    {
        _id: {
            type: Number,
            default: 1
        },

        tags: {
            type: [String]
        },

        authors: {
            type: [String]
        },

        editions: {
            type: [String]
        },

        ratings: {
            type: [String],
            default: ['1', '2', '3', '4', '5']
        }
    }
);

const filterModel = mongoose.model('Filter', filterSchema);  

module.exports = filterModel;