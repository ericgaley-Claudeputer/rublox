# ===== t207u feature 5 + t211u: Fashion Show 2.0 (lobby, walk-in dressing room, poses, star ratings, podium, levels) =====
rep("""  {id:'hide', name:'Hide and Seek', emoji:'🙈', tag:'Count, hide, seek! A whole town to hide in.', draw: drawHide, playable: true, isNew: true},""",
"""  {id:'fashion', name:'Fashion Show', emoji:'👗', tag:'Pastel prep room, Star VIP lounge, glam runway — fashion clothes stay in the show!', draw: drawFashion, playable: true, isNew: true},
  {id:'hide', name:'Hide and Seek', emoji:'🙈', tag:'Count, hide, seek! A whole town to hide in.', draw: drawHide, playable: true, isNew: true},""")
rep("function drawHide(ctx){", r"""function drawFashion(ctx){
  sky(ctx, '#b79cff', '#ffd6ec');
  ctx.fillStyle = '#8b5cf6'; ctx.fillRect(0, 0, 320, 70); ctx.fillStyle = '#ff6fb5'; ctx.fillRect(70, 14, 180, 26); ctx.fillStyle = '#fff'; ctx.font = '900 16px Nunito, sans-serif'; ctx.fillText('✨ FASHION SHOW ✨', 84, 33);
  [[40, 'rgba(255,111,181,.35)'], [160, 'rgba(58,198,255,.35)'], [280, 'rgba(255,210,63,.35)']].forEach(([x, c]) => { ctx.fillStyle = c; ctx.beginPath(); ctx.moveTo(x - 6, 0); ctx.lineTo(x + 6, 0); ctx.lineTo(x + 40, 200); ctx.lineTo(x - 40, 200); ctx.closePath(); ctx.fill(); });
  ctx.fillStyle = '#f3c6dd'; ctx.fillRect(0, 150, 320, 50);
  ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.moveTo(140, 80); ctx.lineTo(180, 80); ctx.lineTo(230, 200); ctx.lineTo(90, 200); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#ff6fb5'; ctx.beginPath(); ctx.moveTo(150, 112); ctx.lineTo(170, 112); ctx.lineTo(182, 150); ctx.lineTo(138, 150); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#ffdbac'; ctx.fillRect(150, 92, 20, 20); ctx.fillStyle = '#ffd23f'; ctx.fillRect(147, 86, 26, 8); ctx.fillStyle = '#1d1d1d'; ctx.fillRect(154, 100, 3, 3); ctx.fillRect(163, 100, 3, 3);
  ctx.fillStyle = '#ffdbac'; ctx.fillRect(149, 150, 6, 18); ctx.fillRect(165, 150, 6, 18);
  ctx.font = '22px sans-serif'; ctx.fillText('👑', 148, 86); ctx.fillText('⭐', 40, 120); ctx.fillText('⭐', 260, 112); ctx.fillText('⭐⭐⭐⭐⭐', 222, 190);
  guy(ctx, 40, 150, 12, '#3a86ff'); guy(ctx, 70, 156, 12, '#2ec27e'); guy(ctx, 250, 156, 12, '#ffd23f');
}
function drawHide(ctx){""")
rep("""      <span id="hsBox" style="display:none">""",
"""      <span id="fsBox" style="display:none"><b id="fsPh">👗 Fashion Show</b><span id="fsThB"></span> · ⏱️ <b id="fsT">0:00</b></span>
      <span id="hsBox" style="display:none">""")
