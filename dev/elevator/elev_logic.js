/* Wobblevator — original Rublox elevator hop. Ride Bingle's wobbly lift
   between quirky floors. Original names and floors only. Save key rubloxElevator.
   Caught on a floor = everyone is okay, back in the lift, streak resets. No fighting, no gore. */
(function (root) {
  const ELEV_KEY = 'rubloxElevator';
  const ELEV_VER = 2;
  const ELEV_SHOP_EVERY = 8;
  const ELEV_RIDE = 2.4;
  const ELEV_INTER = 2.2;
  const ELEV_BAG_KEEP = 0.3;

  function F(o){ return o; }

  const ELEV_FLOORS = [
    F({id:'pillowpath', name:'Pillow Path', emoji:'🛏️', kind:'obby', seconds:28, coins:6, hint:'Bounce across the pillows to the glowing door.', clear:'door', sky:'#f7d6ea', floor:'#f3d6ea', wall:'#f8eaf2', accent:'#ffd0e8'}),
    F({id:'sockhunt', name:'Sock Hunt', emoji:'🧦', kind:'find', seconds:24, coins:6, hint:'Find Captain Sock’s missing sock and bring it back.', clear:'find', sky:'#cfe0ff', floor:'#dce8ff', wall:'#e8f0ff', accent:'#3a86ff', item:'sock'}),
    F({id:'soapsurge', name:'Soap Surge', emoji:'🫧', kind:'survive', seconds:16, coins:7, hint:'The soap bars zoom around — don’t get slipped!', clear:'timer', sky:'#c8f0ff', floor:'#c8f0ff', wall:'#e4f8ff', accent:'#9fe7ff', haz:'soap'}),
    F({id:'pieparade', name:'Pie Parade', emoji:'🥧', kind:'dodge', seconds:16, coins:7, hint:'Dodge the flying pies until the ding!', clear:'timer', sky:'#ffe6d6', floor:'#ffe6d6', wall:'#fff0e6', accent:'#e07a3f', haz:'pie'}),
    F({id:'chimeorder', name:'Chime Order', emoji:'🔔', kind:'puzzle', seconds:22, coins:8, hint:'Ring the bells in the order Bingle hummed.', clear:'seq', sky:'#efe7ff', floor:'#efe7ff', wall:'#f6f1ff', accent:'#7c5cff', seq:3}),
    F({id:'lanternhall', name:'Lantern Hall', emoji:'🕯️', kind:'creepy', seconds:20, coins:8, hint:'Stay in the moving lantern light and reach the lamp.', clear:'lit', sky:'#141028', floor:'#1a1630', wall:'#2a2448', accent:'#ffe566'}),
    F({id:'tickletiles', name:'Tickle Tiles', emoji:'😆', kind:'funny', seconds:18, coins:6, hint:'Step on the giggle tiles. Avoid the grumpy ones!', clear:'timer', sky:'#e8ffe9', floor:'#e8ffe9', wall:'#f3fff4', accent:'#ffd23f', tiles:true}),
    F({id:'balloonbounce', name:'Balloon Bounce', emoji:'🎈', kind:'dodge', seconds:16, coins:7, hint:'Dodge the bouncy balloons and make it to the door.', clear:'timer', sky:'#fff0f6', floor:'#fff0f6', wall:'#fff7fb', accent:'#ff6fb5', haz:'balloon'}),
    F({id:'lostlunch', name:'Lost Lunch', emoji:'🍱', kind:'find', seconds:22, coins:6, hint:'Niblet lost a lunchbox. Find it before the timer!', clear:'find', sky:'#ffe9c8', floor:'#ffe9c8', wall:'#fff4e0', accent:'#c45c1a', item:'lunch'}),
    F({id:'jellyhills', name:'Jelly Hills', emoji:'🟣', kind:'obby', seconds:28, coins:8, hint:'Boing over the jelly mounds to the door.', clear:'door', sky:'#e5d4ff', floor:'#e5d4ff', wall:'#f0e6ff', accent:'#b57cff'}),
    F({id:'shadowpeek', name:'Shadow Peek', emoji:'👀', kind:'creepy', seconds:20, coins:8, hint:'Walk to the night-light. Don’t linger in the peeks.', clear:'door', sky:'#121018', floor:'#16141f', wall:'#221e2c', accent:'#7c5cff', haz:'peek'}),
    F({id:'partypaint', name:'Party Paint', emoji:'🎨', kind:'funny', seconds:20, coins:7, hint:'Tap the blank faces to give them big silly smiles.', clear:'paint', sky:'#fff4e0', floor:'#fff4e0', wall:'#fffaf0', accent:'#ffd23f', paints:3}),
    F({id:'snackstop', name:'Snack Stop', emoji:'🍪', kind:'shop', seconds:14, coins:4, hint:'A cozy rest. Buy a lucky cookie, or just ride on.', clear:'shop', sky:'#ffe8cc', floor:'#ffe8cc', wall:'#fff3e0', accent:'#c45c1a'}),
    F({id:'confetticannon', name:'Confetti Cannon', emoji:'🎉', kind:'dodge', seconds:15, coins:7, hint:'Confetti bursts out — hop around it until the ding!', clear:'timer', sky:'#fff7d6', floor:'#fff7d6', wall:'#fffbe8', accent:'#ff4d5e', haz:'confetti'}),

    F({id:'cloudsteps', name:'Cloud Steps', emoji:'☁️', kind:'obby', seconds:26, coins:7, hint:'Hop the puffy clouds up to the glowing door.', clear:'door', sky:'#c8e8ff', floor:'#d9f0ff', wall:'#f2fbff', accent:'#ffffff'}),
    F({id:'cheeseramps', name:'Cheese Ramps', emoji:'🧀', kind:'obby', seconds:26, coins:7, hint:'Climb the holey cheese ramps and reach the door.', clear:'door', sky:'#ffe9a8', floor:'#ffe08a', wall:'#fff3c8', accent:'#f0c44c'}),
    F({id:'booknooks', name:'Book Nooks', emoji:'📚', kind:'obby', seconds:26, coins:7, hint:'Climb the stacked storybooks to the door.', clear:'door', sky:'#eadcc8', floor:'#e2d0b4', wall:'#f4eadc', accent:'#c45c1a'}),
    F({id:'buttonbox', name:'Button Box', emoji:'🔘', kind:'find', seconds:22, coins:6, hint:'Find the missing coat button and drop it in the tin.', clear:'find', sky:'#f0e4d8', floor:'#efe0d0', wall:'#f7efe6', accent:'#8b5a2b', item:'button'}),
    F({id:'starmap', name:'Star Map', emoji:'⭐', kind:'find', seconds:22, coins:7, hint:'A star fell out of the map. Bring it back to the desk.', clear:'find', sky:'#1a2048', floor:'#24305c', wall:'#2c3a6e', accent:'#ffd23f', item:'star'}),
    F({id:'teacuptrail', name:'Teacup Trail', emoji:'🍵', kind:'find', seconds:22, coins:6, hint:'Marm’s teacup rolled away. Find it and bring it back.', clear:'find', sky:'#e7f6e8', floor:'#def0df', wall:'#f3faf3', accent:'#2ec27e', item:'cup'}),
    F({id:'leafstorm', name:'Leaf Storm', emoji:'🍃', kind:'survive', seconds:16, coins:7, hint:'Swirling leaves zip by — stay clear until the ding!', clear:'timer', sky:'#f3e0b8', floor:'#e8d59a', wall:'#f8ebd0', accent:'#d08a2f', haz:'leaf'}),
    F({id:'foamflood', name:'Foam Flood', emoji:'🧴', kind:'survive', seconds:16, coins:7, hint:'Foam puddles slide around. Don’t get soaped!', clear:'timer', sky:'#e8f6ff', floor:'#d8eefc', wall:'#f4fbff', accent:'#7ec8ea', haz:'foam'}),
    F({id:'sparklerush', name:'Sparkle Rush', emoji:'✨', kind:'survive', seconds:15, coins:7, hint:'Keep off the zooming sparkles until the ding!', clear:'timer', sky:'#2a1848', floor:'#3a2460', wall:'#4a3078', accent:'#ffd23f', haz:'sparkle'}),
    F({id:'muffinmeteor', name:'Muffin Meteors', emoji:'🧁', kind:'dodge', seconds:16, coins:7, hint:'Fresh muffins are falling. Dodge them until the ding!', clear:'timer', sky:'#ffe4d2', floor:'#ffd8c0', wall:'#fff0e6', accent:'#c45c1a', haz:'muffin'}),
    F({id:'ribbonrain', name:'Ribbon Rain', emoji:'🎀', kind:'dodge', seconds:16, coins:7, hint:'Dodge the looping ribbons and wait for the ding.', clear:'timer', sky:'#ffe0ef', floor:'#ffd0e6', wall:'#fff0f6', accent:'#ff6fb5', haz:'ribbon'}),
    F({id:'colortaps', name:'Color Taps', emoji:'🔴', kind:'puzzle', seconds:22, coins:8, hint:'Tap the color pads in the order they blinked.', clear:'seq', sky:'#fff5d8', floor:'#fff0c4', wall:'#fffaf0', accent:'#3a86ff', seq:3}),
    F({id:'switchrow', name:'Switch Row', emoji:'🔀', kind:'puzzle', seconds:22, coins:8, hint:'Flip the switches in Bingle’s pattern.', clear:'seq', sky:'#dce8dc', floor:'#d0e0d0', wall:'#eaf2ea', accent:'#2ec27e', seq:3}),
    F({id:'hushhallway', name:'Hush Hallway', emoji:'🤫', kind:'creepy', seconds:20, coins:8, hint:'Stay in the soft night-light and reach the lamp.', clear:'lit', sky:'#1c1828', floor:'#241e32', wall:'#322844', accent:'#c9b6ff'}),
    F({id:'atticwink', name:'Attic Wink', emoji:'🖼️', kind:'creepy', seconds:20, coins:8, hint:'Walk to the door. Don’t stand in a winking portrait beam.', clear:'door', sky:'#2a2218', floor:'#3a2e20', wall:'#4a3c2c', accent:'#e8c48a', haz:'wink'}),
    F({id:'honkfloor', name:'Honk Floor', emoji:'📯', kind:'funny', seconds:20, coins:7, hint:'Honk every silly horn. They love the attention.', clear:'paint', sky:'#ffe9a0', floor:'#ffe080', wall:'#fff4c8', accent:'#ff9f1c', paints:3}),
    F({id:'mustachewall', name:'Mustache Wall', emoji:'🥸', kind:'funny', seconds:20, coins:7, hint:'Stick a curly mustache on each blank portrait.', clear:'paint', sky:'#f0e0c8', floor:'#e8d4b4', wall:'#f7ece0', accent:'#5a3a1e', paints:3}),
    F({id:'cocoanook', name:'Cocoa Nook', emoji:'☕', kind:'shop', seconds:14, coins:4, hint:'A warm rest. Buy a lucky cocoa, or just ride on.', clear:'shop', sky:'#f0d4c0', floor:'#e8c8b0', wall:'#f8e6d8', accent:'#8b4a28'}),
    F({id:'goldengong', name:'Golden Gong', emoji:'🥇', kind:'special', seconds:20, coins:12, hint:'A rare stop! Ring the golden gong for a lucky ding.', clear:'seq', sky:'#fff4c0', floor:'#ffe98a', wall:'#fff8d8', accent:'#f0c44c', rare:true, seq:1}),
    F({id:'skyterrace', name:'Sky Terrace', emoji:'🌅', kind:'special', seconds:22, coins:12, hint:'A rare view. Stroll to the sparkling door and take it in.', clear:'door', sky:'#ffc8a0', floor:'#ffd8b8', wall:'#ffe8d4', accent:'#ff7a3a', rare:true}),
    F({id:'twobells', name:'Two Bells', emoji:'🛎️', kind:'coop', seconds:24, coins:8, hint:'Wake both bells. In a group, friends can each take a bell!', clear:'coop', sky:'#e8e4ff', floor:'#ddd8ff', wall:'#f4f2ff', accent:'#7c5cff', coop:true, pads:2}),
    F({id:'sharedbridge', name:'Shared Bridge', emoji:'🌉', kind:'coop', seconds:24, coins:8, hint:'Light both star pads to lower the bridge door. Friends can help!', clear:'coop', sky:'#c8e8e0', floor:'#b8dcd4', wall:'#e0f4f0', accent:'#2ec27e', coop:true, pads:2}),
    F({id:'binglequiz', name:'Bingle’s Quiz', emoji:'❓', kind:'quiz', seconds:24, coins:8, hint:'Walk to the answer Bingle is thinking of and press E / Ⓧ.', clear:'quiz', sky:'#e8f0ff', floor:'#dce6ff', wall:'#f4f7ff', accent:'#3a86ff'}),
    F({id:'echoeggs', name:'Echo Eggs', emoji:'🥚', kind:'memory', seconds:24, coins:8, hint:'The eggs light up. Tap them back in the same order.', clear:'seq', sky:'#fff0d8', floor:'#ffe8c4', wall:'#fff8ec', accent:'#f0c44c', seq:3}),
    F({id:'scarfprint', name:'Scarf Sprint', emoji:'🧣', kind:'race', seconds:16, coins:8, hint:'Race down the scarf path and tag the finish door!', clear:'door', sky:'#ffd8d8', floor:'#ffc8c8', wall:'#ffe8e8', accent:'#e04a4a'}),
    F({id:'blockpicnic', name:'Block Picnic', emoji:'🧱', kind:'stack', seconds:22, coins:8, hint:'Stack picnic blocks until they reach the blanket height.', clear:'stack', sky:'#e8f8d8', floor:'#d8ecbe', wall:'#f4ffe8', accent:'#7cbf3a', need:5}),
    F({id:'cupstack', name:'Cup Stack', emoji:'🥤', kind:'stack', seconds:22, coins:8, hint:'Stack the cups into a tidy tower.', clear:'stack', sky:'#ffe8f0', floor:'#ffd8e6', wall:'#fff4f8', accent:'#ff6fb5', need:5}),
    F({id:'drumdink', name:'Drum Dink', emoji:'🥁', kind:'rhythm', seconds:22, coins:8, hint:'Tap E / Ⓧ when the drum glows. Hit the beat six times!', clear:'rhythm', sky:'#f8e0c8', floor:'#f0d4b4', wall:'#faeee0', accent:'#c45c1a', need:6}),
    F({id:'xylobop', name:'Xylo Bop', emoji:'🎶', kind:'rhythm', seconds:22, coins:8, hint:'Tap E / Ⓧ when a bar lights up. Six good hits wins!', clear:'rhythm', sky:'#e0f0ff', floor:'#d0e6ff', wall:'#f0f7ff', accent:'#3a86ff', need:6}),
    F({id:'whisperwell', name:'Whisper Well', emoji:'🕳️', kind:'secret', seconds:24, coins:14, hint:'A hush of a floor. Find the hidden well-charm and drop it in.', clear:'find', sky:'#1a2830', floor:'#223038', wall:'#2c3c44', accent:'#7ec8c0', secret:true, item:'charm'}),
    F({id:'cocoaflakes', name:'Cocoa Flakes', emoji:'❄️', kind:'holiday', seconds:18, coins:8, hint:'Dodge the cocoa-flakes and wait for the ding!', clear:'timer', sky:'#e8f4ff', floor:'#dcecff', wall:'#f4faff', accent:'#8ec8ff', holiday:true, haz:'flake'}),
    F({id:'mittenmaze', name:'Mitten Maze', emoji:'🧤', kind:'holiday', seconds:26, coins:8, hint:'Hop the mitten pads through the snow to the door.', clear:'door', sky:'#d8eeff', floor:'#f4f8ff', wall:'#e8f4ff', accent:'#e04a4a', holiday:true}),
    F({id:'jinglejog', name:'Jingle Jog', emoji:'🎄', kind:'holiday', seconds:16, coins:8, hint:'Sprint the jingle path and tag the finish door!', clear:'door', sky:'#1a3a28', floor:'#245038', wall:'#2c5c40', accent:'#ffd23f', holiday:true}),
    F({id:'wobblywarden', name:'Wobbly Warden', emoji:'🛡️', kind:'boss', seconds:26, coins:14, hint:'Dodge the pillow giant’s soft stomps, then tag the bell on its hat!', clear:'boss', sky:'#efe0ff', floor:'#e4d2ff', wall:'#f6eeff', accent:'#8b5cf6'}),
    F({id:'drowsydrake', name:'Drowsy Drake', emoji:'🐲', kind:'boss', seconds:26, coins:14, hint:'Stay out of the paper-dragon’s yawn puffs, then ring its bedtime bell!', clear:'boss', sky:'#2a3048', floor:'#323858', wall:'#3c4464', accent:'#9ad0ff'})
  ];

  const ELEV_PALS = [
    {id:'sock', name:'Captain Sock', emoji:'🧦', line:'I packed two socks and only found one. Typical!'},
    {id:'niblet', name:'Niblet', emoji:'🐥', line:'If anyone sees a lunchbox, it is probably mine.'},
    {id:'marm', name:'Marm', emoji:'🧶', line:'I brought extra yarn in case the lift gets drafty.'},
    {id:'taro', name:'Taro', emoji:'📷', line:'Hold still — this wobble makes a great photo!'},
    {id:'sprocket', name:'Sprocket', emoji:'🔧', line:'I tightened every bolt. The wobble is a feature.'}
  ];

  const ELEV_HOST = {id:'bingle', name:'Bingle the Bellhop', emoji:'🛎️', lines:[
    'Going up... or maybe a little sideways!',
    'Hold the handrail. It likes to dance.',
    'Next stop, a surprise! I packed a smile.',
    'Ding-ding! Please keep arms, hats, and socks inside.',
    'If the floor gets too wobbly, we hop back in. Everyone is okay!'
  ]};

  const ELEV_QUIZ = [
    {q:'What does Bingle say at every stop?', a:['Ding-ding!', 'Pizza time', 'Go down'], i:0},
    {q:'What should you keep inside the lift?', a:['Arms, hats, and socks', 'The moon', 'A boat'], i:0},
    {q:'If a floor gets too wobbly, what happens?', a:['Everyone is okay', 'The lift vanishes', 'We take a nap in space'], i:0}
  ];

  function elevFloor(id){ return ELEV_FLOORS.find(f => f.id === id) || null; }
  function elevPal(id){ return ELEV_PALS.find(p => p.id === id) || null; }
  function elevClearMode(f){ return (f && f.clear) || 'door'; }

  const ELEV_CAB_Z = -3.2;
  const ELEV_ROOM_Z = -30;
  const ELEV_FLOOR_TOP = 0.2;
  const ELEV_BODY_R = 0.45;

  function elevRoomOf(f){
    f = typeof f === 'string' ? elevFloor(f) : f;
    if (!f) return null;
    const clear = elevClearMode(f);
    let w = 16, d = 18;
    if (f.tiles){ w = 14; d = 14; }
    else if (clear === 'door'){ w = 16; d = (f.kind === 'race' || f.id === 'skyterrace') ? 22 : 28; }
    else if (clear === 'find'){ w = 18; d = 18; }
    else if (clear === 'timer'){ w = 16; d = 16; }
    else if (clear === 'seq' || clear === 'paint'){ w = 16; d = 14; }
    else if (clear === 'lit'){ w = 16; d = 20; }
    else if (clear === 'shop' || clear === 'stack' || clear === 'rhythm'){ w = 14; d = 14; }
    else if (clear === 'quiz' || clear === 'coop'){ w = 16; d = 16; }
    else if (clear === 'boss'){ w = 18; d = 20; }
    const z = ELEV_ROOM_Z, top = ELEV_FLOOR_TOP, x = 0;
    const front = z + d / 2;
    const hall = (front < ELEV_CAB_Z - 0.05)
      ? {x:0, z:(front + ELEV_CAB_Z) / 2, w:6.4, d:(ELEV_CAB_Z - front) + 0.6, top}
      : null;
    return {w, d, x, z, top, hall, spawn:{x:0, y:top + 0.3, z}};
  }

  function elevSpawnOf(f){
    const room = elevRoomOf(f);
    return room ? {x:room.spawn.x, y:room.spawn.y, z:room.spawn.z, top:room.top} : {x:0, y:0.5, z:ELEV_ROOM_Z, top:ELEV_FLOOR_TOP};
  }

  function elevBoxHit(x, z, box, r){
    if (!box) return false;
    r = r == null ? ELEV_BODY_R : r;
    return Math.abs(x - (box.x || 0)) < (box.w / 2) + r && Math.abs(z - (box.z || 0)) < (box.d / 2) + r;
  }

  function elevOnSolid(x, z, room, r){
    return !!(room && (elevBoxHit(x, z, room, r) || elevBoxHit(x, z, room.hall, r)));
  }

  // Lightweight stand-in for the live physics step, used by tests to prove every
  // floor's spawn stays on the slab (and that a fall is scooped back).
  function elevSimStep(id, seconds, opts){
    opts = opts || {};
    const room = elevRoomOf(id);
    if (!room) return null;
    const spawn = (opts.x != null || opts.z != null)
      ? {x: opts.x != null ? opts.x : 0, y: opts.y != null ? opts.y : room.top + 0.3, z: opts.z != null ? opts.z : room.z}
      : room.spawn;
    const P = {x:spawn.x, y:spawn.y, z:spawn.z, vx:opts.vx || 0, vy:0, vz:opts.vz || 0, onGround:false};
    const GRAV = 45, dt = 1 / (opts.fps || 60), top = room.top;
    let minY = P.y, fell = false, grounded = 0, caught = 0;
    const useNet = opts.catchFall !== false;
    for (let t = 0; t < seconds; t += dt){
      P.vy = Math.max(-40, P.vy - GRAV * dt);
      P.x += P.vx * dt;
      P.z += P.vz * dt;
      P.y += P.vy * dt;
      if (elevOnSolid(P.x, P.z, room, ELEV_BODY_R) && P.vy <= 0 && P.y <= top + 0.35){
        P.y = top; P.vy = 0; P.onGround = true; grounded++;
      } else P.onGround = false;
      if (P.y < minY) minY = P.y;
      if (useNet && P.y < -1){
        P.x = room.spawn.x; P.y = room.spawn.y; P.z = room.spawn.z; P.vx = 0; P.vy = 0; P.vz = 0;
        caught++;
        fell = false;
      } else if (!useNet && P.y < top - 1){
        fell = true;
      }
    }
    return {x:P.x, y:P.y, z:P.z, onGround:P.onGround, minY, fell, caught, grounded, top, room};
  }

  function elevTimerWins(f){
    if (!f) return false;
    const c = elevClearMode(f);
    return c === 'timer' || c === 'shop' || !!f.tiles;
  }

  function elevFresh(){
    return {
      ver: ELEV_VER,
      rides: 0,
      cleared: 0,
      failed: 0,
      best: 0,
      coins: 0,
      seen: [],
      found: 0,
      creepy: 0,
      shopped: 0,
      bag: []
    };
  }

  function elevLoad(raw){
    const d = elevFresh();
    const o = (raw && typeof raw === 'object') ? raw : {};
    d.rides = Math.max(0, o.rides | 0);
    d.cleared = Math.max(0, o.cleared | 0);
    d.failed = Math.max(0, o.failed | 0);
    d.best = Math.max(0, o.best | 0);
    d.coins = Math.max(0, o.coins | 0);
    d.found = Math.max(0, o.found | 0);
    d.creepy = Math.max(0, o.creepy | 0);
    d.shopped = Math.max(0, o.shopped | 0);
    if (Array.isArray(o.seen)) d.seen = o.seen.filter(id => elevFloor(id));
    if (Array.isArray(o.bag)) d.bag = o.bag.filter(id => elevFloor(id));
    d.ver = ELEV_VER;
    return d;
  }

  function elevBuddyAllowed(mp){ return !mp; }
  function elevNoFight(){ return true; }
  function elevNoGore(){ return true; }
  function elevEveryoneOkay(){ return true; }

  function elevSnowOn(flag){
    if (flag != null) return !!flag;
    try { if (typeof evFestOn === 'function') return !!evFestOn(); } catch (e){}
    return false;
  }

  function elevHostLine(n, rand){
    const r = typeof rand === 'function' ? rand : Math.random;
    const i = ((n | 0) >= 0) ? ((n | 0) % ELEV_HOST.lines.length) : Math.floor(r() * ELEV_HOST.lines.length);
    return ELEV_HOST.lines[i];
  }

  function elevPickPal(run, rand){
    if (!run || !run.buddy) return null;
    const r = typeof rand === 'function' ? rand : Math.random;
    const used = run.palId;
    const pool = ELEV_PALS.filter(p => p.id !== used);
    const pick = pool[Math.floor(r() * pool.length)] || ELEV_PALS[0];
    return pick;
  }

  function elevFreshRun(state, now, mp){
    state = elevLoad(state);
    return {
      startedAt: +now || 0,
      phase: 'lobby',
      floor: null,
      last: null,
      t: 0,
      streak: 0,
      survived: 0,
      coins: 0,
      lucky: 0,
      holding: null,
      seq: [],
      seqAt: 0,
      painted: [],
      lit: 1,
      wantFail: false,
      wantClear: false,
      cleared: false,
      failed: false,
      shopDone: false,
      buddy: elevBuddyAllowed(mp),
      mp: !!mp,
      snow: elevSnowOn(),
      palId: null,
      hostLine: elevHostLine(0),
      quote: '',
      bag: (state.bag && state.bag.slice()) || [],
      quiz: null,
      stacked: 0,
      beats: 0,
      misses: 0,
      pads: [],
      bossTag: false,
      beatT: 0
    };
  }

  function elevStartRun(state, now, mp){
    state = elevLoad(state);
    state.rides += 1;
    return {ok:true, state, run: elevFreshRun(state, now, mp)};
  }

  function elevDueShop(run){
    if (!run) return false;
    const n = (run.survived | 0) + 1;
    return n > 0 && n % ELEV_SHOP_EVERY === 0;
  }

  function elevShuffle(ids, rand){
    const r = typeof rand === 'function' ? rand : Math.random;
    const a = ids.slice();
    for (let i = a.length - 1; i > 0; i--){
      const j = Math.floor(r() * (i + 1));
      const t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function elevPool(run, opts){
    opts = opts || {};
    const snow = elevSnowOn(opts.snow != null ? opts.snow : run && run.snow);
    return ELEV_FLOORS.filter(f => {
      if (f.kind === 'shop') return false;
      if (f.secret) return false;
      if (f.holiday && !snow) return false;
      return true;
    });
  }

  function elevRebuildBag(run, rand, opts){
    const pool = elevPool(run, opts).map(f => f.id);
    const avoid = [run && run.last, run && run.floor].filter(Boolean);
    let ids = pool.filter(id => avoid.indexOf(id) < 0);
    if (ids.length < 3) ids = pool.slice();
    run.bag = elevShuffle(ids, rand);
    return run.bag;
  }

  function elevPickShop(run, rand){
    const shops = ELEV_FLOORS.filter(f => f.kind === 'shop');
    const r = typeof rand === 'function' ? rand : Math.random;
    const pool = shops.filter(f => f.id !== run.last);
    return (pool[Math.floor(r() * pool.length)] || shops[0] || elevFloor('snackstop'));
  }

  function elevPickFloor(run, rand, opts){
    opts = opts || {};
    const r = typeof rand === 'function' ? rand : Math.random;
    if (elevDueShop(run)) return elevPickShop(run, rand);
    if (opts.want === 'secret' || (r() < 0.03 && (run.survived | 0) >= 8)){
      const secret = ELEV_FLOORS.filter(f => f.secret && f.id !== run.last);
      if (secret.length) return secret[Math.floor(r() * secret.length)];
    }
    const snow = elevSnowOn(opts.snow != null ? opts.snow : run && run.snow);
    if (snow && (opts.want === 'holiday' || r() < 0.22)){
      const hol = ELEV_FLOORS.filter(f => f.holiday && f.id !== run.last);
      if (hol.length) return hol[Math.floor(r() * hol.length)];
    }
    if (opts.want === 'rare' || ((run.survived | 0) >= 4 && r() < 0.08)){
      const rare = ELEV_FLOORS.filter(f => f.rare && f.id !== run.last);
      if (rare.length) return rare[Math.floor(r() * rare.length)];
    }
    const pool = elevPool(run, opts);
    const keep = Math.max(1, Math.floor(pool.length * ELEV_BAG_KEEP));
    if (!run.bag || run.bag.length <= keep) elevRebuildBag(run, rand, opts);
    let id = run.bag.shift();
    if (id === run.last && run.bag.length){
      run.bag.push(id);
      id = run.bag.shift();
    }
    return elevFloor(id) || pool[0] || ELEV_FLOORS[0];
  }

  function elevBeginFloor(run, floorId, rand){
    if (!run) return run;
    const f = elevFloor(floorId) || elevPickFloor(run, rand);
    run.phase = 'floor';
    run.floor = f.id;
    run.last = f.id;
    run.t = f.seconds;
    run.cleared = false;
    run.failed = false;
    run.wantClear = false;
    run.wantFail = false;
    run.holding = null;
    run.seqAt = 0;
    run.painted = [];
    run.shopDone = false;
    run.lit = 1;
    run.stacked = 0;
    run.beats = 0;
    run.misses = 0;
    run.pads = [];
    run.bossTag = false;
    run.beatT = 0;
    run.quiz = null;
    const r = typeof rand === 'function' ? rand : Math.random;
    const clear = elevClearMode(f);
    if (clear === 'seq'){
      const n = f.seq || 3;
      const bells = [];
      for (let i = 0; i < Math.max(n, 3); i++) bells.push(i);
      run.seq = [];
      const src = bells.slice(0, n);
      for (let i = 0; i < n; i++){
        const j = Math.floor(r() * src.length);
        run.seq.push(src.splice(j, 1)[0]);
      }
    } else run.seq = [];
    if (clear === 'quiz'){
      run.quiz = ELEV_QUIZ[Math.floor(r() * ELEV_QUIZ.length)] || ELEV_QUIZ[0];
    }
    if (clear === 'coop'){
      const n = f.pads || 2;
      run.pads = [];
      for (let i = 0; i < n; i++) run.pads.push(false);
    }
    run.quote = (f.emoji || '') + ' ' + f.name + ' — ' + f.hint;
    return run;
  }

  function elevBeginRide(run, rand, opts){
    if (!run) return run;
    const f = elevPickFloor(run, rand, opts);
    const pal = elevPickPal(run, rand);
    if (pal) run.palId = pal.id;
    run.phase = 'ride';
    run.floor = f.id;
    run.t = ELEV_RIDE;
    run.cleared = false;
    run.failed = false;
    run.wantClear = false;
    run.wantFail = false;
    run.hostLine = elevHostLine((run.survived | 0) + 1, rand);
    run.quote = '🛎️ ' + ELEV_HOST.name + ': "' + run.hostLine + '"';
    return run;
  }

  function elevReward(run, floor){
    const f = floor || elevFloor(run && run.floor);
    if (!f) return 0;
    const streak = (run && run.streak) || 0;
    const bonus = Math.min(8, Math.floor(streak / 3));
    const lucky = (run && run.lucky) || 0;
    const rare = (f.rare || f.secret || f.kind === 'boss') ? 2 : 0;
    return f.coins + bonus + lucky + rare;
  }

  function elevMarkSeen(state, id){
    if (!id) return state;
    if (state.seen.indexOf(id) < 0) state.seen.push(id);
    return state;
  }

  function elevSyncBag(state, run){
    if (run && Array.isArray(run.bag)) state.bag = run.bag.slice();
    return state;
  }

  function elevClearFloor(state, run){
    state = elevLoad(state);
    if (!run || run.cleared) return {ok:false, why:'done', state, run};
    const f = elevFloor(run.floor);
    if (!f) return {ok:false, why:'floor', state, run};
    const pay = elevReward(run, f);
    run.cleared = true;
    run.failed = false;
    run.wantClear = false;
    run.lucky = 0;
    run.streak = (run.streak | 0) + 1;
    run.survived = (run.survived | 0) + 1;
    run.coins = (run.coins | 0) + pay;
    state.cleared += 1;
    state.coins += pay;
    if (run.streak > state.best) state.best = run.streak;
    elevMarkSeen(state, f.id);
    elevSyncBag(state, run);
    if (f.kind === 'find' || f.secret) state.found += 1;
    if (f.kind === 'creepy') state.creepy += 1;
    if (f.kind === 'shop') state.shopped += 1;
    run.phase = 'inter';
    run.t = ELEV_INTER;
    run.quote = '✨ Floor cleared! +' + pay + ' 🪙  ·  Streak ' + run.streak;
    return {ok:true, why:'ok', state, run, pay, floor:f};
  }

  function elevFailFloor(state, run){
    state = elevLoad(state);
    if (!run || run.cleared || run.failed) return {ok:false, why:'done', state, run};
    const f = elevFloor(run.floor);
    run.failed = true;
    run.cleared = false;
    run.wantFail = false;
    run.streak = 0;
    run.holding = null;
    run.lucky = 0;
    state.failed += 1;
    if (f) elevMarkSeen(state, f.id);
    elevSyncBag(state, run);
    run.phase = 'inter';
    run.t = ELEV_INTER;
    run.quote = 'The floor got too wobbly… but everyone is okay! Back in the lift.';
    return {ok:true, why:'ok', state, run, everyoneOkay:true, floor:f};
  }

  function elevBuySnack(state, wallet, run){
    state = elevLoad(state);
    const f = run && elevFloor(run.floor);
    if (!run || !f || f.kind !== 'shop') return {ok:false, why:'shop', state, run, wallet};
    if (run.shopDone) return {ok:false, why:'have', state, run, wallet};
    const cost = 8;
    const coins = Math.max(0, wallet | 0);
    if (coins < cost) return {ok:false, why:'coins', state, run, wallet:coins, need: cost - coins};
    run.shopDone = true;
    run.lucky = 4;
    state.shopped += 1;
    return {ok:true, why:'ok', state, run, wallet: coins - cost, spent:cost};
  }

  function elevRing(run, bell){
    if (!run || run.cleared || run.failed) return {ok:false, why:'done'};
    if ((run.seq || []).length === 0){
      run.wantClear = true;
      return {ok:true, why:'ok'};
    }
    const need = run.seq[run.seqAt | 0];
    if ((bell | 0) !== need){
      run.seqAt = 0;
      return {ok:false, why:'wrong'};
    }
    run.seqAt = (run.seqAt | 0) + 1;
    if (run.seqAt >= run.seq.length) run.wantClear = true;
    return {ok:true, why:'ok'};
  }

  function elevPaint(run, id){
    if (!run || run.cleared || run.failed) return {ok:false, why:'done'};
    if (run.painted.indexOf(id) < 0) run.painted.push(id);
    const f = elevFloor(run.floor);
    const need = (f && f.paints) || 3;
    if (run.painted.length >= need) run.wantClear = true;
    return {ok:true, why:'ok'};
  }

  function elevPickItem(run, item){
    if (!run || run.cleared || run.failed) return {ok:false, why:'done'};
    const f = elevFloor(run.floor);
    const want = (f && f.item) || (f && f.id === 'sockhunt' ? 'sock' : f && f.id === 'lostlunch' ? 'lunch' : 'item');
    if (item !== want) return {ok:false, why:'wrong'};
    run.holding = item;
    return {ok:true, why:'ok'};
  }

  function elevTurnIn(run){
    if (!run || !run.holding) return {ok:false, why:'empty'};
    run.wantClear = true;
    return {ok:true, why:'ok'};
  }

  function elevTouchHazard(run){
    if (!run || run.cleared || run.failed || run.phase !== 'floor') return {ok:false, why:'done'};
    run.wantFail = true;
    return {ok:true, why:'ok'};
  }

  function elevReachDoor(run){
    if (!run || run.cleared || run.failed || run.phase !== 'floor') return {ok:false, why:'done'};
    const f = elevFloor(run.floor);
    if (elevClearMode(f) === 'lit' && !(run.lit > 0.2)) return {ok:false, why:'dark'};
    if (elevClearMode(f) === 'boss' && !run.bossTag) return {ok:false, why:'boss'};
    run.wantClear = true;
    return {ok:true, why:'ok'};
  }

  function elevStayLit(run, lit){
    if (!run) return run;
    run.lit = lit ? 1 : Math.max(0, (run.lit || 0) - 0.15);
    if (run.lit <= 0 && run.phase === 'floor') run.wantFail = true;
    return run;
  }

  function elevQuiz(run, choice){
    if (!run || run.cleared || run.failed) return {ok:false, why:'done'};
    const q = run.quiz;
    if (!q) return {ok:false, why:'quiz'};
    if ((choice | 0) === (q.i | 0)){
      run.wantClear = true;
      return {ok:true, why:'ok'};
    }
    return {ok:false, why:'wrong'};
  }

  function elevStack(run){
    if (!run || run.cleared || run.failed) return {ok:false, why:'done'};
    const f = elevFloor(run.floor);
    run.stacked = (run.stacked | 0) + 1;
    if (run.stacked >= ((f && f.need) || 5)) run.wantClear = true;
    return {ok:true, why:'ok', stacked: run.stacked};
  }

  function elevBeat(run, on){
    if (!run || run.cleared || run.failed) return {ok:false, why:'done'};
    const f = elevFloor(run.floor);
    if (on){
      run.beats = (run.beats | 0) + 1;
      if (run.beats >= ((f && f.need) || 6)) run.wantClear = true;
      return {ok:true, why:'ok', beats: run.beats};
    }
    run.misses = (run.misses | 0) + 1;
    if (run.misses >= 3) run.wantFail = true;
    return {ok:false, why:'miss', misses: run.misses};
  }

  function elevPadStand(run, i, on){
    if (!run || run.cleared || run.failed) return {ok:false, why:'done'};
    if (!run.pads) run.pads = [false, false];
    if (on) run.pads[i | 0] = true;
    if (run.pads.length && run.pads.every(Boolean)) run.wantClear = true;
    return {ok:true, why:'ok', pads: run.pads.slice()};
  }

  function elevBossReady(run){
    if (!run || run.cleared || run.failed) return {ok:false, why:'done'};
    run.bossTag = true;
    return {ok:true, why:'ok'};
  }

  function elevTagBoss(run){
    if (!run || run.cleared || run.failed) return {ok:false, why:'done'};
    if (!run.bossTag) return {ok:false, why:'early'};
    run.wantClear = true;
    return {ok:true, why:'ok'};
  }

  function elevTick(run, dt){
    if (!run) return run;
    let left = Math.max(0, +dt || 0);
    while (left > 0){
      const step = Math.min(0.2, left);
      left -= step;
      run.t = Math.max(0, (run.t || 0) - step);
      if (run.phase === 'ride' && run.t <= 0){
        elevBeginFloor(run, run.floor);
      } else if (run.phase === 'floor' && run.t <= 0 && !run.cleared && !run.failed){
        const f = elevFloor(run.floor);
        if (elevTimerWins(f)) run.wantClear = true;
        else run.wantFail = true;
        break;
      } else if (run.phase === 'floor' && elevClearMode(elevFloor(run.floor)) === 'boss' && !run.bossTag && run.t <= 10){
        run.bossTag = true;
      } else if (run.phase === 'inter' && run.t <= 0){
        elevBeginRide(run);
      }
      if (run.phase === 'floor' && elevClearMode(elevFloor(run.floor)) === 'rhythm'){
        run.beatT = (run.beatT || 0) + step;
      }
    }
    return run;
  }

  function elevFloorSpec(id){
    const f = elevFloor(id);
    return {
      id: id,
      floor: f,
      clear: elevClearMode(f),
      setup: function(run, rand){ return elevBeginFloor(run, id, rand); },
      update: function(run, ev){
        ev = ev || {};
        if (ev.dt) elevTick(run, ev.dt);
        if (ev.hazard) elevTouchHazard(run);
        if (ev.door) elevReachDoor(run);
        if (ev.item) elevPickItem(run, ev.item);
        if (ev.turnIn) elevTurnIn(run);
        if (ev.ring != null) elevRing(run, ev.ring);
        if (ev.paint != null) elevPaint(run, ev.paint);
        if (ev.quiz != null) elevQuiz(run, ev.quiz);
        if (ev.stack) elevStack(run);
        if (ev.beat != null) elevBeat(run, ev.beat);
        if (ev.pad != null) elevPadStand(run, ev.pad, ev.on !== false);
        if (ev.lit != null) elevStayLit(run, ev.lit);
        if (ev.bossReady) elevBossReady(run);
        if (ev.tag) elevTagBoss(run);
        return run;
      },
      win: function(run){ return !!(run && (run.wantClear || run.cleared)); },
      fail: function(run){ return !!(run && (run.wantFail || run.failed)); }
    };
  }

  function elevIndexRows(state, opts){
    state = elevLoad(state);
    const snow = elevSnowOn(opts && opts.snow);
    return ELEV_FLOORS.map(f => {
      const seen = state.seen.indexOf(f.id) >= 0;
      return {
        id: f.id,
        name: (f.secret && !seen) ? '???' : f.name,
        emoji: (f.secret && !seen) ? '❔' : f.emoji,
        kind: f.kind,
        seen: seen,
        secret: !!f.secret,
        holiday: !!f.holiday,
        rare: !!f.rare,
        locked: !!(!seen && f.holiday && !snow)
      };
    });
  }

  function elevBadges(state, run){
    state = elevLoad(state);
    const b = [];
    if ((state.rides | 0) >= 1) b.push('elev-ride');
    if ((run && (run.streak | 0) >= 5) || state.best >= 5) b.push('elev-five');
    if ((run && (run.streak | 0) >= 12) || state.best >= 12) b.push('elev-twelve');
    if ((state.creepy | 0) >= 1) b.push('elev-creepy');
    if ((state.found | 0) >= 1) b.push('elev-find');
    if ((state.seen || []).length >= 25) b.push('elev-seen25');
    if ((state.seen || []).length >= ELEV_FLOORS.length) b.push('elev-seenall');
    return b;
  }

  const api = {
    ELEV_KEY, ELEV_VER, ELEV_SHOP_EVERY, ELEV_RIDE, ELEV_INTER, ELEV_BAG_KEEP, ELEV_FLOORS, ELEV_PALS, ELEV_HOST, ELEV_QUIZ,
    ELEV_CAB_Z, ELEV_ROOM_Z, ELEV_FLOOR_TOP, ELEV_BODY_R,
    elevFloor, elevPal, elevClearMode, elevRoomOf, elevSpawnOf, elevBoxHit, elevOnSolid, elevSimStep, elevTimerWins, elevFresh, elevLoad, elevBuddyAllowed, elevNoFight, elevNoGore, elevEveryoneOkay,
    elevSnowOn, elevHostLine, elevPickPal, elevStartRun, elevDueShop, elevPool, elevRebuildBag, elevPickFloor, elevBeginFloor, elevBeginRide,
    elevReward, elevClearFloor, elevFailFloor, elevBuySnack, elevRing, elevPaint, elevPickItem, elevTurnIn,
    elevTouchHazard, elevReachDoor, elevStayLit, elevQuiz, elevStack, elevBeat, elevPadStand, elevBossReady, elevTagBoss,
    elevTick, elevFloorSpec, elevIndexRows, elevBadges
  };
  root.ElevRules = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
