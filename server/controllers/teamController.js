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
            team: newTeam,
        });
    } catch (err) {
        throw new Error(err);
    }
});

const addMember = asyncHandler(async (req, res) => {
    const { teamId, memberId } = req.body;

    if (!teamId || !memberId) {
        res.status(400);
        throw new Error("Team and member IDs are required");
    }

    const team = await Team.findById(teamId);
    if (!team) {
        res.status(404);
        throw new Error("Team not found");
    }

    const isMemberAlreadyInTeam = team.members.includes(memberId);
    if (isMemberAlreadyInTeam) {
        res.status(400);
        throw new Error("Member is already in the team");
    }

    const updatedTeam = await Team.findByIdAndUpdate(
        teamId,
        {
            $push: { members: memberId },
        },
        {
            new: true,
        }
    )
        .populate("members", "-password -createdAt -updatedAt")
        .populate("admin", "-password -createdAt -updatedAt");

    if (!updatedTeam) {
        res.status(400);
        throw new Error("Team not found");
    } else {
        res.status(200).json({ team: updatedTeam });
    }
});

const renameTeam = asyncHandler(async (req, res) => {
    const { teamId, name } = req.body;

    if (!name) {
        res.status(400);
        throw new Error("Team name cannot be empty");
    }
    const updatedTeam = await Team.findByIdAndUpdate(
        teamId,
        { name },
        { new: true }
    )
        .populate("members", "-password -createdAt -updatedAt")
        .populate("admin", "-password -createdAt -updatedAt");

    if (!updatedTeam) {
        res.status(404);
        throw new Error("Team not found");
    } else {
        res.status(200).json({ team: updatedTeam });
    }
});

const fetchTeam = asyncHandler(async (req, res) => {
    const { teamId } = req.body;

    if (!teamId) {
        res.status(400);
        throw new Error("Team ID is empty");
    }

    const team = await Team.findById(teamId)
        .populate("members", "-password -createdAt -updatedAt")
        .populate("admin", "-password -createdAt -updatedAt");

    if (!team) {
        res.status(404);
        throw new Error("Team not found");
    } else {
        res.status(200).json({ team });
    }
});

const fetchAllTeams = asyncHandler(async (req, res) => {
    const teams = await Team.find({
        members: { $elemMatch: { $eq: req.user._id } },
    })
        .populate("members", "-password -createdAt -updatedAt")
        .populate("admin", "-password -createdAt -updatedAt")
        .sort({ name: 1 });

    res.status(200).json({ teams });
});

const deleteTeam = asyncHandler(async (req, res) => {
    const { teamId } = req.body;

    if (!teamId) {
        res.status(404);
        throw new Error("Team ID is empty");
    }

    try {
        const deletedTeam = await Team.findByIdAndDelete(teamId);

        if (!deletedTeam) {
            res.status(404);
            throw new Error("Team not found");
        }

        res.status(200).json({ message: "Team successfully deleted" });
    } catch (error) {
        res.status(500);
        throw new Error("Failed to delete team");
    }
});

module.exports = {
    createTeam,
    addMember,
    renameTeam,
    fetchTeam,
    fetchAllTeams,
    deleteTeam,
};
