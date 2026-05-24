# Invitation Email Plan — Resend + React Email

Status: Approved-pending implementation
Owner: Anselm
Last updated: 2026-05-24

## Goal

Wire the `createInvitation` server action so that creating a cart invitation:

1. Persists a `cart_invitation` row in the database.
2. Sends a transactional email to the invitee via Resend, rendered from a React Email template.
3. Provides Accept and Reject links in the email that drive a `/invite/[id]` flow.

Architecture mirrors the cosmikata project's `apps/api/src/utils/email/send-email.util.ts` and connected files (lazy Resend client, generic `sendEmail` helper, reusable layout-split React Email templates), adapted for this Next.js project (no Cloudflare Worker workarounds, no i18n).

## Decisions

| Topic | Decision |
| --- | --- |
| Package manager | `pnpm` |
| Sender from-address | `onboarding@resend.dev` (Resend dev sender) until a domain is verified |
| Logo | Placeholder URL until brand assets exist |
| Auth | better-auth Anonymous plugin — no traditional sign-in |
| Email match on accept | Required. Invitee types their email on the accept page; compared to `cart_invitation.invited_email` |
| Email template structure | Layout-split (mirror cosmikata: `EmailLayout` + `EmailHeader` + `EmailFooter` + content) |
| Inviter display name | New `name` field on the invitation form, passed through to the email |
| Email failure behavior | Logged; does not roll back the DB insert |
| Link strategy | Two buttons in email — `?action=accept` and `?action=reject` query params |

## Out of Scope (v1)

- i18n / translated templates
- Unsubscribe flow
- Background queue / retry for failed email sends
- Domain verification on Resend
- Real brand logo

## Files to Create

```
src/server/email/resend-client.ts
src/server/email/send-email.ts
src/server/email/send-email.test.ts
src/server/email/email-assets.ts
src/server/email/email-tokens.ts
src/server/email/index.ts
src/server/email/templates/invitation-email.tsx
src/server/email/components/email-layout.tsx
src/server/email/components/email-header.tsx
src/server/email/components/email-footer.tsx
src/server/invitations/repository.test.ts
src/server/invitations/action.test.ts
src/app/invite/[id]/page.tsx
```

> All email-related code lives under `src/server/email/` to match the project's
> `src/server/<domain>/` convention and to enforce the server-only boundary —
> any client component importing from `src/server/email/*` is an obvious red flag.

## Files to Modify

```
package.json                                          # +resend, +@react-email/components
.env                                                  # verify APP_URL is present
src/features/invitations/schema.ts                    # +name field
src/features/invitations/components/group-order.tsx   # +name field, wire onSubmit
src/server/invitations/types.ts                       # +inviterName on InvitationPayload
src/server/invitations/repository.ts                  # implement insert, findById, updateStatus
src/server/invitations/action.ts                      # wire repository+email, +accept/reject actions
```

## Implementation Phases

### Phase 1 — Dependencies & Env

- `pnpm add resend @react-email/components`
- Verify `APP_URL` is set in `.env` (only `EMAIL_ADDRESS_NOTIFICATIONS` was found on grep; double-check before coding)

### Phase 2 — Schema & Form

- `src/features/invitations/schema.ts` — add `name: z.string().min(1).max(80)` to `createInvitationSchema`
- `src/features/invitations/components/group-order.tsx` — add a name TextField to the form (`defaultValues: { name: "", email: "" }`); wire `onSubmit` to call `createInvitation`; close the sheet on success and surface errors
- `src/server/invitations/types.ts` — add `inviterName: string` to `InvitationPayload`

### Phase 3 — Resend Client

`src/server/email/resend-client.ts`

- Lazy singleton `getResend(): Resend` reading `process.env.RESEND_API_KEY`
- Throws if the env is missing

### Phase 4 — React Email Templates (layout-split)

Directory: `src/server/email/`

- `email-tokens.ts` — color, font, and size constants
- `components/email-layout.tsx` — `Html` / `Head` / `Preview` / `Body` / `Container` wrapping header + children + footer
- `components/email-header.tsx` — logo section
- `components/email-footer.tsx` — copyright (no unsubscribe in v1)
- `templates/invitation-email.tsx` — main template
  - Props: `{ inviterName, subject, description, acceptLink, rejectLink, logoUrl }`
  - Renders **two side-by-side buttons**: Accept and Reject
- `index.ts` — barrel export

### Phase 5 — Email Assets

`src/server/email/email-assets.ts`

- `getLogoUrl(): string` returning a placeholder URL (e.g., `https://placehold.co/161x25/0a0a0a/ffffff?text=GroupOrder`)

### Phase 6 — Generic Send Util

