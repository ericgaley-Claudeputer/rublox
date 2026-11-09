  /* ===================== t227u: 👻 GIGGLE MANOR — polish: facing, cam min, camSkip walls, sticky levers ===================== */
  const HM_KEY = 'rubloxHaunt', HM_TIME = 180, HM_PICK = 1.8, HM_NEAR = 3.2;
  const HM_COLS = [
    {hex: '#ff6fb5', name: 'PINK', e: '💗'},
    {hex: '#7fd6ff', name: 'BLUE', e: '💙'},
    {hex: '#9ff0c8', name: 'GREEN', e: '💚'}
  ];
  let hm = null;
  function hmProg(){ const o = load(HM_KEY, null), r = o && typeof o === 'object' ? o : {}; return {escapes: Math.max(0, r.escapes | 0), best: Math.max(0, r.best | 0), coins: Math.max(0, +r.coins || 0)}; }
  function hmColInfo(){ return HM_COLS.find(c => c.hex === (hm && hm.needCol)) || HM_COLS[0]; }
  function hmWall(x, top, z, w, d, h, col){
    const p = plat(x, top, z, w, d, col || '#6b5b8a', h);
    // camera may pass through room dividers at doorways instead of sitting inside them
    p.camSkip = true;
    if (p.mesh && p.mesh.material){ p.mesh.material.transparent = true; p.mesh.material.opacity = .78; }
    return p;
  }
  function buildHaunt(){
    const pick = HM_COLS[Math.random() * HM_COLS.length | 0];
    hm = {ph: 'play', t: HM_TIME, keys: 0, need: 3, pattern: [0, 2, 1, 3], pressed: [], colour: null, needCol: pick.hex, levers: [false, false, false], doorOpen: false, ghosts: [], earned: 0, paid: false, remote: mpGuest(), near: -1, beacon: null, step: 'keys'};
    scene.background = new THREE.Color('#2a2450');
    if (scene.fog){ scene.fog.color = new THREE.Color('#3a3060'); scene.fog.near = 10; scene.fog.far = 60; }
    plat(0, 0, 0, 44, 44, '#4a3f6b', .4);
    // outer walls (solid for player+camera — keep occlusion)
    [[0, 22, 46, 1], [0, -22, 46, 1], [22, 0, 1, 46], [-22, 0, 1, 46]].forEach(([x, z, w, d]) => plat(x, 3, z, w, d, '#5b4d7a', 3));
    // room dividers WITH doorways (gaps); camSkip so camera never nests in the wall at a doorway
    hmWall(-10, 3, -8, .6, 8, 3); hmWall(-10, 3, 8, .6, 8, 3);
    hmWall(10, 3, -8, .6, 8, 3); hmWall(10, 3, 8, .6, 8, 3);
    hmWall(-10, 3, 8, 8, .6, 3); hmWall(10, 3, 8, 8, .6, 3);
    [[-10, 0], [10, 0], [0, 8]].forEach(([x, z]) => plat(x, .08, z, 2.4, 2.4, '#c39bff', .08));
    [[-14, -6], [-14, 0], [-14, 6]].forEach(([x, z], i) => {
      plat(x, .9, z, 1.6, 1.6, '#ffd23f', .9);
      const L = label('🔑 Key ' + (i + 1), 'rgba(255,210,63,.92)'); L.position.set(x, 2.3, z); scene.add(L);
      hm.ghosts.push({kind: 'key', i, x, z, got: false, label: L});
    });
    const cols = ['#ffb3c7', '#9ff0c8', '#7fd6ff', '#ffe08a'];
    [[12, -4], [16, -4], [12, 0], [16, 0]].forEach(([x, z], i) => {
      plat(x, .5, z, 2.2, 2.2, cols[i], .4);
      const L = label('🎵 ' + (i + 1), 'rgba(127,214,255,.9)'); L.position.set(x, 1.9, z); scene.add(L);
      hm.ghosts.push({kind: 'pad', i, x, z});
    });
    HM_COLS.forEach((c, i) => {
      const x = -6 + i * 6, z = 14; plat(x, .4, z, 2.4, 2.4, c.hex, .35);
      const g = new THREE.Mesh(new THREE.SphereGeometry(1.15, 12, 10), new THREE.MeshLambertMaterial({color: c.hex, transparent: true, opacity: .88}));
      g.position.set(x, 1.7, z); scene.add(g);
      const L = label(c.e + ' ' + c.name, 'rgba(255,255,255,.92)'); L.position.set(x, 3.3, z); scene.add(L);
      hm.ghosts.push({kind: 'colour', i, x, z, col: c.hex, name: c.name, e: c.e, mesh: g});
    });
    // larger lever pads for forgiving collision
    [[-3, -14], [0, -14], [3, -14]].forEach(([x, z], i) => {
      plat(x, 1.0, z, 2.0, 2.0, '#c39bff', 1.0);
      const L = label('🎚️ ' + (i + 1), 'rgba(195,155,255,.92)'); L.position.set(x, 2.5, z); scene.add(L);
      hm.ghosts.push({kind: 'lever', i, x, z});
    });
    plat(0, 2.6, -19, 4.2, .8, '#ff9f6b', 2.6);
    const door = label('🚪 Exit', 'rgba(255,159,107,.95)'); door.position.set(0, 4.3, -19); scene.add(door);
    hm.door = {x: 0, z: -19};
    const beacon = new THREE.Mesh(new THREE.ConeGeometry(.55, 1.2, 4), new THREE.MeshLambertMaterial({color: '#ffd23f', emissive: '#aa8800'}));
    beacon.rotation.x = Math.PI; scene.add(beacon); hm.beacon = beacon;
    // Face +z (ghost room / "north" of the manor). yaw=π puts camera on −z looking toward +z — away from levers.
    Object.assign(P, {x: 0, y: .05, z: 2, vx: 0, vy: 0, vz: 0}); P.face = 0; cam.yaw = Math.PI; cam.pitch = .38; cam.dist = 12;
    checkpoints[0] = {idx: 0, spawn: {x: 0, y: .05, z: 2}, flag: new THREE.Object3D()};
  }
  function hmObjective(){
    if (!hm) return null;
    if (hm.keys < hm.need){ const k = hm.ghosts.find(g => g.kind === 'key' && !g.got); return k ? {x: k.x, z: k.z, tip: '🔑 Get Key ' + (k.i + 1) + ' (' + hm.keys + '/' + hm.need + ') — walk onto it or press E'} : null; }
    if (!hm.patternDone){ const next = hm.pattern[hm.pressed.length] | 0; const pad = hm.ghosts.find(g => g.kind === 'pad' && g.i === next); return pad ? {x: pad.x, z: pad.z, tip: '🎵 Song time! Step on pad ' + (next + 1) + ' (order: ' + hm.pattern.map(n => n + 1).join('-') + ')'} : null; }
    if (hm.colour !== hm.needCol){ const c = hmColInfo(); const g = hm.ghosts.find(x => x.kind === 'colour' && x.col === hm.needCol); return g ? {x: g.x, z: g.z, tip: 'Hug the ' + c.e + ' ' + c.name + ' ghost!'} : null; }
    if (!hm.levers.every(Boolean)){ const L = hm.ghosts.find(g => g.kind === 'lever' && !hm.levers[g.i]); return L ? {x: L.x, z: L.z, tip: '🎚️ Flip lever ' + (L.i + 1) + ' — turn all three ON'} : null; }
    return {x: hm.door.x, z: hm.door.z, tip: '🚪 Door open — run to the Exit!'};
  }
  function hauntEnter(){
    if (!hm) return; hm.ph = 'play'; hm.t = HM_TIME; hm.paid = false; over = false; choosing = false;
    cam.yaw = Math.PI; cam.dist = Math.max(cam.dist, 11); cam.pitch = .38;
    const c = hmColInfo();
    banner('👻 Giggle Manor! Later you will hug the ' + c.e + ' ' + c.name + ' ghost. First: grab 3 keys!');
    tipTimer = 10; hmTip(); hmHud();
  }
  function hmTip(){ const o = hmObjective(); if (o){ $('#oTip').classList.remove('hide'); $('#oTip').innerHTML = '👻 ' + o.tip; tipTimer = 8; } }
  function hauntStop(){ if (hm && hm.beacon) scene.remove(hm.beacon); hm = null; const b = $('#hmAct'); if (b) b.classList.remove('show'); }
  function hmNear(){
    if (!hm) return -1; let best = HM_NEAR, idx = -1;
    hm.ghosts.forEach((g, i) => {
      if (g.got) return;
      if (g.kind === 'lever' && hm.levers[g.i]) return; // already ON — don't prompt again
      const d = Math.hypot(P.x - g.x, P.z - g.z); if (d < best){ best = d; idx = i; }
    });
    return idx;
  }
  function hmTakeKey(g){
    if (!g || g.got || g.kind !== 'key') return false;
    g.got = true; hm.keys++; if (g.label) g.label.visible = false;
    banner('🔑 Key ' + (g.i + 1) + '! (' + hm.keys + '/' + hm.need + ')'); SND.coin(); hmHud(); hmTip(); return true;
  }
  function hmAct(){
    if (!hm || hm.ph !== 'play' || over) return false;
    const i = hm.near; if (i < 0) return false; const g = hm.ghosts[i];
    if (g.kind === 'key') return hmTakeKey(g);
    if (g.kind === 'pad'){
      hm.pressed.push(g.i); banner('🎵 Pad ' + (g.i + 1)); SND.cp();
      const n = hm.pressed.length;
      if (hm.pressed[n - 1] !== hm.pattern[n - 1]){ hm.pressed = []; banner('😅 Oops — try the song again! Order ' + hm.pattern.map(x => x + 1).join('-')); }
      else if (n === hm.pattern.length){ banner('🎉 Song solved!'); confetti(); hm.pressed = []; hm.patternDone = true; }
      hmHud(); hmTip(); return true;
    }
    if (g.kind === 'colour'){
      const c = hmColInfo();
      if (g.col === hm.needCol){ hm.colour = g.col; banner('👻 Perfect hug! ' + c.e + ' ' + c.name + '!'); SND.coin(); confetti(); }
      else banner('👻 Heehee — hug the ' + c.e + ' ' + c.name + ' ghost!');
      hmHud(); hmTip(); return true;
    }
    if (g.kind === 'lever'){
      if (hm.levers[g.i]){ banner('🎚️ Lever ' + (g.i + 1) + ' already ON'); return true; }
      hm.levers[g.i] = true; banner('🎚️ Lever ' + (g.i + 1) + ' ON'); SND.cp();
      if (hm.levers.every(Boolean)) banner('✨ All levers on!'); hmHud(); hmTip(); return true;
    }
    return false;
  }
  function hmReady(){ return hm && hm.keys >= hm.need && hm.patternDone && hm.colour === hm.needCol && hm.levers.every(Boolean); }
  function hauntUpdate(dt){
    if (!hm || hm.ph !== 'play' || over || choosing) return;
    hm.t -= dt; if (hm.t <= 0){ hmLose(); return; }
    // camera comfort — never collapse into the avatar/walls (pairs with updateCamera haunt min)
    if (cam.dist < 11) cam.dist += (11 - cam.dist) * Math.min(1, dt * 4);
    if (cam.pitch < .32) cam.pitch += (.32 - cam.pitch) * Math.min(1, dt * 3);
    hm.ghosts.forEach(g => { if (g.kind === 'key' && !g.got && Math.hypot(P.x - g.x, P.z - g.z) <= HM_PICK) hmTakeKey(g); });
    hm.near = hmNear();
    const btn = $('#hmAct'); if (btn){ if (hm.near >= 0){ const g = hm.ghosts[hm.near]; btn.classList.add('show'); btn.innerHTML = (g.kind === 'key' ? '🔑 Take' : g.kind === 'pad' ? '🎵 Press' : g.kind === 'colour' ? '👻 Hug' : '🎚️ Flip') + '<small>E / Ⓧ</small>'; } else btn.classList.remove('show'); }
    hm.ghosts.forEach(g => { if (g.mesh) g.mesh.position.y = 1.7 + Math.sin(worldT * 2 + g.i) * .28; });
    const obj = hmObjective();
    if (hm.beacon && obj){ hm.beacon.visible = true; hm.beacon.position.set(obj.x, 3.2 + Math.sin(worldT * 3) * .35, obj.z); hm.beacon.rotation.y += dt * 2; }
    else if (hm.beacon) hm.beacon.visible = false;
    if (hmReady()){ hm.doorOpen = true; if (Math.hypot(P.x - hm.door.x, P.z - hm.door.z) < 2.8) hmWin(); }
    hmHud();
  }
  function hauntAnimate(dt){}
  function hmLose(){ if (over) return; over = true; choosing = true; hm.ph = 'lose';
    const lose = $('#oLose'); if (lose){ const em = lose.querySelector('.emoji'), h2 = lose.querySelector('h2'); if (em) em.textContent = '👻'; if (h2) h2.textContent = 'Time\'s up — rematch with the giggles!'; lose.classList.add('show'); }
    $('#oLoseStats').innerHTML = '👻 Keys ' + hm.keys + '/' + hm.need + '<br>They\'re friendly — try again!<br><small>Esc opens pause → Home</small>'; }
  function hmWin(){
    if (over || hm.paid) return; over = true; choosing = true; hm.ph = 'win'; hm.paid = true;
    const left = Math.max(0, Math.floor(hm.t)), bonus = 35 + Math.floor(left / 3), p = hmProg(); p.escapes++; p.best = Math.max(p.best, left); p.coins += bonus; save(HM_KEY, p);
    setCoins(coins + bonus); hm.earned = bonus; runCoins = (runCoins || 0) + bonus; confetti(); SND.win();
    banner('🚪 Escaped Giggle Manor! +' + bonus + ' 🪙');
    const em = $('#oWinEmoji'), title = $('#oWinTitle'); if (em) em.textContent = '👻'; if (title) title.textContent = 'You escaped Giggle Manor!';
    $('#oWin').classList.add('show'); $('#oWinStats').innerHTML = '👻 Giggle Manor cleared!<br>⏱️ ' + left + 's left<br>🎁 +' + bonus + ' Rublox Coins'; }
  function hmHud(){ if (!hm) return; const n = $('#hmN'); if (!n) return;
    const c = hmColInfo();
    n.textContent = '👻 🔑' + hm.keys + '/' + hm.need + (hm.patternDone ? ' · 🎵✓' : ' · 🎵') + (hm.colour === hm.needCol ? ' · ' + c.e + '✓' : ' · ' + c.e) + (hm.levers.every(Boolean) ? ' · 🎚️✓' : ' · 🎚️') + ' · ⏱️' + Math.max(0, Math.ceil(hm.t)); }
  function hmPad(jp){ if (!hm) return false; if (jp.x){ hmAct(); return true; } return false; }
  function hmKey(e){ if (!hm || e.repeat || paused) return false; if (e.code === 'KeyE'){ hmAct(); return true; } return false; }
