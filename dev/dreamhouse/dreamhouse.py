# ===== t246u: 🏡 Dream House Builders — own plot, grid-snap walls/floors/roofs/furniture (stacked on Dance) =====
rep("""  {id:'dance', name:'Bossa Beat Dance Battle',""", """  {id:'dreamhouse', name:'Dream House Builders', emoji:'🏡', tag:'Re-build your house with bricks, paint, furniture and upgrades!', draw: drawDreamHouse, playable: true, isNew: true},
  {id:'dance', name:'Bossa Beat Dance Battle',""")
rep("function drawDance(ctx){", r"""function drawDreamHouse(ctx){
  sky(ctx, '#9fd8ff', '#fff6d8');
  ctx.fillStyle = '#8fd39a'; ctx.fillRect(0, 150, 320, 50);
  ctx.fillStyle = '#cfc4a8'; ctx.fillRect(0, 165, 320, 12);
  ctx.fillStyle = '#8d8f8c'; ctx.fillRect(108, 138, 104, 16);
  ctx.fillStyle = '#b54a32';
  for (let r = 0; r < 5; r++) for (let k = 0; k < 6; k++) ctx.fillRect(112 + k * 16 + (r % 2) * 8, 118 - r * 8, 14, 7);
  ctx.fillStyle = '#5c4038'; ctx.beginPath(); ctx.moveTo(100, 82); ctx.lineTo(160, 52); ctx.lineTo(220, 82); ctx.fill();
  ctx.fillStyle = '#5a4030'; ctx.fillRect(148, 108, 20, 30);
  ctx.fillStyle = '#bfe9ff'; ctx.fillRect(122, 110, 18, 16);
  guy(ctx, 70, 168, 11, '#ff6fb5');
  ctx.font = '18px sans-serif'; ctx.fillText('🧱', 40, 70); ctx.fillText('🪣', 250, 80);
}
function drawDance(ctx){""")
rep("""      <span id="dbBox" style="display:none">""", """      <span id="dhBox" style="display:none">🏡 <b id="dhN">🪙 0</b> · <b id="dhInv">no stock</b> · <b id="dhCarry">Hands empty</b> <b id="dhTool">📍</b></span>
      <span id="dbBox" style="display:none">""")
