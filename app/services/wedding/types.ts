import { z } from 'zod';

export const eventNameSchema = z.enum(['nikah', 'walima']);
export const recipientTypeSchema = z.enum(['individual', 'family']);
export const rsvpChoiceSchema = z.enum(['attending', 'declined']);
export const rsvpSchema = z.object({
  nikah: rsvpChoiceSchema.nullable().optional(),
  walima: rsvpChoiceSchema.nullable().optional(),
});
export const rsvpSubmissionSchema = z.object({
  nikah: rsvpChoiceSchema.optional(),
  walima: rsvpChoiceSchema.optional(),
});
export const guestInputSchema = z.object({
  displayName: z.string().trim().min(1).max(200),
  recipientType: recipientTypeSchema,
  nikah: z.boolean(),
  walima: z.boolean(),
});
export const adminInvitationSchema = guestInputSchema.extend({
  id: z.string(),
  invitationUrl: z.string().nullable().optional(),
  opened: z.boolean().optional(),
  rsvp: rsvpSchema,
});
export const eventDetailsSchema = z
  .object({
    date: z.string(),
    displayDate: z.string().optional(),
    time: z.string().optional(),
    displayTime: z.string().optional(),
    venueName: z.string().nullable().optional(),
    venueAddress: z.string().nullable().optional(),
    googleMapsUrl: z.string().nullable().optional(),
    venue: z
      .object({
        name: z.string(),
        address: z.string(),
        googleMapsUrl: z.string().nullable().optional(),
      })
      .optional(),
  })
  .loose();
export const weddingSchema = z
  .object({
    couple: z.object({
      groomName: z.string(),
      brideName: z.string(),
      groomFather: z.string(),
      brideFather: z.string(),
    }),
    nikah: eventDetailsSchema,
    walima: eventDetailsSchema,
  })
  .loose();
export const invitationSchema = z.object({
  recipient: z.object({
    displayName: z.string().trim().min(1).max(200),
    recipientType: recipientTypeSchema,
  }),
  events: z.object({
    nikah: eventDetailsSchema.optional(),
    walima: eventDetailsSchema.optional(),
  }),
  rsvp: rsvpSchema,
  wedding: weddingSchema,
});
export const chatContextSchema = z.record(z.string(), z.unknown());
export const chatReplySchema = z.object({
  answer: z.string(),
  context: chatContextSchema,
  links: z.array(z.object({ label: z.string(), url: z.string() })).optional(),
});
export const invitationsResultSchema = z.object({
  invitations: z.array(adminInvitationSchema),
});
export const invitationResultSchema = z.object({
  invitation: adminInvitationSchema,
});
export const weddingResultSchema = z.object({ wedding: weddingSchema });
export const trackingResultSchema = z.object({ recorded: z.boolean() });
export const rsvpResultSchema = z.object({
  rsvp: rsvpSchema,
  updatedAt: z.string(),
});

export type EventName = z.infer<typeof eventNameSchema>;
export type RecipientType = z.infer<typeof recipientTypeSchema>;
export type GuestInput = z.infer<typeof guestInputSchema>;
export type AdminInvitation = z.infer<typeof adminInvitationSchema>;
export type Wedding = z.infer<typeof weddingSchema>;
export type Invitation = z.infer<typeof invitationSchema>;
export type Rsvp = z.infer<typeof rsvpSchema>;
export type RsvpSubmission = z.infer<typeof rsvpSubmissionSchema>;
export type ChatContext = z.infer<typeof chatContextSchema>;
export type ChatReply = z.infer<typeof chatReplySchema>;

export const guestSchema = guestInputSchema.refine(
  guest => guest.nikah || guest.walima,
  'Select at least one event.',
);
export const storedInvitationSchema = adminInvitationSchema.extend({
  kind: z.literal('invitation'),
  revealed: z.boolean().optional(),
});
export const eventInputSchema = z.object({
  date: z.iso.date(),
  countdownTarget: z
    .union([z.literal(''), z.iso.datetime({ offset: true })])
    .optional(),
  displayTime: z.string().trim().min(1).max(100),
  venueName: z.string().trim().max(200).nullable().optional(),
  venueAddress: z.string().trim().max(500).nullable().optional(),
  googleMapsUrl: z
    .union([
      z.literal(''),
      z
        .url()
        .refine(url => /^https?:\/\//.test(url), 'Use an HTTP or HTTPS URL.'),
    ])
    .nullable()
    .optional(),
});
export const weddingInputSchema = z.object({
  couple: z.object({
    groomName: z.string().trim().min(1).max(200),
    brideName: z.string().trim().min(1).max(200),
    groomFather: z.string().trim().max(200),
    brideFather: z.string().trim().max(200),
  }),
  nikah: eventInputSchema,
  walima: eventInputSchema,
});
