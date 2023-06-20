const List = require("../models/List");

const checkListOwnership = async (req, res, next) => {
    const { listId } = req.body;
    const userId = req.user._id;

    if (!listId) {
        next();
        return;
    }

    try {
        const list = await List.findOne({ _id: listId, createdBy: userId });

        if (!list) {
            return res
                .status(404)
                .json({ error: "List not found or not owned by the user" });
        }

        next();
    } catch (error) {
        return res.status(500).json({
            error: "An error has occured while checking list ownership",
        });
    }
};

module.exports = { checkListOwnership };
