const Driver = require("../models/driver-model.js")

const insertDriver = async (req, res) => {
    try {
        const { firstName, lastName, phoneNumber, addharNumber, dob, address, licensePhoto } = req.body;
        const userId = req.user;

        const driverExist = await Driver.findOne({ addharNumber, createdBy: userId })
        if (driverExist) {
            return res.status(400).json({ message: "Driver already exist" });
        }

        const driverInserted = await Driver.create({ firstName, lastName, phoneNumber, addharNumber, dob, address, licensePhoto, createdBy: userId });
        res.status(201).json(driverInserted)
    } catch (error) {
    }
}


const getAllDrivers = async (req, res) => {
    try {
        const userId = req.user;
        const response = await Driver.find({ createdBy: userId })
        if (!response) {
            res.status(404).json({ msg: "No Driver Found" })
            return;
        }
        res.status(200).json({ msg: response })
    } catch (error) {
    }
}

const updateDriver = async (req, res) => {
    try {
        const id = req.params.id;
        const userId = req.user;
        const data = req.body;

        const updatedData = await Driver.updateOne({ _id: id, createdBy: userId }, { $set: data })
        return res.status(200).json(updatedData);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const deleteDriver = async (req, res) => {
    try {
        const id = req.params.id;
        const userId = req.user;
        await Driver.deleteOne({ _id: id, createdBy: userId });
        return res.json({ message: "Driver Delete Successfully" });
    } catch (error) {
    }
}

module.exports = { insertDriver, getAllDrivers, updateDriver, deleteDriver }