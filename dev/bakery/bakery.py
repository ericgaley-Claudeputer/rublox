# ===== t214u: 🧁 Sweet Team Bakery — bake, decorate & serve cakes together (stacked on Pet Adventure Island) =====
rep("""  {id:'petisland', name:'Pet Adventure Island',""", """  {id:'bakery', name:'Sweet Team Bakery', emoji:'🧁', tag:'Bake & decorate cakes with friends, fill orders, earn coins!', draw: drawBakery, playable: true, isNew: true},
  {id:'petisland', name:'Pet Adventure Island',""")
rep("function drawPetIsland(ctx){", r"""function drawBakery(ctx){
  sky(ctx, '#ffc9de', '#fff0f6');
  ctx.fillStyle = '#f7d9c4'; ctx.fillRect(0, 140, 320, 60);
  for (let i = 0; i < 8; i++){ ctx.fillStyle = i % 2 ? '#ffffff' : '#ff6fb5'; ctx.fillRect(i * 40, 20, 40, 26); }
  ctx.fillStyle = '#c98a55'; ctx.fillRect(20, 120, 280, 26); ctx.fillStyle = '#fff4e6'; ctx.fillRect(16, 114, 288, 8);
  [[80, '#6b3e1f', '#ff8fc8', 2], [160, '#ffb3c7', '#fffaf0', 1], [240, '#f6e3b4', '#9ff0c8', 1]].forEach(([x, c, f, t]) => { let y = 112;
    for (let k = 0; k < t + 1; k++){ const w = k ? 36 : 54; ctx.fillStyle = c; ctx.fillRect(x - w / 2, y - 22, w, 22); ctx.fillStyle = f; ctx.fillRect(x - w / 2 - 2, y - 26, w + 4, 7); y -= 26; }
    ctx.fillStyle = '#d8344f'; ctx.beginPath(); ctx.arc(x, y - 3, 5, 0, Math.PI * 2); ctx.fill(); });
  guy(ctx, 40, 176, 12, '#ff6fb5'); guy(ctx, 280, 176, 12, '#3a86ff'); ctx.font = '22px sans-serif'; ctx.fillText('🧁', 140, 190); ctx.fillText('🪙', 180, 190);
}
function drawPetIsland(ctx){""")
rep("""      <span id="piBox" style="display:none">""", """      <span id="bkBox" style="display:none">🧁 Bakery · <b id="bkN">🎂 0</b></span>
      <span id="piBox" style="display:none">""")
rep("""  <button class="fswardbtn" id="piBook">""", """  <div class="bkorders" id="bkOrders" style="display:none"></div>
  <button class="fsnear bknear" id="bkAct"></button>
  <div class="opanel" id="bkPanel"><div class="mbox rcbox bkbox">
    <h2 id="bkPT">🎂 Station</h2>
    <div class="fsitems" id="bkItems"></div>
    <div class="row"><button class="big" id="bkBake">🔥 Bake it!</button><button class="big green" id="bkServe">🛎️ Serve!</button><button class="big red" id="bkTrash">🗑️ Start over</button><button class="big gray" id="bkClose">👋 Done</button></div>
  </div></div>
  <button class="fswardbtn" id="piBook">""")
rep(".smode #oStam{display:none!important}", """.smode #oStam{display:none!important}
.bkorders{position:absolute;left:10px;top:64px;z-index:5;display:flex;flex-direction:column;gap:5px;pointer-events:none}
.bkord{position:relative;overflow:hidden;background:rgba(255,255,255,.92);border:3px solid #ff6fb5;border-radius:12px;padding:3px 9px 7px;font-size:20px;font-weight:900;color:#1d2340}
.bkord i{position:absolute;left:0;bottom:0;height:4px;background:#2ec27e}
.bknear{background:#ff6fb5;box-shadow:0 4px 0 #c94a8a}.bknear small{color:#ff6fb5}
.bkbox{max-width:min(96vw,720px)}
.bkb{border:2px solid #ffd1e6;background:#fff;border-radius:12px;padding:4px 8px;font:inherit;font-size:20px;min-width:62px;min-height:48px;cursor:pointer;display:flex;flex-direction:column;align-items:center}
.bkb small{font-size:10px;font-weight:900}.bkb.on{border-color:#ff6fb5;background:#ffe4ef;box-shadow:0 0 0 2px #ff6fb5}.bkb:disabled{opacity:.4;cursor:default}
.bkot{display:inline-block;background:#fff4e6;border-radius:8px;padding:1px 6px;margin:2px;font-size:15px}
@media (max-width:760px),(max-height:520px){.bkord{font-size:15px}.bkb{font-size:16px;min-width:50px;min-height:42px;padding:2px 5px}#bkPanel h2{font-size:17px;margin:0}#bkItems{max-height:52vh;overflow:auto}}""")
rep("  /* ---------- per-frame ---------- */\n", open('/workspace/rublox/tests/p38/bakery.js').read() + "  /* ---------- per-frame ---------- */\n")
rep("hs = null; fs = null; au = null; isl = null;\n    if (mode === 'petisland') buildPetIsland();", "hs = null; fs = null; au = null; isl = null; bk = null;\n    if (mode === 'bakery') buildBakery(); else if (mode === 'petisland') buildPetIsland();")
rep("mode === 'autumn' || mode === 'petisland') && B.onGround && up > 0 && up <= .62)", "mode === 'autumn' || mode === 'petisland' || mode === 'bakery') && B.onGround && up > 0 && up <= .62)")
rep("mode === 'autumn' || mode === 'petisland'){ if (P.y < -25) respawn(); return; }", "mode === 'autumn' || mode === 'petisland' || mode === 'bakery'){ if (P.y < -25) respawn(); return; }")
rep("mode === 'autumn' || mode === 'petisland'){ // pull the camera", "mode === 'autumn' || mode === 'petisland' || mode === 'bakery'){ // pull the camera")
rep("      if (isl) petIslandUpdate(dt);\n", "      if (isl) petIslandUpdate(dt);\n      if (bk) bakeryUpdate(dt);\n")
rep("    if (isl) petIslandAnimate(dt);\n", "    if (isl) petIslandAnimate(dt);\n    if (bk) bakeryAnimate(dt);\n")
rep("'fashion', 'autumn', 'petisland'].includes(m) ? m : 'obby'; diff = mode === 'race' || mode === 'splash' || mode === 'hide' || mode === 'fashion' || mode === 'autumn' || mode === 'petisland' ? null : d;",
    "'fashion', 'autumn', 'petisland', 'bakery'].includes(m) ? m : 'obby'; diff = mode === 'race' || mode === 'splash' || mode === 'hide' || mode === 'fashion' || mode === 'autumn' || mode === 'petisland' || mode === 'bakery' ? null : d;")
