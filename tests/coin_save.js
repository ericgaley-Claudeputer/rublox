// Regression: wallet payouts must go through setCoins (or save('rubloxCoins')), never the
// undefined helpers saveCoins / pay / paintCoins. Otherwise coins appear in-session but never persist.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const A = require(path.join(ROOT, 'dev/aquarium/aquarium_logic.js'));
const F = require(path.join(ROOT, 'dev/farm/farm_logic.js'));
const T = require(path.join(ROOT, 'dev/fieldtrip/fieldtrip_logic.js'));

const RUNTIMES = [
  'dev/aquarium/runtime.js',
  'dev/farm/runtime.js',
  'dev/fieldtrip/runtime.js',
  'dev/winter/runtime.js',
  'dev/shelter/runtime.js',
  'dev/mansion/runtime.js',
  'dev/vet/runtime.js',
  'dev/museum/runtime.js'
];

function src(rel){ return fs.readFileSync(path.join(ROOT, rel), 'utf8'); }

test('no mode calls the undefined saveCoins or paintCoins helpers', () => {
  for (const f of RUNTIMES){
    const s = src(f);
    assert.doesNotMatch(s, /\bsaveCoins\b/, f + ' still mentions saveCoins');
    assert.doesNotMatch(s, /\bpaintCoins\b/, f + ' still mentions paintCoins');
  }
  assert.doesNotMatch(html, /\bsaveCoins\b/, 'index.html still mentions saveCoins');
  assert.doesNotMatch(html, /\bpaintCoins\b/, 'index.html still mentions paintCoins');
});

test('aquarium, farm and field trip pay and spend through setCoins', () => {
  const aq = src('dev/aquarium/runtime.js');
  assert.match(aq, /function aqSetCoins\(n\)/);
  assert.match(aq, /function aqPay\(n\)/);
  assert.match(aq, /if \(typeof setCoins === 'function'\) setCoins\(n\)/);
  assert.match(aq, /aqPay\(r\.coins\)/);
  assert.match(aq, /aqSetCoins\(r\.coins\)/); // gift shop sets the remaining wallet, does not add
  assert.equal((aq.match(/aqPay\(/g) || []).length, 3); // def + touch + ride home

  const fm = src('dev/farm/runtime.js');
  assert.match(fm, /function fmSetCoins\(n\)/);
  assert.match(fm, /fmPay\(r\.coins\)/);

  const ft = src('dev/fieldtrip/runtime.js');
  assert.match(ft, /function ftSetCoins\(n\)/);
  assert.match(ft, /ftPay\(r\.coins\)/);

  // winter, shelter, mansion, vet, museum already persist; they must prefer setCoins, not a missing pay()
  for (const f of ['dev/winter/runtime.js', 'dev/shelter/runtime.js', 'dev/mansion/runtime.js', 'dev/vet/runtime.js', 'dev/museum/runtime.js']){
    const s = src(f);
    assert.match(s, /setCoins\(/, f + ' should call setCoins');
    assert.doesNotMatch(s, /typeof pay === 'function'/, f + ' should not prefer the missing pay() helper');
  }

  for (const f of RUNTIMES){
    const body = src(f).replace(/\n$/, '');
    assert.ok(html.includes(body), f + ' must appear verbatim in index.html');
  }
});

test('aquarium touch pool and ride-home pay once; a gift deducts once', () => {
  const v = A.aqNewVisit(null);
  v.run.phase = 'hall';
  let st = v.state;
  const touch = A.aqTouch(st);
  assert.equal(touch.coins, 4);
  st = touch.state;
  assert.equal(A.aqTouch(st).coins, 0);

  for (const f of A.AQ_FINDS) st = A.aqPick(st, f.id).state;
  const home = A.aqBoardHome({phase:'hall'}, st);
  assert.equal(home.coins, A.AQ_REWARD);
  assert.equal(A.aqBoardHome({phase:'hall'}, home.state).coins, 0);

  const g = A.AQ_GIFTS[0];
  const buy = A.aqBuyGift(home.state, g.id, 80);
  assert.equal(buy.ok, true);
  assert.equal(buy.coins, 80 - g.price);
  assert.equal(A.aqBuyGift(buy.state, g.id, 80).already, true);
});

test('farm ride-home and field-trip ride-home also pay once; farm sales stop when stock is gone', () => {
  const visit = F.fmNewVisit(null);
  visit.run.phase = 'farm';
  let st = visit.state;
  F.FM_FEEDS.forEach(f => { st = F.fmFeed(st, f.id).state; });
  F.FM_EGGS.forEach(f => { st = F.fmPickEgg(st, f.id).state; });
  F.FM_APPLES.forEach(f => { st = F.fmPickApple(st, f.id).state; });
  F.FM_PUMPS.forEach(f => { st = F.fmPickPump(st, f.id).state; });
  assert.equal(F.fmStartHay(visit.run, st).ok, true);
  for (let i = 0; i < 80; i++){
    const r = F.fmTickHay(visit.run, st, 0.2);
    st = r.state;
    if (r.done) break;
  }
  assert.equal(F.fmAllDone(st), true);
  const farmHome = F.fmBoardHome(visit.run, st);
  assert.equal(farmHome.ok, true);
  assert.equal(farmHome.coins, F.FM_REWARD);
  assert.equal(F.fmBoardHome({phase:'farm'}, farmHome.state).coins, 0);

  // one matching sale, then the same basket is empty
  const stocked = F.fmLoad({eggs: F.FM_EGGS.map(x => x.id), apples: [], pumps: [], sold: {egg:0, apple:0, pump:0}});
  const run = {phase:'farm', custI: 0};
  // step customers until someone wants an egg
  let cust = F.fmCustomer(run, stocked), spins = 0;
  while (cust.want !== 'egg' && spins < 12){ run.custI = (run.custI + 1) % 12; cust = F.fmCustomer(run, stocked); spins++; }
  const sold = F.fmSell(stocked, 'egg', run);
  assert.equal(sold.ok, true);
  assert.ok(sold.coins > 0);
  // drain remaining eggs
  let state = sold.state, last = sold;
  for (let i = 0; i < 20; i++){
    const c = F.fmCustomer(run, state);
    const r = F.fmSell(state, c.want, run);
    if (r.ok){ last = r; state = r.state; }
  }
  assert.equal(F.fmStock(state).egg, 0);
  assert.equal(F.fmSell(state, 'egg', run).ok, false);

  const trip = T.ftNewVisit(null);
  trip.run.phase = 'nook';
  let ts = trip.state;
  for (const f of T.FT_FINDS) ts = T.ftPick(ts, f.id).state;
  const home = T.ftBoardHome(trip.run, ts);
  assert.equal(home.coins, T.FT_REWARD);
  assert.equal(T.ftBoardHome({phase:'nook'}, home.state).coins, 0);
});