rep("""  <div class="hsblind" id="hsBlind">""", """  <button class="fswardbtn" id="fsWardBtn">👗 Wardrobe</button>
  <button class="fswardbtn fsshow" id="fsShowBtn">✨ Show menu</button>
  <button class="fsnear" id="fsNear"></button>
  <div class="fsintro" id="fsIntro"><small>✨ THIS SHOW'S THEME IS... ✨</small><b id="fsIntroT"></b><span id="fsIntroH"></span></div>
  <div class="opanel" id="fsPick"><div class="mbox rcbox">
    <span class="emoji">👗</span><h2>Fashion Show</h2>
    <div id="fsLv"></div>
    <div class="stats" id="fsPickS"></div>
    <div class="stats hshelp">1️⃣ Get a surprise theme · 2️⃣ Style a look at the racks, salon & makeup stations · 3️⃣ Strike a pose on the runway · 4️⃣ Everyone rates 1-5 ⭐ · 🏆 Top 3 win coins!</div>
    <div class="fstimes" id="fsTimes"></div>
    <div class="owinbtns"><button class="big green" id="fsGo">▶ Start the show</button><button class="big blue" id="fsExplore">🚶 Explore the lobby</button><button class="big gray" id="fsHome">🏠 Home</button></div>
  </div></div>
  <div class="opanel" id="fsWard"><div class="mbox rcbox fsward">
    <div class="fshead"><b id="fsTheme"></b><span id="fsWardT"></span></div>
    <div class="stats fslikes" id="fsLikes"></div>
    <div class="fslayout">
      <div class="fsmirror" id="fsMirrorBox">
        <canvas id="fsMirror" width="220" height="320" aria-label="Mirror preview"></canvas>
        <small class="fsmirrorhint">⇆ drag / ←→ to turn</small>
      </div>
      <div class="fsbody">
        <div class="fstabs" id="fsTabs"></div>
        <div class="fsitems" id="fsItems"></div>
        <div class="stats fscount" id="fsCount"></div>
      </div>
    </div>
    <div class="owinbtns fsfoot"><button class="big green" id="fsReady">✅ I'm ready!</button><button class="big blue" id="fsKeepWard2">💾 Save for next show</button><button class="big blue" id="fsWardClose">👀 Look at me</button></div>
  </div></div>
  <div class="fsbar2" id="fsRate"><b id="fsRateN"></b><div class="fsstars" id="fsRateS"></div><small id="fsRateH"></small></div>
  <div class="fsbar2" id="fsPoses"><small id="fsPoseH"></small><div class="fsposes" id="fsPoseS"></div></div>
  <div class="opanel" id="fsEnd"><div class="mbox rcbox">
    <span class="emoji" id="fsEndE">👑</span><h2 id="fsEndT">Results</h2>
    <div class="fsress" id="fsEndS"></div>
    <div class="stats" id="fsEndC"></div>
    <div id="fsEndL"></div>
    <div class="stats" id="fsEndW" style="display:none">⏳ Waiting for the host to start the next show...</div>
    <div class="owinbtns"><button class="big green" id="fsAgain">🔁 Another show</button><button class="big blue" id="fsKeep">💾 Save for next show</button><button class="big blue" id="fsLobby">🏛️ Lobby</button><button class="big gray" id="fsHome2">🏠 Home</button></div>
  </div></div>
  <div class="hsblind" id="hsBlind">""")
