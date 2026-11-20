/* Shared doorway clearance: collision uses the body only. Hats, hair, wings, and horns are visual and do not change collider size. */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.DoorRules = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  const DOOR_BODY_H = 2.8;
  const DOOR_BODY_R = 0.45;
  const DOOR_EYE_H = 2.45;
  const DOOR_CAM_CLEAR = 0.55;
  const DOOR_MIN_H = DOOR_BODY_H * 1.4;
  const DOOR_MIN_W = (DOOR_BODY_R * 2) * 2.5;
  const DOOR_CLEAR_H = 4.2;
  const DOOR_CLEAR_W = 3.6;

  function doorMaxPlayer(){
    return {h: DOOR_BODY_H, r: DOOR_BODY_R, eye: DOOR_EYE_H, cosmetics: false};
  }

  function doorFits(openH, openW){
    return (openH >= DOOR_MIN_H - 1e-9) && (openW >= DOOR_MIN_W - 1e-9);
  }

  function doorCameraClears(lintelBottom, eye, clear){
    const ey = eye == null ? DOOR_EYE_H : +eye;
    const cl = clear == null ? DOOR_CAM_CLEAR : +clear;
    return (lintelBottom >= ey + cl - 1e-9);
  }

  function doorBlockedAt(px, py, pz, player, door){
    if (!door || !player) return 'no';
    const r = +player.r || DOOR_BODY_R;
    const h = +player.h || DOOR_BODY_H;
    const top = py + h;
    const thick = door.thick == null ? 0.45 : +door.thick;
    const hw = (door.w || 0) / 2;
    const axis = door.axis === 'x' ? 'x' : 'z';
    const cx = +door.x || 0, cz = +door.z || 0;
    const openH = +door.h || 0;
    if (axis === 'z'){
      const overlapWall = Math.abs(pz - cz) <= thick / 2 + r;
      if (!overlapWall) return null;
      const inOpening = (px + r > cx - hw) && (px - r < cx + hw);
      if (!inOpening) return 'jamb';
      if (top > openH + 1e-9) return 'lintel';
      return null;
    }
    const overlapWall = Math.abs(px - cx) <= thick / 2 + r;
    if (!overlapWall) return null;
    const inOpening = (pz + r > cz - hw) && (pz - r < cz + hw);
    if (!inOpening) return 'jamb';
    if (top > openH + 1e-9) return 'lintel';
    return null;
  }

  function doorWalk(door, player, dist){
    player = player || doorMaxPlayer();
    const span = dist == null ? 2.4 : +dist;
    const axis = door && door.axis === 'x' ? 'x' : 'z';
    const steps = 28;
    const start = axis === 'z'
      ? {x: door.x, z: door.z - span}
      : {x: door.x - span, z: door.z};
    const end = axis === 'z'
      ? {x: door.x, z: door.z + span}
      : {x: door.x + span, z: door.z};
    const floor = door.floor == null ? 0 : +door.floor;
    for (let i = 0; i <= steps; i++){
      const t = i / steps;
      const px = start.x + (end.x - start.x) * t;
      const pz = start.z + (end.z - start.z) * t;
      const hit = doorBlockedAt(px, floor, pz, player, door);
      if (hit) return {ok:false, hit, t, x:px, z:pz, door: door.id || door.a + '-' + door.b};
    }
    const tall = doorFits(door.h, door.w);
    const cam = doorCameraClears(door.h, player.eye);
    if (!tall) return {ok:false, hit:'small', door: door.id || (door.a + '-' + door.b)};
    if (!cam) return {ok:false, hit:'camera', door: door.id || (door.a + '-' + door.b)};
    return {ok:true, door: door.id || (door.a + '-' + door.b)};
  }

  function doorWalkAll(doors, player){
    const out = [];
    (doors || []).forEach(d => out.push(doorWalk(d, player)));
    return {ok: out.every(r => r.ok), results: out};
  }

  return {
    DOOR_BODY_H, DOOR_BODY_R, DOOR_EYE_H, DOOR_CAM_CLEAR,
    DOOR_MIN_H, DOOR_MIN_W, DOOR_CLEAR_H, DOOR_CLEAR_W,
    doorMaxPlayer, doorFits, doorCameraClears, doorBlockedAt, doorWalk, doorWalkAll
  };
});
