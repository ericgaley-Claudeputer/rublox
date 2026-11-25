#!/usr/bin/env node
// Headless check: escape Afterbell School once, then spam E / pad / touch.
// Coins must rise only on the first claim. The leave button must hide after.
//   node tests/playtest/school_escape.js
const path = require('path');
const L = require('./lib');

async function boot(how){
  const {server, url} = await L.serve();
  const browser = await L.launch();
  const opts = how === 'mobile'
    ? { viewport: {width: 812, height: 375}, hasTouch: true, isMobile: true, userAgent: L.devices['iPhone 12'].userAgent }
    : { viewport: {width: 1280, height: 760} };
  const ctx = await browser.newContext(opts);
  if (how === 'pad') await ctx.addInitScript({path: path.join(__dirname, 'fakepad.js')});
  const page = await ctx.newPage();
  const errs = [];
  L.watch(page, errs);
  await page.goto(url);
  await page.waitForSelector('#grid .card');
  await page.fill('#nameIn', 'T');
  await page.click('#nameOk');
  await page.evaluate(() => Obby.play('school'));
  await page.waitForTimeout(1500);
  if (how === 'pad') await page.evaluate(() => __pad.connect());
  return {server, browser, page, errs};
}

async function coinsOf(page){
  return page.evaluate(() => (typeof coins === 'number' ? coins : 0));
}

async function setupDoor(page){
  await page.evaluate(() => { scDebug.unlock(); scDebug.goDoor(); });
  await page.waitForTimeout(400);
}

async function claimOnce(page, how){
  if (how === 'pad'){
    await page.evaluate(() => { __pad.set(2, 1); }); // Ⓧ
    await page.waitForTimeout(200);
    await page.evaluate(() => { __pad.set(2, 0); });
    await page.waitForTimeout(300);
  } else if (how === 'mobile'){
    const btn = page.locator('#scAct');
    await btn.waitFor({state: 'visible', timeout: 4000});
    await btn.tap();
    await page.waitForTimeout(300);
  } else {
    await page.keyboard.press('KeyE');
    await page.waitForTimeout(300);
  }
}

async function spam(page, how){
  if (how === 'pad'){
    for (const i of [2, 3, 7]){
      for (let n = 0; n < 6; n++){
        await page.evaluate(i => __pad.set(i, 1), i);
        await page.waitForTimeout(120);
        await page.evaluate(i => __pad.set(i, 0), i);
        await page.waitForTimeout(80);
      }
    }
  } else if (how === 'mobile'){
    // Button should be hidden; still try taps and the act hook.
    for (let n = 0; n < 8; n++){
      const shown = await page.evaluate(() => !!(document.getElementById('scAct') && document.getElementById('scAct').classList.contains('show')));
      if (shown) await page.locator('#scAct').tap().catch(() => {});
      await page.evaluate(() => { try { scDebug.act(); } catch (e){} });
      await page.waitForTimeout(80);
    }
  } else {
    for (let n = 0; n < 10; n++){
      await page.keyboard.press('KeyE');
      await page.keyboard.press('KeyF');
      await page.waitForTimeout(80);
    }
  }
}

async function runHow(how){
  const {server, browser, page, errs} = await boot(how);
  try {
    await setupDoor(page);
    const before = await coinsOf(page);
    const pre = await page.evaluate(() => scDebug.probe());
    if (!pre || !pre.pass || pre.won) throw new Error(how + ' not ready at the door: ' + JSON.stringify(pre));
    await claimOnce(page, how);
    await page.waitForTimeout(400);
    const mid = await coinsOf(page);
    const midProbe = await page.evaluate(() => scDebug.probe());
    if (!(mid > before)) throw new Error(how + ' first escape did not pay. before=' + before + ' mid=' + mid + ' probe=' + JSON.stringify(midProbe));
    if (!midProbe.won) throw new Error(how + ' won flag not set');
    if (midProbe.actShown) throw new Error(how + ' leave button still shown after claim');
    if (midProbe.prompt === 'exit') throw new Error(how + ' leave prompt still active after claim');
    await spam(page, how);
    const after = await coinsOf(page);
    if (after !== mid) throw new Error(how + ' coins rose again after spam. mid=' + mid + ' after=' + after);
    const pageErrs = errs.filter(e => e.kind === 'pageerror');
    if (pageErrs.length) throw new Error(how + ' page errors: ' + pageErrs.map(e => e.text).join(' | '));
    return {how, before, mid, after, paid: mid - before, ok: true};
  } finally {
    await browser.close();
    server.close();
  }
}

(async () => {
  const rows = [];
  for (const how of ['desk', 'mobile', 'pad']){
    const r = await runHow(how);
    console.log(JSON.stringify(r));
    rows.push(r);
  }
  if (!rows.every(r => r.ok)) process.exit(1);
  console.log('school escape reward is once-only on desk, mobile, and pad');
})().catch(err => { console.error(err); process.exit(1); });
