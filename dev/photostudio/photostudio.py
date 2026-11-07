# ===== t215u: 📸 Star Snaps Photo Studio — pose your own avatar, pick backdrops/framing, save & download photos on this device (stacked on Water Park) =====
rep("""  {id:'waterpark', name:'Splash Summit Water Park',""", """  {id:'photostudio', name:'Star Snaps Photo Studio', emoji:'📸', tag:'Strike a pose in your outfit and save photos on your device!', draw: drawPhotoStudio, playable: true, isNew: true},
  {id:'waterpark', name:'Splash Summit Water Park',""")
rep("function drawWaterPark(ctx){", r"""function drawPhotoStudio(ctx){
  sky(ctx, '#ffd6ec', '#fff0f8');
  ctx.fillStyle = '#f7d9ea'; ctx.fillRect(0, 150, 320, 50); ctx.fillStyle = '#fff'; ctx.fillRect(90, 140, 140, 18);
  const g = ctx.createLinearGradient(0, 20, 0, 140); g.addColorStop(0, '#7fd6ff'); g.addColorStop(1, '#ff6fb5'); ctx.fillStyle = g; ctx.fillRect(80, 20, 160, 122);
  ctx.font = '18px sans-serif'; ['⭐', '✨', '💖', '🌟'].forEach((e, i) => ctx.fillText(e, 92 + i * 38, 46 + (i % 2) * 20));
  guy(ctx, 160, 140, 12, '#ff6fb5'); ctx.fillStyle = '#1d2340'; ctx.fillRect(268, 120, 30, 20); ctx.fillRect(281, 140, 4, 30); ctx.fillStyle = '#fff6c9'; ctx.beginPath(); ctx.arc(292, 130, 5, 0, Math.PI * 2); ctx.fill();
  ctx.font = '22px sans-serif'; ctx.fillText('📸', 40, 80);
}
function drawWaterPark(ctx){""")
rep("""      <span id="wpBox" style="display:none">""", """      <span id="psBox" style="display:none"><b id="psN">📸 Photos</b></span>
      <span id="wpBox" style="display:none">""")
rep("""  <button class="fsnear wpnear" id="wpAct"></button>""", """  <div class="psflash" id="psFlash"></div>
  <button class="fsnear psnear" id="psCamBtn">📸 Use the camera<small>E / Ⓧ</small></button>
  <button class="fswardbtn psgbtn" id="psGalBtn">🖼️ My Photos</button>
  <div class="psbar" id="psBar">
    <button data-k="pose" data-d="-1">◀</button><button data-k="pose"><small>Pose</small><span id="psV_pose"></span></button><button data-k="pose" data-d="1">▶</button>
    <button data-k="bg"><small>Backdrop</small><span id="psV_bg"></span></button><button data-k="frame"><small>Framing</small><span id="psV_frame"></span></button>
    <button data-k="angle"><small>Camera</small><span id="psV_angle"></span></button><button data-k="shape"><small>Shape</small><span id="psV_shape"></span></button>
    <button data-k="border"><small>Border</small><span id="psV_border"></span></button>
    <button class="pssnap" id="psSnap">📸 Snap!</button><button class="psdone" id="psDone">✖ Done</button>
  </div>
  <div class="opanel" id="psGal"><div class="mbox rcbox">
    <span class="emoji">🖼️</span><h2>My Photos</h2><small class="psnote">🔒 Saved only on this device — never uploaded or shared. Download the ones you love!</small>
    <div id="psGList"></div>
    <div class="row"><button class="big gray" id="psGalClose">👋 Close</button><button class="big gray" id="psHome">🏠 Home</button></div>
  </div></div>
  <button class="fsnear wpnear" id="wpAct"></button>""")
