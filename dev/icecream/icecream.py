# ===== t227u: 🍦 Scoop Circus Ice Cream Shop — vessel, scoops, toppings, NPC/orders, coins (stacked on Tower of Doom) =====
rep("""  {id:'tower', name:'Tower of Doom',""", """  {id:'icecream', name:'Scoop Circus Ice Cream', emoji:'🍦', tag:'Scoop silly flavours, top cones & cups, serve customers for coins!', draw: drawIceCream, playable: true, isNew: true},
  {id:'tower', name:'Tower of Doom',""")
rep("function drawTower(ctx){", r"""function drawIceCream(ctx){
  sky(ctx, '#ffc9de', '#fff0f6');
  ctx.fillStyle = '#fff0f8'; ctx.fillRect(0, 150, 320, 50);
  ctx.fillStyle = '#ffb3c7'; ctx.fillRect(40, 110, 240, 40); ctx.fillStyle = '#fff'; ctx.fillRect(40, 105, 240, 8);
  [[90, '#fff6d8'], [160, '#7fd6ff'], [230, '#ffb3c7']].forEach(([x, c]) => { ctx.fillStyle = '#d4a574'; ctx.beginPath(); ctx.moveTo(x - 14, 110); ctx.lineTo(x + 14, 110); ctx.lineTo(x, 150); ctx.fill(); ctx.fillStyle = c; ctx.beginPath(); ctx.arc(x, 100, 16, 0, Math.PI * 2); ctx.fill(); });
  guy(ctx, 50, 176, 12, '#ff6fb5'); guy(ctx, 270, 176, 12, '#3a86ff'); ctx.font = '22px sans-serif'; ctx.fillText('🍦', 150, 80);
}
function drawTower(ctx){""")
rep("""      <span id="tdBox" style="display:none">""", """      <span id="icBox" style="display:none"><b id="icN">🍦 0</b></span>
      <span id="tdBox" style="display:none">""")
rep("""  <div class="psflash" id="psFlash"></div>""", """  <div class="icorders" id="icOrders" style="display:none"></div>
  <button class="fsnear icnear" id="icAct"></button>
  <div class="opanel" id="icPanel"><div class="mbox rcbox icbox">
    <h2 id="icPT">🍦 Station</h2>
    <div class="fsitems" id="icItems"></div>
    <div class="row"><button class="big green" id="icServe">🛎️ Serve!</button><button class="big red" id="icTrash">🗑️ Start over</button><button class="big gray" id="icClose">👋 Done</button></div>
  </div></div>
  <div class="psflash" id="psFlash"></div>""")
rep(".tdBox b{color:#8b5cf6}", """.tdBox b{color:#8b5cf6}
.icorders{position:absolute;left:10px;top:64px;z-index:5;display:flex;flex-direction:column;gap:5px;pointer-events:none}
.icord{position:relative;overflow:hidden;background:rgba(255,255,255,.92);border:3px solid #7fd6ff;border-radius:12px;padding:3px 9px 7px;font-size:20px;font-weight:900;color:#1d2340}
.icord i{position:absolute;left:0;bottom:0;height:4px;background:#2ec27e}
.icnear{background:#7fd6ff;box-shadow:0 4px 0 #3a9bc8}.icnear small{color:#7fd6ff}
.icbox{max-width:min(96vw,720px)}
.icb{border:2px solid #cfefff;background:#fff;border-radius:12px;padding:4px 8px;font:inherit;font-size:20px;min-width:62px;min-height:48px;cursor:pointer;display:flex;flex-direction:column;align-items:center}
.icb small{font-size:10px;font-weight:900}.icb.on{border-color:#7fd6ff;background:#e8f7ff;box-shadow:0 0 0 2px #7fd6ff}.icb:disabled{opacity:.4;cursor:default}
@media (max-width:760px),(max-height:520px){.icord{font-size:15px}.icb{font-size:16px;min-width:50px;min-height:42px}}""")
rep("  /* ---------- per-frame ---------- */\n", open('/workspace/rublox/tests/p43/icecream.js').read() + "  /* ---------- per-frame ---------- */\n")
rep("isl = null; bk = null; wp = null; psx = null; td = null;\n    if (mode === 'tower') buildTower();", "isl = null; bk = null; wp = null; psx = null; td = null; ic = null;\n    if (mode === 'icecream') buildIceCream(); else if (mode === 'tower') buildTower();")
rep("mode === 'bakery' || mode === 'waterpark' || mode === 'photostudio' || mode === 'tower') && B.onGround && up > 0 && up <= .62)", "mode === 'bakery' || mode === 'waterpark' || mode === 'photostudio' || mode === 'tower' || mode === 'icecream') && B.onGround && up > 0 && up <= .62)")
rep("mode === 'bakery' || mode === 'waterpark' || mode === 'photostudio' || mode === 'tower'){ if (P.y < -25) respawn(); return; }", "mode === 'bakery' || mode === 'waterpark' || mode === 'photostudio' || mode === 'tower' || mode === 'icecream'){ if (P.y < -25) respawn(); return; }")
rep("mode === 'bakery' || mode === 'waterpark' || mode === 'photostudio' || mode === 'tower'){ // pull the camera", "mode === 'bakery' || mode === 'waterpark' || mode === 'photostudio' || mode === 'tower' || mode === 'icecream'){ // pull the camera")
rep("      if (td) towerUpdate(dt);\n", "      if (td) towerUpdate(dt);\n      if (ic) iceCreamUpdate(dt);\n")
rep("    if (td) towerAnimate(dt);\n", "    if (td) towerAnimate(dt);\n    if (ic) iceCreamAnimate(dt);\n")
rep("'bakery', 'waterpark', 'photostudio', 'tower'].includes(m) ? m : 'obby'; diff = mode === 'race' || mode === 'splash' || mode === 'hide' || mode === 'fashion' || mode === 'autumn' || mode === 'petisland' || mode === 'bakery' || mode === 'waterpark' || mode === 'photostudio' || mode === 'tower' ? null : d;",
    "'bakery', 'waterpark', 'photostudio', 'tower', 'icecream'].includes(m) ? m : 'obby'; diff = mode === 'race' || mode === 'splash' || mode === 'hide' || mode === 'fashion' || mode === 'autumn' || mode === 'petisland' || mode === 'bakery' || mode === 'waterpark' || mode === 'photostudio' || mode === 'tower' || mode === 'icecream' ? null : d;")
