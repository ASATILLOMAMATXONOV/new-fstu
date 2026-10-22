
import dotenv from 'dotenv';

dotenv.config();

// ======================================================
// ENVIRONMENT HELPERS
// ======================================================

function toBoolean(value, defaultValue = false) {
  if (value === undefined) {
    return defaultValue;
  }

  return ['1', 'true', 'yes', 'on'].includes(
    String(value).toLowerCase()
  );
}

function toNumber(value, defaultValue) {
  if (
    value === undefined ||
    value === null ||
    String(value).trim() === ''
  ) {
    return defaultValue;
  }

  const parsed = Number(value);

  return Number.isFinite(parsed)
    ? parsed
    : defaultValue;
}

function toList(value, defaultValue = []) {
  const source = value ?? defaultValue.join(',');

  return String(source)
    .split(',')
    .map((item) => item.trim().replace(/\/$/, ''))
    .filter(Boolean);
}

// ======================================================
// DATABASE CONFIGURATION
// ======================================================

function hasAnyDatabasePartEnv() {
  return [
    process.env.DB_HOST,
    process.env.DB_PORT,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    process.env.DB_NAME
  ].some(
    (value) =>
      value !== undefined &&
      String(value).trim() !== ''
  );
}

function buildDatabaseUrlFromParts() {
  const host = String(
    process.env.DB_HOST || 'localhost'
  ).trim();

  const port = toNumber(
    process.env.DB_PORT,
    5432
  );

  const user = encodeURIComponent(
    String(
      process.env.DB_USER || 'postgres'
    ).trim()
  );

  const password = encodeURIComponent(
    String(
      process.env.DB_PASSWORD || ''
    ).trim()
  );

  const databaseName = encodeURIComponent(
    String(
      process.env.DB_NAME || 'fstu_cms'
    ).trim()
  );

  const authSegment = password
    ? `${user}:${password}`
    : user;

  return (
    `postgresql://${authSegment}` +
    `@${host}:${port}/${databaseName}`
  );
}

function resolveDatabaseUrl() {
  if (hasAnyDatabasePartEnv()) {
    return buildDatabaseUrlFromParts();
  }

  return (
    process.env.DATABASE_URL ||
    'postgres://postgres:postgres@localhost:5432/fstu_cms'
  );
}

// ======================================================
// OPENAI CONFIGURATION
// ======================================================

const OPENAI_DEFAULTS = {
  model: 'gpt-4o-mini',
  ttsModel: 'gpt-4o-mini-tts',
  ttsVoice: 'coral',
  ttsSpeed: 1,
  timeout: 45000,
  maxSpeechCharacters: 4096
};

const SUPPORTED_TTS_VOICES = [
  'alloy',
  'ash',
  'ballad',
  'coral',
  'echo',
  'fable',
  'onyx',
  'nova',
  'sage',
  'shimmer',
  'verse',
  'marin',
  'cedar'
];

function resolveTtsVoice() {
  const requestedVoice = String(
    process.env.OPENAI_TTS_VOICE ||
    OPENAI_DEFAULTS.ttsVoice
  )
    .trim()
    .toLowerCase();

  if (SUPPORTED_TTS_VOICES.includes(requestedVoice)) {
    return requestedVoice;
  }

  return OPENAI_DEFAULTS.ttsVoice;
}

function resolveTtsSpeed() {
  const speed = toNumber(
    process.env.OPENAI_TTS_SPEED,
    OPENAI_DEFAULTS.ttsSpeed
  );

  return Math.min(4, Math.max(0.25, speed));
}

// ======================================================
// MAIN APPLICATION CONFIGURATION
// ======================================================

