#!/usr/bin/env python3
"""Wire the five t302 modes into index.html. Does not run the lantern injector."""
from __future__ import annotations

from pathlib import Path
import json
import sys

ROOT = Path(__file__).resolve().parents[2]
BUILD = "2026.11.18-1"
OLD_BUILD = "2026.11.16-23"
T302 = Path(__file__).resolve().parent


class InjectError(RuntimeError):
    pass


def replace_once(html: str, old: str, new: str, label: str) -> str:
    n = html.count(old)
    if n == 0:
        raise InjectError(f"missing needle for {label}")
    if n > 1:
        raise InjectError(f"needle for {label} matched {n} times")
    return html.replace(old, new, 1)


def insert_after(html: str, needle: str, extra: str, label: str, once_token: str | None = None) -> str:
    if once_token and once_token in html:
        return html
    n = html.count(needle)
    if n == 0:
        raise InjectError(f"missing insert-after needle for {label}")
    if n > 1:
        raise InjectError(f"insert-after needle for {label} matched {n} times")
    return html.replace(needle, needle + extra, 1)


def insert_before(html: str, needle: str, extra: str, label: str, once_token: str | None = None) -> str:
    if once_token and once_token in html:
        return html
    n = html.count(needle)
    if n == 0:
        raise InjectError(f"missing insert-before needle for {label}")
    if n > 1:
        raise InjectError(f"insert-before needle for {label} matched {n} times")
    return html.replace(needle, extra + needle, 1)


def read(name: str) -> str:
    return (T302 / name).read_text()


def logic_block() -> str:
    parts = [
        read("garden_logic.js"),
        read("meadow_logic.js"),
        read("rides_logic.js"),
        read("hive_logic.js"),
        read("camp_logic.js"),
        read("draw.js"),
    ]
    return "\n" + "\n".join(parts) + "\n"


