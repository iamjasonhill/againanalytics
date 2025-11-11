# Umami Enhancement Proposal: Enhanced Per-Domain Analytics

## Current State Analysis

### What Umami Currently Tracks Per Domain

Based on the database schema and codebase analysis, Umami v3.0.0 currently tracks:

#### **Session-Level Data** (`session` table)
- Browser (e.g., Chrome, Firefox)
- Operating System (e.g., Windows, macOS, iOS)
- Device type (e.g., desktop, mobile, tablet)
- Screen resolution
- Language
- Geographic: Country, Region, City
- Distinct ID (for user identification)
- Created timestamp

#### **Event-Level Data** (`website_event` table)
- URL path and query parameters
- Page title
- Hostname
- Referrer information (path, query, domain)
- UTM parameters (source, medium, campaign, content, term)
- Click IDs (gclid, fbclid, msclkid, ttclid, etc.)
- Event type (pageview, custom event)
- Event name and tag
- Custom event data (via `EventData` table)

#### **Current Metrics Available**
- Pageviews
- Unique Visitors (sessions)
- Visits
- Bounce rate
- Average session duration
- Channel attribution (direct, referral, organic search, paid ads, etc.)

#### **Current Reports Available**
- Attribution reports
- Breakdown reports
- Funnel analysis
- Goals tracking
- Journey analysis
- Retention analysis
- Revenue tracking
- UTM parameter analysis
- Real-time analytics
- Session details

---

## Enhancement Opportunities

### 1. **Enhanced User Behavior Tracking**

#### **A. Scroll Depth Tracking**
- Track how far users scroll on each page
- Identify where users drop off
- Measure content engagement

**Implementation:**
- Add `scrollDepth` field to `WebsiteEvent` table (0-100%)
- Modify tracker script to send scroll events
- Create scroll depth report showing average scroll depth per page

#### **B. Time on Page / Element**
- Track time spent on each page
- Track time spent viewing specific elements (e.g., videos, forms)
- Identify engaging vs. quick-exit pages

**Implementation:**
- Add `timeOnPage` field to `WebsiteEvent` (in seconds)
- Use `visibilitychange` API to track active time
- Create "Engagement Time" metric in dashboard

#### **C. Click Heatmaps (Aggregated)**
- Track click positions on pages
- Identify most-clicked areas
- Understand user interaction patterns

**Implementation:**
- Add `clickX` and `clickY` fields to `WebsiteEvent`
- Store normalized coordinates (0-100%)
- Create heatmap visualization report

#### **D. Form Interaction Tracking**
- Track form field interactions
- Measure form abandonment
- Identify problematic form fields

**Implementation:**
- Add `formId` and `formField` to event data
- Track focus/blur events on form fields
- Create form analytics report

---

### 2. **Enhanced Technical Metrics**

#### **A. Performance Metrics**
- Page load time
- Time to First Byte (TTFB)
- Largest Contentful Paint (LCP)
- First Input Delay (FID)
- Cumulative Layout Shift (CLS)

**Implementation:**
- Use Web Vitals API
- Add `performance` JSON field to `WebsiteEvent`
- Create performance dashboard
- Alert on performance degradation

#### **B. Error Tracking**
- JavaScript errors
- Failed resource loads
- API errors
- Console errors

**Implementation:**
- Add `errorType`, `errorMessage`, `errorStack` to event data
- Listen to `window.onerror` and `unhandledrejection`
- Create error tracking report
- Group errors by type and page

#### **C. Network Information**
- Connection type (4G, WiFi, etc.)
- Effective connection type
- Downlink speed
- RTT (Round Trip Time)

**Implementation:**
- Use Network Information API
- Add `networkInfo` JSON field to `SessionData`
- Correlate performance with network conditions

---

### 3. **Enhanced Content Analytics**

#### **A. Content Engagement**
- Video play/pause/complete events
- PDF downloads
- External link clicks
- File downloads

**Implementation:**
- Extend event tracking for media events
- Add `contentType` and `contentId` to events
- Create content engagement report

#### **B. Search Analytics**
- Internal site search queries
- Search result clicks
- Zero-result searches

**Implementation:**
- Track search form submissions
- Store search query in event data
- Create search analytics report

#### **C. A/B Test Tracking**
- Track which variant users see
- Measure conversion by variant
- Statistical significance testing

**Implementation:**
- Add `experimentId` and `variantId` to session/event data
- Create A/B test report
- Show conversion rates by variant

---

### 4. **Enhanced User Segmentation**

#### **A. Custom User Properties**
- User roles (logged-in user types)
- Subscription tiers
- Customer lifetime value
- User preferences

**Implementation:**
- Extend `SessionData` table usage
- Create user properties management UI
- Filter reports by user properties

#### **B. Behavioral Cohorts**
- First-time vs. returning visitors
- High-intent users (multiple pageviews)
- Cart abandoners
- Power users

**Implementation:**
- Use existing `Segment` table
- Create cohort builder UI
- Track cohort performance over time

