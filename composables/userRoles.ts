// composables/userRoles.ts
export const userRoles = {
  Faculty: ["dashboard", "schedule", "summary"],
  Scheduler: ["dashboard", "schedule", "courses", "summary"],
  CEEA: ["dashboard", "schedule", "departmental-summary"],
  "College Admin": ["dashboard", "schedule", "summary", "manage-faculty", "college-statistics"],
  "System Admin": ["statistics", "manageMembers"]
};

// Default route for each role
export const defaultRoutes: Record<string, string> = {
  Faculty: "dashboard",
  Scheduler: "dashboard",
  CEEA: "dashboard",
  "College Admin": "dashboard",
  "System Admin": "statistics"
};
