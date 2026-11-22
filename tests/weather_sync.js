// QA t337u: friends in one room shared a game but not the sky (one in a rainy day, one in a dry night).
const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');

function weatherWorld(){
  const a = html.indexOf('/* Rublox global weather + day/night'), b = html.indexOf('/* Rublox global Gore setting');
  const c = html.indexOf('/* ---------- rublox weather ---------- */'), d = html.indexOf('/* ---------- end rublox weather ---------- */');
  assert.ok(a > 0 && b > a && c > 0 && d > c);
  let now = 1000;
  const window = {};
  const ctx = {window, globalThis: null, performance: {now: () => now}, Math, JSON, Number, console, localStorage: {getItem(){ return null; }, setItem(){}}};
  ctx.globalThis = ctx;
  vm.createContext(ctx);
  vm.runInContext(html.slice(a, b) + '\n' + html.slice(c, d) + '\nthis.__wx = () => wx;', ctx);
  return {w: window, clock: { get: () => now, add: ms => { now += ms; } }, raw: ctx.__wx};
}

test('a joiner adopts the host clock, weather and setting, and keeps advancing between updates', () => {
  const host = weatherWorld(), guest = weatherWorld();
  host.w.wxEnter('pets'); guest.w.wxEnter('pets');
  host.w.wxForce('night', 'rain'); guest.w.wxForce('day', 'clear');
  const wire = JSON.parse(JSON.stringify(host.w.wxRoomWire()));
  assert.deepEqual(Object.keys(wire).sort(), ['age', 'm', 'setting', 't', 'weather']);
  assert.equal(guest.w.wxRoomApply(wire), true);
  guest.clock.add(500); guest.w.wxTick(0.016, 'pets');
  const g = guest.w.wxState(), h = host.w.wxState();
  assert.equal(g.phase, 'night'); assert.equal(g.weather, 'rain'); assert.equal(h.weather, 'rain');
  assert.ok(Math.abs(g.t - (wire.t + 0.5)) < 1e-6, 'extrapolates from the host time');
});

test('the joiner never rolls its own random weather while the room is authoritative', () => {
  const guest = weatherWorld(); guest.w.wxEnter('pets');
  guest.w.wxRoomApply({m: 'pets', setting: 'auto', t: 10, age: 47.9, weather: 'snow'});
  for (let i = 0; i < 30; i++){ guest.clock.add(100); guest.w.wxTick(0.1, 'pets'); }
  assert.equal(guest.w.wxState().weather, 'snow');
});

test('host Always-day and Off settings apply to everyone in the room', () => {
  const guest = weatherWorld(); guest.w.wxEnter('pets');
  guest.w.wxRoomApply({m: 'pets', setting: 'day', t: 150, age: 1, weather: 'rain'});
  guest.w.wxTick(0.016, 'pets');
  assert.equal(guest.w.wxState().phase, 'day'); assert.equal(guest.w.wxState().weather, 'clear');
  guest.w.wxRoomApply({m: 'pets', setting: 'off', t: 150, age: 1, weather: 'rain'});
  guest.raw().drops = null; guest.w.wxTick(0.016, 'pets');
  assert.equal(guest.w.wxState().drops, false);
});

test('bad, stale or other-game snapshots are ignored, and leaving restores your own sky', () => {
  const guest = weatherWorld(); guest.w.wxEnter('pets'); guest.w.wxForce('day', 'clear');
  [null, {}, {m: 'pets', setting: 'storm', t: 1, age: 1, weather: 'rain'}, {m: 'pets', setting: 'auto', t: -1, age: 1, weather: 'rain'},
   {m: 'pets', setting: 'auto', t: 1, age: 1, weather: 'lava'}, {m: 'pets', setting: 'auto', t: NaN, age: 1, weather: 'rain'}, {m: 'pets', setting: 'auto', t: 1, age: 99, weather: 'rain'}]
    .forEach(w => assert.equal(guest.w.wxRoomApply(w), false));
  guest.w.wxRoomApply({m: 'hide', setting: 'auto', t: 150, age: 1, weather: 'rain'});
  guest.w.wxTick(0.016, 'pets'); assert.equal(guest.w.wxState().weather, 'clear', 'another game');
  guest.w.wxRoomApply({m: 'pets', setting: 'auto', t: 150, age: 1, weather: 'rain'});
  guest.clock.add(11000); guest.w.wxTick(0.016, 'pets');
  assert.equal(guest.w.wxState().weather, 'clear', 'stale after 10 s');
  guest.w.wxRoomApply({m: 'pets', setting: 'auto', t: 150, age: 1, weather: 'rain'}); guest.w.wxRoomClear();
  guest.w.wxTick(0.016, 'pets'); assert.equal(guest.w.wxState().weather, 'clear');
});

test('room sync never writes the joiner\'s saved weather preference', () => {
  const src = html.slice(html.indexOf('function wxRoomApply('), html.indexOf('function wxRoomClear('));
  assert.doesNotMatch(src, /wxSave|save\(/);
});

test('host sends the sky with snapshots, joiners adopt it, leaving clears it', () => {
  assert.match(html, /mp\.wxN % 5 === 1\)\{ const w = wxRoomWire\(\); if \(w\) msg\.wx = w;/);
  assert.match(html, /if \(d\.wx && typeof wxRoomApply === 'function'\) try \{ wxRoomApply\(d\.wx\); \}/);
  assert.match(html, /function mpCleanup\(\)\{\n    try \{ if \(typeof wxRoomClear === 'function'\) wxRoomClear\(\); \}/);
});

test('Campfire Grove and Pinebell own day/night are host-authoritative too', () => {
  assert.match(html, /msg\.skyClock = \{m:'camp', phase:cg\.run\.phase, t:cg\.run\.t, day:cg\.run\.day, clock:cg\.run\.clock\}/);
  assert.match(html, /\['day','night'\]\.includes\(sk\.phase\) && Number\.isFinite\(sk\.t\) && sk\.t >= 0 && sk\.t <= 180/);
  assert.match(html, /if \(wnIsGuest\(\) && typeof snap\.night === 'boolean' && !!wn\.run\.night !== snap\.night\)\{ WinterRules\.wnSetNight\(wn\.run, snap\.night\); wnPaintLights\(\); \}/);
  assert.ok(/WX_SKIP = \[[^\]]*'winter'\]/.test(html), 'global sky no longer fights Pinebell lamp night');
});
