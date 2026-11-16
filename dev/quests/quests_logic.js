/* Pure Daily Quests rules — safe to require() in tests and to load in the page. */
(function (root) {
  'use strict';

  const Q_KEY = 'rubloxQuests';
  const Q_VER = 1;
  const Q_COUNT = 3;
  const Q_BONUS = 25;

  const Q_POOL = [
    {id: 'tower-win', ev: 'tower-win', title: 'Top of the Tower', desc: 'Win a Tower of Doom climb.', emoji: '🗼', goal: 1, reward: 30},
    {id: 'lh-rides', ev: 'lh-ride', title: 'Fairground Fun', desc: 'Ride 2 rides at Lantern Big Top.', emoji: '🎠', goal: 2, reward: 20},
    {id: 'pet-feed', ev: 'pet-feed', title: 'Snack Time', desc: 'Feed one of your pets.', emoji: '🍖', goal: 1, reward: 15},
    {id: 'pet-adopt', ev: 'pet-adopt', title: 'New Pal', desc: 'Adopt a new pet.', emoji: '🐾', goal: 1, reward: 25},
    {id: 'splash-play', ev: 'play:splash', title: 'Stay Dry', desc: "Play a Don't Splash! round.", emoji: '🌊', goal: 1, reward: 20},
    {id: 'dh-furn', ev: 'dh-furn', title: 'Interior Designer', desc: 'Place 5 furniture pieces in Dream House.', emoji: '🛋️', goal: 5, reward: 25},
    {id: 'tag-play', ev: 'play:tag', title: 'Tag In', desc: 'Play a game of Block Tag.', emoji: '🏷️', goal: 1, reward: 15},
    {id: 'wp-play', ev: 'play:waterpark', title: 'Wheeee!', desc: 'Play a round at Splash Summit.', emoji: '🛝', goal: 1, reward: 15},
    {id: 'obby-win', ev: 'obby-win', title: 'Obby Finish', desc: 'Finish an Obby Rush level.', emoji: '🏁', goal: 1, reward: 20},
    {id: 'dance-play', ev: 'play:dance', title: 'Hit the Beat', desc: 'Play Bossa Beat Dance Battle.', emoji: '💃', goal: 1, reward: 15}
  ];

  function qToday(now){
    const d = now != null ? new Date(now) : new Date();
    const y = d.getFullYear(), m = d.getMonth() + 1, day = d.getDate();
    return y + '-' + (m < 10 ? '0' : '') + m + '-' + (day < 10 ? '0' : '') + day;
  }

  function qDayAdd(day, delta){
    const p = String(day || '').split('-').map(Number);
    if (p.length !== 3 || !p[0]) return day;
    const d = new Date(p[0], p[1] - 1, p[2]);
    d.setDate(d.getDate() + (delta | 0));
    return qToday(d);
  }

  function qSeed(str){
    let x = 0;
    const s = String(str || '');
    for (let i = 0; i < s.length; i++) x = ((x * 1103515245) + s.charCodeAt(i) + 12345) >>> 0;
    return () => { x = (x * 1664525 + 1013904223) >>> 0; return x / 4294967296; };
  }

  function qPickForDay(day){
    const rnd = qSeed('quests:' + day);
    const pool = Q_POOL.slice();
    const out = [];
    while (out.length < Q_COUNT && pool.length){
      const i = Math.floor(rnd() * pool.length);
      out.push(pool.splice(i, 1)[0]);
    }
    return out.map(src => ({
      id: src.id, ev: src.ev, title: src.title, desc: src.desc, emoji: src.emoji,
      goal: src.goal, reward: src.reward, progress: 0, claimed: false
    }));
  }

  function qFresh(day){
    return {
      ver: Q_VER, day: day, quests: qPickForDay(day), bonusClaimed: false,
      streak: 0, lastAllDay: '', totalClaimed: 0
    };
  }

  function qLoad(raw, now){
    const today = qToday(now);
    const o = raw && typeof raw === 'object' ? raw : null;
    if (!o) return qFresh(today);
    const day = typeof o.day === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(o.day) ? o.day : today;
    let streak = Math.max(0, o.streak | 0);
    const lastAllDay = typeof o.lastAllDay === 'string' ? o.lastAllDay : '';
    const totalClaimed = Math.max(0, o.totalClaimed | 0);
    if (day === today){
      const quests = (Array.isArray(o.quests) ? o.quests : []).map(q => {
        const src = Q_POOL.find(p => p.id === q.id);
        if (!src) return null;
        return {
          id: src.id, ev: src.ev, title: src.title, desc: src.desc, emoji: src.emoji,
          goal: src.goal, reward: src.reward,
          progress: Math.max(0, Math.min(src.goal, q.progress | 0)),
          claimed: !!q.claimed
        };
      }).filter(Boolean);
      if (quests.length !== Q_COUNT) {
        const fresh = qFresh(today);
        fresh.streak = streak; fresh.lastAllDay = lastAllDay; fresh.totalClaimed = totalClaimed;
        return fresh;
      }
      return {ver: Q_VER, day: today, quests, bonusClaimed: !!o.bonusClaimed, streak, lastAllDay, totalClaimed};
    }
    // New local day: keep streak only if yesterday was fully cleared.
    if (lastAllDay !== qDayAdd(today, -1)) streak = 0;
    const next = qFresh(today);
    next.streak = streak;
    next.lastAllDay = lastAllDay;
    next.totalClaimed = totalClaimed;
    return next;
  }

  function qNote(state, ev, n, now){
    state = qLoad(state, now);
    const evs = Array.isArray(ev) ? ev : [ev];
    const add = Math.max(1, n | 0);
    let changed = false;
    for (const q of state.quests){
      if (q.claimed) continue;
      if (evs.indexOf(q.ev) < 0 && evs.indexOf(q.id) < 0) continue;
      const next = Math.min(q.goal, (q.progress | 0) + add);
      if (next !== q.progress){ q.progress = next; changed = true; }
    }
    return {state, changed};
  }

  function qClaim(state, id, now){
    state = qLoad(state, now);
    const q = state.quests.find(x => x.id === id);
    if (!q) return {ok: false, why: 'missing', state, coins: 0};
    if (q.claimed) return {ok: false, why: 'claimed', state, coins: 0};
    if ((q.progress | 0) < q.goal) return {ok: false, why: 'progress', state, coins: 0};
    q.claimed = true;
    q.progress = q.goal;
    state.totalClaimed = (state.totalClaimed | 0) + 1;
    const all = state.quests.every(x => x.claimed);
    if (all){
      const today = state.day;
      if (state.lastAllDay !== today){
        const yest = qDayAdd(today, -1);
        state.streak = (state.lastAllDay === yest) ? (state.streak | 0) + 1 : 1;
        state.lastAllDay = today;
      }
    }
    return {ok: true, why: 'ok', state, coins: q.reward, all, first: state.totalClaimed === 1, streak: state.streak};
  }

  function qClaimBonus(state, now){
    state = qLoad(state, now);
    if (state.bonusClaimed) return {ok: false, why: 'claimed', state, coins: 0};
    if (!state.quests.every(x => x.claimed)) return {ok: false, why: 'incomplete', state, coins: 0};
    state.bonusClaimed = true;
    return {ok: true, why: 'ok', state, coins: Q_BONUS, streak: state.streak};
  }

  function qView(state, now){
    state = qLoad(state, now);
    const done = state.quests.filter(q => q.claimed).length;
    return {
      day: state.day, quests: state.quests.map(q => Object.assign({}, q)),
      bonusClaimed: !!state.bonusClaimed, bonus: Q_BONUS, streak: state.streak | 0,
      totalClaimed: state.totalClaimed | 0, done, all: done === Q_COUNT,
      canBonus: done === Q_COUNT && !state.bonusClaimed
    };
  }

  const api = {
    Q_KEY, Q_VER, Q_COUNT, Q_BONUS, Q_POOL,
    qToday, qDayAdd, qSeed, qPickForDay, qFresh, qLoad, qNote, qClaim, qClaimBonus, qView
  };
  root.QRules = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
