/**
 * Shared comment limits. Plain module (no "use server", no "server-only") so
 * both the comment actions and the composer can import it — a "use server"
 * file may only export async functions.
 */
export const MAX_COMMENT_LENGTH = 5000;
