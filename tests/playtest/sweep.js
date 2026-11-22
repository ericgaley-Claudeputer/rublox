#!/usr/bin/env node
// Manual playtest: boots every hub game in real Chrome + SwiftShader WebGL, plays a little with
// keyboard / mouse / touch / a virtual Xbox pad, screenshots, checks HUD buttons are clickable,
// exits to the hub, and fails on console errors or page exceptions.
//   node tests/playtest/sweep.js [--modes=a,b] [--mobile] [--pad] [--out=/workspace/rublox-shots/qa] [--secs=3]
const fs = require('fs');
const path = require('path');
const L = require('./lib');
const arg = (k, d) => { const a = process.argv.find(x => x.startsWith('--' + k)); if (!a) return d; const i = a.indexOf('='); return i < 0 ? true : a.slice(i + 1); };
const OUT = arg('out', '/workspace/rublox-shots/qa');
const MOBILE = !!arg('mobile', false), PAD = !!arg('pad', false), SECS = +arg('secs', 3);
fs.mkdirSync(OUT, { recursive: true });

async function hubReady(page){
  await page.waitForSelector('#grid .card', { timeout: 20000 });
  const nm = await page.$('#nameIn');
  if (nm && await nm.isVisible()){ await nm.fill('Tester'); await page.click('#nameOk'); }
  await page.evaluate(() => document.querySelectorAll('.modal.show, .show[role=dialog]').forEach(m => { const x = m.querySelector('button'); }));
}
// visible buttons whose center is covered by something else
async function coveredButtons(page){
  return page.evaluate(() => {
    const out = [];
    const root = document.getElementById('obby');
    document.querySelectorAll('#obby button, body > .modal button, body > [id$=Modal] button').forEach(b => {
      const r = b.getBoundingClientRect(); if (r.width < 4 || r.height < 4) return;
      const s = getComputedStyle(b); if (s.visibility === 'hidden' || s.display === 'none' || +s.opacity === 0) return;
      let p = b, hidden = false; while (p && p !== document.body){ const ps = getComputedStyle(p); if (ps.display === 'none' || ps.visibility === 'hidden' || +ps.opacity === 0) { hidden = true; break; } p = p.parentElement; }
      if (hidden) return;
      const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
      if (cx < 0 || cy < 0 || cx > innerWidth || cy > innerHeight) return;
      const t = document.elementFromPoint(cx, cy);
      if (!t || t === b || b.contains(t)) return;
      if (s.pointerEvents === 'none') return;
      out.push({ btn: (b.id ? '#' + b.id : '') + ' "' + (b.textContent || '').trim().slice(0, 30) + '"', by: (t.id ? '#' + t.id : t.tagName) + '.' + String(t.className || '').slice(0, 40) });
    });
    return out;
  });
}
// HUD pieces that overlap each other (ignores full-screen panels and the 3D canvas)
async function hudOverlaps(page){
  return page.evaluate(() => {
    const els = [...document.querySelectorAll('#obby *')].filter(e => {
      if (e.closest('.opanel, .modal, canvas, #oEmos, #oPausePanel')) return false;
      const s = getComputedStyle(e); if (!(s.position === 'absolute' || s.position === 'fixed')) return false;
      if (s.display === 'none' || s.visibility === 'hidden' || +s.opacity < .05) return false;
      let q = e.parentElement; while (q && q !== document.body){ const qs = getComputedStyle(q); if (qs.display === 'none' || qs.visibility === 'hidden' || +qs.opacity < .05) return false; q = q.parentElement; }
      const r = e.getBoundingClientRect(); if (r.width < 8 || r.height < 8 || r.width > innerWidth * .9 || r.height > innerHeight * .6) return false;
      if (r.right < 0 || r.bottom < 0 || r.left > innerWidth || r.top > innerHeight) return false;
      return (e.textContent || '').trim().length > 0;
    });
    const top = els.filter(e => !els.some(o => o !== e && o.contains(e)));
    const out = [];
    for (let i = 0; i < top.length; i++) for (let j = i + 1; j < top.length; j++){
      const a = top[i].getBoundingClientRect(), b = top[j].getBoundingClientRect();
      const w = Math.min(a.right, b.right) - Math.max(a.left, b.left), h = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
      if (w <= 2 || h <= 2) continue;
      const k = (w * h) / Math.min(a.width * a.height, b.width * b.height);
      if (k > .25) out.push([top[i], top[j]].map(e => (e.id ? '#' + e.id : e.tagName + '.' + String(e.className).split(' ')[0]) + ' "' + e.textContent.trim().slice(0, 24) + '"').join(' X ') + ' ' + Math.round(k * 100) + '%');
    }
    return out;
  });
}
async function state(page){
  return page.evaluate(() => { const O = window.Obby; if (!O) return null; const P = O.P; return { running: O.running, mode: O.mode, x: +P.x.toFixed(2), y: +P.y.toFixed(2), z: +P.z.toFixed(2), ground: !!P.onGround,
    obbyShown: document.getElementById('obby').classList.contains('show') }; });
}
async function hold(page, key, ms){ await page.keyboard.down(key); await page.waitForTimeout(ms); await page.keyboard.up(key); }

