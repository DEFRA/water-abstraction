module.exports = {

  testMode: parseInt(process.env.test_mode) === 1,

  idm: {
    application: 'water_vml'
  },

  defaultAuth: {
    strategy: 'standard',
    mode: 'try'
  },

  blipp: {
    showAuth: true
  },

  crm: {
    regimes: {
      water: {
        entityId: '0434dc31-a34e-7158-5775-4694af7a60cf'
      }
    }
  },

  good: {
    ops: {
      interval: 60000
    }
  },

  holdingPage: {
    enabled: !!parseInt(process.env.holding_page, 10),
    redirect: '/private-beta-closed',
    ignore: /^\/public\//
  },

  jwt: {
    key: process.env.JWT_SECRET,
    verifyOptions: { algorithms: [ 'HS256' ] }
  },

  logger: {
    level: 'info',
    airbrakeKey: process.env.errbit_key,
    airbrakeHost: process.env.errbit_server,
    airbrakeLevel: 'error'
  },

  hapiAuthCookie: {
    cookie: 'sid',
    password: process.env.cookie_secret, // cookie secret
    isSecure: !!(process.env.NODE_ENV || '').match(/^dev|test|production|preprod$/i),
    isSameSite: 'Lax',
    ttl: 24 * 60 * 60 * 1000, // Set session to 1 day,
    redirectTo: '/welcome',
    isHttpOnly: true
  },

  sanitize: {
    pruneMethod: 'replace',
    replaceValue: ''
  },

  server: {
    port: process.env.PORT,
    router: {
      stripTrailingSlash: true
    }
  }

};
