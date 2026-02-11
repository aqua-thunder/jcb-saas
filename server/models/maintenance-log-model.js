const mongoose = require("mongoose");

const maintenanceLogSchema = new mongoose.Schema({
  machineId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Machine",
    required: true,
  },
  logs: [
    {
      date: {
        type: String,
        required: true,
      },
      items: [
        {
          description: {
            type: String,
            required: true,
          },
          rs: {
            type: String,
          },
        },
      ],
      createdAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
});

const MaintenanceLog = mongoose.model("MaintenanceLog", maintenanceLogSchema);
module.exports = MaintenanceLog;
