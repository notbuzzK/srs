# Faculty Management and Schedule Recommendation System
An (unfinished) commission by a university that ghosted me. Approximately 60% of the system is complete.

# Setup
**5 User Roles**: System Admin, College Admin, CEEA, Scheduler, Faculty
**Complex Scheduling System**: Handles multi-level workload constraints, multiple instructors in one schedule]


# Technology Stack
- Typescript
- Vue
- Nuxt3
- Tailwind
- Supabase
- Vercel

# Automated Constraint and Rule Based Scheduling Engine
Uses a 4-level contsraint system to ensure proper schedules are created and set:
1. Part Time / Full Time
2. Semestral / Trimestral / Midyear
3. 4 different Ranks / Positions
4. Each rank and position has specific conditions for their schedules that need to be met

# Complex Backend Functions
- A faculty (user) can be under one or two different colleges or academic services, department, with different ranks, and faculty item. 
- Schedule creation is done by scheduler, must be visible to college dean, and reflected into each faculty account 
- Schedule creation checks for workload thresholds, duplicates, conflicts, and faculty availability

# Screenshots
