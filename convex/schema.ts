import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  counters: defineTable({
    type: v.literal("global"),
    dailyCount: v.number(),
    totalCount: v.number(),
    lastResetDate: v.string(), // YYYY-MM-DD format
  }),
  userPresence: defineTable({
    name: v.string(),
    lastSeen: v.number(),
  }).index("by_name", ["name"]),
  activities: defineTable({
    userName: v.string(),
    action: v.string(),
    timestamp: v.number(),
  }).index("by_timestamp", ["timestamp"]),
});
