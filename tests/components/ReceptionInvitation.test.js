import assert from 'node:assert/strict';
import test from 'node:test';

import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import InvitationExperience from '@/app/wedding/v2/experience/InvitationExperience.jsx';
import EnvelopeReveal from '@/app/wedding/v2/invitation/EnvelopeReveal.jsx';
import PersonalizedEnvelope from '@/app/wedding/v2/invitation/PersonalizedEnvelope.jsx';
import ReceptionUnavailable from '@/app/wedding/v2/invitation/ReceptionUnavailable.jsx';

// The Node/tsx test runner compiles .jsx with the classic React runtime.
globalThis.React = React;

test('local missing configuration has an actionable reception error and retry', () => {
  const previousEnv = process.env.NODE_ENV;
  try {
    process.env.NODE_ENV = 'development';
    const html = renderToStaticMarkup(
      React.createElement(ReceptionUnavailable, {
        error: { code: 'WEDDING_STORAGE_NOT_CONFIGURED' },
      }),
    );
    assert.match(html, /WEDDING_TABLE_NAME/);
    assert.match(html, /Try Again/);
    process.env.NODE_ENV = 'production';
    const publicHtml = renderToStaticMarkup(
      React.createElement(ReceptionUnavailable, {
        error: { code: 'WEDDING_STORAGE_NOT_CONFIGURED' },
      }),
    );
    assert.doesNotMatch(publicHtml, /WEDDING_TABLE_NAME|AWS|\.env/);
  } finally {
    if (previousEnv === undefined) delete process.env.NODE_ENV;
    else process.env.NODE_ENV = previousEnv;
  }
});

const recipient = {
  displayName: 'You and Your Family',
  recipientType: 'family',
};
const wedding = {
  couple: { groom: 'Configured Groom', bride: 'Configured Bride' },
  families: {
    groom: { label: "Groom's Family", father: 'Groom Father' },
    bride: { label: "Bride's Family", father: 'Bride Father' },
  },
  artwork: { hero: '/photo1.jpg' },
};
const events = {
  walima: {
    date: '2027-01-02',
    displayDate: '2 January 2027',
    time: '7:00 PM',
    venue: {
      name: 'Reception Hall',
      address: 'Reception Address',
      googleMapsUrl: 'https://maps.google.com/reception',
    },
  },
};

test('the common invitation renders only reception details, family greeting, and no RSVP or assistant', () => {
  const html = renderToStaticMarkup(
    React.createElement(InvitationExperience, {
      generic: true,
      invitation: { recipient, events },
      wedding,
    }),
  );
  assert.match(html, /You and your family are cordially invited/);
  assert.match(html, /Walima Reception/);
  assert.match(html, /Reception Hall/);
  assert.match(html, /Reception Address/);
  assert.match(html, /https:\/\/maps.google.com\/reception/);
  assert.match(html, /Configured Groom/);
  assert.match(html, /Groom Father/);
  assert.doesNotMatch(
    html,
    /Nikah Ceremony|invitation-rsvp|RSVP|chat-launcher|Dear /,
  );
});

test('the common envelope and reveal use the family greeting and configured couple names', () => {
  for (const component of [PersonalizedEnvelope, EnvelopeReveal]) {
    const html = renderToStaticMarkup(
      React.createElement(component, {
        recipient,
        events,
        wedding,
        phase: 'envelope',
      }),
    );
    assert.match(html, /You and Your Family/);
    assert.match(html, /Configured Groom/);
    assert.match(html, /Configured Bride/);
    assert.doesNotMatch(html, /Zuber|Bisma/);
  }
});