`src/server/email/send-email.ts`

- Signature: `sendEmail({ to, subject, react }): Promise<{ ok: boolean }>`
- Uses `getResend().emails.send({ from, to, subject, react })`
- `from` comes from `process.env.EMAIL_ADDRESS_NOTIFICATIONS` (already set) but actual sender used at the API call site is `onboarding@resend.dev` until a domain is verified — TODO: align env value with chosen sender or read from a constant
- Explicitly logs `response.error` (Resend SDK returns `{ data, error }` and does not throw on API errors — lesson from cosmikata)
- Wrapped in try/catch; never throws

### Phase 7 — Invitation Repository

`src/server/invitations/repository.ts`

- `createInvitation({ cartId, email })` — insert into `cart_invitation`, returning the inserted row
- `findById(id)` — fetch invitation joined with its cart (for the accept page)
- `updateStatus(id, status, acceptedByUserId?)` — status transition
- Catch unique-constraint violations and surface a friendly error

### Phase 8 — `createInvitation` Action

`src/server/invitations/action.ts`

1. Parse `{ name, email }`
2. Get `userId` and `cartId`
3. Insert via repository, get `invitation.id`
4. Build `acceptLink` = `${process.env.APP_URL}/invite/${id}?action=accept`
5. Build `rejectLink` = `${process.env.APP_URL}/invite/${id}?action=reject`
6. Call `sendEmail({ to: parsed.email, subject: "You're invited to a group order", react: <InvitationEmail inviterName={parsed.name} acceptLink={acceptLink} rejectLink={rejectLink} ... /> })`
7. Return the inserted invitation

Email failure does not roll back the insert; logged only.

### Phase 9 — Accept / Reject Route

`src/app/invite/[id]/page.tsx` — server component

- Fetches invitation by id; if missing → 404
- If status is already `accepted` or `rejected` → show terminal state
- Reads `searchParams.action` to pre-select view:
  - `action=accept` → email-confirmation form + Accept button
  - `action=reject` → one-click reject confirmation
  - no param → default view with both options

`src/server/invitations/action.ts` — server actions:

- `acceptInvitation({ id, email })`
  - Fetch invitation; compare `email.toLowerCase()` with `invited_email.toLowerCase()` — reject on mismatch
  - Ensure an anonymous session exists (better-auth creates one if not)
  - Update status to `accepted`, set `acceptedByUserId` to the anonymous session's user id
  - Redirect to the cart
- `rejectInvitation({ id })`
  - Update status to `rejected` (no email match needed — explicit user intent)

### Phase 10 — Tests

- `src/server/invitations/repository.test.ts` — insert, findById, updateStatus (mock db using existing patterns in `cart/repository/*.test.ts`)
- `src/server/email/send-email.test.ts` — Resend mocked; asserts `from`/`to`/`react`, error logging path, never-throws contract
- `src/server/invitations/action.test.ts` — orchestration, email failure tolerance, accept email match, accept email mismatch rejection, reject path

## Risks

| Severity | Risk | Mitigation |
| --- | --- | --- |
| HIGH | `onboarding@resend.dev` only delivers to the Resend account owner's email — real invitees won't receive mail until a domain is verified | Acceptable for dev; document and verify a domain before launch |
| MEDIUM | Email confirmation UX adds friction (typing email on accept page) | Unavoidable with anonymous auth + email-match requirement; revisit if/when proper auth is added |
| MEDIUM | DB insert can succeed while email send fails — invitee never knows | Log on failure; accepted for v1; revisit with a queue later |
| MEDIUM | `@react-email/components` is large — risk of leaking to the client bundle | All email imports stay under `src/server/email/`, consumed only from server actions / route handlers |
| LOW | Invitation id is the only link secret | UUIDs are sufficient entropy; email-match check is a second layer |
| LOW | Logo placeholder | Replace before launch |

## Estimated Complexity: MEDIUM-HIGH

- Phases 1–6 (infra + templates): ~2.5 h
- Phases 7–8 (create flow): ~1 h
- Phase 9 (accept/reject route): ~1.5 h
- Phase 10 (tests): ~2 h
- Total: ~7 h

## Reference Pattern

Source files from `/Users/anselmmarie/Development/GitHub/cosmikata/apps/api/`:

- `src/utils/email/send-email.util.ts`
- `src/utils/email/email-assets.util.ts`
- `src/lib/resend/send-email.lib.ts`
- `src/emails/cta-email.tsx`
- `src/emails/components/email-layout.tsx`
- `src/emails/components/email-header.tsx`
- `src/emails/components/email-footer.tsx`
- `src/emails/email-tokens.ts`
