/* Honeymeadow Farm — a third Afterbell School field trip. Original farm, no copied IP.
   Save key rubloxFarm (new, optional). */
(function (root) {
  const FM_KEY = 'rubloxFarm';
  const FM_VER = 1;
  const FM_REWARD = 22;
  const FM_RIDE_T = 8.4;
  const FM_HAY_T = 6.2;
  const FM_DEST_DZ = -560;
  const FM_VIEW_FAR = 400;
  function fmZ(z){ return z + FM_DEST_DZ; }
  const FM_YARD_LANDMARKS = [
    {id:'school', x:0, z:32},
    {id:'bus', x:0, z:10},
    {id:'teacher', x:-4, z:16},
    {id:'spawn', x:0, z:18}
  ];
  function fmDestClearOfSchool(x, z){
    return FM_YARD_LANDMARKS.every(p => Math.hypot((x||0) - p.x, (z||0) - p.z) > FM_VIEW_FAR);
  }
  const FM_FEEDS = [
    {id:'hens', name:'Speckle hens', emoji:'🐔', x:12, z:fmZ(-18), r:2.2, blurb:'The Speckle hens fluff up and peck the grain. Thank you!'},
    {id:'sheep', name:'Cloudwool sheep', emoji:'🐑', x:-12, z:fmZ(-18), r:2.2, blurb:'The Cloudwool sheep nudge the clover and go baa in a tiny voice.'},
    {id:'cows', name:'Butterspot cows', emoji:'🐄', x:16, z:fmZ(-32), r:2.4, blurb:'The Butterspot cows blink slowly and chew. They look very pleased.'}
  ];
  const FM_EGGS = [
    {id:'egg-1', name:'Warm egg', emoji:'🥚', x:10.2, z:fmZ(-16.2), r:1.4},
    {id:'egg-2', name:'Speckled egg', emoji:'🥚', x:13.6, z:fmZ(-16.4), r:1.4},
    {id:'egg-3', name:'Henhouse egg', emoji:'🥚', x:11.8, z:fmZ(-20.2), r:1.4}
  ];
  const FM_APPLES = [
    {id:'apple-1', name:'Honeycrisp apple', emoji:'🍎', x:-16, z:fmZ(-28), r:1.8},
    {id:'apple-2', name:'Sunfall apple', emoji:'🍎', x:-20, z:fmZ(-22), r:1.8},
    {id:'apple-3', name:'Barnside apple', emoji:'🍎', x:-14, z:fmZ(-34), r:1.8}
  ];
  const FM_PUMPS = [
    {id:'pump-1', name:'Sugar pumpkin', emoji:'🎃', x:8.5, z:fmZ(-42), r:1.6},
    {id:'pump-2', name:'Harvest pumpkin', emoji:'🎃', x:11.4, z:fmZ(-44), r:1.6},
    {id:'pump-3', name:'Gate pumpkin', emoji:'🎃', x:13.2, z:fmZ(-41.2), r:1.6}
  ];
  const FM_BUS = {x:0, z:10, r:2.4};
  const FM_HOME_BUS = {x:0, z:fmZ(-8), r:2.6};
  const FM_GUIDE = {x:-8, z:fmZ(-30), r:2.0, name:'Farmer Nettie', role:'guide'};
  const FM_TEACHER = {x:-4, z:16, r:1.8, name:'Ms. Bramble', role:'teacher'};
  const FM_BARN = {x:0, z:fmZ(-36)};
  const FM_ARRIVE = {x:3.4, z:fmZ(-8)};
  const FM_WAGON = {x:0, z:fmZ(-16), r:2.2, name:'Hay wagon'};
  const FM_RIDE_PATH = [
    {x:0, z:10},
    {x:0, z:2},
    {x:20, z:2},
    {x:36, z:-40},
    {x:28, z:-160},
    {x:20, z:-300},
    {x:10, z:-420},
    {x:0, z:fmZ(-8)}
  ];
  const FM_HAY_PATH = [
    {x:0, z:fmZ(-16)},
    {x:10, z:fmZ(-20)},
    {x:14, z:fmZ(-30)},
    {x:6, z:fmZ(-40)},
    {x:-8, z:fmZ(-36)},
    {x:-12, z:fmZ(-24)},
    {x:-4, z:fmZ(-16)},
    {x:0, z:fmZ(-16)}
  ];
  function fmPathLen(path){
    let n = 0;
    for (let i = 0; i < (path||[]).length - 1; i++) n += Math.hypot(path[i+1].x - path[i].x, path[i+1].z - path[i].z);
    return n;
  }
  function fmPoseOn(path, t, dur){
    const u = Math.max(0, Math.min(1, (t || 0) / (dur || 1)));
    const total = fmPathLen(path) || 1;
    let dist = u * total;
    let yaw = Math.PI;
    for (let i = 0; i < path.length - 1; i++){
      const a = path[i], b = path[i+1];
      const seg = Math.hypot(b.x - a.x, b.z - a.z) || 0.0001;
      const last = i === path.length - 2;
      if (dist <= seg || last){
        const s = Math.max(0, Math.min(1, dist / seg));
        const dx = b.x - a.x, dz = b.z - a.z;
        yaw = Math.atan2(dx, dz);
        return {x: a.x + dx * s, z: a.z + dz * s, yaw: yaw, t: u, done: u >= 1};
      }
      dist -= seg;
    }
    const last = path[path.length - 1];
    return {x:last.x, z:last.z, yaw:yaw, t:u, done:true};
  }
  function fmRidePose(run){ return fmPoseOn(FM_RIDE_PATH, (run && run.rideT) || 0, FM_RIDE_T); }
  function fmHayPose(run){ return fmPoseOn(FM_HAY_PATH, (run && run.hayT) || 0, FM_HAY_T); }

  function fmFresh(){ return {ver: FM_VER, fed: [], eggs: [], apples: [], pumps: [], hay: false, visits: 0, won: false, coins: 0}; }
  function fmFilter(list, allowed){
    const ids = allowed.map(a => a.id);
    return Array.isArray(list) ? list.filter((id, i, a) => ids.indexOf(id) >= 0 && a.indexOf(id) === i) : [];
  }
  function fmLoad(raw){
    const d = fmFresh();
    const o = (raw && typeof raw === 'object') ? raw : {};
    d.fed = fmFilter(o.fed, FM_FEEDS);
    d.eggs = fmFilter(o.eggs, FM_EGGS);
    d.apples = fmFilter(o.apples, FM_APPLES);
    d.pumps = fmFilter(o.pumps, FM_PUMPS);
    d.hay = !!o.hay;
    d.visits = Math.max(0, o.visits | 0);
    d.won = !!o.won;
    d.coins = Math.max(0, o.coins | 0);
    d.ver = FM_VER;
    return d;
  }
  function fmNewVisit(state){
    const st = fmLoad(state);
    st.visits = (st.visits | 0) + 1;
    return {state: st, run: {phase:'yard', t:0, rideT:0, hayT:0, haying:false, near:null, boarded:false}};
  }
  function fmHas(arr, id){ return (arr || []).indexOf(id) >= 0; }
  function fmAdd(arr, id){ return fmHas(arr, id) ? arr : (arr || []).concat([id]); }
  function fmAllDone(state){
    const st = fmLoad(state);
    return st.fed.length >= FM_FEEDS.length && st.eggs.length >= FM_EGGS.length && st.apples.length >= FM_APPLES.length && st.pumps.length >= FM_PUMPS.length && st.hay;
  }
  function fmFeed(state, id){
    state = fmLoad(state);
    const item = FM_FEEDS.find(f => f.id === id);
    if (!item) return {ok:false, why:'unknown', state};
    if (fmHas(state.fed, id)) return {ok:false, why:'have', already:true, state, item};
    state.fed = fmAdd(state.fed, id);
    return {ok:true, state, item, left: FM_FEEDS.length - state.fed.length};
  }
  function fmPickEgg(state, id){
    state = fmLoad(state);
    const item = FM_EGGS.find(f => f.id === id);
    if (!item) return {ok:false, why:'unknown', state};
    if (fmHas(state.eggs, id)) return {ok:false, why:'have', already:true, state, item};
    state.eggs = fmAdd(state.eggs, id);
    return {ok:true, state, item, left: FM_EGGS.length - state.eggs.length};
  }
  function fmPickApple(state, id){
    state = fmLoad(state);
    const item = FM_APPLES.find(f => f.id === id);
    if (!item) return {ok:false, why:'unknown', state};
    if (fmHas(state.apples, id)) return {ok:false, why:'have', already:true, state, item};
    state.apples = fmAdd(state.apples, id);
    return {ok:true, state, item, left: FM_APPLES.length - state.apples.length};
  }
  function fmPickPump(state, id){
    state = fmLoad(state);
    const item = FM_PUMPS.find(f => f.id === id);
    if (!item) return {ok:false, why:'unknown', state};
    if (fmHas(state.pumps, id)) return {ok:false, why:'have', already:true, state, item};
    state.pumps = fmAdd(state.pumps, id);
    return {ok:true, state, item, left: FM_PUMPS.length - state.pumps.length};
  }
  function fmBoardBus(run){
    if (!run) return {ok:false, why:'no'};
    if (run.phase !== 'yard') return {ok:false, why:'phase', phase: run.phase};
    run.phase = 'ride'; run.rideT = 0; run.boarded = true;
    return {ok:true};
  }
  function fmTickRide(run, dt){
    if (!run || run.phase !== 'ride') return run;
    run.rideT = (run.rideT || 0) + (dt || 0);
    if (run.rideT >= FM_RIDE_T){ run.phase = 'farm'; run.arrived = true; }
    return run;
  }
  function fmStartHay(run, state){
    if (!run || run.phase !== 'farm') return {ok:false, why:'phase'};
    if (run.haying) return {ok:false, why:'now'};
    run.haying = true; run.hayT = 0;
    return {ok:true};
  }
  function fmTickHay(run, state, dt){
    if (!run || !run.haying) return {run, state, done:false};
    run.hayT = (run.hayT || 0) + (dt || 0);
    if (run.hayT >= FM_HAY_T){
      run.haying = false; run.hayT = FM_HAY_T;
      state = fmLoad(state);
      state.hay = true;
      return {run, state, done:true};
    }
    return {run, state, done:false};
  }
  function fmBoardHome(run, state){
    state = fmLoad(state);
    if (!run || (run.phase !== 'farm' && run.phase !== 'done')) return {ok:false, why:'phase', state};
    if (!fmAllDone(state)) return {ok:false, why:'chores', state};
    if (state.won) return {ok:true, already:true, coins:0, state, message:'You already finished this farm visit.'};
    state.won = true;
    state.coins = (state.coins || 0) + FM_REWARD;
    if (run) run.phase = 'done';
    return {ok:true, coins: FM_REWARD, state, message:'Hay, eggs, fruit and full tummies — what a farm day!'};
  }
  function fmNear(x, z, state, run){
    const phase = (run && run.phase) || 'yard';
    if (phase === 'yard'){
      if (Math.hypot((x||0) - FM_BUS.x, (z||0) - FM_BUS.z) <= FM_BUS.r) return {kind:'bus', act:'🚌 Board the bus', name:'Afterbell bus'};
      if (Math.hypot((x||0) - FM_TEACHER.x, (z||0) - FM_TEACHER.z) <= FM_TEACHER.r) return {kind:'talk', who:'Ms. Bramble', act:'👋 Talk', text:'Ms. Bramble: "Today we visit Honeymeadow Farm! Feed the animals, gather eggs, pick apples and pumpkins, and take the hay wagon for a ride."'};
      return null;
    }
    if (phase === 'ride' || (run && run.haying)) return {kind:'ride', act:'🚌 Riding…'};
    if (phase === 'farm' || phase === 'done'){
      if (Math.hypot((x||0) - FM_GUIDE.x, (z||0) - FM_GUIDE.z) <= FM_GUIDE.r){
        const text = fmAllDone(state)
          ? 'Farmer Nettie: "The wagon, the hens, the trees — you did it all! The Afterbell bus is waiting at the gate."'
          : 'Farmer Nettie: "Welcome to Honeymeadow Farm! Feed the animals, gather eggs, pick apples and pumpkins, then hop on the hay wagon."';
        return {kind:'talk', who:'Farmer Nettie', act:'👋 Talk', text};
      }
      if (Math.hypot((x||0) - FM_WAGON.x, (z||0) - FM_WAGON.z) <= FM_WAGON.r){
        const st = fmLoad(state);
        if (st.hay) return {kind:'talk', who:'Hay wagon', act:'🌾 Look', text:'The hay wagon already took you around the farm. What a bouncy ride!'};
        return {kind:'hay', act:'🌾 Ride the hay wagon', name:'Hay wagon'};
      }
      for (let i = 0; i < FM_FEEDS.length; i++){
        const f = FM_FEEDS[i];
        if (Math.hypot((x||0) - f.x, (z||0) - f.z) <= (f.r || 2) && !fmHas(fmLoad(state).fed, f.id)) return {kind:'feed', id:f.id, name:f.name, emoji:f.emoji, act:(f.emoji||'🌾') + ' Feed ' + f.name};
      }
      for (let i = 0; i < FM_EGGS.length; i++){
        const f = FM_EGGS[i];
        if (Math.hypot((x||0) - f.x, (z||0) - f.z) <= (f.r || 1.4) && !fmHas(fmLoad(state).eggs, f.id)) return {kind:'egg', id:f.id, name:f.name, emoji:f.emoji, act:'🥚 Collect egg'};
      }
      for (let i = 0; i < FM_APPLES.length; i++){
        const f = FM_APPLES[i];
        if (Math.hypot((x||0) - f.x, (z||0) - f.z) <= (f.r || 1.8) && !fmHas(fmLoad(state).apples, f.id)) return {kind:'apple', id:f.id, name:f.name, emoji:f.emoji, act:'🍎 Pick apple'};
      }
      for (let i = 0; i < FM_PUMPS.length; i++){
        const f = FM_PUMPS[i];
        if (Math.hypot((x||0) - f.x, (z||0) - f.z) <= (f.r || 1.6) && !fmHas(fmLoad(state).pumps, f.id)) return {kind:'pump', id:f.id, name:f.name, emoji:f.emoji, act:'🎃 Pick pumpkin'};
      }
      if (fmAllDone(state) && Math.hypot((x||0) - FM_HOME_BUS.x, (z||0) - FM_HOME_BUS.z) <= FM_HOME_BUS.r){
        return {kind:'home', act:'🚌 Ride home', name:'Afterbell bus'};
      }
      return null;
    }
    return null;
  }
  function fmGoal(state, run){
    const phase = (run && run.phase) || 'yard';
    const st = fmLoad(state);
    if (phase === 'yard') return 'Board the Afterbell bus for a field trip to Honeymeadow Farm.';
    if (phase === 'ride') return 'The bus is rolling out to Honeymeadow Farm…';
    if (run && run.haying) return 'The hay wagon is taking you around the farm…';
    if (phase === 'done' || (st.won && phase !== 'farm')) return 'Farm day complete! You helped Honeymeadow Farm from hens to hay.';
    if (fmAllDone(st)) return 'All the farm chores are done! Board the bus at the gate to ride home.';
    return 'Help at Honeymeadow Farm: feed ' + st.fed.length + '/' + FM_FEEDS.length + ', eggs ' + st.eggs.length + '/' + FM_EGGS.length + ', apples ' + st.apples.length + '/' + FM_APPLES.length + ', pumpkins ' + st.pumps.length + '/' + FM_PUMPS.length + (st.hay ? ', wagon done' : ', then the hay wagon') + '.';
  }

  const api = {
    FM_KEY, FM_VER, FM_REWARD, FM_RIDE_T, FM_HAY_T, FM_DEST_DZ, FM_VIEW_FAR, FM_YARD_LANDMARKS, fmZ, fmDestClearOfSchool,
    FM_FEEDS, FM_EGGS, FM_APPLES, FM_PUMPS, FM_BUS, FM_HOME_BUS, FM_GUIDE, FM_TEACHER, FM_BARN, FM_ARRIVE, FM_WAGON, FM_RIDE_PATH, FM_HAY_PATH,
    fmFresh, fmLoad, fmNewVisit, fmAllDone, fmFeed, fmPickEgg, fmPickApple, fmPickPump,
    fmBoardBus, fmRidePose, fmTickRide, fmStartHay, fmHayPose, fmTickHay, fmBoardHome, fmNear, fmGoal, fmPathLen
  };
  root.FarmRules = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
