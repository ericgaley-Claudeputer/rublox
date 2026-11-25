#!/usr/bin/env python3
"""Inject t297u emotes + four new modes + hide/board/quest hooks. Idempotent."""
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
INDEX = ROOT / 'index.html'
DEV = ROOT / 'dev'

def must_find(hay, needle, label):
    if needle not in hay:
        raise SystemExit(f'missing hook ({label}): {needle[:160]!r}')
    return hay

def insert_after(hay, needle, extra, label, once_token=None):
    tok = once_token or extra.strip()[:48]
    if tok and tok in hay:
        return hay
    must_find(hay, needle, label)
    return hay.replace(needle, needle + extra, 1)

def insert_before(hay, needle, extra, label, once_token=None):
    tok = once_token or extra.strip()[:48]
    if tok and tok in hay:
        return hay
    must_find(hay, needle, label)
    return hay.replace(needle, extra + needle, 1)

def replace_once(hay, old, new, label):
    if new in hay and old not in hay:
        return hay
    if old not in hay:
        raise SystemExit(f'missing hook ({label}): {old[:160]!r}')
    return hay.replace(old, new, 1)

def read(rel):
    return (DEV / rel).read_text()

CSS = r'''
<style id="t297Css">
#t297Box{position:absolute;left:12px;right:12px;top:64px;z-index:6;pointer-events:none;text-align:center;display:none}
#t297Box #t297Hint{display:inline-block;background:rgba(29,35,64,.82);color:#fff;border-radius:999px;padding:6px 14px;font-weight:700;font-size:14px}
#t297Act{position:absolute;right:16px;bottom:96px;z-index:8;padding:12px 16px;font-size:18px;border:3px solid #1d2340;border-radius:16px;background:#ffd23f;font-weight:800;box-shadow:3px 3px 0 #1d2340;display:none}
#t297Act.show{display:block}
.cafemode #cafeBoardBtn,.cafemode #cafeDecorBtn,.fishmode #fishIndexBtn,.huntmode #huntMapBtn,.psmode #psVoteOpen{display:block}
#cafeBoardBtn,#cafeDecorBtn,#fishIndexBtn,#huntMapBtn,#psVoteOpen{position:absolute;z-index:8;right:16px;bottom:160px;padding:10px 14px;font-size:16px;border:3px solid #1d2340;border-radius:16px;background:#fff3e0;font-weight:800;box-shadow:3px 3px 0 #1d2340;display:none}
.cafemode #cafeDecorBtn{bottom:216px}
.t297overlay{position:fixed;inset:0;background:rgba(29,35,64,.45);z-index:240;display:none;align-items:center;justify-content:center;padding:max(74px,calc(env(safe-area-inset-top) + 62px)) 16px 16px}
.t297overlay.show{display:flex}
.t297box{position:relative;max-width:520px;width:100%;max-height:calc(100dvh - 96px);overflow:auto;background:#fff8ee;border:4px solid #1d2340;border-radius:20px;padding:16px;box-shadow:6px 6px 0 #1d2340}
.t297box h3{margin:0 0 8px}
.t297row{display:flex;gap:8px;align-items:center;justify-content:space-between;background:#fff;border:2px solid #1d2340;border-radius:12px;padding:8px 10px;margin:6px 0;font-weight:700}
.t297row.dim{opacity:.55}
.t297x{position:absolute;right:10px;top:8px;border:0;background:transparent;font-size:22px;font-weight:800;cursor:pointer}
#fishBar{display:none;position:absolute;left:50%;bottom:140px;transform:translateX(-50%);z-index:9;width:min(420px,80%);height:22px;background:#fff;border:3px solid #1d2340;border-radius:999px;overflow:hidden}
#fishBar.show{display:block}
#fishSweet{position:absolute;top:0;bottom:0;background:#2ec27e}
#fishCursor{position:absolute;top:-2px;bottom:-2px;width:6px;margin-left:-3px;background:#1d2340;border-radius:2px}
#cafeDecorList button{display:block;width:100%;margin:6px 0;padding:8px 10px;border:2px solid #1d2340;border-radius:12px;background:#fff;font-weight:800;text-align:left}
#psVoteBox .psvotes{display:flex;flex-wrap:wrap;gap:8px;justify-content:center;margin:12px 0}
#psVoteBox .psvotes button{width:44px;height:44px;border:3px solid #1d2340;border-radius:12px;background:#ffd23f;font-weight:800}
@media (max-width:700px){ .t297overlay{padding-top:max(84px,calc(env(safe-area-inset-top) + 68px))} #t297Act{bottom:120px} #cafeBoardBtn,#fishIndexBtn,#huntMapBtn,#psVoteOpen{bottom:184px} .cafemode #cafeDecorBtn{bottom:240px} }
</style>
'''

HUD = '''
  <div id="t297Box" style="display:none"><span id="t297Hint"></span></div>
  <button type="button" id="t297Act">✨ Do it</button>
  <button type="button" id="cafeBoardBtn">📋 Tickets</button>
  <button type="button" id="cafeDecorBtn">🪴 Decor</button>
  <button type="button" id="fishIndexBtn">📖 Index</button>
  <button type="button" id="huntMapBtn">🗺️ Map</button>
  <div id="fishBar" aria-hidden="true"><i id="fishSweet"></i><i id="fishCursor"></i></div>
'''

