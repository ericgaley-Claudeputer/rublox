#!/usr/bin/env node
// Manual check: host + joiner pages, the host's real room weather payload goes into the joiner's real adopt path.
// node tests/playtest/weather_pair.js [mode]
const root = require('path').resolve(__dirname, '../..'), gm = process.argv[2] || 'pets';
const L = require(root + '/tests/playtest/lib.js');
(async () => { const { server, url } = await L.serve(); const b = await L.launch();
  const mk = async (n) => { const ctx = await b.newContext({ viewport: { width: 900, height: 600 } }); const p = await ctx.newPage(); const errs = []; L.watch(p, errs);
    await p.goto(url); await p.waitForSelector('#grid .card'); await p.fill('#nameIn', n); await p.click('#nameOk');
    await p.locator(`#grid .card[data-game=${gm}] button`).click(); await p.waitForTimeout(3000); return { p, errs }; };
  const H = await mk('Host'), G = await mk('Guest');
  await H.p.evaluate(() => wxForce('night', 'rain')); await G.p.evaluate(() => wxForce('day', 'clear'));
  const st = P => P.evaluate(() => wxState());
  console.log('before host', JSON.stringify(await st(H.p)), '\nbefore guest', JSON.stringify(await st(G.p)));
  for (let i = 0; i < 8; i++){ const w = await H.p.evaluate(() => wxRoomWire()); await G.p.evaluate(w => wxRoomApply(JSON.parse(JSON.stringify(w))), w); await G.p.waitForTimeout(300); }
  const h = await st(H.p), g = await st(G.p); console.log('after host', JSON.stringify(h), '\nafter guest', JSON.stringify(g));
  await H.p.screenshot({ path: `/workspace/rublox-shots/audit56/sync-${gm}-host.png` }); await G.p.screenshot({ path: `/workspace/rublox-shots/audit56/sync-${gm}-guest.png` });
  // host goes away -> joiner returns to its own sky after the freshness window or on leave
  await G.p.evaluate(() => wxRoomClear()); await G.p.waitForTimeout(300); const g2 = await st(G.p);
  const ok = h.phase === g.phase && h.weather === g.weather && Math.abs(h.t - g.t) < 1.5;
  console.log(ok ? 'SYNC OK' : 'SYNC MISMATCH', 'after leave guest', JSON.stringify(g2), 'errs', JSON.stringify(H.errs.concat(G.errs)).slice(0, 300));
  await b.close(); server.close(); process.exit(ok ? 0 : 1); })();
