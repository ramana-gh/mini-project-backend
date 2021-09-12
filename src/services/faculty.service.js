const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { facultyModel, otpModel, bookModel, ratingModel, filterModel }  = require('../models');

const getFaculty = async (facultyId) => {
    return await facultyModel.findOne({facultyId});
}

const isIdTaken = async (facultyId) => {
    return await getFaculty(facultyId);
};

const isEmailTaken = async (email, excludeUserId) => {
  return await facultyModel.findOne({ email, facultyId: { $ne: excludeUserId } });
};

const createFaculty = async (facultyBody) => {
    facultyBody.password = await bcrypt.hash(facultyBody.password, 8);
    return await facultyModel.create(facultyBody);
};



const updateFaculty = async (facultyBody) => {
    return await facultyModel.replaceOne({facultyId: facultyBody.facultyId}, facultyBody);
};

const deleteFaculty = async (facultyId) => {
    return await facultyModel.deleteOne({facultyId});
};

const resetFacultyPassword = async (reqBody) => {
    const password = await bcrypt.hash(reqBody.password, 8);
    return await facultyModel.updateOne({facultyId: reqBody.facultyId}, {$set: {password}});
}

const isPasswordMatch = async (password1, password2) => {
    return bcrypt.compare(password1, password2);
};

const generateToken = async (facultyIdPayload) => {
    return await jwt.sign(facultyIdPayload,'RGUKT_LMS_SECRET',{expiresIn:60*60});
}

const verifyToken = async (req, res, next) => {
    await jwt.verify(req.headers.authorization.split(" ")[1],'RGUKT_LMS_SECRET', async (err, facultyIdPayload) => {
        if (err) 
            res.status(401).send({message: "Unauthorized."});
        else {
            const faculty = await getFaculty(facultyIdPayload.id);
            if (faculty && faculty.role === 'faculty')
                next();
            else
                res.status(401).send({message: "You don't have access to this API."});
        }
    });
}

const checkToken = async (req, res) => {
    const token = req.headers.authorization.split(" ")[1];
    await jwt.verify(token,'RGUKT_LMS_SECRET', async (err, facultyIdPayload) => {
        if (err) 
            res.status(401).send({message: "Unauthorized."});
        else {
            const faculty = await getFaculty(facultyIdPayload.id);
            if (faculty && faculty.role === 'faculty')
                res.status(200).send({token, user: faculty});
            else
                res.status(401).send({message: "You don't have access to this API."});
        }
    });
}

const saveOtp = async (mobile, otp, requestId) => {
    if (await otpModel.findOne({mobile}))
        removeOtp(mobile);
    const otpBody = { mobile, otp, requestId };
    return await otpModel.create(otpBody);
}

const getOtp = async (requestId) => {
    return await otpModel.findOne({requestId});
}

const removeOtp = async (mobile) => {
    return await otpModel.deleteOne({mobile});
}

const getFilters = async () => {
    return await filterModel.findOne({_id: 1});
}

const getBook = async (isbn) => {
    return await bookModel.findOne({isbn});
};

const updateFilterTags = async (tags) => {
    if (!await filterModel.findOne({_id: 1}))
        await filterModel.create({tags:[],authors:[],editions:[]});
    await filterModel.updateOne({},{$addToSet:{tags:{$each:tags}}});
};

const getCurrentFacultyId = async (reqHead) => {
    return await jwt.verify(reqHead.authorization.split(" ")[1],'RGUKT_LMS_SECRET', (err, facultyIdPayload) => {
        return facultyIdPayload.id;
    });
}

const searchBooks = async (reqBody) => {
    let query = {name: new RegExp(reqBody.name,'i')};
    if (reqBody.tags.length>0)
        query = {...query, tags: {$in: reqBody.tags}}
    if (reqBody.authors.length>0)
        query = {...query, authors: {$in: reqBody.authors}}
    if (reqBody.editions.length>0)
        query = {...query, edition: {$in: reqBody.editions}}
    if (reqBody.ratings.length>0)
        query = {...query, rating: {$in: reqBody.ratings}}

    const books = await bookModel.find(query);

    if (books)
        return books;
    else
        return [];
};

const rateBook = async (ratingBody) => {
    const book = await bookModel.findOne({isbn: ratingBody.isbn});
    let rating = book.rating;
    let ratingSum = book.ratingSum;
    let ratingCount = book.ratingCount;
    const oldRating = await ratingModel.findOne({isbn: ratingBody.isbn, addedBy: ratingBody.addedBy});
    if (oldRating && ratingBody.rating == 0) {
        await ratingModel.deleteOne({isbn: ratingBody.isbn, addedBy: ratingBody.addedBy});
        if (ratingCount>0) ratingCount--;
        if (ratingSum>0) ratingSum -= oldRating.rating;
        if (ratingCount>0) rating = ratingSum / ratingCount;
        return await bookModel.updateOne({isbn: ratingBody.isbn}, {$set: {rating, ratingSum, ratingCount}});
    } else if (oldRating) {
        if (ratingSum>0) ratingSum -= oldRating.rating;
        ratingSum += ratingBody.rating;
        if (ratingCount>0) rating = ratingSum / ratingCount;
        return await bookModel.updateOne({isbn: ratingBody.isbn}, {$set: {rating, ratingSum, ratingCount}});
    } else if (await ratingModel.create(ratingBody)) {
        ratingCount++;
        ratingSum += ratingBody.rating;
        if (ratingCount>0) rating = ratingSum / ratingCount;
        return await bookModel.updateOne({isbn: ratingBody.isbn}, {$set: {rating, ratingSum, ratingCount}});
    } else
        return null;
};

const tagBook = async (reqBody) => {
    // return await bookModel.updateOne({isbn: reqBody.isbn}, {$addToSet:{tags:{$each:reqBody.tags}}});
    return await bookModel.updateOne({isbn: reqBody.isbn}, {$set: {tags: reqBody.tags}});
};

const getRating = async (isbn, addedBy) => {
    const ratingBody = await ratingModel.findOne({isbn, addedBy});
    if (ratingBody == null)
        return 0;
    else
        return ratingBody.rating;
};

module.exports = {
    getFaculty,
    isIdTaken,
    isEmailTaken,
    createFaculty,
    updateFaculty,
    deleteFaculty,
    resetFacultyPassword,
    isPasswordMatch,
    generateToken,
    verifyToken,
    checkToken,
    saveOtp,
    getOtp,
    removeOtp,
    getFilters,
    getBook,
    updateFilterTags,
    getCurrentFacultyId,
    searchBooks,
    rateBook,
    tagBook,
    getRating
}