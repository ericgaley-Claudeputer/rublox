/* Afterbell School — original kid-scary school after dark. Explore, solve
   three puzzles, and slip past the Hush Warden. Getting caught means everyone
   is okay and you return to a checkpoint. Save key rubloxSchool. */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.SchoolRules = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  const SC_KEY = 'rubloxSchool';
  const SC_VER = 1;
  const SC_DOOR_H = 4.2;
  const SC_DOOR_W = 3.6;
  const SC_WALL_H = 6.0;
  const SC_CATCH = 2.4;
  const SC_CATCH_SOFT = 1.7;
  const SC_LOCKER_CODE = '418';
  const SC_RIDDLE = {prompt:'I have a spine but I am not a person. I have pages but I am not a king. What am I?', answer:'book', choices:['bell','book','broom']};

  const SC_ROOMS = [
    {id:'lobby', name:'Front Lobby', x:0, z:22, w:22, d:16, color:'#3a3348', spawn:true},
    {id:'hall', name:'Main Hall', x:0, z:0, w:16, d:28, color:'#2a2438'},
    {id:'class', name:'Classroom', x:-22, z:0, w:28, d:18, color:'#3b2f2a'},
    {id:'library', name:'Library', x:22, z:0, w:28, d:18, color:'#2a3340'},
    {id:'gym', name:'Gym', x:-22.5, z:-26, w:29, d:24, color:'#2e3a2e'},
    {id:'cafe', name:'Cafeteria', x:22.5, z:-26, w:29, d:24, color:'#3a3228'}
  ];
  const SC_DOORS = [
    {id:'lobby-hall', a:'lobby', b:'hall', x:0, z:14, w:SC_DOOR_W, h:SC_DOOR_H, axis:'z', thick:0.42},
    {id:'hall-class', a:'hall', b:'class', x:-8, z:0, w:SC_DOOR_W, h:SC_DOOR_H, axis:'x', thick:0.42},
    {id:'hall-library', a:'hall', b:'library', x:8, z:0, w:SC_DOOR_W, h:SC_DOOR_H, axis:'x', thick:0.42},
    {id:'hall-gym', a:'hall', b:'gym', x:-8, z:-14, w:SC_DOOR_W, h:SC_DOOR_H, axis:'x', thick:0.42},
    {id:'hall-cafe', a:'hall', b:'cafe', x:8, z:-14, w:SC_DOOR_W, h:SC_DOOR_H, axis:'x', thick:0.42}
  ];
  const SC_LOCKER = {x:0, z:-6, r:1.8};
  const SC_BOARD = {x:-26, z:4, r:2.0};
  const SC_PASS_SPOT = {x:26, z:-2, r:1.8};
  const SC_EXIT = {x:0, z:29, r:2.0};
  const SC_DIGITS = [
    {id:'four', n:'4', where:'cafeteria menu', x:26, z:-30, r:1.8},
    {id:'one', n:'1', where:'gym scoreboard', x:-26, z:-30, r:1.8},
    {id:'eight', n:'8', where:'classroom clock', x:-30, z:0, r:1.8}
  ];
  const SC_CHECKPOINTS = [
    {id:'lobby', x:0, y:0.5, z:24},
    {id:'class', x:-26, y:0.5, z:4},
    {id:'library', x:26, y:0.5, z:4},
    {id:'hall', x:0, y:0.5, z:6}
  ];
  const SC_PATROL = [
    {x:0, z:10}, {x:0, z:0}, {x:0, z:-10}, {x:0, z:0}
  ];
  const SC_HIDES = [
    {id:'class-desk', x:-30, z:-4, r:1.6, room:'class'},
    {id:'lib-shelf', x:30, z:4, r:1.6, room:'library'},
    {id:'cafe-table', x:30, z:-24, r:1.6, room:'cafe'}
  ];

  const SC_WARDEN = {id:'hush', name:'the Hush Warden', emoji:'🕯️'};

  function scFresh(){
    return {v:SC_VER, visits:0, lessScary:false, escaped:0, digits:[], riddle:false, locker:false, pass:false, won:false};
  }
  function scLoad(raw){
    const d = scFresh();
    const o = (raw && typeof raw === 'object') ? raw : {};
    d.visits = Math.max(0, o.visits | 0);
    d.lessScary = !!o.lessScary;
    d.escaped = Math.max(0, o.escaped | 0);
    d.digits = Array.isArray(o.digits) ? o.digits.filter((id,i,a) => SC_DIGITS.some(g => g.id===id) && a.indexOf(id)===i) : [];
    d.riddle = !!o.riddle;
    d.locker = !!o.locker;
    d.pass = !!o.pass;
    d.won = !!o.won;
    d.v = SC_VER;
    return d;
  }
  function scSetLessScary(state, on){ state = scLoad(state); state.lessScary = !!on; return state; }
  function scRoomAt(x, z){
    return SC_ROOMS.find(r => Math.abs(x - r.x) <= r.w/2 && Math.abs(z - r.z) <= r.d/2) || null;
  }
  function scCatchRadius(lessScary){ return lessScary ? SC_CATCH_SOFT : SC_CATCH; }
  function scWardenSpeed(lessScary){ return lessScary ? 2.4 : 4.2; }
  function scFreshRun(state){
    state = scLoad(state);
    return {
      wx: 0, wz: 10, wt: 0, wi: 0, mode: 'patrol',
      caught: false, okay: true, checkpoint: 'lobby',
      warn: 0, scare: false
    };
  }
  function scNewVisit(raw){
    const state = scLoad(raw);
    state.visits = (state.visits | 0) + 1;
    return {state, run: scFreshRun(state)};
  }
  function scFindDigit(state, id){
    state = scLoad(state);
    if (!SC_DIGITS.some(d => d.id === id)) return {ok:false, why:'unknown', state};
    if (state.digits.indexOf(id) >= 0) return {ok:false, why:'have', state};
    state.digits = state.digits.concat([id]);
    return {ok:true, why:'found', state, n: SC_DIGITS.find(d => d.id===id).n, left: 3 - state.digits.length};
  }
  function scKnownCode(state){
    state = scLoad(state);
    if (state.digits.length < 3 && !state.riddle) return '';
    return SC_LOCKER_CODE;
  }
  function scSolveRiddle(state, answer){
    state = scLoad(state);
    const a = String(answer || '').trim().toLowerCase();
    if (a !== SC_RIDDLE.answer) return {ok:false, why:'wrong', state};
    state.riddle = true;
    return {ok:true, why:'solved', state, code: SC_LOCKER_CODE};
  }
  function scOpenLocker(state, code){
    state = scLoad(state);
    if (String(code || '') !== SC_LOCKER_CODE) return {ok:false, why:'code', state};
    if (!state.riddle && state.digits.length < 3) return {ok:false, why:'early', state};
    state.locker = true;
    state.pass = true;
    return {ok:true, why:'open', state};
  }
  function scCanExit(state){ state = scLoad(state); return !!state.pass; }
  function scEscape(state){
    state = scLoad(state);
    if (!state.pass) return {ok:false, why:'pass', state};
    if (!state.won){ state.won = true; state.escaped = (state.escaped | 0) + 1; }
    return {ok:true, why:'out', state, reward: 30};
  }
  function scCheckpointOf(id){ return SC_CHECKPOINTS.find(c => c.id === id) || SC_CHECKPOINTS[0]; }
  function scSetCheckpoint(run, id){
    if (!run) return run;
    if (SC_CHECKPOINTS.some(c => c.id === id)) run.checkpoint = id;
    return run;
  }
  function scNearHide(x, z){
    return SC_HIDES.find(h => Math.hypot(x - h.x, z - h.z) <= h.r) || null;
  }
  function scTickWarden(run, dt, opt){
    if (!run) return run;
    const step = Math.max(0, Math.min(0.12, +dt || 0));
    const less = !!(opt && opt.lessScary);
    const px = (opt && opt.px) || 0, pz = (opt && opt.pz) || 0;
    const hidden = !!(opt && opt.hidden);
    run.scare = false;
    run.caught = false;
    const speed = scWardenSpeed(less);
    const pts = SC_PATROL;
    const goal = pts[run.wi | 0] || pts[0];
    const dx = goal.x - (run.wx || 0), dz = goal.z - (run.wz || 0);
    const d = Math.hypot(dx, dz) || 1;
    if (d < 0.6){ run.wi = ((run.wi | 0) + 1) % pts.length; }
    else {
      run.wx = (run.wx || 0) + dx / d * speed * step;
      run.wz = (run.wz || 0) + dz / d * speed * step;
    }
    const dist = Math.hypot((run.wx || 0) - px, (run.wz || 0) - pz);
    const room = scRoomAt(px, pz);
    const inHall = !room || room.id === 'hall' || room.id === 'lobby';
    run.warn = dist < (less ? 10 : 7) && inHall && !hidden ? Math.max(0, 1 - dist / 10) : 0;
    const catchR = scCatchRadius(less);
    if (!hidden && inHall && dist < catchR){
      run.caught = true;
      run.okay = true;
      run.scare = !less;
      const cp = scCheckpointOf(run.checkpoint);
      run.wx = 0; run.wz = 10; run.wi = 0;
      run.respawn = {x:cp.x, y:cp.y, z:cp.z};
    }
    return run;
  }
  function scEveryoneOkay(){ return true; }
  function scFriendsOnly(){ return true; }
  function scNoFight(){ return true; }

  const SC_GORE = [
    {id:'cafe-stain', min:'mild', kind:'stain', x:24, y:0.05, z:-26, yaw:0.3, sx:1.0, sy:0.03, sz:0.7},
    {id:'locker-scratch', min:'mild', kind:'scratch', x:0.4, y:1.4, z:-6, yaw:0, sx:0.04, sy:0.7, sz:0.2},
    {id:'hall-stain', min:'spooky', kind:'stain', x:-2, y:0.05, z:2, yaw:-0.4, sx:1.1, sy:0.03, sz:0.8},
    {id:'class-scratch', min:'spooky', kind:'scratch', x:-24, y:1.5, z:8.9, yaw:0, sx:0.04, sy:0.6, sz:0.2}
  ];

  return {
    SC_KEY, SC_VER, SC_DOOR_H, SC_DOOR_W, SC_WALL_H, SC_CATCH, SC_CATCH_SOFT, SC_LOCKER_CODE, SC_RIDDLE,
    SC_ROOMS, SC_DOORS, SC_LOCKER, SC_BOARD, SC_PASS_SPOT, SC_EXIT, SC_DIGITS, SC_CHECKPOINTS, SC_PATROL, SC_HIDES, SC_WARDEN, SC_GORE,
    scFresh, scLoad, scSetLessScary, scRoomAt, scCatchRadius, scWardenSpeed, scFreshRun, scNewVisit,
    scFindDigit, scKnownCode, scSolveRiddle, scOpenLocker, scCanExit, scEscape,
    scCheckpointOf, scSetCheckpoint, scNearHide, scTickWarden, scEveryoneOkay, scFriendsOnly, scNoFight
  };
});
