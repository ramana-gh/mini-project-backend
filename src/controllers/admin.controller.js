const unirest = require("unirest");
const adminService = require('../services/admin.service');
require('dotenv').config();

const adminRegister = async (req, res) => {
    if (await adminService.isIdTaken(req.body.adminId))
        res.status(401).send({message: 'Id already taken' });
    else if (await adminService.isEmailTaken(req.body.email))
        res.status(401).send({message: 'Email already taken' });
    else if (await adminService.createAdmin(req.body))
        res.status(200).send({message: 'Registration successful!' });
    else   
        res.status(401).send({message: 'Something went wrong! Try Again.'});
};

const adminLogin = async (req, res) => {
    const admin = await adminService.getAdmin(req.body.adminId);
    if (admin) {
        if (await adminService.isPasswordMatch(req.body.password, admin.password)) {
            const token = await adminService.generateToken({id: req.body.adminId});
            res.status(200).send({message: 'Login successful!', token, user: admin });
        } else {
            res.status(401).send({message: 'Login failed!' });
        }
    } else
        res.status(401).send({message:"You aren't registered!"});
};

const adminForgotPassword = async (req, res) => {
    const admin = await adminService.getAdmin(req.body.adminId);
    if (admin)
        res.status(200).send({mobile: admin.mobile });
    else   
        res.status(401).send({message: 'Incorrect Id'});
};

function generateOTP(otpLength) {
    return  Math.floor(Math.pow(10,(otpLength-1))+Math.random()*9*Math.pow(10,(otpLength-1)));
}
  
const adminSendOtp = async (req, resp) => {
    let generatedOTP, reqId, resJSON;
    const mobile = req.body.mobile;
    const API_KEY = "5KZn3hL4GtMDjHwUmSuWbyAdOE1JNzY7vVgFaI8qixPRC0Tl96zY9oX6aIgqBW3OSLbR8MDQTUuvtAJi";
    req = unirest("GET", "https://www.fast2sms.com/dev/quick-templates?authorization="+API_KEY);
    req.headers({
        "cache-control": "no-cache"
    });
    req.end(function (res) {
        if (res.error) throw new Error(res.error);
        generatedOTP = generateOTP(5);
        req = unirest("POST", "https://www.fast2sms.com/dev/bulk");
        req.headers({
            "content-type": "application/x-www-form-urlencoded",
            "cache-control": "no-cache",
            "authorization": API_KEY
        });
        req.form({
            "sender_id": "FSTSMS",
            "language": "english",
            "route": "qt",
            "numbers": mobile,
            "message": res.body.data[0].template_id,
            "variables": "{#AA#}",
            "variables_values": generatedOTP
        });
        req.end(function (res) {
            if (res.error) throw new Error(res.error);
            resJSON = JSON.parse(res.body);
            reqId = resJSON.request_id;
            adminService.saveOtp(mobile, generatedOTP, reqId);
            setTimeout(()=>adminService.removeOtp(mobile),60000);
            resp.status(200).send(resJSON);
        });
    });
};
  
const adminVerifyOtp = async (req, res) => {
    const otp = await adminService.getOtp(req.body.requestId);
    if (otp.otp == req.body.otp) {
        await adminService.removeOtp(otp.mobile);
        res.status(200).send({message: "Verification successful!"});
    } else
        res.status(401).send({message: "Sorry verification failed. Try Again."});
};

const adminResetPassword = async (req, res) => {
    if (req.body.password != req.body.repeatPassword)
        res.status(401).send({message: "Passwords didn't match! Try Again."});
    else if (await adminService.getAdmin(req.body.adminId)) {
        if (await adminService.resetAdminPassword(req.body))
            res.status(200).send({message: 'Password reset successful!' });
        else
            res.status(401).send({message: "Sorry couldn't reset password. Try Again." });
    }
    else   
        res.status(401).send({message: 'Something went wrong! Try Again.'});
};

const adminLogout = async (req, res) => {
    if (await adminService.generateToken({id: req.body.adminId}))
        res.status(200).send({message: 'Logout successful!' });
    else   
        res.status(401).send({message: 'Something went wrong! Try Again.'});
};

const adminGetProfile = async (req, res) => {
    const admin = await adminService.getAdmin(await adminService.getCurrentAdminId(req.headers));
    if (admin)
        res.status(200).send({user: admin});
    else
        res.status(401).send({message: 'Account not found.'});
};

