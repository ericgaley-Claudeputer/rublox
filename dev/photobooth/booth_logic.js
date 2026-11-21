/* Avatar / hub Photo Booth. Reuses the Star Snaps gallery key rubloxPhotos
   (capped). Canvas snapshots with a 2D fallback when WebGL is missing. */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.PhotoBoothRules = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  const PB_KEY = 'rubloxPhotos';
  const PB_MAX = 12;

  const PB_POSES = [
    {id:'stand', name:'Stand tall', emoji:'🧍'},
    {id:'wave', name:'Friendly wave', emoji:'👋'},
    {id:'jump', name:'Happy hop', emoji:'⬆️'},
    {id:'sit', name:'Cozy sit', emoji:'🪑'},
    {id:'twirl', name:'Twirl', emoji:'💫'},
    {id:'heart', name:'Heart hands', emoji:'💖'}
  ];
  const PB_BGS = [
    {id:'studio', name:'Soft Studio', color:'#f4efe8', alt:'#e8dcc8'},
    {id:'sunset', name:'Sunset Sky', color:'#ffb703', alt:'#fb8500'},
    {id:'mint', name:'Mint Wall', color:'#b7efc5', alt:'#80ed99'},
    {id:'stars', name:'Star Drape', color:'#3d348b', alt:'#191970'},
    {id:'hearts', name:'Heart Paper', color:'#ffc2d1', alt:'#ff8fab'},
    {id:'hub', name:'Hub Lobby', color:'#8ecae6', alt:'#219ebc'}
  ];
  const PB_FRAMES = [
    {id:'none', name:'No frame', color:null, pad:0},
    {id:'white', name:'White mat', color:'#ffffff', pad:18},
    {id:'gold', name:'Gold frame', color:'#f4d35e', pad:16},
    {id:'pink', name:'Pink frame', color:'#ff8fab', pad:16},
    {id:'navy', name:'Navy frame', color:'#1d3557', pad:16}
  ];
  const PB_STICKERS = [
    {id:'star', name:'Star', emoji:'⭐', x:0.82, y:0.14},
    {id:'heart', name:'Heart', emoji:'💕', x:0.16, y:0.16},
    {id:'sparkle', name:'Sparkle', emoji:'✨', x:0.84, y:0.78},
    {id:'paw', name:'Paw', emoji:'🐾', x:0.14, y:0.8},
    {id:'bow', name:'Bow', emoji:'🎀', x:0.5, y:0.1},
    {id:'sun', name:'Sun', emoji:'🌞', x:0.86, y:0.46}
  ];

  function pbPose(id){ return PB_POSES.find(p => p.id === id) || PB_POSES[0]; }
  function pbBg(id){ return PB_BGS.find(p => p.id === id) || PB_BGS[0]; }
  function pbFrame(id){ return PB_FRAMES.find(p => p.id === id) || PB_FRAMES[0]; }
  function pbSticker(id){ return PB_STICKERS.find(p => p.id === id) || null; }

  function pbFreshShot(){
    return {pose:'stand', bg:'studio', frame:'white', stickers:[]};
  }

  function pbCleanShot(raw){
    const d = pbFreshShot();
    const o = raw && typeof raw === 'object' ? raw : {};
    if (pbPose(o.pose).id === o.pose) d.pose = o.pose;
    if (pbBg(o.bg).id === o.bg) d.bg = o.bg;
    if (pbFrame(o.frame).id === o.frame) d.frame = o.frame;
    const ids = Array.isArray(o.stickers) ? o.stickers : [];
    d.stickers = [];
    ids.forEach(id => { if (pbSticker(id) && d.stickers.indexOf(id) < 0) d.stickers.push(id); });
    d.stickers = d.stickers.slice(0, 4);
    return d;
  }

  function pbToggleSticker(shot, id){
    const s = pbCleanShot(shot);
    if (!pbSticker(id)) return s;
    const i = s.stickers.indexOf(id);
    if (i >= 0) s.stickers.splice(i, 1);
    else if (s.stickers.length < 4) s.stickers.push(id);
    return s;
  }

  function pbNeed2dFallback(hasWebgl){
    return !hasWebgl;
  }

  function pbIsPhotoData(d){
    return typeof d === 'string' && /^data:image\/(jpeg|png);base64,/.test(d) && d.length > 32;
  }

  function pbGallery(raw){
    const list = Array.isArray(raw) ? raw : [];
    return list.filter(p => p && pbIsPhotoData(p.d) && +p.t > 0)
      .slice(-PB_MAX)
      .map(p => ({id: String(p.id || p.t).slice(0, 24), t: +p.t, d: p.d, bg: p.bg, pose: p.pose, source: p.source || 'booth'}));
  }

  function pbStore(gallery, photo){
    const g = pbGallery(gallery);
    if (!photo || !pbIsPhotoData(photo.d)) return {ok:false, gallery:g, why:'data'};
    const item = {
      id: String(photo.id || photo.t || Date.now()).slice(0, 24),
      t: +photo.t || Date.now(),
      d: photo.d,
      bg: photo.bg,
      pose: photo.pose,
      source: photo.source || 'booth'
    };
    g.push(item);
    while (g.length > PB_MAX) g.shift();
    return {ok:true, gallery:g, count:g.length, item};
  }

  function pbDelete(gallery, id){
    const g = pbGallery(gallery).filter(p => p.id !== id);
    return {ok:true, gallery:g, count:g.length};
  }

  function pbLayout(shot, w, h){
    const s = pbCleanShot(shot);
    const bg = pbBg(s.bg);
    const fr = pbFrame(s.frame);
    const pose = pbPose(s.pose);
    const pad = fr.pad || 0;
    const poseShift = {
      stand: {x:0, y:0, scale:1},
      wave: {x:10, y:0, scale:1},
      jump: {x:0, y:-28, scale:1.05},
      sit: {x:0, y:24, scale:0.9},
      twirl: {x:-8, y:-8, scale:1},
      heart: {x:0, y:6, scale:1}
    }[pose.id] || {x:0,y:0,scale:1};
    return {
      width: w || 520,
      height: h || 600,
      bg, frame: fr, pose, pad, poseShift,
      stickers: s.stickers.map(id => pbSticker(id)).filter(Boolean)
    };
  }

  return {
    PB_KEY, PB_MAX, PB_POSES, PB_BGS, PB_FRAMES, PB_STICKERS,
    pbPose, pbBg, pbFrame, pbSticker, pbFreshShot, pbCleanShot, pbToggleSticker,
    pbNeed2dFallback, pbIsPhotoData, pbGallery, pbStore, pbDelete, pbLayout
  };
});