OVERLAYS = '''
  <div id="cafeBoard" class="t297overlay" role="dialog" aria-label="Cafe tickets">
    <div class="t297box">
      <button type="button" class="t297x" id="cafeBoardX" aria-label="Close">×</button>
      <h3>📋 Ticket board</h3>
      <p>Make each order at the matching station, then serve it at the counter.</p>
      <div id="cafeBoardList"></div>
    </div>
  </div>
  <div id="cafeDecor" class="t297overlay" role="dialog" aria-label="Cafe decor">
    <div class="t297box">
      <button type="button" class="t297x" id="cafeDecorX" aria-label="Close">×</button>
      <h3>🪴 Café decor</h3>
      <p>Spend coins you earned serving friends. These stay on this device.</p>
      <div id="cafeDecorList"></div>
    </div>
  </div>
  <div id="fishIndex" class="t297overlay" role="dialog" aria-label="Fish index">
    <div class="t297box">
      <button type="button" class="t297x" id="fishIndexX" aria-label="Close">×</button>
      <h3 id="fishIndexHead">📖 Fish Index</h3>
      <div id="fishIndexList"></div>
    </div>
  </div>
  <div id="huntMap" class="t297overlay" role="dialog" aria-label="Treasure map">
    <div class="t297box">
      <button type="button" class="t297x" id="huntMapX" aria-label="Close">×</button>
      <h3>🗺️ Today\'s Treasure Trail</h3>
      <p>A new map each local day. Dig at the landmark in the clue.</p>
      <div id="huntMapList"></div>
    </div>
  </div>
  <div id="psVoteBox" class="t297overlay" role="dialog" aria-label="Vote on the show">
    <div class="t297box">
      <button type="button" class="t297x" id="psVoteX" aria-label="Close">×</button>
      <h3>⭐ Score the show</h3>
      <p>Friends in this room can give a score from 1 to 10. No typing — just tap a number.</p>
      <div class="psvotes">''' + ''.join(f'<button type="button" data-psvote="{n}">{n}</button>' for n in range(1, 11)) + '''</div>
    </div>
  </div>
'''

GAMES = "  {id:'cafe', name:'Cozy Corner Café', emoji:'☕', tag:'Make drinks and treats, serve ticket orders, and decorate the café!', draw: drawCafe, playable: true, isNew: true},\n  {id:'fish', name:'Ripple Lake Fishing', emoji:'🎣', tag:'Cast, time the bite, and fill your fish index — ice fishing during the Snow Festival!', draw: drawFish, playable: true, isNew: true},\n  {id:'petshow', name:'Pet Talent Show', emoji:'🎭', tag:'Teach your pets tricks and perform for the judges — friends can score the show!', draw: drawPetShow, playable: true, isNew: true},\n  {id:'hunt', name:'Treasure Trail', emoji:'🗺️', tag:'A new clue map every day. Dig up chests around Compass Cove!', draw: drawHunt, playable: true, isNew: true},\n"

