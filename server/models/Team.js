const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const { generateShortId } = require("../utils/team");

const teamSchema = new Schema(
    {
        shortId: {
            type: String,
            default: generateShortId,
            required: [true, "Cannot generate a short ID"],
            unique: true,
        },
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

teamSchema.post("save", (error, doc, next) => {
    if (error.name === "MongoError" && error.code === 11000) {
        doc.shortId = generateShortId();
        doc.save();
    }
    next();
});

const Team = mongoose.model("Team", teamSchema);
module.exports = Team;
