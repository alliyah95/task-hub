const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const listSchema = new Schema(
    {
        title: {
            type: String,
            required: true,
            minLength: 1,
        },
        tasks: [
            {
                type: Schema.Types.ObjectId,
                ref: "Task",
            },
        ],
        teamId: {
            type: Schema.Types.ObjectId,
            ref: "Team",
        },
        createdBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
        },
    },
    {
        timestamps: true,
    }
);

const List = mongoose.model("List", listSchema);
module.exports = List;
