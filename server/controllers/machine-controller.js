const Machine = require("../models/machine-model.js");

const createMachine = async (req, res) => {
  try {
    const {
      model,
      manufacturer,
      mileage,
      vehicleNumber,
      vehicleMakeYear,
      status,
      usageHours,
      rentalRate,
      lastServiceDate,
      serviceLimitHours,
    } = req.body;
    const userId = req.user;

    const machineExist = await Machine.findOne({ vehicleNumber, createdBy: userId });
    if (machineExist) {
      return res.status(400).json({ message: "Machine already exist" });
    }

    const machineCreated = await Machine.create({
      model,
      manufacturer,
      mileage,
      vehicleNumber,
      vehicleMakeYear,
      status,
      usageHours,
      rentalRate,
      lastServiceDate,
      serviceLimitHours,
      createdBy: userId,
    });
    res.status(201).json(machineCreated);
  } catch (error) {
  }
};

const getAllMachines = async (req, res) => {
  try {
    const userId = req.user;
    const response = await Machine.find({ createdBy: userId });
    if (!response) {
      res.status(404).json({ msg: "No Machine Found" });
      return;
    }
    res.status(200).json({ msg: response });
  } catch (error) {
  }
};

const updateMachine = async (req, res) => {
  try {
    const id = req.params.id;
    const userId = req.user;
    const data = req.body;

    const updatedData = await Machine.updateOne({ _id: id, createdBy: userId }, { $set: data });
    return res.status(200).json(updatedData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteMachine = async (req, res) => {
  try {
    const id = req.params.id;
    const userId = req.user;
    await Machine.deleteOne({ _id: id, createdBy: userId });
    return res.json({ message: "Machine Delete Successfully" });
  } catch (error) {
  }
};

module.exports = {
  createMachine,
  getAllMachines,
  updateMachine,
  deleteMachine,
};
