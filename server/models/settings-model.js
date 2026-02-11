const mongoose = require("mongoose");

const bankSchema = new mongoose.Schema({
    bankName: { type: String, default: "" },
    branch: { type: String, default: "" },
    accountNo: { type: String, default: "" },
    accountName: { type: String, default: "" },
    ifsc: { type: String, default: "" },
    upiId: { type: String, default: "" }
}, { _id: false });

const termSchema = new mongoose.Schema({
    title: { type: String, default: "" },
    content: { type: String, default: "" }
}, { _id: false });

const settingsSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        unique: true
    },
    company: {
        businessName: { type: String, default: "" },
        address: { type: String, default: "" },
        fullName: { type: String, default: "" },
        phoneNumber: { type: String, default: "" },
        email: { type: String, default: "" },
        website: { type: String, default: "" },
        gstNumber: { type: String, default: "" },
        logo: { type: String, default: "" } // Base64 string
    },
    billing: {
        invoicePrefix: { type: String, default: "" },
        invoiceSuffix: { type: String, default: "" },
        quotationPrefix: { type: String, default: "" },
        quotationSuffix: { type: String, default: "" },
        paymentPrefix: { type: String, default: "" },
        paymentSuffix: { type: String, default: "" },
        dateFormat: { type: String, default: "DD-MM-YYYY" },
        creditDays: { type: String, default: "0" },
        hideCredit: { type: Boolean, default: false }
    },
    bankDetails: [bankSchema],
    terms: [termSchema]
}, {
    timestamps: true
});

const Settings = mongoose.model("Settings", settingsSchema);

module.exports = Settings;
