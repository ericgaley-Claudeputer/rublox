// Non-GUI logic test for Scoop Circus Ice Cream (tests/p43/icecream.js)
const fs = require('fs'), vm = require('vm');
let pass = 0, fail = 0; const chk = (n, c, i) => { if (c) pass++; else fail++; console.log((c ? 'PASS ' : 'FAIL ') + n, c ? '' : JSON.stringify(i === undefined ? '' : i)); };
const SRC = fs.readFileSync(__dirname + '/../p43/icecream.js', 'utf8');
function world(name, mpCfg){
  const V = () => ({x: 0, y: 0, z: 0, set(){ return this; }, setScalar(){ return this; }, multiplyScalar(){ return this; }, copy(){ return this; }});
  const O = () => ({position: V(), rotation: V(), scale: V(), visible: true, children: [], material: {}, add(c){ this.children.push(c); }, remove(){}});
  const store = {}, els = {}, out = [];
  const ctx = {
    console, Math, JSON, Object, Array, Set, Number, String, Date, document: {body: {appendChild(){}}, getElementById: () => null, createElement: () => ({id:'', className:'', innerHTML:'', classList:{add(){},remove(){}}, onclick:null, appendChild(){}})},
    THREE: new Proxy({}, {get: () => function(){ return O(); }}), scene: {add(){}, remove(){}, background: null},
    load: (k, d) => k in store ? JSON.parse(store[k]) : d, save: (k, v) => { store[k] = JSON.stringify(v); },
    $: id => els[id] || (els[id] = {textContent: '', innerHTML: '', style: {}, disabled: false, classList: {add(){}, remove(){}}, querySelectorAll: () => []}),
    coins: 0, runCoins: 0, running: true, paused: false, choosing: false, worldT: 0, mode: 'icecream', banners: [], nds: null,
    P: {x: 0, y: .05, z: -2, face: 0}, pad: {on: false}, touchUI: false, keys: {}, joy: {x: 0, y: 0}, checkpoints: [], DEF: {},
    cam: {yaw: 0, pitch: 0, dist: 9}, tipTimer: 0,
    mp: mpCfg, mpGuest: () => mpCfg.on && !mpCfg.host, mpSendTo: (c, m) => out.push(m),
    plat: () => ({mesh: O(), active: true}), label: () => O(), buildPlayer: () => ({g: O()}),
    confetti(){}, SND: {coin(){}, cp(){}, win(){}}, store, out,
    setCoins: n => { ctx.coins = n; }, banner: t => ctx.banners.push(t)
  };
  vm.createContext(ctx);
  vm.runInContext(SRC + '\n;globalThis.A = {get ic(){ return ic; }, buildIceCream, iceCreamEnter, iceCreamUpdate, icApply, icDo, icGuestMsg, iceCreamWire, iceCreamFromHost, icMatch, icPrice, icProg, icClean, icNewOrder, icPanel, IC_TP, IC_FL, IC_VES};', ctx);
  return ctx;
}
const step = (W, sec) => { for (let t = 0; t < sec; t += .1) W.A.iceCreamUpdate(.1); };
const S = world('solo', {on: false, host: false, me: 'H'});
S.A.buildIceCream(); S.A.iceCreamEnter(); step(S, 5);
chk('solo: customers arrive (max 3)', S.A.ic.orders.length >= 1 && S.A.ic.orders.length <= 3, S.A.ic.orders);
const o = S.A.ic.orders[0];
chk('cannot top before scoops ready', !S.A.icApply('H', {a: 'set', st: 0, k: 'tp', v: o.tp}));
chk('set vessel', S.A.icApply('H', {a: 'set', st: 0, k: 'ves', v: o.ves}) && S.A.ic.st[0].ves === o.ves);
chk('set scoop count', S.A.icApply('H', {a: 'set', st: 0, k: 'n', v: o.n}) && S.A.ic.st[0].n === o.n);
chk('bad vessel rejected', !S.A.icApply('H', {a: 'set', st: 0, k: 'ves', v: 'waffle-alien'}));
o.fl.forEach(f => S.A.icApply('H', {a: 'set', st: 0, k: 'scoop', v: f}));
chk('scoops fill → ready', S.A.ic.st[0].ph === 'ready' && S.A.ic.st[0].fl.length === o.n, S.A.ic.st[0]);
chk('locked topping (Sugar Star at Lv1) rejected', !S.A.icApply('H', {a: 'set', st: 0, k: 'tp', v: 'star'}));
const freeTp = o.tp === 'star' || o.tp === 'rainbow' || o.tp === 'sauce' ? 'sprinkle' : o.tp;
// force order topping to unlocked one for clean serve
o.tp = freeTp;
chk('set topping', S.A.icApply('H', {a: 'set', st: 0, k: 'tp', v: freeTp}) && S.A.ic.st[0].tp === freeTp);
const c0 = S.coins, n0 = S.A.ic.orders.length;
chk('serve pays coins + clears station', S.A.icApply('H', {a: 'serve', st: 0}) && S.A.ic.st[0].ph === 'empty' && S.coins > c0, [S.coins - c0, S.A.ic.orders.length]);
chk('progress saved', S.A.icProg().served >= 1, S.A.icProg());
// serve without topping → hint, station stays ready
S.A.icApply('H', {a: 'set', st: 1, k: 'ves', v: 'cone'}); S.A.icApply('H', {a: 'set', st: 1, k: 'n', v: 1});
S.A.icApply('H', {a: 'set', st: 1, k: 'scoop', v: 'vanilla'});
chk('ready without topping', S.A.ic.st[1].ph === 'ready' && !S.A.ic.st[1].tp);
chk('serve without topping blocked + hint', !S.A.icApply('H', {a: 'serve', st: 1}) && S.A.ic.st[1].ph === 'ready' && /topping/i.test(S.A.ic.toast || S.banners.slice(-1)[0] || ''), [S.A.ic.toast, S.banners.slice(-1)]);
S.A.icApply('H', {a: 'set', st: 1, k: 'tp', v: 'sprinkle'});
const c1 = S.coins; chk('serve with topping pays + toast', S.A.icApply('H', {a: 'serve', st: 1}) && S.coins > c1 && S.A.ic.toastT > 0, [S.coins - c1, S.A.ic.toast]);
// trash
S.A.icApply('H', {a: 'set', st: 1, k: 'ves', v: 'cone'}); S.A.icApply('H', {a: 'trash', st: 1});
chk('trash resets station', S.A.ic.st[1].ph === 'empty' && !S.A.ic.st[1].ves);
// MP host/guest
const H = world('host', {on: true, host: true, me: 'H'}); H.A.buildIceCream(); H.A.iceCreamEnter(); step(H, 4);
const G = world('guest', {on: true, host: false, me: 'g1', hconn: {}}); G.A.buildIceCream(); G.A.iceCreamEnter();
const wire = H.A.iceCreamWire(); G.A.iceCreamFromHost(JSON.parse(JSON.stringify(wire)));
chk('MP: guest receives orders', G.A.ic.orders.length === H.A.ic.orders.length && G.A.ic.remote === true);
G.A.icGuestMsg('g1', {a: 'set', st: 0, k: 'ves', v: 'cup'}); // guest msg goes to host in real game; here test host apply path
chk('MP: host applies guest action', (H.A.icApply('g1', {a: 'set', st: 0, k: 'ves', v: 'cup'}), H.A.ic.st[0].ves === 'cup'));
G.A.iceCreamFromHost({o: [{id: 1, ves: 'evil', fl: ['nope'], n: 9, tp: '<img>', t: 'x'}], s: [{ph: 'boom'}], ev: [], lv: 1e9});
chk('MP: garbage wire sanitised', G.A.ic.orders[0].ves === 'cone' && G.A.ic.st[0].ph === 'empty' && G.A.ic.lv === 99, G.A.ic.orders[0]);
console.log('RESULT', pass, '/', pass + fail); process.exit(fail ? 1 : 0);
