const ALLOWLIST_ENV = "TIMEBACK_ORG_ALLOWLIST";

let cachedAllowlist: Set<string> | null = null;

function parseAllowlist(): Set<string> {
  const raw = process.env[ALLOWLIST_ENV];
  if (!raw) {
    return new Set();
  }
  const ids = raw
    .split(",")
    .map((value) => value.trim())
    .filter((value) => value.length > 0);
  return new Set(ids);
}

export function getAllowedTimebackOrgs(): Set<string> {
  if (cachedAllowlist === null) {
    cachedAllowlist = parseAllowlist();
  }
  return cachedAllowlist;
}

export function resetAllowedTimebackOrgs(): void {
  cachedAllowlist = null;
}

export function isOrgAllowed(orgId: string | null | undefined): boolean {
  if (!orgId) {
    return false;
  }
  const allowlist = getAllowedTimebackOrgs();
  if (allowlist.size === 0) {
    return true;
  }
  return allowlist.has(orgId);
}
