const CareEvent = require("../models/CareEvent");
const consentRoutes = require("../routes/consentRoutes");
const createCareEvent = async (req, res) => {
  try {
    const {
  patientId,
  type,
  title,
  description,
  department,
} = req.body || {};

    if (!patientId || !type || !title) {
      return res.status(400).json({
        success: false,
        message: "patientId, type and title are required",
      });
    }

    if (!req.rolePermissions.allowedTypes.includes(type)) {
  return res.status(403).json({
    success: false,
    message: `${req.rolePermissions.label} cannot create a ${type} record`,
    code: "ROLE_NOT_ALLOWED",
  });
}

    const event = await CareEvent.create({
      patientId,
      type,
      title,
      description,
      department,
      createdBy: req.rolePermissions.label,
      fileName: req.file ? req.file.originalname : "",
      fileUrl: req.file ? `/uploads/${req.file.filename}` : "",
    });

    res.status(201).json({
      success: true,
      message: "Care record added successfully",
      event,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getPatientTimeline = async (req, res) => {
  try {
    const events = await CareEvent.find({
      patientId: req.params.patientId,
    }).sort({ timestamp: -1 });

    res.json({
      success: true,
      count: events.length,
      timeline: events,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getDoctorPatientTimeline = async (req, res) => {
  try {
    const patientId = req.params.patientId;

    // MVP consent check
    const consentStore = consentRoutes.consentStore;

    const consent = consentStore?.get(patientId);
    if (!consent?.granted) {
      return res.status(403).json({
        success: false,
        message: "Patient consent is required to access clinical records",
        code: "CONSENT_REQUIRED",
      });
    }

    const events = await CareEvent.find({
      patientId,
    }).sort({ timestamp: -1 });

    res.json({
      success: true,
      count: events.length,
      timeline: events,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
module.exports = {
  createCareEvent,
  getPatientTimeline,
  getDoctorPatientTimeline,
};
