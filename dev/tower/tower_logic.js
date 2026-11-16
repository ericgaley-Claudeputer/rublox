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

  // Generous kid-friendly sections: walk-up ledges (rise 0.55, touching) or
  // short hops (rise ≤ 1.2, gap 0.8–1.6), pads at least 4 m across, no overhangs.
  function tdSectionPlats(y0, kind, sectionIndex){
    const plats = [];
    const add = (x, y, z, w, d, role) => {
      plats.push({x, y, z, w, d, h: 0.4, role: role || 'pad', kind, section: sectionIndex});
      return plats[plats.length - 1];
    };
    const landY = y0 + TD_H - 0.2;
    const rise = 0.55;
    // Continue a compact vertical stair from the previous landing (or the spawn).
    const startY = sectionIndex === 0 ? 1.05 : (y0 - 0.2 + rise);
    const n = Math.max(1, Math.round((landY - startY) / rise));
    const step = (landY - startY) / n; // ~0.55, never above a walk-up
    const z0 = -5;
    for (let k = 0; k < n; k++){
      const y = startY + k * step;
      let x = 0, z = z0, w = 4.4, d = 4.4, role = 'pad';
      if (kind === 'steps'){
        x = ((k % 2) ? 1 : -1) * 1.5;
      } else if (kind === 'zig'){
        x = ((k % 2) ? 1 : -1) * 1.8;
        z = z0 + ((k % 4) < 2 ? 1.1 : -1.1);
      } else if (kind === 'pads'){
        const corner = k % 4, cx = (corner === 0 || corner === 1) ? 1.8 : -1.8, cz = (corner === 1 || corner === 2) ? -1.8 : 1.8;
        x = cx; z = z0 + cz;
      } else if (kind === 'beam'){
        if (k % 2 === 0){ x = 0; w = 7.5; d = 4.4; role = 'beam'; }
        else { x = ((k % 4) < 2 ? 1 : -1) * 1.4; }
      } else if (kind === 'bridge'){
        if (k % 3 === 1){ x = 0; w = 8.0; d = 4.4; role = 'bridge'; }
        else { x = ((k % 2) ? 1 : -1) * 1.6; }
      } else {
        const ang = k * 1.05;
        x = Math.cos(ang) * 1.7; z = z0 + Math.sin(ang) * 1.7; w = 4.5; d = 4.5; role = 'spiral';
      }
      add(x, y, z, w, d, role);
    }
    const gold = TD_CP_SECTIONS.indexOf(sectionIndex + 1) >= 0;
    add(0, landY, z0, 5.2, 5.2, gold ? 'checkpoint' : 'landing');
    tdPush(plats, {x: -9.2, y: y0 + 2.4, z: z0, w: 0.4, d: 8, h: 3.2, role: 'rail', kind, section: sectionIndex});
    tdPush(plats, {x: 9.2, y: y0 + 2.4, z: z0, w: 0.4, d: 8, h: 3.2, role: 'rail', kind, section: sectionIndex});
    return plats;
  }

  function tdLayoutFromKinds(kinds){
    const list = kinds && kinds.length ? kinds.slice(0, TD_SECTIONS) : tdPickKinds(1);
    while (list.length < TD_SECTIONS) list.push('steps');
    const plats = [];
    tdPush(plats, {x: 0, y: 0, z: -5, w: 18, d: 18, h: 0.4, role: 'island', section: -1});
    tdPush(plats, {x: 0, y: 0.5, z: -5, w: 5.2, d: 5.2, h: 0.35, role: 'spawn', section: -1});
    const checkpoints = [{x: 0, y: 0.5, z: -5, w: 5.2, d: 5.2, idx: 0, section: -1}];
    for (let i = 0; i < TD_SECTIONS; i++){
      const y0 = 1.2 + i * TD_H;
      const sect = tdSectionPlats(y0, list[i], i);
      for (const p of sect){
        plats.push(p);
        if (p.role === 'checkpoint'){
          checkpoints.push({x: p.x, y: p.y, z: p.z, w: p.w, d: p.d, idx: checkpoints.length, section: i});
        }
      }
    }
    const top = 1.2 + TD_SECTIONS * TD_H;
    const lastLand = plats.filter(p => p.role === 'landing' || p.role === 'checkpoint').slice(-1)[0];
    const summitY = (lastLand ? lastLand.y : top) + 0.55;
    const finZ = lastLand ? lastLand.z : -5;
    const finish = {x: 0, y: summitY + 0.45, z: finZ, w: 4.4, d: 4.4, h: 0.3, role: 'finish'};
    tdPush(plats, {x: 0, y: summitY, z: finZ, w: 6.0, d: 6.0, h: 0.45, role: 'summit', section: TD_SECTIONS});
    tdPush(plats, finish);
    return {plats, checkpoints, finish, kinds: list.slice(), top: summitY, topY: summitY + 6};
  }

  function tdLayout(seed){
    return tdLayoutFromKinds(tdPickKinds(seed == null ? 1 : seed));
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

  function tdPathPlats(layout){
    return (layout.plats || []).filter(tdIsStandable);
  }

  const api = {
    TD_PHYS, TD_SECTIONS, TD_H, TD_MARGIN, TD_MEAS_HEIGHT, TD_MEAS_HEIGHT_60, TD_MEAS_HEIGHT_30, TD_MEAS_HEIGHT_20,
    TD_MEAS_REACH_WALK, TD_LIMIT_H, TD_LIMIT_R, TD_MIN_JUMP_GAP, TD_COYOTE, TD_JUMP_BUF,
    TD_GOO_BASE, TD_GOO_ACCEL, TD_GOO_ACCEL_CAP,
    TD_GRACE, TD_CP_GRACE, TD_GOO_START, TD_MIN_PAD, TD_KINDS, TD_CP_SECTIONS, TD_CLIMB_RATE, TD_KEY,
    tdMaxJumpHeight, tdAirTime, tdMaxReach, tdAabbGap, tdOverlapsXZ, tdIsStandable, tdJumpCheck, tdWalkReachable,
    tdSeed, tdPickKinds, tdSectionPlats, tdLayoutFromKinds, tdLayout, tdGooSpeed, tdGooVsClimber, tdLoadProg, tdPathPlats
  };
  root.TDRules = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
