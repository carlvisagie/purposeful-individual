# Purposeful Live Coaching - Agent Onboarding & Development Guide

**Version:** 1.0 | **Status:** Developer Blueprint | **Audience:** All Developers & Agents

---

## Welcome to Purposeful Live Coaching

This guide enables any developer or agent to understand the platform, pick up any feature, and build it to production quality. The platform is designed for distributed development where multiple teams work independently on different features while maintaining alignment and quality.

---

## Platform Overview

**Purposeful Live Coaching** is a total wellness operating system that helps people achieve optimal health, happiness, and prosperity across five dimensions: Spiritual, Mental, Emotional, Physical, and Financial.

**The Platform Consists of:**
- **3 MVP Products:** Enterprise (B2B), Individual (B2C), Dashboard (Admin)
- **Core Technology:** React 19 + Express 4 + tRPC 11 + MySQL + AI/ML
- **Revenue Model:** Subscriptions (40%), Products (35%), Partnerships (15%), Data (10%)
- **Vision:** Become the global standard for wellness with $2-5B ARR by 2035

---

## Master Documentation Structure

Before starting any feature, read these documents in order:

### 1. **ENTERPRISE-VISION-10YEAR-ROADMAP.md**
- Understand the 10-year vision and strategic roadmap
- See how your feature fits into the bigger picture
- Understand market opportunity and success metrics

### 2. **MASTER-PLATFORM-ARCHITECTURE.md**
- Understand the overall platform design
- Learn about the 5 wellness categories and their data models
- See how all features interconnect

### 3. **WELLNESS-DATA-MODEL.md**
- Understand the complete database schema
- Learn about all tracked metrics and data structures
- See how your feature's data fits into the model

### 4. **COMPLETE-FEATURE-INVENTORY.md**
- See all 127 features across 14 categories
- Understand feature status (MVP, Phase 1, Phase 2, Phase 3)
- Identify dependencies and blockers

### 5. **ENTERPRISE-SCALE-ARCHITECTURE.md**
- Understand the technical architecture
- Learn about data ingestion, processing, storage, and analytics
- See infrastructure and performance targets

### 6. **ECOSYSTEM-PARTNERSHIP-STRATEGY.md**
- Understand the partnership ecosystem
- Learn about revenue sharing models
- See how partnerships amplify the platform

### 7. **COMPETITIVE-MOAT-MARKET-STRATEGY.md**
- Understand competitive advantages
- Learn about market positioning and go-to-market strategy
- See how the platform becomes unbeatable

### 8. **ORGANIZATIONAL-TEAM-STRUCTURE.md**
- Understand the organizational structure
- Learn about team composition and growth
- See who to contact for different areas

### 9. **REGULATORY-COMPLIANCE-RISK-FRAMEWORK.md**
- Understand compliance requirements
- Learn about HIPAA, GDPR, FDA, insurance regulations
- See risk management strategies

---

## Feature Development Workflow

### Step 1: Understand Your Feature

**Find your feature in COMPLETE-FEATURE-INVENTORY.md:**
- What is the feature?
- What tier is it (MVP, Phase 1, 2, 3)?
- What is the priority?
- What are the dependencies?
- Who is the owner?

**Example:** "Guest Checkout" is MVP, Priority P0, depends on Stripe integration

### Step 2: Understand the Data Model

**Reference WELLNESS-DATA-MODEL.md:**
- What tables does your feature need?
- What fields are required?
- What relationships exist?
- What constraints apply?

**Example:** Guest checkout needs `guestCheckouts` table with fields: email, sessionType, date, amount, paymentStatus

### Step 3: Understand the Architecture

**Reference ENTERPRISE-SCALE-ARCHITECTURE.md:**
- Where does your feature fit in the architecture?
- What APIs/services does it depend on?
- What performance targets apply?
- What security requirements apply?

**Example:** Guest checkout uses Stripe API, must process payments <100ms, must encrypt payment data

### Step 4: Design Your Feature

**Create a feature design document:**
- User story and acceptance criteria
- Data model (tables, fields, relationships)
- API endpoints (REST or tRPC)
- UI mockups or wireframes
- Integration points
- Error handling and edge cases
- Performance and security considerations

### Step 5: Implement Your Feature

**Follow the development workflow:**

1. **Database Schema** (if needed)
   - Add tables to `drizzle/schema.ts`
   - Run `pnpm db:push` to migrate
   - Create database helpers in `server/db.ts`

