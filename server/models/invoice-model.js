const mongoose = require("mongoose");

const invoiceSchema = new mongoose.Schema({
  clientName: {
    type: String,
    required: true,
  },
  invoiceNo: {
    type: String,
    sparse: true,
  },
  sequence: {
    type: String,
  },
  phoneNumber: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    default: "",
  },
  contactPerson: {
    type: String,
    default: "",
  },
  gstNumber: {
    type: String,
    default: "",
  },
  issueDate: {
    type: String,
    default: () => new Date().toISOString().split("T")[0],
  },
  dueDate: {
    type: String,
    default: "",
  },
  paymentMode: {
    type: String,
    default: "",
  },
  buildingName: {
    type: String,
    default: "",
  },
  area: {
    type: String,
    default: "",
  },
  city: {
    type: String,
    default: "",
  },
  state: {
    type: String,
    default: "",
  },
  pinCode: {
    type: String,
    default: "",
  },
  vehicle: {
    type: String,
    default: "",
  },
  machineHours: {
    type: String,
    default: "",
  },
  // Add these fields to match your frontend
  driver: {
    type: String,
    default: "",
  },
  driverHours: {
    type: String,
    default: "",
  },
  status: {
    type: String,
    enum: ["Pending", "Success", "Paid"],
    default: "Pending",
  },
  // Add machines array to store multiple machines
  machines: [
    {
      vehicle: String,
      machineHours: String,
      price: String,
    },
  ],
  // Add total amount
  totalAmount: {
    type: Number,
    default: 0,
  },
  tcs: {
    type: Number,
    default: 0,
  },
  discount: {
    type: Number,
    default: 0,
  },
  cgst: {
    type: Number,
    default: 0,
  },
  sgst: {
    type: Number,
    default: 0,
  },
  totalTax: {
    type: Number,
    default: 0,
  },
  grandTotal: {
    type: Number,
    default: 0,
  },
  payments: [
    {
      date: { type: String, default: () => new Date().toISOString().split("T")[0] },
      method: { type: String, enum: ["Cash", "UPI", "Bank Transfer", "Cheque"], default: "Cash" },
      amount: { type: Number, default: 0 },
      note: { type: String, default: "" },
    }
  ],
  // Add timestamp
  createdAt: {
    type: Date,
    default: Date.now,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});

// Compound index to ensure uniqueness per user
invoiceSchema.index({ invoiceNo: 1, createdBy: 1 }, { unique: true });

const Invoice = new mongoose.model("Invoice", invoiceSchema);
module.exports = Invoice;
