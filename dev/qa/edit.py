#!/usr/bin/env python3
"""QA t330u helper: exact single-match edits applied to index.html and, when the same text exists once, to a dev/ source file.
Never re-runs the older inject scripts (re-running one is what dropped the Manor/Shelter runtimes in 2026.11.20-9)."""
from pathlib import Path
ROOT = Path(__file__).resolve().parents[2]

def ed(dev, old, new):
    targets = [ROOT / 'index.html'] + ([ROOT / d for d in ([dev] if isinstance(dev, str) else dev)] if dev else [])
    for t in targets:
        h = t.read_text(); n = h.count(old)
        if n != 1:
            if t.name == 'index.html': raise SystemExit(f'{t}: needle matched {n} times: {old[:80]!r}')
            print(f'  (skip {t.relative_to(ROOT)}: matched {n})'); continue
        t.write_text(h.replace(old, new, 1)); print('edited', t.relative_to(ROOT))
