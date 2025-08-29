import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

// Update user presence
export const updatePresence = mutation({
  args: {
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("User must be authenticated");
    }

    const existingPresence = await ctx.db
      .query("userPresence")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (existingPresence) {
      await ctx.db.patch(existingPresence._id, {
        name: args.name,
        lastSeen: Date.now(),
      });
    } else {
      await ctx.db.insert("userPresence", {
        userId,
        name: args.name,
        lastSeen: Date.now(),
      });
    }
    return null;
  },
});

// Get online users (active in last 30 seconds)
export const getOnlineUsers = query({
  args: {},
  handler: async (ctx) => {
    const thirtySecondsAgo = Date.now() - 30 * 1000;
    return await ctx.db
      .query("userPresence")
      .filter((q) => q.gt(q.field("lastSeen"), thirtySecondsAgo))
      .collect();
  },
});
