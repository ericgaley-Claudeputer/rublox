/* Honeymeadow Farm — a third Afterbell School field trip. Original farm, no copied IP.
   Save key rubloxFarm (new, optional). */
(function (root) {
  const FM_KEY = 'rubloxFarm';
  const FM_VER = 1;
  const FM_REWARD = 22;
  const FM_RIDE_T = 8.4;
  const FM_HAY_T = 9;
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
    {id:'cows', name:'Butterspot cows', emoji:'🐄', x:16, z:fmZ(-32), r:2.4, blurb:'The Butterspot cows blink slowly and chew. They look very pleased.'},
    {id:'goats', name:'Cloverleaf goats', emoji:'🐐', x:-10, z:fmZ(-49), r:2.3, blurb:'The Cloverleaf goats nibble fresh hay, wiggle their floppy ears, and hop with joy!'},
    {id:'bunnies', name:'Velvettail bunnies', emoji:'🐇', x:2, z:fmZ(-49), r:2.2, blurb:'The Velvettail bunnies twitch their pink noses and do happy little velvet hops!'}
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
    {x:8, z:fmZ(-11)},
    {x:22, z:fmZ(-12)},
    {x:32, z:fmZ(-24)},
    {x:32, z:fmZ(-44)},
    {x:20, z:fmZ(-60)},
    {x:0, z:fmZ(-64)},
    {x:-32, z:fmZ(-58)},
    {x:-34, z:fmZ(-32)},
    {x:-32, z:fmZ(-16)},
    {x:-20, z:fmZ(-11)},
    {x:-6, z:fmZ(-11)},
    {x:0, z:fmZ(-16)}
  ];
  const FM_BARN_BOX = {w:10, d:8, margin:8};
  const FM_STAND = {x:10, z:fmZ(-5), r:2.6, name:'Honeymeadow Stand'};
  const FM_PRICES = {egg:4, apple:3, pump:5};
  const FM_PRICE_LIST = [
    {kind:'egg', name:'Warm egg', emoji:'🥚', price:4, stockKey:'eggs', soldKey:'egg'},
    {kind:'apple', name:'Farm apple', emoji:'🍎', price:3, stockKey:'apples', soldKey:'apple'},
    {kind:'pump', name:'Harvest pumpkin', emoji:'🎃', price:5, stockKey:'pumps', soldKey:'pump'}
  ];
  const FM_CUSTOMERS = [
    {id:'pip', name:'Pip', emoji:'🧒', want:'egg', line:'Pip: "A warm egg for breakfast, please!"'},
    {id:'clover', name:'Clover', emoji:'👧', want:'apple', line:'Clover: "I would love a crunchy farm apple!"'},
    {id:'wes', name:'Wes', emoji:'👦', want:'pump', line:'Wes: "A little pumpkin for the porch, please!"'},
    {id:'mabel', name:'Mabel', emoji:'👩', want:'apple', line:'Mabel: "Two hands, one apple — perfect."'},
    {id:'juniper', name:'Juniper', emoji:'🧑', want:'egg', line:'Juniper: "A speckled egg would make my day!"'}
  ];
  const FM_BABIES = [
    {id:'chick', kind:'chick', name:'Speckle chick', emoji:'🐥', x:-20, z:fmZ(-36), r:1.8, needFeed:'hens', names:['Pip','Nugget','Sunny']},
    {id:'lamb', kind:'lamb', name:'Cloudwool lamb', emoji:'🐑', x:-18.2, z:fmZ(-39.2), r:1.8, needFeed:'sheep', names:['Clover','Puff','Woolly']},
    {id:'calf', kind:'calf', name:'Butterspot calf', emoji:'🐄', x:-21.6, z:fmZ(-39.4), r:1.9, needFeed:'cows', names:['Buttercup','Dot','Moo']},
    {id:'piglet', kind:'piglet', name:'Mudpuddle piglet', emoji:'🐷', x:-17.4, z:fmZ(-33.6), r:1.8, needFeed:null, names:['Puddle','Oinky','Peach']},
    {id:'duckling', kind:'duckling', name:'Pondripple duckling', emoji:'🐤', x:-22.2, z:fmZ(-33.4), r:1.8, needFeed:null, names:['Ripple','Paddle','Bean']},
    {id:'kid', kind:'kid', name:'Cloverleaf kid', emoji:'🐐', x:-16.8, z:fmZ(-36.6), r:1.8, needFeed:'goats', names:['Clover','Sprout','Skip']},
    {id:'kit', kind:'kit', name:'Velvettail bunny', emoji:'🐇', x:-22.6, z:fmZ(-36.6), r:1.8, needFeed:'bunnies', names:['Velvet','Cotton','Hop']}
  ];
  const FM_NURSERY = {x:-19.5, z:fmZ(-36.5)};
  // GB-7: Pondripple Pond, past the far side of the hay loop. An oval pond with a little dock.
  const FM_POND = {x:-2, z:fmZ(-86), rx:12, rz:8, name:'Pondripple Pond'};
  const FM_DOCK = {x0:4.2, x1:11.6, z:fmZ(-86), w:1.8, end:{x:5.0, z:fmZ(-86), r:1.9}};
  const FM_DUCK_FEED = {x:-2, z:fmZ(-76.4), r:2.6, name:'Pondripple ducks', emoji:'🦆', blurb:'The Pondripple ducks paddle over in a wobbly line and gobble the duck pellets. Quack-quack, thank you!'};
  const FM_POND_FISH = [
    {id:'minnowmint', name:'Minnowmint', emoji:'🐟', line:'a tiny, minty-green Minnowmint'},
    {id:'reedfin', name:'Reedfin perch', emoji:'🐠', line:'a stripy Reedfin perch'},
    {id:'lilyglow', name:'Lilyglow koi', emoji:'🎏', line:'a shimmery Lilyglow koi'},
    {id:'puddlepip', name:'Puddlepip sunny', emoji:'🐡', line:'a round little Puddlepip sunny'}
  ];
  const FM_FISH_COINS = 3; // paid once per new kind of fish, so at most 12 coins ever
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

  function fmFresh(){ return {ver: FM_VER, fed: [], eggs: [], apples: [], pumps: [], hay: false, visits: 0, won: false, coins: 0, sold:{egg:0, apple:0, pump:0}, adopted:[], served:0, ducks:false, fish:[]}; }
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
    const sold = (o.sold && typeof o.sold === 'object') ? o.sold : {};
    d.sold = {
      egg: Math.max(0, Math.min((d.eggs || []).length, sold.egg | 0)),
      apple: Math.max(0, Math.min((d.apples || []).length, sold.apple | 0)),
      pump: Math.max(0, Math.min((d.pumps || []).length, sold.pump | 0))
    };
    d.adopted = fmFilter(o.adopted, FM_BABIES);
    d.served = Math.max(0, o.served | 0);
    d.ducks = !!o.ducks;
    d.fish = fmFilter(o.fish, FM_POND_FISH);
    d.ver = FM_VER;
    return d;
  }
  function fmStock(state){
    const st = fmLoad(state);
    return {
      egg: Math.max(0, (st.eggs || []).length - ((st.sold && st.sold.egg) || 0)),
      apple: Math.max(0, (st.apples || []).length - ((st.sold && st.sold.apple) || 0)),
      pump: Math.max(0, (st.pumps || []).length - ((st.sold && st.sold.pump) || 0))
    };
  }
  function fmPrice(kind){
    const it = FM_PRICE_LIST.find(p => p.kind === kind);
    return it ? it.price : 0;
  }
  function fmCustomer(run, state){
    const stock = fmStock(state);
    const start = ((run && run.custI) || 0) % FM_CUSTOMERS.length;
    for (let i = 0; i < FM_CUSTOMERS.length; i++){
      const c = FM_CUSTOMERS[(start + i) % FM_CUSTOMERS.length];
      if (stock[c.want] > 0) return c;
    }
    return FM_CUSTOMERS[start];
  }
  function fmSell(state, kind, run){
    state = fmLoad(state);
    const item = FM_PRICE_LIST.find(p => p.kind === kind);
    if (!item) return {ok:false, why:'unknown', state};
    const stock = fmStock(state);
    if (stock[kind] <= 0) return {ok:false, why:'stock', state, stock};
    const cust = fmCustomer(run, state);
    if (cust.want !== kind) return {ok:false, why:'want', state, customer:cust, need:cust.want};
    state.sold = Object.assign({}, state.sold);
    state.sold[item.soldKey] = (state.sold[item.soldKey] || 0) + 1;
    state.coins = (state.coins || 0) + item.price;
    state.served = (state.served || 0) + 1;
    if (run) run.custI = ((run.custI || 0) + 1) % FM_CUSTOMERS.length;
    return {ok:true, state, item, coins:item.price, customer:cust, stock: fmStock(state)};
  }
  function fmBaby(id){ return FM_BABIES.find(b => b.id === id) || null; }
  function fmAdopt(state, id){
    state = fmLoad(state);
    const baby = fmBaby(id);
    if (!baby) return {ok:false, why:'unknown', state};
    if (fmHas(state.adopted, id)) return {ok:false, why:'have', already:true, state, baby};
    if (baby.needFeed && !fmHas(state.fed, baby.needFeed)){
      const feed = FM_FEEDS.find(f => f.id === baby.needFeed);
      return {ok:false, why:'feed', state, baby, need: feed && feed.name};
    }
    state.adopted = fmAdd(state.adopted, id);
    const n = (baby.names && baby.names[state.adopted.length % baby.names.length]) || baby.name;
    return {ok:true, state, baby, petName:n, pet:{k:baby.kind, c:0, n:n, xp:0, f:80, u:80, e:90, b:1, g:'g', acc:{}, src:'farm'}};
  }
  function fmGrantPet(petsSave, pet, max){
    max = max || 6;
    const s = petsSave && typeof petsSave === 'object' ? petsSave : {};
    const next = {
      v: s.v || 1,
      pets: Array.isArray(s.pets) ? s.pets.slice() : [],
      a: s.a | 0,
      dex: s.dex && typeof s.dex === 'object' ? {seen: Object.assign({}, s.dex.seen || {}), own: Object.assign({}, s.dex.own || {}), done: Object.assign({}, s.dex.done || {})} : {seen:{}, own:{}, done:{}},
      inv: s.inv && typeof s.inv === 'object' ? Object.assign({}, s.inv) : {},
      flow: s.flow || null,
      pend: s.pend,
      tut: s.tut | 0,
      t: s.t || 0
    };
    if (next.pets.length >= max) return {ok:false, why:'full', pets: next};
    if (!pet || !pet.k) return {ok:false, why:'pet', pets: next};
    next.pets.push({k:pet.k, c:pet.c|0, n:String(pet.n || 'Buddy').slice(0, 16), xp:0, f:80, u:80, e:90, b:pet.b || 1, g:pet.g === 'b' ? 'b' : 'g', acc: pet.acc && typeof pet.acc === 'object' ? pet.acc : {}, src:'farm'});
    next.a = next.pets.length - 1;
    next.dex.seen[pet.k] = 1;
    next.dex.own[pet.k] = 1;
    return {ok:true, pets: next, pet: next.pets[next.pets.length - 1]};
  }
  function fmHayClearance(along){
    along = along == null ? 1.4 : along;
    const hw = (FM_BARN_BOX.w || 10) / 2, hd = (FM_BARN_BOX.d || 8) / 2;
    let min = Infinity;
    for (let t = 0; t <= FM_HAY_T + 0.001; t += 0.12){
      const p = fmHayPose({hayT: t});
      const cy = Math.cos(p.yaw || 0), sy = Math.sin(p.yaw || 0);
      const pts = [
        {x:p.x, z:p.z},
        {x:p.x + along * sy, z:p.z + along * cy},
        {x:p.x - 1.9 * sy, z:p.z - 1.9 * cy}
      ];
      pts.forEach(q => {
        const dx = Math.max(0, Math.abs(q.x - FM_BARN.x) - hw);
        const dz = Math.max(0, Math.abs(q.z - FM_BARN.z) - hd);
        const d = Math.hypot(dx, dz);
        if (d < min) min = d;
      });
    }
    return min;
  }
  function fmNewVisit(state){
    const st = fmLoad(state);
    st.visits = (st.visits | 0) + 1;
    return {state: st, run: {phase:'yard', t:0, rideT:0, hayT:0, haying:false, near:null, boarded:false, custI:0}};
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
  function fmInPond(x, z, pad){
    const dx = ((x||0) - FM_POND.x) / (FM_POND.rx + (pad||0)), dz = ((z||0) - FM_POND.z) / (FM_POND.rz + (pad||0));
    return dx * dx + dz * dz < 1;
  }
  function fmOnDock(x, z){
    return (x||0) >= FM_DOCK.x0 - 0.2 && (x||0) <= FM_DOCK.x1 + 0.4 && Math.abs((z||0) - FM_DOCK.z) <= FM_DOCK.w / 2 + 0.15;
  }
  // Keep walkers out of the water: anyone inside the pond (and not on the dock) is moved to the shore.
  function fmPondPush(x, z){
    if (fmOnDock(x, z) || !fmInPond(x, z, -0.6)) return null;
    let dx = ((x||0) - FM_POND.x) / FM_POND.rx, dz = ((z||0) - FM_POND.z) / FM_POND.rz;
    let L = Math.hypot(dx, dz); if (L < 1e-4){ dx = 0; dz = 1; L = 1; }
    const k = 1 / L * 1.0;
    return {x: FM_POND.x + dx * k * (FM_POND.rx - 0.55), z: FM_POND.z + dz * k * (FM_POND.rz - 0.55)};
  }
  function fmFeedDucks(state){
    state = fmLoad(state);
    if (state.ducks) return {ok:false, why:'have', already:true, state, item:FM_DUCK_FEED};
    state.ducks = true;
    return {ok:true, state, item:FM_DUCK_FEED};
  }
  // roll: 0..1 picks the fish. New kinds are added to the save and pay a few coins once; repeats pay nothing.
  function fmFish(state, roll){
    state = fmLoad(state);
    const r = Math.max(0, Math.min(0.9999, +roll || 0));
    const fish = FM_POND_FISH[Math.floor(r * FM_POND_FISH.length)];
    const first = !fmHas(state.fish, fish.id);
    if (first) state.fish = fmAdd(state.fish, fish.id);
    const coins = first ? FM_FISH_COINS : 0;
    if (coins) state.coins = (state.coins | 0) + coins;
    return {ok:true, state, fish, first, coins, all: state.fish.length >= FM_POND_FISH.length, count: state.fish.length};
  }
  function fmNear(x, z, state, run){
    const phase = (run && run.phase) || 'yard';
    if (phase === 'yard'){
      if (Math.hypot((x||0) - FM_BUS.x, (z||0) - FM_BUS.z) <= FM_BUS.r) return {kind:'bus', act:'🚌 Board the bus', name:'Afterbell bus'};
      if (Math.hypot((x||0) - FM_TEACHER.x, (z||0) - FM_TEACHER.z) <= FM_TEACHER.r) return {kind:'talk', who:'Ms. Bramble', act:'👋 Talk', text:'Ms. Bramble: "Today we visit Honeymeadow Farm! Feed the animals, gather eggs, pick apples and pumpkins, take the hay wagon, sell at the stand, and maybe adopt a baby animal."'};
      return null;
    }
    if (phase === 'ride' || (run && run.haying)) return {kind:'ride', act:'🚌 Riding…'};
    if (phase === 'farm' || phase === 'done'){
      if (Math.hypot((x||0) - FM_GUIDE.x, (z||0) - FM_GUIDE.z) <= FM_GUIDE.r){
        const text = fmAllDone(state)
          ? 'Farmer Nettie: "The wagon, the hens, the trees — you did it all! Sell extras at the stand if you like, then the Afterbell bus is waiting at the gate."'
          : 'Farmer Nettie: "Welcome to Honeymeadow Farm! Feed the animals, gather eggs, pick apples and pumpkins, hop on the hay wagon, sell at my stand, and visit the little ones in the nursery."';
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
      if (Math.hypot((x||0) - FM_STAND.x, (z||0) - FM_STAND.z) <= (FM_STAND.r || 2.6)){
        const st = fmLoad(state);
        const stock = fmStock(st);
        const cust = fmCustomer(run, st);
        const have = stock[cust.want] || 0;
        const item = FM_PRICE_LIST.find(p => p.kind === cust.want);
        if (have > 0 && item){
          return {kind:'sell', want:cust.want, customer:cust, item, act:'🪙 Sell ' + item.emoji + ' ' + item.name + ' to ' + cust.name + ' · ' + item.price, text:cust.line};
        }
        const left = stock.egg + stock.apple + stock.pump;
        const wish = item ? (item.emoji + ' ' + item.name) : 'something from the stand';
        return {kind:'talk', who:cust.name, act:'👋 Talk', text: left
          ? (cust.name + ' is hoping for a ' + wish + '. Check the price board!')
          : (cust.name + ': "The stand is open! Bring eggs, apples or pumpkins and I will pay in coins."')};
      }
      for (let i = 0; i < FM_BABIES.length; i++){
        const b = FM_BABIES[i];
        if (Math.hypot((x||0) - b.x, (z||0) - b.z) <= (b.r || 1.8) && !fmHas(fmLoad(state).adopted, b.id)){
          const st = fmLoad(state);
          if (b.needFeed && !fmHas(st.fed, b.needFeed)){
            const feed = FM_FEEDS.find(f => f.id === b.needFeed);
            return {kind:'talk', who:b.name, act:'👋 Look', text:'This little ' + b.name + ' is shy until the ' + ((feed && feed.name) || 'animals') + ' have been fed.'};
          }
          return {kind:'adopt', id:b.id, baby:b, act:(b.emoji||'🐾') + ' Adopt the ' + b.name, name:b.name};
        }
      }
      for (let i = 0; i < FM_FEEDS.length; i++){
        const f = FM_FEEDS[i];
        if (Math.hypot((x||0) - f.x, (z||0) - f.z) <= (f.r || 2) && fmHas(fmLoad(state).fed, f.id)){
          return {kind:'pet', id:f.id, name:f.name, emoji:f.emoji, act:'💕 Pet ' + f.name, text:'You pet the ' + f.name + '! They lean in with happy wiggles.'};
        }
      }
      if (fmOnDock(x, z) && Math.hypot((x||0) - FM_DOCK.end.x, (z||0) - FM_DOCK.end.z) <= FM_DOCK.end.r){
        return {kind:'fish', act:'🎣 Fish off the dock', name:'Pondripple dock'};
      }
      if (Math.hypot((x||0) - FM_DUCK_FEED.x, (z||0) - FM_DUCK_FEED.z) <= FM_DUCK_FEED.r){
        if (!fmLoad(state).ducks) return {kind:'ducks', act:'🦆 Feed the Pondripple ducks', name:FM_DUCK_FEED.name, emoji:'🦆'};
        return {kind:'talk', who:'Pondripple ducks', act:'🦆 Wave', text:'The Pondripple ducks bob on the water and quack hello. The lily pads wobble as they paddle past.'};
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
    if (fmAllDone(st)){
      const stock = fmStock(st);
      if (stock.egg + stock.apple + stock.pump > 0) return 'Chores are done! Sell extras at the Honeymeadow stand, or board the bus at the gate.';
      return 'All the farm chores are done! Board the bus at the gate to ride home.';
    }
    const stock = fmStock(st);
    if (stock.egg + stock.apple + stock.pump > 0) return 'Help at Honeymeadow Farm, and sell eggs, apples or pumpkins at the stand for coins.';
    return 'Help at Honeymeadow Farm: feed ' + st.fed.length + '/' + FM_FEEDS.length + ', eggs ' + st.eggs.length + '/' + FM_EGGS.length + ', apples ' + st.apples.length + '/' + FM_APPLES.length + ', pumpkins ' + st.pumps.length + '/' + FM_PUMPS.length + (st.hay ? ', wagon done' : ', then the hay wagon') + '.';
  }

  const api = {
    FM_KEY, FM_VER, FM_REWARD, FM_RIDE_T, FM_HAY_T, FM_DEST_DZ, FM_VIEW_FAR, FM_YARD_LANDMARKS, fmZ, fmDestClearOfSchool,
    FM_FEEDS, FM_EGGS, FM_APPLES, FM_PUMPS, FM_BUS, FM_HOME_BUS, FM_GUIDE, FM_TEACHER, FM_BARN, FM_BARN_BOX, FM_ARRIVE, FM_WAGON, FM_RIDE_PATH, FM_HAY_PATH,
    FM_STAND, FM_PRICES, FM_PRICE_LIST, FM_CUSTOMERS, FM_BABIES, FM_NURSERY,
    FM_POND, FM_DOCK, FM_DUCK_FEED, FM_POND_FISH, FM_FISH_COINS, fmInPond, fmOnDock, fmPondPush, fmFeedDucks, fmFish,
    fmFresh, fmLoad, fmNewVisit, fmAllDone, fmFeed, fmPickEgg, fmPickApple, fmPickPump, fmStock, fmPrice, fmCustomer, fmSell,
    fmBaby, fmAdopt, fmGrantPet, fmHayClearance,
    fmBoardBus, fmRidePose, fmTickRide, fmStartHay, fmHayPose, fmTickHay, fmBoardHome, fmNear, fmGoal, fmPathLen
  };
  root.FarmRules = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
