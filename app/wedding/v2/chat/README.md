# Invitation Assistant

`ChatWidget` appears after the invitation reveal. It calls `invitationService.askInvitation`, which posts to the Next.js `/api/invitations/[token]/chat` handler.

The server's `chatService` loads the invitation through `weddingStoreService`. It formats answers from DynamoDB wedding facts, restricted to that guest's selected events. Questions about dates, times, locations, directions, and RSVP instructions are supported. Unknown questions receive a request to contact the family. No external AI provider or API key is required.

The assistant does not mutate RSVP. The Go to RSVP action moves focus to the invitation's RSVP section. Closing the panel preserves its conversation; replaying the invitation unmounts it. Chat messages are not persisted.

The browser limits questions to 1,000 characters, permits one in-flight request, supports cancellation, and times out replies after 15 seconds. The server also validates the question length. Deployment-level rate limiting should be configured through your hosting provider.

Development mocks return an explicit preview message. Production uses the actual database-backed endpoint. See the root README for setup.
