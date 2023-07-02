const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const { generateShortId } = require("../utils/team");

const announcementSchema = new Schema(
    {
        shortId: {
            type: String,
            default: generateShortId,
            required: [true, "Cannot generate a short ID"],
            unique: true,
        },
        author: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: [true, "Author cannot be empty"],
        },
        teamId: {
            type: Schema.Types.ObjectId,
            ref: "Team",
            required: [true, "Team ID cannot be empty"],
        },
        title: {
            type: String,
            required: true,
            trim: true,
        },
        content: {
            type: String,
            required: [true, "Announcement cannot be empty"],
        },
        createdAt: {
            type: Date,
            default: Date.now,
        },
    },
    { timestamps: true }
);

const Announcement = mongoose.model("Announcement", announcementSchema);
module.exports = Announcement;
