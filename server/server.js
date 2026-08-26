const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db");

const patientRoutes = require("./routes/patientRoutes");
const careEventRoutes = require("./routes/careEventRoutes");
const consentRoutes = require("./routes/consentRoutes");
const hospitalStatusRoutes = require("./routes/hospitalStatusRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

connectDB();

app.use(cors());
app.use(express.json());

app.use("/uploads", express.static("uploads"));
app.use("/api/consent", consentRoutes);
app.locals.consentStore = consentRoutes.consentStore;

app.use("/api/hospital-status", hospitalStatusRoutes);

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "ANVAYA Backend is running",
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    service: "ANVAYA API",
    status: "healthy",
  });
});

app.use("/api/patients", patientRoutes);
app.use("/api/care-events", careEventRoutes);

app.listen(PORT, () => {
  console.log(`ANVAYA backend running on http://localhost:${PORT}`);
});