#!/usr/bin/env python3
"""Wire Pawsley Vet Clinic into the PR #50 branch (on top of manor/salon/winter)."""
from __future__ import annotations
from pathlib import Path
import json
import sys

ROOT = Path(__file__).resolve().parents[2]
BUILD = "2026.11.20-7"
OLD_BUILD = "2026.11.20-6"


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
    vet_logic = (ROOT / "dev/vet/vet_logic.js").read_text()
    vt_rt = (ROOT / "dev/vet/runtime.js").read_text()
    vt_css = (ROOT / "dev/vet/hud.css").read_text()
    vt_hud = (ROOT / "dev/vet/hud.html").read_text()

    html = html.replace(f"const BUILD = '{OLD_BUILD}';", f"const BUILD = '{BUILD}';", 1)
    if f"const BUILD = '{BUILD}';" not in html:
        raise InjectError("BUILD stamp missing")

    if "/* Pawsley Vet Clinic — original first-person clinic" not in html:
        end = html.find("/* New optional avatar looks")
        if end < 0:
            raise InjectError("logic block end marker missing")
        html = html[:end] + vet_logic.rstrip() + "\n\n" + html[end:]

    # First-script thumbnail lives just before drawHaunt (2-space indent).
    if "function drawVet(ctx){\n  if (typeof sky === 'function') sky(ctx, '#b8e4f2'" not in html:
        html = replace_once(
            html,
            "  if (typeof guy === 'function') guy(ctx, 160, 176, 12, '#3a86ff');\n}\nfunction drawHaunt(ctx){",
            "  if (typeof guy === 'function') guy(ctx, 160, 176, 12, '#3a86ff');\n}\nfunction drawVet(ctx){\n"
            "  if (typeof sky === 'function') sky(ctx, '#b8e4f2', '#f7f1de');\n"
            "  ctx.fillStyle = '#f3e6c8'; ctx.fillRect(40, 70, 240, 110);\n"
            "  ctx.fillStyle = '#d9eef6'; ctx.fillRect(70, 90, 70, 70);\n"
            "  ctx.fillStyle = '#e4f3df'; ctx.fillRect(160, 90, 50, 70);\n"
            "  ctx.fillStyle = '#8b5a2b'; ctx.fillRect(148, 130, 36, 30);\n"
            "  ctx.font = '26px sans-serif'; ctx.fillText('🩺', 84, 86); ctx.fillText('🐾', 200, 86); ctx.fillText('📋', 155, 120);\n"
            "  if (typeof guy === 'function') guy(ctx, 160, 176, 12, '#6ec6ff');\n"
            "}\nfunction drawHaunt(ctx){",
            "drawVet first-script thumb",
        )

    html = insert_after(
        html,
        "  {id:'winter', name:'Pinebell Village', emoji:'🎄', tag:'A cozy original winter village: sled timed runs on Sledwhistle Hill, skate Glassgill Pond, build a snow pal, sip cocoa at Mugsy’s, and toss snowballs with real friends only.', draw: drawWinter, playable: true, isNew: true},\n",
        "  {id:'vet', name:'Pawsley Vet Clinic', emoji:'🩺', tag:'Always first-person clinic with many connected rooms. Take a chart, diagnose with tools, treat, then cuddle pals until a happy pickup. Everyone gets better!', draw: drawVet, playable: true, isNew: true},\n",
        "GAMES vet",
        "{id:'vet', name:'Pawsley Vet Clinic'",
    )
    html = insert_after(
        html,
        "    {id:'winter', name:'Pinebell Village', emoji:'🎄', keys:['rubloxWinter']},\n",
        "    {id:'vet', name:'Pawsley Vet Clinic', emoji:'🩺', keys:['rubloxVet']},\n",
        "RESET_GAMES vet",
        "keys:['rubloxVet']",
    )

    if "  /* ---------- Pawsley Vet Clinic ---------- */" not in html:
        rt_s = html.find("  /* ---------- Mallowmist Manor ---------- */")
        rt_e = html.find("\n  function stop(){", rt_s)
        if rt_s < 0 or rt_e < 0:
            raise InjectError("runtime block markers missing")
        html = html[:rt_e] + vt_rt.rstrip() + "\n" + html[rt_e:]

    if 'id="vtBox"' not in html:
        html = insert_after(
            html,
            '  <button type="button" id="wnAct">✨ Do it</button>\n',
            vt_hud + "\n",
            "vet hud html",
            'id="vtBox"',
        )
    if "#vtBox{" not in html:
        html = insert_after(
            html,
            '@media (max-width:700px){ #wnAct{bottom:120px} }\n\n</style>',
            "\n<style id=\"vtCss\">\n" + vt_css + "\n</style>",
            "vet hud css",
            "#vtBox{",
        )

    html = insert_after(
        html,
        "else if (mode === 'winter') buildWinter();",
        " else if (mode === 'vet') buildVet();",
        "build vet",
        "mode === 'vet') buildVet();",
    )

    html = replace_once(
        html,
        "'camp', 'elevator', 'mansion', 'shelter', 'winter'].includes(m) ? m : 'obby';",
        "'camp', 'elevator', 'mansion', 'shelter', 'winter', 'vet'].includes(m) ? m : 'obby';",
        "start whitelist vet",
    )
    html = replace_once(
        html,
        "mode === 'shelter' || mode === 'winter' ? null : d;",
        "mode === 'shelter' || mode === 'winter' || mode === 'vet' ? null : d;",
        "start diff vet",
    )

    html = insert_before(
        html,
        "mode === 'winter' || mode === 'mansion' || mode === 'shelter' || mode === 'hunt' || mode === 'elevator') && (B.onGround || B.vy <= 0) && up > 0 && up <= .62)",
        "mode === 'vet' || ",
        "walk-up vet",
        "mode === 'vet' || mode === 'winter' || mode === 'mansion'",
    )
    html = insert_before(
        html,
        "mode === 'winter' || mode === 'mansion' || mode === 'shelter' || mode === 'hunt' || mode === 'elevator'){ // pull the camera in front of walls so buildings don't block the view",
        "mode === 'vet' || ",
        "orbit clip vet",
        "mode === 'vet' || mode === 'winter' || mode === 'mansion'",
    )
    html = insert_after(
        html,
        "if (mode === 'winter'){ if (P.y < -25) respawn(); return; }",
        "\n    if (mode === 'vet'){ if (P.y < -25) respawn(); return; }",
        "vet fall catch",
        "mode === 'vet'){ if (P.y < -25)",
    )

    html = insert_after(
        html,
        "$('#obby').classList.toggle('wnmode', mode === 'winter');",
        " $('#obby').classList.toggle('vtmode', mode === 'vet');",
        "vtmode class",
        "toggle('vtmode'",
    )
    html = insert_after(
        html,
        "{ const _sh = document.getElementById('shBox'); if (_sh) _sh.style.display = mode === 'shelter' ? '' : 'none'; }",
        " { const _wn = document.getElementById('wnBox'); if (_wn) _wn.style.display = mode === 'winter' ? '' : 'none'; } { const _vt = document.getElementById('vtBox'); if (_vt) _vt.style.display = mode === 'vet' ? '' : 'none'; }",
        "wn+vt hud boxes",
        "getElementById('vtBox')",
    )

    html = insert_after(
        html,
        "else if (mode === 'shelter') banner('🐾 Welcome to Wagwell Shelter! Rescue strays, cheer them up, and match them with visiting families.');\n",
        "    else if (mode === 'winter') banner('🎄 Welcome to Pinebell Village! Sled, skate, build a snow pal, and sip cocoa.');\n"
        "    else if (mode === 'vet') banner('🩺 Welcome to Pawsley Vet Clinic! First-person only — walk the rooms, check the chart, and help every pal feel better.');\n",
        "winter+vet start banners",
        "mode === 'vet') banner(",
    )
    html = insert_after(
        html,
        " : mode === 'winter' ? '🎮 Left stick move / steer · Ⓐ jump · Ⓧ act · Ⓑ hop off or cash laps · ☰ menu'",
        " : mode === 'vet' ? '🎮 Left stick move · right stick look · Ⓐ interact · Ⓧ interact · ☰ menu'",
        "vet xbox tip",
        "mode === 'vet' ? '🎮 Left stick move",
    )

    html = insert_after(
        html,
        "if (typeof wnUpdate === 'function' && mode === 'winter') wnUpdate(dt);",
        " if (typeof vtUpdate === 'function' && mode === 'vet') vtUpdate(dt);",
        "update loop vet",
        "mode === 'vet') vtUpdate(dt)",
    )

    if html.count("if (mode === 'winter' && typeof wnKey === 'function' && wnKey(e)) return;") == 2:
        html = html.replace(
            "if (mode === 'winter' && typeof wnKey === 'function' && wnKey(e)) return;",
            "if (mode === 'winter' && typeof wnKey === 'function' && wnKey(e)) return;\n      if (mode === 'vet' && typeof vtKey === 'function' && vtKey(e)) return;",
        )
    elif "mode === 'vet' && typeof vtKey" not in html:
        raise InjectError("wnKey hook count unexpected")

    html = insert_after(
        html,
        "if (mode === 'winter' && typeof wnPad === 'function' && wnPad(jp, s)) return;",
        "\n    if (mode === 'vet' && typeof vtPad === 'function' && vtPad(jp, s)) return;",
        "vet pad",
        "mode === 'vet' && typeof vtPad",
    )

    html = insert_after(
        html,
        "if (typeof shelterStop === 'function') shelterStop();",
        " if (typeof winterStop === 'function') winterStop(); if (typeof vetStop === 'function') vetStop();",
        "winter+vet stop",
        "vetStop()",
    )
    html = insert_after(
        html,
        "else if (d.t === 'wn'){ try { if (typeof wnFromNet === 'function') wnFromNet(g, d); } catch (e){} }",
        "\n    else if (d.t === 'vt'){ try { if (typeof vtFromNet === 'function') vtFromNet(g, d); } catch (e){} }",
        "vet guest net",
        "d.t === 'vt'",
    )
    html = insert_after(
        html,
        "case 'wn': try { if (typeof wnFromHost === 'function') wnFromHost(d); } catch (e){} break;",
        "\n      case 'vt': try { if (typeof vtFromHost === 'function') vtFromHost(d); } catch (e){} break;",
        "vet host net",
        "case 'vt':",
    )

    html = replace_once(
        html,
        "function fpOn(){ return running && !(pt && pt.drive) && (fp.on || !!(typeof mode !== 'undefined' && mode === 'dreamhouse' && typeof dh !== 'undefined' && dh && !dh.intro)); }",
        "function fpOn(){ return running && !(pt && pt.drive) && (fp.on || !!(typeof mode !== 'undefined' && ((mode === 'dreamhouse' && typeof dh !== 'undefined' && dh && !dh.intro) || mode === 'vet'))); }",
        "fpOn vet lock",
    )
    html = insert_after(
        html,
        "if (!on && typeof mode !== 'undefined' && mode === 'dreamhouse' && typeof dh !== 'undefined' && dh){ on = true; if (fp.on) return; }",
        "\n    if (!on && typeof mode !== 'undefined' && mode === 'vet'){ on = true; if (fp.on) return; }",
        "setFP vet lock",
        "mode === 'vet'){ on = true; if (fp.on) return; }",
    )

    html_path.write_text(html)
    (ROOT / "version.json").write_text(json.dumps({"build": BUILD}) + "\n")

    reset_p = ROOT / "dev/reset/reset_logic.js"
    rt = reset_p.read_text()
    if "keys:['rubloxVet']" not in rt:
        needle = "    {id:'winter', name:'Pinebell Village', emoji:'🎄', keys:['rubloxWinter']},\n"
        if needle not in rt:
            raise InjectError("reset_logic winter needle missing")
        rt = rt.replace(
            needle,
            needle + "    {id:'vet', name:'Pawsley Vet Clinic', emoji:'🩺', keys:['rubloxVet']},\n",
            1,
        )
        reset_p.write_text(rt)

    for rel, old, new in (
        ("dev/elevator/inject.py", f'BUILD = "{OLD_BUILD}"', f'BUILD = "{BUILD}"'),
        ("dev/elevator/refresh.py", f'BUILD = "{OLD_BUILD}"', f'BUILD = "{BUILD}"'),
    ):
        p = ROOT / rel
        t = p.read_text()
        if old in t:
            t = t.replace(old, new, 1)
        if rel.endswith("refresh.py"):
            t = t.replace(f'OLD_BUILD = "2026.11.20-5"', f'OLD_BUILD = "{OLD_BUILD}"', 1)
            t = t.replace("bump BUILD to 2026.11.20-6", f"bump BUILD to {BUILD}")
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
