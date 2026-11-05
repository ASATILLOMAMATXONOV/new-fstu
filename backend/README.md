# FSTU Backend

Node.js + Express + PostgreSQL backend for the `frontend` and `admin` apps.

## Features

- Mandatory password + TOTP login with revocable HttpOnly cookie sessions
- PostgreSQL-backed CMS-style content storage
- SQL migrations without extra ORM tooling
- Reusable CRUD endpoints for content sections
- Singleton settings endpoint for pages like rector speech
- Super-admin cybersecurity dashboard, persistent IP blocks, security event journal and daily dependency audits

## Cybersecurity monitoring

Apply migration `010_security_monitoring.sql` with `npm run db:migrate`, then restart
the backend. The admin sidebar ends with **Kiberxavfsizlik** (`/cybersecurity`).
Only `super_admin` can read the journal or manage blocks; the API enforces this too.
The UI refreshes every 15 seconds, including errors and empty states. It shows event
filters, occurrence counts, source IPs, client-provided user agents, temporary blocks,
configuration checks, hourly activity and dependency audit results. An IP does not
identify a computer or its owner; shared networks may have many users on one IP.

The simplified dashboard has separate **IP faolligi**, **Hodisalar jurnali**,
**Bloklangan IP’lar**, **IP bloklash** and **Himoya holati** tabs. IP activity shows
the latest action/path/HTTP outcome, first and last event time, last successful
MFA login, occurrence count and current block. Clicking an IP opens its paginated
event history. All displayed times use Asia/Tashkent. First/last activity and login
times apply to the selected period; ordinary page views are not all stored.

`GET /api/security/sources` paginates activity with `hours`, `ip`, `status`
(`all`, `suspicious`, `blocked`), `page` and `limit`. Manual block/unblock evidence
is retained in the journal but excluded from source activity and prevented-request
totals: an administrator's action is not a request made by the target IP.
`GET /api/security/blocks` independently paginates active blocks and accepts `ip`
and `source` (`manual`, `automatic`) filters. It includes the block start, expiry,
reason and operator ID. Expired or removed blocks remain represented in the journal.
Re-blocking after expiry resets block metadata; extending an active manual block
preserves its operator and reason.

The main page uses `compact=1` for overview/events so external IP geolocation
services cannot delay or break the activity tables. Optional network details still
use `/api/security/ip/:ip`. There are no sample attackers in the dashboard.
Block and unblock operations call the authenticated, CSRF-protected server API.
Automatic blocks have no loopback exemption; health checks remain accessible.
Correct trusted-proxy configuration is essential to avoid grouping clients under
an ingress address. The database recovery procedure below also works for a local
operator who accidentally triggers a rate limit.

All application requests except GET/HEAD `/health` are checked before body parsing.
Counters and blocks are atomic PostgreSQL records shared across processes and restarts.
Defaults per IP:

- 600 requests/minute: exceeding this creates a 15-minute block.
- 30 mutating requests/minute, including public AI/form requests: excess requests receive 429.
- 10 login requests/10 minutes: excess requests create a 15-minute block. Malformed
  logins and successful logins also consume this budget to limit bcrypt work.
- Three high-confidence URL probes/10 minutes or 20 authentication/authorization
  failures/10 minutes create a 15-minute block.

URL checks reject encoded traversal, secret-file probes and selected SQL/XSS signatures.
They do not prove that a requester is malicious and do not replace parameterized SQL,
authorization or HTML sanitization. Rich CMS HTML and passwords are not matched against
generic attack signatures. HTML is parsed through an allowlist sanitizer. Large CMS JSON
requires authentication before parsing; public JSON is limited to 256 KiB.

Manual blocks require an IP, a reason and a 5–1440-minute expiry. The current client IP
cannot be manually blocked. Block/unblock changes and their audit records commit in one
transaction. Unblocking also resets that IP's counters. Automatic blocks can affect a
shared public IP, including an administrator. To recover from a mistaken block when no
other super-admin connection is available, a database operator can run the following
with a bound parameter for the affected IP:

