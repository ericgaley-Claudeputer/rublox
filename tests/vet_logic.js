const {test, describe} = require('node:test');
const assert = require('node:assert/strict');
const V = require('../dev/vet/vet_logic.js');
const R = require('../dev/reset/reset_logic.js');
const fs = require('fs');
const path = require('path');
const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');

describe('Pawsley Vet Clinic', () => {
  test('first-person is enforced in this mode and cannot be toggled off', () => {
    assert.equal(V.vtForceFirstPerson('vet'), true);
    assert.equal(V.vtForceFirstPerson('obby'), false);
    assert.equal(V.vtMayToggleCamera('vet'), false);
    assert.equal(V.vtMayToggleCamera('obby'), true);
    assert.equal(V.vtFpOn('vet', false), true);
    assert.equal(V.vtFpOn('vet', true), true);
    assert.equal(V.vtFpOn('obby', false), false);
    assert.equal(V.vtSetFp('vet', false), true);
    assert.equal(V.vtSetFp('vet', true), true);
    assert.equal(V.vtSetFp('obby', false), false);
    assert.match(html, /function fpOn\(\)\{[^;]*mode === 'vet'/);
    assert.match(html, /mode === 'vet' && !\(typeof vtDriving === 'function' && vtDriving\(\)\)\)\{ on = true; if \(fp\.on\) return; \}/);
    assert.match(html, /\.vtmode #oFP\{display:none/);
    assert.match(html, /toggle\('vtmode', mode === 'vet'\)/);
    assert.match(html, /clipFpCamera\(\)/);
    assert.match(html, /function buildVet\(/);
    assert.match(html, /else if \(mode === 'vet'\) buildVet\(\);/);
  });

  test('rooms are connected through doorways and every room is reachable from reception', () => {
    const ids = V.VT_ROOMS.map(r => r.id);
    ['reception','exam','xray','treatment','surgery','recovery','bath'].forEach(id => {
      assert.ok(ids.includes(id), 'missing room ' + id);
      assert.ok(V.vtRoom(id));
    });
    assert.equal(V.vtConnected('reception', 'exam'), true);
    assert.equal(V.vtConnected('exam', 'reception'), true);
    assert.equal(V.vtConnected('exam', 'xray'), true);
    assert.equal(V.vtConnected('exam', 'treatment'), true);
    assert.equal(V.vtConnected('exam', 'surgery'), true);
    assert.equal(V.vtConnected('reception', 'recovery'), true);
    assert.equal(V.vtConnected('reception', 'bath'), true);
    assert.equal(V.vtConnected('reception', 'surgery'), false);
    assert.equal(V.vtConnected('xray', 'bath'), false);
    const reach = V.vtReachable('reception');
    ids.forEach(id => assert.equal(reach[id], true, 'unreachable ' + id));
    assert.deepEqual(V.vtPath('reception', 'surgery'), ['reception','exam','surgery']);
    assert.deepEqual(V.vtPath('bath', 'xray'), ['bath','reception','exam','xray']);
    assert.equal(V.vtRoomAt(0, 8), 'reception');
    assert.equal(V.vtRoomAt(0, -10), 'exam');
    assert.equal(V.vtRoomAt(16, -10), 'xray');
    assert.equal(V.vtRoomAt(-16, -10), 'treatment');
    assert.equal(V.vtRoomAt(0, -30), 'surgery');
    assert.equal(V.vtRoomAt(16, 8), 'recovery');
    assert.equal(V.vtRoomAt(-16, 8), 'bath');
    V.VT_DOORS.forEach(d => {
      assert.ok(V.vtInDoorway(d.x, d.z), 'doorway missing at ' + d.a + '-' + d.b);
      assert.equal(V.vtWalkable(d.x, d.z), true);
    });
    assert.equal(V.vtWalkable(0, 8), true);
    assert.equal(V.vtWalkable(40, 40), false);
  });

  test('treatment loop goes arrive, diagnose, treat, recover, happy pickup', () => {
    const started = V.vtNewShift(null, 7);
    const run = started.run;
    let state = started.state;
    assert.ok(run.patient);
    assert.equal(run.phase, 'wait');
    assert.ok(run.patient.symptom);
    assert.equal(V.vtCheckIn(run).ok, true);
    assert.equal(run.phase, 'exam');
    const chart = V.vtChart(run);
    assert.equal(chart.open, true);
    assert.ok(chart.symptom);
    assert.ok(chart.checks.length >= 1);
    const earlyTreat = V.vtTreat(run, run.patient.treat, run.patient.treatRoom);
    assert.equal(earlyTreat.ok, false);
    run.patient.tools.forEach(tool => {
      if (tool === 'xray') return;
      const used = V.vtUseTool(run, tool, 'exam');
      assert.equal(used.ok, true, 'tool ' + tool);
    });
    if (run.patient.xray){
      const startScan = V.vtUseTool(run, 'xray', 'xray');
      assert.equal(startScan.ok, true);
      let found = false;
      for (let cell = 0; cell < 16; cell++){
        const scan = V.vtXrayScan(run, cell);
        assert.equal(scan.ok, true);
        if (scan.found){ found = true; break; }
      }
      assert.equal(found, true);
    }
    assert.equal(V.vtExamReady(run), true);
    assert.equal(run.phase, 'treat');
    const wrong = V.vtTreat(run, run.patient.treat === 'syrup' ? 'bath' : 'syrup', run.patient.treatRoom);
    assert.equal(wrong.ok, false);
    assert.equal(wrong.why, 'wrong');
    assert.match(wrong.message, /still okay|check the chart/i);
    const treat = V.vtTreat(run, run.patient.treat, run.patient.treatRoom);
    assert.equal(treat.ok, true);
    assert.equal(run.phase, 'recover');
    assert.equal(V.vtCuddle(run, 'recovery').ok, true);
    assert.equal(V.vtFeed(run, 'recovery').ok, true);
    assert.equal(run.phase, 'pickup');
    const pay = V.vtPickup(run, state, 'reception');
    assert.equal(pay.ok, true);
    assert.equal(pay.everyoneOk, true);
    assert.ok(pay.coins > 0);
    assert.ok(pay.stars >= 1);
    assert.equal(pay.state.cases, 1);
    assert.equal(run.phase, 'done');
    assert.match(pay.message, /all better|happy pickup/i);
  });

  test('difficulty ramps, many species appear, and copy stays kid-friendly', () => {
    const kinds = new Set();
    const cases = new Set();
    for (let n = 0; n < 16; n++){
      const p = V.vtRollPatient({cases:n}, 100 + n * 17);
      kinds.add(p.species);
      cases.add(p.caseId);
      assert.ok(V.VT_SPECIES.some(s => s.id === p.species));
      assert.ok(V.vtKidCopyOk(p.symptom));
      assert.ok(V.vtKidCopyOk(p.note));
      if (n < 2){
        assert.equal(p.rarity, 'common');
        assert.ok(!p.xray);
        assert.ok(p.tools.length <= 1);
      }
    }
    const late = V.vtRollPatient({cases:12}, 99);
    assert.ok(['rare','star','uncommon','common'].includes(late.rarity));
    assert.ok(kinds.size >= 4, 'expected many species, got ' + [...kinds]);
    assert.ok(cases.size >= 3);
    V.VT_CASES.forEach(cs => {
      assert.ok(V.vtKidCopyOk(cs.symptom + ' ' + cs.note), cs.id);
    });
    const roster = V.vtRealPlayersOnly([{id:'a', name:'Tessa'}, {id:'bot', npc:true}, {id:'b', name:'Rio'}]);
    assert.deepEqual(roster.map(p => p.id), ['a','b']);
  });

  test('rubloxVet is a new save key added to Settings > Reset a game', () => {
    assert.equal(V.VT_KEY, 'rubloxVet');
    const fresh = V.vtLoad(null);
    assert.equal(fresh.cases, 0);
    const keep = V.vtLoad({cases:6, stars:11, coinsEarned:40, extra:'ignore'});
    assert.equal(keep.cases, 6);
    assert.equal(keep.stars, 11);
    assert.equal(keep.coinsEarned, 40);
    const g = R.resetGame('vet');
    assert.ok(g);
    assert.equal(g.name, 'Pawsley Vet Clinic');
    assert.ok(g.keys.includes('rubloxVet'));
    assert.ok(R.resetAllKeys().includes('rubloxVet'));
    assert.equal(R.RESET_KEEP_ON_ALL.includes('rubloxVet'), false);
    assert.ok(html.includes("keys:['rubloxVet']") || html.includes('keys:["rubloxVet"]') || html.includes("keys:['rubloxVet']"));
    assert.match(html, /Pawsley Vet Clinic/);
    assert.match(html, /BUILD = '2026\.11\.22-12'/);
    assert.equal(V.vtKidCopyOk('blood and gore'), false);
  });
});
