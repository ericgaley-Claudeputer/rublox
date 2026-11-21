
  /* ---------- Avatar Photo Booth (reuses rubloxPhotos) ---------- */
  let pb = {shot: null, last: null, lastData: null, webgl: null, focus: 0, _keys: false};
  function pbBox(){ return document.getElementById('avBooth'); }
  function pbIsOpen(){ const box = pbBox(); return !!(box && !box.hidden); }
  function pbMount(){
    const box = pbBox();
    if (box && document.body && box.parentElement !== document.body) document.body.appendChild(box);
    return box;
  }
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
  function pbButtons(){
    const box = pbBox(); if (!box || box.hidden) return [];
    return Array.prototype.slice.call(box.querySelectorAll('button')).filter(b => b && !b.disabled && !b.hidden);
  }
  function pbFocusAt(i){
    const list = pbButtons(); if (!list.length) return;
    pb.focus = ((i % list.length) + list.length) % list.length;
    try { list[pb.focus].focus({preventScroll: true}); } catch (e){ try { list[pb.focus].focus(); } catch (e2){} }
    try { list[pb.focus].scrollIntoView({block: 'nearest', inline: 'nearest'}); } catch (e){}
  }
  function pbOpen(){
    const box = pbMount();
    if (!box) return;
    if (!pb.shot) pb.shot = PhotoBoothRules.pbFreshShot();
    box.hidden = false;
    try { box.removeAttribute('hidden'); } catch (e){}
    pbBind();
    pbPaintChrome();
    pbPaint();
    pbFocusAt(0);
  }
  function pbClose(){
    const box = pbBox();
    if (box){ box.hidden = true; try { box.setAttribute('hidden', ''); } catch (e){} }
  }
  function pbOnChrome(key, id){
    const R = PhotoBoothRules, s = pb.shot || R.pbFreshShot();
    if (key === 'sticker') pb.shot = R.pbToggleSticker(s, id);
    else { s[key] = id; pb.shot = R.pbCleanShot(s); }
    pbPaintChrome(); pbPaint();
  }
  function pbPaintChrome(){
    const R = PhotoBoothRules, s = pb.shot || R.pbFreshShot();
    function row(id, items, key, labelFn){
      const el = document.getElementById(id); if (!el) return;
      el.innerHTML = '';
      items.forEach(it => {
        const b = document.createElement('button');
        b.type = 'button';
        b.setAttribute('data-pb-key', key);
        b.setAttribute('data-pb-id', it.id);
        b.textContent = labelFn(it);
        if (s[key] === it.id || (key === 'sticker' && (s.stickers||[]).indexOf(it.id)>=0)) b.classList.add('on');
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
    if (!ctx) return;
    const lay = PhotoBoothRules.pbLayout(pb.shot, cv.width, cv.height);
    const grd = ctx.createLinearGradient(0,0,0,cv.height);
    grd.addColorStop(0, lay.bg.color); grd.addColorStop(1, lay.bg.alt || lay.bg.color);
    ctx.fillStyle = grd; ctx.fillRect(0,0,cv.width,cv.height);
    const pad = lay.pad || 0;
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
    if (!data || !PhotoBoothRules.pbIsPhotoData(data)){ pbSnap(); return; }
    const a = document.createElement('a');
    a.href = data; a.download = 'rublox-photo.png';
    document.body.appendChild(a); a.click(); a.remove();
  }
  function pbShowGal(){
    const box = document.getElementById('avBoothGallery'); if (!box) return;
    const g = pbGalleryStore();
    box.hidden = false;
    try { box.removeAttribute('hidden'); } catch (e){}
    box.innerHTML = g.length ? '' : '<div>No photos yet — take a snap!</div>';
    g.slice().reverse().forEach(p => {
      const img = document.createElement('img');
      img.src = p.d; img.alt = 'Saved photo';
      img.setAttribute('data-pb', 'dl-saved');
      img.setAttribute('data-pb-data', p.d);
      box.appendChild(img);
    });
  }
  function pbHandleClick(ev){
    const raw = ev && ev.target;
    const t = raw && raw.closest ? (raw.closest('button, [data-pb-key], [data-pb], img') || raw) : raw;
    if (!t) return false;
    const openBtn = (t.id === 'avBoothBtn' || t.id === 'hubBoothBtn') ? t : (t.closest && (t.closest('#avBoothBtn, #hubBoothBtn')));
    if (openBtn){
      if (ev){ try { ev.preventDefault(); ev.stopPropagation(); if (ev.stopImmediatePropagation) ev.stopImmediatePropagation(); } catch (e){} }
      pbOpen();
      return true;
    }
    const box = pbBox();
    if (!box || box.hidden || (box.contains && !box.contains(t))) return false;
    if (ev){ try { ev.preventDefault(); ev.stopPropagation(); if (ev.stopImmediatePropagation) ev.stopImmediatePropagation(); } catch (e){} }
    const key = t.getAttribute && t.getAttribute('data-pb-key');
    if (key){ pbOnChrome(key, t.getAttribute('data-pb-id')); return true; }
    if (t.id === 'avBoothX'){ pbClose(); return true; }
    if (t.id === 'avBoothSnap'){ pbSnap(); return true; }
    if (t.id === 'avBoothDl'){ pbDownload(); return true; }
    if (t.id === 'avBoothGal'){ pbShowGal(); return true; }
    if (t.getAttribute && t.getAttribute('data-pb') === 'dl-saved'){
      pb.lastData = t.getAttribute('data-pb-data') || t.src;
      pbDownload();
      return true;
    }
    return false;
  }
  function pbKey(ev){
    if (!pbIsOpen() || !ev) return false;
    const c = ev.code || ev.key;
    if (c === 'Escape' || c === 'Esc' || c === 'KeyB'){
      if (ev.preventDefault) ev.preventDefault();
      if (ev.stopPropagation) ev.stopPropagation();
      pbClose(); return true;
    }
    const list = pbButtons();
    if (!list.length) return false;
    const cur = (typeof document !== 'undefined' && document.activeElement && list.indexOf(document.activeElement) >= 0)
      ? list.indexOf(document.activeElement) : (pb.focus | 0);
    if (c === 'ArrowRight' || c === 'ArrowDown'){
      if (ev.preventDefault) ev.preventDefault();
      if (ev.stopPropagation) ev.stopPropagation();
      pbFocusAt(cur + 1); return true;
    }
    if (c === 'ArrowLeft' || c === 'ArrowUp'){
      if (ev.preventDefault) ev.preventDefault();
      if (ev.stopPropagation) ev.stopPropagation();
      pbFocusAt(cur - 1); return true;
    }
    if (c === 'Enter' || c === 'Space' || c === ' ' || c === 'NumpadEnter' || c === 'KeyA'){
      if (ev.preventDefault) ev.preventDefault();
      if (ev.stopPropagation) ev.stopPropagation();
      const b = list[cur] || list[0];
      if (b && b.click) b.click();
      return true;
    }
    return false;
  }
  function pbPad(jp){
    if (!pbIsOpen() || !jp) return false;
    if (jp[1] || jp.b){ pbClose(); return true; }
    const list = pbButtons(); if (!list.length) return true;
    if (jp[15] || jp[13] || jp.right || jp.down){ pbFocusAt((pb.focus|0) + 1); return true; }
    if (jp[14] || jp[12] || jp.left || jp.up){ pbFocusAt((pb.focus|0) - 1); return true; }
    if (jp[0] || jp.a){ const b = list[pb.focus|0] || list[0]; if (b && b.click) b.click(); return true; }
    return true;
  }
  function pbBind(){
    if (typeof document === 'undefined') return;
    pbMount();
    if (document._pbDoc) return;
    document._pbDoc = true;
    document.addEventListener('click', pbHandleClick, true);
    document.addEventListener('keydown', ev => { pbKey(ev); }, true);
  }
  if (typeof document !== 'undefined'){
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', pbBind);
    else pbBind();
  }
  if (typeof window !== 'undefined'){ window.pb = pb; window.pbOpen = pbOpen; window.pbClose = pbClose; window.pbIsOpen = pbIsOpen; window.pbPad = pbPad; window.pbKey = pbKey; window.pbBind = pbBind; window.pbHandleClick = pbHandleClick; }
