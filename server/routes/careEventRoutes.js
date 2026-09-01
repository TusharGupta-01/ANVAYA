const express = require("express");
const multer = require("multer");

const {
  createCareEvent,
  getPatientTimeline,
  getDoctorPatientTimeline,
} = require("../controllers/careEventController");

const { roleAccess } = require("../middleware/roleAccess");

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },

  filename: (req, file, cb) => {
    const uniqueName =
      Date.now() + "-" + file.originalname.replace(/\s+/g, "-");

    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
});

// Add care record + optional file
router.post(
  "/",
  roleAccess,
  upload.single("file"),
  createCareEvent
);

// Get patient's complete care journey
router.get("/patient/:patientId", getPatientTimeline);

router.get(
  "/doctor/:patientId",
  getDoctorPatientTimeline,
);

module.exports = router;