# Zuber Portfolio

Next.js App Router application containing the portfolio, wedding invitations, and wedding administration.

## Structure

Keep the existing flow:

```text
UI components → hooks / services → clients
API route handlers → server services → clients → AWS
```

```text
app/
├── api/                         # Thin HTTP route handlers
├── components/                  # Shared portfolio UI, cards, loaders, effects
├── config/
│   ├── env.ts                   # Browser-safe environment settings
│   ├── server.ts                # Server environment settings (runtime reads)
│   └── wedding.js               # Wedding presentation defaults and assets
├── hooks/                       # Reusable React hooks
├── libs/                        # HTTP, AWS, email clients and response adapters
├── mocks/wedding/               # Development invitation mocks
├── sections/                    # Portfolio content sections
├── services/wedding/            # Feature operations and shared data contracts
├── utils/wedding/               # Date/time, import, message and animation helpers
└── wedding/
    ├── components/              # UI shared by wedding experiences
    ├── admin/
    │   ├── screens/             # Login, guest management, wedding details
    │   └── components/          # Shell, dialogs, event editor, RSVP status
    └── v2/                      # Invitation-specific UI and hooks

tests/
├── api/                         # HTTP client and route behavior
├── services/                    # Authentication and database service behavior
├── utils/                       # Date/time and animation logic
├── components/                  # Rendered UI behavior
└── helpers/                     # Shared test storage and fake clock
```

Placement rules:

- Only actual Next.js routes use `page.*` or `route.*`. UI files use component names. `Portfolio.tsx` is composed by the root page, so it no longer creates an accidental `/components/Portfolio` route.
- Put reusable UI in `app/components` or the owning feature's `components` directory. Full admin screens belong in `admin/screens`; hooks belong in `app/hooks` or feature-specific `hooks`.
- Put pure formatting, parsing, and animation helpers in `app/utils/wedding`. These contain no JSX. Keep external clients in `app/libs` and feature operations in `app/services`.
- `app/config/env.ts` contains browser-safe settings; `app/config/server.ts` is for server imports only. Wedding presentation defaults are separate from the merge/message helpers and actual database facts.
- Put all test files under `tests`, grouped by the behavior they test. Shared test utilities belong in `tests/helpers`. Runtime development mocks belong in `app/mocks`, not in services or the test suite.
- Keep `next.config.ts`, `tsconfig.json`, `eslint.config.mjs`, `.prettierrc.js`, `package.json`, and `proxy.ts` at the root because their tools discover them there.

`adminService`, `invitationService`, and `weddingService` are browser-facing services. `weddingStoreService`, `adminAuthService`, and `chatService` run on the server. Never import the database, server configuration, or server services into a client component. Wedding contracts and Zod schemas remain in `app/services/wedding/types.ts`.

## Routes

| URL                                 | Purpose                                                 |
| ----------------------------------- | ------------------------------------------------------- |
| `/`                                 | Portfolio                                               |
| `/wedding`                          | Public wedding experience, populated from DynamoDB      |
| `/i/[token]`                        | Personalized invitation, RSVP, and invitation assistant |
| `/wedding-admin`                    | Guest administration                                    |
| `/wedding-admin/login`              | Administrator sign-in and password reset                |
| `/wedding-admin/details`            | Edit the wedding details stored in DynamoDB             |
| `/api/admin/auth/login`             | Cognito sign-in                                         |
| `/api/admin/invitations`            | List and create guests                                  |
| `/api/admin/invitations/[id]`       | Edit and delete a guest                                 |
| `/api/admin/invitations/import`     | Atomic import of up to 100 guests                       |
| `/api/admin/invitations/wedding`    | Read and save wedding settings                          |
| `/api/wedding`                      | Public wedding settings for the original experience     |
| `/api/invitations/[token]`          | Guest's invitation                                      |
| `/api/invitations/[token]/opened`   | Record opening                                          |
| `/api/invitations/[token]/revealed` | Record reveal                                           |
| `/api/invitations/[token]/rsvp`     | Save responses for invited events                       |
| `/api/invitations/[token]/chat`     | Answer questions from saved invitation facts            |

The `/wedding` experience is public and shows both ceremonies. Personalized responses and chat only include events selected for that guest. Possession of a personalized link grants access to that invitation; treat those links as private.

## Local setup

```sh
npm install
npm run dev
```

Configure these environment variables in `.env.local` or your hosting provider. Restart development after changing configuration. `NEXT_PUBLIC_` values are included in the browser build.