```sql
BEGIN;
DELETE FROM security_ip_blocks WHERE ip = $1;
DELETE FROM security_counters WHERE ip = $1;
COMMIT;
```

Configure `TRUST_PROXY` with only your actual ingress/proxy addresses or CIDRs. Leave it
empty for a direct connection. Never set it to `true`, `*` or a hop count. The ingress
must overwrite untrusted forwarding headers. Until this is configured behind a proxy,
the app sees the proxy IP, so users may share a rate limit/block. The deployment topology
was not verified here; configure this before production rollout. Forwarded headers from
untrusted peers never determine a client IP. The dashboard reports this configuration gap.

`SECURITY_REQUEST_LIMIT`, `SECURITY_WRITE_LIMIT`, `SECURITY_BLOCK_MINUTES` and
`SECURITY_RETENTION_DAYS` configure thresholds/retention. Login settings use the existing
`LOGIN_RATE_LIMIT_*` variables. Expired counters/blocks and old events are cleaned every
10 minutes; default event retention is 30 days. Identical events are aggregated per minute.
Passwords, request bodies, query values, cookies and bearer tokens are excluded from the
security journal; HTTP access logs omit query strings. Logging is capped at 256 concurrent
response-event jobs and dropped jobs are reported in the dashboard. Request guards fail
with 503 if their storage is unavailable; they never silently disable enforcement.

`npm run security:audit` checks installed production dependency lockfiles for the backend,
admin and frontend without changing packages. It saves a local report in
`backend/.cache/security-audit.json`, exits nonzero for unavailable reports/high/critical
findings, and runs on startup and every 24 hours in a running backend. Results older than
25 hours are marked stale. Deployments containing only the backend cannot audit absent
admin/frontend lockfiles; those projects are shown as unavailable. Audit the complete
repository in CI as well. Daily checks require npm registry connectivity. Remaining
build-tool/router findings needing major upgrades are shown rather than suppressed.

Database TLS verifies server certificates when `DATABASE_SSL=true`. For a private CA,
set `DATABASE_SSL_CA` to the PEM certificate (literal `\\n` sequences are supported).
Startup rejects a missing or malformed MFA encryption key. Production also rejects
short/default signing secrets, open admin registration and bootstrap password syncing.

## Administrator authentication

Apply all migrations, including `013_admin_multifactor_sessions.sql`, and restart the
backend. Old bearer tokens are no longer accepted. Every active administrator must
enroll an authenticator before receiving a session:

1. Enter the existing login and password. A weak password must be replaced with a
   different password of at least 12 characters satisfying the displayed policy.
   Already enrolled accounts must prove their second factor before changing a password.
2. Scan the locally generated QR in a TOTP authenticator and enter its six-digit code.
3. Save the ten single-use recovery codes separately from the password and acknowledge
   saving them. Subsequent logins require password and a current authenticator code.

Recovery codes are an alternative second factor, not a third factor. Using one requires
enrollment of a replacement authenticator before access. A normal TOTP login can also
generate replacement backup codes; the old backup codes then stop working. Losing both
the authenticator and all recovery codes requires an identity-verified operator recovery;
there is no public MFA bypass or automatic MFA reset on password change.

The five-minute login challenge is bound to the client IP and user agent. Five invalid
codes lock the account, including attempts across fresh challenges. Login and MFA paths
also have persistent IP limits. TOTP time steps cannot be reused. Production bcrypt uses
at least cost 12; bcrypt work is capped at four concurrent requests. Public registration
is always disabled. `npm run security:accounts -- --apply` flags known weak/default or
invalid hashes for mandatory password replacement without printing credentials or
changing passwords. Unknown plaintext passwords are checked during actual login.

