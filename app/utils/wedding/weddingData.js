import { weddingData } from '@/app/config/wedding';

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
