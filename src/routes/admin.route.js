const express = require('express');
const adminValidation = require('../validations/admin.validation');
const adminController = require('../controllers/admin.controller');
const adminService = require('../services/admin.service');
const validation = require('express-validation');

const router = express.Router();

router.get('/test', (req, res) => {res.send({"test": "Success!"})});
router.post('/register', validation.validate(adminValidation.adminRegister), adminController.adminRegister);
router.post('/login', validation.validate(adminValidation.adminLogin), adminController.adminLogin);
router.post('/logout', validation.validate(adminValidation.adminLogout), adminController.adminLogout);
router.get('/get-profile', adminService.verifyToken, adminController.adminGetProfile);
router.patch('/update-profile', adminService.verifyToken, validation.validate(adminValidation.adminUpdateProfile), adminController.adminUpdateProfile);
router.delete('/delete-account', adminService.verifyToken, adminController.adminDeleteAccount);
router.post('/forgot-password', validation.validate(adminValidation.adminForgotPassword), adminController.adminForgotPassword);
router.post('/reset-password', validation.validate(adminValidation.adminResetPassword), adminController.adminResetPassword);
router.post('/send-otp', validation.validate(adminValidation.adminSendOtp), adminController.adminSendOtp);
router.post('/verify-otp', validation.validate(adminValidation.adminVerifyOtp), adminController.adminVerifyOtp);
router.post('/add-book', adminService.verifyToken, validation.validate(adminValidation.adminAddBook), adminController.adminAddBook);
router.get('/get-book/:isbn', adminService.verifyToken, validation.validate(adminValidation.adminGetBook), adminController.adminGetBook);
router.patch('/update-book', adminService.verifyToken, validation.validate(adminValidation.adminUpdateBook), adminController.adminUpdateBook);
router.delete('/delete-book/:isbn', adminService.verifyToken, validation.validate(adminValidation.adminDeleteBook), adminController.adminDeleteBook);
router.post('/send-message', adminService.verifyToken, validation.validate(adminValidation.adminSendMessage), adminController.adminSendMessage);
router.post('/accept-order', adminService.verifyToken, validation.validate(adminValidation.adminAcceptOrder), adminController.adminAcceptOrder);
router.post('/book-returned', adminService.verifyToken, validation.validate(adminValidation.adminBookReturned), adminController.adminBookReturned);
router.post('/accept-extend-order', adminService.verifyToken, validation.validate(adminValidation.adminAcceptExtendOrder), adminController.adminAcceptExtendOrder);
router.post('/reject-extend-order', adminService.verifyToken, validation.validate(adminValidation.adminRejectExtendOrder), adminController.adminRejectExtendOrder);
router.get('/verifyToken', adminService.checkToken);
router.get('/get-filters', adminService.verifyToken, adminController.adminGetFilters);
router.post('/search-books', adminService.verifyToken, validation.validate(adminValidation.adminSearchBooks), adminController.adminSearchBooks);
router.get('/get-new-orders', adminService.verifyToken, adminController.adminGetNewOrders);
router.get('/get-extend-requested-orders', adminService.verifyToken, adminController.adminGetExtendRequestedOrders);
router.get('/get-submission-nearing-orders', adminService.verifyToken, adminController.adminGetSubmissionNearingOrders);
router.get('/get-accepted-orders', adminService.verifyToken, adminController.adminGetAcceptedOrders);
router.get('/get-returned-orders', adminService.verifyToken, adminController.adminGetReturnedOrders);

module.exports = router;