/* Rublox global weather + day/night — original, mode-safe, save-compatible. */
(function (root) {
  const WX_KEY = 'rubloxWeather';
  const WX_VER = 1;
  const WX_DAY_LEN = 180;
  const WX_WEATHER_LEN = 48;
  const WX_MODES = {
    auto: 'auto',
    day: 'day',
    off: 'off'
  };
  const WX_SKIP = ['splash', 'waterpark', 'race', 'photostudio', 'dance', 'bakery', 'icecream', 'tower', 'fashion', 'cafe', 'petshow', 'camp', 'elevator', 'treehouse', 'school', 'fieldtrip', 'aquarium', 'winter'];
  const WX_SNOW = ['obby', 'build', 'hide', 'stable', 'tag', 'party', 'snowfest', 'pets', 'autumn', 'pethotel', 'fish', 'hunt', 'garden', 'meadow', 'rides', 'hive'];
  const WX_FOG = ['haunt', 'lantern', 'hide', 'petisland', 'obby', 'build', 'hunt'];
  const WX_RAIN = ['obby', 'build', 'lantern', 'hide', 'autumn', 'stable', 'petisland', 'pets', 'tag', 'dreamhouse', 'pethotel', 'haunt', 'fish', 'hunt', 'garden', 'meadow', 'rides', 'hive'];

  function wxDefault(){ return {ver: WX_VER, mode: 'auto'}; }

  function wxNormalize(raw){
    const d = wxDefault();
    const o = (raw && typeof raw === 'object') ? raw : {};
    const mode = (o.mode === 'day' || o.mode === 'off' || o.mode === 'auto') ? o.mode : 'auto';
    return {ver: WX_VER, mode: mode};
  }

  function wxLoadState(raw){
    if (typeof raw === 'string'){
      try { raw = JSON.parse(raw); } catch (e){ raw = null; }
    }
    return wxNormalize(raw);
  }

  function wxEnabled(modeId, setting){
    const st = wxNormalize(setting);
    if (st.mode === 'off') return false;
    if (!modeId) return false;
    return WX_SKIP.indexOf(modeId) < 0;
  }

  function wxClock(t, dayLen){
    const len = dayLen > 0 ? dayLen : WX_DAY_LEN;
    const u = ((t % len) + len) % len / len;
    let phase = 'day', sun = 1;
    if (u < 0.12){ phase = 'dawn'; sun = 0.45 + u / 0.12 * 0.55; }
    else if (u < 0.52){ phase = 'day'; sun = 1; }
    else if (u < 0.68){ phase = 'dusk'; sun = 1 - (u - 0.52) / 0.16 * 0.7; }
    else { phase = 'night'; sun = 0.22 + Math.max(0, 0.08 - Math.abs(u - 0.86) * 0.2); }
    return {u: u, phase: phase, sun: Math.max(0.16, Math.min(1, sun))};
  }

  function wxForceDay(clock){
    return {u: 0.3, phase: 'day', sun: 1};
  }

  function wxWeatherAllowed(kind, modeId){
    if (kind === 'clear') return true;
    if (kind === 'rain') return WX_RAIN.indexOf(modeId) >= 0;
    if (kind === 'snow') return WX_SNOW.indexOf(modeId) >= 0;
    if (kind === 'fog') return WX_FOG.indexOf(modeId) >= 0;
    return false;
  }

  function wxPickWeather(modeId, rand){
    const r = (typeof rand === 'function' ? rand() : Math.random());
    const pool = ['clear', 'clear', 'clear'];
    if (wxWeatherAllowed('rain', modeId)) pool.push('rain', 'rain');
    if (wxWeatherAllowed('fog', modeId)) pool.push('fog');
    if (wxWeatherAllowed('snow', modeId)) pool.push('snow');
    const i = Math.max(0, Math.min(pool.length - 1, (r * pool.length) | 0));
    return pool[i];
  }

  function wxSky(modeId, phase, weather){
    const lantern = modeId === 'lantern';
    const pal = lantern ? {
      dawn: '#c9a0d8',
      day: '#7ec8ff',
      dusk: '#5a2a6a',
      night: '#1b1633'
    } : {
      dawn: '#ffc8a0',
      day: '#8fd3ff',
      dusk: '#e07a4a',
      night: '#1a2248'
    };
    let hex = pal[phase] || pal.day;
    if (weather === 'rain') hex = phase === 'night' ? (lantern ? '#161022' : '#2a3348') : (lantern ? '#4a3a68' : '#6a8aaa');
    if (weather === 'snow') hex = phase === 'night' ? '#2a3a58' : '#d8e8f8';
    if (weather === 'fog') hex = phase === 'night' ? '#2a2a38' : '#c8d0d8';
    return hex;
  }

  function wxFog(modeId, phase, weather){
    const sky = wxSky(modeId, phase, weather);
    let near = 70, far = 200;
    if (phase === 'dusk'){ near = 50; far = 160; }
    if (phase === 'night'){ near = 28; far = 120; }
    if (weather === 'rain'){ near = Math.min(near, 40); far = Math.min(far, 140); }
    if (weather === 'snow'){ near = Math.min(near, 45); far = Math.min(far, 150); }
    if (weather === 'fog'){ near = 8; far = 48; }
    if (modeId === 'lantern'){
      near = weather === 'fog' ? 10 : (phase === 'night' ? 22 : 50);
      far = weather === 'fog' ? 55 : (phase === 'night' ? 140 : 200);
    }
    return {color: sky, near: near, far: far};
  }

  function wxLightScale(phase, weather){
    const clock = {dawn: 0.72, day: 1, dusk: 0.55, night: 0.32};
    let s = clock[phase] != null ? clock[phase] : 1;
    if (weather === 'rain' || weather === 'fog') s *= 0.85;
    if (weather === 'snow') s *= 0.92;
    return s;
  }

  function wxParticleCount(quality, weather, mobile){
    if (!weather || weather === 'clear' || weather === 'fog') return 0;
    const low = quality === 'low' || mobile;
    if (weather === 'rain') return low ? 40 : 120;
    if (weather === 'snow') return low ? 28 : 80;
    return 0;
  }

  const api = {
    WX_KEY, WX_VER, WX_DAY_LEN, WX_WEATHER_LEN, WX_MODES, WX_SKIP, WX_SNOW, WX_FOG, WX_RAIN,
    wxDefault, wxNormalize, wxLoadState, wxEnabled, wxClock, wxForceDay,
    wxWeatherAllowed, wxPickWeather, wxSky, wxFog, wxLightScale, wxParticleCount
  };
  root.WXRules = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
