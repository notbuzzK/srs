# Faculty Management and Schedule Recommendation System
An (unfinished) commission by a university that ghosted me. Approximately 60% of the system is complete.

# Setup
**6 User Roles**: System Admin, College Admin, CEEA, Higher Ups, Scheduler, Faculty
**Complex Scheduling System**: Handles multi-level workload constraints, multiple instructors in one schedule]
**

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
- A faculty (user) can be under one or two different colleges or academic services, department, with different ranks, faculty item, step, and designation. 
- Schedule creation is done by scheduler, must be visible to college dean, and reflected into each faculty account 
- Schedule creation checks for workload thresholds, duplicates, conflicts, and faculty availability
- "Borrowing" of faculty from different departments/colleges/services with approval of Dean
- Created schedules from previous semester gets archived automatically when new semeseter is created per department

# Screenshots
<img width="1916" height="944" alt="image" src="https://github.com/user-attachments/assets/80fbd9aa-c957-4278-a6da-5191333bdba2" />
<img width="1916" height="944" alt="image" src="https://github.com/user-attachments/assets/5b6b51cc-d6f3-4d83-ba54-7ed460e9c3c1" />
<img width="1917" height="940" alt="image" src="https://github.com/user-attachments/assets/a768254a-e976-4f4d-bdeb-239b82ec2727" />
<img width="1918" height="945" alt="image" src="https://github.com/user-attachments/assets/6ac12e75-e842-47f9-b90b-648775e0fa6a" />
