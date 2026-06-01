"use client";

/**
 * Simple client‑side helper to check if the auth JWT cookie exists.
 * This is deliberately lightweight – we only need to know whether the
 * cookie named `auth_token` is present. Full verification happens server‑side
 * (e.g., via middleware or API routes).
 */
export function isAuthenticated(): boolean {
  if (typeof document === 'undefined') return false;
  return (
    document.cookie.includes('next-auth.session-token') ||
    document.cookie.includes('__Secure-next-auth.session-token')
  );
}
