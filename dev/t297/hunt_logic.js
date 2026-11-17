/* Treasure Trail rules — daily seeded map, clues, digs, chests. */
(function (root) {
  'use strict';

  const HUNT_KEY = 'rubloxHunt';
  const HUNT_VER = 1;
  const HUNT_SPOTS = [
    {id:'mill',   name:'Red Mill',    emoji:'🏭', clue:'Look where the red mill turns in the breeze.', x:-16, z:-12},
    {id:'bridge', name:'Blue Bridge', emoji:'🌉', clue:'Cross the little blue bridge over the brook.', x:14, z:-10},
    {id:'oak',    name:'Tall Oak',    emoji:'🌳', clue:'Stand in the shade of the tallest oak.', x:-12, z:16},
    {id:'dune',   name:'Sandy Dune',  emoji:'🏜️', clue:'Dig at the warm sandy dune.', x:18, z:14},
    {id:'arch',   name:'Stone Arch',  emoji:'🪨', clue:'The stone arch hides a secret at its feet.', x:0, z:22},
    {id:'well',   name:'Wishing Well',emoji:'🪙', clue:'Make a wish at the old stone well.', x:-20, z:4},
    {id:'dock',   name:'Quiet Dock',  emoji:'⚓', clue:'The quiet dock has a loose plank.', x:20, z:-2},
    {id:'camp',   name:'Campfire Ring',emoji:'🔥', clue:'The last spark of the campfire ring is the clue.', x:2, z:-20}
  ];

  function huntDay(now){
    const d = now != null ? new Date(now) : new Date();
    const y = d.getFullYear(), m = d.getMonth() + 1, day = d.getDate();
    return y + '-' + (m < 10 ? '0' : '') + m + '-' + (day < 10 ? '0' : '') + day;
  }

  function huntSeed(str){
    let x = 2166136261;
    const s = String(str || '');
    for (let i = 0; i < s.length; i++){ x ^= s.charCodeAt(i); x = Math.imul(x, 16777619) >>> 0; }
    return () => { x = (Math.imul(x, 1664525) + 1013904223) >>> 0; return x / 4294967296; };
  }

  function huntShuffle(arr, rand){
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--){
      const j = Math.floor(rand() * (i + 1));
      const t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function huntMap(day){
    const d = day || huntDay();
    const rand = huntSeed('trail:v2:' + d);
    const order = huntShuffle(HUNT_SPOTS, rand);
    const start = Math.floor(rand() * order.length);
    const spots = [0,1,2,3].map(i => order[(start + i) % order.length]);
    return {
      day: d,
      steps: spots.map((s, i) => ({
        i,
        id: s.id,
        name: s.name,
        emoji: s.emoji,
        clue: s.clue,
        x: s.x,
        z: s.z,
        prize: i === spots.length - 1 ? 25 : 8 + i * 3
      }))
    };
  }

  function huntFresh(day){
    const map = huntMap(day);
    return {ver: HUNT_VER, day: map.day, step: 0, found: [], maps: 0, earned: 0, streak: 0, lastDay: '', dug: []};
  }

  function huntLoad(raw, now){
    const day = huntDay(now);
    const fresh = huntFresh(day);
    const o = raw && typeof raw === 'object' ? raw : null;
    if (!o) return fresh;
    fresh.maps = Math.max(0, o.maps | 0);
    fresh.earned = Math.max(0, o.earned | 0);
    fresh.streak = Math.max(0, o.streak | 0);
    fresh.lastDay = typeof o.lastDay === 'string' ? o.lastDay : '';
    if (o.day === day){
      fresh.step = Math.max(0, Math.min(4, o.step | 0));
      fresh.found = Array.isArray(o.found) ? o.found.filter(id => typeof id === 'string').slice(0, 4) : [];
      fresh.dug = Array.isArray(o.dug) ? o.dug.filter(id => typeof id === 'string').slice(0, 16) : [];
    }
    return fresh;
  }

  function huntCurrent(state, now){
    state = huntLoad(state, now);
    const map = huntMap(state.day);
    const step = map.steps[state.step] || null;
    return {state, map, step, done: state.step >= map.steps.length};
  }

  function huntDig(state, spotId, now){
    const cur = huntCurrent(state, now);
    state = cur.state;
    if (cur.done) return {ok:false, why:'done', state, coins:0};
    const step = cur.step;
    if (!step) return {ok:false, why:'map', state, coins:0};
    if (state.dug.indexOf(spotId) < 0) state.dug = state.dug.concat([String(spotId || '')]);
    if (spotId !== step.id) return {ok:false, why:'empty', state, coins:0, hint: step.clue};
    if (state.found.indexOf(step.id) >= 0) return {ok:false, why:'have', state, coins:0};
    state.found = state.found.concat([step.id]);
    state.step += 1;
    const coins = step.prize;
    state.earned += coins;
    const finished = state.step >= cur.map.steps.length;
    if (finished){
      state.maps += 1;
      if (state.lastDay && state.lastDay !== state.day){
        // streak if yesterday? keep simple: increment when a new day map is finished after a previous finish
      }
      if (state.lastDay !== state.day){
        const prev = state.lastDay;
        state.streak = (prev && _huntNext(prev) === state.day) ? (state.streak + 1) : 1;
        state.lastDay = state.day;
      }
    }
    return {ok:true, why: finished ? 'map' : 'chest', state, coins, step, finished};
  }

  function _huntNext(day){
    const p = String(day || '').split('-').map(Number);
    if (p.length !== 3 || !p[0]) return day;
    const d = new Date(p[0], p[1] - 1, p[2]);
    d.setDate(d.getDate() + 1);
    return huntDay(d);
  }

  function huntNear(x, z, step, r){
    if (!step) return false;
    const rad = r != null ? r : 2.4;
    return Math.hypot((+x || 0) - step.x, (+z || 0) - step.z) <= rad;
  }

  const api = {
    HUNT_KEY, HUNT_VER, HUNT_SPOTS,
    huntDay, huntSeed, huntMap, huntFresh, huntLoad, huntCurrent, huntDig, huntNear
  };
  root.HuntRules = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
