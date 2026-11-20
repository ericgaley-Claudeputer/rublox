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
  function buildWinter(){
    const started = WinterRules.wnNewVisit(wnState(), Date.now());
    wn = {trash:[], solids:[], sv: started.state, run: started.run, sledMesh:null, snowmanMesh:null, lights:[], lamp:null};
    scene.background = new THREE.Color('#9fd4ff');
    if (scene.fog){ scene.fog.color.set('#dcefff'); scene.fog.near = 22; scene.fog.far = 110; }
    plat(0, 0, 10, 90, 170, '#f4fbff', 0.28);
    // Sledwhistle Hill
    for (let i = 0; i < 10; i++){
      const z = -70 + i * 12, y = 14 - i * 1.4;
      plat(0, y, z, 18, 12, i % 2 ? '#eef8ff' : '#e4f2ff', 1.2);
    }
    plat(0, 0.2, 48, 20, 16, '#eef8ff', 0.4);
    wnLab('🛷 Sledwhistle Hill', 0, 16, -70);
    wnLab('🏁 Finish', 0, 2.2, 48);
    wn.lift = {x:0, z:-70};
    wn.finish = {x:0, z:48};
    // Village
    wnCottage(-16, 8, '#c45c1a', '#8b2e1a', {w:7, d:5.5});
    wnCottage(16, 12, '#3a86ff', '#1d4a8a');
    wnCottage(-6, 22, '#2ec27e', '#1a6b44');
    wnLab('🎄 Pinebell Village', 0, 3.6, 4);
    // Cocoa shop lives in the red cottage; the mug sits just inside the doorway
    wnMesh(new THREE.CylinderGeometry(0.5, 0.6, 0.8, 10), '#5a2a12', -16, 1.1, 10.2);
    wn.cocoa = {x:-16, z:10.75};
    wnLab('☕ Mugsy’s Cocoa', -16, 3.6, 11.2);
    // Skating pond
    const pond = new THREE.Mesh(new THREE.CircleGeometry(7.5, 24), wnMat('#b8e8ff'));
    pond.rotation.x = -Math.PI/2; pond.position.set(16, 0.32, -2); scene.add(pond); wnKeep(pond);
    wn.pond = {x:16, z:-2};
    wnLab('⛸️ Glassgill Pond', 16, 2.4, 6);
    // Snowman yard + practice posts
    wn.yard = {x:6, z:22};
    wnLab('☃️ Snow pal yard', 6, 2.2, 26);
    wn.posts = [{x:-8,z:22},{x:-12,z:20},{x:-6,z:18}];
    wn.posts.forEach((p,i) => {
      wnMesh(new THREE.CylinderGeometry(0.25, 0.3, 1.4, 8), '#c45c1a', p.x, 0.7, p.z);
      wnLab('🎯 Post ' + (i+1), p.x, 2.0, p.z);
    });
    wnLab('❄️ Practice tosses', -8, 2.6, 26);
    const amb = new THREE.AmbientLight(0xf4fbff, 0.8); scene.add(amb); wnKeep(amb);
    const sun = new THREE.DirectionalLight(0xfff4e0, 0.55); sun.position.set(10, 18, 8); scene.add(sun); wnKeep(sun);
    // gentle snow flakes
    wn.flakes = [];
    for (let i=0;i<40;i++){
      const f = wnMesh(new THREE.SphereGeometry(0.08, 5, 5), '#ffffff', (Math.random()-0.5)*70, 4+Math.random()*12, (Math.random()-0.5)*120);
      wn.flakes.push({m:f, s: 0.8+Math.random()*1.4});
    }
    Object.assign(P, {x:0, y:0.5, z:8, vx:0, vy:0, vz:0});
    if (typeof cam !== 'undefined' && cam){ cam.yaw = 0; cam.pitch = 0.38; cam.dist = 14; }
    checkpoints[0] = {idx:0, spawn:{x:0,y:0.5,z:8}, flag:new THREE.Object3D()};
    wnPaintSnowman();
    wnBuildFestive();
    wnBind();
    wnHud();
    banner('🎄 Welcome to Pinebell Village! Sled, skate, build a snow pal, sip cocoa, and toss practice snowballs. Races and snowball fights are for real friends only.');
  }

  function wnBuildFestive(){
    if (!wn || typeof WinterRules === 'undefined') return;
    wn.lights = [];
    (WinterRules.WN_LIGHT_SLOTS || []).forEach(s => {
      if (s.kind === 'tree'){
        wnMesh(new THREE.CylinderGeometry(0.22, 0.28, 1.4, 8), '#6b3f1a', s.x, 0.7, s.z);
        wnMesh(new THREE.ConeGeometry(1.1, 2.2, 8), '#1a6b44', s.x, 2.2, s.z);
      }
      wnLab(s.kind === 'tree' ? '🎄 ' + s.name : '🏠 ' + s.name, s.x, s.kind==='tree'?3.5:3.2, s.z);
      const g = new THREE.Group();
      const cols = ['#ff6b6b','#ffd23f','#7ec8f0','#b388ff','#80ed99'];
      for (let i=0;i<8;i++){
        const m = new THREE.Mesh(new THREE.SphereGeometry(0.09, 6, 6), new THREE.MeshBasicMaterial({color: cols[i%cols.length]}));
        const a = (i / 8) * Math.PI * 2;
        m.position.set(Math.cos(a)*0.7, 1.2 + (i%3)*0.35, Math.sin(a)*0.7);
        g.add(m);
      }
      g.position.set(s.x, 0, s.z); g.visible = false; scene.add(g); wnKeep(g);
      wn.lights.push({id:s.id, mesh:g});
    });
    wn.lamp = {x:0, z:6};
    wnMesh(new THREE.CylinderGeometry(0.12, 0.16, 3.2, 8), '#1d2340', 0, 1.6, 6);
    const bulb = wnMesh(new THREE.SphereGeometry(0.28, 8, 8), '#fff3bf', 0, 3.4, 6);
    wn.lamp.bulb = bulb;
    wnLab('🌙 Night lamp', 0, 4.0, 6);
    wn.wrapAt = {x:4, z:8};
    wnMesh(new THREE.BoxGeometry(1.4, 0.7, 1.4), '#c44536', 4, 0.4, 8);
    wnLab('🎁 Wrap table', 4, 1.6, 8);
    const xbtn = document.getElementById('wnWrapX');
    if (xbtn && !xbtn._wn){ xbtn._wn = true; xbtn.addEventListener('click', () => wnCloseWrap()); }
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
    if (wn.lift && wnNear(wn.lift.x, wn.lift.z, 4)) return {lab:'Start a timed sled run (E / Ⓧ)', act:() => wnStartSled()};
    if (wn.finish && wnNear(wn.finish.x, wn.finish.z, 4) && wn.run.sled && wn.run.sled.done) return {lab:'Collect your sled coins (E / Ⓧ)', act:() => wnCashSled()};
    if (wn.cocoa && wnNear(wn.cocoa.x, wn.cocoa.z, 2.6)) return {lab:'☕ Buy cocoa (E) or serve a mug (F / hold Ⓧ)', act:() => wnCocoa(false)};
    if (wn.pond && wnNear(wn.pond.x, wn.pond.z, 8)){
      if (wn.run.skate && wn.run.skate.on) return {lab:'Skate a loop · Ⓑ cash laps', act:() => wnCashSkate()};
      return {lab:'Start skating (E / Ⓧ)', act:() => wnStartSkate()};
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
    wn.sv = r.state; wnSave(wn.sv); wnPay(r.coins);
    banner('🏁 ' + r.message + ' ' + r.time.toFixed(1) + 's, ' + r.jumps + ' jumps. +' + r.coins + ' 🪙');
    wnHud(); wnNet();
  }
  function wnStartSkate(){
    WinterRules.wnSkateStart(wn.run);
    banner('⛸️ Skate a loop around Glassgill Pond! Cash in laps when you are done.');
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
      hint.textContent = '🎄 Pinebell  ·  🪙 ' + (s.coinsEarned||0) + ' earned  ·  💡 ' + (s.lights||0) + '  ·  🎁 best ' + (s.wrapBest||0) + sled;
    }
    const btn = document.getElementById('wnAct');
    const p = wnPrompt();
    if (btn){ if (p){ btn.textContent = p.lab; btn.classList.add('show'); } else btn.classList.remove('show'); }
  }
  function wnAct(){ const p = wnPrompt(); if (p) p.act(); }
  function wnKey(e){
    if (!wn) return false;
    if (e.type === 'keyup') return false;
    const c = e.code || e.key;
    if (c === 'KeyE'){ wnAct(); return true; }
    if (c === 'KeyF'){ if (wn.cocoa && wnNear(wn.cocoa.x, wn.cocoa.z, 2.6)){ wnCocoa(true); return true; } wnAct(); return true; }
    if (c === 'Space' && wn.run.sled && wn.run.sled.on){ WinterRules.wnSledJump(wn.run); return true; }
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
    if (!wn._x && jp && jp[2]){ wn._x = true; if (wn.cocoa && wnNear(wn.cocoa.x, wn.cocoa.z, 2.6) && wn._holdF) wnCocoa(true); else wnAct(); return true; }
    if (jp && !jp[2]) wn._x = false;
    if (!wn._b && jp && jp[1] && wn.run.skate && wn.run.skate.on){ wn._b = true; wnCashSkate(); return true; }
    if (jp && !jp[1]) wn._b = false;
    return false;
  }
  function wnUpdate(dt){
    if (!wn) return;
    dt = Math.max(0, Math.min(0.12, +dt || 0));
    WinterRules.wnSnowballTick(wn.run, dt);
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
    if (wn.run.skate && wn.run.skate.on){
      const ax = P.x - (wn.pond.x||16), az = P.z - (wn.pond.z|| -2);
      WinterRules.wnSkateTick(wn.run, ax, az, dt);
    }
    wnHud();
    if (!wnIsGuest()) wnNet();
  }
  function wnIsGuest(){ try { return !!(typeof mp !== 'undefined' && mp && mp.on && !mp.host); } catch(e){ return false; } }
  function wnWire(){ return wn ? WinterRules.wnWire(wn.sv, wn.run) : null; }
  function wnApply(snap){ if (wn && snap){ if (snap.sledBest) wn.sv.sledBest = snap.sledBest; wnHud(); } }
  function wnNet(){
    if (wnIsGuest() || !wn || typeof mp === 'undefined' || !mp || !mp.on || typeof mpSend !== 'function') return;
    try { mpSend({t:'wn', snap: wnWire()}); } catch (e){}
  }
  function wnFromNet(g, d){ if (d && d.snap) wnApply(d.snap); }
  function wnFromHost(d){ wnFromNet(null, d); }
  function wnBind(){
    const a=document.getElementById('wnAct');
    if (a && !a.__wn){ a.__wn=true; a.addEventListener('click', ev => { ev.preventDefault(); wnAct(); }); }
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
    village(){ if (!wn) return; P.x=0; P.y=0.5; P.z=8; if (cam){ cam.yaw=0; cam.pitch=0.4; cam.dist=16; } },
    lights(){ if (!wn) return; (WinterRules.WN_LIGHT_SLOTS||[]).forEach(s => WinterRules.wnPlaceLight(wn.sv, wn.run, s.id)); WinterRules.wnShowLights(wn.sv, wn.run); wnPaintLights(); P.x=0; P.y=0.5; P.z=10; if (cam){ cam.yaw=0; cam.pitch=0.35; cam.dist=14; } },
    wrap(){ if (!wn) return; P.x=4; P.y=0.5; P.z=10; wnOpenWrap(); if (cam){ cam.yaw=0; cam.pitch=0.4; cam.dist=10; } },
    sled(){ if (!wn) return; wnStartSled(); for (let i=0;i<20;i++) WinterRules.wnSledTick(wn.run, 0.08); P.x=wn.run.sled.x; P.y=wn.run.sled.y; P.z=wn.run.sled.z; if (cam){ cam.yaw=Math.PI; cam.pitch=0.28; cam.dist=12; } },
    pond(){ if (!wn) return; P.x=16; P.y=0.5; P.z=-2; },
    probe(){ return wn ? {area:wn.run.area, sled:!!(wn.run.sled&&wn.run.sled.on), snowman:(wn.run.snowman.parts||[]).length} : null; }
  };
