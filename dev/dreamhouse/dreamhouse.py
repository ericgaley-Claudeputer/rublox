# ===== t242u: 🏡 Dream House Builders — own plot, grid-snap walls/floors/roofs/furniture (stacked on Dance) =====
rep("""  {id:'dance', name:'Bossa Beat Dance Battle',""", """  {id:'dreamhouse', name:'Dream House Builders', emoji:'🏡', tag:'Claim a plot, snap walls, roofs and furniture into your dream house!', draw: drawDreamHouse, playable: true, isNew: true},
  {id:'dance', name:'Bossa Beat Dance Battle',""")
rep("function drawDance(ctx){", r"""function drawDreamHouse(ctx){
  sky(ctx, '#9fd8ff', '#fff6d8');
  ctx.fillStyle = '#8fd39a'; ctx.fillRect(0, 150, 320, 50);
  ctx.fillStyle = '#cfc4a8'; ctx.fillRect(0, 165, 320, 12);
  ctx.fillStyle = '#f6e3b4'; ctx.fillRect(110, 100, 100, 60);
  ctx.fillStyle = '#ff9f6b'; ctx.beginPath(); ctx.moveTo(100, 100); ctx.lineTo(160, 60); ctx.lineTo(220, 100); ctx.fill();
  ctx.fillStyle = '#8b4513'; ctx.fillRect(150, 128, 22, 32);
  ctx.fillStyle = '#bfe9ff'; ctx.fillRect(122, 112, 22, 18); ctx.fillRect(176, 112, 22, 18);
  guy(ctx, 70, 168, 11, '#ff6fb5'); guy(ctx, 240, 168, 11, '#3a86ff');
  ctx.font = '22px sans-serif'; ctx.fillText('🏡', 40, 70); ctx.fillText('🪙', 260, 80);
}
function drawDance(ctx){""")
rep("""      <span id="dbBox" style="display:none">""", """      <span id="dhBox" style="display:none">🏡 <b id="dhN">🪙 0</b> · <b id="dhStory">1F</b> <b id="dhTool">🏗️</b></span>
      <span id="dbBox" style="display:none">""")
rep("""  <div class="dblane" id="dbLane" style="display:none"></div>""", """  <button class="fsnear dhnear" id="dhAct"></button>
  <div class="dhbar" id="dhBar" style="display:none"></div>
  <div class="dblane" id="dbLane" style="display:none"></div>""")
rep(".dblane{position:absolute;left:50%;bottom:110px;", """.dhnear{background:#2ec27e;box-shadow:0 4px 0 #1f9460}.dhnear small{color:#2ec27e}
.dhbar{position:absolute;left:50%;bottom:12px;transform:translateX(-50%);z-index:6;width:min(96vw,820px);background:rgba(255,255,255,.94);border:3px solid #ffd23f;border-radius:16px;padding:6px 8px 8px;box-shadow:0 4px 0 rgba(0,0,0,.12);pointer-events:auto}
.dhtools,.dhcols,.dhparts{display:flex;flex-wrap:wrap;gap:5px;justify-content:center;margin:3px 0}
.dhb,.dhp{border:2px solid #ffe08a;background:#fff;border-radius:10px;padding:4px 8px;font:inherit;font-weight:900;font-size:14px;color:#1d2340;cursor:pointer;min-height:40px}
.dhp{display:flex;flex-direction:column;align-items:center;min-width:58px;line-height:1.1}
.dhp small{font-size:9px;color:#6b7290}
.dhb.on,.dhp.on{border-color:#2ec27e;background:#eafaf0;box-shadow:0 0 0 2px #2ec27e}
.dhc{width:22px;height:22px;border-radius:50%;border:2px solid #fff;box-shadow:0 0 0 2px #cfc4a8;cursor:pointer;padding:0}
.dhc.on{box-shadow:0 0 0 3px #1d2340}
@media (max-width:760px),(max-height:520px){.dhbar{bottom:max(8px,env(safe-area-inset-bottom));padding:4px}.dhb,.dhp{font-size:12px;min-height:36px;min-width:48px;padding:3px 5px}.touchui .dhbar{bottom:max(118px,calc(env(safe-area-inset-bottom) + 96px))}}
.dblane{position:absolute;left:50%;bottom:110px;""")
rep("  /* ---------- per-frame ---------- */\n", open('/workspace/rublox/tests/p47/dreamhouse.js').read() + "  /* ---------- per-frame ---------- */\n")
rep("ic = null; sb = null; hm = null; db = null;\n    if (mode === 'dance') buildDance();", "ic = null; sb = null; hm = null; db = null; dh = null;\n    if (mode === 'dreamhouse') buildDreamHouse(); else if (mode === 'dance') buildDance();")
rep("mode === 'haunt' || mode === 'dance') && B.onGround && up > 0 && up <= .62)", "mode === 'haunt' || mode === 'dance' || mode === 'dreamhouse') && B.onGround && up > 0 && up <= .62)")
rep("mode === 'haunt' || mode === 'dance'){ if (P.y < -25) respawn(); return; }", "mode === 'haunt' || mode === 'dance' || mode === 'dreamhouse'){ if (P.y < -25) respawn(); return; }")
rep("mode === 'haunt' || mode === 'dance'){ // pull the camera", "mode === 'haunt' || mode === 'dance' || mode === 'dreamhouse'){ // pull the camera")
rep("      if (db) danceUpdate(dt);\n", "      if (db) danceUpdate(dt);\n      if (dh) dreamhouseUpdate(dt);\n")
rep("    if (db) danceAnimate(dt);\n", "    if (db) danceAnimate(dt);\n    if (dh) dreamhouseAnimate(dt);\n")
rep("'icecream', 'stable', 'haunt', 'dance'].includes(m) ? m : 'obby'; diff = mode === 'race' || mode === 'splash' || mode === 'hide' || mode === 'fashion' || mode === 'autumn' || mode === 'petisland' || mode === 'bakery' || mode === 'waterpark' || mode === 'photostudio' || mode === 'tower' || mode === 'icecream' || mode === 'stable' || mode === 'haunt' || mode === 'dance' ? null : d;",
    "'icecream', 'stable', 'haunt', 'dance', 'dreamhouse'].includes(m) ? m : 'obby'; diff = mode === 'race' || mode === 'splash' || mode === 'hide' || mode === 'fashion' || mode === 'autumn' || mode === 'petisland' || mode === 'bakery' || mode === 'waterpark' || mode === 'photostudio' || mode === 'tower' || mode === 'icecream' || mode === 'stable' || mode === 'haunt' || mode === 'dance' || mode === 'dreamhouse' ? null : d;")
