const mongoose = require('mongoose');
const validator = require('validator');

const adminSchema = mongoose.Schema(
    {
        adminId: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            validate(value) {
                if (!value.match(/^[B]\d{6}$/)) {
                  throw new Error('Invalid ID.');
                }
            },
        },

        name: {
            type: String,
            required: true,
            trim: true,
        },

        mobile: {
            type: String,
            required: true,
            minlength:10,
            maxlength:10,
            validate(value){
              if(!value.match(/^[6-9]\d{9}$/)){
                 throw new Error('Invalid Mobile number.')
              }
            }
        },

        email: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true,
            validate(value) {
              if (!validator.isEmail(value)) {
                throw new Error('Invalid email.');
              }
            },
        },

        address: {
            type: String,
            required: true,
            trim: true,
        },

        password: {
            type: String,
            required: true,
            minlength:8,
            trim: true,
            validate(value) {
                if (!value.match(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[~!@#$%^&*])/)) {
                  throw new Error('Weak password.');
                }
            },
        },

        role: {
            type: String,
            required: true,
            default: 'admin',
        },

    },
    {
        timestamps: true,
    }
);

const adminModel = mongoose.model('Admin', adminSchema);  

module.exports = adminModel;