Sessions use random tokens stored as hashes in PostgreSQL. The token is only in an
HttpOnly, SameSite=Strict cookie, with Secure and a `__Host-` prefix in production.
Mutations require an additional session-bound CSRF header. Default limits are 120 minutes
absolute lifetime, 20 minutes without an authenticated request, and three active sessions
per administrator. Account edits invalidate sessions; logout revokes the current session;
the profile's **Barcha qurilmalardan chiqish** revokes every session and pending login.

Provision `MFA_ENCRYPTION_KEY` as 32 random bytes encoded as 64 hex characters (for example,
generate once with `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`).
Keep it separate from the signing key and back it up securely. Do not regenerate it on
restart: enrolled seeds are AES-256-GCM encrypted with it. Local `.env` is provisioned;
production requires its own secret. Keep server and phone clocks synchronized. Production
must use HTTPS and same-site admin/API custom domains for Strict cookies. These local
changes do not configure the production TLS endpoint, ingress or host firewall.

Authentication integration tests: set `SECURITY_DB_TESTS=1` and run `npm test`. They use
isolated random PostgreSQL schemas, never enroll real accounts, and cover MFA enrollment,
recovery, replay, lockouts, CSRF, expiry and revocation.

Design reference: [OWASP Multifactor Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Multifactor_Authentication_Cheat_Sheet.html).

Tests: `npm test` runs the backend suite. For PostgreSQL integration tests, set
`SECURITY_DB_TESTS=1` and run
`node --test src/modules/security/security-db.test.js`. These create/drop a random isolated
schema and do not touch application users or security evidence. The database role needs
schema creation permission. A temporary test server validates authorization, IP spoofing,
blocking, audit transactions, retention, input limits and login monitoring.

This covers application traffic and known dependency advisories. Host/OS security,
network-layer DDoS mitigation, TLS termination and infrastructure access are separate
operational controls. No claim of complete attack detection or immunity is made.

## Setup

1. Copy `.env.example` to `.env`
2. Create a PostgreSQL database
3. Install packages:

```bash
npm install
```

4. Run migrations:

```bash
npm run db:migrate
```

5. Start the server:

```bash
npm run dev
```

The API runs on `http://localhost:3010` by default.

## Default admin

On first boot, the server creates a default super admin from these env vars:

- `DEFAULT_ADMIN_FULL_NAME`
- `DEFAULT_ADMIN_LOGIN`
- `DEFAULT_ADMIN_EMAIL`
- `DEFAULT_ADMIN_PASSWORD`
- `SYNC_DEFAULT_ADMIN_ON_BOOT`

