  /* ---------- Snow Festival grounds (t296u) — toss, sled, snowman, skate ---------- */
  let evg = null;

  function buildSnowFest(){
    evg = {
      trash: [], balls: [], rings: [], targets: [], carry: null, sled: false, sledT: 0,
      tossHits: 0, skateGot: 0, man: {base:0, mid:0, head:0, face:0}, hint: '', act: '',
      flash: 0
    };
    scene.background = new THREE.Color('#9ec0e0');
    scene.fog = new THREE.Fog('#9ec0e0', 55, 140);
    scene.traverse(o => {
      if (o.isHemisphereLight){ o.intensity = 0.7; o.color.set('#f7fbff'); o.groundColor.set('#9bb3c9'); }
      if (o.isDirectionalLight){ o.intensity = 0.45; o.color.set('#fff6e0'); o.position.set(20, 40, 10); }
    });

    // snow field + plaza
    plat(0, 0, 4, 64, 72, '#d5e6f4', 1.2);
    plat(0, 0.06, 2, 14, 14, '#c5d8ec', 0.06);
    // rims
    plat(0, 4, -32, 64, 1.2, '#d5e6f5', 4, {noEdge: true});
    plat(0, 4, 40, 64, 1.2, '#d5e6f5', 4, {noEdge: true});
    plat(-32, 4, 4, 1.2, 72, '#d5e6f5', 4, {noEdge: true});
    plat(32, 4, 4, 1.2, 72, '#d5e6f5', 4, {noEdge: true});

    // trees
    [[-20, 14], [20, 14], [-24, -8], [24, -8], [-10, 28], [10, 28], [-22, 24], [22, 24]].forEach(([x, z]) => evgTree(x, z));

    // festival tree
    evgTree(0, -2, 1.5);
    evgLabel('❄️ Snow Festival', 0, 6.2, -2, 'rgba(40,70,110,.92)');

    // --- Ice rink (north / -Z) ---
    evg.rink = plat(0, 0.08, -16, 16, 12, '#b9e4ff', 0.1);
    evg.rink.ice = true;
    evgLabel('⛸️ Ice rink — skate and grab flakes!', 0, 3.2, -22, 'rgba(40,90,140,.92)');
    const ringSpots = [[-5,-16], [5,-16], [0,-12], [0,-20], [-4,-13], [4,-13], [-4,-19], [4,-19]];
    ringSpots.forEach(([x, z], i) => {
      const m = new THREE.Mesh(new THREE.TorusGeometry(0.55, 0.1, 8, 16), new THREE.MeshBasicMaterial({color: i % 2 ? '#5ad0ff' : '#ffe08a'}));
      m.rotation.x = Math.PI / 2; m.position.set(x, 0.7, z); scene.add(m); evg.trash.push(m);
      evg.rings.push({x, z, m, got: false});
    });

    // --- Snowball toss (east) ---
    plat(18, 0.2, 2, 6, 6, '#e8f3ff', 0.2);
    evgLabel('❄️ Snowball toss — press E / Ⓧ to throw!', 18, 3.4, -2, 'rgba(40,70,110,.92)');
    [[24, 0.9, -2], [26, 1.6, 2], [24, 2.3, 6]].forEach(([x, y, z], i) => {
      const t = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, 0.2, 16), new THREE.MeshLambertMaterial({color: i === 2 ? '#ff6fb5' : '#ffd23f'}));
      t.rotation.x = Math.PI / 2; t.position.set(x, y, z); scene.add(t); evg.trash.push(t);
      evg.targets.push({x, y, z, m: t, hit: false, r: 0.7});
    });

    // --- Snowman (west) ---
    plat(-18, 0.15, 2, 10, 8, '#eef7ff', 0.15);
    evgLabel('⛄ Build a snowman — pick up 3 snowballs!', -18, 3.4, -3, 'rgba(40,70,110,.92)');
    evg.manBase = {x: -18, z: 2};
    evg.bits = [
      {k: 'base', x: -22, z: 4, r: 0.7, got: false, m: evgBall(-22, 0.7, 4, 0.7)},
      {k: 'mid', x: -22, z: 0, r: 0.55, got: false, m: evgBall(-22, 0.55, 0, 0.55)},
      {k: 'head', x: -14, z: 4, r: 0.4, got: false, m: evgBall(-14, 0.4, 4, 0.4)}
    ];
    evg.manParts = [];

    // --- Sled hill (south / +Z) ---
    // stepped slope from y=6 at z=18 down to y=0.2 at z=34
    for (let i = 0; i < 8; i++){
      const z = 18 + i * 2.2, y = 5.5 - i * 0.7, w = 7 + i * 0.2;
      plat(0, y, z, w, 2.4, i % 2 ? '#e8f3ff' : '#d7ebfb', 0.5);
    }
    plat(0, 0.2, 36, 10, 4, '#f4fbff', 0.2);
    evg.sledStart = {x: 0, y: 6.2, z: 16.5};
    evg.sledFin = {x: 0, z: 36, r: 3.2};
    evgLabel('🛷 Sled hill — stand on the sled and go!', 0, 8.2, 15, 'rgba(40,70,110,.92)');
    const sled = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.18, 2.2), new THREE.MeshLambertMaterial({color: '#c45c4a'}));
    sled.position.set(0, 5.9, 16.6); scene.add(sled); evg.trash.push(sled); evg.sledMesh = sled;

    evgLabel('🎁 Festival shop is in the pause menu or the ❄️ button', 0, 2.6, 6, 'rgba(40,70,110,.88)');

    checkpoints[0] = {idx: 0, spawn: {x: 0, y: 0.5, z: 8}, flag: new THREE.Object3D()};
    P.x = 0; P.y = 0.5; P.z = 8; P.face = Math.PI; P.vx = P.vy = P.vz = 0;
  }

  function evgBall(x, y, z, r){
    const m = new THREE.Mesh(new THREE.SphereGeometry(r, 12, 10), new THREE.MeshLambertMaterial({color: '#f7fbff'}));
    m.position.set(x, y, z); scene.add(m); evg.trash.push(m); return m;
  }

  function evgTree(x, z, scale){
    scale = scale || 1;
    const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.28*scale, 0.35*scale, 0.5*scale, 6), new THREE.MeshLambertMaterial({color: '#8d5524'}));
    pot.position.set(x, 0.25*scale, z); scene.add(pot); evg.trash.push(pot);
    const leaf = new THREE.Mesh(new THREE.ConeGeometry(1.0*scale, 2.4*scale, 8), new THREE.MeshLambertMaterial({color: '#1f7a4c'}));
    leaf.position.set(x, 1.6*scale, z); scene.add(leaf); evg.trash.push(leaf);
    const snow = new THREE.Mesh(new THREE.ConeGeometry(0.7*scale, 0.5*scale, 8), new THREE.MeshLambertMaterial({color: '#ffffff'}));
    snow.position.set(x, 2.5*scale, z); scene.add(snow); evg.trash.push(snow);
  }

  function evgLabel(text, x, y, z, bg){
    try {
      const m = (typeof label === 'function') ? label(text, bg || 'rgba(40,70,110,.92)', '#fff', 420) : null;
      if (m){ m.position.set(x, y, z); m.scale.multiplyScalar(0.8); scene.add(m); evg.trash.push(m); }
    } catch (e){}
  }

  function snowfestEnter(){
    if (!evg) return;
    cam.pitch = 0.38; cam.dist = 13;
    P.face = Math.PI;
    try { if (window.rubloxMusic && rubloxMusic.kick) rubloxMusic.kick(); } catch (e){}
    try { if (typeof achNote === 'function') achNote('ev-snow-visit'); } catch (e){}
    try { if (typeof evTryDaily === 'function') evTryDaily(); } catch (e){}
    evgHud();
    const act = document.getElementById('evgAct');
    if (act && !window.__evgActBound){ window.__evgActBound = true; act.onclick = ev => { ev.preventDefault(); ev.stopPropagation(); snowfestAct(); }; }
    const shop = document.getElementById('evgShopBtn');
    if (shop && !window.__evgShopBound){ window.__evgShopBound = true; shop.onclick = ev => { ev.preventDefault(); evOpenShop(true); }; }
    banner('❄️ Welcome to the Snow Festival! Earn snowflakes and try every booth.');
  }

  function snowfestStop(){
    if (!evg) return;
    try { evg.trash.forEach(m => { if (m && m.parent) m.parent.remove(m); }); } catch (e){}
    evg.balls.forEach(b => { try { if (b.m && b.m.parent) b.m.parent.remove(b.m); } catch (e){} });
    const box = document.getElementById('evgBox'); if (box) box.style.display = 'none';
    const act = document.getElementById('evgAct'); if (act) act.classList.remove('show');
    evg = null;
  }

  function evgHud(){
    if (!evg) return;
    const box = document.getElementById('evgBox');
    const hint = document.getElementById('evgHint');
    const act = document.getElementById('evgAct');
    if (box) box.style.display = (typeof mode !== 'undefined' && mode === 'snowfest') ? '' : 'none';
    if (hint) hint.textContent = evg.hint || '❄️ Snow Festival — toss, sled, build, skate!';
    if (act){
      if (evg.act){ act.textContent = evg.act; act.classList.add('show'); }
      else act.classList.remove('show');
    }
  }

  function evgOnRink(){ return evg && Math.abs(P.x) < 8 && Math.abs(P.z + 16) < 6 && P.y < 1.2; }
  function evgNearToss(){ return evg && Math.hypot(P.x - 18, P.z - 2) < 3.2; }
  function evgNearSled(){ return evg && !evg.sled && Math.hypot(P.x - evg.sledStart.x, P.z - evg.sledStart.z) < 2.2 && P.y > 4.5; }
  function evgNearMan(){ return evg && Math.hypot(P.x + 18, P.z - 2) < 6; }

  function evgThrow(){
    if (!evg || evg.sled) return false;
    if (!evgNearToss() && !evg.carry) return false;
    const face = P.face || 0;
    const sp = 16;
    const m = new THREE.Mesh(new THREE.SphereGeometry(0.22, 8, 8), new THREE.MeshLambertMaterial({color: '#f7fbff'}));
    m.position.set(P.x, P.y + 1.4, P.z); scene.add(m); evg.trash.push(m);
    evg.balls.push({m, x: P.x, y: P.y + 1.4, z: P.z, vx: Math.sin(face) * sp, vy: 4.5, vz: Math.cos(face) * sp, life: 2.4});
    try { if (typeof SND !== 'undefined' && SND.jump) SND.jump(); } catch (e){}
    return true;
  }

  function evgPickOrBuild(){
    if (!evg) return false;
    if (evg.carry){
      if (Math.hypot(P.x - evg.manBase.x, P.z - evg.manBase.z) < 2.2){
        evg.man[evg.carry] = 1;
        evgPlaceMan(evg.carry);
        evg.carry = null;
        evgCheckMan();
        banner('⛄ Stacked!');
        return true;
      }
      return false;
    }
    const bit = evg.bits.find(b => !b.got && Math.hypot(P.x - b.x, P.z - b.z) < 1.6);
    if (!bit) return false;
    bit.got = true; evg.carry = bit.k;
    if (bit.m) bit.m.visible = false;
    banner('⛄ Carrying a snowball — take it to the middle!');
    return true;
  }

  function evgPlaceMan(k){
    const y = k === 'base' ? 0.7 : k === 'mid' ? 1.7 : 2.5;
    const r = k === 'base' ? 0.7 : k === 'mid' ? 0.55 : 0.4;
    const m = evgBall(evg.manBase.x, y, evg.manBase.z, r);
    evg.manParts.push(m);
    if (k === 'head'){
      const nose = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.35, 6), new THREE.MeshLambertMaterial({color: '#ff9f1c'}));
      nose.rotation.x = Math.PI / 2; nose.position.set(evg.manBase.x, 2.55, evg.manBase.z + 0.4); scene.add(nose); evg.trash.push(nose);
      const hat = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.35, 10), new THREE.MeshLambertMaterial({color: '#1d2340'}));
      hat.position.set(evg.manBase.x, 3.05, evg.manBase.z); scene.add(hat); evg.trash.push(hat);
    }
  }

  function evgCheckMan(){
    if (evg.man.base && evg.man.mid && evg.man.head && !evg.man.done){
      evg.man.done = true;
      evgMarkDone('snowman', 1, true);
      evGive(EV_API && EV_API.EV_FLAKE ? EV_API.EV_FLAKE.snowman : 20, 'Snowman');
      try { if (typeof confetti === 'function') confetti(); } catch (e){}
      banner('⛄ A perfect snowman! You earned snowflakes!');
    }
  }

  function evgStartSled(){
    if (!evg || evg.sled) return false;
    if (!evgNearSled()) return false;
    evg.sled = true; evg.sledT = 0;
    P.x = evg.sledStart.x; P.y = evg.sledStart.y; P.z = evg.sledStart.z; P.vx = 0; P.vz = 8; P.vy = 0;
    banner('🛷 Sledding! Steer with move, hop off at the bottom.');
    return true;
  }

  function evgMarkDone(key, value, higher){
    try { if (typeof evMark === 'function') evMark(key, value, higher); } catch (e){}
  }

  function snowfestAct(){
    if (!evg || paused || over || choosing) return false;
    if (evgStartSled()) return true;
    if (evgPickOrBuild()) return true;
    if (evgThrow()) return true;
    return false;
  }

  function snowfestKey(e){
    if (!evg || e.repeat) return false;
    if (e.code === 'KeyE' || e.code === 'KeyF' || e.key === 'e' || e.key === 'f'){ snowfestAct(); return true; }
    return false;
  }

  function snowfestPad(jp){
    if (!evg) return false;
    if (jp && (jp[2] || jp[3])){ snowfestAct(); return true; }
    return false;
  }

  function snowfestUpdate(dt){
    if (!evg) return;
    if (P.y < -4){ const s = checkpoints[0] && checkpoints[0].spawn; if (s){ P.x = s.x; P.y = s.y; P.z = s.z; P.vx = P.vy = P.vz = 0; evg.sled = false; evg.carry = null; } }

    // ice skating: low friction + ring pickup
    if (evgOnRink() && !evg.sled){
      P.vx *= Math.pow(0.992, dt * 60);
      P.vz *= Math.pow(0.992, dt * 60);
      evg.rings.forEach(r => {
        if (r.got) return;
        if (Math.hypot(P.x - r.x, P.z - r.z) < 0.9){
          r.got = true; evg.skateGot++; if (r.m) r.m.visible = false;
          evGive((EV_API && EV_API.EV_FLAKE ? EV_API.EV_FLAKE.skateRing : 2), '');
        }
      });
      if (evg.skateGot >= evg.rings.length && !evg.doneSkate){
        evg.doneSkate = true;
        evgMarkDone('skate', evg.skateGot, true);
        evGive(EV_API && EV_API.EV_FLAKE ? EV_API.EV_FLAKE.skate : 6, 'Ice rink');
        banner('⛸️ You grabbed every flake on the rink!');
      }
    }

    // sled
    if (evg.sled){
      evg.sledT += dt;
      P.vz = Math.max(P.vz, 9);
      P.y = Math.max(P.y, 0.3);
      if (evg.sledMesh) evg.sledMesh.position.set(P.x, P.y + 0.1, P.z);
      if (Math.hypot(P.x - evg.sledFin.x, P.z - evg.sledFin.z) < evg.sledFin.r || evg.sledT > 12){
        evg.sled = false;
        const t = +evg.sledT.toFixed(2);
        evgMarkDone('sled', t, false);
        evGive(EV_API && EV_API.EV_FLAKE ? EV_API.EV_FLAKE.sled : 12, 'Sled hill');
        banner('🛷 Finish! ' + t.toFixed(1) + 's — snowflakes for you!');
        if (evg.sledMesh) evg.sledMesh.position.set(0, 5.9, 16.6);
      }
    }

    // snowball projectiles
    evg.balls = evg.balls.filter(b => {
      b.vy -= 22 * dt; b.x += b.vx * dt; b.y += b.vy * dt; b.z += b.vz * dt; b.life -= dt;
      if (b.m) b.m.position.set(b.x, b.y, b.z);
      evg.targets.forEach(t => {
        if (t.hit) return;
        if (Math.hypot(b.x - t.x, b.y - t.y, b.z - t.z) < t.r + 0.25){
          t.hit = true; evg.tossHits++;
          if (t.m && t.m.material) t.m.material.color.set('#2ec27e');
          evGive(EV_API && EV_API.EV_FLAKE ? EV_API.EV_FLAKE.tossHit : 2, '');
        }
      });
      if (b.y < 0 || b.life <= 0){ if (b.m && b.m.parent) b.m.parent.remove(b.m); return false; }
      return true;
    });
    if (evg.tossHits >= evg.targets.length && !evg.doneToss){
      evg.doneToss = true;
      evgMarkDone('toss', evg.tossHits, true);
      evGive(EV_API && EV_API.EV_FLAKE ? EV_API.EV_FLAKE.toss : 8, 'Snowball toss');
      banner('❄️ Every target! Nice throws!');
    }

    evg.hint = evg.sled ? '🛷 Sledding! Steer and ride to the bottom.' :
      evgNearSled() ? '🛷 Hop on the sled — press E / Ⓧ or the Act button.' :
      evgOnRink() ? ('⛸️ Skate the rink! Flakes ' + evg.skateGot + ' / ' + evg.rings.length) :
      evgNearToss() ? '❄️ Face the targets and press E / Ⓧ to throw a snowball.' :
      evg.carry ? '⛄ Carry the snowball to the middle circle and press E / Ⓧ.' :
      evgNearMan() ? (evg.man.done ? '⛄ What a snowman!' : '⛄ Pick up a snowball and stack it in the middle.') :
      '❄️ Visit the rink, toss booth, snowman, or sled hill. Earn snowflakes!';
    evg.act = evgNearSled() ? '🛷 Sled' : evg.carry ? '⛄ Place' : evgNearMan() && evg.bits.some(b => !b.got && Math.hypot(P.x-b.x,P.z-b.z)<1.6) ? '⛄ Pick up' : evgNearToss() ? '❄️ Throw' : '';
    evgHud();
  }
