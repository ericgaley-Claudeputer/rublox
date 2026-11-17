/* Pet Talent Show rules — tricks, scores, ribbons. Votes are numeric only. */
(function (root) {
  'use strict';

  const PS_KEY = 'rubloxPetShow';
  const PS_VER = 1;
  const PS_TRICKS = [
    {id:'sit',   name:'Sit',       emoji:'🪑', beats:3},
    {id:'spin',  name:'Spin',      emoji:'💫', beats:4},
    {id:'jump',  name:'Jump',      emoji:'⬆️', beats:3},
    {id:'roll',  name:'Roll Over', emoji:'🔄', beats:4},
    {id:'high',  name:'High Five', emoji:'🖐️', beats:3}
  ];
  const PS_RIBBON = [
    {id:'part', min:0,  name:'Participant Ribbon', emoji:'🎀'},
    {id:'bronze', min:6,  name:'Bronze Ribbon', emoji:'🥉'},
    {id:'silver', min:7.5,name:'Silver Ribbon', emoji:'🥈'},
    {id:'gold',   min:9,  name:'Gold Ribbon',   emoji:'🥇'}
  ];

  function psFresh(){ return {ver: PS_VER, tricks:{}, shows:0, best:0, ribbons:{}, earned:0}; }

  function psLoad(raw){
    const s = psFresh();
    const o = raw && typeof raw === 'object' ? raw : null;
    if (!o) return s;
    s.shows = Math.max(0, o.shows | 0);
    s.best = Math.max(0, +o.best || 0);
    s.earned = Math.max(0, o.earned | 0);
    if (o.tricks && typeof o.tricks === 'object'){
      for (const pid in o.tricks){
        const list = Array.isArray(o.tricks[pid]) ? o.tricks[pid] : [];
        s.tricks[String(pid)] = list.filter(id => PS_TRICKS.some(t => t.id === id)).slice(0, PS_TRICKS.length);
      }
    }
    if (o.ribbons && typeof o.ribbons === 'object'){
      for (const k in o.ribbons){ if (PS_RIBBON.some(r => r.id === k) && (o.ribbons[k]|0) > 0) s.ribbons[k] = o.ribbons[k]|0; }
    }
    return s;
  }

  function psTrick(id){ return PS_TRICKS.find(t => t.id === id) || null; }

  function psKnown(state, petId){
    state = psLoad(state);
    return (state.tricks[String(petId)] || []).slice();
  }

  function psTeach(state, petId, trickId, quality){
    state = psLoad(state);
    const t = psTrick(trickId);
    if (!t) return {ok:false, why:'trick', state};
    if (!petId) return {ok:false, why:'pet', state};
    const q = Math.max(0, Math.min(1, +quality || 0));
    if (q < 0.45) return {ok:false, why:'miss', state};
    const id = String(petId);
    const have = state.tricks[id] ? state.tricks[id].slice() : [];
    const first = have.indexOf(t.id) < 0;
    if (first) have.push(t.id);
    state.tricks[id] = have;
    return {ok:true, why:'ok', state, first, trick: t, all: have.length >= PS_TRICKS.length};
  }

  function psJudge(tricks, qualities, votes){
    const list = Array.isArray(tricks) ? tricks : [];
    const qs = Array.isArray(qualities) ? qualities : [];
    if (!list.length) return {ok:false, why:'empty', score:0, ribbon: PS_RIBBON[0]};
    let sum = 0;
    list.forEach((id, i) => {
      const t = psTrick(id);
      const q = Math.max(0, Math.min(1, +qs[i] || 0.5));
      sum += (t ? 1.4 : 0.6) * q;
    });
    const avg = sum / list.length; // 0..1.4
    let score = Math.round((5 + avg * 3.6) * 10) / 10; // ~5..10
    const vs = (Array.isArray(votes) ? votes : []).map(v => +v).filter(v => isFinite(v) && v >= 1 && v <= 10);
    if (vs.length){
      const mean = vs.reduce((a, b) => a + b, 0) / vs.length;
      score = Math.round(((score * 0.7) + (mean * 0.3)) * 10) / 10;
    }
    score = Math.max(1, Math.min(10, score));
    let ribbon = PS_RIBBON[0];
    PS_RIBBON.forEach(r => { if (score >= r.min) ribbon = r; });
    return {ok:true, why:'ok', score, ribbon, judges: 3};
  }

  function psRecord(state, result){
    state = psLoad(state);
    if (!result || !result.ok) return {ok:false, why:'score', state, coins:0};
    state.shows += 1;
    if (result.score > state.best) state.best = result.score;
    const rid = result.ribbon && result.ribbon.id;
    if (rid) state.ribbons[rid] = (state.ribbons[rid] | 0) + 1;
    const coins = 6 + Math.round(result.score);
    state.earned += coins;
    return {ok:true, why:'ok', state, coins, ribbon: result.ribbon, score: result.score};
  }


  function psPetKind(pet){
    if (!pet || typeof pet !== 'object') return 'bunny';
    return String(pet.k || pet.kind || 'bunny');
  }
  function psPetId(pet){
    if (!pet || typeof pet !== 'object') return 'pal';
    return String(pet.id || pet.key || pet.n || pet.name || 'pal');
  }
  // Every species, including dogs, can perform every trick. No kind is excluded.
  function psSpeciesCanTrick(kind, trickId){
    return !!(kind && psTrick(trickId));
  }
  function psOnMat(px, pz, mats, radius){
    const r = radius == null ? 1.6 : radius;
    let best = null, bd = r;
    (mats || []).forEach(m => {
      if (!m) return;
      const d = Math.hypot((+px || 0) - m.x, (+pz || 0) - m.z);
      if (d <= r && d <= bd){ bd = d; best = m; }
    });
    return best;
  }
  function psTrickPose(id, t, dur){
    const d = dur > 0 ? dur : 1.8;
    const u = Math.max(0, Math.min(1, (+t || 0) / d));
    if (id === 'sit')  return {act:3, yaw:0, roll:0, pitch:0, hop:0};
    if (id === 'spin') return {act:4, yaw: u * Math.PI * 2, roll:0, pitch:0, hop:0};
    if (id === 'jump') return {act:4, yaw:0, roll:0, pitch:0, hop: Math.sin(u * Math.PI) * 0.7};
    if (id === 'roll') return {act:3, yaw:0, roll: u * Math.PI * 2, pitch:0, hop:0.12};
    if (id === 'high') return {act:5, yaw:0, roll:0, pitch:0, hop:0};
    return {act:4, yaw:0, roll:0, pitch:0, hop:0};
  }

  function psCleanVote(v){
    const n = +v;
    if (!isFinite(n)) return null;
    const x = Math.round(n);
    if (x < 1 || x > 10) return null;
    return x;
  }

  const api = {
    PS_KEY, PS_VER, PS_TRICKS, PS_RIBBON,
    psFresh, psLoad, psTrick, psKnown, psTeach, psJudge, psRecord, psCleanVote,
    psPetKind, psPetId, psSpeciesCanTrick, psOnMat, psTrickPose
  };
  root.PsRules = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
