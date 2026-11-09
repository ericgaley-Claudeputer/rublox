  /* ===================== t227u: 🍦 SCOOP CIRCUS ICE CREAM SHOP — take orders, scoop silly flavours, add toppings, earn coins ===================== */
  const IC_KEY = 'rubloxIceCream';
  const IC_VES = [['cone', '🍦', 'Cone'], ['cup', '🍨', 'Cup'], ['bowl', '🥣', 'Bowl']];
  const IC_FL = [['vanilla', '🍦', 'Cloud Vanilla', '#fff6d8'], ['choc', '🍫', 'Muddy Cocoa', '#6b3e1f'], ['berry', '🫐', 'Blueberry Pop', '#7fd6ff'],
    ['mint', '🌿', 'Mint Meadow', '#9ff0c8'], ['cotton', '🍭', 'Cotton Candy', '#ffb3c7'], ['lemon', '🍋', 'Sunny Lemon', '#ffe08a'],
    ['grape', '🍇', 'Grape Glow', '#c39bff'], ['cookie', '🍪', 'Cookie Crumble', '#d4a574']];
  const IC_TP = [['sprinkle', '🎊', 'Sprinkles', 0], ['cherry', '🍒', 'Cherry', 0], ['whip', '☁️', 'Whipped Cloud', 1], ['sauce', '🍫', 'Chocolate Drizzle', 2],
    ['star', '⭐', 'Sugar Star', 3], ['rainbow', '🌈', 'Rainbow Ribbon', 5]];
  const IC_SCOOPS = [1, 2, 3], IC_BAKE = 0, IC_OMAX = 3, IC_LV = 5, IC_LVBONUS = 10;
  const IC_NPCS = [['Ms Softserve', '👵', {head: '#ffdbac', shirt: '#ff6fb5', pants: '#8b5cf6', hair: 'bun', hairColor: '#e8e8e8'}],
    ['Pip the Scoop', '🧒', {head: '#f1c27d', shirt: '#7fd6ff', pants: '#1d2340', hair: 'spiky', hairColor: '#1d1d1d'}],
    ['Luna', '🌙', {head: '#8d5524', shirt: '#c39bff', pants: '#3a86ff', hair: 'pigtails', hairColor: '#1d1d1d'}],
    ['Theo', '🎩', {head: '#c68642', shirt: '#2b2d42', pants: '#2b2d42', hair: 'short', hairColor: '#6b3e1f', hat: 'tophat'}],
    ['Bree', '🌸', {head: '#e0ac69', shirt: '#ffd23f', pants: '#ff6fb5', hair: 'ponytail', hairColor: '#8a3b12'}],
    ['Nico', '⚽', {head: '#ffdbac', shirt: '#2ec27e', pants: '#1d2340', hair: 'short', hairColor: '#e9b949'}]];
  let ic = null;
  const icUid = () => mp.on ? mp.me : 'H';
  const icKeys = L => L.map(r => r[0]);
  function icProg(){ const o = load(IC_KEY, null), r = o && typeof o === 'object' ? o : {}; return {served: Math.max(0, r.served | 0), stars: Math.max(0, r.stars | 0), perfect: Math.max(0, r.perfect | 0), coins: Math.max(0, +r.coins || 0)}; }
  function icLevel(served){ return 1 + Math.floor(served / IC_LV); }
  function icUnlocked(lv){ return IC_TP.filter(t => lv >= t[3] + 1 || t[3] === 0).map(t => t[0]); }
  function icEmpty(){ return {ph: 'empty', ves: null, fl: [], n: 1, tp: null, h: []}; }
  function icClean(c){
    const o = c && typeof c === 'object' ? c : {}, pick = (v, L) => icKeys(L).includes(v) ? v : null;
    const fl = Array.isArray(o.fl) ? o.fl.filter(f => icKeys(IC_FL).includes(f)).slice(0, 3) : [];
    return {ph: ['empty', 'ready'].includes(o.ph) ? o.ph : 'empty', ves: pick(o.ves, IC_VES), fl, n: Math.max(1, Math.min(3, o.n | 0 || 1)), tp: pick(o.tp, IC_TP), h: Array.isArray(o.h) ? o.h.filter(u => typeof u === 'string').slice(0, 6) : []};
  }
  function icRand(L){ return L[Math.random() * L.length | 0]; }
  function icNewOrder(){
    const ul = icUnlocked(ic.lv), id = ++ic.oid, slot = [0, 1, 2].find(i => !ic.orders.some(o => o.slot === i));
    const n = IC_SCOOPS[Math.random() * IC_SCOOPS.length | 0], fl = [];
    for (let i = 0; i < n; i++) fl.push(icRand(IC_FL)[0]);
    const o = {id, slot, ves: icRand(IC_VES)[0], fl, n, tp: icRand(ul), t: mp.on ? 120 : 100, T: mp.on ? 120 : 100, who: mp.on ? -1 : (Math.random() * IC_NPCS.length | 0)};
    ic.orders.push(o); ic.dirty = true; return o;
  }
  function icMatch(c, o){
    let m = 0; if (c.ves === o.ves) m++; if (c.n === o.n) m++;
    const a = c.fl.slice().sort().join(','), b = o.fl.slice().sort().join(','); if (a === b) m += 2; else if (c.fl.some(f => o.fl.includes(f))) m++;
    if (c.tp === o.tp) m++; return m;
  }
  function icPrice(m, o){ return 3 + m * 3 + (o && o.t > o.T / 2 ? 3 : 0); }
  function icApply(uid, a){
    if (!ic || ic.remote || !a || typeof a !== 'object') return false;
    const i = a.st | 0, S = ic.st[i]; if (!S || i < 0 || i > 2) return false;
    const help = () => { if (!S.h.includes(uid)) S.h.push(uid); };
    if (a.a === 'set'){
      if (a.k === 'ves'){ if (S.ph !== 'empty') return false; if (!icKeys(IC_VES).includes(a.v)) return false; S.ves = a.v; help(); ic.dirty = true; return true; }
      if (a.k === 'n'){ if (S.ph !== 'empty' || !S.ves) return false; const n = a.v | 0; if (![1, 2, 3].includes(n)) return false; S.n = n; S.fl = S.fl.slice(0, n); help(); ic.dirty = true; return true; }
      if (a.k === 'scoop'){ if (S.ph !== 'empty' || !S.ves) return false; if (!icKeys(IC_FL).includes(a.v)) return false; if (S.fl.length >= S.n) return false; S.fl.push(a.v); if (S.fl.length >= S.n) S.ph = 'ready'; help(); ic.dirty = true; return true; }
      if (a.k === 'tp'){ if (S.ph !== 'ready') return false; if (!icUnlocked(ic.lv).includes(a.v)) return false; S.tp = a.v; help(); ic.dirty = true; return true; }
      return false;
    }
    if (a.a === 'trash'){ ic.st[i] = icEmpty(); ic.dirty = true; return true; }
    if (a.a === 'serve'){
      if (S.ph !== 'ready' || !S.tp || S.fl.length < S.n) return false; help();
      let best = null, bm = -1; ic.orders.forEach(o => { const m = icMatch(S, o); if (m > bm || (m === bm && best && o.t < best.t)){ bm = m; best = o; } });
      const m = best ? bm : 0, c = best ? icPrice(m, best) : 3, stars = best ? Math.max(1, Math.min(5, m)) : 1;
      if (best) ic.orders = ic.orders.filter(o => o !== best);
      icEvent({id: ++ic.eid, k: 'serve', c, stars, m, o: best ? best.id : 0, who: best ? best.who : -1, by: S.h.slice(), scoop: {ves: S.ves, fl: S.fl.slice(), n: S.n, tp: S.tp}});
      ic.st[i] = icEmpty(); ic.nextO = Math.min(ic.nextO, 3); ic.dirty = true; return true;
    }
    return false;
  }
  function icEvent(e){
    if (!ic || !e || ic.seen.has(e.id)) return; ic.seen.add(e.id); if (e.id > ic.lastEv) ic.lastEv = e.id;
    if (!ic.remote){ ic.ev.push(e); if (ic.ev.length > 12) ic.ev.shift(); }
    if (e.k === 'serve'){
      const p = icProg(), lv0 = icLevel(p.served); p.served++; p.stars += e.stars; if (e.m >= 5) p.perfect++;
      let pay = e.c; const lv1 = icLevel(p.served); if (lv1 > lv0) pay += IC_LVBONUS;
      p.coins += pay; save(IC_KEY, p); setCoins(coins + pay); runCoins = (runCoins || 0) + pay; ic.earned += pay; ic.served++;
      if (!ic.remote) ic.lv = lv1;
      const st = '⭐'.repeat(e.stars) + '☆'.repeat(Math.max(0, 5 - e.stars));
      banner((e.m >= 5 ? '🎉 PERFECT scoop! ' : e.o ? '🍦 Order served! ' : '🍨 Into the freezer case! ') + st + ' +' + e.c + ' 🪙' + (lv1 > lv0 ? '\n🏅 Scoop Level ' + lv1 + '! +' + IC_LVBONUS + ' 🪙' : ''));
      SND.coin(); if (e.m >= 5 || lv1 > lv0) confetti();
      if (!mp.on && e.who >= 0) icNpcHappy(e.who);
    } else if (e.k === 'leave') banner('😢 ' + (e.who >= 0 ? IC_NPCS[e.who][0] : 'A customer') + ' wandered off');
    icHud();
  }
  function icTick(dt){
    if (!ic || ic.remote) return;
    ic.orders.forEach(o => o.t -= dt);
    ic.orders.filter(o => o.t <= 0).forEach(o => icEvent({id: ++ic.eid, k: 'leave', who: o.who}));
    ic.orders = ic.orders.filter(o => o.t > 0);
    ic.nextO -= dt; if (ic.nextO <= 0 && ic.orders.length < IC_OMAX){ icNewOrder(); ic.nextO = mp.on ? 14 : 10; }
    if (ic.dirty){ ic.dirty = false; }
  }
  function icNpcHappy(who){ if (!ic || !ic.npcM[who]) return; banner('😊 ' + IC_NPCS[who][0] + ' loves their treat!'); }
  function buildIceCream(){
    ic = {ph: 'play', st: [icEmpty(), icEmpty(), icEmpty()], orders: [], oid: 0, eid: 0, lastEv: 0, seen: new Set(), ev: [], nextO: 2, lv: icLevel(icProg().served), served: 0, earned: 0, panel: -1, near: -1, remote: mpGuest(), dirty: true, npcM: {}, stations: []};
    scene.background = new THREE.Color('#ffe8f5');
    plat(0, 0, 0, 28, 22, '#fff0f8', .3);
    // counter + three scoop stations
    plat(0, 1.1, 2, 16, 2.2, '#ffb3c7', 1.1); plat(0, 2.25, 2, 16, .3, '#fff', .15);
    [[-5, 0], [0, 1], [5, 2]].forEach(([x, i]) => { const m = plat(x, 1.4, 1.2, 2.6, 1.6, '#7fd6ff', .5); ic.stations.push({i, x, z: 1.2, mesh: m.mesh}); const L = label(['🍦 L', '🍦 M', '🍦 R'][i], 'rgba(255,111,181,.92)'); L.position.set(x, 2.6, 1.2); scene.add(L); });
    // freezer case + decor
    plat(-10, 1.5, -4, 3, 4, '#c39bff', 1.5); plat(10, 1.5, -4, 3, 4, '#ffe08a', 1.5);
    plat(0, .2, -8, 8, 4, '#9ff0c8', .2);
    Object.assign(P, {x: 0, y: .05, z: -2, vx: 0, vy: 0, vz: 0}); P.face = 0; cam.yaw = 0; cam.pitch = .28; cam.dist = 9;
    plat(0, .4, -2, 1.5, 1.5, '#ffe08a', .15); checkpoints[0] = {idx: 0, spawn: {x: 0, y: .05, z: -2}, flag: new THREE.Object3D()};
    if (!mp.on){ IC_NPCS.forEach((n, i) => { const m = buildPlayer(); Object.assign(m, {name: n[0]}); /* visual stub */ ic.npcM[i] = m; }); }
  }
  function iceCreamEnter(){ if (!ic) return; ic.panel = -1; ic.near = -1; icHud(); banner(mp.on ? '🍦 Scoop Circus! Work the stations together!' : '🍦 Scoop Circus Ice Cream Shop! Customers want cones & cups!'); tipTimer = 6; }
  function iceCreamStop(){ ic = null; ['#icAct', '#icPanel', '#icOrders'].forEach(id => { const e = $(id); if (e) e.classList.remove('show'); }); }
  function iceCreamUpdate(dt){
    if (!ic) return; icTick(dt);
    // proximity to stations
    let near = -1, best = 2.4; ic.stations.forEach(s => { const d = Math.hypot(P.x - s.x, P.z - s.z); if (d < best){ best = d; near = s.i; } });
    ic.near = near; const btn = $('#icAct'); if (btn){ if (near >= 0){ btn.classList.add('show'); btn.innerHTML = '🍦 Station ' + ['L', 'M', 'R'][near] + '<small>E / Ⓧ</small>'; } else btn.classList.remove('show'); }
    // render orders HUD
    const box = $('#icOrders'); if (box){ box.innerHTML = ic.orders.map(o => {
      const fl = o.fl.map(f => (IC_FL.find(x => x[0] === f) || ['?', '?'])[1]).join('');
      const ves = (IC_VES.find(x => x[0] === o.ves) || ['?', '?'])[1], tp = (IC_TP.find(x => x[0] === o.tp) || ['?', '?'])[1];
      const pct = Math.max(0, o.t / o.T * 100);
      return '<div class="icord">' + ves + fl + tp + ' ×' + o.n + '<i style="width:' + pct + '%"></i></div>';
    }).join(''); }
    icHud();
  }
  function iceCreamAnimate(dt){}
  function icDo(a){ if (!ic) return; if (ic.remote){ mpSendTo(mp.hconn, Object.assign({t: 'icact'}, a)); return; } icApply(icUid(), a); if (ic.panel >= 0) icPanel(ic.panel); }
  function icPanel(i){
    if (!ic) return; ic.panel = i; const pan = $('#icPanel'); if (i < 0){ pan.classList.remove('show'); return; }
    pan.classList.add('show'); const S = ic.st[i]; $('#icPT').textContent = '🍦 Station ' + ['Left', 'Middle', 'Right'][i];
    const items = $('#icItems'); let html = '';
    if (S.ph === 'empty'){
      html += '<b>Vessel</b><div class="fsitems">'; IC_VES.forEach(v => { html += '<button class="icb' + (S.ves === v[0] ? ' on' : '') + '" data-a="set" data-k="ves" data-v="' + v[0] + '">' + v[1] + '<small>' + v[2] + '</small></button>'; }); html += '</div>';
      if (S.ves){ html += '<b>Scoops</b><div class="fsitems">'; [1, 2, 3].forEach(n => { html += '<button class="icb' + (S.n === n ? ' on' : '') + '" data-a="set" data-k="n" data-v="' + n + '">' + n + '<small>scoops</small></button>'; }); html += '</div>';
        html += '<b>Flavour (' + S.fl.length + '/' + S.n + ')</b><div class="fsitems">'; IC_FL.forEach(f => { html += '<button class="icb" data-a="set" data-k="scoop" data-v="' + f[0] + '"' + (S.fl.length >= S.n ? ' disabled' : '') + '>' + f[1] + '<small>' + f[2] + '</small></button>'; }); html += '</div>'; }
    } else {
      html += '<b>Topping</b><div class="fsitems">'; const ul = icUnlocked(ic.lv); IC_TP.forEach(t => { const ok = ul.includes(t[0]); html += '<button class="icb' + (S.tp === t[0] ? ' on' : '') + '" data-a="set" data-k="tp" data-v="' + t[0] + '"' + (ok ? '' : ' disabled') + '>' + t[1] + '<small>' + t[2] + (ok ? '' : ' 🔒') + '</small></button>'; }); html += '</div>';
      html += '<div class="row"><small>Scooped: ' + S.fl.map(f => (IC_FL.find(x => x[0] === f) || ['?', '?'])[1]).join(' ') + '</small></div>';
    }
    items.innerHTML = html;
    items.querySelectorAll('[data-a]').forEach(b => b.onclick = () => icDo({a: b.dataset.a, st: i, k: b.dataset.k, v: isNaN(+b.dataset.v) ? b.dataset.v : +b.dataset.v}));
  }
  function icHud(){ if (!ic) return; const n = $('#icN'); if (n) n.textContent = '🍦 ' + ic.served + ' · Lv ' + ic.lv; }
  function icPad(jp){ if (!ic) return false; if (ic.panel >= 0){ if (jp.b){ icPanel(-1); return true; } return false; } if (jp.x && ic.near >= 0){ icPanel(ic.near); return true; } return false; }
  function icKey(e){ if (!ic || e.repeat || paused) return false; if (e.code === 'KeyE' && ic.near >= 0){ icPanel(ic.near); return true; } if (e.code === 'Escape' && ic.panel >= 0){ icPanel(-1); return true; } return false; }
  function iceCreamWire(){ if (!ic || ic.remote) return null; return {o: ic.orders.map(o => ({id: o.id, slot: o.slot, ves: o.ves, fl: o.fl.slice(), n: o.n, tp: o.tp, t: o.t, T: o.T, who: o.who})), s: ic.st.map(icClean), ev: ic.ev.slice(-8), lv: ic.lv, served: ic.served, eid: ic.eid}; }
  function iceCreamFromHost(d){
    if (!ic || !d) return; ic.remote = true;
    ic.orders = (Array.isArray(d.o) ? d.o : []).slice(0, 3).map(o => ({id: o.id | 0, slot: o.slot | 0, ves: icKeys(IC_VES).includes(o.ves) ? o.ves : 'cone', fl: (Array.isArray(o.fl) ? o.fl : []).filter(f => icKeys(IC_FL).includes(f)).slice(0, 3), n: Math.max(1, Math.min(3, o.n | 0 || 1)), tp: icKeys(IC_TP).includes(o.tp) ? o.tp : 'sprinkle', t: Math.max(0, +o.t || 0), T: Math.max(1, +o.T || 100), who: o.who | 0}));
    ic.st = (Array.isArray(d.s) ? d.s : []).slice(0, 3).map(icClean); while (ic.st.length < 3) ic.st.push(icEmpty());
    ic.lv = Math.max(1, Math.min(99, d.lv | 0 || 1)); (Array.isArray(d.ev) ? d.ev : []).forEach(e => icEvent(e));
  }
  function icGuestMsg(g, d){ if (!ic || ic.remote || !d) return; icApply(g, d); }
