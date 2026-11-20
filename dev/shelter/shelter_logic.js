/* Wagwell Shelter — original co-op pet shelter town. Customers are townsfolk, not opponents. */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.ShelterRules = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  const SH_KEY = 'rubloxShelter';
  const SH_VER = 1;
  const SH_PET_MAX = 6;
  const SH_KINDS = [
    {id:'cat', name:'Cat', emoji:'🐱', trait:'calm'},
    {id:'dog', name:'Dog', emoji:'🐶', trait:'playful'},
    {id:'bunny', name:'Bunny', emoji:'🐰', trait:'cuddly'},
    {id:'hamster', name:'Hamster', emoji:'🐹', trait:'calm'},
    {id:'mouse', name:'Mouse', emoji:'🐭', trait:'playful'}
  ];
  const SH_TRAITS = ['calm', 'playful', 'cuddly'];
  const SH_FAMILIES = [
    {id:'bramble', name:'The Brambles', emoji:'🏡', wishKind:'cat', wishTrait:'calm', line:'We would love a calm cat.'},
    {id:'puddle', name:'The Puddles', emoji:'🌧️', wishKind:'dog', wishTrait:'playful', line:'We want a playful dog to splash with.'},
    {id:'quilt', name:'The Quilts', emoji:'🧵', wishKind:'bunny', wishTrait:'cuddly', line:'A cuddly bunny would be perfect.'},
    {id:'nibble', name:'The Nibbles', emoji:'🍪', wishKind:'hamster', wishTrait:'calm', line:'A calm hamster for cozy evenings, please.'},
    {id:'spark', name:'The Sparks', emoji:'⭐', wishKind:'mouse', wishTrait:'playful', line:'We hope for a playful mouse friend.'},
    {id:'maple', name:'The Maples', emoji:'🍁', wishKind:'dog', wishTrait:'cuddly', line:'A cuddly dog to share the couch.'},
    {id:'cloud', name:'The Clouds', emoji:'☁️', wishKind:'cat', wishTrait:'cuddly', line:'A cuddly cat is on our wish list.'}
  ];
  const SH_UPGRADES = [
    {id:'kennels', name:'Extra Kennels', emoji:'🏠', cost:40, desc:'Two more cozy beds at the shelter.'},
    {id:'food', name:'Fancy Food', emoji:'🥣', cost:35, desc:'Meals boost happiness a little more.'},
    {id:'yard', name:'Play Yard', emoji:'🌳', cost:45, desc:'Playtime makes tails wag faster.'},
    {id:'beds', name:'Snug Beds', emoji:'🛏️', cost:30, desc:'Baths leave pets extra relaxed.'}
  ];

  function shKind(id){ return SH_KINDS.find(k => k.id === id) || SH_KINDS[0]; }
  function shFamily(id){ return SH_FAMILIES.find(f => f.id === id) || null; }
  function shUpgrade(id){ return SH_UPGRADES.find(u => u.id === id) || null; }

  function shFresh(){
    return {
      v: SH_VER,
      coinsEarned: 0,
      adopted: 0,
      rescued: 0,
      matched: 0,
      sentHome: 0,
      kennels: 2,
      ups: {},
      pets: [],
      nextId: 1
    };
  }

  function shCleanPet(p){
    if (!p || !shKind(p.kind)) return null;
    const trait = SH_TRAITS.indexOf(p.trait) >= 0 ? p.trait : shKind(p.kind).trait;
    return {
      id: String(p.id || ''),
      kind: p.kind,
      name: String(p.name || shKind(p.kind).name).slice(0, 16),
      trait: trait,
      happy: Math.max(0, Math.min(100, +p.happy || 0)),
      fed: Math.max(0, Math.min(100, +p.fed || 50)),
      clean: Math.max(0, Math.min(100, +p.clean || 50)),
      play: Math.max(0, Math.min(100, +p.play || 50)),
      color: Math.max(0, Math.min(2, p.color | 0))
    };
  }

  function shLoad(raw){
    const o = raw && typeof raw === 'object' ? raw : {};
    const d = shFresh();
    d.coinsEarned = Math.max(0, o.coinsEarned | 0);
    d.adopted = Math.max(0, o.adopted | 0);
    d.rescued = Math.max(0, o.rescued | 0);
    d.matched = Math.max(0, o.matched | 0);
    d.sentHome = Math.max(0, o.sentHome | 0);
    d.kennels = Math.max(2, Math.min(6, (o.kennels | 0) || 2));
    d.ups = {};
    SH_UPGRADES.forEach(u => { if (o.ups && o.ups[u.id]) d.ups[u.id] = 1; });
    if (d.ups.kennels) d.kennels = Math.max(d.kennels, 4);
    d.pets = (Array.isArray(o.pets) ? o.pets : []).map(shCleanPet).filter(Boolean).slice(0, d.kennels);
    d.nextId = Math.max(1, o.nextId | 0);
    return d;
  }

  function shKennelCap(state){
    state = shLoad(state);
    return state.ups.kennels ? 6 : 4 <= (state.kennels | 0) ? state.kennels : 2;
  }

  function shBoost(state, kind){
    state = shLoad(state);
    if (kind === 'fed') return state.ups.food ? 28 : 18;
    if (kind === 'play') return state.ups.yard ? 28 : 18;
    if (kind === 'clean') return state.ups.beds ? 28 : 18;
    return 18;
  }

  function shHappiness(pet){
    pet = shCleanPet(pet);
    if (!pet) return 0;
    return Math.round((pet.fed + pet.clean + pet.play) / 3);
  }

  function shReady(pet){ return shHappiness(pet) >= 70; }

  function shRollStray(rand, id){
    const r = typeof rand === 'function' ? rand : Math.random;
    const kind = SH_KINDS[Math.floor(r() * SH_KINDS.length)];
    const trait = SH_TRAITS[Math.floor(r() * SH_TRAITS.length)];
    const names = {
      cat:['Miso','Pebble','Noodle'], dog:['Biscuit','Waffles','Scout'], bunny:['Cloud','Pip','Button'],
      hamster:['Peanut','Cinnamon','Dot'], mouse:['Squeak','Crumbs','Twig']
    };
    const list = names[kind.id] || ['Pal'];
    return {
      id: 's' + String(id || Math.floor(r() * 9999)),
      kind: kind.id,
      name: list[Math.floor(r() * list.length)],
      trait: trait,
      happy: 20,
      fed: 25,
      clean: 20,
      play: 20,
      color: Math.floor(r() * 3),
      x: (r() * 16) - 8,
      z: 12 + r() * 16
    };
  }

  function shRescue(state, stray){
    state = shLoad(state);
    const cap = state.ups.kennels ? 6 : (state.kennels | 0) || 2;
    if (state.pets.length >= cap) return {ok:false, why:'full', state};
    const pet = shCleanPet(stray);
    if (!pet) return {ok:false, why:'pet', state};
    pet.id = 'p' + (state.nextId++);
    pet.happy = shHappiness(pet);
    state.pets.push(pet);
    state.rescued += 1;
    return {ok:true, why:'ok', pet, state};
  }

  function shCare(state, petId, act){
    state = shLoad(state);
    const pet = state.pets.find(p => p.id === petId);
    if (!pet) return {ok:false, why:'missing', state};
    if (act !== 'fed' && act !== 'clean' && act !== 'play') return {ok:false, why:'act', state};
    const add = shBoost(state, act);
    pet[act] = Math.min(100, (pet[act] || 0) + add);
    pet.happy = shHappiness(pet);
    return {ok:true, why:'ok', pet, state, ready: shReady(pet)};
  }

  function shVisitFamily(rand, taken){
    const r = typeof rand === 'function' ? rand : Math.random;
    const used = taken || [];
    const pool = SH_FAMILIES.filter(f => used.indexOf(f.id) < 0);
    const list = pool.length ? pool : SH_FAMILIES;
    return list[Math.floor(r() * list.length)];
  }

  function shMatch(state, petId, familyId){
    state = shLoad(state);
    const pet = state.pets.find(p => p.id === petId);
    const fam = shFamily(familyId);
    if (!pet) return {ok:false, why:'missing', state};
    if (!fam) return {ok:false, why:'family', state};
    if (!shReady(pet)) return {ok:false, why:'happy', state};
    const kindOk = pet.kind === fam.wishKind;
    const traitOk = pet.trait === fam.wishTrait;
    if (!kindOk || !traitOk) return {ok:false, why:'wish', kindOk, traitOk, wish: fam.line, state};
    state.pets = state.pets.filter(p => p.id !== petId);
    state.matched += 1;
    state.adopted += 1;
    const coins = 18 + (traitOk && kindOk ? 8 : 0);
    state.coinsEarned += coins;
    return {ok:true, why:'ok', coins, state, message: fam.name + ' went home with ' + pet.name + '!'};
  }

  function shBuyUpgrade(state, id, coins){
    state = shLoad(state);
    const u = shUpgrade(id);
    if (!u) return {ok:false, why:'item', state, coins};
    if (state.ups[id]) return {ok:false, why:'have', state, coins};
    if ((coins | 0) < u.cost) return {ok:false, why:'coins', state, coins};
    state.ups[id] = 1;
    if (id === 'kennels') state.kennels = 6;
    return {ok:true, why:'ok', state, coins: (coins | 0) - u.cost, cost: u.cost};
  }

  function shToCollectionPet(shelterPet){
    const pet = shCleanPet(shelterPet);
    if (!pet) return null;
    return {
      k: pet.kind,
      c: pet.color | 0,
      n: pet.name,
      xp: 0,
      f: 80, u: 80, e: 80,
      b: Date.now(),
      acc: {},
      tr: {},
      g: 'g',
      src: 'shelter'
    };
  }

  function shCanSendHome(petsSave, shelterPet){
    const ready = shReady(shelterPet);
    const p = shToCollectionPet(shelterPet);
    if (!ready || !p) return {ok:false, why: ready ? 'pet' : 'happy'};
    const have = petsSave && Array.isArray(petsSave.pets) ? petsSave.pets : [];
    if (have.length >= SH_PET_MAX) return {ok:false, why:'full'};
    return {ok:true, pet: p};
  }

  function shSendHome(state, petId, petsSave){
    state = shLoad(state);
    const pet = state.pets.find(p => p.id === petId);
    if (!pet) return {ok:false, why:'missing', state, pets: petsSave};
    const gate = shCanSendHome(petsSave, pet);
    if (!gate.ok) return {ok:false, why: gate.why, state, pets: petsSave};
    const next = petsSave && typeof petsSave === 'object' ? Object.assign({}, petsSave) : {v:2, pets:[]};
    next.pets = (Array.isArray(next.pets) ? next.pets.slice() : []).concat([gate.pet]);
    state.pets = state.pets.filter(p => p.id !== petId);
    state.sentHome += 1;
    state.adopted += 1;
    return {ok:true, why:'ok', state, pets: next, pet: gate.pet};
  }

  function shKeepPetField(src){
    return src === 'shelter' ? 'shelter' : undefined;
  }

  function shWire(state, extras){
    state = shLoad(state);
    extras = extras || {};
    return {
      pets: state.pets.map(shCleanPet),
      ups: Object.assign({}, state.ups),
      kennels: state.kennels,
      rescued: state.rescued,
      matched: state.matched,
      family: extras.family ? {id: extras.family.id, name: extras.family.name, wishKind: extras.family.wishKind, wishTrait: extras.family.wishTrait, line: extras.family.line, emoji: extras.family.emoji} : null,
      strays: (extras.strays || []).map(s => ({id:s.id, kind:s.kind, name:s.name, trait:s.trait, x:+s.x||0, z:+s.z||0, color:s.color|0}))
    };
  }

  return {
    SH_KEY, SH_VER, SH_PET_MAX, SH_KINDS, SH_TRAITS, SH_FAMILIES, SH_UPGRADES,
    shKind, shFamily, shUpgrade, shFresh, shLoad, shCleanPet, shKennelCap, shBoost,
    shHappiness, shReady, shRollStray, shRescue, shCare, shVisitFamily, shMatch,
    shBuyUpgrade, shToCollectionPet, shCanSendHome, shSendHome, shKeepPetField, shWire
  };
});
