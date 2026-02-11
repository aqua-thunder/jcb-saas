const mongoose = require("mongoose");

const rentalSchema = new mongoose.Schema({
    client: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Client",
        required: true
    },
    machine: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Machine",
        required: true
    },
    driver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Driver",
        required: true
    },
    quotation: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Quotation",
        required: false
    },
    startDate: {
        type: Date,
        required: true
    },
    startTime: {
        type: String,
        required: false
    },
    hours: {
        type: String,
        required: false
    },
    fuel: {
        type: String,
        required: false
    },
    site: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ["Pending", "Ongoing", "Completed", "Cancelled"],
        default: "Ongoing"
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    }
}, { timestamps: true });

const Rental = mongoose.model("Rental", rentalSchema);
module.exports = Rental;
