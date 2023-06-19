const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const announcementSchema = new Schema(
    {
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
            default: "No title",
            required: true,
            trim: true,
        },
        content: {
            type: String,
            required: [true, "Announcement cannot be empty"],
        },
        files: [
            {
                type: {
                    type: String,
                    enum: ["image", "file"],
                    required: true,
                },
                url: {
                    type: String,
                    required: true,
                },
            },
        ],
        createdAt: {
            type: Date,
            default: Date.now,
        },
    },
    { timestamps: true }
);

const Announcement = mongoose.model("Announcement", announcementSchema);
module.exports = Announcement;
