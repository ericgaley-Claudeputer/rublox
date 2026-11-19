#!/usr/bin/env python3
"""Refresh already-injected Wobblevator sources and bump BUILD to 2026.11.19-7."""
from __future__ import annotations

from pathlib import Path
import json
import sys

ROOT = Path(__file__).resolve().parents[2]
BUILD = "2026.11.19-7"
OLD_BUILD = "2026.11.19-6"
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
        "  function stop(){",
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

    if "id:'elev-seen25'" not in html:
        html = replace_once(
            html,
            "    {id:'elev-find', cat:'collection', emoji:'🧦', name:'Keen Finder', desc:'Return a missing item on a Wobblevator floor.', coins:10, prove:s => !!(s.notes && s.notes['elev-find']) || !!(s.elevator && (s.elevator.found | 0) >= 1)},\n",
            "    {id:'elev-find', cat:'collection', emoji:'🧦', name:'Keen Finder', desc:'Return a missing item on a Wobblevator floor.', coins:10, prove:s => !!(s.notes && s.notes['elev-find']) || !!(s.elevator && (s.elevator.found | 0) >= 1)},\n"
            "    {id:'elev-seen25', cat:'collection', emoji:'📒', name:'Floor Tourist', desc:'See 25 different Wobblevator floors.', coins:15, prove:s => !!(s.notes && s.notes['elev-seen25']) || !!(s.elevator && s.elevator.seen && s.elevator.seen.length >= 25)},\n"
            "    {id:'elev-seenall', cat:'collection', emoji:'🌟', name:'Shaft Explorer', desc:'See every Wobblevator floor.', coins:25, prove:s => !!(s.notes && s.notes['elev-seenall']) || !!(s.elevator && s.elevator.seen && s.elevator.seen.length >= 49)},\n",
            "seen achievements",
        )

    html = html.replace(
        "mode === 'elevator' ? '🎮 Left stick move · Ⓐ jump · Ⓧ act · Ⓑ close popups · ☰ menu'",
        "mode === 'elevator' ? '🎮 Left stick move · Ⓐ jump · Ⓧ act · Ⓨ floors · Ⓑ close popups · ☰ menu'",
    )

    if "#elevIndexBtn" not in html:
        html = replace_once(
            html,
            "#elevAct, #elevHelpBtn, #elevHelp, #elevBox, #elevMeter,",
            "#elevAct, #elevHelpBtn, #elevIndexBtn, #elevHelp, #elevIndex, #elevBox, #elevMeter,",
            "HUD_HIT_SEL",
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
