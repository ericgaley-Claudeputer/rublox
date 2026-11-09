  /* ===================== t227u: 👻 GIGGLE MANOR ESCAPE — mildly spooky puzzle rooms, friendly ghosts, escape before the timer ===================== */
  const HM_KEY = 'rubloxHaunt', HM_TIME = 180;
  let hm = null;
  function hmProg(){ const o = load(HM_KEY, null), r = o && typeof o === 'object' ? o : {}; return {escapes: Math.max(0, r.escapes | 0), best: Math.max(0, r.best | 0), coins: Math.max(0, +r.coins || 0)}; }
  function buildHaunt(){
    hm = {ph: 'play', t: HM_TIME, keys: 0, need: 3, pattern: [0, 2, 1, 3], pressed: [], colour: null, needCol: ['#ff6fb5', '#7fd6ff', '#ffe08a'][Math.random() * 3 | 0], levers: [false, false, false], doorOpen: false, ghosts: [], earned: 0, paid: false, remote: mpGuest(), near: -1};
    scene.background = new THREE.Color('#2a2450');
    if (scene.fog){ scene.fog.color = new THREE.Color('#3a3060'); scene.fog.near = 8; scene.fog.far = 55; }
    plat(0, 0, 0, 40, 40, '#4a3f6b', .4);
    // outer walls
    [[0, 20, 42, 1], [0, -20, 42, 1], [20, 0, 1, 42], [-20, 0, 1, 42]].forEach(([x, z, w, d]) => plat(x, 3, z, w, d, '#5b4d7a', 3));
    // three puzzle rooms + hall
    plat(-10, 3, 0, .6, 18, '#6b5b8a', 3); plat(10, 3, 0, .6, 18, '#6b5b8a', 3); plat(0, 3, 8, 20, .6, '#6b5b8a', 3);
    // key pedestals (room left)
    [[-14, -6], [-14, 0], [-14, 6]].forEach(([x, z], i) => { plat(x, .9, z, 1.4, 1.4, '#ffd23f', .9); const L = label('🔑 Key ' + (i + 1), 'rgba(255,210,63,.92)'); L.position.set(x, 2.2, z); scene.add(L); hm.ghosts.push({kind: 'key', i, x, z, got: false}); });
    // pattern pads (room right) — soft pastel, not scary
    const cols = ['#ffb3c7', '#9ff0c8', '#7fd6ff', '#ffe08a'];
    [[12, -4], [16, -4], [12, 0], [16, 0]].forEach(([x, z], i) => { plat(x, .5, z, 2, 2, cols[i], .4); const L = label('🎵 ' + (i + 1), 'rgba(127,214,255,.9)'); L.position.set(x, 1.8, z); scene.add(L); hm.ghosts.push({kind: 'pad', i, x, z}); });
    // colour ghosts (back room) — friendly cartoon blobs
    [['#ff6fb5', 'Pink'], ['#7fd6ff', 'Blue'], ['#ffe08a', 'Gold']].forEach(([c, n], i) => {
      const x = -6 + i * 6, z = 14; plat(x, .4, z, 2.2, 2.2, c, .35);
      const g = new THREE.Mesh(new THREE.SphereGeometry(1.1, 12, 10), new THREE.MeshLambertMaterial({color: c, transparent: true, opacity: .85})); g.position.set(x, 1.6, z); scene.add(g);
      const L = label('👻 ' + n, 'rgba(255,255,255,.9)'); L.position.set(x, 3.2, z); scene.add(L);
      hm.ghosts.push({kind: 'colour', i, x, z, col: c, mesh: g});
    });
    // levers near exit
    [[-3, -14], [0, -14], [3, -14]].forEach(([x, z], i) => { plat(x, 1.0, z, 1.2, 1.2, '#c39bff', 1.0); const L = label('🎚️ ' + (i + 1), 'rgba(195,155,255,.92)'); L.position.set(x, 2.4, z); scene.add(L); hm.ghosts.push({kind: 'lever', i, x, z}); });
    // exit door
    plat(0, 2.5, -18, 4, .8, '#ff9f6b', 2.5); const door = label('🚪 Exit', 'rgba(255,159,107,.95)'); door.position.set(0, 4.2, -18); scene.add(door); hm.door = {x: 0, z: -18};
    Object.assign(P, {x: 0, y: .05, z: 2, vx: 0, vy: 0, vz: 0}); P.face = Math.PI; cam.yaw = Math.PI; cam.pitch = .3; cam.dist = 10;
    checkpoints[0] = {idx: 0, spawn: {x: 0, y: .05, z: 2}, flag: new THREE.Object3D()};
  }
  function hauntEnter(){ if (!hm) return; hm.ph = 'play'; hm.t = HM_TIME; hm.paid = false; over = false; choosing = false;
    banner('👻 Giggle Manor! Find 3 keys, copy the song pads, hug the matching colour ghost, flip the levers — escape before time runs out!'); tipTimer = 8; hmHud(); }
  function hauntStop(){ hm = null; const b = $('#hmAct'); if (b) b.classList.remove('show'); }
  function hmNear(){
    if (!hm) return -1; let best = 2.4, idx = -1;
    hm.ghosts.forEach((g, i) => { if (g.got) return; const d = Math.hypot(P.x - g.x, P.z - g.z); if (d < best){ best = d; idx = i; } });
    return idx;
  }
  function hmAct(){
    if (!hm || hm.ph !== 'play' || over) return false;
    const i = hm.near; if (i < 0) return false; const g = hm.ghosts[i];
    if (g.kind === 'key'){ g.got = true; hm.keys++; banner('🔑 Key ' + (g.i + 1) + '! (' + hm.keys + '/' + hm.need + ')'); SND.coin(); hmHud(); return true; }
    if (g.kind === 'pad'){
      hm.pressed.push(g.i); banner('🎵 Pad ' + (g.i + 1)); SND.cp();
      const n = hm.pressed.length;
      if (hm.pressed[n - 1] !== hm.pattern[n - 1]){ hm.pressed = []; banner('😅 Oops — try the song again!'); }
      else if (n === hm.pattern.length){ banner('🎉 Song solved! The ghosts giggle!'); confetti(); hm.pressed = []; hm.patternDone = true; }
      hmHud(); return true;
    }
    if (g.kind === 'colour'){
      if (g.col === hm.needCol){ hm.colour = g.col; banner('👻 Perfect hug! Colour match!'); SND.coin(); confetti(); }
      else banner('👻 Heehee — try the ' + (hm.needCol === '#ff6fb5' ? 'Pink' : hm.needCol === '#7fd6ff' ? 'Blue' : 'Gold') + ' ghost!');
      hmHud(); return true;
    }
    if (g.kind === 'lever'){ hm.levers[g.i] = !hm.levers[g.i]; banner('🎚️ Lever ' + (g.i + 1) + (hm.levers[g.i] ? ' ON' : ' off')); SND.cp();
      if (hm.levers.every(Boolean)) banner('✨ All levers on!'); hmHud(); return true; }
    return false;
  }
  function hmReady(){ return hm && hm.keys >= hm.need && hm.patternDone && hm.colour === hm.needCol && hm.levers.every(Boolean); }
  function hauntUpdate(dt){
    if (!hm || hm.ph !== 'play' || over || choosing) return;
    hm.t -= dt; if (hm.t <= 0){ hmLose(); return; }
    hm.near = hmNear();
    const btn = $('#hmAct'); if (btn){ if (hm.near >= 0){ const g = hm.ghosts[hm.near]; btn.classList.add('show'); btn.innerHTML = (g.kind === 'key' ? '🔑 Take' : g.kind === 'pad' ? '🎵 Press' : g.kind === 'colour' ? '👻 Hug' : '🎚️ Flip') + '<small>E / Ⓧ</small>'; } else btn.classList.remove('show'); }
    // bob friendly ghosts
    hm.ghosts.forEach(g => { if (g.mesh) g.mesh.position.y = 1.6 + Math.sin(worldT * 2 + g.i) * .25; });
    if (hmReady()){ hm.doorOpen = true; if (Math.hypot(P.x - hm.door.x, P.z - hm.door.z) < 2.8) hmWin(); }
    hmHud();
  }
  function hauntAnimate(dt){}
  function hmLose(){ if (over) return; over = true; choosing = true; hm.ph = 'lose';
    $('#oLose').classList.add('show'); const em = $('#oLose').querySelector('.emoji'), h2 = $('#oLose').querySelector('h2'); if (em) em.textContent = '👻'; if (h2) h2.textContent = 'Time\'s up — the ghosts want a rematch!';
    $('#oLoseStats').innerHTML = '👻 So close! Keys ' + hm.keys + '/' + hm.need + '<br>Try again — they\'re friendly, promise!<br><small>Esc or 🏠 Home</small>'; }
  function hmWin(){
    if (over || hm.paid) return; over = true; choosing = true; hm.ph = 'win'; hm.paid = true;
    const left = Math.max(0, Math.floor(hm.t)), bonus = 35 + Math.floor(left / 3), p = hmProg(); p.escapes++; p.best = Math.max(p.best, left); p.coins += bonus; save(HM_KEY, p);
    setCoins(coins + bonus); hm.earned = bonus; runCoins = (runCoins || 0) + bonus; confetti(); SND.win();
    banner('🚪 Escaped Giggle Manor! +' + bonus + ' 🪙');
    $('#oWin').classList.add('show'); $('#oWinStats').innerHTML = '👻 Giggle Manor cleared!<br>⏱️ ' + left + 's left<br>🎁 +' + bonus + ' Rublox Coins'; }
  function hmHud(){ if (!hm) return; const n = $('#hmN'); if (n) n.textContent = '👻 🔑' + hm.keys + '/' + hm.need + (hm.patternDone ? ' · 🎵✓' : ' · 🎵') + (hm.colour === hm.needCol ? ' · 👻✓' : ' · 👻') + (hm.levers.every(Boolean) ? ' · 🎚️✓' : ' · 🎚️') + ' · ⏱️' + Math.max(0, Math.ceil(hm.t)); }
  function hmPad(jp){ if (!hm) return false; if (jp.x){ hmAct(); return true; } return false; }
  function hmKey(e){ if (!hm || e.repeat || paused) return false; if (e.code === 'KeyE'){ hmAct(); return true; } if (e.code === 'Escape' && over){ stop(); return true; } return false; }
