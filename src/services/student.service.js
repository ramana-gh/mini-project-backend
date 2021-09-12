const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { studentModel, otpModel, bookModel, orderModel, historyModel, favoriteModel, filterModel }  = require('../models');

const getStudent = async (studentId) => {
    return await studentModel.findOne({studentId});
}

const isIdTaken = async (studentId) => {
    return await getStudent(studentId);
};

const isEmailTaken = async (email, excludeUserId) => {
  return await studentModel.findOne({ email, studentId: { $ne: excludeUserId } });
};

const createStudent = async (studentBody) => {
    studentBody.password = await bcrypt.hash(studentBody.password, 8);
    return await studentModel.create(studentBody);
};

const updateStudent = async (studentBody) => {
    return await studentModel.replaceOne({studentId: studentBody.studentId}, studentBody);
};

const deleteStudent = async (studentId) => {
    return await studentModel.deleteOne({studentId});
};

const resetStudentPassword = async (reqBody) => {
    const password = await bcrypt.hash(reqBody.password, 8);
    return await studentModel.updateOne({studentId: reqBody.studentId}, {$set: {password}});
}

const isPasswordMatch = async (password1, password2) => {
    return bcrypt.compare(password1, password2);
};

const generateToken = async (studentIdPayload) => {
    return await jwt.sign(studentIdPayload,'RGUKT_LMS_SECRET',{expiresIn:60*60});
}

const verifyToken = async (req, res, next) => {
    await jwt.verify(req.headers.authorization.split(" ")[1],'RGUKT_LMS_SECRET', async (err, studentIdPayload) => {
        if (err) 
            res.status(401).send({message: "Unauthorized."});
        else {
            const student = await getStudent(studentIdPayload.id);
            if (student && student.role === 'student')
                next();
            else
                res.status(401).send({message: "You don't have access to this API."});
        }
    });
}