export const env = {
  // ----------------------------------------------------
  // SERVER
  // ----------------------------------------------------

  nodeEnv: process.env.NODE_ENV || 'development',

  port: toNumber(
    process.env.PORT,
    4000
  ),

  // ----------------------------------------------------
  // POSTGRESQL
  // ----------------------------------------------------

  databaseUrl: resolveDatabaseUrl(),

  databaseSsl: toBoolean(
    process.env.DATABASE_SSL,
    false
  ),

  // ----------------------------------------------------
  // JWT AUTHENTICATION
  // ----------------------------------------------------

  jwtSecret:
    process.env.JWT_SECRET ||
    'change-this-secret',

  jwtExpiresIn:
    process.env.JWT_EXPIRES_IN ||
    '12h',

  jwtIssuer:
    process.env.JWT_ISSUER ||
    'fstu-admin',

  jwtAudience:
    process.env.JWT_AUDIENCE ||
    'fstu-admin-panel',

  // ----------------------------------------------------
  // PASSWORD SECURITY
  // ----------------------------------------------------

  bcryptRounds: Math.max(
    10,
    toNumber(
      process.env.BCRYPT_ROUNDS,
      12
    )
  ),

  authMaxFailedAttempts: Math.max(
    3,
    toNumber(
      process.env.AUTH_MAX_FAILED_ATTEMPTS,
      5
    )
  ),

  authLockMinutes: Math.max(
    5,
    toNumber(
      process.env.AUTH_LOCK_MINUTES,
      15
    )
  ),

  loginRateLimitWindowMs: Math.max(
    60000,
    toNumber(
      process.env.LOGIN_RATE_LIMIT_WINDOW_MS,
      10 * 60 * 1000
    )
  ),

  loginRateLimitMaxAttempts: Math.max(
    5,
    toNumber(
      process.env.LOGIN_RATE_LIMIT_MAX_ATTEMPTS,
      10
    )
  ),

  adminPasswordMinLength: Math.max(
    10,
    toNumber(
      process.env.ADMIN_PASSWORD_MIN_LENGTH,
      12
    )
  ),

  // ----------------------------------------------------
  // CORS CONFIGURATION
  // ----------------------------------------------------

  corsOrigins: toList(
    process.env.CORS_ORIGINS ??
      process.env.CORS_ORIGIN,
    [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:5173',
      'http://localhost:5174',
      'https://new.fstu.uz',
      'https://www.new.fstu.uz',
      'https://admin.new.fstu.uz'
    ]
  ),

  // ----------------------------------------------------
  // USER REGISTRATION
  // ----------------------------------------------------

  allowPublicRegistration: toBoolean(
    process.env.ALLOW_PUBLIC_REGISTRATION,
    false
  ),

  // ----------------------------------------------------
  // DEFAULT ADMIN
  // ----------------------------------------------------

  defaultAdminFullName:
    process.env.DEFAULT_ADMIN_FULL_NAME ||
    process.env.ADMIN_FULL_NAME ||
    'System Administrator',

  defaultAdminLogin:
    process.env.DEFAULT_ADMIN_LOGIN ||
    process.env.ADMIN_LOGIN ||
    'admin',

  defaultAdminEmail:
    process.env.DEFAULT_ADMIN_EMAIL ||
    process.env.ADMIN_EMAIL ||
    'admin@fstu.local',

  defaultAdminPassword:
    process.env.DEFAULT_ADMIN_PASSWORD ||
    process.env.ADMIN_PASSWORD ||
    'Admin123!',

  syncDefaultAdminOnBoot: toBoolean(
    process.env.SYNC_DEFAULT_ADMIN_ON_BOOT,
    false
  ),

  // ----------------------------------------------------
  // OPENAI ASSISTANT
  // ----------------------------------------------------

  openaiApiKey: String(
    process.env.OPENAI_API_KEY || ''
  ).trim(),

  openaiModel:
    process.env.OPENAI_MODEL ||
    OPENAI_DEFAULTS.model,

  // ----------------------------------------------------
  // OPENAI TEXT TO SPEECH
  // ----------------------------------------------------

  openaiTtsModel:
    process.env.OPENAI_TTS_MODEL ||
    OPENAI_DEFAULTS.ttsModel,

  openaiTtsVoice: resolveTtsVoice(),

  openaiTtsSpeed: resolveTtsSpeed(),

  openaiTtsFormat:
    process.env.OPENAI_TTS_FORMAT ||
    'mp3',

  openaiTtsTimeout: Math.max(
    5000,
    toNumber(
      process.env.OPENAI_TTS_TIMEOUT,
      OPENAI_DEFAULTS.timeout
    )
  ),

  openaiMaxSpeechCharacters: Math.min(
    4096,
    Math.max(
      100,
      toNumber(
        process.env.OPENAI_MAX_SPEECH_CHARACTERS,
        OPENAI_DEFAULTS.maxSpeechCharacters
      )
    )
  ),

  // ----------------------------------------------------
  // AI ASSISTANT OPTIONS
  // ----------------------------------------------------

  assistantEnabled: toBoolean(
    process.env.ASSISTANT_ENABLED,
    true
  ),

  assistantSpeechEnabled: toBoolean(
    process.env.ASSISTANT_SPEECH_ENABLED,
    true
  ),

  assistantDefaultLanguage:
    process.env.ASSISTANT_DEFAULT_LANGUAGE ||
    'uz',

  assistantFallbackBrowserSpeech: toBoolean(
    process.env.ASSISTANT_BROWSER_FALLBACK,
    true
  )
};

// ======================================================
// CONFIGURATION VALIDATION
// ======================================================

export function validateOpenAIConfiguration() {
  const warnings = [];

  if (!env.assistantEnabled) {
    return {
      valid: true,
      enabled: false,
      warnings
    };
  }

  if (!env.openaiApiKey) {
    warnings.push(
      'OPENAI_API_KEY is not configured.'
    );
  }

  if (!env.openaiModel) {
    warnings.push(
      'OPENAI_MODEL is missing.'
    );
  }

  if (
    env.assistantSpeechEnabled &&
    !env.openaiTtsModel
  ) {
    warnings.push(
      'OPENAI_TTS_MODEL is missing.'
    );
  }

  return {
    valid: warnings.length === 0,
    enabled: true,
    warnings
  };
}
