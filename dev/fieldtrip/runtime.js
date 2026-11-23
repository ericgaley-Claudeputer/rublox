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
      if (typeof t297Lab === 'function'){ const l = t297Lab(text, x, y, z); if (l){ l.userData = l.userData || {}; l.userData.ftLab = true; return ftKeep(l); } }
    } catch(e){}
    return null;
  }
  function ftPlat(x, y, z, w, d, col, h){
    const b = plat(x, y, z, w, d, col, h == null ? 0.2 : h);
    if (b && b.mesh) ftKeep(b.mesh);
    if (b) (ft.solids || (ft.solids=[])).push(b);
    return b;
  }
  function ftApplyDaySky(){
    const hex = '#7ec8ff';
    try {
      scene.background = new THREE.Color(hex);
      if (scene.fog){ scene.fog.color.set(hex); scene.fog.near = 55; scene.fog.far = 180; }
      if (typeof renderer !== 'undefined' && renderer && renderer.setClearColor) renderer.setClearColor(hex);
    } catch(e){}
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
  function ftNpc(av, x, z, fx, fz, col){
    try {
      const m = buildPlayer(Object.assign({}, typeof DEF !== 'undefined' ? DEF : {}, av));
      m.g.position.set(x, .05, z); m.g.rotation.y = Math.atan2(fx - x, fz - z); scene.add(m.g); ftKeep(m.g); return m;
    } catch(e){ return ftMesh(new THREE.BoxGeometry(0.7, 1.6, 0.5), col, x, 0.9, z); }
  }
  function ftTree(x, z, h, leaf){
    const tall = h || 2.6;
    ftMesh(new THREE.CylinderGeometry(0.28, 0.36, tall, 7), '#6b3a1d', x, tall/2, z);
    ftMesh(new THREE.SphereGeometry(1.15 + tall * 0.12, 7, 5), leaf || '#4fa15a', x, tall + 0.4, z);
  }
  function ftSchoolBuilding(){
    // deeper schoolhouse with a roof, door, windows, steps and a flag
    ftMesh(new THREE.BoxGeometry(18, 8, 8), '#7a6aa0', 0, 4.1, 32);
    ftMesh(new THREE.BoxGeometry(19, 0.35, 9), '#5a4a78', 0, 8.25, 32);
    const roof = new THREE.Mesh(new THREE.ConeGeometry(13, 3.2, 4), new THREE.MeshLambertMaterial({color:'#4a3a68'}));
    roof.position.set(0, 10.1, 32); roof.rotation.y = Math.PI/4; scene.add(roof); ftKeep(roof);
    ftMesh(new THREE.BoxGeometry(2.2, 3.4, 0.3), '#5a3a22', 0, 1.8, 27.9);
    ftPlat(0, 0.45, 27.2, 4.2, 2.2, '#c8bea0', 0.35);
    [[-6, 5.2], [6, 5.2], [-6, 3.2], [6, 3.2], [-10, 5.2], [10, 5.2]].forEach(w => {
      ftMesh(new THREE.BoxGeometry(1.6, 1.4, 0.12), '#8ec6e8', w[0], w[1], 27.9);
    });
    ftMesh(new THREE.CylinderGeometry(0.08, 0.08, 4.2, 8), '#c45c1a', 9.2, 10.4, 30);
    ftMesh(new THREE.BoxGeometry(1.2, 0.8, 0.06), '#e8f4ff', 9.9, 12.2, 30);
    ftLab('🏫 Afterbell School', 0, 12.4, 26);
    // In front of the spawn (z=18, looking -z) and in from the left edge so the label stays on screen.
    ftMesh(new THREE.BoxGeometry(1.6, 0.7, 0.7), '#8b6a3a', -4.6, 0.5, 13.4);
    ftLab('🪑 Yard bench', -4.6, 2.3, 13.4);
  }
  function ftNookBuilding(){
    // Shell (not a solid block) so you can walk inside and see the exhibits.
    const wall = '#d7c4a0', trim = '#6b4a28', leaf = '#b7e0a8';
    ftPlat(0, 0.22, -40, 13.4, 9.4, '#d8c49a', 0.16);
    ftMesh(new THREE.BoxGeometry(14, 5.0, 0.28), wall, 0, 2.7, -44.9); // back
    ftMesh(new THREE.BoxGeometry(0.28, 5.0, 10), wall, -7.0, 2.7, -40);
    ftMesh(new THREE.BoxGeometry(0.28, 5.0, 10), wall, 7.0, 2.7, -40);
    // front wall with a doorway
    ftMesh(new THREE.BoxGeometry(5.4, 5.0, 0.28), wall, -4.7, 2.7, -35.15);
    ftMesh(new THREE.BoxGeometry(5.4, 5.0, 0.28), wall, 4.7, 2.7, -35.15);
    ftMesh(new THREE.BoxGeometry(4.0, 1.6, 0.28), wall, 0, 4.4, -35.15);
    ftMesh(new THREE.BoxGeometry(0.22, 3.4, 0.22), trim, -1.15, 1.8, -35.0);
    ftMesh(new THREE.BoxGeometry(0.22, 3.4, 0.22), trim, 1.15, 1.8, -35.0);
    ftMesh(new THREE.BoxGeometry(2.5, 0.22, 0.22), trim, 0, 3.5, -35.0);
    ftMesh(new THREE.BoxGeometry(15.2, 0.35, 11.2), '#5a7a32', 0, 5.4, -40);
    const roof = new THREE.Mesh(new THREE.ConeGeometry(10.5, 2.8, 4), new THREE.MeshLambertMaterial({color:'#6a8a3a'}));
    roof.position.set(0, 7.1, -40); roof.rotation.y = Math.PI/4; scene.add(roof); ftKeep(roof);
    // facade: framed windows, flower boxes, porch, door lantern
    [[-5, 3.4], [5, 3.4]].forEach(w => {
      ftMesh(new THREE.BoxGeometry(2.6, 2.0, 0.12), '#8b6a3a', w[0], w[1], -34.96);
      ftMesh(new THREE.BoxGeometry(2.2, 1.6, 0.08), leaf, w[0], w[1], -34.88);
    });
    ftMesh(new THREE.BoxGeometry(2.4, 0.3, 0.5), '#5a7a32', -5, 2.2, -34.6);
    ftMesh(new THREE.BoxGeometry(2.4, 0.3, 0.5), '#5a7a32', 5, 2.2, -34.6);
    ftMesh(new THREE.SphereGeometry(0.12, 6, 6), '#e8c04a', -5, 2.5, -34.5);
    ftMesh(new THREE.SphereGeometry(0.12, 6, 6), '#e8c04a', 5, 2.5, -34.5);
    ftPlat(0, 0.4, -33.2, 8, 4.2, '#c4a574', 0.28);
    ftMesh(new THREE.CylinderGeometry(0.18, 0.2, 3.2, 8), '#8b6a3a', -3.4, 1.8, -33.4);
    ftMesh(new THREE.CylinderGeometry(0.18, 0.2, 3.2, 8), '#8b6a3a', 3.4, 1.8, -33.4);
    ftMesh(new THREE.BoxGeometry(8.2, 0.16, 2.8), '#6a8a3a', 0, 3.5, -33.2);
    const lamp = ftMesh(new THREE.SphereGeometry(0.18, 8, 8), '#ffe9a0', 0, 3.15, -34.7);
    try { lamp.material.emissive = new THREE.Color('#ffe9a0'); lamp.material.emissiveIntensity = 0.8; } catch(e){}
    // inside: exhibit cases, rug, bench, a hanging lamp and a warm light
    ftMesh(new THREE.BoxGeometry(2.2, 1.4, 0.8), '#d7c49a', -4.4, 0.95, -41.6);
    ftMesh(new THREE.BoxGeometry(2.2, 1.4, 0.8), '#d7c49a', 4.4, 0.95, -41.6);
    ftMesh(new THREE.BoxGeometry(1.6, 0.08, 0.5), '#8ec6e8', -4.4, 1.7, -41.5);
    ftMesh(new THREE.BoxGeometry(1.6, 0.08, 0.5), '#8ec6e8', 4.4, 1.7, -41.5);
    ftMesh(new THREE.CylinderGeometry(0.08, 0.1, 0.7, 6), '#6a4a28', -4.4, 1.15, -41.6);
    ftMesh(new THREE.SphereGeometry(0.38, 7, 6), '#3d7a38', -4.4, 1.7, -41.6);
    ftMesh(new THREE.CylinderGeometry(0.07, 0.09, 0.55, 6), '#6a4a28', 4.4, 1.1, -41.6);
    ftMesh(new THREE.ConeGeometry(0.32, 0.7, 7), '#c4a050', 4.4, 1.65, -41.6);
    ftMesh(new THREE.BoxGeometry(0.7, 0.9, 0.14), '#d8c090', 0, 1.15, -44.5);
    ftMesh(new THREE.SphereGeometry(0.16, 6, 6), '#c45a3a', 0, 1.55, -44.5);
    ftMesh(new THREE.BoxGeometry(3.2, 0.06, 2.2), '#8b3a2a', 0, 0.28, -40);
    ftMesh(new THREE.BoxGeometry(1.8, 0.55, 0.6), '#8b6a3a', 0, 0.52, -42.4);
    ftMesh(new THREE.BoxGeometry(1.6, 1.1, 0.08), '#c4a060', -3.2, 2.6, -44.7);
    ftMesh(new THREE.BoxGeometry(1.6, 1.1, 0.08), '#7a9a4a', 3.2, 2.6, -44.7);
    ftMesh(new THREE.BoxGeometry(2.4, 0.7, 0.2), '#8b6a3a', 0, 2.2, -44.7);
    (function(){ const c=new THREE.Mesh(new THREE.BoxGeometry(13.6, 0.08, 9.6), new THREE.MeshBasicMaterial({color:'#f3e6c4'})); c.position.set(0, 5.18, -40); scene.add(c); ftKeep(c); })();
    const glow = ftMesh(new THREE.SphereGeometry(0.16, 8, 8), '#ffe7b0', 0, 4.7, -40);
    try { glow.material.emissive = new THREE.Color('#ffe7b0'); glow.material.emissiveIntensity = 0.9; } catch(e){}
    try {
      const lit = new THREE.PointLight('#ffe0b0', 0.7, 14, 2);
      lit.position.set(0, 4.4, -40); scene.add(lit); ftKeep(lit);
    } catch(e){}
    ftLab('🌿 Pebblebrook Nature Nook', 0, 8.6, -35.2);
  }
  function ftMakeBus(){
    const bus = new THREE.Group();
    const yellow = new THREE.MeshLambertMaterial({color:'#f0c44a'});
    const yellowIn = new THREE.MeshLambertMaterial({color:'#e8b83c'});
    const body = new THREE.Mesh(new THREE.BoxGeometry(3.6, 2.2, 7.2), yellow);
    body.position.y = 1.3; bus.add(body);
    function panel(w,h,d, mat, x,y,z){ const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d), mat); m.position.set(x,y,z); bus.add(m); return m; }
    panel(0.06, 0.7, 7.0, yellowIn, -1.7, 1.05, 0);
    panel(0.06, 0.45, 7.0, yellowIn, -1.7, 2.28, 0);
    panel(0.06, 0.7, 7.0, yellowIn, 1.7, 1.05, 0);
    panel(0.06, 0.45, 7.0, yellowIn, 1.7, 2.28, 0);
    panel(3.3, 2.0, 0.06, yellowIn, 0, 1.5, -3.45);
    const roofIn = new THREE.MeshBasicMaterial({color:'#f3d56a'});
    panel(3.4, 0.06, 7.0, roofIn, 0, 2.46, 0);
    const floor = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.12, 6.6), new THREE.MeshLambertMaterial({color:'#8b6a3a'}));
    floor.position.y = 0.72; bus.add(floor);
    const seatL = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.55, 4.6), new THREE.MeshLambertMaterial({color:'#3a6aaa'}));
    seatL.position.set(-1.0, 0.95, -0.4); bus.add(seatL);
    const seatR = seatL.clone(); seatR.position.x = 1.0; bus.add(seatR);
    panel(3.0, 0.32, 0.7, new THREE.MeshLambertMaterial({color:'#5a4a32'}), 0, 1.2, 2.45);
    const wheel = new THREE.Mesh(new THREE.TorusGeometry(0.28, 0.05, 8, 12), new THREE.MeshLambertMaterial({color:'#2d2d2d'}));
    wheel.position.set(-0.35, 1.45, 2.2); wheel.rotation.x = Math.PI/2; bus.add(wheel);
    const cab = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.28, 2.2), new THREE.MeshBasicMaterial({color:'#f3d56a'}));
    cab.position.set(0, 2.48, 2.6); bus.add(cab);
    const glass = new THREE.MeshLambertMaterial({color:'#3a5a7a', transparent:true, opacity:0.55});
    const stripe = new THREE.MeshLambertMaterial({color:'#1d2340'});
    [-1.81, 1.81].forEach(x => {
      for (let i = 0; i < 4; i++){ const w = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.7, 1.1), glass); w.position.set(x, 1.85, -2.6 + i * 1.5); bus.add(w); }
      const st = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.16, 7.0), stripe); st.position.set(x, 1.1, 0); bus.add(st);
    });
    const wind = new THREE.Mesh(new THREE.BoxGeometry(3.0, 0.8, 0.04), glass); wind.position.set(0, 2.3, 3.72); bus.add(wind);
    const door = new THREE.Mesh(new THREE.BoxGeometry(0.04, 1.6, 0.9), glass); door.position.set(1.82, 1.1, 2.6); bus.add(door);
    [[-1.3,0.5,2.4],[1.3,0.5,2.4],[-1.3,0.5,-2.4],[1.3,0.5,-2.4]].forEach(p => {
      const w = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, 0.4, 10), new THREE.MeshLambertMaterial({color:'#2d2d2d'}));
      w.rotation.z = Math.PI/2; w.position.set(p[0], p[1], p[2]); bus.add(w);
    });
    return bus;
  }
  function ftBuildRoad(){
    const path = FieldTripRules.FT_RIDE_PATH || [];
    for (let i = 0; i < path.length - 1; i++){
      const a = path[i], b = path[i+1];
      const mx = (a.x + b.x) / 2, mz = (a.z + b.z) / 2;
      const len = Math.hypot(b.x - a.x, b.z - a.z) + 1.6;
      const alongX = Math.abs(b.x - a.x) >= Math.abs(b.z - a.z);
      ftPlat(mx, 0.18, mz, alongX ? len : 3.4, alongX ? 3.4 : len, '#2a2e33', 0.1);
      // little dashed center marks
      const steps = Math.max(1, (len / 3) | 0);
      for (let s = 1; s < steps; s++){
        const u = s / steps;
        ftMesh(new THREE.BoxGeometry(alongX ? 0.9 : 0.16, 0.05, alongX ? 0.16 : 0.9), '#f6d44a', a.x + (b.x-a.x)*u, 0.24, a.z + (b.z-a.z)*u);
      }
    }
    // roadside scenery
    [[12,6],[12,-2],[12,-10],[18,-2],[30,6],[30,-6],[30,-16],[18,-24],[-10,2],[-10,-12],[8,-24]].forEach((p, i) => {
      ftTree(p[0], p[1], 2.2 + (i % 3) * 0.35, i % 2 ? '#4fa15a' : '#68b85a');
    });
    ftMesh(new THREE.BoxGeometry(0.16, 2.4, 1.6), '#c45c1a', 24.9, 1.4, -6);
    ftLab('➡️ Pebblebrook', 25.2, 3.0, -6);
    ftMesh(new THREE.BoxGeometry(4.4, 2.8, 3.6), '#c45c3a', 32, 1.5, -10);
    const barnRoof = new THREE.Mesh(new THREE.ConeGeometry(3.4, 1.8, 4), new THREE.MeshLambertMaterial({color:'#8b2e1a'}));
    barnRoof.position.set(32, 3.5, -10); barnRoof.rotation.y = Math.PI/4; scene.add(barnRoof); ftKeep(barnRoof);
    ftLab('🌾 Hayloft farm', 32, 4.8, -10);
    ftPlat(24, 0.22, -18, 8, 3.2, '#6aa0c8', 0.16);
    ftLab('💧 Brookbell bridge', 24, 1.8, -18);
  }
  function buildFieldTrip(){
    const started = FieldTripRules.ftNewVisit(ftState());
    ft = {trash:[], solids:[], sv: started.state, run: started.run, near:null, bus:null, homeBus:null};
    ftSave(started.state);
    try { checkpoints[0] = {idx:0, spawn:{x:0,y:0.5,z:18}, flag:new THREE.Object3D()}; } catch(e){}
    ftApplyDaySky();
    const hemi = new THREE.HemisphereLight(0xe8f4ff, 0x4a7a3a, 1.1); scene.add(hemi); ftKeep(hemi);
    const sun = new THREE.DirectionalLight('#fff8e0', 0.85); sun.position.set(10, 18, 8); scene.add(sun); ftKeep(sun);
    ftPlat(0, 0.14, -4, 90, 110, '#3f8f3a', 0.24);
    ftPlat(0, 0.16, 16, 36, 28, '#4ea247', 0.16);
    ftPlat(0, 0.16, -28, 48, 48, '#3d9140', 0.16);
    ftSchoolBuilding();
    ftBuildRoad();
    const bus = ftMakeBus();
    bus.position.set(FieldTripRules.FT_BUS.x, 0, FieldTripRules.FT_BUS.z);
    scene.add(bus); ftKeep(bus); ft.bus = bus;
    ftLab('🚌 Afterbell bus', FieldTripRules.FT_BUS.x, 3.6, FieldTripRules.FT_BUS.z);
    ftNpc({body: 'girl', head: '#e0ac69', shirt: '#c45c8a', pants: '#3a3f6a', pantsPat: 'skirt', hair: 'bun', hairColor: '#6b4226', face: 'smile', shirtPat: null, hat: null}, FieldTripRules.FT_TEACHER.x, FieldTripRules.FT_TEACHER.z, 0, 18, '#c45c8a');
    ftLab('👩‍🏫 Ms. Bramble', FieldTripRules.FT_TEACHER.x, 3.9, FieldTripRules.FT_TEACHER.z);
    ftNookBuilding();
    ftTree(-18, -12, 3.4, '#5aaa4a');
    ftLab('🌳 Willow path', -18, 5.4, -12);
    [[-22,18],[14,22],[-16,-8],[18,-8],[-26,-28],[20,-20],[-14,-40],[12,-48]].forEach(p => ftTree(p[0], p[1], 2.4, p[1] < 0 ? '#4fa15a' : '#68b85a'));
    ftPlat(16, 0.22, -18, 7, 4.5, '#6aa0c8', 0.12);
    ftLab('💧 Brookbell Creek', 16, 1.8, -18);
    ftMesh(new THREE.BoxGeometry(3.2, 1.4, 3.2), '#8b6a3a', 22, 0.85, -32);
    ftMesh(new THREE.CylinderGeometry(0.15, 0.18, 1.4, 8), '#c4a574', 22, 1.8, -32);
    ftLab('🔭 Lookout', 22, 2.6, -32);
    // Fern waits off to the side of the courtyard, not on the drop-off
    ftNpc({head: '#c68642', shirt: '#3a8f5a', pants: '#6b4a2a', hair: 'short', hairColor: '#2a1a10', face: 'smile', shirtPat: null, hat: null}, FieldTripRules.FT_GUIDE.x, FieldTripRules.FT_GUIDE.z, FieldTripRules.FT_ARRIVE.x, FieldTripRules.FT_ARRIVE.z, '#3a8f5a');
    ftLab('🧭 Fern', FieldTripRules.FT_GUIDE.x, 3.9, FieldTripRules.FT_GUIDE.z);
    const home = ftMakeBus();
    home.position.set(FieldTripRules.FT_HOME_BUS.x, 0, FieldTripRules.FT_HOME_BUS.z);
    home.visible = false;
    scene.add(home); ftKeep(home); ft.homeBus = home;
    ftLab('🚌 Gate', FieldTripRules.FT_HOME_BUS.x, 3.4, FieldTripRules.FT_HOME_BUS.z);
    ft.findMeshes = {};
    (FieldTripRules.FT_FINDS || []).forEach(f => {
      const m = ftMesh(new THREE.BoxGeometry(0.55, 0.4, 0.55), '#f4e27a', f.x, 0.5, f.z);
      ftLab((f.emoji||'🔍') + ' ' + f.name, f.x, 1.6, f.z);
      ft.findMeshes[f.id] = m;
    });
    if (P){ P.x=0; P.y=0.5; P.z=18; P.vx=0; P.vz=0; P.vy=0; }
    if (typeof cam !== 'undefined' && cam){ cam.yaw=0; cam.pitch=0.16; cam.dist=10; }
    const box=document.getElementById('ftBox'); if(box) box.style.display='block';
    banner('🚌 Field trip day! Ms. Bramble is taking Afterbell School to Pebblebrook Nature Nook. Board the bus, sit tight for the ride, then find five trail treasures.');
    ftPaintFinds();
    ftHud();
  }
  function ftEnter(){
    if (P){ P.x=0; P.y=0.5; P.z=18; P.vx=0; P.vz=0; P.vy=0; }
    if (typeof cam !== 'undefined' && cam){ cam.yaw=0; cam.pitch=0.16; cam.dist=10; }
    ftApplyDaySky();
  }
  function ftPaintFinds(){
    if (!ft) return;
    (FieldTripRules.FT_FINDS || []).forEach(f => {
      const m = (ft.findMeshes || {})[f.id];
      if (m) m.visible = !FieldTripRules.ftHas(ft.sv, f.id);
    });
    if (ft.homeBus) ft.homeBus.visible = FieldTripRules.ftAll(ft.sv) && ft.run && (ft.run.phase === 'nook' || ft.run.phase === 'done');
  }
  function ftRideVis(hide){
    try {
      if (typeof model !== 'undefined' && model){
        if (model.g) model.g.visible = !hide;
        else if (model.visible != null) model.visible = !hide;
      }
    } catch(e){}
  }
  function ftSeatInBus(pose){
    if (!P || !pose) return;
    const side = 0.0, along = -2.15;
    const cy = Math.cos(pose.yaw || 0), sy = Math.sin(pose.yaw || 0);
    P.x = pose.x + side * cy + along * sy;
    P.z = pose.z + -side * sy + along * cy;
    P.y = 1.42;
    P.vx = P.vz = P.vy = 0;
    ftRideVis(true);
    if (typeof cam !== 'undefined' && cam){
      cam.yaw = Math.atan2(-sy, -cy);
      cam.pitch = 0.08;
      cam.dist = 0.22;
    }
    if (ft.bus){
      ft.bus.position.set(pose.x, 0, pose.z);
      ft.bus.rotation.y = pose.yaw || 0;
    }
  }

  function ftRideCam(){
    if (!ft || !ft.run || ft.run.phase !== 'ride' || typeof camera === 'undefined' || !camera) return false;
    const pose = FieldTripRules.ftRidePose(ft.run);
    if (!pose) return false;
    const cy = Math.cos(pose.yaw || 0), sy = Math.sin(pose.yaw || 0);
    const along = -1.5, ey = 1.55;
    const x = pose.x + along * sy, z = pose.z + along * cy;
    camera.position.set(x, ey, z);
    camera.lookAt(x + sy * 10, ey - 0.35, z + cy * 10);
    (ft.trash||[]).forEach(m => { if (m && m.userData && m.userData.ftLab) m.visible = false; });
    return true;
  }
  function ftAct(){
    if (!ft) return;
    const hit = FieldTripRules.ftNear(P.x, P.z, ft.sv, ft.run);
    if (!hit) return;
    if (hit.kind === 'talk'){ banner(hit.text); return; }
    if (hit.kind === 'bus'){
      const r = FieldTripRules.ftBoardBus(ft.run);
      if (r.ok){
        banner('🚌 All aboard! Grab a seat — the Afterbell bus is rolling to Pebblebrook Nature Nook.');
        const pose = FieldTripRules.ftRidePose(ft.run);
        ftSeatInBus(pose);
      }
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
      if (P){ P.x=0; P.z=18; P.y=0.5; }
      if (typeof cam !== 'undefined' && cam){ cam.yaw=0; cam.pitch=0.16; cam.dist=10; }
      return;
    }
  }
  function ftUpdate(dt){
    if (!ft) return;
    ftApplyDaySky();
    if (ft.run.phase === 'ride'){
      FieldTripRules.ftTickRide(ft.run, dt);
      const pose = FieldTripRules.ftRidePose(ft.run);
      ftSeatInBus(pose);
      if (ft.run.phase === 'nook'){
        const a = FieldTripRules.FT_ARRIVE || {x:3.4, z:-8};
        if (P){ P.x=a.x; P.y=0.5; P.z=a.z; P.vx=0; P.vz=0; }
        if (typeof cam!=='undefined' && cam){ cam.yaw=0.15; cam.pitch=0.16; cam.dist=9; }
        ftRideVis(false);
        (ft.trash||[]).forEach(m => { if (m && m.userData && m.userData.ftLab) m.visible = true; });
        if (ft.bus){ ft.bus.position.set(FieldTripRules.FT_HOME_BUS.x, 0, FieldTripRules.FT_HOME_BUS.z); ft.bus.rotation.y = Math.PI; }
        banner('🌿 Welcome to Pebblebrook Nature Nook! Fern is waiting by the nature hall — not under the bus. Find five trail treasures, then ride home.');
        ftPaintFinds();
      }
    }
    if (P && P.y < -8){ P.x=0; P.y=0.5; P.z = (ft.run && ft.run.phase === 'nook') ? (FieldTripRules.FT_ARRIVE||{}).z || -8 : 18; P.vx=P.vz=P.vy=0; }
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
    if (!ft._x && (jp[2] || jp[3])){ ft._x = true; ftAct(); return true; }
    if (!jp[2] && !jp[3]) ft._x = false;
    return false;
  }
  function fieldTripStop(){
    ftRideVis(false);
    if (!ft) return;
    (ft.solids||[]).forEach(b => { try{ b.active=false; if (typeof solids!=='undefined'){ const i=solids.indexOf(b); if(i>=0) solids.splice(i,1);} }catch(e){} });
    (ft.trash||[]).forEach(m => { try{ scene.remove(m);}catch(e){} });
    ft=null;
    const box=document.getElementById('ftBox'); if(box) box.style.display='none';
    const act=document.getElementById('ftAct'); if(act) act.classList.remove('show');
  }
  if (typeof window !== 'undefined') window.ftDebug = {
    probe(){ if (!ft) return null; const pose = (ft.run && ft.run.phase === 'ride' && FieldTripRules.ftRidePose) ? FieldTripRules.ftRidePose(ft.run) : null; return {phase: ft.run && ft.run.phase, found: ((ft.sv && ft.sv.found)||[]).slice(), won: !!(ft.sv && ft.sv.won), P: P ? {x:P.x,y:P.y,z:P.z} : null, ride: pose, fern: FieldTripRules.FT_GUIDE, arrive: FieldTripRules.FT_ARRIVE}; },
    nook(){ if (!ft) return; ft.run.phase='nook'; ft.run.rideT=FieldTripRules.FT_RIDE_T; const a=FieldTripRules.FT_ARRIVE||{x:3.4,z:-8}; if(P){P.x=a.x;P.y=0.5;P.z=a.z;} if (typeof cam!=='undefined' && cam){ cam.yaw=0.15; cam.pitch=0.16; cam.dist=9; } ftPaintFinds(); },
    inside(){ if (!ft) return; ft.run.phase='nook'; if(P){P.x=0;P.y=0.5;P.z=-40.2;P.vx=0;P.vz=0;} if (typeof cam!=='undefined' && cam){ cam.yaw=0; cam.pitch=0.18; cam.dist=4.4; } },
    ride(t){ if (!ft) return; ft.run.phase='ride'; ft.run.rideT= (t==null? 3.2 : t); const pose=FieldTripRules.ftRidePose(ft.run); ftSeatInBus(pose); ftRideVis(true); },
    go(id){
      if (!ft || !P) return;
      const F = FieldTripRules;
      const map = {bus:F.FT_BUS, home:F.FT_HOME_BUS, teacher:F.FT_TEACHER, fern:F.FT_GUIDE, nook:F.FT_NOOK, arrive:F.FT_ARRIVE};
      const t = F.ftFind(id) || map[id];
      if (!t) return;
      P.x=t.x; P.y=0.5; P.z=t.z; P.vx=0; P.vz=0; P.vy=0;
    }
  };
  try {
    const act=document.getElementById('ftAct'); if(act && !act.__ft){ act.__ft=true; act.onclick=ev=>{ev.preventDefault();ev.stopPropagation();ftAct();}; }
  } catch(e){}
