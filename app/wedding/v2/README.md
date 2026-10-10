# Wedding Invitation V2

The Next.js route `/invite/[token]` renders `WeddingInvitationV2`. `/wedding` renders the original experience; `/` remains the portfolio.

Hooks call `app/services/wedding/invitationService.ts`, which uses `app/libs/invitationClient.ts`. The Next.js API calls the server services and DynamoDB client. Schemas live in `app/services/wedding/types.ts`.

Production always loads invitation data from the database. Wedding facts are configured in `/wedding-admin/details`. Tokens identify guests and their permitted events; RSVP authorization is checked again when writing.

Optional development UI previews are enabled with `NEXT_PUBLIC_WEDDING_USE_MOCKS=true`. Supported token names are `demo-individual-nikah`, `demo-individual-walima`, `demo-individual-both`, `demo-family-nikah`, `demo-family-walima`, and `demo-family-both`. Preview RSVP is temporary, tracking is simulated, chat is a preview message, and wedding facts remain placeholders. Mocks are disabled in production.

See the root README for database and authentication setup.
