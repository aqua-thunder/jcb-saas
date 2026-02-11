const express = require("express")
const router = express.Router();
const machineConroller = require("../controllers/machine-controller.js")
const protect = require("../middleware/authMiddleware");

router.use(protect);

router.route("/").post(machineConroller.createMachine)
router.route("/").get(machineConroller.getAllMachines)
router.route("/:id").put(machineConroller.updateMachine);
router.route("/:id").delete(machineConroller.deleteMachine)

module.exports = router