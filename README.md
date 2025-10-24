# Again Analytics

Again Analytics is our internal deployment of the open-source [Umami](https://umami.is/) analytics platform. This project collects the infrastructure, configuration, and documentation required to operate Umami under the `analytics.again.com.au` subdomain, with Supabase/Postgres as the database and Vercel as the primary hosting target.

## Goals

- Self-host Umami with built-in authentication and support for multiple tracked domains.
- Keep deployment repeatable via infrastructure-as-code and CLI tooling (Supabase CLI, Vercel CLI, Docker Compose).
- Provide clear documentation for onboarding, operating, and upgrading the analytics stack.
- Integrate tracking scripts across Again products (starting with `UTM Genie`).

## Project Structure

```
Again Analytics/
├─ README.md                 # High-level project overview (this file)
├─ .gitignore                # Node/Umami specific ignore rules (to be added)
├─ .env.example              # Sample environment configuration for local/dev
├─ docker-compose.yml        # Local development stack (Umami + Postgres)
├─ vercel.json               # Vercel deployment configuration scaffold
├─ docs/
│  ├─ deployment-plan.md     # Detailed rollout plan & checklist
│  └─ supabase-notes.md      # DB provisioning and credential management notes
└─ umami/                    # Placeholder for upstream Umami source (Git submodule/fork to be added)
```

## Environment Targets

- **Local development**: Docker Compose stack with Umami and Postgres for testing integrations.
- **Cloud deployment**: Vercel hosting for the Umami Next.js app, backed by Supabase (hosted Postgres). Reverse proxy/edge config handled by Vercel.

## Next Steps

1. Populate `.gitignore`, `.env.example`, and supporting configuration files.
2. Bring Umami source into the `umami/` directory (git submodule or fork).
3. Use Supabase CLI to provision the production Postgres instance (or connect to existing project) and capture credentials in `docs/supabase-notes.md`.
4. Configure Vercel project settings (`DATABASE_URL`, `HASH_SALT`, etc.) once the repository is pushed to GitHub.
5. Deploy to a staging environment, verify tracking script integration, then cut over to production.

Refer to `docs/deployment-plan.md` for the detailed implementation checklist.
