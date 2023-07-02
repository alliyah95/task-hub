const asyncHandler = require("express-async-handler");
const Task = require("../models/Task");
const List = require("../models/List");
const {
    validateTaskDescription,
    validateTaskStatus,
    validateTaskDueDate,
} = require("../utils/task");

const createTask = asyncHandler(async (req, res) => {
    const { description, status, dueDate, teamId, listId, assignee } = req.body;
    const { addToList } = req.query;

    try {
        if (!validateTaskDescription(description)) {
            return res.status(404).json({ error: "Task description is empty" });
        }

        if (status && !validateTaskStatus(status)) {
            return res.status(400).json({ error: "Invalid task status" });
        }

        if (dueDate && !validateTaskDueDate(dueDate)) {
            return res.status(400).json({ error: "Invalid due date" });
        }

        const taskData = {
            description,
            status,
            assignee: req.user._id,
            assignedBy: req.user._id,
        };

        if (dueDate) {
            taskData.dueDate = new Date(dueDate);
        }

        // assignee is already validated using validateAssigneeMembership middleware
        if (req.path === "/create-team-task") {
            taskData.teamId = teamId;
            taskData.assignee = assignee || req.user._id;
        }

        const task = await Task.create(taskData);

        if (addToList) {
            const list = await List.findById(listId);

            list.tasks.push(task._id);
            task.listId = listId;

            await task.save();
            await list.save();
        }
        return res.status(200).json({ task });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Failed to create task" });
    }
});

const createList = asyncHandler(async (req, res) => {
    const { title, teamId } = req.body;

    if (!title) {
        return res.status(404).json({ error: "List title is empty" });
    }

    try {
        const listData = {
            title,
            createdBy: req.user._id,
        };

        if (req.path === "/create-team-list") {
            listData.teamId = teamId;
        }

        const list = await List.create(listData);
        return res.status(200).json({ list });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Failed to create list" });
    }
});

const deleteTask = asyncHandler(async (req, res) => {
    const { taskId } = req.body;

    try {
        const task = await Task.findById(taskId);
        if (task.listId) {
            const list = await List.findById(task.listId);
            if (!list) {
                return res.status(404).json({ error: "List not found" });
            }

            await List.findByIdAndUpdate(task.listId, {
                $pull: { tasks: taskId },
            });
        }

        await Task.findByIdAndDelete(taskId);
        return res.status(200).json({ message: "Task successfully deleted" });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Failed to delete task" });
    }
});

const deleteList = asyncHandler(async (req, res) => {
    const { listId } = req.body;

    try {
        const list = await List.findById(listId).populate("tasks");

        for (let task of list.tasks) {
            await Task.findByIdAndDelete(task);
        }

        await List.findByIdAndDelete(listId);
        return res.status(200).json({ message: "List successfully deleted" });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: " Failed to delete list" });
    }
});

const fetchTask = asyncHandler(async (req, res) => {
    const { taskId } = req.body;

    try {
        const task = await Task.findById(taskId);
        return res.status(200).json({ task });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Failed to fetch task" });
    }
});

const fetchUserLists = asyncHandler(async (req, res) => {
    const ungroupedTasks = { title: "Tasks", tasks: [] };

    try {
        const tasks = await Task.find({
            assignedBy: req.user._id,
            assignee: req.user._id,
            teamId: { $exists: false },
            listId: { $exists: false },
        });

        ungroupedTasks.tasks = tasks;

        const lists = await List.find({
            teamId: { $exists: false },
            createdBy: req.user._id,
        }).populate("tasks", "-teamId");

        res.status(200).json({ lists: [ungroupedTasks, ...lists] });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Failed to fetch lists" });
    }
});

const fetchTeamLists = asyncHandler(async (req, res) => {
    const { teamId } = req.body;
    const ungroupedTeamTasks = { title: "Tasks", tasks: [] };

    try {
        const teamTasks = await Task.find({
            teamId: teamId,
            listId: { $exists: false },
        });
        ungroupedTeamTasks.tasks = teamTasks;

        const teamLists = await List.find({ teamId: teamId }).populate("tasks");
        return res
            .status(200)
            .json({ lists: [ungroupedTeamTasks, ...teamLists] });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Failed to fetch lists" });
    }
});

const editTask = asyncHandler(async (req, res) => {
    const { taskId, description, status, assignee, dueDate } = req.body;

    try {
        const task = await Task.findById(taskId);

        if (description) {
            if (validateTaskDescription(description)) {
                task.description = description;
            } else {
                return res
                    .status(404)
                    .json({ error: "Task description is empty" });
            }
        }

        if (status) {
            if (validateTaskStatus(status)) {
                task.status = status;
            } else {
                return res.status(404).json({ error: "Invalid task status" });
            }
        }

        if (dueDate !== undefined) {
            if (dueDate === "") {
                task.dueDate = undefined;
            } else {
                if (!validateTaskDueDate(dueDate)) {
                    return res.status(404).json({ error: "Invalid due date" });
                }
                task.dueDate = new Date(dueDate);
            }
        }

        if (assignee) {
            task.assignee = assignee;
        }

        const updatedTask = await task.save();
        return res.status(200).json({ task: updatedTask });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Failed to edit task" });
    }
});

const editListTitle = asyncHandler(async (req, res) => {
    const { listId, title } = req.body;

    try {
        const list = await List.findById(listId).populate("tasks");

        if (title) {
            list.title = title;
        }

        const updatedList = await list.save();
        res.status(200).json({ list: updatedList });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Failed to edit list title" });
    }
});

module.exports = {
    createTask,
    createList,
    deleteTask,
    deleteList,
    fetchTask,
    fetchUserLists,
    fetchTeamLists,
    editTask,
    editListTitle,
};