rep(".smode #oStam{display:none!important}", """.smode #oStam{display:none!important}
.fsnotip #oTip{display:none!important}
.fswardbtn{display:none;position:absolute;right:14px;bottom:96px;z-index:6;border:0;border-radius:16px;padding:10px 16px;background:#ff6fb5;color:#fff;font:inherit;font-weight:900;font-size:17px;box-shadow:0 4px 0 #c94f8d;cursor:pointer}
.fswardbtn.show{display:block}.fsshow{background:#8b5cf6;box-shadow:0 4px 0 #5b34c0}
.fsnear{display:none;position:absolute;left:50%;bottom:120px;transform:translateX(-50%);z-index:6;border:3px solid #fff;border-radius:18px;padding:9px 18px;background:#8b5cf6;color:#fff;font:inherit;font-weight:900;font-size:18px;box-shadow:0 4px 0 #5b34c0;cursor:pointer;animation:fsbob 1s ease-in-out infinite alternate}
.fsnear.show{display:block}.fsnear small{background:#fff;color:#8b5cf6;border-radius:8px;padding:1px 6px;margin-left:6px}
@keyframes fsbob{to{transform:translateX(-50%) translateY(-5px)}}
.fsintro{display:none;position:absolute;left:50%;top:26%;transform:translateX(-50%);z-index:7;background:linear-gradient(135deg,#ff6fb5,#8b5cf6);color:#fff;border:4px solid #fff;border-radius:24px;padding:14px 30px;text-align:center;box-shadow:0 8px 30px rgba(0,0,0,.25);pointer-events:none}
.fsintro.show{display:flex;flex-direction:column;gap:4px}.fsintro b{font-size:40px;font-weight:900}.fsintro small{font-weight:900;letter-spacing:1px}.fsintro span{font-weight:800}
.fsintro.lock b{animation:fspop .5s ease-out}@keyframes fspop{0%{transform:scale(.6)}70%{transform:scale(1.15)}100%{transform:scale(1)}}
.fslv{background:#f6f3ff;border-radius:14px;padding:6px 10px;margin:4px 0;display:flex;flex-direction:column;gap:3px}.fslv b{font-size:16px}.fslv small{font-size:12px;font-weight:800;color:#666}
.fsbar{display:block;height:12px;background:#e3d6ff;border-radius:8px;overflow:hidden}.fsbar i{display:block;height:100%;background:linear-gradient(90deg,#ff6fb5,#8b5cf6);border-radius:8px}
.fslvup{background:#fff4c2;border-radius:12px;padding:6px 10px;margin:4px 0;font-weight:900}
.fstimes{display:flex;gap:6px;justify-content:center;align-items:center;flex-wrap:wrap;font-weight:900;margin:4px 0}
.fstm{border:2px solid #e3d6ff;background:#fff;border-radius:12px;padding:5px 12px;font:inherit;font-weight:900;cursor:pointer}.fstm.on{background:#8b5cf6;color:#fff;border-color:#8b5cf6}
.fsward{max-width:680px;width:94vw}.fshead{display:flex;justify-content:space-between;align-items:center;font-size:20px;gap:10px}.fshead span{font-weight:900;color:#ff4d5e}
/* wardrobe docks beside the avatar so you can see yourself while changing */
body.fsward-dock #fsWard{display:flex!important;align-items:stretch;justify-content:flex-start;background:transparent;pointer-events:none;padding:8px}
body.fsward-dock #fsWard .mbox.fsward{pointer-events:auto;max-width:min(760px,78vw);width:min(760px,78vw);margin:0;max-height:calc(100vh - 24px);overflow:hidden;box-shadow:0 10px 40px rgba(0,0,0,.28);display:flex;flex-direction:column}
.fslayout{display:flex;gap:10px;align-items:stretch;min-height:0;flex:1 1 auto;overflow:hidden}
.fsmirror{flex:0 0 230px;display:flex;flex-direction:column;align-items:center;justify-content:flex-start;gap:4px}
.fsmirror canvas{width:220px;height:320px;border-radius:18px;background:#f3d4ff;box-shadow:inset 0 0 0 3px #ffb3d9,0 4px 0 rgba(0,0,0,.08);touch-action:none;cursor:grab}
.fsmirrorhint{font-size:11px;font-weight:800;color:#8b5cf6}
.fsbody{flex:1;min-width:0;min-height:0;display:flex;flex-direction:column;overflow:hidden}
body.fsward-dock #fsWard .fsitems{flex:1 1 auto;min-height:0;max-height:none;overflow:auto}
/* footer is a real flex row inside the dock — never absolute / never overlays the list */
body.fsward-dock #fsWard .fsfoot,body.fsward-dock #fsWard .owinbtns.fsfoot{position:relative!important;flex:0 0 auto;flex-shrink:0;margin-top:8px;padding-top:6px;border-top:2px solid #f0e6ff;background:var(--card,#fff);z-index:2;display:flex;flex-wrap:wrap;gap:8px;justify-content:center}
.fslikes{font-size:13px;margin:2px 0 6px}.fscount{font-size:12px;margin:2px 0}
.fstabs{display:flex;gap:5px;justify-content:center;flex-wrap:wrap;margin-bottom:6px}
.fstab{border:2px solid #e3d6ff;background:#fff;border-radius:12px;padding:3px 8px;font:inherit;font-size:19px;cursor:pointer;display:flex;flex-direction:column;align-items:center;min-width:52px}.fstab small{font-size:10px;font-weight:800}
.fstab.on{background:#8b5cf6;color:#fff;border-color:#8b5cf6}
.fsitems{max-height:38vh;overflow:auto;padding:2px}
.fssub{font-size:12px;font-weight:900;color:#8b5cf6;margin:6px 0 3px;text-align:left}
.fsrow{display:flex;flex-wrap:wrap;align-items:center;gap:5px;margin:4px 0}.fsrow b{width:84px;text-align:left;font-size:13px}
.fssw{width:28px;height:28px;border-radius:50%;border:3px solid #fff;background:var(--c);box-shadow:0 0 0 1px #ccc;cursor:pointer}.fssw.on{box-shadow:0 0 0 3px #8b5cf6}
.fsgrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(82px,1fr));gap:6px}
.fsit{position:relative;border:2px solid #eee;background:#fff;border-radius:12px;padding:4px;font:inherit;cursor:pointer;display:flex;flex-direction:column;align-items:center}.fsit i{font-style:normal;font-size:22px}.fsit small{font-size:11px;font-weight:800;line-height:1.1}
.fsit u{position:absolute;top:1px;right:3px;text-decoration:none;font-size:11px}.fsit.on{border-color:#ff6fb5;background:#fff0f7}.fsit.lock{opacity:.6;background:#f2f2f2}.fsit.fsvip{border-color:#ffd23f;box-shadow:0 0 0 1px #ffd23f inset}.fsmb.fssave{background:#3a86ff;color:#fff;font-weight:900}#fsKeepWard2{flex:1 1 auto;min-width:140px}.fsvipb{margin:6px 0;padding:8px;border-radius:12px;background:linear-gradient(90deg,#5b34c0,#ff6fb5);color:#fff;font-weight:800;font-size:14px}.fsvipb small{opacity:.9;font-weight:700}.fsvipb .fsmb{margin-left:6px}
.fsmini{justify-content:center;margin-top:8px}.fsmb{border:0;border-radius:12px;padding:6px 12px;background:#ffd23f;font:inherit;font-weight:900;cursor:pointer;box-shadow:0 3px 0 #d4a900}
.fsbar2{display:none;position:absolute;left:50%;bottom:22px;transform:translateX(-50%);z-index:7;background:rgba(255,255,255,.95);border:3px solid #ff6fb5;border-radius:20px;padding:8px 16px;text-align:center;box-shadow:0 6px 20px rgba(0,0,0,.2);max-width:96vw}
.fsbar2.show{display:flex;flex-direction:column;align-items:center;gap:3px}.fsbar2 small{font-weight:800;color:#666}
.fsstars{display:flex;gap:6px}.fsstar{border:0;background:none;font-size:42px;line-height:1;color:#ddd;cursor:pointer;padding:0 2px;text-shadow:0 2px 0 #bbb}.fsstar.on{color:#ffc400;text-shadow:0 2px 0 #d48a00}
.fsposes{display:flex;gap:5px;flex-wrap:wrap;justify-content:center}.fspose{border:2px solid #eee;background:#fff;border-radius:12px;padding:3px 6px;font:inherit;font-size:22px;cursor:pointer;display:flex;flex-direction:column;align-items:center;min-width:62px}.fspose small{font-size:10px;font-weight:800}.fspose.on{border-color:#ff6fb5;background:#fff0f7}
.fsress{display:flex;flex-direction:column;gap:4px;margin:6px 0;max-height:30vh;overflow:auto}
.fsres{display:flex;align-items:center;gap:8px;background:#f6f3ff;border-radius:12px;padding:3px 10px}.fsres img{width:34px;height:44px;border-radius:6px}.fsres span{flex:1;text-align:left;font-weight:800}.fsres.win{background:#fff4c2}.fsres small{font-size:11px;color:#777}
@media (max-width:760px),(max-height:520px){#fsPick .emoji,#fsEnd .emoji{display:none}#fsPick h2,#fsEnd h2{font-size:18px;margin:0 0 2px}.fsitems{max-height:30vh}.fshead{font-size:15px}.fstab{font-size:15px;padding:2px 5px;min-width:42px}.fstab small{display:none}.fswardbtn{bottom:auto;top:64px;right:10px;font-size:14px;padding:7px 12px}.fsress{max-height:24vh}.fsintro b{font-size:28px}.fsstar{font-size:34px}.fspose{min-width:48px;font-size:18px}.fspose small{display:none}.fsnear{bottom:150px;font-size:15px}.hshelp{display:none}.fsgrid{grid-template-columns:repeat(auto-fill,minmax(68px,1fr))}
body.fsward-dock #fsWard{align-items:flex-end;justify-content:center;padding:0 6px 6px}
body.fsward-dock #fsWard .mbox.fsward{max-width:96vw;width:96vw;max-height:70vh;margin:0 auto;overflow:hidden;padding:12px 12px 10px}
.fslayout{flex-direction:column;gap:6px;flex:1 1 auto;min-height:0;overflow:hidden}
.fsmirror{flex:0 0 auto;width:100%}
.fsmirror canvas{width:100%;height:150px}
.fsbody{min-height:0;flex:1 1 auto}
body.fsward-dock #fsWard .fsitems{flex:1 1 auto;min-height:72px;max-height:none;overflow:auto}
body.fsward-dock #fsWard .fsfoot{position:relative!important;flex:0 0 auto;margin-top:6px;padding-top:6px}
body.fsward-dock #fsWard .fsfoot .big{font-size:14px;padding:8px 10px}}""")
rep("  /* ---------- per-frame ---------- */\n", open('/workspace/rublox/tests/p35/fashion.js').read() + "  /* ---------- per-frame ---------- */\n")
# engine hooks
rep("rc = null; dsp = null; hs = null;\n    if (mode === 'hide') buildHide();", "rc = null; dsp = null; hs = null; fs = null;\n    if (mode === 'fashion') buildFashion(); else if (mode === 'hide') buildHide();")
rep("    const inp = (hs && hsFrozen()) ?", "    const inp = ((hs && hsFrozen()) || (fs && fsFrozen())) ?")
rep("      if ((mode === 'tag' || mode === 'pets' || mode === 'hide' || mode === 'build') && B.onGround && up > 0 && up <= .62)", "      if ((mode === 'tag' || mode === 'pets' || mode === 'hide' || mode === 'build' || mode === 'fashion') && B.onGround && up > 0 && up <= .62)")
rep("    if (mode === 'build' || mode === 'tag' || mode === 'pets' || mode === 'hide'){ if (P.y < -25) respawn(); return; }", "    if (mode === 'build' || mode === 'tag' || mode === 'pets' || mode === 'hide' || mode === 'fashion'){ if (P.y < -25) respawn(); return; }")
rep("    if (mode === 'nds' || mode === 'build' || mode === 'tag' || mode === 'pets' || mode === 'hide'){ // pull the camera", "    if (mode === 'nds' || mode === 'build' || mode === 'tag' || mode === 'pets' || mode === 'hide' || mode === 'fashion'){ // pull the camera")
rep("    if (rc && raceCam()) return;\n", "    if (rc && raceCam()) return;\n    if (fs && fashionCam()) return;\n")
rep("      if (hs) hideUpdate(dt);\n", "      if (hs) hideUpdate(dt);\n      if (fs) fashionUpdate(dt);\n")
rep("    if (hs) hideAnimate(dt);\n", "    if (hs) hideAnimate(dt);\n    if (fs) fashionAnimate(dt);\n")
rep("    if (hs) hideHud();", "    if (hs) hideHud();\n    if (fs) fashionHud();")
rep("'race', 'splash', 'hide'].includes(m) ? m : 'obby'; diff = mode === 'race' || mode === 'splash' || mode === 'hide' ? null : d;", "'race', 'splash', 'hide', 'fashion'].includes(m) ? m : 'obby'; diff = mode === 'race' || mode === 'splash' || mode === 'hide' || mode === 'fashion' ? null : d;")
rep("    else if (mode === 'hide') banner('🙈 Hide and Seek on Maple Street!');", "    else if (mode === 'hide') banner('🙈 Hide and Seek on Maple Street!');\n    else if (mode === 'fashion') banner('👗 Welcome to the Fashion Show!');")
rep("    if (mode === 'splash' || mode === 'hide') $('#oTime').parentElement.style.display = 'none'; if ((mode === 'splash' || mode === 'hide') && touchUI && tipTimer > 4) tipTimer = 4;",
    "    if (mode === 'splash' || mode === 'hide' || mode === 'fashion') $('#oTime').parentElement.style.display = 'none'; if ((mode === 'splash' || mode === 'hide' || mode === 'fashion') && touchUI && tipTimer > 4) tipTimer = 4;")
