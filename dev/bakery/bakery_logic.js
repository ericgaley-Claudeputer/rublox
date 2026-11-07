// Non-GUI logic test for Sweet Team Bakery (tests/p38/bakery.js): solo + host/guest multiplayer, with stubbed engine.
const fs = require('fs'), vm = require('vm');
let pass = 0, fail = 0; const chk = (n, c, i) => { if (c) pass++; else fail++; console.log((c ? 'PASS ' : 'FAIL ') + n, c ? '' : JSON.stringify(i === undefined ? '' : i)); };
const SRC = fs.readFileSync(__dirname + '/bakery.js', 'utf8');
function world(name, mpCfg){
  const V = () => ({x: 0, y: 0, z: 0, set(x, y, z){ this.x = x; this.y = y; this.z = z; }, setScalar(s){ this.x = this.y = this.z = s; }, multiplyScalar(){ return this; }, copy(){}});
  const O = () => ({position: V(), rotation: V(), scale: V(), visible: true, children: [], material: {}, add(c){ this.children.push(c); }, remove(){}});
  const store = {}, els = {}, out = [];
  const ctx = {
    console, Math, JSON, Object, Array, Set, Number, String, Date,
    THREE: new Proxy({}, {get: (t, k) => function(){ return O(); }}), scene: {add(){}, remove(){}},
    load: (k, d) => k in store ? JSON.parse(store[k]) : d, save: (k, v) => { store[k] = JSON.stringify(v); },
    $: id => els[id] || (els[id] = {textContent: '', innerHTML: '', style: {}, disabled: false, classList: {add(){}, remove(){}}, querySelectorAll: () => []}),
    coins: 0, runCoins: 0, running: true, paused: false, choosing: false, worldT: 0, mode: 'bakery', banners: [],
    P: {x: 0, y: .05, z: -1, face: 0}, pad: {on: false}, touchUI: false, keys: {}, joy: {x: 0, y: 0}, checkpoints: [], DEF: {},
    mp: mpCfg, mpGuest: () => mpCfg.on && !mpCfg.host, mpSendTo: (c, m) => out.push(m),
    plat: () => ({mesh: O(), active: true}), fmat: () => ({}), label: () => O(), clamp: (v, a, b) => Math.max(a, Math.min(b, v)), buildPlayer: () => ({g: O()}),
    confetti(){}, SND: {coin(){}, cp(){}, win(){}}, store, out
  };
  ctx.setCoins = n => { ctx.coins = n; }; ctx.banner = t => ctx.banners.push(t);
  vm.createContext(ctx);
  vm.runInContext(SRC + '\n;globalThis.A = {get bk(){ return bk; }, buildBakery, bakeryEnter, bakeryUpdate, bkApply, bkDo, bkGuestMsg, bakeryWire, bakeryFromHost, bkMatch, bkPrice, bkProg, bkClean, bkNewOrder, bkPanel, BK_TP};', ctx);
  return ctx;
}
const step = (W, sec) => { for (let t = 0; t < sec; t += .1) W.A.bakeryUpdate(.1); };
// ---------- solo ----------
const S = world('solo', {on: false, host: false, me: 'H'}); S.store.rubloxCoins = '0'; S.store.rubloxPets = '{"keep":1}';
S.A.buildBakery(); S.A.bakeryEnter(); step(S, 6);
chk('solo: customers arrive with orders (max 3)', S.A.bk.orders.length >= 2 && S.A.bk.orders.length <= 3 && S.A.bk.orders.every(o => o.who >= 0), S.A.bk.orders);
const o = S.A.bk.orders[0];
chk('cannot frost before baking', !S.A.bkApply('H', {a: 'set', st: 0, k: 'fr', v: o.fr}));
chk('cannot bake without shape+flavour', !S.A.bkApply('H', {a: 'bake', st: 0}));
['sh', 'fl', 'ti'].forEach(k => S.A.bkApply('H', {a: 'set', st: 0, k, v: o[k]}));
chk('bad values rejected', !S.A.bkApply('H', {a: 'set', st: 0, k: 'sh', v: 'triangle'}) && !S.A.bkApply('H', {a: 'set', st: 9, k: 'sh', v: 'round'}));
chk('bake → oven', S.A.bkApply('H', {a: 'bake', st: 0}) && S.A.bk.st[0].ph === 'oven');
chk('locked topping (Gold Stars at Lv1) rejected', (step(S, 5.2), !S.A.bkApply('H', {a: 'set', st: 0, k: 'tp', v: 'stars'})));
chk('oven finishes → baked', S.A.bk.st[0].ph === 'baked', S.A.bk.st[0]);
S.A.bkApply('H', {a: 'set', st: 0, k: 'fr', v: o.fr}); S.A.bkApply('H', {a: 'set', st: 0, k: 'tp', v: o.tp});
const n0 = S.A.bk.orders.length, c0 = S.coins;
chk('serve a perfect match', S.A.bkApply('H', {a: 'serve', st: 0}) && !S.A.bk.orders.some(x => x.id === o.id), S.A.bk.orders);
chk('perfect pays 4+15+3 = 22', S.coins - c0 === 22, S.coins - c0);
chk('station reset after serving', S.A.bk.st[0].ph === 'empty' && !S.A.bk.st[0].sh);
chk('progress saved', S.A.bkProg().served === 1 && S.A.bkProg().perfect === 1, S.A.bkProg());
// level up after 5 cakes, unlocks berries
for (let k = 0; k < 4; k++){ S.A.bkApply('H', {a: 'set', st: 1, k: 'sh', v: 'round'}); S.A.bkApply('H', {a: 'set', st: 1, k: 'fl', v: 'choc'}); S.A.bkApply('H', {a: 'bake', st: 1}); step(S, 5.2);
  S.A.bkApply('H', {a: 'set', st: 1, k: 'fr', v: 'pink'}); S.A.bkApply('H', {a: 'set', st: 1, k: 'tp', v: 'cherry'}); S.A.bkApply('H', {a: 'serve', st: 1}); }
