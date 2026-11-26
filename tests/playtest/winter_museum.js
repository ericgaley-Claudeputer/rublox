#!/usr/bin/env node
// Headless GB-6 playtest on desk, phone and Xbox pad:
//  Pinebell: build a snow fort (place / scoop), throw at a mitten flag (fort wall blocks it, then a clean hit),
//            run a Frostlane Star Show for the judges — pays once per show, max 3 paid shows a day.
//  Brightwhistle Museum: bus ride, five exhibits, five owl tokens (pay once + bonus once), a gift, ride home (pay once).
//   node tests/playtest/winter_museum.js [--out=/workspace/rublox-shots/winter] [--only=desk|phone|pad]
const fs = require('fs');
const path = require('path');
const L = require('./lib');
const arg = (k, d) => { const a = process.argv.find(x => x.startsWith('--' + k)); if (!a) return d; const i = a.indexOf('='); return i < 0 ? true : a.slice(i + 1); };
const OUT = arg('out', '/workspace/rublox-shots/winter');
const ONLY = arg('only', '');
fs.mkdirSync(OUT, { recursive: true });
const fails = [];
const check = (ok, msg) => { if (!ok){ fails.push(msg); console.log('  ✗ ' + msg); } else console.log('  ✓ ' + msg); };
const wait = (page, ms) => page.waitForTimeout(ms);

async function boot(how){
  const {server, url} = await L.serve();
  const browser = await L.launch();
  const opts = how === 'phone'
    ? { viewport: {width: 812, height: 375}, hasTouch: true, isMobile: true, userAgent: L.devices['iPhone 12'].userAgent }
    : { viewport: {width: 1280, height: 760} };
  const ctx = await browser.newContext(opts);
  if (how === 'pad') await ctx.addInitScript({path: path.join(__dirname, 'fakepad.js')});
  await ctx.addInitScript(() => { try { localStorage.clear(); } catch (e){} });
  const page = await ctx.newPage();
  const errs = [];
  L.watch(page, errs);
  await page.goto(url);
  await page.waitForSelector('#grid .card');
  await page.fill('#nameIn', 'T');
  await page.click('#nameOk');
  return {server, browser, page, errs};
}
const coinsOf = page => page.evaluate(() => (typeof coins === 'number' ? coins : 0));
async function press(page, how, what){
  // what: act | alt | throw | hop
  if (how === 'pad'){
    const b = {act: 2, alt: 3, throw: 5, hop: 0}[what];
    await page.evaluate(i => __pad.set(i, 1), b); await wait(page, 260);
    await page.evaluate(i => __pad.set(i, 0), b); await wait(page, 220);
  } else if (how === 'phone'){
    const sel = {act: '#wnAct', alt: '#wnFortBtn', throw: '#wnSnowBtn', hop: '#oJump'}[what];
    const loc = page.locator(sel);
    await loc.waitFor({state: 'visible', timeout: 4000});
    await loc.tap({force: true}); await wait(page, 260);
  } else {
    const k = {act: 'KeyE', alt: 'KeyF', throw: 'KeyQ', hop: 'Space'}[what];
    await page.keyboard.press(k); await wait(page, 260);
  }
}
async function muPress(page, how, optional){
  if (how === 'pad'){ await page.evaluate(() => __pad.set(2, 1)); await wait(page, 260); await page.evaluate(() => __pad.set(2, 0)); await wait(page, 300); }
  else if (how === 'phone'){ const l = page.locator('#muAct'); if (optional && !(await l.isVisible())){ await wait(page, 260); return; } await l.waitFor({state: 'visible', timeout: 4000}); await l.tap({force: true}); await wait(page, 260); }
  else { await page.keyboard.press('KeyE'); await wait(page, 260); }
}

