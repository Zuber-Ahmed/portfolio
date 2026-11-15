import assert from 'node:assert/strict';
import test from 'node:test';

import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import { DemoEventDetails } from '@/app/walima/DemoInvitation';

globalThis.React = React;

test('saved reception data renders the countdown, time, venue, directions, and embedded map', () => {
  const html = renderToStaticMarkup(
    React.createElement(DemoEventDetails, {
      event: {
        date: '2099-12-05',
        displayDate: '5 December 2099',
        displayTime: '7:00 PM',
        countdownTarget: '2099-12-05T19:00:00+05:30',
        venue: {
          name: 'Reception Hall',
          address: 'Main Road, Example City',
          googleMapsUrl: 'https://maps.app.goo.gl/example',
        },
      },
    }),
  );
  for (const text of [
    '5 December 2099',
    '7:00 PM',
    'Reception Hall',
    'Main Road, Example City',
    'days',
    'hours',
    'minutes',
    'seconds',
  ])
    assert.ok(html.includes(text));
  assert.match(html, /href="https:\/\/maps.app.goo.gl\/example"/);
  assert.match(html, /<iframe[^>]+title="Map to Reception Hall"/);
  assert.match(html, /maps.google.com\/maps\?q=Reception%20Hall/);
  assert.doesNotMatch(html, /Countdown awaiting event date/);
});

test('missing facts show honest preview placeholders rather than a fabricated timer or map', () => {
  const html = renderToStaticMarkup(React.createElement(DemoEventDetails, {}));
  assert.match(html, /Countdown awaiting event date/);
  assert.match(html, /Time to be announced/);
  assert.match(html, /The venue map will appear here/);
  assert.doesNotMatch(html, /<iframe/);
});
