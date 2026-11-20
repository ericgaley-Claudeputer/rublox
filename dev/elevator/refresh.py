#!/usr/bin/env python3
"""Refresh already-injected Wobblevator sources and bump BUILD to 2026.11.20-3."""
from __future__ import annotations

from pathlib import Path
import json
import sys

ROOT = Path(__file__).resolve().parents[2]
BUILD = "2026.11.20-4"
OLD_BUILD = "2026.11.20-3"
ELEV = Path(__file__).resolve().parent


class RefreshError(RuntimeError):
    pass


def replace_once(html: str, old: str, new: str, label: str) -> str:
    n = html.count(old)
    if n == 0:
        raise RefreshError(f"missing needle for {label}")
    if n > 1:
        raise RefreshError(f"needle for {label} matched {n} times")
    return html.replace(old, new, 1)


def replace_span(html: str, start: str, end: str, new: str, label: str) -> str:
    a = html.find(start)
    if a < 0:
        raise RefreshError(f"missing start for {label}")
    b = html.find(end, a)
    if b < 0:
        raise RefreshError(f"missing end for {label}")
    return html[:a] + new + html[b:]


def patch_html(html: str) -> str:
    if f"const BUILD = '{BUILD}'" not in html:
        html = replace_once(html, f"const BUILD = '{OLD_BUILD}'", f"const BUILD = '{BUILD}'", "BUILD const")

    logic = (ELEV / "elev_logic.js").read_text()
    html = replace_span(
        html,
        "/* Wobblevator — original Rublox elevator hop.",
        "function drawElevator(ctx){",
        logic + "\n",
        "logic",
    )

    runtime = (ELEV / "runtime.js").read_text()
    if not runtime.endswith("\n"):
        runtime += "\n"
    html = replace_span(
        html,
        "  /* ---------- Wobblevator ---------- */",
        "  function stop(){\n    if (typeof dhHideTestNote === 'function')",
        runtime + "\n",
        "runtime",
    )

    css = (ELEV / "hud.css").read_text()
    html = replace_span(html, '<style id="elevCss">', '<style id="evLbCss">', css, "css")

    hud = (ELEV / "hud.html").read_text()
    if not hud.endswith("\n"):
        hud += "\n"
    html = replace_span(
        html,
        '  <div id="elevBox" style="display:none">',
        '  <div id="t302Box"',
        hud + "\n",
        "hud",
    )

    html = html.replace(
        "'campCraft', 'campWin', 'elevHelp']",
        "'campCraft', 'campWin', 'elevHelp', 'elevIndex']",
    )
    html = html.replace(
        "'campCraft', 'campWin', 'elevHelp', 'elevIndex']",
        "'campCraft', 'campWin', 'elevHelp', 'elevIndex', 'elevShop']",
    )
    html = html.replace(
        "'campCraft', 'campWin', 'elevHelp', 'elevIndex', 'elevShop']",
        "'campCraft', 'campWin', 'elevHelp', 'elevIndex', 'elevShop', 'elevBadges', 'elevDaily']",
    )

    if "id:'elev-seen25'" not in html:
        html = replace_once(
            html,
            "    {id:'elev-find', cat:'collection', emoji:'🧦', name:'Keen Finder', desc:'Return a missing item on a Wobblevator floor.', coins:10, prove:s => !!(s.notes && s.notes['elev-find']) || !!(s.elevator && (s.elevator.found | 0) >= 1)},\n",
            "    {id:'elev-find', cat:'collection', emoji:'🧦', name:'Keen Finder', desc:'Return a missing item on a Wobblevator floor.', coins:10, prove:s => !!(s.notes && s.notes['elev-find']) || !!(s.elevator && (s.elevator.found | 0) >= 1)},\n"
            "    {id:'elev-seen25', cat:'collection', emoji:'📒', name:'Floor Tourist', desc:'See 25 different Wobblevator floors.', coins:15, prove:s => !!(s.notes && s.notes['elev-seen25']) || !!(s.elevator && s.elevator.seen && s.elevator.seen.length >= 25)},\n"
            "    {id:'elev-seenall', cat:'collection', emoji:'🌟', name:'Shaft Explorer', desc:'See every Wobblevator floor.', coins:25, prove:s => !!(s.notes && s.notes['elev-seenall']) || !!(s.elevator && s.elevator.seen && s.elevator.seen.length >= 67)},\n",
            "seen achievements",
        )

    html = html.replace(
        "mode === 'elevator' ? '🎮 Left stick move · Ⓐ jump · Ⓧ act · Ⓑ close popups · ☰ menu'",
        "mode === 'elevator' ? '🎮 Left stick move · Ⓐ jump · Ⓧ act / shop · Ⓨ floors · Ⓑ close popups · ☰ menu'",
    )
    html = html.replace(
        "mode === 'elevator' ? '🎮 Left stick move · Ⓐ jump · Ⓧ act · Ⓨ floors · Ⓑ close popups · ☰ menu'",
        "mode === 'elevator' ? '🎮 Left stick move · Ⓐ jump · Ⓧ act / shop · Ⓨ floors · Ⓑ close popups · ☰ menu'",
    )

    html = html.replace(
        "#elevAct, #elevHelpBtn, #elevHelp, #elevBox, #elevMeter,",
        "#elevAct, #elevHelpBtn, #elevIndexBtn, #elevShopBtn, #elevLessBtn, #elevBadgeBtn, #elevDailyBtn, #elevHelp, #elevIndex, #elevShop, #elevBadges, #elevDaily, #elevBox, #elevMeter,",
    )
    html = html.replace(
        "#elevAct, #elevHelpBtn, #elevIndexBtn, #elevHelp, #elevIndex, #elevBox, #elevMeter,",
        "#elevAct, #elevHelpBtn, #elevIndexBtn, #elevShopBtn, #elevLessBtn, #elevBadgeBtn, #elevDailyBtn, #elevHelp, #elevIndex, #elevShop, #elevBadges, #elevDaily, #elevBox, #elevMeter,",
    )
    html = html.replace("s.elevator.seen.length >= 49", "s.elevator.seen.length >= 67")

    if "if (mode === 'elevator'){ if (P.y < -2 && typeof elevCatchFall === 'function') elevCatchFall(); return; }" not in html:
        html = replace_once(
            html,
            "if (mode === 'build' || mode === 'tag' || mode === 'pets' || mode === 'hide' || mode === 'fashion' || mode === 'autumn' || mode === 'petisland' || mode === 'bakery' || mode === 'waterpark' || mode === 'photostudio' || mode === 'icecream' || mode === 'pethotel' || mode === 'stable' || mode === 'haunt' || mode === 'dance' || mode === 'dreamhouse'){ if (P.y < -25) respawn(); return; }",
            "if (mode === 'build' || mode === 'tag' || mode === 'pets' || mode === 'hide' || mode === 'fashion' || mode === 'autumn' || mode === 'petisland' || mode === 'bakery' || mode === 'waterpark' || mode === 'photostudio' || mode === 'icecream' || mode === 'pethotel' || mode === 'stable' || mode === 'haunt' || mode === 'dance' || mode === 'dreamhouse'){ if (P.y < -25) respawn(); return; }\n    if (mode === 'elevator'){ if (P.y < -2 && typeof elevCatchFall === 'function') elevCatchFall(); return; }",
            "elevator fall catch in checks()",
        )

    if "mode === 'hunt' || mode === 'elevator')" not in html:
        html = replace_once(
            html,
            "mode === 'petshow' || mode === 'hunt') && (B.onGround || B.vy <= 0) && up > 0 && up <= .62)",
            "mode === 'petshow' || mode === 'hunt' || mode === 'elevator') && (B.onGround || B.vy <= 0) && up > 0 && up <= .62)",
            "elevator walk-up steps",
        )

    if "d.t === 'elev'" not in html:
        html = replace_once(
            html,
            "else if (d.t === 't302'){ try { if (typeof t302FromNet === 'function') t302FromNet(g, d); } catch (e){} }",
            "else if (d.t === 't302'){ try { if (typeof t302FromNet === 'function') t302FromNet(g, d); } catch (e){} }\n    else if (d.t === 'elev'){ try { if (typeof elevFromNet === 'function') elevFromNet(g, d); } catch (e){} }",
            "elev from guest",
        )
    if "case 'elev'" not in html and "elevFromHost" not in html:
        html = replace_once(
            html,
            "case 't302': try { if (typeof t302FromNet === 'function') t302FromNet(null, d); } catch (e){} break;",
            "case 't302': try { if (typeof t302FromNet === 'function') t302FromNet(null, d); } catch (e){} break;\n      case 'elev': try { if (typeof elevFromHost === 'function') elevFromHost(d); } catch (e){} break;",
            "elev from host",
        )
    if "MP_MAX = 10" not in html:
        html = replace_once(
            html,
            "MP_MAX = 6,",
            "MP_MAX = 10,",
            "MP_MAX for a 10-friend cab",
        )

    if "mode === 'hunt' || mode === 'elevator'){ // pull the camera" not in html:
        html = replace_once(
            html,
            "mode === 'petshow' || mode === 'hunt'){ // pull the camera in front of walls so buildings don't block the view",
            "mode === 'petshow' || mode === 'hunt' || mode === 'elevator'){ // pull the camera in front of walls so buildings don't block the view",
            "elevator orbit camera clip",
        )
    if "if (b && b.camOnly) continue;" not in html:
        html = replace_once(
            html,
            "if (b && b.floorOnly && axis !== 'y') continue; // plot pad / curbs / grass are floors, not invisible walls",
            "if (b && b.camOnly) continue;\n      if (b && b.floorOnly && axis !== 'y') continue; // plot pad / curbs / grass are floors, not invisible walls",
            "camOnly solids skip player resolve",
        )
    if "b.floorOnly || b.camOnly || !b.mesh" not in html:
        html = replace_once(
            html,
            "if (!b || !b.active || b.floorOnly || !b.mesh) continue;\n        if (typeof overlaps === 'function' && !overlaps(b, .001, P)) continue;",
            "if (!b || !b.active || b.floorOnly || b.camOnly || !b.mesh) continue;\n        if (typeof overlaps === 'function' && !overlaps(b, .001, P)) continue;",
            "camOnly skip in recoverFpPlayer",
        )
    if "if (!b || !b.active || b.camOnly || !b.mesh) continue;" not in html:
        html = replace_once(
            html,
            "function recoverFpPlayer(){\n    if (!P || typeof solids === 'undefined' || !solids) return false;\n    let moved = false;\n    const tallestUnder = () => {\n      let top = -1e9;\n      for (let k = 0; k < solids.length; k++){\n        const b = solids[k];\n        if (!b || !b.active || !b.mesh) continue;",
            "function recoverFpPlayer(){\n    if (!P || typeof solids === 'undefined' || !solids) return false;\n    let moved = false;\n    const tallestUnder = () => {\n      let top = -1e9;\n      for (let k = 0; k < solids.length; k++){\n        const b = solids[k];\n        if (!b || !b.active || b.camOnly || !b.mesh) continue;",
            "camOnly skip in tallestUnder",
        )
    return html


