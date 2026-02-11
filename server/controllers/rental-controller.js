const Rental = require("../models/rental-model.js");
const Quotation = require("../models/quotation-model.js");

const createRental = async (req, res) => {
    try {
        const { client, machine, driver, startDate, startTime, hours, fuel, status, site, quotation } = req.body;
        const createdBy = req.user; // Corrected to use req.user


        const newRental = new Rental({
            client,
            machine,
            driver,
            startDate,
            startTime,
            hours,
            fuel,
            status,
            site,
            quotation,
            createdBy
        });

        const savedRental = await newRental.save();

        // If a quotation was used, mark it as Converted
        if (quotation) {
            await Quotation.findByIdAndUpdate(quotation, { status: "Converted" });
        }

        res.status(201).json(savedRental);
    } catch (error) {
        console.error("Error creating rental:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

const getAllRentals = async (req, res) => {
    try {
        const rentals = await Rental.find({ createdBy: req.user })

            .populate("client")
            .populate("machine")
            .populate("driver")
            .sort({ createdAt: -1 });
        res.status(200).json(rentals);
    } catch (error) {
        console.error("Error fetching rentals:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

const getRentalById = async (req, res) => {
    try {
        const rental = await Rental.findById(req.params.id)
            .populate("client")
            .populate("machine")
            .populate("driver");
        if (!rental) {
            return res.status(404).json({ message: "Rental not found" });
        }
        res.status(200).json(rental);
    } catch (error) {
        console.error("Error fetching rental:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

const updateRental = async (req, res) => {
    try {
        const updatedRental = await Rental.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        if (!updatedRental) {
            return res.status(404).json({ message: "Rental not found" });
        }
        res.status(200).json(updatedRental);
    } catch (error) {
        console.error("Error updating rental:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

const deleteRental = async (req, res) => {
    try {
        const deletedRental = await Rental.findByIdAndDelete(req.params.id);
        if (!deletedRental) {
            return res.status(404).json({ message: "Rental not found" });
        }
        res.status(200).json({ message: "Rental deleted successfully" });
    } catch (error) {
        console.error("Error deleting rental:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

module.exports = {
    createRental,
    getAllRentals,
    getRentalById,
    updateRental,
    deleteRental
};
