const Quotation = require("../models/quotation-model.js")

/* Generate Quotation */
const generateQuotation = async (req, res) => {
    try {
        const {
            clientName,
            phoneNumber,
            email,
            gstNumber,
            siteName,
            rentalDate,
            date,
            time,
            hours,
            machines,
            quotationNo,
            sequence
        } = req.body;
        const userId = req.user;

        // Calculate total amount
        const totalAmount = machines.reduce((sum, m) => sum + (parseFloat(m.hours || 0) * parseFloat(m.rate || 0)), 0);

        const QuotationGenerated = await Quotation.create({
            clientName,
            phoneNumber,
            email,
            gstNumber,
            siteName,
            rentalDate,
            date,
            time,
            hours,
            machines,
            totalAmount,
            quotationNo,
            sequence,
            createdBy: userId
        });

        res.status(201).json({
            success: true,
            message: "Quotation generated successfully",
            quotation: QuotationGenerated,
            quotationId: QuotationGenerated._id
        });

    } catch (error) {
        console.error("Generate Quotation Error:", error);
        res.status(500).json({
            success: false,
            message: "Error generating quotation",
            error: error.message
        });
    }
};

/* Get All Quotations */
const getAllQuotations = async (req, res) => {
    try {
        const userId = req.user;
        const quotations = await Quotation.find({ createdBy: userId }).sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            quotations
        });
    } catch (error) {
        console.error("Get All Quotations Error:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching quotations",
            error: error.message
        });
    }
};

/* Get Quotation By ID */
const getQuotationById = async (req, res) => {
    try {
        const userId = req.user;
        const quotation = await Quotation.findOne({ _id: req.params.id, createdBy: userId });
        if (!quotation) {
            return res.status(404).json({ success: false, message: "Quotation not found" });
        }
        res.status(200).json({ success: true, quotation });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error fetching quotation", error: error.message });
    }
};

/* Update Quotation */
const updateQuotation = async (req, res) => {
    try {
        const userId = req.user;
        const { machines } = req.body;

        // Calculate total amount if machines are provided
        let updateData = { ...req.body };
        if (machines) {
            updateData.totalAmount = machines.reduce((sum, m) => sum + (parseFloat(m.hours || 0) * parseFloat(m.rate || 0)), 0);
        }

        const updatedQuotation = await Quotation.findOneAndUpdate(
            { _id: req.params.id, createdBy: userId },
            updateData,
            { new: true }
        );

        if (!updatedQuotation) {
            return res.status(404).json({ success: false, message: "Quotation not found" });
        }

        res.status(200).json({
            success: true,
            message: "Quotation updated successfully",
            quotation: updatedQuotation
        });
    } catch (error) {
        console.error("Update Quotation Error:", error);
        res.status(500).json({
            success: false,
            message: "Error updating quotation",
            error: error.message
        });
    }
};

/* Delete Quotation */
const deleteQuotation = async (req, res) => {
    try {
        const userId = req.user;
        const deletedQuotation = await Quotation.findOneAndDelete({ _id: req.params.id, createdBy: userId });
        if (!deletedQuotation) {
            return res.status(404).json({ success: false, message: "Quotation not found" });
        }
        res.status(200).json({
            success: true,
            message: "Quotation deleted successfully"
        });
    } catch (error) {
        console.error("Delete Quotation Error:", error);
        res.status(500).json({
            success: false,
            message: "Error deleting quotation",
            error: error.message
        });
    }
};

/* Get Next Sequence Number */
const getNextQuotationSequence = async (req, res) => {
    try {
        const userId = req.user;
        const lastQuotation = await Quotation.findOne({ createdBy: userId }).sort({ createdAt: -1 });

        let nextSequence = "001";
        if (lastQuotation && lastQuotation.sequence) {
            const lastSeq = parseInt(lastQuotation.sequence);
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
}

module.exports = {
    generateQuotation,
    getAllQuotations,
    getQuotationById,
    deleteQuotation,
    updateQuotation,
    getNextQuotationSequence
};