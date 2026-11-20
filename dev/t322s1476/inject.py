#!/usr/bin/env python3
"""Wire Mallowmist rooms + secret attic, Wagwell salon/contests, and Pinebell Village."""
from __future__ import annotations
from pathlib import Path
import json
import sys

ROOT = Path(__file__).resolve().parents[2]
BUILD = "2026.11.20-6"
OLD_BUILD = "2026.11.20-5"


class InjectError(RuntimeError):
    pass


def replace_once(html: str, old: str, new: str, label: str) -> str:
    if new.strip() and new in html and old not in html:
        return html
    n = html.count(old)
    if n == 0:
        raise InjectError(f"missing needle for {label}")
    if n > 1:
        raise InjectError(f"needle for {label} matched {n} times")
    return html.replace(old, new, 1)


def insert_after(html: str, needle: str, extra: str, label: str, once: str | None = None) -> str:
    if once and once in html:
        return html
    return replace_once(html, needle, needle + extra, label)


def insert_before(html: str, needle: str, extra: str, label: str, once: str | None = None) -> str:
    if once and once in html:
        return html
    return replace_once(html, needle, extra + needle, label)


def main() -> int:
    html_path = ROOT / "index.html"
    html = html_path.read_text()
    mansion_logic = (ROOT / "dev/mansion/mansion_logic.js").read_text()
    shelter_logic = (ROOT / "dev/shelter/shelter_logic.js").read_text()
    winter_logic = (ROOT / "dev/winter/winter_logic.js").read_text()
    mn_rt = (ROOT / "dev/mansion/runtime.js").read_text()
    sh_rt = (ROOT / "dev/shelter/runtime.js").read_text()
    wn_rt = (ROOT / "dev/winter/runtime.js").read_text()
    wn_css = (ROOT / "dev/winter/hud.css").read_text()
    wn_hud = (ROOT / "dev/winter/hud.html").read_text()

    html = html.replace(f"const BUILD = '{OLD_BUILD}';", f"const BUILD = '{BUILD}';", 1)

    # First-script logic modules
    start = html.find("/* Mallowmist Manor — original kid-scary escape")
    end = html.find("/* New optional avatar looks")
    if start < 0 or end < 0:
        raise InjectError("logic block markers missing")
    html = html[:start] + mansion_logic.rstrip() + "\n\n" + shelter_logic.rstrip() + "\n\n" + winter_logic.rstrip() + "\n\n" + html[end:]

    if "function drawWinter(" not in html:
        html = insert_after(
            html,
            "if (typeof guy === 'function') guy(ctx, 160, 176, 12, '#3a86ff');\n}\n",
            "function drawWinter(ctx){\n  if (typeof sky === 'function') sky(ctx, '#9fd4ff', '#fff8ee');\n  ctx.fillStyle = '#f4fbff'; ctx.fillRect(0, 130, 320, 70);\n  ctx.fillStyle = '#c45c1a'; ctx.fillRect(40, 90, 80, 50);\n  ctx.fillStyle = '#8b2e1a'; ctx.beginPath(); ctx.moveTo(30,90); ctx.lineTo(80,50); ctx.lineTo(130,90); ctx.fill();\n  ctx.fillStyle = '#8fd3ff'; ctx.beginPath(); ctx.ellipse(240, 170, 40, 14, 0, 0, Math.PI*2); ctx.fill();\n  ctx.font = '24px sans-serif'; ctx.fillText('🎄', 70, 80); ctx.fillText('🛷', 210, 90); ctx.fillText('☕', 100, 120);\n  if (typeof guy === 'function') guy(ctx, 160, 176, 12, '#3a86ff');\n}\n",
            "drawWinter thumb",
            "function drawWinter(",
        )

    html = replace_once(
        html,
        "  {id:'shelter', name:'Wagwell Shelter', emoji:'🐾', tag:'Rescue town strays, cheer them up, and match them with visiting families — or send a pal to your own pet collection!', draw: drawShelter, playable: true, isNew: true},\n",
        "  {id:'shelter', name:'Wagwell Shelter', emoji:'🐾', tag:'Rescue town strays, cheer them up in the grooming salon, match them with visiting families, and enter pet contests judged by Judge Bramble!', draw: drawShelter, playable: true, isNew: true},\n  {id:'winter', name:'Pinebell Village', emoji:'🎄', tag:'A cozy original winter village: sled timed runs on Sledwhistle Hill, skate Glassgill Pond, build a snow pal, sip cocoa at Mugsy’s, and toss snowballs with real friends only.', draw: drawWinter, playable: true, isNew: true},\n",
        "GAMES winter + salon tag",
    )
    html = replace_once(
        html,
        "  {id:'mansion', name:'Mallowmist Manor', emoji:'🕯️', tag:'A cute haunted house! Solve notes, levers, and a picture puzzle, then tip-toe past Nimble the Nook-Ghost. Getting caught means everyone is okay. Flip on Less scary for a milder mood.', draw: drawMansion, playable: true, isNew: true},\n",
        "  {id:'mansion', name:'Mallowmist Manor', emoji:'🕯️', tag:'A cute haunted house with new rooms and a hidden Secret Attic! Solve simple puzzles, follow a clue chain to a special reward, and tip-toe past Nimble. Getting caught means everyone is okay.', draw: drawMansion, playable: true, isNew: true},\n",
        "GAMES mansion tag",
    )

    html = insert_after(
        html,
        "    {id:'shelter', name:'Wagwell Shelter', emoji:'🐾', keys:['rubloxShelter']},\n",
        "    {id:'winter', name:'Pinebell Village', emoji:'🎄', keys:['rubloxWinter']},\n",
        "RESET_GAMES winter",
        "keys:['rubloxWinter']",
    )

    # Obby IIFE runtimes
    rt_s = html.find("  /* ---------- Mallowmist Manor ---------- */")
    rt_e = html.find("\n  function stop(){", rt_s)
    if rt_s < 0 or rt_e < 0:
        raise InjectError("runtime block markers missing")
    html = html[:rt_s] + mn_rt.rstrip() + "\n" + sh_rt.rstrip() + "\n" + wn_rt.rstrip() + "\n" + html[rt_e:]

    if "id=\"wnBox\"" not in html and 'id="wnBox"' not in html:
        html = insert_after(
            html,
            '  <button type="button" id="shUpBtn">🏠 Upgrade kennels</button>\n',
            wn_hud + "\n",
            "winter hud html",
            'id="wnBox"',
        )
    if "#wnBox{" not in html:
        html = insert_after(
            html,
            '@media (max-width:700px){ #shAct{bottom:120px} #shHomeBtn{bottom:184px} #shUpBtn{bottom:184px} }\n</style>',
            "\n<style id=\"wnCss\">\n" + wn_css + "\n</style>",
            "winter hud css",
            "#wnBox{",
        )

    html = insert_after(
        html,
        "else if (mode === 'shelter') buildShelter();",
        " else if (mode === 'winter') buildWinter();",
        "build winter",
        "buildWinter()",
    )

    html = html.replace(
        "'camp', 'elevator', 'mansion', 'shelter'].includes(m) ? m : 'obby'; diff = mode === 'race' || mode === 'splash' || mode === 'hide' || mode === 'fashion' || mode === 'autumn' || mode === 'petisland' || mode === 'bakery' || mode === 'waterpark' || mode === 'photostudio' || mode === 'tower' || mode === 'icecream' || mode === 'pethotel' || mode === 'stable' || mode === 'haunt' || mode === 'dance' || mode === 'dreamhouse' || mode === 'lantern' || mode === 'party' || mode === 'snowfest' || mode === 'cafe' || mode === 'fish' || mode === 'petshow' || mode === 'hunt' || mode === 'garden' || mode === 'meadow' || mode === 'rides' || mode === 'hive' || mode === 'camp' || mode === 'elevator' || mode === 'mansion' || mode === 'shelter' ? null : d;",
        "'camp', 'elevator', 'mansion', 'shelter', 'winter'].includes(m) ? m : 'obby'; diff = mode === 'race' || mode === 'splash' || mode === 'hide' || mode === 'fashion' || mode === 'autumn' || mode === 'petisland' || mode === 'bakery' || mode === 'waterpark' || mode === 'photostudio' || mode === 'tower' || mode === 'icecream' || mode === 'pethotel' || mode === 'stable' || mode === 'haunt' || mode === 'dance' || mode === 'dreamhouse' || mode === 'lantern' || mode === 'party' || mode === 'snowfest' || mode === 'cafe' || mode === 'fish' || mode === 'petshow' || mode === 'hunt' || mode === 'garden' || mode === 'meadow' || mode === 'rides' || mode === 'hive' || mode === 'camp' || mode === 'elevator' || mode === 'mansion' || mode === 'shelter' || mode === 'winter' ? null : d;",
        1,
    )

    html = insert_before(
        html,
        "mode === 'mansion' || mode === 'shelter' || mode === 'hunt' || mode === 'elevator') && (B.onGround || B.vy <= 0) && up > 0 && up <= .62)",
        "mode === 'winter' || ",
        "walk-up winter",
        "mode === 'winter' || mode === 'mansion'",
    )
    html = insert_before(
        html,
        "mode === 'mansion' || mode === 'shelter' || mode === 'hunt' || mode === 'elevator'){ // pull the camera in front of walls so buildings don't block the view",
        "mode === 'winter' || ",
        "orbit clip winter",
        "mode === 'winter' || mode === 'mansion' || mode === 'shelter' || mode === 'hunt' || mode === 'elevator'){ // pull the camera",
    )
    html = insert_after(
        html,
        "if (mode === 'mansion' || mode === 'shelter'){ if (P.y < -25) respawn(); return; }",
        "\n    if (mode === 'winter'){ if (P.y < -25) respawn(); return; }",
        "winter fall catch",
        "mode === 'winter'){ if (P.y < -25)",
    )

    html = insert_after(
        html,
        "$('#obby').classList.toggle('shmode', mode === 'shelter');",
        " $('#obby').classList.toggle('wnmode', mode === 'winter');",
        "wnmode class",
        "toggle('wnmode'",
    )
    html = insert_after(
        html,
        "{ const _sh = document.getElementById('shBox'); if (_sh) _sh.style.display = mode === 'shelter' ? '' : 'none'; }",
        " { const _wn = document.getElementById('wnBox'); if (_wn) _wn.style.display = mode === 'winter' ? '' : 'none'; }",
        "wn hud box",
        "getElementById('wnBox')",
    )

    html = insert_after(
        html,
        "else if (mode === 'shelter') banner('🐾 Welcome to Wagwell Shelter! Rescue strays, cheer them up, and match them with visiting families.');\n",
        "    else if (mode === 'winter') banner('🎄 Welcome to Pinebell Village! Sled, skate, build a snow pal, and sip cocoa.');\n",
        "winter banner",
        "Welcome to Pinebell Village",
    )
    html = insert_after(
        html,
        " : mode === 'shelter' ? '🎮 Left stick move · Ⓐ jump · Ⓧ rescue / care / desk · Ⓨ send home · ☰ menu'",
        " : mode === 'winter' ? '🎮 Left stick move / steer · Ⓐ jump · Ⓧ act · Ⓑ hop off or cash laps · ☰ menu'",
        "winter xbox tip",
        "mode === 'winter' ? '🎮 Left stick move",
    )

    # Fix missed mansion/shelter updates and add winter
    html = insert_after(
        html,
        "if (typeof elevUpdate === 'function') elevUpdate(dt);",
        " if (typeof mnUpdate === 'function' && mode === 'mansion') mnUpdate(dt); if (typeof shUpdate === 'function' && mode === 'shelter') shUpdate(dt); if (typeof wnUpdate === 'function' && mode === 'winter') wnUpdate(dt);",
        "update loop mn/sh/wn",
        "wnUpdate(dt)",
    )

    if "mode === 'winter' && typeof wnKey" not in html:
        html = html.replace(
            "if (mode === 'shelter' && typeof shKey === 'function' && shKey(e)) return;",
            "if (mode === 'shelter' && typeof shKey === 'function' && shKey(e)) return;\n      if (mode === 'winter' && typeof wnKey === 'function' && wnKey(e)) return;",
        )
    if "mode === 'winter' && typeof wnPad" not in html:
        html = html.replace(
            "if (mode === 'shelter' && typeof shPad === 'function' && shPad(jp)) return;",
            "if (mode === 'shelter' && typeof shPad === 'function' && shPad(jp)) return;\n    if (mode === 'winter' && typeof wnPad === 'function' && wnPad(jp, s)) return;",
            1,
        )

    html = insert_after(
        html,
        "if (typeof shelterStop === 'function') shelterStop();",
        " if (typeof winterStop === 'function') winterStop();",
        "winter stop",
        "winterStop()",
    )
    html = insert_after(
        html,
        "else if (d.t === 'sh'){ try { if (typeof shFromNet === 'function') shFromNet(g, d); } catch (e){} }",
        "\n    else if (d.t === 'wn'){ try { if (typeof wnFromNet === 'function') wnFromNet(g, d); } catch (e){} }",
        "winter guest net",
        "d.t === 'wn'",
    )
    html = insert_after(
        html,
        "case 'sh': try { if (typeof shFromHost === 'function') shFromHost(d); } catch (e){} break;",
        "\n      case 'wn': try { if (typeof wnFromHost === 'function') wnFromHost(d); } catch (e){} break;",
        "winter host net",
        "case 'wn':",
    )

    html_path.write_text(html)
    (ROOT / "version.json").write_text(json.dumps({"build": BUILD}) + "\n")

    # stamp helpers
    for rel, old, new in (
        ("dev/elevator/inject.py", f'BUILD = "{OLD_BUILD}"', f'BUILD = "{BUILD}"'),
        ("dev/elevator/refresh.py", f'BUILD = "{OLD_BUILD}"', f'BUILD = "{BUILD}"'),
    ):
        p = ROOT / rel
        t = p.read_text()
        if old in t:
            t = t.replace(old, new, 1)
        if rel.endswith("refresh.py"):
            t = t.replace(f'OLD_BUILD = "2026.11.20-4"', f'OLD_BUILD = "{OLD_BUILD}"', 1)
            t = t.replace("bump BUILD to 2026.11.20-5", f"bump BUILD to {BUILD}")
        p.write_text(t)

    for p in (ROOT / "tests").glob("*.js"):
        t = p.read_text()
        nt = t.replace(OLD_BUILD, BUILD).replace(OLD_BUILD.replace(".", r"\."), BUILD.replace(".", r"\."))
        if nt != t:
            p.write_text(nt)

    print("inject ok, BUILD", BUILD)
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except InjectError as exc:
        print("inject failed:", exc, file=sys.stderr)
        raise SystemExit(1)
