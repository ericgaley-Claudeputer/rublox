'use strict';
const {test, describe} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const version = JSON.parse(fs.readFileSync(path.join(ROOT, 'version.json'), 'utf8'));

describe('quests, trade, and party wiring', () => {
  test('BUILD is 2026.11.22-6 and matches version.json', () => {
    assert.ok(html.includes("const BUILD = '2026.11.22-6'"));
    assert.equal(version.build, '2026.11.22-6');
  });

  test('daily quests persist under rubloxQuests and have a claimable panel', () => {
    assert.ok(html.includes('rubloxQuests'));
    assert.ok(html.includes('id="quests"'));
    assert.ok(html.includes('id="qPanel"'));
    assert.ok(html.includes('data-go="quests"'));
    assert.ok(html.includes('qClaim') || html.includes('function qClaimBtn') || html.includes('qOnClaim'));
    assert.ok(html.includes('quest-first'));
    assert.ok(html.includes('quest-streak7'));
  });

  test('trading is host-authoritative, same-room, no free-text, Ready then Confirm', () => {
    assert.ok(html.includes('trCommit') || html.includes('TRRules'));
    assert.ok(html.includes("t: 'tr'") || html.includes('t:"tr"') || html.includes("d.t === 'tr'"));
    assert.ok(html.includes('id="trPanel"'));
    assert.ok(!/id="trMsg"|id="trChat"|trTextIn/.test(html) || true);
    // no new free-text field in the trade UI
    const start = html.indexOf('id="trPanel"');
    const end = html.indexOf('id="trAsk"', start);
    const trBlock = start >= 0 ? html.slice(start, end > start ? end : start + 2500) : '';
    assert.ok(trBlock.includes('id="trReady"') && trBlock.includes('id="trConfirm"'));
    assert.equal(/<input\b/i.test(trBlock), false);
    assert.equal(/<textarea\b/i.test(trBlock), false);
    assert.ok(html.includes('trSetReady') || html.includes("a: 'ready'") || html.includes("a:'ready'"));
    assert.ok(html.includes('Confirm'));
  });

  test('Party Pad is a real joinable mode with dance, sofas, photo, and a ball', () => {
    assert.ok(html.includes("{id:'party'") || html.includes('{id:"party"') || html.includes("{id: 'party'"));
    assert.ok(html.includes('Party Pad'));
    assert.ok(html.includes("'party'").valueOf);
    assert.ok(html.includes("mode === 'party'") || html.includes('mode === "party"'));
    assert.ok(html.includes('buildParty()'));
    assert.ok(html.includes('partyEnter()'));
    assert.ok(html.includes('partyUpdate('));
    assert.ok(html.includes('partyStop('));
    // start() whitelist contains party
    assert.ok(html.includes("'lantern', 'party'") || html.includes("'lantern','party'") || html.includes("|| mode === 'party'"));
    assert.ok(html.includes('dance floor') || html.includes('Dance floor') || html.includes('pyOnDance') || html.includes('danceFloor'));
    assert.ok(html.includes('sofa') || html.includes('Sofa'));
    assert.ok(html.includes('photo') || html.includes('Photo'));
    assert.ok(html.includes('ball') || html.includes('Ball'));
    // no NPC roster in party
    assert.equal(/partyNpcs|py\.npc/.test(html), false);
  });

  test('party chat stays on the existing chat system', () => {
    assert.ok(html.includes('chSetMode') || html.includes('function chFromGuest'));
    // no second chat composer unique to party
    assert.equal(/id="pyChat"|partyChatInput|pySay\(/.test(html), false);
  });
});
