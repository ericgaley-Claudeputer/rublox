/* Reset a game — Settings tool that clears one game's local save keys (or all games, with a double confirm). */
(function (root) {
  const RESET_ALL_WORD = 'RESET';

  // Never cleared by "Reset ALL games". Individual Adopt a Pet reset may clear rubloxPets.
  const RESET_KEEP_ON_ALL = [
    'rubloxCoins',          // wallet
    'rubloxPlayer',         // character name/color
    'rubloxAvatar',         // outfits / appearance
    'rubloxOwned',          // owned accessories
    'rubloxAchievements',   // achievements
    'rubloxPets',           // pet collection (only Adopt a Pet reset clears this)
    'rubloxPetFollow',      // follow-toggle setting
    'rubloxFriends',
    'rubloxChat',
    'rubloxTrades',
    'rubloxBoard',
    'rubloxQuests',
    'rubloxRecentGames',
    'rubloxBonus',
    'rubloxGraphics',
    'rubloxShowFps',
    'rubloxDark',
    'rubloxInvert',
    'rubloxFP',
    'rubloxMouseSens',
    'rubloxPadSens',
    'rubloxMusic',
    'rubloxMute',
    'rubloxWeather',
    'rubloxThrowTurn',
    'rubloxSpotify',
    'rubloxSpotifyPkce',
    'rubloxReloadTo'
  ];

  // Inventory of every game-progress save key found in the code (load/save and KEY constants).
  const RESET_GAMES = [
    {id:'elevator', name:'Wobblevator', emoji:'🛗', keys:['rubloxElevator']},
    {id:'garden', name:'Sunny Patch Garden', emoji:'🌱', keys:['rubloxGarden']},
    {id:'meadow', name:'Chow Chuck Meadow', emoji:'🥣', keys:['rubloxMeadow']},
    {id:'rides', name:'Rideland Workshop', emoji:'🎢', keys:['rubloxRides']},
    {id:'hive', name:'Honeyhill Hive', emoji:'🐝', keys:['rubloxHive']},
    {id:'camp', name:'Campfire Grove', emoji:'🔥', keys:['rubloxCamp']},
    {id:'cafe', name:'Cozy Corner Café', emoji:'☕', keys:['rubloxCafe']},
    {id:'fish', name:'Ripple Lake Fishing', emoji:'🎣', keys:['rubloxFish']},
    {id:'petshow', name:'Pet Talent Show', emoji:'🎭', keys:['rubloxPetShow']},
    {id:'hunt', name:'Treasure Trail', emoji:'🗺️', keys:['rubloxHunt']},
    {id:'snowfest', name:'Snow Festival', emoji:'❄️', keys:['rubloxSeason']},
    {id:'lantern', name:'Lantern Big Top', emoji:'🏮', keys:['rubloxLantern']},
    {id:'dreamhouse', name:'Dream House Builders', emoji:'🏡', keys:['rubloxDreamHouse']},
    {id:'pethotel', name:'Pet Hotel', emoji:'🏨', keys:['rubloxPetHotel']},
    {id:'dance', name:'Bossa Beat Dance Battle', emoji:'💃', keys:['rubloxDance']},
    {id:'haunt', name:'Giggle Manor Escape', emoji:'👻', keys:['rubloxHaunt']},
    {id:'stable', name:'Clover Meadow Stables', emoji:'🐴', keys:['rubloxStable']},
    {id:'icecream', name:'Scoop Circus Ice Cream', emoji:'🍦', keys:['rubloxIceCream']},
    {id:'tower', name:'Tower of Doom', emoji:'🗼', keys:['rubloxTower']},
    {id:'photostudio', name:'Star Snaps Photo Studio', emoji:'📸', keys:['rubloxPhotoStudio', 'rubloxPhotos']},
    {id:'waterpark', name:'Splash Summit Water Park', emoji:'🌊', keys:['rubloxWaterPark']},
    {id:'bakery', name:'Sweet Team Bakery', emoji:'🧁', keys:['rubloxBakery']},
    {id:'petisland', name:'Pet Adventure Island', emoji:'🏝️', keys:['rubloxPetIsland']},
    {id:'autumn', name:'Cozy Autumn Farm', emoji:'🍂', keys:['rubloxAutumnDay']},
    {id:'fashion', name:'Fashion Show', emoji:'👗', keys:['rubloxFashion', 'rubloxFsLook', 'rubloxFsTime']},
    {id:'hide', name:'Hide and Seek', emoji:'🙈', keys:['rubloxHide']},
    {id:'splash', name:"Don't Splash!", emoji:'🌊', keys:['rubloxSplash2']},
    {id:'race', name:'Pet Kart Racing', emoji:'🏁', keys:['rubloxRace']},
    {id:'pets', name:'Adopt a Pet', emoji:'🐾', keys:['rubloxPets']},
    {id:'obby', name:'Obby Rush', emoji:'🏃', keys:['rubloxObby']},
    {id:'build', name:'Build World', emoji:'🧱', keys:['rubloxBuild', 'rubloxBuildBest', 'rubloxBuildDay', 'rubloxBuildSel', 'rubloxBuildSlots']},
    {id:'lava', name:'Lava Escape', emoji:'🌋', keys:['rubloxLavaBest']},
    {id:'nds', name:'Disaster Island', emoji:'🌪️', keys:['rubloxNdsBest']}
  ];

  function resetGame(id){ return RESET_GAMES.find(g => g.id === id) || null; }
  function resetKeys(id){ const g = resetGame(id); return g ? g.keys.slice() : []; }
  function resetAllKeys(){
    const seen = new Set();
    const keys = [];
    RESET_GAMES.forEach(g => {
      if (g.id === 'pets') return; // keep the pet collection on Reset ALL
      g.keys.forEach(k => { if (RESET_KEEP_ON_ALL.indexOf(k) < 0 && !seen.has(k)){ seen.add(k); keys.push(k); } });
    });
    return keys;
  }
  function resetIsKept(key){ return RESET_KEEP_ON_ALL.indexOf(key) >= 0; }

  function resetConfirmTitle(id){
    if (id === 'all') return 'Reset ALL games?';
    const g = resetGame(id);
    return g ? ('Reset ' + g.name + '?') : 'Reset this game?';
  }
  function resetConfirmBody(id){
    if (id === 'all'){
      return 'This erases progress in every game and can\'t be undone. Your coins, character, outfits, pet collection, and achievements will be kept.';
    }
    const g = resetGame(id);
    const name = g ? g.name : 'this game';
    const extra = (id === 'pets') ? ' This includes your Adopt a Pet collection on this device.' : '';
    return 'Reset ' + name + '? This erases its progress and can\'t be undone.' + extra;
  }

  function resetApplyToStore(store, keys){
    const next = (store && typeof store === 'object') ? Object.assign({}, store) : {};
    (keys || []).forEach(k => { if (Object.prototype.hasOwnProperty.call(next, k)) delete next[k]; });
    return next;
  }
  function resetApply(store, id){ return resetApplyToStore(store, resetKeys(id)); }
  function resetApplyAll(store){ return resetApplyToStore(store, resetAllKeys()); }

  // Double confirm for Reset ALL: first Confirm opens step 2; second Confirm (or typing RESET) applies.
  function resetAllFresh(){ return {step: 0, typed: ''}; }
  function resetAllStart(st){ return {step: 1, typed: (st && st.typed) || ''}; }
  function resetAllType(st, text){ st = st && typeof st === 'object' ? st : resetAllFresh(); return {step: st.step || 0, typed: String(text || '')}; }
  function resetAllCanApply(st, pressConfirm){
    st = st && typeof st === 'object' ? st : resetAllFresh();
    const step = st.step | 0;
    const typed = String(st.typed || '').trim().toUpperCase() === RESET_ALL_WORD;
    if (step >= 1 && typed) return true;
    if (pressConfirm && step >= 1) return true;
    return false;
  }
  function resetAllAdvance(st, pressConfirm){
    st = st && typeof st === 'object' ? {step: st.step | 0, typed: String(st.typed || '')} : resetAllFresh();
    if (resetAllCanApply(st, pressConfirm)) return {ok:true, apply:true, state: {step: 0, typed: ''}};
    if (pressConfirm && st.step < 1) return {ok:true, apply:false, state: {step: 1, typed: st.typed}};
    if (pressConfirm && st.step === 1) return {ok:true, apply:true, state: {step: 0, typed: ''}};
    return {ok:false, apply:false, state: st};
  }

  const api = {
    RESET_GAMES, RESET_KEEP_ON_ALL, RESET_ALL_WORD,
    resetGame, resetKeys, resetAllKeys, resetIsKept,
    resetConfirmTitle, resetConfirmBody,
    resetApplyToStore, resetApply, resetApplyAll,
    resetAllFresh, resetAllStart, resetAllType, resetAllCanApply, resetAllAdvance
  };
  root.ResetRules = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
