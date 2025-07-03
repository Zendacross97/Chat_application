const UserServices = require('../services/userServices');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const path = require('path');

exports.signUp = async (req, res) => {  
    try {
        const { name, email, number, password } = req.body;
        if (!name || !email || !number || !password) {
             return res.status(400).json({ error: 'Sign-up credentials are incomplete' });
        }
        const userDetails = await UserServices.getUserByEmail(email);
        if (userDetails.length !== 0) {
            return res.status(400).json({ error: 'User already exists, Please Login' });
        }
        bcrypt.hash(password, 10, async (err, hash) => {
            if (err) {
                return res.status(500).json({ error: 'Something went wrong' });
            }
            else {
                await UserServices.createUser(name, email, number, hash);
                res.status(201).json({ message: 'Successfuly signed up' });
            }
        });
    } catch (error) {
        res.status(500).json({error: error.message});
    }
};

exports.getLoginPage = (req, res) => {
    res.sendFile(path.join(__dirname, '../views/logIn.html'));
};

function token(id) {
    return jwt.sign({ UserId: id }, 'secret_key')
}

exports.logIn = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: 'Login credentials are incomplete' });
        }
        const userDetails = await UserServices.getUserByEmail(email);
        if (userDetails.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        bcrypt.compare(password, userDetails[0].password, (err, result) => {
            if (err) {
                return res.status(500).json({ error: 'Something went wrong' });
            }
            else if (!result) {// result is false if password does not match
                return res.status(401).json({ error: 'User not authorized' });
            }
            else {
                const userToken = token(userDetails[0].id);
                res.status(200).json({ message: 'Login successful', token: userToken });
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};