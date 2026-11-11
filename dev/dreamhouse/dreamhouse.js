  /* ===================== t251u: 🏡 DREAM HOUSE BUILDERS — menus hide the prompt, Escape closes shop, tidy yard, honest prompts. t243u: sticky Shop/Yard Close at top of panel. t252u: caption sits above the toolbar ===================== */
  const DH_KEY = 'rubloxDreamHouse', DH_CELL = 1.4, DH_N = 8, DH_PLOTS = 4, DH_SPACING = 18, DH_GRANT = 100, DH_VER = 4;
  const DH_FOOT = {x0: 1, z0: 1, x1: 6, z1: 6}; // slab footprint inside the plot
  const DH_BRICK_W = .5, DH_BRICK_H = .24, DH_BRICK_D = .28, DH_COURSES = 8;
  const DH_MATS = [
    {id: 'brick',   e: '🧱', name: 'Bricks',    cost: 1,  stack: 8,  carry: 8},
    {id: 'cement',  e: '🪨', name: 'Cement',    cost: 4,  stack: 1,  carry: 2},
    {id: 'sand',    e: '🏖️', name: 'Sand',      cost: 2,  stack: 1,  carry: 2},
    {id: 'wood',    e: '🪵', name: 'Planks',    cost: 3,  stack: 4,  carry: 6},
    {id: 'shingle', e: '🏠', name: 'Shingles',  cost: 1,  stack: 8,  carry: 12},
    {id: 'glass',   e: '🪟', name: 'Glass',     cost: 5,  stack: 2,  carry: 2},
    {id: 'paint',   e: '🎨', name: 'Paint',     cost: 3,  stack: 1,  carry: 2},
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
    {id: 'course',  name: 'Lay the first brick course', need: p => dhCount(p, 'brick') >= 8, pay: 20},
    {id: 'walls',   name: 'Raise the brick walls', need: p => dhCount(p, 'brick') >= 40, pay: 35},
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
    {id: 'brick', name: 'Faster brick laying',e: '🧱', cost: 45, max: 2, desc: 'Lay extra bricks with each placement'},
    {id: 'barrow',name: 'Big wheelbarrow',    e: '🪣', cost: 30, max: 1, desc: 'Carry two loads of wet mix'},
    {id: 'story', name: 'Second story',       e: '🏠', cost: 80, max: 1, desc: 'Build a taller second floor'},
    {id: 'lot',   name: 'Bigger lot',         e: '📐', cost: 90, max: 1, desc: 'Expand your house footprint'}
  ];
  const DH_YARD = {x: 0, z: -20};
  const DH_BOUND = {x: 46, z: 31};
  let dh = null;

  function dhMatOf(id){ return DH_MATS.find(m => m.id === id); }
  function dhWho(){ return (typeof mp !== 'undefined' && mp && mp.on && mp.uid) ? String(mp.uid) : 'local'; }
  function dhIsGuest(){ return !!(typeof mp !== 'undefined' && mp && mp.on && typeof mpGuest === 'function' && mpGuest()); }
  function dhOrigin(plot){ return [(plot - 1.5) * DH_SPACING, -DH_N * DH_CELL / 2]; }
  function dhSpawnPos(plot){
    const [ox, oz] = dhOrigin(plot == null ? (dh && dh.mine) || 0 : plot);
    return {x: ox + DH_CELL * 4, y: .05, z: oz - 2.8};
  }
  function dhLayoutYard(){
    const plot = (dh && dh.mine) || 0;
    const [ox, oz] = dhOrigin(plot);
    // west of your lot, a little toward the camera so it's in view, ~14m from spawn,
    // and not overlapping the material pile (which sits on the west-north corner)
    DH_YARD.x = ox - 8;
    DH_YARD.z = oz + 1;
  }
  function dhClampPlayer(){
    if (typeof P === 'undefined' || !P) return P;
    const bx = DH_BOUND.x, bz = DH_BOUND.z;
    if (P.x > bx) P.x = bx; else if (P.x < -bx) P.x = -bx;
    if (P.z > bz) P.z = bz; else if (P.z < -bz) P.z = -bz;
    if ((P.y || 0) < .05){ P.y = .05; if (P.vy < 0) P.vy = 0; }
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
  function dhFoot(){ const big = !!(dh && dh.upgrades && dh.upgrades.lot); return big ? {x0: 0, z0: 0, x1: DH_N - 1, z1: DH_N - 1} : DH_FOOT; }
  function dhInFoot(ix, iz){ const f = dhFoot(); return ix >= f.x0 && ix <= f.x1 && iz >= f.z0 && iz <= f.z1; }
  function dhCourses(){ return DH_COURSES + ((dh && dh.upgrades && dh.upgrades.story) ? 8 : 0); }
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
    const out = {ver: DH_VER, pieces: [], stock: dhEmptyStock(), goals: (r.goals && typeof r.goals === 'object') ? Object.assign({}, r.goals) : {}, coins: Math.max(0, +r.coins || 0), likes: Math.max(0, r.likes | 0), granted: !!r.granted, v1pieces: null, introSeen: !!r.introSeen, upgrades: dhEmptyUpgrades()};
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
    return out;
  }
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
    if (extra) Object.assign(p, extra);
    save(DH_KEY, p);
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
    else if (id === 'brick'){ solid(DH_BRICK_W - .02, DH_BRICK_H - .02, DH_BRICK_D, 0, 0, 0, M.brick); }
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

  function dhBinPos(i){
    const k = i, col = k % 5, row = (k / 5) | 0;
    return {x: DH_YARD.x - 4.4 + col * 2.2, z: DH_YARD.z - 2.6 + row * 2.4, id: DH_MATS.filter(m => !m.nosale)[k] && DH_MATS.filter(m => !m.nosale)[k].id};
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
    const x = 50, z = 35, h = 6, t = 1.6;
    const wall = (wx, wz, ww, wd) => {
      const b = plat(wx, h, wz, ww, wd, '#3d8f4a', h);
      b.camSkip = true;
      if (b.mesh){ b.mesh.visible = false; if (b.mesh.material) b.mesh.material.visible = false; }
    };
    wall(0, -z, 104, t); wall(0, z, 104, t); wall(-x, 0, t, 74); wall(x, 0, t, 74);
    // visible low curb so the edge of the grass is obvious
    const curb = (wx, wz, ww, wd) => plat(wx, .28, wz, ww, wd, '#5a8f4a', .28);
    curb(0, -z + .6, 100, .5); curb(0, z - .6, 100, .5); curb(-x + .6, 0, .5, 70); curb(x - .6, 0, .5, 70);
  }
  function dhBuildYard(){
    plat(DH_YARD.x, .12, DH_YARD.z, 12, 9, '#cfc4a8', .2);
    // short path from the west edge of your lot to the yard
    const [pox, poz] = dhOrigin((dh && dh.mine) || 0);
    plat((pox + DH_YARD.x) / 2, .14, DH_YARD.z, Math.max(4, pox - DH_YARD.x), 3.2, '#cfc4a8', .18);
    // huge sign facing the plot / spawn (plot is toward +X)
    const board = new THREE.Mesh(new THREE.BoxGeometry(.22, 3.2, 10), dhMat('#8b4513'));
    board.position.set(DH_YARD.x + 5.6, 4.8, DH_YARD.z); scene.add(board);
    const posts = [[5.6, 2.3, -4.6], [5.6, 2.3, 4.6]];
    posts.forEach(([x, y, z]) => { const p = new THREE.Mesh(new THREE.BoxGeometry(.24, 4.6, .24), dhMat('#5a4030')); p.position.set(DH_YARD.x + x, y, DH_YARD.z + z); scene.add(p); });
    const sign = (typeof label === 'function') ? label('📦 SUPPLY YARD', 'rgba(29,35,64,.95)', '#ffd23f', 512) : null;
    if (sign && sign.position) sign.position.set(DH_YARD.x + 4.2, 5.4, DH_YARD.z + 1.6);
    if (sign && sign.scale) sign.scale.set(9.5, 2.1, 1);
    if (sign){ sign.renderOrder = 12; scene.add(sign); }
    // tall yellow beacon + bobbing arrow, visible over the trees from spawn
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(.14, .2, 12, 8), dhMat('#ffd23f', {emissive: '#ffd23f', emissiveIntensity: .7}));
    pole.position.set(DH_YARD.x, 6.2, DH_YARD.z); scene.add(pole);
    const halo = new THREE.Mesh(new THREE.CylinderGeometry(.85, .85, 11, 12), dhMat('#ffe08a', {transparent: true, opacity: .28, emissive: '#ffd23f', emissiveIntensity: .45, depthWrite: false}));
    halo.position.set(DH_YARD.x, 6.4, DH_YARD.z); scene.add(halo);
    const arrow = new THREE.Mesh(new THREE.ConeGeometry(.9, 1.8, 8), dhMat('#ff4d5e', {emissive: '#ff4d5e', emissiveIntensity: .65}));
    arrow.rotation.x = Math.PI; arrow.position.set(DH_YARD.x, 13.4, DH_YARD.z); scene.add(arrow);
    dh.yardBeacon = {pole, halo, arrow, y0: 13.4};
    dh.bins = [];
    DH_MATS.filter(m => !m.nosale).forEach((m, i) => {
      const p = dhBinPos(i);
      const col = m.id === 'brick' ? dh.mats.brick : m.id === 'wood' || m.id === 'shingle' ? dh.mats.wood : m.id === 'sand' ? dhMat('#e5c574') : dh.mats.bag;
      plat(p.x, .45, p.z, 1.4, 1.4, '#8a5a2b', .7);
      const crate = new THREE.Mesh(new THREE.BoxGeometry(1.1, .7, 1.1), col);
      crate.position.set(p.x, .85, p.z); scene.add(crate);
      dh.bins.push({id: m.id, x: p.x, z: p.z, mesh: crate});
    });
  }
  function dhBuildMixer(plot){
    const [ox, oz] = dhOrigin(plot);
    const x = ox + DH_N * DH_CELL + 1.6, z = oz + 1.4;
    const g = new THREE.Group(); g.position.set(x, 0, z);
    const drum = new THREE.Mesh(new THREE.CylinderGeometry(.45, .5, .9, 12), dh.mats.rust);
    drum.rotation.z = Math.PI / 2; drum.position.set(0, .85, 0); g.add(drum);
    const leg = (lx) => { const m = new THREE.Mesh(new THREE.BoxGeometry(.08, .7, .08), dh.mats.dark); m.position.set(lx, .35, .25); g.add(m); const n = m.clone(); n.position.z = -.25; g.add(n); };
    leg(-.35); leg(.35);
    const barrow = new THREE.Mesh(new THREE.BoxGeometry(.7, .25, .45), dh.mats.rust);
    barrow.position.set(1.1, .35, 0); g.add(barrow);
    scene.add(g);
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
    if (Math.hypot(x - DH_YARD.x, z - DH_YARD.z) < 10) return true;
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
        const towardYard = Math.atan2(yard.z - cz, yard.x - cx);
        let dAng = Math.abs(Math.atan2(Math.sin(t - towardYard), Math.cos(t - towardYard)));
        if (dAng < .7) continue;
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
    dh = {mine: 0, job: 'mark', rot: 0, color: 0, tool: 'place', aim: null, pieces: {}, meshes: {}, ghost: null, bank: 0, likes: 0, goals: {}, earned: 0, near: -1, liked: {}, saveT: 0, remote: dhIsGuest(), carry: null, stock: dhEmptyStock(), bins: [], mixers: {}, piles: {}, mats: dhMakeMats(), v1pieces: null, cureT: 0, upgrades: dhEmptyUpgrades(), introSeen: false, intro: null, trees: [], shopOpen: false, yardOpen: false, foundYard: false, cut: null, yardBeacon: null};
    scene.background = new THREE.Color('#b8e8ff');
    if (scene.fog){ scene.fog.color = new THREE.Color('#d7f3ff'); scene.fog.near = 50; scene.fog.far = 160; }
    plat(0, 0, 0, 100, 70, '#8fd39a', .35);
    const p0 = dhProg();
    dh.bank = p0.coins; dh.likes = p0.likes; dh.goals = Object.assign({}, p0.goals); dh.stock = Object.assign(dhEmptyStock(), p0.stock); dh.v1pieces = p0.v1pieces; dh.upgrades = Object.assign(dhEmptyUpgrades(), p0.upgrades || {}); dh.introSeen = !!p0.introSeen;
    if (!p0.granted){ dh.bank += DH_GRANT; dh.grantedNow = true; }
    dh.mine = dhAssignPlot();
    dhLayoutYard();
    dhBuildBounds();
    dhBuildYard();
    dhPlantTrees();
    for (let i = 0; i < DH_PLOTS; i++){
      const [ox, oz] = dhOrigin(i);
      const cx = ox + DH_N * DH_CELL / 2, cz = oz + DH_N * DH_CELL / 2;
      plat(cx, .08, cz, DH_N * DH_CELL + .4, DH_N * DH_CELL + .4, i === dh.mine ? '#b6e8a8' : '#9fd3a8', .16);
      [[ox - .15, cz, .3, DH_N * DH_CELL + .6], [ox + DH_N * DH_CELL + .15, cz, .3, DH_N * DH_CELL + .6], [cx, oz - .15, DH_N * DH_CELL + .6, .3], [cx, oz + DH_N * DH_CELL + .15, DH_N * DH_CELL + .6, .3]].forEach(([x, z, w, d]) => plat(x, .45, z, w, d, '#fffaf0', .5));
      const sign = label((i === dh.mine ? '🏡 Your Plot' : '🏡 Plot ' + (i + 1)), 'rgba(29,35,64,.92)');
      if (sign && sign.position) sign.position.set(cx, 2.2, oz - .6);
      if (sign) scene.add(sign);
      dh.pieces[i] = []; dh.meshes[i] = [];
      dhBuildMixer(i);
    }
    // single-player: other lots stay empty (real players only — no leftover show homes or intro houses)
    (p0.pieces || []).forEach(rec => dhPut(dh.mine, rec, true));
    dhStockViz(dh.mine);
    const [ox, oz] = dhOrigin(dh.mine);
    const sp = dhSpawnPos(dh.mine);
    Object.assign(P, {x: sp.x, y: sp.y, z: sp.z, vx: 0, vy: 0, vz: 0}); P.face = 0; cam.yaw = Math.PI; cam.pitch = .38; cam.dist = 12;
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
  function dhIsOpening(face, course, along){
    const span = Math.floor(((DH_FOOT.x1 - DH_FOOT.x0 + 1) * DH_CELL) / DH_BRICK_W);
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
    if (!quiet && plot === dh.mine){ dhCheckGoals(); dhSave(); }
    return mesh;
  }
  function dhRemoveAtKey(plot, key, quiet){
    const list = dh.pieces[plot] || [];
    const idx = list.findIndex(a => dhKeyOf(a) === key);
    if (idx < 0) return false;
    const mesh = (dh.meshes[plot] || [])[idx];
    if (mesh){ dhBindSolids(mesh, false); if (typeof scene !== 'undefined') scene.remove(mesh); }
    list.splice(idx, 1); (dh.meshes[plot] || []).splice(idx, 1);
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
  function dhAimCell(){
    if (!dh) return null;
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
    if (job === 'brick' && !(dh.carry && dh.carry.id === 'brick') && !(dh.stock.brick|0)) return '🛒 Buy bricks at the Supply Yard first';
    if ((job === 'pour' || job === 'mix') && !(dh.carry && (dh.carry.id === 'wetmix' || dh.carry.id === 'cement' || dh.carry.id === 'sand')) && !(dh.stock.cement|0) && !(dh.stock.sand|0)) return '🛒 Buy cement at the Supply Yard first';
    if ((job === 'stud' || job === 'rafter' || job === 'frame') && !(dh.carry && dh.carry.id === 'wood') && !(dh.stock.wood|0)) return '🛒 Buy wood at the Supply Yard first';
    if (job === 'shingle' && !(dh.carry && dh.carry.id === 'shingle') && !(dh.stock.shingle|0)) return '🛒 Buy shingles at the Supply Yard first';
    if (job === 'glass' && !(dh.carry && dh.carry.id === 'glass') && !(dh.stock.glass|0)) return '🛒 Buy glass at the Supply Yard first';
    if (job === 'paint' && !(dh.carry && dh.carry.id === 'paint') && !(dh.stock.paint|0)) return '🛒 Buy paint at the Supply Yard first';
    if (job === 'dig' && !dhNextBuildCell('dig')) return '📍 Stake the foundation first';
    if (job === 'mark' && !dhNextBuildCell('mark')) return '📍 The foundation is already staked';
    if (job === 'pour' && !dhNextBuildCell('pour')) return '🕳️ Dig the foundation forms first';
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
    return Math.hypot((P.x || 0) - DH_YARD.x, (P.z || 0) - DH_YARD.z) < 10;
  }
  function dhNearBin(){
    if (!dh || !dh.bins) return null;
    let best = null, bd = 2.0;
    dh.bins.forEach(b => { const d = Math.hypot((P.x || 0) - b.x, (P.z || 0) - b.z); if (d < bd){ bd = d; best = b; } });
    return best;
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
    const global = (typeof coins === 'number' ? coins : 0);
    if (dh.bank >= cost){ dh.bank -= cost; return true; }
    if (global >= cost && typeof setCoins === 'function'){ setCoins(global - cost); return true; }
    if (dh.bank + global >= cost && typeof setCoins === 'function'){ const use = cost - dh.bank; dh.bank = 0; setCoins(global - use); return true; }
    return false;
  }
  function dhGive(id, n){ if (!dh) return; dh.stock[id] = (dh.stock[id] || 0) + (n || 1); dhStockViz(dh.mine); }
  function dhCarryCap(id){ const m = dhMatOf(id); const base = m ? m.carry : 1; if (id === 'wetmix') return base + dhUp('barrow'); return base + dhUp('carry') * (id === 'brick' || id === 'shingle' || id === 'wood' ? 4 : 1); }
  function dhSetCarry(id, n){ dh.carry = (n > 0 && id) ? {id, n} : null; dhHud(); }
  function dhBuy(id, count){
    if (!dh) return false;
    if (dh.intro) return false;
    const m = dhMatOf(id); if (!m || m.nosale) return false;
    const n = count || m.stack;
    if (dh.carry && dh.carry.id !== id){ banner('🧺 Dump what you are carrying first (Q)'); return false; }
    const have = dh.carry && dh.carry.id === id ? dh.carry.n : 0;
    const add = Math.min(n, dhCarryCap(id) - have);
    if (add <= 0){ banner('🧺 Your arms are full'); return false; }
    if (!dhPay(m.cost * add)){ banner('🪙 Need ' + (m.cost * add) + ' coins for ' + m.name); return false; }
    dhSetCarry(id, have + add);
    banner(m.e + ' Picked up ' + add + ' ' + m.name.toLowerCase());
    dhSave(); dhHud(); dhBar();
    return true;
  }
  function dhDump(){
    if (!dh || !dh.carry) return false;
    if (dhPlotAt(P.x, P.z) !== dh.mine && !dhNearPile()){ banner('🏡 Carry that back to your plot to dump it'); return false; }
    if (dh.carry.id === 'wetmix'){ banner('🪣 Pour the wet mix into a dug form'); return false; }
    dh.stock[dh.carry.id] = (dh.stock[dh.carry.id] || 0) + dh.carry.n;
    banner('📦 Stacked ' + dh.carry.n + ' ' + dh.carry.id + ' on your plot');
    dh.carry = null; dhStockViz(dh.mine); dhSave(); dhHud(); return true;
  }
  function dhPickup(id, n){
    if (!dh) return false;
    n = n || 1;
    const have = dh.stock[id] || 0;
    if (have < n) return false;
    if (dh.carry && dh.carry.id !== id){ banner('🧺 Dump or place what you are carrying first'); return false; }
    const room = dhCarryCap(id) - (dh.carry && dh.carry.id === id ? dh.carry.n : 0);
    const take = Math.min(n, room, have);
    if (take <= 0) return false;
    dh.stock[id] -= take;
    dhSetCarry(id, (dh.carry && dh.carry.id === id ? dh.carry.n : 0) + take);
    dhStockViz(dh.mine); dhHud(); return true;
  }
  function dhUseCarry(n){
    if (!dh || !dh.carry) return false;
    n = n || 1; if (dh.carry.n < n) return false;
    dh.carry.n -= n; if (dh.carry.n <= 0) dh.carry = null;
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
    if (dh.carry && (dh.carry.id === 'cement' || dh.carry.id === 'sand')){
      const id = dh.carry.id; dhUseCarry(1); mx[id] = (mx[id] || 0) + 1;
      banner((id === 'cement' ? '🪨' : '🏖️') + ' Loaded ' + id + ' into the mixer');
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
    if (dh.carry && dh.carry.id !== 'wetmix'){ banner('🧺 Dump your load first'); return false; }
    if (dh.carry && dh.carry.n >= dhCarryCap('wetmix')){ banner('🪣 The barrow is already full'); return false; }
    mx.mixed--; dhSetCarry('wetmix', 1);
    if ((mx.mixed | 0) < 1) mx.phase = 'idle';
    banner('🪣 Wheelbarrow filled with wet concrete');
    return true;
  }
  function dhPour(){
    if (!dh || !dh.carry || dh.carry.id !== 'wetmix') return false;
    if (!dhNearOwnPlot()){ banner('🏡 Walk onto your plot'); return false; }
    const aim = dhNextBuildCell('pour');
    if (!aim){ banner(dhWhyNot() || '🕳️ Dig or stake the form first'); return false; }
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
    const next = dhNextBrick(aim.plot, face, aim);
    if (!next){ banner('🧱 That stretch is already laid (or it is an opening)'); return false; }
    const extra = dhUp('brick');
    let laid = 0;
    for (let n = 0; n < 1 + extra; n++){
      const slot = n === 0 ? next : dhNextBrick(aim.plot, face, aim);
      if (!slot) break;
      if (!dh.carry || dh.carry.id !== 'brick' || dh.carry.n < 1) break;
      dhUseCarry(1);
      if ((dh.stock.mortar | 0) > 0) dh.stock.mortar--;
      dhPut(aim.plot, ['brick', 0, slot.course, slot.along, face, 0]);
      dhNet('place', {rec: ['brick', 0, slot.course, slot.along, face, 0], plot: aim.plot});
      laid++;
    }
    return laid > 0;
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
    const foot = dhFoot();
    const span = Math.floor(((foot.x1 - foot.x0 + 1) * DH_CELL) / DH_BRICK_W);
    const have = (dh.pieces[plot] || []).filter(a => a[0] === 'brick' && (a[4]|0) === face);
    for (let c = 0; c < dhCourses(); c++) for (let k = 0; k < span; k++){
      if (dhIsOpening(face, c, k)) continue;
      if (!have.some(a => (a[2]|0) === c && (a[3]|0) === k)) return {course: c, along: k};
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
    const aim = dhNextBuildCell(digging ? 'dig' : 'mark');
    if (!aim){
      banner(dhWhyNot() || (digging ? '📍 Stake the foundation first' : '📍 The foundation is already staked'));
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
    const plot = dhPlotAt(P.x, P.z);
    if (plot >= 0 && plot !== dh.mine) return dhLike();
    const mx = dhNearMixer();
    const pileHere = dhNearPile();
    if (dhNearYard() && !mx && !pileHere){ dhToggleYard(true); return true; }
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
    dhSave(); dhHud(); dhBar(); dhRenderShop();
    return true;
  }
  function dhToggleYard(on){
    if (!dh) return;
    if (dh.intro) return;
    dhToggleShop(false);
    dh.yardOpen = on == null ? !dh.yardOpen : !!on;
    if (dh.yardOpen) dh.foundYard = true;
    const el = $('#dhYard');
    if (el){ el.style.display = dh.yardOpen ? '' : 'none'; if (dh.yardOpen) el.classList.add('show'); else el.classList.remove('show'); }
    if (dh.yardOpen) dhRenderYard();
  }
  function dhRenderYard(){
    const el = $('#dhYard'); if (!el || !dh) return;
    const items = DH_MATS.filter(m => !m.nosale).map(m => {
      const n = (dh.stock[m.id]|0) + (dh.carry && dh.carry.id === m.id ? dh.carry.n : 0);
      return '<button class="dhsitem" data-dhbuy="' + m.id + '"><span class="dhe">' + m.e + '</span><b>' + m.name + '</b><small>' + m.cost + '🪙' + (n ? ' · have ' + n : '') + '</small></button>';
    }).join('');
    el.innerHTML = '<div class="dhsbox"><div class="dhshead"><h3>📦 Supply Yard</h3><button class="dhb" id="dhYardX">Close</button></div><div class="dhsbody"><p class="dhsbank">🪙 ' + Math.floor(dh.bank) + ' building coins · walk up and press E to shop</p><div class="dhsgrid">' + items + '</div></div></div>';
  }
  function dhToggleShop(on){
    if (!dh) return;
    if (dh.intro) return;
    // opening Shop must never move the player or camera
    if (on !== false) dhToggleYard(false);
    dh.shopOpen = on == null ? !dh.shopOpen : !!on;
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
    const ups = DH_UPGRADES.map(u => {
      const have = dhUp(u.id);
      const maxed = have >= u.max;
      return '<button class="dhsitem' + (maxed ? ' max' : '') + '" data-dhup="' + u.id + '"' + (maxed ? ' disabled' : '') + '><span class="dhe">' + u.e + '</span><b>' + u.name + '</b><small>' + (maxed ? 'Max ' + have + '/' + u.max : u.cost + '🪙 · ' + have + '/' + u.max) + '<br>' + u.desc + '</small></button>';
    }).join('');
    el.innerHTML = '<div class="dhsbox"><div class="dhshead"><h3>🛒 Dream House Shop</h3><button class="dhb" id="dhShopX">Close</button></div><div class="dhsbody"><p class="dhsbank">🪙 ' + Math.floor(dh.bank) + ' coins · earned from build milestones</p><h4>Furniture</h4><div class="dhsgrid">' + furn + '</div><h4>Upgrades</h4><div class="dhsgrid">' + ups + '</div></div></div>';
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
  function dhSetFade(a){
    const f = $('#dhFade'); if (!f) return;
    f.style.opacity = String(Math.max(0, Math.min(1, a)));
    f.style.pointerEvents = a > .6 ? 'auto' : 'none';
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
    const skip = $('#dhSkip'); if (skip) skip.style.display = '';
    dhSay('This is your new house!');
    dhSetFade(0);
    ['#dhBar', '#dhAct'].forEach(id => { const el = $(id); if (el){ el.classList.remove('show'); if (id === '#dhBar') el.style.display = 'none'; } });
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
    dhFinishIntro();
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
    if (first && !replay){
      const empty = !(dh.pieces[dh.mine] || []).length;
      if (empty){
        dh.stock.brick = (dh.stock.brick | 0) + 16;
        dh.stock.cement = (dh.stock.cement | 0) + 2;
        dh.stock.sand = (dh.stock.sand | 0) + 2;
        dh.stock.wood = (dh.stock.wood | 0) + 8;
        dh.stock.shingle = (dh.stock.shingle | 0) + 12;
        dh.stock.paint = (dh.stock.paint | 0) + 1;
        dhStockViz(dh.mine);
      }
    }
    dhSave();
    dhSetFade(0);
    dhSay('');
    const wrap = $('#dhCut'); if (wrap){ wrap.style.display = 'none'; wrap.classList.remove('show'); }
    const [ox, oz] = dhOrigin(dh.mine);
    if (typeof P !== 'undefined') Object.assign(P, {x: ox + DH_CELL * 4, y: .05, z: oz - 2.8, vx: 0, vy: 0, vz: 0});
    if (typeof cam !== 'undefined'){ cam.yaw = Math.PI; cam.pitch = .38; cam.dist = 12; }
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
    if (intro.stage === 'house'){ dhSay('This is your new house!'); dhSetFade(0); }
    if (intro.stage === 'flood' && dh.cut){
      dhSay('');
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
    if (intro.stage === 'rebuild'){ dhSay('Re-build it!'); if (dh.cut && dh.cut.house) dh.cut.house.visible = false; }
    if (intro.stage === 'fadeout'){ dhSay(''); dhSetFade(Math.min(1, intro.t / Math.max(.2, dur))); }
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
    dhBindUI();
    if (!dh.introSeen){
      dhStartIntro(false);
    } else {
      banner(mp && mp.on ? '🏡 Dream House Builders — buy materials, carry them, and build brick by brick!' : '🏡 Buy bricks and cement at the Supply Yard, carry them to your plot, and build it yourself!');
      tipTimer = 8; dhHud(); dhBar();
      dreamhouseUpdate(0);
    }
    const replay = $('#dhReplay'); if (replay) replay.style.display = '';
  }
  function dreamhouseStop(){
    if (!dh) return;
    dhSave();
    if (dh.intro){ dh.intro = null; }
    if (dh.cut){ ['house', 'mom', 'water'].forEach(k => { if (dh.cut[k] && typeof scene !== 'undefined') scene.remove(dh.cut[k]); }); dh.cut = null; }
    if (dh.ghost) scene.remove(dh.ghost);
    Object.keys(dh.meshes || {}).forEach(k => (dh.meshes[k] || []).forEach(m => { dhBindSolids(m, false); scene.remove(m); }));
    Object.keys(dh.piles || {}).forEach(k => dh.piles[k] && dh.piles[k].mesh && scene.remove(dh.piles[k].mesh));
    Object.keys(dh.mixers || {}).forEach(k => dh.mixers[k] && dh.mixers[k].mesh && scene.remove(dh.mixers[k].mesh));
    (dh.trees || []).forEach(t => t.mesh && scene.remove(t.mesh));
    if (typeof model !== 'undefined' && model && model.g) model.g.visible = true;
    ['#dhBar', '#dhAct', '#dhCut', '#dhShop', '#dhYard', '#dhGuide'].forEach(id => { const el = $(id); if (el){ el.classList.remove('show'); el.style.display = 'none'; } });
    const replay = $('#dhReplay'); if (replay) replay.style.display = 'none';
    dhSetFade(0); dhSay('');
    dh = null;
  }
  function dhActPrompt(){
    if (!dh) return '';
    if (dh.intro || dh.shopOpen || dh.yardOpen) return '';
    const key = (typeof pad !== 'undefined' && pad && pad.on) ? 'Ⓧ' : (typeof touchUI !== 'undefined' && touchUI ? 'tap' : 'E');
    const mxn = dhNearMixer(), pile = dhNearPile();
    const onLot = dhNearOwnPlot();
    const ghostJob = (onLot && (dh.job === 'mark' || dh.job === 'dig' || dh.job === 'pour')) ? dhNextBuildCell(dh.job) : null;
    const prog = (job, word) => {
      const c = dhJobCounts(job);
      return c.need ? (' · ' + word + ' ' + c.have + '/' + c.need) : '';
    };
    if (dh.near >= 0 && dh.near !== dh.mine) return '💛 Like this house';
    if (mxn && dh.carry && (dh.carry.id === 'cement' || dh.carry.id === 'sand')) return '🪨 Load the mixer';
    if (mxn && mxn.phase === 'mixing') return '🌀 Mixing…';
    if (mxn && ((mxn.cement|0) >= 1 && (mxn.sand|0) >= 1)) return '🌀 Mix concrete';
    if (mxn && (mxn.mixed|0) >= 1) return '🪣 Fill wheelbarrow';
    if (dh.carry && dh.carry.id === 'wetmix' && onLot) return '🪣 Pour the form' + prog('pour', 'Forms');
    if (dh.carry && dh.carry.id === 'brick' && onLot) return '🧱 Lay a brick';
    if (dh.carry && dh.carry.id === 'glass' && onLot) return '🪟 Install glass';
    if (pile && !dh.carry) return '📦 Pick up materials';
    if (dh.carry && pile && dh.carry.id !== 'wetmix') return '📦 Dump on your plot';
    if (dhNearYard()) return key + ': Open the Supply Yard';
    if (!onLot) return '🏡 Walk onto your plot';
    if (ghostJob && dh.job === 'mark') return key + ': Place stake here' + prog('mark', 'Stakes');
    if (ghostJob && dh.job === 'dig') return key + ': Dig the form here' + prog('dig', 'Forms');
    if (ghostJob && dh.job === 'pour' && dh.carry && dh.carry.id === 'wetmix') return key + ': Pour concrete here' + prog('pour', 'Forms');
    const why = dhWhyNot();
    if (why) return why;
    if (dhCanBuild(dh.aim) || onLot){
      const labels = {mark: key + ': Place stake here' + prog('mark', 'Stakes'), dig: key + ': Dig the form here' + prog('dig', 'Forms'), pour: key + ': Pour concrete here' + prog('pour', 'Forms'), brick:'🧱 Lay a brick', stud:'🪵 Set a stud', rafter:'🪜 Set a rafter', shingle:'🏠 Nail a shingle', frame:'🚪 Fit a frame', glass:'🪟 Install glass', paint:'🎨 Paint', furn:'🛋️ Place furniture'};
      return labels[dh.job] || '🏗️ Build';
    }
    return '';
  }
  function dhCamComfort(dt){
    if (typeof cam === 'undefined' || !cam) return;
    dt = dt || .016;
    // keep a third-person follow camera; never pitch up into the sky from movement
    if (cam.pitch < .18 || cam.pitch > .62) cam.pitch += (.38 - cam.pitch) * Math.min(1, dt * 3);
    cam.pitch = Math.max(.16, Math.min(.62, cam.pitch));
    if (cam.dist < 10) cam.dist += (12 - cam.dist) * Math.min(1, dt * 3);
    if (cam.dist > 16) cam.dist = 16;
  }
  function dreamhouseUpdate(dt){
    if (!dh || over) return;
    if (dh.intro){ dhIntroTick(dt); return; }
    if (choosing) return;
    dhClampPlayer();
    dhCamComfort(dt);
    dhFadeOccludingTrees();
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
    const ghostAt = (dh.job === 'mark' || dh.job === 'dig' || dh.job === 'pour') ? dhNextBuildCell(dh.job) : (dhCanBuild(dh.aim) ? dh.aim : dhNextBuildCell(dh.job));
    if (dh.ghost){
      const ok = !!(ghostAt && ghostAt.plot === dh.mine && dhNearOwnPlot());
      dh.ghost.visible = ok && !dh.yardOpen && !dh.shopOpen;
      if (ok){
        const w = dhCellWorld(ghostAt.plot, ghostAt.ix, ghostAt.iz, .08);
        dh.ghost.position.set(w.x, w.y, w.z);
        const glow = dh.ghost.userData && dh.ghost.userData.glow;
        if (glow && glow.material){
          glow.material.opacity = 0.4 + 0.2 * Math.sin((typeof worldT === 'number' ? worldT : 0) * 6);
          if (glow.material.color && glow.material.color.set) glow.material.color.set(dh.tool === 'delete' ? '#ff4d5e' : '#ffe08a');
        }
      }
    }
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
  function dhHud(){
    if (!dh) return;
    const n = $('#dhN'); if (n) n.textContent = '🪙 ' + Math.floor(dh.bank);
    const g = $('#dhGuide'), gt = $('#dhGuideT');
    if (g){
      const show = !dh.foundYard && !dh.yardOpen && !dh.intro;
      g.style.display = show ? '' : 'none';
      if (show){
        g.classList.add('show');
        const dx = DH_YARD.x - (P.x || 0), dz = DH_YARD.z - (P.z || 0);
        const yaw = (typeof cam !== 'undefined' && cam && cam.yaw) || 0;
        const ang = Math.atan2(dx, dz) - yaw;
        const arrow = g.querySelector('.dhgarrow');
        if (arrow) arrow.style.transform = 'rotate(' + (ang * 180 / Math.PI) + 'deg)';
        if (gt) gt.textContent = 'Go to the Supply Yard';
      } else g.classList.remove('show');
    }
    const inv = $('#dhInv');
    if (inv){
      const bits = ['brick','cement','sand','wood','shingle','glass'].map(id => {
        const m = dhMatOf(id); const v = (dh.stock[id]|0) + (dh.carry && dh.carry.id === id ? dh.carry.n : 0);
        return v ? (m.e + v) : '';
      }).filter(Boolean);
      inv.textContent = bits.join(' ') || 'no stock';
    }
    const c = $('#dhCarry');
    if (c) c.textContent = dh.carry ? ('Carrying ' + dh.carry.n + ' ' + (dhMatOf(dh.carry.id) || {name: dh.carry.id}).name) : 'Hands empty';
    const tb = $('#dhTool'); if (tb) tb.textContent = dh.tool === 'delete' ? '🗑️' : ({mark:'📍', dig:'🕳️', mix:'🌀', pour:'🪣', brick:'🧱', stud:'🪵', rafter:'🪜', shingle:'🏠', frame:'🚪', glass:'🪟', paint:'🎨', furn:'🛋️'}[dh.job] || '🏗️');
  }
  function dhBar(){
    if (!dh) return;
    const bar = $('#dhBar'); if (!bar) return;
    bar.style.display = ''; bar.classList.add('show');
    const jobs = '<div class="dhtools">' + DH_JOBS.map(j => {
      const lab = {mark:'📍 Stake', dig:'🕳️ Dig', mix:'🌀 Mix', pour:'🪣 Pour', brick:'🧱 Brick', stud:'🪵 Stud', rafter:'🪜 Rafter', shingle:'🏠 Shingle', frame:'🚪 Frame', glass:'🪟 Glass', paint:'🎨 Paint', furn:'🛋️ Furnish'}[j];
      return '<button class="dhb' + (dh.job === j && dh.tool === 'place' ? ' on' : '') + '" data-dhjob="' + j + '">' + lab + '</button>';
    }).join('') + '<button class="dhb' + (dh.tool === 'delete' ? ' on' : '') + '" data-dhtool="delete">🗑️</button><button class="dhb" id="dhDumpBtn">📦 Dump</button><button class="dhb" id="dhYardBtn">📦 Supply Yard</button><button class="dhb" id="dhShopBtn">🛒 Shop</button></div>';
    const cols = dh.job === 'paint' ? ('<div class="dhcols">' + DH_PAINT.map((c, i) => '<button class="dhc' + (dh.color === i ? ' on' : '') + '" data-dhcol="' + i + '" style="background:' + c.col + '" title="' + c.name + '"></button>').join('') + '</div>') : '';
    const inv = '<div class="dinv">' + DH_MATS.filter(m => !m.nosale).map(m => {
      const n = (dh.stock[m.id]|0);
      return '<span class="dhi" data-dhid="' + m.id + '">' + m.e + '<b>' + n + '</b></span>';
    }).join('') + (dh.carry ? '<span class="dhi on">🧺 ' + dh.carry.n + ' ' + dh.carry.id + '</span>' : '') + '</div>';
    bar.innerHTML = jobs + cols + inv;
    dhBindUI();
    if (typeof dhLayoutHud === 'function') dhLayoutHud();
  }
  function dhBindUI(){
    if (window.__dhBound4) return;
    window.__dhBound4 = true;
    const act = $('#dhAct'); if (act) act.onclick = () => dh && !dh.intro && dhAct();
    const bar = $('#dhBar');
    if (bar) bar.addEventListener('click', ev => {
      const t = ev.target.closest('[data-dhjob],[data-dhtool],[data-dhid],[data-dhcol],#dhDumpBtn,#dhShopBtn,#dhYardBtn');
      if (!t || !dh || dh.intro) return;
      if (t.id === 'dhDumpBtn') dhDump();
      else if (t.id === 'dhYardBtn') dhToggleYard(true);
      else if (t.id === 'dhShopBtn') dhToggleShop();
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
      const up = ev.target.closest('[data-dhup]');
      if (buy) dhShopBuyFurn(buy.dataset.dhbuy);
      if (up) dhBuyUpgrade(up.dataset.dhup);
    });
    const cut = $('#dhCut'); if (cut) cut.addEventListener('click', ev => { if (dh && dh.intro) dhSkipIntro(); });
    const skip = $('#dhSkip'); if (skip) skip.onclick = ev => { ev.stopPropagation(); if (dh && dh.intro) dhSkipIntro(); };
    const replay = $('#dhReplay'); if (replay) replay.onclick = () => dh && dhReplayIntro();
  }
  function dhPad(jp){
    if (!dh) return false;
    if (dh.intro){
      if (jp.a || jp[0] || jp.x || jp[2] || jp.b || jp[1] || jp.start){ if (typeof pad !== 'undefined' && pad) pad.jump = false; dhSkipIntro(); return true; }
      return true;
    }
    if (dh.yardOpen && (jp.b || jp[1])){ dhToggleYard(false); return true; }
    if (dh.shopOpen && (jp.b || jp[1])){ dhToggleShop(false); return true; }
    if (jp.x || jp[2]){ dhAct(); return true; }
    if (jp.b || jp[1]){ dhRotate(); return true; }
    if (jp.y || jp[3]){ if (dh.carry) dhDump(); else dhSetTool(dh.tool === 'delete' ? 'place' : 'delete'); return true; }
    if (jp.lb || jp[4] || jp.lt){ dhCycle(-1); return true; }
    if (jp.rb || jp[5] || jp.rt){ dhCycle(1); return true; }
    return false;
  }
  function dhKey(e){
    if (!dh || e.repeat) return false;
    const k = e.code || '';
    if (dh.intro){
      if (k === 'Space' || k === 'Enter' || k === 'KeyE' || k === 'KeyX'){ dhSkipIntro(); return true; }
      return true;
    }
    if (dh.yardOpen && (k === 'Escape' || k === 'KeyQ' || k === 'KeyB')){ dhToggleYard(false); return true; }
    if (dh.shopOpen && (k === 'Escape' || k === 'KeyB' || k === 'KeyQ')){ dhToggleShop(false); return true; }
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
