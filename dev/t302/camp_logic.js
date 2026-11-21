/* Campfire Grove — kid-friendly spooky camp. Hunt logs by day, survive 5 nights. Original Gloam.
   Default is really scary; Less scary uses the 2026.11.19-4 Gloam (behavior, visuals, sounds).
   Fire and lanterns scare it away. Caught = everyone is okay, respawn at camp, lose sticks. No fighting, no gore. Save key rubloxCamp. */
(function (root) {
  const CAMP_KEY = 'rubloxCamp';
  const CAMP_VER = 3;
  const CAMP_DAY = 50;
  const CAMP_NIGHT = 60;
  const CAMP_WIN_NIGHTS = 5;
  const CAMP_DECAY = 0.012;
  const CAMP_DAY_DECAY = 0.003;
  const CAMP_STICK = 0.22;
  const CAMP_MIN = 0.15;
  const CAMP_MAX_FIRE = 1;
  const CAMP_CARRY = 3;
  const CAMP_CHOP = 1.1;
  const CAMP_LOG_REGEN = 40;
  const CAMP_SIZE = 140;
  const CAMP_CRAFT = [
    {id:'blanket', name:'Cozy Blanket', emoji:'🧺', sticks:3},
    {id:'lantern', name:'Glow Lantern', emoji:'🏮', sticks:4}
  ];
  const CAMP_LANDMARKS = [
    {id:'camp', name:'Camp', emoji:'🔥', x:0, z:0},
    {id:'cabin', name:'Old Cabin', emoji:'🏚️', x:48, z:-32},
    {id:'lake', name:'Moon Lake', emoji:'🌊', x:-40, z:36},
    {id:'clearing', name:'Pine Clearing', emoji:'🌲', x:28, z:40},
    {id:'deep', name:'Deep Woods', emoji:'🌑', x:52, z:48},
    {id:'brook', name:'Brook Bend', emoji:'🪙', x:-46, z:-24}
  ];
  const CAMP_TRAILS = [
    {x:0, z:0}, {x:12, z:-8}, {x:24, z:-16}, {x:36, z:-24}, {x:48, z:-32},
    {x:0, z:0}, {x:-10, z:10}, {x:-22, z:20}, {x:-32, z:28}, {x:-40, z:36},
    {x:0, z:0}, {x:10, z:12}, {x:20, z:24}, {x:28, z:40}, {x:40, z:44}, {x:52, z:48},
    {x:0, z:0}, {x:-12, z:-8}, {x:-28, z:-16}, {x:-46, z:-24}
  ];
  const CAMP_LOG_SPOTS = [
    {id:0, x:18, z:-14, kind:'fallen', value:1, zone:'woods'},
    {id:1, x:-16, z:14, kind:'fallen', value:1, zone:'woods'},
    {id:2, x:14, z:20, kind:'stump', value:1, zone:'woods'},
    {id:3, x:-22, z:-12, kind:'stump', value:1, zone:'woods'},
    {id:4, x:32, z:-8, kind:'fallen', value:1, zone:'woods'},
    {id:5, x:-8, z:28, kind:'fallen', value:1, zone:'trail'},
    {id:6, x:26, z:36, kind:'fallen', value:1, zone:'clearing'},
    {id:7, x:22, z:44, kind:'stump', value:1, zone:'clearing'},
    {id:8, x:44, z:-24, kind:'fallen', value:1, zone:'cabin'},
    {id:9, x:54, z:-36, kind:'stump', value:1, zone:'cabin'},
    {id:10, x:-36, z:24, kind:'fallen', value:1, zone:'woods'},
    {id:11, x:-48, z:30, kind:'stump', value:1, zone:'woods'},
    {id:12, x:48, z:42, kind:'fallen', value:2, zone:'deep'},
    {id:13, x:56, z:52, kind:'stump', value:2, zone:'deep'},
    {id:14, x:60, z:44, kind:'heart', value:3, zone:'deep'},
    {id:15, x:50, z:58, kind:'heart', value:3, zone:'deep'},
    {id:16, x:-50, z:-20, kind:'fallen', value:1, zone:'woods'},
    {id:17, x:-38, z:-30, kind:'stump', value:1, zone:'woods'}
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
  function campLandmark(id){ return CAMP_LANDMARKS.find(l => l.id === id) || null; }

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
  function campEveryoneOkay(){ return true; }

  function campSetLessScary(state, on){
    state = campLoad(state);
    state.lessScary = !!on;
    return state;
  }
  function campHas(state, id){
    state = campLoad(state);
    return state.crafted.indexOf(id) >= 0;
  }

  function campInDeep(x, z){ return Math.hypot((x || 0) - 52, (z || 0) - 48) < 22; }
  function campInWater(x, z){ return Math.hypot((x || 0) + 40, (z || 0) - 36) < 9; }
  function campZone(x, z){
    x = +x || 0; z = +z || 0;
    if (Math.hypot(x, z) < 10) return 'camp';
    if (Math.hypot(x - 48, z + 32) < 10) return 'cabin';
    if (campInWater(x, z)) return 'water';
    if (Math.hypot(x + 40, z - 36) < 16) return 'lake';
    if (campInDeep(x, z)) return 'deep';
    if (Math.hypot(x - 28, z - 40) < 10) return 'clearing';
    if (Math.hypot(x + 46, z + 24) < 10) return 'brook';
    return 'woods';
  }
  function campCompass(px, pz){
    const dx = 0 - (px || 0), dz = 0 - (pz || 0);
    return {ang: Math.atan2(dx, dz), dist: Math.hypot(dx, dz), x:0, z:0};
  }

  function campMakeLogs(){
    return CAMP_LOG_SPOTS.map(s => Object.assign({}, s, {left: 1, regenAt: 0, chop: 0}));
  }
  function campLog(run, id){ return ((run && run.logs) || []).find(l => l.id === (id | 0)) || null; }

  function campLightAt(run, x, z, opt){
    if (!run || run.phase === 'day') return 1;
    const fire = Math.max(0, run.fire || 0);
    const fireR = 3.8 + fire * 9;
    const dFire = Math.hypot(x || 0, z || 0);
    let lit = Math.max(0, 1 - dFire / fireR) * (0.25 + fire);
    if (Math.hypot((x || 0) - 48, (z || 0) + 32) < 5) lit = Math.max(lit, 0.28);
    if ((run.lantern || 0) > 0){
      const px = (opt && opt.px != null) ? opt.px : x;
      const pz = (opt && opt.pz != null) ? opt.pz : z;
      const dL = Math.hypot((x || 0) - px, (z || 0) - pz);
      lit = Math.max(lit, Math.max(0, 1 - dL / 5.5) * 0.9);
    }
    return Math.min(1, lit);
  }

  function campGloamStyle(lessScary){ return lessScary ? 'classic' : 'scary'; }
  function campNightNum(run){
    if (!run) return 1;
    if (run.phase === 'night') return (run.survived | 0) + 1;
    return Math.max(1, run.day | 0);
  }
  function campNightHard(run){ return campNightNum(run) >= 4; }
  function campRng(opt){ return (opt && typeof opt.rand === 'function') ? opt.rand : Math.random; }
  function campFacingGloam(run, px, pz, face){
    const d = Math.hypot((run.gx || 0) - (px || 0), (run.gz || 0) - (pz || 0));
    if (d < 0.2) return false;
    const lx = Math.sin(face || 0), lz = Math.cos(face || 0);
    const tx = ((run.gx || 0) - (px || 0)) / d, tz = ((run.gz || 0) - (pz || 0)) / d;
    return (lx * tx + lz * tz) > 0.55;
  }

  function campGloamTarget(run, lessScary){
    const fire = Math.max(0, run && run.fire || 0);
    const lantern = Math.max(0, run && run.lantern || 0);
    const lit = fire + Math.min(0.4, lantern * 0.08);
    const k = Math.max(0, Math.min(1, (lit - 0.12) / 0.7));
    if (lessScary){
      const far = 18;
      const near = lantern > 0 ? 7 : 2.8;
      return near + (far - near) * k;
    }
    const hard = campNightHard(run);
    const far = hard ? 13 : 15;
    const near = lantern > 0 ? 6 : (hard ? 2.1 : 2.3);
    return near + (far - near) * k;
  }

  function campFreshRun(state, now, mp, phase){
    const less = !!state.lessScary;
    return {
      startedAt: +now || 0,
      clock: 0,
      day: 1,
      phase: phase || 'day',
      t: 0,
      survived: 0,
      fire: 0.7,
      logs: campMakeLogs(),
      carry: 0,
      won: false,
      failed: false,
      buddy: campBuddyAllowed(mp),
      mp: !!mp,
      gx: less ? 28 : 22,
      gz: less ? -24 : -18,
      gmode: (phase === 'night') ? 'stalk' : 'hidden',
      gcool: 0,
      threat: 0,
      scarePop: false,
      appearBehind: false,
      chase: false,
      lantern: 0,
      lanternCd: 0,
      best: 0.7,
      respawn: false,
      caught: 0,
      chopping: null,
      watchers: [],
      watchEvents: [],
      watchCd: 1.5,
      watchSeq: 0
    };
  }

  function campStartRun(state, now, mp){
    state = campLoad(state);
    state.nights++;
    return {ok:true, state, run: campFreshRun(state, now, mp, 'day')};
  }
  function campStartNight(state, now, mp){
    const started = campStartRun(state, now, mp);
    started.run.phase = 'night';
    started.run.gmode = 'stalk';
    started.run.t = 0;
    return started;
  }

  function campCanCarry(run, value){
    return ((run && run.carry) || 0) + (value || 1) <= CAMP_CARRY;
  }

  function campGrantLog(state, run, log){
    const n = Math.max(1, log.value | 0);
    if (!campCanCarry(run, n)) return {ok:false, why:'full', state, run};
    log.left = 0;
    log.chop = 0;
    log.regenAt = (run.clock || 0) + CAMP_LOG_REGEN * (log.zone === 'deep' ? 1.3 : 1);
    run.carry = (run.carry || 0) + n;
    state.gathered += n;
    return {ok:true, why:'ok', state, run, gained:n};
  }

  function campPickLog(state, run, logId){
    state = campLoad(state);
    if (!run || run.won) return {ok:false, why:'over', state, run};
    const log = campLog(run, logId);
    if (!log) return {ok:false, why:'log', state, run};
    if ((log.left | 0) <= 0) return {ok:false, why:'empty', state, run};
    if (log.kind === 'stump' || log.kind === 'heart') return {ok:false, why:'chop', state, run};
    return campGrantLog(state, run, log);
  }
  function campGather(state, run, pileId){ return campPickLog(state, run, pileId); }

  function campChopLog(state, run, logId, dt){
    state = campLoad(state);
    if (!run || run.won) return {ok:false, why:'over', state, run};
    const log = campLog(run, logId);
    if (!log) return {ok:false, why:'log', state, run};
    if ((log.left | 0) <= 0) return {ok:false, why:'empty', state, run};
    if (log.kind === 'fallen') return campPickLog(state, run, logId);
    if (!campCanCarry(run, log.value || 1)) return {ok:false, why:'full', state, run};
    log.chop = (log.chop || 0) + Math.max(0, +dt || 0);
    run.chopping = log.id;
    if (log.chop < CAMP_CHOP) return {ok:true, why:'chopping', state, run, left: CAMP_CHOP - log.chop};
    run.chopping = null;
    return campGrantLog(state, run, log);
  }

  function campStash(state, run){
    state = campLoad(state);
    if (!run) return {ok:false, why:'run', state, run};
    if ((run.carry | 0) <= 0) return {ok:false, why:'empty', state, run};
    const n = run.carry | 0;
    state.sticks += n;
    run.carry = 0;
    return {ok:true, why:'ok', state, run, stashed:n};
  }

  function campAddStick(state, run, fromNet){
    state = campLoad(state);
    if (!run || run.won) return {ok:false, why:'over', state, run};
    if (!fromNet){
      if ((state.sticks | 0) <= 0){
        if ((run.carry | 0) > 0){
          state.sticks += run.carry;
          run.carry = 0;
        }
        if ((state.sticks | 0) <= 0) return {ok:false, why:'sticks', state, run};
      }
      state.sticks -= 1;
      state.added += 1;
    }
    run.fire = Math.min(CAMP_MAX_FIRE, (run.fire || 0) + CAMP_STICK);
    if (run.fire > (run.best || 0)) run.best = run.fire;
    run.threat = Math.max(0, (run.threat || 0) * 0.3);
    if (run.gmode === 'chase' || run.gmode === 'stalk' || run.gmode === 'behind' || run.gmode === 'dart' || run.gmode === 'freeze') run.gmode = 'retreat';
    return {ok:true, why:'ok', state, run, fire: run.fire};
  }

  function campShine(state, run){
    state = campLoad(state);
    if (!run || run.won) return {ok:false, why:'over', state, run};
    if (!campHas(state, 'lantern')) return {ok:false, why:'lantern', state, run};
    if ((run.lanternCd || 0) > 0) return {ok:false, why:'wait', state, run, left: run.lanternCd};
    run.lantern = 5;
    run.lanternCd = 8;
    run.scarePop = false;
    run.appearBehind = false;
    run.threat = 0;
    run.gmode = 'retreat';
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

  function campCaught(state, run){
    state = campLoad(state);
    if (!run || run.won) return {ok:false, why:'over', state, run};
    const lostCarry = run.carry | 0;
    const lostStash = Math.min(2, state.sticks | 0);
    run.carry = 0;
    state.sticks -= lostStash;
    run.caught = (run.caught || 0) + 1;
    run.respawn = true;
    run.failed = false;
    run.scarePop = true;
    run.appearBehind = false;
    run.chase = false;
    run.threat = 0;
    run.gmode = 'retreat';
    run.catchScare = true;
    run.gx = 24; run.gz = -22;
    return {ok:true, why:'ok', state, run, lostCarry, lostStash, everyoneOkay:true};
  }

  function campRegenLogs(run){
    (run.logs || []).forEach(log => {
      if ((log.left | 0) > 0) return;
      if ((run.clock || 0) >= (log.regenAt || 0) && log.regenAt > 0){
        log.left = 1;
        log.chop = 0;
        log.regenAt = 0;
      }
    });
  }

  function campClearScaryFx(run){
    run.frozen = false;
    run.lookedAt = false;
    run.teleported = false;
    run.fakeOut = false;
    run.whisper = false;
    run.nearStep = false;
    run.flicker = 0;
    run.heart = 0;
    return run;
  }

  function campStepGloamClassic(run, dt, opt){
    const rnd = campRng(opt);
    const px = (opt && opt.px) || 0, pz = (opt && opt.pz) || 0;
    const face = (opt && opt.face) || 0;
    campClearScaryFx(run);
    if (run.phase !== 'night' || run.won){
      run.gmode = 'hidden';
      run.chase = false;
      run.appearBehind = false;
      return run;
    }
    run.gcool = Math.max(0, (run.gcool || 0) - dt);
    const lit = campLightAt(run, px, pz, {px, pz});
    const dPlayer = Math.hypot((run.gx || 0) - px, (run.gz || 0) - pz);
    const dFire = Math.hypot(px, pz);
    const catchR = 1.7;
    const chaseNeed = 13;
    if (lit < 0.2 && dPlayer < catchR){
      run.wantCatch = true;
      return run;
    }
    run.wantCatch = false;
    if (lit < 0.18 && dFire > chaseNeed){
      run.gmode = 'chase';
      run.chase = true;
    } else if (lit > 0.55){
      run.gmode = 'retreat';
      run.chase = false;
    } else if (run.gmode === 'hidden' || run.gmode === 'retreat'){
      run.gmode = 'stalk';
      run.chase = false;
    }

    if (run.gcool <= 0 && lit < 0.22 && dFire > 8 && rnd() < (dt * 0.25)){
      run.gmode = 'behind';
      run.appearBehind = true;
      run.scarePop = true;
      run.gcool = 7;
      run.gx = px - Math.sin(face) * 3.2;
      run.gz = pz - Math.cos(face) * 3.2;
      return run;
    }

    let tx = run.gx, tz = run.gz, spd = 3.6;
    if (run.gmode === 'chase'){
      tx = px; tz = pz;
      spd = 6.2;
    } else if (run.gmode === 'retreat'){
      const ang = Math.atan2(run.gx || 1, run.gz || 1);
      tx = Math.sin(ang) * 30; tz = Math.cos(ang) * 30;
      spd = 7;
    } else if (run.gmode === 'dart'){
      spd = 11;
    } else if (run.gmode === 'stalk'){
      const ang = Math.atan2(px - (run.gx || 0), pz - (run.gz || 0)) + 0.9;
      tx = px + Math.sin(ang) * 8;
      tz = pz + Math.cos(ang) * 8;
      spd = 2.8;
    } else {
      const ang = (run.clock || 0) * 0.15;
      tx = Math.sin(ang) * 22 + 8; tz = Math.cos(ang) * 22 - 4;
      spd = 2.2;
    }
    if (run.gcool <= 0 && run.gmode === 'stalk' && rnd() < dt * 0.4){
      run.gmode = 'dart';
      run.gcool = 1.2;
      const a = rnd() * Math.PI * 2;
      tx = px + Math.sin(a) * 10; tz = pz + Math.cos(a) * 10;
      spd = 12;
    }
    const dx = tx - (run.gx || 0), dz = tz - (run.gz || 0);
    const dist = Math.hypot(dx, dz) || 1;
    const step = Math.min(dist, spd * dt);
    run.gx = (run.gx || 0) + dx / dist * step;
    run.gz = (run.gz || 0) + dz / dist * step;
    const far = campGloamTarget(run, true);
    run.gloam = Math.hypot(run.gx || 0, run.gz || 0);
    if (run.gmode === 'behind' && run.gcool < 5.5) run.appearBehind = false;
    if (lit < 0.2 && dPlayer < 5) run.threat = (run.threat || 0) + dt;
    else run.threat = Math.max(0, (run.threat || 0) - dt * 0.5);
    if (!run.scarePop && run.threat > 0.45 && dPlayer < 6) run.scarePop = true;
    if (run.gloam > far + 8 && run.gmode === 'retreat') run.gmode = 'lurk';
    return run;
  }

  function campStepGloamScary(run, dt, opt){
    const rnd = campRng(opt);
    const px = (opt && opt.px) || 0, pz = (opt && opt.pz) || 0;
    const face = (opt && opt.face) || 0;
    const hard = campNightHard(run);
    run.teleported = false;
    run.fakeOut = false;
    run.whisper = false;
    run.nearStep = false;
    if (run.phase !== 'night' || run.won){
      campClearScaryFx(run);
      run.gmode = 'hidden';
      run.chase = false;
      run.appearBehind = false;
      return run;
    }
    run.gcool = Math.max(0, (run.gcool || 0) - dt);
    const lit = campLightAt(run, px, pz, {px, pz});
    const dPlayer = Math.hypot((run.gx || 0) - px, (run.gz || 0) - pz);
    const dFire = Math.hypot(px, pz);
    const catchR = hard ? 2.15 : 1.85;
    const chaseNeed = hard ? 9 : 11;
    if (lit < 0.2 && dPlayer < catchR){
      run.wantCatch = true;
      run.catchScare = true;
      return run;
    }
    run.wantCatch = false;
    if (lit > 0.55){
      run.gmode = 'retreat';
      run.chase = false;
      run.frozen = false;
    } else if (lit < 0.18 && dFire > chaseNeed){
      run.gmode = 'chase';
      run.chase = true;
    } else if (run.gmode === 'hidden' || run.gmode === 'retreat'){
      run.gmode = 'stalk';
      run.chase = false;
    }

    const looking = campFacingGloam(run, px, pz, face) && dPlayer < 22 && lit < 0.6 && run.gmode !== 'retreat';
    run.lookedAt = looking;
    run.flicker = Math.max(0, Math.min(1, 1 - dPlayer / 14));
    run.heart = Math.max(0, Math.min(1, 1 - dPlayer / 16));
    if (looking){
      run.frozen = true;
      if (dPlayer < 8) run.threat = (run.threat || 0) + dt;
      if (!run.scarePop && run.threat > 0.28 && dPlayer < 6) run.scarePop = true;
      return run;
    }
    if (run.frozen){
      run.frozen = false;
      if (dPlayer < 10 && lit < 0.25) run.gcool = 0;
    }

    if (run.gcool <= 0 && lit < 0.22 && dFire > 8 && rnd() < (dt * (hard ? 0.4 : 0.28))){
      run.gmode = 'behind';
      run.appearBehind = true;
      run.scarePop = true;
      run.gcool = hard ? 5 : 8;
      run.gx = px - Math.sin(face) * 2.8;
      run.gz = pz - Math.cos(face) * 2.8;
      run.nearStep = true;
      run.flicker = 0.8;
      run.heart = 0.85;
      return run;
    }

    if (run.gcool <= 0 && lit < 0.25 && dFire > 7 && rnd() < (dt * (hard ? 0.55 : 0.28))){
      let placed = false;
      for (let i = 0; i < 6 && !placed; i++){
        const a = rnd() * Math.PI * 2;
        const r = 5.5 + rnd() * 5.5;
        const nx = px + Math.sin(a) * r;
        const nz = pz + Math.cos(a) * r;
        if (campLightAt(run, nx, nz, {px, pz}) < 0.3 && Math.hypot(nx, nz) > 6){
          run.gx = nx; run.gz = nz; placed = true;
        }
      }
      if (placed){
        run.teleported = true;
        run.gmode = 'stalk';
        run.gcool = hard ? 3.5 : 6;
        if (Math.hypot((run.gx || 0) - px, (run.gz || 0) - pz) < 8) run.scarePop = true;
        run.flicker = 0.7;
        run.heart = 0.6;
        return run;
      }
    }

    if (dPlayer > 10 && rnd() < dt * 0.12){
      run.fakeOut = true;
      run.whisper = rnd() < 0.5;
      run.nearStep = !run.whisper;
    }

    let tx = run.gx, tz = run.gz, spd = hard ? 4.2 : 3.4;
    if (run.gmode === 'chase'){
      tx = px; tz = pz;
      spd = hard ? 9.0 : 7.4;
    } else if (run.gmode === 'retreat'){
      const ang = Math.atan2(run.gx || 1, run.gz || 1);
      tx = Math.sin(ang) * 30; tz = Math.cos(ang) * 30;
      spd = hard ? 9 : 8;
    } else if (run.gmode === 'dart'){
      spd = hard ? 14 : 12;
    } else if (run.gmode === 'stalk'){
      const ang = Math.atan2(px - (run.gx || 0), pz - (run.gz || 0)) + 0.9;
      tx = px + Math.sin(ang) * 7;
      tz = pz + Math.cos(ang) * 7;
      spd = hard ? 4.6 : 3.6;
    } else if (run.gmode === 'behind'){
      tx = px - Math.sin(face) * 2.6;
      tz = pz - Math.cos(face) * 2.6;
      spd = 5;
    } else {
      const ang = (run.clock || 0) * 0.15;
      tx = Math.sin(ang) * 22 + 8; tz = Math.cos(ang) * 22 - 4;
      spd = hard ? 3.0 : 2.4;
    }
    if (run.gcool <= 0 && run.gmode === 'stalk' && rnd() < dt * (hard ? 0.55 : 0.4)){
      run.gmode = 'dart';
      run.gcool = 0.9;
      const a = rnd() * Math.PI * 2;
      tx = px + Math.sin(a) * 8; tz = pz + Math.cos(a) * 8;
      spd = hard ? 14 : 12;
    }
    const dx = tx - (run.gx || 0), dz = tz - (run.gz || 0);
    const dist = Math.hypot(dx, dz) || 1;
    const step = Math.min(dist, spd * dt);
    run.gx = (run.gx || 0) + dx / dist * step;
    run.gz = (run.gz || 0) + dz / dist * step;
    const far = campGloamTarget(run, false);
    run.gloam = Math.hypot(run.gx || 0, run.gz || 0);
    if (run.gmode === 'behind' && run.gcool < 5.5) run.appearBehind = false;
    if (lit < 0.2 && dPlayer < 6) run.threat = (run.threat || 0) + dt;
    else run.threat = Math.max(0, (run.threat || 0) - dt * 0.5);
    if (!run.scarePop && run.threat > (hard ? 0.22 : 0.28) && dPlayer < 6) run.scarePop = true;
    if (run.gloam > far + 8 && run.gmode === 'retreat') run.gmode = 'lurk';
    if (dPlayer < 7) run.nearStep = true;
    return run;
  }

  function campStepGloam(run, dt, opt){
    if (opt && opt.lessScary) return campStepGloamClassic(run, dt, opt);
    return campStepGloamScary(run, dt, opt);
  }

  const CAMP_WATCH_KINDS_SCARY = ['thin', 'pale', 'lake', 'cabin'];
  const CAMP_WATCH_KINDS_SOFT = ['owl', 'glow'];
  function campWatchRules(lessScary){
    if (lessScary){
      return {
        lessScary: true, max: 2, spawnMin: 50, spawnMax: 85, despawn: 26,
        lookTime: 3.2, kinds: CAMP_WATCH_KINDS_SOFT.slice(), behind: false,
        glowEyes: false, collide: false, respawn: 8
      };
    }
    return {
      lessScary: false, max: 4, spawnMin: 35, spawnMax: 70, despawn: 20,
      lookTime: 2.2, kinds: CAMP_WATCH_KINDS_SCARY.slice(), behind: true,
      glowEyes: true, collide: false, respawn: 4
    };
  }
  function campWatchCollides(){ return false; }
  function campWatchPlayers(opt){
    if (opt && Array.isArray(opt.players) && opt.players.length){
      return opt.players.map(p => ({x: +p.x || 0, z: +p.z || 0}));
    }
    return [{x: (opt && opt.px != null) ? +opt.px : 0, z: (opt && opt.pz != null) ? +opt.pz : 0}];
  }
  function campWatchDist(w, px, pz){
    return Math.hypot((w && w.x || 0) - (px || 0), (w && w.z || 0) - (pz || 0));
  }
  function campWatchMinDist(w, players){
    let best = Infinity;
    (players || []).forEach(p => {
      const d = campWatchDist(w, p.x, p.z);
      if (d < best) best = d;
    });
    return best;
  }
  function campWatchFacing(w, px, pz, face){
    const d = campWatchDist(w, px, pz);
    if (d < 0.4) return false;
    const lx = Math.sin(face || 0), lz = Math.cos(face || 0);
    const tx = ((w.x || 0) - (px || 0)) / d, tz = ((w.z || 0) - (pz || 0)) / d;
    return (lx * tx + lz * tz) > 0.72;
  }
  function campWatchInBounds(x, z){
    return Math.abs(x) < 72 && Math.abs(z) < 72 && !campInWater(x, z) && Math.hypot(x, z) > 12;
  }
  function campWatchSpotOk(x, z, players, rules, kind){
    if (kind !== 'cabin' && !campWatchInBounds(x, z)) return false;
    if (kind === 'cabin' && (Math.abs(x) > 80 || Math.abs(z) > 80)) return false;
    const minD = campWatchMinDist({x, z}, players);
    if (minD < rules.spawnMin || minD > rules.spawnMax) return false;
    return true;
  }
  function campWatchCabinSpot(){ return {x: 51.15, z: -30.6}; }
  function campWatchLakeSpot(players){
    const lx = -40, lz = 36;
    const p = (players && players[0]) || {x:0, z:0};
    const dx = p.x - lx, dz = p.z - lz;
    const d = Math.hypot(dx, dz) || 1;
    return {x: lx - dx / d * 11.6, z: lz - dz / d * 11.6};
  }
  function campPickWatchSpot(run, opt, rules, kind, behind){
    const players = campWatchPlayers(opt);
    const rnd = campRng(opt);
    const tries = [];
    if (kind === 'cabin') tries.push(campWatchCabinSpot());
    if (kind === 'lake') tries.push(campWatchLakeSpot(players));
    if (behind && players[0]){
      const face = (opt && opt.face) || 0;
      const p = players[0];
      const r = rules.spawnMin + 6 + rnd() * 8;
      tries.push({x: p.x - Math.sin(face) * r, z: p.z - Math.cos(face) * r, behind: true});
    }
    if (kind === 'pale' || kind === 'thin' || kind === 'owl' || kind === 'glow'){
      const deep = campLandmark('deep') || {x:52, z:48};
      tries.push({x: deep.x - 10, z: deep.z - 8});
    }
    for (let i = 0; i < 16; i++){
      const ang = rnd() * Math.PI * 2;
      const r = rules.spawnMin + rnd() * (rules.spawnMax - rules.spawnMin);
      const p = players[0] || {x:0, z:0};
      tries.push({x: p.x + Math.sin(ang) * r, z: p.z + Math.cos(ang) * r});
    }
    for (let i = 0; i < tries.length; i++){
      const s = tries[i];
      if (run.phase === 'day' && !campInDeep(s.x, s.z)) continue;
      if (campWatchSpotOk(s.x, s.z, players, rules, kind)) return s;
    }
    return null;
  }
  function campPlaceWatch(run, spec, opt){
    if (!run) return null;
    const rules = campWatchRules(opt && opt.lessScary);
    const players = campWatchPlayers(opt);
    run.watchers = run.watchers || [];
    if (run.watchers.length >= rules.max && !(spec && spec.force)) return null;
    const kind = (spec && spec.kind) || rules.kinds[Math.floor(campRng(opt)() * rules.kinds.length)] || rules.kinds[0];
    if (rules.kinds.indexOf(kind) < 0 && !(spec && spec.force)) return null;
    let x, z, behind = false;
    if (spec && spec.x != null && spec.z != null){
      x = +spec.x; z = +spec.z;
      if (!spec.force && !campWatchSpotOk(x, z, players, rules, kind)) return null;
    } else {
      const spot = campPickWatchSpot(run, opt, rules, kind, !!(spec && spec.behind));
      if (!spot) return null;
      x = spot.x; z = spot.z; behind = !!spot.behind;
    }
    const p = players[0] || {x:0, z:0};
    const w = {
      id: (run.watchSeq = (run.watchSeq | 0) + 1),
      kind, x, z,
      yaw: Math.atan2(p.x - x, p.z - z),
      look: 0,
      collide: false,
      glow: !!rules.glowEyes && (kind === 'pale' || kind === 'thin' || kind === 'cabin'),
      soft: kind === 'owl' || kind === 'glow',
      behind: !!behind
    };
    run.watchers.push(w);
    return w;
  }
  function campTickWatchers(run, dt, opt){
    if (!run) return run;
    const step = Math.max(0, Math.min(0.12, +dt || 0));
    const rules = campWatchRules(opt && opt.lessScary);
    const players = campWatchPlayers(opt);
    const rnd = campRng(opt);
    const face = (opt && opt.face) || 0;
    run.watchers = Array.isArray(run.watchers) ? run.watchers : [];
    run.watchEvents = [];
    if (run.watchCd == null) run.watchCd = 1.2;
    run.watchCd = Math.max(0, (run.watchCd || 0) - step);

    // Detect a big turn so a distant watcher can appear behind you (scary mode only).
    let turned = false;
    if (run._watchFace != null){
      let d = face - run._watchFace;
      while (d > Math.PI) d -= Math.PI * 2;
      while (d < -Math.PI) d += Math.PI * 2;
      turned = Math.abs(d) > 2.0;
    }
    run._watchFace = face;

    const kept = [];
    run.watchers.forEach(w => {
      // Never walk. At most slowly turn to face the nearest player.
      let near = players[0] || {x:0, z:0}, nearD = campWatchMinDist(w, players);
      players.forEach(p => {
        const d = campWatchDist(w, p.x, p.z);
        if (d <= nearD){ near = p; nearD = d; }
      });
      const want = Math.atan2(near.x - w.x, near.z - w.z);
      let dy = want - (w.yaw || 0);
      while (dy > Math.PI) dy -= Math.PI * 2;
      while (dy < -Math.PI) dy += Math.PI * 2;
      w.yaw = (w.yaw || 0) + dy * Math.min(1, step * 1.6);
      w.collide = false;

      const looking = campWatchFacing(w, near.x, near.z, face);
      w.look = looking ? (w.look || 0) + step : Math.max(0, (w.look || 0) - step * 0.8);
      let reason = null;
      if (nearD < rules.despawn) reason = 'close';
      else if (w.look >= rules.lookTime) reason = 'look';
      if (reason){
        run.watchEvents.push({type:'vanish', id:w.id, kind:w.kind, x:w.x, z:w.z, reason, whisper: true});
        run.watchCd = Math.max(run.watchCd || 0, rules.respawn * (0.6 + rnd() * 0.6));
      } else kept.push(w);
    });
    run.watchers = kept;

    // Drop extras if the less-scary cap is lower than the current list.
    if (run.watchers.length > rules.max){
      run.watchers.splice(rules.max).forEach(w => {
        run.watchEvents.push({type:'vanish', id:w.id, kind:w.kind, x:w.x, z:w.z, reason:'cap', whisper: false});
      });
    }

    const day = run.phase === 'day';
    const mayDay = day && (players.some(p => campInDeep(p.x, p.z)) || rnd() < 0.35);
    const force = !!(opt && opt.forceSpawn);
    const wantSpawn = run.watchers.length < rules.max && (force || (run.watchCd <= 0 && (!day || mayDay)));
    const rate = day ? 0.18 : (rules.lessScary ? 0.35 : 0.55);
    if (wantSpawn && (force || rnd() < step * rate || (turned && rules.behind))){
      const kinds = rules.kinds;
      let kind = kinds[Math.floor(rnd() * kinds.length)] || kinds[0];
      if (!day && !rules.lessScary && rnd() < 0.22) kind = (rnd() < 0.5 ? 'lake' : 'cabin');
      if (day) kind = rules.lessScary ? 'glow' : (kinds.indexOf('pale') >= 0 ? 'pale' : kinds[0]);
      const placed = campPlaceWatch(run, {kind, behind: turned && rules.behind}, opt);
      if (placed){
        run.watchEvents.push({type:'spawn', id:placed.id, kind:placed.kind, x:placed.x, z:placed.z, behind: !!placed.behind});
        run.watchCd = rules.respawn * (0.5 + rnd() * 0.8);
      } else {
        run.watchCd = 1.2;
      }
    }
    return run;
  }

  function campTick(run, dt, opt){
    if (!run || run.won) return run;
    const step = Math.max(0, Math.min(0.12, +dt || 0));
    const less = !!(opt && opt.lessScary);
    const hasBlanket = !!(opt && opt.blanket);
    run.clock = (run.clock || 0) + step;
    run.t = (run.t || 0) + step;
    if (run.lantern) run.lantern = Math.max(0, run.lantern - step);
    if (run.lanternCd) run.lanternCd = Math.max(0, run.lanternCd - step);
    run.respawn = false;
    run.wantCatch = false;
    campRegenLogs(run);
    const hard = !less && campNightHard(run);
    const decay = (run.phase === 'day' ? CAMP_DAY_DECAY : CAMP_DECAY) * (hasBlanket ? 0.85 : 1) * (hard ? 1.12 : 1);
    run.fire = Math.max(0, (run.fire || 0) - decay * step);
    if (run.fire > (run.best || 0)) run.best = run.fire;

    if (run.phase === 'day'){
      run.gmode = 'hidden';
      run.chase = false;
      if (run.t >= CAMP_DAY){
        run.phase = 'night';
        run.t = 0;
        run.gmode = 'stalk';
        run.gx = less ? 22 : 18;
        run.gz = less ? -18 : -14;
      }
    } else {
      campStepGloam(run, step, opt);
      if (run.t >= CAMP_NIGHT){
        const kept = (run.fire || 0) >= CAMP_MIN;
        if (kept) run.survived = (run.survived || 0) + 1;
        if ((run.survived || 0) >= CAMP_WIN_NIGHTS){
          run.won = true;
          run.failed = false;
        } else {
          run.phase = 'day';
          run.t = 0;
          run.day = (run.day || 1) + 1;
          run.gmode = 'hidden';
          run.nightKept = kept;
        }
      }
    }
    campTickWatchers(run, step, opt);
    return run;
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
    if (!run) return 0;
    const n = run.survived | 0;
    if (!run.won && n <= 0) return 0;
    return (run.won ? 40 : 0) + n * 12 + Math.round((run.best || 0) * 10);
  }

  const api = {
    CAMP_KEY, CAMP_VER, CAMP_DAY, CAMP_NIGHT, CAMP_WIN_NIGHTS, CAMP_DECAY, CAMP_DAY_DECAY,
    CAMP_STICK, CAMP_MIN, CAMP_MAX_FIRE, CAMP_CARRY, CAMP_CHOP, CAMP_LOG_REGEN, CAMP_SIZE,
    CAMP_CRAFT, CAMP_LANDMARKS, CAMP_TRAILS, CAMP_LOG_SPOTS, CAMP_GLOAM_FAR: 18, CAMP_GLOAM_IN: 2.8,
    campFresh, campLoad, campItem, campLandmark, campBuddyAllowed, campNoFight, campNoGore, campEveryoneOkay,
    campSetLessScary, campGloamStyle, campNightNum, campNightHard, campFacingGloam,
    campHas, campInDeep, campInWater, campZone, campCompass, campMakeLogs, campLog,
    campLightAt, campGloamTarget, campStartRun, campStartNight,
    campCanCarry, campPickLog, campGather, campChopLog, campStash, campAddStick, campShine, campCraft,
    campCaught, campTick, campFinish, campReward,
    CAMP_WATCH_KINDS_SCARY, CAMP_WATCH_KINDS_SOFT, campWatchRules, campWatchCollides,
    campWatchPlayers, campWatchDist, campWatchMinDist, campWatchFacing, campWatchSpotOk,
    campWatchCabinSpot, campWatchLakeSpot, campPickWatchSpot, campPlaceWatch, campTickWatchers
  };
  root.CampRules = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
