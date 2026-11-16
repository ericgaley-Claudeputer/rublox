#!/usr/bin/env python3
"""Inject Tower of Doom rules and runtime into index.html. Idempotent."""
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[2]
IDX = ROOT / 'index.html'
DEV = ROOT / 'dev/tower'

def once(text, old, new, label):
    if new.strip() and new in text and old not in text:
        return text, f'skip {label}'
    if old not in text:
        raise SystemExit(f'missing hook for {label}: {old[:160]!r}')
    return text.replace(old, new, 1), f'ok {label}'

def main():
    log = []
    html = IDX.read_text()
    rules = (DEV / 'tower_logic.js').read_text()
    runtime = (DEV / 'tower.js').read_text()
    if not runtime.endswith('\n'):
        runtime += '\n'

    rules_block = '\n  /* ---------- tower rules ---------- */\n' + rules + '\n  /* ---------- /tower rules ---------- */\n'
    if '/* ---------- tower rules ---------- */' in html:
        html = re.sub(
            r'  /\* ---------- tower rules ---------- \*/.*?/\* ---------- /tower rules ---------- \*/\n',
            lambda _m: rules_block,
            html,
            count=1,
            flags=re.S,
        )
        log.append('refresh rules')
    else:
        needle = '  /* ===================== t227u: \U0001f5fc TOWER OF DOOM'
        if needle not in html:
            raise SystemExit('missing tower block start')
        html = html.replace(needle, rules_block + needle, 1)
        log.append('ok rules')

    start = html.find('  /* ===================== t227u: \U0001f5fc TOWER OF DOOM')
    end = html.find('  /* ===================== t227u: \U0001f366 SCOOP CIRCUS')
    if start < 0 or end < 0 or end <= start:
        raise SystemExit(f'tower runtime markers missing start={start} end={end}')
    html = html[:start] + runtime + html[end:]
    log.append('refresh tower.js')

    old_checks = (
        "    if (mode === 'build' || mode === 'tag' || mode === 'pets' || mode === 'hide' || mode === 'fashion' || mode === 'autumn' || mode === 'petisland' || mode === 'bakery' || mode === 'waterpark' || mode === 'photostudio' || mode === 'tower' || mode === 'icecream' || mode === 'pethotel' || mode === 'stable' || mode === 'haunt' || mode === 'dance' || mode === 'dreamhouse'){ if (P.y < -25) respawn(); return; }"
    )
    new_checks = (
        "    if (mode === 'tower'){ if (P.y < -25) respawn(); collectCoins(); if (typeof towerChecks === 'function') towerChecks(); return; }\n"
        "    if (mode === 'build' || mode === 'tag' || mode === 'pets' || mode === 'hide' || mode === 'fashion' || mode === 'autumn' || mode === 'petisland' || mode === 'bakery' || mode === 'waterpark' || mode === 'photostudio' || mode === 'icecream' || mode === 'pethotel' || mode === 'stable' || mode === 'haunt' || mode === 'dance' || mode === 'dreamhouse'){ if (P.y < -25) respawn(); return; }"
    )
    html, m = once(html, old_checks, new_checks, 'tower-checks')
    log.append(m)

    html, m = once(
        html,
        "    else if (mode === 'tower') banner('🗼 Welcome to the Tower of Doom! Climb past the bubbly goo!');",
        "    else if (mode === 'tower') banner('🗼 Welcome to the Tower of Doom! Gold pads save your climb, and the goo sends you back to one.');",
        'welcome',
    )
    log.append(m)

    old_tip = (
        "    if (mode === 'tower'){\n"
        "      $('#oTip').innerHTML = (on ? '🕹️ Left thumb moves · Ⓐ jump' : '⌨️ WASD move · Space jump · Esc menu')\n"
        "        + \"<br>🗼 Climb the stacked tower — gold pads are checkpoints · don't let the bubbly goo catch you!\";\n"
        "      return;\n"
        "    }"
    )
    new_tip = (
        "    if (mode === 'tower'){\n"
        "      $('#oTip').innerHTML = (on ? '🕹️ Left thumb moves · Ⓐ jump' : '⌨️ WASD move · Space jump · Esc menu')\n"
        "        + \"<br>🗼 Climb the stacked tower — gold pads are checkpoints. The bubbly goo is slow and sends you back to the last gold pad; it does not end your climb!\";\n"
        "      return;\n"
        "    }"
    )
    html, m = once(html, old_tip, new_tip, 'tip')
    log.append(m)

    html, m = once(
        html,
        "    tower: () => td && {ph: td.ph, t: td.t, goo: td.goo, maxY, earned: td.earned, paid: td.paid, kind: td.kind.slice(), prog: tdProg()},",
        "    tower: () => td && {ph: td.ph, t: td.t, goo: td.goo, grace: td.grace, maxY, earned: td.earned, paid: td.paid, kind: td.kind.slice(), seed: td.seed, prog: tdProg(), cp: (typeof cpIndex !== 'undefined' ? cpIndex : 0)},
    tdGoo(y){ if (td && y != null){ td.goo = +y; if (td.gooMesh) td.gooMesh.position.y = td.goo - 1.2; } return td && td.goo; },",
        'debug',
    )
    log.append(m)

    IDX.write_text(html)
    log.append(f'wrote index.html {IDX.stat().st_size} bytes')
    print('\n'.join(log))

if __name__ == '__main__':
    main()
