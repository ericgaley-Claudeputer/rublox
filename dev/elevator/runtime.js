  /* ---------- Wobblevator ---------- */
  let elv = null;

  function elevState(){ return ElevRules.elevLoad(typeof load === 'function' ? load(ElevRules.ELEV_KEY, null) : null); }
  function elevPersist(s){ if (typeof save === 'function') save(ElevRules.ELEV_KEY, s); if (elv) elv.sv = s; }
  function elevKeep(m){ if (m && elv && elv.trash) elv.trash.push(m); return m; }
  function elevFkeep(m){ if (m && elv && elv.floorTrash) elv.floorTrash.push(m); return m; }
  function elevMat(color, opts){ return new THREE.MeshLambertMaterial(Object.assign({color: color}, opts || {})); }
  function elevMesh(geo, color, x, y, z, floor, opts){
    const m = new THREE.Mesh(geo, elevMat(color, opts));
    m.position.set(x, y, z);
    scene.add(m);
    if (floor) elevFkeep(m); else elevKeep(m);
    return m;
  }
  function elevLab(text, x, y, z, floor){
    try {
      if (typeof t297Lab === 'function'){
        const m = t297Lab(text, x, y, z);
        if (m){ if (floor) elevFkeep(m); else elevKeep(m); return m; }
      }
    } catch (e){}
    return null;
  }
  function elevNear(x, z, r){ return Math.hypot(P.x - x, P.z - z) <= (r == null ? 1.8 : r); }
  function elevPay(n){ if (n > 0){ try { setCoins(coins + n); runCoins = (runCoins || 0) + n; } catch (e){} } }
  function elevAch(id){ try { if (typeof achNote === 'function') achNote(id); } catch (e){} }
  function elevBoard(v){ try { if (typeof lbRecord === 'function') lbRecord('elev-best', v); } catch (e){} }
  function elevTone(freqs, dur, type, vol){ try { if (typeof beep === 'function') beep(freqs, dur, type || 'sine', vol == null ? 0.05 : vol); } catch (e){} }

  function elevMakeBingle(x, y, z){
    const g = new THREE.Group();
    const bell = new THREE.Mesh(new THREE.SphereGeometry(0.55, 10, 8, 0, Math.PI * 2, 0, Math.PI * 0.65), elevMat('#ffd23f', {emissive:'#7a5a00'}));
    bell.position.y = 0.35; g.add(bell);
    const brim = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.62, 0.08, 12), elevMat('#e8b83a'));
    brim.position.y = 0.12; g.add(brim);
    const clapper = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 6), elevMat('#1d2340'));
    clapper.position.y = -0.08; g.add(clapper);
    const e1 = new THREE.Mesh(new THREE.SphereGeometry(0.08, 6, 6), new THREE.MeshBasicMaterial({color:'#1d2340'}));
    e1.position.set(-0.16, 0.42, 0.42); g.add(e1);
    const e2 = e1.clone(); e2.position.x = 0.16; g.add(e2);
    const hat = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.28, 0.28, 8), elevMat('#3a86ff'));
    hat.position.y = 0.82; g.add(hat);
    g.position.set(x, y, z);
    scene.add(g); elevKeep(g);
    return g;
  }
  function elevMakePal(pal, x, z){
    const g = new THREE.Group();
    const col = pal.id === 'sock' ? '#3a86ff' : pal.id === 'niblet' ? '#ffd23f' : pal.id === 'marm' ? '#ff6fb5' : pal.id === 'taro' ? '#2ec27e' : '#8b5cf6';
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.9, 0.5), elevMat(col));
    body.position.y = 0.55; g.add(body);
    const head = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.45, 0.45), elevMat('#ffe0b0'));
    head.position.y = 1.2; g.add(head);
    g.position.set(x, 0, z);
    scene.add(g); elevKeep(g);
    elevLab((pal.emoji || '') + ' ' + pal.name, x, 1.9, z);
    return g;
  }

  function elevClearFloorMeshes(){
    if (!elv) return;
    (elv.floorTrash || []).forEach(m => { try { scene.remove(m); } catch (e){} });
    elv.floorTrash = [];
    elv.hazards = [];
    elv.pickups = [];
    elv.bells = [];
    elv.paints = [];
    elv.door = null;
    elv.lamp = null;
    elv.tiles = [];
    elv.turnIn = null;
    elv.lightDisc = null;
  }

  function elevBuildRoom(col, w, d){
    elevMesh(new THREE.BoxGeometry(w, 0.2, d), col, 0, 0.1, -30, true);
    elevMesh(new THREE.BoxGeometry(w, 6, 0.3), '#d8d0c4', 0, 3, -30 - d/2, true);
    elevMesh(new THREE.BoxGeometry(0.3, 6, d), '#d8d0c4', -w/2, 3, -30, true);
    elevMesh(new THREE.BoxGeometry(0.3, 6, d), '#d8d0c4', w/2, 3, -30, true);
    plat(0, 0.2, -30, w, d, col, 0.2);
  }
  function elevDoorPad(x, z){
    const m = elevMesh(new THREE.BoxGeometry(2.2, 0.15, 2.2), '#ffd23f', x, 0.28, z, true, {emissive:'#7a5a00'});
    elv.door = {x, z, mesh:m};
    elevLab('🚪 Door', x, 1.6, z, true);
    return m;
  }

  function elevBuildFloor(id){
    elevClearFloorMeshes();
    elevRestoreSky();
    const f = ElevRules.elevFloor(id);
    if (!f) return;
    const z0 = -30;
    if (id === 'pillowpath'){
      elevBuildRoom('#f3d6ea', 16, 28);
      [[0,-22,0],[2.2,-18,0.5],[-2,-14,1],[2,-10,1.5],[-1.4,-6,2],[0,-2,2.4]].forEach(p => {
        elevMesh(new THREE.BoxGeometry(2.4, 0.5, 2.0), '#ffd0e8', p[0], 0.4 + p[2], z0 + p[1] + 14, true);
        plat(p[0], 0.65 + p[2], z0 + p[1] + 14, 2.4, 2.0, '#ffd0e8', 0.5);
      });
      elevDoorPad(0, z0 - 10);
    } else if (id === 'jellyhills'){
      elevBuildRoom('#e5d4ff', 16, 28);
      [[0,-20,0],[3,-16,0.8],[-3,-12,1.4],[0,-8,2],[2.5,-4,2.6]].forEach(p => {
        const m = elevMesh(new THREE.SphereGeometry(1.3, 8, 6), '#b57cff', p[0], 0.6 + p[2]*0.2, z0 + p[1] + 14, true);
        const pad = plat(p[0], 1.1 + p[2]*0.2, z0 + p[1] + 14, 2.2, 2.2, '#c9a2ff', 0.3);
        try { if (typeof jumpPads !== 'undefined') jumpPads.push(pad); } catch (e){}
      });
      elevDoorPad(0, z0 - 10);
    } else if (id === 'sockhunt' || id === 'lostlunch'){
      elevBuildRoom(id === 'sockhunt' ? '#dce8ff' : '#ffe9c8', 18, 18);
      const spots = [[-5,-26], [4,-24], [0,-34], [-4,-32], [5,-33]];
      const realAt = 2;
      spots.forEach((s, i) => {
        const real = i === realAt;
        const col = real ? (id === 'sockhunt' ? '#3a86ff' : '#c45c1a') : '#cfc8ba';
        const m = elevMesh(new THREE.BoxGeometry(0.7, 0.35, 0.9), col, s[0], 0.4, s[1], true);
        elv.pickups.push({mesh:m, x:s[0], z:s[1], item: real ? (id === 'sockhunt' ? 'sock' : 'lunch') : 'decoy'});
      });
      elv.turnIn = {x:0, z:-22};
      elevLab(id === 'sockhunt' ? '🧦 Basket' : '🐥 Picnic', 0, 1.6, -22, true);
    } else if (id === 'soapsurge'){
      elevBuildRoom('#c8f0ff', 16, 16);
      for (let i = 0; i < 5; i++){
        const m = elevMesh(new THREE.BoxGeometry(1.6, 0.3, 0.9), '#9fe7ff', (i-2)*2.4, 0.4, -30, true);
        elv.hazards.push({mesh:m, kind:'soap', i, speed: 3 + i * 0.4});
      }
      elevDoorPad(0, -38);
    } else if (id === 'pieparade'){
      elevBuildRoom('#ffe6d6', 16, 16);
      for (let i = 0; i < 4; i++){
        const m = elevMesh(new THREE.SphereGeometry(0.45, 8, 6), '#e07a3f', -8, 1.1, -26 - i*2, true);
        elv.hazards.push({mesh:m, kind:'pie', i, speed: 5 + i});
      }
      elevDoorPad(0, -38);
    } else if (id === 'balloonbounce'){
      elevBuildRoom('#fff0f6', 16, 16);
      for (let i = 0; i < 5; i++){
        const m = elevMesh(new THREE.SphereGeometry(0.6, 8, 6), i%2 ? '#ff6fb5' : '#3a86ff', (i-2)*2.2, 1.2, -28, true);
        elv.hazards.push({mesh:m, kind:'balloon', i, speed: 2.2 + i * 0.3});
      }
      elevDoorPad(0, -38);
    } else if (id === 'confetticannon'){
      elevBuildRoom('#fff7d6', 16, 16);
      elevMesh(new THREE.CylinderGeometry(0.6, 0.8, 1.4, 8), '#1d2340', 0, 0.8, -22, true);
      for (let i = 0; i < 8; i++){
        const m = elevMesh(new THREE.BoxGeometry(0.4, 0.4, 0.4), ['#ff4d5e','#ffd23f','#2ec27e','#3a86ff'][i%4], 0, 1.2, -24, true);
        elv.hazards.push({mesh:m, kind:'confetti', i, speed: 3 + (i%3)});
      }
    } else if (id === 'chimeorder'){
      elevBuildRoom('#efe7ff', 16, 14);
      const cols = ['#ff4d5e','#ffd23f','#3a86ff'];
      [-3, 0, 3].forEach((x, i) => {
        const m = elevMesh(new THREE.SphereGeometry(0.55, 10, 8, 0, Math.PI*2, 0, Math.PI*0.7), cols[i], x, 1.1, -30, true, {emissive: cols[i]});
        elv.bells.push({mesh:m, x, z:-30, i});
        elevLab('🔔 ' + (i + 1), x, 2.1, -30, true);
      });
    } else if (id === 'lanternhall'){
      elevBuildRoom('#1a1630', 16, 20);
      const disc = elevMesh(new THREE.CylinderGeometry(2.2, 2.2, 0.08, 16), '#ffe566', 0, 0.25, -24, true, {emissive:'#7a5a00'});
      elv.lightDisc = disc;
      const lamp = elevMesh(new THREE.CylinderGeometry(0.3, 0.3, 1.6, 8), '#ffd23f', 0, 1.0, -38, true, {emissive:'#7a5a00'});
      elv.door = {x:0, z:-38, mesh:lamp};
      elevLab('🕯️ Lamp', 0, 2.4, -38, true);
      scene.background = new THREE.Color('#141028');
      if (scene.fog){ scene.fog.color.set('#141028'); scene.fog.near = 6; scene.fog.far = 28; }
    } else if (id === 'shadowpeek'){
      elevBuildRoom('#16141f', 16, 18);
      for (let i = 0; i < 3; i++){
        const m = elevMesh(new THREE.BoxGeometry(1.2, 2.2, 0.4), '#0b0a10', -5 + i*5, 1.2, -34, true);
        elv.hazards.push({mesh:m, kind:'peek', i, speed: 1.4 + i*0.2});
      }
      elevDoorPad(0, -38);
      scene.background = new THREE.Color('#121018');
    } else if (id === 'tickletiles'){
      elevBuildRoom('#e8ffe9', 14, 14);
      for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++){
        const grumpy = (i + j) % 3 === 0;
        const x = -4.5 + i * 3, z = -24 - j * 3;
        const m = elevMesh(new THREE.BoxGeometry(2.6, 0.12, 2.6), grumpy ? '#8b5cf6' : '#ffd23f', x, 0.26, z, true);
        elv.tiles.push({mesh:m, x, z, grumpy});
      }
      elevDoorPad(0, -38);
    } else if (id === 'partypaint'){
      elevBuildRoom('#fff4e0', 16, 14);
      [-4, 0, 4].forEach((x, i) => {
        const m = elevMesh(new THREE.BoxGeometry(1.6, 1.8, 0.12), '#f4f0e8', x, 1.3, -32, true);
        elv.paints.push({mesh:m, x, z:-32, i, done:false});
        elevLab('🙂', x, 2.5, -32, true);
      });
    } else if (id === 'snackstop'){
      elevBuildRoom('#ffe8cc', 14, 14);
      elevMesh(new THREE.BoxGeometry(4.2, 1.4, 1.4), '#c45c1a', 0, 0.8, -32, true);
      elevMesh(new THREE.CylinderGeometry(0.3, 0.3, 0.2, 10), '#c45c1a', 0, 1.6, -32, true);
      elv.turnIn = {x:0, z:-32, shop:true};
      elevLab('🍪 Lucky cookie — 8 🪙', 0, 2.4, -32, true);
      elevDoorPad(0, -38);
    } else {
      elevBuildRoom('#efe7ff', 14, 14);
      elevDoorPad(0, -38);
    }
  }

  function elevRestoreSky(){
    scene.background = new THREE.Color('#b8e0ff');
    if (scene.fog){ scene.fog.color.set('#b8e0ff'); scene.fog.near = 28; scene.fog.far = 90; }
  }

  function buildElevator(){
    const sv = elevState();
    const started = ElevRules.elevStartRun(sv, Date.now(), !!(typeof mp !== 'undefined' && mp && mp.on));
    elevPersist(started.state);
    elv = {trash:[], floorTrash:[], sv: started.state, run: started.run, hazards:[], pickups:[], bells:[], paints:[], tiles:[], door:null, host:null, pal:null, doors:[], near:null};
    elevRestoreSky();
    plat(0, 0, 8, 28, 28, '#c8bea8', 0.2);
    plat(0, 0, 14, 18, 10, '#d9d4c8', 0.08);
    // lobby walls / awning
    elevMesh(new THREE.BoxGeometry(18, 0.4, 1), '#f4efe4', 0, 4.2, 19, false);
    elevLab('🛗 Wobblevator Lobby', 0, 3.2, 18);
    // elevator cab
    plat(0, 0.05, 0, 6.4, 6.4, '#c9a24a', 0.08);
    elevMesh(new THREE.BoxGeometry(6.4, 0.9, 0.2), '#efe6d4', 0, 4.05, 3.2, false);
    elevMesh(new THREE.BoxGeometry(0.2, 4.4, 6.4), '#efe6d4', -3.2, 2.3, 0, false);
    elevMesh(new THREE.BoxGeometry(0.2, 4.4, 6.4), '#efe6d4', 3.2, 2.3, 0, false);
    elevMesh(new THREE.BoxGeometry(6.4, 0.2, 6.4), '#fff8ee', 0, 4.5, 0, false);
    const dL = elevMesh(new THREE.BoxGeometry(2.6, 3.6, 0.16), '#d4a017', -1.35, 1.9, -3.2, false);
    const dR = elevMesh(new THREE.BoxGeometry(2.6, 3.6, 0.16), '#d4a017', 1.35, 1.9, -3.2, false);
    elv.doors = [dL, dR];
    // back of cab (lobby side) opening
    elevMesh(new THREE.BoxGeometry(1.2, 4.4, 0.2), '#efe6d4', -2.6, 2.3, 3.2, false);
    elevMesh(new THREE.BoxGeometry(1.2, 4.4, 0.2), '#efe6d4', 2.6, 2.3, 3.2, false);
    elevLab('🛎️ Board here', 0, 3.4, 3.6);
    elv.host = elevMakeBingle(2.0, 0.2, -1.6);
    elevLab('🛎️ Bingle', 2.0, 2.1, -1.6);
    if (started.run.buddy){
      const pal = ElevRules.elevPickPal(started.run, Math.random);
      if (pal){ started.run.palId = pal.id; elv.pal = elevMakePal(pal, -2.0, -1.2); }
    }
    const amb = new THREE.AmbientLight(0xfff4e8, 0.55);
    scene.add(amb); elevKeep(amb);
    const cabLight = new THREE.PointLight(0xfff2d0, 1.2, 36);
    cabLight.position.set(0, 4.1, 0);
    scene.add(cabLight); elevKeep(cabLight);
    const hallLight = new THREE.PointLight(0xffe8c8, 0.7, 40);
    hallLight.position.set(0, 5, -28);
    scene.add(hallLight); elevKeep(hallLight);
    checkpoints[0] = {idx:0, spawn:{x:0,y:0.5,z:14}, flag:new THREE.Object3D()};
  }

  function elevHud(text, act){
    const hint = document.getElementById('elevHint');
    if (hint) hint.textContent = text || '';
    const btn = document.getElementById('elevAct');
    if (btn){ if (act){ btn.textContent = act; btn.classList.add('show'); } else btn.classList.remove('show'); }
  }
  function elevMeter(on, t, lab, max){
    const el = document.getElementById('elevMeter');
    const fill = document.getElementById('elevMeterFill');
    const tx = document.getElementById('elevMeterLab');
    if (!el) return;
    if (!on){ el.classList.remove('show'); return; }
    el.classList.add('show');
    const m = max > 0 ? max : 1;
    if (fill) fill.style.width = Math.max(0, Math.min(100, (t / m) * 100)) + '%';
    if (tx) tx.textContent = lab || '';
  }

  function elevInCab(){ return Math.abs(P.x) < 2.8 && Math.abs(P.z) < 2.8; }
  function elevSetDoors(open){
    if (!elv || !elv.doors) return;
    const t = open ? 2.2 : 0.15;
    elv.doors[0].position.x += ((open ? -2.5 : -1.35) - elv.doors[0].position.x) * 0.2;
    elv.doors[1].position.x += ((open ? 2.5 : 1.35) - elv.doors[1].position.x) * 0.2;
  }

  function elevEnter(){
    if (!elv) return;
    cam.pitch = 0.28; cam.dist = 12;
    try { if (typeof achNote === 'function') achNote('play:elevator'); } catch (e){}
    elevAch('elev-ride');
    banner('🛎️ Wobblevator! Walk into the lift and press E / Ⓧ. Bingle the Bellhop will take you to surprise floors. If one gets too wobbly, everyone is okay!');
    elevHud('Walk into the elevator, then press E / Ⓧ to ride. Open Help anytime.', '🛗 Ride');
    const help = document.getElementById('elevHelp');
    if (help && !help.__elevOv){
      help.__elevOv = true;
      help.addEventListener('click', ev => { if (ev.target === help && typeof t297OverlayClose === 'function') t297OverlayClose('elevHelp'); });
      const x = document.getElementById('elevHelpX');
      if (x) x.addEventListener('click', ev => { ev.preventDefault(); ev.stopPropagation(); if (typeof t297OverlayClose === 'function') t297OverlayClose('elevHelp'); });
    }
    const hb = document.getElementById('elevHelpBtn');
    if (hb && !hb.__elev){ hb.__elev = true; hb.addEventListener('click', ev => { ev.preventDefault(); elevOpenHelp(); }); }
    const ab = document.getElementById('elevAct');
    if (ab && !ab.__elev){ ab.__elev = true; ab.addEventListener('click', ev => { ev.preventDefault(); elevAct(); }); }
    if (typeof t297BindOverlays === 'function'){
      try { window.__t297OvBound = false; t297BindOverlays(); } catch (e){}
    }
  }

  function elevOpenHelp(){
    if (typeof t297OverlayShow === 'function') t297OverlayShow('elevHelp', true);
  }

  function elevGo(){
    if (!elv || elv.run.phase !== 'lobby') return;
    if (!elevInCab()){ banner('Step all the way into the lift first!'); return; }
    ElevRules.elevBeginRide(elv.run, Math.random);
    elevTone([520, 780, 1040], 0.08, 'sine', 0.05);
    banner(elv.run.quote);
  }

  function elevArrive(){
    if (!elv) return;
    const id = elv.run.floor;
    elevBuildFloor(id);
    P.x = 0; P.z = -22; P.y = 0.5; P.vy = 0;
    elevTone([330, 440], 0.07, 'triangle', 0.05);
    banner(elv.run.quote);
    if (id === 'chimeorder' && elv.run.seq && elv.run.seq.length){
      const names = ['red', 'yellow', 'blue'];
      banner('🛎️ Bingle hummed: ' + elv.run.seq.map(i => names[i] || (i+1)).join(', then ') + '!');
    }
    if (elv.run.buddy && elv.run.palId){
      const pal = ElevRules.elevPal(elv.run.palId);
      if (pal && pal.line) setTimeout(() => { if (elv && elv.run.phase === 'floor') banner((pal.emoji || '') + ' ' + pal.name + ': "' + pal.line + '"'); }, 1200);
    }
  }

  function elevReturnToCab(msg){
    elevClearFloorMeshes();
    elevRestoreSky();
    P.x = 0; P.z = 0; P.y = 0.5; P.vy = 0;
    if (msg) banner(msg);
  }

  function elevDoClear(){
    const r = ElevRules.elevClearFloor(elv.sv, elv.run);
    if (!r.ok) return;
    elevPersist(r.state);
    elv.run = r.run;
    if (r.pay) elevPay(r.pay);
    ElevRules.elevBadges(r.state, r.run).forEach(id => elevAch(id));
    elevBoard(r.state.best);
    elevTone([520, 660, 880], 0.1, 'sine', 0.06);
    elevReturnToCab(r.run.quote);
  }
  function elevDoFail(){
    const r = ElevRules.elevFailFloor(elv.sv, elv.run);
    if (!r.ok) return;
    elevPersist(r.state);
    elv.run = r.run;
    elevTone([180, 90], 0.12, 'triangle', 0.06);
    elevReturnToCab(r.run.quote);
  }

  function elevAct(){
    if (!elv) return false;
    if (typeof t297EatOverlayKey === 'function' && t297OverlayOpen && t297OverlayOpen()) return true;
    const run = elv.run;
    if (run.phase === 'lobby'){ elevGo(); return true; }
    if (run.phase !== 'floor') return false;
    if (elv.bells && elv.bells.length){
      const b = elv.bells.find(o => elevNear(o.x, o.z, 1.6));
      if (b){
        const r = ElevRules.elevRing(run, b.i);
        elevTone(r.ok ? [480 + b.i * 80] : [160], 0.07, 'sine', 0.06);
        if (r.why === 'wrong') banner('Oops, start the tune again!');
        if (run.wantClear) elevDoClear();
        return true;
      }
    }
    if (elv.paints && elv.paints.length){
      const p = elv.paints.find(o => !o.done && elevNear(o.x, o.z, 1.7));
      if (p){
        p.done = true;
        p.mesh.material.color.set('#ffd23f');
        ElevRules.elevPaint(run, p.i);
        elevTone([600, 720], 0.06, 'sine', 0.05);
        if (run.wantClear) elevDoClear();
        return true;
      }
    }
    if (elv.pickups && elv.pickups.length){
      const p = elv.pickups.find(o => !o.got && elevNear(o.x, o.z, 1.5));
      if (p){
        const r = ElevRules.elevPickItem(run, p.item);
        if (r.ok){
          p.got = true; p.mesh.visible = false;
          banner('Got it! Take it to the drop-off.');
          elevTone([640], 0.06, 'sine', 0.05);
        } else banner('That is not the right one!');
        return true;
      }
    }
    if (elv.turnIn && elevNear(elv.turnIn.x, elv.turnIn.z, 1.8)){
      if (elv.turnIn.shop){
        const wallet = (typeof coins === 'number') ? coins : 0;
        const r = ElevRules.elevBuySnack(elv.sv, wallet, run);
        if (r.ok){
          elevPersist(r.state);
          try { setCoins(r.wallet); } catch (e){}
          banner('🍪 Lucky cookie! The next floor pays a little extra.');
          elevTone([700, 880], 0.08, 'sine', 0.05);
        } else if (r.why === 'coins') banner('Need ' + r.need + ' more coins for a lucky cookie.');
        else if (r.why === 'have') banner('You already grabbed a cookie this stop.');
        return true;
      }
      if (run.holding){
        ElevRules.elevTurnIn(run);
        if (run.wantClear) elevDoClear();
        return true;
      }
    }
    return false;
  }

  function elevUpdate(dt){
    if (!elv) return;
    dt = Math.max(0, Math.min(0.12, +dt || 0));
    const run = elv.run;
    const before = run.phase;
    ElevRules.elevTick(run, dt);
    if (before === 'ride' && run.phase === 'floor') elevArrive();
    if (before === 'inter' && run.phase === 'ride'){
      banner(run.quote);
      elevTone([440, 550], 0.06, 'sine', 0.04);
    }
    if (run.wantClear) elevDoClear();
    else if (run.wantFail) elevDoFail();

    const openDoors = run.phase === 'lobby' || run.phase === 'floor' || run.phase === 'inter';
    elevSetDoors(openDoors);
    if (elv.host) elv.host.rotation.y = Math.sin(time * 2) * 0.3;
    if (elv.host) elv.host.position.y = 0.2 + Math.sin(time * 6) * (run.phase === 'ride' ? 0.12 : 0.04);

    const f = ElevRules.elevFloor(run.floor);
    const maxT = run.phase === 'floor' && f ? f.seconds : (run.phase === 'ride' ? ElevRules.ELEV_RIDE : ElevRules.ELEV_INTER);
    const lab = '🛗 ' + (run.survived || 0) + ' floors  ·  best ' + (elv.sv.best || 0) + (run.phase === 'floor' && f ? ('  ·  ' + f.emoji + ' ' + f.name + '  ·  ' + Math.ceil(run.t) + 's') : (run.phase === 'ride' ? '  ·  riding…' : ''));
    elevMeter(true, run.phase === 'floor' ? run.t : (run.phase === 'ride' ? run.t : 1), lab, maxT);

    if (run.phase === 'floor'){
      (elv.hazards || []).forEach(h => {
        if (!h.mesh) return;
        const t = time * h.speed;
        if (h.kind === 'soap') h.mesh.position.set(Math.sin(t + h.i) * 5, 0.4, -30 + Math.cos(t * 0.7 + h.i) * 5);
        else if (h.kind === 'pie') h.mesh.position.set(((t * 3 + h.i * 4) % 18) - 9, 1.1 + Math.sin(t) * 0.3, -26 - (h.i % 3) * 3);
        else if (h.kind === 'balloon') h.mesh.position.set(Math.sin(t + h.i) * 5, 1.1 + Math.abs(Math.sin(t * 1.4)) * 1.2, -30 + Math.cos(t + h.i) * 4);
        else if (h.kind === 'confetti') h.mesh.position.set(Math.sin(t * 1.3 + h.i) * 6, 0.8 + (t + h.i) % 3, -28 + Math.cos(t + h.i) * 4);
        else if (h.kind === 'peek') h.mesh.position.z = -34 + Math.sin(t) * 3;
        if (Math.hypot(P.x - h.mesh.position.x, P.z - h.mesh.position.z) < (h.kind === 'peek' ? 1.1 : 0.9) && Math.abs(P.y - h.mesh.position.y) < 1.4){
          ElevRules.elevTouchHazard(run);
        }
      });
      if (elv.tiles){
        const tile = elv.tiles.find(o => Math.hypot(P.x - o.x, P.z - o.z) < 1.3);
        if (tile && tile.grumpy) ElevRules.elevTouchHazard(run);
      }
      if (elv.lightDisc){
        elv.lightDisc.position.x = Math.sin(time * 0.8) * 4;
        elv.lightDisc.position.z = -24 + Math.cos(time * 0.6) * 6;
        const lit = Math.hypot(P.x - elv.lightDisc.position.x, P.z - elv.lightDisc.position.z) < 2.6;
        ElevRules.elevStayLit(run, lit);
      }
      if (elv.door && elevNear(elv.door.x, elv.door.z, 1.5)){
        ElevRules.elevReachDoor(run);
        if (run.wantClear) elevDoClear();
      }
    }

    if (run.wantFail) elevDoFail();

    let act = '';
    if (run.phase === 'lobby'){
      elevHud(elevInCab() ? 'E / Ⓧ — ding the lift and ride with Bingle!' : 'Walk into the golden elevator to board.', elevInCab() ? '🛗 Ride' : '');
    } else if (run.phase === 'ride'){
      elevHud(run.quote || 'The lift is wobbling to the next floor…', '');
    } else if (run.phase === 'floor' && f){
      if (elv.bells && elv.bells.some(o => elevNear(o.x, o.z, 1.6))) act = '🔔 Ring';
      else if (elv.paints && elv.paints.some(o => !o.done && elevNear(o.x, o.z, 1.7))) act = '🎨 Paint';
      else if (elv.pickups && elv.pickups.some(o => !o.got && elevNear(o.x, o.z, 1.5))) act = '🤲 Pick up';
      else if (elv.turnIn && elevNear(elv.turnIn.x, elv.turnIn.z, 1.8)) act = elv.turnIn.shop ? '🍪 Buy' : '🧺 Drop off';
      else if (elv.door && elevNear(elv.door.x, elv.door.z, 1.6)) act = '🚪 Door';
      elevHud(f.hint + (run.holding ? '  Holding the find!' : ''), act);
    } else {
      elevHud('Back in the lift. Next floor coming up!', '');
    }
  }

  function elevKey(e){
    if (!elv) return false;
    if (typeof t297EatOverlayKey === 'function' && t297EatOverlayKey(e)) return true;
    if (e.type === 'keyup') return false;
    const c = e.code || e.key;
    if (c === 'KeyE' || c === 'KeyF' || c === 'Space'){ /* space is jump; don't steal */ }
    if (c === 'KeyE' || c === 'KeyF'){ elevAct(); return true; }
    if (c === 'KeyH'){ elevOpenHelp(); return true; }
    return false;
  }
  function elevPad(jp){
    if (!elv || !jp) return false;
    if (typeof t297EatOverlayPad === 'function' && t297EatOverlayPad(jp)) return true;
    if (jp[0] || jp[2]){ elevAct(); return true; } // A or X — A is also jump; X is safer. Don't block A.
    // use button 2 (X) only for act if we can detect edge... use 2
    return false;
  }
  function elevPadEdge(jp){
    if (!elv || !jp) return false;
    if (typeof t297EatOverlayPad === 'function' && t297EatOverlayPad(jp)) return true;
    if (!elv._x && jp[2]){ elv._x = true; elevAct(); return true; }
    if (!jp[2]) elv._x = false;
    return false;
  }
  function elevStop(){
    if (!elv) return;
    elevClearFloorMeshes();
    (elv.trash || []).forEach(m => { try { scene.remove(m); } catch (e){} });
    elv = null;
    elevHud('', '');
    elevMeter(false);
    const box = document.getElementById('elevBox'); if (box) box.style.display = 'none';
    if (typeof t297OverlayClose === 'function') t297OverlayClose('elevHelp');
    const ob = document.getElementById('obby');
    if (ob) ob.classList.remove('elevmode');
  }

  if (typeof window !== 'undefined') window.elevDebug = {
    floors(){ return ElevRules.ELEV_FLOORS.map(f => f.id); },
    cab(){ if (!elv) return; P.x = 0; P.z = 0; P.y = 0.5; elv.run.phase = 'lobby'; elevRestoreSky(); elevClearFloorMeshes(); },
    floor(id){
      if (!elv) return;
      ElevRules.elevBeginFloor(elv.run, id || 'lanternhall', Math.random);
      elevArrive();
    }
  };
