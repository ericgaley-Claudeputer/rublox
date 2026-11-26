/* Pinebell Village — original cozy winter village. Real-player races and snowball fights only. */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.WinterRules = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  const WN_KEY = 'rubloxWinter';
  const WN_VER = 1;
  const WN_COCOA_COST = 5;
  const WN_SNOWMAN = ['base','mid','head','hat','buttons','scarf'];
  const WN_DOOR_H = 4.2;
  const WN_DOOR_W = 3.6;
  const WN_WALL_H = 5.2;
  const WN_COTTAGES = [
    {id:'cocoa', name:"Mugsy's Cocoa", color:'#c45c1a', roof:'#8b2e1a', x:-22, z:10, w:7, d:5.5},
    {id:'blue', name:'Holly Cottage', color:'#3a86ff', roof:'#1d4a8a', x:22, z:22, w:6, d:5},
    {id:'green', name:'Cedar Cottage', color:'#2ec27e', roof:'#1a6b44', x:-22, z:28, w:6, d:5}
  ];
  const WN_DOORS = WN_COTTAGES.map(c => ({
    id:c.id, a:'outside', b:c.id, x:c.x, z:c.z + c.d/2, w:WN_DOOR_W, h:WN_DOOR_H, axis:'z', thick:0.42
  }));
  const WN_HILL = {x:0, w:18, startZ:-82, finishZ:-16, finishW:20, finishD:12, steps:8, stepD:8, startY:13, stepDrop:1.5, platH:1.2, bumpZs:[-58, -36]};
  const WN_POND = {id:'pond', name:'Frostlane Rink', x:20, z:4, r:7.5, w:15, d:15};
  const WN_YARD = {id:'yard', name:'Snow pal yard', x:2, z:30, w:4, d:4};
  const WN_POSTS = [
    {id:'post-1', name:'Post 1', x:4, z:22, w:1.2, d:1.2},
    {id:'post-2', name:'Post 2', x:0, z:22, w:1.2, d:1.2},
    {id:'post-3', name:'Post 3', x:-4, z:24, w:1.2, d:1.2}
  ];
  const WN_LAMP = {id:'lamp', name:'Night lamp', x:0, z:6, w:1.2, d:1.2};
  const WN_WRAP = {id:'wrap', name:'Wrap table', x:6, z:10, w:1.8, d:1.8};
  const WN_SPAWN = {x:0, z:8};
  // GB-6: Snowdrift Fort Field — stack snow blocks into forts, then snowball real friends (or the mitten flags when solo).
  const WN_FORT = {id:'fort', name:'Snowdrift Fort Field', x:0, z:50, w:25.2, d:16.8, cell:1.4, blockH:1.0, maxH:3, maxBlocks:140};
  const WN_FORT_TARGETS = [
    {id:'flag-1', name:'Mitten flag', kind:'flag', x:-6, z:56.4, r:1.2},
    {id:'flag-2', name:'Mitten flag', kind:'flag', x:0, z:57.2, r:1.2},
    {id:'flag-3', name:'Mitten flag', kind:'flag', x:6, z:56.4, r:1.2}
  ];
  // GB-6: Frostlane Star Show — three judges score a five-move skating routine. Pays once per show, a few shows a day.
  const WN_JUDGES = {id:'judges', name:'Star Show judges', x:20, z:-7, w:6, d:1.6};
  const WN_JUDGE_LIST = [
    {id:'hazel', name:'Judge Hazel', emoji:'🦉', likes:'spin'},
    {id:'otto', name:'Judge Otto', emoji:'🐧', likes:'hop'},
    {id:'juniper', name:'Judge Juniper', emoji:'🦌', likes:'spiral'}
  ];
  const WN_SHOW_MOVES = 5;
  const WN_SHOW_T = 45;
  const WN_SHOW_PAID_PER_DAY = 3;
  const WN_SHOW_KINDS = {
    spin:{id:'spin', name:'Pinwheel spin', emoji:'🌀', pts:3},
    hop:{id:'hop', name:'Snowflake hop', emoji:'❄️', pts:3},
    spiral:{id:'spiral', name:'Swan spiral', emoji:'🦢', pts:2}
  };
  // Free-play coins (snowballs, tricks, laps, serving cocoa) share one gentle daily jar so they cannot be farmed forever.
  const WN_FREE_CAP = 40;
  function wnDayKey(now){
    const d = new Date(+now || 0);
    return isFinite(d.getTime()) ? d.toISOString().slice(0, 10) : '1970-01-01';
  }
  function wnFreePay(st, run, want){
    const day = (run && run.day) || wnDayKey(0);
    if (st.freeDay !== day){ st.freeDay = day; st.freeCoins = 0; }
    const pay = Math.max(0, Math.min(want | 0, WN_FREE_CAP - (st.freeCoins | 0)));
    st.freeCoins = (st.freeCoins | 0) + pay;
    return pay;
  }

  function wnBox(o){
    const w = Math.max(0.2, +o.w || (o.r ? o.r * 2 : 1));
    const d = Math.max(0.2, +o.d || (o.r ? o.r * 2 : w));
    return {
      id: o.id, name: o.name, kind: o.kind, x:+o.x||0, z:+o.z||0, w:w, d:d, y:+o.y||0,
      minX: (+o.x||0) - w/2, maxX: (+o.x||0) + w/2,
      minZ: (+o.z||0) - d/2, maxZ: (+o.z||0) + d/2
    };
  }
  function wnHillPlats(){
    const H = WN_HILL, out = [];
    for (let i = 0; i < H.steps; i++){
      out.push(wnBox({id:'hill-'+i, name:'Sledwhistle Hill', kind:'hill', x:H.x, z:H.startZ + i * H.stepD, w:H.w, d:H.stepD, y:H.startY - i * H.stepDrop}));
    }
    out.push(wnBox({id:'hill-finish', name:'Finish', kind:'hill', x:H.x, z:H.finishZ, w:H.finishW, d:H.finishD, y:0.2}));
    return out;
  }
  function wnCottage(id){ return WN_COTTAGES.find(c => c.id === id) || null; }
  function wnLayoutBoxes(){
    const boxes = [];
    wnHillPlats().forEach(b => boxes.push(b));
    WN_COTTAGES.forEach(c => boxes.push(wnBox(Object.assign({kind:'house'}, c))));
    boxes.push(wnBox(Object.assign({kind:'pond'}, WN_POND)));
    boxes.push(wnBox(Object.assign({kind:'yard'}, WN_YARD)));
    WN_POSTS.forEach(p => boxes.push(wnBox(Object.assign({kind:'post'}, p))));
    boxes.push(wnBox(Object.assign({kind:'lamp'}, WN_LAMP)));
    boxes.push(wnBox(Object.assign({kind:'wrap'}, WN_WRAP)));
    boxes.push(wnBox(Object.assign({kind:'fort'}, WN_FORT)));
    boxes.push(wnBox(Object.assign({kind:'judges'}, WN_JUDGES)));
    (WN_LIGHT_SLOTS || []).forEach(s => {
      if (s.kind === 'tree') boxes.push(wnBox(Object.assign({kind:'tree', w:s.w||2.8, d:s.d||2.8}, s)));
    });
    return boxes;
  }
  function wnBoxesOverlap(a, b, gap){
    const g = gap || 0;
    return a.maxX > b.minX + g && a.minX < b.maxX - g && a.maxZ > b.minZ + g && a.minZ < b.maxZ - g;
  }
  function wnLayoutOverlaps(gap){
    const boxes = wnLayoutBoxes();
    const hits = [];
    for (let i = 0; i < boxes.length; i++){
      for (let j = i + 1; j < boxes.length; j++){
        const a = boxes[i], b = boxes[j];
        // hill steps and the finish pad are allowed to touch each other
        if (a.kind === 'hill' && b.kind === 'hill') continue;
        if (wnBoxesOverlap(a, b, gap == null ? 0.8 : gap)) hits.push({a:a.id, b:b.id, nameA:a.name, nameB:b.name});
      }
    }
    return hits;
  }
  function wnInDoorway(x, z, slim){
    const s = slim == null ? 1.2 : slim;
    for (let i = 0; i < WN_DOORS.length; i++){
      const d = WN_DOORS[i];
      if (d.axis === 'z'){
        if (Math.abs(z - d.z) <= s && Math.abs(x - d.x) <= d.w / 2) return d;
      } else if (Math.abs(x - d.x) <= s && Math.abs(z - d.z) <= d.w / 2) return d;
    }
    return null;
  }
  function wnHitWall(x, z){
    const thick = 0.42, doorW = WN_DOOR_W;
    for (let i = 0; i < WN_COTTAGES.length; i++){
      const c = WN_COTTAGES[i];
      const x0 = c.x - c.w/2, x1 = c.x + c.w/2, z0 = c.z - c.d/2, z1 = c.z + c.d/2;
      if (x < x0 - thick || x > x1 + thick || z < z0 - thick || z > z1 + thick) continue;
      const onXWall = (Math.abs(x - x0) <= thick || Math.abs(x - x1) <= thick) && z >= z0 && z <= z1;
      const onZBack = Math.abs(z - z0) <= thick && x >= x0 && x <= x1;
      const onZFront = Math.abs(z - z1) <= thick && x >= x0 && x <= x1;
      if (onZFront && Math.abs(x - c.x) <= doorW / 2) continue;
      if (onXWall || onZBack || onZFront) return c;
    }
    return null;
  }
  function wnWalkableAt(x, z){ return !wnHitWall(x, z); }

  function wnFresh(){
    return {
      v: WN_VER,
      coinsEarned: 0,
      sledBest: 0,
      sledRuns: 0,
      snowmen: 0,
      skateLaps: 0,
      skateTricks: 0,
      cocoaServed: 0,
      snugBought: 0,
      snugServed: 0,
      snowHits: 0,
      snugToppings: [],
      cocoaBought: 0,
      races: 0,
      snowballs: 0,
      lights: 0,
      nightShows: 0,
      wraps: 0,
      wrapBest: 0,
      ribbons: [],
      forts: 0,
      fortHits: 0,
      shows: 0,
      showBest: 0,
      showDay: '',
      showPaid: 0,
      freeDay: '',
      freeCoins: 0
    };
  }

  function wnLoad(raw){
    const o = raw && typeof raw === 'object' ? raw : {};
    const d = wnFresh();
    ['coinsEarned','sledRuns','snowmen','skateLaps','skateTricks','cocoaServed','cocoaBought','snugBought','snugServed','snowHits','races','snowballs','lights','nightShows','wraps','forts','fortHits','shows','showPaid','freeCoins'].forEach(k => {
      d[k] = Math.max(0, o[k] | 0);
    });
    d.sledBest = Math.max(0, +o.sledBest || 0);
    d.wrapBest = Math.max(0, Math.min(100, o.wrapBest | 0));
    d.showBest = Math.max(0, Math.min(30, o.showBest | 0));
    d.showDay = typeof o.showDay === 'string' ? o.showDay.slice(0, 10) : '';
    d.freeDay = typeof o.freeDay === 'string' ? o.freeDay.slice(0, 10) : '';
    d.freeCoins = Math.min(WN_FREE_CAP, d.freeCoins);
    d.ribbons = Array.isArray(o.ribbons) ? o.ribbons.filter(id => typeof id === 'string').slice(0, 12) : [];
    d.snugToppings = Array.isArray(o.snugToppings) ? o.snugToppings.filter(id => typeof id === 'string').slice(0, 8) : [];
    return d;
  }

  function wnNewVisit(state, now){
    return {
      state: wnLoad(state),
      run: {
        area: 'village',
        sled: {on:false, x:0, y:0, z:0, vx:0, vz:0, yaw:0, air:0, t:0, started:0, jumps:0, done:false, time:0, claimed:false},
        snowman: {parts:[]},
        skate: {on:false, laps:0, t:0, lastAng:0, ang:0},
        cocoa: {warm:0, served:0},
        night: false,
        lights: [],
        wrap: {open:false, step:0, paper:'', ribbon:'', bow:'', tag:'', score:0, coop:false, entries:{}},
        snowball: {cool:0, hits:0},
        fort: wnFortFresh(),
        fight: {hits:0, got:0, walls:0},
        show: null,
        day: wnDayKey(now),
        t: 0,
        started: now || 0
      }
    };
  }

  function wnGo(run, area){
    const ok = ['village','hill','pond','cocoa','yard'].indexOf(area) >= 0;
    if (!run || !ok) return {ok:false, why:'area'};
    run.area = area;
    if (area !== 'hill') run.sled.on = false;
    if (area !== 'pond') run.skate.on = false;
    return {ok:true, area};
  }

  function wnSledStart(run, now){
    if (!run) return {ok:false, why:'no'};
    run.area = 'hill';
    run.sled = {on:true, x:0, y:1.2, z:WN_HILL.startZ, vx:0, vz:10, yaw:0, air:0, t:0, started: now || 0, jumps:0, done:false, time:0};
    return {ok:true, why:'ok'};
  }

  function wnSledSteer(run, ax, dt){
    if (!run || !run.sled || !run.sled.on || run.sled.done) return run;
    const a = Math.max(-1, Math.min(1, +ax || 0));
    dt = Math.max(0, Math.min(0.12, +dt || 0));
    run.sled.yaw = Math.max(-0.7, Math.min(0.7, (run.sled.yaw || 0) + a * 1.8 * dt));
    return run;
  }

  function wnSledJump(run){
    if (!run || !run.sled || !run.sled.on || run.sled.done) return {ok:false, why:'sled'};
    if ((run.sled.air || 0) > 0) return {ok:false, why:'air'};
    run.sled.air = 0.7;
    run.sled.jumps = (run.sled.jumps | 0) + 1;
    return {ok:true, why:'ok'};
  }

  function wnSledTick(run, dt){
    if (!run || !run.sled || !run.sled.on || run.sled.done) return run;
    dt = Math.max(0, Math.min(0.12, +dt || 0));
    const s = run.sled;
    s.t = (s.t || 0) + dt;
    s.air = Math.max(0, (s.air || 0) - dt);
    const speed = 14 + (s.air > 0 ? 3 : 0);
    s.vz = speed;
    s.vx = Math.sin(s.yaw || 0) * 9;
    s.x = Math.max(-8, Math.min(8, (s.x || 0) + s.vx * dt));
    s.z = (s.z || 0) + s.vz * dt;
    s.y = s.air > 0 ? 1.2 + Math.sin((0.7 - s.air) / 0.7 * Math.PI) * 1.6 : 1.2;
    // bumps / jump ramps along the hill (not in the village)
    const bumps = WN_HILL.bumpZs || [];
    if (s.air <= 0 && bumps.some(bz => Math.abs(s.z - bz) < 1.2)){
      s.air = 0.55;
      s.jumps = (s.jumps | 0) + 1;
    }
    if (s.x <= -8 || s.x >= 8) s.yaw = (s.yaw || 0) * 0.4;
    if (s.z >= WN_HILL.finishZ){
      s.z = WN_HILL.finishZ;
      s.on = false;
      s.done = true;
      s.time = Math.max(0.1, (s.t || 0));
    }
    return run;
  }

  function wnSledFinish(run, state){
    if (!run || !run.sled || !run.sled.done || !run.sled.time) return {ok:false, why:'race'};
    if (run.sled.claimed) return {ok:true, why:'have', coins:0, already:true, time:+run.sled.time, jumps:run.sled.jumps|0, state: wnLoad(state)};
    run.sled.claimed = true;
    const time = +run.sled.time;
    const jumps = run.sled.jumps | 0;
    const st = wnLoad(state);
    st.sledRuns = (st.sledRuns | 0) + 1;
    if (!st.sledBest || time < st.sledBest) st.sledBest = time;
    const coins = 6 + (time < 8 ? 8 : time < 10 ? 5 : 2) + Math.min(4, jumps);
    st.coinsEarned += coins;
    return {ok:true, why:'ok', time, jumps, coins, best: st.sledBest, state: st, message:'You zoomed down Sledwhistle Hill!'};
  }

  function wnRealPlayers(roster){
    return (roster || []).filter(p => p && (p.id || p.uid) && !p.npc && String(p.id || p.uid).indexOf('npc-') !== 0 && p.bot !== true);
  }

  function wnSledRace(entries, roster){
    const realIds = new Set(wnRealPlayers(roster).map(p => String(p.id || p.uid)));
    const rows = (entries || []).filter(e => e && e.id && (realIds.size ? realIds.has(String(e.id)) : String(e.id).indexOf('npc-') !== 0 && !e.npc));
    if (rows.some(e => e.npc)) return {ok:false, why:'npc'};
    if (!rows.length) return {ok:false, why:'empty'};
    const ranked = rows.slice().sort((a, b) => (+a.time || 99) - (+b.time || 99));
    return {ok:true, why:'ok', ranked, winner: ranked[0]};
  }

  function wnCanPelt(fromId, toId, roster){
    if (!fromId || !toId || String(fromId) === String(toId)) return false;
    if (String(toId).indexOf('npc') === 0 || String(toId) === 'npc') return false;
    const real = wnRealPlayers(roster);
    const ids = real.map(p => String(p.id || p.uid));
    return ids.indexOf(String(fromId)) >= 0 && ids.indexOf(String(toId)) >= 0;
  }

  function wnThrowSnowball(run, state, fromId, toId, roster){
    if (!run) return {ok:false, why:'no'};
    if ((run.snowball && run.snowball.cool || 0) > 0) return {ok:false, why:'cool'};
    const vsPlayer = wnCanPelt(fromId, toId, roster);
    const practice = !toId || toId === 'practice' || toId === 'post';
    if (!vsPlayer && !practice) return {ok:false, why:'npc'};
    run.snowball = run.snowball || {cool:0, hits:0};
    run.snowball.cool = 0.45;
    const st = wnLoad(state);
    st.snowballs = (st.snowballs | 0) + 1;
    let coins = 0;
    if (vsPlayer){
      run.snowball.hits = (run.snowball.hits | 0) + 1;
      coins = wnFreePay(st, run, 2);
      st.coinsEarned += coins;
    } else if (practice){
      coins = wnFreePay(st, run, 1);
      st.coinsEarned += coins;
    }
    return {ok:true, why: vsPlayer ? 'hit' : 'practice', coins, state: st, fight: !!vsPlayer, capped: coins === 0};
  }

  function wnSnowballTick(run, dt){
    if (!run || !run.snowball) return run;
    run.snowball.cool = Math.max(0, (run.snowball.cool || 0) - dt);
    return run;
  }

  function wnAddSnowmanPart(run, part){
    if (!run) return {ok:false, why:'no'};
    const need = WN_SNOWMAN[(run.snowman.parts || []).length];
    if (!need) return {ok:false, why:'done'};
    if (part && part !== need) return {ok:false, why:'order', need};
    run.snowman.parts = (run.snowman.parts || []).concat([need]);
    const done = run.snowman.parts.length === WN_SNOWMAN.length;
    return {ok:true, why: done ? 'done' : 'part', done, parts: run.snowman.parts.slice(), need: done ? null : WN_SNOWMAN[run.snowman.parts.length]};
  }

  function wnFinishSnowman(run, state){
    if (!run || !run.snowman || (run.snowman.parts || []).length < WN_SNOWMAN.length) return {ok:false, why:'parts'};
    if (run.snowman.claimed) return {ok:true, why:'have', coins:0, state: wnLoad(state)};
    run.snowman.claimed = true;
    const st = wnLoad(state);
    st.snowmen = (st.snowmen | 0) + 1;
    const coins = 10;
    st.coinsEarned += coins;
    return {ok:true, why:'ok', coins, state: st, message:'Your Pinebell snow pal is complete!'};
  }

  function wnSkateStart(run){
    if (!run) return {ok:false, why:'no'};
    run.area = 'pond';
    run.skate = {on:true, laps:0, t:0, lastAng:0, ang:0, crossed:true, tricks:0, trickT:0, trick:''};
    return {ok:true, why:'ok'};
  }

  function wnSkateTick(run, ax, az, dt){
    if (!run || !run.skate || !run.skate.on) return run;
    dt = Math.max(0, Math.min(0.12, +dt || 0));
    const s = run.skate;
    s.t = (s.t || 0) + dt;
    const ang = Math.atan2(az || 0, ax || 0);
    if (isFinite(ang)){
      let d = ang - (s.lastAng || 0);
      while (d > Math.PI) d -= Math.PI * 2;
      while (d < -Math.PI) d += Math.PI * 2;
      s.ang = (s.ang || 0) + d;
      s.lastAng = ang;
      if (Math.abs(s.ang) >= Math.PI * 2){
        s.ang = 0;
        s.laps = (s.laps | 0) + 1;
      }
    }
    if ((s.trickT || 0) > 0) s.trickT = Math.max(0, s.trickT - dt);
    return run;
  }

  function wnOnRink(x, z){
    const p = WN_POND;
    return Math.hypot((x||0) - p.x, (z||0) - p.z) <= (p.r || 7.5) + 0.45;
  }
  function wnSkateTrick(run, state){
    if (!run || !run.skate || !run.skate.on) return {ok:false, why:'skate'};
    if ((run.skate.trickT || 0) > 0) return {ok:false, why:'wait'};
    const names = ['Bell twirl', 'Pinebell spin', 'Ribbon spiral'];
    const name = names[(run.skate.tricks || 0) % names.length];
    run.skate.trick = name;
    run.skate.trickT = 0.85;
    run.skate.tricks = (run.skate.tricks | 0) + 1;
    const st = wnLoad(state);
    st.skateTricks = (st.skateTricks | 0) + 1;
    const coins = wnFreePay(st, run, 2);
    st.coinsEarned += coins;
    return {ok:true, why:'ok', name, coins, state: st, tricks: run.skate.tricks, capped: coins === 0};
  }

  function wnSkateBank(run, state){
    if (!run || !run.skate) return {ok:false, why:'no'};
    const laps = run.skate.laps | 0;
    if (!laps || run.skate.banked === laps) return {ok:false, why:'laps'};
    const add = laps - (run.skate.banked | 0);
    run.skate.banked = laps;
    const st = wnLoad(state);
    st.skateLaps = (st.skateLaps | 0) + add;
    const coins = wnFreePay(st, run, add * 3);
    st.coinsEarned += coins;
    return {ok:true, why:'ok', laps: add, coins, state: st, capped: coins === 0};
  }

  function wnBuyCocoa(state, coins){
    const st = wnLoad(state);
    if ((coins | 0) < WN_COCOA_COST) return {ok:false, why:'coins', state: st, coins: coins | 0};
    st.cocoaBought = (st.cocoaBought | 0) + 1;
    return {ok:true, why:'ok', state: st, coins: (coins | 0) - WN_COCOA_COST, cost: WN_COCOA_COST, warm: 20};
  }

  function wnServeCocoa(run, state){
    if (!run) return {ok:false, why:'no'};
    run.cocoa = run.cocoa || {warm:0, served:0};
    run.cocoa.served = (run.cocoa.served | 0) + 1;
    const st = wnLoad(state);
    st.cocoaServed = (st.cocoaServed | 0) + 1;
    const coins = wnFreePay(st, run, 4);
    st.coinsEarned += coins;
    return {ok:true, why:'ok', coins, state: st, served: run.cocoa.served, message:'A warm mug for a chilly visitor!'};
  }

  const WN_SNUG = {id:'snugmug', name:'Snugmug Cart', x:28, z:12, r:2.5};
  const WN_SNUG_COST = 4;
  const WN_TOPPINGS = [
    {id:'cloud', name:'Whipped cloud', emoji:'☁️', warm:4},
    {id:'mallow', name:'Marshmallow puffs', emoji:'🤍', warm:5},
    {id:'peppermint', name:'Peppermint sparkle', emoji:'🍬', warm:6},
    {id:'cinnamon', name:'Cinnamon snow', emoji:'✨', warm:5}
  ];
  function wnTopping(id){ return WN_TOPPINGS.find(t => t.id === id) || WN_TOPPINGS[0]; }
  function wnSnugBuy(state, coins, toppingId){
    const top = wnTopping(toppingId);
    const st = wnLoad(state);
    if ((coins | 0) < WN_SNUG_COST) return {ok:false, why:'coins', state: st, coins: coins | 0, cost: WN_SNUG_COST};
    st.snugBought = (st.snugBought | 0) + 1;
    st.snugToppings = Array.isArray(st.snugToppings) ? st.snugToppings.slice() : [];
    if (st.snugToppings.indexOf(top.id) < 0) st.snugToppings.push(top.id);
    return {ok:true, why:'ok', state: st, coins: (coins | 0) - WN_SNUG_COST, cost: WN_SNUG_COST, warm: 14 + (top.warm || 0), topping: top, message: 'A ' + top.name + ' Snugmug cocoa warms you right up!'};
  }
  function wnSnugServe(run, state, toppingId){
    if (!run) return {ok:false, why:'no', state: wnLoad(state)};
    const top = wnTopping(toppingId);
    run.snug = run.snug || {served:0};
    run.snug.served = (run.snug.served | 0) + 1;
    const st = wnLoad(state);
    st.snugServed = (st.snugServed | 0) + 1;
    const coins = wnFreePay(st, run, 3);
    st.coinsEarned += coins;
    return {ok:true, why:'ok', coins, state: st, topping: top, served: run.snug.served, message: 'You slid a ' + top.name + ' cocoa to a chilly skater!'};
  }
  const WN_TARGETS = [
    {id:'can-1', name:'Tin can', kind:'can', x:8, z:20, r:1.1},
    {id:'can-2', name:'Tin can', kind:'can', x:10, z:21, r:1.1},
    {id:'can-3', name:'Tin can', kind:'can', x:9, z:23, r:1.1},
    {id:'puff-1', name:'Puff pal', kind:'snowman', x:14, z:22, r:1.5},
    {id:'puff-2', name:'Puff pal', kind:'snowman', x:16, z:20, r:1.5}
  ];
  function wnThrowAimed(run, state, fromId, origin, dir, roster, extras, fort){
    if (!run) return {ok:false, why:'no'};
    if ((run.snowball && run.snowball.cool || 0) > 0) return {ok:false, why:'cool'};
    const ox = (origin && +origin.x) || 0, oz = (origin && +origin.z) || 0;
    let dx = (dir && dir.x) || 0, dz = (dir && dir.z);
    if (!Number.isFinite(dz)) dz = -1;
    const len = Math.hypot(dx, dz) || 1;
    const ux = dx / len, uz = dz / len;
    const range = 12;
    let best = 99, hit = null, fight = false;
    (wnRealPlayers(roster) || []).forEach(p => {
      if (String(p.id || p.uid) === String(fromId)) return;
      const px = +p.x, pz = +p.z;
      if (!Number.isFinite(px) || !Number.isFinite(pz)) return;
      const t = (px - ox) * ux + (pz - oz) * uz;
      if (t < 0.5 || t > range) return;
      const dist = Math.hypot(px - (ox + ux * t), pz - (oz + uz * t));
      if (dist <= 1.4 && t < best){ best = t; hit = p; fight = true; }
    });
    (extras || WN_TARGETS).forEach(tg => {
      const t = ((tg.x||0) - ox) * ux + ((tg.z||0) - oz) * uz;
      if (t < 0.5 || t > range) return;
      const dist = Math.hypot((tg.x||0) - (ox + ux * t), (tg.z||0) - (oz + uz * t));
      if (dist <= (tg.r || 1.2) && t < best){ best = t; hit = tg; fight = false; }
    });
    run.snowball = run.snowball || {cool:0, hits:0, targetHits:0};
    run.snowball.cool = 0.5;
    const st = wnLoad(state);
    st.snowballs = (st.snowballs | 0) + 1;
    const wallAt = fort ? wnFortRay(fort, ox, oz, ux, uz, Math.min(range, best), 0.9) : null;
    if (wallAt != null){
      run.fight = run.fight || {hits:0, got:0, walls:0};
      run.fight.walls = (run.fight.walls | 0) + 1;
      return {ok:true, why:'wall', coins:0, state: st, fight:false, shot:{x:ox, z:oz, dx:ux, dz:uz, t:0, life:0.7, hitAt: wallAt}, giggle:true, wall:true, message:'Thud! The snowball poofs on the fort wall.'};
    }
    const shot = {x:ox, z:oz, dx:ux, dz:uz, t:0, life: 0.7, hitAt: hit ? best : range};
    if (!hit) return {ok:true, why:'miss', coins:0, state: st, fight:false, shot, giggle:false};
    const coins = wnFreePay(st, run, fight ? 2 : 1);
    if (fight){
      run.snowball.hits = (run.snowball.hits | 0) + 1; st.snowHits = (st.snowHits | 0) + 1;
      run.fight = run.fight || {hits:0, got:0, walls:0};
      run.fight.hits = (run.fight.hits | 0) + 1;
      if (fort && wnInFort(ox, oz)) st.fortHits = (st.fortHits | 0) + 1;
    }
    else run.snowball.targetHits = (run.snowball.targetHits | 0) + 1;
    st.coinsEarned += coins;
    return {ok:true, why: fight ? 'hit' : 'target', coins, capped: coins === 0, state: st, fight, target: fight ? null : hit, toId: fight ? String(hit.id || hit.uid) : null, name: hit.name, shot, giggle: true, message: fight ? 'Poof! Your friend giggles and shakes off the snow.' : ('Poof! The ' + (hit.name || 'target') + ' wobbles and a little giggle rings out.')};
  }


  const WN_LIGHT_SLOTS = [
    {id:'cottage-a', kind:'house', name:'Cedar Cottage', x:-22, z:28},
    {id:'cottage-b', kind:'house', name:'Holly Cottage', x:22, z:22},
    {id:'cocoa', kind:'house', name:"Mugsy's Cocoa", x:-22, z:10},
    {id:'tree-a', kind:'tree', name:'Village Fir', x:-10, z:16, w:2.8, d:2.8},
    {id:'tree-b', kind:'tree', name:'Pond Pine', x:28, z:-12, w:2.8, d:2.8},
    {id:'tree-c', kind:'tree', name:'Hill Spruce', x:14, z:-40, w:2.8, d:2.8},
    {id:'tree-d', kind:'tree', name:'Lane Larch', x:-16, z:-20, w:2.8, d:2.8},
    {id:'tree-e', kind:'tree', name:'Square Spruce', x:8, z:0, w:2.8, d:2.8}
  ];
  function wnPlaceLabels(){
    const labs = [];
    function add(id, name, x, z, y, anchor){
      if (labs.some(l => l.name === name || l.id === id)) return;
      labs.push({id:id, name:name, x:x, z:z, y:y == null ? 3.2 : y, anchor:anchor || id});
    }
    add('hill', 'Sledwhistle Hill', WN_HILL.x, WN_HILL.startZ, WN_HILL.startY + 2, 'hill-0');
    add('finish', 'Finish', WN_HILL.x, WN_HILL.finishZ, 2.2, 'hill-finish');
    add('village', 'Pinebell Village', 0, -2, 3.6, 'plaza');
    WN_COTTAGES.forEach(c => add(c.id, c.name, c.x, c.z + c.d/2 + 0.8, 3.4, c.id));
    add('pond', WN_POND.name, WN_POND.x, WN_POND.z - 4.2, 2.4, 'pond');
    add('yard', WN_YARD.name, WN_YARD.x, WN_YARD.z + 2.2, 2.2, 'yard');
    WN_POSTS.forEach(p => add(p.id, p.name, p.x, p.z, 2.0, p.id));
    add('tosses', 'Practice tosses', -2, 26, 2.6, 'posts');
    add('lamp', WN_LAMP.name, WN_LAMP.x, WN_LAMP.z, 4.0, 'lamp');
    add('wrap', WN_WRAP.name, WN_WRAP.x, WN_WRAP.z, 1.8, 'wrap');
    add('fort', WN_FORT.name, WN_FORT.x, WN_FORT.z - 6.5, 2.6, 'fort');
    add('judges', WN_JUDGES.name, WN_JUDGES.x, WN_JUDGES.z - 1.4, 4.7, 'judges');
    WN_LIGHT_SLOTS.forEach(s => {
      if (s.kind === 'tree') add(s.id, s.name, s.x, s.z, 3.5, s.id);
    });
    return labs;
  }
  function wnVisibleLabels(px, pz, maxN, maxDist){
    const all = wnPlaceLabels();
    const n = maxN == null ? 6 : maxN;
    const far = maxDist == null ? 32 : maxDist;
    const ranked = all.map(l => Object.assign({}, l, {dist: Math.hypot((px||0) - l.x, (pz||0) - l.z)}))
      .filter(l => l.dist <= far)
      .sort((a, b) => a.dist - b.dist);
    const out = [];
    ranked.forEach(l => {
      if (out.length >= n && l.dist > 10) return;
      const pile = out.some(o => Math.hypot(o.x - l.x, o.z - l.z) < 4);
      if (pile && l.dist > 8) return;
      if (out.length < n || l.dist <= 10) out.push(l);
    });
    return out.slice(0, Math.max(n, out.filter(l => l.dist <= 10).length));
  }
  const WN_PAPERS = [
    {id:'snow', name:'Snowy White', color:'#f6fbff'},
    {id:'cranberry', name:'Cranberry', color:'#c44536'},
    {id:'pine', name:'Pine Green', color:'#2d6a4f'},
    {id:'gold', name:'Candle Gold', color:'#f2c14e'},
    {id:'sky', name:'Winter Sky', color:'#8ecae6'}
  ];
  const WN_RIBBON_COLORS = [
    {id:'red', name:'Holly Red', color:'#d62828'},
    {id:'gold', name:'Bell Gold', color:'#f4d35e'},
    {id:'blue', name:'Ice Blue', color:'#4ea8de'},
    {id:'pink', name:'Cocoa Pink', color:'#f7a1c4'}
  ];
  const WN_BOWS = [
    {id:'classic', name:'Classic bow'},
    {id:'puff', name:'Puffy bow'},
    {id:'star', name:'Star bow'},
    {id:'tiny', name:'Tiny knot'}
  ];
  const WN_TAGS = [
    {id:'toyou', name:'To You'},
    {id:'warm', name:'Stay Warm'},
    {id:'joy', name:'Pinebell Joy'},
    {id:'pal', name:'For a Pal'}
  ];
  const WN_WRAP_STEPS = ['paper','ribbon','bow','tag'];
  const WN_WRAP_JUDGE = {id:'rue', name:'Ribbon Rue', emoji:'🎀', role:'judge'};

  function wnLightSlot(id){ return WN_LIGHT_SLOTS.find(s => s.id === id) || null; }

  function wnSetNight(run, on){
    run = run || {};
    run.night = !!on;
    return {ok:true, run, night: run.night, message: run.night ? 'Night falls on Pinebell. The lights can sparkle!' : 'Morning comes back to the village.'};
  }

  function wnPlaceLight(state, run, slotId){
    state = wnLoad(state);
    run = run || {};
    if (!run.lights) run.lights = [];
    const slot = wnLightSlot(slotId);
    if (!slot) return {ok:false, why:'slot', state, run, message:'That spot cannot hold lights.'};
    if (run.lights.indexOf(slotId) >= 0) return {ok:false, why:'has', state, run, message:'Lights already twinkle there!'};
    run.lights.push(slotId);
    state.lights = Math.max(state.lights | 0, run.lights.length);
    return {ok:true, state, run, slot, placed: run.lights.length, message:'Twinkly lights for ' + slot.name + '!'};
  }

  function wnShowLights(state, run){
    state = wnLoad(state);
    run = run || {};
    if (!(run.lights && run.lights.length)) return {ok:false, why:'none', state, run, message:'Hang some lights first, then switch to night!'};
    if (!run.night) run.night = true;
    state.nightShows = (state.nightShows | 0) + 1;
    return {ok:true, state, run, night:true, message:'The village glows! ' + run.lights.length + ' sparkling spots.'};
  }

  function wnWrapOpen(run, coop){
    run = run || {};
    run.wrap = {open:true, step:0, paper:'', ribbon:'', bow:'', tag:'', score:0, coop:!!coop, entries:{}};
    return {ok:true, run, message: coop ? 'Wrap together — everyone helps with a step!' : 'Pick paper, ribbon, a bow, and a tag!'};
  }

  function wnWrapPick(run, part, id, playerId){
    run = run || {};
    const w = run.wrap || wnWrapOpen(run).run.wrap;
    if (!w.open) return {ok:false, why:'closed', run};
    const lists = {paper:WN_PAPERS, ribbon:WN_RIBBON_COLORS, bow:WN_BOWS, tag:WN_TAGS};
    const list = lists[part];
    if (!list || !list.some(it => it.id === id)) return {ok:false, why:'item', run};
    const stepName = WN_WRAP_STEPS[w.step | 0];
    if (part !== stepName) return {ok:false, why:'step', run, need: stepName, message:'Next, pick a ' + stepName + '.'};
    w[part] = id;
    if (playerId) (w.entries[playerId] = w.entries[playerId] || []).push(part);
    w.step = (w.step | 0) + 1;
    run.wrap = w;
    const done = w.step >= WN_WRAP_STEPS.length;
    return {ok:true, run, wrap:w, done, message: done ? 'All wrapped! Time for Ribbon Rue to score it.' : ('Nice ' + part + '! Next: ' + WN_WRAP_STEPS[w.step] + '.')};
  }

  function wnWrapScoreLook(wrap){
    const w = wrap || {};
    let score = 40;
    if (w.paper) score += 12;
    if (w.ribbon) score += 12;
    if (w.bow) score += 12;
    if (w.tag) score += 12;
    // matching color families feel festive
    if ((w.paper === 'cranberry' && w.ribbon === 'gold') || (w.paper === 'pine' && w.ribbon === 'red') || (w.paper === 'gold' && w.ribbon === 'gold') || (w.paper === 'snow' && w.ribbon === 'blue')) score += 10;
    if (w.bow === 'star' && (w.tag === 'joy' || w.paper === 'gold')) score += 6;
    if (w.tag && w.bow && w.paper && w.ribbon) score += 4;
    return Math.max(0, Math.min(100, score));
  }

  function wnWrapJudge(state, run, entries){
    state = wnLoad(state);
    run = run || {};
    const w = run.wrap || {};
    if (!w.open || w.step < WN_WRAP_STEPS.length) return {ok:false, why:'unfinished', state, run, message:'Finish paper, ribbon, bow, and tag first.'};
    const score = wnWrapScoreLook(w);
    w.score = score;
    w.open = false;
    run.wrap = w;
    state.wraps = (state.wraps | 0) + 1;
    if (score > (state.wrapBest | 0)) state.wrapBest = score;
    let ribbon = null;
    if (score >= 95) ribbon = 'star-ribbon';
    else if (score >= 85) ribbon = 'gold-ribbon';
    else if (score >= 70) ribbon = 'holly-ribbon';
    if (ribbon && state.ribbons.indexOf(ribbon) < 0) state.ribbons.push(ribbon);
    const coins = score >= 95 ? 8 : score >= 85 ? 6 : score >= 70 ? 4 : 2;
    const judge = WN_WRAP_JUDGE;
    const vs = wnWrapCompete(entries || w.contest || null, score);
    return {
      ok:true, state, run, score, ribbon, coins, judge,
      message: judge.emoji + ' ' + judge.name + ' scores ' + score + '!' + (ribbon ? ' You earned a ' + ribbon.replace('-', ' ') + '!' : ' A cozy wrap!'),
      contest: vs
    };
  }

  function wnWrapCompete(entries, myScore){
    // Real players only. entries: [{id, name, score}] 
    const list = (entries || []).filter(e => e && e.id && !e.npc);
    if (!list.length) return {mode:'solo', winner:null, scores:[{id:'you', name:'You', score:myScore|0}]};
    const scores = list.map(e => ({id:e.id, name:e.name || 'Player', score:e.score|0})).sort((a,b) => b.score - a.score);
    return {mode: list.length > 1 ? 'compete' : 'coop', winner: scores[0], scores};
  }

  /* ---- GB-6: Snowdrift Fort Field (snow blocks) ---- */
  function wnFortDims(){
    const F = WN_FORT;
    return {cols: Math.round(F.w / F.cell), rows: Math.round(F.d / F.cell), x0: F.x - F.w / 2, z0: F.z - F.d / 2, cell: F.cell};
  }
  function wnFortFresh(){ return {cells:{}, n:0, rev:0}; }
  function wnInFort(x, z){
    const F = WN_FORT;
    return Math.abs((x||0) - F.x) <= F.w / 2 && Math.abs((z||0) - F.z) <= F.d / 2;
  }
  function wnFortCell(x, z){
    if (!wnInFort(x, z)) return null;
    const D = wnFortDims();
    const i = Math.max(0, Math.min(D.cols - 1, Math.floor(((x||0) - D.x0) / D.cell)));
    const j = Math.max(0, Math.min(D.rows - 1, Math.floor(((z||0) - D.z0) / D.cell)));
    return {i, j};
  }
  function wnFortCenter(i, j){
    const D = wnFortDims();
    return {x: D.x0 + (i + 0.5) * D.cell, z: D.z0 + (j + 0.5) * D.cell};
  }
  function wnFortH(fort, i, j){ return (fort && fort.cells && fort.cells[i + ',' + j]) | 0; }
  function wnFortAim(x, z, dx, dz){
    const len = Math.hypot(dx || 0, dz || 0) || 1;
    return wnFortCell((x||0) + (dx||0) / len * 1.6, (z||0) + (dz||0) / len * 1.6);
  }
  function wnFortPlace(fort, x, z, dx, dz){
    if (!fort) return {ok:false, why:'no'};
    if (!wnInFort(x, z)) return {ok:false, why:'field'};
    const c = wnFortAim(x, z, dx, dz);
    if (!c) return {ok:false, why:'edge'};
    const ctr = wnFortCenter(c.i, c.j);
    const half = WN_FORT.cell / 2 + 0.4;
    if (Math.abs((x||0) - ctr.x) < half && Math.abs((z||0) - ctr.z) < half) return {ok:false, why:'you'};
    if (WN_FORT_TARGETS.some(t => Math.hypot(t.x - ctr.x, t.z - ctr.z) < (t.r || 1.2) + 0.9)) return {ok:false, why:'target'};
    const h = wnFortH(fort, c.i, c.j);
    if (h >= WN_FORT.maxH) return {ok:false, why:'tall', i:c.i, j:c.j, h};
    if ((fort.n | 0) >= WN_FORT.maxBlocks) return {ok:false, why:'full'};
    return wnFortSet(fort, c.i, c.j, h + 1);
  }
  function wnFortScoop(fort, x, z, dx, dz){
    if (!fort) return {ok:false, why:'no'};
    if (!wnInFort(x, z)) return {ok:false, why:'field'};
    const c = wnFortAim(x, z, dx, dz);
    if (!c) return {ok:false, why:'edge'};
    const h = wnFortH(fort, c.i, c.j);
    if (!h) return {ok:false, why:'empty', i:c.i, j:c.j};
    return wnFortSet(fort, c.i, c.j, h - 1);
  }
  function wnFortSet(fort, i, j, h){
    const D = wnFortDims();
    i = i | 0; j = j | 0; h = Math.max(0, Math.min(WN_FORT.maxH, h | 0));
    if (i < 0 || j < 0 || i >= D.cols || j >= D.rows) return {ok:false, why:'edge'};
    fort.cells = fort.cells || {};
    const k = i + ',' + j, was = fort.cells[k] | 0;
    if (h > was && (fort.n | 0) + (h - was) > WN_FORT.maxBlocks) return {ok:false, why:'full'};
    if (h) fort.cells[k] = h; else delete fort.cells[k];
    fort.n = Math.max(0, (fort.n | 0) + (h - was));
    fort.rev = (fort.rev | 0) + 1;
    const c = wnFortCenter(i, j);
    return {ok:true, why: h > was ? 'add' : 'scoop', i, j, h, was, x:c.x, z:c.z, n:fort.n};
  }
  // ray-march across the grid; snowballs fly about one block high, so any block stops them
  function wnFortRay(fort, ox, oz, ux, uz, range, minT){
    if (!fort || !fort.n) return null;
    for (let t = minT == null ? 0.9 : minT; t <= range; t += 0.2){
      const c = wnFortCell(ox + ux * t, oz + uz * t);
      if (c && wnFortH(fort, c.i, c.j) > 0) return t;
    }
    return null;
  }
  function wnFortWire(fort){
    return Object.keys((fort && fort.cells) || {}).map(k => k + ',' + (fort.cells[k] | 0)).join(';');
  }
  function wnFortUnwire(str){
    const fort = wnFortFresh();
    String(str || '').split(';').slice(0, 400).forEach(p => {
      const a = p.split(',').map(n => parseInt(n, 10));
      if (a.length === 3 && a.every(Number.isFinite)) wnFortSet(fort, a[0], a[1], a[2]);
    });
    return fort;
  }
  function wnFortBank(state, placed){
    const st = wnLoad(state);
    st.forts = (st.forts | 0) + Math.max(0, placed | 0);
    return st;
  }
  function wnGotHit(run){
    if (!run) return run;
    run.fight = run.fight || {hits:0, got:0, walls:0};
    run.fight.got = (run.fight.got | 0) + 1;
    return run;
  }

  /* ---- GB-6: Frostlane Star Show (judges) ---- */
  function wnShowStart(run, now){
    if (!run) return {ok:false, why:'no'};
    if (run.show && run.show.on) return {ok:false, why:'on'};
    run.show = {on:true, id: (run.showN = (run.showN | 0) + 1), t:0, moves:[], cool:0, done:false, claimed:false, started: now || 0};
    if (!run.skate || !run.skate.on) wnSkateStart(run);
    return {ok:true, why:'ok', id: run.show.id};
  }
  function wnShowMove(run, kind, opts){
    const s = run && run.show;
    if (!s || !s.on || s.done) return {ok:false, why:'show'};
    const K = WN_SHOW_KINDS[kind];
    if (!K) return {ok:false, why:'kind'};
    if (opts && opts.onIce === false) return {ok:false, why:'ice'};
    if ((s.cool || 0) > 0) return {ok:false, why:'wait'};
    const prev = s.moves.length ? s.moves[s.moves.length - 1].k : '';
    let pts = K.pts;
    if (opts && (+opts.speed || 0) >= 2) pts += 1;
    if (prev && prev !== kind) pts += 1;
    s.moves.push({k: kind, pts});
    s.cool = 0.7;
    if (s.moves.length >= WN_SHOW_MOVES) s.done = true;
    return {ok:true, why:'move', move:K, pts, n:s.moves.length, left: WN_SHOW_MOVES - s.moves.length, done: s.done};
  }
  function wnShowTick(run, dt){
    const s = run && run.show;
    if (!s || !s.on || s.done) return run;
    dt = Math.max(0, Math.min(0.2, +dt || 0));
    s.t = (s.t || 0) + dt;
    s.cool = Math.max(0, (s.cool || 0) - dt);
    if (s.t >= WN_SHOW_T) s.done = true;
    return run;
  }
  function wnShowScores(moves){
    const list = moves || [];
    const total = list.reduce((n, m) => n + (m.pts | 0), 0);
    const maxTotal = WN_SHOW_MOVES * 5;
    return WN_JUDGE_LIST.map(j => {
      const liked = list.some(m => m.k === j.likes) ? 1 : 0;
      const score = Math.max(1, Math.min(10, 3 + Math.round(total * 6 / maxTotal) + liked));
      return {id:j.id, name:j.name, emoji:j.emoji, score};
    });
  }
  function wnShowJudge(run, state){
    const s = run && run.show;
    if (!s || !s.on) return {ok:false, why:'show', state: wnLoad(state)};
    if (s.claimed) return {ok:true, why:'have', already:true, coins:0, state: wnLoad(state), scores: s.scores || [], sum: s.sum | 0};
    if (!s.moves.length) return {ok:false, why:'moves', state: wnLoad(state)};
    s.done = true;
    s.claimed = true;
    const scores = wnShowScores(s.moves);
    const sum = scores.reduce((n, j) => n + j.score, 0);
    s.scores = scores; s.sum = sum;
    const st = wnLoad(state);
    const day = run.day || wnDayKey(0);
    if (st.showDay !== day){ st.showDay = day; st.showPaid = 0; }
    st.shows = (st.shows | 0) + 1;
    const best = sum > (st.showBest | 0);
    st.showBest = Math.max(st.showBest | 0, sum);
    const medal = sum >= 26 ? {id:'gold', name:'Gold star', emoji:'🥇'} : sum >= 18 ? {id:'silver', name:'Silver star', emoji:'🥈'} : {id:'bronze', name:'Bronze ribbon', emoji:'🥉'};
    let coins = 0, capped = false;
    if ((st.showPaid | 0) < WN_SHOW_PAID_PER_DAY){
      coins = 3 + Math.floor(sum / 5);
      st.showPaid = (st.showPaid | 0) + 1;
      st.coinsEarned += coins;
    } else capped = true;
    s.on = false;
    return {ok:true, why:'judged', coins, capped, scores, sum, best, medal, state: st, message: medal.emoji + ' ' + medal.name + '! The judges hold up ' + scores.map(j => j.score).join(', ') + '.'};
  }
  function wnShowQuit(run){
    if (run && run.show){ run.show.on = false; run.show.done = true; }
    return run;
  }

  function wnRealPlayersOnly(roster){
    return (roster || []).filter(p => p && p.id && !p.npc);
  }

  function wnWire(state, run){
    state = wnLoad(state);
    run = run || {};
    return {
      coinsEarned: state.coinsEarned,
      sledBest: state.sledBest,
      area: run.area || 'village',
      sled: run.sled ? {on:!!run.sled.on, x:+run.sled.x||0, z:+run.sled.z||0, yaw:+run.sled.yaw||0, done:!!run.sled.done, time:+run.sled.time||0, claimed:!!run.sled.claimed} : null,
      snowman: run.snowman ? {parts:(run.snowman.parts||[]).slice(), claimed:!!run.snowman.claimed} : null,
      skate: run.skate ? {on:!!run.skate.on, laps:run.skate.laps|0} : null,
      night: !!run.night,
      lights: (run.lights || []).slice(),
      wrap: run.wrap ? {open:!!run.wrap.open, step:run.wrap.step|0, score:run.wrap.score|0, coop:!!run.wrap.coop} : null,
      fortRev: run.fort ? (run.fort.rev | 0) : 0,
      lightsHung: state.lights|0,
      wrapBest: state.wrapBest|0
    };
  }

  return {
    WN_KEY, WN_VER, WN_COCOA_COST, WN_SNOWMAN, WN_DOOR_H, WN_DOOR_W, WN_WALL_H, WN_COTTAGES, WN_DOORS,
    wnFresh, wnLoad, wnNewVisit, wnGo,
    wnSledStart, wnSledSteer, wnSledJump, wnSledTick, wnSledFinish, wnSledRace,
    wnRealPlayers, wnCanPelt, wnThrowSnowball, wnSnowballTick,
    wnAddSnowmanPart, wnFinishSnowman,
    wnSkateStart, wnSkateTick, wnSkateBank, wnOnRink, wnSkateTrick,
    wnBuyCocoa, wnServeCocoa, WN_SNUG, WN_SNUG_COST, WN_TOPPINGS, wnTopping, wnSnugBuy, wnSnugServe,
    WN_TARGETS, wnThrowAimed, wnWire,
    WN_LIGHT_SLOTS, WN_PAPERS, WN_RIBBON_COLORS, WN_BOWS, WN_TAGS, WN_WRAP_STEPS, WN_WRAP_JUDGE,
    WN_HILL, WN_POND, WN_YARD, WN_POSTS, WN_LAMP, WN_WRAP, WN_SPAWN,
    wnBox, wnHillPlats, wnCottage, wnLayoutBoxes, wnBoxesOverlap, wnLayoutOverlaps,
    wnInDoorway, wnHitWall, wnWalkableAt, wnPlaceLabels, wnVisibleLabels,
    wnLightSlot, wnSetNight, wnPlaceLight, wnShowLights, wnWrapOpen, wnWrapPick, wnWrapScoreLook, wnWrapJudge, wnWrapCompete,
    WN_FORT, WN_FORT_TARGETS, WN_FREE_CAP, wnDayKey, wnFreePay,
    wnFortDims, wnFortFresh, wnInFort, wnFortCell, wnFortCenter, wnFortH, wnFortAim, wnFortPlace, wnFortScoop, wnFortSet, wnFortRay, wnFortWire, wnFortUnwire, wnFortBank, wnGotHit,
    WN_JUDGES, WN_JUDGE_LIST, WN_SHOW_MOVES, WN_SHOW_T, WN_SHOW_PAID_PER_DAY, WN_SHOW_KINDS,
    wnShowStart, wnShowMove, wnShowTick, wnShowScores, wnShowJudge, wnShowQuit
  };
});
