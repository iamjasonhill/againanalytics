# Supabase Notes

## Project Creation
- **Organization**: `jason@jasonhill.com.au` (`ehidntcmoonawynpgwym`)
- **Project**: `again-analytics` (`kifxhefliydilggdtmad`)
- Region: TBD (expected `Southeast Asia (Singapore)`)
- Creation date: _(add once created)_

## Database Credentials (to capture)
- `DB_HOST`: 
- `DB_PORT`: 
- `DB_USER`: 
- `DB_PASSWORD`: 
- `DB_NAME`: 
- `DB_SSL`: 
- `DATABASE_URL`: 

## Supabase CLI Usage
- Login: `supabase login`
- List orgs: `supabase orgs list`
- Create project: `supabase projects create --org <org-id> --name again-analytics --password <db-password> --plan <tier>`
- Link project (once created): `supabase link --project-ref <project-ref>`
- Manage migrations if needed: `supabase db push`, `supabase migration new <name>`

## Access Control
- Restrict service role key usage; never expose publicly.
- Store `DATABASE_URL` and `HASH_SALT` in Vercel env vars.
- Rotate DB password/service key on schedule; update `.env.local` and Vercel secrets accordingly.

## Backups & PITR
- Enable daily backups via Supabase settings.
- Consider PITR for production (requires paid plan).
- Document restore steps here after first backup.

## Monitoring
- Enable database logs and performance insights in Supabase.
- Set alerts for connection usage, CPU, and storage growth.

## Security
- Force SSL connections for all clients.
- Limit Supabase console access to necessary team members.
