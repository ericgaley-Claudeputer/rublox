'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert');
const host = v => JSON.parse(JSON.stringify(v));

const root = path.join(__dirname, '..');
const src = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const m = src.match(/\/\* ---------- continue \(t243u\) ---------- \*\/([\s\S]*?)\/\* ---------- \/continue ---------- \*\//);
if (!m) throw new Error('continue helpers missing from index.html');

let store = {};
const GAMES = [
  {id: 'dreamhouse', name: 'Dream House Builders', emoji: '🏡', playable: true, draw() {}},
  {id: 'stable', name: 'Clover Meadow Stables', emoji: '🐴', playable: true, draw() {}},
  {id: 'fashion', name: 'Fashion Show', emoji: '👗', playable: true, draw() {}},
  {id: 'haunt', name: 'Giggle Manor Escape', emoji: '👻', playable: true, draw() {}},
  {id: 'tower', name: 'Tower of Doom', emoji: '🗼', playable: true, draw() {}},
  {id: 'soon', name: 'Coming Soon', emoji: '⏳', playable: false, draw() {}},
];

function el(tag, attrs){
  const node = {
    tagName: tag.toUpperCase(),
    attrs: Object.assign({}, attrs),
    children: [],
    parent: null,
    hidden: !!attrs.hidden,
    _html: '',
    get innerHTML(){ return this._html; },
    set innerHTML(v){
      this._html = String(v);
      this.children = [];
      if (this._html.includes('<canvas')){
        const c = el('canvas', {});
        c.parent = this;
        this.children.push(c);
        this._canvas = c;
      }
    },
    className: attrs.class || '',
    dataset: {},
    type: attrs.type || '',
    onclick: null,
    getAttribute(k){ return this.attrs[k]; },
    setAttribute(k, v){ this.attrs[k] = v; if (k === 'hidden') this.hidden = true; },
    removeAttribute(k){ delete this.attrs[k]; if (k === 'hidden') this.hidden = false; },
    appendChild(c){ c.parent = this; this.children.push(c); return c; },
    querySelector(sel){
      if (sel === 'canvas') return this.children.find(c => c.tagName === 'CANVAS') || this._canvas || null;
      return null;
    },
    querySelectorAll(sel){
      if (sel === '.contile') return this.children.filter(c => (c.className || '').includes('contile'));
      return [];
    },
    closest(sel){
      if (sel === '.continue' && (this.className || '').includes('continue')) return this;
      return this.parent ? this.parent.closest(sel) : null;
    },
    addEventListener(){},
    focus(){ this._focused = true; },
    getContext(){ return {}; },
  };
  if (tag === 'canvas') node._canvas = node;
  return node;
}

const rowHome = el('div', {'data-continue-row': ''});
const wrapHome = el('section', {class: 'continue', hidden: true, id: 'continueHome'});
wrapHome.className = 'continue';
wrapHome.hidden = true;
wrapHome.children = [rowHome];
rowHome.parent = wrapHome;
rowHome.closest = (sel) => sel === '.continue' ? wrapHome : null;

const rowGames = el('div', {'data-continue-row': ''});
const wrapGames = el('section', {class: 'continue', hidden: true, id: 'continueGames'});
wrapGames.className = 'continue';
wrapGames.hidden = true;
wrapGames.children = [rowGames];
rowGames.parent = wrapGames;
rowGames.closest = (sel) => sel === '.continue' ? wrapGames : null;

const document = {
  querySelectorAll(sel){
    if (sel === '[data-continue-row]') return [rowHome, rowGames];
    return [];
  },
  createElement(tag){ return el(tag, {}); },
};

const played = [];
const ctx = {
  GAMES,
  Date,
  Math,
  Number,
  JSON,
  console,
  document,
  Obby: { play(id){ played.push(id); } },
  load(k, d){
    if (!(k in store)) return d;
    try { const v = JSON.parse(store[k]); return v ?? d; } catch (e){ return d; }
  },
  save(k, v){ store[k] = JSON.stringify(v); },
};
vm.runInNewContext(m[1], ctx);

let passed = 0, failed = 0;
function test(name, fn){
  try { fn(); passed++; console.log('ok  ' + name); }
  catch (e){ failed++; console.error('FAIL  ' + name + '\n  ' + (e.stack || e)); }
}

test('empty history hides both Continue rows', () => {
  store = {};
  ctx.renderContinue();
  assert.strictEqual(wrapHome.hidden, true);
  assert.strictEqual(wrapGames.hidden, true);
  assert.strictEqual(rowHome.children.length, 0);
});

test('recordRecentGame writes only rubloxRecentGames and caps at 10, most recent first', () => {
  store = { rubloxDreamHouse: '{"v":4,"bank":12}', rubloxCoins: '290' };
  const ids = ['dreamhouse','stable','fashion','haunt','tower','dreamhouse','stable','fashion','haunt','tower','dreamhouse'];
  // 11 starts but only 5 unique ids; add unique filler by temporarily allowing only known
  let t = 1000;
  const orig = Date.now;
  let clock = 1_700_000_000_000;
  Date.now = () => (clock += 1000);
  try {
    for (const id of ['dreamhouse','stable','fashion','haunt','tower']) ctx.recordRecentGame(id);
    // replay dreamhouse so it moves to front
    ctx.recordRecentGame('dreamhouse');
    const list = ctx.loadRecentGames();
    assert.strictEqual(list[0].id, 'dreamhouse');
    assert.ok(list[0].t > list[1].t);
    assert.deepStrictEqual(host(list.map(e => e.id)), ['dreamhouse','tower','haunt','fashion','stable']);
    assert.strictEqual(store.rubloxDreamHouse, '{"v":4,"bank":12}');
    assert.strictEqual(store.rubloxCoins, '290');
    const parsed = JSON.parse(store.rubloxRecentGames);
    assert.ok(Array.isArray(parsed));
  } finally { Date.now = orig; }
});

test('max 10 entries, oldest dropped, existing saves preserved', () => {
  store = { rubloxDreamHouse: 'keep-me', rubloxPlayer: '{"name":"Tessa"}' };
  const orig = Date.now;
  let clock = 1000;
  Date.now = () => (clock += 1);
  try {
    // pretend extra playable games exist
    for (let i = 0; i < 12; i++){
      const id = 'g' + i;
      GAMES.push({id, name: id, playable: true, draw(){}});
      ctx.recordRecentGame(id);
    }
    const list = ctx.loadRecentGames();
    assert.strictEqual(list.length, 10);
    assert.strictEqual(list[0].id, 'g11');
    assert.strictEqual(list[9].id, 'g2');
    assert.ok(!list.some(e => e.id === 'g0' || e.id === 'g1'));
    assert.strictEqual(store.rubloxDreamHouse, 'keep-me');
    assert.strictEqual(store.rubloxPlayer, '{"name":"Tessa"}');
  } finally {
    Date.now = orig;
    // drop filler games
    while (GAMES.length > 6) GAMES.pop();
  }
});

test('ignores unknown, unplayable, and corrupt history; does not clobber saves', () => {
  store = { rubloxRecentGames: 'not-json', rubloxDreamHouse: 'safe' };
  assert.deepStrictEqual(host(ctx.loadRecentGames()), []);
  ctx.recordRecentGame('soon');
  ctx.recordRecentGame('nope');
  ctx.recordRecentGame('');
  ctx.recordRecentGame(null);
  assert.deepStrictEqual(host(ctx.loadRecentGames()), []);
  assert.strictEqual(store.rubloxDreamHouse, 'safe');
  store.rubloxRecentGames = JSON.stringify([{id:'dreamhouse', t: 5}, {id:'soon', t: 9}, {foo:1}, {id:'haunt'}]);
  const show = ctx.recentGamesToShow();
  assert.deepStrictEqual(host(show.map(e => e.id)), ['dreamhouse']);
});

test('renderContinue shows only played games, most recent first, as focusable buttons', () => {
  store = { rubloxRecentGames: JSON.stringify([
    {id:'fashion', t: 300},
    {id:'dreamhouse', t: 900},
    {id:'soon', t: 1000},
    {id:'stable', t: 400},
  ]) };
  ctx.renderContinue();
  assert.strictEqual(wrapHome.hidden, false);
  assert.strictEqual(wrapGames.hidden, false);
  const tiles = rowHome.children;
  assert.strictEqual(tiles.length, 3);
  assert.deepStrictEqual(host(tiles.map(t => t.dataset.game)), ['dreamhouse','stable','fashion']);
  tiles.forEach(t => {
    assert.strictEqual(t.tagName, 'BUTTON');
    assert.strictEqual(t.type, 'button');
    assert.strictEqual(t.className, 'contile');
    assert.ok((t.getAttribute('aria-label') || '').startsWith('Continue '));
  });
  // click jumps into that game
  played.length = 0;
  tiles[1].onclick({preventDefault(){}, stopPropagation(){}});
  assert.deepStrictEqual(host(played), ['stable']);
});

test('formatRecentTime labels', () => {
  const now = 1_000_000;
  assert.strictEqual(ctx.formatRecentTime(now - 10_000, now), 'Just now');
  assert.strictEqual(ctx.formatRecentTime(now - 120_000, now), '2 min ago');
  assert.strictEqual(ctx.formatRecentTime(now - 3_600_000, now), '1 hr ago');
  assert.strictEqual(ctx.formatRecentTime(now - 2 * 86_400_000, now), '2 days ago');
});

test('start() records history after a successful engine check', () => {
  assert.ok(/if \(typeof THREE === 'undefined'\)\{[^}]+return; \}\s*recordRecentGame\(mode\);/.test(src));
});

