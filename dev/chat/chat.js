  /* ===================== Chat (t285u) ===================== */
  /* In-room text chat over the existing PeerJS transport. Real players only.
     Free-text is filtered on the sender and again on every receiver. */
  const CH_KEY = 'rubloxChat', CH_VER = 1, CH_MAX = 80, CH_RATE_N = 3, CH_RATE_MS = 5000, CH_BUBBLE_MS = 4000;
  const CH_QUICK = ['Hi!', 'GG!', "Let's go!", 'Follow me!', 'Nice outfit!', 'Over here!', 'Thanks!', 'Oops!'];
  const CH_EMOJI = ['😀', '😁', '😂', '😊', '😍', '🤩', '😎', '🤗', '👍', '👏', '🎉', '❤️', '⭐', '🌈', '☀️', '🎮'];

  const ch = {
    mode: 'on', muted: [], sent: [], log: [], bubbles: [],
    open: false, wheel: false, wheelI: 0, _inited: false, _hintT: 0, now: null
  };

  function chNow(){ return ch.now != null ? ch.now : Date.now(); }
  function chTestHash(){
    try {
      const loc = (typeof location !== 'undefined' && location) || (typeof window !== 'undefined' && window.location) || null;
      const hash = loc && loc.hash ? String(loc.hash) : '';
      return /(?:^|#|&)chattest=([A-Za-z0-9_-]+)/i.test(hash);
    } catch (e){ return false; }
  }
  function chTestDemo(){
    try {
      const loc = (typeof location !== 'undefined' && location) || (typeof window !== 'undefined' && window.location) || null;
      const hash = loc && loc.hash ? String(loc.hash) : '';
      return /(?:^|#|&)chattest=demo\b/i.test(hash);
    } catch (e){ return false; }
  }
  function chDefault(){ return {ver: CH_VER, mode: 'on', muted: []}; }
  function chReadRaw(){
    try {
      if (typeof load === 'function') return load(CH_KEY, null);
      if (typeof localStorage !== 'undefined'){
        const r = localStorage.getItem(CH_KEY);
        return r ? JSON.parse(r) : null;
      }
    } catch (e){}
    return null;
  }
  function chWriteRaw(v){
    try {
      if (typeof save === 'function'){ save(CH_KEY, v); return true; }
      if (typeof localStorage !== 'undefined'){ localStorage.setItem(CH_KEY, JSON.stringify(v)); return true; }
    } catch (e){}
    return false;
  }
  function chNormalize(raw){
    const d = chDefault();
    const o = (raw && typeof raw === 'object') ? raw : {};
    d.mode = (o.mode === 'quick' || o.mode === 'off' || o.mode === 'on') ? o.mode : 'on';
    const muted = Array.isArray(o.muted) ? o.muted : [];
    d.muted = muted.map(n => String(n || '').trim()).filter(Boolean).slice(0, 40);
    d.ver = CH_VER;
    return d;
  }
  function chLoad(){
    const n = chNormalize(chReadRaw());
    ch.mode = n.mode;
    ch.muted = n.muted.slice();
    return n;
  }
  function chSave(){
    return chWriteRaw({ver: CH_VER, mode: ch.mode, muted: ch.muted.slice()});
  }
  function chMode(){ return (ch.mode === 'quick' || ch.mode === 'off') ? ch.mode : 'on'; }
  function chSetMode(m){
    ch.mode = (m === 'quick' || m === 'off' || m === 'on') ? m : 'on';
    chSave();
    chSync();
    return ch.mode;
  }
  function chMuteKey(name){ return String(name || '').replace(/[\u0000-\u001f<>]/g, '').trim().slice(0, 16).toLowerCase(); }
  function chIsMuted(name){ const k = chMuteKey(name); return !!k && ch.muted.some(n => chMuteKey(n) === k); }
  function chMute(name){
    const k = chMuteKey(name);
    if (!k || chIsMuted(k)) return false;
    ch.muted.push(String(name || '').replace(/[\u0000-\u001f<>]/g, '').trim().slice(0, 16));
    chSave();
    chRenderLog();
    chRenderPeople();
    chPruneBubbles();
    return true;
  }
  function chUnmute(name){
    const k = chMuteKey(name);
    const before = ch.muted.length;
    ch.muted = ch.muted.filter(n => chMuteKey(n) !== k);
    if (ch.muted.length === before) return false;
    chSave();
    chRenderLog();
    chRenderPeople();
    return true;
  }
  function chToggleMute(name){ return chIsMuted(name) ? chUnmute(name) : chMute(name); }

  function chGame(){
    try {
      if (typeof window !== 'undefined' && window.Obby) return window.Obby;
      if (typeof Obby !== 'undefined') return Obby;
    } catch (e){}
    return null;
  }
  function chMp(){
    try { if (typeof mp !== 'undefined' && mp) return mp; } catch (e){}
    try { const O = chGame(); if (O && O.mp) return O.mp; } catch (e){}
    return null;
  }
  function chMpSend(msg){
    try { if (typeof mpSend === 'function') return mpSend(msg); } catch (e){}
    try { const O = chGame(); if (O && typeof O.mpSend === 'function') return O.mpSend(msg); } catch (e){}
  }
  function chMpBroadcast(msg, except){
    try { if (typeof mpBroadcast === 'function') return mpBroadcast(msg, except); } catch (e){}
    try { const O = chGame(); if (O && typeof O.mpBroadcast === 'function') return O.mpBroadcast(msg, except); } catch (e){}
  }
  function chInRoom(){
    try {
      const m = chMp();
      return !!(m && m.on);
    } catch (e){ return false; }
  }
  function chAllowed(){
    if (chTestDemo()) return chMode() !== 'off';
    if (!chInRoom()) return false;
    return chMode() !== 'off';
  }
  /* Demo hash can show the panel even when Chat is Off, so testers can still see the UI? No: Off means off.
     Testers using #chattest=demo should see chat (default On). If they toggle Off, hide it. */
  function chDemoForced(){
    return chTestDemo() && chMode() !== 'off';
  }
  function chCanFreeText(){ return chAllowed() && chMode() === 'on'; }
  function chCanQuick(){ return chAllowed(); }

  function chRateOk(){
    const now = chNow();
    ch.sent = (ch.sent || []).filter(t => now - t < CH_RATE_MS);
    return ch.sent.length < CH_RATE_N;
  }
  function chRateCommit(){
    const now = chNow();
    ch.sent = (ch.sent || []).filter(t => now - t < CH_RATE_MS);
    if (ch.sent.length >= CH_RATE_N) return false;
    ch.sent.push(now);
    return true;
  }
  function chRateReset(){ ch.sent = []; }

  function chRunFilter(text){
    const fn = (typeof chatFilter === 'function') ? chatFilter : (typeof root !== 'undefined' && root.chatFilter);
    if (typeof chatFilter === 'function') return chatFilter(text, {max: CH_MAX});
    return {ok: true, text: String(text || '').replace(/\s+/g, ' ').trim().slice(0, CH_MAX), blocked: false, reasons: []};
  }
  function chIsQuickText(text){
    const t = String(text || '').trim();
    if (CH_QUICK.indexOf(t) >= 0) return true;
    if (t.length <= 4 && CH_EMOJI.indexOf(t) >= 0) return true;
    return false;
  }
  /* Prepare an outgoing line: length, mode, filter, rate limit. */
  function chPrepare(text, opts){
    opts = opts || {};
    const raw = String(text == null ? '' : text);
    const quick = !!(opts.quick || chIsQuickText(raw.trim()));
    if (chMode() === 'off' && !opts.force) return {ok: false, reason: 'off', text: ''};
    if (!quick && chMode() === 'quick' && !opts.force) return {ok: false, reason: 'quick-only', text: ''};
    const f = chRunFilter(raw);
    const out = f && f.text ? String(f.text) : '';
    if (!out) return {ok: false, reason: 'empty', text: '', blocked: !!(f && f.blocked)};
    if (!opts.skipRate && !chRateCommit()) return {ok: false, reason: 'rate', text: out, blocked: !!(f && f.blocked)};
    return {ok: true, text: out, blocked: !!(f && f.blocked), reasons: (f && f.reasons) || [], quick};
  }
  function chAcceptIncoming(d){
    if (!d || typeof d !== 'object') return null;
    const name = (typeof cleanName === 'function') ? cleanName(d.name) : String(d.name || 'Player').slice(0, 16);
    if (chIsMuted(name)) return null;
    const f = chRunFilter(d.text);
    const text = f && f.text ? String(f.text) : '';
    if (!text) return null;
    const uid = (typeof d.uid === 'string' && /^(H|g\d{1,4}|me|local)$/.test(d.uid)) ? d.uid : '';
    return {name, text, uid, quick: !!d.q, blocked: !!f.blocked};
  }

  function chEl(id){ try { return (typeof $ === 'function' ? $(id.charAt(0) === '#' ? id : '#' + id) : (typeof document !== 'undefined' && document.getElementById(id.replace(/^#/, '')))); } catch (e){ return null; } }
  function chEsc(s){
    return String(s == null ? '' : s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  }

  function chMyName(){
    try {
      if (typeof myLook === 'function') return myLook().name || 'You';
      const O = chGame();
      if (O && typeof O.myLook === 'function') return (O.myLook().name || 'You');
      if (typeof player !== 'undefined' && player && player.name) return (typeof cleanName === 'function') ? cleanName(player.name) : String(player.name).slice(0, 16);
    } catch (e){}
    return 'You';
  }
  function chMyUid(){
    try {
      const m = chMp();
      if (m && m.on) return m.me || (m.host ? 'H' : '');
    } catch (e){}
    return 'local';
  }
  function chPeople(){
    const out = [];
    const seen = new Set();
    const add = (uid, name, me) => {
      const n = (typeof cleanName === 'function') ? cleanName(name) : String(name || 'Player').slice(0, 16);
      const id = String(uid || n);
      if (seen.has(id)) return;
      if (id && id.charAt(0) === 'b') return;
      seen.add(id);
      out.push({uid: id, name: n, me: !!me});
    };
    try {
      const m = chMp();
      if (m && m.on){
        if (m.host){
          add('H', chMyName(), true);
          if (m.guests && m.guests.forEach) m.guests.forEach(g => { if (g && g.ready) add(g.uid, g.name, false); });
          else if (m.guests && m.guests.values) for (const g of m.guests.values()) if (g && g.ready) add(g.uid, g.name, false);
        } else if (Array.isArray(m.roster)){
          m.roster.forEach(p => { if (p) add(p.uid, p.name, p.uid === m.me); });
        }
      }
    } catch (e){}
    if (chTestDemo() && !out.length){
      add('local', chMyName(), true);
      add('demo1', 'Tess', false);
      add('demo2', 'Max', false);
      add('demo3', 'Ruby', false);
    }
    return out;
  }

  function chPushLog(entry){
    if (!entry || !entry.text) return;
    ch.log.push({name: entry.name, text: entry.text, at: chNow(), me: !!entry.me, uid: entry.uid || '', quick: !!entry.quick});
    if (ch.log.length > 80) ch.log = ch.log.slice(-80);
    chRenderLog();
  }
  function chAddBubble(uid, name, text){
    if (!text) return;
    const now = chNow();
    ch.bubbles = (ch.bubbles || []).filter(b => now - b.at < CH_BUBBLE_MS && !chIsMuted(b.name));
    ch.bubbles.push({uid: uid || '', name: name || '', text, at: now});
  }
  function chPruneBubbles(){
    const now = chNow();
    ch.bubbles = (ch.bubbles || []).filter(b => now - b.at < CH_BUBBLE_MS && !chIsMuted(b.name));
  }

  function chNoteAch(text){
    try {
      if (typeof achNote !== 'function') return;
      const t = String(text || '').trim();
      if (/^hi[!!. ]*$/i.test(t) || t === 'Hi!') achNote('ch:hello');
      if (/^gg[!!. ]*$/i.test(t) || t === 'GG!') achNote('ch:gg');
    } catch (e){}
  }

  function chShow(entry){
    if (!entry || !entry.text) return;
    if (chIsMuted(entry.name) && !entry.me) return;
    chPushLog(entry);
    chAddBubble(entry.uid, entry.name, entry.text);
    chDrawBubbles();
  }

  function chSend(text, opts){
    opts = opts || {};
    const prep = chPrepare(text, opts);
    if (!prep.ok){
      if (prep.reason === 'rate') chHint('Whoa, slow down a little!');
      else if (prep.reason === 'quick-only') chHint('Quick chat only is on.');
      else if (prep.reason === 'off') chHint('Chat is off.');
      return prep;
    }
    const mine = {name: chMyName(), text: prep.text, me: true, uid: chMyUid(), quick: !!prep.quick};
    chShow(mine);
    chNoteAch(prep.text);
    chNetSend(prep.text, !!prep.quick);
    return prep;
  }
  function chNetSend(text, quick){
    try {
      const m = chMp();
      if (!m || !m.on) return;
      const msg = {t: 'chat', v: 1, uid: chMyUid(), name: chMyName(), text: String(text), q: quick ? 1 : 0};
      chMpSend(msg);
    } catch (e){}
  }
  function chFromGuest(g, d){
    if (!g || !d || d.t !== 'chat') return;
    const incoming = {t: 'chat', uid: g.uid || d.uid, name: g.name || d.name, text: d.text, q: d.q};
    const acc = chAcceptIncoming(incoming);
    if (!acc) return;
    const now = chNow();
    g._chSent = (g._chSent || []).filter(t => now - t < CH_RATE_MS);
    if (g._chSent.length >= CH_RATE_N) return;
    g._chSent.push(now);
    const out = {t: 'chat', v: 1, uid: acc.uid || g.uid, name: acc.name, text: acc.text, q: acc.quick ? 1 : 0};
    chShow({name: acc.name, text: acc.text, me: false, uid: out.uid, quick: acc.quick});
    try { chMpBroadcast(out, g.conn); } catch (e){}
  }
  function chFromHost(d){
    if (!d || d.t !== 'chat') return;
    if (d.uid && d.uid === chMyUid()) return;
    const acc = chAcceptIncoming(d);
    if (!acc) return;
    chShow({name: acc.name, text: acc.text, me: false, uid: acc.uid, quick: acc.quick});
  }

  function chHint(msg){
    const el = chEl('chHint');
    if (el){ el.textContent = msg; el.classList && el.classList.add && el.classList.add('warn'); }
    ch._hintT = chNow();
    setTimeout(() => {
      const e = chEl('chHint');
      if (e && chNow() - ch._hintT >= 1400){ e.textContent = 'Enter or T to chat · Esc closes. Be kind!'; e.classList && e.classList.remove && e.classList.remove('warn'); }
    }, 1800);
  }
  function chRenderLog(){
    const log = chEl('chLog');
    if (!log) return;
    const rows = (ch.log || []).filter(e => e && e.text && (e.me || !chIsMuted(e.name)));
    log.innerHTML = rows.map(e => {
      const who = e.me ? 'You' : chEsc(e.name);
      return '<div class="chrow' + (e.me ? ' me' : '') + '"><b>' + who + '</b> ' + chEsc(e.text) + '</div>';
    }).join('');
    try { log.scrollTop = log.scrollHeight; } catch (e){}
  }
  function chRenderQuick(){
    const q = chEl('chQuick'), em = chEl('chEmoji'), w = chEl('chWheel');
    if (q){
      q.innerHTML = CH_QUICK.map((p, i) => '<button type="button" class="chq" data-chq="' + i + '">' + chEsc(p) + '</button>').join('');
    }
    if (em){
      em.innerHTML = CH_EMOJI.map((p, i) => '<button type="button" class="che" data-che="' + i + '" aria-label="emoji">' + p + '</button>').join('');
    }
    if (w){
      const items = CH_QUICK.concat(CH_EMOJI.slice(0, 4));
      w.innerHTML = '<div class="chwheel-title">Quick chat</div>' + items.map((p, i) => '<button type="button" class="chq' + (i === ch.wheelI ? ' on' : '') + '" data-chw="' + i + '">' + chEsc(p) + '</button>').join('') + '<div class="chwheel-hint">Ⓐ pick · Ⓑ close · View or ✚ move</div>';
    }
  }
  function chRenderPeople(){
    const box = chEl('chPeople');
    if (!box) return;
    const people = chPeople().filter(p => !p.me);
    if (!people.length){ box.innerHTML = ''; box.hidden = true; return; }
    box.hidden = false;
    box.innerHTML = people.map(p => {
      const muted = chIsMuted(p.name);
      return '<div class="chperson"><span>' + chEsc(p.name) + '</span><button type="button" class="chmute" data-chm="' + chEsc(p.name) + '">' + (muted ? 'Unmute' : 'Mute') + '</button></div>';
    }).join('');
  }
  function chRenderForm(){
    const form = chEl('chForm'), input = chEl('chIn');
    const free = chCanFreeText();
    if (form) form.hidden = !free;
    if (input){
      input.disabled = !free;
      input.maxLength = CH_MAX;
    }
    const root = chEl('chRoot');
    if (root) root.classList.toggle('ch-quickonly', chMode() === 'quick');
  }
  function chSync(){
    const root = chEl('chRoot'), btn = chEl('chBtn');
    const allow = chAllowed();
    if (root){
      root.hidden = !allow;
      root.classList.toggle('show', allow);
      root.classList.toggle('open', !!(allow && ch.open));
      root.classList.toggle('wheel', !!(allow && ch.wheel));
    }
    if (btn){
      btn.hidden = !allow;
      btn.setAttribute && btn.setAttribute('aria-hidden', allow ? 'false' : 'true');
    }
    const panel = chEl('chPanel');
    if (panel){
      panel.classList.toggle('show', !!(allow && ch.open));
      panel.hidden = !(allow && ch.open);
    }
    const wheel = chEl('chWheel');
    if (wheel){
      wheel.classList.toggle('show', !!(allow && ch.wheel));
      wheel.hidden = !(allow && ch.wheel);
    }
    chRenderForm();
    chRenderPeople();
    chRenderLog();
    chSyncSettings();
    if (!allow){ ch.open = false; ch.wheel = false; }
  }
  function chSyncSettings(){
    try {
      const mode = chMode();
      ['chSetOn', 'chSetQuick', 'chSetOff'].forEach(id => {
        const el = chEl(id);
        if (el) el.checked = (id === 'chSetOn' && mode === 'on') || (id === 'chSetQuick' && mode === 'quick') || (id === 'chSetOff' && mode === 'off');
      });
    } catch (e){}
  }
  function chExitLock(){
    try { if (typeof document !== 'undefined' && document.pointerLockElement && document.exitPointerLock) document.exitPointerLock(); } catch (e){}
    try { if (typeof dhExitPointerLock === 'function') dhExitPointerLock(); } catch (e){}
  }
  function chOpen(){
    if (!chAllowed()) return false;
    ch.wheel = false;
    ch.open = true;
    chExitLock();
    chSync();
    const input = chEl('chIn');
    if (input && chCanFreeText()){
      try { input.focus(); } catch (e){}
    }
    return true;
  }
  function chClose(){
    const was = ch.open || ch.wheel;
    ch.open = false;
    ch.wheel = false;
    const input = chEl('chIn');
    try { if (input && input.blur) input.blur(); } catch (e){}
    chSync();
    return was;
  }
  function chToggle(){ return ch.open ? (chClose(), false) : chOpen(); }
  function chOpenWheel(){
    if (!chAllowed()) return false;
    ch.open = false;
    ch.wheel = true;
    ch.wheelI = 0;
    chExitLock();
    chRenderQuick();
    chSync();
    return true;
  }
  function chWheelItems(){ return CH_QUICK.concat(CH_EMOJI.slice(0, 4)); }
  function chWheelMove(dir){
    const items = chWheelItems();
    if (!items.length) return;
    const n = items.length;
    ch.wheelI = (ch.wheelI + (dir || 1) + n * 8) % n;
    chRenderQuick();
  }
  function chWheelPick(){
    const items = chWheelItems();
    const t = items[ch.wheelI] || items[0];
    if (!t) return;
    chSend(t, {quick: true});
    chClose();
  }
  function chSubmit(){
    const input = chEl('chIn');
    const raw = input ? String(input.value || '') : '';
    const prep = chSend(raw, {});
    if (input && prep && (prep.ok || prep.reason === 'empty')) input.value = '';
    return prep;
  }

  function chTypingTarget(t){
    if (!t) return false;
    try {
      if (t.closest && t.closest('#chIn, #chPanel, #chWheel, #chRoot')) return true;
      const tag = (t.tagName || '').toLowerCase();
      if (tag === 'input' || tag === 'textarea' || tag === 'select' || t.isContentEditable) return true;
    } catch (e){}
    return false;
  }
  function chOnKey(e){
    if (!e) return false;
    const code = e.code || e.key || '';
    const key = e.key || '';
    try {
      const sm = (typeof document !== 'undefined') && document.getElementById && document.getElementById('setModal');
      if (sm && sm.classList && sm.classList.contains('show')) return false;
    } catch (err){}
    const target = e.target || e.srcElement;
    const inOur = !!(target && target.closest && target.closest('#chIn, #chPanel, #chWheel, #chRoot'));
    if (ch.open || ch.wheel){
      if (code === 'Escape' || key === 'Escape' || key === 'Esc'){
        if (e.preventDefault) e.preventDefault();
        if (e.stopPropagation) e.stopPropagation();
        if (e.stopImmediatePropagation) e.stopImmediatePropagation();
        chClose();
        return true;
      }
      if (ch.wheel){
        if (code === 'Enter' || code === 'Space' || key === 'Enter'){
          if (e.preventDefault) e.preventDefault();
          chWheelPick();
          return true;
        }
        if (code === 'ArrowDown' || code === 'ArrowRight'){ if (e.preventDefault) e.preventDefault(); chWheelMove(1); return true; }
        if (code === 'ArrowUp' || code === 'ArrowLeft'){ if (e.preventDefault) e.preventDefault(); chWheelMove(-1); return true; }
        return true;
      }
      if ((code === 'Enter' || key === 'Enter') && !e.repeat){
        if (e.preventDefault) e.preventDefault();
        if (e.stopPropagation) e.stopPropagation();
        if (chCanFreeText()) chSubmit();
        return true;
      }
      /* Eat game keys while the chat box is open so WASD / T / space don't move or emote. */
      if (e.preventDefault) e.preventDefault();
      if (inOur || chTypingTarget(target)) return true;
      return true;
    }
    if (!chAllowed()) return false;
    if (chTypingTarget(target) && !inOur) return false;
    if ((code === 'Enter' || code === 'KeyT' || key === 'Enter' || key === 't' || key === 'T') && !e.repeat){
      if (e.preventDefault) e.preventDefault();
      if (e.stopPropagation) e.stopPropagation();
      if (e.stopImmediatePropagation) e.stopImmediatePropagation();
      chOpen();
      return true;
    }
    return false;
  }
  function chPad(s, jp){
    jp = jp || (s && s.jp) || [];
    if (!chAllowed() && !ch.open && !ch.wheel) return false;
    if (ch.wheel || ch.open){
      const dx = (s && s.b && ((s.b[15] ? 1 : 0) - (s.b[14] ? 1 : 0))) || 0;
      const dy = (s && s.b && ((s.b[13] ? 1 : 0) - (s.b[12] ? 1 : 0))) || 0;
      if (jp[1]){ chClose(); return true; }
      if (jp[0]){ if (ch.wheel) chWheelPick(); else if (chCanFreeText()) chOpen(); return true; }
      if (jp[12] || jp[14] || dy < 0 || dx < 0){ if (ch.wheel) chWheelMove(-1); return true; }
      if (jp[13] || jp[15] || dy > 0 || dx > 0){ if (ch.wheel) chWheelMove(1); return true; }
      if (jp[8]){ chClose(); return true; }
      return true;
    }
    if (jp[8]){
      try {
        const skip = (typeof $ === 'function') ? $('#oSkip') : (typeof document !== 'undefined' && document.getElementById('oSkip'));
        if (skip && skip.classList && skip.classList.contains('show')) return false;
      } catch (e){}
      chOpenWheel();
      return true;
    }
    return false;
  }

  function chProject(x, y, z){
    try {
      if (typeof THREE === 'undefined') return null;
      const cam = (typeof camera !== 'undefined' && camera) || (chGame() && chGame().camera);
      if (!cam) return null;
      const v = new THREE.Vector3(+x, +y, +z);
      v.project(cam);
      if (v.z < -1 || v.z > 1) return null;
      const w = (typeof innerWidth === 'number' ? innerWidth : 800);
      const h = (typeof innerHeight === 'number' ? innerHeight : 600);
      return {x: (v.x * 0.5 + 0.5) * w, y: (-v.y * 0.5 + 0.5) * h, z: v.z, vis: v.z < 1 && v.z > -1};
    } catch (e){ return null; }
  }
  function chPosFor(uid, name){
    try {
      if (uid && (uid === chMyUid() || uid === 'local' || uid === 'me')){
        const Pv = (typeof P !== 'undefined' && P) || (chGame() && chGame().P);
        if (Pv) return {x: Pv.x, y: (Pv.y || 0) + 2.15, z: Pv.z};
      }
      const m = chMp();
      if (m && m.ents){
        const E = m.ents.get && m.ents.get(uid);
        if (E) return {x: E.x, y: (E.y || 0) + 2.15, z: E.z};
        if (m.ents.forEach){
          let found = null;
          m.ents.forEach((ent, id) => {
            if (found) return;
            const lookFn = (typeof mpLook === 'function') ? mpLook : (chGame() && chGame().mpLook);
            const look = (typeof lookFn === 'function') ? lookFn(id) : null;
            if (look && chMuteKey(look.short || look.name) === chMuteKey(name)) found = ent;
          });
          if (found) return {x: found.x, y: (found.y || 0) + 2.15, z: found.z};
        }
      }
    } catch (e){}
    return null;
  }
  function chDrawBubbles(){
    const box = chEl('chBubbles');
    if (!box) return;
    chPruneBubbles();
    const now = chNow();
    if (!ch.bubbles.length){ box.innerHTML = ''; return; }
    const runningGame = (typeof running !== 'undefined' && running) || !!(chGame() && chGame().running);
    box.innerHTML = ch.bubbles.map((b, i) => {
      const left = Math.max(0, CH_BUBBLE_MS - (now - b.at));
      let style = '';
      if (runningGame){
        const pos = chPosFor(b.uid, b.name);
        const pr = pos ? chProject(pos.x, pos.y, pos.z) : null;
        if (!pr || pr.z > 1) style = 'display:none';
        else style = 'left:' + Math.round(pr.x) + 'px;top:' + Math.round(pr.y) + 'px';
      } else {
        style = 'left:' + (18 + (i % 3) * 16) + '%;bottom:' + (28 + i * 8) + '%;top:auto;transform:none';
      }
      return '<div class="chbubble" style="' + style + '"><b>' + chEsc(b.name || '') + '</b> ' + chEsc(b.text) + '</div>';
    }).join('');
  }
  function chTick(){
    if (!chAllowed() && !(ch.bubbles && ch.bubbles.length)) return;
    chDrawBubbles();
  }

  function chSeedDemo(){
    if (!chTestDemo()) return false;
    if (ch.log && ch.log.length) return true;
    const t = chNow();
    ch.log = [
      {name: 'Tess', text: 'Hi!', at: t - 8000, me: false, uid: 'demo1', quick: true},
      {name: 'Max', text: "Let's go!", at: t - 6000, me: false, uid: 'demo2', quick: true},
      {name: 'Ruby', text: '####', at: t - 3500, me: false, uid: 'demo3', quick: false},
      {name: 'You', text: 'Nice outfit!', at: t - 1500, me: true, uid: 'local', quick: true}
    ];
    ch.bubbles = [{uid: 'demo1', name: 'Tess', text: 'Hi!', at: t}];
    ch.open = true;
    return true;
  }

  function chBind(){
    if (ch._bound) return;
    ch._bound = true;
    try {
      document.addEventListener('keydown', e => {
        if (chOnKey(e)) return;
      }, true);
      const root = chEl('chRoot');
      if (root){
        root.addEventListener('pointerdown', e => { e.stopPropagation(); chExitLock(); }, true);
        root.addEventListener('click', e => {
          const t = e.target && e.target.closest && (e.target.closest('[data-chq], [data-che], [data-chw], [data-chm], #chBtn, #chClose, #chSend'));
          if (!t) return;
          if (t.id === 'chBtn'){ e.preventDefault(); if (ch.open) chClose(); else chOpen(); return; }
          if (t.id === 'chClose'){ e.preventDefault(); chClose(); return; }
          if (t.id === 'chSend'){ e.preventDefault(); chSubmit(); return; }
          if (t.hasAttribute('data-chq')){ e.preventDefault(); const p = CH_QUICK[+t.getAttribute('data-chq')]; if (p) chSend(p, {quick: true}); return; }
          if (t.hasAttribute('data-che')){ e.preventDefault(); const p = CH_EMOJI[+t.getAttribute('data-che')]; if (p) chSend(p, {quick: true}); return; }
          if (t.hasAttribute('data-chw')){ e.preventDefault(); ch.wheelI = +t.getAttribute('data-chw') || 0; chWheelPick(); return; }
          if (t.hasAttribute('data-chm')){ e.preventDefault(); chToggleMute(t.getAttribute('data-chm')); return; }
        });
      }
      const form = chEl('chForm');
      if (form) form.addEventListener('submit', e => { e.preventDefault(); chSubmit(); });
      ['chSetOn', 'chSetQuick', 'chSetOff'].forEach(id => {
        const el = chEl(id);
        if (!el) return;
        el.addEventListener('change', () => {
          const m = id === 'chSetQuick' ? 'quick' : id === 'chSetOff' ? 'off' : 'on';
          chSetMode(m);
        });
      });
    } catch (e){}
  }

  function chInit(){
    if (ch._inited){ chSync(); return ch; }
    ch._inited = true;
    chLoad();
    if (chTestDemo()) chSeedDemo();
    chRenderQuick();
    chBind();
    chSync();
    try {
      if (chTestDemo()){
        const tick = () => { chTick(); requestAnimationFrame(tick); };
        requestAnimationFrame(tick);
      }
    } catch (e){}
    return ch;
  }

  try {
    if (typeof window !== 'undefined'){
      window.chInit = chInit;
      window.chSync = chSync;
      window.chOnKey = chOnKey;
      window.chPad = chPad;
      window.chTick = chTick;
      window.chSend = chSend;
      window.chPrepare = chPrepare;
      window.chAcceptIncoming = chAcceptIncoming;
      window.chFromGuest = chFromGuest;
      window.chFromHost = chFromHost;
      window.chSetMode = chSetMode;
      window.chMode = chMode;
      window.chMute = chMute;
      window.chUnmute = chUnmute;
      window.chIsMuted = chIsMuted;
      window.chToggleMute = chToggleMute;
      window.chLoad = chLoad;
      window.chAllowed = chAllowed;
      window.chOpen = chOpen;
      window.chClose = chClose;
      window.chOpenWheel = chOpenWheel;
      window.chRateOk = chRateOk;
      window.chRateCommit = chRateCommit;
      window.chRateReset = chRateReset;
      window.chTestHash = chTestHash;
      window.chTestDemo = chTestDemo;
      window.chSyncSettings = chSyncSettings;
      window.CH_QUICK = CH_QUICK;
      window.CH_EMOJI = CH_EMOJI;
      window.CH_KEY = CH_KEY;
      window.CH_MAX = CH_MAX;
      window.ch = ch;
    }
  } catch (e){}
  /* ===================== end Chat ===================== */
