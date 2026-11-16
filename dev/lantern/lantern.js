  /* ===================== t286u/t289u: 🏮 LANTERN BIG TOP ===================== */
  const LH_RULES = (typeof LHRules !== 'undefined' && LHRules) ? LHRules : (typeof window !== 'undefined' && window.LHRules) || {};
  const LH_KEY = LH_RULES.LH_KEY || 'rubloxLantern';
  const LH_HOST = LH_RULES.LH_HOST || 'Gleam';
  const LH_HOST_TITLE = LH_RULES.LH_HOST_TITLE || 'Maestro Gleam';
  let lh = null;

  function lhEl(id){ return (typeof $ === 'function' ? $(id[0] === '#' ? id : '#' + id) : (typeof document !== 'undefined' && document.getElementById(id.replace(/^#/, '')))); }
  function lhTestId(){
    try {
      const h = String((typeof location !== 'undefined' && location.hash) || (typeof window !== 'undefined' && window.location && window.location.hash) || '');
      return (LH_RULES.lhTestHash ? LH_RULES.lhTestHash(h) : '');
    } catch (e){ return ''; }
  }
  function lhAward(note){
    try { if (typeof achNote === 'function' && note) achNote(note); } catch (e){}
  }
  function lhProg(){
    let raw = null;
    try { raw = (typeof load === 'function') ? load(LH_KEY, null) : (typeof localStorage !== 'undefined' ? localStorage.getItem(LH_KEY) : null); } catch (e){}
    return LH_RULES.lhLoadState ? LH_RULES.lhLoadState(raw) : {ver:1, visits:0, settings:{glitchedVision:true, muffledSound:true, cancellation:'fifty', skipKeyholder:false}, doodles:{}, coins:0, wallWords:[]};
  }
  function lhSaveProg(p){
    p = p || (lh && lh.prog) || lhProg();
    try {
      const body = {ver: LH_RULES.LH_VER || 1, visits: p.visits|0, settings: (LH_RULES.lhNormalizeSettings ? LH_RULES.lhNormalizeSettings(p.settings) : p.settings), doodles: p.doodles || {}, coins: +p.coins || 0, wallWords: (lh && lh.words) ? lh.words : (p.wallWords || []), rides: (p.rides && typeof p.rides === 'object') ? p.rides : {}, tickets: Math.max(0, (p.tickets|0)), prizes: (p.prizes && typeof p.prizes === 'object') ? p.prizes : {}, wear: (p.wear && typeof p.wear === 'object') ? p.wear : {}, decor: Array.isArray(p.decor) ? p.decor : [], wagonStyle: (p.wagonStyle && typeof p.wagonStyle === 'object') ? p.wagonStyle : {}};
      if (typeof save === 'function') save(LH_KEY, body);
      else if (typeof localStorage !== 'undefined') localStorage.setItem(LH_KEY, JSON.stringify(body));
    } catch (e){}
  }
  function lhSet(){ return (lh && lh.prog && lh.prog.settings) || (LH_RULES.lhDefaultSettings ? LH_RULES.lhDefaultSettings() : {glitchedVision:true, muffledSound:true, cancellation:'fifty', skipKeyholder:false}); }
  function lhLow(){ try { return (typeof gfxIsLow === 'function' && gfxIsLow()) || (typeof LOWQ !== 'undefined' && LOWQ); } catch (e){ return false; } }

  function lhY(k){
    const Y = (LH_RULES && LH_RULES.LH_Y) || {grass:0, path:0.03, floor:0.07, runner:0.10, ring:0.13, pad:0.16, wagon:0.22};
    return Y[k] != null ? Y[k] : 0;
  }
  function lhDecal(p){
    const mesh = p && p.mesh ? p.mesh : p;
    if (!mesh) return p;
    const mats = mesh.material ? (Array.isArray(mesh.material) ? mesh.material : [mesh.material]) : [];
    mats.forEach(m => {
      if (!m) return;
      m.polygonOffset = true;
      m.polygonOffsetFactor = -1;
      m.polygonOffsetUnits = -2;
      m.needsUpdate = true;
    });
    return p;
  }
  function lhFloorBox(x, z, w, d, col, kind, h){
    const top = lhY(kind || 'floor');
    const hh = h == null ? (kind === 'grass' ? 0.04 : kind === 'path' ? 0.04 : kind === 'runner' ? 0.03 : kind === 'pad' ? 0.06 : 0.08) : h;
    const p = lhBox(x, top, z, w, d, col, hh);
    if (p) p.floorOnly = true;
    if (kind === 'runner' || kind === 'path' || kind === 'pad') lhDecal(p);
    return p;
  }
  function lhInst(geo, material, items, asProp){
    if (!geo || !items || !items.length) return null;
    try {
      const mesh = new THREE.InstancedMesh(geo, material, items.length);
      const m4 = new THREE.Matrix4();
      const q = new THREE.Quaternion();
      const s = new THREE.Vector3();
      const p = new THREE.Vector3();
      items.forEach((it, i) => {
        p.set(it[0], it[1], it[2]);
        s.set(it[3] || 1, it[4] != null ? it[4] : (it[3] || 1), it[5] != null ? it[5] : (it[3] || 1));
        q.set(0, 0, 0, 1);
        if (it[6]) q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), it[6]);
        m4.compose(p, q, s);
        mesh.setMatrixAt(i, m4);
      });
      mesh.instanceMatrix.needsUpdate = true;
      scene.add(mesh);
      if (lh){ lh.trash.push(mesh); if (asProp){ lh.props = lh.props || []; lh.props.push(mesh); } }
      return mesh;
    } catch (e){ return null; }
  }
  function lhApplyView(){
    try {
      if (typeof camera !== 'undefined' && camera){
        camera.near = (LH_RULES.LH_CAM_NEAR != null) ? LH_RULES.LH_CAM_NEAR : 0.2;
        camera.far = (LH_RULES.LH_CAM_FAR != null) ? LH_RULES.LH_CAM_FAR : 280;
        if (camera.updateProjectionMatrix) camera.updateProjectionMatrix();
      }
      if (typeof scene !== 'undefined' && scene){
        scene.background = new THREE.Color('#1b1633');
        if (scene.fog){
          scene.fog.color = new THREE.Color('#2a2048');
          scene.fog.near = lhLow() ? 42 : 70;
          scene.fog.far = lhLow() ? 140 : 220;
        }
        // logarithmicDepthBuffer is not needed: staggered floor Y + a 0.2/280 clip range stops z-fighting
      }
    } catch (e){}
  }
  function lhCullTick(){
    if (!lh || !lh.props || !P) return;
    const r = lhLow() ? 70 : 130;
    const r2 = r * r;
    lh.props.forEach(o => {
      if (!o || !o.position) return;
      const dx = o.position.x - P.x, dz = o.position.z - P.z;
      o.visible = (dx * dx + dz * dz) < r2;
    });
  }
  function lhPerf(visibleOnly){
    const out = {meshes:0, inst:0, instCount:0, tris:0, draws:0, visible:!!visibleOnly, low: !!lhLow()};
    try {
      if (typeof scene === 'undefined' || !scene) return out;
      scene.traverse(o => {
        if (!o) return;
        if (visibleOnly && o.visible === false) return;
        const g = o.geometry;
        const idx = g && g.index;
        const pos = g && g.getAttribute && g.getAttribute('position');
        const t = idx ? idx.count / 3 : (pos ? pos.count / 3 : 0);
        if (o.isInstancedMesh){ out.inst++; out.instCount += o.count || 0; out.tris += t * (o.count || 0); }
        else if (o.isMesh){ out.meshes++; out.tris += t; }
      });
      out.draws = out.meshes + out.inst;
      out.tris = Math.round(out.tris);
      try { if (typeof camera !== 'undefined' && camera){ out.near = camera.near; out.far = camera.far; } } catch (e){}
      try { if (typeof scene !== 'undefined' && scene && scene.fog){ out.fogNear = scene.fog.near; out.fogFar = scene.fog.far; } } catch (e){}
    } catch (e){ out.err = String(e); }
    return out;
  }


  function lhBox(x, top, z, w, d, col, h, opts){
    const p = plat(x, top, z, w, d, col, h == null ? 1 : h, opts);
    if (lh && lh.trash && p && p.mesh) lh.trash.push(p.mesh);
    return p;
  }
  function lhMesh(geo, mat, x, y, z, parent){
    const m = new THREE.Mesh(geo, mat);
    m.position.set(x, y, z);
    (parent || scene).add(m);
    if (lh) lh.trash.push(m);
    return m;
  }
  function lhMat(c, opts){
    opts = opts || {};
    if (typeof mat === 'function' && !opts.basic && !opts.emit) return mat(c);
    const M = opts.basic ? THREE.MeshBasicMaterial : THREE.MeshLambertMaterial;
    const o = {color: c};
    if (opts.emit) o.emissive = new THREE.Color(opts.emit);
    if (opts.trans){ o.transparent = true; o.opacity = opts.trans; o.depthWrite = opts.depthWrite !== false; }
    return new M(o);
  }
  function lhLabel(text, col, x, y, z){
    try {
      if (typeof label === 'function'){
        const L = label(text, col || 'rgba(30,20,50,.9)');
        L.position.set(x, y, z);
        scene.add(L);
        if (lh) lh.trash.push(L);
        return L;
      }
    } catch (e){}
    return null;
  }

  function lhEyeTex(col){
    const c = document.createElement('canvas'); c.width = 64; c.height = 64;
    const g = c.getContext('2d');
    g.clearRect(0, 0, 64, 64);
    g.fillStyle = '#fff6d8';
    g.beginPath(); g.ellipse(32, 32, 26, 18, 0, 0, Math.PI * 2); g.fill();
    g.strokeStyle = '#1d2340'; g.lineWidth = 3; g.stroke();
    g.fillStyle = col || '#5b2dff';
    g.beginPath(); g.arc(32, 32, 10, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#0a0a12';
    g.beginPath(); g.arc(32, 32, 5, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#fff';
    g.beginPath(); g.arc(28, 28, 2.4, 0, Math.PI * 2); g.fill();
    const t = new THREE.CanvasTexture(c);
    t.needsUpdate = true;
    return t;
  }

  function lhMkGlitch(parent, opts){
    opts = opts || {};
    const g = new THREE.Group();
    const body = new THREE.Mesh(new THREE.BoxGeometry(1.2, 2.55, 0.9), lhMat('#050308', {basic:true}));
    body.position.y = 1.25;
    g.add(body);
    const jag = new THREE.Mesh(new THREE.BoxGeometry(1.45, 0.4, 1.05), lhMat('#0a0610', {basic:true, emit:'#1a0820'}));
    jag.position.y = 1.85; jag.rotation.z = 0.25;
    g.add(jag);
    const jag2 = new THREE.Mesh(new THREE.BoxGeometry(0.7, 1.8, 0.2), lhMat('#000000', {basic:true, emit:'#140818'}));
    jag2.position.set(0.55, 1.2, 0); jag2.rotation.z = -0.3;
    g.add(jag2);
    const cols = ['#7cff4f', '#00e5ff', '#ff2bd6', '#ffe600', '#ff7ad9', '#7f7cff', '#ff3030', '#ffffff'];
    const eyes = [];
    const n = lhLow() ? 8 : 16;
    for (let i = 0; i < n; i++){
      const tex = lhEyeTex(cols[i % cols.length]);
      const sz = 0.26 + (i % 3) * 0.08;
      const pl = new THREE.Mesh(new THREE.PlaneGeometry(sz, sz * 0.72), new THREE.MeshBasicMaterial({map: tex, transparent: true, depthWrite: false, side: THREE.DoubleSide}));
      const side = (i % 3) - 1;
      pl.position.set((Math.random() - 0.5) * 1.25, 0.45 + Math.random() * 2.15, (side === 0 ? 0.48 : 0.15) + (Math.random() - 0.5) * 0.55);
      if (side !== 0) pl.rotation.y = side * 0.8;
      g.add(pl);
      eyes.push({m: pl, t: Math.random() * 2, per: 0.5 + Math.random() * 1.3, col: cols[i % cols.length]});
    }
    g.visible = false;
    parent.add(g);
    if (lh) lh.trash.push(g);
    return {g, body, jag, jag2, eyes};
  }

  function lhFxContains(fx, o){
    if (!fx || !fx.g || !o) return false;
    let n = o;
    while (n){
      if (n === fx.g) return true;
      n = n.parent;
    }
    return false;
  }
  function lhApplyLook(slot, on){
    if (!slot) return;
    on = !!on;
    const root = slot.g || (slot.model && slot.model.g);
    if (!root) return;
    if (!slot._lhFX) slot._lhFX = lhMkGlitch(root);
    slot._lhFX.g.visible = on;
    if (slot._lhOn === on) return;
    slot._lhOn = on;
    // Keep the normal body (legs/arms) visible so the shared walk cycle still
    // plays on the fizzled silhouette; just paint it black and show extra eyes.
    root.traverse(o => {
      if (!o || !o.isMesh || lhFxContains(slot._lhFX, o)) return;
      if (on){
        if (!o.userData._lhMat) o.userData._lhMat = o.material;
        const srcs = Array.isArray(o.material) ? o.material : [o.material];
        const clones = srcs.map(m => {
          if (!m || !m.clone) return m;
          const c = m.clone();
          if (c.color) c.color.set('#050308');
          if (c.emissive) c.emissive.set('#120814');
          if (c.map) c.map = null;
          c.needsUpdate = true;
          return c;
        });
        o.material = Array.isArray(o.material) ? clones : clones[0];
      } else if (o.userData._lhMat){
        o.material = o.userData._lhMat;
      }
    });
  }

  function lhBlink(fx, dt){
    if (!fx || !fx.eyes) return;
    fx.eyes.forEach(e => {
      e.t += dt;
      const k = (Math.sin(e.t / e.per * Math.PI * 2) * 0.5 + 0.5);
      if (e.m && e.m.scale) e.m.scale.y = k < 0.12 ? 0.08 : 1;
    });
    const tt = (lh && lh.t || 0);
    if (fx.jag) fx.jag.rotation.z = 0.15 + Math.sin(tt * 11) * 0.28;
    if (fx.jag2) fx.jag2.rotation.z = -0.3 + Math.sin(tt * 13) * 0.2;
    if (fx.body){
      fx.body.position.x = Math.sin(tt * 17) * 0.07;
      fx.body.position.y = 1.25 + Math.sin(tt * 23) * 0.04;
      fx.body.scale.x = 1 + Math.sin(tt * 19) * 0.08;
      if (fx.body.material && fx.body.material.color){
        const flash = Math.sin(tt * 29) > 0.82;
        fx.body.material.color.set(flash ? '#1a0a22' : '#050308');
      }
    }
  }

  function lhRoomsSpec(){
    // numbered circus-wagon rooms along the long midway (enough for ~20 players)
    const specs = [];
    const zs = (LH_RULES.LH_WAGON_ZS && LH_RULES.LH_WAGON_ZS.length) ? LH_RULES.LH_WAGON_ZS : [22,30,38,46,54,62,70,78,86,94];
    const wx = LH_RULES.LH_WAGON_X || 16;
    zs.forEach((z, i) => {
      specs.push({id: i, x: -wx, z, side: -1, owner: null});
      specs.push({id: i + zs.length, x: wx, z, side: 1, owner: null});
    });
    return specs;
  }


  function lhStripeTex(a, b, nx, ny){
    const key = String(a) + String(b) + (nx || 4) + 'x' + (ny || 1);
    lh._tex = lh._tex || {};
    if (lh._tex[key]) return lh._tex[key];
    const c = document.createElement('canvas'); c.width = 64; c.height = 64;
    const g = c.getContext('2d');
    for (let i = 0; i < 8; i++){
      g.fillStyle = i % 2 === 0 ? a : b;
      g.fillRect((64 / 8) * i, 0, 8.2, 64);
    }
    const tex = new THREE.CanvasTexture(c);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(nx || 4, ny || 1);
    tex.magFilter = THREE.NearestFilter;
    tex.needsUpdate = true;
    lh._tex[key] = tex;
    return tex;
  }
  function lhPaintStripe(mesh, a, b, nx, ny){
    if (!mesh || !mesh.material) return;
    try {
      const src = Array.isArray(mesh.material) ? mesh.material[0] : mesh.material;
      const m = src.clone();
      m.map = lhStripeTex(a || '#e31c23', b || '#fff8f0', nx, ny);
      m.color = new THREE.Color('#ffffff');
      m.needsUpdate = true;
      mesh.material = m;
    } catch (e){}
  }
  function lhBulb(x, y, z, col){
    const geo = lh._bulbGeo || (lh._bulbGeo = new THREE.SphereGeometry(lhLow() ? 0.08 : 0.11, 6, 6));
    const m = lhMesh(geo, lhMat(col, {basic:true, emit: col}), x, y, z);
    if (!lh.bulbs) lh.bulbs = [];
    lh.bulbs.push(m);
    return m;
  }
  function lhStringLights(pts){
    const cols = ['#ffd25a', '#ff6b6b', '#7cffd0', '#8ecaff', '#ff8ad8'];
    const r = (LH_RULES.LH_LAMP_R || 5);
    (pts || []).forEach((p, i) => {
      lhBulb(p[0], p[1], p[2], cols[i % cols.length]);
      if (lh){
        lh.lamps = lh.lamps || [];
        lh.lamps.push({x: p[0], z: p[2], r: r});
      }
    });
  }
  function lhBalloons(x, y, z, n){
    const cols = ['#ff6b9a', '#6b3cff', '#7cffd0', '#ffd25a', '#ff6b6b'];
    const count = lhLow() ? Math.min(3, n || 3) : (n || 4);
    for (let i = 0; i < count; i++){
      const m = lhMesh(new THREE.SphereGeometry(0.28, 8, 8), lhMat(cols[i % cols.length], {emit: cols[i % cols.length]}), x + (i - 1) * 0.28, y + 0.15 * (i % 2), z + (i % 2) * 0.12);
      if (m) m.scale.y = 1.2;
    }
    lhMesh(new THREE.BoxGeometry(0.04, 1.1, 0.04), lhMat('#1d2340'), x, y - 0.7, z);
  }
  function lhStand(x, z, color, title){
    lhBox(x, 0.7, z, 1.8, 1.2, color, 0.7);
    lhBox(x, 1.15, z, 2.0, 1.4, '#fff8f0', 0.12);
    lhBox(x, 1.7, z, 2.05, 0.16, '#e31c23', 0.16);
    if (title) lhLabel(title, 'rgba(80,20,40,.92)', x, 2.15, z);
  }
  function lhPrizeBooth(x, z){
    lhBox(x, 1.1, z, 3.2, 1.6, '#fff3d0', 1.1);
    lhBox(x, 1.7, z, 3.4, 1.8, '#fff8f0', 0.14);
    lhBox(x, 2.35, z, 3.5, 0.2, '#e31c23', 0.18);
    const cols = ['#ff6b9a', '#3a86ff', '#ffd25a', '#2ec27e', '#ff8ad8', '#6b3cff'];
    for (let i = 0; i < 6; i++){
      const bx = x - 1.2 + (i % 3) * 1.2;
      const by = 0.85 + Math.floor(i / 3) * 0.55;
      const bz = z - 0.15;
      lhBox(bx, by, bz, 0.4, 0.35, cols[i], 0.35);
    }
    try { lhFloorBox(x + 0.2, z + 1.5, 1.8, 1.8, '#f0c860', 'pad'); } catch (e){}
    try { lhLabel('Prize Booth  ·  trade tickets', 'rgba(80,20,40,.92)', x, 2.9, z); } catch (e){}
    if (lh) lh.booth = {x: x, z: z, r: 2.8};
  }
  function lhPins(x, z){
    const cols = ['#e31c23', '#3a86ff', '#ffd25a'];
    for (let i = 0; i < 3; i++){
      const p = lhMesh(new THREE.CylinderGeometry(0.08, 0.12, 0.7, 6), lhMat(cols[i]), x + i * 0.28, 0.4, z);
      if (p) p.rotation.z = 0.4 + i * 0.2;
      lhMesh(new THREE.SphereGeometry(0.14, 8, 8), lhMat(cols[i], {emit: cols[i]}), x - 0.4 + i * 0.22, 0.18, z + 0.35);
    }
  }
  function lhFerris(x, y, z){
    const axleY = (y == null ? 5.2 : y);
    const root = new THREE.Group();
    root.position.set(x, 0, z);
    root.rotation.y = 0.35;
    const pole = new THREE.Mesh(new THREE.BoxGeometry(0.3, axleY + 0.2, 0.3), lhMat('#4a2a10'));
    pole.position.y = (axleY + 0.2) / 2; root.add(pole);
    const legA = new THREE.Mesh(new THREE.BoxGeometry(0.22, axleY + 0.4, 0.22), lhMat('#3a2410'));
    legA.position.set(-1.7, (axleY + 0.2) / 2, 0.12); legA.rotation.z = 0.32; root.add(legA);
    const legB = legA.clone(); legB.position.x = 1.7; legB.rotation.z = -0.32; root.add(legB);
    const wheel = new THREE.Group(); wheel.position.y = axleY; root.add(wheel);
    const segs = lhLow() ? 6 : 8;
    const rim = new THREE.Mesh(new THREE.TorusGeometry(3.4, 0.1, 6, lhLow() ? 8 : 12), lhMat('#6b3cff', {emit:'#7a5cff'}));
    wheel.add(rim);
    const axle = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.8, 6), lhMat('#1d2340'));
    axle.rotation.x = Math.PI / 2; wheel.add(axle);
    const cols = ['#e31c23', '#ffd25a', '#3a86ff', '#2ec27e', '#ff8ad8', '#8ecaff'];
    const seats = [];
    for (let i = 0; i < segs; i++){
      const a = (i / segs) * Math.PI * 2;
      const spoke = new THREE.Mesh(new THREE.BoxGeometry(0.07, 3.4, 0.07), lhMat('#fff8f0'));
      spoke.rotation.z = a; wheel.add(spoke);
      const car = new THREE.Group();
      car.position.set(Math.sin(a) * 3.4, Math.cos(a) * 3.4, 0);
      const box = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.42, 0.55), lhMat(cols[i % cols.length], {emit: cols[i % cols.length]}));
      box.position.y = -0.16; car.add(box);
      const bar = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.06, 0.06), lhMat('#ffd25a'));
      bar.position.set(0, 0.14, 0.2); car.add(bar);
      wheel.add(car);
      seats.push({mesh: car, index: i, sitY: 0.22});
    }
    scene.add(root);
    if (lh){
      lh.trash.push(root); lh.rides = lh.rides || [];
      lh.rides.push({kind:'ferris', name:'Ferris Wheel', g: root, wheel: wheel, seats: seats, taken: [], x: x, z: z, boardR: 5.8, axleY: axleY});
    }
    try { lhFloorBox(x + 4.6, z, 1.8, 1.8, '#f0c860', 'pad'); } catch (e){}
    try { lhLabel('Ferris Wheel  ·  E to ride', 'rgba(80,20,40,.92)', x, 9.4, z); } catch (e){}
    return root;
  }
  function lhCarousel(x, z){
    const root = new THREE.Group();
    const base = new THREE.Mesh(new THREE.CylinderGeometry(2.2, 2.4, 0.3, lhLow() ? 8 : 12), lhMat('#ffd25a'));
    base.position.y = 0.15; root.add(base);
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 2.6, 6), lhMat('#e31c23'));
    pole.position.y = 1.4; root.add(pole);
    const roof = new THREE.Mesh(new THREE.ConeGeometry(2.3, 0.9, lhLow() ? 8 : 12), lhMat('#e31c23'));
    roof.position.y = 2.7; root.add(roof);
    try { lhPaintStripe(roof, '#e31c23', '#fff8f0', 8, 1); } catch (e){}
    const platform = new THREE.Group(); root.add(platform);
    const cols = ['#ff6b9a', '#3a86ff', '#2ec27e', '#ff9f1c'];
    const n = lhLow() ? 3 : 4;
    const seats = [];
    for (let i = 0; i < n; i++){
      const a = (i / n) * Math.PI * 2;
      const horse = new THREE.Group();
      horse.position.set(Math.sin(a) * 1.4, 0.85, Math.cos(a) * 1.4);
      horse.rotation.y = a + Math.PI / 2;
      const body = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.38, 0.18), lhMat(cols[i % cols.length]));
      body.position.y = 0.05; horse.add(body);
      const head = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.18, 0.14), lhMat(cols[i % cols.length]));
      head.position.set(0.22, 0.22, 0); horse.add(head);
      const saddle = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.08, 0.2), lhMat('#8a4a20'));
      saddle.position.set(-0.02, 0.26, 0); horse.add(saddle);
      platform.add(horse);
      seats.push({mesh: horse, index: i, sitY: 0.42, baseY: 0.85});
    }
    root.position.set(x, 0, z);
    scene.add(root);
    if (lh){
      lh.trash.push(root); lh.rides = lh.rides || [];
      lh.rides.push({kind:'carousel', name:'Carousel', g: root, wheel: platform, seats: seats, taken: [], x: x, z: z, boardR: 3.6});
    }
    try { lhFloorBox(x + 3.0, z + 1.0, 1.5, 1.5, '#f0c860', 'pad'); } catch (e){}
    try { lhLabel('Carousel  ·  E to ride', 'rgba(80,40,10,.92)', x, 4.4, z); } catch (e){}
    return root;
  }
  function lhTrailerBits(R, wall){
    if (!R) return;
    const wheelZ = [R.z - 1.8, R.z + 1.8];
    wheelZ.forEach(wz => {
      const w = lhMesh(new THREE.CylinderGeometry(0.38, 0.38, 0.22, 10), lhMat('#1d2340'), R.x + R.side * (R.w / 2 - 0.2), 0.38, wz);
      if (w) w.rotation.z = Math.PI / 2;
    });
    // peaked canvas roof, sitting on the taller wall plate
    const wallH = (R && R.h) || (LH_RULES.LH_WAGON_H) || 5.6;
    const roof = lhMesh(new THREE.ConeGeometry(R.w * 0.58, 1.3, 8), lhMat(wall || '#ffb3de'), R.x, wallH + 0.65, R.z);
    if (roof){ lhPaintStripe(roof, wall || '#e31c23', '#fff8f0', 6, 1); if (roof.material){ roof.material.side = THREE.DoubleSide; roof.material.needsUpdate = true; } }
    // awning over the (human-height) door, not the wall top
    const ix = R.x - R.side * (R.w / 2);
    const awningY = Math.max(2.7, ((LH_RULES.LH_DOOR_OPEN_H || 3.2) - 0.35));
    const aw = lhMesh(new THREE.BoxGeometry(1.6, 0.08, 1.8), lhMat('#fff8f0'), ix - R.side * 0.7, awningY, R.z);
    if (aw){ aw.rotation.z = R.side * 0.25; lhPaintStripe(aw, '#e31c23', '#fff8f0', 5, 1); }
  }


  function lhCharPose(ch, dt, moving, speed){
    if (!ch) return;
    const M = ch.model || ch;
    if (!M || !M.legs || !M.arms || typeof applyPose !== 'function' || typeof animPose !== 'function') return;
    const sp = moving ? Math.max(1.2, +speed || 2.4) : 0;
    ch.walk = (ch.walk || 0) + dt * (moving ? sp * 1.35 : 0);
    const pack = ch.pack || 'default';
    const st = {
      state: moving ? 'walk' : 'idle',
      t: (lh && lh.t) || 0,
      ph: ch.walk || 0,
      sp: moving ? Math.min(1.3, sp / 5) : 0,
      air: 0,
      jumped: false
    };
    try { applyPose(dt, animPose(pack, st), M); } catch (e){}
  }

  function lhLamp(x, z){
    const post = lhMesh(new THREE.CylinderGeometry(0.09, 0.12, 2.6, 6), lhMat('#2a1a10'), x, 1.3, z);
    const arm = lhMesh(new THREE.BoxGeometry(0.7, 0.08, 0.08), lhMat('#3a2a18'), x + 0.28, 2.5, z);
    const bulb = lhBulb(x + 0.5, 2.25, z, '#ffd27a');
    const cap = lhMesh(new THREE.ConeGeometry(0.28, 0.22, 8), lhMat('#6b3cff', {emit:'#ffd27a'}), x + 0.5, 2.5, z);
    if (lh){
      lh.lamps = lh.lamps || [];
      lh.lamps.push({x: x + 0.5, z: z, r: (LH_RULES.LH_LAMP_R || 5)});
    }
    return bulb;
  }

  function lhFlaps(x, z, alongZ){
    // Decorative tent flaps (no collision) you can walk through.
    const colA = '#e31c23', colB = '#fff8f0';
    const w = 0.12, h = 3.6, d = 1.7;
    [-1, 1].forEach((s, i) => {
      const m = lhMesh(new THREE.BoxGeometry(alongZ ? w : d, h, alongZ ? d : w), lhMat(colB), x + (alongZ ? 0 : s * 0.55), 1.85, z + (alongZ ? s * 0.55 : 0));
      if (m){
        if (alongZ) m.rotation.y = s * 0.55;
        else m.rotation.y = s * 0.55;
        lhPaintStripe(m, colA, colB, 6, 1);
        if (m.material){ m.material.side = THREE.DoubleSide; m.material.needsUpdate = true; }
      }
    });
    lhLabel('Fairground', 'rgba(80,20,40,.92)', x + (alongZ ? -1.6 : 0), 3.3, z + (alongZ ? 0 : -1.6));
  }

  function lhLittleTent(x, z, wall){
    wall = wall || '#e31c23';
    lhFloorBox(x, z, 3.4, 3.4, '#f3d7a0', 'floor');
    const roof = lhMesh(new THREE.ConeGeometry(2.1, 1.8, lhLow() ? 6 : 8), lhMat(wall), x, 2.4, z);
    if (roof){ lhPaintStripe(roof, wall, '#fff8f0', 6, 1); if (roof.material){ roof.material.side = THREE.DoubleSide; roof.material.needsUpdate = true; } }
  }

  function lhSwing(x, z){
    const root = new THREE.Group();
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.22, 5.2, 8), lhMat('#4a2a10'));
    pole.position.y = 2.6; root.add(pole);
    const cap = new THREE.Mesh(new THREE.CylinderGeometry(2.6, 2.6, 0.16, lhLow() ? 8 : 12), lhMat('#e31c23'));
    cap.position.y = 5.1; root.add(cap);
    const arms = new THREE.Group(); arms.position.y = 4.8; root.add(arms);
    const n = lhLow() ? 4 : 6;
    const cols = ['#ff6b9a', '#3a86ff', '#ffd25a', '#2ec27e', '#ff8ad8', '#8ecaff'];
    const seats = [];
    for (let i = 0; i < n; i++){
      const a = (i / n) * Math.PI * 2;
      const arm = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.07, 0.07), lhMat('#fff8f0'));
      arm.position.set(Math.sin(a) * 1.2, 0, Math.cos(a) * 1.2);
      arm.rotation.y = -a + Math.PI / 2;
      arms.add(arm);
      const chain = new THREE.Mesh(new THREE.BoxGeometry(0.04, 1.5, 0.04), lhMat('#c8b8a0'));
      chain.position.set(Math.sin(a) * 2.3, -0.75, Math.cos(a) * 2.3);
      arms.add(chain);
      const seat = new THREE.Group();
      seat.position.set(Math.sin(a) * 2.3, -1.6, Math.cos(a) * 2.3);
      const board = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.1, 0.4), lhMat(cols[i % cols.length], {emit: cols[i % cols.length]}));
      seat.add(board);
      const bar = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.05, 0.05), lhMat('#ffd25a'));
      bar.position.set(0, 0.22, 0.16); seat.add(bar);
      arms.add(seat);
      seats.push({mesh: seat, index: i, sitY: 0.38});
    }
    root.position.set(x, 0, z);
    scene.add(root);
    if (lh){
      lh.trash.push(root); lh.rides = lh.rides || []; lh.props = lh.props || []; lh.props.push(root);
      lh.rides.push({kind:'swing', name:'Swing Ride', g: root, wheel: arms, seats: seats, taken: [], x: x, z: z, boardR: 4.2});
    }
    try { lhFloorBox(x + 3.6, z + 1.0, 1.5, 1.5, '#f0c860', 'pad'); } catch (e){}
    try { lhLabel('Swing Ride  ·  E to ride', 'rgba(80,20,40,.92)', x, 6.2, z); } catch (e){}
    return root;
  }
  function lhBuildFunhouse(cx, cz){
    const w = 16, d = 14;
    lhFloorBox(cx, cz, w, d, '#e8d4ff', 'floor');
    // walls with a door gap on the +X (path) side
    lhBox(cx, 1.8, cz - d / 2, w, 0.28, '#c5b0ff', 3.6);
    lhBox(cx, 1.8, cz + d / 2, w, 0.28, '#c5b0ff', 3.6);
    lhBox(cx - w / 2, 1.8, cz, 0.28, d, '#b89cff', 3.6);
    lhBox(cx + w / 2, 1.8, cz - 4.4, 0.28, 5.2, '#b89cff', 3.6);
    lhBox(cx + w / 2, 1.8, cz + 4.4, 0.28, 5.2, '#b89cff', 3.6);
    // interior maze / mirrors
    lhBox(cx - 2, 1.6, cz - 2, 6, 0.2, '#f3e8ff', 3.2);
    lhBox(cx + 2, 1.6, cz + 2.5, 6, 0.2, '#f3e8ff', 3.2);
    const mirrors = [[cx - 4, cz - 1.9], [cx + 3, cz + 2.6], [cx - 1, cz + 5.5]];
    mirrors.forEach(p => {
      const m = lhMesh(new THREE.BoxGeometry(2.2, 2.2, 0.08), lhMat('#e8fbff', {emit:'#cfefff', trans:0.85}), p[0], 1.6, p[1]);
      if (m && m.material){ m.material.side = THREE.DoubleSide; }
    });
    const roof = lhMesh(new THREE.ConeGeometry(10.5, 3.2, lhLow() ? 6 : 8), lhMat('#9b7cff'), cx, 4.6, cz);
    if (roof){ lhPaintStripe(roof, '#6b3cff', '#fff8f0', 8, 1); if (roof.material){ roof.material.side = THREE.DoubleSide; roof.material.needsUpdate = true; } }
    lhLabel('Funhouse', 'rgba(80,20,90,.92)', cx + w / 2 + 0.4, 3.1, cz);
    lhFlaps(cx + w / 2, cz, true);
    if (lh) lh.funhouse = {x: cx, z: cz, w: w, d: d};
  }
  function lhBuildPond(cx, cz){
    lhFloorBox(cx, cz, 16, 14, '#6a8a4a', 'path');
    try {
      const water = lhMesh(new THREE.CylinderGeometry(5.4, 5.4, 0.08, lhLow() ? 12 : 20), lhMat('#3aa0d8', {trans:0.72, emit:'#7fe7ff'}), cx, lhY('path') + 0.02, cz);
      lhDecal(water);
    } catch (e){}
    // walkable dock
    const dock = lhFloorBox(cx + 4.2, cz, 6.4, 1.6, '#8a6a3a', 'pad');
    [[-3.6, 0], [0, -3.6], [3.2, 2.4]].forEach(p => { try { lhLamp(cx + p[0], cz + p[1]); } catch (e){} });
    // small aquarium tent beside the pond
    const ax = cx, az = cz + 10;
    lhFloorBox(ax, az, 10, 8, '#b9f3ff', 'floor');
    lhBox(ax, 1.8, az - 4, 10, 0.28, '#245a70', 3.6);
    lhBox(ax - 5, 1.8, az, 0.28, 8, '#245a70', 3.6);
    lhBox(ax + 5, 1.8, az, 0.28, 8, '#245a70', 3.6);
    lhBox(ax, 1.8, az + 4, 3.6, 0.28, '#245a70', 3.6);
    const tank = lhMesh(new THREE.BoxGeometry(6.4, 3.2, 1.6), lhMat('#7fe7ff', {trans:0.35, emit:'#3ad0ff'}), ax, 1.8, az - 2.6);
    lhBox(ax, 0.2, az - 2.6, 6.6, 1.8, '#245a70', 0.4);
    lhLabel('Aquarium Tent', 'rgba(10,60,80,.9)', ax, 3.4, az + 1.5);
    lhLabel('Lantern Pond', 'rgba(10,40,70,.9)', cx, 2.6, cz - 6.2);
    if (!lhLow()){
      const fcols = ['#ff7ad9', '#7cff4f', '#ffd25a', '#00e5ff'];
      for (let i = 0; i < 5; i++){
        const f = lhMesh(new THREE.BoxGeometry(0.35, 0.18, 0.12), lhMat(fcols[i % 4], {basic:true}), ax - 2 + Math.random() * 4, 1.2 + Math.random() * 1.6, az - 2.6);
        lh.fish.push({m: f, t: Math.random() * 10, a: ax - 2 + Math.random() * 4, b: 1.1 + Math.random() * 1.6});
      }
    }
    if (lh){ lh.pond = {x: cx, z: cz}; lh.aquarium = {x: ax, z: az}; }
  }
  function lhBuildWoods(){
    const trunkGeo = lh._trunkGeo || (lh._trunkGeo = new THREE.CylinderGeometry(0.18, 0.28, 2.4, 6));
    const leafGeo = lh._leafGeo || (lh._leafGeo = new THREE.ConeGeometry(1.15, 2.2, 7));
    const trunkMat = lhMat('#3a2a18');
    const leafMat = lhMat('#1c3a1e');
    const trunks = [], leaves = [];
    const n = lhLow() ? 22 : 48;
    for (let i = 0; i < n; i++){
      const x = -94 - (i % 7) * 2.8 - (i * 0.37) % 3;
      const z = -70 + Math.floor(i / 7) * 12 + ((i * 5) % 7) - 3;
      // keep a soft path edge so the zone is enterable
      if (x > -90) continue;
      trunks.push([x, 1.2, z, 1, 1, 1]);
      leaves.push([x, 2.7, z, 1, 1, 1]);
    }
    lhInst(trunkGeo, trunkMat, trunks, true);
    lhInst(leafGeo, leafMat, leaves, true);
    lhLabel('Backlot', 'rgba(20,30,20,.9)', -98, 3.2, -8);
    if (lh) lh.woods = {x: -100, z: -10};
  }

  function lhBuildFairground(){
    lhApplyView();
    // one grass slab at Y=0; all other grounds sit on later Y layers so they cannot z-fight
    lhFloorBox(-20, 0, LH_RULES.LH_GRASS_W || 220, LH_RULES.LH_GRASS_D || 220, '#2d5a32', 'grass');
    // dirt paths: flaps hub, food, games, rides, pond, funhouse
    const paths = [
      [-36, -4, 20, 2.6],
      [-50, -4, 16, 2.4],
      [-50, 8, 2.4, 26],
      [-62, 8, 28, 2.4],
      [-62, 28, 2.4, 28],
      [-62, 40, 28, 2.4],
      [-58, -18, 2.4, 30],
      [-72, -32, 22, 2.4],
      [-42, -18, 16, 2.2],
      [-50, 16, 14, 2.2]
    ];
    paths.forEach(a => lhFloorBox(a[0], a[1], a[2], a[3], '#7a5a32', 'path'));
    // fence — stays short of the cellar island at z=200
    lhBox(-20, 1.15, -100, 190, 0.4, '#4a2a10', 2.2);
    lhBox(-20, 1.15, 118, 190, 0.4, '#4a2a10', 2.2);
    lhBox(-114, 1.15, 9, 0.4, 218, '#4a2a10', 2.2);
    lhBox(54, 1.15, 9, 0.4, 218, '#4a2a10', 2.2);
    // prize booth just outside the west flaps
    try { lhPrizeBooth(-32, -4); } catch (e){ lhStand(-32, -4, '#fff3d0', 'Prize Booth'); if (lh) lh.booth = {x:-32, z:-4, r:2.8}; }
    // Food Court
    lhStand(-54, 4, '#fff3d0', 'Popcorn');
    lhStand(-64, 4, '#ffd0e8', 'Cotton Candy');
    lhStand(-74, 8, '#ffe29a', 'Pretzels');
    if (!lhLow()){
      lhStand(-58, 12, '#fff3d0', 'Lemonade');
      lhBalloons(-52, 2.2, 6, 3);
      lhLittleTent(-78, 12, '#ff8ad8');
    }
    lhLabel('Food Court', 'rgba(80,20,40,.92)', -62, 3.2, 0);
    // Games Alley
    lhStand(-54, 36, '#ffd0e8', 'Ring Toss');
    lhStand(-66, 36, '#d0f0ff', 'Balloon Darts');
    lhStand(-54, 46, '#ffe29a', 'Whack-a-Glow');
    lhStand(-70, 46, '#ffd0e8', 'Duck Pond');
    if (!lhLow()){
      lhPins(-60, 42);
      lhBalloons(-48, 2.2, 40, 3);
    }
    if (lh){
      lh.games = [
        {id:'rings', name:'Ring Toss', emoji:'⭕', x:-54, z:36, r:2.4},
        {id:'darts', name:'Balloon Darts', emoji:'🎈', x:-66, z:36, r:2.4},
        {id:'whack', name:'Whack-a-Glow', emoji:'✨', x:-54, z:46, r:2.4},
        {id:'ducks', name:'Duck Pond', emoji:'🦆', x:-70, z:46, r:2.4}
      ];
    }
    lhLabel('Games Alley', 'rgba(20,40,70,.92)', -62, 3.2, 50);
    // Rides
    try { lhCarousel(-64, -28); } catch (e){}
    try { lhFerris(-80, 5.2, -36); } catch (e){}
    try { lhSwing(-68, -42); } catch (e){}
    lhLabel('Rides', 'rgba(80,40,10,.92)', -70, 3.4, -22);
    // Funhouse, pond / aquarium, woods
    try { lhBuildFunhouse(-50, 22); } catch (e){}
    try { lhBuildPond(-42, -18); } catch (e){}
    try { lhBuildWoods(); } catch (e){}
    // lamps along the main paths (lit pockets). woods stay dark on purpose.
    const lampPts = lhLow()
      ? [[-30, -4], [-40, -4], [-50, -4], [-50, 8], [-62, 8], [-62, 24], [-62, 40], [-58, -18], [-72, -32], [-42, -18], [-50, 16]]
      : [[-30, -4], [-36, -4], [-44, -4], [-50, -4], [-50, 6], [-58, 8], [-70, 8], [-62, 18], [-62, 28], [-54, 36], [-70, 36], [-62, 46], [-58, -12], [-58, -24], [-72, -28], [-72, -40], [-64, -32], [-42, -12], [-36, -18], [-50, 16], [-50, 22]];
    lampPts.forEach(p => { try { lhLamp(p[0], p[1]); } catch (e){} });
    lhLabel('Fairground', 'rgba(40,20,60,.9)', -32, 3.2, -4);
  }

  function lhNearALamp(x, z){
    if (!lh || !lh.lamps || !lh.lamps.length) return false;
    if (LH_RULES.lhNearLamp) return LH_RULES.lhNearLamp(x, z, lh.lamps, LH_RULES.LH_LAMP_R || 5);
    return lh.lamps.some(L => LH_RULES.lhNear && LH_RULES.lhNear(x, z, L.x, L.z, L.r || 5));
  }

  function lhGoWagon(){
    if (!lh) return false;
    const R = lh.rooms[lh.myRoom];
    if (!R) return false;
    try { lhSetDoor(R, false); } catch (e){}
    const y = (R.floorY != null ? R.floorY : 0.5) + 0.05;
    Object.assign(P, {x: R.x, y: y, z: R.z, vx: 0, vy: 0, vz: 0});
    lh.area = 'room'; lh.room = R.id;
    if (typeof toast === 'function') toast('🎪 Your wagon!');
    try { if (typeof cam !== 'undefined' && cam){ cam.yaw = (R.side < 0 ? 1.57 : -1.57); cam.pitch = 0.12; cam.dist = 6; } } catch (e){}
    lhHud();
    return true;
  }

  function buildLantern(){
    const prog = lhProg();
    const test = lhTestId();
    lh = {
      t: 0, ph: 'play', prog: prog, test: test,
      sanity: 100, glitched: false, transforming: false, xformT: 0, xformKind: 'plain',
      cut: null, calm: null, banish: null, song: null, crash: null, allMelt: null,
      isolated: false, dark: false, nearGlitched: false, staring: false, company: false, lit: true,
      area: 'lobby', room: -1, myRoom: 0, bed: false, doorBusy: false,
      lights: {}, doors: {},
      rooms: [], npcs: [], host: null, vesper: null, exitDoor: null,
      keyholder: null, keyCd: 0, pester: 0, taggedLock: 0,
      doodleOpen: false, setOpen: false, writeOpen: false, writeStyle: 'paint', writeSel: 0, lastHud: '', words: (prog.wallWords || []).slice(), wordMeshes: [], knockAt: {}, knockOffer: null, knockWait: null,
      trash: [], fish: [], boards: null, fxMe: null, bulbs: [], rides: [], lamps: [], props: [], wagonPad: null, wagonMark: null, mapOpen: false, _tex: {}, _lhCamFov: null, riding: null, arcade: null, boothOpen: false, games: [], booth: null, gameCd: {}, decorOpen: false, decorSel: 0, decorPick: null,
      syncT: 0, visitAwarded: false, _nearT: 0, _isoT: 0, _darkT: 0,
      breathReady: 0, serenadeAt: 0, vesperAt: 0, exitAt: 0, keyAt: 0, songStayT: 0, lastSongAt: null, songStayNeed: null, songCd: null,
      lastDing: 0, savedFp: null
    };
    try { lhBuildFairground(); } catch (e){}
    lhApplyView();
    const tentX = LH_RULES.LH_TENT_X || 28;
    const tentZ0 = LH_RULES.LH_TENT_Z0 || -22;
    const tentZ1 = LH_RULES.LH_TENT_Z1 || 14;
    const tentZc = (tentZ0 + tentZ1) / 2;
    const tentD = tentZ1 - tentZ0;
    const ringR = LH_RULES.LH_RING_R || 9;
    const ringZ = LH_RULES.LH_RING_Z || -4;
    const midX = LH_RULES.LH_MIDWAY_WALL_X || 5.2;
    const midZ0 = LH_RULES.LH_MIDWAY_Z0 || 14;
    const midZ1 = LH_RULES.LH_MIDWAY_Z1 || 102;
    const midZc = (midZ0 + midZ1) / 2;
    const midD = midZ1 - midZ0;
    const flapZ = LH_RULES.LH_FLAP_Z || -4;
    const cellarZ = LH_RULES.LH_CELLAR_Z || 200;

    // sawdust / big-top floor (Y = floor layer, above grass)
    lhFloorBox(0, tentZc, tentX * 2, tentD, '#f3d7a0', 'floor');
    // center ring
    try {
      const ring = lhMesh(new THREE.CylinderGeometry(ringR, ringR, 0.08, lhLow() ? 16 : 24), lhMat('#c9956b'), 0, lhY('ring'), ringZ);
      lhDecal(ring);
      const nCurb = lhLow() ? 14 : 22;
      for (let i = 0; i < nCurb; i++){
        const a = (i / nCurb) * Math.PI * 2;
        // Leave walkable gaps toward the midway (+Z) and west fairground flaps (-X).
        if (Math.cos(a) > 0.72 || Math.sin(a) < -0.72) continue;
        lhBox(Math.sin(a) * (ringR + 0.15), lhY('ring') + 0.08, Math.cos(a) * (ringR + 0.15) + ringZ, 0.95, 0.95, (i % 2) ? '#fff8f0' : '#e31c23', 0.16);
      }
    } catch (e){}
    // striped tent walls
    const north = lhBox(0, 2.4, tentZ0 - 0.15, tentX * 2, 0.4, '#fff8f0', 4.8);
    if (north && north.mesh) lhPaintStripe(north.mesh, '#e31c23', '#fff8f0', 18, 1);
    // west wall has a walkable flap opening onto the fairground
    const westN = lhBox(-tentX, 2.4, (tentZ0 - 0.15 + flapZ - 1.7) / 2, 0.4, (flapZ - 1.7) - tentZ0, '#fff8f0', 4.8);
    if (westN && westN.mesh) lhPaintStripe(westN.mesh, '#e31c23', '#fff8f0', 8, 1);
    const westS = lhBox(-tentX, 2.4, (flapZ + 1.7 + tentZ1) / 2, 0.4, tentZ1 - (flapZ + 1.7), '#fff8f0', 4.8);
    if (westS && westS.mesh) lhPaintStripe(westS.mesh, '#e31c23', '#fff8f0', 8, 1);
    try { lhFlaps(-tentX, flapZ, true); } catch (e){}
    const eastW = lhBox(tentX, 2.4, tentZc, 0.4, tentD, '#fff8f0', 4.8);
    if (eastW && eastW.mesh) lhPaintStripe(eastW.mesh, '#e31c23', '#fff8f0', 10, 1);
    // front wall opening onto the midway
    const frontW = (tentX * 2 - midX * 2) / 2;
    const fL = lhBox(-(midX + frontW / 2), 2.4, tentZ1 - 0.1, frontW, 0.4, '#fff8f0', 4.8);
    if (fL && fL.mesh) lhPaintStripe(fL.mesh, '#e31c23', '#fff8f0', 8, 1);
    const fR = lhBox(midX + frontW / 2, 2.4, tentZ1 - 0.1, frontW, 0.4, '#fff8f0', 4.8);
    if (fR && fR.mesh) lhPaintStripe(fR.mesh, '#e31c23', '#fff8f0', 8, 1);
    // tent canopy
    try {
      const segs = lhLow() ? 8 : 14;
      const canopy = lhMesh(new THREE.ConeGeometry(tentX + 4, 10, segs, 1, true), lhMat('#fff8f0'), 0, 12.2, tentZc);
      if (canopy){ lhPaintStripe(canopy, '#e31c23', '#fff8f0', 16, 1); if (canopy.material){ canopy.material.side = THREE.DoubleSide; canopy.material.needsUpdate = true; } }
      lhMesh(new THREE.CylinderGeometry(0.08, 0.08, 2.2, 5), lhMat('#ffd25a', {emit:'#ffd25a'}), 0, 17.6, tentZc);
      lhMesh(new THREE.BoxGeometry(1.1, 0.55, 0.04), lhMat('#ffd25a', {emit:'#ffe27a'}), 0.55, 18.4, tentZc);
    } catch (e){}
    // colorful tent poles
    [[-16, -14], [16, -14], [-16, 6], [16, 6], [0, -18], [0, 8]].forEach(([x, z], i) => {
      const cols = ['#7cffd0', '#ffd25a', '#8ecaff', '#ff8ad8', '#ff9f1c', '#2ec27e'];
      lhBox(x, 2.6, z, 0.55, 0.55, cols[i % cols.length], 5.2);
    });
    // more bleachers (east + north); leave west flaps and south midway clear
    const rows = lhLow() ? 3 : 5;
    for (let s = 0; s < rows; s++){
      lhBox(ringR + 2.4 + s * 0.75, 0.28 + s * 0.38, ringZ, 2.2, 14 - s * 0.5, (s % 2) ? '#e31c23' : '#fff8f0', 0.28);
      lhBox(0, 0.28 + s * 0.38, ringZ - ringR - 2.2 - s * 0.7, 16 - s * 0.5, 2.0, (s % 2) ? '#e31c23' : '#fff8f0', 0.28);
    }
    lhLabel('Bleachers', 'rgba(80,20,40,.88)', ringR + 3.4, 2.1, ringZ - 6);
    // ringmaster stage for Maestro Gleam
    const stageZ = tentZ0 + 3.2;
    lhBox(0, 0.7, stageZ, 8.4, 3.4, '#6b3cff', 0.7);
    const stageLip = lhBox(0, 0.18, stageZ, 9.4, 4.0, '#ffd25a', 0.18);
    if (stageLip && stageLip.mesh) lhPaintStripe(stageLip.mesh, '#e31c23', '#ffd25a', 10, 1);
    lhBox(0, 2.6, stageZ - 1.5, 8.6, 0.2, '#fff8f0', 0.5);
    lhLabel(LH_HOST_TITLE, 'rgba(80,20,90,.92)', 0, 3.5, stageZ);
    lh.stageZ = stageZ;

    // scoreboard
    lh.boards = lhLabel('⭐ Top fizzles\n— none yet —', 'rgba(20,30,60,.9)', 20, 2.8, 2);

    // long midway
    lhFloorBox(0, midZc, midX * 2, midD, '#e8c98a', 'floor');
    const midSegs = (LH_RULES.lhMidwayWallSegments ? LH_RULES.lhMidwayWallSegments() : [{z0:midZ0,z1:midZ0+1}]);
    midSegs.forEach(s => {
      const z = (s.z0 + s.z1) / 2, d = Math.max(0.2, s.z1 - s.z0);
      [-midX, midX].forEach(x => {
        const mh = LH_RULES.LH_MIDWAY_WALL_H || 5.6;
        const w = lhBox(x, mh, z, 0.35, d, '#fff8f0', mh);
        if (w && w.mesh) lhPaintStripe(w.mesh, '#e31c23', '#fff8f0', 2, Math.max(1, d / 3));
      });
    });
    // Open-air midway: no roof/ceiling, so the dusk sky shows. String lights
    // along the eaves keep the hall lit, so darkness logic still treats it as safe.
    const runner = lhFloorBox(0, midZc, 2.2, midD - 1, '#e31c23', 'runner');
    lhLabel('Midway', 'rgba(80,20,40,.9)', 0, 3.6, midZ0 + 8);

    // rooms — up to 20 numbered wagons, each with a real hinged door
    // Solid shell + frosted windows; interiors live in R.interior and hide when the door is closed and the viewer is outside.
    const specs = lhRoomsSpec();
    const wallCols = ['#ffb3de', '#b9f0c8', '#ffd7a0', '#c5d8ff', '#f3c6ff', '#ffe29a'];
    const floorCols = ['#fff1f8', '#e8fff2', '#fff6e8', '#eef4ff', '#fbecff', '#fff8e0'];
    const lhSolid = function(box){
      try {
        if (box && box.mesh && box.mesh.material){
          box.mesh.material.side = THREE.DoubleSide;
          box.mesh.material.needsUpdate = true;
        }
      } catch (e){}
      return box;
    };
    specs.forEach(R => {
      const w = 8, d = 6.2, h = LH_RULES.LH_WAGON_H || 5.6;
      const floorY = lhY('wagon');
      const wall = wallCols[R.id % wallCols.length];
      const floor = floorCols[R.id % floorCols.length];
      const roomFl = lhFloorBox(R.x, R.z, w, d, floor, 'wagon', floorY);
      const recDraft = {id: R.id, x: R.x, z: R.z, side: R.side, w, d, h, floorY};
      const lay = LH_RULES.lhDoorwayLayout ? LH_RULES.lhDoorwayLayout(recDraft) : {ix: R.x - R.side * (w / 2), stubZ0: R.z - 2.22, stubZ1: R.z + 2.22, stubD: 1.98, transomY: 4.4, transomH: 2.4, transomD: 2.32, transomTop: h, wallTop: h, openH: 3.2};
      const wallMeshes = [];
      const takeWall = function(box){
        const b = lhSolid(box);
        if (b && b.mesh) wallMeshes.push(b.mesh);
        return b;
      };
      // plat() takes the TOP of the box, not the center — use top=h so walls run from the floor to h.
      takeWall(lhBox(R.x + R.side * (w / 2 + 0.12), h, R.z, 0.32, d + 0.3, wall, h));
      takeWall(lhBox(R.x, h, R.z - d / 2, w, 0.32, wall, h));
      takeWall(lhBox(R.x, h, R.z + d / 2, w, 0.32, wall, h));
      const ix = lay.ix;
      takeWall(lhBox(ix, h, lay.stubZ0, 0.32, lay.stubD, wall, h));
      takeWall(lhBox(ix, h, lay.stubZ1, 0.32, lay.stubD, wall, h));
      // transom is a solid from the door head to the wall top (stops jumps over a closed door)
      takeWall(lhBox(ix, lay.transomTop || h, R.z, 0.32, lay.transomD, wall, lay.transomH));
      const ceil = lhMesh(new THREE.BoxGeometry(w + 0.2, 0.16, d + 0.2), lhMat('#fff7fb'), R.x, h, R.z);
      if (ceil) lhPaintStripe(ceil, '#fff7fb', wall, 8, 1);
      // frosted, opaque windows — decorative light, not a view into the room
      const frostMat = lhMat('#d8e8f8', {emit:'#c8daf0'});
      if (frostMat){ frostMat.transparent = false; frostMat.side = THREE.DoubleSide; frostMat.needsUpdate = true; }
      [-1, 1].forEach(sz => {
        const wm = lhMesh(new THREE.BoxGeometry(1.55, 1.1, 0.08), frostMat || lhMat('#d8e8f8'), R.x, 1.65, R.z + sz * (d / 2));
        if (wm && wm.material){ wm.material.side = THREE.DoubleSide; wm.material.transparent = false; }
      });
      const interior = new THREE.Group();
      interior.name = 'lhInt' + R.id;
      interior.visible = false;
      scene.add(interior);
      if (lh) lh.trash.push(interior);
      const bx = R.x + R.side * 1.8, bz = R.z;
      const bed = lhBox(bx, floorY + 0.4, bz, 2.2, 1.5, '#fffaf0', 0.4);
      const pillow = lhBox(bx + R.side * 0.7, floorY + 0.68, bz, 0.4, 1.5, '#ff8fc8', 0.28);
      if (bed && bed.mesh) interior.add(bed.mesh);
      if (pillow && pillow.mesh) interior.add(pillow.mesh);
      const sx = ix + R.side * 0.7, sz = R.z - 1.35;
      const sw = lhMesh(new THREE.BoxGeometry(0.12, 0.3, 0.2), lhMat('#fffbe8', {emit:'#fff3b0'}), sx, 1.4, sz);
      if (sw) interior.add(sw);
      const dx = ix + R.side * 0.25, dz = R.z + 2.15;
      const bell = lhMesh(new THREE.BoxGeometry(0.16, 0.22, 0.16), lhMat('#ffd25a', {emit:'#ffcc44'}), dx, 1.35, dz);
      const cx = R.x, cz = R.z - d / 2 + 0.2;
      const furnish = !lhLow() || R.id < 4;
      const crayon = furnish ? lhMesh(new THREE.BoxGeometry(2.8, 1.8, 0.08), lhMat('#fffef6'), cx, 1.5, cz) : null;
      if (crayon) interior.add(crayon);
      const door = {g: null, mesh: null, plat: null, closed: true, ang: 0, target: 0, id: R.id};
      const decorG = new THREE.Group(); decorG.name = 'lhDecor' + R.id; interior.add(decorG);
      const rec = {id: R.id, x: R.x, z: R.z, side: R.side, w, d, h, floorY, bed: {x: bx, z: bz}, switch: {x: sx, z: sz}, bell: {x: dx, z: dz}, wall: {x: cx, z: cz}, crayon, door, owner: null, lit: true, sw, bellM: bell, interior, decorG, wallMeshes, floorMesh: roomFl && roomFl.mesh, baseWall: wall, baseFloor: floor, netDecor: [], netStyle: null};
      lh.rooms.push(rec);
      lh.lights[R.id] = true;
      lh.doors[R.id] = true;
      // Wagon number sits outside by the awning so it does not show through a closed door
      lhLabel('Wagon ' + (R.id + 1), 'rgba(80,20,60,.88)', ix - R.side * 0.95, 3.15, R.z);
      const pathLen = Math.abs(ix) - midX;
      const pathMid = R.side * (midX + pathLen / 2);
      lhFloorBox(pathMid, R.z, pathLen + 0.2, 2.6, '#e8c98a', 'path');
      for (let s = 0; s < 3; s++){
        const top = 0.07 * (s + 1);
        const stx = ix - R.side * (0.45 + s * 0.5);
        const st = lhBox(stx, top, R.z, 0.55, 2.2, s % 2 ? '#fff8f0' : '#e31c23', top);
        if (st) st.floorOnly = true;
      }
      if (furnish) lhTrailerBits(rec, wall);
      lhMakeHingeDoor(rec);
      lhSetDoor(rec, true);
    });
    try { lhRestoreWallWords(); } catch (e){}

    // bathroom at the end of the long midway
    const bathZ = midZ1 + 6;
    lhFloorBox(0, bathZ, 12, 8, '#d9f4ff', 'floor');
    lhBox(0, 2.2, bathZ + 4, 12, 0.3, '#b9e0f0', 4.4);
    lhBox(-6, 2.2, bathZ, 0.3, 8, '#b9e0f0', 4.4);
    lhBox(6, 2.2, bathZ, 0.3, 8, '#b9e0f0', 4.4);
    lhBox(-3.2, 0.7, bathZ + 2.4, 2.6, 0.8, '#eef8ff', 0.7);
    lhBox(3.2, 0.7, bathZ + 2.4, 2.6, 0.8, '#eef8ff', 0.7);
    const mirror = lhMesh(new THREE.BoxGeometry(2.2, 1.6, 0.08), lhMat('#cfefff', {emit:'#e8fbff'}), 0, 1.9, bathZ + 3.75);
    lh.mirror = {x: 0, z: bathZ + 2.6, mesh: mirror};
    lhBox(-4.6, 1.4, bathZ - 1.6, 1.8, 1.8, '#c5dbe6', 2.8);
    lhBox(4.6, 1.4, bathZ - 1.6, 1.8, 1.8, '#c5dbe6', 2.8);
    lhLabel('Bathrooms', 'rgba(20,50,70,.9)', 0, 3.2, bathZ);
    lh.bathZ = bathZ;

    // lookout stairs + balcony (inside the north end, no wall pierce)
    for (let i = 0; i < 6; i++){
      lhBox(-16, 0.18 + i * 0.42, tentZ0 + 4 - i * 0.55, 2.4, 1.1, '#ffd25a', 0.18);
    }
    lhBox(-16, 2.7, tentZ0 + 1.2, 8, 4, '#ffd9ef', 0.18);
    lhBox(-16, 3.6, tentZ0 - 0.6, 8.2, 0.25, '#ff8fc8', 1.8);
    lhLabel('Lookout', 'rgba(80,20,60,.9)', -16, 4.4, tentZ0 + 1.2);

    // carnival props just inside the midway mouth
    lhStand(-8.4, tentZ1 - 2.2, '#fff3d0', 'Popcorn');
    lhStand(8.4, tentZ1 - 2.2, '#ffd0e8', 'Cotton Candy');
    if (!lhLow()){
      lhBalloons(-7.2, 2.4, tentZ1 - 3.4, 4);
      lhBalloons(7.4, 2.4, tentZ1 - 3.6, 3);
      lhPins(0, tentZ1 - 4.4);
    }
    const midLights = [];
    for (let z = midZ0; z <= midZ1; z += lhLow() ? 5 : 3.2){
      midLights.push([-midX + 0.3, (LH_RULES.LH_MIDWAY_WALL_H || 5.6) - 0.45, z], [midX - 0.3, (LH_RULES.LH_MIDWAY_WALL_H || 5.6) - 0.45, z]);
    }
    for (let a = 0; a < 12; a++){
      const ang = (a / 12) * Math.PI - Math.PI / 2;
      midLights.push([Math.sin(ang) * (tentX - 4), 6.2, Math.cos(ang) * 12 + tentZc]);
    }
    lhStringLights(midLights);

    // dark nook inside the tent
    const nook = {x: (tentX - 6), z: 8};
    lhFloorBox(nook.x, nook.z, 5, 5, '#2a2040', 'floor');
    lhBox(nook.x, 1.6, nook.z - 2.4, 5, 0.25, '#1a1528', 3.2);
    lhBox(nook.x - 2.4, 1.6, nook.z, 0.25, 5, '#1a1528', 3.2);
    lh.nook = nook;
    lhLabel('…', 'rgba(20,10,30,.85)', nook.x, 2.2, nook.z);

    // cellar is a far island (no walk-in door)
    const CX = 0, CZ = cellarZ;
    lhFloorBox(CX, CZ, 16, 14, '#3a2a28', 'floor', 0.3);
    lhBox(CX, 2.8, CZ - 7, 16, 0.4, '#2a1c1a', 5.6);
    lhBox(CX, 2.8, CZ + 7, 16, 0.4, '#2a1c1a', 5.6);
    lhBox(CX - 8, 2.8, CZ, 0.4, 14, '#2a1c1a', 5.6);
    lhBox(CX + 8, 2.8, CZ, 0.4, 14, '#2a1c1a', 5.6);
    lhBox(CX, 5.7, CZ, 16.2, 14.2, '#1a1210', 0.25);
    [[-4, -3], [4, -3], [-4, 3], [4, 3]].forEach(([x, z]) => lhBox(CX + x, 1.6, CZ + z, 0.35, 0.35, '#ffb347', 1.6));
    lhLabel('The Cellar', 'rgba(40,20,20,.92)', CX, 3.2, CZ);
    lh.cellar = {x: CX, y: 0.05, z: CZ};

    // mysterious exit (hidden until later)
    const ed = lhMesh(new THREE.BoxGeometry(1.6, 2.6, 0.2), lhMat('#9b7cff', {emit:'#c5b0ff', trans:0.15}), tentX - 6, 1.4, 6.2);
    ed.visible = false;
    lh.exitDoor = {x: tentX - 6, z: 6.2, mesh: ed, shown: false, seen: false};

    // host NPC
    try {
      const hostAv = {head:'#ffd9b0', hair:'curl', hairColor:'#3a1860', shirt:'#d61c8c', pants:'#2a1040', hat:'party', body:'girl', shirtPat:'sparkly'};
      const hm = (typeof buildPlayer === 'function') ? buildPlayer(hostAv) : null;
      if (hm && hm.g){
        hm.g.position.set(0, 0.7, stageZ);
        scene.add(hm.g);
        lh.trash.push(hm.g);
        lh.host = {model: hm, x: 0, z: stageZ, y: 0.7, face: 0, name: LH_HOST_TITLE, kind: 'host'};
      }
    } catch (e){}

    // NPC guests (single-player companionship)
    const npcAv = [
      {head:'#f6c89a', hair:'short', hairColor:'#2a1a10', shirt:'#3a86ff', pants:'#1d2340', hat:null, body:'boy'},
      {head:'#ffd23f', hair:'curl', hairColor:'#5a2a00', shirt:'#2ec27e', pants:'#164e3a', hat:'backcap', body:'girl'},
      {head:'#f3b48a', hair:'long', hairColor:'#1a1a1a', shirt:'#ff6fb5', pants:'#5b2dff', hat:null, body:'girl'},
      {head:'#e8c4a0', hair:'spiky', hairColor:'#f2e2a0', shirt:'#ff9f1c', pants:'#3d6fb5', hat:'propeller', body:'boy'}
    ];
    const spots = [{x:-8, z:-2}, {x:8, z:1}, {x:-4, z:6}, {x:5, z:-8}];
    npcAv.forEach((av, i) => {
      try {
        const m = (typeof buildPlayer === 'function') ? buildPlayer(av) : null;
        if (!m || !m.g) return;
        const s = spots[i];
        m.g.position.set(s.x, 0, s.z);
        scene.add(m.g);
        lh.trash.push(m.g);
        const npc = {id:'n' + i, name:['Rio','Sunny','Pearl','Nico'][i], model:m, x:s.x, z:s.z, y:0, face:0, glitched:false, sanity:100, wx:s.x, wz:s.z, wait:2 + i, kind:'guest'};
        if (test === 'glitch' && i === 0){ /* leave normal so player can isolate */ }
        if (test === 'cellar' && i === 1){ npc.glitched = true; npc.sanity = 0; }
        lh.npcs.push(npc);
        if (npc.glitched) lhApplyLook(m, true);
      } catch (e){}
    });

    // assign my room (player 0, or plot)
    let mine = 0;
    try {
      if (typeof mp !== 'undefined' && mp && mp.on){
        const uid = mp.host ? 'H' : (mp.me || 'g0');
        const roster = (typeof mpRoster === 'function' ? mpRoster() : []) || [];
        const idx = Math.max(0, roster.findIndex(p => p && (p.uid === uid || p.id === uid)));
        mine = (idx >= 0 ? idx : 0) % lh.rooms.length;
      }
    } catch (e){}
    lh.myRoom = mine;
    try { lhAssignOwners(); } catch (e){ if (lh.rooms[mine]) lh.rooms[mine].owner = 'me'; }
    if (lh.rooms[mine]){
      const R = lh.rooms[mine];
      const mouthX = R.side * (midX + 1.2);
      lhLabel('⬇ Your Wagon', 'rgba(180,20,40,.96)', mouthX, 2.55, R.z);
      lhLabel('Your Wagon', 'rgba(180,30,50,.95)', mouthX, 3.25, R.z);
      const mark = lhMesh(new THREE.ConeGeometry(0.55, 0.9, 8), lhMat('#ffd25a', {emit:'#ffe27a'}), mouthX, 1.7, R.z);
      if (mark) mark.rotation.x = Math.PI;
      const padG = lhMesh(new THREE.CylinderGeometry(0.9, 0.9, 0.12, 12), lhMat('#ffd25a', {emit:'#ffe27a'}), mouthX, lhY('pad'), R.z);
      lhDecal(padG);
      lh.wagonMark = {x: mouthX, z: R.z, mesh: mark};
    }
    try { if (lh && lh.rooms) lh.rooms.forEach(R => { lhApplyWagonStyle(R); lhRebuildDecor(R); }); } catch (e){}
    // teleport pad in the big top, near the midway mouth
    try {
      const pad = lhMesh(new THREE.CylinderGeometry(1.15, 1.15, 0.14, 14), lhMat('#6b3cff', {emit:'#8d6cff'}), 0, lhY('pad'), tentZ1 - 2);
      lhDecal(pad);
      lhLabel('🎪 Go to my wagon', 'rgba(80,20,90,.95)', 0, 1.7, tentZ1 - 2);
      lh.wagonPad = {x: 0, z: tentZ1 - 2};
    } catch (e){ lh.wagonPad = {x: 0, z: tentZ1 - 2}; }

    // test fixtures
    if (test === 'glitch' || test === 'xform'){
      lh.sanity = 7;
      lh.area = 'room';
      lh.room = lh.myRoom;
      const R = lh.rooms[lh.myRoom];
      if (R){ R.lit = false; lh.lights[R.id] = false; lhTintRoom(R, false); }
    }
    if (test === 'cellar'){
      lh.sanity = 0;
      lh.glitched = true;
    }

    // restore doodles
    try {
      const d = prog.doodles || {};
      lh.rooms.forEach(R => { if (d[R.id]) lhPaintWall(R, d[R.id]); });
    } catch (e){}

    // spawn
    const spawnY = lhY('floor') + 0.05;
    try {
      if (test === 'glitch' && lh.rooms[lh.myRoom]){
        const R = lh.rooms[lh.myRoom];
        Object.assign(P, {x: R.x, y: (R.floorY || lhY('wagon')) + 0.05, z: R.z, vx:0, vy:0, vz:0});
      } else if (test === 'cellar'){
        Object.assign(P, {x: 0, y: spawnY, z: 2, vx:0, vy:0, vz:0});
      } else {
        Object.assign(P, {x: 0, y: spawnY, z: 0, vx:0, vy:0, vz:0});
      }
    } catch (e){}

    // respawn() always reads checkpoints[cpIndex].spawn
    try {
      const sx = (typeof P !== 'undefined' && P && isFinite(P.x)) ? P.x : 0;
      const sy = (typeof P !== 'undefined' && P && isFinite(P.y)) ? P.y : spawnY;
      const sz = (typeof P !== 'undefined' && P && isFinite(P.z)) ? P.z : 0;
      if (typeof checkpoints !== 'undefined'){
        checkpoints[0] = {spawn: {x: sx, y: sy, z: sz}, idx: 0, lit: true, b: {mesh: {position: {x: sx, y: 0, z: sz}}, hw: 1, hh: 0.1, hd: 1, active: false}, flag: {visible: false, rotation: {x: 0, y: 0, z: 0}}, flagMat: {color: {set: function(){}}, emissive: {set: function(){}}}};
      }
      if (typeof cpIndex !== 'undefined') cpIndex = 0;
    } catch (e){}
    lhApplyView();


  }

  function lhTintRoom(R, on){
    if (!R) return;
    R.lit = !!on;
    lh.lights[R.id] = !!on;
    try {
      if (R.sw && R.sw.material){
        R.sw.material.color = new THREE.Color(on ? '#fffbe8' : '#3a3050');
        if (R.sw.material.emissive) R.sw.material.emissive = new THREE.Color(on ? '#fff3b0' : '#000000');
      }
    } catch (e){}
  }

  function lhPaintWall(R, marks){
    if (!R || !R.crayon) return;
    try {
      const c = document.createElement('canvas'); c.width = 256; c.height = 160;
      const g = c.getContext('2d');
      g.fillStyle = '#fffef6'; g.fillRect(0, 0, 256, 160);
      g.strokeStyle = '#eadfbf'; g.strokeRect(2, 2, 252, 156);
      (marks || []).forEach(m => {
        const x = (m.x || 0) * 256, y = (m.y || 0) * 160;
        g.fillStyle = m.color || '#ff6b9a';
        g.font = '28px sans-serif';
        const icon = {star:'⭐', heart:'❤', circle:'●', square:'■', squiggle:'〰️', smile:'☺', lantern:'🏮', swirl:'🌀'}[m.stamp] || '●';
        g.fillText(icon, x - 12, y + 10);
      });
      const tex = new THREE.CanvasTexture(c);
      tex.needsUpdate = true;
      if (R.crayon.material){
        if (R.crayon.material.map) try { R.crayon.material.map.dispose(); } catch (e){}
        R.crayon.material.map = tex;
        R.crayon.material.needsUpdate = true;
      }
    } catch (e){}
  }

  function lhMakeHingeDoor(R){
    if (!R || !R.door) return;
    const lay = LH_RULES.lhDoorwayLayout ? LH_RULES.lhDoorwayLayout(R) : {ix: R.x - R.side * (R.w / 2), hingeZ: R.z - 1.12, doorThick: 0.16, doorH: 2.44, doorD: 2.3, openW: 2.24, openH: 2.4};
    const ix = lay.ix;
    const hingeZ = lay.hingeZ;
    const g = new THREE.Group();
    g.position.set(ix, 0, hingeZ);
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(lay.doorThick, lay.doorH, lay.doorD), lhMat('#6b3cff', {emit:'#3a1ca0'}));
    mesh.position.set(0, lay.doorH / 2, lay.doorD / 2);
    if (mesh.material){ mesh.material.side = THREE.DoubleSide; mesh.material.transparent = false; mesh.material.needsUpdate = true; }
    g.add(mesh);
    const stripe = new THREE.Mesh(new THREE.BoxGeometry(lay.doorThick + 0.02, 0.22, lay.doorD), lhMat('#fff8f0'));
    stripe.position.set(0, lay.doorH - 0.22, lay.doorD / 2);
    g.add(stripe);
    const knob = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8), lhMat('#ffd25a', {emit:'#ffe27a'}));
    knob.position.set(-R.side * 0.12, 1.15, lay.doorD - 0.28);
    g.add(knob);
    scene.add(g);
    if (lh) lh.trash.push(g);
    const platBox = plat(ix, lay.openH, R.z, 0.28, lay.openW, '#6b3cff', lay.openH);
    if (platBox && platBox.mesh){ platBox.mesh.visible = false; if (lh) lh.trash.push(platBox.mesh); }
    R.door.g = g;
    R.door.mesh = mesh;
    R.door.plat = platBox;
    R.door.ang = 0;
    R.door.target = 0;
    R.door.closed = true;
    if (g) g.rotation.y = 0;
    return R.door;
  }
  function lhSetDoor(R, closed, why){
    if (!R || !R.door) return;
    R.door.closed = !!closed;
    if (lh) lh.doors[R.id] = !!closed;
    const target = (LH_RULES.lhDoorTarget ? LH_RULES.lhDoorTarget(R.side, !!closed) : (closed ? 0 : -R.side * 1.9));
    R.door.target = target;
    if (!R.door.g) lhMakeHingeDoor(R);
    if (R.door.g && R.door.ang == null) R.door.ang = closed ? 0 : target;
    if (R.door.plat){
      R.door.plat.active = !!closed;
      if (R.door.plat.mesh) R.door.plat.mesh.visible = false;
    }
    // A player-closed door must not be auto-opened again until they leave the doorway.
    if (why === 'player' && closed) R.door._holdClosed = true;
    if (!closed) R.door._holdClosed = false;
  }
  function lhTickDoors(dt){
    if (!lh || !lh.rooms) return;
    dt = +dt || 0.016;
    lh.rooms.forEach(R => {
      const d = R.door;
      if (!d || !d.g) return;
      const dest = d.target != null ? d.target : (d.closed ? 0 : -R.side * 1.9);
      d.ang = (d.ang == null ? 0 : d.ang);
      d.ang += (dest - d.ang) * Math.min(1, dt * 8);
      d.g.rotation.y = d.ang;
      if (d.plat){
        d.plat.active = Math.abs(d.ang) < 0.4;
        if (d.plat.mesh) d.plat.mesh.visible = false;
      }
    });
  }
  function lhOwnerAutoDoor(){
    if (!lh || !P) return;
    const R = lh.rooms[lh.myRoom];
    if (!R || R.owner !== 'me' || !R.door) return;
    const doorX = R.x - R.side * (R.w / 2);
    const near = LH_RULES.lhNear ? LH_RULES.lhNear(P.x, P.z, doorX, R.z, 2.2) : false;
    const inside = Math.abs(P.x - R.x) < R.w / 2 - 0.1 && Math.abs(P.z - R.z) < R.d / 2 - 0.1;
    if (!near){ R.door._auto = false; R.door._holdClosed = false; return; }
    const st = {near: true, inside: !!inside, closed: !!R.door.closed, auto: !!R.door._auto, holdClosed: !!R.door._holdClosed};
    const should = LH_RULES.lhDoorShouldAutoOpen ? LH_RULES.lhDoorShouldAutoOpen(st) : (!st.holdClosed && !st.inside && st.closed && !st.auto);
    if (should){
      R.door._auto = true;
      lhSetDoor(R, false);
    }
  }


  function lhChatMode(){
    try { if (typeof chMode === 'function') return chMode(); } catch (e){}
    return 'on';
  }
  function lhWordUid(){
    try {
      if (typeof mp !== 'undefined' && mp && mp.on) return mp.host ? 'H' : (mp.me || 'g0');
    } catch (e){}
    return 'me';
  }
  function lhLookRay(){
    let ox = (P && P.x) || 0, oy = ((P && P.y) || 0) + 1.35, oz = (P && P.z) || 0;
    let dx = 0, dy = 0, dz = -1;
    try {
      if (typeof camera !== 'undefined' && camera && camera.getWorldDirection){
        ox = camera.position.x; oy = camera.position.y; oz = camera.position.z;
        const e = new THREE.Vector3();
        camera.getWorldDirection(e);
        dx = e.x; dy = e.y; dz = e.z;
      } else if (typeof cam !== 'undefined' && cam){
        const yaw = cam.yaw || 0, pitch = cam.pitch || 0;
        dx = -Math.sin(yaw) * Math.cos(pitch);
        dy = Math.sin(pitch);
        dz = -Math.cos(yaw) * Math.cos(pitch);
      }
    } catch (e){}
    return {ox, oy, oz, dx, dy, dz};
  }
  function lhAllWallPlanes(){
    const planes = [];
    if (!lh || !lh.rooms) return planes;
    lh.rooms.forEach(R => {
      const list = LH_RULES.lhWagonWallPlanes ? LH_RULES.lhWagonWallPlanes(R) : [];
      list.forEach(p => planes.push(p));
    });
    return planes;
  }
  function lhLookWallHit(){
    if (!lh || !P) return null;
    const ray = lhLookRay();
    const maxd = LH_RULES.LH_WALL_MAX_DIST || 3.4;
    const hit = LH_RULES.lhRayWall ? LH_RULES.lhRayWall(ray.ox, ray.oy, ray.oz, ray.dx, ray.dy, ray.dz, lhAllWallPlanes(), maxd) : null;
    if (!hit) return null;
    // Do not write in the open doorway gap
    if (hit.wall === 'door'){
      const R = lh.rooms[hit.room];
      if (R){
        const lay = LH_RULES.lhDoorwayLayout ? LH_RULES.lhDoorwayLayout(R) : null;
        if (lay && Math.abs(hit.z - R.z) <= lay.openW / 2 && hit.y <= lay.openH){
          if (R.door && !R.door.closed) return null;
        }
      }
    }
    return hit;
  }
  function lhWordAtLook(){
    const hit = lhLookWallHit();
    if (!hit || !lh || !lh.words) return null;
    const uid = lhWordUid();
    let best = null, bestD = 0.85;
    lh.words.forEach(w => {
      if (!w || w.uid !== uid) return;
      const d = Math.sqrt((w.x - hit.x) ** 2 + (w.y - hit.y) ** 2 + (w.z - hit.z) ** 2);
      if (d < bestD){ bestD = d; best = w; }
    });
    return best;
  }
  function lhPaintWordCanvas(text, style){
    const c = document.createElement('canvas');
    c.width = 512; c.height = 256;
    const g = c.getContext('2d');
    g.clearRect(0, 0, 512, 256);
    const letters = String(text || '').split('');
    const n = Math.max(1, letters.length);
    const slot = 480 / n;
    const paint = style !== 'chalk';
    letters.forEach((ch, i) => {
      const x = 16 + slot * i + slot * 0.08;
      const y = 128 + Math.sin(i * 1.7) * 12 + (i % 3) * 5;
      g.save();
      g.translate(x, y);
      g.rotate((Math.sin(i * 2.2) * 0.13) + (i - n / 2) * 0.025);
      if (paint){
        g.font = '900 ' + (76 + (i % 3) * 6) + 'px "Comic Sans MS","Chalkboard SE",cursive,sans-serif';
        g.fillStyle = i % 2 ? '#8a0a10' : '#c4141c';
        g.shadowColor = '#3a0000';
        g.shadowBlur = 6;
        g.fillText(ch, 0, 0);
        g.shadowBlur = 0;
        g.fillStyle = '#6a0710';
        const dw = 3 + (i % 3);
        const dh = 16 + (i * 11) % 34;
        g.fillRect(12, 6, dw, dh);
        g.beginPath(); g.arc(12 + dw / 2, 6 + dh, dw / 2 + 1, 0, Math.PI * 2); g.fill();
      } else {
        g.font = '900 ' + (70 + (i % 3) * 6) + 'px "Chalkboard SE","Comic Sans MS",cursive,sans-serif';
        g.fillStyle = '#f3efe0';
        g.globalAlpha = 0.95;
        g.fillText(ch, 0, 0);
        g.globalAlpha = 0.35;
        g.fillText(ch, 1.8, 1.4);
      }
      g.restore();
    });
    return c;
  }
  function lhSpawnWordMesh(word, fadeIn){
    if (!lh || !word || typeof THREE === 'undefined') return null;
    try {
      const can = lhPaintWordCanvas(word.text, word.style);
      const tex = new THREE.CanvasTexture(can);
      tex.needsUpdate = true;
      const w = Math.max(0.9, 0.32 * String(word.text || '').length);
      const h = 0.58;
      const mat = new THREE.MeshBasicMaterial({
        map: tex, transparent: true, depthTest: true, depthWrite: false,
        side: THREE.DoubleSide, alphaTest: 0.08
      });
      const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat);
      const nx = word.nx || 0, nz = word.nz || 0;
      const nlen = Math.sqrt(nx * nx + nz * nz) || 1;
      mesh.position.set(word.x + (nx / nlen) * 0.04, word.y, word.z + (nz / nlen) * 0.04);
      mesh.lookAt(mesh.position.x + nx / nlen, mesh.position.y, mesh.position.z + nz / nlen);
      const R = word.interior && lh.rooms && lh.rooms[word.room];
      if (R && R.interior) R.interior.add(mesh);
      else scene.add(mesh);
      lh.trash.push(mesh);
      const item = {mesh, word, fading: false, fade: fadeIn ? 0 : 1};
      if (fadeIn && mat) mat.opacity = 0;
      lh.wordMeshes = lh.wordMeshes || [];
      lh.wordMeshes.push(item);
      return item;
    } catch (e){ return null; }
  }
  function lhRemoveWordMesh(id){
    if (!lh || !lh.wordMeshes) return;
    lh.wordMeshes = lh.wordMeshes.filter(item => {
      if (!item || !item.word || item.word.id !== id) return true;
      try {
        if (item.mesh){
          if (item.mesh.parent) item.mesh.parent.remove(item.mesh);
          if (item.mesh.material && item.mesh.material.map) item.mesh.material.map.dispose();
          if (item.mesh.material) item.mesh.material.dispose();
          if (item.mesh.geometry) item.mesh.geometry.dispose();
        }
      } catch (e){}
      return false;
    });
  }
  function lhFadeWordMesh(id){
    if (!lh || !lh.wordMeshes) return;
    lh.wordMeshes.forEach(item => {
      if (item && item.word && item.word.id === id) item.fading = true;
    });
  }
  function lhTickWordFades(dt){
    if (!lh || !lh.wordMeshes) return;
    const gone = [];
    lh.wordMeshes.forEach(item => {
      if (!item || !item.mesh) return;
      if (item.fading){
        item.fade = Math.max(0, (item.fade == null ? 1 : item.fade) - dt * 1.2);
        if (item.mesh.material) item.mesh.material.opacity = item.fade;
        if (item.fade <= 0) gone.push(item.word && item.word.id);
      } else if (item.fade < 1){
        item.fade = Math.min(1, (item.fade || 0) + dt * 2);
        if (item.mesh.material) item.mesh.material.opacity = item.fade;
      }
    });
    gone.forEach(id => { if (id) lhRemoveWordMesh(id); });
  }
  function lhRestoreWallWords(){
    if (!lh) return;
    (lh.words || []).forEach(w => lhSpawnWordMesh(w));
  }
  function lhPlaceWallWord(raw, opts){
    opts = opts || {};
    if (!lh) return {ok: false, reason: 'no-game'};
    const hit = opts.hit || lhLookWallHit();
    if (!hit) return {ok: false, reason: 'no-wall'};
    const mode = opts.chatMode != null ? opts.chatMode : lhChatMode();
    const filter = (typeof chatFilter === 'function') ? chatFilter : null;
    const norm = LH_RULES.lhNormalizeWallText ? LH_RULES.lhNormalizeWallText(raw, {chatMode: mode, chatFilter: filter}) : {ok: !!(raw && String(raw).trim()), text: String(raw || '').trim().slice(0, 12)};
    if (!norm.ok){
      if (norm.reason === 'pii' || norm.reason === 'filtered'){
        if (typeof toast === 'function') toast(norm.reason === 'pii' ? '📛 Personal info is blocked.' : '📛 That word was filtered (####).');
        try { if (norm.reason === 'filtered' || norm.reason === 'pii') lhAward('lh:words'); } catch (e){}
      } else if (norm.reason === 'presets-only'){
        if (typeof toast === 'function') toast('✍️ Chat is set to presets only — pick a word from the list.');
      } else if (typeof toast === 'function') toast('✍️ Face a wall and pick a word.');
      return norm;
    }
    const rec = {
      text: norm.text,
      style: (opts.style || (lh && lh.writeStyle) || 'paint'),
      uid: opts.uid || lhWordUid(),
      x: hit.x, y: hit.y, z: hit.z,
      nx: hit.nx, ny: 0, nz: hit.nz,
      room: hit.room, interior: !!hit.interior
    };
    const added = LH_RULES.lhAddWallWord ? LH_RULES.lhAddWallWord(lh.words || [], rec) : {list: (lh.words || []).concat([rec]), added: rec, faded: []};
    lh.words = added.list;
    if (lh.prog) lh.prog.wallWords = lh.words;
    (added.faded || []).forEach(w => lhFadeWordMesh(w.id));
    if (added.added) lhSpawnWordMesh(added.added, true);
    try { lhSaveProg(lh.prog); } catch (e){}
    try { if (added.added) lhNet({k:'word', op:'add', word: added.added}); } catch (e){}
    if (typeof toast === 'function' && added.added) toast('✍️ Wrote “' + added.added.text + '”');
    return {ok: true, word: added.added};
  }
  function lhEraseMyWord(id){
    if (!lh) return false;
    const uid = lhWordUid();
    let target = id;
    if (!target){
      const look = lhWordAtLook();
      if (look) target = look.id;
      else {
        const mine = (lh.words || []).filter(w => w && w.uid === uid);
        if (mine.length) target = mine[mine.length - 1].id;
      }
    }
    if (!target){ if (typeof toast === 'function') toast('🧽 No writing of yours to erase.'); return false; }
    const res = LH_RULES.lhEraseWallWord ? LH_RULES.lhEraseWallWord(lh.words || [], target, uid) : {erased: null, list: lh.words, reason: 'missing'};
    if (!res.erased){
      if (typeof toast === 'function') toast(res.reason === 'not-owner' ? '🧽 You can only erase your own words.' : '🧽 Nothing to erase.');
      return false;
    }
    lh.words = res.list;
    if (lh.prog) lh.prog.wallWords = lh.words;
    lhFadeWordMesh(res.erased.id);
    try { lhSaveProg(lh.prog); } catch (e){}
    try { lhNet({k:'word', op:'erase', id: res.erased.id, uid: uid}); } catch (e){}
    if (typeof toast === 'function') toast('🧽 Erased “' + res.erased.text + '”');
    return true;
  }
  function lhReceiveWord(word){
    if (!lh || !word) return;
    const added = LH_RULES.lhAddWallWord ? LH_RULES.lhAddWallWord(lh.words || [], word) : {list: (lh.words || []).concat([word]), added: word, faded: []};
    lh.words = added.list;
    (added.faded || []).forEach(w => lhFadeWordMesh(w.id));
    if (added.added && !(lh.wordMeshes || []).some(it => it && it.word && it.word.id === added.added.id)) lhSpawnWordMesh(added.added, true);
  }
  function lhReceiveErase(id, uid){
    if (!lh) return;
    const res = LH_RULES.lhEraseWallWord ? LH_RULES.lhEraseWallWord(lh.words || [], id, uid) : {erased: null, list: lh.words};
    // Host/peers already authorized on their side; still honor an explicit erase of a known id from that uid.
    if (!res.erased && uid){
      const res2 = LH_RULES.lhEraseWallWord(lh.words || [], id, uid);
      lh.words = res2.list;
      if (res2.erased) lhFadeWordMesh(id);
      return;
    }
    lh.words = res.list;
    if (res.erased) lhFadeWordMesh(res.erased.id);
  }
  function lhOpenWrite(){
    if (!lh) return false;
    if (lh.cut || lh.calm || lh.banish) return false;
    const hit = lhLookWallHit();
    if (!hit){ if (typeof toast === 'function') toast('✍️ Face a wall to write on it.'); return false; }
    lh.writeOpen = true;
    lh.writeHit = hit;
    lh.writeSel = lh.writeSel || 0;
    const n = lhEl('lhWrite');
    if (n){ n.style.display = 'flex'; n.classList.add('show'); }
    lhFillWritePanel();
    return true;
  }
  function lhCloseWrite(){
    if (!lh) return;
    lh.writeOpen = false;
    const n = lhEl('lhWrite');
    if (n){ n.classList.remove('show'); n.style.display = 'none'; }
    const inp = lhEl('lhWriteIn');
    try { if (inp) inp.blur(); } catch (e){}
  }
  function lhFillWritePanel(){
    if (!lh) return;
    const presets = (LH_RULES.LH_WALL_PRESETS || ['HELP', 'EXIT', 'GET OUT']);
    const box = lhEl('lhWritePresets');
    if (box){
      box.innerHTML = '';
      presets.forEach((w, i) => {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'lh-wpreset' + (i === (lh.writeSel || 0) ? ' on' : '');
        b.textContent = w;
        b.setAttribute('data-lhword', w);
        b.onclick = () => { lh.writeSel = i; lhPlaceWallWord(w, {hit: lh.writeHit, style: lh.writeStyle}); lhCloseWrite(); };
        box.appendChild(b);
      });
    }
    const canType = lhChatMode() === 'on';
    const custom = lhEl('lhWriteCustom');
    if (custom) custom.style.display = canType ? '' : 'none';
    const hint = lhEl('lhWriteHint');
    if (hint) hint.textContent = canType ? 'Pick a spooky word, or type a short one (12 letters).' : 'Chat is set to presets only — pick a word from the list.';
    const inp = lhEl('lhWriteIn');
    if (inp){ inp.value = ''; inp.maxLength = LH_RULES.LH_WALL_MAX_CHARS || 12; }
    document.querySelectorAll('[data-lhstyle]').forEach(b => {
      b.classList.toggle('on', b.getAttribute('data-lhstyle') === (lh.writeStyle || 'paint'));
    });
  }
  function lhSubmitCustomWord(){
    if (!lh || !lh.writeOpen) return false;
    if (lhChatMode() !== 'on'){ if (typeof toast === 'function') toast('✍️ Chat is set to presets only.'); return false; }
    const inp = lhEl('lhWriteIn');
    const text = inp ? inp.value : '';
    const r = lhPlaceWallWord(text, {hit: lh.writeHit, style: lh.writeStyle});
    if (r && r.ok) lhCloseWrite();
    return !!(r && r.ok);
  }
  function lhTickPrivacy(){
    if (!lh || !lh.rooms || !P) return;
    const viewer = {x: P.x, z: P.z};
    lh.rooms.forEach(R => {
      const vis = LH_RULES.lhRoomInteriorVisible ? LH_RULES.lhRoomInteriorVisible(R, viewer) : true;
      if (R.interior) R.interior.visible = vis;
    });
    const hideOcc = (x, z, g) => {
      if (!g) return;
      const R = (lh.rooms || []).find(r => LH_RULES.lhRoomContains && LH_RULES.lhRoomContains(r, x, z, 0));
      if (!R){ g.visible = true; return; }
      g.visible = !!(LH_RULES.lhRoomInteriorVisible && LH_RULES.lhRoomInteriorVisible(R, viewer));
    };
    (lh.npcs || []).forEach(n => hideOcc(n.x, n.z, n.model && n.model.g));
    if (lh.vesper) hideOcc(lh.vesper.x, lh.vesper.z, lh.vesper.model && lh.vesper.model.g);
    try {
      if (typeof mp !== 'undefined' && mp && mp.ents){
        mp.ents.forEach(E => {
          if (!E) return;
          const x = E.x != null ? E.x : E.tx, z = E.z != null ? E.z : E.tz;
          const g = (E.model && E.model.g) || E.g || E.mesh;
          hideOcc(x, z, g);
        });
      }
    } catch (e){}
    (lh.wordMeshes || []).forEach(item => {
      if (!item || !item.mesh || !item.word) return;
      if (item.fading && item.fade <= 0){ item.mesh.visible = false; return; }
      if (!item.word.interior){ item.mesh.visible = true; return; }
      const R = lh.rooms[item.word.room];
      item.mesh.visible = !R || !!(LH_RULES.lhRoomInteriorVisible && LH_RULES.lhRoomInteriorVisible(R, viewer));
    });
  }

  function lhToggleMap(on){
    if (!lh) return false;
    if (on == null) on = !lh.mapOpen;
    lh.mapOpen = !!on;
    const n = lhEl('lhMap');
    if (n){ n.style.display = on ? 'flex' : 'none'; n.classList.toggle('show', !!on); }
    if (on) lhDrawMap();
    return true;
  }
  function lhDrawMap(){
    if (!lh) return;
    const c = lhEl('lhMapCan');
    if (!c || !c.getContext) return;
    const g = c.getContext('2d');
    const W = c.width, H = c.height;
    const layout = LH_RULES.lhMapLayout ? LH_RULES.lhMapLayout() : {bounds:{x0:-110,x1:55,z0:-105,z1:125},zones:[],tent:{x:0,z:-4,w:56,d:36},midway:{x:0,z:58,w:10,d:88},wagonX:16,wagonZs:[22]};
    const b = layout.bounds;
    const sx = (x) => (x - b.x0) / (b.x1 - b.x0) * W;
    const sy = (z) => (z - b.z0) / (b.z1 - b.z0) * H; // -Z (stage) is the top
    g.fillStyle = '#1c2a16'; g.fillRect(0, 0, W, H);
    g.fillStyle = '#2d5a32'; g.fillRect(0, 0, W, H);
    const rect = (o, fill, stroke) => {
      if (!o) return;
      const x = sx(o.x - o.w / 2), y = sy(o.z - o.d / 2), w = o.w / (b.x1 - b.x0) * W, h = o.d / (b.z1 - b.z0) * H;
      g.fillStyle = fill; g.fillRect(x, y, w, h);
      if (stroke){ g.strokeStyle = stroke; g.lineWidth = 1.5; g.strokeRect(x, y, w, h); }
    };
    (layout.zones || []).forEach(z => {
      rect(z, z.color || '#3a4a30', 'rgba(255,255,255,.35)');
      g.fillStyle = '#fff8f0'; g.font = '11px sans-serif'; g.textAlign = 'center';
      g.fillText(z.name, sx(z.x), sy(z.z) + 4);
    });
    rect(layout.tent, '#c23a3a', '#fff8f0');
    g.fillStyle = '#fff8f0'; g.font = 'bold 12px sans-serif'; g.textAlign = 'center';
    if (layout.tent) g.fillText('Big Top', sx(layout.tent.x), sy(layout.tent.z) + 4);
    rect(layout.midway, '#e8c98a', '#6b3cff');
    g.fillStyle = '#4a2040'; g.font = '11px sans-serif';
    if (layout.midway) g.fillText('Midway', sx(layout.midway.x), sy(layout.midway.z) + 4);
    const zs = layout.wagonZs || [];
    const wx = layout.wagonX || 16;
    zs.forEach((z, i) => {
      [-wx, wx].forEach((x, k) => {
        const id = k ? i + zs.length : i;
        const mine = lh.myRoom === id;
        g.fillStyle = mine ? '#ffd25a' : '#ffb3de';
        g.fillRect(sx(x) - 5, sy(z) - 4, 10, 8);
        if (mine){
          g.strokeStyle = '#fff'; g.lineWidth = 2; g.strokeRect(sx(x) - 6, sy(z) - 5, 12, 10);
          g.fillStyle = '#1d2340'; g.font = 'bold 10px sans-serif'; g.textAlign = 'left';
          g.fillText('Your Wagon', sx(x) + 8, sy(z) + 3);
        }
      });
    });
    // you are here
    if (typeof P !== 'undefined' && P){
      const px = sx(P.x), pz = sy(P.z);
      g.fillStyle = '#ff2a2a';
      g.beginPath(); g.arc(px, pz, 5, 0, Math.PI * 2); g.fill();
      g.strokeStyle = '#fff'; g.lineWidth = 2; g.stroke();
      g.fillStyle = '#fff'; g.font = 'bold 11px sans-serif'; g.textAlign = 'left';
      g.fillText('You are here', px + 8, pz - 6);
    }
  }

  function lanternEnter(){
    const el = lhEl('lhBox'); if (el) el.style.display = '';
    ['lhMeter','lhRoot'].forEach(id => { const n = lhEl(id); if (n) n.style.display = 'block'; });
    if (!window.__lhBound){
      window.__lhBound = true;
      const act = lhEl('lhAct');
      if (act){
        const fire = ev => { if (ev){ try { ev.preventDefault(); ev.stopPropagation(); } catch (e){} } lhAct(); };
        act.onclick = ev => fire(ev);
      }
      const fan = lhEl('lhFanfare'); if (fan) fan.onclick = () => { lhCallHost(true); };
      const setb = lhEl('lhSetBtn'); if (setb) setb.onclick = () => lhToggleSet();
      const mine = lhEl('lhMyWagon'); if (mine) mine.onclick = () => lhGoWagon();
      const mapb = lhEl('lhMapBtn'); if (mapb) mapb.onclick = () => lhToggleMap();
      const mapc = lhEl('lhMapClose'); if (mapc) mapc.onclick = () => lhToggleMap(false);
      const mapo = lhEl('lhMap'); if (mapo) mapo.addEventListener('click', ev => { if (ev.target === mapo) lhToggleMap(false); });
      const wrb = lhEl('lhWriteBtn'); if (wrb) wrb.onclick = () => lhOpenWrite();
      const deb = lhEl('lhDecorBtn'); if (deb) deb.onclick = () => lhOpenDecor();
      const dcl = lhEl('lhDecorClose'); if (dcl) dcl.onclick = () => lhCloseDecor();
      const dpl = lhEl('lhDecorPlace'); if (dpl) dpl.onclick = () => lhPlaceSelectedDecor();
      const dp = lhEl('lhDecor'); if (dp) dp.addEventListener('click', ev => { if (ev.target === dp) lhCloseDecor(); });

      const gcl = lhEl('lhGameClose'); if (gcl) gcl.onclick = () => lhCloseArcade();
      const gp = lhEl('lhGame'); if (gp) gp.addEventListener('click', ev => { if (ev.target === gp) lhCloseArcade(); });
      const bcl = lhEl('lhBoothClose'); if (bcl) bcl.onclick = () => lhCloseBooth();
      const bp = lhEl('lhBooth'); if (bp) bp.addEventListener('click', ev => { if (ev.target === bp) lhCloseBooth(); });

      const wrc = lhEl('lhWriteClose'); if (wrc) wrc.onclick = () => lhCloseWrite();
      const wrp = lhEl('lhWrite'); if (wrp) wrp.addEventListener('click', ev => { if (ev.target === wrp) lhCloseWrite(); });
      const wrgo = lhEl('lhWriteGo'); if (wrgo) wrgo.onclick = () => lhSubmitCustomWord();
      const wrer = lhEl('lhWriteErase'); if (wrer) wrer.onclick = () => { lhEraseMyWord(); lhCloseWrite(); };
      const kno = lhEl('lhKnockOpen'); if (kno) kno.onclick = () => lhKnockReply(true, 'open');
      const knk = lhEl('lhKnockKeep'); if (knk) knk.onclick = () => lhKnockReply(false, 'closed');
      const wrin = lhEl('lhWriteIn');
      if (wrin) wrin.addEventListener('keydown', ev => { if (ev.key === 'Enter'){ ev.preventDefault(); lhSubmitCustomWord(); } if (ev.key === 'Escape'){ ev.preventDefault(); lhCloseWrite(); } });
      document.querySelectorAll('[data-lhstyle]').forEach(b => {
        b.addEventListener('click', () => { if (lh){ lh.writeStyle = b.getAttribute('data-lhstyle') || 'paint'; lhFillWritePanel(); } });
      });
      const drawc = lhEl('lhDrawClose'); if (drawc) drawc.onclick = () => lhCloseDraw();
      const setc = lhEl('lhSetClose'); if (setc) setc.onclick = () => lhToggleSet(false);
      const skip = lhEl('lhSkip'); if (skip) skip.onclick = () => lhSkipCut();
      const cskip = lhEl('lhCalmSkip'); if (cskip) cskip.onclick = () => lhSkipCut();
      document.querySelectorAll('[data-lhstamp]').forEach(b => {
        b.addEventListener('click', () => { lh.stamp = b.getAttribute('data-lhstamp'); lhHud(); });
      });
      document.querySelectorAll('[data-lhcol]').forEach(b => {
        b.addEventListener('click', () => { lh.color = b.getAttribute('data-lhcol'); });
      });
      const wall = lhEl('lhWall');
      if (wall) wall.addEventListener('pointerdown', ev => lhStampAt(ev));
      ['lhVis','lhMuff','lhCanFifty','lhCanAlways','lhCanNever','lhSkipKey'].forEach(id => {
        const n = lhEl(id); if (n) n.addEventListener('change', lhReadSettings);
      });
    }
    try {
      if (typeof cam !== "undefined" && cam){ cam.pitch = 0.18; cam.dist = 8; cam.yaw = 0; }
    } catch (e){}
    try { lhApplyView(); } catch (e){}
    lhHookChat();
    lhWriteSettings();
    // visits
    if (lh && lh.prog){
      if (lh.prog.visits <= 0){ lhAward('lh:welcome'); lh.prog.visits = 1; }
      else { lhAward('lh:back'); lh.prog.visits += 1; }
      lhSaveProg(lh.prog);
    }
    if (lh){
      lh.vesperAt = 40 + Math.random() * 20;
      lh.exitAt = 22;
      lh.keyAt = 16;
      lh.songStayT = 0;
      lh.lastSongAt = null;
      lh.songStayNeed = LH_RULES.lhSongStayNeed ? LH_RULES.lhSongStayNeed(lh.test) : (lh.test === 'song' ? 0.8 : 50);
      lh.songCd = LH_RULES.lhSongCooldown ? LH_RULES.lhSongCooldown(lh.test) : (lh.test === 'song' ? 0 : 180);
      if (lh.test === 'vesper') lh.vesperAt = 0.6;
      if (lh.test === 'exit') lh.exitAt = 0.5;
      if (lh.test === 'cellar'){ lh.keyAt = 99; setTimeout(() => { try { if (lh && lh.test === 'cellar') lhStartBanish(lh.npcs.find(n => n.glitched) || {kind:'me'}); } catch (e){} }, 900); }
    }
    lhHud();
    try { if (typeof chSync === 'function') chSync(); } catch (e){}
  }

  function lanternStop(){
    try {
      ['lhMeter','lhBox','lhRoot','lhCut','lhCalm','lhSet','lhDraw','lhWrite','lhKnock','lhGame','lhBooth','lhDecor','lhVision','lhScare','lhMyWagon','lhMap','lhMapBtn','lhWriteBtn','lhDecorBtn'].forEach(id => {
        const n = lhEl(id); if (!n) return;
        if (id === 'lhMeter' || id === 'lhBox' || id === 'lhRoot') n.style.display = 'none';
        else { n.classList.remove('show'); n.style.display = 'none'; }
      });
      const act = lhEl('lhAct'); if (act) act.classList.remove('show');
    } catch (e){}
    try { lhStopWhisper(); } catch (e){}
    try {
      if (lh && lh._lhCamFov && typeof camera !== 'undefined' && camera){
        camera.fov = lh._lhCamFov; camera.rotation.z = 0;
        if (camera.updateProjectionMatrix) camera.updateProjectionMatrix();
      }
    } catch (e){}
    try { lhCloseArcade(); lhCloseBooth(); lhCloseDecor(); } catch (e){}
    if (lh && lh.riding){ try { lhDismountRide(true); } catch (e){} }
    if (lh && lh.prog) lhSaveProg(lh.prog);
    lh = null;
  }

  function lhHookChat(){
    if (window.__lhChatHook) return;
    window.__lhChatHook = true;
    const wrap = (name, fn) => {
      const prev = window[name];
      if (typeof prev !== 'function') return;
      window[name] = function(){
        const r = prev.apply(this, arguments);
        try { fn(arguments, r); } catch (e){}
        return r;
      };
    };
    wrap('chSend', (args, r) => {
      if (!lh) return;
      const text = (r && r.text != null) ? r.text : (args && args[0]);
      if (r && (r.ok === false) && (r.reason === 'filter' || r.reason === 'block' || r.reason === 'swear')) lhAward('lh:words');
      if (LH_RULES.lhCensored && LH_RULES.lhCensored(text)) lhAward('lh:words');
      else if (r && r.ok) lhOnChat(text, 'me');
    });
    wrap('chFromGuest', (args) => {
      const d = args && args[1];
      if (lh && d && d.text) lhOnChat(d.text, (args[0] && args[0].uid) || d.uid);
    });
    wrap('chFromHost', (args) => {
      const d = args && args[0];
      if (lh && d && d.t === 'chat' && d.text) lhOnChat(d.text, d.uid);
    });
  }

  function lhOnChat(text, uid){
    if (!lh) return;
    if (LH_RULES.lhCensored && LH_RULES.lhCensored(text)){ lhAward('lh:words'); return; }
    if (!(LH_RULES.lhHostNameIn ? LH_RULES.lhHostNameIn(text) : /gleam/i.test(String(text||'')))) return;
    lhCallHost(false, uid);
  }

  function lhUidIsMe(uid){
    if (uid == null || uid === 'me') return true;
    try {
      if (typeof mp !== 'undefined' && mp && mp.on){
        if (uid === mp.me) return true;
        if (mp.host && uid === 'H') return true;
      }
    } catch (e){}
    return false;
  }

  function lhUidIsGlitched(uid){
    if (lhUidIsMe(uid)) return !!(lh && lh.glitched);
    try {
      if (typeof mp !== 'undefined' && mp && mp.ents && uid){
        const E = mp.ents.get ? mp.ents.get(uid) : null;
        if (E && E.lh) return !!E.lh.glitched;
      }
    } catch (e){}
    return false;
  }

  function lhOthers(){
    const out = [];
    if (!lh) return out;
    lh.npcs.forEach(n => out.push({uid:n.id, x:n.x, z:n.z, y:n.y||0, glitched:!!n.glitched, kind:'npc', name:n.name, ref:n}));
    if (lh.vesper && lh.vesper.on) out.push({uid:'vesper', x:lh.vesper.x, z:lh.vesper.z, y:0, glitched:!!lh.vesper.glitched, kind:'vesper', name:'Vesper', ref:lh.vesper});
    try {
      if (typeof mp !== 'undefined' && mp && mp.on && mp.ents){
        const now = performance.now();
        mp.ents.forEach((E, uid) => {
          if (!E || E.m !== 'lantern') return;
          if (now - (E.seen || 0) > 4000) return;
          const st = E.lh || {};
          out.push({uid, x: E.x != null ? E.x : E.tx, z: E.z != null ? E.z : E.tz, y: E.y != null ? E.y : E.ty, glitched: !!st.glitched, kind:'mp', name:(mp.players && mp.players.get && (mp.players.get(uid)||{}).name) || 'Friend', ref:E});
        });
      }
    } catch (e){}
    return out;
  }

  function lhCompanyNear(){
    if (!lh) return {company:false, nearG:false, staring:false, closestG:null, closestN:null};
    const rC = LH_RULES.LH_COMPANY_R || 8, rG = LH_RULES.LH_NEAR_R || 6;
    let company = false, nearG = false, staring = false, closestG = null, bestG = 99, closestN = null, bestN = 99;
    const look = (typeof cam !== 'undefined' && cam && cam.yaw != null) ? cam.yaw : (P && P.face) || 0;
    lhOthers().forEach(o => {
      const d = LH_RULES.lhDist ? LH_RULES.lhDist(P.x, P.z, o.x, o.z) : 99;
      if (!o.glitched && d < bestN){ bestN = d; closestN = o; }
      if (o.glitched && d < bestG){ bestG = d; closestG = o; }
      if (!o.glitched && !lh.glitched && d <= rC) company = true;
      if (o.glitched && d <= rG){
        nearG = true;
        // facing them?
        const ang = Math.atan2(o.x - P.x, o.z - P.z);
        let diff = Math.abs(Math.atan2(Math.sin(ang - look), Math.cos(ang - look)));
        if (diff < 0.7) staring = true;
      }
    });
    return {company, nearG, staring, closestG, closestN, bestG, bestN};
  }

  function lhPlayerArea(){
    if (!lh) return {area:'lobby', room:-1, lit:true, dark:false, bath:false, cellar:false};
    const tentX = LH_RULES.LH_TENT_X || 28;
    const tentZ0 = LH_RULES.LH_TENT_Z0 || -22;
    const tentZ1 = LH_RULES.LH_TENT_Z1 || 14;
    const midX = LH_RULES.LH_MIDWAY_WALL_X || 5.2;
    const midZ0 = LH_RULES.LH_MIDWAY_Z0 || 14;
    const midZ1 = LH_RULES.LH_MIDWAY_Z1 || 102;
    const cellarZ = (lh.cellar && lh.cellar.z) || LH_RULES.LH_CELLAR_Z || 200;
    const woodsX = LH_RULES.LH_WOODS_X || -92;
    if (lh.cellar && P.z > cellarZ - 20) return {area:'cellar', room:-1, lit:false, dark:true, bath:false, cellar:true};
    const bathZ = lh.bathZ != null ? lh.bathZ : (midZ1 + 6);
    if (Math.abs(P.z - bathZ) < 4.2 && Math.abs(P.x) < 6.2) return {area:'bath', room:-1, lit:true, dark:false, bath:true, cellar:false};
    if (P.z < tentZ0 + 6 && P.y > 2) return {area:'ledge', room:-1, lit:true, dark:false, bath:false, cellar:false};
    if (lh.nook && LH_RULES.lhNear(P.x, P.z, lh.nook.x, lh.nook.z, 3.2)) return {area:'nook', room:-1, lit:false, dark:true, bath:false, cellar:false};
    if (lh.funhouse && Math.abs(P.x - lh.funhouse.x) < (lh.funhouse.w / 2) - 0.2 && Math.abs(P.z - lh.funhouse.z) < (lh.funhouse.d / 2) - 0.2)
      return {area:'funhouse', room:-1, lit:true, dark:false, bath:false, cellar:false, funhouse:true};
    if (lh.aquarium && LH_RULES.lhNear(P.x, P.z, lh.aquarium.x, lh.aquarium.z, 5.2))
      return {area:'aquarium', room:-1, lit:true, dark:false, bath:false, cellar:false};
    if (lh.pond && LH_RULES.lhNear(P.x, P.z, lh.pond.x, lh.pond.z, 7))
      return {area:'pond', room:-1, lit:true, dark:false, bath:false, cellar:false};
    for (let i = 0; i < lh.rooms.length; i++){
      const R = lh.rooms[i];
      if (Math.abs(P.x - R.x) < R.w / 2 - 0.1 && Math.abs(P.z - R.z) < R.d / 2 - 0.1){
        const lit = !!R.lit;
        return {area:'room', room:i, lit, dark:!lit, bath:false, cellar:false, R};
      }
    }
    // wagon approach paths count as the lit midway, not the dark grounds
    if (lh.rooms.some(R => Math.abs(P.z - R.z) < 1.5 && Math.abs(P.x) > midX - 1.6 && Math.abs(P.x) < Math.abs(R.x - R.side * (R.w / 2)) + 0.6)){
      return {area:'hall', room:-1, lit:true, dark:false, bath:false, cellar:false};
    }
    if (Math.abs(P.x) < midX && P.z > midZ0 - 0.6 && P.z < midZ1 + 0.6) return {area:'hall', room:-1, lit:true, dark:false, bath:false, cellar:false};
    const insideTent = Math.abs(P.x) < tentX + 0.3 && P.z > tentZ0 - 0.3 && P.z < tentZ1 + 0.3;
    if (insideTent) return {area:'lobby', room:-1, lit:true, dark:false, bath:false, cellar:false};
    const inWoods = P.x < woodsX || (P.z < -78 && P.x < -40);
    const lamp = lhNearALamp(P.x, P.z);
    if (inWoods && !lamp) return {area:'woods', room:-1, lit:false, dark:true, bath:false, cellar:false, outside:true, woods:true};
    return {area:'outside', room:-1, lit:!!lamp, dark:!lamp, bath:false, cellar:false, outside:true};
  }


  function lhRideByKind(kind){
    if (!lh || !lh.rides) return null;
    return lh.rides.find(r => r && r.kind === kind) || null;
  }
  function lhSeatWorld(seat){
    const v = (typeof THREE !== 'undefined') ? new THREE.Vector3() : {x:0,y:0,z:0};
    if (!seat || !seat.mesh || !seat.mesh.updateWorldMatrix) return v;
    try {
      seat.mesh.updateWorldMatrix(true, false);
      seat.mesh.getWorldPosition(v);
      v.y += (seat.sitY || 0.3);
    } catch (e){}
    return v;
  }
  function lhBestSeat(ride, from){
    if (!ride || !ride.seats) return -1;
    const taken = ride.taken || [];
    let best = -1, bestScore = 1e9;
    for (let i = 0; i < ride.seats.length; i++){
      if (taken[i]) continue;
      const w = lhSeatWorld(ride.seats[i]);
      let score;
      if (ride.kind === 'ferris') score = w.y;
      else if (from){
        const dx = w.x - from.x, dz = w.z - from.z;
        score = Math.sqrt(dx*dx + dz*dz);
      } else score = i;
      if (score < bestScore){ bestScore = score; best = i; }
    }
    return best;
  }
  function lhNearRide(){
    if (!lh || !lh.rides || typeof P === 'undefined' || !P) return null;
    let best = null, bestD = 99;
    lh.rides.forEach(r => {
      if (!r) return;
      const d = LH_RULES.lhDist ? LH_RULES.lhDist(P.x, P.z, r.x, r.z) : 99;
      if (d <= (r.boardR || 4) && d < bestD){ bestD = d; best = r; }
    });
    return best;
  }
  function lhClearSeat(kind, seat, uid){
    const ride = lhRideByKind(kind);
    if (!ride) return;
    ride.taken = ride.taken || [];
    if (uid){
      if (ride.taken[seat] === uid) ride.taken[seat] = null;
      for (let i = 0; i < (ride.seats || []).length; i++){
        if (ride.taken[i] === uid && i !== seat) ride.taken[i] = null;
      }
    } else if (seat != null) ride.taken[seat] = null;
  }
  function lhBoardRide(ride, seatIdx){
    if (!lh || !ride) return false;
    if (lh.riding) lhDismountRide(true);
    const seat = (seatIdx == null) ? lhBestSeat(ride, P) : seatIdx;
    const ok = LH_RULES.lhRideBoardOk ? LH_RULES.lhRideBoardOk({near: true, alreadyOn: false, seat: seat}) : {ok: seat >= 0, seat: seat};
    if (!ok.ok){
      if (ok.reason === 'full' && typeof toast === 'function') toast('🎟️ Every seat is taken — wait for a spin!');
      return false;
    }
    ride.taken = ride.taken || [];
    ride.taken[ok.seat] = 'me';
    lh.riding = {kind: ride.kind, seat: ok.seat, name: ride.name || ride.kind};
    try { lhApplyLocalRide(); } catch (e){}
    try {
      lh.prog = lh.prog || lhProg();
      const was = (lh.prog.rides && lh.prog.rides[ride.kind]);
      const prog = LH_RULES.lhRideProgress ? LH_RULES.lhRideProgress(lh.prog.rides, ride.kind) : {rides: Object.assign({}, lh.prog.rides || {}, {[ride.kind]: true}), first: !was, all: false};
      lh.prog.rides = prog.rides;
      lhSaveProg(lh.prog);
      if (!was) lhAward('lh:ride');
      if (prog.all) lhAward('lh:rides');
    } catch (e){}
    try { lhNet({k:'ride', kind: ride.kind, seat: ok.seat, on: true}); } catch (e){}
    if (typeof toast === 'function') toast((ride.kind === 'ferris' ? '🎡' : ride.kind === 'carousel' ? '🎠' : '🎪') + ' Hopped on the ' + (ride.name || 'ride') + '! E / X to hop off.');
    return true;
  }
  function lhDismountRide(silent){
    if (!lh || !lh.riding) return false;
    const kind = lh.riding.kind, seat = lh.riding.seat;
    const ride = lhRideByKind(kind);
    lhClearSeat(kind, seat, 'me');
    const ex = (LH_RULES.lhRideExitPoint ? LH_RULES.lhRideExitPoint(ride || {kind: kind, x: P && P.x, z: P && P.z}) : {x: (ride && ride.x || 0) + 4, y: 0.12, z: (ride && ride.z || 0)});
    try {
      if (typeof P !== 'undefined' && P){
        P.x = ex.x; P.y = ex.y; P.z = ex.z;
        P.vx = 0; P.vy = 0; P.vz = 0;
        P.onGround = true;
      }
    } catch (e){}
    lh.riding = null;
    try { lhNet({k:'ride', kind: kind, seat: seat, on: false}); } catch (e){}
    if (!silent && typeof toast === 'function') toast('👋 Hopped off.');
    return true;
  }
  function lhApplyLocalRide(){
    if (!lh || !lh.riding || typeof P === 'undefined' || !P) return;
    const ride = lhRideByKind(lh.riding.kind);
    if (!ride || !ride.seats || !ride.seats[lh.riding.seat]){ lhDismountRide(true); return; }
    const v = lhSeatWorld(ride.seats[lh.riding.seat]);
    P.x = v.x; P.y = v.y; P.z = v.z;
    P.vx = 0; P.vy = 0; P.vz = 0;
    P.onGround = true;
    try { if (typeof onGround !== 'undefined') onGround = true; } catch (e){}
  }
  function lhMyUid(){
    try { return (typeof mp !== 'undefined' && mp && (mp.host ? 'H' : (mp.me || 'g0'))) || 'me'; } catch (e){ return 'me'; }
  }
  function lhApplyRemoteRide(uid, info){
    if (!lh || !uid || uid === 'me' || uid === lhMyUid()) return;
    const on = !!(info && (info.on !== false) && info.kind != null && info.seat != null);
    lh.rides.forEach(r => {
      if (!r) return;
      r.taken = r.taken || [];
      for (let i = 0; i < (r.seats || []).length; i++){
        if (r.taken[i] === uid) r.taken[i] = null;
      }
    });
    if (on){
      const ride = lhRideByKind(info.kind);
      if (ride){ ride.taken = ride.taken || []; ride.taken[info.seat] = uid; }
    }
    try {
      if (typeof mp !== 'undefined' && mp && mp.ents){
        const E = mp.ents.get(uid);
        if (E){
          E.lh = E.lh || {};
          E.lh.ride = on ? {kind: info.kind, seat: info.seat} : null;
        }
      }
    } catch (e){}
  }
  function lhSnapRemoteRiders(){
    if (!lh || !lh.rides) return;
    try {
      if (typeof mp === 'undefined' || !mp || !mp.ents) return;
      mp.ents.forEach((E, uid) => {
        const rideInfo = E && E.lh && E.lh.ride;
        if (!rideInfo) return;
        const ride = lhRideByKind(rideInfo.kind);
        if (!ride || !ride.seats || !ride.seats[rideInfo.seat]) return;
        const v = lhSeatWorld(ride.seats[rideInfo.seat]);
        if (E.model && E.model.g) E.model.g.position.set(v.x, v.y, v.z);
        if (E.x != null){ E.x = v.x; E.y = v.y; E.z = v.z; }
      });
    } catch (e){}
  }
  function lhTickRides(dt){
    if (!lh || !lh.rides) return;
    lh.rides.forEach(r => {
      if (!r) return;
      const spin = r.wheel || r.g;
      if (!spin) return;
      if (r.kind === 'ferris'){
        spin.rotation.z += dt * 0.35;
        (r.seats || []).forEach(s => { if (s && s.mesh) s.mesh.rotation.z = -spin.rotation.z; });
      } else if (r.kind === 'carousel'){
        spin.rotation.y += dt * 0.6;
        (r.seats || []).forEach((s, i) => {
          if (!s || !s.mesh) return;
          s.mesh.position.y = (s.baseY || 0.85) + Math.sin(((lh.t || 0) * 2.4) + i) * 0.18;
        });
      } else if (r.kind === 'swing'){
        spin.rotation.y += dt * 0.9;
      }
    });
    if (lh.riding) lhApplyLocalRide();
    lhSnapRemoteRiders();
  }


  function lhTickets(){
    try { return Math.max(0, ((lh && lh.prog && lh.prog.tickets) | 0)); } catch (e){ return 0; }
  }
  function lhGiveTickets(n, why){
    n = Math.max(0, n | 0);
    if (!lh) return 0;
    lh.prog = lh.prog || lhProg();
    if (n > 0){
      lh.prog.tickets = Math.max(0, (lh.prog.tickets | 0) + n);
      lhSaveProg(lh.prog);
      lhAward('lh:tickets');
      if (typeof toast === 'function') toast('🎟️ +' + n + ' prize ticket' + (n === 1 ? '' : 's') + (why ? ' — ' + why : '') + '!');
    } else if (typeof toast === 'function') toast('🎟️ No tickets this time — try again!');
    return n;
  }
  function lhNearGame(){
    if (!lh || !lh.games || typeof P === 'undefined' || !P) return null;
    let best = null, bestD = 99;
    lh.games.forEach(g => {
      const d = LH_RULES.lhDist ? LH_RULES.lhDist(P.x, P.z, g.x, g.z) : 99;
      if (d <= (g.r || 2.4) && d < bestD){ bestD = d; best = g; }
    });
    return best;
  }
  function lhNearBooth(){
    if (!lh || !lh.booth || typeof P === 'undefined' || !P) return false;
    return !!(LH_RULES.lhNear && LH_RULES.lhNear(P.x, P.z, lh.booth.x, lh.booth.z, lh.booth.r || 2.8));
  }
  function lhCloseArcade(){
    if (!lh) return;
    lh.arcade = null;
    const n = lhEl('lhGame');
    if (n){ n.classList.remove('show'); n.style.display = 'none'; }
  }
  function lhCloseBooth(){
    if (!lh) return;
    lh.boothOpen = false;
    const n = lhEl('lhBooth');
    if (n){ n.classList.remove('show'); n.style.display = 'none'; }
  }
  function lhOpenBooth(){
    if (!lh) return false;
    if (lh.arcade) lhCloseArcade();
    lh.boothOpen = true;
    lh.boothSel = 0;
    const n = lhEl('lhBooth');
    if (n){ n.style.display = 'flex'; n.classList.add('show'); }
    lhFillBooth();
    return true;
  }
  function lhFillBooth(){
    if (!lh) return;
    const prizes = (LH_RULES.LH_PRIZES || []);
    const owned = (lh.prog && lh.prog.prizes) || {};
    const wear = (lh.prog && lh.prog.wear) || {};
    const bal = lhEl('lhBoothBal');
    if (bal) bal.textContent = lhTickets() + ' ticket' + (lhTickets() === 1 ? '' : 's') + ' in your pocket';
    const list = lhEl('lhBoothList');
    if (!list) return;
    list.innerHTML = '';
    prizes.forEach((p, i) => {
      const b = document.createElement('button');
      b.type = 'button';
      const have = !!owned[p.id];
      const on = (lh.boothSel || 0) === i;
      const wearing = !!(p.slot && wear[p.slot] === p.id);
      b.className = 'lh-prize' + (have ? ' owned' : '') + (on ? ' on' : '') + (wearing ? ' wear' : '');
      b.innerHTML = '<div class="nm">' + (p.emoji || '') + ' ' + p.name + '</div><div class="ds">' + (p.desc || '') + '</div><div class="cs">' + (have ? (wearing ? 'Wearing — tap to take off' : (p.kind === 'cosmetic' ? 'Owned — tap to wear' : 'Owned')) : ('🎟️ ' + p.cost + ' tickets')) + '</div>';
      b.onclick = () => { lh.boothSel = i; if (have && p.kind === 'cosmetic') lhWearPrize(p.id); else if (!have) lhBuyAtBooth(p.id); else lhFillBooth(); };
      list.appendChild(b);
    });
  }
  function lhBuyAtBooth(id){
    if (!lh) return false;
    lh.prog = lh.prog || lhProg();
    const res = LH_RULES.lhBuyPrize ? LH_RULES.lhBuyPrize({tickets: lh.prog.tickets, prizes: lh.prog.prizes}, id) : {ok:false, reason:'unknown'};
    if (!res.ok){
      if (typeof toast === 'function') toast(res.reason === 'cost' ? '🎟️ Need more tickets for that one.' : res.reason === 'owned' ? 'You already have that prize!' : 'That prize is not at the booth.');
      lhFillBooth();
      return false;
    }
    lh.prog.tickets = res.tickets;
    lh.prog.prizes = res.prizes;
    lhSaveProg(lh.prog);
    lhAward('lh:prize');
    if (typeof toast === 'function') toast((res.prize && res.prize.emoji ? res.prize.emoji + ' ' : '') + 'You got the ' + (res.prize && res.prize.name || 'prize') + '!');
    if (res.prize && res.prize.kind === 'cosmetic') lhWearPrize(res.prize.id, true);
    else lhFillBooth();
    return true;
  }
  function lhWearPrize(id, forceOn){
    if (!lh) return false;
    lh.prog = lh.prog || lhProg();
    if (!(lh.prog.prizes && lh.prog.prizes[id]) && !forceOn) return false;
    const res = LH_RULES.lhEquipCosmetic ? LH_RULES.lhEquipCosmetic(lh.prog.wear, id) : {ok:false};
    if (!res.ok) return false;
    if (forceOn && res.equipped !== id){
      const again = LH_RULES.lhEquipCosmetic(res.wear, id);
      lh.prog.wear = again.wear;
    } else lh.prog.wear = res.wear;
    lhSaveProg(lh.prog);
    if (typeof toast === 'function'){
      const prize = LH_RULES.lhPrizeById && LH_RULES.lhPrizeById(id);
      toast(lh.prog.wear && prize && lh.prog.wear[prize.slot || 'hat'] === id ? ('You put on the ' + prize.name + '!') : 'Taken off.');
    }
    lhFillBooth();
    return true;
  }
  function lhOpenGame(id){
    if (!lh) return false;
    if (lh.boothOpen) lhCloseBooth();
    const spec = (LH_RULES.LH_CARNIVAL_GAMES || []).find(g => g.id === id) || (lh.games || []).find(g => g.id === id);
    if (!spec) return false;
    const now = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
    const cd = (lh.gameCd && lh.gameCd[id]) || 0;
    if (now < cd){
      if (typeof toast === 'function') toast('⏳ This booth is resetting — try again in a moment.');
      return false;
    }
    const arcade = {id: spec.id, name: spec.name || id, emoji: spec.emoji || '🎟️', t: 0, over: false, sel: 0, score: 0, left: spec.throws || 0};
    if (spec.id === 'rings'){ arcade.left = 3; arcade.pegs = [false, false, false]; arcade.sel = 1; }
    if (spec.id === 'darts'){ arcade.left = 5; arcade.pops = [false,false,false,false,false,false,false,false,false,false,false,false]; }
    if (spec.id === 'ducks'){ arcade.picked = -1; arcade.sel = 2; arcade.left = 1; }
    if (spec.id === 'whack'){ arcade.leftTime = 12; arcade.lit = -1; arcade.litT = 0; arcade.hits = 0; }
    lh.arcade = arcade;
    const n = lhEl('lhGame');
    if (n){ n.style.display = 'flex'; n.classList.add('show'); }
    const title = lhEl('lhGameTitle');
    if (title) title.textContent = (arcade.emoji ? arcade.emoji + ' ' : '') + arcade.name;
    const hint = lhEl('lhGameHint');
    if (hint){
      hint.textContent = arcade.id === 'rings' ? 'Move with arrows or the stick, then tap / A / X to toss a ring. 3 throws.'
        : arcade.id === 'darts' ? 'Tap a balloon or highlight one and press A / X. 5 darts.'
        : arcade.id === 'ducks' ? 'Pick a duck! Tap one, or move and press A / X.'
        : 'Whack the glowing pad — tap it, or move and press A / X. 12 seconds!';
    }
    lhPaintGame();
    return true;
  }
  function lhPaintGame(){
    const a = lh && lh.arcade;
    const body = lhEl('lhGameBody');
    const score = lhEl('lhGameScore');
    if (!a || !body) return;
    if (a.over){
      body.innerHTML = '<div style="text-align:center;font-weight:900;font-size:22px;padding:24px 8px">' + (a.endMsg || 'All done!') + '</div>';
      if (score) score.textContent = a.won != null ? ('🎟️ +' + a.won + ' tickets') : '';
      return;
    }
    const btn = (cls, i, label, extra) => '<button type="button" class="' + cls + (a.sel === i ? ' on' : '') + (extra || '') + '" data-i="' + i + '">' + label + '</button>';
    if (a.id === 'rings'){
      body.innerHTML = '<div class="lh-pegs">' + [0,1,2].map(i => btn('lh-peg', i, a.pegs[i] ? '⭕' : '🍾', a.pegs[i] ? ' hit' : '')).join('') + '</div>';
      if (score) score.textContent = (3 - a.left) + '/3 throws  ·  ' + a.score + ' on the bottles';
    } else if (a.id === 'darts'){
      const darts = '🎯'.repeat(a.left) + '·'.repeat(Math.max(0, 5 - a.left));
      body.innerHTML = '<div class="lh-darts">' + darts + '</div><div class="lh-balloons">' + a.pops.map((p,i) => btn('lh-balloon', i, p ? '💥' : '🎈', p ? ' popped' : '')).join('') + '</div>';
      if (score) score.textContent = a.score + ' popped  ·  ' + a.left + ' dart' + (a.left===1?'':'s') + ' left';
    } else if (a.id === 'ducks'){
      const faces = ['🦆','🐥','🦆','🐤','🦆'];
      body.innerHTML = '<div class="lh-ducks">' + faces.map((f,i) => btn('lh-duck', i, f)).join('') + '</div>';
      if (score) score.textContent = 'Pick a duck and see how many tickets it hid!';
    } else if (a.id === 'whack'){
      body.innerHTML = '<div class="lh-holes">' + [0,1,2,3,4,5].map(i => btn('lh-hole', i, a.lit === i ? '✨' : '•', a.lit === i ? ' lit' : '')).join('') + '</div>';
      if (score) score.textContent = a.hits + ' hits  ·  ' + Math.ceil(Math.max(0, a.leftTime)) + 's left';
    }
    body.querySelectorAll('button[data-i]').forEach(b => {
      b.onclick = () => { a.sel = +b.getAttribute('data-i'); lhGameFire(a.sel); };
    });
  }
  function lhGameFire(i){
    const a = lh && lh.arcade;
    if (!a || a.over) return;
    if (i == null) i = a.sel || 0;
    a.sel = i;
    if (a.id === 'rings'){
      if (a.left <= 0) return;
      a.left--;
      if (!a.pegs[i]){ a.pegs[i] = true; a.score++; }
      if (a.left <= 0 || a.score >= 3) lhFinishGame();
      else lhPaintGame();
    } else if (a.id === 'darts'){
      if (a.left <= 0) return;
      if (a.pops[i]){ lhPaintGame(); return; }
      a.pops[i] = true; a.score++; a.left--;
      if (a.left <= 0 || a.score >= 12) lhFinishGame();
      else lhPaintGame();
    } else if (a.id === 'ducks'){
      if (a.picked >= 0) return;
      a.picked = i;
      lhFinishGame();
    } else if (a.id === 'whack'){
      if (a.lit === i){ a.hits++; a.score = a.hits; a.lit = -1; a.litT = 0.12; lhPaintGame(); }
    }
  }
  function lhFinishGame(){
    const a = lh && lh.arcade;
    if (!a || a.over) return;
    a.over = true;
    const score = a.id === 'whack' ? a.hits : a.score;
    const won = LH_RULES.lhGameTickets ? LH_RULES.lhGameTickets(a.id, score) : score;
    a.won = lhGiveTickets(won, a.name);
    a.endMsg = a.won > 0 ? ('Nice! You won ' + a.won + ' ticket' + (a.won===1?'':'s') + '!') : 'So close — have another go!';
    const now = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
    lh.gameCd = lh.gameCd || {};
    lh.gameCd[a.id] = now + 3500;
    lhPaintGame();
  }
  function lhGameMove(dx, dy){
    const a = lh && lh.arcade;
    if (!a || a.over) return;
    const cols = a.id === 'darts' ? 4 : a.id === 'whack' ? 3 : a.id === 'ducks' ? 5 : 3;
    const count = a.id === 'darts' ? 12 : a.id === 'whack' ? 6 : a.id === 'ducks' ? 5 : 3;
    let i = a.sel || 0;
    const x = i % cols, y = (i / cols) | 0;
    const nx = Math.max(0, Math.min(cols - 1, x + (dx || 0)));
    const rows = Math.ceil(count / cols);
    const ny = Math.max(0, Math.min(rows - 1, y + (dy || 0)));
    const next = Math.max(0, Math.min(count - 1, ny * cols + nx));
    a.sel = next;
    lhPaintGame();
  }
  function lhTickArcade(dt){
    const a = lh && lh.arcade;
    if (!a || a.over) return;
    a.t += dt;
    if (a.id === 'whack'){
      a.leftTime -= dt;
      a.litT -= dt;
      if (a.leftTime <= 0){ a.score = a.hits; lhFinishGame(); return; }
      if (a.litT <= 0){
        if (a.lit >= 0 && Math.random() < 0.55) a.lit = -1;
        else {
          let n = (Math.random() * 6) | 0;
          if (n === a.lit) n = (n + 1 + ((Math.random()*5)|0)) % 6;
          a.lit = n;
        }
        a.litT = 0.45 + Math.random() * 0.45;
        lhPaintGame();
      }
    }
  }


  function lhStyleOf(R){
    if (!R) return (LH_RULES.lhNormalizeStyle ? LH_RULES.lhNormalizeStyle({}) : {wall:'plain', floor:'wood'});
    const mine = R.owner === 'me' && lh && lh.prog;
    const raw = mine ? lh.prog.wagonStyle : (R.netStyle || {});
    return LH_RULES.lhNormalizeStyle ? LH_RULES.lhNormalizeStyle(raw) : (raw || {wall:'plain', floor:'wood'});
  }
  function lhItemsOf(R){
    if (!R) return [];
    const raw = (R.owner === 'me' && lh && lh.prog) ? lh.prog.decor : (R.netDecor || []);
    return LH_RULES.lhNormalizeDecor ? LH_RULES.lhNormalizeDecor(raw) : (raw || []);
  }
  function lhDecorTex(kind, style, base){
    lh._tex = lh._tex || {};
    const key = 'sty-' + kind + '-' + style + '-' + (base || '');
    if (lh._tex[key]) return lh._tex[key];
    try {
      const c = document.createElement('canvas'); c.width = 64; c.height = 64;
      const g = c.getContext('2d');
      g.fillStyle = base || (kind === 'floor' ? '#e8c98a' : '#fff1f8');
      g.fillRect(0, 0, 64, 64);
      if (style === 'stripe'){
        for (let i = 0; i < 8; i++){ g.fillStyle = i % 2 ? '#e31c23' : '#fff8f0'; g.fillRect(i * 8, 0, 8, 64); }
      } else if (style === 'stars' || style === 'star'){
        g.fillStyle = kind === 'floor' ? '#2a1848' : '#2a2060';
        g.fillRect(0, 0, 64, 64);
        g.fillStyle = '#ffd25a';
        [[8,10],[24,28],[40,12],[52,36],[16,48],[36,52],[56,18]].forEach(p => { g.beginPath(); g.arc(p[0], p[1], 2.4, 0, Math.PI*2); g.fill(); });
      } else if (style === 'dots'){
        const cols = ['#ff6b9a', '#3a86ff', '#ffd25a', '#2ec27e', '#6b3cff'];
        for (let i = 0; i < 16; i++){ g.fillStyle = cols[i % cols.length]; g.beginPath(); g.arc(8 + (i%4)*16, 8 + ((i/4)|0)*16, 4, 0, Math.PI*2); g.fill(); }
      } else if (style === 'check'){
        for (let y = 0; y < 4; y++) for (let x = 0; x < 4; x++){ g.fillStyle = (x+y)%2 ? '#e31c23' : '#fff8f0'; g.fillRect(x*16, y*16, 16, 16); }
      } else if (style === 'wood'){
        g.fillStyle = '#c9844a'; g.fillRect(0,0,64,64);
        g.strokeStyle = 'rgba(80,40,16,.45)'; g.lineWidth = 2;
        for (let y = 8; y < 64; y += 16){ g.beginPath(); g.moveTo(0,y); g.lineTo(64,y); g.stroke(); }
      }
      const tex = new THREE.CanvasTexture(c);
      tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
      tex.repeat.set(kind === 'floor' ? 4 : 2, kind === 'floor' ? 3 : 2);
      tex.needsUpdate = true;
      lh._tex[key] = tex;
      return tex;
    } catch (e){ return null; }
  }
  function lhTintMesh(mesh, color, tex){
    if (!mesh || !mesh.material) return;
    const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    mats.forEach(m => {
      if (!m) return;
      if (tex){ m.map = tex; if (m.color) m.color.set('#ffffff'); }
      else { m.map = null; if (m.color && color) m.color.set(color); }
      m.needsUpdate = true;
    });
  }
  function lhApplyWagonStyle(R, style){
    if (!R) return;
    const st = style || lhStyleOf(R);
    const wallTex = (st.wall && st.wall !== 'plain') ? lhDecorTex('wall', st.wall, R.baseWall) : null;
    const floorTex = (st.floor && st.floor !== 'plain') ? lhDecorTex('floor', st.floor, R.baseFloor) : null;
    (R.wallMeshes || []).forEach(m => lhTintMesh(m, st.wall === 'plain' ? R.baseWall : '#ffffff', wallTex));
    if (R.floorMesh) lhTintMesh(R.floorMesh, st.floor === 'plain' ? R.baseFloor : '#ffffff', floorTex);
  }
  function lhDecorSpec(id){
    const cat = LH_RULES.lhDecorCatalog ? LH_RULES.lhDecorCatalog((lh && lh.prog && lh.prog.prizes) || {}) : (LH_RULES.LH_STARTER_DECOR || []);
    return cat.find(p => p.id === id) || (LH_RULES.lhPrizeById && LH_RULES.lhPrizeById(id)) || {id: id, name: 'Decor', emoji:'🛋️'};
  }
  function lhMakeDecorMesh(spec, rot){
    const col = ({
      'start-stool':'#8a4a20', 'start-cushion':'#ff6b9a', 'start-crate':'#c9844a', 'start-mat':'#6b3cff',
      'start-picture':'#fff8f0', 'start-lamp':'#ffd25a', 'plush-glow':'#7cffd0', 'plush-tent':'#e31c23',
      'plush-horse':'#ff8ad8', 'decor-lamp':'#ffb347', 'decor-bunting':'#3a86ff', 'decor-rug':'#6b3cff',
      'decor-jar':'#ff6b9a', 'decor-lights':'#ffe27a', 'decor-plant':'#2ec27e', 'decor-poster':'#fff6d8'
    })[spec && spec.id] || '#ffd25a';
    const g = new THREE.Group();
    const box = (w,h,d,c,y) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w,h,d), lhMat(c)); m.position.y = y == null ? h/2 : y; g.add(m); return m; };
    const id = spec && spec.id;
    if (id === 'start-stool'){ box(0.55, 0.18, 0.55, col, 0.45); box(0.1, 0.45, 0.1, '#5a3010', 0.22); }
    else if (id === 'start-cushion'){ box(0.7, 0.2, 0.7, col, 0.12); }
    else if (id === 'start-crate'){ box(0.6, 0.5, 0.6, col, 0.25); }
    else if (id === 'start-mat' || id === 'decor-rug'){ box(1.2, 0.05, 0.8, col, 0.03); }
    else if (id === 'start-picture' || id === 'decor-poster'){ box(0.7, 0.55, 0.06, col, 1.15); }
    else if (id === 'start-lamp' || id === 'decor-lamp'){ box(0.16, 0.5, 0.16, '#fff8f0', 0.4); box(0.28, 0.22, 0.28, col, 0.72); }
    else if (id === 'plush-glow' || id === 'plush-tent' || id === 'plush-horse'){ box(0.45, 0.42, 0.32, col, 0.24); }
    else if (id === 'decor-jar'){ box(0.28, 0.36, 0.28, col, 0.22); }
    else if (id === 'decor-plant'){ box(0.22, 0.2, 0.22, '#8a4a20', 0.1); box(0.4, 0.45, 0.4, col, 0.42); }
    else if (id === 'decor-bunting' || id === 'decor-lights'){ box(1.4, 0.12, 0.08, col, 1.35); }
    else { box(0.45, 0.45, 0.45, col, 0.22); }
    g.rotation.y = (rot || 0) * Math.PI / 2;
    return g;
  }
  function lhRebuildDecor(R){
    if (!R || !R.decorG) return;
    while (R.decorG.children.length){ const ch = R.decorG.children[0]; R.decorG.remove(ch); try { if (ch.geometry) ch.geometry.dispose(); } catch (e){} }
    const items = lhItemsOf(R);
    items.forEach(it => {
      const spec = lhDecorSpec(it.item);
      const mesh = lhMakeDecorMesh(spec, it.rot);
      mesh.position.set(R.x + it.x, R.floorY || lhY('wagon'), R.z + it.z);
      mesh.userData = {lhDecorId: it.id, item: it.item};
      R.decorG.add(mesh);
    });
    // decor stays inside the interior group so a closed door hides it
    if (R.interior && R.decorG.parent !== R.interior) R.interior.add(R.decorG);
  }
  function lhSyncMyDecor(){
    if (!lh) return;
    const R = lh.rooms && lh.rooms[lh.myRoom];
    if (!R || R.owner !== 'me') return;
    try { lhNet({k:'decor', room: R.id, items: lh.prog.decor || [], style: lh.prog.wagonStyle || {}}); } catch (e){}
  }
  function lhSaveDecor(){
    if (!lh) return;
    lh.prog = lh.prog || lhProg();
    lh.prog.decor = LH_RULES.lhNormalizeDecor ? LH_RULES.lhNormalizeDecor(lh.prog.decor) : (lh.prog.decor || []);
    lh.prog.wagonStyle = LH_RULES.lhNormalizeStyle ? LH_RULES.lhNormalizeStyle(lh.prog.wagonStyle) : (lh.prog.wagonStyle || {});
    lhSaveProg(lh.prog);
    const R = lh.rooms && lh.rooms[lh.myRoom];
    if (R){ lhApplyWagonStyle(R); lhRebuildDecor(R); }
    lhSyncMyDecor();
  }
  function lhCloseDecor(){
    if (!lh) return;
    lh.decorOpen = false;
    const n = lhEl('lhDecor');
    if (n){ n.classList.remove('show'); n.style.display = 'none'; }
  }
  function lhOpenDecor(){
    if (!lh) return false;
    const R = lh.rooms && lh.rooms[lh.myRoom];
    if (!R || R.owner !== 'me'){ if (typeof toast === 'function') toast('🛋️ Decorate your own wagon.'); return false; }
    if (lh.arcade) lhCloseArcade();
    if (lh.boothOpen) lhCloseBooth();
    lh.decorOpen = true;
    const n = lhEl('lhDecor');
    if (n){ n.style.display = 'flex'; n.classList.add('show'); }
    lhFillDecor();
    return true;
  }
  function lhFillDecor(){
    if (!lh) return;
    lh.prog = lh.prog || lhProg();
    const style = LH_RULES.lhNormalizeStyle ? LH_RULES.lhNormalizeStyle(lh.prog.wagonStyle) : (lh.prog.wagonStyle || {});
    const cat = LH_RULES.lhDecorCatalog ? LH_RULES.lhDecorCatalog(lh.prog.prizes || {}) : (LH_RULES.LH_STARTER_DECOR || []);
    if (lh.decorSel == null || lh.decorSel >= cat.length) lh.decorSel = 0;
    const paint = (el, list, cur, kind) => {
      if (!el) return;
      el.innerHTML = '';
      list.forEach(s => {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = (cur === s.id) ? 'on' : '';
        b.textContent = s.name;
        b.onclick = () => {
          lh.prog.wagonStyle = Object.assign({}, style, kind === 'wall' ? {wall:s.id} : {floor:s.id});
          lhAward('lh:decor');
          lhSaveDecor();
          lhFillDecor();
        };
        el.appendChild(b);
      });
    };
    paint(lhEl('lhWallStyles'), LH_RULES.LH_WALL_STYLES || [], style.wall, 'wall');
    paint(lhEl('lhFloorStyles'), LH_RULES.LH_FLOOR_STYLES || [], style.floor, 'floor');
    const inv = lhEl('lhDecorInv');
    if (inv){
      inv.innerHTML = '';
      cat.forEach((s, i) => {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = (lh.decorSel === i) ? 'on' : '';
        b.textContent = (s.emoji || '') + ' ' + s.name;
        b.onclick = () => { lh.decorSel = i; lhFillDecor(); };
        inv.appendChild(b);
      });
    }
    const list = lhEl('lhDecorList');
    if (list){
      list.innerHTML = '';
      const items = LH_RULES.lhNormalizeDecor ? LH_RULES.lhNormalizeDecor(lh.prog.decor) : (lh.prog.decor || []);
      if (!items.length){ list.textContent = 'Nothing placed yet — pick an item and place it in front of you.'; list.style.fontWeight = '700'; }
      items.forEach(it => {
        const spec = lhDecorSpec(it.item);
        const row = document.createElement('div');
        row.className = 'lh-drow';
        row.innerHTML = '<div class="nm">' + (spec.emoji || '🛋️') + ' ' + (spec.name || it.item) + '</div>';
        const mk = (label, fn) => { const b = document.createElement('button'); b.type='button'; b.textContent=label; b.onclick=fn; row.appendChild(b); };
        mk('🔄', () => { const r = LH_RULES.lhDecorRotate(lh.prog.decor, it.id); if (r.ok){ lh.prog.decor = r.items; lhAward('lh:decor'); lhSaveDecor(); lhFillDecor(); } });
        mk('Move here', () => { const pos = lhDecorFront(); const r = LH_RULES.lhDecorMove(lh.prog.decor, it.id, pos.x, pos.z); if (r.ok){ lh.prog.decor = r.items; lhSaveDecor(); lhFillDecor(); } });
        mk('Remove', () => { const r = LH_RULES.lhDecorRemove(lh.prog.decor, it.id); lh.prog.decor = r.items; lhSaveDecor(); lhFillDecor(); });
        list.appendChild(row);
      });
    }
  }
  function lhDecorFront(){
    const R = lh && lh.rooms && lh.rooms[lh.myRoom];
    let yaw = 0;
    try { if (typeof cam !== 'undefined' && cam && cam.yaw != null) yaw = cam.yaw; } catch (e){}
    const px = (typeof P !== 'undefined' && P) ? P.x : (R && R.x || 0);
    const pz = (typeof P !== 'undefined' && P) ? P.z : (R && R.z || 0);
    const fx = px - Math.sin(yaw) * 1.3;
    const fz = pz - Math.cos(yaw) * 1.3;
    const dx = fx - (R && R.x || 0);
    const dz = fz - (R && R.z || 0);
    return LH_RULES.lhDecorClamp ? LH_RULES.lhDecorClamp(dx, dz, (R && R.w) || 8, (R && R.d) || 6.2, 1.1) : {x:dx, z:dz};
  }
  function lhPlaceSelectedDecor(){
    if (!lh) return false;
    lh.prog = lh.prog || lhProg();
    const cat = LH_RULES.lhDecorCatalog ? LH_RULES.lhDecorCatalog(lh.prog.prizes || {}) : (LH_RULES.LH_STARTER_DECOR || []);
    const spec = cat[lh.decorSel || 0];
    if (!spec) return false;
    const pos = lhDecorFront();
    const r = LH_RULES.lhDecorPlace ? LH_RULES.lhDecorPlace(lh.prog.decor, spec.id, pos.x, pos.z, 0) : {ok:false};
    if (!r.ok){
      if (typeof toast === 'function') toast(r.reason === 'full' ? '🛋️ Your wagon is full — remove something first.' : 'Could not place that.');
      return false;
    }
    lh.prog.decor = r.items;
    lhAward('lh:decor');
    lhSaveDecor();
    lhFillDecor();
    if (typeof toast === 'function') toast((spec.emoji || '🛋️') + ' Placed the ' + spec.name + '.');
    return true;
  }
  function lhReceiveDecor(d){
    if (!lh || !d || d.room == null || !lh.rooms[d.room]) return;
    const R = lh.rooms[d.room];
    if (R.owner === 'me') return;
    R.netDecor = LH_RULES.lhNormalizeDecor ? LH_RULES.lhNormalizeDecor(d.items) : (d.items || []);
    R.netStyle = LH_RULES.lhNormalizeStyle ? LH_RULES.lhNormalizeStyle(d.style) : (d.style || {});
    lhApplyWagonStyle(R);
    lhRebuildDecor(R);
  }

  function lhPrompt(){
    if (!lh || lh.cut || lh.calm || lh.banish) return null;
    if (lh.riding){
      const nm = (lh.riding.name || 'ride');
      return {id:'hopoff', label: '👋 Hop off the ' + nm};
    }
    const a = lhPlayerArea();
    const near = lhCompanyNear();
    const ride = lhNearRide();
    if (ride){
      const seat = lhBestSeat(ride, P);
      if (seat >= 0) return {id:'ride', label: (ride.kind === 'ferris' ? '🎡' : ride.kind === 'carousel' ? '🎠' : '🎪') + ' Ride the ' + (ride.name || 'ride'), ride: ride, seat: seat};
      return {id:'ridefull', label:'🎟️ Ride is full'};
    }
    if (lhNearBooth()) return {id:'booth', label:'🎟️ Prize Booth'};
    const game = lhNearGame();
    if (game) return {id:'game', label: (game.emoji || '🎟️') + ' Play ' + game.name, game: game};
    if (lh.wagonPad && LH_RULES.lhNear(P.x, P.z, lh.wagonPad.x, lh.wagonPad.z, 2.0))
      return {id:'gowagon', label:'🎪 Go to my wagon'};
    // In-room actions first so the light switch and bed are not hidden by the door prompt —
    // except at the doorway itself, where Open/Close door wins so the clickable prompt is accurate.
    if (a.R){
      const R = a.R;
      const doorX = R.x - R.side * (R.w / 2);
      const dDoor = LH_RULES.lhDist ? LH_RULES.lhDist(P.x, P.z, doorX, R.z) : 99;
      const dSw = LH_RULES.lhDist ? LH_RULES.lhDist(P.x, P.z, R.switch.x, R.switch.z) : 99;
      const atDoor = dDoor <= 1.8;
      if (LH_RULES.lhNear(P.x, P.z, R.switch.x, R.switch.z, 1.5) && !(atDoor && dDoor <= dSw + 0.15))
        return {id:'light', label: R.lit ? '💡 Turn lights off' : '💡 Turn lights on', R};
      if (LH_RULES.lhNear(P.x, P.z, R.bed.x, R.bed.z, 1.6)) return {id:'bed', label: lh.bed ? '🛏️ Get up' : '🛏️ Sit on bed', R};
      if (R.owner === 'me' && LH_RULES.lhNear(P.x, P.z, R.wall.x, R.wall.z, 1.7) && !atDoor) return {id:'draw', label:'🖍️ Draw on the wall', R};
      if (R.owner === 'me' && !atDoor) return {id:'decorate', label:'🛋️ Decorate wagon', R};
      if (R.owner === 'me' && atDoor) return {id:'door', label: R.door.closed ? '🚪 Open door' : '🚪 Close door', R};
    }
    const ownWord = lhWordAtLook();
    if (ownWord) return {id:'erase', label:'🧽 Erase writing', word: ownWord};
    if (lhLookWallHit()) return {id:'write', label:'✍️ Write a word'};
    // door first (so Open/Close is not hidden by the doorbell). Close works inside and outside.
    for (let i = 0; i < lh.rooms.length; i++){
      const R = lh.rooms[i];
      const doorX = R.x - R.side * (R.w / 2);
      if (LH_RULES.lhNear(P.x, P.z, doorX, R.z, 2.2)){
        if (R.owner === 'me') return {id:'door', label: R.door.closed ? '🚪 Open door' : '🚪 Close door', R};
        const kind = LH_RULES.lhDoorPromptKind ? LH_RULES.lhDoorPromptKind({isOwner:false, doorClosed:!!R.door.closed, wagonNo:R.id + 1}) : {id: R.door.closed ? 'knock' : 'enter', label: R.door.closed ? '🚪 Knock' : ('🚪 Enter wagon ' + (R.id + 1))};
        // Key holder may unlock only after a knock goes unanswered.
        if (R.door.closed && lh.keyholder === 'me' && R._unlockReady) return {id:'unlock', label:'🔑 Unlock room', R};
        return {id: kind.id, label: kind.label, R};
      }
    }
    for (let i = 0; i < lh.rooms.length; i++){
      const R = lh.rooms[i];
      if (LH_RULES.lhNear(P.x, P.z, R.bell.x, R.bell.z, 1.6)) return {id:'bell', label:'🛎️ Ring doorbell', R};
    }
    if (a.bath && lh.mirror && LH_RULES.lhNear(P.x, P.z, lh.mirror.x, lh.mirror.z, 2.2)) return {id:'mirror', label:'🪞 Look in the mirror'};
    if (lh.host && LH_RULES.lhNear(P.x, P.z, lh.host.x, lh.host.z, 2.6)) return {id:'host', label:'🎩 Talk to ' + LH_HOST_TITLE};
    if (near.closestG && near.bestG < (LH_RULES.LH_SUMMON_R || 8)) return {id:'fanfare', label:'🎩 Call ' + LH_HOST_TITLE};
    if (lh.glitched) return {id:'fanfare', label:'🎩 Call ' + LH_HOST_TITLE};
    return null;
  }

  let _lhActAt = 0;
  function lhAct(){
    const now = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
    if (now - _lhActAt < 250) return;
    _lhActAt = now;
    if (!lh) return;
    if (lh.cut || lh.calm || lh.banish){ lhSkipCut(); return true; }
    const p = lhPrompt();
    if (!p) return false;
    if (p.id === 'hopoff') lhDismountRide();
    else if (p.id === 'ride') lhBoardRide(p.ride, p.seat);
    else if (p.id === 'ridefull'){ if (typeof toast === 'function') toast('🎟️ Every seat is taken — wait for a spin!'); }
    else if (p.id === 'game') lhOpenGame(p.game && p.game.id);
    else if (p.id === 'booth') lhOpenBooth();
    else if (p.id === 'decorate') lhOpenDecor();
    else if (p.id === 'bell') lhRing(p.R);
    else if (p.id === 'gowagon') lhGoWagon();
    else if (p.id === 'enter'){
      if (p.R.door.closed){ if (typeof toast === 'function') toast('🚪 Knock first — you can\'t just walk in.'); return false; }
      Object.assign(P, {x: p.R.x - p.R.side * 1.2, y: (p.R.floorY || 0.45) + 0.05, z: p.R.z, vx:0, vy:0, vz:0});
    }
    else if (p.id === 'knock') lhKnock(p.R);
    else if (p.id === 'light') lhToggleLight(p.R);
    else if (p.id === 'door'){
      // Always honor the prompt: Close door closes, Open door opens.
      // Do not teleport-enter on a Close door click (that used to swallow the close).
      const closing = !p.R.door.closed;
      lhSetDoor(p.R, closing, 'player');
    }
    else if (p.id === 'unlock') lhUnlock(p.R);
    else if (p.id === 'bed'){ lh.bed = !lh.bed; if (lh.bed){ P.x = p.R.bed.x; P.z = p.R.bed.z; } }
    else if (p.id === 'draw') lhOpenDraw(p.R);
    else if (p.id === 'write') lhOpenWrite();
    else if (p.id === 'erase') lhEraseMyWord(p.word && p.word.id);
    else if (p.id === 'mirror') lhStareMirror();
    else if (p.id === 'host') lhTalkHost();
    else if (p.id === 'fanfare') lhCallHost(true);
    lhHud();
    return true;
  }

  function lhDing(){
    try {
      if (typeof muted !== 'undefined' && muted) return;
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      if (!lh._ac) lh._ac = new AC();
      const ac = lh._ac;
      const o = ac.createOscillator(), g = ac.createGain(), f = ac.createBiquadFilter();
      o.type = 'triangle'; o.frequency.value = 880;
      f.type = 'lowpass';
      const muff = lhSet().muffledSound && (lh.glitched || lh.sanity < 40);
      f.frequency.value = muff ? 420 : 2400;
      g.gain.value = muff ? 0.03 : 0.08;
      o.connect(f); f.connect(g); g.connect(ac.destination);
      o.start();
      o.frequency.exponentialRampToValueAtTime(1320, ac.currentTime + 0.12);
      g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.35);
      o.stop(ac.currentTime + 0.36);
    } catch (e){}
  }

  function lhRing(R){
    if (!R) return;
    lh.lastDing = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
    lhDing();
    if (typeof toast === 'function') toast('🛎️ Ding-dong! Room ' + (R.id + 1));
    // cancel a transformation in progress in this room
    const occ = lhOccupant(R);
    const can = (lh.transforming && lh.room === R.id && lh.xformKind === 'bed') || (occ && occ.transforming);
    if (lh.transforming && (lh.area === 'room' && lh.room === R.id)){
      lhTryCancel('doorbell');
    }
    lhNet({k:'bell', room:R.id});
  }

  function lhToggleLight(R){
    if (!R) return;
    lhTintRoom(R, !R.lit);
    if (lh.transforming && lh.room === R.id) lhTryCancel('light');
    if (typeof toast === 'function') toast(R.lit ? '💡 Lights on' : '🌘 Lights off');
    lhNet({k:'light', room:R.id, on:!!R.lit});
  }

  function lhTryCancel(why){
    if (!lh || !lh.transforming) return false;
    const ok = LH_RULES.lhCancelSucceeds ? LH_RULES.lhCancelSucceeds(lhSet().cancellation, Math.random) : true;
    if (ok){
      lh.transforming = false; lh.xformT = 0; lh.cut = null;
      lh.sanity = Math.max(lh.sanity, 42);
      const n = lhEl('lhCut'); if (n){ n.style.display = 'none'; n.classList.remove('show'); }
      if (typeof toast === 'function') toast('✨ The fizzle fizzled out! (' + (why || 'interrupt') + ')');
      if (typeof big === 'function') big('');
      return true;
    }
    if (typeof toast === 'function') toast('🛎️ They didn\'t hear it in time…');
    return false;
  }

  function lhOccupant(R){
    if (!R) return null;
    // used by keyholder find
    const people = lhOthers().concat([{uid:'me', x:P.x, z:P.z, glitched:lh.glitched, transforming:lh.transforming, kind:'me'}]);
    return people.find(o => Math.abs(o.x - R.x) < R.w / 2 && Math.abs(o.z - R.z) < R.d / 2) || null;
  }


  function lhIsMp(){
    try { return !!(typeof mp !== 'undefined' && mp && mp.on); } catch (e){ return false; }
  }
  function lhAssignOwners(){
    if (!lh || !lh.rooms) return;
    lh.rooms.forEach(R => { R.owner = null; R.ownerUid = null; });
    try {
      if (lhIsMp() && typeof mpRoster === 'function'){
        const me = mp.host ? 'H' : (mp.me || 'g0');
        const roster = mpRoster() || [];
        roster.forEach((p, i) => {
          const R = lh.rooms[i % lh.rooms.length];
          if (!R || !p) return;
          const uid = p.uid || p.id;
          R.ownerUid = uid;
          if (uid === me) R.owner = 'me';
        });
      } else if (lh.rooms[lh.myRoom]){
        lh.rooms[lh.myRoom].owner = 'me';
        lh.rooms[lh.myRoom].ownerUid = 'me';
      }
    } catch (e){
      if (lh.rooms[lh.myRoom]){ lh.rooms[lh.myRoom].owner = 'me'; lh.rooms[lh.myRoom].ownerUid = 'me'; }
    }
  }
  function lhKnockSound(){
    try {
      if (typeof muted !== 'undefined' && muted) return;
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      if (!lh._ac) lh._ac = new AC();
      const ac = lh._ac;
      const muff = lhSet().muffledSound && (lh.glitched || lh.sanity < 40);
      [0, 0.14, 0.3].forEach((t, i) => {
        const o = ac.createOscillator(), g = ac.createGain();
        o.type = 'sine';
        o.frequency.value = i === 2 ? 140 : 180;
        g.gain.value = muff ? 0.04 : 0.1;
        o.connect(g); g.connect(ac.destination);
        const t0 = ac.currentTime + t;
        o.start(t0);
        g.gain.exponentialRampToValueAtTime(0.001, t0 + 0.09);
        o.stop(t0 + 0.1);
      });
    } catch (e){}
  }
  function lhKnockFx(R){
    if (!R || !R.door) return;
    R.door._knockT = 0.4;
    try {
      if (typeof THREE !== 'undefined'){
        const ix = R.x - R.side * (R.w / 2);
        const spr = (typeof label === 'function') ? label('knock knock', 'rgba(80,20,40,.92)') : null;
        if (spr){
          spr.position.set(ix - R.side * 0.6, 2.2, R.z);
          scene.add(spr);
          if (lh) lh.trash.push(spr);
          lh._knockSpr = lh._knockSpr || [];
          lh._knockSpr.push({m: spr, t: 0.7});
        }
      }
    } catch (e){}
  }
  function lhTickKnockFx(dt){
    if (!lh) return;
    (lh.rooms || []).forEach(R => {
      const d = R.door;
      if (!d || !d.g || !(d._knockT > 0)) return;
      d._knockT -= dt;
      const dest = d.target != null ? d.target : (d.closed ? 0 : -R.side * 1.9);
      d.g.rotation.y = dest + Math.sin((d._knockT) * 42) * 0.045 * Math.max(0, d._knockT / 0.4);
      if (d._knockT <= 0) d.g.rotation.y = d.ang != null ? d.ang : dest;
    });
    if (lh._knockSpr){
      lh._knockSpr = lh._knockSpr.filter(s => {
        s.t -= dt;
        if (s.m && s.m.position) s.m.position.y += dt * 0.6;
        if (s.t <= 0){
          try { if (s.m && s.m.parent) s.m.parent.remove(s.m); } catch (e){}
          return false;
        }
        return true;
      });
    }
    if (lh.knockOffer){
      lh.knockOffer.t = (lh.knockOffer.t || 0) + dt;
      const cap = lh.knockOffer.timeout || (LH_RULES.LH_KNOCK_TIMEOUT || 10);
      const leftEl = lhEl('lhKnockLeft');
      if (leftEl) leftEl.textContent = Math.max(0, Math.ceil(cap - lh.knockOffer.t)) + 's';
      if (lh.knockOffer.t >= cap) lhKnockReply(false, 'timeout');
    }
    if (lh.knockWait){
      lh.knockWait.t = (lh.knockWait.t || 0) + dt;
      const cap = lh.knockWait.timeout || (LH_RULES.LH_KNOCK_TIMEOUT || 10);
      if (lh.knockWait.t >= cap){
        const room = lh.knockWait.room;
        lh.knockWait = null;
        const R = lh.rooms[room];
        if (R && lh.keyholder === 'me') R._unlockReady = true;
        if (typeof toast === 'function') toast('🚪 ' + (LH_RULES.lhKnockReplyMessage ? LH_RULES.lhKnockReplyMessage('timeout') : 'No one answered. The door stays closed.'));
      }
    }
  }
  function lhCloseKnock(){
    if (!lh) return;
    lh.knockOffer = null;
    const n = lhEl('lhKnock');
    if (n){ n.classList.remove('show'); n.style.display = 'none'; }
  }
  function lhShowKnockPopup(offer){
    if (!lh) return false;
    offer = offer || lh.knockOffer;
    if (!offer) return false;
    lh.knockOffer = offer;
    const n = lhEl('lhKnock');
    const msg = lhEl('lhKnockMsg');
    const who = offer.fromName ? String(offer.fromName) : 'Someone';
    if (msg) msg.textContent = who + ' is at your wagon door.';
    const leftEl = lhEl('lhKnockLeft');
    if (leftEl) leftEl.textContent = Math.max(0, Math.ceil((offer.timeout || 10) - (offer.t || 0))) + 's';
    if (n){ n.style.display = 'flex'; n.classList.add('show'); }
    return true;
  }
  function lhKnockReply(open, reason){
    if (!lh || !lh.knockOffer) return false;
    const offer = lh.knockOffer;
    const R = lh.rooms[offer.room];
    lhCloseKnock();
    reason = reason || (open ? 'open' : 'closed');
    if (open && R) lhSetDoor(R, false, 'player');
    try { lhNet({k:'knock-reply', room: offer.room, open: !!open, to: offer.from, reason: reason}); } catch (e){}
    if (typeof toast === 'function'){
      toast(open ? '🚪 You opened the door.' : '🚪 You kept the door closed.');
    }
    return true;
  }
  function lhReceiveKnock(d){
    if (!lh || !d) return;
    const R = lh.rooms[d.room];
    if (!R) return;
    lhKnockFx(R);
    lhKnockSound();
    if (R.owner !== 'me') return;
    const inRoom = LH_RULES.lhRoomContains ? LH_RULES.lhRoomContains(R, P.x, P.z, 0.02) : false;
    const resolved = LH_RULES.lhKnockResolve ? LH_RULES.lhKnockResolve({solo:false, hasOwner:true, ownerOnline:true, ownerInRoom: !!inRoom}) : {mode: inRoom ? 'popup' : 'closed', reason: inRoom ? 'offer' : 'away'};
    if (resolved.mode === 'popup'){
      lhShowKnockPopup({room: R.id, from: d.from, fromName: d.name || 'Someone', t: 0, timeout: resolved.timeout || (LH_RULES.LH_KNOCK_TIMEOUT || 10)});
    } else {
      try { lhNet({k:'knock-reply', room: R.id, open: false, to: d.from, reason: resolved.reason || 'away'}); } catch (e){}
    }
  }
  function lhReceiveKnockReply(d){
    if (!lh || !d) return;
    const me = lhWordUid ? lhWordUid() : 'me';
    if (d.to && d.to !== me && d.to !== 'me') return;
    if (!lh.knockWait || lh.knockWait.room !== d.room) return;
    lh.knockWait = null;
    const R = lh.rooms[d.room];
    if (d.open && R) lhSetDoor(R, false);
    else if (R && lh.keyholder === 'me') R._unlockReady = true;
    const msg = (LH_RULES.lhKnockReplyMessage ? LH_RULES.lhKnockReplyMessage(d.reason || (d.open ? 'open' : 'closed')) : (d.open ? 'They opened the door.' : 'They kept the door closed.'));
    if (typeof toast === 'function') toast('🚪 ' + msg);
  }
  function lhKnock(R){
    if (!lh || !R) return false;
    const now = (typeof performance !== 'undefined' && performance.now) ? (performance.now() / 1000) : (lh.t || 0);
    const last = (lh.knockAt && lh.knockAt[R.id]) || 0;
    const allowed = LH_RULES.lhKnockAllowed ? LH_RULES.lhKnockAllowed({
      isOwner: R.owner === 'me',
      doorClosed: !!(R.door && R.door.closed),
      lastAt: last,
      now: now,
      cooldown: LH_RULES.LH_KNOCK_COOLDOWN
    }) : {ok: true};
    if (!allowed.ok){
      if (allowed.reason === 'cooldown' && typeof toast === 'function') toast('🚪 Wait a moment before knocking again. (' + Math.ceil(allowed.wait) + 's)');
      else if (allowed.reason === 'open' && typeof toast === 'function') toast('🚪 The door is already open.');
      return false;
    }
    lh.knockAt = lh.knockAt || {};
    lh.knockAt[R.id] = now;
    lhKnockFx(R);
    lhKnockSound();
    const mpOn = lhIsMp();
    const st = {
      solo: !mpOn,
      hasOwner: mpOn ? !!(R.ownerUid && R.owner !== 'me') : false,
      ownerOnline: mpOn ? !!(R.ownerUid && R.owner !== 'me') : false,
      ownerInRoom: false
    };
    // In MP we don't know if they're in the room; the owner's client decides. We wait for a reply.
    if (mpOn && st.hasOwner){
      lh.knockWait = {room: R.id, t: 0, timeout: LH_RULES.LH_KNOCK_TIMEOUT || 10};
      try {
        const name = (typeof mp !== 'undefined' && mp && mp.name) ? mp.name : 'A guest';
        lhNet({k:'knock', room: R.id, from: lhWordUid(), name: name});
      } catch (e){}
      if (typeof toast === 'function') toast('🚪 You knock on wagon ' + (R.id + 1) + '…');
      return true;
    }
    const resolved = LH_RULES.lhKnockResolve ? LH_RULES.lhKnockResolve(st) : {mode:'closed', reason:'offline', message:"Nobody's home. The door stays closed."};
    if (resolved.mode === 'open' && R){
      lhSetDoor(R, false);
      if (typeof toast === 'function') toast('🚪 ' + (resolved.message || 'The door creaks open…'));
    } else {
      if (lh.keyholder === 'me') R._unlockReady = true;
      if (typeof toast === 'function') toast('🚪 ' + (resolved.message || (LH_RULES.lhKnockReplyMessage && LH_RULES.lhKnockReplyMessage(resolved.reason)) || 'The door stays closed.'));
    }
    return true;
  }

  function lhUnlock(R){
    if (!R || lh.keyholder !== 'me') return;
    if (lh.keyCd > 0){ if (typeof toast === 'function') toast('🔑 Keys need a short rest (' + Math.ceil(lh.keyCd) + 's)'); return; }
    lhSetDoor(R, false);
    lh.keyCd = LH_RULES.LH_KEY_CD || 120;
    const occ = lhOccupant(R);
    if (occ && occ.glitched) lhAward('lh:find');
    if (typeof toast === 'function') toast('🔑 Room ' + (R.id + 1) + ' unlocked!');
    lhNet({k:'unlock', room:R.id});
  }

  function lhStareMirror(){
    if (!lh) return;
    lh._mirrorT = (lh._mirrorT || 0) + 1;
    if (lh.sanity < 55 && Math.random() < 0.45){ lhStartCalm(); return; }
    // staring speeds drain a bit
    lh.sanity = LH_RULES.lhClampSanity(lh.sanity - 8);
    if (typeof toast === 'function') toast('🪞 Your reflection wobbles a little…');
    if (lh.sanity <= 0) lhBeginXform('mirror');
  }

  function lhTalkHost(){
    if (!lh) return;
    const lines = [
      'Keep the lanterns lit, and stay with your friends!',
      'If someone fizzles, type my name — Gleam — nearby.',
      'Dark rooms are cozy, but don\'t linger alone too long.',
      'Breathe if the world goes woozy. I\'ve got you.'
    ];
    const line = lines[Math.floor(lh.t / 3) % lines.length];
    if (typeof toast === 'function') toast('🎩 ' + LH_HOST_TITLE + ': “' + line + '”');
    lh.pester += 1;
    if (lh.pester >= 5) lhStartCrash();
  }

  function lhCallHost(fromBtn, uid){
    if (!lh) return;
    const caller = fromBtn ? 'me' : uid;
    const callerGlitched = lhUidIsGlitched(caller);
    const blocked = LH_RULES.lhSummonBlocked ? LH_RULES.lhSummonBlocked({glitched: callerGlitched}) : !!callerGlitched;
    if (blocked){
      // Only the local fizzled player sees the "can't hear you" note.
      if (fromBtn || lhUidIsMe(caller)){
        const msg = (LH_RULES.lhSummonDeniedMsg && LH_RULES.lhSummonDeniedMsg()) || ('🎩 ' + LH_HOST_TITLE + ': “I can\'t hear you while you\'re fizzled.”');
        if (typeof toast === 'function') toast(msg);
      }
      return;
    }
    const near = lhCompanyNear();
    let target = null;
    // A healthy friend can still summon help for a fizzled local player.
    if (lh.glitched) target = {kind:'me', glitched:true, x:P.x, z:P.z};
    else if (near.closestG && near.bestG <= (LH_RULES.LH_SUMMON_R || 8)) target = near.closestG;
    if (!target){
      lh.pester += 1;
      if (typeof toast === 'function') toast('🎩 ' + LH_HOST_TITLE + ': “I don\'t see a fizzled friend nearby!”');
      if (lh.pester >= 5) lhStartCrash();
      return;
    }
    lhStartBanish(target);
  }

  function lhStartBanish(target){
    if (!lh || lh.banish) return;
    lh.banish = {t: 0, dur: 4.2, target: target, done: false};
    const n = lhEl('lhCut');
    if (n){
      n.style.display = ''; n.classList.add('show', 'lh-banish');
      const cap = lhEl('lhCutCap'); if (cap) cap.textContent = '🎩 ' + LH_HOST_TITLE + ': “That\'s quite enough of that! Down to the cellar — just a little timeout!”';
      const eyes = lhEl('lhCutEyes'); if (eyes) eyes.innerHTML = '🎩✨🎀';
    }
    if (typeof big === 'function') big('');
  }

  function lhFinishBanish(){
    if (!lh || !lh.banish || lh.banish.done) return;
    lh.banish.done = true;
    const t = lh.banish.target;
    const me = !t || t.kind === 'me' || t.uid === 'me' || (lh.glitched && !t.uid);
    if (me){
      lhAward('lh:cellar');
      lh.glitched = true;
      Object.assign(P, {x: lh.cellar.x, y: lh.cellar.y, z: lh.cellar.z, vx:0, vy:0, vz:0});
      lh.area = 'cellar';
    } else if (t && t.ref){
      t.ref.glitched = true;
      t.ref.x = lh.cellar.x; t.ref.z = lh.cellar.z; t.ref.y = lh.cellar.y;
      if (t.ref.model && t.ref.model.g) t.ref.model.g.position.set(lh.cellar.x, lh.cellar.y, lh.cellar.z);
    }
    const n = lhEl('lhCut'); if (n){ n.style.display = 'none'; n.classList.remove('show','lh-banish'); }
    if (typeof toast === 'function') toast('🚪 Down to the cellar!');
    lh.banish = null;
    lhNet({k:'banish'});
    lhCheckAllFizzled();
  }

  function lhBeginXform(kind){
    if (!lh || lh.glitched || lh.transforming || lh.cut) return;
    lh.transforming = true;
    lh.xformT = 0;
    lh.xformKind = kind || (lh.bed ? 'bed' : 'plain');
    lh.cut = {t: 0, dur: 3.2, kind: lh.xformKind};
    const n = lhEl('lhCut');
    if (n){
      n.style.display = ''; n.classList.add('show');
      const cap = lhEl('lhCutCap'); if (cap) cap.textContent = 'The lanterns wink out. Eyes open in the dark… you\'re all fizzled.';
      const eyes = lhEl('lhCutEyes');
      if (eyes) eyes.innerHTML = '<i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i>';
      try { lhPlaySting(); } catch (e){}
    }
  }

  function lhFinishXform(){
    if (!lh) return;
    lh.transforming = false; lh.cut = null; lh.glitched = true; lh.sanity = 0;
    const n = lhEl('lhCut'); if (n){ n.style.display = 'none'; n.classList.remove('show'); }
    lhAward('lh:fizzle');
    try { if (model){ if (!lh.fxMe) lh.fxMe = {g: model.g, head: model.head, model: model}; lhApplyLook(model, true); } } catch (e){}
    if (typeof toast === 'function') toast('👁️ You fizzled! Tag friends to share the wobbles — no bumping too hard.');
    lhNet({k:'fizzle'});
    lhCheckAllFizzled();
  }

  function lhStartCalm(){
    if (!lh || lh.calm || lh.glitched) return;
    lh.calm = {t: 0, dur: 3.4};
    lh.transforming = false; lh.cut = null;
    const n = lhEl('lhCalm');
    if (n){
      n.style.display = ''; n.classList.add('show');
      const cap = lhEl('lhCalmCap'); if (cap) cap.textContent = '😮‍💨 Whew — take a breath. In… and out… You\'ve got this.';
    }
  }
  function lhFinishCalm(){
    if (!lh) return;
    lh.sanity = 100;
    lh.calm = null;
    const n = lhEl('lhCalm'); if (n){ n.style.display = 'none'; n.classList.remove('show'); }
    lhAward('lh:breath');
    if (typeof toast === 'function') toast('✨ Sanity feels full again!');
  }

  function lhStartCrash(){
    if (!lh || lh.crash) return;
    lh.crash = {t: 0, dur: 3.2};
    lh.pester = 0;
    const n = lhEl('lhCut');
    if (n){
      n.style.display = ''; n.classList.add('show', 'lh-crash');
      const cap = lhEl('lhCutCap'); if (cap) cap.textContent = '😤 ' + LH_HOST_TITLE + ': “THAT\'S QUITE ENOUGH!” (confetti everywhere!)';
      const eyes = lhEl('lhCutEyes'); if (eyes) eyes.innerHTML = '🎊🎉✨🎀';
    }
    lhAward('lh:enough');
  }

  function lhStartSong(){
    if (!lh || lh.song) return;
    lh.song = {t: 0, dur: 5};
    lh.lastSongAt = lh.t;
    lh.songStayT = 0;
    if (typeof toast === 'function') toast('🎵 ' + LH_HOST_TITLE + ' sings: “Lanterns glow, don\'t walk alone — stay together, we\'re going home!”');
    const n = lhEl('lhCut');
    if (n){
      n.style.display = ''; n.classList.add('show', 'lh-song');
      const cap = lhEl('lhCutCap'); if (cap) cap.textContent = '🎵 Lanterns glow, don\'t walk alone, stay together, we\'re going home! Keep the lights on, stay in view — Maestro Gleam\'s watching over you!';
      const eyes = lhEl('lhCutEyes'); if (eyes) eyes.innerHTML = '🎶🏮🎶';
    }
    lhAward('lh:song');
  }

  function lhStartMelt(){
    if (!lh || lh.allMelt) return;
    lh.allMelt = {t: 0, dur: 3.5};
    const n = lhEl('lhCut');
    if (n){
      n.style.display = ''; n.classList.add('show', 'lh-melt');
      const cap = lhEl('lhCutCap'); if (cap) cap.textContent = '😵 ' + LH_HOST_TITLE + ': “Everyone\'s fizzled? Oh dear, oh dear — I\'ll gather you all up!”';
      const eyes = lhEl('lhCutEyes'); if (eyes) eyes.innerHTML = '😵🎩💫';
    }
    lhAward('lh:all');
  }

  function lhCheckAllFizzled(){
    if (!lh) return;
    const people = lhOthers().filter(o => o.kind !== 'vesper');
    const live = people.filter(o => o.kind === 'npc' || o.kind === 'mp');
    if (!lh.glitched) return;
    if (live.length && live.every(o => o.glitched)) lhStartMelt();
    else if (!live.length && lh.npcs.length && lh.npcs.every(n => n.glitched) && lh.glitched) lhStartMelt();
  }

  function lhSkipCut(){
    if (!lh) return;
    if (lh.cut) lhFinishXform();
    else if (lh.calm) lhFinishCalm();
    else if (lh.banish) lhFinishBanish();
    else if (lh.crash){ lh.crash = null; const n = lhEl('lhCut'); if (n){ n.style.display='none'; n.classList.remove('show','lh-crash'); } }
    else if (lh.song){ lh.song = null; const n = lhEl('lhCut'); if (n){ n.style.display='none'; n.classList.remove('show','lh-song'); } }
    else if (lh.allMelt){ lh.allMelt = null; const n = lhEl('lhCut'); if (n){ n.style.display='none'; n.classList.remove('show','lh-melt'); } }
  }

  function lhSpawnVesper(){
    if (!lh || (lh.vesper && lh.vesper.on)) return;
    try {
      const av = {head:'#d0c4ff', hair:'long', hairColor:'#1a1030', shirt:'#2a1048', pants:'#0a0818', hat:'party', body:'girl'};
      const m = (typeof buildPlayer === 'function') ? buildPlayer(av) : null;
      const x = 8, z = 8;
      if (m && m.g){ m.g.position.set(x, 0, z); scene.add(m.g); lh.trash.push(m.g); }
      lh.vesper = {on:true, x, z, y:0, model:m, glitched:true, name:'Vesper', seen:false};
      if (m) lhApplyLook(m, true);
    } catch (e){ lh.vesper = {on:true, x:8, z:8, y:0, model:null, glitched:true, name:'Vesper', seen:false}; }
  }

  function lhOpenDraw(R){
    lh.doodleOpen = true; lh.doodleRoom = R; lh.stamp = lh.stamp || 'star'; lh.color = lh.color || '#ff6b9a';
    const n = lhEl('lhDraw'); if (n){ n.style.display = ''; n.classList.add('show'); }
    try { if (document.pointerLockElement) document.exitPointerLock(); } catch (e){}
    lhPaintPreview();
  }
  function lhCloseDraw(){
    lh.doodleOpen = false;
    const n = lhEl('lhDraw'); if (n){ n.style.display = 'none'; n.classList.remove('show'); }
    if (lh && lh.prog) lhSaveProg(lh.prog);
  }
  function lhStampAt(ev){
    if (!lh || !lh.doodleOpen || !lh.doodleRoom) return;
    const wall = lhEl('lhWall'); if (!wall) return;
    const r = wall.getBoundingClientRect();
    const x = (ev.clientX - r.left) / r.width, y = (ev.clientY - r.top) / r.height;
    const id = lh.doodleRoom.id;
    const cur = (lh.prog.doodles[id] = LH_RULES.lhAddDoodle(lh.prog.doodles[id] || [], lh.stamp, x, y, lh.color));
    lhPaintWall(lh.doodleRoom, cur);
    lhPaintPreview();
    lhSaveProg(lh.prog);
    lhNet({k:'doodle', room:id, doodle:cur});
  }
  function lhPaintPreview(){
    const wall = lhEl('lhWall'); if (!wall || !lh || !lh.doodleRoom) return;
    const marks = (lh.prog.doodles && lh.prog.doodles[lh.doodleRoom.id]) || [];
    wall.innerHTML = marks.map(m => {
      const icon = {star:'⭐', heart:'❤', circle:'●', square:'■', squiggle:'〰️', smile:'☺', lantern:'🏮', swirl:'🌀'}[m.stamp] || '●';
      return '<span style="position:absolute;left:' + (m.x*100) + '%;top:' + (m.y*100) + '%;color:' + m.color + ';font-size:22px;transform:translate(-50%,-50%)">' + icon + '</span>';
    }).join('');
  }

  function lhToggleSet(on){
    if (!lh) return;
    lh.setOpen = (on == null) ? !lh.setOpen : !!on;
    const n = lhEl('lhSet');
    if (n){ n.style.display = lh.setOpen ? '' : 'none'; n.classList.toggle('show', lh.setOpen); }
    if (lh.setOpen){ try { if (document.pointerLockElement) document.exitPointerLock(); } catch (e){} lhWriteSettings(); }
  }
  function lhWriteSettings(){
    const s = lhSet();
    const vis = lhEl('lhVis'); if (vis) vis.checked = !!s.glitchedVision;
    const muff = lhEl('lhMuff'); if (muff) muff.checked = !!s.muffledSound;
    const map = {fifty:'lhCanFifty', always:'lhCanAlways', never:'lhCanNever'};
    Object.keys(map).forEach(k => { const n = lhEl(map[k]); if (n) n.checked = s.cancellation === k; });
    const sk = lhEl('lhSkipKey'); if (sk) sk.checked = !!s.skipKeyholder;
  }
  function lhReadSettings(){
    if (!lh || !lh.prog) return;
    const vis = lhEl('lhVis'), muff = lhEl('lhMuff');
    let can = 'fifty';
    if (lhEl('lhCanAlways') && lhEl('lhCanAlways').checked) can = 'always';
    else if (lhEl('lhCanNever') && lhEl('lhCanNever').checked) can = 'never';
    lh.prog.settings = LH_RULES.lhNormalizeSettings({
      glitchedVision: !!(vis && vis.checked),
      muffledSound: !!(muff && muff.checked),
      cancellation: can,
      skipKeyholder: !!(lhEl('lhSkipKey') && lhEl('lhSkipKey').checked)
    });
    lhSaveProg(lh.prog);
  }

  function lhKey(e){
    if (!lh) return false;
    if (lh.mapOpen){
      if (e.code === 'Escape' || e.key === 'Escape' || e.code === 'KeyM'){ lhToggleMap(false); return true; }
    }
    if (lh.knockOffer){
      if (e.code === 'Escape' || e.key === 'Escape'){ lhKnockReply(false, 'closed'); return true; }
      if ((e.code === 'Enter' || e.key === 'Enter') && !e.repeat){ lhKnockReply(true, 'open'); return true; }
      return true;
    }
    if (lh.arcade){
      if (e.code === 'Escape' || e.key === 'Escape'){ lhCloseArcade(); return true; }
      if (e.code === 'ArrowLeft' || e.code === 'KeyA'){ lhGameMove(-1, 0); return true; }
      if (e.code === 'ArrowRight' || e.code === 'KeyD'){ lhGameMove(1, 0); return true; }
      if (e.code === 'ArrowUp' || e.code === 'KeyW'){ lhGameMove(0, -1); return true; }
      if (e.code === 'ArrowDown' || e.code === 'KeyS'){ lhGameMove(0, 1); return true; }
      if ((e.code === 'Space' || e.code === 'Enter' || e.code === 'KeyE' || e.code === 'KeyX') && !e.repeat){ lhGameFire(lh.arcade.sel); return true; }
      return true;
    }
    if (lh.boothOpen){
      if (e.code === 'Escape' || e.key === 'Escape'){ lhCloseBooth(); return true; }
      const n = (LH_RULES.LH_PRIZES || []).length || 1;
      if (e.code === 'ArrowLeft' || e.code === 'ArrowUp' || e.code === 'KeyA' || e.code === 'KeyW'){ lh.boothSel = ((lh.boothSel || 0) - 1 + n) % n; lhFillBooth(); return true; }
      if (e.code === 'ArrowRight' || e.code === 'ArrowDown' || e.code === 'KeyD' || e.code === 'KeyS'){ lh.boothSel = ((lh.boothSel || 0) + 1) % n; lhFillBooth(); return true; }
      if ((e.code === 'Enter' || e.code === 'Space' || e.code === 'KeyE' || e.code === 'KeyX') && !e.repeat){
        const prize = (LH_RULES.LH_PRIZES || [])[lh.boothSel || 0];
        if (prize){ if (lh.prog && lh.prog.prizes && lh.prog.prizes[prize.id] && prize.kind === 'cosmetic') lhWearPrize(prize.id); else lhBuyAtBooth(prize.id); }
        return true;
      }
      return true;
    }
    if (lh.decorOpen){
      if (e.code === 'Escape' || e.key === 'Escape'){ lhCloseDecor(); return true; }
      const cat = (LH_RULES.lhDecorCatalog ? LH_RULES.lhDecorCatalog((lh.prog && lh.prog.prizes) || {}) : []) || [];
      const n = cat.length || 1;
      if (e.code === 'ArrowLeft' || e.code === 'KeyA' || e.code === 'ArrowUp' || e.code === 'KeyW'){ lh.decorSel = ((lh.decorSel || 0) - 1 + n) % n; lhFillDecor(); return true; }
      if (e.code === 'ArrowRight' || e.code === 'KeyD' || e.code === 'ArrowDown' || e.code === 'KeyS'){ lh.decorSel = ((lh.decorSel || 0) + 1) % n; lhFillDecor(); return true; }
      if ((e.code === 'Enter' || e.code === 'Space' || e.code === 'KeyE') && !e.repeat){ lhPlaceSelectedDecor(); return true; }
      return true;
    }
    if (lh.writeOpen){
      if (e.code === 'Escape' || e.key === 'Escape'){ lhCloseWrite(); return true; }
      // Let the custom text field receive typing; G should not re-toggle.
      return false;
    }
    if (lh.doodleOpen || lh.setOpen){
      if (e.code === 'Escape' || e.key === 'Escape'){ lhCloseDraw(); lhToggleSet(false); return true; }
      return false;
    }
    if (lh.cut || lh.calm || lh.banish || lh.crash || lh.song || lh.allMelt){
      if (e.code === 'Escape' || e.code === 'Space' || e.code === 'KeyE' || e.key === 'Enter'){ lhSkipCut(); return true; }
    }
    if (e.code === 'KeyE' && !e.repeat){ lhAct(); return true; }
    if (e.code === 'KeyG' && !e.repeat){ lhOpenWrite(); return true; }
    if (e.code === 'KeyT' && !e.repeat){ lhOpenDecor(); return true; }
    if (e.code === 'KeyM' && !e.repeat){ lhToggleMap(); return true; }
    if (e.code === 'KeyV') return false;
    return false;
  }
  function lhPad(jp){
    if (!lh || !jp) return false;
    // X = use (button 2), B = back (1), A is jump, Y = map (3), LB = write (4)
    if (lh.knockOffer){
      if ((jp[0] || jp[2]) && !lh._padPick){ lh._padPick = true; lhKnockReply(true, 'open'); return true; }
      if (jp[1] && !lh._padB){ lh._padB = true; lhKnockReply(false, 'closed'); return true; }
      if (!jp[0] && !jp[2]) lh._padPick = false;
      if (!jp[1]) lh._padB = false;
      return true;
    }
    if (lh.arcade){
      if (jp[1] && !lh._padB){ lh._padB = true; lhCloseArcade(); return true; }
      if (!jp[1]) lh._padB = false;
      if ((jp[14] || jp[12]) && !lh._padD){ lh._padD = true; lhGameMove(jp[14] ? -1 : 0, jp[12] ? -1 : 0); return true; }
      if ((jp[15] || jp[13]) && !lh._padD){ lh._padD = true; lhGameMove(jp[15] ? 1 : 0, jp[13] ? 1 : 0); return true; }
      if (!jp[14] && !jp[15] && !jp[12] && !jp[13]) lh._padD = false;
      if ((jp[0] || jp[2]) && !lh._padPick){ lh._padPick = true; lhGameFire(lh.arcade.sel); return true; }
      if (!jp[0] && !jp[2]) lh._padPick = false;
      return true;
    }
    if (lh.boothOpen){
      if (jp[1] && !lh._padB){ lh._padB = true; lhCloseBooth(); return true; }
      if (!jp[1]) lh._padB = false;
      const n = (LH_RULES.LH_PRIZES || []).length || 1;
      if ((jp[14] || jp[12]) && !lh._padD){ lh._padD = true; lh.boothSel = ((lh.boothSel || 0) - 1 + n) % n; lhFillBooth(); return true; }
      if ((jp[15] || jp[13]) && !lh._padD){ lh._padD = true; lh.boothSel = ((lh.boothSel || 0) + 1) % n; lhFillBooth(); return true; }
      if (!jp[14] && !jp[15] && !jp[12] && !jp[13]) lh._padD = false;
      if ((jp[0] || jp[2]) && !lh._padPick){
        lh._padPick = true;
        const prize = (LH_RULES.LH_PRIZES || [])[lh.boothSel || 0];
        if (prize){ if (lh.prog && lh.prog.prizes && lh.prog.prizes[prize.id] && prize.kind === 'cosmetic') lhWearPrize(prize.id); else lhBuyAtBooth(prize.id); }
        return true;
      }
      if (!jp[0] && !jp[2]) lh._padPick = false;
      return true;
    }
    if (lh.decorOpen){
      if (jp[1] && !lh._padB){ lh._padB = true; lhCloseDecor(); return true; }
      if (!jp[1]) lh._padB = false;
      const cat = (LH_RULES.lhDecorCatalog ? LH_RULES.lhDecorCatalog((lh.prog && lh.prog.prizes) || {}) : []) || [];
      const n = cat.length || 1;
      if ((jp[14] || jp[12]) && !lh._padD){ lh._padD = true; lh.decorSel = ((lh.decorSel || 0) - 1 + n) % n; lhFillDecor(); return true; }
      if ((jp[15] || jp[13]) && !lh._padD){ lh._padD = true; lh.decorSel = ((lh.decorSel || 0) + 1) % n; lhFillDecor(); return true; }
      if (!jp[14] && !jp[15] && !jp[12] && !jp[13]) lh._padD = false;
      if ((jp[0] || jp[2]) && !lh._padPick){ lh._padPick = true; lhPlaceSelectedDecor(); return true; }
      if (!jp[0] && !jp[2]) lh._padPick = false;
      return true;
    }
    if (lh.writeOpen){
      if (jp[1] && !lh._padB){ lh._padB = true; lhCloseWrite(); return true; }
      if (!jp[1]) lh._padB = false;
      const presets = LH_RULES.LH_WALL_PRESETS || [];
      const n = presets.length || 1;
      if ((jp[14] || jp[12]) && !lh._padD){ lh._padD = true; lh.writeSel = ((lh.writeSel || 0) - 1 + n) % n; lhFillWritePanel(); return true; }
      if ((jp[15] || jp[13]) && !lh._padD){ lh._padD = true; lh.writeSel = ((lh.writeSel || 0) + 1) % n; lhFillWritePanel(); return true; }
      if (!jp[14] && !jp[15] && !jp[12] && !jp[13]) lh._padD = false;
      if ((jp[0] || jp[2]) && !lh._padPick){
        lh._padPick = true;
        const w = presets[lh.writeSel || 0];
        if (w){ lhPlaceWallWord(w, {hit: lh.writeHit, style: lh.writeStyle}); lhCloseWrite(); }
        return true;
      }
      if (!jp[0] && !jp[2]) lh._padPick = false;
      return true;
    }
    if (jp[2] && !lh._padX){ lh._padX = true; lhAct(); return true; }
    if (!jp[2]) lh._padX = false;
    if (jp[1] && lh.riding && !lh._padB){ lh._padB = true; lhDismountRide(); return true; }
    if (jp[1] && (lh.doodleOpen || lh.setOpen || lh.mapOpen || lh.writeOpen || lh.knockOffer || lh.arcade || lh.boothOpen || lh.decorOpen || lh.cut || lh.calm || lh.banish)){ lhCloseDraw(); lhCloseWrite(); lhCloseArcade(); lhCloseBooth(); lhCloseDecor(); if (lh.knockOffer) lhKnockReply(false, 'closed'); lhToggleSet(false); lhToggleMap(false); lhSkipCut(); return true; }
    if (jp[3] && !lh._padY){ lh._padY = true; lhToggleMap(); return true; }
    if (!jp[3]) lh._padY = false;
    if (jp[4] && !lh._padLB){ lh._padLB = true; lhOpenWrite(); return true; }
    if (!jp[4]) lh._padLB = false;
    if (jp[5] && !lh._padRB){ lh._padRB = true; lhOpenDecor(); return true; }
    if (!jp[5]) lh._padRB = false;
    if (jp[8] && !lh._padView){ lh._padView = true; /* view often chat */ }
    if (!jp[8]) lh._padView = false;
    return false;
  }

  function lhMoveNpcs(dt){
    if (!lh) return;
    const wps = [{x:0,z:0},{x:-8,z:-4},{x:8,z:-4},{x:0,z:10},{x:0,z:22},{x:-16,z:22},{x:16,z:22},{x:0,z:60},{x:-50,z:8},{x:-62,z:40},{x:-72,z:-32},{x:-42,z:-18},{x:-32,z:-4}];
    lh.npcs.forEach((n, i) => {
      if (n.y < -6) return; // in cellar
      n.wait -= dt;
      if (n.glitched){
        // chase the player if nearby and player is normal
        if (!lh.glitched){ n.wx = P.x; n.wz = P.z; }
      } else if (n.wait <= 0){
        const w = wps[(i + Math.floor(lh.t + i * 3)) % wps.length];
        n.wx = w.x + (Math.random() - 0.5) * 2; n.wz = w.z;
        n.wait = 3 + Math.random() * 4;
      }
      const sp = n.glitched ? 5.2 : 2.4;
      const dx = n.wx - n.x, dz = n.wz - n.z, d = Math.sqrt(dx*dx+dz*dz) || 1;
      const moving = d > 0.2;
      if (moving){ n.x += dx / d * sp * dt; n.z += dz / d * sp * dt; n.face = Math.atan2(dx, dz); }
      if (n.model && n.model.g){
        n.model.g.position.set(n.x, n.y || 0, n.z);
        n.model.g.rotation.y = n.face || 0;
      }
      lhCharPose(n, dt, moving, sp);
      if (n.model && n._lhFX) lhBlink(n._lhFX, dt);
      if (n.model && n.model._lhFX) lhBlink(n.model._lhFX, dt);
    });
    if (lh.host && lh.host.model && lh.host.model.g){
      const H = lh.host;
      H.wait = (H.wait || 0) - dt;
      if (H.wait <= 0){
        H.wx = (Math.random() * 2 - 1) * 2.2;
        H.wz = -10.2;
        H.wait = 2.2 + Math.random() * 2.5;
      }
      const dx = (H.wx != null ? H.wx : H.x) - H.x, dz = (H.wz != null ? H.wz : H.z) - H.z;
      const d = Math.sqrt(dx*dx+dz*dz) || 1;
      const moving = d > 0.15;
      const sp = 1.6;
      if (moving){ H.x += dx / d * sp * dt; H.z += dz / d * sp * dt; H.face = Math.atan2(dx, dz); }
      else H.face = (H.face || 0) * 0.96;
      H.model.g.position.set(H.x, H.y, H.z);
      H.model.g.rotation.y = H.face || 0;
      H.pack = H.pack || 'hero';
      lhCharPose(H, dt, moving, sp);
    }
    if (lh.vesper && lh.vesper.on){
      const vx0 = lh.vesper.x, vz0 = lh.vesper.z;
      lh.vesper.x += Math.sin(lh.t * 0.6) * dt * 0.8;
      lh.vesper.z += Math.cos(lh.t * 0.5) * dt * 0.8;
      if (lh.vesper.model && lh.vesper.model.g) lh.vesper.model.g.position.set(lh.vesper.x, 0, lh.vesper.z);
      const vsp = Math.sqrt((lh.vesper.x - vx0) ** 2 + (lh.vesper.z - vz0) ** 2) / Math.max(dt, 0.001);
      if (lh.vesper.model && lh.vesper.model.g) lh.vesper.model.g.rotation.y = Math.atan2(lh.vesper.x - vx0, lh.vesper.z - vz0);
      lhCharPose(lh.vesper, dt, vsp > 0.2, Math.max(1.4, vsp));
      if (!lh.vesper.seen && LH_RULES.lhNear(P.x, P.z, lh.vesper.x, lh.vesper.z, 6)){
        lh.vesper.seen = true; lhAward('lh:vesper');
        if (typeof toast === 'function') toast('🌙 A late-night visitor waves from the midway…');
      }
    }
    lh.fish.forEach(f => {
      f.t += dt;
      if (f.m) f.m.position.set(f.a + Math.sin(f.t * 0.8) * 1.6, f.b + Math.sin(f.t * 1.4) * 0.3, -9.4);
    });
  }

  function lhDoTag(dt){
    if (!lh || lh.taggedLock > 0 || lh.cut || lh.calm || lh.banish) return;
    const r = LH_RULES.LH_TAG_R || 1.7;
    if (lh.glitched){
      // tag normals: they get a sanity slam or a soft lobby respawn if already low
      lhOthers().forEach(o => {
        if (o.glitched) return;
        if (!LH_RULES.lhNear(P.x, P.z, o.x, o.z, r)) return;
        // NPCs get a scare (no P). MP: they handle their own contact.
        if (o.kind === 'npc' && o.ref && !o.ref.glitched){
          o.ref.sanity = Math.max(0, (o.ref.sanity || 100) - 40);
        }
      });
      return;
    }
    const near = lhCompanyNear();
    if (near.closestG && near.bestG <= r){
      lhAward('lh:tagged');
      if (near.closestG.kind === 'vesper') lhAward('lh:peek');
      if (lh.sanity <= 35){
        // soft respawn to lobby, sanity restored
        lh.taggedLock = 2.2;
        Object.assign(P, {x:0, y:0.05, z:0, vx:0, vy:0, vz:0});
        lh.sanity = 100;
        lh.transforming = false; lh.cut = null; lh.bed = false;
        if (typeof toast === 'function') toast('💨 You got tagged! Back to the bright big top.');
        if (typeof big === 'function') big('Tagged!');
        setTimeout(() => { try { if (typeof big === 'function') big(''); } catch (e){} }, 900);
      } else {
        lh.sanity = LH_RULES.lhClampSanity(lh.sanity - 35);
        lh.taggedLock = 1.0;
        if (typeof toast === 'function') toast('💨 A fizzled guest tagged you! Sanity dipped.');
      }
    }
  }


  function lhAc(){
    try {
      if (typeof muted !== 'undefined' && muted) return null;
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      if (!lh._ac) lh._ac = new AC();
      if (lh._ac.state === 'suspended' && lh._ac.resume) lh._ac.resume();
      return lh._ac;
    } catch (e){ return null; }
  }
  function lhStopWhisper(){
    try { if (lh && lh._whisp && lh._whisp.stop) lh._whisp.stop(); } catch (e){}
    try { if (lh && lh._whispG) lh._whispG.disconnect(); } catch (e){}
    if (lh){ lh._whisp = null; lh._whispG = null; }
  }
  function lhWhisper(intensity){
    const ac = lhAc();
    if (!ac || !lh) return;
    const want = intensity > 0.28;
    if (!want){ lhStopWhisper(); return; }
    if (lh._whisp) return;
    try {
      const buf = ac.createBuffer(1, ac.sampleRate * 2, ac.sampleRate);
      const d = buf.getChannelData(0);
      let last = 0;
      for (let i = 0; i < d.length; i++){ last = last * 0.97 + (Math.random() * 2 - 1) * 0.03; d[i] = last; }
      const src = ac.createBufferSource(); src.buffer = buf; src.loop = true;
      const f = ac.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 420; f.Q.value = 0.7;
      const g = ac.createGain();
      const muff = !!(lhSet().muffledSound);
      g.gain.value = muff ? 0.012 : 0.03;
      src.connect(f); f.connect(g); g.connect(ac.destination);
      src.start();
      lh._whisp = src; lh._whispG = g;
    } catch (e){}
  }
  function lhPlaySting(){
    const ac = lhAc();
    if (!ac) return;
    try {
      const muff = !!(lhSet().muffledSound);
      const o = ac.createOscillator(), o2 = ac.createOscillator(), g = ac.createGain(), f = ac.createBiquadFilter();
      o.type = 'sawtooth'; o2.type = 'triangle';
      o.frequency.value = 180; o2.frequency.value = 90;
      f.type = 'lowpass'; f.frequency.value = muff ? 500 : 1400;
      g.gain.value = muff ? 0.07 : 0.16; // never louder than a normal in-game cue
      o.connect(f); o2.connect(f); f.connect(g); g.connect(ac.destination);
      o.start(); o2.start();
      o.frequency.exponentialRampToValueAtTime(70, ac.currentTime + 0.55);
      o2.frequency.exponentialRampToValueAtTime(40, ac.currentTime + 0.7);
      g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.85);
      o.stop(ac.currentTime + 0.9); o2.stop(ac.currentTime + 0.9);
    } catch (e){}
  }
  function lhScareTick(dt){
    if (!lh) return;
    const vis = !!(lhSet().glitchedVision);
    const raw = lh.glitched ? 1 : Math.max(0, Math.min(1, (55 - lh.sanity) / 55));
    const k = vis ? raw : raw * 0.12;
    const scare = lhEl('lhScare');
    if (scare){
      scare.classList.toggle('show', k > 0.02 || (vis && lh.glitched));
      scare.style.setProperty('--lh-vignette', k.toFixed(3));
      const staticOn = vis && k > 0.02 && (lh.glitched || lh.sanity < 90);
      scare.style.setProperty('--lh-static', staticOn ? (k * 0.85).toFixed(3) : '0');
      const stat = scare.querySelector('#lhStatic') || (typeof document !== 'undefined' && document.getElementById('lhStatic'));
      if (stat) stat.style.display = staticOn ? '' : 'none';
      scare.style.setProperty('--lh-tear', vis && k > 0.55 ? ((k - 0.55) * 1.4).toFixed(3) : '0');
      scare.style.setProperty('--lh-eyes', vis && k > 0.35 ? ((k - 0.2) * 1.1).toFixed(3) : '0');
      const blink = (Math.sin((lh.t || 0) * 3.2) * 0.5 + 0.5) < 0.08 ? 0.08 : 1;
      scare.style.setProperty('--lh-blink', String(blink));
      const eyes = scare.querySelectorAll('#lhEdgeEyes i');
      const yaw = (typeof cam !== 'undefined' && cam && cam.yaw) || 0;
      eyes.forEach((el, i) => {
        const look = Math.sin(yaw + i) * 4;
        el.style.marginLeft = look + 'px';
      });
    }
    // gentle bulb dim (not a strobe — stays well under 3 flashes/sec)
    if (lh.bulbs && lh.bulbs.length){
      const pulse = vis && k > 0.3;
      const dim = pulse ? 0.55 + Math.sin(lh.t * 1.7) * 0.35 * k : 1;
      lh.bulbs.forEach((m, i) => {
        if (!m) return;
        const phase = pulse ? (0.75 + 0.25 * Math.sin(lh.t * 1.3 + i * 0.7)) : 1;
        m.visible = true;
        if (m.material && m.material.opacity != null){
          m.material.transparent = pulse;
          m.material.opacity = pulse ? Math.max(0.25, dim * phase) : 1;
        } else if (m.scale) m.scale.setScalar(pulse ? (0.85 + 0.2 * dim * phase) : 1);
      });
    }
    try {
      if (typeof camera !== 'undefined' && camera){
        if (lh._lhCamFov == null) lh._lhCamFov = camera.fov || 70;
        const wob = vis ? k : 0;
        camera.rotation.z = Math.sin(lh.t * 4.6) * 0.07 * wob + Math.sin(lh.t * 2.1) * 0.03 * wob;
        if (camera.fov != null && camera.updateProjectionMatrix){
          camera.fov = lh._lhCamFov + Math.sin(lh.t * 2.6) * 3.2 * wob;
          camera.updateProjectionMatrix();
        }
      }
    } catch (e){}
    try { lhTickRides(dt); } catch (e){}
    lhWhisper(vis ? k : k * 0.3);
  }

  function lhVisionTick(){
    const on = !!(lh && lhSet().glitchedVision && (lh.glitched || lh.sanity <= 38));
    const n = lhEl('lhVision');
    if (n){
      n.style.display = on ? '' : 'none';
      n.classList.toggle('show', on);
    }
    if (on) lhAward('lh:vision');
    try { document.body.classList.toggle('lh-muffled', !!(lh && lhSet().muffledSound && (lh.glitched || lh.sanity < 40))); } catch (e){}
  }

  function lhHud(){
    if (!lh) return;
    const meter = lhEl('lhMeter');
    if (meter){
      meter.style.display = '';
      const fill = LH_RULES.lhEyeFill ? LH_RULES.lhEyeFill(lh.sanity) : 0;
      let html = '<div class="lh-meterbox"><div class="lh-title">Sanity</div><div class="lh-eyes">';
      for (let i = 0; i < 5; i++){
        html += '<span class="lh-eye' + (i < fill ? ' filled' : '') + '" aria-hidden="true">';
        html += i < fill ? '👁️' : '○';
        html += '</span>';
      }
      const lampWarm = !!(lh.nearLamp && !lh.glitched && !lh.nearGlitched);
      html += '</div><div class="lh-bar' + (lampWarm ? ' lh-lamp' : '') + '"><i style="width:' + Math.max(0, Math.min(100, lh.sanity)) + '%"></i></div>';
      const why = lh.glitched ? 'Fizzled — tag friends (gently!)' : lh.nearGlitched ? 'Too close to a fizzled friend…' : lampWarm ? 'The lantern warms you…' : lh.area === 'woods' || (lh.area === 'outside' && lh.dark) ? 'The fairground is dark… stay near a lantern!' : lh.dark && lh.isolated ? 'Alone in the dark…' : lh.dark ? 'It\'s pretty dark…' : lh.isolated ? 'Nobody nearby…' : 'Stay close, stay bright!';
      html += '<div class="lh-why">' + why + '</div>';
      html += '<div id="lhTickets">🎟️ ' + lhTickets() + ' ticket' + (lhTickets()===1?'':'s') + '</div></div>';
      try { meter.classList.toggle('lh-lamp', lampWarm); } catch (e){}
      if (html !== lh.lastHud){ meter.innerHTML = html; lh.lastHud = html; }
    }
    const box = lhEl('lhN');
    if (box) box.textContent = lh.glitched ? '🏮 Fizzled' : '🏮 ' + Math.round(lh.sanity) + '%';
    const p = lhPrompt();
    const act = lhEl('lhAct');
    if (act){
      if (p){ act.classList.add('show'); act.textContent = p.label; }
      else act.classList.remove('show');
    }
    const fan = lhEl('lhFanfare');
    if (fan){
      const sp = (typeof mp === 'undefined' || !mp || !mp.on);
      const near = lhCompanyNear();
      const show = sp && (lh.glitched || (near.closestG && near.bestG <= (LH_RULES.LH_SUMMON_R || 8)));
      fan.style.display = show ? '' : 'none';
      fan.classList.toggle('show', show);
    }
    const key = lhEl('lhKeyTag');
    if (key){ key.style.display = lh.keyholder === 'me' ? '' : 'none'; key.textContent = lh.keyCd > 0 ? ('🔑 ' + Math.ceil(lh.keyCd) + 's') : '🔑 Key Holder'; }
    const setb = lhEl('lhSetBtn'); if (setb) setb.style.display = '';
    const mine = lhEl('lhMyWagon'); if (mine){ mine.style.display = ''; mine.classList.add('show'); }
    const mapb = lhEl('lhMapBtn'); if (mapb){ mapb.style.display = ''; mapb.classList.add('show'); }
    const wrb = lhEl('lhWriteBtn'); if (wrb){ wrb.style.display = ''; wrb.classList.add('show'); wrb.classList.toggle('lh-ready', !!lhLookWallHit()); }
    const deb = lhEl('lhDecorBtn');
    if (deb){
      const mine = !!(lh.rooms && lh.rooms[lh.myRoom] && lh.rooms[lh.myRoom].owner === 'me' && lh.area === 'room' && lh.room === lh.myRoom);
      deb.classList.toggle('show', mine);
      deb.style.display = mine ? '' : 'none';
    }

    if (lh.mapOpen) lhDrawMap();
  }

  function lhNet(extra){
    try {
      if (typeof mp === 'undefined' || !mp || !mp.on) return;
      const msg = Object.assign({
        t: 'lh', v: 1,
        uid: mp.host ? 'H' : (mp.me || 'g0'),
        sanity: Math.round(lh.sanity),
        glitched: !!lh.glitched,
        transforming: !!lh.transforming,
        area: lh.area,
        room: lh.room,
        lights: lh.lights,
        doors: lh.doors,
        keyholder: lh.keyholder,
        riding: lh.riding ? {kind: lh.riding.kind, seat: lh.riding.seat, on: true} : null,
        decor: (lh.rooms && lh.rooms[lh.myRoom] && lh.rooms[lh.myRoom].owner === 'me') ? {room: lh.myRoom, items: (lh.prog && lh.prog.decor) || [], style: (lh.prog && lh.prog.wagonStyle) || {}} : null
      }, extra || {});
      if (typeof mpBroadcast === 'function' && mp.host) mpBroadcast(msg);
      else if (typeof mpSend === 'function') mpSend(msg);
    } catch (e){}
  }
  function lhFromGuest(g, d){
    if (!lh || !d || d.t !== 'lh') return;
    lhApplyNet(d, g && g.uid);
    if (typeof mp !== 'undefined' && mp && mp.host){
      try { if (typeof mpBroadcast === 'function') mpBroadcast(d, g && g.conn); } catch (e){}
    }
  }
  function lhFromHost(d){
    if (!lh || !d || d.t !== 'lh') return;
    lhApplyNet(d, d.uid);
  }
  function lhApplyNet(d, uid){
    if (!lh || !d) return;
    try {
      if (typeof mp !== 'undefined' && mp && mp.ents && uid){
        const E = mp.ents.get(uid);
        if (E){
          E.lh = {sanity: d.sanity, glitched: !!d.glitched, transforming: !!d.transforming};
          if (E.model) lhApplyLook(E.model, !!d.glitched);
        }
      }
    } catch (e){}
    if (d.lights){ Object.keys(d.lights).forEach(id => { const R = lh.rooms[id]; if (R && uid !== 'me') lhTintRoom(R, !!d.lights[id]); }); }
    if (d.k === 'bell' && lh.rooms[d.room]){ if (lh.transforming && lh.room === d.room) lhTryCancel('doorbell'); }
    if (d.k === 'light' && lh.rooms[d.room]){ lhTintRoom(lh.rooms[d.room], d.on); if (lh.transforming && lh.room === d.room) lhTryCancel('light'); }
    if (d.k === 'unlock' && lh.rooms[d.room]) lhSetDoor(lh.rooms[d.room], false);
    if (d.k === 'knock') lhReceiveKnock(d);
    if (d.k === 'knock-reply') lhReceiveKnockReply(d);
    if (d.k === 'doodle' && lh.rooms[d.room]){ lh.prog.doodles[d.room] = d.doodle; lhPaintWall(lh.rooms[d.room], d.doodle); }
    if (d.k === 'word'){
      if (d.op === 'add' && d.word) lhReceiveWord(d.word);
      else if (d.op === 'erase' && d.id) lhReceiveErase(d.id, d.uid);
      else if (d.op === 'sync' && Array.isArray(d.words)){
        (lh.wordMeshes || []).slice().forEach(it => { if (it && it.word) lhRemoveWordMesh(it.word.id); });
        lh.words = [];
        d.words.forEach(w => lhReceiveWord(w));
      }
    }
    if (d.keyholder && !lh.keyholder) lh.keyholder = d.keyholder;
    if (d.k === 'banish' && d.uid && (d.uid === (typeof mp !== 'undefined' && mp && mp.me))) lhStartBanish({kind:'me'});
    if (d.k === 'ride') lhApplyRemoteRide(uid, d);
    else if (d.riding) lhApplyRemoteRide(uid, d.riding);
    else if (d.riding === null && uid) lhApplyRemoteRide(uid, {on: false});
    if (d.k === 'decor') lhReceiveDecor(d);
    else if (d.decor && d.decor.room != null) lhReceiveDecor(d.decor);
  }

  function lanternUpdate(dt){
    if (!lh) return;
    dt = Math.min(0.05, +dt || 0.016);
    lh.t += dt;
    if (lh.riding){ try { lhApplyLocalRide(); } catch (e){} }
    if (lh.arcade){ try { P.vx = 0; P.vz = 0; } catch (e){} try { lhTickArcade(dt); } catch (e){} }
    if (lh.boothOpen){ try { P.vx = 0; P.vz = 0; } catch (e){} }
    if (lh.decorOpen){ try { P.vx = 0; P.vz = 0; } catch (e){} }
    if (lh.taggedLock > 0) lh.taggedLock -= dt;
    if (lh.keyCd > 0) lh.keyCd -= dt;

    // events
    if (!lh.keyholder && lh.t >= lh.keyAt && !lhSet().skipKeyholder){
      lh.keyholder = 'me';
      lhAward('lh:keys');
      if (typeof toast === 'function') toast('🔑 You got the key bunch! Unlock a friend\'s door if you need to help.');
    }
    // Maestro Gleam's serenade is handled after the current room is known,
    // and only after a continuous stay (not on entering).
    if ((!lh.vesper || !lh.vesper.on) && lh.t >= lh.vesperAt) lhSpawnVesper();
    if (lh.exitDoor && !lh.exitDoor.shown && lh.t >= lh.exitAt){
      lh.exitDoor.shown = true; if (lh.exitDoor.mesh) lh.exitDoor.mesh.visible = true;
    }
    if (lh.exitDoor && lh.exitDoor.shown && !lh.exitDoor.seen && LH_RULES.lhNear(P.x, P.z, lh.exitDoor.x, lh.exitDoor.z, 3.2)){
      lh.exitDoor.seen = true; lhAward('lh:exit');
      if (typeof toast === 'function') toast('🚪 Was that a door? It shimmers… then it\'s just wallpaper.');
    }

    const area = lhPlayerArea();
    lh.area = area.area; lh.room = area.room; lh.lit = !!area.lit; lh.dark = !!area.dark;
    const inOwnWagon = !!(lh.area === 'room' && lh.room === lh.myRoom && lh.rooms[lh.myRoom]);
    lh.songStayT = LH_RULES.lhSongStayTick ? LH_RULES.lhSongStayTick(inOwnWagon, lh.songStayT, dt) : (inOwnWagon ? (lh.songStayT || 0) + dt : 0);
    if (LH_RULES.lhSongShouldStart ? LH_RULES.lhSongShouldStart({
      inOwnRoom: inOwnWagon,
      alreadySinging: !!lh.song,
      stayT: lh.songStayT,
      lastSongAt: lh.lastSongAt,
      now: lh.t,
      test: lh.test,
      stayNeed: lh.songStayNeed,
      cooldown: lh.songCd
    }) : (inOwnWagon && !lh.song && (lh.songStayT || 0) >= (lh.songStayNeed || 50))){
      lhStartSong();
    }
    const near = lhCompanyNear();
    lh.company = !!near.company;
    // Any lantern light source: path lamps, string lights, or a lit wagon.
    lh.nearLamp = !!lhNearALamp(P.x, P.z) || !!(area.area === 'room' && area.lit);
    lh.isolated = !lh.company && !lh.glitched && !lh.nearLamp;
    lh.nearGlitched = !!near.nearG;
    lh.staring = !!near.staring;

    // mid-drain calm-down chance in bathroom when low
    if (!lh.glitched && !lh.calm && area.bath && lh.sanity < 45 && lh.sanity > 0){
      lh.breathReady += dt;
      if (lh.breathReady > 6 && Math.random() < 0.015){ lh.breathReady = 0; lhStartCalm(); }
    }

    if (lh.cut){ lh.cut.t += dt; lh.xformT += dt; if (lh.cut.t >= lh.cut.dur) lhFinishXform(); }
    else if (lh.calm){ lh.calm.t += dt; if (lh.calm.t >= lh.calm.dur) lhFinishCalm(); }
    else if (lh.banish){ lh.banish.t += dt; if (lh.banish.t >= lh.banish.dur) lhFinishBanish(); }
    else if (lh.crash){ lh.crash.t += dt; if (lh.crash.t >= lh.crash.dur){ lh.crash = null; const n = lhEl('lhCut'); if (n){ n.style.display='none'; n.classList.remove('show','lh-crash'); } } }
    else if (lh.song){ lh.song.t += dt; if (lh.song.t >= lh.song.dur){ lh.song = null; const n = lhEl('lhCut'); if (n){ n.style.display='none'; n.classList.remove('show','lh-song'); } } }
    else if (lh.allMelt){ lh.allMelt.t += dt; if (lh.allMelt.t >= lh.allMelt.dur){ lh.allMelt = null; const n = lhEl('lhCut'); if (n){ n.style.display='none'; n.classList.remove('show','lh-melt'); } } }
    else if (!lh.glitched){
      const st = lh;
      const dSan = LH_RULES.lhSanityDelta ? LH_RULES.lhSanityDelta(st, dt) : 0;
      lh.sanity = LH_RULES.lhClampSanity((lh.sanity || 0) + dSan);
      if (lh.sanity <= 0) lhBeginXform(lh.bed ? 'bed' : (area.bath ? 'mirror' : 'plain'));
    }

    if (lh.bed && (Math.abs(P.x - (area.R && area.R.bed.x || 0)) > 2 || Math.abs(P.z - (area.R && area.R.bed.z || 0)) > 2)) lh.bed = false;

    try { lhTickDoors(dt); lhOwnerAutoDoor(); lhCullTick(); lhTickPrivacy(); lhTickWordFades(dt); lhTickKnockFx(dt); } catch (e){}
    if ((lh.t * 2 | 0) !== ((lh.t - dt) * 2 | 0)) { try { lhApplyView(); } catch (e){} }
    lhMoveNpcs(dt);
    lhDoTag(dt);
    lhVisionTick();
    lhScareTick(dt);
    if (model && model._lhFX) lhBlink(model._lhFX, dt);
    if (lh.glitched && model){ try { lhApplyLook(model, true); } catch (e){} }
    // slightly faster when glitched
    try { if (lh.glitched && P){ /* speed is handled by engine; nudge */ } } catch (e){}

    lh.syncT += dt;
    if (lh.syncT > 0.25){ lh.syncT = 0; lhNet(); }
    lhHud();
  }

  try {
    if (typeof window !== 'undefined'){
      window.lhAward = lhAward;
      window.lhAct = lhAct;
      window.lhCallHost = function(){ try { lhCallHost(true); } catch (e){} };
      window.lhBeginXform = function(k){ try { lhBeginXform(k); } catch (e){} };
      window.lhStartCalm = function(){ try { lhStartCalm(); } catch (e){} };
      window.lhStartBanish = function(){ try { if (lh) lhStartBanish({kind:'me'}); } catch (e){} };
      window.lhToggleSet = function(on){ try { lhToggleSet(on); } catch (e){} };
      window.lhGoWagon = function(){ try { return lhGoWagon(); } catch (e){ return false; } };
      window.lhCharPose = lhCharPose;
      window.lhToggleMap = function(on){ try { return lhToggleMap(on); } catch (e){ return false; } };
      window.lhSetDoor = function(id, closed){ try { const R = lh && lh.rooms[id]; if (R) lhSetDoor(R, closed, 'player'); } catch (e){} };
      window.lhDoorState = function(id){
        try {
          const R = lh && lh.rooms[id == null ? lh.myRoom : id];
          if (!R || !R.door) return null;
          return {id:R.id, closed:!!R.door.closed, hold:!!R.door._holdClosed, ang:R.door.ang, target:R.door.target, plat:!!(R.door.plat && R.door.plat.active), auto:!!R.door._auto};
        } catch (e){ return {err:String(e)}; }
      };
      window.lhPerf = function(v){ try { return lhPerf(v); } catch (e){ return null; } };
      window.lhRefill = function(v){ try { if (lh){ lh.sanity = (v == null ? 100 : v); if (lh.sanity > 0) lh.glitched = false; } return lh && lh.sanity; } catch (e){ return null; } };
      window.lhKnock = function(id){ try { const R = lh && lh.rooms[id == null ? 1 : id]; return R ? lhKnock(R) : false; } catch (e){ return false; } };
      window.lhKnockReply = function(open, reason){ try { return lhKnockReply(!!open, reason); } catch (e){ return false; } };
      window.lhShowKnockPopup = function(opts){
        try {
          opts = opts || {};
          return lhShowKnockPopup({room: opts.room != null ? opts.room : (lh && lh.myRoom) || 0, from: opts.from || 'friend', fromName: opts.fromName || 'A guest', t: 0, timeout: opts.timeout || 10});
        } catch (e){ return false; }
      };
      window.lhCloseKnock = function(){ try { lhCloseKnock(); } catch (e){} };
      window.lhAssignOwners = function(){ try { lhAssignOwners(); } catch (e){} };
      window.lhOpenWrite = function(){ try { return lhOpenWrite(); } catch (e){ return false; } };
      window.lhCloseWrite = function(){ try { lhCloseWrite(); } catch (e){} };
      window.lhWriteWord = function(text, opts){ try { return lhPlaceWallWord(text, opts || {}); } catch (e){ return {ok:false, err:String(e)}; } };
      window.lhEraseWord = function(id){ try { return lhEraseMyWord(id); } catch (e){ return false; } };
      window.lhWallHit = function(){ try { return lhLookWallHit(); } catch (e){ return null; } };
      window.lhPrivacy = function(id){
        try {
          const R = lh && lh.rooms[id == null ? lh.myRoom : id];
          if (!R) return null;
          const viewer = P ? {x:P.x, z:P.z} : null;
          return {id:R.id, inside: !!(viewer && LH_RULES.lhRoomContains(R, viewer.x, viewer.z, 0.02)), doorClosed: !!(R.door && R.door.closed), visible: !!(R.interior && R.interior.visible), hasInterior: !!R.interior, childCount: R.interior ? R.interior.children.length : 0};
        } catch (e){ return {err:String(e)}; }
      };
      window.lhOpenDecor = function(){ try { return lhOpenDecor(); } catch (e){ return false; } };
      window.lhCloseDecor = function(){ try { lhCloseDecor(); } catch (e){} };
      window.lhPlaceDecor = function(id){
        try {
          if (!lh) return false;
          const cat = LH_RULES.lhDecorCatalog(lh.prog && lh.prog.prizes || {});
          const i = Math.max(0, cat.findIndex(x => x.id === id));
          lh.decorSel = i >= 0 ? i : 0;
          if (id && i < 0){ /* still try */ }
          return lhPlaceSelectedDecor();
        } catch (e){ return false; }
      };
      window.lhSetStyle = function(wall, floor){
        try {
          if (!lh) return null;
          lh.prog = lh.prog || lhProg();
          lh.prog.wagonStyle = LH_RULES.lhNormalizeStyle({wall: wall || (lh.prog.wagonStyle && lh.prog.wagonStyle.wall), floor: floor || (lh.prog.wagonStyle && lh.prog.wagonStyle.floor)});
          lhAward('lh:decor');
          lhSaveDecor();
          return lh.prog.wagonStyle;
        } catch (e){ return {err:String(e)}; }
      };
      window.lhDecorState = function(){
        try {
          const R = lh && lh.rooms && lh.rooms[lh.myRoom];
          return {open: !!(lh && lh.decorOpen), style: lh && lh.prog && lh.prog.wagonStyle, items: lh && lh.prog && lh.prog.decor, childCount: R && R.decorG ? R.decorG.children.length : 0, parent: R && R.decorG && R.decorG.parent && R.decorG.parent.name};
        } catch (e){ return {err:String(e)}; }
      };
      window.lhOpenGame = function(id){ try { return lhOpenGame(id || 'rings'); } catch (e){ return false; } };

      window.lhCloseGame = function(){ try { lhCloseArcade(); } catch (e){} };
      window.lhOpenBooth = function(){ try { return lhOpenBooth(); } catch (e){ return false; } };
      window.lhCloseBooth = function(){ try { lhCloseBooth(); } catch (e){} };
      window.lhTickets = function(v){ try { if (!lh) return 0; lh.prog = lh.prog || lhProg(); if (v != null){ lh.prog.tickets = Math.max(0, v|0); lhSaveProg(lh.prog); } return lhTickets(); } catch (e){ return 0; } };
      window.lhBuyPrize = function(id){ try { return lhBuyAtBooth(id); } catch (e){ return false; } };
      window.lhGoGames = function(id){
        try {
          const g = (lh && lh.games || []).find(x => x.id === (id || 'rings')) || (lh && lh.games && lh.games[0]);
          if (!g || typeof P === 'undefined' || !P) return false;
          P.x = g.x + 1.6; P.y = 0.12; P.z = g.z + 1.6; P.vx = 0; P.vy = 0; P.vz = 0;
          return true;
        } catch (e){ return false; }
      };
      window.lhGoBooth = function(){
        try {
          if (!lh || !lh.booth || typeof P === 'undefined' || !P) return false;
          P.x = lh.booth.x + 1.4; P.y = 0.12; P.z = lh.booth.z + 1.6; P.vx = 0; P.vy = 0; P.vz = 0;
          return true;
        } catch (e){ return false; }
      };
      window.lhBoardRide = function(kind, seat){

        try {
          const ride = (kind && lhRideByKind(kind)) || lhNearRide() || (lh && lh.rides && lh.rides[0]);
          return ride ? lhBoardRide(ride, seat) : false;
        } catch (e){ return false; }
      };
      window.lhDismount = function(){ try { return lhDismountRide(); } catch (e){ return false; } };
      window.lhRideState = function(){
        try {
          if (!lh) return null;
          return {
            riding: lh.riding,
            pos: (typeof P !== 'undefined' && P) ? {x:P.x, y:P.y, z:P.z} : null,
            rides: (lh.rides || []).map(r => ({kind:r.kind, x:r.x, z:r.z, seats:(r.seats||[]).length, taken:(r.taken||[]).slice()}))
          };
        } catch (e){ return {err:String(e)}; }
      };
      window.lhGoRides = function(kind){
        try {
          const ride = lhRideByKind(kind || 'ferris') || (lh && lh.rides && lh.rides[0]);
          if (!ride || typeof P === 'undefined' || !P) return false;
          P.x = ride.x + 4.2; P.y = 0.12; P.z = ride.z; P.vx = 0; P.vy = 0; P.vz = 0;
          return true;
        } catch (e){ return false; }
      };
      window.lhSetGlitched = function(on){
        try {
          if (!lh) return false;
          lh.glitched = !!on;
          if (on) lh.sanity = 0;
          else if (lh.sanity <= 0) lh.sanity = 100;
          try { if (typeof model !== 'undefined' && model) lhApplyLook(model, !!on); } catch (e){}
          return !!lh.glitched;
        } catch (e){ return false; }
      };
    }
  } catch (e){}

  /* ===================== end Lantern Big Top ===================== */
