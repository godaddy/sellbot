const router = require('express').Router();
const poynt = require('../lib/poynt');
const validate = require('../lib/validate');
const jwt = require('jsonwebtoken');
const util = require('util');
const uuid = require('uuid');
const fs = require('fs');
const path = require('path');

const asyncGetBusiness = util.promisify(poynt.getBusiness).bind(poynt);

const signupTokenPublicKeyFile = path.resolve(
  __dirname,
  '..',
  global.configs.signupTokenPublicKeyFile || 'poynt-public.pem'
);
var signupTokenPublicKey;

function loadSignupTokenPublicKey() {
  if (signupTokenPublicKey === undefined) {
    try {
      signupTokenPublicKey = fs.readFileSync(signupTokenPublicKeyFile, 'utf8');
    } catch (err) {
      signupTokenPublicKey = null;
      console.log(
        'Poynt signup token public key not found at ' + signupTokenPublicKeyFile +
          ' - /link/callback rejects all tokens until it is configured'
      );
    }
  }
  return signupTokenPublicKey;
}

// Fails closed: without a public key every token is rejected, and there is no fallback to jwt.decode.
function verifySignupToken(code) {
  const publicKey = loadSignupTokenPublicKey();
  if (!publicKey) {
    throw new Error('Signup token public key is not configured');
  }
  const options = {
    algorithms: ['RS256'],
    subject: global.configs.applicationId,
  };
  if (global.configs.signupTokenIssuer) {
    options.issuer = global.configs.signupTokenIssuer;
  }
  return jwt.verify(code, publicKey, options);
}

router.get('/', (_req, res) => {
  res.render('link/index', {
    page: 'link',
    uuid: uuid.v4(),
  });
});

router.get('/callback', async (req, res) => {
  var token;
  if (typeof req.query.code === 'string') {
    try {
      token = verifySignupToken(req.query.code);
    } catch (err) {
      console.log('Verifying token failed', err.message);
    }
  }

  var business;
  if (token && validate.isUuid(token['poynt.biz'])) {
    try {
      business = await asyncGetBusiness({
        businessId: token['poynt.biz'],
      });
    } catch (err) {
      console.log('Loading business info failed', err);
    }
  }

  res.render('link/callback', {
    business: business,
    context: typeof req.query.context === 'string' ? req.query.context : undefined,
    page: 'link',
    token: token,
  });
});

module.exports = router;