rep("    else if (mode === 'dance') banner(", "    else if (mode === 'dreamhouse') banner('🏡 Welcome to Dream House Builders — snap a home together on your plot!');\n    else if (mode === 'dance') banner(")
rep("mode === 'haunt' || mode === 'dance') $('#oTime').parentElement.style.display = 'none'; if ((mode === 'splash' || mode === 'hide' || mode === 'fashion' || mode === 'autumn' || mode === 'petisland' || mode === 'bakery' || mode === 'waterpark' || mode === 'photostudio' || mode === 'tower' || mode === 'icecream' || mode === 'stable' || mode === 'haunt' || mode === 'dance') && touchUI",
    "mode === 'haunt' || mode === 'dance' || mode === 'dreamhouse') $('#oTime').parentElement.style.display = 'none'; if ((mode === 'splash' || mode === 'hide' || mode === 'fashion' || mode === 'autumn' || mode === 'petisland' || mode === 'bakery' || mode === 'waterpark' || mode === 'photostudio' || mode === 'tower' || mode === 'icecream' || mode === 'stable' || mode === 'haunt' || mode === 'dance' || mode === 'dreamhouse') && touchUI")
rep("    $('#dbBox').style.display = mode === 'dance' ? '' : 'none'; if (mode !== 'dance'){ const L = $('#dbLane'); if (L) L.style.display = 'none'; }",
    """    $('#dhBox').style.display = mode === 'dreamhouse' ? '' : 'none';
    if (mode === 'dreamhouse'){ if ($('#dhBar')) $('#dhBar').style.display = ''; dreamhouseEnter(); }
    else { ['#dhBar','#dhAct'].forEach(id => { const el = $(id); if (el){ el.classList.remove('show'); if (id === '#dhBar') el.style.display = 'none'; } }); }
    $('#dbBox').style.display = mode === 'dance' ? '' : 'none'; if (mode !== 'dance'){ const L = $('#dbLane'); if (L) L.style.display = 'none'; }""")
rep(" if (db) danceStop();", " if (db) danceStop(); if (dh) dreamhouseStop();")
rep("    const line = mode === 'dance' ?", "    const line = mode === 'dreamhouse' ? '🎮 Left stick move · Ⓐ jump · Ⓧ place / like · Ⓑ rotate · ⓁⓇ catalog · ☰ menu' : mode === 'dance' ?")
rep("    if (mode === 'dance'){\n      $('#oTip').innerHTML", """    if (mode === 'dreamhouse'){
      $('#oTip').innerHTML = (on ? '🕹️ Left thumb moves · tap 🏡 buttons to place' : '⌨️ WASD move · Space jump · E place · R rotate · X delete · 1-9 catalog · C color · T story · Esc menu')
        + "<br>🏡 Snap floors, walls, doors, windows, roofs and furniture on your plot — finish house goals for 🪙!";
      return;
    }
    if (mode === 'dance'){
      $('#oTip').innerHTML""")
rep("    if (mode === 'dance' && db && dbPad(jp)) return;", "    if (mode === 'dreamhouse' && dh && dhPad(jp)) return;\n    if (mode === 'dance' && db && dbPad(jp)) return;")
rep("      if (mode === 'dance' && db && dbKey(e)) return;", "      if (mode === 'dreamhouse' && dh && dhKey(e)) return;\n      if (mode === 'dance' && db && dbKey(e)) return;")
rep("      if (running && fs && !fs.remote && mode === 'fashion') msg.fs = fashionWire();", "      if (running && fs && !fs.remote && mode === 'fashion') msg.fs = fashionWire();\n      if (running && dh && mode === 'dreamhouse') msg.dh = dhWire();")
rep("    if (d.fs) fashionFromHost(d.fs);", "    if (d.fs) fashionFromHost(d.fs);\n    if (d.dh) dhFromHost(d.dh);")
rep("    else if (d.t === 'bkact') bkGuestMsg(g, d);", "    else if (d.t === 'dhact') dhGuestMsg(g, d);\n    else if (d.t === 'bkact') bkGuestMsg(g, d);")
rep("  window.obbyDebug = {\n    dance:", """  window.obbyDebug = {
    dreamhouse: () => dh && {mine: dh.mine, sel: dh.sel, tool: dh.tool, story: dh.story, color: dh.color, rot: dh.rot, bank: dh.bank, likes: dh.likes, earned: dh.earned, pieces: (dh.pieces[dh.mine] || []).length, goals: Object.assign({}, dh.goals), prog: dhProg()},
    dhPlace: () => dhPlace(), dhAct: () => dhAct(), dhRotate: () => dhRotate(), dhCycle, dhSetTool, dhSetStory, dhCycleColor, dhAim, dhWire, dhTo(x, z){ Object.assign(P, {x, y: .05, z, vx: 0, vy: 0, vz: 0}); },
    dance:""")
