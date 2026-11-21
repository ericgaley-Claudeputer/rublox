#!/usr/bin/env python3
"""Refresh inlined runtimes/logic and bump BUILD after the doorway clearance fix."""
from __future__ import annotations
from pathlib import Path
import json
import sys

ROOT = Path(__file__).resolve().parents[2]
BUILD = "2026.11.20-9"
OLD_BUILD = "2026.11.20-7"


class InjectError(RuntimeError):
    pass


def replace_block(html: str, start_token: str, end_token: str, body: str, label: str) -> str:
    start = html.find(start_token)
    if start < 0:
        raise InjectError(f"missing start for {label}")
    end = html.find(end_token, start + len(start_token))
    if end < 0:
        raise InjectError(f"missing end for {label}")
    return html[:start] + body.rstrip() + "\n" + html[end:]


def main() -> int:
    html_path = ROOT / "index.html"
    html = html_path.read_text()
    door_logic = (ROOT / "dev/doors/door_logic.js").read_text()
    mansion_logic = (ROOT / "dev/mansion/mansion_logic.js").read_text()
    shelter_logic = (ROOT / "dev/shelter/shelter_logic.js").read_text()
    winter_logic = (ROOT / "dev/winter/winter_logic.js").read_text()
    vet_logic = (ROOT / "dev/vet/vet_logic.js").read_text()
    mn_rt = (ROOT / "dev/mansion/runtime.js").read_text()
    sh_rt = (ROOT / "dev/shelter/runtime.js").read_text()
    wn_rt = (ROOT / "dev/winter/runtime.js").read_text()
    vt_rt = (ROOT / "dev/vet/runtime.js").read_text()

    html = html.replace(f"const BUILD = '{OLD_BUILD}';", f"const BUILD = '{BUILD}';", 1)
    if f"const BUILD = '{BUILD}';" not in html:
        raise InjectError("BUILD stamp missing")

    if "/* Shared doorway clearance" not in html:
        start = html.find("/* Mallowmist Manor — original kid-scary escape")
        if start < 0:
            raise InjectError("mansion logic marker missing")
        html = html[:start] + door_logic.rstrip() + "\n\n" + html[start:]

    html = replace_block(
        html,
        "/* Mallowmist Manor — original kid-scary escape",
        "/* Wagwell Shelter",
        mansion_logic + "\n\n",
        "mansion logic",
    )
    html = replace_block(
        html,
        "/* Wagwell Shelter",
        "/* Pinebell Village",
        shelter_logic + "\n\n",
        "shelter logic",
    )
    html = replace_block(
        html,
        "/* Pinebell Village",
        "/* Pawsley Vet Clinic — original first-person clinic",
        winter_logic + "\n\n",
        "winter logic",
    )
    html = replace_block(
        html,
        "/* Pawsley Vet Clinic — original first-person clinic",
        "/* New optional avatar looks",
        vet_logic + "\n\n",
        "vet logic",
    )

    html = replace_block(
        html,
        "  /* ---------- Mallowmist Manor ---------- */",
        "  /* ---------- Wagwell Shelter ---------- */",
        mn_rt + "\n",
        "mansion runtime",
    )
    html = replace_block(
        html,
        "  /* ---------- Wagwell Shelter ---------- */",
        "  /* ---------- Pinebell Village ---------- */",
        sh_rt + "\n",
        "shelter runtime",
    )
    html = replace_block(
        html,
        "  /* ---------- Pinebell Village ---------- */",
        "  /* ---------- Pawsley Vet Clinic ---------- */",
        wn_rt + "\n",
        "winter runtime",
    )
    html = replace_block(
        html,
        "  /* ---------- Pawsley Vet Clinic ---------- */",
        "\n  function stop(){",
        vt_rt + "\n",
        "vet runtime",
    )

    html_path.write_text(html)
    (ROOT / "version.json").write_text(json.dumps({"build": BUILD}) + "\n")

    for rel, old, new in (
        ("dev/elevator/inject.py", f'BUILD = "{OLD_BUILD}"', f'BUILD = "{BUILD}"'),
        ("dev/elevator/refresh.py", f'BUILD = "{OLD_BUILD}"', f'BUILD = "{BUILD}"'),
        ("dev/vet/inject.py", f'BUILD = "{OLD_BUILD}"', f'BUILD = "{BUILD}"'),
    ):
        p = ROOT / rel
        if not p.exists():
            continue
        t = p.read_text()
        if old in t:
            t = t.replace(old, new, 1)
        if rel.endswith("refresh.py"):
            t = t.replace(f'OLD_BUILD = "2026.11.20-6"', f'OLD_BUILD = "{OLD_BUILD}"', 1)
            t = t.replace("bump BUILD to 2026.11.20-7", f"bump BUILD to {BUILD}")
        if rel.endswith("dev/vet/inject.py") or rel.endswith("vet/inject.py"):
            t = t.replace(f'OLD_BUILD = "2026.11.20-6"', f'OLD_BUILD = "{OLD_BUILD}"', 1)
        p.write_text(t)

    # vet inject.py OLD_BUILD should become 7 when BUILD becomes 8
    vp = ROOT / "dev/vet/inject.py"
    if vp.exists():
        t = vp.read_text()
        t = t.replace('OLD_BUILD = "2026.11.20-6"', f'OLD_BUILD = "{OLD_BUILD}"')
        t = t.replace('OLD_BUILD = "2026.11.20-7"', f'OLD_BUILD = "{OLD_BUILD}"')
        t = t.replace(f'BUILD = "{OLD_BUILD}"', f'BUILD = "{BUILD}"')
        # if we already replaced BUILD first, leave it
        if f'BUILD = "{BUILD}"' not in t:
            t = t.replace('BUILD = "2026.11.20-7"', f'BUILD = "{BUILD}"')
        vp.write_text(t)

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
