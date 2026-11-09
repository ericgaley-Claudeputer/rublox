# ===== t227u: 🐴 Clover Meadow Stables — adopt original pony, care, ride, jumping show (stacked on Ice Cream) =====
rep("""  {id:'icecream', name:'Scoop Circus Ice Cream',""", """  {id:'stable', name:'Clover Meadow Stables', emoji:'🐴', tag:'Adopt a pony, brush & feed it, ride the meadow, and enter jumping shows!', draw: drawStable, playable: true, isNew: true},
  {id:'icecream', name:'Scoop Circus Ice Cream',""")
rep("function drawIceCream(ctx){", r"""function drawStable(ctx){
  sky(ctx, '#9fd8ff', '#e8ffe8');
  ctx.fillStyle = '#8fd39a'; ctx.fillRect(0, 150, 320, 50);
  ctx.fillStyle = '#d4a574'; ctx.fillRect(30, 90, 90, 70); ctx.fillStyle = '#8a5a3c'; ctx.beginPath(); ctx.moveTo(20, 90); ctx.lineTo(75, 55); ctx.lineTo(130, 90); ctx.fill();
  ctx.fillStyle = '#f6e3b4'; ctx.fillRect(200, 120, 50, 30); ctx.fillStyle = '#ff9f1c'; ctx.fillRect(210, 100, 20, 25);
  [[180, 155], [220, 155], [200, 155], [240, 155]].forEach(([x, y]) => { ctx.fillStyle = '#c9a06a'; ctx.fillRect(x, y, 8, 20); });
  guy(ctx, 160, 176, 12, '#2ec27e'); ctx.font = '22px sans-serif'; ctx.fillText('🐴', 70, 80); ctx.fillText('🏆', 260, 100);
}
function drawIceCream(ctx){""")
rep("""      <span id="icBox" style="display:none">""", """      <span id="sbBox" style="display:none"><b id="sbN">🐴 Stable</b></span>
      <span id="icBox" style="display:none">""")
rep("""  <div class="icorders" id="icOrders" style="display:none"></div>""", """  <button class="fsnear sbnear" id="sbAct"></button>
  <div class="opanel" id="sbPick"></div>
  <div class="icorders" id="icOrders" style="display:none"></div>""")
rep(".icorders{position:absolute;left:10px;top:64px;z-index:5;display:flex;flex-direction:column;gap:5px;pointer-events:none}", """.sbnear{background:#ff9f1c;box-shadow:0 4px 0 #c47a10}.sbnear small{color:#ff9f1c}
#sbPick{z-index:8}#sbPick.show{display:flex}#sbPick .mbox,#sbPick{align-items:center;justify-content:center}
#sbPick{position:absolute;inset:0;background:rgba(29,35,64,.55);flex-direction:column}
#sbPick h2{color:#fff;font-size:28px;margin:8px}#sbPick .fsitems{background:rgba(255,255,255,.95);border-radius:16px;padding:10px;max-width:92vw}
.icorders{position:absolute;left:10px;top:64px;z-index:5;display:flex;flex-direction:column;gap:5px;pointer-events:none}""")
rep("  /* ---------- per-frame ---------- */\n", open('/workspace/rublox/tests/p44/stable.js').read() + "  /* ---------- per-frame ---------- */\n")
rep("isl = null; bk = null; wp = null; psx = null; td = null; ic = null;\n    if (mode === 'icecream') buildIceCream();", "isl = null; bk = null; wp = null; psx = null; td = null; ic = null; sb = null;\n    if (mode === 'stable') buildStable(); else if (mode === 'icecream') buildIceCream();")
rep("mode === 'bakery' || mode === 'waterpark' || mode === 'photostudio' || mode === 'tower' || mode === 'icecream') && B.onGround && up > 0 && up <= .62)", "mode === 'bakery' || mode === 'waterpark' || mode === 'photostudio' || mode === 'tower' || mode === 'icecream' || mode === 'stable') && B.onGround && up > 0 && up <= .62)")
rep("mode === 'bakery' || mode === 'waterpark' || mode === 'photostudio' || mode === 'tower' || mode === 'icecream'){ if (P.y < -25) respawn(); return; }", "mode === 'bakery' || mode === 'waterpark' || mode === 'photostudio' || mode === 'tower' || mode === 'icecream' || mode === 'stable'){ if (P.y < -25) respawn(); return; }")
rep("mode === 'bakery' || mode === 'waterpark' || mode === 'photostudio' || mode === 'tower' || mode === 'icecream'){ // pull the camera", "mode === 'bakery' || mode === 'waterpark' || mode === 'photostudio' || mode === 'tower' || mode === 'icecream' || mode === 'stable'){ // pull the camera")
rep("      if (ic) iceCreamUpdate(dt);\n", "      if (ic) iceCreamUpdate(dt);\n      if (sb) stableUpdate(dt);\n")
rep("    if (ic) iceCreamAnimate(dt);\n", "    if (ic) iceCreamAnimate(dt);\n    if (sb) stableAnimate(dt);\n")
rep("'bakery', 'waterpark', 'photostudio', 'tower', 'icecream'].includes(m) ? m : 'obby'; diff = mode === 'race' || mode === 'splash' || mode === 'hide' || mode === 'fashion' || mode === 'autumn' || mode === 'petisland' || mode === 'bakery' || mode === 'waterpark' || mode === 'photostudio' || mode === 'tower' || mode === 'icecream' ? null : d;",
    "'bakery', 'waterpark', 'photostudio', 'tower', 'icecream', 'stable'].includes(m) ? m : 'obby'; diff = mode === 'race' || mode === 'splash' || mode === 'hide' || mode === 'fashion' || mode === 'autumn' || mode === 'petisland' || mode === 'bakery' || mode === 'waterpark' || mode === 'photostudio' || mode === 'tower' || mode === 'icecream' || mode === 'stable' ? null : d;")
