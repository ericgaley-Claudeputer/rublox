  /* ===================== t214u: 🌊 SPLASH SUMMIT WATER PARK — giant slides + lazy-river float races ===================== */
  const WP_KEY = 'rubloxWaterPark';
  const WP_SLIDE_PAY = 3, WP_RACE_PAY = [15, 10, 6, 3], WP_BEST_PAY = 10, WP_RACES_DAY = 3, WP_LAPS = 3, WP_CP = 6;
  const WP_NPCS = [['Splashy Sam', '🐬', {head: '#f1c27d', shirt: '#3ac6ff', pants: '#ffd23f', hair: 'spiky', hairColor: '#e9b949'}], ['Bubbles', '🫧', {head: '#ffdbac', shirt: '#ff6fb5', pants: '#8b5cf6', hair: 'pigtails', hairColor: '#8a3b12'}], ['Captain Kai', '⚓', {head: '#8d5524', shirt: '#2ec27e', pants: '#1d2340', hair: 'short', hairColor: '#1d1d1d'}]];
  let wp = null;
  // --- curves (Catmull-Rom through control points, sampled by distance) ---
  function wpPath(ctrl, closed, per){
    per = per || 16; const n = ctrl.length, pts = [], P0 = i => ctrl[closed ? (i + n) % n : Math.max(0, Math.min(n - 1, i))];
    const segs = closed ? n : n - 1;
    for (let s = 0; s < segs; s++){ const a = P0(s - 1), b = P0(s), c = P0(s + 1), d = P0(s + 2);
      for (let k = 0; k < per; k++){ const t = k / per, t2 = t * t, t3 = t2 * t, f = i => .5 * ((2 * b[i]) + (-a[i] + c[i]) * t + (2 * a[i] - 5 * b[i] + 4 * c[i] - d[i]) * t2 + (-a[i] + 3 * b[i] - 3 * c[i] + d[i]) * t3);
        pts.push([f(0), f(1), f(2)]); } }
    if (!closed) pts.push(ctrl[n - 1].slice()); else pts.push(pts[0].slice());
    const cum = [0]; for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1], pts[i][2] - pts[i - 1][2]));
    return {pts, cum, L: cum[cum.length - 1], closed};
  }
  function wpAt(p, d){
    if (p.closed) d = ((d % p.L) + p.L) % p.L; else d = Math.max(0, Math.min(p.L, d));
    let lo = 0, hi = p.cum.length - 1; while (hi - lo > 1){ const m = (lo + hi) >> 1; if (p.cum[m] <= d) lo = m; else hi = m; }
    const a = p.pts[lo], b = p.pts[hi], seg = p.cum[hi] - p.cum[lo] || 1, t = (d - p.cum[lo]) / seg;
    return {x: a[0] + (b[0] - a[0]) * t, y: a[1] + (b[1] - a[1]) * t, z: a[2] + (b[2] - a[2]) * t, h: Math.atan2(b[0] - a[0], b[2] - a[2])};
  }
  function wpTwister(){ const c = [], cx = -22, cz = -12; for (let i = 0; i <= 20; i++){ const a = i / 20 * Math.PI * 5; c.push([cx + Math.cos(a) * 5, 14 - i / 20 * 13, cz + Math.sin(a) * 5]); } c.push([-22, .7, 1]); c.push([-22, .45, 6]); return c; }
  const WP_SLIDES = [
    {id: 'twister', name: 'Tornado Twister', e: '🌀', col: '#8b5cf6', ctrl: wpTwister(), tower: [-22, -12, 14], pad: [-30, -12], exit: [-17.5, 9], pool: [-22, 7]},
    {id: 'drop', name: 'Mega Drop', e: '⚡', col: '#ff4d5e', ctrl: [[0, 18, -30], [0, 17.6, -27.5], [0, 12, -22], [0, 4.5, -15], [0, 1, -8.5], [0, .5, -3.5], [0, .45, 0]], tower: [0, -32, 18], pad: [6, -32], exit: [4.5, 2.5], pool: [0, 1]},
    {id: 'rainbow', name: 'Rainbow Wave', e: '🌈', col: '#ffd23f', ctrl: [[22, 12, -14], [22, 11.5, -11], [26.5, 8.5, -6.5], [19.5, 6.5, -1.5], [26.5, 4.2, 3.5], [20.5, 2.2, 8], [23, .7, 12], [23, .45, 15]], tower: [22, -16, 12], pad: [29, -16], exit: [27.5, 17.5], pool: [23, 15]},
  ];
  const WP_RIVER = [[-30, 0, 22], [0, 0, 21], [30, 0, 22], [37, 0, 30], [30, 0, 38], [0, 0, 39], [-30, 0, 38], [-37, 0, 30]];
  const WP_DOCK = [0, 18];
  function wpDay(){ return new Date().toDateString(); }
  function wpProg(){
    const o = load(WP_KEY, null), r = o && typeof o === 'object' ? o : {}, day = wpDay(), same = r.day === day;
    const rides = {}; WP_SLIDES.forEach(s => rides[s.id] = Math.max(0, (r.rides && r.rides[s.id]) | 0));
    return {day, rides, paid: same && Array.isArray(r.paid) ? r.paid.filter(id => WP_SLIDES.some(s => s.id === id)) : [], races: same ? Math.max(0, Math.min(WP_RACES_DAY, r.races | 0)) : 0,
      best: +r.best > 0 ? +r.best : 0, raced: Math.max(0, r.raced | 0), wins: Math.max(0, r.wins | 0), coins: Math.max(0, +r.coins || 0)};
  }
  function wpSave(p){ save(WP_KEY, p); }
  const wpUid = () => mp.on ? mp.me : 'H';
  function wpPay(n){ if (n <= 0) return; setCoins(coins + n); runCoins = (runCoins || 0) + n; wp.earned += n; const p = wpProg(); p.coins += n; wpSave(p); SND.coin(); }
  const wpFmt = s => (s / 60 | 0) + ':' + ('0' + (s % 60).toFixed(1)).slice(-4);
  // --- slides ---
  function wpRideStart(i){
    if (!wp || wp.ride || wp.race.me) return false; const S = WP_SLIDES[i]; if (!S) return false;
    wp.ride = {i, d: 0, v: 4, t: 0}; const a = wpAt(S.path, 0); Object.assign(P, {x: a.x, y: a.y + .35, z: a.z, vx: 0, vy: 0, vz: 0}); P.face = a.h;
    wpMenu(false); banner(S.e + ' ' + S.name + '! Wheeee!'); SND.jump && SND.jump(); return true;
  }
  function wpRideStep(dt){
    const R = wp.ride, S = WP_SLIDES[R.i], y0 = S.path.pts[0][1]; R.t += dt;
    const a0 = wpAt(S.path, R.d); R.v = Math.max(5, Math.min(19, 5 + Math.sqrt(Math.max(0, 2 * 9.8 * (y0 - a0.y))) * .8)); R.d += R.v * dt;
    const a = wpAt(S.path, R.d); Object.assign(P, {x: a.x, y: a.y + .35, z: a.z, vx: 0, vy: 0, vz: 0}); P.face = a.h; P.onGround = false;
    if (typeof cam !== 'undefined') cam.yaw += (((a.h + Math.PI) - cam.yaw + Math.PI * 3) % (Math.PI * 2) - Math.PI) * Math.min(1, dt * 3);
    if (R.d >= S.path.L) wpRideEnd();
  }
  function wpRideEnd(){
    const S = WP_SLIDES[wp.ride.i], t = wp.ride.t; wp.ride = null;
    Object.assign(P, {x: S.exit[0], y: .05, z: S.exit[1], vx: 0, vy: 5, vz: 0}); P.onGround = false;
    wpSplash(S.pool[0], .3, S.pool[1], 22);
    const p = wpProg(); p.rides[S.id]++; let pay = 0; if (!p.paid.includes(S.id)){ p.paid.push(S.id); pay = WP_SLIDE_PAY; } wpSave(p);
    if (pay) wpPay(pay);
    banner('💦 SPLASH! ' + S.name + ' in ' + t.toFixed(1) + 's' + (pay ? ' · +' + pay + ' 🪙 (first ride today)' : ' · ride #' + p.rides[S.id]));
    wpHud();
  }
  // --- float race ---
  function wpRaceNew(n){ return {ph: 'idle', n: n || 0, t: 0, me: null, npcs: [], prog: {}, fin: {}, res: null, endT: 0, paid: false}; }
  function wpRacer(lane){ return {d: -lane * 2.2 - 1, off: [-1.6, 1.6, -.5, .5, 0][lane % 5], v: 0, boost: 0, cd: 0, cp: 0, lap: 0, fin: 0, sp: 0}; }
  function wpRaceStart(){   // solo or host: start a countdown
    if (!wp || wp.ride || (mp.on && !mp.host)) return false; if (wp.race.ph === 'count' || wp.race.ph === 'go') return false;
    const n = wp.race.n + 1; wp.race = wpRaceNew(n); wp.race.ph = 'count'; wp.race.t = 3.5; wpRaceJoin(0); wpMenu(false);
    if (!mp.on) wp.race.npcs = WP_NPCS.map((N, i) => Object.assign(wpRacer(i + 1), {u: 'n' + i, base: 9.2 + i * .35 + Math.random() * .5, m: wpNpcModel(i)}));
    banner('🛟 Float race! ' + WP_LAPS + ' laps of the Lazy River — steer into the ⚡ rings!'); return true;
  }
  function wpRaceJoin(lane){ wp.race.me = wpRacer(lane); wp.race.me.u = wpUid(); const a = wpAt(wp.river, wp.race.me.d); Object.assign(P, {x: a.x, y: .25, z: a.z, vx: 0, vy: 0, vz: 0}); P.face = a.h; if (wp.floatM) wp.floatM.visible = true; }
  function wpInput(){
    const steer = (keys.KeyD || keys.ArrowRight ? 1 : 0) - (keys.KeyA || keys.ArrowLeft ? 1 : 0) + (joy.x || 0) + (pad.x || 0);
    const fwd = (keys.KeyW || keys.ArrowUp ? 1 : 0) + Math.max(0, joy.y || 0) + Math.max(0, pad.y || 0);
    return {steer: Math.max(-1, Math.min(1, steer)), fwd: Math.max(0, Math.min(1, fwd)), paddle: !!(keys.Space || joy.jump || pad.jump)};
  }
  // advance one racer (player or NPC); returns true when it crosses the finish
  function wpRacerStep(r, dt, inp, now){
    if (r.fin) { r.d += 3 * dt; return false; }
    r.cd = Math.max(0, r.cd - dt); r.boost = Math.max(0, r.boost - dt);
    if (inp.paddle && r.cd <= 0){ r.cd = 1.2; r.boost = Math.max(r.boost, .6); }
    const target = (r.base || 8.6) + inp.fwd * 2.6 + (r.boost > 0 ? 5 : 0); r.v += (target - r.v) * Math.min(1, dt * 2.5); r.sp = r.v;
    r.off = Math.max(-2.4, Math.min(2.4, r.off + inp.steer * 4 * dt));
    const before = r.d; r.d += r.v * dt; const L = wp.river.L;
    wp.rings.forEach(g => { const rd = g.d; for (let k = 0; k <= WP_LAPS; k++){ const x = rd + k * L; if (before < x && r.d >= x && Math.abs(r.off - g.off) < 1.15){ r.boost = 1.6; if (r === wp.race.me){ SND.boing && SND.boing(); banner('⚡ BOOST!'); } } } });
    const cpLen = L / WP_CP, cp = Math.floor(Math.max(0, r.d) / cpLen); if (cp > r.cp){ r.cp = cp; if (r === wp.race.me && cp % WP_CP !== 0) SND.cp(); }
    const lap = Math.floor(Math.max(0, r.d) / L); if (lap > r.lap){ r.lap = lap; if (r === wp.race.me && lap < WP_LAPS) banner('🏁 Lap ' + (lap + 1) + '/' + WP_LAPS + ' · ' + wpFmt(now)); }
    if (r.d >= WP_LAPS * L){ r.fin = now; return true; } return false;
  }
  function wpNpcInput(r, t){ const ring = wp.rings.find(g => { const x = ((g.d - r.d) % wp.river.L + wp.river.L) % wp.river.L; return x < 14; }); const want = ring ? ring.off : Math.sin(t * .4 + r.base) * 1.2;
    return {steer: Math.max(-1, Math.min(1, (want - r.off) * 1.5)), fwd: .55 + .45 * Math.sin(t * .7 + r.base * 3), paddle: Math.random() < .015}; }
  function wpRaceStep(dt){
    const R = wp.race, me = R.me; if (!me) return;
    if (R.ph === 'count'){ const a = wpAt(wp.river, me.d), nx = Math.cos(a.h), nz = -Math.sin(a.h); Object.assign(P, {x: a.x + nx * me.off, y: .25, z: a.z + nz * me.off, vx: 0, vy: 0, vz: 0}); P.face = a.h; return; }
    if (R.ph !== 'go' && !(R.ph === 'done' && !me.fin)) return;
    if (!me.fin && wpRacerStep(me, dt, wpInput(), R.t)) wpFinish();
    const a = wpAt(wp.river, me.d), nx = Math.cos(a.h), nz = -Math.sin(a.h);
    Object.assign(P, {x: a.x + nx * me.off, y: .25 + Math.sin(worldT * 3) * .05, z: a.z + nz * me.off, vx: 0, vy: 0, vz: 0}); P.face = a.h; P.onGround = true;
    if (typeof cam !== 'undefined') cam.yaw += (((a.h + Math.PI) - cam.yaw + Math.PI * 3) % (Math.PI * 2) - Math.PI) * Math.min(1, dt * 2.5);
  }
  function wpFinish(){
    const R = wp.race, me = R.me; R.fin[me.u] = +me.fin.toFixed(2); SND.win && SND.win();
    if (mp.on && !mp.host) mpSendTo(mp.hconn, {t: 'wpprog', n: R.n, d: +me.d.toFixed(1), fin: R.fin[me.u]});
    banner('🏁 FINISH! ' + wpFmt(me.fin)); if (!mp.on) wpSoloResults();
  }
  function wpSoloResults(){
    const R = wp.race, all = [R.me].concat(R.npcs);
    R.npcs.forEach(n => { if (!n.fin){ const left = WP_LAPS * wp.river.L - n.d; n.fin = R.t + Math.max(.5, left / Math.max(6, n.v)); } });
    R.res = all.slice().sort((a, b) => a.fin - b.fin).map(r => [r.u, +r.fin.toFixed(2)]); R.ph = 'done'; R.endT = 6; wpPaid();
  }
  // host: rank everyone (finished by time, then by distance) — guests are paid from this list
  function wpHostResults(){ const R = wp.race, us = Object.keys(R.prog);
    R.res = us.map(u => [u, R.fin[u] || 0, R.prog[u] || 0]).sort((a, b) => (a[1] && b[1]) ? a[1] - b[1] : a[1] ? -1 : b[1] ? 1 : b[2] - a[2]).map(r => [r[0], r[1]]); R.ph = 'done'; R.endT = 7; wpPaid(); }
  function wpPaid(){
    const R = wp.race; if (R.paid || !R.res) return; R.paid = true; const me = wpUid(), k = R.res.findIndex(r => r[0] === me); if (k < 0) return;
    const t = R.res[k][1], p = wpProg(); p.raced++; if (k === 0 && R.res.length > 1) p.wins++;
    let pay = 0, msg = ''; const newBest = t > 0 && (!p.best || t < p.best);
    if (p.races < WP_RACES_DAY){ p.races++; pay = WP_RACE_PAY[k] || 2; if (newBest) pay += WP_BEST_PAY; msg = ' · +' + pay + ' 🪙'; } else msg = ' · (race coins maxed for today)';
    if (newBest) p.best = t; wpSave(p); wpPay(pay);
    banner((['🥇 You won', '🥈 2nd place', '🥉 3rd place'][k] || '🏁 Place ' + (k + 1)) + (t ? ' · ' + wpFmt(t) : '') + (newBest ? ' · ⭐ NEW BEST!' : '') + msg);
    if (k === 0 || newBest) confetti(); wpHud();
  }
  function wpRaceTick(dt){
    const R = wp.race; if (R.ph === 'idle') return; R.t += dt;
    if (R.ph === 'count'){ R.t -= dt; R.t -= dt; const s = Math.ceil(R.t); if (s !== R.lastS){ R.lastS = s; if (s > 0) banner(s === 3 ? '3️⃣' : s === 2 ? '2️⃣' : '1️⃣'); }
      if (R.t <= 0){ R.ph = 'go'; R.t = 0; banner('💦 GO! Paddle with Space / Ⓐ / ⬆️'); } return; }
    if (R.ph === 'go'){
      R.npcs.forEach(n => { if (!n.fin) wpRacerStep(n, dt, wpNpcInput(n, R.t), R.t); });
      if (wp.race.me) R.prog[wp.race.me.u] = wp.race.me.d;
      if (mp.on && mp.host){ const us = Object.keys(R.prog), done = us.filter(u => R.fin[u]).length; if (done && !R.firstFin) R.firstFin = R.t; if ((us.length && done === us.length) || (R.firstFin && R.t - R.firstFin > 45) || R.t > 300) wpHostResults(); }
      if (mp.on && !mp.host && R.me && !R.me.fin && (R.sendT = (R.sendT || 0) - dt) <= 0){ R.sendT = .3; mpSendTo(mp.hconn, {t: 'wpprog', n: R.n, d: +R.me.d.toFixed(1), fin: 0}); }
    }
    if (R.ph === 'done'){ R.endT -= dt; if (R.endT <= 0 && (!mp.on || mp.host)) wpRaceEnd(); }
  }
  function wpRaceEnd(){ const n = wp.race.n; wp.race.npcs.forEach(r => r.m && scene.remove(r.m.g)); const wasIn = !!wp.race.me; wp.race = wpRaceNew(n); if (wp.floatM) wp.floatM.visible = false;
    if (wasIn){ Object.assign(P, {x: WP_DOCK[0] + 3, y: .05, z: WP_DOCK[1] - 2, vx: 0, vy: 0, vz: 0}); P.face = Math.PI; } wpHud(); }
  function wpGuestMsg(g, d){ if (!wp || !mp.host || d.t !== 'wpprog' || (d.n | 0) !== wp.race.n || wp.race.ph !== 'go') return;
    wp.race.prog[g.uid] = Math.max(wp.race.prog[g.uid] || 0, Math.min(WP_LAPS * wp.river.L + 50, +d.d || 0)); if (+d.fin > 3 && !wp.race.fin[g.uid]) wp.race.fin[g.uid] = Math.min(999, +d.fin); }
  function waterparkWire(){ const R = wp.race; return {ph: R.ph, n: R.n, t: +R.t.toFixed(2), res: R.res, prog: R.prog}; }
  function waterparkFromHost(w){
    if (!wp || !w || typeof w !== 'object' || !mp.on || mp.host || mode !== 'waterpark') return;
    const n = w.n | 0, ph = ['idle', 'count', 'go', 'done'].includes(w.ph) ? w.ph : 'idle';
    if (!wp.synced){ wp.synced = true; wp.race.n = n; if (ph !== 'idle') return; }   // joined mid-race: wait for the next one
    if (n > wp.race.n && ph === 'count'){ wp.race = wpRaceNew(n); wp.race.ph = 'count'; wp.race.t = Math.max(0, +w.t || 0); if (wp.ride) wp.ride = null; wpMenu(false); wpRaceJoin(1 + (Math.abs(String(mp.me).split('').reduce((a, c) => a + c.charCodeAt(0), 0)) % 4)); banner('🛟 The host started a float race!'); return; }
    if (n !== wp.race.n) return; const R = wp.race;
    if (ph === 'go' && R.ph === 'count'){ R.ph = 'go'; R.t = Math.max(0, +w.t || 0); banner('💦 GO!'); }
    if (ph === 'done' && Array.isArray(w.res)){ R.res = w.res.filter(r => Array.isArray(r) && typeof r[0] === 'string').slice(0, 8).map(r => [r[0], Math.max(0, Math.min(999, +r[1] || 0))]); R.ph = 'done'; wpPaid(); }
    if (ph === 'idle' && R.ph !== 'idle') wpRaceEnd();
    R.standings = w.prog && typeof w.prog === 'object' ? w.prog : {};
  }
  // --- world ---
  function wpDeco(geo, col, x, y, z, par){ const m = new THREE.Mesh(geo, fmat(col)); m.position.set(x, y, z); (par || scene).add(m); return m; }
  function wpWaterMat(){ return new THREE.MeshLambertMaterial({color: '#3ac6ff', transparent: true, opacity: .85}); }
  function wpNpcModel(i){ const N = WP_NPCS[i], m = buildPlayer(Object.assign({}, DEF, N[2])); scene.add(m.g); const f = wpDeco(new THREE.TorusGeometry(.75, .28, 8, 16), ['#ff9f1c', '#ff6fb5', '#2ec27e'][i], 0, .9, 0, m.g); f.rotation.x = Math.PI / 2;
    const lab = label(N[1] + ' ' + N[0], 'rgba(29,35,64,.75)'); lab.position.y = 3.5; m.g.add(lab); return m; }
  function wpSplash(x, y, z, n){ for (let i = 0; i < n; i++){ const m = new THREE.Mesh(new THREE.SphereGeometry(.12, 5, 4), new THREE.MeshBasicMaterial({color: i % 2 ? '#ffffff' : '#8ce0ff', transparent: true})); m.position.set(x, y, z); scene.add(m);
      const a = Math.random() * 6.28, s = 1.5 + Math.random() * 3; wp.fx.push({m, vx: Math.cos(a) * s, vy: 4 + Math.random() * 4, vz: Math.sin(a) * s, t: 1.2}); } }
  function buildWaterPark(){
    scene.background = new THREE.Color('#aee8ff');
    wp = {river: wpPath(WP_RIVER, true, 18), ride: null, race: wpRaceNew(0), rings: [], fx: [], menu: false, near: null, earned: 0, synced: false, floatM: null};
    WP_SLIDES.forEach(S => S.path = wpPath(S.ctrl, false, 14));
    plat(0, 0, 0, 100, 100, '#f2e6c9', 2);
    for (let x = -48; x < 49; x += 4) for (let z = -48; z < 49; z += 4) if (((x + z) / 4) % 2 === 0) wpDeco(new THREE.BoxGeometry(4, .02, 4), '#e8d9b5', x + 2, .01, z + 2);
    [[0, -50, 100, 1], [0, 50, 100, 1], [-50, 0, 1, 100], [50, 0, 1, 100]].forEach(([x, z, w, d]) => plat(x, 2.5, z, w, d, '#7bd389', 2.5, {noEdge: true}));
    const sg = label('🌊 Splash Summit Water Park', 'rgba(58,198,255,.95)', '#fff', 440); sg.position.set(0, 5.5, 8); scene.add(sg);
    // slides: tower, coloured tube, supports, splash pool, entry pad
    WP_SLIDES.forEach((S, i) => {
      const [tx, tz, th] = S.tower; plat(tx, th - .4, tz, 3.2, 3.2, '#9aa0ab', th - .4); wpDeco(new THREE.ConeGeometry(2.6, 2, 4), S.col, tx, th + 1.6, tz).rotation.y = Math.PI / 4;
      const v = S.path.pts.map(p => new THREE.Vector3(p[0], p[1], p[2])), curve = new THREE.CatmullRomCurve3(v);
      const tube = new THREE.Mesh(new THREE.TubeGeometry(curve, Math.max(40, S.path.pts.length), .95, 10, false), new THREE.MeshLambertMaterial({color: S.col, transparent: true, opacity: .55, side: THREE.DoubleSide})); scene.add(tube);
      for (let k = 6; k < S.path.pts.length - 2; k += 6){ const p = S.path.pts[k]; if (p[1] > 1.2) wpDeco(new THREE.CylinderGeometry(.12, .12, p[1] - .9, 6), '#ffffff', p[0], (p[1] - .9) / 2, p[2]); }
      const pool = new THREE.Mesh(new THREE.CylinderGeometry(3.6, 3.6, .1, 24), wpWaterMat()); pool.position.set(S.pool[0], .05, S.pool[1]); scene.add(pool);
      wpDeco(new THREE.TorusGeometry(3.6, .25, 6, 24), '#ffffff', S.pool[0], .12, S.pool[1]).rotation.x = Math.PI / 2;
      const pad = wpDeco(new THREE.CylinderGeometry(1.3, 1.3, .14, 18), S.col, S.pad[0], .07, S.pad[1]); S.padM = pad;
      const l = label(S.e + ' ' + S.name, 'rgba(29,35,64,.85)', '#fff', 300); l.scale.multiplyScalar(.7); l.position.set(S.pad[0], 2.6, S.pad[1]); scene.add(l);
      const ex = label('🚪 Exit', 'rgba(46,194,126,.9)', '#fff', 140); ex.scale.multiplyScalar(.45); ex.position.set(S.exit[0], 1.6, S.exit[1]); scene.add(ex); });
    // lazy river loop + checkpoint arches + boost rings
    const R = wp.river, wm = wpWaterMat();
    for (let d = 0; d < R.L; d += 1.6){ const a = wpAt(R, d), m = new THREE.Mesh(new THREE.BoxGeometry(6.4, .06, 1.9), wm); m.position.set(a.x, .03, a.z); m.rotation.y = a.h; scene.add(m); }
    for (let k = 0; k < WP_CP; k++){ const a = wpAt(R, k * R.L / WP_CP), nx = Math.cos(a.h), nz = -Math.sin(a.h), col = k === 0 ? '#ffffff' : ['#ff4d5e', '#ffd23f', '#2ec27e', '#3a86ff', '#8b5cf6'][k % 5];
      [-1, 1].forEach(s => wpDeco(new THREE.CylinderGeometry(.18, .18, 3.6, 6), col, a.x + nx * 3.4 * s, 1.8, a.z + nz * 3.4 * s));
      const top = wpDeco(new THREE.BoxGeometry(7.2, .35, .35), col, a.x, 3.6, a.z); top.rotation.y = a.h + Math.PI / 2 - Math.PI / 2; top.rotation.y = Math.atan2(nx, nz) + Math.PI / 2;
      if (k === 0){ const f = label('🏁 START / FINISH', 'rgba(29,35,64,.85)', '#fff', 260); f.scale.multiplyScalar(.6); f.position.set(a.x, 4.6, a.z); scene.add(f); } }
    [.12, .3, .47, .63, .8, .93].forEach((q, i) => { const d = q * R.L, off = [1.5, -1.5, 0, -1.6, 1.4, -.4][i], a = wpAt(R, d), nx = Math.cos(a.h), nz = -Math.sin(a.h);
      const ring = wpDeco(new THREE.TorusGeometry(.8, .12, 6, 16), '#ffd23f', a.x + nx * off, .9, a.z + nz * off); ring.rotation.y = a.h; wp.rings.push({d, off, m: ring}); });
    // race dock + float you ride on
    const dk = wpDeco(new THREE.CylinderGeometry(1.4, 1.4, .14, 18), '#ff9f1c', WP_DOCK[0], .07, WP_DOCK[1]); const dl = label('🛟 Float Race', 'rgba(29,35,64,.85)', '#fff', 240); dl.scale.multiplyScalar(.7); dl.position.set(WP_DOCK[0], 2.6, WP_DOCK[1]); scene.add(dl);
    const fl = new THREE.Group(); wpDeco(new THREE.TorusGeometry(.75, .28, 8, 16), '#ff4d5e', 0, 0, 0, fl).rotation.x = Math.PI / 2; fl.visible = false; scene.add(fl); wp.floatM = fl;
    // palms + umbrellas + loungers
    [[-40, -40], [40, -40], [-42, 5], [42, 5], [-12, 8], [12, 8], [-40, 44], [40, 44]].forEach(([x, z], i) => { plat(x, 4, z, .5, .5, '#a0703e', 4); for (let k = 0; k < 5; k++){ const a = k / 5 * 6.28, l = wpDeco(new THREE.BoxGeometry(2.2, .08, .6), '#3fa34d', x + Math.cos(a), 4.1, z + Math.sin(a)); l.rotation.y = -a; l.rotation.z = -.3; } });
    [[-8, 4, '#ff6fb5'], [8, 4, '#3ac6ff'], [-36, 14, '#ffd23f'], [36, 12, '#2ec27e']].forEach(([x, z, c]) => { wpDeco(new THREE.CylinderGeometry(.06, .06, 3, 6), '#ffffff', x, 1.5, z); wpDeco(new THREE.ConeGeometry(1.8, .7, 10), c, x, 3.1, z); plat(x + 1.6, .4, z, 1, 2.2, '#ffffff', .4); });
    checkpoints[0] = {idx: 0, spawn: {x: 0, y: .05, z: 10}, flag: new THREE.Object3D()};
  }
  function waterparkEnter(){ P.face = Math.PI; wpHud(); }
  function wpStep(dt){ if (!wp) return false; if (wp.ride){ wpRideStep(dt); return true; } if (wp.race.me && wp.race.ph !== 'idle'){ wpRaceStep(dt); return true; } return false; }
  function wpNearest(){ if (wp.ride || wp.race.me) return null; for (let i = 0; i < WP_SLIDES.length; i++){ const S = WP_SLIDES[i]; if (Math.hypot(P.x - S.pad[0], P.z - S.pad[1]) < 2.2) return {k: 'slide', i, t: S.e + ' Ride ' + S.name}; }
    if (Math.hypot(P.x - WP_DOCK[0], P.z - WP_DOCK[1]) < 2.2) return {k: 'race', t: mp.on && !mp.host ? '🛟 Race starts when the host is ready' : '🛟 Start a float race'}; return null; }
  function wpAct(){ if (!wp || paused || choosing) return false; const c = wpNearest(); if (!c) return false; if (c.k === 'slide') return wpRideStart(c.i); if (c.k === 'race') return wpRaceStart() || true; return false; }
  function waterparkUpdate(dt){
    if (!wp) return; wpRaceTick(dt);
    const c = wpNearest(), t = c ? c.t : ''; if (t !== wp.nearT){ wp.nearT = t; const b = $('#wpAct'); if (c){ b.innerHTML = t + ' <small>' + (pad.on ? 'Ⓧ' : touchUI ? 'tap' : 'E') + '</small>'; b.classList.add('show'); } else b.classList.remove('show'); }
    wpHud();
  }
  function waterparkAnimate(dt){
    if (!wp) return; const t = worldT, R = wp.race;
    wp.rings.forEach((g, i) => g.m.rotation.z = t * 2 + i);
    if (wp.floatM && wp.floatM.visible){ wp.floatM.position.set(P.x, P.y + .55, P.z); }
    R.npcs.forEach(n => { const a = wpAt(wp.river, n.d), nx = Math.cos(a.h), nz = -Math.sin(a.h); n.m.g.position.set(a.x + nx * n.off, .25 + Math.sin(t * 3 + n.base) * .05, a.z + nz * n.off); n.m.g.rotation.y = a.h; });
    wp.fx = wp.fx.filter(b => { b.t -= dt; b.vy -= 9 * dt; b.m.position.x += b.vx * dt; b.m.position.y = Math.max(.05, b.m.position.y + b.vy * dt); b.m.position.z += b.vz * dt; b.m.material.opacity = Math.min(1, b.t);
      if (b.t <= 0){ scene.remove(b.m); b.m.geometry.dispose(); b.m.material.dispose(); return false; } return true; });
  }
  function wpHud(){ if (!wp) return; const R = wp.race, me = R.me; let s;
    if (wp.ride) s = WP_SLIDES[wp.ride.i].e + ' ' + WP_SLIDES[wp.ride.i].name;
    else if (me && R.ph === 'count') s = '🛟 Get ready… ' + Math.max(1, Math.ceil(R.t));
    else if (me && (R.ph === 'go' || R.ph === 'done')){ const lap = Math.min(WP_LAPS, Math.floor(Math.max(0, me.d) / wp.river.L) + 1), cp = Math.floor(Math.max(0, me.d) / (wp.river.L / WP_CP)) % WP_CP;
      const all = [[me.u, me.d]].concat(R.npcs.map(n => [n.u, n.d])).concat(Object.entries(R.standings || R.prog || {}).filter(([u]) => u !== me.u)), place = 1 + all.filter(([u, d]) => u !== me.u && d > me.d).length;
      s = '🛟 Lap ' + lap + '/' + WP_LAPS + ' · 🚩 ' + cp + '/' + WP_CP + ' · ⏱️ ' + wpFmt(me.fin || R.t) + ' · #' + place; }
    else { const p = wpProg(); s = '🌊 Water Park · 🏆 best ' + (p.best ? wpFmt(p.best) : '—') + ' · 🛟 ' + p.races + '/' + WP_RACES_DAY + ' paid races today'; }
    if ($('#wpN').textContent !== s) $('#wpN').textContent = s; }
  function wpMenu(open){
    if (!wp) return; wp.menu = open === undefined ? !wp.menu : open; if (!wp.menu){ $('#wpPanel').classList.remove('show'); return; }
    const p = wpProg(), busy = !!(wp.ride || wp.race.me);
    $('#wpList').innerHTML = WP_SLIDES.map((S, i) => '<button class="big wprb" data-i="' + i + '"' + (busy ? ' disabled' : '') + '>' + S.e + ' ' + S.name + '<small>' + (p.paid.includes(S.id) ? 'ridden today · ' : '+' + WP_SLIDE_PAY + ' 🪙 first ride today · ') + p.rides[S.id] + ' rides</small></button>').join('')
      + '<button class="big blue wprb" data-i="race"' + (busy || (mp.on && !mp.host) ? ' disabled' : '') + '>🛟 Float Race (' + WP_LAPS + ' laps)<small>' + (mp.on && !mp.host ? 'the host starts races' : 'best ' + (p.best ? wpFmt(p.best) : '—') + ' · paid races left today: ' + (WP_RACES_DAY - p.races)) + '</small></button>';
    $('#wpList').querySelectorAll('.wprb').forEach(b => b.onclick = () => b.dataset.i === 'race' ? wpRaceStart() : wpRideStart(+b.dataset.i));
    $('#wpPanel').classList.add('show');
  }
  function wpPad(jp){ if (!wp) return false; if (wp.menu) { if (jp[3]){ wpMenu(false); return true; } return false; } if (wp.ride || (wp.race.me && wp.race.ph !== 'idle')) return false; if (jp[2]) return wpAct() || true; if (jp[3]){ wpMenu(true); return true; } return false; }
  function wpKey(e){ if (!wp || e.repeat || paused) return false; if (e.code === 'KeyE' && !wp.menu) return wpAct(); if (e.code === 'KeyR' && !wp.ride && !wp.race.me){ wpMenu(); return true; } if (e.code === 'Escape' && wp.menu){ wpMenu(false); return true; } return false; }
  function waterparkStop(){ if (wp){ wp.fx.forEach(b => scene.remove(b.m)); wp.race.npcs.forEach(r => r.m && scene.remove(r.m.g)); } wp = null; ['#wpAct', '#wpPanel'].forEach(id => { const e = $(id); if (e) e.classList.remove('show'); }); }
