require('dotenv').config();
const express = require('express');
const db = require('./util/db_connection');
const cors = require('cors');
const morgan = require('morgan');
const fs = require('fs');
const path = require('path');
const userRoute = require('./routes/userRoutes');
const userModel = require('./models/userModel');

const accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' });

const app = express();

app.use(cors());
app.use(morgan('combined', {stream: accessLogStream}));
app.use(express.json());
app.use(express.static('public'));
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'signUp.html'));
});
app.use('/user', userRoute);

db.sync({force: false})
.then(() => {
    app.listen(process.env.PORT || 3000, () => {
        console.log("Server is running on http://localhost:3000");
    });
})
.catch((err) => {
    console.log(err);
});