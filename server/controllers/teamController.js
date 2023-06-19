const Team = require("../models/Team");
const asyncHandler = require("express-async-handler");
const User = require("../models/User");

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

const removeMember = asyncHandler(async (req, res) => {
    const { teamId, memberId } = req.body;

    if (!teamId || !memberId) {
        res.status(400);
        throw new Error("Team and member IDs are required");
    }

    if (memberId === req.user._id.toString()) {
        res.status(400);
        throw new Error("You cannot remove yourself");
    }

    const team = await Team.findById(teamId);
    if (!team) {
        res.status(404);
        throw new Error("Team not found");
    }

    const isMemberOfTeam = team.members.includes(memberId);
    if (!isMemberOfTeam) {
        res.status(400);
        throw new Error("User is not a member of the team");
    }

    const updatedTeam = await Team.findByIdAndUpdate(
        teamId,
        {
            $pull: { members: memberId },
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

const leaveTeam = asyncHandler(async (req, res) => {
    const { teamId, newAdminId } = req.body;

    if (!teamId) {
        res.status(400);
        throw new Error("Team ID is empty");
    }

    try {
        const team = await Team.findById(teamId).populate("admin", "-password");

        if (team.admin._id.equals(req.user._id)) {
            if (team.members.length === 1) {
                await Team.findByIdAndDelete(teamId);
                res.status(200).json({ message: "Team deleted" });
            } else {
                if (!newAdminId) {
                    res.status(404);
                    throw new Error("Please assign a new admin");
                }

                const newAdmin = await User.findById(newAdminId);
                if (!newAdmin) {
                    res.status(404);
                    throw new Error("New admin invalid");
                }

                team.members = team.members.filter(
                    (member) =>
                        member._id.toString() !== req.user._id.toString()
                );
                team.admin = newAdminId;
                await team.save();

                res.status(200).json({
                    message: "Admin left the team, new admin assigned",
                });
            }
        } else {
            team.members = team.members.filter(
                (member) => member._id.toString() !== req.user._id.toString()
            );
            await team.save();
            res.status(200).json({ message: "Successfuly left the team" });
        }
    } catch (err) {
        res.status(500).json({ error: "Failed to leave the team" });
    }
});

module.exports = {
    createTeam,
    addMember,
    removeMember,
    renameTeam,
    fetchTeam,
    fetchAllTeams,
    deleteTeam,
    leaveTeam,
};
