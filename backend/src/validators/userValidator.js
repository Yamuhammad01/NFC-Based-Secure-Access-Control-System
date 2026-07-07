const { body, validationResult } = require("express-validator");

// Common validation results handler middleware
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

const createUserValidator = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ min: 2, max: 100 })
    .withMessage("Name must be between 2 and 100 characters"),

  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email address")
    .normalizeEmail(),

  body("phone")
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ min: 7, max: 20 })
    .withMessage("Phone number must be between 7 and 20 digits"),

  body("staffId")
    .trim()
    .notEmpty()
    .withMessage("Staff/Matric number is required")
    .isLength({ min: 3, max: 30 })
    .withMessage("Staff/Matric number must be between 3 and 30 characters"),

  body("department")
    .trim()
    .notEmpty()
    .withMessage("Department is required"),

  body("role")
    .trim()
    .notEmpty()
    .withMessage("Role is required")
    .isIn(["admin", "staff", "student"])
    .withMessage("Role must be either admin, staff, or student"),

  body("uid")
    .optional({ checkFalsy: true })
    .trim()
    .toUpperCase()
    .custom((val) => {
      if (val && !/^NFC-[A-Z0-9]{7}$/i.test(val)) {
        throw new Error("Assigned UID must match system format (NFC- + 7 alphanumeric characters)");
      }
      return true;
    }),

  body("accessLevel")
    .optional()
    .isInt({ min: 1, max: 3 })
    .withMessage("Access Level must be 1, 2, or 3"),

  validate,
];

const updateUserValidator = [
  body("name")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Name cannot be empty")
    .isLength({ min: 2, max: 100 })
    .withMessage("Name must be between 2 and 100 characters"),

  body("email")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Email cannot be empty")
    .isEmail()
    .withMessage("Invalid email address")
    .normalizeEmail(),

  body("phone")
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ min: 7, max: 20 })
    .withMessage("Phone number must be between 7 and 20 digits"),

  body("staffId")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Staff/Matric number cannot be empty"),

  body("department")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Department cannot be empty"),

  body("role")
    .optional()
    .trim()
    .notEmpty()
    .isIn(["admin", "staff", "student"])
    .withMessage("Role must be either admin, staff, or student"),

  body("uid")
    .optional({ checkFalsy: true })
    .trim()
    .toUpperCase()
    .custom((val) => {
      if (val && !/^NFC-[A-Z0-9]{7}$/i.test(val)) {
        throw new Error("Assigned UID must match system format (NFC- + 7 alphanumeric characters)");
      }
      return true;
    }),

  body("cardStatus")
    .optional()
    .trim()
    .isIn(["active", "revoked", "suspended", "inactive"])
    .withMessage("Invalid Card Status"),

  body("accessLevel")
    .optional()
    .isInt({ min: 1, max: 3 })
    .withMessage("Access Level must be 1, 2, or 3"),

  validate,
];

module.exports = {
  createUserValidator,
  updateUserValidator,
};
