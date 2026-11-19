/* Campfire Grove — kid-friendly spooky camp. Survive until sunrise. Original Gloam creature.
   Fire and lanterns scare it away. No fighting, no gore. Save key rubloxCamp. */
(function (root) {
  const CAMP_KEY = 'rubloxCamp';
  const CAMP_VER = 2;
  const CAMP_NIGHT = 90;
  const CAMP_DECAY = 0.012;
  const CAMP_STICK = 0.22;
  const CAMP_MIN = 0.15;
  const CAMP_MAX_FIRE = 1;
  const CAMP_PILES = 8;
  const CAMP_GLOAM_FAR = 16;
  const CAMP_GLOAM_IN = 2.6;
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
      nights: 0,
      lessScary: false
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
    d.lessScary = !!o.lessScary;
    d.ver = CAMP_VER;
    return d;
  }

  function campBuddyAllowed(mp){ return !mp; }
  function campNoFight(){ return true; }
  function campNoGore(){ return true; }

  function campSetLessScary(state, on){
    state = campLoad(state);
    state.lessScary = !!on;
    return state;
  }

  function campHas(state, id){
    state = campLoad(state);
    return state.crafted.indexOf(id) >= 0;
  }

  function campGloamTarget(run, lessScary){
    const fire = Math.max(0, run && run.fire || 0);
    const lantern = Math.max(0, run && run.lantern || 0);
    const lit = fire + Math.min(0.4, lantern * 0.08);
    const k = Math.max(0, Math.min(1, (lit - 0.12) / 0.7));
    const far = lessScary ? 20 : CAMP_GLOAM_FAR;
    const near = lessScary ? 7 : (lantern > 0 ? 6 : CAMP_GLOAM_IN);
    return near + (far - near) * k;
  }

  function campStartNight(state, now, mp){
    state = campLoad(state);
    state.nights++;
    const less = !!state.lessScary;
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
        mp: !!mp,
        gloam: less ? 20 : CAMP_GLOAM_FAR,
        threat: 0,
        scarePop: false,
        lantern: 0,
        lanternCd: 0,
        best: 0.78
      }
    };
  }

  function campTick(run, dt, opt){
    if (!run || run.won || run.failed) return run;
    const step = Math.max(0, Math.min(0.12, +dt || 0));
    const less = !!(opt && opt.lessScary);
    const hasBlanket = !!(opt && opt.blanket);
    run.t = Math.min(CAMP_NIGHT, (run.t || 0) + step);
    const decay = CAMP_DECAY * (hasBlanket ? 0.85 : 1) * (less ? 0.85 : 1);
    run.fire = Math.max(0, (run.fire || 0) - decay * step);
    if (run.lantern) run.lantern = Math.max(0, run.lantern - step);
    if (run.lanternCd) run.lanternCd = Math.max(0, run.lanternCd - step);
    if (run.fire > (run.best || 0)) run.best = run.fire;
    const target = campGloamTarget(run, less);
    run.gloam = run.gloam == null ? target : run.gloam;
    const spd = (target > run.gloam) ? (less ? 5 : 7) : (less ? 2.0 : 3.4);
    const d = target - run.gloam;
    run.gloam += Math.sign(d) * Math.min(Math.abs(d), spd * step);
    const danger = less ? 6.2 : 3.2;
    if (run.gloam <= danger && run.fire < (less ? 0.16 : 0.2)){
      run.threat = (run.threat || 0) + step;
      if (!run.scarePop && run.threat > (less ? 1.2 : 0.35)) run.scarePop = true;
      if (run.threat > (less ? 4 : 1.6)) run.failed = true;
    } else {
      run.threat = Math.max(0, (run.threat || 0) - step * 0.6);
    }
    if (run.t >= CAMP_NIGHT){
      if (run.fire >= CAMP_MIN && !run.failed) run.won = true;
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
    run.threat = Math.max(0, (run.threat || 0) * 0.3);
    return {ok:true, why:'ok', state, run, fire: run.fire};
  }

  function campShine(state, run){
    state = campLoad(state);
    if (!run || run.won || run.failed) return {ok:false, why:'over', state, run};
    if (!campHas(state, 'lantern')) return {ok:false, why:'lantern', state, run};
    if ((run.lanternCd || 0) > 0) return {ok:false, why:'wait', state, run, left: run.lanternCd};
    run.lantern = 5;
    run.lanternCd = 8;
    run.scarePop = false;
    run.threat = 0;
    return {ok:true, why:'ok', state, run};
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

  function campReward(run){
    if (!run || !run.won) return 0;
    return 20 + Math.round((run.best || 0) * 10);
  }

  const api = {
    CAMP_KEY, CAMP_VER, CAMP_NIGHT, CAMP_DECAY, CAMP_STICK, CAMP_MIN, CAMP_MAX_FIRE, CAMP_PILES, CAMP_CRAFT,
    CAMP_GLOAM_FAR, CAMP_GLOAM_IN,
    campFresh, campLoad, campItem, campBuddyAllowed, campNoFight, campNoGore,
    campSetLessScary, campHas, campGloamTarget,
    campStartNight, campTick, campGather, campAddStick, campShine, campCraft, campFinish, campReward
  };
  root.CampRules = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