rep(".wpnear{", """.psnear{background:#ff6fb5;box-shadow:0 4px 0 #c94f8d}.psnear small{display:block;font-size:12px}.psgbtn{background:#8b5cf6;box-shadow:0 4px 0 #5b34c0}
.psflash{position:absolute;inset:0;background:#fff;opacity:0;pointer-events:none;z-index:7}
.psbar{display:none;position:absolute;left:50%;bottom:10px;transform:translateX(-50%);z-index:6;flex-wrap:wrap;justify-content:center;gap:5px;max-width:96vw;background:rgba(29,35,64,.7);padding:6px;border-radius:16px}
.psbar.show{display:flex}.psbar button{border:0;border-radius:12px;padding:6px 9px;background:#fff;color:#1d2340;font:inherit;font-weight:800;font-size:14px;cursor:pointer;display:flex;flex-direction:column;align-items:center}
.psbar button small{font-size:10px;opacity:.7}.psbar .pssnap{background:#ff4d5e;color:#fff;font-size:18px;padding:8px 16px}.psbar .psdone{background:#9aa0ab;color:#fff}
.psgrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(96px,1fr));gap:6px;max-height:48vh;overflow:auto;margin:8px 0}.psth{border:3px solid #fff;border-radius:10px;padding:0;background:#eee;cursor:pointer}.psth img{width:100%;display:block;border-radius:7px}
.psbig{max-width:100%;max-height:52vh;display:block;margin:8px auto;border-radius:10px}.psnote{display:block;opacity:.8;font-weight:700}
@media (max-width:760px),(max-height:520px){#psGal .emoji{display:none}#psGal h2{font-size:18px;margin:0}.psbar button{font-size:12px;padding:4px 6px}.psbar .pssnap{font-size:15px}.psbig{max-height:42vh}}
.wpnear{""")
rep("  /* ---------- per-frame ---------- */\n", open(__import__('os').path.join(__import__('os').environ.get('PS_DIR', '/workspace/rublox/tests/p40'), 'photostudio.js')).read() + "  /* ---------- per-frame ---------- */\n")
rep("isl = null; bk = null; wp = null;\n    if (mode === 'waterpark') buildWaterPark();", "isl = null; bk = null; wp = null; psx = null;\n    if (mode === 'photostudio') buildPhotoStudio(); else if (mode === 'waterpark') buildWaterPark();")
rep("mode === 'bakery' || mode === 'waterpark') && B.onGround && up > 0 && up <= .62)", "mode === 'bakery' || mode === 'waterpark' || mode === 'photostudio') && B.onGround && up > 0 && up <= .62)")
rep("mode === 'bakery' || mode === 'waterpark'){ if (P.y < -25) respawn(); return; }", "mode === 'bakery' || mode === 'waterpark' || mode === 'photostudio'){ if (P.y < -25) respawn(); return; }")
rep("mode === 'bakery' || mode === 'waterpark'){ // pull the camera", "mode === 'bakery' || mode === 'waterpark' || mode === 'photostudio'){ // pull the camera")
rep("    if (fs && fashionCam()) return;\n", "    if (fs && fashionCam()) return;\n    if (psx && photoCam()) return;\n")
rep("      if (wp) waterparkUpdate(dt);\n", "      if (wp) waterparkUpdate(dt);\n      if (psx) photostudioUpdate(dt);\n")
rep("    if (wp) waterparkAnimate(dt);\n", "    if (wp) waterparkAnimate(dt);\n    if (psx) photostudioAnimate(dt);\n")
rep("    applyPose(dt, rc && rc.me ? rcPose(rc.me) :", "    applyPose(dt, psPosed() || (rc && rc.me ? rcPose(rc.me) :")
rep(" : animPose(avatar.anim || 'default', st));\n    if (pt && pt.drive){", " : animPose(avatar.anim || 'default', st)));\n    if (pt && pt.drive){")
rep("'bakery', 'waterpark'].includes(m) ? m : 'obby'; diff = mode === 'race' || mode === 'splash' || mode === 'hide' || mode === 'fashion' || mode === 'autumn' || mode === 'petisland' || mode === 'bakery' || mode === 'waterpark' ? null : d;",
    "'bakery', 'waterpark', 'photostudio'].includes(m) ? m : 'obby'; diff = mode === 'race' || mode === 'splash' || mode === 'hide' || mode === 'fashion' || mode === 'autumn' || mode === 'petisland' || mode === 'bakery' || mode === 'waterpark' || mode === 'photostudio' ? null : d;")
rep("    else if (mode === 'waterpark') banner(", "    else if (mode === 'photostudio') banner('📸 Welcome to Star Snaps! Wear your best outfit and stand on the ⭐ spot');\n    else if (mode === 'waterpark') banner(")
rep("mode === 'bakery' || mode === 'waterpark') $('#oTime').parentElement.style.display = 'none'; if ((mode === 'splash' || mode === 'hide' || mode === 'fashion' || mode === 'autumn' || mode === 'petisland' || mode === 'bakery' || mode === 'waterpark') && touchUI",
    "mode === 'bakery' || mode === 'waterpark' || mode === 'photostudio') $('#oTime').parentElement.style.display = 'none'; if ((mode === 'splash' || mode === 'hide' || mode === 'fashion' || mode === 'autumn' || mode === 'petisland' || mode === 'bakery' || mode === 'waterpark' || mode === 'photostudio') && touchUI")
