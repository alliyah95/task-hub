const Team = require("../models/Team");
const asyncHandler = require("express-async-handler");

const createTeam = asyncHandler(async (req, res) => {
    const { name, members } = req.body;

    if (!name) {
        res.status(400);
        throw new Error("Team name is required");
    }

    const parsedMembers = members ? JSON.parse(members) : [];
    parsedMembers.push(req.user);

    try {
        const team = await Team.create({
            name,
            members: parsedMembers,
            admin: req.user,
        });

        const newTeam = await Team.findById(team.id)
            .populate("members", "-password -createdAt -updatedAt")
            .populate("admin", "-password -createdAt -updatedAt");

        res.status(200).json({
            newTeam,
        });
    } catch (err) {
        throw new Error(err);
    }
});

module.exports = { createTeam };
