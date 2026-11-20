#!/usr/bin/env python3
"""Wire vote leftovers, Mallowmist Manor, Wagwell Shelter, and new avatar looks."""
from __future__ import annotations
from pathlib import Path
import json
import sys

ROOT = Path(__file__).resolve().parents[2]
BUILD = "2026.11.20-3"


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
    looks = (ROOT / "dev/avatar/looks.js").read_text()
    mn_rt = (ROOT / "dev/mansion/runtime.js").read_text()
    sh_rt = (ROOT / "dev/shelter/runtime.js").read_text()
    mn_css = (ROOT / "dev/mansion/hud.css").read_text()
    sh_css = (ROOT / "dev/shelter/hud.css").read_text()
    mn_hud = (ROOT / "dev/mansion/hud.html").read_text()
    sh_hud = (ROOT / "dev/shelter/hud.html").read_text()
    looks_draw = (ROOT / "dev/avatar/looks_draw.js").read_text()

    if "function drawMansion(" not in html:
        html = insert_before(
            html,
            "function drawHaunt(ctx){",
            "function drawMansion(ctx){\n  if (typeof sky === 'function') sky(ctx, '#2a2458', '#6b5b9a');\n  ctx.fillStyle = '#3d3358'; ctx.fillRect(40, 50, 240, 120);\n  ctx.fillStyle = '#2a2140'; ctx.beginPath(); ctx.moveTo(30,50); ctx.lineTo(160,10); ctx.lineTo(290,50); ctx.fill();\n  ctx.fillStyle = '#ffd23f'; ctx.fillRect(70, 80, 36, 36); ctx.fillRect(214, 80, 36, 36);\n  ctx.fillStyle = '#c4a574'; ctx.fillRect(140, 110, 40, 60);\n  ctx.font = '28px sans-serif'; ctx.fillText('🕯️', 148, 80); ctx.fillText('👻', 250, 48);\n  if (typeof guy === 'function') guy(ctx, 160, 176, 12, '#c9b6ff');\n}\nfunction drawShelter(ctx){\n  if (typeof sky === 'function') sky(ctx, '#b8e8ff', '#fff4d6');\n  ctx.fillStyle = '#8fd39a'; ctx.fillRect(0, 150, 320, 50);\n  ctx.fillStyle = '#f4d7a8'; ctx.fillRect(30, 80, 110, 80);\n  ctx.fillStyle = '#c45c1a'; ctx.beginPath(); ctx.moveTo(20,80); ctx.lineTo(85,40); ctx.lineTo(150,80); ctx.fill();\n  ctx.fillStyle = '#fff'; ctx.fillRect(180, 110, 90, 50);\n  ctx.font = '24px sans-serif'; ctx.fillText('🐾', 60, 130); ctx.fillText('🐱', 210, 140); ctx.fillText('🐶', 250, 140);\n  if (typeof guy === 'function') guy(ctx, 160, 176, 12, '#3a86ff');\n}\n",
            "menu thumbs",
            "function drawMansion(",
        )

    if "root.MansionRules" not in html:
        html = insert_before(
            html,
            "const GAMES = [",
            mansion_logic + "\n" + shelter_logic + "\n" + looks + "\n" + looks_draw + "\n",
            "logic modules",
        )

    html = insert_after(
        html,
        "  {id:'elevator', name:'Wobblevator', emoji:'🛗', tag:'Ride Bingle the Bellhop’s wobbly lift to surprise floors. Clear quirky mini-events, keep your streak, and hop back in — if a floor gets too wobbly, everyone is okay!', draw: drawElevator, playable: true, isNew: true},\n",
        "  {id:'mansion', name:'Mallowmist Manor', emoji:'🕯️', tag:'A cute haunted house! Solve notes, levers, and a picture puzzle, then tip-toe past Nimble the Nook-Ghost. Getting caught means everyone is okay. Flip on Less scary for a milder mood.', draw: drawMansion, playable: true, isNew: true},\n  {id:'shelter', name:'Wagwell Shelter', emoji:'🐾', tag:'Rescue town strays, cheer them up, and match them with visiting families — or send a pal to your own pet collection!', draw: drawShelter, playable: true, isNew: true},\n",
        "GAMES entries",
        "id:'mansion'",
    )

    if "keys:['rubloxMansion']" not in html:
        html = insert_after(
            html,
            "    {id:'garden', name:'Sunny Patch Garden', emoji:'🌱', keys:['rubloxGarden']},\n",
            "    {id:'elevator', name:'Wobblevator', emoji:'🛗', keys:['rubloxElevator']},\n    {id:'mansion', name:'Mallowmist Manor', emoji:'🕯️', keys:['rubloxMansion']},\n    {id:'shelter', name:'Wagwell Shelter', emoji:'🐾', keys:['rubloxShelter']},\n",
            "RESET_GAMES in page",
        )

    html = insert_after(
        html,
        "if (mode === 'elevator') buildElevator();",
        " else if (mode === 'mansion') buildMansion(); else if (mode === 'shelter') buildShelter();",
        "build modes",
        "buildMansion()",
    )

    html = html.replace(
        "'camp', 'elevator'].includes(m) ? m : 'obby'; diff = mode === 'race' || mode === 'splash' || mode === 'hide' || mode === 'fashion' || mode === 'autumn' || mode === 'petisland' || mode === 'bakery' || mode === 'waterpark' || mode === 'photostudio' || mode === 'tower' || mode === 'icecream' || mode === 'pethotel' || mode === 'stable' || mode === 'haunt' || mode === 'dance' || mode === 'dreamhouse' || mode === 'lantern' || mode === 'party' || mode === 'snowfest' || mode === 'cafe' || mode === 'fish' || mode === 'petshow' || mode === 'hunt' || mode === 'garden' || mode === 'meadow' || mode === 'rides' || mode === 'hive' || mode === 'camp' || mode === 'elevator' ? null : d;",
        "'camp', 'elevator', 'mansion', 'shelter'].includes(m) ? m : 'obby'; diff = mode === 'race' || mode === 'splash' || mode === 'hide' || mode === 'fashion' || mode === 'autumn' || mode === 'petisland' || mode === 'bakery' || mode === 'waterpark' || mode === 'photostudio' || mode === 'tower' || mode === 'icecream' || mode === 'pethotel' || mode === 'stable' || mode === 'haunt' || mode === 'dance' || mode === 'dreamhouse' || mode === 'lantern' || mode === 'party' || mode === 'snowfest' || mode === 'cafe' || mode === 'fish' || mode === 'petshow' || mode === 'hunt' || mode === 'garden' || mode === 'meadow' || mode === 'rides' || mode === 'hive' || mode === 'camp' || mode === 'elevator' || mode === 'mansion' || mode === 'shelter' ? null : d;",
        1,
    )

    html = insert_after(
        html,
        "mode === 'hunt' || mode === 'elevator') && (B.onGround || B.vy <= 0) && up > 0 && up <= .62)",
        " ",
        "walk-up noop check",
        "mode === 'mansion'",
    ) if "mode === 'mansion'" in html[html.find("B.onGround || B.vy"):html.find("B.onGround || B.vy")+400] else insert_before(
        html,
        "mode === 'hunt' || mode === 'elevator') && (B.onGround || B.vy <= 0) && up > 0 && up <= .62)",
        "mode === 'mansion' || mode === 'shelter' || ",
        "walk-up steps",
        "mode === 'mansion' || mode === 'shelter' || mode === 'hunt' || mode === 'elevator') && (B.onGround",
    )

    html = insert_after(
        html,
        "mode === 'hunt' || mode === 'elevator'){ // pull the camera in front of walls so buildings don't block the view",
        "",
        "clip already?",
        "mode === 'mansion' || mode === 'shelter' || mode === 'hunt' || mode === 'elevator'){ // pull the camera",
    ) if "mode === 'mansion' || mode === 'shelter' || mode === 'hunt' || mode === 'elevator'){ // pull the camera" in html else insert_before(
        html,
        "mode === 'hunt' || mode === 'elevator'){ // pull the camera in front of walls so buildings don't block the view",
        "mode === 'mansion' || mode === 'shelter' || ",
        "orbit camera clip",
    )

    html = insert_after(
        html,
        "if (mode === 'elevator'){ if (P.y < -2 && typeof elevCatchFall === 'function') elevCatchFall(); return; }",
        "\n    if (mode === 'mansion' || mode === 'shelter'){ if (P.y < -25) respawn(); return; }",
        "fall catch",
        "mode === 'mansion' || mode === 'shelter'){ if (P.y < -25)",
    )

    html = insert_after(
        html,
        "classList.toggle('elevmode', mode === 'elevator');",
        " $('#obby').classList.toggle('mnmode', mode === 'mansion'); $('#obby').classList.toggle('shmode', mode === 'shelter');",
        "mode css classes",
        "toggle('mnmode'",
    )

    html = insert_after(
        html,
        "{ const _elev = document.getElementById('elevBox'); if (_elev) _elev.style.display = mode === 'elevator' ? '' : 'none'; }",
        " { const _mn = document.getElementById('mnBox'); if (_mn) _mn.style.display = mode === 'mansion' ? '' : 'none'; } { const _sh = document.getElementById('shBox'); if (_sh) _sh.style.display = mode === 'shelter' ? '' : 'none'; }",
        "hud boxes",
        "getElementById('mnBox')",
    )

    html = insert_after(
        html,
        "else if (mode === 'pets') banner(pt && pt.s.pets.length ? '🐾 Welcome back, ' + pt.s.pets[pt.s.a].n + '!' : '🐾 Adopt a Pet! Drive to the Pet Shelter');\n",
        "    else if (mode === 'mansion') banner(typeof mnLess === 'function' && mnLess() ? '😌 Mallowmist Manor feels milder tonight.' : '🕯️ Welcome to Mallowmist Manor — find notes, solve the parlor pictures, and tip-toe past Nimble.');\n    else if (mode === 'shelter') banner('🐾 Welcome to Wagwell Shelter! Rescue strays, cheer them up, and match them with visiting families.');\n",
        "welcome banners",
        "Welcome to Mallowmist Manor",
    )

    html = insert_after(
        html,
        "mode === 'elevator' ? '🎮 Left stick move · Ⓐ jump · Ⓧ act / shop · Ⓨ floors · Ⓑ close popups · ☰ menu'",
        " : mode === 'mansion' ? '🎮 Left stick move · Ⓐ jump · Ⓧ read / flip / unlock · Ⓨ Less scary · ☰ menu' : mode === 'shelter' ? '🎮 Left stick move · Ⓐ jump · Ⓧ rescue / care / desk · Ⓨ send home · ☰ menu'",
        "xbox tips",
        "mode === 'mansion' ? '🎮 Left stick move",
    )

    html = insert_after(
        html,
        "if (evg) snowfestUpdate(dt)",
        "; if (typeof mnUpdate === 'function' && mode === 'mansion') mnUpdate(dt); if (typeof shUpdate === 'function' && mode === 'shelter') shUpdate(dt)",
        "update loop",
        "mnUpdate(dt)",
    )

    # key hooks: two occurrences of elevKey? use insert after first pattern carefully
    if "mode === 'mansion' && typeof mnKey" not in html:
        html = html.replace(
            "if (mode === 'elevator' && typeof elevKey === 'function' && elevKey(e)) return;",
            "if (mode === 'elevator' && typeof elevKey === 'function' && elevKey(e)) return;\n      if (mode === 'mansion' && typeof mnKey === 'function' && mnKey(e)) return;\n      if (mode === 'shelter' && typeof shKey === 'function' && shKey(e)) return;",
        )
    if "mode === 'mansion' && typeof mnPad" not in html:
        html = html.replace(
            "if (mode === 'elevator' && typeof elevPadEdge === 'function' && elevPadEdge(jp)) return;",
            "if (mode === 'elevator' && typeof elevPadEdge === 'function' && elevPadEdge(jp)) return;\n    if (mode === 'mansion' && typeof mnPad === 'function' && mnPad(jp)) return;\n    if (mode === 'shelter' && typeof shPad === 'function' && shPad(jp)) return;",
            1,
        )

    html = insert_after(
        html,
        "if (typeof elevStop === 'function') elevStop();",
        " if (typeof mansionStop === 'function') mansionStop(); if (typeof shelterStop === 'function') shelterStop();",
        "stop hooks",
        "mansionStop()",
    )

    html = insert_after(
        html,
        "else if (d.t === 'elev'){ try { if (typeof elevFromNet === 'function') elevFromNet(g, d); } catch (e){} }",
        "\n    else if (d.t === 'mn'){ try { if (typeof mnFromNet === 'function') mnFromNet(g, d); } catch (e){} }\n    else if (d.t === 'sh'){ try { if (typeof shFromNet === 'function') shFromNet(g, d); } catch (e){} }",
        "guest net",
        "d.t === 'mn'",
    )

    html = insert_after(
        html,
        "case 't302': try { if (typeof t302FromNet === 'function') t302FromNet(null, d); } catch (e){} break;",
        "\n      case 'elev': try { if (typeof elevFromHost === 'function') elevFromHost(d); } catch (e){} break;\n      case 'mn': try { if (typeof mnFromHost === 'function') mnFromHost(d); } catch (e){} break;\n      case 'sh': try { if (typeof shFromHost === 'function') shFromHost(d); } catch (e){} break;",
        "host cases",
        "case 'mn':",
    )

    if "function stop(){" in html and "/* ---------- Mallowmist Manor ---------- */" not in html:
        html = insert_before(
            html,
            "  function stop(){\n    if (typeof dhHideTestNote === 'function')",
            mn_rt + "\n" + sh_rt + "\n",
            "runtimes",
            "function buildMansion()",
        )

    if 'id="mnBox"' not in html:
        html = insert_before(html, '  <div id="t302Box"', mn_hud + "\n" + sh_hud + "\n", "hud html")

    if 'id="mnCss"' not in html:
        html = insert_after(html, "</style>\n<style id=\"elevCss\">", "", "skip") if False else html
        # append css after elev css block end evLb or after elevCss style
        if '<style id="evLbCss">' in html:
            html = insert_before(html, '<style id="evLbCss">', mn_css + "\n" + sh_css + "\n", "hud css")
        else:
            html = insert_before(html, "</head>", mn_css + "\n" + sh_css + "\n", "hud css head")

    # overlays
    html = html.replace(
        "'campCraft', 'campWin', 'elevHelp', 'elevIndex', 'elevShop', 'elevBadges', 'elevDaily']",
        "'campCraft', 'campWin', 'elevHelp', 'elevIndex', 'elevShop', 'elevBadges', 'elevDaily', 'elevVote']",
    )

    # petsLoad optional src
    if "src: p.src === 'shelter'" not in html:
        html = replace_once(
            html,
            "g: p.g === 'b' || p.g === 'g' ? p.g : (Math.random() < .5 ? 'b' : 'g')}",
            "g: p.g === 'b' || p.g === 'g' ? p.g : (Math.random() < .5 ? 'b' : 'g'), src: p.src === 'shelter' ? 'shelter' : undefined}",
            "petsLoad src field",
        )


    if "drawLookHair(ctx, av)" not in html:
        html = replace_once(
            html,
            "  if (h === 'pigtails'){\n    block(ctx, 86, 40, 8, 24, hc); block(ctx, 166, 40, 8, 24, hc);\n    rrect(ctx, 64, 56, 22, 46, 11, hc); rrect(ctx, 174, 56, 22, 46, 11, hc);\n    rrect(ctx, 80, 58, 10, 10, 3, '#ff6fb5'); rrect(ctx, 170, 58, 10, 10, 3, '#ff6fb5');\n  }\n}",
            "  if (h === 'pigtails'){\n    block(ctx, 86, 40, 8, 24, hc); block(ctx, 166, 40, 8, 24, hc);\n    rrect(ctx, 64, 56, 22, 46, 11, hc); rrect(ctx, 174, 56, 22, 46, 11, hc);\n    rrect(ctx, 80, 58, 10, 10, 3, '#ff6fb5'); rrect(ctx, 170, 58, 10, 10, 3, '#ff6fb5');\n  }\n  if (typeof drawLookHair === 'function') drawLookHair(ctx, av);\n}",
            "hairFront hook",
        )
    if "drawLookShirt(ctx, av)" not in html:
        html = html.replace(
            "  if (p === 'bowling'){ // two-tone bowling shirt with a pin on the pocket",
            "  if (typeof drawLookShirt === 'function') drawLookShirt(ctx, av);\n  if (p === 'bowling'){ // two-tone bowling shirt with a pin on the pocket",
            1,
        )
    if "drawLookPants(ctx, av)" not in html:
        html = replace_once(
            html,
            "    pts.forEach(([x,y], i) => { ctx.fillStyle = i % 2 ? '#ffffff' : '#ffd23f'; starPath(ctx, x, y, 6, 2); ctx.fill(); });\n  });\n}\n// draws a character in a 260x310 design space (scales to any canvas size)",
            "    pts.forEach(([x,y], i) => { ctx.fillStyle = i % 2 ? '#ffffff' : '#ffd23f'; starPath(ctx, x, y, 6, 2); ctx.fill(); });\n  });\n  if (typeof drawLookPants === 'function') drawLookPants(ctx, av);\n}\n// draws a character in a 260x310 design space (scales to any canvas size)",
            "drawPants hook",
        )
    if "else if (boy) sxk(1.08)" not in html:
        html = html.replace(
            "  ctx.save(); if (girl) sxk(.9); drawPants(ctx, av); ctx.restore();",
            "  ctx.save(); if (girl) sxk(.9); else if (boy) sxk(1.08); drawPants(ctx, av); ctx.restore();",
            1,
        )
        html = html.replace(
            "  if (girl){ sxk(.86); ctx.save(); ctx.beginPath(); ctx.rect(40, 100, 46, 120); ctx.rect(174, 100, 46, 120);",
            "  if (boy) sxk(1.1);\n  if (girl){ sxk(.86); ctx.save(); ctx.beginPath(); ctx.rect(40, 100, 46, 120); ctx.rect(174, 100, 46, 120);",
            1,
        )

    # looks catalog in shop
    if "LookRules.LOOK_ITEMS" not in html:
        html = insert_after(
            html,
            "  {id:'back-cane',    cat:'holiday', emoji:'🍭', name:'Candy-Cane Back', price:250, slot:'back', val:'cane'},\n);",
            "\nif (typeof LookRules !== 'undefined' && Array.isArray(LookRules.LOOK_ITEMS)){\n  ITEMS.push(...LookRules.LOOK_ITEMS);\n}\n",
            "looks items",
        )

    if 'data-cat="looks"' not in html:
        html = insert_after(
            html,
            '      <button class="tab" data-cat="holiday">🎃 Holiday 🎄</button>\n',
            '      <button class="tab" data-cat="looks">✨ Looks</button>\n',
            "looks tab",
        )

    html = html.replace(
        "Pick a <b>body type</b> (Classic or Girl), add lashes, and try a skirt, a dress or long hair.",
        "Pick a <b>body type</b> (Classic, Girl, or Boy), add lashes, and try a skirt, a dress or long hair. The Looks tab has Y2K, grunge, cozy and fancy hats, hair and outfits.",
        1,
    )

    # boy body 2d
    if "av.body === 'boy'" not in html:
        html = html.replace(
            "const girl = av.body === 'girl', sxk = k => { ctx.translate(130, 0); ctx.scale(k, 1); ctx.translate(-130, 0); };",
            "const girl = av.body === 'girl', boy = av.body === 'boy', sxk = k => { ctx.translate(130, 0); ctx.scale(k, 1); ctx.translate(-130, 0); };",
            1,
        )
        # after girl scale is applied, add boy scale if present
        # keep girl behavior, add boy slightly wider later if there's a sxk(girl?...) call
        html = html.replace(
            "const G2 = av.body === 'girl'",
            "const G2 = av.body === 'girl', B2 = av.body === 'boy'",
            1,
        )

    if "drawLookHat(" not in html.split("function drawAvatar")[1][:4000] if "function drawAvatar" in html else "":
        pass
    if "drawLookHat(ctx, av)" not in html:
        html = html.replace(
            "  } else if (av.hat === 'party'){\n    ctx.fillStyle = '#8b5cf6';\n    ctx.beginPath(); ctx.moveTo(100, 46); ctx.lineTo(130, -2); ctx.lineTo(160, 46); ctx.closePath(); ctx.fill();\n    ctx.fillStyle = '#ffd23f'; ctx.fillRect(112, 28, 36, 6); ctx.fillStyle = '#2ec27e'; ctx.fillRect(120, 14, 20, 5);\n    ctx.fillStyle = '#ff6fb5'; ctx.beginPath(); ctx.arc(130, 0, 8, 0, Math.PI*2); ctx.fill();\n  }",
            "  } else if (av.hat === 'party'){\n    ctx.fillStyle = '#8b5cf6';\n    ctx.beginPath(); ctx.moveTo(100, 46); ctx.lineTo(130, -2); ctx.lineTo(160, 46); ctx.closePath(); ctx.fill();\n    ctx.fillStyle = '#ffd23f'; ctx.fillRect(112, 28, 36, 6); ctx.fillStyle = '#2ec27e'; ctx.fillRect(120, 14, 20, 5);\n    ctx.fillStyle = '#ff6fb5'; ctx.beginPath(); ctx.arc(130, 0, 8, 0, Math.PI*2); ctx.fill();\n  } else if (typeof drawLookHat === 'function') drawLookHat(ctx, av);",
            1,
        )

    # 3D body + looks
    if "av.body === 'boy'" not in html[html.find("const G = av.body === 'girl', TW"):html.find("const G = av.body === 'girl', TW")+200] if html.find("const G = av.body === 'girl', TW")>=0 else True:
        html = html.replace(
            "const G = av.body === 'girl', TW = G ? .82 : .96, TD = G ? .44 : .5, LW = G ? .38 : .44, AW = G ? .34 : .4;",
            "const G = av.body === 'girl', B = av.body === 'boy', TW = G ? .82 : B ? 1.08 : .96, TD = G ? .44 : B ? .54 : .5, LW = G ? .38 : B ? .48 : .44, AW = G ? .34 : B ? .44 : .4;",
            1,
        )
    if "drawLook3D(" not in html:
        # hook after party/hat block-ish: after hat === 'backcap' 3d is ok to append call at end of hat section
        html = html.replace(
            "if (av.hat === 'backcap'){ bx(.9, .25, .9, '#2ec27e', 0, 2.95, 0); bx(.9, .06, .45, '#1f9460', 0, 2.84, -.6); bx(.2, .1, .02, '#ffffff', 0, 2.88, .46); }",
            "if (av.hat === 'backcap'){ bx(.9, .25, .9, '#2ec27e', 0, 2.95, 0); bx(.9, .06, .45, '#1f9460', 0, 2.84, -.6); bx(.2, .1, .02, '#ffffff', 0, 2.88, .46); }\n    if (typeof drawLook3D === 'function') drawLook3D(av, g, bx, mat, hc);",
            1,
        )

    # hide timer for new modes (add to mansion/shelter like haunt)
    if "mode === 'mansion'" not in html[html.find("$('#oTime').parentElement.style.display"):html.find("$('#oTime').parentElement.style.display")+250]:
        html = html.replace(
            "mode === 'haunt' || mode === 'dance' || mode === 'dreamhouse') $('#oTime').parentElement.style.display = 'none';",
            "mode === 'haunt' || mode === 'dance' || mode === 'dreamhouse' || mode === 'mansion' || mode === 'shelter') $('#oTime').parentElement.style.display = 'none';",
            1,
        )

    # cafe logic overlay list too
    cafe = ROOT / "dev/t297/cafe_logic.js"
    ct = cafe.read_text()
    if "'elevVote']" not in ct:
        ct = ct.replace(
            "'campCraft', 'campWin', 'elevHelp', 'elevIndex', 'elevShop', 'elevBadges', 'elevDaily']",
            "'campCraft', 'campWin', 'elevHelp', 'elevIndex', 'elevShop', 'elevBadges', 'elevDaily', 'elevVote']",
        )
        cafe.write_text(ct)

    html_path.write_text(html)
    print("t322 inject ok")
    missing = [k for k, v in {
        "mansion game": "id:'mansion'",
        "shelter game": "id:'shelter'",
        "mansion key": "rubloxMansion",
        "shelter key": "rubloxShelter",
        "build mansion": "buildMansion()",
        "vote overlay": 'id="elevVote"',
        "looks tab": 'data-cat="looks"',
        "body boy": "body-boy",
    }.items() if v not in html]
    if missing:
        raise InjectError("verify failed: " + ", ".join(missing))
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except InjectError as e:
        print("t322 inject error:", e, file=sys.stderr)
        raise SystemExit(1)
