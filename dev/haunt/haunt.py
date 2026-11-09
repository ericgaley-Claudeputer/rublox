# ===== t227u: 👻 Giggle Manor Escape — mild puzzle escape (stacked on Stables) =====
rep("""  {id:'stable', name:'Clover Meadow Stables',""", """  {id:'haunt', name:'Giggle Manor Escape', emoji:'👻', tag:'Friendly ghosts, puzzle rooms, escape before the timer!', draw: drawHaunt, playable: true, isNew: true},
  {id:'stable', name:'Clover Meadow Stables',""")
rep("function drawStable(ctx){", r"""function drawHaunt(ctx){
  sky(ctx, '#2a2450', '#5b4d7a');
  ctx.fillStyle = '#4a3f6b'; ctx.fillRect(0, 140, 320, 60);
  ctx.fillStyle = '#6b5b8a'; ctx.fillRect(40, 40, 240, 110); ctx.fillStyle = '#3a3060'; ctx.fillRect(60, 100, 40, 50); ctx.fillRect(220, 100, 40, 50);
  ctx.font = '28px sans-serif'; ctx.fillText('👻', 90, 90); ctx.fillText('👻', 200, 90); ctx.fillText('🔑', 150, 70);
  guy(ctx, 160, 176, 12, '#c39bff'); ctx.font = '20px sans-serif'; ctx.fillText('🚪', 150, 50);
}
function drawStable(ctx){""")
rep("""      <span id="sbBox" style="display:none">""", """      <span id="hmBox" style="display:none"><b id="hmN">👻 Escape</b></span>
      <span id="sbBox" style="display:none">""")
rep("""  <button class="fsnear sbnear" id="sbAct"></button>""", """  <button class="fsnear hmnear" id="hmAct"></button>
  <button class="fsnear sbnear" id="sbAct"></button>""")
rep(".sbnear{background:#ff9f1c;box-shadow:0 4px 0 #c47a10}.sbnear small{color:#ff9f1c}", """.hmnear{background:#8b5cf6;box-shadow:0 4px 0 #5b34c0}.hmnear small{color:#8b5cf6}
.sbnear{background:#ff9f1c;box-shadow:0 4px 0 #c47a10}.sbnear small{color:#ff9f1c}""")
rep("  /* ---------- per-frame ---------- */\n", open('/workspace/rublox/tests/p45/haunt.js').read() + "  /* ---------- per-frame ---------- */\n")
rep("isl = null; bk = null; wp = null; psx = null; td = null; ic = null; sb = null;\n    if (mode === 'stable') buildStable();", "isl = null; bk = null; wp = null; psx = null; td = null; ic = null; sb = null; hm = null;\n    if (mode === 'haunt') buildHaunt(); else if (mode === 'stable') buildStable();")
rep("mode === 'tower' || mode === 'icecream' || mode === 'stable') && B.onGround && up > 0 && up <= .62)", "mode === 'tower' || mode === 'icecream' || mode === 'stable' || mode === 'haunt') && B.onGround && up > 0 && up <= .62)")
rep("mode === 'tower' || mode === 'icecream' || mode === 'stable'){ if (P.y < -25) respawn(); return; }", "mode === 'tower' || mode === 'icecream' || mode === 'stable' || mode === 'haunt'){ if (P.y < -25) respawn(); return; }")
rep("mode === 'tower' || mode === 'icecream' || mode === 'stable'){ // pull the camera", "mode === 'tower' || mode === 'icecream' || mode === 'stable' || mode === 'haunt'){ // pull the camera")
rep("      if (sb) stableUpdate(dt);\n", "      if (sb) stableUpdate(dt);\n      if (hm) hauntUpdate(dt);\n")
rep("    if (sb) stableAnimate(dt);\n", "    if (sb) stableAnimate(dt);\n    if (hm) hauntAnimate(dt);\n")
rep("'tower', 'icecream', 'stable'].includes(m) ? m : 'obby'; diff = mode === 'race' || mode === 'splash' || mode === 'hide' || mode === 'fashion' || mode === 'autumn' || mode === 'petisland' || mode === 'bakery' || mode === 'waterpark' || mode === 'photostudio' || mode === 'tower' || mode === 'icecream' || mode === 'stable' ? null : d;",
    "'tower', 'icecream', 'stable', 'haunt'].includes(m) ? m : 'obby'; diff = mode === 'race' || mode === 'splash' || mode === 'hide' || mode === 'fashion' || mode === 'autumn' || mode === 'petisland' || mode === 'bakery' || mode === 'waterpark' || mode === 'photostudio' || mode === 'tower' || mode === 'icecream' || mode === 'stable' || mode === 'haunt' ? null : d;")
