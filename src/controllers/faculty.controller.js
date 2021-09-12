const unirest = require("unirest");
const facultyService = require('../services/faculty.service');

const facultyRegister = async (req, res) => {
    if (await facultyService.isIdTaken(req.body.facultyId))
        res.status(401).send({message: 'Id already taken' });
    else if (await facultyService.isEmailTaken(req.body.email))
        res.status(401).send({message: 'Email already taken' });
    else if (await facultyService.createFaculty(req.body))
        res.status(200).send({message: 'Registration successful!' });
    else   
        res.status(401).send({message: 'Something went wrong! Try Again.'});
};

const facultyLogin = async (req, res) => {
    const faculty = await facultyService.getFaculty(req.body.facultyId);
    if (faculty) {
        if (await facultyService.isPasswordMatch(req.body.password, faculty.password)) {
            const token = await facultyService.generateToken({id: req.body.facultyId});
            res.status(200).send({message: 'Login successful!', token, user: faculty });
        } else {
            res.status(401).send({message: 'Login failed!' });
        }
    } else
        res.status(401).send({message:"You aren't registered!"});
};

const facultyLogout = async (req, res) => {
    if (await facultyService.generateToken({id: req.body.facultyId}))
        res.status(200).send({message: 'Logout successful!' });
    else   
        res.status(401).send({message: 'Something went wrong! Try Again.'});
};

const facultyGetProfile = async (req, res) => {
    const faculty = await facultyService.getFaculty(await facultyService.getCurrentFacultyId(req.headers));
    if (faculty)
        res.status(200).send({user: faculty});
    else
        res.status(401).send({message: 'Account not found.'});
};

const facultyUpdateProfile = async (req, res) => {
    const password = await facultyService.getFaculty(req.body.facultyId).password;
    let facultyInfo = {
        studentId: req.body.facultyId,
        name: req.body.name,
        joinYear: req.body.joinYear,
        sem: req.body.sem,
        class: req.body.class,
        mobile: req.body.mobile,
        email: req.body.email,
        address: req.body.address,
        password
    }
    if (await facultyService.updateFaculty(facultyInfo))
        res.status(200).send({message: 'Profile updated successfully!' });
    else   
        res.status(401).send({message: 'Something went wrong! Try Again.'});
};

const facultyDeleteAccount = async (req, res) => {
    if (await facultyService.deleteFaculty(await facultyService.getCurrentFacultyId(req.headers)))
        res.status(200).send({message: 'Removed account!' });
    else
        res.status(401).send({message: 'Account not found.'});
};

const facultyForgotPassword = async (req, res) => {
    const faculty = await facultyService.getFaculty(req.body.facultyId);
    if (faculty)
        res.status(200).send({mobile: faculty.mobile });
    else   
        res.status(401).send({message: 'Incorrect Id'});
};

const facultyResetPassword = async (req, res) => {
    if (req.body.password != req.body.repeatPassword)
        res.status(401).send({message: "Passwords didn't match! Try Again."});
    else if (await facultyService.getFaculty(req.body.facultyId)) {
        if (await facultyService.resetFacultyPassword(req.body))
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

const facultySendOtp = async (req, resp) => {
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
            facultyService.saveOtp(mobile, generatedOTP, reqId);
            setTimeout(()=>facultyService.removeOtp(mobile),60000);
            resp.status(200).send(resJSON);
        });
    });
};

const facultyVerifyOtp = async (req, res) => {
    const otp = await facultyService.getOtp(req.body.requestId);
    if (otp.otp == req.body.otp) {
        await facultyService.removeOtp(otp.mobile);
        res.status(200).send({message: "Verification successful!"});
    } else
        res.status(401).send({message: "Sorry verification failed. Try Again."});
};

const facultyGetFilters = async (req, res) => {
    const filters = await facultyService.getFilters();
    res.status(200).send(filters);
}

const facultyGetBook = async (req, res) => {
    const book = await facultyService.getBook(req.params.isbn);
    if (book)
        res.status(200).send({book});
    else
        res.status(401).send({message: 'Book not found.'});
};

const facultySearchBooks = async (req, res) => {
    const books = await facultyService.searchBooks(req.body);
    if (books)
        res.status(200).send({books});
    else
        res.status(401).send({message: 'Books not found.'});
};

const facultyRateBook = async (req, res) => {
    let ratingInfo = {
        isbn: req.body.isbn,
        rating: req.body.rating,
        addedBy: await facultyService.getCurrentFacultyId(req.headers)
    }
    if (await facultyService.rateBook(ratingInfo))
        res.status(200).send({message: 'Rating updated successfully!' });
    else   
        res.status(401).send({message: 'Something went wrong! Try Again.'});
};

const facultyTagBook = async (req, res) => {
    await facultyService.updateFilterTags(req.body.tags);
    if (await facultyService.tagBook(req.body))
        res.status(200).send({message: 'Tags updated successfully!' });
    else   
        res.status(401).send({message: 'Something went wrong! Try Again.'});
};

const facultyGetRating = async (req, res) => {
    const rating = await facultyService.getRating(req.params.isbn, req.params.addedBy);
    if (rating == 0 || rating > 0)
        res.status(200).send({rating});
    else   
        res.status(401).send({message: 'Something went wrong! Try Again.'});
}

module.exports = {
    facultyRegister,
    facultyLogin,
    facultyLogout,
    facultyGetProfile,
    facultyUpdateProfile,
    facultyDeleteAccount,
    facultyForgotPassword,
    facultyResetPassword,
    facultySendOtp,
    facultyVerifyOtp,
    facultyGetFilters,
    facultyGetBook,
    facultySearchBooks,
    facultyRateBook,
    facultyTagBook,
    facultyGetRating
}