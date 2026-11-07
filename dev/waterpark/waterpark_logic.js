// Non-GUI logic test for Splash Summit Water Park (tests/p39/waterpark.js): slides, float races, rewards, MP — stubbed engine.
const fs = require('fs'), vm = require('vm'), path = require('path');
let pass = 0, fail = 0; const chk = (n, c, i) => { if (c) pass++; else fail++; console.log((c ? 'PASS ' : 'FAIL ') + n, c ? '' : JSON.stringify(i === undefined ? '' : i)); };
const SRC = fs.readFileSync(process.env.WP_SRC || path.join(__dirname, 'waterpark.js'), 'utf8');
function world(mpCfg, store){
  const V = () => ({x: 0, y: 0, z: 0, set(x, y, z){ this.x = x; this.y = y; this.z = z; }, setScalar(){}, multiplyScalar(){ return this; }});
  const O = () => ({position: V(), rotation: V(), scale: V(), visible: true, material: {opacity: 1, dispose(){}}, geometry: {dispose(){}}, add(){}, remove(){}});
  const els = {}, ctx = {
    console, Math, JSON, Object, Array, Set, Number, String, Date, setTimeout: f => f(),
    THREE: new Proxy({}, {get: () => function(){ return O(); }}), scene: {add(){}, remove(){}},
    load: (k, d) => k in store ? JSON.parse(store[k]) : d, save: (k, v) => { store[k] = JSON.stringify(v); },
    $: id => els[id] || (els[id] = {textContent: '', innerHTML: '', classList: {add(){}, remove(){}}, querySelectorAll: () => []}),
    coins: 0, runCoins: 0, paused: false, choosing: false, worldT: 0, mode: 'waterpark', banners: [], cam: {yaw: 0},
    P: {x: 0, y: .05, z: 10, face: 0}, pad: {on: false, x: 0, y: 0}, touchUI: false, keys: {}, joy: {x: 0, y: 0}, checkpoints: [], DEF: {},
    mp: mpCfg, plat: () => ({mesh: O()}), fmat: () => ({}), label: () => O(), buildPlayer: () => ({g: O()}), confetti(){}, SND: {coin(){}, cp(){}, win(){}, jump(){}, boing(){}}, out: [], store
  };
  ctx.mpSendTo = (c, m) => ctx.out.push(m); ctx.setCoins = n => { ctx.coins = n; }; ctx.banner = t => ctx.banners.push(t);
  vm.createContext(ctx);
  vm.runInContext(SRC + '\n;globalThis.A = {get wp(){ return wp; }, buildWaterPark, waterparkEnter, waterparkUpdate, wpStep, wpRideStart, wpRaceStart, wpAct, wpProg, wpPath, wpAt, waterparkWire, waterparkFromHost, wpGuestMsg, wpMenu, WP_SLIDES, WP_LAPS, WP_RACES_DAY};', ctx);
  return ctx;
}
const tick = (W, sec) => { for (let t = 0; t < sec; t += 1 / 60){ W.worldT += 1 / 60; for (let k = 0; k < 3; k++) W.A.wpStep(1 / 180); W.A.waterparkUpdate(1 / 60); } };
// curves
const W0 = world({on: false}, {}); const sq = W0.A.wpPath([[0, 0, 0], [10, 0, 0], [10, 0, 10], [0, 0, 10]], true, 20);
chk('closed path length ≈ loop', sq.L > 34 && sq.L < 44, sq.L); const a = W0.A.wpAt(sq, sq.L + 1), b = W0.A.wpAt(sq, 1); chk('closed path wraps', Math.abs(a.x - b.x) < 1e-6 && Math.abs(a.z - b.z) < 1e-6);
// solo slides
const st = {rubloxCoins: '0', rubloxBakery: '{"served":4}'}; const S = world({on: false}, st); S.A.buildWaterPark(); S.A.waterparkEnter();
chk('3 slides, each path long & descending', S.A.WP_SLIDES.every(s => s.path.L > 15 && s.path.pts[0][1] > s.path.pts[s.path.pts.length - 1][1] + 10), S.A.WP_SLIDES.map(s => s.path.L));
const pad = S.A.WP_SLIDES[0].pad; S.P.x = pad[0]; S.P.z = pad[1]; tick(S, .1); chk('ride pad prompt + E starts the slide', S.A.wpAct() && S.A.wp.ride && S.A.wp.ride.i === 0);
let minY = 99, maxY = -99, moving = true, lastD = -1; for (let k = 0; k < 600 && S.A.wp.ride; k++){ tick(S, 1 / 60); if (S.A.wp.ride){ minY = Math.min(minY, S.P.y); maxY = Math.max(maxY, S.P.y); if (S.A.wp.ride.d <= lastD) moving = false; lastD = S.A.wp.ride.d; } }
chk('slide moves forward and downhill, ends by itself (<10s)', !S.A.wp.ride && moving && maxY > 10 && minY < 2, [minY, maxY]);
chk('safe exit: placed at the exit beside the pool, not on the slide', Math.hypot(S.P.x - S.A.WP_SLIDES[0].exit[0], S.P.z - S.A.WP_SLIDES[0].exit[1]) < .5 && S.P.y < 1, S.P);
chk('first ride today pays 3', S.coins === 3, S.coins);
S.A.wpRideStart(0); tick(S, 12); chk('second ride same slide today pays nothing', S.coins === 3 && S.A.wpProg().rides.twister === 2, [S.coins, S.A.wpProg()]);
S.A.wpRideStart(1); tick(S, 12); S.A.wpRideStart(2); tick(S, 12); chk('each slide pays once per day (max 9)', S.coins === 9, S.coins);
chk('cannot start a ride while riding', (S.A.wpRideStart(1), !S.A.wpRideStart(2)) && (tick(S, 12), true));
// solo race
const c0 = S.coins; chk('race starts (countdown) with 3 NPC racers', S.A.wpRaceStart() && S.A.wp.race.ph === 'count' && S.A.wp.race.npcs.length === 3);
chk('no slide during race', !S.A.wpRideStart(0));
tick(S, 3.7); chk('countdown → GO', S.A.wp.race.ph === 'go', S.A.wp.race.ph);
S.keys.KeyW = true; let paddles = 0; const L = S.A.wp.river.L; let maxOff = 0, cpSeen = 0;
for (let k = 0; k < 60 * 120 && S.A.wp.race.ph === 'go'; k++){ S.keys.Space = (k % 50) < 3; S.keys.KeyD = (k % 400) < 120; S.keys.KeyA = (k % 400) >= 200 && (k % 400) < 320; tick(S, 1 / 60); if (S.A.wp.race.me) maxOff = Math.max(maxOff, Math.abs(S.A.wp.race.me.off)); }
S.keys = {}; const R = S.A.wp.race;
chk('race finishes after 3 laps with a time', R.ph === 'done' && R.me.fin > 10 && R.me.d >= 3 * L, [R.ph, R.me && R.me.fin]);
chk('steering stays inside the river', maxOff <= 2.4 + 1e-9, maxOff);
chk('results include everyone, ordered by time', R.res.length === 4 && R.res.every((r, i) => i === 0 || r[1] >= R.res[i - 1][1]), R.res);
const place = R.res.findIndex(r => r[0] === 'H'), pay1 = S.coins - c0; chk('race pays place prize + new-best bonus', pay1 === [15, 10, 6, 3][place] + 10, [place, pay1]);
chk('best time saved', Math.abs(S.A.wpProg().best - R.me.fin) < .01 && S.A.wpProg().raced === 1);
tick(S, 8); chk('after results you are put back on the dock', S.A.wp.race.ph === 'idle' && Math.hypot(S.P.x - 3, S.P.z - 16) < .5, [S.A.wp.race.ph, S.P]);
// daily race cap: run fast races by teleporting progress
for (let r = 0; r < 4; r++){ S.A.wpRaceStart(); tick(S, 3.7); S.A.wp.race.me.d = 3 * L - 1; tick(S, 1); tick(S, 8); }
const p = S.A.wpProg(); chk('only 3 paid races per day, then no coins', p.races === 3 && S.banners.some(b => /maxed for today/.test(b)), p);
chk('other saves untouched', st.rubloxBakery === '{"served":4}');
// new day resets paid slides & races but keeps best + ride counts
const pd = JSON.parse(st.rubloxWaterPark); pd.day = 'Mon Jan 01 2001'; st.rubloxWaterPark = JSON.stringify(pd);
const p2 = S.A.wpProg(); chk('new day: daily limits reset, bests kept', p2.paid.length === 0 && p2.races === 0 && p2.best > 0 && p2.rides.twister >= 2, p2);
// garbage save
st.rubloxWaterPark = JSON.stringify({day: new Date().toDateString(), paid: ['twister', 'evil', 5], races: 99, best: -5, rides: {twister: 'x'}});
const p3 = S.A.wpProg(); chk('garbage save sanitised', JSON.stringify(p3.paid) === '["twister"]' && p3.races === 3 && p3.best === 0 && p3.rides.twister === 0, p3);
// ---------- multiplayer ----------
const hs = {rubloxCoins: '0'}, gs = {rubloxCoins: '0'};
const H = world({on: true, host: true, me: 'H'}, hs), G = world({on: true, host: false, me: 'g1', hconn: {}}, gs);
H.A.buildWaterPark(); G.A.buildWaterPark(); const sync = () => G.A.waterparkFromHost(JSON.parse(JSON.stringify(H.A.waterparkWire())));
sync(); chk('MP guest cannot start races', !G.A.wpRaceStart());
chk('MP host race has NO NPC racers', H.A.wpRaceStart() && H.A.wp.race.npcs.length === 0);
sync(); chk('MP guest auto-joins the host race', G.A.wp.race.ph === 'count' && !!G.A.wp.race.me);
const relay = () => G.out.splice(0).forEach(m => H.A.wpGuestMsg({uid: 'g1'}, m));
tick(H, 3.7); tick(G, 3.7); sync(); relay();
chk('MP both racing', H.A.wp.race.ph === 'go' && G.A.wp.race.ph === 'go');
G.keys.KeyW = true; for (let k = 0; k < 60 * 120 && H.A.wp.race.ph === 'go'; k++){ tick(G, 1 / 60); tick(H, 1 / 60); if (k % 10 === 0){ relay(); sync(); } } relay(); tick(H, .1); sync();
chk('MP host ranks guest (faster, holding W) first', H.A.wp.race.res && H.A.wp.race.res[0][0] === 'g1' && H.A.wp.race.res.length === 2, H.A.wp.race.res);
chk('MP guest gets 1st prize + best bonus', G.coins === 25, G.coins);
chk('MP host gets 2nd prize + best bonus', H.coins === 20, H.coins);
sync(); sync(); chk('MP repeated snapshots never pay twice', G.coins === 25);
G.A.wpGuestMsg; H.A.wpGuestMsg({uid: 'g9'}, {t: 'wpprog', n: 999, d: 1e9, fin: 1}); chk('MP host ignores stale/forged race messages', !H.A.wp.race.prog.g9);
const late = world({on: true, host: false, me: 'g2', hconn: {}}, {}); late.A.buildWaterPark(); late.A.waterparkFromHost(JSON.parse(JSON.stringify(H.A.waterparkWire())));
chk('MP late joiner mid-results is not paid', late.coins === 0 && !late.A.wp.race.me);
G.A.waterparkFromHost({ph: 'done', n: G.A.wp.race.n, res: [['g1', -5], ['<x>', 1e9]]}); chk('MP garbage results clamped / no extra pay', G.coins === 25);
console.log('RESULT', pass, '/', pass + fail); process.exit(fail ? 1 : 0);
