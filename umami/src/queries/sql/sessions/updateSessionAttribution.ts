import prisma from '@/lib/prisma';

interface UpdateSessionAttributionArgs {
  sessionId: string;
  websiteId: string;
  channel: string;
  strength: number;
  reason: Record<string, unknown>;
  rawSource?: string;
  rawMedium?: string;
  rawCampaign?: string;
  rawContent?: string;
  rawTerm?: string;
  rawReferrerDomain?: string;
}

export async function updateSessionAttribution({
  sessionId,
  websiteId,
  channel,
  strength,
  reason,
  rawSource,
  rawMedium,
  rawCampaign,
  rawContent,
  rawTerm,
  rawReferrerDomain,
}: UpdateSessionAttributionArgs) {
  const reasonJson = JSON.stringify(reason ?? {});

  // Ensure first-touch attribution only if it has not been set previously
  await prisma.rawQuery(
    `
      update session
      set channel_first = coalesce(channel_first, {{channel::text}}),
          channel_strength_first = coalesce(channel_strength_first, {{strength::smallint}})
      where session_id = {{sessionId::uuid}}
        and website_id = {{websiteId::uuid}};
    `,
    {
      channel,
      strength,
      sessionId,
      websiteId,
    },
  );

  await prisma.rawQuery(
    `
      update session
      set raw_source = {{rawSource::text}},
          raw_medium = {{rawMedium::text}},
          raw_campaign = {{rawCampaign::text}},
          raw_content = {{rawContent::text}},
          raw_term = {{rawTerm::text}},
          raw_referrer_domain = {{rawReferrerDomain::text}},
          channel_last = {{channel::text}},
          channel_strength_last = {{strength::smallint}},
          channel_reason = {{reason::json}},
          updated_at = now()
      where session_id = {{sessionId::uuid}}
        and website_id = {{websiteId::uuid}};
    `,
    {
      rawSource,
      rawMedium,
      rawCampaign,
      rawContent,
      rawTerm,
      rawReferrerDomain,
      channel,
      strength,
      reason: reasonJson,
      sessionId,
      websiteId,
    },
  );
}
