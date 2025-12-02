# PurposefulLive Master Prompt Implementation Plan

## AUTHORIZATION
**Autonomous build approved.** Continue without stopping. Skip to next task if blocked.

---

## MASTER PROMPT PRINCIPLES

### Operating Laws (Permanent, Non-Negotiable)
1. **NO-DECISION MODE**: System chooses automatically using evidence-based principles
2. **COGNITIVE PROTECTION MODE**: Eliminate overwhelm, decision fatigue, emotional dysregulation
3. **TRUTH AND REALITY PRINCIPLE**: Evidence-based, behavioral science, neuroscience
4. **TRANSFORMATION ENGINE MODE**: Systems, frameworks, protocols, checklists, routines, scripts
5. **MINIMAL INPUT FROM ME**: User only executes, never chooses

### Identity Architecture
Build user into person capable of:
- Physical health
- Emotional control
- Discipline
- Financial mastery
- Leadership
- Family stability
- Mission alignment
- Long-term legacy

### Daily Operating System (Mandatory Focus Areas)
1. Physical health (movement, food, sleep, hydration)
2. Emotional regulation
3. Focus/attention
4. Accountability
5. Planning and execution
6. Stress reduction
7. Mindfulness/awareness
8. Discipline loops
9. Micro-habits
10. Long-term trajectory
11. Mission alignment
12. Controlling impulses
13. Recovery and restoration

---

## CURRENT PLATFORM STATUS

### ✅ IMPLEMENTED (65% Complete)
- Session-based pricing ($1/$49/$99/$149)
- Stripe payment integration
- Calendly booking (needs URLs)
- Zoom Video SDK (needs credentials)
- Email automation
- Coach admin panel
- Transformation protocol UI (daily check-ins, habit tracker, identity dashboard)
- Autism transformation module (8 tables, 15 procedures)
- Identity-based habits (James Clear, BJ Fogg)
- Neuroscience-backed protocols (Huberman)

### ❌ MISSING (35% Remaining)

#### CRITICAL (Must Build Now):
1. **Physical Health Tracking System**
   - Movement log (steps, workouts, active minutes)
   - Food log (meals, water intake, nutrition quality)
   - Sleep log (hours, quality, wake time)
   - Hydration tracker (water intake, frequency)

2. **Stress Reduction Tools**
   - Breathing exercises (box breathing, 4-7-8, Wim Hof)
   - Grounding techniques (5-4-3-2-1, body scan)
   - Quick stress relief protocols

3. **Morning Routine Protocol**
   - Structured wake-up checklist
   - Non-negotiable morning habits
   - Energy optimization sequence

4. **Evening Review Protocol**
   - Daily reflection checklist
   - Win/loss analysis
   - Tomorrow's top 3 priorities

5. **Impulse Control System**
   - Urge surfing tools
   - Delay mechanisms (10-minute rule)
   - Temptation logging

6. **Recovery Tracking**
   - Rest day logging
   - Energy restoration tracking
   - Burnout prevention

7. **Identity Contradiction Detector**
   - Flag behaviors misaligned with identity
   - Alert user to contradictions
   - Suggest corrective actions

8. **Dopamine Regulation Tracker**
   - Track dopamine-seeking behaviors
   - Identify triggers
   - Suggest healthier alternatives

---

## BUILD PLAN (Next 8 Features)

