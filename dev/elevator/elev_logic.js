/* Wobblevator — original Rublox elevator hop. Ride Bingle's wobbly lift
   between quirky floors. Original names and floors only. Save key rubloxElevator.
   Caught on a floor = everyone is okay, back in the lift, streak resets. No fighting, no gore. */
(function (root) {
  const ELEV_KEY = 'rubloxElevator';
  const ELEV_VER = 1;
  const ELEV_SHOP_EVERY = 8;
  const ELEV_RIDE = 2.4;
  const ELEV_INTER = 2.2;

  const ELEV_FLOORS = [
    {id:'pillowpath', name:'Pillow Path', emoji:'🛏️', kind:'obby', seconds:28, coins:6, hint:'Bounce across the pillows to the glowing door.'},
    {id:'sockhunt', name:'Sock Hunt', emoji:'🧦', kind:'find', seconds:24, coins:6, hint:'Find Captain Sock’s missing sock and bring it back.'},
    {id:'soapsurge', name:'Soap Surge', emoji:'🫧', kind:'survive', seconds:16, coins:7, hint:'The soap bars zoom around — don’t get slipped!'},
    {id:'pieparade', name:'Pie Parade', emoji:'🥧', kind:'dodge', seconds:16, coins:7, hint:'Dodge the flying pies until the ding!'},
    {id:'chimeorder', name:'Chime Order', emoji:'🔔', kind:'puzzle', seconds:22, coins:8, hint:'Ring the bells in the order Bingle hummed.'},
    {id:'lanternhall', name:'Lantern Hall', emoji:'🕯️', kind:'creepy', seconds:20, coins:8, hint:'Stay in the moving lantern light and reach the lamp.'},
    {id:'tickletiles', name:'Tickle Tiles', emoji:'😆', kind:'funny', seconds:18, coins:6, hint:'Step on the giggle tiles. Avoid the grumpy ones!'},
    {id:'balloonbounce', name:'Balloon Bounce', emoji:'🎈', kind:'dodge', seconds:16, coins:7, hint:'Dodge the bouncy balloons and make it to the door.'},
    {id:'lostlunch', name:'Lost Lunch', emoji:'🍱', kind:'find', seconds:22, coins:6, hint:'Niblet lost a lunchbox. Find it before the timer!'},
    {id:'jellyhills', name:'Jelly Hills', emoji:'🟣', kind:'obby', seconds:28, coins:8, hint:'Boing over the jelly mounds to the door.'},
    {id:'shadowpeek', name:'Shadow Peek', emoji:'👀', kind:'creepy', seconds:20, coins:8, hint:'Walk to the night-light. Don’t linger in the peeks.'},
    {id:'partypaint', name:'Party Paint', emoji:'🎨', kind:'funny', seconds:20, coins:7, hint:'Tap the blank faces to give them big silly smiles.'},
    {id:'snackstop', name:'Snack Stop', emoji:'🍪', kind:'shop', seconds:14, coins:4, hint:'A cozy rest. Buy a lucky cookie, or just ride on.'},
    {id:'confetticannon', name:'Confetti Cannon', emoji:'🎉', kind:'dodge', seconds:15, coins:7, hint:'Confetti bursts out — hop around it until the ding!'}
  ];

  const ELEV_PALS = [
    {id:'sock', name:'Captain Sock', emoji:'🧦', line:'I packed two socks and only found one. Typical!'},
    {id:'niblet', name:'Niblet', emoji:'🐥', line:'If anyone sees a lunchbox, it is probably mine.'},
    {id:'marm', name:'Marm', emoji:'🧶', line:'I brought extra yarn in case the lift gets drafty.'},
    {id:'taro', name:'Taro', emoji:'📷', line:'Hold still — this wobble makes a great photo!'},
    {id:'sprocket', name:'Sprocket', emoji:'🔧', line:'I tightened every bolt. The wobble is a feature.'}
  ];

  const ELEV_HOST = {id:'bingle', name:'Bingle the Bellhop', emoji:'🛎️', lines:[
    'Going up... or maybe a little sideways!',
    'Hold the handrail. It likes to dance.',
    'Next stop, a surprise! I packed a smile.',
    'Ding-ding! Please keep arms, hats, and socks inside.',
    'If the floor gets too wobbly, we hop back in. Everyone is okay!'
  ]};

  function elevFloor(id){ return ELEV_FLOORS.find(f => f.id === id) || null; }
  function elevPal(id){ return ELEV_PALS.find(p => p.id === id) || null; }

  function elevFresh(){
    return {
      ver: ELEV_VER,
      rides: 0,
      cleared: 0,
      failed: 0,
      best: 0,
      coins: 0,
      seen: [],
      found: 0,
      creepy: 0,
      shopped: 0
    };
  }

  function elevLoad(raw){
    const d = elevFresh();
    const o = (raw && typeof raw === 'object') ? raw : {};
    d.rides = Math.max(0, o.rides | 0);
    d.cleared = Math.max(0, o.cleared | 0);
    d.failed = Math.max(0, o.failed | 0);
    d.best = Math.max(0, o.best | 0);
    d.coins = Math.max(0, o.coins | 0);
    d.found = Math.max(0, o.found | 0);
    d.creepy = Math.max(0, o.creepy | 0);
    d.shopped = Math.max(0, o.shopped | 0);
    if (Array.isArray(o.seen)) d.seen = o.seen.filter(id => elevFloor(id));
    d.ver = ELEV_VER;
    return d;
  }

  function elevBuddyAllowed(mp){ return !mp; }
  function elevNoFight(){ return true; }
  function elevNoGore(){ return true; }
  function elevEveryoneOkay(){ return true; }

  function elevHostLine(n, rand){
    const r = typeof rand === 'function' ? rand : Math.random;
    const i = ((n | 0) >= 0) ? ((n | 0) % ELEV_HOST.lines.length) : Math.floor(r() * ELEV_HOST.lines.length);
    return ELEV_HOST.lines[i];
  }

  function elevPickPal(run, rand){
    if (!run || !run.buddy) return null;
    const r = typeof rand === 'function' ? rand : Math.random;
    const used = run.palId;
    const pool = ELEV_PALS.filter(p => p.id !== used);
    const pick = pool[Math.floor(r() * pool.length)] || ELEV_PALS[0];
    return pick;
  }

  function elevFreshRun(state, now, mp){
    return {
      startedAt: +now || 0,
      phase: 'lobby',
      floor: null,
      last: null,
      t: 0,
      streak: 0,
      survived: 0,
      coins: 0,
      lucky: 0,
      holding: null,
      seq: [],
      seqAt: 0,
      painted: [],
      lit: 1,
      wantFail: false,
      wantClear: false,
      cleared: false,
      failed: false,
      shopDone: false,
      buddy: elevBuddyAllowed(mp),
      mp: !!mp,
      palId: null,
      hostLine: elevHostLine(0),
      quote: ''
    };
  }

  function elevStartRun(state, now, mp){
    state = elevLoad(state);
    state.rides += 1;
    return {ok:true, state, run: elevFreshRun(state, now, mp)};
  }

  function elevDueShop(run){
    if (!run) return false;
    const n = (run.survived | 0) + 1;
    return n > 0 && n % ELEV_SHOP_EVERY === 0;
  }

  function elevPickFloor(run, rand){
    const r = typeof rand === 'function' ? rand : Math.random;
    if (elevDueShop(run)) return elevFloor('snackstop');
    const pool = ELEV_FLOORS.filter(f => f.kind !== 'shop' && f.id !== run.last);
    const pick = pool[Math.floor(r() * pool.length)] || ELEV_FLOORS[0];
    return pick;
  }

  function elevBeginFloor(run, floorId, rand){
    if (!run) return run;
    const f = elevFloor(floorId) || elevPickFloor(run, rand);
    run.phase = 'floor';
    run.floor = f.id;
    run.last = f.id;
    run.t = f.seconds;
    run.cleared = false;
    run.failed = false;
    run.wantClear = false;
    run.wantFail = false;
    run.holding = null;
    run.seqAt = 0;
    run.painted = [];
    run.shopDone = false;
    run.lit = 1;
    if (f.id === 'chimeorder'){
      const r = typeof rand === 'function' ? rand : Math.random;
      const bells = [0, 1, 2];
      run.seq = [];
      for (let i = 0; i < 3; i++){
        const j = Math.floor(r() * bells.length);
        run.seq.push(bells.splice(j, 1)[0]);
      }
    } else run.seq = [];
    run.quote = (f.emoji || '') + ' ' + f.name + ' — ' + f.hint;
    return run;
  }

  function elevBeginRide(run, rand){
    if (!run) return run;
    const f = elevPickFloor(run, rand);
    const pal = elevPickPal(run, rand);
    if (pal) run.palId = pal.id;
    run.phase = 'ride';
    run.floor = f.id;
    run.t = ELEV_RIDE;
    run.cleared = false;
    run.failed = false;
    run.wantClear = false;
    run.wantFail = false;
    run.hostLine = elevHostLine((run.survived | 0) + 1, rand);
    run.quote = '🛎️ ' + ELEV_HOST.name + ': "' + run.hostLine + '"';
    return run;
  }

  function elevReward(run, floor){
    const f = floor || elevFloor(run && run.floor);
    if (!f) return 0;
    const streak = (run && run.streak) || 0;
    const bonus = Math.min(8, Math.floor(streak / 3));
    const lucky = (run && run.lucky) || 0;
    return f.coins + bonus + lucky;
  }

  function elevMarkSeen(state, id){
    if (!id) return state;
    if (state.seen.indexOf(id) < 0) state.seen.push(id);
    return state;
  }

  function elevClearFloor(state, run){
    state = elevLoad(state);
    if (!run || run.cleared) return {ok:false, why:'done', state, run};
    const f = elevFloor(run.floor);
    if (!f) return {ok:false, why:'floor', state, run};
    if (f.kind === 'shop' && !run.shopDone && (run.t || 0) > 0.05){
      /* waiting in the shop still counts as a safe clear when time runs out */
    }
    const pay = elevReward(run, f);
    run.cleared = true;
    run.failed = false;
    run.wantClear = false;
    run.lucky = 0;
    run.streak = (run.streak | 0) + 1;
    run.survived = (run.survived | 0) + 1;
    run.coins = (run.coins | 0) + pay;
    state.cleared += 1;
    state.coins += pay;
    if (run.streak > state.best) state.best = run.streak;
    elevMarkSeen(state, f.id);
    if (f.kind === 'find') state.found += 1;
    if (f.kind === 'creepy') state.creepy += 1;
    if (f.kind === 'shop') state.shopped += 1;
    run.phase = 'inter';
    run.t = ELEV_INTER;
    run.quote = '✨ Floor cleared! +' + pay + ' 🪙  ·  Streak ' + run.streak;
    return {ok:true, why:'ok', state, run, pay, floor:f};
  }

  function elevFailFloor(state, run){
    state = elevLoad(state);
    if (!run || run.cleared || run.failed) return {ok:false, why:'done', state, run};
    const f = elevFloor(run.floor);
    run.failed = true;
    run.cleared = false;
    run.wantFail = false;
    run.streak = 0;
    run.holding = null;
    run.lucky = 0;
    state.failed += 1;
    if (f) elevMarkSeen(state, f.id);
    run.phase = 'inter';
    run.t = ELEV_INTER;
    run.quote = 'The floor got too wobbly… but everyone is okay! Back in the lift.';
    return {ok:true, why:'ok', state, run, everyoneOkay:true, floor:f};
  }

  function elevBuySnack(state, wallet, run){
    state = elevLoad(state);
    if (!run || run.floor !== 'snackstop') return {ok:false, why:'shop', state, run, wallet};
    if (run.shopDone) return {ok:false, why:'have', state, run, wallet};
    const cost = 8;
    const coins = Math.max(0, wallet | 0);
    if (coins < cost) return {ok:false, why:'coins', state, run, wallet:coins, need: cost - coins};
    run.shopDone = true;
    run.lucky = 4;
    state.shopped += 1;
    return {ok:true, why:'ok', state, run, wallet: coins - cost, spent:cost};
  }

  function elevRing(run, bell){
    if (!run || run.floor !== 'chimeorder' || run.cleared) return {ok:false, why:'floor', run};
    const want = run.seq[run.seqAt];
    if ((bell | 0) !== want){
      run.seqAt = 0;
      return {ok:false, why:'wrong', run};
    }
    run.seqAt += 1;
    if (run.seqAt >= run.seq.length) run.wantClear = true;
    return {ok:true, why: run.wantClear ? 'done' : 'ok', run};
  }

  function elevPaint(run, id){
    if (!run || run.floor !== 'partypaint' || run.cleared) return {ok:false, why:'floor', run};
    const n = id | 0;
    if (run.painted.indexOf(n) < 0) run.painted.push(n);
    if (run.painted.length >= 3) run.wantClear = true;
    return {ok:true, why: run.wantClear ? 'done' : 'ok', run, painted: run.painted.length};
  }

  function elevPickItem(run, item){
    if (!run || run.cleared) return {ok:false, why:'done', run};
    const f = elevFloor(run.floor);
    if (!f || f.kind !== 'find') return {ok:false, why:'floor', run};
    if (item !== 'sock' && item !== 'lunch') return {ok:false, why:'item', run};
    const need = f.id === 'sockhunt' ? 'sock' : 'lunch';
    if (item !== need) return {ok:false, why:'wrong', run};
    run.holding = item;
    return {ok:true, why:'ok', run};
  }

  function elevTurnIn(run){
    if (!run || !run.holding) return {ok:false, why:'empty', run};
    run.wantClear = true;
    return {ok:true, why:'ok', run};
  }

  function elevTouchHazard(run){
    if (!run || run.phase !== 'floor' || run.cleared || run.failed) return run;
    const f = elevFloor(run.floor);
    if (!f) return run;
    if (f.kind === 'survive' || f.kind === 'dodge' || f.kind === 'creepy' || f.id === 'tickletiles') run.wantFail = true;
    return run;
  }

  function elevReachDoor(run){
    if (!run || run.phase !== 'floor' || run.cleared) return run;
    const f = elevFloor(run.floor);
    if (!f) return run;
    if (f.kind === 'obby' || f.kind === 'dodge' || f.kind === 'survive' || f.kind === 'creepy' || f.id === 'tickletiles' || f.id === 'snackstop'){
      if (f.kind === 'find') return run;
      if (f.id === 'chimeorder' || f.id === 'partypaint') return run;
      run.wantClear = true;
    }
    return run;
  }

  function elevStayLit(run, lit){
    if (!run || run.floor !== 'lanternhall' && run.floor !== 'shadowpeek') return run;
    run.lit = lit ? 1 : Math.max(0, (run.lit || 0) - 0.016);
    if (run.lit <= 0) run.wantFail = true;
    return run;
  }

  function elevTick(run, dt){
    if (!run) return run;
    let left = Math.max(0, +dt || 0);
    while (left > 0){
      const step = Math.min(0.2, left);
      left -= step;
      run.t = Math.max(0, (run.t || 0) - step);
      if (run.phase === 'ride' && run.t <= 0){
        elevBeginFloor(run, run.floor);
      } else if (run.phase === 'floor' && run.t <= 0 && !run.cleared && !run.failed){
        const f = elevFloor(run.floor);
        if (f && (f.kind === 'survive' || f.kind === 'dodge' || f.kind === 'shop' || f.id === 'tickletiles')) run.wantClear = true;
        else run.wantFail = true;
        break;
      } else if (run.phase === 'inter' && run.t <= 0){
        elevBeginRide(run);
      }
    }
    return run;
  }

  function elevBadges(state, run){
    state = elevLoad(state);
    const b = [];
    if ((state.rides | 0) >= 1) b.push('elev-ride');
    if ((run && (run.streak | 0) >= 5) || state.best >= 5) b.push('elev-five');
    if ((run && (run.streak | 0) >= 12) || state.best >= 12) b.push('elev-twelve');
    if ((state.creepy | 0) >= 1) b.push('elev-creepy');
    if ((state.found | 0) >= 1) b.push('elev-find');
    return b;
  }

  const api = {
    ELEV_KEY, ELEV_VER, ELEV_SHOP_EVERY, ELEV_RIDE, ELEV_INTER, ELEV_FLOORS, ELEV_PALS, ELEV_HOST,
    elevFloor, elevPal, elevFresh, elevLoad, elevBuddyAllowed, elevNoFight, elevNoGore, elevEveryoneOkay,
    elevHostLine, elevPickPal, elevStartRun, elevDueShop, elevPickFloor, elevBeginFloor, elevBeginRide,
    elevReward, elevClearFloor, elevFailFloor, elevBuySnack, elevRing, elevPaint, elevPickItem, elevTurnIn,
    elevTouchHazard, elevReachDoor, elevStayLit, elevTick, elevBadges
  };
  root.ElevRules = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
