  const T302_MODES = ['garden','meadow','rides','hive','camp'];
  const T302_OVERLAY_IDS = ['gardenShop','meadowBook','ridesPalette','hiveQuest','campCraft','campWin','campJournal'];
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
  function t302PaintCoins(){
    const el = document.getElementById('t302Coins');
    if (!el) return;
    const on = (typeof mode !== 'undefined' && mode === 'garden');
    el.style.display = on ? 'block' : 'none';
    if (on) el.textContent = '🪙 Your coins: ' + t302Coins();
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
    ['gardenShopBtn','meadowBookBtn','ridesPaletteBtn','ridesHelpBtn','ridesDelBtn','ridesUndoBtn','ridesTestBtn','hiveQuestBtn','campCraftBtn','t302JournalBtn','t302LessBtn','campWinAgain','campWinClose','campJournalX','t302TutNext','t302TutSkip'].forEach(id => {
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
    if (which === 't302JournalBtn' || which === 'campJournal'){ campOpenJournal(); return; }
    if (which === 'ridesDelBtn'){ ridesToggleDel(); return; }
    if (which === 'ridesUndoBtn'){ ridesUndoNow(); return; }
    if (which === 'ridesTestBtn'){ ridesTestRide(); return; }
    if (which === 'campWinAgain'){ campRetry(); return; }
    if (which === 'campWinClose'){ if (typeof t297OverlayClose === 'function') t297OverlayClose('campWin'); return; }
    if (which === 'ridesHelpBtn'){ ridesHelp(); return; }
    if (which === 't302TutNext'){ ridesTutGo(); return; }
    if (which === 't302TutSkip'){ ridesTutSkipNow(); return; }
    const map = {gardenShopBtn:'gardenShop', meadowBookBtn:'meadowBook', ridesPaletteBtn:'ridesPalette', hiveQuestBtn:'hiveQuest', campCraftBtn:'campCraft', t302JournalBtn:'campJournal'};
    const id = map[which] || which;
    if (id === 'gardenShop') gardenPaintShop();
    if (id === 'meadowBook') meadowPaintBook();
    if (id === 'ridesPalette') ridesPaintPalette();
    if (id === 'hiveQuest') hivePaintQuest();
    if (id === 'campCraft') campPaintCraft();
    if (id === 'campJournal' || which === 't302JournalBtn') campPaintJournal();
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
    const item = GardenRules.gardenItem({id: plot.seed, rarity: plot.rarity});
    const rare = item && GardenRules.gardenRarity(item.rarity);
    const col = (rare && rare.color) || (seed ? seed.color : '#7ad46a');
    const h = st === 1 ? 0.5 : st === 2 ? 1.1 : 1.7;
    const stem = t302Mesh(new THREE.CylinderGeometry(0.06, 0.08, h, 6), '#2f8f4a', p.x, 0.2 + h/2, p.z, gd);
    const top = t302Mesh(st === 3 ? new THREE.SphereGeometry(0.46, 10, 8) : new THREE.ConeGeometry(0.3, 0.55, 7), col, p.x, 0.2 + h + 0.2, p.z, gd);
    const bits = [stem, top];
    if (rare && rare.glow){
      const glow = new THREE.Mesh(new THREE.SphereGeometry(st === 3 ? 0.72 : 0.48, 10, 8), new THREE.MeshBasicMaterial({color: rare.glow, transparent:true, opacity: 0.35}));
      glow.position.set(p.x, 0.2 + h + 0.2, p.z);
      scene.add(glow); t302Keep(gd, glow);
      bits.push(glow);
    }
    if (st === 3){
      const spark = t302Mesh(new THREE.SphereGeometry(0.12, 6, 5), '#fff4c2', p.x + 0.35, 0.2 + h + 0.45, p.z, gd);
      bits.push(spark);
    }
    if (rare && item.rarity !== 'common'){
      bits.push(t302Lab((seed ? seed.emoji + ' ' : '') + rare.name, p.x, 0.2 + h + 1.15, p.z));
    }
    p.mesh = bits;
    p.stage = st;
  }
  function gardenPaintStand(){
    (gd.standM || []).forEach(m => { try { scene.remove(m); } catch (e){} });
    gd.standM = [];
    (gd.sv.stand || []).forEach((sid, i) => {
      if (!sid) return;
      const item = GardenRules.gardenItem(sid);
      const seed = item && GardenRules.gardenSeed(item.id);
      const rare = item && GardenRules.gardenRarity(item.rarity);
      const pos = gd.standPos[i];
      if (!pos || !seed) return;
      const m = t302Mesh(new THREE.SphereGeometry(0.38, 8, 6), (rare && rare.color) || seed.color, pos.x, 1.4, pos.z, gd);
      gd.standM.push(m);
      if (rare && rare.glow){
        const glow = new THREE.Mesh(new THREE.SphereGeometry(0.58, 8, 6), new THREE.MeshBasicMaterial({color: rare.glow, transparent:true, opacity:0.32}));
        glow.position.set(pos.x, 1.4, pos.z);
        scene.add(glow); t302Keep(gd, glow); gd.standM.push(glow);
      }
      gd.standM.push(t302Lab(seed.emoji + ' ' + seed.name + (rare && rare.id !== 'common' ? ' · ' + rare.name : ''), pos.x, 2.1, pos.z));
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
    t302PaintCoins();
  }
  function gardenPaintShop(){
    const box = document.getElementById('gardenShopList');
    if (!box || !gd) return;
    const pick = gd.sv.pick;
    box.innerHTML = GardenRules.GARDEN_SEEDS.map(s => {
      const n = (gd.sv.pouch[s.id] | 0);
      const sel = pick === s.id ? '  ← selected' : '';
      const secs = Math.round(s.grow / 1000);
      const rare = GardenRules.gardenRarity(s.rarity);
      const tint = rare ? rare.color : '#1d2340';
      return `<div class="t297row"><span>${s.emoji} ${s.name} — <b class="t302rare" style="color:${tint}">${rare ? rare.name : ''}</b> · ${s.cost} 🪙, sells for ${s.sell} 🪙, grows in ${secs}s · pouch ${n}${sel}</span><span><button type="button" data-gpick="${s.id}">Pick</button> <button type="button" data-gseed="${s.id}">Buy</button></span></div>`;
    }).join('') + `<div class="t297row"><span>🧺 Basket: ${(gd.sv.basket||[]).length}  ·  earned ${gd.sv.earned|0} 🪙  ·  wallet ${t302Coins()} 🪙</span><button type="button" data-gsell="1">Sell one</button></div>`;
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
    t302PaintCoins();
    t302Snd('coin');
    banner('Bought a ' + r.seed.name + ' seed (' + (r.seed.rarity || 'common') + ')! Press E on an empty bed to plant it. You have ' + r.coins + ' 🪙.');
  }
  function gardenDoSell(){
    const r = GardenRules.gardenSell(gd.sv);
    if (!r.ok){ banner('Nothing in the basket to sell yet. Harvest a ripe plant first!'); return; }
    gardenPersist(r.state);
    t302Pay(r.pay, r.item.emoji + ' Sold ' + r.item.name + (r.rarity && r.rarity !== 'common' ? ' (' + r.rarity + ')' : ''));
    t302Note('garden-sell'); t302Board('garden-sold', r.state.sold);
    t302Snd('coin');
    t302PaintCoins();
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
          const rare = r.rarity && GardenRules.gardenRarity(r.rarity);
          const mutated = r.rarity && r.item && r.rarity !== (r.item.rarity || 'common');
          banner(r.item.emoji + ' Harvested ' + r.item.name + (mutated ? ' — it mutated to ' + rare.name + '!' : (rare && rare.id !== 'common' ? ' (' + rare.name + ')' : '')) + '! Sell it at the shop or show it on the stand.');
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
        t302PaintCoins();
        const secs = Math.round(r.seed.grow / 1000);
        const rare = r.rarity && GardenRules.gardenRarity(r.rarity);
        banner('Planted a ' + r.seed.name + (r.mutated && rare ? ' — lucky ' + rare.name + ' mutation!' : '') + '! It will be ready in ' + secs + 's, even if you leave.');
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
    t302PaintCoins();
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
      const a = MeadowRules.meadowAnimal(f.animal);
      const rare = a && MeadowRules.meadowRarity(a.rarity);
      t302Lab(f.name + (rare ? ' · ' + rare.name : ''), x, 2.6, z - 3);
      const body = t302Mesh(new THREE.SphereGeometry(0.7, 10, 8), a.color, x, 0.9, z, mw);
      const head = t302Mesh(new THREE.SphereGeometry(0.42, 8, 6), a.color, x, 1.45, z + 0.15, mw);
      const earL = t302Mesh(new THREE.SphereGeometry(0.16, 6, 5), a.color, x - 0.28, 1.75, z + 0.1, mw);
      const earR = t302Mesh(new THREE.SphereGeometry(0.16, 6, 5), a.color, x + 0.28, 1.75, z + 0.1, mw);
      if (rare && rare.id !== 'common'){
        const glow = new THREE.Mesh(new THREE.SphereGeometry(1.05, 10, 8), new THREE.MeshBasicMaterial({color: rare.color, transparent:true, opacity:0.22}));
        glow.position.set(x, 1.1, z); scene.add(glow); t302Keep(mw, glow);
      }
      t302Lab(a.emoji + ' ' + a.name + (rare ? ' (' + rare.name + ')' : ''), x, 2.3, z);
      mw.fields.push({f, x, z, body, head, earL, earR, id:f.id, animal:f.animal});
    });
    t302Mesh(new THREE.CylinderGeometry(0.7, 0.9, 0.35, 10), '#c9b6ff', 0, 0.25, -3, mw);
    t302Mesh(new THREE.SphereGeometry(0.35, 8, 6), '#ffd23f', 0, 0.8, -3, mw);
    t302Lab('♻️ Rebirth Stone', 0, 2.0, -3);
    mw.stone = {x:0, z:-3};
    checkpoints[0] = {idx:0, spawn:{x:0,y:0.5,z:6}, flag:new THREE.Object3D()};
  }
  function meadowEnter(){
    if (!mw) return;
    cam.pitch = 0.36; cam.dist = 14;
    t302Note('play:meadow'); t302Ach('meadow-visit');
    t302BindHud();
    const card = MeadowRules.meadowCard(mw.sv);
    banner('🥣 Chow Chuck Meadow! Hold to charge, face a field, and let go so the snack lands near a pal. Leveling takes a while — rebirth at the stone to gain a forever XP boost. ' + card.badge.emoji + ' ' + card.badge.name + ' · Lv ' + card.level + '.');
    t302Hud('Hold E, the Charge button, or RT to throw. Aim with the camera. Restock snacks at the crate.', '🥣 Charge');
  }
  function meadowPaintBook(){
    const box = document.getElementById('meadowBookList');
    if (!box || !mw) return;
    const card = MeadowRules.meadowCard(mw.sv);
    box.innerHTML = MeadowRules.meadowBook(mw.sv).map(a => {
      const rare = a.rarityInfo || MeadowRules.meadowRarity(a.rarity);
      const mark = a.found ? 'in your book!' : 'still out in the ' + (a.field ? a.field.name : 'fields');
      const tint = rare ? rare.color : '#1d2340';
      return `<div class="t297row${a.found ? '' : ' dim'}"><span>${a.emoji} ${a.name} — <b class="t302rare" style="color:${tint}">${rare ? rare.name : ''}</b></span><span>${mark}</span></div>`;
    }).join('') +
      `<div class="t297row"><span>${card.badge.emoji} ${card.badge.name}  ·  rebirths ${card.rebirths}  ·  XP boost ×${card.mul.toFixed(1)}</span></div>` +
      `<div class="t297row"><span>💪 Lv ${card.level}  ·  power ${card.power}  ·  XP ${Math.floor(card.xp)}/${card.next}  ·  best ${mw.sv.best || 0}  ·  snacks ${mw.sv.snacks}</span>` +
      (card.canRebirth ? '<button type="button" data-mreb="1">♻️ Rebirth</button>' : `<span>Rebirth at Lv ${card.rebirthNeed}</span>`) + '</div>';
    const reb = box.querySelector('[data-mreb]');
    if (reb) reb.onclick = ev => { ev.preventDefault(); meadowDoRebirth(); meadowPaintBook(); };
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
    if (r.foundNew){
      t302Ach('meadow-friend'); t302Note('meadow-friend'); t302Snd('cp');
      const rare = MeadowRules.meadowRarity(r.animal.rarity);
      banner(r.animal.emoji + ' You met ' + r.animal.name + (rare ? ' (' + rare.name + ')' : '') + ' in ' + (r.field.name || 'the field') + '!');
    }
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
    if (mw.near === 'stone'){ meadowDoRebirth(); return true; }
    if (mw.near === 'train'){
      if (mw.trainCd > 0){ banner('Catch your breath — try training again in a moment.'); return true; }
      const r = MeadowRules.meadowTrain(mw.sv);
      if (r.ok){
        meadowPersist(r.state); mw.trainCd = 1.1; t302Ach('meadow-train'); t302Snd('jump');
        banner(r.leveled ? ('💪 Level up! You are Lv ' + r.level + '. Throws now go up to ' + r.power + ' steps.') : ('💪 Training earned ' + r.xp + ' XP. Lv ' + r.level + ' — throws go up to ' + r.power + ' steps.'));
      }
      else banner('You have reached the max throw level for this run. Rebirth at the stone to start a faster climb!');
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
  function meadowDoRebirth(){
    if (!mw) return false;
    const r = MeadowRules.meadowRebirth(mw.sv);
    if (!r.ok){
      banner('Rebirth unlocks at level ' + r.need + '. You are Lv ' + r.level + '. Keep tossing and training — it takes a while, and it gets faster after each rebirth.');
      return true;
    }
    meadowPersist(r.state);
    t302Note('meadow-rebirth'); t302Ach('meadow-rebirth');
    t302Snd('win');
    banner(r.badge.emoji + ' Rebirth ' + r.rebirths + '! You earned the ' + r.badge.name + ' badge. Level reset, but XP now comes ' + r.mul.toFixed(1) + '× faster.');
    return true;
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
    if (mw.stone && t302Near(mw.stone.x, mw.stone.z, 2)) near = 'stone';
    mw.near = near;
    const card = MeadowRules.meadowCard(mw.sv);
    if (!mw.charging) t302Meter(true, card.progress, card.badge.emoji + ' Lv ' + card.level + '  ·  ' + Math.floor(card.need) + ' XP to next  ·  ' + card.rebirths + ' rebirths');
    if (near === 'book') t302Hud('E / Ⓧ — open your meadow book. Rarity and your rebirth badge are listed there.', '');
    else if (near === 'train') t302Hud('E / Ⓧ — train for XP. Leveling is slow, but rebirths make it faster.', '💪 Train');
    else if (near === 'crate') t302Hud('E / Ⓧ — refill your snacks.', '🍪 Refill');
    else if (near === 'stone') t302Hud(card.canRebirth ? 'E / Ⓧ — rebirth! Level resets, but later XP comes faster, and you keep a badge.' : ('Rebirth at Lv ' + card.rebirthNeed + '. You are Lv ' + card.level + '.'), card.canRebirth ? '♻️ Rebirth' : '');
    else t302Hud('Goal: land a snack near a pal to add them to your book. Hold E, Charge, or RT, then release. Aim with the camera.', mw.charging ? '🥣 Throw!' : '🥣 Charge');
  }

  /* ---------- Rideland Workshop ---------- */
  function ridesState(){ return RidesRules.ridesLoad(t302Load(RidesRules.RIDES_KEY)); }
  function ridesPersist(s){ t302Save(RidesRules.RIDES_KEY, s); if (rd) rd.sv = s; }

  function buildRides(){
    const sv = ridesState();
    rd = {trash:[], sv, meshes:{}, joints:[], boarding:null, t:0, near:null, ghost:null, ghostPiece:null, path:null, car:null, delTarget:null};
    scene.background = new THREE.Color('#8fd3ff');
    scene.fog = new THREE.Fog('#8fd3ff', 40, 130);
    plat(0, 0, 0, 48, 48, '#5cae4a', 0.2);
    plat(0, 0.03, 0, 38, 38, '#d9d4c8', 0.03);
    plat(0, 0.05, 16, 6, 18, '#c8bea8', 0.05);
    for (let i = 0; i < RidesRules.RIDES_GRID; i++) for (let j = 0; j < RidesRules.RIDES_GRID; j++){
      const w = RidesRules.ridesWorld(i, j);
      t302Mesh(new THREE.BoxGeometry(2.7, 0.02, 2.7), (i + j) % 2 ? '#cfc8ba' : '#e8e2d4', w.x, 0.07, w.z, rd);
    }
    const booth = t302Mesh(new THREE.BoxGeometry(4.2, 2.2, 2.4), '#ff9f1c', 0, 1.2, 20, rd);
    t302Mesh(new THREE.BoxGeometry(4.6, 0.3, 2.8), '#fff8ee', 0, 2.4, 20, rd);
    t302Lab('🎟️ Ride Kit', 0, 3.2, 20);
    rd.kit = {x:0, z:20};
    t302Mesh(new THREE.CylinderGeometry(0.8, 0.9, 1.1, 10), '#ff6fb5', -8, 0.6, 19, rd);
    t302Lab('🍿 Snacks', -8, 2.2, 19);
    t302Lab('🎢 Rideland Workshop', 0, 4.2, -20);
    [[-20,-20],[20,-20],[-20,16],[20,16],[-22,0],[22,2],[-16,-22],[16,22]].forEach(p => t302Tree(rd, p[0], p[1], '#2f8f4a', 3.1));
    [[-18,10],[18,-12],[12,18]].forEach((p, i) => {
      const b = t302Mesh(new THREE.SphereGeometry(0.45, 8, 8), i === 1 ? '#ff4d5e' : '#3a86ff', p[0], 3.4, p[1], rd);
      t302Mesh(new THREE.CylinderGeometry(0.04, 0.04, 2.2, 6), '#fff', p[0], 2.2, p[1], rd);
    });
    // little fence posts around the lot
    for (let i = -19; i <= 19; i += 2){
      t302Mesh(new THREE.BoxGeometry(0.15, 1.1, 0.15), '#fff', i, 0.55, -19, rd);
      t302Mesh(new THREE.BoxGeometry(0.15, 1.1, 0.15), '#fff', i, 0.55, 19, rd);
    }
    sv.pieces.forEach(p => ridesBuildPiece(p));
    ridesRefreshJoints();
    ridesPaintRideBtns();
    checkpoints[0] = {idx:0, spawn:{x:0,y:0.5,z:16}, flag:new THREE.Object3D()};
  }
  function ridesLocalPort(p, port){
    const w = RidesRules.ridesWorld(p.gx, p.gz);
    const ww = RidesRules.ridesPortWorld(port);
    return {x: ww.x - w.x, y: ww.y, z: ww.z - w.z};
  }
  function ridesAddRail(g, ax, ay, az, bx, by, bz, col, thick){
    const dx = bx - ax, dy = by - ay, dz = bz - az;
    const len = Math.hypot(dx, dy, dz) || 0.2;
    const rail = new THREE.Mesh(new THREE.BoxGeometry(thick || 0.28, thick || 0.22, len + 0.08), t302Mat(col || '#1d2340'));
    rail.position.set((ax+bx)/2, (ay+by)/2, (az+bz)/2);
    rail.lookAt(bx, by, bz);
    g.add(rail);
    return rail;
  }
  function ridesBuildPiece(p){
    const k = RidesRules.ridesKind(p.kind);
    const w = RidesRules.ridesWorld(p.gx, p.gz);
    const g = new THREE.Group();
    g.position.set(w.x, 0, w.z);
    const col = k.color;
    if (RidesRules.ridesIsTrack(p.kind)){
      const ports = RidesRules.ridesPorts(p);
      const a = ridesLocalPort(p, ports[0]), b = ridesLocalPort(p, ports[1]);
      if (p.kind === 'curve'){
        const steps = 6;
        let px = a.x, py = a.y, pz = a.z;
        for (let s = 1; s <= steps; s++){
          const t = s / steps;
          const ang0 = Math.atan2(a.x, a.z), ang1 = Math.atan2(b.x, b.z);
          let d = ang1 - ang0;
          while (d > Math.PI) d -= Math.PI * 2;
          while (d < -Math.PI) d += Math.PI * 2;
          const ang = ang0 + d * t;
          const rad = RidesRules.RIDES_CELL / 2;
          const x = Math.sin(ang) * rad, z = Math.cos(ang) * rad, y = a.y + (b.y - a.y) * t;
          ridesAddRail(g, px, py, pz, x, y, z, col, 0.32);
          px = x; py = y; pz = z;
        }
      } else if (p.kind === 'loop'){
        ridesAddRail(g, a.x, a.y, a.z, 0, a.y, 0, col, 0.3);
        const ring = new THREE.Mesh(new THREE.TorusGeometry(1.25, 0.16, 8, 20), t302Mat(col));
        ring.position.y = a.y + 1.25;
        const dir = RidesRules.ridesDirVec(p.rot % 2 === 0 ? 0 : 1);
        ring.rotation.y = (p.rot % 2 === 0) ? Math.PI / 2 : 0;
        g.add(ring);
        ridesAddRail(g, 0, b.y, 0, b.x, b.y, b.z, col, 0.3);
      } else {
        ridesAddRail(g, a.x, a.y, a.z, b.x, b.y, b.z, col, 0.34);
        const post = new THREE.Mesh(new THREE.BoxGeometry(0.18, Math.max(0.4, a.y + 0.1), 0.18), t302Mat('#8d5524'));
        post.position.set(a.x * 0.6, Math.max(0.2, a.y / 2), a.z * 0.6); g.add(post);
      }
      g.userData.ends = ports.map(port => {
        const lp = ridesLocalPort(p, port);
        const ball = new THREE.Mesh(new THREE.SphereGeometry(0.16, 8, 6), new THREE.MeshBasicMaterial({color:'#ffb703'}));
        ball.position.set(lp.x, lp.y, lp.z);
        ball.name = 'joint';
        g.add(ball);
        return {ball, port};
      });
    } else {
      g.rotation.y = (p.rot || 0) * Math.PI / 2;
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
      }
    }
    scene.add(g);
    t302Keep(rd, g);
    rd.meshes[p.id] = g;
    return g;
  }
  function ridesRefreshJoints(){
    if (!rd) return;
    const all = RidesRules.ridesAllPorts(rd.sv);
    rd.sv.pieces.forEach(p => {
      const g = rd.meshes[p.id];
      if (!g || !g.userData.ends) return;
      g.userData.ends.forEach(end => {
        const mated = all.some(b => b.id !== p.id && RidesRules.ridesPortsMate(end.port, b));
        end.ball.material.color.set(mated ? '#2ec27e' : '#ffb703');
        end.ball.scale.setScalar(mated ? 1.15 : 0.85);
      });
    });
    const loop = RidesRules.ridesCoasterLoop(rd.sv);
    rd.path = loop.ok ? RidesRules.ridesPathPoints(rd.sv) : null;
  }
  function ridesEnter(){
    if (!rd) return;
    cam.pitch = 0.5; cam.dist = 20;
    t302Note('play:rides'); t302Ach('rides-visit');
    t302BindHud();
    banner('🎢 Rideland Workshop! Track snaps to open ends. Q cycles, R rotates, E / Ⓧ places or rides. 🗑️ Delete mode picks up your pieces (C / Delete / Y). Undo and Test ride are on the buttons. Press Help for a tutorial.');
    t302Hud('Goal: snap a coaster together, then take a test ride! Q cycles, R rotates, 🗑️ deletes.', '🧱 Place');
    if (!rd.sv.tutDone) ridesHelp(true);
    else ridesTutPaint();
    ridesPaintRideBtns();
  }
  function ridesPaintRideBtns(){
    const del = document.getElementById('ridesDelBtn');
    if (del){ del.classList.toggle('on', !!(rd && rd.sv && rd.sv.del)); del.textContent = (rd && rd.sv && rd.sv.del) ? '🗑️ Deleting…' : '🗑️ Delete'; }
  }
  function ridesPaintPalette(){
    const box = document.getElementById('ridesPaletteList');
    if (!box || !rd) return;
    const rows = RidesRules.RIDES_KINDS.map(k => {
      const on = rd.sv.kind === k.id;
      return `<div class="t297row"><span>${k.emoji} ${k.name}${on ? '  ← selected' : ''}</span><button type="button" data-rk="${k.id}">Pick</button></div>`;
    }).join('');
    const loop = RidesRules.ridesCoasterLoop(rd.sv);
    const mine = (rd.sv.pieces || []).map(p => {
      const k = RidesRules.ridesKind(p.kind);
      return `<div class="t297row"><span>${k.emoji} ${k.name} at ${p.gx},${p.gz}</span><button type="button" data-rm="${p.id}">Pick up</button></div>`;
    }).join('');
    box.innerHTML = rows + '<p>Track pieces snap to the last open end. Green joints are connected. Q or bumpers cycle pieces, R / Ⓨ rotates, 🗑️ Delete (C / Delete / Backspace, Xbox Y in delete mode) picks up your own ride, ↩️ Undo, 🎠 Test ride.</p>' +
      (loop.ok ? '<p>✅ The coaster loop is closed — press Test ride!</p>' : '<p>Connect track, curves, slopes, and loops until the joints glow green all the way around.</p>') +
      (mine || '<p>No rides placed yet — stand on a square and press E / Ⓧ. The ghost shows where a piece will snap.</p>');
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
  function ridesClearMesh(id){
    const g = rd.meshes[id];
    if (g){ scene.remove(g); delete rd.meshes[id]; }
  }
  function ridesPickUp(id){
    const r = RidesRules.ridesRemove(rd.sv, id, t302Uid());
    if (!r.ok){ banner(r.why === 'owned' ? "That's a friend's ride — only they can pick it up." : 'Nothing to pick up.'); return false; }
    ridesPersist(r.state);
    ridesClearMesh(id);
    if (rd.boarding && rd.boarding.id === id) rd.boarding = null;
    ridesRefreshJoints();
    t302Send({a:'remove', id});
    t302Snd('hit');
    banner('Picked up your ' + RidesRules.ridesKind(r.piece.kind).name + '. Press ↩️ Undo if that was a mistake.');
    if (document.getElementById('ridesPalette') && document.getElementById('ridesPalette').classList.contains('show')) ridesPaintPalette();
    return true;
  }
  function ridesToggleDel(){
    if (!rd) return;
    rd.sv = RidesRules.ridesSetDelete(rd.sv, !rd.sv.del);
    ridesPersist(rd.sv);
    ridesPaintRideBtns();
    banner(rd.sv.del ? '🗑️ Delete mode on. Stand on a piece and press E / Ⓧ / Ⓨ to pick it up. Ⓑ or Delete again cancels.' : 'Delete mode off. You can place and ride again.');
  }
  function ridesUndoNow(){
    if (!rd) return false;
    const r = RidesRules.ridesUndo(rd.sv, t302Uid());
    if (!r.ok){ banner('Nothing to undo.'); return false; }
    ridesPersist(r.state);
    if (r.undone === 'place' && r.piece){ ridesClearMesh(r.piece.id); t302Send({a:'remove', id:r.piece.id}); }
    if (r.undone === 'remove' && r.piece){ ridesBuildPiece(r.piece); t302Send({a:'place', piece:r.piece}); }
    ridesRefreshJoints();
    t302Snd('cp');
    banner(r.undone === 'place' ? 'Undid the last placement.' : 'Restored the last piece you picked up.');
    return true;
  }
  function ridesTestRide(){
    if (!rd) return false;
    if (rd.boarding){ ridesDismount(); return true; }
    const path = RidesRules.ridesPathPoints(rd.sv);
    if (!path.ok){ banner('Connect track into a closed loop first — snapped ends glow green when they meet.'); return false; }
    const first = path.path[0];
    const r = RidesRules.ridesBoard(rd.sv, first.id, t302Uid());
    if (!r.ok){ banner('Cannot start the test ride yet.'); return false; }
    ridesPersist(r.state);
    rd.boarding = {id: first.id, t:0, kind: first.kind, test:true};
    rd.path = path;
    t302Note('rides-ride'); t302Ach('rides-ride'); t302Board('rides-rides', r.state.rides);
    t302Send({a:'board', id: first.id});
    t302Snd('jump');
    banner('🎠 Test ride! Hold on — E / Ⓧ or Ⓑ to hop off.');
    ridesTutOn('board', first.kind);
    return true;
  }
  function ridesAct(){
    if (!rd) return false;
    if (rd.boarding){ ridesDismount(); return true; }
    if (rd.near === 'kit' && !(rd.sv && rd.sv.del)){ t302Open('ridesPalette'); return true; }
    const cell = ridesCellAt(P.x, P.z);
    if (!cell) return false;
    const piece = RidesRules.ridesAt(rd.sv, cell.gx, cell.gz);
    if (rd.sv && rd.sv.del){
      const target = piece || rd.delTarget;
      if (target) return ridesPickUp(target.id);
      banner('Stand on one of your pieces to pick it up, or press 🗑️ again to leave Delete mode.');
      return true;
    }
    if (piece){
      const r = RidesRules.ridesBoard(rd.sv, piece.id, t302Uid());
      if (!r.ok){ banner(r.why === 'noloop' ? 'Snap more track together until every joint is green, then ride!' : 'Cannot ride that yet.'); return true; }
      ridesPersist(r.state);
      rd.boarding = {id: piece.id, t:0, kind: piece.kind};
      rd.path = RidesRules.ridesIsTrack(piece.kind) ? RidesRules.ridesPathPoints(rd.sv) : null;
      if (rd.path && rd.path.ok && rd.path.path){
        const idx = rd.path.path.findIndex(p => p.id === piece.id);
        if (idx >= 0 && rd.path.points){
          const per = rd.path.points.length / rd.path.path.length;
          rd.boarding.t = (idx * per) / 6;
        }
      }
      t302Note('rides-ride'); t302Ach('rides-ride'); t302Board('rides-rides', r.state.rides);
      t302Send({a:'board', id: piece.id});
      t302Snd('jump');
      banner('Whoosh! Riding the ' + RidesRules.ridesKind(piece.kind).name + '. E / Ⓧ to hop off.');
      ridesTutOn('board', piece.kind);
      return true;
    }
    const snap = RidesRules.ridesSnap(rd.sv, rd.sv.kind, cell.gx, cell.gz, rd.sv.rot);
    const r = RidesRules.ridesPlace(rd.sv, rd.sv.kind, snap.gx, snap.gz, snap.rot, t302Uid(), {snap:true, elev:snap.elev});
    if (!r.ok){ banner('That square is full or the piece does not fit. Try another, or use 🗑️ Delete to pick up your own ride.'); return true; }
    ridesPersist(r.state);
    ridesBuildPiece(r.piece);
    ridesRefreshJoints();
    t302Note('rides-place'); t302Ach('rides-place'); t302Board('rides-placed', r.state.placed);
    t302Send({a:'place', piece:r.piece});
    t302Snd('boing');
    banner((r.closed ? '✅ Loop closed! ' : (snap.snapped ? 'Snap! ' : '')) + 'Placed a ' + RidesRules.ridesKind(r.piece.kind).name + '.' + (r.closed ? ' Press 🎠 Test ride.' : ''));
    ridesTutOn('place', r.piece.kind);
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
      if (rd.sv.del){
        const on = rd.delTarget && rd.delTarget.id === p.id;
        g.traverse(ch => { if (ch.material && ch.material.emissive) ch.material.emissive.set(on ? '#ff4d5e' : '#000000'); });
      }
    });
    if (rd.boarding){
      const p = rd.sv.pieces.find(x => x.id === rd.boarding.id);
      const g = p && rd.meshes[p.id];
      if (g){
        rd.boarding.t += dt;
        if (RidesRules.ridesIsTrack(p.kind)){
          const path = rd.path && rd.path.ok ? rd.path : RidesRules.ridesPathPoints(rd.sv);
          rd.path = path;
          const pts = path && path.points;
          if (pts && pts.length){
            const speed = 6;
            const t = (rd.boarding.t * speed) % pts.length;
            const i = Math.floor(t) % pts.length, f = t - Math.floor(t), j = (i + 1) % pts.length;
            const a = pts[i], b = pts[j];
            P.x = a.x + (b.x - a.x) * f;
            P.z = a.z + (b.z - a.z) * f;
            P.y = a.y + (b.y - a.y) * f + 0.45;
            P.vy = 0;
          }
        } else if (p.kind === 'drop'){
          const car = g.getObjectByName('car');
          P.x = g.position.x; P.z = g.position.z; P.y = (car ? car.position.y : 1.6) + 0.6; P.vy = 0;
        } else {
          P.x = g.position.x; P.z = g.position.z; P.y = 1.6; P.vy = 0;
        }
      }
    }
    // ghost preview (snapped pose)
    const cell = !rd.boarding ? ridesCellAt(P.x, P.z) : null;
    const piece = cell ? RidesRules.ridesAt(rd.sv, cell.gx, cell.gz) : null;
    rd.delTarget = (rd.sv && rd.sv.del) ? piece : null;
    if (rd.ghost){ scene.remove(rd.ghost); rd.ghost = null; }
    if (cell && !piece && !rd.boarding && !(rd.sv && rd.sv.del)){
      const snap = RidesRules.ridesSnap(rd.sv, rd.sv.kind, cell.gx, cell.gz, rd.sv.rot);
      const ok = !!snap.ok;
      const w = RidesRules.ridesWorld(snap.gx, snap.gz);
      const gh = new THREE.Group();
      const pad = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.1, 2.6), new THREE.MeshBasicMaterial({color: ok ? '#2ec27e' : '#ff4d5e', transparent:true, opacity:0.35}));
      pad.position.y = 0.12; gh.add(pad);
      if (RidesRules.ridesIsTrack(rd.sv.kind) && ok){
        const fake = {kind: rd.sv.kind, gx:snap.gx, gz:snap.gz, rot:snap.rot, elev:snap.elev|0, id:-1};
        const ports = RidesRules.ridesPorts(fake);
        if (ports.length >= 2){
          const a = RidesRules.ridesPortWorld(ports[0]), b = RidesRules.ridesPortWorld(ports[1]);
          const rail = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.18, Math.hypot(b.x-a.x, b.z-a.z) + 0.08), new THREE.MeshBasicMaterial({color:'#2ec27e', transparent:true, opacity:0.7}));
          rail.position.set((a.x+b.x)/2 - w.x, ((a.y+b.y)/2), (a.z+b.z)/2 - w.z);
          rail.lookAt(b.x - w.x, (a.y+b.y)/2, b.z - w.z);
          gh.add(rail);
        }
      }
      gh.position.set(w.x, 0, w.z);
      scene.add(gh);
      rd.ghost = gh;
    }
    let near = null;
    if (t302Near(rd.kit.x, rd.kit.z, 2.6)) near = 'kit';
    rd.near = near;
    const kind = RidesRules.ridesKind(rd.sv.kind);
    const loop = RidesRules.ridesCoasterLoop(rd.sv);
    if (rd.boarding) t302Hud('Riding! E / Ⓧ or Ⓑ to hop off.', 'Hop off');
    else if (rd.sv && rd.sv.del) t302Hud('🗑️ Delete mode. Stand on your piece — it glows red — then press E / Ⓧ / Ⓨ to pick it up. Ⓑ cancels.', '🗑️ Pick up');
    else if (near === 'kit') t302Hud('E / Ⓧ — open the ride kit. Q or bumpers also cycle pieces.', '');
    else if (piece) t302Hud('E / Ⓧ — ride the ' + RidesRules.ridesKind(piece.kind).name + '. 🗑️ Delete picks it up if it is yours. Friends may ride too!', '🎢 Ride');
    else t302Hud((kind ? kind.emoji + ' ' + kind.name : 'Piece') + (loop.ok ? '  ·  ✅ loop closed' : '') + '. Ghost shows the snap. E / Ⓧ to place. Q cycles, R rotates, 🗑️ deletes.', '🧱 Place');
  }
  function ridesHelp(auto){
    if (!rd) return;
    const r = RidesRules.ridesTutStart(rd.sv);
    ridesPersist(r.state);
    ridesTutPaint();
    if (!auto) t302Snd('cp');
  }
  function ridesTutGo(){
    if (!rd) return;
    const r = RidesRules.ridesTutNext(rd.sv);
    ridesPersist(r.state);
    ridesTutPaint();
    t302Snd('jump');
  }
  function ridesTutSkipNow(){
    if (!rd) return;
    const r = RidesRules.ridesTutSkip(rd.sv);
    ridesPersist(r.state);
    ridesTutPaint();
    banner('Tutorial tucked away. Press Help anytime to replay it.');
  }
  function ridesTutOn(ev, kind){
    if (!rd) return;
    const r = RidesRules.ridesTutNote(rd.sv, ev, kind);
    if (r.advanced){
      ridesPersist(r.state);
      ridesTutPaint();
      t302Snd('cp');
      if (r.step) banner(r.step.title);
      else if (r.done) banner('Tutorial complete! Press Help to play it again.');
    }
  }
  function ridesTutPaint(){
    const box = document.getElementById('t302Tut');
    if (!box) return;
    const step = rd && RidesRules.ridesTutStep(rd.sv);
    if (!step){ box.classList.remove('show'); return; }
    box.classList.add('show');
    const st = document.getElementById('t302TutStep');
    const title = document.getElementById('t302TutTitle');
    const body = document.getElementById('t302TutBody');
    const next = document.getElementById('t302TutNext');
    const skip = document.getElementById('t302TutSkip');
    if (st) st.textContent = 'Step ' + (step.index + 1) + ' of ' + step.count + '  ·  keyboard, touch, or Xbox';
    if (title) title.textContent = step.title;
    if (body) body.textContent = step.body;
    if (next) next.textContent = step.id === 'done' ? 'Close' : 'Next';
    if (skip) skip.style.display = step.id === 'done' ? 'none' : '';
  }
  function ridesKey(e){
    if (e.code === 'KeyH'){ ridesHelp(); return true; }
    if (rd && rd.sv && rd.sv.tut && rd.sv.tut.on){
      if (e.code === 'Enter' || e.code === 'KeyN' || e.code === 'ArrowRight'){ if (!e.repeat) ridesTutGo(); return true; }
      if (e.code === 'KeyU' && e.shiftKey){ if (!e.repeat) ridesTutSkipNow(); return true; }
    }
    if (e.code === 'KeyQ'){ const r = RidesRules.ridesCycleKind(rd.sv, e.shiftKey ? -1 : 1); ridesPersist(r.state); banner(r.kind.emoji + ' ' + r.kind.name); t302Snd('jump'); return true; }
    if (e.code === 'KeyR'){ const r = RidesRules.ridesRotate(rd.sv, 1); ridesPersist(r.state); return true; }
    if (e.code === 'KeyZ' && (e.ctrlKey || e.metaKey)){ if (!e.repeat) ridesUndoNow(); return true; }
    if (e.code === 'KeyC' || e.code === 'Delete' || e.code === 'Backspace'){
      if (!e.repeat){
        const cell = ridesCellAt(P.x, P.z);
        const piece = cell ? RidesRules.ridesAt(rd.sv, cell.gx, cell.gz) : null;
        if (piece && (!rd.sv.del)) ridesPickUp(piece.id);
        else ridesToggleDel();
      }
      return true;
    }
    if (e.code === 'KeyE' || e.code === 'KeyF' || e.key === 'e' || e.key === 'f'){ ridesAct(); return true; }
    if (e.code === 'KeyX' && rd.boarding){ ridesDismount(); return true; }
    return false;
  }
  function ridesPad(jp, s){
    if (rd && rd.sv && rd.sv.tut && rd.sv.tut.on){
      if (t302Edge('tutNext', jp && jp[15])){ ridesTutGo(); return true; }
      if (t302Edge('tutSkip', jp && jp[8])){ ridesTutSkipNow(); return true; }
    }
    if (t302Edge('ridesLB', jp && jp[4]) && !(jp && jp[2])){ const r = RidesRules.ridesCycleKind(rd.sv, -1); ridesPersist(r.state); banner(r.kind.emoji + ' ' + r.kind.name); return true; }
    if (t302Edge('ridesRB', jp && jp[5])){ const r = RidesRules.ridesCycleKind(rd.sv, 1); ridesPersist(r.state); banner(r.kind.emoji + ' ' + r.kind.name); return true; }
    if (t302Edge('ridesDelCombo', jp && jp[4] && jp[2])){ ridesToggleDel(); if (typeof pad !== 'undefined') pad.jump = false; return true; }
    if (t302Edge('ridesY', jp && jp[3])){
      if (rd.sv && rd.sv.del){ ridesAct(); return true; }
      const r = RidesRules.ridesRotate(rd.sv, 1); ridesPersist(r.state); return true;
    }
    if (t302Edge('ridesB', jp && jp[1])){
      if (rd.boarding){ ridesDismount(); return true; }
      if (rd.sv && rd.sv.del){ ridesToggleDel(); return true; }
      return false;
    }
    if (t302Edge('ridesAct', jp && (jp[2] || jp[7]))){ if (typeof pad !== 'undefined') pad.jump = false; return ridesAct(); }
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
    plat(-8.2, 0.04, 7.2, 16, 16, '#8fce6a', 0.04);
    for (let i = 0; i < 28; i++){
      const cx = -15 + ((i * 5) % 14), cz = 1 + ((i * 7) % 14);
      t302Mesh(new THREE.SphereGeometry(0.16, 6, 5), i % 2 ? '#6fbf5a' : '#3fa85a', cx, 0.16, cz, hv);
    }
    const cpath = HiveRules.hiveCloverPath();
    cpath.forEach((node, i) => {
      t302Mesh(new THREE.CylinderGeometry(0.7, 0.75, 0.08, 8), '#c4a574', node.x, 0.08, node.z, hv);
      if (i < cpath.length - 1){
        const nx = cpath[i + 1];
        const mx = (node.x + nx.x) / 2, mz = (node.z + nx.z) / 2;
        const dx = nx.x - node.x, dz = nx.z - node.z;
        const len = Math.hypot(dx, dz) || 1;
        const plank = t302Mesh(new THREE.BoxGeometry(1.15, 0.07, len), '#d9b089', mx, 0.07, mz, hv);
        plank.rotation.y = Math.atan2(dx, dz);
      }
      if (node.sign){
        t302Mesh(new THREE.BoxGeometry(0.12, 1.3, 0.12), '#6b3a1d', node.x, 0.65, node.z, hv);
        t302Mesh(new THREE.BoxGeometry(1.15, 0.55, 0.08), '#fff8e6', node.x, 1.4, node.z, hv);
        t302Lab(node.sign, node.x, 2.15, node.z);
      }
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
    banner('🐝 Honeyhill Hive! Follow the signed Clover Trail to the clover field. Flowers refill after you collect them. Make honey at the hive. Bear neighbors visit in solo play — no fighting, ever.');
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
    const now = t302Now();
    hv.flowers.forEach(fl => {
      const bloom = fl.locked ? 0 : HiveRules.hiveBloom(hv.sv, fl.f.id, now);
      if (fl.m){
        fl.m.position.y = 0.35 + 0.25 * bloom + Math.sin(time * 2 + fl.x) * 0.06;
        const s = 0.35 + 0.65 * bloom;
        fl.m.scale.setScalar(s);
        if (fl.m.material){ fl.m.material.transparent = true; fl.m.material.opacity = fl.locked ? 0.35 : (0.35 + 0.65 * bloom); }
      }
      if (t302Near(fl.x, fl.z, 1.4)){
        if (fl.locked){
          if (time - (hv.lockToast || 0) > 2.2){ hv.lockToast = time; banner('This trail is still closed. Help a bear neighbor to open it!'); }
          return;
        }
        const last = hv.cool[fl.f.id] || 0;
        if (time - last > 0.8){
          hv.cool[fl.f.id] = time;
          const r = HiveRules.hiveCollect(hv.sv, fl.f.id, now);
          if (r.ok){
            hivePersist(r.state);
            t302Note('hive-pollen');
            t302Tone([880, 1040], 0.05, 'sine', 0.035);
            const vis = HiveRules.hiveVisit(hv.sv, fl.f.trail);
            if (vis.ok) hivePersist(vis.state);
            banner('🌼 +' + r.got + ' pollen from ' + r.flower.name + '! It will refill in ' + Math.round(HiveRules.HIVE_REGEN / 1000) + 's.');
          } else if (r.why === 'empty'){
            const sec = Math.max(1, Math.ceil((r.left || 0) / 1000));
            if (time - (hv.emptyToast || 0) > 1.6){ hv.emptyToast = time; banner('This flower is refilling — come back in ' + sec + 's. You can watch it fill back up.'); }
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
    else t302Hud('Goal: gather pollen on open trails (flowers refill over time), make honey, help the bears. Pollen ' + hv.sv.pollen + '  Honey ' + hv.sv.honey + '  Bees ' + hv.sv.bees + '. Open Quests to start or turn in a job.', '');
  }

  /* ---------- Campfire Grove (kid-friendly horror) ---------- */
  function campState(){ return CampRules.campLoad(t302Load(CampRules.CAMP_KEY)); }
  function campPersist(s){ t302Save(CampRules.CAMP_KEY, s); if (cg) cg.sv = s; }

  function campMakeGloam(st, style){
    const classic = style === 'classic' || style === true;
    const g = new THREE.Group();
    if (classic){
      const col = '#0c0a12';
      const mat = new THREE.MeshLambertMaterial({color:col, emissive:'#140818', transparent:true, opacity:0.96});
      const body = new THREE.Mesh(new THREE.ConeGeometry(1.05, 4.1, 5), mat);
      body.position.y = 2.15; g.add(body);
      const head = new THREE.Mesh(new THREE.SphereGeometry(0.62, 6, 5), mat);
      head.position.y = 3.7; g.add(head);
      [[-0.85, 0.55], [0.85, -0.55]].forEach((a) => {
        const arm = new THREE.Mesh(new THREE.ConeGeometry(0.18, 2.4, 5), mat);
        arm.position.set(a[0] * 1.05, 2.1, 0);
        arm.rotation.z = a[1];
        g.add(arm);
      });
      [[-0.35, 4.4], [0.35, 4.4]].forEach(tw => {
        const ant = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.9, 4), mat);
        ant.position.set(tw[0], tw[1], 0); ant.rotation.z = tw[0] > 0 ? -0.4 : 0.4; g.add(ant);
      });
      const eyeCol = '#b6ff6a';
      const eyeM = new THREE.MeshBasicMaterial({color: eyeCol});
      const haloM = new THREE.MeshBasicMaterial({color: eyeCol, transparent:true, opacity:0.55});
      const e1 = new THREE.Mesh(new THREE.SphereGeometry(0.28, 8, 6), eyeM);
      e1.position.set(-0.32, 3.65, 0.52); g.add(e1);
      const e2 = new THREE.Mesh(new THREE.SphereGeometry(0.22, 8, 6), eyeM);
      e2.position.set(0.34, 3.72, 0.5); g.add(e2);
      const h1 = new THREE.Mesh(new THREE.SphereGeometry(0.55, 8, 6), haloM); h1.position.copy(e1.position); g.add(h1);
      const h2 = new THREE.Mesh(new THREE.SphereGeometry(0.48, 8, 6), haloM); h2.position.copy(e2.position); g.add(h2);
      const mouth = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.06, 0.08), new THREE.MeshBasicMaterial({color:'#050308'}));
      mouth.position.set(0, 3.25, 0.5); g.add(mouth);
      g.userData.eyes = [e1, e2];
      g.userData.halos = [h1, h2];
      g.userData.face = null;
      g.userData.style = 'classic';
    } else {
      const col = '#07050c';
      const mat = new THREE.MeshLambertMaterial({color:col, emissive:'#1a0520', transparent:true, opacity:0.98});
      const body = new THREE.Mesh(new THREE.ConeGeometry(1.22, 5.6, 5), mat);
      body.position.set(0.08, 2.85, 0); body.rotation.z = 0.08; body.rotation.x = -0.04; g.add(body);
      const bulge = new THREE.Mesh(new THREE.SphereGeometry(0.7, 5, 4), mat);
      bulge.position.set(-0.15, 3.1, 0.1); bulge.scale.set(1, 1.35, 0.8); g.add(bulge);
      const head = new THREE.Mesh(new THREE.SphereGeometry(0.72, 6, 5), mat);
      head.position.set(0.16, 5.35, 0.05); head.scale.set(1.05, 1.25, 0.9); g.add(head);
      const armL = new THREE.Mesh(new THREE.ConeGeometry(0.2, 3.3, 5), mat);
      armL.position.set(-1.15, 2.6, 0.1); armL.rotation.z = 0.7; armL.rotation.x = 0.2; g.add(armL);
      const armR = new THREE.Mesh(new THREE.ConeGeometry(0.16, 2.5, 5), mat);
      armR.position.set(1.05, 2.9, -0.05); armR.rotation.z = -0.45; g.add(armR);
      [[-0.45, 6.35, 0.35], [0.5, 6.55, -0.5], [0.05, 6.7, 0.15]].forEach((tw, i) => {
        const ant = new THREE.Mesh(new THREE.ConeGeometry(i === 2 ? 0.05 : 0.08, i === 1 ? 1.4 : 1.1, 4), mat);
        ant.position.set(tw[0], tw[1], 0); ant.rotation.z = tw[2]; g.add(ant);
      });
      const eyeCol = '#8cff4a';
      const eyeM = new THREE.MeshBasicMaterial({color: eyeCol});
      const haloM = new THREE.MeshBasicMaterial({color: eyeCol, transparent:true, opacity:0.7});
      const e1 = new THREE.Mesh(new THREE.SphereGeometry(0.22, 8, 6), eyeM);
      e1.position.set(-0.28, 5.42, 0.62); g.add(e1);
      const e2 = new THREE.Mesh(new THREE.SphereGeometry(0.34, 8, 6), eyeM);
      e2.position.set(0.42, 5.28, 0.6); g.add(e2);
      const h1 = new THREE.Mesh(new THREE.SphereGeometry(0.5, 8, 6), haloM); h1.position.copy(e1.position); g.add(h1);
      const h2 = new THREE.Mesh(new THREE.SphereGeometry(0.72, 8, 6), haloM); h2.position.copy(e2.position); g.add(h2);
      const face = new THREE.Group();
      const grin = new THREE.Mesh(new THREE.TorusGeometry(0.38, 0.045, 6, 10, Math.PI), new THREE.MeshBasicMaterial({color:'#0a0810'}));
      grin.position.set(0.08, 4.88, 0.68); grin.rotation.x = Math.PI; grin.scale.set(1.25, 0.85, 1); face.add(grin);
      const grinLine = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.05, 0.06), new THREE.MeshBasicMaterial({color:'#151018'}));
      grinLine.position.set(0.08, 4.95, 0.7); face.add(grinLine);
      [[-0.2, 0.12], [0, 0.18], [0.22, 0.12]].forEach(p => {
        const tooth = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.11, 0.05), new THREE.MeshBasicMaterial({color:'#c8c4d0'}));
        tooth.position.set(0.08 + p[0], 4.88 - p[1] * 0.15, 0.74); face.add(tooth);
      });
      face.visible = false;
      g.add(face);
      g.userData.eyes = [e1, e2];
      g.userData.halos = [h1, h2];
      g.userData.face = face;
      g.userData.style = 'scary';
    }
    scene.add(g);
    t302Keep(st, g);
    return g;
  }
  function campRebuildGloam(){
    if (!cg) return;
    if (cg.gloam){ try { scene.remove(cg.gloam); } catch (e){} cg.gloam = null; }
    (cg.eyes || []).forEach(e => { try { scene.remove(e.g); } catch (err){} });
    cg.eyes = [];
    const style = CampRules.campGloamStyle(cg.sv && cg.sv.lessScary);
    cg.gloam = campMakeGloam(cg, style);
    cg.eyes = style === 'classic'
      ? campEyes(cg, 8, false).concat(campEyes(cg, 5, true))
      : campEyes(cg, 10, false).concat(campEyes(cg, 6, true));
  }

  function campEyes(st, n, deep){
    const arr = [];
    for (let i = 0; i < n; i++){
      const ang = (i / n) * Math.PI * 2 + 0.4;
      const d = (deep ? 48 : 22) + (i % 5) * 3.2;
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
  function campMakeLogMesh(st, log){
    const g = new THREE.Group();
    if (log.kind === 'stump'){
      const m = t302Mesh(new THREE.CylinderGeometry(0.45, 0.5, 0.7, 8), '#6b3a1d', log.x, 0.35, log.z, st);
      return m;
    }
    if (log.kind === 'heart'){
      const m = t302Mesh(new THREE.BoxGeometry(1.5, 0.5, 0.5), '#3d2214', log.x, 0.32, log.z, st);
      t302Mesh(new THREE.BoxGeometry(0.4, 0.4, 0.4), '#7a2e12', log.x, 0.55, log.z, st);
      return m;
    }
    return t302Mesh(new THREE.BoxGeometry(1.3, 0.28, 0.38), '#8d5524', log.x, 0.2, log.z, st);
  }


  function campWatchMat(color, opacity){
    return new THREE.MeshBasicMaterial({color: color, transparent: true, opacity: opacity == null ? 1 : opacity, depthWrite: false});
  }
  function campMakeWatcherMesh(kind){
    const g = new THREE.Group();
    g.userData.kind = kind;
    g.userData.mats = [];
    const add = (mesh) => { g.add(mesh); if (mesh.material) g.userData.mats.push(mesh.material); mesh.castShadow = mesh.receiveShadow = false; mesh.raycast = function(){}; return mesh; };
    if (kind === 'glow'){
      for (let i = 0; i < 6; i++){
        const s = new THREE.Mesh(new THREE.SphereGeometry(0.1, 6, 5), campWatchMat('#e8ff8a', 0.88));
        const a = i * 1.05;
        s.position.set(Math.sin(a) * 0.5, 1.15 + (i % 3) * 0.38, Math.cos(a) * 0.5);
        s.userData.bob = i;
        add(s);
      }
    } else if (kind === 'owl'){
      const disc = new THREE.Mesh(new THREE.SphereGeometry(0.38, 8, 6), campWatchMat('#1a140c', 0.92));
      disc.position.set(-0.36, 2.4, 0); add(disc);
      const disc2 = new THREE.Mesh(new THREE.SphereGeometry(0.38, 8, 6), campWatchMat('#1a140c', 0.92));
      disc2.position.set(0.36, 2.4, 0); add(disc2);
      const eye = new THREE.Mesh(new THREE.SphereGeometry(0.2, 8, 6), campWatchMat('#ffe29a', 0.98));
      eye.position.set(-0.36, 2.4, 0.16); add(eye);
      const eye2 = new THREE.Mesh(new THREE.SphereGeometry(0.2, 8, 6), campWatchMat('#ffe29a', 0.98));
      eye2.position.set(0.36, 2.4, 0.16); add(eye2);
      g.userData.eyes = [eye, eye2];
    } else if (kind === 'cabin'){
      const head = new THREE.Mesh(new THREE.SphereGeometry(0.22, 6, 5), campWatchMat('#1c1612', 0.95));
      head.position.set(0, 0.12, 0); add(head);
      const eye = new THREE.Mesh(new THREE.SphereGeometry(0.055, 6, 5), campWatchMat('#dcecff', 1));
      eye.position.set(-0.07, 0.16, 0.16); add(eye);
      const eye2 = new THREE.Mesh(new THREE.SphereGeometry(0.055, 6, 5), campWatchMat('#dcecff', 1));
      eye2.position.set(0.07, 0.16, 0.16); add(eye2);
      g.userData.eyes = [eye, eye2];
    } else {
      const tall = kind === 'thin';
      const h = tall ? 5.4 : (kind === 'lake' ? 3.4 : 3.2);
      const w = tall ? 0.28 : 0.46;
      const col = kind === 'pale' ? '#c5d0da' : (kind === 'lake' ? '#1a1e28' : '#16141c');
      const body = new THREE.Mesh(new THREE.BoxGeometry(w, h, w * 0.82), campWatchMat(col, kind === 'pale' ? 0.9 : 0.96));
      body.position.y = h * 0.5; add(body);
      if (tall){
        const neck = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.9, 0.16), campWatchMat(col, 0.96));
        neck.position.y = h + 0.3; add(neck);
      }
      const eyeCol = kind === 'pale' ? '#f3fbff' : '#d7eeff';
      const ey = tall ? h + 0.55 : h * 0.8;
      const er = kind === 'pale' ? 0.14 : 0.1;
      const halo = new THREE.Mesh(new THREE.SphereGeometry(er * 2.1, 6, 5), campWatchMat(eyeCol, 0.35));
      halo.position.set(-0.1, ey, w * 0.55); add(halo);
      const halo2 = new THREE.Mesh(new THREE.SphereGeometry(er * 2.1, 6, 5), campWatchMat(eyeCol, 0.35));
      halo2.position.set(0.1, ey, w * 0.55); add(halo2);
      const eye = new THREE.Mesh(new THREE.SphereGeometry(er, 6, 5), campWatchMat(eyeCol, 1));
      eye.position.set(-0.1, ey, w * 0.62); add(eye);
      const eye2 = new THREE.Mesh(new THREE.SphereGeometry(er, 6, 5), campWatchMat(eyeCol, 1));
      eye2.position.set(0.1, ey, w * 0.62); add(eye2);
      g.userData.eyes = [eye, eye2, halo, halo2];
    }
    g.userData.baseY = kind === 'cabin' ? 2.35 : 0;
    g.visible = false;
    g.frustumCulled = false;
    g.raycast = function(){};
    return g;
  }
  function campWatchSetOpacity(g, a){
    (g.userData.mats || []).forEach(m => { if (m) m.opacity = Math.max(0, Math.min(1, a)); });
  }
  function campWatchPoolGet(kind){
    if (!cg) return null;
    cg.watchPool = cg.watchPool || [];
    let slot = cg.watchPool.find(s => !s.used && s.kind === kind);
    if (!slot){
      const mesh = campMakeWatcherMesh(kind);
      scene.add(mesh);
      t302Keep(cg, mesh);
      slot = {kind, mesh, used: false, id: 0, fade: 1};
      cg.watchPool.push(slot);
    }
    slot.used = true;
    slot.mesh.visible = true;
    campWatchSetOpacity(slot.mesh, 1);
    return slot;
  }
  function campSyncWatchers(dt){
    if (!cg || !cg.run) return;
    const list = Array.isArray(cg.run.watchers) ? cg.run.watchers : [];
    const events = Array.isArray(cg.run.watchEvents) ? cg.run.watchEvents : [];
    const less = !!(cg.sv && cg.sv.lessScary);
    cg.watchPool = cg.watchPool || [];
    events.forEach(ev => {
      if (ev.type !== 'vanish') return;
      const slot = cg.watchPool.find(s => s.id === ev.id);
      if (slot){ slot.used = false; slot.fade = 1; slot.fading = true; slot.id = 0; }
      if (ev.whisper && !cg.shotLock){
        if (less) t302Tone([240, 180, 120], 0.14, 'sine', 0.03);
        else t302Tone([170, 120, 80, 60], 0.18, 'triangle', 0.04);
      }
    });
    const live = {};
    list.forEach(w => { live[w.id] = w; });
    cg.watchPool.forEach(slot => {
      if (slot.used && slot.id && !live[slot.id]){
        slot.used = false; slot.fading = true; slot.fade = slot.fade == null ? 1 : slot.fade; slot.id = 0;
      }
    });
    list.forEach(w => {
      let slot = cg.watchPool.find(s => s.id === w.id);
      if (!slot || slot.kind !== w.kind){
        if (slot){ slot.used = false; slot.id = 0; slot.mesh.visible = false; }
        slot = campWatchPoolGet(w.kind);
        slot.id = w.id;
        slot.fading = false;
        slot.fade = 1;
      }
      const y = (slot.mesh.userData.baseY || 0);
      const bob = (w.kind === 'glow') ? Math.sin((typeof time === 'number' ? time : 0) * 2.4) * 0.12 : 0;
      slot.mesh.position.set(w.x, y + bob, w.z);
      slot.mesh.rotation.y = w.yaw || 0;
      slot.mesh.visible = true;
      const glow = !!w.glow && !less;
      (slot.mesh.userData.eyes || []).forEach((eye, i) => {
        if (!eye) return;
        const pulse = glow ? (0.75 + 0.25 * Math.abs(Math.sin((typeof time === 'number' ? time : 0) * (7 + i) + i))) : 1;
        eye.scale.setScalar(w.kind === 'owl' || w.kind === 'glow' ? 1 : pulse);
        if (eye.material) eye.material.opacity = (w.kind === 'owl') ? 0.9 : (glow ? 0.65 + 0.35 * pulse : 0.8);
      });
    });
    cg.watchPool.forEach(slot => {
      if (slot.used) return;
      if (slot.fading){
        slot.fade = (slot.fade == null ? 1 : slot.fade) - (dt || 0.08) * (less ? 2.4 : 3.6);
        const flick = less ? 1 : (0.35 + 0.65 * Math.abs(Math.sin((typeof time === 'number' ? time : 0) * 28)));
        campWatchSetOpacity(slot.mesh, Math.max(0, slot.fade) * flick);
        if (slot.fade <= 0){ slot.fading = false; slot.mesh.visible = false; campWatchSetOpacity(slot.mesh, 1); }
      } else {
        slot.mesh.visible = false;
      }
    });
    cg.run.watchEvents = [];
  }


  function campPoseStory(){
    if (!cg) return;
    cg.shotLock = true;
    cg.sv.lessScary = false;
    // show several unfound clues around the lake path plus the journal
    if (P){ P.x = -20; P.z = 22; P.face = Math.atan2(-10, 14); if (typeof cam !== 'undefined' && cam){ cam.yaw = P.face; cam.pitch = 0.08; cam.dist = 12; } }
    try { if (typeof body !== 'undefined' && body) body.visible = false; } catch(e){}
    cg.run.phase = 'night'; cg.run.gmode = 'hidden'; cg.run.fire = 0.5;
    if (cg.gloam) cg.gloam.visible = false;
    campWorldLights(false, true, 0.5, 0);
    if (scene){
      const c = new THREE.Color('#0b1020');
      scene.background = c;
      if (scene.fog){ scene.fog.color.copy(c); scene.fog.near = 14; scene.fog.far = 70; }
    }
    campPaintClues();
    campOpenJournal();
    try { window.__campStoryShot = {clues: (cg.sv.clues||[]).length, journal: true}; } catch(e){}
  }

  function campPoseGore(level){
    if (!cg) return;
    cg.shotLock = true;
    cg.sv.lessScary = false;
    campPersist(cg.sv);
    campRebuildGloam();
    campPaintLessBtn();
    if (typeof goreSetLevel === 'function') goreSetLevel(level);
    else campRebuildGore();
    cg.run.phase = 'night';
    cg.run.t = CampRules.CAMP_NIGHT * 0.45;
    cg.run.fire = 0.6;
    cg.run.gmode = 'hidden';
    cg.run.flicker = 0;
    if (cg.gloam) cg.gloam.visible = false;
    (cg.eyes || []).forEach(e => { if (e && e.g) e.g.visible = false; });
    if (P){ P.x = 36; P.z = -20; P.face = Math.atan2(12, -12); if (typeof cam !== 'undefined' && cam){ cam.yaw = P.face; cam.pitch = 0.08; cam.dist = 11; } }
    try { if (typeof body !== 'undefined' && body) body.visible = false; } catch (e){}
    campWorldLights(false, true, cg.run.fire, 0);
    if (scene){
      const c = new THREE.Color('#141018');
      scene.background = c;
      if (scene.fog){ scene.fog.color.copy(c); scene.fog.near = 14; scene.fog.far = 70; }
      scene.traverse(o => { if (o && (o.isSprite || (o.userData && o.userData.lab))) o.visible = false; });
    }
    if (!cg.moonLt){
      cg.moonLt = new THREE.DirectionalLight('#d8c8b8', 0.7);
      cg.moonLt.position.set(20, 24, 8);
      cg.moonLt._campSkip = true;
      scene.add(cg.moonLt); t302Keep(cg, cg.moonLt);
    }
    cg.moonLt.intensity = 0.75;
    cg.moonLt.visible = true;
    campRebuildGore();
    try { window.__campGoreShot = {level: campGoreWanted(), n: (cg.gore || []).length, kinds: (cg.gore || []).map(m => m.userData && m.userData.kind)}; } catch (e){ window.__campGoreShot = String(e); }
  }

  function campPoseWatchers(less){
    if (!cg) return;
    cg.shotLock = true;
    cg.sv.lessScary = !!less;
    campPersist(cg.sv);
    campRebuildGloam();
    campPaintLessBtn();
    cg.run.phase = 'night';
    cg.run.t = CampRules.CAMP_NIGHT * 0.4;
    cg.run.fire = 0.55;
    cg.run.gmode = 'hidden';
    cg.run.flicker = 0;
    cg.run.heart = 0;
    cg.run.frozen = false;
    if (cg.gloam) cg.gloam.visible = false;
    (cg.eyes || []).forEach(e => { if (e && e.g) e.g.visible = false; });
    (cg.watchPool || []).forEach(s => {
      if (!s || !s.mesh) return;
      s.used = false; s.fading = false; s.id = 0; s.fade = 1;
      s.mesh.visible = false;
    });
    // Stand the player behind the camera so the avatar does not fill the frame.
    if (P){ P.x = 6; P.z = 4; P.face = Math.atan2(-30, 28); if (typeof cam !== 'undefined' && cam){ cam.yaw = P.face; cam.pitch = 0.04; cam.dist = 12; } }
    try { if (typeof body !== 'undefined' && body) body.visible = false; } catch (e){}
    const night = less ? '#101526' : '#0b1020';
    campWorldLights(false, true, cg.run.fire, 0);
    if (scene){
      const c = new THREE.Color(night);
      scene.background = c;
      if (scene.fog){ scene.fog.color.copy(c); scene.fog.near = less ? 22 : 16; scene.fog.far = less ? 90 : 80; }
      scene.traverse(o => {
        if (o && (o.isSprite || (o.userData && o.userData.lab))) o.visible = false;
      });
    }
    if (!cg.moonLt){
      cg.moonLt = new THREE.DirectionalLight('#c7d8ff', 0.55);
      cg.moonLt.position.set(-8, 28, 18);
      cg.moonLt._campSkip = true;
      scene.add(cg.moonLt); t302Keep(cg, cg.moonLt);
    }
    cg.moonLt.intensity = less ? 0.7 : 0.5;
    cg.moonLt.visible = true;
    const faceTo = (x, z) => Math.atan2(6 - x, 4 - z);
    if (less){
      cg.run.watchers = [
        {id: 101, kind: 'owl', x: -28, z: 34, yaw: faceTo(-28, 34), look: 0, collide: false, glow: false, soft: true},
        {id: 102, kind: 'glow', x: -18, z: 30, yaw: faceTo(-18, 30), look: 0, collide: false, glow: false, soft: true}
      ];
    } else {
      cg.run.watchers = [
        {id: 201, kind: 'thin', x: -22, z: 28, yaw: faceTo(-22, 28), look: 0, collide: false, glow: true, soft: false},
        {id: 202, kind: 'pale', x: -14, z: 36, yaw: faceTo(-14, 36), look: 0, collide: false, glow: true, soft: false},
        {id: 203, kind: 'lake', x: -50, z: 44, yaw: faceTo(-50, 44), look: 0, collide: false, glow: true, soft: false}
      ];
    }
    cg.run.watchEvents = [];
    campSyncWatchers(0);
    try {
      window.__campWatchShot = {less: !!less, n: cg.run.watchers.length, kinds: cg.run.watchers.map(w => w.kind), vis: (cg.watchPool || []).filter(s => s.mesh && s.mesh.visible).length};
    } catch (e) { window.__campWatchShot = String(e); }
  }

  function buildCamp(){
    const sv = campState();
    const started = CampRules.campStartRun(sv, t302Now(), t302MpOn());
    campPersist(started.state);
    const less = !!started.state.lessScary;
    cg = {trash:[], sv: started.state, run: started.run, logs:[], buddy:null, light:null, fire:null, gloam:null, eyes:[], watchPool:[], gore:[], near:null, done:false, ambT:0, scareT:0, holding:false, lastPhase: started.run.phase};
    const day = started.run.phase === 'day';
    const bg = day ? '#8fd3ff' : (less ? '#2a3150' : '#070812');
    scene.background = new THREE.Color(bg);
    scene.fog = new THREE.Fog(bg, day ? 40 : (less ? 18 : 10), day ? 140 : (less ? 70 : 48));
    cg.ground = plat(0, 0, 0, CampRules.CAMP_SIZE, CampRules.CAMP_SIZE, less || day ? '#1d3a24' : '#0e1a12', 0.2);
    plat(0, 0.06, 0, 12, 12, '#1c261c', 0.06);
    // trails
    for (let i = 1; i < CampRules.CAMP_TRAILS.length; i++){
      const a = CampRules.CAMP_TRAILS[i - 1], b = CampRules.CAMP_TRAILS[i];
      if (a.x === 0 && a.z === 0 && b.x === 0 && b.z === 0) continue;
      const mx = (a.x + b.x) / 2, mz = (a.z + b.z) / 2;
      const dx = b.x - a.x, dz = b.z - a.z, len = Math.hypot(dx, dz);
      if (len < 1) continue;
      const strip = t302Mesh(new THREE.BoxGeometry(1.6, 0.06, len + 0.4), '#5a4630', mx, 0.08, mz, cg);
      strip.rotation.y = Math.atan2(dx, dz);
    }
    // lake + brook
    cg.lake = t302Mesh(new THREE.CylinderGeometry(10, 10, 0.16, 16), day ? '#3aa0d8' : '#1a3a58', -40, 0.1, 36, cg);
    cg.brook = t302Mesh(new THREE.BoxGeometry(6, 0.12, 22), day ? '#3aa0d8' : '#1a3a58', -44, 0.08, 8, cg);
    t302Lab('🌊 Moon Lake', -40, 2.4, 36);
    // old cabin
    t302Mesh(new THREE.BoxGeometry(6.2, 3.2, 5), '#5a3a28', 48, 1.7, -32, cg);
    const roof = t302Mesh(new THREE.ConeGeometry(4.6, 2.2, 4), '#3d2418', 48, 4.2, -32, cg);
    roof.rotation.y = Math.PI / 4;
    t302Mesh(new THREE.BoxGeometry(1.2, 1.8, 0.2), '#2a1a12', 48, 1.1, -29.4, cg);
    t302Mesh(new THREE.BoxGeometry(0.08, 1.15, 1.15), '#120c08', 51.14, 2.35, -30.6, cg);
    const porch = new THREE.PointLight('#ffcc88', day ? 0.1 : 0.6, 10);
    porch.position.set(48, 2.4, -28); porch._campSkip = true; scene.add(porch); t302Keep(cg, porch);
    t302Lab('🏚️ Old Cabin', 48, 5.4, -32);
    // clearings and deep woods
    plat(28, 0.05, 40, 16, 16, '#2a4a2a', 0.05);
    t302Lab('🌲 Pine Clearing', 28, 2.6, 40);
    plat(52, 0.04, 48, 24, 24, '#0a160e', 0.04);
    t302Lab('🌑 Deep Woods', 52, 2.8, 48);
    t302Lab('🪙 Brook Bend', -46, 2.2, -24);
    const tent = t302Mesh(new THREE.ConeGeometry(2.2, 2.6, 4), '#2a1c14', -6, 1.3, -5, cg);
    tent.rotation.y = Math.PI / 4;
    t302Lab('⛺ Tent', -6, 2.8, -5);
    t302Mesh(new THREE.BoxGeometry(2.4, 0.6, 1.2), '#4a2e1a', 7, 0.35, -4, cg);
    t302Lab('🧺 Craft Bench', 7, 2.2, -4);
    cg.bench = {x:7, z:-4};
    t302Mesh(new THREE.CylinderGeometry(0.8, 1, 0.3, 8), '#3d2a1a', 0, 0.2, 0, cg);
    const flame = new THREE.Mesh(new THREE.ConeGeometry(0.7, 1.7, 6), new THREE.MeshBasicMaterial({color:'#ff9f1c'}));
    flame.position.set(0, 1.15, 0); scene.add(flame); t302Keep(cg, flame);
    const glow = new THREE.Mesh(new THREE.ConeGeometry(0.38, 1.0, 6), new THREE.MeshBasicMaterial({color:'#ffe566'}));
    glow.position.set(0, 1.25, 0); scene.add(glow); t302Keep(cg, glow);
    cg.fire = {flame, glow};
    const light = new THREE.PointLight('#ffb347', day ? 0.4 : (less ? 1.6 : 2.2), day ? 16 : (less ? 28 : 20));
    light.position.set(0, 2.2, 0);
    scene.add(light); t302Keep(cg, light); cg.light = light;
    cg.lanternLt = new THREE.PointLight('#fff2c2', 0, 10);
    cg.lanternLt.position.set(0, 1.6, 0);
    scene.add(cg.lanternLt); t302Keep(cg, cg.lanternLt);
    t302Lab('🔥 Campfire', 0, 2.6, 0);
    // forest trees (no free stick piles at camp)
    const treeSpots = [];
    for (let i = 0; i < 70; i++){
      const ang = i * 2.4, r = 16 + (i * 7) % 52;
      let x = Math.sin(ang) * r, z = Math.cos(ang) * r;
      if (Math.hypot(x, z) < 14) continue;
      if (CampRules.campInWater(x, z)) continue;
      if (Math.hypot(x - 48, z + 32) < 8) continue;
      treeSpots.push([x, z, CampRules.campInDeep(x, z)]);
    }
    treeSpots.forEach(p => t302Tree(cg, p[0], p[1], p[2] ? '#0b2412' : '#16351c', p[2] ? 4.2 : 3.2));
    cg.logs = [];
    (cg.run.logs || []).forEach(log => {
      const mesh = campMakeLogMesh(cg, log);
      cg.logs.push({id:log.id, x:log.x, z:log.z, kind:log.kind, mesh});
    });
    if (cg.run.buddy){
      const body = t302Mesh(new THREE.BoxGeometry(0.6, 1.1, 0.4), '#3a86ff', 2.2, 0.9, 1.6, cg);
      t302Mesh(new THREE.BoxGeometry(0.45, 0.45, 0.45), '#ffd23f', 2.2, 1.65, 1.6, cg);
      t302Lab('🌟 Pip the Camp Buddy', 2.2, 2.5, 1.6);
      cg.buddy = body;
    }
    campRebuildGloam();
    campPaintLessBtn();
    campRebuildGore();
    campBuildStory();
    checkpoints[0] = {idx:0, spawn:{x:0,y:0.5,z:8}, flag:new THREE.Object3D()};
  }
  function campEnter(){
    if (!cg) return;
    cam.pitch = 0.28; cam.dist = 14;
    t302Note('play:camp'); t302Ach('camp-visit');
    t302BindHud();
    const less = !!cg.sv.lessScary;
    banner(less
      ? '🔥 Campfire Grove. Less scary is on — this is the milder Gloam from before. Hunt logs by day, survive 5 nights. If it catches you, everyone is okay.'
      : '🔥 Campfire Grove. Really scary default: the Gloam hunts hard after dark. Stoke the fire, shine a lantern, survive 5 nights. If it catches you, everyone is still okay. Toggle Less scary anytime.');
    if (cg.run.buddy) setTimeout(() => { if (cg && !cg.done) banner('🌟 Pip: "I will watch the trees. You fetch the logs. I do not leave camp!"'); }, 2200);
    t302Hud('Goal: survive 5 nights. Hunt logs in the woods, stash them at camp, keep the fire bright after dark.', '🔥 Stoke');
    const vig = document.getElementById('t302Vignette'); if (vig) vig.classList.add('show');
  }

  function campGoreWanted(){
    const rules = (typeof GoreRules !== 'undefined' && GoreRules) ? GoreRules : null;
    if (!rules) return 'off';
    let raw = 'off';
    try { raw = (typeof goreSetting === 'function') ? goreSetting() : ((typeof load === 'function') ? load(rules.GORE_KEY, 'off') : 'off'); } catch (e){}
    return rules.goreEffective(raw, {lessScary: !!(cg && cg.sv && cg.sv.lessScary)});
  }
  function campGoreNoteText(){
    const rules = (typeof GoreRules !== 'undefined' && GoreRules) ? GoreRules : null;
    if (!rules || !cg) return '';
    let raw = 'off';
    try { raw = (typeof goreSetting === 'function') ? goreSetting() : ((typeof load === 'function') ? load(rules.GORE_KEY, 'off') : 'off'); } catch (e){}
    return rules.goreCapNote(raw, !!(cg.sv && cg.sv.lessScary)) || '';
  }
  function campPaintGoreNote(){
    const n = document.getElementById('t302GoreNote');
    if (!n) return;
    const text = campGoreNoteText();
    if (text){ n.textContent = text; n.classList.add('show'); n.hidden = false; }
    else { n.textContent = ''; n.classList.remove('show'); n.hidden = true; }
  }
  function campClearGore(){
    if (!cg) return;
    (cg.gore || []).forEach(m => {
      try { if (m && m.parent) m.parent.remove(m); } catch (e){}
      try { scene.remove(m); } catch (e){}
    });
    cg.gore = [];
  }
  function campGoreMat(color, opacity){
    return new THREE.MeshBasicMaterial({color: color, transparent: true, opacity: opacity == null ? 0.88 : opacity, depthWrite: false, side: THREE.DoubleSide});
  }
  function campMakeGoreMesh(d){
    const g = new THREE.Group();
    g.userData.gore = true;
    g.userData.kind = d.kind;
    g.userData.id = d.id;
    g.position.set(d.x, d.y, d.z);
    g.rotation.y = d.yaw || 0;
    const add = (mesh, ox, oy, oz) => {
      mesh.position.set(ox || 0, oy || 0, oz || 0);
      mesh.castShadow = mesh.receiveShadow = false;
      mesh.raycast = function(){};
      g.add(mesh);
      return mesh;
    };
    if (d.kind === 'scratch'){
      const a = new THREE.Mesh(new THREE.BoxGeometry(d.sx || 0.04, d.sy || 0.7, d.sz || 0.2), campGoreMat('#6a1018', 0.9));
      add(a);
      const b = new THREE.Mesh(new THREE.BoxGeometry((d.sx || 0.04) * 0.8, (d.sy || 0.7) * 0.7, (d.sz || 0.2) * 0.45), campGoreMat('#4a0c12', 0.85));
      add(b, 0.06, -0.08, 0.02);
      const c = new THREE.Mesh(new THREE.BoxGeometry((d.sx || 0.04) * 0.7, (d.sy || 0.7) * 0.55, (d.sz || 0.2) * 0.35), campGoreMat('#7a1820', 0.8));
      add(c, -0.05, 0.1, -0.01);
    } else if (d.kind === 'stain'){
      const puddle = new THREE.Mesh(new THREE.CylinderGeometry((d.sx || 1) * 0.5, (d.sz || 0.8) * 0.45, d.sy || 0.03, 8), campGoreMat('#5a1218', 0.72));
      add(puddle);
      const spot = new THREE.Mesh(new THREE.CylinderGeometry((d.sx || 1) * 0.22, (d.sx || 1) * 0.18, (d.sy || 0.03) + 0.01, 6), campGoreMat('#7a1a22', 0.7));
      add(spot, (d.sx || 1) * 0.18, 0.01, (d.sz || 0.8) * -0.12);
    } else if (d.kind === 'handprint'){
      const palm = new THREE.Mesh(new THREE.SphereGeometry(0.11, 8, 6), campGoreMat('#8a1c24', 0.82));
      palm.scale.set(1, 1.15, 0.35);
      add(palm, 0, -0.02, 0);
      [-0.12, -0.05, 0.03, 0.1, 0.14].forEach((x, i) => {
        const f = new THREE.Mesh(new THREE.SphereGeometry(i === 0 ? 0.04 : 0.035, 6, 5), campGoreMat('#7a1820', 0.84));
        f.scale.set(0.7, i === 0 ? 0.9 : 1.35, 0.35);
        add(f, x, 0.12 + (i === 0 ? -0.04 : 0.02 * (i % 2)), 0);
      });
    } else {
      const blob = new THREE.Mesh(new THREE.SphereGeometry(0.28, 8, 6), campGoreMat('#9a1e28', 0.86));
      blob.scale.set(d.sx || 0.55, d.sy || 0.42, (d.sz || 0.04) * 4);
      add(blob);
      const drip = new THREE.Mesh(new THREE.SphereGeometry(0.12, 6, 5), campGoreMat('#7a1620', 0.8));
      drip.scale.set(0.55, 1.1, 0.35);
      add(drip, 0.08, -0.18, 0);
    }
    g.raycast = function(){};
    return g;
  }
  function campRebuildGore(){
    if (!cg || typeof THREE === 'undefined') return;
    campClearGore();
    campPaintGoreNote();
    const rules = (typeof GoreRules !== 'undefined' && GoreRules) ? GoreRules : null;
    if (!rules) return;
    let raw = 'off';
    try { raw = (typeof goreSetting === 'function') ? goreSetting() : ((typeof load === 'function') ? load(rules.GORE_KEY, 'off') : 'off'); } catch (e){}
    const list = rules.goreCampDecals(raw, {lessScary: !!(cg.sv && cg.sv.lessScary)});
    list.forEach(d => {
      const m = campMakeGoreMesh(d);
      scene.add(m);
      t302Keep(cg, m);
      cg.gore.push(m);
    });
  }

  function campPaintLessBtn(){
    const b = document.getElementById('t302LessBtn');
    if (!b || !cg) return;
    if (cg.sv.lessScary){
      b.textContent = '😈 Really scary';
      b.setAttribute('aria-label', 'Switch to the really scary default Gloam. Everyone is okay if it catches you.');
      b.title = 'Really scary default: creepier Gloam, jumpscares, heartbeat, harder nights 4–5. Light still keeps you safe.';
    } else {
      b.textContent = '😌 Less scary';
      b.setAttribute('aria-label', 'Switch to Less scary: the milder Gloam from before. Getting caught still means everyone is okay.');
      b.title = 'Less scary uses the milder Gloam from before (the 2026.11.19-4 hunt). Soft scares, no jumpscare sting.';
    }
  }
  function campToggleLess(){
    if (!cg) return;
    cg.sv = CampRules.campSetLessScary(cg.sv, !cg.sv.lessScary);
    campPersist(cg.sv);
    campRebuildGloam();
    campPaintLessBtn();
    campRebuildGore();
    banner(cg.sv.lessScary
      ? 'Less scary is on. This is the milder Gloam from before — same hunt, looks, and sounds. Getting caught still means everyone is okay.'
      : 'Really scary is on. The Gloam is taller and sneakier, with jumpscares and a heartbeat. Light still pushes it back, and everyone is okay if it catches you.');
    t302Snd('cp');
  }
  function campPaintCraft(){
    const box = document.getElementById('campCraftList');
    if (!box || !cg) return;
    box.innerHTML = CampRules.CAMP_CRAFT.map(it => {
      const have = cg.sv.crafted.indexOf(it.id) >= 0;
      return `<div class="t297row${have ? ' dim' : ''}"><span>${it.emoji} ${it.name} — ${it.sticks} sticks ${have ? '(packed!)' : ''}</span>${have ? '' : `<button type="button" data-cc="${it.id}">Craft</button>`}</div>`;
    }).join('') + `<div class="t297row"><span>🪵 Stashed ${cg.sv.sticks}  ·  carrying ${(cg.run && cg.run.carry) || 0}/${CampRules.CAMP_CARRY}  ·  nights ${(cg.run && cg.run.survived) || 0}/${CampRules.CAMP_WIN_NIGHTS}</span></div>` +
      `<div class="t297row"><span>😌 Less scary: ${cg.sv.lessScary ? 'on' : 'off'}. ${cg.sv.lessScary ? 'On uses the milder Gloam from before (same look, hunt, and sounds).' : 'Off is the really scary default — a creepier Gloam, jumpscares, heartbeat, and harder nights 4–5. Light still keeps you safe, and getting caught still means everyone is okay.'}${campGoreNoteText() ? ' ' + campGoreNoteText() : ''}</span><button type="button" data-cless="1">Toggle</button></div>` +
      (CampRules.campHas(cg.sv, 'lantern') ? '<p>Press L or the Lantern action to shine it and push the Gloam back.</p>' : '<p>Craft a Glow Lantern to shine light and scare the Gloam away.</p>');
    box.querySelectorAll('[data-cc]').forEach(btn => { btn.onclick = ev => { ev.preventDefault(); campDoCraft(btn.getAttribute('data-cc')); }; });
    const tb = box.querySelector('[data-cless]');
    if (tb) tb.onclick = ev => { ev.preventDefault(); campToggleLess(); campPaintCraft(); };
  }
  function campDoCraft(id){
    const r = CampRules.campCraft(cg.sv, id);
    if (!r.ok){ banner(r.why === 'sticks' ? 'Need ' + r.need + ' more sticks. Hunt logs in the forest and stash them at camp first.' : r.why === 'have' ? 'You already crafted that!' : 'Cannot craft that.'); return; }
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
    const nights = (cg.run && cg.run.survived) || 0;
    if (title) title.textContent = win ? '🌅 Five sunrises!' : '🌅 Dawn in the grove';
    if (body) body.textContent = win
      ? ('You kept the grove safe through five spooky nights! The Gloam faded with the light. ' + (pay ? ('+' + pay + ' 🪙') : ''))
      : ('You made it through ' + nights + ' night' + (nights === 1 ? '' : 's') + '. Gather more logs and try for five. Everyone is okay!');
    if (win){ t302Pay(pay, '🌅 Sunrise'); t302Snd('win'); try { if (typeof confetti === 'function') confetti(); } catch (e){} }
    else t302Snd('cp');
    t302Open('campWin');
  }
  function campRetry(){
    if (typeof t297OverlayClose === 'function') t297OverlayClose('campWin');
    const started = CampRules.campStartRun(cg.sv, t302Now(), t302MpOn());
    campPersist(started.state);
    cg.sv = started.state;
    cg.run = started.run;
    cg.done = false;
    cg.scareT = 0;
    cg.holding = false;
    cg.lastPhase = started.run.phase;
    const scare = document.getElementById('t302Scare'); if (scare) scare.classList.remove('show', 'strong', 'jump');
    banner('A new stay in the grove. Hunt logs by day, keep the fire bright for 5 nights!');
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
  function campDoCaught(){
    const r = CampRules.campCaught(cg.sv, cg.run);
    campPersist(r.state);
    cg.run = r.run;
    P.x = 0; P.z = 8; P.y = 0.5; P.vy = 0;
    const lost = (r.lostCarry || 0) + (r.lostStash || 0);
    banner('The Gloam got too close… but everyone is okay! You are back at camp' + (lost ? (', and dropped ' + lost + ' log' + (lost === 1 ? '' : 's')) : '') + '.');
    const el = document.getElementById('t302Scare');
    if (cg.sv.lessScary){
      t302Tone([160, 70, 40], 0.16, 'triangle', 0.09);
      cg.scareT = 0.45;
      if (el){ el.classList.add('show', 'strong'); el.classList.remove('jump'); }
    } else {
      t302Tone([40, 180, 70, 30, 220], 0.28, 'square', 0.16);
      t302Tone([90, 40], 0.18, 'sawtooth', 0.12);
      cg.scareT = 0.9;
      cg.shake = 0.55;
      if (el){ el.classList.add('show', 'strong', 'jump'); }
    }
    cg.run.scarePop = false;
    cg.run.catchScare = false;
    cg.run.respawn = false;
  }
  function campHold(on){
    if (!cg || cg.done) return;
    cg.holding = !!on;
    if (!on && cg.run) cg.run.chopping = null;
  }


  function campBuildStory(){
    if (!cg) return;
    cg.clueMeshes = {};
    (CampRules.CAMP_CLUES || []).forEach(c => {
      const col = c.id === 'light' ? '#ffe566' : (c.id === 'radio' ? '#8ad0ff' : '#d9b48f');
      const m = t302Mesh(new THREE.BoxGeometry(0.5, 0.35, 0.5), col, c.x, 0.35, c.z, cg);
      t302Lab((c.emoji || '🔍') + ' ' + c.name, c.x, 1.6, c.z);
      cg.clueMeshes[c.id] = m;
    });
    const h = CampRules.CAMP_HOLLOW;
    const trunk = t302Mesh(new THREE.CylinderGeometry(0.7, 0.9, 3.2, 8), '#5a3a22', h.x, 1.6, h.z, cg);
    const wren = t302Mesh(new THREE.BoxGeometry(0.6, 1.1, 0.4), '#3a86ff', h.x + 1.2, 0.9, h.z, cg);
    t302Mesh(new THREE.BoxGeometry(0.45, 0.45, 0.45), '#ffd23f', h.x + 1.2, 1.65, h.z, cg);
    t302Lab('🧣 Maple Wren', h.x + 1.2, 2.6, h.z);
    t302Lab('🌳 Hollow Tree', h.x, 3.4, h.z);
    cg.wrenMesh = wren;
    campPaintClues();
  }

  function campPaintJournal(){
    const box = document.getElementById('campJournalList');
    const title = document.getElementById('campJournalTitle');
    if (!box || !cg) return;
    const j = CampRules.campJournalLines(cg.sv, !!(cg.sv && cg.sv.lessScary));
    if (title) title.textContent = j.title;
    box.innerHTML = '<p class="campStoryIntro">' + j.intro + '</p>' +
      j.lines.map(l => '<div class="t297row' + (l.have ? '' : ' dim') + '"><span>' + l.emoji + ' ' + l.name + ' — ' + l.text + '</span></div>').join('') +
      '<div class="t297row"><span>' + (j.done ? '🧣 Maple Wren is safe by the hollow tree. Everyone is okay!' : (j.ready ? 'All clues are in! Follow them to the hollow tree in the Deep Woods.' : ('Clues ' + j.found + '/' + j.total + '.'))) + '</span></div>';
  }
  function campOpenJournal(){
    campPaintJournal();
    if (typeof t297OverlayShow === 'function') t297OverlayShow('campJournal', true);
    else { const el = document.getElementById('campJournal'); if (el) el.classList.add('show'); }
    return true;
  }
  function campPickStory(){
    if (!cg) return false;
    const hit = CampRules.campNearClue(P.x, P.z, cg.sv);
    if (!hit) return false;
    if (hit.final){
      const r = CampRules.campFindCamper(cg.sv);
      if (!r.ok){ banner('Keep looking — there are still clues to find.'); return true; }
      campPersist(r.state); cg.sv = r.state;
      t302Pay(r.reward, '🧣 Wren is safe'); t302Snd('win'); t302Ach('camp-wren'); t302Note('camp-wren');
      try { if (typeof confetti === 'function') confetti(); } catch(e){}
      banner('🧣 You found Maple Wren! They were watching fireflies and lost the path. Everyone is okay!' + (r.reward ? (' +' + r.reward + ' 🪙') : ''));
      campPaintClues(); campPaintJournal();
      return true;
    }
    const r = CampRules.campFindClue(cg.sv, hit.id);
    if (!r.ok) return false;
    campPersist(r.state); cg.sv = r.state;
    t302Snd('cp'); t302Note('camp-clue');
    const less = !!(cg.sv && cg.sv.lessScary);
    banner(hit.emoji + ' ' + CampRules.campClueText(hit.id, less) + (r.left ? ('  (' + (CampRules.CAMP_CLUES.length - r.left) + '/' + CampRules.CAMP_CLUES.length + ')') : '  All clues found! Check the Deep Woods.'));
    campPaintClues(); campPaintJournal();
    return true;
  }
  function campPaintClues(){
    if (!cg) return;
    cg.clues = cg.clues || [];
    (cg.clues || []).forEach(m => { try { m.visible = true; } catch(e){} });
    (CampRules.CAMP_CLUES || []).forEach(c => {
      const have = CampRules.campHasClue(cg.sv, c.id);
      const mesh = (cg.clueMeshes || {})[c.id];
      if (mesh) mesh.visible = !have;
    });
    if (cg.wrenMesh) cg.wrenMesh.visible = CampRules.campCanFindCamper(cg.sv) || !!(cg.sv && cg.sv.camperFound);
  }

  function campAct(){
    if (!cg || cg.done) return false;
    if (campPickStory()) return true;
    if (cg.near && cg.near.kind === 'bench'){ t302Open('campCraft'); return true; }
    if (cg.near && cg.near.kind === 'log'){
      const log = CampRules.campLog(cg.run, cg.near.id);
      if (log && log.kind === 'fallen'){
        const r = CampRules.campPickLog(cg.sv, cg.run, log.id);
        if (!r.ok){ banner(r.why === 'full' ? 'Your arms are full (' + CampRules.CAMP_CARRY + '). Stash logs at the campfire first!' : r.why === 'empty' ? 'That log is gone. Another will grow back soon.' : 'Cannot pick that up.'); return true; }
        campPersist(r.state); cg.run = r.run;
        t302Note('camp-stick'); t302Snd('jump');
        banner('🪵 Picked up a log. Carrying ' + r.run.carry + '/' + CampRules.CAMP_CARRY + '.');
        campPaintLogMeshes();
        return true;
      }
      return true;
    }
    if (cg.near && cg.near.kind === 'fire'){
      if ((cg.run.carry | 0) > 0 && (cg.sv.sticks | 0) === 0 || (cg.run.carry | 0) > 0 && !(cg.edgeStoke)){
        if ((cg.run.carry | 0) > 0){
          const st = CampRules.campStash(cg.sv, cg.run);
          if (st.ok){ campPersist(st.state); cg.run = st.run; banner('🪵 Stashed ' + st.stashed + ' log' + (st.stashed === 1 ? '' : 's') + ' at camp. ' + st.state.sticks + ' ready for the fire.'); t302Snd('jump'); return true; }
        }
      }
      const r = CampRules.campAddStick(cg.sv, cg.run);
      if (!r.ok){ banner('Hunt logs in the forest, carry them back, and stash them at camp before you stoke the fire.'); return true; }
      campPersist(r.state); cg.run = r.run;
      t302Send({a:'camp-stick'});
      t302Note('camp-stoke'); t302Snd('boing');
      banner('🔥 The fire brightens! The Gloam backs away.');
      return true;
    }
    if (CampRules.campHas(cg.sv, 'lantern')) return campShineNow();
    return false;
  }
  function campPaintLogMeshes(){
    if (!cg) return;
    (cg.logs || []).forEach(row => {
      const log = CampRules.campLog(cg.run, row.id);
      const on = !!(log && (log.left | 0) > 0);
      if (row.mesh) row.mesh.visible = on;
    });
  }
  function campPaintNav(){
    if (!cg || !P) return;
    const c = CampRules.campCompass(P.x, P.z);
    const needle = document.getElementById('campNeedle');
    if (needle) needle.style.transform = 'rotate(' + (Math.atan2(P.x, P.z) * 180 / Math.PI) + 'deg)';
    const map = document.getElementById('campMap');
    if (!map || !map.getContext) return;
    const ctx = map.getContext('2d');
    const W = map.width, H = map.height, sc = W / CampRules.CAMP_SIZE;
    const sx = x => W / 2 + x * sc, sz = z => H / 2 + z * sc;
    ctx.fillStyle = (cg.run.phase === 'day') ? '#1f5a32' : '#0c1c12';
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = (cg.run.phase === 'day') ? '#3aa0d8' : '#1a3a58';
    ctx.beginPath(); ctx.arc(sx(-40), sz(36), 10 * sc, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#7a6248'; ctx.lineWidth = 2;
    ctx.beginPath();
    CampRules.CAMP_TRAILS.forEach((p, i) => { if (i && !(p.x === 0 && p.z === 0 && CampRules.CAMP_TRAILS[i-1].x === 0)) i === 0 || (CampRules.CAMP_TRAILS[i-1].x === 0 && CampRules.CAMP_TRAILS[i-1].z === 0 && p.x === 0) ? ctx.moveTo(sx(p.x), sz(p.z)) : ctx.lineTo(sx(p.x), sz(p.z)); });
    ctx.stroke();
    ctx.fillStyle = '#5a3a28'; ctx.fillRect(sx(48) - 3, sz(-32) - 3, 6, 6);
    ctx.fillStyle = '#0a160e'; ctx.beginPath(); ctx.arc(sx(52), sz(48), 12 * sc, 0, Math.PI * 2); ctx.fill();
    ctx.font = '12px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('🔥', sx(0), sz(0) + 4);
    ctx.fillStyle = '#ffd23f';
    ctx.beginPath(); ctx.arc(sx(P.x), sz(P.z), 4, 0, Math.PI * 2); ctx.fill();
    if (cg.run.phase === 'night' && cg.gloam){
      ctx.fillStyle = '#7dff6a';
      ctx.beginPath(); ctx.arc(sx(cg.run.gx || 0), sz(cg.run.gz || 0), 3, 0, Math.PI * 2); ctx.fill();
    }
  }
  function campWorldLights(day, less, fire, flick){
    if (!scene || !cg) return;
    const k = fire || 0;
    const spook = !less && !day;
    scene.traverse(o => {
      if (!o || !o.isLight) return;
      if (o === cg.light || o === cg.lanternLt || o._campSkip) return;
      if (o._campBase == null) o._campBase = o.intensity;
      o.intensity = o._campBase * (day ? 1 : ((spook ? 0.035 + k * 0.08 : 0.05 + k * 0.1) * (1 - (flick || 0) * 0.25)));
      if (o.isHemisphereLight){
        if (!o._campSky){ o._campSky = o.color.clone(); o._campGround = o.groundColor.clone(); }
        if (day){ o.color.copy(o._campSky); o.groundColor.copy(o._campGround); }
        else {
          o.color.set(spook ? '#10081c' : '#152038');
          o.groundColor.set(spook ? '#030208' : '#04060a');
        }
      }
    });
    if (cg.ground && cg.ground.mesh && cg.ground.mesh.material && cg.ground.mesh.material.color){
      cg.ground.mesh.material.color.set(day ? '#1d3a24' : (spook ? '#05080a' : '#08110c'));
    }
    if (cg.lake && cg.lake.material && cg.lake.material.color){
      cg.lake.material.color.set(day ? '#3aa0d8' : (spook ? '#081828' : '#0d2238'));
    }
    if (cg.brook && cg.brook.material && cg.brook.material.color){
      cg.brook.material.color.set(day ? '#3aa0d8' : (spook ? '#081828' : '#0d2238'));
    }
  }
  function campRestoreLights(){
    if (!scene) return;
    scene.traverse(o => {
      if (!o || !o.isLight) return;
      if (o._campBase != null){ o.intensity = o._campBase; delete o._campBase; }
      if (o._campSky){ o.color.copy(o._campSky); o.groundColor.copy(o._campGround); delete o._campSky; delete o._campGround; }
    });
  }
  function campUpdate(dt){

    if (!cg) return;
    dt = t302Dt(dt);
    const less = !!cg.sv.lessScary;
    const face = (typeof cam !== 'undefined' && cam && cam.yaw) || (P && P.face) || 0;
    if (!cg.done && !cg.shotLock){
      if (cg.holding && cg.near && cg.near.kind === 'log'){
        const r = CampRules.campChopLog(cg.sv, cg.run, cg.near.id, dt);
        if (r.why === 'full'){ banner('Your arms are full. Stash logs at the campfire first!'); cg.holding = false; }
        else if (r.ok && r.why === 'ok'){
          campPersist(r.state); cg.run = r.run; cg.holding = false;
          t302Note('camp-stick'); t302Snd('jump');
          banner('🪵 Chopped a log. Carrying ' + r.run.carry + '/' + CampRules.CAMP_CARRY + '.');
          campPaintLogMeshes();
        }
      }
      CampRules.campTick(cg.run, dt, {lessScary:less, blanket: CampRules.campHas(cg.sv, 'blanket'), px: P.x, pz: P.z, face});
      if (cg.run.wantCatch) campDoCaught();
      if (cg.run.phase !== cg.lastPhase){
        cg.lastPhase = cg.run.phase;
        if (cg.run.phase === 'night') banner('🌙 Night ' + ((cg.run.survived || 0) + 1) + ' of ' + CampRules.CAMP_WIN_NIGHTS + '. The Gloam is out — stay close to the light!');
        else if (!cg.run.won) banner(cg.run.nightKept ? '🌅 Sunrise! Night kept. Day ' + cg.run.day + ' — hunt more logs before dark.' : '🌅 Dawn, but the fire was too low. Everyone is okay. Day ' + cg.run.day + ' — gather logs and try tonight.');
      }
      if (cg.run.scarePop && !cg.scareT){
        const el = document.getElementById('t302Scare');
        if (less){
          cg.scareT = cg.run.appearBehind ? 0.42 : 0.28;
          if (el){ el.classList.add('show'); el.classList.toggle('strong', !!cg.run.appearBehind); el.classList.remove('jump'); }
          t302Tone(cg.run.appearBehind ? [220, 80, 40, 180] : [180, 90, 220], cg.run.appearBehind ? 0.14 : 0.09, 'triangle', cg.run.appearBehind ? 0.12 : 0.08);
          banner(cg.run.appearBehind ? '👁️ It was right behind you! Run for the fire or shine a lantern!' : '👁️ Eyes in the dark! Stoke the fire or shine a lantern!');
        } else {
          cg.scareT = cg.run.appearBehind ? 0.7 : 0.48;
          if (el){ el.classList.add('show', 'jump'); el.classList.toggle('strong', !!cg.run.appearBehind); }
          t302Tone(cg.run.appearBehind ? [40, 200, 70, 30, 160] : [60, 160, 40, 220], cg.run.appearBehind ? 0.2 : 0.14, 'square', cg.run.appearBehind ? 0.14 : 0.1);
          cg.shake = Math.max(cg.shake || 0, cg.run.appearBehind ? 0.4 : 0.22);
          banner(cg.run.appearBehind ? '👁️ It was right behind you! Run for the fire or shine a lantern!' : '👁️ The Gloam is close! Stoke the fire or shine a lantern!');
        }
        cg.run.scarePop = false;
        cg.run.appearBehind = false;
      }
      if (cg.run.won && !cg.done){
        cg.done = true;
        const fin = CampRules.campFinish(cg.sv, cg.run);
        campPersist(fin.state);
        t302Note('camp-sunrise'); t302Ach('camp-sunrise'); t302Board('camp-sunrises', fin.state.sunrises);
        campShowEnd(true);
      }
    }
    if (cg.scareT){
      cg.scareT = Math.max(0, cg.scareT - dt);
      if (cg.scareT <= 0){ const el = document.getElementById('t302Scare'); if (el) el.classList.remove('show', 'strong', 'jump'); }
    }
    const k = cg.run.fire || 0;
    const day = cg.run.phase === 'day';
    const dawn = (!day && cg.run.t > CampRules.CAMP_NIGHT * 0.78) ? (cg.run.t / CampRules.CAMP_NIGHT - 0.78) / 0.22 : (day && cg.run.t < 8 ? 1 - cg.run.t / 8 : (day ? 1 : 0));
    const flick = (!less && !day) ? (cg.run.flicker || 0) : 0;
    const flickAmt = flick > 0 ? (0.55 + 0.45 * Math.abs(Math.sin(time * 28 + (cg.run.teleported ? 2 : 0)))) : 1;
    if (cg.light){
      cg.light.intensity = (day ? 0.35 : (0.25 + k * 1.8)) * (less || day ? 1 : (1 - flick * 0.55 * (1 - flickAmt)));
      cg.light.distance = day ? 18 : (12 + k * 10);
    }
    if (cg.lanternLt){
      const baseL = (cg.run.lantern || 0) > 0 ? 1.4 : 0;
      cg.lanternLt.intensity = baseL * (less || day ? 1 : (1 - flick * 0.4 * (1 - flickAmt)));
      if (P) cg.lanternLt.position.set(P.x, 1.7, P.z);
    }
    if (cg.fire){
      const s = (0.6 + k * 0.8 + Math.sin(time * 8) * 0.05) * (less || day ? 1 : (0.72 + 0.28 * flickAmt));
      cg.fire.flame.scale.set(s, (0.7 + k * 0.9) * (less || day ? 1 : (0.75 + 0.25 * flickAmt)), s);
      cg.fire.glow.scale.set(s * 0.7, (0.6 + k) * (less || day ? 1 : (0.75 + 0.25 * flickAmt)), s * 0.7);
    }
    const night = less ? '#070812' : '#04030a';
    const morn = '#8fd3ff';
    const bg = new THREE.Color(night).lerp(new THREE.Color(morn), Math.min(1, Math.max(0, day ? 1 : dawn)));
    scene.background = bg;
    if (scene.fog){
      scene.fog.color.copy(bg);
      const inDeep = CampRules.campInDeep(P.x, P.z);
      const nearFog = day ? (inDeep ? 18 : 40) : (inDeep ? 6 : 10 + k * 6);
      const farFog = day ? (inDeep ? 60 : 140) : (inDeep ? 24 : 40 + k * 16);
      scene.fog.near = less || day ? nearFog : Math.max(4, nearFog - flick * 5);
      scene.fog.far = less || day ? farFog : Math.max(16, farFog - flick * 14 - (CampRules.campNightHard(cg.run) ? 8 : 0));
    }
    campWorldLights(day, less, k, flick);
    const vig = document.getElementById('t302Vignette');
    if (vig){
      const dark = day ? 0.05 : Math.max(0, 1 - k) * 0.9 * (1 - Math.min(1, dawn));
      const pulse = (!less && !day) ? (0.08 * (cg.run.heart || 0) * (0.6 + 0.4 * Math.sin(time * 8))) : 0;
      vig.style.opacity = String(Math.min(1, 0.2 + dark * 0.75 + pulse));
      vig.classList.add('show');
      vig.classList.toggle('pulse', !less && !day && (cg.run.heart || 0) > 0.35);
    }
    const closeDist = P ? Math.hypot((cg.run.gx || 0) - P.x, (cg.run.gz || 0) - P.z) : 99;
    if (cg.gloam){
      if (cg.run.gmode === 'hidden' || day){
        cg.gloam.visible = false;
      } else {
        cg.gloam.visible = true;
        const dart = cg.run.gmode === 'dart' || cg.run.gmode === 'behind';
        const bob = cg.run.frozen ? 0 : (dart ? Math.sin(time * 14) * 0.15 : Math.sin(time * 3) * 0.08);
        const twitch = (!less && !cg.run.frozen) ? Math.sin(time * 17) * 0.05 : 0;
        cg.gloam.position.set(cg.run.gx || 16, bob + twitch, cg.run.gz || -16);
        if (P) cg.gloam.lookAt(P.x, less ? 1.6 : 1.9, P.z);
        const close = closeDist < 6;
        if (less){
          cg.gloam.scale.setScalar(1 * (close ? 1.18 : 1) * (cg.run.gmode === 'chase' ? 1.12 : 1));
        } else {
          const scareScale = (close ? 1.28 : 1) * (cg.run.gmode === 'chase' ? 1.18 : 1) * (cg.run.frozen ? 1.05 : 1);
          cg.gloam.scale.setScalar(scareScale);
        }
        if (cg.gloam.userData && cg.gloam.userData.face){
          cg.gloam.userData.face.visible = !less && closeDist < 6.5;
        }
        (cg.gloam.userData.eyes || []).forEach((eye, i) => {
          const flickEye = less ? 1 : (0.15 + 0.85 * Math.abs(Math.sin(time * (9 + i * 7) + i)));
          eye.scale.setScalar(flickEye);
          if (cg.gloam.userData.halos && cg.gloam.userData.halos[i]){
            cg.gloam.userData.halos[i].scale.setScalar(flickEye * (less ? 1 : 1.15));
            if (cg.gloam.userData.halos[i].material) cg.gloam.userData.halos[i].material.opacity = less ? 0.55 : (0.25 + 0.55 * flickEye);
          }
        });
      }
    }
    (cg.eyes || []).forEach((e, i) => {
      const pulse = 0.7 + Math.sin(time * 3 + i) * 0.3;
      const hide = day ? 0 : ((cg.run.gmode === 'hidden') ? 0.05 : pulse);
      const spook = less ? hide : hide * (0.35 + 0.65 * Math.abs(Math.sin(time * 8 + i * 1.7)));
      e.g.children.forEach(c => { c.scale.setScalar(spook); });
    });
    if (cg.buddy) cg.buddy.position.y = 0.9 + Math.sin(time * 2) * 0.04;
    campSyncWatchers(dt);
    cg.ambT = (cg.ambT || 0) - dt;
    if (cg.ambT <= 0 && !cg.done && !day){
      const close = closeDist;
      if (less){
        cg.ambT = 2.2 + Math.random() * 3;
        const vol = close < 10 ? 0.08 : 0.045;
        t302Tone(cg.run.gmode === 'chase' ? [70, 50, 90, 40] : [90, 60, 80], close < 8 ? 0.22 : 0.16, 'sine', vol);
      } else {
        cg.ambT = 1.4 + Math.random() * 2.2;
        const vol = close < 10 ? 0.1 : 0.055;
        t302Tone(cg.run.gmode === 'chase' ? [50, 36, 80, 28] : [70, 48, 64], close < 8 ? 0.26 : 0.18, 'sine', vol);
      }
    }
    if (!less && !day && !cg.done){
      cg.heartT = (cg.heartT || 0) - dt;
      const h = cg.run.heart || 0;
      if (h > 0.12 && cg.heartT <= 0){
        t302Tone([62, 48], 0.05, 'sine', 0.04 + h * 0.07);
        cg.heartT = Math.max(0.28, 1.15 - h * 0.8);
        if (h > 0.55) cg.shake = Math.max(cg.shake || 0, 0.06 + h * 0.1);
      }
      if (cg.run.fakeOut){
        if (cg.run.whisper) t302Tone([180, 140, 90, 70], 0.2, 'triangle', 0.05);
        else t302Tone([90, 60], 0.07, 'sine', 0.06);
        cg.run.fakeOut = false;
      } else if (cg.run.whisper){
        t302Tone([160, 110, 80], 0.16, 'triangle', 0.04);
        cg.run.whisper = false;
      } else if (cg.run.nearStep && (cg.stepT || 0) <= 0){
        t302Tone([80, 50], 0.05, 'sine', 0.045);
        cg.stepT = 0.45;
        cg.run.nearStep = false;
      }
      cg.stepT = Math.max(0, (cg.stepT || 0) - dt);
      if (cg.run.teleported){ t302Tone([40, 70, 30], 0.1, 'square', 0.07); cg.shake = Math.max(cg.shake || 0, 0.18); }
    }
    cg.shake = Math.max(0, (cg.shake || 0) - dt * 1.8);
    if (typeof shake === 'number') shake = cg.shake || 0;
    campPaintLogMeshes();
    campPaintNav();
    const left = Math.max(0, Math.ceil((day ? CampRules.CAMP_DAY : CampRules.CAMP_NIGHT) - (cg.run.t || 0)));
    t302Meter(true, k, (day ? '☀️ Day ' : '🌙 Night ') + (cg.run.day || 1) + '  ·  ' + (cg.run.survived || 0) + '/' + CampRules.CAMP_WIN_NIGHTS + ' nights  ·  Fire ' + Math.round(k * 100) + '%  ·  ' + left + 's' + (cg.run.lantern ? '  ·  🏮' : '') + '  ·  🪵 ' + ((cg.run.carry || 0) + '/' + CampRules.CAMP_CARRY));
    let near = null;
    if (t302Near(0, 0, 2.4)) near = {kind:'fire'};
    if (t302Near(cg.bench.x, cg.bench.z, 2)) near = {kind:'bench'};
    const storyHit = CampRules.campNearClue(P.x, P.z, cg.sv);
    if (storyHit) near = {kind: storyHit.final ? 'wren' : 'clue', id: storyHit.id, name: storyHit.name, emoji: storyHit.emoji};
    (cg.run.logs || []).forEach(log => {
      if ((log.left | 0) > 0 && t302Near(log.x, log.z, 1.7)) near = {kind:'log', id:log.id, chop: log.kind !== 'fallen'};
    });
    cg.near = near;
    if (cg.done && cg.run.won) t302Hud('Five sunrises! The grove is safe.', '');
    else if (near && near.kind === 'fire') t302Hud('E / Ⓧ — stash carried logs, then add a stick to scare the Gloam back.', '🔥 Stoke');
    else if (near && near.kind === 'log' && near.chop) t302Hud('Hold E / Ⓧ to chop this log. Deep-woods logs are worth more, and are more dangerous at night.', '🪓 Chop');
    else if (near && near.kind === 'log') t302Hud('E / Ⓧ — pick up this fallen log. Carry up to ' + CampRules.CAMP_CARRY + ', then stash them at camp.', '🪵 Pick up');
    else if (near && near.kind === 'bench') t302Hud('E / Ⓧ — craft a blanket or lantern, or change Less scary.', '');
    else if (CampRules.campHas(cg.sv, 'lantern')) t302Hud('Goal: survive 5 nights. L or the Lantern action shines light at the Gloam. Follow the compass back to camp.', '🏮 Lantern');
    else if (near && near.kind === 'clue') t302Hud((near.emoji || '🔍') + ' A clue! E / Ⓧ — pick it up and add it to your journal.', '🔍 Clue');
    else if (near && near.kind === 'wren') t302Hud('🧣 Maple Wren is here, and they are okay! E / Ⓧ — say hello.', '🧣 Wren');
    else t302Hud('Goal: survive 5 nights, and help find Maple Wren. Hunt logs, follow clues, keep the fire bright after dark.', '');

  }

  /* ---------- shared hooks ---------- */
  function t302Pointer(down, ev, fromBtn){
    if (mode === 'meadow') meadowPointer(down, fromBtn);
    else if (mode === 'camp'){ if (down && fromBtn) campAct(); campHold(!!down && !!fromBtn); }
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
    t302PaintCoins();
    const step = t302Dt(dt);
    if (gd) gardenUpdate(step);
    if (mw) meadowUpdate(step);
    if (rd) ridesUpdate(step);
    if (hv) hiveUpdate(step);
    if (cg) campUpdate(step);
  }
  function t302Key(e){
    if (typeof t297EatOverlayKey === 'function' && t297EatOverlayKey(e)) return true;
    if (e.repeat && mode !== 'meadow' && mode !== 'camp') return false;
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
      // QA t332u: keyup also routes here. E/F keyup only releases a hold; J/L/act run on a fresh keydown.
      if (e.type === 'keyup'){
        if (e.code === 'KeyE' || e.code === 'KeyF' || e.key === 'e' || e.key === 'f'){ campHold(false); return true; }
        return false;
      }
      if (e.code === 'KeyJ'){ if (!e.repeat) campOpenJournal(); return true; }
      if (e.code === 'KeyL'){ if (!e.repeat) campShineNow(); return true; }
      if (e.code === 'KeyE' || e.code === 'KeyF' || e.key === 'e' || e.key === 'f'){
        campHold(true);
        if (!e.repeat) campAct();
        return true;
      }
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
    if (mode === 'rides') return ridesPad(jp, s);
    if (mode === 'camp' && t302Edge('campL', jp && jp[5]) && CampRules.campHas(cg && cg.sv, 'lantern')){ campShineNow(); return true; }
    if (mode === 'camp'){
      const hold = !!(s && s.b && (s.b[2] || s.b[0]));
      campHold(hold);
      if (t302Edge('actX', jp && (jp[2] || jp[3] || jp[7]))){ if (typeof pad !== 'undefined') pad.jump = false; return t302Act(); }
      return hold;
    }
    if (t302Edge('actX', jp && (jp[2] || jp[3] || jp[7]))){ if (typeof pad !== 'undefined') pad.jump = false; return t302Act(); }
    return false;
  }
  function t302Stop(){
    if (typeof shake === 'number') shake = 0;
    campRestoreLights();
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
    t302PaintCoins();
    const tut = document.getElementById('t302Tut'); if (tut) tut.classList.remove('show');
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
        const r = RidesRules.ridesPlace(rd.sv, p.kind, p.gx, p.gz, p.rot, p.owner || (g && g.uid), {elev: p.elev|0});
        if (r.ok){ ridesPersist(r.state); ridesBuildPiece(r.piece); ridesRefreshJoints(); }
      }
    }
    if (a === 'remove' && rd && d.id){
      const r = RidesRules.ridesRemove(rd.sv, d.id, null);
      if (r.ok){ ridesPersist(r.state); if (typeof ridesClearMesh === 'function') ridesClearMesh(d.id); ridesRefreshJoints(); }
    }
    if (a === 'toss' && mw) banner('🥣 A friend tossed a snack!');
  }
  try {
    if (typeof window !== 'undefined') window.t302Debug = {
      modes: T302_MODES,
      readyGarden(){ if (!gd) return; const now = t302Now(); gd.sv.plots.forEach(p => { if (p.seed) p.plantedAt = now - 10 * 60 * 1000; }); gardenPersist(gd.sv); gd.plots.forEach(p => gardenGrowMesh(p)); },
      stockGarden(){ if (!gd) return; let s = GardenRules.gardenGrantStarter(gd.sv); const r1 = GardenRules.gardenBuy(s, 'sprout', 999); const r2 = GardenRules.gardenBuy(r1.state, 'melon', 999); const r3 = GardenRules.gardenBuy(r2.state, 'prism', 999); try { setCoins(240); } catch(e){} gardenPersist(r3.state); const plant = GardenRules.gardenPlant(r3.state, 0, 'sprout', t302Now() - GardenRules.gardenSeed('sprout').grow, 999, () => 0); const mid = plant.ok?plant.state:r3.state; const plant2 = GardenRules.gardenPlant(mid, 4, 'melon', t302Now() - GardenRules.gardenSeed('melon').grow * 0.6, 999, () => 0.5); const mid2 = plant2.ok?plant2.state:mid; const plant3 = GardenRules.gardenPlant(mid2, 8, 'prism', t302Now() - GardenRules.gardenSeed('prism').grow, 999, () => 0.5); const use = plant3.ok?plant3.state:mid2; gardenPersist(use); gd.plots.forEach(p => gardenGrowMesh(p)); t302PaintCoins(); },
      fillRides(){ if (!rd) return; [['carousel',2,2,0],['swings',5,2,0],['drop',1,5,0],['cups',5,5,0],['curve',0,0,0],['curve',0,1,1],['curve',1,1,2],['curve',1,0,3],['slope',6,6,0],['loop',3,6,0]].forEach(q => { const r = RidesRules.ridesPlace(rd.sv, q[0], q[1], q[2], q[3], 'me'); if (r.ok){ rd.sv = r.state; ridesBuildPiece(r.piece); } }); ridesPersist(rd.sv); },
      startTut(){ if (!rd) return; ridesHelp(); },
      fillHive(){ if (!hv) return; hv.sv.pollen = 20; hv.sv.honey = 3; hivePersist(hv.sv); },
      readyMeadow(){ if (!mw) return; let s = MeadowRules.meadowGrantXp(mw.sv, MeadowRules.meadowXpToReach(10)).state; s.found = ['puddle','clover','berry','moss','starlit','wisp']; s.rebirths = 2; s.badge = MeadowRules.meadowBadge(2).id; meadowPersist(s); },
      spookyCamp(){ if (!cg) return; cg.shotLock = true; cg.sv.lessScary = false; campPersist(cg.sv); campRebuildGloam(); campPaintLessBtn(); cg.run.phase = 'night'; cg.run.t = CampRules.CAMP_NIGHT * 0.35; cg.run.fire = 0.42; cg.run.gmode = 'stalk'; cg.run.gx = 1.1; cg.run.gz = 6.6; cg.run.flicker = 0.8; cg.run.heart = 0.85; cg.run.frozen = true; if (P){ P.x = 0; P.z = 8; } campWorldLights(false, false, cg.run.fire, 0.8); if (scene){ const c = new THREE.Color('#04030a'); scene.background = c; if (scene.fog){ scene.fog.color.copy(c); scene.fog.near = 6; scene.fog.far = 28; } } if (cg.gloam){ cg.gloam.visible = true; cg.gloam.position.set(1.1, 0, 6.6); if (P) cg.gloam.lookAt(P.x, 1.9, P.z); if (cg.gloam.userData.face) cg.gloam.userData.face.visible = true; } try { window.__campShot = {style: cg.gloam && cg.gloam.userData && cg.gloam.userData.style, vis: !!(cg.gloam && cg.gloam.visible), pos: cg.gloam && {x:cg.gloam.position.x,y:cg.gloam.position.y,z:cg.gloam.position.z}, kids: cg.gloam && cg.gloam.children.length, gx: cg.run.gx, gz: cg.run.gz, lock: !!cg.shotLock, less: !!cg.sv.lessScary, face: !!(cg.gloam && cg.gloam.userData && cg.gloam.userData.face && cg.gloam.userData.face.visible)}; } catch (e) { window.__campShot = String(e); } },
      lessCamp(){ if (!cg) return; cg.shotLock = true; cg.sv.lessScary = true; campPersist(cg.sv); campRebuildGloam(); campPaintLessBtn(); cg.run.phase = 'night'; cg.run.t = CampRules.CAMP_NIGHT * 0.35; cg.run.fire = 0.42; cg.run.gmode = 'stalk'; cg.run.gx = 6; cg.run.gz = 4; cg.run.flicker = 0; cg.run.heart = 0; cg.run.frozen = false; if (P){ P.x = 0; P.z = 8; } campWorldLights(false, true, cg.run.fire, 0); if (scene){ const c = new THREE.Color('#070812'); scene.background = c; if (scene.fog){ scene.fog.color.copy(c); scene.fog.near = 12; scene.fog.far = 46; } } if (cg.gloam){ cg.gloam.visible = true; cg.gloam.position.set(6, 0, 4); if (P) cg.gloam.lookAt(P.x, 1.6, P.z); if (cg.gloam.userData.face) cg.gloam.userData.face.visible = false; } },
      scareCamp(){ if (!cg) return; t302Debug.spookyCamp(); cg.scareT = 0.9; const el = document.getElementById('t302Scare'); if (el){ el.classList.add('show', 'strong', 'jump'); } },
      dayCamp(){ if (!cg) return; cg.shotLock = false; cg.run.phase = 'day'; cg.run.t = 8; cg.run.fire = 0.8; cg.run.gmode = 'hidden'; if (P){ P.x = -28; P.z = 24; } campWorldLights(true, !!(cg.sv && cg.sv.lessScary), cg.run.fire, 0); if (scene){ const c = new THREE.Color('#8fd3ff'); scene.background = c; if (scene.fog) scene.fog.color.copy(c); } },
      watchersNight(){ campPoseWatchers(false); },
      watchersLess(){ campPoseWatchers(true); },
      goreMild(){ campPoseGore('mild'); },
      goreSpooky(){ campPoseGore('spooky'); },
      camperClues(){ campPoseStory(); },
      connectRides(){ if (!rd) return; let s = rd.sv; const spots = [[5,5,0,'curve'],[6,5,0,'curve'],[6,6,0,'curve'],[5,6,0,'curve']]; spots.forEach((q,i) => { const r = RidesRules.ridesPlace(s, q[3], q[0], q[1], q[2], 'me', i ? {snap:true} : {}); if (r.ok){ s = r.state; if (!rd.meshes[r.piece.id]) ridesBuildPiece(r.piece); } }); ridesPersist(s); ridesRefreshJoints(); if (P){ const w = RidesRules.ridesWorld(5,5); P.x = w.x; P.z = w.z + 3; } }
    };
  } catch (e){}
