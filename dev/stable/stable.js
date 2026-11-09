  /* ===================== t231u: 🐴 CLOVER MEADOW STABLES — facing mount (straddle, yaw-matched) ===================== */
  const SB_KEY = 'rubloxStable', SB_DRAIN = 25, SB_MOUNT_CD = .85, SB_SADDLE_Y = 1.15;
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
  // Straddle sit: knees slightly bent (lL/lR), hips open down the flanks (lLo/lRo), seated up at saddle height (y)
  const SB_SIT = {lL: -.95, lR: -.95, lLo: .68, lRo: .68, aL: -.3, aR: -.3, aLo: .15, aRo: .15, lean: .04, y: .7};
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
    // Parts are authored along +X; wrap in an inner group rotated −π/2 so the pony's nose is +Z —
    // the same forward convention as P.face / the rider. Then mesh.rotation.y === P.face while mounted.
    const def = sbPonyOf(pony.id), g = new THREE.Group(); g.position.set(x, 0, z); scene.add(g);
    const inner = new THREE.Group(); inner.rotation.y = -Math.PI / 2; g.add(inner);
    const body = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.1, .9), new THREE.MeshLambertMaterial({color: def.coat})); body.position.y = 1.1; inner.add(body);
    const neck = new THREE.Mesh(new THREE.BoxGeometry(.45, .9, .45), new THREE.MeshLambertMaterial({color: def.coat})); neck.position.set(.85, 1.7, 0); inner.add(neck);
    const head = new THREE.Mesh(new THREE.BoxGeometry(.55, .5, .5), new THREE.MeshLambertMaterial({color: def.coat})); head.position.set(1.2, 2.15, 0); inner.add(head);
    const mane = new THREE.Mesh(new THREE.BoxGeometry(.3, .9, .55), new THREE.MeshLambertMaterial({color: def.mane})); mane.position.set(.7, 1.85, 0); inner.add(mane);
    [[-.5, .55, .35], [-.5, .55, -.35], [.4, .55, .35], [.4, .55, -.35]].forEach(([a, b, c]) => { const leg = new THREE.Mesh(new THREE.BoxGeometry(.22, 1.1, .22), new THREE.MeshLambertMaterial({color: shade(def.coat, -20)})); leg.position.set(a, b, c); inner.add(leg); });
    g.userData = g.userData || {}; g.userData.forward = 'z'; g.visible = true; return g;
  }
  function sbSign(text, x, z, col){
    plat(x, .45, z, 2.6, 2.6, col, .3);
    const L = label(text, 'rgba(29,35,64,.92)'); L.position.set(x, 1.45, z); scene.add(L); return L;
  }
  function sbRailVisual(x, z, col){
    const mat = new THREE.MeshLambertMaterial({color: col});
    const postL = new THREE.Mesh(new THREE.BoxGeometry(.25, 1.0, .25), mat); postL.position.set(x - 1.3, .5, z); scene.add(postL);
    const postR = new THREE.Mesh(new THREE.BoxGeometry(.25, 1.0, .25), mat); postR.position.set(x + 1.3, .5, z); scene.add(postR);
    const rail = new THREE.Mesh(new THREE.BoxGeometry(2.6, .18, .18), mat); rail.position.set(x, .85, z); scene.add(rail);
    return {x, z, rail, posts: [postL, postR], cleared: false};
  }
  function sbSyncRider(){
    // Keep rider + pony locked: same yaw, rider centred on the back at saddle height, no side offset.
    if (!sb || !sb.ridden || !sb.mesh) return;
    if (Math.hypot(P.vx || 0, P.vz || 0) > .12) sb.heading = Math.atan2(P.vx, P.vz);
    if (typeof sb.heading !== 'number' || !isFinite(sb.heading)) sb.heading = P.face;
    P.face = sb.heading;
    sb.mesh.rotation.y = sb.heading;
    sb.mesh.position.set(P.x, 0, P.z);
    if (P.onGround !== false && !(P.vy > .4)) P.y = SB_SADDLE_Y;
    else if (P.y < SB_SADDLE_Y) P.y = SB_SADDLE_Y;
  }
  function buildStable(){
    const prog = sbProg();
    sb = {ph: prog.pony ? 'care' : 'pick', t: 0, pony: prog.pony ? Object.assign({}, prog.pony) : null, mesh: null, near: -1, panel: false, show: null, score: 0, jumps: [], ridden: false, mountCd: 0, heading: Math.PI, earned: 0, gates: [], labels: [], toastT: 0};
    scene.background = new THREE.Color('#c8e8ff');
    plat(0, 0, 0, 60, 60, '#8fd39a', .35);
    sb.fences = [];
    [[0, 30, 62, .5], [0, -30, 62, .5], [30, 0, .5, 62], [-30, 0, .5, 62]].forEach(([x, z, w, d]) => {
      const f = plat(x, .7, z, w, d, '#e8a04a', .7); f.camSkip = true;
      if (f.mesh && f.mesh.material){ f.mesh.material.transparent = true; f.mesh.material.opacity = .55; }
      sb.fences.push(f);
    });
    plat(-14, 7.0, -14, 16, 10, '#d4a574', 7.0);
    plat(-14, 7.55, -14, 18, 12, '#8a5a3c', .9);
    plat(-14, 2.2, -8.6, 3.2, .5, '#6b3e1f', 2.2);
    plat(-19, 3.2, -8.7, 2.2, .3, '#9fd8ff', 1.4);
    plat(-9, 3.2, -8.7, 2.2, .3, '#9fd8ff', 1.4);
    const barnSign = label('🐴 Clover Meadow Barn', 'rgba(139,92,246,.95)'); barnSign.position.set(-14, 5.6, -8.2); scene.add(barnSign);
    sb.stations = [
      {id: 'brush', x: -20, z: 2, e: '🪥', col: '#ffe08a'},
      {id: 'feed',  x: -14, z: 2, e: '🥕', col: '#9ff0c8'},
      {id: 'groom', x: -8,  z: 2, e: '✨', col: '#c39bff'},
      {id: 'saddle',x: -14, z: 7, e: '🐎', col: '#7fd6ff'},
      {id: 'show',  x: 12,  z: 6, e: '🏆', col: '#ffd23f'}
    ];
    sb.stations.forEach(s => { sb.labels.push(sbSign(s.e + ' ' + s.id, s.x, s.z, s.col)); });
    for (let i = 0; i < SB_JUMPS; i++){
      const z = -20 + i * 5, x = 10 + (i % 2) * 4;
      sb.gates.push(sbRailVisual(x, z, i % 2 ? '#ff6fb5' : '#3a86ff'));
    }
    plat(12, .3, 22, 4, 4, '#ffd23f', .3);
    Object.assign(P, {x: -14, y: .05, z: 14, vx: 0, vy: 0, vz: 0}); P.face = Math.PI; cam.yaw = 0; cam.pitch = .36; cam.dist = 15;
    checkpoints[0] = {idx: 0, spawn: {x: -14, y: .05, z: 14}, flag: new THREE.Object3D()};
    if (sb.pony){ sb.mesh = sbMesh(sb.pony, -14, 10); sb.mesh.visible = true; }
  }
  function sbFlash(msg){ if (!sb) return; sb.toastT = 2.4; const b = $('#oBig'); if (b) b.textContent = msg; banner(msg); }
  function stableEnter(){ if (!sb) return; sb.panel = false; sb.near = -1; sb.ridden = false; sb.mountCd = 0; sb.heading = P.face; cam.yaw = 0; cam.dist = 15; cam.pitch = .36;
    if (sb.pony && !sb.mesh) sb.mesh = sbMesh(sb.pony, -14, 10);
    if (sb.mesh) sb.mesh.visible = true;
    sbHud();
    if (sb.ph === 'pick' || !sb.pony){ sb.ph = 'pick'; banner('🐴 Pick a pony to adopt!'); sbShowPick(true); }
    else { sb.ph = 'care'; banner('🐴 ' + sb.pony.name + '! Pads left→right: 🪥 🥕 ✨ · 🐎 saddle closer to you · 🏆 show to the right'); }
    tipTimer = 7; }
  function stableStop(){ sb = null; ['#sbAct', '#sbPick'].forEach(id => { const e = $(id); if (e) e.classList.remove('show'); }); const b = $('#oBig'); if (b && !nds) b.textContent = ''; }
  function sbShowPick(on){
    const el = $('#sbPick'); if (!el) return; if (!on){ el.classList.remove('show'); sb.panel = false; return; }
    sb.panel = true; el.classList.add('show'); el.innerHTML = '<h2>🐴 Adopt a Pony</h2><div class="fsitems" id="sbPickList"></div><div class="row"><button class="big gray" id="sbPickClose">👋 Later</button></div>';
    const list = $('#sbPickList'); SB_PONIES.forEach(p => { const b = document.createElement('button'); b.className = 'icb'; b.innerHTML = p.e + '<small>' + p.name + '</small>'; b.onclick = () => sbAdopt(p.id); list.appendChild(b); });
    $('#sbPickClose').onclick = () => sbShowPick(false);
  }
  function sbAdopt(id){
    if (!sb || !SB_PONIES.some(p => p.id === id)) return false;
    const def = sbPonyOf(id); sb.pony = {id: def.id, name: def.name, shine: 70, energy: 70, mood: 70};
    const p = sbProg(); p.pony = sb.pony; sbSave(p);
    if (sb.mesh) scene.remove(sb.mesh); sb.mesh = sbMesh(sb.pony, -14, 10); sb.mesh.visible = true;
    sb.ph = 'care'; sb.ridden = false; sbShowPick(false); sbFlash('🎉 You adopted ' + def.e + ' ' + def.name + '!'); confetti(); SND.coin(); sbHud(); return true;
  }
  function sbCare(kind){
    if (!sb || !sb.pony || sb.ridden) return false;
    const row = SB_CARE.find(c => c[0] === kind); if (!row) return false;
    const k = row[3]; sb.pony[k] = Math.min(100, sb.pony[k] + 18); const p = sbProg(); p.pony = Object.assign({}, sb.pony); sbSave(p);
    sbFlash(row[1] + ' ' + sb.pony.name + ' · ' + row[2] + ' → ' + Math.round(sb.pony[k])); SND.coin(); sbHud(); return true;
  }
  function sbMount(on){
    if (!sb || !sb.pony) return false;
    if (sb.mountCd > 0) return false;
    if (on){
      if (sb.ridden) return true;
      if (sb.pony.energy < 15){ sbFlash('😴 ' + sb.pony.name + ' is too tired — feed them first!'); return false; }
      sb.ridden = true; sb.ph = 'ride'; sb.mountCd = SB_MOUNT_CD;
      sb.heading = P.face; P.y = SB_SADDLE_Y;
      if (sb.mesh){ sb.mesh.visible = true; sbSyncRider(); }
      sbFlash('🐎 Mounted! Ride to the 🏆 show pad'); SND.coin(); sbHud(); return true;
    }
    if (!sb.ridden) return true;
    sb.ridden = false; sb.ph = 'care'; sb.mountCd = SB_MOUNT_CD; P.y = .05;
    if (sb.mesh){ sb.mesh.visible = true; sb.mesh.position.set(P.x, 0, P.z - 2); sb.mesh.rotation.y = P.face; }
    sbFlash('🐴 You hopped off.'); sbHud(); return true;
  }
  function sbStartShow(){
    if (!sb || !sb.pony) return false;
    if (!sb.ridden){ sbFlash('🐎 Mount your pony first at the 🐎 saddle!'); return false; }
    sb.show = {t: SB_SHOW_T, score: 0, done: 0}; sb.gates.forEach(g => g.cleared = false); sb.ph = 'show';
    sbFlash('🏆 Jumping Show! Clear the rails — 90s'); tipTimer = 5; sbHud(); return true;
  }
  function sbEndShow(){
    if (!sb || !sb.show) return; const sc = sb.show.score, p = sbProg(); p.shows++; p.best = Math.max(p.best, sc);
    const pay = 5 + sc * 4; p.coins += pay; if (sb.pony){ sb.pony.energy = Math.max(0, sb.pony.energy - 20); p.pony = Object.assign({}, sb.pony); } sbSave(p);
    setCoins(coins + pay); sb.earned += pay; runCoins = (runCoins || 0) + pay; confetti(); SND.win();
    sbFlash('🏅 Show over! ' + sc + '/' + SB_JUMPS + ' · +' + pay + ' 🪙'); sb.show = null; sb.ph = 'ride'; sbHud();
  }
  function sbPose(){
    if (!(sb && sb.ridden)) return null;
    // explicit straddle — one leg each side of the pony
    return Object.assign({}, SB_SIT);
  }
  function stableUpdate(dt){
    if (!sb) return;
    if (sb.mountCd > 0) sb.mountCd -= dt;
    if (sb.toastT > 0){ sb.toastT -= dt; if (sb.toastT <= 0){ const b = $('#oBig'); if (b && !nds) b.textContent = ''; } }
    if (cam.dist < 13) cam.dist += (13 - cam.dist) * Math.min(1, dt * 4);
    if (cam.pitch < .3) cam.pitch += (.3 - cam.pitch) * Math.min(1, dt * 3);
    let near = -1, best = 2.8; sb.stations.forEach((s, i) => { const d = Math.hypot(P.x - s.x, P.z - s.z); if (d < best){ best = d; near = i; } });
    sb.near = near; const btn = $('#sbAct');
    if (btn){ if (near >= 0 && sb.pony){ const s = sb.stations[near]; let lab = s.e + ' ' + s.id; if (s.id === 'saddle') lab = sb.ridden ? '🐴 Dismount' : '🐎 Mount'; if (s.id === 'show') lab = '🏆 Start Show';
      btn.classList.add('show'); btn.innerHTML = lab + '<small>E / Ⓧ</small>'; } else if (!sb.pony){ btn.classList.add('show'); btn.innerHTML = '🐴 Adopt<small>E / Ⓧ</small>'; } else btn.classList.remove('show'); }
    if (sb.ph === 'show' && sb.show){
      sb.show.t -= dt; if (sb.show.t <= 0){ sbEndShow(); return; }
      sb.gates.forEach(g => { if (g.cleared) return; if (Math.hypot(P.x - g.x, P.z - g.z) < 1.7 && P.y > .5){ g.cleared = true; sb.show.score++; sb.show.done++; SND.cp(); banner('✨ Cleared! ' + sb.show.score + '/' + SB_JUMPS); } });
      if (sb.show.score >= SB_JUMPS) sbEndShow();
    }
    if (sb.mesh && sb.pony && sb.ph !== 'pick'){
      sb.mesh.visible = true;
      if (sb.ridden) sbSyncRider();
      else { const m = sb.mesh.position, dx = P.x - m.x, dz = P.z - 2.2 - m.z, d = Math.hypot(dx, dz);
        if (d > 2.2){ m.x += dx / d * dt * 3.5; m.z += dz / d * dt * 3.5; sb.mesh.rotation.y = Math.atan2(dx, dz); } }
    }
    if (sb.pony && sb.ph !== 'pick'){ sb.t += dt; if (sb.t > SB_DRAIN){ sb.t = 0; sb.pony.shine = Math.max(0, sb.pony.shine - 1); sb.pony.energy = Math.max(0, sb.pony.energy - 1); sb.pony.mood = Math.max(0, sb.pony.mood - 1); const p = sbProg(); p.pony = Object.assign({}, sb.pony); sbSave(p); } }
    sbHud();
  }
  function stableAnimate(dt){ if (sb && sb.mesh && !sb.ridden) sb.mesh.rotation.y += dt * .03; }
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
    n.textContent = sbPonyOf(sb.pony.id).e + ' ' + sb.pony.name + (sb.ridden ? ' 🐎' : '') + ' · ✨' + Math.round(sb.pony.shine) + ' 🥕' + Math.round(sb.pony.energy) + ' 💕' + Math.round(sb.pony.mood) + (sb.show ? ' · 🏆 ' + sb.show.score + '/' + SB_JUMPS + ' · ⏱️' + Math.ceil(sb.show.t) : '');
  }
  function sbPad(jp){ if (!sb) return false; if (jp.x){ sbAct(); return true; } return false; }
  function sbKey(e){ if (!sb || e.repeat || paused) return false; if (e.code === 'KeyE'){ sbAct(); return true; } if (e.code === 'Escape' && sb.panel){ sbShowPick(false); return true; } return false; }
