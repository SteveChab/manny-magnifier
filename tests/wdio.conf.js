process.env.ANDROID_HOME = process.env.ANDROID_HOME ||
  `${process.env.HOME}/Library/Android/sdk`;
process.env.ANDROID_SDK_ROOT = process.env.ANDROID_SDK_ROOT || process.env.ANDROID_HOME;

exports.config = {
  runner: 'local',
  specs: ['./app.spec.js'],
  capabilities: [{
    platformName: 'Android',
    'appium:automationName': 'UiAutomator2',
    'appium:appPackage': 'com.mmagnifier.app',
    'appium:appActivity': '.MainActivity',
    'appium:noReset': true,
    'appium:chromedriverExecutable': './drivers/chromedriver147',
  }],
  logLevel: 'warn',
  framework: 'mocha',
  reporters: ['spec'],
  mochaOpts: { timeout: 30000 },
  services: [
    ['appium', {
      command: 'appium',
      logPath: './',
    }],
  ],
};
