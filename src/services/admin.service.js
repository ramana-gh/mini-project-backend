const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { adminModel, facultyModel, studentModel, otpModel, bookModel, orderModel, filterModel }  = require('../models');

const getAdmin = async (adminId) => {
    return await adminModel.findOne({adminId});
}

const isIdTaken = async (adminId) => {
    return await getAdmin(adminId);
};

const isEmailTaken = async (email, excludeUserId) => {
  return await adminModel.findOne({ email, adminId: { $ne: excludeUserId } });
};

const createAdmin = async (adminBody) => {
    adminBody.password = await bcrypt.hash(adminBody.password, 8);
    return await adminModel.create(adminBody);
};



const updateAdmin = async (adminBody) => {
    return await adminModel.replaceOne({adminId: adminBody.adminId}, adminBody);
};

const deleteAdmin = async (adminId) => {
    return await adminModel.deleteOne({adminId});
};

const resetAdminPassword = async (reqBody) => {
    const password = await bcrypt.hash(reqBody.password, 8);
    return await adminModel.updateOne({adminId: reqBody.adminId}, {$set: {password}});
}

const isPasswordMatch = async (password1, password2) => {
    return bcrypt.compare(password1, password2);
};

const generateToken = async (adminIdPayload) => {
    return await jwt.sign(adminIdPayload,'RGUKT_LMS_SECRET',{expiresIn:60*60});
}

const verifyToken = async (req, res, next) => {
    await jwt.verify(req.headers.authorization.split(" ")[1],'RGUKT_LMS_SECRET', async (err, adminIdPayload) => {
        if (err) 
            res.status(401).send({message: "Unauthorized."});
        else {
            const admin = await getAdmin(adminIdPayload.id);
            if (admin && admin.role === 'admin')
                next();
            else
                res.status(401).send({message: "You don't have access to this API."});
        }
    });
}

const checkToken = async (req, res) => {
    const token = req.headers.authorization.split(" ")[1];
    await jwt.verify(token,'RGUKT_LMS_SECRET', async (err, adminIdPayload) => {
        if (err) 
            res.status(401).send({message: "Unauthorized."});
        else {
            const admin = await getAdmin(adminIdPayload.id);
            if (admin && admin.role === 'admin')
                res.status(200).send({token, user: admin});
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

const isIsbnTaken = async (isbn) => {
    return await bookModel.findOne({ isbn });
};

const addBook = async (bookInfo) => {
    return await bookModel.create(bookInfo);
};

const updateFilters = async (tags, authors, editions) => {
    if (!await filterModel.findOne({_id: 1}))
        await filterModel.create({tags:[],authors:[],editions:[]});
    await filterModel.updateOne({},{$addToSet:{tags:{$each:tags}}});
    await filterModel.updateOne({},{$addToSet:{authors:{$each:authors}}});
    await filterModel.updateOne({},{$addToSet:{editions:{$each:editions}}});
};

const getFilters = async () => {
    return await filterModel.findOne({_id: 1});
}

const getBook = async (isbn) => {
    return await bookModel.findOne({isbn});
};

const updateBook = async (bookInfo) => {
    return await bookModel.updateOne({isbn: bookInfo.isbn}, bookInfo);
};

const updateBookCount = async (isbn, copiesAvailable) => {
    return await bookModel.updateOne({isbn}, {$set: {copiesAvailable}});
};

const deleteBook = async (isbn) => {
    return await bookModel.deleteOne({isbn});
};

const getCurrentAdminId = async (reqHead) => {
    return await jwt.verify(reqHead.authorization.split(" ")[1],'RGUKT_LMS_SECRET', (err, adminIdPayload) => {
        return adminIdPayload.id;
    });
}

const getOrder = async (isbn, orderedBy) => {
    return await orderModel.findOne({isbn, orderedBy, returned: false});
};

const getStudent = async (studentId) => {
    return await studentModel.findOne({studentId});
}

const getFaculty = async (facultyId) => {
    return await facultyModel.findOne({facultyId});
}

const acceptOrder = async (orderBody) => {
    return await orderModel.replaceOne({isbn: orderBody.isbn, orderedBy: orderBody.orderedBy, returned: false}, orderBody);
};

const closeOrder = async (orderBody) => {
    return await orderModel.updateOne({isbn: orderBody.isbn, orderedBy: orderBody.studentId, returned: false}, {$set: {returned: true}});
};

const acceptOrderExtension = async (extendBody) => {
    return await orderModel.replaceOne({isbn: extendBody.isbn, orderedBy: extendBody.orderedBy, returned: false}, extendBody);
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

const getNewOrders = async () => {
    const orders = await orderModel.find({extendDays: 0, returned: false, canceled: false, acceptedBy: null});
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

const getExtendRequestedOrders = async () => {
    const orders = await orderModel.find({extendDays: {$gt: 0}, extendAccepted: false, returned: false, canceled: false});
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

const getSubmissionNearingOrders = async () => {
    const today = new Date();
    const returnDate = new Date();
    returnDate.setDate(today.getDate() + 5);
    const orders = await orderModel.find({acceptedBy: {$ne: null}, returnDate: {$lt: returnDate}, returned: false, canceled: false});
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

const getAcceptedOrders = async () => {
    const orders = await orderModel.find({returned: false, canceled: false});
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

const getReturnedOrders = async () => {
    const orders = await orderModel.find({returned: true});
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

module.exports = {
    getAdmin,
    isIdTaken,
    isEmailTaken,
    createAdmin,
    updateAdmin,
    deleteAdmin,
    saveOtp,
    getOtp,
    removeOtp,
    generateToken,
    isPasswordMatch,
    resetAdminPassword,
    verifyToken,
    checkToken,
    isIsbnTaken,
    addBook,
    updateFilters,
    getFilters,
    getBook,
    updateBook,
    updateBookCount,
    deleteBook,
    getCurrentAdminId,
    getOrder,
    getStudent,
    getFaculty,
    acceptOrder,
    closeOrder,
    acceptOrderExtension,
    searchBooks,
    getNewOrders,
    getExtendRequestedOrders,
    getSubmissionNearingOrders,
    getAcceptedOrders,
    getReturnedOrders
}