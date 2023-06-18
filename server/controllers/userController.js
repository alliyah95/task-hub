const User = require("../models/User");
const asyncHandler = require("express-async-handler");
const bcrypt = require("bcryptjs");
const { generateToken } = require("../utils/auth");

const registerUser = asyncHandler(async (req, res) => {
    const { name, username, password, picture } = req.body;

    if (!name || !username || !password) {
        res.status(400);
        throw new Error("Please provide all the needed information");
    }

    const userExists = await User.findOne({ username });

    if (userExists) {
        res.status(400);
        throw new Error("Username already in use");
    }

    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
        name,
        username,
        password: hashedPassword,
        picture,
    });

    if (user) {
        res.status(201).json({
            id: user._id,
            name: user.name,
            username: user.username,
            picture: user.picture,
            token: generateToken(user._id),
        });
    } else {
        res.status(400);
        throw new Error("Failed to register user");
    }
});

const loginUser = asyncHandler(async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        res.status(400);
        throw new Error("Please provide all the needed information");
    }

    const user = await User.findOne({ username });

    if (user && (await bcrypt.compare(password, user.password))) {
        res.status(201).json({
            id: user._id,
            name: user.name,
            username: user.username,
            picture: user.picture,
            token: generateToken(user._id),
        });
    } else {
        res.status(400);
        throw new Error("Incorrect username or password");
    }
});

module.exports = { registerUser, loginUser };
