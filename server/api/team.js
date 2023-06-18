const express = require("express");
const router = express.Router();
const { createTeam, addMember } = require("../controllers/teamController");
const { protect, isMember, isAdmin } = require("../utils/auth");

router.post("/create", protect, createTeam);
router.post("/add-member", protect, isMember, isAdmin, addMember);

module.exports = router;
