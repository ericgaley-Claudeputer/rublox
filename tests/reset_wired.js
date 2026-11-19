const {test, describe} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const version = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'version.json'), 'utf8'));

describe('Reset a game is wired into Settings', () => {
  test('BUILD is 2026.11.19-4 and matches version.json', () => {
    assert.ok(html.includes("const BUILD = '2026.11.19-4'"));
    assert.equal(version.build, '2026.11.19-4');
  });

  test('Settings has a Reset a game list, confirm dialog, and Reset ALL', () => {
    assert.ok(html.includes('id="resetSet"'));
    assert.ok(html.includes('Reset a game'));
    assert.ok(html.includes('id="resetList"'));
    assert.ok(html.includes('id="resetAllBtn"'));
    assert.ok(html.includes('id="resetModal"'));
    assert.ok(html.includes('id="resetCancel"'));
    assert.ok(html.includes('id="resetConfirm"'));
    assert.ok(html.includes('id="resetType"'));
    assert.ok(html.includes("This erases its progress and can't be undone"));
    assert.ok(html.includes('ResetRules'));
    assert.ok(html.includes('function resetAllCanApply'));
  });

  test('Esc and Xbox B cancel the dialog by default, and a reset stays local in multiplayer', () => {
    assert.ok(html.includes("resetModal: '#resetCancel'"));
    assert.ok(html.includes("c.root.id === 'resetModal'"));
    assert.ok(html.includes("resetModalIsOpen === 'function' && resetModalIsOpen()"));
    assert.ok(html.includes("no.focus"));
    assert.match(html, /if \(typeof mp !== 'undefined' && mp && mp\.on\)/);
    assert.ok(html.includes('only this device is reset') || html.includes('on this device only'));
    assert.ok(!/mpSend\(\s*\{\s*t:\s*['"]reset/.test(html), 'must not broadcast a reset');
  });
});
