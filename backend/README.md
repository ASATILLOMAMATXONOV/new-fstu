# FSTU Backend

Node.js + Express + PostgreSQL backend for the `frontend` and `admin` apps.

## Features

- JWT login for admin panel
- PostgreSQL-backed CMS-style content storage
- SQL migrations without extra ORM tooling
- Reusable CRUD endpoints for content sections
- Singleton settings endpoint for pages like rector speech

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
- `GET /api/account/me`
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
