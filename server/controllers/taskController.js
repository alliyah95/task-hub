const asyncHandler = require("express-async-handler");
const Task = require("../models/Task");
const List = require("../models/List");

const TASK_STATUS = ["todo", "ongoing", "finished"];

const createTask = asyncHandler(async (req, res) => {
    const { description, status, dueDate, teamId, listId, assignee } = req.body;
    const { addToList } = req.query;

    if (!description) {
        return res.status(404).json({ error: "Task description is empty" });
    }

    if (!TASK_STATUS.includes(status)) {
        return res.status(400).json({ error: "Invalid task status" });
    }

    let formattedDate;
    try {
        formattedDate = new Date(dueDate);
    } catch (err) {
        return res.status(400).json({ error: "Invalid due date format" });
    }

    const taskData = {
        description,
        status,
        assignee: req.user._id,
        assignedBy: req.user._id,
        dueDate: formattedDate,
    };

    if (req.path === "/create-team-task") {
        taskData.teamId = teamId;
        taskData.assignee = assignee || req.user._id;
    }

    const task = await Task.create(taskData);

    if (addToList) {
        const list = await List.findById(listId);

        if (!list) {
            return res.status(404).json({ error: "List not found" });
        }

        list.tasks.push(task._id);
        task.listId = listId;

        await task.save();
        await list.save();
    }
    return res.status(200).json({ task });
});

const createList = asyncHandler(async (req, res) => {
    const { title, teamId } = req.body;

    if (!title) {
        return res.status(404).json({ error: "List title is empty" });
    }

    const listData = {
        title,
        createdBy: req.user._id,
    };

    if (req.path === "/create-team-list") {
        listData.teamId = teamId;
    }

    const list = await List.create(listData);
    return res.status(200).json({ list });
});

const deleteTask = asyncHandler(async (req, res) => {
    const { taskId } = req.body;

    if (!taskId) {
        return res.status(400).json({ error: "Task ID is empty" });
    }

    const task = await Task.findById(taskId);
    if (!task) {
        return res.status(404).json({ error: "Task not found" });
    }

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
    res.status(200).json({ message: "Task successfully deleted" });
});

const deleteList = asyncHandler(async (req, res) => {
    const { listId } = req.body;

    if (!listId) {
        return res.status(400).json({ error: "List ID is not provided" });
    }

    try {
        const list = await List.findById(listId).populate("tasks");

        if (!list) {
            return res.status(404).json({ error: "List not found" });
        }

        for (let task of list.tasks) {
            await Task.findByIdAndDelete(task);
        }

        const deletedList = await List.findByIdAndDelete(listId);
        if (!deletedList) {
            return res.status(500).json({ error: "Failed to delete list" });
        }

        res.status(200).json({ message: "List successfully deleted" });
    } catch (err) {}
});

const fetchTask = asyncHandler(async (req, res) => {
    const { taskId } = req.body;
    const task = await Task.findById(taskId);
    res.status(200).json({ task });
});

// use for fetching Due Today Tasks and Ungrouped Tasks
const fetchUserTasks = asyncHandler(async (req, res) => {
    const { dueToday } = req.query;

    let query = {
        assignedBy: req.user._id,
        assignee: req.user._id,
        teamId: { $exists: false },
        listId: { $exists: false },
    };

    if (dueToday && dueToday.toLowerCase() === "true") {
        const today = new Date();
        today.setUTCHours(0, 0, 0, 0);

        query.dueDate = {
            $gte: today,
            $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
        };
    }

    const tasks = await Task.find(query);
    res.status(200).json({ tasks });
});

// use for fetching tasks in lists
// const fetchUserLists = asyncHandler(async (req, res) => {
//     const lists = await List.find({
//         teamId: { $exists: false },
//         createdBy: req.user._id,
//     }).populate("tasks", "-teamId");

//     res.json({ lists });
// });

module.exports = {
    createTask,
    createList,
    deleteTask,
    deleteList,
    fetchTask,
    fetchUserTasks,
};
