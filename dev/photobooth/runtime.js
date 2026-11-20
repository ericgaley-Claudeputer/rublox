
  /* ---------- Avatar Photo Booth (reuses rubloxPhotos) ---------- */
  let pb = {shot: null, last: null, webgl: null};
  function pbHasWebgl(){
    if (pb.webgl != null) return pb.webgl;
    try {
      const c = document.createElement('canvas');
      pb.webgl = !!(c.getContext('webgl') || c.getContext('webgl2') || c.getContext('experimental-webgl'));
    } catch (e){ pb.webgl = false; }
    return pb.webgl;
  }
  function pbGalleryStore(){
    try {
      if (typeof load === 'function') return PhotoBoothRules.pbGallery(load(PhotoBoothRules.PB_KEY, []));
    } catch (e){}
    try { return PhotoBoothRules.pbGallery(JSON.parse(localStorage.getItem(PhotoBoothRules.PB_KEY) || '[]')); } catch (e){ return []; }
  }
  function pbPersist(g){
    try { if (typeof save === 'function') save(PhotoBoothRules.PB_KEY, g); else localStorage.setItem(PhotoBoothRules.PB_KEY, JSON.stringify(g)); } catch (e){}
  }
  function pbOpen(){
    const box = document.getElementById('avBooth');
    if (!box) return;
    if (!pb.shot) pb.shot = PhotoBoothRules.pbFreshShot();
    box.hidden = false;
    pbPaintChrome();
    pbPaint();
  }
  function pbClose(){ const box = document.getElementById('avBooth'); if (box) box.hidden = true; }
  function pbPaintChrome(){
    const R = PhotoBoothRules, s = pb.shot || R.pbFreshShot();
    function row(id, items, key, labelFn){
      const el = document.getElementById(id); if (!el) return;
      el.innerHTML = '';
      items.forEach(it => {
        const b = document.createElement('button');
        b.type = 'button';
        b.textContent = labelFn(it);
        if (s[key] === it.id || (key === 'sticker' && (s.stickers||[]).indexOf(it.id)>=0)) b.classList.add('on');
        b.onclick = () => {
          if (key === 'sticker') pb.shot = R.pbToggleSticker(s, it.id);
          else { s[key] = it.id; pb.shot = R.pbCleanShot(s); }
          pbPaintChrome(); pbPaint();
        };
        el.appendChild(b);
      });
    }
    row('avBoothPoses', R.PB_POSES, 'pose', it => it.emoji + ' ' + it.name);
    row('avBoothBgs', R.PB_BGS, 'bg', it => it.name);
    row('avBoothFrames', R.PB_FRAMES, 'frame', it => it.name);
    row('avBoothStickers', R.PB_STICKERS, 'sticker', it => it.emoji + ' ' + it.name);
  }
  function pbAv(){
    try { if (typeof draft !== 'undefined' && draft) return draft; } catch(e){}
    try { if (typeof avatar !== 'undefined' && avatar) return avatar; } catch(e){}
    return {};
  }
  function pbPaint(){
    const cv = document.getElementById('avBoothCv'); if (!cv) return;
    const ctx = cv.getContext('2d');
    const lay = PhotoBoothRules.pbLayout(pb.shot, cv.width, cv.height);
    const grd = ctx.createLinearGradient(0,0,0,cv.height);
    grd.addColorStop(0, lay.bg.color); grd.addColorStop(1, lay.bg.alt || lay.bg.color);
    ctx.fillStyle = grd; ctx.fillRect(0,0,cv.width,cv.height);
    const pad = lay.pad || 0;
    // 2D fallback is always used in the editor booth (works with or without WebGL)
    ctx.save();
    ctx.beginPath();
    ctx.rect(pad, pad, cv.width - pad*2, cv.height - pad*2);
    ctx.clip();
    ctx.translate(lay.poseShift.x, lay.poseShift.y);
    if (lay.poseShift.scale && lay.poseShift.scale !== 1){
      ctx.translate(cv.width/2, cv.height/2);
      ctx.scale(lay.poseShift.scale, lay.poseShift.scale);
      ctx.translate(-cv.width/2, -cv.height/2);
    }
    try { if (typeof drawAvatar === 'function') drawAvatar(ctx, pbAv(), {}); } catch (e){}
    ctx.restore();
    if (lay.frame && lay.frame.color && pad){
      ctx.strokeStyle = lay.frame.color;
      ctx.lineWidth = pad;
      ctx.strokeRect(pad/2, pad/2, cv.width-pad, cv.height-pad);
    }
    ctx.font = Math.round(cv.width * 0.08) + 'px sans-serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    (lay.stickers||[]).forEach(st => {
      ctx.fillText(st.emoji, st.x * cv.width, st.y * cv.height);
    });
    pb.last = cv;
    // note fallback: PhotoBoothRules.pbNeed2dFallback(!pbHasWebgl()) is true without WebGL; we already drew 2D
  }
  function pbSnap(){
    const cv = document.getElementById('avBoothCv'); if (!cv) return;
    pbPaint();
    let data = '';
    try { data = cv.toDataURL('image/png'); } catch (e){ data = ''; }
    if (!PhotoBoothRules.pbIsPhotoData(data)){
      try { if (typeof toast === 'function') toast('Could not save this photo.'); } catch(e){}
      return;
    }
    const stored = PhotoBoothRules.pbStore(pbGalleryStore(), {
      t: Date.now(), d: data, bg: pb.shot && pb.shot.bg, pose: pb.shot && pb.shot.pose, source: 'booth', id: String(Date.now())
    });
    if (stored.ok) pbPersist(stored.gallery);
    try {
      if (typeof banner === 'function') banner('📸 Snap! Saved on this device (' + stored.count + '/' + PhotoBoothRules.PB_MAX + '). Tap 🖼️ to see or download it.');
      else if (typeof toast === 'function') toast('📸 Saved to your photo gallery!');
    } catch(e){}
    pb.lastData = data;
  }
  function pbDownload(){
    const data = pb.lastData || (document.getElementById('avBoothCv') && document.getElementById('avBoothCv').toDataURL('image/png'));
    if (!data){ pbSnap(); return; }
    const a = document.createElement('a');
    a.href = data; a.download = 'rublox-photo.png';
    document.body.appendChild(a); a.click(); a.remove();
  }
  function pbShowGal(){
    const box = document.getElementById('avBoothGallery'); if (!box) return;
    const g = pbGalleryStore();
    box.hidden = false;
    box.innerHTML = g.length ? '' : '<div>No photos yet — take a snap!</div>';
    g.slice().reverse().forEach(p => {
      const img = document.createElement('img');
      img.src = p.d; img.alt = 'Saved photo';
      img.onclick = () => { pb.lastData = p.d; pbDownload(); };
      box.appendChild(img);
    });
  }
  function pbBind(){
    const open = document.getElementById('avBoothBtn');
    const hub = document.getElementById('hubBoothBtn');
    const close = document.getElementById('avBoothX');
    const snap = document.getElementById('avBoothSnap');
    const dl = document.getElementById('avBoothDl');
    const gal = document.getElementById('avBoothGal');
    if (open && !open._pb){ open._pb = true; open.addEventListener('click', ev => { ev.preventDefault(); pbOpen(); }); }
    if (hub && !hub._pb){ hub._pb = true; hub.addEventListener('click', ev => { ev.preventDefault(); pbOpen(); }); }
    if (close && !close._pb){ close._pb = true; close.addEventListener('click', ev => { ev.preventDefault(); pbClose(); }); }
    if (snap && !snap._pb){ snap._pb = true; snap.addEventListener('click', ev => { ev.preventDefault(); pbSnap(); }); }
    if (dl && !dl._pb){ dl._pb = true; dl.addEventListener('click', ev => { ev.preventDefault(); pbDownload(); }); }
    if (gal && !gal._pb){ gal._pb = true; gal.addEventListener('click', ev => { ev.preventDefault(); pbShowGal(); }); }
  }
  if (typeof document !== 'undefined'){
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', pbBind);
    else pbBind();
  }
