const express = require("express");
const router = express.Router();
const { protect, isMember } = require("../utils/auth");
const {
    checkListOwnership,
    validateTeamTask,
    validateTeamList,
    validateTaskOwner,
} = require("../utils/task");
const {
    createTask,
    createList,
    deleteTask,
} = require("../controllers/taskController");

router.post("/create-user-task", protect, checkListOwnership, createTask);
router.post(
    "/create-team-task",
    protect,
    isMember,
    validateTeamTask,
    createTask
);
router.post("/create-user-list", protect, createList);
router.post(
    "/create-team-list",
    protect,
    isMember,
    validateTeamList,
    createList
);
router.delete("/delete-task", protect, validateTaskOwner, deleteTask);

module.exports = router;
