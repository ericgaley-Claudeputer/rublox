  /* ---------- Mallowmist Manor ---------- */
  let mn = null;
  function mnKeep(m){ if (m && mn && mn.trash) mn.trash.push(m); return m; }
  function mnMat(c, o){ return new THREE.MeshLambertMaterial(Object.assign({color:c, side:THREE.DoubleSide}, o||{})); }
  function mnMesh(geo, c, x, y, z, o){
    const m = new THREE.Mesh(geo, mnMat(c, o)); m.position.set(x,y,z); scene.add(m); return mnKeep(m);
  }
  function mnWall(x, y, z, w, h, d, c){
    const b = plat(x, y + h/2, z, w, d, c, h);
    if (b && b.mesh){ b.mesh.material = mnMat(c); mnKeep(b.mesh); }
    if (b && mn) mn.solids.push(b);
    return b;
  }
  function mnState(){ return MansionRules.mnLoad(typeof load === 'function' ? load(MansionRules.MN_KEY, null) : null); }
  function mnSave(s){ if (typeof save === 'function') save(MansionRules.MN_KEY, s); if (mn) mn.sv = s; }
  function mnLess(){ return !!(mn && mn.run && mn.run.lessScary); }
  function drawMansion(ctx){
    const skyTop = '#2a2458', skyBot = '#6b5b9a';
    if (typeof sky === 'function') sky(ctx, skyTop, skyBot);
    else { ctx.fillStyle = skyTop; ctx.fillRect(0,0,320,200); }
    ctx.fillStyle = '#3d3358'; ctx.fillRect(40, 50, 240, 120);
    ctx.fillStyle = '#2a2140'; ctx.beginPath(); ctx.moveTo(30,50); ctx.lineTo(160,10); ctx.lineTo(290,50); ctx.fill();
    ctx.fillStyle = '#ffd23f'; ctx.fillRect(70, 80, 36, 36); ctx.fillRect(214, 80, 36, 36);
    ctx.fillStyle = '#c4a574'; ctx.fillRect(140, 110, 40, 60);
    ctx.font = '28px sans-serif'; ctx.fillText('🕯️', 148, 80); ctx.fillText('👻', 250, 48);
    if (typeof guy === 'function') guy(ctx, 160, 176, 12, '#c9b6ff');
  }
  function mnSky(){
    const less = mnLess();
    const bg = less ? '#3a3458' : '#1c1633';
    scene.background = new THREE.Color(bg);
    if (scene.fog){ scene.fog.color.set(bg); scene.fog.near = less ? 16 : 8; scene.fog.far = less ? 56 : 36; }
  }
  function mnLab(text, x, y, z){
    try {
      if (typeof t297Lab === 'function'){ const m = t297Lab(text, x, y, z); if (m) return mnKeep(m); }
    } catch (e){}
    return mnMesh(new THREE.BoxGeometry(0.2,0.2,0.2), '#fff', x, y, z);
  }
  function buildMansion(){
    const sv = mnState();
    if (sv.lessScary == null) sv.lessScary = !!(typeof CampRules !== 'undefined' && CampRules.campLoad && CampRules.campLoad(typeof load==='function'?load('rubloxCamp',null):null).lessScary);
    const started = MansionRules.mnNewRun(sv, Date.now());
    mn = {trash:[], solids:[], sv: started.state, run: started.run, props:[], ghost:null, door:null};
    mnSky();
    const wall = mnLess() ? '#6b6088' : '#3f3558';
    const floor = mnLess() ? '#c4b8a0' : '#5a4a6a';
    plat(0, 0, -36, 22, 110, floor, 0.3);
    // outer shell
    mnWall(0, 4, 16, 22, 8, 0.5, wall);
    mnWall(0, 4, -88, 22, 8, 0.5, wall);
    mnWall(-11, 4, -36, 0.5, 8, 110, wall);
    mnWall(11, 4, -36, 0.5, 8, 110, wall);
    mnWall(0, 8.2, -36, 22, 0.4, 110, mnLess() ? '#efe6d8' : '#2a2438');
    // room dividers with door gaps at x=0
    ;[-10, -30, -50, -70].forEach(z => {
      mnWall(-7, 3, z, 8, 6, 0.4, wall);
      mnWall(7, 3, z, 8, 6, 0.4, wall);
      mnWall(0, 5.4, z, 6, 1.2, 0.4, wall);
    });
    // foyer props
    plat(-4, 0.8, 6, 2.2, 1.4, '#8b5a2b', 0.8);
    mn.props.push({id:'note1', x:-4, z:6, kind:'note', n:1, label: mnLab('📝 Note', -4, 2.0, 6)});
    plat(4, 1.1, 4, 0.6, 0.6, '#d4a017', 1.1);
    mn.props.push({id:'lever', x:4, z:4, kind:'lever', label: mnLab('🎚️ Lever', 4, 2.4, 4)});
    mnLab('🕯️ Foyer', 0, 3.2, 10);
    // parlor portraits
    [[-6,-20,0],[-2,-20,1],[2,-20,2],[6,-20,3]].forEach(([x,z,i]) => {
      const cols = ['#c45c7a','#5c8bc4','#d4a017','#6bbf8a'];
      plat(x, 1.6, z, 1.6, 0.3, cols[i], 1.6);
      mn.props.push({id:'pic'+i, x, z, kind:'pic', slot:i, label: mnLab('🖼️ ' + (i+1), x, 3.1, z)});
    });
    mnLab('🖼️ Parlor', 0, 3.2, -14);
    // kitchen
    plat(3, 0.9, -40, 2.4, 1.6, '#d9c4a0', 0.9);
    mn.props.push({id:'key', x:3, z:-40, kind:'key', label: mnLab('🔑 Cupboard', 3, 2.2, -40)});
    mnLab('🍪 Kitchen', 0, 3.2, -34);
    // library
    plat(-3, 1.0, -60, 2.2, 1.4, '#6b4a2b', 1.0);
    mn.props.push({id:'note2', x:-3, z:-60, kind:'note', n:2, label: mnLab('📝 Hidden note', -3, 2.3, -60)});
    mnLab('📚 Library', 0, 3.2, -54);
    // attic / Nimble / door
    plat(0, 2.4, -86, 3.6, 0.6, '#c45c1a', 2.4);
    mn.door = {x:0, z:-86};
    mnLab('🚪 Front door', 0, 4.2, -86);
    mnLab('🫥 Attic Hall', 0, 3.2, -74);
    const ghost = new THREE.Group();
    const body = new THREE.Mesh(new THREE.SphereGeometry(0.7, 12, 10), mnMat(mnLess() ? '#f4e8ff' : '#d8d0f0', {emissive: mnLess() ? '#b8a0e0' : '#3a3060'}));
    body.position.y = 1.2; ghost.add(body);
    const cap = new THREE.Mesh(new THREE.ConeGeometry(0.45, 0.5, 10), mnMat('#8b5cf6'));
    cap.position.y = 1.9; ghost.add(cap);
    ghost.position.set(4, 0, -78); scene.add(ghost); mnKeep(ghost); mn.ghost = ghost;
    mnLab('👻 Nimble', 4, 2.8, -78);
    const lamp = new THREE.PointLight(mnLess() ? 0xfff0c8 : 0xc8b0ff, mnLess() ? 1.1 : 0.55, 40);
    lamp.position.set(0, 5, -36); scene.add(lamp); mnKeep(lamp);
    const amb = new THREE.AmbientLight(mnLess() ? 0xfff4e8 : 0x8890c0, mnLess() ? 0.7 : 0.35);
    scene.add(amb); mnKeep(amb);
    Object.assign(P, {x:0, y:0.5, z:8, vx:0, vy:0, vz:0});
    if (typeof cam !== 'undefined' && cam){ cam.yaw = Math.PI; cam.pitch = 0.32; cam.dist = 11; }
    checkpoints[0] = {idx:0, spawn:{x:0,y:0.5,z:8}, flag:new THREE.Object3D()};
    mnBind();
    mnHud();
    banner(mnLess() ? '😌 Mallowmist Manor feels milder. Look for notes, and say hi to sleepy Nimble.' : '🕯️ Welcome to Mallowmist Manor. Find notes, solve the parlor pictures, and tip-toe past Nimble.');
  }
  function mnNear(x, z, r){ return Math.hypot((P.x - x), (P.z - z)) < (r || 2.1); }
  function mnCurrentRoom(){
    const z = P.z;
    if (z > -10) return 'foyer';
    if (z > -30) return 'parlor';
    if (z > -50) return 'kitchen';
    if (z > -70) return 'library';
    return 'attic';
  }
  function mnPrompt(){
    if (!mn || mn.run.escaped) return null;
    const hit = mn.props.find(p => mnNear(p.x, p.z, 2.2));
    if (hit){
      if (hit.kind === 'note') return {act:() => mnDo('note', hit), lab: 'Read note (E / Ⓧ)'};
      if (hit.kind === 'lever') return {act:() => mnDo('lever'), lab: 'Flip lever (E / Ⓧ)'};
      if (hit.kind === 'pic') return {act:() => mnDo('pic', hit), lab: 'Place portrait ' + (hit.slot+1) + ' (E / Ⓧ)'};
      if (hit.kind === 'key') return {act:() => mnDo('key'), lab: 'Search cupboard (E / Ⓧ)'};
    }
    if (mn.door && mnNear(mn.door.x, mn.door.z, 2.4) && mn.run.key) return {act:() => mnDo('door'), lab: 'Unlock the door (E / Ⓧ)'};
    return null;
  }
  function mnDo(kind, prop){
    if (!mn || mn.run.escaped) return;
    const run = mn.run;
    let r = null;
    if (kind === 'note') r = MansionRules.mnReadNote(run, prop.n);
    else if (kind === 'lever') r = MansionRules.mnFlipLever(run);
    else if (kind === 'pic'){
      const used = (run.pictures || []).indexOf(prop.slot);
      r = MansionRules.mnPlacePicture(run, prop.slot, prop.slot);
      if (used >= 0 && r && r.ok && !r.done){ /* placed this tile in this slot */ }
    }
    else if (kind === 'key') r = MansionRules.mnTakeKey(run);
    else if (kind === 'door') r = MansionRules.mnEscape(run, mn.sv, Date.now());
    if (!r || !r.ok){
      const why = r && r.why;
      banner(why === 'note' ? 'Read the foyer note first.' : why === 'key' ? 'You still need the brass key.' : why === 'locked' ? 'That room is still closed.' : 'Not yet!');
      return;
    }
    if (kind === 'note') banner('📝 ' + r.text);
    if (kind === 'lever') banner('🎚️ The parlor doors creak open.');
    if (kind === 'pic') banner(r.done ? '🖼️ The portraits click into place! The kitchen is open.' : '🖼️ You hung a portrait.');
    if (kind === 'key') banner('🔑 You found the brass key!');
    if (kind === 'door' && r.ok){
      mn.sv = r.state; mnSave(mn.sv);
      try { if (typeof pay === 'function') pay(r.coins); else if (typeof coins === 'number') { coins += r.coins; if (typeof save === 'function') save('rubloxCoins', coins); } } catch (e){}
      banner('🌙 ' + r.message + ' +' + r.coins + ' 🪙');
      try {
        const em = document.getElementById('oWinEmoji'), title = document.getElementById('oWinTitle');
        if (em) em.textContent = '🕯️'; if (title) title.textContent = 'You escaped Mallowmist Manor!';
        const st = document.getElementById('oWinStats'); if (st) st.innerHTML = '👻 Nimble went back to the closet.<br>🎁 +' + r.coins + ' Rublox Coins';
        const w = document.getElementById('oWin'); if (w) w.classList.add('show');
      } catch (e){}
    }
    mnHud(); mnNet();
  }
  function mnCaught(){
    const r = MansionRules.mnCatch(mn.run, mn.sv);
    if (!r.ok) return;
    mn.sv = r.state; mnSave(mn.sv);
    if (r.spawn && typeof P !== 'undefined'){ P.x = r.spawn.x; P.y = r.spawn.y; P.z = r.spawn.z; P.vx = P.vz = 0; }
    checkpoints[0].spawn = r.spawn;
    banner('😌 ' + r.message);
    mnHud(); mnNet();
  }
  function mnHud(){
    const hint = document.getElementById('mnHint');
    const run = mn && mn.run;
    if (hint && run){
      const room = MansionRules.mnRoom(mnCurrentRoom());
      hint.textContent = (room.emoji || '') + ' ' + room.name + (run.key ? '  ·  🔑' : '') + (run.pictureDone ? '  ·  portraits set' : '') + (mnLess() ? '  ·  😌 milder' : '');
    }
    const btn = document.getElementById('mnAct');
    const p = mnPrompt();
    if (btn){ if (p){ btn.textContent = p.lab; btn.classList.add('show'); } else btn.classList.remove('show'); }
    const less = document.getElementById('mnLessBtn');
    if (less) less.classList.toggle('on', mnLess());
  }
  function mnToggleLess(){
    if (!mn) return;
    mn.sv = MansionRules.mnSetLessScary(mn.sv, !mn.sv.lessScary);
    mn.run.lessScary = !!mn.sv.lessScary;
    mnSave(mn.sv);
    mnSky();
    banner(mnLess() ? '😌 Less scary is on. Nimble is slower and the lights are warmer.' : '🕯️ Less scary is off. Still no gore, and everyone is okay.');
    mnHud();
  }
  function mnAct(){ const p = mnPrompt(); if (p) p.act(); }
  function mnKey(e){
    if (!mn) return false;
    if (e.type === 'keyup') return false;
    const c = e.code || e.key;
    if (c === 'KeyE' || c === 'KeyF'){ mnAct(); return true; }
    if (c === 'KeyL'){ mnToggleLess(); return true; }
    return false;
  }
  function mnPad(jp){
    if (!mn || !jp) return false;
    if (!mn._x && jp[2]){ mn._x = true; mnAct(); return true; }
    if (!jp[2]) mn._x = false;
    if (!mn._y && jp[3]){ mn._y = true; mnToggleLess(); return true; }
    if (!jp[3]) mn._y = false;
    return false;
  }
  function mnUpdate(dt){
    if (!mn || mn.run.escaped) { mnHud(); return; }
    dt = Math.max(0, Math.min(0.12, +dt || 0));
    const room = mnCurrentRoom();
    if (room !== mn.run.room){
      if (MansionRules.mnCanEnter(mn.run, room)) MansionRules.mnSetRoom(mn.run, room);
      else if (room !== 'foyer'){
        // bump back through a locked divider
        if (room === 'parlor' && P.z < -10) P.z = -9.6;
        if (room === 'kitchen' && P.z < -30) P.z = -29.6;
        if (room === 'library' && P.z < -50) P.z = -49.6;
        if (room === 'attic' && P.z < -70) P.z = -69.6;
      }
    }
    if (!mnIsGuest()){
      MansionRules.mnNimbleTick(mn.run, dt);
      if (MansionRules.mnSeenByNimble(mn.run, P.x, P.z)) mnCaught();
    }
    if (mn.ghost && mn.run.nimble){
      mn.ghost.position.x = mn.run.nimble.x;
      mn.ghost.position.z = mn.run.nimble.z;
      mn.ghost.rotation.y = mn.run.nimble.dir > 0 ? Math.PI/2 : -Math.PI/2;
    }
    mnHud();
    if (!mnIsGuest()) mnNet();
  }
  function mnIsGuest(){ try { return !!(typeof mp !== 'undefined' && mp && mp.on && !mp.host); } catch (e){ return false; } }
  function mnWire(){ return mn && MansionRules.mnWire(mn.run); }
  function mnApply(snap){ if (mn && snap){ MansionRules.mnApplyWire(mn.run, snap); mnHud(); } }
  function mnNet(){
    if (mnIsGuest() || !mn || typeof mp === 'undefined' || !mp || !mp.on || typeof mpSend !== 'function') return;
    try { mpSend({t:'mn', snap: mnWire()}); } catch (e){}
  }
  function mnFromNet(g, d){ if (d && d.snap) mnApply(d.snap); }
  function mnFromHost(d){ mnFromNet(null, d); }
  function mnBind(){
    const a = document.getElementById('mnAct');
    if (a && !a.__mn){ a.__mn = true; a.addEventListener('click', ev => { ev.preventDefault(); mnAct(); }); }
    const l = document.getElementById('mnLessBtn');
    if (l && !l.__mn){ l.__mn = true; l.addEventListener('click', ev => { ev.preventDefault(); mnToggleLess(); }); }
  }
  function mansionStop(){
    if (!mn) return;
    (mn.solids || []).forEach(b => { try { b.active = false; if (typeof solids !== 'undefined'){ const i = solids.indexOf(b); if (i>=0) solids.splice(i,1);} } catch(e){} });
    (mn.trash || []).forEach(m => { try { scene.remove(m); } catch(e){} });
    mn = null;
    const box = document.getElementById('mnBox'); if (box) box.style.display = 'none';
    const b = document.getElementById('mnAct'); if (b) b.classList.remove('show');
  }
  if (typeof window !== 'undefined') window.mnDebug = {
    less(on){ if (!mn) return; if (on != null) mn.sv.lessScary = !on ? false : true; mn.run.lessScary = !!mn.sv.lessScary; mnSave(mn.sv); mnSky(); mnHud(); return mnLess(); },
    room(id){ if (mn){ MansionRules.mnSetRoom(mn.run, id); const s = MansionRules.mnRoom(id).spawn; P.x=s.x; P.y=s.y; P.z=s.z; } },
    solve(){ if (!mn) return; const r=mn.run; r.note1=true; r.lever=true; r.parlorOpen=true; r.pictureDone=true; r.kitchenOpen=true; r.key=true; r.note2=true; r.atticOpen=true; mnHud(); },
    probe(){ return mn && mn.run ? {room:mn.run.room, key:!!mn.run.key, less:mnLess(), escaped:!!mn.run.escaped} : null; }
  };
