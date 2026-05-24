const INVITATION_TTL_MS = 30 * 60 * 1000;

export const createExpiry = () => new Date(Date.now() + INVITATION_TTL_MS);