async function winter(how){
  console.log('— Pinebell (' + how + ')');
  const {server, browser, page, errs} = await boot(how);
  await page.evaluate(() => Obby.play('winter'));
  await wait(page, 1800);
  if (how === 'pad') await page.evaluate(() => __pad.connect());
  // Fort: place three blocks, scoop one
  await page.evaluate(() => wnDebug.fort(false));
  await wait(page, 400);
  const f0 = await page.evaluate(() => wnDebug.fortProbe());
  check(f0 && f0.inFort, how + ': standing in Snowdrift Fort Field');
  for (let i = 0; i < 3; i++) await press(page, how, 'act');
  const f1 = await page.evaluate(() => wnDebug.fortProbe());
  check(f1.n === 3, how + ': placed 3 stacked snow blocks (n=' + f1.n + ')');
  await press(page, how, 'alt');
  const f2 = await page.evaluate(() => wnDebug.fortProbe());
  check(f2.n === 2, how + ': scooped one block (n=' + f2.n + ')');
  // Demo fort wall, throw at a flag: wall stops it
  await page.evaluate(() => wnDebug.fort(true));
  await wait(page, 300);
  await page.screenshot({path: path.join(OUT, how + '-fort.png')});
  await page.evaluate(() => { const t = WinterRules.WN_FORT_TARGETS[1]; wnDebug.aim(t.x, t.z); });
  await press(page, how, 'throw');
  await wait(page, 900);
  const f3 = await page.evaluate(() => wnDebug.fortProbe());
  check(f3.walls >= 1, how + ': fort wall blocked the snowball (walls=' + f3.walls + ')');
  // step past the wall and hit the mitten flag
  const c0 = await coinsOf(page);
  await page.evaluate(() => { const t = WinterRules.WN_FORT_TARGETS[1]; wnDebug.at(t.x + 0.3, t.z - 5); wnDebug.aim(t.x, t.z, 0.3, 9); });
  await wait(page, 500);
  await press(page, how, 'throw');
  await wait(page, 300);
  await page.screenshot({path: path.join(OUT, how + '-snowball.png')});
  await wait(page, 700);
  const c1 = await coinsOf(page);
  check(c1 === c0 + 1, how + ': mitten flag hit pays 1 coin (' + c0 + '→' + c1 + ')');
  // Star Show
  await page.evaluate(() => wnDebug.judges());
  await wait(page, 400);
  await page.screenshot({path: path.join(OUT, how + '-judges.png')});
  await press(page, how, 'act');
  let sp = await page.evaluate(() => wnDebug.showProbe());
  check(sp && sp.on, how + ': Star Show started at the judges table');
  await page.evaluate(() => { const p = WinterRules.WN_POND; const J = WinterRules.WN_JUDGES; wnDebug.at(p.x, p.z + 3, 0.8); wnDebug.aim(J.x, J.z, 0.3, 12); });
  await wait(page, 600);
  const s0 = await coinsOf(page);
  const seq = how === 'phone' ? ['act', 'throw', 'act', 'throw', 'act'] : ['act', 'throw', 'hop', 'act', 'throw'];
  for (const k of seq){ await press(page, how, k); await wait(page, 900); }
  sp = await page.evaluate(() => wnDebug.showProbe());
  check(sp && sp.claimed && !sp.on && sp.moves === 5, how + ': five moves judged (moves=' + (sp && sp.moves) + ', sum=' + (sp && sp.sum) + ')');
  await wait(page, 300);
  await page.screenshot({path: path.join(OUT, how + '-show-scores.png')});
  const s1 = await coinsOf(page);
  check(s1 > s0, how + ': judges paid show coins (' + s0 + '→' + s1 + ')');
  // spam after the show: no more show coins
  for (let i = 0; i < 4; i++){ await press(page, how, 'act'); await press(page, how, 'throw'); }
  await wait(page, 600);
  const s2 = await coinsOf(page);
  check(s2 - s1 <= 2, how + ': spamming after the show does not farm coins (' + s1 + '→' + s2 + ')');
  if (how === 'desk'){
    // daily cap: shows 2 and 3 pay, show 4 does not
    let last = await coinsOf(page);
    const gains = [];
    for (let n = 0; n < 3; n++){
      await page.evaluate(() => { wnDebug.judges(); });
      await wait(page, 300);
      await page.keyboard.press('KeyE'); await wait(page, 300);
      await page.evaluate(() => { const p = WinterRules.WN_POND; wnDebug.at(p.x, p.z, 0.8); });
      await wait(page, 300);
      for (let k = 0; k < 5; k++) await page.evaluate(() => wnDebug.move(['spin','spiral','hop'][Math.floor(Math.random()*3)]));
      await wait(page, 400);
      const now = await coinsOf(page); gains.push(now - last); last = now;
    }
    check(gains[0] > 0 && gains[1] > 0 && gains[2] === 0, 'desk: 3 paid shows a day, the 4th is just for fun (gains ' + gains.join(',') + ')');
  }
  check(errs.length === 0, how + ': no console errors in Pinebell' + (errs.length ? ' ' + JSON.stringify(errs.slice(0, 3)) : ''));
  await browser.close(); server.close();
}