ACH = r'''
    {id:'emo-wave', cat:'collection', emoji:'👋', name:'Say Hello', desc:'Wave at someone with an emote.', coins:8, prove:s => !!(s.notes && s.notes['emo-wave'])},
    {id:'emo-sit', cat:'collection', emoji:'🪑', name:'Take a Seat', desc:'Sit anywhere with the sit emote.', coins:8, prove:s => !!(s.notes && s.notes['emo-sit'])},
    {id:'emo-all', cat:'collection', emoji:'😄', name:'Mood Ring', desc:'Try all 7 free emotes: wave, dance, sit, cheer, clap, laugh, and sleep.', coins:15, prove:s => !!(s.notes && s.notes['emo-all'])},
    {id:'hide-finds', cat:'adventure', emoji:'🔍', name:'I Spy', desc:'Find 5 hiders in Hide and Seek.', coins:12, prove:s => !!(s.hide && (s.hide.finds | 0) >= 5)},
    {id:'hide-safe', cat:'adventure', emoji:'🏃', name:'Still Hidden', desc:'Win Hide and Seek as a hider.', coins:12, prove:s => !!(s.notes && s.notes['hide-safe']) || !!(s.hide && (s.hide.wins | 0) >= 1 && (s.hide.safe | 0) >= 1)},
    {id:'cafe-first', cat:'adventure', emoji:'☕', name:'First Service', desc:'Serve a ticket at Cozy Corner Café.', coins:10, prove:s => !!(s.notes && s.notes['cafe-first']) || !!(s.cafe && (s.cafe.served | 0) >= 1)},
    {id:'cafe-20', cat:'adventure', emoji:'🧁', name:'Busy Shift', desc:'Serve 20 café tickets.', coins:18, prove:s => !!(s.cafe && (s.cafe.served | 0) >= 20)},
    {id:'cafe-decor', cat:'creative', emoji:'🪴', name:'Cozy Corners', desc:'Buy a décor item for the café.', coins:10, prove:s => !!(s.notes && s.notes['cafe-decor']) || !!(s.cafe && s.cafe.decor && s.cafe.decor.length >= 1)},
    {id:'fish-first', cat:'adventure', emoji:'🎣', name:'First Catch', desc:'Catch a fish at Ripple Lake.', coins:10, prove:s => !!(s.notes && s.notes['fish-first']) || !!(s.fish && (s.fish.total | 0) >= 1)},
    {id:'fish-rare', cat:'adventure', emoji:'🌟', name:'Rare Bite', desc:'Catch a rare or legendary fish.', coins:15, prove:s => !!(s.notes && s.notes['fish-rare'])},
    {id:'fish-index', cat:'collection', emoji:'📖', name:'Lake Journal', desc:'Catch 10 different kinds of fish.', coins:20, prove:s => !!(s.fish && s.fish.caught && Object.keys(s.fish.caught).length >= 10)},
    {id:'fish-ice', cat:'season', emoji:'🧊', name:'Ice Angler', desc:'Go ice fishing during the Snow Festival.', coins:12, prove:s => !!(s.notes && s.notes['fish-ice'])},
    {id:'ps-teach', cat:'pets', emoji:'🐾', name:'Trick Teacher', desc:'Teach a pet a trick.', coins:10, prove:s => !!(s.notes && s.notes['ps-teach'])},
    {id:'ps-show', cat:'pets', emoji:'🎭', name:'Center Stage', desc:'Finish a Pet Talent Show routine.', coins:12, prove:s => !!(s.petshow && (s.petshow.shows | 0) >= 1) || !!(s.notes && s.notes['ps-show'])},
    {id:'ps-gold', cat:'pets', emoji:'🥇', name:'Gold Ribbon', desc:'Earn a gold ribbon at the Pet Talent Show.', coins:18, prove:s => !!(s.petshow && s.petshow.ribbons && (s.petshow.ribbons.gold | 0) >= 1)},
    {id:'hunt-first', cat:'adventure', emoji:'📦', name:'First Clue', desc:'Dig up a chest on the Treasure Trail.', coins:10, prove:s => !!(s.notes && s.notes['hunt-first']) || !!(s.hunt && (s.hunt.found && s.hunt.found.length))},
    {id:'hunt-map', cat:'adventure', emoji:'💎', name:'Map Master', desc:'Finish a daily Treasure Trail map.', coins:15, prove:s => !!(s.hunt && (s.hunt.maps | 0) >= 1)},
    {id:'hunt-week', cat:'adventure', emoji:'🗺️', name:'Trail Regular', desc:'Finish 3 daily treasure maps.', coins:20, prove:s => !!(s.hunt && (s.hunt.maps | 0) >= 3)},
'''

QUESTS = """    {id: 'hide-play', ev: 'play:hide', title: 'Count to Ten', desc: 'Play a game of Hide and Seek.', emoji: '🙈', goal: 1, reward: 15},
    {id: 'cafe-serve', ev: 'cafe-serve', title: 'Café Shift', desc: 'Serve 3 tickets at Cozy Corner Café.', emoji: '☕', goal: 3, reward: 20},
    {id: 'fish-catch', ev: 'fish-catch', title: 'Go Fish', desc: 'Catch 2 fish at Ripple Lake.', emoji: '🎣', goal: 2, reward: 20},
    {id: 'ps-trick', ev: 'ps-trick', title: 'New Trick', desc: 'Teach a pet a trick.', emoji: '🐾', goal: 1, reward: 15},
    {id: 'hunt-chest', ev: 'hunt-chest', title: 'X Marks the Spot', desc: 'Dig up a chest on the Treasure Trail.', emoji: '🗺️', goal: 1, reward: 20},
    {id: 'emote-play', ev: 'emote-use', title: 'Strike a Pose', desc: 'Use any emote 3 times.', emoji: '😄', goal: 3, reward: 10},
"""

ROWS = """    {id: 'hide-wins', name: 'Hide and Seek — wins', emoji: '🙈', kind: 'high', unit: ''},
    {id: 'hide-finds', name: 'Hide and Seek — finds', emoji: '🔍', kind: 'high', unit: ''},
    {id: 'cafe-served', name: 'Cozy Corner Café — served', emoji: '☕', kind: 'high', unit: ''},
    {id: 'fish-kinds', name: 'Ripple Lake — kinds caught', emoji: '🎣', kind: 'high', unit: ''},
    {id: 'fish-biggest', name: 'Ripple Lake — biggest fish', emoji: '🐟', kind: 'high', unit: 'cm'},
    {id: 'ps-best', name: 'Pet Talent Show — best score', emoji: '🎭', kind: 'high', unit: ''},
    {id: 'hunt-maps', name: 'Treasure Trail — maps finished', emoji: '🗺️', kind: 'high', unit: ''}
"""

SNAP = """    const hide = saves.hide || {};
    set('hide-wins', hide.wins | 0 ? (hide.wins | 0) : null);
    set('hide-finds', hide.finds | 0 ? (hide.finds | 0) : null);
    const cafeS = saves.cafe || {};
    set('cafe-served', cafeS.served | 0 ? (cafeS.served | 0) : (cafeS.best | 0 ? (cafeS.best | 0) : null));
    const fishS = saves.fish || {};
    const kinds = fishS.caught && typeof fishS.caught === 'object' ? Object.keys(fishS.caught).length : 0;
    set('fish-kinds', kinds || null);
    set('fish-biggest', fishS.biggest ? +fishS.biggest : null);
    const psS = saves.petshow || {};
    set('ps-best', psS.best ? +psS.best : null);
    const huntS = saves.hunt || {};
    set('hunt-maps', huntS.maps | 0 ? (huntS.maps | 0) : null);
"""

