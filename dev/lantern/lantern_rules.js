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
      coins: Math.max(0, +o.coins || 0)
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
    {id:'lh-peek', real:'Peekaboo.', realDesc:'Get abstracted by Eniac. (Secret)', name:'Gotcha!', desc:'Get fizzled by the late-night visitor.', emoji:'👀', coins:20, note:'lh:peek', secret:true}
  ];

  const api = {
    LH_KEY, LH_VER, LH_HOST, LH_HOST_TITLE, LH_GAME, LH_STAMPS, LH_EYES,
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
    lhWagonZs, lhWagonCount, lhDoorTarget, lhDoorShouldAutoOpen, lhGroundGapOk, lhMapLayout
  };
  root.LHRules = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
