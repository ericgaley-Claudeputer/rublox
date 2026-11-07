# ===== t214u: 🌊 Splash Summit Water Park — giant slides + lazy-river float races (stacked on Sweet Team Bakery) =====
rep("""  {id:'bakery', name:'Sweet Team Bakery',""", """  {id:'waterpark', name:'Splash Summit Water Park', emoji:'🌊', tag:'Zoom down giant slides and race floats round the lazy river!', draw: drawWaterPark, playable: true, isNew: true},
  {id:'bakery', name:'Sweet Team Bakery',""")
rep("function drawBakery(ctx){", r"""function drawWaterPark(ctx){
  sky(ctx, '#7fd6ff', '#e0f7ff');
  ctx.fillStyle = '#f2e6c9'; ctx.fillRect(0, 150, 320, 50); ctx.fillStyle = '#3ac6ff'; ctx.beginPath(); ctx.ellipse(160, 172, 130, 18, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#9aa0ab'; ctx.fillRect(40, 40, 22, 120); ctx.fillStyle = '#8b5cf6'; ctx.beginPath(); ctx.moveTo(30, 42); ctx.lineTo(51, 18); ctx.lineTo(72, 42); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = 'rgba(139,92,246,.85)'; ctx.lineWidth = 12; ctx.beginPath(); ctx.moveTo(62, 46); ctx.bezierCurveTo(150, 40, 40, 110, 140, 120); ctx.bezierCurveTo(200, 128, 170, 160, 190, 168); ctx.stroke();
  ctx.strokeStyle = 'rgba(255,77,94,.85)'; ctx.beginPath(); ctx.moveTo(250, 30); ctx.lineTo(262, 160); ctx.stroke(); ctx.fillStyle = '#9aa0ab'; ctx.fillRect(240, 26, 22, 8);
  [[110, '#ff4d5e'], [200, '#ff9f1c']].forEach(([x, c]) => { ctx.strokeStyle = c; ctx.lineWidth = 7; ctx.beginPath(); ctx.ellipse(x, 174, 14, 6, 0, 0, Math.PI * 2); ctx.stroke(); });
  guy(ctx, 110, 170, 10, '#ffd23f'); ctx.font = '22px sans-serif'; ctx.fillText('💦', 182, 152); ctx.fillText('🏁', 280, 150);
}
function drawBakery(ctx){""")
rep("""      <span id="bkBox" style="display:none">""", """      <span id="wpBox" style="display:none"><b id="wpN">🌊 Water Park</b></span>
      <span id="bkBox" style="display:none">""")
rep("""  <div class="bkorders" id="bkOrders" style="display:none"></div>""", """  <button class="fsnear wpnear" id="wpAct"></button>
  <button class="fswardbtn wpbtn" id="wpRides">🎢 Rides</button>
  <div class="opanel" id="wpPanel"><div class="mbox rcbox">
    <span class="emoji">🌊</span><h2>Pick a ride!</h2>
    <div class="wplist" id="wpList"></div>
    <div class="row"><button class="big gray" id="wpClose">👋 Not now</button><button class="big gray" id="wpHome">🏠 Home</button></div>
  </div></div>
  <div class="bkorders" id="bkOrders" style="display:none"></div>""")