test('Shop and Yard Close sit in a sticky top header, not below the item list', () => {
  const files = [
    path.join(root, 'index.html'),
    path.join(root, 'dev/dreamhouse/dreamhouse.js'),
  ];
  for (const f of files){
    const t = fs.readFileSync(f, 'utf8');
    assert.ok(t.includes('class="dhshead"'), f + ' missing dhshead');
    assert.ok(/<div class="dhshead"><h3>🛋️ Furniture Store<\/h3><button class="dhb" id="dhShopX">Close<\/button><\/div>/.test(t), f + ' furniture close not in header');
    assert.ok(/<div class="dhshead"><h3>📦 Supply Yard[^<]*<\/h3><button class="dhb" id="dhYardX">Close<\/button><\/div>/.test(t), f + ' yard close not in header');
    assert.ok(/<div class="dhshead"><h3>🔧 Upgrades<\/h3><button class="dhb" id="dhUpX">Close<\/button><\/div>/.test(t), f + ' upgrades close not in header');
    // Close must not appear after the grids anymore
    assert.ok(!/<div class="dhsgrid">.*<\/div><button class="dhb" id="dh(Shop|Yard)X">Close<\/button>/.test(t), f + ' close still after grid');
  }
  assert.ok(src.includes('.dhshead{') && (src.includes('#dhShopX,#dhYardX,#dhUpX{') || src.includes('#dhShopX,#dhYardX{')));
  assert.ok(src.includes('overflow:hidden') && src.includes('.dhsbody{'));
});

