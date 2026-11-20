#!/usr/bin/env python3
"""Wire Wobblevator into index.html. Does not run the lantern or t302 injectors."""
from __future__ import annotations

from pathlib import Path
import json
import sys

ROOT = Path(__file__).resolve().parents[2]
BUILD = "2026.11.20-8"
OLD_BUILD = "2026.11.19-10"
ELEV = Path(__file__).resolve().parent


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
    return (ELEV / name).read_text()


def logic_block() -> str:
    return "\n" + read("elev_logic.js") + "\n" + read("draw.js") + "\n"


def patch_html(html: str) -> str:
    html = replace_once(html, f"const BUILD = '{OLD_BUILD}'", f"const BUILD = '{BUILD}'", "BUILD const")

    html = insert_before(
        html,
        "const GAMES = [\n  {id:'garden', name:'Sunny Patch Garden'",
        logic_block(),
        "logic and card art",
        once_token="const ELEV_KEY = 'rubloxElevator'",
    )
    html = insert_after(
        html,
        "const GAMES = [\n",
        "  {id:'elevator', name:'Wobblevator', emoji:'🛗', tag:'Ride Bingle the Bellhop’s wobbly lift to surprise floors. Clear quirky mini-events, keep your streak, and hop back in — if a floor gets too wobbly, everyone is okay!', draw: drawElevator, playable: true, isNew: true},\n",
        "GAMES card",
        once_token="id:'elevator'",
    )

    html = insert_before(html, "<style id=\"evLbCss\">", read("hud.css"), "elev css", once_token='id="elevCss"')
    html = insert_after(
        html,
        '  <button type="button" id="t297Act">✨ Do it</button>',
        "\n" + read("hud.html"),
        "elev html",
        once_token='id="elevHelp"',
    )

    html = replace_once(
        html,
        "const T297_OVERLAY_IDS = ['cafeDecor', 'cafeBoard', 'fishIndex', 'huntMap', 'psVoteBox', 'gardenShop', 'meadowBook', 'ridesPalette', 'hiveQuest', 'campCraft', 'campWin'];",
        "const T297_OVERLAY_IDS = ['cafeDecor', 'cafeBoard', 'fishIndex', 'huntMap', 'psVoteBox', 'gardenShop', 'meadowBook', 'ridesPalette', 'hiveQuest', 'campCraft', 'campWin', 'elevHelp'];",
        "overlay ids",
    )

    html = replace_once(
        html,
        "const WX_SKIP = ['splash', 'waterpark', 'race', 'photostudio', 'dance', 'bakery', 'icecream', 'tower', 'fashion', 'cafe', 'petshow', 'camp'];",
        "const WX_SKIP = ['splash', 'waterpark', 'race', 'photostudio', 'dance', 'bakery', 'icecream', 'tower', 'fashion', 'cafe', 'petshow', 'camp', 'elevator'];",
        "WX_SKIP",
    )

    html = insert_after(
        html,
        "    {id:'camp-sunrise', cat:'adventure', emoji:'🌅', name:'Made Sunrise', desc:'Keep the campfire bright until sunrise.', coins:15, prove:s => !!(s.notes && s.notes['camp-sunrise']) || !!(s.camp && (s.camp.sunrises | 0) >= 1)},\n",
        "    {id:'elev-ride', cat:'adventure', emoji:'🛗', name:'First Ride', desc:'Board Bingle the Bellhop’s Wobblevator.', coins:5, prove:s => !!(s.notes && s.notes['elev-ride']) || !!(s.elevator && (s.elevator.rides | 0) >= 1)},\n"
        "    {id:'elev-five', cat:'adventure', emoji:'5️⃣', name:'Five Floors Up', desc:'Clear a streak of 5 Wobblevator floors.', coins:10, prove:s => !!(s.notes && s.notes['elev-five']) || !!(s.elevator && (s.elevator.best | 0) >= 5)},\n"
        "    {id:'elev-twelve', cat:'adventure', emoji:'🌟', name:'Twelve-Floor Champ', desc:'Clear a streak of 12 Wobblevator floors.', coins:20, prove:s => !!(s.notes && s.notes['elev-twelve']) || !!(s.elevator && (s.elevator.best | 0) >= 12)},\n"
        "    {id:'elev-creepy', cat:'adventure', emoji:'🕯️', name:'Kept the Light', desc:'Clear a dim Wobblevator floor.', coins:10, prove:s => !!(s.notes && s.notes['elev-creepy']) || !!(s.elevator && (s.elevator.creepy | 0) >= 1)},\n"
        "    {id:'elev-find', cat:'collection', emoji:'🧦', name:'Keen Finder', desc:'Return a missing item on a Wobblevator floor.', coins:10, prove:s => !!(s.notes && s.notes['elev-find']) || !!(s.elevator && (s.elevator.found | 0) >= 1)},\n",
        "achievements",
        once_token="id:'elev-ride'",
    )

    html = insert_after(
        html,
        "    snap.camp = L('rubloxCamp', null);",
        "\n    snap.elevator = L('rubloxElevator', null);",
        "ach snapshot",
        once_token="snap.elevator = L('rubloxElevator'",
    )

    html = replace_once(
        html,
        "    {id: 'camp-sunrises', name: 'Campfire Grove — sunrises', emoji: '🌅', kind: 'high', unit: ''}\n  ];",
        "    {id: 'camp-sunrises', name: 'Campfire Grove — sunrises', emoji: '🌅', kind: 'high', unit: ''},\n"
        "    {id: 'elev-best', name: 'Wobblevator — best streak', emoji: '🛗', kind: 'high', unit: ''}\n  ];",
        "LB_ROWS",
    )

    html = insert_after(
        html,
        "      camp: L('rubloxCamp', null)",
        ",\n      elevator: L('rubloxElevator', null)",
        "lbSaves",
        once_token="elevator: L('rubloxElevator', null)",
    )

    html = insert_after(
        html,
        "    set('hunt-maps', huntS.maps | 0 ? (huntS.maps | 0) : null);\n",
        "    const elevS = saves.elevator || {};\n"
        "    set('elev-best', elevS.best | 0 ? (elevS.best | 0) : null);\n",
        "lb snapshot",
        once_token="set('elev-best'",
    )

    html = replace_once(
        html,
        "&& mode !== 'garden' && mode !== 'meadow' && mode !== 'rides' && mode !== 'hive' && mode !== 'camp')",
        "&& mode !== 'garden' && mode !== 'meadow' && mode !== 'rides' && mode !== 'hive' && mode !== 'camp' && mode !== 'elevator')",
        "clouds skip",
    )

    html = replace_once(
        html,
        "if (mode === 'garden') buildGarden(); else if (mode === 'meadow') buildMeadow(); else if (mode === 'rides') buildRides(); else if (mode === 'hive') buildHive(); else if (mode === 'camp') buildCamp(); else if (mode === 'cafe') buildCafe();",
        "if (mode === 'elevator') buildElevator(); else if (mode === 'garden') buildGarden(); else if (mode === 'meadow') buildMeadow(); else if (mode === 'rides') buildRides(); else if (mode === 'hive') buildHive(); else if (mode === 'camp') buildCamp(); else if (mode === 'cafe') buildCafe();",
        "build chain",
    )

    html = replace_once(
        html,
        "'snowfest', 'cafe', 'fish', 'petshow', 'hunt', 'garden', 'meadow', 'rides', 'hive', 'camp'].includes(m) ? m : 'obby'",
        "'snowfest', 'cafe', 'fish', 'petshow', 'hunt', 'garden', 'meadow', 'rides', 'hive', 'camp', 'elevator'].includes(m) ? m : 'obby'",
        "start whitelist ids",
    )
    html = replace_once(
        html,
        "|| mode === 'hive' || mode === 'camp' ? null : d;",
        "|| mode === 'hive' || mode === 'camp' || mode === 'elevator' ? null : d;",
        "start whitelist diff",
    )

    html = insert_after(
        html,
        "    if (mode === 'camp') campEnter();\n",
        "    if (mode === 'elevator') elevEnter();\n"
        "    { const _elev = document.getElementById('elevBox'); if (_elev) _elev.style.display = mode === 'elevator' ? '' : 'none'; }\n"
        "    $('#obby').classList.toggle('elevmode', mode === 'elevator');\n",
        "enter chain",
        once_token="if (mode === 'elevator') elevEnter();",
    )

    html = insert_after(
        html,
        " if (typeof t302Update === 'function') t302Update(dt);",
        " if (typeof elevUpdate === 'function') elevUpdate(dt);",
        "update chain",
        once_token="elevUpdate(dt)",
    )
    html = insert_after(
        html,
        "      if (['garden','meadow','rides','hive','camp'].includes(mode) && typeof t302Key === 'function' && t302Key(e)) return;\n",
        "      if (mode === 'elevator' && typeof elevKey === 'function' && elevKey(e)) return;\n",
        "key hook",
        once_token="elevKey(e)",
    )
    html = insert_after(
        html,
        "    if (['garden','meadow','rides','hive','camp'].includes(mode) && typeof t302Pad === 'function' && t302Pad(jp, s)) return;\n",
        "    if (mode === 'elevator' && typeof elevPadEdge === 'function' && elevPadEdge(jp)) return;\n",
        "pad hook",
        once_token="elevPadEdge(jp)",
    )
    html = insert_after(
        html,
        "if (typeof t302Stop === 'function') t302Stop();",
        " if (typeof elevStop === 'function') elevStop();",
        "stop chain",
        once_token="elevStop();",
    )

    html = replace_once(
        html,
        "addEventListener('keyup', e => { if (typeof dhNoteLookKey === 'function') dhNoteLookKey(e, false); keys[e.code] = false; if (e.key) keys[e.key] = false; if (['garden','meadow','rides','hive','camp'].includes(mode) && typeof t302Key === 'function' && t302Key(e)) return; });",
        "addEventListener('keyup', e => { if (typeof dhNoteLookKey === 'function') dhNoteLookKey(e, false); keys[e.code] = false; if (e.key) keys[e.key] = false; if (['garden','meadow','rides','hive','camp'].includes(mode) && typeof t302Key === 'function' && t302Key(e)) return; if (mode === 'elevator' && typeof elevKey === 'function' && elevKey(e)) return; });",
        "keyup hook",
    )

    html = replace_once(
        html,
        "mode === 'haunt' ? '🎮 Left stick move · Ⓐ jump · Ⓧ use puzzle · ☰ menu'",
        "mode === 'elevator' ? '🎮 Left stick move · Ⓐ jump · Ⓧ act · Ⓑ close popups · ☰ menu' : mode === 'haunt' ? '🎮 Left stick move · Ⓐ jump · Ⓧ use puzzle · ☰ menu'",
        "xbox tip",
    )

    html = replace_once(
        html,
        "const HUD_HIT_SEL = '#dhBar, #dhAct, #dhTip, #dhYard, #dhShop, #dhUp, #dhVisit, #dhSteps, #dhResetModal, .obtns, #oExit, #oExit2, #oExit3, #oFP, #oPause, #oMute, #setBtn, #setModal, #oPausePanel, #chRoot, #chPanel, #chWheel, #chBtn, #lhRoot, #lhAct, #lhSet, #lhDraw, #lhWrite, #lhWriteBtn, #lhKnock, #lhGame, #lhBooth, #lhDecor, #lhDecorBtn, #lhCut, #lhCalm, #lhMeter, #lhFanfare, #lhSetBtn, #lhMyWagon, #lhMapBtn, #lhMap, #lhWall, button, a, input, label, select';",
        "const HUD_HIT_SEL = '#dhBar, #dhAct, #dhTip, #dhYard, #dhShop, #dhUp, #dhVisit, #dhSteps, #dhResetModal, .obtns, #oExit, #oExit2, #oExit3, #oFP, #oPause, #oMute, #setBtn, #setModal, #oPausePanel, #chRoot, #chPanel, #chWheel, #chBtn, #lhRoot, #lhAct, #lhSet, #lhDraw, #lhWrite, #lhWriteBtn, #lhKnock, #lhGame, #lhBooth, #lhDecor, #lhDecorBtn, #lhCut, #lhCalm, #lhMeter, #lhFanfare, #lhSetBtn, #lhMyWagon, #lhMapBtn, #lhMap, #lhWall, #elevAct, #elevHelpBtn, #elevHelp, #elevBox, #elevMeter, button, a, input, label, select';",
        "HUD_HIT_SEL",
    )

    html = insert_before(
        html,
        "  function stop(){\n    if (typeof dhHideTestNote === 'function') try { dhHideTestNote(); } catch (e){}",
        read("runtime.js") + "\n",
        "runtime",
        once_token="function buildElevator(",
    )
    return html


