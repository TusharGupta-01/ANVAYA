const express = require("express");

const router = express.Router();

const hospitalStatus = [
  {
    department: "Cardiology",
    status: "In Consultation",
    doctor: "Dr. Sharma",
    room: "C-204",
    patientsWaiting: 2,
    estimatedWait: "15 min",
  },
  {
    department: "Pathology",
    status: "Reports Processing",
    doctor: "Lab Staff",
    room: "LAB-02",
    patientsWaiting: 4,
    estimatedWait: "25 min",
  },
  {
    department: "General Medicine",
    status: "Available",
    doctor: "Dr. Mehta",
    room: "GM-101",
    patientsWaiting: 1,
    estimatedWait: "5 min",
  },
];

router.get("/", (req, res) => {
  res.json({
    success: true,
    updatedAt: new Date().toISOString(),
    departments: hospitalStatus,
  });
});

module.exports = router;