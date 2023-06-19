const express = require("express");
const router = express.Router();
const {
    createTeam,
    addMember,
    removeMember,
    renameTeam,
    fetchTeam,
    fetchAllTeams,
    deleteTeam,
    leaveTeam,
    createAnnouncement,
    fetchAnnouncement,
    fetchAllAnnouncements,
    editAnnouncement,
    deleteAnnouncement,
} = require("../controllers/teamController");
const {
    protect,
    isMember,
    isAdmin,
    checkAnnouncementOwnership,
} = require("../utils/auth");

router.post("/create", protect, createTeam);
router.post("/add-member", protect, isMember, isAdmin, addMember);
router.put("/remove-member", protect, isMember, isAdmin, removeMember);
router.put("/rename", protect, isMember, isAdmin, renameTeam);
router.get("/fetch-team", protect, isMember, fetchTeam);
router.get("/fetch-all", protect, fetchAllTeams);
router.delete("/delete", protect, isMember, isAdmin, deleteTeam);
router.put("/leave", protect, isMember, leaveTeam);

router.post("/announce", protect, isMember, isAdmin, createAnnouncement);
router.get(
    "/fetch-announcement",
    protect,
    isMember,
    checkAnnouncementOwnership,
    fetchAnnouncement
);
router.get(
    "/fetch-all-announcements",
    protect,
    isMember,
    fetchAllAnnouncements
);
router.put(
    "/edit-announcement",
    protect,
    isMember,
    isAdmin,
    checkAnnouncementOwnership,
    editAnnouncement
);
router.delete(
    "/delete-announcement",
    protect,
    isMember,
    isAdmin,
    checkAnnouncementOwnership,
    deleteAnnouncement
);

module.exports = router;
