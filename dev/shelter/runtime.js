  /* ---------- Wagwell Shelter ---------- */
  let sh = null;
  function shKeep(m){ if (m && sh && sh.trash) sh.trash.push(m); return m; }
  function shMat(c,o){ return new THREE.MeshLambertMaterial(Object.assign({color:c}, o||{})); }
  function shMesh(geo,c,x,y,z){ const m=new THREE.Mesh(geo, shMat(c)); m.position.set(x,y,z); scene.add(m); return shKeep(m); }
  function shState(){ return ShelterRules.shLoad(typeof load === 'function' ? load(ShelterRules.SH_KEY, null) : null); }
  function shSave(s){ if (typeof save === 'function') save(ShelterRules.SH_KEY, s); if (sh) sh.sv = s; }
  function shCoins(){ try { return (typeof coins === 'number') ? coins : +(typeof load==='function' && load('rubloxCoins', 0)) || 0; } catch(e){ return 0; } }
  function shPay(n){
    try {
      if (typeof pay === 'function'){ pay(n); return; }
      if (typeof coins === 'number'){ coins += n; if (typeof save === 'function') save('rubloxCoins', coins); }
    } catch (e){}
  }
  function shSpend(n){
    try {
      if (typeof coins === 'number'){
        if (coins < n) return false;
        coins -= n; if (typeof save === 'function') save('rubloxCoins', coins); return true;
      }
    } catch (e){}
    return shCoins() >= n;
  }
  function drawShelter(ctx){
    if (typeof sky === 'function') sky(ctx, '#b8e8ff', '#fff4d6');
    ctx.fillStyle = '#8fd39a'; ctx.fillRect(0, 150, 320, 50);
    ctx.fillStyle = '#f4d7a8'; ctx.fillRect(30, 80, 110, 80);
    ctx.fillStyle = '#c45c1a'; ctx.beginPath(); ctx.moveTo(20,80); ctx.lineTo(85,40); ctx.lineTo(150,80); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.fillRect(180, 110, 90, 50);
    ctx.font = '24px sans-serif'; ctx.fillText('🐾', 60, 130); ctx.fillText('🐱', 210, 140); ctx.fillText('🐶', 250, 140);
    if (typeof guy === 'function') guy(ctx, 160, 176, 12, '#3a86ff');
  }
  function shPetMesh(kind, color){
    const cols = ['#f29a3c','#3d4256','#ece6dd'];
    const c = cols[color|0] || cols[0];
    const g = new THREE.Group();
    const body = new THREE.Mesh(new THREE.SphereGeometry(0.35, 10, 8), shMat(c));
    body.position.y = 0.4; g.add(body);
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.22, 10, 8), shMat(c));
    head.position.set(0, 0.7, 0.18); g.add(head);
    return g;
  }
  function buildShelter(){
    const sv = shState();
    sh = {trash:[], solids:[], sv, strays:[], family: ShelterRules.shVisitFamily(Math.random), petMeshes:[], strayMeshes:[], curs:null};
    scene.background = new THREE.Color('#b8e8ff');
    if (scene.fog){ scene.fog.color.set('#cfefff'); scene.fog.near = 24; scene.fog.far = 90; }
    plat(0, 0, 8, 48, 48, '#8fd39a', 0.25);
    plat(0, 0, -10, 18, 16, '#f4e4c4', 0.3); // shelter floor
    // shelter building
    const wall = '#f4d7a8';
    function wallb(x,y,z,w,h,d,c){ const b=plat(x,y+h/2,z,w,d,c,h); if(b&&b.mesh) shKeep(b.mesh); if(b) sh.solids.push(b); return b; }
    wallb(0, 3, -18, 18, 6, 0.4, wall);
    wallb(-9, 3, -10, 0.4, 6, 16, wall);
    wallb(9, 3, -10, 0.4, 6, 16, wall);
    wallb(0, 6.2, -10, 18, 0.35, 16, '#fff4e0');
    wallb(-5, 3, -2, 8, 6, 0.4, wall);
    wallb(5, 3, -2, 8, 6, 0.4, wall);
    shMesh(new THREE.BoxGeometry(2.4, 0.2, 1.6), '#c45c1a', 0, 0.9, -8);
    sh.desk = {x:0, z:-8};
    // town street / park / alley
    plat(14, 0, 16, 10, 14, '#d9e8a8', 0.2);
    plat(-14, 0, 18, 8, 12, '#c8bea8', 0.2);
    shLab('🏡 Wagwell Shelter', 0, 3.4, -3);
    shLab('🌳 Park', 14, 2.2, 16);
    shLab('🪵 Alley', -14, 2.2, 18);
    shLab('🛎️ Front desk', 0, 2.2, -8);
    // Grooming salon
    plat(22, 0, -2, 14, 16, '#f8d0e8', 0.28);
    function wallb2(x,y,z,w,h,d,c){ const b=plat(x,y+h/2,z,w,d,c,h); if(b&&b.mesh) shKeep(b.mesh); if(b) sh.solids.push(b); return b; }
    wallb2(22, 3, -10, 14, 6, 0.4, '#ffd0ea');
    wallb2(15, 3, -2, 0.4, 6, 16, '#ffd0ea');
    wallb2(29, 3, -2, 0.4, 6, 16, '#ffd0ea');
    wallb2(22, 6.2, -2, 14, 0.35, 16, '#fff0f8');
    wallb2(18, 3, 6, 6, 6, 0.4, '#ffd0ea');
    wallb2(26, 3, 6, 6, 6, 0.4, '#ffd0ea');
    sh.salon = {x:22, z:-2};
    sh.stations = [
      {id:'wash', x:18, z:0, act:'wash', lab:'Wash'},
      {id:'brush', x:26, z:0, act:'brush', lab:'Brush'},
      {id:'trim', x:18, z:-4, act:'trim', lab:'Trim'},
      {id:'bow', x:26, z:-4, act:'bow', lab:'Bow'},
      {id:'dye', x:22, z:-6, act:'dye', lab:'Color'}
    ];
    sh.stations.forEach(s => {
      shMesh(new THREE.CylinderGeometry(0.7, 0.8, 0.6, 10), '#fff', s.x, 0.4, s.z);
      shLab('✂️ ' + s.lab, s.x, 1.6, s.z);
    });
    shLab('💇 Grooming Salon', 22, 3.2, 4);
    // Contest lawn and judge
    plat(-20, 0, -6, 14, 16, '#c8e8a8', 0.22);
    shMesh(new THREE.BoxGeometry(5, 0.3, 3.2), '#f4e8a8', -20, 0.4, -8);
    sh.stage = {x:-20, z:-8};
    const judge = shPetMesh('cat', 1);
    judge.position.set(-20, 0, -12); scene.add(judge); shKeep(judge);
    shLab('🏅 Judge Bramble', -20, 2.0, -12);
    shLab('🎀 Contest Lawn', -20, 3.0, -2);
    const amb = new THREE.AmbientLight(0xfff6e8, 0.75); scene.add(amb); shKeep(amb);
    const sun = new THREE.DirectionalLight(0xfff0c8, 0.6); sun.position.set(8, 14, 10); scene.add(sun); shKeep(sun);
    Object.assign(P, {x:0, y:0.5, z:6, vx:0, vy:0, vz:0});
    if (typeof cam !== 'undefined' && cam){ cam.yaw = 0; cam.pitch = 0.36; cam.dist = 13; }
    checkpoints[0] = {idx:0, spawn:{x:0,y:0.5,z:6}, flag:new THREE.Object3D()};
    shSpawnStrays();
    shShowPets();
    shBind();
    shHud();
    banner('🐾 Wagwell Shelter! Rescue strays around town, cheer them up, and match them with visiting families.');
  }
  function shLab(text,x,y,z){
    try { if (typeof t297Lab === 'function'){ const m=t297Lab(text,x,y,z); if(m) return shKeep(m); } } catch(e){}
    return shMesh(new THREE.BoxGeometry(0.2,0.2,0.2),'#fff',x,y,z);
  }
  function shSpawnStrays(){
    (sh.strayMeshes||[]).forEach(m => { try{ scene.remove(m); }catch(e){} });
    sh.strayMeshes = [];
    sh.strays = [];
    const n = 3;
    for (let i=0;i<n;i++){
      const s = ShelterRules.shRollStray(Math.random, Date.now()+i);
      s.x = (i-1)*8 + (Math.random()*3-1);
      s.z = 14 + Math.random()*8;
      sh.strays.push(s);
      const m = shPetMesh(s.kind, s.color);
      m.position.set(s.x, 0, s.z); scene.add(m); shKeep(m); sh.strayMeshes.push(m);
      shLab((ShelterRules.shKind(s.kind).emoji||'') + ' ' + s.name, s.x, 1.6, s.z);
    }
  }
  function shShowPets(){
    (sh.petMeshes||[]).forEach(m => { try{ scene.remove(m); }catch(e){} });
    sh.petMeshes = [];
    (sh.sv.pets||[]).forEach((p,i) => {
      const m = shPetMesh(p.kind, p.color);
      const x = -4 + (i%3)*4, z = -12 - Math.floor(i/3)*3;
      m.position.set(x, 0, z); scene.add(m); shKeep(m); sh.petMeshes.push(m);
      p._x=x; p._z=z;
      shLab((ShelterRules.shKind(p.kind).emoji||'')+' '+p.name, x, 1.6, z);
    });
  }
  function shNear(x,z,r){ return Math.hypot(P.x-x, P.z-z) < (r||2.2); }
  function shPrompt(){
    if (!sh) return null;
    const stray = sh.strays.find(s => shNear(s.x, s.z, 2.3));
    if (stray) return {lab:'Rescue ' + stray.name + ' (E / Ⓧ)', act:() => shRescue(stray)};
    const pet = (sh.sv.pets||[]).find(p => p._x != null && shNear(p._x, p._z, 2.2));
    if (pet){
      return {lab:'Care for ' + pet.name + ' (E feed · tap again)', act:() => shCareMenu(pet)};
    }
    if (sh.desk && shNear(sh.desk.x, sh.desk.z, 2.4)){
      return {lab:'Front desk: match or upgrades (E / Ⓧ)', act:() => shOpenDesk()};
    }
    const st = (sh.stations||[]).find(s => shNear(s.x, s.z, 2.1));
    if (st){
      const pet = shSalonPet();
      return {lab: pet ? (st.lab + ' ' + pet.name + ' (E / Ⓧ)') : 'Bring a pal to the salon (E / Ⓧ)', act:() => shSalonDo(st)};
    }
    if (sh.stage && shNear(sh.stage.x, sh.stage.z, 3)){
      const show = sh.show;
      if (show && show.open && !show.judged) return {lab:'Enter the ' + show.name + ' show (E / Ⓧ)', act:() => shEnter()};
      if (show && !show.judged && show.entries && show.entries.length) return {lab:'Ask Judge Bramble to score (E / Ⓧ)', act:() => shJudge()};
      return {lab:'Start a pet contest (E / Ⓧ)', act:() => shBeginShow()};
    }
    return null;
  }
  function shSalonPet(){
    if (!sh) return null;
    if (sh.curs) return (sh.sv.pets||[]).find(p => p.id === sh.curs) || (sh.sv.pets||[])[0];
    return (sh.sv.pets||[])[0] || null;
  }
  const SH_SALON_CHOICE = {
    trim: ['neat','fluffy','swirl'],
    bow: ['red','blue','gold'],
    dye: ['peach','mint','lilac','butter'],
    trick: ['sit','spin','bow','wave']
  };
  function shSalonDo(st){
    const pet = shSalonPet();
    if (!pet){ banner('Rescue a pal first, then walk them into the salon!'); return; }
    sh.curs = pet.id;
    let choice = undefined;
    if (SH_SALON_CHOICE[st.act]){
      sh.choiceI = ((sh.choiceI|0)+1) % SH_SALON_CHOICE[st.act].length;
      choice = SH_SALON_CHOICE[st.act][sh.choiceI];
    }
    const r = ShelterRules.shGroom(sh.sv, pet.id, st.act, choice);
    if (!r.ok){ banner('The salon is busy — try another station.'); return; }
    sh.sv = r.state; shSave(sh.sv);
    banner('💇 ' + pet.name + ' got a ' + st.lab.toLowerCase() + (choice ? (' (' + choice + ')') : '') + '! Happiness ' + ShelterRules.shHappiness(r.pet) + (r.well ? ' — looking show-ready!' : ''));
    shHud(); shNet();
  }
  function shBeginShow(){
    const ids = ShelterRules.SH_CONTESTS;
    sh.showI = ((sh.showI|0)+1) % ids.length;
    const mode = (typeof mp !== 'undefined' && mp && mp.on) ? 'versus' : 'solo';
    sh.show = ShelterRules.shNewShow(ids[sh.showI].id, Date.now(), mode);
    banner(ids[sh.showI].emoji + ' Judge Bramble opened the ' + ids[sh.showI].name + ' contest! ' + (mode === 'versus' ? 'Friends can enter too — no NPC rivals.' : 'Enter your pal for a ribbon.'));
    shHud(); shNet();
  }
  function shEnter(){
    const pet = shSalonPet();
    if (!pet){ banner('Cheer a pal up or groom them, then enter!'); return; }
    const me = {id: (typeof mp !== 'undefined' && mp && mp.me) ? mp.me : 'me', name: (typeof player !== 'undefined' && player && player.name) || 'You'};
    const r = ShelterRules.shEnterShow(sh.show, pet, me);
    banner(r.ok ? ('🎀 ' + pet.name + ' entered the ' + sh.show.name + ' show!') : (r.why === 'npc' ? 'Only real players can enter.' : r.why === 'in' ? 'That pal is already in.' : 'The show is not open.'));
    shHud(); shNet();
  }
  function shJudge(){
    if (!sh.show) return;
    const r = ShelterRules.shJudgeShow(sh.sv, sh.show);
    if (!r.ok){ banner(r.why === 'empty' ? 'Someone needs to enter first.' : 'Judge Bramble is waiting.'); return; }
    sh.sv = r.state; shSave(sh.sv); sh.show = r.show;
    if (r.coins) shPay(r.coins);
    const top = (r.show.entries || [])[0];
    banner('🏅 ' + r.message + (top ? (' ' + top.petName + ' got a ' + top.ribbon + ' ribbon!') : '') + ' +' + r.coins + ' 🪙');
    shHud(); shNet();
  }

  function shRescue(stray){
    const r = ShelterRules.shRescue(sh.sv, stray);
    if (!r.ok){ banner(r.why === 'full' ? 'The kennels are full — upgrade for more beds!' : 'Cannot rescue that pal right now.'); return; }
    sh.sv = r.state; shSave(sh.sv);
    sh.strays = sh.strays.filter(s => s !== stray);
    shSpawnStrays = shSpawnStrays;
    // remove that mesh later by rebuild
    banner('🐾 ' + r.pet.name + ' is safe at the shelter! Cheer them up before a family visit.');
    shShowPets();
    shHud(); shNet();
  }
  function shCareMenu(pet){
    sh.curs = pet.id;
    const order = ['fed','clean','play'];
    sh.careI = ((sh.careI|0)+1) % 3;
    const act = order[sh.careI];
    const r = ShelterRules.shCare(sh.sv, pet.id, act);
    if (!r.ok){ banner('That pal is already busy.'); return; }
    sh.sv = r.state; shSave(sh.sv);
    const words = {fed:'had a snack', clean:'got a bath', play:'played a game'};
    banner((r.ready ? '😊 ' : '🐾 ') + pet.name + ' ' + words[act] + '! Happiness ' + ShelterRules.shHappiness(r.pet) + (r.ready ? ' — ready for a home!' : ''));
    shHud(); shNet();
  }
  function shOpenDesk(){
    const fam = sh.family || ShelterRules.shVisitFamily(Math.random);
    sh.family = fam;
    const ready = (sh.sv.pets||[]).filter(p => ShelterRules.shReady(p));
    const wish = fam.emoji + ' ' + fam.name + ': "' + fam.line + '"';
    if (ready.length){
      const pet = ready.find(p => p.kind === fam.wishKind && p.trait === fam.wishTrait) || ready[0];
      const m = ShelterRules.shMatch(sh.sv, pet.id, fam.id);
      if (m.ok){
        sh.sv = m.state; shSave(sh.sv); shPay(m.coins);
        sh.family = ShelterRules.shVisitFamily(Math.random, []);
        banner('🏡 ' + m.message + ' +' + m.coins + ' 🪙');
        shShowPets(); shHud(); shNet(); return;
      }
    }
    banner(wish + (ready.length ? ' None of the ready pals match yet.' : ' Cheer a pal up, then come back!'));
    shHud();
  }
  function shSend(petId){
    let petsSave = null;
    try { petsSave = (typeof load === 'function') ? load('rubloxPets', {v:2, pets:[]}) : {v:2, pets:[]}; } catch(e){ petsSave = {v:2, pets:[]}; }
    const r = ShelterRules.shSendHome(sh.sv, petId, petsSave);
    if (!r.ok){ banner(r.why === 'full' ? 'Your pet collection is full (6 pals).' : r.why === 'happy' ? 'Cheer them up a bit more first.' : 'Not now.'); return; }
    sh.sv = r.state; shSave(sh.sv);
    try { if (typeof save === 'function') save('rubloxPets', r.pets); } catch(e){}
    banner('🏠 ' + (r.pet.n || 'Your pal') + ' went to your pet collection!');
    shShowPets(); shHud(); shNet();
  }
  function shBuy(id){
    const r = ShelterRules.shBuyUpgrade(sh.sv, id, shCoins());
    if (!r.ok){ banner(r.why === 'coins' ? 'Need more coins for that upgrade.' : r.why === 'have' ? 'You already have that!' : 'Not now.'); return; }
    if (!shSpend(r.cost)){ banner('Need more coins for that upgrade.'); return; }
    sh.sv = r.state; shSave(sh.sv);
    banner('✨ New shelter upgrade!');
    shHud(); shNet();
  }
  function shHud(){
    const hint = document.getElementById('shHint');
    if (hint && sh){
      const fam = sh.family;
      const show = sh.show;
      hint.textContent = '🐾 ' + (sh.sv.pets||[]).length + '/' + (sh.sv.ups.kennels?6:sh.sv.kennels||2) + ' pals  ·  rescued ' + (sh.sv.rescued||0) + '  ·  homes ' + (sh.sv.matched||0) + (sh.sv.trophies ? ('  ·  🏆 ' + sh.sv.trophies) : '') + (show ? ('  ·  ' + (show.emoji||'🎀') + ' ' + show.name) : '') + (fam ? ('  ·  ' + fam.name + ' want a ' + fam.wishTrait + ' ' + fam.wishKind) : '');
    }
    const btn = document.getElementById('shAct');
    const p = shPrompt();
    if (btn){ if (p){ btn.textContent = p.lab; btn.classList.add('show'); } else btn.classList.remove('show'); }
    const home = document.getElementById('shHomeBtn');
    const ready = sh && (sh.sv.pets||[]).find(p => ShelterRules.shReady(p));
    if (home){ if (ready){ home.classList.add('show'); home.textContent = '🏠 Send ' + ready.name + ' home'; } else home.classList.remove('show'); }
  }
  function shAct(){ const p = shPrompt(); if (p) p.act(); }
  function shKey(e){
    if (!sh) return false;
    if (e.type === 'keyup') return false;
    const c = e.code || e.key;
    if (c === 'KeyE' || c === 'KeyF'){ shAct(); return true; }
    if (c === 'KeyH'){ const ready=(sh.sv.pets||[]).find(p => ShelterRules.shReady(p)); if (ready) shSend(ready.id); return true; }
    if (c === 'KeyU'){ shBuy('kennels'); return true; }
    return false;
  }
  function shPad(jp){
    if (!sh || !jp) return false;
    if (!sh._x && jp[2]){ sh._x = true; shAct(); return true; }
    if (!jp[2]) sh._x = false;
    if (!sh._y && jp[3]){ sh._y = true; const ready=(sh.sv.pets||[]).find(p => ShelterRules.shReady(p)); if (ready) shSend(ready.id); return true; }
    if (!jp[3]) sh._y = false;
    return false;
  }
  function shUpdate(){ if (sh) shHud(); }
  function shIsGuest(){ try { return !!(typeof mp !== 'undefined' && mp && mp.on && !mp.host); } catch(e){ return false; } }
  function shWire(){ return sh ? ShelterRules.shWire(sh.sv, {family: sh.family, strays: sh.strays, show: sh.show}) : null; }
  function shApply(snap){
    if (!sh || !snap) return;
    if (Array.isArray(snap.pets)) sh.sv.pets = snap.pets;
    if (snap.family) sh.family = snap.family;
    if (snap.show) sh.show = snap.show;
    shHud();
  }
  function shNet(){
    if (shIsGuest() || !sh || typeof mp === 'undefined' || !mp || !mp.on || typeof mpSend !== 'function') return;
    try { mpSend({t:'sh', snap: shWire()}); } catch(e){}
  }
  function shFromNet(g, d){ if (d && d.snap) shApply(d.snap); }
  function shFromHost(d){ shFromNet(null, d); }
  function shBind(){
    const a=document.getElementById('shAct'); if(a && !a.__sh){ a.__sh=true; a.addEventListener('click', ev => { ev.preventDefault(); shAct(); }); }
    const h=document.getElementById('shHomeBtn'); if(h && !h.__sh){ h.__sh=true; h.addEventListener('click', ev => { ev.preventDefault(); const ready=(sh.sv.pets||[]).find(p => ShelterRules.shReady(p)); if (ready) shSend(ready.id); }); }
    const u=document.getElementById('shUpBtn'); if(u && !u.__sh){ u.__sh=true; u.addEventListener('click', ev => { ev.preventDefault(); shBuy('kennels'); }); }
  }
  function shelterStop(){
    if (!sh) return;
    (sh.solids||[]).forEach(b => { try{ b.active=false; if (typeof solids!=='undefined'){ const i=solids.indexOf(b); if(i>=0) solids.splice(i,1);} }catch(e){} });
    (sh.trash||[]).forEach(m => { try{ scene.remove(m);}catch(e){} });
    sh=null;
    const box=document.getElementById('shBox'); if(box) box.style.display='none';
    ['shAct','shHomeBtn','shUpBtn'].forEach(id => { const b=document.getElementById(id); if(b) b.classList.remove('show'); });
  }
  if (typeof window !== 'undefined') window.shDebug = {
    spawn(){ if (sh) shSpawnStrays(); },
    fill(){ if (!sh) return; (sh.sv.pets||[]).forEach(p => { p.fed=p.clean=p.play=90; p.happy=90; }); shSave(sh.sv); shHud(); },
    salon(){ if (!sh) return; P.x=22; P.y=0.5; P.z=-2; },
    contest(){ if (!sh) return; P.x=-20; P.y=0.5; P.z=-8; if (!sh.show) shBeginShow(); },
    probe(){ return sh ? {pets:(sh.sv.pets||[]).length, family: sh.family && sh.family.id, strays:(sh.strays||[]).length, show: sh.show && sh.show.id, salon:!!sh.salon} : null; }
  };
