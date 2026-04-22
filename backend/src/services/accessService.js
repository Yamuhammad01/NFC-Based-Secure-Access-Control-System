/**
 * Access Service
 * Encapsulates the core access control business logic.
 * Called by accessController.handleTap().
 *
 * Pipeline:
 *   1. validateReader(readerId)    — Reader exists & is online
 *   2. lookupCard(uid)             — Card exists in DB
 *   3. checkCardStatus(card)       — Card.status === 'active'
 *   4. checkRolePermission(user, reader) — User role in reader.allowedRoles
 *   5. checkTimeWindow(reader)     — Current time within reader.accessSchedule
 *   6. checkAntiPassback(user, reader)   — Last direction ≠ current direction
 *   7. createAccessLog(...)        — Persist the result
 */

// TODO: Implement each step as an exported function
module.exports = {};
