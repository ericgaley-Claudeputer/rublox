/* Oakheart Treehouse — original cozy builder. Snap platforms, ladders, rooms,
   a slide and a zipline onto a great oak. Hang out with real friends only.
   Save key rubloxTreehouse. */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.TreehouseRules = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  const TH_KEY = 'rubloxTreehouse';
  const TH_VER = 1;
  const TH_CELL = 2.6;
  const TH_LEVEL = 3.6;
  const TH_MAX_LEVEL = 4;
  const TH_GRID = 9;
  const TH_DOOR_H = 4.2;
  const TH_DOOR_W = 3.6;
  const TH_MAX_PIECES = 48;
  const TH_TRUNK_R = 2.2;

  const TH_KINDS = [
    {id:'platform', name:'Platform', emoji:'🟩', snap:'floor', walk:true},
    {id:'room', name:'Room', emoji:'🏠', snap:'floor', walk:true, room:true},
    {id:'ladder', name:'Ladder', emoji:'🪜', snap:'climb'},
    {id:'rope', name:'Rope climb', emoji:'🪢', snap:'climb'},
    {id:'slide', name:'Slide', emoji:'🛝', snap:'ride'},
    {id:'zip', name:'Zipline post', emoji:'➡️', snap:'ride'},
    {id:'rail', name:'Railing', emoji:'🪵', snap:'trim'},
    {id:'roof', name:'Roof', emoji:'🔺', snap:'trim'},
    {id:'lamp', name:'Lantern', emoji:'🏮', snap:'decor'},
    {id:'flag', name:'Pennant', emoji:'🚩', snap:'decor'},
    {id:'chair', name:'Chair', emoji:'🪑', snap:'furn'},
    {id:'table', name:'Table', emoji:'🪑', snap:'furn'},
    {id:'hammock', name:'Hammock', emoji:'🛏️', snap:'furn'},
    {id:'planter', name:'Flower box', emoji:'🌸', snap:'decor'}
  ];

  function thFresh(){
    return {v:TH_VER, visits:0, pieces:[], undo:[], kind:'platform', rot:0, level:1, del:false};
  }
  function thKind(id){ return TH_KINDS.find(k => k.id === id) || null; }
  function thLoad(raw){
    const d = thFresh();
    const o = (raw && typeof raw === 'object') ? raw : {};
    d.visits = Math.max(0, o.visits | 0);
    d.kind = thKind(o.kind) ? o.kind : 'platform';
    d.rot = ((o.rot | 0) % 4 + 4) % 4;
    d.level = Math.max(0, Math.min(TH_MAX_LEVEL, o.level | 0));
    d.del = !!o.del;
    if (Array.isArray(o.pieces)){
      d.pieces = o.pieces.map(thNormPiece).filter(Boolean).slice(0, TH_MAX_PIECES);
    }
    d.undo = Array.isArray(o.undo) ? o.undo.slice(-20) : [];
    d.v = TH_VER;
    return d;
  }
  function thNormPiece(p){
    if (!p || !thKind(p.kind)) return null;
    const gx = p.gx | 0, gz = p.gz | 0, level = Math.max(0, Math.min(TH_MAX_LEVEL, p.level | 0));
    if (Math.abs(gx) > TH_GRID || Math.abs(gz) > TH_GRID) return null;
    if (gx === 0 && gz === 0) return null; // reserved for the great oak
    return {id: String(p.id || ('p'+gx+','+gz+','+level+p.kind)), kind:p.kind, gx, gz, level, rot:((p.rot|0)%4+4)%4, owner: p.owner || 'me'};
  }
  function thWorld(gx, gz, level){
    return {x: gx * TH_CELL, y: (level || 0) * TH_LEVEL, z: gz * TH_CELL};
  }
  function thAt(state, gx, gz, level){
    state = thLoad(state);
    return state.pieces.find(p => p.gx === gx && p.gz === gz && p.level === (level|0)) || null;
  }
  function thFits(state, kind, gx, gz, level, ignoreId){
    if (!thKind(kind)) return false;
    if (gx === 0 && gz === 0) return false;
    if (Math.abs(gx) > TH_GRID || Math.abs(gz) > TH_GRID) return false;
    if (level < 0 || level > TH_MAX_LEVEL) return false;
    const hit = thAt(state, gx, gz, level);
    if (hit && hit.id !== ignoreId) return false;
    return true;
  }
  function thNeighbors(state, gx, gz, level){
    state = thLoad(state);
    const dirs = [[1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,1],[0,0,-1]];
    return dirs.map(d => thAt(state, gx+d[0], gz+d[1], level+d[2])).filter(Boolean);
  }
  function thSnap(state, kind, hintGx, hintGz, level, rot){
    state = thLoad(state);
    const tries = [];
    const hg = hintGx|0, hz = hintGz|0, lv = level|0;
    tries.push([hg, hz, lv]);
    [[1,0],[0,1],[-1,0],[0,-1],[1,1],[-1,1],[1,-1],[-1,-1]].forEach(d => tries.push([hg+d[0], hz+d[1], lv]));
    if (lv > 0) tries.push([hg, hz, lv-1]);
    if (lv < TH_MAX_LEVEL) tries.push([hg, hz, lv+1]);
    for (let i = 0; i < tries.length; i++){
      const t = tries[i];
      if (!thFits(state, kind, t[0], t[1], t[2])) continue;
      const near = thNeighbors(state, t[0], t[1], t[2]);
      const grounded = t[2] === 0 || near.length > 0 || thAt(state, t[0], t[1], t[2]-1);
      if (t[2] > 0 && !grounded && !thKind(kind).snap) continue;
      if (t[2] > 0 && !grounded && thKind(kind).snap === 'decor') continue;
      if (t[2] > 0 && !thAt(state, t[0], t[1], t[2]-1) && !near.length && thKind(kind).walk) continue;
      return {ok:true, gx:t[0], gz:t[1], level:t[2], rot:((rot|0)%4+4)%4};
    }
    return {ok:false};
  }
  function thPushUndo(state, entry){
    state = thLoad(state);
    state.undo = (state.undo || []).concat([entry]).slice(-20);
    return state;
  }
  function thPlace(state, kind, gx, gz, level, rot, owner, opts){
    state = thLoad(state);
    opts = opts || {};
    if (state.pieces.length >= TH_MAX_PIECES) return {ok:false, why:'full', state};
    let spot = {gx:gx|0, gz:gz|0, level:level|0, rot:((rot|0)%4+4)%4};
    if (opts.snap){
      const s = thSnap(state, kind, spot.gx, spot.gz, spot.level, spot.rot);
      if (!s.ok) return {ok:false, why:'snap', state};
      spot = s;
    } else if (!thFits(state, kind, spot.gx, spot.gz, spot.level)){
      return {ok:false, why:'block', state};
    }
    const piece = thNormPiece({id:'p'+Date.now().toString(36)+Math.floor(Math.random()*999), kind, gx:spot.gx, gz:spot.gz, level:spot.level, rot:spot.rot, owner: owner || 'me'});
    state.pieces.push(piece);
    state = thPushUndo(state, {act:'place', id:piece.id});
    state.del = false;
    return {ok:true, state, piece};
  }
  function thRemove(state, id){
    state = thLoad(state);
    const i = state.pieces.findIndex(p => p.id === id);
    if (i < 0) return {ok:false, why:'missing', state};
    const piece = state.pieces[i];
    state.pieces.splice(i, 1);
    state = thPushUndo(state, {act:'remove', piece});
    return {ok:true, state, piece};
  }
  function thUndo(state){
    state = thLoad(state);
    const last = (state.undo || []).pop();
    if (!last) return {ok:false, why:'empty', state};
    if (last.act === 'place'){
      state.pieces = state.pieces.filter(p => p.id !== last.id);
    } else if (last.act === 'remove' && last.piece && !state.pieces.some(p => p.id === last.piece.id)){
      const p = thNormPiece(last.piece);
      if (p) state.pieces.push(p);
    }
    return {ok:true, state};
  }
  function thSetDelete(state, on){ state = thLoad(state); state.del = !!on; return state; }
  function thCycleKind(state, dir){
    state = thLoad(state);
    const i = Math.max(0, TH_KINDS.findIndex(k => k.id === state.kind));
    const j = (i + (dir < 0 ? -1 : 1) + TH_KINDS.length) % TH_KINDS.length;
    state.kind = TH_KINDS[j].id;
    return state;
  }
  function thRotate(state, dir){
    state = thLoad(state);
    state.rot = ((state.rot + (dir < 0 ? -1 : 1)) % 4 + 4) % 4;
    return state;
  }
  function thSetLevel(state, level){
    state = thLoad(state);
    state.level = Math.max(0, Math.min(TH_MAX_LEVEL, level|0));
    return state;
  }
  function thDoorsFor(piece){
    if (!piece || piece.kind !== 'room') return [];
    return [{id: piece.id + '-door', h: TH_DOOR_H, w: TH_DOOR_W, thick: 0.4, gx: piece.gx, gz: piece.gz, level: piece.level, rot: piece.rot}];
  }
  function thAllDoors(state){
    state = thLoad(state);
    return state.pieces.flatMap(thDoorsFor);
  }
  function thClimbAt(state, x, z, y){
    state = thLoad(state);
    for (let i = 0; i < state.pieces.length; i++){
      const p = state.pieces[i];
      const k = thKind(p.kind);
      if (!k || k.snap !== 'climb') continue;
      const w = thWorld(p.gx, p.gz, p.level);
      if (Math.hypot(x - w.x, z - w.z) <= 1.3 && y >= w.y - 0.4 && y <= w.y + TH_LEVEL + 0.6) return p;
    }
    return null;
  }
  function thRideAt(state, x, z, y){
    state = thLoad(state);
    for (let i = 0; i < state.pieces.length; i++){
      const p = state.pieces[i];
      const k = thKind(p.kind);
      if (!k || k.snap !== 'ride') continue;
      const w = thWorld(p.gx, p.gz, p.level);
      if (Math.hypot(x - w.x, z - w.z) <= 1.6 && Math.abs(y - (w.y + 0.6)) < 1.8) return p;
    }
    return null;
  }
  function thNewVisit(raw){
    const state = thLoad(raw);
    state.visits = (state.visits | 0) + 1;
    return {state, run:{phase:'build'}};
  }
  function thFriendsOnly(){ return true; }

  return {
    TH_KEY, TH_VER, TH_CELL, TH_LEVEL, TH_MAX_LEVEL, TH_GRID, TH_DOOR_H, TH_DOOR_W, TH_MAX_PIECES, TH_TRUNK_R, TH_KINDS,
    thFresh, thKind, thLoad, thWorld, thAt, thFits, thNeighbors, thSnap, thPlace, thRemove, thUndo,
    thSetDelete, thCycleKind, thRotate, thSetLevel, thDoorsFor, thAllDoors, thClimbAt, thRideAt, thNewVisit, thFriendsOnly
  };
});
