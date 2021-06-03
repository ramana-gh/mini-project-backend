const unirest = require("unirest");
const studentService = require('../services/student.service');

const studentRegister = async (req, res) => {
    if (await studentService.isIdTaken(req.body.studentId))
        res.status(401).send({message: 'Id already taken' });
    else if (await studentService.isEmailTaken(req.body.email))
        res.status(401).send({message: 'Email already taken' });
    else if (await studentService.createStudent(req.body))
        res.status(200).send({message: 'Registration successful!' });
    else   
        res.status(401).send({message: 'Something went wrong! Try Again.'});
};

const studentLogin = async (req, res) => {
    const student = await studentService.getStudent(req.body.studentId);
    if (student) {
        if (await studentService.isPasswordMatch(req.body.password, student.password)) {
            const token = await studentService.generateToken({id: req.body.studentId});
            res.status(200).send({message: 'Login successful!', token, user: student });
        } else {
            res.status(401).send({message: 'Login failed!' });
        }
    } else
        res.status(401).send({message:"You aren't registered!"});
};

const studentLogout = async (req, res) => {
    if (await studentService.generateToken({id: req.body.studentId}))
        res.status(200).send({message: 'Logout successful!' });
    else   
        res.status(401).send({message: 'Something went wrong! Try Again.'});
};

const studentGetProfile = async (req, res) => {
    const student = await studentService.getStudent(await studentService.getCurrentStudentId(req.headers));
    if (student)
        res.status(200).send({user: student});
    else
        res.status(401).send({message: 'Account not found.'});
};

const studentUpdateProfile = async (req, res) => {
    const password = await studentService.getStudent(req.body.studentId).password;
    let studentInfo = {
        studentId: req.body.studentId,
        name: req.body.name,
        joinYear: req.body.joinYear,
        sem: req.body.sem,
        class: req.body.class,
        mobile: req.body.mobile,
        email: req.body.email,
        address: req.body.address,
        password
    }
    if (await studentService.updateStudent(studentInfo))
        res.status(200).send({message: 'Profile updated successfully!' });
    else   
        res.status(401).send({message: 'Something went wrong! Try Again.'});
};

const studentDeleteAccount = async (req, res) => {
    if (await studentService.deleteStudent(await studentService.getCurrentStudentId(req.headers)))
        res.status(200).send({message: 'Removed account!' });
    else
        res.status(401).send({message: 'Account not found.'});
};

const studentForgotPassword = async (req, res) => {
    const student = await studentService.getStudent(req.body.studentId);
    if (student)
        res.status(200).send({mobile: student.mobile });
    else   
        res.status(401).send({message: 'Incorrect Id'});
};

const studentResetPassword = async (req, res) => {
    if (req.body.password != req.body.repeatPassword)
        res.status(401).send({message: "Passwords didn't match! Try Again."});
    else if (await studentService.getStudent(req.body.studentId)) {
        if (await studentService.resetStudentPassword(req.body))
            res.status(200).send({message: 'Password reset successful!' });
        else
            res.status(401).send({message: "Sorry couldn't reset password. Try Again." });
    }
    else   
        res.status(401).send({message: 'Something went wrong! Try Again.'});
};

function generateOTP(otpLength) {
  return  Math.floor(Math.pow(10,(otpLength-1))+Math.random()*9*Math.pow(10,(otpLength-1)));
}

const studentSendOtp = async (req, resp) => {
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
            studentService.saveOtp(mobile, generatedOTP, reqId);
            setTimeout(()=>studentService.removeOtp(mobile),60000);
            resp.status(200).send(resJSON);
        });
    });
};

const studentVerifyOtp = async (req, res) => {
    const otp = await studentService.getOtp(req.body.requestId);
    if (otp.otp == req.body.otp) {
        await studentService.removeOtp(otp.mobile);
        res.status(200).send({message: "Verification successful!"});
    } else
        res.status(401).send({message: "Sorry verification failed. Try Again."});
};

const studentGetFilters = async (req, res) => {
    const filters = await studentService.getFilters();
    res.status(200).send(filters);
}

const studentGetBook = async (req, res) => {
    const book = await studentService.getBook(req.params.isbn);
    if (book) {
        const addedBy = await studentService.getCurrentStudentId(req.headers);
        await studentService.setHistory(req.params.isbn, addedBy);
        res.status(200).send({book});
    }
    else
        res.status(401).send({message: 'Book not found.'});
};

const studentGetRecommendedBooks = async (req, res) => {
    const addedBy = await studentService.getCurrentStudentId(req.headers);
    const recommendations = await studentService.getRecommendedBooks(addedBy);
    if (recommendations)
        res.status(200).send({books: recommendations});
    else
        res.status(401).send({message: 'No recommendations.'});
};

const studentOrderBook = async (req, res) => {
    let orderInfo = {
        isbn: req.body.isbn,
        days: req.body.days,
        orderedBy: await studentService.getCurrentStudentId(req.headers)
    }
    const order = await studentService.getOrder(orderInfo);
    
    if (order != null && order.returned == false && order.canceled == false )
        res.status(401).send({message: 'Already ordered.'});
    else if (await studentService.copiesAvailable(req.body.isbn) <= 0)
        res.status(401).send({message: 'Book out of stock.'});
    else if (await studentService.orderBook(orderInfo)) {
        const book = await studentService.getBook(orderInfo.isbn);
        const copiesAvailable = book.copiesAvailable - 1;
        await studentService.updateBookCount(book.isbn, copiesAvailable);
        res.status(200).send({message: 'Order placed!' });
    } else   
        res.status(401).send({message: 'Something went wrong! Try Again.'});
};

