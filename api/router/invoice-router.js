// routes/invoice-routes.js

const express = require("express");
const router = express.Router();
const invoiceRouter = require("../controllers/invoice-controller.js");
const protect = require("../middleware/authMiddleware");

router.use((req, res, next) => {
    console.log(`Invoice Router: ${req.method} ${req.url}`);
    next();
});

router.use(protect);

// Routes for /api/invoice/
router.post("/", invoiceRouter.generateInvoice);
router.get("/", invoiceRouter.getAllInvoices);
router.get("/next-sequence", invoiceRouter.getNextInvoiceSequence);

router.get("/:id", invoiceRouter.getInvoiceById);
router.patch("/:id/status", invoiceRouter.updateInvoiceStatus);
router.patch("/:id/payment", invoiceRouter.addPayment);
router.delete("/:id", invoiceRouter.deleteInvoice);

module.exports = router;
