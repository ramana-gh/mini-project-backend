const express = require('express');
const mongoose = require('mongoose');
const routes = require('./routes');
const validation = require('express-validation');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use('/', routes);
app.use((err, req, res, next) => {
    const message = err.details.body[0].context.label;
    if (err instanceof validation.ValidationError)
      return res.status(401).send({message});
    return res.status(401).send({message: err.message});
});

mongoose.connect(process.env.LOCAL_MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true}).then(() => {
    console.log('Connected to MongoDB');
    app.listen(3001, () => console.log('Listening to port: 3001'));
});
