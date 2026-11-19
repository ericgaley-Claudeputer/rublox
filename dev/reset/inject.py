"""Inject the Settings 'Reset a game' feature into index.html and bump BUILD to 2026.11.19-3."""
from pathlib import Path
import json, re

ROOT = Path(__file__).resolve().parents[2]
BUILD = "2026.11.19-3"
OLD = "2026.11.19-2"
HERE = Path(__file__).resolve().parent

def must_replace(html, old, new, label):
    if old not in html:
        if new in html:
            return html
        raise SystemExit(f"missing needle for {label}")
    return html.replace(old, new, 1)

def bump_build_files():
    (ROOT / "version.json").write_text(json.dumps({"build": BUILD}) + "\n")
    p = ROOT / "dev/lantern/inject.py"
    t = p.read_text().replace(f"BUILD = '{OLD}'", f"BUILD = '{BUILD}'")
    p.write_text(t)
    p = ROOT / "dev/t302/refresh.py"
    t = p.read_text()
    t = t.replace(f'BUILD = "{OLD}"', f'BUILD = "{BUILD}"')
    t = t.replace('OLD = "2026.11.19-1"', f'OLD = "{OLD}"')
    p.write_text(t)
    p = ROOT / "dev/t302/inject.py"
    t = p.read_text().replace(f'BUILD = "{OLD}"', f'BUILD = "{BUILD}"')
    p.write_text(t)
    for p in (ROOT / "tests").glob("*.js"):
        t = p.read_text()
        if OLD in t:
            p.write_text(t.replace(OLD, BUILD))

def main():
    html = (ROOT / "index.html").read_text()
    css = (HERE / "hud.css").read_text().rstrip() + "\n"
    section = (HERE / "hud.html").read_text().rstrip() + "\n"
    dialog = (HERE / "dialog.html").read_text().rstrip() + "\n"
    logic = (HERE / "reset_logic.js").read_text().rstrip() + "\n"
    runtime = (HERE / "runtime.js").read_text().rstrip() + "\n"

    css_needle = "#setModal .mbox{max-width:540px;max-height:calc(100vh - 32px);overflow:auto}\n"
    if "/* Reset a game — Settings list" not in html:
        if css_needle not in html:
            raise SystemExit("missing setModal css needle")
        html = html.replace(css_needle, css_needle + css, 1)

    btn_needle = '    <button class="big red" id="setDhReset" style="margin-bottom:8px">🏡 Reset Dream House</button>\n'
    if 'id="resetSet"' not in html:
        if btn_needle not in html:
            raise SystemExit("missing setDhReset needle")
        html = html.replace(btn_needle, section + btn_needle, 1)

    dlg_needle = '<dialog class="modal dhresetbox" id="dhResetModal" aria-labelledby="dhResetTitle">'
    if 'id="resetModal"' not in html:
        if dlg_needle not in html:
            raise SystemExit("missing dhResetModal needle")
        html = html.replace(dlg_needle, dialog + dlg_needle, 1)

    if "function resetConfirmTitle" not in html and "ResetRules" not in html:
        script_needle = "$('#setOk').onclick = () => $('#setModal').classList.remove('show');\n"
        if script_needle not in html:
            raise SystemExit("missing setOk needle")
        block = "\n" + logic + "\n" + runtime + "\n" + script_needle
        html = html.replace(script_needle, block, 1)

    # Escape in the Settings keydown should close the reset dialog first (cancel).
    esc = """document.addEventListener('keydown', e => {
  if (e.code !== 'Escape' && e.key !== 'Escape') return;
  const sm = document.getElementById('setModal');
  if (sm && sm.classList.contains('show')){
    sm.classList.remove('show');"""
    esc_new = """document.addEventListener('keydown', e => {
  if (e.code !== 'Escape' && e.key !== 'Escape') return;
  if (typeof resetModalIsOpen === 'function' && resetModalIsOpen()){ if (typeof resetClose === 'function') resetClose(); if (e.preventDefault) e.preventDefault(); if (e.stopPropagation) e.stopPropagation(); return; }
  const sm = document.getElementById('setModal');
  if (sm && sm.classList.contains('show')){
    sm.classList.remove('show');"""
    if "resetModalIsOpen === 'function' && resetModalIsOpen()" not in html:
        html = must_replace(html, esc, esc_new, "settings Escape")

    in_game = """      if (e.code === 'Escape'){
        const sm = document.getElementById('setModal');
        if (sm && sm.classList.contains('show')){ sm.classList.remove('show'); if (e.preventDefault) e.preventDefault(); return; }"""
    in_game_new = """      if (e.code === 'Escape'){
        if (typeof resetModalIsOpen === 'function' && resetModalIsOpen()){ if (typeof resetClose === 'function') resetClose(); if (e.preventDefault) e.preventDefault(); return; }
        const sm = document.getElementById('setModal');
        if (sm && sm.classList.contains('show')){ sm.classList.remove('show'); if (e.preventDefault) e.preventDefault(); return; }"""
    if html.count("if (typeof resetModalIsOpen === 'function' && resetModalIsOpen())") < 2:
        html = must_replace(html, in_game, in_game_new, "in-game Escape")

    close_old = "setModal: '#setOk', soonModal: '#soonOk'"
    close_new = "setModal: '#setOk', resetModal: '#resetCancel', soonModal: '#soonOk'"
    if "resetModal: '#resetCancel'" not in html:
        html = must_replace(html, close_old, close_new, "closeOf")

    pick_old = "    return list.find(e => e.matches('.big.green') && e.style.display !== 'none') || list[0];"
    pick_new = "    if (c.root && c.root.id === 'resetModal'){ const no = list.find(e => e.id === 'resetCancel'); if (no) return no; }\n    return list.find(e => e.matches('.big.green') && e.style.display !== 'none') || list[0];"
    if "c.root.id === 'resetModal'" not in html:
        html = must_replace(html, pick_old, pick_new, "pickDefault")

    inert_old = "if (id === 'obby' || id === 'dhResetModal' || id === 'achToast' || id === 'frConfirm' || id === 'chRoot' || id === 'chPanel' || id === 'chWheel' || id === 'lhRoot' || id === 'lhSet' || id === 'lhDraw' || id === 'lhCut' || id === 'lhCalm') return true;"
    inert_new = "if (id === 'obby' || id === 'dhResetModal' || id === 'resetModal' || id === 'achToast' || id === 'frConfirm' || id === 'chRoot' || id === 'chPanel' || id === 'chWheel' || id === 'lhRoot' || id === 'lhSet' || id === 'lhDraw' || id === 'lhCut' || id === 'lhCalm') return true;"
    if "id === 'resetModal'" not in html.split("function dhInertExempt", 1)[-1][:800]:
        html = must_replace(html, inert_old, inert_new, "dhInertExempt")

    # BUILD
    if f"const BUILD = '{OLD}'" in html:
        html = html.replace(f"const BUILD = '{OLD}'", f"const BUILD = '{BUILD}'", 1)
    elif f"const BUILD = '{BUILD}'" not in html:
        raise SystemExit("unexpected BUILD stamp")

    (ROOT / "index.html").write_text(html)
    bump_build_files()
    print("reset inject ok, BUILD", BUILD, "len", len(html))

if __name__ == "__main__":
    main()