def patch_support() -> None:
    (ROOT / "version.json").write_text(json.dumps({"build": BUILD}) + "\n")

    cafe = ROOT / "dev/t297/cafe_logic.js"
    ct = cafe.read_text()
    old = "const T297_OVERLAY_IDS = ['cafeDecor', 'cafeBoard', 'fishIndex', 'huntMap', 'psVoteBox', 'gardenShop', 'meadowBook', 'ridesPalette', 'hiveQuest', 'campCraft', 'campWin'];"
    new = "const T297_OVERLAY_IDS = ['cafeDecor', 'cafeBoard', 'fishIndex', 'huntMap', 'psVoteBox', 'gardenShop', 'meadowBook', 'ridesPalette', 'hiveQuest', 'campCraft', 'campWin', 'elevHelp'];"
    if old in ct:
        cafe.write_text(ct.replace(old, new, 1))

    reset = ROOT / "dev/reset/reset_logic.js"
    rt = reset.read_text()
    needle = "    {id:'garden', name:'Sunny Patch Garden', emoji:'🌱', keys:['rubloxGarden']},"
    extra = "    {id:'elevator', name:'Wobblevator', emoji:'🛗', keys:['rubloxElevator']},\n"
    if "id:'elevator'" not in rt:
        if needle not in rt:
            raise InjectError("reset list needle missing")
        reset.write_text(rt.replace(needle, extra + needle, 1))

    board = ROOT / "dev/board/board_logic.js"
    bt = board.read_text()
    old_row = "    {id: 'camp-sunrises', name: 'Campfire Grove — sunrises', emoji: '🌅', kind: 'high', unit: ''}\n"
    new_row = (
        "    {id: 'camp-sunrises', name: 'Campfire Grove — sunrises', emoji: '🌅', kind: 'high', unit: ''},\n"
        "    {id: 'elev-best', name: 'Wobblevator — best streak', emoji: '🛗', kind: 'high', unit: ''}\n"
    )
    if "id: 'elev-best'" not in bt:
        if old_row not in bt:
            raise InjectError("board row needle missing")
        bt = bt.replace(old_row, new_row, 1)
    if "set('elev-best'" not in bt:
        snap_n = "    set('camp-sunrises', campS.sunrises | 0 ? (campS.sunrises | 0) : null);"
        if snap_n not in bt:
            raise InjectError("board snapshot needle missing")
        bt = bt.replace(
            snap_n,
            snap_n + "\n    const elevS = saves.elevator || {};\n    set('elev-best', elevS.best | 0 ? (elevS.best | 0) : null);",
            1,
        )
    board.write_text(bt)

    # Bump current-build stamps in tests. Leave historical "classic 2026.11.19-4" titles alone.
    for p in (ROOT / "tests").glob("*.js"):
        t = p.read_text()
        if OLD_BUILD in t:
            p.write_text(t.replace(OLD_BUILD, BUILD))

    named = ROOT / "tests" / "reset_logic.js"
    nt = named.read_text()
    if "elevator: 'rubloxElevator'" not in nt:
        nt = nt.replace(
            "      garden: 'rubloxGarden',",
            "      elevator: 'rubloxElevator',\n      garden: 'rubloxGarden',",
            1,
        )
        named.write_text(nt)


