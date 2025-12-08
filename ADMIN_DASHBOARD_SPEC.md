# Admin Monitoring Dashboard - Design Specification

## Overview
Comprehensive admin dashboard for monitoring all platform activity, AI responses, user sessions, and crisis detection in real-time.

## Access Control
- **Route:** `/admin/dashboard`
- **Auth:** Admin users only (check user role)
- **Security:** Protected route, redirect to login if not authenticated

## Layout Structure

### Sidebar Navigation
- Dashboard (overview)
- Live Sessions
- AI Responses
- Crisis Alerts
- Users
- Analytics
- Settings

### Main Content Area
- Real-time data display
- Interactive tables
- Charts and graphs
- Action buttons

## Pages

### 1. Dashboard Overview (`/admin/dashboard`)

**Key Metrics (Top Cards)**
- Active Sessions (real-time count)
- Total Users (all time)
- Crisis Alerts (last 24h)
- AI Responses (last 24h)

**Charts**
- Sessions over time (line chart, last 7 days)
- User growth (line chart, last 30 days)
- Module usage (bar chart)
- Crisis alerts by type (pie chart)

**Recent Activity Feed**
- Last 10 sessions created
- Last 10 AI responses
- Last 10 user signups
- Last 10 crisis alerts

### 2. Live Sessions (`/admin/sessions`)

**Session List (Real-time Table)**
Columns:
- Session ID
- User (anonymous or registered)
- Status (active/idle/ended)
- Started At
- Last Active
- Message Count
- Risk Score (0-100)
- Actions (View, End)

**Filters:**
- Status (all/active/idle/ended)
- Risk Level (all/low/medium/high/critical)
- Date Range

**Actions:**
- Click row → View full conversation
- End session button
- Export session data

### 3. Session Detail (`/admin/sessions/:id`)

**Session Info**
- Session ID
- User info (IP, user agent, referrer)
- Started at, Last active, Duration
- Status, Message count
- Risk score with breakdown

**Full Conversation**
- Chronological message list
- User messages (left, blue)
- AI responses (right, purple)
- Timestamps
- Sentiment indicators
- Risk flags

**AI Response Analysis**
- Response time
- Model used
- Confidence score
- Evidence-based citations
- Compliance checks

**Actions**
- Flag conversation
- Export transcript
- End session
- Escalate to human coach

### 4. AI Responses (`/admin/ai-responses`)

**Response List (Table)**
Columns:
- Timestamp
- Session ID
- User Message (truncated)
- AI Response (truncated)
- Response Time (ms)
- Confidence Score
- Compliance Status
- Actions (View, Flag)

**Filters:**
- Date Range
- Confidence Score (low/medium/high)
- Compliance Status (pass/warning/fail)
- Module (spiritual/mental/emotional/physical/financial)

**Actions:**
- View full response details
- Flag for review
- Add to response library
- Block similar responses

### 5. Crisis Alerts (`/admin/crisis`)

**Alert List (Table)**
Columns:
- Timestamp
- Session ID
- User
- Alert Type (suicide/self-harm/abuse/violence)
- Risk Score (0-100)
- Status (new/reviewing/resolved)
- Assigned To
- Actions (View, Resolve)

**Filters:**
- Status (new/reviewing/resolved)
- Alert Type
- Risk Score (critical/high/medium/low)
- Date Range

**Alert Detail Modal**
- Full conversation context
- Risk assessment breakdown
- Keyword matches
- Sentiment analysis
- Recommended actions
- Emergency resources provided
- Follow-up status

**Actions:**
- Assign to coach
- Mark as resolved
- Escalate to emergency services
- Add notes
- Export report

### 6. Users (`/admin/users`)

**User List (Table)**
Columns:
- User ID
- Name/Email
- Type (anonymous/registered)
- Joined Date
- Last Active
- Session Count
- Risk Score
- Status (active/suspended/deleted)
- Actions (View, Edit, Suspend)

**Filters:**
- User Type (all/anonymous/registered)
- Status (all/active/suspended/deleted)
- Risk Level
- Date Range

**User Detail Modal**
- Profile information
- Session history
- Module usage
- Progress metrics
- Crisis alerts
- Payment history
- Notes

**Actions:**
- View profile
- Edit user
- Suspend account
- Delete account
- Export data
- Send notification

### 7. Analytics (`/admin/analytics`)

**Engagement Metrics**
- Daily/Weekly/Monthly active users
- Session duration (avg/median)
- Message count per session
- Conversion rate (anonymous → registered)

**Module Usage**
- Most used modules
- Time spent per module
- Completion rates
- User satisfaction scores

**AI Performance**
- Response time (avg/p95/p99)
- Confidence scores distribution
- Compliance rate
- User feedback scores

**Crisis Detection**
- Alert frequency
- False positive rate
- Response time
- Resolution rate

**Revenue Metrics**
- MRR (Monthly Recurring Revenue)
- Churn rate
- ARPU (Average Revenue Per User)
- Conversion funnel

### 8. Settings (`/admin/settings`)

**AI Configuration**
- Model selection
- Temperature
- Max tokens
- System prompts
- Response guidelines

**Crisis Detection**
- Keyword lists
- Risk score thresholds
- Auto-escalation rules
- Emergency contacts

**Compliance**
- HIPAA settings
- Data retention policies
- Consent management
- Audit logging

**Notifications**
- Email alerts
- SMS alerts
- Webhook endpoints
- Alert thresholds

## Real-time Features

### WebSocket Connection
- Live session updates
- Real-time message streaming
- Crisis alert notifications
- System health monitoring

### Auto-refresh
- Session list: every 5 seconds
- Metrics: every 30 seconds
- Charts: every 60 seconds

## Design Guidelines

### Colors
- Primary: Purple (#9333EA)
- Success: Green (#10B981)
- Warning: Yellow (#F59E0B)
- Danger: Red (#EF4444)
- Info: Blue (#3B82F6)

### Risk Score Colors
- 0-25: Green (low)
- 26-50: Yellow (medium)
- 51-75: Orange (high)
- 76-100: Red (critical)

### Typography
- Headings: Bold, 24px/18px/16px
- Body: Regular, 14px
- Small: 12px
- Monospace for IDs/timestamps

### Components
- shadcn/ui components
- Tailwind CSS utilities
- Lucide icons
- Recharts for graphs

## Technical Implementation

### Frontend
- React + TypeScript
- Wouter for routing
- TRPC for API calls
- TanStack Query for caching
- Recharts for charts
- Socket.io for real-time

### Backend
- New TRPC router: `adminRouter`
- Protected procedures (admin only)
- Real-time subscriptions
- Database queries with pagination

### Database
- Use existing tables
- Add admin-specific views
- Create indexes for performance

## Security

### Authentication
- Admin role check on every request
- JWT token validation
- Session timeout (30 minutes)

### Authorization
- Role-based access control
- Action logging
- IP whitelisting (optional)

### Audit Trail
- Log all admin actions
- Track data access
- Export audit logs

## Performance

### Optimization
- Pagination (50 items per page)
- Virtual scrolling for long lists
- Lazy loading for charts
- Debounced search
- Cached queries (5 minutes)

### Scalability
- Database indexes
- Query optimization
- CDN for static assets
- Redis for caching (future)

## Next Steps

1. Create admin router (backend)
2. Build dashboard overview page
3. Implement live sessions page
4. Add session detail view
5. Build crisis alerts page
6. Implement real-time updates
7. Add analytics charts
8. Create settings page
9. Test with real data
10. Deploy to production

---

**Estimated Development Time:** 6-8 hours
**Priority:** CRITICAL (needed for platform monitoring)
