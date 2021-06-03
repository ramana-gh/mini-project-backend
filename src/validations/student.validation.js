const Joi = require('joi');

const studentRegister = {
    body: Joi.object().keys({
      studentId: Joi.string().regex(/^[B]\d{6}$/).required().label("ID must start with B followed by 6 digits."),
      name: Joi.string().required().label("Name is required."),
      joinYear: Joi.number().required(),
      sem: Joi.string().required().label("Semester is required."),
      class: Joi.string().required().label("Class is required."),
      mobile: Joi.string().required().min(10).max(10).regex(/^[6-9]\d{9}$/).label("Phone number must have 10 digits."),
      email: Joi.string().required().email().label("Invalid email."),
      address: Joi.string().required().label("Address is required."),
      password: Joi.string().required().min(8).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[~!@#$%^&*])/).label("Password must have atleast 8 characters including uppercase letters, lower case letters, numbers and special characters.")
    }),
};



const studentLogin = {
  body: Joi.object().keys({
    studentId: Joi.string().regex(/^[B]\d{6}$/).required().label("Invalid ID."),
    password: Joi.string().required().min(8).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[~!@#$%^&*])/).label("Invalid Password.")
  }),
};

const studentLogout = {
  body: Joi.object().keys({
    studentId: Joi.string().regex(/^[B]\d{6}$/).required().label("Invalid ID."),
  }),
};

const studentUpdateProfile = {
  body: Joi.object().keys({
    studentId: Joi.string().regex(/^[B]\d{6}$/).required().label("ID must start with B followed by 6 digits."),
    name: Joi.string().required().label("Name is required."),
    joinYear: Joi.number().required(),
    sem: Joi.string().required().label("Semester is required."),
    class: Joi.string().required().label("Class is required."),
    mobile: Joi.string().required().min(10).max(10).regex(/^[6-9]\d{9}$/).label("Phone number must have 10 digits."),
    email: Joi.string().required().email().label("Invalid email."),
    address: Joi.string().required().label("Address is required."),
  }),
};

const studentForgotPassword = {
  body: Joi.object().keys({
    studentId: Joi.string().regex(/^[B]\d{6}$/).required().label("Invalid ID."),
  }),
};

const studentResetPassword = {
  body: Joi.object().keys({
    studentId: Joi.string().regex(/^[B]\d{6}$/).required().label("Invalid ID."),
    password: Joi.string().required().min(8).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[~!@#$%^&*])/).label("Password must have atleast 8 characters including uppercase letters, lower case letters, numbers and special characters."),
    repeatPassword: Joi.string().required().min(8).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[~!@#$%^&*])/).label("Invalid Password."),
  }),
};

const studentSendOtp = {
  body: Joi.object().keys({
    mobile: Joi.string().required().min(10).max(10).regex(/^[6-9]\d{9}$/).label("Invalid mobile number."),
  }),
};

const studentVerifyOtp = {
  body: Joi.object().keys({
    otp: Joi.string().required().min(5).max(5).label("Invalid OTP."),
    requestId: Joi.string().required().label("Invalud Request ID."),
  }),
};

const studentGetBook = {
  params: Joi.object().keys({
    isbn: Joi.string().required().label("ISBN is required."),
  }),
};

const studentOrderBook = {
  body: Joi.object().keys({
    isbn: Joi.string().required().label("ISBN is required."),
    days: Joi.number().required().label("Invalid days."),
  }),
};

const studentExtendOrder = {
  body: Joi.object().keys({
    isbn: Joi.string().required().label("ISBN is required."),
    days: Joi.number().required().label("Invalid Days."),
    reason: Joi.string().required().label("Reason is required."),
  }),
};

const studentCancelOrder = {
  params: Joi.object().keys({
    isbn: Joi.string().required().label("ISBN is required."),
  }),
};

const studentGetOrder = {
  params: Joi.object().keys({
    isbn: Joi.string().required().label("ISBN is required."),
  }),
};

const studentAddFavorite = {
  body: Joi.object().keys({
    isbn: Joi.string().required().label("ISBN is required."),
  }),
};

const studentRemoveFavorite = {
  params: Joi.object().keys({
    isbn: Joi.string().required().label("ISBN is required."),
  }),
};

const studentCheckFavorite = {
  params: Joi.object().keys({
    isbn: Joi.string().required().label("ISBN is required."),
  }),
};

const studentSearchBooks = {
  body: Joi.object().keys({
    name: Joi.string().required().label("Name is required."),
    tags: Joi.array(),
    authors: Joi.array(),
    editions: Joi.array(), 
    ratings: Joi.array()
  }),
};

module.exports = {
    studentRegister,
    studentLogin,
    studentLogout,
    studentUpdateProfile,
    studentForgotPassword,
    studentResetPassword,
    studentSendOtp,
    studentVerifyOtp,
    studentGetBook,
    studentOrderBook,
    studentExtendOrder,
    studentCancelOrder,
    studentGetOrder,
    studentAddFavorite,
    studentRemoveFavorite,
    studentCheckFavorite,
    studentSearchBooks
};