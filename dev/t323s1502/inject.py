#!/usr/bin/env python3
"""Wire t323s1502 six features into index.html and bump BUILD to 2026.11.20-9."""
from __future__ import annotations
from pathlib import Path
import json
import sys

ROOT = Path(__file__).resolve().parents[2]
BUILD = "2026.11.20-9"
OLD_BUILD = "2026.11.20-8"


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


def replace_block(html: str, start: str, old_end: str, new: str, label: str) -> str:
    i = html.find(start)
    if i < 0:
        raise InjectError(f"missing start for {label}")
    j = html.find(old_end, i)
    if j < 0:
        raise InjectError(f"missing end for {label}")
    j += len(old_end)
    return html[:i] + new.rstrip() + "\n" + html[j:]


def insert_after(html: str, needle: str, extra: str, label: str, once: str | None = None) -> str:
    if once and once in html:
        return html
    return replace_once(html, needle, needle + extra, label)


def stamp_build(text: str) -> str:
    return text.replace(OLD_BUILD, BUILD).replace(OLD_BUILD.replace(".", r"\."), BUILD.replace(".", r"."))


def main() -> int:
    html_path = ROOT / "index.html"
    html = html_path.read_text()

    vet_logic = (ROOT / "dev/vet/vet_logic.js").read_text()
    wn_logic = (ROOT / "dev/winter/winter_logic.js").read_text()
    el_logic = (ROOT / "dev/elevator/elev_logic.js").read_text()
    mm_logic = (ROOT / "dev/mermaid/mermaid_logic.js").read_text()
    fs_logic = (ROOT / "dev/fashion/fashion_show_logic.js").read_text()
    pb_logic = (ROOT / "dev/photobooth/booth_logic.js").read_text()
    vt_rt = (ROOT / "dev/vet/runtime.js").read_text()
    wn_rt = (ROOT / "dev/winter/runtime.js").read_text()
    el_rt = (ROOT / "dev/elevator/runtime.js").read_text()
    mm_rt = (ROOT / "dev/mermaid/runtime.js").read_text()
    pb_rt = (ROOT / "dev/photobooth/runtime.js").read_text()
    vt_css = (ROOT / "dev/vet/hud.css").read_text()
    wn_css = (ROOT / "dev/winter/hud.css").read_text()
    mm_css = (ROOT / "dev/mermaid/hud.css").read_text()
    pb_css = (ROOT / "dev/photobooth/hud.css").read_text()
    wn_hud = (ROOT / "dev/winter/hud.html").read_text()
    mm_hud = (ROOT / "dev/mermaid/hud.html").read_text()
    pb_hud = (ROOT / "dev/photobooth/hud.html").read_text()

    html = html.replace(f"const BUILD = '{OLD_BUILD}';", f"const BUILD = '{BUILD}';", 1)
    if f"const BUILD = '{BUILD}';" not in html:
        raise InjectError("BUILD stamp missing")

    # Replace inlined logic modules
    html = replace_block(
        html,
        "/* Pinebell Village — original cozy winter village",
        "    wnBuyCocoa, wnServeCocoa, wnWire\n  };\n});",
        wn_logic,
        "winter logic",
    )
    html = replace_block(
        html,
        "/* Pawsley Vet Clinic — original first-person clinic",
        "    vtWire, vtApply\n  };\n});",
        vet_logic,
        "vet logic",
    )
    html = replace_block(
        html,
        "/* Wobblevator — original Rublox elevator hop",
        "  root.ElevRules = api;\n  if (typeof module !== 'undefined' && module.exports) module.exports = api;\n})(typeof globalThis !== 'undefined' ? globalThis : this);",
        el_logic.rstrip(),
        "elev logic",
    )

    # New logic modules before avatar looks
    if "root.MermaidRules" not in html:
        marker = "/* New optional avatar looks — Y2K, grunge, cozy, fancy."
        i = html.find(marker)
        if i < 0:
            raise InjectError("avatar looks marker missing")
        html = html[:i] + mm_logic.rstrip() + "\n\n" + fs_logic.rstrip() + "\n\n" + pb_logic.rstrip() + "\n\n" + html[i:]

    # Runtimes
    html = replace_block(
        html,
        "  /* ---------- Pinebell Village ---------- */",
        "  /* ---------- Pawsley Vet Clinic ---------- */",
        wn_rt.rstrip() + "\n\n  /* ---------- Pawsley Vet Clinic ---------- */",
        "winter runtime",
    )
    html = replace_block(
        html,
        "  /* ---------- Pawsley Vet Clinic ---------- */",
        "  function stop(){",
        vt_rt.rstrip() + "\n\n  " + mm_rt.strip() + "\n\n  function stop(){",
        "vet runtime + mermaid",
    )

    # Elevator runtime: apply the same unique replacements that landed in the source file
    if "function elevOwnedGifts()" not in html:
        # use current source snippets by replacing the old gift function still in html? 
        # After we replaced elev logic only, runtime may still be old.
        old_gift = """  function elevTryGift(){
    if (!elv || elevIsGuest()) return false;
    const seat = elevNearPal();
    if (!seat) return false;
    if (!((elv.sv.pack && elv.sv.pack.ribbonwrap) | 0)) return false;
    const r = ElevRules.elevGiftPal(elv.sv, elv.run, seat.id);"""
        if old_gift not in html:
            raise InjectError("old elevTryGift missing in index")
        # Replace entire elevator runtime from header to winter header if possible
        html = replace_block(
            html,
            "  /* ---------- Wobblevator",
            "  /* ---------- Pinebell Village ---------- */",
            el_rt.rstrip() + "\n\n  /* ---------- Pinebell Village ---------- */",
            "elev runtime",
        )

    # Fashion solo / optional fields (inlined copy of fashion.js)
    html = html.replace("    else ord = ['H', ...FS_NPCS.map(n => n.uid)];", "    else ord = [fsUid()];", 1)
    html = html.replace(
        "Get a surprise theme, style a look in the pastel prep room, strut the glam runway with a pose, and get rated by the other models and judges! 👑",
        "Get a surprise theme, style a look in the pastel prep room, strut the glam runway with a pose, and get scored by a friendly judge panel! 👑",
        1,
    )
    html = html.replace(
        "function fsProg(){ const p = load('rubloxFashion', null), o = Object.assign({xp: 0, shows: 0, wins: 0, best: 0, vip: false}, p && typeof p === 'object' ? p : {});\n    o.vip = !!o.vip; o.xp = Math.max(0, o.xp | 0); o.shows = Math.max(0, o.shows | 0); o.wins = Math.max(0, o.wins | 0); o.best = Math.max(0, +o.best || 0); return o; }",
        "function fsProg(){ const p = load('rubloxFashion', null), o = Object.assign({xp: 0, shows: 0, wins: 0, best: 0, vip: false, judgeShows: 0, lastTheme: ''}, p && typeof p === 'object' ? p : {});\n    o.vip = !!o.vip; o.xp = Math.max(0, o.xp | 0); o.shows = Math.max(0, o.shows | 0); o.wins = Math.max(0, o.wins | 0); o.best = Math.max(0, +o.best || 0); o.judgeShows = Math.max(0, o.judgeShows | 0); o.lastTheme = typeof o.lastTheme === 'string' ? o.lastTheme.slice(0, 80) : ''; return o; }",
        1,
    )
    html = html.replace(
        "p.xp += gain; p.shows++; if (place === 0) p.wins++; p.best = Math.max(p.best, avg); save('rubloxFashion', p);",
        "p.xp += gain; p.shows++; if (!mp.on) p.judgeShows = (p.judgeShows | 0) + 1; if (typeof FS_THEMES !== 'undefined' && FS_THEMES[fs.th]) p.lastTheme = FS_THEMES[fs.th].name; if (place === 0) p.wins++; p.best = Math.max(p.best, avg); save('rubloxFashion', p);",
        1,
    )

    # CSS
    if ".mmode #mmBox" not in html:
        # append after winter/vet css if present, else before </style> last
        css = "\n" + wn_css + "\n" + mm_css + "\n" + pb_css + "\n"
        # wn css may already be partially present — append mermaid/booth always; winter may need refresh
        needle = "</style>"
        # last stylesheet close in head: find first .wnmode or append before last </style> in first 200k?
        idx = html.find("#wnAct.show{display:block}")
        if idx >= 0:
            # insert mermaid+booth css after winter block end; replace winter css with latest
            pass
        # simplest: insert before </style> that follows vet css if any
        marker = "@media (max-width:700px){ #wnAct{bottom:120px} }"
        if marker in html:
            html = html.replace(marker, marker + "\n" + mm_css + "\n" + pb_css + "\n" + "\n".join(l for l in wn_css.splitlines() if l.startswith("#wnWrap") or l.startswith(".wnwrap") or l.startswith(".wnnight") or l.startswith("#wnWrap")), 1)
        else:
            # fall back: before first </style>
            html = replace_once(html, "</style>", css + "</style>", "css fallback")
        if "#wnWrap" not in html:
            html = html.replace(marker if marker in html else "</style>", (marker + "\n" if marker in html else "") + "\n" + wn_css + "\n" + mm_css + "\n" + pb_css + ("\n</style>" if marker not in html else ""), 1)

    # If winter wrap css still missing, append once more
    if "#wnWrap" not in html:
        html = insert_after(html, "</style>", "", "noop")  # won't
        # insert before last </style>
        li = html.rfind("</style>")
        extra = "\n" + "\n".join([l for l in (wn_css + "\n" + mm_css + "\n" + pb_css).splitlines() if "#wnWrap" in l or l.startswith(".wnwrap") or l.startswith(".wnnight") or l.startswith("#mm") or l.startswith(".mmode") or l.startswith(".avbooth") or l.startswith("#avBooth") or l.startswith("#hubBooth") or l.startswith("#mmSwim") or l.startswith("#mmAct") or l.startswith("#mmBox")]) + "\n"
        html = html[:li] + extra + html[li:]

    # HUD html
    if 'id="wnWrap"' not in html:
        if 'id="wnBox"' in html:
            # replace winter hud chunk
            old = '  <div id="wnBox" style="display:none"><span id="wnHint"></span></div>\n  <button type="button" id="wnAct">✨ Do it</button>'
            if old in html:
                html = html.replace(old, wn_hud.strip(), 1)
            else:
                raise InjectError("wnBox needle missing")
        else:
            raise InjectError("wnBox missing")
    if 'id="mmBox"' not in html:
        html = insert_after(
            html,
            'id="vtAct"',
            " ignored",
            "tmp",
            once="id=\"mmBox\"",
        ) if False else html
        # insert after vet act button
        needle = '<button type="button" id="vtAct">🩺 Do it</button>'
        if needle not in html:
            # try shorter
            i = html.find('id="vtAct"')
            if i < 0:
                raise InjectError("vtAct missing")
            # find end of that tag line
            j = html.find("\n", i)
            html = html[:j+1] + mm_hud + "\n" + html[j+1:]
        else:
            html = html.replace(needle, needle + "\n" + mm_hud, 1)

    # Avatar photo booth button + modal
    if 'id="avBoothBtn"' not in html:
        needle = '<button class="big green" id="saveAv" style="margin-left:8px">💾 Save Avatar</button>'
        if needle not in html:
            raise InjectError("saveAv button missing")
        # pb_hud starts with the button then the modal
        html = html.replace(needle, needle + "\n" + pb_hud, 1)
    if 'id="hubBoothBtn"' not in html:
        needle = '<button class="big green" data-go="avatar" style="margin-left:8px">🧍 Make my Avatar</button>'
        if needle not in html:
            raise InjectError("hub avatar button missing")
        html = html.replace(
            needle,
            needle + '\n      <button class="big" id="hubBoothBtn" type="button" style="margin-left:8px">📸 Photo Booth</button>',
            1,
        )

    # Booth + fashion/mermaid logic already in first-script area; bind booth near avatar editor init
    if "function pbOpen()" not in html:
        marker = "try { buildAvatarEditor(); drawBig(); drawChip(); updateWelcome(); } catch (err) {}"
        if marker not in html:
            raise InjectError("avatar init marker missing")
        html = html.replace(marker, pb_rt.rstrip() + "\n" + marker, 1)

    # first-script thumbnail
    if "function drawMermaid(ctx){" not in html.split("function buildMermaid")[0]:
        # add a first-script copy after drawVet if present
        thumb = (
            "function drawMermaid(ctx){\n"
            "  if (typeof sky === 'function') sky(ctx, '#14738a', '#7ee0d6');\n"
            "  else { ctx.fillStyle = '#14738a'; ctx.fillRect(0,0,320,200); }\n"
            "  ctx.fillStyle = '#1c8ea3'; ctx.fillRect(0, 80, 320, 120);\n"
            "  ctx.font = '28px sans-serif'; ctx.fillText('🧜', 150, 130); ctx.fillText('🐚', 80, 110);\n"
            "  if (typeof guy === 'function') guy(ctx, 160, 176, 12, '#2ec4b6');\n"
            "}\n"
        )
        if "function drawVet(ctx){" in html:
            # insert after first drawVet block's closing before next function drawHaunt or similar — safer insert before GAMES? 
            pass
        if html.find("function drawMermaid(ctx){") < 0 or html.find("function drawMermaid(ctx){") > html.find("const GAMES"):
            needle = "  {id:'vet', name:'Pawsley Vet Clinic'"
            i = html.find(needle)
            # find a function draw just before GAMES
            g = html.find("const GAMES")
            pre = html.rfind("function draw", 0, g)
            # insert right before const GAMES
            if "function drawMermaid" not in html[g-800:g]:
                html = html[:g] + thumb + html[g:]

    # GAMES card
    html = insert_after(
        html,
        "  {id:'vet', name:'Pawsley Vet Clinic', emoji:'🩺', tag:'Always first-person clinic with many connected rooms. Take a chart, diagnose with tools, treat, then cuddle pals until a happy pickup. Everyone gets better!', draw: drawVet, playable: true, isNew: true},\n",
        "  {id:'mermaid', name:'Glimmergill Cove', emoji:'🧜', tag:'A cozy original undersea town! Pick a merfolk tail, swim up and down, collect shells, decorate a coral home, and make sea-pet friends. No scary monsters.', draw: drawMermaid, playable: true, isNew: true},\n",
        "GAMES mermaid",
        "{id:'mermaid', name:'Glimmergill Cove'",
    )
    # refresh vet tag slightly to mention ambulance
    html = html.replace(
        "Always first-person clinic with many connected rooms. Take a chart, diagnose with tools, treat, then cuddle pals until a happy pickup. Everyone gets better!",
        "First-person clinic with many rooms, plus cute ambulance trips around town to rescue pals and bring them in for care. Everyone gets better!",
        1,
    )
    html = html.replace(
        "A cozy original winter village: sled timed runs on Sledwhistle Hill, skate Glassgill Pond, build a snow pal, sip cocoa at Mugsy’s, and toss snowballs with real friends only.",
        "A cozy original winter village: hang holiday lights, wrap gifts for Ribbon Rue, sled, skate, build a snow pal, sip cocoa, and toss snowballs with real friends only.",
        1,
    )

    # Reset list (inlined)
    html = insert_after(
        html,
        "{id:'vet', name:'Pawsley Vet Clinic', emoji:'🩺', keys:['rubloxVet']},",
        "\n    {id:'mermaid', name:'Glimmergill Cove', emoji:'🧜', keys:['rubloxMermaid']},",
        "RESET mermaid",
        "keys:['rubloxMermaid']",
    )

    # start whitelist
    html = replace_once(
        html,
        "'camp', 'elevator', 'mansion', 'shelter', 'winter', 'vet'].includes(m)",
        "'camp', 'elevator', 'mansion', 'shelter', 'winter', 'vet', 'mermaid'].includes(m)",
        "start whitelist mermaid",
    )
    html = insert_after(
        html,
        "else if (mode === 'vet') buildVet();",
        " else if (mode === 'mermaid') buildMermaid();",
        "build mermaid",
        "mode === 'mermaid') buildMermaid()",
    )

    # body class, hud box, banners, tips, update, keys, pad, stop, net, gravity, steps, fall
    html = insert_after(
        html,
        "$('#obby').classList.toggle('vtmode', mode === 'vet');",
        " $('#obby').classList.toggle('mmode', mode === 'mermaid');",
        "mmode class",
        "toggle('mmode'",
    )
    html = insert_after(
        html,
        "{ const _vt = document.getElementById('vtBox'); if (_vt) _vt.style.display = mode === 'vet' ? '' : 'none'; }",
        " { const _mm = document.getElementById('mmBox'); if (_mm) _mm.style.display = mode === 'mermaid' ? '' : 'none'; }",
        "mm hud box",
        "getElementById('mmBox')",
    )
    html = insert_after(
        html,
        "else if (mode === 'vet') banner('🩺 Welcome to Pawsley Vet Clinic! First-person only — walk the rooms, check the chart, and help every pal feel better.');\n",
        "    else if (mode === 'mermaid') banner('🧜 Welcome to Glimmergill Cove! Swim up and down, collect shells, and decorate your coral home.');\n",
        "mermaid start banner",
        "mode === 'mermaid') banner(",
    )
    html = insert_after(
        html,
        " : mode === 'vet' ? '🎮 Left stick move · right stick look · Ⓐ interact · Ⓧ interact · ☰ menu'",
        " : mode === 'mermaid' ? '🎮 Left stick move · Ⓐ jump / swim up · LT/LB swim down · RT/RB swim up · Ⓧ act · ☰ menu'",
        "mermaid xbox tip",
        "mode === 'mermaid' ? '🎮 Left stick move",
    )
    html = insert_after(
        html,
        "if (typeof vtUpdate === 'function' && mode === 'vet') vtUpdate(dt);",
        " if (typeof mmUpdate === 'function' && mode === 'mermaid') mmUpdate(dt);",
        "update mermaid",
        "mode === 'mermaid') mmUpdate(dt)",
    )
    # also drive cam after vtUpdate
    if "vtDriveCam" not in html.split("function vtDriveCam")[-1][:200] or html.count("if (typeof vtDriveCam === 'function'") == 0:
        html = insert_after(
            html,
            "if (typeof vtUpdate === 'function' && mode === 'vet') vtUpdate(dt);",
            " if (typeof vtDriveCam === 'function' && mode === 'vet') vtDriveCam();",
            "drive cam",
            "vtDriveCam()",
        )

    # keys: hook mermaid next to vet (2 keydown sites)
    if html.count("if (mode === 'vet' && typeof vtKey === 'function' && vtKey(e)) return;") == 2:
        html = html.replace(
            "if (mode === 'vet' && typeof vtKey === 'function' && vtKey(e)) return;",
            "if (mode === 'vet' && typeof vtKey === 'function' && vtKey(e)) return;\n      if (mode === 'mermaid' && typeof mmKey === 'function' && mmKey(e)) return;",
        )
    elif "mode === 'mermaid' && typeof mmKey" not in html:
        raise InjectError("vetKey hook count unexpected for mermaid key")

    html = insert_after(
        html,
        "if (mode === 'vet' && typeof vtPad === 'function' && vtPad(jp, s)) return;",
        "\n    if (mode === 'mermaid' && typeof mmPad === 'function' && mmPad(jp, s)) return;",
        "mermaid pad",
        "mode === 'mermaid' && typeof mmPad",
    )
    html = insert_after(
        html,
        "if (typeof vetStop === 'function') vetStop();",
        " if (typeof mermaidStop === 'function') mermaidStop();",
        "mermaid stop",
        "mermaidStop()",
    )

    # gravity skip
    html = replace_once(
        html,
        "if (!climbing) P.vy = Math.max(-40, P.vy - GRAV * dt);",
        "if (!climbing && mode !== 'mermaid' && !(typeof vtDriving === 'function' && vtDriving())) P.vy = Math.max(-40, P.vy - GRAV * dt);",
        "gravity skip mermaid/drive",
    )

    # walk-up steps include mermaid
    html = html.replace(
        "mode === 'vet' || mode === 'winter'",
        "mode === 'vet' || mode === 'mermaid' || mode === 'winter'",
    )
    # the long includes list
    old_steps = "mode === 'tag' || mode === 'pets' || mode === 'hide' || mode === 'build' || mode === 'fashion' || mode === 'autumn' || mode === 'petisland' || mode === 'bakery' || mode === 'waterpark' || mode === 'photostudio' || mode === 'tower' || mode === 'icecream' || mode === 'pethotel' || mode === 'stable' || mode === 'haunt' || mode === 'dance' || mode === 'dreamhouse' || mode === 'lantern' || mode === 'party' || mode === 'snowfest' || mode === 'cafe' || mode === 'fish' || mode === 'petshow' || mode === 'vet' || mode === 'winter'"
    if old_steps in html:
        html = html.replace(old_steps, old_steps + " || mode === 'mermaid'", 1)

    html = insert_after(
        html,
        "if (mode === 'vet'){ if (P.y < -25) respawn(); return; }",
        "\n    if (mode === 'mermaid'){ if (P.y < -25) respawn(); return; }",
        "mermaid fall catch",
        "mode === 'mermaid'){ if (P.y < -25)",
    )

    # fpOn / setFP allow third person while driving the ambulance
    html = replace_once(
        html,
        "function fpOn(){ return running && !(pt && pt.drive) && (fp.on || !!(typeof mode !== 'undefined' && ((mode === 'dreamhouse' && typeof dh !== 'undefined' && dh && !dh.intro) || mode === 'vet'))); }",
        "function fpOn(){ return running && !(pt && pt.drive) && (fp.on || !!(typeof mode !== 'undefined' && ((mode === 'dreamhouse' && typeof dh !== 'undefined' && dh && !dh.intro) || (mode === 'vet' && !(typeof vtDriving === 'function' && vtDriving()))))); }",
        "fpOn clinic vs drive",
    )
    html = replace_once(
        html,
        "if (!on && typeof mode !== 'undefined' && mode === 'vet'){ on = true; if (fp.on) return; }",
        "if (!on && typeof mode !== 'undefined' && mode === 'vet' && !(typeof vtDriving === 'function' && vtDriving())){ on = true; if (fp.on) return; }",
        "setFP clinic vs drive",
    )

    html_path.write_text(html)
    (ROOT / "version.json").write_text(json.dumps({"build": BUILD}) + "\n")

    # stamp tests and helper inject BUILD constants
    for p in (ROOT / "tests").glob("*.js"):
        t = p.read_text()
        nt = t.replace(OLD_BUILD, BUILD).replace(OLD_BUILD.replace(".", r"\."), BUILD.replace(".", r"\."))
        if nt != t:
            p.write_text(nt)
    for rel in (
        "dev/elevator/inject.py",
        "dev/elevator/refresh.py",
        "dev/vet/inject.py",
        "dev/doors/inject.py",
        "dev/t322s1476/inject.py",
    ):
        p = ROOT / rel
        if not p.exists():
            continue
        t = p.read_text()
        nt = t.replace(f'BUILD = "{OLD_BUILD}"', f'BUILD = "{BUILD}"').replace(
            f"BUILD = '{OLD_BUILD}'", f"BUILD = '{BUILD}'"
        )
        if nt != t:
            p.write_text(nt)

    # sanity
    checks = {
        "BUILD": f"const BUILD = '{BUILD}';" in html,
        "mermaid game": "{id:'mermaid', name:'Glimmergill Cove'" in html,
        "mermaid key": "rubloxMermaid" in html,
        "buildMermaid": "else if (mode === 'mermaid') buildMermaid();" in html,
        "avBooth": 'id="avBoothBtn"' in html and 'id="avBooth"' in html,
        "solo fashion": "else ord = [fsUid()];" in html,
        "ambulance": "function vtMountAmbulance" in html,
        "lights": "function wnPlaceLight" in html,
        "hearts": "function elevHeartTalk" in html,
        "booth logic": "PhotoBoothRules" in html,
        "mmUpdate": "mode === 'mermaid') mmUpdate(dt)" in html,
    }
    missing = [k for k, ok in checks.items() if not ok]
    if missing:
        raise InjectError("sanity failed: " + ", ".join(missing))
    print("injected", BUILD, "len", len(html))
    return 0


if __name__ == "__main__":
    try:
        sys.exit(main())
    except InjectError as e:
        print("INJECT ERROR:", e, file=sys.stderr)
        sys.exit(1)
