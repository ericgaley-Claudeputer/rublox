  /* ---------- Pawsley Vet Clinic ---------- */
  let vt = null;
  function vtKeep(m){ if (m && vt && vt.trash) vt.trash.push(m); return m; }
  function vtMat(c, o){ return new THREE.MeshLambertMaterial(Object.assign({color:c, side:THREE.DoubleSide}, o||{})); }
  function vtMesh(geo, c, x, y, z, o){
    const m = new THREE.Mesh(geo, vtMat(c, o)); m.position.set(x,y,z); scene.add(m); return vtKeep(m);
  }
  function vtWall(x, y, z, w, h, d, c){
    const b = plat(x, y + h, z, w, d, c, h);
    if (b && b.mesh){ b.mesh.material = vtMat(c); vtKeep(b.mesh); }
    if (b && vt) vt.solids.push(b);
    return b;
  }
  function vtSplitWall(along, a0, a1, fixed, gaps, color){
    const h = (typeof VetRules !== 'undefined' && VetRules.VT_WALL_H) || 6.0;
    const doorH = (typeof VetRules !== 'undefined' && VetRules.VT_DOOR_H) || 4.2;
    const th = 0.42;
    const opens = (gaps || []).map(g => ({a:g.c - g.w/2, b:g.c + g.w/2})).sort((p,q) => p.a - q.a);
    let cursor = a0;
    function seg(lo, hi, y, hh){
      if (hi - lo < 0.15) return;
      const mid = (lo + hi) / 2, len = hi - lo;
      if (along === 'x') vtWall(mid, y, fixed, len, hh, th, color);
      else vtWall(fixed, y, mid, th, hh, len, color);
    }
    opens.forEach(op => {
      seg(cursor, op.a, 0, h);
      seg(op.a, op.b, doorH, h - doorH);
      cursor = op.b;
    });
    seg(cursor, a1, 0, h);
  }
  function vtState(){ return VetRules.vtLoad(typeof load === 'function' ? load(VetRules.VT_KEY, null) : null); }
  function vtSave(s){ if (typeof save === 'function') save(VetRules.VT_KEY, s); if (vt) vt.sv = s; }
  function vtHideFpToggle(){
    const b = document.getElementById('oFP');
    const driving = !!(vt && vt.run && vt.run.drive && vt.run.drive.on);
    if (b) b.style.display = (mode === 'vet' && !driving) ? 'none' : '';
  }
  function drawVet(ctx){
    if (typeof sky === 'function') sky(ctx, '#b8e4f2', '#f7f1de');
    else { ctx.fillStyle = '#b8e4f2'; ctx.fillRect(0,0,320,200); }
    ctx.fillStyle = '#f3e6c8'; ctx.fillRect(40, 70, 240, 110);
    ctx.fillStyle = '#d9eef6'; ctx.fillRect(70, 90, 70, 70);
    ctx.fillStyle = '#e4f3df'; ctx.fillRect(160, 90, 50, 70);
    ctx.fillStyle = '#8b5a2b'; ctx.fillRect(148, 130, 36, 30);
    ctx.fillStyle = '#6aa84f'; ctx.fillRect(30, 180, 260, 20);
    ctx.font = '26px sans-serif'; ctx.fillText('🩺', 84, 86); ctx.fillText('🐾', 200, 86); ctx.fillText('📋', 155, 120);
    if (typeof guy === 'function') guy(ctx, 160, 176, 12, '#6ec6ff');
  }
  function vtLab(text, x, y, z){
    try {
      // QA t330u: indoors and in first person, labels drew through every wall and piled up. Let walls hide them and make them smaller.
      if (typeof t297Lab === 'function'){ const m = t297Lab(text, x, y, z); if (m){ if (m.material) m.material.depthTest = true; m.scale.multiplyScalar(0.62); return vtKeep(m); } }
    } catch (e){}
    return vtMesh(new THREE.BoxGeometry(0.2,0.2,0.2), '#fff', x, y, z);
  }
  function vtPetMesh(species, x, y, z){
    const cols = {cat:'#f0c27a', dog:'#c9965a', bunny:'#f4efe8', hamster:'#e0a060', bird:'#7ec8f0', fox:'#e07a3a', otter:'#8b6a4a', star:'#f6d45a'};
    const c = cols[species] || '#f0c27a';
    const g = new THREE.Group();
    const body = new THREE.Mesh(new THREE.SphereGeometry(0.38, 12, 10), vtMat(c));
    body.position.y = 0.38; g.add(body);
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.26, 12, 10), vtMat(c));
    head.position.set(0, 0.78, 0.12); g.add(head);
    const earL = new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 6), vtMat(c));
    earL.position.set(-0.14, 0.98, 0.04); g.add(earL);
    const earR = earL.clone(); earR.position.x = 0.14; g.add(earR);
    const nose = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 6), vtMat('#f7c6c6'));
    nose.position.set(0, 0.76, 0.36); g.add(nose);
    g.position.set(x, y, z); scene.add(g); vtKeep(g);
    return g;
  }
  function vtPersonMesh(x, y, z, color){
    const g = new THREE.Group();
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.24, 0.9, 10), vtMat(color || '#7eb6ff'));
    body.position.y = 0.7; g.add(body);
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.2, 10, 8), vtMat('#f2d2b0'));
    head.position.y = 1.45; g.add(head);
    g.position.set(x, y, z); scene.add(g); vtKeep(g);
    return g;
  }
  function vtProp(id, kind, x, z, label, color, h){
    const hh = h || 0.7;
    plat(x, hh, z, 0.7, 0.7, color || '#8ec6ff', hh);
    const lab = vtLab(label, x, hh + 0.55, z);
    const p = {id, kind, x, z, label: lab};
    if (vt) vt.props.push(p);
    return p;
  }
  function vtSky(){
    const bg = '#bfe8f2';
    scene.background = new THREE.Color(bg);
    if (scene.fog){ scene.fog.color.set(bg); scene.fog.near = 22; scene.fog.far = 70; }
    const hemi = new THREE.HemisphereLight(0xfff4dc, 0x7a9a88, 0.7);
    scene.add(hemi); vtKeep(hemi);
    const sun = new THREE.DirectionalLight(0xfff2cc, 0.75);
    sun.position.set(8, 18, 6); scene.add(sun); vtKeep(sun);
  }

  function vtBuildTown(){
    if (!vt || typeof VetRules === 'undefined') return;
    const T = VetRules.VT_TOWN;
    const midZ = (T.minZ + T.maxZ) / 2, midX = (T.minX + T.maxX) / 2;
    const fl = plat(midX, 0, midZ, T.maxX - T.minX, T.maxZ - T.minZ, '#8fbc6a', 0.3);
    if (fl && fl.mesh) vtKeep(fl.mesh);
    // roads
    const road = plat(0, 0.02, midZ, 6, T.maxZ - T.minZ, '#c9c2b0', 0.08);
    if (road && road.mesh) vtKeep(road.mesh);
    const cross = plat(0, 0.03, 44, T.maxX - T.minX - 4, 5, '#c9c2b0', 0.08);
    if (cross && cross.mesh) vtKeep(cross.mesh);
    // park
    const park = plat(14, 0.04, 58, 16, 14, '#7cb342', 0.06);
    if (park && park.mesh) vtKeep(park.mesh);
    vtLab('Puddle Park', 14, 2.2, 52);
    // cute trees (non-blocking trunks kept short)
    function tree(x,z,h){
      const trunk = vtMesh(new THREE.CylinderGeometry(0.28, 0.36, h*0.45, 8), '#8b5a2b', x, h*0.22, z);
      const leaf = vtMesh(new THREE.ConeGeometry(1.4, h*0.7, 8), '#2e7d32', x, h*0.55, z);
      return {x,z};
    }
    tree(-18, 48, 5.5); tree(-22, 52, 4.8); tree(-14, 52, 5.2);
    tree(10, 70, 5); tree(-8, 74, 4.6); tree(22, 40, 5.4); tree(-28, 60, 5);
    // houses (solid but no tight doors — porches only)
    function house(x,z,c,w,d){
      vtWall(x, 0, z, w||6, 4.6, d||5, c || '#f6e1c3');
      const roof = vtMesh(new THREE.ConeGeometry(Math.max(w||6, d||5) * 0.72, 2.2, 4), '#c44536', x, 5.6, z);
      if (roof) roof.rotation.y = Math.PI/4;
    }
    (VetRules.VT_TOWN_HOUSES || [{x:-22,z:38,color:'#fde2c8',w:6,d:5},{x:24,z:38,color:'#f8d4e0',w:6,d:5}]).forEach(h => {
      house(h.x, h.z, h.color, h.w, h.d);
    });
    vtLab('Maple Court', -18, 2.4, 44);
    vtLab('Picnic Green', 22, 1.8, 48);
    // parked ambulance + rescue pals
    vt.ambulance = vtAmbulanceMesh(VetRules.VT_AMBULANCE_PARK.x, 0, VetRules.VT_AMBULANCE_PARK.z);
    vt.props.push({id:'ambulance', kind:'ambulance', x:VetRules.VT_AMBULANCE_PARK.x, z:VetRules.VT_AMBULANCE_PARK.z, label: vtLab('🚑 Pet ambulance', 0, 2.6, 22.5)});
    vt.townPets = [];
    (VetRules.VT_RESCUES || []).forEach(r => {
      const m = vtPetMesh(r.species, r.x, 0, r.z);
      const lab = vtLab(r.emoji + ' ' + r.title, r.x, 2.1, r.z);
      vt.townPets.push({id:r.id, mesh:m, label:lab, x:r.x, z:r.z});
    });
  }
  function vtAmbulanceMesh(x,y,z){
    const g = new THREE.Group();
    const body = new THREE.Mesh(new THREE.BoxGeometry(2.2, 1.2, 3.6), vtMat('#f7f7f7'));
    body.position.y = 0.9; g.add(body);
    const cab = new THREE.Mesh(new THREE.BoxGeometry(2.2, 1.0, 1.2), vtMat('#e8f6ff'));
    cab.position.set(0, 1.4, -1.4); g.add(cab);
    const stripe = new THREE.Mesh(new THREE.BoxGeometry(2.24, 0.28, 3.62), vtMat('#e53935'));
    stripe.position.y = 1.05; g.add(stripe);
    const light = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.2, 0.7), vtMat('#5b8def'));
    light.position.set(0, 1.95, 0.2); g.add(light);
    const paw = new THREE.Mesh(new THREE.SphereGeometry(0.22, 10, 8), vtMat('#ffd54a'));
    paw.position.set(0, 1.15, -2.0); g.add(paw);
    [[-0.8,0.28,-1.2],[0.8,0.28,-1.2],[-0.8,0.28,1.2],[0.8,0.28,1.2]].forEach(p => {
      const w = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.28, 10), vtMat('#333'));
      w.rotation.z = Math.PI/2; w.position.set(p[0], p[1], p[2]); g.add(w);
    });
    g.position.set(x,y,z); scene.add(g); vtKeep(g);
    return g;
  }
  function vtDriving(){ return !!(vt && vt.run && vt.run.drive && vt.run.drive.on); }
  function vtDriveInput(){
    if (!vtDriving()) return;
    let thr = 0, turn = 0;
    try {
      if (typeof keys !== 'undefined'){
        if (keys.KeyW || keys.ArrowUp) thr += 1;
        if (keys.KeyS || keys.ArrowDown) thr -= 1;
        if (keys.KeyA || keys.ArrowLeft) turn -= 1;
        if (keys.KeyD || keys.ArrowRight) turn += 1;
      }
      if (typeof joy !== 'undefined' && joy){ if (Math.abs(joy.y) > 0.12) thr -= joy.y; if (Math.abs(joy.x) > 0.12) turn += joy.x; }
      if (typeof pad !== 'undefined' && pad){ if (Math.abs(pad.y) > 0.12) thr -= pad.y; if (Math.abs(pad.x) > 0.12) turn += pad.x; }
    } catch (e){}
    VetRules.vtDriveSteer(vt.run, turn, thr);
  }
  function vtPlaceAmbulance(){
    if (!vt || !vt.ambulance || !vt.run) return;
    const d = vt.run.drive || VetRules.vtEmptyDrive();
    vt.ambulance.position.set(d.x, 0, d.z);
    vt.ambulance.rotation.y = d.yaw || 0;
    (vt.townPets || []).forEach(p => {
      const taken = d.cargo && d.cargo.id === p.id;
      const done = vt.run.rescuedIds && vt.run.rescuedIds.indexOf(p.id) >= 0;
      if (p.mesh) p.mesh.visible = !taken && !done;
      if (p.label) p.label.visible = !taken && !done;
    });
  }
  function vtDriveCam(){
    if (!vtDriving() || typeof cam === 'undefined' || typeof camera === 'undefined') return;
    const d = vt.run.drive;
    // QA t330u: the chase camera went inside houses and walls when you drove next to them. Pull it in until the view is clear.
    const sin = Math.sin(d.yaw), cos = Math.cos(d.yaw);
    const blocked = (px, py, pz) => (typeof solids !== 'undefined' ? solids : []).some(s => s && s.mesh && s.active !== false && s.hh > 0.6
      && Math.abs(px - s.mesh.position.x) < s.hw + 0.35 && Math.abs(pz - s.mesh.position.z) < s.hd + 0.35 && Math.abs(py - s.mesh.position.y) < s.hh + 0.35);
    let back = 8;
    for (; back > 2.5; back -= 0.5){
      const h = 1.6 + 2.6 * (back / 8);
      let obstructed = false;
      for (let dist = 0.25; dist <= back; dist += 0.25){
        const t = dist / back;
        if (blocked(d.x - sin * dist, 1.2 + (h - 1.2) * t, d.z + cos * dist)){ obstructed = true; break; }
      }
      if (!obstructed) break;
    }
    const height = 1.6 + 2.6 * (back / 8);
    const x = d.x - sin * back;
    const z = d.z + cos * back;
    camera.position.set(x, height, z);
    camera.lookAt(d.x, 1.2, d.z);
    cam.yaw = d.yaw;
    cam.pitch = 0.22;
    cam.dist = back;
  }

  function buildVet(){
    const started = VetRules.vtNewShift(vtState(), Date.now());
    vt = {trash:[], solids:[], props:[], targets:[], sv: started.state, run: started.run, pet:null, owner:null, prompt:null, netT:0, pitchSet:false, ambulance:null, townPets:[], driveCam:false};
    try { checkpoints[0] = {idx:0, spawn:{x:0,y:0.5,z:11.2}, flag:new THREE.Object3D()}; } catch (e){}
    vtSky();
    const wall = '#e8d5b5';
    const trim = '#c9b089';
    VetRules.VT_ROOMS.forEach(r => {
      const fl = plat(r.x, 0, r.z, r.w, r.d, r.color, 0.3);
      if (fl && fl.mesh) vtKeep(fl.mesh);
      const ceilY = (typeof VetRules !== 'undefined' && VetRules.VT_CEILING_Y) || 6.2;
      const ceil = vtMesh(new THREE.BoxGeometry(r.w + 0.2, 0.22, r.d + 0.2), '#fff6e8', r.x, ceilY, r.z);
      if (ceil) ceil.material = vtMat('#fff1dc');
      const lamp = new THREE.PointLight(0xfff3d0, 0.55, 18);
      lamp.position.set(r.x, 5.2, r.z); scene.add(lamp); vtKeep(lamp);
    });
    // outer walls
    vtSplitWall('x', -24, 24, 16, [{c:0, w:(VetRules.VT_DOOR_W||3.6)}], wall);
    vtSplitWall('x', -8, 8, -40, [], wall);
    vtSplitWall('x', -24, -8, -20, [], wall);
    vtSplitWall('x', 8, 24, -20, [], wall);
    vtSplitWall('z', -20, 16, -24, [], wall);
    vtSplitWall('z', -20, 16, 24, [], wall);
    vtSplitWall('z', -40, -20, -8, [], wall);
    vtSplitWall('z', -40, -20, 8, [], wall);
    // ambulance bay walls + wide town opening
    vtSplitWall('z', 16, 28, -8, [], wall);
    vtSplitWall('z', 16, 28, 8, [], wall);
    vtSplitWall('x', -8, 8, 28, [{c:0, w:((VetRules.VT_TOWN_DOOR && VetRules.VT_TOWN_DOOR.w) || 5.2)}], wall);
    vtBuildTown();
    // interior walls with doorways
    vtSplitWall('x', -8, 8, 0, [{c:0, w:(VetRules.VT_DOOR_W||3.6)}], trim);
    vtSplitWall('x', -8, 8, -20, [{c:0, w:(VetRules.VT_DOOR_W||3.6)}], trim);
    vtSplitWall('z', -20, 0, 8, [{c:-10, w:(VetRules.VT_DOOR_W||3.6)}], trim);
    vtSplitWall('z', -20, 0, -8, [{c:-10, w:(VetRules.VT_DOOR_W||3.6)}], trim);
    vtSplitWall('z', 0, 16, 8, [{c:8, w:(VetRules.VT_DOOR_W||3.6)}], trim);
    vtSplitWall('z', 0, 16, -8, [{c:8, w:(VetRules.VT_DOOR_W||3.6)}], trim);
    // room name plaques on the far (-Z) wall, kept small
    const plaques = {reception:[0,3.2,0.6], exam:[0,3.2,-19.4], xray:[16,3.2,-19.4], treatment:[-16,3.2,-19.4], surgery:[0,3.2,-39.4], recovery:[16,3.2,0.6], bath:[-16,3.2,0.6]};
    VetRules.VT_ROOMS.forEach(r => {
      const pos = plaques[r.id];
      if (!pos) return;
      plat(pos[0], 3.15, pos[2], 2.4, 0.12, '#5c4a32', 0.35);
      vtLab(r.name, pos[0], pos[1], pos[2]);
    });
    // reception desk + waiting
    plat(0, 0.85, 4.2, 3.2, 1.2, '#8b5a2b', 0.85);
    vt.props.push({id:'chart', kind:'chart', x:0, z:4.2, label: vtLab('📋 Take chart', 0, 1.9, 4.2)});
    vt.props.push({id:'pickup', kind:'pickup', x:2.2, z:5.2, label: vtLab('💛 Happy pickup', 2.2, 1.8, 5.2)});
    plat(-4.5, 0.45, 11, 1.4, 1.1, '#d9b48a', 0.45);
    plat(4.5, 0.45, 11, 1.4, 1.1, '#d9b48a', 0.45);
    // exam tools
    plat(0, 0.8, -9.5, 2.4, 1.2, '#f7fbff', 0.8);
    vtProp('stethoscope', 'tool', -3.2, -8.2, '🩺 Stethoscope', '#3aa0c8', 0.55);
    vtProp('ears', 'tool', 3.2, -8.2, '👂 Ear check', '#f0c27a', 0.55);
    vtProp('eyes', 'tool', -3.2, -12.4, '👀 Eye check', '#9ad0ff', 0.55);
    vtProp('temp', 'tool', 3.2, -12.4, '🌡️ Temperature', '#ffb3c6', 0.55);
    // x-ray scanner
    plat(16, 1.0, -10, 2.6, 2.6, '#5a6490', 1.0);
    vt.props.push({id:'xray', kind:'xray', x:16, z:-10, label: vtLab('📸 Cute scanner', 16, 2.3, -10)});
    // pharmacy shelf
    plat(-16, 1.2, -8, 3.4, 0.6, '#c9a36b', 1.2);
    [['syrup','🧴 Syrup', -18.2, -8],['ear-drops','💧 Ear drops', -16.6, -8],['eye-drops','👁️ Eye drops', -15, -8],['sip','🍵 Tummy sip', -13.6, -8]].forEach(([id, lab, x, z]) => {
      vtProp(id, 'treat', x, z, lab, '#8fd19e', 0.45);
    });
    vtLab('Pharmacy shelf', -16, 3.15, -7.2);
    // gentle care
    plat(0, 0.8, -30, 2.2, 1.2, '#fff', 0.8);
    vtProp('bandage', 'treat', -3, -29, '🩹 Bandage', '#ffd1dc', 0.5);
    vtProp('cast', 'treat', 3, -29, '🦴 Soft cast', '#e8f0ff', 0.5);
    vtProp('splinter', 'treat', -3, -32, '✨ Splinter lift', '#ffe9a8', 0.5);
    vtProp('bubbles', 'treat', 3, -32, '🫧 Bubble clean', '#c8f4ff', 0.5);
    // recovery
    plat(14, 0.4, 6, 2.2, 1.6, '#f7c6d8', 0.4);
    plat(18.5, 0.4, 6, 2.2, 1.6, '#f7c6d8', 0.4);
    vt.props.push({id:'cuddle', kind:'cuddle', x:14, z:6, label: vtLab('🤗 Cuddle', 14, 1.6, 6)});
    vt.props.push({id:'feed', kind:'feed', x:18.5, z:6, label: vtLab('🍪 Snack', 18.5, 1.6, 6)});
    // bath
    plat(-16, 0.45, 8, 2.6, 1.8, '#8fd4e8', 0.45);
    vtProp('bath', 'treat', -16, 8, '🛁 Warm bath', '#8fd4e8', 0.35);
    vt.owner = vtPersonMesh(3.4, 0, 6.2, '#7eb6ff');
    vt.pet = vtPetMesh((vt.run.patient && vt.run.patient.species) || 'cat', 0, 0, 6.4);
    if (typeof P !== 'undefined'){ P.x = 0; P.y = 0; P.z = 11; P.vy = 0; }
    if (typeof cam !== 'undefined'){ cam.yaw = Math.PI; cam.pitch = 0.08; }
    vtPlaceActors();
    vtPaintHud();
    vtHideFpToggle();
    const act = document.getElementById('vtAct');
    if (act && !act._vtBound){
      act._vtBound = true;
      act.addEventListener('pointerdown', function (e){ e.preventDefault(); vtAct(); });
    }
    const grid = document.getElementById('vtXrayGrid');
    if (grid && !grid._vtBound){
      grid._vtBound = true;
      grid.addEventListener('pointerdown', function (e){
        const b = e.target && e.target.closest ? e.target.closest('button[data-cell]') : null;
        if (!b || !vt) return;
        vtDoXray(+b.getAttribute('data-cell'));
      });
    }
  }
  function vtPlaceActors(){
    if (!vt || !vt.run) return;
    const p = vt.run.patient;
    const phase = vt.run.phase;
    let room = 'reception';
    if (phase === 'exam') room = 'exam';
    else if (phase === 'scan') room = 'xray';
    else if (phase === 'treat' && p) room = p.treatRoom;
    else if (phase === 'recover') room = 'recovery';
    const r = VetRules.vtRoom(room);
    if (vt.pet && r){
      const species = (p && p.species) || 'cat';
      if (vt.pet._species !== species){
        try { scene.remove(vt.pet); } catch (e){}
        vt.pet = vtPetMesh(species, r.x, 0, r.z);
        vt.pet._species = species;
      }
      vt.pet.position.set(r.x, 0, r.z + (room === 'reception' ? -2 : 1.6));
      vt.pet.visible = phase !== 'done';
    }
    if (vt.owner){
      vt.owner.visible = phase === 'wait' || phase === 'pickup' || phase === 'done';
      vt.owner.position.set(3.4, 0, 6.2);
    }
  }
  function vtPaintHud(){
    if (!vt || !vt.run) return;
    const hint = document.getElementById('vtHint');
    const body = document.getElementById('vtChartBody');
    const box = document.getElementById('vtBox');
    const xray = document.getElementById('vtXray');
    const act = document.getElementById('vtAct');
    if (box) box.style.display = '';
    const chart = VetRules.vtChart(vt.run);
    if (hint) hint.textContent = (vt.prompt && vt.prompt.label) ? vt.prompt.label : (vt.run.lastMessage || 'Pawsley Vet Clinic');
    if (body){
      const lines = (chart.lines || []).slice();
      (chart.checks || []).forEach(c => {
        lines.push((c.done ? '☑ ' : '☐ ') + c.tool);
      });
      if (chart.phase === 'recover' || chart.phase === 'pickup' || chart.phase === 'done'){
        lines.push((chart.cuddle ? '☑ ' : '☐ ') + 'cuddle');
        lines.push((chart.feed ? '☑ ' : '☐ ') + 'feed');
      }
      if (vt.sv) lines.push('Cases ' + (vt.sv.cases|0) + ' · Stars ' + (vt.sv.stars|0));
      body.textContent = '';
      lines.forEach(t => {
        const d = document.createElement('div');
        d.className = 'vt-check';
        d.textContent = t;
        body.appendChild(d);
      });
    }
    if (xray){
      const show = vt.run.phase === 'scan' && vt.run.patient && vt.run.patient.xray && !vt.run.xrayFound;
      xray.hidden = !show;
      if (show){
        const grid = document.getElementById('vtXrayGrid');
        if (grid && !grid.childElementCount){
          for (let i = 0; i < 16; i++){
            const b = document.createElement('button');
            b.type = 'button';
            b.setAttribute('data-cell', String(i));
            b.textContent = '·';
            grid.appendChild(b);
          }
        }
        if (grid){
          [...grid.querySelectorAll('button')].forEach((b, i) => {
            const guesses = vt.run.xrayGuesses || [];
            b.className = '';
            if (guesses.indexOf(i) >= 0) b.className = (vt.run.xrayFound && i === (vt.run.patient.xrayTarget|0)) ? 'hit' : 'miss';
          });
        }
      }
    }
    if (act){
      if (vt.prompt){ act.classList.add('show'); act.textContent = vt.prompt.btn || '🩺 Do it'; }
      else act.classList.remove('show');
    }
  }
  function vtNear(prop, dist){
    if (!prop || typeof P === 'undefined') return false;
    const dx = P.x - prop.x, dz = P.z - prop.z;
    return (dx*dx + dz*dz) <= (dist || 2.3) * (dist || 2.3);
  }
  function vtCurrentRoom(){
    if (typeof P === 'undefined') return 'reception';
    return VetRules.vtRoomAt(P.x, P.z) || (vt && vt.run && vt.run.room) || 'reception';
  }
  function vtFindPrompt(){
    if (!vt || !vt.run) return null;
    const room = vtCurrentRoom();
    vt.run.room = room;
    const phase = vt.run.phase;
    const props = vt.props || [];
    const find = (id) => props.find(p => p.id === id);
    if (phase === 'wait' && room === 'reception' && vtNear(find('chart'), 2.6)) return {id:'chart', label:'E / tap / Ⓐ  Take the chart', btn:'📋 Take chart', go:() => vtDoCheckIn()};
    if ((phase === 'exam' || phase === 'scan') && room === 'exam'){
      const tools = ['stethoscope','ears','eyes','temp'];
      for (let i = 0; i < tools.length; i++){
        const p = find(tools[i]);
        if (p && vtNear(p, 2.2)) return {id:p.id, label:'E / tap / Ⓐ  Use ' + p.id, btn:'🩺 Use', go:() => vtDoTool(p.id)};
      }
    }
    if ((phase === 'exam' || phase === 'scan') && room === 'xray' && vtNear(find('xray'), 2.6)){
      return {id:'xray', label:'E / tap / Ⓐ  Start the cute scan', btn:'📸 Scan', go:() => vtDoTool('xray')};
    }
    if (phase === 'treat'){
      const need = vt.run.patient && vt.run.patient.treat;
      const p = find(need) || props.find(q => q.kind === 'treat' && vtNear(q, 2.2));
      if (p && vtNear(p, 2.4) && room === (vt.run.patient && vt.run.patient.treatRoom)){
        return {id:p.id, label:'E / tap / Ⓐ  Give ' + p.id, btn:'💊 Treat', go:() => vtDoTreat(p.id)};
      }
    }
    if (phase === 'recover' && room === 'recovery'){
      if (!vt.run.cuddle && vtNear(find('cuddle'), 2.4)) return {id:'cuddle', label:'E / tap / Ⓐ  Cuddle', btn:'🤗 Cuddle', go:() => vtDoCuddle()};
      if (!vt.run.feed && vtNear(find('feed'), 2.4)) return {id:'feed', label:'E / tap / Ⓐ  Give a snack', btn:'🍪 Snack', go:() => vtDoFeed()};
    }
    if (phase === 'pickup' && room === 'reception' && vtNear(find('pickup'), 2.8)){
      return {id:'pickup', label:'E / tap / Ⓐ  Happy pickup', btn:'💛 Pickup', go:() => vtDoPickup()};
    }
    if (phase === 'done' && room === 'reception' && vtNear(find('chart'), 2.6)){
      return {id:'next', label:'E / tap / Ⓐ  Next pal', btn:'🐾 Next pal', go:() => vtDoNext()};
    }
    const driving = vtDriving();
    if (!driving && vtNear(find('ambulance'), 3.2)){
      if (vt.run.drive && vt.run.drive.cargo && !vt.run.drive.on){
        return {id:'admit', label:'E / tap / Ⓐ  Bring this pal inside', btn:'🐾 Check in rescue', go:() => vtDoAdmit()};
      }
      return {id:'mount', label:'E / tap / Ⓐ  Drive the pet ambulance', btn:'🚑 Hop in', go:() => vtDoMount()};
    }
    if (driving){
      const cargo = vt.run.drive && vt.run.drive.cargo;
      const near = VetRules.vtRescueAt(vt.run.drive.x, vt.run.drive.z, 3.6);
      if (!cargo && near && !(vt.run.rescuedIds || []).includes(near.id)){
        return {id:'rescue', label:'E / tap / Ⓐ  Rescue ' + near.title, btn:'🐾 Rescue', go:() => vtDoRescue()};
      }
      if (VetRules.vtInBay(vt.run.drive.x, vt.run.drive.z)){
        return {id:'park', label:'E / Ⓑ  Park and hop out', btn:'🅿️ Park', go:() => vtDoDismount()};
      }
      return {id:'drive', label: cargo ? ('Drive ' + cargo.name + ' back to the bay') : 'Steer with WASD or the stick · look for pals! Drive back to the 🅿️ bay to hop out.', btn:'🚑 Driving'};
    }
    return null;
  }
  function vtToast(msg){
    if (vt && vt.run && msg) vt.run.lastMessage = msg;
    if (typeof banner === 'function' && msg) banner(msg);
    vtPaintHud();
  }
  function vtAfter(res){
    if (!res) return;
    if (res.state) vtSave(res.state);
    if (res.coins && typeof coins !== 'undefined'){
      try { coins += res.coins; if (typeof save === 'function') save('rubloxCoins', coins); if (typeof paintCoins === 'function') paintCoins(); } catch (e){}
    }
    vtPlaceActors();
    vtToast(res.message);
    vtNet();
  }
  function vtDoCheckIn(){ if (!vt) return; vtAfter(VetRules.vtCheckIn(vt.run)); }
  function vtDoTool(tool){ if (!vt) return; vtAfter(VetRules.vtUseTool(vt.run, tool, vtCurrentRoom())); }
  function vtDoXray(cell){
    if (!vt) return;
    const res = VetRules.vtXrayScan(vt.run, cell);
    const grid = document.getElementById('vtXrayGrid');
    if (grid){
      const b = grid.querySelector('button[data-cell="'+cell+'"]');
      if (b) b.className = res && res.found ? 'hit' : 'miss';
    }
    vtAfter(res);
  }
  function vtDoTreat(item){ if (!vt) return; vtAfter(VetRules.vtTreat(vt.run, item, vtCurrentRoom())); }
  function vtDoCuddle(){ if (!vt) return; vtAfter(VetRules.vtCuddle(vt.run, vtCurrentRoom())); }
  function vtDoFeed(){ if (!vt) return; vtAfter(VetRules.vtFeed(vt.run, vtCurrentRoom())); }
  function vtDoPickup(){ if (!vt) return; vtAfter(VetRules.vtPickup(vt.run, vt.sv, vtCurrentRoom())); }
  function vtDoNext(){
    if (!vt) return;
    const res = VetRules.vtNextPatient(vt.run, vt.sv, Date.now());
    vtPlaceActors();
    vtToast(res.message);
    vtNet();
  }
  // QA t332u: hopping in or out ignores a second toggle for a moment, so one press (key, tap or Ⓐ) can't undo itself.
  const VT_TOGGLE_MS = 500;
  function vtToggleReady(){ return !(vt.toggleAt && Date.now() - vt.toggleAt < VT_TOGGLE_MS); }
  function vtDoMount(){
    if (!vt || !vtToggleReady()) return;
    const res = VetRules.vtMountAmbulance(vt.run, typeof P !== 'undefined' ? P.x : 0, typeof P !== 'undefined' ? P.z : 0);
    if (!res.ok){ vtToast(res.message); return; }
    vt.toggleAt = Date.now();
    if (typeof P !== 'undefined'){ P.x = vt.run.drive.x; P.z = vt.run.drive.z; P.vx = P.vz = 0; }
    vtHideFpToggle();
    vtPlaceAmbulance();
    vtToast(res.message);
  }
  function vtDoDismount(){
    if (!vt || !vtToggleReady()) return;
    const res = VetRules.vtDismountAmbulance(vt.run);
    if (!res.ok){ vtToast(res.message); return; }
    vt.toggleAt = Date.now();
    if (typeof P !== 'undefined'){ P.x = 0; P.y = 0; P.z = 22; P.vx = P.vz = 0; }
    vtHideFpToggle();
    vtPlaceAmbulance();
    vtToast(res.message);
  }
  function vtDoRescue(){
    if (!vt) return;
    const res = VetRules.vtRescuePet(vt.run);
    vtPlaceAmbulance();
    vtToast(res.message);
  }
  function vtDoAdmit(){
    if (!vt) return;
    const res = VetRules.vtAdmitRescue(vt.run, vt.sv);
    if (res.state) vt.sv = res.state;
    vtPlaceActors();
    vtPlaceAmbulance();
    vtAfter(res);
  }
  function vtAct(){
    if (!vt || !vt.run) return false;
    if (typeof paused !== 'undefined' && paused) return false;
    const p = vt.prompt || vtFindPrompt();
    if (!p || !p.go) return false;
    p.go();
    return true;
  }
  function vtUpdate(dt){
    if (!vt || !vt.run || typeof mode === 'undefined' || mode !== 'vet') return;
    if (!vt.pitchSet && typeof cam !== 'undefined' && !vtDriving()){ cam.pitch = 0.08; cam.yaw = 0; vt.pitchSet = true; }
    vt.run.t = (vt.run.t || 0) + (dt || 0);
    // QA t330u: in first person a prop label filled the whole screen when you walked up to it; the action button already says it.
    (vt.props || []).forEach(pr => { if (pr && pr.label && pr.x != null) pr.label.visible = Math.hypot(P.x - pr.x, P.z - pr.z) > 1.9; });
    if (vt.pet) vt.pet.rotation.y += (dt || 0) * 0.4;
    if (vtDriving()){
      vtDriveInput();
      VetRules.vtDriveTick(vt.run, dt);
      if (typeof P !== 'undefined'){ P.x = vt.run.drive.x; P.y = 0.45; P.z = vt.run.drive.z; P.vx = P.vz = 0; P.vy = 0; }
      vtPlaceAmbulance();
    } else {
      vtPlaceAmbulance();
    }
    if (typeof P !== 'undefined'){
      const room = VetRules.vtAreaAt ? VetRules.vtAreaAt(P.x, P.z) : VetRules.vtRoomAt(P.x, P.z);
      if (room) vt.run.room = room;
    }
    const next = vtFindPrompt();
    const same = next && vt.prompt && next.id === vt.prompt.id;
    vt.prompt = next;
    if (!same) vtPaintHud();
    else {
      const hint = document.getElementById('vtHint');
      if (hint && vt.run.lastMessage && !next) hint.textContent = vt.run.lastMessage;
    }
    if (mp && mp.on && mp.host){
      vt.netT = (vt.netT || 0) + (dt || 0);
      if (vt.netT > 0.4){ vt.netT = 0; vtNet(); }
    }
  }
  function vtKey(e){
    if (!vt || !e) return false;
    // QA t332u: the global keyup handler also routes here. One E press used to hop in on keydown and straight
    // back out on keyup (and a held key auto-repeated the toggle). Only a fresh keydown acts.
    if (e.type === 'keyup' || e.repeat) return e.type !== 'keyup' && e.code === 'KeyE';
    if (e.code === 'KeyE' || e.code === 'Space'){ vtAct(); return e.code === 'KeyE'; }
    if (e.code === 'KeyV'){ return true; }
    return false;
  }
  function vtPad(jp, s){
    if (!vt || !jp) return false;
    if (jp[1] && vtDriving()){ vtDoDismount(); return true; }
    if (jp[0] && vt.prompt && vt.prompt.go){
      vtAct();
      if (typeof pad !== 'undefined') pad.jump = false;
      return true;
    }
    if (jp[2]){ vtAct(); return true; }
    return false;
  }
  function vtNet(){
    if (!vt || !mp || !mp.on || !mp.host || typeof sendAll !== 'function') return;
    try { sendAll({t:'vt', w: VetRules.vtWire(vt.sv, vt.run)}); } catch (e){}
  }
  function vtFromNet(g, d){
    if (!d || !d.w || !vt) return;
    VetRules.vtApply(vt.run, d.w);
    if (d.w.cases != null){ vt.sv = VetRules.vtLoad(Object.assign({}, vt.sv, d.w)); }
    vtPlaceActors();
    vtPaintHud();
  }
  function vtFromHost(d){ vtFromNet(null, d); }
  function vetStop(){
    if (!vt) return;
    (vt.trash || []).forEach(m => { try { scene.remove(m); } catch (e){} });
    const act = document.getElementById('vtAct'); if (act) act.classList.remove('show');
    const box = document.getElementById('vtBox'); if (box) box.style.display = 'none';
    const xray = document.getElementById('vtXray'); if (xray) xray.hidden = true;
    vtHideFpToggle();
    vt = null;
  }
  window.vtDebug = {
    to(x,y,z){ if (typeof P === "undefined") return null; P.x=+x; P.y=+y||0; P.z=+z; P.vx=0; P.vy=0; P.vz=0; return this.probe(); },
    room(id){
      const r = VetRules.vtRoom(id);
      if (!r || typeof P === 'undefined') return null;
      const spots = {
        reception:{x:0, z:11.2, yaw:0, pitch:0.08},
        exam:{x:0, z:-6.0, yaw:0, pitch:0.16},
        xray:{x:16, z:-6.0, yaw:0, pitch:0.18},
        treatment:{x:-16, z:-3.2, yaw:0, pitch:0.12},
        surgery:{x:0, z:-25.2, yaw:0, pitch:0.08},
        recovery:{x:16, z:12.0, yaw:0, pitch:0.08},
        bath:{x:-16, z:12.0, yaw:0, pitch:0.08}
      };
      const s = spots[id] || {x:r.x, z:r.z + 3.2, yaw:0, pitch:0.08};
      P.x = s.x; P.y = 0; P.z = s.z; P.vy = 0; P.vx = 0; P.vz = 0;
      if (typeof cam !== 'undefined'){ cam.yaw = s.yaw; cam.pitch = s.pitch; }
      if (vt && vt.run) vt.run.room = id;
      return {x:P.x, z:P.z, room:id, yaw:s.yaw};
    },
    stage(id){
      if (!vt || !vt.run) return null;
      const run = vt.run;
      if (id === 'reception'){
        if (run.phase === 'done' || !run.patient){
          VetRules.vtNextPatient(run, vt.sv, Date.now());
        }
        run.phase = 'wait';
      } else if (id === 'exam'){
        if (run.phase === 'wait') VetRules.vtCheckIn(run);
        run.phase = 'exam';
      } else if (id === 'xray'){
        if (run.phase === 'wait') VetRules.vtCheckIn(run);
        run.patient.xray = 'toy';
        run.patient.xrayTarget = 6;
        run.patient.tools = run.patient.tools && run.patient.tools.indexOf('xray') >= 0 ? run.patient.tools : (run.patient.tools || []).concat(['xray']);
        run.phase = 'scan';
        run.xrayFound = false;
        run.lastMessage = 'Sweep the cute scanner to find the swallowed toy.';
      } else if (id === 'treatment'){
        if (run.phase === 'wait') VetRules.vtCheckIn(run);
        run.patient.treat = 'syrup';
        run.patient.treatRoom = 'treatment';
        run.phase = 'treat';
        run.lastMessage = 'Pick the matching labeled bottle from the pharmacy shelf.';
      }
      vtPlaceActors();
      vtPaintHud();
      return this.pose(id);
    },
    look(yaw, pitch){
      if (typeof cam !== 'undefined'){ if (yaw != null) cam.yaw = yaw; if (pitch != null) cam.pitch = pitch; }
    },
    start(){ if (typeof start === 'function') start('vet'); },
    pose(id){
      this.room(id);
      this.look(0, 0.08);
      return this.probe();
    },
    solve(){
      if (!vt) return null;
      VetRules.vtCheckIn(vt.run);
      (vt.run.patient.tools || []).forEach(t => { if (t !== 'xray') VetRules.vtUseTool(vt.run, t, 'exam'); });
      if (vt.run.patient.xray){ VetRules.vtUseTool(vt.run, 'xray', 'xray'); VetRules.vtXrayScan(vt.run, vt.run.patient.xrayTarget); }
      VetRules.vtTreat(vt.run, vt.run.patient.treat, vt.run.patient.treatRoom);
      VetRules.vtCuddle(vt.run, 'recovery');
      VetRules.vtFeed(vt.run, 'recovery');
      vtPlaceActors(); vtPaintHud();
      return vt.run.phase;
    },
    probe(){
      return {
        mode: typeof mode === 'undefined' ? null : mode,
        fpOn: typeof fpOn === 'function' ? fpOn() : null,
        fp: typeof fp !== 'undefined' ? !!fp.on : null,
        room: vt && vt.run ? vt.run.room : null,
        phase: vt && vt.run ? vt.run.phase : null,
        p: typeof P === 'undefined' ? null : {x:P.x,y:P.y,z:P.z},
        cam: typeof cam === 'undefined' ? null : {yaw:cam.yaw, pitch:cam.pitch},
        drive: vt && vt.run && vt.run.drive ? {on:!!vt.run.drive.on, x:vt.run.drive.x, z:vt.run.drive.z, cargo:!!vt.run.drive.cargo} : null
      };
    },
    town(){
      if (typeof P !== 'undefined'){ P.x = 0; P.y = 0.5; P.z = 50; }
      if (typeof cam !== 'undefined'){ cam.yaw = 0; cam.pitch = 0.35; cam.dist = 16; }
      if (vt && vt.run && vt.run.drive){ vt.run.drive.on = false; }
      vtHideFpToggle();
      return typeof P === 'undefined' ? null : {x:P.x,z:P.z};
    },
    driveTo(id){
      const r = VetRules.vtRescue(id) || VetRules.VT_RESCUES[0];
      if (!vt || !r) return null;
      if (!vt.run.drive) vt.run.drive = VetRules.vtEmptyDrive();
      vt.run.drive.on = true; vt.run.drive.x = r.x - 2; vt.run.drive.z = r.z + 4; vt.run.drive.yaw = 0.4;
      if (typeof P !== 'undefined'){ P.x = vt.run.drive.x; P.y = 0.45; P.z = vt.run.drive.z; }
      vtHideFpToggle(); vtPlaceAmbulance();
      return {id:r.id, x:r.x, z:r.z};
    }
  };
