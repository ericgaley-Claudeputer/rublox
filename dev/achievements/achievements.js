  /* ===================== Achievements (t279u) ===================== */
  const ACH_KEY = 'rubloxAchievements', ACH_VER = 1, ACH_BACKFILL_CAP = 200;
  const ACH_CATS = [
    {id: 'all', name: 'All', emoji: '🏆'},
    {id: 'dreamhouse', name: 'Dream House', emoji: '🏡'},
    {id: 'pets', name: 'Pets', emoji: '🐾'},
    {id: 'adventure', name: 'Adventure', emoji: '🏃'},
    {id: 'creative', name: 'Creative', emoji: '🎨'},
    {id: 'friends', name: 'Friends', emoji: '👫'},
    {id: 'collection', name: 'Collection', emoji: '🪙'}
  ];
  // Known Adopt-a-Pet rarities so backfill works even before PET_KINDS is in scope.
  const ACH_PET_R = {mouse:0,cat:0,dog:0,bunny:0,hamster:0,duck:1,frog:1,turtle:1,hedgehog:1,fox:2,penguin:2,owl:2,koala:2,pie:2,redpanda:3,snowleo:3,phoenix:3,unicorn:4,dragon:4};
  function achPetR(k){
    try { if (typeof PET_KINDS !== 'undefined' && PET_KINDS[k] && PET_KINDS[k].r != null) return PET_KINDS[k].r | 0; } catch (e){}
    return ACH_PET_R[k] | 0;
  }
  const ACHIEVEMENTS = [
    // Dream House
    {id:'dh-stake', cat:'dreamhouse', emoji:'📍', name:'Plot Claimed', desc:'Place your first foundation stake.', coins:5, prove:s => !!(s.dh && s.dh.goals && s.dh.goals.marked)},
    {id:'dh-foundation', cat:'dreamhouse', emoji:'🧂', name:'Solid Ground', desc:'Pour a concrete foundation.', coins:8, prove:s => !!(s.dh && s.dh.goals && s.dh.goals.slab)},
    {id:'dh-bricks', cat:'dreamhouse', emoji:'🧱', name:'First Course', desc:'Lay a tidy course of bricks.', coins:8, prove:s => !!(s.dh && s.dh.goals && s.dh.goals.course)},
    {id:'dh-walls', cat:'dreamhouse', emoji:'🏠', name:'Walls Up', desc:'Finish every wall of your house.', coins:12, prove:s => !!(s.dh && s.dh.goals && s.dh.goals.walls)},
    {id:'dh-roof', cat:'dreamhouse', emoji:'🏚️', name:'Under a Roof', desc:'Nail down the last shingle.', coins:12, prove:s => !!(s.dh && s.dh.goals && s.dh.goals.roof)},
    {id:'dh-frames', cat:'dreamhouse', emoji:'🚪', name:'Open House', desc:'Hang the door and every window frame.', coins:12, prove:s => !!(s.dh && s.dh.goals && s.dh.goals.openings)},
    {id:'dh-glass', cat:'dreamhouse', emoji:'🪟', name:'Sunshine In', desc:'Install glass in every window.', coins:10, prove:s => !!(s.dh && s.dh.goals && s.dh.goals.glaze)},
    {id:'dh-paint', cat:'dreamhouse', emoji:'🎨', name:'Fresh Coat', desc:'Paint every outside wall.', coins:10, prove:s => !!(s.dh && s.dh.goals && s.dh.goals.paint)},
    {id:'dh-done', cat:'dreamhouse', emoji:'🏡', name:'Dream Home Builder', desc:'Finish Paint & furnish and complete your Dream House.', coins:50, prove:s => !!(s.dh && s.dh.goals && s.dh.goals.furnish && s.dh.doneCutSeen !== false)},
    {id:'dh-like', cat:'dreamhouse', emoji:'💛', name:'Housewarming', desc:'Get a like on your Dream House.', coins:15, prove:s => !!(s.dh && (s.dh.likes | 0) >= 1)},
    // Pet Hotel + Adopt + Stables + Island
    {id:'ph-first', cat:'pets', emoji:'🏨', name:'Welcome, Guest', desc:'Check out your first Pet Hotel guest.', coins:10, prove:s => !!(s.hotel && (s.hotel.served | 0) >= 1)},
    {id:'ph-five', cat:'pets', emoji:'🛎️', name:'Kind Innkeeper', desc:'Serve 5 guest pets at the hotel.', coins:15, prove:s => !!(s.hotel && (s.hotel.served | 0) >= 5)},
    {id:'ph-twenty', cat:'pets', emoji:'🏅', name:'Five-Star Hotel', desc:'Serve 20 guest pets at the hotel.', coins:25, prove:s => !!(s.hotel && (s.hotel.served | 0) >= 20)},
    {id:'pets-adopt', cat:'pets', emoji:'🐾', name:'A New Friend', desc:'Adopt your first pet.', coins:10, prove:s => !!(s.pets && ((s.pets.pets && s.pets.pets.length) || (s.pets.dex && s.pets.dex.own && Object.keys(s.pets.dex.own).length)))},
    {id:'pets-three', cat:'pets', emoji:'🏠', name:'Full House', desc:'Have 3 pets living with you at once.', coins:20, prove:s => !!(s.pets && s.pets.pets && s.pets.pets.length >= 3)},
    {id:'pets-rare', cat:'pets', emoji:'🔵', name:'Rare Find', desc:'Adopt a Rare (or rarer) pet.', coins:20, prove:s => achBestPetR(s) >= 2},
    {id:'pets-epic', cat:'pets', emoji:'🟣', name:'Epic Pal', desc:'Adopt an Epic or Legendary pet.', coins:30, prove:s => achBestPetR(s) >= 3},
    {id:'pets-legend', cat:'pets', emoji:'🌟', name:'Legendary Bond', desc:'Adopt a Legendary pet.', coins:50, prove:s => achBestPetR(s) >= 4},
    {id:'stable-pony', cat:'pets', emoji:'🐴', name:'Pony Pal', desc:'Adopt a pony at Clover Meadow Stables.', coins:10, prove:s => !!(s.stable && s.stable.pony)},
    {id:'stable-show', cat:'pets', emoji:'🎀', name:'Show Ring', desc:'Enter a jumping show on your pony.', coins:15, prove:s => !!(s.stable && (s.stable.shows | 0) >= 1)},
    {id:'island-treasure', cat:'pets', emoji:'💎', name:'Island Digger', desc:'Dig up treasure on Pet Adventure Island.', coins:10, prove:s => !!(s.island && s.island.t && s.island.t.length >= 1)},
    {id:'island-vault', cat:'pets', emoji:'🗝️', name:'Secret Keeper', desc:'Open the secret vault on Pet Adventure Island.', coins:25, prove:s => !!(s.island && (s.island.vault || s.island.vaultG))},
    // Adventure
    {id:'obby-first', cat:'adventure', emoji:'🏁', name:'First Finish', desc:'Beat Obby Rush level 1.', coins:8, prove:s => achObbyDone(s) >= 1 || !!(s.obby && s.obby.done && s.obby.done[1])},
    {id:'obby-10', cat:'adventure', emoji:'🔟', name:'Ten Times Over', desc:'Beat 10 Obby Rush levels.', coins:15, prove:s => achObbyDone(s) >= 10},
    {id:'obby-world1', cat:'adventure', emoji:'🌱', name:'Meadow Master', desc:'Beat all 10 levels of Grassy Meadow.', coins:20, prove:s => achObbyWorld(s, 1)},
    {id:'obby-25', cat:'adventure', emoji:'🏃', name:'Halfway Hero', desc:'Beat 25 Obby Rush levels.', coins:25, prove:s => achObbyDone(s) >= 25},
    {id:'obby-50', cat:'adventure', emoji:'👑', name:'Obby Champion', desc:'Beat all 50 Obby Rush levels.', coins:50, prove:s => achObbyDone(s) >= 50},
    {id:'tag-play', cat:'adventure', emoji:'🏷️', name:'Tag Time', desc:'Play a game of Block Tag.', coins:8, prove:s => !!(s.notes && s.notes['play:tag']) || achPlayed(s, 'tag')},
    {id:'tag-it', cat:'adventure', emoji:'🙌', name:"Tag, You're It!", desc:'Tag another player in Block Tag.', coins:12, prove:s => !!(s.notes && s.notes['tag:tag'])},
    {id:'tag-win', cat:'adventure', emoji:'🏆', name:'It No More', desc:'Win a game of Block Tag.', coins:20, prove:s => !!(s.notes && s.notes['tag:win'])},
    {id:'wp-slide', cat:'adventure', emoji:'🌊', name:'Wheeee!', desc:'Ride a slide at Splash Summit Water Park.', coins:8, prove:s => achWpRides(s) >= 1},
    {id:'wp-race', cat:'adventure', emoji:'🛟', name:'River Rider', desc:'Finish a lazy-river race.', coins:12, prove:s => !!(s.water && (s.water.raced | 0) >= 1)},
    {id:'wp-win', cat:'adventure', emoji:'🥇', name:'River Champ', desc:'Win a lazy-river race.', coins:20, prove:s => !!(s.water && (s.water.wins | 0) >= 1)},
    {id:'splash-pad', cat:'adventure', emoji:'🌊', name:'Pad Hopper', desc:"Beat a Don't Splash! course.", coins:12, prove:s => !!(s.splash && s.splash.beat && Object.keys(s.splash.beat).length >= 1)},
    {id:'splash-more', cat:'adventure', emoji:'🚪', name:'Dry Feet', desc:"Unlock 5 Don't Splash! courses.", coins:20, prove:s => !!(s.splash && ((s.splash.unl | 0) >= 5 || (s.splash.beat && Object.keys(s.splash.beat).length >= 5)))},
    {id:'race-first', cat:'adventure', emoji:'🏁', name:'And They\'re Off', desc:'Finish a Pet Kart race.', coins:10, prove:s => !!(s.race && (s.race.races | 0) >= 1)},
    {id:'race-win', cat:'adventure', emoji:'🥇', name:'Checkered Flag', desc:'Win a Pet Kart race.', coins:20, prove:s => !!(s.race && (s.race.wins | 0) >= 1)},
    {id:'race-animal', cat:'adventure', emoji:'🐾', name:'Saddle Up', desc:'Race on an animal in Pet Kart Racing.', coins:10, prove:s => !!(s.race && s.race.ride && s.race.ride.animal)},
    {id:'race-kart', cat:'adventure', emoji:'🏎️', name:'Go-Kart Go', desc:'Race in a go-kart in Pet Kart Racing.', coins:10, prove:s => !!(s.race && s.race.ride && s.race.ride.kart)},
    {id:'lava-climb', cat:'adventure', emoji:'🌋', name:'Hot Feet', desc:'Climb at least 20 m in Lava Escape.', coins:12, prove:s => (s.lava | 0) >= 20},
    {id:'nds-survive', cat:'adventure', emoji:'🌪️', name:'Weathered It', desc:'Survive a disaster on Disaster Island.', coins:12, prove:s => (s.nds | 0) >= 1},
    {id:'nds-streak', cat:'adventure', emoji:'🔥', name:'Unshakable', desc:'Survive 3 disasters in a row.', coins:20, prove:s => (s.nds | 0) >= 3},
    {id:'tower-climb', cat:'adventure', emoji:'🗼', name:'Higher Ground', desc:'Climb at least 10 m in the Tower of Doom.', coins:10, prove:s => !!(s.tower && (s.tower.best | 0) >= 10)},
    {id:'tower-win', cat:'adventure', emoji:'🪜', name:'Top of the Tower', desc:'Reach the top of the Tower of Doom.', coins:25, prove:s => !!(s.tower && (s.tower.wins | 0) >= 1)},
    {id:'haunt-escape', cat:'adventure', emoji:'👻', name:'Out Before Dark', desc:'Escape Giggle Manor.', coins:20, prove:s => !!(s.haunt && (s.haunt.escapes | 0) >= 1)},
    {id:'dance-play', cat:'adventure', emoji:'💃', name:'On the Floor', desc:'Play a Bossa Beat Dance Battle.', coins:8, prove:s => !!(s.dance && (s.dance.plays | 0) >= 1)},
    {id:'dance-score', cat:'adventure', emoji:'🎶', name:'Rhythm Ace', desc:'Score 50 or more in a dance battle.', coins:15, prove:s => !!(s.dance && (s.dance.best | 0) >= 50)},
    {id:'hide-win', cat:'adventure', emoji:'🙈', name:'Found You', desc:'Win a game of Hide and Seek.', coins:15, prove:s => !!(s.hide && (s.hide.wins | 0) >= 1)},
    {id:'autumn-all', cat:'adventure', emoji:'🎃', name:'Pumpkin Patch', desc:'Find all 12 pumpkins at Cozy Autumn Farm.', coins:20, prove:s => !!(s.notes && s.notes['autumn:all']) || !!(s.autumnDay)},
    // Creative
    {id:'bk-first', cat:'creative', emoji:'🧁', name:'Fresh from the Oven', desc:'Fill your first bakery order.', coins:10, prove:s => !!(s.bakery && (s.bakery.served | 0) >= 1)},
    {id:'bk-ten', cat:'creative', emoji:'🍰', name:'Busy Bakery', desc:'Fill 10 bakery orders.', coins:20, prove:s => !!(s.bakery && (s.bakery.served | 0) >= 10)},
    {id:'bk-perfect', cat:'creative', emoji:'⭐', name:'Perfect Bake', desc:'Fill a bakery order perfectly.', coins:15, prove:s => !!(s.bakery && (s.bakery.perfect | 0) >= 1)},
    {id:'ic-serve', cat:'creative', emoji:'🍦', name:'Scoop There It Is', desc:'Serve your first ice cream.', coins:10, prove:s => !!(s.ice && (s.ice.served | 0) >= 1)},
    {id:'ic-perfect', cat:'creative', emoji:'🍨', name:'Cherry on Top', desc:'Serve a perfect ice cream order.', coins:15, prove:s => !!(s.ice && (s.ice.perfect | 0) >= 1)},
    {id:'ps-snap', cat:'creative', emoji:'📸', name:'Say Cheese', desc:'Take a photo in Star Snaps Photo Studio.', coins:8, prove:s => !!(s.photo && (s.photo.shots | 0) >= 1) || !!(s.photos && s.photos.length >= 1)},
    {id:'ps-gallery', cat:'creative', emoji:'🖼️', name:'Photo Wall', desc:'Save 5 photos in your gallery.', coins:15, prove:s => !!(s.photos && s.photos.length >= 5) || !!(s.photo && (s.photo.shots | 0) >= 5)},
    {id:'fashion-show', cat:'creative', emoji:'👗', name:'On the Runway', desc:'Walk in a Fashion Show.', coins:10, prove:s => !!(s.fashion && (s.fashion.shows | 0) >= 1)},
    {id:'fashion-win', cat:'creative', emoji:'🌟', name:'Star of the Show', desc:'Win a Fashion Show.', coins:20, prove:s => !!(s.fashion && (s.fashion.wins | 0) >= 1)},
    {id:'build-blocks', cat:'creative', emoji:'🧱', name:'Block Artist', desc:'Place 10 blocks in Build World.', coins:10, prove:s => !!(s.build && s.build.length >= 10)},
    // Friends
    {id:'mp-host', cat:'friends', emoji:'📣', name:'Come On Over', desc:'Host a room so friends can join you.', coins:10, prove:s => !!(s.notes && s.notes['mp:host'])},
    {id:'mp-friend', cat:'friends', emoji:'👫', name:'Better Together', desc:'Play a game with a friend in the same room.', coins:20, prove:s => !!(s.notes && s.notes['mp:friend'])},
    // Collection
    {id:'welcome', cat:'collection', emoji:'👋', name:'Hello, Friend', desc:'Pick a player name and join Rublox.', coins:5, prove:s => !!(s.player && s.player.name)},
    {id:'first-game', cat:'collection', emoji:'🎮', name:'Let\'s Play', desc:'Start any Rublox game.', coins:5, prove:s => !!(s.notes && s.notes.play) || !!(s.recent && s.recent.length >= 1)},
    {id:'shop-buy', cat:'collection', emoji:'🛍️', name:'Window Shopper No More', desc:'Buy your first item from the shop.', coins:8, prove:s => achOwnedN(s) >= 1},
    {id:'shop-five', cat:'collection', emoji:'👒', name:'Dressed Up', desc:'Own 5 shop items.', coins:15, prove:s => achOwnedN(s) >= 5},
    {id:'shop-style', cat:'collection', emoji:'😎', name:'New Look', desc:'Wear a face, hat, or extra from the shop.', coins:8, prove:s => achWearingExtra(s)},
    {id:'coins-750', cat:'collection', emoji:'🪙', name:'Coin Pouch', desc:'Hold at least 750 Rublox Coins.', coins:10, prove:s => (s.coins | 0) >= 750},
    {id:'coins-1000', cat:'collection', emoji:'💰', name:'Coin Bank', desc:'Hold at least 1,000 Rublox Coins.', coins:15, prove:s => (s.coins | 0) >= 1000},
    {id:'coins-2500', cat:'collection', emoji:'💎', name:'Coin Vault', desc:'Hold at least 2,500 Rublox Coins.', coins:25, prove:s => (s.coins | 0) >= 2500}
  ];

  function achObbyDone(s){
    const d = (s && s.obby && s.obby.done) || {};
    return Object.keys(d).filter(k => d[k]).length;
  }
  function achObbyWorld(s, world){
    const d = (s && s.obby && s.obby.done) || {};
    const lo = (world - 1) * 10 + 1, hi = world * 10;
    for (let n = lo; n <= hi; n++) if (!d[n] && !d[String(n)]) return false;
    return true;
  }
  function achWpRides(s){
    const r = (s && s.water && s.water.rides) || {};
    return Object.keys(r).reduce((n, k) => n + (r[k] | 0), 0);
  }
  function achBestPetR(s){
    let best = -1;
    const pets = (s && s.pets && s.pets.pets) || [];
    pets.forEach(p => { if (p && p.k) best = Math.max(best, achPetR(p.k)); });
    const own = (s && s.pets && s.pets.dex && s.pets.dex.own) || {};
    Object.keys(own).forEach(k => { if (own[k]) best = Math.max(best, achPetR(k)); });
    return best;
  }
  function achOwnedN(s){
    const o = s && s.owned;
    if (Array.isArray(o)) return o.length;
    if (o && typeof o === 'object') return Object.keys(o).length;
    return 0;
  }
  function achWearingExtra(s){
    const a = s && s.avatar;
    if (!a || typeof a !== 'object') return false;
    if (a.hat && a.hat !== 'none') return true;
    if (a.back || a.brow || a.ears || a.tail || a.lash) return true;
    if (a.face && a.face !== 'smile' && a.face !== 'default') return true;
    return false;
  }
  function achPlayed(s, id){
    const rec = s && s.recent;
    if (!Array.isArray(rec)) return false;
    return rec.some(r => r && (r.id === id || r === id));
  }

  const ach = {unlocked: {}, backfilled: false, notes: {}, cat: 'all', toastT: 0, _paying: false, _inited: false};

  function achTestHash(){
    try {
      const loc = (typeof location !== 'undefined' && location) || (typeof window !== 'undefined' && window.location) || null;
      const hash = loc && loc.hash ? String(loc.hash) : '';
      return /(?:^|#|&)dhtest=([A-Za-z0-9_-]+)/.test(hash);
    } catch (e){ return false; }
  }
  function achBlockPersist(){
    try {
      if (achTestHash()) return true;
      if (typeof dhTestBlockPersist === 'function' && dhTestBlockPersist()) return true;
      if (typeof dhTestActive === 'function' && dhTestActive()) return true;
    } catch (e){}
    return false;
  }
  function achRead(k, d){
    try {
      if (typeof load === 'function') return load(k, d);
    } catch (e){}
    return d;
  }
  function achWrite(k, v){
    if (achBlockPersist()) return false;
    try {
      if (typeof save === 'function'){ save(k, v); return true; }
    } catch (e){}
    return false;
  }
  function achLoad(){
    const r = achRead(ACH_KEY, null);
    const o = (r && typeof r === 'object') ? r : {};
    const unlocked = {};
    if (o.unlocked && typeof o.unlocked === 'object'){
      Object.keys(o.unlocked).forEach(id => {
        const u = o.unlocked[id];
        if (u && typeof u === 'object') unlocked[id] = {at: +u.at || 0, paid: !!u.paid};
        else if (u) unlocked[id] = {at: 0, paid: true};
      });
    }
    ach.unlocked = unlocked;
    ach.backfilled = !!o.backfilled;
    return {ver: ACH_VER, unlocked, backfilled: ach.backfilled};
  }
  function achSave(){
    if (achBlockPersist()) return false;
    return achWrite(ACH_KEY, {ver: ACH_VER, unlocked: ach.unlocked, backfilled: !!ach.backfilled});
  }
  function achList(){ return ACHIEVEMENTS.slice(); }
  function achById(id){ return ACHIEVEMENTS.find(a => a.id === id) || null; }
  function achUnlockedN(){ return Object.keys(ach.unlocked).length; }
  function achTotal(){ return ACHIEVEMENTS.length; }
  function achIsUnlocked(id){ return !!(ach.unlocked && ach.unlocked[id]); }

  function achSnapshot(extra){
    const L = achRead;
    const snap = {
      dh: L('rubloxDreamHouse', null),
      coins: (typeof coins === 'number') ? coins : (L('rubloxCoins', 0) | 0),
      owned: L('rubloxOwned', []),
      avatar: L('rubloxAvatar', null),
      player: L('rubloxPlayer', null),
      obby: L('rubloxObby', null),
      pets: L('rubloxPets', null),
      hotel: L('rubloxPetHotel', null),
      race: L('rubloxRace', null),
      splash: L('rubloxSplash2', null),
      bakery: L('rubloxBakery', null),
      photo: L('rubloxPhotoStudio', null),
      photos: L('rubloxPhotos', []),
      nds: L('rubloxNdsBest', 0),
      lava: L('rubloxLavaBest', 0),
      build: L('rubloxBuild', []),
      fashion: L('rubloxFashion', null),
      hide: L('rubloxHide', null),
      autumnDay: L('rubloxAutumnDay', ''),
      island: L('rubloxPetIsland', null),
      tower: L('rubloxTower', null),
      ice: L('rubloxIceCream', null),
      stable: L('rubloxStable', null),
      haunt: L('rubloxHaunt', null),
      dance: L('rubloxDance', null),
      water: L('rubloxWaterPark', null),
      recent: L('rubloxRecentGames', []),
      notes: Object.assign({}, ach.notes)
    };
    if (extra && typeof extra === 'object') Object.keys(extra).forEach(k => { snap[k] = extra[k]; });
    return snap;
  }
  function achProven(a, snap){
    if (!a || typeof a.prove !== 'function') return false;
    try { return !!a.prove(snap || achSnapshot()); } catch (e){ return false; }
  }

  function achPay(n){
    n = Math.max(0, +n || 0);
    if (n <= 0) return 0;
    if (achBlockPersist()) return 0;
    ach._paying = true;
    try {
      if (typeof setCoins === 'function' && typeof coins === 'number') setCoins(coins + n);
      else {
        const cur = achRead('rubloxCoins', 0) | 0;
        achWrite('rubloxCoins', cur + n);
      }
    } catch (e){}
    ach._paying = false;
    return n;
  }

  function achShowToast(a, coinsPaid, opts){
    if (!a) return;
    opts = opts || {};
    const now = Date.now();
    if (ach._holdUntil && now < ach._holdUntil && !opts.hold){
      ach._queuedToast = {a: a, coinsPaid: coinsPaid};
      return;
    }
    let el = null;
    try { el = (typeof document !== 'undefined' && document.getElementById) ? document.getElementById('achToast') : null; } catch (e){}
    if (!el){
      try { if (typeof toast === 'function') toast((a.emoji || '🏆') + ' ' + a.name + (coinsPaid ? (' +' + coinsPaid + ' 🪙') : '')); } catch (e){}
      return;
    }
    try { if (el.parentElement && typeof document !== 'undefined' && document.body && el.parentElement !== document.body) document.body.appendChild(el); } catch (e){}
    const pay = (coinsPaid > 0) ? ('+' + coinsPaid + ' 🪙') : '';
    el.innerHTML = '<div class="achtoast-icon">' + (a.emoji || '🏆') + '</div>'
      + '<div class="achtoast-body"><small>Achievement unlocked!</small><b></b>' + (pay ? ('<span class="achtoast-pay">' + pay + '</span>') : '') + '</div>';
    const b = el.querySelector('b'); if (b) b.textContent = a.name;
    el.classList.add('show');
    el.setAttribute('aria-hidden', 'false');
    clearTimeout(ach.toastT);
    const dur = opts.hold ? Math.max(4500, opts.holdMs | 0) : 3400;
    if (opts.hold) ach._holdUntil = Date.now() + dur;
    ach.toastT = setTimeout(() => {
      el.classList.remove('show');
      el.setAttribute('aria-hidden', 'true');
      ach._holdUntil = 0;
      const q = ach._queuedToast;
      ach._queuedToast = null;
      if (q && q.a) achShowToast(q.a, q.coinsPaid);
    }, dur);
    try { if (typeof confetti === 'function') confetti(); } catch (e){}
    try { if (typeof SND !== 'undefined' && SND && SND.coin) SND.coin(); } catch (e){}
  }

  function achUnlock(id, opts){
    opts = opts || {};
    const a = achById(id);
    if (!a) return false;
    if (ach.unlocked[id]) return false;
    const payWanted = opts.pay !== false && (a.coins | 0) > 0;
    const paidAmt = payWanted ? achPay(a.coins | 0) : 0;
    ach.unlocked[id] = {at: Date.now(), paid: payWanted && (paidAmt > 0 || achBlockPersist())};
    if (opts.persist !== false) achSave();
    if (opts.silent !== true) achShowToast(a, payWanted ? (a.coins | 0) : 0);
    if (opts.render !== false && typeof achRender === 'function') try { achRender(); } catch (e){}
    return true;
  }

  function achNote(ev, data){
    if (!ev) return [];
    const key = String(ev);
    ach.notes[key] = Object.assign({at: Date.now()}, data || {});
    if (key.indexOf('play:') === 0 || key === 'play') ach.notes.play = ach.notes[key];
    if (key === 'play' && data && data.mode) ach.notes['play:' + data.mode] = ach.notes[key];
    return achSweep({source: 'note'});
  }

  function achSweep(opts){
    opts = opts || {};
    if (ach._paying) return [];
    const snap = opts.snap || achSnapshot(opts.extra);
    const found = [];
    ACHIEVEMENTS.forEach(a => {
      if (ach.unlocked[a.id]) return;
      if (!achProven(a, snap)) return;
      if (achUnlock(a.id, {pay: opts.pay !== false, silent: opts.silent === true, persist: opts.persist !== false, render: false})) found.push(a.id);
    });
    if (found.length && opts.render !== false) try { achRender(); } catch (e){}
    return found;
  }

  function achBackfill(opts){
    opts = opts || {};
    achLoad();
    if (ach.backfilled && !opts.force) {
      return achSweep({silent: true, pay: false, snap: opts.snap, persist: opts.persist});
    }
    const snap = opts.snap || achSnapshot();
    const newly = [];
    let paidTotal = 0;
    ACHIEVEMENTS.forEach(a => {
      if (ach.unlocked[a.id]) return;
      if (!achProven(a, snap)) return;
      const room = Math.max(0, ACH_BACKFILL_CAP - paidTotal);
      const want = a.coins | 0;
      const give = opts.pay === false ? 0 : Math.min(want, room);
      const id = a.id;
      ach.unlocked[id] = {at: Date.now(), paid: give > 0 || want === 0};
      if (give > 0){ achPay(give); paidTotal += give; }
      newly.push(id);
    });
    ach.backfilled = true;
    if (opts.persist !== false) achSave();
    if (newly.length && opts.silent !== true){
      const msg = newly.length === 1
        ? ((achById(newly[0]) || {}).emoji || '🏆') + ' ' + ((achById(newly[0]) || {}).name || 'Achievement') + ' unlocked from your past adventures!'
        : ('🏆 ' + newly.length + ' achievements unlocked from your past adventures!');
      try {
        const el = (typeof document !== 'undefined' && document.getElementById) ? document.getElementById('achToast') : null;
        if (el){
          el.innerHTML = '<div class="achtoast-icon">🏆</div><div class="achtoast-body"><small>Welcome back!</small><b></b>'
            + (paidTotal ? ('<span class="achtoast-pay">+' + paidTotal + ' 🪙</span>') : '') + '</div>';
          const b = el.querySelector('b'); if (b) b.textContent = newly.length === 1 ? ((achById(newly[0]) || {}).name || 'Achievement') : (newly.length + ' achievements from your past adventures');
          el.classList.add('show');
          clearTimeout(ach.toastT);
          ach.toastT = setTimeout(() => el.classList.remove('show'), 3800);
        } else if (typeof toast === 'function') toast(msg + (paidTotal ? (' +' + paidTotal + ' 🪙') : ''));
        if (typeof confetti === 'function') confetti();
      } catch (e){}
    }
    try { achRender(); } catch (e){}
    return {unlocked: newly, paid: paidTotal};
  }

  function achEsc(t){
    return String(t == null ? '' : t).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }
  function achRender(){
    let grid = null, prog = null, tabs = null;
    try {
      if (typeof document === 'undefined' || !document.getElementById) return false;
      grid = document.getElementById('achGrid');
      prog = document.getElementById('achProg');
      tabs = document.getElementById('achTabs');
    } catch (e){ return false; }
    const n = achUnlockedN(), total = achTotal();
    if (prog) prog.textContent = n + '/' + total;
    const sub = (typeof document !== 'undefined') ? document.getElementById('achSub') : null;
    if (sub) sub.textContent = n === 0 ? 'Play to unlock badges! Locked ones still show what to try.' : (n === total ? 'You unlocked every achievement — amazing!' : (n + ' of ' + total + ' unlocked. Keep playing!'));
    if (tabs){
      const cur = ach.cat || 'all';
      if (!tabs.dataset.ready){
        tabs.innerHTML = ACH_CATS.map(c => '<button type="button" class="achtab' + (c.id === cur ? ' on' : '') + '" data-achcat="' + c.id + '">' + c.emoji + ' ' + c.name + '</button>').join('');
        tabs.dataset.ready = '1';
        tabs.onclick = ev => {
          const b = ev.target && ev.target.closest && ev.target.closest('[data-achcat]');
          if (!b) return;
          ach.cat = b.getAttribute('data-achcat') || 'all';
          achRender();
        };
      } else {
        Array.from(tabs.querySelectorAll('[data-achcat]')).forEach(b => b.classList.toggle('on', b.getAttribute('data-achcat') === cur));
      }
    }
    if (grid){
      const cat = ach.cat || 'all';
      const list = ACHIEVEMENTS.filter(a => cat === 'all' || a.cat === cat);
      grid.innerHTML = list.map(a => {
        const on = !!ach.unlocked[a.id];
        const pay = (a.coins | 0) > 0 ? '<em>' + (on ? 'Earned ' : '') + a.coins + ' 🪙</em>' : '';
        return '<article class="achcard' + (on ? ' on' : ' off') + '" data-ach="' + a.id + '">'
          + '<div class="achico">' + a.emoji + '</div>'
          + '<h3></h3><p></p>' + pay + (on ? '<span class="achok">✔</span>' : '')
          + '</article>';
      }).join('');
      const cards = grid.querySelectorAll('.achcard');
      list.forEach((a, i) => {
        const el = cards[i]; if (!el) return;
        const h = el.querySelector('h3'); if (h) h.textContent = a.name;
        const p = el.querySelector('p'); if (p) p.textContent = a.desc;
      });
    }
    return true;
  }
  function achOpen(){
    ach.cat = 'all';
    achRender();
    try {
      const el = document.getElementById('achievements');
      if (el && el.scrollIntoView) el.scrollIntoView({behavior: 'smooth'});
      if (typeof paintNav === 'function') paintNav('achievements', true);
      else $$ && $$('nav button').forEach && $$('nav button').forEach(x => x.classList.toggle('active', x.dataset.go === 'achievements'));
    } catch (e){}
    return true;
  }
  function achInit(){
    if (ach._inited) { achRender(); return ach; }
    ach._inited = true;
    achLoad();
    try { achBackfill({silent: false}); } catch (e){ try { achSweep({silent: true, pay: false}); } catch (e2){} }
    achRender();
    return ach;
  }

  if (typeof window !== 'undefined'){
    window.ACH_KEY = ACH_KEY;
    window.ACH_VER = ACH_VER;
    window.ACH_BACKFILL_CAP = ACH_BACKFILL_CAP;
    window.ACH_CATS = ACH_CATS;
    window.ACHIEVEMENTS = ACHIEVEMENTS;
    window.ach = ach;
    window.achInit = achInit;
    window.achList = achList;
    window.achById = achById;
    window.achLoad = achLoad;
    window.achSave = achSave;
    window.achUnlock = achUnlock;
    window.achNote = achNote;
    window.achSweep = achSweep;
    window.achBackfill = achBackfill;
    window.achSnapshot = achSnapshot;
    window.achProven = achProven;
    window.achRender = achRender;
    window.achOpen = achOpen;
    window.achIsUnlocked = achIsUnlocked;
    window.achTestHash = achTestHash;
    window.achBlockPersist = achBlockPersist;
    window.achUnlockedN = achUnlockedN;
    window.achTotal = achTotal;
  }
  /* ===================== end Achievements ===================== */
