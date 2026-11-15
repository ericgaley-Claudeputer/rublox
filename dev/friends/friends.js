  /* ===================== Friends (t282u) ===================== */
  const FR_KEY = 'rubloxFriends', FR_VER = 1, FR_LEN = 6, FR_MAX = 20;
  const FR_PREFIX = 'rublox-fr-v1-';
  const FR_ALPHA = (typeof MP_ALPHA === 'string' && MP_ALPHA.length >= 20) ? MP_ALPHA : 'ABCDEFGHJKMNPQRSTUVWXYZ';
  const FR_LOOK = {O: 'QD', '0': 'QD', I: 'JT', '1': 'JT', L: 'JT', '2': 'Z', '3': 'E', '4': 'A', '5': 'S', '6': 'G', '7': 'T', '8': 'B', '9': 'G'};
  const fr = {ver: FR_VER, code: '', friends: {}, pending: [], copied: false, _inited: false, _poll: 0, _peer: null};

  function frTestHash(){
    try {
      const h = String((typeof location !== 'undefined' && location.hash) || (typeof window !== 'undefined' && window.location && window.location.hash) || '');
      return /(?:^|#|&)frtest=/i.test(h) || /(?:^|#|&)dhtest=/i.test(h);
    } catch (e){ return false; }
  }
  function frBlockPersist(){ return frTestHash(); }

  function frNormCode(raw){
    const s = String(raw || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (s.length !== FR_LEN) return '';
    let out = '';
    for (const ch of s){
      if (FR_ALPHA.includes(ch)) out += ch;
      else if (FR_LOOK[ch] && FR_LOOK[ch].length === 1) out += FR_LOOK[ch];
      else return '';
    }
    return out.length === FR_LEN ? out : '';
  }
  function frLocalKey(name){
    const slug = frCleanName(name).toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 12) || 'PAL';
    return '~' + slug;
  }
  function frMakeCode(){
    let c = '';
    for (let i = 0; i < FR_LEN; i++) c += FR_ALPHA[Math.floor(Math.random() * FR_ALPHA.length)];
    return c;
  }
  function frCleanName(n){
    if (typeof cleanName === 'function') return cleanName(n);
    return String(n || '').replace(/[\u0000-\u001f<>]/g, '').trim().slice(0, 16) || 'Friend';
  }
  function frEsc(s){
    if (typeof mpEsc === 'function') return mpEsc(s);
    return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }

  function frDemoState(){
    return {
      ver: FR_VER,
      code: 'FUNDAY',
      copied: false,
      pending: [{name: 'Sam', color: '#ff6fb5', at: Date.now(), from: 'session'}],
      friends: {
        RUBYFX: {code:'RUBYFX', name:'Ruby', color:'#ff6fb5', fav:6, added:1, from:'code', online:true, lastRoom:'SUNNY', lastMode:'dreamhouse', lastAt: Date.now()},
        MAXQWE: {code:'MAXQWE', name:'Max', color:'#3a86ff', fav:4, added:1, from:'session', online:false, lastRoom:'', lastMode:'', lastAt: 0}
      }
    };
  }
  function frFresh(){ return {ver: FR_VER, code: frMakeCode(), friends: {}, pending: [], copied: false}; }
  function frFixtureId(){
    try {
      const h = String((typeof location !== 'undefined' && location.hash) || '');
      const m = h.match(/(?:^|#|&)frtest=([a-z0-9-]+)/i);
      return m ? m[1].toLowerCase() : '';
    } catch (e){ return ''; }
  }
  function frLoad(){
    if (frFixtureId() === 'demo'){ Object.assign(fr, frDemoState()); return fr; }
    if (frFixtureId() === 'empty'){ Object.assign(fr, {ver: FR_VER, code: 'FUNDAY', friends: {}, pending: [], copied: false}); return fr; }
    let rec = null;
    try { rec = (typeof load === 'function') ? load(FR_KEY, null) : null; } catch (e){ rec = null; }
    if (!rec || typeof rec !== 'object') rec = frFresh();
    fr.ver = FR_VER;
    fr.code = frNormCode(rec.code) || frMakeCode();
    fr.copied = !!rec.copied;
    fr.friends = {};
    const src = rec.friends && typeof rec.friends === 'object' ? rec.friends : {};
    Object.keys(src).forEach(k => {
      const f = src[k] || {};
      const c = frNormCode(k) || frNormCode(f.code) || (String(k).charAt(0) === '~' ? String(k).slice(0, 16) : '');
      if (!c) return;
      fr.friends[c] = {
        code: c,
        local: c.charAt(0) === '~',
        name: frCleanName(f.name),
        color: (typeof f.color === 'string' && /^#[0-9a-f]{3,8}$/i.test(f.color)) ? f.color : '#3a86ff',
        fav: f.fav | 0,
        added: f.added || Date.now(),
        from: f.from === 'session' ? 'session' : 'code',
        online: false,
        lastRoom: frNormRoom(f.lastRoom),
        lastMode: typeof f.lastMode === 'string' ? f.lastMode.slice(0, 24) : '',
        lastAt: f.lastAt | 0
      };
    });
    fr.pending = Array.isArray(rec.pending) ? rec.pending.slice(0, 8).map(p => ({
      name: frCleanName(p && p.name),
      color: (p && typeof p.color === 'string' && /^#[0-9a-f]{3,8}$/i.test(p.color)) ? p.color : '#3a86ff',
      at: (p && p.at) || Date.now(),
      from: 'session'
    })) : [];
    return fr;
  }
  function frNormRoom(raw){
    const s = String(raw || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
    return s.length === 5 ? s : '';
  }
  function frGetState(){
    return {
      ver: FR_VER,
      code: fr.code,
      copied: !!fr.copied,
      pending: (fr.pending || []).map(p => ({name: p.name, color: p.color, at: p.at, from: 'session'})),
      friends: Object.assign({}, fr.friends)
    };
  }
  function frSave(){
    if (frBlockPersist()) return false;
    try { if (typeof save === 'function') save(FR_KEY, frGetState()); } catch (e){}
    return true;
  }
  function frMyCode(){ if (!fr.code) frLoad(); return fr.code; }
  function frList(){
    return Object.keys(fr.friends).map(k => fr.friends[k]).sort((a, b) => {
      if (!!b.online !== !!a.online) return a.online ? -1 : 1;
      return String(a.name).localeCompare(String(b.name));
    });
  }
  function frCount(){ return Object.keys(fr.friends || {}).length; }
  function frCountOf(snap){
    const rec = snap && snap.friends;
    if (!rec) return (typeof frCount === 'function' && fr._inited) ? frCount() : 0;
    if (typeof rec === 'number') return rec;
    if (rec.friends && typeof rec.friends === 'object') return Object.keys(rec.friends).length;
    if (typeof rec === 'object' && !rec.code && !rec.ver) return Object.keys(rec).length;
    return 0;
  }

  function frAdd(code, meta, opts){
    opts = opts || {};
    meta = meta || {};
    const c = frNormCode(code) || ((opts.local || (meta.from === 'session' && !frNormCode(code))) ? frLocalKey(meta.name || code) : '');
    if (!c) return {ok: false, reason: 'code'};
    if (frNormCode(c) && c === frMyCode()) return {ok: false, reason: 'self'};
    if (fr.friends[c]) return {ok: false, reason: 'already', friend: fr.friends[c]};
    if (frCount() >= FR_MAX) return {ok: false, reason: 'full'};
    const friend = {
      code: c,
      local: c.charAt(0) === '~',
      name: frCleanName(meta.name || ('Friend ' + c)),
      color: (typeof meta.color === 'string' && /^#[0-9a-f]{3,8}$/i.test(meta.color)) ? meta.color : '#3a86ff',
      fav: meta.fav | 0,
      added: Date.now(),
      from: meta.from === 'session' ? 'session' : 'code',
      online: !!meta.online,
      lastRoom: frNormRoom(meta.lastRoom || meta.room),
      lastMode: typeof meta.lastMode === 'string' ? meta.lastMode.slice(0, 24) : '',
      lastAt: Date.now()
    };
    fr.friends[c] = friend;
    fr.pending = (fr.pending || []).filter(p => frCleanName(p.name) !== friend.name);
    frSave();
    try {
      if (typeof achUnlock === 'function'){
        if (frCount() >= 1) achUnlock('fr-first');
        if (frCount() >= 3) achUnlock('fr-3');
      }
      if (friend.from === 'session' && typeof achNote === 'function') achNote('fr:session');
    } catch (e){}
    if (opts.render !== false && typeof frRender === 'function') frRender();
    return {ok: true, friend};
  }
  function frRemove(code){
    const c = frNormCode(code) || (fr.friends[code] ? code : '');
    if (!c || !fr.friends[c]) return false;
    delete fr.friends[c];
    frSave();
    if (typeof frRender === 'function') frRender();
    return true;
  }
  function frMarkCopied(){
    fr.copied = true;
    frSave();
    try { if (typeof achUnlock === 'function') achUnlock('fr-code'); } catch (e){}
    return true;
  }

  function frSessionPeers(){
    const out = [];
    const seen = new Set();
    const myName = frCleanName((typeof player !== 'undefined' && player && player.name) || '');
    const take = (name, color) => {
      const n = frCleanName(name);
      if (!n || n === myName || n === 'Player') return;
      const key = n.toLowerCase();
      if (seen.has(key)) return;
      seen.add(key);
      out.push({name: n, color: (typeof color === 'string' && /^#[0-9a-f]{3,8}$/i.test(color)) ? color : '#3a86ff', at: Date.now(), from: 'session'});
    };
    try {
      if (typeof mp !== 'undefined' && mp){
        if (mp.players && typeof mp.players.forEach === 'function'){
          mp.players.forEach(p => take(p && p.name, p && p.av && p.av.shirt));
        }
        const list = (typeof mpRoster === 'function' && mp.host) ? mpRoster() : (mp.roster || []);
        (list || []).forEach(p => {
          const self = mp.host ? p.uid === 'H' : p.uid === mp.me;
          if (!self) take(p && p.name, p && p.av && p.av.shirt);
        });
      }
    } catch (e){}
    return out.filter(p => !frList().some(f => f.name.toLowerCase() === p.name.toLowerCase()));
  }
  function frNoteLeavingRoom(){
    const peers = frSessionPeers();
    if (!peers.length) return fr.pending;
    const have = new Set((fr.pending || []).map(p => (p.name || '').toLowerCase()));
    frList().forEach(f => have.add((f.name || '').toLowerCase()));
    peers.forEach(p => { if (!have.has(p.name.toLowerCase())) fr.pending.push(p); });
    fr.pending = fr.pending.slice(-8);
    frSave();
    if (typeof frRender === 'function') frRender();
    return fr.pending;
  }

  function frMsg(text, ok){
    const el = (typeof $ === 'function') ? $('#frMsg') : null;
    if (!el) return;
    el.textContent = text || '';
    el.className = 'frmsg' + (ok ? ' ok' : (text ? ' err' : ''));
  }

  function frStatus(f){
    if (f && f.local) return {id: 'off', label: 'Ask them for their friend code', join: false};
    if (f && f.online && f.lastRoom) return {id: 'play', label: 'In a game', join: true};
    if (f && f.online) return {id: 'on', label: 'Online', join: false};
    return {id: 'off', label: 'Offline', join: false};
  }

  function frRender(){
    if (typeof document === 'undefined' || !document.getElementById) return false;
    const codeEl = document.getElementById('frMyCode');
    if (codeEl) codeEl.textContent = frMyCode() || '------';
    const lenEl = document.getElementById('frLen');
    if (lenEl) lenEl.textContent = String(FR_LEN);
    const listEl = document.getElementById('frList');
    const emptyEl = document.getElementById('frEmpty');
    const people = frList();
    if (emptyEl) emptyEl.hidden = people.length > 0;
    if (listEl){
      listEl.innerHTML = '';
      people.forEach(f => {
        const st = frStatus(f);
        const card = document.createElement('div');
        card.className = 'frcard';
        card.dataset.fr = f.code;
        const av = document.createElement('span');
        av.className = 'frav';
        av.style.background = f.color || '#3a86ff';
        av.textContent = (f.name || '?').slice(0, 1).toUpperCase();
        const body = document.createElement('div');
        body.className = 'frbody';
        const nm = document.createElement('b');
        nm.textContent = f.name;
        const meta = document.createElement('small');
        meta.innerHTML = '<i class="frdot ' + st.id + '"></i> ' + frEsc(st.label) + (f.local ? '' : (' · ' + frEsc(f.code)));
        body.appendChild(nm); body.appendChild(meta);
        const acts = document.createElement('div');
        acts.className = 'fracts';
        if (st.join && f.lastRoom){
          const j = document.createElement('button');
          j.className = 'big green frjoin';
          j.type = 'button';
          j.textContent = 'Join';
          j.dataset.frjoin = f.code;
          acts.appendChild(j);
        }
        const rm = document.createElement('button');
        rm.className = 'frrm';
        rm.type = 'button';
        rm.textContent = 'Remove';
        rm.dataset.frrm = f.code;
        acts.appendChild(rm);
        card.appendChild(av); card.appendChild(body); card.appendChild(acts);
        listEl.appendChild(card);
      });
    }
    const pend = document.getElementById('frPending');
    if (pend){
      const named = new Set(frList().map(f => (f.name || '').toLowerCase()));
      const wait = (fr.pending || []).filter(p => p && p.name && !named.has(p.name.toLowerCase()));
      if (!wait.length){ pend.hidden = true; pend.innerHTML = ''; }
      else {
        pend.hidden = false;
        pend.innerHTML = '<p>You just played with ' + (wait.length === 1 ? frEsc(wait[0].name) : 'these players') + '. Add them as friends?</p>'
          + wait.map((p, i) => '<button type="button" class="big green" data-frpend="' + i + '">Add ' + frEsc(p.name) + '</button>').join(' ');
      }
    }
    const nEl = document.getElementById('frCount');
    if (nEl) nEl.textContent = people.length ? (people.length + ' friend' + (people.length === 1 ? '' : 's')) : '';
    return true;
  }

  function frCopyCode(){
    const code = frMyCode();
    let ok = false;
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText){
        const p = navigator.clipboard.writeText(code);
        if (p && p.then) p.then(() => {}).catch(() => {});
        ok = true;
      }
    } catch (e){}
    try {
      const inp = document.getElementById('frCopyHold');
      if (inp){ inp.value = code; inp.removeAttribute('readonly'); inp.select(); document.execCommand('copy'); inp.setAttribute('readonly', ''); ok = true; }
    } catch (e){}
    frMarkCopied();
    frMsg(ok ? 'Copied! Your friend code is 6 letters: ' + code : 'Your friend code is 6 letters: ' + code, true);
    return true;
  }

  function frTryAddFromBox(){
    const inp = (typeof $ === 'function') ? $('#frAddIn') : null;
    const raw = inp ? inp.value : '';
    const c = frNormCode(raw);
    if (!c){ frMsg('Friend codes are 6 letters. Check the code and try again.'); return false; }
    const rec = frAdd(c, {name: 'Friend ' + c, from: 'code'});
    if (rec.ok){
      if (inp) inp.value = '';
      frMsg('Added ' + rec.friend.name + '! They can add you back with your code ' + frMyCode() + '.', true);
      return true;
    }
    if (rec.reason === 'self') frMsg('That is your own code.');
    else if (rec.reason === 'already') frMsg('You already added ' + ((rec.friend && rec.friend.name) || 'this friend') + '.');
    else if (rec.reason === 'full') frMsg('Your list is full (20 friends). Remove one to add another.');
    else frMsg('Friend codes are 6 letters. Check the code and try again.');
    return false;
  }

  function frAskRemove(code){
    const c = frNormCode(code) || (fr.friends[code] ? code : '');
    const f = c && fr.friends[c];
    if (!f) return false;
    const modal = document.getElementById('frConfirm');
    const text = document.getElementById('frConfirmText');
    const yes = document.getElementById('frConfirmYes');
    const no = document.getElementById('frConfirmNo');
    if (!modal || !text || !yes){
      if (typeof confirm === 'function' && confirm('Remove ' + f.name + ' from your friends?')) frRemove(c);
      return true;
    }
    text.textContent = 'Remove ' + f.name + ' from your friends? You can add them again later with their 6-letter code.';
    modal.classList.add('show');
    modal.dataset.fr = c;
    const close = () => { modal.classList.remove('show'); modal.dataset.fr = ''; };
    yes.onclick = () => { const id = modal.dataset.fr; close(); if (id) frRemove(id); frMsg('Removed from your friends.', true); };
    if (no) no.onclick = close;
    modal.onclick = ev => { if (ev.target === modal) close(); };
    return true;
  }

  function frJoinFriend(code){
    const c = frNormCode(code);
    const f = c && fr.friends[c];
    if (!f || !f.lastRoom){ frMsg('They are not in a game room right now.'); return false; }
    try { if (typeof achNote === 'function') achNote('fr:join'); } catch (e){}
    try {
      if (typeof mpJoin === 'function'){ mpJoin(f.lastRoom); return true; }
      if (typeof window !== 'undefined' && window.Obby && typeof window.Obby.mpJoin === 'function'){ window.Obby.mpJoin(f.lastRoom); return true; }
    } catch (e){}
    frMsg('Could not join right now. Try the room code ' + f.lastRoom + ' under Play together.');
    return false;
  }

  function frOpen(){
    try {
      if (typeof paintNav === 'function') paintNav('friends', true);
      const el = document.getElementById('friends');
      if (el && el.scrollIntoView) el.scrollIntoView({behavior: 'smooth', block: 'start'});
    } catch (e){}
    frRender();
    try { frPingFriends(); } catch (e){}
    return true;
  }

  function frOnListClick(ev){
    const t = ev.target && ev.target.closest && ev.target.closest('[data-frjoin],[data-frrm],[data-frpend]');
    if (!t) return;
    if (t.dataset.frjoin){ ev.preventDefault(); frJoinFriend(t.dataset.frjoin); return; }
    if (t.dataset.frrm){ ev.preventDefault(); frAskRemove(t.dataset.frrm); return; }
    if (t.dataset.frpend != null){
      ev.preventDefault();
      const p = fr.pending[t.dataset.frpend | 0];
      if (!p) return;
      const rec = frAdd(p.code || '', {name: p.name, color: p.color, from: 'session'}, {local: !frNormCode(p.code)});
      if (rec.ok) frMsg('Added ' + rec.friend.name + '! Ask them for their 6-letter friend code if you want to join them later.', true);
      else if (rec.reason === 'already') frMsg('You already added them.');
    }
  }

  function frBind(){
    if (typeof document === 'undefined') return;
    const root = document.getElementById('friends');
    if (root && !root._frBound){
      root._frBound = true;
      root.addEventListener('click', frOnListClick);
    }
    const inp = document.getElementById('frAddIn');
    if (inp && !inp._frBound){
      inp._frBound = true;
      inp.addEventListener('keydown', ev => { if (ev.key === 'Enter'){ ev.preventDefault(); frTryAddFromBox(); } });
    }
    const copy = document.getElementById('frCopy');
    if (copy && !copy._frBound){ copy._frBound = true; copy.addEventListener('click', ev => { ev.preventDefault(); ev.stopPropagation(); frCopyCode(); }); }
    const add = document.getElementById('frAddBtn');
    if (add && !add._frBound){ add._frBound = true; add.addEventListener('click', ev => { ev.preventDefault(); ev.stopPropagation(); frTryAddFromBox(); }); }
  }

  /* Best-effort presence over the same free PeerJS transport as family rooms.
     Only works while both people have Rublox open. No chat, no stranger search. */
  function frPresencePayload(){
    const room = (typeof mp !== 'undefined' && mp && mp.on && mp.code) ? String(mp.code) : '';
    let gameMode = '';
    try {
      if (typeof mp !== 'undefined' && mp && mp.hmode) gameMode = String(mp.hmode);
      else if (typeof window !== 'undefined' && window.obbyDebug && typeof window.obbyDebug.dhMode === 'function'){}
    } catch (e){}
    const name = frCleanName((typeof player !== 'undefined' && player && player.name) || 'Player');
    const fav = (typeof player !== 'undefined' && player && player.fav) | 0;
    const color = (typeof COLORS !== 'undefined' && COLORS[fav]) || '#3a86ff';
    return {t: 'frpres', v: 1, code: frMyCode(), name, color, room, mode: room ? (gameMode || 'play') : 'home'};
  }
  function frApplyPresence(msg){
    if (!msg || msg.t !== 'frpres') return false;
    const c = frNormCode(msg.code);
    if (!c || !fr.friends[c]) return false;
    const f = fr.friends[c];
    f.online = true;
    f.lastAt = Date.now();
    if (msg.name) f.name = frCleanName(msg.name);
    if (msg.color && /^#[0-9a-f]{3,8}$/i.test(msg.color)) f.color = msg.color;
    f.lastRoom = frNormRoom(msg.room);
    f.lastMode = typeof msg.mode === 'string' ? msg.mode.slice(0, 24) : '';
    frRender();
    return true;
  }
  function frStartPresence(){
    if (frBlockPersist()) return false;
    if (typeof location !== 'undefined' && location.protocol === 'file:') return false;
    const PeerFn = (typeof Peer === 'function') ? Peer : (typeof window !== 'undefined' && window.Peer);
    if (typeof PeerFn !== 'function') return false;
    if (fr._peer) return true;
    try {
      const peer = fr._peer = new PeerFn(FR_PREFIX + frMyCode(), {debug: 0, config: (typeof MP_ICE !== 'undefined' && MP_ICE) || undefined});
      peer.on('connection', conn => {
        try {
          conn.on('data', msg => {
            if (msg && msg.t === 'frhello'){
              try { conn.send(frPresencePayload()); } catch (e){}
              if (msg.code && fr.friends[frNormCode(msg.code)]) frApplyPresence(Object.assign({t:'frpres'}, msg));
            }
          });
          conn.on('open', () => { try { conn.send(frPresencePayload()); } catch (e){} });
        } catch (e){}
      });
      peer.on('error', () => { /* ID taken in another tab, or the free broker is down — just skip presence. */ });
      return true;
    } catch (e){ fr._peer = null; return false; }
  }
  function frPingFriends(){
    if (frBlockPersist()) return 0;
    const PeerFn = (typeof Peer === 'function') ? Peer : (typeof window !== 'undefined' && window.Peer);
    if (typeof PeerFn !== 'function' || !fr._peer) return 0;
    const list = frList().filter(f => f && !f.local && frNormCode(f.code)).slice(0, 8);
    list.forEach(f => {
      try {
        const conn = fr._peer.connect(FR_PREFIX + f.code, {reliable: true, serialization: 'json'});
        if (!conn) return;
        const t = setTimeout(() => { try { conn.close(); } catch (e){} }, 2500);
        conn.on('open', () => { try { conn.send(Object.assign({t: 'frhello'}, frPresencePayload())); } catch (e){} });
        conn.on('data', msg => { try { clearTimeout(t); frApplyPresence(msg); conn.close(); } catch (e){} });
        conn.on('error', () => { try { clearTimeout(t); } catch (e){} });
      } catch (e){}
    });
    return list.length;
  }
  function frStartPoll(){
    if (fr._poll) return;
    if (typeof setInterval !== 'function') return;
    fr._poll = setInterval(() => {
      try {
        if (typeof document !== 'undefined' && document.hidden) return;
        frPingFriends();
      } catch (e){}
    }, 20000);
  }

  function frInit(){
    if (fr._inited){ frRender(); return fr; }
    fr._inited = true;
    frLoad();
    if (!frBlockPersist()) frSave();
    frBind();
    frRender();
    if (typeof setTimeout === 'function') setTimeout(() => { try { frStartPresence(); frStartPoll(); frPingFriends(); } catch (e){} }, 0);
    return fr;
  }

  if (typeof window !== 'undefined'){
    window.FR_KEY = FR_KEY;
    window.FR_VER = FR_VER;
    window.FR_LEN = FR_LEN;
    window.FR_MAX = FR_MAX;
    window.FR_PREFIX = FR_PREFIX;
    window.frTestHash = frTestHash;
    window.frBlockPersist = frBlockPersist;
    window.frNormCode = frNormCode;
    window.frMakeCode = frMakeCode;
    window.frLoad = frLoad;
    window.frSave = frSave;
    window.frGetState = frGetState;
    window.frMyCode = frMyCode;
    window.frList = frList;
    window.frCount = frCount;
    window.frCountOf = frCountOf;
    window.frAdd = frAdd;
    window.frRemove = frRemove;
    window.frMarkCopied = frMarkCopied;
    window.frNoteLeavingRoom = frNoteLeavingRoom;
    window.frSessionPeers = frSessionPeers;
    window.frRender = frRender;
    window.frOpen = frOpen;
    window.frCopyCode = frCopyCode;
    window.frJoinFriend = frJoinFriend;
    window.frAskRemove = frAskRemove;
    window.frInit = frInit;
    window.frStartPresence = frStartPresence;
    window.frPingFriends = frPingFriends;
  }
  /* ===================== end Friends ===================== */
