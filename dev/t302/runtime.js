  const T302_MODES = ['garden','meadow','rides','hive','camp'];
  const T302_OVERLAY_IDS = ['gardenShop','meadowBook','ridesPalette','hiveQuest','campCraft','campWin'];
  let gd = null, mw = null, rd = null, hv = null, cg = null;
  const t302Btn = {};

  function t302MpOn(){ try { return !!(typeof mp !== 'undefined' && mp && mp.on); } catch (e){ return false; } }
  function t302Uid(){ try { if (t302MpOn() && mp.me) return String(mp.me); } catch (e){} return 'me'; }
  function t302Now(){ return Date.now(); }
  function t302Keep(st, m){ return (typeof t297Keep === 'function') ? t297Keep(st, m) : (m && st && st.trash && st.trash.push(m), m); }
  function t302Lab(text, x, y, z, bg){ return (typeof t297Lab === 'function') ? t297Lab(text, x, y, z, bg) : null; }
  function t302Near(x, z, r){ return (typeof t297Near === 'function') ? t297Near(x, z, r) : (Math.hypot(P.x - x, P.z - z) <= (r == null ? 1.8 : r)); }
  function t302Note(ev, n){ try { if (typeof t297Note === 'function') t297Note(ev, n); else if (typeof qNoteHook === 'function') qNoteHook(ev, n == null ? 1 : n); } catch (e){} }
  function t302Ach(id){ try { if (typeof t297Ach === 'function') t297Ach(id); else if (typeof achNote === 'function') achNote(id); } catch (e){} }
  function t302Board(id, v){ try { if (typeof t297Board === 'function') t297Board(id, v); else if (typeof lbRecord === 'function') lbRecord(id, v); } catch (e){} }
  function t302Pay(n, label){ if (typeof t297Pay === 'function') t297Pay(n, label); else if (n > 0){ try { setCoins(coins + n); runCoins = (runCoins || 0) + n; } catch (e){} } }
  function t302Coins(){ return (typeof coins === 'number') ? coins : 0; }
  function t302Save(key, obj){ if (typeof t297Save === 'function') t297Save(key, obj); else if (typeof save === 'function') save(key, obj); }
  function t302Load(key){ try { return typeof load === 'function' ? load(key, null) : null; } catch (e){ return null; } }
  function t302Send(msg){ try { if (t302MpOn() && typeof mpSend === 'function') mpSend(Object.assign({t:'t302'}, msg || {})); } catch (e){} }
  function t302Mat(color, opts){ return new THREE.MeshLambertMaterial(Object.assign({color: color}, opts || {})); }
  function t302Mesh(geo, color, x, y, z, st, opts){
    const m = new THREE.Mesh(geo, t302Mat(color, opts));
    m.position.set(x, y, z);
    scene.add(m);
    if (st) t302Keep(st, m);
    return m;
  }
  function t302Snd(k){ try { if (typeof SND !== 'undefined' && SND[k]) SND[k](); } catch (e){} }
  function t302Tone(freqs, dur, type, vol){ try { if (typeof beep === 'function') beep(freqs, dur, type || 'sine', vol == null ? 0.05 : vol); } catch (e){} }
  function t302Dt(dt){ return Math.max(0, Math.min(0.12, +dt || 0)); }
  function t302Edge(name, down){
    const was = !!t302Btn[name];
    t302Btn[name] = !!down;
    return !!down && !was;
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
  function t302Tree(st, x, z, col, h){
    h = h || 2.2;
    t302Mesh(new THREE.CylinderGeometry(0.16, 0.22, h * 0.45, 6), '#6b3a1d', x, h * 0.2, z, st);
    t302Mesh(new THREE.ConeGeometry(0.95, h, 8), col || '#2f8f4a', x, h * 0.55, z, st);
  }
  function t302Flower(st, x, z, col){
    t302Mesh(new THREE.CylinderGeometry(0.04, 0.05, 0.45, 5), '#2f8f4a', x, 0.22, z, st);
    t302Mesh(new THREE.SphereGeometry(0.16, 6, 5), col || '#ffd23f', x, 0.5, z, st);
  }
  function t302BindHud(){
    const act = document.getElementById('t302Act');
    if (act && !act.__t302){
      act.__t302 = true;
      act.addEventListener('pointerdown', ev => { ev.preventDefault(); ev.stopPropagation(); t302Pointer(true, ev, true); });
      act.addEventListener('pointerup', ev => { ev.preventDefault(); ev.stopPropagation(); t302Pointer(false, ev, true); });
      act.addEventListener('pointercancel', ev => { t302Pointer(false, ev, true); });
    }
    ['gardenShopBtn','meadowBookBtn','ridesPaletteBtn','hiveQuestBtn','campCraftBtn','t302LessBtn','campWinAgain','campWinClose'].forEach(id => {
      const el = document.getElementById(id);
      if (el && !el.__t302){ el.__t302 = true; el.onclick = ev => { ev.preventDefault(); ev.stopPropagation(); t302Open(id); }; }
    });
    if (!window.__t302Ptr){
      window.__t302Ptr = true;
      document.addEventListener('pointerdown', ev => {
        if (!running || mode !== 'meadow') return;
        if (ev.target && ev.target.closest && ev.target.closest('.t297overlay, button, a, input, #t302Act')) return;
        if (!document.pointerLockElement) return;
        t302Pointer(true, ev, false);
      });
      document.addEventListener('pointerup', ev => {
        if (!running || mode !== 'meadow') return;
        t302Pointer(false, ev, false);
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
    if (which === 't302LessBtn'){ campToggleLess(); return; }
    if (which === 'campWinAgain'){ campRetry(); return; }
    if (which === 'campWinClose'){ if (typeof t297OverlayClose === 'function') t297OverlayClose('campWin'); return; }
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
    if (box) box.style.display = on ? 'block' : 'none';
    const ob = $('#obby');
    T302_MODES.forEach(m => ob.classList.toggle(m + 'mode', on && mode === m));
  }

  /* ---------- Sunny Patch Garden ---------- */
  function gardenState(){ return GardenRules.gardenLoad(t302Load(GardenRules.GARDEN_KEY)); }
  function gardenPersist(s){ t302Save(GardenRules.GARDEN_KEY, s); if (gd) gd.sv = s; }

  function buildGarden(){
    let sv = gardenState();
    sv = GardenRules.gardenGrantStarter(sv);
    gardenPersist(sv);
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
    // shop as a low stall (not a climbable roof)
    t302Mesh(new THREE.BoxGeometry(3.2, 1.1, 1.6), '#c48a5a', 8, 0.55, 6, gd);
    t302Mesh(new THREE.BoxGeometry(3.6, 0.12, 2.0), '#c45c4a', 8, 1.2, 6, gd);
    t302Mesh(new THREE.BoxGeometry(0.15, 1.3, 0.15), '#6b3a1d', 6.5, 0.65, 5.3, gd);
    t302Mesh(new THREE.BoxGeometry(0.15, 1.3, 0.15), '#6b3a1d', 9.5, 0.65, 5.3, gd);
    t302Lab('🌱 Seed Shop', 8, 2.2, 6);
    gd.shop = {x:8, z:6};
    t302Mesh(new THREE.BoxGeometry(4.6, 0.5, 1.6), '#d9b089', -8, 0.25, 6, gd);
    gd.standPos = [-9.2, -8, -6.8].map((x, i) => {
      t302Mesh(new THREE.CylinderGeometry(0.4, 0.45, 0.7, 8), '#f4e27a', x, 0.7, 6, gd);
      return {i, x, z:6};
    });
    t302Lab('🏆 Prize Stand', -8, 2.2, 6);
    for (let i = -12; i <= 12; i += 3){
      t302Mesh(new THREE.BoxGeometry(0.2, 1.2, 0.2), '#6b3a1d', i, 0.6, -13, gd);
      t302Mesh(new THREE.BoxGeometry(0.2, 1.2, 0.2), '#6b3a1d', i, 0.6, 13, gd);
    }
    t302Mesh(new THREE.BoxGeometry(24, 0.08, 0.08), '#6b3a1d', 0, 1.05, -13, gd);
    t302Mesh(new THREE.BoxGeometry(24, 0.08, 0.08), '#6b3a1d', 0, 1.05, 13, gd);
    [[-10,-8,'#2f8f4a'],[10,-8,'#1f9460'],[-11,0,'#2f8f4a'],[11,2,'#3fa85a'],[-9,10,'#2f8f4a'],[9,11,'#1f9460']].forEach(t => t302Tree(gd, t[0], t[1], t[2], 2.4 + Math.abs(t[0]) * 0.02));
    [[-3,8,'#ffd23f'],[3,9,'#ff6fb5'],[-5,5,'#5aa9ff'],[5,4,'#ff9f1c'],[-2,-8,'#ff6fb5']].forEach(f => t302Flower(gd, f[0], f[1], f[2]));
    t302Lab('🌻 Sunny Patch Garden', 0, 3.4, 10);
    gd.plots.forEach(p => gardenGrowMesh(p));
    gardenPaintStand();
    checkpoints[0] = {idx:0, spawn:{x:0,y:0.5,z:8}, flag:new THREE.Object3D()};
  }
  function gardenGrowMesh(p){
    if (p.mesh){ p.mesh.forEach(m => { try { scene.remove(m); } catch (e){} }); p.mesh = []; }
    const plot = gd.sv.plots[p.id];
    const st = GardenRules.gardenStage(plot, t302Now());
    if (!st || !plot || !plot.seed) { p.stage = 0; return; }
    const seed = GardenRules.gardenSeed(plot.seed);
    const col = seed ? seed.color : '#7ad46a';
    const h = st === 1 ? 0.5 : st === 2 ? 1.1 : 1.7;
    const stem = t302Mesh(new THREE.CylinderGeometry(0.06, 0.08, h, 6), '#2f8f4a', p.x, 0.2 + h/2, p.z, gd);
    const top = t302Mesh(st === 3 ? new THREE.SphereGeometry(0.46, 10, 8) : new THREE.ConeGeometry(0.3, 0.55, 7), col, p.x, 0.2 + h + 0.2, p.z, gd);
    const bits = [stem, top];
    if (st === 3){
      const spark = t302Mesh(new THREE.SphereGeometry(0.12, 6, 5), '#fff4c2', p.x + 0.35, 0.2 + h + 0.45, p.z, gd);
      bits.push(spark);
    }
    p.mesh = bits;
    p.stage = st;
  }
  function gardenPaintStand(){
    (gd.standM || []).forEach(m => { try { scene.remove(m); } catch (e){} });
    gd.standM = [];
    (gd.sv.stand || []).forEach((sid, i) => {
      if (!sid) return;
      const seed = GardenRules.gardenSeed(sid);
      const pos = gd.standPos[i];
      if (!pos || !seed) return;
      const m = t302Mesh(new THREE.SphereGeometry(0.38, 8, 6), seed.color, pos.x, 1.4, pos.z, gd);
      gd.standM.push(m);
      gd.standM.push(t302Lab(seed.emoji + ' ' + seed.name, pos.x, 2.1, pos.z));
    });
  }
  function gardenEnter(){
    if (!gd) return;
    cam.pitch = 0.42; cam.dist = 14;
    t302Note('play:garden'); t302Ach('garden-visit');
    t302BindHud();
    const n = GardenRules.gardenPouchCount(gd.sv);
    banner(n ? '🌱 Sunny Patch Garden! You have ' + n + ' seed' + (n===1?'':'s') + '. Plant them in a bed — they keep growing even while you are away.' : '🌱 Welcome to Sunny Patch Garden! Buy seeds at the shop, plant them, and come back later to harvest.');
    t302Hud('Goal: plant, wait (even while away), harvest, then sell or show a prize.', '🌱 Plant');
  }
  function gardenPaintShop(){
    const box = document.getElementById('gardenShopList');
    if (!box || !gd) return;
    const pick = gd.sv.pick;
    box.innerHTML = GardenRules.GARDEN_SEEDS.map(s => {
      const n = (gd.sv.pouch[s.id] | 0);
      const sel = pick === s.id ? '  ← selected' : '';
      const secs = Math.round(s.grow / 1000);
      return `<div class="t297row"><span>${s.emoji} ${s.name} — ${s.cost} 🪙, sells for ${s.sell} 🪙, grows in ${secs}s · pouch ${n}${sel}</span><span><button type="button" data-gpick="${s.id}">Pick</button> <button type="button" data-gseed="${s.id}">Buy</button></span></div>`;
    }).join('') + `<div class="t297row"><span>🧺 Basket: ${(gd.sv.basket||[]).length}  ·  earned ${gd.sv.earned|0} 🪙</span><button type="button" data-gsell="1">Sell one</button></div>`;
    box.querySelectorAll('[data-gseed]').forEach(btn => { btn.onclick = ev => { ev.preventDefault(); gardenBuy(btn.getAttribute('data-gseed')); }; });
    box.querySelectorAll('[data-gpick]').forEach(btn => { btn.onclick = ev => { ev.preventDefault(); gd.sv = GardenRules.gardenPick(gd.sv, btn.getAttribute('data-gpick')); gardenPersist(gd.sv); gardenPaintShop(); banner('Ready to plant ' + GardenRules.gardenSeed(gd.sv.pick).name + '!'); }; });
    const sell = box.querySelector('[data-gsell]');
    if (sell) sell.onclick = ev => { ev.preventDefault(); gardenDoSell(); };
  }
  function gardenBuy(id){
    const r = GardenRules.gardenBuy(gd.sv, id, t302Coins());
    if (!r.ok){ t302Snd('hit'); banner(r.why === 'coins' ? 'Need more coins for that seed.' : 'Could not buy that seed.'); return; }
    try { setCoins(r.coins); } catch (e){}
    r.state = GardenRules.gardenPick(r.state, id);
    gardenPersist(r.state);
    gardenPaintShop();
    t302Snd('coin');
    banner('Bought a ' + r.seed.name + ' seed! Press E on an empty bed to plant it.');
  }
  function gardenDoSell(){
    const r = GardenRules.gardenSell(gd.sv);
    if (!r.ok){ banner('Nothing in the basket to sell yet. Harvest a ripe plant first!'); return; }
    gardenPersist(r.state);
    t302Pay(r.pay, r.item.emoji + ' Sold ' + r.item.name);
    t302Note('garden-sell'); t302Board('garden-sold', r.state.sold);
    t302Snd('coin');
    gardenPaintShop();
  }
  function gardenAct(){
    if (!gd) return false;
    if (gd.near && gd.near.kind === 'shop'){ t302Open('gardenShop'); return true; }
    if (gd.near && gd.near.kind === 'stand'){
      if (!(gd.sv.basket || []).length){ banner('Harvest a prize plant first, then show it here.'); return true; }
      const r = GardenRules.gardenShow(gd.sv, gd.near.slot);
      if (r.ok){ gardenPersist(r.state); gardenPaintStand(); t302Ach('garden-stand'); t302Snd('cp'); banner('🏆 Shown on the prize stand!'); }
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
          t302Snd('win');
          banner(r.item.emoji + ' Harvested ' + r.item.name + '! Sell it at the shop or show it on the stand.');
        }
        return true;
      }
      if (plot && plot.seed){
        const left = Math.ceil(GardenRules.gardenLeft(plot, t302Now()) / 1000);
        banner('Still growing — ready in ' + left + 's. It keeps growing even while you are away!');
        return true;
      }
      const r = GardenRules.gardenPlant(gd.sv, gd.near.id, gd.sv.pick, t302Now(), t302Coins());
      if (r.ok){
        try { if (r.coins != null && r.coins !== t302Coins()) setCoins(r.coins); } catch (e){}
        gardenPersist(r.state);
        gardenGrowMesh(gd.plots[gd.near.id]);
        t302Note('garden-plant'); t302Ach('garden-plant');
        t302Snd('boing');
        const secs = Math.round(r.seed.grow / 1000);
        banner('Planted a ' + r.seed.name + '! It will be ready in ' + secs + 's, even if you leave.');
      } else if (r.why === 'coins' || r.why === 'seed'){
        t302Open('gardenShop');
        banner('Buy or pick a seed at the shop first!');
      }
      return true;
    }
    return false;
  }
  function gardenUpdate(){
    if (!gd) return;
    gd.plots.forEach(p => {
      const st = GardenRules.gardenStage(gd.sv.plots[p.id], t302Now());
      if (st !== p.stage){ gardenGrowMesh(p); if (st === 3) t302Tone([660, 880], 0.08, 'triangle', 0.04); }
    });
    let near = null;
    if (t302Near(gd.shop.x, gd.shop.z, 2.4)) near = {kind:'shop'};
    gd.standPos.forEach(s => { if (t302Near(s.x, s.z, 1.6)) near = {kind:'stand', slot:s.i}; });
    gd.plots.forEach(p => { if (t302Near(p.x, p.z, 1.5)) near = {kind:'plot', id:p.id}; });
    gd.near = near;
    if (near && near.kind === 'shop') t302Hud('E / Ⓧ — open the seed shop. Close with ×, Esc, B, a tap, or walk away.', '');
    else if (near && near.kind === 'stand') t302Hud('E / Ⓧ — show a prize plant on this stand.', '🏆 Show');
    else if (near && near.kind === 'plot'){
      const plot = gd.sv.plots[near.id];
      if (GardenRules.gardenReady(plot, t302Now())) t302Hud('This plant is ready! E / Ⓧ to harvest.', '🧺 Harvest');
      else if (plot && plot.seed){
        const left = Math.ceil(GardenRules.gardenLeft(plot, t302Now()) / 1000);
        t302Hud(GardenRules.gardenSeed(plot.seed).emoji + ' Growing… ready in ' + left + 's (keeps going while you are away).', '');
      } else t302Hud('E / Ⓧ to plant ' + ((gd.sv.pick && GardenRules.gardenSeed(gd.sv.pick)) ? GardenRules.gardenSeed(gd.sv.pick).name : 'a seed from your pouch') + '.', '🌱 Plant');
    } else t302Hud('Goal: plant seeds, wait, harvest, then sell or show a prize. Walk to a bed, the shop, or the stand.', '');
  }

  /* ---------- Chow Chuck Meadow ---------- */
  function meadowState(){ return MeadowRules.meadowLoad(t302Load(MeadowRules.MEADOW_KEY)); }
  function meadowPersist(s){ t302Save(MeadowRules.MEADOW_KEY, s); if (mw) mw.sv = s; }

  function buildMeadow(){
    const sv = meadowState();
    mw = {trash:[], sv, fields:[], animals:{}, snacks:[], charging:false, charge:0, hold:false, near:null, trainCd:0, arc:null};
    scene.background = new THREE.Color('#9ee0ff');
    scene.fog = new THREE.Fog('#9ee0ff', 36, 110);
    plat(0, 0, 20, 40, 80, '#7dce6a', 0.2);
    plat(0, 0.04, -2, 8, 8, '#8fbf6a', 0.04);
    t302Lab('🥣 Chow Chuck Meadow', 0, 3.2, 4);
    t302Mesh(new THREE.BoxGeometry(2.2, 0.7, 2.2), '#c48a5a', -6, 0.35, 2, mw);
    t302Lab('📖 Meadow Book', -6, 2.2, 2);
    mw.book = {x:-6, z:2};
    t302Mesh(new THREE.CylinderGeometry(0.5, 0.7, 1.2, 8), '#d9b089', 6, 0.6, 2, mw);
    t302Lab('💪 Training Post', 6, 2.3, 2);
    mw.train = {x:6, z:2};
    t302Mesh(new THREE.CylinderGeometry(0.5, 0.55, 0.4, 10), '#fff8ee', 0, 0.25, 2.5, mw);
    t302Mesh(new THREE.SphereGeometry(0.2, 8, 6), '#f4c84a', 0, 0.55, 2.5, mw);
    t302Lab('🍪 Snack Crate', 0, 1.6, 2.5);
    mw.crate = {x:0, z:2.5};
    [[-14,8],[14,10],[-16,30],[16,28],[-12,50],[12,52]].forEach((p,i) => t302Tree(mw, p[0], p[1], i%2? '#2f8f4a':'#3fa85a', 2.6));
    plat(0, 0.05, 22, 3.2, 52, '#8fbf6a', 0.05);
    for (let i = -18; i <= 18; i += 3){
      t302Mesh(new THREE.BoxGeometry(0.18, 1.1, 0.18), '#6b3a1d', i, 0.55, -18, mw);
      if (i < 18) t302Mesh(new THREE.BoxGeometry(3, 0.12, 0.12), '#8d5524', i + 1.5, 0.85, -18, mw);
    }
    const mflow = ['#ff7aa8','#ffd23f','#c77dff','#7ad46a','#ff9f1c'];
    for (let i = 0; i < 22; i++){
      const x = ((i * 7) % 34) - 17, z = 6 + ((i * 11) % 58);
      t302Flower(mw, x, z, mflow[i % mflow.length]);
    }
    [[-8,16],[9,24],[-10,38],[11,44],[-6,8],[8,33]].forEach(p => {
      t302Mesh(new THREE.SphereGeometry(0.35, 6, 5), '#8a8f7a', p[0], 0.22, p[1], mw);
    });
    [[-18,18],[18,22],[-20,44],[20,40]].forEach((p,i) => t302Tree(mw, p[0], p[1], '#246b38', 3.1));

    MeadowRules.MEADOW_FIELDS.forEach((f, i) => {
      const z = 12 + i * 12;
      const x = (i % 2 === 0) ? -4 : 5;
      plat(x, 0.08, z, 8, 8, '#6fbf5a', 0.08);
      t302Lab(f.name, x, 2.6, z - 3);
      const a = MeadowRules.meadowAnimal(f.animal);
      const body = t302Mesh(new THREE.SphereGeometry(0.7, 10, 8), a.color, x, 0.9, z, mw);
      const head = t302Mesh(new THREE.SphereGeometry(0.42, 8, 6), a.color, x, 1.45, z + 0.15, mw);
      const earL = t302Mesh(new THREE.SphereGeometry(0.16, 6, 5), a.color, x - 0.28, 1.75, z + 0.1, mw);
      const earR = t302Mesh(new THREE.SphereGeometry(0.16, 6, 5), a.color, x + 0.28, 1.75, z + 0.1, mw);
      t302Lab(a.emoji + ' ' + a.name, x, 2.3, z);
      mw.fields.push({f, x, z, body, head, earL, earR, id:f.id, animal:f.animal});
    });
    checkpoints[0] = {idx:0, spawn:{x:0,y:0.5,z:6}, flag:new THREE.Object3D()};
  }
  function meadowEnter(){
    if (!mw) return;
    cam.pitch = 0.36; cam.dist = 14;
    t302Note('play:meadow'); t302Ach('meadow-visit');
    t302BindHud();
    banner('🥣 Chow Chuck Meadow! Hold to charge, face a field, and let go so the snack lands near a pal. Train to throw farther. Their book is yours alone.');
    t302Hud('Hold E, the Charge button, or RT to throw. Aim with the camera. Restock snacks at the crate.', '🥣 Charge');
  }
  function meadowPaintBook(){
    const box = document.getElementById('meadowBookList');
    if (!box || !mw) return;
    box.innerHTML = MeadowRules.meadowBook(mw.sv).map(a => {
      const mark = a.found ? 'in your book!' : 'still out in the ' + (a.field ? a.field.name : 'fields');
      return `<div class="t297row${a.found ? '' : ' dim'}"><span>${a.emoji} ${a.name}</span><span>${mark}</span></div>`;
    }).join('') + `<div class="t297row"><span>💪 Throw power ${MeadowRules.meadowPower(mw.sv)}  ·  best ${mw.sv.best || 0}  ·  snacks ${mw.sv.snacks}</span></div>`;
  }
  function meadowAim(){
    const yaw = (cam && cam.yaw != null) ? cam.yaw + Math.PI : ((P && P.face != null) ? P.face : 0);
    return {x: Math.sin(yaw), z: Math.cos(yaw), yaw};
  }
  function meadowBeginCharge(){
    if (!mw || mw.charging) return;
    if ((mw.sv.snacks | 0) <= 0){ banner('Out of snacks! Walk to the snack crate and press E / Ⓧ to refill.'); t302Snd('hit'); return; }
    mw.charging = true; mw.charge = 0.08; mw.hold = true;
    t302Tone([240, 320], 0.04, 'sine', 0.03);
  }
  function meadowRelease(){
    if (!mw || !mw.charging) return;
    const charge = mw.charge;
    mw.charging = false; mw.hold = false; mw.charge = 0;
    t302Meter(false);
    const aim = meadowAim();
    const fields = mw.fields.map(f => ({id:f.f.id, x:f.x, z:f.z, animal:f.f.animal, r:5.5}));
    const r = MeadowRules.meadowThrowTo(mw.sv, charge, P.x, P.z, aim.x, aim.z, fields, t302Uid(), null);
    if (!r.ok){ banner(r.why === 'owned' ? "That's a friend's pal — we never take anyone's animals." : r.why === 'snacks' ? 'Out of snacks! Refill at the crate.' : 'Need a little more charge!'); return; }
    meadowPersist(r.state);
    meadowLaunch(aim, r);
    t302Note('meadow-throw'); t302Ach('meadow-throw');
    t302Board('meadow-best', r.state.best);
    t302Snd('boing');
    if (r.foundNew){ t302Ach('meadow-friend'); t302Note('meadow-friend'); t302Snd('cp'); banner(r.animal.emoji + ' You met ' + r.animal.name + ' in ' + (r.field.name || 'the field') + '!'); }
    else if (r.animal) banner('A snack for ' + r.animal.name + '! ' + r.dist.toFixed(1) + ' steps.');
    else banner('Tossed ' + r.dist.toFixed(1) + ' steps, but it missed the pals. Aim at a field and charge longer or train!');
    t302Send({a:'toss', d:r.dist});
  }
  function meadowLaunch(aim, r){
    const dist = r.dist;
    const snack = t302Mesh(new THREE.SphereGeometry(0.22, 8, 6), '#f4c84a', P.x, 1.2, P.z, mw);
    mw.snacks.push({m:snack, t:0, life:0.9, x:P.x, z:P.z, dx:aim.x * dist, dz:aim.z * dist});
  }
  function meadowAct(){
    if (!mw) return false;
    if (mw.near === 'book'){ t302Open('meadowBook'); return true; }
    if (mw.near === 'train'){
      if (mw.trainCd > 0){ banner('Catch your breath — try training again in a moment.'); return true; }
      const r = MeadowRules.meadowTrain(mw.sv);
      if (r.ok){ meadowPersist(r.state); mw.trainCd = 1.1; t302Ach('meadow-train'); t302Snd('jump'); banner('💪 Training paid off! Throws now go up to ' + r.power + ' steps.'); }
      else banner('You are already as strong as the training post allows!');
      return true;
    }
    if (mw.near === 'crate'){
      if ((mw.sv.snacks | 0) >= 12){ banner('Your snack pouch is already full!'); return true; }
      mw.sv = MeadowRules.meadowRestock(mw.sv, 8);
      meadowPersist(mw.sv);
      t302Snd('coin');
      banner('🍪 Scooped more snacks! You have ' + mw.sv.snacks + '.');
      return true;
    }
    return false;
  }
  function meadowPointer(down, fromBtn){
    if (down) meadowBeginCharge();
    else if (mw && mw.charging) meadowRelease();
  }
  function meadowUpdate(dt){
    if (!mw) return;
    dt = t302Dt(dt);
    if (mw.trainCd) mw.trainCd = Math.max(0, mw.trainCd - dt);
    if (mw.charging){
      mw.charge = Math.min(1, mw.charge + dt * 0.7);
      const reach = MeadowRules.meadowPower(mw.sv) * mw.charge;
      t302Meter(true, mw.charge, 'Power ' + Math.round(mw.charge * 100) + '%  ·  ' + reach.toFixed(1) + ' steps');
    }
    mw.fields.forEach((f, i) => {
      const bob = Math.sin(time * 2 + i) * 0.08;
      if (f.body) f.body.position.y = 0.9 + bob;
      if (f.head) f.head.position.y = 1.45 + bob;
      if (f.earL) f.earL.position.y = 1.75 + bob;
      if (f.earR) f.earR.position.y = 1.75 + bob;
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
    if (t302Near(mw.crate.x, mw.crate.z, 1.8)) near = 'crate';
    mw.near = near;
    if (near === 'book') t302Hud('E / Ⓧ — open your meadow book. Friends share the meadow, but this book is yours.', '');
    else if (near === 'train') t302Hud('E / Ⓧ — train for stronger throws.', '💪 Train');
    else if (near === 'crate') t302Hud('E / Ⓧ — refill your snacks.', '🍪 Refill');
    else t302Hud('Goal: land a snack near a pal to add them to your book. Hold E, Charge, or RT, then release. Aim with the camera.', mw.charging ? '🥣 Throw!' : '🥣 Charge');
  }

  /* ---------- Rideland Workshop ---------- */
  function ridesState(){ return RidesRules.ridesLoad(t302Load(RidesRules.RIDES_KEY)); }
  function ridesPersist(s){ t302Save(RidesRules.RIDES_KEY, s); if (rd) rd.sv = s; }

  function buildRides(){
    const sv = ridesState();
    rd = {trash:[], sv, meshes:{}, boarding:null, t:0, near:null, ghost:null};
    scene.background = new THREE.Color('#8fd3ff');
    scene.fog = new THREE.Fog('#8fd3ff', 32, 100);
    plat(0, 0, 0, 32, 32, '#9aa3ad', 0.2);
    plat(0, 0.03, 0, 24, 24, '#d9d4c8', 0.03);
    // visible grid marks
    for (let i = 0; i < RidesRules.RIDES_GRID; i++) for (let j = 0; j < RidesRules.RIDES_GRID; j++){
      const w = RidesRules.ridesWorld(i, j);
      t302Mesh(new THREE.BoxGeometry(0.25, 0.02, 0.25), (i + j) % 2 ? '#cfc8ba' : '#e8e2d4', w.x, 0.05, w.z, rd);
    }
    t302Mesh(new THREE.BoxGeometry(3.2, 1.0, 1.8), '#ff9f1c', 0, 0.5, 14, rd);
    t302Lab('🎟️ Ride Kit', 0, 2.2, 14);
    rd.kit = {x:0, z:14};
    t302Lab('🎢 Rideland Workshop', 0, 3.6, -14);
    [[-14,-14],[14,-14],[-14,10],[14,10]].forEach(p => t302Tree(rd, p[0], p[1], '#2f8f4a', 2.8));
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
      const seat1 = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.12, 0.4), t302Mat('#ffd23f')); seat1.position.set(-1.2, 1.2, 0); seat1.name = 'seat'; g.add(seat1);
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
    return g;
  }
  function ridesEnter(){
    if (!rd) return;
    cam.pitch = 0.46; cam.dist = 16;
    t302Note('play:rides'); t302Ach('rides-visit');
    t302BindHud();
    banner('🎢 Rideland Workshop! Cycle pieces with Q or bumpers, E / Ⓧ to place or ride, C to pick up your own ride. Friends may hop on too.');
    t302Hud('Goal: place a ride, then hop on! Q cycles, R rotates, C picks up.', '🧱 Place');
  }
  function ridesPaintPalette(){
    const box = document.getElementById('ridesPaletteList');
    if (!box || !rd) return;
    const rows = RidesRules.RIDES_KINDS.map(k => {
      const on = rd.sv.kind === k.id;
      return `<div class="t297row"><span>${k.emoji} ${k.name}${on ? '  ← selected' : ''}</span><button type="button" data-rk="${k.id}">Pick</button></div>`;
    }).join('');
    const mine = (rd.sv.pieces || []).map(p => {
      const k = RidesRules.ridesKind(p.kind);
      return `<div class="t297row"><span>${k.emoji} ${k.name} at ${p.gx},${p.gz}</span><button type="button" data-rm="${p.id}">Pick up</button></div>`;
    }).join('');
    box.innerHTML = rows + '<p>Q or bumpers cycle pieces. R / Ⓨ rotates. C picks up a ride you placed. Coaster cars need a closed loop of track.</p>' + (mine || '<p>No rides placed yet — stand on a square and press E / Ⓧ.</p>');
    box.querySelectorAll('[data-rk]').forEach(btn => { btn.onclick = ev => { ev.preventDefault(); rd.sv.kind = btn.getAttribute('data-rk'); ridesPersist(rd.sv); ridesPaintPalette(); banner('Selected ' + RidesRules.ridesKind(rd.sv.kind).name); }; });
    box.querySelectorAll('[data-rm]').forEach(btn => { btn.onclick = ev => { ev.preventDefault(); ridesPickUp(+btn.getAttribute('data-rm')); }; });
  }
  function ridesCellAt(x, z){
    const o = (RidesRules.RIDES_GRID * RidesRules.RIDES_CELL) / 2 - RidesRules.RIDES_CELL / 2;
    const gx = Math.round((x + o) / RidesRules.RIDES_CELL);
    const gz = Math.round((z + o) / RidesRules.RIDES_CELL);
    if (gx < 0 || gz < 0 || gx >= RidesRules.RIDES_GRID || gz >= RidesRules.RIDES_GRID) return null;
    return {gx, gz};
  }
  function ridesPickUp(id){
    const r = RidesRules.ridesRemove(rd.sv, id, t302Uid());
    if (!r.ok){ banner(r.why === 'owned' ? "That's a friend's ride — only they can pick it up." : 'Nothing to pick up.'); return false; }
    ridesPersist(r.state);
    const g = rd.meshes[id];
    if (g){ scene.remove(g); delete rd.meshes[id]; }
    if (rd.boarding && rd.boarding.id === id) rd.boarding = null;
    t302Snd('hit');
    banner('Picked up your ' + RidesRules.ridesKind(r.piece.kind).name + '.');
    if (document.getElementById('ridesPalette') && document.getElementById('ridesPalette').classList.contains('show')) ridesPaintPalette();
    return true;
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
      t302Snd('jump');
      banner('Whoosh! Riding the ' + RidesRules.ridesKind(piece.kind).name + '. E / Ⓧ to hop off.');
      return true;
    }
    const r = RidesRules.ridesPlace(rd.sv, rd.sv.kind, cell.gx, cell.gz, rd.sv.rot, t302Uid());
    if (!r.ok){ banner('That square is full or the piece does not fit. Try another, or press C to pick up your own ride.'); return true; }
    ridesPersist(r.state);
    ridesBuildPiece(r.piece);
    t302Note('rides-place'); t302Ach('rides-place'); t302Board('rides-placed', r.state.placed);
    t302Send({a:'place', piece:r.piece});
    t302Snd('boing');
    banner('Placed a ' + RidesRules.ridesKind(r.piece.kind).name + '!');
    return true;
  }
  function ridesDismount(){
    if (!rd || !rd.boarding) return;
    const g = rd.meshes[rd.boarding.id];
    if (g){ P.x = g.position.x; P.z = g.position.z + 2.2; P.y = 0.5; P.vy = 0; }
    rd.boarding = null;
    banner('Hopped off the ride.');
  }
  function ridesUpdate(dt){
    if (!rd) return;
    dt = t302Dt(dt);
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
          const n = Math.max(1, loop.length);
          const t = rd.boarding.t * 1.4;
          const i = Math.floor(t) % n, f = t - Math.floor(t), j = (i + 1) % n;
          const a = RidesRules.ridesWorld(loop[i].gx, loop[i].gz), b = RidesRules.ridesWorld(loop[j].gx, loop[j].gz);
          P.x = a.x + (b.x - a.x) * f; P.z = a.z + (b.z - a.z) * f; P.y = 1.4; P.vy = 0;
        } else if (p.kind === 'drop'){
          const car = g.getObjectByName('car');
          P.x = g.position.x; P.z = g.position.z; P.y = (car ? car.position.y : 1.6) + 0.6; P.vy = 0;
        } else {
          P.x = g.position.x; P.z = g.position.z; P.y = 1.6; P.vy = 0;
        }
      }
    }
    // ghost preview
    const cell = !rd.boarding ? ridesCellAt(P.x, P.z) : null;
    const piece = cell ? RidesRules.ridesAt(rd.sv, cell.gx, cell.gz) : null;
    if (rd.ghost){ scene.remove(rd.ghost); rd.ghost = null; }
    if (cell && !piece && !rd.boarding){
      const ok = RidesRules.ridesFits(rd.sv, rd.sv.kind, cell.gx, cell.gz, rd.sv.rot);
      const w = RidesRules.ridesWorld(cell.gx, cell.gz);
      const gh = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.12, 2.2), new THREE.MeshBasicMaterial({color: ok ? '#2ec27e' : '#ff4d5e', transparent:true, opacity:0.35}));
      gh.position.set(w.x, 0.12, w.z);
      scene.add(gh);
      rd.ghost = gh;
      t302Keep(rd, gh);
    }
    let near = null;
    if (t302Near(rd.kit.x, rd.kit.z, 2.4)) near = 'kit';
    rd.near = near;
    const kind = RidesRules.ridesKind(rd.sv.kind);
    if (rd.boarding) t302Hud('Riding! E / Ⓧ or Ⓑ to hop off.', 'Hop off');
    else if (near === 'kit') t302Hud('E / Ⓧ — open the ride kit. Q or bumpers also cycle pieces.', '');
    else if (piece) t302Hud('E / Ⓧ — ride the ' + RidesRules.ridesKind(piece.kind).name + '. C picks it up if it is yours. Friends may ride too!', '🎢 Ride');
    else t302Hud((kind ? kind.emoji + ' ' + kind.name : 'Piece') + ' ready. E / Ⓧ to place on the green square. Q cycles, R rotates, C picks up.', '🧱 Place');
  }
  function ridesKey(e){
    if (e.code === 'KeyQ'){ const r = RidesRules.ridesCycleKind(rd.sv, e.shiftKey ? -1 : 1); ridesPersist(r.state); banner(r.kind.emoji + ' ' + r.kind.name); t302Snd('jump'); return true; }
    if (e.code === 'KeyR'){ const r = RidesRules.ridesRotate(rd.sv, 1); ridesPersist(r.state); banner('Rotated.'); return true; }
    if (e.code === 'KeyC'){
      const cell = ridesCellAt(P.x, P.z);
      const piece = cell ? RidesRules.ridesAt(rd.sv, cell.gx, cell.gz) : null;
      if (piece) ridesPickUp(piece.id);
      return true;
    }
    if (e.code === 'KeyE' || e.code === 'KeyF' || e.key === 'e' || e.key === 'f'){ ridesAct(); return true; }
    if (e.code === 'KeyX' && rd.boarding){ ridesDismount(); return true; }
    return false;
  }
  function ridesPad(jp){
    if (t302Edge('ridesLB', jp && jp[4])){ const r = RidesRules.ridesCycleKind(rd.sv, -1); ridesPersist(r.state); banner(r.kind.emoji + ' ' + r.kind.name); return true; }
    if (t302Edge('ridesRB', jp && jp[5])){ const r = RidesRules.ridesCycleKind(rd.sv, 1); ridesPersist(r.state); banner(r.kind.emoji + ' ' + r.kind.name); return true; }
    if (t302Edge('ridesY', jp && jp[3])){ const r = RidesRules.ridesRotate(rd.sv, 1); ridesPersist(r.state); return true; }
    if (t302Edge('ridesAct', jp && (jp[2] || jp[7]))){ if (typeof pad !== 'undefined') pad.jump = false; ridesAct(); return true; }
    return false;
  }

  /* ---------- Honeyhill Hive ---------- */
  function hiveState(){ return HiveRules.hiveLoad(t302Load(HiveRules.HIVE_KEY)); }
  function hivePersist(s){ t302Save(HiveRules.HIVE_KEY, s); if (hv) hv.sv = s; }

  function buildHive(){
    const sv = hiveState();
    hv = {trash:[], sv, flowers:[], bees:[], bears:[], near:null, cool:{}, lockToast:0};
    scene.background = new THREE.Color('#c8f0ff');
    scene.fog = new THREE.Fog('#c8f0ff', 30, 95);
    plat(0, 0, 0, 36, 36, '#7dce6a', 0.2);
    t302Mesh(new THREE.ConeGeometry(1.5, 2.6, 8), '#f4c84a', 0, 1.4, 0, hv);
    t302Mesh(new THREE.CylinderGeometry(0.85, 1.15, 1.3, 8), '#e0a020', 0, 0.7, 0, hv);
    t302Mesh(new THREE.SphereGeometry(0.18, 6, 5), '#6b3a1d', 0.3, 0.7, 0.9, hv);
    t302Lab('🍯 Home Hive', 0, 3.2, 0);
    hv.hive = {x:0, z:0};
    const trailPos = {meadow:[[-8,6],[-5,9],[-10,10],[ -7,13]], brook:[[8,6],[11,9],[8,12],[12,14]], glade:[[-4,-10],[0,-13],[4,-10],[2,-16]]};
    HiveRules.HIVE_FLOWERS.forEach((f, i) => {
      const spots = trailPos[f.trail] || [];
      const pos = spots[i % spots.length] || [0, 8];
      const locked = !HiveRules.hiveTrailOpen(sv, f.trail);
      const bloom = t302Mesh(new THREE.SphereGeometry(0.48, 8, 6), f.color, pos[0], 0.6, pos[1], hv, {transparent:true, opacity: locked ? 0.35 : 1});
      t302Mesh(new THREE.CylinderGeometry(0.06, 0.08, 0.6, 6), '#2f8f4a', pos[0], 0.3, pos[1], hv);
      hv.flowers.push({f, x:pos[0], z:pos[1], m:bloom, locked});
    });
    t302Lab('🌸 Clover Trail', -8, 2.4, 5);
    t302Lab(HiveRules.hiveTrailOpen(sv, 'brook') ? '💧 Brook Trail' : '🔒 Brook Trail (help a bear!)', 9, 2.4, 5);
    t302Lab(HiveRules.hiveTrailOpen(sv, 'glade') ? '✨ Lantern Glade' : '🔒 Lantern Glade (help a bear!)', 0, 2.4, -9);
    hv.trailLabs = true;
    hv.solo = !t302MpOn();
    if (hv.solo){
      const dens = [{id:'berry-bear', x:-12, z:2, color:'#8d5524'}, {id:'clover-bear', x:12, z:2, color:'#c48a5a'}, {id:'honey-bear', x:0, z:14, color:'#d4a017'}];
      dens.forEach(d => {
        const b = HiveRules.hiveBear(d.id);
        const body = t302Mesh(new THREE.SphereGeometry(0.7, 8, 6), d.color, d.x, 0.9, d.z, hv);
        t302Mesh(new THREE.SphereGeometry(0.45, 8, 6), d.color, d.x, 1.7, d.z, hv);
        t302Mesh(new THREE.SphereGeometry(0.12, 6, 5), '#1d2340', d.x - 0.15, 1.8, d.z + 0.3, hv);
        t302Mesh(new THREE.SphereGeometry(0.12, 6, 5), '#1d2340', d.x + 0.15, 1.8, d.z + 0.3, hv);
        t302Lab(b.emoji + ' ' + b.name, d.x, 2.6, d.z);
        hv.bears.push({id:d.id, x:d.x, z:d.z, m:body, b});
      });
    }
    for (let i = 0; i < sv.bees; i++){
      const bee = t302Mesh(new THREE.SphereGeometry(0.14, 6, 5), i % 2 ? '#1d2340' : '#ffd23f', 0.4 * i, 1.6, 0.2, hv);
      hv.bees.push({m:bee, o: i * 0.8});
    }
    t302Mesh(new THREE.BoxGeometry(1.8, 1.6, 0.2), '#c48a5a', 0, 1.0, 8, hv);
    t302Lab('🐝 Quest Board', 0, 2.2, 8);
    const hflow = ['#ff7aa8','#ffd23f','#7ad46a','#c77dff'];
    for (let i = 0; i < 16; i++){
      const a = (i / 16) * Math.PI * 2;
      t302Flower(hv, Math.cos(a) * 15, Math.sin(a) * 15, hflow[i % hflow.length]);
    }
    [[-6,0],[6,0],[0,-6],[0,10],[-10,-6],[10,-6]].forEach(p => t302Mesh(new THREE.SphereGeometry(0.32, 6, 5), '#8a8f7a', p[0], 0.2, p[1], hv));
    [[-16,8],[16,8],[-14,-12],[14,-12],[-16,-4],[16,-4],[-10,16],[10,16]].forEach(p => t302Tree(hv, p[0], p[1], '#2f8f4a', 2.7));

    checkpoints[0] = {idx:0, spawn:{x:0,y:0.5,z:6}, flag:new THREE.Object3D()};
  }
  function hiveEnter(){
    if (!hv) return;
    cam.pitch = 0.4; cam.dist = 14;
    t302Note('play:hive'); t302Ach('hive-visit');
    t302BindHud();
    banner('🐝 Honeyhill Hive! Walk the open flower trails to collect pollen, then make honey at the hive. Bear neighbors visit in solo play — no fighting, ever.');
    t302Hud('Goal: collect pollen, make honey, help the bears. Pollen ' + hv.sv.pollen + '  Honey ' + hv.sv.honey, '🍯 Honey');
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
        const label = st === 'done' ? 'Done!' : (st === 'open' ? 'Turn in' : 'Help');
        return `<div class="t297row"><span>${b.emoji} ${b.name} — ${b.line} (${st})</span>${st === 'done' ? '' : `<button type="button" data-hq="${b.id}">${label}</button>`}</div>`;
      }).join('') + (hv.solo ? '<p>You can also talk to a bear with E / Ⓧ.</p>' : '<p>Bear neighbors visit in single-player. You can still turn in quests from this board, and share the trails with real friends.</p>');
    box.querySelectorAll('[data-hq]').forEach(btn => { btn.onclick = ev => { ev.preventDefault(); hiveDoQuest(btn.getAttribute('data-hq')); hivePaintQuest(); }; });
  }
  function hiveDoQuest(id){
    if (!hv.sv.quests[id]){
      const r = HiveRules.hiveStartQuest(hv.sv, id);
      if (r.ok){ hivePersist(r.state); banner(r.bear.emoji + ' ' + r.bear.name + ': "' + r.bear.line + '"'); t302Snd('jump'); }
      return;
    }
    const r = HiveRules.hiveTurnIn(hv.sv, id);
    if (!r.ok){
      if (r.why === 'done') banner('They already thanked you! Enjoy the sticker.');
      else if (r.why === 'honey') banner('They still need ' + r.need + ' more honey.');
      else if (r.why === 'visit') banner('Walk their trail first, then come back!');
      return;
    }
    hivePersist(r.state);
    t302Note('hive-quest'); t302Ach('hive-sticker');
    t302Pay(8, r.sticker ? r.sticker.emoji + ' ' + r.sticker.name : 'Quest done');
    t302Snd('win');
    if (r.sticker) banner(r.bear.emoji + ' Thank you! You earned the ' + r.sticker.name + '!' + (r.trail ? ' A new flower trail opened!' : ''));
    hiveRefreshLocks();
  }
  function hiveAct(){
    if (!hv) return false;
    if (hv.near && hv.near.kind === 'hive'){
      const r = HiveRules.hiveMakeHoney(hv.sv);
      if (!r.ok){ banner('Need ' + r.need + ' more pollen to make a pot of honey.'); t302Snd('hit'); return true; }
      hivePersist(r.state);
      t302Note('hive-honey', r.pots); t302Ach('hive-honey'); t302Board('hive-honey', r.state.made);
      t302Pay(3 * r.pots, '🍯 Honey');
      banner('🍯 Made ' + r.pots + ' pot' + (r.pots > 1 ? 's' : '') + ' of honey!');
      return true;
    }
    if (hv.near && hv.near.kind === 'bear'){ hiveDoQuest(hv.near.id); t302Open('hiveQuest'); return true; }
    t302Open('hiveQuest');
    return true;
  }
  function hiveRefreshLocks(){
    hv.flowers.forEach(fl => {
      fl.locked = !HiveRules.hiveTrailOpen(hv.sv, fl.f.trail);
      if (fl.m && fl.m.material){ fl.m.material.transparent = true; fl.m.material.opacity = fl.locked ? 0.35 : 1; }
    });
    while (hv.bees.length < hv.sv.bees){
      const bee = t302Mesh(new THREE.SphereGeometry(0.14, 6, 5), '#ffd23f', P.x, 1.6, P.z, hv);
      hv.bees.push({m:bee, o: hv.bees.length * 0.8});
    }
  }
  function hiveUpdate(dt){
    if (!hv) return;
    dt = t302Dt(dt);
    hv.bees.forEach((b, i) => {
      const a = time * 2 + b.o;
      const r = 0.8 + (i % 3) * 0.25;
      b.m.position.set(P.x + Math.cos(a) * r, 1.4 + Math.sin(time * 3 + i) * 0.2, P.z + Math.sin(a) * r);
    });
    hv.flowers.forEach(fl => {
      if (fl.m) fl.m.position.y = 0.6 + Math.sin(time * 2 + fl.x) * 0.08;
      if (t302Near(fl.x, fl.z, 1.4)){
        if (fl.locked){
          if (time - (hv.lockToast || 0) > 2.2){ hv.lockToast = time; banner('This trail is still closed. Help a bear neighbor to open it!'); }
          return;
        }
        const last = hv.cool[fl.f.id] || 0;
        if (time - last > 1.2){
          hv.cool[fl.f.id] = time;
          const r = HiveRules.hiveCollect(hv.sv, fl.f.id);
          if (r.ok){
            hivePersist(r.state);
            t302Note('hive-pollen');
            t302Tone([880, 1040], 0.05, 'sine', 0.035);
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
    if (near && near.kind === 'hive') t302Hud('E / Ⓧ — turn pollen into honey. Pollen ' + hv.sv.pollen + '  Honey ' + hv.sv.honey, '🍯 Make honey');
    else if (near && near.kind === 'bear') t302Hud('E / Ⓧ — talk to ' + HiveRules.hiveBear(near.id).name + '. They never fight.', '🧸 Talk');
    else t302Hud('Goal: gather pollen on open trails, make honey, help the bears. Pollen ' + hv.sv.pollen + '  Honey ' + hv.sv.honey + '  Bees ' + hv.sv.bees + '. Open Quests to start or turn in a job.', '');
  }

  /* ---------- Campfire Grove (kid-friendly horror) ---------- */
  function campState(){ return CampRules.campLoad(t302Load(CampRules.CAMP_KEY)); }
  function campPersist(s){ t302Save(CampRules.CAMP_KEY, s); if (cg) cg.sv = s; }

  function campMakeGloam(st, cartoon){
    const g = new THREE.Group();
    const col = cartoon ? '#6b4aa0' : '#1a1524';
    const mat = new THREE.MeshLambertMaterial({color:col, emissive: cartoon ? '#2a1840' : '#0d0814', transparent:true, opacity: cartoon ? 0.92 : 0.9});
    const body = new THREE.Mesh(new THREE.ConeGeometry(0.85, 2.8, 6), mat);
    body.position.y = 1.5; g.add(body);
    const a1 = new THREE.Mesh(new THREE.ConeGeometry(0.16, 1.7, 5), mat);
    a1.position.set(-0.75, 1.35, 0); a1.rotation.z = 0.55; g.add(a1);
    const a2 = new THREE.Mesh(new THREE.ConeGeometry(0.16, 1.7, 5), mat);
    a2.position.set(0.75, 1.35, 0); a2.rotation.z = -0.55; g.add(a2);
    const eyeCol = cartoon ? '#ffe566' : '#9dff7a';
    const eyeM = new THREE.MeshBasicMaterial({color: eyeCol});
    const haloM = new THREE.MeshBasicMaterial({color: eyeCol, transparent:true, opacity: 0.32});
    const e1 = new THREE.Mesh(new THREE.SphereGeometry(0.2, 8, 6), eyeM); e1.position.set(-0.22, 2.15, 0.42); g.add(e1);
    const e2 = new THREE.Mesh(new THREE.SphereGeometry(0.2, 8, 6), eyeM); e2.position.set(0.22, 2.15, 0.42); g.add(e2);
    const h1 = new THREE.Mesh(new THREE.SphereGeometry(0.38, 8, 6), haloM); h1.position.copy(e1.position); g.add(h1);
    const h2 = new THREE.Mesh(new THREE.SphereGeometry(0.38, 8, 6), haloM); h2.position.copy(e2.position); g.add(h2);
    g.userData.eyes = [e1, e2];
    scene.add(g);
    t302Keep(st, g);
    return g;
  }
  function campEyes(st, n){
    const arr = [];
    for (let i = 0; i < n; i++){
      const ang = (i / n) * Math.PI * 2 + 0.4;
      const d = 13 + (i % 3) * 1.6;
      const g = new THREE.Group();
      const m = new THREE.MeshBasicMaterial({color:'#7dff6a'});
      const halo = new THREE.MeshBasicMaterial({color:'#7dff6a', transparent:true, opacity:0.28});
      const a = new THREE.Mesh(new THREE.SphereGeometry(0.14, 6, 5), m); a.position.set(-0.2, 0, 0); g.add(a);
      const b = new THREE.Mesh(new THREE.SphereGeometry(0.14, 6, 5), m); b.position.set(0.2, 0, 0); g.add(b);
      const ha = new THREE.Mesh(new THREE.SphereGeometry(0.28, 6, 5), halo); ha.position.set(-0.2, 0, 0); g.add(ha);
      const hb = new THREE.Mesh(new THREE.SphereGeometry(0.28, 6, 5), halo); hb.position.set(0.2, 0, 0); g.add(hb);
      g.position.set(Math.sin(ang) * d, 1.7 + (i%2)*0.35, Math.cos(ang) * d);
      scene.add(g); t302Keep(st, g);
      arr.push({g, ang, d});
    }
    return arr;
  }

  function buildCamp(){
    const sv = campState();
    const started = CampRules.campStartNight(sv, t302Now(), t302MpOn());
    campPersist(started.state);
    const less = !!started.state.lessScary;
    cg = {trash:[], sv: started.state, run: started.run, piles:[], buddy:null, light:null, hemi:null, fire:null, gloam:null, eyes:[], near:null, done:false, ambT:0, scareT:0};
    const bg = less ? '#2a3150' : '#070812';
    scene.background = new THREE.Color(bg);
    scene.fog = new THREE.Fog(bg, less ? 16 : 8, less ? 48 : 28);
    plat(0, 0, 0, 30, 30, less ? '#243228' : '#121a14', 0.2);
    plat(0, 0.06, 0, 8, 8, '#1c261c', 0.06);
    const tent = t302Mesh(new THREE.ConeGeometry(2.2, 2.6, 4), '#2a1c14', -8, 1.3, -4, cg);
    tent.rotation.y = Math.PI / 4;
    t302Lab('⛺ Tent', -8, 2.8, -4);
    t302Mesh(new THREE.BoxGeometry(2.4, 0.6, 1.2), '#4a2e1a', 8, 0.35, -3, cg);
    t302Lab('🧺 Craft Bench', 8, 2.2, -3);
    cg.bench = {x:8, z:-3};
    t302Mesh(new THREE.CylinderGeometry(0.8, 1, 0.3, 8), '#3d2a1a', 0, 0.2, 0, cg);
    const flame = new THREE.Mesh(new THREE.ConeGeometry(0.7, 1.7, 6), new THREE.MeshBasicMaterial({color:'#ff9f1c'}));
    flame.position.set(0, 1.15, 0); scene.add(flame); t302Keep(cg, flame);
    const glow = new THREE.Mesh(new THREE.ConeGeometry(0.38, 1.0, 6), new THREE.MeshBasicMaterial({color:'#ffe566'}));
    glow.position.set(0, 1.25, 0); scene.add(glow); t302Keep(cg, glow);
    cg.fire = {flame, glow};
    const light = new THREE.PointLight('#ffb347', less ? 1.6 : 2.1, less ? 28 : 20);
    light.position.set(0, 2.2, 0);
    scene.add(light); t302Keep(cg, light); cg.light = light;
    cg.lanternLt = new THREE.PointLight('#fff2c2', 0, 10);
    cg.lanternLt.position.set(0, 1.6, 0);
    scene.add(cg.lanternLt); t302Keep(cg, cg.lanternLt);
    t302Lab('🔥 Campfire', 0, 2.6, 0);
    const ring = [[-6,5],[-3,7],[3,7],[6,5],[7,0],[-7,0],[-5,-6],[5,-6]];
    ring.forEach((pz, i) => {
      t302Mesh(new THREE.BoxGeometry(0.9, 0.3, 0.4), '#8d5524', pz[0], 0.25, pz[1], cg);
      t302Mesh(new THREE.BoxGeometry(0.7, 0.25, 0.3), '#6b3a1d', pz[0] + 0.1, 0.4, pz[1], cg);
      cg.piles.push({id:i, x:pz[0], z:pz[1]});
    });
    [[-11,-8],[-12,8],[12,-7],[11,9],[-9,12],[9,-11]].forEach(p => t302Tree(cg, p[0], p[1], '#16351c', 3.1));
    if (cg.run.buddy){
      const body = t302Mesh(new THREE.BoxGeometry(0.6, 1.1, 0.4), '#3a86ff', 2.2, 0.9, 1.6, cg);
      t302Mesh(new THREE.BoxGeometry(0.45, 0.45, 0.45), '#ffd23f', 2.2, 1.65, 1.6, cg);
      t302Lab('🌟 Pip the Camp Buddy', 2.2, 2.5, 1.6);
      cg.buddy = body;
    }
    cg.gloam = campMakeGloam(cg, less);
    cg.eyes = campEyes(cg, less ? 4 : 7);
    campPaintLessBtn();
    checkpoints[0] = {idx:0, spawn:{x:0,y:0.5,z:8}, flag:new THREE.Object3D()};
  }
  function campEnter(){
    if (!cg) return;
    cam.pitch = 0.28; cam.dist = 12;
    t302Note('play:camp'); t302Ach('camp-visit');
    t302BindHud();
    const less = !!cg.sv.lessScary;
    banner(less
      ? '🔥 Campfire Grove. Keep the fire bright until sunrise. The Gloam is out there, but Less scary is on — no sudden scares.'
      : '🔥 Campfire Grove. Keep the fire bright until sunrise. Glowing eyes watch from the dark — the Gloam creeps closer if the fire dies. Shine a lantern or stoke the fire to scare it away. No fighting, no gore.');
    if (cg.run.buddy) setTimeout(() => { if (cg && !cg.done) banner('🌟 Pip: "I will watch the trees. You keep the fire fed!"'); }, 2200);
    t302Hud('Goal: survive until sunrise. Gather sticks, feed the fire, craft a lantern. The Gloam hates bright light.', '🔥 Stoke');
    const vig = document.getElementById('t302Vignette'); if (vig) vig.classList.add('show');
  }
  function campPaintLessBtn(){
    const b = document.getElementById('t302LessBtn');
    if (b && cg) b.textContent = cg.sv.lessScary ? '😈 More spooky' : '😌 Less scary';
  }
  function campToggleLess(){
    if (!cg) return;
    cg.sv = CampRules.campSetLessScary(cg.sv, !cg.sv.lessScary);
    campPersist(cg.sv);
    campPaintLessBtn();
    banner(cg.sv.lessScary ? 'Less scary is on. The Gloam stays farther back, and there are no sudden scares.' : 'Spooky mode is on. Keep that fire bright!');
    t302Snd('cp');
  }
  function campPaintCraft(){
    const box = document.getElementById('campCraftList');
    if (!box || !cg) return;
    box.innerHTML = CampRules.CAMP_CRAFT.map(it => {
      const have = cg.sv.crafted.indexOf(it.id) >= 0;
      return `<div class="t297row${have ? ' dim' : ''}"><span>${it.emoji} ${it.name} — ${it.sticks} sticks ${have ? '(packed!)' : ''}</span>${have ? '' : `<button type="button" data-cc="${it.id}">Craft</button>`}</div>`;
    }).join('') + `<div class="t297row"><span>🪵 Sticks ${cg.sv.sticks}  ·  sunrises ${cg.sv.sunrises}</span></div>` +
      `<div class="t297row"><span>😌 Less scary: ${cg.sv.lessScary ? 'on' : 'off'} — softer light, no jump-scare-lite, the Gloam stays farther away.</span><button type="button" data-cless="1">Toggle</button></div>` +
      (CampRules.campHas(cg.sv, 'lantern') ? '<p>Press L or the Lantern action to shine it and push the Gloam back.</p>' : '<p>Craft a Glow Lantern to shine light and scare the Gloam away.</p>');
    box.querySelectorAll('[data-cc]').forEach(btn => { btn.onclick = ev => { ev.preventDefault(); campDoCraft(btn.getAttribute('data-cc')); }; });
    const tb = box.querySelector('[data-cless]');
    if (tb) tb.onclick = ev => { ev.preventDefault(); campToggleLess(); campPaintCraft(); };
  }
  function campDoCraft(id){
    const r = CampRules.campCraft(cg.sv, id);
    if (!r.ok){ banner(r.why === 'sticks' ? 'Need ' + r.need + ' more sticks.' : r.why === 'have' ? 'You already crafted that!' : 'Cannot craft that.'); return; }
    campPersist(r.state);
    t302Ach('camp-craft'); t302Note('camp-craft');
    t302Snd('cp');
    banner(r.item.emoji + ' Crafted a ' + r.item.name + '!' + (r.item.id === 'lantern' ? ' Press L to shine it at the Gloam.' : ' The blanket slows how fast the fire fades.'));
    campPaintCraft();
  }
  function campShowEnd(win){
    const title = document.getElementById('campWinTitle');
    const body = document.getElementById('campWinBody');
    const pay = win ? CampRules.campReward(cg.run) : 0;
    if (title) title.textContent = win ? '🌅 Sunrise!' : '👁️ The Gloam came too close';
    if (body) body.textContent = win
      ? ('You kept the grove safe until sunrise! The Gloam faded with the light. ' + (pay ? ('+' + pay + ' 🪙') : ''))
      : 'The Gloam reached the fire circle… but everyone is okay. Stoke the fire, shine a lantern, and try another cozy-spooky night!';
    if (win){ t302Pay(pay, '🌅 Sunrise'); t302Snd('win'); try { if (typeof confetti === 'function') confetti(); } catch (e){} }
    else t302Snd('alarm');
    t302Open('campWin');
  }
  function campRetry(){
    if (typeof t297OverlayClose === 'function') t297OverlayClose('campWin');
    const started = CampRules.campStartNight(cg.sv, t302Now(), t302MpOn());
    campPersist(started.state);
    cg.sv = started.state;
    cg.run = started.run;
    cg.done = false;
    cg.scareT = 0;
    const scare = document.getElementById('t302Scare'); if (scare) scare.classList.remove('show');
    banner('Another night in the grove. Keep the fire bright!');
  }
  function campShineNow(){
    const r = CampRules.campShine(cg.sv, cg.run);
    if (!r.ok){
      if (r.why === 'lantern') banner('Craft a Glow Lantern at the bench first!');
      else if (r.why === 'wait') banner('The lantern is still warming up.');
      return false;
    }
    cg.run = r.run;
    t302Snd('cp');
    t302Tone([520, 780, 1040], 0.07, 'sine', 0.05);
    banner('🏮 The lantern glows! The Gloam shrinks back into the trees.');
    return true;
  }
  function campAct(){
    if (!cg || cg.done) return false;
    if (cg.near && cg.near.kind === 'bench'){ t302Open('campCraft'); return true; }
    if (cg.near && cg.near.kind === 'pile'){
      const r = CampRules.campGather(cg.sv, cg.run, cg.near.id);
      if (!r.ok){ banner(r.why === 'empty' ? 'That pile is picked clean. Try another!' : 'Cannot gather there.'); return true; }
      campPersist(r.state); cg.run = r.run;
      t302Note('camp-stick'); t302Snd('jump');
      banner('🪵 Picked up a stick. ' + r.state.sticks + ' in your arms.');
      return true;
    }
    if (cg.near && cg.near.kind === 'fire'){
      const r = CampRules.campAddStick(cg.sv, cg.run);
      if (!r.ok){ banner('Gather sticks from the piles first, then feed the fire.'); return true; }
      campPersist(r.state); cg.run = r.run;
      t302Send({a:'camp-stick'});
      t302Note('camp-stoke'); t302Snd('boing');
      banner('🔥 The fire brightens! The Gloam backs away.');
      return true;
    }
    if (CampRules.campHas(cg.sv, 'lantern')) return campShineNow();
    return false;
  }
  function campUpdate(dt){
    if (!cg) return;
    dt = t302Dt(dt);
    const less = !!cg.sv.lessScary;
    if (!cg.done){
      CampRules.campTick(cg.run, dt, {lessScary:less, blanket: CampRules.campHas(cg.sv, 'blanket')});
      if (cg.run.scarePop && !cg.scareT && !less){
        cg.scareT = 0.28;
        const el = document.getElementById('t302Scare'); if (el) el.classList.add('show');
        t302Tone([180, 90, 220], 0.09, 'triangle', 0.07);
        banner('👁️ Eyes in the dark! Stoke the fire or shine a lantern!');
        cg.run.scarePop = false;
      } else if (cg.run.scarePop && less){
        cg.run.scarePop = false;
        banner('The Gloam shuffles a little closer. Feed the fire when you can.');
      }
      if (cg.run.won || cg.run.failed){
        cg.done = true;
        const fin = CampRules.campFinish(cg.sv, cg.run);
        campPersist(fin.state);
        if (fin.why === 'sunrise'){ t302Note('camp-sunrise'); t302Ach('camp-sunrise'); t302Board('camp-sunrises', fin.state.sunrises); }
        campShowEnd(fin.why === 'sunrise');
      }
    }
    if (cg.scareT){
      cg.scareT = Math.max(0, cg.scareT - dt);
      if (cg.scareT <= 0){ const el = document.getElementById('t302Scare'); if (el) el.classList.remove('show'); }
    }
    const k = cg.run.fire || 0;
    if (cg.light){ cg.light.intensity = (less ? 0.55 : 0.25) + k * (less ? 1.4 : 1.7); cg.light.distance = (less ? 20 : 12) + k * 10; }
    if (cg.lanternLt){
      cg.lanternLt.intensity = (cg.run.lantern || 0) > 0 ? 1.2 : 0;
      if (P) cg.lanternLt.position.set(P.x, 1.7, P.z);
    }
    if (cg.fire){
      const s = 0.6 + k * 0.8 + Math.sin(time * 8) * 0.05;
      cg.fire.flame.scale.set(s, 0.7 + k * 0.9, s);
      cg.fire.glow.scale.set(s * 0.7, 0.6 + k, s * 0.7);
    }
    const dawn = Math.max(0, (cg.run.t / CampRules.CAMP_NIGHT) - 0.78) / 0.22;
    const night = less ? '#2a3150' : '#070812';
    const morn = '#f4c084';
    const bg = new THREE.Color(night).lerp(new THREE.Color(morn), Math.min(1, Math.max(0, dawn)));
    scene.background = bg;
    if (scene.fog){
      scene.fog.color.copy(bg);
      scene.fog.near = less ? 16 - k * 2 : 10 + k * 8;
      scene.fog.far = less ? 50 : 36 + k * 18;
    }
    const vig = document.getElementById('t302Vignette');
    if (vig){
      const dark = Math.max(0, 1 - k) * (less ? 0.45 : 0.9) * (1 - Math.min(1, dawn));
      vig.style.opacity = String(0.35 + dark * 0.65);
      vig.classList.add('show');
    }
    // Gloam placement: creep around the ring, face the fire
    if (cg.gloam){
      const ang = Math.atan2(P ? P.x : 0, P ? P.z : 1) + Math.sin(time * 0.35) * 0.25;
      const d = Math.max(1.6, cg.run.gloam || 16);
      cg.gloam.position.set(Math.sin(ang) * d, 0, Math.cos(ang) * d);
      cg.gloam.lookAt(0, 1.2, 0);
      const scare = d < 5 ? 1.15 : 1;
      cg.gloam.scale.setScalar(scare);
    }
    (cg.eyes || []).forEach((e, i) => {
      const pulse = 0.7 + Math.sin(time * 3 + i) * 0.3;
      const hide = (cg.run.gloam || 16) < e.d - 2 ? 0.15 : pulse;
      e.g.children.forEach(c => { c.scale.setScalar(hide); });
    });
    if (cg.buddy) cg.buddy.position.y = 0.9 + Math.sin(time * 2) * 0.04;
    // gentle ambient (quiet, not a jump scare)
    cg.ambT = (cg.ambT || 0) - dt;
    if (cg.ambT <= 0 && !cg.done && !less){
      cg.ambT = 4.5 + Math.random() * 4;
      t302Tone([90, 70], 0.18, 'sine', 0.02);
    }
    t302Meter(true, k, 'Fire ' + Math.round(k * 100) + '%  ·  ' + Math.max(0, Math.ceil(CampRules.CAMP_NIGHT - cg.run.t)) + 's to sunrise' + (cg.run.lantern ? '  ·  🏮' : ''));
    let near = null;
    if (t302Near(0, 0, 2.2)) near = {kind:'fire'};
    if (t302Near(cg.bench.x, cg.bench.z, 2)) near = {kind:'bench'};
    cg.piles.forEach(p => { if (t302Near(p.x, p.z, 1.5)) near = {kind:'pile', id:p.id}; });
    cg.near = near;
    if (cg.done && cg.run.won) t302Hud('Sunrise reached. The grove is safe.', '');
    else if (cg.done) t302Hud('The Gloam came close, but everyone is okay. Try again!', '');
    else if (near && near.kind === 'fire') t302Hud('E / Ⓧ — add a stick and scare the Gloam back.', '🔥 Stoke');
    else if (near && near.kind === 'pile') t302Hud('E / Ⓧ — gather sticks.', '🪵 Gather');
    else if (near && near.kind === 'bench') t302Hud('E / Ⓧ — craft a blanket or lantern, or change Less scary.', '');
    else if (CampRules.campHas(cg.sv, 'lantern')) t302Hud('Goal: survive until sunrise. L or the Lantern action shines light at the Gloam.', '🏮 Lantern');
    else t302Hud('Goal: survive until sunrise. Gather sticks, keep the fire bright, watch the trees.', '');
  }

  /* ---------- shared hooks ---------- */
  function t302Pointer(down, ev, fromBtn){
    if (mode === 'meadow') meadowPointer(down, fromBtn);
    else if (down && fromBtn) t302Act();
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
    const step = t302Dt(dt);
    if (gd) gardenUpdate(step);
    if (mw) meadowUpdate(step);
    if (rd) ridesUpdate(step);
    if (hv) hiveUpdate(step);
    if (cg) campUpdate(step);
  }
  function t302Key(e){
    if (typeof t297EatOverlayKey === 'function' && t297EatOverlayKey(e)) return true;
    if (e.repeat && mode !== 'meadow') return false;
    if (mode === 'garden'){
      if (e.code === 'KeyE' || e.code === 'KeyF' || e.key === 'e' || e.key === 'f'){ if (!e.repeat) gardenAct(); return true; }
      return false;
    }
    if (mode === 'meadow'){
      if (e.code === 'KeyE' || e.code === 'KeyF' || e.key === 'e' || e.key === 'f'){
        if (mw && mw.near && e.type !== 'keyup' && !e.repeat){ meadowAct(); return true; }
        if (e.type === 'keyup'){ if (mw && mw.charging) meadowRelease(); return true; }
        if (!e.repeat) meadowBeginCharge();
        return true;
      }
      return false;
    }
    if (mode === 'rides') return ridesKey(e);
    if (mode === 'hive'){
      if (e.code === 'KeyE' || e.code === 'KeyF' || e.key === 'e' || e.key === 'f'){ if (!e.repeat) hiveAct(); return true; }
      return false;
    }
    if (mode === 'camp'){
      if (e.code === 'KeyL'){ if (!e.repeat) campShineNow(); return true; }
      if (e.code === 'KeyE' || e.code === 'KeyF' || e.key === 'e' || e.key === 'f'){ if (!e.repeat) campAct(); return true; }
      return false;
    }
    return false;
  }
  function t302Pad(jp, s){
    if (typeof t297EatOverlayPad === 'function' && t297EatOverlayPad(jp)) return true;
    if (mode === 'meadow'){
      const rt = !!(jp && (jp[7] || jp.rt)) || !!(s && ((s.v && s.v[7] > 0.5) || s.rt));
      if (rt){ if (typeof pad !== 'undefined') pad.jump = false; meadowBeginCharge(); return true; }
      if (mw && mw.charging && !rt){ meadowRelease(); return true; }
      if (t302Edge('mwX', jp && jp[2])){ meadowAct(); return true; }
      return false;
    }
    if (mode === 'rides') return ridesPad(jp);
    if (mode === 'camp' && t302Edge('campL', jp && jp[5]) && CampRules.campHas(cg && cg.sv, 'lantern')){ campShineNow(); return true; }
    if (t302Edge('actX', jp && (jp[2] || jp[3] || jp[7]))){ if (typeof pad !== 'undefined') pad.jump = false; return t302Act(); }
    return false;
  }
  function t302Stop(){
    [gd, mw, rd, hv, cg].forEach(st => {
      if (!st) return;
      (st.trash || []).forEach(m => { try { scene.remove(m); } catch (e){} });
    });
    if (rd && rd.ghost){ try { scene.remove(rd.ghost); } catch (e){} rd.ghost = null; }
    if (rd && rd.boarding) rd.boarding = null;
    gd = mw = rd = hv = cg = null;
    t302Meter(false);
    t302Hud('', '');
    t302Box(false);
    const vig = document.getElementById('t302Vignette'); if (vig) vig.classList.remove('show');
    const sc = document.getElementById('t302Scare'); if (sc) sc.classList.remove('show');
    if (typeof t297OverlayClose === 'function') T302_OVERLAY_IDS.forEach(id => t297OverlayClose(id));
    T302_OVERLAY_IDS.forEach(id => { const el = document.getElementById(id); if (el){ el.classList.remove('show'); el.style.display = ''; } });
    const ob = document.getElementById('obby');
    if (ob) T302_MODES.forEach(m => ob.classList.remove(m + 'mode'));
  }
  function t302FromNet(g, d){
    const a = d && d.a;
    if (a === 'camp-stick' && cg && cg.run && !cg.done){
      const r = CampRules.campAddStick(cg.sv, cg.run, true);
      if (r.ok){ cg.run = r.run; banner('🔥 A friend fed the fire! The Gloam backs away.'); }
    }
    if (a === 'camp-shine' && cg && cg.run && !cg.done){
      cg.run.lantern = 5; cg.run.threat = 0; banner('🏮 A friend shone a lantern!');
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
      stockGarden(){ if (!gd) return; let s = GardenRules.gardenGrantStarter(gd.sv); const r1 = GardenRules.gardenBuy(s, 'sprout', 999); const r2 = GardenRules.gardenBuy(r1.state, 'melon', 999); try { setCoins(999); } catch(e){} gardenPersist(r2.state); const plant = GardenRules.gardenPlant(r2.state, 0, 'sprout', t302Now() - GardenRules.gardenSeed('sprout').grow, 999); const plant2 = GardenRules.gardenPlant(plant.ok?plant.state:r2.state, 4, 'melon', t302Now() - GardenRules.gardenSeed('melon').grow * 0.6, 999); const use = plant2.ok?plant2.state:(plant.ok?plant.state:r2.state); gardenPersist(use); gd.plots.forEach(p => gardenGrowMesh(p)); },
      fillRides(){ if (!rd) return; [['carousel',2,2,0],['swings',5,2,0],['drop',1,5,0],['cups',5,5,0],['curve',0,0,0],['curve',0,1,1],['curve',1,1,2],['curve',1,0,3]].forEach(q => { const r = RidesRules.ridesPlace(rd.sv, q[0], q[1], q[2], q[3], 'me'); if (r.ok){ rd.sv = r.state; ridesBuildPiece(r.piece); } }); ridesPersist(rd.sv); },
      fillHive(){ if (!hv) return; hv.sv.pollen = 20; hv.sv.honey = 3; hivePersist(hv.sv); },
      spookyCamp(){ if (!cg) return; cg.run.t = CampRules.CAMP_NIGHT * 0.35; cg.run.fire = 0.38; cg.run.gloam = 7.5; cg.sv.lessScary = false; }
    };
  } catch (e){}
