  /* ===================== t207u/t211u: FASHION SHOW v2 — lobby, walk-in dressing room, themes, runway poses, 1-5 star ratings, podium, fashion levels ===================== */
  const FS_TIMES = [60, 180, 300], FS_INTRO = 4.2, FS_WALK = 9, FS_POD = 7, FS_JOIN = 5, FS_PRIZE = [30, 20, 10], FS_ACCMAX = 4;
  const FS_THEMES = [
    {id: 'beach',  name: 'Beach Day',      emoji: '🏖️', cols: ['#ffd23f', '#3ac6ff', '#ff9f1c', '#2ec4b6'], likes: ['shorts', 'shades', 'backcap', 'star', 'sun', 'flower'], fx: ['shorts', 'sneak', 'sunnies', 'bag', 'tank', 'flowers', 'swoop', 'crop', 'pony'], hint: 'sunny colours, shorts, sunnies, a beach bag'},
    {id: 'hero',   name: 'Superhero',      emoji: '🦸', cols: ['#ff4d4d', '#3a86ff', '#ffd23f'], likes: ['lightning', 'hero', 'cape', 'star', 'mask', 'wings'], fx: ['armor', 'boots', 'jersey', 'gloves', 'belt', 'mohawk', 'leggings', 'stars'], hint: 'red, blue & yellow, hero armor, boots'},
    {id: 'space',  name: 'Space Explorer', emoji: '🚀', cols: ['#1d2340', '#8b5cf6', '#c0c7d6', '#3cf2c8'], likes: ['propeller', 'robot', 'sparkly', 'spacebuns', 'star', 'antenna'], fx: ['starry', 'sparkle', 'puffs', 'glitter', 'halo', 'armor', 'stars', 'boots'], hint: 'dark purple & silver, starry gowns, glitter'},
    {id: 'fancy',  name: 'Fancy Party',    emoji: '🎩', cols: ['#2b2d42', '#f5f5f5', '#ff6fb5', '#ffd23f'], likes: ['dress', 'crown', 'sparkly', 'bow', 'lash', 'beehive', 'top'], fx: ['gown', 'tux', 'heels', 'pearls', 'tiara', 'glam', 'earrings', 'bob', 'mini'], hint: 'ball gowns or a tux, pearls, heels'},
    {id: 'rainbow',name: 'Rainbow',        emoji: '🌈', cols: ['#ff4d4d', '#ff9f1c', '#ffd23f', '#2ec27e', '#3a86ff', '#8b5cf6'], likes: ['rainbow', 'sparkly', 'horn', 'heart', 'unicorn'], fx: ['tutu', 'sparkle', 'glitter', 'hearts', 'braids', 'flowers', 'dots', 'tiered', 'rainbow'], hint: 'ALL the colours, tutus, sparkles'},
    {id: 'autumn', name: 'Cozy Autumn',    emoji: '🍂', cols: ['#d9601f', '#b07a43', '#8a3b12', '#e9b949'], likes: ['hoodie', 'plaid', 'pumpkin', 'jeans', 'turkey', 'fox', 'bear'], fx: ['sweater', 'boots', 'scarf', 'cargo', 'freckles', 'long', 'checks', 'jacket'], hint: 'orange & brown, plaid, sweaters, scarves'},
    {id: 'spooky', name: 'Spooky Cute',    emoji: '👻', cols: ['#2b2d42', '#ff9f1c', '#8b5cf6', '#f5f5f5'], likes: ['pumpkin', 'witch', 'bat', 'zombie', 'kitty'], fx: ['tiger', 'boots', 'mini', 'bow', 'spots', 'fairy', 'afro', 'stripes'], hint: 'black & orange, witch hats, face paint'},
    {id: 'animal', name: 'Animal Friends', emoji: '🐾', cols: ['#b07a43', '#f5c49a', '#ff6fb5', '#9aa0ab'], likes: ['cat', 'bunny', 'fox', 'bear', 'dog', 'kitty'], fx: ['spots', 'tiger', 'bunny', 'pony', 'cargo', 'freckles', 'puffs'], hint: 'animal ears & tails, spots, bunny slippers'},
    {id: 'royal',  name: 'Royal Ball',     emoji: '👸', cols: ['#ff6fb5', '#ffd23f', '#f5f5f5', '#8b5cf6'], likes: ['crown', 'sparkly', 'dress'], fx: ['princess', 'gown', 'tiara', 'pearls', 'heels', 'gloves', 'glam', 'pony', 'goldgown', 'diamond'], hint: 'princess gowns, tiaras, pearls, gloves'},
    {id: 'rock',   name: 'Rock Star',      emoji: '🎸', cols: ['#2b2d42', '#ff4d4d', '#9aa0ab', '#8b5cf6'], likes: ['lightning', 'shades', 'spiky'], fx: ['jacket', 'flare', 'boots', 'mohawk', 'mic', 'sunnies', 'stripes', 'checks'], hint: 'cool jackets, a mohawk, a microphone'},
    {id: 'sea',    name: 'Under the Sea',  emoji: '🧜', cols: ['#2ec4b6', '#3ac6ff', '#8b5cf6', '#f5f5f5'], likes: ['sparkly'], fx: ['mermaid', 'pearls', 'long', 'glitter', 'sparkle', 'swoop', 'dots', 'sailor'], hint: 'mermaid dresses, pearls, ocean blues'},
    {id: 'sporty', name: 'Sporty Day',     emoji: '⚽', cols: ['#2ec27e', '#3a86ff', '#f5f5f5', '#ffd23f'], likes: ['backcap', 'stripes'], fx: ['jersey', 'shorts', 'sneak', 'ball', 'headphones', 'pony', 'tank', 'stripes', 'leggings'], hint: 'jerseys, sneakers, a ball'},
    {id: 'winter', name: 'Snow Day',       emoji: '❄️', cols: ['#f5f5f5', '#3ac6ff', '#c0c7d6', '#3a86ff'], likes: ['toque', 'hoodie'], fx: ['sweater', 'scarf', 'boots', 'gloves', 'cargo', 'headphones', 'sparkle', 'crystal'], hint: 'cozy sweaters, scarves, icy blues'},
    {id: 'fairy',  name: 'Fairy Garden',   emoji: '🧚', cols: ['#7bd389', '#ff6fb5', '#ffd23f', '#c0f0ff'], likes: ['wings', 'flower'], fx: ['fairy', 'flowers', 'tutu', 'wand', 'glitter', 'ruffle', 'braids', 'starwings'], hint: 'fairy wings, flower crowns, wands'},
    {id: 'pjs',    name: 'Pajama Party',   emoji: '🌙', cols: ['#c0c7d6', '#ff6fb5', '#8b5cf6', '#3ac6ff'], likes: ['bunny', 'bear', 'cat'], fx: ['pjs', 'bunny', 'headphones', 'puffs', 'hearts', 'stars', 'dots'], hint: 'comfy PJs, bunny slippers, hearts'},
  ];
  // our own clothing catalog (runway pieces live in the dressing room; shop items can be borrowed too)
  const FX = {
    top: [['tee', '👕', 'Classic Tee'], ['crop', '🎽', 'Crop Top'], ['puff', '👚', 'Puff Sleeves'], ['jacket', '🧥', 'Cool Jacket'], ['sweater', '🧶', 'Cozy Sweater'], ['tux', '🤵', 'Tux'], ['sailor', '⚓', 'Sailor Top'], ['armor', '🛡️', 'Hero Armor'], ['ruffle', '🌸', 'Ruffle Blouse'], ['jersey', '🏅', 'Team Jersey'], ['tank', '💪', 'Tank Top'],
      ['blouse', '🎀', 'Satin Blouse'], ['hoodie', '🧥', 'Pastel Hoodie'], ['cardigan', '🧶', 'Soft Cardigan'], ['corset', '💜', 'Pastel Corset'], ['offsh', '💫', 'Off-Shoulder'], ['wrap', '🧣', 'Wrap Top'], ['polo', '⛳', 'Cute Polo'], ['kimono', '🪷', 'Kimono Wrap'], ['velvet', '💜', 'Velvet Blazer', 0, 1], ['sequin', '✨', 'Sequin Crop', 0, 1], ['silk', '🦢', 'Silk Halter', 0, 1]],
    bot: [['pants', '👖', 'Pants'], ['flare', '🕺', 'Flare Pants'], ['cargo', '🎒', 'Cargo Pants'], ['pleat', '🏫', 'Pleated Skirt'], ['tutu', '🩰', 'Tutu'], ['shorts', '🩳', 'Shorts'], ['leggings', '🧘', 'Print Leggings'],
      ['maxi', '🌙', 'Maxi Skirt'], ['pencil', '✏️', 'Pencil Skirt'], ['denim', '👖', 'Denim Skirt'], ['palazzo', '🌊', 'Palazzo Pants'], ['culotte', '✂️', 'Cute Culottes'], ['bike', '🚴', 'Bike Shorts'], ['ruffleb', '🌸', 'Ruffle Skirt'], ['velvetb', '💜', 'Velvet Skirt', 0, 1], ['silkp', '🦢', 'Silk Pants', 0, 1]],
    dress: [['none', '🚫', 'No dress'], ['gown', '👗', 'Ball Gown'], ['princess', '👸', 'Princess Dress'], ['mini', '💃', 'Party Dress'], ['mermaid', '🧜', 'Mermaid Dress'], ['tiered', '🧁', 'Cupcake Dress'], ['starry', '🌌', 'Starry Gown'], ['pjs', '🌙', 'Comfy PJs'], ['goldgown', '🌟', 'Golden Gown', 3],
      ['slip', '💗', 'Slip Dress'], ['babydoll', '👶', 'Babydoll Dress'], ['jumpsuit', '🤸', 'Cute Jumpsuit'], ['overall', '🎀', 'Overall Dress'], ['sundress', '☀️', 'Sundress'], ['tea', '🍵', 'Tea Party Dress'], ['bubble', '🫧', 'Bubble Dress'], ['peplum', '🌷', 'Peplum Dress'], ['ballerina', '🩰', 'Ballerina Dress'], ['pastelg', '🦄', 'Pastel Gown', 0, 1], ['crystalg', '💎', 'Crystal Gown', 0, 1], ['velvetg', '💜', 'Velvet Gown', 0, 1]],
    shoe: [['none', '🦶', 'No shoes'], ['sneak', '👟', 'Sneakers'], ['boots', '👢', 'Boots'], ['heels', '👠', 'Heels'], ['sparkle', '✨', 'Sparkle Kicks'], ['skates', '🛼', 'Roller Skates'], ['bunny', '🐰', 'Bunny Slippers'], ['rain', '☔', 'Rain Boots'], ['crystal', '💎', 'Crystal Heels', 4],
      ['flats', '🩰', 'Ballet Flats'], ['platforms', '🧱', 'Platforms'], ['sandals', '🩴', 'Glam Sandals'], ['loafers', '👞', 'Cute Loafers'], ['maryj', '🎀', 'Mary Janes'], ['wedges', '📐', 'Wedges'], ['combat', '⚔️', 'Combat Boots'], ['cowgirl', '🤠', 'Cowgirl Boots'], ['glass', '🔮', 'Glass Slippers', 0, 1], ['goldheel', '🌟', 'Gold Heels', 0, 1]],
    hair: [['base', '💇', 'My own hair'], ['long', '🌊', 'Long Waves'], ['bob', '💁', 'Bob'], ['puffs', '☁️', 'Puff Buns'], ['mohawk', '🦔', 'Mohawk'], ['braids', '🎀', 'Twin Braids'], ['pony', '🐴', 'High Pony'], ['afro', '🌳', 'Big Curls'], ['swoop', '🌀', 'Side Swoop'], ['rainbow', '🌈', 'Rainbow Waves', 2],
      ['bangs', '✂️', 'Soft Bangs'], ['spacebuns', '🪐', 'Space Buns'], ['beehive', '🐝', 'Beehive'], ['curtain', '🪟', 'Curtain Layers'], ['pixie', '🧚', 'Pixie Cut'], ['fishtail', '🐟', 'Fishtail Braid'], ['halfup', '🎀', 'Half-Up Heart'], ['wavy', '🌊', 'Beach Waves'], ['pastel', '🦄', 'Pastel Cloud', 0, 1], ['diamondh', '💎', 'Diamond Updo', 0, 1]],
    mk: [['none', '🙂', 'No makeup'], ['blush', '😊', 'Rosy Blush'], ['lips', '💋', 'Lip Gloss'], ['glam', '💄', 'Full Glam'], ['freckles', '🌟', 'Freckles'], ['stars', '⭐', 'Star Stickers'], ['hearts', '💗', 'Heart Cheeks'], ['glitter', '✨', 'Glitter Eyes'], ['tiger', '🐯', 'Face Paint'],
      ['wing', '🦋', 'Winged Liner'], ['soft', '🌸', 'Soft Glow'], ['berry', '🫐', 'Berry Lips'], ['cutcrease', '🌙', 'Cut Crease'], ['pearlmk', '🤍', 'Pearl Dots'], ['rainbowmk', '🌈', 'Rainbow Lids'], ['vipglam', '👑', 'VIP Glam', 0, 1], ['diamondmk', '💠', 'Diamond Liner', 0, 1]],
    acc: [['pearls', '📿', 'Pearl Necklace'], ['bag', '👜', 'Handbag'], ['sunnies', '🕶️', 'Sunnies'], ['earrings', '💎', 'Earrings'], ['bow', '🎀', 'Big Bow'], ['tiara', '👑', 'Tiara'], ['scarf', '🧣', 'Scarf'], ['wand', '🪄', 'Magic Wand'], ['flowers', '🌼', 'Flower Crown'], ['belt', '🔗', 'Belt'], ['gloves', '🧤', 'Gloves'], ['fairy', '🧚', 'Fairy Wings'], ['halo', '😇', 'Halo'], ['mic', '🎤', 'Microphone'], ['ball', '⚽', 'Ball'], ['headphones', '🎧', 'Headphones'], ['diamond', '💠', 'Diamond Tiara', 5], ['starwings', '🌠', 'Star Wings', 6],
      ['choker', '🖤', 'Heart Choker'], ['clutch', '💼', 'Glam Clutch'], ['bangles', '💫', 'Bangles'], ['ribbon', '🎀', 'Hair Ribbon'], ['cape', '🦸', 'Cute Cape'], ['fans', '🪭', 'Hand Fan'], ['parasol', '☂️', 'Parasol'], ['lollipop', '🍭', 'Candy Prop'], ['bunnyears', '🐰', 'Bunny Ears'], ['catEars', '🐱', 'Kitty Ears'], ['vipbadge', '👑', 'VIP Pin', 0, 1], ['vipcape', '💜', 'VIP Cape', 0, 1], ['vipwings', '🦋', 'VIP Butterfly Wings', 0, 1], ['vipcrown', '👑', 'VIP Crown', 0, 1]],
    pat: [['none', '⬜', 'Plain'], ['dots', '⚪', 'Polka Dots'], ['stripes', '〰️', 'Stripes'], ['checks', '🏁', 'Checks'], ['stars', '⭐', 'Stars'], ['hearts', '💗', 'Hearts'], ['flowers', '🌼', 'Flowers'], ['spots', '🐆', 'Spots'], ['sparkle', '✨', 'Sparkles'],
      ['plaid', '🧣', 'Plaid'], ['ombre', '🌅', 'Ombré'], ['lace', '🕸️', 'Lace'], ['hologram', '🌈', 'Hologram', 0, 1]],
  };
  const FS_FXDEF = {top: 'tee', bot: 'pants', dress: 'none', shoe: 'sneak', hair: 'base', mk: 'none', acc: [], pat: 'none', pc: '#ffffff', sc: '#f5f5f5', ac: '#ffd23f', mc: '#ff4d8d'};
  const FS_POSES = [
    {e: '💁', n: 'Hand on Hip', p: t => ({aL: 0, aLo: .55, aR: -.2, aRo: .15, hz: .18, spin: .35, lRo: .12})},
    {e: '🌟', n: 'Superstar',   p: t => ({aLo: 2.5, aRo: 2.5, lLo: .25, lRo: .25, hz: Math.sin(t * 3) * .1})},
    {e: '✌️', n: 'Peace Out',   p: t => ({aR: -2.7, aRo: .25, aLo: .35, hz: -.2, spin: -.25})},
    {e: '🌀', n: 'Twirl',       p: t => ({aLo: 1.4, aRo: 1.4, spin: t * 7})},
    {e: '😘', n: 'Blow a Kiss', p: t => ({aR: -1.5 - Math.max(0, Math.sin(t * 2.5)) * .6, aRo: -.3, aL: .1, aLo: .4, hz: .22, lean: .08})},
    {e: '😎', n: 'Too Cool',    p: t => ({aL: .25, aLo: .25, aR: .25, aRo: .25, lean: -.12, lRo: .35, spin: -.55, hz: -.1})},
    {e: '🎉', n: 'Jump for Joy',p: t => ({y: Math.abs(Math.sin(t * 6)) * .55, aLo: 2.8, aRo: 2.8, lLo: .2, lRo: .2})},
  ];
  const FS_TITLES = [[0, '🌱', 'Fresh Face'], [20, '✨', 'Rising Sparkle'], [50, '👟', 'Street Styler'], [100, '🎀', 'Trend Spotter'], [170, '💎', 'Glam Star'], [260, '👑', 'Runway Royalty'], [380, '🌈', 'Style Legend'], [550, '🦄', 'Fashion Superstar']];
  const FS_RACKS = [['top', '👕', 'Tops'], ['bot', '👖', 'Bottoms'], ['dress', '👗', 'Dresses'], ['shoe', '👟', 'Shoes'], ['hair', '💇', 'Hair Salon'], ['mk', '💄', 'Makeup'], ['acc', '💍', 'Accessories'], ['col', '🎨', 'Colours & Patterns'], ['star', '🌟', 'Star Closet'], ['vip', '👑', 'VIP Lounge'], ['pose', '🕺', 'Pose Booth']];
  // stations in the walk-in dressing room (x, z = where you stand; r = where the prop is)
  const FS_ST = [
    {id: 'top', x: -27.8, z: -6, r: [-29.9, -6]}, {id: 'bot', x: -27.8, z: -2, r: [-29.9, -2]}, {id: 'dress', x: -27.8, z: 2, r: [-29.9, 2]}, {id: 'shoe', x: -27.8, z: 6, r: [-29.9, 6]},
    {id: 'hair', x: -27, z: -8.4, r: [-27, -10.1]}, {id: 'mk', x: -22.3, z: -8.4, r: [-22.3, -10.1]}, {id: 'pose', x: -19.3, z: -8.2, r: [-19.3, -9.6]},
    {id: 'acc', x: -27, z: 8.4, r: [-27, 10.1]}, {id: 'col', x: -21.8, z: 8.4, r: [-21.8, 10.1]}, {id: 'star', x: -24, z: 0, r: [-24, 0]},
    {id: 'vip', x: -27.5, z: 0, r: [-29.5, 0]},   // deep west wall — must NOT sit in the doorway
  ];
  const FS_NPCS = [
    {uid: 'n0', name: 'Sunny', emoji: '☀️', base: {head: '#f1c27d', hairColor: '#ffd23f', hair: 'pigtails', body: 'girl'}},
    {uid: 'n1', name: 'Coco',  emoji: '🥥', base: {head: '#8d5524', hairColor: '#1d1d1d', hair: 'curly'}},
    {uid: 'n2', name: 'Ziggy', emoji: '⚡', base: {head: '#ffdbac', hairColor: '#8b5cf6', hair: 'spiky'}},
  ];
  const FS_JUDGES = [
    {name: 'Grandma Rose', emoji: '👵', av: {head: '#ffdbac', shirt: '#ff6fb5', pants: '#8b5cf6', hair: 'bun', hairColor: '#e8e8e8', face: 'smile'}},
    {name: 'Coach Max',    emoji: '🧢', av: {head: '#c68642', shirt: '#2ec27e', pants: '#1d2340', hair: 'short', hairColor: '#1d1d1d', hat: 'backcap', face: 'grin'}},
    {name: 'Lulu',         emoji: '🎀', av: {head: '#f1c27d', shirt: '#ffd23f', pants: '#ff6fb5', hair: 'ponytail', hairColor: '#d9601f', face: 'wink'}},
    {name: 'Mr. Pebbles',  emoji: '🐧', av: {head: '#e0ac69', shirt: '#2b2d42', pants: '#2b2d42', hair: 'short', hairColor: '#6b3e1f', face: 'shades'}},
  ];
  const FS_COLS = ['#ff4d4d', '#ff9f1c', '#ffd23f', '#2ec27e', '#2ec4b6', '#3ac6ff', '#3a86ff', '#8b5cf6', '#ff6fb5', '#ffb3d9', '#c0f0ff', '#f5f5f5', '#9aa0ab', '#2b2d42', '#1d2340', '#b07a43', '#8a3b12', '#c0c7d6', '#e9b949', '#7bd389'];
  const FS_SKIN = ['#ffdbac', '#f1c27d', '#e0ac69', '#c68642', '#8d5524', '#5c3a1e', '#ffd23f', '#7bd389'];
  let fs = null, FS_MC = {};
  const fsUid = () => mp.on ? mp.me : 'H';
  const fsRand = a => a[Math.floor(Math.random() * a.length)];
  const fsList = slot => FX[slot].map(([v, e, n, lvl, vip]) => ({v, e, n, lvl: lvl || 0, vip: !!vip}));
  const FS_OK = Object.keys(FX).reduce((o, k) => (o[k] = new Set(FX[k].map(r => r[0])), o), {});
  function fsItems(slot){ return ITEMS.filter(it => it.slot === slot && !it.set && it.val != null); }
  function fsName(u){ if (u === fsUid()) return (fsIsVip() ? '👑 ' : '') + 'You'; const N = FS_NPCS.find(n => n.uid === u); if (N) return N.emoji + ' ' + N.name; const L = mpLook(u); return L ? L.name : 'Player'; }
  function fsFrozen(){ return !!fs && (fs.ph === 'intro' || fs.ph === 'walk' || fs.ph === 'podium' || fs.ph === 'end' || fs.ward || fs.lobPanel); }
  function fsCleanFx(o){
    const f = JSON.parse(JSON.stringify(FS_FXDEF)); if (!o || typeof o !== 'object') return f;
    ['top', 'bot', 'dress', 'shoe', 'hair', 'mk', 'pat'].forEach(k => { if (typeof o[k] === 'string' && FS_OK[k].has(o[k])) f[k] = o[k]; });
    ['pc', 'sc', 'ac', 'mc'].forEach(k => { if (typeof o[k] === 'string' && /^#[0-9a-f]{3,8}$/i.test(o[k])) f[k] = o[k]; });
    if (Array.isArray(o.acc)) f.acc = [...new Set(o.acc.filter(v => typeof v === 'string' && FS_OK.acc.has(v)))].slice(0, FS_ACCMAX);
    return f;
  }
  /* --- fashion level (style stars → title) --- */
  const FS_VIP_COST = 250;   // Rublox coins only — never real money
  function fsProg(){ const p = load('rubloxFashion', null), o = Object.assign({xp: 0, shows: 0, wins: 0, best: 0, vip: false}, p && typeof p === 'object' ? p : {});
    o.vip = !!o.vip; o.xp = Math.max(0, o.xp | 0); o.shows = Math.max(0, o.shows | 0); o.wins = Math.max(0, o.wins | 0); o.best = Math.max(0, +o.best || 0); return o; }
  function fsIsVip(){ return !!(fsProg().vip); }
  function fsBuyVip(){
    if (fsIsVip()){ toast('👑 You already have Star VIP!'); return false; }
    if (coins < FS_VIP_COST){ toast('🪙 Need ' + FS_VIP_COST + ' Rublox coins for Star VIP (you have ' + coins + ')'); return false; }
    setCoins(coins - FS_VIP_COST); const p = fsProg(); p.vip = true; save('rubloxFashion', p);
    banner('👑 Welcome to Star VIP Lounge!'); toast('👑 Star VIP unlocked with ' + FS_VIP_COST + ' 🪙 — exclusive clothes + a VIP badge!'); SND.win && SND.win();
    if (fs){ fsPaintVip(); fsBoard(); if (fs.lobPanel) fsPickOpen(); if (fs.ward) fsWardRender(); fsVipBadge(); }
    return true;
  }
  function fsLevel(xp){ let i = 0; FS_TITLES.forEach((T, k) => { if (xp >= T[0]) i = k; }); const T = FS_TITLES[i], N = FS_TITLES[i + 1];
    return {lv: i + 1, e: T[1], n: T[2], at: T[0], next: N ? N[0] : null, pct: N ? Math.min(1, (xp - T[0]) / (N[0] - T[0])) : 1}; }
  function fsLvlHtml(){ const p = fsProg(), L = fsLevel(p.xp);
    return `<div class="fslv"><b>${L.e} Lv ${L.lv} · ${L.n}</b><span class="fsbar"><i style="width:${Math.round(L.pct * 100)}%"></i></span><small>⭐ ${p.xp} style stars${L.next != null ? ' · ' + (L.next - p.xp) + ' to the next title' : ' · MAX!'}</small></div>`; }
  /* --- materials: colours + patterns --- */
  function fsPatDraw(c, pat, col, pc, W){
    c.fillStyle = col; c.fillRect(0, 0, W, W); c.fillStyle = pc; c.strokeStyle = pc; const g = 16;
    if (pat === 'dots') for (let y = 0; y < W; y += g) for (let x = 0; x < W; x += g){ c.beginPath(); c.arc(x + (y / g % 2 ? g / 2 : 0) + 4, y + 8, 4, 0, 6.3); c.fill(); }
    else if (pat === 'stripes') for (let y = 0; y < W; y += g) c.fillRect(0, y, W, 7);
    else if (pat === 'checks') for (let y = 0; y < W; y += g) for (let x = 0; x < W; x += g){ if ((x + y) / g % 2) c.fillRect(x, y, g, g); }
    else if (pat === 'rainbow') ['#ff4d4d', '#ff9f1c', '#ffd23f', '#2ec27e', '#3a86ff', '#8b5cf6'].forEach((q, i) => { c.fillStyle = q; c.fillRect(0, i * W / 6, W, W / 6 + 1); });
    else if (pat === 'spots') for (let y = 0; y < W; y += g) for (let x = 0; x < W; x += g){ const sx = x + (y / g % 2 ? 9 : 4); c.fillStyle = pc; c.beginPath(); c.ellipse(sx, y + 7, 5, 3.5, .5, 0, 6.3); c.fill(); c.fillStyle = shade(col, -50); c.beginPath(); c.ellipse(sx, y + 7, 2, 1.4, .5, 0, 6.3); c.fill(); }
    else if (pat === 'sparkle') for (let i = 0; i < 26; i++){ const x = (i * 37) % W, y = (i * 23 + (i % 3) * 11) % W; c.fillRect(x, y + 1, 3, 1); c.fillRect(x + 1, y, 1, 3); }
    else if (pat === 'flowers') for (let y = 0; y < W; y += g) for (let x = 0; x < W; x += g){ const cx = x + 8, cy = y + 8; c.fillStyle = pc; for (let k = 0; k < 5; k++){ c.beginPath(); c.arc(cx + Math.cos(k * 1.26) * 3, cy + Math.sin(k * 1.26) * 3, 2.2, 0, 6.3); c.fill(); } c.fillStyle = '#ffd23f'; c.fillRect(cx - 1, cy - 1, 2, 2); }
    else if (pat === 'stars' || pat === 'hearts'){ c.font = '12px sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; for (let y = 0; y < W; y += g) for (let x = 0; x < W; x += g) c.fillText(pat === 'stars' ? '★' : '♥', x + (y / g % 2 ? 12 : 4), y + 8); }
    else if (pat === 'plaid'){ for (let y = 0; y < W; y += g) c.fillRect(0, y, W, 3); for (let x = 0; x < W; x += g) c.fillRect(x, 0, 3, W); c.globalAlpha = .4; for (let y = 0; y < W; y += g * 2) c.fillRect(0, y, W, g); c.globalAlpha = 1; }
    else if (pat === 'ombre'){ const og = c.createLinearGradient(0, 0, 0, W); og.addColorStop(0, col); og.addColorStop(1, pc); c.fillStyle = og; c.fillRect(0, 0, W, W); }
    else if (pat === 'lace'){ c.fillStyle = pc; for (let y = 0; y < W; y += 8) for (let x = 0; x < W; x += 8){ c.beginPath(); c.arc(x + 4, y + 4, 2.2, 0, 6.3); c.stroke(); } }
    else if (pat === 'hologram'){ ['#ff4d4d', '#ff9f1c', '#ffd23f', '#2ec27e', '#3a86ff', '#8b5cf6'].forEach((q, i) => { c.fillStyle = q; c.globalAlpha = .55; c.fillRect(i * W / 6, 0, W / 6 + 1, W); }); c.globalAlpha = 1; for (let i = 0; i < 18; i++){ c.fillStyle = '#fff'; c.fillRect((i * 29) % W, (i * 17) % W, 2, 2); } }
  }
  function fsPatMat(pat, col, pc, glow){
    if (!pat || pat === 'none') return mat(col, glow);
    const k = pat + col + pc + (glow || ''); if (FS_MC[k]) return FS_MC[k];
    const t = canvasTex(64, 64, c => fsPatDraw(c, pat, col, pc, 64)); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(1.5, 1.5);
    return FS_MC[k] = new THREE.MeshLambertMaterial({map: t, emissive: glow || '#000000', emissiveIntensity: glow ? .35 : 0});
  }
  function fsBasic(col, op){ const k = 'b' + col + op; return FS_MC[k] || (FS_MC[k] = new THREE.MeshBasicMaterial({color: col, transparent: op < 1, opacity: op, depthWrite: op >= 1, side: THREE.DoubleSide})); }
  /* --- an outfit = base avatar (colours + shop items) + runway pieces (fx) --- */
  function fsBaseAv(av, fx){
    const a = Object.assign({}, DEF, av); if (!fx) return a;
    if (fx.dress !== 'none') a.pantsPat = null;
    else if (fx.bot === 'shorts' || fx.bot === 'tutu') a.pantsPat = 'shorts';
    else if (fx.bot === 'pleat') a.pantsPat = 'skirt';
    else if (fx.bot !== 'pants' && ['skirt', 'shorts', 'dress'].includes(a.pantsPat)) a.pantsPat = null;
    if (fx.hair !== 'base'){ a.hair = null; if (a.hat === 'pumpkin') a.hat = 'none'; }
    if (fx.top !== 'tee' || fx.dress !== 'none') a.shirtPat = null;
    return a;
  }
  function fsBuild(av, fx){ const a = fsBaseAv(av, fx), M = buildPlayer(a); if (fx) fsDecorate(M, a, fsCleanFx(fx)); return M; }
  function fsDecorate(M, av, fx){
    const G = av.body === 'girl', TW = G ? .82 : .96, TD = G ? .44 : .5, LW = G ? .38 : .44, AW = G ? .34 : .4;
    const body = M.pivot.children[0], head = M.head, legs = M.legs, arms = M.arms;
    const add = (par, geo, m, x, y, z) => { const o = new THREE.Mesh(geo, typeof m === 'string' ? mat(m) : m); o.position.set(x, y, z); par.add(o); return o; };
    const box = (par, w, h, d, m, x, y, z) => add(par, new THREE.BoxGeometry(w, h, d), m, x, y, z);
    const cyl = (par, rt, rb, h, seg, m, x, y, z) => add(par, new THREE.CylinderGeometry(rt, rb, h, seg), m, x, y, z);
    const ball = (par, r, m, x, y, z) => add(par, new THREE.SphereGeometry(r, 10, 8), m, x, y, z);
    const torus = (par, r, t, m, x, y, z, arc) => add(par, new THREE.TorusGeometry(r, t, 6, 18, arc || Math.PI * 2), m, x, y, z);
    const Pm = fsPatMat(fx.pat, av.shirt, fx.pc), Hm = mat(av.hairColor || '#6b3e1f'), Sm = mat(fx.sc), Am = mat(fx.ac), skin = mat(av.head);
    const torsoOv = (m, h = 1.0, y = 1.5, ex = .03) => box(body, TW + ex, h, TD + ex, m, 0, y, 0);
    const sleeves = (m, len = .8, ex = .03) => arms.forEach(a => box(a, AW + ex, len, AW + ex, m, 0, .03 - len / 2, 0));
    const skinLegs = () => legs.forEach(l => box(l, LW + .01, .7, LW + .01, skin, 0, -.55, 0));
    const D = fx.dress, top = fx.top;
    // tops
    if (top === 'tee'){ if (fx.pat !== 'none' && D === 'none'){ torsoOv(Pm); sleeves(Pm, .45); } }
    else if (top === 'crop'){ torsoOv(Pm, .55, 1.73); if (D === 'none') box(body, TW + .015, .44, TD + .015, skin, 0, 1.23, 0); sleeves(Pm, .32); }
    else if (top === 'puff'){ torsoOv(Pm); arms.forEach(a => ball(a, .3, Pm, 0, -.1, 0).scale.set(1, .85, 1)); }
    else if (top === 'jacket'){ const J = mat(shade(av.shirt, -45)); torsoOv(mat('#f5f5f5'), 1, 1.5, .02);
      [-1, 1].forEach(s => { box(body, TW * .34, 1.0, .07, J, s * (TW / 2 - TW * .17 + .02), 1.5, TD / 2 + .04); box(body, .12, .38, .04, mat(shade(av.shirt, -70)), s * TW * .2, 1.82, TD / 2 + .08).rotation.z = s * .5; });
      box(body, TW + .05, 1.0, .06, J, 0, 1.5, -TD / 2 - .03); [-1, 1].forEach(s => box(body, .06, 1.0, TD + .06, J, s * (TW / 2 + .03), 1.5, 0)); sleeves(J, .84, .05); }
    else if (top === 'sweater'){ torsoOv(Pm, 1.06, 1.49, .1); torus(body, .3, .1, Pm, 0, 2.0, 0).rotation.x = Math.PI / 2; sleeves(Pm, .86, .08); arms.forEach(a => box(a, AW + .1, .12, AW + .1, mat(shade(av.shirt, -25)), 0, -.78, 0)); }
    else if (top === 'tux'){ torsoOv(Pm, 1.0, 1.5, .04); box(body, TW * .3, .9, .02, '#ffffff', 0, 1.55, TD / 2 + .035); box(body, .3, .1, .05, '#1d1d1d', 0, 1.9, TD / 2 + .06); [1.62, 1.42].forEach(y => ball(body, .035, '#1d1d1d', 0, y, TD / 2 + .05)); sleeves(Pm, .84); arms.forEach(a => box(a, AW + .05, .1, AW + .05, '#ffffff', 0, -.79, 0)); }
    else if (top === 'sailor'){ torsoOv(Pm); box(body, TW * .86, .42, .04, '#1d2340', 0, 1.78, -TD / 2 - .04); [-1, 1].forEach(s => { box(body, .14, .5, .04, '#1d2340', s * .17, 1.8, TD / 2 + .04).rotation.z = s * .55; }); box(body, .2, .14, .06, '#ff4d4d', 0, 1.6, TD / 2 + .06); sleeves(Pm, .4); }
    else if (top === 'armor'){ torsoOv(Pm); box(body, TW + .12, .64, TD + .12, mat('#c0c7d6', '#222833'), 0, 1.62, 0); box(body, .26, .26, .04, mat(fx.ac, '#553300'), 0, 1.66, TD / 2 + .09).rotation.z = Math.PI / 4; arms.forEach(a => box(a, AW + .16, .24, AW + .16, mat('#c0c7d6'), 0, -.02, 0)); }
    else if (top === 'ruffle'){ torsoOv(Pm); for (let i = 0; i < 3; i++) box(body, TW * .72 - i * .1, .1, .08, mat(shade(av.shirt, 40)), 0, 1.86 - i * .2, TD / 2 + .05); sleeves(Pm, .6); arms.forEach(a => box(a, AW + .1, .1, AW + .1, mat(shade(av.shirt, 40)), 0, -.55, 0)); }
    else if (top === 'jersey'){ const k = 'jer' + av.shirt + fx.pc;
      const F = FS_MC[k] || (FS_MC[k] = new THREE.MeshLambertMaterial({map: canvasTex(64, 64, c => { c.fillStyle = av.shirt; c.fillRect(0, 0, 64, 64); c.fillStyle = fx.pc; c.fillRect(0, 0, 64, 8); c.font = '900 34px Nunito, sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('7', 32, 38); })}));
      const Pl = mat(av.shirt); box(body, TW + .03, 1.0, TD + .03, [Pl, Pl, Pl, Pl, F, Pl], 0, 1.5, 0); sleeves(Pl, .36); arms.forEach(a => box(a, AW + .06, .08, AW + .06, mat(fx.pc), 0, -.3, 0)); }
    else if (top === 'tank'){ torsoOv(Pm); arms.forEach(a => box(a, AW + .02, .84, AW + .02, skin, 0, -.4, 0)); }
    else if (top === 'blouse' || top === 'offsh' || top === 'silk'){ torsoOv(Pm); sleeves(Pm, .55); [-1, 1].forEach(s => box(body, .22, .08, .4, Pm, s * TW * .42, 1.95, 0)); }
    else if (top === 'hoodie' || top === 'cardigan' || top === 'wrap' || top === 'kimono'){ torsoOv(Pm, 1.05, 1.48, .08); sleeves(Pm, .88, .06); }
    else if (top === 'corset' || top === 'velvet' || top === 'sequin'){ torsoOv(top === 'sequin' ? fsPatMat('sparkle', av.shirt, '#ffffff', '#553300') : Pm, .7, 1.55, .05); if (D === 'none') box(body, TW + .01, .35, TD + .01, skin, 0, 1.15, 0); }
    else if (top === 'polo'){ torsoOv(Pm); box(body, TW * .25, .12, .04, '#ffffff', 0, 1.92, TD / 2 + .04); sleeves(Pm, .4); }
    else if (top !== 'tee'){ torsoOv(Pm); sleeves(Pm, .5); }   // any future top
    // bottoms (a dress replaces them)
    if (D === 'none'){
      const b = fx.bot;
      if (b === 'flare') legs.forEach(l => cyl(l, LW * .55, LW * .98, .44, 10, av.pants, 0, -.79, 0));
      else if (b === 'cargo') legs.forEach((l, i) => { box(l, .08, .24, .24, mat(shade(av.pants, -35)), (i ? 1 : -1) * (LW / 2 + .03), -.45, 0); box(l, LW + .02, .06, LW + .02, mat(shade(av.pants, -35)), 0, -.18, 0); });
      else if (b === 'pleat') cyl(body, .8, .81, .06, 14, '#ffffff', 0, .45, 0);
      else if (b === 'tutu'){ const T = new THREE.MeshLambertMaterial({color: av.pants, transparent: true, opacity: .82}); cyl(body, .72, .98, .14, 18, T, 0, .96, 0); cyl(body, .62, .86, .14, 18, T, 0, .84, 0); }
      else if (b === 'leggings') legs.forEach(l => box(l, LW + .02, .98, LW + .02, fsPatMat(fx.pat === 'none' ? 'stripes' : fx.pat, av.pants, fx.pc), 0, -.5, 0));
      else if (b === 'maxi' || b === 'velvetb'){ cyl(body, .5, .95, 1.05, 16, av.pants, 0, .5, 0); }
      else if (b === 'pencil' || b === 'denim' || b === 'ruffleb'){ cyl(body, .48, .7, .55, 14, av.pants, 0, .75, 0); skinLegs(); }
      else if (b === 'palazzo' || b === 'culotte' || b === 'silkp'){ legs.forEach(l => cyl(l, LW * .55, LW * 1.05, .5, 10, av.pants, 0, -.76, 0)); }
      else if (b === 'bike'){ legs.forEach(l => box(l, LW + .04, .42, LW + .04, av.pants, 0, -.22, 0)); skinLegs(); }
      else if (b !== 'pants' && b !== 'shorts'){ cyl(body, .5, .78, .6, 14, av.pants, 0, .72, 0); skinLegs(); }
    } else {
      const Dm = D === 'starry' ? fsPatMat('stars', '#1d2340', '#ffd23f', '#1d2340') : D === 'goldgown' || D === 'crystalg' ? fsPatMat('sparkle', D === 'crystalg' ? '#9ff3ff' : '#ffd23f', '#ffffff', '#7a5a00') : D === 'pastelg' ? fsPatMat('hearts', '#ffb3d9', '#ffffff') : D === 'velvetg' ? mat('#5b34c0') : Pm;
      if (top === 'tee') torsoOv(D === 'pjs' ? Pm : Dm);
      if (D === 'gown' || D === 'starry' || D === 'goldgown' || D === 'princess' || D === 'pastelg' || D === 'crystalg' || D === 'velvetg' || D === 'tea' || D === 'ballerina'){ const R = D === 'princess' || D === 'pastelg' ? 1.35 : 1.22; cyl(body, .47, R, 1.06, 20, Dm, 0, .53, 0);
        torus(body, R - .02, .06, mat(shade(D === 'starry' ? '#1d2340' : D === 'goldgown' ? '#ffd23f' : av.shirt, 40)), 0, .04, 0).rotation.x = Math.PI / 2;
        if (D === 'princess'){ arms.forEach(a => ball(a, .3, Dm, 0, -.1, 0).scale.set(1, .85, 1)); box(body, .5, .24, .1, Am, 0, 1.06, -TD / 2 - .06); } }
      else if (D === 'mini' || D === 'slip' || D === 'babydoll' || D === 'sundress' || D === 'bubble' || D === 'peplum'){ cyl(body, .47, D === 'bubble' ? .95 : .8, D === 'slip' ? .7 : .56, 14, Dm, 0, .78, 0); skinLegs(); }
      else if (D === 'jumpsuit' || D === 'overall'){ torsoOv(Dm); legs.forEach(l => box(l, LW + .04, .98, LW + .04, Dm, 0, -.5, 0)); }
      else if (D === 'mermaid'){ cyl(body, .47, .36, .76, 14, Dm, 0, .68, 0); cyl(body, .36, .86, .34, 14, mat(shade(av.shirt, 35), '#113344'), 0, .17, 0); }
      else if (D === 'tiered'){ [[.56, .9], [.71, .67], [.87, .44]].forEach(([r, y], i) => cyl(body, r - .1, r, .24, 16, i % 2 ? mat(shade(av.shirt, 45)) : Dm, 0, y, 0)); skinLegs(); }
      else if (D === 'pjs'){ torsoOv(Pm, 1.0, 1.5, .06); sleeves(Pm, .84, .06); legs.forEach(l => box(l, LW + .05, .98, LW + .05, Pm, 0, -.5, 0)); }
    }
    // shoes
    const sh = fx.shoe;
    legs.forEach(l => {
      if (sh === 'sneak' || sh === 'sparkle'){ box(l, LW + .06, .16, LW + .2, sh === 'sparkle' ? fsPatMat('sparkle', fx.sc, '#ffffff', '#333333') : Sm, 0, -.92, .05); box(l, LW + .08, .05, LW + .22, '#ffffff', 0, -.995, .05); }
      else if (sh === 'boots' || sh === 'rain'){ const m = sh === 'rain' ? mat(fx.sc, '#222222') : Sm; box(l, LW + .07, sh === 'rain' ? .52 : .46, LW + .08, m, 0, sh === 'rain' ? -.75 : -.78, 0); box(l, LW + .07, .14, .14, m, 0, -.94, LW / 2 + .08); }
      else if (sh === 'heels' || sh === 'crystal'){ const m = sh === 'crystal' ? fsBasic('#9ff3ff', .75) : Sm; box(l, LW + .03, .12, LW + .14, m, 0, -.95, .05); box(l, .08, .16, .08, m, 0, -.93, -LW / 2 + .02); box(l, LW + .05, .05, .05, m, 0, -.82, .05); }
      else if (sh === 'skates'){ box(l, LW + .06, .32, LW + .14, Sm, 0, -.85, .02); [-.13, .13].forEach(z => { cyl(l, .07, .07, .1, 10, '#ff6fb5', 0, -1.02, z).rotation.z = Math.PI / 2; }); }
      else if (sh === 'bunny'){ box(l, LW + .14, .2, LW + .3, '#ffffff', 0, -.92, .07); [-1, 1].forEach(s => { box(l, .07, .2, .04, '#ffffff', s * .09, -.74, .2); box(l, .035, .13, .045, '#ffb3d9', s * .09, -.74, .21); }); }
      else if (sh === 'flats' || sh === 'loafers' || sh === 'maryj'){ box(l, LW + .05, .12, LW + .16, Sm, 0, -.95, .04); }
      else if (sh === 'platforms' || sh === 'wedges'){ box(l, LW + .08, .22, LW + .18, Sm, 0, -.9, .05); }
      else if (sh === 'sandals'){ box(l, LW + .04, .06, LW + .16, Sm, 0, -.97, .05); box(l, .04, .12, .04, Sm, 0, -.9, -.08); }
      else if (sh === 'combat' || sh === 'cowgirl'){ box(l, LW + .08, .5, LW + .1, Sm, 0, -.76, 0); box(l, LW + .1, .08, LW + .2, mat(shade(fx.sc, -30)), 0, -.98, .04); }
      else if (sh === 'glass' || sh === 'goldheel'){ const m = sh === 'glass' ? fsBasic('#9ff3ff', .65) : mat('#ffd23f', '#7a5a00'); box(l, LW + .03, .12, LW + .14, m, 0, -.95, .05); box(l, .08, .18, .08, m, 0, -.9, -LW / 2); }
    });
    // hair styles (the salon)
    const hs2 = fx.hair, HmR = hs2 === 'rainbow' ? fsPatMat('rainbow', '#fff', '#fff') : Hm;
    if (hs2 !== 'base'){
      const cap = () => box(head, .86, .2, .86, HmR, 0, .88, -.01);
      if (hs2 === 'long' || hs2 === 'rainbow'){ cap(); box(head, .88, 1.08, .14, HmR, 0, .3, -.46); [-1, 1].forEach(s => box(head, .1, .82, .56, HmR, s * .45, .42, -.16)); }
      else if (hs2 === 'bob'){ cap(); box(head, .9, .56, .14, Hm, 0, .55, -.46); [-1, 1].forEach(s => box(head, .12, .5, .76, Hm, s * .46, .56, -.05)); }
      else if (hs2 === 'puffs'){ cap(); [-1, 1].forEach(s => ball(head, .27, Hm, s * .38, .94, -.05)); }
      else if (hs2 === 'mohawk'){ for (let i = -2; i <= 2; i++){ const h = .26 + .1 * (2 - Math.abs(i)); box(head, .14, h, .16, Hm, 0, .8 + h / 2, i * .17); } }
      else if (hs2 === 'braids'){ cap(); [-1, 1].forEach(s => { for (let k = 0; k < 4; k++) ball(head, .1, Hm, s * .43, .45 - k * .2, -.16); box(head, .14, .08, .08, Am, s * .43, -.38, -.16); }); }
      else if (hs2 === 'pony'){ cap(); ball(head, .18, Hm, 0, .86, -.42); cyl(head, .13, .06, .8, 8, Hm, 0, .42, -.6).rotation.x = .25; box(head, .3, .08, .1, Am, 0, .86, -.36); }
      else if (hs2 === 'afro') ball(head, .62, Hm, 0, .78, -.16).scale.set(1, .88, .8);
      else if (hs2 === 'swoop'){ cap(); box(head, .56, .16, .32, Hm, .15, .86, .32).rotation.z = -.25; box(head, .1, .5, .55, Hm, -.45, .56, -.1); box(head, .1, .3, .55, Hm, .45, .66, -.1); }
      else if (hs2 === 'spacebuns'){ cap(); [-1, 1].forEach(s => ball(head, .24, Hm, s * .36, .98, -.02)); }
      else if (hs2 === 'bangs' || hs2 === 'curtain' || hs2 === 'wavy' || hs2 === 'halfup'){ cap(); box(head, .7, .14, .2, Hm, 0, .82, .38); [-1, 1].forEach(s => box(head, .12, .7, .5, Hm, s * .44, .45, -.1)); }
      else if (hs2 === 'beehive' || hs2 === 'diamondh' || hs2 === 'pastel'){ ball(head, hs2 === 'beehive' ? .45 : .5, hs2 === 'pastel' ? fsPatMat('hearts', av.hairColor || '#ffb3d9', '#fff') : HmR, 0, 1.05, -.1); cap(); }
      else if (hs2 === 'pixie'){ cap(); box(head, .7, .2, .5, Hm, 0, .85, .1); }
      else if (hs2 === 'fishtail'){ cap(); cyl(head, .1, .06, .9, 8, Hm, .2, .3, -.55).rotation.x = .4; }
      else { cap(); [-1, 1].forEach(s => box(head, .1, .6, .5, Hm, s * .44, .48, -.12)); }
    }
    // makeup (on the face)
    const fp = (w, h, col, x, y, op = .85, rz = 0) => { const o = add(head, new THREE.PlaneGeometry(w, h), fsBasic(col, op), x, y, .403); o.rotation.z = rz; return o; };
    const EY = .47, EX = .17, CY = .3, CX = .27, MY = .2, mk = fx.mk;
    if (mk === 'blush' || mk === 'glam') [-1, 1].forEach(s => fp(.15, .08, '#ff7aa8', s * CX, CY, .7));
    if (mk === 'lips' || mk === 'glam') fp(.17, .045, fx.mc, 0, MY, .95);
    if (mk === 'glam') [-1, 1].forEach(s => fp(.17, .05, '#b06cff', s * EX, EY + .1, .75));
    if (mk === 'freckles') [-1, 1].forEach(s => [[0, 0], [.06, .04], [.08, -.03], [-.04, .03]].forEach(([dx, dy]) => fp(.03, .03, '#8a4b22', s * (CX + dx), CY + dy, .9)));
    if (mk === 'stars') [-1, 1].forEach(s => { fp(.09, .09, '#ffd23f', s * CX, CY, 1, Math.PI / 4); fp(.09, .09, '#ffd23f', s * CX, CY, 1); });
    if (mk === 'hearts') [-1, 1].forEach(s => { fp(.08, .08, '#ff4d8d', s * CX, CY, 1, Math.PI / 4); [-.025, .025].forEach(d => ball(head, .035, fsBasic('#ff4d8d', 1), s * CX + d, CY + .03, .4)); });
    if (mk === 'glitter') for (let i = 0; i < 12; i++){ const s = i % 2 ? 1 : -1, k = i >> 1; fp(.03, .03, ['#ffffff', '#ffd23f', '#9ff3ff'][k % 3], s * (EX + Math.cos(k * 1.1) * .1), EY + .09 + Math.sin(k * 1.7) * .04, 1); }
    if (mk === 'tiger') [-1, 1].forEach(s => { [[.3, .32, .4], [.32, .24, .3]].forEach(([x, y, r]) => fp(.16, .035, fx.mc === '#ff4d8d' ? '#ff9f1c' : fx.mc, s * x, y, .95, s * r)); fp(.05, .14, '#1d1d1d', s * .07, .7, .8, s * .3); });
    if (mk === 'wing' || mk === 'cutcrease' || mk === 'vipglam' || mk === 'diamondmk') [-1, 1].forEach(s => fp(.2, .04, mk === 'diamondmk' ? '#9ff3ff' : '#1d1d1d', s * EX, EY + .08, .9, s * -.3));
    if (mk === 'soft' || mk === 'vipglam') [-1, 1].forEach(s => fp(.15, .08, '#ffb3d9', s * CX, CY, .55));
    if (mk === 'berry') fp(.17, .05, '#8b1a4a', 0, MY, .95);
    if (mk === 'pearlmk') [-1, 1].forEach(s => { ball(head, .03, '#fff', s * CX, CY, .41); });
    if (mk === 'rainbowmk') [-1, 1].forEach(s => ['#ff4d4d','#ffd23f','#2ec27e','#3a86ff'].forEach((c, k) => fp(.16, .025, c, s * EX, EY + .12 - k * .03, .85)));
    // accessories (up to 4)
    fx.acc.forEach(a => {
      if (a === 'pearls') torus(body, .3, .05, '#fffaf0', 0, 2.0, .02).rotation.x = Math.PI / 2 - .25;
      else if (a === 'bag'){ box(arms[1], .32, .28, .14, Am, .2, -1.02, 0); torus(arms[1], .1, .025, Am, .2, -.86, 0, Math.PI); }
      else if (a === 'sunnies'){ [-1, 1].forEach(s => box(head, .26, .13, .04, '#1d1d1d', s * EX, EY, .43)); box(head, .12, .03, .03, '#1d1d1d', 0, EY + .03, .43); [-1, 1].forEach(s => box(head, .03, .03, .42, '#1d1d1d', s * .42, EY + .03, .23)); }
      else if (a === 'earrings') [-1, 1].forEach(s => ball(head, .06, mat(fx.ac, '#443300'), s * .43, .17, .06));
      else if (a === 'bow'){ [-1, 1].forEach(s => { box(head, .28, .22, .08, Am, s * .17, .92, -.28).rotation.z = s * .35; }); box(head, .1, .1, .1, mat(shade(fx.ac, -30)), 0, .92, -.28); }
      else if (a === 'tiara' || a === 'diamond'){ const dm = a === 'diamond', Ti = mat(dm ? '#e8f8ff' : '#e8e8ff', dm ? '#336677' : '#333344'); box(head, .72, .06, .06, Ti, 0, .85, .26);
        [-.24, 0, .24].forEach((x, i) => { add(head, new THREE.ConeGeometry(i === 1 ? .09 : .06, i === 1 ? (dm ? .32 : .22) : .15, 4), Ti, x, .95 + (i === 1 ? .05 : 0), .26); ball(head, dm ? .06 : .04, fsBasic(dm ? '#5ff0ff' : i === 1 ? '#ff4d8d' : '#3ac6ff', 1), x, .88, .3); }); }
      else if (a === 'scarf'){ torus(body, .32, .11, Am, 0, 1.98, 0).rotation.x = Math.PI / 2; box(body, .16, .55, .07, Am, .2, 1.62, TD / 2 + .08); }
      else if (a === 'wand'){ cyl(arms[0], .025, .025, .6, 6, '#ffffff', 0, -.95, .3).rotation.x = Math.PI / 2; box(arms[0], .18, .18, .04, mat('#ffd23f', '#886600'), 0, -.95, .64).rotation.z = Math.PI / 4; }
      else if (a === 'flowers') for (let i = 0; i < 8; i++){ const an = i / 8 * Math.PI * 2; ball(head, .085, [fx.ac, '#ff6fb5', '#ffffff', '#ffd23f'][i % 4], Math.sin(an) * .44, .84, Math.cos(an) * .44); }
      else if (a === 'belt'){ box(body, TW + .07, .1, TD + .07, '#5a3a1a', 0, 1.06, 0); box(body, .15, .13, .03, mat('#ffd23f', '#553300'), 0, 1.06, TD / 2 + .05); }
      else if (a === 'gloves') arms.forEach(r => box(r, AW + .04, .34, AW + .04, Am, 0, -.88, 0));
      else if (a === 'fairy') [[.4, 1.75, .8, .95, .5], [.3, 1.25, .55, .6, .8]].forEach(([x, y, w, h, r]) => [-1, 1].forEach(s => { const p = add(body, new THREE.PlaneGeometry(w, h), fsBasic(fx.ac === '#ffd23f' ? '#bff7ff' : fx.ac, .55), s * x, y, -TD / 2 - .1); p.rotation.y = s * .5; p.rotation.z = s * r * .4; }));
      else if (a === 'halo') torus(head, .3, .04, mat('#ffd23f', '#aa8800'), 0, 1.12, 0).rotation.x = Math.PI / 2;
      else if (a === 'mic'){ cyl(arms[1], .04, .03, .32, 8, '#2b2d42', 0, -1.0, .12).rotation.x = .9; ball(arms[1], .075, '#9aa0ab', 0, -.9, .26); }
      else if (a === 'ball') ball(arms[0], .22, fsPatMat('checks', '#ffffff', '#1d1d1d'), 0, -1.0, .24);
      else if (a === 'headphones'){ torus(head, .46, .05, '#2b2d42', 0, .42, 0, Math.PI); [-1, 1].forEach(s => { cyl(head, .15, .15, .1, 12, Am, s * .45, .42, 0).rotation.z = Math.PI / 2; }); }
      else if (a === 'starwings' || a === 'vipwings'){ const sh2 = new THREE.Shape(); for (let i = 0; i < 10; i++){ const r = i % 2 ? .22 : .55, an = i / 10 * Math.PI * 2; if (i) sh2.lineTo(Math.sin(an) * r, Math.cos(an) * r); else sh2.moveTo(Math.sin(an) * r, Math.cos(an) * r); }
        [-1, 1].forEach(s => { add(body, new THREE.ShapeGeometry(sh2), fsBasic(a === 'vipwings' ? '#c4b0ff' : '#ffd23f', 1), s * .5, 1.75, -TD / 2 - .12).rotation.y = s * .45; }); }
      else if (a === 'choker') torus(body, .28, .04, '#ff4d8d', 0, 2.02, .02).rotation.x = Math.PI / 2 - .2;
      else if (a === 'clutch') box(arms[1], .28, .18, .08, Am, .18, -1.0, 0);
      else if (a === 'bangles') arms.forEach(r => { torus(r, AW + .02, .03, Am, 0, -.55, 0).rotation.x = Math.PI / 2; });
      else if (a === 'ribbon') box(head, .35, .12, .08, Am, .2, .95, -.2);
      else if (a === 'cape' || a === 'vipcape'){ const cm = a === 'vipcape' ? mat('#5b34c0', '#221144') : Am; box(body, TW + .2, 1.2, .05, cm, 0, 1.4, -TD / 2 - .08); }
      else if (a === 'fans' || a === 'parasol'){ cyl(arms[0], .02, .02, .5, 6, '#ffffff', 0, -.9, .25).rotation.x = 1; add(arms[0], new THREE.CircleGeometry(.35, 12), fsBasic(fx.ac, .9), 0, -.7, .55); }
      else if (a === 'lollipop'){ cyl(arms[1], .02, .02, .35, 6, '#ffffff', 0, -.95, .2).rotation.x = .8; ball(arms[1], .1, '#ff6fb5', 0, -.8, .4); }
      else if (a === 'bunnyears' || a === 'catEars'){ [-1, 1].forEach(s => { box(head, .12, .32, .08, a === 'catEars' ? '#ffb3d9' : '#ffffff', s * .22, 1.05, -.1).rotation.z = s * .2; }); }
      else if (a === 'vipbadge'){ box(body, .18, .18, .04, mat('#ffd23f', '#886600'), TW * .35, 1.7, TD / 2 + .06); box(body, .1, .08, .05, '#5b34c0', TW * .35, 1.7, TD / 2 + .08); }
      else if (a === 'vipcrown'){ const Ti = mat('#ffd23f', '#886600'); box(head, .72, .06, .06, Ti, 0, .88, .2); [-.24, 0, .24].forEach((x, i) => add(head, new THREE.ConeGeometry(i === 1 ? .1 : .07, .28, 5), Ti, x, 1.02, .2)); }
    });
    return M;
  }
  /* --- the venue: runway + walk-in dressing room + lobby --- */
  function fsDeco(w, h, d, col, x, y, z, o){ const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), o || mat(col)); m.position.set(x, y, z); scene.add(m); return m; }
  function fsTex(text, w, h, bg, fg, size){ return canvasTex(w, h, c => { c.fillStyle = bg; c.fillRect(0, 0, w, h); c.fillStyle = fg; c.font = '900 ' + size + 'px Nunito, sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(text, w / 2, h / 2 + 2); }); }
  function fsSign(text, x, y, z, ry, w = 3.2, bg = '#ff6fb5'){ const s = new THREE.Mesh(new THREE.PlaneGeometry(w, w * .22), new THREE.MeshBasicMaterial({map: fsTex(text, 512, 112, bg, '#ffffff', 50), side: THREE.DoubleSide})); s.position.set(x, y, z); s.rotation.y = ry; scene.add(s); return s; }
  function buildFashion(){
    scene.background = new THREE.Color('#f3d4ff'); FS_MC = {};
    const dl = load('rubloxFsTime', 180);
    fs = {ph: 'lobby', n: 0, t: 0, wt: 0, th: 0, dl: FS_TIMES.includes(dl) ? dl : 180, ord: [], fits: {}, fxs: {}, gfits: {}, gfx: {}, rates: {}, poses: {}, ready: new Set(), res: [], pod: [], walkers: [], judges: [], npcM: {}, npcFit: {}, spots: [], earned: 0, lastTh: -1, remote: false, fit: null, fx: null, myPose: 0, rated: {}, near: null, done: {}, lobPanel: false, tab: 'top', introT: 0};
    plat(0, 0, 0, 90, 90, '#f3c6dd', 2);
    // the runway
    plat(0, .9, -3, 4.4, 22, '#ffffff', .9);
    plat(0, .45, 8.6, 4.4, 1.2, '#ffd23f', .45);
    [-2.25, 2.25].forEach(x => fsDeco(.18, .14, 22, '#ff6fb5', x, .92, -3, new THREE.MeshBasicMaterial({color: '#ff6fb5'})));
    for (let z = -13; z <= 7; z += 2.2) [-2.25, 2.25].forEach(x => fs.spots.push(fsDeco(.26, .26, .26, '#fff', x, 1.08, z, new THREE.MeshBasicMaterial({color: '#fff6b0'}))));
    // audience seating rows (pastel chairs) beside the runway
    [-1, 1].forEach(s => { for (let r = 0; r < 4; r++) for (let k = 0; k < 5; k++){
      const x = s * (4.8 + r * 1.15), z = -10 + k * 3.2, col = (r + k) % 2 ? '#ffb3d9' : '#c4b0ff';
      fsDeco(.7, .45, .7, col, x, .35, z); fsDeco(.7, .7, .12, shade(col, -25), x, .7, z + .28); } });
    plat(0, 9, -15, 26, 1, '#8b5cf6', 9);
    const sign = new THREE.Mesh(new THREE.PlaneGeometry(14, 2.6), new THREE.MeshBasicMaterial({map: fsTex('✨ RUBLOX RUNWAY ✨', 512, 96, '#ff6fb5', '#ffffff', 52)}));
    sign.position.set(0, 7, -14.45); scene.add(sign);
    [-1, 1].forEach(s => { for (let k = 0; k < 5; k++) fsDeco(.9, 6, .3, '#d62d50', s * (2.6 + k * .85), 3, -14.3, mat(k % 2 ? '#e63e62' : '#c81e45')); });
    fsDeco(5.6, .8, .3, '#c81e45', 0, 5.6, -14.3);
    fsDeco(18, .3, .3, '#555', 0, 11, -3); fsDeco(.3, 11, .3, '#555', -9, 5.5, -3); fsDeco(.3, 11, .3, '#555', 9, 5.5, -3);
    fs.cones = ['#ff6fb5', '#3ac6ff', '#ffd23f', '#8b5cf6'].map((c, i) => {
      const g = new THREE.Group(); g.position.set(-6 + i * 4, 11, -3);
      const cone = new THREE.Mesh(new THREE.ConeGeometry(1.8, 10, 18, 1, true), new THREE.MeshBasicMaterial({color: c, transparent: true, opacity: .16, depthWrite: false, side: THREE.DoubleSide}));
      cone.position.y = -5; g.add(cone); scene.add(g); g.userData.ph = i * 1.3; return g; });
    [-1, 1].forEach(s => { for (let r = 0; r < 3; r++) plat(s * (5 + r * 2), .5 + r * .5, -3, 1.6, 16, r % 2 ? '#3a86ff' : '#ff6fb5', .5 + r * .5); });
    plat(0, .6, 15.5, 16, 2.4, '#3a86ff', .6);
    plat(0, .95, 11.4, 9, 1, '#ffffff', .95); fsDeco(9.1, .2, 1.1, '#ffd23f', 0, 1.0, 11.4);
    const jt = new THREE.Mesh(new THREE.PlaneGeometry(4, .6), new THREE.MeshBasicMaterial({map: fsTex('⭐ JUDGES ⭐', 256, 40, '#ff6fb5', '#fff', 26)})); jt.position.set(0, .55, 11.92); scene.add(jt);
    fsRoom(); fsLobby();
    checkpoints[0] = {idx: 0, spawn: {x: 0, y: .05, z: 23}, flag: new THREE.Object3D()};
  }
  function fsPaintVip(){ if (!fs) return; if (fs.vipGlow) fs.vipGlow.visible = fsIsVip(); if (fs.vipLock) fs.vipLock.visible = !fsIsVip(); fsVipBadge(); }
  // floating gold VIP nametag above YOUR avatar (dressing room + runway)
  function fsVipBadge(){
    if (!fs || !model || !model.g) return;
    if (fs.vipTag){ try { model.g.remove(fs.vipTag); } catch (e){} fs.vipTag = null; }
    if (!fsIsVip()) return;
    const lab = label('👑 VIP', 'rgba(232,168,0,.96)', '#1d2340', 160);
    lab.position.set(0, 4.15, 0); lab.scale.set(.55, .55, .55); model.g.add(lab); fs.vipTag = lab;
  }
  function fsRoom(){
    const X = -24, W = '#fff0f8', H = 4.6;
    // soft pastel pink floor + lavender carpet runner (DTI-inspired, our own art)
    fsDeco(14, .04, 22, '#ffe3f1', X, .02, 0); for (let i = 0; i < 6; i++) fsDeco(14, .045, .5, '#f6d2ff', X, .021, -10 + i * 4);
    fsDeco(3.2, .05, 20, '#e8c4ff', X + 2, .03, 0);
    // outer walls — doorway cheeks are SHORT stubs so they never fill the camera
    plat(-30.9, H, 0, .6, 22.6, W, H); plat(X, H, -11, 14.4, .6, W, H); plat(X, H, 11, 14.4, .6, W, H);
    plat(-17.1, 1.6, -8.2, .3, 4.0, W, 1.6); plat(-17.1, 1.6, 8.2, .3, 4.0, W, 1.6);   // short pink stubs only — nothing across the open doorway
    // NO mid-height lintel (it cut a magenta band across the camera). Tiny high marker above FOV instead.
    fsDeco(.25, .18, 1.6, '#ff6fb5', -17.1, 5.6, 0);
    fsSign('👗 PREP', -16.9, 5.85, 0, Math.PI / 2, 1.6, '#8b5cf6');
    // thin wall-top trims pushed back so they don't read as a foreground band
    fsDeco(14.4, .18, .4, '#ffb3d9', X, 5.1, -11); fsDeco(14.4, .18, .4, '#ffb3d9', X, 5.1, 11); fsDeco(.4, .18, 22.6, '#ffb3d9', -30.9, 5.1, 0);
    // wall mirrors on west wall — face into the room, gold frames, clearly lit
    [[-29.85, -5], [-29.85, 5]].forEach(([x, z]) => {
      const mir = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 3.4), new THREE.MeshBasicMaterial({color: '#e8fbff'})); mir.position.set(x, 2.3, z); mir.rotation.y = Math.PI / 2; scene.add(mir);
      fsDeco(.1, 3.6, 2.85, '#ffd23f', x + .06, 2.3, z);
      for (let k = 0; k < 6; k++){ const b = new THREE.Mesh(new THREE.SphereGeometry(.09, 8, 6), new THREE.MeshBasicMaterial({color: '#fff6c9'})); b.position.set(x + .08, 1.0 + k * .55, z - 1.15); scene.add(b); const b2 = b.clone(); b2.position.z = z + 1.15; scene.add(b2); }
    });
    FS_ST.forEach(S => { const [rx, rz] = S.r, T = FS_RACKS.find(r => r[0] === S.id), west = rx < -29;
      if (west){ // a clothes rack against the west wall
        fsDeco(.1, 2.6, .1, '#bbb', rx + .3, 1.3, rz - 1.5); fsDeco(.1, 2.6, .1, '#bbb', rx + .3, 1.3, rz + 1.5); fsDeco(.1, .1, 3.1, '#ccc', rx + .3, 2.6, rz);
        for (let k = 0; k < 6; k++){ const c = FS_COLS[(k * 3 + Math.abs(rz) * 7 + 40) % FS_COLS.length], z = rz - 1.2 + k * .48;
          if (S.id === 'dress'){ const d = new THREE.Mesh(new THREE.ConeGeometry(.42, 1.5, 10), mat(c)); d.position.set(rx + .3, 1.75, z); scene.add(d); }
          else if (S.id === 'bot'){ fsDeco(.1, 1.2, .18, c, rx + .3, 1.95, z - .1); }
          else if (S.id === 'shoe'){ if (k < 3) fsDeco(.5, .06, 3, '#fff', rx + .3, .5 + k * .7, rz); fsDeco(.4, .2, .3, c, rx + .3, .62 + (k % 3) * .7, rz - 1 + (k >> 1) * .8); }
          else fsDeco(.12, 1.1, .44, c, rx + .3, 1.95, z); }
        fsSign(T[1] + ' ' + T[2].toUpperCase(), rx + .02, 3.35, rz, Math.PI / 2, 2.2, '#ff6fb5');
      } else if (S.id === 'star'){
        const ring = new THREE.Mesh(new THREE.TorusGeometry(1, .07, 8, 28), mat('#ffd23f', '#886600')); ring.rotation.x = Math.PI / 2; ring.position.set(rx, 2.6, rz); scene.add(ring);
        fsDeco(.12, 2.6, .12, '#ffd23f', rx, 1.3, rz);
        for (let k = 0; k < 6; k++){ const a = k / 6 * Math.PI * 2, d = new THREE.Mesh(new THREE.ConeGeometry(.3, 1.1, 8), mat(['#ffd23f', '#9ff3ff', '#ff6fb5'][k % 3], '#332200')); d.position.set(rx + Math.cos(a), 2.0, rz + Math.sin(a)); scene.add(d); }
        fs.star = new THREE.Mesh(new THREE.OctahedronGeometry(.4), mat('#ffd23f', '#aa8800')); fs.star.position.set(rx, 3.3, rz); scene.add(fs.star);
        fsSign('🌟 STAR CLOSET', rx, 3.85, rz, Math.PI / 2, 2.3, '#e0a800');
      } else if (S.id === 'vip'){
        // 👑 Star VIP Lounge — against the BACK wall so it never blocks the doorway camera
        fsDeco(4.2, .06, 5.2, '#5b34c0', rx + .4, .03, rz);
        // soft pink side drapes behind the rack (west of player), not toward the entrance
        [-1, 1].forEach(s => fsDeco(.12, 3.4, 1.6, '#ffb3d9', rx - .15, 1.7, rz + s * 2.2));
        fsDeco(.1, 2.4, .1, '#ffd23f', rx + .35, 1.2, rz - 1.5); fsDeco(.1, 2.4, .1, '#ffd23f', rx + .35, 1.2, rz + 1.5); fsDeco(.1, .1, 3.1, '#ffd23f', rx + .35, 2.4, rz);
        for (let k = 0; k < 6; k++){ const c = ['#ffd23f', '#ff6fb5', '#9ff3ff', '#8b5cf6'][k % 4], z = rz - 1.2 + k * .48;
          const d = new THREE.Mesh(new THREE.ConeGeometry(.34, 1.25, 10), mat(c, '#332200')); d.position.set(rx + .35, 1.7, z); scene.add(d); }
        const glow = new THREE.Mesh(new THREE.TorusGeometry(1.0, .06, 8, 24), new THREE.MeshBasicMaterial({color: '#ffd23f'})); glow.rotation.x = Math.PI / 2; glow.position.set(rx + .3, 2.9, rz); scene.add(glow); fs.vipGlow = glow;
        const crown = new THREE.Mesh(new THREE.ConeGeometry(.4, .55, 5), mat('#ffd23f', '#886600')); crown.position.set(rx + .3, 3.35, rz); scene.add(crown);
        const lock = label('🔒 Star VIP · 250 🪙', 'rgba(91,52,192,.95)', '#fff', 220); lock.position.set(rx + .3, 4.0, rz); lock.scale.set(.5, .5, .5); scene.add(lock); fs.vipLock = lock;
        fsSign('👑 VIP', rx + .02, 3.7, rz, Math.PI / 2, 2.0, '#5b34c0');
        fsPaintVip();
      } else { // north / south wall stations
        const s = rz < 0 ? 1 : -1, ry = rz < 0 ? 0 : Math.PI;
        if (S.id === 'hair'){ const ch = new THREE.Mesh(new THREE.CylinderGeometry(.45, .35, .5, 12), mat('#ff6fb5')); ch.position.set(rx, .55, rz + s * 1.1); scene.add(ch); fsDeco(.9, .9, .15, '#ff6fb5', rx, 1.1, rz + s * .75);
          const mir = new THREE.Mesh(new THREE.PlaneGeometry(1.8, 2.2), new THREE.MeshBasicMaterial({color: '#dff6ff'})); mir.position.set(rx, 2.2, rz + s * .02); mir.rotation.y = ry; scene.add(mir);
          for (let k = 0; k < 6; k++) fsDeco(.16, .16, .16, '#fff', rx - 1 + (k % 2) * 2, 1.4 + (k >> 1) * .8, rz + s * .05, new THREE.MeshBasicMaterial({color: '#fff6b0'})); }
        else if (S.id === 'mk'){ fsDeco(2.2, .9, .8, '#ffffff', rx, .45, rz + s * .45); const mir = new THREE.Mesh(new THREE.CircleGeometry(.9, 24), new THREE.MeshBasicMaterial({color: '#dff6ff'})); mir.position.set(rx, 2.1, rz + s * .02); mir.rotation.y = ry; scene.add(mir);
          ['#ff4d8d', '#8b5cf6', '#ffd23f', '#3ac6ff'].forEach((c, k) => fsDeco(.14, .3, .14, c, rx - .6 + k * .4, 1.05, rz + s * .45)); }
        else if (S.id === 'acc'){ fsDeco(3, 2.4, .1, '#f5e6c8', rx, 2, rz + s * .02); for (let k = 0; k < 12; k++){ const t = new THREE.Mesh(new THREE.TorusGeometry(.12, .035, 6, 12), mat(FS_COLS[k])); t.position.set(rx - 1.2 + (k % 4) * .8, 1.2 + (k >> 2) * .7, rz + s * .1); t.rotation.y = ry; scene.add(t); } }
        else if (S.id === 'col'){ for (let k = 0; k < 6; k++){ const b = new THREE.Mesh(new THREE.CylinderGeometry(.22, .2, .4, 12), mat(FS_COLS[k * 3])); b.position.set(rx - 1 + (k % 3), .2, rz + s * (.5 + (k > 2 ? .5 : 0))); scene.add(b); }
          const pal = new THREE.Mesh(new THREE.CircleGeometry(.9, 20), mat('#e9b949')); pal.position.set(rx, 2.1, rz + s * .02); pal.rotation.y = ry; scene.add(pal); }
        else if (S.id === 'pose'){ fsDeco(2.2, .12, 1.6, '#ffd23f', rx, 3.6, rz + s * .6); [-1, 1].forEach(k => fsDeco(.1, 3.6, .1, '#ffd23f', rx + k * 1.05, 1.8, rz + s * 1.35)); fsDeco(.06, 3.2, 1.4, '#c81e45', rx - 1.05, 1.9, rz + s * .65); fsDeco(1.8, .05, 1.4, '#fff', rx, .03, rz + s * .65); }
        fsSign(T[1] + ' ' + T[2].toUpperCase(), rx, 4.15, rz + s * .04, ry, 2.2, S.id === 'pose' ? '#8b5cf6' : '#ff6fb5');
      }
    });
  }
  function fsLobby(){
    fsDeco(24, .04, 13, '#ffe7a8', 0, .02, 26.5); for (let i = 0; i < 4; i++) fsDeco(24, .045, .4, '#ffd27a', 0, .021, 21 + i * 3.6);
    [-1, 1].forEach(s => fsDeco(.6, 6, .6, '#ff6fb5', s * 9, 3, 19.6));
    fsDeco(18.6, .9, .5, '#8b5cf6', 0, 6.3, 19.6); fsSign('✨ RUNWAY LOBBY ✨', 0, 6.3, 19.9, Math.PI, 8, '#8b5cf6');
    // podium
    plat(0, 1.3, 30, 2.2, 2.2, '#ffd23f', 1.3); plat(-2.3, .9, 30, 2.2, 2.2, '#c0c7d6', .9); plat(2.3, .55, 30, 2.2, 2.2, '#e0a060', .55);
    [['🥇 1st', 0, .65], ['🥈 2nd', -2.3, .45], ['🥉 3rd', 2.3, .28]].forEach(([t, x, y]) => fsSign(t, x, y, 28.88, Math.PI, 1.8, '#1d2340'));
    // leaderboard
    fsDeco(8.4, 4.2, .3, '#1d2340', 0, 4.9, 33); fs.board = new THREE.Mesh(new THREE.PlaneGeometry(8, 3.9), new THREE.MeshBasicMaterial({color: '#ffffff'})); fs.board.position.set(0, 4.9, 32.83); fs.board.rotation.y = Math.PI; scene.add(fs.board); fsBoard();
    // theme wheel
    fsDeco(.2, 3, .2, '#bbb', 8.5, 1.5, 31.6);
    const wt = canvasTex(128, 128, c => { FS_THEMES.forEach((T, i) => { c.fillStyle = T.cols[i % T.cols.length]; c.beginPath(); c.moveTo(64, 64); c.arc(64, 64, 62, i / FS_THEMES.length * 6.283, (i + 1) / FS_THEMES.length * 6.283); c.fill(); }); c.fillStyle = '#fff'; c.beginPath(); c.arc(64, 64, 12, 0, 6.3); c.fill(); });
    fs.wheel = new THREE.Mesh(new THREE.CircleGeometry(1.6, 32), new THREE.MeshBasicMaterial({map: wt, side: THREE.DoubleSide})); fs.wheel.position.set(8.5, 3.6, 31.5); fs.wheel.rotation.y = Math.PI; scene.add(fs.wheel);
    fsSign('🎲 THEME WHEEL', 8.5, 5.6, 31.5, Math.PI, 2.6, '#ff9f1c');
    // photo spot, benches, plants, signposts
    const px = -8.5, pz = 31.5; fsDeco(3, .25, .25, '#ffd23f', px, 3.4, pz); fsDeco(.25, 3.5, .25, '#ffd23f', px - 1.4, 1.75, pz); fsDeco(.25, 3.5, .25, '#ffd23f', px + 1.4, 1.75, pz); fsDeco(2.6, 3.1, .05, '#ffb3d9', px, 1.75, pz + .2); fsSign('📸 PHOTO SPOT', px, 4.1, pz, Math.PI, 2.6, '#ff6fb5');
    [-1, 1].forEach(s => { plat(s * 10.5, .5, 25.5, 1.1, 4, '#8b5cf6', .5); [21, 31].forEach(z => { fsDeco(.8, .7, .8, '#b07a43', s * 11.5, .35, z); const b = new THREE.Mesh(new THREE.SphereGeometry(.7, 10, 8), mat('#2ec27e')); b.position.set(s * 11.5, 1.2, z); scene.add(b); }); });
    fsSign('⬅ DRESSING ROOM', -12, 2.4, 19.5, Math.PI * .8, 3.2, '#8b5cf6'); fsSign('RUNWAY ⬆', 4.5, 2.4, 19.9, Math.PI, 2.6, '#8b5cf6');
  }
  function fsBoard(){
    if (!fs || !fs.board) return; const p = fsProg(), L = fsLevel(p.xp);
    const t = canvasTex(512, 250, c => { c.fillStyle = '#fff8fd'; c.fillRect(0, 0, 512, 250); c.fillStyle = '#8b5cf6'; c.fillRect(0, 0, 512, 46); c.fillStyle = '#fff'; c.font = '900 30px Nunito, sans-serif'; c.textAlign = 'center'; c.fillText('🏆 TOP MODELS', 256, 34);
      c.textAlign = 'left'; c.font = '800 24px Nunito, sans-serif'; c.fillStyle = '#1d2340';
      const r = (fs.res || []).filter(x => x[1] > 0).slice(0, 3); if (!r.length) c.fillText('No show yet — be the first! ✨', 28, 96);
      r.forEach(([u, a], i) => c.fillText(['🥇', '🥈', '🥉'][i] + ' ' + fsName(u).slice(0, 18) + '  ⭐ ' + (a / 10).toFixed(1), 28, 90 + i * 34));
      c.fillStyle = '#ff6fb5'; c.fillRect(20, 196, 472, 40); c.fillStyle = '#fff'; c.font = '900 22px Nunito, sans-serif'; c.fillText('You: ' + L.e + ' Lv ' + L.lv + ' ' + L.n + ' · ⭐ ' + p.xp, 32, 224); });
    if (fs.board.material.map) fs.board.material.map.dispose(); fs.board.material.map = t; fs.board.material.needsUpdate = true;
  }
  /* --- outfits + scoring --- */
  function fsNpcFit(N, th, effort){
    const T = FS_THEMES[th], av = Object.assign({}, DEF, N.base), on = () => Math.random() < effort;
    const pickB = (slot, liked) => { const all = fsItems(slot), good = all.filter(it => T.likes.some(l => String(it.val).includes(l) || it.id.includes(l))); return ((liked && good.length ? fsRand(good) : fsRand(all)) || {}).val; };
    const free = slot => fsList(slot).filter(r => !r.lvl && !r.vip);
    const pickF = slot => { const all = free(slot), good = all.filter(r => T.fx.includes(r.v)); return (on() && good.length ? fsRand(good) : fsRand(all)).v; };
    av.shirt = on() ? fsRand(T.cols) : fsRand(FS_COLS); av.pants = on() ? fsRand(T.cols) : fsRand(FS_COLS); if (Math.random() < .3) av.hairColor = fsRand(FS_COLS);
    if (Math.random() < .5) av.hat = pickB('hat', on()) || 'none';
    if (Math.random() < .3) av.ears = pickB('ears', on()) || null;
    const fx = JSON.parse(JSON.stringify(FS_FXDEF));
    fx.top = pickF('top'); fx.bot = pickF('bot'); fx.dress = Math.random() < .35 ? pickF('dress') : 'none'; fx.shoe = pickF('shoe'); fx.hair = Math.random() < .6 ? pickF('hair') : 'base';
    fx.mk = Math.random() < .6 ? pickF('mk') : 'none'; fx.pat = Math.random() < .5 ? pickF('pat') : 'none';
    const accs = free('acc'), good = accs.filter(r => T.fx.includes(r.v)), n = Math.floor(Math.random() * 3);
    for (let i = 0; i < n; i++) fx.acc.push((on() && good.length ? fsRand(good) : fsRand(accs)).v); fx.acc = [...new Set(fx.acc)];
    fx.pc = fsRand(on() ? T.cols : FS_COLS); fx.sc = fsRand(on() ? T.cols : FS_COLS); fx.ac = fsRand(on() ? T.cols : FS_COLS);
    if (av.hat !== 'none' && fx.hair === 'afro') fx.hair = 'base';
    return {av, fx};
  }
  function fsScore(av, fx, th){
    const T = FS_THEMES[th], f = fsCleanFx(fx), a0 = Object.assign({}, DEF, av || {});
    const hex = h => { const n = parseInt(String(h || '#000').slice(1, 7), 16) || 0; return [n >> 16 & 255, n >> 8 & 255, n & 255]; };
    const near = c => { const a = hex(c); return Math.max(0, 1 - Math.min(...T.cols.map(t => { const b = hex(t); return Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]); })) / 160); };
    let s = near(a0.shirt) * 2 + near(a0.pants) * (f.dress === 'none' ? 1.5 : .5) + near(a0.hairColor) * .4 + near(f.sc) * .4 + near(f.ac) * .3;
    const vals = ['hat', 'shirtPat', 'pantsPat', 'hair', 'face', 'ears', 'tail', 'back', 'brow', 'lash'].map(k => a0[k]).filter(v => v && v !== 'none');
    s += Math.min(2, vals.filter(v => T.likes.some(l => String(v).includes(l))).length) * 1.3;
    const fv = [f.top, f.bot, f.dress, f.shoe, f.hair, f.mk, f.pat, ...f.acc]; s += Math.min(4, fv.filter(v => T.fx.includes(v)).length) * 1.4;
    s += (f.shoe !== 'none') * .4 + (f.hair !== 'base') * .4 + (f.mk !== 'none') * .4 + Math.min(3, f.acc.length) * .3 + (f.pat !== 'none') * .3 + (f.top !== 'tee' || f.dress !== 'none') * .5 + Math.min(.8, vals.length * .2);
    return s;
  }
  function fsStars(score){ return Math.max(1, Math.min(5, Math.round(1 + score / 3 + (Math.random() - .5) * 1.4))); }
  function fsRebuild(av, fx){ if (!model) return; const g = model.g, pos = g.position.clone(), ry = g.rotation.y; scene.remove(g); model = fx ? fsBuild(av, fx) : buildPlayer(av); model.g.position.copy(pos); model.g.rotation.y = ry; scene.add(model.g); fs.vipTag = null; fsVipBadge(); }
  function fsThumb(av, fx){
    const f = fsCleanFx(fx), c = document.createElement('canvas'); c.width = 60; c.height = 78; const x = c.getContext('2d');
    x.fillStyle = '#fff0f7'; x.fillRect(0, 0, 60, 78);
    x.fillStyle = av.head || '#ffd23f'; x.fillRect(20, 12, 20, 18);
    x.fillStyle = av.hairColor || '#6b3e1f'; x.fillRect(18, 9, 24, 6);
    if (/long|rainbow|braids|bob/.test(f.hair) || /long|pony|pig|braid/.test(av.hair || '')){ x.fillRect(16, 12, 4, 20); x.fillRect(40, 12, 4, 20); }
    if (f.hair === 'puffs'){ x.fillRect(14, 5, 8, 8); x.fillRect(38, 5, 8, 8); } if (f.hair === 'afro') x.fillRect(14, 4, 32, 12);
    x.fillStyle = '#1d1d1d'; x.fillRect(25, 19, 3, 3); x.fillRect(33, 19, 3, 3); if (f.mk !== 'none'){ x.fillStyle = '#ff7aa8'; x.fillRect(22, 24, 3, 2); x.fillRect(35, 24, 3, 2); }
    x.fillStyle = av.shirt || '#3a86ff'; x.fillRect(16, 31, 28, 20);
    if (f.dress !== 'none'){ const mini = f.dress === 'mini' || f.dress === 'tiered'; x.beginPath(); x.moveTo(18, 45); x.lineTo(42, 45); x.lineTo(mini ? 46 : 52, mini ? 60 : 74); x.lineTo(mini ? 14 : 8, mini ? 60 : 74); x.fill(); }
    else { x.fillStyle = av.pants || '#2d2d2d'; const short = f.bot === 'shorts' || f.bot === 'tutu'; x.fillRect(18, 51, 10, short ? 9 : 19); x.fillRect(32, 51, 10, short ? 9 : 19); if (f.bot === 'pleat' || f.bot === 'tutu') x.fillRect(12, 50, 36, 8); }
    if (f.shoe !== 'none'){ x.fillStyle = f.sc; x.fillRect(16, 70, 12, 5); x.fillRect(32, 70, 12, 5); }
    const hat = av.hat && av.hat !== 'none' && ITEMS.find(it => it.slot === 'hat' && it.val === av.hat);
    x.textAlign = 'center'; if (hat){ x.font = '17px sans-serif'; x.fillText(hat.emoji, 30, 11); }
    if (f.acc[0]){ const r = FX.acc.find(a => a[0] === f.acc[0]); x.font = '12px sans-serif'; x.fillText(r[1], 51, 40); }
    return c.toDataURL();
  }
  /* --- the wardrobe (tabs = the racks / stations in the room) --- */
  function fsWardOpen(tab){ if (!fs || fs.ph !== 'dress') return; if (tab) fs.tab = tab; fs.ward = true; fsWardRender(); $('#fsWard').classList.add('show'); $('#fsWardBtn').classList.remove('show'); $('#fsNear').classList.remove('show'); fs.near = null; }
  function fsWardClose(){ if (!fs) return; fs.ward = false; $('#fsWard').classList.remove('show'); if (fs.ph === 'dress') $('#fsWardBtn').classList.add('show'); }
  function fsLocked(r){
    if (r && r.vip && !fsIsVip()) return true;
    return !!r.lvl && fsLevel(fsProg().xp).lv < r.lvl;
  }
  function fsVipRows(){ const rows = []; Object.keys(FX).forEach(slot => fsList(slot).filter(r => r.vip).forEach(r => rows.push(Object.assign({s: slot}, r)))); return rows; }
  function fsWardRender(){
    const T = FS_THEMES[fs.th], tab = fs.tab || 'top', f = fs.fit, x = fs.fx;
    $('#fsTheme').textContent = T.emoji + ' ' + T.name; $('#fsLikes').textContent = '💖 Voters love: ' + T.hint;
    $('#fsTabs').innerHTML = FS_RACKS.map(([k, e, n]) => `<button class="fstab${k === tab ? ' on' : ''}" data-t="${k}">${e}<small>${n.split(' ')[0]}</small></button>`).join('');
    $('#fsTabs').querySelectorAll('.fstab').forEach(b => b.onclick = () => { fs.tab = b.dataset.t; fsWardRender(); });
    const like = v => T.fx.includes(v);
    const grid = (slot, rows, multi) => '<div class="fsgrid">' + rows.map(r => { const on = multi ? x.acc.includes(r.v) : x[slot] === r.v, lk = fsLocked(r);
      const why = lk ? (r.vip && !fsIsVip() ? '<br>👑 VIP' : (r.lvl ? '<br>Lv ' + r.lvl : '')) : (r.vip ? '<br>👑' : '');
      return `<button class="fsit${on ? ' on' : ''}${lk ? ' lock' : ''}${r.vip ? ' fsvip' : ''}" data-fx="${slot}" data-v="${r.v}"><i>${lk ? '🔒' : r.e}</i><small>${r.n}${why}</small>${like(r.v) ? '<u>💖</u>' : ''}</button>`; }).join('') + '</div>';
    const shop = (slots, label) => { const list = []; slots.forEach(slot => { if (slot === 'hat') list.push({slot, val: 'none', emoji: '🚫', name: 'No hat'});
        fsItems(slot).forEach(it => list.push({slot, val: it.val, emoji: it.emoji, name: it.name, own: isOwned(it), like: T.likes.some(l => String(it.val).includes(l) || it.id.includes(l))})); });
      const o = fs.list.length; fs.list = fs.list.concat(list);
      return `<div class="fssub">${label}</div><div class="fsgrid">` + list.map((it, i) => `<button class="fsit${f[it.slot] === it.val ? ' on' : ''}" data-i="${o + i}"><i>${it.emoji}</i><small>${it.name}</small>${it.like ? '<u>💖</u>' : it.own ? '<u>⭐</u>' : ''}</button>`).join('') + '</div>'; };
    const sw = (k, n, cols, fxk) => `<div class="fsrow"><b>${n}</b>${cols.map(c => `<button class="fssw${(fxk ? x[k] : f[k]) === c ? ' on' : ''}" data-${fxk ? 'fxc' : 'k'}="${k}" data-c="${c}" style="--c:${c}" aria-label="${n} ${c}"></button>`).join('')}</div>`;
    fs.list = []; let h = '';
    if (tab === 'top') h = grid('top', fsList('top')) + sw('shirt', '🎨 Colour', FS_COLS) + shop(['shirtPat'], '🛍️ Shop shirts (borrow!)');
    else if (tab === 'bot') h = grid('bot', fsList('bot')) + sw('pants', '🎨 Colour', FS_COLS) + shop(['pantsPat'], '🛍️ Shop bottoms (borrow!)');
    else if (tab === 'dress') h = grid('dress', fsList('dress')) + sw('shirt', '🎨 Colour', FS_COLS);
    else if (tab === 'shoe') h = grid('shoe', fsList('shoe')) + sw('sc', '🎨 Colour', FS_COLS, true);
    else if (tab === 'hair') h = grid('hair', fsList('hair')) + sw('hairColor', '🎨 Hair colour', FS_COLS.concat(['#6b3e1f', '#1d1d1d', '#e8e8e8'])) + shop(['hair'], '💇 Shop hair (works with "My own hair")');
    else if (tab === 'mk') h = grid('mk', fsList('mk')) + sw('mc', '💋 Lip / paint', ['#ff4d8d', '#ff4d4d', '#ff9f1c', '#8b5cf6', '#3ac6ff', '#2b2d42', '#ffb3d9'], true) + sw('head', '🙂 Skin', FS_SKIN) + shop(['face', 'lash', 'brow'], '😀 Faces & lashes');
    else if (tab === 'acc') h = `<div class="fssub">Pick up to ${FS_ACCMAX} · ${x.acc.length}/${FS_ACCMAX} on</div>` + grid('acc', fsList('acc'), true) + sw('ac', '🎨 Accent', FS_COLS, true) + shop(['hat', 'ears', 'tail', 'back'], '🎩 Hats, ears, tails & wings');
    else if (tab === 'col') h = sw('shirt', '👕 Top & dress', FS_COLS) + sw('pants', '👖 Bottoms', FS_COLS) + sw('pc', '🖌️ Pattern', FS_COLS, true) + grid('pat', fsList('pat')) + sw('sc', '👟 Shoes', FS_COLS, true) + sw('ac', '💍 Accent', FS_COLS, true) + sw('head', '🙂 Skin', FS_SKIN);
    else if (tab === 'star'){ const rows = []; ['dress', 'shoe', 'hair', 'acc'].forEach(s => fsList(s).filter(r => r.lvl).forEach(r => rows.push(Object.assign({s}, r))));
      h = fsLvlHtml() + `<div class="fssub">🌟 Level up to unlock Star Closet pieces!</div><div class="fsgrid">` + rows.map(r => { const lk = fsLocked(r), on = r.s === 'acc' ? x.acc.includes(r.v) : x[r.s] === r.v;
        return `<button class="fsit${on ? ' on' : ''}${lk ? ' lock' : ''}" data-fx="${r.s}" data-v="${r.v}"><i>${lk ? '🔒' : r.e}</i><small>${r.n}<br>${lk ? 'Lv ' + r.lvl : '✅ Unlocked'}</small></button>`; }).join('') + '</div>'; }
        else if (tab === 'vip'){ const vip = fsIsVip(), rows = fsVipRows();
      h = (vip ? `<div class="fssub">👑 Star VIP Lounge — exclusive pieces just for you!</div>` : `<div class="fssub">👑 Star VIP Lounge · unlock with <b>${FS_VIP_COST} Rublox coins</b> (never real money)<br><button class="big blue" id="fsVipBuy">👑 Unlock Star VIP · ${FS_VIP_COST} 🪙</button></div>`)
        + `<div class="fsgrid">` + rows.map(r => { const lk = fsLocked(r), on = r.s === 'acc' ? x.acc.includes(r.v) : x[r.s] === r.v;
          return `<button class="fsit fsvip${on ? ' on' : ''}${lk ? ' lock' : ''}" data-fx="${r.s}" data-v="${r.v}"><i>${lk ? '🔒' : r.e}</i><small>${r.n}<br>${lk ? 'VIP only' : '👑 VIP'}</small></button>`; }).join('') + '</div>'; }
    else if (tab === 'pose') h = `<div class="fssub">Pick your runway pose — you can switch poses on the runway too!</div><div class="fsgrid">` + FS_POSES.map((p, i) => `<button class="fsit fspz${fs.myPose === i ? ' on' : ''}" data-pose="${i}"><i>${p.e}</i><small>${p.n}</small></button>`).join('') + '</div>';
    const saved = load('rubloxFsLook', null);
    h += `<div class="fsrow fsmini"><button class="fsmb" id="fsRand">🎲 Surprise me</button>${fsHasSavedLook() ? '<button class="fsmb" id="fsLoad">💾 Wear my saved look</button>' : ''}<button class="fsmb" id="fsReset">↩️ Start over</button><button class="fsmb fssave" id="fsKeepWard">💾 Save for next show</button></div>`;
    $('#fsItems').innerHTML = h;
    $('#fsItems').querySelectorAll('.fssw').forEach(b => b.onclick = () => b.dataset.fxc ? fsFx(b.dataset.fxc, b.dataset.c) : fsSet(b.dataset.k, b.dataset.c));
    $('#fsItems').querySelectorAll('.fsit[data-fx]').forEach(b => b.onclick = () => fsFx(b.dataset.fx, b.dataset.v));
    $('#fsItems').querySelectorAll('.fsit[data-i]').forEach(b => b.onclick = () => { const it = fs.list[+b.dataset.i]; fsSet(it.slot, fs.fit[it.slot] === it.val && it.slot !== 'hat' && it.slot !== 'face' ? null : it.val); });
    $('#fsItems').querySelectorAll('.fspz').forEach(b => b.onclick = () => fsPose(+b.dataset.pose));
    $('#fsRand').onclick = () => fsSurprise(); $('#fsReset').onclick = () => fsResetLook(); if ($('#fsLoad')) $('#fsLoad').onclick = () => fsLoadLook();
    if ($('#fsVipBuy')) $('#fsVipBuy').onclick = () => fsBuyVip();
    if ($('#fsKeepWard')) $('#fsKeepWard').onclick = () => fsKeep();
    $('#fsReady').textContent = fs.ready.has(fsUid()) ? '✅ Ready! (keep styling)' : '✅ I\'m ready!';
    $('#fsCount').textContent = '👗 ' + fsCount() + ' pieces on';
  }
  function fsCount(){ const x = fs.fx, f = fs.fit; return [x.top !== 'tee', x.dress === 'none', x.dress !== 'none', x.shoe !== 'none', x.hair !== 'base', x.mk !== 'none', x.pat !== 'none', f.hat && f.hat !== 'none', f.ears, f.tail, f.back].filter(Boolean).length + x.acc.length + 1; }
  function fsChanged(){ fsRebuild(fs.fit, fs.fx); fs.fitDirty = .5; SND.coin(); if (fs.ward) fsWardRender(); }
  function fsSet(k, v){ if (!fs || fs.ph !== 'dress') return; fs.fit[k] = v; if (k === 'hair' && v) fs.fx.hair = 'base'; fsChanged(); }
  function fsFx(k, v){
    if (!fs || fs.ph !== 'dress') return; const x = fs.fx;
    if (['pc', 'sc', 'ac', 'mc'].includes(k)){ if (/^#[0-9a-f]{3,8}$/i.test(v)) x[k] = v; return fsChanged(); }
    if (!FS_OK[k] || !FS_OK[k].has(v)) return;
    const r = fsList(k).find(q => q.v === v); if (r && fsLocked(r)){
      if (r.vip && !fsIsVip()){ toast('👑 Unlock Star VIP with ' + FS_VIP_COST + ' Rublox coins to wear ' + r.n + '!'); return; }
      const T = FS_TITLES[r.lvl - 1]; toast('🔒 Reach Lv ' + r.lvl + ' (' + T[1] + ' ' + T[2] + ') to unlock ' + r.n + '!'); return; }
    if (k === 'acc'){ const i = x.acc.indexOf(v); if (i >= 0) x.acc.splice(i, 1); else { if (x.acc.length >= FS_ACCMAX){ toast('💍 ' + FS_ACCMAX + ' accessories max — took off the ' + FX.acc.find(a => a[0] === x.acc[0])[2]); x.acc.shift(); } x.acc.push(v); } }
    else { x[k] = v; if (k === 'bot' && x.dress !== 'none') x.dress = 'none'; if (k === 'dress' && v !== 'none' && !['tee', 'jacket', 'puff'].includes(x.top)) x.top = 'tee'; if (k === 'hair' && v !== 'base' && fs.fit.hat === 'pumpkin') fs.fit.hat = 'none'; }
    fsChanged();
  }
  function fsSurprise(){ if (!fs || fs.ph !== 'dress') return; const o = fsNpcFit({base: {head: fs.fit.head, body: fs.fit.body, hair: fs.fit.hair, hairColor: fs.fit.hairColor}}, fs.th, .6);
    fs.fit = Object.assign({}, fs.fit, {shirt: o.av.shirt, pants: o.av.pants}); fs.fx = o.fx; fsChanged(); }
  function fsResetLook(){ if (!fs || fs.ph !== 'dress') return; fs.fit = fixAv(Object.assign({}, DEF, avatar)); fs.fx = fsCleanFx(null); fsChanged(); }
  function fsHasSavedLook(){ const s = load('rubloxFsLook', null); return !!(s && typeof s === 'object' && s.fx && typeof s.fx === 'object'); }
  function fsApplySavedLook(silent){
    const s = load('rubloxFsLook', null); if (!s || !fs || typeof s !== 'object') return false;
    // merge saved colours onto your real avatar base; runway FX (incl. VIP pieces) come back via fsCleanFx
    fs.fit = cleanAv(Object.assign({}, avatar, s.av || {}));
    fs.fx = fsCleanFx(s.fx);
    // drop VIP pieces if the player no longer has VIP (save can still keep them for when VIP returns)
    if (!fsIsVip()){
      ['top','bot','dress','shoe','hair','mk','pat'].forEach(k => { const r = fsList(k).find(q => q.v === fs.fx[k]); if (r && r.vip) fs.fx[k] = FS_FXDEF[k]; });
      fs.fx.acc = fs.fx.acc.filter(v => { const r = fsList('acc').find(q => q.v === v); return !(r && r.vip); });
    }
    fsRebuild(fs.fit, fs.fx); fsVipBadge(); if (fs.ward) fsWardRender();
    if (!silent) toast('💾 Wearing your saved look!');
    return true;
  }
  function fsLoadLook(){ if (!fs || fs.ph !== 'dress') return; if (!fsApplySavedLook(false)) toast('💾 No saved look yet — style one and tap Save for next show'); }
  function fsReadyBtn(){
    if (!fs || fs.ph !== 'dress') return;
    fs.ready.add(fsUid()); fsWardClose(); banner('✅ Looking good! Waiting for the show to start...');
    if (fs.remote){ fsSendFit(); mpSendTo(mp.hconn, {t: 'fsready'}); }
  }
  function fsSendFit(){ mpSendTo(mp.hconn, {t: 'fsfit', av: cleanAv(fs.fit), fx: fsCleanFx(fs.fx)}); }
  function fsPose(i){ if (!fs) return; i = Math.max(0, Math.min(FS_POSES.length - 1, i | 0)); fs.myPose = i; fs.poses[fsUid()] = i;
    if (fs.remote) mpSendTo(mp.hconn, {t: 'fspose', i}); if (fs.ward) fsWardRender(); if (fs.ph === 'walk') fsPoseBar(); }
  /* --- flow: lobby → intro (theme) → dress → walk (+ rate) → podium → end --- */
  function fsBodies(){
    const out = [fsUid()];
    if (mp.on && mp.host){ const now = performance.now(); for (const g of mp.guests.values()){ if (!g.ready) continue; const E = mp.ents.get(g.uid); if (E && E.m === 'fashion' && now - E.seen < 3000) out.push(g.uid); } }
    return out;
  }
  function fsTip(){
    const ph = fs && fs.ph, hide = !fs || !(ph === 'lobby' || ph === 'dress');
    document.body.classList.toggle('fsnotip', !!fs && hide);
    if (hide){ $('#oTip').classList.add('hide'); tipTimer = 0; return; }
    $('#oTip').innerHTML = fsTipText(); $('#oTip').classList.remove('hide'); tipTimer = 6;
  }
  function fsTipText(){
    const ph = fs ? fs.ph : 'lobby';
    const a = pad.on ? '🎮 Left stick move · Ⓐ jump · Ⓧ ' + (ph === 'dress' ? 'try on / wardrobe' : 'show menu') + ' · ☰ menu'
      : touchUI ? '🕹️ Left thumb moves · ⬆️ jump · ' + (ph === 'dress' ? 'tap 👗 to try on' : 'tap ✨ Show menu')
      : '⌨️ WASD move · Space jump · ' + (ph === 'dress' ? 'E try on at a rack · C wardrobe' : 'C show menu') + ' · Esc menu';
    return a + '<br>' + (ph === 'dress' ? '👗 Walk up to a rack, mirror or the 👑 VIP Lounge! Fashion clothes stay in the show only. 💖 = voters love it' : '✨ Explore the lobby · unlock Star VIP with Rublox coins · then start the show!');
  }
  function fsHideAll(){ ['#fsPick', '#fsEnd', '#fsWard', '#fsRate', '#fsPoses', '#fsIntro'].forEach(id => $(id).classList.remove('show')); ['#fsWardBtn', '#fsNear', '#fsShowBtn'].forEach(id => $(id).classList.remove('show')); if (fs){ fs.ward = false; fs.near = null; } }
  function fsPickOpen(){
    fsHideAll(); fs.ph = 'lobby'; fs.lobPanel = true; choosing = true; const g = mpGuest();
    fsClearWalkers(); fsNpcsTo('lobby');
    $('#fsLv').innerHTML = fsLvlHtml() + (fsIsVip()
      ? '<div class="fsvipb">👑 Star VIP · exclusive lounge + clothes unlocked</div>'
      : '<div class="fsvipb">👑 Star VIP Lounge · <button class="fsmb" id="fsVipBuyL">Unlock with ' + FS_VIP_COST + ' 🪙</button> <small>(Rublox coins only — never real money)</small></div>');
    $('#fsPickS').textContent = g ? '⏳ Waiting for the host to start the show...' : mp.on ? 'Everyone gets the same surprise theme, styles a look in the pastel prep room, walks the glam runway and rates each other 1-5 ⭐!' : 'Get a surprise theme, style a look in the pastel prep room, strut the glam runway with a pose, and get rated by the other models and judges! 👑';
    $('#fsGo').style.display = g ? 'none' : ''; $('#fsTimes').style.display = g ? 'none' : '';
    $('#fsTimes').innerHTML = '⏱️ Dress time: ' + FS_TIMES.map(s => `<button class="fstm${fs.dl === s ? ' on' : ''}" data-s="${s}">${s / 60} min</button>`).join('');
    $('#fsTimes').querySelectorAll('.fstm').forEach(b => b.onclick = () => fsSetTime(+b.dataset.s));
    if ($('#fsVipBuyL')) $('#fsVipBuyL').onclick = () => fsBuyVip();
    $('#fsPick').classList.add('show'); fsTip();
  }
  function fsSetTime(s){ if (!fs || !FS_TIMES.includes(s)) return; fs.dl = s; save('rubloxFsTime', s); if (fs.lobPanel) fsPickOpen(); }
  function fsLobbyWalk(){ if (!fs) return; fs.lobPanel = false; choosing = false; $('#fsPick').classList.remove('show'); $('#fsShowBtn').classList.add('show'); fsTip(); }
  function fsToLobby(){ const n = mp.on ? (+String(mp.me).replace(/\D/g, '') || 0) : 0; Object.assign(P, {x: ((n % 5) - 2) * 1.6, y: .05, z: 23, vx: 0, vy: 0, vz: 0}); P.face = 0; cam.yaw = Math.PI; cam.pitch = .3; cam.dist = 8; }
  function fsStart(){
    if (!fs || mpGuest()) return;
    let ord;
    if (mp.on){ ord = fsBodies(); if (ord.length < 2){ toast('👫 The Fashion Show needs 2+ players in the room'); return; } }
    else ord = ['H', ...FS_NPCS.map(n => n.uid)];
    let th; do { th = Math.floor(Math.random() * FS_THEMES.length); } while (th === fs.lastTh);
    if (fs.forceTh != null) th = fs.forceTh;
    fs.lastTh = th; fs.th = th; fs.ord = ord; fs.n++; fs.ph = 'intro'; fs.t = FS_INTRO; fs.wt = 0; fs.gfits = {}; fs.gfx = {}; fs.fits = {}; fs.fxs = {}; fs.rates = {}; fs.poses = {}; fs.ready = new Set(); fs.res = []; fs.pod = []; fs.done = {};
    fsLocalIntro();
  }
  function fsLocalIntro(){
    fsHideAll(); choosing = false; over = false; fs.lobPanel = false;
    fsClearWalkers(); fsNpcsTo('lobby'); fsToLobby(); fs.introT = 0; fs.endShown = false; fs.paid = false; fs.earned = 0; fs.rated = {};
    $('#fsIntro').classList.remove('lock'); $('#fsIntro').classList.add('show'); SND.cp(); fsTip();
  }
  function fsBeginDress(){ fs.ph = 'dress'; fs.t = fs.dl; fs.ready = new Set(); if (!mp.on){ fs.npcFit = {}; FS_NPCS.forEach(N => { fs.npcFit[N.uid] = fsNpcFit(N, fs.th, .15); }); } fsLocalDress(); }
  function fsLocalDress(){
    fsHideAll(); choosing = false; over = false; fs.lobPanel = false;
    fs.endShown = false; fs.paid = false; fs.earned = 0; fs.tab = fs.tab || 'top'; fsClearWalkers();
    fs.fit = fixAv(Object.assign({}, DEF, avatar)); fs.fx = fsCleanFx(null); fs.poses[fsUid()] = fs.myPose;
    const restored = fsApplySavedLook(true);
    if (!restored){ fsRebuild(fs.fit, fs.fx); fsVipBadge(); }
    const n = Math.max(0, fs.ord.indexOf(fsUid()));
    // spawn DEEP inside the prep room so the camera never sits outside looking through the doorway lintel
    Object.assign(P, {x: -23.5 - (n % 3) * .7, y: .05, z: ((n % 4) - 1.5) * 1.1, vx: 0, vy: 0, vz: 0}); P.face = -Math.PI / 2; cam.yaw = P.face + Math.PI; cam.pitch = .28; cam.dist = 5.2;
    const T = FS_THEMES[fs.th];
    banner('👗 ' + T.emoji + ' ' + T.name + '! You have ' + (fs.dl >= 60 ? fs.dl / 60 + ' min' : fs.dl + 's') + (restored ? ' · 💾 saved look on!' : ' — go style!')); SND.cp();
    if (restored) toast('💾 Your saved look is on — tweak it or tap Wardrobe');
    $('#fsWardBtn').classList.add('show'); fsNpcsTo('room'); fsTip();
  }
  function fsBeginWalk(){
    fs.ph = 'walk'; fs.wt = 0; fs.fits = {}; fs.fxs = {}; fs.rates = {}; fs.done = {};
    fs.ord.forEach(u => {
      if (u === fsUid()){ fs.fits[u] = cleanAv(fs.fit); fs.fxs[u] = fsCleanFx(fs.fx); fs.poses[u] = fs.myPose; }
      else if (!mp.on){ const N = FS_NPCS.find(n => n.uid === u), o = fsNpcFit(N, fs.th, .5 + Math.random() * .35); fs.fits[u] = o.av; fs.fxs[u] = o.fx; fs.poses[u] = Math.floor(Math.random() * FS_POSES.length); }
      else { fs.fits[u] = fs.gfits[u] || (mpLook(u) || {}).av || Object.assign({}, DEF); fs.fxs[u] = fsCleanFx(fs.gfx[u]); if (fs.poses[u] == null) fs.poses[u] = 0; }
    });
    fsLocalWalk();
  }
  function fsSeat(){ const i = fs.ord.indexOf(fsUid()), n = Math.max(1, fs.ord.length), k = i < 0 ? 0 : i; return {x: (k - (n - 1) / 2) * 1.7, y: .65, z: 15.6}; }
  function fsClearWalkers(){ (fs.walkers || []).forEach(w => scene.remove(w.m.g)); fs.walkers = []; }
  function fsLocalWalk(){
    fsHideAll(); choosing = false;
    fsClearWalkers();
    fs.ord.forEach(u => { const av = Object.assign({}, DEF, fs.fits[u] || {}), m = fsBuild(av, fs.fxs[u] || null); m.g.visible = false; scene.add(m.g);
      const meVip = u === fsUid() && fsIsVip();
      const lab = label(meVip ? '👑 VIP You' : (u === fsUid() ? '⭐ You' : fsName(u)), meVip ? 'rgba(232,168,0,.98)' : 'rgba(255,111,181,.92)');
      lab.position.y = meVip ? 4.35 : 3.55; if (meVip) lab.scale.set(1.15, 1.15, 1.15); m.g.add(lab);
      fs.walkers.push({u, m, av, ph: 0, lab, shown: false, meVip}); });
    fsNpcsTo('hide');
    const s = fsSeat(); Object.assign(P, {x: s.x, y: s.y, z: s.z, vx: 0, vy: 0, vz: 0}); P.face = Math.PI;
    if (fs.fit) fsRebuild(fs.fit, fs.fx);
    banner('✨ The show begins! ' + FS_THEMES[fs.th].emoji + ' Rate every look 1-5 ⭐'); SND.win(); fsTip();
  }
  function fsCur(){ if (!fs || fs.ph !== 'walk') return null; const k = Math.floor(fs.wt / FS_WALK); return k >= 0 && k < fs.ord.length ? fs.ord[k] : null; }
  function fsRate(n){
    const u = fsCur(); n = n | 0; if (!u || u === fsUid() || n < 1 || n > 5) return false;
    fs.rated[u] = n; if (fs.remote) mpSendTo(mp.hconn, {t: 'fsrate', u, n}); else (fs.rates[fsUid()] = fs.rates[fsUid()] || {})[u] = n;
    SND.coin(); fsRateBar(true); return true;
  }
  function fsRateBar(force){
    const u = fsCur(), me = fsUid(), el = $('#fsRate'), pz = $('#fsPoses');
    if (!u){ el.classList.remove('show'); pz.classList.remove('show'); fs.rbU = null; return; }
    if (u === me){ el.classList.remove('show'); if (fs.rbU !== u || force) fsPoseBar(); pz.classList.add('show'); fs.rbU = u; return; }
    pz.classList.remove('show');
    if (fs.rbU !== u || force){ fs.rbU = u; const v = fs.rated[u] || 0;
      $('#fsRateN').textContent = '⭐ Rate ' + fsName(u) + '\'s look!';
      $('#fsRateS').innerHTML = [1, 2, 3, 4, 5].map(i => `<button class="fsstar${i <= v ? ' on' : ''}" data-n="${i}" aria-label="${i} stars">★</button>`).join('');
      $('#fsRateS').querySelectorAll('.fsstar').forEach(b => b.onclick = () => fsRate(+b.dataset.n));
      $('#fsRateH').textContent = v ? '✅ You gave ' + v + ' ⭐' : (pad.on ? 'D-pad ⬅ ➡ to rate' : touchUI ? 'Tap a star' : 'Keys 1-5 or click a star');
    }
    el.classList.add('show');
  }
  function fsPoseBar(){ const cur = fs.poses[fsUid()] != null ? fs.poses[fsUid()] : fs.myPose;
    $('#fsPoseS').innerHTML = FS_POSES.map((p, i) => `<button class="fspose${i === cur ? ' on' : ''}" data-i="${i}">${p.e}<small>${p.n}</small></button>`).join('');
    $('#fsPoseS').querySelectorAll('.fspose').forEach(b => b.onclick = () => fsPose(+b.dataset.i));
    $('#fsPoseH').textContent = '👠 Your turn! ' + (pad.on ? 'Ⓧ / Ⓨ switch pose' : touchUI ? 'Tap a pose!' : 'Keys 1-7 switch pose'); }
  function fsJudgeWalker(u){ // single player: the judges + the other models rate this look (never yourself)
    const sc = fsScore(fs.fits[u], fs.fxs[u], fs.th);
    ['j0', 'j1', 'j2', 'j3', ...FS_NPCS.map(n => n.uid)].forEach(v => { if (v === u) return; (fs.rates[v] = fs.rates[v] || {})[u] = fsStars(sc); });
    fs.judges.forEach(J => J.voteT = 2.2);
    banner('⭐ ' + (u === fsUid() ? 'You got' : fsName(u) + ' got') + ' ' + fsAvg(u).toFixed(1) + ' stars!');
  }
  function fsAvg(u){ let s = 0, c = 0; Object.entries(fs.rates).forEach(([v, r]) => { if (v !== u && r[u]){ s += r[u]; c++; } }); return c ? s / c : 0; }
  function fsTally(){
    const cnt = u => Object.entries(fs.rates).filter(([v, r]) => v !== u && r[u]).length;
    fs.res = fs.ord.map(u => [u, Math.round(fsAvg(u) * 10), cnt(u)]).sort((a, b) => b[1] - a[1] || b[2] - a[2]);
    fs.pod = fs.res.filter(r => r[1] > 0).slice(0, 3).map(r => r[0]);
    fs.ph = 'podium'; fs.t = FS_POD; fsLocalPodium();
  }
  function fsLocalPodium(){
    $('#fsRate').classList.remove('show'); $('#fsPoses').classList.remove('show'); choosing = false; if (!fs.walkers.length) fsLocalWalk();
    const s = fsSeat(); Object.assign(P, {x: s.x * .6, y: .05, z: 19, vx: 0, vy: 0, vz: 0}); P.face = 0;   // behind the podium camera
    const k = fs.pod.indexOf(fsUid());
    banner(k >= 0 ? ['🥇 You came 1st!', '🥈 You came 2nd!', '🥉 You came 3rd!'][k] : fs.pod.length ? '🏆 ' + fsName(fs.pod[0]) + ' wins the show!' : '✨ What a show!');
    if (k >= 0) confetti(); SND.win(); fsBoard(); fsTip();
  }
  function fsUnl(lv){ const r = []; ['dress', 'shoe', 'hair', 'acc'].forEach(s => fsList(s).forEach(x => { if (x.lvl === lv) r.push(x.e + ' ' + x.n); })); return r.length ? '<br>🌟 New in the Star Closet: ' + r.join(', ') : ''; }
  function fsEndLocal(){
    if (fs.endShown) return; fs.endShown = true; fs.ph = 'end';
    $('#fsRate').classList.remove('show'); $('#fsPoses').classList.remove('show'); choosing = true;
    const me = fsUid(), mine = fs.ord.includes(me), place = fs.pod.indexOf(me), row = fs.res.find(r => r[0] === me), avg = row ? row[1] / 10 : 0;
    let lvUp = null;
    if (!fs.paid){ fs.paid = true; fs.lvBonus = 0; fs.xpGain = 0; const n = mine ? FS_JOIN + (place >= 0 ? FS_PRIZE[place] : 0) : 0;
      if (mine){ const p = fsProg(), L0 = fsLevel(p.xp).lv, gain = 2 + Math.round(avg * 4) + (place >= 0 ? [8, 5, 3][place] : 0); p.xp += gain; p.shows++; if (place === 0) p.wins++; p.best = Math.max(p.best, avg); save('rubloxFashion', p); fs.xpGain = gain;
        const L1 = fsLevel(p.xp); if (L1.lv > L0){ lvUp = L1; fs.lvBonus = L1.lv * 10; } }
      const tot = n + fs.lvBonus; if (tot){ fs.earned = tot; runCoins = tot; setCoins(coins + tot); SND.coin(); } }
    $('#fsEndE').textContent = place === 0 ? '👑' : place > 0 ? ['', '🥈', '🥉'][place] : '✨';
    $('#fsEndT').textContent = place === 0 ? '👑 You won the Fashion Show!' : place === 1 ? '🥈 2nd place!' : place === 2 ? '🥉 3rd place!' : fs.pod.length ? '🏆 ' + fsName(fs.pod[0]) + ' won!' : 'What a show!';
    $('#fsEndS').innerHTML = fs.res.map(([u, a, c], k) => `<div class="fsres${k < 3 && a > 0 ? ' win' : ''}"><img alt="" src="${fsThumb(Object.assign({}, DEF, fs.fits[u] || {}), fs.fxs[u])}"><span>${k < 3 && a > 0 ? ['🥇', '🥈', '🥉'][k] : '·'} ${bxEsc(fsName(u))}</span><b>${a ? '⭐ ' + (a / 10).toFixed(1) : '—'}</b><small>${c} vote${c === 1 ? '' : 's'}</small></div>`).join('');
    $('#fsEndC').textContent = fs.earned ? '🪙 +' + fs.earned + ' coins' + (place >= 0 ? ' (+' + FS_PRIZE[place] + ' for the podium!)' : '') + (fs.lvBonus ? ' · 🎉 +' + fs.lvBonus + ' level-up bonus' : '') : '';
    $('#fsEndL').innerHTML = mine ? (fs.xpGain ? '<div class="fssub">+' + fs.xpGain + ' style stars ⭐</div>' : '') + fsLvlHtml() + (lvUp ? `<div class="fslvup">🎉 LEVEL UP! You are now ${lvUp.e} ${lvUp.n}!${fsUnl(lvUp.lv)}</div>` : '') : '';
    if (lvUp){ confetti(); banner('🎉 Level up: ' + lvUp.e + ' ' + lvUp.n + '!'); }
    const g = mpGuest(); $('#fsAgain').style.display = g ? 'none' : ''; $('#fsLobby').style.display = g ? 'none' : ''; $('#fsEndW').style.display = g ? '' : 'none';
    $('#fsKeep').style.display = mine ? '' : 'none'; $('#fsKeep').disabled = false; $('#fsKeep').textContent = '💾 Save for next show';
    $('#fsEnd').classList.add('show'); fsBoard(); fsTip();
  }
  function fsBackToLobby(){ if (!fs || mpGuest()) return; fs.ph = 'lobby'; fsHideAll(); fsClearWalkers(); if (fs.fit) fsRebuild(avatar); fsToLobby(); fsPickOpen(); }
  function fsKeep(){
    // Fashion pieces stay INSIDE the Fashion Show only — they never go onto your normal Rublox avatar.
    if (!fs || !fs.fit) return;
    const payload = {av: cleanAv(fs.fit), fx: fsCleanFx(fs.fx), t: Date.now()};
    save('rubloxFsLook', payload);
    // prove it stuck (some browsers are picky); fall back to a second write
    const check = load('rubloxFsLook', null);
    if (!check || !check.fx){ try { localStorage.setItem('rubloxFsLook', JSON.stringify(payload)); } catch (e){} }
    ['#fsKeep', '#fsKeepWard', '#fsKeepWard2'].forEach(id => { const b = $(id); if (b){ b.disabled = true; b.textContent = '✅ Saved for next show!'; } });
    toast('💾 Saved for the next Fashion Show only — your normal character outfit is unchanged');
    if (fs.ward) fsWardRender();   // reveal 💾 Wear my saved look
  }
  // one-time: strip any accidental fashion leftovers that an older "Save my look" may have written onto the normal avatar
  function fsMigrateAvatar(){
    try {
      const raw = load('rubloxAvatar', null); if (!raw || typeof raw !== 'object') return;
      const ok = new Set((ITEMS || []).filter(it => it && it.val != null).map(it => it.slot + ':' + it.val));
      let dirty = false; const a = Object.assign({}, raw);
      ['hat', 'shirtPat', 'pantsPat', 'hair', 'face', 'ears', 'tail', 'back', 'brow', 'lash'].forEach(k => {
        const v = a[k]; if (v == null || v === 'none' || v === DEF[k]) return;
        // keep only real shop items; anything unknown (never a shop id) is cleared
        if (!ok.has(k + ':' + v) && !(k === 'hair' && ['short','long','curly','spiky','pigtails','bun','ponytail','afro'].includes(v))){ a[k] = DEF[k] ?? null; dirty = true; }
      });
      if (dirty){ avatar = fixAv(a); save('rubloxAvatar', avatar); if (typeof refreshLook === 'function') refreshLook(); }
    } catch (e){}
  }
  /* --- NPC models (single player only) --- */
  function fsNpcShow(u){
    const N = FS_NPCS.find(n => n.uid === u); if (!N || mp.on) return;
    const old = fs.npcM[u], pos = old ? old.m.g.position.clone() : null, rot = old ? old.m.g.rotation.y : 0, vis = old ? old.m.g.visible : true; if (old) scene.remove(old.m.g);
    const o = (fs.npcFit && fs.npcFit[u]) || {av: Object.assign({}, DEF, N.base), fx: null}, m = fsBuild(o.av, o.fx); scene.add(m.g); if (pos) m.g.position.copy(pos); m.g.rotation.y = rot; m.g.visible = vis;
    const lab = label(N.emoji + ' ' + N.name, 'rgba(29,35,64,.75)'); lab.position.y = 3.35; lab.scale.set(.7, .7, .7); m.g.add(lab);
    fs.npcM[u] = Object.assign(old || {ph: 0, wait: 1 + Math.random() * 2, tgt: null}, {m});
  }
  function fsNpcsTo(where){
    if (mp.on){ Object.values(fs.npcM).forEach(M => scene.remove(M.m.g)); fs.npcM = {}; return; }
    FS_NPCS.forEach((N, i) => { if (!fs.npcM[N.uid]) fsNpcShow(N.uid); const M = fs.npcM[N.uid]; M.where = where; M.m.g.visible = where !== 'hide';
      if (where === 'lobby'){ M.m.g.position.set([-5, 5, -2.5][i], .05, [25, 25, 28][i]); M.m.g.rotation.y = [Math.PI / 2, -Math.PI / 2, Math.PI][i]; M.tgt = null; }
      if (where === 'room'){ const S = FS_ST[(i * 3 + 1) % FS_ST.length]; M.m.g.position.set(S.x + 1, .05, S.z); M.tgt = null; M.wait = .5 + i; } });
  }
  function fsNpcWander(dt){
    FS_NPCS.forEach(N => { const M = fs.npcM[N.uid]; if (!M || M.where !== 'room') return; const g = M.m.g;
      if (!M.tgt){ M.wait -= dt; if (M.wait <= 0){ const S = fsRand(FS_ST); M.tgt = {x: S.x + (Math.random() - .5) * 1.2, z: S.z + (Math.random() - .5) * 1.2}; } return; }
      const dx = M.tgt.x - g.position.x, dz = M.tgt.z - g.position.z, d = Math.hypot(dx, dz);
      if (d < .2){ M.tgt = null; M.wait = 2 + Math.random() * 3; fs.npcFit[N.uid] = fsNpcFit(N, fs.th, Math.min(.85, .2 + (1 - fs.t / fs.dl) * .7)); fsNpcShow(N.uid); return; }
      const sp = Math.min(d, 2.6 * dt); g.position.x += dx / d * sp; g.position.z += dz / d * sp; g.rotation.y = Math.atan2(dx, dz); });
  }
  /* --- per-frame --- */
  function fsNearest(){ let b = null, bd = 2.3; FS_ST.forEach(S => { const d = Math.hypot(P.x - S.x, P.z - S.z); if (d < bd){ bd = d; b = S.id; } }); return b; }
  function fashionUpdate(dt){
    if (!fs) return;
    if (fs.ph === 'dress' && !fs.ward){ const n = fsNearest(); if (n !== fs.near){ fs.near = n; const R = FS_RACKS.find(r => r[0] === n);
        if (R){ $('#fsNear').innerHTML = R[1] + ' ' + R[2] + ' <small>' + (pad.on ? 'Ⓧ' : touchUI ? 'tap' : 'E') + '</small>'; $('#fsNear').classList.add('show'); } else $('#fsNear').classList.remove('show'); } }
    else if (fs.near){ fs.near = null; $('#fsNear').classList.remove('show'); }
    if (fs.ph === 'walk') fsRateBar();
    if (fs.ph === 'intro'){ fs.introT += dt; const spin = fs.introT < 2, T = FS_THEMES[spin ? Math.floor(fs.introT * 12) % FS_THEMES.length : fs.th];
      $('#fsIntroT').textContent = T.emoji + ' ' + T.name; $('#fsIntroH').textContent = spin ? '🎲 Spinning the theme wheel...' : '💖 Voters love: ' + T.hint; $('#fsIntro').classList.toggle('lock', !spin); }
    if (fs.remote){ if (fs.ph === 'dress' && fs.fitDirty > 0){ fs.fitDirty -= dt; if (fs.fitDirty <= 0) fsSendFit(); }
      if (fs.ph === 'dress' || fs.ph === 'intro' || fs.ph === 'podium') fs.t = Math.max(0, fs.t - dt); if (fs.ph === 'walk') fs.wt += dt; return; }
    if (fs.ph === 'intro'){ fs.t -= dt; if (fs.t <= 0) fsBeginDress(); }
    else if (fs.ph === 'dress'){
      fs.t -= dt; if (!mp.on) fsNpcWander(dt);
      const all = mp.on ? fsBodies().every(u => fs.ready.has(u)) : fs.ready.has('H');
      if (fs.t <= 0 || all) fsBeginWalk();
    } else if (fs.ph === 'walk'){
      fs.wt += dt;
      fs.ord.forEach((u, k) => { if (!fs.done[u] && fs.wt >= (k + 1) * FS_WALK - .3){ fs.done[u] = true; if (!mp.on) fsJudgeWalker(u); } });
      if (fs.wt >= fs.ord.length * FS_WALK + .4) fsTally();
    } else if (fs.ph === 'podium'){ fs.t -= dt; if (fs.t <= 0) fsEndLocal(); }
  }
  function fashionAnimate(dt){
    if (!fs) return;
    const t = worldT;
    (fs.cones || []).forEach(g => { g.rotation.z = Math.sin(t * .8 + g.userData.ph) * .35; g.rotation.x = Math.cos(t * .6 + g.userData.ph) * .2; });
    fs.spots.forEach((b, i) => b.material.color.setHSL((t * .3 + i * .07) % 1, .9, .75));
    if (fsIsVip() && fs.ph === 'walk'){ const me = fs.walkers.find(W => W.u === fsUid() && W.m && W.m.g.visible); if (me){
      if (!fs.vipSpark){ fs.vipSpark = new THREE.Mesh(new THREE.TorusGeometry(.9, .05, 6, 20), new THREE.MeshBasicMaterial({color: '#ffd23f'})); fs.vipSpark.rotation.x = Math.PI / 2; scene.add(fs.vipSpark); }
      fs.vipSpark.visible = true; fs.vipSpark.position.copy(me.m.g.position); fs.vipSpark.position.y += .15; fs.vipSpark.rotation.z = t * 2;
    } else if (fs.vipSpark) fs.vipSpark.visible = false; }
    else if (fs.vipSpark) fs.vipSpark.visible = false;
    if (fs.star) fs.star.rotation.y = t * 1.5;
    if (fs.wheel && fs.ph === 'intro' && fs.introT < 2) fs.wheel.rotation.z = t * 12;
    if (!fs.judges.length && !mp.on){ FS_JUDGES.forEach((J, i) => { const m = buildPlayer(Object.assign({}, DEF, J.av)); m.g.position.set(-3.3 + i * 2.2, .05, 12.5); m.g.rotation.y = Math.PI; scene.add(m.g);
        const lab = label(J.emoji + ' ' + J.name, 'rgba(29,35,64,.75)'); lab.position.y = 3.75; m.g.add(lab); fs.judges.push({m, voteT: 0, lab}); }); }
    fs.judges.forEach((J, i) => { const cheer = J.voteT > 0; if (cheer) J.voteT -= dt; J.lab.visible = fs.ph !== 'walk';
      applyPose(dt, animPose('default', {state: cheer ? 'jump' : 'idle', t: t + i, ph: 0, sp: 0, air: cheer ? .3 : 0, jumped: cheer}), J.m); J.m.g.position.y = .05 + (cheer ? Math.abs(Math.sin(t * 8)) * .3 : 0); });
    Object.values(fs.npcM).forEach((M, i) => { if (!M.m.g.visible) return; const w = M.tgt && M.where === 'room'; M.ph += dt * 6; applyPose(dt, animPose('default', {state: w ? 'walk' : 'idle', t: t + i, ph: M.ph, sp: w ? .6 : 0}), M.m); });
    const z0 = -13.5, z1 = 7.2;
    fs.walkers.forEach((W, k) => { const M = W.m;
      if (fs.ph === 'podium' || fs.ph === 'end'){ const pi = fs.pod.indexOf(W.u); M.g.visible = true; W.lab.visible = true;
        if (pi >= 0){ M.g.position.set([0, -2.3, 2.3][pi], [1.3, .9, .55][pi] + .05, 30); M.g.rotation.y = Math.PI; applyPose(dt, FS_POSES[[1, 6, 0][pi]].p(t + k), M); }
        else { const o = fs.ord.filter(u => !fs.pod.includes(u)).indexOf(W.u); M.g.position.set((o % 2 ? 1 : -1) * (5.6 + (o >> 1) * 1.6), .05, 31.2); M.g.rotation.y = Math.PI; applyPose(dt, FS_POSES[0].p(t), M); }
        return; }
      const lt = fs.wt - k * FS_WALK; if (fs.ph !== 'walk' || lt < 0 || lt > FS_WALK){ M.g.visible = false; return; }
      M.g.visible = true; W.lab.visible = W.meVip || (lt > 3.2 && lt < 7); let z, ry = 0, p = null;
      if (lt < 3.2) z = z0 + (z1 - z0) * (lt / 3.2);
      else if (lt < 7){ z = z1; p = FS_POSES[fs.poses[W.u] != null ? fs.poses[W.u] : 0].p(lt - 3.2); }
      else { z = z1 - (lt - 7) * 10; ry = Math.PI; }
      M.g.position.set(0, .95, z); M.g.rotation.y = ry; W.ph += dt * 6;
      applyPose(dt, p ? Object.assign({lL: 0, lR: 0}, p) : animPose('default', {state: 'walk', t: t + k, ph: W.ph, sp: .7}), M);
      if (!W.shown && lt > .05){ W.shown = true; banner('👠 ' + (W.u === fsUid() ? 'Your turn! Pick a pose! ✨' : fsName(W.u) + ' hits the runway!')); }
    });
  }
  function fashionCam(){
    if (!fs || !(fs.ph === 'walk' || fs.ph === 'podium' || fs.ph === 'end')) return false;
    if (fs.ph === 'walk'){ let tx = 0, ty = 2.2, tz = 2; const k = Math.min(fs.walkers.length - 1, Math.floor(fs.wt / FS_WALK)), W = fs.walkers[k];
      if (W && W.m.g.visible){ tx = W.m.g.position.x; ty = W.m.g.position.y + 1.8; tz = W.m.g.position.z; }
      const lt = fs.wt - k * FS_WALK, close = lt > 3.2 && lt < 7;
      if (close) camera.position.set(2.2 + Math.sin(worldT * .4) * .8, 2.9, 11.2); else camera.position.set(4.2 + Math.sin(worldT * .25) * 1.2, 3.3, 9.9);
      camera.lookAt(tx, ty, tz); return true; }
    camera.position.set(Math.sin(worldT * .3) * 1.2, 3.4, 21.5); camera.lookAt(0, 2.4, 30); return true;
  }
  function fashionHud(){
    if (!fs) return;
    const ph = {lobby: '🏛️ Lobby', intro: '🎲 Theme!', dress: '👗 Dress up!', walk: '👠 Runway', podium: '🏆 Podium', end: '👑 Results'}[fs.ph] || '👗';
    if ($('#fsPh').textContent !== ph) $('#fsPh').textContent = ph;
    const T = FS_THEMES[fs.th], L = fsLevel(fsProg().xp), th = fs.ph === 'lobby' ? ' · ' + L.e + ' Lv ' + L.lv : ' · ' + T.emoji + ' ' + T.name;
    if ($('#fsThB').textContent !== th) $('#fsThB').textContent = th;
    $('#fsT').textContent = fs.ph === 'dress' || fs.ph === 'intro' || fs.ph === 'podium' ? fmt(Math.max(0, Math.ceil(fs.t))) : fs.ph === 'walk' ? Math.min(fs.ord.length, Math.floor(fs.wt / FS_WALK) + 1) + '/' + fs.ord.length : '—';
    if (fs.ph === 'dress' && fs.ward) $('#fsWardT').textContent = '⏱️ ' + fmt(Math.max(0, Math.ceil(fs.t)));
    // show the REAL Rublox coin balance (hud() otherwise overwrites #oCoins with runCoins, which is 0 here)
    $('#oCoins').textContent = coins;
  }
  function fsPad(jp){
    if (!fs) return false;
    if (fs.ph === 'lobby' && !fs.lobPanel && jp[2]){ fsPickOpen(); return true; }
    if (fs.ph === 'dress' && jp[2]){ if (fs.ward) fsWardClose(); else fsWardOpen(fs.near || null); return true; }
    if (fs.ph === 'walk'){ const u = fsCur();
      if (u && u === fsUid() && (jp[2] || jp[3])){ fsPose(((fs.poses[u] != null ? fs.poses[u] : fs.myPose) + (jp[2] ? 1 : FS_POSES.length - 1)) % FS_POSES.length); return true; }
      if (u && u !== fsUid() && (jp[14] || jp[15])){ const v = fs.rated[u] || 0; fsRate(jp[15] ? Math.min(5, v + 1) : Math.max(1, v - 1)); return true; } }
    return false;
  }
  function fsKey(e){
    if (!fs || e.repeat || paused) return false;
    if (e.code === 'KeyC' || e.code === 'KeyE'){ if (fs.ph === 'lobby' && !fs.lobPanel){ fsPickOpen(); return true; } if (fs.ph === 'dress'){ if (fs.ward) fsWardClose(); else fsWardOpen(e.code === 'KeyE' ? fs.near || null : null); return true; } }
    const d = /^Digit([1-7])$/.exec(e.code); if (d && fs.ph === 'walk'){ const u = fsCur(), n = +d[1]; if (u === fsUid()){ fsPose(n - 1); return true; } if (u && n <= 5) return fsRate(n); }
    return false;
  }
  function fashionEnter(){
    fsMigrateAvatar();
    fs.remote = mpGuest();
    if (fs.remote && mp.fsW) fashionFromHost(mp.fsW, true);
    if (fs.ph === 'lobby'){ fsToLobby(); fsPickOpen(); }
  }
  function fashionStop(){
    fsHideAll(); document.body.classList.remove('fsnotip');
    if (fs){ fsClearWalkers(); if (fs.vipSpark){ scene.remove(fs.vipSpark); fs.vipSpark = null; } try { if (model){ const g = model.g, pos = g.position.clone(), ry = g.rotation.y; scene.remove(g); model = buildPlayer(avatar); model.g.position.copy(pos); model.g.rotation.y = ry; scene.add(model.g); } } catch (e){} }
    fs = null;
  }
  /* --- multiplayer: the host runs the show; guests send outfits, ratings and poses --- */
  function fashionWire(){
    const w = {ph: fs.ph, n: fs.n, t: +fs.t.toFixed(1), wt: +fs.wt.toFixed(2), th: fs.th, ord: fs.ord, rd: [...fs.ready], dl: fs.dl, po: fs.poses};
    if (fs.ph === 'walk' || fs.ph === 'podium' || fs.ph === 'end'){ w.fits = fs.fits; w.fxs = fs.fxs; }
    if (fs.ph === 'podium' || fs.ph === 'end'){ w.res = fs.res; w.pod = fs.pod; }
    return w;
  }
  function fashionFromHost(w, entering){
    if (!w || typeof w !== 'object') return; mp.fsW = w;
    if (!(running && mode === 'fashion' && fs && fs.remote)) return;
    const S = a => Array.isArray(a) ? a.filter(u => typeof u === 'string').slice(0, 8) : [];
    const ph = ['lobby', 'intro', 'dress', 'walk', 'podium', 'end'].includes(w.ph) ? w.ph : 'lobby', n = w.n | 0;
    fs.th = Math.max(0, Math.min(FS_THEMES.length - 1, w.th | 0)); fs.ord = S(w.ord); fs.ready = new Set(S(w.rd)); if (FS_TIMES.includes(w.dl)) fs.dl = w.dl;
    if (w.po && typeof w.po === 'object') fs.ord.forEach(u => { const v = w.po[u]; if (Number.isInteger(v) && v >= 0 && v < FS_POSES.length && u !== fsUid()) fs.poses[u] = v; });
    if (w.fits && typeof w.fits === 'object') fs.ord.forEach(u => { const a = w.fits[u]; if (a && typeof a === 'object') fs.fits[u] = cleanAv(a); fs.fxs[u] = fsCleanFx(w.fxs && w.fxs[u]); });
    if (ph === 'lobby'){ if (fs.ph !== 'lobby' || entering){ fs.ph = 'lobby'; fsToLobby(); fsPickOpen(); } return; }
    const newRound = n !== fs.n; fs.n = n;
    if (ph === 'intro'){ fs.t = +w.t || 0; if (newRound || fs.ph !== 'intro'){ fs.ph = 'intro'; fsLocalIntro(); } return; }
    if (ph === 'dress'){ fs.t = +w.t || 0; if (newRound || fs.ph !== 'dress'){ fs.ph = 'dress'; fsLocalDress(); } return; }
    if (ph === 'walk'){ if (fs.ph !== 'walk' || newRound){ fs.ph = 'walk'; fs.wt = +w.wt || 0; fs.rated = {}; fsLocalWalk(); } else if (Math.abs(fs.wt - (+w.wt || 0)) > .4) fs.wt = +w.wt || 0; return; }
    const R = () => { fs.res = Array.isArray(w.res) ? w.res.filter(r => Array.isArray(r) && typeof r[0] === 'string').slice(0, 8).map(r => [r[0], Math.max(0, Math.min(50, r[1] | 0)), Math.max(0, r[2] | 0)]) : []; fs.pod = S(w.pod).slice(0, 3); };
    if (ph === 'podium'){ fs.t = +w.t || 0; if (fs.ph !== 'podium' || newRound){ R(); if (!fs.walkers.length) fsLocalWalk(); fs.ph = 'podium'; fsLocalPodium(); } return; }
    if (ph === 'end'){ R(); if (fs.ph !== 'end' || newRound){ if (!fs.walkers.length) fsLocalWalk(); fs.endShown = false; fsEndLocal(); } }
  }
  function fsGuestMsg(g, d){
    if (!fs || mode !== 'fashion' || !running) return;
    if (d.t === 'fsfit' && fs.ph === 'dress' && d.av && typeof d.av === 'object'){ fs.gfits[g.uid] = cleanAv(d.av); fs.gfx[g.uid] = fsCleanFx(d.fx); }
    else if (d.t === 'fsready' && fs.ph === 'dress') fs.ready.add(g.uid);
    else if (d.t === 'fspose' && Number.isInteger(d.i) && d.i >= 0 && d.i < FS_POSES.length) fs.poses[g.uid] = d.i;
    else if (d.t === 'fsrate' && fs.ph === 'walk' && typeof d.u === 'string' && fs.ord.includes(d.u) && d.u !== g.uid && Number.isInteger(d.n) && d.n >= 1 && d.n <= 5 && fsCur() === d.u) (fs.rates[g.uid] = fs.rates[g.uid] || {})[d.u] = d.n;
  }
