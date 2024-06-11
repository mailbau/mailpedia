const express = require('express');
const app = express();
const PORT = process.env.PORT || 7070;
const mongoose = require('mongoose');
const User = require('./user');
const jwt = require('jsonwebtoken');
app.use(express.json());

const connectDB = async () => {
    try {
        await mongoose.connect('mongodb://localhost:27017/auth-service', {});
        console.log('Connected to Auth service database');
    } catch (error) {
        console.log('Error connecting to database', error);
    }
};

connectDB();

// login
app.post('/auth/login', async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({
        email,
    });
    if (!user) {
        return res.status(404).json({
            message: 'User not found',
        });
    } else {
        if (user.password !== password) {
            return res.status(400).json({
                message: 'Invalid password',
            });
        }

        const payload = {
            email,
            name: user.name,
        };
        jwt.sign(payload, "secret", (err, token) => {
            if (err) {
                console.log(err);
            }
            else {
                return res.json({
                    token,
                });
            }
        });
    }
});

//register
app.post('/auth/register', async (req, res) => {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({
        email,
    });
    if (existingUser) {
        return res.status(400).json({
            message: 'User with this email already exists',
        });
    } else {
        const newUser = new User({
            name,
            email,
            password,
        });

        await newUser.save();
        return res.json(newUser);
    }
});

// get all users
app.get('/auth/users', async (req, res) => {
    const users = await User.find({});
    return res.json(users);
});


app.listen(PORT, () => {
    console.log(`Auth service is running on port ${PORT}`);
});