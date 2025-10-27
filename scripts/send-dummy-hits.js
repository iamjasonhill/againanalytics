#!/usr/bin/env node
'use strict';

const { randomUUID } = require('crypto');

const endpoint =
  process.env.UMAMI_ENDPOINT || 'https://againanalytics.vercel.app/api/send';
const websiteId =
  process.env.UMAMI_TEST_WEBSITE_ID || '22222222-2222-2222-2222-222222222222';
const userAgent =
  process.env.UMAMI_TEST_USER_AGENT ||
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36';

const cases = [
  {
    label: 'Direct',
    payload: {
      type: 'event',
      payload: {
        website: websiteId,
        url: 'https://dummy.example.com/',
        hostname: 'dummy.example.com',
        language: 'en-AU',
        screen: '1920x1080',
        title: 'Direct Hit',
        userAgent,
      },
    },
  },
  {
    label: 'UTM Paid Search',
    payload: {
      type: 'event',
      payload: {
        website: websiteId,
        url: 'https://dummy.example.com/?utm_source=google&utm_medium=cpc&utm_campaign=test_campaign&utm_term=removals',
        hostname: 'dummy.example.com',
        language: 'en-AU',
        screen: '1920x1080',
        title: 'Google CPC',
        userAgent,
      },
    },
  },
  {
    label: 'UTM Email',
    payload: {
      type: 'event',
      payload: {
        website: websiteId,
        url: 'https://dummy.example.com/?utm_source=crm&utm_medium=email&utm_campaign=welcome_series',
        hostname: 'dummy.example.com',
        language: 'en-AU',
        screen: '1920x1080',
        title: 'Email Campaign',
        userAgent,
      },
    },
  },
  {
    label: 'Referral',
    payload: {
      type: 'event',
      payload: {
        website: websiteId,
        url: 'https://dummy.example.com/',
        hostname: 'dummy.example.com',
        referrer: 'https://partner.example.org/article',
        language: 'en-AU',
        screen: '1920x1080',
        title: 'Referral Hit',
        userAgent,
      },
    },
  },
  {
    label: 'Social',
    payload: {
      type: 'event',
      payload: {
        website: websiteId,
        url: 'https://dummy.example.com/?utm_source=facebook&utm_medium=social&utm_campaign=spring_sale',
        hostname: 'dummy.example.com',
        referrer: 'https://m.facebook.com/story.php?id=123',
        language: 'en-AU',
        screen: '1920x1080',
        title: 'Facebook Social',
        userAgent,
      },
    },
  },
  {
    label: 'Offline Tagging',
    payload: {
      type: 'event',
      payload: {
        website: websiteId,
        url: 'https://dummy.example.com/?utm_source=offline&utm_medium=flyer&utm_campaign=expo2025',
        hostname: 'dummy.example.com',
        language: 'en-AU',
        screen: '1920x1080',
        title: 'Offline Campaign',
        userAgent,
      },
    },
  },
];

function assertFetchAvailable() {
  if (typeof fetch !== 'function') {
    throw new Error('Global fetch API not available. Use Node 18+ or provide a polyfill.');
  }
}

async function sendCase({ label, payload }) {
  assertFetchAvailable();

  const requestPayload = {
    ...payload,
    payload: {
      ...payload.payload,
      id: randomUUID(),
    },
  };

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': userAgent,
    },
    body: JSON.stringify(requestPayload),
  });

  const text = await response.text();
  console.log(`${label}: ${response.status}`, text);
}

async function main() {
  for (const testCase of cases) {
    await sendCase(testCase);
  }
}

main().catch(error => {
  console.error('Failed to send dummy hits:', error);
  process.exit(1);
});
