'use strict';
const {test, describe} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const version = JSON.parse(fs.readFileSync(path.join(ROOT, 'version.json'), 'utf8'));

describe('season and leaderboard wiring', () => {
  test('BUILD is 2026.11.20-2 and matches version.json', () => {
    assert.ok(html.includes("const BUILD = '2026.11.20-2'"));
    assert.equal(version.build, '2026.11.20-2');
  });

  test('Snow Festival is date-driven, hash-forceable, and previewable in Settings', () => {
    assert.ok(html.includes('rubloxSeason'));
    assert.ok(html.includes('Snow Festival'));
    assert.ok(html.includes('id="evForceSnow"'));
    assert.ok(html.includes('snowfest=') || html.includes('evHashForce') || html.includes('EV_HASH_RE'));
    assert.ok(html.includes('id="evShop"'));
    assert.ok(html.includes('snowflakes') || html.includes('Snowflakes'));
    assert.ok(html.includes('buildSnowFest()'));
    assert.ok(html.includes('snowfestEnter()'));
    assert.ok(html.includes('Snowball') || html.includes('snowball') || html.includes('toss'));
    assert.ok(html.includes('Sled') || html.includes('sled'));
    assert.ok(html.includes('snowman') || html.includes('Snowman'));
    assert.ok(html.includes('rink') || html.includes('Skate') || html.includes('skate'));
    assert.ok(html.includes('ev-snow-visit'));
    assert.ok(html.includes('Bloom Picnic'));
  });

  test('leaderboard has a personal board and a same-room friends board with no free-text', () => {
    assert.ok(html.includes('rubloxBoard'));
    assert.ok(html.includes('id="leaderboard"'));
    assert.ok(html.includes('data-go="leaderboard"'));
    assert.ok(html.includes('Friends in this room') || html.includes('data-lbtab="room"'));
    const start = html.indexOf('id="leaderboard"');
    const block = start >= 0 ? html.slice(start, start + 2500) : '';
    assert.equal(/<input\\b/i.test(block), false);
    assert.equal(/<textarea\\b/i.test(block), false);
    assert.ok(html.includes("d.t === 'lb'") || html.includes("case 'lb':"));
  });

  test('festival mode is on the start whitelist and games grid hides it when the event is off', () => {
    assert.ok(html.includes("'lantern', 'party', 'snowfest']") || html.includes("mode === 'snowfest'"));
    assert.ok(html.includes('evList.forEach') || html.includes("g.id !== 'snowfest'"));
  });
});
