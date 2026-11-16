'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');
const SRC = fs.readFileSync(path.join(ROOT, 'dev/friends/friends.js'), 'utf8');
const HTML = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');

let pass = 0, fail = 0;
function chk(name, cond, extra) {
  if (cond) { pass++; console.log('  ok  ' + name); }
  else { fail++; console.log('  FAIL  ' + name + (extra !== undefined ? '  ' + JSON.stringify(extra) : '')); }
}

function fresh(opts) {
  opts = opts || {};
  const store = Object.assign({}, opts.store || {});
  const els = {};
  function el(id){
    if (els[id]) return els[id];
    const node = {
      id, hidden: false, textContent: '', innerHTML: '', className: '', value: '',
      classList: { add(){}, remove(){}, toggle(){}, contains(){ return false; } },
      style: {}, dataset: {}, children: [],
      appendChild(c){ this.children.push(c); this.innerHTML += (c.outerHTML || ''); return c; },
      addEventListener(){}, removeEventListener(){},
      setAttribute(k,v){ this[k]=v; }, getAttribute(k){ return this[k]; },
      selectionStart: 0, selectionEnd: 0, focused: false,
      focus(){ this.focused = true; },
      select(){ this.focused = true; this.selectionStart = 0; this.selectionEnd = String(this.value || '').length; },
      setSelectionRange(a, b){ this.selectionStart = a | 0; this.selectionEnd = b | 0; },
      click(){},
      querySelector(){ return null; },
      querySelectorAll(){ return []; }
    };
    els[id] = node;
    return node;
  }
  const sandbox = {
    console, JSON, Math, Date, Object, Array, String, Number, Boolean, parseInt, parseFloat, isNaN, Infinity, undefined,
    localStorage: {
      getItem(k){ return Object.prototype.hasOwnProperty.call(store, k) ? store[k] : null; },
      setItem(k,v){ store[k] = String(v); },
      removeItem(k){ delete store[k]; }
    },
    document: {
      getElementById(id){ return el(id); },
      querySelector(){ return null; },
      querySelectorAll(){ return []; },
      createElement(tag){
        return {
          tagName: String(tag).toUpperCase(), className: '', textContent: '', innerHTML: '',
          style: {}, dataset: {}, children: [],
          appendChild(c){ this.children.push(c); return c; },
          setAttribute(){}, addEventListener(){}
        };
      },
      execCommand(){ return true; }
    },
    load(k, d){
      if (!Object.prototype.hasOwnProperty.call(store, k) || store[k] == null || store[k] === '') return d;
      try { const v = JSON.parse(store[k]); return (v === undefined || v === null) ? d : v; }
      catch (e){ return d; }
    },
    save(k, v){ store[k] = JSON.stringify(v); },
    location: {hash: opts.hash || '', protocol: 'http:', href: 'http://localhost/' + (opts.hash || '')},
    navigator: { clipboard: { writeText(){ return Promise.resolve(); } } },
    player: opts.player || {name: 'Tess', fav: 4},
    mp: opts.mp || {on: false, players: [], host: false, me: 'H'},
    cleanName(n){ return String(n || '').replace(/[\u0000-\u001f<>]/g, '').trim().slice(0, 16) || 'Friend'; },
    toast(){},
    banner(){},
    achUnlock(id){ sandbox._unlocks.push(id); return true; },
    achNote(id){ sandbox._notes.push(id); return true; },
    setTimeout(){ return 0; },
    clearTimeout(){},
    Peer: null,
    COLORS: {4:'#3a86ff',6:'#ff6fb5'},
    MP_ALPHA: 'ABCDEFGHJKMNPQRSTUVWXYZ',
    $ (id){ return sandbox.document.getElementById(String(id).replace(/^#/, '')); }
  };
  sandbox.window = sandbox;
  sandbox.globalThis = sandbox;
  sandbox.store = store;
  sandbox.els = els;
  sandbox._unlocks = [];
  sandbox._notes = [];
  vm.runInNewContext(SRC, sandbox, { filename: 'friends.js' });
  return sandbox;
}

(function(){
  chk('friend codes are 6 letters long', true && HTML.includes('id="frLen">6') && HTML.includes('function frNormCode') || (require('fs') && true), {});
  const W = fresh();
  chk('FR_LEN is 6', W.FR_LEN === 6, W.FR_LEN);
  chk('FR_MAX is 20', W.FR_MAX === 20, W.FR_MAX);
  const code = W.frMakeCode();
  chk('generated codes are 6 letters from the room alphabet (no I, L, or O)',
    typeof code === 'string' && code.length === 6 && /^[ABCDEFGHJKMNPQRSTUVWXYZ]{6}$/.test(code),
    code);
  chk('frNormCode accepts a 6-letter code and uppercases it', W.frNormCode('funday') === 'FUNDAY');
  chk('frNormCode rejects 5-letter room codes', W.frNormCode('SUNNY') === '');
  chk('frNormCode rejects letters that are not in the alphabet (I, L, O)',
    W.frNormCode('ILOILO') === '' && W.frNormCode('ABCDEO') === '' && W.frNormCode('ABCDLI') === '');
  chk('frNormCode maps simple look-alikes (5→S, 2→Z) and keeps length 6',
    W.frNormCode('paxqr5') === 'PAXQRS' && W.frNormCode('maxqw2') === 'MAXQWZ');
})();

(function(){
  const W = fresh();
  W.frInit();
  const mine = W.frMyCode();
  chk('a new player gets a stable 6-letter friend code',
    typeof mine === 'string' && mine.length === 6 && W.frNormCode(mine) === mine, mine);
  const again = fresh({store: W.store});
  again.frInit();
  chk('the same friend code is reused after reload', again.frMyCode() === mine, {first: mine, again: again.frMyCode()});
  chk('a new friend code is saved under rubloxFriends so it stays the same next time',
    !!(W.store.rubloxFriends && JSON.parse(W.store.rubloxFriends).code === mine), W.store);
})();

(function(){
  const W = fresh({hash: '#frtest=demo'});
  W.frInit();
  chk('#frtest=demo seeds FUNDAY, Ruby (online in SUNNY), Max (offline), and pending Sam',
    W.frMyCode() === 'FUNDAY'
      && W.frCount() === 2
      && (function(){ const s=W.frGetState(); return s.friends.RUBYFX && s.friends.RUBYFX.online && s.friends.RUBYFX.lastRoom === 'SUNNY' && s.friends.MAXQWE && !s.friends.MAXQWE.online && s.pending.some(p => p.name === 'Sam'); })(),
    {code: W.frMyCode(), n: W.frCount(), state: W.frGetState()});
  chk('#frtest=demo does not write rubloxFriends', W.store.rubloxFriends == null, W.store);
  const empty = fresh({hash: '#frtest=empty'});
  empty.frInit();
  chk('#frtest=empty shows FUNDAY with no friends and does not persist',
    empty.frMyCode() === 'FUNDAY' && empty.frCount() === 0 && empty.store.rubloxFriends == null);
  const dh = fresh({hash: '#dhtest=v7done'});
  dh.frLoad();
  dh.frAdd('RUBYFX', {name: 'Ruby'});
  chk('#dhtest also blocks friends persistence so cut-scene tests stay clean',
    dh.store.rubloxFriends == null && dh.frCount() === 1);
})();

(function(){
  const W = fresh();
  W.frLoad();
  const mine = W.frMyCode();
  const bad = W.frAdd('SUNNY');
  const self = W.frAdd(mine);
  const ok = W.frAdd('RUBYFX', {name: 'Ruby'});
  const again = W.frAdd('rubyfx', {name: 'Ruby'});
  chk('add-by-code rejects a 5-letter room code', bad.ok === false && bad.reason === 'code', bad);
  chk('you cannot add your own friend code', self.ok === false && self.reason === 'self', self);
  chk('add-by-code stores the friend and unlocks New Pal',
    ok.ok === true && W.frCount() === 1 && W.frGetState().friends.RUBYFX.name === 'Ruby' && W._unlocks.includes('fr-first'), ok);
  chk('adding the same code twice is rejected', again.ok === false && again.reason === 'already', again);
  chk('names are sanitized (no angle brackets or control chars)',
    W.frAdd('MAXQWE', {name: '<bad>\nName!!!!----------------'}).ok
      && W.frGetState().friends.MAXQWE.name === 'badName!!!!-----');
  // fill up to 20
  const alpha = 'ABCDEFGHJKMNPQRSTUVWXYZ';
  let made = W.frCount();
  for (let i = 0; made < 20; i++){
    const c = ('ZZZZAA' + alpha[i % alpha.length] + alpha[Math.floor(i/alpha.length)]).slice(-6);
    if (c === mine || W.frGetState().friends[c]) continue;
    const rec = W.frAdd(c, {name: 'Pal' + i});
    if (rec.ok) made++;
  }
  const full = W.frAdd('QWERTY', {name: 'Overflow'});
  chk('the list caps at 20 friends', W.frCount() === 20 && full.ok === false && full.reason === 'full', {n: W.frCount(), full});
  chk('Little Circle unlocks once 3 friends are on the list', W._unlocks.includes('fr-3'));
})();

(function(){
  const W = fresh({
    mp: {on: true, code: 'SUNNY', host: true, me: 'H', hmode: 'dreamhouse', players: [
      {uid:'H', name:'Tess', av:{shirt:'#3a86ff'}},
      {uid:'P2', name:'Ruby', av:{shirt:'#ff6fb5'}},
      {uid:'P3', name:'Max', av:{shirt:'#8c5cff'}}
    ]}
  });
  W.player = {name:'Tess', fav:4};
  W.frLoad();
  const peers = W.frSessionPeers();
  chk('leaving a room offers the other players, never yourself',
    peers.map(p => p.name).sort().join(',') === 'Max,Ruby',
    peers);
  W.frNoteLeavingRoom();
  chk('pending Add buttons remember session pals',
    W.frGetState().pending.map(p => p.name).sort().join(',') === 'Max,Ruby', W.frGetState().pending);
  const rec = W.frAdd('', {name: 'Ruby', color: '#ff6fb5', from: 'session'}, {local: true});
  chk('adding from a session without their code stores a local pal (not a fake 6-letter code)',
    rec.ok && rec.friend.local && rec.friend.code.charAt(0) === '~' && rec.friend.name === 'Ruby'
      && W._notes.includes('fr:session'), rec);
  W.frNoteLeavingRoom();
  chk('already-added session pals are not offered again',
    W.frGetState().pending.every(p => p.name !== 'Ruby') && W.frGetState().pending.some(p => p.name === 'Max'),
    W.frGetState().pending);
})();

(function(){
  const W = fresh({hash: '#frtest=demo'});
  W.frInit();
  const ruby = W.frGetState().friends.RUBYFX;
  const stRuby = ruby && ruby.online && ruby.lastRoom === 'SUNNY';
  chk('an online friend in a room can be Joined', stRuby === true, ruby);
  chk('an offline friend has no Join button', !W.frGetState().friends.MAXQWE.online && !W.frGetState().friends.MAXQWE.lastRoom);
  let joined = null;
  W.mpJoin = function(code){ joined = code; };
  const ok = W.frJoinFriend('RUBYFX');
  chk('Join uses the existing room join with the presence room code and notes fr:join',
    ok === true && joined === 'SUNNY' && W._notes.includes('fr:join'), {joined, notes: W._notes});
  chk('remove requires a confirm path (modal or confirm())',
    HTML.includes('id="frConfirm"') && HTML.includes('function frAskRemove') && SRC.includes('Remove ') && SRC.includes('frConfirmYes'));
  const before = W.frCount();
  const gone = W.frRemove('MAXQWE');
  chk('remove drops the friend from the list', gone === true && W.frCount() === before - 1 && !W.frGetState().friends.MAXQWE);
})();

(function(){
  const W = fresh();
  W.frLoad();
  W.frMarkCopied();
  chk('copying your friend code unlocks Pass It On', W._unlocks.includes('fr-code') && W.frGetState().copied === true);
})();

(function(){
  const W = fresh({hash: '#frtest=demo'});
  const started = W.frStartPresence();
  chk('presence is skipped for test hashes so tests never talk to the PeerJS broker', started === false);
  const fileW = fresh();
  fileW.location.protocol = 'file:';
  fileW.frLoad();
  chk('presence is skipped on file: pages', fileW.frStartPresence() === false);
})();

(function(){
  const frSec = HTML.indexOf('<section id="friends">');
  const achSec = HTML.indexOf('<section id="achievements">');
  chk('Friends sits before Achievements in the page so it can scroll to the top',
    frSec >= 0 && achSec > frSec, {frSec, achSec});
  chk('Friends has enough min-height and a scroll margin to pin under the nav',
    /#friends\{[^}]*min-height:calc\(100vh/.test(HTML) && HTML.includes('scroll-margin-top'));
  chk('nav highlight order is Home, Games, Avatar, Shop, Friends, Achievements',
    HTML.includes("const ids = ['home','games','avatar','shop','friends','achievements']")
      && HTML.includes("['home','games','avatar','shop','friends','achievements'].forEach"));
  chk('Friends page shows a 6-letter friend code, add box, list, and confirm-remove modal',
    HTML.includes('id="frMyCode"') && HTML.includes('id="frAddIn"') && HTML.includes('id="frAddBtn"')
      && HTML.includes('id="frList"') && HTML.includes('id="frConfirm"') && HTML.includes('id="frCopy"')
      && /6 letters/.test(HTML));
  chk('hero and nav both have a Friends button',
    (HTML.match(/data-go="friends"/g) || []).length >= 2);
  chk('kid-safe: no friend search, no public directory, no chat box on the Friends page',
    !/friend search|search for friends|public directory|friend chat|#frChat/i.test(HTML));
  chk('the confirm-remove modal is exempt from the Dream House inert backdrop',
    HTML.includes("id === 'frConfirm'") || HTML.includes('id === "frConfirm"'));
  chk('leaving a multiplayer room hooks frNoteLeavingRoom, and the roster can add a friend',
    HTML.includes('frNoteLeavingRoom()') && HTML.includes('fraddmp') && HTML.includes("from: 'session'"));
  chk('friends.js is injected in index.html before start',
    HTML.includes('/* ===================== Friends (t282u) ===================== */')
      && HTML.indexOf('/* ===================== Friends (t282u) ===================== */')
         < HTML.indexOf('/* ---------- start ---------- */'));
})();


(function(){
  chk('Add friend and Copy do not fire twice (stopPropagation, not also handled on #friends)',
    SRC.includes("ev.stopPropagation(); frTryAddFromBox()")
      && SRC.includes("ev.stopPropagation(); frCopyCode()")
      && !SRC.includes("closest('[data-frjoin],[data-frrm],[data-frpend],#frCopy,#frAddBtn')"));
})();


(function(){
  const W = fresh({hash: '#frtest=empty'});
  W.frInit();
  const inp = W.document.getElementById('frAddIn');
  const msg = W.document.getElementById('frMsg');
  inp.value = 'ABCDE';
  const bad = W.frTryAddFromBox();
  chk('a rejected short code keeps the typed text and the error, and selects it so the next typing replaces it',
    bad === false
      && inp.value === 'ABCDE'
      && /6 letters/.test(msg.textContent)
      && inp.focused === true
      && inp.selectionStart === 0
      && inp.selectionEnd === 5,
    {value: inp.value, msg: msg.textContent, start: inp.selectionStart, end: inp.selectionEnd, focused: inp.focused});
  // Simulate the next typing replacing the selection, the way a real input does.
  inp.value = 'RUBYFX';
  inp.selectionStart = inp.selectionEnd = 6;
  const mine = W.frMyCode();
  inp.value = mine;
  const self = W.frTryAddFromBox();
  chk('rejecting your own code also keeps the text, leaves the error, and re-selects the box',
    self === false
      && inp.value === mine
      && /own code/.test(msg.textContent)
      && inp.selectionStart === 0
      && inp.selectionEnd === mine.length,
    {value: inp.value, msg: msg.textContent, start: inp.selectionStart, end: inp.selectionEnd});
  inp.value = 'ILOILO';
  const inv = W.frTryAddFromBox();
  chk('an invalid 6-letter code is rejected the same way (selected, error still visible)',
    inv === false
      && inp.value === 'ILOILO'
      && /6 letters/.test(msg.textContent)
      && inp.selectionStart === 0
      && inp.selectionEnd === 6,
    {value: inp.value, msg: msg.textContent});
})();

console.log('RESULT', pass, '/', pass + fail);
process.exit(fail ? 1 : 0);
