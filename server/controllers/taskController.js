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

    if (addToList) {
        taskData.listId = listId;
    }

    const task = await Task.create(taskData);
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

module.exports = { createTask, createList };
