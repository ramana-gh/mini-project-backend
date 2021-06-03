const express = require('express');
const studentValidation = require('../validations/student.validation');
const studentController = require('../controllers/student.controller');
const studentService = require('../services/student.service');
const validation = require('express-validation');

const router = express.Router();

router.post('/register', validation.validate(studentValidation.studentRegister), studentController.studentRegister);
router.post('/login', validation.validate(studentValidation.studentLogin), studentController.studentLogin);
router.post('/logout', validation.validate(studentValidation.studentLogout), studentController.studentLogout);
router.get('/get-profile', studentService.verifyToken, studentController.studentGetProfile);
router.patch('/update-profile', studentService.verifyToken, validation.validate(studentValidation.studentUpdateProfile), studentController.studentUpdateProfile);
router.delete('/delete-account', studentService.verifyToken, studentController.studentDeleteAccount);
router.post('/forgot-password', validation.validate(studentValidation.studentForgotPassword), studentController.studentForgotPassword);
router.post('/reset-password', validation.validate(studentValidation.studentResetPassword), studentController.studentResetPassword);
router.post('/send-otp', validation.validate(studentValidation.studentSendOtp), studentController.studentSendOtp);
router.post('/verify-otp', validation.validate(studentValidation.studentVerifyOtp), studentController.studentVerifyOtp);
router.get('/get-book/:isbn', studentService.verifyToken, validation.validate(studentValidation.studentGetBook), studentController.studentGetBook);
router.post('/order-book', studentService.verifyToken, validation.validate(studentValidation.studentOrderBook), studentController.studentOrderBook);
router.patch('/extend-order', studentService.verifyToken, validation.validate(studentValidation.studentExtendOrder), studentController.studentExtendOrder);
router.delete('/cancel-order/:isbn', studentService.verifyToken, validation.validate(studentValidation.studentCancelOrder), studentController.studentCancelOrder);
router.get('/get-order/:isbn', studentService.verifyToken, validation.validate(studentValidation.studentGetOrder), studentController.studentGetOrder);
router.get('/get-recommended-books', studentService.verifyToken, studentController.studentGetRecommendedBooks);
router.post('/add-favorite', studentService.verifyToken, validation.validate(studentValidation.studentAddFavorite), studentController.studentAddFavorite);
router.delete('/remove-favorite/:isbn', studentService.verifyToken, validation.validate(studentValidation.studentRemoveFavorite), studentController.studentRemoveFavorite);
router.get('/check-favorite/:isbn', studentService.verifyToken, validation.validate(studentValidation.studentCheckFavorite), studentController.studentCheckFavorite);
router.get('/get-favorites', studentService.verifyToken, studentController.studentGetFavorites);
router.get('/verifyToken', studentService.checkToken);
router.get('/get-filters', studentService.verifyToken, studentController.studentGetFilters);
router.post('/search-books', studentService.verifyToken, validation.validate(studentValidation.studentSearchBooks), studentController.studentSearchBooks);
router.get('/get-new-orders', studentService.verifyToken, studentController.studentGetNewOrders);
router.get('/get-extend-requested-orders', studentService.verifyToken, studentController.studentGetExtendRequestedOrders);
router.get('/get-submission-nearing-orders', studentService.verifyToken, studentController.studentGetSubmissionNearingOrders);
router.get('/get-accepted-orders', studentService.verifyToken, studentController.studentGetAcceptedOrders);
router.get('/get-returned-orders', studentService.verifyToken, studentController.studentGetReturnedOrders);

module.exports = router;