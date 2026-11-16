#!/usr/bin/env python3
"""Inject Snow Festival + Leaderboard into index.html. Idempotent."""
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
INDEX = ROOT / 'index.html'
DEV = ROOT / 'dev'

def must_find(hay, needle, label):
    if needle not in hay:
        raise SystemExit(f'missing hook ({label}): {needle[:140]!r}')
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
        raise SystemExit(f'missing hook ({label}): {old[:140]!r}')
    return hay.replace(old, new, 1)

CSS = r'''
<style id="evLbCss">
html.snowfest-on body, body.snowfest-on{ background-image: none; }
#evSnowLayer{display:none;pointer-events:none;position:fixed;inset:0;z-index:40;overflow:hidden}
html.snowfest-on #evSnowLayer, body.snowfest-on #evSnowLayer{display:block}
#evSnowLayer i{position:absolute;top:-20px;color:#fff;text-shadow:0 0 4px rgba(180,210,255,.8);animation:evFall linear infinite}
@keyframes evFall{0%{transform:translateY(-10px) rotate(0)}100%{transform:translateY(110vh) rotate(360deg)}}
html.snowfest-on #hero{background:linear-gradient(160deg,#8eb7e8,#eaf4ff 55%,#fff);border-color:#8eb7e8}
#evBanner{display:none;margin:12px 0 0;padding:14px 16px;border:3px solid #1d2340;border-radius:16px;background:#eaf4ff;box-shadow:3px 3px 0 #1d2340}\nhtml.snowfest-on #evBanner, body.snowfest-on #evBanner{display:block}
#evBanner h3{margin:0 0 4px;font-size:20px}
#evBanner p{margin:0 0 8px}
#evChip{display:none;margin-left:6px}\nhtml.snowfest-on #evChip, body.snowfest-on #evChip{display:inline-flex;align-items:center;gap:4px}
#evShop.show,.evoverlay.show{display:flex}
.evoverlay{position:fixed;inset:0;background:rgba(29,35,64,.45);z-index:240;display:none;align-items:center;justify-content:center;padding:16px}
.evbox{position:relative;max-width:520px;width:100%;max-height:90vh;overflow:auto;background:#eaf4ff;border:4px solid #1d2340;border-radius:20px;padding:16px;box-shadow:6px 6px 0 #1d2340}
.evitem{display:flex;gap:10px;align-items:center;background:#fff;border:2px solid #1d2340;border-radius:14px;padding:10px;margin:8px 0}
.evem{font-size:28px}
.evitem b{display:block}
.evitem small{display:block;opacity:.8}
#leaderboard{padding:8px 16px 28px}
.lbtabs{display:flex;gap:8px;flex-wrap:wrap;margin:8px 0}
.lbtabs button{border:2px solid #1d2340;border-radius:999px;padding:8px 14px;background:#fff;font-weight:800}
.lbtabs button.on{background:#3a86ff;color:#fff}
.lbrow{display:flex;gap:8px;align-items:center;background:#fff;border:2px solid #1d2340;border-radius:12px;padding:8px 10px;margin:6px 0}
.lbem,.lbrank{width:28px;text-align:center;font-weight:800}
.lbname{flex:1;font-weight:700}
.lbempty,.lbnote{opacity:.8;margin:8px 0}
.lbcat h3{margin:14px 0 6px}
#evgBox{position:absolute;left:12px;right:12px;top:64px;z-index:6;pointer-events:none;text-align:center}
#evgBox #evgHint{display:inline-block;background:rgba(29,35,64,.82);color:#fff;border-radius:999px;padding:6px 14px;font-weight:700;font-size:14px}
#evgAct,#evgShopBtn{position:absolute;z-index:8;padding:12px 16px;font-size:18px;border:3px solid #1d2340;border-radius:16px;background:#ffd23f;font-weight:800;box-shadow:3px 3px 0 #1d2340;display:none}
#evgAct{right:16px;bottom:96px}
#evgAct.show{display:block}
#evgShopBtn{right:16px;bottom:160px;display:none;background:#eaf4ff}
.evmode #evgShopBtn{display:block}
#evNextNote{margin:8px 16px;font-weight:700;color:#445}
@media (max-width:700px){ #evgAct{bottom:120px} #evgShopBtn{bottom:184px} }
</style>
'''

