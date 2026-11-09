# ===== t227u: 💃 Bossa Beat Dance Battle — original procedural bossa rhythm (stacked on Haunt) =====
rep("""  {id:'haunt', name:'Giggle Manor Escape',""", """  {id:'dance', name:'Bossa Beat Dance Battle', emoji:'💃', tag:'Hit the arrows to original bossa beats — dance-off with friends!', draw: drawDance, playable: true, isNew: true},
  {id:'haunt', name:'Giggle Manor Escape',""")
rep("function drawHaunt(ctx){", r"""function drawDance(ctx){
  sky(ctx, '#1d2340', '#5b34c0');
  ctx.fillStyle = '#2b2d42'; ctx.fillRect(0, 150, 320, 50); ctx.fillStyle = '#ff6fb5'; ctx.fillRect(100, 130, 120, 30);
  ctx.font = '26px sans-serif'; ['←','↓','↑','→'].forEach((a, i) => { ctx.fillStyle = '#fff'; ctx.fillText(a, 70 + i * 50, 80); });
  guy(ctx, 160, 160, 12, '#ff6fb5'); ctx.font = '22px sans-serif'; ctx.fillText('💃', 40, 60); ctx.fillText('🎵', 260, 60);
}
function drawHaunt(ctx){""")
rep("""      <span id="hmBox" style="display:none">""", """      <span id="dbBox" style="display:none"><b id="dbN">💃 Dance</b></span>
      <span id="hmBox" style="display:none">""")
rep("""  <button class="fsnear hmnear" id="hmAct"></button>""", """  <div class="dblane" id="dbLane" style="display:none"></div>
  <button class="fsnear hmnear" id="hmAct"></button>""")
rep(".hmnear{background:#8b5cf6;box-shadow:0 4px 0 #5b34c0}.hmnear small{color:#8b5cf6}", """.dblane{position:absolute;left:50%;bottom:110px;transform:translateX(-50%);width:min(280px,70vw);height:42vh;z-index:6;pointer-events:none;display:flex;justify-content:center;background:linear-gradient(180deg,rgba(29,35,64,.1),rgba(29,35,64,.55));border:3px solid rgba(255,111,181,.5);border-radius:16px;overflow:hidden}
.dbhit{position:absolute;left:50%;bottom:10%;transform:translateX(-50%);font-size:22px;color:#ffd23f;text-shadow:0 2px 0 #000}
.dbnote{position:absolute;left:50%;transform:translateX(-50%);width:48px;height:48px;border-radius:12px;background:#fff;color:#1d2340;font-weight:900;font-size:28px;display:flex;align-items:center;justify-content:center;box-shadow:0 3px 0 rgba(0,0,0,.25)}
.dbnote.d0{margin-left:-72px;background:#7fd6ff}.dbnote.d1{margin-left:-24px;background:#9ff0c8}.dbnote.d2{margin-left:24px;background:#ffe08a}.dbnote.d3{margin-left:72px;background:#ffb3c7}
@media (max-width:760px),(max-height:520px){.dblane{height:36vh;bottom:150px}.dbnote{width:40px;height:40px;font-size:22px}}
.hmnear{background:#8b5cf6;box-shadow:0 4px 0 #5b34c0}.hmnear small{color:#8b5cf6}""")
rep("  /* ---------- per-frame ---------- */\n", open('/workspace/rublox/tests/p46/dance.js').read() + "  /* ---------- per-frame ---------- */\n")
rep("isl = null; bk = null; wp = null; psx = null; td = null; ic = null; sb = null; hm = null;\n    if (mode === 'haunt') buildHaunt();", "isl = null; bk = null; wp = null; psx = null; td = null; ic = null; sb = null; hm = null; db = null;\n    if (mode === 'dance') buildDance(); else if (mode === 'haunt') buildHaunt();")
rep("mode === 'tower' || mode === 'icecream' || mode === 'stable' || mode === 'haunt') && B.onGround && up > 0 && up <= .62)", "mode === 'tower' || mode === 'icecream' || mode === 'stable' || mode === 'haunt' || mode === 'dance') && B.onGround && up > 0 && up <= .62)")
rep("mode === 'tower' || mode === 'icecream' || mode === 'stable' || mode === 'haunt'){ if (P.y < -25) respawn(); return; }", "mode === 'tower' || mode === 'icecream' || mode === 'stable' || mode === 'haunt' || mode === 'dance'){ if (P.y < -25) respawn(); return; }")
rep("mode === 'tower' || mode === 'icecream' || mode === 'stable' || mode === 'haunt'){ // pull the camera", "mode === 'tower' || mode === 'icecream' || mode === 'stable' || mode === 'haunt' || mode === 'dance'){ // pull the camera")
rep("      if (hm) hauntUpdate(dt);\n", "      if (hm) hauntUpdate(dt);\n      if (db) danceUpdate(dt);\n")
rep("    if (hm) hauntAnimate(dt);\n", "    if (hm) hauntAnimate(dt);\n    if (db) danceAnimate(dt);\n")
# dance pose hook into applyPose chain (photostudio style)
rep("    applyPose(dt, psPosed() || (rc && rc.me ? rcPose(rc.me) :", "    applyPose(dt, (db && dbPose()) || psPosed() || (rc && rc.me ? rcPose(rc.me) :")
rep("'tower', 'icecream', 'stable', 'haunt'].includes(m) ? m : 'obby'; diff = mode === 'race' || mode === 'splash' || mode === 'hide' || mode === 'fashion' || mode === 'autumn' || mode === 'petisland' || mode === 'bakery' || mode === 'waterpark' || mode === 'photostudio' || mode === 'tower' || mode === 'icecream' || mode === 'stable' || mode === 'haunt' ? null : d;",
    "'tower', 'icecream', 'stable', 'haunt', 'dance'].includes(m) ? m : 'obby'; diff = mode === 'race' || mode === 'splash' || mode === 'hide' || mode === 'fashion' || mode === 'autumn' || mode === 'petisland' || mode === 'bakery' || mode === 'waterpark' || mode === 'photostudio' || mode === 'tower' || mode === 'icecream' || mode === 'stable' || mode === 'haunt' || mode === 'dance' ? null : d;")