async function museum(how){
  console.log('— Brightwhistle Museum (' + how + ')');
  const {server, browser, page, errs} = await boot(how);
  await page.evaluate(() => Obby.play('museum'));
  await wait(page, 1800);
  if (how === 'pad') await page.evaluate(() => __pad.connect());
  await page.screenshot({path: path.join(OUT, how + '-museum-yard.png')});
  await page.evaluate(() => muDebug.go('bus'));
  await wait(page, 300);
  await muPress(page, how);
  let pr = await page.evaluate(() => muDebug.probe());
  check(pr.phase === 'ride', how + ': boarded the Afterbell bus');
  await wait(page, 2500);
  await page.screenshot({path: path.join(OUT, how + '-museum-ride.png')});
  await wait(page, 7500);
  pr = await page.evaluate(() => muDebug.probe());
  check(pr.phase === 'hall', how + ': bus arrived at Brightwhistle (phase=' + pr.phase + ')');
  await page.evaluate(() => muDebug.outside()); await wait(page, 600);
  await page.screenshot({path: path.join(OUT, how + '-museum-outside.png')});
  await page.evaluate(() => muDebug.lookBack()); await wait(page, 500);
  await page.screenshot({path: path.join(OUT, how + '-museum-horizon.png')});
  const shots = {dino:'dino', gem:'gem', meteor:'meteor', space:'space', art:'art'};
  for (const id of Object.keys(shots)){
    await page.evaluate(i => muDebug.go(i), id); await wait(page, 350);
    await muPress(page, how);
    if (how === 'desk'){
      await page.evaluate(i => { const f = MuseumRules.muFind(i); muDebug.face(f.x + (i === 'gem' || i === 'meteor' ? -2.8 : i === 'space' ? 2.4 : 0), f.z + (i === 'art' ? -3.2 : i === 'dino' ? -5.4 : 0), 0.18, i === 'dino' ? 9 : 6.5); }, id);
      await wait(page, 400);
      await page.screenshot({path: path.join(OUT, 'desk-museum-' + id + '.png')});
    }
  }
  pr = await page.evaluate(() => muDebug.probe());
  check(pr.found.length === 5, how + ': saw all five exhibits (' + pr.found.join(',') + ')');
  const t0 = await coinsOf(page);
  const ids = await page.evaluate(() => MuseumRules.MU_TOKENS.map(t => t.id));
  for (const id of ids){ await page.evaluate(i => muDebug.go(i), id); await wait(page, 300); await muPress(page, how); }
  const t1 = await coinsOf(page);
  check(t1 - t0 === 5 * 2 + 10, how + ': five owl tokens pay 2 each + 10 bonus once (' + t0 + '→' + t1 + ')');
  for (const id of ids.slice(0, 2)){ await page.evaluate(i => muDebug.go(i), id); await wait(page, 250); await muPress(page, how, true); await muPress(page, how, true); }
  const t2 = await coinsOf(page);
  check(t2 === t1, how + ': owl tokens cannot be farmed (' + t1 + '→' + t2 + ')');
  await page.evaluate(() => { muDebug.shop(); });
  await wait(page, 500);
  await page.screenshot({path: path.join(OUT, how + '-museum-shop.png')});
  await page.evaluate(() => muDebug.go('hat-dinocap')); await wait(page, 300);
  const g0 = await coinsOf(page);
  await muPress(page, how);
  pr = await page.evaluate(() => muDebug.probe());
  const g1 = await coinsOf(page);
  const wearing = await page.evaluate(() => { try { return JSON.parse(localStorage.getItem('rubloxOwned') || '[]').indexOf('hat-dinocap') >= 0; } catch (e){ return false; } });
  check(pr.gifts.indexOf('hat-dinocap') >= 0 && wearing && g0 - g1 >= 24 && g0 - g1 <= 40, how + ': bought the Thunderhorn cap for 40, owned (badge coins may come back) (' + g0 + '→' + g1 + ')');
  await page.evaluate(() => muDebug.go('home')); await wait(page, 350);
  const h0 = await coinsOf(page);
  await muPress(page, how);
  const h1 = await coinsOf(page);
  pr = await page.evaluate(() => muDebug.probe());
  if (!pr.won){ await page.screenshot({path: path.join(OUT, how + '-debug-home.png')}); console.log('  debug', JSON.stringify(pr), JSON.stringify(await page.evaluate(() => [...document.querySelectorAll('body *')].filter(m => { const r = m.getBoundingClientRect(); const cs = getComputedStyle(m); return r.width > 150 && r.height > 80 && (cs.position === 'fixed' || cs.position === 'absolute') && cs.display !== 'none' && cs.visibility !== 'hidden' && +cs.opacity > 0 && m.id !== 'obby'; }).map(m => m.id + '.' + String(m.className).slice(0, 30))))); }
  check(pr.won && h1 - h0 === 20, how + ': ride home pays 20 once (' + h0 + '→' + h1 + ')');
  // second trip: no trip reward again
  await page.evaluate(() => { Obby.play('museum'); });
  await wait(page, 1500);
  await page.evaluate(() => { muDebug.hall(); muDebug.go('home'); });
  await wait(page, 350);
  const r0 = await coinsOf(page);
  await muPress(page, how);
  const r1 = await coinsOf(page);
  check(r1 === r0, how + ': a repeat trip home pays nothing extra (' + r0 + '→' + r1 + ')');
  await page.evaluate(() => muDebug.inside()); await wait(page, 500);
  await page.screenshot({path: path.join(OUT, how + '-museum-inside.png')});
  check(errs.length === 0, how + ': no console errors in the museum' + (errs.length ? ' ' + JSON.stringify(errs.slice(0, 3)) : ''));
  await browser.close(); server.close();
}

(async () => {
  for (const how of ['desk', 'phone', 'pad']){
    if (ONLY && ONLY !== how) continue;
    await winter(how);
    await museum(how);
  }
  console.log(fails.length ? ('FAILED ' + fails.length) : 'ALL GOOD');
  process.exit(fails.length ? 1 : 0);
})().catch(e => { console.error(e); process.exit(2); });
