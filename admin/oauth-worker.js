/**
 * Oh! Gift — GitHub OAuth worker for the /admin CMS (Decap CMS)
 * ================================================================
 *
 * A tiny Cloudflare Worker that lets you log in to the admin page with
 * your GitHub account without running any server.  Free tier, no
 * subdomain needed on coai.international.
 *
 * --------------------------------------------------------------
 * ONE-TIME SETUP (about 10 minutes)
 * --------------------------------------------------------------
 * 1. Cloudflare account (free): dash.cloudflare.com → sign up.
 *
 * 2. Workers & Pages → Create → Worker → name it e.g. "ohgift-cms-auth"
 *    → Deploy → Edit code → paste THIS file → Deploy.
 *
 * 3. GitHub OAuth App:
 *    github.com → Settings → Developer settings (bottom) → OAuth Apps
 *    → New OAuth App:
 *        Application name:        Oh! Gift CMS
 *        Homepage URL:            https://ohgift.coai.international
 *        Authorization callback:  https://ohgift-cms-auth.<your-name>.workers.dev/callback
 *       (use YOUR worker URL from step 2)
 *    → Register → copy the Client ID → "Generate a new client secret"
 *      → copy the secret.
 *
 * 4. In the Cloudflare worker → Settings → Variables & Secrets → add:
 *        GITHUB_CLIENT_ID      = your client id        (secret/variable)
 *        GITHUB_CLIENT_SECRET  = your client secret    (mark as SECRET)
 *        ALLOWED_DOMAINS       = ohgift.coai.international
 *          (comma-separated hosts allowed to open the admin; add
 *           "localhost" too if you want to test the CMS locally)
 *
 * 5. In this repo, open admin/config.yml and replace the base_url
 *    placeholder with your real worker URL. Commit.
 *
 * 6. Visit https://ohgift.coai.international/admin → "Log in with GitHub".
 *    Later, when Oh! Gift gets its own domain: change site_url in
 *    admin/config.yml, ALLOWED_DOMAINS on the worker, and the GitHub
 *    OAuth App's Homepage URL. The callback URL never changes.
 */

const HTML_SHELL =
  "<!doctype html><html><head><meta charset='utf-8'>" +
  "<meta name='viewport' content='width=device-width,initial-scale=1'>" +
  "<title>Oh! Gift — authorising</title></head><body style='" +
  "font-family:system-ui;min-height:60vh;display:grid;place-items:center;" +
  "color:#6B605C'>__BODY__</body></html>";

const HTML_HEADERS = {
  "Content-Type": "text/html; charset=utf-8",
  "Cache-Control": "no-store",
  "Referrer-Policy": "no-referrer",
};

function page(body) {
  return HTML_SHELL.replace("__BODY__", body);
}

/* Runs inside the popup: tells the admin page we started, then hops
   over to GitHub. `__TARGET__` = the admin site's origin so the token
   is only ever handed back to pages we allow. */
function authPage(provider, authorizeUrl, targetOrigin) {
  return page(
    "<script>" +
      "try{window.opener&&window.opener.postMessage('authorizing:" +
      provider + "','" + targetOrigin + "')}catch(e){}" +
      "location.replace('" + authorizeUrl + "');" +
    "<\/script>" +
    "<p>Redirecting to GitHub&hellip; " +
    "<a href='" + authorizeUrl + "'>Click here</a> if you are stuck.</p>"
  );
}

/* Reports success/failure to the admin page via postMessage, then closes
   the popup. Message format is what Decap's NetlifyAuthenticator expects:
     authorizing:<provider>
     authorization:<provider>:success:<JSON>
     authorization:<provider>:error:<JSON>   */
function callbackPage(provider, bodyJSON, ok) {
  var kind = ok ? "success" : "error";
  /* Content first, script last — the script annotates the visible
     "diag" paragraph with the real delivery outcome, so a silent
     postMessage failure can't masquerade as success. */
  return page(
    "<p>" + (ok ? "Authorised." : "Login failed — this window can be closed.") + "</p>" +
    "<p id='diag' style='font-size:13px;color:#8C1116;max-width:340px'>Checking&hellip;</p>" +
    "<script>" +
      "var delivered=false;" +
      "try{if(window.opener&&window.opener.postMessage){window.opener.postMessage('authorization:" +
      provider + ":" + kind + ":'" + bodyJSON + ",'*');delivered=true}}catch(e){}" +
      "var el=document.getElementById('diag');" +
      "el.textContent = delivered " +
        "? 'Delivered to the admin page — it should now log you in. Closing this window.' " +
        ": 'PROBLEM: could not reach the admin page (the login window opened without a link back). Leave this window open and report the exact text you see here.';" +
      "setTimeout(function(){window.close()},delivered?400:20000);" +
    "<\/script>"
  );
}

