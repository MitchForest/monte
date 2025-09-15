// TODO: Replace with Better Auth handler once configured
export function GET() {
  return Response.json({ ok: true, auth: "not-configured" });
}

export function POST() {
  return Response.json({ ok: true, auth: "not-configured" });
}
