/* Tideglass Aquarium runtime — injected into the main engine IIFE, after the field-trip helpers. */
  let aq = null;
  function aqSave(s){ try { if (typeof save === 'function') save(AquariumRules.AQ_KEY, s); } catch(e){} }
  function aqState(){ try { return AquariumRules.aqLoad(typeof load === 'function' ? load(AquariumRules.AQ_KEY, null) : null); } catch(e){ return AquariumRules.aqFresh(); } }
  function aqWZ(z){ return (z||0) + ((aq && aq.shiftZ) || 0); }
  function aqKeep(m){
    if (aq && m){
      (aq.trash || (aq.trash=[])).push(m);
      if (aq.curZone){
        m.userData = m.userData || {};
        m.userData.aqZone = aq.curZone;
        (aq.zones || (aq.zones={}))[aq.curZone] = aq.zones[aq.curZone] || [];
        aq.zones[aq.curZone].push(m);
      }
    }
    return m;
  }
  function aqMesh(geo, col, x, y, z){
    const m = new THREE.Mesh(geo, new THREE.MeshLambertMaterial({color: col}));
    m.position.set(x, y, aqWZ(z)); scene.add(m); aqKeep(m); return m;
  }
  function aqLab(text, x, y, z){
    try { if (typeof t297Lab === 'function'){ const l = t297Lab(text, x, y, aqWZ(z)); if (l){ l.userData = l.userData || {}; l.userData.aqLab = true; return aqKeep(l); } } } catch(e){}
    return null;
  }
  function aqPlat(x, y, z, w, d, col, h){
    const b = plat(x, y, aqWZ(z), w, d, col, h == null ? 0.2 : h);
    if (b && b.mesh) aqKeep(b.mesh);
    if (b){ (aq.solids || (aq.solids=[])).push(b); if (aq.curZone) b.aqZone = aq.curZone; }
    return b;
  }
  function aqApplyZones(phase){
    if (!aq) return;
    const showYard = (phase === 'yard' || phase === 'ride' || phase === 'done');
    const showDest = (phase === 'hall' || phase === 'ride');
    const vis = {yard: showYard, dest: showDest, road: true, land: true};
    Object.keys(vis).forEach(z => {
      (aq.zones && aq.zones[z] || []).forEach(m => { if (m) m.visible = !!vis[z]; });
    });
    (aq.solids||[]).forEach(b => {
      if (!b) return;
      if (b.aqZone === 'yard') b.active = showYard;
      if (b.aqZone === 'dest') b.active = showDest;
    });
    if (typeof aqPaint === 'function') aqPaint();
  }
  function aqSky(){ if (typeof ftApplyDaySky === 'function') ftApplyDaySky(); else {
    try { scene.background = new THREE.Color('#7ec8ff'); if (scene.fog){ scene.fog.color.set('#7ec8ff'); scene.fog.near=55; scene.fog.far=180; } } catch(e){}
  } }
  function aqHud(msg){
    const hint = document.getElementById('aqHint');
    const box = document.getElementById('aqBox');
    if (hint) hint.textContent = msg || AquariumRules.aqGoal(aq && aq.sv, aq && aq.run);
    if (box) box.style.display = 'block';
    const act = document.getElementById('aqAct');
    if (act){
      const p = aq && aq.near;
      act.classList.toggle('show', !!(p && p.act && p.kind !== 'ride'));
      if (p && p.act) act.textContent = p.act;
    }
  }
  function aqHorizonLand(cx, cz, col){
    const prevZ = aq.curZone, prevS = aq.shiftZ;
    aq.curZone = 'land'; aq.shiftZ = 0;
    aqPlat(cx, 0.05, cz, 1600, 1600, col || '#3d8a70', 0.1);
    for (let i = 0; i < 20; i++){
      const a = i * Math.PI * 2 / 20;
      const r = 210 + (i % 4) * 14;
      const x = cx + Math.cos(a) * r, z = cz + Math.sin(a) * r;
      aqMesh(new THREE.SphereGeometry(5.5 + (i % 3), 7, 5), i % 2 ? '#2a6a58' : '#3d8a70', x, 2.8, z);
      aqMesh(new THREE.CylinderGeometry(0.28, 0.36, 3.0, 7), '#6b3a1d', x + 7, 1.5, z + 5);
      aqMesh(new THREE.SphereGeometry(1.3, 7, 5), '#2f7a5a', x + 7, 3.2, z + 5);
    }
    aq.curZone = prevZ; aq.shiftZ = prevS;
  }
  function aqTank(x, z, col, label, fishCol, kind, faceZ){
    // Framed tank with a sand bed and a front glass so the fish read from the plaza.
    const front = faceZ == null ? (z + 1.7) : faceZ;
    const wz = aqWZ(z), wfront = aqWZ(front);
    const frame = '#1d4a66';
    aqPlat(x, 0.2, z, 4.8, 3.6, '#2a5570', 0.18);
    const wall = plat(x, 2.7, wz, 4.4, 3.2, '#9ad8e8', 2.5);
    if (wall && wall.mesh){ wall.mesh.visible = false; aqKeep(wall.mesh); }
    if (wall){ (aq.solids || (aq.solids=[])).push(wall); if (aq.curZone) wall.aqZone = aq.curZone; }
    const waterCol = (kind === 'lantern' || col === '#163050') ? '#163050' : '#4eb8d4';
    const water = new THREE.Mesh(new THREE.BoxGeometry(4.0, 2.4, 2.8), new THREE.MeshLambertMaterial({color: waterCol, transparent:true, opacity:0.45}));
    water.position.set(x, 1.5, wz); scene.add(water); aqKeep(water);
    // frame posts and lintel
    [[-2.15, 0], [2.15, 0], [0, -1.5], [0, 1.5]].forEach((p, i) => {
      const isSide = i < 2;
      aqMesh(new THREE.BoxGeometry(isSide ? 0.18 : 4.4, isSide ? 2.8 : 0.18, isSide ? 3.2 : 0.18), frame, x+p[0], isSide ? 1.5 : (p[1] < 0 ? 0.25 : 2.75), z+p[1]);
    });
    const glass = new THREE.Mesh(new THREE.BoxGeometry(4.0, 2.3, 0.08), new THREE.MeshLambertMaterial({color:'#c8f4ff', transparent:true, opacity:0.28}));
    glass.position.set(x, 1.5, wfront); scene.add(glass); aqKeep(glass);
    aqMesh(new THREE.BoxGeometry(3.6, 0.2, 2.4), '#c8b070', x, 0.4, z);
    aqLab(label, x, 3.35, front + 0.15);
    const swimmers = [];
    const n = kind === 'jelly' ? 3 : (kind === 'turtle' ? 3 : 5);
    for (let i = 0; i < n; i++){
      const geo = kind === 'jelly' ? new THREE.SphereGeometry(0.28, 8, 6) : (kind === 'turtle' ? new THREE.SphereGeometry(0.32, 8, 6) : new THREE.SphereGeometry(0.18, 7, 6));
      const mat = new THREE.MeshLambertMaterial({color: fishCol, transparent: kind==='jelly', opacity: kind==='jelly'?0.85:1});
      if (kind === 'lantern' || fishCol === '#ffe566'){ try { mat.emissive = new THREE.Color(fishCol); mat.emissiveIntensity = 0.7; } catch(e){} }
      const m = new THREE.Mesh(geo, mat);
      m.position.set(x, 1.2, wz); scene.add(m); aqKeep(m);
      swimmers.push({m:m, ox:x, oz:wz, a: i * 1.4, r: 0.85 + i * 0.12, spd: 0.7 + i * 0.15, y: 1.0 + (i%3)*0.4});
    }
    (aq.fish || (aq.fish=[])).push.apply(aq.fish, swimmers);
  }
  function aqHallBuilding(){
    aq.curZone = 'dest'; aq.shiftZ = AquariumRules.AQ_DEST_DZ || 0;
    const wall = '#b9d4e2', trim = '#1d5a78';
    aqPlat(0, 0.22, -42, 15.2, 11.2, '#c5e6ee', 0.16);
    // shell walls, open doorway in the front and a viewing window in the back
    aqMesh(new THREE.BoxGeometry(0.3, 5.4, 12), wall, -8.0, 2.9, -42);
    aqMesh(new THREE.BoxGeometry(0.3, 5.4, 12), wall, 8.0, 2.9, -42);
    aqMesh(new THREE.BoxGeometry(4.6, 5.4, 0.3), wall, -5.7, 2.9, -47.9);
    aqMesh(new THREE.BoxGeometry(4.6, 5.4, 0.3), wall, 5.7, 2.9, -47.9);
    aqMesh(new THREE.BoxGeometry(7.0, 1.6, 0.3), wall, 0, 4.8, -47.9);
    // front facade: wings + transom, tall open door
    aqMesh(new THREE.BoxGeometry(6.0, 5.4, 0.3), wall, -6.1, 2.9, -36.15);
    aqMesh(new THREE.BoxGeometry(6.0, 5.4, 0.3), wall, 6.1, 2.9, -36.15);
    aqMesh(new THREE.BoxGeometry(4.2, 1.5, 0.3), wall, 0, 4.85, -36.15);
    aqMesh(new THREE.BoxGeometry(0.28, 3.8, 0.22), '#2a4a6a', -1.7, 2.0, -36.0);
    aqMesh(new THREE.BoxGeometry(0.28, 3.8, 0.22), '#2a4a6a', 1.7, 2.0, -36.0);
    aqMesh(new THREE.BoxGeometry(3.7, 0.28, 0.22), '#2a4a6a', 0, 3.95, -36.0);
    // teal trim and a canopy
    aqMesh(new THREE.BoxGeometry(16.4, 0.22, 0.4), trim, 0, 5.7, -35.9);
    aqMesh(new THREE.BoxGeometry(5.2, 0.12, 2.4), trim, 0, 4.15, -34.8);
    aqMesh(new THREE.BoxGeometry(17, 0.3, 13), trim, 0, 6.25, -42);
    const aRoof = new THREE.Mesh(new THREE.ConeGeometry(11.5, 2.6, 4), new THREE.MeshLambertMaterial({color:'#1d5a78'}));
    aRoof.position.set(0, 7.7, aqWZ(-42)); aRoof.rotation.y = Math.PI/4; scene.add(aRoof); aqKeep(aRoof);
    // facade window-tanks so the front of the hall itself reads as an aquarium
    function facadeTank(tx){
      const water = new THREE.Mesh(new THREE.BoxGeometry(3.6, 2.2, 0.7), new THREE.MeshLambertMaterial({color:'#3aa8c8', transparent:true, opacity:0.5}));
      water.position.set(tx, 2.4, aqWZ(-35.7)); scene.add(water); aqKeep(water);
      aqMesh(new THREE.BoxGeometry(3.9, 2.5, 0.16), '#1d4a66', tx, 2.4, -35.35);
      const glass = new THREE.Mesh(new THREE.BoxGeometry(3.5, 2.1, 0.06), new THREE.MeshLambertMaterial({color:'#c8f4ff', transparent:true, opacity:0.25}));
      glass.position.set(tx, 2.4, aqWZ(-35.25)); scene.add(glass); aqKeep(glass);
      for (let i = 0; i < 3; i++){
        const col = tx < 0 ? '#f4e27a' : '#ff8fb0';
        const m = new THREE.Mesh(new THREE.SphereGeometry(0.16, 7, 6), new THREE.MeshLambertMaterial({color: col}));
        m.position.set(tx, 2.1, aqWZ(-35.7)); scene.add(m); aqKeep(m);
        (aq.fish || (aq.fish=[])).push({m:m, ox:tx, oz:aqWZ(-35.7), a: i * 2.1, r: 0.9, spd: 0.8 + i * 0.1, y: 2.0 + i * 0.25});
      }
    }
    facadeTank(-5.0); facadeTank(5.0);
    // back-wall viewing window toward the lanternfish nook
    const backGlass = new THREE.Mesh(new THREE.BoxGeometry(6.5, 3.2, 0.08), new THREE.MeshLambertMaterial({color:'#9ad8e8', transparent:true, opacity:0.3}));
    backGlass.position.set(0, 2.4, aqWZ(-47.7)); scene.add(backGlass); aqKeep(backGlass);
    aqMesh(new THREE.BoxGeometry(6.8, 0.16, 0.16), '#1d4a66', 0, 4.05, -47.7);
    // inside: desk, benches, ceiling lights
    aqMesh(new THREE.BoxGeometry(2.6, 1.0, 1.1), '#2a6a88', 0, 0.75, -44.2);
    aqMesh(new THREE.BoxGeometry(1.8, 0.5, 0.6), '#8b6a3a', -4.4, 0.5, -41);
    aqMesh(new THREE.BoxGeometry(1.8, 0.5, 0.6), '#8b6a3a', 4.4, 0.5, -41);
    [[-4, 5.4, -42], [4, 5.4, -42], [0, 5.4, -39]].forEach(p => {
      const g = aqMesh(new THREE.SphereGeometry(0.16, 8, 8), '#e8f6ff', p[0], p[1], p[2]);
      try { g.material.emissive = new THREE.Color('#e8f6ff'); g.material.emissiveIntensity = 0.85; } catch(e){}
    });
    try {
      const lit = new THREE.PointLight('#c8eeff', 0.55, 16, 2);
      lit.position.set(0, 4.8, aqWZ(-42)); scene.add(lit); aqKeep(lit);
      const lit2 = new THREE.PointLight('#b8e0ff', 0.35, 12, 2);
      lit2.position.set(0, 3.2, aqWZ(-37)); scene.add(lit2); aqKeep(lit2);
    } catch(e){}
    // Cozier hall: rug, benches already there, plants, signs, a small exhibit case
    aqMesh(new THREE.BoxGeometry(6.0, 0.05, 4.2), '#1d5a78', 0, 0.3, -42);
    aqMesh(new THREE.BoxGeometry(2.6, 0.04, 1.6), '#c5e6ee', 0, 0.32, -42);
    [[-6.4, -38],[6.4, -38],[-6.4, -45],[6.4, -45]].forEach(p => {
      aqMesh(new THREE.CylinderGeometry(0.22, 0.18, 0.4, 8), '#1d5a78', p[0], 0.45, p[1]);
      aqMesh(new THREE.SphereGeometry(0.4, 7, 6), '#2f8a6a', p[0], 0.95, p[1]);
    });
    aqMesh(new THREE.BoxGeometry(2.2, 1.6, 0.5), '#2a6a88', -6.4, 1.4, -42);
    aqMesh(new THREE.BoxGeometry(1.8, 0.7, 0.2), '#9ad8e8', -6.4, 1.55, -41.85);
    aqMesh(new THREE.BoxGeometry(2.2, 1.6, 0.5), '#2a6a88', 6.4, 1.4, -42);
    aqMesh(new THREE.BoxGeometry(1.8, 1.1, 0.08), '#f4e27a', 6.4, 1.6, -41.8);
    aqLab('🐟 Hall exhibits', 0, 2.4, -44.0);
    [[-3.5, 4.6, -40],[3.5, 4.6, -40]].forEach(p => {
      const lamp = aqMesh(new THREE.SphereGeometry(0.16, 8, 8), '#e8f6ff', p[0], p[1], p[2]);
      try { lamp.material.emissive = new THREE.Color('#e8f6ff'); lamp.material.emissiveIntensity = 0.8; } catch(e){}
    });
    aqLab('🐠 Tideglass Aquarium', 0, 8.8, -35.4);
    aq.shiftZ = 0;
  }
  function aqGiftShop(){
    aq.curZone = 'dest'; aq.shiftZ = AquariumRules.AQ_DEST_DZ || 0;
    // Walk-in gift nook to the right of the arrival plaza
    const wall = '#f2e6d4', trim = '#1d5a78';
    aqPlat(14, 0.22, -11, 8.4, 8.4, '#e8d9c0', 0.16);
    aqMesh(new THREE.BoxGeometry(8.4, 3.6, 0.24), wall, 14, 2.0, -15.1);
    aqMesh(new THREE.BoxGeometry(0.24, 3.6, 8.4), wall, 9.9, 2.0, -11);
    aqMesh(new THREE.BoxGeometry(0.24, 3.6, 8.4), wall, 18.1, 2.0, -11);
    // front wall with a doorway
    aqMesh(new THREE.BoxGeometry(2.6, 3.6, 0.24), wall, 11.2, 2.0, -6.9);
    aqMesh(new THREE.BoxGeometry(2.6, 3.6, 0.24), wall, 16.8, 2.0, -6.9);
    aqMesh(new THREE.BoxGeometry(3.0, 1.0, 0.24), wall, 14, 3.3, -6.9);
    aqMesh(new THREE.BoxGeometry(8.8, 0.24, 8.8), trim, 14, 3.9, -11);
    aqMesh(new THREE.BoxGeometry(2.8, 0.12, 1.6), trim, 14, 2.85, -6.4);
    // counter and shelves
    aqMesh(new THREE.BoxGeometry(3.4, 1.0, 0.8), '#2a6a88', 14, 0.7, -13.4);
    [[12.4, -11.4],[15.6, -11.4],[12.4, -8.6],[15.6, -8.6],[12.4, -13.2],[15.6, -13.2]].forEach(p => {
      aqMesh(new THREE.BoxGeometry(1.1, 0.9, 1.1), '#c4a060', p[0], 0.65, p[1]);
    });
    (AquariumRules.AQ_GIFTS||[]).forEach(g => {
      const col = g.kind === 'hat' ? '#1d5a78' : (g.id.indexOf('jelly')>=0 ? '#d8b0ff' : g.id.indexOf('turtle')>=0 ? '#3a8f5a' : g.id.indexOf('crab')>=0 ? '#c45c3a' : '#f4e27a');
      const geo = g.kind === 'hat' ? new THREE.CylinderGeometry(0.28, 0.32, 0.28, 10) : new THREE.SphereGeometry(0.28, 8, 6);
      // gifts already have world z; place in local dest space
      const localZ = g.z - (AquariumRules.AQ_DEST_DZ || 0);
      aqMesh(geo, col, g.x, 1.25, localZ);
      aqLab((g.emoji||'🛍️') + ' ' + g.price, g.x, 1.8, localZ);
    });
    // shopkeep Pearl
    aqMesh(new THREE.BoxGeometry(0.7, 1.5, 0.5), '#2a8aaa', 14, 0.95, -13.8);
    aqLab('🛍️ Pearl', 14, 2.6, -13.8);
    aqLab('🛍️ Gift Nook', 14, 3.55, -6.5);
    try {
      const lit = new THREE.PointLight('#ffe8c8', 0.55, 10, 2);
      lit.position.set(14, 3.2, aqWZ(-11)); scene.add(lit); aqKeep(lit);
    } catch(e){}
    aq.shiftZ = 0;
  }

  function aqMakeBus(){ return (typeof ftMakeBus === 'function') ? ftMakeBus() : (function(){ const g=new THREE.Group(); const b=new THREE.Mesh(new THREE.BoxGeometry(3.6,2.2,7.2), new THREE.MeshLambertMaterial({color:'#f0c44a'})); b.position.y=1.3; g.add(b); return g; })(); }
  function buildAquarium(){
    const started = AquariumRules.aqNewVisit(aqState());
    aq = {trash:[], solids:[], zones:{}, sv: started.state, run: started.run, near:null, bus:null, homeBus:null, fish:[], curZone:null, shiftZ:0};
    aqSave(started.state);
    try { checkpoints[0] = {idx:0, spawn:{x:0,y:0.5,z:18}, flag:new THREE.Object3D()}; } catch(e){}
    aqSky();
    const hemi = new THREE.HemisphereLight(0xe8f4ff, 0x3a6a8a, 1.1); scene.add(hemi); aqKeep(hemi);
    const sun = new THREE.DirectionalLight('#fff8e0', 0.8); sun.position.set(-8, 18, 8); scene.add(sun); aqKeep(sun);
    aq.curZone = 'yard'; aq.shiftZ = 0;
    aqPlat(0, 0.14, 18, 52, 44, '#3f8f3a', 0.24);
    aqPlat(0, 0.16, 16, 36, 28, '#4ea247', 0.16);
    // school yard only — the aquarium is a long bus ride away
    aqMesh(new THREE.BoxGeometry(18, 8, 8), '#7a6aa0', 0, 4.1, 32);
    const roof = new THREE.Mesh(new THREE.ConeGeometry(13, 3.2, 4), new THREE.MeshLambertMaterial({color:'#4a3a68'}));
    roof.position.set(0, 10.1, 32); roof.rotation.y = Math.PI/4; scene.add(roof); aqKeep(roof);
    aqLab('🏫 Afterbell School', 0, 12.2, 26);
    try {
      if (typeof buildPlayer === 'function'){
        const m = buildPlayer(Object.assign({}, typeof DEF !== 'undefined' ? DEF : {}, {body:'girl', head:'#e0ac69', shirt:'#c45c8a', pants:'#3a3f6a', pantsPat:'skirt', hair:'bun', hairColor:'#6b4226', face:'smile', shirtPat:null, hat:null}));
        m.g.position.set(AquariumRules.AQ_TEACHER.x, 0.05, AquariumRules.AQ_TEACHER.z);
        m.g.rotation.y = Math.atan2(0 - AquariumRules.AQ_TEACHER.x, 18 - AquariumRules.AQ_TEACHER.z);
        scene.add(m.g); aqKeep(m.g);
      } else aqMesh(new THREE.BoxGeometry(0.7,1.6,0.5), '#c45c8a', AquariumRules.AQ_TEACHER.x, 0.9, AquariumRules.AQ_TEACHER.z);
    } catch(e){ aqMesh(new THREE.BoxGeometry(0.7,1.6,0.5), '#c45c8a', AquariumRules.AQ_TEACHER.x, 0.9, AquariumRules.AQ_TEACHER.z); }
    aqLab('👩‍🏫 Ms. Bramble', AquariumRules.AQ_TEACHER.x, 3.9, AquariumRules.AQ_TEACHER.z);
    // coastal road (west), long enough that the school is out of view from Tideglass
    aq.curZone = 'road'; aq.shiftZ = 0;
    const path = AquariumRules.AQ_RIDE_PATH || [];
    for (let i = 0; i < path.length - 1; i++){
      const a = path[i], b = path[i+1];
      const mx = (a.x+b.x)/2, mz=(a.z+b.z)/2;
      const len = Math.hypot(b.x-a.x, b.z-a.z)+1.6;
      const alongX = Math.abs(b.x-a.x) >= Math.abs(b.z-a.z);
      aqPlat(mx, 0.18, mz, alongX ? len : 3.4, alongX ? 3.4 : len, '#2a2e33', 0.1);
      if (i >= 2 && len > 20){
        const side = (i % 2 ? 1 : -1) * 8;
        for (let s = 1; s < Math.min(5, (len / 50) | 0) + 1; s++){
          const u = s / (Math.min(5, (len / 50) | 0) + 1);
          const tx = a.x + (b.x-a.x)*u + (alongX ? 0 : side);
          const tz = a.z + (b.z-a.z)*u + (alongX ? side : 0);
          aqMesh(new THREE.SphereGeometry(1.1, 7, 5), '#3d8a5a', tx, 2.2, tz);
          aqMesh(new THREE.CylinderGeometry(0.25, 0.32, 2.2, 7), '#6b3a1d', tx, 1.1, tz);
        }
      }
    }
    aqPlat(-28, 0.12, -80, 10, 40, '#3a8ab0', 0.1);
    aqLab('🌊 Glimmer coast', -28, 2.2, -80);
    aq.curZone = 'yard';
    const bus = aqMakeBus();
    bus.position.set(AquariumRules.AQ_BUS.x, 0, AquariumRules.AQ_BUS.z);
    scene.add(bus); aq.bus = bus; // traveling bus is never zone-hidden
    aqLab('🚌 Afterbell bus', AquariumRules.AQ_BUS.x, 3.6, AquariumRules.AQ_BUS.z);
    // aquarium hall (open shell, facade tanks, interior lights)
    aqHallBuilding();
    aq.curZone = 'dest'; aq.shiftZ = AquariumRules.AQ_DEST_DZ || 0;
    aqHorizonLand(0, AquariumRules.aqZ(-30), '#3d8a88');
    aqPlat(0, 0.16, -30, 180, 180, '#3d8a88', 0.16);
    aqTank(16, -20, '#9ad8e8', '🪼 Moonveil jellies', '#d8b0ff', 'jelly');
    aqTank(-16, -20, '#9ad8e8', '🐢 Sand-harbor turtles', '#3a8f5a', 'turtle');
    aqTank(0, -50, '#163050', '🐟 Lanternfish nook', '#ffe566', 'lantern');
    aqTank(18, -36, '#9ad8e8', '🪸 Bubble-plume coral', '#ff8fb0', 'fish');
    aqTank(-18, -36, '#9ad8e8', '⭐ Tideglass star', '#f4e27a', 'fish');
    // touch pool
    aqPlat(8, 0.28, -12, 5, 5, '#6aa0c8', 0.16);
    aqMesh(new THREE.CylinderGeometry(0.18, 0.22, 0.2, 8), '#c45c3a', 8, 0.45, -12);
    aqLab('🦀 Pebblecrab pool', 8, 1.8, -12);
    aq.shiftZ = 0;
    aqGiftShop();
    // Marin off to the side
    try {
      if (typeof buildPlayer === 'function'){
        const m = buildPlayer(Object.assign({}, typeof DEF !== 'undefined' ? DEF : {}, {shirt:'#2a8aaa', pants:'#1d3a55', hair:'short', hairColor:'#1a1a1a', face:'smile', hat:null}));
        m.g.position.set(AquariumRules.AQ_GUIDE.x, 0.05, AquariumRules.AQ_GUIDE.z);
        m.g.rotation.y = Math.atan2(AquariumRules.AQ_ARRIVE.x - AquariumRules.AQ_GUIDE.x, AquariumRules.AQ_ARRIVE.z - AquariumRules.AQ_GUIDE.z);
        scene.add(m.g); aqKeep(m.g);
      } else aqMesh(new THREE.BoxGeometry(0.7,1.6,0.5), '#2a8aaa', AquariumRules.AQ_GUIDE.x, 0.9, AquariumRules.AQ_GUIDE.z);
    } catch(e){ aqMesh(new THREE.BoxGeometry(0.7,1.6,0.5), '#2a8aaa', AquariumRules.AQ_GUIDE.x, 0.9, AquariumRules.AQ_GUIDE.z); }
    aqLab('🧭 Marin', AquariumRules.AQ_GUIDE.x, 3.9, AquariumRules.AQ_GUIDE.z);
    const home = aqMakeBus();
    home.position.set(AquariumRules.AQ_HOME_BUS.x, 0, AquariumRules.AQ_HOME_BUS.z);
    home.visible = false; scene.add(home); aqKeep(home); aq.homeBus = home;
    aqLab('🚌 Tide gate', AquariumRules.AQ_HOME_BUS.x, 3.4, AquariumRules.AQ_HOME_BUS.z);
    aq.findMeshes = {};
    (AquariumRules.AQ_FINDS||[]).forEach(f => { aq.findMeshes[f.id] = true; });
    if (P){ P.x=0; P.y=0.5; P.z=18; P.vx=0; P.vz=0; P.vy=0; }
    if (typeof cam !== 'undefined' && cam){ cam.yaw=0; cam.pitch=0.16; cam.dist=10; }
    const box=document.getElementById('aqBox'); if(box) box.style.display='block';
    banner('🐠 Tideglass Aquarium day! Board the Afterbell bus, sit tight for the coastal ride, then visit five exhibits. Be gentle at the Pebblecrab pool.');
    aq.curZone = null;
    aqApplyZones((aq.run && aq.run.phase) || 'yard');
    aqHud();
  }
  function aqEnter(){
    if (P){ P.x=0; P.y=0.5; P.z=18; P.vx=0; P.vz=0; P.vy=0; }
    if (typeof cam !== 'undefined' && cam){ cam.yaw=0; cam.pitch=0.16; cam.dist=10; }
    aqSky();
  }
  function aqPaint(){
    if (!aq) return;
    const destOn = !!(aq.run && (aq.run.phase === 'hall' || aq.run.phase === 'ride'));
    if (aq.homeBus) aq.homeBus.visible = destOn && AquariumRules.aqAll(aq.sv) && aq.run && aq.run.phase === 'hall';
  }
  function aqRideVis(hide){
    try {
      if (typeof model !== 'undefined' && model){
        if (model.g) model.g.visible = !hide;
        else if (model.visible != null) model.visible = !hide;
      }
    } catch(e){}
  }
  function aqSeat(pose){
    if (!P || !pose) return;
    const side = 0.0, along = -2.15;
    const cy = Math.cos(pose.yaw || 0), sy = Math.sin(pose.yaw || 0);
    P.x = pose.x + side * cy + along * sy;
    P.z = pose.z + -side * sy + along * cy;
    P.y = 1.42; P.vx = P.vz = P.vy = 0;
    aqRideVis(true);
    if (typeof cam !== 'undefined' && cam){ cam.yaw = Math.atan2(-sy, -cy); cam.pitch = 0.08; cam.dist = 0.22; }
    if (aq.bus){ aq.bus.position.set(pose.x, 0, pose.z); aq.bus.rotation.y = pose.yaw || 0; }
  }

  function aqRideCam(){
    if (!aq || !aq.run || aq.run.phase !== 'ride' || typeof camera === 'undefined' || !camera) return false;
    const pose = AquariumRules.aqRidePose(aq.run);
    if (!pose) return false;
    const cy = Math.cos(pose.yaw || 0), sy = Math.sin(pose.yaw || 0);
    const along = -1.5, ey = 1.55;
    const x = pose.x + along * sy, z = pose.z + along * cy;
    camera.position.set(x, ey, z);
    camera.lookAt(x + sy * 10, ey - 0.35, z + cy * 10);
    (aq.trash||[]).forEach(m => { if (m && m.userData && m.userData.aqLab) m.visible = false; });
    return true;
  }
  function aqAct(){
    if (!aq) return;
    const hit = AquariumRules.aqNear(P.x, P.z, aq.sv, aq.run);
    if (!hit) return;
    if (hit.kind === 'talk'){ banner(hit.text); return; }
    if (hit.kind === 'bus'){
      const r = AquariumRules.aqBoardBus(aq.run);
      if (r.ok){ banner('🚌 All aboard! Sit tight — the coast road leads to Tideglass Aquarium.'); aqSeat(AquariumRules.aqRidePose(aq.run)); }
      return;
    }
    if (hit.kind === 'find'){
      const r = AquariumRules.aqPick(aq.sv, hit.id);
      if (!r.ok) return;
      aq.sv = r.state; aqSave(aq.sv); aqPaint();
      banner((hit.emoji||'🐠') + ' ' + (r.item && r.item.blurb ? r.item.blurb : hit.name) + (r.left ? ('  (' + (AquariumRules.AQ_FINDS.length - r.left) + '/' + AquariumRules.AQ_FINDS.length + ')') : '  All five! Meet the bus at the tide gate.'));
      return;
    }
    if (hit.kind === 'pool'){
      const r = AquariumRules.aqTouch(aq.sv);
      aq.sv = r.state; aqSave(aq.sv);
      if (r.coins && typeof coins !== 'undefined'){ try { coins += r.coins; if (typeof saveCoins === 'function') saveCoins(); } catch(e){} }
      banner('🦀 ' + (r.message || 'A gentle touch!') + (r.coins ? ('  +' + r.coins + ' 🪙') : (r.already ? ' The Pebblecrab already said hello.' : '')));
      return;
    }
    if (hit.kind === 'gift'){
      const have = (typeof coins !== 'undefined') ? coins : 0;
      const r = AquariumRules.aqBuyGift(aq.sv, hit.id, have);
      if (!r.ok){
        if (r.already) banner('🛍️ You already have the ' + (r.item && r.item.name || hit.name) + '.');
        else if (r.why === 'coins') banner('🪙 Need ' + r.need + ' more coins for the ' + (r.item && r.item.name || hit.name) + '.');
        else banner('🛍️ That souvenir is not for sale right now.');
        return;
      }
      aq.sv = r.state; aqSave(aq.sv);
      if (typeof coins !== 'undefined'){ try { coins = r.coins; if (typeof saveCoins === 'function') saveCoins(); } catch(e){} }
      try {
        if (r.item && r.item.kind === 'hat' && r.item.id && typeof owned !== 'undefined' && owned){
          if (owned.add) owned.add(r.item.id); else if (Array.isArray(owned) && owned.indexOf(r.item.id) < 0) owned.push(r.item.id);
          if (typeof save === 'function') save('rubloxOwned', (owned instanceof Set) ? [...owned] : owned);
          if (typeof wear === 'function') wear({id:r.item.id, cat:'looks', emoji:r.item.emoji, name:r.item.name, price:r.item.price, slot:r.item.slot, val:r.item.val}, true);
        }
      } catch(e){}
      banner((r.item.emoji||'🛍️') + ' You got the ' + r.item.name + '!  🪙 −' + r.spent);
      return;
    }
    if (hit.kind === 'home'){
      const r = AquariumRules.aqBoardHome(aq.run, aq.sv);
      if (!r.ok){ banner('Marin is still waiting on a few exhibits.'); return; }
      aq.sv = r.state; aqSave(aq.sv);
      if (r.coins && typeof coins !== 'undefined'){ try { coins += r.coins; if (typeof saveCoins === 'function') saveCoins(); } catch(e){} }
      banner((r.message || 'Bus ride home!') + (r.coins ? ('  +' + r.coins + ' 🪙') : ''));
      if (P){ P.x=0; P.z=18; P.y=0.5; }
      if (aq.bus){ aq.bus.position.set(AquariumRules.AQ_BUS.x, 0, AquariumRules.AQ_BUS.z); aq.bus.rotation.y = 0; }
      aqApplyZones('done');
      if (typeof cam !== 'undefined' && cam){ cam.yaw=0; cam.pitch=0.16; cam.dist=10; }
    }
  }
  function aqUpdate(dt){
    if (!aq) return;
    aqSky();
    (aq.fish||[]).forEach(f => {
      f.a = (f.a || 0) + (f.spd || 1) * dt;
      if (f.m) f.m.position.set(f.ox + Math.cos(f.a) * (f.r||0.8), f.y, f.oz + Math.sin(f.a * 0.9) * (f.r||0.8) * 0.6);
    });
    if (aq.run.phase === 'ride'){
      AquariumRules.aqTickRide(aq.run, dt);
      aqSeat(AquariumRules.aqRidePose(aq.run));
      if (aq.run.phase === 'hall'){
        const a = AquariumRules.AQ_ARRIVE || {x:3.4, z:-8};
        if (P){ P.x=a.x; P.y=0.5; P.z=a.z; P.vx=0; P.vz=0; }
        if (typeof cam!=='undefined' && cam){ cam.yaw=0.15; cam.pitch=0.16; cam.dist=9; }
        aqRideVis(false);
        if (aq.bus){ aq.bus.position.set(AquariumRules.AQ_HOME_BUS.x, 0, AquariumRules.AQ_HOME_BUS.z); aq.bus.rotation.y = Math.PI; }
        banner('🐠 Welcome to Tideglass Aquarium! Marin is by the hall, not under the bus. Visit five exhibits, and say hello at the Pebblecrab pool.');
        aqApplyZones('hall');
      }
    }
    if (P && P.y < -8){ P.x=0; P.y=0.5; P.z = (aq.run && aq.run.phase === 'hall') ? (AquariumRules.AQ_ARRIVE||{}).z || -8 : 18; P.vx=P.vz=P.vy=0; }
    aqApplyZones(aq.run && aq.run.phase);
    aq.near = AquariumRules.aqNear(P ? P.x : 0, P ? P.z : 0, aq.sv, aq.run);
    aqHud(AquariumRules.aqGoal(aq.sv, aq.run));
  }
  function aqKey(e){
    if (!aq || e.repeat) return false;
    if (e.code === 'KeyE' || e.code === 'KeyF' || e.key === 'e' || e.key === 'f'){ aqAct(); return true; }
    return false;
  }
  function aqPad(jp){
    if (!aq || !jp) return false;
    if (!aq._x && (jp[2] || jp[3])){ aq._x = true; aqAct(); return true; }
    if (!jp[2] && !jp[3]) aq._x = false;
    return false;
  }
  function aquariumStop(){
    aqRideVis(false);
    if (!aq) return;
    (aq.solids||[]).forEach(b => { try{ b.active=false; if (typeof solids!=='undefined'){ const i=solids.indexOf(b); if(i>=0) solids.splice(i,1);} }catch(e){} });
    (aq.trash||[]).forEach(m => { try{ scene.remove(m);}catch(e){} });
    aq=null;
    const box=document.getElementById('aqBox'); if(box) box.style.display='none';
    const act=document.getElementById('aqAct'); if(act) act.classList.remove('show');
  }
  if (typeof window !== 'undefined') window.aqDebug = {
    probe(){ if (!aq) return null; return {phase: aq.run && aq.run.phase, found: ((aq.sv && aq.sv.found)||[]).slice(), touched: !!(aq.sv && aq.sv.touched), won: !!(aq.sv && aq.sv.won), P: P ? {x:P.x,y:P.y,z:P.z} : null, marin: AquariumRules.AQ_GUIDE, arrive: AquariumRules.AQ_ARRIVE}; },
    hall(){ if (!aq) return; aq.run.phase='hall'; aq.run.rideT=AquariumRules.AQ_RIDE_T; const a=AquariumRules.AQ_ARRIVE||{x:3.4,z:-8}; if(P){P.x=a.x;P.y=0.5;P.z=a.z;} if (typeof cam!=='undefined' && cam){ cam.yaw=0.15; cam.pitch=0.16; cam.dist=9; } aqApplyZones('hall'); },
    inside(){ if (!aq) return; aq.run.phase='hall'; const z = AquariumRules.aqZ ? AquariumRules.aqZ(-41) : -41; if(P){P.x=0;P.y=0.5;P.z=z;P.vx=0;P.vz=0;} if (typeof cam!=='undefined' && cam){ cam.yaw=0; cam.pitch=0.14; cam.dist=5.2; } aqApplyZones('hall'); },
    lookBack(){ if (!aq) return; this.look(Math.PI); },
    look(yaw){ if (!aq) return; aq.run.phase='hall'; const a=AquariumRules.AQ_ARRIVE||{x:3.4,z:-8}; if(P){P.x=a.x;P.y=0.5;P.z=a.z;P.vx=0;P.vz=0;} if (typeof cam!=='undefined' && cam){ cam.yaw=(yaw==null?Math.PI:yaw); cam.pitch=0.12; cam.dist=12; } aqApplyZones('hall'); },
    ride(t){ if (!aq) return; aq.run.phase='ride'; aq.run.rideT= (t==null? 3.2 : t); const pose=AquariumRules.aqRidePose(aq.run); aqSeat(pose); aqRideVis(true); aqApplyZones('ride'); },
    shop(){ if (!aq) return; aq.run.phase='hall'; const s=AquariumRules.AQ_SHOP||{x:14,z:-10}; if(P){P.x=s.x;P.y=0.5;P.z=s.z;P.vx=0;P.vz=0;} if (typeof cam!=='undefined' && cam){ cam.yaw=0; cam.pitch=0.16; cam.dist=8; } aqApplyZones('hall'); },
    tankFront(){ if (!aq || !P) return; aq.run.phase='hall'; const z = AquariumRules.aqZ ? AquariumRules.aqZ(-14.2) : -14.2; P.x=13.4; P.y=0.5; P.z=z; P.vx=0; P.vz=0; if (typeof cam!=='undefined' && cam){ cam.yaw=0; cam.pitch=0.14; cam.dist=6.2; } aqApplyZones('hall'); },
    go(id){
      if (!aq || !P) return;
      const A = AquariumRules;
      const map = {bus:A.AQ_BUS, home:A.AQ_HOME_BUS, teacher:A.AQ_TEACHER, marin:A.AQ_GUIDE, hall:A.AQ_HALL, arrive:A.AQ_ARRIVE, pool:A.AQ_POOL};
      const t = A.aqFind(id) || map[id];
      if (!t) return;
      P.x=t.x; P.y=0.5; P.z=t.z; P.vx=0; P.vz=0; P.vy=0;
    }
  };
  try {
    const act=document.getElementById('aqAct'); if(act && !act.__aq){ act.__aq=true; act.onclick=ev=>{ev.preventDefault();ev.stopPropagation();aqAct();}; }
  } catch(e){}