test('Continue row CSS supports mobile scroll and controller focus', () => {
  assert.ok(src.includes('overflow-x:auto'));
  assert.ok(src.includes('scroll-snap-type:x mandatory'));
  assert.ok(src.includes('.contile:focus') || src.includes('.contile:focus-visible'));
  assert.ok(src.includes('width:min(220px,72vw)'));
  assert.ok(src.includes('id="continue"') && src.includes('data-continue-row'));
  assert.ok(src.includes("if (id === 'games')"));
});

test('live page has a single Continue section between Home and Games', () => {
  const homes = (src.match(/id="continue"/g) || []).length;
  assert.strictEqual(homes, 1);
  assert.ok(!src.includes('id="continueHome"') && !src.includes('id="continueGames"'));
  const iCont = src.indexOf('id="continue"');
  const iHome = src.indexOf('id="home"');
  const iGames = src.indexOf('id="games"');
  assert.ok(iHome < iCont && iCont < iGames);
});

test('history key is new and version is bumped', () => {
  assert.ok(src.includes("const RECENT_KEY = 'rubloxRecentGames'"));
  assert.ok(src.includes("const BUILD = '2026.11.11-14'"));
  const v = JSON.parse(fs.readFileSync(path.join(root, 'version.json'), 'utf8'));
  assert.strictEqual(v.build, '2026.11.11-14');
});

console.log('\n' + passed + ' passed, ' + failed + ' failed');
if (failed) process.exit(1);
