module.exports = (socket, io) => {
    socket.on("join-group", (roomName) => {
        const previousRoom = socket.data.roomName;
        if (previousRoom) {
            socket.leave(previousRoom);
            console.log(`User ${socket.user.name} left group ${previousRoom}`);
        }
        socket.join(roomName);
        socket.data.roomName = roomName;
        console.log(`User ${socket.user.name} joined group ${roomName}`);
    })
    socket.on("new-message", (chat) => {
        console.log('user:', socket.user.name, 'said:', chat.message);
        io.to(chat.roomName).emit('new-group-message', chat);
    });
    socket.on('typing', ({ roomName, name }) => {
        socket.to(roomName).emit('user-typing', { name });
    });

    socket.on('stop-typing', ({ roomName }) => {
        socket.to(roomName).emit('user-stop-typing');
    });
}