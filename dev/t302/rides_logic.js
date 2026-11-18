/* Rideland Workshop — original rides on your lot, friends may ride. Save key rubloxRides. */
(function (root) {
  const RIDES_KEY = 'rubloxRides';
  const RIDES_VER = 1;
  const RIDES_GRID = 8;
  const RIDES_CELL = 3;
  const RIDES_KINDS = [
    {id:'carousel', name:'Sunny Spin Carousel', emoji:'🎠', size:2, color:'#ff9f1c'},
    {id:'swings', name:'Sky Swing Circle', emoji:'🎐', size:2, color:'#3a86ff'},
    {id:'drop', name:'Giggle Drop Tower', emoji:'🗼', size:1, color:'#8b5cf6'},
    {id:'cups', name:'Twirl Cups', emoji:'🍵', size:2, color:'#ff6fb5'},
    {id:'track', name:'Coaster Track', emoji:'🛤️', size:1, color:'#1d2340'},
    {id:'curve', name:'Coaster Curve', emoji:'↩️', size:1, color:'#4b5563'}
  ];

  function ridesFresh(){
    return {ver: RIDES_VER, pieces:[], placed:0, rides:0, kind:'carousel', rot:0};
  }

  function ridesKind(id){ return RIDES_KINDS.find(k => k.id === id) || null; }

  function ridesLoad(raw){
    const d = ridesFresh();
    const o = (raw && typeof raw === 'object') ? raw : {};
    if (Array.isArray(o.pieces)){
      d.pieces = o.pieces.map((p, i) => {
        const kind = ridesKind(p && p.kind);
        if (!kind) return null;
        const gx = p.gx | 0, gz = p.gz | 0;
        if (gx < 0 || gz < 0 || gx >= RIDES_GRID || gz >= RIDES_GRID) return null;
        return {
          id: (p.id | 0) || (i + 1),
          kind: kind.id,
          gx, gz,
          rot: ((p.rot | 0) % 4 + 4) % 4,
          owner: typeof p.owner === 'string' ? p.owner.slice(0, 24) : ''
        };
      }).filter(Boolean).slice(0, 64);
    }
    d.placed = Math.max(d.pieces.length, o.placed | 0);
    d.rides = Math.max(0, o.rides | 0);
    d.kind = ridesKind(o.kind) ? o.kind : 'carousel';
    d.rot = ((o.rot | 0) % 4 + 4) % 4;
    return d;
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

  function ridesPlace(state, kind, gx, gz, rot, owner){
    state = ridesLoad(state);
    const k = ridesKind(kind || state.kind);
    if (!k) return {ok:false, why:'kind', state};
    const r = rot == null ? state.rot : ((rot | 0) % 4 + 4) % 4;
    const x = gx | 0, z = gz | 0;
    if (!ridesFits(state, k.id, x, z, r)) return {ok:false, why:'fit', state};
    const id = 1 + state.pieces.reduce((m, p) => Math.max(m, p.id | 0), 0);
    const piece = {id, kind:k.id, gx:x, gz:z, rot:r, owner: typeof owner === 'string' ? owner.slice(0, 24) : ''};
    state.pieces.push(piece);
    state.placed++;
    return {ok:true, why:'ok', state, piece};
  }

  function ridesRemove(state, id, who){
    state = ridesLoad(state);
    const i = state.pieces.findIndex(p => p.id === (id | 0));
    if (i < 0) return {ok:false, why:'missing', state};
    const p = state.pieces[i];
    if (who && p.owner && p.owner !== who) return {ok:false, why:'owned', state};
    state.pieces.splice(i, 1);
    return {ok:true, why:'ok', state, piece:p};
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
    if (p.kind === 'track' || p.kind === 'curve'){
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

  function ridesCoasterLoop(state){
    state = ridesLoad(state);
    const tracks = state.pieces.filter(p => p.kind === 'track' || p.kind === 'curve');
    if (tracks.length < 4) return {ok:false, why:'short', count: tracks.length};
    const nodes = new Map();
    function key(x,z){ return x + ',' + z; }
    function addEdge(a, b){
      if (!nodes.has(a)) nodes.set(a, new Set());
      nodes.get(a).add(b);
    }
    tracks.forEach(p => {
      const dir = p.rot % 4;
      if (p.kind === 'track'){
        const dx = (dir === 0 || dir === 2) ? 1 : 0;
        const dz = dx ? 0 : 1;
        addEdge(key(p.gx, p.gz), key(p.gx + dx, p.gz + dz));
        addEdge(key(p.gx + dx, p.gz + dz), key(p.gx, p.gz));
        addEdge(key(p.gx, p.gz), key(p.gx - dx, p.gz - dz));
        addEdge(key(p.gx - dx, p.gz - dz), key(p.gx, p.gz));
      } else {
        // curve links two perpendicular neighbors
        const ends = [[1,0],[0,1],[-1,0],[0,-1]];
        const a = ends[dir], b = ends[(dir + 1) % 4];
        addEdge(key(p.gx, p.gz), key(p.gx + a[0], p.gz + a[1]));
        addEdge(key(p.gx + a[0], p.gz + a[1]), key(p.gx, p.gz));
        addEdge(key(p.gx, p.gz), key(p.gx + b[0], p.gz + b[1]));
        addEdge(key(p.gx + b[0], p.gz + b[1]), key(p.gx, p.gz));
      }
    });
    // A loop exists if some node can return to itself with at least 4 hops of track cells.
    const trackSet = new Set(tracks.map(p => key(p.gx, p.gz)));
    let found = false;
    for (const start of trackSet){
      const stack = [[start, start, 0, start]];
      const seen = new Set();
      while (stack.length){
        const [cur, prev, dist, origin] = stack.pop();
        const mark = cur + '>' + prev + ':' + dist;
        if (seen.has(mark)) continue;
        seen.add(mark);
        const nbs = nodes.get(cur) || new Set();
        nbs.forEach(nb => {
          if (nb === prev) return;
          if (nb === origin && dist + 1 >= 4) found = true;
          else if (trackSet.has(nb) && dist < 16) stack.push([nb, cur, dist + 1, origin]);
        });
      }
      if (found) break;
    }
    return {ok:found, why: found ? 'ok' : 'open', count: tracks.length};
  }

  const api = {
    RIDES_KEY, RIDES_VER, RIDES_GRID, RIDES_CELL, RIDES_KINDS,
    ridesFresh, ridesLoad, ridesKind, ridesCycleKind, ridesRotate, ridesCells,
    ridesFits, ridesPlace, ridesRemove, ridesAt, ridesCanBoard, ridesBoard,
    ridesWorld, ridesCoasterLoop
  };
  root.RidesRules = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
