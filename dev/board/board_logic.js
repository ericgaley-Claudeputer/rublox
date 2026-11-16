/* Pure personal / room leaderboard rules — no backend, names already in-game. */
(function (root) {
  'use strict';

  const LB_KEY = 'rubloxBoard';
  const LB_VER = 1;

  // kind: 'high' bigger is better, 'low' smaller (times) is better.
  const LB_ROWS = [
    {id: 'tower-best', name: 'Tower of Doom — best height', emoji: '🗼', kind: 'high', unit: 'm'},
    {id: 'tower-time', name: 'Tower of Doom — fastest win', emoji: '⏱️', kind: 'low', unit: 's'},
    {id: 'obby-done', name: 'Obby Rush — levels beaten', emoji: '🏃', kind: 'high', unit: ''},
    {id: 'obby-time', name: 'Obby Rush — best level time', emoji: '🏁', kind: 'low', unit: 's'},
    {id: 'race-best', name: 'Pet Kart — best race', emoji: '🏎️', kind: 'low', unit: 's'},
    {id: 'splash-best', name: "Don't Splash! — best time", emoji: '🌊', kind: 'low', unit: 's'},
    {id: 'lava-best', name: 'Lava Escape — best height', emoji: '🌋', kind: 'high', unit: 'm'},
    {id: 'nds-best', name: 'Disaster Island — best streak', emoji: '🌪️', kind: 'high', unit: ''},
    {id: 'quest-streak', name: 'Daily Quests — best streak', emoji: '🔥', kind: 'high', unit: ''},
    {id: 'lh-tickets', name: 'Lantern Big Top — tickets', emoji: '🎟️', kind: 'high', unit: ''},
    {id: 'snow-toss', name: 'Snowball toss — best score', emoji: '❄️', kind: 'high', unit: ''},
    {id: 'snow-sled', name: 'Sled hill — best time', emoji: '🛷', kind: 'low', unit: 's'},
    {id: 'snow-skate', name: 'Ice rink — best score', emoji: '⛸️', kind: 'high', unit: ''},
    {id: 'hide-wins', name: 'Hide and Seek — wins', emoji: '🙈', kind: 'high', unit: ''},
    {id: 'hide-finds', name: 'Hide and Seek — finds', emoji: '🔍', kind: 'high', unit: ''},
    {id: 'cafe-served', name: 'Cozy Corner Café — served', emoji: '☕', kind: 'high', unit: ''},
    {id: 'fish-kinds', name: 'Ripple Lake — kinds caught', emoji: '🎣', kind: 'high', unit: ''},
    {id: 'fish-biggest', name: 'Ripple Lake — biggest fish', emoji: '🐟', kind: 'high', unit: 'cm'},
    {id: 'ps-best', name: 'Pet Talent Show — best score', emoji: '🎭', kind: 'high', unit: ''},
    {id: 'hunt-maps', name: 'Treasure Trail — maps finished', emoji: '🗺️', kind: 'high', unit: ''}
  ];

  function lbFresh(){ return {ver: LB_VER, best: {}, name: ''}; }

  function lbLoad(raw){
    const s = lbFresh();
    const o = raw && typeof raw === 'object' ? raw : null;
    if (!o) return s;
    if (o.best && typeof o.best === 'object'){
      for (const k in o.best){
        const v = +o.best[k];
        if (isFinite(v)) s.best[String(k)] = v;
      }
    }
    if (typeof o.name === 'string') s.name = o.name.slice(0, 16);
    return s;
  }

  function lbMinPos(obj){
    let best = null;
    if (!obj || typeof obj !== 'object') return null;
    for (const k in obj){
      const v = +obj[k];
      if (!isFinite(v) || v <= 0) continue;
      if (best == null || v < best) best = v;
    }
    return best;
  }

  function lbSnapshot(saves, extra){
    saves = saves || {};
    extra = extra && typeof extra === 'object' ? extra : {};
    const tower = saves.tower || {};
    const obby = saves.obby || {};
    const race = saves.race || {};
    const splash = saves.splash || {};
    const season = saves.season || {};
    const quests = saves.quests || {};
    const lantern = saves.lantern || {};
    const board = lbLoad(saves.board);
    const out = {};
    const set = (id, v) => { if (v != null && isFinite(+v)) out[id] = +v; };

    set('tower-best', tower.best | 0 ? (tower.best | 0) : null);
    set('tower-time', tower.winTime != null ? +tower.winTime : (board.best['tower-time'] != null ? board.best['tower-time'] : (extra['tower-time'] != null ? extra['tower-time'] : null)));
    const done = obby.done && typeof obby.done === 'object' ? Object.keys(obby.done).length : 0;
    set('obby-done', done || null);
    set('obby-time', lbMinPos(obby.best));
    set('race-best', lbMinPos(race.best));
    set('splash-best', lbMinPos(splash.best));
    set('lava-best', saves.lava != null && +saves.lava > 0 ? +saves.lava : null);
    set('nds-best', saves.nds != null && +saves.nds > 0 ? +saves.nds : null);
    const streak = Math.max(quests.streak | 0, board.best['quest-streak'] | 0);
    set('quest-streak', streak || null);
    const tickets = (lantern.tickets | 0) || (lantern.prog && (lantern.prog.tickets | 0)) || 0;
    set('lh-tickets', tickets || null);
    const sb = season.best || {};
    set('snow-toss', sb.toss != null ? sb.toss : board.best['snow-toss']);
    set('snow-sled', sb.sled != null ? sb.sled : board.best['snow-sled']);
    set('snow-skate', sb.skate != null ? sb.skate : board.best['snow-skate']);
    const hide = saves.hide || {};
    set('hide-wins', hide.wins | 0 ? (hide.wins | 0) : null);
    set('hide-finds', hide.finds | 0 ? (hide.finds | 0) : null);
    const cafeS = saves.cafe || {};
    set('cafe-served', cafeS.served | 0 ? (cafeS.served | 0) : (cafeS.best | 0 ? (cafeS.best | 0) : null));
    const fishS = saves.fish || {};
    const kinds = fishS.caught && typeof fishS.caught === 'object' ? Object.keys(fishS.caught).length : 0;
    set('fish-kinds', kinds || null);
    set('fish-biggest', fishS.biggest ? +fishS.biggest : null);
    const psS = saves.petshow || {};
    set('ps-best', psS.best ? +psS.best : null);
    const huntS = saves.hunt || {};
    set('hunt-maps', huntS.maps | 0 ? (huntS.maps | 0) : null);
    // extras / board can fill gaps
    for (const id in board.best) if (out[id] == null) set(id, board.best[id]);
    for (const id in extra) if (out[id] == null) set(id, extra[id]);
    return out;
  }

  function lbNote(state, id, value){
    state = lbLoad(state);
    const row = LB_ROWS.find(r => r.id === id);
    if (!row) return {ok: false, why: 'missing', state};
    const v = +value;
    if (!isFinite(v)) return {ok: false, why: 'value', state};
    const prev = state.best[id];
    const better = prev == null || (row.kind === 'high' ? v > prev : v < prev);
    if (better) state.best[id] = v;
    return {ok: true, why: 'ok', state, better, best: state.best[id]};
  }

  function lbFmt(id, value, fmtTime){
    const row = LB_ROWS.find(r => r.id === id);
    if (value == null || !isFinite(+value)) return '—';
    const v = +value;
    if (row && row.kind === 'low'){
      if (typeof fmtTime === 'function') return fmtTime(v);
      const m = Math.floor(v / 60), s = v - m * 60;
      return m + ':' + s.toFixed(1).padStart(4, '0');
    }
    const n = (v === (v | 0)) ? String(v | 0) : String(Math.round(v * 10) / 10);
    return n + (row && row.unit ? ' ' + row.unit : '');
  }

  function lbView(scores){
    scores = scores || {};
    return LB_ROWS.map(r => ({
      id: r.id, name: r.name, emoji: r.emoji, kind: r.kind, unit: r.unit,
      value: scores[r.id] != null && isFinite(+scores[r.id]) ? +scores[r.id] : null,
      text: lbFmt(r.id, scores[r.id])
    })).filter(r => r.value != null);
  }

  function lbCleanName(name){
    return String(name || 'Friend').replace(/[<>]/g, '').slice(0, 16) || 'Friend';
  }

  // Room table: list of {uid, name, scores}. Rank each row among real players only.
  function lbRoomTable(list, rowId){
    const row = LB_ROWS.find(r => r.id === rowId);
    if (!row) return [];
    const people = (Array.isArray(list) ? list : []).map(p => ({
      uid: String(p.uid || ''),
      name: lbCleanName(p.name),
      value: p.scores && isFinite(+p.scores[rowId]) ? +p.scores[rowId] : null
    }));
    const ranked = people.filter(p => p.value != null).sort((a, b) => row.kind === 'high' ? b.value - a.value : a.value - b.value);
    ranked.forEach((p, i) => { p.rank = i + 1; p.text = lbFmt(rowId, p.value); });
    return ranked;
  }

  function lbWire(scores){
    const o = {};
    const src = scores || {};
    LB_ROWS.forEach(r => { if (src[r.id] != null && isFinite(+src[r.id])) o[r.id] = +src[r.id]; });
    return o;
  }

  const api = {
    LB_KEY, LB_VER, LB_ROWS,
    lbFresh, lbLoad, lbMinPos, lbSnapshot, lbNote, lbFmt, lbView,
    lbCleanName, lbRoomTable, lbWire
  };
  root.LBRules = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
