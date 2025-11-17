module.exports = (socket, io) => {
    socket.on("chat-message", (message) => {
        console.log('user:', socket.user.name, 'said:', message);
        io.emit('chat-message', message)
    })
}