  /* ===================== t242u: 🏡 DREAM HOUSE BUILDERS — own plot, grid-snap house building ===================== */
  const DH_KEY = 'rubloxDreamHouse', DH_CELL = 1.4, DH_N = 8, DH_PLOTS = 4, DH_SPACING = 18, DH_GRANT = 80;
  const DH_COLORS = ['#f6e3b4', '#ffb3c7', '#bfe3ff', '#c8f0c0', '#ffe08a', '#c39bff', '#ff9f6b', '#fffaf0', '#d4a574', '#7fd6ff'];
  const DH_PARTS = [
    {id: 'floor',  e: '🟫', name: 'Floor',  cost: 2,  kind: 'floor'},
    {id: 'wall',   e: '🧱', name: 'Wall',   cost: 3,  kind: 'wall'},
    {id: 'door',   e: '🚪', name: 'Door',   cost: 6,  kind: 'wall'},
    {id: 'window', e: '🪟', name: 'Window', cost: 5,  kind: 'wall'},
    {id: 'stairs', e: '🪜', name: 'Stairs', cost: 8,  kind: 'wall'},
    {id: 'roof',   e: '🏠', name: 'Roof',   cost: 4,  kind: 'roof'},
    {id: 'sofa',   e: '🛋️', name: 'Sofa',   cost: 10, kind: 'furn'},
    {id: 'bed',    e: '🛏️', name: 'Bed',    cost: 12, kind: 'furn'},
    {id: 'table',  e: '🪑', name: 'Table',  cost: 8,  kind: 'furn'},
    {id: 'lamp',   e: '💡', name: 'Lamp',   cost: 6,  kind: 'furn'},
    {id: 'plant',  e: '🪴', name: 'Plant',  cost: 4,  kind: 'furn'},
    {id: 'rug',    e: '🧶', name: 'Rug',    cost: 5,  kind: 'floor'}
  ];
  const DH_GOALS = [
    {id: 'floors',   name: 'Lay a floor',        need: p => dhCount(p, 'floor') >= 6,  pay: 15},
    {id: 'walls',    name: 'Raise the walls',    need: p => dhCount(p, 'wall') >= 8,   pay: 20},
    {id: 'door',     name: 'Hang a front door',  need: p => dhCount(p, 'door') >= 1,   pay: 15},
    {id: 'roof',     name: 'Put a roof on it',   need: p => dhCount(p, 'roof') >= 6,   pay: 25},
    {id: 'furnish',  name: 'Furnish a room',     need: p => dhCountKind(p, 'furn') >= 3, pay: 30},
    {id: 'upstairs', name: 'Build a 2nd story',  need: p => p.some(x => x[2] >= 3) && dhCount(p, 'stairs') >= 1, pay: 40},
    {id: 'open',     name: 'Open house day',     need: p => dhCount(p, 'door') >= 1 && dhCount(p, 'roof') >= 4 && dhCountKind(p, 'furn') >= 2, pay: 50}
  ];
  let dh = null;
  function dhProg(){
    const o = load(DH_KEY, null), r = o && typeof o === 'object' ? o : {};
    const pieces = Array.isArray(r.pieces) ? r.pieces.filter(a => Array.isArray(a) && a.length >= 4) : [];
    const goals = r.goals && typeof r.goals === 'object' ? r.goals : {};
    return {pieces, goals, coins: Math.max(0, +r.coins || 0), likes: Math.max(0, r.likes | 0), granted: !!r.granted};
  }
  function dhSave(extra){
    if (!dh) return;
    const p = dhProg();
    p.pieces = dhSerialize(dh.mine);
    p.goals = dh.goals;
    p.coins = dh.bank;
    p.likes = dh.likes | 0;
    p.granted = true;
    if (extra) Object.assign(p, extra);
    save(DH_KEY, p);
  }
  function dhWho(){ return (typeof mp !== 'undefined' && mp && mp.on && mp.uid) ? String(mp.uid) : 'local'; }
  function dhIsGuest(){ return !!(typeof mp !== 'undefined' && mp && mp.on && typeof mpGuest === 'function' && mpGuest()); }
  function dhOrigin(plot){ return [(plot - 1.5) * DH_SPACING, -DH_N * DH_CELL / 2]; }
  function dhCellWorld(plot, ix, iy, iz){
    const [ox, oz] = dhOrigin(plot);
    const story = Math.floor(iy / 3), typ = iy % 3;
    const y0 = story * 2.3;
    const y = typ === 0 ? y0 + .12 : typ === 1 ? y0 + 1.15 : y0 + 2.2;
    return {x: ox + (ix + .5) * DH_CELL, y, z: oz + (iz + .5) * DH_CELL, story, typ};
  }
  function dhPlotAt(x, z){
    for (let i = 0; i < DH_PLOTS; i++){
      const [ox, oz] = dhOrigin(i);
      if (x >= ox && x < ox + DH_N * DH_CELL && z >= oz && z < oz + DH_N * DH_CELL) return i;
    }
    return -1;
  }
  function dhCount(pieces, id){ return (pieces || []).filter(a => DH_PARTS[a[0]] && DH_PARTS[a[0]].id === id).length; }
  function dhCountKind(pieces, kind){ return (pieces || []).filter(a => DH_PARTS[a[0]] && DH_PARTS[a[0]].kind === kind).length; }
  function dhPart(id){ return DH_PARTS.find(p => p.id === id) || DH_PARTS[0]; }
  function dhKeyOf(ix, iy, iz){ return ix + ',' + iy + ',' + iz; }
  function dhMat(col, opts){ return new THREE.MeshLambertMaterial(Object.assign({color: col}, opts || {})); }
  function dhTint(i){ return DH_COLORS[((i | 0) % DH_COLORS.length + DH_COLORS.length) % DH_COLORS.length]; }

  function dhMeshFor(rec, plot){
    const part = DH_PARTS[rec[0]] || DH_PARTS[0], col = dhTint(rec[5] | 0), g = new THREE.Group();
    const rot = (rec[4] | 0) % 4, w = dhCellWorld(plot, rec[1], rec[2], rec[3]);
    g.position.set(w.x, w.y, w.z); g.rotation.y = rot * Math.PI / 2;
    const coat = dhMat(col), dark = dhMat('#5a4030'), glass = dhMat('#bfe9ff', {transparent: true, opacity: .45, depthWrite: false});
    const add = (mesh, x, y, z) => { mesh.position.set(x || 0, y || 0, z || 0); g.add(mesh); return mesh; };
    const box = (sx, sy, sz, mat) => new THREE.Mesh(new THREE.BoxGeometry(sx, sy, sz), mat || coat);
    let solidsLocal = [];
    const solid = (sx, sy, sz, lx, ly, lz, mat) => {
      const m = add(box(sx, sy, sz, mat), lx, ly, lz);
      solidsLocal.push({mesh: m, hw: sx / 2, hh: sy / 2, hd: sz / 2, ox: lx || 0, oy: ly || 0, oz: lz || 0});
      return m;
    };
    const id = part.id;
    if (id === 'floor'){ solid(DH_CELL, .18, DH_CELL, 0, 0, 0); }
    else if (id === 'rug'){ add(box(DH_CELL * .9, .04, DH_CELL * .7, dhMat(col)), 0, .1, 0); }
    else if (id === 'wall'){ solid(DH_CELL, 2.1, .22, 0, 0, DH_CELL * .35); }
    else if (id === 'door'){
      solid(.28, 2.0, .22, -DH_CELL * .35, 0, DH_CELL * .35);
      solid(.28, 2.0, .22, DH_CELL * .35, 0, DH_CELL * .35);
      add(box(DH_CELL * .9, .22, .22), 0, .95, DH_CELL * .35);
      add(box(.55, 1.55, .08, dhMat('#8b4513')), 0, -.15, DH_CELL * .35);
    }
    else if (id === 'window'){
      solid(DH_CELL, .4, .22, 0, -.75, DH_CELL * .35);
      solid(DH_CELL, .4, .22, 0, .85, DH_CELL * .35);
      solid(.2, 1.3, .22, -DH_CELL * .4, .05, DH_CELL * .35);
      solid(.2, 1.3, .22, DH_CELL * .4, .05, DH_CELL * .35);
      add(box(DH_CELL * .7, 1.1, .08, glass), 0, .05, DH_CELL * .35);
    }
    else if (id === 'stairs'){
      for (let s = 0; s < 4; s++) solid(DH_CELL * .7, .28, .4, 0, -.7 + s * .5, .5 - s * .35);
    }
    else if (id === 'roof'){
      const r = box(DH_CELL * 1.15, .22, DH_CELL * 1.15); r.rotation.x = .45; add(r, 0, .1, 0); solidsLocal.push({mesh: r, hw: DH_CELL / 2, hh: .2, hd: DH_CELL / 2, ox: 0, oy: .1, oz: 0});
    }
    else if (id === 'sofa'){
      solid(.95, .32, .5, 0, -.2, 0); add(box(.95, .35, .16), 0, .08, -.22); add(box(.14, .35, .5), -.42, .08, 0); add(box(.14, .35, .5), .42, .08, 0);
    }
    else if (id === 'bed'){
      solid(1.1, .28, .7, 0, -.25, 0, dhMat('#fffaf0')); add(box(.4, .18, .68, dhMat('#ffe0ef')), 0, -.02, .28);
    }
    else if (id === 'table'){
      add(box(.7, .08, .7), 0, .1, 0); [[-.28, -.28], [.28, -.28], [-.28, .28], [.28, .28]].forEach(([x, z]) => add(box(.08, .42, .08, dark), x, -.15, z));
      solidsLocal.push({mesh: g, hw: .35, hh: .3, hd: .35, ox: 0, oy: 0, oz: 0});
    }
    else if (id === 'lamp'){
      add(box(.12, .7, .12, dark), 0, -.1, 0); add(new THREE.Mesh(new THREE.SphereGeometry(.16, 10, 8), dhMat('#ffe08a', {emissive: '#ffe08a', emissiveIntensity: .4})), 0, .35, 0);
    }
    else if (id === 'plant'){
      add(box(.22, .16, .22, dark), 0, -.45, 0); add(new THREE.Mesh(new THREE.SphereGeometry(.22, 8, 6), dhMat('#2ec27e')), 0, -.15, 0);
    }
    g.userData.solids = solidsLocal; g.userData.rec = rec.slice(); g.userData.plot = plot;
    return g;
  }
  function dhBindSolids(mesh, on){
    const list = (mesh && mesh.userData && mesh.userData.solids) || [];
    list.forEach(s => {
      const world = mesh.position;
      const b = {mesh: {position: {x: world.x + (s.ox || 0), y: world.y + (s.oy || 0), z: world.z + (s.oz || 0)}}, hw: s.hw, hh: s.hh, hd: s.hd, active: true, dx: 0, dy: 0, dz: 0, _dh: mesh};
      // keep the actual mesh reference so collision uses the group position + offset via a wrapper object that plat-like solids understand
      b.mesh = s.mesh; s.mesh.userData = s.mesh.userData || {};
      if (on){ if (typeof solids !== 'undefined') solids.push(b); s._solid = b; }
      else if (s._solid && typeof solids !== 'undefined'){ const i = solids.indexOf(s._solid); if (i >= 0) solids.splice(i, 1); s._solid = null; }
    });
  }
  function dhAssignPlot(){
    if (typeof mp !== 'undefined' && mp && mp.on){
      const ids = [dhWho()].concat((mp.roster && mp.roster()) || (mp.peers && Object.keys(mp.peers)) || []).filter(Boolean);
      const uniq = []; ids.forEach(id => { if (uniq.indexOf(id) < 0) uniq.push(id); });
      const i = Math.max(0, uniq.indexOf(dhWho()));
      return i % DH_PLOTS;
    }
    return 0;
  }

  function buildDreamHouse(){
    dh = {mine: 0, story: 0, sel: 0, color: 0, rot: 0, tool: 'place', aim: null, pieces: {}, meshes: {}, ghost: null, bank: 0, likes: 0, goals: {}, earned: 0, near: -1, liked: {}, saveT: 0, remote: dhIsGuest(), layerBump: 0};
    scene.background = new THREE.Color('#b8e8ff');
    if (scene.fog){ scene.fog.color = new THREE.Color('#d7f3ff'); scene.fog.near = 50; scene.fog.far = 160; }
    plat(0, 0, 0, 90, 50, '#8fd39a', .35);
    plat(0, .15, 14, 80, 6, '#cfc4a8', .2);
    const p0 = dhProg();
    dh.bank = p0.coins; dh.likes = p0.likes; dh.goals = Object.assign({}, p0.goals);
    if (!p0.granted){ dh.bank += DH_GRANT; if (typeof setCoins === 'function') setCoins((typeof coins === 'number' ? coins : 0) + DH_GRANT); dh.grantedNow = true; }
    dh.mine = dhAssignPlot();
    for (let i = 0; i < DH_PLOTS; i++){
      const [ox, oz] = dhOrigin(i);
      const cx = ox + DH_N * DH_CELL / 2, cz = oz + DH_N * DH_CELL / 2;
      plat(cx, .08, cz, DH_N * DH_CELL + .4, DH_N * DH_CELL + .4, i === dh.mine ? '#b6e8a8' : '#9fd3a8', .16);
      [[ox - .15, cz, .3, DH_N * DH_CELL + .6], [ox + DH_N * DH_CELL + .15, cz, .3, DH_N * DH_CELL + .6], [cx, oz - .15, DH_N * DH_CELL + .6, .3], [cx, oz + DH_N * DH_CELL + .15, DH_N * DH_CELL + .6, .3]].forEach(([x, z, w, d]) => plat(x, .45, z, w, d, '#fffaf0', .5));
      const sign = label((i === dh.mine ? '🏡 Your Plot' : '🏡 Plot ' + (i + 1)), 'rgba(29,35,64,.92)');
      if (sign && sign.position) sign.position.set(cx, 2.2, oz - .6);
      if (typeof scene !== 'undefined' && sign) scene.add(sign);
      dh.pieces[i] = []; dh.meshes[i] = [];
    }
    // SP only: modest model cottages on the other plots (decor, not other players)
    if (!(typeof mp !== 'undefined' && mp && mp.on)){
      [1, 2, 3].forEach((plot, n) => dhSeedShowHome(plot, n));
    }
    (p0.pieces || []).forEach(rec => dhPut(dh.mine, rec, true));
    const [ox, oz] = dhOrigin(dh.mine);
    const sp = {x: ox + DH_CELL * 4, y: .05, z: oz - 2.5};
    Object.assign(P, {x: sp.x, y: sp.y, z: sp.z, vx: 0, vy: 0, vz: 0}); P.face = 0; cam.yaw = Math.PI; cam.pitch = .38; cam.dist = 12;
    checkpoints[0] = {idx: 0, spawn: sp, flag: new THREE.Object3D()};
    const gm = new THREE.MeshLambertMaterial({color: '#ffffff', transparent: true, opacity: .38, depthWrite: false});
    dh.ghost = new THREE.Mesh(new THREE.BoxGeometry(DH_CELL * .95, .2, DH_CELL * .95), gm);
    dh.ghost.visible = false; scene.add(dh.ghost);
    dhHud(); dhBar();
  }
  function dhSeedShowHome(plot, n){
    const pal = (n + 2) % DH_COLORS.length;
    const floor = [[2,0,2],[3,0,2],[4,0,2],[2,0,3],[3,0,3],[4,0,3],[2,0,4],[3,0,4],[4,0,4]];
    floor.forEach(([x, y, z]) => dhPut(plot, [0, x, y, z, 0, pal], true));
    [[2,1,2,1],[4,1,2,1],[2,1,4,3],[4,1,4,3],[2,1,3,2],[4,1,3,0],[3,1,4,0]].forEach(([x, y, z, r], i) => dhPut(plot, [i === 6 ? 2 : 1, x, y, z, r, pal], true));
    [[2,2,2],[3,2,2],[4,2,2],[2,2,3],[3,2,3],[4,2,3],[2,2,4],[3,2,4],[4,2,4]].forEach(([x, y, z]) => dhPut(plot, [5, x, y, z, 0, pal], true));
    dhPut(plot, [6, 3, 1, 3, 0, (pal + 1) % DH_COLORS.length], true);
    dhPut(plot, [10, 2, 1, 3, 0, 3], true);
  }
  function dhPut(plot, rec, quiet){
    if (!dh || plot < 0 || plot >= DH_PLOTS) return null;
    rec = rec.slice(); rec[0] = rec[0] | 0; rec[1] = rec[1] | 0; rec[2] = rec[2] | 0; rec[3] = rec[3] | 0; rec[4] = (rec[4] | 0) % 4; rec[5] = rec[5] | 0;
    if (rec[1] < 0 || rec[3] < 0 || rec[1] >= DH_N || rec[3] >= DH_N || rec[2] < 0 || rec[2] > 8) return null;
    const k = dhKeyOf(rec[1], rec[2], rec[3]);
    if ((dh.pieces[plot] || []).some(a => dhKeyOf(a[1], a[2], a[3]) === k)) return null;
    const mesh = dhMeshFor(rec, plot);
    if (typeof scene !== 'undefined') scene.add(mesh);
    dhBindSolids(mesh, true);
    dh.pieces[plot] = dh.pieces[plot] || []; dh.meshes[plot] = dh.meshes[plot] || [];
    dh.pieces[plot].push(rec); dh.meshes[plot].push(mesh);
    if (!quiet && plot === dh.mine){ dhCheckGoals(); dhSave(); }
    return mesh;
  }
  function dhRemoveAt(plot, ix, iy, iz, quiet){
    if (!dh) return false;
    const k = dhKeyOf(ix, iy, iz);
    const list = dh.pieces[plot] || [];
    const idx = list.findIndex(a => dhKeyOf(a[1], a[2], a[3]) === k);
    if (idx < 0) return false;
    const mesh = (dh.meshes[plot] || [])[idx];
    if (mesh){ dhBindSolids(mesh, false); if (typeof scene !== 'undefined') scene.remove(mesh); }
    list.splice(idx, 1); (dh.meshes[plot] || []).splice(idx, 1);
    if (!quiet && plot === dh.mine) dhSave();
    return true;
  }
  function dhSerialize(plot){ return (dh && dh.pieces[plot] ? dh.pieces[plot] : []).map(a => a.slice()); }
  function dhClearPlot(plot){
    (dh.meshes[plot] || []).slice().forEach(() => {
      const rec = dh.pieces[plot] && dh.pieces[plot][0];
      if (rec) dhRemoveAt(plot, rec[1], rec[2], rec[3], true);
    });
  }
  function dhApplyPlot(plot, recs, quiet){
    dhClearPlot(plot);
    (recs || []).forEach(r => dhPut(plot, r, true));
    if (!quiet && plot === dh.mine) dhSave();
  }
  function dhAim(){
    if (!dh) return null;
    const face = (P && P.face) || 0;
    const wx = (P.x || 0) + Math.sin(face) * 2.1, wz = (P.z || 0) + Math.cos(face) * 2.1;
    const plot = dhPlotAt(wx, wz);
    if (plot < 0) return null;
    const [ox, oz] = dhOrigin(plot);
    const ix = Math.round((wx - ox) / DH_CELL - .5), iz = Math.round((wz - oz) / DH_CELL - .5);
    if (ix < 0 || iz < 0 || ix >= DH_N || iz >= DH_N) return null;
    const part = DH_PARTS[dh.sel] || DH_PARTS[0];
    const typ = part.kind === 'floor' ? 0 : part.kind === 'roof' ? 2 : 1;
    const iy = dh.story * 3 + typ;
    return {plot, ix, iy, iz, rec: [dh.sel, ix, iy, iz, dh.rot | 0, dh.color | 0]};
  }
  function dhOccupied(plot, ix, iy, iz){ return (dh.pieces[plot] || []).some(a => a[1] === ix && a[2] === iy && a[3] === iz); }
  function dhCanBuild(aim){ return !!(aim && aim.plot === dh.mine); }
  function dhPay(cost){
    const global = (typeof coins === 'number' ? coins : 0);
    if (dh.bank >= cost){ dh.bank -= cost; return true; }
    if (global >= cost && typeof setCoins === 'function'){ setCoins(global - cost); return true; }
    if (dh.bank + global >= cost && typeof setCoins === 'function'){ const use = cost - dh.bank; dh.bank = 0; setCoins(global - use); return true; }
    return false;
  }
  function dhPlace(){
    if (!dh) return false;
    const aim = dh.aim || dhAim();
    if (!dhCanBuild(aim)) return false;
    if (dh.tool === 'delete'){ const ok = dhRemoveAt(aim.plot, aim.ix, aim.iy, aim.iz); if (ok){ dhNet('del', aim); dhHud(); } return ok; }
    if (dh.tool === 'paint'){
      const hit = (dh.pieces[aim.plot] || []).find(a => a[1] === aim.ix && a[3] === aim.iz && Math.abs(a[2] - aim.iy) <= 1);
      if (!hit) return false;
      hit[5] = dh.color | 0; dhApplyPlot(aim.plot, dh.pieces[aim.plot], true); dhSave(); dhNet('paint', {plot: aim.plot, pieces: dhSerialize(aim.plot)}); dhHud(); return true;
    }
    if (dhOccupied(aim.plot, aim.ix, aim.iy, aim.iz)) return false;
    const part = DH_PARTS[dh.sel] || DH_PARTS[0];
    if (!dhPay(part.cost)){ banner('🪙 Need ' + part.cost + ' coins for a ' + part.name + '. Finish a house goal!'); return false; }
    const rec = [dh.sel, aim.ix, aim.iy, aim.iz, dh.rot | 0, dh.color | 0];
    if (!dhPut(aim.plot, rec)){ dh.bank += part.cost; return false; }
    dhNet('place', {rec, plot: aim.plot}); dhHud(); dhBar();
    return true;
  }
  function dhRotate(){ if (!dh) return false; dh.rot = ((dh.rot | 0) + 1) % 4; dhHud(); return true; }
  function dhCycle(dir){ if (!dh) return; dh.sel = (dh.sel + dir + DH_PARTS.length) % DH_PARTS.length; dhBar(); dhHud(); }
  function dhCycleColor(dir){ if (!dh) return; dh.color = (dh.color + dir + DH_COLORS.length) % DH_COLORS.length; dhBar(); dhHud(); }
  function dhSetTool(t){ if (!dh) return; dh.tool = t; dhBar(); dhHud(); }
  function dhSetStory(s){ if (!dh) return; dh.story = s ? 1 : 0; dhHud(); }

  function dhCheckGoals(){
    if (!dh) return;
    const mine = dh.pieces[dh.mine] || [];
    DH_GOALS.forEach(g => {
      if (dh.goals[g.id]) return;
      if (g.need(mine)){
        dh.goals[g.id] = 1;
        dh.bank += g.pay; dh.earned += g.pay;
        if (typeof setCoins === 'function') setCoins((typeof coins === 'number' ? coins : 0) + g.pay);
        if (typeof runCoins !== 'undefined') runCoins = (runCoins || 0) + g.pay;
        if (typeof SND !== 'undefined' && SND.coin) SND.coin();
        banner('✨ ' + g.name + '! +' + g.pay + ' 🪙');
      }
    });
    dhSave();
  }
  function dhLike(){
    if (!dh) return false;
    const plot = dhPlotAt(P.x, P.z);
    if (plot < 0 || plot === dh.mine) return false;
    if (dh.liked[plot]){ banner('💛 You already liked this house!'); return false; }
    dh.liked[plot] = 1;
    dhNet('like', {plot, from: dhWho()});
    banner('💛 Loved that house!');
    return true;
  }
  function dhTakeLike(){ if (!dh) return; dh.likes = (dh.likes | 0) + 1; dh.bank += 5; dh.earned += 5; if (typeof setCoins === 'function') setCoins((typeof coins === 'number' ? coins : 0) + 5); dhSave(); banner('💛 A visitor liked your house! +5 🪙'); dhHud(); }

  function dhNet(a, data){
    if (!dh || typeof mp === 'undefined' || !mp || !mp.on) return;
    const msg = Object.assign({t: 'dhact', a, who: dhWho(), plot: dh.mine}, data || {});
    if (typeof mpSendTo === 'function' && dhIsGuest() && mp.hconn) mpSendTo(mp.hconn, msg);
    else if (typeof mpBroadcast === 'function') mpBroadcast(msg);
  }
  function dhWire(){ return dh && {mine: dh.mine, who: dhWho(), plots: Object.fromEntries(Object.keys(dh.pieces).map(k => [k, dhSerialize(+k)])), likes: dh.likes, bank: dh.bank}; }
  function dhFromHost(w){
    if (!dh || !w || !w.plots) return;
    Object.keys(w.plots).forEach(k => {
      const plot = +k; if (plot === dh.mine) return;
      const recs = w.plots[k] || [];
      const cur = JSON.stringify(dhSerialize(plot)), next = JSON.stringify(recs);
      if (cur !== next) dhApplyPlot(plot, recs, true);
    });
  }
  function dhGuestMsg(g, d){
    if (!dh || !d) return;
    const plot = (d.plot | 0);
    if (d.a === 'like'){ if (plot === dh.mine) dhTakeLike(); return; }
    const who = d.who || (g && g.uid);
    // only the owner of that plot may edit it
    if (d.a === 'place' && d.rec && plot !== dh.mine) dhPut(plot, d.rec, true);
    if (d.a === 'del' && plot !== dh.mine) dhRemoveAt(plot, d.ix, d.iy, d.iz, true);
    if (d.a === 'paint' && d.pieces && plot !== dh.mine) dhApplyPlot(plot, d.pieces, true);
  }

  function dreamhouseEnter(){
    if (!dh) return;
    choosing = false; over = false;
    banner(mp && mp.on ? '🏡 Dream House Builders — build on your plot, visit friends!' : '🏡 Dream House Builders — snap pieces on your plot and earn coins for house goals!');
    tipTimer = 7; dhHud(); dhBar();
  }
  function dreamhouseStop(){
    if (!dh) return;
    dhSave();
    if (dh.ghost && typeof scene !== 'undefined') scene.remove(dh.ghost);
    Object.keys(dh.meshes || {}).forEach(k => (dh.meshes[k] || []).forEach(m => { dhBindSolids(m, false); if (typeof scene !== 'undefined') scene.remove(m); }));
    ['#dhBar', '#dhAct', '#dhGoals'].forEach(id => { const el = $(id); if (el){ el.classList.remove('show'); el.style.display = 'none'; } });
    dh = null;
  }
  function dreamhouseUpdate(dt){
    if (!dh || choosing || over) return;
    dh.aim = dhAim();
    if (dh.ghost){
      const aim = dh.aim, ok = dhCanBuild(aim);
      dh.ghost.visible = !!(aim && (ok || dh.tool !== 'place'));
      if (aim){
        const w = dhCellWorld(aim.plot, aim.ix, aim.iy, aim.iz);
        dh.ghost.position.set(w.x, w.y, w.z);
        dh.ghost.material.color = new THREE.Color(ok ? (dh.tool === 'delete' ? '#ff4d5e' : dhTint(dh.color)) : '#ffe08a');
      }
    }
    const plot = dhPlotAt(P.x, P.z);
    dh.near = plot;
    const b = $('#dhAct');
    if (b){
      const key = (typeof pad !== 'undefined' && pad && pad.on) ? 'Ⓧ' : (typeof touchUI !== 'undefined' && touchUI ? 'tap' : 'E');
      if (plot >= 0 && plot !== dh.mine){ b.innerHTML = '💛 Like this house <small>' + key + '</small>'; b.classList.add('show'); }
      else if (dhCanBuild(dh.aim)){ const part = DH_PARTS[dh.sel]; b.innerHTML = (dh.tool === 'delete' ? '🗑️ Delete' : dh.tool === 'paint' ? '🎨 Paint' : (part.e + ' Place ' + part.name + ' · ' + part.cost + '🪙')) + ' <small>' + key + '</small>'; b.classList.add('show'); }
      else b.classList.remove('show');
    }
    dh.saveT = (dh.saveT || 0) + dt; if (dh.saveT > 8){ dh.saveT = 0; dhSave(); }
    dhHud();
  }
  function dreamhouseAnimate(){}
  function dhHud(){
    if (!dh) return;
    const n = $('#dhN'); if (n) n.textContent = '🪙 ' + Math.floor(dh.bank) + ' · 🧱 ' + (dh.pieces[dh.mine] || []).length;
    const st = $('#dhStory'); if (st) st.textContent = dh.story ? '2F' : '1F';
    const tb = $('#dhTool'); if (tb) tb.textContent = dh.tool === 'delete' ? '🗑️' : dh.tool === 'paint' ? '🎨' : '🏗️';
  }
  function dhBar(){
    if (!dh) return;
    const bar = $('#dhBar'); if (!bar) return;
    bar.style.display = ''; bar.classList.add('show');
    const tools = '<div class="dhtools">'
      + ['place', 'paint', 'delete'].map(t => '<button class="dhb' + (dh.tool === t ? ' on' : '') + '" data-dhtool="' + t + '">' + (t === 'place' ? '🏗️ Place' : t === 'paint' ? '🎨 Paint' : '🗑️ Delete') + '</button>').join('')
      + '<button class="dhb' + (dh.story === 0 ? ' on' : '') + '" data-dhstory="0">1F</button>'
      + '<button class="dhb' + (dh.story === 1 ? ' on' : '') + '" data-dhstory="1">2F</button>'
      + '<button class="dhb" id="dhRotBtn">↻</button>'
      + '</div>';
    const cols = '<div class="dhcols">' + DH_COLORS.map((c, i) => '<button class="dhc' + (i === dh.color ? ' on' : '') + '" data-dhcol="' + i + '" style="background:' + c + '"></button>').join('') + '</div>';
    const parts = '<div class="dhparts">' + DH_PARTS.map((p, i) => '<button class="dhp' + (i === dh.sel ? ' on' : '') + '" data-dhpart="' + i + '">' + p.e + '<small>' + p.name + ' · ' + p.cost + '</small></button>').join('') + '</div>';
    bar.innerHTML = tools + cols + parts;
    if (!window.__dhBound){
      window.__dhBound = true;
      const act = $('#dhAct'); if (act) act.onclick = () => dh && dhAct();
      bar.addEventListener('click', ev => {
        const t = ev.target.closest('[data-dhtool],[data-dhpart],[data-dhcol],[data-dhstory],#dhRotBtn');
        if (!t || !dh) return;
        if (t.id === 'dhRotBtn') dhRotate();
        else if (t.dataset.dhtool) dhSetTool(t.dataset.dhtool);
        else if (t.dataset.dhpart != null){ dh.sel = +t.dataset.dhpart; dh.tool = 'place'; dhBar(); dhHud(); }
        else if (t.dataset.dhcol != null){ dh.color = +t.dataset.dhcol; dhBar(); dhHud(); }
        else if (t.dataset.dhstory != null){ dhSetStory(+t.dataset.dhstory); dhBar(); }
      });
    } else {
      // rebinding innerHTML drops nothing if we use delegation on bar — already bound
    }
  }
  function dhAct(){
    if (!dh) return;
    const plot = dhPlotAt(P.x, P.z);
    if (plot >= 0 && plot !== dh.mine) return dhLike();
    return dhPlace();
  }
  function dhPad(jp){
    if (!dh) return false;
    if (jp.x || jp[2]){ dhAct(); return true; }
    if (jp.b || jp[1]){ dhRotate(); return true; }
    if (jp.y || jp[3]){ dhSetTool(dh.tool === 'delete' ? 'place' : 'delete'); return true; }
    if (jp.lb || jp[4] || jp.lt){ dhCycle(-1); return true; }
    if (jp.rb || jp[5] || jp.rt){ dhCycle(1); return true; }
    return false;
  }
  function dhKey(e){
    if (!dh || e.repeat) return false;
    const k = e.code || '', key = (e.key || '').toLowerCase();
    if (k === 'KeyE'){ dhAct(); return true; }
    if (k === 'KeyR'){ dhRotate(); return true; }
    if (k === 'KeyX' || k === 'Backspace' || k === 'Delete'){ dhSetTool(dh.tool === 'delete' ? 'place' : 'delete'); return true; }
    if (k === 'KeyC'){ dhCycleColor(1); return true; }
    if (k === 'KeyT'){ dhSetStory(dh.story ? 0 : 1); dhBar(); return true; }
    if (k === 'KeyQ'){ dhSetTool(dh.tool === 'paint' ? 'place' : 'paint'); return true; }
    if (k === 'BracketLeft' || k === 'Comma'){ dhCycle(-1); return true; }
    if (k === 'BracketRight' || k === 'Period'){ dhCycle(1); return true; }
    if (/^Digit[1-9]$/.test(k) || /^Numpad[1-9]$/.test(k)){ dh.sel = Math.min(DH_PARTS.length - 1, (k.slice(-1) | 0) - 1); dh.tool = 'place'; dhBar(); dhHud(); return true; }
    return false;
  }
