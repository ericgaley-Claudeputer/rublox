  /* ===================== t227u: 🐴 CLOVER MEADOW STABLES — adopt an original pony, brush/feed/groom, ride the meadow, jumping shows ===================== */
  const SB_KEY = 'rubloxStable';
  const SB_PONIES = [
    {id: 'buttercup', name: 'Buttercup', e: '🌼', coat: '#f6e3b4', mane: '#ff9f1c', eye: '#3a86ff', mark: 'star'},
    {id: 'thistle', name: 'Thistle', e: '💜', coat: '#c39bff', mane: '#5b34c0', eye: '#2ec27e', mark: 'heart'},
    {id: 'maple', name: 'Maple', e: '🍁', coat: '#d4a574', mane: '#7a4a1f', eye: '#ff6fb5', mark: 'blaze'},
    {id: 'sky', name: 'Sky', e: '☁️', coat: '#bfe3ff', mane: '#3a86ff', eye: '#1d2340', mark: 'socks'},
    {id: 'pepper', name: 'Pepper', e: '🖤', coat: '#3a3a48', mane: '#1d1d1d', eye: '#ffd23f', mark: 'star'},
    {id: 'petal', name: 'Petal', e: '🌸', coat: '#ffb3c7', mane: '#ff6fb5', eye: '#8b5cf6', mark: 'heart'}
  ];
  const SB_CARE = [['brush', '🪥', 'Brush', 'shine'], ['feed', '🥕', 'Feed', 'energy'], ['groom', '✨', 'Groom', 'mood']];
  const SB_JUMPS = 8, SB_SHOW_T = 90;
  let sb = null;
  function sbProg(){
    const o = load(SB_KEY, null), r = o && typeof o === 'object' ? o : {};
    const pony = r.pony && SB_PONIES.some(p => p.id === r.pony.id) ? {id: r.pony.id, name: String(r.pony.name || '').slice(0, 16) || SB_PONIES.find(p => p.id === r.pony.id).name,
      shine: Math.max(0, Math.min(100, +r.pony.shine || 70)), energy: Math.max(0, Math.min(100, +r.pony.energy || 70)), mood: Math.max(0, Math.min(100, +r.pony.mood || 70))} : null;
    return {pony, shows: Math.max(0, r.shows | 0), best: Math.max(0, r.best | 0), coins: Math.max(0, +r.coins || 0)};
  }
  function sbSave(p){ save(SB_KEY, p); }
  function sbPonyOf(id){ return SB_PONIES.find(p => p.id === id) || SB_PONIES[0]; }
  function sbMesh(pony, x, z){
    const def = sbPonyOf(pony.id), g = new THREE.Group(); g.position.set(x, 0, z); scene.add(g);
    const body = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.1, .9), new THREE.MeshLambertMaterial({color: def.coat})); body.position.y = 1.1; g.add(body);
    const neck = new THREE.Mesh(new THREE.BoxGeometry(.45, .9, .45), new THREE.MeshLambertMaterial({color: def.coat})); neck.position.set(.85, 1.7, 0); g.add(neck);
    const head = new THREE.Mesh(new THREE.BoxGeometry(.55, .5, .5), new THREE.MeshLambertMaterial({color: def.coat})); head.position.set(1.2, 2.15, 0); g.add(head);
    const mane = new THREE.Mesh(new THREE.BoxGeometry(.3, .9, .55), new THREE.MeshLambertMaterial({color: def.mane})); mane.position.set(.7, 1.85, 0); g.add(mane);
    [[-.5, .55, .35], [-.5, .55, -.35], [.4, .55, .35], [.4, .55, -.35]].forEach(([a, b, c]) => { const leg = new THREE.Mesh(new THREE.BoxGeometry(.22, 1.1, .22), new THREE.MeshLambertMaterial({color: shade(def.coat, -20)})); leg.position.set(a, b, c); g.add(leg); });
    return g;
  }
  function buildStable(){
    const prog = sbProg();
    sb = {ph: prog.pony ? 'care' : 'pick', t: 0, pony: prog.pony, mesh: null, near: -1, panel: false, show: null, score: 0, jumps: [], ridden: false, earned: 0, gates: []};
    scene.background = new THREE.Color('#c8e8ff');
    plat(0, 0, 0, 60, 60, '#8fd39a', .35);           // meadow
    // stable barn
    plat(-14, 3, -8, 12, 10, '#d4a574', 3); plat(-14, 6.2, -8, 13, 11, '#8a5a3c', .5);
    plat(-14, .2, -2, 8, 4, '#c9a06a', .2);           // yard
    // care stations
    sb.stations = [
      {id: 'brush', x: -16, z: -4, e: '🪥'}, {id: 'feed', x: -12, z: -4, e: '🥕'}, {id: 'groom', x: -14, z: -10, e: '✨'},
      {id: 'saddle', x: -10, z: -6, e: '🐎'}, {id: 'show', x: 8, z: 6, e: '🏆'}
    ];
    sb.stations.forEach(s => { plat(s.x, .6, s.z, 2, 2, '#ffe08a', .4); const L = label(s.e + ' ' + s.id, 'rgba(255,159,28,.9)'); L.position.set(s.x, 2.2, s.z); scene.add(L); });
    // jumping course (east meadow)
    for (let i = 0; i < SB_JUMPS; i++){
      const z = -16 + i * 5, x = 6 + (i % 2) * 4;
      plat(x - 1.4, 1.1, z, .3, .3, '#fff', 1.1); plat(x + 1.4, 1.1, z, .3, .3, '#fff', 1.1);
      const rail = plat(x, 1.0, z, 2.6, .2, i % 2 ? '#ff6fb5' : '#3a86ff', .25);
      sb.gates.push({x, z, rail: rail.mesh, cleared: false, y: 1.0});
    }
    plat(10, .3, 20, 4, 4, '#ffd23f', .3); // finish pad
    Object.assign(P, {x: -14, y: .05, z: 2, vx: 0, vy: 0, vz: 0}); P.face = Math.PI; cam.yaw = Math.PI; cam.pitch = .3; cam.dist = 11;
    plat(-14, .4, 2, 1.5, 1.5, '#ffe08a', .15); checkpoints[0] = {idx: 0, spawn: {x: -14, y: .05, z: 2}, flag: new THREE.Object3D()};
    if (sb.pony){ sb.mesh = sbMesh(sb.pony, -14, -6); }
  }
  function stableEnter(){ if (!sb) return; sb.panel = false; sb.near = -1; sbHud();
    if (sb.ph === 'pick') banner('🐴 Pick a pony to adopt — they\'re all original Clover Meadow friends!');
    else banner('🐴 ' + sb.pony.name + ' is happy to see you! Brush, feed, groom, then ride & jump!');
    tipTimer = 6; if (sb.ph === 'pick') sbShowPick(true); }
  function stableStop(){ sb = null; ['#sbAct', '#sbPanel', '#sbPick'].forEach(id => { const e = $(id); if (e) e.classList.remove('show'); }); }
  function sbShowPick(on){
    const el = $('#sbPick'); if (!el) return; if (!on){ el.classList.remove('show'); return; }
    el.classList.add('show'); el.innerHTML = '<h2>🐴 Adopt a Pony</h2><div class="fsitems" id="sbPickList"></div><div class="row"><button class="big gray" id="sbPickClose">👋 Later</button></div>';
    const list = $('#sbPickList'); SB_PONIES.forEach(p => { const b = document.createElement('button'); b.className = 'icb'; b.innerHTML = p.e + '<small>' + p.name + '</small>'; b.onclick = () => sbAdopt(p.id); list.appendChild(b); });
    $('#sbPickClose').onclick = () => sbShowPick(false);
  }
  function sbAdopt(id){
    if (!sb || !SB_PONIES.some(p => p.id === id)) return false;
    const def = sbPonyOf(id); sb.pony = {id: def.id, name: def.name, shine: 70, energy: 70, mood: 70};
    const p = sbProg(); p.pony = sb.pony; sbSave(p);
    if (sb.mesh) scene.remove(sb.mesh); sb.mesh = sbMesh(sb.pony, -14, -6);
    sb.ph = 'care'; sbShowPick(false); banner('🎉 You adopted ' + def.e + ' ' + def.name + '!'); confetti(); SND.coin(); sbHud(); return true;
  }
  function sbCare(kind){
    if (!sb || !sb.pony) return false;
    const row = SB_CARE.find(c => c[0] === kind); if (!row) return false;
    const k = row[3]; sb.pony[k] = Math.min(100, sb.pony[k] + 18); const p = sbProg(); p.pony = sb.pony; sbSave(p);
    banner(row[1] + ' ' + sb.pony.name + ' feels happier! ' + row[2] + ' +18'); SND.coin(); sbHud(); return true;
  }
  function sbMount(on){
    if (!sb || !sb.pony) return false;
    if (on){ if (sb.pony.energy < 15){ banner('😴 ' + sb.pony.name + ' is too tired — feed them first!'); return false; } sb.ridden = true; sb.ph = 'ride';
      if (sb.mesh){ sb.mesh.visible = false; } banner('🐎 You\'re riding ' + sb.pony.name + '! Head to the 🏆 show course.'); }
    else { sb.ridden = false; sb.ph = 'care'; if (sb.mesh){ sb.mesh.visible = true; sb.mesh.position.set(P.x, 0, P.z - 2); } banner('🐴 You hopped off.'); }
    sbHud(); return true;
  }
  function sbStartShow(){
    if (!sb || !sb.pony || !sb.ridden){ banner('🐎 Mount your pony first (at the 🐎 saddle)!'); return false; }
    sb.show = {t: SB_SHOW_T, score: 0, done: 0}; sb.gates.forEach(g => g.cleared = false); sb.ph = 'show';
    banner('🏆 Jumping Show! Clear the colourful rails — 90 seconds!'); tipTimer = 5; sbHud(); return true;
  }
  function sbEndShow(){
    if (!sb || !sb.show) return; const sc = sb.show.score, p = sbProg(); p.shows++; p.best = Math.max(p.best, sc);
    const pay = 5 + sc * 4; p.coins += pay; if (sb.pony){ sb.pony.energy = Math.max(0, sb.pony.energy - 20); p.pony = sb.pony; } sbSave(p);
    setCoins(coins + pay); sb.earned += pay; runCoins = (runCoins || 0) + pay; confetti(); SND.win();
    banner('🏅 Show over! Score ' + sc + '/' + SB_JUMPS + ' · +' + pay + ' 🪙'); sb.show = null; sb.ph = 'ride'; sbHud();
  }
  function stableUpdate(dt){
    if (!sb) return;
    // proximity
    let near = -1, best = 2.6; sb.stations.forEach((s, i) => { const d = Math.hypot(P.x - s.x, P.z - s.z); if (d < best){ best = d; near = i; } });
    sb.near = near; const btn = $('#sbAct');
    if (btn){ if (near >= 0 && sb.pony){ const s = sb.stations[near]; let label = s.e + ' ' + s.id; if (s.id === 'saddle') label = sb.ridden ? '🐴 Dismount' : '🐎 Mount'; if (s.id === 'show') label = '🏆 Start Show';
      btn.classList.add('show'); btn.innerHTML = label + '<small>E / Ⓧ</small>'; } else if (!sb.pony){ btn.classList.add('show'); btn.innerHTML = '🐴 Adopt<small>E / Ⓧ</small>'; } else btn.classList.remove('show'); }
    if (sb.ph === 'show' && sb.show){
      sb.show.t -= dt; if (sb.show.t <= 0){ sbEndShow(); return; }
      // clear gates when riding over them with a bit of height
      sb.gates.forEach(g => { if (g.cleared) return; if (Math.hypot(P.x - g.x, P.z - g.z) < 1.6 && P.y > .55){ g.cleared = true; sb.show.score++; sb.show.done++; SND.cp(); banner('✨ Cleared! ' + sb.show.score + '/' + SB_JUMPS); } });
      if (sb.show.score >= SB_JUMPS) sbEndShow();
    }
    // pony follows when not ridden
    if (sb.mesh && sb.pony && !sb.ridden && sb.ph !== 'pick'){ const m = sb.mesh.position, dx = P.x - m.x, dz = P.z - 2 - m.z, d = Math.hypot(dx, dz);
      if (d > 2.5){ m.x += dx / d * dt * 3.2; m.z += dz / d * dt * 3.2; sb.mesh.rotation.y = Math.atan2(dx, dz); } }
    // drain care slowly
    if (sb.pony && sb.ph !== 'pick'){ sb.t += dt; if (sb.t > 8){ sb.t = 0; sb.pony.shine = Math.max(0, sb.pony.shine - 1); sb.pony.energy = Math.max(0, sb.pony.energy - 1); sb.pony.mood = Math.max(0, sb.pony.mood - 1); const p = sbProg(); p.pony = sb.pony; sbSave(p); } }
    sbHud();
  }
  function stableAnimate(dt){ if (sb && sb.mesh && sb.ridden === false) sb.mesh.rotation.y += dt * .05; }
  function sbAct(){
    if (!sb) return false;
    if (!sb.pony){ sbShowPick(true); return true; }
    if (sb.near < 0) return false; const s = sb.stations[sb.near];
    if (s.id === 'brush' || s.id === 'feed' || s.id === 'groom') return sbCare(s.id);
    if (s.id === 'saddle') return sbMount(!sb.ridden);
    if (s.id === 'show') return sbStartShow();
    return false;
  }
  function sbHud(){
    if (!sb) return; const n = $('#sbN'); if (!n) return;
    if (!sb.pony){ n.textContent = '🐴 Pick a pony'; return; }
    n.textContent = sbPonyOf(sb.pony.id).e + ' ' + sb.pony.name + ' · ✨' + Math.round(sb.pony.shine) + ' 🥕' + Math.round(sb.pony.energy) + ' 💕' + Math.round(sb.pony.mood) + (sb.show ? ' · 🏆 ' + sb.show.score + '/' + SB_JUMPS + ' · ⏱️' + Math.ceil(sb.show.t) : '');
  }
  function sbPad(jp){ if (!sb) return false; if (jp.x){ sbAct(); return true; } return false; }
  function sbKey(e){ if (!sb || e.repeat || paused) return false; if (e.code === 'KeyE'){ sbAct(); return true; } if (e.code === 'Escape'){ sbShowPick(false); return false; } return false; }
