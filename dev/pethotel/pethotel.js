  /* ===================== Pet Hotel (original game): check in guest pets, care for them, check out for coins. ===================== */
  const PH_KEY = 'rubloxPetHotel';
  const PH_CARES = ['feed', 'bathe', 'play', 'bed'];
  const PH_CARE_LABEL = {feed: 'Feed', bathe: 'Bathe', play: 'Play', bed: 'Bed'};
  const PH_NEED_LABEL = {feed: 'Feed', bathe: 'Bath', play: 'Play', bed: 'Sleep'};
  // BMP-safe icons only — no plate/bed/bell glyphs that show as a broken box in the HUD font.
  const PH_CARE_ICON = {feed: '🍖', bathe: '💧', play: '🎾', bed: '💤'};
  const PH_DESK_ICON = '🔔';
  const PH_HOTEL_ICON = '🏨';
  const PH_PAY_BASE = 8, PH_PAY_CARE = 3, PH_PAY_ALL = 6;
  // Original critters and names only — made up for Rublox, not copied from any other work.
  const PH_PETS = [
    {id: 'mochi', name: 'Mochi', kind: 'Beanpup', e: '🐶', col: '#c9894c', acc: '#8a4f24', ear: '#6d3a18', eye: '#2a1a10', shape: 'pup'},
    {id: 'puddle', name: 'Puddle', kind: 'Puffcat', e: '🐱', col: '#8aa0b8', acc: '#f4c6d4', ear: '#f4c6d4', eye: '#2a1a10', shape: 'cat'},
    {id: 'bumble', name: 'Bumble', kind: 'Pipkin', e: '🐥', col: '#e6b84c', acc: '#5c3a14', ear: '#5c3a14', eye: '#3d2a12', shape: 'pip'},
    {id: 'noodle', name: 'Noodle', kind: 'Looper', e: '🐾', col: '#d9a441', acc: '#3d2a12', ear: '#3d2a12', eye: '#2a1a10', shape: 'loop'},
    {id: 'pippa', name: 'Pippa', kind: 'Cloudhen', e: '🐣', col: '#f3efe4', acc: '#f6c85c', ear: '#f6c85c', eye: '#5c3a14', shape: 'hen'},
    {id: 'tater', name: 'Tater', kind: 'Rumblepup', e: '🐾', col: '#b45d32', acc: '#f0d5b0', ear: '#6b2e16', eye: '#2a1a10', shape: 'rumble'}
  ];
  const PH_GUESTS = [
    {name: 'Ms. Maple', col: '#d96b8a'},
    {name: 'Mr. Pebble', col: '#3a86ff'},
    {name: 'Aunt Cinder', col: '#7b5ea7'},
    {name: 'Coach Yarrow', col: '#2a9d8f'},
    {name: 'Nana Pip', col: '#e76f51'},
    {name: 'Uncle Moss', col: '#4d7c46'}
  ];
  const PH_STATIONS = [
    {id: 'desk', name: 'Front desk', e: PH_DESK_ICON, x: 0, z: -6.2, r: 3.2},
    {id: 'feed', name: 'Snack nook', e: PH_CARE_ICON.feed, x: -6.5, z: 2.2, r: 3.2},
    {id: 'bathe', name: 'Wash room', e: PH_CARE_ICON.bathe, x: 6.5, z: 2.2, r: 3.2},
    {id: 'play', name: 'Play nook', e: PH_CARE_ICON.play, x: -6.5, z: 8.2, r: 3.2},
    {id: 'bed', name: 'Sleep rooms', e: PH_CARE_ICON.bed, x: 6.5, z: 8.2, r: 3.2}
  ];
  // Known-bad glyphs that rendered as a empty box in the header font.
  const PH_BAD_GLYPHS = ['🍽️', '🛏️', '🛎️', '🫘', '🛁'];
  let ph = null;

  function phPetOf(id){ return PH_PETS.find(p => p.id === id) || PH_PETS[0]; }
  function phFreshSave(){ return {ver: 1, served: 0, earned: 0, tipsSeen: {}}; }
  function phLoadSave(){
    try {
      const r = (typeof load === 'function') ? load(PH_KEY, null) : null;
      if (!r || typeof r !== 'object') return phFreshSave();
      return {ver: 1, served: Math.max(0, r.served | 0), earned: Math.max(0, r.earned | 0), tipsSeen: (r.tipsSeen && typeof r.tipsSeen === 'object') ? r.tipsSeen : {}};
    } catch (e){ return phFreshSave(); }
  }
  function phWriteSave(){
    if (!ph || ph.remote) return false;
    if (typeof save !== 'function') return false;
    save(PH_KEY, {ver: 1, served: ph.served | 0, earned: ph.earned | 0, tipsSeen: ph.tipsSeen || {}});
    return true;
  }
  function phPayout(stay){
    if (!stay) return 0;
    const n = PH_CARES.reduce((s, c) => s + (stay.done && stay.done[c] ? 1 : 0), 0);
    return PH_PAY_BASE + n * PH_PAY_CARE + (n === PH_CARES.length ? PH_PAY_ALL : 0);
  }
  function phCaresLeft(stay){ return stay ? PH_CARES.filter(c => !(stay.done && stay.done[c])) : PH_CARES.slice(); }
  function phReadyOut(stay){ return !!(stay && PH_CARES.every(c => stay.done && stay.done[c])); }
  function phCareDoneCount(stay){ return stay ? PH_CARES.reduce((s, c) => s + (stay.done && stay.done[c] ? 1 : 0), 0) : 0; }
  function phNewStay(seed){
    const i = Math.abs(seed | 0);
    const pet = PH_PETS[i % PH_PETS.length];
    const guest = PH_GUESTS[i % PH_GUESTS.length];
    const done = {}; PH_CARES.forEach(c => { done[c] = false; });
    return {id: i + 1, petId: pet.id, petName: pet.name, kind: pet.kind, emoji: pet.e, guest: guest.name, guestCol: guest.col, done, phase: 'arrive'};
  }
  function phCheckIn(state){
    if (!state || state.stay) return false;
    const stay = state.next || phNewStay((state.served | 0) + 1);
    stay.phase = 'stay';
    state.stay = stay;
    state.next = null;
    state.wait = 0;
    return stay;
  }
  function phDoCare(stay, care){
    if (!stay || stay.phase !== 'stay') return false;
    if (PH_CARES.indexOf(care) < 0) return false;
    if (stay.done && stay.done[care]) return false;
    stay.done = stay.done || {};
    stay.done[care] = true;
    return true;
  }
  function phCheckOut(state){
    if (!state || !state.stay || !phReadyOut(state.stay)) return null;
    const pay = phPayout(state.stay);
    const rec = {pet: state.stay.petName, guest: state.stay.guest, pay};
    state.served = (state.served | 0) + 1;
    state.earned = (state.earned | 0) + pay;
    state.stay = null;
    state.wait = 2.2;
    state.next = phNewStay(state.served + 1);
    return rec;
  }
  function phActAt(state, station){
    if (!state || !station) return {ok: false, why: ''};
    if (station === 'desk'){
      if (!state.stay){
        const st = phCheckIn(state);
        return st ? {ok: true, act: 'checkin', stay: st} : {ok: false, why: 'No guest is ready yet'};
      }
      if (phReadyOut(state.stay)){
        const rec = phCheckOut(state);
        return rec ? {ok: true, act: 'checkout', rec} : {ok: false, why: 'Could not check out'};
      }
      const left = phCaresLeft(state.stay);
      return {ok: false, why: 'Finish ' + left.map(c => PH_CARE_LABEL[c].toLowerCase()).join(', ') + ' first'};
    }
    if (!state.stay) return {ok: false, why: 'Check a guest in at the front desk first'};
    if (phDoCare(state.stay, station)) return {ok: true, act: 'care', care: station, stay: state.stay};
    if (state.stay.done && state.stay.done[station]) return {ok: false, why: 'Already done'};
    return {ok: false, why: 'That station is not ready'};
  }
  function phNeedsBarHtml(stay){
    return '<span class="phneeds">' + PH_CARES.map(c => {
      const on = !!(stay && stay.done && stay.done[c]);
      return '<span class="phneed' + (on ? ' on' : '') + '" data-care="' + c + '">' + PH_CARE_ICON[c] + '&nbsp;' + PH_NEED_LABEL[c] + '</span>';
    }).join('') + '</span>';
  }
  function phHudTextHasBadGlyph(s){
    if (!s) return false;
    return PH_BAD_GLYPHS.some(g => String(s).indexOf(g) >= 0);
  }
  function phLow(){ return typeof gfxIsLow === 'function' && gfxIsLow(); }
  function phSeg(){ return phLow() ? 8 : 12; }
  function phMat(col, opts){
    const o = Object.assign({color: col}, opts || {});
    if (phLow() && o.emissive) delete o.emissive;
    const Ctor = (phLow() && THREE.MeshBasicMaterial) ? THREE.MeshBasicMaterial : THREE.MeshLambertMaterial;
    return new Ctor(o);
  }
  function phShared(key, col, opts){
    if (!ph) return phMat(col, opts);
    ph._mats = ph._mats || {};
    if (!ph._mats[key]) ph._mats[key] = phMat(col, opts);
    return ph._mats[key];
  }
  function phG(name, make){
    if (!ph) return make();
    ph._geo = ph._geo || {};
    if (!ph._geo[name]) ph._geo[name] = make();
    return ph._geo[name];
  }
  function phUnitBox(){ return phG('unitbox', () => new THREE.BoxGeometry(1, 1, 1)); }
  function phUnitBall(){ return phG('unitball', () => new THREE.SphereGeometry(1, phSeg(), Math.max(6, phSeg() - 2))); }
  function phUnitCyl(){ return phG('unitcyl', () => new THREE.CylinderGeometry(1, 1, 1, phSeg())); }
  function phMark(m, kind){
    if (m){ m.userData = m.userData || {}; m.userData.ph = kind; }
    if (ph){
      ph.props.push(m);
      ph.kinds = ph.kinds || {};
      if (kind) ph.kinds[kind] = (ph.kinds[kind] || 0) + 1;
    }
    return m;
  }
  function phAdd(m){
    if (typeof scene !== 'undefined') scene.add(m);
    return m;
  }
  function phBox(x, y, z, w, h, d, col, key, kind){
    const m = new THREE.Mesh(phUnitBox(), typeof col === 'string' ? phShared(key || col, col) : col);
    m.position.set(x, y, z);
    m.scale.set(w, h, d);
    phAdd(m);
    return phMark(m, kind || 'box');
  }
  function phBall(x, y, z, r, col, key, kind){
    const m = new THREE.Mesh(phUnitBall(), typeof col === 'string' ? phShared(key || col, col) : col);
    m.position.set(x, y, z);
    m.scale.set(r, r, r);
    phAdd(m);
    return phMark(m, kind || 'ball');
  }
  function phCyl(x, y, z, r, h, col, key, kind){
    const m = new THREE.Mesh(phUnitCyl(), typeof col === 'string' ? phShared(key || col, col) : col);
    m.position.set(x, y, z);
    m.scale.set(r, h, r);
    phAdd(m);
    return phMark(m, kind || 'cyl');
  }
  function phWallpaperMat(id, base, dot){
    const key = 'wp-' + id;
    if (ph && ph._mats[key]) return ph._mats[key];
    let mat = phMat(base);
    try {
      if (typeof document !== 'undefined' && document.createElement && typeof THREE !== 'undefined' && THREE.CanvasTexture){
        const c = document.createElement('canvas'); c.width = 32; c.height = 32;
        const g = c.getContext && c.getContext('2d');
        if (g){
          g.fillStyle = base; g.fillRect(0, 0, 32, 32);
          if (id === 'stripe'){
            g.fillStyle = dot;
            for (let x = 0; x < 32; x += 8) g.fillRect(x, 0, 4, 32);
          } else {
            g.fillStyle = dot;
            for (let y = 4; y < 32; y += 8) for (let x = 4; x < 32; x += 8){
              g.beginPath(); g.arc(x + ((y / 8) % 2) * 4, y, 1.7, 0, Math.PI * 2); g.fill();
            }
          }
          const tex = new THREE.CanvasTexture(c);
          if (THREE.RepeatWrapping){ tex.wrapS = THREE.RepeatWrapping; tex.wrapT = THREE.RepeatWrapping; }
          if (tex.repeat && tex.repeat.set) tex.repeat.set(6, 3);
          tex.needsUpdate = true;
          mat = phMat(base, {map: tex});
          mat.map = tex;
        }
      }
    } catch (e){}
    if (ph){ ph._mats = ph._mats || {}; ph._mats[key] = mat; }
    return mat;
  }
  function phPaperWall(x, y, z, w, h, d, id, base, dot, kind){
    const m = new THREE.Mesh(phUnitBox(), phWallpaperMat(id, base, dot));
    m.position.set(x, y, z);
    m.scale.set(w, h, d);
    phAdd(m);
    return phMark(m, kind || 'wallpaper');
  }
  function phPlant(x, z, scale){
    const s = scale || 1;
    phCyl(x, 0.16 * s, z, 0.16 * s, 0.28 * s, '#c97b5a', 'pot', 'plant');
    phBall(x, 0.48 * s, z, 0.28 * s, '#3fa66a', 'leaf', 'plant');
    phBall(x + 0.16 * s, 0.62 * s, z + 0.04 * s, 0.18 * s, '#62c47a', 'leaf2', 'plant');
    if (!phLow()) phBall(x - 0.12 * s, 0.58 * s, z - 0.06 * s, 0.14 * s, '#2e8a4f', 'leaf3', 'plant');
  }
  function phWindow(x, y, z, w, h){
    phBox(x, y, z, w + 0.16, h + 0.16, 0.12, '#fff6e8', 'wframe', 'window');
    phBox(x, y, z + 0.02, w, h, 0.08, '#8ecae6', 'glass', 'window');
    phBox(x, y, z + 0.01, 0.06, h, 0.09, '#fff6e8', 'wframe', 'window');
    phBox(x, y, z + 0.01, w, 0.06, 0.09, '#fff6e8', 'wframe', 'window');
    phBox(x, y - h * 0.55, z + 0.08, w + 0.2, 0.08, 0.18, '#e8c9a0', 'sill', 'window');
  }
  function phHeartMesh(col){
    const g = new THREE.Group();
    const mat = phShared('heart-' + col, col);
    // Dedicated tiny geometry so mood hearts can never inherit the unit 1 m ball/box scale.
    const sph = phG('heartsph', () => new THREE.SphereGeometry(0.045, 6, 6));
    const box = phG('heartbox', () => new THREE.BoxGeometry(0.07, 0.07, 0.04));
    const a = new THREE.Mesh(sph, mat); a.position.set(-0.035, 0.02, 0); g.add(a);
    const b = new THREE.Mesh(sph, mat); b.position.set(0.035, 0.02, 0); g.add(b);
    const c = new THREE.Mesh(box, mat); c.position.set(0, -0.03, 0); c.rotation.z = Math.PI / 4; g.add(c);
    g.userData.ph = 'heart';
    return g;
  }
  function phMakePetMesh(pet){
    const g = new THREE.Group();
    const segs = phSeg();
    const shape = pet.shape || 'pup';
    const bodyR = shape === 'loop' ? 0.28 : (shape === 'rumble' ? 0.48 : 0.42);
    const body = new THREE.Mesh(phUnitBall(), phShared('p-' + pet.id, pet.col));
    body.position.y = shape === 'loop' ? 0.28 : bodyR;
    if (shape === 'loop') body.scale.set(0.55, 0.28, 0.28);
    else if (shape === 'hen') body.scale.set(bodyR * 1.05, bodyR * 0.9, bodyR * 1.05);
    else if (shape === 'cat') body.scale.set(bodyR * 1.05, bodyR * 0.95, bodyR * 1.15);
    else body.scale.set(bodyR, bodyR, bodyR);
    g.add(body);
    const head = new THREE.Mesh(phUnitBall(), phShared('p-' + pet.id, pet.col));
    const hx = shape === 'loop' ? 0.48 : 0;
    const hy = shape === 'loop' ? 0.52 : (bodyR + 0.38);
    const hz = shape === 'loop' ? 0.12 : 0.32;
    head.position.set(hx, hy, hz);
    head.scale.set(0.36, 0.34, 0.34);
    g.add(head);
    const ears = new THREE.Group();
    const earMat = phShared('e-' + pet.id, pet.ear);
    const earH = shape === 'cat' ? 0.26 : (shape === 'hen' || shape === 'pip' ? 0.12 : 0.18);
    const earW = shape === 'loop' ? 0.08 : 0.14;
    [[-0.18, 0.22], [0.18, 0.22]].forEach(([ex, ey]) => {
      const ear = new THREE.Mesh(phUnitBox(), earMat);
      ear.position.set(head.position.x + ex, head.position.y + ey, head.position.z - 0.02);
      ear.scale.set(earW, earH, 0.08);
      if (shape === 'pup' || shape === 'rumble' || shape === 'loop') ear.rotation.z = ex < 0 ? 0.5 : -0.5;
      if (shape === 'cat'){ ear.scale.set(0.12, 0.26, 0.08); ear.rotation.z = ex < 0 ? 0.2 : -0.2; }
      ears.add(ear);
    });
    g.add(ears);
    // Big eyes: whites, pupils, highlight
    const eyes = new THREE.Group();
    [[-0.11, 0.04, 0.28], [0.11, 0.04, 0.28]].forEach(([ex, ey, ez]) => {
      const white = new THREE.Mesh(phUnitBall(), phShared('eye-w', '#fffdf6'));
      white.position.set(head.position.x + ex, head.position.y + ey, head.position.z + ez);
      white.scale.set(0.09, 0.11, 0.07);
      eyes.add(white);
      const pup = new THREE.Mesh(phUnitBall(), phShared('eye-p-' + pet.id, pet.eye || '#2a1a10'));
      pup.position.set(white.position.x, white.position.y, white.position.z + 0.045);
      pup.scale.set(0.045, 0.055, 0.03);
      eyes.add(pup);
      const hi = new THREE.Mesh(phUnitBall(), phShared('eye-h', '#ffffff'));
      hi.position.set(white.position.x + 0.02, white.position.y + 0.03, white.position.z + 0.06);
      hi.scale.set(0.018, 0.018, 0.012);
      eyes.add(hi);
    });
    g.add(eyes);
    const nose = new THREE.Mesh(phUnitBall(), phShared('a-' + pet.id, pet.acc));
    nose.position.set(head.position.x, head.position.y - 0.04, head.position.z + 0.32);
    nose.scale.set(0.07, 0.055, 0.07);
    g.add(nose);
    if (shape === 'hen' || shape === 'pip'){
      const beak = new THREE.Mesh(phUnitBox(), phShared('beak', '#f4a261'));
      beak.position.set(head.position.x, head.position.y - 0.04, head.position.z + 0.38);
      beak.scale.set(0.08, 0.05, 0.12);
      g.add(beak);
    }
    const tail = new THREE.Mesh(shape === 'cat' || shape === 'loop' ? phUnitCyl() : phUnitBall(), phShared('p-' + pet.id, pet.col));
    if (shape === 'loop'){ tail.position.set(-0.5, 0.3, -0.05); tail.scale.set(0.08, 0.08, 0.55); tail.rotation.y = 0.4; }
    else if (shape === 'cat'){ tail.position.set(0, 0.55, -0.42); tail.scale.set(0.07, 0.07, 0.42); tail.rotation.x = -0.6; }
    else if (shape === 'hen'){ tail.position.set(0, 0.55, -0.38); tail.scale.set(0.16, 0.14, 0.08); }
    else { tail.position.set(0.1, 0.35, -0.38); tail.scale.set(0.14, 0.14, 0.18); }
    g.add(tail);
    // Mood: hearts when happy, blue bubbles/tears when a need is unmet
    const hearts = new THREE.Group();
    hearts.position.set(0, hy + 0.55, hz);
    [[-0.1, 0], [0.1, 0.08]].forEach(([hx2, hy2], i) => {
      const h = phHeartMesh(i === 1 ? '#ff7aa2' : '#ff4d6d');
      h.position.set(hx2, hy2, 0);
      hearts.add(h);
    });
    hearts.visible = false;
    g.add(hearts);
    const tears = new THREE.Group();
    const bubbleN = phLow() ? 2 : 3;
    for (let i = 0; i < bubbleN; i++){
      const drop = new THREE.Mesh(phUnitBall(), phShared('tear', '#7fd6ff', {transparent: !phLow(), opacity: phLow() ? 1 : 0.85}));
      drop.position.set((i - 1) * 0.16, hy + 0.5 + i * 0.12, hz + 0.1);
      drop.scale.set(0.07 + i * 0.02, 0.07 + i * 0.02, 0.07 + i * 0.02);
      tears.add(drop);
    }
    tears.visible = false;
    g.add(tears);
    g.userData.petId = pet.id;
    g.userData.eyes = eyes;
    g.userData.ears = ears;
    g.userData.tail = tail;
    g.userData.hearts = hearts;
    g.userData.tears = tears;
    g.userData.headY = hy;
    return g;
  }
  function phApplyMood(mesh, stay){
    if (!mesh || !mesh.userData) return 'none';
    const n = phCareDoneCount(stay);
    const happy = !stay || n >= 2 || phReadyOut(stay);
    const sad = !!(stay && n === 0);
    if (mesh.userData.hearts) mesh.userData.hearts.visible = !!happy && (!stay || n > 0);
    if (mesh.userData.tears) mesh.userData.tears.visible = !!sad;
    mesh.userData.mood = sad ? 'sad' : (happy && stay && n > 0 ? 'happy' : 'neutral');
    return mesh.userData.mood;
  }
  function phMakeGuestMesh(guestCol){
    const g = new THREE.Group();
    const body = new THREE.Mesh(phUnitBox(), phShared('g-' + guestCol, guestCol));
    body.position.y = 1.0; body.scale.set(0.5, 1.0, 0.32); g.add(body);
    const head = new THREE.Mesh(phUnitBox(), phShared('skin', '#f0c9a8'));
    head.position.y = 1.68; head.scale.set(0.38, 0.38, 0.38); g.add(head);
    // simple cute face so the guest is readable next to the pet
    const eyeM = phShared('eye-p-guest', '#2a1a10');
    [-0.08, 0.08].forEach(ex => {
      const e = new THREE.Mesh(phUnitBall(), eyeM);
      e.position.set(ex, 1.72, 0.2); e.scale.set(0.045, 0.05, 0.03); g.add(e);
    });
    const hair = new THREE.Mesh(phUnitBox(), phShared('g-' + guestCol, guestCol));
    hair.position.set(0, 1.9, 0); hair.scale.set(0.4, 0.1, 0.4); g.add(hair);
    return g;
  }
  function phBuildDesk(){
    if (typeof plat === 'function'){
      const d = plat(0, 0.7, -7.0, 5.4, 1.8, '#c97b5a', 1.2); if (d) d.camSkip = true;
    }
    phBox(0, 0.68, -7.0, 5.4, 1.28, 1.7, '#c97b5a', 'deskbody', 'desk');
    phBox(0, 1.34, -6.95, 5.6, 0.1, 2.0, '#e8c9a0', 'desktop', 'desk');
    // gold bell with a visible dome and button
    phCyl(0.9, 1.42, -6.5, 0.16, 0.06, '#b8860b', 'bellbase', 'bell');
    phBall(0.9, 1.58, -6.5, 0.16, '#ffd23f', 'bell', 'bell');
    phBall(0.9, 1.74, -6.5, 0.05, '#fff6c9', 'belltip', 'bell');
    // guestbook and flower cup
    phBox(-0.9, 1.42, -6.55, 0.5, 0.06, 0.36, '#fff6e8', 'book', 'desk');
    phBox(-0.9, 1.46, -6.55, 0.42, 0.04, 0.28, '#3a86ff', 'book2', 'desk');
    phCyl(-1.6, 1.48, -6.5, 0.08, 0.2, '#fff6e8', 'vase', 'desk');
    phBall(-1.6, 1.64, -6.5, 0.12, '#d96b8a', 'flower', 'plant');
    // warm desk lamp
    phCyl(1.7, 1.5, -7.3, 0.06, 0.28, '#5c3a14', 'lampstem', 'desk');
    phCyl(1.7, 1.72, -7.15, 0.16, 0.1, '#ffe08a', 'lampsade', 'desk');
  }
  function phBuildSnack(){
    if (typeof plat === 'function'){ const m = plat(-6.5, 0.04, 2.2, 4.4, 3.6, '#ffe08a', .06); if (m) m.floorOnly = true; }
    // Open treat shelf facing the room (thin back, visible jars)
    phBox(-6.5, 1.1, 1.0, 2.6, 1.7, 0.1, '#c9894c', 'shelf', 'shelf');
    phBox(-6.5, 0.28, 1.25, 2.6, 0.08, 0.5, '#e8c9a0', 'shelf', 'shelf');
    phBox(-6.5, 0.9, 1.25, 2.5, 0.08, 0.5, '#fff6e8', 'shelf', 'shelf');
    phBox(-6.5, 1.5, 1.25, 2.5, 0.08, 0.5, '#fff6e8', 'shelf', 'shelf');
    phBox(-7.75, 1.1, 1.22, 0.08, 1.7, 0.48, '#c9894c', 'shelf', 'shelf');
    phBox(-5.25, 1.1, 1.22, 0.08, 1.7, 0.48, '#c9894c', 'shelf', 'shelf');
    [['#ff6fb5', -7.2, 0.52], ['#7fd6ff', -6.5, 0.52], ['#ffe08a', -5.8, 0.52], ['#9ff0c8', -7.2, 1.14], ['#ff9f6b', -6.5, 1.14], ['#c39bff', -5.8, 1.14]].forEach(([c, x, y]) => {
      phCyl(x, y, 1.28, 0.14, 0.28, c, 'jar-' + c, 'treat');
    });
    // food bowls out in front of the shelf
    [[-7.1, 2.35, '#f4a261'], [-6.5, 2.55, '#e76f51'], [-5.9, 2.35, '#2a9d8f']].forEach(([x, z, food]) => {
      phCyl(x, 0.12, z, 0.28, 0.1, '#fff6e8', 'bowl', 'bowl');
      phCyl(x, 0.16, z, 0.2, 0.06, food, 'food-' + food, 'bowl');
    });
  }
  function phBuildBath(){
    if (typeof plat === 'function'){ const m = plat(6.5, 0.04, 2.2, 4.6, 3.8, '#8ecae6', .06); if (m) m.floorOnly = true; }
    // Hollow tub: floor + four walls, water and bubbles sitting in the open top
    phBox(6.5, 0.1, 2.3, 2.2, 0.16, 1.25, '#f1f5f9', 'tub', 'tub');
    phBox(6.5, 0.4, 1.74, 2.2, 0.55, 0.14, '#f1f5f9', 'tub', 'tub');
    phBox(6.5, 0.4, 2.86, 2.2, 0.55, 0.14, '#f1f5f9', 'tub', 'tub');
    phBox(5.48, 0.4, 2.3, 0.14, 0.55, 1.25, '#f1f5f9', 'tub', 'tub');
    phBox(7.52, 0.4, 2.3, 0.14, 0.55, 1.25, '#f1f5f9', 'tub', 'tub');
    phBox(6.5, 0.22, 2.3, 1.9, 0.12, 0.95, '#5ec8ff', 'water', 'tub');
    const bubbles = phLow() ? 4 : 8;
    for (let i = 0; i < bubbles; i++){
      const bx = 6.5 + (i % 3 - 1) * 0.28;
      const bz = 2.3 + ((i % 3) - 1) * 0.16;
      phBall(bx, 0.42 + (i % 4) * 0.14, bz, 0.08 + (i % 3) * 0.03, '#ffffff', 'bubble', 'bubble');
    }
    // soap + towel
    phBox(7.5, 0.22, 1.5, 0.3, 0.12, 0.3, '#ffb3c7', 'soap', 'bath');
    phBox(5.5, 0.7, 1.4, 0.08, 0.7, 0.4, '#fff6e8', 'towel', 'bath');
    phBox(5.5, 1.08, 1.4, 0.5, 0.08, 0.16, '#c9894c', 'rack', 'bath');
    // little yellow bath buddy (original, not a branded duck)
    phBall(7.05, 0.42, 2.55, 0.14, '#ffe08a', 'buddy', 'bath');
    phBall(7.12, 0.5, 2.66, 0.08, '#ffe08a', 'buddy', 'bath');
    phBox(7.18, 0.48, 2.74, 0.08, 0.04, 0.08, '#f4a261', 'beak', 'bath');
  }
  function phBuildPlay(){
    if (typeof plat === 'function'){ const m = plat(-6.5, 0.04, 8.2, 5.0, 4.6, '#b8e986', .06); if (m) m.floorOnly = true; }
    // toys: balls, blocks, a hoop, a yarn roll
    phBall(-7.3, 0.2, 8.5, 0.2, '#ff4d5e', 'toy-red', 'toy');
    phBall(-5.7, 0.16, 7.6, 0.16, '#3a86ff', 'toy-blue', 'toy');
    phBall(-6.2, 0.14, 8.9, 0.14, '#ffe08a', 'toy-yel', 'toy');
    phBox(-7.4, 0.16, 7.5, 0.28, 0.28, 0.28, '#9b5de5', 'block', 'toy');
    phBox(-7.4, 0.4, 7.5, 0.22, 0.22, 0.22, '#00bbf9', 'block2', 'toy');
    phBox(-7.15, 0.14, 7.7, 0.22, 0.22, 0.22, '#fee440', 'block3', 'toy');
    phCyl(-5.8, 0.16, 8.5, 0.16, 0.14, '#ff6fb5', 'yarn', 'toy');
    // play hoop
    phCyl(-6.5, 0.7, 9.4, 0.55, 0.08, '#f4a261', 'hoop', 'toy');
  }
  function phBuildBeds(){
    if (typeof plat === 'function'){ const m = plat(6.5, 0.04, 8.2, 4.8, 4.2, '#e8c4ff', .06); if (m) m.floorOnly = true; }
    const bed = (x, z, blanket, pillow) => {
      phBox(x, 0.16, z, 1.6, 0.16, 1.15, '#c9894c', 'bedframe', 'bed');
      phBox(x, 0.28, z, 1.5, 0.2, 1.0, '#fff6e8', 'mattress', 'bed');
      phBox(x, 0.42, z + 0.08, 1.35, 0.14, 0.7, blanket, 'blanket-' + blanket, 'bed');
      phBox(x, 0.46, z - 0.36, 0.7, 0.2, 0.36, pillow, 'pillow-' + pillow, 'bed');
    };
    bed(5.7, 8.5, '#7fd6ff', '#fff0f6');
    bed(7.3, 8.5, '#ffb3c7', '#fff6c9');
    phBox(6.5, 0.35, 7.2, 0.5, 0.5, 0.4, '#c9894c', 'night', 'bed');
    phCyl(6.5, 0.72, 7.2, 0.08, 0.16, '#ffe08a', 'nightlamp', 'bed');
  }
  function phBuildHotel(){
    if (typeof plat === 'function'){
      const floor = plat(0, 0, 3, 28, 26, '#f8efe3', .3); if (floor) floor.floorOnly = true;
      // collision walls (taller, colorful rooms)
      plat(0, 2.0, -10.5, 26, 0.5, '#f3c6d8', 4.0);
      plat(-13.7, 2.0, 2.5, 0.5, 25, '#c9e8c0', 4.0);
      plat(13.7, 2.0, 2.5, 0.5, 25, '#c9d4ff', 4.0);
      plat(-8.6, 2.0, 14.8, 10.4, 0.5, '#f7d9a8', 4.0);
      plat(8.6, 2.0, 14.8, 10.4, 0.5, '#f7d9a8', 4.0);
    }
    // wallpaper skins just inside the collision walls
    phPaperWall(0, 2.05, -10.22, 25.2, 3.9, 0.08, 'dots', '#f3c6d8', '#ffe8f2', 'wallpaper');
    phPaperWall(-13.42, 2.05, 2.5, 0.08, 3.9, 24.2, 'stripe', '#c9e8c0', '#e8f8dc', 'wallpaper');
    phPaperWall(13.42, 2.05, 2.5, 0.08, 3.9, 24.2, 'dots', '#c9d4ff', '#e8eeff', 'wallpaper');
    phPaperWall(-8.6, 2.05, 14.52, 10.0, 3.9, 0.08, 'stripe', '#f7d9a8', '#fff0cc', 'wallpaper');
    phPaperWall(8.6, 2.05, 14.52, 10.0, 3.9, 0.08, 'stripe', '#f7d9a8', '#fff0cc', 'wallpaper');
    // baseboard trim
    phBox(0, 0.12, -10.15, 25.2, 0.24, 0.1, '#fff6e8', 'trim', 'trim');
    phBox(-13.35, 0.12, 2.5, 0.1, 0.24, 24.2, '#fff6e8', 'trim', 'trim');
    phBox(13.35, 0.12, 2.5, 0.1, 0.24, 24.2, '#fff6e8', 'trim', 'trim');
    // windows on the back wall
    phWindow(-6.5, 2.3, -10.1, 2.2, 1.6);
    phWindow(0, 2.3, -10.1, 2.2, 1.6);
    phWindow(6.5, 2.3, -10.1, 2.2, 1.6);
    // lobby rug with a border
    phBox(0, 0.06, 0.2, 6.4, 0.06, 5.2, '#8a2f4a', 'rugedge', 'rug');
    phBox(0, 0.08, 0.2, 5.6, 0.06, 4.4, '#d96b8a', 'rug', 'rug');
    phBox(0, 0.09, 0.2, 1.2, 0.05, 1.2, '#ffe08a', 'rugin', 'rug');
    // corner plants
    phPlant(-4.2, -8.4, 1.1);
    phPlant(4.2, -8.4, 1.0);
    phPlant(-11.6, 2.2, 1.2);
    if (!phLow()){ phPlant(11.6, 2.2, 1.1); phPlant(-11.4, 10.5, 1.0); phPlant(11.4, 10.5, 1.0); }
    phBuildDesk();
    phBuildSnack();
    phBuildBath();
    phBuildPlay();
    phBuildBeds();
    PH_STATIONS.forEach(s => {
      if (typeof label === 'function'){
        const L = label(s.e + ' ' + s.name, 'rgba(29,35,64,.92)');
        if (L && L.position){ L.position.set(s.x, 2.6, s.z); if (L.scale) L.scale.set(2.0, 0.55, 1); if (typeof scene !== 'undefined') scene.add(L); if (ph) ph.props.push(L); }
      }
    });
  }
  function buildPetHotel(){
    const sv = phLoadSave();
    ph = {
      stay: null, next: null, wait: 0.6, served: sv.served, earned: sv.earned, tipsSeen: sv.tipsSeen || {},
      near: null, at: null, remote: !!(typeof mpGuest === 'function' && mpGuest()),
      props: [], kinds: {}, pets: [], guestM: null, petM: null, dirty: true, toast: '', toastT: 0, _mats: {}, _geo: {}, seed: sv.served + 1, t: 0
    };
    ph.next = phNewStay(ph.seed);
    if (typeof scene !== 'undefined'){
      scene.background = new THREE.Color('#b8e4ff');
      if (scene.fog){ scene.fog.color = new THREE.Color('#d8efff'); scene.fog.near = phLow() ? 28 : 40; scene.fog.far = phLow() ? 80 : 120; }
    }
    phBuildHotel();
    Object.assign(P, {x: 0, y: 0.05, z: 3.2, vx: 0, vy: 0, vz: 0});
    P.face = 0;
    if (typeof cam !== 'undefined'){ cam.yaw = 0; cam.pitch = 0.2; cam.dist = 11; }
    if (typeof checkpoints !== 'undefined') checkpoints[0] = {idx: 0, spawn: {x: 0, y: 0.05, z: 3.2}, flag: (typeof THREE !== 'undefined' ? new THREE.Object3D() : {})};
    phSyncActors();
    phHud();
  }
  function phClearActors(){
    if (!ph) return;
    ['guestM', 'petM'].forEach(k => {
      if (ph[k] && typeof scene !== 'undefined'){ try { scene.remove(ph[k]); } catch (e){} ph[k] = null; }
    });
  }
  function phSyncActors(){
    if (!ph || typeof THREE === 'undefined') return;
    const showGuest = !ph.stay && ph.next;
    const showPet = !!(ph.stay || (ph.next && !ph.stay));
    if (showGuest && ph.next){
      if (!ph.guestM){ ph.guestM = phMakeGuestMesh(ph.next.guestCol); scene.add(ph.guestM); }
      ph.guestM.position.set(-1.4, 0, -5.4);
      ph.guestM.visible = true;
    } else if (ph.guestM) ph.guestM.visible = false;
    const petId = ph.stay ? ph.stay.petId : (ph.next && ph.next.petId);
    if (showPet && petId){
      const pet = phPetOf(petId);
      if (!ph.petM || ph.petM.userData.petId !== pet.id){
        if (ph.petM) try { scene.remove(ph.petM); } catch (e){}
        ph.petM = phMakePetMesh(pet);
        ph.petM.userData.petId = pet.id;
        scene.add(ph.petM);
      }
      const st = phNearStation() || ph.at;
      let x = 1.3, z = -5.2;
      if (ph.stay){
        if (st === 'feed'){ x = -6.5; z = 2.4; }
        else if (st === 'bathe'){ x = 6.5; z = 2.35; }
        else if (st === 'play'){ x = -6.5; z = 8.2; }
        else if (st === 'bed'){ x = 5.7; z = 8.5; }
        else { x = 0.9; z = -5.0; }
      }
      ph.petM.position.set(x, 0, z);
      ph.petM.visible = true;
      phApplyMood(ph.petM, ph.stay);
    } else if (ph.petM) ph.petM.visible = false;
  }
  function phNearStation(){
    if (!ph || typeof P === 'undefined' || !P) return null;
    let best = null, bd = 1e9;
    PH_STATIONS.forEach(s => {
      const d = Math.hypot((P.x || 0) - s.x, (P.z || 0) - s.z);
      if (d < s.r && d < bd){ bd = d; best = s.id; }
    });
    return best;
  }
  function phPrompt(station){
    if (!ph) return '';
    if (!station) return '';
    if (station === 'desk'){
      if (!ph.stay && ph.next) return PH_DESK_ICON + ' Check in ' + ph.next.guest + ' and ' + ph.next.petName;
      if (ph.stay && phReadyOut(ph.stay)) return PH_DESK_ICON + ' Check out ' + ph.stay.petName + ' for coins';
      if (ph.stay) return PH_DESK_ICON + ' ' + ph.stay.petName + ' still needs ' + phCaresLeft(ph.stay).map(c => PH_NEED_LABEL[c].toLowerCase()).join(', ');
      return PH_DESK_ICON + ' Front desk';
    }
    const lab = PH_CARE_ICON[station] + ' ' + PH_CARE_LABEL[station];
    if (!ph.stay) return lab + ' (check in a guest first)';
    if (ph.stay.done && ph.stay.done[station]) return lab + ' — done!';
    return lab + ' ' + ph.stay.petName;
  }
  function phDo(station){
    if (!ph) return false;
    if (ph.remote && station !== 'desk' && station !== 'feed' && station !== 'bathe' && station !== 'play' && station !== 'bed') return false;
    const res = phActAt(ph, station);
    if (!res.ok){ if (res.why && typeof banner === 'function') banner(PH_HOTEL_ICON + ' ' + res.why); phHud(); return false; }
    if (res.act === 'checkin'){
      if (typeof banner === 'function') banner(res.stay.emoji + ' ' + res.stay.guest + ' checked in ' + res.stay.petName + ' the ' + res.stay.kind + '!');
    } else if (res.act === 'care'){
      if (typeof banner === 'function') banner(PH_CARE_ICON[res.care] + ' ' + PH_CARE_LABEL[res.care] + ' — ' + res.stay.petName + (phReadyOut(res.stay) ? ' is ready to check out!' : ' is happy!'));
    } else if (res.act === 'checkout'){
      if (typeof setCoins === 'function') setCoins((typeof coins === 'number' ? coins : 0) + res.rec.pay);
      if (typeof runCoins !== 'undefined') runCoins = (runCoins || 0) + res.rec.pay;
      if (typeof SND !== 'undefined' && SND.coin) try { SND.coin(); } catch (e){}
      if (typeof banner === 'function') banner('🪙 ' + res.rec.guest + ' picked up ' + res.rec.pet + '! +' + res.rec.pay + ' coins');
      phWriteSave();
    }
    if (res.act === 'care') ph.at = station;
    if (res.act === 'checkin') ph.at = 'desk';
    if (res.act === 'checkout') ph.at = 'desk';
    ph.dirty = true;
    if (typeof phNet === 'function') phNet();
    phSyncActors();
    phHud();
    return true;
  }
  function phHud(){
    if (!ph) return;
    const box = (typeof $ === 'function') ? $('#phBox') : (typeof document !== 'undefined' && document.getElementById && document.getElementById('phBox'));
    if (box){
      const stay = ph.stay;
      const name = stay ? (stay.emoji + ' ' + stay.petName) : (PH_HOTEL_ICON + ' Waiting' + (ph.next ? ' for ' + ph.next.guest : ''));
      const bar = stay ? phNeedsBarHtml(stay) : '';
      box.innerHTML = '<b>' + name + '</b>' + (bar ? ' ' + bar : '') + ' · 🪙 ' + (ph.earned | 0) + ' · ✅ ' + (ph.served | 0);
    }
    const tasks = (typeof $ === 'function') ? $('#phTasks') : null;
    if (tasks){
      if (!ph.stay){ tasks.innerHTML = ph.next ? (PH_DESK_ICON + ' ' + ph.next.guest + ' is at the desk with ' + ph.next.petName + ' the ' + ph.next.kind) : (PH_DESK_ICON + ' The lobby is quiet…'); tasks.style.display = ''; }
      else {
        tasks.innerHTML = phNeedsBarHtml(ph.stay) + ' <span class="phneedhint">' + (phReadyOut(ph.stay) ? 'Ready to check out!' : 'Needs ' + phCaresLeft(ph.stay).map(c => PH_NEED_LABEL[c].toLowerCase()).join(', ')) + '</span>';
        tasks.style.display = '';
      }
    }
    const btn = (typeof $ === 'function') ? $('#phAct') : null;
    const st = ph.near;
    if (btn){
      if (st){ btn.classList.add('show'); btn.innerHTML = phPrompt(st) + ' <small>E / Ⓧ</small>'; }
      else btn.classList.remove('show');
    }
  }
  function petHotelEnter(){
    if (!ph) return;
    if (typeof cam !== 'undefined'){ cam.yaw = 0; cam.pitch = 0.2; cam.dist = 11; }
    if (typeof banner === 'function') banner(ph.remote ? PH_HOTEL_ICON + ' Pet Hotel — help care for the guest pets together!' : PH_HOTEL_ICON + ' Pet Hotel! Check guests in, care for their pets, then check out for coins.');
    if (typeof tipTimer !== 'undefined') tipTimer = 7;
    phHud();
  }
  function petHotelStop(){
    if (ph){
      phWriteSave();
      phClearActors();
      (ph.props || []).forEach(m => { if (m && typeof scene !== 'undefined') try { scene.remove(m); } catch (e){} });
    }
    ph = null;
    ['#phAct', '#phTasks', '#phBox'].forEach(id => {
      const e = (typeof $ === 'function') ? $(id) : null;
      if (e){ e.classList.remove('show'); if (id !== '#phBox') e.style.display = 'none'; }
    });
  }
  function petHotelUpdate(dt){
    if (!ph) return;
    ph.t = (ph.t || 0) + (dt || 0);
    if (!ph.remote){
      if (!ph.stay){
        ph.wait = (ph.wait || 0) - (dt || 0);
        if (ph.wait < 0 && !ph.next) ph.next = phNewStay((ph.served | 0) + 1);
      }
    }
    const st = phNearStation();
    if (st !== ph.near){ ph.near = st; phHud(); }
    if (ph.dirty){ phSyncActors(); ph.dirty = false; }
    else if (ph.petM && ph.stay){
      const want = phNearStation();
      // keep the pet at the station you walk to, cheaply
      phSyncActors();
    }
    if (ph.petM && ph.petM.visible){
      const bob = Math.sin((ph.t || 0) * 3) * 0.03;
      ph.petM.position.y = bob;
      const hearts = ph.petM.userData && ph.petM.userData.hearts;
      if (hearts && hearts.visible){
        hearts.rotation.y = (ph.t || 0) * 1.4;
        const baseY = (ph.petM.userData && ph.petM.userData.headY) ? ph.petM.userData.headY + 0.55 : 1.3;
        hearts.position.y = baseY + Math.sin((ph.t || 0) * 4) * 0.04;
      }
      const tears = ph.petM.userData && ph.petM.userData.tears;
      if (tears && tears.visible) tears.position.y = Math.sin((ph.t || 0) * 3.2) * 0.04;
    }
  }
  function phKey(e){
    if (!ph || !e || e.repeat || (typeof paused !== 'undefined' && paused)) return false;
    if (e.code === 'KeyE' && ph.near){ phDo(ph.near); return true; }
    return false;
  }
  function phPad(jp){
    if (!ph) return false;
    if (jp && jp.x && ph.near){ phDo(ph.near); return true; }
    return false;
  }
  function phWire(){
    if (!ph || ph.remote) return null;
    return {
      stay: ph.stay, next: ph.next, wait: +((ph.wait || 0).toFixed(2)),
      served: ph.served | 0, earned: ph.earned | 0
    };
  }
  function phFromHost(d){
    if (!ph || !d) return;
    ph.remote = true;
    ph.stay = d.stay || null;
    ph.next = d.next || null;
    ph.wait = +d.wait || 0;
    ph.served = d.served | 0;
    ph.earned = d.earned | 0;
    ph.dirty = true;
    phHud();
  }
  function phNet(){ /* host state goes out on the regular mp tick */ }
  function phMeshBudget(){ return ph ? (ph.props || []).length : 0; }
  function drawPetHotel(ctx){
    if (!ctx) return;
    if (typeof sky === 'function') sky(ctx, '#9fd8ff', '#fff6e8');
    else { ctx.fillStyle = '#9fd8ff'; ctx.fillRect(0, 0, 320, 200); }
    ctx.fillStyle = '#f3c6d8'; ctx.fillRect(24, 48, 272, 112);
    ctx.fillStyle = '#ffe8f2';
    for (let y = 58; y < 150; y += 16) for (let x = 36; x < 290; x += 16){ ctx.beginPath(); ctx.arc(x, y, 2, 0, Math.PI * 2); ctx.fill(); }
    ctx.fillStyle = '#8ecae6'; ctx.fillRect(50, 62, 44, 36); ctx.fillRect(226, 62, 44, 36);
    ctx.fillStyle = '#fff6e8'; ctx.fillRect(48, 60, 48, 6); ctx.fillRect(224, 60, 48, 6);
    ctx.fillStyle = '#c97b5a'; ctx.fillRect(110, 100, 100, 42);
    ctx.fillStyle = '#e8c9a0'; ctx.fillRect(108, 96, 104, 8);
    ctx.fillStyle = '#ffd23f'; ctx.beginPath(); ctx.arc(186, 92, 7, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#d96b8a'; ctx.fillRect(80, 152, 160, 16);
    // cute pets with eyes
    const pet = (x, col, ear) => {
      ctx.fillStyle = col; ctx.beginPath(); ctx.arc(x, 148, 16, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(x, 132, 12, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = ear; ctx.fillRect(x - 12, 116, 7, 10); ctx.fillRect(x + 5, 116, 7, 10);
      ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(x - 4, 131, 3.2, 0, Math.PI * 2); ctx.arc(x + 4, 131, 3.2, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#2a1a10'; ctx.beginPath(); ctx.arc(x - 4, 131, 1.4, 0, Math.PI * 2); ctx.arc(x + 4, 131, 1.4, 0, Math.PI * 2); ctx.fill();
    };
    pet(200, '#c9894c', '#6d3a18'); pet(84, '#8aa0b8', '#f4c6d4');
    if (typeof guy === 'function'){ guy(ctx, 160, 175, 12, '#3a86ff'); guy(ctx, 60, 175, 11, '#d96b8a'); }
    ctx.font = '22px sans-serif'; ctx.fillText(PH_HOTEL_ICON, 40, 50); ctx.fillText(PH_DESK_ICON, 150, 92);
  }
