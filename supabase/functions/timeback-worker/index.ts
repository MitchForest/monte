import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const API_URL = Deno.env.get("API_URL");
const WORKER_TOKEN = Deno.env.get("TIMEBACK_WORKER_TOKEN");

if (!API_URL || !WORKER_TOKEN) {
  throw new Error("API_URL and TIMEBACK_WORKER_TOKEN must be set via `supabase functions secrets set`.");
}

console.info("timeback worker function ready");

Deno.serve(async () => {
  try {
    const response = await fetch(`${API_URL}/timeback-events/process`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${WORKER_TOKEN}`,
      },
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error("Worker call failed", response.status, errorBody);
      return new Response(
        JSON.stringify({
          status: "error",
          message: `Worker failed (${response.status})`,
          body: errorBody,
        }),
        { status: 500, headers: { "Content-Type": "application/json" } },
      );
    }

    const payload = await response.json();
    console.info("Worker run complete", payload);

    return new Response(JSON.stringify({ status: "ok", payload }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Worker invocation error", error);
    return new Response(
      JSON.stringify({
        status: "error",
        message: error instanceof Error ? error.message : String(error),
      }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
});