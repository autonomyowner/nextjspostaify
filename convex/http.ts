import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { authComponent, createAuth } from "./auth";

const http = httpRouter();

// CORS headers for auth routes
const corsHeaders = {
  "Access-Control-Allow-Origin": "https://www.postaify.com",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With",
  "Access-Control-Allow-Credentials": "true",
};

// Handle OPTIONS preflight requests for auth routes
http.route({
  path: "/api/auth/get-session",
  method: "OPTIONS",
  handler: httpAction(async () => {
    return new Response(null, { status: 204, headers: corsHeaders });
  }),
});

http.route({
  path: "/api/auth/sign-in/email",
  method: "OPTIONS",
  handler: httpAction(async () => {
    return new Response(null, { status: 204, headers: corsHeaders });
  }),
});

http.route({
  path: "/api/auth/sign-up/email",
  method: "OPTIONS",
  handler: httpAction(async () => {
    return new Response(null, { status: 204, headers: corsHeaders });
  }),
});

http.route({
  path: "/api/auth/sign-in/social",
  method: "OPTIONS",
  handler: httpAction(async () => {
    return new Response(null, { status: 204, headers: corsHeaders });
  }),
});

http.route({
  path: "/api/auth/sign-out",
  method: "OPTIONS",
  handler: httpAction(async () => {
    return new Response(null, { status: 204, headers: corsHeaders });
  }),
});

// Better Auth routes
authComponent.registerRoutes(http, createAuth);

// Stripe webhook handler
http.route({
  path: "/webhooks/stripe",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!stripeSecretKey || !stripeWebhookSecret) {
      return new Response("Stripe not configured", { status: 501 });
    }

    const signature = request.headers.get("stripe-signature");
    if (!signature) {
      return new Response("Missing stripe-signature header", { status: 400 });
    }

    const payload = await request.text();

    // Parse the event - in production, verify signature
    let event: any;
    try {
      event = JSON.parse(payload);
    } catch (err) {
      return new Response("Invalid payload", { status: 400 });
    }

    // Helper to get plan from price ID
    const getPlanFromPriceId = (priceId: string): "FREE" | "PRO" | "BUSINESS" => {
      const proPriceId = process.env.STRIPE_PRICE_PRO;
      const businessPriceId = process.env.STRIPE_PRICE_BUSINESS;
      if (priceId === proPriceId) return "PRO";
      if (priceId === businessPriceId) return "BUSINESS";
      return "FREE";
    };

    // Handle different event types
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;

        if (
          session.mode === "subscription" &&
          session.customer &&
          session.subscription
        ) {
          const customerId = session.customer;

          // Get price ID from session line items or subscription
          const priceId = session.metadata?.priceId;

          if (priceId) {
            const plan = getPlanFromPriceId(priceId);

            // Try to find user by userId from metadata first
            const userId = session.metadata?.userId;
            if (userId) {
              await ctx.runMutation(internal.users.updateUserPlanById, {
                userId,
                plan,
              });

              await ctx.runMutation(internal.users.setStripeCustomerIdById, {
                userId,
                stripeCustomerId: customerId,
              });

              console.log(`User ${userId} upgraded to ${plan}`);
            } else if (session.customer_email) {
              const user = await ctx.runQuery(internal.internal.getUserByEmail, {
                email: session.customer_email,
              });

              if (user) {
                await ctx.runMutation(internal.users.updateUserPlanById, {
                  userId: user._id,
                  plan,
                });

                await ctx.runMutation(internal.users.setStripeCustomerIdById, {
                  userId: user._id,
                  stripeCustomerId: customerId,
                });

                console.log(`User ${user.email} upgraded to ${plan}`);
              }
            }
          }
        }
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object;
        const customerId = subscription.customer;
        const priceId = subscription.items?.data[0]?.price?.id;

        if (priceId) {
          const plan = getPlanFromPriceId(priceId);

          await ctx.runMutation(internal.users.updateUserPlan, {
            stripeCustomerId: customerId,
            plan,
          });

          console.log(`Subscription updated for customer ${customerId}: ${plan}`);
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object;
        const customerId = subscription.customer;

        await ctx.runMutation(internal.users.updateUserPlan, {
          stripeCustomerId: customerId,
          plan: "FREE",
        });

        console.log(`Subscription cancelled for customer ${customerId}`);
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object;
        console.log(`Payment failed for customer ${invoice.customer}`);
        break;
      }

      default:
        console.log(`Unhandled Stripe event type: ${event.type}`);
    }

    return new Response(JSON.stringify({ received: true }), { status: 200 });
  }),
});

// ============================================================
// Clip render route — serves clip HTML for Browserless recording
// URL: /clip-render/{clipId}?token={hmac}
// ============================================================

