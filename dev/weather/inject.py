#!/usr/bin/env python3
"""Inject global weather + day/night into index.html. Idempotent."""
from pathlib import Path
import re, sys

ROOT = Path(__file__).resolve().parents[2]
IDX = ROOT / 'index.html'
DEV = Path(__file__).resolve().parent
RULES = (DEV / 'weather_rules.js').read_text()
JS = (DEV / 'weather.js').read_text()
# strip leading indent on js so it is a page-level script
JS = '\n'.join(line[2:] if line.startswith('  ') else line for line in JS.splitlines()) + '\n'

def once(text, old, new, label):
    if new.strip() and new in text and old not in text:
        return text, f'skip {label} (already)'
    if old not in text:
        raise SystemExit(f'missing hook for {label}: {old[:140]!r}')
    return text.replace(old, new, 1), f'ok {label}'

def main():
    log = []
    html = IDX.read_text()

    # settings radios after graphics quality block, before chat
    if 'id="wxSetAuto"' not in html:
        html, m = once(html,
            '    <div class="chset" id="chSet">',
            '''    <div class="wxset" id="wxSet">
      <div style="color:var(--muted);font-weight:700;margin-top:12px">🌤️ Weather and time</div>
      <label class="invrow"><input type="radio" name="wxSetMode" id="wxSetAuto" value="auto" checked><span>Auto<small>Day turns to night, and weather can change.</small></span></label>
      <label class="invrow"><input type="radio" name="wxSetMode" id="wxSetDay" value="day"><span>Always day<small>Keep bright daylight in games that use this.</small></span></label>
      <label class="invrow"><input type="radio" name="wxSetMode" id="wxSetOff" value="off"><span>Off<small>Leave each game's own sky and lighting alone.</small></span></label>
    </div>
    <div class="chset" id="chSet">''',
            'wx-settings')
        log.append(m)
    else:
        log.append('skip wx-settings')

    # page-level scripts: after function load/save if possible, or before const GAMES
    block = "\n" + RULES + "\n" + JS + "\n"
    if '/* ---------- rublox weather ---------- */' in html:
        html2, n = re.subn(
            r"/\* ---------- rublox weather ---------- \*/.*?/\* ---------- end rublox weather ---------- \*/",
            lambda m: block.strip(),
            html,
            count=1,
            flags=re.S,
        )
        # also refresh rules above the runtime if they are together
        # The block includes both; but rules don't have the same end marker.
        # Full replace from WXRules IIFE through end marker.
        html3, n2 = re.subn(
            r"/\* Rublox global weather \+ day/night.*?:?/\* ---------- end rublox weather ---------- \*/",
            lambda m: (RULES + "\n" + JS).strip(),
            html,
            count=1,
            flags=re.S,
        )
        if n2:
            html = html3
            log.append('refresh weather block')
        elif n:
            # only runtime was found; insert rules if missing
            html = html2
            log.append('refresh weather runtime')
        else:
            log.append('weather markers odd; leaving')
    else:
        hook = "const GAMES = ["
        if hook not in html:
            raise SystemExit('missing GAMES hook for weather scripts')
        html = html.replace(hook, block + hook, 1)
        log.append('ok weather scripts')

    # wire radios + sync on settings open
    if "wxSetAuto" in html and "wxSetMode" in html and "addEventListener('change'" in html:
        if "wxSetAuto" not in html.split("if (setGfx) setGfx.addEventListener")[1][:2500] if "if (setGfx) setGfx.addEventListener" in html else True:
            pass
    if "document.getElementById('wxSetAuto')" not in html:
        html, m = once(html,
            "$('#setBtn').onclick = () => { syncInvert(); syncGfxUi(); if (typeof chSyncSettings === 'function') chSyncSettings(); $('#setModal').classList.add('show'); };",
            "$('#setBtn').onclick = () => { syncInvert(); syncGfxUi(); if (typeof chSyncSettings === 'function') chSyncSettings(); if (typeof wxSyncUi === 'function') wxSyncUi(); $('#setModal').classList.add('show'); };\n"
            "['wxSetAuto','wxSetDay','wxSetOff'].forEach(id => { const n = document.getElementById(id); if (n) n.addEventListener('change', () => { if (n.checked && typeof wxSetMode === 'function') wxSetMode(n.value); }); });\n"
            "if (typeof wxSyncUi === 'function') try { wxSyncUi(); } catch (e){}\n",
            'wx-bind')
        log.append(m)
    else:
        log.append('skip wx-bind')

    # loop hook
    old_loop = "    animate(paused ? 0 : frameDt); updateCamera(); renderer.render(scene, camera); hud(); if (typeof chTick === 'function') try { chTick(); } catch (e){}"
    new_loop = "    animate(paused ? 0 : frameDt); updateCamera(); if (typeof wxTick === 'function') try { wxTick(frameDt, mode, {scene: scene, camera: camera}); } catch (e){} renderer.render(scene, camera); hud(); if (typeof chTick === 'function') try { chTick(); } catch (e){}"
    if 'wxTick(frameDt, mode' in html:
        log.append('skip wx-loop')
    else:
        html, m = once(html, old_loop, new_loop, 'wx-loop')
        log.append(m)

    # start hook
    old_start = "    resize(); armGameLoop(); checkRotate(); try { if (typeof chSync === 'function') chSync();"
    new_start = "    try { if (typeof wxEnter === 'function') wxEnter(mode); } catch (e){}\n    resize(); armGameLoop(); checkRotate(); try { if (typeof chSync === 'function') chSync();"
    if 'wxEnter(mode)' in html:
        log.append('skip wx-start')
    else:
        html, m = once(html, old_start, new_start, 'wx-start')
        log.append(m)

    # stop hook
    old_stop = "    if (typeof dhCloseReset === 'function') dhCloseReset();"
    new_stop = "    if (typeof dhCloseReset === 'function') dhCloseReset();\n    try { if (typeof wxStop === 'function') wxStop(); } catch (e){}"
    if 'if (typeof wxStop === \'function\') wxStop()' in html:
        log.append('skip wx-stop')
    else:
        html, m = once(html, old_stop, new_stop, 'wx-stop')
        log.append(m)

    IDX.write_text(html)
    log.append('wrote index.html %d bytes' % len(html))
    print('\n'.join(log))
    print('DONE weather')

if __name__ == '__main__':
    main()
