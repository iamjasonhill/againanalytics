# Multi-Domain Reports & Quick Analytics Implementation Plan

## Overview

This document outlines the implementation plan for:
1. **Multi-domain report support** - Run reports across multiple selected domains
2. **Quick date range presets** - 7/14/28 days buttons for fast access
3. **Report templates** - Save and reuse report configurations across domains
4. **Quick metrics dashboard** - View key metrics without running full reports

---

## Current Limitations

### What's Missing:
1. **No multi-domain support** - Reports are tied to a single `websiteId`
2. **No quick date presets** - Must manually select date ranges
3. **No report templates** - Each report is domain-specific, can't reuse
4. **No quick metrics view** - Must run full reports to see basic data

### Current Structure:
- Reports store: `websiteId` (single), `dateRange`, `type`, `parameters`
- Queries filter by: `WHERE website_id = {{websiteId::uuid}}`
- Date ranges: Custom selection via `DateFilter` component
- Report creation: Domain-specific, saved to database

---

## Implementation Plan

### Phase 1: Quick Date Range Presets (Easiest, High Value)

#### **Changes Required:**

1. **Update `DateFilter` Component**
   - Add preset buttons: "7 days", "14 days", "28 days", "30 days", "90 days"
   - Keep existing custom date picker
   - Store preset selection in dateRange.value

2. **Update Date Range Parsing**
   - Extend `parseDateRange()` in `src/lib/date.ts`
   - Add preset values: `7d`, `14d`, `28d`, `30d`, `90d`
   - Calculate start/end dates from presets

3. **Update Report Parameters**
   - No schema changes needed
   - Presets stored in `dateRange.value` (e.g., "7d", "14d")

**Files to Modify:**
- `src/components/input/DateFilter.tsx` - Add preset buttons
- `src/lib/date.ts` - Add preset parsing logic
- `src/app/(main)/reports/[reportId]/BaseParameters.tsx` - Show presets

**Estimated Effort:** 2-3 hours

---

### Phase 2: Multi-Domain Report Support (Medium Complexity)

#### **Database Schema Changes:**

```prisma
model Report {
  // ... existing fields ...
  websiteIds    String[]?  @map("website_ids") @db.Uuid[]  // NEW: Array of website IDs
  // Keep websiteId for backward compatibility (single domain reports)
}
```

**Migration Strategy:**
- Add `websiteIds` as nullable array
- Keep `websiteId` for backward compatibility
- Migrate existing reports: `websiteIds = [websiteId]`

#### **API Changes:**

1. **Update Report Schema** (`src/lib/schema.ts`)
```typescript
export const reportParms = {
  websiteId: z.string().uuid().optional(),  // Make optional
  websiteIds: z.array(z.string().uuid()).optional(),  // NEW: Array support
  dateRange: z.object({...}),
};
```

2. **Update Report API** (`src/app/api/reports/utm/route.ts`)
```typescript
// Support both single and multi-domain
const { websiteId, websiteIds } = body;
const domains = websiteIds?.length ? websiteIds : [websiteId];

// Check permissions for all domains
for (const id of domains) {
  if (!(await canViewWebsite(auth, id))) {
    return unauthorized();
  }
}

// Query multiple domains
const data = await getUTM(domains, { startDate, endDate, timezone });
```

3. **Update Query Functions** (`src/queries/sql/reports/getUTM.ts`)
```typescript
export async function getUTM(
  websiteIds: string | string[],  // Accept single or array
  filters: { startDate: Date; endDate: Date; timezone?: string }
) {
  const ids = Array.isArray(websiteIds) ? websiteIds : [websiteIds];
  
  return runQuery({
    [PRISMA]: () => relationalQuery(ids, filters),
    [CLICKHOUSE]: () => clickhouseQuery(ids, filters),
  });
}

async function relationalQuery(
  websiteIds: string[],
  filters: {...}
) {
  return rawQuery(
    `
    select url_query, count(*) as "num"
    from website_event
    where website_id = ANY({{websiteIds::uuid[]}})  -- PostgreSQL array
      and created_at between {{startDate}} and {{endDate}}
      and coalesce(url_query, '') != ''
      and event_type = 1
    group by 1
    `,
    { websiteIds, startDate, endDate }
  );
}
```

#### **UI Changes:**

1. **Update `BaseParameters.tsx`**
   - Replace `WebsiteSelect` with `MultiWebsiteSelect` component
   - Show selected domains as chips/tags
   - Allow adding/removing domains