function jsonErr(status, message) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}

/* Only these scopes can be requested — never let the query widen it. */
const ALLOWED_SCOPES = ["repo", "public_repo", "read:user", "user"];

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const clientId = env.GITHUB_CLIENT_ID;
    const clientSecret = env.GITHUB_CLIENT_SECRET;
    const allowed = String(env.ALLOWED_DOMAINS || "")
      .split(",").map((s) => s.trim().toLowerCase()).filter(Boolean);
    const provider = "github";

    if (!clientId || !clientSecret) {
      return jsonErr(500, "GITHUB_CLIENT_ID / GITHUB_CLIENT_SECRET not set on this worker");
    }

    /* ---------- GET /  — status page ---------- */
    if (url.pathname === "/") {
      return new Response(page("<h2 style='color:#2A2422'>Oh! Gift auth worker</h2>" +
                  "<p>Deployed and running.</p>"), { headers: HTML_HEADERS });
    }

    /* ---------- GET /auth — visitor clicked "Log in" ---------- */
    if (url.pathname === "/auth") {
      /* Only allow admin pages whose host is on the allowlist. */
      const siteId = (url.searchParams.get("site_id") || "").toLowerCase();
      if (allowed.length && !allowed.includes(siteId)) {
        return jsonErr(403, "Host '" + siteId + "' is not allowed to use this worker");
      }
      const targetOrigin = siteId && !siteId.startsWith("localhost:")
        ? "https://" + siteId.replace(/:\d+$/, "")
        : "https://" + siteId;

      let scope = url.searchParams.get("scope") || "repo";
      if (!ALLOWED_SCOPES.includes(scope)) scope = "repo";

      const state = crypto.randomUUID();
      const authorizeUrl = new URL("https://github.com/login/oauth/authorize");
      authorizeUrl.searchParams.set("client_id", clientId);
      authorizeUrl.searchParams.set("scope", scope);
      authorizeUrl.searchParams.set("state", state);
      authorizeUrl.searchParams.set(
        "redirect_uri", url.origin + "/callback");

      return new Response(authPage(provider, authorizeUrl.href, targetOrigin), {
        headers: Object.assign({}, HTML_HEADERS, {
          "Set-Cookie":
            "ohgift_oauth_state=" + state +
            "; Max-Age=600; Path=/; Secure; HttpOnly; SameSite=Lax",
        }),
      });
    }

    /* ---------- GET /callback — GitHub sent the user back ---------- */
    if (url.pathname === "/callback") {
      const code = url.searchParams.get("code");
      const state = url.searchParams.get("state") || "";
      const cookieState = (request.headers.get("Cookie") || "")
        .split(";").map((c) => c.trim())
        .find((c) => c.startsWith("ohgift_oauth_state="));

      if (!code) {
        return new Response(callbackPage(provider,
          "JSON.stringify({error:'denied',error_description:'Login was cancelled or denied'})",
          false), { headers: HTML_HEADERS });
      }
      if (!cookieState || cookieState.slice("ohgift_oauth_state=".length) !== state) {
        return new Response(callbackPage(provider,
          "JSON.stringify({error:'state_mismatch',error_description:'Security check failed — please try again'})",
          false), { headers: HTML_HEADERS });
      }

      const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
        method: "POST",
        headers: { "Content-Type": "application/json",
                   "Accept": "application/json" },
        body: JSON.stringify({
          client_id: clientId,
          client_secret: clientSecret,
          code,
          redirect_uri: url.origin + "/callback",
        }),
      });
      const tokenData = await tokenRes.json();

      if (!tokenData.access_token) {
        return new Response(callbackPage(provider,
          "JSON.stringify({error:'token_exchange',error_description:" +
          JSON.stringify(tokenData.error_description || "GitHub did not return a token") + "})",
          false), { headers: HTML_HEADERS });
      }

      const payload = JSON.stringify({
        token: tokenData.access_token,
        provider,
      });
      return new Response(callbackPage(provider, "'" + payload + "'", true),
        { headers: HTML_HEADERS });
    }

    return jsonErr(404, "Not found");
  },
};