const express = require("express");
const router = express.Router();
const {
    createTeam,
    addMember,
    renameTeam,
} = require("../controllers/teamController");
const { protect, isMember, isAdmin } = require("../utils/auth");

router.post("/create", protect, createTeam);
router.post("/add-member", protect, isMember, isAdmin, addMember);
router.put("/rename", protect, isMember, isAdmin, renameTeam);

module.exports = router;
