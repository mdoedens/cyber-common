/**
 * OIDC/PKCE helpers that don't touch Next.js server APIs.
 * Safe to import from client components.
 */

export type AuthConfig = {
  issuer: string;
  realm: string;
  clientId: string;
  /** Fallback origin when request host isn't available. */
  siteOrigin: string;
};

/** Build the common URL helpers from an AuthConfig. */
export function urls(cfg: AuthConfig) {
  const base = `${cfg.issuer}/realms/${cfg.realm}/protocol/openid-connect`;
  return {
    auth: () => `${base}/auth`,
    token: () => `${base}/token`,
    endSession: () => `${base}/logout`,
    register: () => `${base}/registrations`,
  };
}

export const COOKIE = {
  verifier: "cyber_verifier",
  state: "cyber_state",
  nextPath: "cyber_next",
  session: "cyber_session",
} as const;

/** Derive the `/auth/callback` URL from the live request host so it matches
 *  whichever TLD / subdomain the user landed on (cyberatp.com, app.cyberatp.com,
 *  app.cyberatp.nl, app-dev.cyberatp.com, ...). */
export function callbackUrlFor(
  host: string | null | undefined,
  fallbackOrigin: string,
): string {
  if (host) {
    return `https://${host.replace(/:\d+$/, "")}/auth/callback`;
  }
  return `${fallbackOrigin}/auth/callback`;
}

/** Cookie scope so session survives the hop between <domain> and app.<domain>.
 *  Strips any www/app/auth/dev/test subdomain prefix and returns `.domain.tld`.
 *  Returns undefined for unrecognised hosts (localhost etc.). */
export function cookieDomainFor(host: string): string | undefined {
  const cleaned = host.replace(/:\d+$/, "").toLowerCase();
  const m = cleaned.match(
    /^(?:(?:app|app-dev|app-test|auth|auth-dev|auth-test|www|dev|test)\.)?(cyberatp|cyberems)\.(com|nl|eu|app)$/,
  );
  if (!m) return undefined;
  return `.${m[1]}.${m[2]}`;
}

const b64url = (bytes: Uint8Array): string =>
  Buffer.from(bytes)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

/** Cryptographically-random URL-safe token (32 bytes by default). */
export function randomUrlToken(lenBytes = 32): string {
  const arr = new Uint8Array(lenBytes);
  crypto.getRandomValues(arr);
  return b64url(arr);
}

/** Build the PKCE S256 challenge from a verifier string. */
export async function pkceChallenge(verifier: string): Promise<string> {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(verifier),
  );
  return b64url(new Uint8Array(digest));
}

export type Session = {
  access_token: string;
  refresh_token?: string;
  id_token?: string;
  expires_at: number;
  sub?: string;
  email?: string;
  name?: string;
  roles?: string[];
};

/** Decode a JWT payload without verifying. Don't use for auth decisions. */
export function decodeJwt(jwt: string): Record<string, unknown> {
  const [, payload] = jwt.split(".");
  if (!payload) return {};
  const s = payload.replace(/-/g, "+").replace(/_/g, "/");
  const pad = s + "=".repeat((4 - (s.length % 4)) % 4);
  return JSON.parse(Buffer.from(pad, "base64").toString("utf8"));
}