MODES = "'cafe', 'fish', 'petshow', 'hunt'"

def patch_lists(html):
    html = replace_once(
        html,
        "'lantern', 'party', 'snowfest'].includes(m)",
        "'lantern', 'party', 'snowfest', 'cafe', 'fish', 'petshow', 'hunt'].includes(m)",
        'start whitelist',
    )
    html = replace_once(
        html,
        "mode === 'party' || mode === 'snowfest' ? null : d",
        "mode === 'party' || mode === 'snowfest' || mode === 'cafe' || mode === 'fish' || mode === 'petshow' || mode === 'hunt' ? null : d",
        'diff null',
    )
    html = replace_once(
        html,
        "|| mode === 'party' || mode === 'snowfest') && (B.onGround",
        "|| mode === 'party' || mode === 'snowfest' || mode === 'cafe' || mode === 'fish' || mode === 'petshow' || mode === 'hunt') && (B.onGround",
        'walk-up',
    )
    html = replace_once(
        html,
        "|| mode === 'party' || mode === 'snowfest'){ // pull the camera",
        "|| mode === 'party' || mode === 'snowfest' || mode === 'cafe' || mode === 'fish' || mode === 'petshow' || mode === 'hunt'){ // pull the camera",
        'cam clip',
    )
    html = replace_once(
        html,
        "&& mode !== 'party' && mode !== 'snowfest')",
        "&& mode !== 'party' && mode !== 'snowfest' && mode !== 'cafe' && mode !== 'fish' && mode !== 'petshow' && mode !== 'hunt')",
        'default clouds',
    )
    html = replace_once(
        html,
        "if (mode === 'snowfest') buildSnowFest(); else if (mode === 'party') buildParty();",
        "if (mode === 'cafe') buildCafe(); else if (mode === 'fish') buildFish(); else if (mode === 'petshow') buildPetShow(); else if (mode === 'hunt') buildHunt(); else if (mode === 'snowfest') buildSnowFest(); else if (mode === 'party') buildParty();",
        'build chain',
    )
    html = insert_after(
        html,
        "if (mode === 'snowfest') snowfestEnter();\n",
        "    if (mode === 'cafe') cafeEnter();\n    if (mode === 'fish') fishEnter();\n    if (mode === 'petshow') psEnter();\n    if (mode === 'hunt') huntEnter();\n"
        "    try { if (typeof qNoteEv === 'function') qNoteEv('play', {mode: mode}); } catch (e){}\n"
        "    { const _tbox = document.getElementById('t297Box'); if (_tbox) _tbox.style.display = ['cafe','fish','petshow','hunt'].includes(mode) ? '' : 'none'; }\n"
        "    $('#obby').classList.toggle('cafemode', mode === 'cafe');\n"
        "    $('#obby').classList.toggle('fishmode', mode === 'fish');\n"
        "    $('#obby').classList.toggle('psmode', mode === 'petshow');\n"
        "    $('#obby').classList.toggle('huntmode', mode === 'hunt');\n",
        'enter chain',
        once_token='if (mode === \'cafe\') cafeEnter();',
    )
    html = replace_once(
        html,
        "if (evg) snowfestStop(); if (py) partyStop();",
        "if (evg) snowfestStop(); if (typeof t297Stop === 'function') t297Stop(); if (py) partyStop();",
        'stop chain',
    )
    html = insert_after(
        html,
        "if (evg) snowfestUpdate(dt); if (py) partyUpdate(dt);",
        " if (typeof t297Update === 'function') t297Update(dt);",
        'update chain',
        once_token='t297Update(dt)',
    )
    html = insert_before(
        html,
        "      if (mode === 'snowfest' && evg && snowfestKey(e)) return;\n",
        "      if (['cafe','fish','petshow','hunt'].includes(mode) && typeof t297Key === 'function' && t297Key(e)) return;\n",
        'key hook',
        once_token="t297Key(e)",
    )
    html = insert_before(
        html,
        "    if (mode === 'snowfest' && evg && snowfestPad(jp)) return;\n",
        "    if (['cafe','fish','petshow','hunt'].includes(mode) && typeof t297Pad === 'function' && t297Pad(jp)) return;\n",
        'pad hook',
        once_token="t297Pad(jp)",
    )
    html = replace_once(
        html,
        "  const WX_SKIP = ['splash', 'waterpark', 'race', 'photostudio', 'dance', 'bakery', 'icecream', 'tower', 'fashion'];",
        "  const WX_SKIP = ['splash', 'waterpark', 'race', 'photostudio', 'dance', 'bakery', 'icecream', 'tower', 'fashion', 'cafe', 'petshow'];",
        'wx skip',
    )
    html = replace_once(
        html,
        "  const WX_SNOW = ['obby', 'build', 'hide', 'stable', 'tag', 'party', 'snowfest', 'pets', 'autumn', 'pethotel'];",
        "  const WX_SNOW = ['obby', 'build', 'hide', 'stable', 'tag', 'party', 'snowfest', 'pets', 'autumn', 'pethotel', 'fish', 'hunt'];",
        'wx snow',
    )
    html = replace_once(
        html,
        "  const WX_RAIN = ['obby', 'build', 'lantern', 'hide', 'autumn', 'stable', 'petisland', 'pets', 'tag', 'dreamhouse', 'pethotel', 'haunt'];",
        "  const WX_RAIN = ['obby', 'build', 'lantern', 'hide', 'autumn', 'stable', 'petisland', 'pets', 'tag', 'dreamhouse', 'pethotel', 'haunt', 'fish', 'hunt'];",
        'wx rain',
    )
    html = replace_once(
        html,
        "  const WX_FOG = ['haunt', 'lantern', 'hide', 'petisland', 'obby', 'build'];",
        "  const WX_FOG = ['haunt', 'lantern', 'hide', 'petisland', 'obby', 'build', 'hunt'];",
        'wx fog',
    )
    return html

