const express = require("express");
const router = express.Router();
const { createTeam, addMember } = require("../controllers/teamController");
const { protect } = require("../utils/auth");

router.post("/create", protect, createTeam);
router.post("/add-member", protect, addMember);

module.exports = router;