2. **Backend API** (tRPC procedures)
   - Create procedures in `server/routers/[feature].ts`
   - Use `publicProcedure` or `protectedProcedure`
   - Add error handling and validation
   - Add logging for debugging

3. **Frontend UI** (React components)
   - Create components in `client/src/components/[Feature]/`
   - Create pages in `client/src/pages/[Feature].tsx`
   - Use shadcn/ui components for consistency
   - Add loading and error states

4. **Testing**
   - Write unit tests with Vitest
   - Test happy path and error cases
   - Test API endpoints
   - Test UI interactions

5. **Documentation**
   - Document API endpoints
   - Document data model
   - Document UI components
   - Add code comments for complex logic

### Step 6: Deploy Your Feature

**Deployment process:**
1. Create a feature branch
2. Implement and test locally
3. Create a pull request
4. Code review and feedback
5. Merge to main
6. Deploy to staging
7. Test in staging
8. Deploy to production
9. Monitor and support

---

## Code Organization

### Backend Structure

```
server/
  routers/
    [feature].ts          ← Your tRPC procedures
    index.ts              ← Router exports
  services/
    [feature].ts          ← Business logic helpers
  middleware/
    [feature].ts          ← Middleware (auth, validation, etc.)
  db.ts                   ← Database query helpers
  routers.ts              ← Main router definition
```

### Frontend Structure

```
client/
  src/
    pages/
      [Feature].tsx       ← Page component
    components/
      [Feature]/
        [Component].tsx   ← Feature components
    hooks/
      use[Feature].ts     ← Custom hooks
    lib/
      [feature].ts        ← Utilities
```

### Database Structure

```
drizzle/
  schema.ts               ← All table definitions
```

---

## Development Standards

### Code Quality

**TypeScript:** All code must be TypeScript with strict mode enabled.

**Linting:** Run `pnpm lint` before committing.

**Testing:** All features must have >80% test coverage.

**Documentation:** All public APIs must be documented.

### API Design

**tRPC Procedures:** Use tRPC for all backend APIs (not REST).

**Naming:** Use camelCase for procedures (`feature.list`, `feature.create`).

**Error Handling:** Return meaningful error messages with error codes.

**Validation:** Validate all inputs with Zod schemas.

**Pagination:** Support pagination for list endpoints (limit, offset).

### Database Design

**Naming:** Use camelCase for columns, snake_case for table names.

**Types:** Use appropriate types (int, varchar, text, timestamp, boolean).

**Constraints:** Add NOT NULL, UNIQUE, FOREIGN KEY where appropriate.

**Indexes:** Add indexes for frequently queried columns.

**Timestamps:** All tables should have `createdAt` and `updatedAt`.

### Frontend Design

**Components:** Use shadcn/ui components for consistency.

**Styling:** Use Tailwind CSS utilities.

**State Management:** Use React hooks and tRPC for state.

**Loading States:** Always show loading indicators during async operations.

**Error States:** Always show error messages when operations fail.

**Accessibility:** Ensure keyboard navigation and screen reader support.

---

## Common Patterns

### Creating a tRPC Procedure

```typescript
// server/routers/feature.ts
import { protectedProcedure, publicProcedure, router } from './_core/trpc';
import { z } from 'zod';

export const featureRouter = router({
  list: protectedProcedure
    .input(z.object({ limit: z.number().default(10) }))
    .query(async ({ ctx, input }) => {
      // Your implementation
      return results;
    }),

  create: protectedProcedure
    .input(z.object({ name: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Your implementation
      return created;
    }),
});
```

### Using tRPC in React

```typescript
// client/src/pages/Feature.tsx
import { trpc } from '@/lib/trpc';

export default function Feature() {
  const { data, isLoading } = trpc.feature.list.useQuery({ limit: 10 });
  const createMutation = trpc.feature.create.useMutation();

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      {data?.map(item => <div key={item.id}>{item.name}</div>)}
      <button onClick={() => createMutation.mutate({ name: 'New' })}>
        Create
      </button>
    </div>
  );
}
```

### Adding a Database Table

```typescript
// drizzle/schema.ts
export const features = mysqlTable('features', {
  id: int('id').autoincrement().primaryKey(),
  userId: int('userId').notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().onUpdateNow().notNull(),
});

// server/db.ts
export async function getFeatures(userId: number) {
  const db = await getDb();
  return db.select().from(features).where(eq(features.userId, userId));
}
```

