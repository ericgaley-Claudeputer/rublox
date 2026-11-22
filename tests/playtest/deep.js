#!/usr/bin/env node
// Manual playtest: scripted deeper runs through the newest games (rooms, props, modals) using the in-game debug hooks
// only to jump between rooms; everything else is real keyboard / mouse input. Screenshots go to --out.
//   node tests/playtest/deep.js [--only=mansion,vet] [--out=/workspace/rublox-shots/qa]
const path = require('path');
const L = require('./lib');
const arg = (k, d) => { const a = process.argv.find(x => x.startsWith('--' + k + '=')); return a ? a.slice(k.length + 3) : d; };
const OUT = arg('out', '/workspace/rublox-shots/qa'), ONLY = arg('only', '');
const walk4 = ['KeyW', 'KeyD', 'KeyS', 'KeyA'].map(k => ({ key: k, ms: 900 }));
const S = {
  mansion: [{ js: 'mnDebug.solve()' }].concat(...['foyer', 'parlor', 'kitchen', 'library', 'attic', 'conservatory', 'cellar', 'chime', 'secret'].map(r => [
    { js: `try { mnDebug.room('${r}') } catch (e) {}` }, { wait: 500 }, { shot: 'mansion-' + r }, { key: 'KeyE' }, ...walk4, { probe: 'mnDebug.probe()' }])),
  vet: [].concat(...['reception', 'exam', 'xray', 'treatment', 'surgery', 'recovery', 'bath'].map(r => [
    { js: `vtDebug.room('${r}')` }, { wait: 500 }, { shot: 'vet-' + r }, { key: 'KeyE' }, ...walk4, { probe: 'vtDebug.probe()' }]),
    [{ js: 'vtDebug.start && vtDebug.start()' }, { wait: 800 }, { shot: 'vet-ambulance' }, { key: 'KeyW', ms: 2500 }, { key: 'KeyA', ms: 800 }, { shot: 'vet-ambulance-drive' }, { probe: 'vtDebug.probe()' }]),
  shelter: [{ key: 'KeyE' }, ...walk4, { js: 'shDebug.spawn()' }, { js: 'shDebug.salon()' }, { wait: 600 }, { shot: 'shelter-salon' }, { key: 'KeyE' }, { wait: 400 }, { shot: 'shelter-salon-e' },
    { js: 'shDebug.contest()' }, { wait: 800 }, { shot: 'shelter-contest' }, { key: 'KeyE' }, ...walk4, { probe: 'shDebug.probe()' }],
  winter: [{ js: 'wnDebug.village()' }, { wait: 600 }, { shot: 'winter-village' }, { js: 'wnDebug.lights()' }, { wait: 600 }, { shot: 'winter-lights' },
    { js: 'wnDebug.wrap()' }, { wait: 800 }, { shot: 'winter-wrap' }, { clickAll: '#wnWrap button' }, { shot: 'winter-wrap-after' }, { esc: true },
    { js: 'wnDebug.sled()' }, { wait: 600 }, { key: 'KeyA', ms: 600 }, { key: 'Space' }, { shot: 'winter-sled' }, { js: 'wnDebug.pond()' }, ...walk4, { shot: 'winter-pond' }, { probe: 'wnDebug.probe()' }],
  mermaid: [{ js: 'mmDebug.plaza()' }, { wait: 500 }, { shot: 'mermaid-plaza' }, { key: 'KeyE' }, { key: 'Space', ms: 900 }, { key: 'ShiftLeft', ms: 900 }, ...walk4,
    { js: 'mmDebug.garden()' }, { wait: 500 }, { shot: 'mermaid-garden' }, { key: 'KeyE' }, { js: 'mmDebug.home()' }, { wait: 500 }, { shot: 'mermaid-home' }, { key: 'KeyE' }, { wait: 500 }, { shot: 'mermaid-home-e' }],
  elevator: [{ js: 'elevDebug.cab()' }, { wait: 800 }, { shot: 'elev-cab' }, { key: 'KeyE' }, { wait: 1500 }, { js: 'elevDebug.ride && elevDebug.ride()' }, { wait: 2500 }, { shot: 'elev-ride' },
    { key: 'KeyI' }, { wait: 500 }, { shot: 'elev-index' }, { esc: true }, { js: 'elevDebug.hearts()' }, { wait: 600 }, { shot: 'elev-hearts' }, { key: 'KeyE' }, { wait: 500 }, { shot: 'elev-hearts-e' }],
  camp: [{ js: 't302Debug.dayCamp()' }, { wait: 600 }, { shot: 'camp-day' }, { key: 'KeyE' }, ...walk4, { js: 't302Debug.watchersNight()' }, { wait: 600 }, { shot: 'camp-watchers' },
    { js: 't302Debug.goreMild()' }, { wait: 500 }, { shot: 'camp-gore-mild' }, { js: 't302Debug.goreSpooky()' }, { wait: 500 }, { shot: 'camp-gore-spooky' }],
  garden: [{ js: 't302Debug.stockGarden()' }, { js: 'Obby.P.x=0;Obby.P.z=1' }, { key: 'KeyE' }, { wait: 400 }, { shot: 'garden-plot-e' }, { js: 't302Debug.readyGarden()' }, { key: 'KeyE' }, { wait: 400 }, { shot: 'garden-harvest' }],
  rides: [{ shot: 'rides-tut' }, { click: '#t302TutNext' }, { click: '#t302TutNext' }, { shot: 'rides-tut2' }, { click: '#t302TutSkip' }, { js: 't302Debug.fillRides()' }, { wait: 600 }, { shot: 'rides-filled' }, { click: 'text=Test ride' }, { wait: 2500 }, { shot: 'rides-test' }],
  hive: [{ js: 't302Debug.fillHive()' }, { key: 'KeyE' }, ...walk4, { shot: 'hive-walk' }],
  meadow: [{ js: 't302Debug.readyMeadow()' }, { key: 'KeyE', ms: 1200 }, { wait: 800 }, { shot: 'meadow-toss' }],
  fashion: [{ shot: 'fashion-pick' }, { clickFirst: '#fsPick button' }, { wait: 1500 }, { shot: 'fashion-after-pick' }, ...walk4, { key: 'KeyE' }, { wait: 600 }, { shot: 'fashion-e' }],
  dreamhouse: [{ wait: 3000 }, { shot: 'dh-intro' }, { key: 'Escape' }, { key: 'Enter' }, { wait: 1500 }, ...walk4, { key: 'KeyE' }, { wait: 500 }, { shot: 'dh-play' }],
};
(async () => {
  const { server, url } = await L.serve(); const b = await L.launch(); let bad = 0;
  for (const mode of Object.keys(S)){
    if (ONLY && !ONLY.split(',').includes(mode)) continue;
    const ctx = await b.newContext({ viewport: { width: 1280, height: 800 } }); const p = await ctx.newPage(); const errs = []; L.watch(p, errs);
    const notes = [];
    try {
      await p.goto(url); await p.waitForSelector('#grid .card'); await p.fill('#nameIn', 'T'); await p.click('#nameOk');
      await p.locator(`#grid .card[data-game=${mode}] button`).click(); await p.waitForTimeout(2500);
      for (const st of S[mode]){
        if (st.js) { try { await p.evaluate(st.js); } catch (e){ notes.push('js ' + st.js + ': ' + String(e.message).split('\n')[0]); } }
        if (st.wait) await p.waitForTimeout(st.wait);
        if (st.key){ await p.keyboard.down(st.key); await p.waitForTimeout(st.ms || 80); await p.keyboard.up(st.key); await p.waitForTimeout(150); }
        if (st.esc){ await p.keyboard.press('Escape'); await p.waitForTimeout(300); }
        if (st.shot) await p.screenshot({ path: path.join(OUT, 'deep-' + st.shot + '.png') });
        if (st.click){ try { await p.locator(st.click).first().click({ timeout: 2000 }); await p.waitForTimeout(400); } catch (e){ notes.push('click ' + st.click + ' failed: ' + (String(e.message).split('\n').find(l => /intercepts|not visible|Timeout/.test(l)) || '')); } }
        if (st.clickFirst){ try { await p.locator(st.clickFirst).first().click({ timeout: 2000 }); } catch (e){ notes.push('clickFirst ' + st.clickFirst + ' failed'); } }
        if (st.clickAll){ const n = await p.locator(st.clickAll).count(); for (let i = 0; i < n; i++){ const l = p.locator(st.clickAll).nth(i); if (!(await l.isVisible())) continue; const t = (await l.textContent()).trim(); if (/close|done|✕|×|cancel/i.test(t)) continue; try { await l.click({ timeout: 1500 }); await p.waitForTimeout(150); } catch (e){ notes.push('button "' + t + '" not clickable: ' + (String(e.message).split('\n').find(x => /intercepts/.test(x)) || 'timeout')); } } }
        if (st.probe){ try { notes.push('probe ' + JSON.stringify(await p.evaluate(st.probe))); } catch (e){} }
        const y = await p.evaluate(() => window.Obby && Obby.P.y);
        if (y < -5) notes.push('fell y=' + y.toFixed(1) + ' after ' + JSON.stringify(st));
      }
    } catch (e){ notes.push('harness ' + String(e.message).split('\n')[0]); }
    console.log((errs.length ? '✗ ' : '✓ ') + mode + (errs.length ? ' ERR ' + errs.map(e => e.text.split('\n')[0]).join(' | ') : '') + '\n    ' + notes.join('\n    '));
    bad += errs.length; await ctx.close();
  }
  await b.close(); server.close(); process.exit(bad ? 1 : 0);
})();
