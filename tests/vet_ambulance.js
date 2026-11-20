const {test, describe} = require('node:test');
const assert = require('node:assert/strict');
const V = require('../dev/vet/vet_logic.js');

describe('Pawsley ambulance trips', () => {
  test('optional save fields stay zero on old saves and clinic still forces first person', () => {
    const fresh = V.vtFresh();
    assert.equal(fresh.rescues, 0);
    assert.equal(fresh.ambulanceTrips, 0);
    const loaded = V.vtLoad({cases:3, stars:2});
    assert.equal(loaded.cases, 3);
    assert.equal(loaded.rescues, 0);
    assert.equal(V.vtForceFirstPerson('vet'), true);
    assert.equal(V.vtForceFirstPerson('vet', false), true);
    assert.equal(V.vtForceFirstPerson('vet', true), false);
    assert.equal(V.vtMayToggleCamera('vet', true), true);
    assert.equal(V.vtFpOn('vet', false, true), false);
    assert.equal(V.vtFpOn('vet', false), true);
    assert.equal(V.vtSetFp('vet', false, true), false);
    assert.equal(V.vtClinicFirstPerson({drive:{on:true}}), false);
    assert.equal(V.vtClinicFirstPerson({drive:{on:false}}), true);
  });

  test('town stays walkable without opening the old out-of-bounds tile, and the bay connects to reception', () => {
    assert.equal(V.vtWalkable(40, 40), false);
    assert.equal(V.vtWalkable(0, 22), true);
    assert.equal(V.vtRoomAt(0, 22), 'bay');
    assert.equal(V.vtWalkable(0, 50), true);
    assert.equal(V.vtAreaAt(0, 50), 'town');
    assert.equal(V.vtConnected('reception', 'bay'), true);
    assert.ok(V.vtReachable('reception').bay);
    assert.ok(V.VT_RESCUES.length >= 6);
    V.VT_RESCUES.forEach(r => {
      assert.equal(V.vtInTown(r.x, r.z), true, r.id + ' should sit in town');
      assert.ok(V.vtKidCopyOk(r.symptom));
      assert.ok(V.vtKidCopyOk(r.note));
    });
  });

  test('driving, rescuing a pal, and admitting them starts the existing treatment loop', () => {
    const started = V.vtNewShift(null, 3);
    const run = started.run;
    let state = started.state;
    // Clear the waiting desk pal so a rescue can check in
    run.phase = 'done';
    run.patient = null;
    const far = V.vtMountAmbulance(run, 20, 20);
    assert.equal(far.ok, false);
    const mount = V.vtMountAmbulance(run, 0, 22);
    assert.equal(mount.ok, true);
    assert.equal(run.drive.on, true);
    V.vtDriveSteer(run, 0, 1);
    for (let i = 0; i < 40; i++) V.vtDriveTick(run, 0.1);
    // teleport to the tree rescue for a reliable pickup
    const tree = V.vtRescue('tree');
    run.drive.x = tree.x; run.drive.z = tree.z;
    const grab = V.vtRescuePet(run);
    assert.equal(grab.ok, true);
    assert.equal(run.drive.cargo.id, 'tree');
    const hopTown = V.vtDismountAmbulance(run);
    assert.equal(hopTown.ok, false);
    run.drive.x = 0; run.drive.z = 22.5;
    const hop = V.vtDismountAmbulance(run);
    assert.equal(hop.ok, true);
    const admit = V.vtAdmitRescue(run, state);
    assert.equal(admit.ok, true);
    state = admit.state;
    assert.equal(state.rescues, 1);
    assert.equal(state.ambulanceTrips, 1);
    assert.equal(run.phase, 'wait');
    assert.equal(run.patient.name, 'Maple');
    assert.equal(run.patient.treat, 'sip');
    assert.equal(V.vtCheckIn(run).ok, true);
    assert.equal(run.phase, 'exam');
    run.patient.tools.forEach(tool => {
      if (tool === 'xray') return;
      assert.equal(V.vtUseTool(run, tool, 'exam').ok, true);
    });
    assert.equal(V.vtExamReady(run), true);
    assert.equal(V.vtTreat(run, 'sip', 'treatment').ok, true);
  });
});