rep("""  <div class="dblane" id="dbLane" style="display:none"></div>""", """  <button class="fsnear dhnear" id="dhAct"></button>
  <div class="dhbar" id="dhBar" style="display:none"></div>
  <div class="dhcut" id="dhCut" style="display:none">
    <div class="dhfade" id="dhFade"></div>
    <div class="dhbubble" id="dhBubble" style="display:none"><b>Mom</b><span id="dhSay"></span></div>
    <button class="dhskip" id="dhSkip" type="button">Skip</button>
  </div>
  <div class="dhshop" id="dhShop" style="display:none"></div>
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
.dinv{display:flex;flex-wrap:wrap;gap:6px;justify-content:center;margin-top:4px}
.dhi{background:#fff8e8;border:2px solid #ffe08a;border-radius:10px;padding:2px 8px;font-weight:900;font-size:13px;color:#1d2340}
.dhi b{margin-left:3px}.dhi.on{border-color:#2ec27e;background:#eafaf0}
@media (max-width:760px),(max-height:520px){.dhbar{bottom:max(8px,env(safe-area-inset-bottom));padding:4px}.dhb,.dhp{font-size:12px;min-height:36px;min-width:48px;padding:3px 5px}.touchui .dhbar{bottom:max(118px,calc(env(safe-area-inset-bottom) + 96px))}}
.dhcut{position:absolute;inset:0;z-index:8;pointer-events:auto}
.dhfade{position:absolute;inset:0;background:#000;opacity:0;pointer-events:none}
.dhbubble{position:absolute;left:50%;top:16%;transform:translateX(-50%);background:#fffaf0;border:3px solid #1d2340;border-radius:22px;padding:12px 22px 16px;font-weight:900;color:#1d2340;box-shadow:0 6px 0 rgba(0,0,0,.15);max-width:min(90vw,460px);text-align:center;z-index:9}
.dhbubble b{display:block;color:#ff6fb5;font-size:13px;letter-spacing:.04em;margin-bottom:4px;text-transform:uppercase}
.dhbubble span{font-size:22px;line-height:1.25}
.dhbubble:after{content:'';position:absolute;left:62%;bottom:-16px;border:16px solid transparent;border-top-color:#1d2340;border-bottom:0}
.dhskip{position:absolute;right:max(16px,env(safe-area-inset-right));top:max(16px,env(safe-area-inset-top));z-index:10;background:#fff;border:3px solid #1d2340;border-radius:999px;padding:8px 18px;font:inherit;font-weight:900;color:#1d2340;cursor:pointer;box-shadow:0 4px 0 rgba(0,0,0,.12)}
.dhshop{position:absolute;inset:0;z-index:7;background:rgba(29,35,64,.4);display:flex;align-items:center;justify-content:center;pointer-events:auto}
.dhsbox{background:#fffaf0;border:3px solid #ffd23f;border-radius:20px;padding:14px 16px 16px;width:min(92vw,560px);max-height:min(84vh,640px);overflow:auto;box-shadow:0 8px 0 rgba(0,0,0,.12);color:#1d2340}
.dhsbox h3{margin:0 0 6px;font-size:22px}.dhsbox h4{margin:12px 0 6px;font-size:16px}.dhsbank{margin:0 0 8px;font-weight:900}
.dhsgrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:8px}
.dhsitem{border:2px solid #ffe08a;background:#fff;border-radius:14px;padding:8px 8px 10px;font:inherit;font-weight:900;color:#1d2340;cursor:pointer;text-align:left}
.dhsitem .dhe{font-size:22px;display:block}.dhsitem small{display:block;font-size:11px;color:#6b7290;font-weight:800;line-height:1.25;margin-top:2px}
.dhsitem.max{opacity:.65;cursor:default}#dhShopX{display:block;margin:14px auto 0;min-width:120px}
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
rep("    else if (mode === 'dance') banner(", "    else if (mode === 'dreamhouse') banner('🏡 Welcome to Dream House Builders — buy materials and build your house brick by brick!');\n    else if (mode === 'dance') banner(")
rep("mode === 'haunt' || mode === 'dance') $('#oTime').parentElement.style.display = 'none'; if ((mode === 'splash' || mode === 'hide' || mode === 'fashion' || mode === 'autumn' || mode === 'petisland' || mode === 'bakery' || mode === 'waterpark' || mode === 'photostudio' || mode === 'tower' || mode === 'icecream' || mode === 'stable' || mode === 'haunt' || mode === 'dance') && touchUI",
    "mode === 'haunt' || mode === 'dance' || mode === 'dreamhouse') $('#oTime').parentElement.style.display = 'none'; if ((mode === 'splash' || mode === 'hide' || mode === 'fashion' || mode === 'autumn' || mode === 'petisland' || mode === 'bakery' || mode === 'waterpark' || mode === 'photostudio' || mode === 'tower' || mode === 'icecream' || mode === 'stable' || mode === 'haunt' || mode === 'dance' || mode === 'dreamhouse') && touchUI")
rep("    $('#dbBox').style.display = mode === 'dance' ? '' : 'none'; if (mode !== 'dance'){ const L = $('#dbLane'); if (L) L.style.display = 'none'; }",
    """    $('#dhBox').style.display = mode === 'dreamhouse' ? '' : 'none';
    if (mode === 'dreamhouse'){ if ($('#dhBar')) $('#dhBar').style.display = ''; dreamhouseEnter(); }
    else { ['#dhBar','#dhAct','#dhCut','#dhShop'].forEach(id => { const el = $(id); if (el){ el.classList.remove('show'); el.style.display = 'none'; } }); const r = $('#dhReplay'); if (r) r.style.display = 'none'; }
    $('#dbBox').style.display = mode === 'dance' ? '' : 'none'; if (mode !== 'dance'){ const L = $('#dbLane'); if (L) L.style.display = 'none'; }""")
rep(" if (db) danceStop();", " if (db) danceStop(); if (dh) dreamhouseStop();")
rep("    const line = mode === 'dance' ?", "    const line = mode === 'dreamhouse' ? '🎮 Left stick move · Ⓐ jump · Ⓧ buy / carry / build · Ⓑ rotate · ⓁⓇ job · ☰ menu' : mode === 'dance' ?")
rep("    if (mode === 'dance'){\n      $('#oTip').innerHTML", """    if (mode === 'dreamhouse'){
      $('#oTip').innerHTML = (on ? '🕹️ Left thumb moves · tap 🏡 to buy, carry, mix and lay bricks' : '⌨️ WASD move · Space jump · E buy / carry / build · Q dump · R rotate · 1-9 job · Esc menu')
        + "<br>🏡 Re-build your house with bricks, concrete and wood, then paint and furnish it from the shop!";
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
