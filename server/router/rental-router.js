const express = require("express");
const router = express.Router();
const rentalController = require("../controllers/rental-controller.js");
const protect = require("../middleware/authMiddleware");

router.use(protect);

router.route("/").post(rentalController.createRental);
router.route("/").get(rentalController.getAllRentals);
router.route("/:id").get(rentalController.getRentalById);
router.route("/:id").put(rentalController.updateRental);
router.route("/:id").delete(rentalController.deleteRental);

module.exports = router;
