/* ---------- rublox gore ---------- */
const GORE_RULES = (typeof GoreRules !== 'undefined' && GoreRules) ? GoreRules : (typeof window !== 'undefined' && window.GoreRules) || {};
const GORE_KEY = GORE_RULES.GORE_KEY || 'rubloxGore';
let goreSet = null;

function goreLoad(){
  let raw = null;
  try { raw = (typeof load === 'function') ? load(GORE_KEY, null) : (typeof localStorage !== 'undefined' ? JSON.parse(localStorage.getItem(GORE_KEY) || 'null') : null); } catch (e){}
  return GORE_RULES.goreLoadState ? GORE_RULES.goreLoadState(raw) : (raw || 'off');
}
function goreSave(level){
  const id = GORE_RULES.goreNormalize ? GORE_RULES.goreNormalize(level) : (level || 'off');
  goreSet = id;
  try {
    if (typeof save === 'function') save(GORE_KEY, id);
    else if (typeof localStorage !== 'undefined') localStorage.setItem(GORE_KEY, JSON.stringify(id));
  } catch (e){}
}
function goreSetting(){ return goreSet != null ? goreSet : goreLoad(); }
function goreSetLevel(level){
  const id = GORE_RULES.goreNormalize ? GORE_RULES.goreNormalize(level) : (level || 'off');
  goreSave(id);
  goreSyncUi();
  try { if (typeof campRebuildGore === 'function') campRebuildGore(); } catch (e){}
  return id;
}
function goreSyncUi(){
  try {
    const st = goreSetting();
    ['off','mild','spooky'].forEach(m => {
      const n = document.getElementById('goreSet' + m.charAt(0).toUpperCase() + m.slice(1));
      if (n) n.checked = st === m;
    });
    const note = document.getElementById('goreSetNote');
    if (note) note.textContent = 'Used in Campfire Grove only. Cartoon marks, no wounds or body parts. When \u263A Less scary is on there, Gore stays at Mild.'.replace('\u263A', '😌');
  } catch (e){}
}
try {
  if (typeof window !== 'undefined'){
    window.goreSetting = goreSetting;
    window.goreSetLevel = goreSetLevel;
    window.goreSyncUi = goreSyncUi;
    window.goreLoad = goreLoad;
  }
} catch (e){}
/* ---------- end rublox gore ---------- */
