module.exports = (socket, io) => {
    socket.on("join-room", (roomName) => {
        socket.join(roomName);
    })
    socket.on("new-message", ({message, roomName}) => {
        console.log('user:', socket.user.name, 'said:', message);
        io.emit('new-message', message)
    })
}