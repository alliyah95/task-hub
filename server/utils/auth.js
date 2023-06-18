const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const User = require("../models/User");
const Team = require("../models/Team");

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });
};

const protect = asyncHandler(async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")
    ) {
        try {
            token = req.headers.authorization.split(" ")[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await User.findById(decoded.id).select("-password");

            next();
        } catch (error) {
            res.status(401);
            throw new Error("Unauthorized");
        }
    }

    if (!token) {
        res.status(401);
        throw new Error("Unauthorized");
    }
});

const isMember = asyncHandler(async (req, res, next) => {
    const { teamId } = req.body;
    const currentUser = req.user;

    const team = await Team.findById(teamId).populate("members", "-password");

    if (!team) {
        res.status(404);
        throw new Error("Team not found");
    }

    const isMember = team.members.find((member) =>
        member._id.equals(currentUser._id)
    );

    if (!isMember) {
        res.status(403);
        throw new Error("You are not a member of this team");
    }

    next();
});

const isAdmin = asyncHandler(async (req, res, next) => {
    const { teamId } = req.body;
    const currentUser = req.user;

    const team = await Team.findById(teamId).populate("admin", "-password");

    if (!team) {
        res.status(404);
        throw new Error("Team not found");
    }

    if (!team.admin._id.equals(currentUser._id)) {
        res.status(403);
        throw new Error("Only admins can modify the team");
    }

    next();
});

module.exports = { generateToken, protect, isMember, isAdmin };