chk('Bakery Lv 2 after 5 cakes + banner', S.A.bk.lv === 2 && S.banners.some(b => /Bakery Level 2/.test(b)), [S.A.bk.lv, S.banners.slice(-2)]);
chk('Lv 2 unlocks Berries topping', (S.A.bkApply('H', {a: 'set', st: 2, k: 'sh', v: 'heart'}), S.A.bkApply('H', {a: 'set', st: 2, k: 'fl', v: 'lemon'}), S.A.bkApply('H', {a: 'bake', st: 2}), step(S, 5.2), S.A.bkApply('H', {a: 'set', st: 2, k: 'tp', v: 'berries'})));
chk('serving with no matching order still earns ≥3', (() => { S.A.bk.orders = []; S.A.bkApply('H', {a: 'set', st: 2, k: 'fr', v: 'mint'}); const c = S.coins; S.A.bkApply('H', {a: 'serve', st: 2}); return S.coins - c === 3; })());
chk('orders time out → customer leaves', (() => { S.A.bkNewOrder(); S.A.bk.orders.forEach(x => x.t = .05); step(S, .3); return S.banners.some(b => /tired of waiting/.test(b)); })());
chk('other saves untouched', S.store.rubloxPets === '{"keep":1}');
// ---------- multiplayer: host + guest ----------
const H = world('host', {on: true, host: true, me: 'H'}), G = world('guest', {on: true, host: false, me: 'g1', hconn: {}});
H.A.buildBakery(); H.A.bakeryEnter(); G.A.buildBakery(); G.A.bakeryEnter(); step(H, 6);
chk('MP: no NPC customers (order tickets only)', H.A.bk.orders.length > 0 && H.A.bk.orders.every(x => x.who === -1));
const sync = () => G.A.bakeryFromHost(JSON.parse(JSON.stringify(H.A.bakeryWire())));
const relay = () => { G.out.splice(0).forEach(m => H.A.bkGuestMsg({uid: 'g1'}, m)); };
sync(); chk('MP: guest sees the same orders', JSON.stringify(G.A.bk.orders.map(x => x.id)) === JSON.stringify(H.A.bk.orders.map(x => x.id)));
const mo = H.A.bk.orders[0];
// co-op: guest shapes the cake, host picks flavour & bakes, guest decorates, host serves
G.A.bkDo({a: 'set', st: 1, k: 'sh', v: mo.sh}); G.A.bkDo({a: 'set', st: 1, k: 'ti', v: mo.ti}); chk('MP: guest action goes to host, not applied locally', G.out.length === 2 && G.A.bk.st[1].sh === null); relay();
H.A.bkDo({a: 'set', st: 1, k: 'fl', v: mo.fl}); H.A.bkDo({a: 'bake', st: 1}); step(H, 5.2); sync();
chk('MP: guest sees the shared station (baked, shape from guest)', G.A.bk.st[1].ph === 'baked' && G.A.bk.st[1].sh === mo.sh, G.A.bk.st[1]);
G.A.bkDo({a: 'set', st: 1, k: 'fr', v: mo.fr}); G.A.bkDo({a: 'set', st: 1, k: 'tp', v: mo.tp}); relay();
chk('MP: both players credited as bakers', H.A.bk.st[1].h.includes('H') && H.A.bk.st[1].h.includes('g1'), H.A.bk.st[1].h);
const hc = H.coins, gc = G.coins; H.A.bkDo({a: 'serve', st: 1}); sync();
chk('MP: whole team paid for the team cake', H.coins - hc === 22 && G.coins - gc === 22, [H.coins - hc, G.coins - gc]);
sync(); sync(); chk('MP: repeated snapshots never pay twice', G.coins - gc === 22, G.coins - gc);
chk('MP: guest progress saved too', G.A.bkProg().served === 1);
// late joiner should not be paid for older cakes
const L = world('late', {on: true, host: false, me: 'g2', hconn: {}}); L.A.buildBakery(); L.A.bakeryEnter(); L.A.bakeryFromHost(JSON.parse(JSON.stringify(H.A.bakeryWire())));
chk('MP: late joiner not paid for cakes served before joining', L.coins === 0);
// hostile/garbage wire is sanitised
G.A.bakeryFromHost({o: [{id: 1, sh: 'evil', fl: null, tp: '<img>', t: 'x'}], s: [{ph: 'boom', sh: 'x'}, null, 5], ev: [{id: 999, c: 99999, stars: 99}], lv: 1e9});
chk('MP: garbage wire sanitised + payout clamped', G.A.bk.orders[0].sh === 'round' && G.A.bk.st[0].ph === 'empty' && G.A.bk.lv === 99 && G.coins - gc - 22 <= 30, [G.A.bk.orders[0], G.coins]);
chk('MP: guest cannot apply actions directly', !G.A.bkApply('g1', {a: 'bake', st: 0}));
console.log('RESULT', pass, '/', pass + fail); process.exit(fail ? 1 : 0);
