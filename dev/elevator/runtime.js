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
  function elevSnowNow(){ try { return !!(typeof evFestOn === 'function' && evFestOn()); } catch (e){ return false; } }

  function elevIsGuest(){ return !!(typeof mp !== 'undefined' && mp && mp.on && !mp.host); }
  function elevIsMp(){ return !!(typeof mp !== 'undefined' && mp && mp.on); }

  function elevPaintBoard(){
    if (!elv || !elv.boardMesh) return;
    try {
      const c = document.createElement('canvas'); c.width = 512; c.height = 256;
      const x = c.getContext('2d');
      x.fillStyle = '#fff8ee'; x.fillRect(0,0,512,256);
      x.fillStyle = '#1d2340'; x.font = '900 36px Nunito, system-ui, sans-serif';
      x.textAlign = 'center';
      const st = (elv.run && (elv.run.streak | 0)) || 0;
      const best = (elv.sv && (elv.sv.best | 0)) || 0;
      const bonus = (typeof ElevRules !== 'undefined' && ElevRules.elevStreakBonus) ? ElevRules.elevStreakBonus(st) : 0;
      x.fillText('🛗 Streak  ' + st, 256, 80);
      x.font = '800 28px Nunito, system-ui, sans-serif';
      x.fillText('Best  ' + best + '   ·   Coin bonus +' + bonus, 256, 140);
      x.font = '700 22px Nunito, system-ui, sans-serif';
      x.fillStyle = '#5a6478';
      x.fillText('Ride together. Everyone is okay!', 256, 200);
      const tex = new THREE.CanvasTexture(c);
      tex.needsUpdate = true;
      elv.boardMesh.material = new THREE.MeshBasicMaterial({map: tex, side: THREE.DoubleSide});
    } catch (e){}
  }

  function elevSay(who, text, x, y, z, sec){
    if (!elv) return;
    const label = (who ? who + ': ' : '') + '"' + text + '"';
    const m = elevLab(label, x, y, z);
    if (!m) { banner(label); return; }
    elv.bubbles = (elv.bubbles || []).filter(b => { try { scene.remove(b.mesh); } catch (e){} return false; });
    elv.bubbles.push({mesh:m, t: sec == null ? 3.2 : sec});
  }

  function elevPalKey(seats){
    return (seats || []).map(s => (s && s.id ? s.id : s) + '@' + (+(s && s.x) || 0) + ',' + (+(s && s.z) || 0)).join('|');
  }

  function elevShowPals(){
    if (!elv) return;
    const seats = (typeof ElevRules !== 'undefined' && ElevRules.elevCleanPals) ? ElevRules.elevCleanPals(elv.run && elv.run.pals) : ((elv.run && elv.run.pals) || []);
    const key = elevPalKey(seats);
    if (elv.palKey === key) return;
    elv.palKey = key;
    (elv.pals || []).forEach(p => { try { if (p.mesh) scene.remove(p.mesh); } catch (e){} });
    elv.pals = [];
    elv.pal = null;
    seats.forEach(s => {
      const pal = ElevRules.elevPal(s.id);
      if (!pal) return;
      const mesh = elevMakePal(pal, s.x, s.z);
      elv.pals.push({id: pal.id, pal, mesh, x:s.x, z:s.z});
    });
    if (elv.pals[0]) elv.pal = elv.pals[0].mesh;
  }

  function elevSpawnPals(run){
    if (!elv || !run) return;
    if (!elevIsGuest()){
      if (!run.buddy) run.pals = [];
      else if (!run.pals || !run.pals.length){
        if (typeof ElevRules !== 'undefined' && ElevRules.elevPalsAboard) ElevRules.elevPalsAboard(run, Math.random);
      }
    }
    elevShowPals();
  }

  function elevShowTalk(talk, force){
    if (!elv || !talk || !talk.text) return;
    const seq = talk.seq | 0;
    if (!force && elv.talkSeen === seq && seq) return;
    elv.talkSeen = seq;
    elevSay(talk.who, talk.text, talk.x, talk.y, talk.z, talk.sec);
  }

  function elevTickTalk(dt){
    if (!elv) return;
    (elv.bubbles || []).forEach(b => { b.t -= dt; });
    elv.bubbles = (elv.bubbles || []).filter(b => {
      if (b.t > 0) return true;
      try { scene.remove(b.mesh); } catch (e){}
      return false;
    });
    if (elevIsGuest()){
      if (elv.run && elv.run.talk) elevShowTalk(elv.run.talk);
      return;
    }
    elv.talkT = (elv.talkT || 0) - dt;
    if (elv.talkT > 0) return;
    elv.talkT = 3.4 + Math.random() * 2.2;
    const run = elv.run;
    if (!run || !run.buddy) return;
    const talk = (typeof ElevRules !== 'undefined' && ElevRules.elevHostTalk) ? ElevRules.elevHostTalk(run, Math.random) : null;
    if (talk){
      elevShowTalk(talk, true);
      elevNetSync();
    }
  }

  const elevMuzak = (() => {
    let ac = null, nodes = [], on = false, tHandle = 0;
    const pattern = [0, 4, 7, 4, 9, 7, 4, 0]; // original little bossa-ish hook in C
    function stop(){
      on = false;
      try { clearTimeout(tHandle); } catch (e){}
      nodes.forEach(n => { try { n.stop(); } catch (e){} try { n.disconnect(); } catch (e){} });
      nodes = [];
    }
    function kick(){
      if (on) return;
      try {
        if (typeof muted !== 'undefined' && muted) return;
        ac = ac || new (window.AudioContext || window.webkitAudioContext)();
        if (ac.state === 'suspended') ac.resume();
        if (window.rubloxMusic && rubloxMusic.duck) rubloxMusic.duck();
        on = true;
        const beat = 0.46;
        const playBar = () => {
          if (!on || !ac) return;
          const t0 = ac.currentTime;
          pattern.forEach((st, i) => {
            const o = ac.createOscillator(), g = ac.createGain();
            o.type = 'triangle';
            o.frequency.setValueAtTime(261.63 * Math.pow(2, st/12), t0 + i * beat * 0.5);
            g.gain.setValueAtTime(0.0001, t0 + i * beat * 0.5);
            g.gain.exponentialRampToValueAtTime(0.03, t0 + i * beat * 0.5 + 0.04);
            g.gain.exponentialRampToValueAtTime(0.0001, t0 + (i + 1) * beat * 0.5);
            o.connect(g); g.connect(ac.destination);
            o.start(t0 + i * beat * 0.5); o.stop(t0 + (i + 1) * beat * 0.5 + 0.02);
            nodes.push(o);
          });
          // soft bass
          const b = ac.createOscillator(), bg = ac.createGain();
          b.type = 'sine'; b.frequency.value = 130.81;
          bg.gain.setValueAtTime(0.02, t0); bg.gain.exponentialRampToValueAtTime(0.0001, t0 + beat * 4);
          b.connect(bg); bg.connect(ac.destination); b.start(t0); b.stop(t0 + beat * 4);
          nodes.push(b);
          tHandle = setTimeout(playBar, beat * 4 * 1000);
        };
        playBar();
      } catch (e){ on = false; }
    }
    return {kick, stop, on: () => on};
  })();

  function elevNearShop(){ return !!(elv && elv.shopAt && elevNear(elv.shopAt.x, elv.shopAt.z, 2.2)); }

  function elevPaintShop(){
    const list = document.getElementById('elevShopList');
    if (!list || !elv) return;
    const wallet = elevWallet();
    const items = ElevRules.elevShopList();
    const hats = (elv.sv && elv.sv.hats) || [];
    const pack = (elv.sv && elv.sv.pack) || {};
    const worn = elv.sv && elv.sv.hat;
    list.innerHTML = items.map(it => {
      const have = it.kind === 'hat' ? hats.indexOf(it.id) >= 0 : (pack[it.id] | 0);
      const tag = it.kind === 'hat' ? (it.id === worn ? 'Wearing' : (have ? 'Owned · Wear' : it.cost + ' 🪙')) : ((have ? ('Have ' + have + ' · ') : '') + it.cost + ' 🪙');
      return '<button type="button" class="elevShopIt" data-id="'+it.id+'"><span class="elevIdxE">'+it.emoji+'</span><span class="elevIdxN">'+it.name+'</span><small>'+it.desc+' · '+tag+'</small></button>';
    }).join('');
    const sub = document.getElementById('elevShopSub');
    if (sub) sub.textContent = 'Your coins: ' + wallet + ' 🪙   ·   Streak bonus +' + ElevRules.elevStreakBonus((elv.run && elv.run.streak) || 0);
    list.querySelectorAll('.elevShopIt').forEach(btn => {
      btn.addEventListener('click', ev => { ev.preventDefault(); elevShopBuy(btn.getAttribute('data-id')); });
    });
  }

  function elevWallet(){
    try { if (typeof coins === 'number') return coins; } catch (e){}
    return 0;
  }

  function elevShopBuy(id){
    if (!elv) return;
    const it = ElevRules.elevShopItem(id);
    if (!it) return;
    if (it.kind === 'hat' && elv.sv.hats.indexOf(id) >= 0){
      const r = ElevRules.elevWearHat(elv.sv, elv.sv.hat === id ? '' : id);
      if (r.ok){ elv.sv = r.state; elevPersist(elv.sv); banner(elv.sv.hat ? ('Wearing ' + it.emoji + ' ' + it.name) : 'Hat tucked away.'); elevPaintShop(); }
      return;
    }
    const r = ElevRules.elevBuyItem(elv.sv, elevWallet(), id);
    if (!r.ok){
      banner(r.why === 'coins' ? ('Need ' + r.need + ' more 🪙') : (r.why === 'have' ? 'You already have that hat!' : 'Not now.'));
      return;
    }
    elv.sv = r.state;
    elevPersist(r.state);
    try { setCoins(r.wallet); } catch (e){}
    banner('Bought ' + it.emoji + ' ' + it.name + '  ·  ' + r.spent + ' 🪙');
    elevTone([520, 660], 0.07, 'sine', 0.05);
    elevPaintShop();
  }

  function elevOpenShop(){
    elevPaintShop();
    if (typeof t297OverlayShow === 'function') t297OverlayShow('elevShop', true);
  }

  function elevSyncLessBtn(){
    const b = document.getElementById('elevLessBtn');
    if (!b || !elv || !elv.sv) return;
    const on = !!elv.sv.lessScary;
    b.classList.toggle('on', on);
    b.textContent = on ? '😌 Less scary on' : '😌 Less scary';
    b.title = on ? 'Milder hush and softer lamps. Tap to use the regular strange mood.' : 'The default is a little stranger. Tap for a milder, still kid-safe hush.';
  }

  function elevToggleLess(){
    if (!elv) return;
    elv.sv = ElevRules.elevSetLessScary(elv.sv, !elv.sv.lessScary);
    if (elv.run) elv.run.lessScary = !!elv.sv.lessScary;
    elevPersist(elv.sv);
    elevSyncLessBtn();
    banner(elv.sv.lessScary ? '😌 Less scary is on — same floors, softer hush. Still no gore, and everyone is okay.' : 'The regular strange mood is on. Still kid-safe, still everyone is okay.');
    if (elv.run && elv.run.phase === 'floor' && elv.run.floor) elevApplyLook(ElevRules.elevFloor(elv.run.floor));
  }

  function elevNetSync(){
    if (!elv || elevIsGuest()) return;
    if (!elevIsMp() || typeof mpSend !== 'function') return;
    try { mpSend({t:'elev', a:'sync', snap: ElevRules.elevWire(elv.run)}); } catch (e){}
  }

  function elevFromNet(g, d){
    if (!elv || !d || d.t !== 'elev') return;
    if ((d.a === 'hello' || d.a === 'ding') && !elevIsGuest()){
      if (d.a === 'ding' && elv.run.phase === 'lobby') elevGo(true);
      else elevNetSync();
      return;
    }
    if (d.a !== 'sync' || !d.snap) return;
    if (!elevIsGuest()) return;
    const before = elv.run.phase;
    ElevRules.elevApplyWire(elv.run, d.snap);
    elevShowPals();
    if (elv.run.talk) elevShowTalk(elv.run.talk);
    if (before !== elv.run.phase) elevOnPhase(before, elv.run.phase);
  }
  function elevFromHost(d){ elevFromNet(null, d); }

  function elevOnPhase(before, now){
    if (!elv) return;
    if (now === 'board'){ banner('🚪 Doors closing! Get back in!'); elevTone([440, 330], 0.06, 'square', 0.04); }
    if (now === 'ride'){
      ElevRules.elevCloseDoors(elv.run, elevInCab());
      const pack = ElevRules.elevApplyPack(elv.sv, elv.run);
      elv.sv = pack.state; elv.run = pack.run; elevPersist(elv.sv);
      elevMuzak.kick();
      elevTone([520, 780, 1040], 0.08, 'sine', 0.05);
      banner(elv.run.quote);
      if (elv.run.watching) banner('🛎️ Hang tight in the cab — we will catch the next stop!');
      if (elv.run.event && elv.run.event.id === 'sneeze') elevTone([880, 660, 520], 0.09, 'triangle', 0.05);
      if (elv.run.event && elv.run.event.id === 'stuck') elevTone([180, 140], 0.14, 'sine', 0.05);
      elevShowPals();
    }
    if (before === 'ride' && now === 'floor'){ elevArrive(); elevShowPals(); }
    if (now === 'lobby' || now === 'inter'){ elevMuzak.stop(); elevPaintBoard(); }
    if (now === 'inter') elevReturnToCab(elv.run.quote);
    elevPaintBoard();
  }


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
    const col = pal.col || (pal.id === 'sock' ? '#3a86ff' : pal.id === 'niblet' ? '#ffd23f' : pal.id === 'marm' ? '#ff6fb5' : pal.id === 'taro' ? '#8b5cf6' : '#2ec27e');
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.9, 0.5), elevMat(col));
    body.position.y = 0.55; g.add(body);
    const head = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.45, 0.45), elevMat('#ffe0b0'));
    head.position.y = 1.2; g.add(head);
    g.position.set(x, 0, z);
    scene.add(g); elevKeep(g);
    elevLab((pal.emoji || '') + ' ' + pal.name, x, 1.9, z);
    return g;
  }

  function elevPlat(x, top, z, w, d, color, h){
    const b = plat(x, top, z, w, d, color, h == null ? 1 : h);
    if (b) b.floorOnly = true;
    if (elv && elv.floorSolids) elv.floorSolids.push(b);
    if (b && b.mesh) elevFkeep(b.mesh);
    return b;
  }

  function elevClearFloorMeshes(){
    if (!elv) return;
    (elv.floorSolids || []).forEach(b => {
      try { if (b) b.active = false; } catch (e){}
      try { if (b && b.mesh) scene.remove(b.mesh); } catch (e){}
      try {
        if (typeof solids !== 'undefined' && solids){
          const i = solids.indexOf(b);
          if (i >= 0) solids.splice(i, 1);
        }
      } catch (e){}
    });
    elv.floorSolids = [];
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
    elv.quiz = [];
    elv.stackBase = null;
    elv.drum = null;
    elv.pads = [];
    elv.boss = null;
    elv.bossBell = null;
  }

  function elevRestoreSky(){
    scene.background = new THREE.Color('#b8e0ff');
    if (scene.fog){ scene.fog.color.set('#b8e0ff'); scene.fog.near = 28; scene.fog.far = 90; }
  }

  function elevLessOn(){
    try { return !!(elv && elv.sv && elv.sv.lessScary); } catch (e){ return false; }
  }

  function elevApplyLook(f){
    const sky = (f && f.sky) || '#b8e0ff';
    const less = elevLessOn();
    const creepy = f && (f.kind === 'creepy' || f.secret || f.id === 'jinglejog' || f.id === 'starmap' || f.id === 'sparklerush' || f.id === 'drowsydrake');
    const col = (creepy && less) ? '#3a3450' : sky;
    scene.background = new THREE.Color(col);
    if (scene.fog){
      scene.fog.color.set(col);
      scene.fog.near = creepy ? (less ? 14 : 8) : 22;
      scene.fog.far = creepy ? (less ? 48 : 36) : 90;
    }
    if (elv && elv.cabLight){
      elv.cabLight.intensity = (creepy && !less) ? 0.7 : 1.2;
    }
  }

  function elevBuildRoom(col, w, d, wall){
    wall = wall || '#d8d0c4';
    const z = (typeof ElevRules !== 'undefined' && ElevRules.ELEV_ROOM_Z) || -30;
    const top = (typeof ElevRules !== 'undefined' && ElevRules.ELEV_FLOOR_TOP) || 0.2;
    const cabZ = (typeof ElevRules !== 'undefined' && ElevRules.ELEV_CAB_Z) || -3.2;
    elevMesh(new THREE.BoxGeometry(w, 0.2, d), col, 0, top / 2, z, true);
    elevMesh(new THREE.BoxGeometry(w, 6, 0.3), wall, 0, 3, z - d/2, true);
    elevMesh(new THREE.BoxGeometry(0.3, 6, d), wall, -w/2, 3, z, true);
    elevMesh(new THREE.BoxGeometry(0.3, 6, d), wall, w/2, 3, z, true);
    elevPlat(0, top, z, w, d, col, top);
    const front = z + d / 2;
    if (front < cabZ - 0.05){
      const hz = (front + cabZ) / 2;
      const hd = (cabZ - front) + 0.6;
      const hw = (typeof ElevRules !== 'undefined' && ElevRules.ELEV_HALL_W) || 7.2;
      elevPlat(0, top, hz, hw, hd, col, top);
      elevMesh(new THREE.BoxGeometry(hw, top, hd), col, 0, top / 2, hz, true);
    }
    if (elv) elv.room = {x:0, z, w, d, top};
  }
  function elevDoorPad(x, z, label){
    const m = elevMesh(new THREE.BoxGeometry(2.2, 0.15, 2.2), '#ffd23f', x, 0.28, z, true, {emissive:'#7a5a00'});
    elv.door = {x, z, mesh:m};
    elevLab(label || '🚪 Door', x, 1.6, z, true);
    return m;
  }

  function elevObbyPads(f){
    const known = {
      pillowpath: [[0,-22,0],[2.2,-18,0.5],[-2,-14,1],[2,-10,1.5],[-1.4,-6,2],[0,-2,2.4]],
      jellyhills: [[0,-20,0],[3,-16,0.8],[-3,-12,1.4],[0,-8,2],[2.5,-4,2.6]],
      cloudsteps: [[0,-20,0],[-2.4,-16,0.7],[2.2,-12,1.4],[0,-8,2.1],[2.4,-4,2.8]],
      cheeseramps: [[0,-20,0],[2.6,-16,0.6],[-2.2,-12,1.2],[2,-8,1.9],[0,-4,2.6]],
      booknooks: [[-2,-20,0],[1.5,-16,0.7],[-1.8,-11,1.5],[2.2,-7,2.2],[0,-3,2.9]],
      mittenmaze: [[0,-20,0],[-3,-16,0.4],[3,-12,0.9],[-2,-8,1.5],[2.4,-4,2.2]],
      scarfprint: [[0,-20,0],[0,-14,0],[0,-8,0],[0,-3,0]],
      jinglejog: [[0,-20,0],[2,-14,0],[-2,-8,0],[0,-3,0]],
      skyterrace: [[-3,-18,0],[0,-12,0.4],[3,-8,0.8],[0,-3,1.1]]
    };
    return known[f.id] || [[0,-20,0],[2.4,-15,0.7],[-2.2,-10,1.4],[1.6,-5,2.1]];
  }

  function elevBuildObby(f){
    const deep = (f.kind === 'race' || f.id === 'skyterrace') ? 22 : 28;
    elevBuildRoom(f.floor || '#efe7ff', 16, deep, f.wall);
    elevObbyPads(f).forEach(p => {
      const y = 0.4 + (p[2] || 0);
      const shape = (f.id === 'jellyhills' || f.id === 'cloudsteps') ? new THREE.SphereGeometry(1.2, 8, 6) : new THREE.BoxGeometry(2.4, 0.5, 2.0);
      elevMesh(shape, f.accent || '#ffd0e8', p[0], y, -30 + p[1] + 14, true);
      elevPlat(p[0], y + 0.25, -30 + p[1] + 14, 2.4, 2.0, f.accent || '#ffd0e8', 0.5);
    });
    if (f.kind === 'holiday'){
      for (let i = 0; i < 5; i++) elevMesh(new THREE.SphereGeometry(0.35, 8, 6), '#fff', (i-2)*2.4, 0.5, -22, true);
    }
    elevDoorPad(0, -40, f.kind === 'race' ? '🏁 Finish' : '🚪 Door');
  }

  function elevBuildFind(f){
    elevBuildRoom(f.floor || '#dce8ff', 18, 18, f.wall);
    const spots = [[-5,-26],[4,-24],[0,-34],[-4,-32],[5,-33]];
    const realAt = 2;
    spots.forEach((s, i) => {
      const real = i === realAt;
      const col = real ? (f.accent || '#3a86ff') : '#cfc8ba';
      const m = elevMesh(new THREE.BoxGeometry(0.7, 0.35, 0.9), col, s[0], 0.4, s[1], true, real ? {emissive: f.accent || '#3a86ff'} : null);
      elv.pickups.push({mesh:m, x:s[0], z:s[1], item: real ? (f.item || 'item') : 'decoy'});
    });
    elv.turnIn = {x:0, z:-22};
    const drop = f.item === 'sock' ? '🧦 Basket' : f.item === 'lunch' ? '🐥 Picnic' : f.item === 'star' ? '⭐ Map' : f.item === 'cup' ? '🍵 Saucer' : f.item === 'charm' ? '🕳️ Well' : f.item === 'door' ? '🚪 Real door' : f.item === 'spoon' ? '🍵 Saucer' : '🧺 Drop-off';
    elevLab(drop, 0, 1.6, -22, true);
  }

  function elevBuildHazards(f){
    elevBuildRoom(f.floor || '#ffe6d6', 16, 16, f.wall);
    const kind = f.haz || 'pie';
    const n = kind === 'confetti' ? 8 : (kind === 'flake' ? 7 : 5);
    for (let i = 0; i < n; i++){
      let geo, col, y = 1.1;
      if (kind === 'soap' || kind === 'foam'){ geo = new THREE.BoxGeometry(1.6, 0.3, 0.9); col = f.accent; y = 0.4; }
      else if (kind === 'balloon'){ geo = new THREE.SphereGeometry(0.6, 8, 6); col = i%2 ? '#ff6fb5' : '#3a86ff'; }
      else if (kind === 'confetti'){ geo = new THREE.BoxGeometry(0.4, 0.4, 0.4); col = ['#ff4d5e','#ffd23f','#2ec27e','#3a86ff'][i%4]; }
      else if (kind === 'peek' || kind === 'wink'){ geo = new THREE.BoxGeometry(1.2, 2.2, 0.4); col = '#0b0a10'; y = 1.2; }
      else { geo = new THREE.SphereGeometry(0.45, 8, 6); col = f.accent || '#e07a3f'; }
      const m = elevMesh(geo, col, (i-2)*2, y, -28, true);
      elv.hazards.push({mesh:m, kind, i, speed: 2.2 + i * 0.3});
    }
    if (kind === 'confetti') elevMesh(new THREE.CylinderGeometry(0.6, 0.8, 1.4, 8), '#1d2340', 0, 0.8, -22, true);
    if (kind !== 'confetti') elevDoorPad(0, -38);
  }

  function elevBuildSeq(f){
    elevBuildRoom(f.floor || '#efe7ff', 16, 14, f.wall);
    const cols = ['#ff4d5e','#ffd23f','#3a86ff','#2ec27e'];
    const n = (f.seq != null) ? f.seq : 3;
    const span = 8;
    for (let i = 0; i < n; i++){
      const x = -span/2 + (n === 1 ? span/2 : i * (span/(n-1)));
      const g = (f.id === 'echoeggs') ? new THREE.SphereGeometry(0.55, 10, 8) : (f.id === 'goldengong' ? new THREE.CylinderGeometry(0.9, 0.9, 0.16, 16) : new THREE.SphereGeometry(0.55, 10, 8, 0, Math.PI*2, 0, Math.PI*0.7));
      const m = elevMesh(g, cols[i%cols.length], x, 1.1, -30, true, {emissive: cols[i%cols.length]});
      elv.bells.push({mesh:m, x, z:-30, i});
      elevLab((f.id === 'echoeggs' ? '🥚 ' : f.id === 'goldengong' ? '🥇 ' : '🔔 ') + (i+1), x, 2.1, -30, true);
    }
  }

  function elevBuildPaint(f){
    elevBuildRoom(f.floor || '#fff4e0', 16, 14, f.wall);
    const n = f.paints || 3;
    for (let i = 0; i < n; i++){
      const x = -4 + i * (8 / Math.max(1, n-1));
      const m = elevMesh(new THREE.BoxGeometry(1.6, 1.8, 0.12), '#f4f0e8', x, 1.3, -32, true);
      elv.paints.push({mesh:m, x, z:-32, i, done:false});
      elevLab(f.id === 'honkfloor' ? '📯' : f.id === 'mustachewall' ? '🖼️' : '🙂', x, 2.5, -32, true);
    }
  }

  function elevBuildLit(f){
    elevBuildRoom(f.floor || '#1a1630', 16, 20, f.wall);
    const disc = elevMesh(new THREE.CylinderGeometry(2.2, 2.2, 0.08, 16), f.accent || '#ffe566', 0, 0.25, -24, true, {emissive:'#7a5a00'});
    elv.lightDisc = disc;
    const lamp = elevMesh(new THREE.CylinderGeometry(0.3, 0.3, 1.6, 8), f.accent || '#ffd23f', 0, 1.0, -38, true, {emissive:'#7a5a00'});
    elv.door = {x:0, z:-38, mesh:lamp};
    elevLab('🕯️ Lamp', 0, 2.4, -38, true);
  }

  function elevBuildTiles(f){
    elevBuildRoom(f.floor || '#e8ffe9', 14, 14, f.wall);
    for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++){
      const grumpy = (i + j) % 3 === 0;
      const x = -4.5 + i * 3, z = -24 - j * 3;
      const m = elevMesh(new THREE.BoxGeometry(2.6, 0.12, 2.6), grumpy ? '#8b5cf6' : (f.accent || '#ffd23f'), x, 0.26, z, true);
      elv.tiles.push({mesh:m, x, z, grumpy});
    }
    elevDoorPad(0, -38);
  }

  function elevBuildShop(f){
    elevBuildRoom(f.floor || '#ffe8cc', 14, 14, f.wall);
    elevMesh(new THREE.BoxGeometry(4.2, 1.4, 1.4), f.accent || '#c45c1a', 0, 0.8, -32, true);
    elevMesh(new THREE.CylinderGeometry(0.3, 0.3, 0.2, 10), f.accent || '#c45c1a', 0, 1.6, -32, true);
    elv.turnIn = {x:0, z:-32, shop:true};
    elevLab(f.id === 'cocoanook' ? '☕ Lucky cocoa — 8 🪙' : '🍪 Lucky cookie — 8 🪙', 0, 2.4, -32, true);
    elevDoorPad(0, -38);
  }

  function elevBuildQuiz(f){
    elevBuildRoom(f.floor || '#e8f0ff', 16, 16, f.wall);
    const q = elv.run && elv.run.quiz;
    elevLab('❓ ' + (q && q.q ? q.q : 'Quiz!'), 0, 3.2, -24, true);
    (q && q.a ? q.a : ['A','B','C']).forEach((ans, i) => {
      const x = -5 + i * 5;
      const m = elevMesh(new THREE.BoxGeometry(3.2, 1.6, 0.2), '#fff', x, 1.2, -32, true);
      elv.quiz.push({mesh:m, x, z:-32, i});
      elevLab((i+1) + '. ' + ans, x, 2.4, -32, true);
    });
  }

  function elevBuildStack(f){
    elevBuildRoom(f.floor || '#e8f8d8', 14, 14, f.wall);
    const base = elevMesh(new THREE.BoxGeometry(2.2, 0.3, 2.2), f.accent || '#7cbf3a', 0, 0.35, -30, true);
    elv.stackBase = {mesh:base, x:0, z:-30};
    elv.turnIn = {x:0, z:-30, stack:true};
    elevLab(f.id === 'cupstack' ? '🥤 Stack here' : '🧱 Stack here', 0, 2.0, -30, true);
  }

  function elevBuildRhythm(f){
    elevBuildRoom(f.floor || '#f8e0c8', 14, 14, f.wall);
    const drum = elevMesh(new THREE.CylinderGeometry(1.3, 1.3, 0.7, 16), f.accent || '#c45c1a', 0, 0.55, -30, true, {emissive:'#4a2000'});
    elv.drum = {mesh:drum, x:0, z:-30};
    elv.turnIn = {x:0, z:-30, rhythm:true};
    elevLab(f.id === 'xylobop' ? '🎶 Tap the glow' : '🥁 Tap the glow', 0, 2.0, -30, true);
  }

  function elevBuildCoop(f){
    elevBuildRoom(f.floor || '#e8e4ff', 16, 16, f.wall);
    [-4, 4].forEach((x, i) => {
      const m = elevMesh(new THREE.CylinderGeometry(1.3, 1.3, 0.16, 16), f.accent || '#7c5cff', x, 0.28, -30, true, {emissive: f.accent || '#7c5cff'});
      elv.pads.push({mesh:m, x, z:-30, i, on:false});
      elevLab(i === 0 ? '⭐ Pad A' : '⭐ Pad B', x, 1.6, -30, true);
    });
    elevDoorPad(0, -38);
  }

  function elevBuildBoss(f){
    elevBuildRoom(f.floor || '#efe0ff', 18, 20, f.wall);
    const body = elevMesh(new THREE.SphereGeometry(1.8, 10, 8), f.accent || '#8b5cf6', 0, 2.0, -34, true);
    const hat = elevMesh(new THREE.CylinderGeometry(0.5, 0.6, 0.5, 8), '#ffd23f', 0, 3.8, -34, true, {emissive:'#7a5a00'});
    elv.boss = {mesh:body, hat, x:0, z:-34};
    elv.hazards.push({mesh:body, kind:'boss', i:0, speed: 1.6});
    const bell = elevMesh(new THREE.SphereGeometry(0.4, 8, 6), '#ffd23f', 0, 4.3, -34, true, {emissive:'#7a5a00'});
    elv.bossBell = {mesh:bell, x:0, z:-34};
    elevLab(f.id === 'drowsydrake' ? '🐲 Bedtime bell' : '🛡️ Hat bell', 0, 5.2, -34, true);
  }

  function elevBuildFloor(id){
    elevClearFloorMeshes();
    const f = ElevRules.elevFloor(id);
    if (!f) return;
    elevApplyLook(f);
    const clear = ElevRules.elevClearMode(f);
    if (f.tiles) elevBuildTiles(f);
    else if (clear === 'door') elevBuildObby(f);
    else if (clear === 'find') elevBuildFind(f);
    else if (clear === 'timer') elevBuildHazards(f);
    else if (clear === 'seq') elevBuildSeq(f);
    else if (clear === 'paint') elevBuildPaint(f);
    else if (clear === 'lit') elevBuildLit(f);
    else if (clear === 'shop') elevBuildShop(f);
    else if (clear === 'quiz') elevBuildQuiz(f);
    else if (clear === 'stack') elevBuildStack(f);
    else if (clear === 'rhythm') elevBuildRhythm(f);
    else if (clear === 'coop') elevBuildCoop(f);
    else if (clear === 'boss') elevBuildBoss(f);
    else elevBuildObby(f);
    if (f.kind === 'creepy' || f.secret) elevBuildCreepyDecor(f);
  }

  function elevBuildCreepyDecor(f){
    const less = elevLessOn();
    const n = less ? 3 : 6;
    for (let i = 0; i < n; i++){
      const x = (i - (n-1)/2) * 2.2;
      const col = less ? '#6a6080' : '#2a2438';
      elevMesh(new THREE.BoxGeometry(0.4, less ? 1.6 : 2.6, 0.4), col, x, less ? 0.9 : 1.4, -36 + (i % 3), true);
    }
    if (!less){
      const lamp = elevMesh(new THREE.SphereGeometry(0.2, 8, 6), '#ffe8a0', 0, 3.6, -30, true, {emissive:'#7a5a00'});
      if (elv) elv.flicker = lamp;
    }
  }

  function buildElevator(){
    const sv = elevState();
    const started = ElevRules.elevStartRun(sv, Date.now(), !!(typeof mp !== 'undefined' && mp && mp.on));
    started.run.snow = elevSnowNow();
    started.run.lessScary = !!started.state.lessScary;
    elevPersist(started.state);
    elv = {trash:[], floorTrash:[], floorSolids:[], sv: started.state, run: started.run, hazards:[], pickups:[], bells:[], paints:[], tiles:[], door:null, host:null, pal:null, pals:[], doors:[], near:null, quiz:[], pads:[], bubbles:[], shopAt:{x:10,z:16}};
    elevRestoreSky();
    const CW = (ElevRules && ElevRules.ELEV_CAB_W) || 10;
    const CD = (ElevRules && ElevRules.ELEV_CAB_D) || 10;
    const CZ = (ElevRules && ElevRules.ELEV_CAB_Z) || -5;
    plat(0, 0, 10, 36, 36, '#c8bea8', 0.2);
    plat(0, 0, 16, 22, 16, '#d9d4c8', 0.08);
    // waiting-room seats
    plat(-9, 0.45, 18, 4.2, 1.6, '#c45c1a', 0.45);
    plat(9, 0.45, 20, 4.2, 1.6, '#c45c1a', 0.45);
    elevMesh(new THREE.BoxGeometry(4.2, 0.16, 1.6), '#e07a3f', -9, 0.55, 18, false);
    elevMesh(new THREE.BoxGeometry(4.2, 0.16, 1.6), '#e07a3f', 9, 0.55, 20, false);
    elevLab('🪑 Have a sit', -9, 1.5, 18);
    elevLab('🪑 Waiting seats', 9, 1.5, 20);
    // streak board on the back wall
    elevMesh(new THREE.BoxGeometry(7.2, 3.2, 0.2), '#1d2340', 0, 3.2, 24, false);
    elv.boardMesh = elevMesh(new THREE.BoxGeometry(6.6, 2.6, 0.08), '#fff8ee', 0, 3.2, 23.85, false);
    elevPaintBoard();
    // shop kiosk
    plat(10, 0.9, 16, 3.2, 2.2, '#c45c1a', 0.9);
    elevMesh(new THREE.BoxGeometry(3.2, 1.6, 2.2), '#e07a3f', 10, 1.6, 16, false);
    elevMesh(new THREE.CylinderGeometry(0.4, 0.4, 0.2, 10), '#ffd23f', 10, 2.5, 16, false, {emissive:'#7a5a00'});
    elevLab('🛒 Lobby Shop', 10, 3.1, 16);
    elv.shopAt = {x:10, z:16};
    elevLab('🛗 Wobblevator Lobby', 0, 3.4, 22);
    // big shared cab
    plat(0, 0.05, 0, CW, CD, '#c9a24a', 0.08);
    elevMesh(new THREE.BoxGeometry(CW, 0.9, 0.2), '#efe6d4', 0, 4.55, CD/2, false);
    elevMesh(new THREE.BoxGeometry(0.2, 4.8, CD), '#efe6d4', -CW/2, 2.5, 0, false);
    elevMesh(new THREE.BoxGeometry(0.2, 4.8, CD), '#efe6d4', CW/2, 2.5, 0, false);
    elevMesh(new THREE.BoxGeometry(CW, 0.2, CD), '#fff8ee', 0, 4.95, 0, false);
    const dL = elevMesh(new THREE.BoxGeometry(3.4, 3.6, 0.16), '#d4a017', -1.75, 1.9, CZ, false);
    const dR = elevMesh(new THREE.BoxGeometry(3.4, 3.6, 0.16), '#d4a017', 1.75, 1.9, CZ, false);
    elv.doors = [dL, dR];
    elevMesh(new THREE.BoxGeometry(1.5, 4.8, 0.2), '#efe6d4', -CW/2 + 0.8, 2.5, CD/2, false);
    elevMesh(new THREE.BoxGeometry(1.5, 4.8, 0.2), '#efe6d4', CW/2 - 0.8, 2.5, CD/2, false);
    elevLab('🛎️ Board here — room for a whole group!', 0, 3.5, CD/2 - 0.2);
    // floor-number dial
    elv.dial = elevMesh(new THREE.CylinderGeometry(0.7, 0.7, 0.16, 16), '#1d2340', 0, 3.7, CZ + 0.2, false, {emissive:'#1d2340'});
    elv.dialLab = elevLab('🛎️ 0', 0, 4.2, CZ + 0.4);
    elv.host = elevMakeBingle(3.2, 0.2, -1.4);
    elevLab('🛎️ Bingle', 3.2, 2.1, -1.4);
    elevSpawnPals(started.run);
    const amb = new THREE.AmbientLight(0xfff4e8, 0.55);
    scene.add(amb); elevKeep(amb);
    const cabLight = new THREE.PointLight(0xfff2d0, 1.2, 42);
    cabLight.position.set(0, 4.4, 0);
    scene.add(cabLight); elevKeep(cabLight);
    elv.cabLight = cabLight;
    const hallLight = new THREE.PointLight(0xffe8c8, 0.7, 48);
    hallLight.position.set(0, 5, -28);
    scene.add(hallLight); elevKeep(hallLight);
    elv.lobbySpawn = {x:0, y:0.5, z:16};
    checkpoints[0] = {idx:0, spawn:{x:0, y:0.5, z:16}, flag:new THREE.Object3D()};
    if (typeof P !== 'undefined'){ P.x = 0; P.y = 0.5; P.z = 16; P.vx = 0; P.vy = 0; P.vz = 0; P.onGround = false; P.ground = null; }
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

  function elevCabHalf(){
    return ((typeof ElevRules !== 'undefined' && ElevRules.ELEV_CAB_W) || 10) / 2 - 0.4;
  }
  function elevInCab(){ const h = elevCabHalf(); return Math.abs(P.x) < h && Math.abs(P.z) < h; }
  function elevSetDoors(open){
    if (!elv || !elv.doors) return;
    const closed = 1.75, opened = 3.6;
    elv.doors[0].position.x += ((open ? -opened : -closed) - elv.doors[0].position.x) * 0.18;
    elv.doors[1].position.x += ((open ? opened : closed) - elv.doors[1].position.x) * 0.18;
  }

  function elevBindOverlay(id, xId){
    const el = document.getElementById(id);
    if (!el || el.__elevOv) return;
    el.__elevOv = true;
    el.addEventListener('click', ev => { if (ev.target === el && typeof t297OverlayClose === 'function') t297OverlayClose(id); });
    const x = document.getElementById(xId);
    if (x) x.addEventListener('click', ev => { ev.preventDefault(); ev.stopPropagation(); if (typeof t297OverlayClose === 'function') t297OverlayClose(id); });
  }

  function elevPaintIndex(){
    const list = document.getElementById('elevIndexList');
    const sub = document.getElementById('elevIndexSub');
    if (!list) return;
    const rows = ElevRules.elevIndexRows(elv ? elv.sv : elevState(), {snow: elevSnowNow()});
    const seen = rows.filter(r => r.seen).length;
    if (sub) sub.textContent = 'Floors seen: ' + seen + ' / ' + rows.length;
    list.innerHTML = rows.map(r => {
      const cls = r.seen ? 'seen' : (r.locked ? 'locked' : 'new');
      const tag = r.seen ? 'Seen' : (r.locked ? 'Snow Festival' : (r.secret ? 'Secret' : 'Not yet'));
      return '<div class="elevIdx ' + cls + '"><span class="elevIdxE">' + r.emoji + '</span><span class="elevIdxN">' + r.name + '</span><small>' + tag + '</small></div>';
    }).join('');
  }

  function elevOpenHelp(){ if (typeof t297OverlayShow === 'function') t297OverlayShow('elevHelp', true); }
  function elevOpenIndex(){
    elevPaintIndex();
    if (typeof t297OverlayShow === 'function') t297OverlayShow('elevIndex', true);
  }

  function elevEnter(){
    if (!elv) return;
    cam.pitch = 0.28; cam.dist = 12;
    try { if (typeof achNote === 'function') achNote('play:elevator'); } catch (e){}
    elevAch('elev-ride');
    cam.dist = 14;
    banner('🛎️ Wobblevator! Sit in the lobby, peek at the shop, then walk into the big lift and press E / Ⓧ. Friends ride together. If a floor gets too wobbly, everyone is okay!');
    elevHud('Walk into the elevator, then press E / Ⓧ to ride. Shop is by the kiosk. Open Help or Floors anytime.', '🛗 Ride');
    elevBindOverlay('elevHelp', 'elevHelpX');
    elevBindOverlay('elevIndex', 'elevIndexX');
    elevBindOverlay('elevShop', 'elevShopX');
    elevSyncLessBtn();
    elevPaintBoard();
    try { if (elevIsGuest() && typeof mpSend === 'function') mpSend({t:'elev', a:'hello'}); } catch (e){}
    const sb = document.getElementById('elevShopBtn');
    if (sb && !sb.__elev){ sb.__elev = true; sb.addEventListener('click', ev => { ev.preventDefault(); elevOpenShop(); }); }
    const lb = document.getElementById('elevLessBtn');
    if (lb && !lb.__elev){ lb.__elev = true; lb.addEventListener('click', ev => { ev.preventDefault(); elevToggleLess(); }); }
    const hb = document.getElementById('elevHelpBtn');
    if (hb && !hb.__elev){ hb.__elev = true; hb.addEventListener('click', ev => { ev.preventDefault(); elevOpenHelp(); }); }
    const ib = document.getElementById('elevIndexBtn');
    if (ib && !ib.__elev){ ib.__elev = true; ib.addEventListener('click', ev => { ev.preventDefault(); elevOpenIndex(); }); }
    const ab = document.getElementById('elevAct');
    if (ab && !ab.__elev){ ab.__elev = true; ab.addEventListener('click', ev => { ev.preventDefault(); elevAct(); }); }
    if (typeof t297BindOverlays === 'function'){
      try { window.__t297OvBound = false; t297BindOverlays(); } catch (e){}
    }
  }

  function elevGo(fromNet){
    if (!elv) return;
    if (elv.run.phase !== 'lobby' && elv.run.phase !== 'inter') return;
    if (elevIsGuest() && !fromNet){
      try { if (typeof mpSend === 'function') mpSend({t:'elev', a:'ding'}); } catch (e){}
      banner('🛎️ Ringing Bingle — get in the cab while the host closes the doors!');
      return;
    }
    if (!elevInCab() && !fromNet){ banner('Step all the way into the lift first!'); return; }
    elv.run.snow = elevSnowNow();
    ElevRules.elevBeginBoard(elv.run);
    elevTone([440, 330, 440], 0.06, 'square', 0.04);
    banner(elv.run.quote);
    elevNetSync();
  }

  function elevPlacePlayer(s){
    if (!s || typeof P === 'undefined') return;
    P.x = s.x; P.y = s.y; P.z = s.z;
    P.vx = 0; P.vy = 0; P.vz = 0;
    P.onGround = false; P.ground = null;
    try { if (typeof cam !== 'undefined' && cam) cam.yaw = 0; } catch (e){}
  }

  function elevCatchFall(){
    if (!elv || !elv.run || elv.run.phase !== 'floor' || !elv.floorStart) return false;
    if (!(P.y < -1)) return false;
    elevPlacePlayer(elv.floorStart);
    try { banner('🫧 Whoops! Bingle scooped you back onto the floor. Everyone is okay!'); } catch (e){}
    return true;
  }

  function elevArrive(){
    if (!elv) return;
    const id = elv.run.floor;
    elevBuildFloor(id);
    elevMuzak.stop();
    const spawn = (typeof ElevRules !== 'undefined' && ElevRules.elevSpawnOf) ? ElevRules.elevSpawnOf(id) : {x:0, y:0.5, z:-30, top:0.2};
    elv.floorStart = {x:spawn.x, y:spawn.y, z:spawn.z, top:spawn.top};
    if (elv.run.watching){
      if (elv.lobbySpawn && typeof checkpoints !== 'undefined' && checkpoints[0]) checkpoints[0].spawn = {x:0, y:0.5, z:0};
      banner('🛎️ Hang tight in the cab — we will catch the next stop together!');
      elevTone([330], 0.06, 'triangle', 0.04);
      return;
    }
    if (typeof checkpoints !== 'undefined' && checkpoints[0]) checkpoints[0].spawn = {x:spawn.x, y:spawn.y, z:spawn.z};
    elevPlacePlayer(elv.floorStart);
    elevTone([330, 440], 0.07, 'triangle', 0.05);
    banner(elv.run.quote);
    if (ElevRules.elevClearMode(ElevRules.elevFloor(id)) === 'seq' && elv.run.seq && elv.run.seq.length){
      const names = ['first', 'second', 'third', 'fourth'];
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
    const cab = {x:0, y:0.5, z:0};
    elv.floorStart = null;
    if (elv.lobbySpawn && typeof checkpoints !== 'undefined' && checkpoints[0]) checkpoints[0].spawn = {x:elv.lobbySpawn.x, y:elv.lobbySpawn.y, z:elv.lobbySpawn.z};
    elevPlacePlayer(cab);
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
    ElevRules.elevBadges(r.state, r.run).forEach(id => elevAch(id));
    elevTone([180, 90], 0.12, 'triangle', 0.06);
    elevReturnToCab(r.run.quote);
  }

  function elevOnBeat(){
    if (!elv) return false;
    const t = (elv.run.beatT || 0) % 1;
    return t < 0.28 || t > 0.86;
  }

  function elevAct(){
    if (!elv) return false;
    if (typeof t297OverlayOpen === 'function' && t297OverlayOpen()) return true;
    const run = elv.run;
    if (run.phase === 'lobby' || run.phase === 'inter' || run.phase === 'board'){
      if (elevNearShop()){ elevOpenShop(); return true; }
      if (run.phase !== 'board') elevGo();
      return true;
    }
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
    if (elv.quiz && elv.quiz.length){
      const q = elv.quiz.find(o => elevNear(o.x, o.z, 1.8));
      if (q){
        const r = ElevRules.elevQuiz(run, q.i);
        elevTone(r.ok ? [640, 800] : [160], 0.08, 'sine', 0.06);
        if (r.ok){ if (run.wantClear) elevDoClear(); }
        else banner('Not that one — try another answer!');
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
          banner('Lucky treat! The next floor pays a little extra.');
          elevTone([700, 880], 0.08, 'sine', 0.05);
        } else if (r.why === 'coins') banner('Need ' + r.need + ' more coins for a lucky treat.');
        else if (r.why === 'have') banner('You already grabbed a treat this stop.');
        return true;
      }
      if (elv.turnIn.stack){
        const r = ElevRules.elevStack(run);
        if (r.ok){
          const y = 0.55 + r.stacked * 0.38;
          elevMesh(new THREE.BoxGeometry(1.2, 0.36, 1.2), '#fff4d8', 0, y, -30, true);
          elevTone([500 + r.stacked * 60], 0.06, 'sine', 0.05);
          if (run.wantClear) elevDoClear();
        }
        return true;
      }
      if (elv.turnIn.rhythm){
        const r = ElevRules.elevBeat(run, elevOnBeat());
        elevTone(r.ok ? [720, 880] : [180], 0.06, 'sine', 0.06);
        if (run.wantClear) elevDoClear();
        if (run.wantFail) elevDoFail();
        return true;
      }
      if (run.holding){
        ElevRules.elevTurnIn(run);
        if (run.wantClear) elevDoClear();
        return true;
      }
    }
    if (elv.pads && elv.pads.length){
      const p = elv.pads.find(o => elevNear(o.x, o.z, 1.6));
      if (p){
        ElevRules.elevPadStand(run, p.i, true);
        p.mesh.material.color.set('#ffd23f');
        elevTone([600], 0.06, 'sine', 0.05);
        if (run.wantClear) elevDoClear();
        return true;
      }
    }
    if (elv.bossBell && run.bossTag && elevNear(elv.bossBell.x, elv.bossBell.z, 2.2)){
      ElevRules.elevTagBoss(run);
      if (run.wantClear) elevDoClear();
      return true;
    }
    return false;
  }

  function elevUpdate(dt){
    if (!elv) return;
    dt = Math.max(0, Math.min(0.12, +dt || 0));
    const run = elv.run;
    const before = run.phase;
    if (!elevIsGuest()) ElevRules.elevTick(run, dt);
    else run.t = Math.max(0, (run.t || 0) - dt);
    if (before !== run.phase){
      elevOnPhase(before, run.phase);
      if (!elevIsGuest()) elevNetSync();
    }
    if (run.phase === 'floor' && P.y < -1 && !run.watching) elevCatchFall();
    if (run.wantClear) elevDoClear();
    else if (run.wantFail) elevDoFail();

    elevSetDoors(run.phase === 'lobby' || run.phase === 'floor' || run.phase === 'inter' || run.phase === 'board');
    const wob = (run.phase === 'ride' && run.event && run.event.id === 'wobble') ? 16 : (run.phase === 'ride' ? 8 : 6);
    if (elv.host) elv.host.rotation.y = Math.sin(time * 2) * 0.3;
    if (elv.host) elv.host.position.y = 0.2 + Math.sin(time * wob) * (run.phase === 'ride' ? 0.14 : 0.04);
    const stuck = !!(run.phase === 'ride' && run.event && run.event.id === 'stuck' && (ElevRules.ELEV_RIDE - (run.t || 0)) < 1.25);
    if (run.phase === 'ride'){
      try { if (typeof cam !== 'undefined' && cam) cam.shake = stuck ? 0 : Math.sin(time * wob) * (run.event && run.event.id === 'wobble' ? 0.08 : (run.event && run.event.id === 'sneeze' ? 0.06 : 0.03)); } catch (e){}
      if (elv.dial && !stuck) elv.dial.rotation.y += dt * 3;
      const n = 1 + ((run.survived | 0) % 99);
      if (elv.dialN !== n){
        elv.dialN = n;
        try { if (elv.dialLab) scene.remove(elv.dialLab); } catch (e){}
        const cz = (typeof ElevRules !== 'undefined' && ElevRules.ELEV_CAB_Z) || -5;
        elv.dialLab = elevLab('🛎️ ' + n, 0, 4.2, cz + 0.4);
      }
    }
    if (!elevIsGuest()){
      elv.syncT = (elv.syncT || 0) - dt;
      if (elv.syncT <= 0){ elv.syncT = 0.45; elevNetSync(); }
    }
    if (elv.cabLight && run.phase === 'ride' && run.event && run.event.id === 'flicker'){
      elv.cabLight.intensity = 0.45 + Math.abs(Math.sin(time * 22)) * 1.1;
    } else if (elv.cabLight && run.phase === 'floor' && elv.flicker && !elevLessOn()){
      elv.cabLight.intensity = 0.7 + Math.abs(Math.sin(time * 8)) * 0.4;
    } else if (elv.cabLight && run.phase !== 'floor'){
      elv.cabLight.intensity = 1.2;
    }
    elevTickTalk(dt);
    if (run.phase === 'lobby' || run.phase === 'inter') elevPaintBoard();

    const f = ElevRules.elevFloor(run.floor);
    const maxT = run.phase === 'floor' && f ? (f.seconds + 5) : (run.phase === 'ride' ? ElevRules.ELEV_RIDE : (run.phase === 'board' ? ElevRules.ELEV_BOARD : ElevRules.ELEV_INTER));
    const seenN = (elv.sv && elv.sv.seen && elv.sv.seen.length) || 0;
    const bonus = ElevRules.elevStreakBonus(run.streak || 0);
    const lab = '🛗 ' + (run.survived || 0) + ' floors  ·  streak ' + (run.streak || 0) + ' (+' + bonus + '🪙)  ·  best ' + (elv.sv.best || 0) + '  ·  seen ' + seenN + (run.phase === 'floor' && f ? ('  ·  ' + f.emoji + ' ' + f.name + '  ·  ' + Math.ceil(run.t) + 's') : (run.phase === 'ride' ? '  ·  riding…' : (run.phase === 'board' ? ('  ·  doors ' + Math.ceil(run.t) + 's') : '')));
    elevMeter(true, (run.phase === 'floor' || run.phase === 'ride' || run.phase === 'board') ? run.t : 1, lab, maxT);

    if (run.phase === 'floor'){
      (elv.hazards || []).forEach(h => {
        if (!h.mesh) return;
        const t = time * h.speed;
        if (h.kind === 'soap' || h.kind === 'foam') h.mesh.position.set(Math.sin(t + h.i) * 5, 0.4, -30 + Math.cos(t * 0.7 + h.i) * 5);
        else if (h.kind === 'pie' || h.kind === 'muffin') h.mesh.position.set(((t * 3 + h.i * 4) % 18) - 9, 1.1 + Math.sin(t) * 0.3, -26 - (h.i % 3) * 3);
        else if (h.kind === 'balloon' || h.kind === 'sparkle') h.mesh.position.set(Math.sin(t + h.i) * 5, 1.1 + Math.abs(Math.sin(t * 1.4)) * 1.2, -30 + Math.cos(t + h.i) * 4);
        else if (h.kind === 'confetti' || h.kind === 'leaf' || h.kind === 'ribbon' || h.kind === 'flake') h.mesh.position.set(Math.sin(t * 1.3 + h.i) * 6, 0.8 + (t + h.i) % 3, -28 + Math.cos(t + h.i) * 4);
        else if (h.kind === 'peek' || h.kind === 'wink') h.mesh.position.z = -34 + Math.sin(t) * 3;
        else if (h.kind === 'boss'){
          h.mesh.position.x = Math.sin(t) * (run.bossTag ? 1.2 : 4);
          if (elv.boss && elv.boss.hat) elv.boss.hat.position.x = h.mesh.position.x;
          if (elv.bossBell) { elv.bossBell.mesh.position.x = h.mesh.position.x; elv.bossBell.x = h.mesh.position.x; }
        }
        const rad = h.kind === 'boss' ? (run.bossTag ? 0.8 : 1.6) : (h.kind === 'peek' || h.kind === 'wink' ? 1.1 : 0.9);
        if (!run.bossTag && Math.hypot(P.x - h.mesh.position.x, P.z - h.mesh.position.z) < rad && Math.abs(P.y - h.mesh.position.y) < 1.6){
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
      if (elv.drum && elv.drum.mesh && elv.drum.mesh.material){
        const glow = elevOnBeat();
        elv.drum.mesh.material.emissive.set(glow ? '#ffd23f' : '#4a2000');
      }
      if (elv.pads){
        elv.pads.forEach(p => {
          if (elevNear(p.x, p.z, 1.4) && !p.on){
            p.on = true;
            ElevRules.elevPadStand(run, p.i, true);
            p.mesh.material.color.set('#ffd23f');
          }
        });
        if (run.wantClear) elevDoClear();
      }
      if (elv.door && elevNear(elv.door.x, elv.door.z, 1.5)){
        ElevRules.elevReachDoor(run);
        if (run.wantClear) elevDoClear();
      }
    }

    if (run.wantFail) elevDoFail();

    let act = '';
    if (run.phase === 'lobby' || run.phase === 'inter'){
      if (elevNearShop()) elevHud('E / Ⓧ — open the lobby shop for hats and useful bits.', '🛒 Shop');
      else elevHud(elevInCab() ? 'E / Ⓧ — ding the lift! Doors will count down so friends can hop in.' : 'Walk the lobby, sit, shop, then board the big golden lift.', elevInCab() ? '🛗 Ride' : '');
    } else if (run.phase === 'board'){
      elevHud('🚪 Doors closing in ' + Math.ceil(run.t) + 's — get back in!', elevInCab() ? '' : '🚪 Get in!');
    } else if (run.phase === 'ride'){
      elevHud(run.quote || 'The lift is wobbling to the next floor…', '');
    } else if (run.phase === 'floor' && f){
      if (elv.bells && elv.bells.some(o => elevNear(o.x, o.z, 1.6))) act = '🔔 Ring';
      else if (elv.paints && elv.paints.some(o => !o.done && elevNear(o.x, o.z, 1.7))) act = (f.id === 'honkfloor' ? '📯 Honk' : '🎨 Paint');
      else if (elv.quiz && elv.quiz.some(o => elevNear(o.x, o.z, 1.8))) act = '❓ Answer';
      else if (elv.pickups && elv.pickups.some(o => !o.got && elevNear(o.x, o.z, 1.5))) act = '🤲 Pick up';
      else if (elv.turnIn && elevNear(elv.turnIn.x, elv.turnIn.z, 1.8)) act = elv.turnIn.shop ? '🛒 Buy' : elv.turnIn.stack ? '🧱 Stack' : elv.turnIn.rhythm ? '🥁 Tap' : '🧺 Drop off';
      else if (elv.pads && elv.pads.some(o => elevNear(o.x, o.z, 1.6))) act = '⭐ Pad';
      else if (elv.bossBell && run.bossTag && elevNear(elv.bossBell.x, elv.bossBell.z, 2.2)) act = '🛎️ Bell';
      else if (elv.door && elevNear(elv.door.x, elv.door.z, 1.6)) act = '🚪 Door';
      let extra = run.holding ? '  Holding the find!' : '';
      if (f.clear === 'rhythm') extra += '  Hits ' + (run.beats || 0) + '/' + (f.need || 6);
      if (f.clear === 'stack') extra += '  Stack ' + (run.stacked || 0) + '/' + (f.need || 5);
      if (run.bossTag) extra += '  Tag the bell!';
      elevHud(f.hint + extra, act);
    } else {
      elevHud('Back in the lift. Next floor coming up!', '');
    }
  }

  function elevKey(e){
    if (!elv) return false;
    if (typeof t297EatOverlayKey === 'function' && t297EatOverlayKey(e)) return true;
    if (e.type === 'keyup') return false;
    const c = e.code || e.key;
    if (c === 'KeyE' || c === 'KeyF'){ elevAct(); return true; }
    if (c === 'KeyH'){ elevOpenHelp(); return true; }
    if (c === 'KeyI'){ elevOpenIndex(); return true; }
    return false;
  }
  function elevPad(jp){
    if (!elv || !jp) return false;
    if (typeof t297EatOverlayPad === 'function' && t297EatOverlayPad(jp)) return true;
    return false;
  }
  function elevPadEdge(jp){
    if (!elv || !jp) return false;
    if (typeof t297EatOverlayPad === 'function' && t297EatOverlayPad(jp)) return true;
    if (!elv._x && jp[2]){ elv._x = true; elevAct(); return true; }
    if (!jp[2]) elv._x = false;
    if (!elv._y && jp[3]){ elv._y = true; elevOpenIndex(); return true; }
    if (!jp[3]) elv._y = false;
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
    try { elevMuzak.stop(); } catch (e){}
    if (typeof t297OverlayClose === 'function'){ t297OverlayClose('elevHelp'); t297OverlayClose('elevIndex'); t297OverlayClose('elevShop'); }
    const ob = document.getElementById('obby');
    if (ob) ob.classList.remove('elevmode');
  }

  if (typeof window !== 'undefined') window.elevDebug = {
    floors(){ return ElevRules.ELEV_FLOORS.map(f => f.id); },
    cab(){ if (!elv) return; elv.run.watching = false; if (elv.lobbySpawn && checkpoints[0]) checkpoints[0].spawn = {x:elv.lobbySpawn.x, y:elv.lobbySpawn.y, z:elv.lobbySpawn.z}; P.x = 0; P.z = 16; P.y = 0.5; P.vx = 0; P.vy = 0; P.vz = 0; elv.run.phase = 'lobby'; elv.floorStart = null; elevRestoreSky(); elevClearFloorMeshes(); },
    floor(id){
      if (!elv) return;
      elv.run.watching = false;
      ElevRules.elevBeginFloor(elv.run, id || 'lanternhall', Math.random);
      elevArrive();
    },
    index(){ elevOpenIndex(); },
    catchFall(){ return elevCatchFall(); },
    paint(streak, best){ if (!elv) return; if (streak != null && elv.run) elv.run.streak = streak|0; if (best != null && elv.sv) elv.sv.best = best|0; elevPaintBoard(); },
    shop(){ elevOpenShop(); },
    talk(){ elv.talkT = 0; elevTickTalk(0.01); },
    board(){ if (elv){ ElevRules.elevBeginBoard(elv.run); elevNetSync(); } },
    ride(){
      if (!elv) return;
      elv.run.buddy = true;
      ElevRules.elevBeginRide(elv.run, Math.random);
      elevOnPhase('board', 'ride');
      elevSpawnPals(elv.run);
      elv.talkT = 0; elevTickTalk(0.01);
    },
    less(on){ if (!elv) return; elv.sv = ElevRules.elevSetLessScary(elv.sv, !!on); elevPersist(elv.sv); elevSyncLessBtn(); },
    to(x,y,z){ Object.assign(P, {x:+x, y:+y, z:+z, vx:0, vy:0, vz:0, onGround:false, ground:null}); return this.probe(); },
    probe(){
      if (!elv) return null;
      const active = (typeof solids !== 'undefined' && solids) ? solids.filter(b => b && b.active) : [];
      const under = (typeof colTop === 'function') ? colTop(P.x, P.z) : 0;
      return {
        phase: elv.run && elv.run.phase,
        floor: elv.run && elv.run.floor,
        P:{x:+P.x, y:+P.y, z:+P.z, vy:+P.vy, onGround:!!P.onGround},
        start: elv.floorStart || null,
        room: elv.room || null,
        solids: active.length,
        floorSolids: (elv.floorSolids || []).filter(b => b && b.active).length,
        under: +under,
        wantFail: !!(elv.run && elv.run.wantFail)
      };
    }
  };
