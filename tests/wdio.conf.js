process.env.ANDROID_HOME = process.env.ANDROID_HOME ||
  `${process.env.HOME}/Library/Android/sdk`;
process.env.ANDROID_SDK_ROOT = process.env.ANDROID_SDK_ROOT || process.env.ANDROID_HOME;

// ChromeDriver must match the *major version* of the WebView on the target device, and that
// version differs between phones and emulators and moves every few weeks. Pinning a binary
// (the old ./drivers/chromedriver147) meant the suite only ran on one machine against one
// device — and drivers/ is gitignored, so a fresh clone couldn't run the tests at all.
//
// Default: let Appium fetch the driver that matches whatever is attached.
// Escape hatch: set CHROMEDRIVER=/path/to/chromedriver to use a local binary offline.
const localChromedriver = process.env.CHROMEDRIVER;

exports.config = {
  runner: 'local',
  specs: ['./app.spec.js'],
  capabilities: [{
    platformName: 'Android',
    'appium:automationName': 'UiAutomator2',
    'appium:appPackage': 'com.mmagnifier.app',
    'appium:appActivity': '.MainActivity',
    'appium:noReset': true,
    ...(localChromedriver
      ? { 'appium:chromedriverExecutable': localChromedriver }
      : { 'appium:chromedriverAutodownload': true }),
  }],
  logLevel: 'warn',
  framework: 'mocha',
  reporters: ['spec'],
  mochaOpts: { timeout: 60000 },

  // Two ways to run:
  //
  //   npm test                  — WDIO starts and stops its own Appium server.
  //   APPIUM_EXTERNAL=1 npm test — connect to an Appium server you started yourself.
  //
  // The external mode exists because the automatic chromedriver download needs a server
  // feature that WDIO's appium service does not reliably forward on Appium 3. Start the
  // server yourself when the device's WebView major version has moved on:
  //
  //   appium --allow-insecure=uiautomator2:chromedriver_autodownload --port 4723
  //
  ...(process.env.APPIUM_EXTERNAL
    ? { hostname: '127.0.0.1', port: 4723, path: '/', services: [] }
    : {
        services: [
          ['appium', {
            command: 'appium',
            args: { allowInsecure: ['uiautomator2:chromedriver_autodownload'] },
            logPath: './',
          }],
        ],
      }),
};
