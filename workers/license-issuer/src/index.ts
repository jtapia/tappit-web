/**
 * TappitX license issuer.
 *
 * Routes:
 *   POST /webhook           Stripe checkout.session.completed → issue license
 *   GET  /session/:id       masked confirmation for the /success page
 *   POST /validate          periodic license check from the macOS app
 *   POST /activate          bind license to a device (max 3)
 */

import type { Env } from "./env";
import { handleWebhook } from "./handlers/webhook";
import { handleSession } from "./handlers/session";
import { handleValidate } from "./handlers/validate";
import { handleActivate } from "./handlers/activate";

export type { Env };

export default {
  async fetch(req: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(req.url);
    const path = url.pathname;

    if (path === "/webhook") {
      return handleWebhook(req, env, ctx);
    }

    if (path === "/validate") {
      return handleValidate(req, env);
    }

    if (path === "/activate") {
      return handleActivate(req, env);
    }

    if (path.startsWith("/session/")) {
      const sessionId = path.slice("/session/".length);
      if (!sessionId) {
        return new Response("Bad request", { status: 400 });
      }
      return handleSession(req, env, sessionId);
    }

    return new Response("Not found", { status: 404 });
  },
};
