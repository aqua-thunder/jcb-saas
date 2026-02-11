const Invoice = require("../models/invoice-model.js");

/**
 * CREATE INVOICE
 * POST /api/invoice
 */
const generateInvoice = async (req, res) => {
  try {
    const {
      clientName,
      phoneNumber,
      email,
      contactPerson,
      gstNumber,
      issueDate,
      paymentMode,
      buildingName,
      area,
      city,
      state,
      pinCode,
      vehicle,
      machineHours,
      driver,
      driverHours,
      machines,
      totalAmount,
      tcs,
      discount,
      cgst,
      sgst,
      totalTax,
      grandTotal,
      status,
      invoiceNo,
      sequence
    } = req.body;
    const userId = req.user;

    // Fetch user settings for invoice numbering
    const Settings = require("../models/settings-model");
    const settings = await Settings.findOne({ userId });

    // Generate Invoice Number (handled via destructuring or auto-generation below)
    let finalInvoiceNo = invoiceNo;

    // Only auto-generate if not provided
    if (!finalInvoiceNo && settings && settings.billing) {
      const today = new Date(issueDate || new Date());
      const currentMonth = today.getMonth();
      const currentYear = today.getFullYear();
      const fyStartYear = currentMonth < 3 ? currentYear - 1 : currentYear;
      const fyEndYear = fyStartYear + 1;

      const values = {
        "{{mm}}": String(currentMonth + 1).padStart(2, "0"),
        "{{mmm}}": today.toLocaleString("default", { month: "short" }),
        "{{xx}}": String(fyStartYear).slice(-2),
        "{{xxxx}}": String(fyStartYear),
        "{{yy}}": String(fyEndYear).slice(-2),
        "{{yyyy}}": String(fyEndYear),
      };

      // Get count for sequence
      const count = await Invoice.countDocuments({ createdBy: userId });
      const sequenceVal = String(count + 1).padStart(3, "0");

      let prefix = settings.billing.invoicePrefix || "";
      let suffix = settings.billing.invoiceSuffix || "";

      Object.keys(values).forEach((key) => {
        prefix = prefix.split(key).join(values[key]);
        suffix = suffix.split(key).join(values[key]);
      });

      finalInvoiceNo = `${prefix}${sequenceVal}${suffix}`;
    }

    const invoiceGenerated = await Invoice.create({
      clientName,
      phoneNumber,
      email,
      contactPerson,
      gstNumber,
      issueDate,
      paymentMode,
      buildingName,
      area,
      city,
      state,
      pinCode,
      vehicle,
      machineHours,
      driver,
      driverHours,
      machines,
      totalAmount,
      tcs,
      discount,
      cgst,
      sgst,
      totalTax,
      grandTotal,
      status,
      invoiceNo: finalInvoiceNo, // Save the generated number
      sequence,
      createdBy: userId,
    });

    res.status(201).json({
      success: true,
      message: "Invoice generated successfully",
      invoice: invoiceGenerated,
      invoiceId: invoiceGenerated._id,
      invoiceNo: invoiceGenerated.invoiceNo,
    });
  } catch (error) {
    console.error("Generate Invoice Error:", error);

    // Check for duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Invoice number already exists. Please use a different sequence number.",
        error: error.message,
      });
    }

    res.status(500).json({
      success: false,
      message: "Error generating invoice",
      error: error.message,
    });
  }
};

/**
 * GET ALL INVOICES
 * GET /api/invoice
 */
const getAllInvoices = async (req, res) => {
  try {
    const userId = req.user;
    const invoices = await Invoice.find({ createdBy: userId }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      invoices,
    });
  } catch (error) {
    console.error("Get All Invoices Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch invoices",
      error: error.message,
    });
  }
};

/**
 * GET SINGLE INVOICE BY ID
 * GET /api/invoice/:id
 */
const getInvoiceById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user;

    const invoice = await Invoice.findOne({ _id: id, createdBy: userId });

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: "Invoice not found",
      });
    }

    res.status(200).json({
      success: true,
      invoice,
    });
  } catch (error) {
    console.error("Get Invoice By ID Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch invoice",
      error: error.message,
    });
  }
};

/**
 * DELETE INVOICE
 * DELETE /api/invoice/:id
 */
/**
 * UPDATE INVOICE STATUS
 * PATCH /api/invoice/:id/status
 */
const updateInvoiceStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user;

    const updatedInvoice = await Invoice.findOneAndUpdate(
      { _id: id, createdBy: userId },
      { status },
      { new: true },
    );

    if (!updatedInvoice) {
      return res.status(404).json({
        success: false,
        message: "Invoice not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Invoice status updated",
      invoice: updatedInvoice,
    });
  } catch (error) {
    console.error("Update Status Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update status",
      error: error.message,
    });
  }
};

const deleteInvoice = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user;

    const deletedInvoice = await Invoice.findOneAndDelete({
      _id: id,
      createdBy: userId,
    });

    if (!deletedInvoice) {
      return res.status(404).json({
        success: false,
        message: "Invoice not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Invoice deleted successfully",
    });
  } catch (error) {
    console.error("Delete Invoice Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete invoice",
      error: error.message,
    });
  }
};

const addPayment = async (req, res) => {
  console.log("Add Payment Route Hit - ID:", req.params.id);
  try {
    const { id } = req.params;
    const { date, method, amount, note } = req.body;
    const userId = req.user;

    const invoice = await Invoice.findOne({ _id: id, createdBy: userId });

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: "Invoice not found",
      });
    }

    // Add the new payment
    invoice.payments.push({ date, method, amount, note });

    // Calculate total paid
    const totalPaid = invoice.payments.reduce((sum, p) => sum + p.amount, 0);

    // If fully paid, optionally update status or other logic
    // For now, just save.
    await invoice.save();

    res.status(200).json({
      success: true,
      message: "Payment recorded successfully",
      invoice,
    });
  } catch (error) {
    console.error("Add Payment Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to record payment",
      error: error.message,
    });
  }
};

const getNextInvoiceSequence = async (req, res) => {
  try {
    const userId = req.user;
    const lastInvoice = await Invoice.findOne({ createdBy: userId }).sort({ createdAt: -1 });

    let nextSequence = "001";
    if (lastInvoice && lastInvoice.sequence) {
      const lastSeq = parseInt(lastInvoice.sequence);
      if (!isNaN(lastSeq)) {
        nextSequence = (lastSeq + 1).toString().padStart(3, '0');
      }
    }

    res.status(200).json({
      success: true,
      nextSequence
    });
  } catch (error) {
    console.error("Next Sequence Error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  generateInvoice,
  getAllInvoices,
  getInvoiceById,
  updateInvoiceStatus,
  deleteInvoice,
  addPayment,
  getNextInvoiceSequence,
};
