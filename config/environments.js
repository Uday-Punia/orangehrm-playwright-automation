const environments = {
  demo: 'https://opensource-demo.orangehrmlive.com',
  qa: process.env.QA_URL,
  uat: process.env.UAT_URL
};

const environment = process.env.TEST_ENV || 'demo';

if (!Object.hasOwn(environments, environment)) {
  throw new Error(`Unknown environment: ${environment}`);
}

const baseURL = environments[environment];

if (!baseURL) {
  throw new Error(`URL not configured for: ${environment}`);
}

module.exports = { baseURL };