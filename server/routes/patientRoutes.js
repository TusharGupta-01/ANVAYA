const express = require("express");
const Patient = require("../models/Patient");

const router = express.Router();

// Get all patients
router.get("/", async (req, res) => {
  try {
    const patients = await Patient.find().sort({ createdAt: -1 });

    res.json({
      success: true,
      count: patients.length,
      patients,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Get patient by ID
router.get("/:patientId", async (req, res) => {
  try {
    const patient = await Patient.findOne({
      patientId: req.params.patientId,
    });

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Patient not found",
      });
    }

    res.json({
      success: true,
      patient,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Create patient
router.post("/", async (req, res) => {
  try {
    const patient = await Patient.create(req.body);

    res.status(201).json({
      success: true,
      patient,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

// Update patient clinical snapshot
router.put("/:patientId/clinical", async (req, res) => {
  try {
    const {
      allergies,
      currentMedications,
      vaccinations,
    } = req.body;

    const patient = await Patient.findOneAndUpdate(
      { patientId: req.params.patientId },
      {
        $set: {
          allergies: allergies || [],
          currentMedications: currentMedications || [],
          vaccinations: vaccinations || [],
        },
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Patient not found",
      });
    }

    res.json({
      success: true,
      message: "Clinical snapshot updated successfully",
      patient,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

module.exports = router;