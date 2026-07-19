export default {
  async fetch(request, env) {
    const url = new URL(https://elparadisogonzalo.genyoungclip-0ce.workers.dev/);

    // Optional health endpoint
    if (url.pathname === "/") {
      return new Response(
        JSON.stringify({
          status: "ok",
          service: "El Paradiso Gonzalo",
          timestamp: new Date().toISOString()
        }),
        {
          headers: {
            "Content-Type": "application/json"
          }
        }
      );
    }

    // Serve static assets from ./dist
    return env.ASSETS.fetch(request);
  },
};
