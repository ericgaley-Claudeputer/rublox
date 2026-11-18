/* Chow Chuck Meadow — snack toss, power meter, original animals, personal book. Save key rubloxMeadow. */
(function (root) {
  const MEADOW_KEY = 'rubloxMeadow';
  const MEADOW_VER = 1;
  const MEADOW_BASE = 12;
  const MEADOW_STEP = 2;
  const MEADOW_MAX_TRAIN = 18;
  const MEADOW_ANIMALS = [
    {id:'puddle', name:'Puddle Pup', emoji:'🐶', color:'#7ec8e3'},
    {id:'clover', name:'Clover Kit', emoji:'🦊', color:'#f4a05c'},
    {id:'berry', name:'Berry Bun', emoji:'🐰', color:'#e88bb0'},
    {id:'moss', name:'Moss Mouse', emoji:'🐭', color:'#8fbf6a'},
    {id:'starlit', name:'Starlit Fawn', emoji:'🦌', color:'#d4b483'}
  ];
  const MEADOW_FIELDS = [
    {id:'patch', name:'Sunny Patch', min:8, animal:'puddle'},
    {id:'hill', name:'Clover Hill', min:16, animal:'clover'},
    {id:'brook', name:'Berry Brook', min:24, animal:'berry'},
    {id:'hollow', name:'Moss Hollow', min:32, animal:'moss'},
    {id:'glade', name:'Star Glade', min:40, animal:'starlit'}
  ];

  function meadowFresh(){
    return {ver: MEADOW_VER, found:[], trained:0, throws:0, best:0, snacks:12};
  }

  function meadowAnimal(id){ return MEADOW_ANIMALS.find(a => a.id === id) || null; }
  function meadowField(id){ return MEADOW_FIELDS.find(f => f.id === id) || null; }

  function meadowLoad(raw){
    const d = meadowFresh();
    const o = (raw && typeof raw === 'object') ? raw : {};
    if (Array.isArray(o.found)){
      d.found = o.found.map(x => meadowAnimal(x) ? x : null).filter(Boolean);
      d.found = d.found.filter((id, i, arr) => arr.indexOf(id) === i);
    }
    d.trained = Math.max(0, Math.min(MEADOW_MAX_TRAIN, o.trained | 0));
    d.throws = Math.max(0, o.throws | 0);
    d.best = Math.max(0, +o.best || 0);
    d.snacks = Math.max(0, o.snacks == null ? 12 : (o.snacks | 0));
    return d;
  }

  function meadowPower(state){
    state = meadowLoad(state);
    return MEADOW_BASE + state.trained * MEADOW_STEP;
  }

  function meadowCharge(v){
    const n = +v;
    if (!isFinite(n)) return 0;
    return Math.max(0, Math.min(1, n));
  }

  function meadowFieldAt(dist){
    let best = null;
    MEADOW_FIELDS.forEach(f => { if (dist + 1e-9 >= f.min) best = f; });
    return best;
  }

  function meadowThrow(state, charge, ownerId, animalOwnerId){
    state = meadowLoad(state);
    if (animalOwnerId && ownerId && animalOwnerId !== ownerId){
      return {ok:false, why:'owned', state, dist:0};
    }
    if ((state.snacks | 0) <= 0) return {ok:false, why:'snacks', state, dist:0};
    const c = meadowCharge(charge);
    if (c <= 0) return {ok:false, why:'charge', state, dist:0};
    const dist = meadowPower(state) * c;
    state.snacks -= 1;
    state.throws += 1;
    if (dist > state.best) state.best = Math.round(dist * 10) / 10;
    const field = meadowFieldAt(dist);
    let animal = null, foundNew = false;
    if (field){
      animal = meadowAnimal(field.animal);
      if (animal && state.found.indexOf(animal.id) < 0){
        state.found.push(animal.id);
        foundNew = true;
      }
    }
    return {ok:true, why:'ok', state, dist, field, animal, foundNew};
  }

  function meadowTrain(state){
    state = meadowLoad(state);
    if (state.trained >= MEADOW_MAX_TRAIN) return {ok:false, why:'max', state};
    state.trained += 1;
    return {ok:true, why:'ok', state, power: meadowPower(state)};
  }

  function meadowRestock(state, n){
    state = meadowLoad(state);
    state.snacks = Math.min(99, (state.snacks | 0) + Math.max(1, n|0 || 6));
    return state;
  }

  function meadowBook(state){
    state = meadowLoad(state);
    return MEADOW_ANIMALS.map(a => ({
      id: a.id, name: a.name, emoji: a.emoji, color: a.color,
      found: state.found.indexOf(a.id) >= 0,
      field: MEADOW_FIELDS.find(f => f.animal === a.id)
    }));
  }

  function meadowCanTake(ownerId, otherId){
    if (!otherId || !ownerId) return true;
    return ownerId === otherId;
  }

  const api = {
    MEADOW_KEY, MEADOW_VER, MEADOW_BASE, MEADOW_STEP, MEADOW_MAX_TRAIN,
    MEADOW_ANIMALS, MEADOW_FIELDS,
    meadowFresh, meadowLoad, meadowAnimal, meadowField, meadowPower, meadowCharge,
    meadowFieldAt, meadowThrow, meadowTrain, meadowRestock, meadowBook, meadowCanTake
  };
  root.MeadowRules = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
