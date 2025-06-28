const User = require('../models/userModel');

exports.createUser = async (name, email, number, password) => {
    try {
        return await User.create({name, email, number, password});
    } catch (error) {
        console.error('Error creating user:', error);
    }
}

exports.getUserByEmail = async (email) => {
    try {
        return await User.findAll({
            where: { email: email },
        });     
    } catch (error) {
        console.error('Error fetching user details:', error);
    }
}