// Run with: node supabase/generate-secrets.js
// Generates JWT_SECRET, ANON_KEY and SERVICE_ROLE_KEY for self-hosted Supabase

const crypto = require('crypto');

const secret = crypto.randomBytes(40).toString('hex');

function base64url(obj) {
  return Buffer.from(JSON.stringify(obj))
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function makeJWT(payload, secret) {
  const header = base64url({ alg: 'HS256', typ: 'JWT' });
  const body = base64url(payload);
  const msg = `${header}.${body}`;
  const sig = crypto
    .createHmac('sha256', secret)
    .update(msg)
    .digest('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
  return `${msg}.${sig}`;
}

const now = Math.floor(Date.now() / 1000);
const exp = now + 10 * 365 * 24 * 3600; // 10 years

const anonKey = makeJWT({ role: 'anon', iss: 'supabase', iat: now, exp }, secret);
const serviceKey = makeJWT({ role: 'service_role', iss: 'supabase', iat: now, exp }, secret);

console.log('# Copy these into your .env.supabase file:\n');
console.log(`JWT_SECRET=${secret}`);
console.log(`SUPABASE_ANON_KEY=${anonKey}`);
console.log(`SUPABASE_SERVICE_ROLE_KEY=${serviceKey}`);
console.log(`POSTGRES_PASSWORD=${crypto.randomBytes(16).toString('hex')}`);
