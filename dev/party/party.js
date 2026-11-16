  /* ---------- Party Pad (t295u) — cozy hangout, real players only, existing chat ---------- */
  let py = null;
  const PY_API = (typeof PYRules !== 'undefined' && PYRules) ? PYRules : (typeof window !== 'undefined' ? window.PYRules : null);

  function pyAdd(mesh){ if (py) py.trash.push(mesh); scene.add(mesh); return mesh; }

  function pyBox(x, y, z, w, h, d, color, opts){
    const m = addBox(x, y, z, w, h, d, color, opts || {});
    if (py) py.trash.push(m);
    return m;
  }

  function buildParty(){
    const R = PY_API ? PY_API.PY : {floor:{w:36,d:28}, spawn:{x:0,y:.5,z:8,face:Math.PI}, dance:{x:0,z:-1,w:8,d:8}, sofas:[], photo:{x:0,z:-11.2}, ball:{x:8,z:8,r:.55}};
    py = {
      trash: [], ball: {x: R.ball.x, z: R.ball.z, vx: 0, vz: 0}, ballM: null,
      sit: null, dance: false, photoFlash: 0, hint: '', act: '', tiles: [],
      lastBall: 0, lastSend: 0
    };
    scene.background = new THREE.Color('#f0b56a');
    scene.fog = null;
    scene.traverse(o => {
      if (o.isHemisphereLight){ o.intensity = 0.52; o.color.set('#fff1d0'); o.groundColor.set('#b8763a'); }
      if (o.isDirectionalLight){ o.intensity = 0.32; o.color.set('#ffe0b0'); o.position.set(8, 18, 6); }
    });
    const lamp = new THREE.PointLight('#ffd9a0', 0.45, 42, 2); lamp.position.set(0, 6.2, 0); scene.add(lamp); py.trash.push(lamp);

    // floor + rugs
    plat(0, 0, 0, R.floor.w, R.floor.d, '#c99655', 1.2);
    plat(0, 0.06, 4, 10, 8, '#c45c4a', 0.08); // entry rug
    // dance floor pads (walkable, slightly raised so tiles read clearly)
    const tw = R.dance.w / 4, td = R.dance.d / 4;
    for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++){
      const col = ((r + c) % 2) ? '#ff6fb5' : '#3a86ff';
      const x = R.dance.x - R.dance.w / 2 + tw * (c + 0.5);
      const z = R.dance.z - R.dance.d / 2 + td * (r + 0.5);
      plat(x, 0.08, z, tw - 0.06, td - 0.06, col, 0.08);
    }

    const wallH = 7.2, hw = R.floor.w / 2, hd = R.floor.d / 2;
    // walls
    plat(0, wallH, -hd, R.floor.w, 0.6, '#e0b77a', wallH, {noEdge: true});
    plat(0, wallH, hd, R.floor.w, 0.6, '#e0b77a', wallH, {noEdge: true});
    plat(-hw, wallH, 0, 0.6, R.floor.d, '#e0b77a', wallH, {noEdge: true});
    plat(hw, wallH, 0, 0.6, R.floor.d, '#e0b77a', wallH, {noEdge: true});
    // ceiling trim
    plat(0, wallH + 0.15, 0, R.floor.w, R.floor.d, '#d4a56a', 0.2, {noEdge: true});

    // windows (glow panels)
    [[-8, -hd + 0.4], [8, -hd + 0.4], [-hw + 0.4, -6], [hw - 0.4, -6]].forEach(([x, z], i) => {
      const w = Math.abs(z) > hw - 2 ? 4.2 : 0.2, d = Math.abs(z) > hw - 2 ? 0.2 : 4.2;
      const m = addBox(x, 4.2, z, w === 0.2 ? 0.2 : 4.2, 2.6, d === 0.2 ? 0.2 : 4.2, '#8fd3ff', {glow: '#fff3c4'});
      py.trash.push(m);
    });

    // sofas
    const sofaCol = '#6b4a9c', cush = '#c9a6ff';
    (R.sofas || []).forEach(s => {
      plat(s.x, 0.55, s.z, s.w, s.d, sofaCol, 0.55);
      pyBox(s.x, 0.85, s.z, s.w - 0.3, 0.3, s.d - 0.3, cush);
      // backrest
      const bx = s.x + Math.cos(s.face) * 0.7, bz = s.z + Math.sin(s.face) * 0.7;
      pyBox(s.id === 'sofa-s' ? s.x : (s.x + (s.id === 'sofa-e' ? 0.7 : -0.7)), 1.15, s.id === 'sofa-s' ? s.z + 0.55 : s.z, s.id === 'sofa-s' ? s.w : 0.35, 1.1, s.id === 'sofa-s' ? 0.35 : s.d, sofaCol);
    });

    // photo backdrop + frame + spot
    pyBox(0, 3.4, -hd + 0.55, 9, 5.2, 0.16, '#5b34c0');
    pyBox(0, 3.4, -hd + 0.7, 8.2, 4.5, 0.08, '#ffd6ec');
    [[-3.2, 4.8], [3.2, 4.8], [-2, 2.4], [2.2, 2.6]].forEach(([x, y]) => {
      const star = new THREE.Mesh(new THREE.OctahedronGeometry(0.28), new THREE.MeshBasicMaterial({color: '#ffd23f'}));
      star.position.set(x, y, -hd + 0.85); pyAdd(star);
    });
    try {
      const ph = (typeof label === 'function') ? label('📸 Photo spot', 'rgba(91,52,192,.95)', '#fff', 320) : null;
      if (ph){ ph.position.set(0, 6.2, -hd + 0.9); pyAdd(ph); }
    } catch (e){}
    plat(0, 0.1, -11.0, 4.2, 3.2, '#fff6c9', 0.1);

    // snack table (decor)
    plat(10, 1.0, -8, 2.4, 1.4, '#8d5524', 1.0);
    pyBox(10, 1.15, -8, 1.8, 0.15, 1.0, '#fff6e8');
    pyBox(9.5, 1.35, -8, 0.35, 0.35, 0.35, '#ff6fb5');
    pyBox(10.4, 1.4, -8, 0.3, 0.45, 0.3, '#ffd23f');

    // planters
    [[-14, -8], [14, -8], [-14, 10], [14, 10]].forEach(([x, z]) => {
      plat(x, 0.5, z, 1.1, 1.1, '#8d5524', 0.5);
      const leaf = new THREE.Mesh(new THREE.SphereGeometry(0.55, 10, 8), new THREE.MeshLambertMaterial({color: '#2ec27e'}));
      leaf.position.set(x, 1.15, z); pyAdd(leaf);
    });

    // string lights
    for (let i = 0; i < 10; i++){
      const x = -15 + i * 3.3;
      const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.14, 8, 6), new THREE.MeshBasicMaterial({color: i % 2 ? '#ffe08a' : '#ffb3c7'}));
      bulb.position.set(x, 6.6, 0); pyAdd(bulb);
    }

    // kickable ball
    const ball = new THREE.Mesh(new THREE.SphereGeometry(R.ball.r, 16, 12), new THREE.MeshLambertMaterial({color: '#f4f4f4'}));
    ball.position.set(R.ball.x, R.ball.r + 0.02, R.ball.z);
    // simple pentagon-ish patches
    const patch = new THREE.Mesh(new THREE.SphereGeometry(R.ball.r * 1.01, 8, 6), new THREE.MeshBasicMaterial({color: '#1d2340', wireframe: true}));
    ball.add(patch);
    pyAdd(ball); py.ballM = ball;

    try {
      const t1 = label('🎉 Party Pad', 'rgba(29,35,64,.9)', '#fff', 360);
      if (t1){ t1.position.set(0, 8.2, 0); pyAdd(t1); }
      const t2 = label('💃 Dance floor', 'rgba(255,111,181,.92)', '#fff', 280);
      if (t2){ t2.position.set(0, 2.4, -1); t2.scale.multiplyScalar(0.7); pyAdd(t2); }
    } catch (e){}

    checkpoints[0] = {idx: 0, spawn: {x: R.spawn.x, y: R.spawn.y, z: R.spawn.z}, flag: new THREE.Object3D()};
    P.x = R.spawn.x; P.y = R.spawn.y; P.z = R.spawn.z; P.face = R.spawn.face; P.vx = P.vy = P.vz = 0;
  }

  function partyHud(){
    if (!py) return;
    const box = document.getElementById('pyBox');
    const act = document.getElementById('pyAct');
    const hint = document.getElementById('pyHint');
    if (box) box.style.display = mode === 'party' ? '' : 'none';
    if (hint) hint.textContent = py.hint || 'Dance, sit on a sofa, snap a photo, or kick the ball with friends!';
    if (act){
      if (py.act){ act.textContent = py.act; act.classList.add('show'); }
      else act.classList.remove('show');
    }
  }

  function partyEnter(){
    if (!py) return;
    P.face = (PY_API ? PY_API.PY.spawn.face : Math.PI);
    cam.pitch = 0.36; cam.dist = 12;
    try { if (window.rubloxMusic && typeof rubloxMusic.kick === 'function') rubloxMusic.kick(); } catch (e){}
    try { if (typeof achNote === 'function') achNote('party-first'); } catch (e){}
    partyHud();
    const act = document.getElementById('pyAct');
    if (act && !window.__pyActBound){ window.__pyActBound = true; act.onclick = ev => { ev.preventDefault(); ev.stopPropagation(); partyAct(); }; }
    banner('🎉 Welcome to the Party Pad! Dance, sit, snap a photo, kick the ball.');
  }

  function partyStop(){
    if (!py) return;
    try { py.trash.forEach(m => { if (m && m.parent) m.parent.remove(m); }); } catch (e){}
    const box = document.getElementById('pyBox'); if (box) box.style.display = 'none';
    const act = document.getElementById('pyAct'); if (act) act.classList.remove('show');
    $('#obby') && $('#obby').classList.remove('pymode');
    py = null;
  }

  function partySitToggle(){
    if (!py || !PY_API) return false;
    if (py.sit){
      py.sit = null;
      if (emote && emote.id === 'sit') emote = null;
      banner('🙂 All up!');
      return true;
    }
    const s = PY_API.pyNearSofa(P.x, P.z);
    if (!s) return false;
    py.sit = s.id;
    P.x = s.seat[0]; P.z = s.seat[1]; P.vx = P.vz = P.vy = 0; P.face = s.face + Math.PI;
    emote = {id: 'sit', t: 0};
    banner('🪑 Comfy!');
    return true;
  }

  function partyPhoto(){
    if (!py || !PY_API || !PY_API.pyNearPhoto(P.x, P.z)) return false;
    py.photoFlash = 0.55;
    emote = {id: 'cheer', t: 0};
    P.vx = P.vz = 0;
    banner('📸 Say cheese!');
    try { if (typeof SND !== 'undefined' && SND.cp) SND.cp(); } catch (e){}
    return true;
  }

  function partyKick(){
    if (!py || !PY_API) return false;
    const r = PY_API.pyKick(py.ball, P.x, P.z, P.vx, P.vz);
    if (!r.hit) return false;
    py.ball = r.ball;
    py.lastSend = 0;
    partySendBall(true);
    try { if (typeof SND !== 'undefined' && SND.jump) SND.jump(); } catch (e){}
    return true;
  }

  function partyAct(){
    if (!py || paused || over || choosing) return false;
    if (partySitToggle()) return true;
    if (partyPhoto()) return true;
    if (partyKick()) return true;
    // trade prompt if a friend is close
    try { if (typeof trNearPeer === 'function'){ const n = trNearPeer(); if (n && typeof trBegin === 'function'){ trBegin(n.uid); return true; } } } catch (e){}
    return false;
  }

  function partyKey(e){
    if (!py || e.repeat) return false;
    if (e.code === 'KeyE' || e.code === 'KeyF' || e.key === 'e' || e.key === 'f'){ partyAct(); return true; }
    return false;
  }

  function partyPad(jp){
    if (!py) return false;
    // Xbox X (button 2) and Y (3) as interact
    if (jp && (jp[2] || jp[3])){ partyAct(); return true; }
    return false;
  }

  function partySendBall(force){
    if (!py || typeof mp === 'undefined' || !mp || !mp.on) return;
    const now = (typeof performance !== 'undefined' ? performance.now() : Date.now());
    if (!force && now - (py.lastSend || 0) < 80) return;
    py.lastSend = now;
    const msg = {t: 'py', a: 'ball', x: py.ball.x, z: py.ball.z, vx: py.ball.vx, vz: py.ball.vz};
    try {
      if (mp.host) mpBroadcast(msg);
      else if (force && typeof mpSend === 'function') mpSend({t: 'py', a: 'kick', x: py.ball.x, z: py.ball.z, vx: py.ball.vx, vz: py.ball.vz});
    } catch (e){}
  }

  function partyFromGuest(g, d){
    if (!d || d.t !== 'py' || !py || !mp || !mp.host) return;
    if (d.a === 'kick'){
      py.ball = {x: +d.x, z: +d.z, vx: +d.vx || 0, vz: +d.vz || 0};
      partySendBall(true);
    }
  }

  function partyFromHost(d){
    if (!d || d.t !== 'py' || !py) return;
    if (d.a === 'ball' && !(mp && mp.host)){
      py.ball = {x: +d.x, z: +d.z, vx: +d.vx || 0, vz: +d.vz || 0};
    }
  }

  function partyUpdate(dt){
    if (!py) return;
    // fall respawn
    if (P.y < -4 && checkpoints[0] && checkpoints[0].spawn){
      const s = checkpoints[0].spawn;
      P.x = s.x; P.y = s.y; P.z = s.z; P.vx = P.vy = P.vz = 0;
    }
    const onDance = PY_API ? PY_API.pyOnDance(P.x, P.z) : false;
    const sofa = PY_API ? PY_API.pyNearSofa(P.x, P.z) : null;
    const photo = PY_API ? PY_API.pyNearPhoto(P.x, P.z) : false;
    const nearBall = Math.hypot(py.ball.x - P.x, py.ball.z - P.z) < 1.8;
    if (py.sit && (Math.hypot(P.vx, P.vz) > 0.4 || (P.vy || 0) > 1)){ py.sit = null; if (emote && emote.id === 'sit') emote = null; }
    if (onDance && !py.sit){
      if (!emote || emote.id !== 'dance') emote = {id: 'dance', t: 0};
      py.dance = true;
    } else if (py.dance && emote && emote.id === 'dance'){ emote = null; py.dance = false; }
    if (py.sit && (!emote || emote.id !== 'sit')) emote = {id: 'sit', t: 0};

    py.hint = onDance ? '💃 Dance floor! Your dance starts automatically.' :
      (sofa && !py.sit) ? '🪑 Sofa — press E, the Act button, or Ⓧ to sit.' :
      (py.sit) ? '🪑 Sitting. Press E / Ⓧ or move to stand up.' :
      (photo) ? '📸 Photo spot — press E, Act, or Ⓧ to say cheese!' :
      (nearBall) ? '⚽ Run into the ball or press E / Ⓧ to kick it!' :
      '🎉 Hang out! Dance, sit, snap a photo, or kick the ball.';
    py.act = (sofa && !py.sit) ? '🪑 Sit' : (py.sit) ? '🙂 Stand' : (photo) ? '📸 Photo' : (nearBall) ? '⚽ Kick' : '';

    if (PY_API){
      py.ball = PY_API.pyBallStep(py.ball, dt);
      if (nearBall && Math.hypot(P.vx, P.vz) > 2.2) partyKick();
    }
    if (py.ballM){
      py.ballM.position.set(py.ball.x, 0.57, py.ball.z);
      py.ballM.rotation.x += (py.ball.vz) * dt * 0.4;
      py.ballM.rotation.z -= (py.ball.vx) * dt * 0.4;
    }
    if (py.photoFlash > 0){
      py.photoFlash -= dt;
      let fl = document.getElementById('pyFlash');
      if (!fl){ fl = document.createElement('div'); fl.id = 'pyFlash'; document.getElementById('obby') && document.getElementById('obby').appendChild(fl); }
      fl.style.opacity = String(Math.max(0, Math.min(1, py.photoFlash * 2)));
    } else {
      const fl = document.getElementById('pyFlash'); if (fl) fl.style.opacity = '0';
    }
    if (mp && mp.on && mp.host && Math.hypot(py.ball.vx, py.ball.vz) > 0.2) partySendBall(false);
    partyHud();
  }
