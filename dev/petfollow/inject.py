#!/usr/bin/env python3
"""Inject equipped-pet followers into index.html. Idempotent."""
from pathlib import Path
import re, sys

ROOT = Path(__file__).resolve().parents[2]
IDX = ROOT / 'index.html'
DEV = Path(__file__).resolve().parent
RULES = (DEV / 'petfollow_rules.js').read_text()
JS = (DEV / 'petfollow.js').read_text()

def once(text, old, new, label):
    if new.strip() and new in text and old not in text:
        return text, f'skip {label} (already)'
    if old not in text:
        raise SystemExit(f'missing hook for {label}: {old[:160]!r}')
    return text.replace(old, new, 1), f'ok {label}'

def main():
    log = []
    html = IDX.read_text()

    # settings checkbox after weather block if present, else before chat
    if 'id="pfSetHide"' not in html:
        hook = '    <div class="chset" id="chSet">'
        block = '''    <div class="pfset" id="pfSet">
      <div style="color:var(--muted);font-weight:700;margin-top:12px">🐾 Pet follower</div>
      <label class="invrow"><input type="checkbox" id="pfSetHide"><span>Hide my pet<small>Your equipped pet from Adopt a Pet follows you into other games. Check this to hide it.</small></span></label>
    </div>
    <div class="chset" id="chSet">'''
        html, m = once(html, hook, block, 'pf-settings')
        log.append(m)
    else:
        log.append('skip pf-settings')

    # page-level rules
    if 'PFRules' in html and 'const PF_KEY = \'rubloxPetFollow\'' in html:
        html2, n = re.subn(
            r"/\* Equipped Adopt-a-Pet follower across Rublox modes\..*?\n\}\)\(typeof globalThis !== 'undefined' \? globalThis : this\);",
            lambda m: RULES.strip(),
            html,
            count=1,
            flags=re.S,
        )
        if n:
            html = html2
            log.append('refresh pf rules')
        else:
            log.append('skip pf rules (no refresh)')
    else:
        hook = "const GAMES = ["
        html, m = once(html, hook, RULES + "\n" + hook, 'pf-rules')
        log.append(m)

    # IIFE runtime before armGameLoop
    if '/* ---------- pet follow ---------- */' in html:
        html2, n = re.subn(
            r"  /\* ---------- pet follow ---------- \*/.*?/\* ---------- end pet follow ---------- \*/",
            lambda m: JS.strip(),
            html,
            count=1,
            flags=re.S,
        )
        if n:
            html = html2
            log.append('refresh pf runtime')
        else:
            log.append('pf runtime markers odd')
    else:
        hook = "  function armGameLoop(){"
        html, m = once(html, hook, JS + "\n  function armGameLoop(){", 'pf-runtime')
        log.append(m)

    # binds
    if 'pfHide.addEventListener' not in html:
        hook = "if (typeof wxSyncUi === 'function') try { wxSyncUi(); } catch (e){}"
        add = hook + "\n" + "if (typeof pfSyncUi === 'function') try { pfSyncUi(); } catch (e){}\n" + \
              "const pfHide = document.getElementById('pfSetHide'); if (pfHide) pfHide.addEventListener('change', () => { if (typeof pfSetHide === 'function') pfSetHide(!!pfHide.checked); });\n"
        # also sync when opening settings
        html = html.replace("if (typeof wxSyncUi === 'function') wxSyncUi(); $('#setModal').classList.add('show'); };",
                            "if (typeof wxSyncUi === 'function') wxSyncUi(); if (typeof pfSyncUi === 'function') pfSyncUi(); $('#setModal').classList.add('show'); };", 1)
        if hook in html and "pfSetHide(!!pfHide.checked)" not in html:
            html, m = once(html, hook, add, 'pf-bind')
            log.append(m)
        else:
            log.append('pf-bind partial')
    else:
        log.append('skip pf-bind')

    # loop
    if 'pfTick(frameDt, mode)' in html:
        log.append('skip pf-loop')
    else:
        old = "if (typeof wxTick === 'function') try { wxTick(frameDt, mode, {scene: scene, camera: camera}); } catch (e){}"
        new = old + " if (typeof pfTick === 'function') try { pfTick(frameDt, mode); } catch (e){}"
        html, m = once(html, old, new, 'pf-loop')
        log.append(m)

    # start
    if "typeof pfEnter === 'function') pfEnter(mode)" in html:
        log.append('skip pf-start')
    else:
        old = "try { if (typeof wxEnter === 'function') wxEnter(mode); } catch (e){}"
        new = old + "\n    try { if (typeof pfEnter === 'function') pfEnter(mode); } catch (e){}"
        html, m = once(html, old, new, 'pf-start')
        log.append(m)

    # stop
    if "if (typeof pfStop === 'function') pfStop()" in html:
        log.append('skip pf-stop')
    else:
        old = "try { if (typeof wxStop === 'function') wxStop(); } catch (e){}"
        new = old + "\n    try { if (typeof pfStop === 'function') pfStop(); } catch (e){}"
        html, m = once(html, old, new, 'pf-stop')
        log.append(m)

    # mySnap default: append car=0, pet wire
    old_snap = "    return [r(P.x), r(P.y), r(P.z), r(P.face), s, r(sp), emote ? emote.id : '', emote ? r(emote.t) : 0];"
    new_snap = "    return [r(P.x), r(P.y), r(P.z), r(P.face), s, r(sp), emote ? emote.id : '', emote ? r(emote.t) : 0, 0, (typeof pfWire === 'function' ? pfWire() : 0)];"
    if 'typeof pfWire === \'function\' ? pfWire()' in html:
        log.append('skip pf-snap')
    else:
        html, m = once(html, old_snap, new_snap, 'pf-snap')
        log.append(m)

    # remote visibility
    old_vis = "    on = on && mode === 'pets' && E.m === 'pets';"
    new_vis = "    on = on && ((mode === 'pets' && E.m === 'pets') || (typeof pfShowRemote === 'function' && pfShowRemote(mode, E)));"
    if 'pfShowRemote(mode, E)' in html:
        log.append('skip pf-remote')
    else:
        html, m = once(html, old_vis, new_vis, 'pf-remote')
        log.append(m)

    IDX.write_text(html)
    log.append('wrote index.html %d bytes' % len(html))
    print('\n'.join(log))
    print('DONE petfollow')

if __name__ == '__main__':
    main()
