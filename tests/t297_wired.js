const {test, describe} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const version = JSON.parse(fs.readFileSync(path.join(ROOT, 'version.json'), 'utf8'));

describe('t297 emotes and new modes wiring', () => {
  test('BUILD is 2026.11.16-21 and matches version.json', () => {
    assert.ok(html.includes("const BUILD = '2026.11.16-21'"));
    assert.equal(version.build, '2026.11.16-21');
  });

  test('free emotes work anywhere and the wheel uses View, not A/X/LB/RB', () => {
    assert.match(html, /id === 'clap'/);
    assert.match(html, /id === 'laugh'/);
    assert.match(html, /id === 'sleep'/);
    assert.match(html, /EmoRules\.emoAllowed/);
    assert.match(html, /jp\[8\]/);
    assert.ok(!html.includes("if (jp[2]){ buildEmoteMenu()"));
    assert.match(html, /View \/ Back/);
  });

  test('cafe, fishing, pet show, and treasure trail are playable modes', () => {
    for (const id of ['cafe', 'fish', 'petshow', 'hunt']){
      assert.ok(html.includes("id:'" + id + "'"), id + ' card');
      assert.ok(html.includes("'" + id + "'") && html.includes("'hunt'].includes(m)"), 'whitelist ' + id);
    }
    assert.match(html, /function buildCafe\(/);
    assert.match(html, /function buildFish\(/);
    assert.match(html, /function buildPetShow\(/);
    assert.match(html, /function buildHunt\(/);
    assert.match(html, /const CAFE_KEY = 'rubloxCafe'/);
    assert.match(html, /const FISH_KEY = 'rubloxFish'/);
    assert.match(html, /const PS_KEY = 'rubloxPetShow'/);
    assert.match(html, /const HUNT_KEY = 'rubloxHunt'/);
  });

  test('pet show votes and cafe tickets have no free-text fields', () => {
    assert.match(html, /data-psvote/);
    assert.match(html, /psCleanVote/);
    assert.ok(html.includes("mpSend({t:'ps', a:'vote', n:v})"));
    assert.match(html, /cafeTicket/);
    const vote = html.slice(html.indexOf('id="psVoteBox"'), html.indexOf('id="psVoteBox"') + 1200);
    const board = html.slice(html.indexOf('id="cafeBoard"'), html.indexOf('id="cafeBoard"') + 800);
    assert.ok(!/contenteditable|textarea|<input[^>]*type=["']?text/i.test(vote + board));
  });

  test('fishing can go on ice during the Snow Festival', () => {
    assert.match(html, /evFestOn/);
    assert.match(html, /fishg\.ice/);
    assert.match(html, /Frost Minnow|ice:true/);
  });
});
