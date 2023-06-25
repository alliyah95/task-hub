const express = require("express");
const router = express.Router();
const { protect, isMember } = require("../utils/auth");
const {
    checkListOwnership,
    validateTeamTask,
    validateAssigneeMembership,
    validateTeamList,
    validateTaskOwner,
    validateListOwner,
    validateTaskAccess,
} = require("../utils/task");
const {
    createTask,
    createList,
    deleteTask,
    deleteList,
    fetchTask,
    fetchUserTasks,
    fetchUserLists,
} = require("../controllers/taskController");

router.post("/create-user-task", protect, checkListOwnership, createTask);
router.post(
    "/create-team-task",
    protect,
    isMember,
    validateTeamTask,
    validateAssigneeMembership,
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
router.delete("/delete-list", protect, validateListOwner, deleteList);
router.get("/fetch", protect, validateTaskAccess, fetchTask);
router.get("/fetch-user-tasks", protect, fetchUserTasks);
router.get("/fetch-user-lists", protect, fetchUserLists);

module.exports = router;
