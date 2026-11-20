/* Mallowmist Manor — original kid-scary escape. No gore. Getting caught means everyone is okay. */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.MansionRules = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  const MN_KEY = 'rubloxMansion';
  const MN_VER = 1;
  const MN_CATCH_OK = 'Everyone is okay! You popped back to the last safe room.';
  const MN_ROOMS = [
    {id:'foyer', name:'Foyer', emoji:'🕯️', hint:'A hidden note and a squeaky lever live here.', spawn:{x:0,y:0.5,z:8}},
    {id:'parlor', name:'Parlor', emoji:'🖼️', hint:'Line the portraits up in the right order.', spawn:{x:0,y:0.5,z:-18}},
    {id:'kitchen', name:'Kitchen', emoji:'🔑', hint:'Find the brass key in the snack cupboard.', spawn:{x:0,y:0.5,z:-38}},
    {id:'library', name:'Library', emoji:'📝', hint:'A tucked-away note tells you how to open the attic stair.', spawn:{x:0,y:0.5,z:-58}},
    {id:'attic', name:'Attic Hall', emoji:'🚪', hint:'Tip-toe past Nimble the Nook-Ghost and unlock the front door.', spawn:{x:0,y:0.5,z:-78}}
  ];
  const MN_PICTURE = [2, 0, 3, 1];
  const MN_UPGRADES = [];

  function mnRoom(id){ return MN_ROOMS.find(r => r.id === id) || MN_ROOMS[0]; }

  function mnFresh(){
    return {
      v: MN_VER,
      lessScary: false,
      escapes: 0,
      best: 0,
      caught: 0
    };
  }

  function mnLoad(raw){
    const o = raw && typeof raw === 'object' ? raw : {};
    const d = mnFresh();
    d.lessScary = !!o.lessScary;
    d.escapes = Math.max(0, o.escapes | 0);
    d.best = Math.max(0, o.best | 0);
    d.caught = Math.max(0, o.caught | 0);
    return d;
  }

  function mnSetLessScary(state, on){
    state = mnLoad(state);
    state.lessScary = !!on;
    return state;
  }

  function mnInheritLessScary(loaders){
    try {
      if (loaders && typeof loaders.camp === 'function'){
        const c = loaders.camp();
        if (c && c.lessScary != null) return !!c.lessScary;
      }
    } catch (e){}
    return false;
  }

  function mnNewRun(state, now){
    const st = mnLoad(state);
    return {
      state: st,
      run: {
        phase: 'play',
        room: 'foyer',
        checkpoint: 'foyer',
        note1: false,
        lever: false,
        parlorOpen: false,
        pictures: [null, null, null, null],
        pictureDone: false,
        kitchenOpen: false,
        key: false,
        note2: false,
        atticOpen: false,
        escaped: false,
        caught: 0,
        nimble: {x: 4, z: -78, dir: -1, look: 0, busy: 0},
        lessScary: !!st.lessScary,
        t: 0,
        started: now || 0
      }
    };
  }

  function mnNimbleSpeed(less){ return less ? 1.4 : 2.6; }
  function mnNimbleSee(less){ return less ? 3.2 : 5.4; }

  function mnCanEnter(run, roomId){
    if (!run) return false;
    if (roomId === 'foyer') return true;
    if (roomId === 'parlor') return !!run.parlorOpen || !!run.lever;
    if (roomId === 'kitchen') return !!run.pictureDone;
    if (roomId === 'library') return !!run.key;
    if (roomId === 'attic') return !!run.atticOpen || !!run.note2;
    return false;
  }

  function mnReadNote(run, which){
    if (!run || run.escaped) return {ok:false, why:'done'};
    if (which === 1){
      if (run.room !== 'foyer' && run.checkpoint !== 'foyer') return {ok:false, why:'room'};
      run.note1 = true;
      return {ok:true, text:'The squeaky lever by the stairs opens the parlor.'};
    }
    if (which === 2){
      if (!run.key) return {ok:false, why:'key'};
      run.note2 = true;
      run.atticOpen = true;
      return {ok:true, text:'The attic stair is open. Tip-toe past Nimble to the front door.'};
    }
    return {ok:false, why:'which'};
  }

  function mnFlipLever(run){
    if (!run || run.escaped) return {ok:false, why:'done'};
    if (!run.note1) return {ok:false, why:'note'};
    run.lever = true;
    run.parlorOpen = true;
    return {ok:true, why:'ok'};
  }

  function mnPlacePicture(run, slot, tile){
    if (!run || run.escaped) return {ok:false, why:'done'};
    if (!run.parlorOpen) return {ok:false, why:'locked'};
    const i = slot | 0, v = tile | 0;
    if (i < 0 || i > 3 || v < 0 || v > 3) return {ok:false, why:'range'};
    run.pictures = (run.pictures || [null, null, null, null]).slice();
    const already = run.pictures.indexOf(v);
    if (already >= 0) run.pictures[already] = null;
    run.pictures[i] = v;
    const done = MN_PICTURE.every((need, idx) => run.pictures[idx] === need);
    if (done){
      run.pictureDone = true;
      run.kitchenOpen = true;
    }
    return {ok:true, why: done ? 'open' : 'place', pictures: run.pictures.slice(), done: !!done};
  }

  function mnTakeKey(run){
    if (!run || run.escaped) return {ok:false, why:'done'};
    if (!run.pictureDone) return {ok:false, why:'locked'};
    run.key = true;
    return {ok:true, why:'ok'};
  }

  function mnSetRoom(run, roomId){
    if (!run || !mnCanEnter(run, roomId)) return {ok:false, why:'locked'};
    run.room = roomId;
    run.checkpoint = roomId;
    return {ok:true, room: roomId, spawn: mnRoom(roomId).spawn};
  }

  function mnNimbleTick(run, dt){
    if (!run || run.escaped || run.room !== 'attic') return run;
    const less = !!run.lessScary;
    const n = run.nimble || (run.nimble = {x:4, z:-78, dir:-1, look:0, busy:0});
    n.busy = Math.max(0, (n.busy || 0) - dt);
    if (n.busy > 0){
      n.look = 0;
      return run;
    }
    n.x += n.dir * mnNimbleSpeed(less) * dt;
    if (n.x > 6){ n.x = 6; n.dir = -1; n.busy = less ? 1.4 : 0.6; }
    if (n.x < -6){ n.x = -6; n.dir = 1; n.busy = less ? 1.4 : 0.6; }
    n.look = n.busy > 0 ? 0 : 1;
    return run;
  }

  function mnSeenByNimble(run, px, pz){
    if (!run || run.room !== 'attic' || run.escaped) return false;
    const n = run.nimble;
    if (!n || !n.look) return false;
    const less = !!run.lessScary;
    const dx = px - n.x, dz = pz - n.z;
    const dist = Math.hypot(dx, dz);
    if (dist > mnNimbleSee(less)) return false;
    // Nimble only "sees" in the direction it is walking
    if (n.dir > 0 && dx < -0.4) return false;
    if (n.dir < 0 && dx > 0.4) return false;
    return true;
  }

  function mnCatch(run, state){
    if (!run || run.escaped) return {ok:false, why:'done'};
    run.caught = (run.caught | 0) + 1;
    const st = mnLoad(state);
    st.caught = (st.caught | 0) + 1;
    const room = mnRoom(run.checkpoint || 'foyer');
    run.room = room.id;
    run.nimble = {x: 4, z: -78, dir: -1, look: 0, busy: run.lessScary ? 1.6 : 0.8};
    return {ok:true, why:'ok', message: MN_CATCH_OK, spawn: room.spawn, state: st};
  }

  function mnUnlockDoor(run){
    if (!run) return {ok:false, why:'no'};
    if (!run.key) return {ok:false, why:'key'};
    if (run.room !== 'attic') return {ok:false, why:'room'};
    run.escaped = true;
    run.phase = 'win';
    return {ok:true, why:'ok'};
  }

  function mnEscape(run, state, now){
    const unlocked = mnUnlockDoor(run);
    if (!unlocked.ok) return unlocked;
    const st = mnLoad(state);
    st.escapes = (st.escapes | 0) + 1;
    const elapsed = Math.max(0, ((now || 0) - (run.started || 0)) / 1000);
    if (!st.best || elapsed < st.best) st.best = elapsed || st.best;
    const coins = 20 + (run.lessScary ? 0 : 8);
    return {ok:true, why:'ok', coins: coins, state: st, message:'You slipped out of Mallowmist Manor! Everyone is okay.'};
  }

  function mnWire(run){
    if (!run) return null;
    return {
      phase: run.phase,
      room: run.room,
      checkpoint: run.checkpoint,
      note1: !!run.note1,
      lever: !!run.lever,
      parlorOpen: !!run.parlorOpen,
      pictures: (run.pictures || []).slice(),
      pictureDone: !!run.pictureDone,
      kitchenOpen: !!run.kitchenOpen,
      key: !!run.key,
      note2: !!run.note2,
      atticOpen: !!run.atticOpen,
      escaped: !!run.escaped,
      lessScary: !!run.lessScary,
      nimble: run.nimble ? {x:+run.nimble.x, z:+run.nimble.z, dir:run.nimble.dir, look:run.nimble.look, busy:+run.nimble.busy} : null
    };
  }

  function mnApplyWire(run, snap){
    if (!run || !snap || typeof snap !== 'object') return run;
    ['phase','room','checkpoint'].forEach(k => { if (snap[k] != null) run[k] = snap[k]; });
    ['note1','lever','parlorOpen','pictureDone','kitchenOpen','key','note2','atticOpen','escaped','lessScary'].forEach(k => {
      if (snap[k] != null) run[k] = !!snap[k];
    });
    if (Array.isArray(snap.pictures)) run.pictures = snap.pictures.slice(0, 4);
    if (snap.nimble && typeof snap.nimble === 'object') run.nimble = {
      x:+snap.nimble.x, z:+snap.nimble.z, dir:snap.nimble.dir, look:snap.nimble.look, busy:+snap.nimble.busy
    };
    return run;
  }

  function mnEveryoneOkay(){ return MN_CATCH_OK; }
  function mnNoGore(){ return true; }

  return {
    MN_KEY, MN_VER, MN_CATCH_OK, MN_ROOMS, MN_PICTURE,
    mnRoom, mnFresh, mnLoad, mnSetLessScary, mnInheritLessScary, mnNewRun,
    mnNimbleSpeed, mnNimbleSee, mnCanEnter, mnReadNote, mnFlipLever, mnPlacePicture,
    mnTakeKey, mnSetRoom, mnNimbleTick, mnSeenByNimble, mnCatch, mnUnlockDoor, mnEscape,
    mnWire, mnApplyWire, mnEveryoneOkay, mnNoGore
  };
});
