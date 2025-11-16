require('dotenv').config();
const jwt = require('jsonwebtoken');
const express = require('express');
const http = require('http');
// const WebSocket = require('ws');
const { Server } = require('socket.io');
const db = require('./util/db_connection');
const cors = require('cors');
const morgan = require('morgan');
const fs = require('fs');
const path = require('path');
const userRoute = require('./routes/userRoutes');
const chatRoute = require('./routes/chatRoutes');
const groupRoute = require('./routes/groupRoutes');
const userModel = require('./models/userModel');
const chatModel = require('./models/chatModel');
const chatIndexModel = require('./models/chatIndexModel');
const groupsModel = require('./models/groupsModel');
const userGroupsModel = require('./models/userGroupsModel');

const accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' });

const app = express();

const server = http.createServer(app);
// const io = new Server(server, {
//     cors: {
//         origin: process.env.NODE_ENV === "production" ? false : ["http://localhost:3000", "http://localhost:5500"]
//     }
// });
const io = new Server(server, {
  cors: {
    origin: process.env.NODE_ENV === "production"
    ? process.env.BASE_URL
    : ["http://localhost:5500", "http://localhost:5173", "http://localhost:3000"], // fallback for dev
    credentials: true,
    methods: ["GET", "POST"]
  }
});

io.use((socket, next) => {
    try {
        const token = socket.handshake.auth.token
        if(!token) {
            return next(new Error("Authorization token is missing"))
        }
        const userData = jwt.verify(token, 'secret_key');
        // console.log("Decoded token payload:", userData);
        userModel.findByPk(userData.UserId)
        .then((user) => {
            if (!user) {
                console.error("User not found for ID:", userData.UserId);
                return next(new Error('User not found'));
            }
            socket.user = user;
            next();
        })
        .catch(err => {
            console.error("DB error:", err.message);
            next(new Error('Invalid token'));
        });
    } catch(err) {
        console.error("JWT error:", err.message);
        return next(new Error('Authentication failed'));
    }
});

io.on("connection", (socket) => {
    console.log('User', socket.user.name, 'connected');

    socket.on("chat-message", (message) => {
        console.log('user:', socket.user.name, 'said:', message);
        io.emit('chat-message', message)
    })
})

app.use(cors({
    origin: process.env.BASE_URL, //Allow requests from this origin
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
app.use('/group', groupRoute);

db.sync({force: false})
.then(() => {
    // app.listen(process.env.PORT , () => {
    server.listen(process.env.PORT , () => {
        console.log("Server is running on http://localhost:3000");
    });
})
.catch((err) => {
    console.log(err);
});