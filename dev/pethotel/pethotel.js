  /* ===================== Pet Hotel (original game): check in guest pets, care for them, check out for coins. ===================== */
  const PH_KEY = 'rubloxPetHotel';
  const PH_CARES = ['feed', 'bathe', 'play', 'bed'];
  const PH_CARE_LABEL = {feed: 'Feed', bathe: 'Bathe', play: 'Play', bed: 'Bed'};
  const PH_CARE_EMOJI = {feed: '🍽️', bathe: '🛁', play: '🎾', bed: '🛏️'};
  const PH_PAY_BASE = 8, PH_PAY_CARE = 3, PH_PAY_ALL = 6;
  // Original critters and names only — made up for Rublox, not copied from any other work.
  const PH_PETS = [
    {id: 'mochi', name: 'Mochi', kind: 'Beanpup', e: '🫘', col: '#c9894c', acc: '#8a4f24', ear: '#6d3a18'},
    {id: 'puddle', name: 'Puddle', kind: 'Puffcat', e: '🐈', col: '#8aa0b8', acc: '#e8eef6', ear: '#f4c6d4'},
    {id: 'bumble', name: 'Bumble', kind: 'Pipkin', e: '🍯', col: '#e6b84c', acc: '#5c3a14', ear: '#5c3a14'},
    {id: 'noodle', name: 'Noodle', kind: 'Looper', e: '🐕', col: '#d9a441', acc: '#3d2a12', ear: '#3d2a12'},
    {id: 'pippa', name: 'Pippa', kind: 'Cloudhen', e: '🐣', col: '#f3efe4', acc: '#f6c85c', ear: '#f3efe4'},
    {id: 'tater', name: 'Tater', kind: 'Rumblepup', e: '🥔', col: '#b45d32', acc: '#f0d5b0', ear: '#6b2e16'}
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
    {id: 'desk', name: 'Front desk', e: '🛎️', x: 0, z: -6.2, r: 2.2},
    {id: 'feed', name: 'Snack nook', e: '🍽️', x: -6.5, z: 2.2, r: 1.8},
    {id: 'bathe', name: 'Wash room', e: '🛁', x: 6.5, z: 2.2, r: 1.8},
    {id: 'play', name: 'Play nook', e: '🎾', x: -6.5, z: 8.2, r: 2.0},
    {id: 'bed', name: 'Sleep rooms', e: '🛏️', x: 6.5, z: 8.2, r: 2.0}
  ];
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
  function phLow(){ return typeof gfxIsLow === 'function' && gfxIsLow(); }
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
  function phBox(x, y, z, w, h, d, col, key){
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), typeof col === 'string' ? phShared(key || col, col) : col);
    m.position.set(x, y, z);
    if (typeof scene !== 'undefined') scene.add(m);
    if (ph) ph.props.push(m);
    return m;
  }
  function phMakePetMesh(pet){
    const g = new THREE.Group();
    const body = new THREE.Mesh(new THREE.SphereGeometry(pet.kind === 'Looper' ? 0.32 : 0.42, phLow() ? 8 : 12, phLow() ? 6 : 10), phShared('p-' + pet.id, pet.col));
    body.position.y = pet.kind === 'Looper' ? 0.32 : 0.42;
    if (pet.kind === 'Looper') body.scale.set(1.6, 0.7, 0.7);
    g.add(body);
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.28, phLow() ? 8 : 12, phLow() ? 6 : 10), phShared('p-' + pet.id, pet.col));
    head.position.set(pet.kind === 'Looper' ? 0.42 : 0, pet.kind === 'Looper' ? 0.48 : 0.78, pet.kind === 'Looper' ? 0.1 : 0.28);
    g.add(head);
    [[-0.14, 0.16], [0.14, 0.16]].forEach(([ex, ey], i) => {
      const ear = new THREE.Mesh(new THREE.BoxGeometry(0.12, pet.kind === 'Puffcat' ? 0.22 : 0.16, 0.08), phShared('e-' + pet.id, pet.ear));
      ear.position.set(head.position.x + ex, head.position.y + ey, head.position.z);
      g.add(ear);
    });
    const acc = new THREE.Mesh(new THREE.SphereGeometry(0.08, 6, 6), phShared('a-' + pet.id, pet.acc));
    acc.position.set(head.position.x, head.position.y, head.position.z + 0.22);
    g.add(acc);
    return g;
  }
  function phMakeGuestMesh(guestCol){
    const g = new THREE.Group();
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.5, 1.0, 0.32), phShared('g-' + guestCol, guestCol));
    body.position.y = 1.0; g.add(body);
    const head = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.38, 0.38), phShared('skin', '#f0c9a8'));
    head.position.y = 1.68; g.add(head);
    return g;
  }
  function buildPetHotel(){
    const sv = phLoadSave();
    ph = {
      stay: null, next: null, wait: 0.6, served: sv.served, earned: sv.earned, tipsSeen: sv.tipsSeen || {},
      near: null, remote: !!(typeof mpGuest === 'function' && mpGuest()),
      props: [], pets: [], guestM: null, petM: null, dirty: true, toast: '', toastT: 0, _mats: {}, seed: sv.served + 1
    };
    ph.next = phNewStay(ph.seed);
    if (typeof scene !== 'undefined'){
      scene.background = new THREE.Color('#c9e8ff');
      if (scene.fog){ scene.fog.color = new THREE.Color('#d8efff'); scene.fog.near = phLow() ? 28 : 40; scene.fog.far = phLow() ? 80 : 120; }
    }
    if (typeof plat === 'function'){
      const floor = plat(0, 0, 3, 28, 24, '#f4efe4', .3); if (floor) floor.floorOnly = true;
      plat(0, 1.6, -10.4, 20, 0.6, '#e9d5b3', 3.2); // back wall
      plat(-13.6, 1.6, 3, 0.6, 24, '#e9d5b3', 3.2);
      plat(13.6, 1.6, 3, 0.6, 24, '#e9d5b3', 3.2);
      plat(0, 1.2, -7.2, 6.4, 2.4, '#c97b5a', 2.2); // desk
      plat(-6.5, 0.5, 2.2, 3.2, 2.4, '#f2d9a0', 0.7); // snack
      plat(6.5, 0.45, 2.2, 3.4, 2.6, '#8ecae6', 0.6); // tub
      plat(-6.5, 0.2, 8.2, 4.4, 4.0, '#bde0a8', 0.25); // play
      plat(6.5, 0.45, 8.2, 3.6, 3.2, '#d4b483', 0.7); // beds
    }
    PH_STATIONS.forEach(s => {
      if (typeof label === 'function'){
        const L = label(s.e + ' ' + s.name, 'rgba(29,35,64,.92)');
        if (L && L.position){ L.position.set(s.x, 2.5, s.z); if (L.scale) L.scale.set(2.0, 0.55, 1); if (typeof scene !== 'undefined') scene.add(L); if (ph) ph.props.push(L); }
      }
    });
    // rug
    phBox(0, 0.07, 0.4, 6, 0.08, 5, '#d96b8a', 'rug');
    // desk bell
    phBox(0, 2.45, -6.4, 0.4, 0.18, 0.4, '#ffd23f', 'bell');
    Object.assign(P, {x: 0, y: 0.05, z: -1.2, vx: 0, vy: 0, vz: 0});
    P.face = 0;
    if (typeof cam !== 'undefined'){ cam.yaw = Math.PI; cam.pitch = 0.32; cam.dist = 9; }
    if (typeof checkpoints !== 'undefined') checkpoints[0] = {idx: 0, spawn: {x: 0, y: 0.05, z: -1.2}, flag: (typeof THREE !== 'undefined' ? new THREE.Object3D() : {})};
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
      const st = phNearStation();
      let x = 1.3, z = -5.2;
      if (ph.stay){
        if (st === 'feed'){ x = -6.5; z = 2.2; }
        else if (st === 'bathe'){ x = 6.5; z = 2.2; }
        else if (st === 'play'){ x = -6.5; z = 8.2; }
        else if (st === 'bed'){ x = 6.5; z = 8.2; }
        else { x = 0.8; z = -4.6; }
      }
      ph.petM.position.set(x, 0, z);
      ph.petM.visible = true;
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
      if (!ph.stay && ph.next) return '🛎️ Check in ' + ph.next.guest + ' and ' + ph.next.petName;
      if (ph.stay && phReadyOut(ph.stay)) return '🛎️ Check out ' + ph.stay.petName + ' for coins';
      if (ph.stay) return '🛎️ ' + ph.stay.petName + ' still needs ' + phCaresLeft(ph.stay).map(c => PH_CARE_LABEL[c].toLowerCase()).join(', ');
      return '🛎️ Front desk';
    }
    const lab = PH_CARE_EMOJI[station] + ' ' + PH_CARE_LABEL[station];
    if (!ph.stay) return lab + ' (check in a guest first)';
    if (ph.stay.done && ph.stay.done[station]) return lab + ' — done!';
    return lab + ' ' + ph.stay.petName;
  }
  function phDo(station){
    if (!ph) return false;
    if (ph.remote && station !== 'desk' && station !== 'feed' && station !== 'bathe' && station !== 'play' && station !== 'bed') return false;
    const res = phActAt(ph, station);
    if (!res.ok){ if (res.why && typeof banner === 'function') banner('🏨 ' + res.why); phHud(); return false; }
    if (res.act === 'checkin'){
      if (typeof banner === 'function') banner(res.stay.emoji + ' ' + res.stay.guest + ' checked in ' + res.stay.petName + ' the ' + res.stay.kind + '!');
    } else if (res.act === 'care'){
      if (typeof banner === 'function') banner(PH_CARE_EMOJI[res.care] + ' ' + PH_CARE_LABEL[res.care] + ' — ' + res.stay.petName + (phReadyOut(res.stay) ? ' is ready to check out!' : ' is happy!'));
    } else if (res.act === 'checkout'){
      if (typeof setCoins === 'function') setCoins((typeof coins === 'number' ? coins : 0) + res.rec.pay);
      if (typeof runCoins !== 'undefined') runCoins = (runCoins || 0) + res.rec.pay;
      if (typeof SND !== 'undefined' && SND.coin) try { SND.coin(); } catch (e){}
      if (typeof banner === 'function') banner('🪙 ' + res.rec.guest + ' picked up ' + res.rec.pet + '! +' + res.rec.pay + ' coins');
      phWriteSave();
    }
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
      const bits = stay
        ? (stay.emoji + ' ' + stay.petName + ' · ' + PH_CARES.map(c => (stay.done && stay.done[c] ? PH_CARE_EMOJI[c] : '○')).join(''))
        : ('🏨 Waiting' + (ph.next ? ' for ' + ph.next.guest : ''));
      box.innerHTML = '<b>' + bits + '</b> · 🪙 ' + (ph.earned | 0) + ' · ✅ ' + (ph.served | 0);
    }
    const tasks = (typeof $ === 'function') ? $('#phTasks') : null;
    if (tasks){
      if (!ph.stay){ tasks.innerHTML = ph.next ? ('🛎️ ' + ph.next.guest + ' is at the desk with ' + ph.next.petName + ' the ' + ph.next.kind) : '🛎️ The lobby is quiet…'; tasks.style.display = ''; }
      else {
        tasks.innerHTML = PH_CARES.map(c => (ph.stay.done[c] ? '✅' : '☐') + ' ' + PH_CARE_EMOJI[c] + ' ' + PH_CARE_LABEL[c]).join(' &nbsp; ');
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
    if (typeof cam !== 'undefined'){ cam.yaw = Math.PI; cam.pitch = 0.32; cam.dist = 9; }
    if (typeof banner === 'function') banner(ph.remote ? '🏨 Pet Hotel — help care for the guest pets together!' : '🏨 Pet Hotel! Check guests in, care for their pets, then check out for coins.');
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
    if (!ph.remote){
      if (!ph.stay){
        ph.wait = (ph.wait || 0) - (dt || 0);
        if (ph.wait < 0 && !ph.next) ph.next = phNewStay((ph.served | 0) + 1);
      }
    }
    const st = phNearStation();
    if (st !== ph.near){ ph.near = st; phHud(); }
    if (ph.dirty){ phSyncActors(); ph.dirty = false; }
    else if (ph.petM && ph.stay) phSyncActors();
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
  function drawPetHotel(ctx){
    if (!ctx) return;
    if (typeof sky === 'function') sky(ctx, '#9fd8ff', '#fff6e8');
    else { ctx.fillStyle = '#9fd8ff'; ctx.fillRect(0, 0, 320, 200); }
    ctx.fillStyle = '#e9d5b3'; ctx.fillRect(30, 70, 260, 90);
    ctx.fillStyle = '#c97b5a'; ctx.fillRect(110, 100, 100, 50);
    ctx.fillStyle = '#d96b8a'; ctx.fillRect(80, 150, 160, 18);
    ctx.fillStyle = '#c9894c'; ctx.beginPath(); ctx.arc(200, 148, 16, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#8aa0b8'; ctx.beginPath(); ctx.arc(84, 148, 14, 0, Math.PI * 2); ctx.fill();
    if (typeof guy === 'function'){ guy(ctx, 160, 175, 12, '#3a86ff'); guy(ctx, 60, 175, 11, '#d96b8a'); }
    ctx.font = '22px sans-serif'; ctx.fillText('🏨', 40, 60); ctx.fillText('🛎️', 150, 96);
  }