2. **Create `MultiWebsiteSelect` Component**
   - Multi-select dropdown with checkboxes
   - Show domain names
   - Allow "Select All" for team websites
   - Display selected count

3. **Update Report Views**
   - Show which domains are included
   - Aggregate data across domains
   - Optionally show breakdown by domain

**Files to Create:**
- `src/components/input/MultiWebsiteSelect.tsx`

**Files to Modify:**
- `src/lib/schema.ts` - Add websiteIds support
- `src/app/api/reports/**/route.ts` - All report endpoints
- `src/queries/sql/reports/*.ts` - All report queries
- `src/app/(main)/reports/[reportId]/BaseParameters.tsx`
- `src/app/(main)/reports/[reportId]/ReportHeader.tsx` - Show domain list

**Estimated Effort:** 8-12 hours

---

### Phase 3: Report Templates (Medium Complexity)

#### **Database Schema Changes:**

```prisma
model ReportTemplate {
  id          String    @id @unique @map("report_template_id") @db.Uuid
  userId      String    @map("user_id") @db.Uuid
  teamId      String?   @map("team_id") @db.Uuid
  name        String    @db.VarChar(200)
  description String    @db.VarChar(500)
  type        String    @db.VarChar(200)  // Report type (utm, funnel, etc.)
  parameters  Json      // Report parameters (without websiteIds/dateRange)
  isPublic    Boolean   @default(false) @map("is_public")
  createdAt   DateTime? @default(now()) @map("created_at")
  updatedAt   DateTime? @updatedAt @map("updated_at")
  
  user User? @relation(fields: [userId], references: [id])
  team Team? @relation(fields: [teamId], references: [id])
  
  @@index([userId])
  @@index([teamId])
  @@map("report_template")
}
```

#### **API Endpoints:**

1. **GET `/api/report-templates`** - List templates
2. **POST `/api/report-templates`** - Create template
3. **PUT `/api/report-templates/[id]`** - Update template
4. **DELETE `/api/report-templates/[id]`** - Delete template
5. **POST `/api/report-templates/[id]/run`** - Run template with selected domains/date

#### **UI Changes:**

1. **Report Templates Page**
   - List saved templates
   - "Create from Report" button on existing reports
   - "Use Template" button to run with selected domains

2. **Template Creation Modal**
   - Save current report configuration as template
   - Exclude domain/date selections (those are set when running)
   - Name, description, make public/private

3. **Template Runner**
   - Select template
   - Select domains (multi-select)
   - Select date range
   - Run report

**Files to Create:**
- `src/app/api/report-templates/route.ts`
- `src/app/api/report-templates/[id]/route.ts`
- `src/app/(main)/reports/templates/page.tsx`
- `src/app/(main)/reports/templates/ReportTemplatesPage.tsx`
- `src/app/(main)/reports/templates/TemplateRunner.tsx`

**Files to Modify:**
- `src/app/(main)/reports/[reportId]/ReportHeader.tsx` - Add "Save as Template"
- `src/app/(main)/reports/create/ReportTemplates.tsx` - Add template list

**Estimated Effort:** 10-15 hours

---

### Phase 4: Quick Metrics Dashboard (Lower Priority)

#### **New Component: Quick Metrics View**

A lightweight dashboard showing key metrics without running full reports.

**Features:**
- Pre-selected date ranges (7/14/28 days)
- Multi-domain selection
- Key metrics: Pageviews, Visitors, Bounce Rate, Avg Session Duration
- UTM summary (top sources, campaigns)
- Top pages
- Top referrers
- Quick filters (device, country, etc.)

**Implementation:**
- New route: `/websites/quick-metrics` or `/dashboard/quick`
- Reuse existing query functions
- Lightweight UI, fast loading
- Export to CSV option

**Files to Create:**
- `src/app/(main)/dashboard/quick/page.tsx`
- `src/app/(main)/dashboard/quick/QuickMetricsPage.tsx`
- `src/app/(main)/dashboard/quick/QuickMetricsBar.tsx`
- `src/app/(main)/dashboard/quick/QuickMetricsCharts.tsx`

**Estimated Effort:** 6-8 hours

---

## Implementation Order

### **Recommended Sequence:**

1. **Phase 1: Quick Date Presets** (2-3 hours)
   - Immediate value
   - Low risk
   - No database changes

2. **Phase 2: Multi-Domain Support** (8-12 hours)
   - High value
   - Requires database migration
   - Core feature request

