const express = require("express");
const router = express.Router();
const { protect } = require("../utils/auth");
const { checkListOwnership } = require("../utils/task");
const {
    createUserTask,
    createUserList,
} = require("../controllers/taskController");

router.post("/create-user-task", protect, checkListOwnership, createUserTask);
router.post("/create-user-list", protect, createUserList);

module.exports = router;
