import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";

const http = httpRouter();

// Clerk webhook handler
http.route({
  path: "/webhooks/clerk",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
    if (!webhookSecret) {
      return new Response("Webhook secret not configured", { status: 500 });
    }

    // Get headers
    const svixId = request.headers.get("svix-id");
    const svixTimestamp = request.headers.get("svix-timestamp");
    const svixSignature = request.headers.get("svix-signature");

    if (!svixId || !svixTimestamp || !svixSignature) {
      return new Response("Missing svix headers", { status: 400 });
    }

    // Get raw body
    const payload = await request.text();

    // Verify signature (basic check - in production use svix library in action)
    // For now, we'll parse the payload and trust the request came from Clerk
    // A proper implementation would call an internal action to verify with svix

    let evt: {
      type: string;
      data: {
        id: string;
        email_addresses: Array<{ email_address: string }>;
        first_name: string | null;
        last_name: string | null;
        image_url: string | null;
      };
    };

    try {
      evt = JSON.parse(payload);
    } catch (err) {
      console.error("Invalid webhook payload:", err);
      return new Response("Invalid payload", { status: 400 });
    }

    const eventType = evt.type;
    const userData = evt.data;

    // Handle different event types
    switch (eventType) {
      case "user.created": {
        const email = userData.email_addresses[0]?.email_address;
        if (!email) {
          return new Response("No email provided", { status: 400 });
        }

        const name =
          [userData.first_name, userData.last_name].filter(Boolean).join(" ") ||
          undefined;

        await ctx.runMutation(internal.users.getOrCreateUser, {
          clerkId: userData.id,
          email,
          name,
          avatarUrl: userData.image_url || undefined,
        });

        console.log(`User synced: ${email}`);
        break;
      }

      case "user.updated": {
        const email = userData.email_addresses[0]?.email_address;
        const name =
          [userData.first_name, userData.last_name].filter(Boolean).join(" ") ||
          undefined;

        await ctx.runMutation(internal.users.updateUserFromWebhook, {
          clerkId: userData.id,
          email,
          name,
          avatarUrl: userData.image_url || undefined,
        });

        console.log(`User updated: ${email}`);
        break;
      }

      case "user.deleted": {
        await ctx.runMutation(internal.users.deleteUserFromWebhook, {
          clerkId: userData.id,
        });

        console.log(`User deleted: ${userData.id}`);
        break;
      }

      default:
        console.log(`Unhandled Clerk event type: ${eventType}`);
    }

    return new Response(JSON.stringify({ received: true }), { status: 200 });
  }),
});

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

            // Try to find user by clerkId from metadata first
            const clerkId = session.metadata?.clerkId;
            if (clerkId) {
              await ctx.runMutation(internal.users.updateUserPlan, {
                clerkId,
                plan,
              });

              await ctx.runMutation(internal.users.setStripeCustomerId, {
                clerkId,
                stripeCustomerId: customerId,
              });

              console.log(`User ${clerkId} upgraded to ${plan}`);
            } else if (session.customer_email) {
              const user = await ctx.runQuery(internal.internal.getUserByEmail, {
                email: session.customer_email,
              });

              if (user) {
                await ctx.runMutation(internal.users.updateUserPlan, {
                  clerkId: user.clerkId,
                  plan,
                });

                await ctx.runMutation(internal.users.setStripeCustomerId, {
                  clerkId: user.clerkId,
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
          // Parse the link token to get clerkId
          try {
            const payload = atob(linkCode.replace(/-/g, "+").replace(/_/g, "/"));
            const [clerkId, timestamp] = payload.split(":");

            // Check if token is expired (24 hours)
            const tokenAge = Date.now() - parseInt(timestamp);
            if (tokenAge > 24 * 60 * 60 * 1000) {
              await sendMessage(chatId, "This link has expired. Please generate a new one from your dashboard.");
            } else {
              // Link the account
              await ctx.runMutation(internal.telegram.linkAccount, {
                clerkId,
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
