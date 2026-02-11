const Settings = require("../models/settings-model");

// Get Settings for the authenticated user
const getSettings = async (req, res) => {
    try {
        const userId = req.user;
        let settings = await Settings.findOne({ userId });

        if (!settings) {
            // Return empty default structure if no settings exist yet
            return res.status(200).json({
                company: {},
                billing: {},
                bankDetails: [],
                terms: []
            });
        }

        res.status(200).json(settings);
    } catch (error) {
        console.error("Error fetching settings:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Update or Create Settings
const updateSettings = async (req, res) => {
    try {
        const userId = req.user;
        const { company, billing, bankDetails, terms } = req.body;

        const updateData = {};
        if (company) updateData.company = company;
        if (billing) updateData.billing = billing;
        if (bankDetails) updateData.bankDetails = bankDetails;
        if (terms) updateData.terms = terms;

        const settings = await Settings.findOneAndUpdate(
            { userId },
            { $set: updateData },
            { new: true, upsert: true, setDefaultsOnInsert: true }
        );

        res.status(200).json({ message: "Settings saved successfully", settings });
    } catch (error) {
        console.error("Error updating settings:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

module.exports = { getSettings, updateSettings };
