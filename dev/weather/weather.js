  /* ---------- rublox weather ---------- */
  const WX_RULES = (typeof WXRules !== 'undefined' && WXRules) ? WXRules : (typeof window !== 'undefined' && window.WXRules) || {};
  const WX_KEY = WX_RULES.WX_KEY || 'rubloxWeather';
  let wx = null;

  function wxLoad(){
    let raw = null;
    try { raw = (typeof load === 'function') ? load(WX_KEY, null) : (typeof localStorage !== 'undefined' ? JSON.parse(localStorage.getItem(WX_KEY) || 'null') : null); } catch (e){}
    return WX_RULES.wxLoadState ? WX_RULES.wxLoadState(raw) : {ver:1, mode:'auto'};
  }
  function wxSave(p){
    p = p || (wx && wx.set) || wxLoad();
    try {
      const body = WX_RULES.wxNormalize ? WX_RULES.wxNormalize(p) : p;
      if (typeof save === 'function') save(WX_KEY, body);
      else if (typeof localStorage !== 'undefined') localStorage.setItem(WX_KEY, JSON.stringify(body));
    } catch (e){}
  }
  function wxSetting(){ return (wx && wx.set) || wxLoad(); }
  function wxSetMode(mode){
    const next = WX_RULES.wxNormalize ? WX_RULES.wxNormalize({mode: mode}) : {mode: mode || 'auto'};
    if (wx) wx.set = next;
    wxSave(next);
    wxSyncUi();
    return next.mode;
  }
  function wxSyncUi(){
    try {
      const st = wxSetting();
      ['auto','day','off'].forEach(m => {
        const n = document.getElementById('wxSet' + m.charAt(0).toUpperCase() + m.slice(1));
        if (n) n.checked = st.mode === m;
      });
    } catch (e){}
  }
  function wxHex(c){
    try { return new THREE.Color(c); } catch (e){ return null; }
  }
  function wxEnsure(){
    if (wx) return wx;
    wx = {set: wxLoad(), t: 0, weatherT: 0, weather: 'clear', modeId: null, drops: null, base: null, _last: ''};
    return wx;
  }
  function wxEnter(modeId){
    wxEnsure();
    wx.modeId = modeId || (typeof mode !== 'undefined' ? mode : null);
    wx.base = null;
    wx._last = '';
    if (wx.drops && wx.drops.parent){ try { wx.drops.parent.remove(wx.drops); } catch (e){} }
    wx.drops = null;
    if (!(WX_RULES.wxEnabled && WX_RULES.wxEnabled(wx.modeId, wx.set))){
      wxClearDrops();
      return wx;
    }
    if (wx.set.mode === 'auto'){
      wx.weather = WX_RULES.wxPickWeather ? WX_RULES.wxPickWeather(wx.modeId, Math.random) : 'clear';
    } else wx.weather = 'clear';
    wx.weatherT = 0;
    return wx;
  }
  function wxStop(){
    wxClearDrops();
  }
  function wxClearDrops(){
    if (wx && wx.drops){
      try { if (wx.drops.parent) wx.drops.parent.remove(wx.drops); } catch (e){}
      try { if (wx.drops.geometry) wx.drops.geometry.dispose(); } catch (e){}
      wx.drops = null;
    }
  }
  function wxLow(){
    try { return (typeof gfxIsLow === 'function' && gfxIsLow()) || (typeof LOWQ !== 'undefined' && LOWQ); } catch (e){ return false; }
  }
  function wxMakeDrops(kind, count){
    wxClearDrops();
    if (!count || typeof THREE === 'undefined' || !wxScene()) return;
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++){
      pos[i*3] = (Math.random() - 0.5) * 28;
      pos[i*3+1] = Math.random() * 16;
      pos[i*3+2] = (Math.random() - 0.5) * 28;
    }
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const mat = new THREE.PointsMaterial({
      color: kind === 'snow' ? 0xffffff : 0xb8d0ff,
      size: kind === 'snow' ? 0.12 : 0.05,
      transparent: true,
      opacity: kind === 'snow' ? 0.9 : 0.65,
      depthWrite: false
    });
    const pts = new THREE.Points(geo, mat);
    pts.name = 'wxDrops';
    pts.frustumCulled = false;
    const sc = wxScene();
    if (!sc) return;
    sc.add(pts);
    wx.drops = pts;
    wx.dropsKind = kind;
  }
  function wxTickDrops(dt){
    if (!wx || !wx.drops) return;
    const attr = wx.drops.geometry && wx.drops.geometry.getAttribute('position');
    if (!attr) return;
    const arr = attr.array;
    const snow = wx.dropsKind === 'snow';
    const spd = snow ? 2.2 : 14;
    const drift = snow ? 0.8 : 0.2;
    for (let i = 0; i < arr.length; i += 3){
      arr[i] += (snow ? Math.sin((wx.t + i) * 0.7) : 0) * drift * dt;
      arr[i+1] -= spd * dt;
      if (arr[i+1] < -2){ arr[i+1] += 16; arr[i] = (Math.random() - 0.5) * 28; arr[i+2] = (Math.random() - 0.5) * 28; }
    }
    attr.needsUpdate = true;
    try {
      const cam = wxCam(); if (cam) wx.drops.position.copy(cam.position);
    } catch (e){}
  }
  function wxBind(env){
    env = env || {};
    if (env.scene) wxEnsure().scene = env.scene;
    if (env.camera) wxEnsure().camera = env.camera;
    return wxEnsure();
  }
  function wxScene(){ return (wx && wx.scene) || (typeof scene !== 'undefined' ? scene : null); }
  function wxCam(){ return (wx && wx.camera) || (typeof camera !== 'undefined' ? camera : null); }
  function wxTick(dt, modeId, env){
    wxEnsure();
    if (env) wxBind(env);
    if (modeId) wx.modeId = modeId;
    const set = wx.set || wxLoad();
    wx.set = set;
    if (!(WX_RULES.wxEnabled && WX_RULES.wxEnabled(wx.modeId, set))){
      if (wx.drops) wxClearDrops();
      return;
    }
    dt = Math.min(0.08, +dt || 0.016);
    wx.t += dt;
    wx.weatherT += dt;
    const clock = (set.mode === 'day')
      ? (WX_RULES.wxForceDay ? WX_RULES.wxForceDay() : {phase:'day', sun:1})
      : (WX_RULES.wxClock ? WX_RULES.wxClock(wx.t, WX_RULES.WX_DAY_LEN) : {phase:'day', sun:1});
    if (set.mode === 'auto' && wx.weatherT > (WX_RULES.WX_WEATHER_LEN || 48)){
      wx.weatherT = 0;
      wx.weather = WX_RULES.wxPickWeather ? WX_RULES.wxPickWeather(wx.modeId, Math.random) : 'clear';
    }
    if (set.mode === 'day') wx.weather = 'clear';
    const sky = WX_RULES.wxSky ? WX_RULES.wxSky(wx.modeId, clock.phase, wx.weather) : '#8fd3ff';
    const fog = WX_RULES.wxFog ? WX_RULES.wxFog(wx.modeId, clock.phase, wx.weather) : {color: sky, near:70, far:200};
    const dim = WX_RULES.wxLightScale ? WX_RULES.wxLightScale(clock.phase, wx.weather) : 1;
    const sig = set.mode + '|' + clock.phase + '|' + wx.weather + '|' + wx.modeId;
    try {
      const scn = wxScene();
      if (scn){
        if (scn.background && scn.background.isColor) scn.background.lerp(wxHex(sky), 0.08);
        else scn.background = wxHex(sky);
        if (scn.fog){
          if (scn.fog.color) scn.fog.color.lerp(wxHex(fog.color), 0.08);
          scn.fog.near = (scn.fog.near || fog.near) * 0.92 + fog.near * 0.08;
          scn.fog.far = (scn.fog.far || fog.far) * 0.92 + fog.far * 0.08;
        } else {
          scn.fog = new THREE.Fog(fog.color, fog.near, fog.far);
        }
        if (sig !== wx._last){
          scn.traverse(o => {
            if (!o || !o.isLight) return;
            if (o._wxBase == null) o._wxBase = o.intensity;
            o.intensity = o._wxBase * dim;
          });
          wx._last = sig;
        }
      }
    } catch (e){}
    const want = WX_RULES.wxParticleCount ? WX_RULES.wxParticleCount(wxLow() ? 'low' : 'high', wx.weather, wxLow()) : 0;
    if (want && (!wx.drops || wx.dropsKind !== wx.weather)) wxMakeDrops(wx.weather, want);
    if (!want && wx.drops) wxClearDrops();
    if (wx.drops) wxTickDrops(dt);
    wx.phase = clock.phase;
    wx.sun = clock.sun;
  }

  try {
    if (typeof window !== 'undefined'){
      window.wxEnter = wxEnter;
      window.wxBind = wxBind;
      window.wxTick = wxTick;
      window.wxStop = wxStop;
      window.wxSetMode = wxSetMode;
      window.wxSetting = wxSetting;
      window.wxSyncUi = wxSyncUi;
      window.wxState = function(){ return wx ? {mode: wx.set && wx.set.mode, phase: wx.phase, weather: wx.weather, t: wx.t, modeId: wx.modeId, drops: !!(wx.drops)} : null; };
      window.wxForce = function(phase, weather){
        wxEnsure();
        if (weather) wx.weather = weather;
        if (phase === 'day') wx.t = (WX_RULES.WX_DAY_LEN || 180) * 0.3;
        if (phase === 'dusk') wx.t = (WX_RULES.WX_DAY_LEN || 180) * 0.6;
        if (phase === 'night') wx.t = (WX_RULES.WX_DAY_LEN || 180) * 0.8;
        if (phase === 'dawn') wx.t = (WX_RULES.WX_DAY_LEN || 180) * 0.05;
        wx._last = '';
        wxTick(0.016, wx.modeId);
        return window.wxState();
      };
    }
  } catch (e){}
  /* ---------- end rublox weather ---------- */
