import "server-only";
import { cookies } from "next/headers";

import { COOKIE, type Session } from "./index";

/** Read the Cyber session cookie (set by /auth/callback).
 *  Returns null if missing or malformed. Does NOT verify expiry. */
export async function getSession(): Promise<Session | null> {
  const raw = (await cookies()).get(COOKIE.session)?.value;
  if (!raw) return null;
  try {
    const s = JSON.parse(raw) as Session;
    if (!s.access_token) return null;
    return s;
  } catch {
    return null;
  }
}