rep("      hideEnter(); }\n    mpOnStart();", """      hideEnter(); }
    $('#fsBox').style.display = mode === 'fashion' ? '' : 'none'; ['#fsPick', '#fsEnd', '#fsWard', '#fsRate', '#fsPoses', '#fsIntro'].forEach(id => $(id).classList.remove('show')); ['#fsWardBtn', '#fsShowBtn', '#fsNear'].forEach(id => $(id).classList.remove('show')); document.body.classList.remove('fsnotip');
    if (mode === 'fashion'){ if (!window.__fsBound){ window.__fsBound = true;
        $('#fsHome').onclick = $('#fsHome2').onclick = stop; $('#fsGo').onclick = $('#fsAgain').onclick = () => fs && fsStart();
        $('#fsExplore').onclick = () => fsLobbyWalk(); $('#fsShowBtn').onclick = () => fs && fs.ph === 'lobby' && fsPickOpen(); $('#fsLobby').onclick = () => fsBackToLobby();
        $('#fsNear').onclick = () => fs && fs.near && fsWardOpen(fs.near);
        $('#fsReady').onclick = () => fsReadyBtn(); $('#fsWardClose').onclick = () => fsWardClose(); $('#fsWardBtn').onclick = () => fsWardOpen(fs && fs.near || null); $('#fsKeep').onclick = () => fsKeep(); $('#fsKeepWard2').onclick = () => fsKeep(); }
      fashionEnter(); }
    mpOnStart();""")
