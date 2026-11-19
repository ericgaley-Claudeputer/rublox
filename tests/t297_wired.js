const {test, describe} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const version = JSON.parse(fs.readFileSync(path.join(ROOT, 'version.json'), 'utf8'));

describe('t297 emotes and new modes wiring', () => {
  test('BUILD is 2026.11.19-6 and matches version.json', () => {
    assert.ok(html.includes("const BUILD = '2026.11.19-6'"));
    assert.equal(version.build, '2026.11.19-6');
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
      const wl = html.match(/mode = \[([^\]]+)\]\.includes\(m\) \? m : 'obby'/);
      assert.ok(wl && wl[1].includes("'" + id + "'"), 'whitelist ' + id);
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

  test('pet talent show update is hooked and every species including dogs performs on the pads', () => {
    const loopIdx = html.indexOf('if (evg) snowfestUpdate(dt)');
    const defIdx = html.indexOf('function t297Update');
    assert.ok(loopIdx > 0 && html.slice(loopIdx, loopIdx + 220).includes('t297Update(dt)'));
    assert.ok(defIdx > 0 && loopIdx !== defIdx);
    assert.match(html, /if \(!psg\.busy && psg\.lastMat !== mat\.id\) psStartPractice\(mat\)/);
    assert.match(html, /function psStartPractice/);
    assert.match(html, /function psAttachPet/);
    assert.match(html, /buildPet\(k, c, st\)/);
    assert.match(html, /if \(pf\.holdFollow\) return;/);
    assert.equal(html.includes('psg.petM = body'), false);
    assert.ok(!/kind\s*===\s*['"]dog['"]/.test(html.slice(html.indexOf('function psStartPractice'), html.indexOf('function psStartPractice') + 2500)));
  });

  test('cafe decor and other t297 popups close without trapping pointer lock or auto-reopening', () => {
    assert.match(html, /function t297OverlayClose/);
    assert.match(html, /function t297OverlayTick/);
    assert.match(html, /t297EatOverlayPad/);
    assert.match(html, /t297EatOverlayKey/);
    const esc = html.indexOf("if (typeof t297OverlayOpen === 'function' && t297OverlayOpen()){ t297OverlayClose();");
    const pause = html.indexOf("if (e.code === 'Escape' || e.code === 'KeyP'){ if (!won && !over && !choosing) setPause");
    assert.ok(esc > 0 && pause > esc, 'Escape must close the popup before it pauses the game');
    assert.match(html, /exitPointerLock/);
    assert.match(html, /\.t297overlay/);
    assert.match(html, /if \(typeof t297OverlayOpen === 'function' && t297OverlayOpen\(\)\) return;/);
    assert.match(html, /ev\.target === el\)/);
    assert.match(html, /t297UiWalkAway/);
    assert.match(html, /t297UiMayOpen/);
  });

  test('emote hotkeys in the page are unique and labels are not shared', () => {
    const E = require('../dev/t297/emote_logic.js');
    const uniq = E.emoKeyUnique();
    assert.equal(uniq.ok, true);
    assert.equal(E.emoByCode('Digit0'), 'groan');
    assert.equal(E.emoByCode('Digit9'), 'flip');
    assert.equal(E.emoKeyLabel(E.emoMerge().facepalm), '');
    assert.match(html, /flip:\s*\{key:9/);
    assert.match(html, /groan:\s*\{key:0/);
    assert.match(html, /facepalm:\s*\{key:null/);
    assert.ok(!html.includes("flip:  {key:0"));
    const shop = html.slice(html.indexOf('const EMO_SHOP'), html.indexOf('const EMO_SHOP') + 700);
    const keys = [...shop.matchAll(/key:\s*([^,}\s]+)/g)].map(m => m[1]);
    const assigned = keys.filter(k => k !== 'null');
    assert.equal(new Set(assigned).size, assigned.length);
  });

  test('fishing can go on ice during the Snow Festival', () => {
    assert.match(html, /evFestOn/);
    assert.match(html, /fishg\.ice/);
    assert.match(html, /Frost Minnow|ice:true/);
  });
});