rep("    else if (mode === 'tower') banner(", "    else if (mode === 'icecream') banner(mp.on ? '🍦 Scoop Circus! Team up on the stations!' : '🍦 Scoop Circus! Customers want cones & cups!');\n    else if (mode === 'tower') banner(")
rep("mode === 'bakery' || mode === 'waterpark' || mode === 'photostudio' || mode === 'tower') $('#oTime').parentElement.style.display = 'none'; if ((mode === 'splash' || mode === 'hide' || mode === 'fashion' || mode === 'autumn' || mode === 'petisland' || mode === 'bakery' || mode === 'waterpark' || mode === 'photostudio' || mode === 'tower') && touchUI",
    "mode === 'bakery' || mode === 'waterpark' || mode === 'photostudio' || mode === 'tower' || mode === 'icecream') $('#oTime').parentElement.style.display = 'none'; if ((mode === 'splash' || mode === 'hide' || mode === 'fashion' || mode === 'autumn' || mode === 'petisland' || mode === 'bakery' || mode === 'waterpark' || mode === 'photostudio' || mode === 'tower' || mode === 'icecream') && touchUI")
rep("    $('#tdBox').style.display = mode === 'tower' ? '' : 'none';\n    if (mode === 'tower') towerEnter();", """    $('#icBox').style.display = $('#icOrders').style.display = mode === 'icecream' ? '' : 'none'; ['#icAct', '#icPanel'].forEach(id => $(id).classList.remove('show'));
    if (mode === 'icecream'){ if (!window.__icBound){ window.__icBound = true;
        $('#icAct').onclick = () => ic && ic.near >= 0 && icPanel(ic.near); $('#icClose').onclick = () => icPanel(-1);
        $('#icServe').onclick = () => { if (ic){ icDo({a: 'serve', st: ic.panel}); icPanel(-1); } };
        $('#icTrash').onclick = () => ic && icDo({a: 'trash', st: ic.panel}); }
      iceCreamEnter(); }
    $('#tdBox').style.display = mode === 'tower' ? '' : 'none';
    if (mode === 'tower') towerEnter();""")
rep(" if (td) towerStop();", " if (td) towerStop(); if (ic) iceCreamStop();")
rep("    const line = mode === 'tower' ?", "    const line = mode === 'icecream' ? '🎮 Left stick move · Ⓐ jump · Ⓧ use a scoop station · Ⓑ close · ☰ menu' : mode === 'tower' ?")
rep("    if (mode === 'tower'){\n      $('#oTip').innerHTML", """    if (mode === 'icecream'){
      $('#oTip').innerHTML = (on ? '🕹️ Left thumb moves · tap 🍦 Station to scoop' : '⌨️ WASD move · Space jump · E use a scoop station · Esc menu')
        + "<br>🍦 Pick a vessel, add scoops of silly flavours, top it, and serve the 🧾 orders!";
      return;
    }
    if (mode === 'tower'){
      $('#oTip').innerHTML""")
rep("    if (mode === 'tower' && td && tdPad(jp)) return;", "    if (mode === 'icecream' && ic && icPad(jp)) return;\n    if (mode === 'tower' && td && tdPad(jp)) return;")
rep("      if (mode === 'tower' && td && tdKey(e)) return;", "      if (mode === 'icecream' && ic && icKey(e)) return;\n      if (mode === 'tower' && td && tdKey(e)) return;")
rep("|| (psx && (psx.cam || psx.gal))) ?", "|| (psx && (psx.cam || psx.gal)) || (ic && ic.panel >= 0)) ?")
rep("psGal: '#psGalClose',", "psGal: '#psGalClose', icPanel: '#icClose',")
rep("      if (running && bk && !bk.remote && mode === 'bakery') msg.bk = bakeryWire();", "      if (running && bk && !bk.remote && mode === 'bakery') msg.bk = bakeryWire();\n      if (running && ic && !ic.remote && mode === 'icecream') msg.ic = iceCreamWire();")
rep("    if (d.bk) bakeryFromHost(d.bk);", "    if (d.bk) bakeryFromHost(d.bk);\n    if (d.ic) iceCreamFromHost(d.ic);")
rep("    else if (d.t === 'wpprog') wpGuestMsg(g, d);", "    else if (d.t === 'wpprog') wpGuestMsg(g, d);\n    else if (d.t === 'icact') icGuestMsg(g, d);")
rep("  window.obbyDebug = {\n", """  window.obbyDebug = {
    icecream: () => ic && {st: ic.st, orders: ic.orders, lv: ic.lv, served: ic.served, earned: ic.earned, panel: ic.panel, near: ic.near, remote: ic.remote, prog: icProg()},
    icDo: a => icDo(a), icPanel: i => icPanel(i), icTo(x, z){ Object.assign(P, {x, y: .05, z, vx: 0, vy: 0, vz: 0}); },
""")
