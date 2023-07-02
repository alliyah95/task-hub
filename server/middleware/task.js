const List = require("../models/List");
const Team = require("../models/Team");
const Task = require("../models/Task");
const User = require("../models/User");

// used for creating user tasks
// does not validate teamId and assignee
const checkListOwnership = async (req, res, next) => {
    const { listId } = req.body;
    const userId = req.user._id;

    if (!listId) {
        return next();
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

// used for creating team tasks
// checks if provided team exists and if provided list
// is associated with such team
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

// used when creating and validating team tasks
// checks whether provided assignee is a member of the team
const validateAssigneeMembership = async (req, res, next) => {
    const { assignee, teamId } = req.body;

    if (!assignee) {
        return next();
    }

    const assigneeUser = await User.findById(assignee);

    if (!assigneeUser) {
        return res.status(404).json({ error: "Assignee not found" });
    }

    const team = await Team.findById(teamId).populate("members", "-password");
    const isAssigneeMember = team.members.find((member) =>
        member._id.equals(assignee)
    );

    if (!isAssigneeMember) {
        return res
            .status(403)
            .json({ error: "Assignee is not a member of this team" });
    }

    next();
};

// used when reassigning a task for editing
const validateAssignee = async (req, res, next) => {
    const { taskId, assignee } = req.body;

    if (!assignee) {
        return next();
    }

    const assigneeUser = await User.findById(assignee);
    if (!assigneeUser) {
        return res.status(404).json({ error: "Assignee not found" });
    }

    const task = await Task.findById(taskId);
    if (!task) {
        return res.status(404).json({ error: "Task not found" });
    }

    if (task.teamId) {
        const team = await Team.findById(task.teamId).populate(
            "members",
            "-password"
        );
        const isAssigneeMember = team.members.find((member) =>
            member._id.equals(assignee)
        );

        if (!isAssigneeMember) {
            return res
                .status(403)
                .json({ error: "Assignee is not a member of this team" });
        } else {
            return next();
        }
    } else {
        return res.status(400).json({ error: "You cannot reassign this task" });
    }
};

// used when creating a team list
// checks if provided team exists
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

// used when deleting a task
// does not allow a user to delete a task if they are not the owner or team admin
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

        if (task.teamId) {
            const team = await Team.findById(task.teamId);

            if (!team) {
                return res.status(404).json({ error: "Task's team not found" });
            }

            if (team.admin.equals(req.user._id)) {
                return next();
            }
        }

        if (!task.assignedBy.equals(req.user._id)) {
            return res
                .status(401)
                .json({ error: "You are not the owner of this task" });
        }

        next();
    } catch (err) {
        return res.status(500).json({ error: "Failed to validate task" });
    }
};

// used when deleting a list
// only the creator of the list can delete
// does not allow a user to delete if list has multiple owners, meaning
// list contains tasks made by multiple members - basically a team list
const validateListOwner = async (req, res, next) => {
    const { listId } = req.body;

    if (!listId) {
        return res.status(400).json({ error: "List ID is empty" });
    }

    try {
        const list = await List.findById(listId);

        if (!list) {
            return res.status(404).json({ error: "List not found" });
        }

        if (list.teamId) {
            const team = await Team.findById(list.teamId);

            if (!team) {
                return res.status(404).json({ error: "List's team not found" });
            }

            if (team.admin.equals(req.user._id)) {
                return next();
            }
        }

        if (!list.createdBy.equals(req.user._id)) {
            return res
                .status(401)
                .json({ error: "You are not the owner of this list" });
        }

        const hasMultipleOwners = list.tasks.find(
            (task) => !task.equals(req.user._id)
        );

        if (hasMultipleOwners) {
            return res.status(401).json({
                error: "Failed to modify. List has multiple owners",
            });
        }

        next();
    } catch (err) {
        return res.status(500).json({ error: "Failed to validate list" });
    }
};

// used when fetching a task
// fetch only when:
// 1. user task
// 2. team task and user is member of team
const validateTaskAccess = async (req, res, next) => {
    const { taskId } = req.body;

    if (!taskId) {
        return res.status(400).json({ error: "Task ID is empty" });
    }

    const task = await Task.findById(taskId);
    if (!task) {
        return res.status(404).json({ error: "Task not found" });
    }

    if (task.teamId) {
        const taskTeam = await Team.findById(task.teamId).populate(
            "members",
            "-password"
        );

        const isMember = taskTeam.members.find((member) =>
            member._id.equals(req.user._id)
        );

        if (!isMember) {
            return res
                .status(403)
                .json({ error: "Unauthorized to access this task" });
        }

        next();
    } else {
        if (!task.assignedBy.equals(req.user._id)) {
            return res
                .status(401)
                .json({ error: "You are not the owner of this task" });
        }

        next();
    }
};

module.exports = {
    checkListOwnership,
    validateTeamTask,
    validateAssigneeMembership,
    validateTeamList,
    validateTaskOwner,
    validateListOwner,
    validateTaskAccess,
    validateAssignee,
};
