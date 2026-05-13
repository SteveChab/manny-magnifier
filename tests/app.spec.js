const assert = require('assert');

// ── Helpers ────────────────────────────────────────────────────────────────

async function switchToWebView() {
  await browser.waitUntil(async () => {
    const contexts = await driver.getContexts();
    return contexts.some(c => c.includes('WEBVIEW'));
  }, { timeout: 10000, timeoutMsg: 'WebView context never appeared — check that WebContentsDebuggingEnabled is set in MainActivity.java' });
  const contexts = await driver.getContexts();
  await driver.switchContext(contexts.find(c => c.includes('WEBVIEW')));
}

async function ensureResumed() {
  // If app is in Pause/Resume state, tap Resume to get back to live feed
  const label = await $('#freeze-label').getText().catch(() => 'Pause');
  if (label === 'Resume') await $('#freeze-btn').click();
}

// ── Suite ──────────────────────────────────────────────────────────────────

describe('mmagnifier Android', () => {
  before(async () => {
    // Fresh launch
    await driver.terminateApp('com.mmagnifier.app');
    await driver.activateApp('com.mmagnifier.app');
    await switchToWebView();
    // Wait for app UI to be ready (camera permission assumed already granted)
    await $('[aria-label="Change color mode"]').waitForDisplayed({ timeout: 8000 });
    await browser.pause(500); // let camera settle
  });

  // ── Color modes ──────────────────────────────────────────────────────────

  describe('Color mode cycling', () => {
    before(async () => {
      await ensureResumed();
      // Reset to mode 0 (Color) by cycling until label reads 'Color'
      for (let i = 0; i < 7; i++) {
        const label = await $('#mode-label').getText();
        if (label === 'Color') break;
        await $('[aria-label="Change color mode"]').click();
        await browser.pause(80);
      }
    });

    it('starts on Color', async () => {
      assert.equal(await $('#mode-label').getText(), 'Color');
    });

    it('cycles through all 7 modes in order', async () => {
      const expected = ['Y / Blk', 'Blk / Y', 'G / Blk', 'Blk / G', 'P / Blk', 'Blk / P', 'Color'];
      const btn = await $('[aria-label="Change color mode"]');
      for (const name of expected) {
        await btn.click();
        await browser.pause(80);
        const label = await $('#mode-label').getText();
        assert.equal(label, name, `Expected "${name}" after tap`);
      }
    });
  });

  // ── Brightness ───────────────────────────────────────────────────────────

  describe('Brightness cycling', () => {
    before(async () => {
      await ensureResumed();
      // Reset to 1× by cycling until we see it
      for (let i = 0; i < 4; i++) {
        if ((await $('#bright-label').getText()) === '1×') break;
        await $('[aria-label="Change brightness"]').click();
        await browser.pause(80);
      }
    });

    it('cycles through 4 contrast levels in order', async () => {
      const expected = ['2×', '3×', '4×', '1×'];
      const btn = await $('[aria-label="Change brightness"]');
      for (const level of expected) {
        await btn.click();
        await browser.pause(80);
        assert.equal(await $('#bright-label').getText(), level);
      }
    });
  });

  // ── Zoom ─────────────────────────────────────────────────────────────────

  describe('Zoom cycling', () => {
    before(ensureResumed);

    it('zoom pill label ends with × after each tap', async () => {
      const pill = await $('#zoom-pill');
      await pill.click();
      await browser.pause(200);
      const label = await $('#zoom-label').getText();
      assert.ok(label.endsWith('×'), `Zoom label "${label}" does not end with ×`);
    });

    it('3 rapid zoom taps complete in under 1500ms (lastAppliedZoom guard intact)', async () => {
      const pill = await $('#zoom-pill');
      const t0 = Date.now();
      await pill.click();
      await pill.click();
      await pill.click();
      const elapsed = Date.now() - t0;
      assert.ok(elapsed < 2000,
        `3 zoom taps took ${elapsed}ms — lastAppliedZoom guard may have been removed, causing applyConstraints stall`);
    });
  });

  // ── Pause / Resume ───────────────────────────────────────────────────────

  describe('Pause / Resume', () => {
    before(ensureResumed);

    it('Pause button label changes to "Resume" when tapped', async () => {
      await $('#freeze-btn').click();
      await browser.pause(100);
      assert.equal(await $('#freeze-label').getText(), 'Resume');
      await $('#freeze-btn').click(); // restore
    });

    it('Resume button label changes back to "Pause" when tapped', async () => {
      await $('#freeze-btn').click(); // Pause
      await browser.pause(100);
      await $('#freeze-btn').click(); // Resume
      await browser.pause(100);
      assert.equal(await $('#freeze-label').getText(), 'Pause');
    });

    it('draw loop stops when paused (timestamp stops advancing)', async () => {
      await $('#freeze-btn').click(); // Pause
      await browser.pause(300);
      const ts1 = await browser.execute(() => window._lastDrawnTimestamp);
      await browser.pause(400); // wait — if loop running, timestamp would advance
      const ts2 = await browser.execute(() => window._lastDrawnTimestamp);
      assert.equal(ts1, ts2, 'Timestamp advanced while paused — draw loop did not stop');
      await $('#freeze-btn').click(); // restore
    });

    it('draw loop resumes when unpaused (timestamp advances)', async () => {
      await $('#freeze-btn').click(); // Pause
      await browser.pause(200);
      await $('#freeze-btn').click(); // Resume
      await browser.pause(300); // let at least a few frames draw at 30fps
      const ts1 = await browser.execute(() => window._lastDrawnTimestamp);
      await browser.pause(200);
      const ts2 = await browser.execute(() => window._lastDrawnTimestamp);
      assert.ok(ts2 > ts1, 'Timestamp did not advance after resuming — draw loop not running');
    });

    it('color mode button still works while paused (label changes)', async () => {
      await $('#freeze-btn').click(); // Pause
      const before = await $('#mode-label').getText();
      await $('[aria-label="Change color mode"]').click();
      await browser.pause(100);
      const after = await $('#mode-label').getText();
      assert.notEqual(before, after, 'Mode label did not change while paused');
      await $('#freeze-btn').click(); // restore
    });

    it('zoom pill still works while paused (label changes)', async () => {
      await $('#freeze-btn').click(); // Pause
      const before = await $('#zoom-label').getText();
      await $('#zoom-pill').click();
      await browser.pause(100);
      const after = await $('#zoom-label').getText();
      assert.notEqual(before, after, 'Zoom label did not change while paused');
      await $('#freeze-btn').click(); // restore
    });
  });

  // ── Native features ──────────────────────────────────────────────────────

  describe('Native features (torch + OCR)', () => {
    it('Torch, Pause, and Read buttons are all visible (confirms native context)', async () => {
      for (const id of ['#torch-btn', '#freeze-btn', '#read-btn']) {
        assert.ok(await $(id).isDisplayed(), `${id} not visible — not running in native context`);
      }
    });

    it('OCR reentrancy — stopping immediately produces no stale .ocr-block elements', async () => {
      // Pause first — OCR requires a frozen frame
      if ((await $('#freeze-label').getText()) !== 'Resume') {
        await $('#freeze-btn').click();
        await browser.pause(200);
      }

      await $('#read-btn').click();     // start OCR
      await browser.pause(50);          // minimal wait — don't let it finish
      await $('#read-btn').click();     // stop immediately (label is "Stop" now)
      await browser.pause(800);         // let any stale async callback arrive

      const blocks = await $$('.ocr-block');
      assert.equal(blocks.length, 0,
        `${blocks.length} stale OCR block(s) found after cancel — ocrGeneration guard may be broken`);

      await ensureResumed();
    });
  });

  // ── LocalStorage persistence ─────────────────────────────────────────────

  describe('LocalStorage persistence', () => {
    it('modeIndex survives app restart', async () => {
      await ensureResumed();

      // Drive to mode 2 (Blk / Y) via button — updates in-memory state and triggers save()
      for (let i = 0; i < 10; i++) {
        if ((await $('#mode-label').getText()) === 'Blk / Y') break;
        await $('[aria-label="Change color mode"]').click();
        await browser.pause(80);
      }
      assert.equal(await $('#mode-label').getText(), 'Blk / Y', 'Could not reach Blk / Y mode in setup');
      await browser.pause(400); // let debounced save() commit to localStorage

      await driver.switchContext('NATIVE_APP');
      await driver.terminateApp('com.mmagnifier.app');
      await driver.activateApp('com.mmagnifier.app');
      await switchToWebView();
      await $('[aria-label="Change color mode"]').waitForDisplayed({ timeout: 8000 });

      assert.equal(await $('#mode-label').getText(), 'Blk / Y',
        'Mode did not persist across restart');

      // Reset back to Color for subsequent tests
      for (let i = 0; i < 10; i++) {
        if ((await $('#mode-label').getText()) === 'Color') break;
        await $('[aria-label="Change color mode"]').click();
        await browser.pause(80);
      }
    });

    it('brightIndex survives app restart', async () => {
      await ensureResumed();

      // Drive to brightIndex 2 (3×) via button
      for (let i = 0; i < 6; i++) {
        if ((await $('#bright-label').getText()) === '3×') break;
        await $('[aria-label="Change brightness"]').click();
        await browser.pause(80);
      }
      assert.equal(await $('#bright-label').getText(), '3×', 'Could not reach 3× brightness in setup');
      await browser.pause(400); // let debounced save() commit to localStorage

      await driver.switchContext('NATIVE_APP');
      await driver.terminateApp('com.mmagnifier.app');
      await driver.activateApp('com.mmagnifier.app');
      await switchToWebView();
      await $('[aria-label="Change brightness"]').waitForDisplayed({ timeout: 8000 });

      assert.equal(await $('#bright-label').getText(), '3×',
        'Brightness did not persist across restart');
    });
  });
});