async function computeHmac(data: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(data));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function prepareClipHtml(html: string, voiceoverUrl?: string | null): string {
  let h = html;

  // Remove Google Fonts @import (external requests may be slow/blocked)
  h = h.replace(/@import url\([^)]*\);?/g, "");

  // Remove the viewport-scaling script (resizes for browser preview, not needed for fixed viewport)
  h = h.replace(
    /\(function\(\)\s*\{\s*var canvas = document\.getElementById\('video-canvas'\)[\s\S]*?}\)\(\);/,
    ""
  );

  const overrideCSS = `
    /* Render overrides */
    * { margin: 0; padding: 0; }
    body, html { width: 1080px; height: 1920px; overflow: hidden; }
    .page-wrapper { padding: 0 !important; width: 1080px !important; height: 1920px !important; overflow: hidden !important; }
    .capture-frame { border: none !important; border-radius: 0 !important; }
    .capture-label, .capture-dimensions { display: none !important; }
    #controls { display: none !important; }
    #video-canvas { transform: none !important; width: 1080px !important; height: 1920px !important; }
    body, * { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif !important; }
  `;
  h = h.replace("</style>", `${overrideCSS}\n</style>`);

  // Inject voiceover audio if available
  if (voiceoverUrl) {
    h = h.replace(
      "</body>",
      `<audio autoplay src="${voiceoverUrl}"></audio>\n</body>`
    );
  }

  return h;
}

http.route({
  pathPrefix: "/clip-render/",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    const url = new URL(request.url);
    const pathParts = url.pathname.split("/").filter(Boolean);
    // pathParts = ["clip-render", "<clipId>"]
    const clipId = pathParts[pathParts.length - 1];
    const token = url.searchParams.get("token");

    if (!clipId || !token) {
      return new Response("Missing clipId or token", { status: 400 });
    }

    // Verify HMAC token
    const secret = process.env.BETTER_AUTH_SECRET;
    if (!secret) {
      return new Response("Server misconfigured", { status: 500 });
    }

    const expected = await computeHmac(clipId, secret);
    if (expected !== token) {
      return new Response("Forbidden", { status: 403 });
    }

    // Fetch clip via internal query
    const clip = await ctx.runQuery(internal.clips.getByIdInternal, {
      id: clipId as any,
    });
    if (!clip || !clip.htmlContent) {
      return new Response("Clip not found", { status: 404 });
    }

    // Get voiceover URL if present
    let voiceoverUrl: string | null = null;
    if (clip.voiceoverStorageId) {
      voiceoverUrl = await ctx.storage.getUrl(clip.voiceoverStorageId as any);
    }

    // Prepare HTML for headless recording
    const html = prepareClipHtml(clip.htmlContent, voiceoverUrl);

    return new Response(html, {
      status: 200,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  }),
});

// Telegram webhook handler
http.route({
  path: "/webhooks/telegram",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    if (!botToken) {
      return new Response("Telegram bot not configured", { status: 501 });
    }

    const body = await request.json();

    // Helper to send Telegram message
    const sendMessage = async (chatId: string, text: string) => {
      await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text,
          parse_mode: "HTML",
        }),
      });
    };

    // Handle incoming messages
    if (body.message) {
      const chatId = String(body.message.chat.id);
      const text = body.message.text || "";

      // Handle /start command (linking account)
      if (text.startsWith("/start")) {
        const linkCode = text.split(" ")[1];

        if (linkCode) {
          // Parse the link token to get userId
          try {
            const payload = atob(linkCode.replace(/-/g, "+").replace(/_/g, "/"));
            const [userId, timestamp] = payload.split(":");

            // Check if token is expired (24 hours)
            const tokenAge = Date.now() - parseInt(timestamp);
            if (tokenAge > 24 * 60 * 60 * 1000) {
              await sendMessage(chatId, "This link has expired. Please generate a new one from your dashboard.");
            } else {
              // Link the account
              await ctx.runMutation(internal.telegram.linkAccountById, {
                userId,
                telegramChatId: chatId,
              });
              await sendMessage(chatId, "Your account has been linked successfully! You will now receive notifications here.");
            }
          } catch {
            await sendMessage(chatId, "Invalid link code. Please try again from your dashboard.");
          }
        } else {
          await sendMessage(
            chatId,
            "Welcome to POSTAIFY Bot! To link your account, use the link button in your dashboard."
          );
        }
      }
      // Handle /status command
      else if (text === "/status") {
        const user = await ctx.runQuery(internal.internal.getUserByTelegramChatId, {
          telegramChatId: chatId,
        });

        if (user) {
          await sendMessage(
            chatId,
            `Connected to: ${user.email}\nNotifications: ${user.telegramEnabled ? "Enabled" : "Disabled"}`
          );
        } else {
          await sendMessage(
            chatId,
            "Your account is not linked. Visit your POSTAIFY dashboard to connect."
          );
        }
      }
      // Handle /disconnect command
      else if (text === "/disconnect") {
        const user = await ctx.runQuery(internal.internal.getUserByTelegramChatId, {
          telegramChatId: chatId,
        });

        if (user) {
          await ctx.runMutation(internal.telegram.disconnectByWebhook, {
            telegramChatId: chatId,
          });
          await sendMessage(
            chatId,
            "Your account has been disconnected from POSTAIFY."
          );
        } else {
          await sendMessage(
            chatId,
            "No account is linked to disconnect."
          );
        }
      }
    }

    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  }),
});

export default http;
