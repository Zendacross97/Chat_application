const { Server } = require('socket.io');
const socketAuth = require('./middleware');
const messageHandler = require('./handlers/message');
const personalMessageHandler = require('./handlers/personal_message');

module.exports = (server) => {
    const io = new Server(server, {
        cors: {
            origin: process.env.NODE_ENV === "production"
            ? process.env.BASE_URL
            : ["http://localhost:5500", "http://localhost:5173", "http://localhost:3000"], // fallback for dev
            credentials: true,
            methods: ["GET", "POST"]
        }
    });
    socketAuth(io);
    io.on("connection", (socket) => {
        console.log('User', socket.user.name, 'connected');
        messageHandler(socket, io);
        personalMessageHandler(socket, io);
    })
}


