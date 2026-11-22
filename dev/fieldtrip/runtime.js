/* Pebblebrook Field Trip runtime — injected into the main engine IIFE. */
  let ft = null;
  function ftSave(s){ try { if (typeof save === 'function') save(FieldTripRules.FT_KEY, s); } catch(e){} }
  function ftState(){ try { return FieldTripRules.ftLoad(typeof load === 'function' ? load(FieldTripRules.FT_KEY, null) : null); } catch(e){ return FieldTripRules.ftFresh(); } }
  function ftKeep(m){ if (ft && m){ (ft.trash || (ft.trash=[])).push(m); } return m; }
  function ftMesh(geo, col, x, y, z){
    const m = new THREE.Mesh(geo, new THREE.MeshLambertMaterial({color: col}));
    m.position.set(x, y, z); scene.add(m); ftKeep(m); return m;
  }
  function ftLab(text, x, y, z){
    try {
      if (typeof t297Lab === 'function'){ const l = t297Lab(text, x, y, z); if (l) return ftKeep(l); }
    } catch(e){}
    return null;
  }
  function ftPlat(x, y, z, w, d, col, h){
    const b = plat(x, y, z, w, d, col, h == null ? 0.2 : h);
    if (b && b.mesh) ftKeep(b.mesh);
    if (b) (ft.solids || (ft.solids=[])).push(b);
    return b;
  }
  function ftHud(msg){
    const hint = document.getElementById('ftHint');
    const box = document.getElementById('ftBox');
    if (hint) hint.textContent = msg || FieldTripRules.ftGoal(ft && ft.sv, ft && ft.run);
    if (box) box.style.display = 'block';
    const act = document.getElementById('ftAct');
    if (act){
      const p = ft && ft.near;
      act.classList.toggle('show', !!(p && p.act && p.kind !== 'ride'));
      if (p && p.act) act.textContent = p.act;
    }
  }
  function buildFieldTrip(){
    const started = FieldTripRules.ftNewVisit(ftState());
    ft = {trash:[], solids:[], sv: started.state, run: started.run, near:null, bus:null, homeBus:null};
    ftSave(started.state);
    try { checkpoints[0] = {idx:0, spawn:{x:0,y:0.5,z:18}, flag:new THREE.Object3D()}; } catch(e){}
    scene.background = new THREE.Color('#87c8ff');
    if (scene.fog){ scene.fog.color.copy(scene.background); scene.fog.near = 40; scene.fog.far = 140; }
    try { if (typeof renderer !== 'undefined' && renderer && renderer.setClearColor) renderer.setClearColor('#87c8ff'); } catch(e){}
    const hemi = new THREE.HemisphereLight(0xfff4d8, 0x6a9a4a, 1.05); scene.add(hemi); ftKeep(hemi);
    const sun = new THREE.DirectionalLight('#fff3c8', 0.7); sun.position.set(8, 16, 6); scene.add(sun); ftKeep(sun);
    // one big lawn so the yard and nook don't sit on the default cream slab
    ftPlat(0, 0.14, -4, 80, 100, '#3f8f3a', 0.24);
    ftPlat(0, 0.16, 16, 36, 28, '#4ea247', 0.16);
    ftPlat(0, 0.16, -22, 48, 48, '#3d9140', 0.16);
    // school facade (yard)
    ftMesh(new THREE.BoxGeometry(16, 8, 2), '#6a5a88', 0, 4, 28);
    ftLab('🏫 Afterbell School', 0, 8.4, 26);
    // path
    ftPlat(0, 0.05, 4, 4, 16, '#c8bea0', 0.08);
    ftPlat(0, 0.05, -14, 3.2, 20, '#c8bea0', 0.08);
    // Afterbell bus in the yard
    const bus = new THREE.Group();
    const body = new THREE.Mesh(new THREE.BoxGeometry(3.6, 2.2, 7.2), new THREE.MeshLambertMaterial({color:'#f0c44a'}));
    body.position.y = 1.3; bus.add(body);
    const cab = new THREE.Mesh(new THREE.BoxGeometry(3.4, 1.2, 2.2), new THREE.MeshLambertMaterial({color:'#ffe27a'}));
    cab.position.set(0, 2.2, 2.6); bus.add(cab);
    [[-1.3,0.5,2.4],[1.3,0.5,2.4],[-1.3,0.5,-2.4],[1.3,0.5,-2.4]].forEach(p => {
      const w = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, 0.4, 10), new THREE.MeshLambertMaterial({color:'#2d2d2d'}));
      w.rotation.z = Math.PI/2; w.position.set(p[0], p[1], p[2]); bus.add(w);
    });
    bus.position.set(FieldTripRules.FT_BUS.x, 0, FieldTripRules.FT_BUS.z);
    scene.add(bus); ftKeep(bus); ft.bus = bus;
    ftLab('🚌 Afterbell bus', FieldTripRules.FT_BUS.x, 3.6, FieldTripRules.FT_BUS.z);
    // Ms. Bramble
    ftMesh(new THREE.BoxGeometry(0.7, 1.6, 0.5), '#c45c8a', FieldTripRules.FT_TEACHER.x, 0.9, FieldTripRules.FT_TEACHER.z);
    ftLab('👩‍🏫 Ms. Bramble', FieldTripRules.FT_TEACHER.x, 2.4, FieldTripRules.FT_TEACHER.z);
    // Nature Nook
    ftMesh(new THREE.BoxGeometry(10, 4.2, 8), '#e8d9b0', 0, 2.1, -36);
    ftMesh(new THREE.BoxGeometry(10.4, 0.3, 8.4), '#6a8a3a', 0, 4.3, -36);
    ftLab('🌿 Pebblebrook Nature Nook', 0, 5.2, -36);
    // willow / brook / lookout
    ftMesh(new THREE.CylinderGeometry(0.4, 0.5, 3.4, 8), '#6b3a1d', -18, 1.7, -12);
    ftMesh(new THREE.SphereGeometry(1.8, 8, 6), '#5aaa4a', -18, 3.6, -12);
    ftLab('🌳 Willow path', -18, 5.4, -12);
    [[-22,18],[14,22],[-16,-8],[18,-8],[-26,-28],[20,-20]].forEach(p => {
      ftMesh(new THREE.CylinderGeometry(0.3, 0.38, 2.4, 7), '#6b3a1d', p[0], 1.2, p[1]);
      ftMesh(new THREE.SphereGeometry(1.2, 7, 5), (p[1] < 0 ? '#4fa15a' : '#68b85a'), p[0], 2.6, p[1]);
    });
    ftPlat(16, 0.06, -18, 6, 4, '#6aa0c8', 0.08);
    ftLab('💧 Brookbell Creek', 16, 1.8, -18);
    ftMesh(new THREE.BoxGeometry(3, 1.2, 3), '#8b6a3a', 22, 0.7, -32);
    ftLab('🔭 Lookout', 22, 2.2, -32);
    // guide Fern
    ftMesh(new THREE.BoxGeometry(0.7, 1.6, 0.5), '#3a8f5a', FieldTripRules.FT_GUIDE.x, 0.9, FieldTripRules.FT_GUIDE.z);
    ftLab('🧭 Fern', FieldTripRules.FT_GUIDE.x, 2.4, FieldTripRules.FT_GUIDE.z);
    // home bus (hidden until all finds)
    const home = bus.clone();
    home.position.set(FieldTripRules.FT_HOME_BUS.x, 0, FieldTripRules.FT_HOME_BUS.z);
    home.visible = false;
    scene.add(home); ftKeep(home); ft.homeBus = home;
    ftLab('🚌 Gate', FieldTripRules.FT_HOME_BUS.x, 3.4, FieldTripRules.FT_HOME_BUS.z);
    // treasures
    ft.findMeshes = {};
    (FieldTripRules.FT_FINDS || []).forEach(f => {
      const m = ftMesh(new THREE.BoxGeometry(0.55, 0.4, 0.55), '#f4e27a', f.x, 0.4, f.z);
      ftLab((f.emoji||'🔍') + ' ' + f.name, f.x, 1.5, f.z);
      ft.findMeshes[f.id] = m;
    });
    if (P){ P.x=0; P.y=0.5; P.z=18; P.vx=0; P.vz=0; P.vy=0; }
    if (typeof cam !== 'undefined' && cam){ cam.yaw=0; cam.pitch=0.16; cam.dist=10; }
    const box=document.getElementById('ftBox'); if(box) box.style.display='block';
    banner('🚌 Field trip day! Ms. Bramble is taking Afterbell School to Pebblebrook Nature Nook. Board the bus, then find five trail treasures.');
    ftPaintFinds();
    ftHud();
  }
  function ftEnter(){
    if (P){ P.x=0; P.y=0.5; P.z=18; P.vx=0; P.vz=0; P.vy=0; }
    if (typeof cam !== 'undefined' && cam){ cam.yaw=0; cam.pitch=0.16; cam.dist=10; }
  }
  function ftPaintFinds(){
    if (!ft) return;
    (FieldTripRules.FT_FINDS || []).forEach(f => {
      const m = (ft.findMeshes || {})[f.id];
      if (m) m.visible = !FieldTripRules.ftHas(ft.sv, f.id);
    });
    if (ft.homeBus) ft.homeBus.visible = FieldTripRules.ftAll(ft.sv) && ft.run && (ft.run.phase === 'nook' || ft.run.phase === 'done');
  }
  function ftAct(){
    if (!ft) return;
    const hit = FieldTripRules.ftNear(P.x, P.z, ft.sv, ft.run);
    if (!hit) return;
    if (hit.kind === 'talk'){ banner(hit.text); return; }
    if (hit.kind === 'bus'){
      const r = FieldTripRules.ftBoardBus(ft.run);
      if (r.ok){ banner('🚌 All aboard! The Afterbell bus is rolling to Pebblebrook Nature Nook.'); if (typeof cam!=='undefined' && cam){ cam.yaw=0.2; cam.pitch=0.1; cam.dist=12; } }
      return;
    }
    if (hit.kind === 'find'){
      const r = FieldTripRules.ftPick(ft.sv, hit.id);
      if (!r.ok) return;
      ft.sv = r.state; ftSave(ft.sv); ftPaintFinds();
      banner((hit.emoji||'🔍') + ' ' + (r.item && r.item.blurb ? r.item.blurb : hit.name) + (r.left ? ('  (' + (FieldTripRules.FT_FINDS.length - r.left) + '/' + FieldTripRules.FT_FINDS.length + ')') : '  All five! Meet the bus at the gate.'));
      return;
    }
    if (hit.kind === 'home'){
      const r = FieldTripRules.ftBoardHome(ft.run, ft.sv);
      if (!r.ok){ banner('Fern is still waiting on a few treasures.'); return; }
      ft.sv = r.state; ftSave(ft.sv);
      if (r.coins && typeof coins !== 'undefined'){ try { coins += r.coins; if (typeof saveCoins === 'function') saveCoins(); } catch(e){} }
      banner((r.message || 'Bus ride home!') + (r.coins ? ('  +' + r.coins + ' 🪙') : ''));
      if (P){ P.x=0; P.z=10; P.y=0.5; }
      return;
    }
  }
  function ftUpdate(dt){
    if (!ft) return;
    if (ft.run.phase === 'ride'){
      FieldTripRules.ftTickRide(ft.run, dt);
      if (P && ft.bus){
        P.x = ft.bus.position.x;
        P.z = ft.bus.position.z;
        P.y = 1.6;
        P.vx = P.vz = 0;
        ft.bus.position.z = 10 - Math.min(1, (ft.run.rideT || 0) / FieldTripRules.FT_RIDE_T) * 16;
      }
      if (ft.run.phase === 'nook'){
        if (P){ P.x = FieldTripRules.FT_NOOK.x; P.y=0.5; P.z = FieldTripRules.FT_NOOK.z + 4; P.vx=0; P.vz=0; }
        if (typeof cam!=='undefined' && cam){ cam.yaw=0; cam.pitch=0.18; cam.dist=11; }
        banner('🌿 Welcome to Pebblebrook Nature Nook! Fern the guide is in the courtyard. Find five trail treasures, then ride home.');
        ftPaintFinds();
      }
    }
    if (P && P.y < -8){ P.x=0; P.y=0.5; P.z = (ft.run && ft.run.phase === 'nook') ? FieldTripRules.FT_NOOK.z + 4 : 18; P.vx=P.vz=P.vy=0; }
    ft.near = FieldTripRules.ftNear(P ? P.x : 0, P ? P.z : 0, ft.sv, ft.run);
    ftHud(FieldTripRules.ftGoal(ft.sv, ft.run));
  }
  function ftKey(e){
    if (!ft || e.repeat) return false;
    if (e.code === 'KeyE' || e.code === 'KeyF' || e.key === 'e' || e.key === 'f'){ ftAct(); return true; }
    return false;
  }
  function ftPad(jp){
    if (!ft || !jp) return false;
    if (jp[2] || jp[3]){ ftAct(); return true; }
    return false;
  }
  function fieldTripStop(){
    if (!ft) return;
    (ft.solids||[]).forEach(b => { try{ b.active=false; if (typeof solids!=='undefined'){ const i=solids.indexOf(b); if(i>=0) solids.splice(i,1);} }catch(e){} });
    (ft.trash||[]).forEach(m => { try{ scene.remove(m);}catch(e){} });
    ft=null;
    const box=document.getElementById('ftBox'); if(box) box.style.display='none';
    const act=document.getElementById('ftAct'); if(act) act.classList.remove('show');
  }
  if (typeof window !== 'undefined') window.ftDebug = {
    probe(){ if (!ft) return null; return {phase: ft.run && ft.run.phase, found: ((ft.sv && ft.sv.found)||[]).slice(), won: !!(ft.sv && ft.sv.won), P: P ? {x:P.x,y:P.y,z:P.z} : null}; },
    nook(){ if (!ft) return; ft.run.phase='nook'; ft.run.rideT=FieldTripRules.FT_RIDE_T; if(P){P.x=0;P.y=0.5;P.z=FieldTripRules.FT_NOOK.z+4;} ftPaintFinds(); },
    go(id){
      if (!ft || !P) return;
      const F = FieldTripRules;
      const map = {bus:F.FT_BUS, home:F.FT_HOME_BUS, teacher:F.FT_TEACHER, fern:F.FT_GUIDE, nook:F.FT_NOOK};
      const t = F.ftFind(id) || map[id];
      if (!t) return;
      P.x=t.x; P.y=0.5; P.z=t.z; P.vx=0; P.vz=0; P.vy=0;
    }
  };
  try {
    const act=document.getElementById('ftAct'); if(act && !act.__ft){ act.__ft=true; act.onclick=ev=>{ev.preventDefault();ev.stopPropagation();ftAct();}; }
  } catch(e){}