def patch_html(html: str) -> str:
    html = replace_once(html, "const BUILD = '2026.11.16-23'", f"const BUILD = '{BUILD}'", "BUILD const")

    html = insert_before(
        html,
        "const GAMES = [\n  {id:'cafe', name:'Cozy Corner Café'",
        logic_block(),
        "logic and cards",
        once_token="const GARDEN_KEY = 'rubloxGarden'",
    )
    html = insert_after(html, "const GAMES = [\n", read("games_snip.js"), "GAMES cards", once_token="id:'garden'")

    html = insert_before(html, "<style id=\"evLbCss\">", read("hud.css"), "t302 css", once_token='id="t302Css"')
    html = insert_after(
        html,
        '  <button type="button" id="t297Act">✨ Do it</button>',
        read("hud.html"),
        "t302 html",
        once_token='id="gardenShop"',
    )

    old_ov = "const T297_OVERLAY_IDS = ['cafeDecor', 'cafeBoard', 'fishIndex', 'huntMap', 'psVoteBox'];"
    new_ov = "const T297_OVERLAY_IDS = ['cafeDecor', 'cafeBoard', 'fishIndex', 'huntMap', 'psVoteBox', 'gardenShop', 'meadowBook', 'ridesPalette', 'hiveQuest', 'campCraft'];"
    html = replace_once(html, old_ov, new_ov, "overlay ids")

    html = replace_once(
        html,
        "const WX_SKIP = ['splash', 'waterpark', 'race', 'photostudio', 'dance', 'bakery', 'icecream', 'tower', 'fashion', 'cafe', 'petshow'];",
        "const WX_SKIP = ['splash', 'waterpark', 'race', 'photostudio', 'dance', 'bakery', 'icecream', 'tower', 'fashion', 'cafe', 'petshow', 'camp'];",
        "WX_SKIP",
    )
    html = replace_once(
        html,
        "const WX_SNOW = ['obby', 'build', 'hide', 'stable', 'tag', 'party', 'snowfest', 'pets', 'autumn', 'pethotel', 'fish', 'hunt'];",
        "const WX_SNOW = ['obby', 'build', 'hide', 'stable', 'tag', 'party', 'snowfest', 'pets', 'autumn', 'pethotel', 'fish', 'hunt', 'garden', 'meadow', 'rides', 'hive'];",
        "WX_SNOW",
    )
    html = replace_once(
        html,
        "const WX_RAIN = ['obby', 'build', 'lantern', 'hide', 'autumn', 'stable', 'petisland', 'pets', 'tag', 'dreamhouse', 'pethotel', 'haunt', 'fish', 'hunt'];",
        "const WX_RAIN = ['obby', 'build', 'lantern', 'hide', 'autumn', 'stable', 'petisland', 'pets', 'tag', 'dreamhouse', 'pethotel', 'haunt', 'fish', 'hunt', 'garden', 'meadow', 'rides', 'hive'];",
        "WX_RAIN",
    )

    html = insert_after(
        html,
        "    {id:'hunt-week', cat:'adventure', emoji:'🗺️', name:'Trail Regular', desc:'Finish 3 daily treasure maps.', coins:20, prove:s => !!(s.hunt && (s.hunt.maps | 0) >= 3)},\n",
        read("ach_snip.js"),
        "achievements",
        once_token="id:'garden-plant'",
    )

    html = insert_after(
        html,
        "      notes: Object.assign({}, ach.notes),\n      friends: (typeof frGetState === 'function') ? frGetState() : L('rubloxFriends', null)\n    };",
        "\n    snap.garden = L('rubloxGarden', null);\n    snap.meadow = L('rubloxMeadow', null);\n    snap.rides = L('rubloxRides', null);\n    snap.hive = L('rubloxHive', null);\n    snap.camp = L('rubloxCamp', null);",
        "ach snapshot",
        once_token="snap.garden = L('rubloxGarden'",
    )

    html = insert_after(
        html,
        "    {id: 'hunt-maps', name: 'Treasure Trail — maps finished', emoji: '🗺️', kind: 'high', unit: ''}\n",
        ",\n" + read("lb_snip.js"),
        "LB_ROWS",
        once_token="id: 'garden-harvested'",
    )

    html = insert_after(
        html,
        "      hunt: L('rubloxHunt', null),\n      board: evStateOrBoard()",
        "      ,\n      garden: L('rubloxGarden', null),\n      meadow: L('rubloxMeadow', null),\n      rides: L('rubloxRides', null),\n      hive: L('rubloxHive', null),\n      camp: L('rubloxCamp', null)",
        "lbSaves",
        once_token="garden: L('rubloxGarden', null)",
    )

    html = insert_before(
        html,
        "    {id: 'emote-play', ev: 'emote-use', title: 'Strike a Pose', desc: 'Use any emote 3 times.', emoji: '😄', goal: 3, reward: 10},\n  ];",
        read("quests_snip.js"),
        "Q_POOL",
        once_token="id: 'garden-harvest'",
    )

    html = replace_once(
        html,
        "&& mode !== 'cafe' && mode !== 'fish' && mode !== 'petshow' && mode !== 'hunt')",
        "&& mode !== 'cafe' && mode !== 'fish' && mode !== 'petshow' && mode !== 'hunt' && mode !== 'garden' && mode !== 'meadow' && mode !== 'rides' && mode !== 'hive' && mode !== 'camp')",
        "clouds skip",
    )

    html = replace_once(
        html,
        "if (mode === 'cafe') buildCafe(); else if (mode === 'fish') buildFish(); else if (mode === 'petshow') buildPetShow(); else if (mode === 'hunt') buildHunt(); else if (mode === 'snowfest') buildSnowFest();",
        "if (mode === 'garden') buildGarden(); else if (mode === 'meadow') buildMeadow(); else if (mode === 'rides') buildRides(); else if (mode === 'hive') buildHive(); else if (mode === 'camp') buildCamp(); else if (mode === 'cafe') buildCafe(); else if (mode === 'fish') buildFish(); else if (mode === 'petshow') buildPetShow(); else if (mode === 'hunt') buildHunt(); else if (mode === 'snowfest') buildSnowFest();",
        "build chain",
    )

    html = replace_once(
        html,
        "'snowfest', 'cafe', 'fish', 'petshow', 'hunt'].includes(m) ? m : 'obby'",
        "'snowfest', 'cafe', 'fish', 'petshow', 'hunt', 'garden', 'meadow', 'rides', 'hive', 'camp'].includes(m) ? m : 'obby'",
        "start whitelist ids",
    )
    html = replace_once(
        html,
        "|| mode === 'cafe' || mode === 'fish' || mode === 'petshow' || mode === 'hunt' ? null : d;",
        "|| mode === 'cafe' || mode === 'fish' || mode === 'petshow' || mode === 'hunt' || mode === 'garden' || mode === 'meadow' || mode === 'rides' || mode === 'hive' || mode === 'camp' ? null : d;",
        "start whitelist diff",
    )

    html = insert_after(
        html,
        "    if (mode === 'hunt') huntEnter();\n",
        "    if (mode === 'garden') gardenEnter();\n"
        "    if (mode === 'meadow') meadowEnter();\n"
        "    if (mode === 'rides') ridesEnter();\n"
        "    if (mode === 'hive') hiveEnter();\n"
        "    if (mode === 'camp') campEnter();\n"
        "    { const _t302 = document.getElementById('t302Box'); if (_t302) _t302.style.display = ['garden','meadow','rides','hive','camp'].includes(mode) ? '' : 'none'; }\n"
        "    $('#obby').classList.toggle('gardenmode', mode === 'garden');\n"
        "    $('#obby').classList.toggle('meadowmode', mode === 'meadow');\n"
        "    $('#obby').classList.toggle('ridesmode', mode === 'rides');\n"
        "    $('#obby').classList.toggle('hivemode', mode === 'hive');\n"
        "    $('#obby').classList.toggle('campmode', mode === 'camp');\n",
        "enter chain",
        once_token="if (mode === 'garden') gardenEnter();",
    )

    html = insert_after(
        html,
        "if (typeof t297Update === 'function') t297Update(dt);",
        " if (typeof t302Update === 'function') t302Update(dt);",
        "update chain",
        once_token="t302Update(dt)",
    )
    html = insert_after(
        html,
        "      if (['cafe','fish','petshow','hunt'].includes(mode) && typeof t297Key === 'function' && t297Key(e)) return;\n",
        "      if (['garden','meadow','rides','hive','camp'].includes(mode) && typeof t302Key === 'function' && t302Key(e)) return;\n",
        "key hook",
        once_token="t302Key(e)",
    )
    html = insert_after(
        html,
        "    if (['cafe','fish','petshow','hunt'].includes(mode) && typeof t297Pad === 'function' && t297Pad(jp)) return;\n",
        "    if (['garden','meadow','rides','hive','camp'].includes(mode) && typeof t302Pad === 'function' && t302Pad(jp, s)) return;\n",
        "pad hook",
        once_token="t302Pad(jp",
    )
    html = insert_after(
        html,
        "if (typeof t297Stop === 'function') t297Stop();",
        " if (typeof t302Stop === 'function') t302Stop();",
        "stop chain",
        once_token="t302Stop();",
    )

    html = replace_once(
        html,
        "addEventListener('keyup', e => { if (typeof dhNoteLookKey === 'function') dhNoteLookKey(e, false); keys[e.code] = false; if (e.key) keys[e.key] = false; });",
        "addEventListener('keyup', e => { if (typeof dhNoteLookKey === 'function') dhNoteLookKey(e, false); keys[e.code] = false; if (e.key) keys[e.key] = false; if (['garden','meadow','rides','hive','camp'].includes(mode) && typeof t302Key === 'function' && t302Key(e)) return; });",
        "keyup hook",
    )

    html = insert_after(
        html,
        "    else if (d.t === 'ps'){ try { if (typeof psFromNet === 'function') psFromNet(g, d); } catch (e){} }\n",
        "    else if (d.t === 't302'){ try { if (typeof t302FromNet === 'function') t302FromNet(g, d); } catch (e){} }\n",
        "mp guest hook",
        once_token="d.t === 't302'",
    )
    html = insert_before(
        html,
        "      case 'lb': try { if (typeof lbFromHost === 'function') lbFromHost(d); } catch (e){} break;\n    }",
        "      case 't302': try { if (typeof t302FromNet === 'function') t302FromNet(null, d); } catch (e){} break;\n",
        "mp host hook",
        once_token="case 't302':",
    )

    html = insert_before(
        html,
        "  function stop(){\n    if (typeof dhHideTestNote === 'function') try { dhHideTestNote(); } catch (e){}",
        read("runtime.js") + "\n",
        "runtime",
        once_token="function t302Update(dt)",
    )
    return html


