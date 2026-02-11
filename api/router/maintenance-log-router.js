const express = require("express");
const router = express.Router();
const {
  addMaintenanceLog,
  getMaintenanceLogs,
} = require("../controllers/maintenance-log-controller");

router.post("/add", addMaintenanceLog);
router.get("/:machineId", getMaintenanceLogs);

module.exports = router;