def patch_emotes(html):
    old = """const EMOTES = {
  wave:  {key:1, emoji:'👋', name:'Wave',  price:75,  dur:2.6},
  dance: {key:2, emoji:'💃', name:'Dance', price:150, dur:Infinity},
  cheer: {key:3, emoji:'🙌', name:'Cheer', price:100, dur:2.6},
  sit:   {key:4, emoji:'🪑', name:'Sit',   price:75,  dur:Infinity},
  flip:  {key:5, emoji:'🍳', name:'Burger Flip',   price:150, dur:2.2},
  groan: {key:6, emoji:'😩', name:'Awkward Groan', price:100, dur:2.8},
  facepalm: {key:7, emoji:'🤦', name:'Big Facepalm', price:100, dur:2.4},
  skate: {key:8, emoji:'🛹', name:'Skate Trick',  price:150, dur:2.4},
};"""
    new = """const EMOTES = (typeof EmoRules !== 'undefined' && EmoRules.emoMerge) ? EmoRules.emoMerge() : {
  wave:  {key:1, emoji:'👋', name:'Wave',  price:0, dur:2.6},
  dance: {key:2, emoji:'💃', name:'Dance', price:0, dur:Infinity},
  sit:   {key:3, emoji:'🪑', name:'Sit',   price:0, dur:Infinity},
  cheer: {key:4, emoji:'🙌', name:'Cheer', price:0, dur:2.6},
  clap:  {key:5, emoji:'👏', name:'Clap',  price:0, dur:2.4},
  laugh: {key:6, emoji:'😄', name:'Laugh', price:0, dur:2.6},
  sleep: {key:7, emoji:'😴', name:'Sleep', price:0, dur:Infinity},
  flip:  {key:9, emoji:'🍳', name:'Burger Flip',   price:150, dur:2.2},
  groan: {key:0, emoji:'😩', name:'Awkward Groan', price:100, dur:2.8},
  facepalm: {key:null, emoji:'🤦', name:'Big Facepalm', price:100, dur:2.4},
  skate: {key:8, emoji:'🛹', name:'Skate Trick',  price:150, dur:2.4},
};"""
    html = replace_once(html, old, new, 'EMOTES catalog')
    html = insert_before(
        html,
        "  return p;\n}\n// looping \"show off\" cycle for shop previews",
        "  else if (id === 'clap'){ p.aL = p.aR = -1.1 + Math.sin(t*16)*.55; p.aLo = p.aRo = 1.1; p.hz = Math.sin(t*8)*.08; }\n"
        "  else if (id === 'laugh'){ p.aLo = p.aRo = .4 + Math.sin(t*10)*.2; p.y = Math.abs(Math.sin(t*10))*.12; p.tilt = Math.sin(t*8)*.18; p.hz = -.15 + Math.sin(t*10)*.1; p.lean = .08; }\n"
        "  else if (id === 'sleep'){ p.y = -.72; p.lL = p.lR = -1.57; p.aL = p.aR = .3; p.hz = .45; p.lean = .12; }\n",
        'emote poses',
        once_token="id === 'clap'",
    )
    html = replace_once(
        html,
        "    if (!owned.has('emote-' + id)){ banner('🔒 Get the ' + E.name + ' emote in the 🛍️ Shop!'); return; }",
        "    const emoOk = (typeof EmoRules !== 'undefined' && EmoRules.emoAllowed) ? EmoRules.emoAllowed(id, owned) : (E.price === 0 || owned.has('emote-' + id));\n"
        "    if (!emoOk){ banner('🔒 Get the ' + E.name + ' emote in the 🛍️ Shop!'); return; }\n"
        "    if (emote && emote.id === id){ emote = null; return; }",
        'playEmote allow free',
    )
    html = insert_after(
        html,
        "    emote = {id, t: 0}; P.vx = P.vz = 0;\n  }",
        "\n    try { if (typeof qNoteHook === 'function') qNoteHook('emote-use', 1); if (typeof achNote === 'function'){ achNote('emo-' + id); const need = (typeof EmoRules !== 'undefined' && EmoRules.EMO_FREE) ? EmoRules.EMO_FREE : ['wave','dance','sit','cheer','clap','laugh','sleep']; if (need.every(k => ach.notes && ach.notes['emo-' + k])) achNote('emo-all'); } } catch (e){}\n  }",
        'emote notes',
        once_token="qNoteHook('emote-use'",
    )
    # careful: the insert_after also duplicated the closing brace logic - playEmote ends with emote=...; }. I appended after that closing. Good.
    html = replace_once(
        html,
        "$('#oEmos').innerHTML = Object.entries(EMOTES).map(([id, E]) => `<button data-emote=\"${id}\" class=\"${owned.has('emote-' + id) ? '' : 'lock'}\">${owned.has('emote-' + id) ? E.emoji : '🔒'} ${E.name} <small>${E.key}</small></button>`).join('');",
        "$('#oEmos').innerHTML = Object.entries(EMOTES).map(([id, E]) => { const ok = (typeof EmoRules !== 'undefined' && EmoRules.emoAllowed) ? EmoRules.emoAllowed(id, owned) : (E.price === 0 || owned.has('emote-' + id)); const key = E.key ? E.key : '★'; return `<button data-emote=\"${id}\" class=\"${ok ? '' : 'lock'}\">${ok ? E.emoji : '🔒'} ${E.name} <small>${key}</small></button>`; }).join('');",
        'emote menu',
    )
    old_pad = """    if (jp[2]){ buildEmoteMenu(); $('#oEmos').classList.add('show'); return; }
    if (jp[4] || jp[5]){
      const mine = Object.keys(EMOTES).filter(id => owned.has('emote-' + id));
      if (!mine.length){ banner('🔒 Get emotes in the 🛍️ Shop!'); return; }
      pad.emo = ((pad.emo < 0 ? (jp[5] ? -1 : 0) : pad.emo) + (jp[5] ? 1 : -1) + mine.length) % mine.length;
      const id = mine[pad.emo]; playEmote(id); banner(EMOTES[id].emoji + ' ' + EMOTES[id].name);
    }"""
    new_pad = """    const wheel = $('#oEmos') && $('#oEmos').classList.contains('show');
    if (jp[8]){ buildEmoteMenu(); $('#oEmos').classList.toggle('show'); return; }   // View / Back — does not clash with A/X/LB/RB
    if (wheel){
      const mine = Object.keys(EMOTES).filter(id => (typeof EmoRules !== 'undefined' && EmoRules.emoAllowed) ? EmoRules.emoAllowed(id, owned) : (EMOTES[id].price === 0 || owned.has('emote-' + id)));
      if (jp[1] || jp[13]){ $('#oEmos').classList.remove('show'); return; }
      if (mine.length && (jp[14] || jp[15] || jp[12] || jp[0])){
        pad.emo = ((pad.emo < 0 ? 0 : pad.emo) + (jp[15] || jp[12] ? 1 : jp[14] ? -1 : 0) + mine.length) % mine.length;
        const id = mine[pad.emo];
        const btns = $('#oEmos').querySelectorAll('button');
        btns.forEach((b, i) => b.classList.toggle('on', i === pad.emo));
        if (jp[0] || jp[12]){ playEmote(id); banner(EMOTES[id].emoji + ' ' + EMOTES[id].name); }
        return;
      }
      if (jp[0] || jp[1] || jp[12] || jp[13] || jp[14] || jp[15]) return;
    }"""
    html = replace_once(html, old_pad, new_pad, 'pad emote map')
    html = replace_once(
        html,
        "    if (emote){ emote.t += dt; if (emote.t > EMOTES[emote.id].dur || (!P.onGround && P.airT > .25)) emote = null; }",
        "    if (emote){ emote.t += dt; const moving = Math.hypot(P.vx, P.vz) > 0.45 || (!P.onGround && P.airT > .25);\n"
        "      const cancelMove = (typeof EmoRules !== 'undefined' && EmoRules.emoCancelOnMove) ? EmoRules.emoCancelOnMove(emote.id) : (emote.id === 'sit' || emote.id === 'sleep' || emote.id === 'dance');\n"
        "      if (emote.t > EMOTES[emote.id].dur || (moving && cancelMove) || (!P.onGround && P.airT > .25)) emote = null; }",
        'cancel sit on move',
    )
    html = replace_once(
        html,
        "<span><i class=\"bx\">X</i>Emote wheel (Build: build/delete · Pets: pet / use)</span>",
        "<span><i>View</i>Emote wheel (then D-pad to pick, A to play, B to close)</span>",
        'help X',
    )
    html = replace_once(
        html,
        "<span><i>LB RB</i>Quick emotes (Build: pick block · Pets: LB 🍖 feed, RB 🎾 throw)</span>",
        "<span><i>LB RB</i>Build: pick block · Pets: LB 🍖 feed, RB 🎾 throw</span>",
        'help LB',
    )
    html = replace_once(
        html,
        "· Ⓧ emotes · LT/RT zoom · ☰ pause';",
        "· View emotes · LT/RT zoom · ☰ pause';",
        'padTip emotes',
    )
    html = replace_once(
        html,
        'title="Emotes (keys 1-8)"',
        'title="Emotes (keys 1-7, 8 if unlocked, or View on a controller)"',
        'emo btn title',
    )
    return html

