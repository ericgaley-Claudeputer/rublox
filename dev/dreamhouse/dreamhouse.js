  /* ===================== t251u + t252u + t253u: first-person Dream House, place every brick yourself, clear concrete steps, reset house in Settings. ===================== */
  const DH_KEY = 'rubloxDreamHouse', DH_CELL = 1.4, DH_N = 8, DH_PLOTS = 4, DH_SPACING = 18, DH_GRANT = 100, DH_VER = 6;
  const DH_FOOT = {x0: 2, z0: 2, x1: 5, z1: 5}; // small house footprint (4x4 cells)
  const DH_FOOT_LEGACY = {x0: 1, z0: 1, x1: 6, z1: 6}; // v5 and earlier houses keep their larger slab
  const DH_BRICK_W = .5, DH_BRICK_H = .24, DH_BRICK_D = .28, DH_COURSES = 6, DH_COURSES_LEGACY = 8;
  const DH_MATS = [
    {id: 'brick',   e: '🧱', name: 'Bricks',    cost: 0,  stack: 8,  carry: 20, free: true},
    {id: 'cement',  e: '🪨', name: 'Cement',    cost: 0,  stack: 1,  carry: 2, free: true},
    {id: 'sand',    e: '🏖️', name: 'Sand',      cost: 0,  stack: 1,  carry: 2, free: true},
    {id: 'wood',    e: '🪵', name: 'Planks',    cost: 0,  stack: 4,  carry: 6, free: true},
    {id: 'shingle', e: '🏠', name: 'Shingles',  cost: 0,  stack: 8,  carry: 12, free: true},
    {id: 'glass',   e: '🪟', name: 'Glass',     cost: 0,  stack: 2,  carry: 2, free: true},
    {id: 'paint',   e: '🎨', name: 'Paint',     cost: 0,  stack: 1,  carry: 2, free: true},
    {id: 'wetmix',  e: '🪣', name: 'Wet mix',   cost: 0,  stack: 1,  carry: 1, nosale: true},
    {id: 'mortar',  e: '🥣', name: 'Mortar',    cost: 0,  stack: 4,  carry: 4, nosale: true},
    {id: 'sofa',    e: '🛋️', name: 'Sofa',      cost: 10, stack: 1,  carry: 1, furn: true},
    {id: 'bed',     e: '🛏️', name: 'Bed',       cost: 12, stack: 1,  carry: 1, furn: true},
    {id: 'table',   e: '🪑', name: 'Table',     cost: 8,  stack: 1,  carry: 1, furn: true},
    {id: 'lamp',    e: '💡', name: 'Lamp',      cost: 6,  stack: 1,  carry: 1, furn: true},
    {id: 'plant',   e: '🪴', name: 'Plant',     cost: 4,  stack: 1,  carry: 1, furn: true},
    {id: 'rug',     e: '🧶', name: 'Rug',       cost: 5,  stack: 1,  carry: 1, furn: true},
    {id: 'tv',      e: '📺', name: 'TV',        cost: 14, stack: 1,  carry: 1, furn: true},
    {id: 'shelf',   e: '📚', name: 'Bookshelf', cost: 10, stack: 1,  carry: 1, furn: true}
  ];
  // Kept so older debug hooks / tests can still see a parts list (construction kinds, not prefab walls)
  const DH_PARTS = [
    {id: 'mark', e: '📍', name: 'Stakes'}, {id: 'trench', e: '🕳️', name: 'Trench'}, {id: 'wet', e: '🪣', name: 'Wet concrete'},
    {id: 'slab', e: '⬜', name: 'Concrete'}, {id: 'brick', e: '🧱', name: 'Brick'}, {id: 'stud', e: '🪵', name: 'Stud'},
    {id: 'rafter', e: '🪜', name: 'Rafter'}, {id: 'shingle', e: '🏠', name: 'Shingle'}, {id: 'doorframe', e: '🚪', name: 'Door frame'},
    {id: 'winframe', e: '🪟', name: 'Window frame'}, {id: 'door', e: '🚪', name: 'Door'}, {id: 'pane', e: '🪟', name: 'Glass pane'},
    {id: 'paint', e: '🎨', name: 'Paint'}, {id: 'sofa', e: '🛋️', name: 'Sofa'}, {id: 'bed', e: '🛏️', name: 'Bed'},
    {id: 'table', e: '🪑', name: 'Table'}, {id: 'lamp', e: '💡', name: 'Lamp'}, {id: 'plant', e: '🪴', name: 'Plant'}, {id: 'rug', e: '🧶', name: 'Rug'}, {id: 'tv', e: '📺', name: 'TV'}, {id: 'shelf', e: '📚', name: 'Bookshelf'}
  ];
  const DH_JOBS = ['mark', 'dig', 'mix', 'pour', 'brick', 'stud', 'rafter', 'shingle', 'frame', 'glass', 'paint', 'furn'];
  const DH_GOALS = [
    {id: 'marked',  name: 'Stake the foundation', need: p => dhCount(p, 'mark') + dhCount(p, 'trench') + dhCount(p, 'wet') + dhCount(p, 'slab') >= 8, pay: 12},
    {id: 'slab',    name: 'Pour a concrete slab', need: p => dhCount(p, 'slab') >= 12, pay: 25},
    {id: 'course',  name: 'Lay the first brick course', need: p => dhCount(p, 'brick') >= Math.max(8, (dhBrickAlongCount(0) || 8)), pay: 20},
    {id: 'walls',   name: 'Raise the brick walls', need: p => dhCount(p, 'brick') >= Math.max(40, Math.floor(dhBrickTotal() * .6)), pay: 35},
    {id: 'rafters', name: 'Set the rafters',     need: p => dhCount(p, 'rafter') >= 4, pay: 20},
    {id: 'roof',    name: 'Shingle the roof',    need: p => dhCount(p, 'shingle') >= 10, pay: 25},
    {id: 'openings',name: 'Hang a door and window', need: p => dhCount(p, 'door') >= 1 && dhCount(p, 'winframe') >= 1, pay: 20},
    {id: 'glaze',   name: 'Glaze the windows',   need: p => dhWindowsGlazed(p), pay: 15},
    {id: 'paint',   name: 'Paint the walls',     need: p => dhCount(p, 'paint') >= 4, pay: 20},
    {id: 'furnish', name: 'Furnish a room',      need: p => ['sofa','bed','table','lamp','plant','rug','tv','shelf'].reduce((n, id) => n + dhCount(p, id), 0) >= 3, pay: 30},
    {id: 'open',    name: 'Open house day',      need: p => dhCount(p, 'slab') >= 12 && dhCount(p, 'brick') >= 30 && dhCount(p, 'door') >= 1 && dhCount(p, 'shingle') >= 8, pay: 50}
  ];
  const DH_PAINT = [
    {id: 0, name: 'Cream', col: '#f6e3b4'}, {id: 1, name: 'Pink', col: '#ffb3c7'}, {id: 2, name: 'Sky', col: '#bfe3ff'},
    {id: 3, name: 'Mint', col: '#c8f0c0'}, {id: 4, name: 'White', col: '#fffaf0'}, {id: 5, name: 'Lemon', col: '#ffe08a'},
    {id: 6, name: 'Lavender', col: '#d4c0ff'}, {id: 7, name: 'Peach', col: '#ffc9a3'}
  ];
  const DH_UPGRADES = [
    {id: 'carry', name: 'Bigger arms',        e: '💪', cost: 40, max: 3, desc: 'Carry more bricks and bags at once'},
    {id: 'dry',   name: 'Faster drying',      e: '☀️', cost: 35, max: 2, desc: 'Concrete sets sooner'},
    {id: 'brick', name: 'Bigger brick stacks',e: '🧱', cost: 45, max: 2, desc: 'Carry even more bricks at a time'},
    {id: 'barrow',name: 'Big wheelbarrow',    e: '🪣', cost: 30, max: 1, desc: 'Carry two loads of wet mix'},
    {id: 'story', name: 'Second story',       e: '🏠', cost: 80, max: 1, desc: 'Build a taller second floor'},
    {id: 'lot',   name: 'Bigger lot',         e: '📐', cost: 90, max: 1, desc: 'Expand your house footprint'}
  ];
  const DH_YARD = {x: 14, z: 7};
  const DH_FURN = {x: -18, z: -16};
  const DH_UP = {x: 18, z: -16};
  const DH_BOUND = {x: 44, z: 36};
  let dh = null;

  function dhMatOf(id){ return DH_MATS.find(m => m.id === id); }
  function dhWho(){ return (typeof mp !== 'undefined' && mp && mp.on && mp.uid) ? String(mp.uid) : 'local'; }
  function dhIsGuest(){ return !!(typeof mp !== 'undefined' && mp && mp.on && typeof mpGuest === 'function' && mpGuest()); }
  function dhOrigin(plot){
    const size = DH_N * DH_CELL;
    // Plot 0 (single-player, and the first MP lot) sits in the center of the map, as in Tessa's drawing.
    // Other lots are parked out of the way to the west so they don't cover the corner shops.
    if ((plot | 0) === 0) return [-size / 2, -size / 2];
    const i = (plot | 0) - 2; // -1, 0, 1
    return [-36 - size / 2, i * DH_SPACING - size / 2];
  }
  function dhSpawnPos(plot){
    const [ox, oz] = dhOrigin(plot == null ? (dh && dh.mine) || 0 : plot);
    return {x: ox + DH_CELL * 4, y: .05, z: oz - 2.8};
  }
  function dhLayoutYard(){
    const [ox, oz] = dhOrigin(0);
    const cx = ox + DH_N * DH_CELL / 2, cz = oz + DH_N * DH_CELL / 2;
    // Tessa's map, north up: plot in the center, Supply Yard NE, Furniture SW, Upgrades SE.
    // X is flipped vs a standard map because the chase camera looks north
    // with +X on the left. These values put the Supply Yard on the player's
    // right (forward-right), Furniture back-left, and Upgrades back-right.
    DH_YARD.x = cx - 16; DH_YARD.z = cz + 7;
    DH_FURN.x = cx + 18; DH_FURN.z = cz - 16;
    DH_UP.x = cx - 18; DH_UP.z = cz - 16;
  }
  function dhClampPlayer(){
    if (typeof P === 'undefined' || !P) return P;
    const bx = DH_BOUND.x, bz = DH_BOUND.z;
    if (P.x > bx) P.x = bx; else if (P.x < -bx) P.x = -bx;
    if (P.z > bz) P.z = bz; else if (P.z < -bz) P.z = -bz;
    if ((P.y || 0) < .05){ P.y = .05; if (P.vy < 0) P.vy = 0; }
    const cap = dhWalkCap();
    const sp = Math.hypot(P.vx || 0, P.vz || 0);
    if (sp > cap){ P.vx *= cap / sp; P.vz *= cap / sp; }
    return P;
  }
  function dhPlotAt(x, z){
    for (let i = 0; i < DH_PLOTS; i++){
      const [ox, oz] = dhOrigin(i);
      if (x >= ox - .4 && x < ox + DH_N * DH_CELL + .4 && z >= oz - .4 && z < oz + DH_N * DH_CELL + .4) return i;
    }
    return -1;
  }
  function dhCellWorld(plot, ix, iz, y){
    const [ox, oz] = dhOrigin(plot);
    return {x: ox + (ix + .5) * DH_CELL, y: y == null ? .12 : y, z: oz + (iz + .5) * DH_CELL};
  }
  function dhFoot(){ const big = !!(dh && dh.upgrades && dh.upgrades.lot); if (big) return {x0: 0, z0: 0, x1: DH_N - 1, z1: DH_N - 1}; return (dh && dh.legacyHouse) ? DH_FOOT_LEGACY : DH_FOOT; }
  function dhInFoot(ix, iz){ const f = dhFoot(); return ix >= f.x0 && ix <= f.x1 && iz >= f.z0 && iz <= f.z1; }
  function dhCourses(){ const base = (dh && dh.legacyHouse) ? DH_COURSES_LEGACY : DH_COURSES; return base + ((dh && dh.upgrades && dh.upgrades.story) ? (dh.legacyHouse ? 8 : 4) : 0); }
  function dhCount(pieces, id){ return (pieces || []).filter(a => a && a[0] === id).length; }
  function dhSameOpening(a, b){ return !!a && !!b && (a[1]|0) === (b[1]|0) && (a[2]|0) === (b[2]|0) && (a[3]|0) === (b[3]|0) && (a[4]|0) === (b[4]|0); }
  function dhWindowsGlazed(pieces){
    const frames = (pieces || []).filter(a => a && a[0] === 'winframe');
    if (!frames.length) return false;
    const panes = (pieces || []).filter(a => a && a[0] === 'pane');
    return frames.every(f => panes.some(pn => dhSameOpening(pn, f)));
  }
  function dhKeyOf(a){ return (a[0] || '') + ':' + (a[1]|0) + ',' + (a[2]|0) + ',' + (a[3]|0) + ',' + (a[4]|0); }
  function dhEmptyStock(){ const o = {}; DH_MATS.forEach(m => { o[m.id] = 0; }); return o; }
  function dhEmptyUpgrades(){ const o = {}; DH_UPGRADES.forEach(u => { o[u.id] = 0; }); return o; }
  function dhUp(id){ return (dh && dh.upgrades && dh.upgrades[id]) | 0; }
  function dhPaintCol(i){ return (DH_PAINT[i % DH_PAINT.length] || DH_PAINT[0]).col; }

  function dhProg(){
    const o = load(DH_KEY, null), r = o && typeof o === 'object' ? o : {};
    return dhMigrate(r);
  }
  function dhMigrate(r){
    const out = {ver: DH_VER, pieces: [], stock: dhEmptyStock(), goals: (r.goals && typeof r.goals === 'object') ? Object.assign({}, r.goals) : {}, coins: Math.max(0, +r.coins || 0), likes: Math.max(0, r.likes | 0), granted: !!r.granted, v1pieces: null, introSeen: !!r.introSeen, upgrades: dhEmptyUpgrades(), tipsSeen: {}, legacyHouse: false};
    if (r.tipsSeen && typeof r.tipsSeen === 'object') Object.keys(r.tipsSeen).forEach(k => { if (r.tipsSeen[k]) out.tipsSeen[k] = true; });
    if (r.stock && typeof r.stock === 'object') Object.keys(out.stock).forEach(k => { out.stock[k] = Math.max(0, +r.stock[k] || 0); });
    if (r.upgrades && typeof r.upgrades === 'object') DH_UPGRADES.forEach(u => { out.upgrades[u.id] = Math.max(0, Math.min(u.max, +r.upgrades[u.id] || 0)); });
    const raw = Array.isArray(r.pieces) ? r.pieces : [];
    const v1 = raw.length && typeof raw[0][0] === 'number';
    if (v1){
      out.v1pieces = raw.slice();
      const kindId = i => (['floor','wall','door','window','stairs','roof','sofa','bed','table','lamp','plant','rug'][i] || 'floor');
      raw.forEach(a => {
        const id = kindId(a[0]|0), ix = a[1]|0, iy = a[2]|0, iz = a[3]|0, rot = a[4]|0, col = a[5]|0;
        if (id === 'floor') out.pieces.push(['slab', ix, 0, iz, 0, 0]);
        else if (id === 'wall'){
          const face = rot % 4;
          for (let c = 0; c < 6; c++) for (let k = 0; k < 2; k++) out.pieces.push(['brick', ix, c, k + (face * 10), face, 0]);
        } else if (id === 'door') out.pieces.push(['doorframe', ix, 0, iz, rot, 0], ['door', ix, 0, iz, rot, 0]);
        else if (id === 'window') out.pieces.push(['winframe', ix, 0, iz, rot, 0], ['pane', ix, 0, iz, rot, 0]);
        else if (id === 'roof') out.pieces.push(['rafter', ix, 0, iz, rot, 0], ['shingle', ix, 0, iz, rot, 0]);
        else if (id === 'stairs') out.pieces.push(['stud', ix, 0, iz, rot, 0]);
        else out.pieces.push([id, ix, iy, iz, rot, col]);
      });
      // leftover supply so they can keep building in the new hands-on loop
      out.stock.brick += 16; out.stock.wood += 8; out.stock.shingle += 12; out.stock.paint += 1;
    } else {
      out.pieces = raw.filter(a => Array.isArray(a) && typeof a[0] === 'string');
    }
    const prev = +r.ver || 0;
    out.legacyHouse = !!r.legacyHouse || (prev > 0 && prev < 6 && (out.pieces || []).length > 0);
    return out;
  }
  function dhLooksLegacy(pieces){
    return (pieces || []).some(a => {
      if (!a) return false;
      if (a[0] === 'brick') return (a[2]|0) >= DH_COURSES || (a[3]|0) >= 11;
      return (a[1]|0) < DH_FOOT.x0 || (a[1]|0) > DH_FOOT.x1 || (a[3]|0) < DH_FOOT.z0 || (a[3]|0) > DH_FOOT.z1;
    });
  }
  function dhFreshSave(){
    return {ver: DH_VER, pieces: [], stock: dhEmptyStock(), goals: {}, coins: 0, likes: 0, granted: false, v1pieces: null, introSeen: false, upgrades: dhEmptyUpgrades(), tipsSeen: {}, legacyHouse: false};
  }
  function dhClosePauseMenus(){
    if (typeof dhCloseReset === 'function') try { dhCloseReset(); } catch (e){}
    if (typeof paused !== 'undefined') paused = false;
    if (typeof menuOpen !== 'undefined') menuOpen = false;
    if (typeof document !== 'undefined' && document.getElementById){
      const panel = document.getElementById('oPausePanel');
      if (panel && panel.classList) panel.classList.remove('show');
      const root = document.getElementById('obby');
      if (root && root.classList){ root.classList.remove('paused', 'dh-paused'); root.classList.remove('dh-intro'); }
      const tip = document.getElementById('dhTip');
      if (tip){ tip.classList.remove('show'); tip.style.display = 'none'; }
    }
    if (typeof dhSyncPauseHud === 'function') try { dhSyncPauseHud(); } catch (e){}
    return true;
  }
  function dhResetProgress(){
    // Only wipes the Dream House key. Main wallet, other games, and history stay put.
    if (dh) dh._skipSave = true;
    if (typeof save === 'function') save(DH_KEY, dhFreshSave());
    if (dh){
      dh.carry = null;
      dh.bag = null;
      dh.stock = dhEmptyStock();
      dh.goals = {};
      dh.bank = 0;
      dh.upgrades = dhEmptyUpgrades();
      dh.introSeen = false;
      dh.tipsSeen = {};
      dh.legacyHouse = false;
      dh.grantedNow = false;
      dh._starterGranted = false;
      dh.yardMsg = '';
      try {
        if (dh.pieces) Object.keys(dh.pieces).forEach(k => {
          if (typeof dhClearPlot === 'function') dhClearPlot(k);
          else dh.pieces[k] = [];
        });
      } catch (e){ if (dh.pieces && dh.mine != null) dh.pieces[dh.mine] = []; }
      const inDh = (typeof mode !== 'undefined' && mode === 'dreamhouse');
      if (inDh){
        if (typeof dhClosePauseMenus === 'function') dhClosePauseMenus();
        try { if (typeof dreamhouseStop === 'function') dreamhouseStop(); } catch (e){}
        try {
          if (typeof buildDreamHouse === 'function') buildDreamHouse();
          if (typeof dreamhouseEnter === 'function') dreamhouseEnter();
        } catch (e){}
        if (typeof dhClosePauseMenus === 'function') dhClosePauseMenus();
      }
    }
    if (typeof banner === 'function') banner('🏡 Dream House was reset — time to build a new one!');
    return true;
  }
  if (typeof window !== 'undefined') window.dhResetProgress = dhResetProgress;
  function dhSave(extra){
    if (!dh) return;
    const p = dhProg();
    p.ver = DH_VER;
    p.pieces = dhSerialize(dh.mine);
    p.stock = Object.assign(dhEmptyStock(), dh.stock);
    p.goals = dh.goals;
    p.coins = dh.bank;
    p.likes = dh.likes | 0;
    p.granted = true;
    p.v1pieces = dh.v1pieces || p.v1pieces;
    p.introSeen = !!(dh.introSeen);
    p.upgrades = Object.assign(dhEmptyUpgrades(), dh.upgrades || {});
    p.tipsSeen = Object.assign({}, dh.tipsSeen || {});
    p.legacyHouse = !!dh.legacyHouse;
    if (extra) Object.assign(p, extra);
    if (!dh._skipSave) save(DH_KEY, p);
  }

  function dhTex(draw, s){
    s = s || 64;
    try {
      if (typeof canvasTex === 'function'){
        const t = canvasTex(s, s, draw);
        if (t) return t;
      }
      const c = document.createElement('canvas'); c.width = c.height = s;
      const ctx = c.getContext && c.getContext('2d');
      if (!ctx) return null;
      draw(ctx, s);
      if (typeof THREE.CanvasTexture !== 'function') return null;
      const tex = new THREE.CanvasTexture(c);
      if (THREE.RepeatWrapping && tex.wrapS !== undefined){ tex.wrapS = tex.wrapT = THREE.RepeatWrapping; }
      return tex;
    } catch (e){ return null; }
  }
  function dhMat(col, opts){ return new THREE.MeshLambertMaterial(Object.assign({color: col}, opts || {})); }
  function dhMatTex(draw, fallback, opts){
    const tex = dhTex(function(ctx, s){ draw(ctx, s || 64); });
    const o = Object.assign({color: tex ? '#ffffff' : fallback}, opts || {});
    if (tex) o.map = tex;
    return new THREE.MeshLambertMaterial(o);
  }
  function dhMakeMats(){
    const brick = dhMatTex((ctx, s) => {
      ctx.fillStyle = '#b9b3a8'; ctx.fillRect(0, 0, s, s);
      const rows = 8, bw = s / 4, bh = s / rows;
      for (let r = 0; r < rows; r++){
        const off = (r % 2) ? bw / 2 : 0;
        for (let k = -1; k < 5; k++){
          const shade = ['#b54a32', '#c45b3a', '#a43e2a', '#c96a42'][(r * 3 + k + 8) % 4];
          ctx.fillStyle = shade;
          ctx.fillRect(k * bw + off + 1, r * bh + 1, bw - 2, bh - 2);
        }
      }
    }, '#b54a32');
    const concrete = dhMatTex((ctx, s) => {
      ctx.fillStyle = '#8d8f8c'; ctx.fillRect(0, 0, s, s);
      for (let i = 0; i < 180; i++){
        ctx.fillStyle = i % 3 ? '#9a9c98' : '#7a7c78';
        ctx.fillRect((i * 17) % s, (i * 29) % s, 2, 2);
      }
      ctx.fillStyle = '#a3a5a1'; ctx.fillRect(8, 20, 12, 1); ctx.fillRect(30, 44, 10, 1);
    }, '#8d8f8c');
    const wet = dhMat('#6b6e6a');
    const dirt = dhMat('#6a4a2c');
    const wood = dhMatTex((ctx, s) => {
      ctx.fillStyle = '#b07a43'; ctx.fillRect(0, 0, s, s);
      for (let y = 0; y < s; y += 8){
        ctx.fillStyle = '#8a5a2b'; ctx.fillRect(0, y, s, 1);
        ctx.fillStyle = '#c99059'; ctx.fillRect((y * 3) % s, y + 3, s * .6, 1);
      }
    }, '#b07a43');
    const shingle = dhMatTex((ctx, s) => {
      ctx.fillStyle = '#4a3a36'; ctx.fillRect(0, 0, s, s);
      const rows = 8, bw = s / 4, bh = s / rows;
      for (let r = 0; r < rows; r++){
        const off = (r % 2) ? bw / 2 : 0;
        for (let k = -1; k < 5; k++){
          ctx.fillStyle = ['#5c4038', '#4a322c', '#6a4a40', '#3f2c28'][(r + k + 8) % 4];
          ctx.fillRect(k * bw + off + 1, r * bh + 1, bw - 2, bh - 1);
        }
      }
    }, '#5c4038');
    const mortar = dhMat('#c5c0b4');
    const glass = dhMat('#9ad8ff', {transparent: true, opacity: .48, depthWrite: false, emissive: '#d7f4ff', emissiveIntensity: .18});
    const glassShine = dhMat('#ffffff', {transparent: true, opacity: .55, depthWrite: false, emissive: '#ffffff', emissiveIntensity: .35});
    return {brick, concrete, wet, dirt, wood, shingle, mortar, glass, glassShine, paint: dhMat('#f6e3b4'), bag: dhMat('#cfc4a8'), rust: dhMat('#6d6f72'), dark: dhMat('#5a4030')};
  }

  function dhMeshFor(rec, plot){
    const id = rec[0], g = new THREE.Group(), M = (dh && dh.mats) || dhMakeMats();
    const add = (mesh, x, y, z) => { mesh.position.set(x || 0, y || 0, z || 0); g.add(mesh); return mesh; };
    const box = (sx, sy, sz, mat) => new THREE.Mesh(new THREE.BoxGeometry(sx, sy, sz), mat);
    const solidsLocal = [];
    const solid = (sx, sy, sz, lx, ly, lz, mat) => {
      const m = add(box(sx, sy, sz, mat), lx, ly, lz);
      solidsLocal.push({mesh: m, hw: sx / 2, hh: sy / 2, hd: sz / 2, ox: lx || 0, oy: ly || 0, oz: lz || 0});
      return m;
    };
    // world placement
    const pos = dhWorldRec(plot, rec);
    g.position.set(pos.x, pos.y, pos.z); g.rotation.y = pos.ry || 0;
    if (id === 'mark'){ add(box(.08, .7, .08, M.wood), 0, .35, 0); add(box(.28, .04, .04, dhMat('#ff6fb5')), 0, .7, 0); }
    else if (id === 'trench'){ solid(DH_CELL * .95, .28, DH_CELL * .95, 0, 0, 0, M.dirt); add(box(DH_CELL * .95, .12, .06, M.wood), 0, .16, DH_CELL * .44); add(box(DH_CELL * .95, .12, .06, M.wood), 0, .16, -DH_CELL * .44); }
    else if (id === 'wet'){ solid(DH_CELL * .95, .32, DH_CELL * .95, 0, 0, 0, M.wet); }
    else if (id === 'slab'){ solid(DH_CELL, .28, DH_CELL, 0, 0, 0, M.concrete); }
    else if (id === 'brick'){ const vis = solid(DH_BRICK_W - .02, DH_BRICK_H - .02, DH_BRICK_D, 0, 0, 0, M.brick); if (dh && dh.brickInst && dh.brickInst[plot] && typeof dh.brickInst[plot].setMatrixAt === 'function') vis.visible = false; }
    else if (id === 'stud'){ solid(.1, 2.05, .1, 0, 1.0, 0, M.wood); }
    else if (id === 'beam'){ solid(DH_CELL * 1.05, .1, .1, 0, 0, 0, M.wood); }
    else if (id === 'rafter'){ const r = box(DH_CELL * 1.2, .08, .1, M.wood); r.rotation.x = rec[4] % 2 ? .42 : -.42; add(r, 0, 0, 0); solidsLocal.push({mesh: r, hw: .5, hh: .08, hd: .4, ox: 0, oy: 0, oz: 0}); }
    else if (id === 'shingle'){ const r = box(DH_CELL * 1.05, .05, DH_CELL * .55, M.shingle); r.rotation.x = rec[4] % 2 ? .42 : -.42; add(r, 0, 0, 0); }
    else if (id === 'doorframe'){
      solid(.12, 1.9, .12, -.45, .2, 0, M.wood); solid(.12, 1.9, .12, .45, .2, 0, M.wood); add(box(.95, .12, .12, M.wood), 0, 1.15, 0);
    }
    else if (id === 'door'){ add(box(.7, 1.7, .08, M.dark), 0, .1, 0); add(box(.06, .06, .04, dhMat('#d4a574')), .22, .15, .06); }
    else if (id === 'winframe'){
      // chunky wood frame with a clearly empty opening (no glass fill)
      solid(.9, .14, .16, 0, .54, 0, M.wood);
      solid(.96, .16, .2, 0, -.54, 0, M.wood);
      solid(.14, 1.08, .16, -.38, 0, 0, M.wood);
      solid(.14, 1.08, .16, .38, 0, 0, M.wood);
    }
    else if (id === 'pane'){
      add(box(.64, .92, .03, M.glass), 0, 0, 0);
      add(box(.14, .62, .008, M.glassShine || M.glass), -.14, .1, .02);
      add(box(.06, .28, .008, M.glassShine || M.glass), .16, -.14, .02);
    }
    else if (id === 'paint'){ add(box(DH_CELL * .9, 1.8, .04, dhMat(dhPaintCol(rec[5] | 0))), 0, .2, 0); }
    else if (id === 'sofa'){ solid(.95, .32, .5, 0, -.2, 0, dhMat('#3a86ff')); add(box(.95, .35, .16, dhMat('#3a86ff')), 0, .08, -.22); }
    else if (id === 'bed'){ solid(1.1, .28, .7, 0, -.25, 0, dhMat('#fffaf0')); add(box(.4, .18, .68, dhMat('#ffe0ef')), 0, -.02, .28); }
    else if (id === 'table'){ add(box(.7, .08, .7, M.wood), 0, .1, 0); [[-.28, -.28], [.28, -.28], [-.28, .28], [.28, .28]].forEach(([x, z]) => add(box(.08, .42, .08, M.dark), x, -.15, z)); solidsLocal.push({mesh: g, hw: .35, hh: .3, hd: .35, ox: 0, oy: 0, oz: 0}); }
    else if (id === 'lamp'){ add(box(.12, .7, .12, M.dark), 0, -.1, 0); add(new THREE.Mesh(new THREE.SphereGeometry(.16, 10, 8), dhMat('#ffe08a', {emissive: '#ffe08a', emissiveIntensity: .4})), 0, .35, 0); }
    else if (id === 'plant'){ add(box(.22, .16, .22, M.dark), 0, -.45, 0); add(new THREE.Mesh(new THREE.SphereGeometry(.22, 8, 6), dhMat('#2ec27e')), 0, -.15, 0); }
    else if (id === 'rug'){ add(box(DH_CELL * .9, .04, DH_CELL * .7, dhMat('#c39bff')), 0, .16, 0); }
    else if (id === 'tv'){ add(box(.22, .7, .16, M.dark), 0, -.15, 0); add(box(.9, .55, .08, M.dark), 0, .4, 0); add(box(.78, .44, .03, dhMat('#7ad3ff', {emissive: '#3a86ff', emissiveIntensity: .35})), 0, .4, .05); }
    else if (id === 'shelf'){
      solid(.7, 1.2, .28, 0, .2, 0, M.wood);
      ['#ff6fb5','#3a86ff','#ffd23f','#2ec27e','#ff9f1c'].forEach((c, i) => add(box(.1, .22, .2, dhMat(c)), -0.24 + (i % 3) * .22, (i < 3 ? .45 : -.05), .02));
    }
    g.userData.solids = solidsLocal; g.userData.rec = rec.slice(); g.userData.plot = plot;
    return g;
  }
  function dhWorldRec(plot, rec){
    const id = rec[0], ix = rec[1]|0, iy = rec[2]|0, iz = rec[3]|0, face = rec[4]|0;
    if (id === 'brick'){
      const [ox, oz] = dhOrigin(plot);
      const f = face % 4;
      const foot = dhFoot();
      const x0 = ox + foot.x0 * DH_CELL, z0 = oz + foot.z0 * DH_CELL;
      const x1 = ox + (foot.x1 + 1) * DH_CELL, z1 = oz + (foot.z1 + 1) * DH_CELL;
      const off = (iy % 2) ? DH_BRICK_W / 2 : 0;
      const along = (iz + 0) * DH_BRICK_W + off + DH_BRICK_W / 2;
      const y = .28 + iy * DH_BRICK_H + DH_BRICK_H / 2;
      if (f === 0) return {x: x0 + along, y, z: z0 + DH_BRICK_D / 2, ry: 0};          // south
      if (f === 2) return {x: x1 - along, y, z: z1 - DH_BRICK_D / 2, ry: 0};          // north
      if (f === 1) return {x: x1 - DH_BRICK_D / 2, y, z: z0 + along, ry: Math.PI / 2}; // east
      return {x: x0 + DH_BRICK_D / 2, y, z: z1 - along, ry: Math.PI / 2};             // west
    }
    if (id === 'rafter' || id === 'shingle'){
      const w = dhCellWorld(plot, ix, iz, (dh.upgrades && dh.upgrades.story ? 4.1 : 2.15) + iy * .12);
      const side = (face % 2) ? 1 : -1;
      w.z += side * .55; w.ry = 0; return w;
    }
    if (id === 'doorframe' || id === 'door' || id === 'winframe' || id === 'pane'){
      const w = dhWallFaceWorld(plot, face, iz, iy);
      w.ry = (face === 1 || face === 3) ? Math.PI / 2 : 0;
      return w;
    }
    const baseY = id === 'slab' || id === 'wet' || id === 'trench' ? .16 : id === 'mark' ? .02 : id === 'stud' ? .28 : .35;
    const w = dhCellWorld(plot, ix, iz, baseY + (id === 'paint' ? 1.0 : 0));
    w.ry = (face || 0) * Math.PI / 2;
    return w;
  }
  function dhWallFaceWorld(plot, face, along, course){
    const [ox, oz] = dhOrigin(plot);
    const foot = dhFoot();
    const x0 = ox + foot.x0 * DH_CELL, z0 = oz + foot.z0 * DH_CELL;
    const x1 = ox + (foot.x1 + 1) * DH_CELL, z1 = oz + (foot.z1 + 1) * DH_CELL;
    const mid = (foot.x1 - foot.x0 + 1) * DH_CELL / 2;
    const y = .28 + (course || 0) * DH_BRICK_H + .9;
    const t = (along + 2) / 6 * (x1 - x0);
    if (face === 0) return {x: x0 + mid, y, z: z0 + .12};
    if (face === 2) return {x: x0 + mid, y, z: z1 - .12};
    if (face === 1) return {x: x1 - .12, y, z: z0 + mid};
    return {x: x0 + .12, y, z: z0 + mid};
  }
  function dhBindSolids(mesh, on){
    const list = (mesh && mesh.userData && mesh.userData.solids) || [];
    list.forEach(s => {
      const b = {mesh: s.mesh, hw: s.hw, hh: s.hh, hd: s.hd, active: true, dx: 0, dy: 0, dz: 0, _dh: mesh};
      if (on){ if (typeof solids !== 'undefined') solids.push(b); s._solid = b; }
      else if (s._solid && typeof solids !== 'undefined'){ const i = solids.indexOf(s._solid); if (i >= 0) solids.splice(i, 1); s._solid = null; }
    });
  }
  function dhAssignPlot(){
    if (typeof mp !== 'undefined' && mp && mp.on){
      const ids = [dhWho()].concat((mp.roster && mp.roster()) || (mp.peers && Object.keys(mp.peers)) || []).filter(Boolean);
      const uniq = []; ids.forEach(id => { if (uniq.indexOf(id) < 0) uniq.push(id); });
      return Math.max(0, uniq.indexOf(dhWho())) % DH_PLOTS;
    }
    return 0;
  }

  function dhMakeGhost(){
    const g = new THREE.Group(); g.visible = false;
    const glow = new THREE.Mesh(new THREE.BoxGeometry(DH_CELL * .92, .16, DH_CELL * .92), dhMat('#ffe08a', {transparent: true, opacity: .55, emissive: '#ffe08a', emissiveIntensity: .7, depthWrite: false}));
    glow.position.y = .2; g.add(glow);
    const pole = new THREE.Mesh(new THREE.BoxGeometry(.1, 1.1, .1), dhMat('#ffd23f', {emissive: '#ffd23f', emissiveIntensity: .45}));
    pole.position.y = .7; g.add(pole);
    g.userData.glow = glow; g.userData.pole = pole;
    return g;
  }
  function dhBuildBounds(){
    const x = 52, z = 40, h = 6, t = 1.6;
    const wall = (wx, wz, ww, wd) => {
      const b = plat(wx, h, wz, ww, wd, '#3d8f4a', h);
      b.camSkip = true;
      if (b.mesh){ b.mesh.visible = false; if (b.mesh.material) b.mesh.material.visible = false; }
    };
    wall(0, -z, 104, t); wall(0, z, 104, t); wall(-x, 0, t, 74); wall(x, 0, t, 74);
    // visible low curb so the edge of the grass is obvious
    const curb = (wx, wz, ww, wd) => { const b = plat(wx, .16, wz, ww, wd, '#5a8f4a', .14); if (b) b.camSkip = true; return b; };
    curb(0, -z + .6, 100, .5); curb(0, z - .6, 100, .5); curb(-x + .6, 0, .5, 70); curb(x - .6, 0, .5, 70);
  }
  function dhSupplyMats(){ return DH_MATS.filter(m => m.free && !m.nosale && !m.furn); }
  function dhSupplyOrder(){
    const mats = dhSupplyMats().slice();
    const want = (typeof dhWantedSupply === 'function') ? dhWantedSupply() : null;
    const want2 = (want === 'cement') ? 'sand' : (want === 'sand') ? 'cement' : (typeof dhStageId === 'function' && dhStageId() === 'pour' ? 'sand' : null);
    mats.sort((a, b) => {
      const rank = m => (m.id === want ? 0 : m.id === want2 ? 1 : 10);
      return rank(a) - rank(b);
    });
    return mats;
  }
  function dhBinPos(i){
    const mats = (typeof dhSupplyOrder === 'function') ? dhSupplyOrder() : dhSupplyMats();
    const k = i, row = (k / 4) | 0;
    // Index 0 is the EAST column — closest to the path from the plot — so the needed pile is first.
    const col = 3 - (k % 4);
    return {x: DH_YARD.x - 4.4 + col * 2.2, z: DH_YARD.z - 3.8 + row * 2.0, id: mats[k] && mats[k].id};
  }
  function dhFlag(x, z, col){
    const g = new THREE.Group(); g.position.set(x, 0, z);
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(.07, .09, 4.6, 8), dhMat('#f4f0e6'));
    pole.position.y = 2.3; g.add(pole);
    const flag = new THREE.Mesh(new THREE.PlaneGeometry(1.6, .9), dhMat(col || '#e23d3d', {side: (THREE.DoubleSide || 2), emissive: col || '#e23d3d', emissiveIntensity: .15}));
    flag.position.set(.85, 3.9, 0); g.add(flag);
    const ball = new THREE.Mesh(new THREE.SphereGeometry(.11, 8, 8), dhMat('#ffd23f'));
    ball.position.y = 4.65; g.add(ball);
    scene.add(g); return g;
  }
  function dhPerson(x, z, opt){
    opt = opt || {};
    const g = new THREE.Group(); g.position.set(x, 0, z);
    if (opt.yaw) g.rotation.y = opt.yaw;
    const skin = dhMat(opt.skin || '#f3c7a3');
    const shirt = dhMat(opt.shirt || '#ff8fab');
    const pants = dhMat(opt.pants || '#3d4a80');
    const head = new THREE.Mesh(new THREE.BoxGeometry(.42, .42, .42), skin); head.position.y = 1.55; g.add(head);
    const hair = new THREE.Mesh(new THREE.BoxGeometry(.46, .16, .46), dhMat(opt.hair || '#3a2a1c')); hair.position.y = 1.78; g.add(hair);
    const body = new THREE.Mesh(new THREE.BoxGeometry(.55, .62, .32), shirt); body.position.y = 1.05; g.add(body);
    const leg = (lx) => { const m = new THREE.Mesh(new THREE.BoxGeometry(.16, .55, .16), pants); m.position.set(lx, .35, 0); g.add(m); };
    leg(-.14); leg(.14);
    const arm = (lx, col) => { const m = new THREE.Mesh(new THREE.BoxGeometry(.12, .5, .12), col || shirt); m.position.set(lx, 1.08, 0); g.add(m); };
    arm(-.38); arm(.38);
    if (opt.hat){
      const hat = new THREE.Mesh(new THREE.CylinderGeometry(.28, .32, .16, 10), dhMat(opt.hatCol || '#f0c14a'));
      hat.position.y = 1.86; g.add(hat);
      const brim = new THREE.Mesh(new THREE.CylinderGeometry(.42, .42, .05, 10), dhMat(opt.hatCol || '#f0c14a'));
      brim.position.y = 1.78; g.add(brim);
    }
    if (opt.smile){
      const eye = (ex) => { const e = new THREE.Mesh(new THREE.BoxGeometry(.07, .07, .05), dhMat('#1d2340')); e.position.set(ex, 1.58, .2); g.add(e); };
      eye(-.1); eye(.1);
    }
    if (opt.tool){
      const t = new THREE.Mesh(new THREE.BoxGeometry(.08, .7, .08), dhMat('#8a5a2b'));
      t.position.set(.48, 1.15, .15); t.rotation.z = -.4; g.add(t);
      const head2 = new THREE.Mesh(new THREE.BoxGeometry(.28, .1, .18), dhMat('#8d8f8c'));
      head2.position.set(.62, 1.42, .15); g.add(head2);
    }
    scene.add(g); return g;
  }
  function dhBeaconAt(pos, col, key){
    const c = col || '#ffd23f';
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(.12, .18, 10, 8), dhMat(c, {emissive: c, emissiveIntensity: .7}));
    pole.position.set(pos.x, 5.2, pos.z); scene.add(pole);
    const halo = new THREE.Mesh(new THREE.CylinderGeometry(.7, .7, 9, 12), dhMat(c, {transparent: true, opacity: .25, emissive: c, emissiveIntensity: .4, depthWrite: false}));
    halo.position.set(pos.x, 5.4, pos.z); scene.add(halo);
    const arrow = new THREE.Mesh(new THREE.ConeGeometry(.7, 1.5, 8), dhMat('#ff4d5e', {emissive: '#ff4d5e', emissiveIntensity: .65}));
    arrow.rotation.x = Math.PI; arrow.position.set(pos.x, 11.2, pos.z); scene.add(arrow);
    dh[key] = {pole, halo, arrow, y0: 11.2};
  }
  function dhPutSign(x, y, z, text, scaleX, scaleY){
    const sign = (typeof label === 'function') ? label(text, 'rgba(29,35,64,.95)', '#ffd23f', 512) : null;
    if (sign && sign.position) sign.position.set(x, y, z);
    if (sign && sign.scale) sign.scale.set(scaleX || 8, scaleY || 1.8, 1);
    if (sign){ sign.renderOrder = 12; scene.add(sign); }
    return sign;
  }
  function dhBuildYard(){
    plat(DH_YARD.x, .12, DH_YARD.z, 13, 10, '#cfc4a8', .2);
    const [pox, poz] = dhOrigin((dh && dh.mine) || 0);
    const px = pox + DH_N * DH_CELL, pz = poz + DH_N * DH_CELL / 2;
    plat((px + DH_YARD.x) / 2, .14, (pz + DH_YARD.z) / 2, Math.max(4, Math.abs(DH_YARD.x - px) + 1), 3.0, '#cfc4a8', .18);
    // Wooden sign sits on the yard's BACK (west) edge, away from the approach
    // from the plot, so the follow camera does not clip through the board.
    dh.yardSignParts = [];
    const board = new THREE.Mesh(new THREE.BoxGeometry(.22, 3.6, 8.4), dhMat('#8b4513'));
    board.position.set(DH_YARD.x - 5.8, 4.4, DH_YARD.z); scene.add(board);
    dh.yardSignParts.push(board);
    [[-5.8, 2.2, -3.8], [-5.8, 2.2, 3.8]].forEach(([x, y, z]) => {
      const post = new THREE.Mesh(new THREE.BoxGeometry(.24, 4.4, .24), dhMat('#5a4030'));
      post.position.set(DH_YARD.x + x, y, DH_YARD.z + z); scene.add(post);
      dh.yardSignParts.push(post);
    });
    const sYard = dhPutSign(DH_YARD.x - 5.4, 5.5, DH_YARD.z + 1.1, '📦 SUPPLY YARD', 9.2, 1.8);
    const sFree = dhPutSign(DH_YARD.x - 5.4, 4.2, DH_YARD.z + 1.1, 'FREE SUPPLIES', 8.2, 1.4);
    if (sYard) dh.yardSignParts.push(sYard);
    if (sFree) dh.yardSignParts.push(sFree);
    dhFlag(DH_YARD.x - 5.8, DH_YARD.z - 4.4, '#e23d3d');
    dhFlag(DH_YARD.x + 5.6, DH_YARD.z - 4.4, '#3a86ff');
    dhBeaconAt(DH_YARD, '#ffd23f', 'yardBeacon');
    dh.bins = [];
    dhSupplyOrder().forEach((m, i) => {
      const p = dhBinPos(i);
      const g = new THREE.Group(); g.position.set(p.x, 0, p.z);
      if (m.id === 'brick'){
        const pal = new THREE.Mesh(new THREE.BoxGeometry(1.4, .12, 1.2), dhMat('#8a5a2b')); pal.position.y = .1; g.add(pal);
        for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++){
          const b = new THREE.Mesh(new THREE.BoxGeometry(.3, .14, .16), dh.mats.brick || dhMat('#b54a32'));
          b.position.set(-.5 + c * .32, .2 + r * .15, -.3 + (r % 2) * .12); g.add(b);
        }
      } else if (m.id === 'cement' || m.id === 'sand'){
        const col = m.id === 'sand' ? dhMat('#e5c574') : (dh.mats.bag || dhMat('#cfc4a8'));
        for (let k = 0; k < 5; k++){
          const bag = new THREE.Mesh(new THREE.BoxGeometry(.55, .22, .38), col);
          bag.position.set(-.3 + (k % 2) * .5, .16 + Math.floor(k / 2) * .22, -.15 + (k % 3) * .15);
          bag.rotation.y = (k * .2); g.add(bag);
        }
      } else if (m.id === 'wood' || m.id === 'shingle'){
        const col = dh.mats.wood || dhMat('#c9a36a');
        const stack = new THREE.Mesh(new THREE.BoxGeometry(1.3, .7, .8), col);
        stack.position.y = .4; g.add(stack);
      } else {
        // glass, paint, or leftover — crate + block stack
        const crate = new THREE.Mesh(new THREE.BoxGeometry(1.0, .7, 1.0), m.id === 'paint' ? dhMat('#8b5cf6') : dhMat('#d9ecff'));
        crate.position.y = .45; g.add(crate);
      }
      scene.add(g);
      dh.bins.push({id: m.id, x: p.x, z: p.z, mesh: g});
    });
    // decorative cinder-block stacks (as in Tessa's drawing)
    const blocks = new THREE.Group(); blocks.position.set(DH_YARD.x + 3.4, 0, DH_YARD.z + 3.2);
    for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++){
      const b = new THREE.Mesh(new THREE.BoxGeometry(.42, .22, .28), dhMat('#b8b3a8'));
      b.position.set(-.5 + c * .45, .16 + r * .23, 0); blocks.add(b);
    }
    scene.add(blocks);
  }
  function dhBuildFurnitureStore(){
    const x = DH_FURN.x, z = DH_FURN.z;
    plat(x, .1, z, 11, 9, '#e8d9c0', .18);
    plat((x + 0) / 2, .12, (z + dhSpawnPos(0).z) / 2, 3.2, Math.abs(z - dhSpawnPos(0).z), '#e8d9c0', .16);
    const wall = dhMat('#fff4dc');
    const room = new THREE.Mesh(new THREE.BoxGeometry(7.2, 3.2, 6.2), wall);
    room.position.set(x, 1.7, z); scene.add(room);
    const roof = new THREE.Mesh(new THREE.BoxGeometry(8, .35, 7), dhMat('#e07a9a'));
    roof.position.set(x, 3.45, z); scene.add(roof);
    const awning = new THREE.Mesh(new THREE.BoxGeometry(6.4, .12, 1.6), dhMat('#ff8fab'));
    awning.position.set(x, 2.7, z + 3.6); scene.add(awning);
    // door opening toward the plot / north-east
    const door = new THREE.Mesh(new THREE.BoxGeometry(1.4, 2.2, .2), dhMat('#8b4513'));
    door.position.set(x, 1.2, z + 3.15); scene.add(door);
    const win = (wx) => { const w = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.0, .12), dhMat('#bfe9ff', {emissive:'#bfe9ff', emissiveIntensity:.2})); w.position.set(x + wx, 1.8, z + 3.16); scene.add(w); };
    win(-2.1); win(2.1);
    [[-3.6, -3.1], [3.6, -3.1], [-3.6, 3.1], [3.6, 3.1]].forEach(([bx, bz]) => {
      const bush = new THREE.Mesh(new THREE.SphereGeometry(.55, 10, 8), dhMat('#3fa85a'));
      bush.position.set(x + bx, .45, z + bz); scene.add(bush);
    });
    dhPerson(x, z + 1.4, {shirt: '#ff8fab', hair: '#5a3a22', smile: true, yaw: 0});
    dhPutSign(x, 4.6, z + 2.4, '🛋️ FURNITURE STORE', 8.5, 1.7);
    dhBeaconAt(DH_FURN, '#ff8fab', 'furnBeacon');
    plat((dhSpawnPos(0).x + x) / 2, .13, (dhSpawnPos(0).z + z) / 2, Math.max(3, Math.abs(dhSpawnPos(0).x - x) * .35 + 3), Math.max(3, Math.abs(dhSpawnPos(0).z - z)), '#e8d9c0', .15);
  }
  function dhBuildUpgradeShop(){
    const x = DH_UP.x, z = DH_UP.z;
    plat(x, .1, z, 9, 8, '#d7cbb3', .18);
    // open workshop shed
    const wall = dhMat('#f0e4cc');
    const back = new THREE.Mesh(new THREE.BoxGeometry(6.2, 3.0, .3), wall); back.position.set(x, 1.55, z - 2.6); scene.add(back);
    const side = (sx) => { const m = new THREE.Mesh(new THREE.BoxGeometry(.3, 3.0, 5.2), wall); m.position.set(x + sx, 1.55, z); scene.add(m); };
    side(-3.05); side(3.05);
    const roof = new THREE.Mesh(new THREE.BoxGeometry(7.2, .28, 6.2), dhMat('#c9842a'));
    roof.position.set(x, 3.2, z); roof.rotation.x = -.08; scene.add(roof);
    const bench = new THREE.Mesh(new THREE.BoxGeometry(2.4, .55, 1.0), dhMat('#8a5a2b'));
    bench.position.set(x - 1.2, .45, z + .4); scene.add(bench);
    dhPerson(x + .6, z + 1.6, {shirt: '#4aa3df', pants: '#4a5568', hat: true, hatCol: '#f0c14a', tool: true, smile: true, yaw: -0.4});
    dhPutSign(x, 4.3, z + 2.2, '🔧 UPGRADES', 7.4, 1.7);
    dhBeaconAt(DH_UP, '#f0c14a', 'upBeacon');
    plat((dhSpawnPos(0).x + x) / 2, .13, (dhSpawnPos(0).z + z) / 2, Math.max(3, Math.abs(dhSpawnPos(0).x - x) * .35 + 3), Math.max(3, Math.abs(dhSpawnPos(0).z - z)), '#d7cbb3', .15);
  }
  function dhBuildMixer(plot){
    const [ox, oz] = dhOrigin(plot);
    // West of the south edge: next to the plot and visible to the right of spawn, but not in your face.
    const x = ox + 0.6, z = oz - 1.8;
    const g = new THREE.Group(); g.position.set(x, 0, z);
    const drum = new THREE.Mesh(new THREE.CylinderGeometry(.45, .5, .9, 12), dh.mats.rust);
    drum.rotation.z = Math.PI / 2; drum.position.set(0, .85, 0); g.add(drum);
    const leg = (lx) => { const m = new THREE.Mesh(new THREE.BoxGeometry(.08, .7, .08), dh.mats.dark); m.position.set(lx, .35, .25); g.add(m); const n = m.clone(); n.position.z = -.25; g.add(n); };
    leg(-.35); leg(.35);
    const barrow = new THREE.Mesh(new THREE.BoxGeometry(.7, .25, .45), dh.mats.rust);
    barrow.position.set(1.1, .35, 0); g.add(barrow);
    const hop = new THREE.Mesh(new THREE.BoxGeometry(.7, .2, .7), dh.mats.dark);
    hop.position.set(0, 1.45, 0); g.add(hop);
    const pad = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 1.6, .08, 16), dhMat('#f4c542'));
    pad.position.set(.4, .04, 0); g.add(pad);
    scene.add(g);
    if (plot === ((dh && dh.mine) || 0)){
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(.08, .08, 4.4, 8), dhMat('#ffd23f'));
      pole.position.set(0, 2.3, 0); g.add(pole);
      const glow = new THREE.Mesh(new THREE.SphereGeometry(.32, 10, 10), dhMat('#fff4a8'));
      glow.position.set(0, 4.55, 0); g.add(glow);
      const big = dhPutSign(x, 2.9, z, '🚧 CEMENT MIXER', 3.4, 0.7);
      const sub = dhPutSign(x, 2.25, z, 'Cement + Sand', 2.8, 0.55);
      dh.mixerSigns = [big, sub].filter(Boolean);
      dh.mixerLabel = big;
    }
    dh.mixers[plot] = {x, z, mesh: g, drum, cement: 0, sand: 0, mixed: 0, mixT: 0, phase: 'idle'};
    return dh.mixers[plot];
  }


  function dhTree(x, z, kind, s){
    s = s || 1;
    const g = new THREE.Group(); g.position.set(x, 0, z);
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(.16 * s, .22 * s, 1.4 * s, 6), dh.mats.dark);
    trunk.position.y = .7 * s; g.add(trunk);
    const leafCols = ['#2ec27e', '#3fb86b', '#24965a', '#57c47a', '#1f8a4c'];
    const col = leafCols[kind % leafCols.length];
    const leaf = (lx, ly, lz, r) => {
      let m;
      try { m = new THREE.Mesh(new THREE.IcosahedronGeometry(r, 0), dhMat(col)); }
      catch (e){ m = new THREE.Mesh(new THREE.SphereGeometry(r, 8, 6), dhMat(col)); }
      m.position.set(lx, ly, lz); g.add(m);
    };
    if (kind % 3 === 0){ leaf(0, 1.85 * s, 0, 1.15 * s); leaf(.35 * s, 1.55 * s, .2 * s, .7 * s); }
    else if (kind % 3 === 1){
      const cone = new THREE.Mesh(new THREE.ConeGeometry(1.05 * s, 2.2 * s, 7), dhMat(col));
      cone.position.y = 2.0 * s; g.add(cone);
      const cone2 = new THREE.Mesh(new THREE.ConeGeometry(.8 * s, 1.4 * s, 7), dhMat(leafCols[(kind + 2) % leafCols.length]));
      cone2.position.y = 2.7 * s; g.add(cone2);
    } else { leaf(0, 1.7 * s, 0, .95 * s); leaf(-.45 * s, 1.35 * s, .15 * s, .6 * s); leaf(.4 * s, 1.45 * s, -.2 * s, .55 * s); }
    if (typeof scene !== 'undefined') scene.add(g);
    return g;
  }
  function dhTreeBlocked(x, z){
    const plot = (dh && dh.mine) || 0;
    const [ox, oz] = dhOrigin(plot);
    const sp = dhSpawnPos(plot);
    const x0 = ox - 1.2, x1 = ox + DH_N * DH_CELL + 1.2;
    // spawn-to-plot + camera corridor (south of the lot, same x as the plot)
    if (x > x0 && x < x1 && z < oz + 2.5 && z > oz - 18) return true;
    if (Math.hypot(x - sp.x, z - sp.z) < 7) return true;
    if (Math.hypot(x - DH_YARD.x, z - DH_YARD.z) < 11) return true;
    if (Math.hypot(x - DH_FURN.x, z - DH_FURN.z) < 10) return true;
    if (Math.hypot(x - DH_UP.x, z - DH_UP.z) < 9) return true;
    // leave walking paths from spawn/plot to each corner shop
    const pathHit = (ax, az, bx, bz, w) => {
      const dx = bx - ax, dz = bz - az, len = Math.hypot(dx, dz) || 1;
      const t = Math.max(0, Math.min(1, ((x - ax) * dx + (z - az) * dz) / (len * len)));
      return Math.hypot(x - (ax + dx * t), z - (az + dz * t)) < w;
    };
    if (pathHit(ox + DH_N * DH_CELL, oz + DH_N * DH_CELL / 2, DH_YARD.x, DH_YARD.z, 3.2)) return true;
    if (pathHit(sp.x, sp.z, DH_FURN.x, DH_FURN.z, 3.2)) return true;
    if (pathHit(sp.x, sp.z, DH_UP.x, DH_UP.z, 3.2)) return true;
    return false;
  }
  function dhPlantTrees(){
    dh.trees = [];
    const yard = {x: DH_YARD.x, z: DH_YARD.z};
    for (let i = 0; i < DH_PLOTS; i++){
      const [ox, oz] = dhOrigin(i);
      const cx = ox + DH_N * DH_CELL / 2, cz = oz + DH_N * DH_CELL / 2;
      const rx = DH_N * DH_CELL / 2 + 3.2, rz = DH_N * DH_CELL / 2 + 3.2;
      const n = 16;
      for (let k = 0; k < n; k++){
        const t = (k / n) * Math.PI * 2 + i * .15;
        const x = cx + Math.cos(t) * rx, z = cz + Math.sin(t) * rz;
        if (dhTreeBlocked(x, z)) continue;
        const toward = (px, pz) => {
          const ang = Math.atan2(pz - cz, px - cx);
          return Math.abs(Math.atan2(Math.sin(t - ang), Math.cos(t - ang)));
        };
        if (toward(DH_YARD.x, DH_YARD.z) < .7) continue;
        if (toward(DH_FURN.x, DH_FURN.z) < .55) continue;
        if (toward(DH_UP.x, DH_UP.z) < .55) continue;
        const kind = (i * 5 + k * 3) % 5;
        const sc = 0.85 + ((i * 7 + k * 13) % 5) * .08;
        const mesh = dhTree(x, z, kind, sc);
        dh.trees.push({x, z, plot: i, mesh, kind});
      }
    }
  }
  function dhFadeOccludingTrees(){
    if (!dh || !dh.trees || typeof camera === 'undefined' || !camera) return;
    const cx = camera.position.x, cz = camera.position.z, px = P.x || 0, pz = P.z || 0;
    const vx = px - cx, vz = pz - cz, L2 = vx * vx + vz * vz || 1;
    dh.trees.forEach(t => {
      if (!t.mesh) return;
      let u = ((t.x - cx) * vx + (t.z - cz) * vz) / L2;
      u = Math.max(0, Math.min(1, u));
      const d = Math.hypot(t.x - (cx + u * vx), t.z - (cz + u * vz));
      const occlude = d < 2.6 && u > .06 && u < .92;
      const walk = (n, fn) => { fn(n); (n.children || []).forEach(c => walk(c, fn)); };
      walk(t.mesh, n => {
        if (!n.material) return;
        const mats = Array.isArray(n.material) ? n.material : [n.material];
        mats.forEach(m => { m.transparent = true; m.opacity = occlude ? .15 : 1; if ('depthWrite' in m) m.depthWrite = !occlude; });
      });
    });
  }
  function dhFadeYardSign(){
    if (!dh || typeof camera === 'undefined' || !camera) return;
    const cx = camera.position.x, cy = camera.position.y, cz = camera.position.z;
    const px = P.x || 0, pz = P.z || 0;
    const vx = px - cx, vz = pz - cz, L2 = vx * vx + vz * vz || 1;
    const walk = (n, fn) => { fn(n); (n.children || []).forEach(c => walk(c, fn)); };
    const tmp = (typeof THREE !== 'undefined' && THREE.Vector3) ? new THREE.Vector3() : null;
    (dh.plotSigns || []).concat(dh.mixerSigns || []).forEach(sign => {
      if (!sign) return;
      const d = Math.hypot((sign.position.x || 0) - cx, (sign.position.y || 0) - cy, (sign.position.z || 0) - cz);
      const fade = d < 8 ? Math.max(0.04, (d - 2.4) / 5.6) : 1;
      const mats = sign.material ? (Array.isArray(sign.material) ? sign.material : [sign.material]) : [];
      mats.forEach(m => { m.transparent = true; m.opacity = fade; if ('depthWrite' in m) m.depthWrite = fade > .6; if ('depthTest' in m) m.depthTest = true; });
    });
    if (!dh.yardSignParts || !dh.yardSignParts.length) return;
    dh.yardSignParts.forEach(root => {
      if (!root) return;
      let wx = root.position.x, wy = root.position.y, wz = root.position.z;
      if (tmp && root.getWorldPosition){ root.getWorldPosition(tmp); wx = tmp.x; wy = tmp.y; wz = tmp.z; }
      let u = ((wx - cx) * vx + (wz - cz) * vz) / L2;
      u = Math.max(0, Math.min(1, u));
      const d = Math.hypot(wx - (cx + u * vx), wz - (cz + u * vz));
      const camDist = Math.hypot(wx - cx, wy - cy, wz - cz);
      const occlude = (d < 3.4 && u > .04 && u < .96) || camDist < 5;
      walk(root, n => {
        if (!n.material) return;
        const mats = Array.isArray(n.material) ? n.material : [n.material];
        mats.forEach(m => { m.transparent = true; m.opacity = occlude ? .12 : 1; if ('depthWrite' in m) m.depthWrite = !occlude; });
      });
    });
  }
  function dhMomMesh(){
    if (typeof buildPlayer === 'function'){
      try {
        const m = buildPlayer({body: 'girl', head: '#f1c27d', shirt: '#ff6fb5', pants: '#3d6fb5', pantsPat: 'skirt', hair: 'long', hairColor: '#5a4030', hat: null});
        const g = m && (m.g || m);
        if (g) return g;
      } catch (e){}
    }
    const g = new THREE.Group();
    const skin = dhMat('#f1c27d'), shirt = dhMat('#ff6fb5'), skirt = dhMat('#3d6fb5'), hair = dhMat('#5a4030'), shoe = dhMat('#5a4030');
    const box = (sx, sy, sz, mat, x, y, z) => { const m = new THREE.Mesh(new THREE.BoxGeometry(sx, sy, sz), mat); m.position.set(x, y, z); g.add(m); return m; };
    box(.38, .9, .38, skin, -.2, .55, 0); box(.38, .9, .38, skin, .2, .55, 0);
    box(.42, .28, .42, shoe, -.2, .12, .02); box(.42, .28, .42, shoe, .2, .12, .02);
    const sk = new THREE.Mesh(new THREE.CylinderGeometry(.55, .78, .7, 8), skirt); sk.position.y = 1.0; g.add(sk);
    box(.82, 1.0, .44, shirt, 0, 1.55, 0);
    box(.34, .9, .34, shirt, -.62, 1.35, 0); box(.34, .9, .34, shirt, .62, 1.35, 0);
    box(.32, .32, .32, skin, -.62, .85, 0); box(.32, .32, .32, skin, .62, .85, 0);
    const head = new THREE.Mesh(new THREE.BoxGeometry(.72, .72, .72), skin); head.position.y = 2.28; g.add(head);
    box(.8, .35, .8, hair, 0, 2.55, 0); box(.8, .5, .25, hair, 0, 2.2, -.3);
    box(.08, .08, .04, dhMat('#1d2340'), -.16, 2.32, .37); box(.08, .08, .04, dhMat('#1d2340'), .16, 2.32, .37);
    box(.2, .06, .04, dhMat('#e07a8a'), 0, 2.12, .37);
    return g;
  }

  function buildDreamHouse(){
    dh = {mine: 0, job: 'mark', rot: 0, color: 0, tool: 'place', aim: null, pieces: {}, meshes: {}, ghost: null, bank: 0, likes: 0, goals: {}, earned: 0, near: -1, liked: {}, saveT: 0, remote: dhIsGuest(), carry: null, bag: null, stock: dhEmptyStock(), bins: [], mixers: {}, piles: {}, mats: dhMakeMats(), v1pieces: null, cureT: 0, upgrades: dhEmptyUpgrades(), introSeen: false, intro: null, trees: [], shopOpen: false, yardOpen: false, upOpen: false, foundYard: false, foundFurn: false, foundUp: false, cut: null, yardBeacon: null, furnBeacon: null, upBeacon: null};
    scene.background = new THREE.Color('#b8e8ff');
    if (scene.fog){ scene.fog.color = new THREE.Color('#d7f3ff'); scene.fog.near = 50; scene.fog.far = 160; }
    plat(0, 0, 0, 110, 84, '#8fd39a', .35);
    const p0 = dhProg();
    dh.bank = p0.coins; dh.likes = p0.likes; dh.goals = Object.assign({}, p0.goals); dh.stock = Object.assign(dhEmptyStock(), p0.stock); dh.v1pieces = p0.v1pieces; dh.upgrades = Object.assign(dhEmptyUpgrades(), p0.upgrades || {}); dh.introSeen = !!p0.introSeen; dh.tipsSeen = Object.assign({}, p0.tipsSeen || {}); dh.legacyHouse = !!p0.legacyHouse; dh.brickInst = {}; dh.hand = null; dh.outlines = null; dh.pourHold = false;
    if (!p0.granted){ dh.bank += DH_GRANT; dh.grantedNow = true; }
    dh.mine = dhAssignPlot();
    dhLayoutYard();
    dhBuildBounds();
    dhBuildYard();
    dhBuildFurnitureStore();
    dhBuildUpgradeShop();
    dhPlantTrees();
    for (let i = 0; i < DH_PLOTS; i++){
      const [ox, oz] = dhOrigin(i);
      const cx = ox + DH_N * DH_CELL / 2, cz = oz + DH_N * DH_CELL / 2;
      plat(cx, .08, cz, DH_N * DH_CELL + .4, DH_N * DH_CELL + .4, i === dh.mine ? '#b6e8a8' : '#9fd3a8', .16);
      [[ox - .15, cz, .3, DH_N * DH_CELL + .6], [ox + DH_N * DH_CELL + .15, cz, .3, DH_N * DH_CELL + .6], [cx, oz - .15, DH_N * DH_CELL + .6, .3], [cx, oz + DH_N * DH_CELL + .15, DH_N * DH_CELL + .6, .3]].forEach(([x, z, w, d]) => { const b = plat(x, .16, z, w, d, '#d9d4cc', .14); if (b) b.camSkip = true; });
      const sign = label((i === dh.mine ? '🏡 Your Plot' : '🏡 Plot ' + (i + 1)), 'rgba(29,35,64,.92)');
      if (sign && sign.position) sign.position.set(cx, 3.15, oz + DH_N * DH_CELL + 1.05);
      if (sign && sign.scale) sign.scale.set(2.4, 0.62, 1);
      if (sign){ sign.renderOrder = 8; scene.add(sign); dh.plotSigns = dh.plotSigns || []; dh.plotSigns.push(sign); }
      dh.pieces[i] = []; dh.meshes[i] = [];
      dhBuildMixer(i);
    }
    // single-player: other lots stay empty (real players only — no leftover show homes or intro houses)
    (p0.pieces || []).forEach(rec => dhPut(dh.mine, rec, true));
    dhStockViz(dh.mine);
    const [ox, oz] = dhOrigin(dh.mine);
    const sp = dhSpawnPos(dh.mine);
    Object.assign(P, {x: sp.x, y: sp.y, z: sp.z, vx: 0, vy: 0, vz: 0}); P.face = 0; cam.yaw = Math.PI; cam.pitch = .37; cam.dist = .2;
    checkpoints[0] = {idx: 0, spawn: sp, flag: new THREE.Object3D()};
    dh.ghost = dhMakeGhost();
    scene.add(dh.ghost);
    dhHud(); dhBar();
  }
  function dhSeedShowHome(plot, n){
    for (let ix = DH_FOOT.x0; ix <= DH_FOOT.x1; ix++) for (let iz = DH_FOOT.z0; iz <= DH_FOOT.z1; iz++) dhPut(plot, ['slab', ix, 0, iz, 0, 0], true);
    const span = Math.floor(((DH_FOOT.x1 - DH_FOOT.x0 + 1) * DH_CELL) / DH_BRICK_W);
    for (let face = 0; face < 4; face++) for (let c = 0; c < DH_COURSES; c++) for (let k = 0; k < span; k++){
      if (dhIsOpening(face, c, k)) continue;
      dhPut(plot, ['brick', 0, c, k, face, 0], true);
    }
    dhPut(plot, ['doorframe', 0, 0, 0, 0, 0], true); dhPut(plot, ['door', 0, 0, 0, 0, 0], true);
    dhPut(plot, ['winframe', 0, 3, 0, 1, 0], true); dhPut(plot, ['pane', 0, 3, 0, 1, 0], true);
    for (let ix = DH_FOOT.x0; ix <= DH_FOOT.x1; ix++){
      dhPut(plot, ['rafter', ix, 0, 3, 0, 0], true);
      dhPut(plot, ['rafter', ix, 0, 4, 1, 0], true);
      dhPut(plot, ['shingle', ix, 0, 3, 0, 0], true);
      dhPut(plot, ['shingle', ix, 0, 4, 1, 0], true);
    }
    dhPut(plot, ['sofa', 3, 0, 3, 0, 0], true);
    dhPut(plot, ['table', 4, 0, 4, 0, 0], true);
    dhPut(plot, ['plant', 2, 0, 4, 0, 0], true);
  }
  function dhBrickSpan(){
    const foot = dhFoot();
    return Math.max(1, Math.floor(((foot.x1 - foot.x0 + 1) * DH_CELL) / DH_BRICK_W));
  }
  function dhBrickAlongCount(face){
    const span = dhBrickSpan();
    return (face === 1 || face === 3) ? Math.max(1, span - 1) : span;
  }
  function dhBrickTotal(){
    let n = 0;
    for (let f = 0; f < 4; f++) for (let c = 0; c < dhCourses(); c++) for (let k = 0; k < dhBrickAlongCount(f); k++){
      if (!dhIsOpening(f, c, k)) n++;
    }
    return n;
  }
  function dhIsOpening(face, course, along){
    const span = dhBrickAlongCount(face);
    const mid = (span / 2) | 0;
    if (face === 0 && along >= mid - 1 && along <= mid && course < 6) return true; // door
    if ((face === 1 || face === 3) && along >= mid - 1 && along <= mid && course >= 2 && course <= 5) return true; // windows
    return false;
  }

  function dhPut(plot, rec, quiet){
    if (!dh || plot < 0 || plot >= DH_PLOTS) return null;
    rec = rec.slice();
    const k = dhKeyOf(rec);
    if ((dh.pieces[plot] || []).some(a => dhKeyOf(a) === k)) return null;
    const mesh = dhMeshFor(rec, plot);
    if (typeof scene !== 'undefined') scene.add(mesh);
    dhBindSolids(mesh, true);
    dh.pieces[plot] = dh.pieces[plot] || []; dh.meshes[plot] = dh.meshes[plot] || [];
    dh.pieces[plot].push(rec); dh.meshes[plot].push(mesh);
    if (rec[0] === 'brick') dhSyncBricks(plot);
    if (!quiet && plot === dh.mine){ dhCheckGoals(); dhSave(); }
    return mesh;
  }
  function dhRemoveAtKey(plot, key, quiet){
    const list = dh.pieces[plot] || [];
    const idx = list.findIndex(a => dhKeyOf(a) === key);
    if (idx < 0) return false;
    const mesh = (dh.meshes[plot] || [])[idx];
    if (mesh){ dhBindSolids(mesh, false); if (typeof scene !== 'undefined') scene.remove(mesh); }
    const id = list[idx] && list[idx][0];
    list.splice(idx, 1); (dh.meshes[plot] || []).splice(idx, 1);
    if (id === 'brick') dhSyncBricks(plot);
    if (!quiet && plot === dh.mine) dhSave();
    return true;
  }
  function dhRemoveAt(plot, ix, iy, iz, quiet){
    if (!dh) return false;
    const list = dh.pieces[plot] || [];
    const idx = list.findIndex(a => (a[1]|0) === ix && (a[2]|0) === iy && (a[3]|0) === iz);
    if (idx < 0) return false;
    return dhRemoveAtKey(plot, dhKeyOf(list[idx]), quiet);
  }
  function dhSerialize(plot){ return (dh && dh.pieces[plot] ? dh.pieces[plot] : []).map(a => a.slice()); }
  function dhClearPlot(plot){
    while (dh.pieces[plot] && dh.pieces[plot].length) dhRemoveAtKey(plot, dhKeyOf(dh.pieces[plot][0]), true);
  }
  function dhApplyPlot(plot, recs, quiet){
    dhClearPlot(plot);
    (recs || []).forEach(r => dhPut(plot, r, true));
    if (!quiet && plot === dh.mine) dhSave();
  }
  function dhHas(plot, id, ix, iz){ return (dh.pieces[plot] || []).some(a => a[0] === id && (a[1]|0) === ix && (a[3]|0) === iz); }
  function dhFind(plot, id, ix, iz){ return (dh.pieces[plot] || []).find(a => a[0] === id && (a[1]|0) === ix && (a[3]|0) === iz); }

  function dhCellAt(x, z){
    const plot = dhPlotAt(x, z); if (plot < 0) return null;
    const [ox, oz] = dhOrigin(plot);
    const ix = Math.round((x - ox) / DH_CELL - .5), iz = Math.round((z - oz) / DH_CELL - .5);
    if (ix < 0 || iz < 0 || ix >= DH_N || iz >= DH_N) return null;
    return {plot, ix, iz, wx: x, wz: z};
  }
  function dhLookFromCam(){
    const yaw = (typeof cam !== 'undefined' && cam && cam.yaw != null) ? cam.yaw : ((P && P.face) || 0);
    const pitch = (typeof cam !== 'undefined' && cam && cam.pitch != null) ? cam.pitch : 0;
    const cp = Math.cos(pitch), sp = Math.sin(pitch);
    const fx = -Math.sin(yaw), fz = -Math.cos(yaw);
    let ox, oy, oz;
    if (typeof camera !== 'undefined' && camera && camera.position && isFinite(camera.position.y)){
      ox = camera.position.x; oy = camera.position.y; oz = camera.position.z;
    } else {
      ox = ((P && P.x) || 0) + fx * .22;
      oy = ((P && P.y) || 0) + 2.45;
      oz = ((P && P.z) || 0) + fz * .22;
    }
    return {ox, oy, oz, dx: fx * cp, dy: -sp, dz: fz * cp, yaw, pitch};
  }
  const DH_AIM_REACH = 8, DH_AIM_COS = Math.cos(15 * Math.PI / 180);
  function dhAimCone(points, reach){
    if (!points || !points.length) return null;
    const ray = dhLookRay();
    reach = reach || DH_AIM_REACH;
    let best = null, bestScore = 1e9;
    points.forEach(p => {
      const ox = p.x - ray.ox, oy = p.y - ray.oy, oz = p.z - ray.oz;
      const dist = Math.hypot(ox, oy, oz);
      if (dist < 0.25 || dist > reach) return;
      const inv = 1 / dist;
      const dot = ox * inv * ray.dx + oy * inv * ray.dy + oz * inv * ray.dz;
      if (dot < DH_AIM_COS) return;
      const ang = Math.acos(Math.min(1, Math.max(-1, dot)));
      const score = ang * 2 + dist * 0.04;
      if (score < bestScore){ bestScore = score; best = p; best._aimDist = dist; best._aimAng = ang; }
    });
    return best;
  }
  function dhGroundHit(reach){
    const ray = dhLookRay();
    if (Math.abs(ray.dy) < 0.02) return null;
    const t = (0.15 - ray.oy) / ray.dy;
    if (t < 0.4 || t > (reach || 7)) return null;
    return {x: ray.ox + ray.dx * t, y: 0.15, z: ray.oz + ray.dz * t, t};
  }
  function dhRayPlaneHit(y, reach){
    const ray = dhLookRay();
    reach = reach == null ? 10 : reach;
    if (!ray || Math.abs(ray.dy) < 1e-4) return null;
    const t = (y - ray.oy) / ray.dy;
    if (t < 0.05 || t > reach) return null;
    return {x: ray.ox + ray.dx * t, y: y, z: ray.oz + ray.dz * t, t};
  }
  function dhAngleToPoint(p, ray){
    ray = ray || dhLookRay();
    const ox = p.x - ray.ox, oy = (p.y || 0) - ray.oy, oz = p.z - ray.oz;
    const dist = Math.hypot(ox, oy, oz);
    if (dist < 1e-4) return {dist: 0, ang: 0, dot: 1};
    const inv = 1 / dist;
    const dot = ox * inv * ray.dx + oy * inv * ray.dy + oz * inv * ray.dz;
    const ang = Math.acos(Math.min(1, Math.max(-1, dot)));
    return {dist, ang, dot};
  }
  // ONE targeting function for highlight and placement (stake, dig, pour, bricks).
  // 1) Ground/slab plane hit up to 10 m, nearest spot within 1.2 m of that point.
  // 2) Else the spot with the smallest angle to the crosshair within 15° and 8 m.
  // 3) Else, if standing within 1 m of a spot and nothing else is targeted, that spot.
  function dhTargetFromPoints(pts, planeY, anchors){
    if (!pts || !pts.length) return null;
    const ray = dhLookRay();
    const y = (planeY == null) ? 0 : planeY;
    const hit = dhRayPlaneHit(y, 10);
    const same = (a, b) => a && b && ((a.ix != null && a.ix === b.ix && a.iz === b.iz && (a.face == null || a.face === b.face) && (a.along == null || a.along === b.along) && (a.course == null || a.course === b.course)) || (Math.hypot((a.x||0)-(b.x||0), (a.z||0)-(b.z||0), ((a.y||0)-(b.y||0))) < 0.05));
    if (hit){
      // Snap to the closest cell/slot under the crosshair (within 1.2 m).
      // If that cell is already used, do not jump to a neighbor.
      const pool = (anchors && anchors.length) ? anchors : pts;
      let closest = null, cd = 1.2;
      pool.forEach(p => {
        const d = Math.hypot(p.x - hit.x, p.z - hit.z);
        if (d < cd){ cd = d; closest = p; }
      });
      if (closest && pts.some(p => same(p, closest))) return pts.find(p => same(p, closest));
      // Ground hit is not on a valid unplaced spot. Do not angle-snap to a neighbor.
    } else {
      const maxAng = 15 * Math.PI / 180;
      let bestA = null, bestAng = maxAng;
      pts.forEach(p => {
        const a = dhAngleToPoint(p, ray);
        if (a.dist > 8 || a.ang > maxAng || a.dot < 0) return;
        if (a.ang < bestAng){ bestAng = a.ang; bestA = p; }
      });
      if (bestA) return bestA;
    }
    if (typeof P !== 'undefined' && P){
      let near = null, nd = 1.0;
      pts.forEach(p => {
        const d = Math.hypot((P.x || 0) - p.x, (P.z || 0) - p.z);
        if (d < nd){ nd = d; near = p; }
      });
      if (near) return near;
    }
    return null;
  }
  function dhJobPoints(job){
    if (!dh) return [];
    job = job || dh.job;
    const plot = dh.mine;
    if (job === 'brick'){
      return dhAllBrickSlots(plot).filter(s => !s.filled).map(s => Object.assign({}, s, {plot, x: s.x, y: s.y, z: s.z}));
    }
    const cells = dhFootCells();
    const pts = [];
    cells.forEach(c => {
      if (job === 'mark' && dhFootTaken(plot, c.ix, c.iz)) return;
      if (job === 'dig'){
        const ok = dhHas(plot, 'mark', c.ix, c.iz) && !dhHas(plot, 'trench', c.ix, c.iz) && !dhHas(plot, 'wet', c.ix, c.iz) && !dhHas(plot, 'slab', c.ix, c.iz);
        if (!ok) return;
      }
      if (job === 'pour'){
        const ok = (dhHas(plot, 'trench', c.ix, c.iz) || dhHas(plot, 'mark', c.ix, c.iz)) && !dhHas(plot, 'wet', c.ix, c.iz) && !dhHas(plot, 'slab', c.ix, c.iz);
        if (!ok) return;
      }
      const w = dhCellWorld(plot, c.ix, c.iz, job === 'pour' ? 0.35 : 0);
      pts.push({plot, ix: c.ix, iz: c.iz, x: w.x, y: w.y, z: w.z, wx: w.x, wz: w.z});
    });
    return pts;
  }
  function dhTargetSpot(job){
    if (!dh) return null;
    job = job || dh.job;
    const pts = dhJobPoints(job);
    const anchors = dhJobAnchors(job);
    const planeY = (job === 'brick' && ((pts[0] && pts[0].y != null) || (anchors[0] && anchors[0].y != null))) ? (pts[0] || anchors[0]).y : (job === 'pour' ? 0.35 : 0);
    const hit = dhTargetFromPoints(pts, planeY, anchors);
    if (hit) return hit;
    if (job === 'brick' && planeY !== 0) return dhTargetFromPoints(pts, 0, anchors);
    return null;
  }
  function dhJobAnchors(job){
    if (!dh) return [];
    job = job || dh.job;
    const plot = dh.mine;
    if (job === 'brick') return (dhAllBrickSlots(plot) || []).map(s => Object.assign({}, s, {plot, x: s.x, y: s.y, z: s.z}));
    return dhFootCells().map(c => {
      const w = dhCellWorld(plot, c.ix, c.iz, job === 'pour' ? 0.35 : 0);
      return {plot, ix: c.ix, iz: c.iz, x: w.x, y: w.y, z: w.z};
    });
  }
  function dhAimFootCell(job){
    return dhTargetSpot(job || 'mark');
  }
  function dhLookRay(){
    // Keyboard / stick / touch all write cam.yaw and cam.pitch. Prefer those so a stale
    // camera (or a chase-camera left over before first person sticks) cannot steal the aim.
    if (typeof cam !== 'undefined' && cam && cam.yaw != null) return dhLookFromCam();
    if (typeof camera !== 'undefined' && camera && camera.position && typeof camera.getWorldDirection === 'function'){
      const d = (typeof THREE !== 'undefined' && THREE.Vector3) ? new THREE.Vector3() : {x:0,y:0,z:-1};
      camera.getWorldDirection(d);
      const o = camera.position;
      return {ox: o.x, oy: o.y, oz: o.z, dx: d.x, dy: d.y, dz: d.z};
    }
    return dhLookFromCam();
  }
  function dhAimCell(){
    if (!dh) return null;
    const ray = dhLookRay();
    // step along the look ray onto the plot
    let hit = null;
    for (let t = 0.8; t <= 8; t += 0.35){
      const cell = dhCellAt(ray.ox + ray.dx * t, ray.oz + ray.dz * t);
      if (cell){ hit = cell; if (cell.plot === dh.mine && dhInFoot(cell.ix, cell.iz)) break; }
    }
    if (hit) return hit;
    const face = (P && P.face) || 0;
    const front = dhCellAt((P.x || 0) + Math.sin(face) * 2.0, (P.z || 0) + Math.cos(face) * 2.0);
    if (front) return front;
    return dhCellAt(P.x || 0, P.z || 0);
  }
  function dhAim(){ return dh.aim || dhAimCell(); }
  function dhCanBuild(aim){ return !!(aim && aim.plot === dh.mine); }
  function dhNearOwnPlot(){
    if (!dh) return false;
    if (dhPlotAt(P.x, P.z) === dh.mine) return true;
    const [ox, oz] = dhOrigin(dh.mine);
    const x0 = ox, z0 = oz, x1 = ox + DH_N * DH_CELL, z1 = oz + DH_N * DH_CELL;
    const px = P.x || 0, pz = P.z || 0;
    const cx = Math.max(x0, Math.min(x1, px)), cz = Math.max(z0, Math.min(z1, pz));
    return Math.hypot(px - cx, pz - cz) < 6;
  }
  function dhFootTaken(plot, ix, iz){
    return dhHas(plot, 'mark', ix, iz) || dhHas(plot, 'trench', ix, iz) || dhHas(plot, 'wet', ix, iz) || dhHas(plot, 'slab', ix, iz);
  }
  function dhFootCells(){
    const plot = dh.mine, foot = dhFoot(), [ox, oz] = dhOrigin(plot);
    const px = P.x || 0, pz = P.z || 0, out = [];
    for (let ix = foot.x0; ix <= foot.x1; ix++) for (let iz = foot.z0; iz <= foot.z1; iz++){
      const w = dhCellWorld(plot, ix, iz);
      out.push({plot, ix, iz, wx: w.x, wz: w.z, dist: Math.hypot(px - w.x, pz - w.z)});
    }
    out.sort((a, b) => a.dist - b.dist);
    return out;
  }
  function dhNextBuildCell(job){
    if (!dh) return null;
    job = job || dh.job;
    const plot = dh.mine;
    const cells = dhFootCells();
    const aim = dhAimCell();
    const aimOk = aim && aim.plot === plot && dhInFoot(aim.ix, aim.iz);
    if (job === 'mark'){
      if (aimOk && !dhFootTaken(plot, aim.ix, aim.iz)) return aim;
      return cells.find(c => !dhFootTaken(plot, c.ix, c.iz)) || null;
    }
    if (job === 'dig'){
      const isMark = (ix, iz) => dhHas(plot, 'mark', ix, iz) && !dhHas(plot, 'trench', ix, iz) && !dhHas(plot, 'wet', ix, iz) && !dhHas(plot, 'slab', ix, iz);
      if (aimOk && isMark(aim.ix, aim.iz)) return aim;
      return cells.find(c => isMark(c.ix, c.iz)) || null;
    }
    if (job === 'pour'){
      const canPour = (ix, iz) => (dhHas(plot, 'trench', ix, iz) || dhHas(plot, 'mark', ix, iz)) && !dhHas(plot, 'wet', ix, iz) && !dhHas(plot, 'slab', ix, iz);
      if (aimOk && canPour(aim.ix, aim.iz)) return aim;
      return cells.find(c => canPour(c.ix, c.iz)) || null;
    }
    if (aimOk) return aim;
    return cells[0] || null;
  }
  function dhWhyNot(){
    if (!dh) return '';
    if (!dhNearOwnPlot() && dhPlotAt(P.x, P.z) !== dh.mine) return '🏡 Walk onto your plot';
    const job = dh.job;
    if (job === 'brick' && !(dh.carry && dh.carry.id === 'brick') && !(dh.stock.brick|0)) return '📦 Grab free bricks at the Supply Yard first';
    if ((job === 'pour' || job === 'mix') && !(dh.carry && (dh.carry.id === 'wetmix' || dh.carry.id === 'cement' || dh.carry.id === 'sand')) && !(dh.stock.cement|0) && !(dh.stock.sand|0)) return '📦 Grab free cement at the Supply Yard first';
    if ((job === 'stud' || job === 'rafter' || job === 'frame') && !(dh.carry && dh.carry.id === 'wood') && !(dh.stock.wood|0)) return '📦 Grab free wood at the Supply Yard first';
    if (job === 'shingle' && !(dh.carry && dh.carry.id === 'shingle') && !(dh.stock.shingle|0)) return '📦 Grab free shingles at the Supply Yard first';
    if (job === 'glass' && !(dh.carry && dh.carry.id === 'glass') && !(dh.stock.glass|0)) return '📦 Grab free glass at the Supply Yard first';
    if (job === 'paint' && !(dh.carry && dh.carry.id === 'paint') && !(dh.stock.paint|0)) return '📦 Grab free paint at the Supply Yard first';
    if (job === 'dig'){
      const c = dhJobCounts('dig'), m = dhJobCounts('mark');
      if (c.have >= c.need) return '🪣 Foundation spots are dug — grab Cement + Sand at the Supply Yard';
      if (m.have < m.need && !dhNextBuildCell('dig')) return '📍 Stake the remaining spots first';
      if (!dhAimFootCell('dig')) return '🎯 Aim at a glowing foundation spot, then press E to dig';
    }
    if (job === 'mark'){
      const c = dhJobCounts('mark');
      if (c.have >= c.need) return '🕳️ The foundation is staked — switch to Dig';
      if (!dhTargetSpot('mark')) return '🎯 Look at a foundation spot so it glows, then press E to place a stake';
    }
    if (job === 'pour' && !dhNextBuildCell('pour')){
      const c = dhJobCounts('dig');
      if (c.have >= c.need) return '🪣 Grab Cement + Sand and mix concrete, then pour';
      return '🕳️ Dig the foundation forms first';
    }
    return '';
  }
  function dhJobCounts(job){
    if (!dh) return {have: 0, need: 0};
    job = job || dh.job;
    const plot = dh.mine, foot = dhFoot();
    let need = 0, have = 0;
    for (let ix = foot.x0; ix <= foot.x1; ix++) for (let iz = foot.z0; iz <= foot.z1; iz++){
      need++;
      if (job === 'mark'){ if (dhFootTaken(plot, ix, iz)) have++; }
      else if (job === 'dig'){ if (dhHas(plot, 'trench', ix, iz) || dhHas(plot, 'wet', ix, iz) || dhHas(plot, 'slab', ix, iz)) have++; }
      else if (job === 'pour'){ if (dhHas(plot, 'wet', ix, iz) || dhHas(plot, 'slab', ix, iz)) have++; }
    }
    return {have, need};
  }
  function dhNearYard(){
    if (!dh) return false;
    return Math.hypot((P.x || 0) - DH_YARD.x, (P.z || 0) - DH_YARD.z) < 8;
  }
  function dhNearFurn(){
    if (!dh) return false;
    return Math.hypot((P.x || 0) - DH_FURN.x, (P.z || 0) - DH_FURN.z) < 7;
  }
  function dhNearUp(){
    if (!dh) return false;
    return Math.hypot((P.x || 0) - DH_UP.x, (P.z || 0) - DH_UP.z) < 7;
  }
  function dhNearestBin(){
    if (!dh || !dh.bins) return null;
    let best = null, bd = 1e9;
    dh.bins.forEach(b => { const d = Math.hypot((P.x || 0) - b.x, (P.z || 0) - b.z); if (d < bd){ bd = d; best = b; } });
    return best;
  }
  const DH_BIN_R = 2.8, DH_BIN_R_IN_YARD = 4.5;
  function dhNearBin(){
    if (!dh || !dh.bins) return null;
    const r = (typeof dhNearYard === 'function' && dhNearYard()) ? DH_BIN_R_IN_YARD : DH_BIN_R;
    const want = (typeof dhWantedSupply === 'function') ? dhWantedSupply() : null;
    let best = null, bd = r, wanted = null, wd = r + 0.8;
    dh.bins.forEach(b => {
      const d = Math.hypot((P.x || 0) - b.x, (P.z || 0) - b.z);
      if (d < bd){ bd = d; best = b; }
      if (want && b.id === want && d < wd){ wd = d; wanted = b; }
    });
    return wanted || best;
  }
  function dhNearMixer(){
    if (!dh) return null;
    const m = dh.mixers[dh.mine]; if (!m) return null;
    return Math.hypot((P.x || 0) - m.x, (P.z || 0) - m.z) < 2.2 ? m : null;
  }
  function dhNearPile(){
    if (!dh) return null;
    const p = dh.piles[dh.mine]; if (!p) return null;
    return Math.hypot((P.x || 0) - p.x, (P.z || 0) - p.z) < 2.4 ? p : null;
  }

  function dhPay(cost){
    cost = +cost || 0;
    if (cost <= 0) return true;
    if (!dh) return false;
    // Milestone coins live in the Dream House bank and are spent only on furniture and upgrades.
    if (dh.bank >= cost){ dh.bank -= cost; return true; }
    return false;
  }
  function dhGive(id, n){ if (!dh) return; dh.stock[id] = (dh.stock[id] || 0) + (n || 1); dhStockViz(dh.mine); }
  function dhCarryCap(id){ const m = dhMatOf(id); const base = m ? m.carry : 1; if (id === 'wetmix') return base + dhUp('barrow'); const carryUp = dhUp('carry') * (id === 'brick' || id === 'shingle' || id === 'wood' ? 4 : 1); const brickUp = (id === 'brick') ? dhUp('brick') * 8 : 0; return base + carryUp + brickUp; }
  function dhMixerPair(a, b){ return (a === 'cement' && b === 'sand') || (a === 'sand' && b === 'cement'); }
  function dhCarryOf(id){
    if (!dh) return 0;
    let n = 0;
    if (dh.carry && dh.carry.id === id) n += dh.carry.n;
    if (dh.bag && dh.bag.id === id) n += dh.bag.n;
    return n;
  }
  function dhInvCount(id){ return (dh && dh.stock ? (dh.stock[id]|0) : 0) + dhCarryOf(id); }
  function dhHasAnyCarry(){ return !!(dh && ((dh.carry && dh.carry.n) || (dh.bag && dh.bag.n))); }
  function dhSetSlot(slot, id, n){ if (!dh) return; dh[slot] = (n > 0 && id) ? {id, n} : null; }
  function dhSetCarry(id, n){ dhSetSlot('carry', id, n); dhHud(); }
  function dhSetBag(id, n){ dhSetSlot('bag', id, n); dhHud(); }
  function dhAddHeld(id, n){
    if (!dh || !id || n <= 0) return 0;
    if (dh.carry && dh.carry.id === id){
      const add = Math.min(n, dhCarryCap(id) - dh.carry.n);
      if (add > 0) dh.carry.n += add;
      return add;
    }
    if (dh.bag && dh.bag.id === id){
      const add = Math.min(n, dhCarryCap(id) - dh.bag.n);
      if (add > 0) dh.bag.n += add;
      return add;
    }
    if (!dh.carry){ const add = Math.min(n, dhCarryCap(id)); dhSetSlot('carry', id, add); return add; }
    if (dhMixerPair(dh.carry.id, id) && !dh.bag){ const add = Math.min(n, dhCarryCap(id)); dhSetSlot('bag', id, add); return add; }
    return 0;
  }
  function dhHeldRefuseMsg(id){
    const have = dh.carry ? ((dhMatOf(dh.carry.id) || {name: dh.carry.id}).name) : 'what you are carrying';
    return '🧺 You are already holding ' + have + '. Dump it (Q) first, or grab Cement + Sand together for the mixer.';
  }
  function dhAutoReturn(keepId){
    if (!dh) return [];
    const put = [];
    ['carry', 'bag'].forEach(slot => {
      const rec = dh[slot];
      if (!rec) return;
      if (keepId && rec.id === keepId) return;
      if (keepId && dhMixerPair(rec.id, keepId)) return;
      if (rec.id === 'wetmix') return;
      dh.stock[rec.id] = (dh.stock[rec.id] || 0) + rec.n;
      put.push(rec.n + ' ' + ((dhMatOf(rec.id) || {name: rec.id}).name));
      dh[slot] = null;
    });
    if (put.length) banner('📦 Put back ' + put.join(' and ') + ' so you can grab the next supply');
    return put;
  }
  function dhBuy(id, count){
    if (!dh) return false;
    if (dh.intro) return false;
    const m = dhMatOf(id); if (!m || m.nosale || m.furn) return false;
    const n = count || m.stack;
    if (dh.carry && dh.carry.id !== id && !(dhMixerPair(dh.carry.id, id) && (!dh.bag || dh.bag.id === id))){
      dhAutoReturn(id);
    }
    const added = dhAddHeld(id, n);
    if (added <= 0){
      const msg = (dh.carry && dh.carry.id !== id && !(dhMixerPair(dh.carry.id, id) && !dh.bag)) ? dhHeldRefuseMsg(id) : '🧺 Your arms are full';
      dh.yardMsg = msg;
      banner(msg);
      return false;
    }
    dh.yardMsg = '';
    dh.foundYard = true;
    const extra = (dh.bag && dh.carry) ? ' You can carry Cement + Sand together for the mixer.' : '';
    banner(m.e + ' Grabbed ' + added + ' ' + m.name.toLowerCase() + ' — free!' + extra);
    dhSave(); dhHud(); dhBar();
    return true;
  }
  function dhDump(){
    if (!dh || !dhHasAnyCarry()) return false;
    if (dh.carry && dh.carry.id === 'wetmix' && !dh.bag){ banner('🪣 Pour the wet mix into a dug form'); return false; }
    const bits = [];
    ['carry', 'bag'].forEach(slot => {
      const rec = dh[slot];
      if (!rec) return;
      if (rec.id === 'wetmix'){ banner('🪣 Pour the wet mix into a dug form'); return; }
      dh.stock[rec.id] = (dh.stock[rec.id] || 0) + rec.n;
      bits.push(rec.n + ' ' + rec.id);
      dh[slot] = null;
    });
    if (!bits.length) return false;
    banner('📦 Stacked ' + bits.join(' and ') + ' on your plot');
    dhStockViz(dh.mine); dhSave(); dhHud(); return true;
  }
  function dhPickup(id, n){
    if (!dh) return false;
    n = n || 1;
    const have = dh.stock[id] || 0;
    if (have < n) return false;
    if (dh.carry && dh.carry.id !== id && !(dhMixerPair(dh.carry.id, id) && (!dh.bag || dh.bag.id === id))) dhAutoReturn(id);
    const take = dhAddHeld(id, Math.min(n, have));
    if (take <= 0){ banner(dhHeldRefuseMsg(id)); return false; }
    dh.stock[id] -= take;
    dhStockViz(dh.mine); dhHud(); return true;
  }
  function dhUseCarry(n, id){
    if (!dh) return false;
    n = n || 1;
    const slot = (id && dh.bag && dh.bag.id === id && dh.bag.n >= n) ? 'bag'
      : (id && dh.carry && dh.carry.id === id && dh.carry.n >= n) ? 'carry'
      : (!id && dh.carry && dh.carry.n >= n) ? 'carry'
      : (!id && dh.bag && dh.bag.n >= n) ? 'bag'
      : null;
    if (!slot) return false;
    dh[slot].n -= n; if (dh[slot].n <= 0) dh[slot] = null;
    dhHud(); return true;
  }
  function dhStockViz(plot){
    if (!dh) return;
    if (dh.piles[plot] && dh.piles[plot].mesh){ scene.remove(dh.piles[plot].mesh); }
    const [ox, oz] = dhOrigin(plot);
    const x = ox - 1.5, z = oz + DH_N * DH_CELL - 1.2;
    const g = new THREE.Group(); g.position.set(x, 0, z);
    const stock = plot === dh.mine ? dh.stock : dhEmptyStock();
    let row = 0;
    ['brick', 'cement', 'sand', 'wood', 'shingle', 'glass'].forEach(id => {
      const n = stock[id] | 0; if (!n) return;
      const mat = id === 'brick' ? dh.mats.brick : id === 'wood' || id === 'shingle' ? dh.mats.wood : id === 'sand' ? dhMat('#e5c574') : dh.mats.bag;
      const h = Math.min(8, n) * (id === 'brick' ? .12 : .16);
      const m = new THREE.Mesh(new THREE.BoxGeometry(.8, Math.max(.16, h), .8), mat);
      m.position.set((row % 3) * .95, Math.max(.16, h) / 2, ((row / 3) | 0) * .95);
      g.add(m); row++;
    });
    scene.add(g);
    dh.piles[plot] = {x, z, mesh: g};
  }

  function dhMix(){
    const mx = dhNearMixer(); if (!mx) return false;
    const loaded = [];
    ['cement', 'sand'].forEach(id => {
      if (dhCarryOf(id) >= 1 && dhUseCarry(1, id)){ mx[id] = (mx[id] || 0) + 1; loaded.push(id); }
    });
    if (loaded.length){
      banner((loaded[0] === 'cement' ? '🪨' : '🏖️') + ' Loaded ' + loaded.join(' + ') + ' into the mixer');
      return true;
    }
    if (mx.phase === 'mixing') return false;
    if ((mx.cement | 0) >= 1 && (mx.sand | 0) >= 1){
      mx.cement--; mx.sand--; mx.phase = 'mixing'; mx.mixT = 2.2 / (1 + dhUp('dry') * .6);
      banner('🌀 Mixing concrete…');
      return true;
    }
    banner('🪨 Add a cement bag and 🏖️ sand, then mix');
    return false;
  }
  function dhFillBarrow(){
    const mx = dhNearMixer(); if (!mx) return false;
    if (mx.phase === 'mixing'){ banner('🌀 Still mixing…'); return false; }
    if ((mx.mixed | 0) < 1) return false;
    if ((dh.carry && dh.carry.id !== 'wetmix') || (dh.bag && dh.bag.id !== 'wetmix')){ banner('🧺 Dump your load first'); return false; }
    if (dh.carry && dh.carry.n >= dhCarryCap('wetmix')){ banner('🪣 The barrow is already full'); return false; }
    mx.mixed--; dhSetCarry('wetmix', 1);
    if ((mx.mixed | 0) < 1) mx.phase = 'idle';
    banner('🪣 Wheelbarrow filled with wet concrete');
    return true;
  }
  function dhPour(){
    if (!dh || !dh.carry || dh.carry.id !== 'wetmix') return false;
    if (!dhNearOwnPlot()){ banner('🏡 Walk onto your plot'); return false; }
    const aim = dhTargetSpot('pour');
    if (!aim){ banner(dhWhyNot() || '🎯 Aim at a dug foundation spot, then press E to pour'); return false; }
    if (!dhHas(aim.plot, 'trench', aim.ix, aim.iz) && !dhHas(aim.plot, 'mark', aim.ix, aim.iz)){ banner('🕳️ Dig or stake the form first'); return false; }
    if (dhHas(aim.plot, 'wet', aim.ix, aim.iz) || dhHas(aim.plot, 'slab', aim.ix, aim.iz)) return false;
    const trench = dhFind(aim.plot, 'trench', aim.ix, aim.iz) || dhFind(aim.plot, 'mark', aim.ix, aim.iz);
    if (trench) dhRemoveAtKey(aim.plot, dhKeyOf(trench), true);
    dhUseCarry(1);
    const rec = ['wet', aim.ix, 0, aim.iz, 0, 0, 0]; // [6] = age
    dhPut(aim.plot, rec);
    banner('🪣 Poured the form — let it set, then smooth it');
    dhNet('place', {rec, plot: aim.plot});
    return true;
  }
  function dhSmooth(aim){
    if (!dh) return false;
    if (!dhNearOwnPlot()) return false;
    aim = aim || dhAimCell();
    let wet = (aim && dhCanBuild(aim)) ? dhFind(aim.plot, 'wet', aim.ix, aim.iz) : null;
    if (!wet || (wet[6] || 0) < dhDryNeed()){
      const hit = dhFootCells().find(c => { const w = dhFind(dh.mine, 'wet', c.ix, c.iz); return w && (w[6] || 0) >= dhDryNeed(); });
      if (hit){ aim = hit; wet = dhFind(dh.mine, 'wet', hit.ix, hit.iz); }
    }
    if (!aim || !wet || (wet[6] || 0) < dhDryNeed()) return false;
    dhRemoveAtKey(aim.plot, dhKeyOf(wet), true);
    dhPut(aim.plot, ['slab', aim.ix, 0, aim.iz, 0, 0]);
    banner('🧹 Smoothed the slab');
    return true;
  }
  function dhPlaceBrick(){
    if (!dh) return false;
    if (!dh.carry || dh.carry.id !== 'brick') return false;
    if (!dhNearOwnPlot() && !dhCanBuild(dhAimCell())){ banner('🏡 Walk onto your plot'); return false; }
    let aim = dhAimCell() || dhNextBuildCell('brick');
    if ((!aim || aim.plot !== dh.mine) && dhNearOwnPlot()){
      const c = dhFootCells()[0];
      if (c) aim = c;
    }
    if (!aim || aim.plot !== dh.mine){ banner('🏡 Walk onto your plot'); return false; }
    let face = dhWallFaceFromAim(aim);
    if (face == null && dhNearOwnPlot()) face = 0;
    if (face == null) return false;
    // require a slab under the wall line
    if (!dhSlabReady(aim.plot)){ banner('⬜ Pour and smooth a concrete slab first'); return false; }
    const aimed = dhAimBrickSlot();
    const slotFace = (aimed && aimed.face != null) ? aimed.face : face;
    const slot = (aimed && !aimed.filled) ? aimed : dhNextBrick(aim.plot, slotFace, aim);
    if (!slot || slot.filled){ banner('🧱 That stretch is already laid (or it is an opening)'); return false; }
    if (!dh.carry || dh.carry.id !== 'brick' || dh.carry.n < 1){ banner('🧱 Grab more bricks at the Supply Yard'); return false; }
    // One brick per click / E / RT — never auto-lay a row.
    dhUseCarry(1);
    if ((dh.stock.mortar | 0) > 0) dh.stock.mortar--;
    const rec = ['brick', 0, slot.course, slot.along, slot.face, 0];
    dhPut(aim.plot, rec);
    dhNet('place', {rec, plot: aim.plot});
    dhSyncBricks(aim.plot);
    return true;
  }
  function dhSlotWorld(plot, face, course, along){
    return dhWorldRec(plot, ['brick', 0, course, along, face, 0]);
  }
  function dhAllBrickSlots(plot){
    const list = [];
    const have = (dh.pieces[plot] || []).filter(a => a[0] === 'brick');
    for (let face = 0; face < 4; face++){
      const span = dhBrickAlongCount(face);
      for (let c = 0; c < dhCourses(); c++) for (let k = 0; k < span; k++){
        if (dhIsOpening(face, c, k)) continue;
        const filled = have.some(a => (a[4]|0) === face && (a[2]|0) === c && (a[3]|0) === k);
        const w = dhSlotWorld(plot, face, c, k);
        list.push({plot, face, course: c, along: k, filled, x: w.x, y: w.y, z: w.z, ry: w.ry || 0});
      }
    }
    return list;
  }
  function dhAimBrickSlot(){
    return dhTargetSpot('brick');
  }
  function dhDryNeed(){ return 1.6 / (1 + dhUp('dry') * .7); }
  function dhDryDone(){ return 5 / (1 + dhUp('dry') * .8); }
  function dhSlabReady(plot){ return dhCount(dh.pieces[plot], 'slab') >= 8; }
  function dhWallFaceFromAim(aim){
    const [ox, oz] = dhOrigin(aim.plot);
    const foot = dhFoot();
    const x0 = ox + foot.x0 * DH_CELL, z0 = oz + foot.z0 * DH_CELL;
    const x1 = ox + (foot.x1 + 1) * DH_CELL, z1 = oz + (foot.z1 + 1) * DH_CELL;
    const wx = aim.wx, wz = aim.wz;
    const ds = Math.abs(wz - z0), dn = Math.abs(wz - z1), de = Math.abs(wx - x1), dw = Math.abs(wx - x0);
    const m = Math.min(ds, dn, de, dw);
    if (m > 2.8) return null;
    if (m === ds) return 0; if (m === dn) return 2; if (m === de) return 1; return 3;
  }
  function dhNextBrick(plot, face, aim){
    face = (face == null) ? 0 : face;
    const span = dhBrickAlongCount(face);
    const have = (dh.pieces[plot] || []).filter(a => a[0] === 'brick' && (a[4]|0) === face);
    for (let c = 0; c < dhCourses(); c++) for (let k = 0; k < span; k++){
      if (dhIsOpening(face, c, k)) continue;
      if (!have.some(a => (a[2]|0) === c && (a[3]|0) === k)){
        const w = dhSlotWorld(plot, face, c, k);
        return {plot, face, course: c, along: k, filled: false, x: w.x, y: w.y, z: w.z, ry: w.ry || 0};
      }
    }
    return null;
  }
  function dhOpenFrames(plot){
    const list = dh.pieces[plot] || [];
    return list.filter(a => a[0] === 'winframe' && !list.some(pn => pn[0] === 'pane' && dhSameOpening(pn, a)));
  }
  function dhInstallGlass(){
    if (!dh) return false;
    if (!dh.carry || dh.carry.id !== 'glass'){ banner('🪟 Carry a glass pane from the Supply Yard'); return false; }
    const aim = dhAimCell(); if (!dhCanBuild(aim)) return false;
    const frames = (dh.pieces[aim.plot] || []).filter(a => a[0] === 'winframe');
    if (!frames.length){ banner('🪟 Set a window frame first'); return false; }
    const face = dhWallFaceFromAim(aim);
    const open = dhOpenFrames(aim.plot);
    if (!open.length){ banner('🪟 Every window already has glass'); return false; }
    const frame = (face != null && open.find(f => (f[4]|0) === face)) || open[0];
    dhUseCarry(1);
    const rec = ['pane', frame[1]|0, frame[2]|0, frame[3]|0, frame[4]|0, 0];
    if (!dhPut(aim.plot, rec)) return false;
    dhNet('place', {rec, plot: aim.plot});
    banner('🪟 Set the glass in the frame');
    return true;
  }
  function dhPlaceKind(id, extra){
    if (id === 'pane') return dhInstallGlass();
    const aim = dhAimCell(); if (!dhCanBuild(aim)) return false;
    const rec = [id, aim.ix, 0, aim.iz, dh.rot | 0, dh.color | 0];
    if (id === 'rafter' || id === 'shingle') rec[4] = (aim.iz < (DH_FOOT.z0 + DH_FOOT.z1) / 2) ? 0 : 1;
    if (id === 'doorframe' || id === 'door' || id === 'winframe' || id === 'pane'){
      rec[4] = dhWallFaceFromAim(aim) || 0; rec[1] = 0; rec[3] = 0;
    }
    if ((dh.pieces[aim.plot] || []).some(a => dhKeyOf(a) === dhKeyOf(rec))) return false;
    if (id === 'stud' || id === 'rafter'){ if (!dh.carry || dh.carry.id !== 'wood'){ banner('🪵 Carry planks from the yard or your pile'); return false; } dhUseCarry(1); }
    if (id === 'shingle'){ if (!dh.carry || dh.carry.id !== 'shingle'){ banner('🏠 Carry shingles to the roof'); return false; } dhUseCarry(1); }
    if (id === 'doorframe' || id === 'winframe'){ if (!dh.carry || dh.carry.id !== 'wood'){ banner('🪵 Carry planks to frame the opening'); return false; } dhUseCarry(1); }
    if (id === 'door'){ if (!dhHas(aim.plot, 'doorframe', 0, 0) && !(dh.pieces[aim.plot] || []).some(a => a[0] === 'doorframe')){ banner('🚪 Set the door frame in the opening first'); return false; } if (dh.carry && dh.carry.id === 'wood') dhUseCarry(1); }
    if (id === 'paint'){ if (!dh.carry || dh.carry.id !== 'paint'){ banner('🎨 Carry a paint can'); return false; } dhUseCarry(1); }
    if (['sofa','bed','table','lamp','plant','rug','tv','shelf'].indexOf(id) >= 0){ if (!dh.carry || dh.carry.id !== id){ banner('🛋️ Carry that piece from the shop or yard'); return false; } dhUseCarry(1); }
    if (!dhPut(aim.plot, rec)) return false;
    dhNet('place', {rec, plot: aim.plot}); return true;
  }
  function dhMarkOrDig(){
    if (!dh) return false;
    if (!dhNearOwnPlot()){ banner('🏡 Walk onto your plot'); return false; }
    const digging = dh.job === 'dig';
    const aim = dhAimFootCell(digging ? 'dig' : 'mark');
    if (!aim){
      banner(dhWhyNot() || (digging ? '🎯 Look at a staked spot so it glows, then press E to dig' : '🎯 Look at a foundation spot so it glows, then press E to place a stake'));
      return false;
    }
    if (digging || dhHas(aim.plot, 'mark', aim.ix, aim.iz)){
      if (dhHas(aim.plot, 'trench', aim.ix, aim.iz) || dhHas(aim.plot, 'wet', aim.ix, aim.iz) || dhHas(aim.plot, 'slab', aim.ix, aim.iz)){
        banner('🕳️ That form is already dug'); return false;
      }
      const mark = dhFind(aim.plot, 'mark', aim.ix, aim.iz); if (mark) dhRemoveAtKey(aim.plot, dhKeyOf(mark), true);
      dhPut(aim.plot, ['trench', aim.ix, 0, aim.iz, 0, 0]);
      dhNet('place', {rec: ['trench', aim.ix, 0, aim.iz, 0, 0], plot: aim.plot});
      return true;
    }
    if (dhFootTaken(aim.plot, aim.ix, aim.iz)){ banner('📍 That spot is already started'); return false; }
    dhPut(aim.plot, ['mark', aim.ix, 0, aim.iz, 0, 0]);
    dhNet('place', {rec: ['mark', aim.ix, 0, aim.iz, 0, 0], plot: aim.plot});
    return true;
  }

  function dhPlace(){
    if (!dh) return false;
    if (dh.intro) return false;
    if (dh.tool === 'delete'){
      const aim = dhAimCell(); if (!dhCanBuild(aim)) return false;
      const ok = dhRemoveAt(aim.plot, aim.ix, 0, aim.iz) || dhRemoveAt(aim.plot, 0, 0, aim.iz);
      if (ok){ dhNet('del', aim); dhHud(); } return ok;
    }
    if (dh.job === 'mark' || dh.job === 'dig') return dhMarkOrDig();
    if (dh.job === 'pour' || (dh.carry && dh.carry.id === 'wetmix')){
      if (dh.carry && dh.carry.id === 'wetmix') return dhPour();
      if (dhSmooth()) return true;
      return dhPour();
    }
    if (dh.job === 'brick' || (dh.carry && dh.carry.id === 'brick')) return dhPlaceBrick();
    if (dh.job === 'stud') return dhPlaceKind('stud');
    if (dh.job === 'rafter') return dhPlaceKind('rafter');
    if (dh.job === 'shingle') return dhPlaceKind('shingle');
    if (dh.job === 'glass' || (dh.carry && dh.carry.id === 'glass' && dh.job !== 'frame')) return dhInstallGlass();
    if (dh.job === 'frame'){
      if ((dh.pieces[dh.mine] || []).some(a => a[0] === 'doorframe') && !((dh.pieces[dh.mine] || []).some(a => a[0] === 'door'))) return dhPlaceKind('door');
      const aim = dhAimCell(); const face = aim && dhWallFaceFromAim(aim);
      if (face === 0) return dhPlaceKind('doorframe');
      return dhPlaceKind('winframe');
    }
    if (dh.job === 'paint') return dhPlaceKind('paint');
    if (dh.job === 'furn' && dh.carry && dhMatOf(dh.carry.id) && dhMatOf(dh.carry.id).furn) return dhPlaceKind(dh.carry.id);
    // generic: if carrying a furniture/paint/shingle etc, place it
    if (dh.carry && dhMatOf(dh.carry.id) && dhMatOf(dh.carry.id).furn) return dhPlaceKind(dh.carry.id);
    if (dh.carry && dh.carry.id === 'shingle') return dhPlaceKind('shingle');
    if (dh.carry && dh.carry.id === 'wood') return dhPlaceKind(dh.job === 'rafter' ? 'rafter' : 'stud');
    if (dh.carry && dh.carry.id === 'paint') return dhPlaceKind('paint');
    if (dh.carry && dh.carry.id === 'glass') return dhPlaceKind('pane');
    // trowel smooth
    if (dhSmooth()) return true;
    return false;
  }
  function dhRotate(){ if (!dh) return false; dh.rot = ((dh.rot | 0) + 1) % 4; dhHud(); return true; }
  function dhCycle(dir){ if (!dh) return; const i = DH_JOBS.indexOf(dh.job); dh.job = DH_JOBS[(i + dir + DH_JOBS.length) % DH_JOBS.length]; dhBar(); dhHud(); }
  function dhCycleColor(dir){ if (!dh) return; dh.color = (dh.color + dir + DH_PAINT.length) % DH_PAINT.length; dhHud(); dhBar(); }
  function dhSetTool(t){ if (!dh) return; dh.tool = t; dhBar(); dhHud(); }
  function dhSetStory(){ return false; }
  function dhSetJob(j){ if (!dh) return; dh.job = j; dh.tool = 'place'; dhBar(); dhHud(); }

  function dhAct(){
    if (!dh) return;
    if (dh.intro) return dhSkipIntro();
    if (dh.yardOpen){ dhToggleYard(false); return; }
    if (dh.shopOpen){ dhToggleShop(false); return; }
    if (dh.upOpen){ dhToggleUp(false); return; }
    const plot = dhPlotAt(P.x, P.z);
    if (plot >= 0 && plot !== dh.mine) return dhLike();
    const mx = dhNearMixer();
    const pileHere = dhNearPile();
    const bin = dhNearBin();
    if (bin && !mx && !pileHere){ return dhBuy(bin.id); }
    if (dhNearYard() && !mx && !pileHere){ dhToggleYard(true); return true; }
    if (dhNearFurn() && !mx && !pileHere){ dhToggleShop(true); return true; }
    if (dhNearUp() && !mx && !pileHere){ dhToggleUp(true); return true; }
    if (mx && !(dh.carry && dh.carry.id === 'wetmix')){
      if (dh.carry && (dh.carry.id === 'cement' || dh.carry.id === 'sand')) return dhMix();
      if ((mx.cement | 0) >= 1 && (mx.sand | 0) >= 1 && mx.phase !== 'ready') return dhMix();
      if ((mx.mixed | 0) >= 1) return dhFillBarrow();
      return dhMix();
    }
    if (dh.carry && dh.carry.id !== 'wetmix' && dhNearPile() && dh.job !== 'brick' && dh.job !== 'pour') return dhDump();
    const pile = dhNearPile();
    if (pile && !dh.carry){
      const want = dh.job === 'brick' ? 'brick' : dh.job === 'rafter' || dh.job === 'stud' || dh.job === 'frame' ? 'wood' : dh.job === 'shingle' ? 'shingle' : dh.job === 'glass' ? 'glass' : dh.job === 'paint' ? 'paint' : (dh.job === 'mix' || dh.job === 'pour') ? ((dh.mixers[dh.mine] && (dh.mixers[dh.mine].cement|0) >= 1 && (dh.mixers[dh.mine].sand|0) < 1 ? ['sand','cement'] : ['cement','sand']).find(id => (dh.stock[id]|0) > 0)) : dh.job === 'furn' ? (['sofa','bed','table','lamp','plant','rug','tv','shelf'].find(id => (dh.stock[id]|0) > 0)) : null;
      if (want && (dh.stock[want]|0) > 0) return dhPickup(want, want === 'brick' ? 8 : 1);
      const first = ['brick','wood','shingle','cement','sand','glass','paint'].find(id => (dh.stock[id]|0) > 0);
      if (first) return dhPickup(first, first === 'brick' ? 8 : 1);
    }
    const ok = dhPlace();
    if (!ok){ const why = dhWhyNot(); if (why) banner(why); }
    return ok;
  }
  function dhLike(){
    if (!dh) return false;
    const plot = dhPlotAt(P.x, P.z);
    if (plot < 0 || plot === dh.mine) return false;
    if (dh.liked[plot]){ banner('💛 You already liked this house!'); return false; }
    dh.liked[plot] = 1; dhNet('like', {plot, from: dhWho()}); banner('💛 Loved that house!'); return true;
  }
  function dhTakeLike(){ if (!dh) return; dh.likes = (dh.likes | 0) + 1; dh.bank += 5; dh.earned += 5; if (typeof setCoins === 'function') setCoins((typeof coins === 'number' ? coins : 0) + 5); dhSave(); banner('💛 A visitor liked your house! +5 🪙'); dhHud(); }

  function dhCheckGoals(){
    if (!dh) return;
    const mine = dh.pieces[dh.mine] || [];
    DH_GOALS.forEach(g => {
      if (dh.goals[g.id]) return;
      if (g.need(mine)){
        dh.goals[g.id] = 1; dh.bank += g.pay; dh.earned += g.pay;
        if (typeof setCoins === 'function') setCoins((typeof coins === 'number' ? coins : 0) + g.pay);
        if (typeof runCoins !== 'undefined') runCoins = (runCoins || 0) + g.pay;
        if (typeof SND !== 'undefined' && SND.coin) SND.coin();
        banner('✨ ' + g.name + '! +' + g.pay + ' 🪙');
      }
    });
    dhSave();
  }
  function dhNet(a, data){
    if (!dh || typeof mp === 'undefined' || !mp || !mp.on) return;
    const msg = Object.assign({t: 'dhact', a, who: dhWho(), plot: dh.mine}, data || {});
    if (typeof mpSendTo === 'function' && dhIsGuest() && mp.hconn) mpSendTo(mp.hconn, msg);
    else if (typeof mpBroadcast === 'function') mpBroadcast(msg);
  }
  function dhWire(){ return dh && {mine: dh.mine, who: dhWho(), plots: Object.fromEntries(Object.keys(dh.pieces).map(k => [k, dhSerialize(+k)])), likes: dh.likes, bank: dh.bank, stock: dh.stock}; }
  function dhFromHost(w){
    if (!dh || !w || !w.plots) return;
    Object.keys(w.plots).forEach(k => {
      const plot = +k; if (plot === dh.mine) return;
      const recs = w.plots[k] || [];
      if (JSON.stringify(dhSerialize(plot)) !== JSON.stringify(recs)) dhApplyPlot(plot, recs, true);
    });
  }
  function dhGuestMsg(g, d){
    if (!dh || !d) return;
    const plot = (d.plot | 0);
    if (d.a === 'like'){ if (plot === dh.mine) dhTakeLike(); return; }
    if (plot === dh.mine) return; // owner of this client plot is local authority
    if (d.a === 'place' && d.rec) dhPut(plot, d.rec, true);
    if (d.a === 'del') dhRemoveAt(plot, d.ix, d.iy, d.iz, true);
    if (d.a === 'paint' && d.pieces) dhApplyPlot(plot, d.pieces, true);
  }


  function dhShopBuyFurn(id){
    if (!dh) return false;
    const m = dhMatOf(id); if (!m || !m.furn) return false;
    if (!dhPay(m.cost)){ banner('🪙 Need ' + m.cost + ' coins for ' + m.name); return false; }
    dh.stock[id] = (dh.stock[id] || 0) + 1;
    banner(m.e + ' Bought a ' + m.name + ' — pick it up and place it!');
    dhSave(); dhHud(); dhBar(); dhRenderShop();
    return true;
  }
  function dhBuyUpgrade(id){
    if (!dh) return false;
    const u = DH_UPGRADES.find(x => x.id === id); if (!u) return false;
    const have = dhUp(id);
    if (have >= u.max){ banner('✨ ' + u.name + ' is already maxed'); return false; }
    if (!dhPay(u.cost)){ banner('🪙 Need ' + u.cost + ' coins for ' + u.name); return false; }
    dh.upgrades[id] = have + 1;
    banner(u.e + ' ' + u.name + ' upgraded!');
    dhSave(); dhHud(); dhBar(); dhRenderUp();
    return true;
  }
  function dhCloseMenus(){
    if (!dh) return;
    if (dh.yardOpen) dhToggleYard(false);
    if (dh.shopOpen) dhToggleShop(false);
    if (dh.upOpen) dhToggleUp(false);
  }
  function dhAnyMenuOpen(){ return !!(dh && (dh.yardOpen || dh.shopOpen || dh.upOpen)); }
  function dhToggleYard(on){
    if (!dh) return;
    if (dh.intro) return;
    if (on !== false){ dhToggleShop(false); dhToggleUp(false); }
    dh.yardOpen = on == null ? !dh.yardOpen : !!on;
    if (dh.yardOpen) dh.foundYard = true;
    const el = $('#dhYard');
    if (el){ el.style.display = dh.yardOpen ? '' : 'none'; if (dh.yardOpen) el.classList.add('show'); else el.classList.remove('show'); }
    if (dh.yardOpen) dhRenderYard();
  }
  function dhRenderYard(){
    const el = $('#dhYard'); if (!el || !dh) return;
    const items = dhSupplyMats().map(m => {
      const n = dhInvCount(m.id);
      return '<button class="dhsitem" data-dhbuy="' + m.id + '"><span class="dhe">' + m.e + '</span><b>' + m.name + '</b><small>Free' + (n ? ' · have ' + n : '') + '</small></button>';
    }).join('');
    const msg = dh.yardMsg ? '<p class="dhyardmsg" id="dhYardMsg">' + dh.yardMsg + '</p>' : '<p class="dhsbank">Press E at a pile, or tap a button. You can carry Cement + Sand together for the mixer.</p>';
    el.innerHTML = '<div class="dhsbox"><div class="dhshead"><h3>📦 Supply Yard — Free Supplies</h3><button class="dhb" id="dhYardX">Close</button></div><div class="dhsbody">' + msg + '<div class="dhsgrid">' + items + '</div></div></div>';
  }
  function dhToggleShop(on){
    if (!dh) return;
    if (dh.intro) return;
    // opening a shop must never move the player or camera
    if (on !== false){ dhToggleYard(false); dhToggleUp(false); }
    dh.shopOpen = on == null ? !dh.shopOpen : !!on;
    if (dh.shopOpen) dh.foundFurn = true;
    const el = $('#dhShop');
    if (el){ el.style.display = dh.shopOpen ? '' : 'none'; if (dh.shopOpen) el.classList.add('show'); else el.classList.remove('show'); }
    if (dh.shopOpen) dhRenderShop();
  }
  function dhRenderShop(){
    const el = $('#dhShop'); if (!el || !dh) return;
    const furn = DH_MATS.filter(m => m.furn).map(m => {
      const n = dh.stock[m.id] | 0;
      return '<button class="dhsitem" data-dhbuy="' + m.id + '"><span class="dhe">' + m.e + '</span><b>' + m.name + '</b><small>' + m.cost + '🪙' + (n ? ' · have ' + n : '') + '</small></button>';
    }).join('');
    el.innerHTML = '<div class="dhsbox"><div class="dhshead"><h3>🛋️ Furniture Store</h3><button class="dhb" id="dhShopX">Close</button></div><div class="dhsbody"><p class="dhsbank">🪙 ' + Math.floor(dh.bank) + ' coins · earned from build milestones</p><div class="dhsgrid">' + furn + '</div></div></div>';
  }
  function dhToggleUp(on){
    if (!dh) return;
    if (dh.intro) return;
    if (on !== false){ dhToggleYard(false); dhToggleShop(false); }
    dh.upOpen = on == null ? !dh.upOpen : !!on;
    if (dh.upOpen) dh.foundUp = true;
    const el = $('#dhUp');
    if (el){ el.style.display = dh.upOpen ? '' : 'none'; if (dh.upOpen) el.classList.add('show'); else el.classList.remove('show'); }
    if (dh.upOpen) dhRenderUp();
  }
  function dhRenderUp(){
    const el = $('#dhUp'); if (!el || !dh) return;
    const ups = DH_UPGRADES.map(u => {
      const have = dhUp(u.id);
      const maxed = have >= u.max;
      return '<button class="dhsitem' + (maxed ? ' max' : '') + '" data-dhup="' + u.id + '"' + (maxed ? ' disabled' : '') + '><span class="dhe">' + u.e + '</span><b>' + u.name + '</b><small>' + (maxed ? 'Max ' + have + '/' + u.max : u.cost + '🪙 · ' + have + '/' + u.max) + '<br>' + u.desc + '</small></button>';
    }).join('');
    el.innerHTML = '<div class="dhsbox"><div class="dhshead"><h3>🔧 Upgrades</h3><button class="dhb" id="dhUpX">Close</button></div><div class="dhsbody"><p class="dhsbank">🪙 ' + Math.floor(dh.bank) + ' coins · earned from build milestones</p><div class="dhsgrid">' + ups + '</div></div></div>';
  }
  function dhCineRecs(){
    const recs = [];
    for (let ix = DH_FOOT.x0; ix <= DH_FOOT.x1; ix++) for (let iz = DH_FOOT.z0; iz <= DH_FOOT.z1; iz++) recs.push(['slab', ix, 0, iz, 0, 0]);
    const span = Math.floor(((DH_FOOT.x1 - DH_FOOT.x0 + 1) * DH_CELL) / DH_BRICK_W);
    for (let face = 0; face < 4; face++) for (let c = 0; c < DH_COURSES; c++) for (let k = 0; k < span; k++){
      if (dhIsOpening(face, c, k)) continue;
      recs.push(['brick', 0, c, k, face, 0]);
    }
    recs.push(['doorframe', 0, 0, 0, 0, 0], ['door', 0, 0, 0, 0, 0], ['winframe', 0, 3, 0, 1, 0], ['pane', 0, 3, 0, 1, 0]);
    for (let ix = DH_FOOT.x0; ix <= DH_FOOT.x1; ix++){
      recs.push(['rafter', ix, 0, 3, 0, 0], ['rafter', ix, 0, 4, 1, 0], ['shingle', ix, 0, 3, 0, 0], ['shingle', ix, 0, 4, 1, 0]);
    }
    recs.push(['paint', 3, 0, 1, 0, 1], ['sofa', 3, 0, 3, 0, 0], ['table', 4, 0, 4, 0, 0], ['plant', 2, 0, 4, 0, 0]);
    return recs;
  }
  function dhLotCenter(plot){
    const [ox, oz] = dhOrigin(plot == null ? (dh ? dh.mine : 0) : plot);
    return {x: ox + DH_N * DH_CELL / 2, z: oz + DH_N * DH_CELL / 2, ox, oz};
  }
  function dhSetPiecesVisible(on){
    if (!dh) return;
    Object.keys(dh.meshes || {}).forEach(k => (dh.meshes[k] || []).forEach(m => { if (m) m.visible = !!on; }));
    Object.keys(dh.piles || {}).forEach(k => { if (dh.piles[k] && dh.piles[k].mesh) dh.piles[k].mesh.visible = !!on; });
    Object.keys(dh.mixers || {}).forEach(k => { if (dh.mixers[k] && dh.mixers[k].mesh) dh.mixers[k].mesh.visible = !!on; });
  }
  function dhSay(text){
    const b = $('#dhBubble'), s = $('#dhSay');
    if (s) s.textContent = text || '';
    if (b){ b.style.display = text ? '' : 'none'; if (text) b.classList.add('show'); else b.classList.remove('show'); }
  }
  function dhSetCutCap(text){
    const cap = $('#dhCutCap');
    if (!cap) return;
    cap.textContent = text || 'Story time — Mom is showing you the lot';
    cap.style.display = '';
  }
  function dhSetFade(a){
    const f = $('#dhFade'); if (!f) return;
    f.style.opacity = String(Math.max(0, Math.min(1, a)));
    f.style.pointerEvents = 'none';
  }
  function dhStartIntro(replay){
    if (!dh) return false;
    dhToggleShop(false);
    dh.intro = {t: 0, stage: 'house', dur: {house: 3.4, flood: 3.8, rebuild: 2.8, fadeout: 1.1, fadein: 1.3}, replay: !!replay};
    dhSetPiecesVisible(false);
    if (typeof model !== 'undefined' && model && model.g) model.g.visible = false;
    const c = dhLotCenter(dh.mine);
    const house = new THREE.Group(); house.position.set(c.x, 0, c.z);
    if (typeof scene !== 'undefined') scene.add(house);
    dhCineRecs().forEach(rec => {
      const m = dhMeshFor(rec, dh.mine);
      m.position.x -= c.x; m.position.z -= c.z;
      house.add(m);
    });
    const mom = dhMomMesh();
    mom.position.set(c.x + 1.7, 0, c.z - 6.4);
    mom.rotation.y = Math.PI + 0.35;
    if (typeof scene !== 'undefined') scene.add(mom);
    const water = new THREE.Mesh(new THREE.CylinderGeometry(16, 16, .6, 32), dhMat('#6ecbff', {transparent: true, opacity: .72}));
    water.position.set(c.x, -1.2, c.z); water.visible = false;
    if (typeof scene !== 'undefined') scene.add(water);
    dh.cut = {house, mom, water, c};
    const wrap = $('#dhCut'); if (wrap){ wrap.style.display = ''; wrap.classList.add('show'); }
    const skip = $('#dhSkip'); if (skip){ skip.style.display = 'block'; skip.classList.add('show'); skip.textContent = 'Skip ▶'; }
    const cap = $('#dhCutCap'); if (cap){ cap.style.display = ''; cap.textContent = 'Story time — Mom is showing you the lot'; }
    dhSay('This is your new house!');
    dhSetFade(0);
    ['#dhBar', '#dhAct', '#dhInv', '#dhCarry', '#dhHand'].forEach(id => { const el = $(id); if (el){ el.classList.remove('show'); el.style.display = 'none'; } });
    if (typeof document !== 'undefined' && document.getElementById){
      const root = document.getElementById('obby');
      if (root && root.classList){ root.classList.add('dh-intro'); root.classList.remove('paused', 'dh-paused'); }
    }
    dhIntroCam();
    return true;
  }
  function dhReplayIntro(){
    if (!dh) return false;
    if (typeof setPause === 'function') setPause(false);
    return dhStartIntro(true);
  }
  function dhSkipIntro(){
    if (!dh || !dh.intro) return false;
    const skip = $('#dhSkip'); if (skip && skip.blur) try { skip.blur(); } catch (e){}
    if (typeof document !== 'undefined' && document.activeElement && document.activeElement.blur){
      const ae = document.activeElement;
      if (ae && ae.closest && ae.closest('#dhSkip, #dhCut, .dhskip, button')) try { ae.blur(); } catch (e){}
    }
    dhFinishIntro();
    return true;
  }
  function dhGrantStarterStock(){
    if (!dh) return false;
    const empty = !(dh.pieces[dh.mine] || []).length;
    if (!empty) return false;
    if (dh._starterGranted) return false;
    dh.stock.brick = (dh.stock.brick | 0) + 16;
    dh.stock.cement = (dh.stock.cement | 0) + 2;
    dh.stock.sand = (dh.stock.sand | 0) + 2;
    dh.stock.wood = (dh.stock.wood | 0) + 8;
    dh.stock.shingle = (dh.stock.shingle | 0) + 12;
    dh.stock.paint = (dh.stock.paint | 0) + 1;
    dh._starterGranted = true;
    dhStockViz(dh.mine);
    return true;
  }
  function dhFinishIntro(){
    if (!dh) return;
    const first = !dh.introSeen;
    const replay = !!(dh.intro && dh.intro.replay);
    if (dh.cut){
      ['house', 'mom', 'water'].forEach(k => { if (dh.cut[k] && typeof scene !== 'undefined') scene.remove(dh.cut[k]); });
      dh.cut = null;
    }
    dhSetPiecesVisible(true);
    if (typeof model !== 'undefined' && model && model.g) model.g.visible = true;
    dh.intro = null;
    dh.introSeen = true;
    // A reset is the same as a brand-new game: after the intro (or Skip) an empty
    // lot gets the starter pile (16 bricks, 2 cement, 2 sand, 8 planks, 12 shingles, 1 paint).
    if (first && !replay) dhGrantStarterStock();
    dhSave();
    dhSetFade(0);
    dhSay('');
    const wrap = $('#dhCut'); if (wrap){ wrap.style.display = 'none'; wrap.classList.remove('show'); }
    const skip = $('#dhSkip'); if (skip){ skip.style.display = 'none'; skip.classList.remove('show'); }
    const cap = $('#dhCutCap'); if (cap) cap.style.display = 'none';
    if (typeof document !== 'undefined' && document.getElementById){
      const root = document.getElementById('obby');
      if (root && root.classList) root.classList.remove('dh-intro', 'paused', 'dh-paused');
    }
    const [ox, oz] = dhOrigin(dh.mine);
    if (typeof P !== 'undefined') Object.assign(P, {x: ox + DH_CELL * 4, y: .05, z: oz - 2.8, vx: 0, vy: 0, vz: 0});
    if (typeof cam !== 'undefined'){ cam.yaw = Math.PI; cam.pitch = .37; cam.dist = .2; }
    dhForceFirstPerson();
    dhShowLookHint();
    dhHud(); dhBar();
    banner('🏡 An empty lot and a pile of materials — time to re-build your house!');
    dreamhouseUpdate(0);
  }
  function dhIntroCam(){
    if (!dh || !dh.intro) return false;
    if (typeof camera === 'undefined' || !camera) return false;
    const c = (dh.cut && dh.cut.c) || dhLotCenter(dh.mine);
    const st = dh.intro.stage;
    if (st === 'house'){ camera.position.set(c.x + 3.2, 3.2, c.z - 14.0); camera.lookAt(c.x + .2, 1.55, c.z - 2.0); }
    else if (st === 'flood'){ camera.position.set(c.x + 1.4, 6.6, c.z - 16.2); camera.lookAt(c.x + 2.0, 1.8, c.z - 0.2); }
    else if (st === 'rebuild'){ camera.position.set(c.x + 2.4, 3.4, c.z - 13.4); camera.lookAt(c.x + 1.4, 1.8, c.z - 4.0); }
    else { camera.position.set(c.x + 3.0, 5.6, c.z - 14.6); camera.lookAt(c.x, 0.8, c.z); }
    return true;
  }
  function dhIntroTick(dt){
    if (!dh || !dh.intro) return;
    const intro = dh.intro;
    intro.t = (intro.t || 0) + dt;
    const order = ['house', 'flood', 'rebuild', 'fadeout', 'fadein'];
    const dur = intro.dur[intro.stage] || 2;
    if (intro.stage === 'house'){ dhSay('This is your new house!'); dhSetCutCap('Story time — Mom is showing you the lot'); dhSetFade(0); }
    if (intro.stage === 'flood' && dh.cut){
      dhSay('Oh no — a flood!');
      dhSetCutCap('Story time — a flood washes the house away');
      const u = Math.min(1, intro.t / dur);
      if (dh.cut.water){ dh.cut.water.visible = true; dh.cut.water.position.y = -0.8 + u * 2.0; }
      if (dh.cut.house){
        dh.cut.house.position.y = u * 1.2;
        dh.cut.house.position.x = dh.cut.c.x + u * u * 8;
        dh.cut.house.position.z = dh.cut.c.z + u * 2.2;
        dh.cut.house.rotation.z = u * .22;
        dh.cut.house.rotation.x = u * .08;
      }
    }
    if (intro.stage === 'rebuild'){ dhSay('Re-build it!'); dhSetCutCap('Story time — time to rebuild'); if (dh.cut && dh.cut.house) dh.cut.house.visible = false; }
    if (intro.stage === 'fadeout'){ dhSetCutCap('Story time — almost ready'); dhSetFade(Math.min(1, intro.t / Math.max(.2, dur))); }
    if (intro.stage === 'fadein'){
      const u = Math.min(1, intro.t / Math.max(.2, dur));
      dhSetFade(1 - u);
      if (u < .15 && dh.cut){
        ['house', 'mom', 'water'].forEach(k => { if (dh.cut[k] && typeof scene !== 'undefined'){ scene.remove(dh.cut[k]); dh.cut[k] = null; } });
        dhSetPiecesVisible(true);
      }
    }
    if (intro.t >= dur){
      intro.t = 0;
      const i = order.indexOf(intro.stage);
      if (i < 0 || i >= order.length - 1) dhFinishIntro();
      else intro.stage = order[i + 1];
    }
  }

  function dreamhouseEnter(){
    if (!dh) return;
    choosing = false; over = false;
    if (typeof dhClosePauseMenus === 'function') dhClosePauseMenus();
    dhBindUI();
    if (!dh.introSeen){
      dhStartIntro(false);
    } else {
      banner(mp && mp.on ? '🏡 Dream House Builders — grab free supplies and place every piece yourself!' : '🏡 First person: grab free supplies at the Supply Yard, then aim and place every brick yourself!');
      tipTimer = 8; dhHud(); dhBar();
      dreamhouseUpdate(0);
    }
    const replay = $('#dhReplay'); if (replay) replay.style.display = '';
    const resetBtn = $('#dhResetBtn'); if (resetBtn) resetBtn.style.display = '';
    if (typeof document !== 'undefined' && document.getElementById){ const root = document.getElementById('obby'); if (root && root.classList) root.classList.add('dhouse'); }
    if (!dh.intro) dhForceFirstPerson();
    if (dh.intro){
      ['#dhGoal','#dhSteps','#dhBar','#dhInv','#dhCarry','#dhHand'].forEach(id => { const el = $(id); if (el){ el.style.display = 'none'; } });
      if (typeof document !== 'undefined' && document.getElementById){
        const root = document.getElementById('obby');
        if (root && root.classList) root.classList.add('dh-intro');
      }
    } else {
      ['#dhGoal','#dhSteps'].forEach(id => { const el = $(id); if (el){ el.style.display = ''; el.classList.add('show'); } });
      if (typeof document !== 'undefined' && document.getElementById){
        const root = document.getElementById('obby');
        if (root && root.classList) root.classList.remove('dh-intro');
      }
    }
    const xh = $('#oCross'); if (xh) xh.style.display = '';
    if (typeof dhBar === 'function') dhBar();
    if (typeof dhHud === 'function') dhHud();
  }
  function dreamhouseStop(){
    if (typeof dhClosePauseMenus === 'function') try { dhClosePauseMenus(); } catch (e){}
    if (typeof dhCloseReset === 'function') try { dhCloseReset(); } catch (e){}
    if (typeof dhHideLookHint === 'function') try { dhHideLookHint(); } catch (e){}
    if (!dh) return;
    if (!dh._skipSave) dhSave();
    if (dh.intro){ dh.intro = null; }
    if (dh.cut){ ['house', 'mom', 'water'].forEach(k => { if (dh.cut[k] && typeof scene !== 'undefined') scene.remove(dh.cut[k]); }); dh.cut = null; }
    if (dh.ghost) scene.remove(dh.ghost);
    if (dh.outlines){ scene.remove(dh.outlines); dh.outlines = null; }
    if (dh.hand){ if (dh.hand.parent) dh.hand.parent.remove(dh.hand); else if (typeof scene !== 'undefined') scene.remove(dh.hand); dh.hand = null; }
    Object.keys(dh.brickInst || {}).forEach(k => { const inst = dh.brickInst[k]; if (inst && typeof scene !== 'undefined') scene.remove(inst); });
    dh.brickInst = {};
    Object.keys(dh.meshes || {}).forEach(k => (dh.meshes[k] || []).forEach(m => { dhBindSolids(m, false); scene.remove(m); }));
    Object.keys(dh.piles || {}).forEach(k => dh.piles[k] && dh.piles[k].mesh && scene.remove(dh.piles[k].mesh));
    Object.keys(dh.mixers || {}).forEach(k => dh.mixers[k] && dh.mixers[k].mesh && scene.remove(dh.mixers[k].mesh));
    (dh.trees || []).forEach(t => t.mesh && scene.remove(t.mesh));
    if (typeof model !== 'undefined' && model && model.g) model.g.visible = true;
    ['#dhBar', '#dhAct', '#dhCut', '#dhShop', '#dhYard', '#dhUp', '#dhGuide', '#dhGoal', '#dhSteps', '#dhTip'].forEach(id => { const el = $(id); if (el){ el.classList.remove('show'); el.style.display = 'none'; } });
    const replay = $('#dhReplay'); if (replay) replay.style.display = 'none';
    const resetBtn = $('#dhResetBtn'); if (resetBtn) resetBtn.style.display = 'none';
    if (typeof document !== 'undefined' && document.getElementById){ const root = document.getElementById('obby'); if (root && root.classList) root.classList.remove('dhouse'); }
    dhSetFade(0); dhSay('');
    dh = null;
  }
  function dhActPrompt(){
    if (!dh) return '';
    if (dh.intro || dh.shopOpen || dh.yardOpen || dh.upOpen) return '';
    const key = (typeof pad !== 'undefined' && pad && pad.on) ? 'Ⓧ' : (typeof touchUI !== 'undefined' && touchUI ? 'tap' : 'E');
    const mxn = dhNearMixer(), pile = dhNearPile();
    const onLot = dhNearOwnPlot();
    const ghostJob = (onLot && (dh.job === 'mark' || dh.job === 'dig' || dh.job === 'pour')) ? dhTargetSpot(dh.job) : ((onLot && dh.job === 'brick') ? dhTargetSpot('brick') : null);
    const prog = (job, word) => {
      const c = dhJobCounts(job);
      return c.need ? (' · ' + word + ' ' + c.have + '/' + c.need) : '';
    };
    if (dh.near >= 0 && dh.near !== dh.mine) return '💛 Like this house';
    if (dhNearBin() && !dhNearMixer() && !dhNearPile()){
      const b = dhNearBin(), m = dhMatOf(b && b.id), want = dhWantedSupply(), wm = want && dhMatOf(want);
      const name = (m && m.name) || 'supplies';
      if (want && b && b.id === want) return (m ? m.e + ' ' : '') + key + ': Grab ' + name + ' (you need this!)';
      if (want && b && b.id !== want) return (m ? m.e + ' ' : '') + key + ': Grab ' + name + ' — the ' + ((wm && wm.name) || 'needed') + ' pile is marked for your goal';
      return (m ? m.e + ' ' : '') + key + ': Grab ' + name;
    }
    if (dhNearYard() && !dhNearMixer() && !dhNearPile()) return key + ': Open the Supply Yard';
    if (dhNearFurn() && !dhNearMixer() && !dhNearPile()) return key + ': Open the Furniture Store';
    if (dhNearUp() && !dhNearMixer() && !dhNearPile()) return key + ': Talk to the builder';
    if (mxn && dh.carry && (dh.carry.id === 'cement' || dh.carry.id === 'sand')) return '🪨 Load the mixer';
    if (mxn && mxn.phase === 'mixing') return '🌀 Mixing…';
    if (mxn && ((mxn.cement|0) >= 1 && (mxn.sand|0) >= 1)) return '🌀 Mix concrete';
    if (mxn && (mxn.mixed|0) >= 1) return '🪣 Fill wheelbarrow';
    if (dh.carry && dh.carry.id === 'wetmix' && onLot) return '🪣 Hold click to pour concrete' + prog('pour', 'Foundation spots poured');
    if (dh.carry && dh.carry.id === 'brick' && onLot) return '🧱 Aim at the glowing outline and click to place a brick';
    if (dh.carry && dh.carry.id === 'glass' && onLot) return '🪟 Install glass';
    if (pile && !dh.carry) return '📦 Pick up materials';
    if (dh.carry && pile && dh.carry.id !== 'wetmix') return '📦 Dump on your plot';
    if (dhNearYard()) return key + ': Open the Supply Yard';
    if (!onLot) return '🏡 Walk onto your plot';
    if (ghostJob && dh.job === 'mark') return key + ': Place stake here' + prog('mark', 'Stakes');
    if (ghostJob && dh.job === 'dig') return key + ': Dig the foundation spot here' + prog('dig', 'Foundation spots dug');
    if (ghostJob && dh.job === 'pour' && dh.carry && dh.carry.id === 'wetmix') return key + ': Hold to pour concrete here' + prog('pour', 'Foundation spots poured');
    const why = dhWhyNot();
    if (why) return why;
    if (dhCanBuild(dh.aim) || onLot){
      const labels = {mark: key + ': Place stake here' + prog('mark', 'Stakes'), dig: key + ': Dig the foundation spot here' + prog('dig', 'Foundation spots dug'), pour: key + ': Hold to pour concrete here' + prog('pour', 'Foundation spots poured'), brick:'🧱 Lay a brick', stud:'🪵 Set a stud', rafter:'🪜 Set a rafter', shingle:'🏠 Nail a shingle', frame:'🚪 Fit a frame', glass:'🪟 Install glass', paint:'🎨 Paint', furn:'🛋️ Place furniture'};
      return labels[dh.job] || '🏗️ Build';
    }
    return '';
  }
  function dhEnsureBrickInst(plot){
    if (!dh) return null;
    dh.brickInst = dh.brickInst || {};
    if (dh.brickInst[plot] && typeof dh.brickInst[plot].setMatrixAt === 'function') return dh.brickInst[plot];
    if (typeof THREE === 'undefined' || typeof THREE.InstancedMesh !== 'function' || typeof scene === 'undefined') return null;
    try {
      const geo = new THREE.BoxGeometry(DH_BRICK_W - .02, DH_BRICK_H - .02, DH_BRICK_D);
      const mat = ((dh.mats && dh.mats.brick) || dhMat('#b54a32')).clone ? ((dh.mats && dh.mats.brick) || dhMat('#b54a32')).clone() : ((dh.mats && dh.mats.brick) || dhMat('#b54a32'));
      const inst = new THREE.InstancedMesh(geo, mat, 512);
      if (!inst || typeof inst.setMatrixAt !== 'function') return null;
      if (inst.instanceMatrix && THREE.DynamicDrawUsage) inst.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
      inst.count = 0;
      inst.frustumCulled = false;
      scene.add(inst);
      dh.brickInst[plot] = inst;
      return inst;
    } catch (e){ return null; }
  }
  function dhSyncBricks(plot){
    if (!dh) return;
    const inst = dhEnsureBrickInst(plot);
    if (!inst || typeof inst.setMatrixAt !== 'function') return;
    const list = (dh.pieces[plot] || []).filter(a => a[0] === 'brick');
    const dummy = (typeof THREE !== 'undefined' && THREE.Object3D) ? new THREE.Object3D() : null;
    if (!dummy || typeof dummy.updateMatrix !== 'function') return;
    list.forEach((rec, i) => {
      const w = dhWorldRec(plot, rec);
      dummy.position.set(w.x, w.y, w.z);
      dummy.rotation.set(0, w.ry || 0, 0);
      dummy.scale.set(1, 1, 1);
      dummy.updateMatrix();
      inst.setMatrixAt(i, dummy.matrix);
    });
    inst.count = list.length;
    if (inst.instanceMatrix) inst.instanceMatrix.needsUpdate = true;
  }
  function dhForceFirstPerson(){
    if (typeof setFP === 'function'){ try { setFP(true, true); } catch (e){} }
    if (typeof cam !== 'undefined' && cam){
      cam.dist = .2;
      if (cam.pitch < .25 || cam.pitch > .55) cam.pitch = .37;
    }
    if (typeof fp !== 'undefined' && fp) fp.on = true;
    if (typeof model !== 'undefined' && model){ if (model.g) model.g.visible = false; if (model.head) model.head.visible = false; }
    if (typeof document !== 'undefined' && document.getElementById){
      const root = document.getElementById('obby');
      if (root && root.classList){ root.classList.add('dhouse'); root.classList.add('fpv'); }
    }
    if (typeof resize === 'function'){ try { resize(); } catch (e){} }
  }
  function dhShowLookHint(){
    const el = $('#dhLookHint');
    if (!el) return;
    el.textContent = 'Click the view to look around · Esc or Tab to click buttons';
    el.style.display = 'block';
    el.classList.add('show');
    if (dh) dh.lookHintT = 8;
  }
  function dhHideLookHint(){
    const el = $('#dhLookHint');
    if (el){ el.style.display = 'none'; el.classList.remove('show'); }
    if (dh) dh.lookHintT = 0;
  }
  function dhTickLookHint(dt){
    if (!dh || !dh.lookHintT) return;
    if (typeof document !== 'undefined' && document.pointerLockElement){ dhHideLookHint(); return; }
    dh.lookHintT -= (dt || 0);
    if (dh.lookHintT <= 0) dhHideLookHint();
  }
  function dhLookWithKeys(dt){
    if (!dh || dh.intro || typeof cam === 'undefined' || !cam) return false;
    if (typeof keys === 'undefined' || !keys) return false;
    const yawK = ((keys.ArrowRight || keys.KeyL) ? 1 : 0) - ((keys.ArrowLeft || keys.KeyJ) ? 1 : 0);
    const pitK = ((keys.KeyK || keys.ArrowDown) ? 1 : 0) - ((keys.KeyI || keys.ArrowUp) ? 1 : 0);
    const dir = yawK * 10 + pitK;
    if (!yawK && !pitK){ dh._lookHold = 0; dh._lookDir = 0; return false; }
    if (dh._lookDir !== dir){ dh._lookHold = 0; dh._lookDir = dir; }
    const step = Math.max(0, dt || 0);
    if (step <= 0) return false;
    dh._lookHold = (dh._lookHold || 0) + step;
    const turn = (Math.PI / 2) * step; // 90°/s while held; short taps get a 4° keydown nudge
    cam.yaw -= yawK * turn;
    cam.pitch = Math.max(-1.3, Math.min(1.4, cam.pitch + pitK * turn * 0.9));
    return true;
  }
  function dhClearHeldKeys(){
    if (typeof keys !== 'undefined' && keys){ Object.keys(keys).forEach(k => { keys[k] = false; }); }
    if (typeof joy !== 'undefined' && joy){ joy.x = joy.y = 0; joy.jump = false; }
    if (typeof P !== 'undefined' && P){ P.vx = 0; P.vz = 0; }
    return true;
  }
  function dhRefreshBins(){
    if (!dh || !dh.bins || !dh.bins.length) return;
    const order = dhSupplyOrder();
    const key = order.map(m => m.id).join(',');
    if (dh._binOrder === key) return;
    dh._binOrder = key;
    dh.bins.forEach(b => {
      const i = order.findIndex(m => m.id === b.id);
      if (i < 0) return;
      const p = dhBinPos(i);
      b.x = p.x; b.z = p.z;
      if (b.mesh && b.mesh.position) b.mesh.position.set(p.x, 0, p.z);
    });
  }
  function dhWalkCap(){ return (typeof keys !== 'undefined' && keys && (keys.ShiftLeft || keys.ShiftRight)) ? 7 : 4.5; }
  function dhSolidAt(x, y, z, pad){
    pad = pad == null ? .08 : pad;
    if (typeof solids === 'undefined' || !solids) return null;
    for (let i = 0; i < solids.length; i++){
      const b = solids[i];
      if (!b || !b.active || b.camSkip || !b.mesh || (b.mesh.visible === false)) continue;
      if (Math.abs(x - b.mesh.position.x) < b.hw + pad && Math.abs(y - b.mesh.position.y) < b.hh + pad && Math.abs(z - b.mesh.position.z) < b.hd + pad) return b;
    }
    return null;
  }
  function dhClipFpCamera(){
    if (typeof camera === 'undefined' || !camera || typeof cam === 'undefined' || !cam || typeof P === 'undefined' || !P) return false;
    if (typeof fpOn === 'function' ? !fpOn() : (cam.dist > 1)) return false;
    const fx = -Math.sin(cam.yaw), fz = -Math.cos(cam.yaw);
    const ey = P.y + 2.45;
    let off = 0.22;
    while (off > 0 && dhSolidAt(P.x + fx * off, ey, P.z + fz * off, 0.1)) off -= 0.05;
    let x = P.x + fx * off, y = ey, z = P.z + fz * off;
    let guard = 0;
    while (guard++ < 12 && dhSolidAt(x, y, z, 0.1)) y += 0.12;
    camera.position.set(x, y, z);
    if (typeof camera.near === 'number' && camera.near > 0.08){
      camera.near = 0.08;
      if (typeof camera.updateProjectionMatrix === 'function') camera.updateProjectionMatrix();
    }
    const cp = Math.cos(cam.pitch);
    camera.lookAt(P.x + fx * (off + cp * 10), y - Math.sin(cam.pitch) * 10, P.z + fz * (off + cp * 10));
    return true;
  }
  function dhCamComfort(dt){
    // Dream House is always first person after the intro. Do not force a follow camera.
    if (typeof cam === 'undefined' || !cam) return;
    if (dh && dh.intro) return;
    if (cam.dist > 4) cam.dist = .2;
    if (cam.pitch > 1.3) cam.pitch = 1.3;
    if (cam.pitch < -1.2) cam.pitch = -1.2;
    dhUpdateHand(dt);
  }
  function dreamhouseUpdate(dt){
    if (!dh || over) return;
    if (dh.intro){ dhIntroTick(dt); return; }
    if (choosing) return;
    dhLookWithKeys(dt);
    dhTickLookHint(dt);
    dhRefreshBins();
    dhClampPlayer();
    dhCamComfort(dt);
    if (typeof dhClipFpCamera === 'function') dhClipFpCamera();
    dhFadeOccludingTrees();
    dhFadeYardSign();
    dh.aim = dhAimCell();
    // cure wet concrete
    (dh.pieces[dh.mine] || []).slice().forEach(rec => {
      if (rec[0] === 'wet'){ rec[6] = (rec[6] || 0) + dt; if (rec[6] > dhDryDone()){ const a = rec.slice(); dhRemoveAtKey(dh.mine, dhKeyOf(rec), true); a[0] = 'slab'; dhPut(dh.mine, a, true); } }
    });
    const mx = dh.mixers[dh.mine];
    if (mx && mx.phase === 'mixing'){
      mx.mixT -= dt;
      if (mx.drum) mx.drum.rotation.x = (mx.drum.rotation.x || 0) + dt * 4;
      if (mx.mixT <= 0){ mx.phase = 'ready'; mx.mixed = (mx.mixed | 0) + 2; banner('🌀 Mix is ready — fill the wheelbarrow!'); }
    }
    const eHeld = (typeof keys !== 'undefined' && keys && (keys.KeyE || keys.Enter));
    if ((dh.pourHold || eHeld) && dh.job === 'pour' && dh.carry && dh.carry.id === 'wetmix'){
      dh.pourAcc = (dh.pourAcc || 0) + (dt || .016);
      if (dh.pourAcc > .22){ dh.pourAcc = 0; dhPour(); }
    }
    dhUpdateGhost();
    dhHintStage();
    if (dh.yardBeacon && dh.yardBeacon.arrow){
      dh.yardBeacon.arrow.position.y = dh.yardBeacon.y0 + Math.sin((typeof worldT === 'number' ? worldT : 0) * 3) * .45;
    }
    if (dhNearYard()) dh.foundYard = true;
    dh.near = dhPlotAt(P.x, P.z);
    const b = $('#dhAct');
    if (b){
      const txt = dhActPrompt();
      const key = (typeof pad !== 'undefined' && pad && pad.on) ? 'Ⓧ' : (typeof touchUI !== 'undefined' && touchUI ? 'tap' : 'E');
      if (txt){ b.innerHTML = txt + ' <small>' + key + '</small>'; b.classList.add('show'); b.style.display = ''; } else { b.classList.remove('show'); b.style.display = 'none'; b.innerHTML = ''; }
    }
    dh.saveT = (dh.saveT || 0) + dt; if (dh.saveT > 8){ dh.saveT = 0; dhSave(); }
    dhHud();
  }
  function dreamhouseAnimate(){}
  function dhStageId(){
    if (!dh) return 'stake';
    const cMark = dhJobCounts('mark'), cDig = dhJobCounts('dig'), cPour = dhJobCounts('pour');
    if (cMark.have < cMark.need) return 'stake';
    if (cDig.have < cDig.need) return 'dig';
    if (cPour.have < cPour.need) return 'pour';
    const bricks = dhCount(dh.pieces[dh.mine], 'brick'), needB = dhBrickTotal();
    if (bricks < needB) return 'brick';
    if (dhCount(dh.pieces[dh.mine], 'stud') < 8) return 'stud';
    if (dhCount(dh.pieces[dh.mine], 'rafter') < 4) return 'rafter';
    if (dhCount(dh.pieces[dh.mine], 'shingle') < 10) return 'shingle';
    if (dhCount(dh.pieces[dh.mine], 'door') < 1 || dhCount(dh.pieces[dh.mine], 'winframe') < 1) return 'frame';
    if (!dhWindowsGlazed(dh.pieces[dh.mine])) return 'glass';
    if (dhCount(dh.pieces[dh.mine], 'paint') < 4) return 'paint';
    return 'furn';
  }
  function dhChecklist(){
    const cMark = dhJobCounts('mark'), cDig = dhJobCounts('dig'), cPour = dhJobCounts('pour');
    const bricks = dhCount((dh && dh.pieces[dh.mine]) || [], 'brick');
    const needB = dhBrickTotal();
    const done = (have, need) => have >= need;
    const item = (n, label, have, need) => {
      const ok = done(have, need);
      const bit = ok ? '✔' : (have + '/' + need);
      return n + ' ' + label + ' ' + bit;
    };
    return [
      item(1, 'Stake the corners', cMark.have, cMark.need),
      item(2, 'Dig', cDig.have, cDig.need),
      item(3, 'Pour foundation', cPour.have, cPour.need),
      item(4, 'Lay bricks', bricks, needB),
      item(5, 'Build the roof', dhCount((dh && dh.pieces[dh.mine]) || [], 'shingle'), 10),
      item(6, 'Windows & door', (dhCount((dh && dh.pieces[dh.mine]) || [], 'door') >= 1 && dhCount((dh && dh.pieces[dh.mine]) || [], 'winframe') >= 1) ? 1 : 0, 1),
      item(7, 'Paint & furnish', (dhCount((dh && dh.pieces[dh.mine]) || [], 'paint') >= 4 && ['sofa','bed','table','lamp','plant','rug','tv','shelf'].reduce((n, id) => n + dhCount((dh && dh.pieces[dh.mine]) || [], id), 0) >= 3) ? 1 : 0, 1)
    ];
  }
  function dhGoalText(){
    if (!dh) return '';
    const stage = dhStageId();
    if (stage === 'stake'){
      const c = dhJobCounts('mark');
      return 'Stake every corner of your house outline (Stake ' + c.have + '/' + c.need + ')';
    }
    if (stage === 'dig') return 'Dig each foundation spot where you placed a stake';
    if (stage === 'pour'){
      if (dhCarryOf('wetmix')) return 'Aim at a foundation spot and hold click to pour';
      const mx = dh.mixers && dh.mixers[dh.mine];
      if (mx && mx.phase === 'mixing') return 'Wait for the mixer — then fill the wheelbarrow';
      if (mx && (mx.mixed|0) >= 1) return 'E at the mixer: fill the wheelbarrow with concrete';
      if (mx && ((mx.cement|0) >= 1 && (mx.sand|0) >= 1)) return 'E at the mixer to mix Cement + Sand into concrete';
      if (dhCarryOf('cement') || dhCarryOf('sand')) return 'Put them in the mixer (walk up and press E)';
      return 'Grab Cement + Sand at the Supply Yard (they are free)';
    }
    if (stage === 'brick'){
      if (!(dh.carry && dh.carry.id === 'brick' && dh.carry.n > 0)) return 'Grab bricks at the Supply Yard';
      return 'Aim at the glowing outline and click to place a brick';
    }
    if (stage === 'stud') return (!(dh.carry && dh.carry.id === 'wood')) ? 'Grab planks at the Supply Yard, then aim and place each stud' : 'Aim and click to place each stud';
    if (stage === 'rafter') return (!(dh.carry && dh.carry.id === 'wood')) ? 'Grab planks, then aim and place each rafter' : 'Aim and click to place each rafter';
    if (stage === 'shingle') return (!(dh.carry && dh.carry.id === 'shingle')) ? 'Grab shingles at the Supply Yard' : 'Aim and click to place each shingle';
    if (stage === 'frame') return 'Aim at a wall opening and place a door or window frame';
    if (stage === 'glass') return (!(dh.carry && dh.carry.id === 'glass')) ? 'Grab glass at the Supply Yard, then aim at an empty window' : 'Aim at an empty window and click to set a pane';
    if (stage === 'paint') return 'Pick a color and paint the walls';
    return 'Visit the Furniture Store and place furniture in your house';
  }
  const DH_TIPS = {
    stake: 'Look at a foundation spot so its outline glows, then press E or click to plant a stake. Standing next to a spot works too. Finish every corner.',
    dig: 'Look at a staked spot so it glows, then press E or click to dig it. Standing next to it works too.',
    pour: 'Cement and Sand are free at the Supply Yard. Put both in the yellow Cement Mixer by your plot, fill the wheelbarrow, then look at a dug spot so it glows and hold click or E to pour.',
    brick: 'Grab a stack of bricks (free at the Supply Yard). Look at the glowing brick outline and click, E, or RT to place ONE brick. When your hands are empty, go get more.',
    stud: 'Aim at the wall and click to place each wooden stud, one at a time.',
    rafter: 'Aim along the roof line and place each rafter yourself.',
    shingle: 'Aim at the roof and click to set each shingle.',
    frame: 'Aim at the door or window opening and place the frame.',
    glass: 'Carry a glass pane and click an empty window to set it.',
    paint: 'Choose a color and paint your walls.',
    furn: 'Buy furniture at the Furniture Store, then place it in the room.'
  };
  function dhTipOpen(){
    const tip = $('#dhTip');
    return !!(tip && tip.classList && tip.classList.contains('show'));
  }
  function dhDismissTip(){
    if (!dhTipOpen()) return false;
    const tip = $('#dhTip');
    if (tip){ tip.classList.remove('show'); tip.style.display = 'none'; }
    return true;
  }
  function dhShowTip(text){
    if (!text) return;
    const pausedNow = (typeof paused !== 'undefined' && paused) || (typeof menuOpen !== 'undefined' && menuOpen);
    if (pausedNow){ if (dh) dh._tipQueue = text; return; }
    const tip = $('#dhTip'), t = $('#dhTipT');
    if (tip){ tip.style.display = ''; tip.classList.add('show'); }
    if (t) t.textContent = text;
    else if (typeof banner === 'function') banner(text);
    if (typeof document !== 'undefined' && document.pointerLockElement && document.exitPointerLock){
      try { document.exitPointerLock(); } catch (e){}
    }
  }
  function dhFlushTips(){
    if (!dh || !dh._tipQueue) return;
    if ((typeof paused !== 'undefined' && paused) || (typeof menuOpen !== 'undefined' && menuOpen)) return;
    const text = dh._tipQueue; dh._tipQueue = null;
    dhShowTip(text);
  }
  function dhHintStage(){
    if (!dh || dh.intro || dh.yardOpen || dh.shopOpen || dh.upOpen) return;
    if ((typeof paused !== 'undefined' && paused) || (typeof menuOpen !== 'undefined' && menuOpen)) return;
    const id = dhStageId();
    dh.tipsSeen = dh.tipsSeen || {};
    if (dh.tipsSeen[id]) return;
    const text = DH_TIPS[id]; if (!text) return;
    dh.tipsSeen[id] = true;
    dhShowTip(text);
  }
  function dhUpdateGhost(){
    if (!dh) return;
    const menus = dh.yardOpen || dh.shopOpen || dh.upOpen || dh.intro;
    const stage = dhStageId();
    // Glowing outlines for the next brick / pour / stake slots
    if (dh.outlines && typeof scene !== 'undefined'){ scene.remove(dh.outlines); dh.outlines = null; }
    if (!menus && typeof THREE !== 'undefined' && typeof scene !== 'undefined'){
      const g = new THREE.Group();
      const pulse = 0.35 + 0.2 * Math.sin((typeof worldT === 'number' ? worldT : 0) * 5);
      if (stage === 'brick'){
        const aimedB = dhTargetSpot('brick');
        if (aimedB){
          const m = new THREE.Mesh(new THREE.BoxGeometry(DH_BRICK_W - .04, DH_BRICK_H - .04, DH_BRICK_D + .02), dhMat('#7CFF6A', {transparent: true, opacity: .95, emissive: '#7CFF6A', emissiveIntensity: 1, depthWrite: false}));
          m.position.set(aimedB.x, aimedB.y, aimedB.z); m.rotation.y = aimedB.ry || 0;
          m.scale.set(1.15, 1.15, 1.15);
          g.add(m);
        }
      } else if (stage === 'stake' || stage === 'dig' || stage === 'pour'){
        const job = stage === 'stake' ? 'mark' : stage;
        const cells = [];
        const foot = dhFoot();
        for (let ix = foot.x0; ix <= foot.x1; ix++) for (let iz = foot.z0; iz <= foot.z1; iz++){
          if (job === 'mark' && !dhFootTaken(dh.mine, ix, iz)) cells.push({ix, iz});
          if (job === 'dig' && dhHas(dh.mine, 'mark', ix, iz) && !dhHas(dh.mine, 'trench', ix, iz) && !dhHas(dh.mine, 'wet', ix, iz) && !dhHas(dh.mine, 'slab', ix, iz)) cells.push({ix, iz});
          if (job === 'pour' && (dhHas(dh.mine, 'trench', ix, iz) || dhHas(dh.mine, 'mark', ix, iz)) && !dhHas(dh.mine, 'wet', ix, iz) && !dhHas(dh.mine, 'slab', ix, iz)) cells.push({ix, iz});
        }
        const aimed = dhTargetSpot(job);
        if (aimed){
          const w = dhCellWorld(dh.mine, aimed.ix, aimed.iz, .1);
          const m = new THREE.Mesh(new THREE.BoxGeometry(DH_CELL * .9, .18, DH_CELL * .9), dhMat('#7CFF6A', {transparent: true, opacity: .92, emissive: '#7CFF6A', emissiveIntensity: 1, depthWrite: false}));
          m.position.set(w.x, w.y, w.z);
          m.scale.set(1.12, 1, 1.12);
          g.add(m);
        }
      }
      if (g.children.length){ dh.outlines = g; scene.add(g); }
    }
    if (!dh.ghost) return;
    let pos = null, ok = false, can = true;
    if (stage === 'brick'){
      const slot = dhTargetSpot('brick');
      if (slot){ pos = slot; ok = true; can = !slot.filled && !!(dh.carry && dh.carry.id === 'brick' && dh.carry.n > 0); }
    } else {
      const job = stage === 'stake' ? 'mark' : stage;
      const ghostAt = (job === 'mark' || job === 'dig' || job === 'pour') ? dhTargetSpot(job) : dhTargetSpot(job);
      if (ghostAt && ghostAt.plot === dh.mine){
        const w = dhCellWorld(ghostAt.plot, ghostAt.ix, ghostAt.iz, .08);
        pos = {x: w.x, y: w.y, z: w.z, ry: 0};
        ok = true;
        if (job === 'pour') can = !!(dh.carry && dh.carry.id === 'wetmix');
        if (job === 'brick') can = !!(dh.carry && dh.carry.id === 'brick');
      }
    }
    dh.ghost.visible = !!(ok && pos && !menus);
    if (ok && pos){
      dh.ghost.position.set(pos.x, pos.y, pos.z);
      dh.ghost.rotation.y = pos.ry || 0;
      const glow = dh.ghost.userData && dh.ghost.userData.glow;
      const col = !can || dh.tool === 'delete' ? '#ff4d5e' : '#2ec27e';
      if (glow && glow.material){
        glow.material.opacity = 0.45 + 0.25 * Math.sin((typeof worldT === 'number' ? worldT : 0) * 6);
        if (glow.material.color && glow.material.color.set) glow.material.color.set(col);
      }
      // resize ghost to a brick when laying bricks
      const pole = dh.ghost.userData && dh.ghost.userData.pole;
      if (glow && glow.scale){
        if (stage === 'brick'){ glow.scale.set(DH_BRICK_W / (DH_CELL * .92), DH_BRICK_H / .16, DH_BRICK_D / (DH_CELL * .92)); if (pole) pole.visible = false; }
        else { glow.scale.set(1, 1, 1); if (pole) pole.visible = true; }
      }
    }
  }
  function dhHeldInfo(){
    if (!dh) return {emoji: '✋', label: 'Hands', carryText: 'Hands empty'};
    const mat = (id) => dhMatOf(id) || {e: '🧺', name: id};
    const jobIcon = {mark:['📍','Stake'], dig:['🕳️','Shovel'], mix:['🌀','Mixer'], pour:['🪣','Pour'], brick:['🧱','Bricks'], stud:['🪵','Studs'], rafter:['🪜','Rafters'], shingle:['🏠','Shingles'], frame:['🚪','Frames'], glass:['🪟','Glass'], paint:['🎨','Paint'], furn:['🛋️','Furniture']};
    if (dh.tool === 'delete') return {emoji: '🗑️', label: 'Remove', carryText: 'Holding the Remove tool'};
    const bits = [];
    if (dh.carry){ const m = mat(dh.carry.id); bits.push(dh.carry.n + ' ' + m.name); }
    if (dh.bag){ const m = mat(dh.bag.id); bits.push(dh.bag.n + ' ' + m.name); }
    if (bits.length){
      const m0 = mat(dh.carry ? dh.carry.id : dh.bag.id);
      const totals = [];
      [dh.carry, dh.bag].forEach(rec => { if (rec) totals.push(dhInvCount(rec.id) + ' ' + mat(rec.id).name + ' total'); });
      const uniq = totals.filter((t, i) => totals.indexOf(t) === i);
      const extra = uniq.length ? ' · ' + uniq.join(', ') : '';
      return {emoji: m0.e || '🧺', label: bits.join(' + ') + extra, carryText: 'Carrying ' + bits.join(' + ') + extra};
    }
    const j = jobIcon[dh.job] || ['🏗️', 'Build'];
    return {emoji: j[0], label: j[1], carryText: 'Holding the ' + j[1] + ' tool'};
  }
  function dhUpdateHandHud(){
    const el = $('#dhHand'); if (!el || !dh) return;
    const held = dhHeldInfo();
    const hide = !!(dh.intro) || dhMenusUp();
    el.style.display = hide ? 'none' : 'flex';
    el.style.visibility = hide ? 'hidden' : '';
    el.style.zIndex = '41';
    el.style.pointerEvents = 'none';
    el.classList.toggle('show', !hide);
    el.classList.toggle('dh-paused-hide', hide);
    el.innerHTML = '<span class="dhhandE">' + held.emoji + '</span><small>' + held.label + '</small>';
  }
  function dhUpdateHand(){
    if (typeof dhUpdateHandHud === 'function') dhUpdateHandHud();
    if (!dh || typeof camera === 'undefined' || !camera || typeof THREE === 'undefined') return;
    if (!dh.hand){
      const g = new THREE.Group();
      dh.hand = g;
      camera.add(g);
      if (!camera.children || camera.children.indexOf(g) < 0){ try { camera.add(g); } catch (e){ if (typeof scene !== 'undefined') scene.add(g); } }
    }
    const g = dh.hand;
    g.position.set(.34, -.32, -.46);
    g.rotation.set(.18, -.35, -.08);
    g.scale.set(1.35, 1.35, 1.35);
    // rebuild child when the held item changes
    const holdId = (dh.carry && dh.carry.id) || (dh.job === 'pour' ? 'trowel' : dh.job === 'dig' ? 'shovel' : dh.job === 'mark' ? 'stake' : dh.job === 'paint' ? 'paint' : dh.job);
    if (g.userData.holdId !== holdId){
      while (g.children.length) g.remove(g.children[0]);
      g.userData.holdId = holdId;
      const add = (m, x, y, z) => { m.position.set(x || 0, y || 0, z || 0); g.add(m); };
      const box = (sx, sy, sz, col) => new THREE.Mesh(new THREE.BoxGeometry(sx, sy, sz), dhMat(col));
      if (holdId === 'brick') add(box(.28, .12, .16, '#b54a32'), 0, 0, 0);
      else if (holdId === 'wood' || holdId === 'stud' || holdId === 'rafter') add(box(.08, .08, .7, '#c9955a'), 0, 0, -.1);
      else if (holdId === 'shingle') add(box(.3, .04, .2, '#5a4030'), 0, 0, 0);
      else if (holdId === 'glass') add(box(.28, .22, .03, '#7ad3ff'), 0, 0, 0);
      else if (holdId === 'cement' || holdId === 'sand') add(box(.2, .14, .14, holdId === 'sand' ? '#e5c574' : '#cfc4a8'), 0, 0, 0);
      else if (holdId === 'wetmix' || holdId === 'trowel'){ add(box(.06, .06, .4, '#8a8a8a'), 0, 0, -.05); add(box(.18, .02, .12, '#cfc4a8'), 0, -.02, .16); }
      else if (holdId === 'shovel' || holdId === 'dig'){ add(box(.05, .05, .5, '#8a5a2b'), 0, 0, -.08); add(box(.16, .02, .12, '#8a8a8a'), 0, 0, .18); }
      else if (holdId === 'stake' || holdId === 'mark') add(box(.05, .4, .05, '#c9955a'), 0, 0, 0);
      else if (holdId === 'paint') add(box(.1, .16, .1, dhPaintCol(dh.color | 0)), 0, 0, 0);
      else add(box(.12, .12, .12, '#ffd23f'), 0, 0, 0);
    }
  }

  function dhWantedSupply(){
    if (!dh) return null;
    const job = dh.job;
    if (job === 'brick') return 'brick';
    if (job === 'stud' || job === 'rafter' || job === 'frame') return 'wood';
    if (job === 'shingle') return 'shingle';
    if (job === 'glass') return 'glass';
    if (job === 'paint') return 'paint';
    if (job === 'mix' || job === 'pour' || dhStageId() === 'pour'){
      const mx = dh.mixers && dh.mixers[dh.mine];
      if ((mx && (mx.sand|0) < 1 && dhCarryOf('sand') < 1) && ((mx && (mx.cement|0) >= 1) || dhCarryOf('cement') >= 1)) return 'sand';
      if ((mx && (mx.cement|0) < 1 && dhCarryOf('cement') < 1) && ((mx && (mx.sand|0) >= 1) || dhCarryOf('sand') >= 1)) return 'cement';
      if (dhCarryOf('cement') < 1 && !(mx && (mx.cement|0) >= 1)) return 'cement';
      if (dhCarryOf('sand') < 1 && !(mx && (mx.sand|0) >= 1)) return 'sand';
      return null;
    }
    return null;
  }
  function dhNeedYardSupplies(){
    if (!dh) return false;
    if (dhStageId() === 'pour'){
      if (dhCarryOf('wetmix')) return false;
      const mx = dh.mixers && dh.mixers[dh.mine];
      if (mx && ((mx.mixed|0) >= 1 || mx.phase === 'mixing' || ((mx.cement|0) >= 1 && (mx.sand|0) >= 1))) return false;
      if (dhCarryOf('cement') && dhCarryOf('sand')) return false;
      return true;
    }
    if (dhHasAnyCarry()) return false;
    const want = dhWantedSupply();
    if (!want) return !dh.foundYard;
    return !dhInvCount(want);
  }
  function dhGuideTarget(){
    if (!dh || dh.intro || dh.yardOpen || dh.shopOpen || dh.upOpen) return null;
    const px = P.x || 0, pz = P.z || 0;
    const mx = dh.mixers && dh.mixers[dh.mine];
    const mixerGuide = () => mx && Math.hypot(px - mx.x, pz - mx.z) > 2.2 ? {x: mx.x, z: mx.z, text: 'Go to the Cement Mixer'} : null;
    if (dhStageId() === 'pour'){
      if (dhCarryOf('wetmix')){
        if (dhNearOwnPlot()) return null;
        const [ox, oz] = dhOrigin(dh.mine);
        return {x: ox + DH_N * DH_CELL / 2, z: oz + DH_N * DH_CELL / 2, text: 'Go to your plot'};
      }
      if (mx && (mx.phase === 'mixing' || (mx.mixed|0) >= 1 || ((mx.cement|0) >= 1 && (mx.sand|0) >= 1) || (dhCarryOf('cement') && dhCarryOf('sand')) || dhCarryOf('cement') || dhCarryOf('sand'))){
        if (dhNeedYardSupplies()){
          /* still missing the other bag — fall through to the yard */
        } else {
          const g = mixerGuide(); if (g) return g;
          return null;
        }
      }
    }
    if (dhHasAnyCarry() && !dhNeedYardSupplies()){
      if (dhStageId() === 'pour' && (dhCarryOf('cement') || dhCarryOf('sand'))){
        const g = mixerGuide(); if (g) return g;
      }
      if (dhNearOwnPlot()) return null;
      const [ox, oz] = dhOrigin(dh.mine);
      return {x: ox + DH_N * DH_CELL / 2, z: oz + DH_N * DH_CELL / 2, text: 'Go to your plot'};
    }
    const want = dhWantedSupply();
    const need = dhNeedYardSupplies();
    const dYard = Math.hypot(px - DH_YARD.x, pz - DH_YARD.z);
    // Once you're at or around the yard, keep pointing at the nearest pile
    // (the old arrow hid as soon as foundYard flipped, leaving no hint).
    if (dYard < 16){
      const bins = dh.bins || [];
      let best = null, bd = 1e9;
      bins.forEach(b => {
        if (want && b.id !== want) return;
        const d = Math.hypot(px - b.x, pz - b.z);
        if (d < bd){ bd = d; best = b; }
      });
      if (!best){
        bins.forEach(b => {
          const d = Math.hypot(px - b.x, pz - b.z);
          if (d < bd){ bd = d; best = b; }
        });
      }
      if (best && (need || dYard < 10) && bd > 1.15){
        const m = dhMatOf(best.id);
        return {x: best.x, z: best.z, text: 'Go to the ' + (m ? m.name : 'supplies')};
      }
      return null;
    }
    if (need) return {x: DH_YARD.x, z: DH_YARD.z, text: 'Go to the Supply Yard'};
    return null;
  }
  function dhHud(){
    if (!dh) return;
    const n = $('#dhN'); if (n) n.textContent = '🪙 ' + Math.floor(dh.bank);
    const goal = $('#dhGoal');
    if (goal){
      const hide = !!(dh.intro || dh.yardOpen || dh.shopOpen || dh.upOpen);
      goal.style.display = hide ? 'none' : '';
      if (!hide){ goal.classList.add('show'); goal.textContent = dhGoalText(); }
    }
    const steps = $('#dhSteps');
    if (steps){
      const hide = !!(dh.intro);
      steps.style.display = hide ? 'none' : '';
      if (!hide){
        steps.classList.add('show');
        const cur = dhStageId();
        steps.innerHTML = '<div class="dhstepsH">House steps</div>' + dhChecklist().map((line, i) => {
          const ids = ['stake','dig','pour','brick','shingle','frame','furn'];
          const on = ids[i] === cur || (ids[i] === 'shingle' && (cur === 'stud' || cur === 'rafter' || cur === 'shingle')) || (ids[i] === 'frame' && (cur === 'frame' || cur === 'glass')) || (ids[i] === 'furn' && (cur === 'paint' || cur === 'furn'));
          const done = /✔/.test(line);
          return '<div class="dhstep' + (done ? ' done' : '') + (on && !done ? ' on' : '') + '">' + line + '</div>';
        }).join('');
      }
    }
    const g = $('#dhGuide'), gt = $('#dhGuideT');
    if (g){
      const tgt = dhGuideTarget();
      const show = !!tgt;
      g.style.display = show ? '' : 'none';
      if (show){
        g.classList.add('show');
        const dx = tgt.x - (P.x || 0), dz = tgt.z - (P.z || 0);
        const yaw = (typeof cam !== 'undefined' && cam && cam.yaw) || 0;
        const ang = Math.atan2(dx, dz) - yaw;
        const arrow = g.querySelector('.dhgarrow');
        if (arrow) arrow.style.transform = 'rotate(' + (ang * 180 / Math.PI) + 'deg)';
        if (gt) gt.textContent = tgt.text;
      } else g.classList.remove('show');
    }
    const inv = $('#dhInv');
    if (inv){
      if (dh.intro){ inv.textContent = ''; inv.style.display = 'none'; }
      else {
        inv.style.display = '';
        const bits = ['brick','cement','sand','wood','shingle','glass'].map(id => {
          const m = dhMatOf(id); const v = dhInvCount(id);
          return v ? (m.e + v) : '';
        }).filter(Boolean);
        inv.textContent = bits.join(' ') || 'no stock';
      }
    }
    const c = $('#dhCarry');
    if (c){
      const held = dhHeldInfo();
      c.textContent = held.carryText;
    }
    if (typeof dhUpdateHandHud === 'function') dhUpdateHandHud();
    const tb = $('#dhTool'); if (tb) tb.textContent = dh.tool === 'delete' ? '🗑️' : ({mark:'📍', dig:'🕳️', mix:'🌀', pour:'🪣', brick:'🧱', stud:'🪵', rafter:'🪜', shingle:'🏠', frame:'🚪', glass:'🪟', paint:'🎨', furn:'🛋️'}[dh.job] || '🏗️');
  }
  function dhMenusUp(){
    if (typeof paused !== 'undefined' && paused) return true;
    if (typeof menuOpen !== 'undefined' && menuOpen) return true;
    if (typeof dhResetModalIsOpen === 'function' && dhResetModalIsOpen()) return true;
    if (dh && (dh.shopOpen || dh.yardOpen || dh.upOpen)) return true;
    return false;
  }
  function dhSyncPauseHud(){
    const hide = dhMenusUp();
    if (typeof document !== 'undefined' && document.getElementById){
      const root = document.getElementById('obby');
      if (root && root.classList){ root.classList.toggle('dh-paused', hide); root.classList.toggle('paused', !!(typeof paused !== 'undefined' && paused)); }
    }
    ['#dhBar', '#dhHand', '#dhAct'].forEach(id => {
      const el = $(id); if (!el) return;
      if (hide){ el.style.display = 'none'; el.style.visibility = 'hidden'; el.style.pointerEvents = 'none'; el.classList.add('dh-paused-hide'); }
      else { el.style.visibility = ''; el.style.pointerEvents = ''; el.classList.remove('dh-paused-hide'); }
    });
    if (!hide){
      const bar = $('#dhBar'); if (bar){ bar.style.display = ''; bar.classList.add('show'); }
    }
  }
  function dhBar(){
    if (!dh) return;
    const bar = $('#dhBar'); if (!bar) return;
    if (dhMenusUp() || (dh && dh.intro)){ bar.style.display = 'none'; bar.style.visibility = 'hidden'; bar.style.pointerEvents = 'none'; bar.classList.add('dh-paused-hide'); return; }
    bar.style.display = ''; bar.style.visibility = ''; bar.style.pointerEvents = ''; bar.classList.remove('dh-paused-hide'); bar.classList.add('show');
    const jobs = '<div class="dhtools">' + DH_JOBS.map(j => {
      const lab = {mark:'📍 Stake', dig:'🕳️ Dig', mix:'🌀 Mix', pour:'🪣 Pour', brick:'🧱 Brick', stud:'🪵 Stud', rafter:'🪜 Rafter', shingle:'🏠 Shingle', frame:'🚪 Frame', glass:'🪟 Glass', paint:'🎨 Paint', furn:'🛋️ Furnish'}[j];
      return '<button class="dhb' + (dh.job === j && dh.tool === 'place' ? ' on' : '') + '" data-dhjob="' + j + '">' + lab + '</button>';
    }).join('') + '<button class="dhb' + (dh.tool === 'delete' ? ' on' : '') + '" data-dhtool="delete">🗑️</button><button class="dhb" id="dhDumpBtn">📦 Dump</button><button class="dhb" id="dhYardBtn">📦 Supply Yard</button><button class="dhb" id="dhShopBtn">🛋️ Furniture</button><button class="dhb" id="dhUpBtn">🔧 Upgrades</button></div>';
    const cols = dh.job === 'paint' ? ('<div class="dhcols">' + DH_PAINT.map((c, i) => '<button class="dhc' + (dh.color === i ? ' on' : '') + '" data-dhcol="' + i + '" style="background:' + c.col + '" title="' + c.name + '"></button>').join('') + '</div>') : '';
    const inv = '<div class="dinv">' + DH_MATS.filter(m => !m.nosale).map(m => {
      const n = dhInvCount(m.id);
      return '<span class="dhi" data-dhid="' + m.id + '">' + m.e + '<b>' + n + '</b></span>';
    }).join('') + [dh.carry, dh.bag].filter(Boolean).map(rec => '<span class="dhi on">🧺 ' + rec.n + ' ' + rec.id + '</span>').join('') + '</div>';
    bar.innerHTML = jobs + cols + inv;
    dhBindUI();
    if (typeof dhLayoutHud === 'function') dhLayoutHud();
  }
  function dhBindUI(){
    if (window.__dhBound5) return;
    window.__dhBound5 = true;
    const act = $('#dhAct'); if (act) act.onclick = () => dh && !dh.intro && dhAct();
    const bar = $('#dhBar');
    if (bar) bar.addEventListener('click', ev => {
      const t = ev.target.closest('[data-dhjob],[data-dhtool],[data-dhid],[data-dhcol],#dhDumpBtn,#dhShopBtn,#dhYardBtn,#dhUpBtn');
      if (!t || !dh || dh.intro) return;
      if (t.id === 'dhDumpBtn') dhDump();
      else if (t.id === 'dhYardBtn') dhToggleYard(true);
      else if (t.id === 'dhShopBtn') dhToggleShop(true);
      else if (t.id === 'dhUpBtn') dhToggleUp(true);
      else if (t.dataset.dhtool) dhSetTool(t.dataset.dhtool);
      else if (t.dataset.dhjob) dhSetJob(t.dataset.dhjob);
      else if (t.dataset.dhcol != null){ dh.color = t.dataset.dhcol | 0; dhBar(); }
      else if (t.dataset.dhid){ if ((dh.stock[t.dataset.dhid]|0) > 0) dhPickup(t.dataset.dhid, t.dataset.dhid === 'brick' ? 8 : 1); }
    });
    const yard = $('#dhYard');
    if (yard) yard.addEventListener('click', ev => {
      if (!dh) return;
      const x = ev.target.closest('#dhYardX');
      if (x || ev.target === yard){ dhToggleYard(false); return; }
      const buy = ev.target.closest('[data-dhbuy]');
      if (buy){ dhBuy(buy.dataset.dhbuy); dhRenderYard(); }
    });
    const shop = $('#dhShop');
    if (shop) shop.addEventListener('click', ev => {
      if (!dh) return;
      const x = ev.target.closest('#dhShopX');
      if (x || ev.target === shop){ dhToggleShop(false); return; }
      const buy = ev.target.closest('[data-dhbuy]');
      if (buy) dhShopBuyFurn(buy.dataset.dhbuy);
    });
    const upPanel = $('#dhUp');
    if (upPanel) upPanel.addEventListener('click', ev => {
      if (!dh) return;
      const x = ev.target.closest('#dhUpX');
      if (x || ev.target === upPanel){ dhToggleUp(false); return; }
      const up = ev.target.closest('[data-dhup]');
      if (up) dhBuyUpgrade(up.dataset.dhup);
    });
    const cut = $('#dhCut'); if (cut) cut.addEventListener('click', ev => { if (dh && dh.intro) dhSkipIntro(); });
    const skip = $('#dhSkip'); if (skip) skip.onclick = ev => { ev.stopPropagation(); if (dh && dh.intro) dhSkipIntro(); };
    const replay = $('#dhReplay'); if (replay) replay.onclick = () => dh && dhReplayIntro();
    const tipX = $('#dhTipX'); if (tipX) tipX.onclick = ev => { ev.preventDefault(); ev.stopPropagation(); dhDismissTip(); };
    const tip = $('#dhTip'); if (tip) tip.onclick = ev => { if (ev.target && ev.target.id === 'dhTip'){ tip.classList.remove('show'); tip.style.display = 'none'; } };
  }
  function dhPointer(down){
    if (!dh || dh.intro) return false;
    if (dh.yardOpen || dh.shopOpen || dh.upOpen) return false;
    if (down){
      dh.pourHold = true;
      dh.pourAcc = .2;
      dhAct();
      return true;
    }
    dh.pourHold = false;
    return false;
  }

  function dhPad(jp){
    if (!dh) return false;
    if (dh.intro){
      if (jp.a || jp[0] || jp.x || jp[2] || jp.b || jp[1] || jp.start){ if (typeof pad !== 'undefined' && pad) pad.jump = false; dhSkipIntro(); return true; }
      return true;
    }
    if (dhTipOpen() && (jp.a || jp[0] || jp.x || jp[2] || jp.start)){ if (typeof pad !== 'undefined' && pad) pad.jump = false; dhDismissTip(); return true; }
    if (dh.yardOpen && (jp.b || jp[1])){ dhToggleYard(false); return true; }
    if (dh.shopOpen && (jp.b || jp[1])){ dhToggleShop(false); return true; }
    if (dh.upOpen && (jp.b || jp[1])){ dhToggleUp(false); return true; }
    if (jp.x || jp[2] || jp.a || jp[0] || jp.rt || jp[7]){ dhAct(); if (typeof pad !== 'undefined' && pad) pad.jump = false; return true; }
    if (jp.b || jp[1]){ dhRotate(); return true; }
    if (jp.y || jp[3]){ if (dh.carry) dhDump(); else dhSetTool(dh.tool === 'delete' ? 'place' : 'delete'); return true; }
    if (jp.lb || jp[4]){ dhCycle(-1); return true; }
    if (jp.rb || jp[5]){ dhCycle(1); return true; }
    return false;
  }
  function dhEventTarget(e){
    if (e && (e.target || e.srcElement)) return e.target || e.srcElement;
    if (typeof document !== 'undefined') return document.activeElement || null;
    return null;
  }
  function dhNodeOpenMenu(n){
    if (!n) return null;
    const root = (n.closest) ? n.closest('dialog, .modal, .opanel, #dhResetModal, #oPausePanel, #setModal, #dhShop, #dhYard, #dhUp') : null;
    if (!root) return null;
    if (root.id === 'dhResetModal' && typeof dhResetModalIsOpen === 'function' && !dhResetModalIsOpen()) return null;
    if (root.classList && root.classList.contains('opanel') && !root.classList.contains('show') && !root.open) return null;
    if ((root.id === 'dhShop' || root.id === 'dhYard' || root.id === 'dhUp') && dh && !dh.shopOpen && !dh.yardOpen && !dh.upOpen) return null;
    if (root.tagName && String(root.tagName).toLowerCase() === 'dialog' && root.open === false && !(root.classList && root.classList.contains('show'))) return null;
    return root;
  }
  function dhIsUiEvent(e, kind){
    const t = dhEventTarget(e);
    if (!t) return false;
    const isKey = kind === 'key' || !!(e && e.type && /^key/i.test(e.type || ''));
    if (isKey){
      // Keys are only ignored when focus is inside an open menu/modal or a text input —
      // not merely because a leftover button (Skip, toolbar, Exit) still has focus.
      if (t.closest && t.closest('input, textarea, select, [contenteditable="true"]')) return true;
      return !!dhNodeOpenMenu(t);
    }
    if (typeof t.closest === 'function'){
      return !!t.closest('dialog, .modal, .menu, .opanel, .mbox, .dhbar, .dhhand, .obtns, .ohud, button, a, input, label, select, textarea, #dhResetModal, #dhBar, #dhTip, #dhSkip, #dhCut, #dhLookHint, #oPausePanel, #setModal');
    }
    let n = t;
    while (n){
      const id = n.id || '';
      const tag = (n.tagName || '').toLowerCase();
      const cls = ' ' + (n.className || '') + ' ';
      if (id === 'dhResetModal' || id === 'dhBar' || id === 'dhTip' || id === 'dhSkip' || id === 'dhCut' || id === 'dhLookHint' || id === 'oPausePanel' || id === 'setModal') return true;
      if (/ (modal|menu|opanel|mbox|dhbar|dhhand|obtns|ohud) /.test(cls)) return true;
      if (tag === 'dialog' || tag === 'button' || tag === 'a' || tag === 'input' || tag === 'label' || tag === 'select' || tag === 'textarea') return true;
      n = n.parentElement || n.parentNode || null;
    }
    return false;
  }
  function dhNoteLookKey(e, down){
    if (!e || typeof keys === 'undefined' || !keys) return false;
    if (dhIsUiEvent(e, 'key')) return false;
    const code = e.code || '';
    const key = e.key || '';
    const isLook = /^(ArrowLeft|ArrowRight|ArrowUp|ArrowDown|KeyI|KeyJ|KeyK|KeyL)$/.test(code)
      || key === 'ArrowLeft' || key === 'ArrowRight' || key === 'ArrowUp' || key === 'ArrowDown'
      || key === 'Left' || key === 'Right' || key === 'Up' || key === 'Down';
    if (!isLook) return false;
    const on = down !== false;
    if (code) keys[code] = on;
    if (key === 'ArrowLeft' || key === 'Left' || code === 'ArrowLeft') keys.ArrowLeft = on;
    if (key === 'ArrowRight' || key === 'Right' || code === 'ArrowRight') keys.ArrowRight = on;
    if (key === 'ArrowUp' || key === 'Up' || code === 'ArrowUp') keys.ArrowUp = on;
    if (key === 'ArrowDown' || key === 'Down' || code === 'ArrowDown') keys.ArrowDown = on;
    if (code === 'KeyI' || key === 'i' || key === 'I') keys.KeyI = on;
    if (code === 'KeyJ' || key === 'j' || key === 'J') keys.KeyJ = on;
    if (code === 'KeyK' || key === 'k' || key === 'K') keys.KeyK = on;
    if (code === 'KeyL' || key === 'l' || key === 'L') keys.KeyL = on;
    if (on && typeof cam !== 'undefined' && cam){
      const nudge = 4 * Math.PI / 180; // ~4° immediate turn so a 50 ms tap still looks
      const right = (code === 'ArrowRight' || code === 'KeyL' || key === 'ArrowRight' || key === 'Right');
      const left = (code === 'ArrowLeft' || code === 'KeyJ' || key === 'ArrowLeft' || key === 'Left');
      const down = (code === 'ArrowDown' || code === 'KeyK' || key === 'ArrowDown' || key === 'Down');
      const up = (code === 'ArrowUp' || code === 'KeyI' || key === 'ArrowUp' || key === 'Up');
      if (right) cam.yaw -= nudge;
      else if (left) cam.yaw += nudge;
      else if (down) cam.pitch = Math.max(-1.3, Math.min(1.4, cam.pitch + nudge));
      else if (up) cam.pitch = Math.max(-1.3, Math.min(1.4, cam.pitch - nudge));
      if (dh) dh._lookTick = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
    }
    return true;
  }
  function dhKey(e){
    if (!e) return false;
    if (typeof dhOnResetKey === 'function' && dhOnResetKey(e)) return true;
    if (dhIsUiEvent(e, (e.type && /^key/i.test(e.type || '')) ? 'key' : 'pointer') && e.type && /pointer|mouse|click/i.test(e.type || '')) return true;
    if (typeof dhNoteLookKey === 'function') dhNoteLookKey(e, true);
    if (!dh || e.repeat) return false;
    const k = e.code || '';
    if (dh.intro){
      if (k === 'Space' || k === 'Enter' || k === 'KeyE' || k === 'KeyX'){ dhSkipIntro(); return true; }
      return true;
    }
    if (dhTipOpen() && (k === 'KeyE' || k === 'Enter' || k === 'Space' || k === 'KeyA' || k === 'Escape')){ dhDismissTip(); return true; }
    if (dh.yardOpen && (k === 'Escape' || k === 'KeyQ' || k === 'KeyB')){ dhToggleYard(false); return true; }
    if (dh.shopOpen && (k === 'Escape' || k === 'KeyB' || k === 'KeyQ')){ dhToggleShop(false); return true; }
    if (dh.upOpen && (k === 'Escape' || k === 'KeyB' || k === 'KeyQ')){ dhToggleUp(false); return true; }
    if (k === 'KeyB'){ dhToggleShop(); return true; }
    if (k === 'KeyE'){ dhAct(); return true; }
    if (k === 'KeyR'){ dhRotate(); return true; }
    if (k === 'KeyQ'){ dhDump(); return true; }
    if (k === 'KeyX' || k === 'Backspace' || k === 'Delete'){ dhSetTool(dh.tool === 'delete' ? 'place' : 'delete'); return true; }
    if (k === 'KeyC'){ dhCycleColor(1); return true; }
    if (k === 'BracketLeft' || k === 'Comma'){ dhCycle(-1); return true; }
    if (k === 'BracketRight' || k === 'Period'){ dhCycle(1); return true; }
    if (/^Digit[1-9]$/.test(k) || /^Numpad[1-9]$/.test(k)){ const i = (k.slice(-1)|0) - 1; if (DH_JOBS[i]) dhSetJob(DH_JOBS[i]); return true; }
    return false;
  }