SECTION = '''
  <div id="evBanner">
    <h3>❄️ Snow Festival is on!</h3>
    <p>Visit the festival grounds, try the winter games, and earn ❄️ snowflakes for limited-time items. It runs December 1 through January 15 — or turn on a preview in Settings.</p>
    <button class="big green" id="evPlayBtn" type="button">❄️ Play the Snow Festival</button>
    <button class="big" id="evShopBtn" type="button" style="margin-left:8px">🎁 Event shop</button>
  </div>
  <p id="evNextNote"></p>

  <section id="leaderboard">
    <h2>🏅 Leaderboard</h2>
    <p class="lbnote">Your best scores on this device. In a multiplayer room you can also compare with friends who are playing with you right now — no online server, and no typing.</p>
    <div class="lbtabs">
      <button type="button" class="on" data-lbtab="me">🏅 My bests</button>
      <button type="button" data-lbtab="room">👫 Friends in this room</button>
    </div>
    <div id="lbMe"></div>
    <div id="lbRoomWrap" style="display:none">
      <p class="lbnote" id="lbRoomNote"></p>
      <div id="lbRoom"></div>
    </div>
  </section>

'''

SHOP = '''
  <div class="evoverlay" id="evShop"><div class="mbox evbox">
    <button type="button" class="qclose" id="evShopClose" aria-label="Close event shop">✕</button>
    <h2>🎁 Snow Festival Shop</h2>
    <div id="evShopBal">❄️ 0 snowflakes</div>
    <p class="lbnote">Buy limited-time festival items with snowflakes you earn from the winter games and daily quests. These are not paid items.</p>
    <div id="evShopList"></div>
  </div></div>
  <div id="evgBox" class="evgbox" style="display:none"><div id="evgHint">Snow Festival</div></div>
  <button type="button" id="evgAct">Throw</button>
  <button type="button" id="evgShopBtn">🎁 Shop</button>
'''

DEBUG = '''    evOn: () => (typeof evOn === 'function' ? evOn() : (typeof evFestOn === 'function' && evFestOn())),
    evForce: (on) => { if (typeof evSetForce === 'function') evSetForce(!!on); },
    evShop: () => { if (typeof evOpenShop === 'function') evOpenShop(true); },
    evGive: (n) => { if (typeof evGive === 'function') evGive(n, 'Preview'); },
    evState: () => (typeof evEnsure === 'function' ? evEnsure() : null),
    lbPaint: () => { if (typeof lbPaint === 'function') lbPaint(); },
    lbDemo: () => { if (typeof lbDemoRoom === 'function') lbDemoRoom(); },
    lbMine: () => (typeof lbMine === 'function' ? lbMine() : null),
'''

ACH_CAT = "    {id: 'season', name: 'Seasons', emoji: '❄️'},\n"

ACH_ITEMS = r'''    {id:'ev-snow-visit', cat:'season', emoji:'❄️', name:'Festival Friend', desc:'Visit the Snow Festival grounds.', coins:8, prove:s => !!(s.notes && (s.notes['ev-snow-visit'] || s.notes['play:snowfest']))},
    {id:'ev-snow-flakes', cat:'season', emoji:'✨', name:'Flurry of Flakes', desc:'Earn 25 snowflakes at the festival.', coins:12, prove:s => !!(s.notes && s.notes['ev-snow-flakes']) || !!(s.season && (s.season.earned|0) >= 25)},
    {id:'ev-snow-shop', cat:'season', emoji:'🎁', name:'Souvenir Shelf', desc:'Buy a Snow Festival item with snowflakes.', coins:12, prove:s => !!(s.notes && s.notes['ev-snow-shop'])},
    {id:'ev-snow-snowman', cat:'season', emoji:'⛄', name:'Snow Pal', desc:'Build a snowman at the festival.', coins:12, prove:s => !!(s.notes && s.notes['ev-snow-snowman']) || !!(s.season && s.season.done && s.season.done.snowman)},
    {id:'ev-snow-all', cat:'season', emoji:'🏅', name:'Winter Circuit', desc:'Try the toss, the sled hill, the snowman, and the ice rink.', coins:20, prove:s => !!(s.notes && s.notes['ev-snow-all'])},
'''

