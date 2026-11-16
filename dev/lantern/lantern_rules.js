/* Pure Lantern Big Top rules — safe to require() in tests and to load in the page. */
(function (root) {
  'use strict';
  const LH_KEY = 'rubloxLantern';
  const LH_VER = 1;
  const LH_HOST = 'Gleam';
  const LH_HOST_TITLE = 'Maestro Gleam';
  const LH_GAME = 'Lantern Big Top';
  const LH_STAMPS = ['star', 'heart', 'circle', 'square', 'squiggle', 'smile', 'lantern', 'swirl'];
  const LH_EYES = 5;
  const LH_COMPANY_R = 8;
  const LH_NEAR_R = 6;
  const LH_SUMMON_R = 8;
  const LH_TAG_R = 1.7;
  const LH_KEY_CD = 120;

  const RATES = {
    isolateDelay: 2,
    darkDelay: 3,
    nearDelay: 0.5,
    isolate: 1,
    dark: 1.25,
    near: 4,
    restore: 2,
    lampRestore: 0.9,
    stareBonus: 1
  };

  function lhTestHash(hash){
    const h = String(hash == null ? '' : hash);
    const m = h.match(/(?:^|#|&)(?:lh|gh)test=([A-Za-z0-9_-]+)/i);
    return m ? m[1].toLowerCase() : '';
  }
  function lhTestActive(hash){ return !!lhTestHash(hash); }

  function lhClampSanity(v){
    v = +v;
    if (!isFinite(v)) return 100;
    return Math.max(0, Math.min(100, v));
  }

  function lhEyeFill(sanity){
    return Math.max(0, Math.min(LH_EYES, Math.round((100 - lhClampSanity(sanity)) / (100 / LH_EYES))));
  }

  function lhSanityDelta(st, dt){
    dt = +dt || 0;
    if (!st || dt <= 0) return 0;
    if (st.glitched || st.cutscene || st.calm || st.banish || st.respawnLock) return 0;
    let drain = 0;
    if (st.nearGlitched){
      st._nearT = (st._nearT || 0) + dt;
      if (st._nearT >= RATES.nearDelay) drain = Math.max(drain, RATES.near + (st.staring ? RATES.stareBonus : 0));
    } else st._nearT = 0;
    const nearLamp = !!st.nearLamp;
    // A lantern (or any lantern light) cancels isolation and darkness drain.
    if (st.isolated && !nearLamp){
      st._isoT = (st._isoT || 0) + dt;
      if (st._isoT >= RATES.isolateDelay) drain = Math.max(drain, RATES.isolate);
    } else st._isoT = 0;
    if (st.dark && !nearLamp){
      st._darkT = (st._darkT || 0) + dt;
      if (st._darkT >= RATES.darkDelay) drain = Math.max(drain, RATES.dark);
    } else st._darkT = 0;
    if (drain > 0) return -drain * dt;
    if (st.company && (st.lit || nearLamp)) return RATES.restore * dt;
    // Alone but near a lantern: same slower "lit, not alone" rate (0.9/s).
    if (nearLamp) return (RATES.lampRestore != null ? RATES.lampRestore : RATES.restore * 0.45) * dt;
    if (st.lit && !st.isolated) return (RATES.lampRestore != null ? RATES.lampRestore : RATES.restore * 0.45) * dt;
    return 0;
  }

  function lhCancelSucceeds(mode, rand){
    const m = String(mode || 'fifty');
    if (m === 'always') return true;
    if (m === 'never') return false;
    const r = typeof rand === 'function' ? rand() : Math.random();
    return r < 0.5;
  }

  function lhHostNameIn(text){
    const t = String(text || '').replace(/#/g, ' ').replace(/[^A-Za-z0-9 ]+/g, ' ');
    return /(^|\s)(gleam|maestro\s+gleam)(\s|$)/i.test(t);
  }

  function lhDefaultSettings(){
    return { glitchedVision: true, muffledSound: true, cancellation: 'fifty', skipKeyholder: false };
  }

  function lhNormalizeSettings(o){
    const d = lhDefaultSettings();
    o = o && typeof o === 'object' ? o : {};
    const c = (o.cancellation === 'always' || o.cancellation === 'never' || o.cancellation === 'fifty') ? o.cancellation : d.cancellation;
    return {
      glitchedVision: o.glitchedVision !== false,
      muffledSound: o.muffledSound !== false,
      cancellation: c,
      skipKeyholder: !!o.skipKeyholder
    };
  }

  function lhLoadState(raw){
    let o = raw;
    if (typeof raw === 'string'){
      try { o = JSON.parse(raw); } catch (e){ o = null; }
    }
    o = o && typeof o === 'object' ? o : {};
    return {
      ver: LH_VER,
      visits: Math.max(0, o.visits | 0),
      settings: lhNormalizeSettings(o.settings),
      doodles: o.doodles && typeof o.doodles === 'object' ? o.doodles : {},
      coins: Math.max(0, +o.coins || 0),
      wallWords: lhSanitizeWallWords(o.wallWords),
      rides: (o.rides && typeof o.rides === 'object') ? o.rides : {},
      tickets: Math.max(0, o.tickets | 0),
      decor: Array.isArray(o.decor) ? o.decor : [],
      wagonStyle: (o.wagonStyle && typeof o.wagonStyle === 'object') ? o.wagonStyle : {}
    };
  }

  function lhStampOk(id){ return LH_STAMPS.indexOf(String(id)) >= 0; }

  function lhAddDoodle(list, stamp, x, y, color){
    if (!lhStampOk(stamp)) return Array.isArray(list) ? list.slice() : [];
    const out = Array.isArray(list) ? list.slice() : [];
    if (out.length >= 40) out.shift();
    const col = /^#[0-9a-fA-F]{6}$/.test(String(color || '')) ? String(color) : '#ff6b9a';
    out.push({
      stamp: String(stamp),
      x: Math.max(0, Math.min(1, +x || 0)),
      y: Math.max(0, Math.min(1, +y || 0)),
      color: col
    });
    return out;
  }

  // Staggered ground heights so stacked floors never share a plane (z-fighting fix).
  // Keep gaps at least 0.02 so a tight camera near/far cannot flicker.
  const LH_Y = {grass: 0, path: 0.03, floor: 0.07, runner: 0.10, ring: 0.13, pad: 0.16, wagon: 0.22};
  const LH_CAM_NEAR = 0.2;
  const LH_CAM_FAR = 280;
  /* Walls must be taller than a jump (JUMP^2 / 2GRAV ≈ 2.84) and taller than the old 3.2 shell,
     which was also built with plat() top=h/2, so the visible top was only 1.6. */
  const LH_WAGON_H = 5.6;
  const LH_MIDWAY_WALL_H = 5.6;
  const LH_DOOR_OPEN_H = 3.2;
  const LH_KNOCK_COOLDOWN = 7;
  const LH_KNOCK_TIMEOUT = 10;
  const LH_KNOCK_SOLO_OPEN = 0.5;
  const LH_STATIC_PERIOD = 1.2; // seconds; 2 steps → ~1.67 flashes/sec, under 3
  const LH_STATIC_MAX_HZ = 3;

  const LH_LAMP_R = 5;
  const LH_WAGONS_PER_SIDE = 10;
  const LH_WAGON_COUNT = 20;
  const LH_WAGON_SPACING = 8;
  const LH_WAGON_Z0 = 22;
  const LH_WAGON_X = 16;
  const LH_WAGON_ZS = (function(){
    const zs = [];
    for (let i = 0; i < LH_WAGONS_PER_SIDE; i++) zs.push(LH_WAGON_Z0 + i * LH_WAGON_SPACING);
    return zs;
  })();
  const LH_MIDWAY_WALL_X = 5.2;
  const LH_MIDWAY_Z0 = 14;
  const LH_MIDWAY_Z1 = 102;
  const LH_DOOR_HALF = 1.35;
  const LH_TENT_W = 56;
  const LH_TENT_X = 28;
  const LH_TENT_Z0 = -22;
  const LH_TENT_Z1 = 14;
  const LH_RING_R = 9;
  const LH_RING_Z = -4;
  const LH_FLAP_Z = -4;
  const LH_CELLAR_Z = 200;
  const LH_GRASS_W = 220;
  const LH_GRASS_D = 220;
  const LH_WOODS_X = -92;

  function lhWagonZs(){ return LH_WAGON_ZS.slice(); }
  function lhWagonCount(){ return LH_WAGON_COUNT; }
  function lhDoorTarget(side, closed){
    return closed ? 0 : -(+side || 1) * 1.9;
  }
  // Auto-open only when the owner approaches from OUTSIDE after leaving.
  // A door the player just closed must stay shut while they remain near it.
  function lhDoorShouldAutoOpen(st){
    st = st || {};
    if (st.holdClosed) return false;
    if (st.inside) return false;
    return !!(st.near && st.closed && !st.auto);
  }
  function lhGroundGapOk(a, b){
    return Math.abs((+a || 0) - (+b || 0)) >= 0.02;
  }
  function lhMapLayout(){
    return {
      bounds: {x0: -110, x1: 55, z0: -105, z1: 125},
      tent: {x: 0, z: -4, w: LH_TENT_W, d: LH_TENT_Z1 - LH_TENT_Z0},
      midway: {x: 0, z: (LH_MIDWAY_Z0 + LH_MIDWAY_Z1) / 2, w: LH_MIDWAY_WALL_X * 2, d: LH_MIDWAY_Z1 - LH_MIDWAY_Z0},
      wagonX: LH_WAGON_X,
      wagonZs: lhWagonZs(),
      zones: [
        {id: 'food', name: 'Food Court', x: -62, z: 8, w: 36, d: 24, color: '#ffd0e8'},
        {id: 'games', name: 'Games Alley', x: -62, z: 40, w: 40, d: 32, color: '#d0f0ff'},
        {id: 'rides', name: 'Rides', x: -72, z: -32, w: 44, d: 36, color: '#ffe29a'},
        {id: 'funhouse', name: 'Funhouse', x: -50, z: 22, w: 16, d: 14, color: '#e0c4ff'},
        {id: 'pond', name: 'Lantern Pond', x: -42, z: -18, w: 18, d: 16, color: '#8ecaff'},
        {id: 'woods', name: 'Backlot', x: -100, z: -10, w: 28, d: 90, color: '#1a2a18'}
      ]
    };
  }

  function lhMidwayWallSegments(z0, z1, gaps, half){
    z0 = z0 == null ? LH_MIDWAY_Z0 : z0;
    z1 = z1 == null ? LH_MIDWAY_Z1 : z1;
    gaps = gaps || LH_WAGON_ZS;
    half = half == null ? LH_DOOR_HALF : half;
    const segs = [];
    let cursor = z0;
    gaps.forEach(gz => {
      const a = gz - half, b = gz + half;
      if (a > cursor + 0.05) segs.push({z0: cursor, z1: a});
      cursor = Math.max(cursor, b);
    });
    if (cursor < z1 - 0.05) segs.push({z0: cursor, z1: z1});
    return segs;
  }
  function lhMidwayBlocksSide(z, segs){
    segs = segs || lhMidwayWallSegments();
    z = +z || 0;
    return segs.some(s => z >= s.z0 && z <= s.z1);
  }
  function lhNearLamp(px, pz, lamps, r){
    r = r == null ? LH_LAMP_R : r;
    lamps = lamps || [];
    for (let i = 0; i < lamps.length; i++){
      if (lhNear(px, pz, lamps[i].x, lamps[i].z, r)) return true;
    }
    return false;
  }

  function lhNear(ax, az, bx, bz, r){
    const dx = (+ax || 0) - (+bx || 0), dz = (+az || 0) - (+bz || 0);
    return dx * dx + dz * dz <= (r || 0) * (r || 0);
  }

  function lhDist(ax, az, bx, bz){
    const dx = (+ax || 0) - (+bx || 0), dz = (+az || 0) - (+bz || 0);
    return Math.sqrt(dx * dx + dz * dz);
  }

  function lhSummonOk(targetGlitched, dist, radius, callerGlitched){
    if (callerGlitched) return false;
    if (!targetGlitched) return false;
    return (+dist || 99) <= (radius == null ? LH_SUMMON_R : radius);
  }

  // A fizzled (glitched) player cannot summon the ringmaster, in solo or MP.
  function lhSummonBlocked(st){
    st = st || {};
    return !!st.glitched;
  }

  function lhSummonDeniedMsg(){
    return '🎩 ' + LH_HOST_TITLE + ': “I can\'t hear you while you\'re fizzled.”';
  }

  function lhCensored(text){
    const t = String(text || '').trim();
    return t.length > 0 && /^#+$/.test(t);
  }

  const LH_BADGES = [
    {id:'lh-welcome', real:'Welcome!', realDesc:'To your new home!', name:'Welcome In', desc:'Check in to Lantern Big Top for the first time.', emoji:'🏮', coins:5, note:'lh:welcome'},
    {id:'lh-back', real:'Welcome back', realDesc:'Enjoying your stay, huh?', name:'Back Again', desc:'Return to Lantern Big Top for another stay.', emoji:'🔑', coins:5, note:'lh:back'},
    {id:'lh-fizzle', real:"I don't feel well...", realDesc:'Go insane and abstract.', name:'All Fizzled Out', desc:'Let your Sanity run out and fizzle.', emoji:'👁️', coins:15, note:'lh:fizzle'},
    {id:'lh-breath', real:'God you look stupid...', realDesc:'Experience a panic attack.', name:'Take a Breath', desc:'Have a calm-down moment and restore your Sanity.', emoji:'😮‍💨', coins:10, note:'lh:breath'},
    {id:'lh-cellar', real:'And into the cellar you go!', realDesc:'Get found and sent to the cellar by Caine.', name:'Down to the Cellar', desc:'Get sent to the cellar by Maestro Gleam.', emoji:'🚪', coins:15, note:'lh:cellar'},
    {id:'lh-keys', real:"I've got keys everywhere!", realDesc:'Be selected as the keyholder.', name:'Key Bunch', desc:'Be picked as the Key Holder.', emoji:'🔑', coins:10, note:'lh:keys'},
    {id:'lh-find', real:'What... is that?', realDesc:"Unlock someone's room and find them abstracted. (Keyholder)", name:"Who's in There?", desc:'As Key Holder, unlock a room and find a fizzled guest.', emoji:'🫣', coins:15, note:'lh:find'},
    {id:'lh-tagged', real:'Whoa Kaufmo, listen!', realDesc:'Get attacked by an abstracted person.', name:'Too Close!', desc:'Get tagged by a fizzled guest.', emoji:'💨', coins:10, note:'lh:tagged'},
    {id:'lh-song', real:'Daisy, Daisy...', realDesc:'Witness Caine singing "Daisy Bell" outside your room.', name:'Midway Serenade', desc:'Hear Maestro Gleam singing outside your wagon.', emoji:'🎵', coins:10, note:'lh:song'},
    {id:'lh-exit', real:'I-I swear, I saw one!', realDesc:'Encounter an exit door.', name:'Was That a Door?', desc:'Spot a mysterious exit door.', emoji:'🚪', coins:10, note:'lh:exit'},
    {id:'lh-words', real:'No foul language around here!', realDesc:'Have your mouth censored by the swear bar.', name:'Watch Your Words', desc:'Have a chat line filtered by the circus word filter.', emoji:'📛', coins:5, note:'lh:words'},
    {id:'lh-vision', real:'A stare of bad luck...', realDesc:"Start seeing things that aren’t there.", name:'Seeing Things', desc:'Start seeing odd shapes when your Sanity gets low.', emoji:'🌀', coins:10, note:'lh:vision'},
    {id:'lh-enough', real:'WHY DO YOU TORMENT ME?', realDesc:'Get Caine to successfully crash out.', name:"That's Enough!", desc:'Get Maestro Gleam all worked up.', emoji:'😤', coins:15, note:'lh:enough'},
    {id:'lh-all', real:'They abandoned me...', realDesc:'Witness Caine having a meltdown by everyone abstracting.', name:"Everyone's Fizzled", desc:"Watch Maestro Gleam's meltdown when every guest has fizzled.", emoji:'😵', coins:20, note:'lh:all'},
    {id:'lh-vesper', real:'Hello neighbor, welcome home!', realDesc:'Encounter Eniac on your current server. (Secret)', name:'Mystery Guest', desc:'Meet the late-night visitor under the big top.', emoji:'🌙', coins:20, note:'lh:vesper', secret:true},
    {id:'lh-peek', real:'Peekaboo.', realDesc:'Get abstracted by Eniac. (Secret)', name:'Gotcha!', desc:'Get fizzled by the late-night visitor.', emoji:'👀', coins:20, note:'lh:peek', secret:true},
    {id:'lh-ride', name:'First Spin', desc:'Hop on a fairground ride.', emoji:'🎡', coins:10, note:'lh:ride'},
    {id:'lh-rides', name:'Ride the Midway', desc:'Take a turn on the Ferris wheel, the carousel, and the swing ride.', emoji:'🎠', coins:15, note:'lh:rides'}
  ];


  const LH_WALL_PRESETS = ['HELP', 'EXIT', 'GET OUT', 'RUN', 'BEHIND YOU', "DON'T LOOK", 'NO EXIT', 'GO BACK', 'HIDE', 'LOOK UP'];
  const LH_WALL_MAX_CHARS = 12;
  const LH_WALL_MAX_PER_PLAYER = 20;
  const LH_WALL_MAX_DIST = 3.4;
  const LH_PII_REASONS = ['email', 'url', 'phone', 'digits', 'address', 'handle', 'social', 'age', 'contact'];

  function lhRoomContains(R, x, z, pad){
    if (!R) return false;
    const w = +(R.w != null ? R.w : 8);
    const d = +(R.d != null ? R.d : 6.2);
    const m = pad == null ? 0.05 : +pad;
    return Math.abs((+x || 0) - (+R.x || 0)) <= w / 2 - m && Math.abs((+z || 0) - (+R.z || 0)) <= d / 2 - m;
  }

  function lhDoorAjar(door){
    if (!door) return false;
    if (!door.closed) return true;
    return Math.abs(+door.ang || 0) > 0.4;
  }

  /* Interior is visible when the local viewer is inside the wagon, or the door is open. */
  function lhRoomInteriorVisible(R, viewer){
    if (!R) return false;
    if (viewer && lhRoomContains(R, viewer.x, viewer.z, 0.02)) return true;
    return lhDoorAjar(R.door);
  }

  /* Solid doorway: a 2.24-wide, 2.4-tall opening, a transom above, and a slightly oversized door leaf that seals the gap when shut. */
  function lhDoorwayLayout(R){
    R = R || {};
    const w = +(R.w != null ? R.w : 8);
    const d = +(R.d != null ? R.d : 6.2);
    const h = +(R.h != null ? R.h : LH_WAGON_H);
    const side = R.side == null ? 1 : +R.side;
    const x = +R.x || 0;
    const z = +R.z || 0;
    const openW = 2.24;
    const openH = Math.min(LH_DOOR_OPEN_H, Math.max(2.2, h - 0.8));
    const ix = x - side * (w / 2);
    const stubD = (d - openW) / 2;
    const stubOff = openW / 2 + stubD / 2;
    const transomH = Math.max(0, h - openH);
    return {
      w, d, h, side, x, z, ix,
      openW, openH,
      transomH: transomH,
      transomY: openH + transomH / 2,
      transomTop: h,
      transomD: openW + 0.08,
      wallTop: h,
      stubD, stubOff,
      stubZ0: z - stubOff,
      stubZ1: z + stubOff,
      hingeZ: z - openW / 2,
      doorThick: 0.16,
      doorH: openH + 0.04,
      doorD: openW + 0.06,
      doorY: (openH + 0.04) / 2
    };
  }

  function lhDoorSealsOpening(layout){
    layout = layout || lhDoorwayLayout({});
    const z0 = layout.z - layout.openW / 2;
    const z1 = layout.z + layout.openW / 2;
    const doorZ0 = layout.hingeZ;
    const doorZ1 = layout.hingeZ + layout.doorD;
    const coversZ = doorZ0 <= z0 + 0.001 && doorZ1 >= z1 - 0.001;
    const doorCoversY = layout.doorH >= layout.openH - 0.001;
    const transomTop = layout.transomTop != null ? layout.transomTop : (layout.transomY + layout.transomH / 2);
    const transomBot = transomTop - layout.transomH;
    const transomCoversY = layout.transomH <= 0.001 ? (layout.doorH >= layout.h - 0.001) : (transomBot <= layout.openH + 0.02 && transomTop >= layout.h - 0.001);
    return !!(coversZ && doorCoversY && transomCoversY);
  }

  function lhWagonWallPlanes(R){
    if (!R) return [];
    const w = +(R.w != null ? R.w : 8);
    const d = +(R.d != null ? R.d : 6.2);
    const h = +(R.h != null ? R.h : LH_WAGON_H);
    const y0 = R.floorY != null ? +R.floorY : 0.22;
    const y1 = h;
    const midY = (y0 + y1) / 2;
    const hw = w / 2, hd = d / 2;
    const side = R.side == null ? 1 : +R.side;
    return [
      {id:'back', axis:'x', pos: R.x + side * hw, x: R.x + side * hw, z: R.z, y: midY, hx: 0, hz: hd, y0, y1, nx: -side, ny: 0, nz: 0, room: R.id, w: d, h: y1 - y0},
      {id:'door', axis:'x', pos: R.x - side * hw, x: R.x - side * hw, z: R.z, y: midY, hx: 0, hz: hd, y0, y1, nx: side, ny: 0, nz: 0, room: R.id, w: d, h: y1 - y0},
      {id:'south', axis:'z', pos: R.z - hd, x: R.x, z: R.z - hd, y: midY, hx: hw, hz: 0, y0, y1, nx: 0, ny: 0, nz: 1, room: R.id, w: w, h: y1 - y0},
      {id:'north', axis:'z', pos: R.z + hd, x: R.x, z: R.z + hd, y: midY, hx: hw, hz: 0, y0, y1, nx: 0, ny: 0, nz: -1, room: R.id, w: w, h: y1 - y0}
    ];
  }

  function lhRayWall(ox, oy, oz, dx, dy, dz, planes, maxDist){
    maxDist = maxDist == null ? LH_WALL_MAX_DIST : +maxDist;
    ox = +ox || 0; oy = +oy || 0; oz = +oz || 0;
    dx = +dx || 0; dy = +dy || 0; dz = +dz || 0;
    let best = null, bestT = maxDist;
    (planes || []).forEach(p => {
      if (!p) return;
      let t;
      if (p.axis === 'x'){
        if (Math.abs(dx) < 1e-6) return;
        t = (p.pos - ox) / dx;
      } else if (p.axis === 'z'){
        if (Math.abs(dz) < 1e-6) return;
        t = (p.pos - oz) / dz;
      } else {
        const nx = +p.nx || 0, ny = +p.ny || 0, nz = +p.nz || 0;
        const den = nx * dx + ny * dy + nz * dz;
        if (Math.abs(den) < 1e-6) return;
        t = ((+p.x || 0) - ox) * nx + ((+p.y || 0) - oy) * ny + ((+p.z || 0) - oz) * nz;
        t = t / den;
      }
      if (!(t > 0.12) || t > bestT) return;
      const hx = ox + dx * t, hy = oy + dy * t, hz = oz + dz * t;
      const y0 = p.y0 != null ? p.y0 : 0.2, y1 = p.y1 != null ? p.y1 : LH_WAGON_H;
      if (hy < y0 || hy > y1) return;
      if (p.axis === 'x'){
        const c = p.z != null ? p.z : 0, half = p.hz != null ? p.hz : ((p.w || 3) / 2);
        if (Math.abs(hz - c) > half + 0.001) return;
      } else {
        const c = p.x != null ? p.x : 0, half = p.hx != null ? p.hx : ((p.w || 4) / 2);
        if (Math.abs(hx - c) > half + 0.001) return;
      }
      const nx = +p.nx || 0, nz = +p.nz || 0;
      const den = nx * dx + nz * dz;
      const interior = den < 0;
      bestT = t;
      best = {
        t, x: hx, y: hy, z: hz,
        nx: interior ? nx : -nx, ny: 0, nz: interior ? nz : -nz,
        room: p.room, wall: p.id, interior, plane: p
      };
    });
    return best;
  }

  function lhNormalizeWallText(raw, opts){
    opts = opts || {};
    let src = String(raw == null ? '' : raw).replace(/\s+/g, ' ').trim();
    if (!src) return {ok: false, reason: 'empty', text: '', preset: false};
    const max = opts.max != null ? opts.max : LH_WALL_MAX_CHARS;
    if (src.length > max) src = src.slice(0, max);
    const upper = src.toUpperCase();
    const isPreset = LH_WALL_PRESETS.indexOf(upper) >= 0;
    if (isPreset) return {ok: true, text: upper, preset: true, blocked: false, reasons: []};
    const mode = opts.chatMode || 'on';
    if (mode === 'off' || mode === 'quick'){
      return {ok: false, reason: 'presets-only', text: '', preset: false};
    }
    const filter = opts.chatFilter || (typeof chatFilter === 'function' ? chatFilter : null);
    if (filter){
      const r = filter(src, {max: max});
      const reasons = r && r.reasons ? r.reasons : [];
      const pii = reasons.some(x => LH_PII_REASONS.indexOf(x) >= 0);
      if (pii) return {ok: false, reason: 'pii', text: '', display: '####', blocked: true, reasons: reasons};
      const text = String((r && r.text) || '');
      if (!text || /^#+$/.test(text)) return {ok: false, reason: 'filtered', text: '', display: '####', blocked: true, reasons: reasons};
      return {ok: true, text: text, preset: false, blocked: !!r.blocked, reasons: reasons};
    }
    return {ok: true, text: src, preset: false, blocked: false, reasons: []};
  }

  function lhAddWallWord(list, word, opts){
    opts = opts || {};
    const cap = opts.cap != null ? opts.cap : LH_WALL_MAX_PER_PLAYER;
    const uid = String((word && word.uid) || opts.uid || 'me');
    const out = Array.isArray(list) ? list.slice() : [];
    const rec = {
      id: (word && word.id) || ('w' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6)),
      uid: uid,
      text: String((word && word.text) || '').slice(0, LH_WALL_MAX_CHARS),
      style: (word && word.style) === 'chalk' ? 'chalk' : 'paint',
      x: +(word && word.x) || 0,
      y: +(word && word.y) || 0,
      z: +(word && word.z) || 0,
      nx: +(word && word.nx) || 0,
      ny: +(word && word.ny) || 0,
      nz: +(word && word.nz) || 0,
      room: word && word.room != null ? word.room : -1,
      interior: !!(word && word.interior),
      t: (word && word.t) || Date.now()
    };
    if (!rec.text) return {list: out, added: null, faded: []};
    const faded = [];
    let mine = out.filter(w => w && w.uid === uid);
    while (mine.length >= cap){
      const oldest = mine.shift();
      const i = out.findIndex(w => w && oldest && w.id === oldest.id);
      if (i >= 0) faded.push(out.splice(i, 1)[0]);
      mine = out.filter(w => w && w.uid === uid);
    }
    out.push(rec);
    return {list: out, added: rec, faded: faded};
  }

  function lhEraseWallWord(list, id, uid){
    const out = Array.isArray(list) ? list.slice() : [];
    const i = out.findIndex(w => w && w.id === id);
    if (i < 0) return {list: out, erased: null, reason: 'missing'};
    if (uid && out[i].uid !== uid) return {list: out, erased: null, reason: 'not-owner'};
    const erased = out.splice(i, 1)[0];
    return {list: out, erased: erased};
  }

  function lhSanitizeWallWords(raw){
    if (!Array.isArray(raw)) return [];
    return raw.map(w => {
      if (!w || !w.text) return null;
      const text = String(w.text).replace(/\s+/g, ' ').trim().slice(0, LH_WALL_MAX_CHARS);
      if (!text) return null;
      return {
        id: String(w.id || ('w' + Math.random().toString(36).slice(2, 8))),
        uid: String(w.uid || 'me'),
        text: text,
        style: w.style === 'chalk' ? 'chalk' : 'paint',
        x: +w.x || 0, y: +w.y || 0, z: +w.z || 0,
        nx: +w.nx || 0, ny: +w.ny || 0, nz: +w.nz || 0,
        room: w.room == null ? -1 : w.room,
        interior: !!w.interior,
        t: +w.t || 0
      };
    }).filter(Boolean);
  }


  const LH_KNOCK_SOLO_OPEN_LINES = [
    'The door creaks open… by itself.',
    'A whisper: “Come in… if you dare.”',
    'The handle turns. Nobody is there.'
  ];
  const LH_KNOCK_SOLO_STAY_LINES = [
    'Something shuffles, then goes quiet.',
    'A small voice: “We\'re not home.”',
    'The door stays shut. You hear a faint giggle.',
    'No one answers. Maybe that\'s for the best.'
  ];

  function lhDoorPromptKind(st){
    st = st || {};
    if (st.isOwner) return {id: 'door', label: st.doorClosed ? '🚪 Open door' : '🚪 Close door'};
    if (!st.doorClosed) return {id: 'enter', label: '🚪 Enter wagon' + (st.wagonNo ? (' ' + st.wagonNo) : '')};
    return {id: 'knock', label: '🚪 Knock'};
  }

  function lhKnockCooldownLeft(lastAt, now, cd){
    const cool = cd == null ? LH_KNOCK_COOLDOWN : +cd;
    const wait = cool - ((+now || 0) - (+lastAt || 0));
    return Math.max(0, wait);
  }

  function lhKnockAllowed(st){
    st = st || {};
    if (st.isOwner) return {ok: false, reason: 'own'};
    if (!st.doorClosed) return {ok: false, reason: 'open'};
    const wait = lhKnockCooldownLeft(st.lastAt, st.now, st.cooldown);
    if (wait > 0) return {ok: false, reason: 'cooldown', wait: wait};
    return {ok: true};
  }

  function lhPickLine(list, rand){
    const arr = list || [];
    if (!arr.length) return '';
    const r = typeof rand === 'function' ? rand() : (typeof rand === 'number' ? rand : Math.random());
    const i = Math.max(0, Math.min(arr.length - 1, Math.floor((r % 1 + 1) % 1 * arr.length)));
    return arr[i];
  }

  /* Solo unowned/NPC rooms: random spooky open or stay. MP with no owner, or an owner who is away/offline: stay closed. In-room owners get a popup. */
  function lhKnockResolve(st, rand){
    st = st || {};
    const r = typeof rand === 'function' ? rand() : (typeof rand === 'number' ? rand : Math.random());
    if (st.solo && !st.hasOwner){
      const openChance = st.openChance != null ? st.openChance : LH_KNOCK_SOLO_OPEN;
      if (r < openChance){
        return {mode: 'open', reason: 'solo-open', message: lhPickLine(LH_KNOCK_SOLO_OPEN_LINES, r / Math.max(openChance, 1e-6))};
      }
      return {mode: 'closed', reason: 'solo-stay', message: lhPickLine(LH_KNOCK_SOLO_STAY_LINES, (r - openChance) / Math.max(1 - openChance, 1e-6))};
    }
    if (!st.hasOwner || !st.ownerOnline){
      return {mode: 'closed', reason: 'offline', message: 'Nobody\'s home. The door stays closed.', timeout: 0};
    }
    if (!st.ownerInRoom){
      return {mode: 'closed', reason: 'away', message: 'They must be out. The door stays closed.', timeout: 0};
    }
    return {mode: 'popup', reason: 'offer', message: 'Someone is knocking!', timeout: LH_KNOCK_TIMEOUT};
  }

  function lhKnockReplyMessage(reason){
    const m = {
      open: 'They opened the door.',
      closed: 'They kept the door closed.',
      timeout: 'No one answered. The door stays closed.',
      away: 'They must be out. The door stays closed.',
      offline: 'Nobody\'s home. The door stays closed.'
    };
    return m[reason] || m.timeout;
  }

  function lhJumpClearHeight(jump, grav){
    jump = jump == null ? 16 : +jump;
    grav = grav == null ? 45 : +grav;
    if (!(grav > 0)) return 0;
    return (jump * jump) / (2 * grav);
  }


  const LH_RIDE_SPEC = [
    {id:'ferris', name:'Ferris Wheel', emoji:'🎡', boardR: 5.8},
    {id:'carousel', name:'Carousel', emoji:'🎠', boardR: 3.6},
    {id:'swing', name:'Swing Ride', emoji:'🎪', boardR: 4.2}
  ];

  function lhRidePickSeat(taken, count){
    const n = Math.max(0, count | 0);
    taken = taken || [];
    for (let i = 0; i < n; i++){
      if (!taken[i]) return i;
    }
    return -1;
  }

  function lhRideBoardOk(st){
    st = st || {};
    if (st.alreadyOn) return {ok: false, reason: 'seated'};
    if (!st.near) return {ok: false, reason: 'far'};
    const seat = st.seat == null ? -1 : st.seat;
    if (seat < 0) return {ok: false, reason: 'full'};
    return {ok: true, seat: seat};
  }

  function lhRideExitPoint(ride){
    ride = ride || {};
    const x = +ride.x || 0, z = +ride.z || 0;
    if (ride.kind === 'ferris') return {x: x + 5.2, y: 0.12, z: z};
    if (ride.kind === 'swing') return {x: x + 4.4, y: 0.12, z: z + 1};
    return {x: x + 3.6, y: 0.12, z: z + 1.2};
  }

  function lhRideProgress(prev, kind){
    const rides = {};
    const src = prev && typeof prev === 'object' ? prev : {};
    Object.keys(src).forEach(k => { if (src[k]) rides[k] = true; });
    const first = !rides.ferris && !rides.carousel && !rides.swing;
    if (kind) rides[kind] = true;
    const all = !!(rides.ferris && rides.carousel && rides.swing);
    return {rides: rides, first: first, all: all};
  }

  const api = {
    LH_KEY, LH_VER, LH_HOST, LH_HOST_TITLE, LH_GAME, LH_STAMPS, LH_EYES,
    LH_WALL_PRESETS, LH_WALL_MAX_CHARS, LH_WALL_MAX_PER_PLAYER, LH_WALL_MAX_DIST, LH_PII_REASONS,
    LH_WAGON_H, LH_MIDWAY_WALL_H, LH_DOOR_OPEN_H, LH_KNOCK_COOLDOWN, LH_KNOCK_TIMEOUT, LH_KNOCK_SOLO_OPEN,
    LH_RIDE_SPEC,
    LH_COMPANY_R, LH_NEAR_R, LH_SUMMON_R, LH_TAG_R, LH_KEY_CD, LH_LAMP_R, LH_WAGON_ZS,
    LH_WAGONS_PER_SIDE, LH_WAGON_COUNT, LH_WAGON_SPACING, LH_WAGON_Z0, LH_WAGON_X,
    LH_MIDWAY_WALL_X, LH_MIDWAY_Z0, LH_MIDWAY_Z1, LH_DOOR_HALF,
    LH_Y, LH_CAM_NEAR, LH_CAM_FAR, LH_STATIC_PERIOD, LH_STATIC_MAX_HZ,
    LH_TENT_W, LH_TENT_X, LH_TENT_Z0, LH_TENT_Z1, LH_RING_R, LH_RING_Z, LH_FLAP_Z,
    LH_CELLAR_Z, LH_GRASS_W, LH_GRASS_D, LH_WOODS_X,
    RATES, LH_BADGES,
    lhTestHash, lhTestActive, lhClampSanity, lhEyeFill, lhSanityDelta,
    lhCancelSucceeds, lhHostNameIn, lhDefaultSettings, lhNormalizeSettings,
    lhLoadState, lhStampOk, lhAddDoodle, lhNear, lhDist, lhSummonOk, lhSummonBlocked, lhSummonDeniedMsg, lhCensored,
    lhMidwayWallSegments, lhMidwayBlocksSide, lhNearLamp,
    lhWagonZs, lhWagonCount, lhDoorTarget, lhDoorShouldAutoOpen, lhGroundGapOk, lhMapLayout,
    lhRoomContains, lhDoorAjar, lhRoomInteriorVisible, lhDoorwayLayout, lhDoorSealsOpening,
    lhWagonWallPlanes, lhRayWall, lhNormalizeWallText, lhAddWallWord, lhEraseWallWord, lhSanitizeWallWords,
    lhDoorPromptKind, lhKnockCooldownLeft, lhKnockAllowed, lhKnockResolve, lhKnockReplyMessage, lhJumpClearHeight, lhPickLine,
    lhRidePickSeat, lhRideBoardOk, lhRideExitPoint, lhRideProgress,
    LH_KNOCK_SOLO_OPEN_LINES, LH_KNOCK_SOLO_STAY_LINES
  };
  root.LHRules = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
