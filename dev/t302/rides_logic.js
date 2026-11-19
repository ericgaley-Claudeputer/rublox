/* Rideland Workshop — original rides on your lot, friends may ride. Save key rubloxRides. */
(function (root) {
  const RIDES_KEY = 'rubloxRides';
  const RIDES_VER = 1;
  const RIDES_GRID = 12;
  const RIDES_CELL = 3;
  const RIDES_OLD_GRID = 8;
  const RIDES_ELEV_Y = 1.6;
  const RIDES_MAX_ELEV = 4;
  const RIDES_KINDS = [
    {id:'carousel', name:'Sunny Spin Carousel', emoji:'🎠', size:2, color:'#ff9f1c'},
    {id:'swings', name:'Sky Swing Circle', emoji:'🎐', size:2, color:'#3a86ff'},
    {id:'drop', name:'Giggle Drop Tower', emoji:'🗼', size:1, color:'#8b5cf6'},
    {id:'cups', name:'Twirl Cups', emoji:'🍵', size:2, color:'#ff6fb5'},
    {id:'track', name:'Coaster Track', emoji:'🛤️', size:1, color:'#1d2340'},
    {id:'curve', name:'Coaster Curve', emoji:'↩️', size:1, color:'#4b5563'},
    {id:'slope', name:'Coaster Slope', emoji:'↗️', size:1, color:'#6b7280'},
    {id:'loop', name:'Coaster Loop', emoji:'🔁', size:1, color:'#7c3aed'}
  ];
  const RIDES_TRACKS = ['track', 'curve', 'slope', 'loop'];
  const RIDES_TUT = [
    {id:'hi', title:'Welcome to Rideland!', body:'We will build a coaster together: a straight track, a curve, an up-or-down slope, a loop-the-loop, then close the loop and ride it. Press Next to begin, or Skip if you already know how. This works with keyboard, on-screen buttons, and an Xbox pad.'},
    {id:'track', title:'1. Straight track', body:'Cycle pieces with Q, LB / RB, or Pick in the Ride Kit until you have 🛤️ Coaster Track. Stand on a grid square and press E / Ⓧ / Place.', need:'place:track'},
    {id:'curve', title:'2. Curve', body:'Cycle to ↩️ Coaster Curve. Press R or Ⓨ to rotate it, then place it so the track turns a corner.', need:'place:curve'},
    {id:'slope', title:'3. Up and down slope', body:'Cycle to ↗️ Coaster Slope. Rotate to choose up or down, then place it so the ride climbs or drops.', need:'place:slope'},
    {id:'loop', title:'4. Loop-the-loop', body:'Cycle to 🔁 Coaster Loop and place it. This is the big flip in the middle of the ride!', need:'place:loop'},
    {id:'close', title:'5. Close the loop', body:'Keep placing track, curves, slopes, or loops until the coaster joins back on itself. A short open path cannot be ridden.', need:'close'},
    {id:'ride', title:'6. Ride it!', body:'Walk onto any coaster piece and press E / Ⓧ / Ride. Hop off the same way, or with Ⓑ.', need:'ride'},
    {id:'done', title:'You did it!', body:'Nice riding! Press Help anytime to replay this lesson. Friends may hop on rides you build.'}
  ];

  function ridesFresh(){
    return {ver: RIDES_VER, lot: RIDES_GRID, pieces:[], placed:0, rides:0, kind:'carousel', rot:0, del:false, undo:null, tutDone:false, tut:null};
  }

  function ridesKind(id){ return RIDES_KINDS.find(k => k.id === id) || null; }

  function ridesLoad(raw){
    const d = ridesFresh();
    const o = (raw && typeof raw === 'object') ? raw : {};
    const shift = ((o.lot | 0) !== RIDES_GRID);
    let dx = 0, dz = 0;
    if (shift && Array.isArray(o.pieces) && o.pieces.length){
      const maxg = o.pieces.reduce((m, p) => Math.max(m, p && p.gx | 0, p && p.gz | 0), 0);
      if (maxg < RIDES_OLD_GRID){ dx = Math.floor((RIDES_GRID - RIDES_OLD_GRID) / 2); dz = dx; }
    }
    if (Array.isArray(o.pieces)){
      d.pieces = o.pieces.map((p, i) => {
        const kind = ridesKind(p && p.kind);
        if (!kind) return null;
        const gx = (p.gx | 0) + dx, gz = (p.gz | 0) + dz;
        if (gx < 0 || gz < 0 || gx >= RIDES_GRID || gz >= RIDES_GRID) return null;
        return {
          id: (p.id | 0) || (i + 1),
          kind: kind.id,
          gx, gz,
          rot: ((p.rot | 0) % 4 + 4) % 4,
          elev: Math.max(0, Math.min(RIDES_MAX_ELEV, p.elev | 0)),
          owner: typeof p.owner === 'string' ? p.owner.slice(0, 24) : ''
        };
      }).filter(Boolean).slice(0, 128);
    }
    d.lot = RIDES_GRID;
    if (o.undo && typeof o.undo === 'object') d.undo = o.undo;
    d.del = !!o.del;
    d.placed = Math.max(d.pieces.length, o.placed | 0);
    d.rides = Math.max(0, o.rides | 0);
    d.kind = ridesKind(o.kind) ? o.kind : 'carousel';
    d.rot = ((o.rot | 0) % 4 + 4) % 4;
    d.tutDone = !!o.tutDone;
    if (o.tut && typeof o.tut === 'object'){
      const step = Math.max(0, Math.min(RIDES_TUT.length - 1, o.tut.step | 0));
      d.tut = {on: !!o.tut.on, step};
    } else d.tut = null;
    return d;
  }

  function ridesIsTrack(kind){
    const id = kind && kind.id ? kind.id : kind;
    return RIDES_TRACKS.indexOf(id) >= 0;
  }

  function ridesCycleKind(state, dir){
    state = ridesLoad(state);
    const i = Math.max(0, RIDES_KINDS.findIndex(k => k.id === state.kind));
    const n = RIDES_KINDS.length;
    const j = (i + (dir < 0 ? n - 1 : 1)) % n;
    state.kind = RIDES_KINDS[j].id;
    return {ok:true, state, kind: ridesKind(state.kind)};
  }

  function ridesRotate(state, dir){
    state = ridesLoad(state);
    state.rot = ((state.rot + (dir < 0 ? 3 : 1)) % 4);
    return {ok:true, state, rot: state.rot};
  }

  function ridesCells(kind, gx, gz, rot){
    const k = ridesKind(kind);
    if (!k) return [];
    const cells = [];
    const s = k.size;
    for (let x = 0; x < s; x++) for (let z = 0; z < s; z++){
      let dx = x, dz = z;
      if (rot === 1){ dx = z; dz = -x; }
      else if (rot === 2){ dx = -x; dz = -z; }
      else if (rot === 3){ dx = -z; dz = x; }
      cells.push({gx: gx + dx, gz: gz + dz});
    }
    return cells;
  }

  function ridesFits(state, kind, gx, gz, rot, ignoreId){
    const cells = ridesCells(kind, gx, gz, rot);
    if (!cells.length) return false;
    if (cells.some(c => c.gx < 0 || c.gz < 0 || c.gx >= RIDES_GRID || c.gz >= RIDES_GRID)) return false;
    const used = new Set();
    ridesLoad(state).pieces.forEach(p => {
      if (ignoreId && p.id === ignoreId) return;
      ridesCells(p.kind, p.gx, p.gz, p.rot).forEach(c => used.add(c.gx + ',' + c.gz));
    });
    return cells.every(c => !used.has(c.gx + ',' + c.gz));
  }

  // dir 0=+X, 1=+Z, 2=-X, 3=-Z
  function ridesDirVec(dir){
    const d = ((dir | 0) % 4 + 4) % 4;
    return d === 0 ? [1, 0] : d === 1 ? [0, 1] : d === 2 ? [-1, 0] : [0, -1];
  }
  function ridesPorts(kind, gx, gz, rot, elev){
    const k = ridesKind(kind && kind.kind ? kind.kind : kind);
    if (!k) return [];
    if (kind && kind.kind){ gx = kind.gx; gz = kind.gz; rot = kind.rot; elev = kind.elev; kind = kind.kind; }
    gx = gx | 0; gz = gz | 0;
    rot = ((rot | 0) % 4 + 4) % 4;
    elev = Math.max(0, Math.min(RIDES_MAX_ELEV, elev | 0));
    const port = (dx, dz, dir, h) => ({gx, gz, nx: gx + dx, nz: gz + dz, dir: ((dir % 4) + 4) % 4, h, kind: k.id});
    if (!ridesIsTrack(k.id)) return [];
    if (k.id === 'curve'){
      const ends = [[1,0,0],[0,1,1],[-1,0,2],[0,-1,3]];
      const a = ends[rot], b = ends[(rot + 1) % 4];
      return [port(a[0], a[1], a[2], elev), port(b[0], b[1], b[2], elev)];
    }
    const alongX = (rot % 2 === 0);
    const flip = (rot === 2 || rot === 3);
    if (k.id === 'slope'){
      if (alongX){
        return [
          port(-1, 0, 2, flip ? elev + 1 : elev),
          port( 1, 0, 0, flip ? elev : elev + 1)
        ];
      }
      return [
        port(0, -1, 3, flip ? elev + 1 : elev),
        port(0,  1, 1, flip ? elev : elev + 1)
      ];
    }
    // track + loop: both ends same height
    if (alongX) return [port(-1, 0, 2, elev), port(1, 0, 0, elev)];
    return [port(0, -1, 3, elev), port(0, 1, 1, elev)];
  }
  function ridesPortWorld(port){
    const c = ridesWorld(port.gx, port.gz);
    const [dx, dz] = ridesDirVec(port.dir);
    return {
      x: c.x + dx * (RIDES_CELL / 2),
      y: 0.7 + (port.h || 0) * RIDES_ELEV_Y,
      z: c.z + dz * (RIDES_CELL / 2)
    };
  }
  function ridesPortsMate(a, b){
    if (!a || !b) return false;
    return a.nx === b.gx && a.nz === b.gz && b.nx === a.gx && b.nz === a.gz &&
      ((a.dir + 2) % 4) === b.dir && (a.h | 0) === (b.h | 0);
  }
  function ridesAllPorts(state){
    state = ridesLoad(state);
    const out = [];
    state.pieces.forEach(p => {
      ridesPorts(p).forEach(port => out.push(Object.assign({id: p.id}, port)));
    });
    return out;
  }
  function ridesOpenPorts(state){
    const all = ridesAllPorts(state);
    return all.filter(a => !all.some(b => a.id !== b.id && ridesPortsMate(a, b)));
  }
  function ridesLinked(state, aId, bId){
    const all = ridesAllPorts(state);
    const a = all.filter(p => p.id === aId);
    const b = all.filter(p => p.id === bId);
    return a.some(pa => b.some(pb => ridesPortsMate(pa, pb)));
  }
  function ridesSnap(state, kind, hintGx, hintGz, rot, elev){
    state = ridesLoad(state);
    const k = ridesKind(kind || state.kind);
    if (!k) return {ok:false, why:'kind', gx: hintGx|0, gz: hintGz|0, rot: rot|0, elev: elev|0, snapped:false};
    const preferred = rot == null ? state.rot : ((rot | 0) % 4 + 4) % 4;
    const hx = hintGx | 0, hz = hintGz | 0;
    if (!ridesIsTrack(k.id)){
      const fits = ridesFits(state, k.id, hx, hz, preferred);
      return {ok:fits, why: fits ? 'grid' : 'fit', gx:hx, gz:hz, rot:preferred, elev:0, snapped:false, fits};
    }
    const opens = ridesOpenPorts(state);
    const rots = [preferred, (preferred+1)%4, (preferred+2)%4, (preferred+3)%4];
    let best = null;
    opens.forEach(op => {
      rots.forEach(r => {
        const gx = op.nx, gz = op.nz;
        const el = Math.max(0, Math.min(RIDES_MAX_ELEV, op.h | 0));
        // try this elev, and elev-1 in case a slope's high/low is the other way
        [el, Math.max(0, el - 1)].forEach(ev => {
          if (!ridesFits(state, k.id, gx, gz, r)) return;
          const ports = ridesPorts(k.id, gx, gz, r, ev);
          const mates = ports.filter(p => opens.some(o => ridesPortsMate(p, o)));
          if (!mates.some(p => ridesPortsMate(p, op))) return;
          // Prefer joining more open ends (closing a loop) over keeping the hinted rotation.
          const score = Math.hypot(gx - hx, gz - hz) + (r === preferred ? 0 : 0.15) - mates.length * 3;
          if (!best || score < best.score){
            best = {ok:true, why:'snap', gx, gz, rot:r, elev:ev, snapped:true, fits:true, mate:op, mates:mates.length, score};
          }
        });
      });
    });
    if (best) return best;
    const ev = Math.max(0, elev | 0);
    const fits = ridesFits(state, k.id, hx, hz, preferred);
    return {ok:fits, why: fits ? 'grid' : 'fit', gx:hx, gz:hz, rot:preferred, elev:ev, snapped:false, fits};
  }

  function ridesPushUndo(state, entry){
    state.undo = entry ? {op: entry.op, piece: entry.piece ? Object.assign({}, entry.piece) : null, id: entry.id | 0} : null;
  }

  function ridesPlace(state, kind, gx, gz, rot, owner, opts){
    state = ridesLoad(state);
    const k = ridesKind(kind || state.kind);
    if (!k) return {ok:false, why:'kind', state};
    let r = rot == null ? state.rot : ((rot | 0) % 4 + 4) % 4;
    let x = gx | 0, z = gz | 0;
    let elev = Math.max(0, Math.min(RIDES_MAX_ELEV, (opts && opts.elev) | 0));
    if (opts && opts.snap){
      const s = ridesSnap(state, k.id, x, z, r, elev);
      if (s.ok){ x = s.gx; z = s.gz; r = s.rot; elev = s.elev | 0; }
      else return {ok:false, why:s.why || 'fit', state, snap:s};
    }
    if (!ridesFits(state, k.id, x, z, r)) return {ok:false, why:'fit', state};
    const id = 1 + state.pieces.reduce((m, p) => Math.max(m, p.id | 0), 0);
    const piece = {id, kind:k.id, gx:x, gz:z, rot:r, elev, owner: typeof owner === 'string' ? owner.slice(0, 24) : ''};
    state.pieces.push(piece);
    state.placed++;
    ridesPushUndo(state, {op:'place', id: piece.id, piece});
    const loop = ridesIsTrack(k.id) ? ridesCoasterLoop(state) : {ok:false};
    return {ok:true, why:'ok', state, piece, closed: !!loop.ok};
  }

  function ridesRemove(state, id, who){
    state = ridesLoad(state);
    const i = state.pieces.findIndex(p => p.id === (id | 0));
    if (i < 0) return {ok:false, why:'missing', state};
    const p = state.pieces[i];
    if (who && p.owner && p.owner !== who) return {ok:false, why:'owned', state};
    state.pieces.splice(i, 1);
    ridesPushUndo(state, {op:'remove', id: p.id, piece:p});
    return {ok:true, why:'ok', state, piece:p};
  }

  function ridesSetDelete(state, on){
    state = ridesLoad(state);
    state.del = !!on;
    return state;
  }

  function ridesUndo(state, who){
    state = ridesLoad(state);
    const u = state.undo;
    if (!u || !u.op) return {ok:false, why:'empty', state};
    state.undo = null;
    if (u.op === 'place'){
      const r = ridesRemove(state, u.id, who);
      state = r.state;
      state.undo = null;
      return {ok:r.ok, why:r.why, state, undone:'place', piece:r.piece};
    }
    if (u.op === 'remove' && u.piece){
      const p = u.piece;
      if (!ridesFits(state, p.kind, p.gx, p.gz, p.rot)) return {ok:false, why:'fit', state};
      state.pieces.push({
        id: p.id, kind:p.kind, gx:p.gx, gz:p.gz, rot:p.rot,
        elev: p.elev | 0, owner: p.owner || ''
      });
      state.undo = null;
      const piece = state.pieces[state.pieces.length - 1];
      return {ok:true, why:'ok', state, undone:'remove', piece};
    }
    return {ok:false, why:'empty', state};
  }

  function ridesAt(state, gx, gz){
    state = ridesLoad(state);
    return state.pieces.find(p => ridesCells(p.kind, p.gx, p.gz, p.rot).some(c => c.gx === (gx|0) && c.gz === (gz|0))) || null;
  }

  function ridesCanBoard(piece, riderId){
    if (!piece) return false;
    return true; // friends may ride any placed ride; layouts stay with the owner
  }

  function ridesBoard(state, id, riderId){
    state = ridesLoad(state);
    const p = state.pieces.find(x => x.id === (id | 0));
    if (!p) return {ok:false, why:'missing', state};
    if (!ridesCanBoard(p, riderId)) return {ok:false, why:'deny', state};
    if (ridesIsTrack(p.kind)){
      const loop = ridesCoasterLoop(state);
      if (!loop.ok) return {ok:false, why:'noloop', state, piece:p};
    }
    state.rides++;
    return {ok:true, why:'ok', state, piece:p};
  }

  function ridesWorld(gx, gz){
    const o = (RIDES_GRID * RIDES_CELL) / 2 - RIDES_CELL / 2;
    return {x: (gx|0) * RIDES_CELL - o, z: (gz|0) * RIDES_CELL - o};
  }

  function ridesNeighbor(state, piece, fromId){
    const ports = ridesPorts(piece);
    const all = ridesAllPorts(state);
    for (let i = 0; i < ports.length; i++){
      const mate = all.find(b => b.id !== piece.id && b.id !== fromId && ridesPortsMate(ports[i], b));
      if (mate) return {piece: state.pieces.find(p => p.id === mate.id), via: ports[i], mate};
    }
    // also allow unmatched "from" skip: any mate
    for (let i = 0; i < ports.length; i++){
      const mate = all.find(b => b.id !== piece.id && ridesPortsMate(ports[i], b));
      if (mate && mate.id !== fromId) return {piece: state.pieces.find(p => p.id === mate.id), via: ports[i], mate};
    }
    return null;
  }

  function ridesWalkLoop(state){
    state = ridesLoad(state);
    const tracks = state.pieces.filter(p => ridesIsTrack(p.kind));
    if (tracks.length < 4) return {ok:false, why:'short', count: tracks.length, path:[]};
    const all = ridesAllPorts(state);
    function matesOf(id){
      const mine = all.filter(p => p.id === id);
      const ids = [];
      mine.forEach(a => all.forEach(b => { if (b.id !== id && ridesPortsMate(a, b) && ids.indexOf(b.id) < 0) ids.push(b.id); }));
      return ids;
    }
    let found = null;
    for (const start of tracks){
      const firstNext = matesOf(start.id);
      for (const n0 of firstNext){
        const ids = [start.id, n0];
        let prev = start.id, cur = n0, ok = true;
        while (ids.length < tracks.length + 2){
          const nxts = matesOf(cur).filter(id => id !== prev);
          if (!nxts.length){ ok = false; break; }
          const nxt = nxts[0];
          if (nxt === start.id && ids.length >= 4){ found = ids; break; }
          if (ids.indexOf(nxt) >= 0){ ok = false; break; }
          ids.push(nxt);
          prev = cur; cur = nxt;
        }
        if (found) break;
      }
      if (found) break;
    }
    if (!found) return {ok:false, why:'open', count: tracks.length, path:[]};
    const path = found.map(id => state.pieces.find(p => p.id === id)).filter(Boolean);
    return {ok:true, why:'ok', count: tracks.length, path, ids: found};
  }

  function ridesPathPoints(state){
    const loop = ridesWalkLoop(state);
    if (!loop.ok) return loop;
    const pts = [];
    const pieces = loop.path;
    pieces.forEach((p, i) => {
      const nxt = pieces[(i + 1) % pieces.length];
      const ports = ridesPorts(p);
      const nports = ridesPorts(nxt);
      let leave = ports[0], arrive = nports[0];
      ports.forEach(a => nports.forEach(b => { if (ridesPortsMate(a, b)){ leave = a; arrive = b; } }));
      const enter = ports.find(pr => pr !== leave) || ports[0];
      const a = ridesPortWorld(enter), b = ridesPortWorld(leave);
      const c = ridesWorld(p.gx, p.gz);
      const y0 = 0.7 + (p.elev || 0) * RIDES_ELEV_Y;
      const steps = p.kind === 'loop' ? 12 : (p.kind === 'curve' ? 8 : 4);
      for (let s = 0; s < steps; s++){
        const t = s / steps;
        let x, y, z;
        if (p.kind === 'curve'){
          const ang0 = Math.atan2(a.x - c.x, a.z - c.z);
          const ang1 = Math.atan2(b.x - c.x, b.z - c.z);
          let d = ang1 - ang0;
          while (d > Math.PI) d -= Math.PI * 2;
          while (d < -Math.PI) d += Math.PI * 2;
          const ang = ang0 + d * t;
          const rad = RIDES_CELL / 2;
          x = c.x + Math.sin(ang) * rad;
          z = c.z + Math.cos(ang) * rad;
          y = y0;
        } else if (p.kind === 'loop'){
          x = a.x + (b.x - a.x) * t;
          z = a.z + (b.z - a.z) * t;
          y = y0 + Math.sin(t * Math.PI * 2) * 0.05 + (1 - Math.cos(t * Math.PI * 2)) * 1.35;
        } else {
          x = a.x + (b.x - a.x) * t;
          z = a.z + (b.z - a.z) * t;
          y = a.y + (b.y - a.y) * t;
        }
        const yaw = Math.atan2(b.x - a.x, b.z - a.z);
        pts.push({x, y, z, yaw, id:p.id, kind:p.kind, t});
      }
    });
    return {ok:true, why:'ok', count: pieces.length, path: pieces, points: pts};
  }

  function ridesCoasterLoop(state){
    const w = ridesWalkLoop(state);
    return {ok:w.ok, why:w.why, count:w.count, path:w.path || []};
  }

  function ridesTutStep(state){
    state = ridesLoad(state);
    const i = (state.tut && state.tut.on) ? (state.tut.step | 0) : -1;
    return (i >= 0 && RIDES_TUT[i]) ? Object.assign({index:i, count: RIDES_TUT.length}, RIDES_TUT[i]) : null;
  }
  function ridesTutStart(state){
    state = ridesLoad(state);
    state.tut = {on:true, step:0};
    return {ok:true, state, step: ridesTutStep(state)};
  }
  function ridesTutSkip(state){
    state = ridesLoad(state);
    state.tut = {on:false, step: RIDES_TUT.length - 1};
    state.tutDone = true;
    return {ok:true, state, step:null};
  }
  function ridesTutClose(state){
    state = ridesLoad(state);
    if (state.tut) state.tut.on = false;
    return {ok:true, state, step:null};
  }
  function ridesTutAdvance(state){
    state = ridesLoad(state);
    if (!state.tut || !state.tut.on) return {ok:false, why:'off', state, step:null, advanced:false};
    const i = state.tut.step | 0;
    if (i >= RIDES_TUT.length - 1){
      state.tut.on = false;
      state.tut.step = RIDES_TUT.length - 1;
      state.tutDone = true;
      return {ok:true, state, step:null, advanced:true, done:true};
    }
    state.tut.step = i + 1;
    if (state.tut.step >= RIDES_TUT.length - 1) state.tutDone = true;
    return {ok:true, state, step: ridesTutStep(state), advanced:true, done: state.tut.step >= RIDES_TUT.length - 1};
  }
  function ridesTutNext(state){ return ridesTutAdvance(state); }
  function ridesTutNote(state, ev, kind){
    state = ridesLoad(state);
    if (!state.tut || !state.tut.on) return {ok:true, advanced:false, state, step: ridesTutStep(state)};
    const step = RIDES_TUT[state.tut.step | 0];
    if (!step || !step.need) return {ok:true, advanced:false, state, step: ridesTutStep(state)};
    let hit = false;
    if (step.need.indexOf('place:') === 0){
      hit = ev === 'place' && kind === step.need.slice(6);
    } else if (step.need === 'close'){
      hit = ev === 'place' && ridesCoasterLoop(state).ok;
    } else if (step.need === 'ride'){
      hit = ev === 'board';
    }
    if (!hit) return {ok:true, advanced:false, state, step: ridesTutStep(state)};
    return ridesTutAdvance(state);
  }


  const api = {
    RIDES_KEY, RIDES_VER, RIDES_GRID, RIDES_CELL, RIDES_OLD_GRID, RIDES_ELEV_Y, RIDES_MAX_ELEV,
    RIDES_KINDS, RIDES_TRACKS, RIDES_TUT,
    ridesFresh, ridesLoad, ridesKind, ridesIsTrack, ridesCycleKind, ridesRotate, ridesCells,
    ridesFits, ridesPlace, ridesRemove, ridesSetDelete, ridesUndo, ridesAt, ridesCanBoard, ridesBoard,
    ridesWorld, ridesDirVec, ridesPorts, ridesPortWorld, ridesPortsMate, ridesAllPorts, ridesOpenPorts,
    ridesSnap, ridesLinked, ridesWalkLoop, ridesPathPoints, ridesCoasterLoop,
    ridesTutStep, ridesTutStart, ridesTutSkip, ridesTutClose, ridesTutAdvance, ridesTutNext, ridesTutNote
  };
  root.RidesRules = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