def patch_data(html):
    html = insert_after(
        html,
        "    {id: 'dance-play', ev: 'play:dance', title: 'Hit the Beat', desc: 'Play Bossa Beat Dance Battle.', emoji: '💃', goal: 1, reward: 15}\n  ];",
        "\n" + QUESTS + "  ];",
        'quest pool',
        once_token="id: 'hide-play'",
    )
    # The above might have broken the array if it duplicated ]; — check later
    html = insert_after(
        html,
        "    {id: 'snow-skate', name: 'Ice rink — best score', emoji: '⛸️', kind: 'high', unit: ''}\n  ];",
        ",\n" + ROWS + "  ];",
        'lb rows',
        once_token="id: 'hide-wins'",
    )
    html = insert_after(
        html,
        "    set('snow-skate', sb.skate != null ? sb.skate : board.best['snow-skate']);\n",
        SNAP,
        'lb snapshot',
        once_token="set('hide-wins'",
    )
    html = replace_once(
        html,
        "      season: L('rubloxSeason', null),\n      board: evStateOrBoard()",
        "      season: L('rubloxSeason', null),\n      hide: L('rubloxHide', null),\n      cafe: L('rubloxCafe', null),\n      fish: L('rubloxFish', null),\n      petshow: L('rubloxPetShow', null),\n      hunt: L('rubloxHunt', null),\n      board: evStateOrBoard()",
        'lbSaves',
    )
    html = insert_after(
        html,
        "      water: L('rubloxWaterPark', null),\n",
        "      season: L('rubloxSeason', null),\n      cafe: L('rubloxCafe', null),\n      fish: L('rubloxFish', null),\n      petshow: L('rubloxPetShow', null),\n      hunt: L('rubloxHunt', null),\n",
        'ach snapshot',
        once_token="fish: L('rubloxFish'",
    )
    html = insert_after(
        html,
        "{id:'hide-win', cat:'adventure', emoji:'🙈', name:'Found You', desc:'Win a game of Hide and Seek.', coins:15, prove:s => !!(s.hide && (s.hide.wins | 0) >= 1)},\n",
        ACH,
        'achievements',
        once_token="id:'emo-wave'",
    )
    html = insert_after(
        html,
        "    if ((was === 'safe' && hs.win === 'hide') || (hs.win === 'seek' && hsSeeker(me))) hs.sv.wins++; hs.sv.finds += mine; save('rubloxHide', hs.sv);\n",
        "    if (was === 'safe' && hs.win === 'hide') hs.sv.safe = (hs.sv.safe | 0) + 1;\n"
        "    try { if (typeof qNoteHook === 'function'){ qNoteHook('hide-win', iWin ? 1 : 0); if (mine) qNoteHook('hide-find', mine); } } catch (e){}\n"
        "    try { if (typeof lbRecord === 'function'){ if (hs.sv.wins) lbRecord('hide-wins', hs.sv.wins); if (hs.sv.finds) lbRecord('hide-finds', hs.sv.finds); } } catch (e){}\n"
        "    try { if (was === 'safe' && hs.win === 'hide' && typeof achNote === 'function') achNote('hide-safe'); } catch (e){}\n",
        'hide end hooks',
        once_token="lbRecord('hide-wins'",
    )
    html = insert_after(
        html,
        "    else if (d.t === 'lb'){ try { if (typeof lbFromGuest === 'function') lbFromGuest(g, d); } catch (e){} }",
        "\n    else if (d.t === 'ps'){ try { if (typeof psFromNet === 'function') psFromNet(g, d); } catch (e){} }",
        'mp ps vote',
        once_token="d.t === 'ps'",
    )
    html = insert_after(
        html,
        "    evShop: () => { if (typeof evOpenShop === 'function') evOpenShop(true); },",
        "\n    emoWheel: () => { try { buildEmoteMenu(); const w = document.getElementById('oEmos'); if (w) w.classList.add('show'); } catch (e){} },\n"
        "    fishIndex: () => { try { if (typeof fishToggleIndex === 'function') fishToggleIndex(true); } catch (e){} },\n"
        "    huntMap: () => { try { if (typeof huntToggleMap === 'function') huntToggleMap(true); } catch (e){} },\n"
        "    cafeBoard: () => { try { if (typeof cafeToggle === 'function') cafeToggle('cafeBoardBtn'); } catch (e){} },\n"
        "    hideStart: () => { try { if (typeof hsStart === 'function') hsStart(); } catch (e){} },\n",
        'debug hooks',
        once_token='emoWheel:',
    )
    # qNoteEv array bug
    html = replace_once(
        html,
        "    qNoteHook(evs, 1);",
        "    evs.forEach(evName => qNoteHook(evName, 1));",
        'qNoteEv array',
    )
    return html

