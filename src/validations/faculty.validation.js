const Joi = require('joi');

const facultyRegister = {
    body: Joi.object().keys({
      facultyId: Joi.string().regex(/^[B]\d{6}$/).required().label("ID must start with B followed by 6 digits."),
      name: Joi.string().required().label("Name is required."),
      qualification: Joi.string().required().label("Qualification is required."),
      subjectsTaught: Joi.string().required().label("Subjects taught is required."),
      mobile: Joi.string().required().min(10).max(10).regex(/^[6-9]\d{9}$/).label("Phone number must have 10 digits."),
      email: Joi.string().required().email().label("Invalid email."),
      address: Joi.string().required().label("Address is required."),
      password: Joi.string().required().min(8).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[~!@#$%^&*])/).label("Password must have atleast 8 characters including uppercase letters, lower case letters, numbers and special characters.")
    }),
};

const facultyLogin = {
  body: Joi.object().keys({
    facultyId: Joi.string().regex(/^[B]\d{6}$/).required().label("Invalid ID."),
    password: Joi.string().required().min(8).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[~!@#$%^&*])/).label("Invalid Password.")
  }),
};

const facultyLogout = {
  body: Joi.object().keys({
    facultyId: Joi.string().regex(/^[B]\d{6}$/).required().label("Invalid ID.")
  }),
};

const facultyUpdateProfile = {
  body: Joi.object().keys({
    facultyId: Joi.string().regex(/^[B]\d{6}$/).required().label("ID must start with B followed by 6 digits."),
      name: Joi.string().required().label("Name is required."),
      qualification: Joi.string().required().label("Qualification is required."),
      subjectsTaught: Joi.string().required().label("Subjects taught is required."),
      mobile: Joi.string().required().min(10).max(10).regex(/^[6-9]\d{9}$/).label("Phone number must have 10 digits."),
      email: Joi.string().required().email().label("Invalid email."),
      address: Joi.string().required().label("Address is required."),
  }),
};

const facultyForgotPassword = {
  body: Joi.object().keys({
    facultyId: Joi.string().regex(/^[B]\d{6}$/).required().label("Invalid ID.")
  }),
};

const facultyResetPassword = {
  body: Joi.object().keys({
    facultyId: Joi.string().regex(/^[B]\d{6}$/).required().label("Invalid ID."),
    password: Joi.string().required().min(8).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[~!@#$%^&*])/).label("Password must have atleast 8 characters including uppercase letters, lower case letters, numbers and special characters."),
    repeatPassword: Joi.string().required().min(8).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[~!@#$%^&*])/).label("Passwords didn't match.")
  }),
};

const facultySendOtp = {
  body: Joi.object().keys({
    mobile: Joi.string().required().min(10).max(10).regex(/^[6-9]\d{9}$/).label("Invalid mobile number."),
  }),
};

const facultyVerifyOtp = {
  body: Joi.object().keys({
    otp: Joi.string().min(5).max(5).regex(/^[0-9]\d{4}$/).required().label("Invalid OTP."),
    requestId: Joi.string().required().label("Invalid Request ID.")
  }),
};

const facultyGetBook = {
  params: Joi.object().keys({
    isbn: Joi.string().required().label("ISBN is required."),
  }),
};

const facultySearchBooks = {
  body: Joi.object().keys({
    name: Joi.string().required().label("Name is required."),
    tags: Joi.array(),
    authors: Joi.array(),
    editions: Joi.array(), 
    ratings: Joi.array()
  }),
};

const facultyRateBook = {
  body: Joi.object().keys({
    isbn: Joi.string().required().label("ISBN is required."),
    rating: Joi.number().required().label("Invalid rating.")
  }),
};

const facultyTagBook = {
  body: Joi.object().keys({
    isbn: Joi.string().required().label("ISBN is required."),
    tags: Joi.array().required()
  }),
};

const facultyGetRating = {
  params: Joi.object().keys({
    isbn: Joi.string().required().label("ISBN is required."),
    addedBy: Joi.string().required().label("Added By is required."),
  }),
}

module.exports = {
    facultyRegister,
    facultyLogin,
    facultyLogout,
    facultyUpdateProfile,
    facultyForgotPassword,
    facultyResetPassword,
    facultySendOtp,
    facultyVerifyOtp,
    facultyGetBook,
    facultySearchBooks,
    facultyRateBook,
    facultyTagBook,
    facultyGetRating
};