rep("    else if (mode === 'stable') banner(", "    else if (mode === 'haunt') banner('👻 Welcome to Giggle Manor — friendly ghosts ahead!');\n    else if (mode === 'stable') banner(")
rep("mode === 'tower' || mode === 'icecream' || mode === 'stable') $('#oTime').parentElement.style.display = 'none'; if ((mode === 'splash' || mode === 'hide' || mode === 'fashion' || mode === 'autumn' || mode === 'petisland' || mode === 'bakery' || mode === 'waterpark' || mode === 'photostudio' || mode === 'tower' || mode === 'icecream' || mode === 'stable') && touchUI",
    "mode === 'tower' || mode === 'icecream' || mode === 'stable' || mode === 'haunt') $('#oTime').parentElement.style.display = 'none'; if ((mode === 'splash' || mode === 'hide' || mode === 'fashion' || mode === 'autumn' || mode === 'petisland' || mode === 'bakery' || mode === 'waterpark' || mode === 'photostudio' || mode === 'tower' || mode === 'icecream' || mode === 'stable' || mode === 'haunt') && touchUI")
rep("    ['#psCamBtn','#psGalBtn','#psBar','#bkAct','#icAct','#sbAct','#wpAct','#wpRides','#piAct','#piBook','#fsNear','#fsWardBtn','#fsShowBtn','#hsBlind'].forEach(id => { const e = $(id); if (e) e.classList.remove('show'); });",
    "    ['#psCamBtn','#psGalBtn','#psBar','#bkAct','#icAct','#sbAct','#hmAct','#dbLane','#wpAct','#wpRides','#piAct','#piBook','#fsNear','#fsWardBtn','#fsShowBtn','#hsBlind'].forEach(id => { const e = $(id); if (e) e.classList.remove('show'); });")
rep("    $('#sbBox').style.display = mode === 'stable' ? '' : 'none'; ['#sbAct', '#sbPick'].forEach(id => $(id).classList.remove('show'));",
    """    $('#hmBox').style.display = mode === 'haunt' ? '' : 'none'; ['#hmAct'].forEach(id => $(id).classList.remove('show'));
    if (mode === 'haunt'){ if (!window.__hmBound){ window.__hmBound = true; $('#hmAct').onclick = () => hmAct(); }
      hauntEnter(); }
    $('#sbBox').style.display = mode === 'stable' ? '' : 'none'; ['#sbAct', '#sbPick'].forEach(id => $(id).classList.remove('show'));""")
rep(" if (sb) stableStop();", " if (sb) stableStop(); if (hm) hauntStop();")
rep("    const line = mode === 'stable' ?", "    const line = mode === 'haunt' ? '🎮 Left stick move · Ⓐ jump · Ⓧ use puzzle · ☰ menu' : mode === 'stable' ?")
rep("    if (mode === 'stable'){\n      $('#oTip').innerHTML", """    if (mode === 'haunt'){
      $('#oTip').innerHTML = (on ? '🕹️ Move · tap 👻 actions' : '⌨️ WASD · Space jump · E use · Esc Home on lose')
        + "<br>👻 Keys · song pads · colour ghost hug · levers · then the 🚪 exit!";
      return;
    }
    if (mode === 'stable'){
      $('#oTip').innerHTML""")
rep("    if (mode === 'stable' && sb && sbPad(jp)) return;", "    if (mode === 'haunt' && hm && hmPad(jp)) return;\n    if (mode === 'stable' && sb && sbPad(jp)) return;")
rep("      if (mode === 'stable' && sb && sbKey(e)) return;", "      if (mode === 'haunt' && hm && hmKey(e)) return;\n      if (mode === 'stable' && sb && sbKey(e)) return;")
rep("      if (mode === 'tower' && td && over && e.code === 'Escape' && !e.repeat){ stop(); return; }",
    "      if (mode === 'haunt' && hm && over && e.code === 'Escape' && !e.repeat){ stop(); return; }\n      if (mode === 'tower' && td && over && e.code === 'Escape' && !e.repeat){ stop(); return; }")
rep("  window.obbyDebug = {\n", """  window.obbyDebug = {
    haunt: () => hm && {ph: hm.ph, t: hm.t, keys: hm.keys, patternDone: !!hm.patternDone, colour: hm.colour, needCol: hm.needCol, levers: hm.levers.slice(), doorOpen: hm.doorOpen, near: hm.near, earned: hm.earned, prog: hmProg()},
    hmAct: () => hmAct(), hmTo(x, z){ Object.assign(P, {x, y: .05, z, vx: 0, vy: 0, vz: 0}); },
""")
