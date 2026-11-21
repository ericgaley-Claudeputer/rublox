/* Rublox global Gore setting — optional, off by default, cartoon marks only. */
(function (root) {
  const GORE_KEY = 'rubloxGore';
  const GORE_VER = 1;
  // Single config table so more levels can be added later without rewriting callers.
  const GORE_LEVELS = {
    off: {
      id: 'off',
      name: 'Off',
      emoji: '🚫',
      rank: 0,
      help: 'No blood anywhere. This is the default for every save.'
    },
    mild: {
      id: 'mild',
      name: 'Mild',
      emoji: '💧',
      rank: 1,
      help: 'A few cartoon red splats and scratch marks.'
    },
    spooky: {
      id: 'spooky',
      name: 'Spooky',
      emoji: '🩸',
      rank: 2,
      help: 'More splats and creepy stains.'
    }
  };
  const GORE_ORDER = ['off', 'mild', 'spooky'];
  const GORE_CAP_LESS = 'mild';
  const GORE_GAMES = ['camp', 'school'];
  const GORE_KINDS = ['splat', 'scratch', 'stain', 'handprint'];

  // Environmental decals for Campfire Grove only. No body parts, wounds, or injury poses.
  const CAMP_GORE_DECALS = [
    {id:'cabin-door', min:'mild', kind:'splat', at:'cabin-door', x:48.0, y:0.9, z:-29.28, yaw:0, sx:0.55, sy:0.42, sz:0.04},
    {id:'cabin-steps', min:'mild', kind:'splat', at:'cabin-steps', x:47.35, y:0.05, z:-28.15, yaw:0.3, sx:0.7, sy:0.04, sz:0.5},
    {id:'woods-stain-1', min:'mild', kind:'stain', at:'deep-woods', x:50.6, y:0.05, z:46.4, yaw:0.5, sx:1.1, sy:0.03, sz:0.8},
    {id:'tree-scratch-1', min:'mild', kind:'scratch', at:'tree', x:39.15, y:1.35, z:-36.04, yaw:1.1, sx:0.04, sy:0.7, sz:0.22},
    {id:'tree-scratch-2', min:'mild', kind:'scratch', at:'tree', x:45.4, y:1.5, z:-18.96, yaw:-0.4, sx:0.04, sy:0.62, sz:0.2},
    {id:'cabin-wall', min:'spooky', kind:'splat', at:'cabin-wall', x:45.0, y:1.15, z:-32.0, yaw:Math.PI/2, sx:0.62, sy:0.5, sz:0.04},
    {id:'woods-stain-2', min:'spooky', kind:'stain', at:'deep-woods', x:54.8, y:0.05, z:50.2, yaw:-0.4, sx:1.4, sy:0.03, sz:1.0},
    {id:'woods-stain-3', min:'spooky', kind:'stain', at:'deep-woods', x:48.2, y:0.05, z:43.1, yaw:0.9, sx:0.9, sy:0.03, sz:0.7},
    {id:'tree-scratch-3', min:'spooky', kind:'scratch', at:'tree', x:49.95, y:1.6, z:44.95, yaw:0.2, sx:0.04, sy:0.85, sz:0.26},
    {id:'tree-scratch-4', min:'spooky', kind:'scratch', at:'tree', x:48.1, y:1.45, z:32.79, yaw:-0.7, sx:0.04, sy:0.72, sz:0.22},
    {id:'cabin-handprint', min:'spooky', kind:'handprint', at:'cabin-window', x:51.22, y:2.28, z:-30.6, yaw:Math.PI/2, sx:0.36, sy:0.4, sz:0.03}
  ];

  function goreDefault(){ return 'off'; }

  function goreLevelId(raw){
    if (raw == null || raw === '') return goreDefault();
    if (typeof raw === 'string'){
      const s = raw.trim().toLowerCase();
      return GORE_LEVELS[s] ? s : goreDefault();
    }
    if (typeof raw === 'object'){
      const v = raw.level || raw.value || raw.gore || raw.mode;
      if (typeof v === 'string' && GORE_LEVELS[v]) return v;
    }
    return goreDefault();
  }

  function goreNormalize(raw){ return goreLevelId(raw); }

  function goreLoadState(raw){
    if (typeof raw === 'string' && raw.charAt(0) === '{'){
      try { raw = JSON.parse(raw); } catch (e){ raw = null; }
    }
    return goreNormalize(raw);
  }

  function goreLevel(id){ return GORE_LEVELS[goreNormalize(id)] || GORE_LEVELS.off; }

  function goreRank(id){ return goreLevel(id).rank; }

  function goreEffective(raw, opt){
    let id = goreNormalize(raw);
    if (opt && opt.lessScary && goreRank(id) > goreRank(GORE_CAP_LESS)) id = GORE_CAP_LESS;
    return id;
  }

  function goreCapped(raw, lessScary){
    const want = goreNormalize(raw);
    const got = goreEffective(want, {lessScary: !!lessScary});
    return want !== got;
  }

  function goreCapNote(raw, lessScary){
    if (goreCapped(raw, lessScary)) return 'Gore stays at Mild while Less scary is on.';
    return '';
  }

  function goreAllowedIn(modeId){
    return GORE_GAMES.indexOf(modeId) >= 0;
  }

  function goreTable(modeId){
    if (modeId === 'camp') return CAMP_GORE_DECALS;
    if (modeId === 'school'){
      try {
        const S = (typeof SchoolRules !== 'undefined' && SchoolRules) || (typeof require === 'function' ? require(require('path').join(__dirname, '../school/school_logic.js')) : null);
        return (S && S.SC_GORE) || [];
      } catch (e){ return []; }
    }
    return [];
  }
  function goreDecalsFor(modeId, raw, opt){
    if (!goreAllowedIn(modeId)) return [];
    const id = goreEffective(raw, opt);
    const rank = goreRank(id);
    if (rank <= 0) return [];
    return goreTable(modeId).filter(d => goreRank(d.min) <= rank && GORE_KINDS.indexOf(d.kind) >= 0);
  }

  function goreCampDecals(raw, opt){ return goreDecalsFor('camp', raw, opt); }

  function goreCampCount(raw, opt){ return goreCampDecals(raw, opt).length; }

  const api = {
    GORE_KEY, GORE_VER, GORE_LEVELS, GORE_ORDER, GORE_CAP_LESS, GORE_GAMES, GORE_KINDS, CAMP_GORE_DECALS,
    goreDefault, goreLevelId, goreNormalize, goreLoadState, goreLevel, goreRank,
    goreEffective, goreCapped, goreCapNote, goreAllowedIn, goreTable, goreDecalsFor, goreCampDecals, goreCampCount
  };
  root.GoreRules = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
