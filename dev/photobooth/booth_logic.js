/* Avatar / hub Photo Booth. Reuses the Star Snaps gallery key rubloxPhotos
   (capped). Canvas snapshots with a 2D fallback when WebGL is missing. */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.PhotoBoothRules = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  const PB_KEY = 'rubloxPhotos';
  const PB_MAX = 12;
  // GB-7: dress-up costumes come from CostumeRules (dev/costumes/costume_logic.js).
  const CSR = (typeof globalThis !== 'undefined' && globalThis.CostumeRules) || (function(){ try { return (typeof require === 'function') ? require('../costumes/costume_logic.js') : null; } catch (e){ return null; } })();
  const PB_COSTUMES = CSR ? CSR.CS_LIST : [{id:'none', name:'No costume', emoji:'🙂'}];

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
  const PB_PROPS = [
    {id:'glasses', name:'Goofy Glasses', emoji:'🤓'},
    {id:'mustache', name:'Mustache', emoji:'🥸'},
    {id:'party', name:'Party Hat', emoji:'🥳'},
    {id:'ears', name:'Bunny Ears', emoji:'🐰'},
    {id:'shades', name:'Star Shades', emoji:'😎'},
    {id:'bubble', name:'Speech Bubble', emoji:'💬'}
  ];
  const PB_STICKERS = [
    {id:'star', name:'Star', emoji:'⭐', x:0.16, y:0.16},
    {id:'heart', name:'Heart', emoji:'💕', x:0.84, y:0.34},
    {id:'sparkle', name:'Sparkle', emoji:'✨', x:0.84, y:0.78},
    {id:'paw', name:'Paw', emoji:'🐾', x:0.14, y:0.8},
    {id:'bow', name:'Bow', emoji:'🎀', x:0.5, y:0.1},
    {id:'sun', name:'Sun', emoji:'🌞', x:0.86, y:0.46},
    {id:'rainbow', name:'Rainbow', emoji:'🌈', x:0.15, y:0.48},
    {id:'crown', name:'Crown', emoji:'👑', x:0.5, y:0.88}
  ];

  function pbPose(id){ return PB_POSES.find(p => p.id === id) || PB_POSES[0]; }
  function pbBg(id){ return PB_BGS.find(p => p.id === id) || PB_BGS[0]; }
  function pbFrame(id){ return PB_FRAMES.find(p => p.id === id) || PB_FRAMES[0]; }
  function pbProp(id){ return PB_PROPS.find(p => p.id === id) || null; }
  function pbSticker(id){ return PB_STICKERS.find(p => p.id === id) || null; }

  function pbFreshShot(){
    return {pose:'stand', bg:'studio', frame:'white', props:[], stickers:[], stickerPos:{}, costume:'none'};
  }
  function pbCostume(id){ return CSR ? CSR.csGet(id) : PB_COSTUMES[0]; }

  function pbCleanShot(raw){
    const d = pbFreshShot();
    const o = raw && typeof raw === 'object' ? raw : {};
    if (pbPose(o.pose).id === o.pose) d.pose = o.pose;
    if (pbBg(o.bg).id === o.bg) d.bg = o.bg;
    if (pbFrame(o.frame).id === o.frame) d.frame = o.frame;
    d.costume = pbCostume(o.costume).id;
    const pids = Array.isArray(o.props) ? o.props : [];
    d.props = [];
    pids.forEach(id => { if (pbProp(id) && d.props.indexOf(id) < 0) d.props.push(id); });
    d.props = d.props.slice(0, 4);
    const ids = Array.isArray(o.stickers) ? o.stickers : [];
    d.stickers = [];
    ids.forEach(id => { if (pbSticker(id) && d.stickers.indexOf(id) < 0) d.stickers.push(id); });
    d.stickers = d.stickers.slice(0, 4);
    const sp = o.stickerPos && typeof o.stickerPos === 'object' ? o.stickerPos : {};
    Object.keys(sp).forEach(id => {
      const p = sp[id];
      if (pbSticker(id) && p && Number.isFinite(+p.x) && Number.isFinite(+p.y)){
        d.stickerPos[id] = {x: Math.max(0.08, Math.min(0.92, +p.x)), y: Math.max(0.08, Math.min(0.92, +p.y))};
      }
    });
    return d;
  }

  function pbToggleProp(shot, id){
    const s = pbCleanShot(shot);
    if (!pbProp(id)) return s;
    const i = s.props.indexOf(id);
    if (i >= 0) s.props.splice(i, 1);
    else if (s.props.length < 4) s.props.push(id);
    return s;
  }

  function pbToggleSticker(shot, id){
    const s = pbCleanShot(shot);
    if (!pbSticker(id)) return s;
    const i = s.stickers.indexOf(id);
    if (i >= 0) s.stickers.splice(i, 1);
    else if (s.stickers.length < 4) s.stickers.push(id);
    return s;
  }

  function pbSetStickerPos(shot, id, x, y){
    const s = pbCleanShot(shot);
    if (!pbSticker(id)) return s;
    s.stickerPos[id] = {x: Math.max(0.08, Math.min(0.92, +x || 0.5)), y: Math.max(0.08, Math.min(0.92, +y || 0.5))};
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
      props: s.props.map(id => pbProp(id)).filter(Boolean),
      costume: pbCostume(s.costume),
      stickers: s.stickers.map(id => {
        const base = pbSticker(id);
        if (!base) return null;
        const pos = s.stickerPos && s.stickerPos[id];
        return pos ? Object.assign({}, base, {x: pos.x, y: pos.y}) : base;
      }).filter(Boolean)
    };
  }

  return {
    PB_KEY, PB_MAX, PB_POSES, PB_BGS, PB_FRAMES, PB_PROPS, PB_STICKERS, PB_COSTUMES,
    pbCostume, pbPose, pbBg, pbFrame, pbProp, pbSticker, pbFreshShot, pbCleanShot, pbToggleProp, pbToggleSticker, pbSetStickerPos,
    pbNeed2dFallback, pbIsPhotoData, pbGallery, pbStore, pbDelete, pbLayout
  };
});