rep("    else if (mode === 'haunt') banner(", "    else if (mode === 'dance') banner('💃 Bossa Beat Dance Battle — feel the groove!');\n    else if (mode === 'haunt') banner(")
rep("mode === 'tower' || mode === 'icecream' || mode === 'stable' || mode === 'haunt') $('#oTime').parentElement.style.display = 'none'; if ((mode === 'splash' || mode === 'hide' || mode === 'fashion' || mode === 'autumn' || mode === 'petisland' || mode === 'bakery' || mode === 'waterpark' || mode === 'photostudio' || mode === 'tower' || mode === 'icecream' || mode === 'stable' || mode === 'haunt') && touchUI",
    "mode === 'tower' || mode === 'icecream' || mode === 'stable' || mode === 'haunt' || mode === 'dance') $('#oTime').parentElement.style.display = 'none'; if ((mode === 'splash' || mode === 'hide' || mode === 'fashion' || mode === 'autumn' || mode === 'petisland' || mode === 'bakery' || mode === 'waterpark' || mode === 'photostudio' || mode === 'tower' || mode === 'icecream' || mode === 'stable' || mode === 'haunt' || mode === 'dance') && touchUI")
rep("    $('#hmBox').style.display = mode === 'haunt' ? '' : 'none'; ['#hmAct'].forEach(id => $(id).classList.remove('show'));",
    """    $('#dbBox').style.display = mode === 'dance' ? '' : 'none'; if (mode !== 'dance'){ const L = $('#dbLane'); if (L) L.style.display = 'none'; }
    if (mode === 'dance') danceEnter();
    $('#hmBox').style.display = mode === 'haunt' ? '' : 'none'; ['#hmAct'].forEach(id => $(id).classList.remove('show'));""")
rep(" if (hm) hauntStop();", " if (hm) hauntStop(); if (db) danceStop();")
rep("    const line = mode === 'haunt' ?", "    const line = mode === 'dance' ? '🎮 ✚ d-pad / face buttons hit arrows · ☰ menu' : mode === 'haunt' ?")
rep("    if (mode === 'haunt'){\n      $('#oTip').innerHTML", """    if (mode === 'dance'){
      $('#oTip').innerHTML = (on ? '🕹️ D-pad / face buttons hit ←↓↑→' : '⌨️ Arrow keys or WASD hit the notes · Esc pause')
        + "<br>💃 Original bossa beats — time your presses for Perfect scores!";
      return;
    }
    if (mode === 'haunt'){
      $('#oTip').innerHTML""")