async function playOne(browser, url, id){
  const ctxOpts = MOBILE ? { viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, deviceScaleFactor: 2 } : { viewport: { width: 1280, height: 800 } };
  const ctx = await browser.newContext(ctxOpts);
  await ctx.addInitScript({ path: path.join(__dirname, 'fakepad.js') });
  const page = await ctx.newPage(); const errs = []; L.watch(page, errs);
  const tag = (MOBILE ? 'm-' : PAD ? 'p-' : 'd-') + id;
  const rep = { id, tag, errors: errs, notes: [] };
  try {
    await page.goto(url); await hubReady(page);
    const card = page.locator(`#grid .card[data-game="${id}"]`);
    if (!await card.count()){ rep.notes.push('no hub card'); return rep; }
    await card.scrollIntoViewIfNeeded();
    if (MOBILE) await card.locator('button').tap(); else await card.locator('button').click();
    await page.waitForTimeout(600);
    // Obby Rush opens its level picker first
    const lv = page.locator('#lvlModal.show .lvbtn[data-lvl="1"]');
    if (await lv.count()){ if (MOBILE) await lv.tap(); else await lv.click(); }
    await page.waitForTimeout(1900);
    const s0 = await state(page); rep.start = s0;
    if (!s0 || !s0.obbyShown) rep.notes.push('game did not open');
    await page.screenshot({ path: path.join(OUT, tag + '-1-start.png') });
    rep.coveredStart = await coveredButtons(page);
    // dismiss intro: click canvas center (desktop) / tap
    const vw = page.viewportSize();
    if (PAD){
      await page.evaluate(() => window.__pad.connect());
      await page.evaluate(() => window.__pad.set(0, 1)); await page.waitForTimeout(120); await page.evaluate(() => window.__pad.set(0, 0));
      await page.evaluate(() => window.__pad.axis(1, -1)); await page.waitForTimeout(SECS * 500); await page.evaluate(() => { window.__pad.axis(1, 0); window.__pad.axis(0, 1); });
      await page.waitForTimeout(SECS * 300); await page.evaluate(() => { window.__pad.axis(0, 0); window.__pad.axis(2, .8); });
      await page.waitForTimeout(500); await page.evaluate(() => { window.__pad.clear(); window.__pad.set(2, 1); }); await page.waitForTimeout(120); await page.evaluate(() => window.__pad.set(2, 0));
    } else if (MOBILE){
      // drag on the left half like a joystick
      const cdp = await ctx.newCDPSession(page);
      const joy = await page.evaluate(() => { const j = document.getElementById('oJoy'); if (j){ const r = j.getBoundingClientRect(); if (r.width > 10 && getComputedStyle(j).display!=='none') return [r.left + r.width / 2, r.top + r.height / 2]; } const z = document.getElementById('oJoyZone'); if (z){ const r = z.getBoundingClientRect(); if (r.width > 10) return [r.left + Math.min(80, r.width/2), r.bottom - 80]; } return null; });
      const x0 = joy ? joy[0] : 80, y0 = joy ? joy[1] : vw.height - 180;
      // twice: on a portrait phone the first touch can just dismiss the "turn your phone sideways" hint
      for (let rep = 0; rep < 2; rep++){
        await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: x0, y: y0 }] });
        for (let i = 1; i <= 10; i++){ await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: x0, y: y0 - i * 6 }] }); await page.waitForTimeout(40); }
        await page.waitForTimeout(SECS * 400);
        await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); await page.waitForTimeout(150);
      }
    } else {
      await page.mouse.click(vw.width / 2, vw.height / 2);
      await page.keyboard.press('Space');
      await hold(page, 'KeyW', SECS * 500);
      await hold(page, 'KeyD', SECS * 200);
      await page.keyboard.press('KeyE'); await page.waitForTimeout(300);
      await hold(page, 'ArrowUp', SECS * 300);
      await page.keyboard.press('Space');
    }
    await page.waitForTimeout(1200);
    const s1 = await state(page); rep.after = s1;
    if (s0 && s1){ rep.moved = +Math.hypot(s1.x - s0.x, s1.z - s0.z).toFixed(2); if (s1.y < -15) rep.notes.push('fell below world y=' + s1.y); }
    await page.screenshot({ path: path.join(OUT, tag + '-2-play.png') });
    rep.coveredPlay = await coveredButtons(page);
    rep.overlaps = await hudOverlaps(page);
    // exit back to the hub via the visible exit button or pause menu
    // a real player presses Esc to get the mouse back from pointer lock first
    await page.evaluate(() => { try { if (document.pointerLockElement) document.exitPointerLock(); } catch (e){} });
    await page.waitForTimeout(200);
    const exitSel = ['#oExit', '#oExit2'];
    let exited = false;
    for (const sel of exitSel){ const e = page.locator(sel); if (await e.count() && await e.first().isVisible()){ try { if (MOBILE) await e.first().tap({ timeout: 2000 }); else await e.first().click({ timeout: 2000 }); exited = true; break; } catch (er){ rep.notes.push('exit ' + sel + ' not clickable: ' + String(er.message).split('\n')[0]); } } }
    if (!exited){ await page.keyboard.press('Escape'); await page.waitForTimeout(400); const h = page.locator('#oPausePanel button:has-text("Home"), #oPausePanel #oExit2'); if (await h.count()){ try { await h.first().click({ timeout: 2000 }); exited = true; } catch (e){} } }
    await page.waitForTimeout(1200);
    const s2 = await state(page); rep.exit = s2;
    if (!s2 || s2.obbyShown || s2.running) rep.notes.push('did not return to hub');
    const hubOk = await page.locator('#grid').isVisible(); if (!hubOk) rep.notes.push('hub grid hidden after exit');
  } catch (e){ rep.notes.push('harness: ' + String(e.message).split('\n')[0]); try { await page.screenshot({ path: path.join(OUT, tag + '-x-fail.png') }); } catch (er){} }
  finally { await ctx.close(); }
  return rep;
}

