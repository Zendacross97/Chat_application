const jwt = require('jsonwebtoken');
const User = require('../models/userModel');


const authenticate = (req, res, next) => {
    try {
        const token = req.header('Authorization');
        const userData = jwt.verify(token, 'secret_key');
        User.findByPk(userData.UserId)
        .then((user) => {
            if (!user) {
                return res.status(401).json({ error: 'User not found' });
            }
            req.user = user;
            next();
        })
        .catch(err => res.status(401).json({ error: 'Invalid token' }));
    } catch(err) {
        return res.status(401).json({ error: 'Authentication failed' });
    }
}

module.exports = {
    authenticate
};