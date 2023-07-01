const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const User = require("../models/User");
const Team = require("../models/Team");
const Announcement = require("../models/Announcement");

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
            return res.status(401).json({ error: "Unauthorized" });
        }
    }

    if (!token) {
        return res.status(401).json({ error: "Unauthorized" });
    }
});

const isMember = asyncHandler(async (req, res, next) => {
    const { teamId } = req.body;
    const currentUser = req.user;

    const team = await Team.findById(teamId).populate("members", "-password");

    if (!team) {
        return res.status(404).json({ error: "Team not found" });
    }

    const isMember = team.members.find((member) =>
        member._id.equals(currentUser._id)
    );

    if (!isMember) {
        return res
            .status(403)
            .json({ error: "You are not a member of this team" });
    }

    next();
});

const isAdmin = asyncHandler(async (req, res, next) => {
    const { teamId } = req.body;
    const currentUser = req.user;

    if (!teamId) {
        return res.status(400).json({ error: "Team ID is empty" });
    }

    const team = await Team.findById(teamId).populate("admin", "-password");

    if (!team) {
        return res.status(404).json({ error: "Team not found" });
    }

    if (!team.admin._id.equals(currentUser._id)) {
        return res
            .status(403)
            .json({ error: "Only team admins can perform this action" });
    }

    next();
});

const checkAnnouncementOwnership = async (req, res, next) => {
    const { teamId, announcementId } = req.body;

    const announcement = await Announcement.findOne({
        _id: announcementId,
        teamId: teamId,
    });

    if (!announcement) {
        return res
            .status(404)
            .json({ error: "Announcement not found in the team" });
    }

    next();
};

module.exports = {
    protect,
    isMember,
    isAdmin,
    checkAnnouncementOwnership,
};
