const List = require("../models/List");
const Team = require("../models/Team");
const Task = require("../models/Task");

const checkListOwnership = async (req, res, next) => {
    const { listId } = req.body;
    const userId = req.user._id;

    if (!listId) {
        next();
        return;
    }

    try {
        const list = await List.findOne({ _id: listId, createdBy: userId });

        if (!list) {
            return res
                .status(404)
                .json({ error: "List not found or not owned by the user" });
        }

        next();
    } catch (error) {
        return res.status(500).json({
            error: "An error has occured while checking list ownership",
        });
    }
};

const validateTeamTask = async (req, res, next) => {
    const { teamId, listId } = req.body;

    try {
        const team = await Team.findById(teamId);

        if (!team) {
            return res.status(404).json({ error: "Team not found" });
        }
        if (listId) {
            const list = await List.findOne({ _id: listId, teamId });

            if (!list) {
                return res.status(404).json({
                    error: "List not found or not associated with the team",
                });
            }
        }
        next();
    } catch (error) {
        return res.status(500).json({ error: "Failed to validate team task" });
    }
};

const validateTeamList = async (req, res, next) => {
    const { teamId } = req.body;

    try {
        const team = await Team.findById(teamId);

        if (!team) {
            return res.status(404).json({ error: "Team not found" });
        }

        next();
    } catch (error) {
        return res.status(500).json({ error: "Failed to validate list" });
    }
};

const validateTaskOwner = async (req, res, next) => {
    const { taskId } = req.body;

    if (!taskId) {
        return res.status(400).json({ error: "Task ID is empty" });
    }

    try {
        const task = await Task.findById(taskId);

        if (!task) {
            return res.status(404).json({ error: "Task not found" });
        }

        if (task.assignedBy !== req.user._id) {
            return res
                .status(401)
                .json({ error: "You are not the owner of this task" });
        }

        next();
    } catch (err) {
        return res.status(500).json({ error: "Failed to validate task" });
    }
};

module.exports = {
    checkListOwnership,
    validateTeamTask,
    validateTeamList,
    validateTaskOwner,
};