rep(".bkorders{", """.wpnear{background:#3a86ff;box-shadow:0 4px 0 #2563c9}.wpnear small{color:#3a86ff}.wpbtn{background:#3ac6ff;box-shadow:0 4px 0 #1f8fc0}
.wplist{display:flex;flex-direction:column;gap:8px;margin:8px 0}.wprb{display:flex;flex-direction:column;align-items:center}.wprb small{font-size:12px;font-weight:800;opacity:.85}.wprb:disabled{opacity:.5}
@media (max-width:760px),(max-height:520px){#wpPanel .emoji{display:none}#wpPanel h2{font-size:18px;margin:0}.wprb{padding:6px 12px;font-size:15px}.wplist{gap:5px;max-height:58vh;overflow:auto}}
.bkorders{""")
rep("  /* ---------- per-frame ---------- */\n", open('/workspace/rublox/tests/p39/waterpark.js').read() + "  /* ---------- per-frame ---------- */\n")
rep("isl = null; bk = null;\n    if (mode === 'bakery') buildBakery();", "isl = null; bk = null; wp = null;\n    if (mode === 'waterpark') buildWaterPark(); else if (mode === 'bakery') buildBakery();")
rep("mode === 'petisland' || mode === 'bakery') && B.onGround && up > 0 && up <= .62)", "mode === 'petisland' || mode === 'bakery' || mode === 'waterpark') && B.onGround && up > 0 && up <= .62)")
rep("mode === 'petisland' || mode === 'bakery'){ if (P.y < -25) respawn(); return; }", "mode === 'petisland' || mode === 'bakery' || mode === 'waterpark'){ if (P.y < -25) respawn(); return; }")
rep("mode === 'petisland' || mode === 'bakery'){ // pull the camera", "mode === 'petisland' || mode === 'bakery' || mode === 'waterpark'){ // pull the camera")
rep("    if (rc){ raceStep(dt); return; }\n", "    if (wp && wpStep(dt)) return;\n    if (rc){ raceStep(dt); return; }\n")
rep("      if (bk) bakeryUpdate(dt);\n", "      if (bk) bakeryUpdate(dt);\n      if (wp) waterparkUpdate(dt);\n")
rep("    if (bk) bakeryAnimate(dt);\n", "    if (bk) bakeryAnimate(dt);\n    if (wp) waterparkAnimate(dt);\n")
rep("'petisland', 'bakery'].includes(m) ? m : 'obby'; diff = mode === 'race' || mode === 'splash' || mode === 'hide' || mode === 'fashion' || mode === 'autumn' || mode === 'petisland' || mode === 'bakery' ? null : d;",
    "'petisland', 'bakery', 'waterpark'].includes(m) ? m : 'obby'; diff = mode === 'race' || mode === 'splash' || mode === 'hide' || mode === 'fashion' || mode === 'autumn' || mode === 'petisland' || mode === 'bakery' || mode === 'waterpark' ? null : d;")
rep("    else if (mode === 'bakery') banner(", "    else if (mode === 'waterpark') banner('🌊 Welcome to Splash Summit! Stand on a ride pad or press 🎢 Rides');\n    else if (mode === 'bakery') banner(")
rep("mode === 'petisland' || mode === 'bakery') $('#oTime').parentElement.style.display = 'none'; if ((mode === 'splash' || mode === 'hide' || mode === 'fashion' || mode === 'autumn' || mode === 'petisland' || mode === 'bakery') && touchUI",
    "mode === 'petisland' || mode === 'bakery' || mode === 'waterpark') $('#oTime').parentElement.style.display = 'none'; if ((mode === 'splash' || mode === 'hide' || mode === 'fashion' || mode === 'autumn' || mode === 'petisland' || mode === 'bakery' || mode === 'waterpark') && touchUI")
rep("    $('#bkBox').style.display = $('#bkOrders').style.display", """    $('#wpBox').style.display = mode === 'waterpark' ? '' : 'none'; ['#wpAct', '#wpPanel', '#wpRides'].forEach(id => $(id).classList.remove('show'));
    if (mode === 'waterpark'){ if (!window.__wpBound){ window.__wpBound = true;
        $('#wpAct').onclick = () => wpAct(); $('#wpRides').onclick = () => wp && !wp.ride && !wp.race.me && wpMenu(true); $('#wpClose').onclick = () => wpMenu(false); $('#wpHome').onclick = () => { wpMenu(false); stop(); }; }
      $('#wpRides').classList.add('show'); waterparkEnter(); }
    $('#bkBox').style.display = $('#bkOrders').style.display""")
