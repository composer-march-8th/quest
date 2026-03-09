var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// index.js
function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    }
  });
}
__name(jsonResponse, "jsonResponse");
function getCertificates(env) {
  try {
    return JSON.parse(env.CERTIFICATES_JSON || "{}");
  } catch {
    return {};
  }
}
__name(getCertificates, "getCertificates");
var index_default = {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (request.method === "OPTIONS") {
      return jsonResponse({ ok: true }, 204);
    }
    if (request.method !== "POST") {
      return jsonResponse({ error: "Method not allowed" }, 405);
    }
    let payload;
    try {
      payload = await request.json();
    } catch {
      return jsonResponse({ error: "Invalid JSON" }, 400);
    }
    const userId = String(payload.userId || "").trim().toLowerCase();
    if (!userId.startsWith("@") || userId.length < 2) {
      return jsonResponse({ error: "Invalid userId format" }, 400);
    }
    const certificates = getCertificates(env);
    const promoCode = certificates[userId];
    if (url.pathname === "/validate") {
      return jsonResponse({ allowed: Boolean(promoCode) });
    }
    if (url.pathname === "/certificate") {
      if (!promoCode) {
        return jsonResponse({ error: "User is not allowed" }, 403);
      }
      return jsonResponse({ promoCode });
    }
    return jsonResponse({ error: "Not found" }, 404);
  }
};
export {
  index_default as default
};
//# sourceMappingURL=index.js.map
