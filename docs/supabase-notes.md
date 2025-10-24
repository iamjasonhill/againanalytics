# Supabase Notes

## Project Creation
- Create a new Supabase project (region close to primary user base).
- Choose the Pro plan if higher retention or PITR is required.
- Note the generated project reference ID and connect it to the Supabase CLI (`supabase projects list`).

## Database Credentials
- Collect the following from the Supabase dashboard:
  - `DB_HOST`
  - `DB_PORT`
  - `DB_USER`
  - `DB_PASSWORD`
  - `DB_NAME`
  - `DB_SSL` settings
- Construct `DATABASE_URL` compatible with Umami (`postgres://user:pass@host:port/dbname`).

## Supabase CLI Usage
- Login: `supabase login`
- Link project: `supabase link --project-ref <project-ref>`
- Manage migrations if we maintain custom schema adjustments: `supabase db push` / `supabase migration new <name>`

## Access Control
- Restrict service role key usage; only expose anon key if public API access is required.
- Rotate keys periodically and update Vercel environment variables.

## Backups & PITR
- Enable daily backups via Supabase dashboard.
- If PITR (Point-in-Time Recovery) is available, configure retention to meet compliance needs.
- Document restore procedures in the runbook.

## Monitoring
- Enable database logs and performance insights.
- Set up alerts for connection spikes, CPU usage, or storage growth.

## Security
- Enforce SSL connections.
- Limit Supabase project access to necessary team members via roles.
