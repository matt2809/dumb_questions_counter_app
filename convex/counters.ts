import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Get current counters
export const getCounters = query({
  args: {},
  handler: async (ctx) => {
    const counter = await ctx.db
      .query("counters")
      .filter((q) => q.eq(q.field("type"), "global"))
      .first();

    if (!counter) {
      return { dailyCount: 0, totalCount: 0 };
    }

    // Check if we need to reset daily counter
    const today = new Date().toISOString().split('T')[0];
    if (counter.lastResetDate !== today) {
      return { dailyCount: 0, totalCount: counter.totalCount };
    }

    return {
      dailyCount: counter.dailyCount,
      totalCount: counter.totalCount,
    };
  },
});

// Increment counters
export const incrementCounters = mutation({
  args: {
    userName: v.string(),
  },
  handler: async (ctx, args) => {
    const counter = await ctx.db
      .query("counters")
      .filter((q) => q.eq(q.field("type"), "global"))
      .first();

    const today = new Date().toISOString().split('T')[0];

    if (!counter) {
      // Initialize and increment
      await ctx.db.insert("counters", {
        type: "global",
        dailyCount: 1,
        totalCount: 1,
        lastResetDate: today,
      });
    } else {
      // Check if we need to reset daily counter first
      const shouldReset = counter.lastResetDate !== today;
      const newDailyCount = shouldReset ? 1 : counter.dailyCount + 1;

      await ctx.db.patch(counter._id, {
        dailyCount: newDailyCount,
        totalCount: counter.totalCount + 1,
        lastResetDate: today,
      });
    }

    // Log the activity
    await ctx.db.insert("activities", {
      userName: args.userName,
      action: "incremented counter",
      timestamp: Date.now(),
    });

    return null;
  },
});

// Get recent activities for notifications
export const getRecentActivities = query({
  args: {},
  handler: async (ctx) => {
    const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
    return await ctx.db
      .query("activities")
      .withIndex("by_timestamp", (q) => q.gt("timestamp", fiveMinutesAgo))
      .order("desc")
      .take(10);
  },
});
