/* GB-7: 🌾 Little Ones Ring — a farm-babies class at the Pet Talent Show.
   Pick an adopted Honeymeadow baby, groom it (brush, bubble bath, bow), then show it to three judges.
   Coins are paid once per show, a fresh grooming is needed for every show, and only the first
   FB_DAILY_PAID shows each day pay coins (ribbons still count after that). Save key: rubloxFarmShow. */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.FarmShowRules = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  const FB_KEY = 'rubloxFarmShow';
  const FB_VER = 1;
  const FB_DAILY_PAID = 3;
  const FB_KINDS = ['chick', 'lamb', 'calf', 'piglet', 'duckling', 'kid', 'kit'];
  const FB_SIG = {
    chick:    {id:'peep',   name:'Peep-Peep Hop',  emoji:'🐣', pose:'jump'},
    lamb:     {id:'boing',  name:'Springy Boing',  emoji:'☁️', pose:'jump'},
    calf:     {id:'moobow', name:'Moo-and-Bow',    emoji:'🐮', pose:'sit'},
    piglet:   {id:'wiggle', name:'Mud Wiggle',     emoji:'🐷', pose:'roll'},
    duckling: {id:'waddle', name:'Waddle Twirl',   emoji:'🦆', pose:'spin'},
    kid:      {id:'hilltop',name:'Hilltop Hop',    emoji:'🐐', pose:'jump'},
    kit:      {id:'binky',  name:'Happy Binky',    emoji:'🐰', pose:'spin'}
  };
  const FB_GROOM = [
    {id:'brush', name:'Fluff brush', emoji:'🪮', line:'Brush, brush — so fluffy!'},
    {id:'bath',  name:'Bubble bath', emoji:'🫧', line:'Splish! A bubbly little bath.'},
    {id:'bow',   name:'Ribbon bow',  emoji:'🎀', line:'A ribbon bow, tied just right.'}
  ];
  const FB_JUDGES = [
    {id:'marigold', name:'Judge Marigold Hay',    emoji:'🌻', likes:'grooming'},
    {id:'barnaby',  name:'Judge Barnaby Thistle', emoji:'🎩', likes:'tricks'},
    {id:'posy',     name:'Judge Posy Lark',       emoji:'🌸', likes:'sparkle'}
  ];
  const FB_RIBBON = [
    {id:'part',   min:0,   name:'Little Sprout Rosette', emoji:'🎀'},
    {id:'bronze', min:6,   name:'Clover Ribbon',         emoji:'🥉'},
    {id:'silver', min:7.5, name:'Haystack Silver',       emoji:'🥈'},
    {id:'gold',   min:9,   name:'Honeymeadow Gold',      emoji:'🥇'}
  ];
  const PS_TRICK_IDS = ['sit', 'spin', 'jump', 'roll', 'high'];

  function fbFresh(){ return {ver: FB_VER, shows: 0, earned: 0, best: 0, ribbons: {}, day: '', paidToday: 0, babies: {}}; }
  function fbLoad(raw){
    const s = fbFresh();
    const o = raw && typeof raw === 'object' ? raw : {};
    s.shows = Math.max(0, o.shows | 0);
    s.earned = Math.max(0, o.earned | 0);
    s.best = Math.max(0, Math.min(10, +o.best || 0));
    if (o.ribbons && typeof o.ribbons === 'object') FB_RIBBON.forEach(r => { if ((o.ribbons[r.id] | 0) > 0) s.ribbons[r.id] = o.ribbons[r.id] | 0; });
    s.day = typeof o.day === 'string' ? o.day.slice(0, 10) : '';
    s.paidToday = Math.max(0, Math.min(FB_DAILY_PAID, o.paidToday | 0));
    if (o.babies && typeof o.babies === 'object'){
      Object.keys(o.babies).slice(0, 40).forEach(k => {
        const b = o.babies[k];
        if (b && typeof b === 'object') s.babies[String(k).slice(0, 40)] = {shows: Math.max(0, b.shows | 0), best: Math.max(0, Math.min(10, +b.best || 0))};
      });
    }
    return s;
  }
  function fbDay(t){ const d = new Date(+t || Date.now()); const z = n => ('0' + n).slice(-2); return d.getFullYear() + '-' + z(d.getMonth() + 1) + '-' + z(d.getDate()); }
  function fbKind(pet){ return pet ? String(pet.k || pet.kind || '') : ''; }
  function fbIsBaby(pet){ return !!pet && (pet.src === 'farm' || FB_KINDS.indexOf(fbKind(pet)) >= 0); }
  function fbBabies(pets){ return (Array.isArray(pets) ? pets : []).filter(fbIsBaby).slice(0, 12); }
  function fbPetId(pet){ return String((pet && (pet.id || pet.n || pet.name)) || fbKind(pet) || 'baby').slice(0, 40) + ':' + fbKind(pet); }
  function fbSig(pet){ return FB_SIG[fbKind(pet)] || FB_SIG.chick; }
  function fbNewRun(){ return {pick: 0, groom: [], show: false, paid: false, n: 0, routine: []}; }
  function fbPick(run, babies, dir){
    const n = (babies || []).length;
    if (!run || !n) return {ok:false, why:'none'};
    if (run.show) return {ok:false, why:'show'};
    const next = ((run.pick | 0) + (dir == null ? 1 : dir)) % n;
    run.pick = (next + n) % n; run.groom = [];      // a new baby needs its own grooming
    return {ok:true, pet: babies[run.pick], index: run.pick};
  }
  function fbGroom(run){
    if (!run) return {ok:false, why:'run'};
    if (run.show) return {ok:false, why:'show'};
    if (run.groom.length >= FB_GROOM.length) return {ok:false, why:'done', done:true};
    const step = FB_GROOM[run.groom.length];
    run.groom.push(step.id);
    return {ok:true, step, done: run.groom.length >= FB_GROOM.length, left: FB_GROOM.length - run.groom.length};
  }
  function fbRoutine(pet, known){
    const extra = (Array.isArray(known) ? known : []).filter((id, i, a) => PS_TRICK_IDS.indexOf(id) >= 0 && a.indexOf(id) === i);
    return [fbSig(pet).id].concat(extra).slice(0, 4);
  }
  function fbStart(run, pet, known){
    if (!run) return {ok:false, why:'run'};
    if (run.show) return {ok:false, why:'show'};
    if (!fbIsBaby(pet)) return {ok:false, why:'baby'};
    if (run.groom.length < FB_GROOM.length) return {ok:false, why:'groom', need: FB_GROOM.length - run.groom.length};
    run.show = true; run.paid = false; run.n = (run.n | 0) + 1; run.pet = fbPetId(pet);
    run.routine = fbRoutine(pet, known);
    return {ok:true, routine: run.routine.slice(), n: run.n};
  }
  // Trick id -> a Pet Show pose id (signature tricks reuse a pose; regular tricks are their own pose).
  function fbPoseOf(id){
    for (const k in FB_SIG) if (FB_SIG[k].id === id) return FB_SIG[k].pose;
    return PS_TRICK_IDS.indexOf(id) >= 0 ? id : 'jump';
  }
  function fbTrickName(id){
    for (const k in FB_SIG) if (FB_SIG[k].id === id) return FB_SIG[k];
    const map = {sit:['Sit','🪑'], spin:['Spin','💫'], jump:['Jump','⬆️'], roll:['Roll Over','🔄'], high:['High Five','🖐️']};
    const m = map[id]; return m ? {id, name: m[0], emoji: m[1]} : {id, name: 'Trick', emoji: '✨'};
  }
  const half = v => Math.round(Math.max(0, Math.min(10, v)) * 2) / 2;
  function fbJudge(run, qualities){
    const routine = (run && run.routine) || [];
    if (!routine.length) return {ok:false, why:'empty', score:0, judges:[], ribbon: FB_RIBBON[0]};
    const qs = (Array.isArray(qualities) ? qualities : []).map(q => Math.max(0, Math.min(1, +q || 0)));
    const q = qs.length ? qs.reduce((a, b) => a + b, 0) / qs.length : 0.7;
    const g = Math.min(FB_GROOM.length, ((run && run.groom) || []).length);
    const t = Math.min(4, routine.length);
    const judges = [
      {id:'marigold', score: half(5 + g * 1.2 + q * 1.4)},
      {id:'barnaby',  score: half(4.6 + t * 1.05 + q * 1.4)},
      {id:'posy',     score: half(6.2 + q * 2.6 + (t > 1 ? 0.6 : 0))}
    ].map(j => Object.assign({}, FB_JUDGES.find(x => x.id === j.id), j));
    const score = Math.round(judges.reduce((a, j) => a + j.score, 0) / judges.length * 10) / 10;
    let ribbon = FB_RIBBON[0];
    FB_RIBBON.forEach(r => { if (score >= r.min) ribbon = r; });
    return {ok:true, score, judges, ribbon};
  }
  function fbRecord(state, run, judged, now){
    state = fbLoad(state);
    if (!run || !run.show || run.paid) return {ok:false, why:'paid', state, coins:0};
    if (!judged || !judged.ok) return {ok:false, why:'score', state, coins:0};
    run.paid = true; run.show = false; run.groom = [];     // the next show needs a fresh grooming
    const day = fbDay(now);
    if (state.day !== day){ state.day = day; state.paidToday = 0; }
    const coins = state.paidToday < FB_DAILY_PAID ? 5 + Math.round(judged.score) : 0;
    if (coins) state.paidToday += 1;
    state.shows += 1; state.earned += coins;
    state.best = Math.max(state.best, judged.score);
    state.ribbons[judged.ribbon.id] = (state.ribbons[judged.ribbon.id] | 0) + 1;
    const id = run.pet || 'baby';
    const b = state.babies[id] || {shows: 0, best: 0};
    b.shows += 1; b.best = Math.max(b.best, judged.score); state.babies[id] = b;
    return {ok:true, state, coins, capped: !coins, ribbon: judged.ribbon, score: judged.score, left: FB_DAILY_PAID - state.paidToday};
  }
  return {
    FB_KEY, FB_VER, FB_DAILY_PAID, FB_KINDS, FB_SIG, FB_GROOM, FB_JUDGES, FB_RIBBON,
    fbFresh, fbLoad, fbDay, fbIsBaby, fbBabies, fbPetId, fbSig, fbNewRun, fbPick, fbGroom, fbRoutine, fbStart, fbPoseOf, fbTrickName, fbJudge, fbRecord
  };
});
