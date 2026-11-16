/* Cozy Corner Café rules — tickets, recipes, decor. No paid backend. */
(function (root) {
  'use strict';

  const CAFE_KEY = 'rubloxCafe';
  const CAFE_VER = 1;
  const CAFE_MENU = [
    {id:'cocoa',  name:'Warm Cocoa',   emoji:'☕', price:6,  st:'cocoa',  steps:['cocoa']},
    {id:'tea',    name:'Honey Tea',    emoji:'🍵', price:5,  st:'tea',    steps:['tea']},
    {id:'latte',  name:'Sunny Latte',  emoji:'🥛', price:7,  st:'latte',  steps:['latte']},
    {id:'fizz',   name:'Berry Fizz',   emoji:'🍓', price:6,  st:'fizz',   steps:['fizz']},
    {id:'muffin', name:'Cloud Muffin', emoji:'🧁', price:5,  st:'oven',   steps:['oven']},
    {id:'cookie', name:'Choco Cookie', emoji:'🍪', price:4,  st:'oven',   steps:['oven']},
    {id:'tart',   name:'Peach Tart',   emoji:'🥧', price:8,  st:'oven',   steps:['oven']}
  ];
  const CAFE_DECOR = [
    {id:'plant', name:'Leafy Plant', emoji:'🪴', cost:20},
    {id:'lamp',  name:'Warm Lamp',   emoji:'💡', cost:25},
    {id:'rug',   name:'Cozy Rug',    emoji:'🧶', cost:30},
    {id:'art',   name:'Window Art',  emoji:'🖼️', cost:35},
    {id:'piano', name:'Tiny Piano',  emoji:'🎹', cost:50}
  ];

  function cafeFresh(){ return {ver: CAFE_VER, served:0, earned:0, best:0, decor:[], day:'', dayN:0}; }

  function cafeLoad(raw){
    const s = cafeFresh();
    const o = raw && typeof raw === 'object' ? raw : null;
    if (!o) return s;
    s.served = Math.max(0, o.served | 0);
    s.earned = Math.max(0, o.earned | 0);
    s.best = Math.max(0, o.best | 0);
    s.day = typeof o.day === 'string' ? o.day : '';
    s.dayN = Math.max(0, o.dayN | 0);
    if (Array.isArray(o.decor)){
      s.decor = o.decor.filter(id => CAFE_DECOR.some(d => d.id === id)).slice(0, CAFE_DECOR.length);
    }
    return s;
  }

  function cafeItem(id){ return CAFE_MENU.find(m => m.id === id) || null; }

  function cafeTicket(seq, itemId){
    const it = cafeItem(itemId) || CAFE_MENU[(seq >>> 0) % CAFE_MENU.length];
    return {n: (seq | 0) + 1, id: it.id, name: it.name, emoji: it.emoji, price: it.price, st: it.st};
  }

  function cafeMake(ticket, station){
    if (!ticket || !station) return {ok:false, why:'need'};
    const it = cafeItem(ticket.id);
    if (!it) return {ok:false, why:'item'};
    if (it.st !== station) return {ok:false, why:'station'};
    return {ok:true, why:'ok', item: it};
  }

  function cafeServe(state, ticket){
    state = cafeLoad(state);
    const it = ticket && cafeItem(ticket.id);
    if (!it) return {ok:false, why:'item', state, coins:0};
    state.served += 1;
    state.earned += it.price;
    if (state.served > state.best) state.best = state.served;
    return {ok:true, why:'ok', state, coins: it.price, item: it};
  }

  function cafeBuyDecor(state, id, coins){
    state = cafeLoad(state);
    const d = CAFE_DECOR.find(x => x.id === id);
    if (!d) return {ok:false, why:'item', state, coins: coins|0};
    if (state.decor.indexOf(id) >= 0) return {ok:false, why:'have', state, coins: coins|0};
    if ((coins|0) < d.cost) return {ok:false, why:'coins', state, coins: coins|0};
    state.decor = state.decor.concat([id]);
    return {ok:true, why:'ok', state, coins: (coins|0) - d.cost, item: d};
  }

  const api = {
    CAFE_KEY, CAFE_VER, CAFE_MENU, CAFE_DECOR,
    cafeFresh, cafeLoad, cafeItem, cafeTicket, cafeMake, cafeServe, cafeBuyDecor
  };
  root.CafeRules = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
