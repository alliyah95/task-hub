const asyncHandler = require("express-async-handler");
const Task = require("../models/Task");
const List = require("../models/List");

const TASK_STATUS = ["todo", "ongoing", "finished"];

const createTask = asyncHandler(async (req, res) => {
    const { description, status, dueDate, teamId, listId } = req.body;
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

module.exports = { createTask, createList, deleteTask };
