  /* ===================== t227u: 🗼 TOWER OF DOOM — climb stacked sections while friendly bubbly goo rises ===================== */
  const TD_RULES = (typeof TDRules !== 'undefined' && TDRules) ? TDRules : ((typeof globalThis !== 'undefined' && globalThis.TDRules) || {});
  const TD_KEY = TD_RULES.TD_KEY || 'rubloxTower';
  const TD_SECTIONS = TD_RULES.TD_SECTIONS || 12;
  const TD_H = TD_RULES.TD_H || 7.2;
  const TD_GOO_BASE = (TD_RULES.TD_GOO_BASE != null) ? TD_RULES.TD_GOO_BASE : .16;
  const TD_GRACE = (TD_RULES.TD_GRACE != null) ? TD_RULES.TD_GRACE : 12;
  const TD_CP_GRACE = (TD_RULES.TD_CP_GRACE != null) ? TD_RULES.TD_CP_GRACE : 8;
  const TD_GOO_START = (TD_RULES.TD_GOO_START != null) ? TD_RULES.TD_GOO_START : -8;
  const TD_KINDS = TD_RULES.TD_KINDS || ['steps', 'beam', 'zig', 'pads', 'bridge', 'spin'];
  let td = null;
  function tdProg(){
    const o = load(TD_KEY, null);
    return TD_RULES.tdLoadProg ? TD_RULES.tdLoadProg(o) : {best: Math.max(0, (o && o.best) | 0), wins: Math.max(0, (o && o.wins) | 0), coins: Math.max(0, +(o && o.coins) || 0)};
  }
  function tdSeed(n){ return TD_RULES.tdSeed ? TD_RULES.tdSeed(n) : (function(){ let x = (n * 1103515245 + 12345) & 0x7fffffff; return () => { x = (x * 1103515245 + 12345) & 0x7fffffff; return (x >>> 0) / 0x7fffffff; }; })(); }
  function tdGooTop(){ return td ? td.goo : -99; }   // td.goo is the visible TOP surface of the goo
  function tdGooSpeed(){
    if (TD_RULES.tdGooSpeed) return TD_RULES.tdGooSpeed(Math.max(0, maxY));
    return TD_GOO_BASE + Math.min(0.06, Math.max(0, maxY) / 250);
  }
  function tdNoteBest(){
    if (!td) return;
    const reached = Math.max(0, Math.floor(maxY)), p = tdProg();
    if (reached > p.best){ p.best = reached; save(TD_KEY, p); }
  }
  function tdPlace(p, color){
    return plat(p.x, p.y, p.z, p.w, p.d, color, p.h || .5);
  }
  function buildTower(){
    const seed = ((Date.now() / 1000) | 0) % 99991;
    const layout = TD_RULES.tdLayout ? TD_RULES.tdLayout(seed) : null;
    td = {ph: 'play', t: 0, goo: TD_GOO_START, topY: (layout && layout.topY) || (TD_SECTIONS * TD_H + 6), paid: false, earned: 0, kind: (layout && layout.kinds) ? layout.kinds.slice() : [], near: -1, seed, grace: TD_GRACE, layout};
    scene.background = new THREE.Color('#b8e0ff');
    if (scene.fog){ scene.fog.color = new THREE.Color('#d7f0ff'); scene.fog.near = 40; scene.fog.far = 180; }
    // Rims so you can't walk off the start island into the void.
    [[0, 7.2, 14.4, .6], [0, -7.2, 14.4, .6], [7.2, 0, .6, 14.4], [-7.2, 0, .6, 14.4]].forEach(([x, z, w, d]) => plat(x, 1.1, z, w, d, '#ffe08a', 1.1));
    const colors = ['#c39bff', '#7fd6ff', '#ffb3c7', '#ffe08a', '#9ff0c8', '#ff9f6b'];
    if (layout){
      const rnd = tdSeed(seed);
      let cpAt = 0;
      for (const p of layout.plats){
        const col = p.role === 'checkpoint' || p.role === 'spawn' ? '#ffd23f'
          : p.role === 'island' || p.role === 'stair' ? '#8fd39a'
          : p.role === 'finish' ? '#2ec27e'
          : p.role === 'summit' ? '#fff0a8'
          : p.role === 'rail' ? '#ffffff'
          : colors[(p.section >= 0 ? p.section : 0) % 6];
        const b = tdPlace(p, col);
        if (p.role === 'checkpoint' || p.role === 'spawn'){
          const cp = checkpoint(b, cpAt++);
          if (p.role === 'spawn' && cp && typeof lightCp === 'function') lightCp(cp);
          if (p.role === 'checkpoint') coin(p.x, p.y + 1.8, p.z);
        }
        if (p.role === 'finish'){
          finish = {mesh: b.mesh, b, y: p.y + 0.4};
        }
        if (p.role === 'pad' || p.role === 'beam' || p.role === 'bridge' || p.role === 'spiral'){
          // a few coins along the climb, not on every pad
          if (rnd() < 0.35) coin(p.x, p.y + 1.6, p.z);
        }
      }
    }
    // goo cylinder: mesh center so its TOP face sits at td.goo (height 2.4 → centre = goo - 1.2)
    const goo = new THREE.Mesh(new THREE.CylinderGeometry(20, 20, 2.4, 28), new THREE.MeshLambertMaterial({color: '#b388ff', transparent: true, opacity: .9}));
    goo.position.set(0, td.goo - 1.2, -4); scene.add(goo); td.gooMesh = goo;
    Object.assign(P, {x: 0, y: .05, z: -5.5, vx: 0, vy: 0, vz: 0}); P.face = 0; cam.yaw = Math.PI; cam.pitch = .35; cam.dist = 10;
    topY = td.topY; maxY = 0;
  }
  function towerEnter(){ if (!td) return; td.ph = 'play'; td.t = 0; td.goo = TD_GOO_START; td.grace = TD_GRACE; td.paid = false; td.earned = 0; choosing = false; over = false;
    if (td.gooMesh) td.gooMesh.position.y = td.goo - 1.2;
    const lose = $('#oLose'); if (lose){ const em = lose.querySelector('.emoji'), h2 = lose.querySelector('h2'); if (em) em.textContent = '🫧'; if (h2) h2.textContent = 'The bubbly goo caught you!'; }
    banner('🗼 Tower of Doom! Climb at your own pace — gold pads are checkpoints, and the goo sends you back to one instead of ending the climb.'); tipTimer = 8; towerHud(); }
  function towerStop(){
    if (td && td.gooMesh) scene.remove(td.gooMesh); td = null;
    const lose = $('#oLose'); if (lose){ const em = lose.querySelector('.emoji'), h2 = lose.querySelector('h2'); if (em) em.textContent = '🔥'; if (h2) h2.textContent = 'The lava got you!'; }
  }
  function towerChecks(){
    if (!td || td.ph !== 'play' || over) return;
    for (const cp of checkpoints){
      if (cp && cp.idx > cpIndex && P.onGround && cp.b && P.ground === cp.b){
        cpIndex = cp.idx;
        if (typeof lightCp === 'function') lightCp(cp);
        if (typeof SND !== 'undefined' && SND.cp) SND.cp();
        td.grace = Math.max(td.grace || 0, TD_CP_GRACE);
        banner('🚩 Gold pad! The bubbly goo takes a rest. Checkpoint ' + cpIndex + '/' + Math.max(1, checkpoints.length - 1) + '!');
      }
    }
  }
  function towerGooHit(){
    if (!td || td.ph !== 'play' || over) return;
    tdNoteBest();
    if (typeof SND !== 'undefined' && SND.die) SND.die();
    const sp = (checkpoints[cpIndex] && checkpoints[cpIndex].spawn) || {x: 0, y: .05, z: -5.5};
    if (td.goo > sp.y - 1.2) td.goo = sp.y - 1.5;
    td.grace = Math.max(td.grace || 0, TD_CP_GRACE);
    if (td.gooMesh) td.gooMesh.position.y = td.goo - 1.2;
    if (typeof respawn === 'function') respawn();
    banner('🫧 The bubbly goo sent you back to a gold pad! It is taking a rest — keep climbing.');
    towerHud();
  }
  function towerUpdate(dt){
    if (!td || td.ph !== 'play' || over || choosing) return;
    td.t += dt; maxY = Math.max(maxY, P.y);
    tdNoteBest();
    if (td.grace > 0) td.grace -= dt;
    else {
      td.goo += tdGooSpeed() * dt;
    }
    if (td.gooMesh) td.gooMesh.position.y = td.goo - 1.2;
    // Touching goo bounces you to the last gold pad — it does not end the run.
    if (td.grace <= 0 && P.y < td.goo + .15){ towerGooHit(); return; }
    if (finish && P.y >= finish.y - .2 && Math.hypot(P.x, P.z + 8) < 3.2) towerWin();
    towerHud();
  }
  function towerAnimate(dt){ if (!td || !td.gooMesh) return; td.gooMesh.rotation.y += .004; }
  function towerLose(){
    // Kept for compatibility; goo hits no longer call this.
    if (over || choosing) return; over = true; choosing = true; td.ph = 'lose';
    tdNoteBest();
    const p = tdProg();
    const lose = $('#oLose'); if (lose){ const em = lose.querySelector('.emoji'), h2 = lose.querySelector('h2'); if (em) em.textContent = '🫧'; if (h2) h2.textContent = 'The bubbly goo caught you!'; lose.classList.add('show'); }
    $('#oLoseStats').innerHTML = '🗼 You climbed <b>' + Math.max(0, Math.floor(maxY)) + 'm</b>!<br>🏅 Best: <b>' + p.best + 'm</b><br>🫧 The bubbly goo caught you — try again!<br><small>Esc or 🏠 Home</small>';
  }
  function towerWin(){
    if (over || td.paid) return; over = true; choosing = true; td.ph = 'win'; td.paid = true;
    const bonus = 40 + Math.floor(maxY / 4), p = tdProg(); p.wins++; p.best = Math.max(p.best, Math.floor(maxY)); p.coins += bonus; save(TD_KEY, p);
    setCoins(coins + bonus); td.earned = bonus; runCoins = (runCoins || 0) + bonus; confetti(); SND.win();
    banner('🏆 Summit! You beat the Tower of Doom! +' + bonus + ' 🪙');
    $('#oWin').classList.add('show');
    $('#oWinStats').innerHTML = '🗼 Tower of Doom cleared!<br>⏱️ ' + fmt(td.t, true) + ' · 📏 ' + Math.floor(maxY) + 'm<br>🎁 +' + bonus + ' Rublox Coins';
  }
  function towerHud(){
    if (!td) return;
    const g = $('#tdGoo'), h = $('#tdH');
    if (h) h.textContent = Math.max(0, Math.floor(maxY));
    if (g){
      if (td.grace > 0) g.textContent = 'rests ' + Math.ceil(td.grace) + 's';
      else { const dist = P.y - td.goo; g.textContent = dist >= 0 ? Math.floor(dist) + 'm below' : 'back to pad'; }
    }
  }
  function tdPad(jp){ return false; }
  function tdKey(e){ if (!td || e.repeat) return false; if (e.code === 'Escape' && over && td.ph === 'lose'){ stop(); return true; } return false; }
