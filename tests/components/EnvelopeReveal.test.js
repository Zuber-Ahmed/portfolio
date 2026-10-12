import assert from 'node:assert/strict';
import test from 'node:test';

import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import EnvelopeReveal from '@/app/wedding/v2/invitation/EnvelopeReveal.jsx';

test('the reveal renders an accessible envelope for every guest and event shape', async () => {
  const render = (displayName, events) =>
    renderToStaticMarkup(
      React.createElement(EnvelopeReveal, {
        recipient: { displayName },
        events,
        onComplete() {},
      }),
    );
  const nikah = render('Amina Noor', { nikah: {}, walima: null });
  const walima = render('The Rahman Family', { nikah: null, walima: {} });
  const both = render('Farhan Khan & Family', { nikah: {}, walima: {} });

  assert.match(nikah, /wedding-v2-ribbon-envelope/);
  assert.match(nikah, /<button[^>]*aria-label="Open wedding invitation"/);
  assert.match(nikah, /A beautiful Nikah invitation/);
  assert.match(walima, /The Rahman Family/);
  assert.match(walima, /A beautiful Walima invitation/);
  assert.match(both, /A beautiful Nikah and Walima invitation/);
  assert.doesNotMatch(both, /<canvas|Swipe gently|Tap to Reveal/i);
});
