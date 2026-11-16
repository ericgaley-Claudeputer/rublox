  /* ===================== t286u: 🏮 LANTERN HOTEL ===================== */
  const LH_RULES = (typeof LHRules !== 'undefined' && LHRules) ? LHRules : (typeof window !== 'undefined' && window.LHRules) || {};
  const LH_KEY = LH_RULES.LH_KEY || 'rubloxLantern';
  const LH_HOST = LH_RULES.LH_HOST || 'Fanfare';
  const LH_HOST_TITLE = LH_RULES.LH_HOST_TITLE || 'Miss Fanfare';
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
    return LH_RULES.lhLoadState ? LH_RULES.lhLoadState(raw) : {ver:1, visits:0, settings:{glitchedVision:true, muffledSound:true, cancellation:'fifty', skipKeyholder:false}, doodles:{}, coins:0};
  }
  function lhSaveProg(p){
    p = p || (lh && lh.prog) || lhProg();
    try {
      const body = {ver: LH_RULES.LH_VER || 1, visits: p.visits|0, settings: (LH_RULES.lhNormalizeSettings ? LH_RULES.lhNormalizeSettings(p.settings) : p.settings), doodles: p.doodles || {}, coins: +p.coins || 0};
      if (typeof save === 'function') save(LH_KEY, body);
      else if (typeof localStorage !== 'undefined') localStorage.setItem(LH_KEY, JSON.stringify(body));
    } catch (e){}
  }
  function lhSet(){ return (lh && lh.prog && lh.prog.settings) || (LH_RULES.lhDefaultSettings ? LH_RULES.lhDefaultSettings() : {glitchedVision:true, muffledSound:true, cancellation:'fifty', skipKeyholder:false}); }
  function lhLow(){ try { return (typeof gfxIsLow === 'function' && gfxIsLow()) || (typeof LOWQ !== 'undefined' && LOWQ); } catch (e){ return false; } }

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
    const body = new THREE.Mesh(new THREE.BoxGeometry(1.15, 2.4, 0.85), lhMat('#120814', {basic:true}));
    body.position.y = 1.2;
    g.add(body);
    const jag = new THREE.Mesh(new THREE.BoxGeometry(1.35, 0.35, 1.0), lhMat('#2a1030', {basic:true, emit:'#3a1548'}));
    jag.position.y = 1.7; jag.rotation.z = 0.2;
    g.add(jag);
    const cols = ['#7cff4f', '#00e5ff', '#ff2bd6', '#ffe600', '#ff7ad9', '#7f7cff'];
    const eyes = [];
    const n = lhLow() ? 6 : 11;
    for (let i = 0; i < n; i++){
      const tex = lhEyeTex(cols[i % cols.length]);
      const pl = new THREE.Mesh(new THREE.PlaneGeometry(0.32, 0.24), new THREE.MeshBasicMaterial({map: tex, transparent: true, depthWrite: false, side: THREE.DoubleSide}));
      pl.position.set((Math.random() - 0.5) * 1.1, 0.7 + Math.random() * 1.8, 0.4 + (Math.random() - 0.5) * 0.5);
      g.add(pl);
      eyes.push({m: pl, t: Math.random() * 2, per: 0.6 + Math.random() * 1.2, col: cols[i % cols.length]});
    }
    g.visible = false;
    parent.add(g);
    if (lh) lh.trash.push(g);
    return {g, body, jag, eyes};
  }

  function lhApplyLook(slot, on){
    if (!slot) return;
    on = !!on;
    const root = slot.g || (slot.model && slot.model.g);
    if (!root) return;
    if (!slot._lhFX) slot._lhFX = lhMkGlitch(root);
    slot._lhFX.g.visible = on;
    if (slot.head) slot.head.visible = !on;
    root.traverse(o => {
      if (o === slot._lhFX.g || (slot._lhFX.g && slot._lhFX.g.children && slot._lhFX.g.children.indexOf(o) >= 0)) return;
      if (o.isLight) return;
      if (o.parent === slot._lhFX.g || (slot._lhFX.g && o.parent && slot._lhFX.g.getObjectById && slot._lhFX.g.getObjectById(o.id))) return;
    });
    // hide normal body meshes by fading the root's non-fx children
    root.children.forEach(ch => {
      if (ch === slot._lhFX.g) return;
      ch.visible = !on;
    });
  }

  function lhBlink(fx, dt){
    if (!fx || !fx.eyes) return;
    fx.eyes.forEach(e => {
      e.t += dt;
      const k = (Math.sin(e.t / e.per * Math.PI * 2) * 0.5 + 0.5);
      if (e.m && e.m.scale) e.m.scale.y = k < 0.12 ? 0.08 : 1;
    });
    if (fx.jag) fx.jag.rotation.z = 0.15 + Math.sin((lh && lh.t || 0) * 8) * 0.2;
    if (fx.body) fx.body.position.x = Math.sin((lh && lh.t || 0) * 11) * 0.04;
  }

  function lhRoomsSpec(){
    // six private rooms along a south hallway
    const specs = [];
    const zs = [11, 18, 25];
    zs.forEach((z, i) => {
      specs.push({id: i, x: -13, z, side: -1, owner: null});
      specs.push({id: i + 3, x: 13, z, side: 1, owner: null});
    });
    return specs;
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
      doodleOpen: false, setOpen: false, lastHud: '',
      trash: [], fish: [], boards: null, fxMe: null,
      syncT: 0, visitAwarded: false, _nearT: 0, _isoT: 0, _darkT: 0,
      breathReady: 0, serenadeAt: 0, vesperAt: 0, exitAt: 0, keyAt: 0,
      lastDing: 0, savedFp: null
    };
    scene.background = new THREE.Color('#7ec8ff');
    if (scene.fog){ scene.fog.color = new THREE.Color('#b8e4ff'); scene.fog.near = lhLow() ? 22 : 36; scene.fog.far = lhLow() ? 70 : 110; }
    // floors
    lhBox(0, 0, -2, 38, 22, '#f6d7ef', 0.2);
    // checker tiles on lobby (cheap)
    if (!lhLow()){
      for (let i = -4; i <= 4; i++) for (let j = -3; j <= 2; j++){
        if (((i + j) & 1) === 0) lhBox(i * 2.2, 0.11, j * 2.2 - 2, 2.15, 2.15, '#fff7fb', 0.02);
      }
    }
    // lobby walls / ceiling lip
    lhBox(0, 2.2, -13.1, 38, 0.4, '#ff8fc8', 4.4);
    lhBox(-19.1, 2.2, -2, 0.4, 22, '#ffb3de', 4.4);
    lhBox(19.1, 2.2, -2, 0.4, 22, '#ffb3de', 4.4);
    // front wall of lobby opening into hallway at z=9
    lhBox(-12, 2.2, 8.9, 14, 0.4, '#ffa8d4', 4.4);
    lhBox(12, 2.2, 8.9, 14, 0.4, '#ffa8d4', 4.4);
    // colorful pillars
    [[-10, -8], [10, -8], [-10, 4], [10, 4]].forEach(([x, z], i) => {
      const cols = ['#7cffd0', '#ffd25a', '#8ecaff', '#ff8ad8'];
      lhBox(x, 2.2, z, 0.8, 0.8, cols[i], 4.4);
    });
    // desk + stage for Miss Fanfare
    lhBox(0, 0.6, -10.2, 6, 2.4, '#6b3cff', 0.6);
    lhBox(0, 0.15, -10.2, 7.2, 3.2, '#ffd25a', 0.15);
    lhLabel(LH_HOST_TITLE, 'rgba(80,20,90,.92)', 0, 3.3, -10.2);
    // aquarium lounge (east)
    lhBox(14, 0, -6, 10, 10, '#b9f3ff', 0.12);
    // tank
    const tank = lhMesh(new THREE.BoxGeometry(6.4, 3.2, 1.6), lhMat('#7fe7ff', {trans:0.35, emit:'#3ad0ff'}), 15.4, 1.8, -9.4);
    lhBox(15.4, 0.2, -9.4, 6.6, 1.8, '#245a70', 0.4);
    lhLabel('Aquarium Lounge', 'rgba(10,60,80,.9)', 14, 3.6, -5.2);
    if (!lhLow()){
      const fcols = ['#ff7ad9', '#7cff4f', '#ffd25a', '#00e5ff'];
      for (let i = 0; i < 5; i++){
        const f = lhMesh(new THREE.BoxGeometry(0.35, 0.18, 0.12), lhMat(fcols[i % 4], {basic:true}), 13.4 + Math.random() * 4, 1.2 + Math.random() * 1.6, -9.4);
        lh.fish.push({m: f, t: Math.random() * 10, a: 13.2 + Math.random() * 4, b: 1.1 + Math.random() * 1.6});
      }
    }
    // board (top fizzles)
    lh.boards = lhLabel('⭐ Top fizzles\n— none yet —', 'rgba(20,30,60,.9)', 12.4, 2.6, -3.4);

    // hallway
    lhBox(0, 0, 20, 8, 24, '#efe0ff', 0.12);
    lhBox(-4.2, 2.2, 20, 0.35, 24, '#d9b8ff', 4.4);
    lhBox(4.2, 2.2, 20, 0.35, 24, '#d9b8ff', 4.4);
    lhBox(0, 4.5, 20, 8.4, 24, '#fff0fb', 0.2);
    // runner carpet
    lhBox(0, 0.13, 20, 2.2, 23, '#ff5aa0', 0.04);

    // rooms
    const specs = lhRoomsSpec();
    specs.forEach(R => {
      const w = 8, d = 6.2, h = 3.2;
      const wall = ['#ffb3de', '#b9f0c8', '#ffd7a0', '#c5d8ff', '#f3c6ff', '#ffe29a'][R.id];
      const floor = ['#fff1f8', '#e8fff2', '#fff6e8', '#eef4ff', '#fbecff', '#fff8e0'][R.id];
      lhBox(R.x, 0, R.z, w, d, floor, 0.12);
      // outer (back) wall
      lhBox(R.x + R.side * (w / 2 + 0.12), h / 2, R.z, 0.28, d + 0.3, wall, h);
      // side walls
      lhBox(R.x, h / 2, R.z - d / 2, w, 0.28, wall, h);
      lhBox(R.x, h / 2, R.z + d / 2, w, 0.28, wall, h);
      // inner wall with door gap (toward hallway)
      const ix = R.x - R.side * (w / 2);
      lhBox(ix, h / 2, R.z - 2.15, 0.28, 2.0, wall, h);
      lhBox(ix, h / 2, R.z + 2.15, 0.28, 2.0, wall, h);
      // ceiling
      lhBox(R.x, h, R.z, w + 0.2, d + 0.2, '#fff7fb', 0.16);
      // bed
      const bx = R.x + R.side * 1.8, bz = R.z;
      lhBox(bx, 0.42, bz, 2.2, 1.5, '#fffaf0', 0.42);
      lhBox(bx + R.side * 0.7, 0.7, bz, 0.4, 1.5, '#ff8fc8', 0.3);
      // light switch plate
      const sx = ix - R.side * 0.2, sz = R.z - 1.35;
      const sw = lhMesh(new THREE.BoxGeometry(0.12, 0.3, 0.2), lhMat('#fffbe8', {emit:'#fff3b0'}), sx, 1.4, sz);
      // doorbell outside
      const dx = ix + R.side * 0.25, dz = R.z + 1.2;
      const bell = lhMesh(new THREE.BoxGeometry(0.16, 0.22, 0.16), lhMat('#ffd25a', {emit:'#ffcc44'}), dx, 1.35, dz);
      // crayon wall (side)
      const cx = R.x, cz = R.z - d / 2 + 0.2;
      const crayon = lhMesh(new THREE.BoxGeometry(2.8, 1.8, 0.08), lhMat('#fffef6'), cx, 1.5, cz);
      // door slab (closed = blocking plat)
      const door = {mesh: null, plat: null, closed: false, id: R.id};
      const rec = {id: R.id, x: R.x, z: R.z, side: R.side, w, d, bed: {x: bx, z: bz}, switch: {x: sx, z: sz}, bell: {x: dx, z: dz}, wall: {x: cx, z: cz}, crayon, door, owner: null, lit: true, sw, bellM: bell};
      lh.rooms.push(rec);
      lh.lights[R.id] = true;
      lh.doors[R.id] = false;
      lhLabel('Room ' + (R.id + 1), 'rgba(80,20,60,.88)', R.x, 2.9, R.z - 2.6);
    });

    // bathroom at end of hall
    lhBox(0, 0, 35.2, 12, 8, '#d9f4ff', 0.12);
    lhBox(0, 2.2, 39.2, 12, 0.3, '#b9e0f0', 4.4);
    lhBox(-6, 2.2, 35.2, 0.3, 8, '#b9e0f0', 4.4);
    lhBox(6, 2.2, 35.2, 0.3, 8, '#b9e0f0', 4.4);
    // sinks + stalls + mirror
    lhBox(-3.2, 0.7, 37.6, 2.6, 0.8, '#eef8ff', 0.7);
    lhBox(3.2, 0.7, 37.6, 2.6, 0.8, '#eef8ff', 0.7);
    const mirror = lhMesh(new THREE.BoxGeometry(2.2, 1.6, 0.08), lhMat('#cfefff', {emit:'#e8fbff'}), 0, 1.9, 38.95);
    lh.mirror = {x: 0, z: 37.8, mesh: mirror};
    lhBox(-4.6, 1.4, 33.6, 1.8, 1.8, '#c5dbe6', 2.8);
    lhBox(4.6, 1.4, 33.6, 1.8, 1.8, '#c5dbe6', 2.8);
    lhLabel('Bathrooms', 'rgba(20,50,70,.9)', 0, 3.2, 35.2);

    // stairs + balcony (isolation ledge)
    for (let i = 0; i < 6; i++){
      lhBox(-8, 0.18 + i * 0.42, -11.6 - i * 0.55, 2.4, 1.1, '#ffd25a', 0.18);
    }
    lhBox(-8, 2.7, -16.4, 8, 5, '#ffd9ef', 0.18);
    lhBox(-8, 3.6, -18.8, 8.2, 0.25, '#ff8fc8', 1.8);
    lhLabel('Lookout', 'rgba(80,20,60,.9)', -8, 4.4, -16.4);

    // dark nook
    lhBox(-16.5, 0, 6.5, 5, 5, '#2a2040', 0.12);
    lhBox(-16.5, 1.6, 4.1, 5, 0.25, '#1a1528', 3.2);
    lhBox(-18.9, 1.6, 6.5, 0.25, 5, '#1a1528', 3.2);
    lh.nook = {x: -16.5, z: 6.5};
    lhLabel('…', 'rgba(20,10,30,.85)', -16.5, 2.2, 6.5);

    // cellar is a far island (no walk-in door) so first-person recover
    // cannot snap the player up into the lobby floor above them.
    const CX = 0, CZ = 92;
    lhBox(CX, 0, CZ, 16, 14, '#3a2a28', 0.3);
    lhBox(CX, 2.8, CZ - 7, 16, 0.4, '#2a1c1a', 5.6);
    lhBox(CX, 2.8, CZ + 7, 16, 0.4, '#2a1c1a', 5.6);
    lhBox(CX - 8, 2.8, CZ, 0.4, 14, '#2a1c1a', 5.6);
    lhBox(CX + 8, 2.8, CZ, 0.4, 14, '#2a1c1a', 5.6);
    lhBox(CX, 5.7, CZ, 16.2, 14.2, '#1a1210', 0.25);
    [[-4, -3], [4, -3], [-4, 3], [4, 3]].forEach(([x, z]) => lhBox(CX + x, 1.6, CZ + z, 0.35, 0.35, '#ffb347', 1.6));
    lhLabel('The Cellar', 'rgba(40,20,20,.92)', CX, 3.2, CZ);
    lh.cellar = {x: CX, y: 0.05, z: CZ};

    // mysterious exit (hidden until later)
    const ed = lhMesh(new THREE.BoxGeometry(1.6, 2.6, 0.2), lhMat('#9b7cff', {emit:'#c5b0ff', trans:0.15}), 16.5, 1.4, 6.2);
    ed.visible = false;
    lh.exitDoor = {x: 16.5, z: 6.2, mesh: ed, shown: false, seen: false};

    // host NPC
    try {
      const hostAv = {head:'#ffd9b0', hair:'curl', hairColor:'#3a1860', shirt:'#d61c8c', pants:'#2a1040', hat:'party', body:'girl', shirtPat:'sparkly'};
      const hm = (typeof buildPlayer === 'function') ? buildPlayer(hostAv) : null;
      if (hm && hm.g){
        hm.g.position.set(0, 0.7, -10.2);
        scene.add(hm.g);
        lh.trash.push(hm.g);
        lh.host = {model: hm, x: 0, z: -10.2, y: 0.7, face: 0, name: LH_HOST_TITLE, kind: 'host'};
      }
    } catch (e){}

    // NPC guests (single-player companionship)
    const npcAv = [
      {head:'#f6c89a', hair:'short', hairColor:'#2a1a10', shirt:'#3a86ff', pants:'#1d2340', hat:null, body:'boy'},
      {head:'#ffd23f', hair:'curl', hairColor:'#5a2a00', shirt:'#2ec27e', pants:'#164e3a', hat:'backcap', body:'girl'},
      {head:'#f3b48a', hair:'long', hairColor:'#1a1a1a', shirt:'#ff6fb5', pants:'#5b2dff', hat:null, body:'girl'},
      {head:'#e8c4a0', hair:'spiky', hairColor:'#f2e2a0', shirt:'#ff9f1c', pants:'#3d6fb5', hat:'propeller', body:'boy'}
    ];
    const spots = [{x:-6, z:-2}, {x:6, z:1}, {x:-3, z:4}, {x:4, z:-6}];
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
    if (lh.rooms[mine]) lh.rooms[mine].owner = 'me';
    if (lh.rooms[mine]) lhLabel('Your room', 'rgba(80,20,60,.92)', lh.rooms[mine].x, 3.15, lh.rooms[mine].z);

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
    try {
      if (test === 'glitch' && lh.rooms[lh.myRoom]){
        const R = lh.rooms[lh.myRoom];
        Object.assign(P, {x: R.x, y: 0.05, z: R.z, vx:0, vy:0, vz:0});
      } else if (test === 'cellar'){
        Object.assign(P, {x: 0, y: 0.05, z: 2, vx:0, vy:0, vz:0});
      } else {
        Object.assign(P, {x: 0, y: 0.05, z: 0, vx:0, vy:0, vz:0});
      }
    } catch (e){}

    // respawn() always reads checkpoints[cpIndex].spawn
    try {
      const sx = (typeof P !== 'undefined' && P && isFinite(P.x)) ? P.x : 0;
      const sz = (typeof P !== 'undefined' && P && isFinite(P.z)) ? P.z : 0;
      if (typeof checkpoints !== 'undefined'){
        checkpoints[0] = {spawn: {x: sx, y: 0.05, z: sz}, idx: 0, lit: true, b: {mesh: {position: {x: sx, y: 0, z: sz}}, hw: 1, hh: 0.1, hd: 1, active: false}, flag: {visible: false, rotation: {x: 0, y: 0, z: 0}}, flagMat: {color: {set: function(){}}, emissive: {set: function(){}}}};
      }
      if (typeof cpIndex !== 'undefined') cpIndex = 0;
    } catch (e){}

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

  function lhSetDoor(R, closed){
    if (!R || !R.door) return;
    R.door.closed = !!closed;
    lh.doors[R.id] = !!closed;
    const ix = R.x - R.side * (R.w / 2);
    if (!R.door.plat){
      R.door.plat = plat(ix, 1.6, R.z, 0.3, 2.3, '#6b3cff', 3.2);
      if (R.door.plat && R.door.plat.mesh) lh.trash.push(R.door.plat.mesh);
    }
    const b = R.door.plat;
    if (b){
      b.active = !!closed;
      if (b.mesh) b.mesh.visible = !!closed;
    }
  }

  function lanternEnter(){
    const el = lhEl('lhBox'); if (el) el.style.display = '';
    ['lhMeter','lhRoot'].forEach(id => { const n = lhEl(id); if (n) n.style.display = 'block'; });
    if (!window.__lhBound){
      window.__lhBound = true;
      const act = lhEl('lhAct'); if (act) act.onclick = () => lhAct();
      const fan = lhEl('lhFanfare'); if (fan) fan.onclick = () => { lhCallHost(true); };
      const setb = lhEl('lhSetBtn'); if (setb) setb.onclick = () => lhToggleSet();
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
      if (typeof cam !== "undefined" && cam){ cam.pitch = 0.16; cam.dist = 7; if (cam.yaw == null) cam.yaw = Math.PI; }
    } catch (e){}
    lhHookChat();
    lhWriteSettings();
    // visits
    if (lh && lh.prog){
      if (lh.prog.visits <= 0){ lhAward('lh:welcome'); lh.prog.visits = 1; }
      else { lhAward('lh:back'); lh.prog.visits += 1; }
      lhSaveProg(lh.prog);
    }
    if (lh){
      lh.serenadeAt = 28 + Math.random() * 10;
      lh.vesperAt = 40 + Math.random() * 20;
      lh.exitAt = 22;
      lh.keyAt = 16;
      if (lh.test === 'vesper') lh.vesperAt = 0.6;
      if (lh.test === 'song') lh.serenadeAt = 0.8;
      if (lh.test === 'exit') lh.exitAt = 0.5;
      if (lh.test === 'cellar'){ lh.keyAt = 99; setTimeout(() => { try { if (lh && lh.test === 'cellar') lhStartBanish(lh.npcs.find(n => n.glitched) || {kind:'me'}); } catch (e){} }, 900); }
    }
    lhHud();
    try { if (typeof chSync === 'function') chSync(); } catch (e){}
  }

  function lanternStop(){
    try {
      ['lhMeter','lhBox','lhRoot','lhCut','lhCalm','lhSet','lhDraw','lhVision'].forEach(id => {
        const n = lhEl(id); if (!n) return;
        if (id === 'lhMeter' || id === 'lhBox' || id === 'lhRoot') n.style.display = 'none';
        else { n.classList.remove('show'); n.style.display = 'none'; }
      });
      const act = lhEl('lhAct'); if (act) act.classList.remove('show');
    } catch (e){}
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
    if (!(LH_RULES.lhHostNameIn ? LH_RULES.lhHostNameIn(text) : /fanfare/i.test(String(text||'')))) return;
    const fromMe = !uid || uid === 'me' || (typeof mp !== 'undefined' && mp && (uid === mp.me || (mp.host && uid === 'H')));
    if (fromMe || true) lhCallHost(false, uid);
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
    if (lh.cellar && P.z > 80) return {area:'cellar', room:-1, lit:false, dark:true, bath:false, cellar:true};
    if (P.z > 31 && Math.abs(P.x) < 6.2) return {area:'bath', room:-1, lit:true, dark:false, bath:true, cellar:false};
    if (P.z < -14 && P.y > 2) return {area:'ledge', room:-1, lit:true, dark:false, bath:false, cellar:false};
    if (lh.nook && LH_RULES.lhNear(P.x, P.z, lh.nook.x, lh.nook.z, 3.2)) return {area:'nook', room:-1, lit:false, dark:true, bath:false, cellar:false};
    if (P.x > 9 && P.z < 0 && P.z > -12) return {area:'aquarium', room:-1, lit:true, dark:false, bath:false, cellar:false};
    for (let i = 0; i < lh.rooms.length; i++){
      const R = lh.rooms[i];
      if (Math.abs(P.x - R.x) < R.w / 2 - 0.1 && Math.abs(P.z - R.z) < R.d / 2 - 0.1){
        const lit = !!R.lit;
        return {area:'room', room:i, lit, dark:!lit, bath:false, cellar:false, R};
      }
    }
    if (Math.abs(P.x) < 4.2 && P.z > 8.5 && P.z < 32) return {area:'hall', room:-1, lit:true, dark:false, bath:false, cellar:false};
    return {area:'lobby', room:-1, lit:true, dark:false, bath:false, cellar:false};
  }

  function lhPrompt(){
    if (!lh || lh.cut || lh.calm || lh.banish) return null;
    const a = lhPlayerArea();
    const near = lhCompanyNear();
    // doorbell / lights from hallway
    for (let i = 0; i < lh.rooms.length; i++){
      const R = lh.rooms[i];
      if (LH_RULES.lhNear(P.x, P.z, R.bell.x, R.bell.z, 1.4)) return {id:'bell', label:'🛎️ Ring doorbell', R};
      if (R.door.closed && LH_RULES.lhNear(P.x, P.z, R.x - R.side * (R.w / 2), R.z, 1.6)){
        if (R.owner === 'me') return {id:'door', label: R.door.closed ? '🚪 Open door' : '🚪 Close door', R};
        if (lh.keyholder === 'me') return {id:'unlock', label:'🔑 Unlock room', R};
      }
    }
    if (a.R){
      const R = a.R;
      if (LH_RULES.lhNear(P.x, P.z, R.switch.x, R.switch.z, 1.5)) return {id:'light', label: R.lit ? '💡 Turn lights off' : '💡 Turn lights on', R};
      if (LH_RULES.lhNear(P.x, P.z, R.bed.x, R.bed.z, 1.6)) return {id:'bed', label: lh.bed ? '🛏️ Get up' : '🛏️ Sit on bed', R};
      if (R.owner === 'me' && LH_RULES.lhNear(P.x, P.z, R.wall.x, R.wall.z, 1.7)) return {id:'draw', label:'🖍️ Draw on the wall', R};
      if (R.owner === 'me' && !R.door.closed && LH_RULES.lhNear(P.x, P.z, R.x - R.side * (R.w / 2), R.z, 1.6)) return {id:'door', label:'🚪 Close door', R};
      if (R.owner === 'me' && R.door.closed && LH_RULES.lhNear(P.x, P.z, R.x - R.side * (R.w / 2), R.z, 1.8)) return {id:'door', label:'🚪 Open door', R};
    }
    if (a.bath && lh.mirror && LH_RULES.lhNear(P.x, P.z, lh.mirror.x, lh.mirror.z, 2.2)) return {id:'mirror', label:'🪞 Look in the mirror'};
    if (lh.host && LH_RULES.lhNear(P.x, P.z, lh.host.x, lh.host.z, 2.6)) return {id:'host', label:'🎩 Talk to ' + LH_HOST_TITLE};
    if (near.closestG && near.bestG < (LH_RULES.LH_SUMMON_R || 8)) return {id:'fanfare', label:'🎩 Call ' + LH_HOST_TITLE};
    if (lh.glitched) return {id:'fanfare', label:'🎩 Call ' + LH_HOST_TITLE};
    return null;
  }

  function lhAct(){
    if (!lh) return;
    if (lh.cut || lh.calm || lh.banish){ lhSkipCut(); return true; }
    const p = lhPrompt();
    if (!p) return false;
    if (p.id === 'bell') lhRing(p.R);
    else if (p.id === 'light') lhToggleLight(p.R);
    else if (p.id === 'door') lhSetDoor(p.R, !p.R.door.closed);
    else if (p.id === 'unlock') lhUnlock(p.R);
    else if (p.id === 'bed'){ lh.bed = !lh.bed; if (lh.bed){ P.x = p.R.bed.x; P.z = p.R.bed.z; } }
    else if (p.id === 'draw') lhOpenDraw(p.R);
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
      'If someone fizzles, type my name — Fanfare — nearby.',
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
    const near = lhCompanyNear();
    let target = null;
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
      const cap = lhEl('lhCutCap'); if (cap) cap.textContent = '👁️ Oh no… you\'re all fizzled! Stay silly, not scary — time to tag friends!';
      const eyes = lhEl('lhCutEyes');
      if (eyes) eyes.innerHTML = '<i></i><i></i><i></i><i></i><i></i><i></i>';
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
    if (typeof toast === 'function') toast('🎵 ' + LH_HOST_TITLE + ' sings: “Lanterns glow, don\'t walk alone — stay together, we\'re going home!”');
    const n = lhEl('lhCut');
    if (n){
      n.style.display = ''; n.classList.add('show', 'lh-song');
      const cap = lhEl('lhCutCap'); if (cap) cap.textContent = '🎵 Lanterns glow, don\'t walk alone, stay together, we\'re going home! Keep the lights on, stay in view — Miss Fanfare\'s watching over you!';
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
    if (lh.doodleOpen || lh.setOpen){
      if (e.code === 'Escape' || e.key === 'Escape'){ lhCloseDraw(); lhToggleSet(false); return true; }
      return false;
    }
    if (lh.cut || lh.calm || lh.banish || lh.crash || lh.song || lh.allMelt){
      if (e.code === 'Escape' || e.code === 'Space' || e.code === 'KeyE' || e.key === 'Enter'){ lhSkipCut(); return true; }
    }
    if (e.code === 'KeyE' && !e.repeat){ lhAct(); return true; }
    if (e.code === 'KeyV') return false;
    return false;
  }
  function lhPad(jp){
    if (!lh || !jp) return false;
    // X = use (button 2), B = back (1), A is jump
    if (jp[2] && !lh._padX){ lh._padX = true; lhAct(); return true; }
    if (!jp[2]) lh._padX = false;
    if (jp[1] && (lh.doodleOpen || lh.setOpen || lh.cut || lh.calm || lh.banish)){ lhCloseDraw(); lhToggleSet(false); lhSkipCut(); return true; }
    if (jp[8] && !lh._padView){ lh._padView = true; /* view often chat */ }
    if (!jp[8]) lh._padView = false;
    return false;
  }

  function lhMoveNpcs(dt){
    if (!lh) return;
    const wps = [{x:0,z:0},{x:-6,z:-4},{x:6,z:-4},{x:0,z:8},{x:0,z:20},{x:-13,z:11},{x:13,z:11},{x:0,z:34},{x:14,z:-5}];
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
      if (d > 0.2){ n.x += dx / d * sp * dt; n.z += dz / d * sp * dt; n.face = Math.atan2(dx, dz); }
      if (n.model && n.model.g){
        n.model.g.position.set(n.x, n.y || 0, n.z);
        n.model.g.rotation.y = n.face || 0;
      }
      if (n.model && n._lhFX) lhBlink(n._lhFX, dt);
      if (n.model && n.model._lhFX) lhBlink(n.model._lhFX, dt);
    });
    if (lh.host && lh.host.model && lh.host.model.g){
      lh.host.model.g.position.set(lh.host.x, lh.host.y, lh.host.z);
      // gentle sway
      lh.host.model.g.rotation.y = Math.sin(lh.t * 0.7) * 0.4;
    }
    if (lh.vesper && lh.vesper.on){
      lh.vesper.x += Math.sin(lh.t * 0.6) * dt * 0.8;
      lh.vesper.z += Math.cos(lh.t * 0.5) * dt * 0.8;
      if (lh.vesper.model && lh.vesper.model.g) lh.vesper.model.g.position.set(lh.vesper.x, 0, lh.vesper.z);
      if (!lh.vesper.seen && LH_RULES.lhNear(P.x, P.z, lh.vesper.x, lh.vesper.z, 6)){
        lh.vesper.seen = true; lhAward('lh:vesper');
        if (typeof toast === 'function') toast('🌙 A late-night visitor waves from the hall…');
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
        if (typeof toast === 'function') toast('💨 You got tagged! Back to the bright lobby.');
        if (typeof big === 'function') big('Tagged!');
        setTimeout(() => { try { if (typeof big === 'function') big(''); } catch (e){} }, 900);
      } else {
        lh.sanity = LH_RULES.lhClampSanity(lh.sanity - 35);
        lh.taggedLock = 1.0;
        if (typeof toast === 'function') toast('💨 A fizzled guest tagged you! Sanity dipped.');
      }
    }
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
      html += '</div><div class="lh-bar"><i style="width:' + Math.max(0, Math.min(100, lh.sanity)) + '%"></i></div>';
      const why = lh.glitched ? 'Fizzled — tag friends (gently!)' : lh.nearGlitched ? 'Too close to a fizzled friend…' : lh.dark && lh.isolated ? 'Alone in the dark…' : lh.dark ? 'It\'s pretty dark…' : lh.isolated ? 'Nobody nearby…' : 'Stay close, stay bright!';
      html += '<div class="lh-why">' + why + '</div></div>';
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
        keyholder: lh.keyholder
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
    if (d.k === 'doodle' && lh.rooms[d.room]){ lh.prog.doodles[d.room] = d.doodle; lhPaintWall(lh.rooms[d.room], d.doodle); }
    if (d.keyholder && !lh.keyholder) lh.keyholder = d.keyholder;
    if (d.k === 'banish' && d.uid && (d.uid === (typeof mp !== 'undefined' && mp && mp.me))) lhStartBanish({kind:'me'});
  }

  function lanternUpdate(dt){
    if (!lh) return;
    dt = Math.min(0.05, +dt || 0.016);
    lh.t += dt;
    if (lh.taggedLock > 0) lh.taggedLock -= dt;
    if (lh.keyCd > 0) lh.keyCd -= dt;

    // events
    if (!lh.keyholder && lh.t >= lh.keyAt && !lhSet().skipKeyholder){
      lh.keyholder = 'me';
      lhAward('lh:keys');
      if (typeof toast === 'function') toast('🔑 You got the key bunch! Unlock a friend\'s door if you need to help.');
    }
    if (!lh.song && lh.t >= lh.serenadeAt && lh.area === 'room' && lh.room === lh.myRoom && lh.rooms[lh.myRoom] && lh.rooms[lh.myRoom].door.closed){
      lhStartSong();
    }
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
    const near = lhCompanyNear();
    lh.company = !!near.company;
    lh.isolated = !lh.company && !lh.glitched;
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

    lhMoveNpcs(dt);
    lhDoTag(dt);
    lhVisionTick();
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
    }
  } catch (e){}

  /* ===================== end Lantern Hotel ===================== */