(async () => {
  const { server, url } = await L.serve(); const browser = await L.launch();
  let modes = arg('modes', '');
  const page = await browser.newPage(); await page.goto(url); await page.waitForSelector('#grid .card');
  const all = await page.evaluate(() => [...document.querySelectorAll('#grid .card')].map(c => c.dataset.game)); await page.close();
  modes = modes ? String(modes).split(',') : all;
  const results = [];
  for (const id of modes){ const r = await playOne(browser, url, id); results.push(r);
    const bad = r.errors.length || r.notes.length; console.log((bad ? '✗ ' : '✓ ') + r.tag + ' moved=' + r.moved + ' errs=' + r.errors.length + (r.notes.length ? ' notes=' + r.notes.join('; ') : '') + (r.coveredPlay && r.coveredPlay.length ? ' covered=' + r.coveredPlay.length : '') + (r.overlaps && r.overlaps.length ? ' overlaps=' + r.overlaps.length : ''));
    r.errors.slice(0, 3).forEach(e => console.log('    ' + e.kind + ': ' + e.text.split('\n').slice(0, 2).join(' | ')));
  }
  fs.writeFileSync(path.join(OUT, 'report-' + (MOBILE ? 'mobile' : PAD ? 'pad' : 'desktop') + '.json'), JSON.stringify(results, null, 1));
  await browser.close(); server.close();
  const fail = results.filter(r => r.errors.length || r.notes.length);
  console.log(fail.length ? fail.length + ' mode(s) with problems' : 'all modes clean');
  process.exit(fail.length ? 1 : 0);
})();
