const mongoose = require("mongoose");

const patientSchema = new mongoose.Schema(
  {
    patientId: {
      type: String,
      required: true,
      unique: true,
    },

    name: {
      type: String,
      required: true,
    },

    age: {
      type: Number,
      required: true,
    },

    gender: {
      type: String,
      required: true,
    },

    abhaMasked: {
      type: String,
      default: "XXXX-XXXX-XXXX",
    },

    bloodGroup: {
      type: String,
      default: "Not Available",
    },

    phone: {
      type: String,
      default: "",
    },

    // Clinical snapshot
    allergies: {
      type: [String],
      default: [],
    },

    currentMedications: {
      type: [
        {
          name: {
            type: String,
            required: true,
          },
          dosage: {
            type: String,
            default: "",
          },
          frequency: {
            type: String,
            default: "",
          },
        },
      ],
      default: [],
    },

    vaccinations: {
      type: [
        {
          name: {
            type: String,
            required: true,
          },
          date: {
            type: Date,
          },
          status: {
            type: String,
            default: "Completed",
          },
        },
      ],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Patient", patientSchema);