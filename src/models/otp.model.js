const mongoose = require('mongoose');
const validator = require('validator');

const otpSchema = mongoose.Schema(
    {
        mobile: {
            type: String,
            required: true,
            unique: true,
            minlength:10,
            maxlength:10,
            validate(value){
              if(!value.match(/^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/)){
                 throw new Error('Invalid Mobile number')
              }
            }
        },

        otp: {
            type: String,
            required: true,
            minlength:5,
            maxlength:5,
            trim: true,
        },

        requestId: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        }
    },
    {
        timestamps: true,
    }
);

const otpModel = mongoose.model('Otp', otpSchema);  

module.exports = otpModel;