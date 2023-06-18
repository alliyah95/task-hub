const express = require("express");
const router = express.Router();
const { createTeam } = require("../controllers/teamController");
const { protect } = require("../utils/auth");

router.post("/create", protect, createTeam);
module.exports = router;
