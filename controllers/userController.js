const UserServices = require('../services/userServices');
const bcrypt = require('bcrypt');

exports.signUp = async (req, res) => {  
    try {
        const { name, email, number, password } = req.body;
        if (!name || !email || !number || !password) {
             return res.status(400).json({ error: 'Sign-up credentials are incomplete' });
        }
        const userDetails = await UserServices.getUserByEmail(email);
        if (userDetails.length !== 0) {
            return res.status(400).json({ error: 'User already exists' });
        }
        bcrypt.hash(password, 10, async (err, hash) => {
            if (err) {
                return res.status(500).json({ error: 'Something went wrong' });
            }
            else {
                await UserServices.createUser(name, email, number, hash);
                res.status(201).json({ message: 'User created successfully' });
            }
        });
    } catch (error) {
        res.status(500).json({error: error.message});
    }
};