/* Brightwhistle Museum of Wonders — a fourth Afterbell School field trip. Original museum, exhibits and gifts, no copied IP.
   Save key rubloxMuseum (new, optional). */
(function (root) {
  const MU_KEY = 'rubloxMuseum';
  const MU_VER = 1;
  const MU_REWARD = 20;
  const MU_TOKEN_COINS = 2;
  const MU_HUNT_BONUS = 10;
  const MU_RIDE_T = 8.4;
  const MU_DEST_DZ = -560;
  const MU_VIEW_FAR = 400;
  function muZ(z){ return z + MU_DEST_DZ; }
  const MU_YARD_LANDMARKS = [
    {id:'school', x:0, z:32},
    {id:'bus', x:0, z:10},
    {id:'teacher', x:-4, z:16},
    {id:'spawn', x:0, z:18}
  ];
  function muDestClearOfSchool(x, z){
    return MU_YARD_LANDMARKS.every(p => Math.hypot((x||0) - p.x, (z||0) - p.z) > MU_VIEW_FAR);
  }
  // The great hall: a cozy wooden-floored room, front doors facing the bus.
  const MU_HALL = {x:0, z:muZ(-36), w:36, d:30, doorW:5, doorH:4.6, wallH:6.2};
  function muInHall(x, z){
    return Math.abs((x||0) - MU_HALL.x) < MU_HALL.w / 2 && Math.abs((z||0) - MU_HALL.z) < MU_HALL.d / 2;
  }
  const MU_FINDS = [
    {id:'dino', name:'Thunderhorn skeleton', emoji:'🦴', x:0, z:muZ(-32.6), r:2.4,
      blurb:'The Thunderhorn skeleton is as long as a school bus! Its three nose horns were for showing off, not for fighting.'},
    {id:'gem', name:'Glowstone geode', emoji:'💎', x:-13.2, z:muZ(-27), r:2.2,
      blurb:'Crack open a Glowstone geode and a hundred purple crystals sparkle inside, like a cave full of tiny stars.'},
    {id:'meteor', name:'Moonpebble meteorite', emoji:'☄️', x:-13.2, z:muZ(-44), r:2.2,
      blurb:'The Moonpebble meteorite fell softly into a farmer\'s field long ago. You can see the shiny metal flecks inside.'},
    {id:'space', name:'Starwick orbit model', emoji:'🪐', x:13.2, z:muZ(-44), r:2.4,
      blurb:'In the Starwick orbit model, seven painted planets glide around a glowing sun. The ringed one is called Hoopla.'},
    {id:'art', name:'Sunfield mural gallery', emoji:'🖼️', x:0, z:muZ(-47.4), r:2.6,
      blurb:'The Sunfield murals were painted by kids from all over the valley: a rainbow barn, a kite festival, and a sleepy moon.'}
  ];
  // Scavenger hunt: five little brass owl tokens hidden around the museum. Each pays once, and finding all five pays a bonus once.
  const MU_TOKENS = [
    {id:'owl-dino', name:'Owl token by the Thunderhorn tail', x:5.6, z:muZ(-41.4), r:1.5, hint:'Look behind the longest tail in the hall.'},
    {id:'owl-bench', name:'Owl token under the reading bench', x:-6.4, z:muZ(-29.4), r:1.5, hint:'Somebody sat on a bench and dropped one.'},
    {id:'owl-meteor', name:'Owl token in the meteor corner', x:-16.2, z:muZ(-48.6), r:1.5, hint:'The space rock corner is a little dusty.'},
    {id:'owl-gallery', name:'Owl token beside the murals', x:15.4, z:muZ(-49), r:1.5, hint:'An owl likes art too — try the far gallery corner.'},
    {id:'owl-garden', name:'Owl token in the flower planter', x:-9, z:muZ(-14), r:1.5, hint:'Outside, the flowers by the front steps are hiding something.'}
  ];
  const MU_BUS = {x:0, z:10, r:2.4};
  const MU_HOME_BUS = {x:0, z:muZ(-6), r:2.6};
  const MU_GUIDE = {x:-6.6, z:muZ(-17), r:2.0, name:'Curator Odessa', role:'guide'};
  const MU_TEACHER = {x:-4, z:16, r:1.8, name:'Ms. Bramble', role:'teacher'};
  const MU_ARRIVE = {x:3.4, z:muZ(-8)};
  // Gift corner inside the hall, front-right, with its own counter and shopkeeper.
  const MU_SHOP = {x:14.2, z:muZ(-26.2), r:2.2, name:'Brightwhistle Gift Corner'};
  const MU_GIFTS = [
    {id:'thunderhorn-plush', name:'Thunderhorn plush', emoji:'🦕', price:18, kind:'plush', x:11.6, z:muZ(-23.4), r:1.3,
      blurb:'A squashy Thunderhorn plush with three soft nose horns.'},
    {id:'geode-charm', name:'Glowstone charm', emoji:'💎', price:12, kind:'charm', x:11.6, z:muZ(-26.2), r:1.3,
      blurb:'A little purple crystal charm that twinkles in the light.'},
    {id:'hat-dinocap', name:'Thunderhorn cap', emoji:'🧢', price:40, kind:'hat', slot:'hat', val:'dinocap', x:11.6, z:muZ(-29), r:1.3,
      blurb:'A green cap with three tiny felt horns on top. It sits on your head, clear of your eyes.'},
    {id:'orbit-globe', name:'Starwick snow globe', emoji:'🪐', price:16, kind:'plush', x:16.8, z:muZ(-23.4), r:1.3,
      blurb:'Shake it and tiny stars swirl around a ringed planet.'},
    {id:'mural-kit', name:'Sunfield paint kit', emoji:'🎨', price:14, kind:'charm', x:16.8, z:muZ(-26.2), r:1.3,
      blurb:'Six pots of paint and a brush, just like the mural kids used.'},
    {id:'hat-starcap', name:'Stargazer cap', emoji:'🎩', price:42, kind:'hat', slot:'hat', val:'starcap', x:16.8, z:muZ(-29), r:1.3,
      blurb:'A deep-blue cap with a gold star. It sits up on your head, not over your face.'}
  ];
  function muGiftLabel(g){
    if (!g) return null;
    const side = g.x < MU_SHOP.x ? -0.95 : 0.95;
    return {x: g.x + side, y: 2.05, z: g.z};
  }
  function muGiftsOverlap(minDist){
    minDist = minDist == null ? 2.4 : minDist;
    const labs = MU_GIFTS.map(muGiftLabel);
    for (let i = 0; i < labs.length; i++) for (let j = i + 1; j < labs.length; j++){
      if (Math.hypot(labs[i].x - labs[j].x, labs[i].z - labs[j].z) < minDist) return true;
    }
    return false;
  }
  // Countryside road: meadows the whole way, the school drops out of view long before the museum.
  const MU_RIDE_PATH = [
    {x:0, z:10},
    {x:0, z:2},
    {x:28, z:2},
    {x:28, z:-90},
    {x:16, z:-200},
    {x:26, z:-320},
    {x:8, z:-440},
    {x:0, z:muZ(-8)}
  ];

  function muFresh(){ return {ver: MU_VER, found: [], tokens: [], huntDone: false, visits: 0, won: false, coins: 0, gifts: []}; }
  function muLoad(raw){
    const d = muFresh();
    const o = (raw && typeof raw === 'object') ? raw : {};
    const ids = MU_FINDS.map(f => f.id);
    d.found = Array.isArray(o.found) ? o.found.filter((id, i, a) => ids.indexOf(id) >= 0 && a.indexOf(id) === i) : [];
    const tids = MU_TOKENS.map(t => t.id);
    d.tokens = Array.isArray(o.tokens) ? o.tokens.filter((id, i, a) => tids.indexOf(id) >= 0 && a.indexOf(id) === i) : [];
    d.huntDone = !!o.huntDone;
    d.visits = Math.max(0, o.visits | 0);
    d.won = !!o.won;
    d.coins = Math.max(0, o.coins | 0);
    const gids = MU_GIFTS.map(g => g.id);
    d.gifts = Array.isArray(o.gifts) ? o.gifts.filter((id, i, a) => gids.indexOf(id) >= 0 && a.indexOf(id) === i) : [];
    d.ver = MU_VER;
    return d;
  }
  function muNewVisit(state){
    const st = muLoad(state);
    st.visits = (st.visits | 0) + 1;
    return {state: st, run: {phase:'yard', t:0, rideT:0, boarded:false}};
  }
  function muFind(id){ return MU_FINDS.find(f => f.id === id) || null; }
  function muHas(state, id){ return (muLoad(state).found || []).indexOf(id) >= 0; }
  function muAll(state){ return MU_FINDS.every(f => muHas(state, f.id)); }
  function muPick(state, id){
    state = muLoad(state);
    if (!muFind(id)) return {ok:false, why:'unknown', state};
    if (muHas(state, id)) return {ok:false, why:'have', state};
    state.found = (state.found || []).concat([id]);
    return {ok:true, why:'found', state, item: muFind(id), left: MU_FINDS.length - state.found.length};
  }
  function muToken(id){ return MU_TOKENS.find(t => t.id === id) || null; }
  function muHasToken(state, id){ return (muLoad(state).tokens || []).indexOf(id) >= 0; }
  function muTakeToken(state, id){
    state = muLoad(state);
    const t = muToken(id);
    if (!t) return {ok:false, why:'unknown', state, coins:0};
    if (muHasToken(state, id)) return {ok:false, why:'have', already:true, state, coins:0};
    state.tokens = (state.tokens || []).concat([id]);
    let coins = MU_TOKEN_COINS, bonus = 0;
    const all = MU_TOKENS.every(x => state.tokens.indexOf(x.id) >= 0);
    if (all && !state.huntDone){ state.huntDone = true; bonus = MU_HUNT_BONUS; }
    coins += bonus;
    state.coins = (state.coins | 0) + coins;
    return {ok:true, why:'token', state, coins, bonus, item:t, n: state.tokens.length, left: MU_TOKENS.length - state.tokens.length, all};
  }
  function muNextHint(state){
    const st = muLoad(state);
    const t = MU_TOKENS.find(x => st.tokens.indexOf(x.id) < 0);
    return t ? t.hint : '';
  }
  function muBoardBus(run){
    if (!run) return {ok:false, why:'no'};
    if (run.phase !== 'yard') return {ok:false, why:'phase', phase: run.phase};
    run.phase = 'ride'; run.rideT = 0; run.boarded = true;
    return {ok:true, why:'ride', phase:'ride'};
  }
  function muPathLen(path){
    let n = 0;
    for (let i = 0; i < (path||[]).length - 1; i++) n += Math.hypot(path[i+1].x - path[i].x, path[i+1].z - path[i].z);
    return n;
  }
  function muRidePose(run){
    const path = MU_RIDE_PATH;
    const t = Math.max(0, Math.min(1, ((run && run.rideT) || 0) / MU_RIDE_T));
    const total = muPathLen(path) || 1;
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
  function muTickRide(run, dt){
    if (!run || run.phase !== 'ride') return run;
    dt = Math.max(0, Math.min(0.2, +dt || 0));
    run.rideT = (run.rideT || 0) + dt;
    if (run.rideT >= MU_RIDE_T){ run.phase = 'hall'; run.arrived = true; }
    return run;
  }
  function muBoardHome(run, state){
    if (!run) return {ok:false, why:'no', state: muLoad(state)};
    if (run.phase !== 'hall') return {ok:false, why:'phase', state: muLoad(state)};
    state = muLoad(state);
    if (!muAll(state)) return {ok:false, why:'finds', left: MU_FINDS.length - (state.found||[]).length, state};
    if (state.won){ run.phase = 'done'; return {ok:true, why:'have', coins:0, state, already:true, message:'The Afterbell bus is heading home from Brightwhistle Museum.'}; }
    state.won = true;
    state.coins = (state.coins | 0) + MU_REWARD;
    run.phase = 'done';
    return {ok:true, why:'home', coins: MU_REWARD, state, message:'The Afterbell bus is heading home from Brightwhistle Museum. You saw every exhibit!'};
  }

  function muGift(id){ return MU_GIFTS.find(g => g.id === id) || null; }
  function muHasGift(state, id){ return (muLoad(state).gifts || []).indexOf(id) >= 0; }
  function muBuyGift(state, id, coins){
    state = muLoad(state);
    const g = muGift(id);
    if (!g) return {ok:false, why:'unknown', state, coins: coins||0};
    if (muHasGift(state, id)) return {ok:false, why:'have', already:true, state, item:g, coins: coins||0};
    const have = (coins == null) ? 0 : coins;
    if (have < g.price) return {ok:false, why:'coins', need: g.price - have, state, item:g, coins: have};
    state.gifts = (state.gifts || []).concat([id]);
    return {ok:true, why:'bought', state, item:g, coins: have - g.price, spent:g.price};
  }
  function muNear(x, z, state, run){
    const phase = (run && run.phase) || 'yard';
    const d = (o) => Math.hypot((x||0) - o.x, (z||0) - o.z);
    if (phase === 'yard'){
      if (d(MU_BUS) <= MU_BUS.r) return {kind:'bus', act:'🚌 Board the bus', name:'Afterbell bus'};
      if (d(MU_TEACHER) <= MU_TEACHER.r) return {kind:'talk', who:'Ms. Bramble', act:'👋 Talk', text:'Ms. Bramble: "Today we ride to Brightwhistle Museum of Wonders! Look closely — there are brass owl tokens hidden inside."'};
      return null;
    }
    if (phase === 'ride') return {kind:'ride', act:'🚌 Riding…'};
    if (phase === 'hall' || phase === 'done'){
      const st = muLoad(state);
      if (d(MU_GUIDE) <= MU_GUIDE.r){
        const left = MU_FINDS.length - (st.found||[]).length;
        const tl = MU_TOKENS.length - (st.tokens||[]).length;
        const text = left
          ? ('Curator Odessa: "Welcome to Brightwhistle! Visit ' + left + ' more exhibit' + (left===1?'':'s') + '.' + (tl ? (' ' + tl + ' owl token' + (tl===1?' is':'s are') + ' still hiding. ' + muNextHint(st)) : '') + '"')
          : ('Curator Odessa: "You saw every exhibit! The Afterbell bus is waiting by the front gate.' + (tl ? (' Psst — ' + muNextHint(st)) : '') + '"');
        return {kind:'talk', who:'Curator Odessa', act:'👋 Talk', text};
      }
      for (let i = 0; i < MU_TOKENS.length; i++){
        const t = MU_TOKENS[i];
        if (d(t) <= (t.r || 1.5) && !muHasToken(st, t.id)) return {kind:'token', id:t.id, name:t.name, act:'🦉 Pick up the owl token'};
      }
      for (let i = 0; i < MU_FINDS.length; i++){
        const f = MU_FINDS[i];
        if (d(f) <= (f.r || 2) && !muHas(st, f.id)) return {kind:'find', id:f.id, name:f.name, emoji:f.emoji, act:(f.emoji||'🔍') + ' Look'};
      }
      for (let i = 0; i < MU_GIFTS.length; i++){
        const g = MU_GIFTS[i];
        if (d(g) <= (g.r || 1.3)){
          if (muHasGift(st, g.id)) return {kind:'talk', who:'Fennick', act:'🛍️ Look', text:'You already have the ' + g.name + '. ' + (g.blurb||'')};
          return {kind:'gift', id:g.id, name:g.name, emoji:g.emoji, price:g.price, act:(g.emoji||'🛍️') + ' Buy ' + g.name + ' · 🪙 ' + g.price};
        }
      }
      if (d(MU_SHOP) <= (MU_SHOP.r||2.2)){
        return {kind:'talk', who:'Fennick', act:'🛍️ Browse', text:'Fennick: "Welcome to the Brightwhistle Gift Corner! Everything here was made just for our museum."'};
      }
      if (muAll(st) && d(MU_HOME_BUS) <= MU_HOME_BUS.r){
        return {kind:'home', act:'🚌 Ride home', name:'Afterbell bus'};
      }
      return null;
    }
    return null;
  }
  function muGoal(state, run){
    const phase = (run && run.phase) || 'yard';
    const st = muLoad(state);
    const n = (st.found || []).length;
    const tk = (st.tokens || []).length;
    const owls = ' · 🦉 ' + tk + '/' + MU_TOKENS.length;
    if (phase === 'yard') return 'Board the Afterbell bus for a field trip to Brightwhistle Museum of Wonders.';
    if (phase === 'ride') return 'The bus is rolling through the meadows to Brightwhistle Museum…';
    if (phase === 'done' || (st.won && phase !== 'hall')) return 'Field trip complete! You saw every Brightwhistle exhibit.' + owls;
    if (n >= MU_FINDS.length) return 'All five exhibits seen! Board the bus at the front gate to ride home.' + owls;
    return 'See the museum exhibits (' + n + '/' + MU_FINDS.length + ').' + owls + ' The gift corner is open too.';
  }

  const api = {
    MU_KEY, MU_VER, MU_REWARD, MU_TOKEN_COINS, MU_HUNT_BONUS, MU_RIDE_T, MU_DEST_DZ, MU_VIEW_FAR, MU_YARD_LANDMARKS, muZ, muDestClearOfSchool,
    MU_HALL, muInHall, MU_FINDS, MU_TOKENS, MU_BUS, MU_HOME_BUS, MU_GUIDE, MU_TEACHER, MU_ARRIVE, MU_SHOP, MU_GIFTS, muGiftLabel, muGiftsOverlap, MU_RIDE_PATH,
    muFresh, muLoad, muNewVisit, muFind, muHas, muAll, muPick, muToken, muHasToken, muTakeToken, muNextHint,
    muGift, muHasGift, muBuyGift,
    muBoardBus, muRidePose, muTickRide, muBoardHome, muNear, muGoal
  };
  root.MuseumRules = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