| Variable                           | Purpose                                                                                              |
| ---------------------------------- | ---------------------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_COGNITO_REGION`       | Cognito region, defaults to `ap-south-1`                                                             |
| `NEXT_PUBLIC_COGNITO_USER_POOL_ID` | Cognito user pool ID                                                                                 |
| `NEXT_PUBLIC_COGNITO_CLIENT_ID`    | Cognito public app client ID (without a client secret)                                               |
| `COGNITO_ADMIN_GROUP`              | Required Cognito group, defaults to `wedding-admin`                                                  |
| `AWS_REGION`                       | DynamoDB region, defaults to `ap-south-1`                                                            |
| `WEDDING_TABLE_NAME`               | Existing DynamoDB table described below                                                              |
| `APP_ORIGIN`                       | Public site origin, e.g. `http://localhost:3000` locally; used to generate shareable invitation URLs |
| `NEXT_PUBLIC_EMAIL_SERVICE_ID`     | EmailJS service                                                                                      |
| `NEXT_PUBLIC_EMAIL_TEMPLATE_ID`    | EmailJS template                                                                                     |
| `NEXT_PUBLIC_EMAIL_SENDER_KEY`     | EmailJS public key                                                                                   |
| `NEXT_PUBLIC_WEDDING_USE_MOCKS`    | Optional `true` for V2 UI previews in development only                                               |

Use the AWS SDK default credential chain: an AWS profile locally and an IAM role in deployment. Never put AWS credentials in `NEXT_PUBLIC_` variables.

### DynamoDB

Use a table with a single **string partition key named `id`**, no sort key. The TypeScript contract does not specify an existing table name; select the name using `WEDDING_TABLE_NAME`. No table is created automatically.

- Wedding settings: `{ id: 'wedding', kind: 'wedding', wedding: { couple, nikah, walima } }`.
- Invitations: `{ id: '<random token>', kind: 'invitation', displayName, recipientType, nikah, walima, rsvp, opened, revealed }`.
- `id` is a cryptographically random 9-byte base64url token (12 characters) for each new invitation. New share links use `/i/[token]`. Existing `/invite/[token]` links and 16- or 43-character tokens remain valid; existing records are not rewritten.
- The admin calendar/time picker updates the existing `date`, `displayTime`, and `countdownTarget` fields together. Timezone handling is automatic: the saved timestamp’s offset is preserved, or the administrator’s local offset is used for a new schedule. Guests see 12-hour AM/PM times. No database migration is required.
- The server derives display dates and nested venue objects for the existing UI.
- Guest updates preserve tracking and RSVP fields. RSVP updates use conditional expressions to check event authorization at write time.
- Imports use a single transaction, with a maximum of 100 guests. Invalid rows are rejected before writing.
- Listing scans all pages and filters invitation records; this is appropriate for a small wedding guest list.

The runtime IAM role needs `dynamodb:GetItem`, `Scan`, `PutItem`, `UpdateItem`, `DeleteItem`, and `TransactWriteItems` on this table. The app does not provision AWS resources or change IAM settings.

Save your actual wedding details in `/wedding-admin/details`. Until the database has ceremony dates, public pages show a temporary unavailable state. Actual family names, dates, and venues are not invented or seeded.

### Cognito

Enable `USER_PASSWORD_AUTH` and `REFRESH_TOKEN_AUTH` for a public app client. Add authorized users to the configured administrator group. Complete any initial password challenge in Cognito before using the app.

Sign-in calls the Next.js login API. The existing auth service stores the returned session in session storage, or local storage when Remember me is selected, and refreshes access tokens through Cognito. Admin HTTP requests send the access token as a bearer token. There is no separate authentication cookie flow.

Every protected route verifies the JWT signature, issuer, expiry, access-token type, client ID, and administrator group. The proxy only checks for a bearer header; handlers enforce authorization independently. Signing out clears this browser's stored session; already-issued tokens remain valid until expiry.

### CSV / XLSX imports

Use these columns:

```csv
displayName,recipientType,nikah,walima
Example Guest,individual,true,false
Example Family,family,true,true
```

`recipientType` is `individual` or `family`; at least one ceremony must be selected. Import up to 100 guests at a time. XLSX reading happens in the browser through `read-excel-file`.

### Invitation assistant

The assistant uses deterministic question matching against database facts. It supports dates, times, locations, directions, and RSVP instructions. It does not call an AI provider, invent missing details, or submit RSVP on the guest's behalf.

## Checks

```sh
npm run typecheck
npm run lint
npm test
npm run static:check
npm run build
```

Tests mock AWS transport and use local signing keys to verify authentication without contacting AWS or mutating real data. `npm test` runs all three groups: `test:api` (API/services), `test:unit` (utilities), and `test:ui` (components). A successful test run does not verify your deployed AWS permissions or table configuration.

The default production build uses Turbopack and the existing Tailwind loader. It needs access to Google Fonts and permission to start local compiler workers. Use a Node.js-capable Next.js deployment; static export cannot serve these APIs.
