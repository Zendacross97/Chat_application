const User = require('../models/userModel');
const jwt = require('jsonwebtoken');

module.exports = (io) => {
    io.use((socket, next) => {
        try {
            const token = socket.handshake.auth.token
            if(!token) {
                return next(new Error("Authorization token is missing"))
            }
            const userData = jwt.verify(token, 'secret_key');
            User.findByPk(userData.UserId)
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
}