  /* ===================== t214u: 🧁 SWEET TEAM BAKERY — bake, decorate & serve cakes together ===================== */
  const BK_KEY = 'rubloxBakery';
  const BK_SH = [['round', '⚪', 'Round'], ['square', '⬜', 'Square'], ['heart', '💗', 'Heart']];
  const BK_FL = [['vanilla', '🍦', 'Vanilla', '#f6e3b4'], ['choc', '🍫', 'Chocolate', '#6b3e1f'], ['straw', '🍓', 'Strawberry', '#ffb3c7'], ['lemon', '🍋', 'Lemon', '#fff07a']];
  const BK_FR = [['white', '🤍', 'Snow', '#fffaf0'], ['pink', '🩷', 'Bubblegum', '#ff8fc8'], ['choc', '🤎', 'Fudge', '#4a2a17'], ['mint', '💚', 'Mint', '#9ff0c8'], ['blue', '💙', 'Sky', '#8cc8ff'], ['purple', '💜', 'Grape', '#c39bff']];
  const BK_TP = [['sprinkles', '🎊', 'Sprinkles', 0], ['cherry', '🍒', 'Cherries', 0], ['candles', '🕯️', 'Candles', 0], ['berries', '🍓', 'Berries', 1], ['stars', '⭐', 'Gold Stars', 3], ['rainbow', '🌈', 'Rainbow Arch', 5]];
  const BK_TI = [[1, '1️⃣', '1 tier'], [2, '2️⃣', '2 tiers']];
  const BK_ST = [[-6, -6], [0, -6], [6, -6]], BK_SLOTS = [-5, 0, 5];
  const BK_BAKE = 5, BK_OMAX = 3, BK_LV = 5, BK_LVBONUS = 10;
  const BK_NPCS = [['Gran Gloria', '👵', {head: '#ffdbac', shirt: '#ff6fb5', pants: '#8b5cf6', hair: 'bun', hairColor: '#e8e8e8'}], ['Chef Pierre', '👨‍🍳', {head: '#f1c27d', shirt: '#f5f5f5', pants: '#1d2340', hair: 'short', hairColor: '#1d1d1d'}],
    ['Lily', '🌸', {head: '#8d5524', shirt: '#7bd389', pants: '#3a86ff', hair: 'pigtails', hairColor: '#1d1d1d'}], ['Max', '⚽', {head: '#ffdbac', shirt: '#ff4d4d', pants: '#1d2340', hair: 'spiky', hairColor: '#e9b949'}],
    ['Mayor Bun', '🎩', {head: '#c68642', shirt: '#2b2d42', pants: '#2b2d42', hair: 'short', hairColor: '#6b3e1f', hat: 'tophat'}], ['Zoe', '🎨', {head: '#e0ac69', shirt: '#ffd23f', pants: '#ff6fb5', hair: 'ponytail', hairColor: '#8a3b12'}]];
  let bk = null;
  const bkUid = () => mp.on ? mp.me : 'H';
  const bkKeys = L => L.map(r => r[0]);
  function bkProg(){ const o = load(BK_KEY, null), r = o && typeof o === 'object' ? o : {}; return {served: Math.max(0, r.served | 0), stars: Math.max(0, r.stars | 0), perfect: Math.max(0, r.perfect | 0), coins: Math.max(0, +r.coins || 0)}; }
  function bkLevel(served){ return 1 + Math.floor(served / BK_LV); }
  function bkUnlocked(lv){ return BK_TP.filter(t => lv >= t[3] + 1 || t[3] === 0).map(t => t[0]); }
  function bkEmpty(){ return {ph: 'empty', sh: null, fl: null, ti: 1, fr: null, tp: null, ov: 0, h: []}; }
  function bkClean(c){   // sanitise a station from the host
    const o = c && typeof c === 'object' ? c : {}, pick = (v, L) => bkKeys(L).includes(v) ? v : null;
    return {ph: ['empty', 'oven', 'baked'].includes(o.ph) ? o.ph : 'empty', sh: pick(o.sh, BK_SH), fl: pick(o.fl, BK_FL), ti: o.ti === 2 ? 2 : 1, fr: pick(o.fr, BK_FR), tp: pick(o.tp, BK_TP), ov: Math.max(0, Math.min(BK_BAKE, +o.ov || 0)), h: Array.isArray(o.h) ? o.h.filter(u => typeof u === 'string').slice(0, 6) : []};
  }
  function bkRand(L){ return L[Math.random() * L.length | 0]; }
  function bkNewOrder(){
    const ul = bkUnlocked(bk.lv), id = ++bk.oid, slot = [0, 1, 2].find(i => !bk.orders.some(o => o.slot === i));
    const o = {id, slot, sh: bkRand(BK_SH)[0], fl: bkRand(BK_FL)[0], ti: Math.random() < .35 ? 2 : 1, fr: bkRand(BK_FR)[0], tp: bkRand(ul), t: mp.on ? 130 : 110, T: mp.on ? 130 : 110, who: mp.on ? -1 : (Math.random() * BK_NPCS.length | 0)};
    bk.orders.push(o); bk.dirty = true; return o;
  }
  function bkMatch(c, o){ return (c.sh === o.sh) + (c.fl === o.fl) + (c.ti === o.ti) + (c.fr === o.fr) + (c.tp === o.tp); }
  function bkPrice(m, o){ return 4 + m * 3 + (o && o.t > o.T / 2 ? 3 : 0); }
  // host-side: apply one action from a player (uid). Returns true if something changed.
  function bkApply(uid, a){
    if (!bk || bk.remote || !a || typeof a !== 'object') return false;
    const i = a.st | 0, S = bk.st[i]; if (!S || i < 0 || i > 2) return false;
    const help = () => { if (!S.h.includes(uid)) S.h.push(uid); };
    if (a.a === 'set'){
      const L = {sh: BK_SH, fl: BK_FL, ti: BK_TI, fr: BK_FR, tp: BK_TP}[a.k]; if (!L) return false;
      const v = a.k === 'ti' ? (a.v === 2 ? 2 : 1) : a.v; if (!L.some(r => r[0] === v)) return false;
      if ((a.k === 'sh' || a.k === 'fl' || a.k === 'ti') && S.ph !== 'empty') return false;
      if ((a.k === 'fr' || a.k === 'tp') && S.ph !== 'baked') return false;
      if (a.k === 'tp' && !bkUnlocked(bk.lv).includes(v)) return false;
      S[a.k] = v; help(); bk.dirty = true; return true;
    }
    if (a.a === 'bake'){ if (S.ph !== 'empty' || !S.sh || !S.fl) return false; S.ph = 'oven'; S.ov = BK_BAKE; help(); bk.dirty = true; return true; }
    if (a.a === 'trash'){ bk.st[i] = bkEmpty(); bk.dirty = true; return true; }
    if (a.a === 'serve'){
      if (S.ph !== 'baked' || !S.fr || !S.tp) return false; help();
      let best = null, bm = -1; bk.orders.forEach(o => { const m = bkMatch(S, o); if (m > bm || (m === bm && o.t < best.t)){ bm = m; best = o; } });
      const m = best ? bm : 0, c = best ? bkPrice(m, best) : 3, stars = best ? Math.max(1, m) : 1;
      if (best) bk.orders = bk.orders.filter(o => o !== best);
      bkEvent({id: ++bk.eid, k: 'serve', c, stars, m, o: best ? best.id : 0, who: best ? best.who : -1, by: S.h.slice(), cake: {sh: S.sh, fl: S.fl, ti: S.ti, fr: S.fr, tp: S.tp}});
      bk.st[i] = bkEmpty(); bk.nextO = Math.min(bk.nextO, 3); bk.dirty = true; return true;
    }
    return false;
  }
  // every client (host + guests) handles each event exactly once: coins + progress for the whole team
  function bkEvent(e){
    if (!bk || !e || bk.seen.has(e.id)) return; bk.seen.add(e.id); if (e.id > bk.lastEv) bk.lastEv = e.id;
    if (!bk.remote){ bk.ev.push(e); if (bk.ev.length > 12) bk.ev.shift(); }
    if (e.k === 'serve'){
      const p = bkProg(), lv0 = bkLevel(p.served); p.served++; p.stars += e.stars; if (e.m === 5) p.perfect++;
      let pay = e.c; const lv1 = bkLevel(p.served); if (lv1 > lv0) pay += BK_LVBONUS;
      p.coins += pay; save(BK_KEY, p); setCoins(coins + pay); runCoins = (runCoins || 0) + pay; bk.earned += pay; bk.served++; bk.team += e.c;
      if (!bk.remote) bk.lv = lv1;
      const st = '⭐'.repeat(e.stars) + '☆'.repeat(5 - e.stars);
      banner((e.m === 5 ? '🎉 PERFECT cake! ' : e.o ? '🎂 Order served! ' : '🍰 Into the display case! ') + st + ' +' + e.c + ' 🪙' + (lv1 > lv0 ? '\n🏅 Bakery Level ' + lv1 + '! +' + BK_LVBONUS + ' 🪙' + bkUnlockMsg(lv1) : ''));
      SND.coin(); if (e.m === 5 || lv1 > lv0) confetti();
      if (!mp.on && e.who >= 0) bkNpcHappy(e.who);
    } else if (e.k === 'leave') banner('😢 ' + (e.who >= 0 ? BK_NPCS[e.who][0] : 'A customer') + ' got tired of waiting');
    bkHud();
  }
  function bkUnlockMsg(lv){ const t = BK_TP.find(t => t[3] + 1 === lv && t[3] > 0); return t ? '\n🆕 New topping: ' + t[1] + ' ' + t[2] : ''; }
  // host tick: ovens, order timers, new orders
  function bkTick(dt){
    if (!bk || bk.remote) return;
    bk.st.forEach(S => { if (S.ph === 'oven'){ S.ov = Math.max(0, S.ov - dt); if (S.ov <= 0){ S.ph = 'baked'; bk.dirty = true; } } });
    bk.orders.forEach(o => o.t -= dt);
    bk.orders.filter(o => o.t <= 0).forEach(o => bkEvent({id: ++bk.eid, k: 'leave', who: o.who}));
    bk.orders = bk.orders.filter(o => o.t > 0);
    bk.nextO -= dt; if (bk.orders.length < BK_OMAX && bk.nextO <= 0){ bkNewOrder(); bk.nextO = bk.orders.length < 2 ? 4 : 12; }
  }
  function bakeryWire(){ return {o: bk.orders.map(o => ({id: o.id, slot: o.slot, sh: o.sh, fl: o.fl, ti: o.ti, fr: o.fr, tp: o.tp, t: +o.t.toFixed(1), T: o.T, who: o.who})), s: bk.st, ev: bk.ev, lv: bk.lv}; }
  function bakeryFromHost(w){
    if (!w || typeof w !== 'object' || !bk || !bk.remote || mode !== 'bakery') return;
    const pick = (v, L) => bkKeys(L).includes(v) ? v : bkKeys(L)[0];
    bk.orders = (Array.isArray(w.o) ? w.o : []).slice(0, BK_OMAX).filter(o => o && typeof o === 'object').map(o => ({id: o.id | 0, slot: clamp(o.slot | 0, 0, 2), sh: pick(o.sh, BK_SH), fl: pick(o.fl, BK_FL), ti: o.ti === 2 ? 2 : 1, fr: pick(o.fr, BK_FR), tp: pick(o.tp, BK_TP), t: +o.t || 0, T: +o.T || 120, who: -1}));
    if (Array.isArray(w.s) && w.s.length === 3) bk.st = w.s.map(bkClean);
    bk.lv = clamp(w.lv | 0, 1, 99);
    const ev = Array.isArray(w.ev) ? w.ev.filter(e => e && typeof e === 'object' && Number.isInteger(e.id)) : [];
    if (!bk.synced){ bk.synced = true; ev.forEach(e => bk.seen.add(e.id)); }   // joining mid-shift: don't pay for cakes served before you came
    ev.forEach(e => bkEvent({id: e.id, k: e.k === 'leave' ? 'leave' : 'serve', c: clamp(e.c | 0, 0, 30), stars: clamp(e.stars | 0, 1, 5), m: clamp(e.m | 0, 0, 5), o: e.o | 0, who: -1}));
    if (bk.panel >= 0) bkPanelRender();
  }
  function bkDo(a){ if (!bk) return; if (bk.remote){ mpSendTo(mp.hconn, Object.assign({t: 'bkact'}, a)); return; } if (bkApply(bkUid(), a) && bk.panel >= 0) bkPanelRender(); }
  function bkGuestMsg(g, d){ if (!bk || mode !== 'bakery' || !running || bk.remote) return; bkApply(g.uid, {a: String(d.a || ''), st: d.st | 0, k: String(d.k || ''), v: d.v}); }
  /* --- 3D --- */
  function bkDeco(geo, col, x, y, z, par){ const m = new THREE.Mesh(geo, fmat(col)); m.position.set(x, y, z); (par || scene).add(m); return m; }
  function bkLayer(par, sh, s, y, col, h){
    if (sh === 'square') return [bkDeco(new THREE.BoxGeometry(1.3 * s, h, 1.3 * s), col, 0, y, 0, par)];
    if (sh === 'heart'){ const a = bkDeco(new THREE.CylinderGeometry(.42 * s, .42 * s, h, 16), col, -.3 * s, y, -.12 * s, par), b = bkDeco(new THREE.CylinderGeometry(.42 * s, .42 * s, h, 16), col, .3 * s, y, -.12 * s, par);
      const c = bkDeco(new THREE.BoxGeometry(.85 * s, h, .85 * s), col, 0, y, .2 * s, par); c.rotation.y = Math.PI / 4; return [a, b, c]; }
    return [bkDeco(new THREE.CylinderGeometry(.7 * s, .7 * s, h, 20), col, 0, y, 0, par)];
  }
  function bkCake(c){
    const g = new THREE.Group(), fl = (BK_FL.find(r => r[0] === c.fl) || BK_FL[0])[3], fr = c.fr ? BK_FR.find(r => r[0] === c.fr)[3] : null; let y = 0;
    for (let k = 0; k < c.ti; k++){ const s = k ? .68 : 1; bkLayer(g, c.sh || 'round', s, y + .22, fl, .44); if (fr){ bkLayer(g, c.sh || 'round', s * 1.04, y + .47, fr, .1); } y += .5; }
    const top = y + .02, R = c.ti === 2 ? .4 : .55;
    const dots = (n, f) => { for (let i = 0; i < n; i++){ const a = i / n * Math.PI * 2 + .3, r = R * (i % 2 ? .45 : .85); f(Math.cos(a) * r, Math.sin(a) * r, i); } };
    if (c.tp === 'sprinkles') dots(18, (x, z, i) => { const m = bkDeco(new THREE.BoxGeometry(.12, .04, .04), ['#ff4d4d', '#ffd23f', '#3a86ff', '#2ec27e', '#ff6fb5'][i % 5], x, top, z, g); m.rotation.y = i; });
    else if (c.tp === 'cherry') dots(5, (x, z) => bkDeco(new THREE.SphereGeometry(.1, 8, 6), '#d8344f', x, top + .08, z, g));
    else if (c.tp === 'candles') dots(5, (x, z) => { bkDeco(new THREE.CylinderGeometry(.035, .035, .3, 6), '#8cc8ff', x, top + .15, z, g); bkDeco(new THREE.SphereGeometry(.05, 6, 5), '#ffb02e', x, top + .34, z, g); });
    else if (c.tp === 'berries') dots(6, (x, z) => { const m = bkDeco(new THREE.ConeGeometry(.09, .18, 7), '#e8384f', x, top + .08, z, g); m.rotation.x = Math.PI; });
    else if (c.tp === 'stars') dots(5, (x, z) => bkDeco(new THREE.OctahedronGeometry(.11, 0), '#ffd23f', x, top + .12, z, g));
    else if (c.tp === 'rainbow') ['#ff4d4d', '#ff9f1c', '#ffd23f', '#2ec27e', '#3a86ff'].forEach((col, i) => { const m = new THREE.Mesh(new THREE.TorusGeometry(.42 - i * .06, .03, 6, 16, Math.PI), fmat(col)); m.position.set(0, top, 0); g.add(m); });
    return g;
  }
  function bkSig(S){ return [S.ph, S.sh, S.fl, S.ti, S.fr, S.tp].join(','); }
  function bkStationsDraw(){
    bk.st.forEach((S, i) => { const V = bk.vis[i], sig = bkSig(S); if (V.sig === sig) return; V.sig = sig;
      if (V.cake){ V.root.remove(V.cake); V.cake = null; }
      if (S.ph === 'empty' && !S.sh && !S.fl) { V.bowl.visible = true; return; }
      if (S.ph === 'oven'){ V.bowl.visible = false; return; }
      V.bowl.visible = S.ph === 'empty'; if (S.ph === 'empty') return;
      V.cake = bkCake(S); V.cake.position.set(0, 1.25, 0); V.root.add(V.cake); });
  }
  function bkNpcShow(){
    if (mp.on) return;
    bk.orders.forEach(o => { if (o.who < 0 || bk.npcM[o.id]) return; const N = BK_NPCS[o.who], m = buildPlayer(Object.assign({}, DEF, N[2])); m.g.position.set(BK_SLOTS[o.slot], .05, 5.2); m.g.rotation.y = Math.PI; scene.add(m.g);
      const lab = label(N[1] + ' ' + N[0], 'rgba(29,35,64,.75)'); lab.position.y = 3.6; m.g.add(lab); bk.npcM[o.id] = {m, t: 0, happy: 0}; });
    for (const id in bk.npcM){ if (!bk.orders.some(o => o.id === +id)){ const M = bk.npcM[id]; if (!M.bye){ M.bye = 1.2; } } }
  }
  function bkNpcHappy(who){ for (const id in bk.npcM){ const M = bk.npcM[id]; if (M.bye == null && !bk.orders.some(o => o.id === +id)){ M.happy = 1.2; } } }
  function buildBakery(){
    scene.background = new THREE.Color('#ffe4ef');
    const remote = mpGuest(), p = bkProg();
    bk = {remote, st: [bkEmpty(), bkEmpty(), bkEmpty()], orders: [], ev: [], seen: new Set(), lastEv: 0, eid: 0, oid: 0, nextO: 1.5, lv: bkLevel(p.served), panel: -1, near: -1, vis: [], npcM: {}, earned: 0, served: 0, team: 0, dirty: false, synced: false, t: 0};
    plat(0, 0, 0, 26, 26, '#f7d9c4', 1);
    for (let x = -12; x < 13; x += 2) for (let z = -12; z < 13; z += 2) if ((x + z) % 4 === 0) bkDeco(new THREE.BoxGeometry(2, .02, 2), '#f0c3a8', x + 1, .01, z + 1);
    [[0, -13, 26, .6], [-13, 0, .6, 26], [13, 0, .6, 26], [-8, 13, 10, .6], [8, 13, 10, .6]].forEach(([x, z, w, d]) => plat(x, 5, z, w, d, '#ffb3d1', 5, {noEdge: true}));
    plat(0, 6.2, 13, 6.2, .6, '#ffb3d1', 1.2, {noEdge: true});
    // striped awning over the counter + sign
    for (let i = 0; i < 9; i++) bkDeco(new THREE.BoxGeometry(2, .12, 2.4), i % 2 ? '#ffffff' : '#ff6fb5', -8 + i * 2, 4.2, 3.4);
    const sg = label('🧁 Sweet Team Bakery', 'rgba(255,111,181,.95)', '#fff', 420); sg.position.set(0, 5.6, 3); scene.add(sg);
    // counter (customers on the far side) with a gap at the right to walk round
    plat(-1.5, 1.1, 2, 21, 1.2, '#c98a55', 1.1); bkDeco(new THREE.BoxGeometry(21.2, .12, 1.4), '#fff4e6', -1.5, 1.16, 2);
    // cash register + display case
    bkDeco(new THREE.BoxGeometry(.9, .6, .7), '#ffd23f', 7.5, 1.5, 2); bkDeco(new THREE.BoxGeometry(.7, .3, .1), '#2ec27e', 7.5, 1.9, 1.7);
    plat(-11, 1.4, -2, 2, 6, '#ffffff', 1.4); bkDeco(new THREE.BoxGeometry(1.9, 1, 5.8), '#c0f0ff', -11, 1.9, -2).material = new THREE.MeshLambertMaterial({color: '#c0f0ff', transparent: true, opacity: .45});
    [-3.5, -1.5, .5].forEach((z, i) => { const c = bkCake({sh: ['round', 'heart', 'square'][i], fl: ['choc', 'straw', 'vanilla'][i], ti: i === 1 ? 2 : 1, fr: ['pink', 'white', 'mint'][i], tp: ['cherry', 'sprinkles', 'candles'][i]}); c.scale.setScalar(.6); c.position.set(-11, 1.42, z); scene.add(c); });
    // ovens along the back wall
    BK_ST.forEach(([x], i) => { plat(x, 2.4, -11.6, 3, 1.6, '#9aa0ab', 2.4); const door = bkDeco(new THREE.BoxGeometry(2.2, 1.2, .1), '#2b2d42', x, 1.3, -10.75); const glow = bkDeco(new THREE.BoxGeometry(1.8, .8, .05), '#ff9f1c', x, 1.3, -10.68); glow.visible = false;
      const lab = label('🔥 Oven ' + (i + 1), 'rgba(29,35,64,.8)', '#fff', 200); lab.scale.multiplyScalar(.6); lab.position.set(x, 3.2, -11); scene.add(lab);
      // decorating station: table + cake stand + mixing bowl
      const root = new THREE.Group(); root.position.set(x, 0, BK_ST[i][1]); scene.add(root);
      plat(x, 1, BK_ST[i][1], 2.6, 1.8, ['#ff8fc8', '#8cc8ff', '#9ff0c8'][i], 1);
      bkDeco(new THREE.CylinderGeometry(.75, .75, .06, 20), '#ffffff', 0, 1.06, 0, root); bkDeco(new THREE.CylinderGeometry(.08, .12, .15, 8), '#ffffff', 0, 1.15, 0, root);
      const bowl = bkDeco(new THREE.SphereGeometry(.45, 12, 8, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), '#ffd23f', .7, 1.45, .3, root); bowl.rotation.x = Math.PI;
      const tag = label('🎂 Station ' + (i + 1), 'rgba(255,111,181,.92)', '#fff', 220); tag.scale.multiplyScalar(.6); tag.position.set(0, 3, 0); root.add(tag);
      const timer = label('', 'rgba(29,35,64,.85)', '#fff', 160); timer.scale.multiplyScalar(.5); timer.position.set(0, 2.4, 0); timer.visible = false; root.add(timer);
      bk.vis.push({root, bowl, cake: null, sig: '', glow, timer, tt: ''}); });
    // ingredient shelves (just for fun)
    for (let i = 0; i < 8; i++) bkDeco(new THREE.CylinderGeometry(.25, .25, .6, 10), ['#ff6fb5', '#ffd23f', '#7bd389', '#8cc8ff', '#f6e3b4', '#6b3e1f', '#ff9f1c', '#c39bff'][i], 12.2, 1.6 + (i % 2) * 1.2, -8 + (i >> 1) * 2);
    plat(12.3, 1.3, -5, .8, 8, '#a0612e', .1); plat(12.3, 2.5, -5, .8, 8, '#a0612e', .1);
    checkpoints[0] = {idx: 0, spawn: {x: 0, y: .05, z: -1}, flag: new THREE.Object3D()};
  }
  function bakeryEnter(){ P.face = Math.PI; bk.remote = mpGuest(); bkHud(); }
  function bkNearest(){ let best = -1, bd = 2.6; BK_ST.forEach(([x, z], i) => { const d = Math.hypot(P.x - x, P.z - (z + 1.4)); if (d < bd){ bd = d; best = i; } }); return best; }
  function bakeryUpdate(dt){
    if (!bk) return; bk.t += dt; bkTick(dt); bkNpcShow();
    const n = bkNearest(); if (n !== bk.near){ bk.near = n; const b = $('#bkAct'); if (n >= 0 && bk.panel < 0){ b.innerHTML = '🎂 Station ' + (n + 1) + ' <small>' + (pad.on ? 'Ⓧ' : touchUI ? 'tap' : 'E') + '</small>'; b.classList.add('show'); } else b.classList.remove('show'); }
    if (bk.panel >= 0 && (bk.dirty || bk.t - (bk.prT || 0) > .5)){ bk.prT = bk.t; bkPanelRender(); }
    bk.dirty = false; bkHud();
  }
  function bakeryAnimate(dt){
    if (!bk) return; const t = worldT; bkStationsDraw();
    bk.st.forEach((S, i) => { const V = bk.vis[i]; V.glow.visible = S.ph === 'oven'; if (V.glow.visible) V.glow.material = fmat(Math.sin(t * 8) > 0 ? '#ff9f1c' : '#ffb02e');
      const tt = S.ph === 'oven' ? '🔥 ' + Math.ceil(S.ov) + 's' : S.ph === 'baked' && (!S.fr || !S.tp) ? '✨ Decorate me!' : S.ph === 'baked' ? '🛎️ Ready to serve' : ''; if (tt !== V.tt){ V.tt = tt; V.timer.visible = !!tt; if (tt){ V.root.remove(V.timer); V.timer = label(tt, 'rgba(29,35,64,.85)', '#fff', 200); V.timer.scale.multiplyScalar(.5); V.timer.position.set(0, 2.4, 0); V.root.add(V.timer); } }
      if (V.cake) V.cake.rotation.y = t * .5; });
    for (const id in bk.npcM){ const M = bk.npcM[id]; const g = M.m.g;
      if (M.bye != null){ M.bye -= dt; g.position.z += dt * 4; g.rotation.y = 0; if (M.bye <= 0){ scene.remove(g); delete bk.npcM[id]; } continue; }
      g.position.y = .05 + Math.abs(Math.sin(t * 2 + +id)) * .08; }
  }
  function bkHud(){ if (!bk) return; const s = '🎂 ' + bk.served + ' · 🏅 Lv ' + bk.lv; if ($('#bkN').textContent !== s) $('#bkN').textContent = s;
    const h = bk.orders.slice().sort((a, b) => a.slot - b.slot).map(o => '<div class="bkord">' + bkOrderTxt(o) + '<i style="width:' + Math.max(0, Math.round(o.t / o.T * 100)) + '%"></i></div>').join('') || '<div class="bkord">🛎️ Waiting for orders…</div>';
    if (bk.ordH !== h){ bk.ordH = h; $('#bkOrders').innerHTML = h; } }
  function bkOrderTxt(o){ const f = (L, v) => (L.find(r => r[0] === v) || ['', '?'])[1]; return (o.who >= 0 && !mp.on ? BK_NPCS[o.who][1] + ' ' : '🧾 ') + f(BK_SH, o.sh) + f(BK_FL, o.fl) + (o.ti === 2 ? '2️⃣' : '') + f(BK_FR, o.fr) + f(BK_TP, o.tp); }
  function bkPanel(i){ if (!bk) return; if (i < 0){ bk.panel = -1; $('#bkPanel').classList.remove('show'); choosing = false; bk.near = -2; return; }
    bk.panel = i; bkPanelRender(); choosing = true; for (const k in keys) keys[k] = false; joy.x = joy.y = 0; $('#bkPanel').classList.add('show'); $('#bkAct').classList.remove('show'); }
  function bkPanelRender(){
    const i = bk.panel; if (i < 0) return; const S = bk.st[i], ul = bkUnlocked(bk.lv);
    const row = (k, L, lab, on) => '<div class="fsrow"><b>' + lab + '</b>' + L.map(r => { const lock = k === 'tp' && !ul.includes(r[0]);
      return '<button class="bkb' + (S[k] === r[0] ? ' on' : '') + (lock ? ' lock' : '') + '" data-k="' + k + '" data-v="' + r[0] + '"' + (on && !lock ? '' : ' disabled') + '>' + (lock ? '🔒' : r[1]) + '<small>' + r[2] + (lock ? ' · Lv ' + (r[3] + 1) : '') + '</small></button>'; }).join('') + '</div>';
    let h = '<div class="fssub">' + (S.ph === 'empty' ? '1️⃣ Pick a shape, flavour & tiers, then bake it!' : S.ph === 'oven' ? '🔥 Baking... ' + Math.ceil(S.ov) + 's (decorate another station meanwhile!)' : '2️⃣ Frost it, top it, then serve it!') + '</div>';
    h += row('sh', BK_SH, 'Shape', S.ph === 'empty') + row('fl', BK_FL, 'Flavour', S.ph === 'empty') + row('ti', BK_TI, 'Size', S.ph === 'empty');
    h += row('fr', BK_FR, 'Frosting', S.ph === 'baked') + row('tp', BK_TP, 'Topping', S.ph === 'baked');
    h += '<div class="fssub">🧾 Orders: ' + (bk.orders.map(o => '<span class="bkot">' + bkOrderTxt(o) + ' <b>' + bkMatch(S, o) + '/5</b></span>').join(' ') || 'none yet') + '</div>';
    if (S.h.length > 1) h += '<div class="fssub">🤝 Team cake! ' + S.h.length + ' bakers helped</div>';
    const key = h + S.ph; if (bk.pkey === key) return; bk.pkey = key;
    $('#bkPT').textContent = '🎂 Station ' + (i + 1); $('#bkItems').innerHTML = h;
    $('#bkItems').querySelectorAll('.bkb').forEach(b => b.onclick = () => bkDo({a: 'set', st: i, k: b.dataset.k, v: b.dataset.k === 'ti' ? +b.dataset.v : b.dataset.v}));
    $('#bkBake').style.display = S.ph === 'empty' ? '' : 'none'; $('#bkBake').disabled = !(S.sh && S.fl);
    $('#bkServe').style.display = S.ph === 'baked' ? '' : 'none'; $('#bkServe').disabled = !(S.fr && S.tp);
  }
  function bkPad(jp){ if (!bk) return false; if (bk.panel >= 0) return false; if (jp[2]){ if (bk.near >= 0) bkPanel(bk.near); return true; } return false; }
  function bkKey(e){ if (!bk || e.repeat || paused) return false; if (e.code === 'KeyE'){ if (bk.panel >= 0) bkPanel(-1); else if (bk.near >= 0) bkPanel(bk.near); return true; } return false; }
  function bakeryStop(){ if (bk && bk.panel >= 0) choosing = false; bk = null; ['#bkAct', '#bkPanel'].forEach(id => { const e = $(id); if (e) e.classList.remove('show'); }); }
