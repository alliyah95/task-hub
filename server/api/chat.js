const express = require("express");
const router = express.Router();
const { protect, isGroupChatMember } = require("../middleware/auth");
const {
    sendMessage,
    fetchChat,
    fetchChatNames,
} = require("../controllers/chatController");

router.post("/send-message", protect, isGroupChatMember, sendMessage);
router.get("/fetch-chat", protect, isGroupChatMember, fetchChat);
router.get("/fetch-chat-names", protect, fetchChatNames);
module.exports = router;