rep("raceStop(); splashStop(); if (hs) hideStop();", "raceStop(); splashStop(); if (hs) hideStop(); if (fs){ fashionStop(); if (model) fsRebuild(avatar); }")
rep("    if (p && mp.on && mp.host && mode === 'hide' && hs && (hs.ph === 'hide' || hs.ph === 'seek')){", "    if (p && mp.on && mp.host && mode === 'fashion' && fs && fs.ph !== 'lobby' && fs.ph !== 'end'){ banner('⏸️ No pausing during the show!'); return; }\n    if (p && mp.on && mp.host && mode === 'hide' && hs && (hs.ph === 'hide' || hs.ph === 'seek')){")
rep("      if (running && hs && !hs.remote && mode === 'hide') msg.hs = hideWire();", "      if (running && hs && !hs.remote && mode === 'hide') msg.hs = hideWire();\n      if (running && fs && !fs.remote && mode === 'fashion') msg.fs = fashionWire();")
rep("    if (d.hs) hideFromHost(d.hs);", "    if (d.hs) hideFromHost(d.hs);\n    if (d.fs) fashionFromHost(d.fs);")
rep("    else if (d.t === 'btfin'){", "    else if (d.t === 'fsfit' || d.t === 'fsready' || d.t === 'fspose' || d.t === 'fsrate') fsGuestMsg(g, d);\n    else if (d.t === 'btfin'){")
rep("hsPick: '#hsHome', hsEnd: '#hsHome2',", "hsPick: '#hsHome', hsEnd: '#hsHome2', fsPick: '#fsExplore', fsEnd: '#fsHome2', fsWard: '#fsWardClose',")
rep("    const line = mode === 'hide' ?", "    const line = mode === 'fashion' ? fsTipText().split('<br>')[0] : mode === 'hide' ?")
rep("    if (mode === 'hide'){\n      $('#oTip').innerHTML = (on ?", """    if (mode === 'fashion'){
      $('#oTip').innerHTML = fsTipText();
      if (fs) fsTip();
      return;
    }
    if (mode === 'hide'){
      $('#oTip').innerHTML = (on ?""")
