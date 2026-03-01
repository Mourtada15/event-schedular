import dotenv from 'dotenv';

dotenv.config();

const isProduction = process.env.NODE_ENV === 'production';
const defaultClientOrigins = ['http://localhost:5173', 'http://127.0.0.1:5173'];
const defaultAccessSecret = 'dev_access_secret_change_me';
const defaultRefreshSecret = 'dev_refresh_secret_change_me';

function parseClientOrigins(rawValue) {
  if (!rawValue || !rawValue.trim()) {
    return isProduction ? [] : defaultClientOrigins;
  }

  const values = rawValue
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);

  return values.length ? values : isProduction ? [] : defaultClientOrigins;
}

const clientOrigins = parseClientOrigins(process.env.CLIENT_ORIGIN);

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  isProduction,
  port: Number(process.env.PORT || 5000),
  mongoUri: process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/event_scheduler',
  clientOrigin: clientOrigins[0],
  clientOrigins,
  jwtAccessSecret: process.env.JWT_ACCESS_SECRET || defaultAccessSecret,
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || defaultRefreshSecret,
  accessTokenTtl: process.env.ACCESS_TOKEN_TTL || '15m',
  refreshTokenTtlDays: Number(process.env.REFRESH_TOKEN_TTL_DAYS || 7),
  openAiApiKey: process.env.OPENAI_API_KEY || '',
  smtpHost: process.env.SMTP_HOST || '',
  smtpPort: Number(process.env.SMTP_PORT || 0),
  smtpUser: process.env.SMTP_USER || '',
  smtpPass: process.env.SMTP_PASS || '',
  smtpFrom: process.env.SMTP_FROM || 'no-reply@example.com',
  inviteTokenTtlHours: Number(process.env.INVITE_TOKEN_TTL_HOURS || 168)
};

if (env.isProduction) {
  const productionErrors = [];

  if (!env.clientOrigins.length) {
    productionErrors.push('CLIENT_ORIGIN is required in production (supports comma-separated origins).');
  }
  if (env.jwtAccessSecret === defaultAccessSecret || env.jwtAccessSecret.length < 32) {
    productionErrors.push('JWT_ACCESS_SECRET must be set to a strong value (min 32 chars) in production.');
  }
  if (env.jwtRefreshSecret === defaultRefreshSecret || env.jwtRefreshSecret.length < 32) {
    productionErrors.push('JWT_REFRESH_SECRET must be set to a strong value (min 32 chars) in production.');
  }
  if (!env.mongoUri) {
    productionErrors.push('MONGO_URI must be set in production.');
  }

  if (productionErrors.length) {
    throw new Error(`Invalid production environment:\n- ${productionErrors.join('\n- ')}`);
  }
}