rep("    if (mode === 'haunt' && hm && hmPad(jp)) return;", "    if (mode === 'dance' && db && dbPad(jp)) return;\n    if (mode === 'haunt' && hm && hmPad(jp)) return;")
rep("      if (mode === 'haunt' && hm && hmKey(e)) return;", "      if (mode === 'dance' && db && dbKey(e)) return;\n      if (mode === 'haunt' && hm && hmKey(e)) return;")
# swallow movement keys while dancing so WASD hits notes
rep("|| (psx && (psx.cam || psx.gal)) || (ic && ic.panel >= 0) || (sb && sb.panel)) ?", "|| (psx && (psx.cam || psx.gal)) || (ic && ic.panel >= 0) || (sb && sb.panel) || (db && db.ph === 'play')) ?")
rep("  window.obbyDebug = {\n", """  window.obbyDebug = {
    dance: () => db && {ph: db.ph, t: db.t, score: db.score, combo: db.combo, hits: db.hits, misses: db.misses, chart: db.chart.length, earned: db.earned, prog: dbProg()},
    dbHit: d => dbHit(d), dbTo(t){ if (db) db.t = t; },
""")

# ----- browser retest fixes: ice cream panel CSS + stable sit pose + camera floor -----
rep(".icbox{max-width:min(96vw,720px)}",
    """.icbox{max-width:min(92vw,640px)!important;width:min(92vw,640px)}
#icPanel .mbox{max-width:min(92vw,640px);width:min(92vw,640px);overflow:visible}
#icItems{max-height:none!important;overflow:visible!important;display:block!important;width:100%}
.icgrid{display:grid!important;grid-template-columns:repeat(auto-fill,minmax(130px,1fr));gap:8px;width:100%;margin:6px 0 10px}
.icb{border:2px solid #cfefff;background:#fff;border-radius:12px;padding:8px 6px;font:inherit;font-size:18px;min-width:0;min-height:64px;cursor:pointer;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;width:100%;white-space:normal}
.icb .icbe{font-size:26px;line-height:1}
.icb small{font-size:12px;font-weight:800;text-align:center;white-space:normal;overflow:visible;text-overflow:clip;line-height:1.15;max-width:100%;display:block;word-break:break-word}
.icb.on{border-color:#7fd6ff;background:#e8f7ff;box-shadow:0 0 0 2px #7fd6ff}.icb:disabled{opacity:.4;cursor:default}
#icPanel h2{font-size:22px}
@media (max-width:760px),(max-height:520px){.icgrid{grid-template-columns:repeat(auto-fill,minmax(110px,1fr));gap:6px}.icb{min-height:56px;font-size:16px}.icb small{font-size:11px}}""")
# sit pose when mounted (before dance pose)
rep("    applyPose(dt, (db && dbPose()) || psPosed() || (rc && rc.me ? rcPose(rc.me) :",
    "    applyPose(dt, (sb && sbPose()) || (db && dbPose()) || psPosed() || (rc && rc.me ? rcPose(rc.me) :")
# stronger camera floor for stables
rep("dist = Math.max(mode === 'stable' ? 5.5 : 1.2, s - .5);",
    "dist = Math.max(mode === 'stable' ? 8.5 : 1.2, s - .5);")
# longer, more visible banner animation while we're here
rep(".obanner{position:absolute;top:22%;left:50%;transform:translate(-50%,-50%) scale(.5);opacity:0;font-size:34px;font-weight:900;color:#fff;text-shadow:3px 3px 0 #1f9460,0 0 18px rgba(0,0,0,.25);pointer-events:none;white-space:nowrap}",
    ".obanner{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%) scale(.5);opacity:0;font-size:clamp(22px,4.5vw,36px);font-weight:900;color:#fff;text-shadow:3px 3px 0 #1f9460,0 0 18px rgba(0,0,0,.35);pointer-events:none;white-space:pre-line;text-align:center;max-width:90vw;z-index:12}")



# ----- polish pass: ice cream wizard CSS + toast; camera skips fence -----
rep("if (solids.some(b => b.active && b.mesh.visible && Math.abs(x - b.mesh.position.x) < b.hw + .2 && Math.abs(y - b.mesh.position.y) < b.hh + .2 && Math.abs(z - b.mesh.position.z) < b.hd + .2 && !(b.mesh.material && b.mesh.material.transparent))){ dist = Math.max(mode === 'stable' ? 8.5 : 1.2, s - .5); break; }",
    "if (solids.some(b => b.active && !b.camSkip && b.mesh.visible && Math.abs(x - b.mesh.position.x) < b.hw + .2 && Math.abs(y - b.mesh.position.y) < b.hh + .2 && Math.abs(z - b.mesh.position.z) < b.hd + .2 && !(b.mesh.material && b.mesh.material.transparent))){ dist = Math.max(mode === 'stable' ? 9 : mode === 'haunt' ? 7.5 : 1.2, s - .5); break; }")
