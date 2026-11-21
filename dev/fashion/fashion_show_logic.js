/* Fashion Show rules used by tests and the runtime: solo is a judge panel
   (no NPC opponents), and you cannot vote for yourself. Save key rubloxFashion
   keeps existing fields and adds optional judgeShows / lastTheme. */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.FashionShowRules = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  const FS_KEY = 'rubloxFashion';

  function fsFresh(){
    return {xp:0, shows:0, wins:0, best:0, vip:false, judgeShows:0, lastTheme:''};
  }

  function fsLoadProg(raw){
    const o = raw && typeof raw === 'object' ? raw : {};
    const d = fsFresh();
    ['xp','shows','wins','judgeShows'].forEach(k => { d[k] = Math.max(0, o[k] | 0); });
    d.best = Math.max(0, +o.best || 0);
    d.vip = !!o.vip;
    d.lastTheme = typeof o.lastTheme === 'string' ? o.lastTheme.slice(0, 80) : '';
    return d;
  }

  function fsSoloWalkers(uid){
    const me = uid || 'H';
    return [me];
  }

  function fsCanRate(voterId, targetId){
    if (!voterId || !targetId) return false;
    if (String(voterId) === String(targetId)) return false;
    return true;
  }

  function fsCastRate(rates, voterId, targetId, stars){
    rates = rates && typeof rates === 'object' ? rates : {};
    const n = stars | 0;
    if (!fsCanRate(voterId, targetId) || n < 1 || n > 5) return {ok:false, rates, why: !fsCanRate(voterId, targetId) ? 'self' : 'stars'};
    (rates[voterId] = rates[voterId] || {})[targetId] = n;
    return {ok:true, rates, stars:n};
  }

  function fsJudgePanel(){
    return [
      {id:'j0', name:'Grandma Rose', emoji:'👵'},
      {id:'j1', name:'Coach Max', emoji:'🧢'},
      {id:'j2', name:'Lulu', emoji:'🎀'},
      {id:'j3', name:'Mr. Pebbles', emoji:'🐧'}
    ];
  }

  function fsSoloScore(themeFit, poseBonus, judgeLean){
    const fit = Math.max(0, Math.min(1, +themeFit || 0));
    const pose = Math.max(0, Math.min(1, +poseBonus || 0));
    const lean = Math.max(0, Math.min(1, +judgeLean || 0.7));
    const avg = 2.2 + fit * 2.0 + pose * 0.6 + lean * 0.4;
    return Math.max(1, Math.min(5, Math.round(avg * 10) / 10));
  }

  function fsAfterSoloShow(state, themeName, score){
    state = fsLoadProg(state);
    state.shows = (state.shows | 0) + 1;
    state.judgeShows = (state.judgeShows | 0) + 1;
    state.lastTheme = String(themeName || '').slice(0, 80);
    const s = +score || 0;
    if (s > (state.best || 0)) state.best = s;
    return state;
  }

  function fsRealPlayersOnly(roster){
    return (roster || []).filter(p => p && p.id && !p.npc);
  }

  return {
    FS_KEY, fsFresh, fsLoadProg, fsSoloWalkers, fsCanRate, fsCastRate,
    fsJudgePanel, fsSoloScore, fsAfterSoloShow, fsRealPlayersOnly
  };
});
