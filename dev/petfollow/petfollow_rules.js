/* Equipped Adopt-a-Pet follower across Rublox modes. Optional hide toggle. */
(function (root) {
  const PF_KEY = 'rubloxPetFollow';
  const PF_PETS_KEY = 'rubloxPets';
  const PF_VER = 1;
  const PF_SKIP = ['race', 'splash', 'waterpark', 'pets', 'petisland'];
  const PF_DIST = 1.55;
  const PF_CATCH = 12;

  function pfDefault(){ return {ver: PF_VER, hide: false}; }

  function pfNormalize(raw){
    const o = (raw && typeof raw === 'object') ? raw : {};
    return {ver: PF_VER, hide: !!o.hide};
  }

  function pfLoadToggle(raw){
    if (typeof raw === 'string'){
      try { raw = JSON.parse(raw); } catch (e){ raw = null; }
    }
    return pfNormalize(raw);
  }

  function pfActiveFromSave(raw){
    if (typeof raw === 'string'){
      try { raw = JSON.parse(raw); } catch (e){ raw = null; }
    }
    if (!raw || typeof raw !== 'object' || !Array.isArray(raw.pets) || !raw.pets.length) return null;
    const a = Math.max(0, Math.min(raw.pets.length - 1, raw.a | 0));
    const p = raw.pets[a];
    if (!p || !p.k) return null;
    return {
      k: String(p.k),
      c: Math.max(0, Math.min(2, p.c | 0)),
      n: String(p.n || 'Buddy').slice(0, 16),
      xp: Math.max(0, +p.xp || 0),
      acc: (p.acc && typeof p.acc === 'object') ? p.acc : {},
      a: a
    };
  }

  function pfStage(xp){
    const x = Math.max(0, +xp || 0);
    if (x >= 400) return 3;
    if (x >= 120) return 2;
    if (x >= 30) return 1;
    return 0;
  }

  function pfShouldFollow(modeId, setting, hasPet){
    if (!hasPet) return false;
    if (pfNormalize(setting).hide) return false;
    if (!modeId || PF_SKIP.indexOf(modeId) >= 0) return false;
    return true;
  }

  function pfFollowStep(px, pz, face, x, z, dt){
    const behind = PF_DIST;
    const tx = px - Math.sin(face || 0) * behind;
    const tz = pz - Math.cos(face || 0) * behind;
    const dx = tx - x, dz = tz - z;
    const dist = Math.sqrt(dx * dx + dz * dz);
    if (dist > PF_CATCH) return {x: tx, z: tz, face: face || 0, moving: false, tele: true};
    if (dist < 0.35) return {x: x, z: z, face: face || 0, moving: false, tele: false};
    const sp = Math.min(10, 3.5 + dist * 2.2);
    const nx = x + dx / dist * sp * dt;
    const nz = z + dz / dist * sp * dt;
    return {x: nx, z: nz, face: Math.atan2(dx, dz), moving: true, tele: false, sp: sp};
  }

  const api = {
    PF_KEY, PF_PETS_KEY, PF_VER, PF_SKIP, PF_DIST, PF_CATCH,
    pfDefault, pfNormalize, pfLoadToggle, pfActiveFromSave, pfStage, pfShouldFollow, pfFollowStep
  };
  root.PFRules = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
