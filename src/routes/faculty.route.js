const express = require('express');
const facultyValidation = require('../validations/faculty.validation');
const facultyController = require('../controllers/faculty.controller');
const facultyService = require('../services/faculty.service');
const validation = require('express-validation');

const router = express.Router();

router.post('/register', validation.validate(facultyValidation.facultyRegister), facultyController.facultyRegister);
router.post('/login', validation.validate(facultyValidation.facultyLogin), facultyController.facultyLogin);
router.post('/logout', validation.validate(facultyValidation.facultyLogout), facultyController.facultyLogout);
router.get('/get-profile', facultyService.verifyToken, facultyController.facultyGetProfile);
router.patch('/update-profile', facultyService.verifyToken, validation.validate(facultyValidation.facultyUpdateProfile), facultyController.facultyUpdateProfile);
router.delete('/delete-account', facultyService.verifyToken, facultyController.facultyDeleteAccount);
router.post('/forgot-password', validation.validate(facultyValidation.facultyForgotPassword), facultyController.facultyForgotPassword);
router.post('/reset-password', validation.validate(facultyValidation.facultyResetPassword), facultyController.facultyResetPassword);
router.post('/send-otp', validation.validate(facultyValidation.facultySendOtp), facultyController.facultySendOtp);
router.post('/verify-otp', validation.validate(facultyValidation.facultyVerifyOtp), facultyController.facultyVerifyOtp);
router.get('/get-book/:isbn', facultyService.verifyToken, validation.validate(facultyValidation.facultyGetBook), facultyController.facultyGetBook);
router.get('/verifyToken', facultyService.checkToken);
router.get('/get-filters', facultyService.verifyToken, facultyController.facultyGetFilters);
router.post('/search-books', facultyService.verifyToken, validation.validate(facultyValidation.facultySearchBooks), facultyController.facultySearchBooks);
router.post('/rate-book', facultyService.verifyToken, validation.validate(facultyValidation.facultyRateBook), facultyController.facultyRateBook);
router.post('/tag-book', facultyService.verifyToken, validation.validate(facultyValidation.facultyTagBook), facultyController.facultyTagBook);
router.get('/get-rating/:isbn/:addedBy', facultyService.verifyToken, validation.validate(facultyValidation.facultyGetRating), facultyController.facultyGetRating);

module.exports = router;