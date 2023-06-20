const asyncHandler = require("express-async-handler");
const Task = require("../models/Task");
const List = require("../models/List");

const TASK_STATUS = ["todo", "ongoing", "finished"];

const createUserTask = asyncHandler(async (req, res) => {
    const { description, status, dueDate } = req.body;

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

    const task = await Task.create({
        description,
        status,
        assignee: req.user._id,
        assignedBy: req.user._id,
        dueDate: formattedDate,
    });

    return res.status(200).json({ task });
});

const createUserList = asyncHandler(async (req, res) => {
    const { title } = req.body;

    if (!title) {
        return res.status(404).json({ error: "List title is empty" });
    }

    const list = await List.create({
        title,
        createdBy: req.user._id,
    });

    return res.status(200).json({ list });
});

module.exports = { createUserTask, createUserList };
