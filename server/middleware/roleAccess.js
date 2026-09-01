const ROLE_PERMISSIONS = {
  doctor: {
    label: "Doctor",
    allowedTypes: [
      "Consultation",
      "Prescription",
      "Clinical Note",
      "Other",
    ],
  },

  lab_staff: {
    label: "Lab Staff",
    allowedTypes: [
      "Lab Report",
      "ECG Report",
    ],
  },

  nurse: {
    label: "Nurse",
    allowedTypes: [
      "Care Observation",
      "Clinical Note",
    ],
  },

  receptionist: {
    label: "Receptionist",
    allowedTypes: [
      "Clinical Note",
    ],
  },
};

const roleAccess = (req, res, next) => {
  const role = req.headers["x-user-role"];

  if (!role || !ROLE_PERMISSIONS[role]) {
    return res.status(403).json({
      success: false,
      message: "Valid healthcare staff role is required",
      code: "ROLE_REQUIRED",
    });
  }

  req.userRole = role;
  req.rolePermissions = ROLE_PERMISSIONS[role];

  next();
};

module.exports = {
  ROLE_PERMISSIONS,
  roleAccess,
};