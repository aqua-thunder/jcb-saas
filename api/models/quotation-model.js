const mongoose = require("mongoose")

const quotationSchema = new mongoose.Schema({
    clientName: {
        type: String,
        required: true
    },
    phoneNumber: {
        type: String,
        required: true
    },
    email: {
        type: String
    },
    gstNumber: {
        type: String
    },
    siteName: {
        type: String
    },
    rentalDate: {
        type: String
    },
    date: {
        type: String,
        required: true
    },
    time: {
        type: String
    },
    hours: {
        type: String
    },
    quotationNo: {
        type: String
    },
    sequence: {
        type: String
    },
    status: {
        type: String,
        enum: ["Pending", "Converted", "Cancelled"],
        default: "Pending"
    },
    machines: [{
        machine: { type: String, required: true },
        hours: { type: String, required: true },
        rate: { type: String, required: true }
    }],
    totalAmount: {
        type: Number
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    }
}, { timestamps: true });

module.exports = mongoose.model("Quotation", quotationSchema)