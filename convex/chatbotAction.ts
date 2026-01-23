import { v } from "convex/values";
import { action } from "./_generated/server";
import { api } from "./_generated/api";

const SYSTEM_PROMPT = `You are POSTAIFY's friendly AI assistant. POSTAIFY is an AI-powered social media content generation platform that helps creators and businesses automate their social media presence.

## WHAT POSTAIFY OFFERS:
- **AI Content Generation**: Create viral posts for Instagram, Twitter, LinkedIn, TikTok, and Facebook using advanced AI models
- **Brand Voice Management**: Set up multiple brands with unique voices and topics
- **AI Image Generation**: Generate stunning visuals for your posts (Pro plan)
- **AI Voiceover**: Create professional voiceovers for video content (Pro plan)
- **Video Repurposing**: Transform long-form videos into multiple social media posts (Pro plan)
- **Post Scheduling**: Schedule posts and manage your content calendar
- **Telegram Bot**: Generate and manage content directly from Telegram

## PRICING PLANS:
- **FREE**: 2 brands, 20 posts/month - Perfect for trying out
- **PRO**: 5 brands, 1000 posts/month, + Image Gen, Voiceover, Video Repurpose
- **BUSINESS**: Unlimited brands, 90,000 posts/month, All features

## YOUR PERSONALITY:
- Be helpful, friendly, and enthusiastic about helping users succeed on social media
- Keep responses concise (2-4 sentences when possible)
- If asked about features not available, explain what plan they'd need
- Encourage users to try the platform
- Never make up features that don't exist
- If you don't know something specific, be honest and suggest they contact support

## RESPONSE GUIDELINES:
- Answer questions about POSTAIFY's features, pricing, and how to use it
- Help explain the benefits of AI-powered content creation
- Share tips for social media success when relevant
- Be conversational but professional`;

// Response type for chat action
type ChatResponse = {
  response: string;
  needsEmail: boolean;
  messageCount?: number;
};

// Chat with the POSTAIFY assistant
export const chat = action({
  args: {
    sessionId: v.string(),
    message: v.string(),
    conversationHistory: v.array(
      v.object({
        role: v.union(v.literal("user"), v.literal("assistant")),
        content: v.string(),
      })
    ),
  },
  handler: async (ctx, args): Promise<ChatResponse> => {
    // Check message limit first
    const limitStatus = await ctx.runQuery(api.chatbot.checkMessageLimit, {
      sessionId: args.sessionId,
    });

    if (limitStatus.needsEmail) {
      return {
        response: "I'd love to keep chatting! To continue our conversation, please share your email address so we can stay in touch and send you helpful tips.",
        needsEmail: true,
      };
    }

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      throw new Error("OpenRouter API key not configured");
    }

    // Build messages array with conversation history
    const messages = [
      { role: "system", content: SYSTEM_PROMPT },
      ...args.conversationHistory.map((msg) => ({
        role: msg.role,
        content: msg.content,
      })),
      { role: "user", content: args.message },
    ];

    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": process.env.FRONTEND_URL || "https://postaify.app",
          "X-Title": "POSTAIFY Chatbot",
        },
        body: JSON.stringify({
          model: "anthropic/claude-3-haiku",
          messages,
          max_tokens: 500,
          temperature: 0.7,
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenRouter API error:", errorText);
      throw new Error("Failed to get response from AI");
    }

    const data = (await response.json()) as {
      choices: Array<{ message: { content: string } }>;
    };

    const assistantMessage =
      data.choices[0]?.message?.content ||
      "I apologize, I'm having trouble responding right now. Please try again.";

    // Save the messages to the session
    const addResult = await ctx.runMutation(api.chatbot.addMessage, {
      sessionId: args.sessionId,
      userMessage: args.message,
      assistantMessage,
    });

    return {
      response: assistantMessage,
      needsEmail: addResult.needsEmail,
      messageCount: addResult.messageCount,
    };
  },
});