rep("    else if (mode === 'icecream') banner(", "    else if (mode === 'stable') banner('🐴 Welcome to Clover Meadow Stables!');\n    else if (mode === 'icecream') banner(")
rep("mode === 'bakery' || mode === 'waterpark' || mode === 'photostudio' || mode === 'tower' || mode === 'icecream') $('#oTime').parentElement.style.display = 'none'; if ((mode === 'splash' || mode === 'hide' || mode === 'fashion' || mode === 'autumn' || mode === 'petisland' || mode === 'bakery' || mode === 'waterpark' || mode === 'photostudio' || mode === 'tower' || mode === 'icecream') && touchUI",
    "mode === 'bakery' || mode === 'waterpark' || mode === 'photostudio' || mode === 'tower' || mode === 'icecream' || mode === 'stable') $('#oTime').parentElement.style.display = 'none'; if ((mode === 'splash' || mode === 'hide' || mode === 'fashion' || mode === 'autumn' || mode === 'petisland' || mode === 'bakery' || mode === 'waterpark' || mode === 'photostudio' || mode === 'tower' || mode === 'icecream' || mode === 'stable') && touchUI")
rep("    $('#icBox').style.display = $('#icOrders').style.display = mode === 'icecream' ? '' : 'none'; ['#icAct', '#icPanel'].forEach(id => $(id).classList.remove('show'));", """    $('#sbBox').style.display = mode === 'stable' ? '' : 'none'; ['#sbAct', '#sbPick'].forEach(id => $(id).classList.remove('show'));
    if (mode === 'stable'){ if (!window.__sbBound){ window.__sbBound = true; $('#sbAct').onclick = () => sbAct(); }
      stableEnter(); }
    $('#icBox').style.display = $('#icOrders').style.display = mode === 'icecream' ? '' : 'none'; ['#icAct', '#icPanel'].forEach(id => $(id).classList.remove('show'));""")
rep(" if (ic) iceCreamStop();", " if (ic) iceCreamStop(); if (sb) stableStop();")
rep("    const line = mode === 'icecream' ?", "    const line = mode === 'stable' ? '🎮 Left stick move · Ⓐ jump · Ⓧ care / mount / show · ☰ menu' : mode === 'icecream' ?")
rep("    if (mode === 'icecream'){\n      $('#oTip').innerHTML", """    if (mode === 'stable'){
      $('#oTip').innerHTML = (on ? '🕹️ Left thumb moves · tap 🐴 actions' : '⌨️ WASD move · Space jump · E care / mount / show · Esc menu')
        + "<br>🐴 Adopt a pony, brush · feed · groom, then ride to the 🏆 jumping show!";
      return;
    }
    if (mode === 'icecream'){
      $('#oTip').innerHTML""")
rep("    if (mode === 'icecream' && ic && icPad(jp)) return;", "    if (mode === 'stable' && sb && sbPad(jp)) return;\n    if (mode === 'icecream' && ic && icPad(jp)) return;")
rep("      if (mode === 'icecream' && ic && icKey(e)) return;", "      if (mode === 'stable' && sb && sbKey(e)) return;\n      if (mode === 'icecream' && ic && icKey(e)) return;")
rep("|| (psx && (psx.cam || psx.gal)) || (ic && ic.panel >= 0)) ?", "|| (psx && (psx.cam || psx.gal)) || (ic && ic.panel >= 0) || (sb && sb.panel)) ?")
rep("icPanel: '#icClose',", "icPanel: '#icClose', sbPick: '#sbPickClose',")
rep("  window.obbyDebug = {\n", """  window.obbyDebug = {
    stable: () => sb && {ph: sb.ph, pony: sb.pony && Object.assign({}, sb.pony), near: sb.near, ridden: sb.ridden, show: sb.show && Object.assign({}, sb.show), earned: sb.earned, prog: sbProg()},
    sbAdopt: id => sbAdopt(id), sbCare: k => sbCare(k), sbMount: o => sbMount(o), sbShow: () => sbStartShow(), sbAct: () => sbAct(), sbTo(x, z){ Object.assign(P, {x, y: .05, z, vx: 0, vy: 0, vz: 0}); },
""")
