// showEnv.js (temporary - delete after)
require('dotenv').config();
console.log('Account SID:', process.env.TWILIO_ACCOUNT_SID ? 'FOUND' : 'MISSING');
console.log('Auth Token:', process.env.TWILIO_AUTH_TOKEN ? 'FOUND' : 'MISSING');