def main():
    html = INDEX.read_text()

    html = insert_before(html, '<nav>', CSS, 'css', once_token='id="evLbCss"')

    html = insert_after(
        html,
        '    <button data-go="quests"><i>📜</i><span>Quests</span></button>\n  </nav>',
        '\n    <button data-go="leaderboard"><i>🏅</i><span>Board</span></button>',
        'nav',
        once_token='data-go="leaderboard"',
    )
    bad = '    <button data-go="quests"><i>📜</i><span>Quests</span></button>\n  </nav>\n    <button data-go="leaderboard"><i>🏅</i><span>Board</span></button>'
    good = '    <button data-go="quests"><i>📜</i><span>Quests</span></button>\n    <button data-go="leaderboard"><i>🏅</i><span>Board</span></button>\n  </nav>'
    if bad in html:
        html = html.replace(bad, good, 1)

    html = insert_after(
        html,
        '      <button class="big" data-go="quests" style="margin-left:8px">📜 Daily Quests</button>',
        '\n      <button class="big" data-go="leaderboard" style="margin-left:8px">🏅 Leaderboard</button>',
        'hero',
        once_token='🏅 Leaderboard</button>',
    )

    html = insert_after(
        html,
        '  <button class="coinchip" id="coinBtn" title="Rublox Coins (pretend money!) - click for your daily bonus"><span class="coin"></span><span id="coinNum">500</span><span id="bonusDot">🎁</span></button>',
        '\n  <button class="coinchip" id="evChip" title="Snowflakes (festival currency)" style="display:none"><span>❄️</span><span id="evChipNum">0</span></button>',
        'chip',
        once_token='id="evChip"',
    )

    html = insert_before(html, '  <section id="quests">', SECTION, 'sections', once_token='id="leaderboard"')

    html = insert_after(
        html,
        '    </div>\n  </div>\n</div>\n<dialog class="modal dhresetbox" id="dhResetModal"',
        '', # placeholder
        'skip',
        once_token='NEVER',
    ) if False else html

    html = insert_after(
        html,
        '      <label class="invrow"><input type="radio" name="wxSetMode" id="wxSetOff" value="off"><span>Off<small>Leave each game\'s own sky and lighting alone.</small></span></label>\n    </div>',
        '\n    <div class="evset" id="evSet">\n      <div style="color:var(--muted);font-weight:700;margin-top:12px">❄️ Seasonal events</div>\n      <label class="invrow"><input type="checkbox" id="evForceSnow"><span>Preview the Snow Festival<small>Turn the winter fair on before December 1. It stays on this device until you uncheck this, or you can also use #snowfest=1 in the page address.</small></span></label>\n    </div>',
        'settings',
        once_token='id="evForceSnow"',
    )

    html = insert_before(html, '  <div class="qoverlay" id="qPanel">', SHOP, 'shop-hud', once_token='id="evShop"')

    html = replace_once(
        html,
        "function drawParty(ctx){",
        (DEV/'party'/'draw_snowfest.js').read_text() + "\nfunction drawParty(ctx){",
        'drawSnowFest',
    )

    html = insert_after(
        html,
        "const GAMES = [\n",
        "  {id:'snowfest', name:'Snow Festival', emoji:'❄️', tag:'A winter fair: snowball toss, sled hill, snowman building, and ice skating!', draw: drawSnowFest, playable: true, isNew: true},\n",
        'GAMES',
        once_token="{id:'snowfest', name:'Snow Festival'",
    )

    rules = '\n' + (DEV/'season'/'season_logic.js').read_text() + '\n' + (DEV/'board'/'board_logic.js').read_text() + '\n' + (DEV/'season'/'season_boot.js').read_text() + '\n'
    html = insert_before(html, 'const GAMES = [', rules, 'rules', once_token="const EV_KEY = 'rubloxSeason'")

    html = replace_once(
        html,
        "  const grid = $('#grid'); grid.innerHTML = '';\n  GAMES.forEach((g, i) => {",
        "  const grid = $('#grid'); grid.innerHTML = '';\n  const evList = GAMES.filter(g => g.id !== 'snowfest' || (typeof evFestOn === 'function' && evFestOn()));\n  evList.forEach((g, i) => {",
        'buildGames',
    )

    runtime = '\n' + (DEV/'season'/'season.js').read_text() + '\n' + (DEV/'board'/'board.js').read_text() + '\n' + (DEV/'season'/'snowfest.js').read_text() + '\n  try { setTimeout(() => { try { evBind(); lbBind(); evApplyChrome(); evPaintHud(); lbPaint(); } catch (e){} }, 0); } catch (e){}\n\n'
    html = insert_before(html, '  function stop(){', runtime, 'runtime', once_token='function buildSnowFest()')

    html = html.replace("'lantern', 'party'].includes(m)", "'lantern', 'party', 'snowfest'].includes(m)")
    html = html.replace("mode === 'lantern' || mode === 'party' ? null : d", "mode === 'lantern' || mode === 'party' || mode === 'snowfest' ? null : d")
    html = html.replace("mode === 'lantern' || mode === 'party') && (B.onGround", "mode === 'lantern' || mode === 'party' || mode === 'snowfest') && (B.onGround")
    html = html.replace("mode === 'lantern' || mode === 'party'){ // pull the camera", "mode === 'lantern' || mode === 'party' || mode === 'snowfest'){ // pull the camera")
    html = html.replace("mode !== 'dreamhouse' && mode !== 'party')", "mode !== 'dreamhouse' && mode !== 'party' && mode !== 'snowfest')")

    html = replace_once(
        html,
        "if (mode === 'party') buildParty();",
        "if (mode === 'snowfest') buildSnowFest(); else if (mode === 'party') buildParty();",
        'build-chain',
    )
    html = html.replace('py = null; lh = null;', 'py = null; evg = null; lh = null;')

    html = insert_after(
        html,
        "    if (mode === 'party') partyEnter();",
        "\n    { const _eb = $('#evgBox'); if (_eb) _eb.style.display = mode === 'snowfest' ? '' : 'none'; const _ea = $('#evgAct'); if (_ea && mode !== 'snowfest') _ea.classList.remove('show'); }\n    $('#obby').classList.toggle('evmode', mode === 'snowfest');\n    if (mode === 'snowfest') snowfestEnter();\n    try { if (typeof lbShare === 'function') lbShare(); } catch (e){}",
        'start-enter',
        once_token="if (mode === 'snowfest') snowfestEnter();",
    )

    html = html.replace('if (py) partyStop();', 'if (evg) snowfestStop(); if (py) partyStop();')
    html = html.replace('if (py) partyUpdate(dt);', 'if (evg) snowfestUpdate(dt); if (py) partyUpdate(dt);')

    html = insert_before(
        html,
        "    if (mode === 'party' && py && partyPad(jp)) return;",
        "    if (mode === 'snowfest' && evg && snowfestPad(jp)) return;\n",
        'pad',
        once_token='snowfestPad(jp)',
    )
    html = insert_before(
        html,
        "      if (mode === 'party' && py && partyKey(e)) return;",
        "      if (mode === 'snowfest' && evg && snowfestKey(e)) return;\n",
        'key',
        once_token='snowfestKey(e)',
    )

    html = insert_after(
        html,
        "    else if (d.t === 'py'){ try { if (typeof partyFromGuest === 'function') partyFromGuest(g, d); } catch (e){} }",
        "\n    else if (d.t === 'lb'){ try { if (typeof lbFromGuest === 'function') lbFromGuest(g, d); } catch (e){} }",
        'mp-guest',
        once_token="d.t === 'lb'",
    )
    html = insert_after(
        html,
        "      case 'py': try { if (typeof partyFromHost === 'function') partyFromHost(d); } catch (e){} break;",
        "\n      case 'lb': try { if (typeof lbFromHost === 'function') lbFromHost(d); } catch (e){} break;",
        'mp-host',
        once_token="case 'lb':",
    )

    html = insert_after(
        html,
        "    try { if (typeof qNoteHook === 'function') qNoteHook('tower-win', 1); } catch (e){}",
        "\n    try { if (typeof lbRecord === 'function' && td) lbRecord('tower-time', td.t); } catch (e){}",
        'tower-time',
        once_token="lbRecord('tower-time'",
    )

    html = insert_after(
        html,
        "    try { if (typeof toast === 'function') toast((label || 'Quest complete!') + ' +' + amt + ' 🪙'); } catch (e){}",
        "\n    try { if (typeof evOn === 'function' && evOn() && typeof evGive === 'function') evGive((typeof EV_API !== 'undefined' && EV_API && EV_API.EV_FLAKE) ? EV_API.EV_FLAKE.quest : 5, 'Quest'); } catch (e){}",
        'qAward-flakes',
        once_token="evGive((typeof EV_API",
    )

    html = insert_after(
        html,
        "      quests: L('rubloxQuests', null),",
        "\n      season: L('rubloxSeason', null),\n      board: L('rubloxBoard', null),",
        'achSnapshot',
        once_token="season: L('rubloxSeason'",
    )

    html = replace_once(
        html,
        "    {id: 'quests', name: 'Daily Quests', emoji: '📜'},\n  ];",
        "    {id: 'quests', name: 'Daily Quests', emoji: '📜'},\n" + ACH_CAT + "  ];",
        'ACH_CATS',
    )
    html = insert_before(html, "                // Collection", ACH_ITEMS, 'ACH', once_token="{id:'ev-snow-visit'")

    html = insert_after(html, "  window.obbyDebug = {\n", DEBUG, 'debug', once_token="evForce: (on)")

    # weather: prefer snow during festival
    html = replace_once(
        html,
        "  const WX_SNOW = ['obby', 'build', 'hide', 'stable', 'tag'];",
        "  const WX_SNOW = ['obby', 'build', 'hide', 'stable', 'tag', 'party', 'snowfest', 'pets', 'autumn', 'pethotel'];",
        'WX_SNOW',
    )
    html = insert_after(
        html,
        "  if (set.mode === 'day') wx.weather = 'clear';",
        "\n  try { if (typeof evFestOn === 'function' && evFestOn() && (wx.modeId === 'party' || wx.modeId === 'snowfest' || (WX_RULES.wxWeatherAllowed && WX_RULES.wxWeatherAllowed('snow', wx.modeId)))) wx.weather = 'snow'; } catch (e){}",
        'wxTick',
        once_token="wx.weather = 'snow'",
    )

    html = insert_after(
        html,
        "    P.x = R.spawn.x; P.y = R.spawn.y; P.z = R.spawn.z; P.face = R.spawn.face; P.vx = P.vy = P.vz = 0;\n  }",
        "\n    try { if (typeof evDecorParty === 'function') evDecorParty(); } catch (e){}",
        'party-decor',
        once_token='evDecorParty()',
    )

    html = insert_after(
        html,
        "    mpOnStop();",
        "\n    try { if (typeof lbOnLeave === 'function') lbOnLeave('host'); } catch (e){}",
        'stop-lb',
        once_token="lbOnLeave('host')",
    )

    INDEX.write_text(html)
    print('injected', INDEX, 'bytes', INDEX.stat().st_size)

if __name__ == '__main__':
    main()
