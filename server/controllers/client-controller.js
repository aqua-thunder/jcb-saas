const Client = require("../models/client-model");

const addClient = async (req, res) => {
    try {
        const { clientName, phoneNumber, email, billingAddress, shippingAddress, pincode, city, state, gstNumber } = req.body;
        const userId = req.user;

        // Check if client with this email already exists for this user
        const clientExist = await Client.findOne({ email, createdBy: userId });
        if (clientExist) {
            return res.status(400).json({ message: "Client with this email already exists" });
        }

        const clientCreated = await Client.create({
            clientName,
            phoneNumber,
            email,
            billingAddress,
            shippingAddress,
            pincode,
            city,
            state,
            gstNumber,
            createdBy: userId
        });

        res.status(201).json({
            message: "Client created successfully",
            client: clientCreated
        });
    } catch (error) {
        console.error("Add client error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

const getAllClients = async (req, res) => {
    try {
        const userId = req.user;
        const clients = await Client.find({ createdBy: userId }).sort({ createdAt: -1 });
        res.status(200).json(clients);
    } catch (error) {
        console.error("Get clients error:", error);
        res.status(500).json({ message: "Error fetching clients" });
    }
};

const getClientById = async (req, res) => {
    try {
        const userId = req.user;
        const client = await Client.findOne({ _id: req.params.id, createdBy: userId });
        if (!client) {
            return res.status(404).json({ message: "Client not found" });
        }
        res.status(200).json(client);
    } catch (error) {
        console.error("Get client error:", error);
        res.status(500).json({ message: "Error fetching client" });
    }
};

const updateClient = async (req, res) => {
    try {
        const userId = req.user;
        const updatedClient = await Client.findOneAndUpdate(
            { _id: req.params.id, createdBy: userId },
            req.body,
            { new: true }
        );
        if (!updatedClient) {
            return res.status(404).json({ message: "Client not found" });
        }
        res.status(200).json({ message: "Client updated successfully", client: updatedClient });
    } catch (error) {
        console.error("Update client error:", error);
        res.status(500).json({ message: "Error updating client" });
    }
};

const deleteClient = async (req, res) => {
    try {
        const userId = req.user;
        const deletedClient = await Client.findOneAndDelete({ _id: req.params.id, createdBy: userId });
        if (!deletedClient) {
            return res.status(404).json({ message: "Client not found" });
        }
        res.status(200).json({ message: "Client deleted successfully" });
    } catch (error) {
        console.error("Delete client error:", error);
        res.status(500).json({ message: "Error deleting client" });
    }
};

module.exports = { addClient, getAllClients, getClientById, updateClient, deleteClient };
