const User = require('../models/userModel');

exports.createUser = async (name, email, number, password) => {
    try {
        return await User.create({name, email, number, password});
    } catch (error) {
        throw new Error('Error creating user:', error);
    }
}

exports.getUserByEmail = async (email) => {
    try {
        return await User.findAll({
            where: { email: email },
        });     
    } catch (error) {
        throw new Error('Error fetching user details:', error.message);
    }
}

exports.getNameOfUserById = async (userId) => {
    try {
        return await User.findOne({
            attributes: ['name'],
            where: { id: userId }
        });
    } catch (error) {
        throw new Error('Error fetching user by ID:', error.message);
    }
}