Legacy aliases `ADMIN_FULL_NAME`, `ADMIN_LOGIN`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`
are also supported.

If `SYNC_DEFAULT_ADMIN_ON_BOOT=true`, startup keeps the bootstrap super admin's
login/email/password synced with the values from `.env`.

Use either `login` or `email` on `POST /api/account/login`.

## Main endpoints

- `GET /health`
- `POST /api/account/login`
- `POST /api/account/login/password`
- `POST /api/account/login/verify`
- `POST /api/account/login/confirm`
- `GET /api/account/me`
- `POST /api/account/logout`
- `POST /api/account/logout-all`
- `GET /api/content/:resource`
- `GET /api/content/:resource/:id`
- `POST /api/content/:resource`
- `PUT /api/content/:resource/:id`
- `DELETE /api/content/:resource/:id`
- `GET /api/settings/:key`
- `PUT /api/settings/:key`
- `GET /api/admin-users`
- `POST /api/admin-users`
- `PUT /api/admin-users/:id`
- `DELETE /api/admin-users/:id`
- `POST /api/assistant/chat` — CMS-based AI conversation (`OPENAI_API_KEY` required)
- `POST /api/assistant/speech` — Uzbek, Russian or English audio; local speech works without API keys
- `POST /api/assistant/requests` — save an appeal or HEMIS support request
- `GET /api/assistant/requests?type=hemis` — latest 100 requests, available to authenticated admins and super admins

The fstuAI forms save to `assistant_requests` (migration `009_assistant_requests.sql`).
Requests contain `type` (`appeal` or `hemis`), `fullName`, `phone`, `subject`, `message`,
and `language` (`uz`, `ru`, `en`). HEMIS requests can also include `studentId` and `group`.
The API returns the saved request ID only after a successful database insert.

The robot supports Uzbek, Russian, and English. Basic greetings work without an AI key;
university questions use current page text and CMS facts even without an AI key. When OPENAI_API_KEY is configured, the same facts and conversation history are sent to the AI provider. Provider errors fall back to website search; missing facts are stated explicitly.

Natural conversational speech uses OpenAI Realtime on the backend. Set OPENAI_API_KEY
in backend/.env and restart the backend. The defaults are OPENAI_SPEECH_MODEL=gpt-realtime-2.1-mini
and OPENAI_SPEECH_VOICE=marin; cedar is another voice option. The API key stays server-side.
The voice is instructed to read the supplied text clearly, with natural pauses and a warm
conversational delivery, in the selected language. This is a built-in API voice, not a
copy of a specific ChatGPT voice. Uzbek pronunciation should be checked with a configured key.
See https://developers.openai.com/api/docs/guides/realtime-conversations for the protocol.

When OpenAI is configured, its voice is used consistently. Provider failures return
`openai_speech_unavailable`; an exhausted API balance returns `openai_speech_quota_exceeded`.
The interface displays a notice instead of silently changing to an offline or browser voice.
API usage requires an active credit balance; adding an API key alone does not add credits.
`OPENAI_SPEECH_VOICE` also accepts the existing `OPENAI_TTS_VOICE` setting as a fallback.

If OpenAI is not configured, Azure speech is tried when AZURE_SPEECH_KEY
and AZURE_SPEECH_REGION are set. Optional AZURE_SPEECH_VOICE or per-language
AZURE_SPEECH_VOICE_UZ, AZURE_SPEECH_VOICE_RU and AZURE_SPEECH_VOICE_EN select its voice.
The offline fallback uses @echogarden/espeak-ng-emscripten and returns a 22050 Hz mono WAV.
That fallback uses the female f3 voice variant at a connected speaking pace. It remains synthetic; a natural cloud voice requires working provider credentials. Uzbek Azure speech defaults to the female uz-UZ-MadinaNeural voice.
Typed and recognized spoken questions use the same chat path. A page-reading request reads visible main content directly, excluding navigation, forms, hidden text and the assistant. Long pages are read in paragraph-sized audio blocks; the next block is prepared during playback. Closing or stopping speech aborts queued upstream requests and releases browser audio resources.

The rounded white robot has a dark face screen, cyan eyes and a smiling mouth, based on
the supplied friendly robot reference. It is loaded from frontend/public/models/fstu-ai-friendly.glb.
The GLB contains eight animation clips, including floating, waving, listening and speaking.
Run node frontend/scripts/build-fstu-robot.mjs from the repository root to rebuild it.
It floats independently of the chat and can be dragged with a mouse or touch, or moved
using arrow keys while its move control is focused. Resizing keeps it inside the viewport.

## Supported content resources

- `menus`
- `banners`
- `advantages`
- `news`
- `announcements`
- `students`
- `partners`
- `statistics`
- `pages`
- `faculties`
- `faculty-page-menus`
- `employees-portfolios`

## Payload shape

The content API is intentionally flexible so it can map to the current admin forms.

Example:

```json
{
  "slug": "international-conference",
  "image": "https://example.com/image.jpg",
  "order": 1,
  "active": true,
  "uz": {
    "title": "Sarlavha",
    "content": "<p>Kontent</p>"
  },
  "ru": {
    "title": "Заголовок",
    "content": "<p>Контент</p>"
  },
  "metadata": {
    "link": "https://example.com"
  }
}
```

Language objects like `uz`, `ru`, `en` are automatically stored in `translations`. Any extra top-level fields are stored in `metadata`.
