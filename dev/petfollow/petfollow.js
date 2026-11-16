  /* ---------- pet follow ---------- */
  const PF_RULES = (typeof PFRules !== 'undefined' && PFRules) ? PFRules : (typeof window !== 'undefined' && window.PFRules) || {};
  const PF_KEY = PF_RULES.PF_KEY || 'rubloxPetFollow';
  let pf = null;

  function pfLoad(){
    let raw = null;
    try { raw = (typeof load === 'function') ? load(PF_KEY, null) : null; } catch (e){}
    return PF_RULES.pfLoadToggle ? PF_RULES.pfLoadToggle(raw) : {ver:1, hide:false};
  }
  function pfSave(p){
    p = PF_RULES.pfNormalize ? PF_RULES.pfNormalize(p || (pf && pf.set) || pfLoad()) : (p || {hide:false});
    try { if (typeof save === 'function') save(PF_KEY, p); } catch (e){}
    return p;
  }
  function pfSetting(){ return (pf && pf.set) || pfLoad(); }
  function pfSetHide(on){
    const next = pfSave({hide: !!on});
    if (pf) pf.set = next;
    pfSyncUi();
    if (next.hide) pfStop(true);
    else if (typeof mode !== 'undefined') pfEnter(mode);
    return next.hide;
  }
  function pfSyncUi(){
    try {
      const n = document.getElementById('pfSetHide');
      if (n) n.checked = !!(pfSetting().hide);
    } catch (e){}
  }
  function pfReadActive(){
    try {
      const key = PF_RULES.PF_PETS_KEY || 'rubloxPets';
      const raw = (typeof load === 'function') ? load(key, null) : null;
      return PF_RULES.pfActiveFromSave ? PF_RULES.pfActiveFromSave(raw) : null;
    } catch (e){ return null; }
  }
  function pfWant(modeId){
    const d = pfReadActive();
    return !!(PF_RULES.pfShouldFollow && PF_RULES.pfShouldFollow(modeId, pfSetting(), !!d));
  }
  function pfEnter(modeId){
    pf = pf || {set: pfLoad(), pet: null, modeId: null};
    pf.set = pfLoad();
    pf.modeId = modeId || (typeof mode !== 'undefined' ? mode : null);
    if (!pfWant(pf.modeId)){ pfStop(true); return null; }
    const d = pfReadActive();
    if (!d){ pfStop(true); return null; }
    if (pf.pet && pf.pet.k === d.k && pf.pet.c === d.c) return pf.pet;
    pfStop(true);
    try {
      const st = (typeof stageOf === 'function') ? stageOf(+d.xp || 0) : (PF_RULES.pfStage ? PF_RULES.pfStage(d.xp) : 1);
      if (typeof buildPet !== 'function' || typeof scene === 'undefined') return null;
      const m = buildPet(d.k, d.c, st);
      try { if (typeof dress === 'function') dress(m, (typeof accClean === 'function') ? accClean(d.acc) : d.acc); } catch (e){}
      const nm = (typeof petNameClean === 'function' ? petNameClean(d.n) : d.n) || 'Buddy';
      try {
        const tag = (typeof label === 'function') ? label('🐾 ' + nm, 'rgba(255,111,181,.92)', '#fff', 220) : null;
        if (tag){ tag.scale.multiplyScalar(0.5); tag.position.y = (m.top || 1.2) + 0.45; m.g.add(tag); }
      } catch (e){}
      const px = (typeof P !== 'undefined' && P) ? P.x : 0, pz = (typeof P !== 'undefined' && P) ? P.z : 0;
      const face = (typeof P !== 'undefined' && P) ? P.face : 0;
      const x = px - Math.sin(face) * 1.55, z = pz - Math.cos(face) * 1.55;
      m.g.position.set(x, (P && P.y) || 0, z);
      scene.add(m.g);
      pf.pet = {m: m, k: d.k, c: d.c, n: nm, acc: d.acc, xp: d.xp, x: x, y: (P && P.y) || 0, z: z, face: face, sp: 0};
    } catch (e){ pf.pet = null; }
    return pf.pet;
  }
  function pfStop(keep){
    if (pf && pf.pet && pf.pet.m && pf.pet.m.g){
      try { if (typeof scene !== 'undefined' && scene) scene.remove(pf.pet.m.g); } catch (e){}
    }
    if (pf) pf.pet = null;
    if (!keep) pf = null;
  }
  function pfWire(){
    if (!pf || !pf.pet) return 0;
    const q = pf.pet, r = v => Math.round(v * 100) / 100;
    const st = (typeof stageOf === 'function') ? stageOf(+q.xp || 0) : (PF_RULES.pfStage ? PF_RULES.pfStage(q.xp) : 1);
    const acc = (typeof accStr === 'function') ? accStr(q.acc) : '';
    return [q.k, q.c, st, r(q.x), r(q.y), r(q.z), r(q.face), q.sp > 0.6 ? 1 : 0, q.n, r(q.sp), 0, acc];
  }
  function pfShowRemote(modeId, E){
    if (!E || !E.pet) return false;
    if (!modeId || (PF_RULES.PF_SKIP || []).indexOf(modeId) >= 0) return false;
    if (modeId === 'pets' || modeId === 'petisland') return false;
    return E.m === modeId;
  }
  function pfTick(dt, modeId){
    if (modeId && pf) pf.modeId = modeId;
    if (!pfWant(modeId || (pf && pf.modeId))){ if (pf && pf.pet) pfStop(true); return; }
    if (!pf || !pf.pet){ pfEnter(modeId); if (!pf || !pf.pet) return; }
    if (typeof P === 'undefined' || !P || !pf.pet.m) return;
    dt = Math.min(0.08, +dt || 0.016);
    const step = PF_RULES.pfFollowStep ? PF_RULES.pfFollowStep(P.x, P.z, P.face, pf.pet.x, pf.pet.z, dt) : null;
    if (step){
      pf.pet.x = step.x; pf.pet.z = step.z; pf.pet.face = step.face;
      pf.pet.sp = step.moving ? (step.sp || 6) : 0;
    }
    let y = P.y || 0;
    if (y > 3.2) y = pf.pet.y || 0; // stay on the ground while the player rides high
    else pf.pet.y = y;
    try {
      pf.pet.m.g.position.set(pf.pet.x, pf.pet.y, pf.pet.z);
      pf.pet.m.g.rotation.y = pf.pet.face;
      if (typeof animPet === 'function') animPet(pf.pet.m, pf.pet.sp > 0.6 ? 1 : 0, pf.pet.sp, dt, (typeof worldT !== 'undefined' ? worldT : 0));
    } catch (e){}
  }

  try {
    if (typeof window !== 'undefined'){
      window.pfEnter = pfEnter;
      window.pfTick = pfTick;
      window.pfStop = pfStop;
      window.pfSetHide = pfSetHide;
      window.pfSyncUi = pfSyncUi;
      window.pfWire = pfWire;
      window.pfShowRemote = pfShowRemote;
      window.pfState = function(){ return pf ? {hide: !!(pf.set && pf.set.hide), pet: pf.pet && {k: pf.pet.k, n: pf.pet.n, x: pf.pet.x, z: pf.pet.z}, modeId: pf.modeId} : null; };
    }
  } catch (e){}
  /* ---------- end pet follow ---------- */
