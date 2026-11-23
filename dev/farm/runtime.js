/* Honeymeadow Farm runtime — injected into the main engine IIFE, after the aquarium helpers. */
  let fm = null;
  function fmSave(s){ try { if (typeof save === 'function') save(FarmRules.FM_KEY, s); } catch(e){} }
  function fmState(){ try { return FarmRules.fmLoad(typeof load === 'function' ? load(FarmRules.FM_KEY, null) : null); } catch(e){ return FarmRules.fmFresh(); } }
  function fmWZ(z){ return (z||0) + ((fm && fm.shiftZ) || 0); }
  function fmKeep(m){
    if (fm && m){
      (fm.trash || (fm.trash=[])).push(m);
      if (fm.curZone){
        m.userData = m.userData || {};
        m.userData.fmZone = fm.curZone;
        (fm.zones || (fm.zones={}))[fm.curZone] = fm.zones[fm.curZone] || [];
        fm.zones[fm.curZone].push(m);
      }
    }
    return m;
  }
  function fmMesh(geo, col, x, y, z){
    const m = new THREE.Mesh(geo, new THREE.MeshLambertMaterial({color: col}));
    m.position.set(x, y, fmWZ(z)); scene.add(m); fmKeep(m); return m;
  }
  function fmLab(text, x, y, z){
    try { if (typeof t297Lab === 'function'){ const l = t297Lab(text, x, y, fmWZ(z)); if (l){ l.userData = l.userData || {}; l.userData.fmLab = true; return fmKeep(l); } } } catch(e){}
    return null;
  }
  function fmPlat(x, y, z, w, d, col, h){
    const b = plat(x, y, fmWZ(z), w, d, col, h == null ? 0.2 : h);
    if (b && b.mesh) fmKeep(b.mesh);
    if (b){ (fm.solids || (fm.solids=[])).push(b); if (fm.curZone) b.fmZone = fm.curZone; }
    return b;
  }
  function fmPaint(){
    if (!fm) return;
    const destOn = !!(fm.run && (fm.run.phase === 'farm' || fm.run.phase === 'ride'));
    const hideIf = (list, have) => (list||[]).forEach(it => { const m = (fm.marks||{})[it.id]; if (m) m.visible = destOn && !have(it.id); });
    const st = fm.sv || FarmRules.fmFresh();
    hideIf(FarmRules.FM_EGGS, id => (st.eggs||[]).indexOf(id)>=0);
    hideIf(FarmRules.FM_APPLES, id => (st.apples||[]).indexOf(id)>=0);
    hideIf(FarmRules.FM_PUMPS, id => (st.pumps||[]).indexOf(id)>=0);
    if (fm.homeBus) fm.homeBus.visible = destOn && FarmRules.fmAllDone(st) && fm.run && fm.run.phase === 'farm';
    if (fm.gateLab) fm.gateLab.visible = !!(fm.homeBus && fm.homeBus.visible);
  }
  function fmApplyZones(phase){
    if (!fm) return;
    const showYard = (phase === 'yard' || phase === 'ride' || phase === 'done');
    const showDest = (phase === 'farm' || phase === 'ride');
    const vis = {yard: showYard, dest: showDest, road: true, land: true};
    Object.keys(vis).forEach(z => { (fm.zones && fm.zones[z] || []).forEach(m => { if (m) m.visible = !!vis[z]; }); });
    (fm.solids||[]).forEach(b => {
      if (!b) return;
      if (b.fmZone === 'yard') b.active = showYard;
      if (b.fmZone === 'dest') b.active = showDest;
    });
    fmPaint();
  }
  function fmSky(){ if (typeof ftApplyDaySky === 'function') ftApplyDaySky(); else {
    try { scene.background = new THREE.Color('#7ec8ff'); if (scene.fog){ scene.fog.color.set('#7ec8ff'); scene.fog.near=55; scene.fog.far=180; } } catch(e){}
  } }
  function fmHud(msg){
    const hint = document.getElementById('fmHint');
    const box = document.getElementById('fmBox');
    if (hint) hint.textContent = msg || FarmRules.fmGoal(fm && fm.sv, fm && fm.run);
    if (box) box.style.display = 'block';
    const act = document.getElementById('fmAct');
    if (act){
      const p = fm && fm.near;
      act.classList.toggle('show', !!(p && p.act && p.kind !== 'ride'));
      if (p && p.act) act.textContent = p.act;
    }
  }
  function fmTree(x, z, h, leaf){
    const tall = h || 2.6;
    fmMesh(new THREE.CylinderGeometry(0.28, 0.36, tall, 7), '#6b3a1d', x, tall/2, z);
    fmMesh(new THREE.SphereGeometry(1.15 + tall * 0.12, 7, 5), leaf || '#4fa15a', x, tall + 0.4, z);
  }
  function fmHorizonLand(cx, cz, col){
    const prevZ = fm.curZone, prevS = fm.shiftZ;
    fm.curZone = 'land'; fm.shiftZ = 0;
    fmPlat(cx, 0.05, cz, 1600, 1600, col || '#4ea247', 0.1);
    for (let i = 0; i < 20; i++){
      const a = i * Math.PI * 2 / 20;
      const r = 210 + (i % 4) * 14;
      const x = cx + Math.cos(a) * r, z = cz + Math.sin(a) * r;
      fmMesh(new THREE.SphereGeometry(5.5 + (i % 3), 7, 5), i % 2 ? '#2e7a38' : '#5a8a30', x, 2.8, z);
      if (i % 2 === 0) fmTree(x + 7, z + 5, 3.0 + (i % 3) * 0.3, '#68b85a');
    }
    fm.curZone = prevZ; fm.shiftZ = prevS;
  }
  function fmMakeBus(){ return (typeof ftMakeBus === 'function') ? ftMakeBus() : (function(){ const g=new THREE.Group(); const b=new THREE.Mesh(new THREE.BoxGeometry(3.6,2.2,7.2), new THREE.MeshLambertMaterial({color:'#f0c44a'})); b.position.y=1.3; g.add(b); return g; })(); }
  function fmMakeWagon(){
    const g = new THREE.Group();
    const bed = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.7, 3.6), new THREE.MeshLambertMaterial({color:'#8b5a2a'}));
    bed.position.y = 0.9; g.add(bed);
    const hay = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.7, 2.4), new THREE.MeshLambertMaterial({color:'#e8c04a'}));
    hay.position.set(0, 1.5, -0.2); g.add(hay);
    [[-0.9,0.4,1.2],[0.9,0.4,1.2],[-0.9,0.4,-1.2],[0.9,0.4,-1.2]].forEach(p => {
      const w = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 0.2, 10), new THREE.MeshLambertMaterial({color:'#3a2a1a'}));
      w.rotation.z = Math.PI/2; w.position.set(p[0], p[1], p[2]); g.add(w);
    });
    return g;
  }
  function fmNpc(av, x, z, fx, fz, col){
    try {
      const m = buildPlayer(Object.assign({}, typeof DEF !== 'undefined' ? DEF : {}, av));
      m.g.position.set(x, .05, z); m.g.rotation.y = Math.atan2(fx - x, fz - z); scene.add(m.g); fmKeep(m.g); return m;
    } catch(e){ return fmMesh(new THREE.BoxGeometry(0.7, 1.6, 0.5), col, x, 0.9, z); }
  }
  function buildFarm(){
    const started = FarmRules.fmNewVisit(fmState());
    fm = {trash:[], solids:[], zones:{}, sv: started.state, run: started.run, near:null, bus:null, homeBus:null, wagon:null, marks:{}, curZone:null, shiftZ:0};
    fmSave(started.state);
    try { checkpoints[0] = {idx:0, spawn:{x:0,y:0.5,z:18}, flag:new THREE.Object3D()}; } catch(e){}
    fmSky();
    const hemi = new THREE.HemisphereLight(0xe8f4ff, 0x4a7a3a, 1.1); scene.add(hemi); fmKeep(hemi);
    const sun = new THREE.DirectionalLight('#fff8e0', 0.85); sun.position.set(10, 18, 8); scene.add(sun); fmKeep(sun);
    fm.curZone = 'yard'; fm.shiftZ = 0;
    fmPlat(0, 0.14, 18, 52, 44, '#3f8f3a', 0.24);
    fmPlat(0, 0.16, 16, 36, 28, '#4ea247', 0.16);
    fmMesh(new THREE.BoxGeometry(18, 8, 8), '#7a6aa0', 0, 4.1, 32);
    const roof = new THREE.Mesh(new THREE.ConeGeometry(13, 3.2, 4), new THREE.MeshLambertMaterial({color:'#4a3a68'}));
    roof.position.set(0, 10.1, 32); roof.rotation.y = Math.PI/4; scene.add(roof); fmKeep(roof);
    fmLab('🏫 Afterbell School', 0, 12.2, 26);
    fmNpc({body:'girl', head:'#e0ac69', shirt:'#c45c8a', pants:'#3a3f6a', pantsPat:'skirt', hair:'bun', hairColor:'#6b4226', face:'smile', shirtPat:null, hat:null}, FarmRules.FM_TEACHER.x, FarmRules.FM_TEACHER.z, 0, 18, '#c45c8a');
    fmLab('👩‍🏫 Ms. Bramble', FarmRules.FM_TEACHER.x, 3.9, FarmRules.FM_TEACHER.z);
    fm.curZone = 'road'; fm.shiftZ = 0;
    const path = FarmRules.FM_RIDE_PATH || [];
    for (let i = 0; i < path.length - 1; i++){
      const a = path[i], b = path[i+1];
      const mx = (a.x+b.x)/2, mz=(a.z+b.z)/2;
      const len = Math.hypot(b.x-a.x, b.z-a.z)+1.6;
      const alongX = Math.abs(b.x-a.x) >= Math.abs(b.z-a.z);
      fmPlat(mx, 0.18, mz, alongX ? len : 3.4, alongX ? 3.4 : len, '#2a2e33', 0.1);
    }
    fmLab('➡️ Honeymeadow', 22, 3.0, 2);
    fm.curZone = 'yard';
    const bus = fmMakeBus();
    bus.position.set(FarmRules.FM_BUS.x, 0, FarmRules.FM_BUS.z);
    scene.add(bus); fm.bus = bus;
    fmLab('🚌 Afterbell bus', FarmRules.FM_BUS.x, 3.6, FarmRules.FM_BUS.z);
    // destination
    fm.curZone = 'dest'; fm.shiftZ = FarmRules.FM_DEST_DZ || 0;
    fmHorizonLand(0, FarmRules.fmZ(-28), '#5aaa44');
    fmPlat(0, 0.16, -28, 180, 180, '#5aaa44', 0.16);
    // barn
    fmMesh(new THREE.BoxGeometry(10, 5.2, 8), '#c45c3a', 0, 2.8, -36);
    fmMesh(new THREE.BoxGeometry(11, 0.3, 9), '#8b2e1a', 0, 5.5, -36);
    const bRoof = new THREE.Mesh(new THREE.ConeGeometry(8, 2.6, 4), new THREE.MeshLambertMaterial({color:'#8b2e1a'}));
    bRoof.position.set(0, 7.0, fmWZ(-36)); bRoof.rotation.y = Math.PI/4; scene.add(bRoof); fmKeep(bRoof);
    fmMesh(new THREE.BoxGeometry(2.4, 3.2, 0.2), '#6b3a1d', 0, 1.8, -32);
    fmLab('🏠 Honeymeadow barn', 0, 8.2, -32);
    // pens
    fmPlat(12, 0.22, -18, 7, 6, '#c4a060', 0.12);
    fmMesh(new THREE.BoxGeometry(0.16, 1.0, 6), '#8b6a3a', 8.5, 0.7, -18);
    fmMesh(new THREE.BoxGeometry(0.16, 1.0, 6), '#8b6a3a', 15.5, 0.7, -18);
    fmMesh(new THREE.SphereGeometry(0.28, 7, 6), '#f4e27a', 11.2, 0.5, -17.4);
    fmMesh(new THREE.SphereGeometry(0.28, 7, 6), '#f4e27a', 13, 0.5, -18.6);
    fmLab('🐔 Speckle hens', 12, 2.4, -18);
    fmPlat(-12, 0.22, -18, 7, 6, '#c4a060', 0.12);
    fmMesh(new THREE.SphereGeometry(0.4, 7, 6), '#f2f0e8', -11.2, 0.7, -17.6);
    fmMesh(new THREE.SphereGeometry(0.4, 7, 6), '#e8e0d0', -13, 0.7, -18.6);
    fmLab('🐑 Cloudwool sheep', -12, 2.4, -18);
    fmPlat(16, 0.22, -32, 8, 6, '#c4a060', 0.12);
    fmMesh(new THREE.BoxGeometry(1.4, 1.0, 0.7), '#f4e8d0', 15.2, 0.8, -31.4);
    fmMesh(new THREE.BoxGeometry(1.4, 1.0, 0.7), '#efe0c8', 17, 0.8, -32.6);
    fmLab('🐄 Butterspot cows', 16, 2.4, -32);
    // apple trees
    (FarmRules.FM_APPLES||[]).forEach(a => {
      const lz = a.z - (FarmRules.FM_DEST_DZ||0);
      fmTree(a.x, lz, 3.6, '#3d7a38');
      const m = fmMesh(new THREE.SphereGeometry(0.2, 7, 6), '#c45c3a', a.x + 0.5, 2.4, lz);
      fm.marks[a.id] = m;
      fmLab('🍎 Apple tree', a.x, 5.0, lz);
    });
    // pumpkin patch
    fmPlat(11, 0.2, -42.5, 8, 6, '#6a8a3a', 0.1);
    (FarmRules.FM_PUMPS||[]).forEach(a => {
      const lz = a.z - (FarmRules.FM_DEST_DZ||0);
      const m = fmMesh(new THREE.SphereGeometry(0.38, 8, 6), '#e07a20', a.x, 0.5, lz);
      fm.marks[a.id] = m;
    });
    fmLab('🎃 Pumpkin patch', 11, 2.2, -42.5);
    (FarmRules.FM_EGGS||[]).forEach(a => {
      const lz = a.z - (FarmRules.FM_DEST_DZ||0);
      const m = fmMesh(new THREE.SphereGeometry(0.14, 7, 6), '#f4e8d0', a.x, 0.28, lz);
      fm.marks[a.id] = m;
    });
    // hay path tick marks not needed; wagon
    fm.shiftZ = 0;
    fmNpc({head:'#e0ac69', shirt:'#c45c3a', pants:'#3a5a2a', hair:'short', hairColor:'#5a3a1a', face:'smile', hat:null}, FarmRules.FM_GUIDE.x, FarmRules.FM_GUIDE.z, FarmRules.FM_ARRIVE.x, FarmRules.FM_ARRIVE.z, '#c45c3a');
    fmLab('👩‍🌾 Farmer Nettie', FarmRules.FM_GUIDE.x, 3.9, FarmRules.FM_GUIDE.z);
    const wagon = fmMakeWagon();
    wagon.position.set(FarmRules.FM_WAGON.x, 0, FarmRules.FM_WAGON.z);
    scene.add(wagon); fmKeep(wagon); fm.wagon = wagon;
    fmLab('🌾 Hay wagon', FarmRules.FM_WAGON.x, 3.0, FarmRules.FM_WAGON.z);
    const home = fmMakeBus();
    home.position.set(FarmRules.FM_HOME_BUS.x, 0, FarmRules.FM_HOME_BUS.z);
    home.visible = false; scene.add(home); fmKeep(home); fm.homeBus = home;
    fm.gateLab = fmLab('🚌 Gate', FarmRules.FM_HOME_BUS.x, 3.4, FarmRules.FM_HOME_BUS.z);
    if (fm.gateLab) fm.gateLab.visible = false;
    if (P){ P.x=0; P.y=0.5; P.z=18; P.vx=0; P.vz=0; P.vy=0; }
    if (typeof cam !== 'undefined' && cam){ cam.yaw=0; cam.pitch=0.16; cam.dist=10; }
    const box=document.getElementById('fmBox'); if(box) box.style.display='block';
    banner('🌾 Farm day! Ms. Bramble is taking Afterbell School to Honeymeadow Farm. Board the bus, then help Farmer Nettie with the animals, eggs, apples, pumpkins, and the hay wagon.');
    fm.curZone = null;
    fmApplyZones((fm.run && fm.run.phase) || 'yard');
    fmHud();
  }
  function fmEnter(){
    if (P){ P.x=0; P.y=0.5; P.z=18; P.vx=0; P.vz=0; P.vy=0; }
    if (typeof cam !== 'undefined' && cam){ cam.yaw=0; cam.pitch=0.16; cam.dist=10; }
    fmSky();
  }
  function fmRideVis(hide){
    try {
      if (typeof model !== 'undefined' && model){
        if (model.g) model.g.visible = !hide;
        else if (model.visible != null) model.visible = !hide;
      }
    } catch(e){}
  }
  function fmSeat(pose, along, ey){
    if (!P || !pose) return;
    along = along == null ? -2.15 : along;
    const cy = Math.cos(pose.yaw || 0), sy = Math.sin(pose.yaw || 0);
    P.x = pose.x + along * sy; P.z = pose.z + along * cy;
    P.y = ey == null ? 1.42 : ey; P.vx = P.vz = P.vy = 0;
    if (typeof cam !== 'undefined' && cam){ cam.yaw = Math.atan2(-sy, -cy); cam.pitch = 0.08; cam.dist = 0.22; }
  }
  function fmRideCam(){
    if (!fm || !fm.run || typeof camera === 'undefined' || !camera) return false;
    let pose = null, along = -1.5, ey = 1.55;
    if (fm.run.phase === 'ride') pose = FarmRules.fmRidePose(fm.run);
    else if (fm.run.haying){ pose = FarmRules.fmHayPose(fm.run); along = -1.2; ey = 1.7; }
    if (!pose) return false;
    const cy = Math.cos(pose.yaw || 0), sy = Math.sin(pose.yaw || 0);
    const x = pose.x + along * sy, z = pose.z + along * cy;
    camera.position.set(x, ey, z);
    camera.lookAt(x + sy * 10, ey - 0.2, z + cy * 10);
    (fm.trash||[]).forEach(m => { if (m && m.userData && m.userData.fmLab) m.visible = false; });
    return true;
  }
  function fmAct(){
    if (!fm) return;
    if (fm.run && fm.run.haying) return;
    const hit = FarmRules.fmNear(P.x, P.z, fm.sv, fm.run);
    if (!hit) return;
    if (hit.kind === 'talk'){ banner(hit.text); return; }
    if (hit.kind === 'bus'){
      const r = FarmRules.fmBoardBus(fm.run);
      if (r.ok){ banner('🚌 All aboard! The Afterbell bus is rolling out to Honeymeadow Farm.'); fmSeat(FarmRules.fmRidePose(fm.run)); fmRideVis(true); }
      return;
    }
    if (hit.kind === 'feed'){
      const r = FarmRules.fmFeed(fm.sv, hit.id);
      if (!r.ok) return;
      fm.sv = r.state; fmSave(fm.sv); fmPaint();
      banner((hit.emoji||'🌾') + ' ' + (r.item && r.item.blurb ? r.item.blurb : ('You fed the ' + hit.name + '.')));
      return;
    }
    if (hit.kind === 'egg'){
      const r = FarmRules.fmPickEgg(fm.sv, hit.id);
      if (!r.ok) return;
      fm.sv = r.state; fmSave(fm.sv); fmPaint();
      banner('🥚 You found a ' + (r.item && r.item.name || 'warm egg') + '.' + (r.left ? '' : ' That is every egg!'));
      return;
    }
    if (hit.kind === 'apple'){
      const r = FarmRules.fmPickApple(fm.sv, hit.id);
      if (!r.ok) return;
      fm.sv = r.state; fmSave(fm.sv); fmPaint();
      banner('🍎 You picked a ' + (r.item && r.item.name || 'apple') + '.' + (r.left ? '' : ' The trees are picked!'));
      return;
    }
    if (hit.kind === 'pump'){
      const r = FarmRules.fmPickPump(fm.sv, hit.id);
      if (!r.ok) return;
      fm.sv = r.state; fmSave(fm.sv); fmPaint();
      banner('🎃 You picked a ' + (r.item && r.item.name || 'pumpkin') + '.' + (r.left ? '' : ' The patch is picked!'));
      return;
    }
    if (hit.kind === 'hay'){
      const r = FarmRules.fmStartHay(fm.run, fm.sv);
      if (r.ok){ banner('🌾 Hop on! The hay wagon is taking a slow loop around Honeymeadow Farm.'); fmRideVis(true); }
      return;
    }
    if (hit.kind === 'home'){
      const r = FarmRules.fmBoardHome(fm.run, fm.sv);
      if (!r.ok){ banner('Farmer Nettie is still waiting on a few farm jobs.'); return; }
      fm.sv = r.state; fmSave(fm.sv);
      if (r.coins && typeof coins !== 'undefined'){ try { coins += r.coins; if (typeof saveCoins === 'function') saveCoins(); } catch(e){} }
      banner((r.message || 'Bus ride home!') + (r.coins ? ('  +' + r.coins + ' 🪙') : ''));
      if (P){ P.x=0; P.z=18; P.y=0.5; }
      if (typeof cam !== 'undefined' && cam){ cam.yaw=0; cam.pitch=0.16; cam.dist=10; }
      if (fm.bus){ fm.bus.position.set(FarmRules.FM_BUS.x, 0, FarmRules.FM_BUS.z); fm.bus.rotation.y = 0; }
      fmRideVis(false);
      fmApplyZones('done');
      return;
    }
  }
  function fmUpdate(dt){
    if (!fm) return;
    fmSky();
    if (fm.run.phase === 'ride'){
      FarmRules.fmTickRide(fm.run, dt);
      const pose = FarmRules.fmRidePose(fm.run);
      fmSeat(pose); fmRideVis(true);
      if (fm.bus){ fm.bus.position.set(pose.x, 0, pose.z); fm.bus.rotation.y = pose.yaw || 0; }
      if (fm.run.phase === 'farm'){
        const a = FarmRules.FM_ARRIVE || {x:3.4, z:-8};
        if (P){ P.x=a.x; P.y=0.5; P.z=a.z; P.vx=0; P.vz=0; }
        if (typeof cam!=='undefined' && cam){ cam.yaw=0.15; cam.pitch=0.16; cam.dist=9; }
        fmRideVis(false);
        if (fm.bus){ fm.bus.position.set(FarmRules.FM_HOME_BUS.x, 0, FarmRules.FM_HOME_BUS.z); fm.bus.rotation.y = Math.PI; }
        banner('🌾 Welcome to Honeymeadow Farm! Farmer Nettie is by the barn — not under the bus. Help with the animals, eggs, apples, pumpkins, and the hay wagon.');
        fmApplyZones('farm');
      }
    }
    if (fm.run.haying){
      const r = FarmRules.fmTickHay(fm.run, fm.sv, dt);
      fm.sv = r.state;
      const pose = FarmRules.fmHayPose(fm.run);
      fmSeat(pose, -1.2, 1.35); fmRideVis(true);
      if (fm.wagon){ fm.wagon.position.set(pose.x, 0, pose.z); fm.wagon.rotation.y = pose.yaw || 0; }
      if (r.done){
        fmSave(fm.sv);
        fmRideVis(false);
        if (P){ P.x=FarmRules.FM_WAGON.x; P.y=0.5; P.z=FarmRules.FM_WAGON.z + 2.2; P.vx=0; P.vz=0; }
        if (typeof cam!=='undefined' && cam){ cam.yaw=0; cam.pitch=0.16; cam.dist=8; }
        if (fm.wagon){ fm.wagon.position.set(FarmRules.FM_WAGON.x, 0, FarmRules.FM_WAGON.z); fm.wagon.rotation.y = 0; }
        banner('🌾 The hay wagon rolls to a stop. What a bouncy loop around the farm!');
        fmApplyZones('farm');
      }
    }
    if (P && P.y < -8){ P.x=0; P.y=0.5; P.z = (fm.run && fm.run.phase === 'farm') ? (FarmRules.FM_ARRIVE||{}).z || -8 : 18; P.vx=P.vz=P.vy=0; }
    fmApplyZones(fm.run && fm.run.phase);
    fm.near = FarmRules.fmNear(P ? P.x : 0, P ? P.z : 0, fm.sv, fm.run);
    fmHud(FarmRules.fmGoal(fm.sv, fm.run));
  }
  function fmKey(e){
    if (!fm || e.repeat) return false;
    if (e.code === 'KeyE' || e.code === 'KeyF' || e.key === 'e' || e.key === 'f'){ fmAct(); return true; }
    return false;
  }
  function fmPad(jp){
    if (!fm || !jp) return false;
    if (!fm._x && (jp[2] || jp[3])){ fm._x = true; fmAct(); return true; }
    if (!jp[2] && !jp[3]) fm._x = false;
    return false;
  }
  function farmStop(){
    fmRideVis(false);
    if (!fm) return;
    (fm.solids||[]).forEach(b => { try{ b.active=false; if (typeof solids!=='undefined'){ const i=solids.indexOf(b); if(i>=0) solids.splice(i,1);} }catch(e){} });
    (fm.trash||[]).forEach(m => { try{ scene.remove(m);}catch(e){} });
    fm=null;
    const box=document.getElementById('fmBox'); if(box) box.style.display='none';
    const act=document.getElementById('fmAct'); if(act) act.classList.remove('show');
  }
  if (typeof window !== 'undefined') window.fmDebug = {
    probe(){ if (!fm) return null; return {phase: fm.run && fm.run.phase, haying: !!(fm.run && fm.run.haying), sv: fm.sv, P: P ? {x:P.x,y:P.y,z:P.z} : null, nettie: FarmRules.FM_GUIDE, arrive: FarmRules.FM_ARRIVE}; },
    farm(){ if (!fm) return; fm.run.phase='farm'; fm.run.rideT=FarmRules.FM_RIDE_T; const a=FarmRules.FM_ARRIVE; if(P){P.x=a.x;P.y=0.5;P.z=a.z;} if (typeof cam!=='undefined' && cam){ cam.yaw=0.15; cam.pitch=0.16; cam.dist=9; } fmApplyZones('farm'); },
    lookBack(){ if (!fm) return; this.look(Math.PI); },
    look(yaw){ if (!fm) return; fm.run.phase='farm'; const a=FarmRules.FM_ARRIVE; if(P){P.x=a.x;P.y=0.5;P.z=a.z;P.vx=0;P.vz=0;} if (typeof cam!=='undefined' && cam){ cam.yaw=(yaw==null?Math.PI:yaw); cam.pitch=0.12; cam.dist=12; } fmApplyZones('farm'); },
    hay(){ if (!fm) return; fm.run.phase='farm'; const w=FarmRules.FM_WAGON; if(P){P.x=w.x;P.y=0.5;P.z=w.z;} if (typeof cam!=='undefined' && cam){ cam.yaw=0; cam.pitch=0.16; cam.dist=8; } fmApplyZones('farm'); },
    ride(t){ if (!fm) return; fm.run.phase='ride'; fm.run.rideT=(t==null?3.2:t); const pose=FarmRules.fmRidePose(fm.run); fmSeat(pose); fmRideVis(true); if(fm.bus){fm.bus.position.set(pose.x,0,pose.z); fm.bus.rotation.y=pose.yaw||0;} fmApplyZones('ride'); },
    go(id){
      if (!fm || !P) return;
      const F = FarmRules;
      const map = {bus:F.FM_BUS, home:F.FM_HOME_BUS, teacher:F.FM_TEACHER, nettie:F.FM_GUIDE, barn:F.FM_BARN, arrive:F.FM_ARRIVE, wagon:F.FM_WAGON, hens:F.FM_FEEDS[0], sheep:F.FM_FEEDS[1], cows:F.FM_FEEDS[2]};
      const t = map[id];
      if (!t) return;
      P.x=t.x; P.y=0.5; P.z=t.z; P.vx=0; P.vz=0; P.vy=0;
    }
  };
  try {
    const act=document.getElementById('fmAct'); if(act && !act.__fm){ act.__fm=true; act.onclick=ev=>{ev.preventDefault();ev.stopPropagation();fmAct();}; }
  } catch(e){}