rep("    else if (mode === 'petisland') banner(", "    else if (mode === 'bakery') banner(mp.on ? '🧁 Welcome to the Sweet Team Bakery! Bake together!' : '🧁 Welcome to the Sweet Team Bakery! Customers are coming!');\n    else if (mode === 'petisland') banner(")
rep("mode === 'autumn' || mode === 'petisland') $('#oTime').parentElement.style.display = 'none'; if ((mode === 'splash' || mode === 'hide' || mode === 'fashion' || mode === 'autumn' || mode === 'petisland') && touchUI",
    "mode === 'autumn' || mode === 'petisland' || mode === 'bakery') $('#oTime').parentElement.style.display = 'none'; if ((mode === 'splash' || mode === 'hide' || mode === 'fashion' || mode === 'autumn' || mode === 'petisland' || mode === 'bakery') && touchUI")
rep("    $('#piBox').style.display = mode === 'petisland' ? '' : 'none';", """    $('#bkBox').style.display = $('#bkOrders').style.display = mode === 'bakery' ? '' : 'none'; ['#bkAct', '#bkPanel'].forEach(id => $(id).classList.remove('show'));
    if (mode === 'bakery'){ if (!window.__bkBound){ window.__bkBound = true;
        $('#bkAct').onclick = () => bk && bk.near >= 0 && bkPanel(bk.near); $('#bkClose').onclick = () => bkPanel(-1);
        $('#bkBake').onclick = () => bk && bkDo({a: 'bake', st: bk.panel}); $('#bkServe').onclick = () => { if (bk){ bkDo({a: 'serve', st: bk.panel}); bkPanel(-1); } };
        $('#bkTrash').onclick = () => bk && bkDo({a: 'trash', st: bk.panel}); }
      bakeryEnter(); }
    $('#piBox').style.display = mode === 'petisland' ? '' : 'none';""")
rep(" if (isl) petIslandStop();", " if (isl) petIslandStop(); if (bk) bakeryStop();")
rep("    const line = mode === 'petisland' ?", "    const line = mode === 'bakery' ? '🎮 Left stick move · Ⓐ jump · Ⓧ use a cake station · Ⓑ close · ☰ menu' : mode === 'petisland' ?")
rep("    if (mode === 'petisland'){\n      $('#oTip').innerHTML", """    if (mode === 'bakery'){
      $('#oTip').innerHTML = (on ? '🕹️ Left thumb moves · tap 🎂 Station to bake' : '⌨️ WASD move · Space jump · E use a cake station · Esc menu')
        + "<br>🧁 Bake a cake, frost it, top it and serve it to match the 🧾 orders!";
      return;
    }
    if (mode === 'petisland'){
      $('#oTip').innerHTML""")
rep("    if (mode === 'petisland' && isl && piPad(jp)) return;", "    if (mode === 'bakery' && bk && bkPad(jp)) return;\n    if (mode === 'petisland' && isl && piPad(jp)) return;")
rep("      if (mode === 'petisland' && isl && piKey(e)) return;", "      if (mode === 'bakery' && bk && bkKey(e)) return;\n      if (mode === 'petisland' && isl && piKey(e)) return;")
rep("|| (isl && isl.panel)) ?", "|| (isl && isl.panel) || (bk && bk.panel >= 0)) ?")
rep("piPanel: '#piClose',", "piPanel: '#piClose', bkPanel: '#bkClose',")
# multiplayer: host shares the bakery state; guests send their actions
rep("      if (running && fs && !fs.remote && mode === 'fashion') msg.fs = fashionWire();", "      if (running && fs && !fs.remote && mode === 'fashion') msg.fs = fashionWire();\n      if (running && bk && !bk.remote && mode === 'bakery') msg.bk = bakeryWire();")
rep("    if (d.fs) fashionFromHost(d.fs);", "    if (d.fs) fashionFromHost(d.fs);\n    if (d.bk) bakeryFromHost(d.bk);")
rep("    else if (d.t === 'btfin'){", "    else if (d.t === 'bkact') bkGuestMsg(g, d);\n    else if (d.t === 'btfin'){")
rep("  window.obbyDebug = {\n", """  window.obbyDebug = {
    bakery: () => bk && {st: bk.st, orders: bk.orders, lv: bk.lv, served: bk.served, earned: bk.earned, panel: bk.panel, near: bk.near, remote: bk.remote, prog: bkProg(), npc: Object.keys(bk.npcM).length},
    bkDo: a => bkDo(a), bkPanel: i => bkPanel(i), bkTo(x, z){ Object.assign(P, {x, y: .05, z, vx: 0, vy: 0, vz: 0}); },
""")
