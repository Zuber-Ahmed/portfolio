# Zuber Portfolio

Next.js App Router application containing the portfolio, wedding invitations, and wedding administration.

## Structure

Keep the existing flow:

```text
UI components → hooks / services → clients
API route handlers → server services → clients → AWS
```

- `app/sections`: portfolio sections.
- `app/components`: shared UI and effects.
- `app/hooks`: reusable React behavior.
- `app/wedding`: wedding UI, including `admin` and `v2`.
- `app/services`: feature operations. Wedding contracts and Zod schemas live in `wedding/types.ts`.
- `app/libs`: HTTP, Cognito, DynamoDB, email, and API response helpers.
- `app/config`: public application configuration.
- `app/api`: thin handlers that authorize requests, validate inputs, and call services.
- `tests`: service, API, authentication, and storage tests.

`adminService`, `invitationService`, and `weddingService` are browser-facing services. `weddingStoreService`, `adminAuthService`, and `chatService` run on the server. Never import the database or server services into a client component.

## Routes

| URL                                 | Purpose                                                 |
| ----------------------------------- | ------------------------------------------------------- |
| `/`                                 | Portfolio                                               |
| `/wedding`                          | Public wedding experience, populated from DynamoDB      |
| `/invite/[token]`                   | Personalized invitation, RSVP, and invitation assistant |
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
- `id` is a cryptographically random 32-byte base64url token for each new invitation.
- Event data accepts date, display time, optional venue fields, maps URL, and an optional ISO countdown timestamp with timezone.
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

Tests mock AWS transport and use local signing keys to verify authentication without contacting AWS or mutating real data. `npm test` also runs the envelope animation and rendering tests. A successful test run does not verify your deployed AWS permissions or table configuration.

The default production build uses Turbopack and the existing Tailwind loader. It needs access to Google Fonts and permission to start local compiler workers. Use a Node.js-capable Next.js deployment; static export cannot serve these APIs.
