const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const taskSchema = new Schema(
    {
        description: {
            type: String,
            required: true,
            trim: true,
            minLength: 1,
        },
        status: {
            type: String,
            enum: ["todo, ongoing", "finished"],
            default: "todo",
        },
        assignee: {
            type: Schema.Types.ObjectId,
            ref: "User",
        },
        assignedBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
        },
        dueDate: {
            type: Date,
        },
        teamId: {
            type: Schema.Types.ObjectId,
            ref: "Team",
        },
        listId: {
            type: Schema.Types.ObjectId,
            ref: "List",
        },
    },
    {
        timestamps: true,
    }
);

const Task = mongoose.model("Task", taskSchema);
module.exports = Task;
