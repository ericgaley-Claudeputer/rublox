#!/usr/bin/env python3
"""Refresh t302 sources into index.html and bump BUILD to 2026.11.19-1."""
from pathlib import Path
import json

ROOT = Path(__file__).resolve().parents[2]
T302 = Path(__file__).resolve().parent
BUILD = "2026.11.19-4"
OLD = "2026.11.19-3"


def read(name: str) -> str:
    return (T302 / name).read_text()


def replace_once(html: str, old: str, new: str, label: str) -> str:
    n = html.count(old)
    if n != 1:
        raise SystemExit(f"{label}: expected 1 match, got {n}")
    return html.replace(old, new, 1)


def replace_span(html: str, start: str, end: str, mid: str, label: str, keep_end: bool = True) -> str:
    i = html.find(start)
    j = html.find(end, i + len(start) if i >= 0 else 0)
    if i < 0 or j < 0:
        raise SystemExit(f"{label}: span not found (start {i}, end {j})")
    if keep_end:
        return html[:i] + mid + html[j:]
    return html[:i] + mid + html[j + len(end):]


def main() -> int:
    html_path = ROOT / "index.html"
    html = html_path.read_text()

    if f"const BUILD = '{OLD}'" in html:
        html = replace_once(html, f"const BUILD = '{OLD}'", f"const BUILD = '{BUILD}'", "BUILD")
    elif f"const BUILD = '{BUILD}'" not in html:
        raise SystemExit("unexpected BUILD stamp")

    logic = "\n" + "\n".join([
        read("garden_logic.js"),
        read("meadow_logic.js"),
        read("rides_logic.js"),
        read("hive_logic.js"),
        read("camp_logic.js"),
        read("draw.js"),
    ]) + "\n"
    # mid must NOT include the end marker; keep_end leaves `const GAMES = [`
    html = replace_span(html, "/* Sunny Patch Garden", "const GAMES = [", logic, "logic+draw")

    html = replace_span(
        html,
        "  const T302_MODES = ['garden','meadow','rides','hive','camp'];",
        "  function stop(){\n    if (typeof dhHideTestNote === 'function')",
        read("runtime.js") + "\n",
        "runtime",
    )

    # Replace only the t302 style block (do not span into evLbCss / page HTML).
    css_start = html.find('<style id="t302Css">')
    css_end = html.find("</style>", css_start)
    if css_start < 0 or css_end < 0:
        raise SystemExit("t302Css block missing")
    css_body = read("hud.css")
    if css_body.startswith('<style id="t302Css">'):
        block = css_body if css_body.rstrip().endswith("</style>") else css_body.rstrip() + "\n</style>"
    else:
        block = '<style id="t302Css">\n' + css_body + ("\n" if not css_body.endswith("\n") else "") + "</style>"
    html = html[:css_start] + block + html[css_end + len("</style>"):]

    # Replace t302 HUD widgets through campWin (and drop any duplicated vignette/win blocks).
    start = html.find('  <div id="t302Box"')
    end_mark = '  <button type="button" id="cafeBoardBtn">'
    end = html.find(end_mark, start)
    if start < 0 or end < 0:
        raise SystemExit(f"hud html span missing {start} {end}")
    hud = read("hud.html").lstrip("\n")
    if not hud.endswith("\n"):
        hud += "\n"
    html = html[:start] + hud + html[end:]

    old_ov = "const T297_OVERLAY_IDS = ['cafeDecor', 'cafeBoard', 'fishIndex', 'huntMap', 'psVoteBox', 'gardenShop', 'meadowBook', 'ridesPalette', 'hiveQuest', 'campCraft'];"
    new_ov = "const T297_OVERLAY_IDS = ['cafeDecor', 'cafeBoard', 'fishIndex', 'huntMap', 'psVoteBox', 'gardenShop', 'meadowBook', 'ridesPalette', 'hiveQuest', 'campCraft', 'campWin'];"
    if old_ov in html:
        html = replace_once(html, old_ov, new_ov, "overlay ids")
    elif new_ov not in html:
        raise SystemExit("overlay id list not found")

    for old_tag, new_tag in [
        ("Keep the fire bright until sunrise. Cozy, not scary — and only real friends in multiplayer.",
         "Hunt logs by day and keep the fire bright through 5 spooky nights. The Gloam stalks the dark — scare it back with fire and lanterns!"),
        ("Keep the fire bright until sunrise. Spooky Gloam eyes watch from the dark — scare them back with fire and lanterns!",
         "Hunt logs by day and keep the fire bright through 5 spooky nights. The Gloam stalks the dark — scare it back with fire and lanterns!"),
    ]:
        if old_tag in html:
            html = html.replace(old_tag, new_tag)


    html_path.write_text(html)

    (ROOT / "version.json").write_text(json.dumps({"build": BUILD}) + "\n")

    lan = ROOT / "dev/lantern/inject.py"
    lt = lan.read_text()
    lt = lt.replace(f"BUILD = '{OLD}'", f"BUILD = '{BUILD}'")
    lt = lt.replace("OLD_BUILD = '2026.11.16-23'", f"OLD_BUILD = '{OLD}'")
    import re as _re
    lt = _re.sub(r"OLD_BUILD = '2026\.11\.\d+-\d+'", f"OLD_BUILD = '{OLD}'", lt, count=1)
    lan.write_text(lt)

    cafe = ROOT / "dev/t297/cafe_logic.js"
    ct = cafe.read_text()
    if old_ov in ct:
        cafe.write_text(ct.replace(old_ov, new_ov, 1))
    elif "campCraft'];" in ct and "campWin" not in ct:
        cafe.write_text(ct.replace("'campCraft']", "'campCraft', 'campWin']", 1))

    for p in (ROOT / "tests").glob("*.js"):
        t = p.read_text()
        if OLD in t:
            p.write_text(t.replace(OLD, BUILD))
        esc_old = OLD.replace(".", r"\.")
        esc_new = BUILD.replace(".", r"\.")
        t2 = p.read_text()
        if esc_old in t2:
            p.write_text(t2.replace(esc_old, esc_new))

    inj = T302 / "inject.py"
    it = inj.read_text()
    it = it.replace(f'BUILD = "{OLD}"', f'BUILD = "{BUILD}"')
    it = it.replace('OLD_BUILD = "2026.11.16-23"', f'OLD_BUILD = "{OLD}"')
    it = it.replace("const BUILD = '2026.11.16-23'", f"const BUILD = '{OLD}'")
    inj.write_text(it)

    html = html_path.read_text()
    need = [
        f"const BUILD = '{BUILD}'",
        "gardenGrantStarter",
        "meadowThrowTo",
        "campShine",
        "campGloamTarget",
        "the Gloam",
        "t302Edge",
        'id="campWin"',
        "t302Vignette",
        "Less scary",
        'id="t302Coins"',
        'id="ridesHelpBtn"',
        "meadowRebirth",
        "hiveBloom",
        "RIDES_TUT",
        "campStartRun",
        "CAMP_WIN_NIGHTS",
        "ridesSnap",
        "ridesUndo",
        'id="ridesDelBtn"',
        'id="campMap"',
        "t302Update(dt)",
        'id="wxSetAuto"',
        'id="hero"',
        'style id="evLbCss"',
    ]
    miss = [n for n in need if n not in html]
    if miss:
        raise SystemExit("verify failed: " + ", ".join(miss))
    if html.count("const GAMES = [") != 1:
        raise SystemExit("GAMES marker duplicated or missing")
    loop = html.find("if (evg) snowfestUpdate(dt)")
    if "t302Update(dt)" not in html[loop:loop + 280]:
        raise SystemExit("t302Update not in the game loop")
    print("t302 refresh ok, BUILD", BUILD, "len", len(html))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
