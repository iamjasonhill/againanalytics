## Deployment Plan

### 1. Repository Setup
- Initialize Git repository inside `Again Analytics/`.
- Add Umami upstream source as a Git submodule or fork into `umami/` directory.
- Commit baseline scaffolding and push to GitHub (private repo).

### 2. Infrastructure Provisioning
- **Supabase Postgres**
  - Create new Supabase project for analytics data.
  - Record connection string, service role key, and access policies.
- **Vercel Project**
  - Create Vercel project pointing to the GitHub repo.
  - Configure environment variables (`DATABASE_URL`, `HASH_SALT`, `NEXT_PUBLIC_APP_URL`, etc.).
- **Domain**
  - Add `analytics.again.com.au` as a Vercel custom domain.
  - Update DNS records (CNAME) once staging is ready.

### 3. Local Development
- Use `docker-compose up` to run Umami + Postgres locally.
- Configure `.env.local` with local database connection and hash salt.
- Verify initial admin user creation and site creation works.

### 4. CI/CD Configuration
- Define GitHub Actions workflow for lint/build/test steps (if needed).
- Leverage Vercel automatic deployments for preview and production.
- Optionally add Supabase migrations or schema checks via Supabase CLI.

### 5. Staging Deployment
- Deploy to Vercel using staging branch.
- Point staging domain (e.g., `analytics-staging.again.com.au`) to Vercel.
- Create sample sites in Umami and validate tracking from a staging instance of `UTM Genie`.

### 6. Production Cutover
- Deploy main branch to production Vercel environment.
- Update DNS for `analytics.again.com.au`.
- Ensure environment secrets are set for production.
- Create production organizations/sites in Umami.

### 7. Integration with Again Products
- Retrieve `website_id` for each site from Umami UI.
- Inject tracking script into `UTM Genie` (and future apps) using environment toggle.
- Validate events appear in production Umami.

### 8. Operations & Maintenance
- Set up automated database backups in Supabase (verify retention).
- Document runbook for upgrades (Umami release cycle, applying migrations).
- Monitor Vercel deployments, Supabase metrics, and error logs.
- Establish policy for user management (admin creation, password resets).
