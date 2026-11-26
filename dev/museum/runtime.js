/* Brightwhistle Museum of Wonders runtime — injected into the main engine IIFE, after the farm helpers. */
  let mu = null;
  function muSave(s){ try { if (typeof save === 'function') save(MuseumRules.MU_KEY, s); } catch(e){} }
  function muState(){ try { return MuseumRules.muLoad(typeof load === 'function' ? load(MuseumRules.MU_KEY, null) : null); } catch(e){ return MuseumRules.muFresh(); } }
  function muWZ(z){ return (z||0) + ((mu && mu.shiftZ) || 0); }
  function muKeep(m){
    if (mu && m){
      (mu.trash || (mu.trash=[])).push(m);
      if (mu.curZone){
        m.userData = m.userData || {};
        m.userData.muZone = mu.curZone;
        (mu.zones || (mu.zones={}))[mu.curZone] = mu.zones[mu.curZone] || [];
        mu.zones[mu.curZone].push(m);
      }
    }
    return m;
  }
  function muMesh(geo, col, x, y, z, opts){
    const m = new THREE.Mesh(geo, new THREE.MeshLambertMaterial(Object.assign({color: col}, opts || {})));
    m.position.set(x, y, muWZ(z)); scene.add(m); muKeep(m); return m;
  }
  function muGlow(m, col, k){ try { m.material.emissive = new THREE.Color(col); m.material.emissiveIntensity = k == null ? 0.8 : k; } catch(e){} return m; }
  function muLabIn(text, x, y, z){
    const l = muLab(text, x, y, z);
    if (l) l.userData.muIn = true;
    return l;
  }
  function muLab(text, x, y, z){
    try { if (typeof t297Lab === 'function'){ const l = t297Lab(text, x, y, muWZ(z)); if (l){ l.userData = l.userData || {}; l.userData.muLab = true; return muKeep(l); } } } catch(e){}
    return null;
  }
  function muPlat(x, y, z, w, d, col, h){
    const b = plat(x, y, muWZ(z), w, d, col, h == null ? 0.2 : h);
    if (b && b.mesh) muKeep(b.mesh);
    if (b){ (mu.solids || (mu.solids=[])).push(b); if (mu.curZone) b.muZone = mu.curZone; }
    return b;
  }
  function muApplyZones(phase){
    if (!mu) return;
    const showYard = (phase === 'yard' || phase === 'ride' || phase === 'done');
    const showDest = (phase === 'hall' || phase === 'ride');
    const vis = {yard: showYard, dest: showDest, road: true, land: true};
    Object.keys(vis).forEach(z => {
      (mu.zones && mu.zones[z] || []).forEach(m => { if (m) m.visible = !!vis[z]; });
    });
    (mu.solids||[]).forEach(b => {
      if (!b) return;
      if (b.muZone === 'yard') b.active = showYard;
      if (b.muZone === 'dest') b.active = showDest;
    });
    muPaint();
    const shop = muInGiftShop();
    const inside = !!(P && mu.run && mu.run.phase === 'hall' && MuseumRules.muInHall(P.x, P.z));
    (mu.trash||[]).forEach(m => {
      if (m && m.userData && m.userData.muLab){
        if (shop) m.visible = !!m.userData.muShopLab || !!m.userData.muNear;
        else if (m.userData.muShopLab || m.userData.muIn) m.visible = inside;
        else if (m.userData.muZone === 'dest') m.visible = !!(mu.run && (mu.run.phase === 'hall' || mu.run.phase === 'ride'));
      }
    });
  }
  function muSky(){ if (typeof ftApplyDaySky === 'function') ftApplyDaySky(); else {
    try { scene.background = new THREE.Color('#8fd0ff'); if (scene.fog){ scene.fog.color.set('#8fd0ff'); scene.fog.near=60; scene.fog.far=200; } } catch(e){}
  } }
  function muHud(msg){
    const hint = document.getElementById('muHint');
    const box = document.getElementById('muBox');
    if (hint) hint.textContent = msg || MuseumRules.muGoal(mu && mu.sv, mu && mu.run);
    if (box) box.style.display = 'block';
    const act = document.getElementById('muAct');
    if (act){
      const p = mu && mu.near;
      act.classList.toggle('show', !!(p && p.act && p.kind !== 'ride'));
      if (p && p.act) act.textContent = p.act;
    }
  }
  // Meadow to the horizon: one huge grass field, rolling hills, trees and wildflowers all the way out.
  function muHorizonLand(cx, cz){
    const prevZ = mu.curZone, prevS = mu.shiftZ;
    mu.curZone = 'land'; mu.shiftZ = 0;
    muPlat(cx, 0.05, cz, 1600, 1600, '#5aa84a', 0.1);
    for (let i = 0; i < 24; i++){
      const a = i * Math.PI * 2 / 24;
      const r = 200 + (i % 4) * 16;
      const x = cx + Math.cos(a) * r, z = cz + Math.sin(a) * r;
      const hill = muMesh(new THREE.SphereGeometry(18 + (i % 3) * 6, 10, 6), i % 2 ? '#4e9a42' : '#68b454', x, -6, z);
      hill.scale.y = 0.45;
      muMesh(new THREE.CylinderGeometry(0.3, 0.4, 3.2, 7), '#6b3a1d', x * 0.8 + 6, 1.6, z * 0.8 + 4);
      muMesh(new THREE.SphereGeometry(1.6, 7, 5), '#3f8a3a', x * 0.8 + 6, 3.8, z * 0.8 + 4);
    }
    const flowerCols = ['#ffd23f', '#ff6fb5', '#ffffff', '#b48bff'];
    for (let i = 0; i < 70; i++){
      const a = i * 2.39996, r = 22 + (i * 7.3) % 90;
      muMesh(new THREE.SphereGeometry(0.16, 5, 4), flowerCols[i % 4], cx + Math.cos(a) * r, 0.25, cz + Math.sin(a) * r);
    }
    mu.curZone = prevZ; mu.shiftZ = prevS;
  }
  function muWall(x, z, w, d, col, h, y0){
    const hh = h == null ? (MuseumRules.MU_HALL.wallH || 6.2) : h;
    const b = muPlat(x, (y0 || 0.2) + hh, z, w, d, col, hh);
    return b;
  }
  function muDino(cx, cz){
    const bone = '#efe4c8', dark = '#cdbf9c';
    // raised plinth (solid, too tall to step onto) with a rope rail
    muPlat(cx, 0.95, cz, 10.4, 6, '#8a6a4a', 0.75);
    muMesh(new THREE.BoxGeometry(10.8, 0.12, 6.4), '#6b4f35', cx, 0.98, cz);
    const g = new THREE.Group();
    const add = (geo, col, x, y, z, rx, ry, rz) => { const m = new THREE.Mesh(geo, new THREE.MeshLambertMaterial({color: col})); m.position.set(x, y, z); if (rx) m.rotation.x = rx; if (ry) m.rotation.y = ry; if (rz) m.rotation.z = rz; g.add(m); return m; };
    // spine (vertebrae) from neck to tail tip
    for (let i = 0; i < 18; i++){
      const t = i / 17, x = 2.6 - t * 8.2, y = 3.0 + Math.sin(t * Math.PI) * 0.5 - t * t * 1.6;
      add(new THREE.BoxGeometry(0.42, 0.34 - t * 0.16, 0.34 - t * 0.16), i % 2 ? bone : dark, x, y, 0);
    }
    // ribs
    for (let i = 0; i < 6; i++){
      const x = 1.6 - i * 0.55;
      const rib = add(new THREE.TorusGeometry(0.75 - i * 0.05, 0.06, 5, 10, Math.PI), bone, x, 2.55, 0, 0, Math.PI / 2, Math.PI);
      rib.scale.set(1, 1.15, 1);
    }
    // neck + skull with a frill and three nose horns (the Thunderhorn)
    add(new THREE.BoxGeometry(0.9, 0.36, 0.36), bone, 3.2, 3.3, 0, 0, 0, 0.5);
    add(new THREE.BoxGeometry(1.3, 0.7, 0.75), bone, 4.0, 3.55, 0);
    add(new THREE.CylinderGeometry(0.95, 0.95, 0.12, 12, 1, false, 0, Math.PI), dark, 3.55, 3.9, 0, 0, 0, Math.PI / 2);
    [[4.55, 4.05, 0], [3.95, 4.15, -0.24], [3.95, 4.15, 0.24]].forEach(h => add(new THREE.ConeGeometry(0.1, 0.62, 6), '#fff6dc', h[0], h[1], h[2], 0, 0, -0.5));
    add(new THREE.SphereGeometry(0.1, 6, 5), '#2a2a2a', 4.25, 3.7, 0.3); add(new THREE.SphereGeometry(0.1, 6, 5), '#2a2a2a', 4.25, 3.7, -0.3);
    // legs
    [[1.3, 0.5], [1.3, -0.5], [-1.6, 0.55], [-1.6, -0.55]].forEach(l => {
      add(new THREE.CylinderGeometry(0.14, 0.12, 1.1, 6), bone, l[0], 1.95, l[1]);
      add(new THREE.CylinderGeometry(0.12, 0.1, 0.9, 6), dark, l[0] + 0.15, 1.05, l[1]);
      add(new THREE.BoxGeometry(0.4, 0.12, 0.3), bone, l[0] + 0.3, 0.62, l[1]);
    });
    g.position.set(cx, 0.4, muWZ(cz)); g.scale.set(1.05, 1.05, 1.05);
    scene.add(g); muKeep(g);
    [[-5.3, -3.1], [5.3, -3.1], [-5.3, 3.1], [5.3, 3.1]].forEach(p => muMesh(new THREE.CylinderGeometry(0.07, 0.09, 0.9, 6), '#c8a040', cx + p[0], 1.4, cz + p[1]));
    muMesh(new THREE.BoxGeometry(10.6, 0.05, 0.05), '#b0303a', cx, 1.75, cz + 3.1);
    muLabIn('🦴 Thunderhorn skeleton', cx, 5.6, cz);
  }
  function muCase(x, z, label, kind){
    // wooden case with a glass box on top (solid, so the exhibit stays safe)
    muPlat(x, 1.25, z, 2.2, 2.2, '#7a5236', 1.05);
    const glass = muMesh(new THREE.BoxGeometry(2.0, 1.4, 2.0), '#cfefff', x, 1.95, z, {transparent:true, opacity:0.28});
    glass.renderOrder = 2;
    if (kind === 'gem'){
      const base = muMesh(new THREE.SphereGeometry(0.62, 9, 7), '#7a6a6a', x, 1.75, z);
      base.scale.y = 0.7;
      for (let i = 0; i < 9; i++){
        const a = i * 0.7;
        const c = muMesh(new THREE.ConeGeometry(0.12, 0.5, 5), i % 2 ? '#b48bff' : '#8b5cf6', x + Math.cos(a) * 0.32, 1.95, z + Math.sin(a) * 0.32);
        c.rotation.z = Math.cos(a) * 0.6; c.rotation.x = Math.sin(a) * 0.6;
        muGlow(c, '#8b5cf6', 0.45);
        (mu.spin || (mu.spin=[])).push({m:c, s:0});
      }
    } else if (kind === 'meteor'){
      const rock = muMesh(new THREE.DodecahedronGeometry(0.6, 0), '#4a4a52', x, 1.85, z);
      (mu.spin || (mu.spin=[])).push({m:rock, s:0.3});
      for (let i = 0; i < 5; i++) muGlow(muMesh(new THREE.BoxGeometry(0.1, 0.1, 0.1), '#e8e8f4', x + Math.cos(i) * 0.5, 1.85 + Math.sin(i * 2) * 0.3, z + Math.sin(i) * 0.5), '#ffffff', 0.6);
    }
    muLabIn(label, x, 3.3, z);
  }
  function muOrbit(x, z){
    muPlat(x, 1.0, z, 1.4, 1.4, '#2a3a6a', 0.8);
    const sun = muGlow(muMesh(new THREE.SphereGeometry(0.5, 12, 10), '#ffd23f', x, 3.1, z), '#ffb800', 0.9);
    const cols = ['#c8c8c8', '#ff9f1c', '#3a86ff', '#e05a3a', '#d8b070', '#7ad0e8', '#8b5cf6'];
    mu.planets = mu.planets || [];
    cols.forEach((c, i) => {
      const r = 0.9 + i * 0.34;
      const p = muMesh(new THREE.SphereGeometry(0.11 + (i === 4 ? 0.12 : i * 0.02), 8, 6), c, x + r, 3.1, z);
      if (i === 4){ const ring = new THREE.Mesh(new THREE.TorusGeometry(0.34, 0.035, 4, 16), new THREE.MeshLambertMaterial({color:'#f4e2a8'})); ring.rotation.x = 1.2; p.add(ring); }
      mu.planets.push({m:p, cx:x, cz:muWZ(z), r, a: i * 0.9, spd: 0.9 - i * 0.09});
      const path = muMesh(new THREE.TorusGeometry(r, 0.012, 3, 40), '#9ab0e8', x, 3.1, z);
      path.rotation.x = Math.PI / 2;
    });
    muMesh(new THREE.CylinderGeometry(0.03, 0.03, 2.4, 5), '#c8c8c8', x, 5.0, z);
    void sun;
    muLabIn('🪐 Starwick orbit model', x, 5.4, z);
  }
  function muMurals(z){
    const cols = [['#7ad0e8', '#ffd23f', '#e05a3a'], ['#2ec27e', '#ff6fb5', '#3a86ff'], ['#1d2340', '#f4e2a8', '#8b5cf6']];
    [-7, 0, 7].forEach((x, i) => {
      muMesh(new THREE.BoxGeometry(5.0, 3.2, 0.12), '#c8a040', x, 3.2, z);
      muMesh(new THREE.BoxGeometry(4.6, 2.8, 0.14), cols[i][0], x, 3.2, z + 0.02);
      if (i === 0){ // rainbow barn
        muMesh(new THREE.BoxGeometry(1.6, 1.1, 0.16), '#c0392b', x, 2.5, z + 0.04);
        [0, 1, 2, 3, 4].forEach(k => muMesh(new THREE.BoxGeometry(4.0 - k * 0.6, 0.12, 0.16), ['#e05a3a', '#ff9f1c', '#ffd23f', '#2ec27e', '#3a86ff'][k], x, 3.7 + k * 0.13, z + 0.05));
      } else if (i === 1){ // kite festival
        [[-1.2, 3.8], [0.4, 4.0], [1.4, 3.3]].forEach((k, n) => { const m = muMesh(new THREE.BoxGeometry(0.5, 0.5, 0.16), cols[i][(n + 1) % 3], x + k[0], k[1], z + 0.05); m.rotation.z = Math.PI / 4; });
        muMesh(new THREE.BoxGeometry(4.6, 0.6, 0.16), '#4e9a42', x, 2.1, z + 0.04);
      } else { // sleepy moon
        muGlow(muMesh(new THREE.SphereGeometry(0.6, 10, 8), '#f4e2a8', x + 0.8, 3.7, z + 0.1), '#f4e2a8', 0.4);
        [[-1.5, 4.1], [-0.6, 3.5], [-1.8, 2.7], [1.6, 2.6]].forEach(s => muGlow(muMesh(new THREE.BoxGeometry(0.12, 0.12, 0.16), '#ffffff', x + s[0], s[1], z + 0.06), '#ffffff', 0.7));
      }
      const spot = muGlow(muMesh(new THREE.SphereGeometry(0.12, 6, 5), '#fff4d0', x, 5.1, z + 0.5), '#fff4d0', 0.9);
      void spot;
    });
    muMesh(new THREE.BoxGeometry(18, 0.05, 0.05), '#b0303a', 0, 0.95, z + 2.0);
    [-9, -3, 3, 9].forEach(x => muMesh(new THREE.CylinderGeometry(0.07, 0.09, 0.8, 6), '#c8a040', x, 0.6, z + 2.0));
    muLabIn('🖼️ Sunfield mural gallery', 0, 5.4, z + 0.4);
  }
  function muHallBuilding(){
    mu.curZone = 'dest'; mu.shiftZ = MuseumRules.MU_DEST_DZ || 0;
    const H = MuseumRules.MU_HALL, hz = H.z - (MuseumRules.MU_DEST_DZ || 0);
    const wall = '#e9dcc4', trim = '#7a4a2a', x0 = H.x - H.w / 2, x1 = H.x + H.w / 2, z0 = hz + H.d / 2, z1 = hz - H.d / 2;
    // warm wooden floor + rugs
    muPlat(H.x, 0.24, hz, H.w, H.d, '#b07a48', 0.18);
    for (let i = 0; i < 6; i++) muMesh(new THREE.BoxGeometry(H.w - 0.4, 0.02, 0.06), '#9a6a3c', H.x, 0.25, hz - H.d / 2 + 2.5 + i * 5);
    muMesh(new THREE.BoxGeometry(6.2, 0.03, 9), '#b0303a', 0, 0.27, hz + 9);
    muMesh(new THREE.BoxGeometry(5.6, 0.035, 8.4), '#d8a040', 0, 0.275, hz + 9);
    // solid walls: back, sides, front split around tall double doors
    const t = 0.44, wh = H.wallH;
    muWall(H.x, z1, H.w + t, t, wall);
    muWall(x0, hz, t, H.d, wall);
    muWall(x1, hz, t, H.d, wall);
    const side = (H.w - H.doorW) / 2;
    muWall(x0 + side / 2, z0, side, t, wall);
    muWall(x1 - side / 2, z0, side, t, wall);
    muWall(H.x, z0, H.doorW, t, wall, wh - H.doorH, 0.2 + H.doorH);
    // wainscot trim + columns on the facade
    [-7, -4.2, 4.2, 7].forEach(x => {
      muMesh(new THREE.CylinderGeometry(0.42, 0.48, wh, 12), '#f4ecd8', x, 0.2 + wh / 2, z0 + 0.7);
    });
    muMesh(new THREE.BoxGeometry(16.6, 0.5, 1.8), '#f4ecd8', 0, wh + 0.45, z0 + 0.6);
    mu.roof = [];
    // triangular pediment over the columns (a 3-sided prism, point up)
    const ped = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 1.6, 1.0, 3), new THREE.MeshLambertMaterial({color:'#f4ecd8'}));
    ped.rotation.x = -Math.PI / 2; ped.scale.set(6, 1, 1);
    ped.position.set(0, wh + 0.7 + 0.8, muWZ(z0 + 0.6)); scene.add(ped); muKeep(ped);
    mu.roof.push(ped);
    // roof (hidden from inside so the camera never looks at the underside)
    const roof = muMesh(new THREE.BoxGeometry(H.w + 1.4, 0.4, H.d + 1.4), '#4a6a8a', H.x, 0.2 + wh + 0.3, hz);
    mu.roof.push(roof);
    const dome = muMesh(new THREE.SphereGeometry(4.2, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2), '#6a8aaa', 0, 0.2 + wh + 0.5, hz - 4);
    mu.roof.push(dome);
    // warm ceiling: one-sided planes facing down, so they show from inside but never block a camera above them
    const ceil = new THREE.Mesh(new THREE.PlaneGeometry(H.w, H.d), new THREE.MeshLambertMaterial({color:'#f4ead8'}));
    ceil.rotation.x = Math.PI / 2; ceil.position.set(H.x, 0.2 + wh - 0.02, muWZ(hz)); scene.add(ceil); muKeep(ceil);
    const sky = new THREE.Mesh(new THREE.PlaneGeometry(8, 8), new THREE.MeshLambertMaterial({color:'#bfe6ff'}));
    sky.rotation.x = Math.PI / 2; sky.position.set(0, 0.2 + wh - 0.05, muWZ(hz - 4)); scene.add(sky); muKeep(sky); muGlow(sky, '#bfe6ff', 0.5);
    for (let i = -2; i <= 2; i++){ const beam = new THREE.Mesh(new THREE.PlaneGeometry(0.5, H.d), new THREE.MeshLambertMaterial({color:'#9a6a3c'})); beam.rotation.x = Math.PI / 2; beam.position.set(i * 7, 0.2 + wh - 0.08, muWZ(hz)); scene.add(beam); muKeep(beam); }
    // entry steps and door frame
    muPlat(0, 0.3, z0 + 2.2, 9, 3.2, '#d8d0c0', 0.22);
    muMesh(new THREE.BoxGeometry(H.doorW + 0.6, 0.3, 0.5), trim, 0, 0.2 + H.doorH + 0.1, z0 + 0.1);
    // cozy inside: hanging lamps, benches, plants, info desk, banner flags
    try {
      const lit = new THREE.PointLight('#ffe0b0', 0.75, 30, 2); lit.position.set(0, 5.2, muWZ(hz)); scene.add(lit); muKeep(lit);
      const lit2 = new THREE.PointLight('#ffe8c8', 0.5, 22, 2); lit2.position.set(-10, 4.8, muWZ(hz - 7)); scene.add(lit2); muKeep(lit2);
      const lit3 = new THREE.PointLight('#ffe8c8', 0.5, 22, 2); lit3.position.set(10, 4.8, muWZ(hz - 7)); scene.add(lit3); muKeep(lit3);
    } catch(e){}
    [[-8, hz + 6], [8, hz + 6], [-8, hz - 6], [8, hz - 6], [0, hz]].forEach(p => {
      muMesh(new THREE.CylinderGeometry(0.02, 0.02, 1.0, 4), '#3a2a1a', p[0], 5.9, p[1]);
      muGlow(muMesh(new THREE.SphereGeometry(0.3, 10, 8), '#ffe8b8', p[0], 5.3, p[1]), '#ffd890', 0.9);
    });
    [[-6.4, hz + 6.6], [6.4, hz - 1.5]].forEach(p => {
      muMesh(new THREE.BoxGeometry(2.4, 0.18, 0.8), '#7a4a2a', p[0], 0.75, p[1]);
      [-1, 1].forEach(s => muMesh(new THREE.BoxGeometry(0.16, 0.5, 0.7), '#5a3a1a', p[0] + s * 1.0, 0.45, p[1]));
    });
    [[x0 + 1.2, z0 - 1.2], [x1 - 1.2, z1 + 1.2], [x0 + 1.2, z1 + 1.2], [x1 - 6.4, z0 - 1.2]].forEach(p => {
      muMesh(new THREE.CylinderGeometry(0.36, 0.28, 0.6, 8), '#b0603a', p[0], 0.55, p[1]);
      muMesh(new THREE.SphereGeometry(0.62, 8, 6), '#3f8a3a', p[0], 1.3, p[1]);
    });
    [-12, -4, 4, 12].forEach((x, i) => {
      const f = muMesh(new THREE.BoxGeometry(1.0, 1.8, 0.05), ['#b0303a', '#2a6a88', '#d8a040', '#2ec27e'][i], x, 4.6, z1 + 0.3);
      void f;
    });
    muLab('🦉 Brightwhistle Museum of Wonders', 0, wh + 3.6, z0 + 0.8);
    mu.shiftZ = 0;
  }
  function muShopLab(text, x, y, z){
    const l = muLabIn(text, x, y, z);
    if (l) l.userData.muShopLab = true;
    return l;
  }
  function muInGiftShop(){
    if (!mu || !P || !mu.run || mu.run.phase !== 'hall') return false;
    const s = MuseumRules.MU_SHOP;
    return Math.abs(P.x - s.x) < 4.4 && Math.abs(P.z - s.z) < 4.4;
  }
  function muGiftShop(){
    mu.curZone = 'dest'; mu.shiftZ = MuseumRules.MU_DEST_DZ || 0;
    const dz = MuseumRules.MU_DEST_DZ || 0, s = MuseumRules.MU_SHOP, sz = s.z - dz;
    muMesh(new THREE.BoxGeometry(8, 0.03, 8.4), '#2a6a88', s.x, 0.27, sz);
    // low counter at the back of the corner, shopkeeper Fennick behind it
    muPlat(s.x, 1.1, sz - 4.2, 3.4, 0.8, '#7a4a2a', 0.86);
    (MuseumRules.MU_GIFTS||[]).forEach(g => {
      const lz = g.z - dz;
      muMesh(new THREE.BoxGeometry(1.0, 0.85, 1.0), '#c4a060', g.x, 0.65, lz);
      let m;
      if (g.kind === 'hat') m = muMesh(new THREE.CylinderGeometry(0.28, 0.32, 0.28, 10), g.val === 'dinocap' ? '#3a8f5a' : '#1d2a5a', g.x, 1.25, lz);
      else if (g.id.indexOf('geode') >= 0) m = muGlow(muMesh(new THREE.OctahedronGeometry(0.28, 0), '#b48bff', g.x, 1.3, lz), '#8b5cf6', 0.4);
      else if (g.id.indexOf('orbit') >= 0) m = muMesh(new THREE.SphereGeometry(0.28, 10, 8), '#9ad8e8', g.x, 1.3, lz, {transparent:true, opacity:0.7});
      else if (g.id.indexOf('mural') >= 0) m = muMesh(new THREE.BoxGeometry(0.5, 0.32, 0.36), '#ff9f1c', g.x, 1.22, lz);
      else m = muMesh(new THREE.SphereGeometry(0.3, 8, 6), '#6ab04c', g.x, 1.28, lz);
      void m;
      const lab = MuseumRules.muGiftLabel(g);
      muShopLab((g.emoji||'🛍️') + ' ' + g.price, lab.x, lab.y, lab.z - dz);
    });
    try {
      if (typeof buildPlayer === 'function'){
        const k = buildPlayer(Object.assign({}, typeof DEF !== 'undefined' ? DEF : {}, {shirt:'#d8a040', pants:'#3a2a1a', hair:'curly', hairColor:'#3a2a1a', face:'smile', hat:'beret'}));
        k.g.position.set(s.x, 0.25, muWZ(sz - 4.9)); k.g.rotation.y = 0; scene.add(k.g); muKeep(k.g);
      }
    } catch(e){}
    muShopLab('🛍️ Fennick', s.x, 2.9, sz - 4.9);
    muShopLab('🛍️ Gift Corner', s.x, 4.2, sz - 4.4);
    mu.shiftZ = 0;
  }
  function muTokens(){
    mu.curZone = 'dest'; mu.shiftZ = 0;
    mu.tokenMeshes = {};
    (MuseumRules.MU_TOKENS||[]).forEach(t => {
      const g = new THREE.Group();
      const body = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.26, 0.07, 14), new THREE.MeshLambertMaterial({color:'#d8a040'}));
      body.rotation.x = Math.PI / 2; g.add(body);
      muGlow(body, '#d8a040', 0.35);
      [-0.09, 0.09].forEach(x => { const e = new THREE.Mesh(new THREE.SphereGeometry(0.05, 6, 5), new THREE.MeshLambertMaterial({color:'#3a2a1a'})); e.position.set(x, 0.05, 0.05); g.add(e); });
      g.position.set(t.x, 0.75, t.z); scene.add(g); muKeep(g);
      mu.tokenMeshes[t.id] = g;
    });
    // flower planter for the garden token
    const gt = (MuseumRules.MU_TOKENS||[]).find(t => t.id === 'owl-garden');
    if (gt){
      muMesh(new THREE.BoxGeometry(3.0, 0.5, 1.2), '#8a5a3a', gt.x, 0.3, gt.z - 0.5);
      [-1, -0.4, 0.3, 1].forEach((dx, i) => muMesh(new THREE.SphereGeometry(0.22, 6, 5), ['#ff6fb5', '#ffd23f', '#b48bff', '#ffffff'][i], gt.x + dx, 0.7, gt.z - 0.5));
    }
  }
  function muMakeBus(){ return (typeof ftMakeBus === 'function') ? ftMakeBus() : (function(){ const g=new THREE.Group(); const b=new THREE.Mesh(new THREE.BoxGeometry(3.6,2.2,7.2), new THREE.MeshLambertMaterial({color:'#f0c44a'})); b.position.y=1.3; g.add(b); return g; })(); }
  function buildMuseum(){
    const started = MuseumRules.muNewVisit(muState());
    mu = {trash:[], solids:[], zones:{}, sv: started.state, run: started.run, near:null, bus:null, homeBus:null, curZone:null, shiftZ:0, spin:[], planets:[], roof:[]};
    muSave(started.state);
    try { checkpoints[0] = {idx:0, spawn:{x:0,y:0.5,z:18}, flag:new THREE.Object3D()}; } catch(e){}
    muSky();
    const hemi = new THREE.HemisphereLight(0xf4f0ff, 0x4a6a3a, 0.3); scene.add(hemi); muKeep(hemi);
    const sun = new THREE.DirectionalLight('#fff4dc', 0.35); sun.position.set(-8, 18, 8); scene.add(sun); muKeep(sun);
    mu.curZone = 'yard'; mu.shiftZ = 0;
    muPlat(0, 0.14, 18, 52, 44, '#3f8f3a', 0.24);
    muPlat(0, 0.16, 16, 36, 28, '#4ea247', 0.16);
    // school yard only — the museum is a long bus ride away
    muMesh(new THREE.BoxGeometry(18, 8, 8), '#7a6aa0', 0, 4.1, 32);
    const roof = new THREE.Mesh(new THREE.ConeGeometry(13, 3.2, 4), new THREE.MeshLambertMaterial({color:'#4a3a68'}));
    roof.position.set(0, 10.1, 32); roof.rotation.y = Math.PI/4; scene.add(roof); muKeep(roof);
    muLab('🏫 Afterbell School', 0, 12.2, 26);
    const T = MuseumRules.MU_TEACHER;
    try {
      if (typeof buildPlayer === 'function'){
        const m = buildPlayer(Object.assign({}, typeof DEF !== 'undefined' ? DEF : {}, {body:'girl', head:'#e0ac69', shirt:'#c45c8a', pants:'#3a3f6a', pantsPat:'skirt', hair:'bun', hairColor:'#6b4226', face:'smile', shirtPat:null, hat:null}));
        m.g.position.set(T.x, 0.05, T.z);
        m.g.rotation.y = Math.atan2(0 - T.x, 18 - T.z);
        scene.add(m.g); muKeep(m.g);
      } else muMesh(new THREE.BoxGeometry(0.7,1.6,0.5), '#c45c8a', T.x, 0.9, T.z);
    } catch(e){ muMesh(new THREE.BoxGeometry(0.7,1.6,0.5), '#c45c8a', T.x, 0.9, T.z); }
    muLab('👩‍🏫 Ms. Bramble', T.x, 3.9, T.z);
    // meadow road, long enough that the school is out of view from Brightwhistle
    mu.curZone = 'road'; mu.shiftZ = 0;
    const path = MuseumRules.MU_RIDE_PATH || [];
    for (let i = 0; i < path.length - 1; i++){
      const a = path[i], b = path[i+1];
      const mx = (a.x+b.x)/2, mz=(a.z+b.z)/2;
      const len = Math.hypot(b.x-a.x, b.z-a.z)+1.6;
      const alongX = Math.abs(b.x-a.x) >= Math.abs(b.z-a.z);
      muPlat(mx, 0.18, mz, alongX ? len : 3.4, alongX ? 3.4 : len, '#2a2e33', 0.1);
      if (i >= 2 && len > 20){
        const side = (i % 2 ? 1 : -1) * 8;
        const n = Math.min(5, (len / 50) | 0) + 1;
        for (let s = 1; s < n; s++){
          const u = s / n;
          const tx = a.x + (b.x-a.x)*u + (alongX ? 0 : side);
          const tz = a.z + (b.z-a.z)*u + (alongX ? side : 0);
          muMesh(new THREE.SphereGeometry(1.1, 7, 5), '#3d8a3a', tx, 2.2, tz);
          muMesh(new THREE.CylinderGeometry(0.25, 0.32, 2.2, 7), '#6b3a1d', tx, 1.1, tz);
        }
      }
    }
    muLab('🌾 Meadow road', 28, 2.2, -60);
    mu.curZone = 'yard';
    const bus = muMakeBus();
    bus.position.set(MuseumRules.MU_BUS.x, 0, MuseumRules.MU_BUS.z);
    scene.add(bus); mu.bus = bus; // traveling bus is never zone-hidden
    muLab('🚌 Afterbell bus', MuseumRules.MU_BUS.x, 3.6, MuseumRules.MU_BUS.z);
    // the museum and its grounds
    muHallBuilding();
    mu.curZone = 'dest'; mu.shiftZ = MuseumRules.MU_DEST_DZ || 0;
    muHorizonLand(0, MuseumRules.muZ(-30));
    mu.curZone = 'dest'; mu.shiftZ = MuseumRules.MU_DEST_DZ || 0;
    muPlat(0, 0.16, -14, 40, 22, '#62b050', 0.16);
    muPlat(0, 0.2, -10, 4, 18, '#d8d0c0', 0.12);
    // little fountain on the lawn
    muMesh(new THREE.CylinderGeometry(1.4, 1.6, 0.5, 16), '#c8c0b0', 9, 0.45, -14);
    muMesh(new THREE.CylinderGeometry(1.2, 1.2, 0.1, 16), '#7ad0e8', 9, 0.68, -14);
    muMesh(new THREE.CylinderGeometry(0.16, 0.2, 1.3, 8), '#c8c0b0', 9, 1.2, -14);
    muDino(0, -38);
    muCase(-16.0, -27, '💎 Glowstone geode', 'gem');
    muCase(-16.0, -44, '☄️ Moonpebble meteorite', 'meteor');
    muOrbit(15.6, -44);
    muMurals(-50.6);
    mu.shiftZ = 0;
    muGiftShop();
    muTokens();
    mu.curZone = 'dest'; mu.shiftZ = 0;
    const G = MuseumRules.MU_GUIDE;
    try {
      if (typeof buildPlayer === 'function'){
        const m = buildPlayer(Object.assign({}, typeof DEF !== 'undefined' ? DEF : {}, {shirt:'#7a4a8a', pants:'#2a2a4a', hair:'long', hairColor:'#c0c0c0', face:'smile', hat:null}));
        m.g.position.set(G.x, 0.25, G.z);
        m.g.rotation.y = Math.atan2(MuseumRules.MU_ARRIVE.x - G.x, MuseumRules.MU_ARRIVE.z - G.z);
        scene.add(m.g); muKeep(m.g);
      } else muMesh(new THREE.BoxGeometry(0.7,1.6,0.5), '#7a4a8a', G.x, 0.9, G.z);
    } catch(e){ muMesh(new THREE.BoxGeometry(0.7,1.6,0.5), '#7a4a8a', G.x, 0.9, G.z); }
    muLab('🧭 Curator Odessa', G.x, 3.9, G.z);
    const home = muMakeBus();
    home.position.set(MuseumRules.MU_HOME_BUS.x, 0, MuseumRules.MU_HOME_BUS.z);
    home.visible = false; scene.add(home); muKeep(home); mu.homeBus = home;
    muLab('🚌 Front gate', MuseumRules.MU_HOME_BUS.x + 3.2, 3.4, MuseumRules.MU_HOME_BUS.z);
    if (P){ P.x=0; P.y=0.5; P.z=18; P.vx=0; P.vz=0; P.vy=0; }
    if (typeof cam !== 'undefined' && cam){ cam.yaw=0; cam.pitch=0.16; cam.dist=10; }
    const box=document.getElementById('muBox'); if(box) box.style.display='block';
    banner('🦉 Museum day! Board the Afterbell bus to Brightwhistle Museum of Wonders, see five exhibits, and hunt for brass owl tokens.');
    mu.curZone = null;
    muApplyZones((mu.run && mu.run.phase) || 'yard');
    muHud();
  }
  function muEnter(){
    if (P){ P.x=0; P.y=0.5; P.z=18; P.vx=0; P.vz=0; P.vy=0; }
    if (typeof cam !== 'undefined' && cam){ cam.yaw=0; cam.pitch=0.16; cam.dist=10; }
    muSky();
  }
  function muPaint(){
    if (!mu) return;
    const destOn = !!(mu.run && (mu.run.phase === 'hall' || mu.run.phase === 'ride'));
    if (mu.homeBus) mu.homeBus.visible = destOn && MuseumRules.muAll(mu.sv) && mu.run && mu.run.phase === 'hall';
    Object.keys(mu.tokenMeshes || {}).forEach(id => { const m = mu.tokenMeshes[id]; if (m) m.visible = destOn && !MuseumRules.muHasToken(mu.sv, id); });
    const inside = !!(P && mu.run && mu.run.phase === 'hall' && MuseumRules.muInHall(P.x, P.z));
    (mu.roof || []).forEach(m => { if (m) m.visible = destOn && !inside; });
  }
  function muRideVis(hide){
    try {
      if (typeof model !== 'undefined' && model){
        if (model.g) model.g.visible = !hide;
        else if (model.visible != null) model.visible = !hide;
      }
    } catch(e){}
  }
  function muSeat(pose){
    if (!P || !pose) return;
    const along = -2.15;
    const cy = Math.cos(pose.yaw || 0), sy = Math.sin(pose.yaw || 0);
    P.x = pose.x + along * sy;
    P.z = pose.z + along * cy;
    P.y = 1.42; P.vx = P.vz = P.vy = 0;
    muRideVis(true);
    if (typeof cam !== 'undefined' && cam){ cam.yaw = Math.atan2(-sy, -cy); cam.pitch = 0.08; cam.dist = 0.22; }
    if (mu.bus){ mu.bus.position.set(pose.x, 0, pose.z); mu.bus.rotation.y = pose.yaw || 0; }
  }
  function muRideCam(){
    if (!mu || !mu.run || mu.run.phase !== 'ride' || typeof camera === 'undefined' || !camera) return false;
    const pose = MuseumRules.muRidePose(mu.run);
    if (!pose) return false;
    const cy = Math.cos(pose.yaw || 0), sy = Math.sin(pose.yaw || 0);
    const along = -1.5, ey = 1.55;
    const x = pose.x + along * sy, z = pose.z + along * cy;
    camera.position.set(x, ey, z);
    camera.lookAt(x + sy * 10, ey - 0.35, z + cy * 10);
    (mu.trash||[]).forEach(m => { if (m && m.userData && m.userData.muLab) m.visible = false; });
    return true;
  }
  function muSetCoins(n){ try { if (typeof setCoins === 'function') setCoins(n); else { coins = n; if (typeof save === 'function') save('rubloxCoins', coins); } } catch(e){} }
  function muPay(n){ if (n && typeof coins !== 'undefined') muSetCoins(coins + n); }
  function muChime(notes){ try { if (typeof beep === 'function') beep(notes, .09, 'triangle', .06); } catch(e){} }
  function muAct(){
    if (!mu) return;
    const hit = MuseumRules.muNear(P.x, P.z, mu.sv, mu.run);
    if (!hit) return;
    if (hit.kind === 'talk'){ banner(hit.text); return; }
    if (hit.kind === 'bus'){
      const r = MuseumRules.muBoardBus(mu.run);
      if (r.ok){ banner('🚌 All aboard! Sit tight — the meadow road leads to Brightwhistle Museum.'); muSeat(MuseumRules.muRidePose(mu.run)); }
      return;
    }
    if (hit.kind === 'find'){
      const r = MuseumRules.muPick(mu.sv, hit.id);
      if (!r.ok) return;
      mu.sv = r.state; muSave(mu.sv); muPaint();
      muChime([523, 659, 784]);
      banner((hit.emoji||'🔍') + ' ' + (r.item && r.item.blurb ? r.item.blurb : hit.name) + (r.left ? ('  (' + (MuseumRules.MU_FINDS.length - r.left) + '/' + MuseumRules.MU_FINDS.length + ')') : '  All five! Meet the bus at the front gate.'));
      return;
    }
    if (hit.kind === 'token'){
      const r = MuseumRules.muTakeToken(mu.sv, hit.id);
      if (!r.ok){ banner('🦉 You already found that owl token.'); return; }
      mu.sv = r.state; muSave(mu.sv); muPay(r.coins); muPaint();
      muChime(r.bonus ? [659, 784, 988, 1319] : [880, 1175]);
      banner('🦉 Owl token ' + r.n + '/' + MuseumRules.MU_TOKENS.length + '!  +' + (r.coins - r.bonus) + ' 🪙' + (r.bonus ? ('  You found every owl! Hunt bonus +' + r.bonus + ' 🪙') : ''));
      return;
    }
    if (hit.kind === 'gift'){
      const have = (typeof coins !== 'undefined') ? coins : 0;
      const r = MuseumRules.muBuyGift(mu.sv, hit.id, have);
      if (!r.ok){
        if (r.already) banner('🛍️ You already have the ' + (r.item && r.item.name || hit.name) + '.');
        else if (r.why === 'coins') banner('🪙 Need ' + r.need + ' more coins for the ' + (r.item && r.item.name || hit.name) + '.');
        else banner('🛍️ That souvenir is not for sale right now.');
        return;
      }
      mu.sv = r.state; muSave(mu.sv);
      if (typeof coins !== 'undefined') muSetCoins(r.coins);
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
      const r = MuseumRules.muBoardHome(mu.run, mu.sv);
      if (!r.ok){ banner('Curator Odessa is still waiting on a few exhibits.'); return; }
      mu.sv = r.state; muSave(mu.sv);
      muPay(r.coins);
      banner((r.message || 'Bus ride home!') + (r.coins ? ('  +' + r.coins + ' 🪙') : ''));
      if (P){ P.x=0; P.z=18; P.y=0.5; }
      if (mu.bus){ mu.bus.position.set(MuseumRules.MU_BUS.x, 0, MuseumRules.MU_BUS.z); mu.bus.rotation.y = 0; }
      muApplyZones('done');
      if (typeof cam !== 'undefined' && cam){ cam.yaw=0; cam.pitch=0.16; cam.dist=10; }
    }
  }
  function muUpdate(dt){
    if (!mu) return;
    muSky();
    const tt = (mu.t = (mu.t || 0) + dt);
    (mu.spin||[]).forEach(s => { if (s.m) s.m.rotation.y += (s.s || 0.15) * dt; });
    (mu.planets||[]).forEach(p => { p.a += p.spd * dt * 0.6; if (p.m) p.m.position.set(p.cx + Math.cos(p.a) * p.r, 3.1, p.cz + Math.sin(p.a) * p.r); });
    Object.keys(mu.tokenMeshes || {}).forEach((id, i) => { const m = mu.tokenMeshes[id]; if (m && m.visible){ m.rotation.y = tt * 1.6 + i; m.position.y = 0.75 + Math.sin(tt * 2 + i) * 0.08; } });
    if (mu.run.phase === 'ride'){
      MuseumRules.muTickRide(mu.run, dt);
      muSeat(MuseumRules.muRidePose(mu.run));
      if (mu.run.phase === 'hall'){
        const a = MuseumRules.MU_ARRIVE;
        if (P){ P.x=a.x; P.y=0.5; P.z=a.z; P.vx=0; P.vz=0; }
        if (typeof cam!=='undefined' && cam){ cam.yaw=0.15; cam.pitch=0.16; cam.dist=9; }
        muRideVis(false);
        if (mu.bus){ mu.bus.position.set(MuseumRules.MU_HOME_BUS.x, 0, MuseumRules.MU_HOME_BUS.z); mu.bus.rotation.y = Math.PI; }
        banner('🦉 Welcome to Brightwhistle Museum of Wonders! Curator Odessa is by the steps. See five exhibits and look for five brass owl tokens.');
        muApplyZones('hall');
      }
    }
    if (P && P.y < -8){ P.x=0; P.y=0.5; P.z = (mu.run && mu.run.phase === 'hall') ? MuseumRules.MU_ARRIVE.z : 18; P.vx=P.vz=P.vy=0; }
    muApplyZones(mu.run && mu.run.phase);
    mu.near = MuseumRules.muNear(P ? P.x : 0, P ? P.z : 0, mu.sv, mu.run);
    muHud(MuseumRules.muGoal(mu.sv, mu.run));
  }
  function muKey(e){
    if (!mu || e.repeat) return false;
    if (e.code === 'KeyE' || e.code === 'KeyF' || e.key === 'e' || e.key === 'f'){ muAct(); return true; }
    return false;
  }
  function muPad(jp){
    if (!mu || !jp) return false;
    if (!mu._x && (jp[2] || jp[3])){ mu._x = true; muAct(); return true; }
    if (!jp[2] && !jp[3]) mu._x = false;
    return false;
  }
  function museumStop(){
    muRideVis(false);
    if (!mu) return;
    (mu.solids||[]).forEach(b => { try{ b.active=false; if (typeof solids!=='undefined'){ const i=solids.indexOf(b); if(i>=0) solids.splice(i,1);} }catch(e){} });
    (mu.trash||[]).forEach(m => { try{ scene.remove(m);}catch(e){} });
    if (mu.bus){ try { scene.remove(mu.bus); } catch(e){} }
    mu=null;
    const box=document.getElementById('muBox'); if(box) box.style.display='none';
    const act=document.getElementById('muAct'); if(act) act.classList.remove('show');
  }
  if (typeof window !== 'undefined') window.muDebug = {
    probe(){ if (!mu) return null; return {phase: mu.run && mu.run.phase, found: ((mu.sv && mu.sv.found)||[]).slice(), tokens: ((mu.sv && mu.sv.tokens)||[]).slice(), huntDone: !!(mu.sv && mu.sv.huntDone), won: !!(mu.sv && mu.sv.won), gifts: ((mu.sv && mu.sv.gifts)||[]).slice(), P: P ? {x:P.x,y:P.y,z:P.z} : null, near: mu.near && mu.near.kind}; },
    hall(){ if (!mu) return; mu.run.phase='hall'; mu.run.rideT=MuseumRules.MU_RIDE_T; const a=MuseumRules.MU_ARRIVE; if(P){P.x=a.x;P.y=0.5;P.z=a.z;} if (typeof cam!=='undefined' && cam){ cam.yaw=0.15; cam.pitch=0.16; cam.dist=12; } muRideVis(false); muApplyZones('hall'); },
    outside(){ if (!mu) return; this.hall(); if(P){P.x=6;P.z=MuseumRules.muZ(-4);} if (typeof cam!=='undefined' && cam){ cam.yaw=-0.25; cam.pitch=0.12; cam.dist=16; } muApplyZones('hall'); },
    inside(){ if (!mu) return; mu.run.phase='hall'; muRideVis(false); if(P){P.x=0;P.y=0.5;P.z=MuseumRules.muZ(-25);P.vx=0;P.vz=0;} if (typeof cam!=='undefined' && cam){ cam.yaw=0; cam.pitch=0.2; cam.dist=7; } muApplyZones('hall'); },
    lookBack(){ if (!mu) return; this.hall(); if (typeof cam!=='undefined' && cam){ cam.yaw=Math.PI; cam.pitch=0.1; cam.dist=10; } },
    ride(t){ if (!mu) return; mu.run.phase='ride'; mu.run.rideT=(t==null?3.2:t); muSeat(MuseumRules.muRidePose(mu.run)); muRideVis(true); muApplyZones('ride'); },
    cam(yaw, pitch, dist){ if (typeof cam !== 'undefined' && cam){ if (yaw != null) cam.yaw = yaw; if (pitch != null) cam.pitch = pitch; if (dist != null) cam.dist = dist; } },
    shop(){ if (!mu) return; mu.run.phase='hall'; muRideVis(false); const s=MuseumRules.MU_SHOP; if(P){P.x=s.x;P.y=0.5;P.z=s.z+2.5;P.vx=0;P.vz=0;} if (typeof cam!=='undefined' && cam){ cam.yaw=0; cam.pitch=0.2; cam.dist=6; } muApplyZones('hall'); },
    go(id){
      if (!mu || !P) return;
      const M = MuseumRules;
      const map = {bus:M.MU_BUS, home:M.MU_HOME_BUS, teacher:M.MU_TEACHER, odessa:M.MU_GUIDE, arrive:M.MU_ARRIVE, shop:M.MU_SHOP};
      const t = M.muFind(id) || M.muToken(id) || M.muGift(id) || map[id];
      if (!t) return;
      if (mu.run.phase === 'yard' && t !== M.MU_BUS && t !== M.MU_TEACHER){ mu.run.phase = 'hall'; muRideVis(false); }
      P.x=t.x; P.y=0.5; P.z=t.z; P.vx=0; P.vz=0; P.vy=0;
      muApplyZones(mu.run.phase);
    },
    act(){ muAct(); return this.probe(); },
    stand(x, z){ if (!mu || !P) return; P.x = x; P.z = z; P.y = 0.5; P.vx = 0; P.vz = 0; },
    face(x, z, pitch, dist){ if (!mu || !P || typeof cam === 'undefined' || !cam) return; cam.yaw = Math.atan2(P.x - x, P.z - z); if (pitch != null) cam.pitch = pitch; if (dist != null) cam.dist = dist; }
  };
  try {
    const act=document.getElementById('muAct'); if(act && !act.__mu){ act.__mu=true; act.onclick=ev=>{ev.preventDefault();ev.stopPropagation();muAct();}; }
  } catch(e){}
