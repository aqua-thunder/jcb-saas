const express = require("express");
const router = express.Router();
const settingsController = require("../controllers/settings-controller");
const protect = require("../middleware/authMiddleware");

router.use(protect);

router.route("/")
    .get(settingsController.getSettings)
    .put(settingsController.updateSettings);

module.exports = router;
