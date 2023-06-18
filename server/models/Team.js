const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const teamSchema = new Schema(
    {
        name: {
            type: String,
            trim: true,
            required: true,
        },
        members: [
            {
                type: Schema.Types.ObjectId,
                ref: "User",
            },
        ],
        admin: {
            type: Schema.Types.ObjectId,
            ref: "User",
        },
    },
    { timestamps: true }
);

const Team = mongoose.model("Team", teamSchema);
module.exports = Team;
