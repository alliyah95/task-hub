const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const chat = new Schema(
    {
        team: {
            type: Schema.Types.ObjectId,
            ref: "Team",
        },
        latestMessage: {
            type: Schema.Types.ObjectId,
            ref: "Message",
        },
        members: [
            {
                type: Schema.Types.ObjectId,
                ref: "User",
            },
        ],
    },
    { timestamps: true }
);

const Chat = mongoose.model("Chat", chat);
module.exports = Chat;