def patch_support() -> None:
    (ROOT / "version.json").write_text(json.dumps({"build": BUILD}) + "\n")

    lan = ROOT / "dev/lantern/inject.py"
    t = lan.read_text()
    t = t.replace("BUILD = '2026.11.16-23'", f"BUILD = '{BUILD}'")
    t = t.replace("OLD_BUILD = '2026.11.16-22'", f"OLD_BUILD = '{OLD_BUILD}'")
    lan.write_text(t)

    cafe = ROOT / "dev/t297/cafe_logic.js"
    ct = cafe.read_text()
    old = "const T297_OVERLAY_IDS = ['cafeDecor', 'cafeBoard', 'fishIndex', 'huntMap', 'psVoteBox'];"
    new = "const T297_OVERLAY_IDS = ['cafeDecor', 'cafeBoard', 'fishIndex', 'huntMap', 'psVoteBox', 'gardenShop', 'meadowBook', 'ridesPalette', 'hiveQuest', 'campCraft'];"
    if old in ct:
        cafe.write_text(ct.replace(old, new, 1))

    wx = ROOT / "dev/weather/weather_rules.js"
    wt = wx.read_text()
    wt = wt.replace(
        "const WX_SKIP = ['splash', 'waterpark', 'race', 'photostudio', 'dance', 'bakery', 'icecream', 'tower', 'fashion', 'cafe', 'petshow'];",
        "const WX_SKIP = ['splash', 'waterpark', 'race', 'photostudio', 'dance', 'bakery', 'icecream', 'tower', 'fashion', 'cafe', 'petshow', 'camp'];",
    )
    wt = wt.replace(
        "const WX_SNOW = ['obby', 'build', 'hide', 'stable', 'tag', 'party', 'snowfest', 'pets', 'autumn', 'pethotel', 'fish', 'hunt'];",
        "const WX_SNOW = ['obby', 'build', 'hide', 'stable', 'tag', 'party', 'snowfest', 'pets', 'autumn', 'pethotel', 'fish', 'hunt', 'garden', 'meadow', 'rides', 'hive'];",
    )
    wt = wt.replace(
        "const WX_RAIN = ['obby', 'build', 'lantern', 'hide', 'autumn', 'stable', 'petisland', 'pets', 'tag', 'dreamhouse', 'pethotel', 'haunt', 'fish', 'hunt'];",
        "const WX_RAIN = ['obby', 'build', 'lantern', 'hide', 'autumn', 'stable', 'petisland', 'pets', 'tag', 'dreamhouse', 'pethotel', 'haunt', 'fish', 'hunt', 'garden', 'meadow', 'rides', 'hive'];",
    )
    wx.write_text(wt)

    board = ROOT / "dev/board/board_logic.js"
    bt = board.read_text()
    lb = read("lb_snip.js")
    if "id: 'garden-harvested'" not in bt:
        needle = "    {id: 'hunt-maps', name: 'Treasure Trail — maps finished', emoji: '🗺️', kind: 'high', unit: ''}"
        if needle not in bt:
            raise InjectError("board LB_ROWS needle missing")
        bt = bt.replace(needle, needle + ",\n" + lb, 1)
    snap = (
        "    const gardenS = saves.garden || {};\n"
        "    set('garden-harvested', gardenS.harvested | 0 ? (gardenS.harvested | 0) : null);\n"
        "    const meadowS = saves.meadow || {};\n"
        "    set('meadow-best', meadowS.best ? +meadowS.best : null);\n"
        "    const ridesS = saves.rides || {};\n"
        "    set('rides-rides', ridesS.rides | 0 ? (ridesS.rides | 0) : null);\n"
        "    const hiveS = saves.hive || {};\n"
        "    set('hive-honey', hiveS.made | 0 ? (hiveS.made | 0) : null);\n"
        "    const campS = saves.camp || {};\n"
        "    set('camp-sunrises', campS.sunrises | 0 ? (campS.sunrises | 0) : null);\n"
    )
    if "set('garden-harvested'" not in bt:
        needle = "    set('hunt-maps', huntS.maps | 0 ? (huntS.maps | 0) : null);"
        if needle not in bt:
            raise InjectError("board snapshot needle missing")
        bt = bt.replace(needle, needle + "\n" + snap, 1)
    board.write_text(bt)

    for p in (ROOT / "tests").glob("*.js"):
        t = p.read_text()
        if OLD_BUILD in t:
            p.write_text(t.replace(OLD_BUILD, BUILD))


