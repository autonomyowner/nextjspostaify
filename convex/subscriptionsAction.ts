"use node";

import { v } from "convex/values";
import { action } from "./_generated/server";
import { api, internal } from "./_generated/api";

// Helper for Stripe API calls
async function stripeRequest(
  endpoint: string,
  secretKey: string,
  method: "GET" | "POST" = "POST",
  body?: Record<string, any>
): Promise<any> {
  const url = `https://api.stripe.com/v1${endpoint}`;
  const headers: Record<string, string> = {
    Authorization: `Bearer ${secretKey}`,
    "Content-Type": "application/x-www-form-urlencoded",
  };

  const options: RequestInit = { method, headers };

  if (body) {
    const formBody = new URLSearchParams();
    const flatten = (obj: any, prefix = "") => {
      for (const [key, value] of Object.entries(obj)) {
        const fullKey = prefix ? `${prefix}[${key}]` : key;
        if (value !== null && typeof value === "object" && !Array.isArray(value)) {
          flatten(value, fullKey);
        } else if (Array.isArray(value)) {
          value.forEach((item, idx) => {
            if (typeof item === "object") {
              flatten(item, `${fullKey}[${idx}]`);
            } else {
              formBody.append(`${fullKey}[${idx}]`, String(item));
            }
          });
        } else if (value !== undefined && value !== null) {
          formBody.append(fullKey, String(value));
        }
      }
    };
    flatten(body);
    options.body = formBody.toString();
  }

  const response = await fetch(url, options);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error?.message || `Stripe API error: ${response.status}`);
  }

  return data;
}

// Helper to get Stripe customer ID from database
async function getStripeCustomerId(ctx: any, clerkId: string): Promise<string | null> {
  const user = await ctx.runQuery(internal.internal.getUserByClerkId, { clerkId });
  return user?.stripeCustomerId || null;
}

// Create Stripe checkout session
export const createCheckout = action({
  args: {
    plan: v.union(v.literal("PRO"), v.literal("BUSINESS")),
    successUrl: v.optional(v.string()),
    cancelUrl: v.optional(v.string()),
    clerkId: v.optional(v.string()), // Fallback for auth
  },
  handler: async (ctx, args) => {
    // Try Convex auth first, fall back to clerkId
    const identity = await ctx.auth.getUserIdentity();
    const userClerkId = identity?.subject || args.clerkId;

    if (!userClerkId) {
      throw new Error("Not authenticated");
    }

    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecretKey) {
      throw new Error("Stripe is not configured");
    }

    const proPriceId = process.env.STRIPE_PRICE_PRO;
    const businessPriceId = process.env.STRIPE_PRICE_BUSINESS;

    const priceId = args.plan === "PRO" ? proPriceId : businessPriceId;
    if (!priceId) {
      throw new Error(`Price not configured for plan: ${args.plan}`);
    }

    // Get user
    const user = await ctx.runQuery(api.users.getByClerkId, { clerkId: userClerkId });
    if (!user) {
      throw new Error("User not found. Please refresh the page.");
    }

    // Get or create Stripe customer
    let customerId = user._id ? await getStripeCustomerId(ctx, userClerkId) : null;

    if (!customerId) {
      // Search for existing customer by email
      const existingCustomers = await stripeRequest(
        `/customers?email=${encodeURIComponent(user.email)}&limit=1`,
        stripeSecretKey,
        "GET"
      );

      if (existingCustomers.data && existingCustomers.data.length > 0) {
        customerId = existingCustomers.data[0].id;
      } else {
        // Create new customer
        const customerParams: Record<string, any> = { email: user.email };
        if (user.name) customerParams.name = user.name;

        const customer = await stripeRequest("/customers", stripeSecretKey, "POST", customerParams);
        customerId = customer.id;
      }
    }

    const frontendUrl = process.env.FRONTEND_URL || "https://postaify.app";
    const successUrl = args.successUrl || `${frontendUrl}/dashboard?success=true`;
    const cancelUrl = args.cancelUrl || `${frontendUrl}/pricing?cancelled=true`;

    // Create checkout session
    const sessionParams: Record<string, any> = {
      mode: "subscription",
      "payment_method_types[0]": "card",
      "line_items[0][price]": priceId,
      "line_items[0][quantity]": 1,
      success_url: successUrl,
      cancel_url: cancelUrl,
      "metadata[clerkId]": userClerkId,
      "metadata[priceId]": priceId,
    };

    if (customerId) {
      sessionParams.customer = customerId;
    } else {
      sessionParams.customer_email = user.email;
    }

    const session = await stripeRequest("/checkout/sessions", stripeSecretKey, "POST", sessionParams);

    if (!session.url) {
      throw new Error("Failed to create checkout session");
    }

    return { url: session.url };
  },
});

// Create Stripe billing portal session
export const createPortal = action({
  args: {
    returnUrl: v.optional(v.string()),
    clerkId: v.optional(v.string()), // Fallback for auth
  },
  handler: async (ctx, args) => {
    // Try Convex auth first, fall back to clerkId
    const identity = await ctx.auth.getUserIdentity();
    const userClerkId = identity?.subject || args.clerkId;

    if (!userClerkId) {
      throw new Error("Not authenticated");
    }

    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecretKey) {
      throw new Error("Stripe is not configured");
    }

    // Get user with Stripe customer ID
    const user = await ctx.runQuery(api.users.getByClerkId, { clerkId: userClerkId });
    if (!user) {
      throw new Error("User not found. Please refresh the page.");
    }

    const customerId = await getStripeCustomerId(ctx, userClerkId);
    if (!customerId) {
      throw new Error("No active subscription");
    }

    const frontendUrl = process.env.FRONTEND_URL || "https://postaify.app";
    const returnUrl = args.returnUrl || `${frontendUrl}/dashboard`;

    const session = await stripeRequest("/billing_portal/sessions", stripeSecretKey, "POST", {
      customer: customerId,
      return_url: returnUrl,
    });

    return { url: session.url };
  },
});
