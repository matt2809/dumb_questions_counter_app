import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const applicationTables = {
  counters: defineTable({
    type: v.literal("global"),
    dailyCount: v.number(),
    totalCount: v.number(),
    lastResetDate: v.string(), // YYYY-MM-DD format
  }),
  userPresence: defineTable({
    userId: v.id("users"),
    name: v.string(),
    lastSeen: v.number(),
  }).index("by_user", ["userId"]),
  activities: defineTable({
    userName: v.string(),
    action: v.string(),
    timestamp: v.number(),
  }).index("by_timestamp", ["timestamp"]),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
