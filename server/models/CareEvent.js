const mongoose = require("mongoose");

const careEventSchema = new mongoose.Schema(
  {
    patientId: {
      type: String,
      required: true,
      index: true,
    },

    type: {
      type: String,
      required: true,
      enum: [
        "Consultation",
        "Lab Report",
        "Prescription",
        "ECG Report",
        "Clinical Note",
        "Care Observation",
        "Other",
      ],
    },

    title: {
      type: String,
      required: true,
    },

    description: {
      type: String,
      default: "",
    },

    department: {
      type: String,
      default: "General Medicine",
    },

    createdBy: {
      type: String,
      default: "Healthcare Staff",
    },

    fileName: {
      type: String,
      default: "",
    },

    fileUrl: {
      type: String,
      default: "",
    },

    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("CareEvent", careEventSchema);