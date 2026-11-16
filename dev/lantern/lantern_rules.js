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
    isolate: 4,
    dark: 5,
    near: 16,
    restore: 8,
    stareBonus: 4
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
    if (st.isolated){
      st._isoT = (st._isoT || 0) + dt;
      if (st._isoT >= RATES.isolateDelay) drain = Math.max(drain, RATES.isolate);
    } else st._isoT = 0;
    if (st.dark){
      st._darkT = (st._darkT || 0) + dt;
      if (st._darkT >= RATES.darkDelay) drain = Math.max(drain, RATES.dark);
    } else st._darkT = 0;
    if (drain > 0) return -drain * dt;
    if (st.company && st.lit) return RATES.restore * dt;
    if (st.lit && !st.isolated) return RATES.restore * 0.45 * dt;
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

  const LH_LAMP_R = 5;
  const LH_WAGON_ZS = [11, 18, 25];
  const LH_MIDWAY_WALL_X = 4.2;
  const LH_MIDWAY_Z0 = 8;
  const LH_MIDWAY_Z1 = 32;
  const LH_DOOR_HALF = 1.35;

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

  function lhSummonOk(targetGlitched, dist, radius){
    if (!targetGlitched) return false;
    return (+dist || 99) <= (radius == null ? LH_SUMMON_R : radius);
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
    LH_MIDWAY_WALL_X, LH_MIDWAY_Z0, LH_MIDWAY_Z1, LH_DOOR_HALF, RATES, LH_BADGES,
    lhTestHash, lhTestActive, lhClampSanity, lhEyeFill, lhSanityDelta,
    lhCancelSucceeds, lhHostNameIn, lhDefaultSettings, lhNormalizeSettings,
    lhLoadState, lhStampOk, lhAddDoodle, lhNear, lhDist, lhSummonOk, lhCensored,
    lhMidwayWallSegments, lhMidwayBlocksSide, lhNearLamp
  };
  root.LHRules = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
