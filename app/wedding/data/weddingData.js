export const weddingConfig = {
  enabled: true,
  portfolioQuery: 'portfolio',
};

export const weddingData = {
  couple: { groom: 'Zuber', bride: 'Bisma' },
  families: {
    groom: {
      label: "Groom's Family",
      relation: 'Father of the groom',
      father: '',
    },
    bride: {
      label: "Bride's Family",
      relation: 'Father of the bride',
      father: '',
    },
  },
  nikah: {
    date: '',
    displayDate: 'Date to be announced',
    time: '',
    venue: { name: 'Location Coming Soon', address: '' },
  },
  walima: {
    date: '',
    displayDate: 'Date to be announced',
    time: '',
    venue: { name: 'Location Coming Soon', address: '' },
  },
  artwork: {
    // TODO: Replace remote Stitch artwork with local: src/wedding/assets/wedding-hero.webp
    hero: 'https://lh3.googleusercontent.com/aida-public/AB6AXuARjUf7MPVbuqvl3l8KBvNWFDjIuu2sW3gfRo3EKlMksxET3faOxtdXwXSEVPQDnXBsSl8kAr9JWmGjGnqf7enqg3tsenmL_Cr-3XAACSJhfLiNZYRayaj-v4kL2EYHrHx9SAv4YuOYCdOyzGfsxwhcKF3W7hoeELIHHMxS6oxV766pquDNEOL-a8lxCQSdLmikZz1H8AMLMAFnD0inVD7ndNn7x_objslDtOp3Wzch',
  },
  audio: {
    src: '/nikah.mp3',
    defaultVolume: 0.5,
  },
  whatsapp: {
    rsvpPhoneNumber: null,
  },
};

export function mergeWeddingData(publicWedding) {
  if (!publicWedding) return weddingData;
  return {
    ...weddingData,
    couple: {
      groom: publicWedding.couple?.groomName || weddingData.couple.groom,
      bride: publicWedding.couple?.brideName || weddingData.couple.bride,
    },
    families: {
      groom: {
        ...weddingData.families.groom,
        father:
          publicWedding.couple?.groomFather ||
          weddingData.families.groom.father,
      },
      bride: {
        ...weddingData.families.bride,
        father:
          publicWedding.couple?.brideFather ||
          weddingData.families.bride.father,
      },
    },
    nikah: publicWedding.nikah || weddingData.nikah,
    walima: publicWedding.walima || weddingData.walima,
  };
}

export function createInvitationMessage(invitationUrl, data = weddingData) {
  return `Assalamu Alaikum,

With the blessings of Allah, ${data.couple.groom} & ${data.couple.bride} request the honour of your presence and duas as they begin their journey together.

Nikah:
${data.nikah.displayDate}
${data.nikah.time}

Walima:
${data.walima.displayDate}
${data.walima.time}

${invitationUrl}

Please join us in celebrating this blessed occasion.`;
}