def patch_sidecars():
    wr = DEV / 'weather' / 'weather_rules.js'
    if wr.exists():
        t = wr.read_text()
        t = t.replace(
            "const WX_SKIP = ['splash', 'waterpark', 'race', 'photostudio', 'dance', 'bakery', 'icecream', 'tower', 'fashion'];",
            "const WX_SKIP = ['splash', 'waterpark', 'race', 'photostudio', 'dance', 'bakery', 'icecream', 'tower', 'fashion', 'cafe', 'petshow'];",
        )
        t = t.replace(
            "const WX_SNOW = ['obby', 'build', 'hide', 'stable', 'tag'];",
            "const WX_SNOW = ['obby', 'build', 'hide', 'stable', 'tag', 'party', 'snowfest', 'pets', 'autumn', 'pethotel', 'fish', 'hunt'];",
        )
        # live file already has party/snowfest in snow - handle both
        t = t.replace(
            "const WX_SNOW = ['obby', 'build', 'hide', 'stable', 'tag', 'party', 'snowfest', 'pets', 'autumn', 'pethotel'];",
            "const WX_SNOW = ['obby', 'build', 'hide', 'stable', 'tag', 'party', 'snowfest', 'pets', 'autumn', 'pethotel', 'fish', 'hunt'];",
        )
        t = t.replace(
            "const WX_RAIN = ['obby', 'build', 'lantern', 'hide', 'autumn', 'stable', 'petisland', 'pets', 'tag', 'dreamhouse', 'pethotel', 'haunt'];",
            "const WX_RAIN = ['obby', 'build', 'lantern', 'hide', 'autumn', 'stable', 'petisland', 'pets', 'tag', 'dreamhouse', 'pethotel', 'haunt', 'fish', 'hunt'];",
        )
        t = t.replace(
            "const WX_FOG = ['haunt', 'lantern', 'hide', 'petisland', 'obby', 'build'];",
            "const WX_FOG = ['haunt', 'lantern', 'hide', 'petisland', 'obby', 'build', 'hunt'];",
        )
        wr.write_text(t)
    bl = DEV / 'board' / 'board_logic.js'
    t = bl.read_text()
    if "id: 'hide-wins'" not in t:
        t = t.replace(
            "    {id: 'snow-skate', name: 'Ice rink — best score', emoji: '⛸️', kind: 'high', unit: ''}\n  ];",
            "    {id: 'snow-skate', name: 'Ice rink — best score', emoji: '⛸️', kind: 'high', unit: ''},\n" + ROWS + "  ];",
        )
        t = t.replace(
            "    set('snow-skate', sb.skate != null ? sb.skate : board.best['snow-skate']);\n",
            "    set('snow-skate', sb.skate != null ? sb.skate : board.best['snow-skate']);\n" + SNAP,
        )
        bl.write_text(t)

