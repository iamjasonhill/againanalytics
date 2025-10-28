import {
  EMAIL_DOMAINS,
  PAID_AD_PARAMS,
  SEARCH_DOMAINS,
  SHOPPING_DOMAINS,
  SOCIAL_DOMAINS,
  VIDEO_DOMAINS,
} from '@/lib/constants';

export type ChannelType =
  | 'direct'
  | 'referral'
  | 'affiliate'
  | 'email'
  | 'sms'
  | 'organicSearch'
  | 'organicSocial'
  | 'organicShopping'
  | 'organicVideo'
  | 'paidAds'
  | 'paidSearch'
  | 'paidSocial'
  | 'paidShopping'
  | 'paidVideo';

export interface ChannelClassification {
  channel: ChannelType;
  strength: number;
  reason: Record<string, unknown>;
  rawSource?: string;
  rawMedium?: string;
  rawCampaign?: string;
  rawContent?: string;
  rawTerm?: string;
  rawReferrerDomain?: string;
}

function matches(value: string | undefined | null, expressions: (string | RegExp)[]): boolean {
  if (!value) {
    return false;
  }

  return expressions.some(expression => {
    if (typeof expression === 'string') {
      return value.includes(expression);
    }

    return expression.test(value);
  });
}

const paidMediumMatchers: RegExp[] = [/cp(c|l)/, /ppc/, /paid/];
const socialMediumMatchers: RegExp[] = [/social/, /sm/];
const emailMediumMatchers: RegExp[] = [/mail/];
const referralMediumMatchers: RegExp[] = [/referral/, /app/, /link/];
const affiliateMediumMatchers: RegExp[] = [/affiliate/];
const smsMediumMatchers: RegExp[] = [/sms/];
const shoppingMediumMatchers: RegExp[] = [/shop/];
const videoMediumMatchers: RegExp[] = [/video/];

export function classifyChannel(params: {
  hostname?: string | null;
  referrerDomain?: string | null;
  urlQuery?: string | null;
  utmSource?: string | null;
  utmMedium?: string | null;
  utmCampaign?: string | null;
  utmContent?: string | null;
  utmTerm?: string | null;
}): ChannelClassification {
  const {
    hostname,
    referrerDomain,
    urlQuery,
    utmSource,
    utmMedium,
    utmCampaign,
    utmContent,
    utmTerm,
  } = params;

  const medium = utmMedium?.toLowerCase() || '';
  const source = utmSource?.toLowerCase() || '';
  const refDomain = referrerDomain?.toLowerCase() || '';
  const query = urlQuery?.toLowerCase() || '';
  const host = hostname?.toLowerCase() || '';

  let channel: ChannelType = 'direct';
  let reason: Record<string, unknown> = { type: 'direct' };

  const setChannel = (value: ChannelType, reasonData: Record<string, unknown>) => {
    channel = value;
    reason = reasonData;
  };

  if (medium) {
    if (matches(medium, paidMediumMatchers) || matches(query, PAID_AD_PARAMS)) {
      setChannel('paidSearch', { type: 'utm', medium: utmMedium, source: utmSource });
    } else if (matches(medium, socialMediumMatchers)) {
      const hasPaidIndicator = medium.includes('paid') || medium.includes('ads');
      setChannel(hasPaidIndicator ? 'paidSocial' : 'organicSocial', {
        type: 'utm',
        medium: utmMedium,
        source: utmSource,
      });
    } else if (matches(medium, emailMediumMatchers)) {
      setChannel('email', { type: 'utm', medium: utmMedium, source: utmSource });
    } else if (matches(medium, affiliateMediumMatchers)) {
      setChannel('affiliate', { type: 'utm', medium: utmMedium, source: utmSource });
    } else if (matches(medium, smsMediumMatchers)) {
      setChannel('sms', { type: 'utm', medium: utmMedium, source: utmSource });
    } else if (matches(medium, shoppingMediumMatchers)) {
      const paid = medium.includes('paid');
      setChannel(paid ? 'paidShopping' : 'organicShopping', {
        type: 'utm',
        medium: utmMedium,
        source: utmSource,
      });
    } else if (matches(medium, videoMediumMatchers)) {
      const paid = medium.includes('paid');
      setChannel(paid ? 'paidVideo' : 'organicVideo', {
        type: 'utm',
        medium: utmMedium,
        source: utmSource,
      });
    } else if (matches(medium, referralMediumMatchers)) {
      setChannel('referral', { type: 'utm', medium: utmMedium, source: utmSource });
    }
  }

  if (channel === 'direct') {
    if (utmSource) {
      if (SEARCH_DOMAINS.includes(source)) {
        setChannel('organicSearch', { type: 'utm_source', value: utmSource });
      } else if (SOCIAL_DOMAINS.includes(source)) {
        setChannel('organicSocial', { type: 'utm_source', value: utmSource });
      } else if (EMAIL_DOMAINS.includes(source)) {
        setChannel('email', { type: 'utm_source', value: utmSource });
      }
    }

    if (channel === 'direct' && refDomain && refDomain !== host) {
      if (SEARCH_DOMAINS.includes(refDomain)) {
        setChannel('organicSearch', { type: 'referrer_domain', value: referrerDomain });
      } else if (SOCIAL_DOMAINS.includes(refDomain)) {
        setChannel('organicSocial', { type: 'referrer_domain', value: referrerDomain });
      } else if (EMAIL_DOMAINS.includes(refDomain)) {
        setChannel('email', { type: 'referrer_domain', value: referrerDomain });
      } else if (SHOPPING_DOMAINS.includes(refDomain)) {
        setChannel('organicShopping', { type: 'referrer_domain', value: referrerDomain });
      } else if (VIDEO_DOMAINS.includes(refDomain)) {
        setChannel('organicVideo', { type: 'referrer_domain', value: referrerDomain });
      } else {
        setChannel('referral', { type: 'referrer_domain', value: referrerDomain });
      }
    }
  }

  return {
    channel,
    strength: 100,
    reason,
    rawSource: utmSource || referrerDomain || undefined,
    rawMedium: utmMedium || undefined,
    rawCampaign: utmCampaign || undefined,
    rawContent: utmContent || undefined,
    rawTerm: utmTerm || undefined,
    rawReferrerDomain: referrerDomain || undefined,
  };
}