rep(" if (bk) bakeryStop();", " if (bk) bakeryStop(); if (wp) waterparkStop();")
rep("    const line = mode === 'bakery' ?", "    const line = mode === 'waterpark' ? '🎮 Left stick move/steer · Ⓐ jump/paddle · Ⓧ ride · Ⓨ rides menu · ☰ menu' : mode === 'bakery' ?")
rep("    if (mode === 'bakery'){\n      $('#oTip').innerHTML", """    if (mode === 'waterpark'){
      $('#oTip').innerHTML = (on ? '🕹️ Left thumb moves & steers · ⬆️ jump / paddle · tap a ride button' : '⌨️ WASD move & steer · Space jump / paddle · E ride · R rides menu · Esc menu')
        + "<br>🌊 Zoom down 3 giant slides, then race floats round the lazy river — hit the ⚡ rings!";
      return;
    }
    if (mode === 'bakery'){
      $('#oTip').innerHTML""")
rep("    if (mode === 'bakery' && bk && bkPad(jp)) return;", "    if (mode === 'waterpark' && wp && wpPad(jp)) return;\n    if (mode === 'bakery' && bk && bkPad(jp)) return;")
rep("      if (mode === 'bakery' && bk && bkKey(e)) return;", "      if (mode === 'waterpark' && wp && wpKey(e)) return;\n      if (mode === 'bakery' && bk && bkKey(e)) return;")
rep("|| (bk && bk.panel >= 0)) ?", "|| (bk && bk.panel >= 0) || (wp && wp.menu)) ?")
rep("bkPanel: '#bkClose',", "bkPanel: '#bkClose', wpPanel: '#wpClose',")
rep("      if (running && bk && !bk.remote && mode === 'bakery') msg.bk = bakeryWire();", "      if (running && bk && !bk.remote && mode === 'bakery') msg.bk = bakeryWire();\n      if (running && wp && mp.host && mode === 'waterpark') msg.wp = waterparkWire();")
rep("    if (d.bk) bakeryFromHost(d.bk);", "    if (d.bk) bakeryFromHost(d.bk);\n    if (d.wp) waterparkFromHost(d.wp);")
rep("    else if (d.t === 'bkact') bkGuestMsg(g, d);", "    else if (d.t === 'bkact') bkGuestMsg(g, d);\n    else if (d.t === 'wpprog') wpGuestMsg(g, d);")
# 🧁 bakery fix (found while building this): opening a cake panel set `choosing`, which pauses the whole game loop,
# so a HOST with a panel open froze ovens + order timers for everyone. The panel already freezes your own movement.
rep("bk.panel = -1; $('#bkPanel').classList.remove('show'); choosing = false; bk.near = -2; return; }", "bk.panel = -1; $('#bkPanel').classList.remove('show'); bk.near = -2; return; }")
rep("bk.panel = i; bkPanelRender(); choosing = true; for (const k in keys)", "bk.panel = i; bkPanelRender(); for (const k in keys)")
rep("function bakeryStop(){ if (bk && bk.panel >= 0) choosing = false; bk = null;", "function bakeryStop(){ bk = null;")
rep("  window.obbyDebug = {\n", """  window.obbyDebug = {
    waterpark: () => wp && {ride: wp.ride && {i: wp.ride.i, d: +wp.ride.d.toFixed(1)}, race: {ph: wp.race.ph, n: wp.race.n, t: +wp.race.t.toFixed(1), me: wp.race.me && {d: +wp.race.me.d.toFixed(1), off: +wp.race.me.off.toFixed(2), fin: wp.race.me.fin}, res: wp.race.res, npcs: wp.race.npcs.length}, prog: wpProg(), menu: wp.menu, L: +wp.river.L.toFixed(1), earned: wp.earned, P: {x: +P.x.toFixed(2), y: +P.y.toFixed(2), z: +P.z.toFixed(2)}},
    wpRide: i => wpRideStart(i), wpRace: () => wpRaceStart(), wpMenu: o => wpMenu(o), wpTo(x, z){ Object.assign(P, {x, y: .05, z, vx: 0, vy: 0, vz: 0}); },
""")
