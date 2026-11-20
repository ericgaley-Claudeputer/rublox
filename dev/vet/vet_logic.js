/* Pawsley Vet Clinic — original first-person clinic. Real-player co-op only; patient and owner NPCs are customers. */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.VetRules = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  const VT_KEY = 'rubloxVet';
  const VT_VER = 1;

  const VT_ROOMS = [
    {id:'reception', name:'Reception', x:0, z:8, w:16, d:16, color:'#f3e6c8',
      blurb:'Pets check in here. Take their chart from the front desk.'},
    {id:'exam', name:'Exam Room', x:0, z:-10, w:16, d:20, color:'#d9eef6',
      blurb:'Listen with a stethoscope, check ears and eyes, and take a temperature.'},
    {id:'xray', name:'X-ray Room', x:16, z:-10, w:16, d:20, color:'#e8e4f8',
      blurb:'A cute, simple scan to find a swallowed toy or a sprained paw.'},
    {id:'treatment', name:'Treatment Pharmacy', x:-16, z:-10, w:16, d:20, color:'#e4f3df',
      blurb:'Pick the right labeled medicine or bandage from the pharmacy shelf.'},
    {id:'surgery', name:'Gentle Care Room', x:0, z:-30, w:16, d:20, color:'#f8ead8',
      blurb:'Kid-friendly care: a bandage, a cast, a splinter, or a bubble-wash for a scrape.'},
    {id:'recovery', name:'Recovery Kennels', x:16, z:8, w:16, d:16, color:'#fde8f0',
      blurb:'Cuddle and feed pals until they feel cozy again.'},
    {id:'bath', name:'Bubbly Bath Corner', x:-16, z:8, w:16, d:16, color:'#d8f4f2',
      blurb:'A warm wash and a fluff-dry when a coat is muddy.'}
  ];

  const VT_DOORS = [
    {a:'reception', b:'exam', x:0, z:0, w:3.2, axis:'z'},
    {a:'exam', b:'xray', x:8, z:-10, w:3.2, axis:'x'},
    {a:'exam', b:'treatment', x:-8, z:-10, w:3.2, axis:'x'},
    {a:'exam', b:'surgery', x:0, z:-20, w:3.2, axis:'z'},
    {a:'reception', b:'recovery', x:8, z:8, w:3.2, axis:'x'},
    {a:'reception', b:'bath', x:-8, z:8, w:3.2, axis:'x'}
  ];

  const VT_SPECIES = [
    {id:'cat', name:'Cat', emoji:'🐱', rarity:'common'},
    {id:'dog', name:'Dog', emoji:'🐶', rarity:'common'},
    {id:'bunny', name:'Bunny', emoji:'🐰', rarity:'common'},
    {id:'hamster', name:'Hamster', emoji:'🐹', rarity:'uncommon'},
    {id:'bird', name:'Bird', emoji:'🐦', rarity:'uncommon'},
    {id:'fox', name:'Fox kit', emoji:'🦊', rarity:'rare'},
    {id:'otter', name:'Otter pup', emoji:'🦦', rarity:'rare'},
    {id:'star', name:'Star pup', emoji:'✨', rarity:'star'}
  ];

  const VT_NAMES = ['Poppy','Biscuit','Mochi','Sprout','Puddle','Noodle','Maple','Pip','Buttercup','Waffles','Clover','Pebble'];

  const VT_CASES = [
    {id:'cough', symptom:'a tickly cough', tools:['stethoscope','temp'], treat:'syrup', room:'treatment',
      note:'A cozy cough sip from a clearly labeled pharmacy bottle.'},
    {id:'ears', symptom:'itchy ears', tools:['ears'], treat:'ear-drops', room:'treatment',
      note:'Gentle ear drops from the labeled pharmacy shelf.'},
    {id:'eyes', symptom:'a watery eye', tools:['eyes'], treat:'eye-drops', room:'treatment',
      note:'Soothing eye drops, labeled just like at a careful pharmacy.'},
    {id:'limp', symptom:'a tender limp after play', tools:['temp','xray'], treat:'bandage', room:'surgery', xray:'sprain',
      note:'A soft, colorful bandage for a sprained paw.'},
    {id:'toy', symptom:'a rumbly tummy after playtime', tools:['stethoscope','xray'], treat:'sip', room:'treatment', xray:'toy',
      note:'A gentle tummy sip from the pharmacy cabinet after the toy is spotted.'},
    {id:'splinter', symptom:'a tiny paw splinter', tools:['eyes'], treat:'splinter', room:'surgery',
      note:'A careful splinter lift — no ouchies stay.'},
    {id:'scrape', symptom:'a scraped knee', tools:['eyes'], treat:'bubbles', room:'surgery',
      note:'A bubbly clean-up that leaves a shiny, happy scrape.'},
    {id:'muddy', symptom:'a muddy coat after puddles', tools:['eyes'], treat:'bath', room:'bath',
      note:'A warm wash and a fluff-dry in the bubbly bath corner.'}
  ];

  const VT_TREATS = ['syrup','ear-drops','eye-drops','sip','bandage','cast','splinter','bubbles','bath'];
  const VT_TOOLS = ['stethoscope','ears','eyes','temp','xray'];
  const VT_RARITY_ORDER = ['common','uncommon','rare','star'];

  const VT_KID_SAFE_BANNED = /\b(blood|gore|bleed|gory|wound|hurt badly|die|dies|dead|kill|painful|surgery knife)\b/i;

  function vtFresh(){
    return {v:VT_VER, cases:0, stars:0, coinsEarned:0, bestStreak:0, streak:0};
  }

  function vtLoad(raw){
    const o = raw && typeof raw === 'object' ? raw : {};
    const d = vtFresh();
    ['cases','stars','coinsEarned','bestStreak','streak'].forEach(k => {
      d[k] = Math.max(0, o[k] | 0);
    });
    return d;
  }

  function vtRoom(id){
    return VT_ROOMS.find(r => r.id === id) || null;
  }

  function vtInBox(x, z, room){
    const hw = room.w / 2, hd = room.d / 2;
    return x >= room.x - hw && x <= room.x + hw && z >= room.z - hd && z <= room.z + hd;
  }

  function vtRoomAt(x, z){
    for (let i = 0; i < VT_ROOMS.length; i++){
      if (vtInBox(x, z, VT_ROOMS[i])) return VT_ROOMS[i].id;
    }
    return null;
  }

  function vtInDoorway(x, z, slim){
    const s = slim == null ? 1.1 : slim;
    for (let i = 0; i < VT_DOORS.length; i++){
      const d = VT_DOORS[i];
      if (d.axis === 'z'){
        if (Math.abs(z - d.z) <= s && Math.abs(x - d.x) <= d.w / 2) return d;
      } else {
        if (Math.abs(x - d.x) <= s && Math.abs(z - d.z) <= d.w / 2) return d;
      }
    }
    return null;
  }

  function vtWalkable(x, z){
    return !!(vtRoomAt(x, z) || vtInDoorway(x, z, 1.2));
  }

  function vtConnected(a, b){
    if (!a || !b) return false;
    if (a === b) return true;
    return VT_DOORS.some(d => (d.a === a && d.b === b) || (d.a === b && d.b === a));
  }

  function vtNeighbors(id){
    const out = [];
    VT_DOORS.forEach(d => {
      if (d.a === id) out.push(d.b);
      else if (d.b === id) out.push(d.a);
    });
    return out;
  }

  function vtPath(from, to){
    if (!vtRoom(from) || !vtRoom(to)) return null;
    if (from === to) return [from];
    const q = [from], seen = {[from]: null};
    while (q.length){
      const cur = q.shift();
      const nbs = vtNeighbors(cur);
      for (let i = 0; i < nbs.length; i++){
        const n = nbs[i];
        if (seen[n] !== undefined) continue;
        seen[n] = cur;
        if (n === to){
          const path = [to];
          let p = cur;
          while (p){ path.unshift(p); p = seen[p]; }
          return path;
        }
        q.push(n);
      }
    }
    return null;
  }

  function vtReachable(from){
    from = from || 'reception';
    const out = {};
    VT_ROOMS.forEach(r => { out[r.id] = !!vtPath(from, r.id); });
    return out;
  }

  function vtForceFirstPerson(mode){ return mode === 'vet'; }
  function vtMayToggleCamera(mode){ return mode !== 'vet'; }
  function vtFpOn(mode, fpFlag){ return mode === 'vet' ? true : !!fpFlag; }
  function vtSetFp(mode, on){ return mode === 'vet' ? true : !!on; }

  function vtRarityOk(rarity, difficulty){
    const i = VT_RARITY_ORDER.indexOf(rarity);
    if (i < 0) return false;
    if (difficulty < 2) return i <= 0;
    if (difficulty < 5) return i <= 1;
    if (difficulty < 9) return i <= 2;
    return true;
  }

  function vtCaseOk(cs, difficulty){
    const tools = (cs.tools || []).length;
    if (difficulty < 2) return tools <= 1 && !cs.xray;
    if (difficulty < 5) return tools <= 2;
    return true;
  }

  function vtPick(list, rand){
    if (!list.length) return null;
    const i = Math.floor((rand()) * list.length) % list.length;
    return list[i];
  }

  function vtRng(seed){
    let s = (seed >>> 0) || 1;
    return function (){
      s = (s * 1664525 + 1013904223) >>> 0;
      return s / 4294967296;
    };
  }

  function vtDifficulty(state){
    return Math.min(12, (vtLoad(state).cases | 0));
  }

  function vtRollPatient(state, seed){
    const difficulty = vtDifficulty(state);
    const rand = typeof seed === 'function' ? seed : vtRng((seed | 0) || (Date.now() & 0x7fffffff) || 1);
    const speciesPool = VT_SPECIES.filter(s => vtRarityOk(s.rarity, difficulty));
    const casePool = VT_CASES.filter(c => vtCaseOk(c, difficulty));
    function pickRamp(pool, fallback){
      const list = pool.length ? pool : fallback;
      if (!list.length) return null;
      const maxI = Math.max.apply(null, list.map(s => {
        const r = s.rarity || (s.xray ? 'rare' : (s.tools && s.tools.length > 1 ? 'uncommon' : 'common'));
        const idx = VT_RARITY_ORDER.indexOf(r);
        return idx < 0 ? 0 : idx;
      }));
      const bias = Math.min(0.75, 0.2 + difficulty * 0.06);
      let use = list;
      if (rand() < bias){
        const top = list.filter(s => {
          const r = s.rarity || (s.xray ? 'rare' : (s.tools && s.tools.length > 1 ? 'uncommon' : 'common'));
          const idx = VT_RARITY_ORDER.indexOf(r);
          return (idx < 0 ? 0 : idx) === maxI;
        });
        if (top.length) use = top;
      }
      return vtPick(use, rand);
    }
    const species = pickRamp(speciesPool, VT_SPECIES.slice(0, 3));
    const cs = pickRamp(casePool, VT_CASES.filter(c => !c.xray && c.tools.length <= 1));
    const name = vtPick(VT_NAMES, rand);
    const xrayTarget = cs.xray ? (Math.floor(rand() * 16) | 0) : -1;
    return {
      name,
      species: species.id,
      speciesName: species.name,
      emoji: species.emoji,
      rarity: species.rarity,
      caseId: cs.id,
      symptom: cs.symptom,
      tools: cs.tools.slice(),
      treat: cs.treat,
      treatRoom: cs.room,
      note: cs.note,
      xray: cs.xray || null,
      xrayTarget,
      difficulty
    };
  }

  function vtEmptyRun(){
    return {
      room: 'reception',
      phase: 'wait',
      patient: null,
      checked: [],
      xrayFound: false,
      xrayGuesses: [],
      cuddle: false,
      feed: false,
      lastMessage: 'A pal is waiting at the front desk.',
      prompt: 'Take the chart',
      coinsThis: 0,
      starsThis: 0,
      t: 0
    };
  }

  function vtNewShift(state, seed){
    const st = vtLoad(state);
    const run = vtEmptyRun();
    run.patient = vtRollPatient(st, seed);
    run.lastMessage = run.patient.emoji + ' ' + run.patient.name + ' the ' + run.patient.speciesName + ' is here with ' + run.patient.symptom + '.';
    run.prompt = 'Take the chart';
    return {state: st, run};
  }

  function vtNeedTools(run){
    return (run && run.patient && run.patient.tools) ? run.patient.tools.slice() : [];
  }

  function vtChart(run){
    if (!run || !run.patient) return {open:false, lines:[], checks:[], phase: run ? run.phase : 'wait'};
    const p = run.patient;
    const need = vtNeedTools(run);
    const checks = need.map(tool => ({tool, done: (run.checked || []).indexOf(tool) >= 0}));
    if (p.xray) checks.push({tool:'xray-find', done: !!run.xrayFound});
    const treated = ['recover','pickup','done'].indexOf(run.phase) >= 0;
    const recovered = ['pickup','done'].indexOf(run.phase) >= 0;
    return {
      open: true,
      name: p.name,
      species: p.speciesName,
      emoji: p.emoji,
      rarity: p.rarity,
      symptom: p.symptom,
      note: p.note,
      treat: p.treat,
      treatRoom: p.treatRoom,
      phase: run.phase,
      checks,
      treated,
      cuddle: !!run.cuddle,
      feed: !!run.feed,
      recovered,
      lines: [
        p.emoji + ' ' + p.name + ' · ' + p.speciesName + ' (' + p.rarity + ')',
        'Symptom: ' + p.symptom,
        p.note
      ]
    };
  }

  function vtCheckIn(run){
    if (!run || !run.patient) return {ok:false, why:'no'};
    if (run.phase !== 'wait') return {ok:false, why:'phase', message: run.lastMessage};
    run.phase = 'exam';
    run.checked = [];
    run.lastMessage = 'Chart in hand! Walk to the exam room and check every tool on the list.';
    run.prompt = 'Examine with a tool';
    return {ok:true, why:'ok', chart: vtChart(run), message: run.lastMessage};
  }

  function vtExamReady(run){
    if (!run || !run.patient) return false;
    const need = vtNeedTools(run);
    if (need.some(t => (run.checked || []).indexOf(t) < 0)) return false;
    if (run.patient.xray && !run.xrayFound) return false;
    return true;
  }

  function vtUseTool(run, tool, room){
    if (!run || !run.patient) return {ok:false, why:'no'};
    if (run.phase !== 'exam' && run.phase !== 'scan') return {ok:false, why:'phase', message:'Take the chart at reception first.'};
    if (VT_TOOLS.indexOf(tool) < 0) return {ok:false, why:'tool'};
    const here = room || run.room;
    if (tool === 'xray'){
      if (here !== 'xray') return {ok:false, why:'room', message:'The scanner is in the X-ray Room.'};
      if (!run.patient.xray) return {ok:false, why:'need', message:'This pal does not need a scan. Check the chart!'};
      run.phase = 'scan';
      run.lastMessage = run.patient.xray === 'toy'
        ? 'Sweep the cute scanner to find the swallowed toy.'
        : 'Sweep the cute scanner to find the tender, sprained paw.';
      run.prompt = 'Scan a square';
      return {ok:true, why:'ok', scan:true, message: run.lastMessage, chart: vtChart(run)};
    }
    if (here !== 'exam') return {ok:false, why:'room', message:'Use exam tools in the Exam Room.'};
    const need = vtNeedTools(run);
    if (need.indexOf(tool) < 0){
      run.lastMessage = 'That tool is not on this chart — everyone is still okay. Try the listed check.';
      return {ok:false, why:'need', message: run.lastMessage, chart: vtChart(run)};
    }
    if ((run.checked || []).indexOf(tool) < 0) run.checked.push(tool);
    if (vtExamReady(run)){
      run.phase = 'treat';
      run.lastMessage = 'Checks are done! Go to the ' + (vtRoom(run.patient.treatRoom) || {name:'treatment room'}).name + ' and pick the matching care.';
      run.prompt = 'Treat';
    } else {
      run.lastMessage = 'Nice check! Keep going down the chart.';
      run.prompt = 'Examine with a tool';
    }
    return {ok:true, why:'ok', checked: run.checked.slice(), ready: run.phase === 'treat', message: run.lastMessage, chart: vtChart(run)};
  }

  function vtXrayScan(run, cell){
    if (!run || !run.patient) return {ok:false, why:'no'};
    if (!run.patient.xray) return {ok:false, why:'need'};
    if (run.phase !== 'exam' && run.phase !== 'scan') return {ok:false, why:'phase'};
    run.phase = 'scan';
    cell = cell | 0;
    if (cell < 0 || cell > 15) return {ok:false, why:'cell'};
    if ((run.xrayGuesses || []).indexOf(cell) < 0) run.xrayGuesses.push(cell);
    if (cell === (run.patient.xrayTarget | 0)){
      run.xrayFound = true;
      if ((run.checked || []).indexOf('xray') < 0) run.checked.push('xray');
      if (vtExamReady(run)){
        run.phase = 'treat';
        run.lastMessage = run.patient.xray === 'toy'
          ? 'There it is — a sparkly toy! Now a gentle tummy sip from the pharmacy.'
          : 'There it is — a tender, sprained paw! A soft bandage will help.';
        run.prompt = 'Treat';
      } else {
        run.phase = 'exam';
        run.lastMessage = 'Scan complete! Finish the remaining exam checks.';
        run.prompt = 'Examine with a tool';
      }
      return {ok:true, why:'ok', found:true, cell, message: run.lastMessage, chart: vtChart(run)};
    }
    run.lastMessage = 'Not this square — keep scanning. The pal is perfectly okay.';
    return {ok:true, why:'ok', found:false, cell, message: run.lastMessage, chart: vtChart(run)};
  }

  function vtTreat(run, item, room){
    if (!run || !run.patient) return {ok:false, why:'no'};
    if (run.phase !== 'treat') return {ok:false, why:'phase', message: vtExamReady(run) ? 'Pick a treatment.' : 'Finish the exam checklist first.'};
    if (VT_TREATS.indexOf(item) < 0) return {ok:false, why:'item'};
    const here = room || run.room;
    const needRoom = run.patient.treatRoom;
    if (here !== needRoom){
      return {ok:false, why:'room', message:'That care happens in the ' + (vtRoom(needRoom) || {name:needRoom}).name + '.'};
    }
    if (item !== run.patient.treat){
      run.lastMessage = 'That is not the matching labeled care — check the chart and try again. The pal is still okay.';
      return {ok:false, why:'wrong', message: run.lastMessage, chart: vtChart(run)};
    }
    run.phase = 'recover';
    run.cuddle = false;
    run.feed = false;
    run.lastMessage = 'All better already! Take ' + run.patient.name + ' to the Recovery Kennels for a cuddle and a snack.';
    run.prompt = 'Cuddle and feed';
    return {ok:true, why:'ok', message: run.lastMessage, chart: vtChart(run)};
  }

  function vtCuddle(run, room){
    if (!run || !run.patient) return {ok:false, why:'no'};
    if (run.phase !== 'recover') return {ok:false, why:'phase'};
    const here = room || run.room;
    if (here !== 'recovery') return {ok:false, why:'room', message:'Cuddles happen in the Recovery Kennels.'};
    run.cuddle = true;
    if (run.cuddle && run.feed){
      run.phase = 'pickup';
      run.lastMessage = run.patient.name + ' feels cozy and ready. Their person is waiting in Reception for a happy pickup!';
      run.prompt = 'Happy pickup';
    } else {
      run.lastMessage = 'What a cozy cuddle. A snack will finish the recovery.';
      run.prompt = 'Feed';
    }
    return {ok:true, why:'ok', message: run.lastMessage, chart: vtChart(run)};
  }

  function vtFeed(run, room){
    if (!run || !run.patient) return {ok:false, why:'no'};
    if (run.phase !== 'recover') return {ok:false, why:'phase'};
    const here = room || run.room;
    if (here !== 'recovery') return {ok:false, why:'room', message:'Snacks are in the Recovery Kennels.'};
    run.feed = true;
    if (run.cuddle && run.feed){
      run.phase = 'pickup';
      run.lastMessage = run.patient.name + ' feels cozy and ready. Their person is waiting in Reception for a happy pickup!';
      run.prompt = 'Happy pickup';
    } else {
      run.lastMessage = 'Yum! A cuddle will finish the recovery.';
      run.prompt = 'Cuddle';
    }
    return {ok:true, why:'ok', message: run.lastMessage, chart: vtChart(run)};
  }

  function vtPayout(patient){
    const rarityBonus = {common:0, uncommon:4, rare:8, star:14};
    const diff = patient && patient.difficulty ? patient.difficulty : 0;
    const coins = 8 + (rarityBonus[patient && patient.rarity] || 0) + Math.min(8, diff);
    const stars = patient && patient.rarity === 'star' ? 3 : (patient && patient.rarity === 'rare' ? 2 : 1);
    return {coins, stars};
  }

  function vtPickup(run, state, room){
    if (!run || !run.patient) return {ok:false, why:'no'};
    if (run.phase !== 'pickup') return {ok:false, why:'phase', message:'Finish cuddles and a snack first.'};
    const here = room || run.room;
    if (here !== 'reception') return {ok:false, why:'room', message:'The happy pickup is at the Reception desk.'};
    const pay = vtPayout(run.patient);
    const st = vtLoad(state);
    st.cases = (st.cases | 0) + 1;
    st.stars = (st.stars | 0) + pay.stars;
    st.coinsEarned = (st.coinsEarned | 0) + pay.coins;
    st.streak = (st.streak | 0) + 1;
    if (st.streak > (st.bestStreak | 0)) st.bestStreak = st.streak;
    run.phase = 'done';
    run.coinsThis = pay.coins;
    run.starsThis = pay.stars;
    run.lastMessage = 'Happy pickup! ' + run.patient.name + ' is all better. +' + pay.coins + ' coins and ' + pay.stars + ' star' + (pay.stars === 1 ? '' : 's') + '!';
    run.prompt = 'Next pal';
    return {ok:true, why:'ok', coins: pay.coins, stars: pay.stars, state: st, message: run.lastMessage, everyoneOk: true, chart: vtChart(run)};
  }

  function vtNextPatient(run, state, seed){
    const st = vtLoad(state);
    const next = vtEmptyRun();
    next.patient = vtRollPatient(st, seed);
    next.lastMessage = next.patient.emoji + ' ' + next.patient.name + ' the ' + next.patient.speciesName + ' is here with ' + next.patient.symptom + '.';
    next.prompt = 'Take the chart';
    Object.keys(next).forEach(k => { run[k] = next[k]; });
    return {ok:true, run, state: st, message: run.lastMessage};
  }

  function vtKidCopyOk(text){
    return !VT_KID_SAFE_BANNED.test(String(text || ''));
  }

  function vtRealPlayersOnly(roster){
    return (roster || []).filter(p => p && p.id && !p.npc);
  }

  function vtWire(state, run){
    state = vtLoad(state);
    run = run || {};
    const p = run.patient || null;
    return {
      cases: state.cases,
      stars: state.stars,
      coinsEarned: state.coinsEarned,
      streak: state.streak,
      room: run.room || 'reception',
      phase: run.phase || 'wait',
      patient: p ? {
        name: p.name, species: p.species, speciesName: p.speciesName, emoji: p.emoji, rarity: p.rarity,
        caseId: p.caseId, symptom: p.symptom, tools: (p.tools || []).slice(), treat: p.treat,
        treatRoom: p.treatRoom, note: p.note, xray: p.xray || null, xrayTarget: p.xrayTarget|0, difficulty: p.difficulty|0
      } : null,
      checked: (run.checked || []).slice(),
      xrayFound: !!run.xrayFound,
      cuddle: !!run.cuddle,
      feed: !!run.feed,
      lastMessage: run.lastMessage || '',
      prompt: run.prompt || ''
    };
  }

  function vtApply(run, data){
    if (!run || !data) return run;
    ['room','phase','checked','xrayFound','cuddle','feed','lastMessage','prompt','patient','xrayGuesses','coinsThis','starsThis'].forEach(k => {
      if (data[k] !== undefined) run[k] = data[k];
    });
    return run;
  }

  return {
    VT_KEY, VT_VER, VT_ROOMS, VT_DOORS, VT_SPECIES, VT_NAMES, VT_CASES, VT_TREATS, VT_TOOLS, VT_RARITY_ORDER,
    vtFresh, vtLoad, vtRoom, vtRoomAt, vtInDoorway, vtWalkable, vtConnected, vtNeighbors, vtPath, vtReachable,
    vtForceFirstPerson, vtMayToggleCamera, vtFpOn, vtSetFp,
    vtDifficulty, vtRollPatient, vtNewShift, vtChart, vtCheckIn, vtUseTool, vtXrayScan, vtExamReady,
    vtTreat, vtCuddle, vtFeed, vtPickup, vtPayout, vtNextPatient, vtKidCopyOk, vtRealPlayersOnly,
    vtWire, vtApply
  };
});
