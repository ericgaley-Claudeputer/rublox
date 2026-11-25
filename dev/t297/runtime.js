  /* ---------- t297u shared helpers + Cozy Café, Ripple Lake, Pet Talent Show, Treasure Trail ---------- */
  let cafe = null, fishg = null, psg = null, huntg = null;

  let t297Ui = {id:null, x:0, z:0, openAt:0, closedAt:0};

  function t297OverlayList(){
    if (typeof CafeRules !== 'undefined' && CafeRules.t297OverlayIds) return CafeRules.t297OverlayIds();
    return ['cafeDecor','cafeBoard','fishIndex','huntMap','psVoteBox'];
  }
  function t297OverlayOpen(){
    return t297OverlayList().find(id => {
      const el = document.getElementById(id);
      return el && el.classList.contains('show');
    }) || null;
  }
  function t297OverlayClose(id){
    const ids = id ? [id] : t297OverlayList();
    let closed = false;
    ids.forEach(i => {
      const el = document.getElementById(i);
      if (el && el.classList.contains('show')){ el.classList.remove('show'); closed = true; }
    });
    if (closed){
      t297Ui.id = null;
      t297Ui.closedAt = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
    }
    return closed;
  }
  function t297OverlayShow(id, on){
    const el = document.getElementById(id);
    if (!el) return false;
    const show = on == null ? !el.classList.contains('show') : !!on;
    if (show){
      const now = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
      const may = (typeof CafeRules !== 'undefined' && CafeRules.t297UiMayOpen)
        ? CafeRules.t297UiMayOpen(t297Ui.closedAt, now)
        : (t297Ui.closedAt == null || (now - t297Ui.closedAt) >= 700);
      // Manual X / Esc / B / tap / a HUD button may always re-open later; only block
      // an automatic proximity re-open (on === true with a recent close and no user id).
      if (on === true && !may && t297Ui._auto) return false;
      t297OverlayList().forEach(i => { if (i !== id){ const o = document.getElementById(i); if (o) o.classList.remove('show'); } });
      el.classList.add('show');
      t297Ui.id = id;
      t297Ui.x = (typeof P !== 'undefined' && P) ? P.x : 0;
      t297Ui.z = (typeof P !== 'undefined' && P) ? P.z : 0;
      t297Ui.openAt = now;
      try { if (typeof document !== 'undefined' && document.pointerLockElement && document.exitPointerLock) document.exitPointerLock(); } catch (e){}
      return true;
    }
    return t297OverlayClose(id);
  }
  function t297OverlayTick(){
    const open = t297OverlayOpen();
    if (!open || !t297Ui || t297Ui.id !== open) return;
    if (typeof P === 'undefined' || !P) return;
    const away = (typeof CafeRules !== 'undefined' && CafeRules.t297UiWalkAway)
      ? CafeRules.t297UiWalkAway(t297Ui.x, t297Ui.z, P.x, P.z)
      : Math.hypot(P.x - t297Ui.x, P.z - t297Ui.z) > 4.5;
    if (away) t297OverlayClose(open);
  }
  function t297BindOverlays(){
    if (typeof window !== 'undefined' && window.__t297OvBound) return;
    if (typeof window !== 'undefined') window.__t297OvBound = true;
    t297OverlayList().forEach(id => {
      const el = document.getElementById(id);
      if (!el || el.__t297Ov) return;
      el.__t297Ov = true;
      el.addEventListener('click', ev => {
        if (ev.target === el){ ev.preventDefault(); ev.stopPropagation(); t297OverlayClose(id); }
      });
      const x = el.querySelector('.t297x');
      if (x && !x.__t297OvX){
        x.__t297OvX = true;
        x.addEventListener('click', ev => { ev.preventDefault(); ev.stopPropagation(); t297OverlayClose(id); });
      }
    });
  }
  function t297EatOverlayKey(e){
    if (!t297OverlayOpen()) return false;
    const c = e && (e.code || e.key);
    if (c === 'Escape' || c === 'Esc' || c === 'KeyB'){ t297OverlayClose(); return true; }
    return false;
  }
  function t297EatOverlayPad(jp){
    if (!jp || !t297OverlayOpen()) return false;
    if (jp[1]){ t297OverlayClose(); return true; }
    return false;
  }


  function t297Lab(text, x, y, z, bg){
    try {
      const m = (typeof label === 'function') ? label(text, bg || 'rgba(29,35,64,.9)', '#fff', 420) : null;
      if (m){ m.position.set(x, y, z); m.scale.multiplyScalar(0.8); scene.add(m); return m; }
    } catch (e){}
    return null;
  }
  function t297Keep(st, m){ if (m && st && st.trash) st.trash.push(m); return m; }
  function t297Tree(st, x, z, col){
    const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.28, 0.7, 6), new THREE.MeshLambertMaterial({color:'#8d5524'}));
    pot.position.set(x, 0.35, z); scene.add(pot); t297Keep(st, pot);
    const leaf = new THREE.Mesh(new THREE.ConeGeometry(1.05, 2.2, 8), new THREE.MeshLambertMaterial({color: col || '#2f8f4a'}));
    leaf.position.set(x, 1.7, z); scene.add(leaf); t297Keep(st, leaf);
  }
  function t297Hud(text, act){
    const hint = document.getElementById('t297Hint');
    if (hint) hint.textContent = text || '';
    const btn = document.getElementById('t297Act');
    if (btn){ if (act){ btn.textContent = act; btn.classList.add('show'); } else btn.classList.remove('show'); }
  }
  function t297Near(x, z, r){ return Math.hypot(P.x - x, P.z - z) <= (r == null ? 1.8 : r); }
  function t297Note(ev, n){ try { if (typeof qNoteHook === 'function') qNoteHook(ev, n == null ? 1 : n); } catch (e){} }
  function t297Ach(id){ try { if (typeof achNote === 'function') achNote(id); } catch (e){} }
  function t297Board(id, v){ try { if (typeof lbRecord === 'function') lbRecord(id, v); } catch (e){} }
  function t297Pay(n, label){
    if (!(n > 0)) return;
    try { setCoins(coins + n); runCoins = (runCoins || 0) + n; } catch (e){}
    try { if (typeof banner === 'function') banner((label || 'Nice!') + ' +' + n + ' 🪙'); } catch (e){}
    try { if (typeof SND !== 'undefined' && SND.coin) SND.coin(); } catch (e){}
  }
  function t297Save(key, obj){ try { if (typeof save === 'function') save(key, obj); } catch (e){} }
  function t297Pets(){
    try {
      if (typeof activePet === 'function'){
        const a = activePet();
        if (a) return [a].concat(((typeof pt !== 'undefined' && pt && pt.s && Array.isArray(pt.s.pets)) ? pt.s.pets : []).filter(p => p && p !== a));
      }
    } catch (e){}
    try {
      const s = (typeof load === 'function') ? load('rubloxPets', null) : null;
      const list = s && Array.isArray(s.pets) ? s.pets : [];
      if (list.length){
        const i = Math.max(0, s.a | 0);
        if (list[i]) return [list[i]].concat(list.filter((_, k) => k !== i));
        return list.slice();
      }
    } catch (e){}
    return [];
  }

  /* ===== Cozy Corner Café ===== */
  function buildCafe(){
    const R = (typeof CafeRules !== 'undefined') ? CafeRules : null;
    const sv = R ? R.cafeLoad(typeof load === 'function' ? load(R.CAFE_KEY, null) : null) : {served:0, earned:0, decor:[]};
    cafe = {trash:[], sv, tickets:[], hold:null, near:null, npcs:[], seq:0, t:0, remote: !!(typeof mpGuest === 'function' && mpGuest())};
    scene.background = new THREE.Color('#f4e0c4');
    scene.fog = new THREE.Fog('#f4e0c4', 28, 80);
    plat(0, 0, 0, 22, 20, '#d9b089', 0.2);
    plat(0, 4.4, -10.2, 22, 0.4, '#8d4f2a', 8.8, {noEdge:true});
    plat(0, 4.4, 10.2, 22, 0.4, '#8d4f2a', 8.8, {noEdge:true});
    plat(-11.2, 4.4, 0, 0.4, 20, '#8d4f2a', 8.8, {noEdge:true});
    plat(11.2, 4.4, 0, 0.4, 20, '#8d4f2a', 8.8, {noEdge:true});
    plat(0, 8.8, 0, 22.4, 20.4, '#f7efe4', 0.3, {noEdge:true});
    // counter
    plat(0, 1.1, -3, 10, 1.4, '#6b3a1d', 1.1);
    plat(0, 0.5, -5.6, 10, 3.2, '#c48a5a', 0.5);
    cafe.stations = [
      {id:'cocoa', x:-3.2, z:-5.2, name:'☕ Cocoa'},
      {id:'tea',   x:-1.1, z:-5.2, name:'🍵 Tea'},
      {id:'latte', x: 1.1, z:-5.2, name:'🥛 Latte'},
      {id:'fizz',  x: 3.2, z:-5.2, name:'🍓 Fizz'},
      {id:'oven',  x: 0,   z:-7.2, name:'Oven'}
    ];
    cafe.stations.forEach(s => {
      const col = s.id === 'oven' ? '#555' : '#fff8ee';
      const m = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.7, 1.1), new THREE.MeshLambertMaterial({color: col}));
      m.position.set(s.x, 1.4, s.z); scene.add(m); t297Keep(cafe, m);
      t297Keep(cafe, t297Lab(s.name, s.x, 2.2, s.z, 'rgba(80,40,20,.9)'));
    });
    t297Keep(cafe, t297Lab('☕ Cozy Corner Café', 0, 3.4, -2.2, 'rgba(80,40,20,.92)'));
    // seats
    [[-6, 3], [-3, 3], [3, 3], [6, 3], [-6, 6], [6, 6]].forEach(([x,z]) => {
      plat(x, 0.45, z, 1.2, 1.2, '#c45c4a', 0.45);
    });
    // door gap marker
    plat(0, 0.05, 9.4, 2.4, 0.6, '#6b3a1d', 0.05);
    t297Keep(cafe, t297Lab('🚪 Door', 0, 2.4, 9.2));
    // decor already owned
    (sv.decor || []).forEach(id => cafePlaceDecor(id, true));
    cafeNextTickets(true);
    if (!mp.on) cafeSpawnNpc();
    checkpoints[0] = {idx:0, spawn:{x:0,y:0.5,z:6}, flag:new THREE.Object3D()};
    Object.assign(P, {x:0,y:0.5,z:6, vx:0,vy:0,vz:0, face:Math.PI});
  }
  function cafePlaceDecor(id, silent){
    if (!cafe) return;
    const spots = {plant:[-8, 7], lamp:[8, 7], rug:[0, 4], art:[-9, -1], piano:[8, -1]};
    const p = spots[id]; if (!p) return;
    const col = {plant:'#2f8f4a', lamp:'#ffd23f', rug:'#c45c4a', art:'#3a86ff', piano:'#2a2a32'}[id] || '#fff';
    const m = new THREE.Mesh(new THREE.BoxGeometry(id==='rug'?2.4:0.8, id==='rug'?0.06:1.1, id==='rug'?1.6:0.8), new THREE.MeshLambertMaterial({color:col}));
    m.position.set(p[0], id==='rug'?0.24:0.7, p[1]); scene.add(m); t297Keep(cafe, m);
    if (!silent) t297Keep(cafe, t297Lab((CafeRules.CAFE_DECOR.find(d=>d.id===id)||{}).emoji || '✨', p[0], 1.8, p[1]));
  }
  function cafeNextTickets(reset){
    if (!cafe || !CafeRules) return;
    if (reset) cafe.tickets = [];
    while (cafe.tickets.length < 3){
      cafe.seq += 1;
      cafe.tickets.push(CafeRules.cafeTicket(cafe.seq, CafeRules.CAFE_MENU[cafe.seq % CafeRules.CAFE_MENU.length].id));
    }
    cafePaintBoard();
  }
  function cafePaintBoard(){
    const el = document.getElementById('cafeBoardList');
    if (!el || !cafe) return;
    el.innerHTML = (cafe.tickets || []).map(t => '<div class="t297row"><span>'+t.emoji+' Ticket #'+t.n+'</span><b>'+t.name+'</b></div>').join('') || '<p>No tickets right now.</p>';
    const dec = document.getElementById('cafeDecorList');
    if (dec && CafeRules){
      dec.innerHTML = CafeRules.CAFE_DECOR.map(d => {
        const have = cafe.sv.decor.indexOf(d.id) >= 0;
        return '<button type="button" data-cafedec="'+d.id+'" '+(have?'disabled':'')+'>'+d.emoji+' '+d.name+(have?' ✓':' · '+d.cost+' 🪙')+'</button>';
      }).join('');
      dec.querySelectorAll('button').forEach(b => b.onclick = ev => { ev.preventDefault(); cafeBuy(b.getAttribute('data-cafedec')); });
    }
  }
  function cafeBuy(id){
    if (!cafe || !CafeRules || cafe.remote) return;
    const r = CafeRules.cafeBuyDecor(cafe.sv, id, coins);
    if (!r.ok){ banner(r.why === 'coins' ? 'Need more coins for that decor.' : 'Already have that!'); return; }
    cafe.sv = r.state; t297Save(CafeRules.CAFE_KEY, cafe.sv);
    setCoins(r.coins);
    cafePlaceDecor(id, false);
    cafePaintBoard();
    t297Ach('cafe-decor');
    banner('Decor added! ' + r.item.emoji);
  }
  function cafeSpawnNpc(){
    if (!cafe) return;
    for (let i = 0; i < 2; i++){
      const body = new THREE.Mesh(new THREE.BoxGeometry(0.7, 1.4, 0.5), new THREE.MeshLambertMaterial({color: i ? '#3a86ff' : '#2ec27e'}));
      const head = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 0.5), new THREE.MeshLambertMaterial({color:'#f6d2b0'}));
      const g = new THREE.Group(); g.add(body); head.position.y = 1.05; g.add(head);
      const x = (i ? 3 : -3), z = 9;
      g.position.set(x, 0.7, z); scene.add(g); t297Keep(cafe, g);
      cafe.npcs.push({g, x, z, y:0.7, wait: 2 + i * 3, want:null, phase:'idle'});
    }
  }
  function cafeEnter(){
    if (!cafe) return;
    cam.pitch = 0.36; cam.dist = 12;
    t297Note('play:cafe'); t297Ach('cafe-visit');
    cafePaintBoard();
    const act = document.getElementById('t297Act');
    if (act && !window.__t297ActBound){ window.__t297ActBound = true; act.onclick = ev => { ev.preventDefault(); ev.stopPropagation(); t297Act(); }; }
    ['cafeBoardBtn','cafeDecorBtn','cafeBoardX','cafeDecorX'].forEach(id => {
      const el = document.getElementById(id);
      if (el && !el.__t297){ el.__t297 = true; el.onclick = ev => { ev.preventDefault(); cafeToggle(id); }; }
    });
    banner('☕ Welcome to Cozy Corner Café! Make the ticket drinks and treats, then serve them.');
    t297Hud('Walk to a station and press E / Ⓧ to make the next ticket.', '☕ Make');
  }
  function cafeToggle(id){
    t297BindOverlays();
    if (id === 'cafeBoardBtn') t297OverlayShow('cafeBoard', true);
    else if (id === 'cafeBoardX') t297OverlayClose('cafeBoard');
    else if (id === 'cafeDecorBtn'){ t297OverlayShow('cafeDecor', true); cafePaintBoard(); }
    else if (id === 'cafeDecorX') t297OverlayClose('cafeDecor');
  }
  function cafeStop(){
    if (!cafe) return;
    try { cafe.trash.forEach(m => { if (m && m.parent) m.parent.remove(m); }); } catch (e){}
    t297OverlayClose();
    cafe = null;
  }
  function cafeStationNear(){
    if (!cafe) return null;
    let best = null, bd = 99;
    cafe.stations.forEach(s => { const d = Math.hypot(P.x - s.x, P.z - s.z); if (d < 1.6 && d < bd){ bd = d; best = s; } });
    return best;
  }
  function cafeAct(){
    if (!cafe || !CafeRules) return false;
    const st = cafeStationNear();
    if (cafe.hold){
      // serve at the front of the counter
      if (t297Near(0, -2.2, 2.2) || st){
        const r = CafeRules.cafeServe(cafe.sv, cafe.hold);
        if (r.ok){
          cafe.sv = r.state; t297Save(CafeRules.CAFE_KEY, cafe.sv);
          t297Pay(r.coins, r.item.emoji + ' Served ' + r.item.name);
          t297Note('cafe-serve'); t297Ach('cafe-first');
          if (cafe.sv.served >= 20) t297Ach('cafe-20');
          t297Board('cafe-served', cafe.sv.served);
          cafe.tickets = cafe.tickets.filter(t => t !== cafe.hold && t.n !== cafe.hold.n);
          cafe.hold = null; cafeNextTickets(false); cafePaintBoard();
          return true;
        }
      }
    }
    if (!st){ banner('Stand at a station or the counter.'); return true; }
    const want = cafe.tickets.find(t => CafeRules.cafeItem(t.id).st === st.id);
    if (!want){ banner('No ticket needs the ' + st.name + ' right now. Check the board!'); return true; }
    const mk = CafeRules.cafeMake(want, st.id);
    if (!mk.ok){ banner('That station is for a different ticket.'); return true; }
    cafe.hold = want;
    banner('Made ' + want.emoji + ' ' + want.name + '! Take it to the counter to serve.');
    t297Hud('Carry the ' + want.name + ' to the counter and press E / Ⓧ to serve.', '🍽️ Serve');
    return true;
  }
  function cafeUpdate(dt){
    if (!cafe) return;
    cafe.t += dt;
    if (!mp.on && cafe.npcs){
      cafe.npcs.forEach((n, i) => {
        if (n.phase === 'idle'){ n.wait -= dt; if (n.wait <= 0){ n.phase = 'walk'; n.tx = i ? 2 : -2; n.tz = -1.6; } }
        else if (n.phase === 'walk'){
          n.x += (n.tx - n.x) * Math.min(1, dt * 1.6); n.z += (n.tz - n.z) * Math.min(1, dt * 1.6);
          if (Math.hypot(n.x-n.tx, n.z-n.tz) < 0.2){ n.phase = 'wait'; n.wait = 8; }
        } else if (n.phase === 'wait'){ n.wait -= dt; if (n.wait <= 0){ n.phase = 'leave'; n.tx = i ? 3 : -3; n.tz = 9; } }
        else if (n.phase === 'leave'){
          n.x += (n.tx - n.x) * Math.min(1, dt * 1.6); n.z += (n.tz - n.z) * Math.min(1, dt * 1.6);
          if (Math.hypot(n.x-n.tx, n.z-n.tz) < 0.3){ n.phase = 'idle'; n.wait = 4 + i; }
        }
        if (n.g) n.g.position.set(n.x, n.y, n.z);
      });
    }
    const st = cafeStationNear();
    if (cafe.hold) t297Hud('Serve the ' + cafe.hold.name + ' at the counter.', '🍽️ Serve');
    else if (st) t297Hud('Make a ticket at the ' + st.name + '.', '☕ Make');
    else t297Hud('Check the ticket board, then use a station.', '');
  }
  function cafeKey(e){
    if (!cafe || e.repeat) return false;
    if (t297EatOverlayKey(e)) return true;
    if (e.code === 'KeyE' || e.code === 'KeyF' || e.key === 'e' || e.key === 'f'){ cafeAct(); return true; }
    if (e.code === 'KeyB'){ cafeToggle('cafeBoardBtn'); return true; }
    return false;
  }
  function cafePad(jp){ if (!cafe) return false; if (t297EatOverlayPad(jp)) return true; if (jp && (jp[2] || jp[3])){ cafeAct(); return true; } return false; }

  /* ===== Ripple Lake Fishing ===== */
  function buildFish(){
    const R = (typeof FishRules !== 'undefined') ? FishRules : null;
    const ice = !!(typeof evFestOn === 'function' && evFestOn());
    const sv = R ? R.fishLoad(typeof load === 'function' ? load(R.FISH_KEY, null) : null) : {caught:{}, total:0};
    fishg = {trash:[], sv, ice, hook:null, q:0, t:0, sweet:0.5, cursor:0, dir:1, biting:false, near:false};
    scene.background = new THREE.Color(ice ? '#c5d8ec' : '#87c8ef');
    scene.fog = new THREE.Fog(ice ? '#c5d8ec' : '#87c8ef', 40, 110);
    plat(0, 0, 8, 48, 28, ice ? '#d5e6f4' : '#6dbf7a', 1.0);
    // lake
    const lake = plat(0, ice ? 0.05 : -0.25, -8, 28, 22, ice ? '#d8eefc' : '#2f8ec8', ice ? 0.1 : 0.8);
    if (lake) lake.ice = !!ice;
    // pier
    plat(0, 0.35, -1, 3.2, 10, '#8d5524', 0.35);
    plat(0, 0.35, -6.5, 4.2, 3, '#8d5524', 0.35);
    [[-16, 10], [16, 10], [-18, 4], [18, 4], [-14, 16], [14, 16]].forEach(([x,z]) => t297Tree(fishg, x, z, ice ? '#1f5a3a' : '#2f8f4a'));
    t297Keep(fishg, t297Lab(ice ? '🧊 Ice fishing hole — press E / Ⓧ to drop a line!' : '🎣 Cast from the pier — press E / Ⓧ!', 0, 3.2, -6.5));
    t297Keep(fishg, t297Lab('📖 Fish Index — press I or the book button', 0, 2.6, 4));
    if (ice){
      const hole = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 0.9, 0.2, 16), new THREE.MeshLambertMaterial({color:'#1d4e7a'}));
      hole.position.set(0, 0.12, -7.2); scene.add(hole); t297Keep(fishg, hole);
    }
    checkpoints[0] = {idx:0, spawn:{x:0,y:0.6,z:6}, flag:new THREE.Object3D()};
    Object.assign(P, {x:0,y:0.6,z:6, vx:0,vy:0,vz:0, face:Math.PI});
  }
  function fishEnter(){
    if (!fishg) return;
    cam.pitch = 0.38; cam.dist = 13;
    t297Note('play:fish'); t297Ach('fish-visit');
    if (fishg.ice) t297Ach('fish-ice');
    const act = document.getElementById('t297Act');
    if (act && !window.__t297ActBound){ window.__t297ActBound = true; act.onclick = ev => { ev.preventDefault(); ev.stopPropagation(); t297Act(); }; }
    const idx = document.getElementById('fishIndexBtn');
    const x = document.getElementById('fishIndexX');
    if (idx && !idx.__t297){ idx.__t297 = true; idx.onclick = ev => { ev.preventDefault(); fishToggleIndex(); }; }
    if (x && !x.__t297){ x.__t297 = true; x.onclick = ev => { ev.preventDefault(); fishToggleIndex(false); }; }
    banner(fishg.ice ? '🧊 The lake is frozen for the Snow Festival! Ice-only fish are in season.' : '🎣 Welcome to Ripple Lake! Cast from the pier and time the bite.');
    t297Hud('Walk onto the pier and press E / Ⓧ to cast.', '🎣 Cast');
  }
  function fishStop(){
    if (!fishg) return;
    try { fishg.trash.forEach(m => { if (m && m.parent) m.parent.remove(m); }); } catch (e){}
    const bar = document.getElementById('fishBar'); if (bar) bar.classList.remove('show');
    const idx = document.getElementById('fishIndex'); if (idx) idx.classList.remove('show');
    fishg = null;
  }
  function fishToggleIndex(on){
    t297BindOverlays();
    const show = on == null ? (t297OverlayOpen() !== 'fishIndex') : !!on;
    if (show){ t297OverlayShow('fishIndex', true); fishPaintIndex(); }
    else t297OverlayClose('fishIndex');
  }
  function fishPaintIndex(){
    const el = document.getElementById('fishIndexList');
    if (!el || !fishg || !FishRules) return;
    const rows = FishRules.fishIndex(fishg.sv, fishg.ice);
    const kinds = FishRules.fishKinds(fishg.sv);
    const head = document.getElementById('fishIndexHead');
    if (head) head.textContent = 'Fish Index — ' + kinds + ' kinds caught';
    el.innerHTML = rows.map(r => '<div class="t297row '+(r.found?'':'dim')+'"><span>'+(r.found?r.emoji:'❓')+' '+ (r.found?r.name:'???')+'</span><b>'+(r.found?(r.rec+' · '+r.count+' · best '+r.best+' cm'):r.rarity)+'</b></div>').join('');
  }
  function fishOnPier(){ return P.z < 1.2 && P.z > -8.5 && Math.abs(P.x) < 2.6; }
  function fishAct(){
    if (!fishg || !FishRules) return false;
    if (!fishOnPier()){ banner('Walk onto the pier to fish.'); return true; }
    if (!fishg.hook){
      fishg.hook = 'wait'; fishg.t = 0; fishg.cursor = 0; fishg.dir = 1; fishg.sweet = 0.35 + Math.random() * 0.3; fishg.biting = false;
      const bar = document.getElementById('fishBar'); if (bar) bar.classList.add('show');
      banner('The line is out... wait for a nibble, then hit the green zone!');
      t297Hud('Wait for the bite, then press E / Ⓧ in the green zone!', '🎣 Hook');
      return true;
    }
    if (fishg.hook === 'wait' && !fishg.biting){ banner('Not a bite yet — wait for the splash!'); return true; }
    const q = FishRules.fishQuality(fishg.cursor, fishg.sweet, 0.16);
    const bar = document.getElementById('fishBar'); if (bar) bar.classList.remove('show');
    fishg.hook = null;
    if (q <= 0){ banner('It got away! Try again.'); try { if (SND && SND.hit) SND.hit(); } catch(e){} return true; }
    const f = FishRules.fishPick(Math.random, fishg.ice, q);
    const size = FishRules.fishSize(f, Math.random, q);
    const r = FishRules.fishCatch(fishg.sv, f, size);
    fishg.sv = r.state; t297Save(FishRules.FISH_KEY, fishg.sv);
    t297Pay(r.coins, (r.first ? 'New catch! ' : '') + f.emoji + ' ' + f.name + ' · ' + r.size + ' cm');
    t297Note('fish-catch'); t297Ach('fish-first');
    if (f.r >= 2) t297Ach('fish-rare');
    if (FishRules.fishKinds(fishg.sv) >= 10) t297Ach('fish-index');
    if (f.ice) t297Ach('fish-ice');
    t297Board('fish-kinds', FishRules.fishKinds(fishg.sv));
    t297Board('fish-biggest', fishg.sv.biggest);
    fishPaintIndex();
    return true;
  }
  function fishUpdate(dt){
    if (!fishg) return;
    if (fishg.hook === 'wait'){
      fishg.t += dt;
      if (!fishg.biting && fishg.t > 1.2 + Math.random()*0.4){ fishg.biting = true; fishg.t = 0; banner('💥 A bite! Time the green zone!'); }
      if (fishg.biting){
        fishg.cursor += fishg.dir * dt * 1.25;
        if (fishg.cursor > 1){ fishg.cursor = 1; fishg.dir = -1; }
        if (fishg.cursor < 0){ fishg.cursor = 0; fishg.dir = 1; }
        const cur = document.getElementById('fishCursor');
        const sw = document.getElementById('fishSweet');
        if (cur) cur.style.left = (fishg.cursor * 100) + '%';
        if (sw){ sw.style.left = ((fishg.sweet - 0.16) * 100) + '%'; sw.style.width = '32%'; }
        if (fishg.t > 3.2){ fishg.hook = null; const bar = document.getElementById('fishBar'); if (bar) bar.classList.remove('show'); banner('It got away! Cast again.'); }
      }
    }
    if (!fishg.hook) t297Hud(fishOnPier() ? 'Press E / Ⓧ to cast.' : 'Walk onto the pier to fish.', fishOnPier() ? '🎣 Cast' : '');
  }
  function fishKey(e){
    if (!fishg || e.repeat) return false;
    if (t297EatOverlayKey(e)) return true;
    if (e.code === 'KeyI'){ fishToggleIndex(); return true; }
    if (e.code === 'KeyE' || e.code === 'KeyF' || e.key === 'e' || e.key === 'f'){ fishAct(); return true; }
    return false;
  }
  function fishPad(jp){ if (!fishg) return false; if (t297EatOverlayPad(jp)) return true; if (jp && (jp[2] || jp[3])){ fishAct(); return true; } return false; }

  /* ===== Pet Talent Show ===== */
  function buildPetShow(){
    const R = (typeof PsRules !== 'undefined') ? PsRules : null;
    const sv = R ? R.psLoad(typeof load === 'function' ? load(R.PS_KEY, null) : null) : {tricks:{}, shows:0, best:0};
    const pets = t297Pets();
    const pal = {id:'pal', n:'Stage Pal', name:'Stage Pal', kind:'bunny', emoji:'🐰'};
    const use = pets.length ? pets[0] : pal;
    psg = {trash:[], sv, pets, pet: use, pal: !pets.length, near:null, show:false, step:0, qs:[], routine:[], votes:{}, t:0, remote: !!(typeof mpGuest === 'function' && mpGuest())};
    scene.background = new THREE.Color('#d8c6f0');
    scene.fog = new THREE.Fog('#d8c6f0', 32, 90);
    plat(0, 0, 2, 28, 28, '#efe7fb', 0.2);
    // stage
    plat(0, 0.7, -8, 12, 8, '#f4e27a', 0.7);
    plat(0, 0.2, -2.2, 10, 2.2, '#6b4aa0', 0.2);
    t297Keep(psg, t297Lab('🎭 Stage — start a show here', 0, 3.4, -7)); // QA t330u: was at z -5, right on top of the starting camera
    // judges as fixtures
    [[-3, -11.2], [0, -11.2], [3, -11.2]].forEach(([x,z], i) => {
      plat(x, 1.0, z, 1.4, 1.0, '#3d2a62', 1.0);
      const head = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 0.5), new THREE.MeshLambertMaterial({color:'#f6d2b0'}));
      head.position.set(x, 2.15, z); scene.add(head); t297Keep(psg, head);
      t297Keep(psg, t297Lab('Judge', x, 2.8, z, 'rgba(40,20,70,.92)'));
    });
    t297Keep(psg, t297Lab('🐾 Pet Talent Show', 0, 5.2, -8));
    // practice mats
    psg.mats = (PsRules ? PsRules.PS_TRICKS : []).map((t, i) => {
      const x = -8 + i * 4, z = 8;
      plat(x, 0.12, z, 2.2, 2.2, i % 2 ? '#ffd6ea' : '#d6f0ff', 0.12);
      // QA t330u: these filled the screen right under the camera. Smaller, lower and staggered so neighbours don't overlap.
      const ml = t297Lab(t.emoji + ' ' + t.name, x, 1.5 + (i % 2) * 0.55, z); if (ml) ml.scale.multiplyScalar(0.6);
      t297Keep(psg, ml);
      return {id:t.id, x, z, name:t.name, emoji:t.emoji};
    });
    // seats
    for (let i = -3; i <= 3; i++) plat(i * 2.2, 0.4, 12, 1.6, 1.2, '#6b4aa0', 0.4);
    // Real pet mesh (every species, including dogs) — attached in psEnter/psUpdate.
    psg.mesh = null; psg.ownMesh = false; psg.useFollow = false; psg.busy = null; psg.lastMat = null; psg.holdFollow = false;
    checkpoints[0] = {idx:0, spawn:{x:0,y:0.5,z:4}, flag:new THREE.Object3D()};
    Object.assign(P, {x:0,y:0.5,z:4, vx:0,vy:0,vz:0, face:Math.PI});
  }
  function psEnter(){
    if (!psg) return;
    cam.pitch = 0.36; cam.dist = 13;
    t297Note('play:petshow'); t297Ach('ps-visit');
    const act = document.getElementById('t297Act');
    if (act && !window.__t297ActBound){ window.__t297ActBound = true; act.onclick = ev => { ev.preventDefault(); ev.stopPropagation(); t297Act(); }; }
    ['psVoteX','psVote'].forEach(id => {
      const el = document.getElementById(id === 'psVote' ? 'psVoteBox' : id);
    });
    const box = document.getElementById('psVoteBox');
    if (box && !box.__t297){
      box.__t297 = true;
      box.querySelectorAll('[data-psvote]').forEach(b => b.onclick = ev => { ev.preventDefault(); psCastVote(+b.getAttribute('data-psvote')); });
    }
    const vx = document.getElementById('psVoteX');
    if (vx && !vx.__t297){ vx.__t297 = true; vx.onclick = ev => { ev.preventDefault(); const el=document.getElementById('psVoteBox'); if (el) el.classList.remove('show'); }; }
    if (psg.pal) banner('🐰 Bring a pal from Adopt a Pet next time — today Stage Pal will practice with you!');
    else banner('🐾 Teach ' + (psg.pet.n || psg.pet.name || 'your pet') + ' tricks on the mats, then perform on the stage!');
    t297Hud('Step on a practice mat — your pet will do the trick!', '');
    psAttachPet();
  }
  function psStop(){
    if (!psg) return;
    if (typeof pf !== 'undefined' && pf) pf.holdFollow = false;
    try { psg.trash.forEach(m => { if (m && m.parent) m.parent.remove(m); }); } catch (e){}
    const el = document.getElementById('psVoteBox'); if (el) el.classList.remove('show');
    psg = null;
  }
  function psKnown(){
    if (!psg || !PsRules) return [];
    return PsRules.psKnown(psg.sv, psg.pet && (PsRules.psPetId ? PsRules.psPetId(psg.pet) : (psg.pet.id || psg.pet.n || psg.pet.name || 'pal')));
  }
  function psMatNear(){
    if (!psg) return null;
    if (typeof PsRules !== 'undefined' && PsRules.psOnMat) return PsRules.psOnMat(P.x, P.z, psg.mats, 1.6);
    let best=null, bd=99;
    (psg.mats||[]).forEach(m => { const d=Math.hypot(P.x-m.x,P.z-m.z); if (d<=1.6 && d<bd){ bd=d; best=m; } });
    return best;
  }

  function psAttachPet(){
    if (!psg) return null;
    if (typeof pf !== 'undefined' && pf && pf.pet && pf.pet.m && pf.pet.m.g){
      if (psg.ownMesh && psg.mesh && psg.mesh.g && psg.mesh !== pf.pet.m){
        try { if (psg.mesh.g.parent) psg.mesh.g.parent.remove(psg.mesh.g); } catch (e){}
        psg.ownMesh = false;
      }
      psg.mesh = pf.pet.m;
      psg.useFollow = true;
      return psg.mesh;
    }
    if (psg.mesh && psg.mesh.g) return psg.mesh;
    const pet = psg.pet || {};
    const kind = (typeof PsRules !== 'undefined' && PsRules.psPetKind) ? PsRules.psPetKind(pet) : (pet.k || pet.kind || 'bunny');
    const k = (typeof PET_KINDS !== 'undefined' && PET_KINDS[kind]) ? kind : 'bunny';
    const c = pet.c | 0;
    const st = (typeof stageOf === 'function') ? stageOf(+pet.xp || 0) : 2;
    if (typeof buildPet === 'function'){
      const m = buildPet(k, c, st);
      try { if (typeof dress === 'function') dress(m, pet.acc); } catch (e){}
      try {
        const nm = pet.n || pet.name || 'Pal';
        const tag = (typeof label === 'function') ? label('🐾 ' + nm, 'rgba(255,111,181,.92)', '#fff', 220) : null;
        if (tag){ tag.scale.multiplyScalar(0.5); tag.position.y = (m.top || 1.2) + 0.45; m.g.add(tag); }
      } catch (e){}
      m.g.position.set(P.x || 2, 0, (P.z || 2) - 1.4);
      scene.add(m.g);
      t297Keep(psg, m.g);
      psg.mesh = m;
      psg.ownMesh = true;
      psg.useFollow = false;
      return m;
    }
    return null;
  }
  function psPetMesh(){
    if (!psg) return null;
    if (psg.useFollow && typeof pf !== 'undefined' && pf && pf.pet && pf.pet.m) return pf.pet.m;
    return psg.mesh || null;
  }
  function psStartPractice(mat){
    if (!psg || !PsRules || !mat || psg.show) return false;
    if (psg.busy && psg.busy.kind === 'practice' && psg.busy.id === mat.id) return true;
    const q = 0.7 + Math.random() * 0.3;
    const pid = PsRules.psPetId ? PsRules.psPetId(psg.pet) : (psg.pet.id || psg.pet.n || psg.pet.name || 'pal');
    const r = PsRules.psTeach(psg.sv, pid, mat.id, q);
    psg.busy = {kind:'practice', id: mat.id, t:0, dur:1.8, x: mat.x, z: mat.z, y:0};
    psg.holdFollow = true;
    if (typeof pf !== 'undefined' && pf) pf.holdFollow = true;
    psg.lastMat = mat.id;
    if (!r.ok){ banner('Almost! Try the ' + mat.name + ' again.'); return true; }
    psg.sv = r.state; t297Save(PsRules.PS_KEY, psg.sv);
    t297Note('ps-trick'); t297Ach('ps-teach');
    banner((r.first ? 'Learned! ' : 'Nailed it! ') + mat.emoji + ' ' + mat.name);
    return true;
  }
  function psDrivePet(dt){
    if (!psg) return;
    psAttachPet();
    const M = psPetMesh();
    if (!M || !M.g) return;
    if (M.inner){ M.g.rotation.x = 0; M.g.rotation.z = 0; }
    if (psg.busy && PsRules && PsRules.psTrickPose){
      const b = psg.busy;
      const pose = PsRules.psTrickPose(b.id, b.t, b.dur);
      const y = (b.y || 0) + (pose.hop || 0);
      M.g.position.set(b.x, y, b.z);
      M.g.rotation.y = pose.yaw || 0;
      if (typeof animPet === 'function') animPet(M, pose.act, 0, dt, (typeof worldT !== 'undefined' ? worldT : b.t));
      if (pose.roll){ if (M.inner) M.inner.rotation.z = pose.roll; else M.g.rotation.z = pose.roll; }
      if (psg.useFollow && typeof pf !== 'undefined' && pf && pf.pet){ pf.pet.x = b.x; pf.pet.y = y; pf.pet.z = b.z; pf.pet.sp = 0; pf.pet.face = pose.yaw || 0; }
      return;
    }
    if (psg.useFollow) return;
    const face = (typeof P !== 'undefined' && P) ? (P.face || 0) : 0;
    const tx = P.x - Math.sin(face) * 1.55, tz = P.z - Math.cos(face) * 1.55;
    const dx = tx - M.g.position.x, dz = tz - M.g.position.z, dd = Math.hypot(dx, dz);
    let sp = 0;
    if (dd > 0.35){
      const v = Math.min(7, dd * 4);
      M.g.position.x += dx / dd * v * dt;
      M.g.position.z += dz / dd * v * dt;
      M.g.rotation.y = Math.atan2(dx, dz);
      sp = v;
    }
    M.g.position.y = 0;
    if (typeof animPet === 'function') animPet(M, sp > 0.6 ? 1 : 0, sp, dt, (typeof worldT !== 'undefined' ? worldT : 0));
  }
  function pshowAct(){
    if (!psg || !PsRules) return false;
    if (psg.show) return true;
    const mat = psMatNear();
    if (mat){
      if (psg.busy) psg.busy = null;
      return psStartPractice(mat);
    }
    if (t297Near(0, -6, 3.2)){
      const known = psKnown();
      if (!known.length){ banner('Teach a trick on a practice mat first!'); return true; }
      psg.show = true; psg.routine = known.slice(); psg.qs = []; psg.step = 0; psg.t = 0; psg.votes = {};
      psg.busy = {kind:'show', id: psg.routine[0], t:0, dur:1.6, x:0, z:-7.2, y:0, step:0};
      psg.holdFollow = true; if (typeof pf !== 'undefined' && pf) pf.holdFollow = true;
      banner('Showtime! ' + (psg.pet.n || psg.pet.name) + ' will perform ' + known.length + ' trick' + (known.length>1?'s':'') + '!');
      if (mp.on){ t297BindOverlays(); t297OverlayShow('psVoteBox', true); }
      return true;
    }
    banner('Practice on a mat, or walk onto the stage to perform.');
    return true;
  }
  function psCastVote(n){
    if (!psg || !PsRules) return;
    const v = PsRules.psCleanVote(n);
    if (v == null) return;
    const uid = (typeof mp !== 'undefined' && mp && mp.me) ? String(mp.me) : 'me';
    psg.votes[uid] = v;
    try {
      if (typeof mpSend === 'function') mpSend({t:'ps', a:'vote', n:v});
    } catch (e){}
    banner('Your score: ' + v + '/10');
  }
  function psFromNet(g, d){
    if (!psg || !d || d.t !== 'ps') return;
    if (d.a === 'vote'){
      const v = PsRules.psCleanVote(d.n);
      if (v == null) return;
      const uid = String((g && g.uid) || 'friend');
      psg.votes[uid] = v;
    }
  }
  function psFinish(){
    if (!psg || !PsRules) return;
    const votes = Object.keys(psg.votes).map(k => psg.votes[k]);
    const judged = PsRules.psJudge(psg.routine, psg.qs, votes);
    const rec = PsRules.psRecord(psg.sv, judged);
    psg.show = false;
    if (rec.ok){
      psg.sv = rec.state; t297Save(PsRules.PS_KEY, psg.sv);
      t297Pay(rec.coins, rec.ribbon.emoji + ' ' + rec.ribbon.name + ' · ' + rec.score + '/10');
      t297Note('ps-show'); t297Ach('ps-show');
      if (rec.ribbon.id === 'gold') t297Ach('ps-gold');
      t297Board('ps-best', psg.sv.best);
    }
    const el=document.getElementById('psVoteBox'); if (el) el.classList.remove('show');
  }
  function psUpdate(dt){
    if (!psg) return;
    if (psg.show){
      psg.holdFollow = true; if (typeof pf !== 'undefined' && pf) pf.holdFollow = true;
      psg.t += dt;
      if (psg.busy && psg.busy.kind === 'show') psg.busy.t += dt;
      const cur = psg.routine[psg.step];
      if (!psg.busy || psg.busy.step !== psg.step){
        psg.busy = {kind:'show', id: cur, t:0, dur:1.6, x:0, z:-7.2, y:0, step: psg.step};
      }
      psDrivePet(dt);
      if (psg.t > 1.6){
        psg.qs.push(0.7 + Math.random()*0.3);
        psg.step += 1; psg.t = 0;
        if (psg.step >= psg.routine.length){ psg.busy = null; psg.holdFollow = false; if (typeof pf !== 'undefined' && pf) pf.holdFollow = false; psFinish(); }
        else {
          psg.busy = {kind:'show', id: psg.routine[psg.step], t:0, dur:1.6, x:0, z:-7.2, y:0, step: psg.step};
          banner('Next trick: ' + (PsRules.psTrick(psg.routine[psg.step])||{}).emoji);
        }
      } else t297Hud('Performing ' + ((PsRules.psTrick(cur)||{}).name || 'a trick') + '...', '');
      return;
    }
    const mat = psMatNear();
    if (mat){
      if (!psg.busy && psg.lastMat !== mat.id) psStartPractice(mat);
      t297Hud('Watch ' + (psg.pet.n || psg.pet.name || 'your pal') + ' do ' + mat.name + ' — or press Practice again.', (mat.emoji || '🐾') + ' Practice');
    } else {
      psg.lastMat = null;
      if (!psg.busy){ psg.holdFollow = false; if (typeof pf !== 'undefined' && pf) pf.holdFollow = false; }
      if (t297Near(0, -6, 3.2)) t297Hud('Start a show with the tricks you taught!', '🎭 Show');
      else t297Hud('Step on a practice mat and your pet will do the trick.', '');
    }
    if (psg.busy){
      psg.busy.t += dt;
      if (psg.busy.t >= psg.busy.dur) psg.busy = null;
    }
    psDrivePet(dt);
  }
  function pshowKey(e){
    if (!psg || e.repeat) return false;
    if (t297EatOverlayKey(e)) return true;
    if (e.code === 'KeyE' || e.code === 'KeyF' || e.key === 'e' || e.key === 'f'){ pshowAct(); return true; }
    if (e.code && /^Digit[1-9]$/.test(e.code) && psg.show && mp.on){ psCastVote(+e.code.slice(-1)); return true; }
    return false;
  }
  function pshowPad(jp){ if (!psg) return false; if (t297EatOverlayPad(jp)) return true; if (jp && (jp[2] || jp[3])){ pshowAct(); return true; } return false; }

  /* ===== Treasure Trail ===== */
  function buildHunt(){
    const R = (typeof HuntRules !== 'undefined') ? HuntRules : null;
    const now = Date.now();
    const sv = R ? R.huntLoad(typeof load === 'function' ? load(R.HUNT_KEY, null) : null, now) : {step:0, found:[]};
    const cur = R ? R.huntCurrent(sv, now) : {map:{steps:[]}, step:null, done:false, state:sv};
    huntg = {trash:[], sv: cur.state, map: cur.map, marks:{}, t:0};
    scene.background = new THREE.Color('#f7d7a0');
    scene.fog = new THREE.Fog('#f7e4b8', 45, 120);
    plat(0, 0, 0, 56, 56, '#e8c97a', 1.0);
    // brook
    plat(8, 0.05, -8, 3, 18, '#5dade2', 0.2);
    (HuntRules ? HuntRules.HUNT_SPOTS : []).forEach(s => {
      const col = {mill:'#c45c4a', bridge:'#3a86ff', oak:'#2f8f4a', dune:'#e8c36a', arch:'#9aa3b5', well:'#7a8a9a', dock:'#8d5524', camp:'#c45c4a'}[s.id] || '#8d5524';
      if (s.id === 'oak') t297Tree(huntg, s.x, s.z, '#1f7a4c');
      else if (s.id === 'bridge'){ plat(s.x, 0.5, s.z, 4, 1.4, '#3a86ff', 0.5); }
      else if (s.id === 'dune'){ plat(s.x, 0.8, s.z, 4, 4, '#e8c36a', 0.8); }
      else if (s.id === 'arch'){
        plat(s.x-1.3, 1.6, s.z, 0.6, 0.6, '#9aa3b5', 1.6);
        plat(s.x+1.3, 1.6, s.z, 0.6, 0.6, '#9aa3b5', 1.6);
        plat(s.x, 3.4, s.z, 3.2, 0.6, '#9aa3b5', 0.6);
      } else {
        plat(s.x, 1.4, s.z, 2.2, 2.2, col, 1.4);
      }
      const lab = t297Keep(huntg, t297Lab(s.emoji + ' ' + s.name, s.x, 3.4, s.z));
      huntg.marks[s.id] = {x:s.x, z:s.z, lab};
    });
    t297Keep(huntg, t297Lab('🗺️ Treasure Trail — follow today\'s clues!', 0, 3.2, 4));
    checkpoints[0] = {idx:0, spawn:{x:0,y:0.6,z:6}, flag:new THREE.Object3D()};
    Object.assign(P, {x:0,y:0.6,z:6, vx:0,vy:0,vz:0, face:Math.PI});
  }
  function huntEnter(){
    if (!huntg) return;
    cam.pitch = 0.4; cam.dist = 16;
    t297Note('play:hunt'); t297Ach('hunt-visit');
    const act = document.getElementById('t297Act');
    if (act && !window.__t297ActBound){ window.__t297ActBound = true; act.onclick = ev => { ev.preventDefault(); ev.stopPropagation(); t297Act(); }; }
    const mb = document.getElementById('huntMapBtn');
    const mx = document.getElementById('huntMapX');
    if (mb && !mb.__t297){ mb.__t297 = true; mb.onclick = ev => { ev.preventDefault(); huntToggleMap(); }; }
    if (mx && !mx.__t297){ mx.__t297 = true; mx.onclick = ev => { ev.preventDefault(); huntToggleMap(false); }; }
    huntPaintMap();
    const step = huntg.map && huntg.map.steps[huntg.sv.step];
    banner(step ? ('🗺️ Today\'s first clue: ' + step.clue) : '🗺️ You already finished today\'s map — come back tomorrow!');
    t297Hud(step ? step.clue : 'Today\'s map is done. Wander or come back tomorrow!', '🗺️ Map');
  }
  function huntStop(){
    if (!huntg) return;
    try { huntg.trash.forEach(m => { if (m && m.parent) m.parent.remove(m); }); } catch (e){}
    const el = document.getElementById('huntMap'); if (el) el.classList.remove('show');
    huntg = null;
  }
  function huntToggleMap(on){
    t297BindOverlays();
    const show = on == null ? (t297OverlayOpen() !== 'huntMap') : !!on;
    if (show){ t297OverlayShow('huntMap', true); huntPaintMap(); }
    else t297OverlayClose('huntMap');
  }
  function huntPaintMap(){
    const el = document.getElementById('huntMapList');
    if (!el || !huntg) return;
    const steps = (huntg.map && huntg.map.steps) || [];
    el.innerHTML = steps.map((s, i) => {
      const done = i < (huntg.sv.step|0);
      const cur = i === (huntg.sv.step|0);
      return '<div class="t297row '+(done?'dim':'')+'"><span>'+(done?'✅':(cur?'👉':s.emoji))+' '+(cur||done?s.name:'Hidden clue')+'</span><b>'+(cur?s.clue:(done?'Found!':'???'))+'</b></div>';
    }).join('');
  }
  function huntSpotNear(){
    if (!huntg || !HuntRules) return null;
    let best=null, bd=99;
    HuntRules.HUNT_SPOTS.forEach(s => { const d=Math.hypot(P.x-s.x,P.z-s.z); if (d<2.6 && d<bd){ bd=d; best=s; } });
    return best;
  }
  function huntAct(){
    if (!huntg || !HuntRules) return false;
    const s = huntSpotNear();
    if (!s){ huntToggleMap(); return true; }
    const r = HuntRules.huntDig(huntg.sv, s.id, Date.now());
    huntg.sv = r.state; t297Save(HuntRules.HUNT_KEY, huntg.sv);
    if (!r.ok){
      banner(r.why === 'empty' ? ('Nothing here. ' + (r.hint || 'Check your map!')) : r.why === 'done' ? 'Today\'s map is finished — new clues tomorrow!' : 'Already dug here.');
      huntPaintMap();
      return true;
    }
    t297Pay(r.coins, r.finished ? '💎 You found the last chest!' : ('📦 A chest at the ' + s.name + '!'));
    t297Note('hunt-chest'); t297Ach('hunt-first');
    if (r.finished){
      t297Ach('hunt-map');
      if ((huntg.sv.maps|0) >= 3) t297Ach('hunt-week');
      t297Board('hunt-maps', huntg.sv.maps);
    }
    huntg.map = HuntRules.huntCurrent(huntg.sv, Date.now()).map;
    huntPaintMap();
    const next = huntg.map.steps[huntg.sv.step];
    if (next) banner('Next clue: ' + next.clue);
    return true;
  }
  function huntUpdate(){
    if (!huntg || !HuntRules) return;
    const s = huntSpotNear();
    const cur = huntg.map && huntg.map.steps[huntg.sv.step];
    if (s) t297Hud('Dig at the ' + s.name + '?', '⛏️ Dig');
    else if (cur) t297Hud(cur.clue, '🗺️ Map');
    else t297Hud('Today\'s map is complete!', '🗺️ Map');
  }
  function huntKey(e){
    if (!huntg || e.repeat) return false;
    if (t297EatOverlayKey(e)) return true;
    if (e.code === 'KeyM'){ huntToggleMap(); return true; }
    if (e.code === 'KeyE' || e.code === 'KeyF' || e.key === 'e' || e.key === 'f'){ huntAct(); return true; }
    return false;
  }
  function huntPad(jp){ if (!huntg) return false; if (t297EatOverlayPad(jp)) return true; if (jp && (jp[2] || jp[3])){ huntAct(); return true; } return false; }

  function t297Act(){
    if (mode === 'cafe') return cafeAct();
    if (mode === 'fish') return fishAct();
    if (mode === 'petshow') return pshowAct();
    if (mode === 'hunt') return huntAct();
    return false;
  }
  function t297Update(dt){
    t297BindOverlays();
    t297OverlayTick();
    if (cafe) cafeUpdate(dt);
    if (fishg) fishUpdate(dt);
    if (psg) psUpdate(dt);
    if (huntg) huntUpdate(dt);
  }
  function t297Key(e){
    if (t297EatOverlayKey(e)) return true;
    if (mode === 'cafe') return cafeKey(e);
    if (mode === 'fish') return fishKey(e);
    if (mode === 'petshow') return pshowKey(e);
    if (mode === 'hunt') return huntKey(e);
    return false;
  }
  function t297Pad(jp){
    if (t297EatOverlayPad(jp)) return true;
    if (mode === 'cafe') return cafePad(jp);
    if (mode === 'fish') return fishPad(jp);
    if (mode === 'petshow') return pshowPad(jp);
    if (mode === 'hunt') return huntPad(jp);
    return false;
  }
  function t297Stop(){
    cafeStop(); fishStop(); psStop(); huntStop();
    const box = document.getElementById('t297Box'); if (box) box.style.display = 'none';
    const act = document.getElementById('t297Act'); if (act) act.classList.remove('show');
  }
