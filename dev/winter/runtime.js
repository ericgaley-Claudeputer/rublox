  /* ---------- Pinebell Village ---------- */
  let wn = null;
  function wnKeep(m){ if (m && wn && wn.trash) wn.trash.push(m); return m; }
  function wnMat(c,o){ return new THREE.MeshLambertMaterial(Object.assign({color:c}, o||{})); }
  function wnMesh(geo,c,x,y,z){ const m=new THREE.Mesh(geo, wnMat(c)); m.position.set(x,y,z); scene.add(m); return wnKeep(m); }
  function wnState(){ return WinterRules.wnLoad(typeof load === 'function' ? load(WinterRules.WN_KEY, null) : null); }
  function wnSave(s){ if (typeof save === 'function') save(WinterRules.WN_KEY, s); if (wn) wn.sv = s; }
  function wnPay(n){
    try {
      if (typeof pay === 'function'){ pay(n); return; }
      if (typeof setCoins === 'function' && typeof coins === 'number'){ setCoins(coins + n); return; }
      if (typeof coins === 'number'){ coins += n; if (typeof save === 'function') save('rubloxCoins', coins); }
    } catch (e){}
  }
  function wnSpend(n){
    try {
      if (typeof coins === 'number'){
        if (coins < n) return false;
        coins -= n; if (typeof save === 'function') save('rubloxCoins', coins); return true;
      }
    } catch (e){}
    return false;
  }
  function wnCoins(){ try { return (typeof coins === 'number') ? coins : 0; } catch(e){ return 0; } }
  function drawWinter(ctx){
    if (typeof sky === 'function') sky(ctx, '#9fd4ff', '#fff8ee');
    else { ctx.fillStyle = '#9fd4ff'; ctx.fillRect(0,0,320,200); }
    ctx.fillStyle = '#f4fbff'; ctx.fillRect(0, 130, 320, 70);
    ctx.fillStyle = '#c45c1a'; ctx.fillRect(40, 90, 80, 50);
    ctx.fillStyle = '#8b2e1a'; ctx.beginPath(); ctx.moveTo(30,90); ctx.lineTo(80,50); ctx.lineTo(130,90); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.fillRect(200, 100, 90, 40);
    ctx.fillStyle = '#8fd3ff'; ctx.beginPath(); ctx.ellipse(240, 170, 40, 14, 0, 0, Math.PI*2); ctx.fill();
    ctx.font = '24px sans-serif'; ctx.fillText('🎄', 70, 80); ctx.fillText('🛷', 210, 90); ctx.fillText('☕', 100, 120);
    if (typeof guy === 'function') guy(ctx, 160, 176, 12, '#3a86ff');
  }
  function wnLab(text,x,y,z){
    try { if (typeof t297Lab === 'function'){ const m=t297Lab(text,x,y,z); if(m) return wnKeep(m); } } catch(e){}
    return wnMesh(new THREE.BoxGeometry(0.2,0.2,0.2),'#fff',x,y,z);
  }
  function wnWall(x,y,z,w,h,d,c){
    const b = plat(x, y+h/2, z, w, d, c, h);
    if (b && b.mesh){ b.mesh.material = wnMat(c); wnKeep(b.mesh); }
    if (b && wn) wn.solids.push(b);
    return b;
  }
  function wnSplitWall(along, a0, a1, fixed, gaps, color){
    const h = (typeof WinterRules !== 'undefined' && WinterRules.WN_WALL_H) || 5.2;
    const doorH = (typeof WinterRules !== 'undefined' && WinterRules.WN_DOOR_H) || 4.2;
    const th = 0.42;
    const opens = (gaps || []).map(g => ({a:g.c - g.w/2, b:g.c + g.w/2})).sort((p,q) => p.a - q.a);
    let cursor = a0;
    function seg(lo, hi, y, hh){
      if (hi - lo < 0.15) return;
      const mid = (lo + hi) / 2, len = hi - lo;
      if (along === 'x') wnWall(mid, y + hh/2, fixed, len, hh, th, color);
      else wnWall(fixed, y + hh/2, mid, th, hh, len, color);
    }
    opens.forEach(op => {
      seg(cursor, op.a, 0, h);
      seg(op.a, op.b, doorH, h - doorH);
      cursor = op.b;
    });
    seg(cursor, a1, 0, h);
  }
  function wnCottage(x,z,c,roof, opts){
    const w = (opts && opts.w) || 6, d = (opts && opts.d) || 5;
    const doorW = (typeof WinterRules !== 'undefined' && WinterRules.WN_DOOR_W) || 3.6;
    const wallH = (typeof WinterRules !== 'undefined' && WinterRules.WN_WALL_H) || 5.2;
    const x0 = x - w/2, x1 = x + w/2, z0 = z - d/2, z1 = z + d/2;
    wnSplitWall('x', x0, x1, z0, [], c);
    wnSplitWall('z', z0, z1, x0, [], c);
    wnSplitWall('z', z0, z1, x1, [], c);
    wnSplitWall('x', x0, x1, z1, [{c:x, w:doorW}], c);
    const r = new THREE.Mesh(new THREE.ConeGeometry(Math.max(w, d) * 0.72, 2.2, 4), wnMat(roof));
    r.position.set(x, wallH + 0.9, z); r.rotation.y = Math.PI/4; scene.add(r); wnKeep(r);
    wnMesh(new THREE.BoxGeometry(0.8, 0.8, 0.1), '#ffd23f', x-1.4, 2.4, z1 + 0.06);
  }
  function wnPlaceName(lab){
    if (!lab) return null;
    const prefix = ({hill:'🛷 ', finish:'🏁 ', village:'🎄 ', cocoa:'☕ ', pond:'⛸️ ', yard:'☃️ ', lamp:'🌙 ', wrap:'🎁 ', fort:'🧱 ', judges:'⭐ '}[lab.id] || (String(lab.id||'').indexOf('post')===0 ? '🎯 ' : (String(lab.id||'').indexOf('tree')===0 ? '🎄 ' : (lab.anchor && String(lab.anchor).indexOf('house')>=0 || ['cocoa','blue','green'].indexOf(lab.id)>=0 ? '🏠 ' : ''))));
    const m = wnLab((prefix || '') + lab.name, lab.x, lab.y, lab.z);
    if (m){ m.userData = m.userData || {}; m.userData.wnLabId = lab.id; }
    return m;
  }
  function wnPaintLabels(){
    if (!wn || typeof WinterRules === 'undefined') return;
    const vis = WinterRules.wnVisibleLabels((typeof P !== 'undefined' && P) ? P.x : 0, (typeof P !== 'undefined' && P) ? P.z : 8);
    const show = {};
    vis.forEach(l => { show[l.id] = true; });
    (wn.labels || []).forEach(m => {
      const id = m && m.userData && m.userData.wnLabId;
      if (m) m.visible = !!show[id];
    });
  }

  function wnBuildSnug(){
    if (!wn || !WinterRules.WN_SNUG) return;
    const s = WinterRules.WN_SNUG;
    wnMesh(new THREE.BoxGeometry(2.4, 2.0, 1.6), '#c45c1a', s.x, 1.1, s.z);
    wnMesh(new THREE.BoxGeometry(2.7, 0.16, 1.9), '#8b2e1a', s.x, 2.15, s.z);
    wnMesh(new THREE.CylinderGeometry(0.22, 0.18, 0.7, 8), '#5a2a12', s.x - 0.5, 2.5, s.z);
    wnMesh(new THREE.BoxGeometry(0.9, 0.7, 0.9), '#fff8ee', s.x + 0.55, 2.55, s.z);
    wnLab('☕ Snugmug Cart', s.x, 3.4, s.z);
    wn.snug = {x:s.x, z:s.z};
    wn.snugTop = 'cloud';
    // two townsfolk customers in a little queue
    [[s.x + 2.2, s.z + 1.4, '#e8d0a8'], [s.x + 3.4, s.z + 2.2, '#c8a070']].forEach(p => {
      try {
        if (typeof buildPlayer === 'function'){
          const m = buildPlayer(Object.assign({}, typeof DEF !== 'undefined' ? DEF : {}, {shirt:'#3a86ff', pants:'#2a3a6a', hair:'short', face:'smile', hat:'beanie'}));
          m.g.position.set(p[0], 0.05, p[1]); m.g.rotation.y = Math.atan2(s.x - p[0], s.z - p[1]); scene.add(m.g); wnKeep(m.g);
        } else wnMesh(new THREE.BoxGeometry(0.6, 1.5, 0.5), p[2], p[0], 0.85, p[1]);
      } catch(e){ wnMesh(new THREE.BoxGeometry(0.6, 1.5, 0.5), p[2], p[0], 0.85, p[1]); }
    });
    wnLab('👫 Skaters in line', s.x + 2.8, 2.6, s.z + 1.8);
  }
  function wnBuildTargets(){
    if (!wn) return;
    wn.targets = [];
    (WinterRules.WN_TARGETS || []).forEach(tg => {
      if (tg.kind === 'can'){
        const m = wnMesh(new THREE.CylinderGeometry(0.22, 0.22, 0.7, 8), '#c45c1a', tg.x, 0.45, tg.z);
        wnLab('🥫 ' + tg.name, tg.x, 1.4, tg.z);
        wn.targets.push({id:tg.id, mesh:m, baseY:0.45});
      } else {
        const g = new THREE.Group();
        const a = new THREE.Mesh(new THREE.SphereGeometry(0.55, 8, 8), wnMat('#f4fbff')); a.position.y = 0.55; g.add(a);
        const b = new THREE.Mesh(new THREE.SphereGeometry(0.4, 8, 8), wnMat('#f4fbff')); b.position.y = 1.2; g.add(b);
        g.position.set(tg.x, 0, tg.z); scene.add(g); wnKeep(g);
        wnLab('☃️ ' + tg.name, tg.x, 2.1, tg.z);
        wn.targets.push({id:tg.id, mesh:g, baseY:0});
      }
    });
    wnLab('❄️ Puffyard', 12, 2.8, 21);
  }
  function wnSnugCycle(){
    if (!wn) return;
    if (!wn.snug || !wnNear(wn.snug.x, wn.snug.z, 2.8)){ banner('Walk up to the Snugmug Cart to pick a topping.'); return; }
    const list = WinterRules.WN_TOPPINGS || [];
    if (!list.length) return;
    const i = Math.max(0, list.findIndex(t => t.id === (wn.snugTop || 'cloud')));
    wn.snugTop = list[(i + 1) % list.length].id;
    const t = WinterRules.wnTopping(wn.snugTop);
    banner((t.emoji||'☕') + ' Next topping: ' + t.name + '. E buys a mug, F serves a skater in line.');
    wnHud();
  }
  function wnSnugDo(serve){
    if (!wn) return;
    const id = wn.snugTop || 'cloud';
    if (serve){
      const r = WinterRules.wnSnugServe(wn.run, wn.sv, id);
      if (r.ok){ wn.sv = r.state; wnSave(wn.sv); wnPay(r.coins); banner('☕ ' + r.message + ' +' + r.coins + ' 🪙'); }
      wnHud(); wnNet(); return;
    }
    const r = WinterRules.wnSnugBuy(wn.sv, wnCoins(), id);
    if (!r.ok){ banner('Need ' + (r.cost||4) + ' coins for a Snugmug — or press F to serve a skater.'); return; }
    if (!wnSpend(r.cost)){ banner('Need ' + r.cost + ' coins for a Snugmug.'); return; }
    wn.sv = r.state; wnSave(wn.sv);
    wn.run.cocoa = wn.run.cocoa || {warm:0, served:0};
    wn.run.cocoa.warm = r.warm;
    banner('☕ ' + r.message);
    wnHud(); wnNet();
  }
  // Real players only: me plus friends in Pinebell right now (positions from multiplayer), never NPCs or bots.
  function wnRoster(){
    const me = (typeof mp !== 'undefined' && mp && mp.me) ? mp.me : 'me';
    const out = [{id: me, name: 'You', x: P.x, z: P.z}];
    try {
      if (typeof mp !== 'undefined' && mp && mp.on && mp.ents){
        const now = performance.now();
        mp.ents.forEach((E, uid) => {
          if (!E || uid === me || E.m !== 'winter' || now - (E.seen || 0) > 3000 || String(uid)[0] === 'b') return;
          const L = (typeof mpLook === 'function') ? mpLook(uid) : null;
          if (L && L.bot) return;
          out.push({id: uid, name: (L && L.short) || 'Friend', x: +E.tx || +E.x || 0, z: +E.tz || +E.z || 0});
        });
      }
    } catch(e){}
    return out;
  }
  function wnCapNote(r){ if (r && r.capped && !wn._capNote){ wn._capNote = true; banner('🫙 Pinebell\'s coin jar is empty for today — the fun keeps going!'); } }
  function wnThrowNow(){
    if (!wn) return;
    if (wn.run.show && wn.run.show.on){ wnShowDo('spiral'); return; }
    const yaw = (typeof cam !== 'undefined' && cam) ? cam.yaw : 0;
    const dir = {x: -Math.sin(yaw), z: -Math.cos(yaw)};
    const me = (typeof mp !== 'undefined' && mp && mp.me) ? mp.me : 'me';
    const roster = wnRoster();
    const origin = {x: P.x, z: P.z};
    const extras = (WinterRules.WN_TARGETS || []).concat(WinterRules.WN_FORT_TARGETS || []);
    const r = WinterRules.wnThrowAimed(wn.run, wn.sv, me, origin, dir, roster, extras, wn.run.fort);
    if (!r.ok){ banner(r.why === 'cool' ? 'Wait a tiny second…' : 'Hold that snowball a beat.'); return; }
    wn.sv = r.state; wnSave(wn.sv); if (r.coins) wnPay(r.coins);
    // flying puff
    const shot = r.shot || {x:P.x, z:P.z, dx:dir.x, dz:dir.z, life:0.7, hitAt:8};
    wnLaunch(shot, r.giggle, r.message, r.why);
    try { if (typeof SND !== 'undefined' && SND.boing) beep([660, 440], .05, 'sine', .05); } catch(e){}
    if (r.why === 'miss') banner('❄️ The snowball poofs into the snow.');
    if (r.fight && r.toId) wnSendEv({ev:'poof', to: r.toId, from: me, nm: (typeof player !== 'undefined' && player && player.name) ? String(player.name).slice(0, 16) : 'A friend'});
    wnSendEv({ev:'ball', x:+shot.x.toFixed(2), z:+shot.z.toFixed(2), dx:+shot.dx.toFixed(3), dz:+shot.dz.toFixed(3), h:+(shot.hitAt||8).toFixed(2)});
    wnCapNote(r);
    wnHud(); wnNet();
  }
  function wnLaunch(shot, giggle, msg, why){
    const ball = wnMesh(new THREE.SphereGeometry(0.22, 7, 7), '#f4fbff', shot.x, 1.15, shot.z);
    (wn.shots || (wn.shots=[])).push({m:ball, x:shot.x, y:1.15, z:shot.z, dx:shot.dx, dz:shot.dz, t:0, life: Math.min(0.85, (shot.hitAt||8)/14), giggle: giggle, msg: msg, why: why, poof: why === 'hit' || why === 'target' || why === 'wall' || why === 'remote'});
  }
  function wnPoofAt(x, y, z){
    if (!wn) return;
    for (let i = 0; i < 7; i++){
      const a = i * Math.PI * 2 / 7;
      const m = wnMesh(new THREE.SphereGeometry(0.16, 6, 6), '#ffffff', x, y, z);
      try { m.material.transparent = true; } catch(e){}
      (wn.puffs || (wn.puffs = [])).push({m, vx: Math.cos(a) * 2.4, vy: 1.2 + (i % 3) * 0.5, vz: Math.sin(a) * 2.4, t: 0});
    }
  }
  function wnTickPuffs(dt){
    if (!wn || !wn.puffs) return;
    wn.puffs = wn.puffs.filter(p => {
      p.t += dt;
      if (p.m){ p.m.position.x += p.vx * dt; p.m.position.y += p.vy * dt; p.m.position.z += p.vz * dt; try { p.m.material.opacity = Math.max(0, 1 - p.t / 0.5); } catch(e){} }
      if (p.t >= 0.5){ try { scene.remove(p.m); } catch(e){} return false; }
      return true;
    });
  }
  /* ---- GB-6: Snowdrift Fort Field ---- */
  function wnInFortNow(){ return !!(wn && P && WinterRules.wnInFort && WinterRules.wnInFort(P.x, P.z)); }
  function wnCamDir(){ const yaw = (typeof cam !== 'undefined' && cam) ? cam.yaw : 0; return {x: -Math.sin(yaw), z: -Math.cos(yaw)}; }
  function wnPaintFortCell(i, j){
    if (!wn) return;
    const k = i + ',' + j;
    wn.fortSolids = wn.fortSolids || {};
    (wn.fortSolids[k] || []).forEach(b => {
      try { b.active = false; if (typeof solids !== 'undefined'){ const n = solids.indexOf(b); if (n >= 0) solids.splice(n, 1); } } catch(e){}
      try { const n = wn.solids.indexOf(b); if (n >= 0) wn.solids.splice(n, 1); } catch(e){}
      try { if (b.mesh) scene.remove(b.mesh); } catch(e){}
    });
    wn.fortSolids[k] = [];
    const h = WinterRules.wnFortH(wn.run.fort, i, j);
    const c = WinterRules.wnFortCenter(i, j);
    const F = WinterRules.WN_FORT, s = F.cell - 0.08;
    for (let lv = 0; lv < h; lv++){
      const b = plat(c.x, (lv + 1) * F.blockH, c.z, s, s, (i + j + lv) % 2 ? '#9cc8ee' : '#86b6e4', F.blockH);
      if (b){ if (b.mesh) wnKeep(b.mesh); wn.solids.push(b); wn.fortSolids[k].push(b); }
    }
  }
  function wnPaintFortAll(){
    if (!wn) return;
    Object.keys(wn.fortSolids || {}).forEach(k => { const a = k.split(','); wnPaintFortCell(+a[0], +a[1]); });
    Object.keys((wn.run.fort && wn.run.fort.cells) || {}).forEach(k => { const a = k.split(','); wnPaintFortCell(+a[0], +a[1]); });
  }
  function wnFortDo(add){
    if (!wn) return;
    const d = wnCamDir();
    const r = add ? WinterRules.wnFortPlace(wn.run.fort, P.x, P.z, d.x, d.z) : WinterRules.wnFortScoop(wn.run.fort, P.x, P.z, d.x, d.z);
    if (!r.ok){
      banner({field:'Walk into Snowdrift Fort Field to build.', edge:'Face into the field to build.', you:'Step back a little — that spot is under your boots.', target:'Leave room around the mitten flags!', tall:'That stack is as tall as it goes (3 blocks).', full:'The field is full of forts! Scoop a block first.', empty:'No block there to scoop.'}[r.why] || 'Try another spot.');
      return;
    }
    wnPaintFortCell(r.i, r.j);
    if (add){ wn.sv = WinterRules.wnFortBank(wn.sv, 1); wnSave(wn.sv); }
    try { beep(add ? [392, 523] : [523, 392], .05, 'triangle', .05); } catch(e){}
    wnSendEv({ev:'fort', i:r.i, j:r.j, h:r.h});
    wnHud();
  }
  function wnBuildFort(){
    if (!wn) return;
    const F = WinterRules.WN_FORT;
    wn.run.fort = wn.run.fort || WinterRules.wnFortFresh();
    wn.fortSolids = {};
    // packed-snow field with a soft blue border and a centre line
    const pad = wnMesh(new THREE.BoxGeometry(F.w, 0.06, F.d), '#eaf6ff', F.x, 0.04, F.z);
    [[F.x, F.z - F.d/2, F.w + 0.4, 0.3], [F.x, F.z + F.d/2, F.w + 0.4, 0.3], [F.x - F.w/2, F.z, 0.3, F.d], [F.x + F.w/2, F.z, 0.3, F.d]].forEach(e => wnMesh(new THREE.BoxGeometry(e[2], 0.1, e[3]), '#7ab8e8', e[0], 0.08, e[1]));
    wnMesh(new THREE.BoxGeometry(F.w, 0.08, 0.16), '#b8d8f4', F.x, 0.07, F.z);
    // snow block pile so it reads as "grab blocks here"
    [[-1, 0], [0, 0], [1, 0], [-0.5, 1], [0.5, 1], [0, 2]].forEach((p, n) => wnMesh(new THREE.BoxGeometry(0.8, 0.6, 0.8), n % 2 ? '#f4fbff' : '#dcecf8', F.x - F.w/2 - 2 + p[0] * 0.85, 0.3 + p[1] * 0.6, F.z - 5));
    wnLab('🧱 Snow blocks', F.x - F.w/2 - 2, 2.6, F.z - 5);
    // mitten flags (practice targets) on the far side
    wn.fortFlags = [];
    (WinterRules.WN_FORT_TARGETS || []).forEach((t, n) => {
      wnMesh(new THREE.CylinderGeometry(0.07, 0.07, 2.2, 6), '#8b5a2b', t.x, 1.1, t.z);
      const flag = wnMesh(new THREE.BoxGeometry(0.9, 0.6, 0.06), ['#ff6fb5', '#3a86ff', '#ffd23f'][n % 3], t.x + 0.45, 1.9, t.z);
      wn.fortFlags.push({id:t.id, m:flag, x:t.x});
      wnLab('🧤 ' + t.name, t.x, 2.8, t.z);
    });
    // ghost block shows where the next block lands
    const g = new THREE.Mesh(new THREE.BoxGeometry(F.cell - 0.08, F.blockH, F.cell - 0.08), wnMat('#9fd4ff', {transparent:true, opacity:0.35}));
    g.visible = false; scene.add(g); wnKeep(g); wn.fortGhost = g;
    wnPaintFortAll();
  }
  function wnFortGhost(){
    if (!wn || !wn.fortGhost) return;
    const on = wnInFortNow() && !(wn.run.show && wn.run.show.on);
    if (!on){ wn.fortGhost.visible = false; return; }
    const d = wnCamDir();
    const c = WinterRules.wnFortAim(P.x, P.z, d.x, d.z);
    if (!c){ wn.fortGhost.visible = false; return; }
    const h = WinterRules.wnFortH(wn.run.fort, c.i, c.j);
    const ctr = WinterRules.wnFortCenter(c.i, c.j);
    const F = WinterRules.WN_FORT;
    wn.fortGhost.visible = h < F.maxH;
    wn.fortGhost.position.set(ctr.x, h * F.blockH + F.blockH / 2, ctr.z);
  }
  /* ---- GB-6: Frostlane Star Show ---- */
  function wnTune(notes, dur){ try { if (typeof beep === 'function') beep(notes, dur || .11, 'triangle', .06); } catch(e){} }
  function wnBuildJudges(){
    if (!wn) return;
    const J = WinterRules.WN_JUDGES;
    wnWall(J.x, 0.5, J.z, J.w, 1.0, J.d * 0.7, '#3a4a8a');
    wnMesh(new THREE.BoxGeometry(J.w + 0.2, 0.12, J.d * 0.8), '#ffd23f', J.x, 1.06, J.z);
    wn.judges = [];
    (WinterRules.WN_JUDGE_LIST || []).forEach((jd, n) => {
      const x = J.x - 2 + n * 2, z = J.z - 1.3;
      try {
        if (typeof buildPlayer === 'function'){
          const look = [{shirt:'#8b5cf6', pants:'#2a2a4a', hair:'bun', hairColor:'#c0c0c0', hat:'earmuffs'}, {shirt:'#1d2340', pants:'#1d2340', hair:'short', hairColor:'#1a1a1a', hat:'tophat'}, {shirt:'#2ec27e', pants:'#3a2a1a', hair:'long', hairColor:'#7a3d14', hat:'beanie'}][n % 3];
          const m = buildPlayer(Object.assign({}, typeof DEF !== 'undefined' ? DEF : {}, look, {face:'smile'}));
          m.g.position.set(x, 0.05, z); m.g.rotation.y = 0; scene.add(m.g); wnKeep(m.g);
        } else wnMesh(new THREE.BoxGeometry(0.6, 1.5, 0.5), '#8b5cf6', x, 0.85, z);
      } catch(e){ wnMesh(new THREE.BoxGeometry(0.6, 1.5, 0.5), '#8b5cf6', x, 0.85, z); }
      wnLab(jd.emoji + ' ' + String(jd.name).replace(/^Judge /, ''), x, n === 1 ? 3.75 : 3.2, z);
      const card = wnMesh(new THREE.BoxGeometry(0.7, 0.5, 0.05), '#ffffff', x, 1.6, z + 0.9);
      card.visible = false;
      wn.judges.push({id: jd.id, x, z, card, lab: null});
    });
  }
  function wnShowCards(scores){
    if (!wn || !wn.judges) return;
    wn.judges.forEach((j, n) => {
      if (j.lab){ try { scene.remove(j.lab); } catch(e){} j.lab = null; }
      const s = scores && scores[n];
      j.card.visible = !!s;
      if (s){ j.lab = wnLab('🪧 ' + s.score, j.x, 2.2, j.z + 1.0); j.card.position.y = 1.9; }
    });
    wn.cardT = scores ? 9 : 0;
  }
  function wnStartShow(){
    if (!wn) return;
    const r = WinterRules.wnShowStart(wn.run, Date.now());
    if (!r.ok){ banner('The Star Show is already on — skate!'); return; }
    wnShowCards(null);
    wnTune([523, 659, 784, 659, 880, 784]);
    banner('⭐ The Frostlane Star Show begins! On the ice: E / Ⓧ / ✨ = 🌀 spin, jump (Space / Ⓐ / ⬆️) = ❄️ hop, Q / RB / 🦢 = swan spiral. Five moves, then the judges score!');
    wnHud();
  }
  function wnOnIce(){ return !!(wn && WinterRules.wnOnRink && WinterRules.wnOnRink(P.x, P.z)); }
  function wnShowDo(kind){
    if (!wn || !wn.run.show || !wn.run.show.on) return false;
    const r = WinterRules.wnShowMove(wn.run, kind, {onIce: wnOnIce(), speed: Math.hypot(P.vx || 0, P.vz || 0)});
    if (!r.ok){ if (r.why === 'ice') banner('⛸️ Glide onto the ice first, then show your moves!'); return true; }
    wnTune(kind === 'spin' ? [784, 988] : kind === 'hop' ? [659, 1047] : [587, 740, 880], .08);
    banner(r.move.emoji + ' ' + r.move.name + '! +' + r.pts + ' style  ·  ' + r.n + '/' + WinterRules.WN_SHOW_MOVES);
    if (wn.run.skate){ wn.run.skate.trick = r.move.name; wn.run.skate.trickT = 0.7; }
    if (r.done) wnFinishShow();
    wnHud();
    return true;
  }
  function wnFinishShow(){
    if (!wn || !wn.run.show) return;
    const r = WinterRules.wnShowJudge(wn.run, wn.sv);
    if (!r.ok){ WinterRules.wnShowQuit(wn.run); banner('⭐ The show ended before any moves. Visit the judges to try again!'); wnHud(); return; }
    if (r.already) return;
    wn.sv = r.state; wnSave(wn.sv); if (r.coins) wnPay(r.coins);
    wnShowCards(r.scores);
    wnTune([523, 659, 784, 1047, 784, 1047], .12);
    banner('⭐ ' + r.message + ' (' + r.sum + '/30' + (r.best ? ', a new best!' : '') + ')' + (r.coins ? ('  +' + r.coins + ' 🪙') : (r.capped ? '  The judges have handed out today\'s show coins — come back tomorrow!' : '')));
    wnHud(); wnNet();
  }
  function wnHitBanner(nm){ banner('❄️ Poof! ' + (nm || 'A friend') + ' got you with a snowball — just fluffy snow, no ouch!'); }
  function wnSendEv(o){
    if (typeof mp === 'undefined' || !mp || !mp.on || typeof mpSend !== 'function') return;
    try { mpSend(Object.assign({t:'wn'}, o)); } catch(e){}
  }
  function wnEv(d){
    if (!wn || !d || typeof d.ev !== 'string') return;
    const me = (typeof mp !== 'undefined' && mp && mp.me) ? mp.me : 'me';
    if (d.ev === 'fort'){
      const r = WinterRules.wnFortSet(wn.run.fort, d.i | 0, d.j | 0, d.h | 0);
      if (r.ok) wnPaintFortCell(r.i, r.j);
    } else if (d.ev === 'poof'){
      if (String(d.to) === String(me)){ WinterRules.wnGotHit(wn.run); wnPoofAt(P.x, 1.6, P.z); wnHitBanner(String(d.nm || '').replace(/[<>]/g, '').slice(0, 16)); wnHud(); }
    } else if (d.ev === 'ball'){
      const ok = [d.x, d.z, d.dx, d.dz, d.h].every(v => Number.isFinite(+v));
      if (ok && (wn.shots || []).length < 30) wnLaunch({x:+d.x, z:+d.z, dx:+d.dx, dz:+d.dz, hitAt: Math.max(0.5, Math.min(12, +d.h))}, false, '', 'remote');
    }
  }
  function wnTickShots(dt){
    if (!wn) return;
    const left = [];
    (wn.shots || []).forEach(s => {
      s.t = (s.t||0) + dt;
      s.x += (s.dx||0) * 16 * dt;
      s.z += (s.dz||0) * 16 * dt;
      s.y = 1.15 + Math.sin(Math.min(1, s.t / (s.life||0.7)) * Math.PI) * 0.4;
      if (s.m) s.m.position.set(s.x, s.y, s.z);
      if (s.t >= (s.life||0.7)){
        if (s.m){ try { scene.remove(s.m); } catch(e){} }
        if (s.poof) wnPoofAt(s.x, s.y, s.z);
        if (s.giggle) banner('❄️ ' + (s.msg || 'Poof! A little giggle rings out.'));
      } else left.push(s);
    });
    wn.shots = left;
    if (wn.run && wn.run.cocoa && (wn.run.cocoa.warm||0) > 0){
      wn.run.cocoa.warm = Math.max(0, wn.run.cocoa.warm - dt);
    }
  }
  function wnBuildRink(){
    if (!wn || typeof WinterRules === 'undefined') return;
    const p = WinterRules.WN_POND;
    const rinkR = p.r || 7.5;
    const ice = plat(p.x, 0.5, p.z, rinkR * 2, rinkR * 2, '#3db8f0', 0.28);
    if (ice){
      ice.ice = true;
      ice.rad = rinkR; // circular footprint: overlaps() ignores the square corners
      if (ice.mesh){ ice.mesh.visible = false; wnKeep(ice.mesh); }
      wn.solids.push(ice);
    }
    const disc = new THREE.Mesh(new THREE.CylinderGeometry(rinkR, rinkR, 0.28, 48), wnMat('#3db8f0'));
    disc.position.set(p.x, 0.36, p.z); scene.add(disc); wnKeep(disc);
    const R = (p.r || 7.5) + 0.4;
    for (let i = 0; i < 16; i++){
      const mid = ((i + 0.5) / 16) * Math.PI * 2;
      let da = mid - Math.PI / 2;
      while (da > Math.PI) da -= Math.PI * 2;
      while (da < -Math.PI) da += Math.PI * 2;
      if (Math.abs(da) < 0.42) continue;
      const x = p.x + Math.cos(mid) * R;
      const z = p.z + Math.sin(mid) * R;
      wnWall(x, 0.45, z, 1.8, 0.95, 0.36, '#c9a06a');
    }
    wnLab('⛸️ Frostlane Rink', p.x, 2.5, p.z - (p.r || 7.5) - 1.1);
    wnMesh(new THREE.BoxGeometry(0.16, 1.5, 0.16), '#8b5a2b', p.x, 0.75, p.z - (p.r || 7.5) - 1.1);
  }
  function wnDoTrick(){
    if (!wn || !WinterRules.wnSkateTrick) return;
    if (wn.run.show && wn.run.show.on){ wnShowDo('hop'); return; }
    const r = WinterRules.wnSkateTrick(wn.run, wn.sv);
    if (!r.ok) return;
    wn.sv = r.state; wnSave(wn.sv); if (r.coins) wnPay(r.coins);
    banner('✨ ' + r.name + '!' + (r.coins ? (' +' + r.coins + ' 🪙') : ''));
    wnCapNote(r);
    wnHud();
  }
  function buildWinter(){
    const started = WinterRules.wnNewVisit(wnState(), Date.now());
    wn = {trash:[], solids:[], labels:[], sv: started.state, run: started.run, sledMesh:null, snowmanMesh:null, lights:[], lamp:null};
    scene.background = new THREE.Color('#9fd4ff');
    if (scene.fog){ scene.fog.color.set('#dcefff'); scene.fog.near = 22; scene.fog.far = 110; }
    plat(0, 0, 10, 90, 170, '#f4fbff', 0.28);
    const H = WinterRules.WN_HILL;
    (WinterRules.wnHillPlats() || []).forEach((b, i) => {
      plat(b.x, b.y || 0.2, b.z, b.w, b.d, i % 2 ? '#eef8ff' : '#e4f2ff', b.id === 'hill-finish' ? 0.4 : (H.platH || 1.2));
    });
    wn.lift = {x:H.x, z:H.startZ};
    wn.finish = {x:H.x, z:H.finishZ};
    (WinterRules.WN_COTTAGES || []).forEach(c => {
      wnCottage(c.x, c.z, c.color, c.roof, {w:c.w, d:c.d});
    });
    const cocoa = WinterRules.wnCottage('cocoa') || WinterRules.WN_COTTAGES[0];
    wnMesh(new THREE.CylinderGeometry(0.5, 0.6, 0.8, 10), '#5a2a12', cocoa.x, 1.1, cocoa.z + cocoa.d/2 - 0.55);
    wn.cocoa = {x:cocoa.x, z:cocoa.z + cocoa.d/2 - 0.3};
    const pondDef = WinterRules.WN_POND;
    const pond = new THREE.Mesh(new THREE.CircleGeometry(pondDef.r || 7.5, 32), wnMat('#2eb4f0'));
    pond.rotation.x = -Math.PI/2; pond.position.set(pondDef.x, 0.52, pondDef.z); scene.add(pond); wnKeep(pond);
    wn.pond = {x:pondDef.x, z:pondDef.z};
    wnBuildRink();
    wnBuildSnug();
    wnBuildTargets();
    wn.shots = []; wn.puffs = [];
    wnBuildFort();
    wnBuildJudges();
    wn.yard = {x:WinterRules.WN_YARD.x, z:WinterRules.WN_YARD.z};
    wn.posts = (WinterRules.WN_POSTS || []).map(p => ({id:p.id, x:p.x, z:p.z}));
    wn.posts.forEach(p => {
      wnMesh(new THREE.CylinderGeometry(0.25, 0.3, 1.4, 8), '#c45c1a', p.x, 0.7, p.z);
    });
    const amb = new THREE.AmbientLight(0xf4fbff, 0.8); scene.add(amb); wnKeep(amb);
    const sun = new THREE.DirectionalLight(0xfff4e0, 0.55); sun.position.set(10, 18, 8); scene.add(sun); wnKeep(sun);
    // gentle snow flakes
    wn.flakes = [];
    for (let i=0;i<40;i++){
      const f = wnMesh(new THREE.SphereGeometry(0.08, 5, 5), '#ffffff', (Math.random()-0.5)*70, 4+Math.random()*12, (Math.random()-0.5)*120);
      wn.flakes.push({m:f, s: 0.8+Math.random()*1.4});
    }
    const spawn = WinterRules.WN_SPAWN || {x:0, z:8};
    Object.assign(P, {x:spawn.x, y:0.5, z:spawn.z, vx:0, vy:0, vz:0});
    if (typeof cam !== 'undefined' && cam){ cam.yaw = 0; cam.pitch = 0.38; cam.dist = 14; }
    checkpoints[0] = {idx:0, spawn:{x:spawn.x,y:0.5,z:spawn.z}, flag:new THREE.Object3D()};
    wnPaintSnowman();
    wnBuildFestive();
    wnBind();
    wnHud();
    banner('🎄 Welcome to Pinebell Village! Build a snow fort at Snowdrift Fort Field, put on a Star Show for the judges at Frostlane Rink, and toss snowballs (Q / RB / ❄️) at mitten flags or real friends. Hits go poof with a giggle.');
  }

  function wnBuildFestive(){
    if (!wn || typeof WinterRules === 'undefined') return;
    wn.lights = [];
    (WinterRules.WN_LIGHT_SLOTS || []).forEach(s => {
      if (s.kind === 'tree'){
        wnMesh(new THREE.CylinderGeometry(0.22, 0.28, 1.4, 8), '#6b3f1a', s.x, 0.7, s.z);
        wnMesh(new THREE.ConeGeometry(1.1, 2.2, 8), '#1a6b44', s.x, 2.2, s.z);
      }
      const g = new THREE.Group();
      const cols = ['#ff6b6b','#ffd23f','#7ec8f0','#b388ff','#80ed99'];
      for (let i=0;i<8;i++){
        const m = new THREE.Mesh(new THREE.SphereGeometry(0.09, 6, 6), new THREE.MeshBasicMaterial({color: cols[i%cols.length]}));
        const a = (i / 8) * Math.PI * 2;
        const rad = s.kind === 'house' ? 1.6 : 0.7;
        m.position.set(Math.cos(a)*rad, (s.kind === 'house' ? 2.4 : 1.2) + (i%3)*0.35, Math.sin(a)*rad);
        g.add(m);
      }
      g.position.set(s.x, 0, s.z); g.visible = false; scene.add(g); wnKeep(g);
      wn.lights.push({id:s.id, mesh:g});
    });
    const lamp = WinterRules.WN_LAMP;
    wn.lamp = {x:lamp.x, z:lamp.z};
    wnMesh(new THREE.CylinderGeometry(0.12, 0.16, 3.2, 8), '#1d2340', lamp.x, 1.6, lamp.z);
    const bulb = wnMesh(new THREE.SphereGeometry(0.28, 8, 8), '#fff3bf', lamp.x, 3.4, lamp.z);
    wn.lamp.bulb = bulb;
    const wrap = WinterRules.WN_WRAP;
    wn.wrapAt = {x:wrap.x, z:wrap.z};
    wnMesh(new THREE.BoxGeometry(1.4, 0.7, 1.4), '#c44536', wrap.x, 0.4, wrap.z);
    wn.labels = (WinterRules.wnPlaceLabels() || []).map(lab => wnPlaceName(lab)).filter(Boolean);
    wnPaintLabels();
    const xbtn = document.getElementById('wnWrapX');
    if (xbtn && !xbtn._wn){ xbtn._wn = true; xbtn.addEventListener('click', ev => { ev.preventDefault(); ev.stopPropagation(); wnCloseWrap(); }); }
    wnPaintLights();
  }
  function wnPaintLights(){
    if (!wn) return;
    const hung = (wn.run && wn.run.lights) || [];
    const night = !!(wn.run && wn.run.night);
    (wn.lights||[]).forEach(L => { if (L.mesh) L.mesh.visible = hung.indexOf(L.id) >= 0; });
    try {
      document.body.classList.toggle('wnnight', night);
      if (scene.background) scene.background.set(night ? '#14213d' : '#9fd4ff');
      if (scene.fog) scene.fog.color.set(night ? '#1b2a4a' : '#dcefff');
    } catch (e){}
  }
  function wnHang(id){
    if (!wn) return;
    const r = WinterRules.wnPlaceLight(wn.sv, wn.run, id);
    if (r.state){ wn.sv = r.state; wnSave(wn.sv); }
    wnPaintLights();
    banner(r.message || 'Lights!');
    wnHud();
  }
  function wnToggleNight(){
    if (!wn) return;
    if (wnIsGuest()){ banner('🌙 The room host controls Pinebell morning and night.'); return; }
    if (!wn.run.night && (wn.run.lights||[]).length){
      const r = WinterRules.wnShowLights(wn.sv, wn.run);
      if (r.state){ wn.sv = r.state; wnSave(wn.sv); }
      banner(r.message);
    } else {
      const r = WinterRules.wnSetNight(wn.run, !wn.run.night);
      banner(r.message);
    }
    wnPaintLights();
    wnHud();
  }
  function wnOpenWrap(){
    if (!wn) return;
    WinterRules.wnWrapOpen(wn.run, !!(typeof mp !== 'undefined' && mp && mp.on));
    const box = document.getElementById('wnWrap');
    if (box) box.hidden = false;
    wnPaintWrap();
  }
  function wnCloseWrap(){
    const box = document.getElementById('wnWrap');
    if (box) box.hidden = true;
  }
  function wnPaintWrap(){
    if (!wn || !wn.run || !wn.run.wrap) return;
    const w = wn.run.wrap;
    const stepEl = document.getElementById('wnWrapStep');
    const ch = document.getElementById('wnWrapChoices');
    const sc = document.getElementById('wnWrapScore');
    if (!ch) return;
    const steps = WinterRules.WN_WRAP_STEPS;
    if (!w.open){
      if (stepEl) stepEl.textContent = 'Ribbon Rue scored this wrap!';
      ch.innerHTML = '';
      if (sc) sc.textContent = (w.score ? ('Score: ' + w.score) : '');
      return;
    }
    const part = steps[w.step|0];
    if (stepEl) stepEl.textContent = 'Step ' + ((w.step|0)+1) + ' of 4 — pick a ' + part;
    const lists = {paper:WinterRules.WN_PAPERS, ribbon:WinterRules.WN_RIBBON_COLORS, bow:WinterRules.WN_BOWS, tag:WinterRules.WN_TAGS};
    const list = lists[part] || [];
    ch.innerHTML = '';
    list.forEach(it => {
      const b = document.createElement('button');
      b.type = 'button';
      b.textContent = (it.emoji || '') + ' ' + it.name;
      if (it.color) b.style.background = it.color;
      b.onclick = () => wnPickWrap(part, it.id);
      ch.appendChild(b);
    });
    if (sc) sc.textContent = '';
  }
  function wnPickWrap(part, id){
    if (!wn) return;
    const r = WinterRules.wnWrapPick(wn.run, part, id, (typeof mp !== 'undefined' && mp && mp.me) || 'H');
    if (!r.ok){ banner(r.message || 'Pick the next step!'); wnPaintWrap(); return; }
    if (r.done){
      const roster = (typeof mp !== 'undefined' && mp && mp.on && typeof mpRoster === 'function') ? (mpRoster()||[]).filter(p=>p&&!p.npc) : [];
      const judged = WinterRules.wnWrapJudge(wn.sv, wn.run, roster.length ? roster.map(p => ({id:p.id, name:p.name, score:r.wrap.score})) : null);
      if (judged.state){ wn.sv = judged.state; wnSave(wn.sv); }
      if (judged.coins) wnPay(judged.coins);
      banner(judged.message + (judged.coins ? (' +' + judged.coins + ' 🪙') : ''));
      wnPaintWrap();
      wnHud();
      return;
    }
    banner(r.message);
    wnPaintWrap();
  }

  function wnPaintSnowman(){
    if (wn.snowmanMesh){ try{ scene.remove(wn.snowmanMesh);}catch(e){} }
    const parts = (wn.run && wn.run.snowman && wn.run.snowman.parts) || [];
    if (!parts.length){ wn.snowmanMesh = null; return; }
    const g = new THREE.Group();
    const add = (y,r) => { const m=new THREE.Mesh(new THREE.SphereGeometry(r,10,8), wnMat('#f8fbff')); m.position.y=y; g.add(m); };
    if (parts.indexOf('base')>=0) add(0.7, 0.7);
    if (parts.indexOf('mid')>=0) add(1.6, 0.5);
    if (parts.indexOf('head')>=0) add(2.3, 0.35);
    if (parts.indexOf('hat')>=0){ const h=new THREE.Mesh(new THREE.CylinderGeometry(0.22,0.22,0.28,8), wnMat('#1d2340')); h.position.y=2.7; g.add(h); }
    if (parts.indexOf('buttons')>=0){ [1.45,1.7,1.95].forEach(y => { const b=new THREE.Mesh(new THREE.SphereGeometry(0.06,6,6), wnMat('#1d2340')); b.position.set(0,y,0.48); g.add(b); }); }
    if (parts.indexOf('scarf')>=0){ const s=new THREE.Mesh(new THREE.TorusGeometry(0.32,0.07,6,10), wnMat('#ff6fb5')); s.position.y=2.05; s.rotation.x=Math.PI/2; g.add(s); }
    g.position.set(6, 0, 22); scene.add(g); wnKeep(g); wn.snowmanMesh = g;
  }
  function wnNear(x,z,r){ return Math.hypot(P.x-x, P.z-z) < (r||2.4); }
  function wnPrompt(){
    if (!wn) return null;
    if (wn.run.sled && wn.run.sled.on && !wn.run.sled.done) return {lab:'Steer with the stick · Ⓐ jump · Ⓑ hop off', act:() => wnHopOff()};
    if (wn.run.show && wn.run.show.on){
      const s = wn.run.show;
      return {lab:'🌀 Spin (E / Ⓧ)  ·  ' + (s.moves || []).length + '/' + WinterRules.WN_SHOW_MOVES + ' moves  ·  ' + Math.max(0, Math.ceil(WinterRules.WN_SHOW_T - (s.t || 0))) + 's', act:() => wnShowDo('spin')};
    }
    const J = WinterRules.WN_JUDGES;
    if (J && wnNear(J.x, J.z, 3.4)) return {lab:'⭐ Start the Star Show for the judges (E / Ⓧ)', act:() => wnStartShow()};
    if (wnInFortNow()) return {lab:'🧱 Place a snow block (E / Ⓧ)  ·  F / Ⓨ scoop', act:() => wnFortDo(true)};
    if (wn.lift && wnNear(wn.lift.x, wn.lift.z, 4)) return {lab:'Start a timed sled run (E / Ⓧ)', act:() => wnStartSled()};
    if (wn.finish && wnNear(wn.finish.x, wn.finish.z, 4) && wn.run.sled && wn.run.sled.done && !wn.run.sled.claimed) return {lab:'Collect your sled coins (E / Ⓧ)', act:() => wnCashSled()};
    if (wn.cocoa && wnNear(wn.cocoa.x, wn.cocoa.z, 2.6)) return {lab:'☕ Buy cocoa (E) or serve a mug (F / hold Ⓧ)', act:() => wnCocoa(false)};
    if (wn.snug && wnNear(wn.snug.x, wn.snug.z, 2.8)){
      const top = (typeof WinterRules.wnTopping === 'function') ? WinterRules.wnTopping(wn.snugTop) : {name:'Whipped cloud', emoji:'☁️'};
      return {lab:'☕ Snugmug: E buy / F serve  ·  ' + (top.emoji||'') + ' ' + top.name + '  ·  Q cycles toppings', act:() => wnSnugDo(false)};
    }
    if (wn.pond && wnNear(wn.pond.x, wn.pond.z, 8)){
      if (wn.run.skate && wn.run.skate.on) return {lab:'Skate a loop · jump / Ⓐ spin · Ⓑ cash laps', act:() => wnCashSkate()};
      return {lab:'Start skating at Frostlane Rink (E / Ⓧ)', act:() => wnStartSkate()};
    }
    if (wn.yard && wnNear(wn.yard.x, wn.yard.z, 3.2)) return {lab:'Build the snow pal (E / Ⓧ)', act:() => wnBuild()};
    const post = (wn.posts||[]).find(p => wnNear(p.x, p.z, 2.2));
    if (post) return {lab:'Practice snowball (E / Ⓧ)', act:() => wnToss('practice')};
    const slot = (WinterRules.WN_LIGHT_SLOTS||[]).find(s => wnNear(s.x, s.z, 2.6));
    if (slot) return {lab:'Hang twinkly lights on ' + slot.name + ' (E / Ⓧ)', act:() => wnHang(slot.id)};
    if (wn.lamp && wnNear(wn.lamp.x, wn.lamp.z, 2.4)) return {lab:(wn.run.night ? 'Switch back to morning' : 'Night mode — show off the lights') + ' (E / Ⓧ)', act:() => wnToggleNight()};
    if (wn.wrapAt && wnNear(wn.wrapAt.x, wn.wrapAt.z, 2.6)) return {lab:'Open the gift-wrapping contest (E / Ⓧ)', act:() => wnOpenWrap()};
    return null;
  }
  function wnStartSled(){
    WinterRules.wnSledStart(wn.run, Date.now());
    P.x = wn.run.sled.x; P.y = wn.run.sled.y; P.z = wn.run.sled.z;
    banner('🛷 Whoosh! Steer with A/D or the left stick, jump the bumps, and beat the clock.');
    wnHud();
  }
  function wnHopOff(){
    if (wn.run.sled){ wn.run.sled.on = false; }
    banner('You hopped off the sled.');
    wnHud();
  }
  function wnCashSled(){
    const r = WinterRules.wnSledFinish(wn.run, wn.sv);
    if (!r.ok){ banner('Finish a run first!'); return; }
    if (r.already || !(r.coins > 0)){ banner('You already collected those sled coins.'); return; }
    wn.sv = r.state; wnSave(wn.sv); wnPay(r.coins);
    banner('🏁 ' + r.message + ' ' + r.time.toFixed(1) + 's, ' + r.jumps + ' jumps. +' + r.coins + ' 🪙');
    wnHud(); wnNet();
  }
  function wnStartSkate(){
    WinterRules.wnSkateStart(wn.run);
    banner('⛸️ Skate a loop on Frostlane Rink! Jump or Ⓐ for a spin or twirl, then cash in laps when you are done.');
    wnHud();
  }
  function wnCashSkate(){
    const r = WinterRules.wnSkateBank(wn.run, wn.sv);
    if (!r.ok){ banner('Complete a full loop first!'); return; }
    wn.sv = r.state; wnSave(wn.sv); wnPay(r.coins);
    wn.run.skate.on = false;
    banner('⛸️ ' + r.laps + ' loop' + (r.laps>1?'s':'') + '! +' + r.coins + ' 🪙');
    wnHud(); wnNet();
  }
  function wnBuild(){
    const r = WinterRules.wnAddSnowmanPart(wn.run);
    if (!r.ok && r.why === 'done'){
      const fin = WinterRules.wnFinishSnowman(wn.run, wn.sv);
      if (fin.ok && fin.coins){ wn.sv = fin.state; wnSave(wn.sv); wnPay(fin.coins); banner('☃️ ' + fin.message + ' +' + fin.coins + ' 🪙'); }
      else banner('Your snow pal is already complete!');
      wnPaintSnowman(); wnHud(); wnNet(); return;
    }
    if (!r.ok){ banner(r.need ? ('Next, add the ' + r.need + '.') : 'Try the snow yard!'); return; }
    wnPaintSnowman();
    banner(r.done ? '☃️ The snow pal is ready — tap again to celebrate!' : ('☃️ Added the ' + r.parts[r.parts.length-1] + '.' + (r.need ? ' Next: ' + r.need + '.' : '')));
    if (r.done){ /* wait for second tap to claim */ }
    wnHud();
  }
  function wnCocoa(serve){
    if (serve){
      const r = WinterRules.wnServeCocoa(wn.run, wn.sv);
      if (r.ok){ wn.sv = r.state; wnSave(wn.sv); wnPay(r.coins); banner('☕ ' + r.message + ' +' + r.coins + ' 🪙'); }
      wnHud(); wnNet(); return;
    }
    const r = WinterRules.wnBuyCocoa(wn.sv, wnCoins());
    if (!r.ok){ banner('Need 5 coins for a mug — or press F to serve one.'); return; }
    if (!wnSpend(r.cost)){ banner('Need 5 coins for a mug.'); return; }
    wn.sv = r.state; wnSave(wn.sv);
    wn.run.cocoa.warm = r.warm;
    banner('☕ Mugsy hands you a toasty cocoa! Sled runs feel braver.');
    wnHud(); wnNet();
  }
  function wnToss(toId){
    const me = (typeof mp !== 'undefined' && mp && mp.me) ? mp.me : 'me';
    const roster = (typeof mp !== 'undefined' && mp && mp.on && typeof mpRoster === 'function') ? (mpRoster() || []) : [];
    const r = WinterRules.wnThrowSnowball(wn.run, wn.sv, me, toId, roster);
    if (!r.ok){ banner(r.why === 'npc' ? 'Snowball fights are for real friends only. Try a practice post!' : 'Wait a tiny second…'); return; }
    wn.sv = r.state; wnSave(wn.sv); if (r.coins) wnPay(r.coins);
    banner(r.fight ? ('❄️ Hit! +' + r.coins + ' 🪙') : ('❄️ Practice toss! +' + r.coins + ' 🪙'));
    wnHud(); wnNet();
  }
  function wnHud(){
    const hint = document.getElementById('wnHint');
    if (hint && wn){
      const s = wn.sv, run = wn.run;
      const sled = run.sled && run.sled.on ? ('  ·  🛷 ' + (run.sled.t||0).toFixed(1) + 's') : (s.sledBest ? ('  ·  best ' + Number(s.sledBest).toFixed(1) + 's') : '');
      const warm = (run.cocoa && run.cocoa.warm > 0) ? ('  ·  ☕ warm ' + Math.ceil(run.cocoa.warm) + 's') : '';
      const fight = (run.fight && (run.fight.hits || run.fight.got)) ? ('  ·  ❄️ ' + (run.fight.hits|0) + ' hits / ' + (run.fight.got|0) + ' poofed') : '';
      const fort = wnInFortNow() ? ('  ·  🧱 ' + ((run.fort && run.fort.n)|0) + ' blocks') : '';
      const show = (run.show && run.show.on) ? ('  ·  ⭐ show ' + (run.show.moves||[]).length + '/' + WinterRules.WN_SHOW_MOVES) : (s.showBest ? ('  ·  ⭐ best ' + s.showBest + '/30') : '');
      hint.textContent = '🎄 Pinebell  ·  🪙 ' + (s.coinsEarned||0) + ' earned  ·  💡 ' + (s.lights||0) + '  ·  🎁 best ' + (s.wrapBest||0) + sled + warm + fort + fight + show;
    }
    const btn = document.getElementById('wnAct');
    const p = wnPrompt();
    if (btn){ if (p){ btn.textContent = p.lab; btn.classList.add('show'); } else btn.classList.remove('show'); }
    const showOn = !!(wn && wn.run.show && wn.run.show.on);
    const fortBtn = document.getElementById('wnFortBtn');
    if (fortBtn){
      fortBtn.classList.toggle('near', !!(wn && wnInFortNow() && !showOn));
    }
    const snowBtn = document.getElementById('wnSnowBtn');
    if (snowBtn) snowBtn.textContent = showOn ? '🦢 Spiral' : '❄️ Throw';
    const topBtn = document.getElementById('wnTopBtn');
    if (topBtn){
      const near = !!(wn && wn.snug && wnNear(wn.snug.x, wn.snug.z, 2.8));
      topBtn.classList.toggle('near', near);
      const top = (typeof WinterRules !== 'undefined' && WinterRules.wnTopping) ? WinterRules.wnTopping(wn.snugTop || 'cloud') : null;
      if (top) topBtn.textContent = (top.emoji || '🍭') + ' Topping';
    }
  }
  function wnAct(){ const p = wnPrompt(); if (p) p.act(); }
  function wnKey(e){
    if (!wn) return false;
    if (e.type === 'keyup') return false;
    const c = e.code || e.key;
    if (e.repeat && (c === 'KeyE' || c === 'KeyF')) return true; // QA t332u: holding E on a sled used to hop straight back off
    if (c === 'KeyE'){ wnAct(); return true; }
    if (wn.run.show && wn.run.show.on){
      if (c === 'KeyQ' || c === 'KeyF'){ wnShowDo('spiral'); return true; }
      if (c === 'Space' && wnOnIce()){ wnShowDo('hop'); return false; }
    }
    if (c === 'KeyF' && wnInFortNow()){ wnFortDo(false); return true; }
    if (c === 'KeyF'){ if (wn.snug && wnNear(wn.snug.x, wn.snug.z, 2.8)){ wnSnugDo(true); return true; } if (wn.cocoa && wnNear(wn.cocoa.x, wn.cocoa.z, 2.6)){ wnCocoa(true); return true; } wnAct(); return true; }
    if (c === 'KeyQ'){ if (wn.snug && wnNear(wn.snug.x, wn.snug.z, 2.8)){ wnSnugCycle(); return true; } wnThrowNow(); return true; }
    if (c === 'Space' && wn.run.sled && wn.run.sled.on){ WinterRules.wnSledJump(wn.run); return true; }
    if (c === 'Space' && wn.run.skate && wn.run.skate.on && WinterRules.wnOnRink && WinterRules.wnOnRink(P.x, P.z)){ wnDoTrick(); return false; }
    if ((c === 'KeyA' || c === 'ArrowLeft') && wn.run.sled && wn.run.sled.on){ WinterRules.wnSledSteer(wn.run, -1, 0.08); return true; }
    if ((c === 'KeyD' || c === 'ArrowRight') && wn.run.sled && wn.run.sled.on){ WinterRules.wnSledSteer(wn.run, 1, 0.08); return true; }
    return false;
  }
  function wnPad(jp, s){
    if (!wn) return false;
    if (wn.run.sled && wn.run.sled.on && s){
      WinterRules.wnSledSteer(wn.run, s.lx || 0, 0.05);
      if (!wn._a && jp && jp[0]){ wn._a = true; WinterRules.wnSledJump(wn.run); }
      if (jp && !jp[0]) wn._a = false;
      if (!wn._b && jp && jp[1]){ wn._b = true; wnHopOff(); return true; }
      if (jp && !jp[1]) wn._b = false;
    }
    if (wn.run.show && wn.run.show.on){
      if (!wn._y && jp && jp[3]){ wn._y = true; wnShowDo('spiral'); return true; }
      if (jp && !jp[3]) wn._y = false;
    } else if (wnInFortNow()){
      if (!wn._y && jp && jp[3]){ wn._y = true; wnFortDo(false); return true; }
      if (jp && !jp[3]) wn._y = false;
    }
    if (!wn._x && jp && jp[2]){ wn._x = true; if (wn.snug && wnNear(wn.snug.x, wn.snug.z, 2.8) && wn._holdF) wnSnugDo(true); else if (wn.cocoa && wnNear(wn.cocoa.x, wn.cocoa.z, 2.6) && wn._holdF) wnCocoa(true); else wnAct(); return true; }
    if (jp && !jp[2]) wn._x = false;
    if (!wn._b && jp && jp[1] && wn.run.show && wn.run.show.on){ wn._b = true; wnFinishShow(); return true; }
    if (!wn._b && jp && jp[1] && wn.run.skate && wn.run.skate.on){ wn._b = true; wnCashSkate(); return true; }
    if (jp && !jp[1]) wn._b = false;
    if (!wn._rb && jp && jp[5]){ wn._rb = true; wnThrowNow(); return true; }
    if (jp && !jp[5]) wn._rb = false;
    if (!wn._lb && jp && jp[4]){ wn._lb = true; if (wn.snug && wnNear(wn.snug.x, wn.snug.z, 2.8)) wnSnugCycle(); return true; }
    if (jp && !jp[4]) wn._lb = false;
    return false;
  }
  function wnUpdate(dt){
    if (!wn) return;
    dt = Math.max(0, Math.min(0.12, +dt || 0));
    WinterRules.wnSnowballTick(wn.run, dt);
    wnTickShots(dt);
    wnTickPuffs(dt);
    wnFortGhost();
    (wn.fortFlags || []).forEach((f, n) => { if (f.m) f.m.rotation.y = Math.sin((wn.run.t || 0) * 2 + n) * 0.25; });
    if (wn.run.show && wn.run.show.on){
      WinterRules.wnShowTick(wn.run, dt);
      if (wn.run.show.done) wnFinishShow();
      else if (wn.pond && Math.hypot(P.x - wn.pond.x, P.z - wn.pond.z) > 18){ if ((wn.run.show.moves || []).length) wnFinishShow(); else { WinterRules.wnShowQuit(wn.run); banner('⭐ Show paused — visit the judges when you are ready.'); } }
    }
    if ((wn.cardT || 0) > 0){ wn.cardT -= dt; if (wn.cardT <= 0) wnShowCards(null); }
    if (!wnIsGuest() && typeof mp !== 'undefined' && mp && mp.on && wn.run.fort){ wn.fortNetT = (wn.fortNetT || 0) - dt; if (wn.fortNetT <= 0){ wn.fortNetT = 2.5; wnSendEv({fort: WinterRules.wnFortWire(wn.run.fort)}); } }
    if (wn.run && wn.run.night && wn.lights){ const tnow = (wn.run.t = (wn.run.t||0)+dt); wn.lights.forEach((L,i)=>{ if (!L.mesh||!L.mesh.visible) return; L.mesh.children.forEach((c,j)=>{ if (c.material) c.material.opacity = 0.65 + 0.35*Math.sin(tnow*4 + i + j); c.material.transparent = true; }); }); }
    (wn.flakes||[]).forEach(f => {
      if (!f.m) return;
      f.m.position.y -= (f.s||1) * dt;
      if (f.m.position.y < 0.4){ f.m.position.y = 12; f.m.position.x = (Math.random()-0.5)*70; f.m.position.z = (Math.random()-0.5)*120; }
    });
    if (wn.run.sled && wn.run.sled.on && !wn.run.sled.done){
      WinterRules.wnSledTick(wn.run, dt);
      P.x = wn.run.sled.x; P.y = wn.run.sled.y; P.z = wn.run.sled.z; P.vx = P.vz = 0;
      if (wn.run.sled.done) banner('🏁 You reached the finish! Collect your coins.');
    }
    if (wn.pond && WinterRules.wnOnRink && WinterRules.wnOnRink(P.x, P.z)){
      if (!wn.run.skate || !wn.run.skate.on) WinterRules.wnSkateStart(wn.run);
    }
    if (wn.run.skate && wn.run.skate.on){
      const ax = P.x - (wn.pond.x||20), az = P.z - (wn.pond.z|| 4);
      WinterRules.wnSkateTick(wn.run, ax, az, dt);
      if (WinterRules.wnOnRink && WinterRules.wnOnRink(P.x, P.z)){
        if (P.vy > 2 && !wn.run.skate._hop){ wn.run.skate._hop = true; if (wn.run.show && wn.run.show.on) wnShowDo('hop'); else wnDoTrick(); }
        if (P.onGround) wn.run.skate._hop = false;
      }
    }
    wnPaintLabels();
    wnHud();
    if (!wnIsGuest()) wnNet();
  }
  function wnIsGuest(){ try { return !!(typeof mp !== 'undefined' && mp && mp.on && !mp.host); } catch(e){ return false; } }
  function wnWire(){ return wn ? WinterRules.wnWire(wn.sv, wn.run) : null; }
  function wnApply(snap){ if (wn && snap){ if (snap.sledBest) wn.sv.sledBest = snap.sledBest;
    // QA t337u: night is the host's; a joiner adopts it so nobody is in daylight while a friend sees the lights.
    if (wnIsGuest() && typeof snap.night === 'boolean' && !!wn.run.night !== snap.night){ WinterRules.wnSetNight(wn.run, snap.night); wnPaintLights(); }
    wnHud(); } }
  function wnNet(){
    if (wnIsGuest() || !wn || typeof mp === 'undefined' || !mp || !mp.on || typeof mpSend !== 'function') return;
    try { mpSend({t:'wn', snap: wnWire()}); } catch (e){}
  }
  function wnFromNet(g, d){
    if (!d) return;
    if (d.snap) wnApply(d.snap);
    if (d.ev){
      wnEv(d);
      // host relays a guest's fort block / snowball to everyone else in the room
      if (g && typeof mp !== 'undefined' && mp && mp.host && typeof mpBroadcast === 'function'){ try { mpBroadcast(d, g.conn); } catch(e){} }
    }
  }
  function wnFromHost(d){
    if (!d) return;
    if (d.snap) wnApply(d.snap);
    if (d.ev) wnEv(d);
    if (typeof d.fort === 'string' && wn && String(d.fort).length < 4000){
      const next = WinterRules.wnFortUnwire(d.fort);
      const old = wn.run.fort;
      wn.run.fort = next;
      const keys = new Set(Object.keys((old && old.cells) || {}).concat(Object.keys(next.cells || {})));
      keys.forEach(k => { const a = k.split(','); if (WinterRules.wnFortH(old, +a[0], +a[1]) !== WinterRules.wnFortH(next, +a[0], +a[1])) wnPaintFortCell(+a[0], +a[1]); });
    }
  }
  function wnBind(){
    const a=document.getElementById('wnAct');
    if (a && !a.__wn){ a.__wn=true; a.addEventListener('click', ev => { ev.preventDefault(); wnAct(); }); }
    const snow=document.getElementById('wnSnowBtn');
    if (snow && !snow.__wn){ snow.__wn=true; snow.addEventListener('click', ev => { ev.preventDefault(); ev.stopPropagation(); wnThrowNow(); }); }
    const scoop=document.getElementById('wnFortBtn');
    if (scoop && !scoop.__wn){ scoop.__wn=true; scoop.addEventListener('click', ev => { ev.preventDefault(); ev.stopPropagation(); wnFortDo(false); }); }
    const cycle=document.getElementById('wnTopBtn');
    if (cycle && !cycle.__wn){ cycle.__wn=true; cycle.addEventListener('click', ev => { ev.preventDefault(); wnSnugCycle(); }); }
  }
  function winterStop(){
    if (!wn) return;
    (wn.solids||[]).forEach(b => { try{ b.active=false; if (typeof solids!=='undefined'){ const i=solids.indexOf(b); if(i>=0) solids.splice(i,1);} }catch(e){} });
    (wn.trash||[]).forEach(m => { try{ scene.remove(m);}catch(e){} });
    wn=null;
    const box=document.getElementById('wnBox'); if(box) box.style.display='none';
    const b=document.getElementById('wnAct'); if(b) b.classList.remove('show');
  }
  if (typeof window !== 'undefined') window.wnDebug = {
    village(){ if (!wn) return; const s=WinterRules.WN_SPAWN||{x:0,z:8}; P.x=s.x; P.y=0.5; P.z=s.z; if (cam){ cam.yaw=0.15; cam.pitch=0.42; cam.dist=28; } wnPaintLabels(); },
    layout(){ if (!wn) return; P.x=0; P.y=0.5; P.z=42; if (cam){ cam.yaw=0; cam.pitch=0.52; cam.dist=42; } (wn.labels||[]).forEach(lab => { if (lab) lab.visible = true; }); },
    lights(){ if (!wn) return; (WinterRules.WN_LIGHT_SLOTS||[]).forEach(s => WinterRules.wnPlaceLight(wn.sv, wn.run, s.id)); WinterRules.wnShowLights(wn.sv, wn.run); wnPaintLights(); const s=WinterRules.WN_SPAWN||{x:0,z:8}; P.x=s.x; P.y=0.5; P.z=s.z+2; if (cam){ cam.yaw=0.2; cam.pitch=0.4; cam.dist=30; } wnPaintLabels(); },
    wrap(){ if (!wn) return; const w=WinterRules.WN_WRAP; P.x=w.x; P.y=0.5; P.z=w.z+2; wnOpenWrap(); if (cam){ cam.yaw=0; cam.pitch=0.4; cam.dist=10; } },
    sled(){ if (!wn) return; wnStartSled(); for (let i=0;i<20;i++) WinterRules.wnSledTick(wn.run, 0.08); P.x=wn.run.sled.x; P.y=wn.run.sled.y; P.z=wn.run.sled.z; if (cam){ cam.yaw=Math.PI; cam.pitch=0.28; cam.dist=12; } },
    pond(){ if (!wn) return; const p=WinterRules.WN_POND; P.x=p.x; P.y=0.5; P.z=p.z; },
    fort(demo){ if (!wn) return; const F=WinterRules.WN_FORT; P.x=F.x; P.y=0.5; P.z=F.z-6.5; P.vx=P.vz=0; if (cam){ cam.yaw=Math.PI; cam.pitch=0.4; cam.dist=14; }
      if (demo){ const D=WinterRules.wnFortDims(); for (let i=3;i<D.cols-3;i++){ WinterRules.wnFortSet(wn.run.fort, i, 4, (i%3===0)?2:3); wnPaintFortCell(i, 4); } [[3,3],[3,2],[D.cols-4,3],[D.cols-4,2]].forEach(c => { WinterRules.wnFortSet(wn.run.fort, c[0], c[1], 2); wnPaintFortCell(c[0], c[1]); }); } wnHud(); },
    place(n){ if (!wn) return; for (let k=0;k<(n||1);k++) wnFortDo(true); },
    scoop(){ if (!wn) return; wnFortDo(false); },
    throwAt(x, z){ if (!wn) return; if (cam){ cam.yaw = Math.atan2(-(x - P.x), -(z - P.z)); } wn.run.snowball.cool = 0; wnThrowNow(); },
    judges(){ if (!wn) return; const J=WinterRules.WN_JUDGES; P.x=J.x; P.y=0.5; P.z=J.z+3; P.vx=P.vz=0; if (cam){ cam.yaw=0; cam.pitch=0.3; cam.dist=9; } wnHud(); },
    show(){ if (!wn) return; const p=WinterRules.WN_POND; wnStartShow(); P.x=p.x; P.y=0.6; P.z=p.z; P.vx=P.vz=0; if (cam){ cam.yaw=Math.PI; cam.pitch=0.32; cam.dist=13; } },
    move(kind){ if (!wn || !wn.run.show) return null; wn.run.show.cool = 0; wnShowDo(kind || 'spin'); return wn.run.show ? {moves:(wn.run.show.moves||[]).length, on:!!wn.run.show.on, sum:wn.run.show.sum|0} : null; },
    showProbe(){ return wn && wn.run.show ? {on:!!wn.run.show.on, moves:(wn.run.show.moves||[]).length, claimed:!!wn.run.show.claimed, sum:wn.run.show.sum|0, shows:wn.sv.shows|0, showPaid:wn.sv.showPaid|0} : null; },
    at(x, z, y){ if (!wn) return; P.x = x; P.z = z; P.y = y == null ? 0.6 : y; P.vx = P.vz = 0; },
    aim(x, z, pitch, dist){ if (!wn || !cam) return; cam.yaw = Math.atan2(-(x - P.x), -(z - P.z)); if (pitch != null) cam.pitch = pitch; if (dist != null) cam.dist = dist; },
    fortProbe(){ return wn ? {n:(wn.run.fort&&wn.run.fort.n)|0, forts:wn.sv.forts|0, inFort: wnInFortNow(), hits:(wn.run.fight&&wn.run.fight.hits)|0, walls:(wn.run.fight&&wn.run.fight.walls)|0} : null; },
    probe(){ return wn ? {area:wn.run.area, sled:!!(wn.run.sled&&wn.run.sled.on), snowman:(wn.run.snowman.parts||[]).length, labels:(wn.labels||[]).length} : null; }
  };
