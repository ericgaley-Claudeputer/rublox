  const T302_MODES = ['garden','meadow','rides','hive','camp'];
  const T302_OVERLAY_IDS = ['gardenShop','meadowBook','ridesPalette','hiveQuest','campCraft'];
  let gd = null, mw = null, rd = null, hv = null, cg = null;

  function t302MpOn(){ try { return !!(typeof mp !== 'undefined' && mp && mp.on); } catch (e){ return false; } }
  function t302Uid(){ try { if (t302MpOn() && mp.me) return String(mp.me); } catch (e){} return 'me'; }
  function t302Now(){ return Date.now(); }
  function t302Keep(st, m){ return (typeof t297Keep === 'function') ? t297Keep(st, m) : (m && st && st.trash && st.trash.push(m), m); }
  function t302Lab(text, x, y, z, bg){ const m = (typeof t297Lab === 'function') ? t297Lab(text, x, y, z, bg) : null; return m; }
  function t302Near(x, z, r){ return (typeof t297Near === 'function') ? t297Near(x, z, r) : (Math.hypot(P.x - x, P.z - z) <= (r == null ? 1.8 : r)); }
  function t302Note(ev, n){ try { if (typeof t297Note === 'function') t297Note(ev, n); else if (typeof qNoteHook === 'function') qNoteHook(ev, n == null ? 1 : n); } catch (e){} }
  function t302Ach(id){ try { if (typeof t297Ach === 'function') t297Ach(id); else if (typeof achNote === 'function') achNote(id); } catch (e){} }
  function t302Board(id, v){ try { if (typeof t297Board === 'function') t297Board(id, v); else if (typeof lbRecord === 'function') lbRecord(id, v); } catch (e){} }
  function t302Pay(n, label){ if (typeof t297Pay === 'function') t297Pay(n, label); else if (n > 0){ try { setCoins(coins + n); runCoins = (runCoins || 0) + n; } catch (e){} } }
  function t302Spend(n){ const c = (typeof coins === 'number') ? coins : 0; if (c < n) return false; try { setCoins(c - n); } catch (e){} return true; }
  function t302Coins(){ return (typeof coins === 'number') ? coins : 0; }
  function t302Save(key, obj){ if (typeof t297Save === 'function') t297Save(key, obj); else if (typeof save === 'function') save(key, obj); }
  function t302Load(key){ try { return typeof load === 'function' ? load(key, null) : null; } catch (e){ return null; } }
  function t302Send(msg){ try { if (t302MpOn() && typeof mpSend === 'function') mpSend(Object.assign({t:'t302'}, msg || {})); } catch (e){} }
  function t302Mat(color){ return new THREE.MeshLambertMaterial({color: color}); }
  function t302Mesh(geo, color, x, y, z, st){
    const m = new THREE.Mesh(geo, t302Mat(color));
    m.position.set(x, y, z);
    scene.add(m);
    if (st) t302Keep(st, m);
    return m;
  }
  function t302Hud(text, act){
    const hint = document.getElementById('t302Hint');
    if (hint) hint.textContent = text || '';
    const btn = document.getElementById('t302Act');
    if (btn){ if (act){ btn.textContent = act; btn.classList.add('show'); } else btn.classList.remove('show'); }
  }
  function t302Meter(show, amt, label){
    const el = document.getElementById('t302Meter');
    const fill = document.getElementById('t302MeterFill');
    const lab = document.getElementById('t302MeterLab');
    if (!el) return;
    if (!show){ el.classList.remove('show'); return; }
    el.classList.add('show');
    if (fill) fill.style.width = Math.round(Math.max(0, Math.min(1, amt || 0)) * 100) + '%';
    if (lab) lab.textContent = label || '';
  }
  function t302BindHud(){
    const act = document.getElementById('t302Act');
    if (act && !act.__t302){ act.__t302 = true; act.addEventListener('pointerdown', ev => { ev.preventDefault(); ev.stopPropagation(); t302Pointer(true, ev); }); act.addEventListener('pointerup', ev => { ev.preventDefault(); ev.stopPropagation(); t302Pointer(false, ev); }); act.addEventListener('click', ev => { ev.preventDefault(); ev.stopPropagation(); if (mode !== 'meadow') t302Act(); }); }
    ['gardenShopBtn','meadowBookBtn','ridesPaletteBtn','hiveQuestBtn','campCraftBtn'].forEach(id => {
      const el = document.getElementById(id);
      if (el && !el.__t302){ el.__t302 = true; el.onclick = ev => { ev.preventDefault(); ev.stopPropagation(); t302Open(id); }; }
    });
    if (!window.__t302Ptr){
      window.__t302Ptr = true;
      document.addEventListener('pointerdown', ev => {
        if (!running || mode !== 'meadow') return;
        if (ev.target && ev.target.closest && ev.target.closest('.t297overlay, button, a, input')) return;
        t302Pointer(true, ev);
      });
      document.addEventListener('pointerup', ev => {
        if (!running || mode !== 'meadow') return;
        t302Pointer(false, ev);
      });
    }
    t302BindOverlays();
  }
  function t302BindOverlays(){
    T302_OVERLAY_IDS.forEach(id => {
      const el = document.getElementById(id);
      if (!el || el.__t297Ov) return;
      el.__t297Ov = true;
      el.addEventListener('click', ev => {
        if (ev.target === el){ ev.preventDefault(); ev.stopPropagation(); if (typeof t297OverlayClose === 'function') t297OverlayClose(id); }
      });
      const x = el.querySelector('.t297x');
      if (x && !x.__t297OvX){
        x.__t297OvX = true;
        x.addEventListener('click', ev => { ev.preventDefault(); ev.stopPropagation(); if (typeof t297OverlayClose === 'function') t297OverlayClose(id); });
      }
    });
  }
  function t302Open(which){
    t302BindOverlays();
    const map = {gardenShopBtn:'gardenShop', meadowBookBtn:'meadowBook', ridesPaletteBtn:'ridesPalette', hiveQuestBtn:'hiveQuest', campCraftBtn:'campCraft'};
    const id = map[which] || which;
    if (id === 'gardenShop') gardenPaintShop();
    if (id === 'meadowBook') meadowPaintBook();
    if (id === 'ridesPalette') ridesPaintPalette();
    if (id === 'hiveQuest') hivePaintQuest();
    if (id === 'campCraft') campPaintCraft();
    if (typeof t297OverlayShow === 'function') t297OverlayShow(id, true);
  }
  function t302Box(on){
    const box = document.getElementById('t302Box');
    if (box) box.style.display = on ? '' : 'none';
    const ob = $('#obby');
    T302_MODES.forEach(m => ob.classList.toggle(m + 'mode', on && mode === m));
  }

  /* ---------- Sunny Patch Garden ---------- */
  function gardenState(){ const R = rootGarden(); return R ? R.gardenLoad(t302Load(R.GARDEN_KEY)) : null; }
  function rootGarden(){ return typeof GardenRules !== 'undefined' ? GardenRules : null; }
  function gardenPersist(s){ const R = rootGarden(); if (R) t302Save(R.GARDEN_KEY, s); if (gd) gd.sv = s; }

  function buildGarden(){
    const R = rootGarden();
    const sv = gardenState() || (R ? R.gardenFresh() : {plots:[], stand:[], pouch:{}});
    gd = {trash:[], sv, plots:[], plants:[], standM:[], near:null};
    scene.background = new THREE.Color('#b8e8ff');
    scene.fog = new THREE.Fog('#b8e8ff', 28, 90);
    plat(0, 0, 0, 28, 28, '#6fbf5a', 0.2);
    plat(0, 0.04, -2, 12, 12, '#8fbf6a', 0.04);
    const spots = [];
    for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++){
      const x = (c - 1) * 3.2, z = (r - 1) * 3.2 - 2;
      plat(x, 0.18, z, 2.4, 2.4, '#8d5524', 0.18);
      spots.push({id: r * 3 + c, x, z});
    }
    gd.plots = spots;
    // shop stall
    plat(8, 1.2, 6, 3.2, 2.2, '#c48a5a', 1.2);
    plat(8, 2.5, 6, 3.6, 2.6, '#c45c4a', 0.2);
    t302Lab('🌱 Seed Shop', 8, 3.2, 6);
    plat(8, 0.7, 8.2, 1.6, 0.8, '#6b3a1d', 0.7);
    gd.shop = {x:8, z:6};
    // prize stand
    plat(-8, 0.8, 6, 4.6, 1.8, '#d9b089', 0.8);
    gd.standPos = [-9.2, -8, -6.8].map((x, i) => {
      plat(x, 1.3, 6, 0.9, 0.9, '#f4e27a', 0.5);
      return {i, x, z:6};
    });
    t302Lab('🏆 Prize Stand', -8, 2.6, 6);
    // fence posts
    for (let i = -12; i <= 12; i += 3){
      t302Mesh(new THREE.BoxGeometry(0.2, 1.2, 0.2), '#6b3a1d', i, 0.6, -13, gd);
      t302Mesh(new THREE.BoxGeometry(0.2, 1.2, 0.2), '#6b3a1d', i, 0.6, 13, gd);
    }
    t302Lab('🌻 Sunny Patch Garden', 0, 3.4, 8);
    gd.plots.forEach(p => gardenGrowMesh(p));
    gardenPaintStand();
    checkpoints[0] = {idx:0, spawn:{x:0,y:0.5,z:8}, flag:new THREE.Object3D()};
  }
  function gardenGrowMesh(p){
    if (p.mesh){ p.mesh.forEach(m => { scene.remove(m); }); p.mesh = []; }
    const plot = gd.sv.plots[p.id];
    const st = (typeof GardenRules !== 'undefined') ? GardenRules.gardenStage(plot, t302Now()) : 0;
    if (!st || !plot || !plot.seed) return;
    const seed = GardenRules.gardenSeed(plot.seed);
    const col = seed ? seed.color : '#7ad46a';
    const h = st === 1 ? 0.5 : st === 2 ? 1.1 : 1.7;
    const stem = t302Mesh(new THREE.CylinderGeometry(0.06, 0.08, h, 6), '#2f8f4a', p.x, 0.2 + h/2, p.z, gd);
    const top = t302Mesh(st === 3 ? new THREE.SphereGeometry(0.42, 8, 6) : new THREE.ConeGeometry(0.28, 0.5, 6), col, p.x, 0.2 + h + 0.2, p.z, gd);
    p.mesh = [stem, top];
    p.stage = st;
  }
  function gardenPaintStand(){
    (gd.standM || []).forEach(m => scene.remove(m));
    gd.standM = [];
    (gd.sv.stand || []).forEach((sid, i) => {
      if (!sid) return;
      const seed = GardenRules.gardenSeed(sid);
      const pos = gd.standPos[i];
      if (!pos || !seed) return;
      const m = t302Mesh(new THREE.SphereGeometry(0.38, 8, 6), seed.color, pos.x, 1.8, pos.z, gd);
      gd.standM.push(m);
      gd.standM.push(t302Lab(seed.emoji + ' ' + seed.name, pos.x, 2.4, pos.z));
    });
  }
  function gardenEnter(){
    if (!gd) return;
    cam.pitch = 0.42; cam.dist = 14;
    t302Note('play:garden'); t302Ach('garden-visit');
    t302BindHud();
    banner('🌱 Welcome to Sunny Patch Garden! Buy silly seeds, plant them, and come back later — they keep growing.');
    t302Hud('Walk to a bed or the shop. E / Ⓧ plants, harvests, or opens the shop.', '🌱 Plant');
  }
  function gardenPaintShop(){
    const box = document.getElementById('gardenShopList');
    if (!box || !gd) return;
    const R = GardenRules;
    box.innerHTML = R.GARDEN_SEEDS.map(s => {
      const n = (gd.sv.pouch[s.id] | 0);
      return `<div class="t297row"><span>${s.emoji} ${s.name} — ${s.cost} 🪙, sells for ${s.sell} 🪙 · in pouch ${n}</span><button type="button" data-gseed="${s.id}">Buy</button></div>`;
    }).join('') + `<div class="t297row"><span>🧺 Basket: ${(gd.sv.basket||[]).length}  ·  earned ${gd.sv.earned|0} 🪙</span><button type="button" data-gsell="1">Sell one</button></div>`;
    box.querySelectorAll('[data-gseed]').forEach(btn => { btn.onclick = ev => { ev.preventDefault(); gardenBuy(btn.getAttribute('data-gseed')); }; });
    const sell = box.querySelector('[data-gsell]');
    if (sell) sell.onclick = ev => { ev.preventDefault(); gardenDoSell(); };
  }
  function gardenBuy(id){
    const r = GardenRules.gardenBuy(gd.sv, id, t302Coins());
    if (!r.ok){ banner(r.why === 'coins' ? 'Need more coins for that seed.' : 'Could not buy that seed.'); return; }
    try { setCoins(r.coins); } catch (e){}
    gardenPersist(r.state);
    gardenPaintShop();
    banner('Bought a ' + r.seed.name + ' seed!');
  }
  function gardenDoSell(){
    const r = GardenRules.gardenSell(gd.sv);
    if (!r.ok){ banner('Nothing in the basket to sell yet. Harvest a ripe plant first!'); return; }
    gardenPersist(r.state);
    t302Pay(r.pay, r.item.emoji + ' Sold ' + r.item.name);
    t302Note('garden-sell'); t302Board('garden-sold', r.state.sold);
    gardenPaintShop();
  }
  function gardenAct(){
    if (!gd) return false;
    if (gd.near && gd.near.kind === 'shop'){ t302Open('gardenShop'); return true; }
    if (gd.near && gd.near.kind === 'stand'){
      if (!(gd.sv.basket || []).length){ banner('Harvest a prize plant first, then show it here.'); return true; }
      const slot = gd.near.slot;
      const r = GardenRules.gardenShow(gd.sv, slot);
      if (r.ok){ gardenPersist(r.state); gardenPaintStand(); t302Ach('garden-stand'); banner('🏆 Shown on the prize stand!'); }
      return true;
    }
    if (gd.near && gd.near.kind === 'plot'){
      const plot = gd.sv.plots[gd.near.id];
      if (GardenRules.gardenReady(plot, t302Now())){
        const r = GardenRules.gardenHarvest(gd.sv, gd.near.id, t302Now());
        if (r.ok){
          gardenPersist(r.state);
          gardenGrowMesh(gd.plots[gd.near.id]);
          t302Note('garden-harvest'); t302Ach('garden-harvest'); t302Board('garden-harvested', r.state.harvested);
          banner(r.item.emoji + ' Harvested ' + r.item.name + '! Sell it or show it on the stand.');
        }
        return true;
      }
      if (plot && plot.seed){ banner('This plant is still growing. It keeps growing even while you are away!'); return true; }
      const seedId = GardenRules.GARDEN_SEEDS.map(s => s.id).find(id => (gd.sv.pouch[id] | 0) > 0);
      if (!seedId){ t302Open('gardenShop'); banner('Buy a seed at the shop first!'); return true; }
      const r = GardenRules.gardenPlant(gd.sv, gd.near.id, seedId, t302Now(), t302Coins());
      if (r.ok){
        gardenPersist(r.state);
        gardenGrowMesh(gd.plots[gd.near.id]);
        t302Note('garden-plant'); t302Ach('garden-plant');
        banner('Planted a ' + r.seed.name + '! Come back later — it grows in real time.');
      }
      return true;
    }
    return false;
  }
  function gardenUpdate(){
    if (!gd) return;
    gd.plots.forEach(p => {
      const st = GardenRules.gardenStage(gd.sv.plots[p.id], t302Now());
      if (st !== p.stage) gardenGrowMesh(p);
    });
    let near = null;
    if (t302Near(gd.shop.x, gd.shop.z, 2.4)) near = {kind:'shop'};
    gd.standPos.forEach(s => { if (t302Near(s.x, s.z, 1.6)) near = {kind:'stand', slot:s.i}; });
    gd.plots.forEach(p => { if (t302Near(p.x, p.z, 1.5)) near = {kind:'plot', id:p.id}; });
    gd.near = near;
    if (near && near.kind === 'shop') t302Hud('E / Ⓧ — open the seed shop  (Esc, B, or walk away to close)', '🛒 Shop');
    else if (near && near.kind === 'stand') t302Hud('E / Ⓧ — show a prize plant on this stand', '🏆 Show');
    else if (near && near.kind === 'plot'){
      const plot = gd.sv.plots[near.id];
      if (GardenRules.gardenReady(plot, t302Now())) t302Hud('This plant is ready! E / Ⓧ to harvest.', '🧺 Harvest');
      else if (plot && plot.seed) t302Hud('Growing… it keeps going even while you are away.', '');
      else t302Hud('E / Ⓧ to plant a seed from your pouch.', '🌱 Plant');
    } else t302Hud('Walk to a bed, the shop, or the prize stand.', '');
  }

  /* ---------- Chow Chuck Meadow ---------- */
  function meadowState(){ return MeadowRules.meadowLoad(t302Load(MeadowRules.MEADOW_KEY)); }
  function meadowPersist(s){ t302Save(MeadowRules.MEADOW_KEY, s); if (mw) mw.sv = s; }

  function buildMeadow(){
    const sv = meadowState();
    mw = {trash:[], sv, fields:[], animals:{}, snacks:[], charging:false, charge:0, hold:false, near:null};
    scene.background = new THREE.Color('#9ee0ff');
    scene.fog = new THREE.Fog('#9ee0ff', 36, 110);
    plat(0, 0, 20, 40, 80, '#7dce6a', 0.2);
    plat(0, 0.04, -2, 8, 8, '#8fbf6a', 0.04);
    t302Lab('🥣 Chow Chuck Meadow', 0, 3.2, 4);
    plat(-6, 0.8, 2, 2.4, 2.4, '#c48a5a', 0.8);
    t302Lab('📖 Meadow Book', -6, 2.4, 2);
    mw.book = {x:-6, z:2};
    plat(6, 0.7, 2, 2.2, 2.2, '#d9b089', 0.7);
    t302Lab('💪 Training Post', 6, 2.3, 2);
    mw.train = {x:6, z:2};
    MeadowRules.MEADOW_FIELDS.forEach((f, i) => {
      const z = 12 + i * 12;
      const x = (i % 2 === 0) ? -4 : 5;
      plat(x, 0.08, z, 8, 8, '#6fbf5a', 0.08);
      t302Lab(f.name, x, 2.6, z - 3);
      const a = MeadowRules.meadowAnimal(f.animal);
      const body = t302Mesh(new THREE.SphereGeometry(0.7, 8, 6), a.color, x, 0.9, z, mw);
      const ear = t302Mesh(new THREE.SphereGeometry(0.22, 6, 5), a.color, x + 0.4, 1.5, z, mw);
      t302Lab(a.emoji + ' ' + a.name, x, 2.2, z);
      mw.fields.push({f, x, z, body, ear});
      mw.animals[a.id] = {x, z, body, ear};
    });
    checkpoints[0] = {idx:0, spawn:{x:0,y:0.5,z:6}, flag:new THREE.Object3D()};
  }
  function meadowEnter(){
    if (!mw) return;
    cam.pitch = 0.36; cam.dist = 14;
    if ((mw.sv.snacks | 0) < 6) { mw.sv = MeadowRules.meadowRestock(mw.sv, 8); meadowPersist(mw.sv); }
    t302Note('play:meadow'); t302Ach('meadow-visit');
    t302BindHud();
    banner('🥣 Chow Chuck Meadow! Hold to charge a snack toss, then let go. Farther throws meet new friends. Their book is yours alone.');
    t302Hud('Hold E, tap, click, or A / RT to charge. Release to throw. Face the fields to aim.', '🥣 Charge');
  }
  function meadowPaintBook(){
    const box = document.getElementById('meadowBookList');
    if (!box || !mw) return;
    box.innerHTML = MeadowRules.meadowBook(mw.sv).map(a => {
      const mark = a.found ? 'found!' : 'still out in the ' + (a.field ? a.field.name : 'fields');
      return `<div class="t297row${a.found ? '' : ' dim'}"><span>${a.emoji} ${a.name}</span><span>${mark}</span></div>`;
    }).join('') + `<div class="t297row"><span>💪 Throw power ${MeadowRules.meadowPower(mw.sv)}  ·  best ${mw.sv.best || 0}  ·  snacks ${mw.sv.snacks}</span></div>`;
  }
  function meadowAim(){
    const yaw = (typeof P !== 'undefined' && P && P.face != null) ? P.face : (cam ? cam.yaw + Math.PI : 0);
    return {x: Math.sin(yaw), z: Math.cos(yaw), yaw};
  }
  function meadowBeginCharge(){
    if (!mw || mw.charging) return;
    if ((mw.sv.snacks | 0) <= 0){ mw.sv = MeadowRules.meadowRestock(mw.sv, 6); meadowPersist(mw.sv); }
    mw.charging = true; mw.charge = 0.08; mw.hold = true;
  }
  function meadowRelease(){
    if (!mw || !mw.charging) return;
    const charge = mw.charge;
    mw.charging = false; mw.hold = false; mw.charge = 0;
    t302Meter(false);
    const r = MeadowRules.meadowThrow(mw.sv, charge, t302Uid(), null);
    if (!r.ok){ banner(r.why === 'owned' ? "That's a friend's pal — we never take anyone's animals." : 'Need a snack and a little charge!'); return; }
    meadowPersist(r.state);
    meadowLaunch(charge, r);
    t302Note('meadow-throw'); t302Ach('meadow-throw');
    t302Board('meadow-best', r.state.best);
    if (r.foundNew){ t302Ach('meadow-friend'); t302Note('meadow-friend'); banner(r.animal.emoji + ' You met ' + r.animal.name + ' in ' + r.field.name + '!'); }
    else if (r.animal) banner('Tossed a snack ' + r.dist.toFixed(1) + ' steps to ' + r.animal.name + '!');
    else banner('Tossed a snack ' + r.dist.toFixed(1) + ' steps. Charge longer or train for farther fields!');
    t302Send({a:'toss', d:r.dist});
  }
  function meadowLaunch(charge, r){
    const aim = meadowAim();
    const dist = r.dist;
    const snack = t302Mesh(new THREE.SphereGeometry(0.22, 8, 6), '#f4c84a', P.x, 1.2, P.z, mw);
    mw.snacks.push({m:snack, t:0, life:0.9, x:P.x, z:P.z, dx:aim.x * dist, dz:aim.z * dist});
  }
  function meadowAct(){ if (!mw) return false; if (mw.near === 'book'){ t302Open('meadowBook'); return true; } if (mw.near === 'train'){ const r = MeadowRules.meadowTrain(mw.sv); if (r.ok){ meadowPersist(r.state); t302Ach('meadow-train'); banner('💪 Training paid off! Throws now go up to ' + r.power + ' steps.'); } else banner('You are already as strong as the training post allows!'); return true; } return false; }
  function meadowPointer(down){ if (down) meadowBeginCharge(); else if (mw && mw.charging) meadowRelease(); }
  function meadowUpdate(dt){
    if (!mw) return;
    if (mw.charging){
      mw.charge = Math.min(1, mw.charge + dt * 0.7);
      t302Meter(true, mw.charge, 'Power ' + Math.round(mw.charge * 100) + '%  ·  ' + (MeadowRules.meadowPower(mw.sv) * mw.charge).toFixed(1) + ' steps');
    }
    mw.fields.forEach((f, i) => {
      const bob = Math.sin(time * 2 + i) * 0.08;
      if (f.body) f.body.position.y = 0.9 + bob;
      if (f.ear) f.ear.position.y = 1.5 + bob;
    });
    mw.snacks = (mw.snacks || []).filter(s => {
      s.t += dt;
      const k = Math.min(1, s.t / s.life);
      s.m.position.set(s.x + s.dx * k, 1.2 + Math.sin(k * Math.PI) * 3, s.z + s.dz * k);
      if (s.t >= s.life){ scene.remove(s.m); return false; }
      return true;
    });
    let near = null;
    if (t302Near(mw.book.x, mw.book.z, 2)) near = 'book';
    if (t302Near(mw.train.x, mw.train.z, 2)) near = 'train';
    mw.near = near;
    if (near === 'book') t302Hud('E / Ⓧ — open your meadow book. Friends share the meadow, but this book is yours.', '📖 Book');
    else if (near === 'train') t302Hud('E / Ⓧ — train for stronger throws.', '💪 Train');
    else t302Hud('Hold E, tap, click, or A / RT to charge a snack. Release to throw. Face a field to aim.', mw.charging ? '🥣 Throw!' : '🥣 Charge');
  }
  function meadowKey(e){
    if (e.code === 'KeyE' || e.code === 'KeyF' || e.key === 'e' || e.key === 'f'){
      if (mw.near){ meadowAct(); return true; }
      if (e.type === 'keyup'){ if (mw.charging) meadowRelease(); return true; }
      meadowBeginCharge(); return true;
    }
    return false;
  }
  function meadowPad(jp, s){
    const rt = !!(jp && (jp[7] || jp.rt)) || !!(s && ((s.v && s.v[7] > 0.5) || s.rt));
    const a = !!(jp && jp[0]);
    const hold = rt || a;
    if (hold){ if (typeof pad !== 'undefined') pad.jump = false; meadowBeginCharge(); return true; }
    if (mw && mw.charging && !hold){ meadowRelease(); return true; }
    if (jp && (jp[2] || jp[3])){ meadowAct(); return true; }
    return false;
  }

  /* ---------- Rideland Workshop ---------- */
  function ridesState(){ return RidesRules.ridesLoad(t302Load(RidesRules.RIDES_KEY)); }
  function ridesPersist(s){ t302Save(RidesRules.RIDES_KEY, s); if (rd) rd.sv = s; }

  function buildRides(){
    const sv = ridesState();
    rd = {trash:[], sv, meshes:{}, boarding:null, t:0, near:null};
    scene.background = new THREE.Color('#8fd3ff');
    scene.fog = new THREE.Fog('#8fd3ff', 32, 100);
    plat(0, 0, 0, 32, 32, '#9aa3ad', 0.2);
    plat(0, 0.03, 0, 24, 24, '#d9d4c8', 0.03);
    // grid lines
    for (let i = 0; i <= RidesRules.RIDES_GRID; i++){
      const w = RidesRules.ridesWorld(i, 0);
      const w2 = RidesRules.ridesWorld(i, RidesRules.RIDES_GRID - 1);
      // skip heavy lines; faint plats instead
    }
    plat(0, 1.1, 14, 4, 2.4, '#ff9f1c', 1.1);
    t302Lab('🎟️ Ride Kit', 0, 2.6, 14);
    rd.kit = {x:0, z:14};
    t302Lab('🎢 Rideland Workshop', 0, 3.6, -14);
    sv.pieces.forEach(p => ridesBuildPiece(p));
    checkpoints[0] = {idx:0, spawn:{x:0,y:0.5,z:12}, flag:new THREE.Object3D()};
  }
  function ridesBuildPiece(p){
    const k = RidesRules.ridesKind(p.kind);
    const w = RidesRules.ridesWorld(p.gx, p.gz);
    const g = new THREE.Group();
    g.position.set(w.x, 0, w.z);
    g.rotation.y = (p.rot || 0) * Math.PI / 2;
    const col = k.color;
    if (p.kind === 'carousel'){
      const base = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 1.8, 0.3, 12), t302Mat('#fff8ee')); base.position.y = 0.2; g.add(base);
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 3, 8), t302Mat(col)); pole.position.y = 1.7; g.add(pole);
      const top = new THREE.Mesh(new THREE.ConeGeometry(2, 1, 10), t302Mat('#ff4d5e')); top.position.y = 3.3; g.add(top);
      for (let i = 0; i < 4; i++){
        const horse = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.5, 0.7), t302Mat('#fff'));
        const a = i * Math.PI / 2;
        horse.position.set(Math.cos(a) * 1.1, 0.9, Math.sin(a) * 1.1);
        g.add(horse);
      }
    } else if (p.kind === 'swings'){
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 4, 8), t302Mat('#3a86ff')); pole.position.y = 2; g.add(pole);
      const bar = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.12, 0.12), t302Mat('#1d2340')); bar.position.y = 3.8; g.add(bar);
      const seat1 = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.12, 0.4), t302Mat('#ffd23f')); seat1.position.set(-1.2, 1.2, 0); g.add(seat1);
      const seat2 = seat1.clone(); seat2.position.x = 1.2; g.add(seat2);
    } else if (p.kind === 'drop'){
      const tower = new THREE.Mesh(new THREE.BoxGeometry(0.8, 6, 0.8), t302Mat('#8b5cf6')); tower.position.y = 3; g.add(tower);
      const car = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.5, 1.4), t302Mat('#c4b5fd')); car.position.y = 1.2; car.name = 'car'; g.add(car);
    } else if (p.kind === 'cups'){
      const base = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.6, 0.25, 12), t302Mat('#fff')); base.position.y = 0.2; g.add(base);
      for (let i = 0; i < 3; i++){
        const a = i * Math.PI * 2 / 3;
        const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.3, 0.5, 10), t302Mat(i === 1 ? '#3a86ff' : col));
        cup.position.set(Math.cos(a) * 0.9, 0.55, Math.sin(a) * 0.9);
        g.add(cup);
      }
    } else {
      const rail = new THREE.Mesh(new THREE.BoxGeometry(p.kind === 'curve' ? 2.2 : 3, 0.25, 0.6), t302Mat('#1d2340'));
      rail.position.y = 0.6;
      if (p.kind === 'curve') rail.rotation.y = Math.PI / 4;
      g.add(rail);
      const tie = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.2, 1.1), t302Mat('#8d5524')); tie.position.y = 0.4; g.add(tie);
    }
    scene.add(g);
    t302Keep(rd, g);
    rd.meshes[p.id] = g;
  }
  function ridesClearMeshes(){
    Object.values(rd.meshes || {}).forEach(m => scene.remove(m));
    rd.meshes = {};
  }
  function ridesRebuild(){
    ridesClearMeshes();
    rd.sv.pieces.forEach(p => ridesBuildPiece(p));
  }
  function ridesEnter(){
    if (!rd) return;
    cam.pitch = 0.46; cam.dist = 16;
    t302Note('play:rides'); t302Ach('rides-visit');
    t302BindHud();
    banner('🎢 Rideland Workshop! Cycle ride pieces with Q or LB/RB, E / Ⓧ to place or ride. Friends can hop on too.');
    t302Hud('Q or LB/RB cycles pieces. E / Ⓧ places or rides. R / Ⓨ rotates.', '🎢 Place');
  }
  function ridesPaintPalette(){
    const box = document.getElementById('ridesPaletteList');
    if (!box || !rd) return;
    box.innerHTML = RidesRules.RIDES_KINDS.map(k => {
      const on = rd.sv.kind === k.id;
      return `<div class="t297row${on ? '' : ''}"><span>${k.emoji} ${k.name}${on ? '  ← selected' : ''}</span><button type="button" data-rk="${k.id}">Pick</button></div>`;
    }).join('') + `<p>Q or bumpers cycle pieces. R / Ⓨ rotates. You can ride anything you or a friend placed. Coaster cars need a closed loop of track.</p>`;
    box.querySelectorAll('[data-rk]').forEach(btn => { btn.onclick = ev => { ev.preventDefault(); rd.sv.kind = btn.getAttribute('data-rk'); ridesPersist(rd.sv); ridesPaintPalette(); banner('Selected ' + RidesRules.ridesKind(rd.sv.kind).name); }; });
  }
  function ridesCellAt(x, z){
    const o = (RidesRules.RIDES_GRID * RidesRules.RIDES_CELL) / 2 - RidesRules.RIDES_CELL / 2;
    const gx = Math.round((x + o) / RidesRules.RIDES_CELL);
    const gz = Math.round((z + o) / RidesRules.RIDES_CELL);
    if (gx < 0 || gz < 0 || gx >= RidesRules.RIDES_GRID || gz >= RidesRules.RIDES_GRID) return null;
    return {gx, gz};
  }
  function ridesAct(){
    if (!rd) return false;
    if (rd.boarding){ ridesDismount(); return true; }
    if (rd.near === 'kit'){ t302Open('ridesPalette'); return true; }
    const cell = ridesCellAt(P.x, P.z);
    if (!cell) return false;
    const piece = RidesRules.ridesAt(rd.sv, cell.gx, cell.gz);
    if (piece){
      const r = RidesRules.ridesBoard(rd.sv, piece.id, t302Uid());
      if (!r.ok){ banner(r.why === 'noloop' ? 'Connect more track into a loop before riding the coaster!' : 'Cannot ride that yet.'); return true; }
      ridesPersist(r.state);
      rd.boarding = {id: piece.id, t:0, kind: piece.kind};
      t302Note('rides-ride'); t302Ach('rides-ride'); t302Board('rides-rides', r.state.rides);
      t302Send({a:'board', id: piece.id});
      banner('Whoosh! Riding the ' + RidesRules.ridesKind(piece.kind).name + '. E / Ⓧ to hop off.');
      return true;
    }
    const r = RidesRules.ridesPlace(rd.sv, rd.sv.kind, cell.gx, cell.gz, rd.sv.rot, t302Uid());
    if (!r.ok){ banner('That spot is full or the piece does not fit. Try another square.'); return true; }
    ridesPersist(r.state);
    ridesBuildPiece(r.piece);
    t302Note('rides-place'); t302Ach('rides-place'); t302Board('rides-placed', r.state.placed);
    t302Send({a:'place', piece:r.piece});
    banner('Placed a ' + RidesRules.ridesKind(r.piece.kind).name + '!');
    return true;
  }
  function ridesDismount(){
    if (!rd || !rd.boarding) return;
    const g = rd.meshes[rd.boarding.id];
    if (g){ const w = g.position; P.x = w.x; P.z = w.z + 2; P.y = 0.5; }
    rd.boarding = null;
    banner('Hopped off the ride.');
  }
  function ridesUpdate(dt){
    if (!rd) return;
    rd.t += dt;
    rd.sv.pieces.forEach(p => {
      const g = rd.meshes[p.id];
      if (!g) return;
      if (p.kind === 'carousel' || p.kind === 'cups') g.rotation.y += dt * (p.kind === 'cups' ? 1.6 : 0.8);
      if (p.kind === 'swings') g.rotation.z = Math.sin(rd.t * 1.6) * 0.25;
      if (p.kind === 'drop'){
        const car = g.getObjectByName('car');
        if (car) car.position.y = 1.2 + (0.5 + 0.5 * Math.sin(rd.t * 1.4)) * 4.2;
      }
    });
    if (rd.boarding){
      const p = rd.sv.pieces.find(x => x.id === rd.boarding.id);
      const g = p && rd.meshes[p.id];
      if (g){
        rd.boarding.t += dt;
        if (p.kind === 'track' || p.kind === 'curve'){
          const loop = rd.sv.pieces.filter(x => x.kind === 'track' || x.kind === 'curve');
          const i = Math.floor(rd.boarding.t * 1.4) % Math.max(1, loop.length);
          const w = RidesRules.ridesWorld(loop[i].gx, loop[i].gz);
          P.x = w.x; P.z = w.z; P.y = 1.4; P.vy = 0;
        } else {
          P.x = g.position.x; P.z = g.position.z; P.y = 1.6; P.vy = 0;
        }
      }
    }
    let near = null;
    if (t302Near(rd.kit.x, rd.kit.z, 2.4)) near = 'kit';
    rd.near = near;
    const cell = ridesCellAt(P.x, P.z);
    const piece = cell ? RidesRules.ridesAt(rd.sv, cell.gx, cell.gz) : null;
    const kind = RidesRules.ridesKind(rd.sv.kind);
    if (rd.boarding) t302Hud('Riding! E / Ⓧ or Ⓑ to hop off.', ' Hop off');
    else if (near === 'kit') t302Hud('E / Ⓧ — open the ride kit. Q or bumpers also cycle pieces.', '🎟️ Kit');
    else if (piece) t302Hud('E / Ⓧ — ride the ' + RidesRules.ridesKind(piece.kind).name + '. Friends may ride too!', '🎢 Ride');
    else t302Hud((kind ? kind.emoji + ' ' + kind.name : 'Piece') + ' ready. E / Ⓧ to place. Q cycles, R rotates.', '🧱 Place');
  }
  function ridesKey(e){
    if (e.code === 'KeyQ'){ const r = RidesRules.ridesCycleKind(rd.sv, e.shiftKey ? -1 : 1); ridesPersist(r.state); banner(r.kind.emoji + ' ' + r.kind.name); return true; }
    if (e.code === 'KeyR'){ const r = RidesRules.ridesRotate(rd.sv, 1); ridesPersist(r.state); banner('Rotated.'); return true; }
    if (e.code === 'KeyE' || e.code === 'KeyF' || e.key === 'e' || e.key === 'f'){ ridesAct(); return true; }
    if (e.code === 'KeyX' && rd.boarding){ ridesDismount(); return true; }
    return false;
  }
  function ridesPad(jp){
    if (jp[4]){ const r = RidesRules.ridesCycleKind(rd.sv, -1); ridesPersist(r.state); banner(r.kind.emoji + ' ' + r.kind.name); return true; }
    if (jp[5]){ const r = RidesRules.ridesCycleKind(rd.sv, 1); ridesPersist(r.state); banner(r.kind.emoji + ' ' + r.kind.name); return true; }
    if (jp[3]){ const r = RidesRules.ridesRotate(rd.sv, 1); ridesPersist(r.state); return true; }
    if (jp[0] || jp[2] || jp[7]){ if (typeof pad !== 'undefined') pad.jump = false; ridesAct(); return true; }
    return false;
  }

  /* ---------- Honeyhill Hive ---------- */
  function hiveState(){ return HiveRules.hiveLoad(t302Load(HiveRules.HIVE_KEY)); }
  function hivePersist(s){ t302Save(HiveRules.HIVE_KEY, s); if (hv) hv.sv = s; }

  function buildHive(){
    const sv = hiveState();
    hv = {trash:[], sv, flowers:[], bees:[], bears:[], near:null, cool:{}};
    scene.background = new THREE.Color('#c8f0ff');
    scene.fog = new THREE.Fog('#c8f0ff', 30, 95);
    plat(0, 0, 0, 36, 36, '#7dce6a', 0.2);
    // hive
    const hive = t302Mesh(new THREE.ConeGeometry(1.4, 2.4, 8), '#f4c84a', 0, 1.3, 0, hv);
    t302Mesh(new THREE.CylinderGeometry(0.8, 1.1, 1.2, 8), '#e0a020', 0, 0.7, 0, hv);
    t302Lab('🍯 Home Hive', 0, 3.2, 0);
    hv.hive = {x:0, z:0};
    const trailPos = {meadow:[[-8,6],[-5,9],[-10,10],[ -7,13]], brook:[[8,6],[11,9],[8,12],[12,14]], glade:[[-4,-10],[0,-13],[4,-10],[2,-16]]};
    HiveRules.HIVE_FLOWERS.forEach((f, i) => {
      const spots = trailPos[f.trail] || [];
      const pos = spots[i % spots.length] || [0, 8];
      const bloom = t302Mesh(new THREE.SphereGeometry(0.45, 8, 6), f.color, pos[0], 0.6, pos[1], hv);
      t302Mesh(new THREE.CylinderGeometry(0.06, 0.08, 0.6, 6), '#2f8f4a', pos[0], 0.3, pos[1], hv);
      hv.flowers.push({f, x:pos[0], z:pos[1], m:bloom, locked: !HiveRules.hiveTrailOpen(sv, f.trail)});
    });
    t302Lab('🌸 Clover Trail', -8, 2.4, 5);
    if (HiveRules.hiveTrailOpen(sv, 'brook')) t302Lab('💧 Brook Trail', 9, 2.4, 5);
    else t302Lab('🔒 Brook Trail (help a bear!)', 9, 2.4, 5);
    if (HiveRules.hiveTrailOpen(sv, 'glade')) t302Lab('✨ Lantern Glade', 0, 2.4, -9);
    else t302Lab('🔒 Lantern Glade (help a bear!)', 0, 2.4, -9);
    // bears only in solo
    hv.solo = !t302MpOn();
    if (hv.solo){
      const dens = [{id:'berry-bear', x:-12, z:2, color:'#8d5524'}, {id:'clover-bear', x:12, z:2, color:'#c48a5a'}, {id:'honey-bear', x:0, z:14, color:'#d4a017'}];
      dens.forEach(d => {
        const b = HiveRules.hiveBear(d.id);
        const body = t302Mesh(new THREE.SphereGeometry(0.7, 8, 6), d.color, d.x, 0.9, d.z, hv);
        t302Mesh(new THREE.SphereGeometry(0.45, 8, 6), d.color, d.x, 1.7, d.z, hv);
        t302Lab(b.emoji + ' ' + b.name, d.x, 2.6, d.z);
        hv.bears.push({id:d.id, x:d.x, z:d.z, m:body, b});
      });
    }
    for (let i = 0; i < sv.bees; i++){
      const bee = t302Mesh(new THREE.SphereGeometry(0.14, 6, 5), '#ffd23f', 0.4 * i, 1.6, 0.2, hv);
      hv.bees.push({m:bee, o: i * 0.8});
    }
    checkpoints[0] = {idx:0, spawn:{x:0,y:0.5,z:6}, flag:new THREE.Object3D()};
  }
  function hiveEnter(){
    if (!hv) return;
    cam.pitch = 0.4; cam.dist = 14;
    t302Note('play:hive'); t302Ach('hive-visit');
    t302BindHud();
    banner('🐝 Honeyhill Hive! Walk the flower trails to collect pollen, then make honey at the hive. Bear neighbors only visit when you play solo — no fighting, ever.');
    t302Hud('Walk over flowers to collect pollen. E / Ⓧ at the hive makes honey.', '🍯 Honey');
  }
  function hivePaintQuest(){
    const box = document.getElementById('hiveQuestList');
    if (!box || !hv) return;
    const trails = hv.sv.trails.join(', ');
    const stickers = hv.sv.stickers.map(id => { const s = HiveRules.hiveSticker(id); return s ? s.emoji + ' ' + s.name : id; }).join(', ') || 'none yet';
    box.innerHTML = `<div class="t297row"><span>🌼 Pollen ${hv.sv.pollen}  ·  🍯 Honey ${hv.sv.honey}  ·  🐝 Bees ${hv.sv.bees}</span></div>` +
      `<div class="t297row"><span>Open trails: ${trails}</span></div>` +
      `<div class="t297row"><span>Stickers: ${stickers}</span></div>` +
      HiveRules.HIVE_BEARS.map(b => {
        const st = hv.sv.quests[b.id] || 'new';
        return `<div class="t297row"><span>${b.emoji} ${b.name} — ${b.line} (${st})</span></div>`;
      }).join('') + (hv.solo ? '<p>Talk to a bear with E / Ⓧ.</p>' : '<p>Bear neighbors come by in single-player. In multiplayer you just share the trails with real friends.</p>');
  }
  function hiveAct(){
    if (!hv) return false;
    if (hv.near && hv.near.kind === 'hive'){
      const r = HiveRules.hiveMakeHoney(hv.sv);
      if (!r.ok){ banner('Need ' + r.need + ' more pollen to make a pot of honey.'); return true; }
      hivePersist(r.state);
      t302Note('hive-honey', r.pots); t302Ach('hive-honey'); t302Board('hive-honey', r.state.made);
      banner('🍯 Made ' + r.pots + ' pot' + (r.pots > 1 ? 's' : '') + ' of honey!');
      return true;
    }
    if (hv.near && hv.near.kind === 'bear'){
      const id = hv.near.id;
      if (!hv.sv.quests[id]){ const r = HiveRules.hiveStartQuest(hv.sv, id); if (r.ok){ hivePersist(r.state); banner(r.bear.emoji + ' ' + r.bear.name + ': "' + r.bear.line + '"'); t302Open('hiveQuest'); } return true; }
      const r = HiveRules.hiveTurnIn(hv.sv, id);
      if (!r.ok){
        if (r.why === 'done') banner('They already thanked you! Enjoy the sticker.');
        else if (r.why === 'honey') banner('They still need ' + r.need + ' more honey.');
        else if (r.why === 'visit') banner('Walk their trail first, then come back!');
        t302Open('hiveQuest');
        return true;
      }
      hivePersist(r.state);
      t302Note('hive-quest'); t302Ach('hive-sticker');
      if (r.sticker) banner(r.bear.emoji + ' Thank you! You earned the ' + r.sticker.name + '!' + (r.trail ? ' A new flower trail opened!' : ''));
      hiveRefreshLocks();
      return true;
    }
    t302Open('hiveQuest');
    return true;
  }
  function hiveRefreshLocks(){
    hv.flowers.forEach(fl => { fl.locked = !HiveRules.hiveTrailOpen(hv.sv, fl.f.trail); if (fl.m) fl.m.material.opacity = fl.locked ? 0.35 : 1; if (fl.m) { fl.m.material.transparent = true; } });
    while (hv.bees.length < hv.sv.bees){
      const bee = t302Mesh(new THREE.SphereGeometry(0.14, 6, 5), '#ffd23f', P.x, 1.6, P.z, hv);
      hv.bees.push({m:bee, o: hv.bees.length * 0.8});
    }
  }
  function hiveUpdate(dt){
    if (!hv) return;
    hv.bees.forEach((b, i) => {
      const a = time * 2 + b.o;
      const r = 0.8 + (i % 3) * 0.25;
      b.m.position.set(P.x + Math.cos(a) * r, 1.4 + Math.sin(time * 3 + i) * 0.2, P.z + Math.sin(a) * r);
    });
    hv.flowers.forEach(fl => {
      if (fl.m) fl.m.position.y = 0.6 + Math.sin(time * 2 + fl.x) * 0.08;
      if (fl.locked) return;
      if (t302Near(fl.x, fl.z, 1.4)){
        const last = hv.cool[fl.f.id] || 0;
        if (time - last > 1.2){
          hv.cool[fl.f.id] = time;
          const r = HiveRules.hiveCollect(hv.sv, fl.f.id);
          if (r.ok){
            hivePersist(r.state);
            t302Note('hive-pollen');
            const vis = HiveRules.hiveVisit(hv.sv, fl.f.trail);
            if (vis.ok) hivePersist(vis.state);
          }
        }
      }
    });
    let near = null;
    if (t302Near(hv.hive.x, hv.hive.z, 2.2)) near = {kind:'hive'};
    if (hv.solo) hv.bears.forEach(b => { if (t302Near(b.x, b.z, 2)) near = {kind:'bear', id:b.id}; });
    hv.near = near;
    if (near && near.kind === 'hive') t302Hud('E / Ⓧ — turn pollen into honey at the hive. Pollen ' + hv.sv.pollen + '  Honey ' + hv.sv.honey, '🍯 Make honey');
    else if (near && near.kind === 'bear') t302Hud('E / Ⓧ — talk to ' + HiveRules.hiveBear(near.id).name + '. They never fight.', '🧸 Talk');
    else t302Hud('Walk the open flower trails. Bees follow you and gather pollen. E / Ⓧ opens quests.', '🐝 Quests');
  }

  /* ---------- Campfire Grove ---------- */
  function campState(){ return CampRules.campLoad(t302Load(CampRules.CAMP_KEY)); }
  function campPersist(s){ t302Save(CampRules.CAMP_KEY, s); if (cg) cg.sv = s; }

  function buildCamp(){
    const sv = campState();
    const started = CampRules.campStartNight(sv, t302Now(), t302MpOn());
    campPersist(started.state);
    cg = {trash:[], sv: started.state, run: started.run, piles:[], buddy:null, light:null, fire:null, near:null, done:false};
    scene.background = new THREE.Color('#1d2340');
    scene.fog = new THREE.Fog('#1d2340', 18, 70);
    plat(0, 0, 0, 30, 30, '#2a3a28', 0.2);
    plat(0, 0.06, 0, 8, 8, '#3d4a30', 0.06);
    // tent
    const tent = t302Mesh(new THREE.ConeGeometry(2.2, 2.6, 4), '#3d2a1a', -8, 1.3, -4, cg);
    tent.rotation.y = Math.PI / 4;
    t302Lab('⛺ Tent', -8, 2.8, -4);
    // craft bench
    plat(8, 0.7, -3, 2.6, 1.4, '#6b3a1d', 0.7);
    t302Lab('🧺 Craft Bench', 8, 2.2, -3);
    cg.bench = {x:8, z:-3};
    // fire
    t302Mesh(new THREE.CylinderGeometry(0.8, 1, 0.3, 8), '#3d2a1a', 0, 0.2, 0, cg);
    const flame = t302Mesh(new THREE.ConeGeometry(0.55, 1.4, 6), '#ff9f1c', 0, 1.0, 0, cg);
    const glow = t302Mesh(new THREE.ConeGeometry(0.3, 0.8, 6), '#ffd23f', 0, 1.1, 0, cg);
    cg.fire = {flame, glow};
    const light = new THREE.PointLight('#ffb347', 1.4, 22);
    light.position.set(0, 2.2, 0);
    scene.add(light);
    t302Keep(cg, light);
    cg.light = light;
    t302Lab('🔥 Campfire', 0, 2.6, 0);
    // stick piles
    const ring = [[-6,5],[-3,7],[3,7],[6,5],[7,0],[-7,0],[-5,-6],[5,-6]];
    ring.forEach((pz, i) => {
      const m = t302Mesh(new THREE.BoxGeometry(0.9, 0.3, 0.4), '#8d5524', pz[0], 0.25, pz[1], cg);
      t302Mesh(new THREE.BoxGeometry(0.7, 0.25, 0.3), '#6b3a1d', pz[0] + 0.1, 0.4, pz[1], cg);
      cg.piles.push({id:i, x:pz[0], z:pz[1], m});
    });
    if (cg.run.buddy){
      const body = t302Mesh(new THREE.BoxGeometry(0.6, 1.1, 0.4), '#3a86ff', 2.2, 0.9, 1.6, cg);
      t302Mesh(new THREE.BoxGeometry(0.45, 0.45, 0.45), '#ffd23f', 2.2, 1.65, 1.6, cg);
      t302Lab('🌟 Pip the Camp Buddy', 2.2, 2.5, 1.6);
      cg.buddy = body;
    }
    checkpoints[0] = {idx:0, spawn:{x:0,y:0.5,z:8}, flag:new THREE.Object3D()};
  }
  function campEnter(){
    if (!cg) return;
    cam.pitch = 0.32; cam.dist = 13;
    t302Note('play:camp'); t302Ach('camp-visit');
    t302BindHud();
    banner(cg.run.buddy
      ? '🔥 Campfire Grove. Keep the fire bright, gather sticks, and make it to sunrise. Pip is camping with you tonight — no monsters here.'
      : '🔥 Campfire Grove. Keep the fire bright together! Only real friends share this camp — no monsters, no bots.');
    t302Hud('E / Ⓧ gathers sticks or feeds the fire. Keep it bright until sunrise!', '🔥 Stoke');
  }
  function campPaintCraft(){
    const box = document.getElementById('campCraftList');
    if (!box || !cg) return;
    box.innerHTML = CampRules.CAMP_CRAFT.map(it => {
      const have = cg.sv.crafted.indexOf(it.id) >= 0;
      return `<div class="t297row${have ? ' dim' : ''}"><span>${it.emoji} ${it.name} — ${it.sticks} sticks ${have ? '(packed!)' : ''}</span>${have ? '' : `<button type="button" data-cc="${it.id}">Craft</button>`}</div>`;
    }).join('') + `<div class="t297row"><span>🪵 Sticks ${cg.sv.sticks}  ·  sunrises ${cg.sv.sunrises}</span></div>`;
    box.querySelectorAll('[data-cc]').forEach(btn => { btn.onclick = ev => { ev.preventDefault(); campDoCraft(btn.getAttribute('data-cc')); }; });
  }
  function campDoCraft(id){
    const r = CampRules.campCraft(cg.sv, id);
    if (!r.ok){ banner(r.why === 'sticks' ? 'Need ' + r.need + ' more sticks.' : r.why === 'have' ? 'You already crafted that!' : 'Cannot craft that.'); return; }
    campPersist(r.state);
    t302Ach('camp-craft'); t302Note('camp-craft');
    banner(r.item.emoji + ' Crafted a ' + r.item.name + '!');
    campPaintCraft();
  }
  function campAct(){
    if (!cg || cg.done) return false;
    if (cg.near && cg.near.kind === 'bench'){ t302Open('campCraft'); return true; }
    if (cg.near && cg.near.kind === 'pile'){
      const r = CampRules.campGather(cg.sv, cg.run, cg.near.id);
      if (!r.ok){ banner(r.why === 'empty' ? 'That pile is picked clean. Try another!' : 'Cannot gather there.'); return true; }
      campPersist(r.state); cg.run = r.run;
      t302Note('camp-stick');
      banner('🪵 Picked up a stick. ' + r.state.sticks + ' in your arms.');
      return true;
    }
    if (cg.near && cg.near.kind === 'fire'){
      const r = CampRules.campAddStick(cg.sv, cg.run);
      if (!r.ok){ banner('Gather sticks from the piles first, then feed the fire.'); return true; }
      campPersist(r.state); cg.run = r.run;
      t302Send({a:'camp-stick'});
      t302Note('camp-stoke');
      banner('🔥 The fire brightens!');
      return true;
    }
    return false;
  }
  function campUpdate(dt){
    if (!cg) return;
    if (!cg.done){
      CampRules.campTick(cg.run, dt);
      if (cg.run.won || cg.run.failed){
        cg.done = true;
        const fin = CampRules.campFinish(cg.sv, cg.run);
        campPersist(fin.state);
        if (fin.why === 'sunrise'){
          t302Note('camp-sunrise'); t302Ach('camp-sunrise'); t302Board('camp-sunrises', fin.state.sunrises);
          banner('🌅 Sunrise! You kept the grove warm all night. Beautiful.');
        } else {
          banner('The fire faded before sunrise. Gather sticks and try another cozy night — still no monsters here.');
        }
      }
    }
    const k = cg.run.fire || 0;
    if (cg.light) cg.light.intensity = 0.3 + k * 1.6;
    if (cg.fire){
      const s = 0.6 + k * 0.8 + Math.sin(time * 8) * 0.05;
      cg.fire.flame.scale.set(s, 0.7 + k * 0.9, s);
      cg.fire.glow.scale.set(s * 0.7, 0.6 + k, s * 0.7);
    }
    const dawn = Math.max(0, (cg.run.t / CampRules.CAMP_NIGHT) - 0.75) / 0.25;
    if (dawn > 0){
      const bg = new THREE.Color('#1d2340').lerp(new THREE.Color('#f4c084'), Math.min(1, dawn));
      scene.background = bg;
      if (scene.fog) scene.fog.color.copy(bg);
    }
    if (cg.buddy) cg.buddy.position.y = 0.9 + Math.sin(time * 2) * 0.04;
    t302Meter(true, k, 'Fire ' + Math.round(k * 100) + '%  ·  ' + Math.max(0, Math.ceil(CampRules.CAMP_NIGHT - cg.run.t)) + 's to sunrise');
    let near = null;
    if (t302Near(0, 0, 2.2)) near = {kind:'fire'};
    if (t302Near(cg.bench.x, cg.bench.z, 2)) near = {kind:'bench'};
    cg.piles.forEach(p => { if (t302Near(p.x, p.z, 1.5)) near = {kind:'pile', id:p.id}; });
    cg.near = near;
    if (cg.done && cg.run.won) t302Hud('Sunrise reached. Thanks for keeping the grove cozy.', '');
    else if (near && near.kind === 'fire') t302Hud('E / Ⓧ — add a stick to keep the fire bright.', '🔥 Stoke');
    else if (near && near.kind === 'pile') t302Hud('E / Ⓧ — gather sticks.', '🪵 Gather');
    else if (near && near.kind === 'bench') t302Hud('E / Ⓧ — craft a blanket or lantern.', '🧺 Craft');
    else t302Hud('Keep the fire bright until sunrise. Gather sticks around the grove.', '');
  }

  /* ---------- shared hooks ---------- */
  function t302Pointer(down, ev){
    if (mode === 'meadow') meadowPointer(down);
    else if (down && mode !== 'meadow') t302Act();
  }
  function t302Act(){
    if (mode === 'garden') return gardenAct();
    if (mode === 'meadow') return meadowAct();
    if (mode === 'rides') return ridesAct();
    if (mode === 'hive') return hiveAct();
    if (mode === 'camp') return campAct();
    return false;
  }
  function t302Update(dt){
    t302BindOverlays();
    if (gd) gardenUpdate(dt);
    if (mw) meadowUpdate(dt);
    if (rd) ridesUpdate(dt);
    if (hv) hiveUpdate(dt);
    if (cg) campUpdate(dt);
  }
  function t302Key(e){
    if (typeof t297EatOverlayKey === 'function' && t297EatOverlayKey(e)) return true;
    if (mode === 'garden'){
      if (e.code === 'KeyE' || e.code === 'KeyF' || e.key === 'e' || e.key === 'f'){ gardenAct(); return true; }
      return false;
    }
    if (mode === 'meadow') return meadowKey(e);
    if (mode === 'rides') return ridesKey(e);
    if (mode === 'hive'){
      if (e.code === 'KeyE' || e.code === 'KeyF' || e.key === 'e' || e.key === 'f'){ hiveAct(); return true; }
      return false;
    }
    if (mode === 'camp'){
      if (e.code === 'KeyE' || e.code === 'KeyF' || e.key === 'e' || e.key === 'f'){ campAct(); return true; }
      return false;
    }
    return false;
  }
  function t302Pad(jp, s){
    if (typeof t297EatOverlayPad === 'function' && t297EatOverlayPad(jp)) return true;
    if (mode === 'meadow') return meadowPad(jp, s);
    if (mode === 'rides') return ridesPad(jp);
    if (jp && (jp[2] || jp[3] || jp[0] || jp[7])){
      if (typeof pad !== 'undefined' && (jp[0] || jp[7])) pad.jump = false;
      return t302Act();
    }
    return false;
  }
  function t302Stop(){
    [gd, mw, rd, hv, cg].forEach(st => {
      if (!st) return;
      (st.trash || []).forEach(m => { try { scene.remove(m); } catch (e){} });
    });
    if (rd && rd.boarding) rd.boarding = null;
    gd = mw = rd = hv = cg = null;
    t302Meter(false);
    t302Hud('', '');
    t302Box(false);
    if (typeof t297OverlayClose === 'function') T302_OVERLAY_IDS.forEach(id => t297OverlayClose(id));
    const ob = document.getElementById('obby');
    if (ob) T302_MODES.forEach(m => ob.classList.remove(m + 'mode'));
  }
  function t302FromNet(g, d){
    if (!d || d.t && d.t !== 't302' && !d.a) { /* allow {t:'t302', a} */ }
    const a = d && d.a;
    if (a === 'camp-stick' && cg && cg.run && !cg.done){
      const r = CampRules.campAddStick(cg.sv, cg.run, true);
      if (r.ok){ cg.run = r.run; banner('🔥 A friend fed the fire!'); }
    }
    if (a === 'place' && rd && d.piece){
      const p = d.piece;
      if (!RidesRules.ridesAt(rd.sv, p.gx, p.gz)){
        const r = RidesRules.ridesPlace(rd.sv, p.kind, p.gx, p.gz, p.rot, p.owner || (g && g.uid));
        if (r.ok){ ridesPersist(r.state); ridesBuildPiece(r.piece); }
      }
    }
    if (a === 'toss' && mw) banner('🥣 A friend tossed a snack!');
  }
  try {
    if (typeof window !== 'undefined') window.t302Debug = {
      modes: T302_MODES,
      readyGarden(){ if (!gd) return; const now = t302Now(); gd.sv.plots.forEach(p => { if (p.seed) p.plantedAt = now - 10 * 60 * 1000; }); gardenPersist(gd.sv); gd.plots.forEach(p => gardenGrowMesh(p)); },
      stockGarden(){ if (!gd) return; const r1 = GardenRules.gardenBuy(gd.sv, 'sprout', 999); const r2 = GardenRules.gardenBuy(r1.state, 'melon', 999); try { setCoins(999); } catch(e){} gardenPersist(r2.state); const plant = GardenRules.gardenPlant(r2.state, 0, 'sprout', t302Now() - GardenRules.gardenSeed('sprout').grow, 999); if (plant.ok){ gardenPersist(plant.state); gardenGrowMesh(gd.plots[0]); } },
      fillRides(){ if (!rd) return; [['carousel',2,2,0],['swings',5,2,0],['drop',1,5,0],['cups',5,5,0],['curve',0,0,0],['curve',0,1,1],['curve',1,1,2],['curve',1,0,3]].forEach(q => { const r = RidesRules.ridesPlace(rd.sv, q[0], q[1], q[2], q[3], 'me'); if (r.ok){ rd.sv = r.state; ridesBuildPiece(r.piece); } }); ridesPersist(rd.sv); },
      fillHive(){ if (!hv) return; hv.sv.pollen = 20; hv.sv.honey = 3; hivePersist(hv.sv); },
      dawnSoon(){ if (!cg) return; cg.run.t = CampRules.CAMP_NIGHT - 8; cg.run.fire = 0.9; }
    };
  } catch (e){}