rep("    $('#wpBox').style.display = mode === 'waterpark' ? '' : 'none';", """    $('#psBox').style.display = mode === 'photostudio' ? '' : 'none'; ['#psBar', '#psCamBtn', '#psGal', '#psGalBtn'].forEach(id => $(id).classList.remove('show'));
    if (mode === 'photostudio'){ if (!window.__psBound){ window.__psBound = true;
        $('#psCamBtn').onclick = () => psAct(); $('#psGalBtn').onclick = () => psx && psGalOpen(true); $('#psGalClose').onclick = () => psGalOpen(false); $('#psHome').onclick = () => { psGalOpen(false); stop(); };
        $('#psSnap').onclick = () => psSnap(); $('#psDone').onclick = () => psCamOn(false);
        document.querySelectorAll('#psBar [data-k]').forEach(b => b.onclick = () => psCycle(b.dataset.k, +(b.dataset.d || 1))); }
      $('#psGalBtn').classList.add('show'); photostudioEnter(); }
    $('#wpBox').style.display = mode === 'waterpark' ? '' : 'none';""")
rep(" if (wp) waterparkStop();", " if (wp) waterparkStop(); if (psx) photostudioStop();")
rep("    const line = mode === 'waterpark' ?", "    const line = mode === 'photostudio' ? '🎮 Ⓧ camera on ⭐ · Ⓐ snap · LB/RB pose · ✚◀▶ backdrop · ✚▲ framing · ✚▼ angle · Ⓧ border · LT/RT shape · Ⓨ photos · Ⓑ done' : mode === 'waterpark' ?")
rep("    if (mode === 'waterpark'){\n      $('#oTip').innerHTML", """    if (mode === 'photostudio'){
      $('#oTip').innerHTML = (on ? '🕹️ Walk to the ⭐ spot · tap 📸 Use the camera · tap the bar to change pose & backdrop' : '⌨️ E camera on ⭐ · Space snap · Q/E pose · B backdrop · F framing · C angle · T shape · K border · G photos · Esc done')
        + "<br>📸 Photos stay on this device only — download the ones you love!";
      return;
    }
    if (mode === 'waterpark'){
      $('#oTip').innerHTML""")
rep("    if (mode === 'waterpark' && wp && wpPad(jp)) return;", "    if (mode === 'photostudio' && psx && psPad(jp)) return;\n    if (mode === 'waterpark' && wp && wpPad(jp)) return;")
rep("      if (mode === 'waterpark' && wp && wpKey(e)) return;", "      if (mode === 'photostudio' && psx && psKey(e)) return;\n      if (mode === 'waterpark' && wp && wpKey(e)) return;")
rep("|| (wp && wp.menu)) ?", "|| (wp && wp.menu) || (psx && (psx.cam || psx.gal))) ?")
rep("wpPanel: '#wpClose',", "wpPanel: '#wpClose', psGal: '#psGalClose',")
rep("  window.obbyDebug = {\n", """  window.obbyDebug = {
    photo: () => psx && {s: Object.assign({}, psx.s), cam: psx.cam, count: psx.count, gal: psx.gal, near: psx.near, photos: psGallery().length, cp: psCamPos(psx.s, 0, .45, 0)},
    psCam: o => psCamOn(o), psSnap: () => psSnap(), psCap: () => psCapture(), psCycle: (k, d) => psCycle(k, d), psGal: o => psGalOpen(o),
""")
# Esc in camera mode / My Photos should step back out of the studio camera, not open the pause menu
rep("      if (e.code === 'Escape' || e.code === 'KeyP'){ if (e.code === 'Escape' && performance.now() - fp.unlockT < 400) return;", "      if (mode === 'photostudio' && psx && (psx.cam || psx.gal) && e.code === 'Escape' && !e.repeat && psKey(e)) return;\n      if (e.code === 'Escape' || e.code === 'KeyP'){ if (e.code === 'Escape' && performance.now() - fp.unlockT < 400) return;")