3. **Phase 3: Report Templates** (10-15 hours)
   - Builds on Phase 2
   - Reusability value
   - Better UX

4. **Phase 4: Quick Metrics** (6-8 hours)
   - Nice to have
   - Can be done independently

**Total Estimated Time:** 26-38 hours

---

## Technical Considerations

### **Database Migration**

```sql
-- Add websiteIds array column
ALTER TABLE report 
ADD COLUMN website_ids UUID[];

-- Migrate existing data
UPDATE report 
SET website_ids = ARRAY[website_id] 
WHERE website_id IS NOT NULL;

-- Create index
CREATE INDEX report_website_ids_idx ON report USING GIN (website_ids);
```

### **Backward Compatibility**

- Keep `websiteId` field for single-domain reports
- Support both `websiteId` and `websiteIds` in API
- Auto-convert: if `websiteIds` empty but `websiteId` set, use `websiteId`

### **Performance**

- Multi-domain queries may be slower
- Consider:
  - Indexing on `website_id` (already exists)
  - Using ClickHouse for high-volume sites
  - Caching results for common queries
  - Limiting max domains per report (e.g., 10)

### **Permissions**

- Check `canViewWebsite()` for each selected domain
- If user can't view any domain, return unauthorized
- Show only domains user has access to in selector

---

## Example Usage Scenarios

### **Scenario 1: UTM Tracking Across Multiple Domains**
1. User selects: "7 days" preset
2. User selects: Domain A, Domain B, Domain C
3. User runs "UTM Report" template
4. Report shows combined UTM data across all 3 domains
5. Option to view breakdown by domain

### **Scenario 2: Saved Report Template**
1. User creates UTM report for Domain A
2. User clicks "Save as Template" → "UTM Campaign Analysis"
3. Later, user selects template
4. User selects: Domain B, Domain C, Domain D
5. User selects: "28 days"
6. Report runs with same configuration across new domains

### **Scenario 3: Quick Metrics Check**
1. User goes to Quick Metrics dashboard
2. Selects: "14 days" preset
3. Selects: All team domains
4. Sees: Combined pageviews, visitors, top pages, top UTMs
5. No need to run full reports

---

## UI Mockups / Wireframes

### **Multi-Website Selector**
```
┌─────────────────────────────────────┐
│ Select Domains              [×]     │
├─────────────────────────────────────┤
│ ☑ example.com                        │
│ ☑ another-site.com                   │
│ ☐ third-domain.com                   │
│ ☐ fourth-site.com                    │
│                                     │
│ [Select All] [Clear]                │
│ Selected: 2 domains                 │
└─────────────────────────────────────┘
```

### **Quick Date Presets**
```
┌─────────────────────────────────────┐
│ Date Range                          │
├─────────────────────────────────────┤
│ [7 days] [14 days] [28 days]       │
│ [30 days] [90 days] [Custom...]    │
│                                     │
│ Selected: 14 days                   │
│ Nov 27 - Dec 11, 2024              │
└─────────────────────────────────────┘
```

### **Report Header with Domains**
```
┌─────────────────────────────────────┐
│ UTM Report                          │
│ Domains: example.com, another.com   │
│ Date: 14 days (Nov 27 - Dec 11)    │
│                                     │
│ [Edit] [Save as Template] [Run]    │
└─────────────────────────────────────┘
```

---

## Testing Plan

### **Unit Tests**
- Date range preset parsing
- Multi-domain query generation
- Permission checks
- Template creation/loading

### **Integration Tests**
- Multi-domain report generation
- Template save/load/run
- Date preset application
- Permission enforcement

### **Manual Testing**
- Select multiple domains
- Run reports with presets
- Create and use templates
- Verify data aggregation
- Test with different user permissions

---

## Questions to Resolve

1. **Max domains per report?** (Recommend: 10-20)
2. **Template sharing?** (Team-wide vs. user-only)
3. **Default date preset?** (Recommend: 28 days)
4. **Show domain breakdown?** (Toggle to show/hide per-domain data)
5. **Performance limits?** (Warn if too many domains/too long date range)

---

## Next Steps

1. **Review and prioritize** - Which phases to implement first?
2. **Database migration** - Plan migration strategy
3. **Start with Phase 1** - Quick date presets (low risk, high value)
4. **Iterate** - Get feedback, adjust approach

Would you like me to:
1. **Start implementing Phase 1** (Quick Date Presets)?
2. **Create the database migration** for Phase 2?
3. **Build the MultiWebsiteSelect component**?
4. **Dive deeper into any specific phase**?

