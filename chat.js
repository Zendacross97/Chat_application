require('dotenv').config();
const express = require('express');
const db = require('./util/db_connection');
const cors = require('cors');
const morgan = require('morgan');
const fs = require('fs');
const path = require('path');
const userRoute = require('./routes/userRoutes');
const chatRoute = require('./routes/chatRoutes');
const userModel = require('./models/userModel');
const chatModel = require('./models/chatModel');
const chatIndexModel = require('./models/chatIndexModel');

const accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' });

const app = express();

app.use(cors({
    origin: 'http://localhost:3000',// Allow requests from this origin
    credentials: true, // Allow credentials if needed
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Specify allowed methods
}));
app.use(morgan('combined', {stream: accessLogStream}));
app.use(express.json());
app.use(express.static('public'));
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'signUp.html'));
});
app.use('/user', userRoute);
app.use('/chat', chatRoute);

db.sync({force: false})
.then(() => {
    app.listen(process.env.PORT , () => {
        console.log("Server is running on http://localhost:3000");
    });
})
.catch((err) => {
    console.log(err);
});