const express = require("express")
const router = express.Router();
const quotationController = require("../controllers/quotation-controller.js")
const protect = require("../middleware/authMiddleware");

router.use(protect);

// Routes for /api/quotation/
router.post("/", quotationController.generateQuotation);
router.get("/", quotationController.getAllQuotations);
router.get("/:id", quotationController.getQuotationById);
router.delete("/:id", quotationController.deleteQuotation);
router.put("/:id", quotationController.updateQuotation);
router.get("/next-sequence", quotationController.getNextQuotationSequence);

module.exports = router;    