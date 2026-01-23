"use node";

import { v } from "convex/values";
import { action } from "./_generated/server";
import { internal } from "./_generated/api";

// Types for admin data
interface AdminStats {
  users: {
    total: number;
    free: number;
    pro: number;
    business: number;
    recentSignups: number;
  };
  content: {
    totalPosts: number;
    totalBrands: number;
  };
  emailCaptures: {
    total: number;
    withConsent: number;
    recentCaptures: number;
    consentRate: number;
  };
}

interface AdminUser {
  id: string;
  email: string;
  name: string | null;
  plan: string;
  brandsCount: number;
  postsCount: number;
  postsThisMonth: number;
  createdAt: number;
}

interface AdminEmailCapture {
  id: string;
  email: string;
  marketingConsent: boolean;
  source: string | null;
  planInterest: string | null;
  capturedAt: number;
}

interface AdminBotLead {
  id: string;
  email: string;
  sessionId: string;
  messageCount: number;
  messageHistory: Array<{ role: string; content: string }>;
  capturedAt: number;
  source: string;
}

// Helper to verify admin token
function verifyAdminToken(token: string): boolean {
  const adminUsername = process.env.ADMIN_USERNAME;
  if (!adminUsername) {
    return false;
  }

  try {
    const decoded = Buffer.from(token, "base64").toString("utf-8");
    const [username] = decoded.split(":");
    return username === adminUsername;
  } catch {
    return false;
  }
}

// Admin login - validates credentials and returns a token
export const login = action({
  args: {
    username: v.string(),
    password: v.string(),
  },
  handler: async (ctx, args): Promise<{ success: boolean; token: string }> => {
    const adminUsername = process.env.ADMIN_USERNAME;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminUsername || !adminPassword) {
      throw new Error("Admin credentials not configured");
    }

    if (args.username !== adminUsername || args.password !== adminPassword) {
      throw new Error("Invalid username or password");
    }

    // Generate a simple token (in production, use a proper JWT)
    const token = Buffer.from(`${args.username}:${Date.now()}`).toString("base64");

    return {
      success: true,
      token,
    };
  },
});

// Verify admin token
export const verifyToken = action({
  args: {
    token: v.string(),
  },
  handler: async (ctx, args): Promise<{ valid: boolean }> => {
    return { valid: verifyAdminToken(args.token) };
  },
});

// Get admin stats
export const getStats = action({
  args: {
    token: v.string(),
  },
  handler: async (ctx, args): Promise<AdminStats> => {
    if (!verifyAdminToken(args.token)) {
      throw new Error("Access denied");
    }

    // Get stats using internal queries
    const stats = await ctx.runQuery(internal.internal.getAdminStats) as AdminStats;
    return stats;
  },
});

// Get users list for admin
export const getUsers = action({
  args: {
    token: v.string(),
    page: v.optional(v.number()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args): Promise<{
    users: AdminUser[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> => {
    if (!verifyAdminToken(args.token)) {
      throw new Error("Access denied");
    }

    const page = args.page || 1;
    const limit = Math.min(100, args.limit || 50);
    const offset = (page - 1) * limit;

    const result = await ctx.runQuery(internal.internal.getAdminUsers, { limit, offset }) as {
      users: AdminUser[];
      total: number;
    };

    return {
      users: result.users,
      pagination: {
        page,
        limit,
        total: result.total,
        totalPages: Math.ceil(result.total / limit),
      },
    };
  },
});

// Get email captures for admin
export const getEmailCaptures = action({
  args: {
    token: v.string(),
    page: v.optional(v.number()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args): Promise<{
    captures: AdminEmailCapture[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> => {
    if (!verifyAdminToken(args.token)) {
      throw new Error("Access denied");
    }

    const page = args.page || 1;
    const limit = Math.min(100, args.limit || 50);
    const offset = (page - 1) * limit;

    const result = await ctx.runQuery(internal.internal.getAdminEmailCaptures, { limit, offset }) as {
      captures: AdminEmailCapture[];
      total: number;
    };

    return {
      captures: result.captures,
      pagination: {
        page,
        limit,
        total: result.total,
        totalPages: Math.ceil(result.total / limit),
      },
    };
  },
});

// Update user plan (admin only)
export const updateUserPlan = action({
  args: {
    token: v.string(),
    email: v.string(),
    plan: v.union(v.literal("FREE"), v.literal("PRO"), v.literal("BUSINESS")),
  },
  handler: async (ctx, args): Promise<{ success: boolean; message: string }> => {
    if (!verifyAdminToken(args.token)) {
      throw new Error("Access denied");
    }

    // Find user by email
    const user = await ctx.runQuery(internal.internal.getUserByEmail, { email: args.email });

    if (!user) {
      return {
        success: false,
        message: `User with email ${args.email} not found`,
      };
    }

    // Update the user's plan
    await ctx.runMutation(internal.users.updateUserPlan, {
      clerkId: user.clerkId,
      plan: args.plan,
    });

    return {
      success: true,
      message: `Successfully updated ${args.email} to ${args.plan} plan`,
    };
  },
});

// Get bot leads for admin
export const getBotLeads = action({
  args: {
    token: v.string(),
    page: v.optional(v.number()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args): Promise<{
    leads: AdminBotLead[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> => {
    if (!verifyAdminToken(args.token)) {
      throw new Error("Access denied");
    }

    const page = args.page || 1;
    const limit = Math.min(100, args.limit || 50);
    const offset = (page - 1) * limit;

    const result = await ctx.runQuery(internal.internal.getAdminBotLeads, { limit, offset }) as {
      leads: AdminBotLead[];
      total: number;
    };

    return {
      leads: result.leads,
      pagination: {
        page,
        limit,
        total: result.total,
        totalPages: Math.ceil(result.total / limit),
      },
    };
  },
});

// Get bot leads stats for admin dashboard
export const getBotLeadsStats = action({
  args: {
    token: v.string(),
  },
  handler: async (ctx, args): Promise<{
    total: number;
    recentLeads: number;
    monthlyLeads: number;
  }> => {
    if (!verifyAdminToken(args.token)) {
      throw new Error("Access denied");
    }

    const stats = await ctx.runQuery(internal.internal.getBotLeadsStats) as {
      total: number;
      recentLeads: number;
      monthlyLeads: number;
    };

    return stats;
  },
});