### Feature 1: Physical Health Tracking System
**Database Schema:**
```sql
CREATE TABLE health_logs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  log_date DATE NOT NULL,
  steps INT,
  workout_minutes INT,
  workout_type VARCHAR(100),
  meals_logged INT,
  water_intake_oz INT,
  sleep_hours DECIMAL(3,1),
  sleep_quality INT, -- 1-10
  wake_time TIME,
  energy_level INT, -- 1-10
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**tRPC Procedures:**
- `health.logDaily` - Log daily health metrics
- `health.getHistory` - Get health history
- `health.getStats` - Get weekly/monthly averages

**UI Components:**
- `HealthDashboard.tsx` - Overview with charts
- `HealthLogger.tsx` - Daily input form
- `HealthStats.tsx` - Progress visualization

---

### Feature 2: Stress Reduction Tools
**Database Schema:**
```sql
CREATE TABLE stress_sessions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  session_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  technique VARCHAR(50), -- 'box_breathing', 'wim_hof', 'grounding'
  duration_seconds INT,
  stress_before INT, -- 1-10
  stress_after INT, -- 1-10
  notes TEXT
);
```

**tRPC Procedures:**
- `stress.startSession` - Begin stress reduction session
- `stress.completeSession` - Log results
- `stress.getHistory` - Get past sessions

**UI Components:**
- `StressReliefHub.tsx` - Technique selector
- `BoxBreathing.tsx` - Animated breathing guide
- `WimHofBreathing.tsx` - Wim Hof method guide
- `GroundingExercise.tsx` - 5-4-3-2-1 technique

---

### Feature 3: Morning Routine Protocol
**Database Schema:**
```sql
CREATE TABLE morning_routines (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  routine_date DATE NOT NULL,
  wake_time TIME,
  hydrated BOOLEAN DEFAULT FALSE,
  movement BOOLEAN DEFAULT FALSE,
  meditation BOOLEAN DEFAULT FALSE,
  cold_shower BOOLEAN DEFAULT FALSE,
  healthy_breakfast BOOLEAN DEFAULT FALSE,
  top_3_priorities TEXT,
  completed_at TIMESTAMP,
  completion_rate INT -- percentage
);
```

**tRPC Procedures:**
- `morning.start` - Begin morning routine
- `morning.complete` - Mark routine complete
- `morning.getStreak` - Get completion streak

**UI Components:**
- `MorningRoutine.tsx` - Checklist interface
- `MorningStats.tsx` - Streak and completion rate

---

### Feature 4: Evening Review Protocol
**Database Schema:**
```sql
CREATE TABLE evening_reviews (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  review_date DATE NOT NULL,
  wins TEXT,
  losses TEXT,
  lessons_learned TEXT,
  tomorrow_top_3 TEXT,
  gratitude TEXT,
  identity_alignment INT, -- 1-10
  completed_at TIMESTAMP
);
```

**tRPC Procedures:**
- `evening.createReview` - Log evening review
- `evening.getHistory` - Get past reviews

**UI Components:**
- `EveningReview.tsx` - Reflection form
- `ReviewHistory.tsx` - Past reviews

---

### Feature 5: Impulse Control System
**Database Schema:**
```sql
CREATE TABLE impulse_logs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  log_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  trigger VARCHAR(200),
  urge_strength INT, -- 1-10
  action_taken VARCHAR(50), -- 'resisted', 'delayed', 'gave_in'
  delay_minutes INT,
  alternative_action TEXT,
  outcome TEXT
);
```

**tRPC Procedures:**
- `impulse.logUrge` - Log impulse/urge
- `impulse.getPatterns` - Identify triggers

**UI Components:**
- `ImpulseTracker.tsx` - Log urges
- `UrgeSurfing.tsx` - Guided urge surfing

---

### Feature 6: Recovery Tracking
**Database Schema:**
```sql
CREATE TABLE recovery_logs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  log_date DATE NOT NULL,
  recovery_type VARCHAR(50), -- 'rest_day', 'active_recovery', 'massage', 'sauna'
  duration_minutes INT,
  energy_before INT, -- 1-10
  energy_after INT, -- 1-10
  notes TEXT
);
```

**tRPC Procedures:**
- `recovery.log` - Log recovery activity
- `recovery.getHistory` - Get recovery history

**UI Components:**
- `RecoveryTracker.tsx` - Log recovery
- `RecoveryStats.tsx` - Recovery patterns

---

### Feature 7: Identity Contradiction Detector
**Algorithm:**
```typescript
// Detect contradictions between stated identity and logged behaviors
// Example: User says "I am disciplined" but misses 5 morning routines in a row
// Flag contradiction and suggest corrective action
```

**tRPC Procedures:**
- `identity.detectContradictions` - Analyze behaviors vs identity
- `identity.getSuggestions` - Get corrective actions

**UI Components:**
- `ContradictionAlert.tsx` - Show contradictions
- `IdentityAlignment.tsx` - Alignment score

---

### Feature 8: Dopamine Regulation Tracker
**Database Schema:**
```sql
CREATE TABLE dopamine_logs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  log_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  trigger VARCHAR(200),
  behavior VARCHAR(200), -- 'scrolling', 'gaming', 'junk_food', etc.
  duration_minutes INT,
  satisfaction INT, -- 1-10
  regret INT, -- 1-10
  healthier_alternative TEXT
);
```

**tRPC Procedures:**
- `dopamine.logBehavior` - Log dopamine-seeking behavior
- `dopamine.getPatterns` - Identify patterns

**UI Components:**
- `DopamineTracker.tsx` - Log behaviors
- `DopamineInsights.tsx` - Pattern analysis

---

## EXECUTION SEQUENCE

1. Build Feature 1 (Physical Health Tracking)
2. Build Feature 2 (Stress Reduction Tools)
3. Build Feature 3 (Morning Routine Protocol)
4. Build Feature 4 (Evening Review Protocol)
5. Build Feature 5 (Impulse Control System)
6. Build Feature 6 (Recovery Tracking)
7. Build Feature 7 (Identity Contradiction Detector)
8. Build Feature 8 (Dopamine Regulation Tracker)
9. Polish and optimize all features
10. Final checkpoint and deployment

**Estimated Time: 8-12 hours of autonomous work**

---

## EVIDENCE-BASED FOUNDATIONS

### Current:
- James Clear (Atomic Habits)
- BJ Fogg (Behavior Model)
- Andrew Huberman (Neuroscience)
- CBT (Cognitive-Behavioral Therapy)
- ABA (Applied Behavior Analysis)

### Adding:
- Wim Hof (Breathing, Cold Exposure)
- David Goggins (Mental Toughness)
- Matthew Walker (Sleep Science)
- Peter Attia (Health Optimization)
- Cal Newport (Deep Work)

---

## SUCCESS CRITERIA

Platform maturity score: **95/100**

All master prompt principles implemented:
- ✅ No-Decision Mode
- ✅ Cognitive Protection Mode
- ✅ Truth and Reality Principle
- ✅ Transformation Engine Mode
- ✅ Minimal Input From Me
- ✅ Identity Architecture
- ✅ Daily Operating System (all 13 focus areas)
- ✅ Execution Rules

**Ready to begin autonomous build.**