# pad + keys
rep("    if (mode === 'splash' && dsp && (jp[5] || jp[2] || jp[4])){", "    if (mode === 'fashion' && fs && fsPad(jp)) return;\n    if (mode === 'splash' && dsp && (jp[5] || jp[2] || jp[4])){")
rep("      if (mode === 'build' && bw && !e.repeat && !paused){", "      if (mode === 'fashion' && fs && fsKey(e)) return;\n      if (mode === 'build' && bw && !e.repeat && !paused){")
# debug
rep("  window.obbyDebug = {\n", """  window.obbyDebug = {
    fashion: () => fs && {ph: fs.ph, n: fs.n, t: +fs.t.toFixed(2), wt: +fs.wt.toFixed(2), dl: fs.dl, th: fs.th, theme: FS_THEMES[fs.th].id, ord: fs.ord.slice(), ready: [...fs.ready], rates: JSON.parse(JSON.stringify(fs.rates)), rated: Object.assign({}, fs.rated), res: fs.res, pod: fs.pod.slice(), earned: fs.earned, ward: !!fs.ward, tab: fs.tab, near: fs.near, remote: !!fs.remote, lobPanel: !!fs.lobPanel,
      fit: fs.fit ? {hat: fs.fit.hat, shirt: fs.fit.shirt, pants: fs.fit.pants, shirtPat: fs.fit.shirtPat, pantsPat: fs.fit.pantsPat, hair: fs.fit.hair, hairColor: fs.fit.hairColor, head: fs.fit.head} : null, fx: fs.fx ? JSON.parse(JSON.stringify(fs.fx)) : null, fits: Object.keys(fs.fits), fxs: JSON.parse(JSON.stringify(fs.fxs)), poses: Object.assign({}, fs.poses), myPose: fs.myPose, cur: fsCur(),
      walkers: fs.walkers.filter(w => w.m.g.visible).map(w => w.u), judges: fs.judges.length, npc: Object.values(fs.npcM).filter(M => M.m.g.visible).length, frozen: fsFrozen(), P: {x: +P.x.toFixed(2), y: +P.y.toFixed(2), z: +P.z.toFixed(2)}, avHat: avatar.hat, avShirt: avatar.shirt,
      lvl: fsLevel(fsProg().xp), prog: fsProg(), xpGain: fs.xpGain || 0, lvBonus: fs.lvBonus || 0, tipHidden: document.body.classList.contains('fsnotip') || $('#oTip').classList.contains('hide'), notip: document.body.classList.contains('fsnotip'), kids: model ? model.g.children.length : 0},
    fsStart: () => fsStart(), fsTime(t){ fs.t = t; }, fsWt(t){ fs.wt = t; }, fsSet: (k, v) => fsSet(k, v), fsFx: (k, v) => fsFx(k, v), fsReady: () => fsReadyBtn(), fsRate: n => fsRate(n), fsPose: i => fsPose(i), fsTheme(i){ fs.forceTh = i; }, fsSetTime: s => fsSetTime(s),
    fsScore: (u) => fsScore(fs.fits[u], fs.fxs[u], fs.th), fsTab(t){ fs.tab = t; fsWardRender(); }, fsTo(x, z){ Object.assign(P, {x, z, vx: 0, vz: 0}); }, fsFace(a){ P.face = a; }, fsXp(n){ const p = fsProg(); p.xp = n; save('rubloxFashion', p); }, fsNear: () => fsNearest(), fsWalk: () => fsLobbyWalk(), fsLobby: () => fsBackToLobby(),
    fsDress(av, fx){ if (fs.ph !== 'dress') return; if (av) fs.fit = Object.assign({}, fs.fit, av); if (fx) fs.fx = fsCleanFx(Object.assign({}, fs.fx, fx)); fsRebuild(fs.fit, fs.fx); },
    fsBuildAll(){ let n = 0; Object.keys(FX).forEach(k => FX[k].forEach(([v]) => { const fx = fsCleanFx({[k]: k === 'acc' ? undefined : v, acc: k === 'acc' ? [v] : []}); const M = fsBuild(Object.assign({}, DEF), fx); n++; M.g.traverse(o => { if (o.geometry) o.geometry.dispose(); }); })); return n; },
""")
rep("    if (s.jp[2] && c.kind === 'emotes') return back(c);", "    if (s.jp[2] && c.kind === 'emotes') return back(c);\n    if (s.jp[2] && c.root && c.root.id === 'fsWard') return back(c);   // Ⓧ toggles the Fashion Show wardrobe")
# runway digits (poses 1-7 / stars 1-5) win over emote hotkeys while the show is on the runway
rep("      const em = Object.keys(EMOTES).find(", "      if (mode === 'fashion' && fs && fs.ph === 'walk' && /^Digit[1-7]$/.test(e.code) && fsKey(e)) return;\n      const em = Object.keys(EMOTES).find(")
