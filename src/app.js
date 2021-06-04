const express = require('express');
const mongoose = require('mongoose');
const routes = require('./routes');
const validation = require('express-validation');
require('dotenv').config();
const PORT = process.env.PORT || '3001';

const app = express();

app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use('/test', (req, res) => {res.send({"test": "Success!"})});
app.use('/', routes);
app.use((err, req, res, next) => {
    const message = err.details.body[0].context.label;
    if (err instanceof validation.ValidationError)
      return res.status(401).send({message});
    return res.status(401).send({message: err.message});
});

mongoose.connect('mongodb+srv://Ramana:gotvj7YRCb99Ow5J@departmentlibrary.3xnhs.mongodb.net/departmentLibraryDB?retryWrites=true&w=majority', { useNewUrlParser: true, useUnifiedTopology: true}).then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => console.log(`Listening to port: ${PORT}`));
});
