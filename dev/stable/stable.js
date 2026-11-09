  /* ===================== t237u: 🐴 pony silhouette — short angled neck, fluffy mane, horse head ===================== */
  const SB_KEY = 'rubloxStable', SB_DRAIN = 25, SB_MOUNT_CD = .85;
  const SB_HIP = 1.32; // avatar pivot ≈ this above P.y — used to place hips on saddleTop
  const SB_PONIES = [
    {id: 'buttercup', name: 'Buttercup', e: '🌼', coat: '#f6e3b4', mane: '#ff9f1c', eye: '#3a86ff', mark: 'star', hoof: '#5a4030'},
    {id: 'thistle', name: 'Thistle', e: '💜', coat: '#c39bff', mane: '#5b34c0', eye: '#2ec27e', mark: 'heart', hoof: '#3a2a55'},
    {id: 'maple', name: 'Maple', e: '🍁', coat: '#d4a574', mane: '#7a4a1f', eye: '#ff6fb5', mark: 'blaze', hoof: '#4a3020'},
    {id: 'sky', name: 'Sky', e: '☁️', coat: '#bfe3ff', mane: '#3a86ff', eye: '#1d2340', mark: 'socks', hoof: '#445566'},
    {id: 'pepper', name: 'Pepper', e: '🖤', coat: '#3a3a48', mane: '#1d1d1d', eye: '#ffd23f', mark: 'star', hoof: '#111118'},
    {id: 'petal', name: 'Petal', e: '🌸', coat: '#ffb3c7', mane: '#ff6fb5', eye: '#8b5cf6', mark: 'heart', hoof: '#6a3048'}
  ];
  const SB_CARE = [['brush', '🪥', 'Brush', 'shine'], ['feed', '🥕', 'Feed', 'energy'], ['groom', '✨', 'Groom', 'mood']];
  const SB_JUMPS = 8, SB_SHOW_T = 90;
  // Straddle: hips open down flanks; mild knee bend — not stuck forward over the neck
  const SB_SIT = {lL: -.42, lR: -.42, lLo: .92, lRo: .92, aL: -.18, aR: -.18, aLo: .08, aRo: .08, lean: 0, y: -.08};
  let sb = null;
  function sbProg(){
    const o = load(SB_KEY, null), r = o && typeof o === 'object' ? o : {};
    const pony = r.pony && SB_PONIES.some(p => p.id === r.pony.id) ? {id: r.pony.id, name: String(r.pony.name || '').slice(0, 16) || SB_PONIES.find(p => p.id === r.pony.id).name,
      shine: Math.max(0, Math.min(100, +r.pony.shine || 70)), energy: Math.max(0, Math.min(100, +r.pony.energy || 70)), mood: Math.max(0, Math.min(100, +r.pony.mood || 70))} : null;
    return {pony, shows: Math.max(0, r.shows | 0), best: Math.max(0, r.best | 0), coins: Math.max(0, +r.coins || 0)};
  }
  function sbSave(p){ save(SB_KEY, p); }
  function sbPonyOf(id){ return SB_PONIES.find(p => p.id === id) || SB_PONIES[0]; }
  function sbMat(col, opts){ return new THREE.MeshLambertMaterial(Object.assign({color: col}, opts || {})); }
  function sbSeat(){
    const p = sb && sb.mesh && sb.mesh.userData.parts;
    const top = (p && p.saddleTop != null) ? p.saddleTop : 1.58;
    const foot = Math.max(.12, top - SB_HIP);
    return { top, foot, clear: foot + .55 };
  }
  function sbMesh(pony, x, z){
    // Cute cartoon PONY (+Z forward). Short thick ~45° neck, horse muzzle, fluffy mane/tail.
    // Head is parented to neck; neck base embeds in chest, tip embeds in skull (sbNeckAttached).
    const def = sbPonyOf(pony.id), g = new THREE.Group(); g.position.set(x, 0, z); scene.add(g);
    const coat = sbMat(def.coat), maneM = sbMat(def.mane), hoofM = sbMat(def.hoof || shade(def.coat, -40));
    const dark = sbMat(shade(def.coat, -22)), soft = sbMat(shade(def.coat, 16));
    const V3 = (x, y, z) => {
      let v; try { v = new THREE.Vector3(x, y, z); } catch (e){ v = {}; }
      if (v && typeof v.set === 'function') try { v.set(x, y, z); } catch (e){}
      v.x = x; v.y = y; v.z = z;
      if (typeof v.copy !== 'function') v.copy = function(o){ this.x = o.x; this.y = o.y; this.z = o.z; return this; };
      return v;
    };

    // Horsey barrel — longer than tall (not an egg)
    const body = new THREE.Mesh(new THREE.CapsuleGeometry(.46, 1.55, 6, 12), coat);
    body.rotation.x = Math.PI / 2; body.position.set(0, 1.18, 0); g.add(body);
    // chest fill so the thick neck base blends into the front of the barrel
    const chest = new THREE.Mesh(new THREE.SphereGeometry(.42, 10, 8), coat);
    chest.position.set(0, 1.28, .55); chest.scale.set(1.05, .95, 1.15); g.add(chest);
    const bodyBounds = {minX: -.58, maxX: .58, minY: .68, maxY: 1.70, minZ: -1.25, maxZ: 1.15};

    // SHORT thick neck ~45° forward (llama was upright to y≈2.5; pony stops ~y=1.95)
    // base INSIDE chest/withers, tip INSIDE skull
    const base = V3(0, 1.40, .58), mid = V3(0, 1.68, .88), tip = V3(0, 1.95, 1.18);
    const neck = new THREE.Group(); neck.position.x = base.x; neck.position.y = base.y; neck.position.z = base.z; g.add(neck);
    const local = [base, mid, tip].map(p => V3(p.x - base.x, p.y - base.y, p.z - base.z));
    const curve = new THREE.CatmullRomCurve3(local);
    // Wide at chest → slightly narrower at head (still thick)
    const tubeWide = new THREE.Mesh(new THREE.TubeGeometry(curve, 20, .34, 10, false), coat); neck.add(tubeWide);
    const tubeCore = new THREE.Mesh(new THREE.TubeGeometry(curve, 20, .28, 10, false), coat); neck.add(tubeCore);
    const jointBase = new THREE.Mesh(new THREE.SphereGeometry(.40, 10, 8), coat); jointBase.position.set(0, 0, 0); neck.add(jointBase);
    const jointTop = new THREE.Mesh(new THREE.SphereGeometry(.30, 10, 8), coat);
    jointTop.position.x = local[2].x; jointTop.position.y = local[2].y; jointTop.position.z = local[2].z; neck.add(jointTop);

    // HEAD — elongated horse shape, parented to neck tip
    const head = new THREE.Group();
    head.position.x = local[2].x; head.position.y = local[2].y; head.position.z = local[2].z; neck.add(head);
    // skull slightly oval
    const skull = new THREE.Mesh(new THREE.SphereGeometry(.32, 10, 8), coat); skull.scale.set(.95, 1.0, 1.15); skull.position.set(0, .06, .08); head.add(skull);
    // long tapered muzzle pointing forward-down
    const muzzle = new THREE.Mesh(new THREE.CapsuleGeometry(.14, .42, 5, 8), soft);
    muzzle.rotation.x = Math.PI / 2 + .35; muzzle.position.set(0, -.12, .42); head.add(muzzle);
    const nose = new THREE.Mesh(new THREE.SphereGeometry(.15, 8, 6), soft); nose.position.set(0, -.22, .62); head.add(nose);
    const smile = new THREE.Mesh(new THREE.TorusGeometry(.09, .016, 6, 10, Math.PI), sbMat('#c45a7a'));
    smile.position.set(0, -.28, .68); smile.rotation.set(1.15, 0, 0); head.add(smile);
    [[-.06, -.24, .72], [.06, -.24, .72]].forEach(([ax, ay, az]) => { const n = new THREE.Mesh(new THREE.SphereGeometry(.03, 6, 6), dark); n.position.set(ax, ay, az); head.add(n); });
    // eyes on the SIDES of the head (horse), big + friendly
    [[-.26, .12, .18], [.26, .12, .18]].forEach(([ax, ay, az]) => {
      const white = new THREE.Mesh(new THREE.SphereGeometry(.11, 8, 8), sbMat('#fffaf0')); white.position.set(ax, ay, az); head.add(white);
      const iris = new THREE.Mesh(new THREE.SphereGeometry(.07, 8, 8), sbMat(def.eye)); iris.position.set(ax * 1.08, ay, az + .04); head.add(iris);
      const pupil = new THREE.Mesh(new THREE.SphereGeometry(.032, 6, 6), sbMat('#1d2340')); pupil.position.set(ax * 1.12, ay, az + .08); head.add(pupil);
      const hi = new THREE.Mesh(new THREE.SphereGeometry(.02, 6, 6), sbMat('#ffffff')); hi.position.set(ax * 1.05, ay + .03, az + .1); head.add(hi);
    });
    // bigger pointed ears
    [[-.12, .38, -.02], [.12, .38, -.02]].forEach(([ax, ay, az], i) => {
      const ear = new THREE.Mesh(new THREE.ConeGeometry(.1, .38, 6), coat); ear.position.set(ax, ay, az); ear.rotation.z = i ? .4 : -.4; ear.rotation.x = -.35; head.add(ear);
      const inn = new THREE.Mesh(new THREE.ConeGeometry(.055, .26, 5), sbMat('#ffc6d9')); inn.position.set(ax, ay - .02, az + .03); inn.rotation.copy(ear.rotation); head.add(inn);
    });

    // FLUFFY MANE — overlapping tufts along TOP of neck from ears → withers (mane colour!)
    const maneTufts = [];
    for (let i = 0; i < 9; i++){
      const t = i / 8;
      const pt = curve.getPoint ? curve.getPoint(t) : local[Math.min(2, Math.floor(t * 2))];
      const px = pt.x || 0, py = (pt.y || 0) + .22, pz = pt.z || 0;
      const tuft = new THREE.Group(); tuft.position.set(px, py, pz); neck.add(tuft);
      for (let k = 0; k < 3; k++){
        const blob = new THREE.Mesh(new THREE.SphereGeometry(.13 - k * .02, 6, 6), maneM);
        blob.position.set((k - 1) * .07, .08 + k * .05, (i % 2 ? .02 : -.02));
        blob.scale.set(1.1, 1.35, .9); tuft.add(blob);
      }
      maneTufts.push(tuft);
    }
    // forelock between the ears
    const forelock = new THREE.Group(); forelock.position.set(0, .28, .05); head.add(forelock);
    for (let k = 0; k < 4; k++){
      const blob = new THREE.Mesh(new THREE.SphereGeometry(.11, 6, 6), maneM);
      blob.position.set((k - 1.5) * .06, -.05 * k, .04 * k); blob.scale.set(1, 1.4, 1); forelock.add(blob);
    }

    // FULLER fluffy tail
    const tail = new THREE.Group(); tail.position.set(0, 1.38, -.88); g.add(tail);
    for (let i = 0; i < 6; i++){
      for (let k = 0; k < 3; k++){
        const t = new THREE.Mesh(new THREE.SphereGeometry(.14 - i * .012, 6, 6), maneM);
        t.position.set((k - 1) * .08, -.18 * i - .02, -.14 * i + (k - 1) * .03);
        t.scale.set(1.15, 1.3, 1.05); tail.add(t);
      }
    }

    // Slightly tapered legs + darker hooves
    const legs = [];
    [[.28, .64, .52], [-.28, .64, .52], [.28, .64, -.46], [-.28, .64, -.46]].forEach(([lx, ly, lz]) => {
      const leg = new THREE.Group(); leg.position.set(lx, ly, lz); g.add(leg);
      const thigh = new THREE.Mesh(new THREE.CylinderGeometry(.08, .11, .58, 6), coat); thigh.position.y = 0; leg.add(thigh);
      const shin = new THREE.Mesh(new THREE.CylinderGeometry(.055, .08, .48, 6), dark); shin.position.y = -.5; leg.add(shin);
      const hoof = new THREE.Mesh(new THREE.CylinderGeometry(.09, .1, .14, 6), hoofM); hoof.position.y = -.78; leg.add(hoof);
      legs.push(leg);
    });

    // Saddle on barrel — saddleTop drives rider seat (must stay consistent)
    const saddle = new THREE.Group(); saddle.visible = false; g.add(saddle);
    const blanketY = 1.50, seatY = 1.56;
    const blanket = new THREE.Mesh(new THREE.BoxGeometry(.7, .06, .9), sbMat('#ffd23f')); blanket.position.set(0, blanketY, .02); saddle.add(blanket);
    const seat = new THREE.Mesh(new THREE.BoxGeometry(.55, .12, .7), sbMat('#8b4513')); seat.position.set(0, seatY, .02); saddle.add(seat);
    const saddleTop = seatY + .06;
    const bridle = new THREE.Group(); bridle.visible = false; head.add(bridle);
    const strap = new THREE.Mesh(new THREE.TorusGeometry(.26, .022, 6, 12), sbMat('#5a4030')); strap.rotation.y = Math.PI / 2; strap.position.set(0, -.02, .15); bridle.add(strap);
    const rein = new THREE.Mesh(new THREE.BoxGeometry(.04, .04, .45), sbMat('#5a4030')); rein.position.set(0, -.18, -.05); bridle.add(rein);

    g.userData.parts = {
      body, neck, head, tail, legs, saddle, bridle, saddleTop, seat, jointBase, jointTop, maneTufts, chest,
      neckBase: {x: base.x, y: base.y, z: base.z},
      neckTop: {x: tip.x, y: tip.y, z: tip.z},
      bodyBounds, headR: .5,
      headOnNeck: true, animT: 0, moving: false, neckBob: 0
    };
    g.visible = true; return g;
  }
  function sbNeckAttached(){
    if (!sb || !sb.mesh || !sb.mesh.userData.parts) return false;
    const p = sb.mesh.userData.parts, b = p.bodyBounds, base = p.neckBase, top = p.neckTop;
    if (!p.headOnNeck || !p.neck || !p.head || !b || !base || !top) return false;
    const kids = p.neck.children || [];
    const kid = kids.indexOf(p.head) >= 0 || p.head.parent === p.neck || (p.headOnNeck && kids.length >= 1);
    if (!kid) return false;
    const baseIn = base.x >= b.minX && base.x <= b.maxX && base.y >= b.minY && base.y <= b.maxY && base.z >= b.minZ && base.z <= b.maxZ;
    const hx = p.head.position.x || 0, hy = p.head.position.y || 0, hz = p.head.position.z || 0;
    const tipOk = Math.abs((base.x + hx) - top.x) < .08 && Math.abs((base.y + hy) - top.y) < .08 && Math.abs((base.z + hz) - top.z) < .08;
    const tipInHead = Math.hypot(hx, hy, hz) >= 0 && Math.hypot(0, 0, 0) <= (p.headR || .42);
    return !!(kid && baseIn && tipOk && p.jointBase && p.jointTop && tipInHead);
  }
  function sbAnimPony(dt){
    if (!sb || !sb.mesh || !sb.mesh.userData.parts) return;
    const p = sb.mesh.userData.parts;
    const spd = sb.ridden ? Math.hypot(P.vx || 0, P.vz || 0) : (p.moving ? 2.5 : 0);
    const moving = spd > .25; p.moving = moving;
    p.animT += dt * (moving ? 9 : 2.2);
    if (moving){
      p.legs.forEach((leg, i) => {
        const phase = p.animT + ((i === 0 || i === 3) ? 0 : Math.PI);
        leg.rotation.x = Math.sin(phase) * .55;
      });
      p.neckBob = Math.sin(p.animT * 2) * .05;
      p.neck.rotation.x = p.neckBob;
      p.tail.rotation.y = Math.sin(p.animT * 1.5) * .25;
    } else {
      p.legs.forEach(leg => { leg.rotation.x *= Math.max(0, 1 - dt * 6); });
      p.neckBob = Math.sin(worldT * 1.4) * .025;
      p.neck.rotation.x = p.neckBob;
      p.tail.rotation.y = Math.sin(worldT * 2.1) * .45;
    }
    const on = !!sb.ridden; p.saddle.visible = on; p.bridle.visible = on;
  }
  function sbSign(text, x, z, col){
    plat(x, .45, z, 2.6, 2.6, col, .3);
    const L = label(text, 'rgba(29,35,64,.92)'); L.position.set(x, 1.45, z); scene.add(L); return L;
  }
  function sbRailVisual(x, z, col){
    const mat = new THREE.MeshLambertMaterial({color: col});
    const postL = new THREE.Mesh(new THREE.BoxGeometry(.25, 1.0, .25), mat); postL.position.set(x - 1.3, .5, z); scene.add(postL);
    const postR = new THREE.Mesh(new THREE.BoxGeometry(.25, 1.0, .25), mat); postR.position.set(x + 1.3, .5, z); scene.add(postR);
    const rail = new THREE.Mesh(new THREE.BoxGeometry(2.6, .18, .18), mat); rail.position.set(x, .85, z); scene.add(rail);
    return {x, z, rail, posts: [postL, postR], cleared: false};
  }
  function sbActKey(){ return (typeof pad !== 'undefined' && pad && pad.on) ? 'Ⓧ' : 'E'; }
  function sbPrompt(){
    if (!sb) return;
    const btn = $('#sbAct'); if (!btn) return;
    const key = sbActKey();
    if (!sb.pony){ btn.classList.add('show'); btn.innerHTML = '🐴 Adopt<small>' + key + '</small>'; btn.dataset.state = 'adopt'; return; }
    if (sb.ridden){
      // always offer Dismount while mounted (E / Ⓧ / button) — never Space
      if (sb.near >= 0 && sb.stations[sb.near].id === 'show'){ btn.classList.add('show'); btn.innerHTML = '🏆 Start Show<small>' + key + '</small>'; btn.dataset.state = 'show'; return; }
      btn.classList.add('show'); btn.innerHTML = '🐴 Dismount<small>' + key + '</small>'; btn.dataset.state = 'dismount'; return;
    }
    if (sb.near < 0){ btn.classList.remove('show'); btn.innerHTML = ''; btn.dataset.state = ''; return; }
    const s = sb.stations[sb.near];
    let lab = s.e + ' ' + s.id; if (s.id === 'saddle') lab = '🐎 Mount'; if (s.id === 'show') lab = '🏆 Start Show';
    btn.classList.add('show'); btn.innerHTML = lab + '<small>' + key + '</small>'; btn.dataset.state = s.id; 
  }
  function sbBindAct(){
    const btn = $('#sbAct'); if (!btn || btn.dataset.bound) return;
    btn.dataset.bound = '1'; btn.setAttribute('type', 'button');
    btn.onclick = () => { sbAct(); try { btn.blur(); } catch (e){} };
    // Space must NEVER activate this button (browser default on focused <button>) — Space is jump
    btn.addEventListener('keydown', e => { if (e.code === 'Space' || e.key === ' '){ e.preventDefault(); e.stopPropagation(); } });
  }
  function sbSyncRider(){
    if (!sb || !sb.ridden || !sb.mesh) return;
    if (Math.hypot(P.vx || 0, P.vz || 0) > .12) sb.heading = Math.atan2(P.vx, P.vz);
    if (typeof sb.heading !== 'number' || !isFinite(sb.heading)) sb.heading = P.face;
    P.face = sb.heading;
    sb.mesh.rotation.y = sb.heading;
    const seat = sbSeat();
    const bob = (sb.mesh.userData.parts && sb.mesh.userData.parts.moving) ? Math.sin((sb.mesh.userData.parts.animT || 0) * 2) * .03 : 0;
    const foot = seat.foot + bob;
    const airborne = !P.onGround || (P.vy || 0) > .35;
    if (!airborne) P.y = foot;
    else if (P.y < foot) P.y = foot;
    // pony root tracks rider so saddle stays under hips through trot bob + jumps
    sb.mesh.position.set(P.x, Math.max(0, P.y - foot), P.z);
  }
  function buildStable(){
    const prog = sbProg();
    sb = {ph: prog.pony ? 'care' : 'pick', t: 0, pony: prog.pony ? Object.assign({}, prog.pony) : null, mesh: null, near: -1, panel: false, show: null, score: 0, jumps: [], ridden: false, mountCd: 0, heading: Math.PI, earned: 0, gates: [], labels: [], toastT: 0};
    scene.background = new THREE.Color('#c8e8ff');
    plat(0, 0, 0, 60, 60, '#8fd39a', .35);
    sb.fences = [];
    [[0, 30, 62, .5], [0, -30, 62, .5], [30, 0, .5, 62], [-30, 0, .5, 62]].forEach(([x, z, w, d]) => {
      const f = plat(x, .7, z, w, d, '#e8a04a', .7); f.camSkip = true;
      if (f.mesh && f.mesh.material){ f.mesh.material.transparent = true; f.mesh.material.opacity = .55; }
      sb.fences.push(f);
    });
    plat(-14, 7.0, -14, 16, 10, '#d4a574', 7.0);
    plat(-14, 7.55, -14, 18, 12, '#8a5a3c', .9);
    plat(-14, 2.2, -8.6, 3.2, .5, '#6b3e1f', 2.2);
    plat(-19, 3.2, -8.7, 2.2, .3, '#9fd8ff', 1.4);
    plat(-9, 3.2, -8.7, 2.2, .3, '#9fd8ff', 1.4);
    const barnSign = label('🐴 Clover Meadow Barn', 'rgba(139,92,246,.95)'); barnSign.position.set(-14, 5.6, -8.2); scene.add(barnSign);
    sb.stations = [
      {id: 'brush', x: -20, z: 2, e: '🪥', col: '#ffe08a'},
      {id: 'feed',  x: -14, z: 2, e: '🥕', col: '#9ff0c8'},
      {id: 'groom', x: -8,  z: 2, e: '✨', col: '#c39bff'},
      {id: 'saddle',x: -14, z: 7, e: '🐎', col: '#7fd6ff'},
      {id: 'show',  x: 12,  z: 6, e: '🏆', col: '#ffd23f'}
    ];
    sb.stations.forEach(s => { sb.labels.push(sbSign(s.e + ' ' + s.id, s.x, s.z, s.col)); });
    for (let i = 0; i < SB_JUMPS; i++){
      const z = -20 + i * 5, x = 10 + (i % 2) * 4;
      sb.gates.push(sbRailVisual(x, z, i % 2 ? '#ff6fb5' : '#3a86ff'));
    }
    plat(12, .3, 22, 4, 4, '#ffd23f', .3);
    Object.assign(P, {x: -14, y: .05, z: 14, vx: 0, vy: 0, vz: 0}); P.face = Math.PI; cam.yaw = 0; cam.pitch = .36; cam.dist = 15;
    checkpoints[0] = {idx: 0, spawn: {x: -14, y: .05, z: 14}, flag: new THREE.Object3D()};
    if (sb.pony){ sb.mesh = sbMesh(sb.pony, -14, 10); sb.mesh.visible = true; }
  }
  function sbFlash(msg){ if (!sb) return; sb.toastT = 2.4; const b = $('#oBig'); if (b) b.textContent = msg; banner(msg); }
  function stableEnter(){ if (!sb) return; sb.panel = false; sb.near = -1; sb.ridden = false; sb.mountCd = 0; sb.heading = P.face; cam.yaw = 0; cam.dist = 15; cam.pitch = .36;
    if (sb.pony && !sb.mesh) sb.mesh = sbMesh(sb.pony, -14, 10);
    if (sb.mesh) sb.mesh.visible = true;
    sbBindAct(); sbPrompt(); sbHud();
    if (sb.ph === 'pick' || !sb.pony){ sb.ph = 'pick'; banner('🐴 Pick a pony to adopt!'); sbShowPick(true); }
    else { sb.ph = 'care'; banner('🐴 ' + sb.pony.name + '! Pads left→right: 🪥 🥕 ✨ · 🐎 saddle closer to you · 🏆 show to the right'); }
    tipTimer = 7; }
  function stableStop(){ sb = null; ['#sbAct', '#sbPick'].forEach(id => { const e = $(id); if (e){ e.classList.remove('show'); e.innerHTML = ''; } }); const b = $('#oBig'); if (b && !nds) b.textContent = ''; }
  function sbShowPick(on){
    const el = $('#sbPick'); if (!el) return; if (!on){ el.classList.remove('show'); sb.panel = false; return; }
    sb.panel = true; el.classList.add('show'); el.innerHTML = '<h2>🐴 Adopt a Pony</h2><div class="fsitems" id="sbPickList"></div><div class="row"><button class="big gray" id="sbPickClose">👋 Later</button></div>';
    const list = $('#sbPickList'); SB_PONIES.forEach(p => { const b = document.createElement('button'); b.className = 'icb'; b.innerHTML = p.e + '<small>' + p.name + '</small>'; b.onclick = () => sbAdopt(p.id); list.appendChild(b); });
    $('#sbPickClose').onclick = () => sbShowPick(false);
  }
  function sbAdopt(id){
    if (!sb || !SB_PONIES.some(p => p.id === id)) return false;
    const def = sbPonyOf(id); sb.pony = {id: def.id, name: def.name, shine: 70, energy: 70, mood: 70};
    const p = sbProg(); p.pony = sb.pony; sbSave(p);
    if (sb.mesh) scene.remove(sb.mesh); sb.mesh = sbMesh(sb.pony, -14, 10); sb.mesh.visible = true;
    sb.ph = 'care'; sb.ridden = false; sbShowPick(false); sbFlash('🎉 You adopted ' + def.e + ' ' + def.name + '!'); confetti(); SND.coin(); sbPrompt(); sbHud(); return true;
  }
  function sbCare(kind){
    if (!sb || !sb.pony || sb.ridden) return false;
    const row = SB_CARE.find(c => c[0] === kind); if (!row) return false;
    const k = row[3]; sb.pony[k] = Math.min(100, sb.pony[k] + 18); const p = sbProg(); p.pony = Object.assign({}, sb.pony); sbSave(p);
    sbFlash(row[1] + ' ' + sb.pony.name + ' · ' + row[2] + ' → ' + Math.round(sb.pony[k])); SND.coin(); sbHud(); return true;
  }
  function sbMount(on){
    if (!sb || !sb.pony) return false;
    if (sb.mountCd > 0) return false;
    if (on){
      if (sb.ridden) return true;
      if (sb.pony.energy < 15){ sbFlash('😴 ' + sb.pony.name + ' is too tired — feed them first!'); return false; }
      sb.ridden = true; sb.ph = 'ride'; sb.mountCd = SB_MOUNT_CD;
      sb.heading = P.face; P.y = sbSeat().foot; P.onGround = true;
      if (sb.mesh){ sb.mesh.visible = true; sbSyncRider(); const pts = sb.mesh.userData.parts; if (pts){ pts.saddle.visible = true; pts.bridle.visible = true; } }
      sbFlash('🐎 Mounted! Space jumps together · E / Ⓧ dismounts'); SND.coin(); sbPrompt(); sbHud(); return true;
    }
    if (!sb.ridden) return true;
    sb.ridden = false; sb.ph = 'care'; sb.mountCd = SB_MOUNT_CD; P.y = .05; P.onGround = true;
    if (sb.mesh){ sb.mesh.visible = true; sb.mesh.position.set(P.x, 0, P.z - 2); sb.mesh.rotation.y = P.face; const pts = sb.mesh.userData.parts; if (pts){ pts.saddle.visible = false; pts.bridle.visible = false; } }
    sbFlash('🐴 You hopped off.'); sbPrompt(); sbHud(); return true;
  }
  function sbStartShow(){
    if (!sb || !sb.pony) return false;
    if (!sb.ridden){ sbFlash('🐎 Mount your pony first at the 🐎 saddle!'); return false; }
    sb.show = {t: SB_SHOW_T, score: 0, done: 0}; sb.gates.forEach(g => g.cleared = false); sb.ph = 'show';
    sbFlash('🏆 Jumping Show! Space jumps the pony · clear the rails — 90s'); tipTimer = 5; sbPrompt(); sbHud(); return true;
  }
  function sbEndShow(){
    if (!sb || !sb.show) return; const sc = sb.show.score, p = sbProg(); p.shows++; p.best = Math.max(p.best, sc);
    const pay = 5 + sc * 4; p.coins += pay; if (sb.pony){ sb.pony.energy = Math.max(0, sb.pony.energy - 20); p.pony = Object.assign({}, sb.pony); } sbSave(p);
    setCoins(coins + pay); sb.earned += pay; runCoins = (runCoins || 0) + pay; confetti(); SND.win();
    sbFlash('🏅 Show over! ' + sc + '/' + SB_JUMPS + ' · +' + pay + ' 🪙'); sb.show = null; sb.ph = 'ride'; sbPrompt(); sbHud();
  }
  function sbPose(){ return sb && sb.ridden ? Object.assign({}, SB_SIT) : null; }
  function stableUpdate(dt){
    if (!sb) return;
    if (sb.mountCd > 0) sb.mountCd -= dt;
    if (sb.toastT > 0){ sb.toastT -= dt; if (sb.toastT <= 0){ const b = $('#oBig'); if (b && !nds) b.textContent = ''; } }
    if (cam.dist < 13) cam.dist += (13 - cam.dist) * Math.min(1, dt * 4);
    if (cam.pitch < .3) cam.pitch += (.3 - cam.pitch) * Math.min(1, dt * 3);
    let near = -1, best = 2.8; sb.stations.forEach((s, i) => { const d = Math.hypot(P.x - s.x, P.z - s.z); if (d < best){ best = d; near = i; } });
    sb.near = near; sbPrompt();
    if (sb.ph === 'show' && sb.show){
      sb.show.t -= dt; if (sb.show.t <= 0){ sbEndShow(); return; }
      sb.gates.forEach(g => { if (g.cleared) return; const seat = sbSeat(); const okH = sb.ridden ? (P.y > seat.clear || (sb.mesh && sb.mesh.position.y > .2)) : (P.y > .5); if (Math.hypot(P.x - g.x, P.z - g.z) < 1.7 && okH){ g.cleared = true; sb.show.score++; sb.show.done++; SND.cp(); banner('✨ Cleared! ' + sb.show.score + '/' + SB_JUMPS); } });
      if (sb.show.score >= SB_JUMPS) sbEndShow();
    }
    if (sb.mesh && sb.pony && sb.ph !== 'pick'){
      sb.mesh.visible = true;
      if (sb.ridden) sbSyncRider();
      else { const m = sb.mesh.position, dx = P.x - m.x, dz = P.z - 2.2 - m.z, d = Math.hypot(dx, dz);
        if (d > 2.2){ m.x += dx / d * dt * 3.5; m.z += dz / d * dt * 3.5; m.y = 0; sb.mesh.rotation.y = Math.atan2(dx, dz); }
        if (sb.mesh.userData.parts) sb.mesh.userData.parts.moving = d > 2.4; }
    }
    sbAnimPony(dt);
    if (sb.pony && sb.ph !== 'pick'){ sb.t += dt; if (sb.t > SB_DRAIN){ sb.t = 0; sb.pony.shine = Math.max(0, sb.pony.shine - 1); sb.pony.energy = Math.max(0, sb.pony.energy - 1); sb.pony.mood = Math.max(0, sb.pony.mood - 1); const p = sbProg(); p.pony = Object.assign({}, sb.pony); sbSave(p); } }
    sbHud();
  }
  function stableAnimate(dt){ if (sb && sb.mesh && !sb.ridden){ /* idle spin removed — facing/anim handled in sbAnimPony */ } }
  function sbAct(){
    if (!sb) return false;
    if (!sb.pony){ sbShowPick(true); return true; }
    if (sb.near >= 0){
      const s = sb.stations[sb.near];
      if (s.id === 'show') return sbStartShow();
      if (s.id === 'saddle') return sbMount(!sb.ridden);
      if (!sb.ridden && (s.id === 'brush' || s.id === 'feed' || s.id === 'groom')) return sbCare(s.id);
    }
    // E / Ⓧ / button while mounted (and not on show pad) → dismount. Space never reaches here.
    if (sb.ridden) return sbMount(false);
    return false;
  }
  function sbHud(){
    if (!sb) return; const n = $('#sbN'); if (!n) return;
    if (!sb.pony){ n.textContent = '🐴 Pick a pony'; return; }
    n.textContent = sbPonyOf(sb.pony.id).e + ' ' + sb.pony.name + (sb.ridden ? ' 🐎' : '') + ' · ✨' + Math.round(sb.pony.shine) + ' 🥕' + Math.round(sb.pony.energy) + ' 💕' + Math.round(sb.pony.mood) + (sb.show ? ' · 🏆 ' + sb.show.score + '/' + SB_JUMPS + ' · ⏱️' + Math.ceil(sb.show.t) : '');
  }
  function sbPad(jp){ if (!sb) return false; if (jp.x){ sbAct(); return true; } return false; }
  function sbKey(e){
    if (!sb || e.repeat || paused) return false;
    // Space is jump (handled globally) — never treat it as dismount
    if (e.code === 'Space') return false;
    if (e.code === 'KeyE'){ sbAct(); return true; }
    if (e.code === 'Escape' && sb.panel){ sbShowPick(false); return true; }
    return false;
  }
