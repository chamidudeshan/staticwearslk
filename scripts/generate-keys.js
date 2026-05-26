/**
 * Generates ANON_KEY and SERVICE_ROLE_KEY for self-hosted Supabase.
 * Usage: node scripts/generate-keys.js
 * Requires JWT_SECRET to be set in environment or passed as argument.
 *
 * Install dep first: npm install jsonwebtoken
 */
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.argv[2] || process.env.JWT_SECRET;

if (!JWT_SECRET || JWT_SECRET.length < 32) {
  console.error('ERROR: Provide JWT_SECRET as argument or env var (min 32 chars)');
  console.error('Usage: JWT_SECRET=your-secret node scripts/generate-keys.js');
  process.exit(1);
}

const anonPayload = {
  role: 'anon',
  iss: 'supabase',
  iat: Math.floor(Date.now() / 1000),
  exp: Math.floor(Date.now() / 1000) + 10 * 365 * 24 * 60 * 60, // 10 years
};

const servicePayload = {
  role: 'service_role',
  iss: 'supabase',
  iat: Math.floor(Date.now() / 1000),
  exp: Math.floor(Date.now() / 1000) + 10 * 365 * 24 * 60 * 60,
};

const anonKey = jwt.sign(anonPayload, JWT_SECRET, { algorithm: 'HS256' });
const serviceKey = jwt.sign(servicePayload, JWT_SECRET, { algorithm: 'HS256' });

console.log('\n── Generated Keys ──────────────────────────────────────────');
console.log('\nANON_KEY=');
console.log(anonKey);
console.log('\nSERVICE_ROLE_KEY=');
console.log(serviceKey);
console.log('\nCopy these into your .env file on the VPS.');
console.log('────────────────────────────────────────────────────────────\n');
