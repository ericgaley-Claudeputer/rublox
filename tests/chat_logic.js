/* Chat settings, mute, rate limit, hooks, and demo fixture tests (t285u). */
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');
const HTML = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const WORDS = fs.readFileSync(path.join(ROOT, 'dev/chat/chatwords.js'), 'utf8');
const FILTER = fs.readFileSync(path.join(ROOT, 'dev/chat/chatfilter.js'), 'utf8');
const SRC = fs.readFileSync(path.join(ROOT, 'dev/chat/chat.js'), 'utf8');

let pass = 0, fail = 0;
function chk(name, cond, extra){
  if (cond){ pass++; }
  else { fail++; console.log('FAIL', name, extra !== undefined ? extra : ''); }
}

function fresh(opts){
  opts = opts || {};
  const store = Object.assign({
    rubloxCoins: 10,
    rubloxName: {name: 'Tester'},
    rubloxFriends: {ver: 1, code: 'FUNDAY', list: []}
  }, opts.store || {});
  const els = {};
  function el(id){
    if (els[id]) return els[id];
    const node = {
      id, tagName: (id === 'chIn' ? 'INPUT' : 'DIV'), hidden: false, textContent: '', innerHTML: '', className: '', value: '', checked: false, disabled: false,
      classList: {
        _s: new Set(),
        add(c){ this._s.add(c); node.className = [...this._s].join(' '); },
        remove(c){ this._s.delete(c); node.className = [...this._s].join(' '); },
        toggle(c, f){ if (f === false) this.remove(c); else if (f === true) this.add(c); else if (this._s.has(c)) this.remove(c); else this.add(c); },
        contains(c){ return this._s.has(c); }
      },
      style: {}, dataset: {}, children: [],
      appendChild(c){ this.children.push(c); return c; },
      addEventListener(){}, removeEventListener(){},
      setAttribute(k, v){ this[k] = v; }, getAttribute(k){ return this[k]; },
      closest(sel){
        const ids = String(sel||'').split(',').map(s => s.trim().replace(/^#/, ''));
        if (ids.includes(this.id)) return this;
        return null;
      },
      focus(){ this.focused = true; }, blur(){ this.focused = false; },
      querySelector(){ return null; }, querySelectorAll(){ return []; }
    };
    els[id] = node;
    return node;
  }
  ['chRoot','chBtn','chPanel','chLog','chQuick','chEmoji','chPeople','chForm','chIn','chHint','chWheel','chBubbles','chClose','chSend','chSetOn','chSetQuick','chSetOff'].forEach(el);
  const notes = {};
  const sandbox = {
    console,
    Date, Math, String, Number, Array, Object, Set, Map, JSON, RegExp, parseInt, isFinite, setTimeout, clearTimeout,
    CHAT_WORDS: undefined,
    chatFilter: undefined,
    location: {hash: opts.hash || ''},
    localStorage: {
      getItem(k){ return store[k] != null ? (typeof store[k] === 'string' ? store[k] : JSON.stringify(store[k])) : null; },
      setItem(k, v){ store[k] = v; },
      removeItem(k){ delete store[k]; }
    },
    document: {
      getElementById(id){ return el(id); },
      addEventListener(){},
      pointerLockElement: null,
      exitPointerLock(){ sandbox.document.pointerLockElement = null; }
    },
    player: {name: 'Tester'},
    mp: opts.mp || {on: false, host: false, me: '', guests: new Map(), roster: [], ents: new Map()},
    load(k, d){
      if (!(k in store)) return d;
      const v = store[k];
      if (typeof v === 'string'){
        try { return JSON.parse(v); } catch (e){ return v; }
      }
      return v;
    },
    save(k, v){ store[k] = v; },
    cleanName(n){ return String(n || '').replace(/[\u0000-\u001f<>]/g, '').trim().slice(0, 16) || 'Player'; },
    myLook(){ return {name: 'Tester'}; },
    mpSend(msg){ sandbox._sent.push(msg); },
    mpBroadcast(msg, except){ sandbox._bcast.push({msg, except}); },
    achNote(k){ notes[k] = {at: Date.now()}; sandbox._notes.push(k); },
    $:(id) => el(String(id).replace(/^#/, '')),
    requestAnimationFrame(fn){ return 0; }
  };
  sandbox.window = sandbox;
  sandbox.globalThis = sandbox;
  sandbox._sent = [];
  sandbox._bcast = [];
  sandbox._notes = [];
  sandbox._store = store;
  sandbox._els = els;
  sandbox._achNotes = notes;
  vm.createContext(sandbox);
  vm.runInContext(WORDS, sandbox, {filename: 'chatwords.js'});
  vm.runInContext(FILTER, sandbox, {filename: 'chatfilter.js'});
  vm.runInContext(SRC, sandbox, {filename: 'chat.js'});
  sandbox.chInit();
  return sandbox;
}

/* ---- settings ---- */
(() => {
  const W = fresh();
  chk('default chat mode is on', W.chMode() === 'on');
  chk('settings written under rubloxChat only after a change', W._store.rubloxChat == null);
  W.chSetMode('quick');
  chk('quick is saved', W.chMode() === 'quick' && W._store.rubloxChat && W._store.rubloxChat.mode === 'quick');
  W.chSetMode('off');
  chk('off is saved', W._store.rubloxChat.mode === 'off');
  chk('existing saves were not rewritten', W._store.rubloxCoins === 10 && W._store.rubloxFriends && W._store.rubloxFriends.code === 'FUNDAY' && W._store.rubloxName.name === 'Tester');
  const W2 = fresh({store: {rubloxChat: {ver: 1, mode: 'quick', muted: ['Max']}, rubloxCoins: 10}});
  chk('mode reloads from rubloxChat', W2.chMode() === 'quick');
  chk('muted list reloads', W2.chIsMuted('Max') === true);
  const W3 = fresh({store: {rubloxChat: {mode: 'nope'}}});
  chk('invalid mode falls back to on', W3.chMode() === 'on');
})();

/* ---- mute ---- */
(() => {
  const W = fresh({mp: {on: true, host: true, me: 'H', guests: new Map([['g1', {uid:'g1', name:'Max', ready:true, conn:{}}]]), roster: [], ents: new Map()}});
  chk('mute is case-insensitive', (W.chMute('Max'), W.chIsMuted('max') && W.chIsMuted('MAX')));
  const inc = W.chAcceptIncoming({t:'chat', uid:'g1', name:'Max', text:'Hi!'});
  chk('muted incoming is dropped', inc === null);
  W.chUnmute('MAX');
  const inc2 = W.chAcceptIncoming({t:'chat', uid:'g1', name:'Max', text:'Hi!'});
  chk('unmuted incoming arrives', inc2 && inc2.text === 'Hi!');
  chk('mute list persisted', Array.isArray(W._store.rubloxChat.muted) && W._store.rubloxChat.muted.some(n => /max/i.test(n)) === false);
})();

/* ---- rate limit ---- */
(() => {
  const W = fresh({mp: {on: true, host: true, me: 'H', guests: new Map(), roster: [], ents: new Map()}});
  W.ch.now = 1000;
  const a = W.chPrepare('Hi!', {quick: true});
  const b = W.chPrepare('GG!', {quick: true});
  const c = W.chPrepare("Let's go!", {quick: true});
  const d = W.chPrepare('Thanks!', {quick: true});
  chk('first 3 messages in 5s are allowed', a.ok && b.ok && c.ok, {a, b, c});
  chk('4th message in 5s is rate-limited', !d.ok && d.reason === 'rate', d);
  W.ch.now = 1000 + 5001;
  const e = W.chPrepare('Thanks!', {quick: true});
  chk('after 5s a new message is allowed', e.ok, e);
})();

/* ---- filter on send and receive ---- */
(() => {
  const W = fresh({mp: {on: true, host: true, me: 'H', guests: new Map(), roster: [], ents: new Map()}});
  W.ch.now = 90000;
  W.chRateReset();
  const prep = (text) => { W.chRateReset(); return W.chPrepare(text, {skipRate: true}); };
  const bad = ['s','h','i','t'].join('');
  const out = prep(bad);
  chk('sender filter hashes a blocked word', out.ok && out.blocked && out.text === '####', out);
  const ev = prep('sh1t');
  chk('sender filter catches leet', ev.ok && ev.blocked && /#/.test(ev.text), ev);
  const spaced = prep('s h i t');
  chk('sender filter catches spaced evasion', spaced.ok && spaced.blocked, spaced);
  const recv = W.chAcceptIncoming({t:'chat', uid:'g1', name:'Max', text: bad});
  chk('receiver filter hashes a blocked word', recv && recv.text === '####' && recv.blocked);
  const already = W.chAcceptIncoming({t:'chat', uid:'g1', name:'Max', text: '####'});
  chk('already-hashed text stays hashes', already && already.text === '####' && !already.blocked);
  const safe = prep('hello class');
  chk('class is not a false positive on send', safe.ok && safe.text === 'hello class' && !safe.blocked, safe);
  const scun = W.chAcceptIncoming({t:'chat', uid:'g1', name:'Max', text: 'assassin in the grass'});
  chk('assassin/grass survive on receive', scun && scun.text === 'assassin in the grass' && !scun.blocked, scun);
  const pii = prep('reach me at kid@gmail.com');
  chk('email is blocked on send', pii.ok && pii.blocked && !/@/.test(pii.text), pii);
  const mean = prep('you are stupid');
  chk('mean words are filtered', mean.ok && mean.blocked && /#/.test(mean.text), mean);
})();

/* ---- mode gates ---- */
(() => {
  const W = fresh({mp: {on: true, host: true, me: 'H', guests: new Map(), roster: [], ents: new Map()}});
  W.chSetMode('quick');
  const f = W.chPrepare('hello there', {});
  chk('free text blocked in quick-only mode', !f.ok && f.reason === 'quick-only');
  const q = W.chPrepare('Hi!', {quick: true});
  chk('quick phrase allowed in quick-only mode', q.ok && q.text === 'Hi!');
  W.chSetMode('off');
  const o = W.chPrepare('Hi!', {quick: true});
  chk('nothing sends when chat is off', !o.ok && o.reason === 'off');
})();

/* ---- single-player vs room vs demo ---- */
(() => {
  const solo = fresh({mp: {on: false, host: false, me: '', guests: new Map(), roster: [], ents: new Map()}});
  chk('single-player has no chat UI', solo.chAllowed() === false);
  const room = fresh({mp: {on: true, host: true, me: 'H', guests: new Map(), roster: [], ents: new Map()}});
  chk('multiplayer room allows chat', room.chAllowed() === true);
  const demo = fresh({hash: '#chattest=demo', mp: {on: false, host: false, me: '', guests: new Map(), roster: [], ents: new Map()}});
  chk('chattest=demo shows a fake log without a second player', demo.chTestDemo() && demo.ch.log.length >= 3);
  chk('demo log has no raw bad words', demo.ch.log.every(e => !/shit|fuck|stupid|ass/i.test(e.text)));
  chk('demo log shows a hashed line', demo.ch.log.some(e => e.text === '####'));
  chk('demo opens the panel', demo.ch.open === true && demo.chAllowed() === true);
})();

/* ---- length cap ---- */
(() => {
  const W = fresh({mp: {on: true, host: true, me: 'H', guests: new Map(), roster: [], ents: new Map()}});
  const long = W.chPrepare('h'.repeat(120), {});
  chk('messages cap around 80 characters', long.ok && long.text.length === 80, long);
})();

/* ---- achievements notes ---- */
(() => {
  const W = fresh({mp: {on: true, host: true, me: 'H', guests: new Map(), roster: [], ents: new Map()}});
  W.chSend('Hi!', {quick: true});
  W.chSend('GG!', {quick: true});
  chk('sending Hi! notes ch:hello', W._notes.indexOf('ch:hello') >= 0, W._notes);
  chk('sending GG! notes ch:gg', W._notes.indexOf('ch:gg') >= 0, W._notes);
})();

/* ---- typing in #chIn must not be preventDefaulted (demo or room) ---- */
function keyEvent(opts){
  const ev = {
    code: opts.code, key: opts.key, repeat: !!opts.repeat,
    target: opts.target,
    prevented: false, stopped: false,
    preventDefault(){ ev.prevented = true; },
    stopPropagation(){ ev.stopped = true; },
    stopImmediatePropagation(){ ev.stopped = true; }
  };
  return ev;
}
['#chattest=demo', 'room'].forEach(kind => {
  const W = kind === 'room'
    ? fresh({mp: {on: true, host: true, me: 'H', guests: new Map(), roster: [], ents: new Map()}})
    : fresh({hash: '#chattest=demo', mp: {on: false, host: false, me: '', guests: new Map(), roster: [], ents: new Map()}});
  W.ch.open = true;
  W.ch.wheel = false;
  const inp = W._els.chIn;
  const letter = keyEvent({code: 'KeyA', key: 'a', target: inp});
  const ret = W.chOnKey(letter);
  chk(kind + ': letter in #chIn is not preventDefaulted or stopped (capture must let it reach the box)', ret === false && !letter.prevented && !letter.stopped, {ret, prevented: letter.prevented, stopped: letter.stopped});
  const tkey = keyEvent({code: 'KeyT', key: 't', target: inp});
  W.chOnKey(tkey);
  chk(kind + ': T in #chIn types t, it does not get eaten as "open chat"', !tkey.prevented && !tkey.stopped);
  const wOff = keyEvent({code: 'KeyW', key: 'w', target: {id: 'body', tagName: 'BODY', closest(){ return null; }}});
  const eaten = W.chOnKey(wOff);
  chk(kind + ': W is eaten when the panel is open but focus is not in the box', eaten === true && wOff.prevented, {eaten, prevented: wOff.prevented});
  const ent = keyEvent({code: 'Enter', key: 'Enter', target: inp});
  W.chOnKey(ent);
  chk(kind + ': Enter in #chIn is intercepted to send', ent.prevented === true);
});

/* ---- HTML wiring (index.html is the shipped page) ---- */

chk('index includes chatwords module', HTML.includes('Chat word lists (t285u)') && HTML.includes('CHAT_WORDS'));
chk('index includes chat filter', HTML.includes('Chat filter (t285u)') && HTML.includes('function chatFilter'));
chk('index includes chat module', HTML.includes('Chat (t285u)') && HTML.includes('function chInit') && HTML.includes('function chOnKey') && HTML.includes('function chPad'));
chk('index has chat panel markup', HTML.includes('id="chPanel"') && HTML.includes('id="chIn"') && HTML.includes('id="chBtn"') && HTML.includes('id="chWheel"') && HTML.includes('id="chLog"'));
chk('index has mute + settings radios', HTML.includes('id="chSetOn"') && HTML.includes('id="chSetQuick"') && HTML.includes('id="chSetOff"') && HTML.includes('rubloxChat'));
chk('index hooks mp chat messages', HTML.includes("d.t === 'chat'") || (HTML.includes("case 'chat'") && HTML.includes('chFromGuest') && HTML.includes('chFromHost')));
chk('index hooks chFromGuest and chFromHost', HTML.includes('chFromGuest') && HTML.includes('chFromHost'));
chk('index keydown asks chOnKey first', HTML.includes('chOnKey'));
chk('index loop ticks chat bubbles', HTML.includes('chTick'));
chk('index settings syncs chat radios', HTML.includes('chSyncSettings') || HTML.includes('syncChatUi') || HTML.includes('chSetMode'));
chk('index gamepad View can open the wheel', HTML.includes('chPad') && HTML.includes('chOpenWheel'));
chk('HUD hit list includes chat chrome', /HUD_HIT_SEL[\s\S]{0,400}#chPanel/.test(HTML) || HTML.includes('#chPanel') && HTML.includes('HUD_HIT_SEL') && /HUD_HIT_SEL = '[^']*chPanel/.test(HTML));
chk('dhInertExempt includes chat root', HTML.includes("id === 'chRoot'") || HTML.includes("id === 'chPanel'"));
chk('chat achievements are in the registry', HTML.includes("id:'ch-hello'") && HTML.includes("id:'ch-gg'") && HTML.includes('First Hello') && HTML.includes('Said GG'));
chk('achBlockPersist treats chattest as a test hash', /achBlockPersist[\s\S]{0,500}chattest/.test(HTML));
chk('BUILD is 2026.11.19-7', HTML.includes("const BUILD = '2026.11.19-7'"));
chk('Obby exports mp so room chat can see the room from the home script',
  HTML.includes('get mp(){ return mp; }') && HTML.includes('window.Obby = Obby') && HTML.includes('chMp()'));


console.log('chat_logic ' + pass + '/' + (pass + fail) + (fail ? ' FAILED' : ' ok'));
if (fail) process.exit(1);
