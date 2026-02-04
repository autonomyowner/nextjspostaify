/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as admin from "../admin.js";
import type * as ai from "../ai.js";
import type * as auth from "../auth.js";
import type * as brands from "../brands.js";
import type * as chatbot from "../chatbot.js";
import type * as chatbotAction from "../chatbotAction.js";
import type * as emails from "../emails.js";
import type * as http from "../http.js";
import type * as images from "../images.js";
import type * as imagesAction from "../imagesAction.js";
import type * as internal_ from "../internal.js";
import type * as lib_planLimits from "../lib/planLimits.js";
import type * as posts from "../posts.js";
import type * as subscriptions from "../subscriptions.js";
import type * as subscriptionsAction from "../subscriptionsAction.js";
import type * as telegram from "../telegram.js";
import type * as telegramAction from "../telegramAction.js";
import type * as tools from "../tools.js";
import type * as users from "../users.js";
import type * as voice from "../voice.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  admin: typeof admin;
  ai: typeof ai;
  auth: typeof auth;
  brands: typeof brands;
  chatbot: typeof chatbot;
  chatbotAction: typeof chatbotAction;
  emails: typeof emails;
  http: typeof http;
  images: typeof images;
  imagesAction: typeof imagesAction;
  internal: typeof internal_;
  "lib/planLimits": typeof lib_planLimits;
  posts: typeof posts;
  subscriptions: typeof subscriptions;
  subscriptionsAction: typeof subscriptionsAction;
  telegram: typeof telegram;
  telegramAction: typeof telegramAction;
  tools: typeof tools;
  users: typeof users;
  voice: typeof voice;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
