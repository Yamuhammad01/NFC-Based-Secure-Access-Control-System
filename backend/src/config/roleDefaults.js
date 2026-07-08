/**
 * Default role-based permissions derived from accessAreas.js
 * 
 * - Admin: All areas (empty array = all)
 * - Staff: Areas where staffAccess === true
 * - Student: Areas where studentAccess === true
 */

const ACCESS_AREAS_DEFAULTS = {
  student: [
    "library",
    "cafeteria",
    "medical-centre",
    "student-affairs",
  ],

  staff: [
    "library",
    "cafeteria",
    "medical-centre",
    "student-affairs",
    "dept-admin-office",
    "registry-office",
    "bursary-office",
    "hr-office",
    "staff-meeting-room",
    "senate-building",
    "academic-planning",
  ],

  // Admin has implicit access to all areas (no restrictions)
  admin: [],
};

module.exports = ACCESS_AREAS_DEFAULTS;