def verify(html: str) -> None:
    checks = {
        "BUILD": f"const BUILD = '{BUILD}'",
        "card": "id:'elevator'",
        "name": "Wobblevator",
        "save": "rubloxElevator",
        "draw": "function drawElevator(",
        "build": "function buildElevator(",
        "update hook": "elevUpdate(dt)",
        "key hook": "elevKey(e)",
        "pad hook": "elevPadEdge(jp)",
        "stop hook": "elevStop();",
        "enter": "if (mode === 'elevator') elevEnter();",
        "whitelist": "'camp', 'elevator'].includes(m)",
        "overlay": "elevHelp",
        "wx": "'elevator'",
        "ach": "id:'elev-ride'",
        "snap": "snap.elevator = L('rubloxElevator'",
        "board": "id: 'elev-best'",
        "xbox": "mode === 'elevator' ? '🎮 Left stick move",
        "host": "Bingle the Bellhop",
    }
    missing = [k for k, v in checks.items() if v not in html]
    if missing:
        raise InjectError("verify failed: " + ", ".join(missing))
    loop = html.find("if (evg) snowfestUpdate(dt)")
    defn = html.find("function elevUpdate(dt)")
    if loop < 0 or defn < 0 or "elevUpdate(dt)" not in html[loop : loop + 280]:
        raise InjectError("elevUpdate is not in the game loop")
    if loop == defn:
        raise InjectError("loop and definition collapsed")
    banned = ["Pest", "Poob", "Lampert", "Regretevator", "Floppy Shoppy", "Axolotl Sun", "FleshCousin"]
    blob = html[html.find("const ELEV_KEY") : html.find("function drawElevator")] if "const ELEV_KEY" in html else ""
    blob += html[html.find("/* ---------- Wobblevator") : html.find("function stop(){")] if "/* ---------- Wobblevator" in html else ""
    for name in banned:
        if name.lower() in blob.lower():
            raise InjectError("banned name leaked: " + name)


def main() -> int:
    html_path = ROOT / "index.html"
    html = html_path.read_text()
    html = patch_html(html)
    verify(html)
    html_path.write_text(html)
    patch_support()
    print("elevator inject ok, BUILD", BUILD)
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except InjectError as e:
        print("INJECT ERROR:", e, file=sys.stderr)
        raise SystemExit(1)
