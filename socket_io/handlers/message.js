// module.exports = (socket, io) => {
//     socket.on("chat-message", (message) => {
//         console.log('user:', socket.user.name, 'said:', message);
//         io.emit('chat-message', message)
//     })
// }
module.exports = (socket, io) => {
    socket.on("join-room", (roomName) => {
        const previousRoom = socket.data.roomName;
        if (previousRoom) {
            socket.leave(previousRoom);
            console.log(`User ${socket.user.name} left room ${previousRoom}`);
        }
        socket.join(roomName);
        socket.data.roomName = roomName;
        console.log(`User ${socket.user.name} joined room ${roomName}`);
    });
    // shared handler
    socket.on("new-message", (chat) => {
        if (chat.message && !chat.mediaUrl) {
            console.log('user:', socket.user.name, 'said:', chat.message);
        }
        if (!chat.message && chat.mediaUrl) {
            console.log('user:', socket.user.name, 'sent a file:', chat.mediaUrl);
        }
        if (chat.message && chat.mediaUrl) {
            console.log('user:', socket.user.name, 'said:', chat.message, 'sent a file:', chat.mediaUrl);
        }
        if (chat.type === "user") {
            io.to(chat.roomName).emit('new-personal-message', chat);
        } else if (chat.type === "group") {
            io.to(chat.roomName).emit('new-group-message', chat);
        }
    });
    socket.on('typing', ({ roomName, name }) => {
        socket.to(roomName).emit('user-typing', { name });
    });

    socket.on('stop-typing', ({ roomName }) => {
        socket.to(roomName).emit('user-stop-typing');
    });
}