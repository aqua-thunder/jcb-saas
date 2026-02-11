const express = require("express")
const router = express.Router();
const driverConroller = require("../controllers/driver-controller.js")
const protect = require("../middleware/authMiddleware");

const upload = require("../middleware/upload-middleware.js");

router.use(protect);

router.route("/").post(driverConroller.insertDriver)
router.route("/").get(driverConroller.getAllDrivers)
router.route("/:id").put(driverConroller.updateDriver);
router.route("/:id").delete(driverConroller.deleteDriver);


module.exports = router