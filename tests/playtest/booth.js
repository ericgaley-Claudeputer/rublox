#!/usr/bin/env node
// Manual playtest: Photo Booth. Clicks every pose / background / frame / sticker / action with real pointer
// events (desktop mouse, then phone touch) and checks each click lands and the preview changes.
const path = require('path');
const L = require('./lib');
const OUT = process.argv.find(a => a.startsWith('--out=')) ? process.argv.find(a => a.startsWith('--out=')).slice(6) : '/workspace/rublox-shots/qa';
(async () => {
  const { server, url } = await L.serve(); const b = await L.launch(); let bad = 0;
  for (const mobile of [false, true]){
    const ctx = await b.newContext(mobile ? { viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, deviceScaleFactor: 2 } : { viewport: { width: 1280, height: 800 }, acceptDownloads: true });
    const p = await ctx.newPage(); const errs = []; L.watch(p, errs);
    await p.goto(url); await p.waitForSelector('#grid .card'); await p.fill('#nameIn', 'T'); await (mobile ? p.tap('#nameOk') : p.click('#nameOk'));
    const opener = (await p.locator('#hubBoothBtn').count()) && await p.locator('#hubBoothBtn').isVisible() ? '#hubBoothBtn' : null;
    if (opener){ await p.locator(opener).scrollIntoViewIfNeeded(); mobile ? await p.tap(opener) : await p.click(opener); }
    else { await p.evaluate(() => window.pbOpen && window.pbOpen()); }
    await p.waitForTimeout(800);
    const open = await p.evaluate(() => !document.getElementById('avBooth').hidden);
    if (!open){ console.log((mobile ? 'mobile' : 'desktop') + ': booth did not open'); bad++; continue; }
    const sig = () => p.evaluate(() => { const c = document.getElementById('avBoothCv'); const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data; let h = 0; for (let i = 0; i < d.length; i += 97) h = (h * 31 + d[i]) >>> 0; return h; });
    const ids = await p.evaluate(() => [...document.querySelectorAll('#avBooth .avbooth-row button')].map((x, i) => i));   // rows re-render after a pick, so go by index
    let fails = [];
    for (const id of ids){
      const before = await sig();
      const loc = p.locator('#avBooth .avbooth-row button').nth(id);
      try { await loc.scrollIntoViewIfNeeded(); mobile ? await loc.tap({ timeout: 1500 }) : await loc.click({ timeout: 1500 }); } catch (e){ fails.push(id + ' not clickable: ' + String(e.message).split('\n').find(l => /intercepts/.test(l)) ); continue; }
      await p.waitForTimeout(120);
      const on = await p.locator('#avBooth .avbooth-row button').nth(id).evaluate(x => x.classList.contains('on') || x.getAttribute('aria-pressed') === 'true' || x.classList.contains('sel') || x.classList.contains('active'));
      const after = await sig();
      if (after === before && !on && !/Up to 4 stickers/.test(await p.locator("#avBooth .avbooth-h").textContent())) fails.push(id + ' "' + (await p.locator('#avBooth .avbooth-row button').nth(id).textContent()).trim() + '" changed nothing');
      void 0;
    }
    await p.screenshot({ path: path.join(OUT, (mobile ? 'm' : 'd') + '-booth-1.png') });
    for (const act of ['#avBoothSnap', '#avBoothGal']){
      try { mobile ? await p.tap(act, { timeout: 1500 }) : await p.click(act, { timeout: 1500 }); } catch (e){ fails.push(act + ' not clickable'); }
      await p.waitForTimeout(400);
    }
    const gal = await p.evaluate(() => { const g = document.getElementById('avBoothGallery'); return { shown: !g.hidden, items: g.querySelectorAll('img,canvas').length }; });
    if (!gal.shown || !gal.items) fails.push('gallery empty after a photo ' + JSON.stringify(gal));
    await p.screenshot({ path: path.join(OUT, (mobile ? 'm' : 'd') + '-booth-2-gallery.png') });
    if (!mobile){ try { const [dl] = await Promise.all([p.waitForEvent('download', { timeout: 3000 }), p.click('#avBoothDl')]); if (!dl) fails.push('no download'); } catch (e){ fails.push('download: ' + String(e.message).split('\n')[0]); } }
    try { mobile ? await p.tap('#avBoothX', { timeout: 1500 }) : await p.click('#avBoothX', { timeout: 1500 }); } catch (e){ fails.push('close not clickable'); }
    await p.waitForTimeout(300);
    if (!(await p.evaluate(() => document.getElementById('avBooth').hidden))) fails.push('booth did not close');
    console.log((mobile ? 'mobile' : 'desktop') + ': ' + ids.length + ' option buttons; ' + (fails.length ? fails.join('; ') : 'all good') + (errs.length ? ' ERRORS ' + JSON.stringify(errs) : ''));
    bad += fails.length + errs.length; await ctx.close();
  }
  await b.close(); server.close(); process.exit(bad ? 1 : 0);
})();
