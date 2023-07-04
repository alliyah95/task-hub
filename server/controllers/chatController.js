const asyncHandler = require("express-async-handler");
const Message = require("../models/Message");
const Chat = require("../models/Chat");
const User = require("../models/User");

const sendMessage = asyncHandler(async (req, res) => {
    const { content, groupChatId } = req.body;

    if (!content) {
        return res.status(400).json({ error: "Message cannot be empty" });
    }

    try {
        var message = await Message.create({
            sender: req.user._id,
            content: content,
            groupChat: groupChatId,
        });

        message = await message.populate("sender", "name username picture");
        message = await message.populate("groupChat");
        message = await User.populate(message, {
            path: "groupChat.members",
            select: "name username picture",
        });

        await Chat.findByIdAndUpdate(req.body.groupChatId, {
            latestMessage: message,
        });

        return res.status(200).json({ message });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Failed to send message" });
    }
});

const fetchChat = asyncHandler(async (req, res) => {
    const { groupChatId } = req.body;

    try {
        const chat = await Message.find({ groupChat: groupChatId }).populate(
            "sender",
            "name username picture"
        );
        return res.status(200).json({ chat });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Failed to fetch chat" });
    }
});

const fetchChatNames = asyncHandler(async (req, res) => {
    try {
        const chats = await Chat.find({
            members: { $elemMatch: { $eq: req.user._id } },
        })
            .populate("team")
            .sort({
                updatedAt: -1,
            });
        return res.status(200).json({ chats });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Failed to fetch chats" });
    }
});

module.exports = { sendMessage, fetchChat, fetchChatNames };
