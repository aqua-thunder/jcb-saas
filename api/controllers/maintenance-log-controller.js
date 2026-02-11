const MaintenanceLog = require("../models/maintenance-log-model");

// Add a new maintenance log
const addMaintenanceLog = async (req, res) => {
  try {
    const { machineId, date, items } = req.body;

    if (!machineId || !date || !items || !Array.isArray(items)) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if a log document already exists for this machine
    let logDocument = await MaintenanceLog.findOne({ machineId });

    if (!logDocument) {
      // Create new document if not exists
      logDocument = new MaintenanceLog({
        machineId,
        logs: [{ date, items }],
      });
    } else {
      // Check if there's already a log for this date
      const existingLogIndex = logDocument.logs.findIndex(
        (log) => log.date === date,
      );

      if (existingLogIndex !== -1) {
        // Add new items to the existing date's items array
        logDocument.logs[existingLogIndex].items.push(...items);
      } else {
        // Push new date entry to logs array
        logDocument.logs.push({ date, items });
      }
    }

    await logDocument.save();
    res
      .status(201)
      .json({ message: "Maintenance log added successfully", logDocument });
  } catch (error) {
    console.error("Error adding maintenance log:", error);
    res.status(500).json({ message: "Server Error", error });
  }
};

// Get maintenance logs for a specific machine
const getMaintenanceLogs = async (req, res) => {
  try {
    const { machineId } = req.params;
    const logs = await MaintenanceLog.findOne({ machineId }).populate(
      "machineId",
      "model vehicleNumber",
    );

    if (!logs) {
      return res
        .status(404)
        .json({ message: "No logs found for this machine" });
    }

    res.status(200).json(logs);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};

module.exports = { addMaintenanceLog, getMaintenanceLogs };