def patch_support() -> None:
    (ROOT / "version.json").write_text(json.dumps({"build": BUILD}) + "\n")
    cafe = ROOT / "dev/t297/cafe_logic.js"
    ct = cafe.read_text()
    ct = ct.replace(
        "'campCraft', 'campWin', 'elevHelp']",
        "'campCraft', 'campWin', 'elevHelp', 'elevIndex']",
    )
    ct = ct.replace(
        "'campCraft', 'campWin', 'elevHelp', 'elevIndex']",
        "'campCraft', 'campWin', 'elevHelp', 'elevIndex', 'elevShop', 'elevBadges', 'elevDaily']",
    )
    cafe.write_text(ct)
    for p in (ROOT / "tests").glob("*.js"):
        t = p.read_text()
        if OLD_BUILD in t:
            p.write_text(t.replace(OLD_BUILD, BUILD))


def verify(html: str) -> None:
    checks = {
        "BUILD": f"const BUILD = '{BUILD}'",
        "floors key": "whisperwell",
        "index overlay": 'id="elevIndex"',
        "index btn": 'id="elevIndexBtn"',
        "seen25": "id:'elev-seen25'",
        "spec": "function elevFloorSpec(",
        "bag": "function elevRebuildBag(",
        "runtime index": "function elevOpenIndex(",
        "xbox": "Ⓨ floors",
        "room of": "function elevRoomOf(",
        "catch fall": "function elevCatchFall(",
        "checks catch": "if (mode === 'elevator'){ if (P.y < -2 && typeof elevCatchFall === 'function') elevCatchFall(); return; }",
        "walk up": "mode === 'hunt' || mode === 'elevator')",
        "shop overlay": 'id="elevShop"',
        "less btn": 'id="elevLessBtn"',
        "muzak": "elevMuzak",
        "begin board": "function elevBeginBoard(",
        "mp guest": "elevFromNet",
        "mp host": "elevFromHost",
        "mp max": "MP_MAX = 10,",
        "new floor": "softcloset",
        "chill floor": "cloudnook",
        "ticket floor": "stubdesk",
        "badge overlay": 'id="elevBadges"',
        "daily overlay": 'id="elevDaily"',
        "queue next": "function elevQueueNext(",
        "building shell": "function elevBuildShell(",
        "elev wall": "function elevWall(",
        "orbit clip": "mode === 'hunt' || mode === 'elevator'){ // pull the camera",
        "camOnly resolve": "if (b && b.camOnly) continue;",
        "elev vote": "function elevBeginVote(",
        "elev vote hud": 'id="elevVote"',
    }
    missing = [k for k, v in checks.items() if v not in html]
    if missing:
        raise RefreshError("verify failed: " + ", ".join(missing))


def main() -> int:
    html_path = ROOT / "index.html"
    html = patch_html(html_path.read_text())
    verify(html)
    html_path.write_text(html)
    patch_support()
    print("elevator refresh ok, BUILD", BUILD)
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except RefreshError as e:
        print("REFRESH ERROR:", e, file=sys.stderr)
        raise SystemExit(1)