---

## Feature Checklist

Before marking a feature complete, ensure:

- [ ] Feature design document created
- [ ] Data model defined and migrated
- [ ] Backend API implemented and tested
- [ ] Frontend UI implemented and tested
- [ ] Error handling for all paths
- [ ] Logging for debugging
- [ ] Documentation updated
- [ ] Code reviewed and approved
- [ ] Tests passing (>80% coverage)
- [ ] Deployed to staging and tested
- [ ] Deployed to production
- [ ] Monitored for errors and performance
- [ ] Feature inventory updated

---

## Getting Help

**Questions about the platform?** Read the master documentation files.

**Questions about a specific feature?** Check the feature design document.

**Questions about the codebase?** Check the code comments and README.

**Technical issues?** Check the error logs and monitoring dashboards.

**Need to discuss architecture?** Schedule a sync with the architecture team.

---

## Feature Development Examples

### Example 1: Guest Checkout Feature

**Status:** MVP, Priority P0

**What it does:** Allows users to book a coaching session without creating an account.

**Steps:**
1. Read COMPLETE-FEATURE-INVENTORY.md (find Guest Checkout)
2. Read WELLNESS-DATA-MODEL.md (find bookings and payments tables)
3. Design the feature (guest checkout flow, data model, API)
4. Implement database schema (guestCheckouts table)
5. Implement backend API (create guest checkout, process payment)
6. Implement frontend UI (guest checkout form, payment form)
7. Test all paths (happy path, error cases, edge cases)
8. Deploy and monitor

### Example 2: Wearable Integration Feature

**Status:** Phase 1, Priority P1

**What it does:** Integrates with Apple Health, Fitbit, Oura, and other wearables to import biometric data.

**Steps:**
1. Read ENTERPRISE-SCALE-ARCHITECTURE.md (find Integration Layer)
2. Read WELLNESS-DATA-MODEL.md (find biometric tables)
3. Design the feature (which wearables, data sync, error handling)
4. Implement database schema (wearableIntegrations, biometricData tables)
5. Implement backend API (authorize wearable, sync data, store data)
6. Implement frontend UI (connect wearable, view synced data)
7. Test all paths (authorization, data sync, error cases)
8. Deploy and monitor

### Example 3: AI Coaching Enhancement

**Status:** MVP, Priority P0

**What it does:** Enhances the AI coach with personalized prompts, context awareness, and adaptive responses.

**Steps:**
1. Read ENTERPRISE-VISION-10YEAR-ROADMAP.md (understand AI strategy)
2. Read MASTER-PLATFORM-ARCHITECTURE.md (find AI/ML layer)
3. Design the feature (personalization, context, adaptation)
4. Implement backend service (build context, generate prompts)
5. Integrate with existing AI chat (use enhanced prompts)
6. Test all paths (personalization, context, responses)
7. Deploy and monitor

---

## Monitoring & Support

### Logging

All features should log important events:
- Feature usage (who, when, what)
- Errors and exceptions
- Performance metrics
- User actions

### Monitoring

Monitor your features in production:
- Error rates and types
- Response times
- User engagement
- Business metrics (conversions, retention)

### Support

If issues arise:
1. Check the logs
2. Check the monitoring dashboard
3. Create a bug report
4. Escalate if critical
5. Fix and deploy
6. Monitor the fix

---

## Continuous Learning

**Stay updated on platform changes:**
- Read the weekly engineering updates
- Attend monthly architecture reviews
- Review code changes from other teams
- Contribute to shared documentation

**Improve your skills:**
- Learn from code reviews
- Pair program with experienced developers
- Take online courses
- Contribute to open source

---

## Success Metrics

**Your feature is successful when:**
- Users adopt it and use it regularly
- It achieves the business metrics targets
- It has <0.1% error rate
- It has <100ms response time (p95)
- It has >80% test coverage
- It has clear documentation
- It integrates seamlessly with the platform

---

## Questions?

**Need help?** Reach out to:
- Your feature owner (see ORGANIZATIONAL-TEAM-STRUCTURE.md)
- The architecture team
- The platform team
- Your manager

**Have ideas?** Create a GitHub issue or discussion.

**Found a bug?** Create a bug report with reproduction steps.

---

**Welcome to the Purposeful Live Coaching development team. Let's build something amazing together! 🚀**
