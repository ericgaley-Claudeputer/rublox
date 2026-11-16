function evFestOn(){
  try {
    if (typeof EVRules === 'undefined') return false;
    const raw = (typeof load === 'function') ? load(EVRules.EV_KEY, null) : null;
    return !!EVRules.evIsOn('snow', Date.now(), {hash: (typeof location !== 'undefined' && location.hash) || '', state: EVRules.evLoad(raw)});
  } catch (e){ return false; }
}
function evBootChrome(){
  try {
    const on = evFestOn();
    if (document.documentElement) document.documentElement.classList.toggle('snowfest-on', on);
    if (document.body) document.body.classList.toggle('snowfest-on', on);
  } catch (e){}
}
try { evBootChrome(); } catch (e){}
