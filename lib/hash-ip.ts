import { createHash } from "node:crypto";

/** Privacy-preserving fingerprint; requires VISITOR_IP_SALT in env. */
export function hashIp(ip: string | null): string | null {
  const salt = process.env.VISITOR_IP_SALT;
  if (!ip || !salt) return null;
  return createHash("sha256").update(`${salt}:${ip}`).digest("hex");
}
