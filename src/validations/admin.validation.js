const Joi = require('joi');

const adminRegister = {
    body: Joi.object().keys({
      adminId: Joi.string().regex(/^[B]\d{6}$/).required().label("ID must start with B followed by 6 digits"),
      name: Joi.string().required().label("Name is required."),
      mobile: Joi.string().required().min(10).max(10).regex(/^[6-9]\d{9}$/).label("Phone number must have 10 digits."),
      email: Joi.string().required().email().label("Invalid email."),
      address: Joi.string().required().label("Address is required."),
      password: Joi.string().required().min(8).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[~!@#$%^&*])/).label("Password must have atleast 8 characters including uppercase letters, lower case letters, numbers and special characters.")
    }),
};

const adminLogin = {
  body: Joi.object().keys({
    adminId: Joi.string().regex(/^[B]\d{6}$/).required().label("Invalid ID."),
    password: Joi.string().required().min(8).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[~!@#$%^&*])/).label("Invalid password.")
  }),
};

const adminLogout = {
  body: Joi.object().keys({
    adminId: Joi.string().regex(/^[B]\d{6}$/).required().label("Invalid ID")
  }),
};

const adminUpdateProfile = {
  body: Joi.object().keys({
    adminId: Joi.string().regex(/^[B]\d{6}$/).required().label("ID must start with B followed by 6 digits"),
    name: Joi.string().required().label("Name is required."),
    mobile: Joi.string().required().min(10).max(10).regex(/^[6-9]\d{9}$/).label("Phone number must have 10 digits."),
    email: Joi.string().required().email().label("Invalid email."),
    address: Joi.string().required().label("Address is required.")
  }),
};

const adminForgotPassword = {
  body: Joi.object().keys({
    adminId: Joi.string().regex(/^[B]\d{6}$/).required().label("Invalid ID")
  }),
};

const adminResetPassword = {
  body: Joi.object().keys({
    adminId: Joi.string().regex(/^[B]\d{6}$/).required().label("Invalid ID"),
    password: Joi.string().required().min(8).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[~!@#$%^&*])/).label("Password must have atleast 8 characters including uppercase letters, lower case letters, numbers and special characters."),
    repeatPassword: Joi.string().required().min(8).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[~!@#$%^&*])/).label("Passwords didn't match.")
  }),
};

const adminSendOtp = {
  body: Joi.object().keys({
    mobile: Joi.string().min(10).regex(/^[6-9]\d{9}$/).required().label("Invalid mobile number.")
  }),
};

const adminVerifyOtp = {
  body: Joi.object().keys({
    otp: Joi.string().min(5).max(5).regex(/^[0-9]\d{4}$/).required().label("Invalid OTP."),
    requestId: Joi.string().required().label("Invalid request ID")
  }),
};

const adminAddBook = {
  body: Joi.object().keys({
    name: Joi.string().required().label("Name is required."),
    authors: Joi.array().required().label("Author is required."),
    edition: Joi.number().required().label("Edition must be number."),
    isbn: Joi.string().required().label("ISBN is required."),
    totalCopies: Joi.number().required().label("Total copies must be number."),
    publisher: Joi.string().required().label("Publisher is required."),
    tags: Joi.array().optional(),
  }),
};

const adminGetBook = {
  params: Joi.object().keys({
    isbn: Joi.string().required().label("ISBN is required."),
  }),
};

const adminUpdateBook = {
  body: Joi.object().keys({
    name: Joi.string().required().label("Name is required."),
    authors: Joi.array().required().label("Author is required."),
    edition: Joi.number().required().label("Edition must be number."),
    isbn: Joi.string().required().label("ISBN is required."),
    totalCopies: Joi.number().required().label("Total copies must be number."),
    publisher: Joi.string().required().label("Publisher is required."),
    tags: Joi.array().optional(),
  }),
};

const adminDeleteBook = {
  params: Joi.object().keys({
    isbn: Joi.string().required().label("ISBN is required."),
  }),
};

const adminSendMessage = {
  body: Joi.object().keys({
    studentId: Joi.string().required().label("Invalid ID"),
    message: Joi.string().required().label("Message can't be empty.")
  }),
};

const adminAcceptOrder = {
  body: Joi.object().keys({
    isbn: Joi.string().required().label("ISBN is required."),
    studentId: Joi.string().required().label("Invalid ID")
  }),
};

const adminBookReturned = {
  body: Joi.object().keys({
    isbn: Joi.string().required().label("ISBN is required."),
    studentId: Joi.string().required().label("Invalid ID")
  }),
};

const adminAcceptExtendOrder = {
  body: Joi.object().keys({
    isbn: Joi.string().required().label("ISBN is required."),
    studentId: Joi.string().required().label("Invalid ID")
  }),
}

const adminRejectExtendOrder = {
  body: Joi.object().keys({
    isbn: Joi.string().required().label("ISBN is required."),
    studentId: Joi.string().required().label("Invalid ID")
  }),
}

const adminSearchBooks = {
  body: Joi.object().keys({
    name: Joi.string().required().label("Name is required."),
    tags: Joi.array(),
    authors: Joi.array(),
    editions: Joi.array(), 
    ratings: Joi.array()
  }),
};

module.exports = {
    adminRegister,
    adminLogin,
    adminLogout,
    adminUpdateProfile,
    adminForgotPassword,
    adminResetPassword,
    adminSendOtp,
    adminVerifyOtp,
    adminAddBook,
    adminGetBook,
    adminUpdateBook,
    adminDeleteBook,
    adminSendMessage,
    adminAcceptOrder,
    adminBookReturned,
    adminAcceptExtendOrder,
    adminRejectExtendOrder,
    adminSearchBooks
};
