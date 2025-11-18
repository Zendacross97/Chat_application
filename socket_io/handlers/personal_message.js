module.exports = (socket, io) => {
    socket.on("join-room", (roomName) => {
        socket.join(roomName);
    })
    // socket.on("new-message", ({message, roomName}) => {
    //     console.log('user:', socket.user.name, 'said:', message);
    //     io.to(roomName).emit('new-message', message)
    // })
    socket.on("new-message", (chat) => {
        console.log('user:', socket.user.name, 'said:', chat.message);
        io.to(chat.roomName).emit('new-message', chat);
    });
}