const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const HTML = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const RULES = require(path.join(ROOT, 'dev/weather/weather_rules.js'));

test('weather setting defaults to Auto and stays compatible', () => {
  const d = RULES.wxLoadState(null);
  assert.equal(d.mode, 'auto');
  assert.equal(RULES.WX_KEY, 'rubloxWeather');
  const kept = RULES.wxLoadState({ver:1, mode:'day'});
  assert.equal(kept.mode, 'day');
  assert.equal(RULES.wxNormalize({mode:'nope'}).mode, 'auto');
  assert.equal(RULES.wxNormalize({mode:'off'}).mode, 'off');
});

test('day/night clock and always-day lock', () => {
  const dawn = RULES.wxClock(0, 100);
  assert.equal(dawn.phase, 'dawn');
  const day = RULES.wxClock(30, 100);
  assert.equal(day.phase, 'day');
  assert.equal(day.sun, 1);
  const dusk = RULES.wxClock(60, 100);
  assert.equal(dusk.phase, 'dusk');
  const night = RULES.wxClock(80, 100);
  assert.equal(night.phase, 'night');
  assert.ok(night.sun < 0.5);
  const forced = RULES.wxForceDay();
  assert.equal(forced.phase, 'day');
  assert.equal(forced.sun, 1);
});

test('weather is skipped in splash and race, and fits other modes', () => {
  const auto = {mode:'auto'};
  assert.equal(RULES.wxEnabled('lantern', auto), true);
  assert.equal(RULES.wxEnabled('obby', auto), true);
  assert.equal(RULES.wxEnabled('build', auto), true);
  assert.equal(RULES.wxEnabled('splash', auto), false);
  assert.equal(RULES.wxEnabled('waterpark', auto), false);
  assert.equal(RULES.wxEnabled('race', auto), false);
  assert.equal(RULES.wxEnabled('lantern', {mode:'off'}), false);
  assert.equal(RULES.wxWeatherAllowed('rain', 'lantern'), true);
  assert.equal(RULES.wxWeatherAllowed('snow', 'lantern'), false);
  assert.equal(RULES.wxWeatherAllowed('fog', 'lantern'), true);
  assert.equal(RULES.wxWeatherAllowed('snow', 'obby'), true);
  assert.equal(RULES.wxPickWeather('lantern', () => 0), 'clear');
});

test('sky, fog, light scale, and low-quality particle counts', () => {
  const day = RULES.wxSky('obby', 'day', 'clear');
  const night = RULES.wxSky('lantern', 'night', 'clear');
  assert.notEqual(day, night);
  const fog = RULES.wxFog('lantern', 'night', 'fog');
  assert.ok(fog.far < 80);
  assert.ok(RULES.wxLightScale('night', 'clear') < RULES.wxLightScale('day', 'clear'));
  const hi = RULES.wxParticleCount('high', 'rain', false);
  const lo = RULES.wxParticleCount('low', 'rain', true);
  assert.ok(hi > lo);
  assert.ok(lo > 0 && lo <= 50);
  assert.equal(RULES.wxParticleCount('high', 'clear', false), 0);
  assert.equal(RULES.wxParticleCount('high', 'fog', false), 0);
});

test('weather UI and engine hooks are injected', () => {
  assert.match(HTML, /id="wxSetAuto"/);
  assert.match(HTML, /id="wxSetDay"/);
  assert.match(HTML, /id="wxSetOff"/);
  assert.match(HTML, /Weather and time/);
  assert.match(HTML, /function wxTick/);
  assert.match(HTML, /function wxEnter/);
  assert.match(HTML, /wxTick\(frameDt, mode/);
  assert.match(HTML, /wxEnter\(mode\)/);
  assert.match(HTML, /wxStop\(\)/);
  assert.match(HTML, /rubloxWeather/);
  assert.doesNotMatch(HTML, /Digital Circus|Caine|Pomni|Kaufmo/);
});
