/* Pure Tower of Doom rules — safe to require() in tests and to load in the page. */
(function (root) {
  'use strict';

  // Real engine physics (must stay in sync with JUMP, GRAV, SPEED, RUN_MUL in the game loop).
  const TD_PHYS = {jump: 16, grav: 45, speed: 10, runMul: 1.6, r: 0.45, stepUp: 0.62};
  const TD_SECTIONS = 12;
  const TD_H = 7.2;
  const TD_MARGIN = 0.75;
  const TD_GOO_BASE = 0.16;       // was 0.42
  const TD_GOO_ACCEL = 250;       // was maxY/90
  const TD_GOO_ACCEL_CAP = 0.06;  // was 1.4
  const TD_GRACE = 12;            // was 6
  const TD_CP_GRACE = 8;          // new: rest after each gold pad and after a goo bounce
  const TD_GOO_START = -8;
  const TD_MIN_PAD = 2.8;
  const TD_KINDS = ['steps', 'beam', 'zig', 'pads', 'bridge', 'spin'];
  const TD_CP_SECTIONS = [1, 3, 5, 7, 9, 11];
  const TD_CLIMB_RATE = 0.30;     // cautious 10-year-old vertical pace, m/s
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

  function tdIsStandable(p){
    return p && p.role !== 'rail' && p.role !== 'decor';
  }

  function tdJumpCheck(from, to, opts){
    opts = opts || {};
    const phys = opts.phys || TD_PHYS;
    const margin = opts.margin != null ? opts.margin : TD_MARGIN;
    const dy = to.y - from.y;
    const gap = tdAabbGap(from, to);
    const maxH = tdMaxJumpHeight(phys);
    if (dy <= (phys.stepUp || 0.62) && gap <= 0.08){
      return {ok: true, why: 'step', dy, gap, usedH: 0, usedR: 0};
    }
    const air = tdAirTime(dy, phys);
    if (air == null){
      return {ok: false, why: 'height-impossible', dy, gap, maxH, limitH: maxH};
    }
    const walkReach = phys.speed * air;
    const sprintReach = phys.speed * phys.runMul * air;
    const limitH = maxH * margin;
    const limitR = walkReach * margin;
    if (dy > limitH){
      return {ok: false, why: 'height-tight', dy, gap, maxH, limitH, usedH: dy / maxH, usedR: walkReach ? gap / walkReach : 0};
    }
    if (gap > sprintReach){
      return {ok: false, why: 'reach-impossible', dy, gap, walkReach, sprintReach, limitR, usedH: maxH ? dy / maxH : 0, usedR: walkReach ? gap / walkReach : 1};
    }
    if (gap > limitR){
      return {ok: false, why: 'reach-tight', dy, gap, walkReach, sprintReach, limitR, usedH: maxH ? dy / maxH : 0, usedR: walkReach ? gap / walkReach : 0};
    }
    return {ok: true, why: 'jump', dy, gap, maxH, walkReach, usedH: maxH ? Math.max(0, dy) / maxH : 0, usedR: walkReach ? gap / walkReach : 0};
  }

  function tdWalkReachable(plats, opts){
    opts = opts || {};
    const list = (plats || []).filter(tdIsStandable);
    const start = opts.start;
    if (!list.length) return {ok: false, reached: [], missing: [], jumps: [], why: 'no-platforms'};
    let si = 0;
    if (start){
      si = list.findIndex(p => p === start || (p.role === start.role && p.x === start.x && p.y === start.y && p.z === start.z));
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

  function tdSectionPlats(y0, kind, sectionIndex){
    const plats = [];
    const add = (x, y, z, w, d, role) => tdPush(plats, {x, y, z, w, d, h: 0.5, role: role || 'pad', kind, section: sectionIndex});
    if (kind === 'steps'){
      for (let k = 0; k < 6; k++) add(((k % 2) ? 1 : -1) * 2.0, y0 + 0.5 + k * 1.05, -k * 1.15, 3.0, 2.8);
    } else if (kind === 'beam'){
      add(0, y0 + 0.8, -2, 2.8, 8.5, 'beam');
      add(-3.0, y0 + 2.2, -6.0, 3.0, 3.0);
      add(3.0, y0 + 3.5, -8.0, 3.0, 3.0);
      add(0, y0 + 5.1, -7.2, 3.2, 3.2);
    } else if (kind === 'zig'){
      for (let k = 0; k < 5; k++) add(((k % 2) ? 1 : -1) * 2.2, y0 + 0.55 + k * 1.15, -1 - k * 1.2, 3.0, 2.8);
    } else if (kind === 'pads'){
      for (let k = 0; k < 6; k++){
        const ang = k * 0.85;
        add(Math.sin(ang) * 2.6, y0 + 0.5 + k * 1.0, -k * 1.15, 2.8, 2.8);
      }
    } else if (kind === 'bridge'){
      add(-3.6, y0 + 0.8, -2.0, 3.0, 3.0);
      add(0, y0 + 2.0, -4.0, 8.0, 2.8, 'bridge');
      add(3.6, y0 + 3.3, -6.0, 3.0, 3.0);
      add(0, y0 + 5.0, -7.0, 3.2, 3.2);
    } else {
      // 'spin': a gentle spiral of wide pads (no spinning kill bars).
      for (let k = 0; k < 5; k++){
        add(Math.cos(k * 1.15) * 2.4, y0 + 0.6 + k * 1.1, -2 - k * 1.15, 3.2, 3.2, 'spiral');
      }
    }
    const gold = TD_CP_SECTIONS.indexOf(sectionIndex + 1) >= 0;
    add(0, y0 + TD_H - 0.2, -7.5, 3.6, 3.6, gold ? 'checkpoint' : 'landing');
    // Decorative side rails — not part of the climb (too narrow to stand on).
    tdPush(plats, {x: -6.2, y: y0 + 2.4, z: -4, w: 0.4, d: 6, h: 3.2, role: 'rail', kind, section: sectionIndex});
    tdPush(plats, {x: 6.2, y: y0 + 2.4, z: -4, w: 0.4, d: 6, h: 3.2, role: 'rail', kind, section: sectionIndex});
    return plats;
  }

  function tdLayoutFromKinds(kinds){
    const list = kinds && kinds.length ? kinds.slice(0, TD_SECTIONS) : tdPickKinds(1);
    while (list.length < TD_SECTIONS) list.push('steps');
    const plats = [];
    tdPush(plats, {x: 0, y: 0, z: 0, w: 14, d: 14, h: 0.4, role: 'island', section: -1});
    tdPush(plats, {x: 0, y: 0.4, z: -6, w: 4.5, d: 3.5, h: 0.3, role: 'island', section: -1});
    tdPush(plats, {x: 0, y: 0.9, z: -3.2, w: 4.5, d: 4.0, h: 0.35, role: 'stair', section: -1});
    tdPush(plats, {x: 0, y: 0.5, z: -5.5, w: 3.0, d: 3.0, h: 0.2, role: 'spawn', section: -1});
    const checkpoints = [{x: 0, y: 0.5, z: -5.5, w: 3.0, d: 3.0, idx: 0, section: -1}];
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
    const finish = {x: 0, y: top + 0.6, z: -8, w: 3.2, d: 3.2, h: 0.3, role: 'finish'};
    tdPush(plats, {x: 0, y: top, z: -8, w: 5.5, d: 5.5, h: 0.5, role: 'summit', section: TD_SECTIONS});
    tdPush(plats, finish);
    return {plats, checkpoints, finish, kinds: list.slice(), top, topY: TD_SECTIONS * TD_H + 6};
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
      // A gold pad pauses the goo for the climber who just arrived.
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
    TD_PHYS, TD_SECTIONS, TD_H, TD_MARGIN, TD_GOO_BASE, TD_GOO_ACCEL, TD_GOO_ACCEL_CAP,
    TD_GRACE, TD_CP_GRACE, TD_GOO_START, TD_MIN_PAD, TD_KINDS, TD_CP_SECTIONS, TD_CLIMB_RATE, TD_KEY,
    tdMaxJumpHeight, tdAirTime, tdMaxReach, tdAabbGap, tdIsStandable, tdJumpCheck, tdWalkReachable,
    tdSeed, tdPickKinds, tdSectionPlats, tdLayoutFromKinds, tdLayout, tdGooSpeed, tdGooVsClimber, tdLoadProg
  };
  root.TDRules = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
