/* Pure seasonal-event rules — local dates, force flags, snowflakes, shop. */
(function (root) {
  'use strict';

  const EV_KEY = 'rubloxSeason';
  const EV_VER = 1;
  const EV_HASH_RE = /(?:^|#|&)(?:snowfest|evtest)=([A-Za-z0-9_-]*)/i;

  const EV_SEASONS = [
    {
      id: 'snow', name: 'Snow Festival', emoji: '❄️',
      start: '12-01', end: '01-15',
      currency: 'flakes', currencyName: 'Snowflakes', currencyEmoji: '❄️',
      blurb: 'A cozy winter fair: toss snowballs, sled the hill, build a snowman, and skate the rink!',
      color: '#cfe8ff'
    },
    {
      id: 'bloom', name: 'Bloom Picnic', emoji: '🌸',
      start: '03-20', end: '04-20',
      placeholder: true,
      currency: 'petals', currencyName: 'Petals', currencyEmoji: '🌸',
      blurb: 'A spring picnic is planned for later — picnic blankets, flower crowns, and games in the sun.',
      color: '#ffe4f0'
    }
  ];

  const EV_SHOP = [
    {id: 'ev-snow-hat', ev: 'snow', n: 'Snowflake Cap', e: '❄️', cost: 40, kind: 'hat', desc: 'A sparkly winter cap for the festival.'},
    {id: 'ev-snow-scarf', ev: 'snow', n: 'Cozy Scarf', e: '🧣', cost: 30, kind: 'wear', desc: 'A warm scarf in festive red.'},
    {id: 'ev-snow-boots', ev: 'snow', n: 'Frost Boots', e: '🥾', cost: 25, kind: 'wear', desc: 'Boots made for snowy strolls.'},
    {id: 'ev-snow-pin', ev: 'snow', n: 'Festival Pin', e: '🎖️', cost: 15, kind: 'pin', desc: 'A shiny pin to remember the fair.'},
    {id: 'ev-snow-skates', ev: 'snow', n: 'Ice Skates', e: '⛸️', cost: 50, kind: 'wear', desc: 'Skates for the festival rink.'}
  ];

  const EV_FLAKE = {
    toss: 8, tossHit: 2, sled: 12, snowman: 20, skate: 6, skateRing: 2,
    quest: 5, daily: 3
  };

  function evToday(now){
    const d = now != null ? new Date(now) : new Date();
    const y = d.getFullYear(), m = d.getMonth() + 1, day = d.getDate();
    return y + '-' + (m < 10 ? '0' : '') + m + '-' + (day < 10 ? '0' : '') + day;
  }

  function evMd(now){
    const d = now != null ? new Date(now) : new Date();
    const m = d.getMonth() + 1, day = d.getDate();
    return (m < 10 ? '0' : '') + m + '-' + (day < 10 ? '0' : '') + day;
  }

  function evInWindow(md, start, end){
    if (!md || !start || !end) return false;
    if (start <= end) return md >= start && md <= end;
    return md >= start || md <= end; // wraps the new year
  }

  function evSeasonById(id){ return EV_SEASONS.find(s => s.id === id) || null; }

  function evHashForce(hash){
    const m = EV_HASH_RE.exec(String(hash || ''));
    if (!m) return '';
    const v = String(m[1] || 'snow').toLowerCase();
    if (v === '0' || v === 'off' || v === 'no') return '';
    if (v === '1' || v === 'on' || v === 'true' || v === '' || v === 'snowfest') return 'snow';
    return evSeasonById(v) ? v : 'snow';
  }

  function evFresh(){
    return {ver: EV_VER, force: '', flakes: 0, inv: {}, wear: '', best: {}, done: {}, earned: 0, spent: 0, daily: ''};
  }

  function evLoad(raw){
    const o = raw && typeof raw === 'object' ? raw : null;
    const s = evFresh();
    if (!o) return s;
    if (o.force === 'snow' || o.force === 'bloom' || o.force === '') s.force = o.force;
    s.flakes = Math.max(0, o.flakes | 0);
    s.earned = Math.max(0, o.earned | 0);
    s.spent = Math.max(0, o.spent | 0);
    s.wear = typeof o.wear === 'string' ? o.wear.slice(0, 24) : '';
    s.daily = typeof o.daily === 'string' ? o.daily : '';
    if (o.inv && typeof o.inv === 'object') for (const k in o.inv) if (o.inv[k]) s.inv[String(k)] = 1;
    if (o.best && typeof o.best === 'object') {
      const b = {};
      if (o.best.toss != null) b.toss = Math.max(0, o.best.toss | 0);
      if (o.best.sled != null && isFinite(+o.best.sled)) b.sled = Math.max(0, +o.best.sled);
      if (o.best.skate != null) b.skate = Math.max(0, o.best.skate | 0);
      if (o.best.snowman != null) b.snowman = Math.max(0, o.best.snowman | 0);
      s.best = b;
    }
    if (o.done && typeof o.done === 'object') for (const k in o.done) if (o.done[k]) s.done[String(k)] = 1;
    if (s.wear && !s.inv[s.wear]) s.wear = '';
    return s;
  }

  function evIsOn(id, now, opts){
    opts = opts || {};
    const want = id || 'snow';
    const forced = opts.force || evHashForce(opts.hash) || (opts.state && opts.state.force) || '';
    if (forced) return forced === want;
    const s = evSeasonById(want);
    if (!s || s.placeholder) return false;
    return evInWindow(evMd(now), s.start, s.end);
  }

  function evActive(now, opts){
    opts = opts || {};
    const forced = opts.force || evHashForce(opts.hash) || (opts.state && opts.state.force) || '';
    if (forced) return evSeasonById(forced) && !evSeasonById(forced).placeholder ? evSeasonById(forced) : evSeasonById('snow');
    for (const s of EV_SEASONS){
      if (s.placeholder) continue;
      if (evInWindow(evMd(now), s.start, s.end)) return s;
    }
    return null;
  }

  function evNext(now){
    const md = evMd(now);
    const d = now != null ? new Date(now) : new Date();
    const y = d.getFullYear();
    function nextDate(s){
      const [sm, sd] = s.start.split('-').map(Number);
      let when = new Date(y, sm - 1, sd);
      if (evMd(when) < md && !(s.start > s.end)) when = new Date(y + 1, sm - 1, sd);
      if (s.start > s.end && md <= s.end) when = new Date(y, sm - 1, sd); // already in wrap? next is this year's start already passed
      return when;
    }
    const upcoming = EV_SEASONS.slice().sort((a, b) => nextDate(a) - nextDate(b));
    return upcoming[0] || null;
  }

  function evAward(state, n, why){
    state = evLoad(state);
    const add = Math.max(0, n | 0);
    state.flakes += add;
    state.earned += add;
    return {state, add, why: why || '', flakes: state.flakes};
  }

  function evDaily(state, now){
    state = evLoad(state);
    const day = evToday(now);
    if (state.daily === day) return {ok: false, why: 'claimed', state, add: 0};
    state.daily = day;
    return evAward(state, EV_FLAKE.daily, 'daily');
  }

  function evBuy(state, itemId){
    state = evLoad(state);
    const it = EV_SHOP.find(x => x.id === itemId);
    if (!it) return {ok: false, why: 'missing', state};
    if (state.inv[it.id]) return {ok: false, why: 'owned', state};
    if (state.flakes < it.cost) return {ok: false, why: 'flakes', state};
    state.flakes -= it.cost;
    state.spent += it.cost;
    state.inv[it.id] = 1;
    return {ok: true, why: 'ok', state, item: it};
  }

  function evWear(state, itemId){
    state = evLoad(state);
    if (!itemId){ state.wear = ''; return {ok: true, why: 'off', state}; }
    if (!state.inv[itemId]) return {ok: false, why: 'owned', state};
    state.wear = state.wear === itemId ? '' : itemId;
    return {ok: true, why: state.wear ? 'on' : 'off', state};
  }

  function evNoteBest(state, key, value, higher){
    state = evLoad(state);
    const v = +value;
    if (!isFinite(v)) return {ok: false, state, better: false};
    const prev = state.best[key];
    const better = prev == null || (higher ? v > prev : v < prev);
    if (better) state.best[key] = v;
    state.done[key] = 1;
    return {ok: true, state, better, best: state.best[key]};
  }

  function evShopFor(evId){ return EV_SHOP.filter(x => x.ev === (evId || 'snow')); }

  const api = {
    EV_KEY, EV_VER, EV_HASH_RE, EV_SEASONS, EV_SHOP, EV_FLAKE,
    evToday, evMd, evInWindow, evSeasonById, evHashForce, evFresh, evLoad,
    evIsOn, evActive, evNext, evAward, evDaily, evBuy, evWear, evNoteBest, evShopFor
  };
  root.EVRules = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
