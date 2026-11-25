/* Tideglass Aquarium — a second Afterbell School field trip. Original exhibits, no copied IP.
   Save key rubloxAquarium (new, optional). */
(function (root) {
  const AQ_KEY = 'rubloxAquarium';
  const AQ_VER = 1;
  const AQ_REWARD = 20;
  const AQ_RIDE_T = 8.4;
  const AQ_DEST_DZ = -560;
  const AQ_VIEW_FAR = 400;
  function aqZ(z){ return z + AQ_DEST_DZ; }
  const AQ_YARD_LANDMARKS = [
    {id:'school', x:0, z:32},
    {id:'bus', x:0, z:10},
    {id:'teacher', x:-4, z:16},
    {id:'spawn', x:0, z:18}
  ];
  function aqDestClearOfSchool(x, z){
    return AQ_YARD_LANDMARKS.every(p => Math.hypot((x||0) - p.x, (z||0) - p.z) > AQ_VIEW_FAR);
  }
  const AQ_FINDS = [
    {id:'jelly', name:'Moonveil jelly', emoji:'🪼', x:16, z:aqZ(-17.4), r:2.2,
      blurb:'A Moonveil jelly pulses like a lantern under the glass. It is soft and safe.'},
    {id:'turtle', name:'Sand-harbor turtle', emoji:'🐢', x:-16, z:aqZ(-17.4), r:2.2,
      blurb:'The Sand-harbor turtle blinks at you and paddles a slow hello.'},
    {id:'lantern', name:'Lanternfish', emoji:'🐟', x:0, z:aqZ(-47.4), r:2.2,
      blurb:'A lanternfish flicks a tiny living light in the deep tank.'},
    {id:'coral', name:'Bubble-plume coral', emoji:'🪸', x:15.4, z:aqZ(-36), r:2.2,
      blurb:'Bubble-plume coral pops little glass-bright beads. No one is harmed.'},
    {id:'star', name:'Tideglass star', emoji:'⭐', x:-15.4, z:aqZ(-36), r:2.2,
      blurb:'A Tideglass star sits like a jewel on the sand. Five arms, five wishes for a safe trip.'}
  ];
  const AQ_BUS = {x:0, z:10, r:2.4};
  const AQ_HOME_BUS = {x:0, z:aqZ(-8), r:2.6};
  const AQ_GUIDE = {x:-8, z:aqZ(-30), r:2.0, name:'Marin', role:'guide'};
  const AQ_TEACHER = {x:-4, z:16, r:1.8, name:'Ms. Bramble', role:'teacher'};
  const AQ_HALL = {x:0, z:aqZ(-40)};
  const AQ_ARRIVE = {x:3.4, z:aqZ(-8)};
  const AQ_POOL = {x:8, z:aqZ(-12), r:2.2, name:'Pebblecrab pool'};
  const AQ_SHOP = {x:14, z:aqZ(-10), r:2.4, name:'Tideglass Gift Nook'};
  const AQ_GIFTS = [
    {id:'crab-plush', name:'Pebblecrab plush', emoji:'🦀', price:16, kind:'plush', x:10.8, z:aqZ(-8.2), r:1.4,
      blurb:'A tiny Pebblecrab plush. Its claws are only for hugs.'},
    {id:'jelly-plush', name:'Moonveil jelly plush', emoji:'🪼', price:18, kind:'plush', x:10.8, z:aqZ(-11.0), r:1.4,
      blurb:'A squishy Moonveil jelly plush. It wiggles if you poke it.'},
    {id:'hat-jellycap', name:'Moonveil jelly cap', emoji:'🧢', price:40, kind:'hat', slot:'hat', val:'jellycap', x:10.8, z:aqZ(-13.8), r:1.4,
      blurb:'A soft teal cap with a tiny jelly on top. It sits on your head, not on your face.'},
    {id:'star-plush', name:'Tideglass star plush', emoji:'⭐', price:16, kind:'plush', x:17.2, z:aqZ(-8.2), r:1.4,
      blurb:'A sparkly Tideglass star plush. Five arms, five cozy wishes.'},
    {id:'turtle-plush', name:'Sand-harbor turtle plush', emoji:'🐢', price:18, kind:'plush', x:17.2, z:aqZ(-11.0), r:1.4,
      blurb:'A soft Sand-harbor turtle plush with a little sand-colored shell.'},
    {id:'hat-tidecap', name:'Tideglass tide cap', emoji:'🎩', price:42, kind:'hat', slot:'hat', val:'tidecap', x:17.2, z:aqZ(-13.8), r:1.4,
      blurb:'A little sea-blue cap with a gold star. It sits up on your head, clear of your eyes.'}
  ];
  function aqGiftLabel(g){
    if (!g) return null;
    const side = g.x < 14 ? -0.95 : 0.95;
    return {x: g.x + side, y: 2.05, z: g.z};
  }
  function aqGiftsOverlap(minDist){
    minDist = minDist == null ? 2.4 : minDist;
    const labs = AQ_GIFTS.map(aqGiftLabel);
    for (let i = 0; i < labs.length; i++) for (let j = i + 1; j < labs.length; j++){
      if (Math.hypot(labs[i].x - labs[j].x, labs[i].z - labs[j].z) < minDist) return true;
    }
    return false;
  }

  const AQ_RIDE_PATH = [
    {x:0, z:10},
    {x:0, z:2},
    {x:-28, z:2},
    {x:-28, z:-80},
    {x:-16, z:-180},
    {x:-24, z:-300},
    {x:-8, z:-420},
    {x:0, z:aqZ(-8)}
  ];

  function aqFresh(){ return {ver: AQ_VER, found: [], visits: 0, won: false, coins: 0, touched: false, gifts: []}; }
  function aqLoad(raw){
    const d = aqFresh();
    const o = (raw && typeof raw === 'object') ? raw : {};
    const ids = AQ_FINDS.map(f => f.id);
    d.found = Array.isArray(o.found) ? o.found.filter((id, i, a) => ids.indexOf(id) >= 0 && a.indexOf(id) === i) : [];
    d.visits = Math.max(0, o.visits | 0);
    d.won = !!o.won;
    d.coins = Math.max(0, o.coins | 0);
    d.touched = !!o.touched;
    const gids = AQ_GIFTS.map(g => g.id);
    d.gifts = Array.isArray(o.gifts) ? o.gifts.filter((id, i, a) => gids.indexOf(id) >= 0 && a.indexOf(id) === i) : [];
    d.ver = AQ_VER;
    return d;
  }
  function aqNewVisit(state){
    const st = aqLoad(state);
    st.visits = (st.visits | 0) + 1;
    return {state: st, run: {phase:'yard', t:0, rideT:0, boarded:false}};
  }
  function aqFind(id){ return AQ_FINDS.find(f => f.id === id) || null; }
  function aqHas(state, id){ return (aqLoad(state).found || []).indexOf(id) >= 0; }
  function aqAll(state){ return AQ_FINDS.every(f => aqHas(state, f.id)); }
  function aqPick(state, id){
    state = aqLoad(state);
    if (!aqFind(id)) return {ok:false, why:'unknown', state};
    if (aqHas(state, id)) return {ok:false, why:'have', state};
    state.found = (state.found || []).concat([id]);
    return {ok:true, why:'found', state, item: aqFind(id), left: AQ_FINDS.length - state.found.length};
  }
  function aqTouch(state){
    state = aqLoad(state);
    if (state.touched) return {ok:true, why:'have', state, already:true, coins:0};
    state.touched = true;
    state.coins = (state.coins | 0) + 4;
    return {ok:true, why:'touch', state, coins:4, message:'The Pebblecrab tickles your fingers and scuttles back under a smooth stone. Everyone is gentle here!'};
  }
  function aqBoardBus(run){
    if (!run) return {ok:false, why:'no'};
    if (run.phase !== 'yard') return {ok:false, why:'phase', phase: run.phase};
    run.phase = 'ride'; run.rideT = 0; run.boarded = true;
    return {ok:true, why:'ride', phase:'ride'};
  }
  function aqPathLen(path){
    let n = 0;
    for (let i = 0; i < (path||[]).length - 1; i++) n += Math.hypot(path[i+1].x - path[i].x, path[i+1].z - path[i].z);
    return n;
  }
  function aqRidePose(run){
    const path = AQ_RIDE_PATH;
    const t = Math.max(0, Math.min(1, ((run && run.rideT) || 0) / AQ_RIDE_T));
    const total = aqPathLen(path) || 1;
    let dist = t * total, yaw = Math.PI;
    for (let i = 0; i < path.length - 1; i++){
      const a = path[i], b = path[i+1];
      const seg = Math.hypot(b.x - a.x, b.z - a.z) || 0.0001;
      const last = i === path.length - 2;
      if (dist <= seg || last){
        const u = Math.max(0, Math.min(1, dist / seg));
        const dx = b.x - a.x, dz = b.z - a.z;
        yaw = Math.atan2(dx, dz);
        return {x: a.x + dx * u, z: a.z + dz * u, yaw: yaw, t: t, done: t >= 1};
      }
      dist -= seg;
    }
    const last = path[path.length - 1];
    return {x:last.x, z:last.z, yaw:yaw, t:t, done:true};
  }
  function aqTickRide(run, dt){
    if (!run || run.phase !== 'ride') return run;
    dt = Math.max(0, Math.min(0.2, +dt || 0));
    run.rideT = (run.rideT || 0) + dt;
    if (run.rideT >= AQ_RIDE_T){ run.phase = 'hall'; run.arrived = true; }
    return run;
  }
  function aqBoardHome(run, state){
    if (!run) return {ok:false, why:'no', state: aqLoad(state)};
    if (run.phase !== 'hall') return {ok:false, why:'phase', state: aqLoad(state)};
    state = aqLoad(state);
    if (!aqAll(state)) return {ok:false, why:'finds', left: AQ_FINDS.length - (state.found||[]).length, state};
    if (state.won) return {ok:true, why:'have', coins:0, state, already:true};
    state.won = true;
    state.coins = (state.coins | 0) + AQ_REWARD;
    run.phase = 'done';
    return {ok:true, why:'home', coins: AQ_REWARD, state, message:'The Afterbell bus is heading home from Tideglass Aquarium. You visited every exhibit!'};
  }

  function aqGift(id){ return AQ_GIFTS.find(g => g.id === id) || null; }
  function aqHasGift(state, id){ return (aqLoad(state).gifts || []).indexOf(id) >= 0; }
  function aqBuyGift(state, id, coins){
    state = aqLoad(state);
    const g = aqGift(id);
    if (!g) return {ok:false, why:'unknown', state, coins: coins||0};
    if (aqHasGift(state, id)) return {ok:false, why:'have', already:true, state, item:g, coins: coins||0};
    const have = (coins == null) ? 0 : coins;
    if (have < g.price) return {ok:false, why:'coins', need: g.price - have, state, item:g, coins: have};
    state.gifts = (state.gifts || []).concat([id]);
    return {ok:true, why:'bought', state, item:g, coins: have - g.price, spent:g.price};
  }
  function aqNear(x, z, state, run){
    const phase = (run && run.phase) || 'yard';
    if (phase === 'yard'){
      if (Math.hypot((x||0) - AQ_BUS.x, (z||0) - AQ_BUS.z) <= AQ_BUS.r) return {kind:'bus', act:'🚌 Board the bus', name:'Afterbell bus'};
      if (Math.hypot((x||0) - AQ_TEACHER.x, (z||0) - AQ_TEACHER.z) <= AQ_TEACHER.r) return {kind:'talk', who:'Ms. Bramble', act:'👋 Talk', text:'Ms. Bramble: "Today we ride to Tideglass Aquarium! Look, listen, and be gentle at the touch pool."'};
      return null;
    }
    if (phase === 'ride') return {kind:'ride', act:'🚌 Riding…'};
    if (phase === 'hall' || phase === 'done'){
      if (Math.hypot((x||0) - AQ_GUIDE.x, (z||0) - AQ_GUIDE.z) <= AQ_GUIDE.r){
        const left = AQ_FINDS.length - (aqLoad(state).found||[]).length;
        const text = left
          ? ('Marin: "Welcome to Tideglass Aquarium! Visit ' + left + ' more exhibit' + (left===1?'':'s') + ', and you may gently pat a Pebblecrab in the touch pool."')
          : 'Marin: "You saw them all! The Afterbell bus is waiting by the tide gate."';
        return {kind:'talk', who:'Marin', act:'👋 Talk', text};
      }
      if (Math.hypot((x||0) - AQ_POOL.x, (z||0) - AQ_POOL.z) <= AQ_POOL.r) return {kind:'pool', act:'🦀 Gentle touch', name:AQ_POOL.name};
      for (let i = 0; i < AQ_FINDS.length; i++){
        const f = AQ_FINDS[i];
        if (Math.hypot((x||0) - f.x, (z||0) - f.z) <= (f.r || 2) && !aqHas(state, f.id)) return {kind:'find', id:f.id, name:f.name, emoji:f.emoji, act:(f.emoji||'🔍') + ' Look'};
      }
      if (Math.hypot((x||0) - AQ_SHOP.x, (z||0) - AQ_SHOP.z) <= (AQ_SHOP.r||2.4) && !AQ_GIFTS.some(g => Math.hypot((x||0)-g.x,(z||0)-g.z) <= (g.r||1.5))){
        return {kind:'talk', who:'Pearl', act:'🛍️ Browse', text:'Pearl: "Welcome to the Tideglass Gift Nook! Pick a plush or a cap — everything here is from our own little shop."'};
      }
      for (let i = 0; i < AQ_GIFTS.length; i++){
        const g = AQ_GIFTS[i];
        if (Math.hypot((x||0) - g.x, (z||0) - g.z) <= (g.r || 1.5)){
          if (aqHasGift(state, g.id)) return {kind:'talk', who:'Pearl', act:'🛍️ Look', text:'You already have the ' + g.name + '. ' + (g.blurb||'')};
          return {kind:'gift', id:g.id, name:g.name, emoji:g.emoji, price:g.price, act:(g.emoji||'🛍️') + ' Buy ' + g.name + ' · 🪙 ' + g.price};
        }
      }
      if (aqAll(state) && Math.hypot((x||0) - AQ_HOME_BUS.x, (z||0) - AQ_HOME_BUS.z) <= AQ_HOME_BUS.r){
        return {kind:'home', act:'🚌 Ride home', name:'Afterbell bus'};
      }
      return null;
    }
    return null;
  }
  function aqGoal(state, run){
    const phase = (run && run.phase) || 'yard';
    const st = aqLoad(state);
    const n = (st.found || []).length;
    if (phase === 'yard') return 'Board the Afterbell bus for a field trip to Tideglass Aquarium.';
    if (phase === 'ride') return 'The bus is rolling along the coast to Tideglass Aquarium…';
    if (phase === 'done' || (st.won && phase !== 'hall')) return 'Field trip complete! You visited every Tideglass exhibit.';
    if (n >= AQ_FINDS.length) return 'All five exhibits are in! Board the bus at the tide gate to ride home.';
    return 'Visit Tideglass exhibits (' + n + '/' + AQ_FINDS.length + ').' + (st.touched ? '' : ' The touch pool is open too.') + ' The gift nook is open too.';
  }

  const api = {
    AQ_KEY, AQ_VER, AQ_REWARD, AQ_RIDE_T, AQ_DEST_DZ, AQ_VIEW_FAR, AQ_YARD_LANDMARKS, aqZ, aqDestClearOfSchool, AQ_FINDS, AQ_BUS, AQ_HOME_BUS, AQ_GUIDE, AQ_TEACHER, AQ_HALL, AQ_ARRIVE, AQ_POOL, AQ_SHOP, AQ_GIFTS, aqGiftLabel, aqGiftsOverlap, AQ_RIDE_PATH,
    aqFresh, aqLoad, aqNewVisit, aqFind, aqHas, aqAll, aqPick, aqTouch,
    aqGift, aqHasGift, aqBuyGift,
    aqBoardBus, aqRidePose, aqTickRide, aqBoardHome, aqNear, aqGoal
  };
  root.AquariumRules = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
