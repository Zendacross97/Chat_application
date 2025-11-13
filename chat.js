require('dotenv').config();
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
// const wss = new WebSocket.Server({ server });
const io = new Server(server);

// let sockets = [];

// wss.on("connection", (ws) => {
//     sockets.push(ws)

//     //Board Cast
//     ws.on("message", (message) => {
//         sockets.forEach(s => {
//             s.send(message)
//         })
//     })
// })
io.on("connection", (socket) => {
    console.log('User connected', socket.id);

    //Board Cast
    socket.on("chat-message", (message) => {
        console.log('user:', socket.id, 'said:', message);
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