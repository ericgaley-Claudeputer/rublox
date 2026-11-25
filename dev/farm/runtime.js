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
    const adopted = st.adopted || [];
    let nearBaby = null, nearD = 99;
    Object.keys(fm.babies || {}).forEach(id => {
      const slot = fm.babies[id]; const on = destOn && adopted.indexOf(id) < 0;
      if (slot.mesh) slot.mesh.visible = on;
      if (on && P && FarmRules.FM_BABIES){
        const b = FarmRules.FM_BABIES.find(x => x.id === id);
        if (b){ const d = Math.hypot(P.x - b.x, P.z - b.z); if (d < nearD){ nearD = d; nearBaby = id; } }
      }
    });
    Object.keys(fm.babies || {}).forEach(id => {
      const slot = fm.babies[id];
      if (!slot.lab) return;
      const on = destOn && adopted.indexOf(id) < 0;
      // When you walk into the paddock, only the closest baby keeps a name tag so they do not stack.
      slot.lab.visible = on && (nearD > 5 || id === nearBaby);
    });
    if (fm.custLab && destOn && typeof FarmRules.fmCustomer === 'function'){
      const cust = FarmRules.fmCustomer(fm.run, st);
      fm.custLab.element && (fm.custLab.element.textContent = (cust.emoji||'🧒') + ' ' + cust.name);
    }
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
    if (fm.hideLabs){ (fm.trash||[]).forEach(m => { if (m && m.userData && m.userData.fmLab) m.visible = false; }); }
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

  function fmMat(c){ return new THREE.MeshLambertMaterial({color:c}); }
  function fmSph(par, r, c, x, y, z, sx, sy, sz, seg){
    const m = new THREE.Mesh(new THREE.SphereGeometry(r, seg||8, Math.max(5,(seg||8)-2)), fmMat(c));
    m.position.set(x, y, z); if (sx) m.scale.set(sx, sy==null?sx:sy, sz==null?sx:sz); par.add(m); return m;
  }
  function fmBox(par, w, h, d, c, x, y, z){
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), fmMat(c)); m.position.set(x,y,z); par.add(m); return m;
  }
  function fmCyl(par, r1, r2, h, c, x, y, z){
    const m = new THREE.Mesh(new THREE.CylinderGeometry(r1, r2, h, 7), fmMat(c)); m.position.set(x,y,z); par.add(m); return m;
  }
  function fmEye(par, x, y, z, r){
    fmSph(par, r, '#1d2340', x, y, z, 1, 1, 0.7, 6);
    fmSph(par, r*0.35, '#ffffff', x + r*0.25, y + r*0.3, z + r*0.35, 1, 1, 1, 4);
  }
  function fmMakeHen(){
    const g = new THREE.Group(), bodyC = '#f4d15a', wingC = '#e8b84a';
    fmSph(g, 0.28, bodyC, 0, 0.42, 0, 1, 0.9, 1.15, 8);
    const head = new THREE.Group(); head.position.set(0, 0.68, 0.22); g.add(head); g.userData.head = head;
    fmSph(head, 0.18, bodyC, 0, 0, 0, 1, 1, 1, 8);
    fmEye(head, 0.07, 0.04, 0.14, 0.045); fmEye(head, -0.07, 0.04, 0.14, 0.045);
    const beak = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.12, 6), fmMat('#f4a04a')); beak.rotation.x = Math.PI/2; beak.position.set(0, -0.02, 0.2); head.add(beak);
    fmCyl(head, 0.03, 0.05, 0.1, '#e05050', 0, 0.16, 0);
    fmSph(head, 0.04, '#e05050', 0.05, 0.12, 0, 1, 0.7, 0.7, 5);
    fmSph(head, 0.04, '#e05050', -0.05, 0.12, 0, 1, 0.7, 0.7, 5);
    fmSph(g, 0.16, wingC, 0.22, 0.42, -0.02, 0.45, 0.7, 1.0, 6);
    fmSph(g, 0.16, wingC, -0.22, 0.42, -0.02, 0.45, 0.7, 1.0, 6);
    const tail = new THREE.Group(); tail.position.set(0, 0.5, -0.28); g.add(tail); g.userData.tail = tail;
    [0, 0.1, -0.1].forEach((x,i) => { const f = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.22, 5), fmMat(i? '#e07a20':'#f4a04a')); f.rotation.x = -1.1; f.position.set(x, 0.08, -0.04); tail.add(f); });
    fmCyl(g, 0.03, 0.03, 0.2, '#f4a04a', 0.08, 0.16, 0.04);
    fmCyl(g, 0.03, 0.03, 0.2, '#f4a04a', -0.08, 0.16, 0.04);
    fmBox(g, 0.1, 0.03, 0.12, '#f4a04a', 0.08, 0.05, 0.08);
    fmBox(g, 0.1, 0.03, 0.12, '#f4a04a', -0.08, 0.05, 0.08);
    g.userData.kind = 'hen'; g.scale.setScalar(1.45); return g;
  }
  function fmMakeSheep(){
    const g = new THREE.Group(), wool = '#f4f1ea', skin = '#e8d0b0';
    fmSph(g, 0.42, wool, 0, 0.58, 0, 1.05, 0.9, 1.25, 8);
    fmSph(g, 0.18, wool, 0.28, 0.72, 0.1, 1, 1, 1, 6);
    fmSph(g, 0.16, wool, -0.26, 0.7, -0.16, 1, 1, 1, 6);
    fmSph(g, 0.17, wool, 0.1, 0.78, -0.22, 1, 1, 1, 6);
    const head = new THREE.Group(); head.position.set(0, 0.7, 0.42); g.add(head); g.userData.head = head;
    fmSph(head, 0.2, skin, 0, 0, 0, 0.95, 0.9, 1.1, 8);
    fmEye(head, 0.08, 0.05, 0.16, 0.04); fmEye(head, -0.08, 0.05, 0.16, 0.04);
    fmSph(head, 0.04, '#f4a0b4', 0, -0.04, 0.18, 1.1, 0.7, 0.8, 5);
    const earL = new THREE.Group(); earL.position.set(0.14, 0.12, -0.02); head.add(earL);
    const earR = new THREE.Group(); earR.position.set(-0.14, 0.12, -0.02); head.add(earR);
    fmSph(earL, 0.07, skin, 0, 0.04, 0, 0.7, 1.2, 0.45, 5);
    fmSph(earR, 0.07, skin, 0, 0.04, 0, 0.7, 1.2, 0.45, 5);
    g.userData.ears = [earL, earR];
    fmCyl(g, 0.07, 0.06, 0.32, '#f2e0c8', 0.16, 0.22, 0.16);
    fmCyl(g, 0.07, 0.06, 0.32, '#f2e0c8', -0.16, 0.22, 0.16);
    fmCyl(g, 0.07, 0.06, 0.32, '#f2e0c8', 0.16, 0.22, -0.18);
    fmCyl(g, 0.07, 0.06, 0.32, '#f2e0c8', -0.16, 0.22, -0.18);
    const tail = new THREE.Group(); tail.position.set(0, 0.62, -0.48); g.add(tail); g.userData.tail = tail;
    fmSph(tail, 0.09, wool, 0, 0, 0, 1, 1, 1, 6);
    g.userData.kind = 'sheep'; g.scale.setScalar(1.28); return g;
  }
  function fmMakeCow(){
    const g = new THREE.Group(), hide = '#f4e8d0', spot = '#6b4a2a';
    fmSph(g, 0.48, hide, 0, 0.78, 0, 0.95, 0.8, 1.45, 8);
    fmSph(g, 0.14, spot, 0.28, 0.9, 0.1, 1, 0.6, 1, 6);
    fmSph(g, 0.12, spot, -0.22, 0.72, -0.2, 1, 0.55, 1, 6);
    fmSph(g, 0.1, spot, 0.08, 0.95, -0.35, 1, 0.5, 1, 6);
    const head = new THREE.Group(); head.position.set(0, 1.05, 0.58); g.add(head); g.userData.head = head;
    fmSph(head, 0.26, hide, 0, 0, 0, 0.95, 0.85, 1.1, 8);
    fmSph(head, 0.14, '#ffe8d6', 0, -0.08, 0.18, 1, 0.75, 0.9, 6);
    fmEye(head, 0.1, 0.08, 0.18, 0.05); fmEye(head, -0.1, 0.08, 0.18, 0.05);
    fmSph(head, 0.04, '#3a2a1a', 0.04, -0.04, 0.3, 1, 1, 1, 4);
    fmSph(head, 0.04, '#3a2a1a', -0.04, -0.04, 0.3, 1, 1, 1, 4);
    const hornL = new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.16, 5), fmMat('#f2e0c8')); hornL.position.set(0.14, 0.22, -0.02); hornL.rotation.z = -0.4; head.add(hornL);
    const hornR = new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.16, 5), fmMat('#f2e0c8')); hornR.position.set(-0.14, 0.22, -0.02); hornR.rotation.z = 0.4; head.add(hornR);
    const earL = new THREE.Group(); earL.position.set(0.2, 0.1, -0.02); head.add(earL);
    const earR = new THREE.Group(); earR.position.set(-0.2, 0.1, -0.02); head.add(earR);
    fmSph(earL, 0.08, hide, 0, 0, 0, 0.6, 1, 0.4, 5);
    fmSph(earR, 0.08, hide, 0, 0, 0, 0.6, 1, 0.4, 5);
    g.userData.ears = [earL, earR];
    fmCyl(g, 0.08, 0.07, 0.55, hide, 0.2, 0.35, 0.32);
    fmCyl(g, 0.08, 0.07, 0.55, hide, -0.2, 0.35, 0.32);
    fmCyl(g, 0.08, 0.07, 0.55, hide, 0.2, 0.35, -0.32);
    fmCyl(g, 0.08, 0.07, 0.55, hide, -0.2, 0.35, -0.32);
    const tail = new THREE.Group(); tail.position.set(0, 0.9, -0.68); g.add(tail); g.userData.tail = tail;
    fmCyl(tail, 0.03, 0.03, 0.45, hide, 0, -0.16, 0); tail.children[0].rotation.x = 0.3;
    fmSph(tail, 0.07, spot, 0, -0.4, 0.02, 1, 1, 1, 5);
    g.userData.kind = 'cow'; g.scale.setScalar(1.32); return g;
  }
  function fmMakeGoat(){
    const g = new THREE.Group(), coat = '#f5efe4', patch = '#c89b6e';
    fmSph(g, 0.36, coat, 0, 0.62, 0, 0.88, 0.86, 1.32, 8);
    fmSph(g, 0.14, patch, 0.2, 0.68, 0.08, 1, 0.7, 1.1, 6);
    fmSph(g, 0.12, patch, -0.18, 0.6, -0.18, 1, 0.65, 1, 6);
    const head = new THREE.Group(); head.position.set(0, 0.88, 0.44); g.add(head); g.userData.head = head;
    fmSph(head, 0.2, coat, 0, 0, 0, 0.88, 0.88, 1.15, 8);
    fmSph(head, 0.11, '#ffe8d6', 0, -0.06, 0.17, 0.9, 0.72, 1.0, 6);
    fmEye(head, 0.08, 0.06, 0.15, 0.042); fmEye(head, -0.08, 0.06, 0.15, 0.042);
    fmSph(head, 0.035, '#f4a0b4', 0, -0.04, 0.27, 1.1, 0.7, 0.8, 5);
    const beard = new THREE.Mesh(new THREE.ConeGeometry(0.045, 0.14, 5), fmMat(patch)); beard.rotation.x = Math.PI; beard.position.set(0, -0.17, 0.14); head.add(beard);
    [-1, 1].forEach(k => {
      const horn = new THREE.Mesh(new THREE.ConeGeometry(0.036, 0.19, 5), fmMat('#e6d2b5'));
      horn.position.set(k * 0.09, 0.2, -0.04); horn.rotation.z = -k * 0.25; horn.rotation.x = -0.35; head.add(horn);
      const ear = new THREE.Group(); ear.position.set(k * 0.16, 0.06, -0.02); head.add(ear);
      fmSph(ear, 0.065, patch, k * 0.05, -0.04, 0, 1.25, 0.65, 0.45, 5);
      (g.userData.ears || (g.userData.ears = [])).push(ear);
    });
    [[-0.14,0.22],[0.14,0.22],[-0.14,-0.24],[0.14,-0.24]].forEach(([x,z]) => {
      fmCyl(g, 0.055, 0.05, 0.36, coat, x, 0.22, z);
      fmCyl(g, 0.058, 0.058, 0.08, '#5a4232', x, 0.05, z);
    });
    const tail = new THREE.Group(); tail.position.set(0, 0.74, -0.44); g.add(tail); g.userData.tail = tail;
    fmSph(tail, 0.065, patch, 0, 0.05, -0.04, 0.8, 1.3, 0.8, 5);
    g.userData.kind = 'goat'; g.scale.setScalar(1.26); return g;
  }
  function fmMakeBunny(){
    const g = new THREE.Group(), fur = '#f2e9e4', spot = '#d8b8a4';
    fmSph(g, 0.3, fur, 0, 0.38, -0.02, 1.0, 0.92, 1.22, 8);
    fmSph(g, 0.13, spot, 0.16, 0.44, -0.06, 1, 0.75, 1, 6);
    const head = new THREE.Group(); head.position.set(0, 0.64, 0.24); g.add(head); g.userData.head = head;
    fmSph(head, 0.21, fur, 0, 0, 0, 1.05, 0.95, 1.0, 8);
    fmSph(head, 0.08, '#ffdce5', 0.13, -0.05, 0.13, 0.8, 0.65, 0.6, 5);
    fmSph(head, 0.08, '#ffdce5', -0.13, -0.05, 0.13, 0.8, 0.65, 0.6, 5);
    fmEye(head, 0.085, 0.04, 0.16, 0.045); fmEye(head, -0.085, 0.04, 0.16, 0.045);
    fmSph(head, 0.036, '#ff8fa3', 0, -0.02, 0.2, 1.2, 0.85, 0.8, 5);
    [-1, 1].forEach(k => {
      const ear = new THREE.Group(); ear.position.set(k * 0.09, 0.16, -0.02); head.add(ear);
      fmSph(ear, 0.065, k > 0 ? spot : fur, 0, 0.18, 0, 0.75, 2.5, 0.45, 6);
      fmSph(ear, 0.04, '#ffb3c7', 0, 0.17, 0.02, 0.65, 2.0, 0.35, 5);
      (g.userData.ears || (g.userData.ears = [])).push(ear);
    });
    fmSph(g, 0.075, fur, 0.12, 0.16, 0.18, 0.9, 0.9, 1.1, 6);
    fmSph(g, 0.075, fur, -0.12, 0.16, 0.18, 0.9, 0.9, 1.1, 6);
    fmSph(g, 0.1, fur, 0.16, 0.12, -0.14, 0.95, 0.55, 1.65, 6);
    fmSph(g, 0.1, fur, -0.16, 0.12, -0.14, 0.95, 0.55, 1.65, 6);
    const tail = new THREE.Group(); tail.position.set(0, 0.34, -0.36); g.add(tail); g.userData.tail = tail;
    fmSph(tail, 0.11, '#ffffff', 0, 0, 0, 1, 1, 1, 6);
    g.userData.kind = 'bunny'; g.scale.setScalar(1.32); return g;
  }
  function fmMakeChick(){
    const g = new THREE.Group();
    fmSph(g, 0.16, '#f4d15a', 0, 0.22, 0, 1, 0.95, 1.05, 8);
    const head = new THREE.Group(); head.position.set(0, 0.38, 0.1); g.add(head); g.userData.head = head;
    fmSph(head, 0.12, '#f4d15a', 0, 0, 0, 1, 1, 1, 8);
    fmEye(head, 0.05, 0.03, 0.09, 0.035); fmEye(head, -0.05, 0.03, 0.09, 0.035);
    const beak = new THREE.Mesh(new THREE.ConeGeometry(0.03, 0.08, 5), fmMat('#f4a04a')); beak.rotation.x = Math.PI/2; beak.position.set(0, -0.01, 0.13); head.add(beak);
    fmCyl(head, 0.015, 0.03, 0.06, '#e05050', 0, 0.1, 0);
    const tail = new THREE.Group(); tail.position.set(0, 0.24, -0.14); g.add(tail); g.userData.tail = tail;
    const f = new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.1, 5), fmMat('#f4a04a')); f.rotation.x = -1.1; tail.add(f);
    fmCyl(g, 0.02, 0.02, 0.1, '#f4a04a', 0.05, 0.08, 0.02);
    fmCyl(g, 0.02, 0.02, 0.1, '#f4a04a', -0.05, 0.08, 0.02);
    g.userData.kind = 'chick'; g.scale.setScalar(1.25); return g;
  }
  function fmMakeLamb(){
    const g = new THREE.Group();
    fmSph(g, 0.22, '#f4f1ea', 0, 0.3, 0, 1.05, 0.9, 1.15, 8);
    const head = new THREE.Group(); head.position.set(0, 0.38, 0.22); g.add(head); g.userData.head = head;
    fmSph(head, 0.12, '#e8d0b0', 0, 0, 0, 0.95, 0.9, 1.05, 8);
    fmEye(head, 0.05, 0.03, 0.1, 0.03); fmEye(head, -0.05, 0.03, 0.1, 0.03);
    fmSph(head, 0.05, '#e8d0b0', 0.08, 0.08, -0.02, 0.6, 1, 0.4, 5);
    fmSph(head, 0.05, '#e8d0b0', -0.08, 0.08, -0.02, 0.6, 1, 0.4, 5);
    const tail = new THREE.Group(); tail.position.set(0, 0.32, -0.24); g.add(tail); g.userData.tail = tail;
    fmSph(tail, 0.06, '#f4f1ea', 0, 0, 0, 1, 1, 1, 5);
    fmCyl(g, 0.04, 0.035, 0.16, '#e8d0b0', 0.08, 0.12, 0.08);
    fmCyl(g, 0.04, 0.035, 0.16, '#e8d0b0', -0.08, 0.12, 0.08);
    fmCyl(g, 0.04, 0.035, 0.16, '#e8d0b0', 0.08, 0.12, -0.08);
    fmCyl(g, 0.04, 0.035, 0.16, '#e8d0b0', -0.08, 0.12, -0.08);
    g.userData.kind = 'lamb'; g.scale.setScalar(1.25); return g;
  }
  function fmMakeCalf(){
    const g = new THREE.Group(), hide = '#f4e8d0', spot = '#6b4a2a';
    fmSph(g, 0.26, hide, 0, 0.4, 0, 0.95, 0.8, 1.3, 8);
    fmSph(g, 0.08, spot, 0.14, 0.48, 0.05, 1, 0.55, 1, 5);
    const head = new THREE.Group(); head.position.set(0, 0.55, 0.3); g.add(head); g.userData.head = head;
    fmSph(head, 0.14, hide, 0, 0, 0, 0.95, 0.85, 1.05, 8);
    fmEye(head, 0.06, 0.04, 0.11, 0.035); fmEye(head, -0.06, 0.04, 0.11, 0.035);
    fmSph(head, 0.06, hide, 0.1, 0.06, -0.02, 0.55, 0.9, 0.35, 5);
    fmSph(head, 0.06, hide, -0.1, 0.06, -0.02, 0.55, 0.9, 0.35, 5);
    const tail = new THREE.Group(); tail.position.set(0, 0.46, -0.34); g.add(tail); g.userData.tail = tail;
    fmCyl(tail, 0.02, 0.02, 0.22, hide, 0, -0.08, 0);
    fmSph(tail, 0.04, spot, 0, -0.2, 0, 1, 1, 1, 4);
    fmCyl(g, 0.045, 0.04, 0.28, hide, 0.1, 0.18, 0.16);
    fmCyl(g, 0.045, 0.04, 0.28, hide, -0.1, 0.18, 0.16);
    fmCyl(g, 0.045, 0.04, 0.28, hide, 0.1, 0.18, -0.16);
    fmCyl(g, 0.045, 0.04, 0.28, hide, -0.1, 0.18, -0.16);
    g.userData.kind = 'calf'; g.scale.setScalar(1.28); return g;
  }
  function fmMakePiglet(){
    const g = new THREE.Group(), pink = '#f3a6b0';
    fmSph(g, 0.2, pink, 0, 0.26, 0, 1.1, 0.85, 1.25, 8);
    const head = new THREE.Group(); head.position.set(0, 0.32, 0.2); g.add(head); g.userData.head = head;
    fmSph(head, 0.13, pink, 0, 0, 0, 1, 0.9, 1.05, 8);
    fmSph(head, 0.06, '#ef8a98', 0, -0.02, 0.12, 1.1, 0.8, 0.7, 6);
    fmEye(head, 0.05, 0.04, 0.09, 0.03); fmEye(head, -0.05, 0.04, 0.09, 0.03);
    fmSph(head, 0.05, pink, 0.1, 0.08, -0.02, 0.45, 0.9, 0.35, 5);
    fmSph(head, 0.05, pink, -0.1, 0.08, -0.02, 0.45, 0.9, 0.35, 5);
    const tail = new THREE.Group(); tail.position.set(0, 0.3, -0.24); g.add(tail); g.userData.tail = tail;
    fmCyl(tail, 0.015, 0.015, 0.12, pink, 0.04, 0.04, 0); tail.children[0].rotation.z = 1.2;
    fmCyl(g, 0.035, 0.03, 0.14, pink, 0.08, 0.1, 0.08);
    fmCyl(g, 0.035, 0.03, 0.14, pink, -0.08, 0.1, 0.08);
    fmCyl(g, 0.035, 0.03, 0.14, pink, 0.08, 0.1, -0.08);
    fmCyl(g, 0.035, 0.03, 0.14, pink, -0.08, 0.1, -0.08);
    g.userData.kind = 'piglet'; g.scale.setScalar(1.25); return g;
  }
  function fmMakeDuckling(){
    const g = new THREE.Group();
    fmSph(g, 0.16, '#f4d15a', 0, 0.2, 0, 1.05, 0.9, 1.2, 8);
    const head = new THREE.Group(); head.position.set(0, 0.34, 0.12); g.add(head); g.userData.head = head;
    fmSph(head, 0.11, '#f4d15a', 0, 0, 0, 1, 1, 1, 8);
    fmEye(head, 0.045, 0.03, 0.08, 0.03); fmEye(head, -0.045, 0.03, 0.08, 0.03);
    const beak = new THREE.Mesh(new THREE.ConeGeometry(0.03, 0.08, 5), fmMat('#f4a04a')); beak.rotation.x = Math.PI/2; beak.position.set(0, -0.01, 0.12); head.add(beak);
    const tail = new THREE.Group(); tail.position.set(0, 0.22, -0.16); g.add(tail); g.userData.tail = tail;
    const f = new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.1, 5), fmMat('#f4a04a')); f.rotation.x = -1.2; tail.add(f);
    fmCyl(g, 0.02, 0.02, 0.08, '#f4a04a', 0.05, 0.08, 0.02);
    fmCyl(g, 0.02, 0.02, 0.08, '#f4a04a', -0.05, 0.08, 0.02);
    g.userData.kind = 'duckling'; g.scale.setScalar(1.25); return g;
  }
  function fmMakeKid(){
    const g = new THREE.Group(), coat = '#f5efe4', patch = '#c89b6e';
    fmSph(g, 0.22, coat, 0, 0.38, 0, 0.9, 0.88, 1.25, 8);
    fmSph(g, 0.09, patch, 0.12, 0.42, 0.04, 1, 0.7, 1, 5);
    const head = new THREE.Group(); head.position.set(0, 0.54, 0.26); g.add(head); g.userData.head = head;
    fmSph(head, 0.15, coat, 0, 0, 0, 0.92, 0.92, 1.08, 8);
    fmEye(head, 0.06, 0.04, 0.12, 0.036); fmEye(head, -0.06, 0.04, 0.12, 0.036);
    fmSph(head, 0.028, '#f4a0b4', 0, -0.03, 0.16, 1.1, 0.7, 0.8, 5);
    [-1, 1].forEach(k => {
      const bud = new THREE.Mesh(new THREE.ConeGeometry(0.024, 0.09, 5), fmMat('#e6d2b5'));
      bud.position.set(k * 0.065, 0.14, -0.02); bud.rotation.z = -k * 0.25; head.add(bud);
      const ear = new THREE.Group(); ear.position.set(k * 0.12, 0.05, -0.01); head.add(ear);
      fmSph(ear, 0.055, patch, k * 0.04, -0.03, 0, 1.3, 0.65, 0.45, 5);
      (g.userData.ears || (g.userData.ears = [])).push(ear);
    });
    [[-0.09,0.14],[0.09,0.14],[-0.09,-0.15],[0.09,-0.15]].forEach(([x,z]) => fmCyl(g, 0.038, 0.035, 0.24, coat, x, 0.14, z));
    const tail = new THREE.Group(); tail.position.set(0, 0.45, -0.26); g.add(tail); g.userData.tail = tail;
    fmSph(tail, 0.048, patch, 0, 0.03, -0.02, 0.8, 1.3, 0.8, 5);
    g.userData.kind = 'kid'; g.scale.setScalar(1.22); return g;
  }
  function fmMakeKit(){
    const g = new THREE.Group(), fur = '#f2e9e4', spot = '#ffb3c7';
    fmSph(g, 0.19, fur, 0, 0.24, 0, 1.02, 0.95, 1.16, 8);
    const head = new THREE.Group(); head.position.set(0, 0.4, 0.14); g.add(head); g.userData.head = head;
    fmSph(head, 0.145, fur, 0, 0, 0, 1.05, 0.96, 1.0, 8);
    fmEye(head, 0.06, 0.03, 0.11, 0.036); fmEye(head, -0.06, 0.03, 0.11, 0.036);
    fmSph(head, 0.026, '#ff8fa3', 0, -0.02, 0.14, 1.2, 0.85, 0.8, 5);
    [-1, 1].forEach(k => {
      const ear = new THREE.Group(); ear.position.set(k * 0.06, 0.11, -0.01); head.add(ear);
      fmSph(ear, 0.048, fur, 0, 0.12, 0, 0.75, 2.2, 0.45, 5);
      fmSph(ear, 0.03, spot, 0, 0.11, 0.015, 0.65, 1.8, 0.35, 5);
      (g.userData.ears || (g.userData.ears = [])).push(ear);
    });
    const tail = new THREE.Group(); tail.position.set(0, 0.22, -0.22); g.add(tail); g.userData.tail = tail;
    fmSph(tail, 0.075, '#ffffff', 0, 0, 0, 1, 1, 1, 5);
    g.userData.kind = 'kit'; g.scale.setScalar(1.22); return g;
  }
  function fmPlaceCritter(g, x, z, yaw){
    g.position.set(x, 0, fmWZ(z));
    g.rotation.y = yaw || 0;
    g.userData.y0 = 0;
    g.userData.bob = Math.random() * 8;
    scene.add(g); fmKeep(g);
    (fm.critters || (fm.critters=[])).push(g);
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
    fm = {trash:[], solids:[], zones:{}, sv: started.state, run: started.run, near:null, bus:null, homeBus:null, wagon:null, marks:{}, curZone:null, shiftZ:0, critters:[], babies:{}, t:0};
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
    fm.critters = [];
    fmPlat(12, 0.22, -18, 7, 6, '#c4a060', 0.12);
    fmMesh(new THREE.BoxGeometry(0.16, 1.0, 6), '#8b6a3a', 8.5, 0.7, -18);
    fmMesh(new THREE.BoxGeometry(0.16, 1.0, 6), '#8b6a3a', 15.5, 0.7, -18);
    fmPlaceCritter(fmMakeHen(), 11.1, -17.4, 0.4);
    fmPlaceCritter(fmMakeHen(), 13.1, -18.7, -0.3);
    fmLab('🐔 Speckle hens', 12, 2.6, -14.6);
    fmPlat(-12, 0.22, -18, 7, 6, '#c4a060', 0.12);
    fmPlaceCritter(fmMakeSheep(), -11.1, -17.5, 0.5);
    fmPlaceCritter(fmMakeSheep(), -13.0, -18.7, -0.2);
    fmLab('🐑 Cloudwool sheep', -12, 2.6, -14.6);
    fmPlat(16, 0.22, -32, 8, 6, '#c4a060', 0.12);
    fmPlaceCritter(fmMakeCow(), 15.0, -31.3, 0.5);
    fmPlaceCritter(fmMakeCow(), 17.2, -32.8, -0.35);
    fmLab('🐄 Butterspot cows', 20.2, 2.6, -32);
    // Cloverleaf goats pen
    fmPlat(-10, 0.22, -49, 7, 6, '#c4a060', 0.12);
    fmMesh(new THREE.BoxGeometry(7, 0.95, 0.16), '#8b6a3a', -10, 0.68, -52);
    fmMesh(new THREE.BoxGeometry(0.16, 0.95, 6), '#8b6a3a', -13.5, 0.68, -49);
    fmMesh(new THREE.BoxGeometry(0.16, 0.95, 6), '#8b6a3a', -6.5, 0.68, -49);
    fmPlaceCritter(fmMakeGoat(), -11.0, -48.3, 0.45);
    fmPlaceCritter(fmMakeGoat(), -8.9, -49.7, -0.4);
    fmLab('🐐 Cloverleaf goats', -10, 2.6, -45.6);
    // Velvettail bunnies pen
    fmPlat(2, 0.22, -49, 6.5, 5.5, '#c4a060', 0.12);
    fmMesh(new THREE.BoxGeometry(6.5, 0.75, 0.14), '#8b6a3a', 2, 0.58, -51.75);
    fmMesh(new THREE.BoxGeometry(0.14, 0.75, 5.5), '#8b6a3a', -1.25, 0.58, -49);
    fmMesh(new THREE.BoxGeometry(0.14, 0.75, 5.5), '#8b6a3a', 5.25, 0.58, -49);
    fmPlaceCritter(fmMakeBunny(), 1.1, -48.3, 0.35);
    fmPlaceCritter(fmMakeBunny(), 3.0, -49.6, -0.45);
    fmLab('🐇 Velvettail bunnies', 2, 2.4, -45.8);
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
    // Honeymeadow Stand
    const st = FarmRules.FM_STAND;
    fmPlat(st.x, 0.22, st.z, 5.2, 3.4, '#c4a060', 0.12);
    fmMesh(new THREE.BoxGeometry(3.2, 1.05, 0.8), '#8b5a2a', st.x, 0.75, st.z - 0.6);
    fmMesh(new THREE.BoxGeometry(3.4, 0.12, 1.2), '#6b3a1d', st.x, 1.7, st.z - 0.6);
    fmMesh(new THREE.BoxGeometry(0.16, 1.7, 0.16), '#6b3a1d', st.x - 1.5, 0.9, st.z - 0.6);
    fmMesh(new THREE.BoxGeometry(0.16, 1.7, 0.16), '#6b3a1d', st.x + 1.5, 0.9, st.z - 0.6);
    fmMesh(new THREE.BoxGeometry(2.6, 0.7, 0.08), '#f4e8c4', st.x, 2.15, st.z - 0.7);
    fmLab('🪙 Honeymeadow Stand', st.x, 3.3, st.z - 1.1);
    fmLab('🥚 4   🍎 3   🎃 5', st.x, 2.35, st.z - 0.85);
    fm.cust = fmNpc({head:'#e0ac69', shirt:'#3a86ff', pants:'#3a3f6a', hair:'short', hairColor:'#5a3a1a', face:'smile', hat:null}, st.x + 1.6, st.z + 1.3, st.x, st.z, '#3a86ff');
    fm.custLab = fmLab('🧒 Pip', st.x + 2.1, 2.6, st.z + 1.4);
    // nursery paddock
    const nu = FarmRules.FM_NURSERY || {x:-19.5, z:FarmRules.fmZ(-36.5)};
    fmPlat(nu.x, 0.2, nu.z, 9.5, 8.5, '#c4a060', 0.1);
    fmMesh(new THREE.BoxGeometry(0.16, 0.9, 8.5), '#8b6a3a', nu.x - 4.75, 0.6, nu.z);
    fmMesh(new THREE.BoxGeometry(0.16, 0.9, 8.5), '#8b6a3a', nu.x + 4.75, 0.6, nu.z);
    fmMesh(new THREE.BoxGeometry(9.5, 0.9, 0.16), '#8b6a3a', nu.x, 0.6, nu.z - 4.25);
    fmLab('🍼 Little ones', nu.x, 2.5, nu.z + 4.65);
    fm.babies = {};
    (FarmRules.FM_BABIES||[]).forEach(b => {
      const maker = {chick:fmMakeChick, lamb:fmMakeLamb, calf:fmMakeCalf, piglet:fmMakePiglet, duckling:fmMakeDuckling, kid:fmMakeKid, kit:fmMakeKit}[b.kind] || fmMakeChick;
      const g = maker();
      g.position.set(b.x, 0, b.z);
      g.rotation.y = Math.atan2(FarmRules.FM_ARRIVE.x - b.x, FarmRules.FM_ARRIVE.z - b.z);
      g.userData.y0 = 0; g.userData.bob = Math.random()*8; g.userData.babyId = b.id;
      scene.add(g); fmKeep(g); (fm.critters||(fm.critters=[])).push(g);
      const short = ({chick:'Chick', lamb:'Lamb', calf:'Calf', piglet:'Piglet', duckling:'Duckling', kid:'Kid', kit:'Bunny'}[b.kind] || 'Baby');
      const lab = fmLab((b.emoji||'🐾') + ' ' + short, b.x, 1.55, b.z);
      fm.babies[b.id] = {mesh:g, lab:lab};
    });
    if (P){ P.x=0; P.y=0.5; P.z=18; P.vx=0; P.vz=0; P.vy=0; }
    if (typeof cam !== 'undefined' && cam){ cam.yaw=0; cam.pitch=0.16; cam.dist=10; }
    const box=document.getElementById('fmBox'); if(box) box.style.display='block';
    banner('🌾 Farm day! Ms. Bramble is taking Afterbell School to Honeymeadow Farm. Board the bus, then help Farmer Nettie with the animals, the little ones, the farm stand, eggs, apples, pumpkins, and the hay wagon.');
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
    else if (fm.run.haying){ pose = FarmRules.fmHayPose(fm.run); along = -4.2; ey = 5.6; }
    if (!pose) return false;
    const cy = Math.cos(pose.yaw || 0), sy = Math.sin(pose.yaw || 0);
    const x = pose.x + along * sy, z = pose.z + along * cy;
    camera.position.set(x, ey, z);
    if (fm.run.haying && FarmRules.FM_BARN){
      camera.lookAt(
        x + sy * 7 + FarmRules.FM_BARN.x * 0.25,
        1.8,
        z + cy * 7 + FarmRules.FM_BARN.z * 0.25
      );
    } else {
      camera.lookAt(x + sy * 10, ey - 0.35, z + cy * 10);
    }
    (fm.trash||[]).forEach(m => { if (m && m.userData && m.userData.fmLab) m.visible = false; });
    if (fm.run.haying) fmRideVis(true);
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
    if (hit.kind === 'pet'){
      try { if (typeof SND !== 'undefined' && SND.coin) SND.coin(); } catch(e){}
      banner((hit.emoji||'💕') + ' ' + (hit.text || ('You pet the happy ' + hit.name + '!')));
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
    if (hit.kind === 'sell'){
      const r = FarmRules.fmSell(fm.sv, hit.want, fm.run);
      if (!r.ok){
        if (r.why === 'stock') banner('The stand is waiting for more eggs, apples or pumpkins.');
        else if (r.why === 'want' && r.customer) banner(r.customer.name + ' is hoping for something else — check the price board!');
        return;
      }
      fm.sv = r.state; fmSave(fm.sv); fmPaint();
      if (r.coins && typeof coins !== 'undefined'){ try { coins += r.coins; if (typeof saveCoins === 'function') saveCoins(); if (typeof updateCoins === 'function') updateCoins(true); } catch(e){} }
      const who = (r.customer && r.customer.name) || 'a friend';
      banner('🪙 ' + who + ' bought a ' + (r.item && r.item.name || 'treat') + '!  +' + r.coins + ' 🪙');
      return;
    }
    if (hit.kind === 'adopt'){
      const r = FarmRules.fmAdopt(fm.sv, hit.id);
      if (!r.ok){
        if (r.why === 'feed') banner('Feed the ' + (r.need || 'animals') + ' first — then this little one will be ready to come home.');
        else if (r.already) banner('You already adopted this little one!');
        return;
      }
      let petsSave = null;
      try { petsSave = (typeof load === 'function') ? load('rubloxPets', null) : null; } catch(e){}
      const grant = FarmRules.fmGrantPet(petsSave, r.pet, 6);
      if (!grant.ok){
        // leave the baby at the farm so the player can try again after making room
        const undone = FarmRules.fmLoad(r.state);
        undone.adopted = (undone.adopted || []).filter(id => id !== hit.id);
        fm.sv = undone; fmSave(fm.sv);
        banner('Your pet beds are full (6). Make a little room in Adopt a Pet, then come back for this ' + (r.baby && r.baby.name || 'friend') + '!');
        return;
      }
      fm.sv = r.state; fmSave(fm.sv);
      try { if (typeof save === 'function') save('rubloxPets', grant.pets); } catch(e){}
      fmPaint();
      try { if (typeof pfEnter === 'function') pfEnter(typeof mode !== 'undefined' ? mode : 'farm'); } catch(e){}
      banner((r.baby && r.baby.emoji || '🐾') + ' ' + (r.petName || 'Your new friend') + ' the ' + (r.baby && r.baby.name || 'baby') + ' is yours! They will follow you around.');
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
        banner('🌾 Welcome to Honeymeadow Farm! Farmer Nettie is by the barn — not under the bus. Help with the animals, sell at the stand, and visit the little ones.');
        fmApplyZones('farm');
      }
    }
    if (fm.run.haying){
      const r = FarmRules.fmTickHay(fm.run, fm.sv, dt);
      fm.sv = r.state;
      const pose = FarmRules.fmHayPose(fm.run);
      fmSeat(pose, -0.2, 1.55); fmRideVis(true);
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
    fm.t = (fm.t || 0) + (dt || 0);
    (fm.critters||[]).forEach((g, i) => {
      if (!g || !g.visible) return;
      const T = fm.t + (g.userData.bob || 0);
      g.position.y = (g.userData.y0 || 0) + Math.sin(T * 2.2) * (g.userData.kind === 'hen' || g.userData.kind === 'chick' || g.userData.kind === 'duckling' ? 0.035 : 0.025);
      if (g.userData.tail) g.userData.tail.rotation.y = Math.sin(T * 4.0 + i) * 0.45;
      if (g.userData.head) g.userData.head.rotation.x = Math.sin(T * 1.6 + i) * 0.1;
      if (g.userData.ears) g.userData.ears.forEach((e, k) => { e.rotation.z = Math.sin(T * 2.4 + k) * 0.12; });
    });
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
    stand(){ if (!fm) return; this.farm(); this.go('stand'); if (P){ P.z += 2.2; } if (typeof cam!=='undefined' && cam){ cam.yaw=Math.PI; cam.pitch=0.12; cam.dist=6.5; } },
    nursery(){ if (!fm) return; this.farm(); const nu=FarmRules.FM_NURSERY; if(P&&nu){ P.x=nu.x; P.y=0.5; P.z=nu.z+5.2; } if (typeof cam!=='undefined' && cam){ cam.yaw=0; cam.pitch=0.12; cam.dist=7; } },
    hideLabs(on){
      if (fm) fm.hideLabs = !!on;
      (fm && fm.trash || []).forEach(m => { if (m && m.userData && m.userData.fmLab) m.visible = !on; });
    },
    hensClose(){ if (!fm) return; this.farm(); this.hideLabs(true); const f=FarmRules.FM_FEEDS[0]; if(P&&f){ P.x=f.x+7.2; P.y=0.5; P.z=f.z+1.0; } if (typeof cam!=='undefined' && cam){ cam.yaw=Math.PI/2; cam.pitch=0.06; cam.dist=6.4; } },
    sheepClose(){ if (!fm) return; this.farm(); this.hideLabs(true); const f=FarmRules.FM_FEEDS[1]; if(P&&f){ P.x=f.x-7.2; P.y=0.5; P.z=f.z+1.0; } if (typeof cam!=='undefined' && cam){ cam.yaw=-Math.PI/2; cam.pitch=0.06; cam.dist=6.4; } },
    cowsClose(){ if (!fm) return; this.farm(); this.hideLabs(true); const f=FarmRules.FM_FEEDS[2]; if(P&&f){ P.x=f.x+7.4; P.y=0.5; P.z=f.z+1.0; } if (typeof cam!=='undefined' && cam){ cam.yaw=Math.PI/2; cam.pitch=0.06; cam.dist=6.8; } },
    goatsClose(){ if (!fm) return; this.farm(); this.hideLabs(true); const f=FarmRules.FM_FEEDS[3]; if(P&&f){ P.x=f.x-1.2; P.y=0.5; P.z=f.z+1.5; } if (typeof cam!=='undefined' && cam){ cam.yaw=-0.32; cam.pitch=0.26; cam.dist=6.8; } },
    bunniesClose(){ if (!fm) return; this.farm(); this.hideLabs(true); const f=FarmRules.FM_FEEDS[4]; if(P&&f){ P.x=f.x+1.2; P.y=0.5; P.z=f.z+1.5; } if (typeof cam!=='undefined' && cam){ cam.yaw=0.32; cam.pitch=0.26; cam.dist=6.8; } },
    hayRide(t){ if (!fm) return; fm.run.phase='farm'; FarmRules.fmStartHay(fm.run, fm.sv); fm.run.hayT=(t==null?2.4:t); const pose=FarmRules.fmHayPose(fm.run); fmSeat(pose, -0.2, 1.55); fmRideVis(true); if(fm.wagon){fm.wagon.position.set(pose.x,0,pose.z); fm.wagon.rotation.y=pose.yaw||0;} fmApplyZones('farm'); },
    cam(yaw, pitch, dist){ if (typeof cam !== 'undefined' && cam){ if (yaw != null) cam.yaw = yaw; if (pitch != null) cam.pitch = pitch; if (dist != null) cam.dist = dist; } },
    nudge(dx, dz){ if (P){ P.x += dx||0; P.z += dz||0; P.vx=0; P.vz=0; } },
    critterReport(){
      return (fm && fm.critters || []).map(g => {
        const p = g.getWorldPosition ? g.getWorldPosition(new THREE.Vector3()) : g.position;
        return {kind: g.userData && g.userData.kind, x:+p.x.toFixed(2), y:+p.y.toFixed(2), z:+p.z.toFixed(2), vis:g.visible, kids:g.children && g.children.length, scale:g.scale && g.scale.x};
      });
    },
    seed(){
      if (!fm) return null;
      const F = FarmRules;
      (F.FM_FEEDS||[]).forEach(f => { const r = F.fmFeed(fm.sv, f.id); if (r.ok) fm.sv = r.state; });
      (F.FM_EGGS||[]).forEach(f => { const r = F.fmPickEgg(fm.sv, f.id); if (r.ok) fm.sv = r.state; });
      (F.FM_APPLES||[]).forEach(f => { const r = F.fmPickApple(fm.sv, f.id); if (r.ok) fm.sv = r.state; });
      (F.FM_PUMPS||[]).forEach(f => { const r = F.fmPickPump(fm.sv, f.id); if (r.ok) fm.sv = r.state; });
      fmSave(fm.sv); fmPaint();
      return {stock: F.fmStock(fm.sv), fed: fm.sv.fed, adopted: fm.sv.adopted};
    },
    go(id){
      if (!fm || !P) return;
      const F = FarmRules;
      const baby = (F.FM_BABIES||[]).find(b => b.id === id || b.kind === id);
      const map = {bus:F.FM_BUS, home:F.FM_HOME_BUS, teacher:F.FM_TEACHER, nettie:F.FM_GUIDE, barn:F.FM_BARN, arrive:F.FM_ARRIVE, wagon:F.FM_WAGON, hens:F.FM_FEEDS[0], sheep:F.FM_FEEDS[1], cows:F.FM_FEEDS[2], goats:F.FM_FEEDS[3], bunnies:F.FM_FEEDS[4], stand:F.FM_STAND, nursery:F.FM_NURSERY};
      const t = map[id] || baby;
      if (!t) return;
      P.x=t.x; P.y=0.5; P.z=t.z; P.vx=0; P.vz=0; P.vy=0;
    }
  };
  try {
    const act=document.getElementById('fmAct'); if(act && !act.__fm){ act.__fm=true; act.onclick=ev=>{ev.preventDefault();ev.stopPropagation();fmAct();}; }
  } catch(e){}
