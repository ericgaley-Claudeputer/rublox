/* Pure Tower of Doom rules — safe to require() in tests and to load in the page. */
(function (root) {
  'use strict';

  // Live engine constants (JUMP, GRAV, SPEED, RUN_MUL, H). The *usable* jump is
  // measured through the real step() loop (3 substeps per frame), not v^2/2g.
  const TD_PHYS = {jump: 16, grav: 45, speed: 10, runMul: 1.6, r: 0.45, stepUp: 0.62, bodyH: 2.8};
  // Measured by driving step() at 60 / 30 / 20 fps, holding walk (no sprint) and
  // jumping from a flat floor. Apex is slightly *above* v^2/2g because of the
  // discrete integrator; walk reach is 7.0 m at every fps once a single jump is
  // isolated. Limits below are 50% of the conservative 60 fps figures.
  const TD_MEAS_HEIGHT_60 = 2.8875;
  const TD_MEAS_HEIGHT_30 = 2.9333;
  const TD_MEAS_HEIGHT_20 = 2.975;
  const TD_MEAS_HEIGHT = TD_MEAS_HEIGHT_60;
  const TD_MEAS_REACH_WALK = 7.0;
  const TD_MARGIN = 0.50;
  const TD_LIMIT_H = TD_MEAS_HEIGHT * TD_MARGIN; // 1.44375
  const TD_LIMIT_R = TD_MEAS_REACH_WALK * TD_MARGIN; // 3.5
  const TD_MIN_JUMP_GAP = 0.5; // required whenever a hop is taller than a walk-up (no overhangs)
  const TD_COYOTE = 0.2;
  const TD_JUMP_BUF = 0.15;
  // v3 layout: a rising spiral with a *visible* gap between pad edges, a modest
  // rise, and at least 3.5 m of air above every pad and along every jump path.
  const TD_GAP_MIN = 1.5;
  const TD_GAP_MAX = 2.5;
  const TD_RISE_MIN = 0.6;
  const TD_RISE_MAX = 1.2;
  const TD_HEADROOM = 3.5;
  const TD_SLOTS = 8;
  // 2x4 axis-aligned switchback. Adjacent centers are TD_SPAN apart so the
  // visible AABB gap between 4.8 m pads is 2.2 m (1.8–2.2 m with landings).
  // 8 unique cells * 1.0 m rise = 8.0 m before a column repeats: underside
  // clearance 7.6 m, which leaves 4.8 m of jump room above the 2.8 m body.
  const TD_SPAN = 7.0;
  const TD_SPIRAL_R = 7.0;
  const TD_PAD_W = 4.8;
  const TD_PAD_D = 4.8;
  const TD_RISE = 1.0;
  const TD_STEPS_PER_SEC = 8;
  const TD_GRID_COLS = 4;
  const TD_GRID_ROWS = 2;
  const TD_SPAWN_Y = 0.5;
  const TD_CENTER = {x: 0, z: -5};

  const TD_SECTIONS = 12;
  const TD_H = 7.2;
  const TD_GOO_BASE = 0.16;
  const TD_GOO_ACCEL = 250;
  const TD_GOO_ACCEL_CAP = 0.06;
  const TD_GRACE = 12;
  const TD_CP_GRACE = 8;
  const TD_GOO_START = -8;
  const TD_MIN_PAD = 4.0;
  const TD_KINDS = ['steps', 'beam', 'zig', 'pads', 'bridge', 'spin'];
  const TD_CP_SECTIONS = [1, 3, 5, 7, 9, 11];
  const TD_CLIMB_RATE = 0.30;
  const TD_KEY = 'rubloxTower';

  function tdMaxJumpHeight(phys){
    phys = phys || TD_PHYS;
    return (phys.jump * phys.jump) / (2 * phys.grav);
  }

  function tdAirTime(dy, phys){
    phys = phys || TD_PHYS;
    const disc = phys.jump * phys.jump - 2 * phys.grav * dy;
    if (disc < 0) return null;
    return (phys.jump + Math.sqrt(disc)) / phys.grav;
  }

  function tdMaxReach(dy, sprint, phys){
    phys = phys || TD_PHYS;
    const t = tdAirTime(dy, phys);
    if (t == null) return 0;
    return (sprint ? phys.speed * phys.runMul : phys.speed) * t;
  }

  function tdAabbGap(a, b){
    const gx = Math.max(0, Math.abs(a.x - b.x) - (a.w || 0) / 2 - (b.w || 0) / 2);
    const gz = Math.max(0, Math.abs(a.z - b.z) - (a.d || 0) / 2 - (b.d || 0) / 2);
    return Math.hypot(gx, gz);
  }

  function tdOverlapsXZ(a, b){
    return tdAabbGap(a, b) <= 1e-6;
  }

  function tdIsStandable(p){
    return p && p.role !== 'rail' && p.role !== 'decor';
  }

  function tdJumpCheck(from, to, opts){
    opts = opts || {};
    const phys = opts.phys || TD_PHYS;
    const limitH = opts.limitH != null ? opts.limitH : TD_LIMIT_H;
    const limitR = opts.limitR != null ? opts.limitR : TD_LIMIT_R;
    const minGap = opts.minJumpGap != null ? opts.minJumpGap : TD_MIN_JUMP_GAP;
    const walkUp = phys.stepUp != null ? phys.stepUp : 0.62;
    const dy = to.y - from.y;
    const gap = tdAabbGap(from, to);
    if (dy <= walkUp && gap <= 0.2){
      return {ok: true, why: 'step', dy, gap, usedH: 0, usedR: 0};
    }
    // A 2.8 m body cannot jump "through" an overlapping higher pad — the lip
    // ejects you sideways. Any hop taller than a walk-up needs a real gap.
    if (dy > walkUp && gap < minGap){
      return {ok: false, why: 'overhang', dy, gap, limitH, limitR, minGap};
    }
    if (dy > limitH){
      return {ok: false, why: 'height', dy, gap, limitH, usedH: dy / TD_MEAS_HEIGHT, usedR: 0};
    }
    if (gap > limitR){
      return {ok: false, why: 'reach', dy, gap, limitR, usedH: Math.max(0, dy) / TD_MEAS_HEIGHT, usedR: gap / TD_MEAS_REACH_WALK};
    }
    return {
      ok: true, why: 'jump', dy, gap, limitH, limitR,
      usedH: Math.max(0, dy) / TD_MEAS_HEIGHT,
      usedR: gap / TD_MEAS_REACH_WALK
    };
  }

  function tdWalkReachable(plats, opts){
    opts = opts || {};
    const list = (plats || []).filter(tdIsStandable);
    if (!list.length) return {ok: false, reached: [], missing: [], jumps: [], why: 'no-platforms'};
    let si = 0;
    if (opts.start){
      si = list.findIndex(p => p === opts.start || (p.role === opts.start.role && p.x === opts.start.x && p.y === opts.start.y && p.z === opts.start.z));
      if (si < 0) si = 0;
    } else {
      const spawn = list.find(p => p.role === 'spawn') || list.find(p => p.role === 'island') || list[0];
      si = list.indexOf(spawn);
    }
    const seen = new Array(list.length).fill(false);
    const q = [si];
    seen[si] = true;
    const jumps = [];
    while (q.length){
      const i = q.shift();
      for (let j = 0; j < list.length; j++){
        if (seen[j]) continue;
        const chk = tdJumpCheck(list[i], list[j], opts);
        if (chk.ok){
          seen[j] = true;
          q.push(j);
          jumps.push({from: list[i], to: list[j], chk});
        }
      }
    }
    const reached = list.filter((_, i) => seen[i]);
    const missing = list.filter((_, i) => !seen[i]);
    return {ok: missing.length === 0, reached, missing, jumps, start: list[si]};
  }

  function tdSeed(n){
    let x = (n * 1103515245 + 12345) & 0x7fffffff;
    return () => { x = (x * 1103515245 + 12345) & 0x7fffffff; return (x >>> 0) / 0x7fffffff; };
  }

  function tdPickKinds(seed){
    const rnd = tdSeed(seed == null ? 1 : seed);
    const kinds = [];
    for (let i = 0; i < TD_SECTIONS; i++) kinds.push(TD_KINDS[(rnd() * TD_KINDS.length) | 0]);
    return kinds;
  }

  function tdPush(plats, p){
    plats.push(p);
    return p;
  }

  function tdUnderside(p){
    return p.y - (p.h || 0.4);
  }

  function tdSlotPos(k){
    const L = TD_SPAN;
    const i = ((k % TD_SLOTS) + TD_SLOTS) % TD_SLOTS;
    // Snake: 0,0 1,0 2,0 3,0 then 3,1 2,1 1,1 0,1 and wrap 0,1 -> 0,0.
    const row = i < TD_GRID_COLS ? 0 : 1;
    const col = i < TD_GRID_COLS ? i : (TD_SLOTS - 1 - i);
    const x0 = TD_CENTER.x - (TD_GRID_COLS - 1) * L / 2;
    const z0 = TD_CENTER.z - (TD_GRID_ROWS - 1) * L / 2;
    return {x: x0 + col * L, z: z0 + row * L};
  }

  function tdClimbY(stepIndex){
    return TD_SPAWN_Y + TD_RISE * (stepIndex + 1);
  }

  // Distance from a point to an AABB in XZ.
  function tdPointAabbGap(x, z, p){
    const gx = Math.max(0, Math.abs(x - p.x) - (p.w || 0) / 2);
    const gz = Math.max(0, Math.abs(z - p.z) - (p.d || 0) / 2);
    return Math.hypot(gx, gz);
  }

  // Distance from a segment in XZ to an AABB (0 if it clips the box).
  function tdSegAabbGap(x1, z1, x2, z2, p){
    let best = 1e9;
    const steps = 12;
    for (let i = 0; i <= steps; i++){
      const t = i / steps;
      const d = tdPointAabbGap(x1 + (x2 - x1) * t, z1 + (z2 - z1) * t, p);
      if (d < best) best = d;
    }
    return best;
  }

  // Clear air above a pad's footprint (and a little around it). Floors below
  // the standing surface are ignored. Returns Infinity when the sky is empty.
  function tdHeadroom(pad, plats, opts){
    opts = opts || {};
    const margin = opts.margin != null ? opts.margin : TD_PHYS.r;
    let min = Infinity, blocker = null;
    for (const q of (plats || [])){
      if (q === pad) continue;
      if (q.role === 'decor') continue;
      const under = tdUnderside(q);
      if (under <= pad.y + 1e-6) continue;
      if (tdAabbGap(pad, q) > margin) continue;
      const h = under - pad.y - TD_PHYS.bodyH;
      if (h < min){ min = h; blocker = q; }
    }
    return {ok: min >= TD_HEADROOM - 1e-9, headroom: min, blocker, need: TD_HEADROOM, bodyH: TD_PHYS.bodyH};
  }

  // Clear air along the jump from `from` to `to` (the flight corridor, not the
  // two pads themselves). Anything whose XZ comes within the player radius of
  // the center-to-center segment must sit at least TD_HEADROOM above `from`.
  function tdJumpPathClear(from, to, plats, opts){
    opts = opts || {};
    const radius = opts.radius != null ? opts.radius : (TD_PHYS.r + 0.2);
    let min = Infinity, blocker = null;
    for (const q of (plats || [])){
      if (q === from || q === to) continue;
      if (q.role === 'decor') continue;
      const under = tdUnderside(q);
      if (under <= from.y + 1e-6) continue;
      if (tdSegAabbGap(from.x, from.z, to.x, to.z, q) > radius) continue;
      const h = under - from.y - TD_PHYS.bodyH;
      if (h < min){ min = h; blocker = q; }
    }
    return {ok: min >= TD_HEADROOM - 1e-9, headroom: min, blocker, need: TD_HEADROOM, bodyH: TD_PHYS.bodyH};
  }

  function tdConsecutiveOk(from, to, plats, opts){
    const gap = tdAabbGap(from, to);
    const dy = to.y - from.y;
    const hop = tdJumpCheck(from, to, opts);
    const room = tdHeadroom(from, plats, opts);
    const path = tdJumpPathClear(from, to, plats, opts);
    const overlap = tdOverlapsXZ(from, to);
    const gapOk = gap >= TD_GAP_MIN - 1e-9 && gap <= TD_GAP_MAX + 1e-9;
    const riseOk = dy >= TD_RISE_MIN - 1e-9 && dy <= TD_RISE_MAX + 1e-9;
    const ok = hop.ok && !overlap && gapOk && riseOk && room.ok && path.ok;
    let why = 'ok';
    if (overlap) why = 'overlap';
    else if (!gapOk) why = 'gap';
    else if (!riseOk) why = 'rise';
    else if (!room.ok) why = 'headroom';
    else if (!path.ok) why = 'path-headroom';
    else if (!hop.ok) why = hop.why;
    return {ok, why, gap, dy, hop, room, path, overlap};
  }

  // Generous kid-friendly spiral: visible 2 m edge gaps, 0.9 m rises, 5.4 m
  // of air before a column repeats, pads at least 4 m across, no overhangs.
  function tdSectionPlats(y0, kind, sectionIndex){
    const plats = [];
    const add = (x, y, z, w, d, role) => {
      plats.push({x, y, z, w, d, h: 0.4, role: role || 'pad', kind, section: sectionIndex});
      return plats[plats.length - 1];
    };
    const gold = TD_CP_SECTIONS.indexOf(sectionIndex + 1) >= 0;
    for (let k = 0; k < TD_STEPS_PER_SEC; k++){
      const stepIndex = sectionIndex * TD_STEPS_PER_SEC + k;
      const pos = tdSlotPos(stepIndex + 1);
      const y = tdClimbY(stepIndex);
      const last = k === TD_STEPS_PER_SEC - 1;
      const w = last ? 5.2 : TD_PAD_W;
      const d = last ? 5.2 : TD_PAD_D;
      const role = last ? (gold ? 'checkpoint' : 'landing') : (kind === 'beam' ? 'beam' : kind === 'bridge' ? 'bridge' : kind === 'spin' ? 'spiral' : 'pad');
      add(pos.x, y, pos.z, w, d, role);
    }
    return plats;
  }

  function tdLayoutFromKinds(kinds){
    const list = kinds && kinds.length ? kinds.slice(0, TD_SECTIONS) : tdPickKinds(1);
    while (list.length < TD_SECTIONS) list.push('steps');
    const plats = [];
    tdPush(plats, {x: TD_CENTER.x, y: 0, z: TD_CENTER.z, w: 32, d: 18, h: 0.4, role: 'island', section: -1});
    const spawnPos = tdSlotPos(0);
    const spawn = tdPush(plats, {x: spawnPos.x, y: TD_SPAWN_Y, z: spawnPos.z, w: 5.2, d: 5.2, h: 0.35, role: 'spawn', section: -1});
    const checkpoints = [{x: spawn.x, y: spawn.y, z: spawn.z, w: spawn.w, d: spawn.d, idx: 0, section: -1}];
    for (let i = 0; i < TD_SECTIONS; i++){
      const sect = tdSectionPlats(1.2 + i * TD_H, list[i], i);
      for (const p of sect){
        plats.push(p);
        if (p.role === 'checkpoint'){
          checkpoints.push({x: p.x, y: p.y, z: p.z, w: p.w, d: p.d, idx: checkpoints.length, section: i});
        }
      }
    }
    const lastStep = TD_SECTIONS * TD_STEPS_PER_SEC;
    const sumPos = tdSlotPos(lastStep + 1);
    const finPos = tdSlotPos(lastStep + 2);
    const summitY = tdClimbY(lastStep);
    const finishY = tdClimbY(lastStep + 1);
    const summit = tdPush(plats, {x: sumPos.x, y: summitY, z: sumPos.z, w: 5.2, d: 5.2, h: 0.4, role: 'summit', section: TD_SECTIONS});
    const finish = tdPush(plats, {x: finPos.x, y: finishY, z: finPos.z, w: 5.2, d: 5.2, h: 0.4, role: 'finish', section: TD_SECTIONS});
    return {plats, checkpoints, finish, summit, kinds: list.slice(), top: finishY, topY: finishY + 6};
  }

  function tdLayout(seed){
    return tdLayoutFromKinds(tdPickKinds(seed == null ? 1 : seed));
  }

  // Climb path in order: spawn, then each spiral pad, then summit and finish.
  // The start island is a safety floor, not a step on the path.
  function tdPathPlats(layout){
    const plats = (layout && layout.plats) ? layout.plats : (layout || []);
    return plats.filter(p => tdIsStandable(p) && p.role !== 'island');
  }

  function tdGooSpeed(maxY){
    return TD_GOO_BASE + Math.min(TD_GOO_ACCEL_CAP, Math.max(0, maxY) / TD_GOO_ACCEL);
  }

  function tdGooVsClimber(opts){
    opts = opts || {};
    const climb = opts.climbRate != null ? opts.climbRate : TD_CLIMB_RATE;
    const summit = opts.summit != null ? opts.summit : (1.2 + TD_SECTIONS * TD_H);
    const startGoo = opts.gooStart != null ? opts.gooStart : TD_GOO_START;
    const cpYs = (opts.checkpointYs || []).slice().sort((a, b) => a - b);
    const dt = opts.dt || 0.05;
    const clear = opts.clear != null ? opts.clear : 4;
    let t = 0, y = 0, goo = startGoo, grace = TD_GRACE, maxY = 0;
    let minClear = 99, worstT = 0;
    const hits = [];
    while (y < summit && t < 800){
      y = Math.min(summit, climb * t);
      maxY = Math.max(maxY, y);
      if (grace > 0) grace -= dt;
      else goo += tdGooSpeed(maxY) * dt;
      while (cpYs.length && y >= cpYs[0]){
        grace = Math.max(grace, TD_CP_GRACE);
        cpYs.shift();
      }
      t += dt;
      const dist = y - goo;
      if (dist < minClear){ minClear = dist; worstT = t; }
      if (dist < clear) hits.push({t, y, goo, dist});
    }
    return {ok: hits.length === 0 && y >= summit, t, y, goo, minClear, worstT, hits};
  }

  function tdLoadProg(raw){
    const r = raw && typeof raw === 'object' ? raw : {};
    return {best: Math.max(0, r.best | 0), wins: Math.max(0, r.wins | 0), coins: Math.max(0, +r.coins || 0)};
  }

  const api = {
    TD_PHYS, TD_SECTIONS, TD_H, TD_MARGIN, TD_MEAS_HEIGHT, TD_MEAS_HEIGHT_60, TD_MEAS_HEIGHT_30, TD_MEAS_HEIGHT_20,
    TD_MEAS_REACH_WALK, TD_LIMIT_H, TD_LIMIT_R, TD_MIN_JUMP_GAP, TD_COYOTE, TD_JUMP_BUF,
    TD_GAP_MIN, TD_GAP_MAX, TD_RISE_MIN, TD_RISE_MAX, TD_HEADROOM, TD_SLOTS, TD_SPAN, TD_SPIRAL_R, TD_PAD_W, TD_PAD_D, TD_RISE, TD_STEPS_PER_SEC, TD_GRID_COLS, TD_GRID_ROWS, TD_SPAWN_Y, TD_CENTER,
    TD_GOO_BASE, TD_GOO_ACCEL, TD_GOO_ACCEL_CAP,
    TD_GRACE, TD_CP_GRACE, TD_GOO_START, TD_MIN_PAD, TD_KINDS, TD_CP_SECTIONS, TD_CLIMB_RATE, TD_KEY,
    tdMaxJumpHeight, tdAirTime, tdMaxReach, tdAabbGap, tdOverlapsXZ, tdIsStandable, tdJumpCheck, tdWalkReachable,
    tdUnderside, tdSlotPos, tdClimbY, tdHeadroom, tdJumpPathClear, tdConsecutiveOk,
    tdSeed, tdPickKinds, tdSectionPlats, tdLayoutFromKinds, tdLayout, tdGooSpeed, tdGooVsClimber, tdLoadProg, tdPathPlats
  };
  root.TDRules = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
