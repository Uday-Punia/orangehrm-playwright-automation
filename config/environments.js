const environments = {

  demo: {
    url: 'https://opensource-demo.orangehrmlive.com',
    username: 'Admin',
    password: 'admin123'
  },

  qa: {
    url: process.env.QA_URL,
    username: process.env.QA_USERNAME,
    password: process.env.QA_PASSWORD
  },

  uat: {
    url: process.env.UAT_URL,
    username: process.env.UAT_USERNAME,
    password: process.env.UAT_PASSWORD
  }

};

// Default environment is demo
const environment = process.env.TEST_ENV || 'demo';
const config = environments[environment];

if (!config || !config.url || !config.username || !config.password) {
  throw new Error('Environment not configured: ' + environment);
}

module.exports = {
  baseURL: config.url,
  username: config.username,
  password: config.password
};