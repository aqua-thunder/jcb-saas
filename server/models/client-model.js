const mongoose = require("mongoose");

const clientSchema = new mongoose.Schema({
    clientName: {
        type: String,
        required: true
    },
    phoneNumber: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    billingAddress: {
        type: String,
        required: false
    },
    shippingAddress: {
        type: String,
        required: false
    },
    pincode: {
        type: String,
        required: true
    },
    city: {
        type: String,
        required: true
    },
    state: {
        type: String,
        required: true
    },
    contactPerson: {
        type: String,
        required: false
    },
    gstNumber: {
        type: String,
        required: false
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    }
}, { timestamps: true });

const Client = mongoose.model("Client", clientSchema);
module.exports = Client;
