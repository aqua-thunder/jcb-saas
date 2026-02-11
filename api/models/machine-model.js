const mongoose = require("mongoose");

const machineScheema = new mongoose.Schema({
  model: {
    type: String,
    required: true,
  },
  manufacturer: {
    type: String,
    required: true,
  },
  mileage: {
    type: String,
    required: true,
  },
  vehicleNumber: {
    type: String,
    required: true,
  },
  vehicleMakeYear: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    required: true,
  },
  usageHours: {
    type: String,
    required: true,
  },
  rentalRate: {
    type: String,
    required: true,
  },
  lastServiceDate: {
    type: String,
    required: true,
  },
  serviceLimitHours: {
    type: String,
    required: true,
  },

    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    }
});

const Machine = new mongoose.model("Machine", machineScheema);
module.exports = Machine;
