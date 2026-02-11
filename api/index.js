require("dotenv").config();
const cors = require("cors");
const express = require("express");
const app = express();
const connectDb = require("./utils/db.js");
const machineRoute = require("./router/machine-router.js");
const driverRoute = require("./router/driver-router.js");
const invoiceRoute = require("./router/invoice-router.js");
const quotationRoute = require("./router/quotation-router.js");
const clientRoute = require("./router/client-router.js");
const settingsRoute = require("./router/settings-router.js");
const rentalRoute = require("./router/rental-router.js");


const authRoute = require("./router/authRoutes.js");
const protect = require("./middleware/authMiddleware.js");

const corsOptions = {
  origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

const path = require("path");

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(cors(corsOptions));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
const invoiceController = require("./controllers/invoice-controller.js");


app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "OK" });
});

app.use("/api/machine", machineRoute);
app.use("/api/driver", driverRoute);
app.use("/api/invoice", invoiceRoute);
app.use("/api/quotation", quotationRoute);
app.use("/api/client", clientRoute);
app.use("/api/settings", settingsRoute);
app.use("/api/rental", rentalRoute);

app.use("/api/maintenance-log", require("./router/maintenance-log-router.js"));

app.use("/api/auth", authRoute);

const PORT = 7000;

connectDb().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
});
