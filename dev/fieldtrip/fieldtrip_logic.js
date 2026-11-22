/* Pebblebrook Field Trip — Afterbell School rides a bus to Pebblebrook Nature Nook.
   Kid-friendly scavenger hunt. Passengers and the nature guide are NPC townsfolk.
   Save key rubloxFieldTrip (new, optional). */
(function (root) {
  const FT_KEY = 'rubloxFieldTrip';
  const FT_VER = 1;
  const FT_REWARD = 18;
  const FT_RIDE_T = 8.4;
  const FT_FINDS = [
    {id:'pebble', name:'River pebble', emoji:'🪨', x:16, z:-18, r:2.0,
      blurb:'A smooth river pebble from Brookbell Creek. It still feels cool.'},
    {id:'catkin', name:'Willow catkin', emoji:'🌿', x:-18, z:-12, r:2.0,
      blurb:'A soft willow catkin from the Nook path, fluffy as a cloud.'},
    {id:'lantern', name:'Moss lantern', emoji:'🏮', x:0, z:-36, r:2.0,
      blurb:'A little moss lantern from the nature hall. It glows a gentle green.'},
    {id:'feather', name:'Trail feather', emoji:'🪶', x:22, z:-32, r:2.0,
      blurb:'A painted-jay feather left on the lookout trail.'},
    {id:'acorn', name:'Acorn compass', emoji:'🧭', x:-14, z:-30, r:2.0,
      blurb:'An acorn compass from the exhibit case. The nut always points to the brook.'}
  ];
  const FT_BUS = {x:0, z:10, r:2.4};
  const FT_GUIDE = {x:-8, z:-30, r:2.0, name:'Fern', role:'guide'};
  const FT_TEACHER = {x:-4, z:16, r:1.8, name:'Ms. Bramble', role:'teacher'};
  const FT_NOOK = {x:0, z:-36};
  const FT_ARRIVE = {x:3.4, z:-8};
  const FT_HOME_BUS = {x:0, z:-8, r:2.6};
  const FT_RIDE_PATH = [
    {x:0, z:10},
    {x:0, z:2},
    {x:24, z:2},
    {x:24, z:-18},
    {x:0, z:-18},
    {x:0, z:-8}
  ];
  function ftPathLen(path){
    let n = 0;
    for (let i = 0; i < (path||[]).length - 1; i++) n += Math.hypot(path[i+1].x - path[i].x, path[i+1].z - path[i].z);
    return n;
  }
  function ftRidePose(run){
    const path = FT_RIDE_PATH;
    const t = Math.max(0, Math.min(1, ((run && run.rideT) || 0) / FT_RIDE_T));
    const total = ftPathLen(path) || 1;
    let dist = t * total;
    let yaw = Math.PI;
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

  function ftFresh(){
    return {ver: FT_VER, found: [], visits: 0, won: false, coins: 0};
  }
  function ftLoad(raw){
    const d = ftFresh();
    const o = (raw && typeof raw === 'object') ? raw : {};
    const ids = FT_FINDS.map(f => f.id);
    d.found = Array.isArray(o.found) ? o.found.filter((id, i, a) => ids.indexOf(id) >= 0 && a.indexOf(id) === i) : [];
    d.visits = Math.max(0, o.visits | 0);
    d.won = !!o.won;
    d.coins = Math.max(0, o.coins | 0);
    d.ver = FT_VER;
    return d;
  }
  function ftNewVisit(state){
    const st = ftLoad(state);
    st.visits = (st.visits | 0) + 1;
    return {
      state: st,
      run: {phase:'yard', t:0, rideT:0, near:null, boarded:false}
    };
  }
  function ftFind(id){ return FT_FINDS.find(f => f.id === id) || null; }
  function ftHas(state, id){ return (ftLoad(state).found || []).indexOf(id) >= 0; }
  function ftAll(state){ return FT_FINDS.every(f => ftHas(state, f.id)); }
  function ftPick(state, id){
    state = ftLoad(state);
    if (!ftFind(id)) return {ok:false, why:'unknown', state};
    if (ftHas(state, id)) return {ok:false, why:'have', state};
    state.found = (state.found || []).concat([id]);
    return {ok:true, why:'found', state, item: ftFind(id), left: FT_FINDS.length - state.found.length};
  }
  function ftBoardBus(run){
    if (!run) return {ok:false, why:'no'};
    if (run.phase !== 'yard') return {ok:false, why:'phase', phase: run.phase};
    run.phase = 'ride';
    run.rideT = 0;
    run.boarded = true;
    return {ok:true, why:'ride', phase:'ride'};
  }
  function ftTickRide(run, dt){
    if (!run || run.phase !== 'ride') return run;
    dt = Math.max(0, Math.min(0.2, +dt || 0));
    run.rideT = (run.rideT || 0) + dt;
    if (run.rideT >= FT_RIDE_T){
      run.phase = 'nook';
      run.arrived = true;
    }
    return run;
  }
  function ftBoardHome(run, state){
    if (!run) return {ok:false, why:'no', state: ftLoad(state)};
    if (run.phase !== 'nook') return {ok:false, why:'phase', state: ftLoad(state)};
    state = ftLoad(state);
    if (!ftAll(state)) return {ok:false, why:'finds', left: FT_FINDS.length - (state.found||[]).length, state};
    if (state.won) return {ok:true, why:'have', coins:0, state, already:true};
    state.won = true;
    state.coins = (state.coins | 0) + FT_REWARD;
    run.phase = 'done';
    return {ok:true, why:'home', coins: FT_REWARD, state, message:'The Afterbell bus is heading home from Pebblebrook Nature Nook. You found every trail treasure!'};
  }
  function ftNear(x, z, state, run){
    const phase = (run && run.phase) || 'yard';
    if (phase === 'yard'){
      if (Math.hypot((x||0) - FT_BUS.x, (z||0) - FT_BUS.z) <= FT_BUS.r) return {kind:'bus', act:'🚌 Board the bus', name:'Afterbell bus'};
      if (Math.hypot((x||0) - FT_TEACHER.x, (z||0) - FT_TEACHER.z) <= FT_TEACHER.r) return {kind:'talk', who:'Ms. Bramble', act:'👋 Talk', text:'Ms. Bramble: "Climb aboard! Today we visit Pebblebrook Nature Nook. Stay with the group, and pick up five trail treasures."'};
      return null;
    }
    if (phase === 'ride') return {kind:'ride', act:'🚌 Riding…'};
    if (phase === 'nook' || phase === 'done'){
      if (Math.hypot((x||0) - FT_GUIDE.x, (z||0) - FT_GUIDE.z) <= FT_GUIDE.r){
        const left = FT_FINDS.length - (ftLoad(state).found||[]).length;
        const text = left
          ? ('Fern: "Welcome to Pebblebrook Nature Nook! Hunt for ' + left + ' more trail treasure' + (left===1?'':'s') + ', then I will wave the bus back."')
          : 'Fern: "You found them all! The Afterbell bus is waiting by the gate."';
        return {kind:'talk', who:'Fern', act:'👋 Talk', text};
      }
      for (let i = 0; i < FT_FINDS.length; i++){
        const f = FT_FINDS[i];
        if (Math.hypot((x||0) - f.x, (z||0) - f.z) <= (f.r || 2) && !ftHas(state, f.id)) return {kind:'find', id:f.id, name:f.name, emoji:f.emoji, act:(f.emoji||'🔍') + ' Pick up'};
      }
      if (ftAll(state) && Math.hypot((x||0) - FT_HOME_BUS.x, (z||0) - FT_HOME_BUS.z) <= FT_HOME_BUS.r){
        return {kind:'home', act:'🚌 Ride home', name:'Afterbell bus'};
      }
      return null;
    }
    return null;
  }
  function ftGoal(state, run){
    const phase = (run && run.phase) || 'yard';
    const n = (ftLoad(state).found || []).length;
    if (phase === 'yard') return 'Board the Afterbell bus for a field trip to Pebblebrook Nature Nook.';
    if (phase === 'ride') return 'The bus is rolling to Pebblebrook Nature Nook…';
    if (phase === 'done' || (ftLoad(state).won && phase !== 'nook')) return 'Field trip complete! You found every trail treasure.';
    if (n >= FT_FINDS.length) return 'All five treasures are in! Board the bus at the gate to ride home.';
    return 'Find trail treasures at Pebblebrook Nature Nook (' + n + '/' + FT_FINDS.length + ').';
  }

  const api = {
    FT_KEY, FT_VER, FT_REWARD, FT_RIDE_T, FT_FINDS, FT_BUS, FT_HOME_BUS, FT_GUIDE, FT_TEACHER, FT_NOOK, FT_ARRIVE, FT_RIDE_PATH,
    ftFresh, ftLoad, ftNewVisit, ftFind, ftHas, ftAll, ftPick,
    ftBoardBus, ftTickRide, ftRidePose, ftPathLen, ftBoardHome, ftNear, ftGoal
  };
  root.FieldTripRules = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