const checkToken = async (req, res) => {
    const token = req.headers.authorization.split(" ")[1];
    await jwt.verify(token,'RGUKT_LMS_SECRET', async (err, studentIdPayload) => {
        if (err) 
            res.status(401).send({message: "Unauthorized."});
        else {
            const student = await getStudent(studentIdPayload.id);
            if (student && student.role === 'student')
                res.status(200).send({token, user: student});
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

const updateBookCount = async (isbn, copiesAvailable) => {
    return await bookModel.updateOne({isbn}, {$set: {copiesAvailable}});
};

const getHistory = async (isbn, addedBy) => {
    return await historyModel.findOne({isbn, addedBy});
};

const setHistory = async (isbn, addedBy) => {
    const history = await historyModel.find({isbn, addedBy});
    if (history.length <= 0)
        await historyModel.create({isbn, count: 0, addedBy});
    return await historyModel.updateOne({isbn, addedBy}, {$inc: {count: 1}});
};

const getRecommendedBooks = async (addedBy) => {
    let history = await historyModel.find({addedBy});
    if (history.length <= 0)
        return {
            recommendedBooksByAuthors: [],
            recommendedBooksByTags: [],
            recommendedBooksByPublication: []
        };//await bookModel.find({rating: {$gte: 3}}).limit(15);
    const maxSearchHistory = await historyModel.find({addedBy}).sort({count: -1}).limit(3);
    let book = await bookModel.findOne({isbn: history[0].isbn});
    const maxSearchedAuthors = book.authors;
    const maxSearchedTags = book.tags;
    const maxSearchedPublications = [book.publication];
    for (history of maxSearchHistory) {
        book = await bookModel.findOne({isbn: history.isbn});
        maxSearchedAuthors.concat(book.authors);
        maxSearchedTags.concat(book.tags);
        maxSearchedPublications.concat(book.publication);
    }
    const recommendedBooksByAuthors = await bookModel.find({authors: {$in: maxSearchedAuthors}}).sort({rating: -1}).limit(5);
    const recommendedBooksByTags = await bookModel.find({tags: {$in: maxSearchedTags}}).sort({rating: -1}).limit(5);
    const recommendedBooksByPublication = await bookModel.find({publication: {$in: maxSearchedPublications}}).sort({rating: -1}).limit(5);
    const recommendations = {
        recommendedBooksByAuthors,
        recommendedBooksByTags,
        recommendedBooksByPublication
    }
    return recommendations;
};

const getCurrentStudentId = async (reqHead) => {
    return await jwt.verify(reqHead.authorization.split(" ")[1],'RGUKT_LMS_SECRET', (err, studentIdPayload) => {
        return studentIdPayload.id;
    });
}

const copiesAvailable = async (isbn) => {
    const book = await bookModel.findOne({isbn});
    if (book)
        return book.copiesAvailable;
    else
        return 0;
};

const orderBook = async (orderBody) => {
    return await orderModel.create(orderBody);
};

const cancelOrder = async (orderInfo) => {
    if(await bookModel.updateOne({isbn: orderInfo.isbn}, {$inc: {copiesAvailable: 1}}))
        return await orderModel.updateOne({isbn: orderInfo.isbn, orderedBy: orderInfo.orderedBy, returned: false}, {$set: {canceled: true}});
    else
        return null;
    };

const getOrder = async (orderInfo) => {
    return await orderModel.findOne({isbn: orderInfo.isbn, orderedBy: orderInfo.orderedBy, returned: false});
};

const extendOrder = async (extendBody) => {
    return await orderModel.replaceOne({isbn: extendBody.isbn, orderedBy: extendBody.orderedBy, returned: false}, extendBody);
};

const addFavorite = async (isbn, favoritedBy) => {
    return await favoriteModel.create({isbn, favoritedBy});
};

const removeFavorite = async (isbn, favoritedBy) => {
    return await favoriteModel.deleteOne({isbn, favoritedBy});
};

const checkFavorite = async (isbn, favoritedBy) => {
    return await favoriteModel.findOne({isbn, favoritedBy});
};

const getFavorites = async (favoritedBy) => {
    const favorites = await favoriteModel.find({favoritedBy});
    if (favorites.length <= 0)
        return [];
    else {
        let books = [];
        for (favorite of favorites)
            books = [...books, await getBook(favorite.isbn)];
        return books;
    }
};

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

const getNewOrders = async (orderedBy) => {
    const orders = await orderModel.find({orderedBy, acceptedBy: null, extendDays: 0, returned: false, canceled: false});
    if (orders.length <= 0)
        return [];
    else {
        let books = [];
        for (order of orders) {
            book = await getBook(order.isbn);
            let info = {
                isbn: book.isbn,
                name: book.name,
                edition: book.edition,
                authors: book.authors,
                orderedBy: order.orderedBy,
                days: order.days
            }
            books = [...books, info];
        }
        return books;
    }
};

const getExtendRequestedOrders = async (orderedBy) => {
    const orders = await orderModel.find({orderedBy, extendDays: {$gt: 0}, extendAccepted: false, returned: false, canceled: false});
    if (orders.length <= 0)
        return [];
    else {
        let books = [];
        for (order of orders) {
            book = await getBook(order.isbn);
            let info = {
                isbn: book.isbn,
                name: book.name,
                edition: book.edition,
                authors: book.authors,
                orderedBy: order.orderedBy,
                days: order.extendDays
            }
            books = [...books, info];
        }
        return books;
    }
};

const getSubmissionNearingOrders = async (orderedBy) => {
    const today = new Date();
    const returnDate = new Date();
    returnDate.setDate(today.getDate() + 5);
    const orders = await orderModel.find({orderedBy, acceptedBy: {$ne: null}, returnDate: {$lt: returnDate}, returned: false, canceled: false});
    if (orders.length <= 0)
        return [];
    else {
        let books = [];
        for (order of orders) {
            book = await getBook(order.isbn);
            let info = {
                isbn: book.isbn,
                name: book.name,
                edition: book.edition,
                authors: book.authors,
                orderedBy: order.orderedBy,
                days: order.days
            }
            books = [...books, info];
        }
        return books;
    }
};

const getAcceptedOrders = async (orderedBy) => {
    const orders = await orderModel.find({orderedBy, acceptedBy: {$ne: null}, returned: false, canceled: false});
    if (orders.length <= 0)
        return [];
    else {
        let books = [];
        for (order of orders) {
            book = await getBook(order.isbn);
            let info = {
                isbn: book.isbn,
                name: book.name,
                edition: book.edition,
                authors: book.authors,
                orderedBy: order.orderedBy,
                days: order.days
            }
            books = [...books, info];
        }
        return books;
    }
};

const getReturnedOrders = async (orderedBy) => {
    const orders = await orderModel.find({orderedBy, returned: true});
    if (orders.length <= 0)
    return [];
    let book = await getBook(orders[0].isbn);
    let info = {
        isbn: book.isbn,
        name: book.name,
        edition: book.edition,
        authors: book.authors,
        days: orders[0].days,
    }
    const books = [info];
    for (order of orders) {
        book = await getBook(order.isbn);
        info = {
            isbn: book.isbn,
            name: book.name,
            edition: book.edition,
            authors: book.authors,
            days: order.days
        }
        books.concat(info);
    }
    return books;
};

module.exports = {
    getStudent,
    isIdTaken,
    isEmailTaken,
    createStudent,
    updateStudent,
    deleteStudent,
    resetStudentPassword,
    isPasswordMatch,
    generateToken,
    verifyToken,
    checkToken,
    saveOtp,
    getOtp,
    removeOtp,
    getHistory,
    setHistory,
    getFilters,
    getBook,
    updateBookCount,
    getRecommendedBooks,
    getCurrentStudentId,
    copiesAvailable,
    orderBook,
    cancelOrder,
    getOrder,
    extendOrder,
    addFavorite,
    removeFavorite,
    checkFavorite,
    getFavorites,
    searchBooks,
    getNewOrders,
    getExtendRequestedOrders,
    getSubmissionNearingOrders,
    getAcceptedOrders,
    getReturnedOrders
}