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
    {id:'cocoa', name:"Mugsy’s Cocoa", x:-16, z:8, w:7, d:5.5},
    {id:'blue', name:'Blue cottage', x:16, z:12, w:6, d:5},
    {id:'green', name:'Green cottage', x:-6, z:22, w:6, d:5}
  ];
  const WN_DOORS = WN_COTTAGES.map(c => ({
    id:c.id, a:'outside', b:c.id, x:c.x, z:c.z + c.d/2, w:WN_DOOR_W, h:WN_DOOR_H, axis:'z', thick:0.42
  }));

  function wnFresh(){
    return {
      v: WN_VER,
      coinsEarned: 0,
      sledBest: 0,
      sledRuns: 0,
      snowmen: 0,
      skateLaps: 0,
      cocoaServed: 0,
      cocoaBought: 0,
      races: 0,
      snowballs: 0
    };
  }

  function wnLoad(raw){
    const o = raw && typeof raw === 'object' ? raw : {};
    const d = wnFresh();
    ['coinsEarned','sledRuns','snowmen','skateLaps','cocoaServed','cocoaBought','races','snowballs'].forEach(k => {
      d[k] = Math.max(0, o[k] | 0);
    });
    d.sledBest = Math.max(0, +o.sledBest || 0);
    return d;
  }

  function wnNewVisit(state, now){
    return {
      state: wnLoad(state),
      run: {
        area: 'village',
        sled: {on:false, x:0, y:0, z:0, vx:0, vz:0, yaw:0, air:0, t:0, started:0, jumps:0, done:false, time:0},
        snowman: {parts:[]},
        skate: {on:false, laps:0, t:0, lastAng:0, ang:0},
        cocoa: {warm:0, served:0},
        snowball: {cool:0, hits:0},
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
    run.sled = {on:true, x:0, y:1.2, z:-70, vx:0, vz:10, yaw:0, air:0, t:0, started: now || 0, jumps:0, done:false, time:0};
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
    // bumps / jump ramps near z=-30 and z=10
    if (s.air <= 0 && (Math.abs(s.z + 30) < 1.2 || Math.abs(s.z - 10) < 1.2)){
      s.air = 0.55;
      s.jumps = (s.jumps | 0) + 1;
    }
    if (s.x <= -8 || s.x >= 8) s.yaw = (s.yaw || 0) * 0.4;
    if (s.z >= 48){
      s.z = 48;
      s.on = false;
      s.done = true;
      s.time = Math.max(0.1, (s.t || 0));
    }
    return run;
  }

  function wnSledFinish(run, state){
    if (!run || !run.sled || !run.sled.done || !run.sled.time) return {ok:false, why:'race'};
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
      coins = 2;
      st.coinsEarned += coins;
    } else if (practice){
      coins = 1;
      st.coinsEarned += coins;
    }
    return {ok:true, why: vsPlayer ? 'hit' : 'practice', coins, state: st, fight: !!vsPlayer};
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
    run.skate = {on:true, laps:0, t:0, lastAng:0, ang:0, crossed:true};
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
    return run;
  }

  function wnSkateBank(run, state){
    if (!run || !run.skate) return {ok:false, why:'no'};
    const laps = run.skate.laps | 0;
    if (!laps || run.skate.banked === laps) return {ok:false, why:'laps'};
    const add = laps - (run.skate.banked | 0);
    run.skate.banked = laps;
    const st = wnLoad(state);
    st.skateLaps = (st.skateLaps | 0) + add;
    const coins = add * 3;
    st.coinsEarned += coins;
    return {ok:true, why:'ok', laps: add, coins, state: st};
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
    const coins = 4;
    st.coinsEarned += coins;
    return {ok:true, why:'ok', coins, state: st, served: run.cocoa.served, message:'A warm mug for a chilly visitor!'};
  }

  function wnWire(state, run){
    state = wnLoad(state);
    run = run || {};
    return {
      coinsEarned: state.coinsEarned,
      sledBest: state.sledBest,
      area: run.area || 'village',
      sled: run.sled ? {on:!!run.sled.on, x:+run.sled.x||0, z:+run.sled.z||0, yaw:+run.sled.yaw||0, done:!!run.sled.done, time:+run.sled.time||0} : null,
      snowman: run.snowman ? {parts:(run.snowman.parts||[]).slice(), claimed:!!run.snowman.claimed} : null,
      skate: run.skate ? {on:!!run.skate.on, laps:run.skate.laps|0} : null
    };
  }

  return {
    WN_KEY, WN_VER, WN_COCOA_COST, WN_SNOWMAN, WN_DOOR_H, WN_DOOR_W, WN_WALL_H, WN_COTTAGES, WN_DOORS,
    wnFresh, wnLoad, wnNewVisit, wnGo,
    wnSledStart, wnSledSteer, wnSledJump, wnSledTick, wnSledFinish, wnSledRace,
    wnRealPlayers, wnCanPelt, wnThrowSnowball, wnSnowballTick,
    wnAddSnowmanPart, wnFinishSnowman,
    wnSkateStart, wnSkateTick, wnSkateBank,
    wnBuyCocoa, wnServeCocoa, wnWire
  };
});
