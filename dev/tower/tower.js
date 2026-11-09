  /* ===================== t227u: 🗼 TOWER OF DOOM — climb stacked obstacle sections while friendly bubbly goo rises ===================== */
  const TD_KEY = 'rubloxTower', TD_SECTIONS = 12, TD_H = 7.2, TD_GOO_BASE = .55;
  const TD_KINDS = ['steps', 'beam', 'zig', 'pads', 'bridge', 'spin'];
  let td = null;
  function tdProg(){ const o = load(TD_KEY, null), r = o && typeof o === 'object' ? o : {}; return {best: Math.max(0, r.best | 0), wins: Math.max(0, r.wins | 0), coins: Math.max(0, +r.coins || 0)}; }
  function tdSeed(n){ let x = (n * 1103515245 + 12345) & 0x7fffffff; return () => { x = (x * 1103515245 + 12345) & 0x7fffffff; return (x >>> 0) / 0x7fffffff; }; }
  function buildTower(){
    td = {ph: 'play', t: 0, goo: -2, topY: TD_SECTIONS * TD_H + 6, paid: false, earned: 0, kind: [], near: -1, seed: ((Date.now() / 1000) | 0) % 99991};
    scene.background = new THREE.Color('#b8e0ff');
    if (scene.fog){ scene.fog.color = new THREE.Color('#d7f0ff'); scene.fog.near = 40; scene.fog.far = 180; }
    plat(0, 0, 0, 14, 14, '#8fd39a', .4); plat(0, .4, -6, 4, 3, '#ffe08a', .3);
    const rnd = tdSeed(td.seed);
    for (let i = 0; i < TD_SECTIONS; i++){
      const y0 = 1.2 + i * TD_H, kind = TD_KINDS[(rnd() * TD_KINDS.length) | 0];
      td.kind[i] = kind;
      const col = ['#c39bff', '#7fd6ff', '#ffb3c7', '#ffe08a', '#9ff0c8', '#ff9f6b'][i % 6];
      if (kind === 'steps'){ for (let k = 0; k < 5; k++) plat(((k % 2) ? 1 : -1) * (2.2 + k * .15), y0 + k * 1.15, -k * 1.4, 2.6, 2.2, col, .55); }
      else if (kind === 'beam'){ plat(0, y0 + 1.2, -2, 1.3, 8, col, .45); plat(-3.2, y0 + 3.2, -6, 2.2, 2.2, col, .5); plat(3.2, y0 + 5.2, -8, 2.2, 2.2, col, .5); }
      else if (kind === 'zig'){ for (let k = 0; k < 4; k++) plat((k - 1.5) * 2.4, y0 + .8 + k * 1.4, -1 - k * 1.6, 2.4, 2.0, col, .5); }
      else if (kind === 'pads'){ for (let k = 0; k < 6; k++) plat(Math.sin(k * 1.3) * 3.5, y0 + .6 + k * 1.05, -k * 1.3, 1.8, 1.8, col, .45); }
      else if (kind === 'bridge'){ plat(-4, y0 + 1, -2, 2.2, 2.2, col, .5); plat(0, y0 + 2.4, -4, 6.5, 1.1, col, .4); plat(4, y0 + 4, -6, 2.2, 2.2, col, .5); }
      else { plat(0, y0 + 1.5, -3, 3.2, 3.2, col, .55); plat(0, y0 + 4.2, -6, 2.6, 2.6, col, .55); }
      plat(-5.5, y0 + 2, -4, .4, 6, '#ffffff', 3.2); plat(5.5, y0 + 2, -4, .4, 6, '#ffffff', 3.2);
      if ([3, 6, 9].includes(i + 1)){ plat(0, y0 + TD_H - .2, -8, 3.2, 3.2, '#ffd23f', .35); coin(0, y0 + TD_H + 1.6, -8); }
      else coin((rnd() - .5) * 4, y0 + 2.5, -3 - rnd() * 3);
    }
    const top = 1.2 + TD_SECTIONS * TD_H;
    plat(0, top, -8, 5, 5, '#fff0a8', .5); finish = {mesh: plat(0, top + .6, -8, 2.2, 2.2, '#2ec27e', .3).mesh, y: top + 1};
    const goo = new THREE.Mesh(new THREE.CylinderGeometry(18, 18, 2.4, 28), new THREE.MeshLambertMaterial({color: '#b388ff', transparent: true, opacity: .88}));
    goo.position.set(0, -2, -4); scene.add(goo); td.gooMesh = goo;
    Object.assign(P, {x: 0, y: .05, z: -5.5, vx: 0, vy: 0, vz: 0}); P.face = 0; cam.yaw = Math.PI; cam.pitch = .35; cam.dist = 10;
    topY = td.topY; maxY = 0;
    // spawn checkpoint so entry_wiring / start() don't throw
    plat(0, .5, -5.5, 2, 2, '#ffe08a', .2); checkpoints[0] = {idx: 0, spawn: {x: 0, y: .05, z: -5.5}, flag: new THREE.Object3D()};
  }
  function towerEnter(){ if (!td) return; td.ph = 'play'; td.t = 0; td.goo = -2; td.paid = false; td.earned = 0; choosing = false; over = false;
    banner('🗼 Tower of Doom! Climb past the bubbly goo — gold pads are checkpoints!'); tipTimer = 6; towerHud(); }
  function towerStop(){ if (td && td.gooMesh) scene.remove(td.gooMesh); td = null; }
  function towerUpdate(dt){
    if (!td || td.ph !== 'play' || over || choosing) return;
    td.t += dt; maxY = Math.max(maxY, P.y);
    const speed = TD_GOO_BASE + Math.min(1.6, maxY / 80);
    td.goo += speed * dt; if (td.gooMesh) td.gooMesh.position.y = td.goo - 1.1;
    if (P.y < td.goo + .35){ towerLose(); return; }
    if (finish && P.y >= finish.y - .2 && Math.hypot(P.x, P.z + 8) < 3.2) towerWin();
    towerHud();
  }
  function towerAnimate(dt){ if (!td || !td.gooMesh) return; td.gooMesh.rotation.y += .003; }
  function towerLose(){
    if (over || choosing) return; over = true; choosing = true; td.ph = 'lose';
    const reached = Math.floor(maxY), p = tdProg(); if (reached > p.best){ p.best = reached; save(TD_KEY, p); }
    $('#oLose').classList.add('show');
    $('#oLoseStats').innerHTML = '🗼 You climbed <b>' + reached + 'm</b>!<br>🏅 Best: <b>' + p.best + 'm</b><br>🫧 The bubbly goo caught you — try again!';
  }
  function towerWin(){
    if (over || td.paid) return; over = true; choosing = true; td.ph = 'win'; td.paid = true;
    const bonus = 40 + Math.floor(maxY / 4), p = tdProg(); p.wins++; p.best = Math.max(p.best, Math.floor(maxY)); p.coins += bonus; save(TD_KEY, p);
    setCoins(coins + bonus); td.earned = bonus; runCoins = (runCoins || 0) + bonus; confetti(); SND.win();
    banner('🏆 Summit! You beat the Tower of Doom! +' + bonus + ' 🪙');
    $('#oWin').classList.add('show');
    $('#oWinStats').innerHTML = '🗼 Tower of Doom cleared!<br>⏱️ ' + fmt(td.t, true) + ' · 📏 ' + Math.floor(maxY) + 'm<br>🎁 +' + bonus + ' Rublox Coins';
  }
  function towerHud(){ if (!td) return; const g = $('#tdGoo'), h = $('#tdH'); if (g) g.textContent = Math.max(0, Math.floor(td.goo)); if (h) h.textContent = Math.max(0, Math.floor(maxY)); }
  function tdPad(jp){ return false; }
  function tdKey(e){ return false; }
