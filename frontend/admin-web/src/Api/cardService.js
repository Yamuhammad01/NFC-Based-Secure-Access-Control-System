/**
 * cardService.js
 * Dedicated API service for the NFC Card Management module.
 * All requests go through the shared apiClient (axios instance with auth headers).

 */
import api from "./apiClient";

const BASE = "/cards";

// ─── Read ─────────────────────────────────────────────────────────────────────

/** Fetch all NFC card records with populated user info. */
export const getAllCards = async () => {
  const res = await api.get(BASE);
  return res.data;
};

/** Fetch a single card by its MongoDB _id. */
export const getCardById = async (id) => {
  const res = await api.get(`${BASE}/${id}`);
  return res.data;
};

/** Fetch cards not linked to any user account. */
export const getUnlinkedCards = async () => {
  const res = await api.get(`${BASE}/unlinked`);
  return res.data;
};

// ─── Create ───────────────────────────────────────────────────────────────────

/**
 * Register / issue a new NFC card.
 * @param {{ uid: string, name: string, role?: string, accessLevel?: number, allowedTime?: object, userRef?: string }} data
 */
export const createCard = async (data) => {
  const res = await api.post(BASE, data);
  return res.data;
};

// ─── Update ───────────────────────────────────────────────────────────────────

/** Generic field update (name, role, accessLevel, allowedTime, status). */
export const updateCard = async (id, data) => {
  const res = await api.put(`${BASE}/${id}`, data);
  return res.data;
};

// ─── Lifecycle Actions ────────────────────────────────────────────────────────

/**
 * Replace a card. Backend revokes the old card and creates a fresh NfcCardInfo
 * document for the new UID.
 * @param {string} id  — _id of the old card to replace
 * @param {string} newUid — UID of the physical replacement card
 */
export const replaceCard = async (id, newUid) => {
  const res = await api.put(`${BASE}/${id}/replace`, { uid: newUid });
  return res.data;
};

/**
 * Revoke a card with a mandatory reason.
 * @param {string} id
 * @param {"lost"|"stolen"|"damaged"|"misuse"} reason
 */
export const revokeCard = async (id, reason) => {
  const res = await api.put(`${BASE}/${id}/revoke`, { reason });
  return res.data;
};

/** Temporarily suspend a card (blocks access without revoking). */
export const suspendCard = async (id) => {
  const res = await api.put(`${BASE}/${id}/suspend`);
  return res.data;
};

/** Reactivate a previously revoked or suspended card. */
export const reactivateCard = async (id) => {
  const res = await api.put(`${BASE}/${id}/reactivate`);
  return res.data;
};

/** Link a card to a user account. */
export const linkCardToUser = async (id, userRef) => {
  const res = await api.put(`${BASE}/${id}/link`, { userRef });
  return res.data;
};

/** Soft-delete / deactivate a card (legacy, same as suspend). */
export const deactivateCard = async (id) => {
  const res = await api.delete(`${BASE}/${id}`);
  return res.data;
};
