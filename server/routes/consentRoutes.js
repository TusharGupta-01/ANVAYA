const express = require("express");

const router = express.Router();

const consentStore = new Map();

router.get("/:patientId", (req, res) => {
  const patientId = req.params.patientId;

  const consent = consentStore.get(patientId) || {
    granted: false,
    purpose: "Healthcare record access",
    grantedAt: null,
  };

  res.json({
    success: true,
    consent,
  });
});

router.post("/:patientId", (req, res) => {
  const patientId = req.params.patientId;

  const granted = Boolean(req.body.granted);

  const consent = {
    granted,
    purpose: "Healthcare record access",
    grantedAt: granted ? new Date().toISOString() : null,
  };

  consentStore.set(patientId, consent);

  res.json({
    success: true,
    consent,
  });
});

module.exports = router;