  /* ---------- Glimmergill Cove ---------- */
  let mm = null;
  function mmKeep(m){ if (m && mm && mm.trash) mm.trash.push(m); return m; }
  function mmMat(c,o){ return new THREE.MeshLambertMaterial(Object.assign({color:c, side:THREE.DoubleSide}, o||{})); }
  function mmMesh(geo,c,x,y,z,o){ const m=new THREE.Mesh(geo, mmMat(c,o)); m.position.set(x,y,z); scene.add(m); return mmKeep(m); }
  function mmState(){ return MermaidRules.mmLoad(typeof load === 'function' ? load(MermaidRules.MM_KEY, null) : null); }
  function mmSave(s){ if (typeof save === 'function') save(MermaidRules.MM_KEY, s); if (mm) mm.sv = s; }
  function mmLab(text,x,y,z){
    try { if (typeof t297Lab === 'function'){ const m = t297Lab(text, x, y, z); if (m) return mmKeep(m); } } catch(e){}
    return mmMesh(new THREE.BoxGeometry(0.2,0.2,0.2), '#fff', x,y,z);
  }
  function mmWall(x,y,z,w,h,d,c){
    const b = plat(x, y + h, z, w, d, c, h);
    if (b && b.mesh){ b.mesh.material = mmMat(c); mmKeep(b.mesh); }
    if (b && mm) mm.solids.push(b);
    return b;
  }
  function mmSplitWall(along, a0, a1, fixed, gaps, color){
    const h = (typeof MermaidRules !== 'undefined' && MermaidRules.MM_WALL_H) || 6.0;
    const doorH = (typeof MermaidRules !== 'undefined' && MermaidRules.MM_DOOR_H) || 4.2;
    const th = 0.42;
    const opens = (gaps || []).map(g => ({a:g.c - g.w/2, b:g.c + g.w/2})).sort((p,q) => p.a - q.a);
    let cursor = a0;
    function seg(lo, hi, y, hh){
      if (hi - lo < 0.15) return;
      const mid = (lo + hi) / 2, len = hi - lo;
      if (along === 'x') mmWall(mid, y, fixed, len, hh, th, color);
      else mmWall(fixed, y, mid, th, hh, len, color);
    }
    opens.forEach(op => { seg(cursor, op.a, 0, h); seg(op.a, op.b, doorH, h - doorH); cursor = op.b; });
    seg(cursor, a1, 0, h);
  }
  function drawMermaid(ctx){
    if (typeof sky === 'function') sky(ctx, '#14738a', '#7ee0d6');
    else { ctx.fillStyle = '#14738a'; ctx.fillRect(0,0,320,200); }
    ctx.fillStyle = '#1c8ea3'; ctx.fillRect(0, 80, 320, 120);
    ctx.fillStyle = '#2a9d8f'; ctx.fillRect(40, 120, 80, 50);
    ctx.fillStyle = '#e9c46a'; ctx.beginPath(); ctx.arc(220, 70, 28, 0, 6.3); ctx.fill();
    ctx.font = '28px sans-serif'; ctx.fillText('🧜', 150, 130); ctx.fillText('🐚', 80, 110); ctx.fillText('🫧', 240, 140);
    if (typeof guy === 'function') guy(ctx, 160, 176, 12, '#2ec4b6');
  }
  function mmTailMesh(color){
    const g = new THREE.Group();
    const hip = new THREE.Mesh(new THREE.SphereGeometry(0.28, 10, 8), mmMat(color));
    hip.position.y = 0.55; g.add(hip);
    const mid = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.08, 1.1, 10), mmMat(color));
    mid.position.y = 0.05; mid.rotation.x = 0.35; g.add(mid);
    const fin = new THREE.Mesh(new THREE.ConeGeometry(0.45, 0.6, 6), mmMat(color));
    fin.position.set(0, -0.55, 0.15); fin.rotation.x = Math.PI; g.add(fin);
    return g;
  }
  function mmPetMesh(id, x, y, z){
    const cols = {kelpie:'#3d8bfd', jellipop:'#ff8fab', sandpip:'#f4d35e'};
    const g = new THREE.Group();
    const body = new THREE.Mesh(new THREE.SphereGeometry(id==='jellipop'?0.32:0.24, 10, 8), mmMat(cols[id]||'#3d8bfd'));
    body.position.y = 0.3; g.add(body);
    g.position.set(x,y,z); scene.add(g); mmKeep(g);
    return g;
  }
  function buildMermaid(){
    const started = MermaidRules.mmNewVisit(mmState());
    mm = {trash:[], solids:[], sv: started.state, run: started.run, shells:[], pets:[], up:0, down:0, tail:null};
    mmSave(started.state);
    try { checkpoints[0] = {idx:0, spawn:{x:0,y:1.2,z:6}, flag:new THREE.Object3D()}; } catch(e){}
    scene.background = new THREE.Color('#14738a');
    if (scene.fog){ scene.fog.color.set('#1a6f82'); scene.fog.near = 18; scene.fog.far = 70; }
    const hemi = new THREE.HemisphereLight(0xb8f1ff, 0x0b3b4a, 0.85); scene.add(hemi); mmKeep(hemi);
    const sun = new THREE.DirectionalLight(0x9fe7ff, 0.5); sun.position.set(6, 20, 8); scene.add(sun); mmKeep(sun);
    const wall = '#2a6f7c', trim = '#1f5660';
    MermaidRules.MM_ROOMS.forEach(r => {
      const fl = plat(r.x, 0, r.z, r.w, r.d, r.color, 0.3);
      if (fl && fl.mesh) mmKeep(fl.mesh);
      // no tight ceilings over the plaza so players can swim up
      if (r.id === 'home' || r.id === 'shop'){
        const ceil = mmMesh(new THREE.BoxGeometry(r.w+0.2, 0.22, r.d+0.2), '#6bb7c4', r.x, MermaidRules.MM_CEILING_Y, r.z);
      }
    });
    const dw = MermaidRules.MM_DOOR_W, dh = MermaidRules.MM_DOOR_H;
    // plaza walls with doors to home/shop/garden; plaza stays open upward and south
    mmSplitWall('z', -14, 14, -14, [{c:0, w:dw}], wall); // west to home
    mmSplitWall('z', -14, 14, 14, [{c:0, w:dw}], wall);  // east to shop
    mmSplitWall('x', -14, 14, -14, [{c:0, w:dw}], wall); // north to garden
    mmSplitWall('x', -14, 14, 14, [], wall); // south closed gently — wait, plaza should feel open south? leave a wide open south for swimming out? Brief is a town. Keep south open (no wall) so it doesn't feel boxed. Actually no wall south = player could fall off floor. Floor is 28 deep z -14..14. Open south edge is ok if walkable only in rooms.
    // home walls (meets plaza at x=-14)
    mmSplitWall('z', -8, 8, -38, [], trim);
    mmSplitWall('z', -8, 8, -14, [{c:0, w:dw}], trim);
    mmSplitWall('x', -38, -14, -8, [], trim);
    mmSplitWall('x', -38, -14, 8, [], trim);
    // shop walls (meets plaza at x=14)
    mmSplitWall('z', -8, 8, 14, [{c:0, w:dw}], trim);
    mmSplitWall('z', -8, 8, 38, [], trim);
    mmSplitWall('x', 14, 38, -8, [], trim);
    mmSplitWall('x', 14, 38, 8, [], trim);
    // garden walls (meets plaza at z=-14)
    mmSplitWall('x', -12, 12, -38, [], '#2f6f6a');
    mmSplitWall('x', -12, 12, -14, [{c:0, w:dw}], '#2f6f6a');
    mmSplitWall('z', -38, -14, -12, [], '#2f6f6a');
    mmSplitWall('z', -38, -14, 12, [], '#2f6f6a');
    mmLab('Glimmergill Plaza', 0, 3.2, 8);
    mmLab('Coral Home', -28, 3.2, 0);
    mmLab('Pearl Shop', 28, 3.2, 0);
    mmLab('Shell Garden', 0, 3.2, -28);
    // coral / decor already owned
    (mm.sv.decor||[]).forEach((id,i) => {
      const item = MermaidRules.MM_DECOR.find(d => d.id === id);
      if (!item) return;
      mmMesh(new THREE.SphereGeometry(0.35, 8, 8), '#ff8fab', -28 + (i-1)*1.4, 0.6, -2);
      // QA t330u: decor labels sat 1.4 apart and piled into one smear; stagger and shrink them.
      { const lab = mmLab(item.emoji + ' ' + item.name, -28 + (i-1)*1.4, 1.5 + (i % 3) * 0.6, -2); if (lab && lab.scale) lab.scale.multiplyScalar(0.6); }
    });
    mm.shopAt = {x:28, z:0};
    mmMesh(new THREE.CylinderGeometry(0.5, 0.6, 1.0, 10), '#e9c46a', 28, 0.6, 2);
    mmLab('🛍️ Pearl shop', 28, 2.2, 2);
    // shells
    mm.shells = [];
    MermaidRules.MM_SHELLS.forEach(s => {
      const have = (mm.sv.found||[]).indexOf(s.id) >= 0;
      const m = mmMesh(new THREE.SphereGeometry(0.22, 8, 8), '#f6e7c1', s.x, s.y, s.z);
      const lab = mmLab(s.emoji + ' ' + s.name, s.x, s.y+0.8, s.z);
      if (m) m.visible = !have;
      if (lab) lab.visible = !have;
      mm.shells.push({id:s.id, mesh:m, label:lab, x:s.x, y:s.y, z:s.z});
    });
    // sea pets
    mm.pets = [];
    MermaidRules.MM_PETS.forEach((p,i) => {
      const m = mmPetMesh(p.id, 4 + i*2.2, 1.2, 6);
      mm.pets.push({id:p.id, mesh:m, x:4+i*2.2, z:6});
      { const lab = mmLab(p.emoji + ' ' + p.name, 4+i*2.2, 2.2 + (i % 2) * 0.7, 6); if (lab && lab.scale) lab.scale.multiplyScalar(0.65); }   // QA t330u: sea-pet names overlapped
    });
    // bubbles
    mm.bubbles = [];
    for (let i=0;i<24;i++){
      const b = mmMesh(new THREE.SphereGeometry(0.08+Math.random()*0.08, 6, 6), '#d6f6ff', (Math.random()-0.5)*40, Math.random()*12, (Math.random()-0.5)*40);
      if (b && b.material){ b.material.transparent = true; b.material.opacity = 0.45; }
      mm.bubbles.push({m:b, s: 0.4+Math.random()});
    }
    if (typeof P !== 'undefined'){ P.x=0; P.y=1.2; P.z=6; P.vy=0; }
    if (typeof cam !== 'undefined'){ cam.yaw = 0; cam.pitch = 0.25; cam.dist = 10; }
    mmBind();
    mmHud();
    banner('🧜 Welcome to Glimmergill Cove! Pick a merfolk tail, swim up and down, collect shells, and decorate your coral home. No scary monsters here — just friends.');
  }
  function mmBind(){
    const up = document.getElementById('mmUp'), down = document.getElementById('mmDown'), act = document.getElementById('mmAct');
    function hold(el, key){
      if (!el || el._mm) return;
      el._mm = true;
      const on = ev => { ev.preventDefault(); if (mm) mm[key] = 1; };
      const off = ev => { ev.preventDefault(); if (mm) mm[key] = 0; };
      el.addEventListener('pointerdown', on);
      el.addEventListener('pointerup', off);
      el.addEventListener('pointerleave', off);
      el.addEventListener('pointercancel', off);
    }
    hold(up, 'up'); hold(down, 'down');
    if (act && !act._mm){ act._mm = true; act.addEventListener('pointerdown', ev => { ev.preventDefault(); mmAct(); }); }
    const box = document.getElementById('mmBox');
    if (box) box.style.display = '';
  }
  function mmNear(x,z,r){ return typeof P !== 'undefined' && Math.hypot(P.x-x, P.z-z) < (r||2.4); }
  function mmPrompt(){
    if (!mm) return null;
    const sh = (mm.shells||[]).find(s => s.mesh && s.mesh.visible && Math.hypot((P.x-s.x), (P.y-(s.y||1)), (P.z-s.z)) < 2.4);
    if (sh) return {lab:'Collect the ' + sh.id + ' shell (E / Ⓧ)', act:() => mmDoShell(sh.id)};
    if (mm.shopAt && mmNear(mm.shopAt.x, mm.shopAt.z, 2.6)) return {lab:'Browse the pearl shop (E / Ⓧ)', act:() => mmDoShop()};
    const pet = (mm.pets||[]).find(p => mmNear(p.x, p.z, 2.2) && !(mm.sv.pals||[]).includes(p.id));
    if (pet) return {lab:'Befriend ' + pet.id + ' with a kelp treat (E / Ⓧ)', act:() => mmDoPet(pet.id)};
    if (MermaidRules.mmRoomAt(P.x,P.z)==='home') return {lab:'This is your coral home. Buy decor at the pearl shop!', act:null};
    return null;
  }
  function mmHud(){
    const hint = document.getElementById('mmHint');
    if (hint && mm){
      const s = mm.sv || {}, tail = MermaidRules.mmTail(s.tail);
      hint.textContent = '🧜 Glimmergill  ·  🐚 ' + (s.shells||0) + '  ·  ⚪ ' + (s.pearls||0) + ' pearls  ·  tail ' + tail.name;
    }
    const btn = document.getElementById('mmAct');
    const p = mmPrompt();
    if (btn){ if (p && p.act){ btn.textContent = p.lab; btn.classList.add('show'); } else btn.classList.remove('show'); }
  }
  function mmAct(){ const p = mmPrompt(); if (p && p.act) p.act(); }
  function mmDoShell(id){
    const r = MermaidRules.mmCollectShell(mm.sv, mm.run, id);
    if (!r.ok){ banner(r.message || 'Already collected!'); return; }
    mm.sv = r.state; mmSave(mm.sv);
    const sh = (mm.shells||[]).find(s => s.id === id);
    if (sh){ if (sh.mesh) sh.mesh.visible = false; if (sh.label) sh.label.visible = false; }
    banner(r.message);
    mmHud();
  }
  function mmDoShop(){
    if (!mm) return;
    // buy next affordable unowned thing, cycling tails first
    const list = MermaidRules.MM_SHOP || [];
    let bought = null;
    for (let i=0;i<list.length;i++){
      const it = list[i];
      const r = MermaidRules.mmBuy(mm.sv, 0, it.id);
      if (r.ok){ bought = r; break; }
    }
    if (!bought){ banner('Swim around for more shells and pearls, then come back!'); return; }
    mm.sv = bought.state; mmSave(mm.sv);
    banner(bought.message);
    mmHud();
  }
  function mmDoPet(id){
    const r = MermaidRules.mmBefriend(mm.sv, id);
    if (!r.ok){ banner(r.message || 'Visit the pearl shop for a kelp treat first.'); return; }
    mm.sv = r.state; mmSave(mm.sv);
    banner(r.message);
    mmHud();
  }
  function mmSwimInput(){
    let up = (mm && mm.up) ? 1 : 0, down = (mm && mm.down) ? 1 : 0;
    try {
      if (typeof keys !== 'undefined'){
        if (keys.Space || keys.KeyR || keys.ArrowUp) up = 1;
        if (keys.ShiftLeft || keys.ShiftRight || keys.KeyF || keys.ArrowDown) down = 1;
      }
      const gps = (typeof navigator !== 'undefined' && navigator.getGamepads) ? navigator.getGamepads() : [];
      const g = gps && (gps[0] || gps[1]);
      if (g && g.buttons){
        if ((g.buttons[7] && g.buttons[7].pressed) || (g.buttons[5] && g.buttons[5].pressed)) up = 1;
        if ((g.buttons[6] && g.buttons[6].pressed) || (g.buttons[4] && g.buttons[4].pressed)) down = 1;
      }
    } catch(e){}
    return {up, down, x: typeof P!=='undefined'?P.x:0, z: typeof P!=='undefined'?P.z:0};
  }
  function mmUpdate(dt){
    if (!mm || typeof mode === 'undefined' || mode !== 'mermaid') return;
    dt = Math.max(0, Math.min(0.12, +dt || 0));
    const ins = mmSwimInput();
    const r = MermaidRules.mmSwimTick(mm.run, ins, dt);
    if (typeof P !== 'undefined'){
      P.y = r.y;
      if (r.push){ P.x += r.push.x; P.z += r.push.z; }
      if (!MermaidRules.mmWalkable(P.x, P.z)){
        // soft clamp back
        P.x -= (r.push && r.push.x) || 0;
        P.z -= (r.push && r.push.z) || 0;
      }
    }
    (mm.bubbles||[]).forEach(b => {
      if (!b.m) return;
      b.m.position.y += b.s * dt * 1.6;
      if (b.m.position.y > 16){ b.m.position.y = 0.3; b.m.position.x = (Math.random()-0.5)*40; b.m.position.z = (Math.random()-0.5)*40; }
    });
    const p = mmPrompt();
    if (!mm._same || (p && p.lab) !== mm._same){ mm._same = p && p.lab; mmHud(); }
  }
  function mmKey(e){
    if (!mm || !e) return false;
    const c = e.code || e.key;
    if (e.type === 'keyup' || e.repeat) return e.type !== 'keyup' && c === 'KeyE'; // QA t332u: keyup also routes here; act once per press
    if (c === 'KeyE'){ mmAct(); return true; }
    if (c === 'Space' || c === 'KeyR' || c === 'KeyF' || c === 'ShiftLeft') return true;
    return false;
  }
  function mmPad(jp, s){
    if (!mm || !jp) return false;
    if (jp[2] || (jp[0] && mmPrompt() && mmPrompt().act)){ mmAct(); if (typeof pad !== 'undefined') pad.jump = false; return true; }
    return false;
  }
  function mermaidStop(){
    if (!mm) return;
    (mm.solids||[]).forEach(b => { try{ b.active=false; if (typeof solids!=='undefined'){ const i=solids.indexOf(b); if(i>=0) solids.splice(i,1);} }catch(e){} });
    (mm.trash||[]).forEach(m => { try{ scene.remove(m);}catch(e){} });
    mm=null;
    const box=document.getElementById('mmBox'); if(box) box.style.display='none';
    const b=document.getElementById('mmAct'); if(b) b.classList.remove('show');
  }
  if (typeof window !== 'undefined') window.mmDebug = {
    plaza(){ if (!mm) return; P.x=0; P.y=2; P.z=6; if (cam){ cam.yaw=0; cam.pitch=0.28; cam.dist=12; } },
    garden(){ if (!mm) return; P.x=0; P.y=3; P.z=-28; if (cam){ cam.yaw=0; cam.pitch=0.3; cam.dist=12; } },
    home(){ if (!mm) return; P.x=-28; P.y=1.2; P.z=0; if (cam){ cam.yaw=Math.PI/2; cam.pitch=0.3; cam.dist=10; } }
  };