const studentExtendOrder = async (req, res) => {
    const orderedBy = await studentService.getCurrentStudentId(req.headers);
    let orderInfo = {
        isbn: req.body.isbn,
        orderedBy
    }
    let order = await studentService.getOrder(orderInfo);
    let extendInfo = {
        isbn: order.isbn,
        days: order.days,
        returnDate: order.returnDate,
        orderedBy,
        acceptedBy: order.acceptedBy,
        extendReason: req.body.reason,
        extendDays: req.body.days,
        extendAccepted: false,
        returned: false,
        canceled: false
    }
    if (await studentService.extendOrder(extendInfo))
        res.status(200).send({message: 'Extend request saved!'});
    else   
        res.status(401).send({message: 'Something went wrong! Try Again.'});
};

const studentCancelOrder = async (req, res) => {
    const orderInfo = {
        isbn: req.params.isbn,
        orderedBy: await studentService.getCurrentStudentId(req.headers)
    }
    if (await studentService.cancelOrder(orderInfo))
        res.status(200).send({message: 'Order canceled!'});
    else   
        res.status(401).send({message: 'Something went wrong! Try Again.'});
};

const studentGetOrder = async (req, res) => {
    const orderInfo = {
        isbn: req.params.isbn,
        orderedBy: await studentService.getCurrentStudentId(req.headers)
    }
    const order = await studentService.getOrder(orderInfo);
    if (order) {
        const extended = order.extendDays>0?true:false;
        res.status(200).send({order: {returned: order.returned, canceled: order.canceled, extended}});
    }
    else   
        res.status(200).send({order: {returned: true, canceled: true, extended: false}});
};

const studentAddFavorite = async (req, res) => {
    const favoritedBy = await studentService.getCurrentStudentId(req.headers);
    if (await studentService.addFavorite(req.body.isbn, favoritedBy))
        res.status(200).send({message: 'Favorited!' });
    else   
        res.status(401).send({message: 'Something went wrong! Try Again.'});
};

const studentRemoveFavorite = async (req, res) => {
    const favoritedBy = await studentService.getCurrentStudentId(req.headers);
    if (await studentService.removeFavorite(req.params.isbn, favoritedBy))
        res.status(200).send({message: 'Un favorited!' });
    else   
        res.status(401).send({message: 'Something went wrong! Try Again.'});
};

const studentCheckFavorite = async (req, res) => {
    const favoritedBy = await studentService.getCurrentStudentId(req.headers);
    if (await studentService.checkFavorite(req.params.isbn, favoritedBy))
        res.status(200).send({value: true });
    else   
        res.status(200).send({value: false});
};

const studentGetFavorites = async (req, res) => {
    const favoritedBy = await studentService.getCurrentStudentId(req.headers);
    const favorites = await studentService.getFavorites(favoritedBy);
    if (favorites)
        res.status(200).send({books: favorites});
    else   
        res.status(401).send({message: 'Something went wrong! Try Again.'});
};

const studentSearchBooks = async (req, res) => {
    const books = await studentService.searchBooks(req.body);
    if (books)
        res.status(200).send({books});
    else
        res.status(401).send({message: 'Books not found.'});
};

const studentGetNewOrders = async (req, res) => {
    const orderedBy = await studentService.getCurrentStudentId(req.headers);
    const orders = await studentService.getNewOrders(orderedBy);
    if (orders)
        res.status(200).send({orders: orders});
    else
        res.status(401).send({message: 'Orders not found.'});
};

const studentGetExtendRequestedOrders = async (req, res) => {
    const orderedBy = await studentService.getCurrentStudentId(req.headers);
    const orders = await studentService.getExtendRequestedOrders(orderedBy);
    if (orders)
        res.status(200).send({orders: orders});
    else
        res.status(401).send({message: 'Orders not found.'});
};

const studentGetSubmissionNearingOrders = async (req, res) => {
    const orderedBy = await studentService.getCurrentStudentId(req.headers);
    const orders = await studentService.getSubmissionNearingOrders(orderedBy);
    if (orders)
        res.status(200).send({orders: orders});
    else
        res.status(401).send({message: 'Orders not found.'});
};

const studentGetAcceptedOrders = async (req, res) => {
    const orderedBy = await studentService.getCurrentStudentId(req.headers);
    const orders = await studentService.getAcceptedOrders(orderedBy);
    if (orders)
        res.status(200).send({orders: orders});
    else
        res.status(401).send({message: 'Orders not found.'});
};

const studentGetReturnedOrders = async (req, res) => {
    const orderedBy = await studentService.getCurrentStudentId(req.headers);
    const orders = await studentService.getReturnedOrders(orderedBy);
    if (orders)
        res.status(200).send({orders: orders});
    else
        res.status(401).send({message: 'Orders not found.'});
};

module.exports = {
    studentRegister,
    studentLogin,
    studentLogout,
    studentGetProfile,
    studentUpdateProfile,
    studentDeleteAccount,
    studentForgotPassword,
    studentResetPassword,
    studentSendOtp,
    studentVerifyOtp,
    studentGetFilters,
    studentGetBook,
    studentOrderBook,
    studentExtendOrder,
    studentCancelOrder,
    studentGetOrder,
    studentGetRecommendedBooks,
    studentAddFavorite,
    studentRemoveFavorite,
    studentCheckFavorite,
    studentGetFavorites,
    studentSearchBooks,
    studentGetNewOrders,
    studentGetExtendRequestedOrders,
    studentGetSubmissionNearingOrders,
    studentGetAcceptedOrders,
    studentGetReturnedOrders
}