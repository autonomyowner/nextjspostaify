import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../convex/_generated/api";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

// Hash IP using SHA-256 (privacy-safe)
async function hashIP(ip: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(ip + process.env.RATE_LIMIT_SALT || "postaify-salt");
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

// Get client IP from request headers
function getClientIP(request: NextRequest): string {
  // Check various headers that may contain the real IP
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }

  const realIP = request.headers.get("x-real-ip");
  if (realIP) {
    return realIP;
  }

  const cfConnectingIP = request.headers.get("cf-connecting-ip");
  if (cfConnectingIP) {
    return cfConnectingIP;
  }

  // Fallback - this will be the server IP in some cases
  return "unknown";
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { youtubeUrl, platform, toolSlug } = body;

    if (!youtubeUrl || !platform) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Get and hash the client IP
    const clientIP = getClientIP(request);
    const ipHash = await hashIP(clientIP);

    // Call Convex action with rate limiting
    const result = await convex.action(api.tools.generateFromYouTube, {
      youtubeUrl,
      platform,
      ipHash,
      toolSlug: toolSlug || "unknown",
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Tool generation error:", error);

    // Return the error message to the client
    const message =
      error instanceof Error ? error.message : "Failed to generate content";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
