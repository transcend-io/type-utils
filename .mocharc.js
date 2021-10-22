module.exports = {
  require: ['ts-node/register/transpile-only'],
  ignore: [
    // Never look for test files in these folders
    '**/build/**/*',
    '**/node_modules/**/*',
  ],
  watchFiles: ['node_only/**/*.js', 'src/**/*.ts'],
  extension: ['js', 'json', 'ts', 'tsx'],
  reporter: 'spec',
  reporterOptions: {
    configFile: 'mocha-reporter-config.json',
  },
  colors: true,
};