# Final ice-cream panel CSS (must win over earlier .mbox 420px and old #icItems grid)
rep(".icbox{max-width:min(92vw,640px)!important;width:min(92vw,640px)}",
    """.ictoast{display:none;position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);z-index:20;pointer-events:none;min-width:min(90vw,420px);max-width:92vw;padding:22px 28px;border-radius:22px;background:rgba(29,35,64,.92);color:#fff;font-weight:900;font-size:clamp(28px,5vw,44px);line-height:1.25;text-align:center;box-shadow:0 10px 0 rgba(0,0,0,.25),0 0 30px rgba(255,111,181,.45);border:4px solid #ff6fb5}
.ictoast.show{display:block;animation:icpop 2.5s ease forwards}
@keyframes icpop{0%{opacity:0;transform:translate(-50%,-50%) scale(.6)}12%{opacity:1;transform:translate(-50%,-50%) scale(1.05)}75%{opacity:1;transform:translate(-50%,-50%) scale(1)}100%{opacity:0;transform:translate(-50%,-50%) scale(.9)}}
#icPanel.show{display:grid!important}
#icPanel .mbox.icbox,#icPanel .icbox{max-width:min(92vw,720px)!important;width:min(92vw,720px)!important;padding:18px 16px 16px!important;text-align:left!important;overflow:visible!important;box-sizing:border-box}
#icItems{display:block!important;width:100%!important;max-width:100%!important;max-height:none!important;overflow:visible!important;background:transparent!important;padding:0!important}
.icstep{margin:0 0 8px;font-size:18px;font-weight:900;color:#5b34c0}
.icstat{margin:0 0 10px;font-size:15px;font-weight:800;color:#1d2340;background:#f3e8ff;border-radius:10px;padding:8px 10px}
.icgrid{display:grid!important;grid-template-columns:repeat(auto-fill,minmax(140px,1fr))!important;gap:10px!important;width:100%!important;margin:0 0 8px;box-sizing:border-box}
.icb{border:2px solid #cfefff!important;background:#fff!important;border-radius:14px!important;padding:10px 8px!important;font:inherit!important;font-size:17px!important;min-width:0!important;min-height:72px!important;height:auto!important;cursor:pointer;display:flex!important;flex-direction:column!important;align-items:center;justify-content:center;gap:4px;width:100%!important;max-width:100%!important;white-space:normal!important;box-sizing:border-box}
.icb .icbe{font-size:28px;line-height:1}
.icb small{font-size:15px!important;font-weight:800!important;text-align:center;white-space:normal!important;overflow:visible!important;text-overflow:clip!important;line-height:1.2;max-width:100%;display:block;word-break:break-word}
.icb.on{border-color:#7fd6ff!important;background:#e8f7ff!important;box-shadow:0 0 0 2px #7fd6ff}
#icPanel .row{flex-wrap:wrap;gap:8px;margin-top:10px}
@media (max-width:760px),(max-height:520px){
  #icPanel .mbox.icbox{width:min(96vw,720px)!important;padding:12px 10px!important}
  .icgrid{grid-template-columns:repeat(auto-fill,minmax(120px,1fr))!important;gap:8px!important}
  .icb{min-height:64px!important;font-size:15px!important}
  .icb small{font-size:14px!important}
  .ictoast{font-size:clamp(22px,6vw,34px);padding:16px 18px}
}
.icbox{max-width:min(92vw,720px)!important;width:min(92vw,720px)!important}""")

# KILL88: remove the late override that forces #icItems into a narrow column grid
rep(".icbox .fsitems,#icItems{display:grid!important;grid-template-columns:repeat(auto-fill,minmax(88px,1fr));gap:6px;width:100%;max-width:min(96vw,680px)}\n.icb{border:2px solid #cfefff;background:#fff;border-radius:12px;padding:4px 8px;font:inherit;font-size:20px;min-width:0;min-height:48px;cursor:pointer;display:flex;flex-direction:column;align-items:center;width:100%}",
    "/* ice cream: wizard uses .icgrid only — do not grid #icItems */\n#icItems{display:block!important;width:100%!important;max-width:none!important;background:transparent!important}\n.icb{border:2px solid #cfefff;background:#fff;border-radius:14px;padding:10px 8px;font:inherit;font-size:17px;min-width:0;min-height:72px;cursor:pointer;display:flex;flex-direction:column;align-items:center;width:100%;white-space:normal;box-sizing:border-box}")
