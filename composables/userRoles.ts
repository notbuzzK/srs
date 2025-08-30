// composables/userRoles.ts
export const userRoles = {
  Faculty: ["dashboard", "schedule", "summary"],
  Scheduler: ["dashboard", "schedule", "departmentalSchedule", "manageMembers","courses", "summary", ],
  CEEA: ["dashboard", "schedule", "summary",  "departmentalSummary"],
  "College Admin": ["dashboard", "schedule", "summary", "manageMemebers", "statistics"],
  "System Admin": ["statistics", "manageMembers"],
  "Higher Ups": ["dashboard", "schedule", "manageMembers", "departmentalSummary", "approvals", "summary",],
};

// Default route for each role
export const defaultRoutes: Record<string, string> = {
  Faculty: "dashboard",
  Scheduler: "dashboard",
  CEEA: "dashboard",
  "College Admin": "dashboard",
  "System Admin": "statistics",
  "Higher Ups": "dashboard",
};