const adminUpdateProfile = async (req, res) => {
    const admin = await adminService.getAdmin(await adminService.getCurrentAdminId(req.headers));
    let adminInfo = {
        adminId: req.body.adminId,
        name: req.body.name,
        mobile: req.body.mobile,
        email: req.body.email,
        address: req.body.address,
        password: admin.password
    }
    if (await adminService.updateAdmin(adminInfo))
        res.status(200).send({message: 'Profile updated successfully!' });
    else   
        res.status(401).send({message: 'Something went wrong! Try Again.'});
};

const adminDeleteAccount = async (req, res) => {
    if (await adminService.deleteAdmin(await adminService.getCurrentAdminId(req.headers)))
        res.status(200).send({message: 'Removed account!' });
    else
        res.status(401).send({message: 'Account not found.'});
};

const adminAddBook = async (req, res) => {
    if (await adminService.isIsbnTaken(req.body.isbn))
        res.status(401).send({message: 'Duplicate entry' });
    else {
        let bookInfo = {
            name: req.body.name,
            authors: req.body.authors,
            edition: req.body.edition,
            isbn: req.body.isbn,
            totalCopies: req.body.totalCopies,
            copiesAvailable: req.body.totalCopies,
            publisher: req.body.publisher,
            tags: req.body.tags,
            addedBy: await adminService.getCurrentAdminId(req.headers)
        }
        await adminService.updateFilters(req.body.tags, req.body.authors, [req.body.edition]);
        if (await adminService.addBook(bookInfo))
            res.status(200).send({message: 'Book added successfully!' });
        else   
            res.status(401).send({message: 'Something went wrong! Try Again.'});
    }
};

const adminGetFilters = async (req, res) => {
    const filters = await adminService.getFilters();
    res.status(200).send(filters);
}

const adminGetBook = async (req, res) => {
    const book = await adminService.getBook(req.params.isbn);
    if (book)
        res.status(200).send({book});
    else
        res.status(401).send({message: 'Book not found.'});
};

const adminUpdateBook = async (req, res) => {
    const book = await adminService.getBook(req.body.isbn);
    const newCopies = req.body.totalCopies - book.totalCopies;
    const copiesAvailable = book.copiesAvailable + newCopies;
    let bookInfo = {
        name: req.body.name,
        authors: req.body.authors,
        edition: req.body.edition,
        isbn: req.body.isbn,
        totalCopies: req.body.totalCopies,
        copiesAvailable,
        publisher: req.body.publisher,
        tags: req.body.tags,
        rating: book.rating,
        ratingSum: book.ratingSum,
        ratingCount: book.ratingCount,
        addedBy: book.addedBy,
        updatedBy: await adminService.getCurrentAdminId(req.headers)
    }
    await adminService.updateFilters(req.body.tags, req.body.authors, [req.body.edition]);
    if (await adminService.updateBook(bookInfo))
        res.status(200).send({message: 'Book updated successfully!' });
    else   
        res.status(401).send({message: 'Something went wrong! Try Again.'});
};

const adminDeleteBook = async (req, res) => {
    if (await adminService.deleteBook(req.params.isbn))
        res.status(200).send({message: 'Book deleted successfully!' });
    else
        res.status(401).send({message: 'Book not found.'});
};

const adminSendMessage = async (req, resp) => {
    const student = await adminService.getStudent(req.body.studentId);
    const mobile = student.mobile;
    const message = req.body.message;
    const API_KEY = process.env.API_KEY;
    req = unirest("GET", "https://www.fast2sms.com/dev/quick-templates?authorization="+API_KEY);
    req.headers({
        "cache-control": "no-cache"
    });
    req.end(function (res) {
        if (res.error) throw new Error(res.error);
        req = unirest("POST", "https://www.fast2sms.com/dev/bulkV2");
        req.headers({
            "content-type": "application/x-www-form-urlencoded",
            "cache-control": "no-cache",
            "authorization": API_KEY
        });
        req.form({
            "route": "v3",
            "sender_id": "TXTIND",
            "message": message,            
            "language": "english",
            "numbers": mobile,
            "flash": "0"
        });
        req.end(function (res) {
            if (res.error) throw new Error(res.error);
            console.log(res.body);
            resp.status(200).send(res.body);
        });
    });
};