def verify(html: str) -> None:
    checks = {
        "BUILD": f"const BUILD = '{BUILD}'",
        "garden card": "id:'garden'",
        "meadow card": "id:'meadow'",
        "rides card": "id:'rides'",
        "hive card": "id:'hive'",
        "camp card": "id:'camp'",
        "save garden": "rubloxGarden",
        "save meadow": "rubloxMeadow",
        "save rides": "rubloxRides",
        "save hive": "rubloxHive",
        "save camp": "rubloxCamp",
        "buildGarden": "function buildGarden(",
        "buildMeadow": "function buildMeadow(",
        "buildRides": "function buildRides(",
        "buildHive": "function buildHive(",
        "buildCamp": "function buildCamp(",
        "update hook": "t302Update(dt)",
        "key hook": "t302Key(e)",
        "pad hook": "t302Pad(jp, s)",
        "stop hook": "t302Stop();",
        "enter garden": "if (mode === 'garden') gardenEnter();",
        "whitelist": "'garden', 'meadow', 'rides', 'hive', 'camp']",
        "overlay garden": "gardenShop",
        "runtime def": "function t302Update(dt)",
        "npc solo": "hv.solo = !t302MpOn()",
        "keyup": "t302Key(e)) return;",
    }
    missing = [k for k, v in checks.items() if v not in html]
    if missing:
        raise InjectError("verify failed: " + ", ".join(missing))
    loop = html.find("if (evg) snowfestUpdate(dt)")
    defn = html.find("function t302Update(dt)")
    if loop < 0 or defn < 0 or "t302Update(dt)" not in html[loop : loop + 280]:
        raise InjectError("t302Update is not in the game loop")
    if loop == defn:
        raise InjectError("loop and definition collapsed")


def main() -> int:
    html_path = ROOT / "index.html"
    html = html_path.read_text()
    html = patch_html(html)
    verify(html)
    html_path.write_text(html)
    patch_support()
    print("t302 inject ok, BUILD", BUILD)
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except InjectError as e:
        print("INJECT ERROR:", e, file=sys.stderr)
        raise SystemExit(1)
