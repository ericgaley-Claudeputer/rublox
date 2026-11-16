/* Core emote rules: free set works anywhere; shop extras stay optional. */
(function (root) {
  'use strict';

  const EMO_FREE = ['wave', 'dance', 'sit', 'cheer', 'clap', 'laugh', 'sleep'];
  const EMO_CORE = {
    wave:  {key:1, emoji:'👋', name:'Wave',  price:0, dur:2.6},
    dance: {key:2, emoji:'💃', name:'Dance', price:0, dur:Infinity},
    sit:   {key:3, emoji:'🪑', name:'Sit',   price:0, dur:Infinity},
    cheer: {key:4, emoji:'🙌', name:'Cheer', price:0, dur:2.6},
    clap:  {key:5, emoji:'👏', name:'Clap',  price:0, dur:2.4},
    laugh: {key:6, emoji:'😄', name:'Laugh', price:0, dur:2.6},
    sleep: {key:7, emoji:'😴', name:'Sleep', price:0, dur:Infinity}
  };
  const EMO_SHOP = {
    flip:  {key:0, emoji:'🍳', name:'Burger Flip',   price:150, dur:2.2},
    groan: {key:0, emoji:'😩', name:'Awkward Groan', price:100, dur:2.8},
    facepalm: {key:0, emoji:'🤦', name:'Big Facepalm', price:100, dur:2.4},
    skate: {key:8, emoji:'🛹', name:'Skate Trick',  price:150, dur:2.4}
  };

  function emoMerge(base){
    const out = Object.assign({}, base || {}, EMO_SHOP, EMO_CORE);
    return out;
  }

  function emoAllowed(id, owned){
    const e = EMO_CORE[id] || EMO_SHOP[id];
    if (!e) return false;
    if (e.price === 0 || EMO_FREE.indexOf(id) >= 0) return true;
    if (!owned) return false;
    if (owned.has) return owned.has('emote-' + id) || owned.has(id);
    if (Array.isArray(owned)) return owned.indexOf('emote-' + id) >= 0 || owned.indexOf(id) >= 0;
    return !!owned['emote-' + id] || !!owned[id];
  }

  function emoList(owned){
    return Object.keys(emoMerge()).filter(id => emoAllowed(id, owned));
  }

  function emoLooping(id){
    const e = EMO_CORE[id] || EMO_SHOP[id];
    return !!(e && e.dur === Infinity);
  }

  function emoCancelOnMove(id){
    return id === 'sit' || id === 'sleep' || id === 'dance';
  }

  // View / Back (standard button 8) toggles the wheel; D-pad navigates when open.
  const EMO_PAD_VIEW = 8, EMO_PAD_A = 0, EMO_PAD_B = 1, EMO_PAD_LEFT = 14, EMO_PAD_RIGHT = 15, EMO_PAD_UP = 12, EMO_PAD_DOWN = 13;

  const api = {
    EMO_FREE, EMO_CORE, EMO_SHOP,
    EMO_PAD_VIEW, EMO_PAD_A, EMO_PAD_B, EMO_PAD_LEFT, EMO_PAD_RIGHT, EMO_PAD_UP, EMO_PAD_DOWN,
    emoMerge, emoAllowed, emoList, emoLooping, emoCancelOnMove
  };
  root.EmoRules = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
