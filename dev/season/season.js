  /* ---------- Seasonal events (t296u) — date-driven Snow Festival, snowflakes, shop ---------- */
  let evState = null;
  const EV_API = (typeof EVRules !== 'undefined' && EVRules) ? EVRules : (typeof window !== 'undefined' ? window.EVRules : null);

  function evOpts(){
    let hash = '';
    try { hash = String((location && location.hash) || ''); } catch (e){}
    return {hash, state: evEnsure(), now: Date.now()};
  }

  function evPersist(s){
    evState = s;
    try { if (typeof save === 'function') save(EV_API.EV_KEY, s); } catch (e){}
    return s;
  }

  function evEnsure(){
    if (!EV_API) return null;
    if (evState) return evState;
    try { evState = EV_API.evLoad(typeof load === 'function' ? load(EV_API.EV_KEY, null) : null); }
    catch (e){ evState = EV_API.evFresh(); }
    return evState;
  }

  function evOn(id){
    if (!EV_API) return false;
    try { return !!EV_API.evIsOn(id || 'snow', Date.now(), evOpts()); } catch (e){ return false; }
  }

  function evNowSeason(){
    if (!EV_API) return null;
    try { return EV_API.evActive(Date.now(), evOpts()); } catch (e){ return null; }
  }

  function evHashOn(){
    try { return !!(EV_API && EV_API.evHashForce(String((location && location.hash) || ''))); } catch (e){ return false; }
  }

  function evSetForce(on){
    const s = evEnsure(); if (!s) return;
    s.force = on ? 'snow' : '';
    evPersist(s);
    evApplyChrome();
  }

  function evFlakes(){ const s = evEnsure(); return s ? (s.flakes | 0) : 0; }

  function evGive(n, why){
    if (!EV_API) return 0;
    const r = EV_API.evAward(evEnsure(), n, why);
    evPersist(r.state);
    evPaintHud();
    try { if (r.add && why && typeof toast === 'function') toast(why + ' +' + r.add + ' ❄️'); } catch (e){}
    try { if (typeof achSweep === 'function') achSweep({silent: true, pay: true, source: 'season'}); } catch (e){}
    try {
      if (typeof achNote === 'function'){
        if ((r.state.earned | 0) >= 25) achNote('ev-snow-flakes');
      }
    } catch (e){}
    return r.add;
  }

  function evTryDaily(){
    if (!EV_API || !evOn()) return;
    const r = EV_API.evDaily(evEnsure(), Date.now());
    if (r && r.add){ evPersist(r.state); evPaintHud(); try { toast('❄️ Festival hello! +' + r.add + ' snowflakes'); } catch (e){} }
  }

  function evBuyItem(id){
    if (!EV_API) return;
    const r = EV_API.evBuy(evEnsure(), id);
    if (!r.ok){
      try { banner(r.why === 'flakes' ? '❄️ You need more snowflakes for that.' : r.why === 'owned' ? 'You already have that!' : 'That item is not in the shop.'); } catch (e){}
      return;
    }
    evPersist(r.state);
    evPaintShop(); evPaintHud();
    try { if (typeof SND !== 'undefined' && SND.coin) SND.coin(); } catch (e){}
    try { toast('🎁 ' + r.item.n + ' is yours!'); } catch (e){}
    try { if (typeof achNote === 'function') achNote('ev-snow-shop'); } catch (e){}
  }

  function evToggleWear(id){
    if (!EV_API) return;
    const r = EV_API.evWear(evEnsure(), id);
    evPersist(r.state);
    evPaintShop();
  }

  function evMark(key, value, higher){
    if (!EV_API) return;
    const r = EV_API.evNoteBest(evEnsure(), key, value, higher);
    evPersist(r.state);
    try { if (typeof lbFromSeason === 'function') lbFromSeason(); } catch (e){}
    try {
      if (typeof achNote === 'function'){
        if (key === 'snowman') achNote('ev-snow-snowman');
        const d = evEnsure().done || {};
        if (d.toss && d.sled && d.snowman && d.skate) achNote('ev-snow-all');
      }
    } catch (e){}
    return r;
  }

  function evPaintHud(){
    const on = evOn();
    const chip = document.getElementById('evChip');
    const n = document.getElementById('evChipNum');
    if (chip) chip.style.display = on ? '' : 'none';
    if (n) n.textContent = String(evFlakes());
    const ban = document.getElementById('evBanner');
    if (ban) ban.style.display = on ? '' : 'none';
    const next = document.getElementById('evNextNote');
    if (next && EV_API){
      const cur = evNowSeason();
      if (cur){ next.style.display = 'none'; }
      else {
        const nx = EV_API.evNext(Date.now());
        next.style.display = '';
        next.textContent = nx ? (nx.emoji + ' Coming later: ' + nx.name + (nx.placeholder ? ' — a placeholder for the next season.' : '')) : '';
      }
    }
  }

  function evPaintShop(){
    const box = document.getElementById('evShopList');
    if (!box || !EV_API) return;
    const s = evEnsure();
    const list = EV_API.evShopFor('snow');
    box.innerHTML = list.map(it => {
      const owned = !!(s.inv && s.inv[it.id]);
      const wear = s.wear === it.id;
      const btn = owned
        ? '<button type="button" class="big ' + (wear ? 'green' : '') + ' evwear" data-id="' + it.id + '">' + (wear ? '✅ Wearing' : 'Wear') + '</button>'
        : '<button type="button" class="big green evbuy" data-id="' + it.id + '"' + (s.flakes < it.cost ? ' disabled' : '') + '>Buy · ' + it.cost + ' ❄️</button>';
      return '<div class="evitem"><span class="evem">' + it.e + '</span><div><b>' + it.n + '</b><small>' + it.desc + '</small></div>' + btn + '</div>';
    }).join('');
    const bal = document.getElementById('evShopBal');
    if (bal) bal.textContent = '❄️ ' + evFlakes() + ' snowflakes';
    box.querySelectorAll('.evbuy').forEach(b => { b.onclick = ev => { ev.preventDefault(); evBuyItem(b.getAttribute('data-id')); }; });
    box.querySelectorAll('.evwear').forEach(b => { b.onclick = ev => { ev.preventDefault(); evToggleWear(b.getAttribute('data-id')); }; });
  }

  function evOpenShop(on){
    evPaintShop(); evPaintHud();
    const p = document.getElementById('evShop');
    if (p) p.classList.toggle('show', on !== false);
  }

  function evCloseShop(){ const p = document.getElementById('evShop'); if (p) p.classList.remove('show'); }

  function evApplyChrome(){
    const on = evOn();
    try { document.documentElement.classList.toggle('snowfest-on', on); document.body.classList.toggle('snowfest-on', on); } catch (e){}
    evPaintHud();
    evEnsureSnowDom();
    const tg = document.getElementById('evForceSnow');
    if (tg){
      const s = evEnsure();
      tg.checked = !!(s && s.force === 'snow') || evHashOn();
      tg.disabled = evHashOn();
    }
    try {
      if (typeof renderGames === 'function') renderGames();
      else if (typeof drawGames === 'function') drawGames();
    } catch (e){}
  }

  function evEnsureSnowDom(){
    let layer = document.getElementById('evSnowLayer');
    if (!layer){
      layer = document.createElement('div');
      layer.id = 'evSnowLayer';
      layer.setAttribute('aria-hidden', 'true');
      for (let i = 0; i < 28; i++){
        const f = document.createElement('i');
        f.style.left = (Math.random() * 100) + '%';
        f.style.animationDelay = (Math.random() * 6) + 's';
        f.style.animationDuration = (7 + Math.random() * 7) + 's';
        f.style.opacity = String(0.45 + Math.random() * 0.5);
        f.style.fontSize = (10 + Math.random() * 14) + 'px';
        f.textContent = '❄';
        layer.appendChild(f);
      }
      document.body.appendChild(layer);
    }
  }

  function evDecorParty(api){
    if (!evOn() || !api || typeof scene === 'undefined') return;
    try {
      const tree = new THREE.Mesh(new THREE.ConeGeometry(1.1, 2.6, 8), new THREE.MeshLambertMaterial({color: '#1f7a4c'}));
      tree.position.set(-8, 2.0, 8); scene.add(tree);
      const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.5, 0.5, 8), new THREE.MeshLambertMaterial({color: '#8d5524'}));
      pot.position.set(-8, 0.35, 8); scene.add(pot);
      [[-6, 9], [6, 9], [-10, -6], [10, -6]].forEach(([x, z]) => {
        if (typeof plat === 'function') plat(x, 0.7, z, 1.8, 1.8, '#f4fbff', 0.7);
      });
    } catch (e){}
  }

  function evWxForce(modeId){
    if (!evOn()) return null;
    if (modeId === 'party' || modeId === 'snowfest') return 'snow';
    try {
      if (typeof WX_RULES !== 'undefined' && WX_RULES.wxWeatherAllowed && WX_RULES.wxWeatherAllowed('snow', modeId)) return 'snow';
    } catch (e){}
    return null;
  }

  function evBind(){
    if (window.__evBound) return;
    window.__evBound = true;
    evEnsure(); evEnsureSnowDom(); evApplyChrome(); evTryDaily();
    const force = document.getElementById('evForceSnow');
    if (force) force.addEventListener('change', () => evSetForce(!!force.checked));
    const open = document.getElementById('evShopBtn');
    if (open) open.addEventListener('click', ev => { ev.preventDefault(); evOpenShop(true); });
    const close = document.getElementById('evShopClose');
    if (close) close.addEventListener('click', ev => { ev.preventDefault(); evCloseShop(); });
    const pan = document.getElementById('evShop');
    if (pan) pan.addEventListener('click', ev => { if (ev.target === pan) evCloseShop(); });
    const play = document.getElementById('evPlayBtn');
    if (play) play.addEventListener('click', ev => { ev.preventDefault(); try { if (typeof Obby !== 'undefined' && Obby.play) Obby.play('snowfest'); } catch (e){} });
    window.addEventListener('hashchange', () => evApplyChrome());
  }
