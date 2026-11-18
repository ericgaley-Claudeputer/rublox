/* Campfire Grove — cozy night camp, no monsters, real-player co-op, solo buddy. Save key rubloxCamp. */
(function (root) {
  const CAMP_KEY = 'rubloxCamp';
  const CAMP_VER = 1;
  const CAMP_NIGHT = 90;
  const CAMP_DECAY = 0.012;
  const CAMP_STICK = 0.22;
  const CAMP_MIN = 0.15;
  const CAMP_MAX_FIRE = 1;
  const CAMP_PILES = 8;
  const CAMP_CRAFT = [
    {id:'blanket', name:'Cozy Blanket', emoji:'🧺', sticks:3},
    {id:'lantern', name:'Glow Lantern', emoji:'🏮', sticks:4}
  ];

  function campFresh(){
    return {
      ver: CAMP_VER,
      sticks: 0,
      gathered: 0,
      added: 0,
      crafted: [],
      sunrises: 0,
      bestFire: 0,
      nights: 0
    };
  }

  function campItem(id){ return CAMP_CRAFT.find(c => c.id === id) || null; }

  function campLoad(raw){
    const d = campFresh();
    const o = (raw && typeof raw === 'object') ? raw : {};
    d.sticks = Math.max(0, o.sticks | 0);
    d.gathered = Math.max(0, o.gathered | 0);
    d.added = Math.max(0, o.added | 0);
    if (Array.isArray(o.crafted)) d.crafted = o.crafted.filter(id => campItem(id));
    d.sunrises = Math.max(0, o.sunrises | 0);
    d.bestFire = Math.max(0, Math.min(1, +o.bestFire || 0));
    d.nights = Math.max(0, o.nights | 0);
    return d;
  }

  function campBuddyAllowed(mp){ return !mp; }

  function campNoMonsters(){ return true; }

  function campStartNight(state, now, mp){
    state = campLoad(state);
    state.nights++;
    return {
      ok: true,
      state,
      run: {
        startedAt: +now || 0,
        t: 0,
        fire: 0.78,
        piles: Array.from({length: CAMP_PILES}, (_, i) => ({id:i, left: 2})),
        won: false,
        failed: false,
        buddy: campBuddyAllowed(mp),
        mp: !!mp
      }
    };
  }

  function campTick(run, dt){
    if (!run || run.won || run.failed) return run;
    const step = Math.max(0, +dt || 0);
    run.t = Math.min(CAMP_NIGHT, (run.t || 0) + step);
    run.fire = Math.max(0, (run.fire || 0) - CAMP_DECAY * step);
    if (run.fire > (run.best || 0)) run.best = run.fire;
    if (run.t >= CAMP_NIGHT){
      if (run.fire >= CAMP_MIN) run.won = true;
      else run.failed = true;
    }
    return run;
  }

  function campGather(state, run, pileId){
    state = campLoad(state);
    if (!run || run.won || run.failed) return {ok:false, why:'over', state, run};
    const pile = (run.piles || []).find(p => p.id === (pileId | 0));
    if (!pile) return {ok:false, why:'pile', state, run};
    if ((pile.left | 0) <= 0) return {ok:false, why:'empty', state, run};
    pile.left -= 1;
    state.sticks += 1;
    state.gathered += 1;
    return {ok:true, why:'ok', state, run};
  }

  function campAddStick(state, run, fromNet){
    state = campLoad(state);
    if (!run || run.won || run.failed) return {ok:false, why:'over', state, run};
    if (!fromNet){
      if ((state.sticks | 0) <= 0) return {ok:false, why:'sticks', state, run};
      state.sticks -= 1;
      state.added += 1;
    }
    run.fire = Math.min(CAMP_MAX_FIRE, (run.fire || 0) + CAMP_STICK);
    if (run.fire > (run.best || 0)) run.best = run.fire;
    return {ok:true, why:'ok', state, run, fire: run.fire};
  }

  function campCraft(state, itemId){
    state = campLoad(state);
    const item = campItem(itemId);
    if (!item) return {ok:false, why:'item', state};
    if (state.crafted.indexOf(item.id) >= 0) return {ok:false, why:'have', state, item};
    if (state.sticks < item.sticks) return {ok:false, why:'sticks', state, item, need: item.sticks - state.sticks};
    state.sticks -= item.sticks;
    state.crafted.push(item.id);
    return {ok:true, why:'ok', state, item};
  }

  function campFinish(state, run){
    state = campLoad(state);
    if (!run) return {ok:false, why:'run', state};
    const best = Math.max(state.bestFire, run.best || run.fire || 0);
    state.bestFire = Math.round(best * 100) / 100;
    if (run.won){
      state.sunrises += 1;
      return {ok:true, why:'sunrise', state, run};
    }
    return {ok:true, why:'ember', state, run};
  }

  const api = {
    CAMP_KEY, CAMP_VER, CAMP_NIGHT, CAMP_DECAY, CAMP_STICK, CAMP_MIN, CAMP_MAX_FIRE, CAMP_PILES, CAMP_CRAFT,
    campFresh, campLoad, campItem, campBuddyAllowed, campNoMonsters,
    campStartNight, campTick, campGather, campAddStick, campCraft, campFinish
  };
  root.CampRules = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
