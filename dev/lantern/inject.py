#!/usr/bin/env python3
"""Inject Lantern Big Top into index.html and related files. Idempotent."""
from pathlib import Path
import json, re, sys

ROOT = Path(__file__).resolve().parents[2]
IDX = ROOT / 'index.html'
DEV = ROOT / 'dev/lantern'
ACH = ROOT / 'dev/achievements/achievements.js'
BUILD = '2026.11.16-17'
OLD_BUILD = '2026.11.16-16'

def once(text, old, new, label):
    if new.strip() and new in text and old not in text:
        return text, f'skip {label} (already)'
    if old not in text:
        raise SystemExit(f'missing hook for {label}: {old[:120]!r}')
    return text.replace(old, new, 1), f'ok {label}'

def main():
    log = []
    html = IDX.read_text()

    # --- BUILD bump ---
    stamp_files = [
        IDX, ROOT / 'version.json',
        ROOT / 'tests/dreamhouse_hud.js', ROOT / 'tests/pethotel_logic.js',
        ROOT / 'tests/home_play.js', ROOT / 'tests/tag_logic.js',
        ROOT / 'tests/chat_logic.js', ROOT / 'tests/perf.js',
        ROOT / 'tests/continue_logic.js', ROOT / 'tests/dreamhouse_loop.js',
        ROOT / 'tests/start_safety.js', ROOT / 'tests/lantern_logic.js',
    ]
    for f in stamp_files:
        t = f.read_text()
        if OLD_BUILD in t:
            f.write_text(t.replace(OLD_BUILD, BUILD))
            log.append(f'build {f.name}')
        elif BUILD in t:
            log.append(f'build {f.name} already')
        else:
            log.append(f'WARN no build stamp in {f.name}')
    # reload html after bump
    html = IDX.read_text()

    # --- rules (strip real badge names from the shipped page) ---
    rules = (DEV / 'lantern_rules.js').read_text()
    rules_page = re.sub(r"\s*real:(?:'[^']*'|\"[^\"]*\"),\s*realDesc:(?:'[^']*'|\"[^\"]*\"),", '', rules)
    if 'Kaufmo' in rules_page or 'Caine' in rules_page or 'Eniac' in rules_page or 'Daisy Bell' in rules_page:
        raise SystemExit('real TADC/official names leaked into page rules')
    rules_block = '\n/* ---------- lantern rules ---------- */\n' + rules_page + '\n/* ---------- /lantern rules ---------- */\n'
    if '/* ---------- lantern rules ---------- */' in html:
        html = re.sub(r'/\* ---------- lantern rules ---------- \*/.*?/\* ---------- /lantern rules ---------- \*/\n', lambda _m: rules_block, html, count=1, flags=re.S)
        log.append('refresh rules')
    else:
        html, m = once(html, '  /* ===================== end Chat ===================== */',
                       rules_block + '  /* ===================== end Chat ===================== */', 'rules')
        log.append(m)

    # --- card art ---
    draw = (DEV / 'draw_lantern.js').read_text().rstrip() + '\n'
    if 'function drawLantern' not in html:
        # insert before drawHaunt if present, else after GAMES close
        if 'function drawHaunt(ctx){' in html:
            html = html.replace('function drawHaunt(ctx){', draw + 'function drawHaunt(ctx){', 1)
            log.append('ok drawLantern')
        else:
            raise SystemExit('no drawHaunt')
    else:
        import re as _re
        m = _re.search(r'function drawLantern\(ctx\)\{[\s\S]*?\n\}', html)
        if m:
            html = html[:m.start()] + draw + html[m.end():]
            log.append('refresh drawLantern')
        else:
            log.append('skip drawLantern')

    # --- GAMES tile ---
    tile = "  {id:'lantern', name:'Lantern Big Top', emoji:'🏮', tag:'Stay close and stay bright under a colorful circus tent!', draw: drawLantern, playable: true, isNew: true},\n"
    if "id:'lantern'" not in html:
        html, m = once(html, 'const GAMES = [\n', 'const GAMES = [\n' + tile, 'GAMES')
        log.append(m)
    else:
        import re as _re
        html2, n = _re.subn(r"\{id:'lantern', name:'[^']*', emoji:'[^']*', tag:'[^']*', draw: drawLantern, playable: true, isNew: true\},", tile.strip(), html, count=1)
        if n:
            html = html2
            log.append('refresh GAMES')
        else:
            log.append('skip GAMES')

    # --- CSS ---
    css = (DEV / 'lantern.css').read_text()
    css_block = '\n/* ---------- lantern hotel css ---------- */\n' + css + '\n/* ---------- /lantern hotel css ---------- */\n'
    if '/* ---------- lantern hotel css ---------- */' in html:
        html = re.sub(r'/\* ---------- lantern hotel css ---------- \*/.*?/\* ---------- /lantern hotel css ---------- \*/\n', lambda _m: css_block, html, count=1, flags=re.S)
        log.append('refresh css')
    else:
        # append before last </style> closest to ohud styles — use first </style> after .hmnear
        idx = html.find('.hmnear{')
        end = html.find('</style>', idx)
        if end < 0: raise SystemExit('no style close')
        html = html[:end] + css_block + html[end:]
        log.append('ok css')

    # --- lhBox in stats ---
    box = '      <span id="lhBox" style="display:none"><b id="lhN">🏮 Lantern Big Top</b></span>\n'
    if 'id="lhBox"' not in html:
        html, m = once(html, '      <span id="hmBox" style="display:none"><b id="hmN">👻 Escape</b></span>\n',
                       '      <span id="hmBox" style="display:none"><b id="hmN">👻 Escape</b></span>\n' + box, 'lhBox')
        log.append(m)
    else:
        html = html.replace('🏮 Lantern Hotel', '🏮 Lantern Big Top')
        log.append('refresh lhBox')

    # --- HUD ---
    hud = (DEV / 'lantern_hud.html').read_text().rstrip() + '\n'
    hud_block = '  <!-- lantern hotel hud -->\n' + hud + '  <!-- /lantern hotel hud -->\n'
    if '<!-- lantern hotel hud -->' in html:
        html = re.sub(r'  <!-- lantern hotel hud -->.*?  <!-- /lantern hotel hud -->\n', lambda _m: hud_block, html, count=1, flags=re.S)
        log.append('refresh hud')
    else:
        html, m = once(html, '  <button class="fsnear hmnear" id="hmAct"></button>\n',
                       '  <button class="fsnear hmnear" id="hmAct"></button>\n' + hud_block, 'hud')
        log.append(m)

    # --- game module in Obby IIFE ---
    js = (DEV / 'lantern.js').read_text()
    if not js.startswith('  '):
        js = '\n'.join(('  ' + line if line else line) for line in js.splitlines()) + '\n'
    js_block = '  /* ---------- lantern hotel ---------- */\n' + js + '  /* ---------- /lantern hotel ---------- */\n'
    if '/* ---------- lantern hotel ---------- */' in html:
        html = re.sub(r'  /\* ---------- lantern hotel ---------- \*/.*?  /\* ---------- /lantern hotel ---------- \*/\n', lambda _m: js_block, html, count=1, flags=re.S)
        log.append('refresh lantern.js')
    else:
        hook = '  /* ===================== t227u: 👻 GIGGLE MANOR'
        if hook not in html:
            hook = '  function buildHaunt()'
        if hook not in html:
            raise SystemExit('no haunt hook for js')
        html = html.replace(hook, js_block + hook, 1)
        log.append('ok lantern.js')

    # --- whitelist ---
    if "'lantern'" not in html.split("mode = [")[1][:800]:
        html, m = once(html,
            "'haunt', 'dance', 'dreamhouse'].includes(m) ? m : 'obby'",
            "'haunt', 'dance', 'dreamhouse', 'lantern'].includes(m) ? m : 'obby'",
            'whitelist')
        log.append(m)
    else:
        log.append('skip whitelist')
    if "mode === 'lantern' ? null" not in html and "'dreamhouse' ? null : d;" in html:
        html, m = once(html,
            "mode === 'haunt' || mode === 'dance' || mode === 'dreamhouse' ? null : d;",
            "mode === 'haunt' || mode === 'dance' || mode === 'dreamhouse' || mode === 'lantern' ? null : d;",
            'diff-null')
        log.append(m)

    # --- build() ---
    if 'buildLantern()' not in html:
        html, m = once(html,
            "if (mode === 'haunt') buildHaunt();",
            "if (mode === 'lantern') buildLantern(); else if (mode === 'haunt') buildHaunt();",
            'build-chain')
        log.append(m)
    else:
        log.append('skip build-chain')
    if 'lh = null' not in html.split('hm = null')[0][-80:] and ', lh = null' not in html:
        # add to the mode-null list
        html, m = once(html, 'hm = null; db = null; dh = null;', 'hm = null; db = null; dh = null; lh = null;', 'build-null')
        log.append(m)
    if "mode !== 'lantern'" not in html:
        html, m = once(html,
            "else if (mode !== 'tag' && mode !== 'obby')",
            "else if (mode !== 'tag' && mode !== 'obby' && mode !== 'lantern' && mode !== 'dreamhouse')",
            'clouds')
        log.append(m)

    # --- enter / hud box ---
    enter = """    $('#lhBox').style.display = mode === 'lantern' ? '' : 'none'; ['#lhAct'].forEach(id => { const n = $(id); if (n && n.classList) n.classList.remove('show'); });
    if (mode === 'lantern'){ if (!window.__lhBound){ /* bound in lanternEnter */ } lanternEnter(); }
"""
    if "mode === 'lantern'" not in html[html.find("$('#hmBox').style.display"):html.find("$('#hmBox').style.display")+800]:
        html, m = once(html,
            "$('#hmBox').style.display = mode === 'haunt' ? '' : 'none'; ['#hmAct'].forEach(id => $(id).classList.remove('show'));",
            enter + "    $('#hmBox').style.display = mode === 'haunt' ? '' : 'none'; ['#hmAct'].forEach(id => $(id).classList.remove('show'));",
            'enter')
        log.append(m)
    else:
        log.append('skip enter')

    # --- stop ---
    if 'lanternStop()' not in html:
        html, m = once(html, 'if (hm) hauntStop();', 'if (lh) lanternStop(); if (hm) hauntStop();', 'stop')
        log.append(m)
    else:
        log.append('skip stop')

    # --- update ---
    if 'lanternUpdate' not in html:
        html, m = once(html, 'if (hm) hauntUpdate(dt);', 'if (lh) lanternUpdate(dt);\n      if (hm) hauntUpdate(dt);', 'update')
        log.append(m)
    else:
        log.append('skip update')

    # --- key / pad ---
    if 'lhKey(e)' not in html:
        html, m = once(html,
            "if (mode === 'haunt' && hm && hmKey(e)) return;",
            "if (mode === 'lantern' && lh && lhKey(e)) return;\n      if (mode === 'haunt' && hm && hmKey(e)) return;",
            'key')
        log.append(m)
    if 'lhPad(jp)' not in html:
        html, m = once(html,
            "if (mode === 'haunt' && hm && hmPad(jp)) return;",
            "if (mode === 'lantern' && lh && lhPad(jp)) return;\n    if (mode === 'haunt' && hm && hmPad(jp)) return;",
            'pad')
        log.append(m)

    # --- HUD_HIT_SEL ---
    old_sel = "const HUD_HIT_SEL = '#dhBar, #dhAct, #dhTip, #dhYard, #dhShop, #dhUp, #dhVisit, #dhSteps, #dhResetModal, .obtns, #oExit, #oExit2, #oExit3, #oFP, #oPause, #oMute, #setBtn, #setModal, #oPausePanel, #chRoot, #chPanel, #chWheel, #chBtn, button, a, input, label, select';"
    new_sel = old_sel.replace("#chBtn, button", "#chBtn, #lhRoot, #lhAct, #lhSet, #lhDraw, #lhCut, #lhCalm, #lhMeter, #lhFanfare, #lhSetBtn, #lhWall, button")
    if '#lhRoot' not in html:
        html, m = once(html, old_sel, new_sel, 'HUD_HIT_SEL')
        log.append(m)
    elif '#lhKnock' not in html[html.find('const HUD_HIT_SEL'):html.find('const HUD_HIT_SEL')+900]:
        if '#lhWrite' not in html[html.find('const HUD_HIT_SEL'):html.find('const HUD_HIT_SEL')+900]:
            html = html.replace('#lhDraw, #lhCut', '#lhDraw, #lhWrite, #lhWriteBtn, #lhKnock, #lhCut', 1)
        else:
            html = html.replace('#lhWrite, #lhWriteBtn, #lhCut', '#lhWrite, #lhWriteBtn, #lhKnock, #lhCut', 1)
        log.append('ok HUD_HIT_SEL knock')
    else:
        sel = html[html.find('const HUD_HIT_SEL'):html.find('const HUD_HIT_SEL')+1200]
        if '#lhGame' not in sel:
            html = html.replace('#lhKnock, #lhCut', '#lhKnock, #lhGame, #lhBooth, #lhDecor, #lhDecorBtn, #lhCut', 1)
            log.append('ok HUD_HIT_SEL games')
        elif '#lhDecor' not in sel:
            html = html.replace('#lhGame, #lhBooth, #lhCut', '#lhGame, #lhBooth, #lhDecor, #lhDecorBtn, #lhCut', 1)
            log.append('ok HUD_HIT_SEL decor')
        else:
            log.append('skip HUD_HIT_SEL')

    # --- dhIsUiEvent closest lists ---
    for old in [
        "'dialog, .modal, .menu, .opanel, .mbox, .dhbar, .dhhand, .obtns, .ohud, button, a, input, label, select, textarea, #dhResetModal, #dhBar, #dhTip, #dhSkip, #dhCut, #dhLookHint, #oPausePanel, #setModal'",
        "'dialog, .modal, .menu, .opanel, .mbox, .dhbar, .dhhand, .obtns, .ohud, button, a, input, label, select, textarea, #dhResetModal, #dhBar, #dhTip, #dhSkip, #dhCut, #dhLookHint, #dhVisit, #oPausePanel, #setModal'",
    ]:
        if old in html and '#lhSet' not in html.split(old)[1][:20] and '#lhRoot' not in old:
            html = html.replace(old, old[:-1] + ", #lhRoot, #lhSet, #lhDraw, #lhCut, #lhCalm, #chPanel, #chWheel, #chRoot'", 1)
            log.append('ok ui-event')
    if 'id === \'chWheel\'' in html and "id === 'lhSet'" not in html:
        html, m = once(html,
            "if (id === 'obby' || id === 'dhResetModal' || id === 'achToast' || id === 'frConfirm' || id === 'chRoot' || id === 'chPanel' || id === 'chWheel') return true;",
            "if (id === 'obby' || id === 'dhResetModal' || id === 'achToast' || id === 'frConfirm' || id === 'chRoot' || id === 'chPanel' || id === 'chWheel' || id === 'lhRoot' || id === 'lhSet' || id === 'lhDraw' || id === 'lhCut' || id === 'lhCalm') return true;",
            'inert')
        log.append(m)

    # --- MP ---
    if "d.t === 'lh'" not in html:
        html, m = once(html,
            "else if (d.t === 'chat'){ try { if (typeof chFromGuest === 'function') chFromGuest(g, d); } catch (e){} }",
            "else if (d.t === 'chat'){ try { if (typeof chFromGuest === 'function') chFromGuest(g, d); } catch (e){} }\n    else if (d.t === 'lh'){ try { if (typeof lhFromGuest === 'function') lhFromGuest(g, d); } catch (e){} }",
            'mp-guest')
        log.append(m)
    if "case 'lh':" not in html:
        html, m = once(html,
            "case 'chat': try { if (typeof chFromHost === 'function') chFromHost(d); } catch (e){} break;",
            "case 'chat': try { if (typeof chFromHost === 'function') chFromHost(d); } catch (e){} break;\n      case 'lh': try { if (typeof lhFromHost === 'function') lhFromHost(d); } catch (e){} break;",
            'mp-host')
        log.append(m)

    # --- achBlockPersist ---
    if 'ghtest=' not in html[html.find('function achBlockPersist'):html.find('function achBlockPersist')+800]:
        html, m = once(html,
            "if (/(?:^|#|&)chattest=/i.test(hash)) return true;",
            "if (/(?:^|#|&)chattest=/i.test(hash)) return true;\n      if (/(?:^|#|&)(?:lh|gh)test=/i.test(hash)) return true;",
            'achBlock')
        log.append(m)
    else:
        log.append('skip achBlock')

    # --- auto start hash ---
    boot = """  try {
    if (typeof location !== 'undefined' && /(?:^|#|&)(?:lh|gh)test=([A-Za-z0-9_-]+)/.test(String(location.hash || ''))) {
      start('lantern');
    }
  } catch (e){}
"""
    if "start('lantern')" not in html:
        html, m = once(html,
            """  try {
    if (typeof location !== 'undefined' && /(?:^|#|&)dhtest=([A-Za-z0-9_-]+)/.test(String(location.hash || ''))) {
      // Open the in-memory test house immediately so testers don't have to hunt for the tile.
      start('dreamhouse');
    }
  } catch (e){}""",
            """  try {
    if (typeof location !== 'undefined' && /(?:^|#|&)dhtest=([A-Za-z0-9_-]+)/.test(String(location.hash || ''))) {
      // Open the in-memory test house immediately so testers don't have to hunt for the tile.
      start('dreamhouse');
    }
  } catch (e){}
""" + boot,
            'boot')
        log.append(m)
    else:
        log.append('skip boot')

    # --- obbyDebug ---
    dbg = """    lantern: () => lh && {sanity: lh.sanity, glitched: !!lh.glitched, transforming: !!lh.transforming, area: lh.area, room: lh.room, isolated: !!lh.isolated, dark: !!lh.dark, near: !!lh.nearGlitched, company: !!lh.company, keyholder: lh.keyholder, test: lh.test, visits: lh.prog && lh.prog.visits, settings: lh.prog && lh.prog.settings, npcs: (lh.npcs||[]).map(n => ({id:n.id, x:+n.x.toFixed(2), z:+n.z.toFixed(2), glitched:!!n.glitched})), P:{x:+P.x.toFixed(2), y:+P.y.toFixed(2), z:+P.z.toFixed(2)}},
    lhTo(x, z, y){ Object.assign(P, {x, y: y == null ? .05 : y, z, vx: 0, vy: 0, vz: 0}); },
    lhAct: () => (typeof lhAct === 'function' ? lhAct() : (lh && lhAct && lhAct())),
"""
    if 'lantern: () => lh' not in html:
        html, m = once(html,
            '    haunt: () => hm && {ph: hm.ph,',
            dbg + '    haunt: () => hm && {ph: hm.ph,',
            'debug')
        log.append(m)
    else:
        log.append('skip debug')

    # --- tip line (gamepad + keyboard) ---
    if "mode === 'lantern'" not in html[html.find("$('#oTip').innerHTML"):html.find("$('#oTip').innerHTML")+200] if '$(\'#oTip\').innerHTML' in html else True:
        # add to the long gamepad tip ternary before the default
        needle = "mode === 'haunt' ? '🎮 Left stick move · Ⓐ jump · Ⓧ use puzzle · ☰ menu'"
        if needle in html and "mode === 'lantern' ?" not in html:
            html = html.replace(needle, "mode === 'lantern' ? '🎮 Left stick move · Right stick look · Ⓐ jump · Ⓧ use / ring / lights · ☰ menu · R3 twice: first person' : " + needle, 1)
            log.append('ok pad tip')
    # keyboard tip block — add a branch near haunt if there is one; otherwise hook the generic else
    if "Stay close, stay bright" not in html:
        # after setTip or oTip assignments, find a unique nearby mode tip hook
        hook = "      $('#oTip').innerHTML = (on ? '🕹️ Left thumb to move · ⬆️ to jump · 🏃 to run · Swipe the right side to look · 👁️ first person · 😀 emotes'\n        : '⌨️ WASD / Arrows to move · Space to jump · Shift to run · Drag the mouse to look · V first person · 1–8 emotes · Esc to pause') + '<br>' + goal"
        # safer: prepend a lantern-specific tip just before a known generic one by wrapping start HUD
        # We'll inject a small block after lanternEnter is called via start already setting oTip later.
        # Add after hauntEnter-style — look at where oTip is set from mode at end of start/setTip
        pass
    # setTip function
    if 'Stay close and stay bright' not in html:
        # find `function setTip` or similar
        i = html.find("function setTip(")
        if i < 0:
            i = html.find("$('#oTip').innerHTML = (on ?")
        # add a dedicated block in start() after lanternEnter
        if "if (mode === 'lantern')" in html and 'Stay close and stay bright' not in html:
            html, m = once(html,
                "if (mode === 'lantern'){ if (!window.__lhBound){ /* bound in lanternEnter */ } lanternEnter(); }",
                "if (mode === 'lantern'){ if (!window.__lhBound){ /* bound in lanternEnter */ } lanternEnter();\n      $('#oTip').innerHTML = (typeof pad !== 'undefined' && pad && pad.on ? '🕹️ Left thumb move · ⬆️ jump · swipe to look · 👁️ first person<br>👆 Yellow button rings the doorbell, flips lights, or uses a thing. 🎩 Call Maestro Gleam when a friend is fizzled!' : '⌨️ WASD move · Space jump · Shift run · Drag / lock-click to look · V first person · E use (doorbell, lights, door, bed, doodles)<br>Stay close and stay bright! Type Gleam in chat near a fizzled friend to send them to the cellar (or use the button in single-player).'); }",
                'tips')
            log.append(m)

    # refresh already-injected tip copy if the host or title changed
    html = html.replace('Call Miss Fanfare when a friend is fizzled!', 'Call Maestro Gleam when a friend is fizzled!')
    html = html.replace('Type Fanfare in chat near a fizzled friend', 'Type Gleam in chat near a fizzled friend')
    html = html.replace('Lantern Hotel', 'Lantern Big Top')
    html = html.replace('Miss Fanfare', 'Maestro Gleam')

    # --- class toggle ---
    if "classList.toggle('lhmode'" not in html:
        html, m = once(html,
            "$('#obby').classList.toggle('dhmode', mode === 'dreamhouse');",
            "$('#obby').classList.toggle('dhmode', mode === 'dreamhouse'); $('#obby').classList.toggle('lhmode', mode === 'lantern');",
            'class')
        log.append(m)

    IDX.write_text(html)
    log.append('wrote index.html %d bytes' % len(html))

    # --- achievements in both sources ---
    sys.path.insert(0, str(DEV))
    # load rules from file (with real names — that's fine in achievements? NO - only original names in registry)
    import importlib.util
    spec = importlib.util.spec_from_file_location('lantern_rules', DEV / 'lantern_rules.js')
    # can't import js. parse badges from rules via node or regex
    badges = []
    raw = (DEV / 'lantern_rules.js').read_text()
    def take_str(s, i):
        q = s[i]
        if q not in "'\"":
            return None, i
        i += 1
        out = []
        while i < len(s):
            if s[i] == chr(92) and i + 1 < len(s):
                out.append(s[i+1]); i += 2; continue
            if s[i] == q:
                return ''.join(out), i + 1
            out.append(s[i]); i += 1
        return None, i
    for m in re.finditer(r"\{id:", raw):
        i = m.end()
        ident, i = take_str(raw, i)
        if not ident or not ident.startswith('lh-'):
            continue
        fields = {'id': ident}
        # scan this object
        end = raw.find('}', i)
        chunk = raw[i:end+1] if end>0 else raw[i:i+800]
        for key in ('name', 'desc', 'emoji', 'note', 'coins'):
            km = re.search(r"\b" + key + r":", chunk)
            if not km: continue
            j = km.end()
            while j < len(chunk) and chunk[j] in ' \t':
                j += 1
            if key == 'coins':
                cm = re.match(r'(\d+)', chunk[j:])
                if cm: fields['coins'] = cm.group(1)
            else:
                val, _ = take_str(chunk, j)
                if val is not None: fields[key] = val
        if all(k in fields for k in ('id','name','desc','emoji','coins','note')):
            badges.append((fields['id'], fields['name'], fields['desc'], fields['emoji'], fields['coins'], fields['note']))

    if len(badges) < 16:
        raise SystemExit('expected at least 16 badges, got %d' % len(badges))
    ach_lines = ["    // Lantern Big Top"]
    def jq(s):
        return str(s).replace("\\", "\\\\").replace("'", "\\'")
    for id_, name, desc, emoji, coins, note in badges:
        ach_lines.append("    {id:'%s', cat:'lantern', emoji:'%s', name:'%s', desc:'%s', coins:%s, prove:s => !!(s.notes && s.notes['%s'])}," % (id_, emoji, jq(name), jq(desc), coins, note))
    ach_block = '\n'.join(ach_lines) + '\n'
    cat_line = "    {id: 'lantern', name: 'Lantern Big Top', emoji: '🏮'},\n"

    def patch_ach(path):
        t = path.read_text()
        t = t.replace("{id: 'lantern', name: 'Lantern Hotel', emoji: '🏮'}", "{id: 'lantern', name: 'Lantern Big Top', emoji: '🏮'}")
        t = t.replace("    // Lantern Hotel", "    // Lantern Big Top")
        if "id: 'lantern'" not in t:
            t = t.replace("    {id: 'friends', name: 'Friends', emoji: '👫'},\n",
                          "    {id: 'friends', name: 'Friends', emoji: '👫'},\n" + cat_line, 1)
        if "id:'lh-welcome'" not in t:
            t = t.replace("    // Collection\n", ach_block + "    // Collection\n", 1)
        else:
            import re as _re
            t2, n = _re.subn(r"    // Lantern Big Top\n(?:    \{id:'lh-[^\n]+\n)+", ach_block, t, count=1)
            if n:
                t = t2
            else:
                t2, n = _re.subn(r"    // Lantern Hotel\n(?:    \{id:'lh-[^\n]+\n)+", ach_block, t, count=1)
                t = t2 if n else t
        path.write_text(t)
        return path.name

    log.append('ach ' + patch_ach(ACH))
    # achievements are already in index if we patch index's copy
    log.append('ach ' + patch_ach(IDX))

    # --- entry wiring ---
    ew = ROOT / 'dev/haunt/entry_wiring.js'
    t = ew.read_text()
    if "['lantern', 'lantern']" not in t:
        t = t.replace("['dance', 'dance']];", "['dance', 'dance'], ['lantern', 'lantern']];", 1)
        ew.write_text(t)
        log.append('ok entry_wiring')
    else:
        log.append('skip entry_wiring')

    print('\n'.join(log))
    print('DONE badges', len(badges), 'html', IDX.stat().st_size)

if __name__ == '__main__':
    main()