def main():
    html = INDEX.read_text()
    if 'id="t297Css"' not in html:
        html = insert_before(html, '<style id="evLbCss">', CSS, 'css', once_token='id="t297Css"')
    if 'id="t297Box"' not in html:
        html = insert_after(html, '<div class="otip" id="oTip"></div>\n', HUD, 'hud', once_token='id="t297Box"')
    if 'id="cafeBoard"' not in html:
        # overlays after ev shop / before qPanel if present, else after </main>
        if '<div id="evShop"' in html:
            # place after evShop block — find qPanel
            html = insert_before(html, '  <div id="qPanel"', OVERLAYS, 'overlays', once_token='id="cafeBoard"')
        else:
            html = insert_after(html, '</main>', '\n' + OVERLAYS, 'overlays', once_token='id="cafeBoard"')
    if "id:'cafe'" not in html.split('const GAMES')[1][:2500] if 'const GAMES' in html else '':
        html = insert_after(html, "  {id:'snowfest', name:'Snow Festival',", "\n" + GAMES + "  {id:'snowfest', name:'Snow Festival',", 'games', once_token="id:'cafe'")
        # oops that might have broken the snowfest line - we prepended GAMES then repeated snowfest start
        # actually insert_after puts extra AFTER the needle, so we'd get snowfest start + GAMES + snowfest start again. BAD.
        pass

    # Fix games insert properly if we messed up or skip if already done
    if "name:'Cozy Corner Café'" not in html:
        html = replace_once(
            html,
            "  {id:'snowfest', name:'Snow Festival',",
            GAMES + "  {id:'snowfest', name:'Snow Festival',",
            'games cards',
        )

    if 'function drawCafe' not in html:
        html = insert_before(html, 'function drawSnowFest(ctx){', read('t297/draw.js') + '\n', 'draw', once_token='function drawCafe')

    logic = '\n'.join([
        read('t297/emote_logic.js'),
        read('t297/cafe_logic.js'),
        read('t297/fish_logic.js'),
        read('t297/petshow_logic.js'),
        read('t297/hunt_logic.js'),
    ])
    if 'EmoRules' not in html or "const CAFE_KEY = 'rubloxCafe'" not in html:
        html = insert_before(html, 'const GAMES = [', logic + '\n', 'rules', once_token="const CAFE_KEY = 'rubloxCafe'")

    if 'function buildCafe()' not in html:
        html = insert_before(html, '  function stop(', read('t297/runtime.js') + '\n', 'runtime', once_token='function buildCafe()')

    html = patch_lists(html)
    html = patch_emotes(html)
    html = patch_data(html)
    patch_sidecars()
    INDEX.write_text(html)
    print('injected t297u, bytes', len(html))

if __name__ == '__main__':
    main()
