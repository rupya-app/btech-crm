# Digital Sales CRM — Enterprise Web Application

A complete, production-ready Digital Sales CRM built with Next.js App Router, TypeScript, Tailwind CSS, shadcn/ui, Supabase PostgreSQL, and Row Level Security (RLS).

---

## 1. Features & Delivered Modules

### Role-Based Access Control (RBAC)
- **Admin Experience**: Complete command center, company-wide metrics, Excel/CSV ingestion, employee management, workload distribution, and audit logging.
- **Employee Experience**: Dedicated sales rep workspace with personal leads, self-selection lead pool, telecalling logs, and personal conversion tracking.
- **Custom Employee ID Authentication**: Employees log in using their assigned Employee ID (`EMP1001`) and password. Server-side identity resolution maps employee IDs to credentials without exposing sensitive database keys.
- **Mandatory Password Change**: First-time login forces temporary password update before workspace access.
- **Immediate Session Revocation**: Deactivating an employee in the directory immediately revokes workspace access.

### Lead Management
- **High-Performance Lead Table**: Server-side pagination, search, status filtering, priority badges, and bulk actions built to scale to 50,000+ records.
- **Direct Communication Channels**:
  - `tel:` links for immediate click-to-call dialing.
  - `wa.me` links utilizing normalized international phone numbers (`+91...`).
  - Direct mailto links.
- **Chronological Remarks**: Immutable conversation notes capturing author employee and timestamp. Historical remarks are never overwritten.
- **Activity Timeline**: Full audit trail of calls, outcomes (Connected, Busy, No Answer, etc.), duration in seconds, status transitions, and follow-ups.
- **Confirmation Workflow**: Marking a lead as "Confirmed" triggers a deal confirmation dialog requiring verification notes, logging employee identity and exact timestamps.

### Excel & CSV Import System
- **7-Step Import Wizard**:
  1. File Upload (drag-and-drop, format validation, size limit checks).
  2. Smart Column Mapping (auto-detection of synonyms for business name, contact, phone, email, address, etc.).
  3. Interactive Preview of mapped dataset.
  4. Pre-import Validation Engine (missing required business names, phone format verification, duplicate phone & email detection).
  5. Confirmation step with summary counts.
  6. Background Batch Processing with progress bar and recoverable job states.
  7. Results Summary with rejected rows download.
- **Import History**: Persistent log of all past uploads, row counts, duplicate rates, and timestamps.

### Lead Distribution & Claiming
- **Admin Allocation**: Single assignment, round-robin equal distribution, or workload-balanced distribution based on sales rep capacity.
- **Self-Selection Lead Pool**: Employees browse unassigned leads with privacy-preserved preview (phone numbers locked).
- **Atomic Lead Claiming**: Database row-level locks (`claim_lead` procedure) protect against race conditions when multiple representatives claim the same lead simultaneously.

### Follow-up & Scheduling
- Dedicated reminder tracking categorized by Due Today, Overdue, Scheduled, and Completed.
- One-click call actions and task completion triggers.

### Reports & Data Exports
- Export leads by pipeline status, employee performance summaries, and call audit logs in both CSV and Excel (.xlsx) formats.
- Date range and status filtering.

---

## 2. Technology Stack & Design System

- **Framework**: Next.js 16 (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS v4, shadcn/ui design tokens, Inter typography
- **Database & Auth**: Supabase PostgreSQL with Row Level Security (RLS), custom stored procedures (`claim_lead`, `assign_leads_bulk`, `record_lead_interaction`)
- **Icons & Motion**: Lucide React, Motion for React (Framer Motion)
- **Validation & Parsing**: Zod, React Hook Form, ExcelJS, CSV
- **Testing**: Vitest, React Testing Library

---

## 3. Database Schema & Migration Setup

The complete normalized PostgreSQL schema is located in:
`supabase/migrations/01_initial_schema.sql`

Seed sample leads and tags are in:
`supabase/seed.sql`

### Running Migrations in Supabase
1. Open your Supabase Project Dashboard.
2. Navigate to the **SQL Editor**.
3. Paste the contents of `supabase/migrations/01_initial_schema.sql` and run.
4. Paste the contents of `supabase/seed.sql` to populate sample leads.

---

## 4. Environment Configuration

Create a `.env.local` file in the project root:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

NEXT_PUBLIC_APP_NAME="Digital Sales CRM"
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_DEFAULT_TIMEZONE=Asia/Kolkata
```

> **Local Demo Mode**: The application includes integrated local state handlers and seed data so all views, tables, forms, filters, and workflows can be previewed immediately even prior to configuring external Supabase keys.

---

## 5. Quick Start & Development

```bash
# Install dependencies
npm install

# Run automated unit tests
npx vitest run

# Run TypeScript type check
npx tsc --noEmit

# Build production bundle
npm run build

# Start local server
npm run dev
```

Visit `http://localhost:3000`.

### Default Demo Credentials:
- **Admin**: `admin@digitalcrm.com` / `admin123`
- **Employee**: `EMP1001` / `emp123`
# btech-crm
# btech-crm
