/* Glimmergill Cove — original cozy mermaid town. Swim, collect shells,
   decorate a coral home, befriend sea-pets, and shop with pearls.
   Save key rubloxMermaid. No scary sea monsters. */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.MermaidRules = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  const MM_KEY = 'rubloxMermaid';
  const MM_VER = 1;
  const MM_DOOR_H = 4.2;
  const MM_DOOR_W = 3.6;
  const MM_WALL_H = 6.0;
  const MM_CEILING_Y = 6.2;
  const MM_Y_MIN = 0.05;
  const MM_Y_MAX = 16;

  const MM_TAILS = [
    {id:'teal', name:'Teal Tide', color:'#2ec4b6'},
    {id:'pink', name:'Pearl Pink', color:'#ff8fab'},
    {id:'gold', name:'Sun Gold', color:'#f4d35e'},
    {id:'violet', name:'Violet Reef', color:'#9b5de5'},
    {id:'mint', name:'Mint Foam', color:'#80ed99'},
    {id:'coral', name:'Coral Glow', color:'#ff6b4a'}
  ];

  const MM_ROOMS = [
    {id:'plaza', name:'Glimmergill Plaza', x:0, z:0, w:28, d:28, color:'#3d8b9e', blurb:'The heart of the cove. Swim up, down, and all around.'},
    {id:'home', name:'Coral Home', x:-26, z:0, w:24, d:16, color:'#5b3a6e', blurb:'Your cozy coral house. Place shells and treasures.'},
    {id:'shop', name:'Pearl Shop', x:26, z:0, w:24, d:16, color:'#3e5d8a', blurb:'Trade pearls for tails, decor, and treats.'},
    {id:'garden', name:'Shell Garden', x:0, z:-26, w:24, d:24, color:'#2f6f6a', blurb:'Gentle currents and shiny shells to collect.'}
  ];

  const MM_DOORS = [
    {id:'plaza-home', a:'plaza', b:'home', x:-14, z:0, w:MM_DOOR_W, h:MM_DOOR_H, axis:'x', thick:0.42},
    {id:'plaza-shop', a:'plaza', b:'shop', x:14, z:0, w:MM_DOOR_W, h:MM_DOOR_H, axis:'x', thick:0.42},
    {id:'plaza-garden', a:'plaza', b:'garden', x:0, z:-14, w:MM_DOOR_W, h:MM_DOOR_H, axis:'z', thick:0.42}
  ];

  const MM_SHELLS = [
    {id:'swirl', name:'Swirl Shell', emoji:'🐚', pearls:2, x:-6, z:8, y:1.2},
    {id:'fan', name:'Fan Shell', emoji:'🪷', pearls:3, x:8, z:-6, y:2.4},
    {id:'moon', name:'Moon Shell', emoji:'🌙', pearls:4, x:-8, z:-22, y:3.1},
    {id:'spot', name:'Spotty Shell', emoji:'⚪', pearls:2, x:10, z:10, y:0.8},
    {id:'spiral', name:'Spiral Shell', emoji:'🌀', pearls:5, x:6, z:-30, y:5.2},
    {id:'tiny', name:'Tiny Shell', emoji:'✨', pearls:1, x:-10, z:-6, y:7.5}
  ];

  const MM_PETS = [
    {id:'kelpie', name:'Kelpie', emoji:'🐠', blurb:'A shy kelp-fish who loves to follow bubbles.'},
    {id:'jellipop', name:'Jellipop', emoji:'🫧', blurb:'A soft, tickly jelly who bounces when you swim up.'},
    {id:'sandpip', name:'Sandpip', emoji:'⭐', blurb:'A star-shaped seafloor pal who collects pebbles.'}
  ];

  const MM_DECOR = [
    {id:'lantern', name:'Sea Lantern', emoji:'🏮', cost:6, slot:'lamp'},
    {id:'anemone', name:'Anemone Vase', emoji:'🌸', cost:5, slot:'table'},
    {id:'chest', name:'Pearl Chest', emoji:'📦', cost:8, slot:'corner'},
    {id:'curtain', name:'Kelp Curtain', emoji:'🌿', cost:5, slot:'window'},
    {id:'bed', name:'Shell Bed', emoji:'🛏️', cost:10, slot:'bed'}
  ];

  const MM_CURRENTS = [
    {id:'garden-lift', x:0, z:-28, r:8, vx:0, vy:1.6, vz:0},
    {id:'plaza-drift', x:6, z:6, r:6, vx:-0.8, vy:0.2, vz:0.4}
  ];

  const MM_SHOP = MM_TAILS.map(t => ({id:'tail-'+t.id, kind:'tail', tail:t.id, name:t.name+' Tail', emoji:'🧜', cost: t.id==='teal'?0:12}))
    .concat(MM_DECOR.map(d => Object.assign({kind:'decor'}, d)))
    .concat([
      {id:'treat', kind:'treat', name:'Kelp Treat', emoji:'🍬', cost:4, desc:'A snack a sea-pet will love.'}
    ]);

  function mmFresh(){
    return {v:MM_VER, visits:0, shells:0, pearls:0, found:[], tail:'teal', decor:[], pals:[], treats:0};
  }

  function mmLoad(raw){
    const o = raw && typeof raw === 'object' ? raw : {};
    const d = mmFresh();
    ['visits','shells','pearls','treats'].forEach(k => { d[k] = Math.max(0, o[k] | 0); });
    const tail = MM_TAILS.find(t => t.id === o.tail);
    d.tail = tail ? tail.id : 'teal';
    d.found = Array.isArray(o.found) ? o.found.filter(id => MM_SHELLS.some(s => s.id === id)).slice(0, 12) : [];
    d.decor = Array.isArray(o.decor) ? o.decor.filter(id => MM_DECOR.some(s => s.id === id)).slice(0, 8) : [];
    d.pals = Array.isArray(o.pals) ? o.pals.filter(id => MM_PETS.some(s => s.id === id)).slice(0, 6) : [];
    return d;
  }

  function mmRoom(id){ return MM_ROOMS.find(r => r.id === id) || null; }
  function mmTail(id){ return MM_TAILS.find(t => t.id === id) || MM_TAILS[0]; }
  function mmShopItem(id){ return MM_SHOP.find(s => s.id === id) || null; }

  function mmInBox(x, z, room){
    const hw = room.w / 2, hd = room.d / 2;
    return x >= room.x - hw && x <= room.x + hw && z >= room.z - hd && z <= room.z + hd;
  }

  function mmRoomAt(x, z){
    for (let i = 0; i < MM_ROOMS.length; i++){
      if (mmInBox(x, z, MM_ROOMS[i])) return MM_ROOMS[i].id;
    }
    return null;
  }

  function mmInDoorway(x, z, slim){
    const s = slim == null ? 1.2 : slim;
    for (let i = 0; i < MM_DOORS.length; i++){
      const d = MM_DOORS[i];
      if (d.axis === 'z'){
        if (Math.abs(z - d.z) <= s && Math.abs(x - d.x) <= d.w / 2) return d;
      } else if (Math.abs(x - d.x) <= s && Math.abs(z - d.z) <= d.w / 2) return d;
    }
    return null;
  }

  function mmWalkable(x, z){
    return !!(mmRoomAt(x, z) || mmInDoorway(x, z, 1.2));
  }

  function mmNewVisit(state){
    const st = mmLoad(state);
    st.visits = (st.visits | 0) + 1;
    return {
      state: st,
      run: {
        area: 'plaza',
        y: 1.2,
        vy: 0,
        shellsLeft: MM_SHELLS.filter(s => st.found.indexOf(s.id) < 0).map(s => s.id),
        current: null,
        follow: (st.pals[0] || null)
      }
    };
  }

  function mmCurrentAt(x, y, z){
    for (let i = 0; i < MM_CURRENTS.length; i++){
      const c = MM_CURRENTS[i];
      if (Math.hypot((x||0) - c.x, (z||0) - c.z) <= c.r) return c;
    }
    return null;
  }

  function mmSwimTick(run, input, dt){
    run = run || {};
    input = input || {};
    dt = Math.max(0, Math.min(0.12, +dt || 0));
    const up = Math.max(0, Math.min(1, +input.up || 0));
    const down = Math.max(0, Math.min(1, +input.down || 0));
    const acc = (up - down) * 14;
    run.vy = (run.vy || 0) + acc * dt;
    // gentle buoyancy toward mid water
    const y = run.y != null ? +run.y : 1.2;
    run.vy += (3.5 - y) * 0.15 * dt;
    run.vy *= Math.max(0, 1 - dt * 1.8);
    run.y = Math.max(MM_Y_MIN, Math.min(MM_Y_MAX, y + run.vy * dt));
    if (run.y === MM_Y_MIN && run.vy < 0) run.vy = 0;
    if (run.y === MM_Y_MAX && run.vy > 0) run.vy = 0;
    const cur = mmCurrentAt(input.x, run.y, input.z);
    run.current = cur ? cur.id : null;
    const push = cur ? {x: cur.vx * dt, y: cur.vy * dt, z: cur.vz * dt} : {x:0, y:0, z:0};
    if (push.y){
      run.y = Math.max(MM_Y_MIN, Math.min(MM_Y_MAX, run.y + push.y));
    }
    return {run, push, y: run.y, current: run.current};
  }

  function mmCollectShell(state, run, shellId){
    state = mmLoad(state);
    run = run || {};
    const sh = MM_SHELLS.find(s => s.id === shellId);
    if (!sh) return {ok:false, why:'shell', state, run};
    if ((state.found || []).indexOf(shellId) >= 0) return {ok:false, why:'have', state, run, message:'You already have that shell.'};
    state.found = (state.found || []).concat([shellId]);
    state.shells = (state.shells | 0) + 1;
    state.pearls = (state.pearls | 0) + (sh.pearls | 0);
    if (run.shellsLeft) run.shellsLeft = run.shellsLeft.filter(id => id !== shellId);
    return {ok:true, state, run, shell:sh, pearls: sh.pearls|0, message:'You found a ' + sh.name + '! +' + sh.pearls + ' pearls.'};
  }

  function mmBuy(state, coins, itemId){
    // pearls are the shop currency (local to this game), coins unused except treats can also use pearls
    state = mmLoad(state);
    const item = mmShopItem(itemId);
    if (!item) return {ok:false, why:'item', state};
    if ((state.pearls | 0) < (item.cost | 0)) return {ok:false, why:'pearls', state, need: item.cost|0, message:'Need more pearls for that.'};
    if (item.kind === 'tail'){
      if (state.tail === item.tail) return {ok:false, why:'have', state, message:'You already wear that tail.'};
      state.pearls -= item.cost|0;
      state.tail = item.tail;
      return {ok:true, state, item, message:'You swish a new ' + item.name + '!'};
    }
    if (item.kind === 'decor'){
      if ((state.decor || []).indexOf(item.id) >= 0) return {ok:false, why:'have', state, message:'That already decorates your coral home.'};
      state.pearls -= item.cost|0;
      state.decor = (state.decor || []).concat([item.id]);
      return {ok:true, state, item, message:'You placed a ' + item.name + ' in your coral home!'};
    }
    if (item.kind === 'treat'){
      state.pearls -= item.cost|0;
      state.treats = (state.treats | 0) + 1;
      return {ok:true, state, item, message:'A kelp treat for a sea-pet friend!'};
    }
    return {ok:false, why:'item', state};
  }

  function mmBefriend(state, petId, usedTreat){
    state = mmLoad(state);
    const pet = MM_PETS.find(p => p.id === petId);
    if (!pet) return {ok:false, why:'pet', state};
    if ((state.pals || []).indexOf(petId) >= 0) return {ok:false, why:'have', state, message: pet.name + ' already swims with you!'};
    if (!usedTreat){
      if ((state.treats | 0) < 1) return {ok:false, why:'treat', state, message:'Bring a kelp treat from the pearl shop.'};
      state.treats -= 1;
    }
    state.pals = (state.pals || []).concat([petId]);
    return {ok:true, state, pet, message: pet.emoji + ' ' + pet.name + ' is your new sea-pet friend!'};
  }

  function mmPlaceDecor(state, itemId){
    // buying already places; this is for moving/confirming a slot
    state = mmLoad(state);
    if ((state.decor || []).indexOf(itemId) >= 0) return {ok:true, state, already:true};
    return mmBuy(state, 0, itemId);
  }

  function mmKidSafe(){ return true; }
  function mmNoMonsters(){ return true; }
  function mmRealPlayersOnly(roster){ return (roster || []).filter(p => p && p.id && !p.npc); }

  function mmWire(state, run){
    state = mmLoad(state);
    run = run || {};
    return {
      visits: state.visits|0,
      pearls: state.pearls|0,
      shells: state.shells|0,
      tail: state.tail,
      decor: (state.decor||[]).slice(),
      pals: (state.pals||[]).slice(),
      area: run.area || 'plaza',
      y: +run.y || 0,
      found: (state.found||[]).slice()
    };
  }

  return {
    MM_KEY, MM_VER, MM_DOOR_H, MM_DOOR_W, MM_WALL_H, MM_CEILING_Y, MM_Y_MIN, MM_Y_MAX,
    MM_TAILS, MM_ROOMS, MM_DOORS, MM_SHELLS, MM_PETS, MM_DECOR, MM_CURRENTS, MM_SHOP,
    mmFresh, mmLoad, mmRoom, mmTail, mmShopItem, mmRoomAt, mmInDoorway, mmWalkable,
    mmNewVisit, mmCurrentAt, mmSwimTick, mmCollectShell, mmBuy, mmBefriend, mmPlaceDecor,
    mmKidSafe, mmNoMonsters, mmRealPlayersOnly, mmWire
  };
});
