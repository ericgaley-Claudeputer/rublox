
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
    return Array.prototype.slice.call(box.querySelectorAll('button')).filter(b => b && !b.disabled && !b.hidden && (!b.closest || !b.closest('[hidden]')));
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
    const fullSticker = key === 'sticker' && (s.stickers || []).length >= 4 && (s.stickers || []).indexOf(id) < 0;
    const fullProp = key === 'prop' && (s.props || []).length >= 4 && (s.props || []).indexOf(id) < 0;
    if (key === 'sticker'){
      pb.shot = R.pbToggleSticker(s, id);
      if ((pb.shot.stickers || []).indexOf(id) >= 0) pb.lastSticker = id;
    } else if (key === 'prop'){
      pb.shot = R.pbToggleProp(s, id);
    } else { s[key] = id; pb.shot = R.pbCleanShot(s); }
    pbPaintChrome(); pbPaint();
    // QA t330u: the 5th sticker used to do nothing at all. Say why.
    if (fullSticker || fullProp){ const h = document.querySelector('#avBooth .avbooth-h'); if (h){ h.textContent = fullProp ? '📸 Up to 4 props! Tap a lit one to take it off.' : '📸 Up to 4 stickers! Tap a lit one to take it off.'; clearTimeout(pb.hintT); pb.hintT = setTimeout(() => { h.textContent = '📸 Photo Booth'; }, 2600); } }
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
        if (s[key] === it.id || (key === 'sticker' && (s.stickers||[]).indexOf(it.id)>=0) || (key === 'prop' && (s.props||[]).indexOf(it.id)>=0)) b.classList.add('on');
        el.appendChild(b);
      });
    }
    row('avBoothPoses', R.PB_POSES, 'pose', it => it.emoji + ' ' + it.name);
    row('avBoothBgs', R.PB_BGS, 'bg', it => it.name);
    row('avBoothFrames', R.PB_FRAMES, 'frame', it => it.name);
    row('avBoothCostumes', R.PB_COSTUMES || [], 'costume', it => it.emoji + ' ' + it.name);
    row('avBoothProps', R.PB_PROPS || [], 'prop', it => it.emoji + ' ' + it.name);
    row('avBoothStickers', R.PB_STICKERS, 'sticker', it => it.emoji + ' ' + it.name);
  }
  function pbAv(){
    try { if (typeof draft !== 'undefined' && draft) return draft; } catch(e){}
    try { if (typeof avatar !== 'undefined' && avatar) return avatar; } catch(e){}
    return {};
  }
  // GB-7: the avatar as drawn in the booth — with the picked costume's clothes swapped in.
  function pbDressed(){
    const id = pb.shot && pb.shot.costume;
    try { if (id && id !== 'none' && typeof CostumeRules !== 'undefined') return CostumeRules.csApply(pbAv(), id); } catch(e){}
    return pbAv();
  }
  function pbDrawProp2d(ctx, id){
    if (!ctx || !ctx.arc || !ctx.moveTo || !ctx.fill || !ctx.stroke) return;
    ctx.save();
    if (id === 'glasses'){
      ctx.lineWidth = 4; ctx.strokeStyle = '#2563eb'; ctx.fillStyle = 'rgba(219,238,255,.55)';
      ctx.beginPath(); ctx.arc(112, 72, 13, 0, Math.PI*2); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.arc(148, 72, 13, 0, Math.PI*2); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(125, 72); ctx.quadraticCurveTo(130, 67, 135, 72); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(90, 70); ctx.lineTo(99, 71); ctx.moveTo(161, 71); ctx.lineTo(170, 70); ctx.stroke();
      ctx.fillStyle = 'rgba(255,255,255,.8)';
      ctx.beginPath(); ctx.arc(107, 67, 3, 0, Math.PI*2); ctx.arc(143, 67, 3, 0, Math.PI*2); ctx.fill();
    } else if (id === 'shades'){
      const star = (cx, cy, r1, r2) => {
        ctx.beginPath();
        for (let i = 0; i < 10; i++){
          const a = -Math.PI/2 + i * Math.PI/5, r = i % 2 ? r2 : r1;
          const x = cx + Math.cos(a)*r, y = cy + Math.sin(a)*r;
          if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.closePath();
      };
      ctx.fillStyle = '#1d2340'; ctx.strokeStyle = '#ff4d94'; ctx.lineWidth = 3;
      star(112, 72, 16, 8); ctx.fill(); ctx.stroke();
      star(148, 72, 16, 8); ctx.fill(); ctx.stroke();
      ctx.strokeStyle = '#ffd23f'; ctx.lineWidth = 3.5;
      ctx.beginPath(); ctx.moveTo(124, 71); ctx.lineTo(136, 71); ctx.stroke();
    } else if (id === 'mustache'){
      ctx.fillStyle = '#4a2c18'; ctx.strokeStyle = '#2b170b'; ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(130, 84);
      ctx.bezierCurveTo(118, 78, 108, 92, 98, 84);
      ctx.bezierCurveTo(104, 96, 120, 95, 130, 89);
      ctx.bezierCurveTo(140, 95, 156, 96, 162, 84);
      ctx.bezierCurveTo(152, 92, 142, 78, 130, 84);
      ctx.closePath(); ctx.fill(); ctx.stroke();
    } else if (id === 'party'){
      ctx.fillStyle = '#8b5cf6'; ctx.strokeStyle = '#1d2340'; ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.moveTo(108, 44); ctx.lineTo(130, -6); ctx.lineTo(152, 44); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#ffd23f'; ctx.beginPath(); ctx.moveTo(116, 26); ctx.lineTo(144, 26); ctx.lineTo(147, 33); ctx.lineTo(113, 33); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#ff6fb5'; ctx.beginPath(); ctx.arc(130, -8, 8, 0, Math.PI*2); ctx.fill(); ctx.stroke();
    } else if (id === 'ears'){
      ctx.fillStyle = '#ff6fb5'; ctx.fillRect(92, 38, 76, 7);
      [-1, 1].forEach(k => {
        ctx.save(); ctx.translate(130 + k * 20, 40); ctx.rotate(k * 0.14);
        ctx.fillStyle = '#ffffff'; ctx.strokeStyle = '#1d2340'; ctx.lineWidth = 2.5;
        ctx.beginPath(); if (ctx.ellipse) ctx.ellipse(0, -24, 10, 26, 0, 0, Math.PI*2); else ctx.arc(0, -24, 12, 0, Math.PI*2);
        ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#ffb3c7';
        ctx.beginPath(); if (ctx.ellipse) ctx.ellipse(0, -22, 5, 18, 0, 0, Math.PI*2); else ctx.arc(0, -22, 6, 0, Math.PI*2);
        ctx.fill(); ctx.restore();
      });
    } else if (id === 'bubble'){
      ctx.fillStyle = '#ffffff'; ctx.strokeStyle = '#1d2340'; ctx.lineWidth = 2.5;
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(166, 8, 78, 34, 12);
      else ctx.rect(166, 8, 78, 34);
      ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(176, 40); ctx.lineTo(164, 52); ctx.lineTo(188, 41); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#ff4d6d'; ctx.font = 'bold 14px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('CHEESE!', 205, 25);
    }
    ctx.restore();
  }
  function pbDrawSticker2d(ctx, id, cx, cy, r){
    if (!ctx || !ctx.arc || !ctx.moveTo || !ctx.fill){
      ctx.fillText(id, cx, cy);
      return;
    }
    ctx.save(); ctx.translate(cx, cy);
    ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    if (id === 'star'){
      ctx.fillStyle = '#ffd23f'; ctx.strokeStyle = '#d98200'; ctx.lineWidth = 2.5;
      ctx.beginPath();
      for (let i = 0; i < 10; i++){
        const a = -Math.PI/2 + i * Math.PI/5, d = i % 2 ? r * 0.45 : r;
        const x = Math.cos(a)*d, y = Math.sin(a)*d;
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#fff7c2'; ctx.beginPath(); ctx.arc(-r*0.2, -r*0.2, r*0.18, 0, Math.PI*2); ctx.fill();
    } else if (id === 'heart'){
      ctx.fillStyle = '#ff4d79'; ctx.strokeStyle = '#b51748'; ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.moveTo(0, r*0.85);
      ctx.bezierCurveTo(-r*1.2, r*0.15, -r*1.0, -r*0.9, 0, -r*0.3);
      ctx.bezierCurveTo(r*1.0, -r*0.9, r*1.2, r*0.15, 0, r*0.85);
      ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.fillStyle = 'rgba(255,255,255,.55)'; ctx.beginPath(); ctx.arc(-r*0.35, -r*0.35, r*0.18, 0, Math.PI*2); ctx.fill();
    } else if (id === 'sparkle'){
      const sp = (ox, oy, sr, c) => {
        ctx.fillStyle = c; ctx.beginPath();
        ctx.moveTo(ox, oy - sr); ctx.quadraticCurveTo(ox, oy, ox + sr, oy);
        ctx.quadraticCurveTo(ox, oy, ox, oy + sr); ctx.quadraticCurveTo(ox, oy, ox - sr, oy);
        ctx.quadraticCurveTo(ox, oy, ox, oy - sr); ctx.fill();
      };
      sp(-r*0.15, 0, r*0.85, '#ffd23f');
      sp(r*0.55, -r*0.45, r*0.42, '#38bdf8');
      sp(r*0.5, r*0.5, r*0.34, '#ff6fb5');
    } else if (id === 'paw'){
      ctx.fillStyle = '#ff8fab'; ctx.strokeStyle = '#9d174d'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(0, r*0.2, r*0.48, 0, Math.PI*2); ctx.fill(); ctx.stroke();
      [[-0.55,-0.32],[-0.2,-0.56],[0.2,-0.56],[0.55,-0.32]].forEach(([dx, dy]) => {
        ctx.beginPath(); ctx.arc(dx*r, dy*r, r*0.2, 0, Math.PI*2); ctx.fill(); ctx.stroke();
      });
    } else if (id === 'bow'){
      ctx.fillStyle = '#ff6fb5'; ctx.strokeStyle = '#9d174d'; ctx.lineWidth = 2.2;
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-r*0.95, -r*0.55); ctx.lineTo(-r*0.95, r*0.55); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(r*0.95, -r*0.55); ctx.lineTo(r*0.95, r*0.55); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#ffb3d9'; ctx.beginPath(); ctx.arc(0, 0, r*0.26, 0, Math.PI*2); ctx.fill(); ctx.stroke();
    } else if (id === 'sun'){
      ctx.strokeStyle = '#ff9f1c'; ctx.lineWidth = 3;
      for (let i = 0; i < 8; i++){
        const a = i * Math.PI/4;
        ctx.beginPath(); ctx.moveTo(Math.cos(a)*r*0.66, Math.sin(a)*r*0.66); ctx.lineTo(Math.cos(a)*r*0.98, Math.sin(a)*r*0.98); ctx.stroke();
      }
      ctx.fillStyle = '#ffd23f'; ctx.beginPath(); ctx.arc(0, 0, r*0.55, 0, Math.PI*2); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#1d2340'; ctx.beginPath(); ctx.arc(-r*0.18, -r*0.08, 2.2, 0, Math.PI*2); ctx.arc(r*0.18, -r*0.08, 2.2, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(0, r*0.05, r*0.2, 0.2, Math.PI - 0.2); ctx.stroke();
    } else if (id === 'rainbow'){
      ['#ff4d5e','#ff9f1c','#ffd23f','#2ec27e','#3a86ff'].forEach((c, i) => {
        ctx.strokeStyle = c; ctx.lineWidth = Math.max(2, r*0.16);
        ctx.beginPath(); ctx.arc(0, r*0.25, r*(0.92 - i*0.14), Math.PI, 0); ctx.stroke();
      });
      ctx.fillStyle = '#ffffff';
      ctx.beginPath(); ctx.arc(-r*0.65, r*0.32, r*0.28, 0, Math.PI*2); ctx.arc(r*0.65, r*0.32, r*0.28, 0, Math.PI*2); ctx.fill();
    } else if (id === 'crown'){
      ctx.fillStyle = '#ffd23f'; ctx.strokeStyle = '#b97c00'; ctx.lineWidth = 2.4;
      ctx.beginPath(); ctx.moveTo(-r*0.85, r*0.55); ctx.lineTo(-r*0.85, -r*0.35); ctx.lineTo(-r*0.35, r*0.05); ctx.lineTo(0, -r*0.65); ctx.lineTo(r*0.35, r*0.05); ctx.lineTo(r*0.85, -r*0.35); ctx.lineTo(r*0.85, r*0.55); ctx.closePath();
      ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#ff2d55'; ctx.beginPath(); ctx.arc(0, r*0.22, r*0.14, 0, Math.PI*2); ctx.fill();
    }
    ctx.restore();
  }
  function pbPlaceStickerAt(ev){
    const cv = document.getElementById('avBoothCv'); if (!cv || !pb.shot) return;
    const list = pb.shot.stickers || [];
    if (!list.length) return;
    const id = (pb.lastSticker && list.indexOf(pb.lastSticker) >= 0) ? pb.lastSticker : list[list.length - 1];
    const rect = cv.getBoundingClientRect ? cv.getBoundingClientRect() : null;
    if (!rect || !rect.width || !rect.height) return;
    const x = (ev.clientX - rect.left) / rect.width;
    const y = (ev.clientY - rect.top) / rect.height;
    pb.shot = PhotoBoothRules.pbSetStickerPos(pb.shot, id, x, y);
    pbPaint();
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
    try {
      if (typeof drawAvatar === 'function'){
        let avCv = pb.avCv;
        if (!avCv && typeof document !== 'undefined' && document.createElement){ avCv = pb.avCv = document.createElement('canvas'); }
        const avCtx = avCv && avCv.getContext ? avCv.getContext('2d') : null;
        if (avCtx){
          if (avCv.width !== cv.width || avCv.height !== cv.height){ avCv.width = cv.width; avCv.height = cv.height; }
          drawAvatar(avCtx, pbDressed(), {});
          ctx.drawImage(avCv, 0, 0);
        } else {
          drawAvatar(ctx, pbDressed(), {});
        }
      }
    } catch (e){}
    if (lay.costume && lay.costume.id !== 'none' && typeof CostumeRules !== 'undefined'){
      ctx.save();
      const s = Math.min(cv.width / 260, cv.height / 310);
      ctx.scale(s, s); ctx.translate((cv.width / s - 260) / 2, 10);
      try { CostumeRules.csDraw2d(ctx, lay.costume.id); } catch (e){}
      ctx.restore();
    }
    if ((lay.props || []).length){
      ctx.save();
      const s = Math.min(cv.width / 260, cv.height / 310);
      ctx.scale(s, s); ctx.translate((cv.width / s - 260) / 2, 10);
      lay.props.forEach(p => pbDrawProp2d(ctx, p.id));
      ctx.restore();
    }
    ctx.restore();
    if (lay.frame && lay.frame.color && pad){
      ctx.strokeStyle = lay.frame.color;
      ctx.lineWidth = pad;
      ctx.strokeRect(pad/2, pad/2, cv.width-pad, cv.height-pad);
    }
    const r = Math.round(cv.width * 0.055);
    (lay.stickers||[]).forEach(st => {
      pbDrawSticker2d(ctx, st.id, st.x * cv.width, st.y * cv.height, r);
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
    if (t.id === 'avBoothCv'){ pbPlaceStickerAt(ev); return true; }
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
