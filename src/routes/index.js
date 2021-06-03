const express = require('express');
const adminRoute = require('./admin.route');
const facultyRoute = require('./faculty.route');
const studentRoute = require('./student.route');

const router = express.Router();

router.use('/admin', adminRoute);
router.use('/faculty', facultyRoute);
router.use('/student', studentRoute);

module.exports = router;