const adminAcceptOrder = async (req, res) => {
    const order = await adminService.getOrder(req.body.isbn, req.body.studentId);
    if (order != null && order.acceptedBy)
        res.status(401).send({message: 'Already accepted.'});
    else {
        const today = new Date();
        const returnDate = new Date();
        returnDate.setDate(today.getDate() + order.days);
        let orderInfo = {
            isbn: order.isbn,
            days: order.days,
            returnDate,
            orderedBy: order.orderedBy,
            acceptedBy: await adminService.getCurrentAdminId(req.headers)
        }
        if (await adminService.acceptOrder(orderInfo))
            res.status(200).send({message: 'Order accepted.'});
        else   
            res.status(401).send({message: 'Something went wrong! Try Again.'});
    }
};

const adminBookReturned = async (req, res) => {
    if (await adminService.closeOrder(req.body)) {
        const book = await adminService.getBook(req.body.isbn);
        const copiesAvailable = book.copiesAvailable + 1;
        await adminService.updateBookCount(book.isbn, copiesAvailable);
        res.status(200).send({message: 'Order closed successfully!' });
    } else   
        res.status(401).send({message: 'Something went wrong! Try Again.'});
};

const adminAcceptExtendOrder = async (req, res) => {
    const order = await adminService.getOrder(req.body.isbn, req.body.studentId);
    const newReturnDate = order.returnDate;
    newReturnDate.setDate(order.returnDate.getDate() + order.extendDays);
    let extendInfo = {
        isbn: order.isbn,
        days: order.days,
        returnDate: newReturnDate,
        orderedBy: order.orderedBy,
        acceptedBy: order.acceptedBy,
        extendReason: order.reason,
        extendDays: order.extendDays,
        extendAccepted: true,
        returned: false
    }
    if (await adminService.acceptOrderExtension(extendInfo))
        res.status(200).send({message: 'Date extended.'});
    else   
        res.status(401).send({message: 'Something went wrong! Try Again.'});
};

const adminRejectExtendOrder = async (req, res) => {
    if (await adminService.getOrder(req.body.isbn, req.body.studentId))
        res.status(200).send({message: 'Extension rejected.'});
    else   
        res.status(401).send({message: 'Something went wrong! Try Again.'});
};

const adminSearchBooks = async (req, res) => {
    const books = await adminService.searchBooks(req.body);
    if (books)
        res.status(200).send({books});
    else
        res.status(401).send({message: 'Books not found.'});
};

const adminGetNewOrders = async (req, res) => {
    const orders = await adminService.getNewOrders();
    if (orders)
        res.status(200).send({orders: orders});
    else
        res.status(401).send({message: 'Orders not found.'});
};

const adminGetExtendRequestedOrders = async (req, res) => {
    const orders = await adminService.getExtendRequestedOrders();
    if (orders)
        res.status(200).send({orders: orders});
    else
        res.status(401).send({message: 'Orders not found.'});
};

const adminGetSubmissionNearingOrders = async (req, res) => {
    const orders = await adminService.getSubmissionNearingOrders();
    if (orders)
        res.status(200).send({orders: orders});
    else
        res.status(401).send({message: 'Orders not found.'});
};

const adminGetAcceptedOrders = async (req, res) => {
    const orders = await adminService.getAcceptedOrders();
    if (orders)
        res.status(200).send({orders: orders});
    else
        res.status(401).send({message: 'Orders not found.'});
};

const adminGetReturnedOrders = async (req, res) => {
    const orders = await adminService.getReturnedOrders();
    if (orders)
        res.status(200).send({orders: orders});
    else
        res.status(401).send({message: 'Orders not found.'});
};

module.exports = {
    adminRegister,
    adminLogin,
    adminForgotPassword,
    adminSendOtp,
    adminVerifyOtp,
    adminResetPassword,
    adminLogout,
    adminGetProfile,
    adminUpdateProfile,
    adminDeleteAccount,
    adminGetFilters,
    adminAddBook,
    adminGetBook,
    adminUpdateBook,
    adminDeleteBook,
    adminSendMessage,
    adminAcceptOrder,
    adminBookReturned,
    adminAcceptExtendOrder,
    adminRejectExtendOrder,
    adminSearchBooks,
    adminGetNewOrders,
    adminGetExtendRequestedOrders,
    adminGetSubmissionNearingOrders,
    adminGetAcceptedOrders,
    adminGetReturnedOrders
}