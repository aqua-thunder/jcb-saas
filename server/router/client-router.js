const express = require("express");
const router = express.Router();
const clientController = require("../controllers/client-controller");
const protect = require("../middleware/authMiddleware");

router.use(protect);

router.route("/")
    .get(clientController.getAllClients)
    .post(clientController.addClient);

router.route("/:id")
    .get(clientController.getClientById)
    .put(clientController.updateClient)
    .delete(clientController.deleteClient);

module.exports = router;
