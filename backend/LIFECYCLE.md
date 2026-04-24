# Card & User Lifecycle Management

This document outlines the operational procedures for managing NFC credentials and user states within the Secure Access Control System.

## 1. Credential States (Status)

- **Active**: The user is authorized to use their NFC credential within their assigned `allowedTime` and `accessLevel`.
- **Suspended**: Temporary revocation of access. The credential remains assigned to the user, but all access requests will be denied. Used for disciplinary actions or temporary leaves.
- **Revoked**: Permanent revocation of the current credential. Used when a card is reported lost or stolen.

## 2. Operational Scenarios

### Lost or Stolen Card
1.  **Action**: Immediately change the user's `status` to `revoked`.
2.  **Result**: Any attempt to use the old `uid` will be denied and logged with the reason "revoked".
3.  **Process**:
    - Locate User by previous `uid` or `name`.
    - Set `status: "revoked"`.
    - Log the revocation event.

### Card Replacement
1.  **Action**: Assign a new `uid` to the user and reset status to `active`.
2.  **Result**: The user can now access facilities with the new card. The old `uid` is no longer associated with the user record.
3.  **Process**:
    - Update the User record with the new `uid`.
    - Set `status: "active"`.
    - Ensure `isInside` is reset to `false` (optional, depends on policy).

### Leaving the University (Offboarding)
1.  **Action**: Deactivate the user record.
2.  **Result**: Access is permanently denied. The record is kept for historical logging purposes but marked inactive.
3.  **Process**:
    - Set `status: "revoked"` or delete the user record.
    - If `isInside` is `true`, flag for manual investigation (user did not swipe out).

## 3. Anti-Passback Logic (`isInside`)

The `isInside` flag prevents a single card from being used to "tailgate" or be passed back to another person.
- **Entry**: Only permitted if `isInside` is `false`. Upon successful entry, `isInside` becomes `true`.
- **Exit**: Only permitted if `isInside` is `true`. Upon successful exit, `isInside` becomes `false`.
- **Violation**: If a user tries to enter while `isInside` is already `true`, the system denies access and logs an "Anti-Passback Violation".
