const mongoose = require('mongoose');
const validator = require('validator');

const facultySchema = mongoose.Schema(
    {
        facultyId: {
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

        qualification: {
            type: String,
            required: true,
            trim: true,
        },

        subjectsTaught: {
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
            default: 'faculty',
        },

    },
    {
        timestamps: true,
    }
);

const facultyModel = mongoose.model('Faculty', facultySchema);  

module.exports = facultyModel;