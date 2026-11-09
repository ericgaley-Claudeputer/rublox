# ===== t227u: 🗼 Tower of Doom — climb stacked sections while bubbly goo rises (stacked on Photo Studio) =====
rep("""  {id:'photostudio', name:'Star Snaps Photo Studio',""", """  {id:'tower', name:'Tower of Doom', emoji:'🗼', tag:'Climb a stacked tower while bubbly goo rises from below!', draw: drawTower, playable: true, isNew: true},
  {id:'photostudio', name:'Star Snaps Photo Studio',""")
rep("function drawPhotoStudio(ctx){", r"""function drawTower(ctx){
  sky(ctx, '#9fd8ff', '#fff6d8');
  ctx.fillStyle = '#8fd39a'; ctx.fillRect(0, 160, 320, 40);
  for (let i = 0; i < 6; i++){ ctx.fillStyle = ['#c39bff','#7fd6ff','#ffb3c7','#ffe08a','#9ff0c8','#ff9f6b'][i]; ctx.fillRect(140 - i * 4, 150 - i * 22, 40 + i * 8, 18); }
  ctx.fillStyle = '#b388ff'; ctx.globalAlpha = .85; ctx.fillRect(40, 170, 240, 22); ctx.globalAlpha = 1;
  guy(ctx, 160, 70, 10, '#ff6fb5'); ctx.font = '22px sans-serif'; ctx.fillText('🗼', 40, 60); ctx.fillText('🫧', 260, 180);
}
function drawPhotoStudio(ctx){""")
rep("""      <span id="psBox" style="display:none">""", """      <span id="tdBox" style="display:none">🗼 <b id="tdH">0</b>m · 🫧 <b id="tdGoo">0</b></span>
      <span id="psBox" style="display:none">""")
rep(".psnear{background:#ff6fb5;box-shadow:0 4px 0 #c94f8d}", """.tdBox b{color:#8b5cf6}
.psnear{background:#ff6fb5;box-shadow:0 4px 0 #c94f8d}""")
rep("  /* ---------- per-frame ---------- */\n", open('/workspace/rublox/tests/p42/tower.js').read() + "  /* ---------- per-frame ---------- */\n")
rep("isl = null; bk = null; wp = null; psx = null;\n    if (mode === 'photostudio') buildPhotoStudio();", "isl = null; bk = null; wp = null; psx = null; td = null;\n    if (mode === 'tower') buildTower(); else if (mode === 'photostudio') buildPhotoStudio();")
rep("mode === 'bakery' || mode === 'waterpark' || mode === 'photostudio') && B.onGround && up > 0 && up <= .62)", "mode === 'bakery' || mode === 'waterpark' || mode === 'photostudio' || mode === 'tower') && B.onGround && up > 0 && up <= .62)")
rep("mode === 'bakery' || mode === 'waterpark' || mode === 'photostudio'){ if (P.y < -25) respawn(); return; }", "mode === 'bakery' || mode === 'waterpark' || mode === 'photostudio' || mode === 'tower'){ if (P.y < -25) respawn(); return; }")
rep("mode === 'bakery' || mode === 'waterpark' || mode === 'photostudio'){ // pull the camera", "mode === 'bakery' || mode === 'waterpark' || mode === 'photostudio' || mode === 'tower'){ // pull the camera")
rep("      if (psx) photostudioUpdate(dt);\n", "      if (psx) photostudioUpdate(dt);\n      if (td) towerUpdate(dt);\n")
rep("    if (psx) photostudioAnimate(dt);\n", "    if (psx) photostudioAnimate(dt);\n    if (td) towerAnimate(dt);\n")
rep("'bakery', 'waterpark', 'photostudio'].includes(m) ? m : 'obby'; diff = mode === 'race' || mode === 'splash' || mode === 'hide' || mode === 'fashion' || mode === 'autumn' || mode === 'petisland' || mode === 'bakery' || mode === 'waterpark' || mode === 'photostudio' ? null : d;",
    "'bakery', 'waterpark', 'photostudio', 'tower'].includes(m) ? m : 'obby'; diff = mode === 'race' || mode === 'splash' || mode === 'hide' || mode === 'fashion' || mode === 'autumn' || mode === 'petisland' || mode === 'bakery' || mode === 'waterpark' || mode === 'photostudio' || mode === 'tower' ? null : d;")
rep("    else if (mode === 'photostudio') banner(", "    else if (mode === 'tower') banner('🗼 Welcome to the Tower of Doom! Climb past the bubbly goo!');\n    else if (mode === 'photostudio') banner(")
rep("mode === 'bakery' || mode === 'waterpark' || mode === 'photostudio') $('#oTime').parentElement.style.display = 'none'; if ((mode === 'splash' || mode === 'hide' || mode === 'fashion' || mode === 'autumn' || mode === 'petisland' || mode === 'bakery' || mode === 'waterpark' || mode === 'photostudio') && touchUI",
    "mode === 'bakery' || mode === 'waterpark' || mode === 'photostudio' || mode === 'tower') $('#oTime').parentElement.style.display = 'none'; if ((mode === 'splash' || mode === 'hide' || mode === 'fashion' || mode === 'autumn' || mode === 'petisland' || mode === 'bakery' || mode === 'waterpark' || mode === 'photostudio' || mode === 'tower') && touchUI")
rep("    $('#psBox').style.display = mode === 'photostudio' ? '' : 'none';", """    $('#tdBox').style.display = mode === 'tower' ? '' : 'none';
    if (mode === 'tower') towerEnter();
    $('#psBox').style.display = mode === 'photostudio' ? '' : 'none';""")
rep(" if (psx) photostudioStop();", " if (psx) photostudioStop(); if (td) towerStop();")
rep("    const line = mode === 'photostudio' ?", "    const line = mode === 'tower' ? '🎮 Left stick move · Ⓐ jump · ☰ menu' : mode === 'photostudio' ?")
rep("    if (mode === 'photostudio'){\n      $('#oTip').innerHTML", """    if (mode === 'tower'){
      $('#oTip').innerHTML = (on ? '🕹️ Left thumb moves · Ⓐ jump' : '⌨️ WASD move · Space jump · Esc menu')
        + "<br>🗼 Climb the stacked tower — gold pads are checkpoints · don't let the bubbly goo catch you!";
      return;
    }
    if (mode === 'photostudio'){
      $('#oTip').innerHTML""")
rep("    if (mode === 'photostudio' && psx && psPad(jp)) return;", "    if (mode === 'tower' && td && tdPad(jp)) return;\n    if (mode === 'photostudio' && psx && psPad(jp)) return;")
rep("      if (mode === 'photostudio' && psx && psKey(e)) return;", "      if (mode === 'tower' && td && tdKey(e)) return;\n      if (mode === 'photostudio' && psx && psKey(e)) return;")
rep("  window.obbyDebug = {\n", """  window.obbyDebug = {
    tower: () => td && {ph: td.ph, t: td.t, goo: td.goo, maxY, earned: td.earned, paid: td.paid, kind: td.kind.slice(), prog: tdProg()},
""")
