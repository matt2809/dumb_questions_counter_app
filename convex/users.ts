import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Update user presence
export const updatePresence = mutation({
  args: {
    name: v.string(),
    oldName: v.optional(v.string()), // Optional old name to clean up
  },
  handler: async (ctx, args) => {
    // If an old name is provided, remove the old presence record
    if (args.oldName && args.oldName !== args.name) {
      const oldPresence = await ctx.db
        .query("userPresence")
        .withIndex("by_name", (q) => q.eq("name", args.oldName!))
        .first();
      
      if (oldPresence) {
        await ctx.db.delete(oldPresence._id);
      }
    }

    const existingPresence = await ctx.db
      .query("userPresence")
      .withIndex("by_name", (q) => q.eq("name", args.name))
      .first();

    if (existingPresence) {
      await ctx.db.patch(existingPresence._id, {
        lastSeen: Date.now(),
      });
    } else {
      await ctx.db.insert("userPresence", {
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
