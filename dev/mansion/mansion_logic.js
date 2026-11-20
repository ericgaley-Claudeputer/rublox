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
    {id:'attic', name:'Attic Hall', emoji:'🚪', hint:'Tip-toe past Nimble the Nook-Ghost and unlock the front door.', spawn:{x:0,y:0.5,z:-78}},
    {id:'conservatory', name:'Moonfern Conservatory', emoji:'🌿', hint:'Water the moonferns in the glowing order.', spawn:{x:20,y:0.5,z:-20}},
    {id:'cellar', name:'Jam Cellar', emoji:'🫙', hint:'Turn the rusty crank, then read the dusty scrap.', spawn:{x:20,y:0.5,z:-40}},
    {id:'chime', name:'Chime Nook', emoji:'🔔', hint:'Play the bells in the secret melody.', spawn:{x:-20,y:0.5,z:-58}},
    {id:'secret', name:'Secret Attic', emoji:'⭐', hint:'A hidden star nook with a bonus puzzle and a special reward.', spawn:{x:20,y:0.5,z:-80}}
  ];
  const MN_PICTURE = [2, 0, 3, 1];
  const MN_FERNS = [1, 3, 0, 2];
  const MN_MELODY = [2, 2, 0, 3];
  const MN_STARS = [2, 0, 1, 3];
  const MN_UPGRADES = [];
  const MN_SECRET_REWARD = 16;
  const MN_DOOR_H = 4.8;
  const MN_SIDE_DOOR_H = 8;
  const MN_DOOR_W = 6;
  const MN_SIDE_DOOR_W = 4;
  const MN_DOORS = [
    {id:'foyer-parlor', a:'foyer', b:'parlor', x:0, z:-10, w:MN_DOOR_W, h:MN_DOOR_H, axis:'z', thick:0.4},
    {id:'parlor-kitchen', a:'parlor', b:'kitchen', x:0, z:-30, w:MN_DOOR_W, h:MN_DOOR_H, axis:'z', thick:0.4},
    {id:'kitchen-library', a:'kitchen', b:'library', x:0, z:-50, w:MN_DOOR_W, h:MN_DOOR_H, axis:'z', thick:0.4},
    {id:'library-attic', a:'library', b:'attic', x:0, z:-70, w:MN_DOOR_W, h:MN_DOOR_H, axis:'z', thick:0.4},
    {id:'hall-conservatory', a:'parlor', b:'conservatory', x:11, z:-19, w:MN_DOOR_W, h:MN_SIDE_DOOR_H, axis:'x', thick:0.5},
    {id:'hall-cellar', a:'kitchen', b:'cellar', x:11, z:-40, w:MN_SIDE_DOOR_W, h:MN_SIDE_DOOR_H, axis:'x', thick:0.5},
    {id:'attic-secret', a:'attic', b:'secret', x:11, z:-78, w:MN_SIDE_DOOR_W, h:MN_SIDE_DOOR_H, axis:'x', thick:0.5},
    {id:'library-chime', a:'library', b:'chime', x:-11, z:-58, w:MN_SIDE_DOOR_W, h:MN_SIDE_DOOR_H, axis:'x', thick:0.5}
  ];

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
    if (o.secretAttic != null) d.secretAttic = Math.max(0, o.secretAttic | 0);
    if (o.starCharm != null) d.starCharm = !!o.starCharm;
    if (o.moonLantern != null) d.moonLantern = !!o.moonLantern;
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
        started: now || 0,
        ferns: [null, null, null, null],
        fernsDone: false,
        conservatoryOpen: false,
        crank: false,
        scrap: false,
        cellarOpen: false,
        chimes: [],
        melodyDone: false,
        chimeOpen: false,
        clockString: false,
        secretOpen: false,
        stars: [null, null, null, null],
        starDone: false,
        secretReward: false,
        moth: {x: 20, z: -80, dir: 1, look: 0, busy: 0}
      }
    };
  }

  function mnNimbleSpeed(less){ return less ? 1.4 : 2.6; }
  function mnNimbleSee(less){ return less ? 3.2 : 5.4; }
  function mnMothSpeed(less){ return less ? 0.7 : 1.3; }
  function mnMothSee(less){ return less ? 2.2 : 3.6; }

  function mnCanEnter(run, roomId){
    if (!run) return false;
    if (roomId === 'foyer') return true;
    if (roomId === 'parlor') return !!run.parlorOpen || !!run.lever;
    if (roomId === 'kitchen') return !!run.pictureDone;
    if (roomId === 'library') return !!run.key;
    if (roomId === 'attic') return !!run.atticOpen || !!run.note2;
    if (roomId === 'conservatory') return !!run.parlorOpen || !!run.lever;
    if (roomId === 'cellar') return !!run.key;
    if (roomId === 'chime') return !!run.key;
    if (roomId === 'secret') return !!run.secretOpen;
    return false;
  }

  function mnTryOpenSecret(run){
    if (!run) return false;
    if (run.clockString && run.melodyDone){
      run.secretOpen = true;
      return true;
    }
    return !!run.secretOpen;
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
    run.conservatoryOpen = true;
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
    run.cellarOpen = true;
    run.chimeOpen = true;
    return {ok:true, why:'ok'};
  }

  function mnWaterFern(run, slot){
    if (!run || run.escaped) return {ok:false, why:'done'};
    if (!mnCanEnter(run, 'conservatory')) return {ok:false, why:'locked'};
    const i = slot | 0;
    if (i < 0 || i > 3) return {ok:false, why:'range'};
    const need = MN_FERNS[run.ferns.filter(v => v != null).length] ;
    run.ferns = (run.ferns || [null, null, null, null]).slice();
    if (i !== need && run.ferns[i] == null){
      run.ferns = [null, null, null, null];
      return {ok:true, why:'reset', done:false, ferns: run.ferns.slice(), text:'The moonferns shimmer and reset. Try the glowing order.'};
    }
    run.ferns[i] = i;
    const done = MN_FERNS.every((needIdx, step) => run.ferns[needIdx] != null || run.ferns.filter(v => v != null).length < 4)
      && MN_FERNS.every((needIdx, step) => {
        const order = run.ferns.map((v, idx) => v == null ? -1 : idx).filter(x => x >= 0);
        // simpler: all four watered and last watering followed sequence
        return true;
      }) && run.ferns.filter(v => v != null).length === 4;
    // Verify order: we require watering in MN_FERNS sequence; reset on wrong one above.
    const ordered = done && MN_FERNS.every((needIdx, step) => {
      // After success all are set; the path to fill them was the sequence because wrong ones reset.
      return run.ferns[needIdx] != null;
    });
    if (ordered){
      run.fernsDone = true;
    }
    return {ok:true, why: ordered ? 'open' : 'water', done: !!ordered, ferns: run.ferns.slice(), text: ordered ? 'The moonferns glow as one! A distant hatch clicks.' : 'A moonfern sips the water.'};
  }

  function mnTurnCrank(run){
    if (!run || run.escaped) return {ok:false, why:'done'};
    if (!run.key) return {ok:false, why:'key'};
    run.crank = true;
    return {ok:true, why:'ok', text:'The rusty crank clunks. A dusty scrap peeks out of a jar.'};
  }

  function mnReadScrap(run){
    if (!run || run.escaped) return {ok:false, why:'done'};
    if (!run.crank) return {ok:false, why:'crank'};
    run.scrap = true;
    return {ok:true, why:'ok', text:'The scrap says: “The tallest clock hides a pull-string.”'};
  }

  function mnPullString(run){
    if (!run || run.escaped) return {ok:false, why:'done'};
    if (!run.scrap) return {ok:false, why:'scrap'};
    run.clockString = true;
    mnTryOpenSecret(run);
    return {ok:true, why:'ok', secret: !!run.secretOpen, text:'The pull-string rings a tiny bell. A whisper says: “Two high chimes, a low one, then the last.”'};
  }

  function mnPlayChime(run, bell){
    if (!run || run.escaped) return {ok:false, why:'done'};
    if (!run.key) return {ok:false, why:'key'};
    const v = bell | 0;
    if (v < 0 || v > 3) return {ok:false, why:'range'};
    run.chimes = (run.chimes || []).slice();
    run.chimes.push(v);
    if (run.chimes.length > MN_MELODY.length) run.chimes = run.chimes.slice(-MN_MELODY.length);
    const done = run.chimes.length === MN_MELODY.length && MN_MELODY.every((need, i) => run.chimes[i] === need);
    if (done){
      run.melodyDone = true;
      mnTryOpenSecret(run);
    }
    return {ok:true, why: done ? 'open' : 'tone', done: !!done, secret: !!run.secretOpen, chimes: run.chimes.slice(), text: done ? (run.secretOpen ? 'The last chime echoes upward. A hidden attic hatch swings open!' : 'The melody is right! Find the foyer clock’s pull-string to finish the chain.') : 'A chime rings out.'};
  }

  function mnPlaceStar(run, slot, tile){
    if (!run || run.escaped) return {ok:false, why:'done'};
    if (!run.secretOpen) return {ok:false, why:'locked'};
    const i = slot | 0, v = tile | 0;
    if (i < 0 || i > 3 || v < 0 || v > 3) return {ok:false, why:'range'};
    run.stars = (run.stars || [null, null, null, null]).slice();
    const already = run.stars.indexOf(v);
    if (already >= 0) run.stars[already] = null;
    run.stars[i] = v;
    const done = MN_STARS.every((need, idx) => run.stars[idx] === need);
    if (done) run.starDone = true;
    return {ok:true, why: done ? 'open' : 'place', done: !!done, stars: run.stars.slice(), text: done ? 'The star charms click and a moon lantern blooms!' : 'You set a star charm.'};
  }

  function mnClaimSecret(run, state){
    if (!run) return {ok:false, why:'no'};
    if (!run.secretOpen) return {ok:false, why:'locked'};
    if (!run.starDone) return {ok:false, why:'puzzle'};
    if (run.secretReward) return {ok:true, why:'have', coins:0, state: mnLoad(state), message:'You already claimed the moon lantern.'};
    run.secretReward = true;
    const st = mnLoad(state);
    st.secretAttic = (st.secretAttic | 0) + 1;
    st.starCharm = true;
    st.moonLantern = true;
    return {ok:true, why:'ok', coins: MN_SECRET_REWARD, state: st, message:'You found the Secret Attic moon lantern! Everyone is okay, and the stars feel friendlier.'};
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

  function mnMothTick(run, dt){
    if (!run || run.escaped || run.room !== 'secret') return run;
    const less = !!run.lessScary;
    const n = run.moth || (run.moth = {x:20, z:-80, dir:1, look:0, busy:0});
    n.busy = Math.max(0, (n.busy || 0) - dt);
    if (n.busy > 0){ n.look = 0; return run; }
    n.z += n.dir * mnMothSpeed(less) * dt;
    if (n.z > -74){ n.z = -74; n.dir = -1; n.busy = less ? 1.8 : 0.9; }
    if (n.z < -86){ n.z = -86; n.dir = 1; n.busy = less ? 1.8 : 0.9; }
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
    if (n.dir > 0 && dx < -0.4) return false;
    if (n.dir < 0 && dx > 0.4) return false;
    return true;
  }

  function mnSeenByMoth(run, px, pz){
    if (!run || run.room !== 'secret' || run.escaped) return false;
    const n = run.moth;
    if (!n || !n.look) return false;
    const less = !!run.lessScary;
    const dx = px - n.x, dz = pz - n.z;
    if (Math.hypot(dx, dz) > mnMothSee(less)) return false;
    if (n.dir > 0 && dz < -0.4) return false;
    if (n.dir < 0 && dz > 0.4) return false;
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
    run.moth = {x: 20, z: -80, dir: 1, look: 0, busy: run.lessScary ? 2 : 1};
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
    const coins = 20 + (run.lessScary ? 0 : 8) + (run.secretReward ? 6 : 0);
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
      nimble: run.nimble ? {x:+run.nimble.x, z:+run.nimble.z, dir:run.nimble.dir, look:run.nimble.look, busy:+run.nimble.busy} : null,
      ferns: (run.ferns || []).slice(),
      fernsDone: !!run.fernsDone,
      crank: !!run.crank,
      scrap: !!run.scrap,
      chimes: (run.chimes || []).slice(),
      melodyDone: !!run.melodyDone,
      clockString: !!run.clockString,
      secretOpen: !!run.secretOpen,
      stars: (run.stars || []).slice(),
      starDone: !!run.starDone,
      secretReward: !!run.secretReward,
      moth: run.moth ? {x:+run.moth.x, z:+run.moth.z, dir:run.moth.dir, look:run.moth.look, busy:+run.moth.busy} : null
    };
  }

  function mnApplyWire(run, snap){
    if (!run || !snap || typeof snap !== 'object') return run;
    ['phase','room','checkpoint'].forEach(k => { if (snap[k] != null) run[k] = snap[k]; });
    ['note1','lever','parlorOpen','pictureDone','kitchenOpen','key','note2','atticOpen','escaped','lessScary','fernsDone','crank','scrap','melodyDone','clockString','secretOpen','starDone','secretReward'].forEach(k => {
      if (snap[k] != null) run[k] = !!snap[k];
    });
    if (Array.isArray(snap.pictures)) run.pictures = snap.pictures.slice(0, 4);
    if (Array.isArray(snap.ferns)) run.ferns = snap.ferns.slice(0, 4);
    if (Array.isArray(snap.chimes)) run.chimes = snap.chimes.slice(0, 8);
    if (Array.isArray(snap.stars)) run.stars = snap.stars.slice(0, 4);
    if (snap.nimble && typeof snap.nimble === 'object') run.nimble = {
      x:+snap.nimble.x, z:+snap.nimble.z, dir:snap.nimble.dir, look:snap.nimble.look, busy:+snap.nimble.busy
    };
    if (snap.moth && typeof snap.moth === 'object') run.moth = {
      x:+snap.moth.x, z:+snap.moth.z, dir:snap.moth.dir, look:snap.moth.look, busy:+snap.moth.busy
    };
    return run;
  }

  function mnEveryoneOkay(){ return MN_CATCH_OK; }
  function mnNoGore(){ return true; }

  return {
    MN_KEY, MN_VER, MN_CATCH_OK, MN_ROOMS, MN_DOORS, MN_DOOR_H, MN_DOOR_W, MN_SIDE_DOOR_H, MN_SIDE_DOOR_W, MN_PICTURE, MN_FERNS, MN_MELODY, MN_STARS, MN_SECRET_REWARD,
    mnRoom, mnFresh, mnLoad, mnSetLessScary, mnInheritLessScary, mnNewRun,
    mnNimbleSpeed, mnNimbleSee, mnMothSpeed, mnMothSee, mnCanEnter, mnTryOpenSecret, mnReadNote, mnFlipLever, mnPlacePicture,
    mnTakeKey, mnWaterFern, mnTurnCrank, mnReadScrap, mnPullString, mnPlayChime, mnPlaceStar, mnClaimSecret,
    mnSetRoom, mnNimbleTick, mnMothTick, mnSeenByNimble, mnSeenByMoth, mnCatch, mnUnlockDoor, mnEscape,
    mnWire, mnApplyWire, mnEveryoneOkay, mnNoGore
  };
});