#### **C. Device/Technology Stack**
- Browser version (not just name)
- OS version
- Viewport size categories
- Touch vs. mouse users

**Implementation:**
- Enhance device detection
- Store more granular device info
- Create device breakdown reports

---

### 5. **Enhanced Conversion Tracking**

#### **A. Multi-Step Funnels**
- Track complex conversion paths
- Identify drop-off points
- Measure time between steps

**Implementation:**
- Enhance existing funnel feature
- Add step timing
- Visualize conversion paths

#### **B. Goal Value Tracking**
- Assign monetary values to goals
- Calculate ROI per channel
- Revenue attribution

**Implementation:**
- Extend `Revenue` table usage
- Link goals to revenue
- Create ROI reports

#### **C. Micro-Conversions**
- Newsletter signups
- Social shares
- Comment submissions
- Video completions

**Implementation:**
- Use custom events
- Create micro-conversion dashboard
- Track conversion rates

---

### 6. **Enhanced Geographic & Temporal Insights**

#### **A. Time Zone Analysis**
- User local time zones
- Peak activity times by timezone
- Time-based content performance

**Implementation:**
- Store user timezone in session
- Create timezone-based reports
- Show activity heatmaps by hour/timezone

#### **B. Weather Correlation** (Optional)
- Correlate traffic with weather
- Identify weather-sensitive content

**Implementation:**
- Integrate weather API
- Store weather data with sessions
- Create weather correlation reports

---

### 7. **Enhanced Attribution & Marketing**

#### **A. Multi-Touch Attribution**
- First-touch attribution
- Last-touch attribution
- Linear attribution
- Time-decay attribution

**Implementation:**
- Enhance attribution logic
- Store full attribution path
- Create multi-touch attribution reports

#### **B. Campaign Performance**
- Campaign ROI
- Cost per acquisition
- Lifetime value by campaign

**Implementation:**
- Link campaigns to revenue
- Import ad spend data (manual or API)
- Create campaign ROI dashboard

#### **C. Social Media Tracking**
- Social share tracking
- Social referral analysis
- Social engagement metrics

**Implementation:**
- Track social share buttons
- Enhance social domain detection
- Create social media report

---

### 8. **Enhanced Real-Time Features**

#### **A. Live User Sessions**
- See active users in real-time
- Watch user journeys live
- Real-time chat/assistance triggers

**Implementation:**
- Enhance real-time dashboard
- Add WebSocket support
- Show live user paths

#### **B. Real-Time Alerts**
- Traffic spikes
- Error rate increases
- Performance degradation
- Goal completion alerts

**Implementation:**
- Add alerting system
- Configurable thresholds
- Email/Slack notifications

---

## Implementation Priority Recommendations

### **Phase 1: Quick Wins (High Value, Low Effort)**
1. **Time on Page** - Simple to implement, high value
2. **Scroll Depth** - Easy tracking, useful insights
3. **Error Tracking** - Critical for debugging
4. **Enhanced Device Info** - Browser/OS versions

### **Phase 2: Medium Effort (High Value)**
1. **Performance Metrics** - Web Vitals integration
2. **Form Analytics** - Track form interactions
3. **Content Engagement** - Video/PDF tracking
4. **Multi-Touch Attribution** - Enhanced marketing insights

### **Phase 3: Advanced Features (High Value, Higher Effort)**
1. **Click Heatmaps** - Requires visualization
2. **A/B Test Tracking** - Statistical analysis needed
3. **Real-Time Alerts** - Infrastructure required
4. **Campaign ROI** - Requires external data integration

---

## Technical Considerations

### **Database Schema Changes**
- Most enhancements can use existing `EventData` and `SessionData` tables
- Some may require new fields in `WebsiteEvent` or `Session` tables
- Consider migration strategy for existing data

### **Tracker Script Enhancements**
- Extend `/script.js` to capture additional events
- Use modern browser APIs (Performance, Intersection Observer, etc.)
- Maintain privacy compliance (GDPR, CCPA)

### **Performance Impact**
- Additional events = more database writes
- Consider batching events
- Use ClickHouse for high-volume sites (already supported)

### **Privacy & Compliance**
- Ensure all tracking is opt-in where required
- Provide data deletion capabilities
- Anonymize sensitive data

---

## Next Steps

1. **Prioritize Features** - Review this list and identify top 3-5 features
2. **Design Database Changes** - Plan schema modifications
3. **Update Tracker Script** - Enhance data collection
4. **Create Reports** - Build visualization components
5. **Test & Deploy** - Test with real traffic, deploy incrementally

---

## Questions to Consider

1. **What specific insights are you missing?** - This will help prioritize
2. **What's your traffic volume?** - Affects implementation approach
3. **Do you need real-time or batch processing?** - Impacts architecture
4. **What's your primary use case?** - E-commerce, content, SaaS, etc.
5. **Do you have specific compliance requirements?** - GDPR, HIPAA, etc.

---

Would you like me to:
1. **Dive deeper into any specific enhancement?**
2. **Create implementation plans for prioritized features?**
3. **Start implementing a specific feature?**
4. **Create database migration scripts?**

